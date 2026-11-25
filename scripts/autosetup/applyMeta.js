const path = require("path");
const project = require("./project");
const brand = require("./brand");

const escapeXml = brand.escapeXml;

function patchGradle(source, meta) {
  let next = source;
  if (meta.applicationId) {
    next = next.replace(
      /(applicationId\s*=?\s*)["'][^"']*["']/,
      `$1"${meta.applicationId}"`,
    );
  }
  if (meta.namespace && meta.allowNamespaceChange === true) {
    // Off by default: namespace == source package, changing it without moving
    // app/src/main/java breaks `import ...R` and StringFog fogPackages.
    next = next.replace(/(namespace\s*=?\s*)["'][^"']*["']/, `$1"${meta.namespace}"`);
  }
  if (meta.versionCode != null && String(meta.versionCode) !== "") {
    next = next.replace(/(\bversionCode\s*=?\s*)\d+/, `$1${Number(meta.versionCode)}`);
  }
  if (meta.versionName) {
    next = next.replace(/(\bversionName\s*=?\s*)["'][^"']*["']/, `$1"${meta.versionName}"`);
  }
  return next;
}

/**
 * app_name + app_title (UPPER CASE) и остальные брендовые строки — чтобы имя
 * менялось и на лоадере, и на главном экране игры, а не только в лаунчере.
 */
function patchStrings(source, appName) {
  const base = String(source || "").trim() || "<resources>\n</resources>\n";
  return brand.applyBrandName(base, appName).xml;
}

/**
 * meta.json -> app/build.gradle(.kts) + res/values/strings.xml
 * Same fields the helper writes by hand: appName / applicationId / namespace /
 * versionCode / versionName.
 */
function applyMeta(root, meta) {
  const changed = [];

  const gradleFile = project.gradlePath(root);
  if (!project.exists(gradleFile)) {
    return { ok: false, details: `не найден ${path.relative(root, gradleFile)}` };
  }
  const gradle = project.readText(gradleFile);
  const gradleNext = patchGradle(gradle, meta);
  if (gradleNext !== gradle) {
    project.writeText(gradleFile, gradleNext);
    for (const field of ["applicationId", "namespace", "versionCode", "versionName"]) {
      if (meta[field] != null && String(meta[field]) !== "") changed.push(field);
    }
  }

  if (meta.appName) {
    const stringsFile = project.stringsPath(root);
    const strings = project.readText(stringsFile);
    const stringsNext = patchStrings(strings, meta.appName);
    if (stringsNext !== strings) {
      project.writeText(stringsFile, stringsNext);
      changed.push("appName");
    }
  }

  return {
    ok: true,
    changed,
    details: changed.length ? `обновлено: ${changed.join(", ")}` : "без изменений",
  };
}

module.exports = { applyMeta, escapeXml };
