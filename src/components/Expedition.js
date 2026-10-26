'use client'
import { useState } from 'react'
import SceneArt from '@/components/SceneArt'
import { expeditions, spotKey } from '@/lib/expeditions'
import { learn, recordWin, useExplorer } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'

export default function Expedition({ division }) {
  const s = useExplorer()
  const { place, spots } = expeditions[division.slug]
  const [open, setOpen] = useState(null)
  const found = spots.filter((p) => s.wins.includes(spotKey(division.slug, p.id)))
  const complete = found.length === spots.length

  function discover(spot) {
    setOpen(spot)
    const key = spotKey(division.slug, spot.id)
    if (!s.wins.includes(key)) {
      recordWin(key)
      learn(key, `${spot.title}: ${spot.fact}`, true)
      play(found.length + 1 === spots.length ? 'win' : 'good')
      if (found.length + 1 === spots.length) confetti({ count: 160 })
    } else play('tap')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-extrabold text-zts-midnight">
        <span>🔭 {found.length} of {spots.length} discoveries</span>
        <span className="flex gap-1" aria-hidden="true">
          {spots.map((p) => <span key={p.id} className={`h-3 w-3 rounded-full ${found.some((f) => f.id === p.id) ? 'bg-green-500' : 'bg-slate-300'}`} />)}
        </span>
      </div>

      <div className="relative aspect-[10/7] overflow-hidden rounded-3xl shadow-xl ring-4 ring-zts-midnight/20">
        <SceneArt slug={division.slug} className="absolute inset-0 h-full w-full" />
        {spots.map((p) => {
          const got = found.some((f) => f.id === p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => discover(p)}
              aria-label={got ? `${p.title} (found)` : 'Something to discover. Tap to look.'}
              className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-3xl transition hover:scale-110"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {!got && <span className="absolute inset-0 animate-pulsering rounded-full bg-white/70" aria-hidden="true" />}
              <span className={`relative flex h-11 w-11 items-center justify-center rounded-full shadow-lg ${got ? 'bg-white' : 'bg-white/30 backdrop-blur-sm'}`}>
                {got ? p.emoji : '❔'}
              </span>
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="min-h-24">
        {open ? (
          <div key={open.id} className="animate-pop rounded-3xl bg-zts-midnight p-5 text-white shadow-lg">
            <p className="text-2xl font-extrabold">{open.emoji} {open.title}</p>
            <p className="mt-1 text-lg">{open.fact}</p>
          </div>
        ) : (
          <p className="rounded-3xl bg-white p-5 text-center font-bold text-zts-midnight shadow">Look closely at the {place.toLowerCase()}. Tap every ❔ to discover what is hiding there!</p>
        )}
      </div>

      {complete && (
        <div className="animate-pop rounded-3xl bg-gradient-to-br from-zts-orange to-amber-400 p-5 text-center text-zts-midnight shadow-xl">
          <p className="text-4xl" aria-hidden="true">🏅</p>
          <p className="text-2xl font-extrabold">Expedition complete!</p>
          <p className="font-bold">You found everything at the {place.toLowerCase()}. It is saved in your passport.</p>
        </div>
      )}
    </div>
  )
}
