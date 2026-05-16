# Life RPG Companion OS

A polished React/Vite prototype for a habit RPG centered on companion pets, quests, gym logging, and nutrition scanning.

## Features

- Five selectable companions with staged evolution and animated SVG avatars.
- Pet care room with satiety, energy, bond, and spark meters.
- Daily quests, quick actions, weekly XP chart, achievements, and a points ledger.
- Gym movement library for sets and companion XP.
- Nutrition scanner UI backed by `src/services/foodScanner.js`, ready to swap to a real barcode, image recognition, or nutrition API.
- Local profile persistence through `localStorage`.
- Comfort settings for pet animations and focus mode.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
```
