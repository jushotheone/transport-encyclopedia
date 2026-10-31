// Writing to the family's Google Sheet. Reading the site's content still uses a read-only key (see sheets.js);
// only the Creator Hub, after the PIN, ever uses this.
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { CHALLENGE_COLUMNS, COLUMNS } from '@/lib/columns'
import { devSheet } from '@/lib/devStore'

const on = (v) => ['1', 'true', 'on', 'yes'].includes(String(v || '').toLowerCase())
export const writeEnabled = () => on(process.env.CREATOR_WRITE)
export const reviewMode = () => on(process.env.CREATOR_REVIEW)
export const googleConfigured = () => Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID)
export const serviceEmail = () => process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''

const letter = (i) => String.fromCharCode(65 + i) // columns A to Z are plenty for this sheet
const slugOf = (row) => String(row._rawData?.[1] ?? '').trim().toLowerCase()

// openSheet(title) returns an object shaped like a Google worksheet. Passing it in keeps this testable.
export function makeStore(openSheet) {
  return {
    async vehicleSlugs() {
      const rows = await (await openSheet('Vehicles')).getRows()
      return new Set(rows.map(slugOf).filter(Boolean))
    },
    async appendVehicle(cells) {
      await (await openSheet('Vehicles')).addRow(cells, { raw: true })
    },
    // Returns false when no row has that slug. Cells are written as plain text so nothing is read as a formula.
    async replaceVehicle(slug, cells) {
      const sheet = await openSheet('Vehicles')
      const row = (await sheet.getRows()).find((r) => slugOf(r) === slug.toLowerCase())
      if (!row) return false
      const n = row.rowNumber
      await sheet.loadCells(`A${n}:${letter(COLUMNS.length - 1)}${n}`)
      cells.forEach((v, i) => {
        const cell = sheet.getCell(n - 1, i)
        if (v === '') cell.value = null
        else cell.stringValue = v
      })
      await sheet.saveUpdatedCells()
      return true
    },
    async appendChallenge(cells) {
      await (await openSheet('Challenges')).addRow(cells, { raw: true })
    },
  }
}

async function googleOpen(title) {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth)
  await doc.loadInfo()
  let sheet = doc.sheetsByTitle[title]
  // The Challenges tab is optional, so it is created the first time a question is published.
  if (!sheet && title === 'Challenges') sheet = await doc.addSheet({ title, headerValues: CHALLENGE_COLUMNS })
  if (!sheet) throw new Error(`The sheet has no tab called "${title}"`)
  return sheet
}

export const defaultStore = () => makeStore(googleConfigured() ? googleOpen : async (title) => devSheet(title))
