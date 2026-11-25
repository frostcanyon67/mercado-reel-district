const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const project = require("./project");

const PAYLOAD_MAPPING = path.join("webview", "payload-mapping.txt");
const LEGACY_PAYLOAD_ASSET = path.join("webview", "payload.bin");
const MIN_API = 26;
const DICT_WORDS = 400;

/** Java/Kotlin keywords are not valid obfuscated identifiers. */
const KEYWORDS = new Set(
  (
    "abstract assert boolean break byte case catch char class const continue default do double else enum " +
    "extends final finally float for goto if implements import instanceof int interface long native new " +
    "package private protected public return short static strictfp super switch synchronized this throw " +
    "throws transient try void volatile while true false null var val fun object when is in as typealias " +
    "typeof by constructor delegate dynamic field file get init param property receiver set setparam where " +
    "actual annotation companion crossinline data expect external infix inline inner internal lateinit " +
    "noinline open operator out override reified sealed suspend tailrec vararg"
  ).split(/\s+/).filter(Boolean),
);

/** Default source: the bundled payload DEX (project-local). */
function defaultSource(root) {
  return path.join(root, "webview", "payload.dex");
}

function resolveSource(root, meta) {
  const candidates = [];
  if (meta && meta.webviewDex) {
    candidates.push(
      path.isAbsolute(meta.webviewDex) ? meta.webviewDex : path.resolve(root, meta.webviewDex),
    );
  }
  candidates.push(defaultSource(root));
  candidates.push(path.join(root, "webview", "payload.dex"));
  return candidates.find(project.exists) || null;
}

/** SHA-256 / entry-point contract read from dex/DexOpener.kt. */
function readPayloadContract(root) {
  const file =
    project.findFileBySuffix(root, "dex/DexOpener.kt") || project.findFileBySuffix(root, "DexOpener.kt");
  const source = project.readText(file || "");
  return {
    file,
    sha: project.pick(source, /WEBVIEW_DEX_SHA256\s*=\s*"([0-9a-fA-F]{64})"/),
    entryClass: project.pick(source, /PAYLOAD_ENTRY_CLASS\s*=\s*"([^"]+)"/) || "com.webloader.wrapper",
    entryMethod: project.pick(source, /PAYLOAD_ENTRY_METHOD\s*=\s*"([^"]+)"/) || "link",
    asset:
      project.pick(source, /WEBVIEW_PAYLOAD_ASSET\s*=\s*"([^"]+)"/) ||
      LEGACY_PAYLOAD_ASSET.replace(/\\/g, "/"),
    // Older projects still hard-code loadClass("com.webloader.wrapper") / getMethod("link").
    usesConstants:
      /loadClass\s*\(\s*PAYLOAD_ENTRY_CLASS\s*\)/.test(source) &&
      /getMethod\s*\(\s*PAYLOAD_ENTRY_METHOD/.test(source),
  };
}

/** PASSWORD / SALT from crypto/AesGcm.kt (the DEX payload key). */
function readPayloadKey(root) {
  const file =
    project.findFileBySuffix(root, "crypto/AesGcm.kt") || project.findFileBySuffix(root, "AesGcm.kt");
  const source = project.readText(file || "");
  const password = project.pick(source, /PASSWORD\s*=\s*"([^"]*)"/);
  const saltBlock = project.pick(source, /SALT\s*=\s*byteArrayOf\(([\s\S]*?)\n\s*\)/);
  const salt = [];
  for (const match of String(saltBlock || "").matchAll(/0x([0-9a-fA-F]{1,2})/g)) {
    salt.push(parseInt(match[1], 16));
  }
  return {
    file,
    password,
    salt: Buffer.from(salt),
    iterations:
      Number(project.pick(source, /PBKDF2_ITERATIONS\s*=\s*([\d_]+)/).replace(/_/g, "")) || 100000,
  };
}

function encryptGcm(plain, password, salt, iterations) {
  const key = crypto.pbkdf2Sync(Buffer.from(password, "utf8"), salt, iterations, 32, "sha256");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]);
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function looksLikeDex(bytes) {
  return bytes.length > 8 && bytes.subarray(0, 4).toString("latin1") === "dex\n";
}

function expandLocalPropertiesPath(value) {
  return String(value || "").replace(/\\\\/g, "\\").replace(/\\:/g, ":").trim();
}

function findTool(root, meta, name) {
  const ext = process.platform === "win32" ? ".exe" : "";
  const candidates = [];
  const config = (meta && meta.payloadObfuscation) || {};
  if (config.jdkHome && name !== "java") {
    candidates.push(path.join(config.jdkHome, "bin", `${name}${ext}`));
  }
  if (process.env.JAVA_HOME) {
    candidates.push(path.join(process.env.JAVA_HOME, "bin", `${name}${ext}`));
  }
  const gradleProps = path.join(root, "gradle.properties");
  if (project.exists(gradleProps)) {
    const match = project.readText(gradleProps).match(/^org\.gradle\.java\.home\s*=\s*(.+)$/m);
    if (match) {
      const home = expandLocalPropertiesPath(match[1]);
      candidates.push(path.join(home, "bin", `${name}${ext}`));
    }
  }
  candidates.push(path.join("C:\\Program Files\\Java\\jdk-17", "bin", `${name}${ext}`));
  return candidates.find(project.exists) || `${name}${ext}`;
}

function findAndroidJar(root, meta) {
  const override = meta && meta.payloadObfuscation && meta.payloadObfuscation.androidJar;
  if (override && project.exists(override)) return override;

  let sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "";
  if (!sdk) {
    const local = path.join(root, "local.properties");
    if (project.exists(local)) {
      const text = project.readText(local);
      const match = text.match(/^sdk\.dir\s*=\s*(.+)$/m);
      if (match) sdk = expandLocalPropertiesPath(match[1]);
    }
  }
  if (!sdk) return "";

  const platforms = path.join(sdk, "platforms");
  if (!project.exists(platforms)) return "";
  const versions = fs
    .readdirSync(platforms)
    .map((name) => ({ name, api: Number((name.match(/^android-(\d+)$/) || [])[1] || 0) }))
    .filter((item) => item.api > 0)
    .sort((a, b) => b.api - a.api);
  for (const item of versions) {
    const jar = path.join(platforms, item.name, "android.jar");
    if (project.exists(jar)) return jar;
  }
  return "";
}

function collectJars(dir, depth, out) {
  if (depth > 4) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectJars(full, depth + 1, out);
    else if (/^r8-.*\.jar$/i.test(entry.name)) out.push(full);
  }
}

function findR8(root, meta) {
  const candidates = [];
  const config = (meta && meta.payloadObfuscation) || {};
  if (config.r8Jar) candidates.push(config.r8Jar);
  if (process.env.ANDROID_R8_JAR) candidates.push(process.env.ANDROID_R8_JAR);
  candidates.push(path.join(root, "tools", "r8.jar"));

  const programFiles = process.env.ProgramFiles || "C:\\Program Files";
  candidates.push(
    path.join(programFiles, "Android", "Android Studio", "plugins", "android", "lib", "r8.jar"),
  );
  const localAppData = process.env.LOCALAPPDATA || "";
  if (localAppData) {
    candidates.push(
      path.join(localAppData, "Programs", "Android Studio", "plugins", "android", "lib", "r8.jar"),
    );
  }

  const gradleR8 = path.join(
    os.homedir(),
    ".gradle",
    "caches",
    "modules-2",
    "files-2.1",
    "com.android.tools",
    "r8",
  );
  if (project.exists(gradleR8)) {
    const jars = [];
    collectJars(gradleR8, 0, jars);
    jars.sort();
    candidates.push(...jars.reverse());
  }
  return candidates.find(project.exists) || "";
}

/**
 * Seed для обфускации payload.
 *  - `meta.payloadObfuscation.seed` / `PAYLOAD_SEED` — ручное значение (тесты);
 *  - по умолчанию (`maxRandomize !== false`) к seed проекта добавляется случайный
 *    суффикс: каждый прогон — новый пакет/словарь/dummy-классы/путь asset;
 *  - `meta.payloadObfuscation.stable: true` или `maxRandomize: false` — прежнее
 *    поведение (одинаковый payload на проект).
 */
function payloadSeed(meta) {
  const config = (meta && meta.payloadObfuscation) || {};
  if (config.seed) return String(config.seed);
  if (process.env.PAYLOAD_SEED) return String(process.env.PAYLOAD_SEED);
  const identity = [
    (meta && meta.applicationId) || "",
    (meta && meta.namespace) || "",
    (meta && meta.jiraIssue) || "",
    (meta && meta.appName) || "",
  ].join("|");
  const base = sha256(Buffer.from(identity, "utf8")).slice(0, 32);
  if (meta && meta.maxRandomize !== false && config.stable !== true) {
    return `${base}-${crypto.randomBytes(6).toString("hex")}`;
  }
  return base;
}

function makeDictionary(seed) {
  const words = new Set();
  for (let i = 0; words.size < DICT_WORDS && i < DICT_WORDS * 40; i++) {
    const hash = crypto.createHash("sha256").update(`${seed}:${i}`).digest();
    const length = 4 + (hash[0] % 5);
    let name = "";
    for (let j = 0; j < length; j++) {
      name += String.fromCharCode(97 + (hash[j + 1] % 26));
    }
    if (!KEYWORDS.has(name)) words.add(name);
  }
  return `${[...words].join("\n")}\n`;
}

function randomPackage(seed) {
  const hash = crypto.createHash("sha256").update(`${seed}:package`).digest();
  let name = "p";
  for (let i = 0; i < 7; i++) name += String.fromCharCode(97 + (hash[i] % 26));
  return name;
}

function seededWord(seed, tag, length) {
  const hash = crypto.createHash("sha256").update(`${seed}:${tag}`).digest();
  let word = "";
  for (let i = 0; i < length; i++) {
    word += String.fromCharCode(97 + (hash[i] % 26));
  }
  return word;
}

/** Per-project asset path (no "webview/payload.bin" fingerprint in the APK). */
function payloadAssetPath(seed) {
  const dir = seededWord(seed, "asset-dir", 7);
  const file = seededWord(seed, "asset-file", 9);
  return path.posix.join(dir, `${file}.bin`);
}

/** R8 mapping -> renamed entry class + entry method. */
function parseMapping(mapping, entryClass, entryMethod) {
  let newClass = "";
  let newMethod = "";
  let inEntry = false;
  for (const line of String(mapping || "").split(/\r?\n/)) {
    const classLine = line.match(/^(\S+) -> (\S+):$/);
    if (classLine) {
      inEntry = classLine[1] === entryClass;
      if (inEntry) newClass = classLine[2];
      continue;
    }
    if (!inEntry || !line.startsWith("    ") || !line.includes("->")) continue;
    if (!line.includes(` ${entryMethod}(`) && !line.includes(`.${entryMethod}(`)) continue;
    const renamed = line.match(/->\s*(\S+)\s*$/);
    if (renamed && renamed[1] !== entryMethod) newMethod = renamed[1];
  }
  return { newClass, newMethod };
}

/** Source entry point is persisted once: autosetup rewrites DexOpener constants. */
function readSourceContract(root, contract) {
  const file = path.join(root, "webview", "payload-contract.json");
  if (project.exists(file)) {
    try {
      const parsed = JSON.parse(project.readText(file));
      if (parsed.sourceEntryClass && parsed.sourceEntryMethod) return parsed;
    } catch {
      // recreate below
    }
  }
  const value = {
    sourceEntryClass: contract.entryClass,
    sourceEntryMethod: contract.entryMethod,
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return value;
}

function patchContract(root, contract, values) {
  if (!contract.file) return false;
  let text = project.readText(contract.file);
  const original = text;
  const replace = (regex, value) => {
    text = text.replace(regex, `$1${value}$2`);
  };
  replace(/(WEBVIEW_DEX_SHA256\s*=\s*\r?\n\s*")[0-9a-fA-F]{64}(")/, values.sha);
  replace(/(WEBVIEW_PAYLOAD_ASSET\s*=\s*")[^"]*(")/, values.asset);
  if (contract.usesConstants) {
    replace(/(PAYLOAD_ENTRY_CLASS\s*=\s*")[^"]*(")/, values.entryClass);
    replace(/(PAYLOAD_ENTRY_METHOD\s*=\s*")[^"]*(")/, values.entryMethod);
  }
  if (text !== original) project.writeText(contract.file, text);
  return text !== original;
}

function listJavaFiles(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listJavaFiles(full, out);
    else if (entry.isFile() && entry.name.endsWith(".java")) out.push(full);
  }
  return out;
}

/** Payload source (wrapper.java) next to the DEX or via meta.payloadSource. */
function resolvePayloadSource(root, meta, dexPath) {
  const candidates = [];
  if (meta && meta.payloadSource) {
    candidates.push(path.resolve(root, meta.payloadSource));
  }
  if (dexPath) {
    const dir = path.dirname(dexPath);
    candidates.push(path.join(dir, "src", "com", "webloader", "wrapper.java"));
    candidates.push(path.join(dir, "src"));
    candidates.push(dir);
  }
  candidates.push(path.join(root, "webview", "payload-src"));

  for (const candidate of candidates) {
    if (!project.exists(candidate)) continue;
    const stat = fs.statSync(candidate);
    if (stat.isFile() && candidate.endsWith(".java")) return [candidate];
    if (stat.isDirectory()) {
      const files = listJavaFiles(candidate);
      if (files.length) return files;
    }
  }
  return [];
}

function collectAllJars(dir, depth, out) {
  if (depth > 6) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectAllJars(full, depth + 1, out);
    else if (/\.jar$/i.test(entry.name) && !/(sources|javadoc)/i.test(entry.name)) out.push(full);
  }
}

function findGradleJar(group, artifact, namePattern) {
  const base = path.join(
    os.homedir(),
    ".gradle",
    "caches",
    "modules-2",
    "files-2.1",
    group,
    artifact,
  );
  if (!project.exists(base)) return "";
  const jars = [];
  collectAllJars(base, 0, jars);
  const matches = jars.filter((file) => namePattern.test(path.basename(file)));
  matches.sort();
  return matches[matches.length - 1] || "";
}

/** StringFog core/interface/ASM + AES impl + transformer tool. */
function findStringFogDeps(root, meta) {
  const config = (meta && meta.payloadObfuscation) || {};
  const asm = config.asmJar || findGradleJar("org.ow2.asm", "asm", /^asm-\d[\d.]*\.jar$/i);
  const core =
    config.stringFogCoreJar ||
    findGradleJar("com.github.megatronking.stringfog", "core", /^core-.*\.jar$/i);
  const iface =
    config.stringFogInterfaceJar ||
    findGradleJar("com.github.megatronking.stringfog", "interface", /^interface-.*\.jar$/i);
  const fog = config.stringFogImplJar || path.join(root, "libs", "fog-aes.jar");
  const tool = path.join(root, "scripts", "autosetup", "tools", "PayloadStringFog.java");
  const missing = [];
  if (!asm) missing.push("ASM");
  if (!core) missing.push("stringfog-core");
  if (!iface) missing.push("stringfog-interface");
  if (!project.exists(fog)) missing.push("fog-aes.jar");
  if (!project.exists(tool)) missing.push("PayloadStringFog.java");
  return {
    ok: missing.length === 0,
    asm,
    core,
    iface,
    fog,
    tool,
    reason: missing.length ? `нет ${missing.join(", ")}` : "",
  };
}

/** Per-project StringFog wrapper (decrypt helper) source. */
function prepareStringFogSource(work, seed) {
  const simple = seededWord(seed, "fog-wrapper", 7);
  const wrapperClass = `com.webloader.${simple}`;
  const wrapperInternal = `com/webloader/${simple}`;
  const dir = path.join(work, "fogsrc", "com", "webloader");
  fs.mkdirSync(dir, { recursive: true });
  const source = path.join(dir, `${simple}.java`);
  fs.writeFileSync(
    source,
    `package com.webloader;\n\n` +
      `import com.kFjQzLm.fog.StringFogAesImpl;\n` +
      `import com.github.megatronking.stringfog.Base64;\n\n` +
      `public final class ${simple} {\n` +
      `    private static final StringFogAesImpl IMPL = new StringFogAesImpl();\n\n` +
      `    public static String decrypt(String value, String key) {\n` +
      `        return IMPL.decrypt(Base64.decode(value, Base64.DEFAULT),\n` +
      `                Base64.decode(key, Base64.DEFAULT));\n` +
      `    }\n` +
      `}\n`,
    "utf8",
  );
  return {
    wrapperClass,
    wrapperInternal,
    source,
    keyHex: crypto
      .createHash("sha256")
      .update(`${seed}:stringfog-key`)
      .digest()
      .subarray(0, 16)
      .toString("hex"),
  };
}

function writeDummySources(seed, work) {
  const dir = path.join(work, "dummy", "com", "webloader");
  fs.mkdirSync(dir, { recursive: true });
  const hash = crypto.createHash("sha256").update(`${seed}:dummy-count`).digest();
  const count = 3 + (hash[0] % 5);
  const files = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let name = seededWord(seed, `dummy-class-${i}`, 6 + (hash[(i + 1) % 32] % 4));
    while (used.has(name)) name += "a";
    used.add(name);
    const fieldName = seededWord(seed, `dummy-field-${i}`, 5);
    const methodName = seededWord(seed, `dummy-method-${i}`, 5);
    const stringMethod = seededWord(seed, `dummy-str-${i}`, 5);
    const constant = hash[(i + 2) % 32];
    const literal = seededWord(seed, `dummy-value-${i}`, 8);
    const source =
      `package com.webloader;\n\n` +
      `public final class ${name} {\n` +
      `    private int ${fieldName} = ${constant};\n` +
      `    public int ${methodName}(int x) {\n` +
      `        return (x ^ ${constant}) + ${fieldName};\n` +
      `    }\n` +
      `    public String ${stringMethod}() {\n` +
      `        return "${literal}";\n` +
      `    }\n` +
      `}\n`;
    const file = path.join(dir, `${name}.java`);
    fs.writeFileSync(file, source, "utf8");
    files.push(file);
  }
  return files;
}

/** Compile the transformer once and run StringFog over the payload classes. */
function runStringFogPass(root, meta, work, classesDir, fogInfo, deps) {
  try {
    const javac = findTool(root, meta, "javac");
    const java = findTool(root, meta, "java");
    const jar = findTool(root, meta, "jar");
    const toolDir = path.join(work, "stringfog-tool");
    fs.mkdirSync(toolDir, { recursive: true });
    const toolCp = [deps.asm, deps.core, deps.iface, deps.fog].join(path.delimiter);
    execFileSync(
      javac,
      [
        "-encoding",
        "UTF-8",
        "-source",
        "8",
        "-target",
        "8",
        "-classpath",
        toolCp,
        "-d",
        toolDir,
        deps.tool,
      ],
      { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
    );

    const outDir = path.join(work, "stringfog-classes");
    fs.mkdirSync(outDir, { recursive: true });
    execFileSync(
      java,
      [
        "-cp",
        [toolDir, toolCp].join(path.delimiter),
        "PayloadStringFog",
        classesDir,
        outDir,
        fogInfo.wrapperClass,
        "com.kFjQzLm.fog.StringFogAesImpl",
        fogInfo.keyHex,
        "com.webloader",
        "base64",
        fogInfo.wrapperInternal,
      ],
      { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
    );

    const jarFile = path.join(work, "payload-stringfog.jar");
    execFileSync(jar, ["cf", jarFile, "-C", outDir, "."], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return {
      ok: true,
      jarFile,
      runtimeJars: [deps.fog, deps.iface],
    };
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr) : "";
    return {
      ok: false,
      reason: `${error && error.message ? error.message : error}${stderr ? `: ${stderr.slice(0, 900)}` : ""}`,
    };
  }
}

/** javac (Java 8 bytecode) -> classes.jar for R8. */
function compilePayloadSource(
  root,
  meta,
  javaFiles,
  work,
  androidJar,
  seed,
  extraSources = [],
  extraClasspath = [],
) {
  const javac = findTool(root, meta, "javac");
  const jar = findTool(root, meta, "jar");
  const classesDir = path.join(work, "classes");
  fs.mkdirSync(classesDir, { recursive: true });
  const sources = [...javaFiles, ...writeDummySources(seed, work), ...extraSources];
  execFileSync(
    javac,
    [
      "-encoding",
      "UTF-8",
      "-source",
      "8",
      "-target",
      "8",
      "-classpath",
      [androidJar, ...extraClasspath].join(path.delimiter),
      "-d",
      classesDir,
      ...sources,
    ],
    { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
  );
  const jarFile = path.join(work, "payload.jar");
  execFileSync(jar, ["cf", jarFile, "-C", classesDir, "."], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  return { jarFile, classesDir };
}

/**
 * Per-project R8 pass over the source DEX: random dictionary + random package,
 * entry class/method renamed too (DexOpener is patched with the mapping).
 */
function obfuscateDex(root, meta, sourcePath, contract, sourceContract, sourceName) {
  const config = (meta && meta.payloadObfuscation) || {};
  if (config.enabled === false) {
    return {
      ok: true,
      skipped: true,
      reason: "payloadObfuscation.enabled=false",
      dex: fs.readFileSync(sourcePath),
      entryClass: sourceContract.sourceEntryClass,
      entryMethod: sourceContract.sourceEntryMethod,
    };
  }

  const r8 = findR8(root, meta);
  const androidJar = findAndroidJar(root, meta);
  if (!r8 || !androidJar) {
    return {
      ok: false,
      reason: `R8=${r8 || "не найден"}, android.jar=${androidJar || "не найден"}`,
    };
  }

  const java = findTool(root, meta, "java");
  const javaFiles = resolvePayloadSource(root, meta, sourcePath);
  if (javaFiles.length === 0) {
    return {
      ok: false,
      reason: "исходник payload не найден (meta.payloadSource / src рядом с DEX)",
    };
  }
  const seed = payloadSeed(meta);
  const pkg = randomPackage(seed);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "payload-"));

  try {
    const dictFile = path.join(work, "dict.txt");
    fs.writeFileSync(dictFile, makeDictionary(seed), "utf8");

    const rules = [
      "-dontwarn **",
      "-dontshrink",
      `-repackageclasses ${pkg}`,
      `-obfuscationdictionary ${dictFile.replace(/\\/g, "/")}`,
      "-renamesourcefileattribute SourceFile",
    ];
    if (contract.usesConstants) {
      rules.push(`-keepclassmembers class ${sourceContract.sourceEntryClass} { <init>(); }`);
    } else {
      rules.push(
        `-keep class ${sourceContract.sourceEntryClass} { <init>(); ` +
          `${sourceContract.sourceEntryMethod}(android.app.Activity, java.lang.String); }`,
      );
    }
    const rulesFile = path.join(work, "rules.pro");
    fs.writeFileSync(rulesFile, `${rules.join("\n")}\n`, "utf8");

    const fogDeps = findStringFogDeps(root, meta);
    const fogInfo = fogDeps.ok ? prepareStringFogSource(work, seed) : null;
    const compiled = compilePayloadSource(
      root,
      meta,
      javaFiles,
      work,
      androidJar,
      seed,
      fogInfo ? [fogInfo.source] : [],
      fogInfo ? [fogDeps.fog, fogDeps.iface] : [],
    );
    let runtimeJars = [];
    let stringFog = "";
    if (fogInfo) {
      const fogged = runStringFogPass(root, meta, work, compiled.classesDir, fogInfo, fogDeps);
      if (fogged.ok) {
        compiled.jarFile = fogged.jarFile;
        runtimeJars = fogged.runtimeJars;
        stringFog = "StringFog";
      } else {
        stringFog = `StringFog пропущен: ${fogged.reason}`;
      }
    } else {
      stringFog = `StringFog пропущен: ${fogDeps.reason}`;
    }

    const input = compiled;
    const outDir = path.join(work, "out");
    fs.mkdirSync(outDir, { recursive: true });
    const mapFile = path.join(work, "mapping.txt");

    execFileSync(
      java,
      [
        "-cp",
        r8,
        "com.android.tools.r8.R8",
        "--release",
        "--min-api",
        String(config.minApi || MIN_API),
        "--lib",
        androidJar,
        "--output",
        outDir,
        "--pg-conf",
        rulesFile,
        "--pg-map-output",
        mapFile,
        input.jarFile,
        ...runtimeJars,
      ],
      { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
    );

    const dexPath = path.join(outDir, "classes.dex");
    if (!project.exists(dexPath)) throw new Error("R8 не создал classes.dex");
    const dex = fs.readFileSync(dexPath);
    if (!looksLikeDex(dex)) throw new Error("R8 output не является DEX");

    const mapping = project.readText(mapFile);
    const parsed = parseMapping(
      mapping,
      sourceContract.sourceEntryClass,
      sourceContract.sourceEntryMethod,
    );
    if (contract.usesConstants && !parsed.newClass) {
      return {
        ok: false,
        fatal: true,
        reason: `R8 mapping не содержит entry ${sourceContract.sourceEntryClass}`,
      };
    }

    const entryClass = contract.usesConstants
      ? parsed.newClass
      : sourceContract.sourceEntryClass;
    const entryMethod = contract.usesConstants
      ? parsed.newMethod || sourceContract.sourceEntryMethod
      : sourceContract.sourceEntryMethod;

    const mappingFile = path.join(root, PAYLOAD_MAPPING);
    fs.mkdirSync(path.dirname(mappingFile), { recursive: true });
    fs.writeFileSync(
      mappingFile,
      `seed: ${seed}\npackage: ${pkg}\nsource: ${sourceName}\n` +
        `entry: ${entryClass}.${entryMethod}\n\n${mapping}`,
      "utf8",
    );

    return {
      ok: true,
      dex,
      entryClass,
      entryMethod,
      seed,
      packageName: pkg,
      mappingFile,
      r8,
      androidJar,
      stringFog,
    };
  } catch (error) {
    return {
      ok: false,
      fatal: true,
      reason: String(error && error.message ? error.message : error),
    };
  } finally {
    try {
      fs.rmSync(work, { recursive: true, force: true });
    } catch {
      // temp cleanup is best-effort
    }
  }
}

/**
 * meta.webviewDex / meta.payloadSource -> per-project
 * R8 obfuscation -> encrypted asset consumed by dex/DexOpener.kt.
 */
function applyWebviewPayload(root, meta) {
  const source = resolveSource(root, meta);
  if (!source) {
    return {
      ok: true,
      details: project.exists(asset)
        ? `источник не найден — используется уже собранный ${PAYLOAD_ASSET}`
        : "источник не найден (meta.webviewDex), payload не обновлён",
    };
  }

  const sourceDex = fs.readFileSync(source);
  if (!looksLikeDex(sourceDex)) {
    return { ok: false, details: `${path.basename(source)} не является DEX-файлом` };
  }

  const contract = readPayloadContract(root);
  if (!contract.file) {
    return { ok: false, details: "dex/DexOpener.kt не найден — некуда писать контракт payload" };
  }

  const config = (meta && meta.payloadObfuscation) || {};
  const sourceContract = readSourceContract(root, contract);
  const seed = payloadSeed(meta);
  const assetRel = payloadAssetPath(seed);
  const asset = path.join(project.assetsDir(root), assetRel);
  const oldAsset =
    contract.asset && contract.asset !== assetRel
      ? path.join(project.assetsDir(root), contract.asset)
      : "";
  const obfuscated = obfuscateDex(
    root,
    meta,
    source,
    contract,
    sourceContract,
    path.basename(source),
  );

  let dex;
  let entryClass;
  let entryMethod;
  let note;

  if (!obfuscated.ok) {
    if (obfuscated.fatal || config.required === true) {
      return { ok: false, details: `payload не обфусцирован: ${obfuscated.reason}` };
    }
    dex = sourceDex;
    entryClass = sourceContract.sourceEntryClass;
    entryMethod = sourceContract.sourceEntryMethod;
    note = `обфускация пропущена (${obfuscated.reason}) — payload без R8`;
  } else {
    dex = obfuscated.dex;
    entryClass = obfuscated.entryClass;
    entryMethod = obfuscated.entryMethod;
    note = obfuscated.skipped
      ? `обфускация пропущена: ${obfuscated.reason}`
      : `R8 seed ${String(obfuscated.seed).slice(0, 8)}…${obfuscated.stringFog ? ` · ${obfuscated.stringFog}` : ""}, entry ${entryClass}.${entryMethod}`;
  }

  const digest = sha256(dex);
  const patched = patchContract(root, contract, {
    sha: digest,
    asset: assetRel,
    entryClass,
    entryMethod,
  });

  const credentials = readPayloadKey(root);
  if (!credentials.password || credentials.salt.length === 0) {
    return { ok: false, details: "PASSWORD / SALT не прочитаны из crypto/AesGcm.kt" };
  }

  const encrypted = encryptGcm(dex, credentials.password, credentials.salt, credentials.iterations);
  if (oldAsset && project.exists(oldAsset)) {
    try {
      fs.unlinkSync(oldAsset);
    } catch {
      // old asset cleanup is best-effort
    }
  }
  fs.mkdirSync(path.dirname(asset), { recursive: true });
  fs.writeFileSync(asset, encrypted);

  return {
    ok: true,
    details:
      `assets/${assetRel} ← ${path.basename(source)} ` +
      `(${dex.length} B dex, ${encrypted.length} B AES-GCM, sha ${digest.slice(0, 16)}…; ${note})` +
      (patched ? " · DexOpener обновлён" : ""),
  };
}

function payloadInfo(root) {
  const contract = readPayloadContract(root);
  const assetRel = contract.asset || LEGACY_PAYLOAD_ASSET.replace(/\\/g, "/");
  const asset = path.join(project.assetsDir(root), assetRel);
  if (!project.exists(asset)) return { exists: false, size: 0, encryptedSha: "", asset: assetRel };
  const bytes = fs.readFileSync(asset);
  return { exists: true, size: bytes.length, encryptedSha: project.sha256(bytes), asset: assetRel };
}

module.exports = {
  applyWebviewPayload,
  payloadInfo,
  PAYLOAD_MAPPING,
  resolveSource,
};
