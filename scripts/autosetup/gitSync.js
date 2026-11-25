const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const jira = require("./jira");

/** Jira «Github Token» / «Git URL» / «Details» (те же поля, что у RN-автосетапа). */
const GITHUB_TOKEN_FIELD = "customfield_10687";
const GIT_URL_FIELD = "customfield_10056";
const DETAILS_FIELD = "customfield_10321";

function trim(value) {
  return value == null ? "" : String(value).trim();
}

function maskToken(text, token) {
  const value = String(text || "");
  if (!token) return value;
  return value.split(token).join("***");
}

/** Jira field value (string / ADF / object) → plain text. */
function fieldToText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    if (typeof value.value === "string") return value.value.trim();
    if (typeof value.url === "string") return value.url.trim();
    return jira.jiraAdfToPlainText(value).join(" ").trim();
  }
  return String(value).trim();
}

/** `[github] : ghp_…` / `[gitlab] : glpat-…` в Description / Details. */
function extractGitToken(text) {
  const source = String(text || "");
  const github = source.match(/\[\s*github\s*\]\s*:?\s*([^\s\]\r\n]+)/i);
  if (github?.[1]) return { platform: "github", token: github[1].trim() };
  const gitlab = source.match(/\[\s*gitlab\s*\]\s*:?\s*([^\s\]\r\n]+)/i);
  if (gitlab?.[1]) return { platform: "gitlab", token: gitlab[1].trim() };
  return null;
}

/** Jira «Github Token»: чистый PAT или legacy `[github] : …`. */
function extractTokenFromField(value) {
  const text = fieldToText(value);
  const patterned = extractGitToken(text);
  if (patterned?.token) return patterned;
  if (!text) return null;
  const raw = text.split(/\s+/)[0].trim();
  if (!raw) return null;
  if (/^(ghp_|github_pat_|gho_|ghu_|ghs_|ghr_)/i.test(raw)) return { platform: "github", token: raw };
  if (/^(glpat-|gloas-)/i.test(raw)) return { platform: "gitlab", token: raw };
  if (/^[A-Za-z0-9_-]{20,}$/.test(raw)) return { platform: "github", token: raw };
  return null;
}

function parseGithubOwnerRepo(gitUrl) {
  let raw = trim(gitUrl);
  if (!raw) return null;
  const ssh = raw.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/i);
  if (ssh) return { owner: ssh[1], repo: ssh[2].replace(/\.git$/i, "") };
  if (/^[^/\s]+\/[^/\s]+$/.test(raw)) raw = `https://github.com/${raw}`;
  try {
    const url = new URL(raw);
    if (!/github\.com$/i.test(url.hostname)) return null;
    const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

function sameRepo(a, b) {
  const left = parseGithubOwnerRepo(a);
  const right = parseGithubOwnerRepo(b);
  if (!left || !right) return false;
  return (
    left.owner.toLowerCase() === right.owner.toLowerCase() &&
    left.repo.toLowerCase() === right.repo.toLowerCase()
  );
}

function sanitizeRepoName(raw) {
  const cleaned = String(raw || "")
    .trim()
    .replace(/\.git$/i, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 100);
  return cleaned || "app";
}

/** meta.githubRepo → название игры → имя папки (без номеров/ID, если есть appName). */
function preferredRepoName(root, meta) {
  const explicit = trim(meta.githubRepo);
  if (explicit) return sanitizeRepoName(explicit);
  const appName = trim(meta.appName);
  if (appName) return sanitizeRepoName(appName);
  return sanitizeRepoName(path.basename(root));
}

function runGit(args, cwd, token) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  const output = maskToken(`${result.stdout || ""}\n${result.stderr || ""}`, token).trim();
  return { code: result.error ? -1 : result.status ?? -1, output };
}

function readOrigin(root, token) {
  const result = runGit(["remote", "get-url", "origin"], root, token);
  return result.code === 0 ? result.output.trim() : "";
}

async function githubApi(token, method, apiPath, body) {
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

async function loadGitCredentials(root, meta) {
  const cfg = jira.resolveJiraConfig(root, meta);
  const auth = `Basic ${Buffer.from(`${cfg.email}:${cfg.token}`, "utf8").toString("base64")}`;
  const fields = ["description", GITHUB_TOKEN_FIELD, GIT_URL_FIELD, DETAILS_FIELD].join(",");
  const url =
    `${cfg.baseUrl}/rest/api/3/issue/${encodeURIComponent(cfg.issueKey)}` +
    `?fields=${encodeURIComponent(fields)}`;
  const res = await fetch(url, { headers: { Authorization: auth, Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Jira API ${res.status}: ${body.slice(0, 300) || url}`);
  }
  const issue = await res.json();
  const issueFields = (issue && issue.fields) || {};

  const fromField = extractTokenFromField(issueFields[GITHUB_TOKEN_FIELD]);
  const fromDescription = fromField?.token
    ? null
    : extractGitToken(fieldToText(issueFields.description));
  const fromDetails =
    fromField?.token || fromDescription?.token
      ? null
      : extractGitToken(fieldToText(issueFields[DETAILS_FIELD]));
  const parsed = fromField?.token ? fromField : fromDescription?.token ? fromDescription : fromDetails;
  const gitUrl = fieldToText(issueFields[GIT_URL_FIELD]);
  const platform =
    parsed?.platform || (gitUrl.toLowerCase().includes("gitlab") ? "gitlab" : "github");

  return {
    issueKey: cfg.issueKey,
    token: parsed?.token || "",
    platform,
    gitUrl,
    tokenSource: fromField?.token
      ? `«Github Token» (${GITHUB_TOKEN_FIELD})`
      : fromDescription?.token
        ? "Description"
        : fromDetails?.token
          ? "Details"
          : "",
  };
}

/** repo по имени проекта → единственный репо токена → создать приватный. */
async function resolveRepoFromToken(token, preferredName, root) {
  const me = await githubApi(token, "GET", "/user");
  if (!me.ok || !me.json?.login) {
    throw new Error(
      `GitHub /user ${me.status || ""}: ${me.json?.message || "токен не принят"}`.trim(),
    );
  }
  const login = String(me.json.login);
  const direct = await githubApi(
    token,
    "GET",
    `/repos/${encodeURIComponent(login)}/${encodeURIComponent(preferredName)}`,
  );
  // GitHub может отредиректить старое имя переименованного репо — это тот же
  // проект, поэтому принимаем найденный репозиторий как есть (как RN-автосетап).
  if (direct.ok && direct.json?.name) {
    return {
      owner: direct.json.owner?.login || login,
      repo: direct.json.name,
      created: false,
      private: Boolean(direct.json.private),
    };
  }

  const listed = [];
  for (let page = 1; page <= 5; page++) {
    const pageRes = await githubApi(
      token,
      "GET",
      `/user/repos?per_page=100&page=${page}&affiliation=owner,collaborator&sort=updated`,
    );
    if (!pageRes.ok || !Array.isArray(pageRes.json)) break;
    listed.push(...pageRes.json);
    if (pageRes.json.length < 100) break;
  }
  const preferredLower = preferredName.toLowerCase();
  const match =
    listed.find((repo) => String(repo?.name || "").toLowerCase() === preferredLower) ||
    (listed.length === 1 ? listed[0] : null);
  if (match?.name) {
    return {
      owner: match.owner?.login || login,
      repo: match.name,
      created: false,
      private: Boolean(match.private),
    };
  }

  const created = await githubApi(token, "POST", "/user/repos", {
    name: preferredName,
    private: true,
    auto_init: false,
    description: path.basename(root),
  });
  if (!created.ok || !created.json?.name) {
    throw new Error(
      `Не удалось создать ${login}/${preferredName}: ${
        created.json?.message || `HTTP ${created.status}`
      }`,
    );
  }
  return { owner: created.json.owner?.login || login, repo: created.json.name, created: true, private: true };
}

function stripTokenFromConfig(root) {
  const config = path.join(root, ".git", "config");
  try {
    const raw = fs.readFileSync(config, "utf8");
    const next = raw.replace(/https:\/\/[^@\s]+@github\.com\//g, "https://github.com/");
    if (next !== raw) fs.writeFileSync(config, next, "utf8");
  } catch {
    // .git/config отсутствует — нечего чистить
  }
}

/** Тот же URL, но с `x-access-token:<PAT>@` — push идёт от токена без логина. */
function tokenRemoteUrl(cleanUrl, token) {
  return cleanUrl.replace(
    /^https:\/\//i,
    `https://x-access-token:${encodeURIComponent(token)}@`,
  );
}

/**
 * Чистый origin + репозиторный credential helper с токеном: в ссылке секрета нет,
 * но `git push` / `git fetch` берут пароль из токена Jira (GCM не спрашивает).
 */
function installTokenCredentialHelper(root, token) {
  // URL-specific helper отвечает за пароль; пустой credential.helper (значение "")
  // сбрасывает унаследованные helper'ы (Git Credential Manager/manager), иначе они
  // лезут логиниться. Порядок в .git/config важен: сброс → наши helper'ы.
  const helper = `!f() { echo username=x-access-token; echo password=${token}; }; f`;
  runGit(["config", "--local", "--unset-all", "credential.helper"], root, token);
  runGit(["config", "--local", "--unset-all", "credential.https://github.com.helper"], root, token);
  runGit(
    ["config", "--local", "--unset-all", "credential.https://gist.github.com.helper"],
    root,
    token,
  );
  runGit(["config", "--local", "credential.helper", ""], root, token);
  runGit(["config", "--local", "credential.https://github.com.helper", helper], root, token);
  runGit(
    ["config", "--local", "credential.https://gist.github.com.helper", helper],
    root,
    token,
  );
}

/** `meta.gitTokenInRemote !== false` — токен в origin (по умолчанию), иначе чистый URL. */
function tokenInRemote(meta) {
  return meta.gitTokenInRemote !== false;
}

/** Приводит origin к выбранному режиму авторизации; возвращает пояснение для лога. */
function applyOriginAuth(root, meta, cleanUrl, token) {
  if (tokenInRemote(meta)) {
    const url = tokenRemoteUrl(cleanUrl, token);
    runGit(["remote", "set-url", "origin", url], root, token);
    return "origin с токеном (push без логина)";
  }
  runGit(["remote", "set-url", "origin", cleanUrl], root, token);
  stripTokenFromConfig(root);
  installTokenCredentialHelper(root, token);
  return "origin без токена + credential helper";
}

/**
 * Как RN-автосетап `git-remote`: токен + Git URL из Jira, поиск/создание репо по
 * токену, `.git` копируется из GitHub (рабочие файлы не трогаются), origin — без токена.
 */
async function attachGitFromJira(root, meta) {
  if (!jira.isJiraConfigured(meta)) {
    return { ok: false, skipped: true, details: "jiraIssue не задан — Jira/git пропущены" };
  }
  const creds = await loadGitCredentials(root, meta);
  if (!creds.token) {
    return {
      ok: false,
      details:
        `В ${creds.issueKey} не найден GitHub-токен: поле «Github Token» (${GITHUB_TOKEN_FIELD}) ` +
        "или `[github] : ghp_…` в Description / Details",
    };
  }
  if (creds.platform !== "github") {
    return { ok: false, details: `Ожидается GitHub-токен, в задаче платформа ${creds.platform}` };
  }

  let owner = "";
  let repo = "";
  let note = "";
  let visibility = null;
  const parsedUrl = parseGithubOwnerRepo(creds.gitUrl);
  if (parsedUrl) {
    owner = parsedUrl.owner;
    repo = parsedUrl.repo;
  } else {
    const found = await resolveRepoFromToken(creds.token, preferredRepoName(root, meta), root);
    owner = found.owner;
    repo = found.repo;
    visibility = found.private;
    note = found.created
      ? `репо создан по токену ${owner}/${repo}`
      : `репо по токену ${owner}/${repo}`;
  }
  const cleanUrl = `https://github.com/${owner}/${repo}.git`;
  const hasGit = fs.existsSync(path.join(root, ".git"));

  if (!hasGit && visibility === false && meta.allowPublicRepo !== true) {
    return {
      ok: false,
      owner,
      repo,
      details:
        `репозиторий ${owner}/${repo} публичный — не привязываю. ` +
        "Переименуйте его в приватный, задайте meta.githubRepo или meta.allowPublicRepo: true.",
    };
  }

  if (hasGit) {
    const origin = readOrigin(root, creds.token);
    const same = sameRepo(origin, cleanUrl);
    const authNote = same ? applyOriginAuth(root, meta, cleanUrl, creds.token) : "";
    return {
      ok: true,
      skippedClone: true,
      owner,
      repo,
      token: creds.token,
      cleanUrl,
      origin,
      details:
        (same
          ? `.git уже есть, origin = ${owner}/${repo}; ${authNote}`
          : `.git уже есть, origin: ${origin || "не задан"} — clone не делался`) +
        (note ? `; ${note}` : ""),
    };
  }

  const tempDir = path.join(
    os.tmpdir(),
    `autosetup-git-${repo.replace(/[^\w.-]+/g, "_")}-${Date.now()}`,
  );
  try {
    const cloneUrl = `https://x-access-token:${encodeURIComponent(creds.token)}@github.com/${owner}/${repo}.git`;
    const clone = runGit(["clone", "--quiet", cloneUrl, tempDir], os.tmpdir(), creds.token);
    if (clone.code !== 0) {
      return {
        ok: false,
        details: `git clone ${owner}/${repo}: ${clone.output || `exit ${clone.code}`}`,
      };
    }
    fs.cpSync(path.join(tempDir, ".git"), path.join(root, ".git"), { recursive: true });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  const authNote = applyOriginAuth(root, meta, cleanUrl, creds.token);

  return {
    ok: true,
    skippedClone: false,
    owner,
    repo,
    token: creds.token,
    cleanUrl,
    details: `${note ? `${note}; ` : ""}.git привязан (${owner}/${repo}); ${authNote}`,
  };
}

/** `meta.gitPush: true` — первый commit + push (по умолчанию выключено). */
function pushInitialIfRequested(root, meta, info) {
  if (meta.gitPush !== true) return "";
  if (!info?.token || !info.owner || !info.repo) return "";
  if (!runGit(["config", "user.name"], root).output) {
    runGit(["config", "user.name", trim(meta.gitUserName) || "autosetup"], root);
  }
  if (!runGit(["config", "user.email"], root).output) {
    runGit(["config", "user.email", trim(meta.gitUserEmail) || "autosetup@localhost"], root);
  }
  runGit(["add", "-A"], root);
  const hasChanges = runGit(["diff", "--cached", "--quiet"], root).code !== 0;
  const message = `Autosetup: ${trim(meta.appName) || path.basename(root)} ${trim(meta.versionName)}`.trim();
  let commitNote = "";
  if (hasChanges) {
    const commit = runGit(["commit", "-m", message], root);
    if (commit.code !== 0) return `commit: ${commit.output || `exit ${commit.code}`}`;
    commitNote = "commit + ";
  }
  // `rev-parse --abbrev-ref HEAD` падает на репо без коммитов (unborn HEAD) и отдаёт
  // в output текст ошибки вместо имени ветки — refspec становился `HEAD:refs/heads/fatal: …`.
  // `symbolic-ref --short` работает и до первого коммита.
  const headRef = runGit(["symbolic-ref", "--short", "-q", "HEAD"], root);
  const rawBranch = headRef.code === 0 ? headRef.output.split(/\r?\n/)[0].trim() : "";
  // Код проекта живёт в версионных ветках (v1, v2, …): в main — оригинальный код и
  // только флоу сборки (его кладёт шаг `github-aab` через Contents API).
  const branch = /^[A-Za-z0-9._/-]+$/.test(rawBranch) && !/^(main|master)$/i.test(rawBranch)
    ? rawBranch
    : "v1";
  const pushUrl = `https://x-access-token:${encodeURIComponent(info.token)}@github.com/${info.owner}/${info.repo}.git`;
  // push нужен и без новых коммитов: локальный коммит мог остаться непушенным
  // (например, предыдущий push упал), а сборка запускается из версионной ветки.
  const push = runGit(["push", pushUrl, `HEAD:refs/heads/${branch}`], root, info.token);
  if (push.code !== 0) return `${commitNote}push: ${push.output || `exit ${push.code}`}`;
  const empty = /Everything up-to-date/i.test(push.output) ? " (без изменений)" : "";
  return `${commitNote}push → ${info.owner}/${info.repo}:${branch}${empty}`;
}

/** Один шаг автосетапа: привязать `.git` из Jira (+ опционально push). */
async function syncGitFromJira(root, meta) {
  try {
    const attached = await attachGitFromJira(root, meta);
    if (!attached.ok) return attached;
    const pushNote = pushInitialIfRequested(root, meta, attached);
    return {
      ...attached,
      details: [attached.details, pushNote].filter(Boolean).join("; "),
    };
  } catch (error) {
    return {
      ok: false,
      details: `git: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

module.exports = {
  syncGitFromJira,
  attachGitFromJira,
  loadGitCredentials,
  resolveRepoFromToken,
  preferredRepoName,
  readOrigin,
  parseGithubOwnerRepo,
  GITHUB_TOKEN_FIELD,
  GIT_URL_FIELD,
};
