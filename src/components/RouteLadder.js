'use client'
import Link from 'next/link'
import { useExplorer } from '@/lib/explorer'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

export default function RouteLadder({ division }) {
  const s = useExplorer()
  const stars = s.levels[division.slug] || {}
  const repaired = [1, 2, 3].every((n) => stars[n] > 0)

  return (
    <section aria-labelledby="repair-h" className="rounded-3xl bg-zts-midnight p-5 text-white shadow-lg">
      <h2 id="repair-h" className="text-xl font-extrabold">
        {repaired ? <><Icon name="ok" className="mr-1.5 h-5 w-5 text-green-400" />Route repaired!</> : <><Icon name="alert" className="mr-1.5 h-5 w-5 text-amber-300" />The Route Breaker hit this route</>}
      </h2>
      <p className="text-sm text-white/70">{repaired ? 'Beat your star scores or explore the cards below.' : 'Clear 3 puzzle levels to repair it and unlock a clue.'}</p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((n) => {
          const ok = n === 1 || stars[n - 1] > 0
          return (
            <li key={n}>
              {ok ? (
                <Link href={`/play/route/${division.slug}`} className="block rounded-2xl bg-white/10 p-3 text-center font-extrabold hover:bg-white/20">
                  Level {n}
                  <span className="block text-sm">{stars[n] ? <Stars count={stars[n]} className="h-4 w-4" /> : 'Play'}</span>
                </Link>
              ) : (
                <p className="rounded-2xl bg-white/5 p-3 text-center font-extrabold text-white/40"><Icon name="lock" className="mr-1 h-4 w-4" />Level {n}<span className="block text-sm">Locked</span></p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
