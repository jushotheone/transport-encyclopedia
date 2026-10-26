'use client'
import { useState } from 'react'
import VehicleArt from '@/components/VehicleArt'
import Garage from '@/components/Garage'
import { bodies, colours, movers, randomDesign, sizes, stickers, tops, divisionOfMover } from '@/lib/studio'
import { scenarios, ratingLabel } from '@/lib/missions'
import { getDivision } from '@/lib/divisions'
import { MAX_DESIGNS, learn, recordWin, saveDesign, useExplorer } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'
import Icon from '@/components/Icon'

const chip = (on) => `rounded-2xl px-3 py-2 text-center text-sm font-extrabold transition ${on ? 'bg-zts-midnight text-white shadow-lg' : 'bg-white text-zts-midnight shadow hover:-translate-y-0.5'}`

function Group({ title, children }) {
  return (
    <fieldset className="rounded-2xl bg-slate-50 p-3">
      <legend className="px-1 text-sm font-extrabold uppercase tracking-wide text-zts-graphite/70">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

export default function DesignStudio() {
  const { designs } = useExplorer()
  const [d, setD] = useState({ name: 'Sky Zipper', body: 'pod', mover: 'wings', top: 'windows', colour: '#1D9BF0', sticker: 'star', size: 1 })
  const [mission, setMission] = useState(null)
  const set = (patch) => {
    setD((x) => ({ ...x, ...patch }))
    setMission(null)
    play('tap')
  }

  const full = designs.length >= MAX_DESIGNS

  function save() {
    if (!d.name.trim()) return toast('Give your vehicle a name first!', 'pencil')
    if (saveDesign({ ...d, name: d.name.trim() })) {
      play('win')
      confetti({ count: 90 })
      toast(`${d.name.trim()} is in your garage! +4 XP`, 'hammer')
      learn('design:function', 'Good designers start with what a vehicle must do, then make it look great. Function first!')
    } else toast('Your garage is full. Remove a vehicle to make space.', 'alert')
  }

  function test(s) {
    const division = divisionOfMover(d.mover)
    const opt = s.options[division]
    setMission({ s, division, opt })
    if (opt.rating === 'great') {
      play('win')
      confetti({ count: 120 })
      recordWin(`design:${s.id}:${division}`)
    } else play(opt.rating === 'ok' ? 'good' : 'bad')
    learn(`design-test:${division}`, `${movers.find((m) => m.id === d.mover).name} belong to ${getDivision(division).name}. ${opt.why}`)
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-3xl bg-gradient-to-b from-zts-midnight to-slate-900 p-4 shadow-xl">
            <VehicleArt design={d} className="w-full" />
            <input
              value={d.name}
              onChange={(e) => setD({ ...d, name: e.target.value.slice(0, 24) })}
              aria-label="Vehicle name"
              className="mt-2 w-full rounded-xl bg-white/10 px-3 py-2 text-center text-xl font-extrabold text-white outline-none placeholder:text-white/40 focus:bg-white/20"
              placeholder="Name your vehicle"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setD(randomDesign()); setMission(null); play('tap') }} className="flex-1 rounded-full bg-zts-blue px-4 py-3 font-extrabold text-white hover:brightness-110"><Icon name="shuffle" className="mr-1.5 h-5 w-5" />Surprise me</button>
            <button type="button" onClick={save} disabled={full} className="flex-1 rounded-full bg-zts-orange px-4 py-3 font-extrabold text-white hover:brightness-110 disabled:opacity-40"><Icon name="download" className="mr-1.5 h-5 w-5" />Save to garage</button>
          </div>
        </div>

        <div className="space-y-3">
          <Group title="1. Body">
            {bodies.map((b) => <button key={b.id} type="button" aria-pressed={d.body === b.id} onClick={() => set({ body: b.id })} className={chip(d.body === b.id)}>{b.name}</button>)}
          </Group>
          <Group title="2. How does it move?">
            {movers.map((m) => <button key={m.id} type="button" aria-pressed={d.mover === m.id} onClick={() => set({ mover: m.id })} className={chip(d.mover === m.id)} title={m.note}><Icon name={m.icon} className="mr-1 h-4 w-4" />{m.name}</button>)}
          </Group>
          <Group title="3. On top">
            {tops.map((t) => <button key={t.id} type="button" aria-pressed={d.top === t.id} onClick={() => set({ top: t.id })} className={chip(d.top === t.id)}>{t.name}</button>)}
          </Group>
          <Group title="4. Colour">
            {colours.map((c) => (
              <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={d.colour === c} onClick={() => set({ colour: c })} className={`h-10 w-10 rounded-full shadow ring-offset-2 ${d.colour === c ? 'ring-4 ring-zts-orange' : 'ring-1 ring-black/10'}`} style={{ background: c }} />
            ))}
          </Group>
          <Group title="5. Sticker and size">
            {stickers.map((s) => <button key={s} type="button" aria-label={`Sticker ${s}`} aria-pressed={d.sticker === s} onClick={() => set({ sticker: s })} className={chip(d.sticker === s)}><Icon name={s} className="h-5 w-5" /></button>)}
            <span className="mx-1 w-px bg-slate-300" aria-hidden="true" />
            {sizes.map((z) => <button key={z.id} type="button" aria-pressed={d.size === z.id} onClick={() => set({ size: z.id })} className={chip(d.size === z.id)}>{z.name}</button>)}
          </Group>
        </div>
      </div>

      <section aria-labelledby="test-h" className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-zts-midnight/10">
        <h2 id="test-h" className="text-2xl font-extrabold text-zts-midnight"><Icon name="flask" className="mr-2 h-6 w-6 text-green-700" />Test it on a mission</h2>
        <p className="text-zts-graphite/80">Does {d.name || 'your vehicle'} have the right parts for the job? Pick a mission to find out.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {scenarios.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => test(s)} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left font-bold hover:bg-sky-50">
                <Icon name={s.icon} className="h-8 w-8 text-zts-blue" />{s.title}
              </button>
            </li>
          ))}
        </ul>
        {mission && (
          <div aria-live="polite" className="animate-pop mt-4 rounded-2xl bg-zts-midnight p-4 text-white">
            <p className="text-lg font-extrabold">
              <Icon name={ratingLabel[mission.opt.rating].icon} className="mr-1 h-5 w-5" />{mission.s.title}: {ratingLabel[mission.opt.rating].text}
            </p>
            <p className="mt-1">{mission.opt.why}</p>
            <p className="mt-2 text-sm text-white/70">
              {movers.find((m) => m.id === d.mover).name} belong to {getDivision(mission.division).name}.
              {mission.opt.rating !== 'great' && ' Try different parts and test again!'}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="garage-h">
        <h2 id="garage-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="home" className="mr-2 h-6 w-6 text-green-700" />My garage</h2>
        <Garage />
      </section>
    </div>
  )
}
