import Link from 'next/link'
import ChallengeGame from '@/components/ChallengeGame'
import Icon from '@/components/Icon'
import { fetchChallenges, fetchVehicles } from '@/lib/sheets'

export const revalidate = 300
export const metadata = { title: 'Daily Challenge', description: 'Eight new questions every day, built from Zion\'s own vehicles.' }

export default async function DailyPage() {
  const [vehicles, extra] = await Promise.all([fetchVehicles(), fetchChallenges()])
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/play" className="text-sm font-bold text-zts-blue hover:underline">All games</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-zts-midnight"><Icon name="calendar" className="mr-2 h-9 w-9 text-zts-orange align-[-0.12em]" />Daily Challenge</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Eight questions that change every day and get harder as you go. Everyone gets the same eight, so you can compare scores with friends.</p>
      <ChallengeGame vehicles={vehicles} extra={extra} mode="daily" />
    </div>
  )
}
