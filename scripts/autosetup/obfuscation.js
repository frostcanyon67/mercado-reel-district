const project = require("./project");

function readObfuscation(root) {
  const gradle = project.readText(project.gradlePath(root));
  return {
    minify: /enableProguardInReleaseBuilds\s*=\s*true/.test(gradle),
    stringfog: /stringfog\s*\{[\s\S]*?\benable\s+true/.test(gradle),
  };
}

/** meta.obfuscation = { minify: bool, stringfog: bool } (R8 / StringFog). */
function applyObfuscation(root, meta) {
  const options = (meta && meta.obfuscation) || {};
  const changed = [];
  const file = project.gradlePath(root);
  let text = project.readText(file);
  const original = text;

  if (typeof options.minify === "boolean") {
    text = text.replace(
      /(enableProguardInReleaseBuilds\s*=\s*)(true|false)/,
      `$1${options.minify}`,
    );
    if (text !== original) changed.push("minify");
  }
  if (typeof options.stringfog === "boolean") {
    text = text.replace(/(stringfog\s*\{[\s\S]*?\benable\s+)(true|false)/, `$1${options.stringfog}`);
    if (text !== original) changed.push("stringfog");
  }

  if (text !== original) project.writeText(file, text);

  const state = readObfuscation(root);
  return {
    ok: true,
    details:
      (changed.length ? `обновлено: ${changed.join(", ")} · ` : "без изменений · ") +
      `R8: ${state.minify ? "on" : "off"} · StringFog: ${state.stringfog ? "on" : "off"}`,
  };
}

module.exports = { applyObfuscation, readObfuscation };
