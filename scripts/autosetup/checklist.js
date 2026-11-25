const path = require("path");
const project = require("./project");
const linkCrypto = require("./linkCrypto");
const webview = require("./webviewPayload");
const gitSync = require("./gitSync");
const { readObfuscation } = require("./obfuscation");

function readMetadata(root) {
  const gradle = project.readText(project.gradlePath(root));
  const strings = project.readText(project.stringsPath(root));
  return {
    applicationId: project.pick(gradle, /applicationId\s*=?\s*["']([^"']+)["']/),
    namespace: project.pick(gradle, /namespace\s*=?\s*["']([^"']+)["']/),
    versionCode: project.pick(gradle, /\bversionCode\s*=?\s*(\d+)/),
    versionName: project.pick(gradle, /\bversionName\s*=?\s*["']([^"']+)["']/),
    appName: project.pick(strings, /<string\s+name="app_name">([^<]*)<\/string>/),
  };
}

function printChecklist(root, meta) {
  const info = readMetadata(root);
  const workerDir = project.findWorkerDir(root);
  const payload = webview.payloadInfo(root);
  const obf = readObfuscation(root);
  const link = linkCrypto.getLinkPlain(root);
  const protocol = meta.cfProtocol || {};

  console.log("\n========== Autosetup: готово ==========");
  console.log(`project:       ${root}`);
  console.log(`jiraIssue:     ${meta.jiraIssue || "(n/a)"}`);
  console.log(`appName:       ${info.appName}`);
  console.log(`applicationId: ${info.applicationId}`);
  console.log(`namespace:     ${info.namespace}`);
  console.log(`version:       ${info.versionCode} / ${info.versionName}`);
  console.log(`worker:        ${workerDir || "—"}`);
  console.log(`workerUrl:     ${link || "— (LINK_HEX не расшифрован)"}`);
  console.log(
    `cf-protocol:   ${protocol.cookieName || "—"} / ${protocol.headerName || "—"} / ${protocol.path || "—"}`,
  );
  console.log(
    `webview:       ${payload.exists ? `assets/${payload.asset} (${payload.size} B)` : "нет assets payload"}`,
  );
  console.log(`icon:          ${meta.iconSource || "—"}`);
  console.log(`git origin:    ${gitSync.readOrigin(root) || "— (шаг git не привязан)"}`);
  console.log(`obfuscation:   R8 ${obf.minify ? "on" : "off"} · StringFog ${obf.stringfog ? "on" : "off"}`);
  console.log(`meta:          ${project.metaPath(root)}`);
  console.log("=======================================\n");

  return { ok: true, details: "summary" };
}

module.exports = { printChecklist, readMetadata };
