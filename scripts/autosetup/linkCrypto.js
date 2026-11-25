const bf = require("./blowfish");
const project = require("./project");

function readCredentials(root) {
  const blowfishFile =
    project.findFileBySuffix(root, "crypto/Blowfish.kt") ||
    project.findFileBySuffix(root, "Blowfish.kt");
  const source = project.readText(blowfishFile || "");
  return {
    file: blowfishFile,
    source,
    key: project.pick(source, /KEY_STRING\s*=\s*"([^"]*)"/),
    iv: project.pick(source, /IV_STRING\s*=\s*"([^"]*)"/),
  };
}

function readConstants(root) {
  const constantsFile =
    project.findFileBySuffix(root, "core/AppConstants.kt") ||
    project.findFileBySuffix(root, "AppConstants.kt");
  const source = project.readText(constantsFile || "");
  return {
    file: constantsFile,
    source,
    linkHex: project.pick(source, /LINK_HEX\s*=\s*\n?\s*"([0-9A-Fa-f]+)"/),
  };
}

function decryptHex(hex, key, iv) {
  const normalized = String(hex || "").trim();
  if (!normalized || normalized.length % 2 !== 0) return "";
  try {
    const bytes = bf.hexToBytes(normalized);
    const plain = bf.decryptBytes(
      Buffer.from(bytes),
      Buffer.from(String(key), "utf8"),
      Buffer.from(String(iv), "utf8"),
    );
    return Buffer.from(plain).toString("utf8");
  } catch {
    return "";
  }
}

function encryptHex(plain, key) {
  return bf.encryptHex(plain, Buffer.from(String(key), "utf8"));
}

function patchLinkHex(source, hex) {
  return source.replace(/(LINK_HEX\s*=\s*\n?\s*)"[0-9A-Fa-f]*"/, `$1"${hex}"`);
}

function getLinkPlain(root) {
  const credentials = readCredentials(root);
  const constants = readConstants(root);
  if (!credentials.key || !credentials.iv || !constants.linkHex) return "";
  return decryptHex(constants.linkHex, credentials.key, credentials.iv);
}

/** meta.cloudflareUrl -> LINK_HEX (Blowfish-CBC, current key/IV). */
function applyLink(root, meta) {
  const url = String(meta.cloudflareUrl || "").trim();
  if (!url) return { ok: true, details: "cloudflareUrl не задан — пропуск" };
  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, details: "cloudflareUrl должен начинаться с http:// или https://" };
  }

  const credentials = readCredentials(root);
  if (!credentials.file) return { ok: false, details: "crypto/Blowfish.kt не найден" };
  if (!credentials.key || !credentials.iv) {
    return { ok: false, details: "KEY_STRING / IV_STRING не найдены" };
  }

  const constants = readConstants(root);
  if (!constants.file) return { ok: false, details: "core/AppConstants.kt не найден" };
  if (!constants.linkHex) return { ok: false, details: "LINK_HEX не найден" };

  const hex = encryptHex(url, credentials.key);
  const verified = decryptHex(hex, credentials.key, credentials.iv);
  if (verified !== url) return { ok: false, details: "проверка перешифровки LINK_HEX не прошла" };

  const patched = patchLinkHex(constants.source, hex);
  if (patched === constants.source) return { ok: false, details: "LINK_HEX не изменён" };
  project.writeText(constants.file, patched);
  return {
    ok: true,
    details: `LINK_HEX ← ${url} (Blowfish, ${hex.length / 2} байт)`,
  };
}

module.exports = {
  readCredentials,
  readConstants,
  decryptHex,
  encryptHex,
  patchLinkHex,
  getLinkPlain,
  applyLink,
};
