import Link from 'next/link'
import ChallengeGame from '@/components/ChallengeGame'
import Icon from '@/components/Icon'
import { fetchChallenges, fetchVehicles } from '@/lib/sheets'

export const revalidate = 300
export const metadata = { title: 'Endless Run', description: 'Keep answering until you run out of lives. It gets harder the better you do.' }

export default async function RunPage() {
  const [vehicles, extra] = await Promise.all([fetchVehicles(), fetchChallenges()])
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/play" className="text-sm font-bold text-zts-blue hover:underline">All games</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-zts-midnight"><Icon name="zap" className="mr-2 h-9 w-9 text-red-600 align-[-0.12em]" />Endless Run</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Three lives. The better you do, the harder it gets, and the Route Breaker will spring surprise lightning rounds. How far can you go?</p>
      <ChallengeGame vehicles={vehicles} extra={extra} mode="run" />
    </div>
  )
}
