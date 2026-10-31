// "Who Am I?" logic. Pure functions, so they can be tested. The rules that keep every round fair:
//  - a vehicle only appears if it has enough clues to be worked out (MIN_CLUES, counting the division clue)
//  - the choices stay hidden until the child says they are ready, so the points on offer are never a false promise
//  - exactly one wrong answer is a look-alike from the same division (never a near-duplicate); the others come from
//    other divisions, so the division clue rules things out without solving the round
//  - clue 1 describes the vehicle; the division clue only appears when it helps
//  - the vehicle's own name is hidden in every clue
import { getDivision } from '@/lib/divisions'

export const MIN_CLUES = 4
export const ROUNDS = 5

// Hide the vehicle's own name so the clues do not give it away.
export function mask(text, name) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Also hides plurals: "bus" -> "buses", "ferry" -> "ferries".
  const base = /y$/i.test(name) ? `${esc(name.slice(0, -1))}(?:y|ies)` : `${esc(name)}(?:e?s)?`
  return text.replace(new RegExp(base, 'gi'), '▮▮▮')
}

export function cluesFor(v, { division = true } = {}) {
  const d = getDivision(v.system)
  const sentences = (v.description || '').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 15)
  const sentence = (s) => ({ icon: 'megaphone', text: mask(s, v.name) })
  return [
    sentences[0] && sentence(sentences[0]),
    division && d && { icon: 'division', slug: d.slug, text: `I belong to the ${d.name} division.` },
    v.origin_country && { icon: 'globe', flag: v.flag_emoji, text: `I come from ${v.origin_country}.` },
    v.manufacturers.length > 0 && { icon: 'factory', text: `I am built by ${v.manufacturers.join(' and ')}.` },
    v.funFact && { icon: 'sparkles', text: mask(v.funFact, v.name) },
    sentences[1] && sentence(sentences[1]),
    v.bonus_fact && { icon: 'brain', text: mask(v.bonus_fact, v.name) },
    v.zions_note && { icon: 'chat', text: `Zion says: "${mask(v.zions_note, v.name)}"` },
    ...sentences.slice(2).map(sentence),
  ].filter(Boolean)
}

const makeShuffle = (rng) => (arr) => [...arr].sort(() => rng() - 0.5)

// Words that tell vehicles apart. Two vehicles that share many of them are too alike to be fair wrong answers.
const STOP = new Set('about which their there these those other where would could should because while through under again always often every more most very also than then from have been being into over such only each'.split(' '))
const wordsOf = (v) => new Set((`${v.description} ${v.funFact} ${v.bonus_fact}`.toLowerCase().match(/[a-z]{5,}/g) || []).filter((w) => !STOP.has(w)))
export function overlap(a, b) {
  const B = wordsOf(b)
  let n = 0
  for (const w of wordsOf(a)) if (B.has(w)) n++
  return n
}
export const TOO_SIMILAR = 3

// Three wrong answers: one look-alike from the same division (when there is one that is clearly different), the rest from
// other divisions. Returns null when there are not enough fair wrong answers.
export function pickChoices(v, vehicles, rng = Math.random) {
  const shuffle = makeShuffle(rng)
  const fair = vehicles.filter((o) => o.slug !== v.slug && overlap(v, o) < TOO_SIMILAR)
  const same = shuffle(fair.filter((o) => o.system === v.system))
  const far = shuffle(fair.filter((o) => o.system !== v.system))
  const picked = same.slice(0, 1)
  for (const o of far) if (picked.length < 3) picked.push(o)
  for (const o of same.slice(1)) if (picked.length < 3) picked.push(o)
  return picked.length < 3 ? null : shuffle([v, ...picked])
}

export function buildRounds(vehicles, rng = Math.random, rounds = ROUNDS) {
  if (vehicles.length < 4) return []
  const shuffle = makeShuffle(rng)
  const out = []
  for (const v of shuffle(vehicles)) {
    const choices = pickChoices(v, vehicles, rng)
    if (!choices) continue
    const wrong = choices.filter((c) => c.slug !== v.slug)
    const helps = wrong.some((c) => c.system === v.system) && wrong.some((c) => c.system !== v.system)
    const clues = cluesFor(v, { division: helps })
    if (clues.length >= MIN_CLUES) out.push({ vehicle: v, clues, choices })
    if (out.length === rounds) break
  }
  return out.length >= 3 ? out : []
}
