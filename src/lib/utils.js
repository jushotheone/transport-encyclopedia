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

// Sheet answers may be the choice text, a letter (A, B, C) or a number (1, 2, 3).
export function isCorrectAnswer(choice, index, answer) {
  const a = (answer || '').trim().toLowerCase()
  if (!a) return false
  return (
    choice.trim().toLowerCase() === a ||
    a === String.fromCharCode(97 + index) ||
    a === String(index + 1)
  )
}
