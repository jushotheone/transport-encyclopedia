import Link from 'next/link'
import FactGame from '@/components/FactGame'

export const metadata = { title: 'Fact or Fake?', description: 'Spot the true transport facts and the fakes.' }

export default function FactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/play" className="text-sm font-bold text-zts-blue hover:underline">← All games</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-zts-midnight">🕵️ Fact or Fake?</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Is it true, or is the Route Breaker spreading fake news? Ten quick questions, about one minute.</p>
      <FactGame />
    </div>
  )
}
