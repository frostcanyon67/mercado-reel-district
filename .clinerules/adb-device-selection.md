# adb: при нескольких устройствах всегда `-s <serial>`

В этом окружении часто подключены два устройства: `127.0.0.1:5555` (BlueStacks)
и `emulator-5554`. Любая adb-команда без `-s` падает:

```
adb.exe: more than one device/emulator
```

## Правила

1. Перед `install` / `shell` / `screencap` / `logcat` выполнить `adb devices` и
   явно выбрать серийник; приоритет — `127.0.0.1:5555` (BlueStacks,
   `kotlinAppHelper.adbConnectTarget`).
2. Всегда передавать `-s`:

   ```powershell
   adb -s 127.0.0.1:5555 install -r app\build\outputs\apk\debug\app-debug.apk
   adb -s 127.0.0.1:5555 shell monkey -p <applicationId> -c android.intent.category.LAUNCHER 1
   ```

3. Не полагаться на «единственное устройство»: `emulator-5554` может висеть
   `offline`, а после `adb connect` стать `device`. Проверять состояние.
4. Скриншоты — через `node scripts/screenshot.js` (сам разрешает устройство и
   выдаёт понятную ошибку при неоднозначности, см. `powershell-binary-output.md`).
5. Не выполнять `adb kill-server` без причины: на Windows HD-Adb из BlueStacks и
   platform-tools конфликтуют (`doesn't match this client`); helper обрабатывает
   это сам.
6. Хелпер `local.kotlin-app-helper-blowfish` должен быть **0.5.2+**: там
   `ensureDevice` + `withSerial`; версии ≤ 0.5.1 ставили APK без `-s` и падали
   при двух устройствах.
