const fs = require("fs");
const path = require("path");
const project = require("./project");
const brand = require("./brand");
const { extractArchive, withTempDir, walkFiles, copyFile } = require("./archives");

const SKIP_BASENAMES = new Set(["MainActivity.kt", "MainActivity.java"]);
const TEXT_FILE_RE = /\.(kt|java)$/;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripBom(text) {
  return String(text).replace(/^\uFEFF/, "");
}

function javaDir(root) {
  return path.join(root, "app", "src", "main", "java");
}

function resDir(root) {
  return path.join(root, "app", "src", "main", "res");
}

function backupRoot(root) {
  return path.join(root, ".autosetup-backup");
}

function backupStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/** Копия файла в .autosetup-backup/<stamp>/<rel> перед удалением/перезаписью. */
function backupFile(root, file, stamp) {
  try {
    const rel = path.relative(root, file);
    if (!rel || rel.startsWith("..")) return false;
    const dest = path.join(backupRoot(root), stamp, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    return true;
  } catch {
    return false;
  }
}

/** Оставляет только `keep` последних бэкапов, чтобы каталог не разрастался. */
function pruneBackups(root, keep = 5) {
  try {
    const dir = backupRoot(root);
    if (!fs.existsSync(dir)) return;
    const names = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const name of names.slice(0, Math.max(0, names.length - keep))) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
  } catch {
    // best effort
  }
}

function findMainDir(tmp) {
  const candidates = [
    path.join(tmp, "android", "app", "src", "main"),
    path.join(tmp, "app", "src", "main"),
    path.join(tmp, "src", "main"),
  ];
  return candidates.find((dir) => project.exists(path.join(dir, "java"))) || null;
}

/** package из MainActivity.kt / namespace из build.gradle.kts / путь после java/. */
function detectSourcePackage(mainDir) {
  const javaRoot = path.join(mainDir, "java");
  for (const file of walkFiles(javaRoot)) {
    if (!SKIP_BASENAMES.has(path.basename(file))) continue;
    const pkg = project.pick(project.readText(file), /^\s*package\s+([\w.]+)/m);
    if (pkg) return pkg;
  }
  const gradleFile = [
    path.join(mainDir, "..", "..", "build.gradle.kts"),
    path.join(mainDir, "..", "..", "build.gradle"),
  ].find(project.exists);
  if (gradleFile) {
    const gradle = project.readText(gradleFile);
    const namespace =
      project.pick(gradle, /namespace\s*=?\s*["']([^"']+)["']/) ||
      project.pick(gradle, /applicationId\s*=?\s*["']([^"']+)["']/);
    if (namespace) return namespace;
  }
  const firstFile = walkFiles(javaRoot)[0];
  if (firstFile) {
    const rel = path.relative(javaRoot, firstFile).replace(/\\/g, "/");
    const pkg = rel.split("/").slice(0, -1).join(".");
    if (pkg) return pkg;
  }
  return "";
}

function templateNamespace(root) {
  const gradle = project.readText(project.gradlePath(root));
  return project.pick(gradle, /namespace\s*=?\s*["']([^"']+)["']/);
}

/** Удаляет файлы с тем же именем И расширением во всех density-квалификаторах. */
function removeResourceFile(root, fileName, onRemove) {
  let removed = 0;
  for (const entry of fs.readdirSync(resDir(root), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!/^(drawable|mipmap)/.test(entry.name)) continue;
    const dir = path.join(resDir(root), entry.name);
    for (const file of fs.readdirSync(dir)) {
      if (file !== fileName) continue;
      const target = path.join(dir, file);
      if (onRemove) onRemove(target);
      fs.rmSync(target, { force: true });
      removed += 1;
    }
  }
  return removed;
}

function escapeXml(value) {
  return brand.escapeXml(value);
}

/**
 * strings.xml из source → app_name = meta.appName, app_title = UPPER CASE и
 * остальные брендовые строки, чтобы имя на лоадере/главном экране не осталось
 * от прошлой задачи.
 */
function patchAppName(stringsXml, appName) {
  if (!appName) return stringsXml;
  const base = String(stringsXml || "").trim() || "<resources>\n</resources>\n";
  return brand.applyBrandName(base, appName).xml;
}

function copyResources(mainDir, root, appName, report, onRemove) {
  const srcRes = path.join(mainDir, "res");
  if (!project.exists(srcRes)) return;
  const destRes = resDir(root);
  fs.mkdirSync(destRes, { recursive: true });

  for (const entry of fs.readdirSync(srcRes, { withFileTypes: true })) {
    const src = path.join(srcRes, entry.name);
    if (entry.isDirectory()) {
      if (/^(drawable|mipmap)/.test(entry.name)) {
        const dest = path.join(destRes, entry.name);
        fs.mkdirSync(dest, { recursive: true });
        for (const file of fs.readdirSync(src)) {
          const from = path.join(src, file);
          if (!fs.statSync(from).isFile()) continue;
          removeResourceFile(root, file, onRemove);
          copyFile(from, path.join(dest, file));
          report.resources += 1;
        }
        continue;
      }
      if (entry.name === "xml" || entry.name === "raw" || entry.name === "font") {
        for (const file of walkFiles(src)) {
          copyFile(file, path.join(destRes, entry.name, path.relative(src, file)));
          report.resources += 1;
        }
        continue;
      }
      if (entry.name === "values") {
        for (const file of fs.readdirSync(src)) {
          const from = path.join(src, file);
          if (!fs.statSync(from).isFile()) continue;
          const to = path.join(destRes, "values", file);
          if (file === "strings.xml") {
            project.writeText(to, patchAppName(stripBom(project.readText(from)), appName));
            report.resources += 1;
          } else if (
            !project.exists(to) ||
            file === "themes.xml" ||
            file === "ic_launcher_background.xml"
          ) {
            copyFile(from, to);
            report.resources += 1;
          } else {
            report.skipped.push(`values/${file} (уже есть)`);
          }
        }
      }
      continue;
    }
    if (/^ic_launcher-playstore\.png$/i.test(entry.name)) {
      copyFile(src, path.join(destRes, "playstore-icon.png"));
      report.resources += 1;
    }
  }
}

/** java/** источника → app/src/main/java/<namespace>/** с заменой package/import. */
function copySources(mainDir, root, sourcePackage, namespace, report) {
  const srcJava = path.join(mainDir, "java");
  const pkgDir = path.join(srcJava, ...sourcePackage.split("."));
  if (!project.exists(pkgDir)) {
    return { ok: false, details: `в source.zip нет пакета ${sourcePackage}` };
  }
  const destJava = path.join(javaDir(root), ...namespace.split("."));
  fs.mkdirSync(destJava, { recursive: true });
  const prefixRe = new RegExp(`\\b${escapeRegExp(sourcePackage)}\\b`, "g");

  for (const file of walkFiles(srcJava)) {
    const rel = path.relative(pkgDir, file);
    if (rel.startsWith("..")) {
      report.skipped.push(`java/${path.relative(srcJava, file)} (другой пакет)`);
      continue;
    }
    if (SKIP_BASENAMES.has(path.basename(file))) {
      report.skipped.push(`java/${rel} (activity шаблона)`);
      continue;
    }
    const dest = path.join(destJava, rel);
    if (TEXT_FILE_RE.test(file)) {
      const text = stripBom(fs.readFileSync(file, "utf8")).replace(prefixRe, namespace);
      project.writeText(dest, text);
    } else {
      copyFile(file, dest);
    }
    report.files.push(rel.replace(/\\/g, "/"));
    report.sources += 1;
  }
  return { ok: true };
}

/**
 * Перезаписывает ui/GameHost.kt адаптером: ServiceLocator + AppTheme + AppRoot
 * из импортированного source-проекта. Шаблонный placeholder до этого живёт в
 * том же файле (ui/GameHost.kt).
 */
function writeGameHost(root, namespace) {
  const nsPath = path.join(javaDir(root), ...namespace.split("."));
  const presentation = path.join(nsPath, "presentation");
  const appRootFile = walkFiles(presentation).find(
    (file) =>
      path.basename(file) === "AppRoot.kt" &&
      /fun\s+AppRoot\s*\(/.test(project.readText(file)),
  );
  if (!appRootFile) {
    return { ok: false, details: "presentation/**/AppRoot.kt с fun AppRoot() не найден" };
  }
  const rootPackage = path
    .relative(nsPath, path.dirname(appRootFile))
    .replace(/\\/g, ".")
    .replace(/^\./, "");

  const themeFile = path.join(nsPath, "core", "theme", "Theme.kt");
  const hasTheme =
    project.exists(themeFile) && /fun\s+AppTheme\s*\(/.test(project.readText(themeFile));
  const locatorFile = path.join(nsPath, "core", "di", "ServiceLocator.kt");
  const locatorSource = project.exists(locatorFile) ? project.readText(locatorFile) : "";
  const hasLocator = /object\s+ServiceLocator/.test(locatorSource);
  // Имя метода инициализации у игр разное: init(...) / initialize(...).
  const locatorSetup = hasLocator
    ? (locatorSource.match(/\bfun\s+(init|initialize|setup)\s*\(\s*\w+\s*:\s*Context\s*\)/) || [])[1] || "init"
    : "init";

  const imports = [
    "import androidx.compose.runtime.Composable",
    hasLocator ? "import androidx.compose.ui.platform.LocalContext" : "",
    hasLocator ? `import ${namespace}.core.di.ServiceLocator` : "",
    hasTheme ? `import ${namespace}.core.theme.AppTheme` : "",
    `import ${namespace}.${rootPackage}.AppRoot as GameRoot`,
  ].filter(Boolean);

  const body = [];
  if (hasLocator) body.push("    val context = LocalContext.current.applicationContext");
  if (hasLocator) body.push(`    ServiceLocator.${locatorSetup}(context)`);
  body.push(hasTheme ? "    AppTheme { GameRoot() }" : "    GameRoot()");

  const content = `package ${namespace}.ui

${imports.join("\n")}

/**
 * Точка входа игры из *_source.zip (перезаписывается шагом autosetup game).
 * До первого применения источника здесь живёт placeholder шаблона.
 */
@Composable
fun GameHost() {
${body.join("\n")}
}
`;
  project.writeText(path.join(nsPath, "ui", "GameHost.kt"), content);
  return { ok: true, root: `${rootPackage}.AppRoot`, theme: hasTheme, locator: hasLocator };
}

/**
 * Опционально (`meta.gameSplash === false`): убрать игровой `SplashScreen`,
 * чтобы старт был сразу с `Menu`. По умолчанию сплэш игры остаётся лоадером.
 */
function patchGameSplash(root, namespace) {
  const nsPath = path.join(javaDir(root), ...namespace.split("."));
  const candidates = walkFiles(nsPath).filter(
    (file) =>
      path.basename(file) === "AppViewModel.kt" && /Screen\.Splash/.test(project.readText(file)),
  );
  if (!candidates.length) {
    return { ok: false, details: "AppViewModel.kt со Screen.Splash не найден" };
  }
  const patterns = [
    /(MutableStateFlow<\s*Screen\s*>\s*\(\s*)Screen\.Splash(\s*\))/,
    /(mutableStateOf<\s*Screen\s*>\s*\(\s*)Screen\.Splash(\s*\))/,
    /(mutableStateOf\s*\(\s*)Screen\.Splash(\s*\))/,
  ];
  let changed = 0;
  for (const file of candidates) {
    const source = project.readText(file);
    let next = source;
    for (const pattern of patterns) {
      if (pattern.test(next)) {
        next = next.replace(pattern, "$1Screen.Menu$2");
        break;
      }
    }
    if (next !== source) {
      project.writeText(file, next);
      changed += 1;
    }
  }
  return changed
    ? { ok: true, details: "стартовый экран игры → Menu (второй сплэш убран)" }
    : { ok: false, details: "не удалось перевести стартовый экран игры на Menu" };
}

/** `ui/GateStatus.kt` — флаг «результат Cloudflare получен» для лоадера игры. */
function writeGateStatus(root, namespace) {
  const content = `package ${namespace}.ui

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Статус гейта (Cloudflare) для игрового лоадера: шаблонный ui/AppRoot
 * выставляет markReady() после ответа воркера, presentation/splash ждёт ready.
 */
object GateStatus {
    private val _ready = MutableStateFlow(false)
    val ready: StateFlow<Boolean> = _ready

    fun markReady() {
        _ready.value = true
    }
}
`;
  project.writeText(
    path.join(javaDir(root), ...namespace.split("."), "ui", "GateStatus.kt"),
    content,
  );
  return { ok: true };
}

/**
 * Лоадер игры не должен пропадать раньше ответа Cloudflare: в
 * `presentation/splash/SplashViewModel.kt` фиксированный `delay(...)` заменяется
 * ожиданием `ui/GateStatus.ready` (таймаут 90 с) + минимум 1.5 с показа.
 */
function patchGameSplashGate(root, namespace) {
  const nsPath = path.join(javaDir(root), ...namespace.split("."));
  const file = walkFiles(nsPath).find((item) => path.basename(item) === "SplashViewModel.kt");
  if (!file) {
    return { ok: false, details: "SplashViewModel.kt не найден — лоадер не привязан к гейту" };
  }
  let source = project.readText(file);
  const waitBlock = `kotlinx.coroutines.withTimeoutOrNull(90_000L) {
                ${namespace}.ui.GateStatus.ready.first { it }
            }`;
  const gateBlock = `val startedAt = System.currentTimeMillis()
            ${waitBlock}
            val elapsed = System.currentTimeMillis() - startedAt
            if (elapsed < 1_500L) delay(1_500L - elapsed)`;

  if (/GateStatus\.ready/.test(source)) {
    if (/elapsed < 1_500L/.test(source)) {
      return { ok: true, details: "уже ждёт результат Cloudflare (+ минимум 1.5 с)" };
    }
    const next = source.replace(
      /kotlinx\.coroutines\.withTimeoutOrNull\(90_000L\)\s*\{[\s\S]*?GateStatus\.ready\.first\s*\{\s*it\s*\}\s*\}/,
      gateBlock,
    );
    if (next === source) {
      return { ok: false, details: "лоадер уже ждёт гейт, но паттерн не распознан" };
    }
    project.writeText(file, next);
    return { ok: true, details: "ждёт результат Cloudflare (+ минимум 1.5 с)" };
  }

  const delayRe = /\bdelay\(\s*GameConfig\.LOADER_DURATION_MS\s*\)/;
  if (!delayRe.test(source)) {
    return { ok: false, details: "в SplashViewModel нет delay(GameConfig.LOADER_DURATION_MS)" };
  }
  if (!/import kotlinx\.coroutines\.flow\.first\b/.test(source)) {
    const patched = source.replace(
      /^(import kotlinx\.coroutines\.flow\.[A-Za-z]+)$/m,
      "import kotlinx.coroutines.flow.first\n$1",
    );
    source =
      patched !== source
        ? patched
        : source.replace(/^(package .+)$/m, "$1\n\nimport kotlinx.coroutines.flow.first");
  }
  source = source.replace(delayRe, gateBlock);
  project.writeText(file, source);
  return { ok: true, details: "ждёт результат Cloudflare (таймаут 90 с, минимум 1.5 с)" };
}

/**
 * Jira *_source.zip (Kotlin/Compose проект игры) → шаблон:
 *  - java/** копируется в namespace шаблона (MainActivity остаётся шаблонной);
 *  - drawable* / mipmap* / values / xml и playstore-icon обновляются;
 *  - ui/GameHost.kt перегенерируется под AppRoot источника.
 * Инфраструктура (gate/webview/crypto/push/dex/net/modules) не трогается.
 */
function applyGameSource(root, meta, task) {
  const sourceZip = task && task.sourceZip;
  if (!sourceZip) {
    return { ok: true, details: "source.zip нет — игра/исходники не менялись" };
  }

  const namespace = templateNamespace(root);
  if (!namespace) {
    return { ok: false, details: "namespace не найден в app/build.gradle" };
  }

  return withTempDir("autosetup-game-", (tmp) => {
    extractArchive(sourceZip, tmp);
    const mainDir = findMainDir(tmp);
    if (!mainDir) {
      return { ok: false, details: "в source.zip нет android/app/src/main (это не Android-проект?)" };
    }

    const sourcePackage = detectSourcePackage(mainDir);
    if (!sourcePackage) {
      return { ok: false, details: "не удалось определить package игры в source.zip" };
    }
    console.log(`[autosetup] game source: ${sourcePackage} → ${namespace}`);

    const report = { sources: 0, resources: 0, skipped: [], files: [] };
    const stamp = backupStamp();
    let backedUp = 0;
    const keepCopy = (file) => {
      if (backupFile(root, file, stamp)) backedUp += 1;
    };
    const copied = copySources(mainDir, root, sourcePackage, namespace, report);
    if (!copied.ok) return copied;

    copyResources(mainDir, root, meta.appName, report, keepCopy);
    const adapter = writeGameHost(root, namespace);
    writeGateStatus(root, namespace);
    const splash =
      meta.gameSplash === false
        ? patchGameSplash(root, namespace)
        : patchGameSplashGate(root, namespace);

    // Убираем файлы предыдущего source, которых нет в новом (иначе в сборке
    // останется мёртвый код/конфликтующие composable из прошлой задачи).
    const nsPath = path.join(javaDir(root), ...namespace.split("."));
    const nextFiles = new Set(report.files.map((file) => file.replace(/\\/g, "/")));
    let removed = 0;
    for (const rel of Array.isArray(meta.gameFiles) ? meta.gameFiles : []) {
      const normalized = String(rel).replace(/\\/g, "/");
      if (nextFiles.has(normalized)) continue;
      const target = path.join(nsPath, ...normalized.split("/"));
      if (!project.exists(target)) continue;
      keepCopy(target);
      fs.rmSync(target, { force: true });
      removed += 1;
    }
    project.writeMeta(root, { gamePackage: sourcePackage, gameFiles: [...nextFiles] });
    pruneBackups(root, 5);

    const parts = [
      `source: ${sourcePackage} → ${namespace}`,
      `файлов ${report.sources}`,
      `ресурсов ${report.resources}`,
    ];
    if (removed) parts.push(`удалено старых ${removed}`);
    if (backedUp) parts.push(`бэкап ${backedUp} файлов → .autosetup-backup/${stamp}`);
    parts.push(
      adapter.ok
        ? `GameHost → ${adapter.root}${adapter.theme ? " + AppTheme" : ""}${
            adapter.locator ? " + ServiceLocator" : ""
          }`
        : `GameHost: ${adapter.details}`,
    );
    if (splash) {
      parts.push(`лоадер: ${splash.details}`);
    } else {
      parts.push("лоадер игры (SplashScreen)");
    }
    if (report.skipped.length) {
      parts.push(`пропущено: ${report.skipped.slice(0, 5).join(", ")}`);
    }
    return { ok: true, details: parts.join("; ") };
  });
}

module.exports = { applyGameSource };
