const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const project = require("./project");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length };
}

const EXPECTED = [
  ["mipmap-mdpi/ic_launcher.png", 48],
  ["mipmap-hdpi/ic_launcher.png", 72],
  ["mipmap-xhdpi/ic_launcher.png", 96],
  ["mipmap-xxhdpi/ic_launcher.png", 144],
  ["mipmap-xxxhdpi/ic_launcher.png", 192],
  ["mipmap-mdpi/ic_launcher_round.png", 48],
  ["mipmap-xxxhdpi/ic_launcher_round.png", 192],
  ["mipmap-mdpi/ic_launcher_foreground.png", 108],
  ["mipmap-xxxhdpi/ic_launcher_foreground.png", 432],
  ["playstore-icon.png", 512],
];

/**
 * Jira icon PNG → res/mipmap-* (legacy + round + adaptive foreground) и
 * res/playstore-icon.png. Ресайз — System.Drawing (PowerShell 5.1), без
 * внешних npm-зависимостей. Run после шага game, чтобы перекрыть иконки source.
 */
function applyIcons(root, meta, task) {
  if (!task || !task.iconPng) {
    return { ok: true, details: "icon PNG нет — mipmaps остаются из *_source.zip" };
  }
  if (!project.exists(task.iconPng)) {
    return { ok: false, details: `icon PNG не найден: ${task.iconPng}` };
  }

  const script = path.join(__dirname, "makeIcons.ps1");
  const resDir = path.join(root, "app", "src", "main", "res");
  try {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script,
        "-Source",
        task.iconPng,
        "-ResDir",
        resDir,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    return { ok: false, details: `makeIcons.ps1: ${stderr.slice(0, 400)}` };
  }

  const problems = [];
  for (const [rel, size] of EXPECTED) {
    const file = path.join(resDir, rel);
    const info = project.exists(file) ? readPngSize(file) : null;
    if (!info || info.width !== size || info.height !== size) {
      problems.push(`${rel}: ${info ? `${info.width}x${info.height}` : "нет"}`);
    }
  }
  if (problems.length) {
    return { ok: false, details: `иконки не совпали: ${problems.join(", ")}` };
  }

  const playstore = readPngSize(path.join(resDir, "playstore-icon.png"));
  project.writeMeta(root, { iconSource: task.iconName || path.basename(task.iconPng) });
  return {
    ok: true,
    details:
      `${task.iconName || path.basename(task.iconPng)}: ` +
      `mipmap 5×launcher + 5×round + 5×foreground, playstore 512 (${playstore.bytes} B)`,
  };
}

module.exports = { applyIcons, readPngSize };
