/**
 * GitHub Actions AAB для Kotlin-проекта (порт `setupGithubAab` из RN-автосетапа):
 * workflow `.github/workflows/android-aab.yml` + secrets через `gh secret set`
 * (KEYSTORE_BASE64 / KEYSTORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD /
 * GOOGLE_SERVICES_JSON_BASE64). Секреты локально лежат в keystore.properties.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const jira = require("./jira");
const gitSync = require("./gitSync");

const WORKFLOW_REL = path.join(".github", "workflows", "android-aab.yml");

function mask(text, token) {
  const value = String(text || "");
  if (!token) return value;
  return value.split(token).join("***");
}

function readProps(file) {
  const map = {};
  if (!fs.existsSync(file)) return map;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return map;
}

function run(cmd, args, { cwd, token, input } = {}) {
  const result = spawnSync(cmd, args, {
    cwd,
    input,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
    env: {
      ...process.env,
      ...(token ? { GH_TOKEN: token, GITHUB_TOKEN: token } : {}),
      GIT_TERMINAL_PROMPT: "0",
    },
  });
  const output = mask(`${result.stdout || ""}\n${result.stderr || ""}`, token).trim();
  return { code: result.error ? -1 : result.status ?? -1, output, error: result.error };
}

function hasGh() {
  const result = run("gh", ["--version"]);
  return result.code === 0;
}

/** Есть ли workflow в удалённом дефолтном репозитории (иначе dispatch вернёт 404). */
async function remoteWorkflowExists(token, fullName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/contents/${WORKFLOW_REL.replace(/\\/g, "/")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "kotlin-autosetup",
        },
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Запрос к GitHub API с JSON-телом (для Contents API). */
async function githubRequest(token, method, apiPath, body) {
  const res = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "kotlin-autosetup",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

/**
 * Кладёт в default-ветку (main) ТОЛЬКО файл workflow: в main держим оригинальный код,
 * а код сборок живёт в ветках v1/v2. Поэтому коммит идёт через Contents API, без `git add -A`.
 */
async function pushWorkflowToDefaultBranch(token, owner, repo, yaml) {
  const fullName = `${owner}/${repo}`;
  const pathInRepo = WORKFLOW_REL.replace(/\\/g, "/");
  const repoInfo = await githubRequest(token, "GET", `/repos/${fullName}`);
  const branch = repoInfo.json?.default_branch || "main";
  const existing = await githubRequest(
    token,
    "GET",
    `/repos/${fullName}/contents/${pathInRepo}?ref=${branch}`,
  );
  if (existing.ok && existing.json?.content) {
    const text = Buffer.from(existing.json.content, "base64").toString("utf8");
    if (text === yaml) return { ok: true, branch, changed: false };
  }
  const put = await githubRequest(token, "PUT", `/repos/${fullName}/contents/${pathInRepo}`, {
    message: "ci: android-aab workflow",
    content: Buffer.from(yaml, "utf8").toString("base64"),
    branch,
    ...(existing.ok && existing.json?.sha ? { sha: existing.json.sha } : {}),
  });
  if (!put.ok) {
    return {
      ok: false,
      branch,
      changed: false,
      error: `${put.status}: ${put.json?.message || "не удалось обновить файл"}`,
    };
  }
  return { ok: true, branch, changed: true };
}

function workflowYaml() {
  return `name: Android AAB

on:
  workflow_dispatch:

concurrency:
  group: android-aab-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-aab:
    name: Build release AAB
    runs-on: ubuntu-latest
    timeout-minutes: 60

    env:
      GRADLE_OPTS: "-Xmx6g -XX:MaxMetaspaceSize=1g -Dorg.gradle.daemon=false"

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"

      # Пакет "tools" удалён из SDK-репозитория: набор по умолчанию у action'а падает,
      # поэтому ставим только platform-tools, а платформу/build-tools — явно.
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          packages: platform-tools

      - name: Install Android SDK packages
        run: |
          sdkmanager --install \\
            "platform-tools" \\
            "platforms;android-36" \\
            "build-tools;36.0.0"
          yes | sdkmanager --licenses >/dev/null || true

      # gradle.properties committed with a Windows-only org.gradle.java.home.
      - name: Drop local JAVA_HOME pin
        run: sed -i '/^org\\.gradle\\.java\\.home/d' gradle.properties || true

      # Secrets -> local files (secrets are never committed).
      - name: Decode keystore
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
        run: |
          if [ -z "$KEYSTORE_BASE64" ]; then
            echo "Missing secret KEYSTORE_BASE64"
            exit 1
          fi
          echo "$KEYSTORE_BASE64" | base64 -d > app/keystore.keystore

      - name: Write keystore.properties
        env:
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          if [ -z "$KEYSTORE_PASSWORD" ] || [ -z "$KEY_ALIAS" ]; then
            echo "Missing secrets KEYSTORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD"
            exit 1
          fi
          {
            echo "MYAPP_RELEASE_STORE_FILE=keystore.keystore"
            echo "MYAPP_RELEASE_STORE_PASSWORD=$KEYSTORE_PASSWORD"
            echo "MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS"
            echo "MYAPP_RELEASE_KEY_PASSWORD=\${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"
          } > keystore.properties

      - name: Decode google-services.json
        env:
          GOOGLE_SERVICES_JSON_BASE64: \${{ secrets.GOOGLE_SERVICES_JSON_BASE64 }}
        run: |
          if [ -z "$GOOGLE_SERVICES_JSON_BASE64" ]; then
            echo "Missing secret GOOGLE_SERVICES_JSON_BASE64"
            exit 1
          fi
          echo "$GOOGLE_SERVICES_JSON_BASE64" | base64 -d > app/google-services.json

      - name: Build release AAB
        run: |
          chmod +x gradlew
          ./gradlew bundleRelease --no-daemon --stacktrace

      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: app/build/outputs/bundle/release/*.aab
          if-no-files-found: error
`;
}

/**
 * Пишет workflow и выставляет secrets в GitHub (`gh secret set`).
 * Значения берутся из `keystore.properties` (локально, в .gitignore) и
 * `app/keystore.keystore` / `app/google-services.json`. Push делает шаг `git`.
 */
async function setupGithubAab(root, meta) {
  try {
    if (!jira.isJiraConfigured(meta)) {
      return { ok: false, skipped: true, details: "jiraIssue не задан — GitHub AAB пропущен" };
    }
    const creds = await gitSync.loadGitCredentials(root, meta);
    if (!creds.token) {
      return {
        ok: false,
        details: `В ${creds.issueKey} нет GitHub-токена: поле «Github Token» / \`[github] : ghp_…\``,
      };
    }
    if (creds.platform !== "github") {
      return { ok: false, details: `GitHub AAB: в задаче платформа ${creds.platform}` };
    }

    let owner = "";
    let repo = "";
    const parsedUrl = gitSync.parseGithubOwnerRepo(creds.gitUrl);
    if (parsedUrl) {
      owner = parsedUrl.owner;
      repo = parsedUrl.repo;
    } else {
      const found = await gitSync.resolveRepoFromToken(
        creds.token,
        gitSync.preferredRepoName(root, meta),
        root,
      );
      owner = found.owner;
      repo = found.repo;
    }
    const fullName = `${owner}/${repo}`;

    const workflowPath = path.join(root, WORKFLOW_REL);
    const yaml = workflowYaml();
    const previous = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath, "utf8") : "";
    // Windows/autocrlf: пишем файл в тех же переводах строк, что уже в рабочей копии,
    // иначе `git status` показывает workflow изменённым после каждого прогона.
    const crlf = previous.includes("\r\n");
    const output = crlf ? yaml.replace(/\n/g, "\r\n") : yaml;
    fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
    fs.writeFileSync(workflowPath, output, "utf8");
    const workflowChanged = previous.replace(/\r\n/g, "\n") !== yaml.replace(/\r\n/g, "\n");

    const props = readProps(path.join(root, "keystore.properties"));
    const storeFile = props.MYAPP_RELEASE_STORE_FILE || "keystore.keystore";
    const keystore =
      [path.join(root, "app", storeFile), path.join(root, storeFile)].find((item) =>
        fs.existsSync(item),
      ) || "";
    const googleServices =
      [path.join(root, "app", "google-services.json"), path.join(root, "google-services.json")].find(
        (item) => fs.existsSync(item),
      ) || "";

    const missing = [];
    if (!keystore) missing.push(`keystore (${storeFile})`);
    if (!props.MYAPP_RELEASE_STORE_PASSWORD) missing.push("MYAPP_RELEASE_STORE_PASSWORD");
    if (!props.MYAPP_RELEASE_KEY_ALIAS) missing.push("MYAPP_RELEASE_KEY_ALIAS");

    let secretsNote = "";
    if (missing.length) {
      secretsNote = `secrets не выставлены: нет ${missing.join(", ")}`;
    } else if (!hasGh()) {
      secretsNote = "gh CLI не найден — secrets не выставлены";
    } else {
      const secrets = {
        KEYSTORE_BASE64: fs.readFileSync(keystore).toString("base64"),
        KEYSTORE_PASSWORD: props.MYAPP_RELEASE_STORE_PASSWORD,
        KEY_ALIAS: props.MYAPP_RELEASE_KEY_ALIAS,
        KEY_PASSWORD: props.MYAPP_RELEASE_KEY_PASSWORD || props.MYAPP_RELEASE_STORE_PASSWORD,
      };
      if (googleServices) {
        secrets.GOOGLE_SERVICES_JSON_BASE64 = fs.readFileSync(googleServices).toString("base64");
      }
      const failed = [];
      for (const [name, value] of Object.entries(secrets)) {
        const result = run("gh", ["secret", "set", name, "--repo", fullName], {
          cwd: root,
          token: creds.token,
          input: value,
        });
        if (result.code !== 0) {
          failed.push(`${name}: ${result.output || `exit ${result.code}`}`);
        }
      }
      const listed = run("gh", ["secret", "list", "--repo", fullName], {
        cwd: root,
        token: creds.token,
      });
      const names =
        listed.code === 0
          ? listed.output
              .split(/\r?\n/)
              .filter(Boolean)
              .map((line) => line.split(/\s+/)[0])
              .join(", ")
          : "";
      secretsNote = failed.length
        ? `secrets: ошибки ${failed.join("; ")}`
        : `secrets: ${names || Object.keys(secrets).join(", ")}`;
      if (!googleServices) {
        secretsNote += "; google-services.json нет — GOOGLE_SERVICES_JSON_BASE64 не выставлялся";
      }
    }

    const mainFlow = await pushWorkflowToDefaultBranch(creds.token, owner, repo, yaml);
    const pushed = await remoteWorkflowExists(creds.token, fullName);
    const flowNote = mainFlow.ok
      ? `флоу в ${mainFlow.branch}${mainFlow.changed ? " (закоммичен)" : " (без изменений)"}`
      : `флоу в ${mainFlow.branch} не обновлён: ${mainFlow.error}`;
    return {
      ok: true,
      owner,
      repo,
      token: creds.token,
      details:
        `${WORKFLOW_REL.replace(/\\/g, "/")}${workflowChanged ? " (обновлён)" : " (без изменений)"} для ${fullName}; ` +
        `${secretsNote}; ${flowNote}; ` +
        (pushed
          ? "workflow в default-ветке — запуск сборки работает"
          : "workflow в default-ветке нет — workflow_dispatch вернёт 404"),
    };
  } catch (error) {
    return {
      ok: false,
      details: `github-aab: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

module.exports = { setupGithubAab, workflowYaml };
