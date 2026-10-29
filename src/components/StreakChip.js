'use client'
import Link from 'next/link'
import { streakAtRisk, useExplorer } from '@/lib/explorer'
import Icon from '@/components/Icon'

export default function StreakChip() {
  const s = useExplorer()
  const risk = streakAtRisk(s)
  return (
    <Link
      href="/passport"
      title={risk ? 'Play today to keep your streak!' : 'Your daily streak'}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-extrabold ${s.streak ? 'bg-orange-500/90 text-white' : 'bg-white/10 text-white/80'} ${risk ? 'animate-pulse' : ''}`}
    >
      <Icon name="flame" className="mr-1 h-4 w-4" />{s.streak}
      <span className="sr-only"> day streak</span>
    </Link>
  )
}
