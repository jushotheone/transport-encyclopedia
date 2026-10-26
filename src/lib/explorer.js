// Explorer progress is kept in this browser only (no accounts, no personal data).
const KEY = 'zts-explorer-v1'

export const ranks = [
  { min: 0, title: 'Trainee Explorer', emoji: '🎒' },
  { min: 2, title: 'Route Scout', emoji: '🧭' },
  { min: 5, title: 'Network Navigator', emoji: '🛰️' },
  { min: 9, title: 'ZTS Mission Captain', emoji: '🚀' },
  { min: 14, title: 'Future Leader', emoji: '🌟' },
]

export function readProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
    }
  } catch {
    return { visited: [], quizzes: [] }
  }
}

function save(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // storage blocked: progress simply will not persist
  }
}

export function recordVisit(slug) {
  const p = readProgress()
  if (!p.visited.includes(slug)) save({ ...p, visited: [...p.visited, slug] })
}

export function recordQuizWin(slug) {
  const p = readProgress()
  if (!p.quizzes.includes(slug)) save({ ...p, quizzes: [...p.quizzes, slug] })
}

export function scoreOf(p) {
  return p.visited.length + p.quizzes.length
}

export function rankFor(score) {
  return [...ranks].reverse().find((r) => score >= r.min)
}
