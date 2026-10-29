'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE, creatorToken, pinMatches } from '@/lib/creatorAuth'

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
