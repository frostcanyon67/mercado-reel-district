#!/usr/bin/env node
/**
 * Kotlin/Compose autosetup. Изменяет проект по meta.json:
 *
 *  jira         Jira-поля (appName/applicationId) + вложения (keystore/google-services/source)
 *  meta         appName / applicationId / namespace / versionCode / versionName
 *  assets       keystore / google-services / подпись (gradle.properties)
 *  game         *_source.zip (Kotlin/Compose) → исходники игры + ui/GameHost.kt
 *  icons        icon PNG из Jira → res/mipmap-* (launcher/round/foreground) + playstore
 *  randomize    новый словарь R8 + случайный пакет -repackageclasses (каждый прогон)
 *  rename-resources  случайные имена drawable/mipmap/xml/raw/font + правка ссылок
 *  privacy      Privacy URL из Jira → cloudflare-worker/index.js (маркеры privacy-policy + /policy)
 *  webview      payload source → javac → StringFog → R8 (per-project seed, dummy) → assets/<random>/<random>.bin (AES-GCM)
 *  link         [CfWorkerDomain] из Jira (workerDomain → https://<domain>/) → LINK_HEX, иначе meta.cloudflareUrl
 *  cf-protocol  рандомизация CfFields.kt + CF_PROTOCOL воркера
 *  rotate       новый Blowfish ключ/IV (Blowfish.kt + воркер + LINK_HEX)
 *  pad-methods  /* autopad-* *\/ блоки приватных методов в .kt/.java
 *  obfuscation  R8 + StringFog по meta.obfuscation
 *  clean        build / app/build / .kotlin
 *  description  описание игры комментарием в Jira (по строкам/экранам проекта)
 *  fb-jira      Facebook Key Hash + FB Class Name в поля задачи Jira
 *  github-aab   workflow .github/workflows/android-aab.yml + secrets в GitHub (keystore/google-services)
 *  git          GitHub токен/URL из Jira → .git привязывается к репозиторию (как RN git-remote)
 *  checklist    итоговый summary
 *
 * Usage:
 *   node scripts/autosetup/run.js
 *   node scripts/autosetup/run.js --only jira,meta,assets,game
 *   node scripts/autosetup/run.js --only jira
 *   node scripts/autosetup/run.js --list
 *   npm run autosetup
 */

const path = require("path");
const project = require("./project");
const jira = require("./jira");
const { applyMeta } = require("./applyMeta");
const { applyAssets } = require("./applyAssets");
const { applyGameSource } = require("./applyGameSource");
const { applyIcons } = require("./applyIcons");
const { syncPrivacyPolicy } = require("./privacyPolicy");
const { applyWebviewPayload } = require("./webviewPayload");
const { applyLink } = require("./linkCrypto");
const { rotateCfProtocol } = require("./cfProtocol");
const { rotateEncryption } = require("./rotateEncryption");
const { padMethods } = require("./padMethods");
const { applyObfuscation } = require("./obfuscation");
const { cleanBuild } = require("./cleanBuild");
const { setupGithubAab } = require("./githubAab");
const { syncGitFromJira } = require("./gitSync");
const { randomizeBuildIdentifiers } = require("./randomize");
const { renameAppResources } = require("./renameResources");
const { postGameDescription, pushFacebookJira } = require("./jiraUpdates");
const { printChecklist } = require("./checklist");

/** Jira: поля задачи (appName/applicationId) + вложения (keystore/google-services/source). */
async function runJiraStep(root, meta) {
  if (!jira.isJiraConfigured(meta)) {
    return { ok: true, details: "jiraIssue не задан — Jira пропущена" };
  }
  const synced = await jira.syncMetaFromJira(root, meta);
  const downloaded = await jira.downloadJiraAssets(root, meta, synced);
  return {
    ok: true,
    details: `${synced.cfg.issueKey}: ${synced.fields.appName} / ${synced.fields.applicationId}`,
    task: downloaded.task,
    cleanup: downloaded.cleanup,
  };
}

/**
 * LINK_HEX ← ссылка воркера. Приоритет: комментарий `[CfWorkerDomain]` в задаче
 * (там `workerDomain`, напр. `nomewetoha.online` → `https://nomewetoha.online/`),
 * затем `meta.cloudflareUrl`, затем прежний поиск домена в комментариях.
 * Так копия проекта не остаётся со ссылкой старого проекта.
 */
async function runLinkStep(root, meta) {
  let url = "";
  let source = "";
  if (jira.isJiraConfigured(meta)) {
    const marked = await jira.fetchJiraCfWorkerDomainUrl(root, meta);
    if (marked.ok) {
      url = marked.url;
      source = "[CfWorkerDomain] из Jira";
    }
  }
  if (!url) url = String(meta.cloudflareUrl || "").trim();
  if (!url && jira.isJiraConfigured(meta)) {
    const found = await jira.fetchJiraCloudflareWorkerUrl(root, meta);
    if (found.ok) {
      url = found.url;
      source = "worker url из комментариев Jira";
    } else {
      console.warn(`[warn] Cloudflare Worker URL: ${found.details}`);
    }
  }
  if (!url) {
    console.warn(
      "[warn] в задаче нет [CfWorkerDomain] и cloudflareUrl пуст — LINK_HEX не менялся",
    );
    return { ok: true, details: "нет [CfWorkerDomain] и cloudflareUrl — LINK_HEX не менялся" };
  }

  const stored = String((project.readMeta(root) || {}).cloudflareUrl || "").trim();
  meta.cloudflareUrl = url;
  if (stored !== url) project.writeMeta(root, { cloudflareUrl: url });
  if (source) console.log(`[autosetup] ${source}: ${url}`);
  return applyLink(root, meta);
}

/**
 * Шаг, которому нужны вложения Jira: если task ещё не скачан (например
 * `--only game`), качаем его здесь; cleanup выполнит main в конце прогона.
 */
async function withJiraTask(root, meta, task, fn) {
  if (task || !jira.isJiraConfigured(meta)) return fn(task);
  const downloaded = await jira.downloadJiraAssets(root, meta);
  const result = (await fn(downloaded.task)) || { ok: true, details: "ok" };
  return { ...result, task: downloaded.task, cleanup: downloaded.cleanup };
}

/** Privacy URL из Jira (customfield_10039) → cloudflare-worker/index.js. */
async function runPrivacyStep(root, meta) {
  let url = "";
  // Приоритет — поле задачи: копия проекта не должна наследовать policy источника.
  if (jira.isJiraConfigured(meta)) {
    try {
      const loaded = await jira.loadJiraIssue(root, meta);
      const issueFields = (loaded.issue && loaded.issue.fields) || {};
      url = String(issueFields[jira.PRIVACY_URL_FIELD] || "").trim();
      if (url) {
        const stored = String((project.readMeta(root) || {}).privacyUrl || "").trim();
        if (stored !== url) project.writeMeta(root, { privacyUrl: url });
        meta.privacyUrl = url;
      } else {
        console.warn(
          `[warn] в задаче нет Privacy URL (${jira.PRIVACY_URL_FIELD}) — беру meta.privacyUrl`,
        );
      }
    } catch (error) {
      console.warn(
        `[warn] Privacy URL из Jira не получен: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  if (!url) url = String(meta.privacyUrl || "").trim();
  if (!url) {
    return {
      ok: true,
      details: jira.isJiraConfigured(meta)
        ? "Privacy URL не задан в Jira — policy в index.js не менялась"
        : "privacyUrl не задан — пропуск",
    };
  }
  const result = await syncPrivacyPolicy(root, url);
  return {
    ok: true,
    details:
      `${result.file} ← ${url} (${result.bytes} B` +
      `${result.changed ? ", обновлён" : ", без изменений"}` +
      `${result.routeAdded ? ", route добавлен" : ""})`,
  };
}

const STEPS = {
  jira: (root, meta) => runJiraStep(root, meta),
  meta: (root, meta) => applyMeta(root, meta),
  assets: (root, meta, task) => withJiraTask(root, meta, task, (t) => applyAssets(root, meta, t)),
  game: (root, meta, task) => withJiraTask(root, meta, task, (t) => applyGameSource(root, meta, t)),
  icons: (root, meta, task) => withJiraTask(root, meta, task, (t) => applyIcons(root, meta, t)),
  randomize: (root, meta) => randomizeBuildIdentifiers(root, meta),
  "rename-resources": (root, meta) => renameAppResources(root, meta),
  privacy: (root, meta) => runPrivacyStep(root, meta),
  webview: (root, meta) => applyWebviewPayload(root, meta),
  link: (root, meta) => runLinkStep(root, meta),
  "cf-protocol": (root, meta) => rotateCfProtocol(root, meta),
  rotate: (root, meta) => rotateEncryption(root, meta),
  "pad-methods": (root, meta) =>
    padMethods(root, { force: meta.padMethods === "rotate" || meta.maxRandomize !== false }),
  obfuscation: (root, meta) => applyObfuscation(root, meta),
  clean: (root) => cleanBuild(root),
  description: (root, meta) => postGameDescription(root, meta),
  "fb-jira": (root, meta) => pushFacebookJira(root, meta),
  "github-aab": (root, meta) => setupGithubAab(root, meta),
  git: (root, meta) => syncGitFromJira(root, meta),
  checklist: (root, meta) => printChecklist(root, meta),
};

const DEFAULT_ORDER = Object.keys(STEPS);

/** Мягкие шаги: полный прогон не падает, если источника/данных нет. */
const OPTIONAL_STEPS = new Set([
  "game",
  "icons",
  "randomize",
  "rename-resources",
  "webview",
  "clean",
  "description",
  "fb-jira",
  "github-aab",
  "git",
]);

function parseArgs(argv) {
  const args = {
    only: null,
    list: false,
    help: false,
    skipClean: false,
    skipPad: false,
    skipJira: false,
    skipGame: false,
    skipIcons: false,
    skipPrivacy: false,
    skipGit: false,
    pushGit: false,
    cleanOrigin: false,
    skipGithubAab: false,
    skipDescription: false,
    skipFbJira: false,
    maxRandomize: false,
    noMaxRandomize: false,
    noRenameResources: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--only") args.only = String(argv[++i] || "");
    else if (arg === "--skip-clean") args.skipClean = true;
    else if (arg === "--skip-pad") args.skipPad = true;
    else if (arg === "--skip-jira") args.skipJira = true;
    else if (arg === "--skip-game") args.skipGame = true;
    else if (arg === "--skip-icons") args.skipIcons = true;
    else if (arg === "--skip-privacy") args.skipPrivacy = true;
    else if (arg === "--skip-git") args.skipGit = true;
    else if (arg === "--push-git") args.pushGit = true;
    else if (arg === "--clean-origin") args.cleanOrigin = true;
    else if (arg === "--skip-github-aab") args.skipGithubAab = true;
    else if (arg === "--skip-description") args.skipDescription = true;
    else if (arg === "--skip-fb-jira") args.skipFbJira = true;
    else if (arg === "--max-randomize") args.maxRandomize = true;
    else if (arg === "--no-max-randomize") args.noMaxRandomize = true;
    else if (arg === "--no-rename-resources") args.noRenameResources = true;
    else if (arg === "--list" || arg === "list") args.list = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

function parseOnly(raw) {
  if (!raw) return null;
  const steps = raw
    .split(",")
    .map((step) => step.trim().toLowerCase())
    .filter(Boolean);
  for (const step of steps) {
    if (!STEPS[step]) {
      throw new Error(`Неизвестный шаг «${step}». Доступно: ${DEFAULT_ORDER.join(", ")}`);
    }
  }
  return new Set(steps);
}

function printHelp() {
  console.log(`Autosetup (Kotlin)

Options:
  --only <steps>   Частичный запуск, через запятую:
                   ${DEFAULT_ORDER.join(", ")}
  --skip-jira      Не ходить в Jira (использовать meta.json как есть)
  --skip-game      Не применять *_source.zip
  --skip-icons     Не нарезать иконку из Jira (mipmaps из source)
  --skip-privacy   Не обновлять privacy policy в worker/index.js
  --skip-clean     Не удалять build/app/build
  --skip-pad       Не добавлять autopad-блоки
  --skip-git       Не привязывать .git из Jira
  --push-git       После привязки .git сделать первый commit + push
  --clean-origin   origin без токена + репозиторный credential helper с токеном
                   (по умолчанию токен остаётся в origin, чтобы git push работал
                   без логина; то же самое — meta.gitTokenInRemote: false)
  --skip-github-aab  Не настраивать GitHub Actions AAB (workflow + secrets)
  --skip-description  Не отправлять описание игры в Jira
  --skip-fb-jira   Не отправлять FB hash / FB Class Name в Jira
  --max-randomize  Максимально менять билд между прогонами (включено по умолчанию):
                   словарь R8, -repackageclasses, pad-методы, payload, CF-протокол,
                   имена ресурсов
  --no-max-randomize  Не менять эти артефакты между прогонами
  --no-rename-resources  Не переименовывать drawable/mipmap/xml/raw/font
  --list           Список команд (npm run cmds)

meta.json (Jira):
  jiraIssue (4748 / ANDROID-4748 / ссылка), jiraBaseUrl, jiraEmail, jiraToken
  → appName / applicationId
  → keystore tar.gz / google-services.json / *_source.zip (вложения задачи)
  → Cloudflare Worker URL из комментариев (если cloudflareUrl не задан)
  → Github Token (customfield_10687) + Git URL (customfield_10056) → шаг git

meta.json (остальное):
  appName, applicationId, namespace, versionCode, versionName,
  cloudflareUrl, keystore, googleServices, webviewDex, signing,
  cfProtocol, obfuscation { minify, stringfog }, rotate, padMethods, cleanBuild

Примеры:
  node scripts/autosetup/run.js --only jira,meta,assets,game
  node scripts/autosetup/run.js --only jira
  node scripts/autosetup/run.js --only checklist
`);
}

function defaultMetaPath(root) {
  return path.join(root, "meta.json");
}

function shouldRun(name, only, args, meta) {
  if (only) return only.has(name);
  if (name === "checklist") return true;
  if (name === "jira" && args.skipJira) return false;
  if (name === "game" && args.skipGame) return false;
  if (name === "icons" && args.skipIcons) return false;
  if (name === "privacy" && args.skipPrivacy) return false;
  if (name === "clean" && args.skipClean) return false;
  if (name === "pad-methods" && args.skipPad) return false;
  if (name === "clean" && meta.cleanBuild === false) return false;
  if (name === "pad-methods" && meta.padMethods === false) return false;
  if (name === "rotate" && meta.rotate === false) return false;
  if (name === "cf-protocol" && meta.cfProtocol === false) return false;
  if (name === "git" && (args.skipGit || args.skipJira)) return false;
  if (name === "git" && meta.gitSync === false) return false;
  if (name === "git" && !jira.isJiraConfigured(meta)) return false;
  if (name === "randomize" && (args.noMaxRandomize || meta.maxRandomize === false)) return false;
  if (name === "rename-resources" && (args.noMaxRandomize || args.noRenameResources)) return false;
  if (name === "rename-resources" && meta.renameResources === false) return false;
  if (name === "rename-resources" && meta.maxRandomize === false) return false;
  if (name === "description" && (args.skipJira || args.skipDescription)) return false;
  if (name === "description" && meta.jiraDescription === false) return false;
  if (name === "description" && !jira.isJiraConfigured(meta)) return false;
  if (name === "fb-jira" && (args.skipJira || args.skipFbJira)) return false;
  if (name === "fb-jira" && meta.jiraFb === false) return false;
  if (name === "fb-jira" && !jira.isJiraConfigured(meta)) return false;
  if (name === "github-aab" && (args.skipGithubAab || args.skipJira)) return false;
  if (name === "github-aab" && meta.githubAab === false) return false;
  if (name === "github-aab" && !jira.isJiraConfigured(meta)) return false;
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) {
    require("./listCommands");
    return;
  }
  if (args.help) {
    printHelp();
    return;
  }

  const only = parseOnly(args.only);
  const root = project.projectRoot();
  const metaPath = defaultMetaPath(root);

  console.log(`[autosetup] project: ${root}`);
  console.log(`[autosetup] meta: ${metaPath}`);

  let task = null;
  let cleanup = async () => {};

  try {
    for (const name of DEFAULT_ORDER) {
      const meta = project.readMeta(root);
      if (name === "git" && args.pushGit) meta.gitPush = true;
      if (name === "git" && args.cleanOrigin) meta.gitTokenInRemote = false;
      if (args.maxRandomize) meta.maxRandomize = true;
      if (args.noMaxRandomize) meta.maxRandomize = false;
      if (!shouldRun(name, only, args, meta)) {
        if (only) console.log(`[autosetup] ${name}: пропуск`);
        continue;
      }

      process.stdout.write(`[autosetup] ${name}... `);
      let result;
      try {
        result = (await STEPS[name](root, meta, task)) || { ok: true, details: "ok" };
      } catch (error) {
        if (OPTIONAL_STEPS.has(name)) {
          // Best-effort steps (game/icons/webview/git) must not abort autosetup.
          result = {
            ok: false,
            details: error instanceof Error ? error.message : String(error),
          };
        } else {
          console.log("FAIL");
          throw error;
        }
      }

      if (result.task) task = result.task;
      if (result.cleanup) cleanup = result.cleanup;

      if (!result.ok) {
        if (OPTIONAL_STEPS.has(name)) {
          console.log(`skip (${result.details})`);
          continue;
        }
        console.log("FAIL");
        throw new Error(result.details || `${name} failed`);
      }

      console.log(result.details || "ok");
    }

    console.log("[autosetup] готово");
  } finally {
    await cleanup().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`[autosetup] ERROR: ${error && error.message ? error.message : error}`);
  process.exit(1);
});
