const fs = require("fs");
const path = require("path");
const project = require("./project");

const BEGIN = "/* autopad-begin */";
const END = "/* autopad-end */";

function randomName() {
  const consonants = "bcdfghjklmnpqrstvwxz";
  const vowels = "aeiouy";
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += consonants[Math.floor(Math.random() * consonants.length)];
    out += vowels[Math.floor(Math.random() * vowels.length)];
  }
  return out;
}

function kotlinMethod() {
  const name = randomName();
  const arg = randomName();
  const local = randomName();
  return `    private fun ${name}(${arg}: Int): Int {\n        val ${local} = ${arg} + ${Math.floor(Math.random() * 90) + 1}\n        return ${local}\n    }`;
}

function javaMethod() {
  const name = randomName();
  const arg = randomName();
  const local = randomName();
  return `    private int ${name}(int ${arg}) {\n        int ${local} = ${arg} + ${Math.floor(Math.random() * 90) + 1};\n        return ${local};\n    }`;
}

function stripBlock(source) {
  const start = source.indexOf(BEGIN);
  if (start < 0) return source;
  const end = source.indexOf(END, start);
  if (end < 0) return source;
  return source.slice(0, start) + source.slice(end + END.length);
}

/** Блок уже стоит в конце файла (новая схема: отдельный top-level object/class). */
function isBlockAtEnd(source) {
  const end = source.indexOf(END);
  return end >= 0 && source.slice(end + END.length).trim() === "";
}

/**
 * Padding всегда добавляется отдельным top-level объявлением:
 *   Kotlin: private object PadXxxx { private fun ... }
 *   Java:   final class PadXxxx { private int ... }
 * Вставлять `private fun` внутрь чужой функции нельзя (local function),
 * поэтому старый вариант «перед последней }» больше не используется.
 */
function padBlock(file) {
  const isKotlin = file.endsWith(".kt");
  const count = 3 + Math.floor(Math.random() * 8);
  const methods = [];
  for (let i = 0; i < count; i++) methods.push(isKotlin ? kotlinMethod() : javaMethod());
  const name = `Pad${randomName()}${Math.random().toString(36).slice(2, 6)}`;
  if (isKotlin) {
    return `/* autopad-begin */\nprivate object ${name} {\n${methods.join("\n")}\n}\n/* autopad-end */\n`;
  }
  return `/* autopad-begin */\nfinal class ${name} {\n${methods.join("\n")}\n}\n/* autopad-end */\n`;
}

function padFile(file) {
  let source = fs.readFileSync(file, "utf8");
  source = stripBlock(source).replace(/\s+$/, "");
  const block = padBlock(file);
  fs.writeFileSync(file, `${source}\n\n${block}`, "utf8");
  return true;
}

/**
 * Random private-method padding between autopad markers in every Kotlin/Java
 * source file. Блок в конце файла считается актуальным; блок внутри тела
 * (старый формат) автоматически переносится в отдельный top-level object.
 * `options.force` перегенерирует блок даже в актуальных файлах.
 */
function padMethods(root, options = {}) {
  const targets = [];
  for (const dir of project.kotlinRoots(root)) project.walk(dir, targets);
  if (!targets.length) return { ok: false, details: "app/src/main/java|kotlin не найден" };

  let padded = 0;
  let kept = 0;
  for (const file of targets) {
    if (!/\.(kt|java)$/.test(file)) continue;
    if (/[\\/](BuildConfig|R)\.(java|kt)$/.test(file)) continue;
    try {
      const source = fs.readFileSync(file, "utf8");
      if (!options.force && source.includes(BEGIN) && isBlockAtEnd(source)) {
        kept += 1;
        continue;
      }
      if (padFile(file)) padded += 1;
    } catch {
      // skip unreadable
    }
  }

  return {
    ok: true,
    details: `добавлено: ${padded}, уже были: ${kept}`,
  };
}

module.exports = { padMethods, padFile };
