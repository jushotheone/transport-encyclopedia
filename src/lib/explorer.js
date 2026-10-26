'use client'
import { useSyncExternalStore } from 'react'
import { toast } from '@/lib/toast'
import { expeditions, spotKey } from '@/lib/expeditions'

// All explorer progress lives in this browser only (no accounts, no personal data).
const KEY = 'zts-explorer-v2'
const OLD_KEY = 'zts-explorer-v1'

export const ranks = [
  { min: 0, title: 'Trainee Explorer', icon: 'backpack' },
  { min: 8, title: 'Route Scout', icon: 'compass' },
  { min: 25, title: 'Network Navigator', icon: 'satellite' },
  { min: 60, title: 'ZTS Mission Captain', icon: 'rocket' },
  { min: 120, title: 'Future Leader', icon: 'star' },
]

export const AVATARS = ['rocket', 'cat', 'bird', 'fish', 'dog', 'bot', 'rabbit', 'sprout']

const EMPTY = {
  profile: { name: '', avatar: AVATARS[0] },
  music: false,
  visited: [],
  quizzes: [],
  wins: [],
  cards: [],
  levels: {},
  learned: [], // [{ id, text }]
  designs: [], // the Design Studio garage
  intro: false,
  muted: false,
  streak: 0,
  bestStreak: 0,
  lastDay: '',
  freezes: 0,
  bonus: 0,
  daily: { day: '', flags: [], claimed: false },
  fieldCount: 0,
  challenge: { best: 0, daily: { day: '', score: 0, total: 0 } },
}
// Server render pretends the intro was seen so crawlers and first paint never get blocked by it.
const SERVER = { ...EMPTY, intro: true }

const arr = (v) => (Array.isArray(v) ? v : [])
const num = (v) => (Number.isFinite(v) ? v : 0)

// "2026-10-26" in the child's own time zone.
export const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA')
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000)

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null') || JSON.parse(localStorage.getItem(OLD_KEY) || 'null') || {}
    const daily = raw.daily && typeof raw.daily === 'object' ? raw.daily : {}
    const prof = raw.profile && typeof raw.profile === 'object' ? raw.profile : {}
    return {
      profile: {
        name: typeof prof.name === 'string' ? prof.name.slice(0, 14) : '',
        avatar: AVATARS.includes(prof.avatar) ? prof.avatar : AVATARS[0],
      },
      music: !!raw.music,
      visited: arr(raw.visited),
      quizzes: arr(raw.quizzes),
      wins: arr(raw.wins),
      cards: arr(raw.cards),
      levels: raw.levels && typeof raw.levels === 'object' ? raw.levels : {},
      learned: arr(raw.learned),
      designs: arr(raw.designs),
      intro: !!raw.intro,
      muted: !!raw.muted,
      streak: num(raw.streak),
      bestStreak: num(raw.bestStreak),
      lastDay: typeof raw.lastDay === 'string' ? raw.lastDay : '',
      freezes: num(raw.freezes),
      bonus: num(raw.bonus),
      daily: { day: daily.day || '', flags: arr(daily.flags), claimed: !!daily.claimed },
      fieldCount: num(raw.fieldCount),
      challenge: {
        best: num(raw.challenge?.best),
        daily: {
          day: raw.challenge?.daily?.day || '',
          score: num(raw.challenge?.daily?.score),
          total: num(raw.challenge?.daily?.total),
        },
      },
    }
  } catch {
    return { ...EMPTY }
  }
}

let state = null
const listeners = new Set()

export function getState() {
  if (typeof window === 'undefined') return SERVER
  if (!state) state = load()
  return state
}

function commit(next) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage blocked: progress simply will not persist
  }
  listeners.forEach((l) => l())
}

function subscribe(cb) {
  listeners.add(cb)
  const onStorage = (e) => {
    if (e.key === KEY) {
      state = load()
      cb()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

export const useExplorer = () => useSyncExternalStore(subscribe, getState, () => SERVER)
export const readProgress = getState

// ---- daily mission flags: 'puzzle' | 'card' | 'play' | 'field' -------------------------------
export const DAILY_FLAGS = ['puzzle', 'card', 'play', 'field']

export function dailyFlags(s) {
  return s.daily.day === dayKey() ? s.daily.flags : []
}

function tick(s, flag) {
  const today = dayKey()
  const flags = s.daily.day === today ? s.daily.flags : []
  const claimed = s.daily.day === today ? s.daily.claimed : false
  if (flags.includes(flag)) return { ...s, daily: { day: today, flags, claimed } }
  return { ...s, daily: { day: today, flags: [...flags, flag], claimed } }
}

function addTo(field, value, flag) {
  const s = getState()
  if (s[field].includes(value)) {
    // repeating something still counts for today's mission
    if (flag) commit(tick(s, flag))
    return false
  }
  let next = { ...s, [field]: [...s[field], value] }
  if (flag) next = tick(next, flag)
  commit(next)
  return true
}

export const recordVisit = (slug) => addTo('visited', slug)
export const recordQuizWin = (slug) => addTo('quizzes', slug, 'play')
// Game wins use keys like "mission:snow-medicine" or "guess:helicopter".
export const recordWin = (key) => addTo('wins', key, 'play')
// Returns true when the card is new to the collection.
export const recordCard = (slug) => addTo('cards', slug, 'card')

export function recordRun(correct) {
  const s = getState()
  const best = Math.max(s.challenge.best, correct)
  commit(tick({ ...s, challenge: { ...s.challenge, best } }, 'play'))
  return best > s.challenge.best
}

export function recordDaily(day, score, total) {
  const s = getState()
  commit(tick({ ...s, challenge: { ...s.challenge, daily: { day, score, total } } }, 'play'))
}

export const markIntroSeen = () => commit({ ...getState(), intro: true })
export const replayIntro = () => commit({ ...getState(), intro: false })
export const setMuted = (muted) => commit({ ...getState(), muted })
export const setMusic = (music) => commit({ ...getState(), music })
export const setProfile = (patch) => commit({ ...getState(), profile: { ...getState().profile, ...patch } })

// The learning log: each fact is stored once, and the child is told as they earn it.
export function learn(id, text, quiet = false) {
  const s = getState()
  if (s.learned.some((l) => l.id === id)) return false
  commit({ ...s, learned: [...s.learned, { id, text }] })
  if (!quiet) toast(`You learned: ${text}`)
  return true
}

// ---- route repair: levels[division] = { 1: stars, 2: stars, 3: stars } --------------------------
export const levelsCleared = (s, division) => [1, 2, 3].filter((n) => (s.levels[division] || {})[n] > 0).length
export const isRepaired = (s, division) => levelsCleared(s, division) === 3
export const repairedCount = (s, divisions) => divisions.filter((d) => isRepaired(s, d)).length

export function recordLevel(division, level, stars) {
  const s = getState()
  const before = s.levels[division] || {}
  const wasRepaired = isRepaired(s, division)
  const withLevel = { ...s, levels: { ...s.levels, [division]: { ...before, [level]: Math.max(before[level] || 0, stars) } } }
  commit(tick(withLevel, 'puzzle'))
  return { repairedNow: !wasRepaired && isRepaired(getState(), division) }
}

// ---- streaks -------------------------------------------------------------------------------------
export const streakMilestones = [3, 7, 14, 30]

// Call once per visit. Returns a reward summary the first time it runs each day, otherwise null.
export function checkIn() {
  const s = getState()
  const today = dayKey()
  if (s.lastDay === today) return null

  let streak = 1
  let freezeUsed = false
  let freezes = s.freezes
  if (s.lastDay) {
    const gap = daysBetween(s.lastDay, today)
    if (gap === 1) streak = s.streak + 1
    else if (gap === 2 && freezes > 0) {
      streak = s.streak + 1
      freezes -= 1
      freezeUsed = true
    } else if (gap < 1) streak = s.streak
  }
  const earnedFreeze = streak > 0 && streak % 7 === 0 && freezes < 2
  if (earnedFreeze) freezes += 1
  const xp = Math.min(streak, 7) * 2
  const lost = s.streak > 1 && streak === 1 ? s.streak : 0

  commit({
    ...s,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    lastDay: today,
    freezes,
    bonus: s.bonus + xp,
  })
  return { streak, xp, freezeUsed, earnedFreeze, lost, milestone: streakMilestones.includes(streak) }
}

// The streak is "at risk" when the child last played yesterday and has not yet played today.
export const streakAtRisk = (s) => s.streak > 0 && s.lastDay !== dayKey()

export function claimDailyChest() {
  const s = getState()
  const flags = dailyFlags(s)
  if (!DAILY_FLAGS.every((f) => flags.includes(f)) || (s.daily.day === dayKey() && s.daily.claimed)) return false
  commit({ ...s, bonus: s.bonus + 25, daily: { ...s.daily, day: dayKey(), claimed: true } })
  return true
}

export function completeFieldMission() {
  const s = getState()
  if (dailyFlags(s).includes('field')) return false
  commit(tick({ ...s, fieldCount: s.fieldCount + 1, bonus: s.bonus + 5 }, 'field'))
  return true
}

// ---- Design Studio garage ---------------------------------------------------------------------------
export const MAX_DESIGNS = 12

export function saveDesign(design) {
  const s = getState()
  if (s.designs.length >= MAX_DESIGNS) return false
  commit({ ...s, designs: [{ ...design, id: Date.now().toString(36), created: dayKey() }, ...s.designs] })
  return true
}

export const deleteDesign = (id) => commit({ ...getState(), designs: getState().designs.filter((d) => d.id !== id) })

// ---- scoring, ranks and badges ------------------------------------------------------------------------
export function xpOf(s) {
  const cleared = Object.values(s.levels).reduce((n, l) => n + Object.values(l).filter((x) => x > 0).length, 0)
  const repaired = Object.keys(s.levels).filter((d) => isRepaired(s, d)).length
  return (
    s.visited.length +
    s.quizzes.length * 2 +
    s.wins.length * 2 +
    s.cards.length * 3 +
    cleared * 3 +
    repaired * 10 +
    s.learned.length +
    s.designs.length * 4 +
    s.bonus
  )
}

export const scoreOf = xpOf
export const rankFor = (xp) => [...ranks].reverse().find((r) => xp >= r.min)

export function badgesOf(s) {
  const repaired = Object.keys(s.levels).filter((d) => isRepaired(s, d)).length
  const cleared = Object.values(s.levels).reduce((n, l) => n + Object.values(l).filter((x) => x > 0).length, 0)
  const threeStars = Object.values(s.levels).some((l) => Object.values(l).includes(3))
  const expeditionsDone = Object.entries(expeditions).filter(([slug, ex]) => ex.spots.every((p) => s.wins.includes(spotKey(slug, p.id)))).length
  return [
    { id: 'spark', icon: 'zap', name: 'First Spark', how: 'Clear a Route Builder level', got: cleared >= 1 },
    { id: 'fixer', icon: 'wrench', name: 'Route Fixer', how: 'Fully repair one route', got: repaired >= 1 },
    { id: 'perfect', icon: 'star', name: 'Perfectionist', how: 'Win a level with 3 stars', got: threeStars },
    { id: 'hero', icon: 'satellite', name: 'Network Hero', how: 'Repair all 8 routes', got: repaired >= 8 },
    { id: 'collector', icon: 'layers', name: 'Card Collector', how: 'Collect 5 cards', got: s.cards.length >= 5 },
    { id: 'quiz', icon: 'brain', name: 'Quiz Whiz', how: 'Win 5 quizzes', got: s.quizzes.length >= 5 },
    { id: 'trail', icon: 'telescope', name: 'Trailblazer', how: 'Complete an expedition', got: expeditionsDone >= 1 },
    { id: 'world', icon: 'globe', name: 'World Explorer', how: 'Complete all 8 expeditions', got: expeditionsDone >= 8 },
    { id: 'inventor', icon: 'hammer', name: 'Inventor', how: 'Design a vehicle', got: s.designs.length >= 1 },
    { id: 'field', icon: 'binoculars', name: 'Field Explorer', how: 'Finish 3 field missions', got: s.fieldCount >= 3 },
    { id: 'spark3', icon: 'flame', name: 'On Fire', how: 'Reach a 3-day streak', got: s.bestStreak >= 3 },
    { id: 'week', icon: 'medal', name: 'Week Warrior', how: 'Reach a 7-day streak', got: s.bestStreak >= 7 },
    { id: 'scholar', icon: 'book', name: 'Little Scholar', how: 'Learn 15 things', got: s.learned.length >= 15 },
  ]
}
