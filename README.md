# Life RPG

Personal “life as a video game” wellness tracker: points/quests, nutrition (manual + Open Food Facts barcode + optional hosted AI photo estimates), gym metrics, supplements, JSON backup.

## Run

```bash
cd life-rpg
npm install
npm run web
# or: npm run ios / npm run android
```

The `postinstall` script generates tiny placeholder PNGs if you later add icons to `app.json`.

## Notes

- **Web database:** the browser build does **not** use `expo-sqlite` (no native `ExpoSQLite` module). It uses **sql.js** (SQLite in WASM) and saves the DB to **localStorage** under the key `life-rpg-sqljs-v1`. The first load must reach **cdnjs** to download `sql-wasm.wasm` (needs internet once). iOS/Android still use `expo-sqlite` on device storage.
- Open Food Facts lookups follow their fair-use guidance; include contact info in `User-Agent` if you fork.
- **Web caveat:** browsers may block Open Food Facts requests due to CORS; barcode lookup is most reliable on iOS/Android builds.
- Optional AI uses **your** API key and stores it locally (not encrypted). Treat this as a convenience toggle, not a medical device.
