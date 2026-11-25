/**
 * Максимальная рандомизация релизного билда между прогонами автосетапа.
 *
 * Что делает шаг `randomize`:
 *  - перегенерирует `app/obfuscator-dict.txt` (R8 нарежет классы/методы/пакеты
 *    новыми именами);
 *  - меняет пакет `-repackageclasses 'com.<rand>.<rand>'` в `app/proguard-rules.pro`
 *    (меняются FQN всех перепакованных классов);
 *  - пишет randomize-метку в meta.json (для аудита прогонов).
 *
 * Отключается: `meta.maxRandomize = false` или `--no-max-randomize`.
 */

const path = require("path");
const project = require("./project");

const KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class",
  "const", "continue", "default", "do", "double", "else", "enum", "extends", "final",
  "finally", "float", "for", "goto", "if", "implements", "import", "instanceof", "int",
  "interface", "long", "native", "new", "package", "private", "protected", "public",
  "return", "short", "static", "strictfp", "super", "switch", "synchronized", "this",
  "throw", "throws", "transient", "try", "void", "volatile", "while", "true", "false",
  "null", "var", "val", "fun", "object", "when", "is", "in", "as", "typealias", "it",
  "field", "method", "interface", "record", "sealed", "yield", "data", "companion",
]);

const LOWER = "abcdefghijklmnopqrstuvwxyz";

function randInt(max) {
  return Math.floor(Math.random() * max);
}

/** Случайное имя: строчные буквы, валидный Java/Kotlin-идентификатор. */
function randomName(min = 6, max = 12) {
  const length = min + randInt(max - min + 1);
  let out = LOWER[randInt(LOWER.length)];
  for (let i = 1; i < length; i++) out += LOWER[randInt(LOWER.length)];
  return out;
}

function dictionaryPath(root) {
  return path.join(root, "app", "obfuscator-dict.txt");
}

/** Полностью новый словарь именования для R8 (классы / методы / поля / пакеты). */
function rotateDictionary(root, meta) {
  const configured = Number(meta && meta.obfuscationDictionarySize);
  const count = Number.isFinite(configured) && configured > 0 ? Math.min(configured, 20000) : 4000;
  const words = new Set();
  for (let guard = 0; words.size < count && guard < count * 50; guard += 1) {
    const word = randomName(6, 12);
    if (!KEYWORDS.has(word)) words.add(word);
  }
  project.writeText(dictionaryPath(root), `${[...words].join("\n")}\n`);
  return { ok: true, count: words.size };
}

function proguardPath(root) {
  return path.join(root, "app", "proguard-rules.pro");
}

/** Случайный пакет для `-repackageclasses` — меняет FQN всех перепакованных классов. */
function rotateRepackage(root) {
  const file = proguardPath(root);
  if (!project.exists(file)) {
    return { ok: false, details: "app/proguard-rules.pro не найден" };
  }
  const source = project.readText(file);
  const packageName = `com.${randomName(6, 9)}.${randomName(5, 8)}`;
  const line = `-repackageclasses '${packageName}'`;
  let next;
  if (/^-repackageclasses.*$/m.test(source)) {
    next = source.replace(/^-repackageclasses.*$/m, line);
  } else if (/# obfuscator-end/.test(source)) {
    next = source.replace(/(# obfuscator-end)/, `${line}\n$1`);
  } else {
    next = `${source.replace(/\s*$/, "")}\n${line}\n`;
  }
  if (next !== source) project.writeText(file, next);
  return { ok: true, packageName, changed: next !== source };
}

/** Шаг автосетапа: новые имена R8 + новый repackage-пакет. */
function randomizeBuildIdentifiers(root, meta) {
  if (meta && meta.maxRandomize === false) {
    return { ok: true, skipped: true, details: "maxRandomize=false — словарь/пакет R8 не менялись" };
  }
  const dictionary = rotateDictionary(root, meta);
  const repackage = rotateRepackage(root);
  const at = new Date().toISOString();
  project.writeMeta(root, {
    randomize: {
      dictionary: dictionary.count,
      repackage: repackage.packageName || "",
      at,
    },
  });
  return {
    ok: repackage.ok,
    details:
      `словарь R8: ${dictionary.count} имён · ` +
      (repackage.ok
        ? `-repackageclasses '${repackage.packageName}'`
        : `repackage: ${repackage.details}`),
  };
}

module.exports = {
  randomizeBuildIdentifiers,
  rotateDictionary,
  rotateRepackage,
  randomName,
  dictionaryPath,
  proguardPath,
};
