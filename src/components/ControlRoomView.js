'use client'
import Link from 'next/link'
import { divisions } from '@/lib/divisions'
import { clues } from '@/lib/story'
import { isRepaired, repairedCount, useExplorer } from '@/lib/explorer'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

export default function ControlRoomView() {
  const s = useExplorer()
  const slugs = divisions.map((d) => d.slug)
  const fixed = repairedCount(s, slugs)
  const all = fixed === slugs.length

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-zts-midnight p-5 text-white shadow-lg">
        <p className="font-extrabold"><Icon name="satellite" className="mr-2 h-5 w-5 text-sky-300" />Routes repaired: {fixed} of {slugs.length}</p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-zts-blue to-zts-orange transition-all duration-700" style={{ width: `${(fixed / slugs.length) * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-white/70">Every repaired route reveals one clue about what is breaking the network. Can you spot the pattern?</p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {divisions.map((d) => {
          const open = isRepaired(s, d.slug)
          const c = clues[d.slug]
          return open ? (
            <li key={d.slug} className="animate-pop rounded-3xl bg-white p-5 shadow-lg ring-2" style={{ '--tw-ring-color': d.accent }}>
              <p className="text-5xl" style={{ color: d.accent }} aria-hidden="true">{c.glyph}</p>
              <h3 className="mt-1 text-xl font-extrabold text-zts-midnight">{c.title}</h3>
              <p className="text-xs font-bold uppercase tracking-wide text-zts-graphite/60"><DivisionIcon slug={d.slug} className="mr-1 h-4 w-4" />{d.name}</p>
              <p className="mt-2">{c.text}</p>
            </li>
          ) : (
            <li key={d.slug} className="rounded-3xl border-4 border-dashed border-slate-300 bg-slate-100 p-5 text-center text-slate-500">
              <p className="flex justify-center" aria-hidden="true"><Icon name="lock" className="h-10 w-10" /></p>
              <p className="font-extrabold">Clue locked</p>
              <p className="text-sm">Repair the {d.name} route to reveal it.</p>
              <Link href={`/systems/${d.slug}`} className="mt-2 inline-block font-bold text-zts-blue underline">Go to {d.name} hub</Link>
            </li>
          )
        })}
      </ul>

      {all && (
        <div className="animate-pop rounded-3xl bg-gradient-to-br from-zts-midnight to-indigo-900 p-8 text-center text-white shadow-2xl ring-4 ring-zts-orange">
          <p className="flex justify-center text-zts-orange" aria-hidden="true"><Icon name="satellite" className="h-16 w-16" /></p>
          <h2 className="mt-2 text-3xl font-extrabold">The Control Room is open!</h2>
          <p className="mt-3 text-lg text-white/90">
            All eight routes shine again. One screen flickers on by itself: a message with no name.
          </p>
          <p className="mx-auto mt-3 max-w-md rounded-2xl bg-white/10 p-4 text-xl font-bold italic">
            &ldquo;You are closer than you think. The symbols were never random.&rdquo;
          </p>
          <p className="mt-4 text-2xl tracking-widest" aria-label="The eight symbols">{divisions.map((d) => clues[d.slug].glyph).join(' ')}</p>
          <p className="mt-4 font-extrabold text-zts-orange">To be continued… watch the series to find out what happens next!</p>
        </div>
      )}
    </div>
  )
}
