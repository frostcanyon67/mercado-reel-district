const fs = require("fs");
const path = require("path");
const project = require("./project");

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

function word(min = 4, max = 8) {
  const length = min + Math.floor(Math.random() * (max - min + 1));
  let out = "";
  for (let i = 0; i < length; i++) out += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return out;
}

function shuffle(values) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomProtocol() {
  const codes = shuffle([1, 2, 3, 4, 5, 6]);
  return {
    path: "/" + word(5, 9),
    cookieName: word(5, 8),
    headerName: "X-" + word(5, 8).replace(/^./, (c) => c.toUpperCase()),
    bodyField: word(1, 2),
    dummyBodyKeys: shuffle([word(4, 7), word(4, 7), word(4, 7)]),
    extraQuery: [
      [word(2, 3), word(3, 5)],
      [word(2, 3), word(3, 5)],
      [word(2, 3), word(3, 5)],
    ],
    responseCodes: {
      redirectUrl: codes[0],
      redirectUrlInitial: codes[1],
      error: codes[2],
      blockUser: codes[3],
    },
  };
}

function patchKotlin(root, protocol) {
  const file =
    project.findFileBySuffix(root, "net/CfFields.kt") ||
    project.findFileBySuffix(root, "CfFields.kt");
  if (!file || !fs.existsSync(file)) return false;

  let source = fs.readFileSync(file, "utf8");
  source = source
    .replace(/(const val COOKIE_NAME = )"[^"]*"/, `$1"${protocol.cookieName}"`)
    .replace(/(const val HEADER_NAME = )"[^"]*"/, `$1"${protocol.headerName}"`)
    .replace(/(const val PATH = )"[^"]*"/, `$1"${protocol.path}"`)
    .replace(/(const val BODY_FIELD = )"[^"]*"/, `$1"${protocol.bodyField}"`);

  const dummies = protocol.dummyBodyKeys.map((key) => `"${key}"`).join(", ");
  source = source.replace(/val dummyBodyKeys = arrayOf\([^)]*\)/, `val dummyBodyKeys = arrayOf(${dummies})`);

  const extras = protocol.extraQuery.map(([key, value]) => `"${key}" to "${value}"`).join(", ");
  source = source.replace(/val extraQuery = linkedMapOf\([^)]*\)/, `val extraQuery = linkedMapOf(${extras})`);

  const codes = Object.entries(protocol.responseCodes)
    .map(([key, value]) => `"${key}" to ${value}`)
    .join(",\n        ");
  source = source.replace(
    /val responseCodes = linkedMapOf\([\s\S]*?\n    \)/,
    `val responseCodes = linkedMapOf(\n        ${codes},\n    )`,
  );

  fs.writeFileSync(file, source, "utf8");
  return true;
}

function patchWorker(root, protocol) {
  const workerDir = project.findWorkerDir(root);
  if (!workerDir) return false;
  const file = path.join(workerDir, "index.js");
  if (!fs.existsSync(file)) return false;

  let source = fs.readFileSync(file, "utf8");
  const begin = source.indexOf("/* cf-protocol-begin */");
  const end = source.indexOf("/* cf-protocol-end */");
  if (begin < 0 || end < 0) return false;

  const current = source.slice(begin, end);
  const objectText = current.replace(/^[\s\S]*?const CF_PROTOCOL = /, "").replace(/;\s*$/, "");
  let parsed;
  try {
    parsed = JSON.parse(objectText);
  } catch {
    return false;
  }

  parsed.path = protocol.path;
  parsed.cookieName = protocol.cookieName;
  parsed.headerName = protocol.headerName;
  parsed.bodyField = protocol.bodyField;
  parsed.dummyBodyKeys = protocol.dummyBodyKeys;
  parsed.extraQuery = Object.fromEntries(protocol.extraQuery);
  parsed.responseCodes = protocol.responseCodes;

  const replacement = `/* cf-protocol-begin */\nconst CF_PROTOCOL = ${JSON.stringify(parsed, null, 2)};\n`;
  source = source.slice(0, begin) + replacement + source.slice(end);
  fs.writeFileSync(file, source, "utf8");
  return true;
}

/**
 * Random wire surface (cookie/header/path/body/dummy keys/query/response codes)
 * in net/CfFields.kt and the worker CF_PROTOCOL block.
 *
 * По умолчанию (`maxRandomize !== false`) значения перегенерируются на каждом
 * прогоне, чтобы релизные AAB отличались. `meta.cfProtocolStable = true` (или
 * `maxRandomize: false`) — штампует значения из `meta.cfProtocol` как раньше.
 * Внимание: после смены протокола воркер нужно передеплоить.
 */
function rotateCfProtocol(root, meta) {
  const stable = Boolean(meta && (meta.cfProtocolStable === true || meta.maxRandomize === false));
  const fromMeta = stable && meta && meta.cfProtocol;
  const protocol = fromMeta && fromMeta.cookieName ? fromMeta : randomProtocol();
  const kotlin = patchKotlin(root, protocol);
  const worker = patchWorker(root, protocol);
  if (!kotlin && !worker) {
    return { ok: false, details: "CfFields.kt / worker CF_PROTOCOL не найдены" };
  }

  if (!fromMeta) project.writeMeta(root, { cfProtocol: protocol });

  return {
    ok: true,
    protocol,
    regenerated: !fromMeta,
    details:
      `cookie=${protocol.cookieName} header=${protocol.headerName} path=${protocol.path} body=${protocol.bodyField}\n` +
      `CfFields.kt: ${kotlin ? "ok" : "skip"} · worker: ${worker ? "ok" : "skip"}` +
      (fromMeta ? "\nзначения из meta.cfProtocol" : "\nновые значения сохранены в meta.cfProtocol"),
  };
}

module.exports = { rotateCfProtocol, randomProtocol };
