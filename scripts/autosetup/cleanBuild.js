const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const project = require("./project");

const TARGETS = [
  "build",
  path.join("app", "build"),
  path.join("app", ".cxx"),
  path.join("app", "release"),
  ".kotlin",
];

function sleep(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    // без SharedArrayBuffer просто продолжаем
  }
}

function quoteWin(value) {
  const text = String(value == null ? "" : value);
  return /[\s"&|<>^()]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Гасим Gradle-демоны: они держат файлы в app/build (EPERM на Windows). */
function stopGradleDaemons(root) {
  const isWin = process.platform === "win32";
  const wrapper = path.join(root, isWin ? "gradlew.bat" : "gradlew");
  const command = project.exists(wrapper) ? wrapper : isWin ? "gradlew.bat" : "gradlew";
  try {
    spawnSync(isWin ? quoteWin(command) : command, ["--stop"], {
      cwd: root,
      windowsHide: true,
      shell: isWin,
      stdio: "ignore",
      timeout: 60000,
    });
    return true;
  } catch {
    return false;
  }
}

function tryRemove(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    return "";
  } catch (error) {
    return String((error && error.message) || error);
  }
}

/**
 * Удаляет build-выходы. Если каталог занят (gradle-демон держит файлы),
 * останавливает демоны и повторяет попытку; занятое — в предупреждение,
 * шаг не валит автосетап.
 */
function cleanBuild(root) {
  const deleted = [];
  const missing = [];
  const busy = [];

  for (const rel of TARGETS) {
    const target = path.join(root, rel);
    if (!project.exists(target)) {
      missing.push(rel.replace(/\\/g, "/"));
      continue;
    }
    const error = tryRemove(target);
    if (!error) {
      deleted.push(rel.replace(/\\/g, "/"));
    } else {
      busy.push({ rel, target, error });
    }
  }

  if (busy.length) {
    stopGradleDaemons(root);
    sleep(2000);
    const retried = [];
    for (const item of busy) {
      const error = tryRemove(item.target);
      if (!error) {
        deleted.push(item.rel.replace(/\\/g, "/"));
      } else {
        retried.push(item);
      }
    }
    busy.length = 0;
    busy.push(...retried);
  }

  return {
    ok: true,
    details:
      `удалено: ${deleted.join(", ") || "—"}` +
      (missing.length ? `; не было: ${missing.join(", ")}` : "") +
      (busy.length
        ? `; занято (пропущено): ${busy.map((item) => item.rel.replace(/\\/g, "/")).join(", ")}`
        : ""),
  };
}

module.exports = { cleanBuild, TARGETS };
