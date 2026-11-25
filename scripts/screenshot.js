#!/usr/bin/env node
/**
 * Снимок экрана Android-устройства без порчи файла PowerShell-редиректом.
 *
 * Почему не `adb exec-out screencap -p > file.png`:
 * в Windows PowerShell 5.1 (`powershell.exe`) оператор `>` пишет текст в
 * UTF-16LE с BOM и декодирует нативный stdout как OEM-текст (CP866), поэтому
 * PNG необратимо ломается. Здесь используется `adb shell screencap` + `adb pull`
 * (файл не проходит через конвейер PowerShell) с проверкой PNG-сигнатуры.
 *
 * Usage:
 *   node scripts/screenshot.js
 *   node scripts/screenshot.js --serial 127.0.0.1:5555
 *   node scripts/screenshot.js --serial 127.0.0.1:5555 --out C:\Temp\screen.png
 *   node scripts/screenshot.js --help
 *
 * Аргументы:
 *   --serial <id>  серийный номер устройства (как в `adb devices`); по умолчанию
 *                  единственное подключённое устройство
 *   --out <path>   куда сохранить PNG (по умолчанию %TEMP%\screen-<время>.png)
 *   --keep         не удалять временный файл на устройстве
 *   --help, -h     эта справка
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const USAGE = `Снимок экрана Android через adb.

Usage:
  node scripts/screenshot.js [--serial <id>] [--out <path>] [--keep]

  --serial <id>  устройство из \`adb devices\` (по умолчанию — единственное)
  --out <path>   путь к PNG (по умолчанию %TEMP%\\screen-<время>.png)
  --keep         не удалять временный файл на устройстве
  --help, -h     эта справка`;

function parseArgs(argv) {
  const args = { serial: "", out: "", keep: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--serial") args.serial = String(argv[++i] || "");
    else if (arg === "--out") args.out = String(argv[++i] || "");
    else if (arg === "--keep") args.keep = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Неизвестный аргумент: ${arg} (см. --help)`);
  }
  return args;
}

function adb(args) {
  return execFileSync("adb", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function listDevices() {
  try {
    const out = adb(["devices"]);
    return out
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /\tdevice$/.test(line))
      .map((line) => line.split("\t")[0]);
  } catch (error) {
    throw new Error(`adb недоступен: ${error.message}`);
  }
}

function takeScreenshot({ serial, out, keep }) {
  const target = path.resolve(
    out || path.join(os.tmpdir(), `screen-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.png`)
  );
  const remote = `/data/local/tmp/cline-screenshot-${process.pid}.png`;
  const base = serial ? ["-s", serial] : [];

  fs.mkdirSync(path.dirname(target), { recursive: true });
  adb([...base, "shell", "screencap", "-p", remote]);
  try {
    adb([...base, "pull", remote, target]);
  } finally {
    if (!keep) {
      try {
        adb([...base, "shell", "rm", "-f", remote]);
      } catch {
        /* устройство могло отвалиться — файл во временной папке не критичен */
      }
    }
  }
  return target;
}

function verifyPng(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    const head = buf.subarray(0, 8).toString("hex").match(/../g)?.join(" ") || "—";
    throw new Error(
      `Файл не является PNG (первые байты: ${head}). Ожидалось: 89 50 4e 47 0d 0a 1a 0a`
    );
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return;
  }

  const devices = listDevices();
  if (devices.length === 0) throw new Error("Нет подключённых устройств (adb devices пуст).");
  if (!args.serial && devices.length > 1) {
    throw new Error(
      `Подключено несколько устройств: ${devices.join(", ")}. Укажите --serial <id>.`
    );
  }
  if (args.serial && !devices.includes(args.serial)) {
    throw new Error(`Устройство "${args.serial}" не найдено. Доступны: ${devices.join(", ")}.`);
  }

  const file = takeScreenshot(args);
  const info = verifyPng(file);
  console.log(file);
  console.log(`${info.width}x${info.height}, ${info.bytes} байт`);
}

try {
  main();
} catch (error) {
  console.error(`screenshot: ${error.message}`);
  process.exit(1);
}
