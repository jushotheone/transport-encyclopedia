'use client'
import Link from 'next/link'
import { streakAtRisk, useExplorer } from '@/lib/explorer'

export default function StreakChip() {
  const s = useExplorer()
  const risk = streakAtRisk(s)
  return (
    <Link
      href="/passport"
      title={risk ? 'Play today to keep your streak!' : 'Your daily streak'}
      className={`rounded-full px-3 py-1 text-sm font-extrabold ${s.streak ? 'bg-orange-500/90 text-white' : 'bg-white/10 text-white/80'} ${risk ? 'animate-pulse' : ''}`}
    >
      🔥 {s.streak}
      <span className="sr-only"> day streak</span>
    </Link>
  )
}
