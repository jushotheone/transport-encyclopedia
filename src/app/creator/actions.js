'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { COOKIE, creatorToken, isCreatorAuthed, pinMatches } from '@/lib/creatorAuth'
import { createService } from '@/lib/creatorService'
import { defaultStore, reviewMode, serviceEmail, writeEnabled } from '@/lib/sheetStore'

export async function unlock(formData) {
  if (!pinMatches(formData.get('pin'))) {
    await new Promise((r) => setTimeout(r, 700)) // slows down guessing
    redirect('/creator?wrong=1')
  }
  const jar = await cookies()
  jar.set(COOKIE, creatorToken(), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 })
  redirect('/creator')
}

export async function lock() {
  const jar = await cookies()
  jar.delete(COOKIE)
  redirect('/creator')
}

// Publishing writes to the family's Google Sheet. Every call re-checks the PIN cookie and re-validates everything.
let shared = null
const service = () =>
  (shared ||= createService({
    isAuthed: isCreatorAuthed,
    store: defaultStore(),
    enabled: writeEnabled,
    review: reviewMode,
    email: serviceEmail(),
    onSaved: () => {
      revalidateTag('zts-sheet')
      revalidatePath('/', 'layout')
    },
  }))

export async function publishVehicle(input) {
  return service().publishVehicle(input)
}
export async function updateVehicle(slug, input) {
  return service().updateVehicle(slug, input)
}
export async function publishChallenge(input) {
  return service().publishChallenge(input)
}
