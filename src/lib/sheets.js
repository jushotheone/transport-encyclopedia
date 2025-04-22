import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

// Auth config
const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
})

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth)

export async function fetchVehicles() {
  await doc.loadInfo()
  const sheet = doc.sheetsByTitle['Vehicles']

  // Load all rows (with or without headers)
  const rows = await sheet.getRows()

  // 🔍 Log what's actually inside each row
  console.log('🔍 Row Keys:', Object.keys(rows[0] || {}))
  console.log('[Fetched Rows]', rows.length)

  // Peek inside the raw data to debug column names
  console.log('🔬 First Row Raw Data:', rows[0]?._rawData)

  // Fallback: Try accessing columns from _rawData directly (index-based)
  return rows.map((row) => {
    const raw = row._rawData
    return {
      name: raw[0]?.trim() || '',
      slug: raw[1]?.trim() || '',
      system: raw[2]?.toLowerCase().trim() || '',
      image: raw[3]?.trim() || '',
      description: raw[4]?.trim() || '',
      funFact: raw[5]?.trim() || '',
      manufacturers: raw[6]
        ? raw[6].split(',').map((m) => m.trim())
        : [],
    }
  })
}

export async function getVehiclesBySystem(system) {
  const all = await fetchVehicles()
  const filtered = all.filter(
    (v) => v.system === system.toLowerCase().trim()
  )

  console.log('SYSTEM:', system)
  console.log('VEHICLES:', filtered)

  return filtered
}

export async function getVehicleBySlug(slug) {
  const all = await fetchVehicles()
  return all.find((v) => v.slug === slug.trim())
}