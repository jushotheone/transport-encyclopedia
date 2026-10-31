// "Sheet doctor" and the Creator Hub's checklists. Pure functions, so they run on the server and in the browser.
import { divisions } from '@/lib/divisions'
import { extractYouTubeID, quizProblem, safeUrl } from '@/lib/utils'

// What each piece of a vehicle's file unlocks in the game. This is what makes filling in the sheet worth it.
const CHECKLIST = [
  { key: 'description', label: 'A clear description', unlocks: 'The explanation on its card deck', done: (v) => v.description.length >= 40 },
  { key: 'image', label: 'A photo', unlocks: 'A photo on its card, plus "Which vehicle is this?" questions', done: (v) => !!safeUrl(v.image) },
  { key: 'funFact', label: 'A fun fact', unlocks: 'A Fun Fact card, plus Fact or Fake and "Which vehicle?" questions', done: (v) => (v.funFact || v.bonus_fact).length >= 30 },
  { key: 'origin_country', label: 'Where it is from', unlocks: 'A Where Is It From card and country questions', done: (v) => !!v.origin_country },
  { key: 'manufacturers', label: 'Who builds it', unlocks: 'A Who Builds It card and "Which company?" questions', done: (v) => v.manufacturers.length > 0 },
  { key: 'zions_note', label: 'Your own note', unlocks: 'Your voice in the game: it becomes "Zion said this, which vehicle?" questions', done: (v) => v.zions_note.length >= 25 },
  { key: 'zions_recommendation', label: 'Your recommendation', unlocks: 'A "Zion recommends" card', done: (v) => v.zions_recommendation.length >= 10 },
  { key: 'quiz', label: 'A quiz question', unlocks: 'A quiz card, and a question in the Daily Challenge and Endless Run', done: (v) => !!v.quiz_question && !quizProblem(v.quiz_question, v.quiz_choices, v.quiz_answer) },
  { key: 'sound', label: 'A sound', unlocks: 'A "Hear it" button, plus "Which vehicle makes this sound?" questions', done: (v) => !!safeUrl(v.custom_sound_url) },
  { key: 'video', label: 'A video', unlocks: 'A video card', done: (v) => !!extractYouTubeID(v.video_url) },
  { key: 'more_images', label: 'More photos', unlocks: 'Extra photo cards', done: (v) => v.more_images.some((u) => safeUrl(u)) },
]

export function completeness(v) {
  const items = CHECKLIST.map(({ key, label, unlocks, done }) => ({ key, label, unlocks, done: !!done(v) }))
  const done = items.filter((i) => i.done).length
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) }
}

// Plain-English problems in the sheet, worst first. `level` is "error" (something will not work) or "tip".
export function auditVehicles(vehicles) {
  const issues = []
  const add = (v, level, message) => issues.push({ slug: v.slug, name: v.name, level, message })
  const seen = new Map()
  const validDivisions = divisions.map((d) => d.slug).join(', ')

  for (const v of vehicles) {
    seen.set(v.slug.toLowerCase(), (seen.get(v.slug.toLowerCase()) || 0) + 1)
    if (/[^a-z0-9-]/.test(v.slug)) add(v, 'error', `The slug "${v.slug}" can only use lowercase letters, numbers and dashes. Try "${v.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}".`)
    if (!divisions.some((d) => d.slug === v.system)) add(v, 'error', `The division "${v.system}" is not one of the eight. Use one of: ${validDivisions}.`)
    if (v.image && !safeUrl(v.image)) add(v, 'error', 'The photo link is not a web address that starts with https://.')
    if (v.video_url && !extractYouTubeID(v.video_url)) add(v, 'error', 'The video link is not a YouTube link.')
    if (v.custom_sound_url && !safeUrl(v.custom_sound_url)) add(v, 'error', 'The sound link is not a web address that starts with https://.')
    const quiz = quizProblem(v.quiz_question, v.quiz_choices, v.quiz_answer)
    if (quiz) add(v, 'error', `Quiz: ${quiz} The quiz is hidden from the game until this is fixed.`)
    if (v.origin_country && !v.flag_emoji) add(v, 'tip', 'Add a flag next to the country so it shows on the card.')
    if (v.description && v.description.length < 40) add(v, 'tip', 'The description is very short. A couple of sentences makes a better card deck.')
  }
  for (const [slug, n] of seen) {
    if (n > 1) issues.push({ slug, name: slug, level: 'error', message: `The slug "${slug}" is used ${n} times. Each vehicle needs its own.` })
  }
  return issues.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1))
}

// Badges for the person building the sheet, earned by what is actually in it.
export function creatorBadges(vehicles, challenges) {
  const quizzes = vehicles.filter((v) => completeness(v).items.find((i) => i.key === 'quiz').done).length
  const notes = vehicles.filter((v) => v.zions_note.length >= 25).length
  const photos = vehicles.filter((v) => safeUrl(v.image)).length
  const sounds = vehicles.filter((v) => safeUrl(v.custom_sound_url)).length
  const divs = new Set(vehicles.map((v) => v.system)).size
  const tiers = (n, goal) => ({ progress: `${Math.min(n, goal)} of ${goal}`, got: n >= goal })
  return [
    { id: 'first', icon: 'sprout', name: 'First entry', how: 'Add your first vehicle', ...tiers(vehicles.length, 1) },
    { id: 'five', icon: 'layers', name: 'Collection builder', how: 'Add 5 vehicles', ...tiers(vehicles.length, 5) },
    { id: 'ten', icon: 'trophy', name: 'Encyclopedia author', how: 'Add 10 vehicles', ...tiers(vehicles.length, 10) },
    { id: 'divs', icon: 'globe', name: 'World builder', how: 'Cover all 8 divisions', ...tiers(divs, 8) },
    { id: 'quiz', icon: 'brain', name: 'Quiz maker', how: 'Write 3 working quizzes', ...tiers(quizzes, 3) },
    { id: 'story', icon: 'megaphone', name: 'Storyteller', how: 'Write 5 notes in your own voice', ...tiers(notes, 5) },
    { id: 'photo', icon: 'eye', name: 'Photographer', how: 'Add 5 photos', ...tiers(photos, 5) },
    { id: 'sound', icon: 'volume', name: 'Sound designer', how: 'Add a sound', ...tiers(sounds, 1) },
    { id: 'writer', icon: 'pencil', name: 'Question writer', how: 'Write 3 challenges for friends', ...tiers(challenges.length, 3) },
  ]
}
