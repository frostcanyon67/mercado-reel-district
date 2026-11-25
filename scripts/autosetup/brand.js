/**
 * Брендовые строки `res/values/strings.xml`.
 *
 * Название приложения должно меняться не только в лаунчере, но и внутри игры:
 * лоадер игры (`presentation/splash/SplashScreen.kt`) берёт брендовые строки
 * (`brand_title` / `brand_tagline` / `brand_line_*`), а системное имя —
 * `R.string.app_name`. Поэтому при смене названия обновляем оба ключа и все
 * остальные строки, где встречался старый бренд (с сохранением регистра:
 * было КАПСОМ — останется капсом).
 */

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function readStringValue(xml, key) {
  const match = String(xml || "").match(
    new RegExp(`<string\\s+name="${key}"\\s*>([\\s\\S]*?)</string>`),
  );
  return match ? match[1] : "";
}

function setStringValue(xml, key, value) {
  const source = String(xml || "");
  const entry = `<string name="${key}">${escapeXml(value)}</string>`;
  const re = new RegExp(`<string\\s+name="${key}"\\s*>[\\s\\S]*?</string>`);
  if (re.test(source)) return source.replace(re, entry);
  if (source.includes("</resources>")) {
    return source.replace(/<\/resources>/, `    ${entry}\n</resources>`);
  }
  if (/<resources[^>]*>/.test(source)) {
    return `${source.replace(/\s*$/, "")}\n${entry}\n`;
  }
  return `<resources>\n    ${entry}\n</resources>\n`;
}

/** UPPER CASE для `app_title` (логотип на лоадере/главном экране). */
function brandTitle(appName) {
  return String(appName || "").trim().toUpperCase();
}

/**
 * @param {string} xml strings.xml
 * @param {string} appName новое название приложения
 * @param {string[]} [previousNames] дополнительные варианты старого названия
 * @returns {{ xml: string, changed: boolean }}
 */
function applyBrandName(xml, appName, previousNames = []) {
  const source = String(xml || "");
  const name = String(appName || "").trim();
  if (!source || !name) return { xml: source, changed: false };
  const title = brandTitle(name);

  const oldNames = new Set();
  for (const value of [readStringValue(source, "app_name"), readStringValue(source, "app_title"), ...previousNames]) {
    const trimmed = String(value || "").trim();
    if (trimmed) oldNames.add(trimmed.toLowerCase());
  }

  let next = setStringValue(source, "app_name", name);
  next = setStringValue(next, "app_title", title);

  next = next.replace(
    /<string\s+name="([^"]+)"\s*>([\s\S]*?)<\/string>/g,
    (full, key, value) => {
      if (key === "app_name" || key === "app_title") return full;
      const trimmed = String(value).trim();
      if (!trimmed || !oldNames.has(trimmed.toLowerCase())) return full;
      const isUpper = trimmed === trimmed.toUpperCase();
      return `<string name="${key}">${escapeXml(isUpper ? title : name)}</string>`;
    },
  );

  return { xml: next, changed: next !== source };
}

module.exports = {
  applyBrandName,
  brandTitle,
  readStringValue,
  setStringValue,
  escapeXml,
};
