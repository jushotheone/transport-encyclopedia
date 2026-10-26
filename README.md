# Zion Transport System: The Explorer's Encyclopedia

The kids' companion site for the *Zion Transport System* animated series (ages 8-10). Each vehicle in the
Google Sheet becomes a "mission file" with Zion's explanation, fun facts, a quiz, read-aloud and more.

## Run it

```bash
npm install
npm run dev
```

Without any setup the site shows a couple of sample vehicles. To use the real content, create `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=...
```

Share the sheet (view access) with the service account email. **Never commit keys.** On Vercel, add the same
three values under Project Settings, Environment Variables.

## The sheet

A tab called `Vehicles`. Column order is defined in `src/lib/sheets.js` (`COLUMNS`). Add new columns at the end.
Content is cached for 5 minutes, so edits appear without a redeploy.

## Where things live

- `src/lib/divisions.js` has the eight divisions with the official ZTS colours (Creative Strategy v1.2).
- `tailwind.config.js` has the ZTS master palette.
- `src/components/` has the quiz, read-aloud, explorer rank and cards.

## What is in the app

- **Gateway intro** and a living **network map** (home). The Route Breaker has broken each division's route.
- **Route Builder**: a tile puzzle per division (3 levels each). On levels 2 and 3 the Route Breaker breaks a tile and the player must find a backup route. Puzzles are generated from a seed (`src/lib/routegen.js`) and are always solvable.
- **Vehicle card decks**, collectible **cards** with rarity and pack-opening, **Mission Planner**, **Who Am I?** and the **Design Studio**.
- **Daily streaks**, daily missions with a chest, real-world **field missions**, badges, a learning log and the **Explorer Passport**.
- **Control Room**: one clue unlocks per repaired route. The clues in `src/lib/story.js` are placeholders that never reveal what the Route Breaker is.

All progress is stored in the browser (`src/lib/explorer.js`). There are no accounts and no personal data.
