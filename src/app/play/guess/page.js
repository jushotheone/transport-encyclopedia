import Link from 'next/link'
import { fetchVehicles } from '@/lib/sheets'
import GuessGame from '@/components/GuessGame'
import Icon from '@/components/Icon'

export const revalidate = 300
export const metadata = {
  title: 'Who Am I?',
  description: 'Work out the mystery vehicle from the clues. Fewer clues means more points!',
}

export default async function GuessPage() {
  const vehicles = await fetchVehicles()
  // Only send the fields the game needs to the browser.
  const slim = vehicles.map(({ name, slug, system, origin_country, flag_emoji, manufacturers, funFact, bonus_fact, zions_note, description }) => ({
    name, slug, system, origin_country, flag_emoji, manufacturers, funFact, bonus_fact, zions_note, description,
  }))

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/play" className="text-sm font-bold text-zts-blue hover:underline">← All games</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-zts-midnight"><Icon name="eye" className="mr-2 h-9 w-9 text-indigo-600 align-[-0.12em]" />Who Am I?</h1>
      <p className="mb-8 mt-1 text-lg text-zts-graphite/80">
        A mystery vehicle is hiding. Use the clues to work out what it is. The fewer clues you need, the more points you win!
      </p>
      <GuessGame vehicles={slim} />
    </div>
  )
}
