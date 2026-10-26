import { fetchVehicles } from '@/lib/sheets'
import CardGrid from '@/components/CardGrid'

export const revalidate = 300
export const metadata = { title: 'My Cards', description: 'Collect every vehicle card in the Zion Transport System.' }

export default async function CardsPage() {
  const vehicles = await fetchVehicles()
  const slim = vehicles.map(({ name, slug, system, image, origin_country, flag_emoji, funFact, description }) => ({ name, slug, system, image, origin_country, flag_emoji, funFact, description }))
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-extrabold text-zts-midnight">🃏 My Cards</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Finish a vehicle&apos;s card deck to unlock its collectible card. Tap a card to flip it. Rare ones sparkle!</p>
      <CardGrid vehicles={slim} filterable />
    </div>
  )
}
