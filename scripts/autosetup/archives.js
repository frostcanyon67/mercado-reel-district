const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

/** Windows/macOS tar (bsdtar) читает и .tar.gz, и .zip; на Linux есть fallback unzip. */
function extractArchive(archive, dest) {
  fs.mkdirSync(dest, { recursive: true });
  try {
    execFileSync("tar", ["-xf", archive, "-C", dest], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    return;
  } catch (tarError) {
    if (/\.zip$/i.test(archive)) {
      try {
        execFileSync("unzip", ["-q", archive, "-d", dest], {
          stdio: ["ignore", "pipe", "pipe"],
        });
        return;
      } catch {
        /* fall through to the tar error */
      }
    }
    throw new Error(
      `Не удалось распаковать ${path.basename(archive)}: ${tarError.message}`,
    );
  }
}

/** Runs `fn(tmpDir)` and always removes the temp dir. */
function withTempDir(prefix, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function walkFiles(dir, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

module.exports = { extractArchive, withTempDir, walkFiles, copyFile };
