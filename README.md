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

## Zion's content drives the games

The Daily Challenge and Endless Run build questions from **every** field in the `Vehicles` tab (facts, bonus facts, notes,
recommendations, manufacturers, countries, photos, sounds and Zion's own quiz questions), so the more Zion adds, the more
varied the games get. Question logic lives in `src/lib/challenges.js` (12 question types, adaptive difficulty).

### Optional `Challenges` tab (questions written by Zion)

Add a tab named `Challenges` with these columns (row 1 is the header):

| vehicle slug | question | right answer | wrong 1 | wrong 2 | wrong 3 | explanation | approved |
|---|---|---|---|---|---|---|---|

A row only appears in the game when the last column says `yes`. That keeps anything unchecked (for example questions
drafted by an AI helper) away from children until a grown-up has read it.

## Installing as an app

The site is an installable web app (`src/app/manifest.js`, `public/sw.js`). On a phone, "Add to Home Screen" gives
a one-tap icon, which is the easiest way to keep a daily streak going.

## Creator Hub (`/creator`)

For whoever fills in the sheet. It shows how much of the game comes from the sheet, checks every row for mistakes in plain
English (the "Sheet check"), lists what each vehicle is still missing and what adding it would unlock, awards creator badges,
and has two makers with a live preview that copy a ready-made row to paste into the sheet. Optionally set
`NEXT_PUBLIC_CREATOR_SHEET_URL` to the spreadsheet's address to show an "Open my spreadsheet" button.

## Typing quizzes in the sheet

- Put each choice on its own line in the cell (or separate with `|` or `;`). Commas also work, but then a choice cannot contain a comma.
- The right answer can be the text of the choice, or a letter or number (`B`, `2`). Capital letters, spaces, a full stop at the end
  and `A)` prefixes are all forgiven.
- A quiz whose answer does not match exactly one choice is kept out of the game, and the Creator Hub's Sheet check says why.
