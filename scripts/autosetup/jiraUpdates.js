/**
 * Jira-обновления из автосетапа (как tail-шаги RN-хелпера):
 *  - `description` — описание игры комментарием в задачу;
 *  - `fb-jira` — Facebook Key Hash + FB Class Name в поля задачи.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const project = require("./project");
const jira = require("./jira");

const FB_HASH_FIELD = "customfield_10067";
const FB_CLASS_FIELD = "customfield_10069";

function readText(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "build" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function isHumanCopy(text) {
  const value = String(text || "").trim();
  if (value.length < 3 || value.length > 500) return false;
  if (!/[A-Za-zА-Яа-я]/.test(value)) return false;
  if (/[{}<>;=]|&&|\|\||=>|\bfun\b|\bval\b|\bvar\b|\breturn\b|\bimport\b/.test(value)) return false;
  if (/^#|^https?:|^\.\.?\//.test(value)) return false;
  if (/^[A-Za-z0-9_]{18,}$/.test(value)) return false;
  if (/%\d\$?[sd]/.test(value)) return false;
  return true;
}

/** Ресурсы strings.xml + строковые литералы Kotlin (без интерполяции). */
function collectGameCopy(root) {
  const phrases = [];
  const add = (text) => {
    const value = String(text || "").replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
    if (!isHumanCopy(value)) return;
    if (!phrases.includes(value)) phrases.push(value);
  };

  const stringsFile = path.join(root, "app", "src", "main", "res", "values", "strings.xml");
  const xml = readText(stringsFile);
  for (const match of xml.matchAll(/<string\s+name="[^"]+"\s*>([\s\S]*?)<\/string>/g)) {
    add(match[1]);
  }

  const javaRoot = path.join(root, "app", "src", "main", "java");
  for (const file of walk(javaRoot)) {
    if (!/\.(kt|java)$/.test(file)) continue;
    if (!/[\\/](presentation|ui|core)[\\/]/.test(file)) continue;
    const source = readText(file);
    for (const match of source.matchAll(/"((?:\\.|[^"\\$]){2,400})"/g)) {
      add(match[1].replace(/\\"/g, '"').replace(/\\'/g, "'"));
    }
  }
  return phrases;
}

function buildParagraph({ appName, phrases }) {
  const title = String(appName || "Игра").trim();
  const low = phrases.join("\n").toLowerCase();
  const has = (re) => re.test(low);

  const gates = has(/\bgates?\b/);
  const disc = has(/\bdisc\b/);
  const reels = has(/\breels?\b/);
  const levels = has(/\blevels?\b|\bstages?\b/);
  const missions = has(/\bmissions?\b/);
  const rewards = has(/\brewards?\b/);
  const collection = has(/\bcollection\b|\bartifact|\bgems?\b|shards?/);
  const tutorial = has(/\btutorial\b|\bhow to play\b/);
  const skill = has(/\bskill\b|\bchoose\b|\bselect\b|\bmove\b|rotate|tap/);
  const luck = has(/\brandom\b|\bchance\b|\bluck\b/);
  const offline = has(/\boffline\b/);
  const noMoney = has(
    /no real money|no monetary|cannot be withdrawn|no cash prize|entertainment only|cannot be exchanged/,
  );
  const cannotBuy = has(/cannot be purchased|cannot be bought|no purchases|no purchases/);
  const iap = has(/\b(shop|purchase|in-app|iap)\b/) && !cannotBuy;

  const sentences = [];
  if (gates || disc) {
    const actions = [gates ? "игрок поворачивает ворота" : "", disc ? "запускает диск" : ""].filter(Boolean);
    sentences.push(
      `${title} — короткая сессия: ${actions.join(" и ")} на каждом уровне` +
        (levels ? "; прогресс идёт по этапам." : "."),
    );
  } else if (reels) {
    sentences.push(`${title} — сессия с барабанами, которые останавливаются по правилам экрана.`);
  } else {
    sentences.push(`${title} — короткая сессия по тем экранам, которые есть в проекте.`);
  }

  if (skill && luck) {
    sentences.push("Что сделать на поле, решает игрок, а что выпадет — решает случай, поэтому исход зависит и от действий, и от удачи.");
  } else if (luck) {
    sentences.push("Исход в основном решает случай на поле.");
  } else if (skill) {
    sentences.push("Исход зависит от действий игрока на экране.");
  } else {
    sentences.push("Деления на навык и удачу эти экраны не описывают.");
  }

  const progress = [];
  if (levels) progress.push("этапы");
  if (missions) progress.push("миссии");
  if (rewards) progress.push("награды");
  if (collection) progress.push("коллекция");
  if (tutorial) progress.push("обучение");
  sentences.push(
    progress.length
      ? `Внутри есть то, что уже показано в интерфейсе: ${progress.join(", ")}.`
      : "Отдельных призов эти экраны не называют.",
  );

  if (noMoney) {
    sentences.push("Денежного вывода нет: выигрыш нельзя обменять или забрать деньгами.");
  } else {
    sentences.push("Правил вывода денег в этих экранах нет.");
  }

  if (cannotBuy) {
    sentences.push("Внутриигровых покупок нет: валюту экрана нельзя купить.");
  } else if (iap) {
    sentences.push("Внутриигровые покупки в интерфейсе есть.");
  } else {
    sentences.push("Внутриигровых покупок эти экраны не показывают.");
  }

  if (offline) sentences.push("Игра работает без сети: весь прогресс хранится на устройстве.");

  return sentences.slice(0, 6).join(" ");
}

async function postGameDescription(root, meta) {
  if (meta && meta.jiraDescription === false) {
    return { ok: true, skipped: true, details: "jiraDescription=false" };
  }
  const phrases = collectGameCopy(root);
  const paragraph = buildParagraph({ appName: meta && meta.appName, phrases });
  const issueKey = jira.resolveJiraConfig(root, meta).issueKey;

  // Не дублируем одинаковое описание при повторных прогонах автосетапа.
  const normalized = paragraph.replace(/\s+/g, " ").trim();
  const existing = await jira.listIssueComments(root, meta);
  const duplicate = existing.some((comment) => {
    const body = comment && comment.body;
    const text =
      Array.isArray(body) || (body && typeof body === "object")
        ? jira.jiraAdfToPlainText(body).join(" ")
        : String(body || "");
    return text.replace(/\s+/g, " ").trim() === normalized;
  });
  if (duplicate) {
    return { ok: true, skipped: true, details: `${issueKey}: описание уже есть — не дублирую` };
  }

  const posted = await jira.addIssueComment(root, meta, paragraph);
  console.log(`[autosetup] description: ${paragraph}`);
  return {
    ok: true,
    details: `комментарий в ${posted.issueKey} (фраз: ${phrases.length})`,
    paragraph,
  };
}

function readProperties(file) {
  const map = {};
  for (const line of readText(file).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return map;
}

/** Подпись release: `keystore.properties` (или legacy `gradle.properties`). */
function resolveKeystore(root) {
  const props = {
    ...readProperties(path.join(root, "gradle.properties")),
    ...readProperties(path.join(root, "keystore.properties")),
  };
  const storeFile = props.MYAPP_RELEASE_STORE_FILE || "keystore.keystore";
  const alias = props.MYAPP_RELEASE_KEY_ALIAS || "";
  const storePassword = props.MYAPP_RELEASE_STORE_PASSWORD || "";
  if (!alias) throw new Error("keystore.properties: MYAPP_RELEASE_KEY_ALIAS пуст");
  if (!storePassword) throw new Error("keystore.properties: MYAPP_RELEASE_STORE_PASSWORD пуст");
  const candidates = [path.join(root, "app", storeFile), path.join(root, storeFile)].filter((file) =>
    fs.existsSync(file),
  );
  if (!candidates.length) throw new Error(`Release keystore не найден: ${storeFile}`);
  return { keystorePath: candidates[0], alias, storePassword };
}

function keytoolCommand() {
  const isWin = process.platform === "win32";
  const fromHome = process.env.JAVA_HOME
    ? path.join(process.env.JAVA_HOME, "bin", isWin ? "keytool.exe" : "keytool")
    : "";
  const candidates = [fromHome, "C:\\Program Files\\Java\\jdk-17\\bin\\keytool.exe", "keytool"].filter(Boolean);
  return candidates.find((cmd) => cmd === "keytool" || fs.existsSync(cmd)) || "keytool";
}

/** Facebook Key Hash = base64(SHA-1(DER-сертификат release-keystore)). */
function readKeyHash(root) {
  const { keystorePath, alias, storePassword } = resolveKeystore(root);
  const stdout = execFileSync(
    keytoolCommand(),
    [
      "-exportcert",
      "-alias",
      alias,
      "-keystore",
      path.basename(keystorePath),
      "-storepass",
      storePassword,
    ],
    {
      cwd: path.dirname(keystorePath),
      windowsHide: true,
      encoding: "buffer",
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  const der = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  return crypto.createHash("sha1").update(der).digest("base64");
}

/** FB Class Name: `<namespace>.MainActivity` (namespace из app/build.gradle). */
function readClassName(root) {
  const gradle = project.readText(project.gradlePath(root));
  const namespace = project.pick(gradle, /namespace\s*=?\s*["']([^"']+)["']/);
  if (!namespace) throw new Error("namespace не найден в app/build.gradle");
  return `${namespace}.MainActivity`;
}

/** Facebook Key Hash + FB Class Name в поля задачи Jira. */
async function pushFacebookJira(root, meta) {
  if (meta && meta.jiraFb === false) {
    return { ok: true, skipped: true, details: "jiraFb=false" };
  }
  const className = readClassName(root);
  const keyHash = readKeyHash(root);
  const hashField = String((meta && meta.jiraFbHashField) || FB_HASH_FIELD).trim();
  const classField = String((meta && meta.jiraFbClassField) || FB_CLASS_FIELD).trim();
  const posted = await jira.setIssueFields(root, meta, {
    [hashField]: keyHash,
    [classField]: className,
  });
  return {
    ok: true,
    keyHash,
    className,
    details: `${posted.issueKey}: FB hash ${keyHash} · FB Class Name ${className}`,
  };
}

module.exports = {
  postGameDescription,
  pushFacebookJira,
  buildParagraph,
  collectGameCopy,
  readKeyHash,
  readClassName,
  FB_HASH_FIELD,
  FB_CLASS_FIELD,
};
