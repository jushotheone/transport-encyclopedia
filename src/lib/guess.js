// "Who Am I?" logic. Pure functions, so they can be tested. The rules that keep every round fair:
//  - a vehicle only appears if it has enough clues to be worked out (MIN_CLUES, counting the division clue)
//  - the division clue is only used when it helps without giving the answer away: at least one wrong answer shares the
//    division (so it does not solve the round) and at least one does not (so it rules something out)
//  - clues go from vague to specific, and the vehicle's own name is hidden in every clue
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
    division && d && { icon: 'division', slug: d.slug, text: `I belong to the ${d.name} division.` },
    v.origin_country && { icon: 'globe', flag: v.flag_emoji, text: `I come from ${v.origin_country}.` },
    v.manufacturers.length > 0 && { icon: 'factory', text: `I am built by ${v.manufacturers.join(' and ')}.` },
    sentences[0] && sentence(sentences[0]),
    v.funFact && { icon: 'sparkles', text: mask(v.funFact, v.name) },
    sentences[1] && sentence(sentences[1]),
    v.bonus_fact && { icon: 'brain', text: mask(v.bonus_fact, v.name) },
    v.zions_note && { icon: 'chat', text: `Zion says: "${mask(v.zions_note, v.name)}"` },
    ...sentences.slice(2).map(sentence),
  ].filter(Boolean)
}

const makeShuffle = (rng) => (arr) => [...arr].sort(() => rng() - 0.5)

// Three wrong answers: at most two from the same division, and at least one from a different one when possible.
export function pickChoices(v, vehicles, rng = Math.random) {
  const shuffle = makeShuffle(rng)
  const others = vehicles.filter((o) => o.slug !== v.slug)
  const same = shuffle(others.filter((o) => o.system === v.system))
  const far = shuffle(others.filter((o) => o.system !== v.system))
  const wrong = [...same.slice(0, 2), ...far]
  const picked = wrong.slice(0, 3)
  // top up from the leftovers if one pool ran dry
  for (const o of [...same.slice(2), ...far]) if (picked.length < 3 && !picked.includes(o)) picked.push(o)
  return shuffle([v, ...picked])
}

export function buildRounds(vehicles, rng = Math.random, rounds = ROUNDS) {
  if (vehicles.length < 4) return []
  const shuffle = makeShuffle(rng)
  const out = []
  for (const v of shuffle(vehicles)) {
    const choices = pickChoices(v, vehicles, rng)
    const wrong = choices.filter((c) => c.slug !== v.slug)
    const helps = wrong.some((c) => c.system === v.system) && wrong.some((c) => c.system !== v.system)
    const clues = cluesFor(v, { division: helps })
    if (clues.length >= MIN_CLUES) out.push({ vehicle: v, clues, choices })
    if (out.length === rounds) break
  }
  return out.length >= 3 ? out : []
}
