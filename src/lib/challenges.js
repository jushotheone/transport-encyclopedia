// Challenge engine: builds varied questions from everything in Zion's sheet, so the game changes as he adds content.
// Pure functions (no React). A "question" looks like:
// { id, type, prompt, quote?, media?: { kind: 'image'|'sound', src }, choices: [{ label, sub?, correct }],
//   explain, source: 'zion' | 'data', vehicle }
import { hashString, mulberry32 } from '@/lib/routegen'
import { divisions, getDivision } from '@/lib/divisions'
import { mask } from '@/lib/guess'
import { quizProblem, resolveAnswers, safeUrl } from '@/lib/utils'

const FILLER_COUNTRIES = [['Japan', '🇯🇵'], ['Brazil', '🇧🇷'], ['Kenya', '🇰🇪'], ['Chile', '🇨🇱'], ['Sweden', '🇸🇪'], ['Canada', '🇨🇦'], ['India', '🇮🇳'], ['Australia', '🇦🇺']]

function tools(rng) {
  const shuffle = (a) => {
    const out = [...a]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
  return { shuffle, pick: (a) => a[Math.floor(rng() * a.length)], sample: (a, n) => shuffle(a).slice(0, n) }
}

// Short or vague facts could fit several vehicles, so only specific ones are used for "which vehicle" questions.
const factsOf = (v) => [v.funFact, v.bonus_fact].filter((f) => f && f.length >= 40)
const choice = (label, correct, sub) => ({ label, correct, ...(sub ? { sub } : {}) })

// Distractor vehicles: harder levels draw them from the same division.
function others(ctx, v, n) {
  const { vehicles, level, t } = ctx
  const rest = vehicles.filter((o) => o.slug !== v.slug)
  const near = t.shuffle(rest.filter((o) => o.system === v.system))
  const far = t.shuffle(rest.filter((o) => o.system !== v.system))
  return (level >= 3 ? [...near, ...far] : [...far.slice(0, Math.ceil(n / 2)), ...near, ...far]).filter((o, i, a) => a.indexOf(o) === i).slice(0, n)
}

const nameChoices = (ctx, v) => {
  const d = others(ctx, v, 3)
  return d.length < 3 ? null : ctx.t.shuffle([choice(v.name, true), ...d.map((o) => choice(o.name, false))])
}

export const generators = {
  division: { level: 1, weight: 1, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles)
    const right = v && getDivision(v.system)
    if (!right) return null
    const wrong = ctx.t.sample(divisions.filter((d) => d.slug !== right.slug), 3)
    return { prompt: `Which division does the ${v.name} belong to?`, choices: ctx.t.shuffle([choice(right.name, true), ...wrong.map((d) => choice(d.name, false))]), explain: `The ${v.name} is part of ${right.name}.`, vehicle: v.slug, source: 'data' }
  } },

  origin: { level: 1, weight: 1, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => x.origin_country))
    if (!v) return null
    const seen = new Map(ctx.vehicles.filter((x) => x.origin_country).map((x) => [x.origin_country, x.flag_emoji]))
    FILLER_COUNTRIES.forEach(([c, f]) => seen.has(c) || seen.set(c, f))
    const wrong = ctx.t.sample([...seen].filter(([c]) => c !== v.origin_country), 3)
    return { prompt: `Which country does the ${v.name} come from?`, choices: ctx.t.shuffle([choice(v.origin_country, true, v.flag_emoji), ...wrong.map(([c, f]) => choice(c, false, f))]), explain: `The ${v.name} comes from ${v.origin_country}.`, vehicle: v.slug, source: 'data' }
  } },

  zionQuiz: { level: 1, weight: 3, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => x.quiz_question && !quizProblem(x.quiz_question, x.quiz_choices, x.quiz_answer)))
    if (!v) return null
    return { prompt: v.quiz_question, choices: ctx.t.shuffle(resolveAnswers(v.quiz_choices, v.quiz_answer).map((ok, i) => choice(v.quiz_choices[i], ok))), explain: `${v.name}: ${v.quiz_choices[resolveAnswers(v.quiz_choices, v.quiz_answer).indexOf(true)]}.`, vehicle: v.slug, source: 'zion' }
  } },

  authored: { level: 1, weight: 4, make(ctx) {
    const c = ctx.t.pick(ctx.extra)
    if (!c) return null
    return { prompt: c.question, choices: ctx.t.shuffle([choice(c.correct, true), ...c.wrongs.map((w) => choice(w, false))]), explain: c.explanation || c.correct, vehicle: c.vehicle || '', source: 'zion', authored: true }
  } },

  photo: { level: 1, weight: 2, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => safeUrl(x.image)))
    const choices = v && nameChoices(ctx, v)
    return choices && { prompt: 'Which vehicle is in this picture?', media: { kind: 'image', src: safeUrl(v.image) }, choices, explain: `That is the ${v.name}.`, vehicle: v.slug, source: 'data' }
  } },

  sound: { level: 1, weight: 2, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => safeUrl(x.custom_sound_url)))
    const choices = v && nameChoices(ctx, v)
    return choices && { prompt: 'Listen carefully. Which vehicle makes this sound?', media: { kind: 'sound', src: safeUrl(v.custom_sound_url) }, choices, explain: `That sound belongs to the ${v.name}.`, vehicle: v.slug, source: 'data' }
  } },

  factOwner: { level: 2, weight: 2, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => factsOf(x).length))
    const choices = v && nameChoices(ctx, v)
    return choices && { prompt: 'Which vehicle is this fact about?', quote: mask(ctx.t.pick(factsOf(v)), v.name), choices, explain: `${v.name}: ${factsOf(v)[0]}`, vehicle: v.slug, source: 'data' }
  } },

  noteOwner: { level: 2, weight: 3, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => (x.zions_note || '').length >= 25 || (x.zions_recommendation || '').length >= 25))
    const choices = v && nameChoices(ctx, v)
    if (!choices) return null
    const said = (v.zions_note || '').length >= 25 ? v.zions_note : v.zions_recommendation
    return { prompt: 'Zion said this about a vehicle. Which one?', quote: mask(said, v.name), choices, explain: `Zion was talking about the ${v.name}: "${said}"`, vehicle: v.slug, source: 'zion' }
  } },

  maker: { level: 2, weight: 2, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => x.manufacturers.length))
    if (!v) return null
    // Wrong answers come only from other kinds of vehicle, so none of them could really build this one.
    const pool = [...new Set(ctx.vehicles.filter((x) => x.system !== v.system).flatMap((x) => x.manufacturers))].filter((m) => !v.manufacturers.includes(m))
    if (pool.length < 3) return null
    const right = ctx.t.pick(v.manufacturers)
    return { prompt: `Which company builds the ${v.name}?`, choices: ctx.t.shuffle([choice(right, true), ...ctx.t.sample(pool, 3).map((m) => choice(m, false))]), explain: `${right} builds the ${v.name}.`, vehicle: v.slug, source: 'data' }
  } },

  // A real fact stuck on the wrong vehicle is the "fake". It is always accurate to Zion's own data.
  swap: { level: 2, weight: 2, make(ctx) {
    const v = ctx.t.pick(ctx.vehicles.filter((x) => x.funFact && x.funFact.length >= 30))
    const other = v && ctx.t.pick(ctx.vehicles.filter((x) => x.funFact && x.system !== v.system && x.funFact !== v.funFact))
    if (!other) return null
    const real = ctx.rng() < 0.5
    const shown = real ? v.funFact : other.funFact
    return { prompt: 'True or false?', quote: `${v.name}: ${shown}`, choices: [choice('True', real), choice('False', !real)], explain: real ? `True! ${v.name}: ${v.funFact}` : `False! That fact belongs to the ${other.name}. For the ${v.name}: ${v.funFact}`, vehicle: v.slug, source: 'data' }
  } },

  oddOne: { level: 2, weight: 2, make(ctx) {
    const groups = divisions.map((d) => ctx.vehicles.filter((v) => v.system === d.slug)).filter((g) => g.length >= 3)
    if (!groups.length) return null
    const group = ctx.t.pick(groups)
    const odd = ctx.t.pick(ctx.vehicles.filter((v) => v.system !== group[0].system))
    if (!odd) return null
    const three = ctx.t.sample(group, 3)
    const d1 = getDivision(group[0].system)
    const d2 = getDivision(odd.system)
    return { prompt: 'Which one does NOT belong with the others?', choices: ctx.t.shuffle([...three.map((v) => choice(v.name, false)), choice(odd.name, true)]), explain: `${odd.name} is ${d2?.name || odd.system}. The others are all ${d1?.name || group[0].system}.`, vehicle: odd.slug, source: 'data' }
  } }
}

const TYPES = Object.keys(generators)

// Build one question that is available at this level. Tries different types, avoids repeating the last one.
export function makeQuestion({ vehicles, extra = [], level = 1, rng = Math.random, recent = [] }) {
  const t = tools(rng)
  const ctx = { vehicles, extra, level, rng, t }
  const usable = TYPES.filter((k) => generators[k].level <= level)
  const lastType = recent[recent.length - 1]
  for (let attempt = 0; attempt < 40; attempt++) {
    const weighted = usable.flatMap((k) => Array(generators[k].weight).fill(k))
    const type = t.pick(weighted)
    if (type === lastType && attempt < 25) continue
    const q = generators[type].make(ctx)
    if (!q || q.choices.length < 2 || !q.choices.some((c) => c.correct)) continue
    const signature = `${type}:${q.vehicle}:${q.quote || q.prompt}`
    if (recent.includes(signature) && attempt < 30) continue
    return { id: hashString(signature + q.choices.map((c) => c.label).join()).toString(36), type, level, ...q, signature }
  }
  return null
}

// The Daily Challenge: the same 8 questions for everyone on a given day (so friends can compare scores).
export function dailyQuestions(vehicles, extra, day) {
  const rng = mulberry32(hashString(`daily:${day}`))
  const levels = [1, 1, 2, 2, 2, 3, 3, 3]
  const out = []
  const recent = []
  for (const level of levels) {
    const q = makeQuestion({ vehicles, extra, level, rng, recent })
    if (q) {
      out.push(q)
      recent.push(q.type, q.signature)
    }
  }
  return out
}

// Skill moves up with right answers and drops faster with wrong ones, so every child gets a fair challenge.
export const levelForSkill = (skill) => (skill >= 7 ? 3 : skill >= 3 ? 2 : 1)
