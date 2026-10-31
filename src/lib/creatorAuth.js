import { createHash, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// The Creator Hub is CLOSED unless a creator PIN has been set. With no PIN, or a PIN that is too short to be safe,
// nobody can open it. Set CREATOR_PIN (at least 6 characters) in the hosting settings, then deploy again.
export const COOKIE = 'zts_creator'
export const MIN_PIN = 6

const pin = () => (process.env.CREATOR_PIN || '').trim()
const token = (p) => createHash('sha256').update(`${p}|zts-creator`).digest('hex')

export const pinConfigured = () => pin().length >= MIN_PIN
// 'ok' | 'missing' | 'short', used to tell the grown-up exactly what to fix
export const pinState = () => (!pin() ? 'missing' : pin().length < MIN_PIN ? 'short' : 'ok')

export function pinMatches(attempt) {
  if (!pinConfigured()) return false
  const a = createHash('sha256').update(String(attempt ?? '').trim()).digest()
  const b = createHash('sha256').update(pin()).digest()
  return timingSafeEqual(a, b)
}

export async function isCreatorAuthed() {
  const jar = await cookies() // read first, so this page can never be treated as static
  if (!pinConfigured()) return false
  const have = jar.get(COOKIE)?.value || ''
  const want = token(pin())
  return have.length === want.length && timingSafeEqual(Buffer.from(have), Buffer.from(want))
}

export const creatorToken = () => token(pin())
