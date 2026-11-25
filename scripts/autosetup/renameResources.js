/**
 * Шаг `rename-resources`: переименовывает файлы ресурсов приложения
 * (drawable, mipmap, xml, raw, font) в случайные имена и обновляет ссылки:
 *   - `@drawable/name`, `@mipmap/name`, `@xml/name`, `@raw/name`, `@font/name`
 *     (все res XML + AndroidManifest.xml);
 *   - `R.drawable.name`, `R.mipmap.name`, `R.xml.name`, `R.raw.name`, `R.font.name`
 *     (.kt/.java).
 *
 * Имена иконок (`ic_launcher*`, `playstore-icon`) не трогаются — их пишет шаг
 * `icons` и на них ссылается манифест. Ресурсы `values/*` (строки/цвета/стили)
 * не переименовываются. Предыдущая карта хранится в `meta.renamedResources`,
 * чтобы при следующем прогоне убрать устаревшие копии.
 *
 * Отключается: `meta.renameResources = false` или `--no-rename-resources`.
 */

const fs = require("fs");
const path = require("path");
const project = require("./project");

const TYPES = new Set(["drawable", "mipmap", "xml", "raw", "font"]);
const KEEP_PREFIXES = ["ic_launcher", "playstore-icon", "playstore_icon"];
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const ALNUM = "abcdefghijklmnopqrstuvwxyz0123456789";

function typeOfDir(dirName) {
  const base = String(dirName).split("-")[0];
  return TYPES.has(base) ? base : "";
}

function stemOf(fileName) {
  return String(fileName).replace(/\.9\.png$/i, "").replace(/\.[^.]+$/, "");
}

function randomResourceName() {
  const length = 6 + Math.floor(Math.random() * 6);
  let out = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  for (let i = 1; i < length; i += 1) {
    out += ALNUM[Math.floor(Math.random() * ALNUM.length)];
  }
  return out;
}

function resRoot(root) {
  return path.join(root, "app", "src", "main", "res");
}

function collectResourceFiles(root) {
  const dir = resRoot(root);
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const type = typeOfDir(entry.name);
    if (!type) continue;
    const absDir = path.join(dir, entry.name);
    for (const file of fs.readdirSync(absDir)) {
      const abs = path.join(absDir, file);
      let stat;
      try {
        stat = fs.statSync(abs);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;
      const name = stemOf(file);
      out.push({
        abs,
        rel: path.relative(root, abs).replace(/\\/g, "/"),
        type,
        name,
        suffix: String(file).slice(name.length),
      });
    }
  }
  return out;
}

function isKept(name) {
  const lower = String(name || "").toLowerCase();
  return KEEP_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/**
 * Убирает копии прошлого прогона, если исходник снова пришёл из `*_source.zip`
 * (тогда файл с прежним случайным именем — дубль). Возвращает удалённые пары.
 */
function dropStaleCopies(meta, files) {
  const prev = (meta && meta.renamedResources) || {};
  const pairs = Array.isArray(prev.pairs) ? prev.pairs : [];
  if (!pairs.length) return [];
  const current = new Set(files.map((item) => `${item.type}/${item.name}`));
  const dropped = [];
  for (const pair of pairs) {
    if (!pair || !pair.type || !pair.from || !pair.to || pair.from === pair.to) continue;
    if (!current.has(`${pair.type}/${pair.from}`)) continue;
    const stale = files.filter((item) => item.type === pair.type && item.name === pair.to);
    for (const item of stale) {
      try {
        fs.rmSync(item.abs, { force: true });
        dropped.push(pair);
      } catch {
        // файл занят — пропускаем
      }
    }
  }
  return dropped;
}

function updateReferences(root, mapping, report) {
  const base = path.join(root, "app", "src", "main");
  const files = [];
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (/\.(xml|kt|java)$/.test(entry.name)) files.push(abs);
    }
  })(base);

  const atRe = /@(drawable|mipmap|xml|raw|font)\/([A-Za-z_][A-Za-z0-9_]*)/g;
  const rRe = /\bR\.(drawable|mipmap|xml|raw|font)\.([A-Za-z_][A-Za-z0-9_]*)/g;
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    let next = source.replace(atRe, (full, type, name) => {
      const to = mapping.get(`${type}/${name}`);
      if (!to || to === name) return full;
      report.refs += 1;
      return `@${type}/${to}`;
    });
    next = next.replace(rRe, (full, type, name) => {
      const to = mapping.get(`${type}/${name}`);
      if (!to || to === name) return full;
      report.refs += 1;
      return `R.${type}.${to}`;
    });
    if (next !== source) project.writeText(file, next);
  }
}

function renameAppResources(root, meta) {
  if (meta && meta.renameResources === false) {
    return { ok: true, skipped: true, details: "renameResources=false" };
  }
  if (meta && meta.maxRandomize === false) {
    return { ok: true, skipped: true, details: "maxRandomize=false" };
  }

  let files = collectResourceFiles(root);
  if (!files.length) return { ok: true, details: "ресурсов для переименования нет" };

  const dropped = dropStaleCopies(meta, files);
  if (dropped.length) files = collectResourceFiles(root);

  const used = new Set(files.map((item) => `${item.type}/${item.name}`));
  const mapping = new Map();
  const pairs = [];
  const renamed = [];

  for (const item of files) {
    if (isKept(item.name)) continue;
    const key = `${item.type}/${item.name}`;
    let nextName = mapping.get(key);
    if (!nextName) {
      do {
        nextName = randomResourceName();
      } while (used.has(`${item.type}/${nextName}`));
      used.add(`${item.type}/${nextName}`);
      mapping.set(key, nextName);
      pairs.push({ type: item.type, from: item.name, to: nextName });
    }
    if (nextName === item.name) continue;
    const dest = path.join(path.dirname(item.abs), `${nextName}${item.suffix}`);
    if (fs.existsSync(dest)) continue;
    fs.renameSync(item.abs, dest);
    renamed.push(path.relative(root, dest).replace(/\\/g, "/"));
  }

  // Ссылки на уже удалённые дубли прошлого прогона должны указывать на новый файл.
  for (const pair of dropped) {
    const target = mapping.get(`${pair.type}/${pair.from}`);
    if (target) mapping.set(`${pair.type}/${pair.to}`, target);
  }

  if (!pairs.length) return { ok: true, details: "нечего переименовывать" };

  const report = { refs: 0 };
  updateReferences(root, mapping, report);

  project.writeMeta(root, {
    renamedResources: { pairs, files: renamed, at: new Date().toISOString() },
  });

  return {
    ok: true,
    details:
      `переименовано ресурсов: ${pairs.length} (файлов ${renamed.length}), обновлено ссылок: ${report.refs}` +
      (dropped.length ? `, убрано прошлых копий: ${dropped.length}` : ""),
  };
}

module.exports = { renameAppResources, collectResourceFiles, randomResourceName };
