const fs = require("fs");
const path = require("path");
const project = require("./project");
const { extractArchive, withTempDir, walkFiles, copyFile } = require("./archives");

function resolveMetaPath(root, value) {
  if (!value) return null;
  const target = path.isAbsolute(value) ? value : path.resolve(root, value);
  return project.exists(target) ? target : null;
}

function parseProperties(text) {
  const map = {};
  for (const line of String(text).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return map;
}

function setProperty(source, key, value) {
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(source)) return source.replace(re, `${key}=${value}`);
  return `${source.replace(/\s*$/, "")}\n${key}=${value}\n`;
}

/** Убирает legacy MYAPP_RELEASE_* из gradle.properties (секреты туда больше не пишем). */
function stripLegacySigning(root) {
  const file = path.join(root, "gradle.properties");
  if (!project.exists(file)) return false;
  const source = project.readText(file);
  const next = source.replace(/^MYAPP_RELEASE_[A-Z_]+=.*\r?\n?/gm, "");
  if (next === source) return false;
  project.writeText(file, next);
  return true;
}

/**
 * Подпись release: keystore.properties рядом с app/ (в .gitignore). В CI файл
 * создаётся workflow'ом из GitHub Secrets, поэтому секреты не попадают в git.
 */
function patchSigning(root, signing) {
  const file = path.join(root, "keystore.properties");
  const current = project.exists(file)
    ? project.readText(file)
    : "# Release signing (локально, в .gitignore). CI создаёт файл из GitHub Secrets.\n";
  let next = current;
  const map = {
    storeFile: "MYAPP_RELEASE_STORE_FILE",
    storePassword: "MYAPP_RELEASE_STORE_PASSWORD",
    keyPassword: "MYAPP_RELEASE_KEY_PASSWORD",
    keyAlias: "MYAPP_RELEASE_KEY_ALIAS",
  };
  for (const [field, key] of Object.entries(map)) {
    if (!signing[field]) continue;
    next = setProperty(next, key, signing[field]);
  }
  let changed = false;
  if (!project.exists(file) || next !== current) {
    project.writeText(file, next.endsWith("\n") ? next : `${next}\n`);
    changed = true;
  }
  if (stripLegacySigning(root)) changed = true;
  return changed;
}

/** Jira keystore tar.gz: *.keystore + *.properties (storeFile/storePassword/keyAlias/keyPassword). */
function installKeystoreFromTar(root, tarPath) {
  return withTempDir("autosetup-keystore-", (tmp) => {
    extractArchive(tarPath, tmp);
    const files = walkFiles(tmp);
    const keystore = files.find((file) => /\.keystore$/i.test(file));
    if (!keystore) throw new Error("В keystore tar.gz нет .keystore");
    const props = files
      .filter((file) => /\.properties$/i.test(file))
      .map((file) => parseProperties(project.readText(file)))
      .find((item) => item.keyAlias || item.KEY_ALIAS);
    if (!props) throw new Error("В keystore tar.gz нет .properties с keyAlias");

    const alias = props.keyAlias || props.KEY_ALIAS;
    const storePassword = props.storePassword || props.STORE_PASSWORD;
    const keyPassword = props.keyPassword || props.KEY_PASSWORD || storePassword;
    if (!alias || !storePassword) throw new Error("В .properties нет keyAlias/storePassword");

    fs.mkdirSync(path.join(root, "app"), { recursive: true });
    fs.copyFileSync(keystore, path.join(root, "app", "keystore.keystore"));
    return { alias, storePassword, keyPassword, file: path.basename(keystore) };
  });
}

/**
 * Jira task (keystore tar.gz + google-services.json) или meta.keystore /
 * meta.googleServices / meta.signing:
 *   keystore       -> app/keystore.keystore
 *   googleServices -> app/google-services.json
 *   signing        -> gradle.properties MYAPP_RELEASE_* values
 */
function applyAssets(root, meta, task) {
  const changed = [];
  const signing = { ...(meta.signing || {}) };

  if (task && task.keystoreTar) {
    const keystore = installKeystoreFromTar(root, task.keystoreTar);
    changed.push(`app/keystore.keystore (Jira ${keystore.file})`);
    signing.keyAlias = signing.keyAlias || keystore.alias;
    signing.storePassword = signing.storePassword || keystore.storePassword;
    signing.keyPassword = signing.keyPassword || keystore.keyPassword;
    signing.storeFile = signing.storeFile || "keystore.keystore";
  } else {
    const metaKeystore = resolveMetaPath(root, meta.keystore);
    if (meta.keystore && !metaKeystore) {
      return { ok: false, details: `keystore не найден: ${meta.keystore}` };
    }
    if (metaKeystore) {
      fs.copyFileSync(metaKeystore, path.join(root, "app", "keystore.keystore"));
      changed.push("app/keystore.keystore");
    }
  }

  if (task && task.googleServices) {
    copyFile(task.googleServices, path.join(root, "app", "google-services.json"));
    changed.push("app/google-services.json (Jira)");
  } else {
    const googleServices = resolveMetaPath(root, meta.googleServices);
    if (meta.googleServices && !googleServices) {
      return { ok: false, details: `googleServices не найден: ${meta.googleServices}` };
    }
    if (googleServices) {
      fs.copyFileSync(googleServices, path.join(root, "app", "google-services.json"));
      changed.push("app/google-services.json");
    }
  }

  if (Object.keys(signing).length && patchSigning(root, signing)) {
    changed.push("keystore.properties");
  }

  return {
    ok: true,
    details: changed.length ? `обновлено: ${changed.join(", ")}` : "без изменений",
  };
}

module.exports = { applyAssets };

