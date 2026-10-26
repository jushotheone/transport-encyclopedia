'use client'
import { useState } from 'react'
import ExplorerCard, { LockedCard } from '@/components/ExplorerCard'
import { divisions } from '@/lib/divisions'
import { useExplorer } from '@/lib/explorer'

// Shows every vehicle as a collected card or a locked slot. Used for the collection and for division binders.
export default function CardGrid({ vehicles, filterable = false, flippable = true }) {
  const s = useExplorer()
  const [only, setOnly] = useState('all')
  const shown = only === 'all' ? vehicles : vehicles.filter((v) => v.system === only)
  const owned = vehicles.filter((v) => s.cards.includes(v.slug)).length

  return (
    <div>
      <p className="mb-3 font-extrabold text-zts-midnight">
        {owned} of {vehicles.length} collected
      </p>
      <div className="mb-5 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={owned} aria-valuemin={0} aria-valuemax={vehicles.length} aria-label="Cards collected">
        <div className="h-full rounded-full bg-gradient-to-r from-zts-blue to-zts-orange transition-all duration-700" style={{ width: `${vehicles.length ? (owned / vehicles.length) * 100 : 0}%` }} />
      </div>

      {filterable && (
        <div className="mb-5 flex flex-wrap gap-2">
          {[{ slug: 'all', emoji: '🌍', name: 'All' }, ...divisions].map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => setOnly(d.slug)}
              aria-pressed={only === d.slug}
              className={`rounded-full px-3 py-1 text-sm font-extrabold ${only === d.slug ? 'bg-zts-midnight text-white' : 'bg-white text-zts-midnight shadow'}`}
            >
              {d.emoji} {d.name.replace(' Transport', '')}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center shadow">No vehicles here yet. Zion is still exploring!</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((v) => (
            <li key={v.slug} className="flex justify-center">
              {s.cards.includes(v.slug) ? <ExplorerCard vehicle={v} flippable={flippable} /> : <LockedCard vehicle={v} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
