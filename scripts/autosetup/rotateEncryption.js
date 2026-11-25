const crypto = require("crypto");
const path = require("path");
const project = require("./project");
const linkCrypto = require("./linkCrypto");

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomToken(length) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

function patchBlowfishKt(source, key, iv) {
  return source
    .replace(/(KEY_STRING\s*=\s*)"[^"]*"/, `$1"${key}"`)
    .replace(/(IV_STRING\s*=\s*)"[^"]*"/, `$1"${iv}"`);
}

function patchWorkerIndex(source, key, iv) {
  return source
    .replace(
      /(BLOWFISH_KEY\s*=\s*new TextEncoder\(\)\.encode\()"[^"]*"(\))/,
      `$1"${key}"$2`,
    )
    .replace(
      /(BLOWFISH_IV\s*=\s*new TextEncoder\(\)\.encode\()"[^"]*"(\))/,
      `$1"${iv}"$2`,
    );
}

/**
 * New Blowfish-CBC credentials for the whole project: crypto/Blowfish.kt,
 * core/AppConstants.kt (LINK_HEX), cloudflare-worker/index.js (the worker is
 * self-contained — Blowfish is inlined, so there is no separate blowfish.js).
 * The plaintext URL never leaves this function.
 */
function rotateEncryption(root, meta) {
  const credentials = linkCrypto.readCredentials(root);
  if (!credentials.file) return { ok: false, details: "crypto/Blowfish.kt не найден" };
  if (!credentials.key || !credentials.iv) {
    return { ok: false, details: "KEY_STRING / IV_STRING не найдены" };
  }
  const constants = linkCrypto.readConstants(root);
  if (!constants.file) return { ok: false, details: "core/AppConstants.kt не найден" };

  let plain = linkCrypto.decryptHex(constants.linkHex, credentials.key, credentials.iv);
  if (!plain && meta && meta.cloudflareUrl) plain = String(meta.cloudflareUrl).trim();
  if (!plain || !/^https?:\/\//i.test(plain)) {
    return {
      ok: false,
      details: "LINK_HEX не расшифрован текущим ключом (задайте cloudflareUrl в meta.json)",
    };
  }

  const key = randomToken(16);
  const iv = randomToken(8);

  const hex = linkCrypto.encryptHex(plain, key);
  if (linkCrypto.decryptHex(hex, key, iv) !== plain) {
    return { ok: false, details: "проверка ротации не прошла" };
  }

  const updated = [];

  const blowfishSource = project.readText(credentials.file);
  const patchedBlowfish = patchBlowfishKt(blowfishSource, key, iv);
  if (patchedBlowfish !== blowfishSource) {
    project.writeText(credentials.file, patchedBlowfish);
    updated.push("crypto/Blowfish.kt");
  }

  const patchedConstants = linkCrypto.patchLinkHex(constants.source, hex);
  if (patchedConstants !== constants.source) {
    project.writeText(constants.file, patchedConstants);
    updated.push("core/AppConstants.kt");
  }

  const workerDir = project.findWorkerDir(root);
  if (workerDir) {
    const workerIndex = `${workerDir}/index.js`;
    if (project.exists(workerIndex)) {
      const source = project.readText(workerIndex);
      const next = patchWorkerIndex(source, key, iv);
      if (next !== source) {
        project.writeText(workerIndex, next);
        updated.push(`${path.basename(workerDir)}/index.js`);
      }
    }
  }

  const dexOpener = project.findFileBySuffix(root, "dex/DexOpener.kt");
  const payloadRel =
    project.pick(project.readText(dexOpener || ""), /WEBVIEW_PAYLOAD_ASSET\s*=\s*"([^"]+)"/) ||
    "webview/payload.bin";
  const payloadAsset = path.join(project.assetsDir(root), payloadRel);

  return {
    ok: true,
    updated,
    key,
    iv,
    details:
      `key=${key} iv=${iv}` +
      (project.exists(payloadAsset)
        ? " (webview payload в assets не затронут: AES-GCM, отдельный ключ)"
        : ""),
  };
}

module.exports = { rotateEncryption, randomToken };
