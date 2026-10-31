// Everything the Creator Hub is allowed to write, checked on the SERVER whatever the browser sends.
// Pure functions (no network), so they can be tested. Returns friendly, plain-English problems for a child.
import { divisions } from '@/lib/divisions'
import { flagFor } from '@/lib/flags'
import { toCells, toChallengeCells } from '@/lib/columns'
import { cleanChoice, extractYouTubeID, quizProblem, safeUrl, slugify } from '@/lib/utils'

// Text that starts with = + - @ can be read as a formula by spreadsheet programs, so those characters are removed.
const FORMULA_START = /^[=+\-@\s]+/
export const clean = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(FORMULA_START, '')
    .slice(0, max)

const list = (v) => (Array.isArray(v) ? v : String(v ?? '').split(/[,\n|;]+/))
const items = (v, max, each) => list(v).map((x) => clean(x, each)).filter(Boolean).slice(0, max)

export function buildVehicle(input, { mode = 'new', slug: fixedSlug = '', existingSlugs = new Set() } = {}) {
  const errors = []
  const v = {
    name: clean(input.name, 60),
    system: clean(input.system, 20).toLowerCase(),
    description: clean(input.description, 700),
    funFact: clean(input.funFact, 300),
    bonus_fact: clean(input.bonus_fact, 300),
    manufacturers: items(input.manufacturers, 6, 40),
    origin_country: clean(input.origin_country, 60),
    zions_note: clean(input.zions_note, 240),
    zions_recommendation: clean(input.zions_recommendation, 200),
    image: String(input.image ?? '').trim(),
    custom_sound_url: String(input.custom_sound_url ?? '').trim(),
    video_url: String(input.video_url ?? '').trim(),
    more_images: items(input.more_images, 5, 500),
    learn_more: items(input.learn_more, 5, 500),
    quiz_question: clean(input.quiz_question, 160),
    quiz_choices: (Array.isArray(input.quiz_choices) ? input.quiz_choices : String(input.quiz_choices ?? '').split(/\r?\n|\|/))
      .map((c) => clean(cleanChoice(c), 80)).filter(Boolean).slice(0, 6),
    quiz_answer: clean(cleanChoice(input.quiz_answer), 80),
  }

  if (v.name.length < 2) errors.push('Give your vehicle a name.')
  if (!divisions.some((d) => d.slug === v.system)) errors.push('Pick which division it belongs to.')
  if (v.description.length < 15) errors.push('Tell your friends a little more about it. Write at least a sentence.')

  let slug = fixedSlug
  if (mode === 'new') {
    slug = slugify(v.name)
    if (!slug) errors.push('That name needs some letters or numbers in it.')
    else if (existingSlugs.has(slug)) errors.push('There is already a vehicle with that name. Try a different one, or open it from "Your vehicle files" to add to it.')
  } else if (!slug) errors.push('That vehicle could not be found.')

  // Links: only real web addresses, never anything that runs code.
  for (const [key, label] of [['image', 'photo'], ['custom_sound_url', 'sound']]) {
    if (v[key]) {
      const url = safeUrl(v[key])
      if (url) v[key] = url
      else errors.push(`The ${label} link needs to be a web address that starts with https://`)
    }
  }
  if (v.video_url && !extractYouTubeID(v.video_url)) errors.push('The video link needs to be a YouTube link.')
  const bad = [...v.more_images, ...v.learn_more].some((u) => !safeUrl(u))
  if (bad) errors.push('One of the extra links is not a web address that starts with https://')
  v.more_images = v.more_images.map(safeUrl).filter(Boolean)
  v.learn_more = v.learn_more.map(safeUrl).filter(Boolean).join(', ')

  // A quiz has to make sense: a question, 2 to 6 different choices, and a right answer that is one of them.
  const quizBits = v.quiz_question || v.quiz_choices.length || v.quiz_answer
  if (quizBits) {
    const problem = quizProblem(v.quiz_question, v.quiz_choices, v.quiz_answer)
    if (problem) errors.push(`Quiz: ${problem}`)
  }

  v.flag_emoji = flagFor(v.origin_country)
  if (errors.length) return { ok: false, errors }
  v.slug = slug
  return { ok: true, slug, vehicle: v, cells: toCells(v) }
}

export function buildChallenge(input, { review = false, knownSlugs = null } = {}) {
  const errors = []
  const question = clean(input.question, 160)
  const correct = clean(cleanChoice(input.correct), 80)
  const wrongs = (Array.isArray(input.wrongs) ? input.wrongs : []).map((w) => clean(cleanChoice(w), 80)).filter(Boolean).slice(0, 3)
  const explanation = clean(input.explanation, 300)
  const vehicle = clean(input.vehicle, 60).toLowerCase()

  if (question.length < 5) errors.push('Write your question.')
  if (!correct) errors.push('Type the right answer.')
  if (wrongs.length < 1) errors.push('Add at least one wrong answer.')
  if (new Set([correct, ...wrongs].map((x) => x.toLowerCase())).size !== wrongs.length + 1) errors.push('Every answer needs to be different.')
  if (vehicle && knownSlugs && !knownSlugs.has(vehicle)) errors.push('That vehicle could not be found.')
  if (errors.length) return { ok: false, errors }
  // With review on, a grown-up has to change "no" to "yes" in the sheet before the question appears in the games.
  return { ok: true, cells: toChallengeCells({ vehicle, question, correct, wrongs, explanation, approved: review ? 'no' : 'yes' }), review }
}
