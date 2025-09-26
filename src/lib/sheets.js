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
  const rows = await sheet.getRows()

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
        ? raw[6]
            .split(/[,|•]+/) // supports commas, pipes, or bullets as delimiters
            .map((m) => m.trim())
            .filter(Boolean)
        : [],
      more_images: raw[7]
        ? raw[7].split(',').map((img) => img.trim())
        : [],
      video_url: raw[8]?.trim() || '',
      zions_note: raw[9]?.trim() || '',
      origin_country: raw[10]?.trim() || '',
      flag_emoji: raw[11]?.trim() || '',
      bonus_fact: raw[12]?.trim() || '',
      learn_more: raw[13]?.trim() || '',
      quiz_question: raw[14]?.trim() || '',
      quiz_choices: raw[15]
        ? raw[15].split(',').map((q) => q.trim())
        : [],
      quiz_answer: raw[16]?.trim() || '',
      custom_sound_url: raw[17]?.trim() || '',
      zions_recommendation: raw[18]?.trim() || '',
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