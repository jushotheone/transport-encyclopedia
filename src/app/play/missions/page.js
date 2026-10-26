import Link from 'next/link'
import MissionGame from '@/components/MissionGame'
import Icon from '@/components/Icon'

export const metadata = {
  title: 'Mission Planner',
  description: 'Plan a transport mission, then survive the Route Breaker with a backup plan.',
}

export default function MissionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/play" className="text-sm font-bold text-zts-blue hover:underline">← All games</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-zts-midnight"><Icon name="map" className="mr-2 h-9 w-9 text-red-600 align-[-0.12em]" />Mission Planner</h1>
      <p className="mb-8 mt-1 text-lg text-zts-graphite/80">
        Choose how to get the job done. But watch out: the Route Breaker will break your plan, and you will need a backup!
      </p>
      <MissionGame />
    </div>
  )
}
