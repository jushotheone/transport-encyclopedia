// src/lib/utils.js

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function capitalise(word) {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Only allow http(s) links from the spreadsheet, nothing like "javascript:".
export function safeUrl(value) {
  try {
    const url = new URL((value || '').trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

export function extractYouTubeID(url) {
  const match = url?.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{6,})/
  )
  return match ? match[1] : null
}

// ---- quiz answers -----------------------------------------------------------------------------------
// Zion types answers by hand, so matching forgives case, spacing, end punctuation, "A)" style prefixes,
// and answers given as a letter or number. A text match always wins over a letter or number match.
const ENUM_PREFIX = /^\s*\(?([a-h]|\d{1,2})[).:]\s+/i

export const cleanChoice = (c) => (c || '').replace(ENUM_PREFIX, '').replace(/\s+/g, ' ').trim()

const norm = (s) =>
  cleanChoice(s)
    .toLowerCase()
    .replace(/^["'\u201c\u201d\u2018\u2019\s]+|["'\u201c\u201d\u2018\u2019\s.!?,;:]+$/g, '')

// Split a pasted list. Newlines, "|" and ";" are used first so a choice may itself contain commas.
export function splitChoices(raw) {
  const t = (raw || '').trim()
  if (!t) return []
  const sep = t.includes('\n') ? /\r?\n/ : t.includes('|') ? /\|/ : t.includes(';') ? /;/ : /,/
  return t.split(sep).map(cleanChoice).filter(Boolean)
}

// Returns one boolean per choice: which choice(s) the typed answer points at.
export function resolveAnswers(choices, answer) {
  const none = choices.map(() => false)
  const a = norm(answer)
  if (!a) return none

  const byText = choices.map((c) => norm(c) === a)
  if (byText.some(Boolean)) return byText

  // "B", "b)", "Option B", "2", "C. Wheels"
  const m = (answer || '').trim().match(/^(?:option\s+|answer\s+)?\(?([a-h]|\d{1,2})\)?(?:[).:]\s*.*|\s*)$/i)
  if (m) {
    const k = m[1].toLowerCase()
    const idx = /\d/.test(k) ? parseInt(k, 10) - 1 : k.charCodeAt(0) - 97
    if (idx >= 0 && idx < choices.length) return choices.map((_, i) => i === idx)
  }

  // Last resort: the answer sits inside exactly one choice (or the other way round).
  const loose = choices.map((c) => {
    const n = norm(c)
    return n.length > 2 && a.length > 2 && (n.includes(a) || a.includes(n))
  })
  return loose.filter(Boolean).length === 1 ? loose : none
}

// A plain-English reason a quiz cannot be played, or null when it is fine.
export function quizProblem(question, choices, answer) {
  if (!question && !choices.length && !answer) return null // no quiz at all is fine
  if (!question) return 'There are answers but no question.'
  if (choices.length < 2) return 'A quiz needs at least 2 choices. Separate them with a new line, "|" or a comma.'
  if (new Set(choices.map(norm)).size !== choices.length) return 'Two of the choices are the same.'
  if (!answer) return 'The right answer is missing.'
  const hits = resolveAnswers(choices, answer).filter(Boolean).length
  if (hits === 0) return `The right answer "${answer}" does not match any choice.`
  if (hits > 1) return `The right answer "${answer}" matches more than one choice.`
  return null
}
