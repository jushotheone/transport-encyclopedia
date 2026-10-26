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
