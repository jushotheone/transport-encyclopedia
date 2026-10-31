// The Creator Hub "quest": the order Zion is asked things in, the card tiers, and one-tap helpers.
// Pure functions, so they can be tested without a browser.
import { quizProblem, resolveAnswers, splitChoices } from '@/lib/utils'

export const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Italy', 'Spain', 'Japan', 'China', 'South Korea', 'India', 'Canada',
  'Australia', 'Brazil', 'Sweden', 'Switzerland', 'Netherlands', 'Russia', 'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt',
  'Turkey', 'Mexico', 'Norway', 'Finland', 'Austria', 'Poland', 'Ukraine', 'Singapore', 'United Arab Emirates',
]

// Each step is one friendly question from Zion. `item` links it to a line in the completeness checklist.
export const STEPS = [
  { key: 'description', item: 'description', title: 'Tell me about it', ask: 'Explain it like you are telling a friend. What is it, and what does it do?' },
  { key: 'funFact', item: 'funFact', title: 'The wow fact', ask: 'What is the one fact that makes people say WOW?' },
  { key: 'zions_note', item: 'zions_note', title: 'Your opinion', ask: 'What is the coolest thing about it, in YOUR opinion?' },
  { key: 'zions_recommendation', item: 'zions_recommendation', title: 'Zion recommends', ask: 'Would you ride it? Who should try it, and why?' },
  { key: 'origin_country', item: 'origin_country', title: 'Where is it from?', ask: 'Tap the country it comes from.' },
  { key: 'manufacturers', item: 'manufacturers', title: 'Who builds it?', ask: 'Tap a company, or type a new one.' },
  { key: 'quiz', item: 'quiz', title: 'Make a quiz', ask: 'Try to trick your friends. Make a question, with one right answer and some wrong ones.' },
  { key: 'extras', item: 'image', title: 'Photo and extras', ask: 'Photos, sounds and videos make a card come alive. A grown-up can help you find the links.' },
]

// First step whose checklist item is not done yet (so editing starts where the work is needed).
export function firstMissingStep(items) {
  const open = STEPS.findIndex((s) => {
    if (s.key === 'extras') return items.some((i) => ['image', 'sound', 'video'].includes(i.key) && !i.done)
    return items.find((i) => i.key === s.item && !i.done)
  })
  return open === -1 ? 0 : open
}

export function stepDone(step, items) {
  if (step.key === 'extras') return items.filter((i) => ['image', 'sound', 'video'].includes(i.key)).some((i) => i.done)
  return Boolean(items.find((i) => i.key === step.item)?.done)
}

// ---- card tiers ---------------------------------------------------------------------------------------
export const TIERS = [
  { id: 'bronze', name: 'Bronze', min: 0, ring: 'linear-gradient(135deg,#E0A370,#8A4F1D)', text: '#8A4F1D', icon: 'medal' },
  { id: 'silver', name: 'Silver', min: 35, ring: 'linear-gradient(135deg,#F1F5F9,#8E9AA6)', text: '#51606E', icon: 'medal' },
  { id: 'gold', name: 'Gold', min: 65, ring: 'linear-gradient(135deg,#FFE27A,#D99A00)', text: '#8A6100', icon: 'trophy' },
  { id: 'legendary', name: 'Legendary', min: 90, ring: 'linear-gradient(135deg,#7057D9,#1D9BF0,#F28C28,#7057D9)', text: '#4A36B0', icon: 'crown' },
]
export const tierFor = (pct) => [...TIERS].reverse().find((t) => pct >= t.min)
export const nextTier = (pct) => TIERS.find((t) => t.min > pct) || null

// ---- one-tap helpers ----------------------------------------------------------------------------------
const sameText = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase()

function pick(pool, right, n, rand) {
  const seen = new Set([right.trim().toLowerCase()])
  const options = []
  for (const p of pool) {
    const k = (p || '').trim().toLowerCase()
    if (k && !seen.has(k)) { seen.add(k); options.push(p.trim()) }
  }
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }
  return options.slice(0, n)
}

// Every country, and every company, already used by vehicles in the sheet. Used as wrong answers and as tap suggestions.
export function suggestions(vehicles) {
  const count = (list) => {
    const m = new Map()
    for (const x of list) if (x) m.set(x, (m.get(x) || 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([x]) => x)
  }
  const countries = count(vehicles.map((v) => (v.origin_country || '').trim()))
  const fromList = COUNTRIES.filter((c) => !countries.some((x) => sameText(x, c)))
  return {
    countries: [...countries, ...fromList],
    makers: count(vehicles.flatMap((v) => v.manufacturers || [])),
  }
}

// A ready-made quiz from facts Zion already gave. Returns { question, right, wrongs } or null.
export function quickQuiz(kind, vehicle, sugg, rand = Math.random) {
  const name = (vehicle.name || '').trim()
  if (!name) return null
  if (kind === 'country') {
    const right = (vehicle.origin_country || '').trim()
    if (!right) return null
    return { question: `Which country does the ${name} come from?`, right, wrongs: pick(sugg.countries, right, 3, rand) }
  }
  if (kind === 'maker') {
    const right = (vehicle.manufacturers || [])[0]
    if (!right) return null
    const wrongs = pick(sugg.makers, right, 3, rand)
    return wrongs.length ? { question: `Which company builds the ${name}?`, right, wrongs } : null
  }
  return null
}

// Puts the right answer at a spot in the list and returns the strings the sheet stores.
export function assembleQuiz({ question, right, wrongs }, rand = Math.random) {
  const w = wrongs.map((x) => x.trim()).filter(Boolean)
  const r = (right || '').trim()
  if (!r) return { quiz_question: (question || '').trim(), quiz_choices: w.join('\n'), quiz_answer: '' }
  const at = Math.floor(rand() * (w.length + 1))
  const choices = [...w.slice(0, at), r, ...w.slice(at)]
  return { quiz_question: (question || '').trim(), quiz_choices: choices.join('\n'), quiz_answer: r }
}

// Reads a stored quiz back into the right answer and up to three wrong ones.
export function disassembleQuiz(question, choicesText, answer) {
  const choices = splitChoices(choicesText)
  const hit = resolveAnswers(choices, answer).findIndex(Boolean)
  const right = hit >= 0 ? choices[hit] : ''
  const wrongs = choices.filter((_, i) => i !== hit)
  return { question: question || '', right, wrongs: [0, 1, 2].map((i) => wrongs[i] || '') }
}

export { quizProblem }
