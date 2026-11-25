const fs = require("fs");
const path = require("path");
const project = require("./project");

const BEGIN = "/* >>> privacy-policy:begin */";
const END = "/* <<< privacy-policy:end */";

const POLICY_ROUTE = `      if (
        url.pathname === "/policy" ||
        url.pathname === "/policy/" ||
        url.pathname === "/privacy"
      ) {
        return new Response(PRIVACY_POLICY_HTML, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
`;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchPrivacyHtml(url) {
  const target = String(url || "").trim();
  if (!/^https?:\/\//i.test(target)) {
    throw new Error("Privacy URL должен начинаться с http:// или https://");
  }
  const res = await fetch(target, {
    redirect: "follow",
    headers: { "User-Agent": "MS3Kotlin-autosetup/1.0 (+privacy-sync)" },
  });
  if (!res.ok) throw new Error(`Privacy URL вернул HTTP ${res.status}`);
  const html = await res.text();
  const probe = html.slice(0, 2000).toLowerCase();
  if (
    html.length < 50 ||
    (!probe.includes("<html") && !probe.includes("<body") && !probe.includes("<h1"))
  ) {
    throw new Error("По Privacy URL пришёл не HTML (проверьте поле Privacy URL в Jira)");
  }
  return html;
}

function patchWorkerSource(source, html) {
  const literal = JSON.stringify(html);
  const block = `${BEGIN}\nconst PRIVACY_POLICY_HTML = ${literal};\n${END}`;
  let next = String(source || "");
  let markersAdded = false;
  let routeAdded = false;

  if (next.includes(BEGIN) && next.includes(END)) {
    const re = new RegExp(`${escapeRegExp(BEGIN)}[\\s\\S]*?${escapeRegExp(END)}`);
    // Функция-замена: иначе `$&`, `$'`, `$1` внутри HTML испортят вставку.
    next = next.replace(re, () => block);
  } else {
    markersAdded = true;
    const anchor = next.indexOf("export default {");
    if (anchor >= 0) {
      next = `${next.slice(0, anchor)}${block}\n\n${next.slice(anchor)}`;
    } else {
      next = `${next.replace(/\s+$/, "")}\n\n${block}\n`;
    }
  }

  if (
    next.includes('url.pathname === "/policy"') ||
    next.includes('url.pathname === "/privacy"')
  ) {
    // route already present
  } else {
    const urlLine = next.indexOf("const url = new URL(request.url);");
    if (urlLine >= 0) {
      const insertAt = urlLine + "const url = new URL(request.url);".length;
      next = `${next.slice(0, insertAt)}\n\n${POLICY_ROUTE}${next.slice(insertAt)}`;
      routeAdded = true;
    }
  }

  return { source: next, markersAdded, routeAdded };
}

/**
 * Privacy URL из Jira (customfield_10039) → cloudflare-worker/index.js.
 * Заменяет только блок между маркерами privacy-policy, поэтому у каждого
 * проекта/задачи остаётся своя policy, а не policy прошлого проекта.
 */
async function syncPrivacyPolicy(root, privacyUrl) {
  const workerDir = project.findWorkerDir(root);
  if (!workerDir) throw new Error("cloudflare-worker/index.js не найден");
  const file = path.join(workerDir, "index.js");
  const html = await fetchPrivacyHtml(privacyUrl);
  const original = project.readText(file);
  const patched = patchWorkerSource(original, html);
  fs.writeFileSync(file, patched.source, "utf8");
  return {
    ok: true,
    bytes: html.length,
    changed: patched.source !== original,
    markersAdded: patched.markersAdded,
    routeAdded: patched.routeAdded,
    file: path.relative(root, file).replace(/\\/g, "/"),
    privacyUrl,
  };
}

module.exports = { syncPrivacyPolicy, fetchPrivacyHtml, patchWorkerSource, BEGIN, END };
