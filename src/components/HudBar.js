'use client'
import Link from 'next/link'
import { divisions } from '@/lib/divisions'
import { ranks, rankFor, repairedCount, useExplorer, xpOf } from '@/lib/explorer'

export default function HudBar({ totalCards = 0 }) {
  const s = useExplorer()
  const xp = xpOf(s)
  const rank = rankFor(xp)
  const next = ranks.find((r) => r.min > xp)
  const pct = next ? Math.round(((xp - rank.min) / (next.min - rank.min)) * 100) : 100
  const repaired = repairedCount(s, divisions.map((d) => d.slug))

  const chip = 'rounded-2xl bg-white/10 px-3 py-2 text-center hover:bg-white/20'
  return (
    <section aria-label="Your explorer progress" className="rounded-3xl bg-zts-midnight p-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">{rank.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold">{rank.title}</p>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next rank">
            <div className="h-full rounded-full bg-gradient-to-r from-zts-blue to-zts-orange transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-white/70">{next ? `${next.min - xp} XP to ${next.title}` : 'Top rank reached!'}</p>
        </div>
        <p className="text-right text-2xl font-extrabold text-zts-orange">{xp}<span className="block text-xs font-semibold text-white/60">XP</span></p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-sm font-extrabold">
        <Link href="/passport" className={chip}>🔥 {s.streak}<span className="block text-[10px] font-semibold text-white/60">streak</span></Link>
        <Link href="/control-room" className={chip}>🛰️ {repaired}/8<span className="block text-[10px] font-semibold text-white/60">routes</span></Link>
        <Link href="/cards" className={chip}>🃏 {s.cards.length}{totalCards ? `/${totalCards}` : ''}<span className="block text-[10px] font-semibold text-white/60">cards</span></Link>
        <Link href="/passport" className={chip}>💡 {s.learned.length}<span className="block text-[10px] font-semibold text-white/60">learned</span></Link>
      </div>
    </section>
  )
}
