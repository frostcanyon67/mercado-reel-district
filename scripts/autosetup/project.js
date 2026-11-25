const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** Repository root: <root>/scripts/autosetup/project.js */
function projectRoot() {
  return path.resolve(__dirname, "..", "..");
}

function exists(target) {
  try {
    return fs.existsSync(target);
  } catch {
    return false;
  }
}

function readText(target) {
  try {
    return fs.readFileSync(target, "utf8");
  } catch {
    return "";
  }
}

function writeText(target, text) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text, "utf8");
}

const GRADLE_FILES = ["app/build.gradle", "app/build.gradle.kts"];

function gradlePath(root) {
  return (
    GRADLE_FILES.map((rel) => path.join(root, rel)).find(exists) ||
    path.join(root, "app", "build.gradle")
  );
}

function stringsPath(root) {
  return path.join(root, "app", "src", "main", "res", "values", "strings.xml");
}

function assetsDir(root) {
  return path.join(root, "app", "src", "main", "assets");
}

function kotlinRoots(root) {
  return [
    path.join(root, "app", "src", "main", "java"),
    path.join(root, "app", "src", "main", "kotlin"),
  ].filter(exists);
}

function walk(dir, filesOut) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return filesOut;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filesOut);
    else filesOut.push(full);
  }
  return filesOut;
}

/** First Kotlin/Java file whose path ends with `suffix`. */
function findFileBySuffix(root, suffix) {
  const wanted = suffix.replace(/\\/g, "/");
  for (const base of kotlinRoots(root)) {
    for (const file of walk(base, [])) {
      if (file.replace(/\\/g, "/").endsWith(wanted)) return file;
    }
  }
  return null;
}

/** First Kotlin/Java file whose content matches `pattern`. */
function findFileByContent(root, pattern) {
  for (const base of kotlinRoots(root)) {
    for (const file of walk(base, [])) {
      if (!/\.(kt|java)$/.test(file)) continue;
      const source = readText(file);
      if (pattern.test(source)) return { file, source };
    }
  }
  return null;
}

function findWorkerDir(root) {
  for (const name of ["cloudflare-worker", "worker"]) {
    const candidate = path.join(root, name);
    if (exists(path.join(candidate, "index.js"))) return candidate;
  }
  return null;
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function pick(text, regex) {
  const match = String(text || "").match(regex);
  return match ? match[1].trim() : "";
}

function metaPath(root) {
  return path.join(root, "meta.json");
}

function readMeta(root) {
  try {
    return JSON.parse(fs.readFileSync(metaPath(root), "utf8"));
  } catch {
    return {};
  }
}

function writeMeta(root, patch) {
  const next = { ...readMeta(root), ...patch };
  writeText(metaPath(root), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

module.exports = {
  projectRoot,
  exists,
  readText,
  writeText,
  gradlePath,
  stringsPath,
  assetsDir,
  kotlinRoots,
  walk,
  findFileBySuffix,
  findFileByContent,
  findWorkerDir,
  sha256,
  pick,
  metaPath,
  readMeta,
  writeMeta,
};
