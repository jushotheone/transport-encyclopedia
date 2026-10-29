import { createHash, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

// The Creator Hub is protected by an optional PIN. Set CREATOR_PIN in the hosting settings to switch it on.
// With no PIN set the hub stays open, so nothing breaks before it is configured.
export const COOKIE = 'zts_creator'

const token = (pin) => createHash('sha256').update(`${pin}|zts-creator`).digest('hex')

export const pinRequired = () => Boolean(process.env.CREATOR_PIN)

export function pinMatches(attempt) {
  const pin = process.env.CREATOR_PIN
  if (!pin) return false
  const a = createHash('sha256').update(String(attempt ?? '').trim()).digest()
  const b = createHash('sha256').update(pin.trim()).digest()
  return timingSafeEqual(a, b)
}

export async function isCreatorAuthed() {
  const jar = await cookies() // read even when no PIN is set, so this page can never be treated as static
  if (!pinRequired()) return true
  const have = jar.get(COOKIE)?.value || ''
  const want = token(process.env.CREATOR_PIN.trim())
  return have.length === want.length && timingSafeEqual(Buffer.from(have), Buffer.from(want))
}

export const creatorToken = () => token(process.env.CREATOR_PIN.trim())
