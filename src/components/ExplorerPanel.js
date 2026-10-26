'use client'
import { useEffect, useState } from 'react'
import { ranks, readProgress, rankFor, scoreOf } from '@/lib/explorer'

export default function ExplorerPanel() {
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    setProgress(readProgress())
  }, [])

  const score = progress ? scoreOf(progress) : 0
  const rank = rankFor(score)
  const next = ranks.find((r) => r.min > score)

  return (
    <section
      aria-labelledby="explorer-heading"
      className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-zts-midnight/10"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-5xl" aria-hidden="true">{rank.emoji}</div>
        <div className="flex-1 min-w-48">
          <h2 id="explorer-heading" className="text-sm font-bold uppercase tracking-wider text-zts-blue">
            Your explorer rank
          </h2>
          <p className="text-2xl font-extrabold text-zts-midnight">{rank.title}</p>
          <p className="text-sm text-zts-graphite/70">
            {next
              ? `${next.min - score} more ${next.min - score === 1 ? 'discovery' : 'discoveries'} to become ${next.title}`
              : 'You have reached the top rank. Amazing!'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-extrabold text-zts-orange">{score}</p>
          <p className="text-xs font-semibold uppercase text-zts-graphite/60">Discoveries</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-zts-graphite/60">
        Visit vehicles and get quiz questions right to rank up. Your progress is saved only in this browser.
      </p>
    </section>
  )
}
