const fs = require("fs");
const os = require("os");
const path = require("path");
const project = require("./project");

const DEFAULT_BASE_URL = "https://bandadev.atlassian.net";
const DEFAULT_PROJECT = "ANDROID";
/** Jira "Package name" (для Kotlin-шаблона это applicationId). */
const PACKAGE_FIELD = "customfield_10074";
/** Jira "Adjust Integration Token" (в Kotlin-клиенте не используется). */
const ADJUST_TOKEN_FIELD = "customfield_10356";
/** Jira "Privacy URL" — своя policy на каждый проект/задачу. */
const PRIVACY_URL_FIELD = "customfield_10039";

function trim(value) {
  return value == null ? "" : String(value).trim();
}

/** `Prism Gatefall (Plіnkо Fall)` -> `Prism Gatefall`. */
function appNameFromSummary(summary) {
  const raw = trim(summary);
  if (!raw) return "";
  return raw.replace(/\s*\([^)]*\)\s*$/, "").trim() || raw;
}

/** `4748`, `ANDROID-4748`, `/browse/ANDROID-4748`, `...?selectedIssue=ANDROID-4748`. */
function normalizeIssueKey(raw, projectKey = DEFAULT_PROJECT) {
  const value = trim(raw);
  if (!value) {
    throw new Error(
      "meta.json: укажите jiraIssue (например 4748, ANDROID-4748 или ссылку /browse/ANDROID-4748)",
    );
  }
  const fromUrl =
    value.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/i) ||
    value.match(/[?&]selectedIssue=([A-Z][A-Z0-9]+-\d+)/i);
  const candidate = trim(fromUrl ? fromUrl[1] : value);
  if (/^[A-Z][A-Z0-9]+-\d+$/i.test(candidate)) return candidate.toUpperCase();
  if (/^\d+$/.test(candidate)) return `${projectKey}-${candidate}`;
  throw new Error(
    `meta.json: непонятный jiraIssue «${value}» (ожидается 4748, ANDROID-4748 или ссылка на задачу)`,
  );
}

function jiraAuthHeader(email, token) {
  return `Basic ${Buffer.from(`${email}:${token}`, "utf8").toString("base64")}`;
}

/**
 * Jira creds: meta.json → env → meta.json соседнего проекта (тот же Atlassian).
 * Токен никуда не пишется и не логируется.
 */
function readSiblingJiraCreds(root) {
  let entries = [];
  try {
    entries = fs.readdirSync(path.dirname(root), { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const file = path.join(path.dirname(root), entry.name, "meta.json");
    if (!project.exists(file)) continue;
    try {
      const meta = JSON.parse(fs.readFileSync(file, "utf8"));
      const email = trim(meta.jiraEmail);
      const token = trim(meta.jiraToken || meta.jiraApiToken);
      if (!email || !token) continue;
      return { email, token, baseUrl: trim(meta.jiraBaseUrl), source: file };
    } catch {
      /* not a Jira meta.json */
    }
  }
  return null;
}

function resolveJiraConfig(root, meta) {
  const sibling = readSiblingJiraCreds(root) || {};
  const email = trim(meta.jiraEmail) || trim(process.env.JIRA_EMAIL) || sibling.email || "";
  const token =
    trim(meta.jiraToken || meta.jiraApiToken) || trim(process.env.JIRA_TOKEN) || sibling.token || "";
  const baseUrl = (
    trim(meta.jiraBaseUrl) ||
    trim(process.env.JIRA_BASE_URL) ||
    sibling.baseUrl ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  const projectKey = (trim(meta.jiraProject) || DEFAULT_PROJECT).toUpperCase();
  const issueKey = normalizeIssueKey(meta.jiraIssue || meta.jiraTask, projectKey);

  if (!email) {
    throw new Error(
      "Jira: укажите jiraEmail в meta.json (или env JIRA_EMAIL) — email Atlassian-аккаунта для API token",
    );
  }
  if (!token) {
    throw new Error(
      "Jira: укажите jiraToken в meta.json (или env JIRA_TOKEN) — API token из Atlassian",
    );
  }
  const fromMeta = Boolean(trim(meta.jiraEmail) || trim(meta.jiraToken || meta.jiraApiToken));
  const fromEnv = !fromMeta && Boolean(trim(process.env.JIRA_EMAIL) || trim(process.env.JIRA_TOKEN));
  return {
    email,
    token,
    baseUrl,
    issueKey,
    projectKey,
    credsSource: fromMeta ? "meta.json" : fromEnv ? "env" : sibling.source,
  };
}

function isJiraConfigured(meta) {
  return Boolean(trim(meta?.jiraIssue || meta?.jiraTask));
}

/** Универсальный Jira REST-запрос (GET/POST/PUT) с кредами из meta/env. */
async function jiraRequest(root, meta, method, pathname, body) {
  const cfg = resolveJiraConfig(root, meta);
  const url = `${cfg.baseUrl}${pathname}`;
  const auth = jiraAuthHeader(cfg.email, cfg.token);
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: auth,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new Error(
      `Jira API ${res.status} ${method} ${pathname}: ${String(raw).split(cfg.token).join("***").slice(0, 400)}`,
    );
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Комментарий в задачу Jira (ADF-параграф). */
async function addIssueComment(root, meta, paragraph) {
  const text = String(paragraph || "").trim();
  if (!text) throw new Error("Пустой текст комментария Jira");
  const cfg = resolveJiraConfig(root, meta);
  await jiraRequest(root, meta, "POST", `/rest/api/3/issue/${encodeURIComponent(cfg.issueKey)}/comment`, {
    body: {
      type: "doc",
      version: 1,
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    },
  });
  return { issueKey: cfg.issueKey };
}

/** Обновление полей задачи Jira (PUT /issue/<key>). */
async function setIssueFields(root, meta, fields) {
  const cfg = resolveJiraConfig(root, meta);
  await jiraRequest(root, meta, "PUT", `/rest/api/3/issue/${encodeURIComponent(cfg.issueKey)}`, {
    fields,
  });
  return { issueKey: cfg.issueKey };
}

/** Комментарии задачи (последние maxResults). */
async function listIssueComments(root, meta, maxResults = 100) {
  const cfg = resolveJiraConfig(root, meta);
  const payload = await jiraRequest(
    root,
    meta,
    "GET",
    `/rest/api/3/issue/${encodeURIComponent(cfg.issueKey)}/comment?maxResults=${maxResults}`,
  );
  return Array.isArray(payload?.comments) ? payload.comments : [];
}

async function jiraFetchJson(url, authHeader) {
  const res = await fetch(url, {
    headers: { Authorization: authHeader, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Jira API ${res.status} ${res.statusText}: ${url}` + (body ? `\n${body.slice(0, 400)}` : ""),
    );
  }
  return res.json();
}

async function downloadAttachment(contentUrl, destPath, authHeader) {
  const res = await fetch(contentUrl, {
    headers: { Authorization: authHeader },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Не удалось скачать вложение (${res.status}): ${path.basename(destPath)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return destPath;
}

async function loadJiraIssue(root, meta) {
  const cfg = resolveJiraConfig(root, meta);
  const auth = jiraAuthHeader(cfg.email, cfg.token);
  const fields = ["summary", "attachment", PACKAGE_FIELD, ADJUST_TOKEN_FIELD, PRIVACY_URL_FIELD].join(",");
  const issueUrl =
    `${cfg.baseUrl}/rest/api/3/issue/${encodeURIComponent(cfg.issueKey)}` +
    `?fields=${encodeURIComponent(fields)}`;
  console.log(`[autosetup] Jira: ${cfg.baseUrl} → ${cfg.issueKey} (creds: ${cfg.credsSource})`);
  const issue = await jiraFetchJson(issueUrl, auth);
  return { cfg, auth, issue };
}

function extractFields(issue, issueKey) {
  const fields = issue.fields || {};
  const appName = appNameFromSummary(fields.summary);
  const applicationId = trim(fields[PACKAGE_FIELD]);
  const adjustToken = trim(fields[ADJUST_TOKEN_FIELD]);
  const privacyUrl = trim(fields[PRIVACY_URL_FIELD]);

  if (!appName) throw new Error(`Jira ${issueKey}: пустой summary`);
  if (!applicationId) {
    throw new Error(
      `Jira ${issueKey}: пустое поле Package name (${PACKAGE_FIELD}) — заполните его в задаче`,
    );
  }
  if (!adjustToken) {
    console.warn(`[warn] Jira ${issueKey}: Adjust Integration Token пуст (${ADJUST_TOKEN_FIELD})`);
  }
  return { appName, applicationId, adjustToken, privacyUrl };
}

/**
 * Fetch appName / applicationId (+ adjustToken для справки) and write them into
 * meta.json. `namespace` намеренно не меняется: исходники остаются в
 * com.kFjQzLm.VpRnTx (StringFog/R), меняется только applicationId.
 */
async function syncMetaFromJira(root, meta) {
  const { cfg, auth, issue } = await loadJiraIssue(root, meta);
  const fields = extractFields(issue, cfg.issueKey);

  const next = {
    ...project.readMeta(root),
    jiraIssue: cfg.issueKey,
    appName: fields.appName,
    applicationId: fields.applicationId,
  };
  if (fields.adjustToken) next.adjustToken = fields.adjustToken;
  else delete next.adjustToken;
  if (fields.privacyUrl) next.privacyUrl = fields.privacyUrl;
  else delete next.privacyUrl;
  project.writeText(project.metaPath(root), `${JSON.stringify(next, null, 2)}\n`);

  console.log(`[autosetup] from Jira: appName=${fields.appName}`);
  console.log(`[autosetup] from Jira: applicationId=${fields.applicationId}`);
  if (fields.privacyUrl) {
    console.log(`[autosetup] from Jira: privacyUrl=${fields.privacyUrl}`);
  } else {
    console.warn(`[warn] Jira ${cfg.issueKey}: Privacy URL пуст (${PRIVACY_URL_FIELD})`);
  }
  if (fields.adjustToken) {
    console.log(
      `[autosetup] from Jira: adjustToken=${fields.adjustToken} (в клиенте не используется)`,
    );
  }
  return { cfg, auth, issue, fields, meta: next };
}

function attachmentCreatedMs(att) {
  return Date.parse(att?.created || att?.updated || "") || 0;
}

/** google-services.json / google-services (2).json (firebase-adminsdk-*.json не подходит). */
function isGoogleServicesFilename(name) {
  return /^google-services(?:\s*\(\d+\))?\.json$/i.test(name || "");
}

function pickAttachment(attachments, label, matcher, { optional = false } = {}) {
  const matched = (attachments || []).filter((a) => matcher(a.filename || ""));
  if (matched.length === 0) {
    if (optional) return null;
    throw new Error(
      `Jira: не найден attachment для «${label}» (есть: ${
        (attachments || []).map((a) => a.filename).join(", ") || "—"
      })`,
    );
  }
  matched.sort((a, b) => {
    const byDate = attachmentCreatedMs(b) - attachmentCreatedMs(a);
    if (byDate !== 0) return byDate;
    const num = (n) => {
      const m = String(n || "").match(/\((\d+)\)\s*\.\w+$/);
      return m ? Number(m[1]) : 0;
    };
    return num(b.filename) - num(a.filename);
  });
  if (matched.length > 1) {
    console.warn(
      `[warn] Jira: несколько файлов для «${label}», беру самый новый «${matched[0].filename}»: ` +
        matched.map((a) => a.filename).join(", "),
    );
  }
  return matched[0];
}

/**
 * Download keystore tar.gz / google-services.json / *_source.zip в temp.
 * Иконка PNG и APK пропускаются (icons — вручную, APK не нужен).
 */
async function downloadJiraAssets(root, meta, loaded) {
  const { cfg, auth, issue } = loaded || (await loadJiraIssue(root, meta));
  const attachments = issue.fields?.attachment || [];

  const keystoreAtt = pickAttachment(attachments, "keystore tar.gz", (n) =>
    /\.tar\.gz$/i.test(n),
  );
  const gsAtt = pickAttachment(attachments, "google-services.json", isGoogleServicesFilename);
  const sourceAtt = pickAttachment(
    attachments,
    "_source.zip",
    (n) => /_source/i.test(n) && /\.zip$/i.test(n),
    { optional: true },
  );

  const iconAtt = pickAttachment(
    attachments,
    "icon PNG",
    (n) => /icon/i.test(n) && /\.png$/i.test(n),
    { optional: true },
  );
  if (!sourceAtt) {
    console.warn(
      "[warn] Jira: нет *_source.zip — шаг game пропущен (игра/исходники останутся текущими)",
    );
  }
  if (!iconAtt) {
    console.warn("[warn] Jira: нет icon PNG — mipmaps останутся из *_source.zip");
  }

  const cacheDir = path.join(
    os.tmpdir(),
    `autosetup-jira-${cfg.issueKey.replace(/[^\w.-]+/g, "_")}-${Date.now()}`,
  );
  fs.mkdirSync(cacheDir, { recursive: true });

  const keystoreTar = path.join(cacheDir, keystoreAtt.filename);
  const googleServices = path.join(cacheDir, "google-services.json");
  const sourceZip = sourceAtt ? path.join(cacheDir, sourceAtt.filename) : null;
  const iconPng = iconAtt ? path.join(cacheDir, "jira-icon.png") : null;

  await downloadAttachment(keystoreAtt.content, keystoreTar, auth);
  await downloadAttachment(gsAtt.content, googleServices, auth);
  if (sourceZip) await downloadAttachment(sourceAtt.content, sourceZip, auth);
  if (iconPng) await downloadAttachment(iconAtt.content, iconPng, auth);

  console.log(`[autosetup] keystore: ${path.basename(keystoreTar)}`);
  console.log(`[autosetup] google-services: ${path.basename(googleServices)}`);
  if (sourceZip) console.log(`[autosetup] source: ${path.basename(sourceZip)}`);
  if (iconPng) console.log(`[autosetup] icon: ${iconAtt.filename}`);

  return {
    issueKey: cfg.issueKey,
    cacheDir,
    task: {
      dir: cacheDir,
      keystoreTar,
      googleServices,
      sourceZip,
      iconPng,
      iconName: iconAtt ? iconAtt.filename : null,
    },
    async cleanup() {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    },
  };
}

function jiraAdfToPlainText(node, acc = []) {
  if (node == null) return acc;
  if (typeof node === "string") {
    acc.push(node);
    return acc;
  }
  if (Array.isArray(node)) {
    for (const item of node) jiraAdfToPlainText(item, acc);
    return acc;
  }
  if (typeof node === "object") {
    if (typeof node.text === "string") acc.push(node.text);
    if (Array.isArray(node.content)) jiraAdfToPlainText(node.content, acc);
  }
  return acc;
}

/** Allowed TLD/blocklist for the Worker URL. */
const JIRA_CLOUDFLARE_HOST_BLOCKLIST = new Set([
  "atlassian.net",
  "atlassian.com",
  "jira.com",
  "github.com",
  "githubusercontent.com",
  "gitlab.com",
  "google.com",
  "googleapis.com",
  "gstatic.com",
  "facebook.com",
  "fb.com",
  "apple.com",
  "microsoft.com",
  "localhost",
  "workers.dev",
]);

const JIRA_CLOUDFLARE_ALLOWED_TLD = new Set([
  "xyz", "com", "net", "org", "info", "online", "site", "store", "app", "io", "cc", "top",
  "pro", "club", "space", "fun", "live", "link", "click", "work", "website", "tech", "cloud",
  "page", "me", "co", "tv", "ws", "biz", "shop", "blog", "dev", "art", "icu", "vip", "world",
  "today", "digital", "agency", "network", "systems", "solutions", "services", "company",
  "global", "media", "zone", "one", "life", "run", "host", "pw", "to", "in", "us", "uk", "ru",
  "ua", "pl", "de", "fr", "es", "it", "nl", "eu", "cn", "jp", "kr", "br", "au", "ca", "mx",
  "tr", "id", "sg", "hk", "tw", "vn", "ph", "my", "th", "ae", "sa", "il", "za", "ng", "ke",
  "eg", "ar", "cl", "pe", "co.uk",
]);

function isBlockedCloudflareHost(host) {
  const h = String(host || "")
    .toLowerCase()
    .replace(/^www\./, "");
  if (!h || !h.includes(".")) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return true;
  const parts = h.split(".");
  const tld = parts[parts.length - 1];
  const dual = parts.length >= 2 ? `${parts[parts.length - 2]}.${tld}` : "";
  if (!JIRA_CLOUDFLARE_ALLOWED_TLD.has(tld) && !JIRA_CLOUDFLARE_ALLOWED_TLD.has(dual)) {
    return true;
  }
  for (const blocked of JIRA_CLOUDFLARE_HOST_BLOCKLIST) {
    if (h === blocked || h.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

function extractWorkerHostsFromText(text) {
  const raw = String(text || "");
  if (!raw.trim()) return [];
  const re =
    /(?:(https?):\/\/)?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,68})(?:\/[^\s"'<>]*)?/gi;
  const found = [];
  const seen = new Set();
  let match;
  while ((match = re.exec(raw)) !== null) {
    const hasScheme = Boolean(match[1]);
    const host = String(match[2] || "")
      .toLowerCase()
      .replace(/\.$/, "")
      .replace(/^www\./, "");
    if (!host || isBlockedCloudflareHost(host) || seen.has(host)) continue;
    const atPos = match.index > 0 ? raw[match.index - 1] : "";
    if (atPos === "@") continue;
    seen.add(host);
    found.push({ host, hasScheme });
  }
  found.sort((a, b) => {
    if (a.hasScheme !== b.hasScheme) return a.hasScheme ? -1 : 1;
    const aXyz = a.host.endsWith(".xyz") ? 1 : 0;
    const bXyz = b.host.endsWith(".xyz") ? 1 : 0;
    if (aXyz !== bXyz) return bXyz - aXyz;
    return 0;
  });
  return found.map((item) => item.host);
}

function normalizeWorkerUrlFromHost(host) {
  const h = String(host || "")
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
  return h ? `https://${h}/` : "";
}

/** `nomewetoha.online` / `https://nomewetoha.online/x` → `nomewetoha.online`. */
function hostFromDomainValue(value) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "";
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
    const host = String(url.hostname || "")
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    return host.includes(".") ? host : "";
  } catch {
    return "";
  }
}

/**
 * Комментарий с меткой домена воркера:
 * `[CfWorkerDomain] {"workerDomain":"nomewetoha.online","zoneId":"…","worker1Name":"…","worker1Url":null}`
 * → host из `workerDomain` (fallback `worker1Url` / `worker2Url` / `domain`).
 */
function parseCfWorkerDomainComment(text) {
  const raw = String(text || "");
  const marker = "[CfWorkerDomain]";
  const at = raw.indexOf(marker);
  if (at < 0) return "";
  const rest = raw.slice(at + marker.length);
  const start = rest.indexOf("{");
  if (start < 0) return "";

  // JSON может быть многострочным: ищем парную скобку с учётом строк.
  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;
  for (let i = start; i < rest.length; i += 1) {
    const ch = rest[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return "";

  let payload;
  try {
    payload = JSON.parse(rest.slice(start, end + 1));
  } catch {
    return "";
  }
  const candidates = [payload.workerDomain, payload.worker1Url, payload.worker2Url, payload.domain];
  for (const value of candidates) {
    const host = hostFromDomainValue(value);
    if (host) return host;
  }
  return "";
}

/** Комментарии задачи текстом, новые первыми. */
async function issueCommentTexts(cfg) {
  const auth = jiraAuthHeader(cfg.email, cfg.token);
  const commentsUrl =
    `${cfg.baseUrl}/rest/api/3/issue/${encodeURIComponent(cfg.issueKey)}/comment` +
    `?maxResults=100`;
  const payload = await jiraFetchJson(commentsUrl, auth);
  const comments = Array.isArray(payload?.comments) ? payload.comments : [];
  const sorted = [...comments].sort((a, b) => {
    const ta = Date.parse(a?.created || "") || 0;
    const tb = Date.parse(b?.created || "") || 0;
    return tb - ta;
  });
  return sorted.map((comment) => {
    const body = comment?.body;
    const text =
      Array.isArray(body) || (body && typeof body === "object")
        ? jiraAdfToPlainText(body).join("\n")
        : String(body || "");
    return { text, created: String(comment?.created || "") };
  });
}

/**
 * Домен воркера только из маркера `[CfWorkerDomain]` (новые комментарии первыми).
 * Soft-fail: { ok: false } без исключений.
 */
async function fetchJiraCfWorkerDomainUrl(root, meta) {
  let cfg;
  try {
    cfg = resolveJiraConfig(root, meta);
  } catch (error) {
    return { ok: false, details: error instanceof Error ? error.message : String(error) };
  }
  try {
    const comments = await issueCommentTexts(cfg);
    for (const comment of comments) {
      const host = parseCfWorkerDomainComment(comment.text);
      if (!host) continue;
      return {
        ok: true,
        url: normalizeWorkerUrlFromHost(host),
        host,
        issueKey: cfg.issueKey,
        details: `[CfWorkerDomain]: ${host} → ${normalizeWorkerUrlFromHost(host)}`,
      };
    }
    return {
      ok: false,
      issueKey: cfg.issueKey,
      details: `в ${cfg.issueKey} нет комментария [CfWorkerDomain]`,
    };
  } catch (error) {
    return { ok: false, details: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Комментарии задачи (новые первыми): сначала домен из `[CfWorkerDomain]`,
 * иначе первый домен вида vahobejeqi.shop → https://vahobejeqi.shop/.
 * Soft-fail: { ok: false } без исключений.
 */
async function fetchJiraCloudflareWorkerUrl(root, meta) {
  const marked = await fetchJiraCfWorkerDomainUrl(root, meta);
  if (marked.ok) return marked;

  let cfg;
  try {
    cfg = resolveJiraConfig(root, meta);
  } catch (error) {
    return { ok: false, details: error instanceof Error ? error.message : String(error) };
  }

  try {
    const comments = await issueCommentTexts(cfg);
    for (const comment of comments) {
      const hosts = extractWorkerHostsFromText(comment.text);
      if (hosts.length > 0) {
        const host = hosts[0];
        const url = normalizeWorkerUrlFromHost(host);
        return {
          ok: true,
          url,
          host,
          issueKey: cfg.issueKey,
          details: `Найдено: ${host} → ${url}`,
        };
      }
    }

    return {
      ok: false,
      issueKey: cfg.issueKey,
      details: `В ${cfg.issueKey} нет [CfWorkerDomain] и нет ссылки вида cipherijfjd.xyz (просмотрено комментариев: ${comments.length}).`,
    };
  } catch (error) {
    return { ok: false, details: error instanceof Error ? error.message : String(error) };
  }
}

module.exports = {
  syncMetaFromJira,
  downloadJiraAssets,
  fetchJiraCloudflareWorkerUrl,
  fetchJiraCfWorkerDomainUrl,
  parseCfWorkerDomainComment,
  loadJiraIssue,
  isJiraConfigured,
  resolveJiraConfig,
  normalizeIssueKey,
  appNameFromSummary,
  extractWorkerHostsFromText,
  normalizeWorkerUrlFromHost,
  isBlockedCloudflareHost,
  jiraAdfToPlainText,
  jiraRequest,
  addIssueComment,
  setIssueFields,
  listIssueComments,
  PACKAGE_FIELD,
  ADJUST_TOKEN_FIELD,
  PRIVACY_URL_FIELD,
};
