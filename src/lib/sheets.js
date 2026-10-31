import { unstable_cache } from 'next/cache'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { sampleChallenges, sampleVehicles } from '@/lib/sampleVehicles'
import { COLUMNS } from '@/lib/columns'
import { cleanChoice, splitChoices } from '@/lib/utils'
import { devRows } from '@/lib/devStore'

const text = (v) => (v ?? '').toString().trim()
const list = (v, splitter = /[,|•]+/) =>
  text(v)
    .split(splitter)
    .map((s) => s.trim())
    .filter(Boolean)

export function parseRow(raw) {
  const cell = (name) => raw[COLUMNS.indexOf(name)]
  return {
    name: text(cell('name')),
    slug: text(cell('slug')),
    system: text(cell('system')).toLowerCase(),
    image: text(cell('image')),
    description: text(cell('description')),
    funFact: text(cell('funFact')),
    manufacturers: list(cell('manufacturers')),
    more_images: list(cell('more_images'), /,/),
    video_url: text(cell('video_url')),
    zions_note: text(cell('zions_note')),
    origin_country: text(cell('origin_country')),
    flag_emoji: text(cell('flag_emoji')),
    bonus_fact: text(cell('bonus_fact')),
    learn_more: text(cell('learn_more')),
    quiz_question: text(cell('quiz_question')),
    quiz_choices: splitChoices(cell('quiz_choices')),
    quiz_answer: text(cell('quiz_answer')),
    custom_sound_url: text(cell('custom_sound_url')),
    zions_recommendation: text(cell('zions_recommendation')),
  }
}

function isConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
  )
}

async function loadFromSheet() {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth)
  await doc.loadInfo()

  const sheet = doc.sheetsByTitle['Vehicles']
  if (!sheet) throw new Error('The sheet has no tab called "Vehicles"')

  const rows = await sheet.getRows()
  return rows
    .map((row) => parseRow(row._rawData))
    .filter((v) => v.name && v.slug)
}

// The sheet is read at most once every five minutes, however many pages are viewed.
const loadCached = unstable_cache(loadFromSheet, ['zts-vehicles'], { revalidate: 300, tags: ['zts-sheet'] })

export async function fetchVehicles() {
  if (!isConfigured()) {
    console.warn('Google Sheet is not configured, showing sample vehicles.')
    // Vehicles published from the Creator Hub while practising locally are shown too (newer entries replace samples).
    const mine = devRows('Vehicles').map(parseRow).filter((v) => v.name && v.slug)
    return [...sampleVehicles.filter((v) => !mine.some((m) => m.slug === v.slug)), ...mine]
  }
  try {
    return await loadCached()
  } catch (err) {
    console.error('Could not load vehicles from Google Sheets:', err.message)
    return []
  }
}

export async function getVehiclesBySystem(system) {
  const wanted = system.toLowerCase().trim()
  const all = await fetchVehicles()
  return all.filter((v) => v.system === wanted)
}

export async function getVehicleBySlug(slug) {
  const wanted = slug.toLowerCase().trim()
  const all = await fetchVehicles()
  return all.find((v) => v.slug.toLowerCase() === wanted)
}

// Optional "Challenges" tab: questions written by Zion (or drafted by a helper and approved by a grown-up).
// Columns: vehicle slug | question | right answer | wrong 1 | wrong 2 | wrong 3 | explanation | approved
// A row only appears in the game when the last column says yes, so nothing unchecked reaches children.
const isYes = (v) => ['yes', 'y', 'true', '1', 'ok', 'approved'].includes(text(v).toLowerCase())

export function parseChallenge(raw) {
  const [vehicle, question, correct, w1, w2, w3, explanation, approved] = raw.map(text)
  const wrongs = [w1, w2, w3].map(cleanChoice).filter(Boolean)
  if (!question || !correct || wrongs.length < 1 || !isYes(approved)) return null
  return { vehicle, question, correct: cleanChoice(correct), wrongs, explanation }
}

async function loadChallengesFromSheet() {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth)
  await doc.loadInfo()
  const sheet = doc.sheetsByTitle['Challenges']
  if (!sheet) return []
  const rows = await sheet.getRows()
  return rows.map((r) => parseChallenge(r._rawData)).filter(Boolean)
}

const loadChallengesCached = unstable_cache(loadChallengesFromSheet, ['zts-challenges'], { revalidate: 300, tags: ['zts-sheet'] })

export async function fetchChallenges() {
  if (!isConfigured()) return [...sampleChallenges, ...devRows('Challenges').map(parseChallenge).filter(Boolean)]
  try {
    return await loadChallengesCached()
  } catch (err) {
    console.error('Could not load challenges from Google Sheets:', err.message)
    return []
  }
}
