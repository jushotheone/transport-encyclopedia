import Link from 'next/link'
import FactGame from '@/components/FactGame'
import { fetchVehicles } from '@/lib/sheets'
import Icon from '@/components/Icon'

export const metadata = { title: 'Fact or Fake?', description: 'Spot the true transport facts and the fakes.' }

export const revalidate = 300

export default async function FactPage() {
  const vehicles = await fetchVehicles()
  const slim = vehicles.map(({ name, slug, funFact }) => ({ name, slug, funFact }))
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/play" className="text-sm font-bold text-zts-blue hover:underline">← All games</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-zts-midnight"><Icon name="search" className="mr-2 h-9 w-9 text-teal-600 align-[-0.12em]" />Fact or Fake?</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Is it true, or is the Route Breaker spreading fake news? Ten quick questions, about one minute.</p>
      <FactGame vehicles={slim} />
    </div>
  )
}
