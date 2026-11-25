# PowerShell: бинарный вывод только не через `>` (adb screencap и т.п.)

## Почему это правило существует

В этом окружении команды выполняются в **Windows PowerShell 5.1** (`powershell.exe`),
PowerShell 7 (`pwsh`) не установлен. В 5.1 оператор `>` / `Out-File`:

1. декодирует нативный stdout процесса как текст в OEM-кодировке (CP866);
2. пишет файл в **UTF-16LE с BOM**.

Для текста это нормально, для бинарных данных — необратимая порча файла.
Реальный случай в этом проекте:

```powershell
adb -s 127.0.0.1:5555 exec-out screencap -p > "$env:TEMP\ms3k-screen.png"   # ❌
```

Файл получился 3 374 778 байт и начинался с `FF FE 19 04 50 00 4E 00 …`
(BOM + «ЙPNG…»), вместо `89 50 4E 47 0D 0A 1A 0A`. Дальше `read_files`
«успешно прочитал изображение», а провайдер отклонил запрос:

```
You have uploaded an unsupported image. Please make sure your image is valid
and in a supported image format. (request_id: …)
```

То есть «неизвестный формат» — это не формат скриншота, а испорченный файл.

## Запрещено

- `adb exec-out screencap -p > file.png`
- любой `>` / `Out-File` / `Set-Content` без `-AsByteStream` для бинарного stdout
  (`adb exec-out`, дампы, образы, архивы);
- повторно прикладывать уже испорченный файл и пытаться «починить» его —
  кодировка теряется безвозвратно (проверено), нужен новый снимок.

## Как делать правильно

1. **Предпочтительно — helper проекта** (делает `screencap` + `pull`, проверяет PNG):

   ```powershell
   node scripts/screenshot.js --serial 127.0.0.1:5555
   # или: npm run screenshot -- --serial 127.0.0.1:5555
   ```

   Скрипт печатает путь, размеры и байты; при битом файле падает с кодом 1.

2. Без helper — через `cmd` (сырой stdout, без PowerShell-кодирования):

   ```powershell
   cmd /c "adb -s 127.0.0.1:5555 exec-out screencap -p > %TEMP%\screen.png"
   ```

3. Без helper — `screencap` в файл на устройстве + `adb pull`:

   ```powershell
   adb -s 127.0.0.1:5555 shell screencap -p /sdcard/screen.png
   adb -s 127.0.0.1:5555 pull /sdcard/screen.png "$env:TEMP\screen.png"
   ```

4. PowerShell 7+ (в этом окружении недоступен): `| Set-Content -AsByteStream`.

## Обязательная проверка перед вложением/`read_files`

```powershell
$b = [System.IO.File]::ReadAllBytes($p)
"header: " + (($b[0..7] | ForEach-Object { $_.ToString('X2') }) -join ' ')
```

- PNG: `89 50 4E 47 0D 0A 1A 0A` — ок;
- `FF FE …` — файл испорчен PowerShell-редиректом, переснять;
- ширина/высота PNG: big-endian `uint32` по смещениям 16 и 20 (IHDR).

## Лимиты изображений Cline

- допустимые типы: `image/png`, `image/jpeg`, `image/gif`, `image/webp`;
- ≤ 5 МиБ в base64 (encoded), ≤ 6 МиБ после декодирования, ≤ 8 МиБ суммарно
  на все медиа в запросе.

Большие PNG (например, полный экран 2560×1600) лучше кропать/сжимать перед
вложением, иначе запрос может быть отклонён по лимиту.
