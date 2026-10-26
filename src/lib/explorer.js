// Explorer progress is kept in this browser only (no accounts, no personal data).
const KEY = 'zts-explorer-v1'

export const ranks = [
  { min: 0, title: 'Trainee Explorer', emoji: '🎒' },
  { min: 2, title: 'Route Scout', emoji: '🧭' },
  { min: 5, title: 'Network Navigator', emoji: '🛰️' },
  { min: 9, title: 'ZTS Mission Captain', emoji: '🚀' },
  { min: 14, title: 'Future Leader', emoji: '🌟' },
]

const arr = (v) => (Array.isArray(v) ? v : [])

export function readProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { visited: arr(p.visited), quizzes: arr(p.quizzes), wins: arr(p.wins) }
  } catch {
    return { visited: [], quizzes: [], wins: [] }
  }
}

function add(field, value) {
  const p = readProgress()
  if (p[field].includes(value)) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...p, [field]: [...p[field], value] }))
  } catch {
    // storage blocked: progress simply will not persist
  }
}

export const recordVisit = (slug) => add('visited', slug)
export const recordQuizWin = (slug) => add('quizzes', slug)
// Game wins use keys like "mission:snow-medicine" or "guess:helicopter".
export const recordWin = (key) => add('wins', key)

export const scoreOf = (p) => p.visited.length + p.quizzes.length + p.wins.length

export function rankFor(score) {
  return [...ranks].reverse().find((r) => score >= r.min)
}
