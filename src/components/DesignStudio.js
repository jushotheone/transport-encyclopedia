'use client'
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import VehicleArt from '@/components/VehicleArt'
import Garage from '@/components/Garage'
import { ZionAvatar } from '@/components/Zion'
import { bodies, colours, divisionOfMover, liveries, movers, randomDesign, sizes, tops } from '@/lib/studio'
import { scenarios, ratingLabel } from '@/lib/missions'
import { getDivision } from '@/lib/divisions'
import { MAX_DESIGNS, learn, recordWin, saveDesign, useExplorer } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'

// A part you can see before you choose it: the card shows what your vehicle would look like with that part.
function PartCard({ label, note, selected, onClick, design }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex flex-col items-center rounded-2xl p-2 text-center transition ${selected ? 'bg-zts-midnight text-white shadow-lg ring-2 ring-zts-orange' : 'bg-white text-zts-midnight shadow hover:-translate-y-0.5 hover:shadow-md'}`}
    >
      <span className={`block w-full overflow-hidden rounded-xl ${selected ? 'bg-white/10' : 'bg-slate-100'}`}>
        <VehicleArt design={design} bare className="h-auto w-full" />
      </span>
      <span className="mt-1 text-sm font-extrabold leading-tight">{label}</span>
      {note && <span className={`text-xs ${selected ? 'text-white/70' : 'text-zts-graphite/60'}`}>{note}</span>}
    </button>
  )
}

function Step({ n, title, children }) {
  return (
    <section className="rounded-3xl bg-slate-50 p-3 sm:p-4">
      <h3 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-zts-midnight">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zts-orange text-sm text-white">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

export default function DesignStudio() {
  const { designs } = useExplorer()
  const [d, setD] = useState({ name: 'Sky Zipper', body: 'long', mover: 'wings', top: 'plain', colour: '#1D9BF0', livery: 'stripe', size: 1 })
  const [drive, setDrive] = useState(null) // { rating, id, mission }
  const [result, setResult] = useState(null)
  const timer = useRef(null)
  const set = (patch) => {
    setD((x) => ({ ...x, ...patch }))
    setDrive(null)
    setResult(null)
    clearTimeout(timer.current)
    play('tap')
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  const full = designs.length >= MAX_DESIGNS
  const part = movers.find((m) => m.id === d.mover)

  function save() {
    if (!d.name.trim()) return toast('Give your vehicle a name first!', 'pencil')
    if (saveDesign({ ...d, name: d.name.trim() })) {
      play('win')
      confetti({ count: 90 })
      toast(`${d.name.trim()} is in your garage! +4 XP`, 'hammer')
      learn('design:function', 'Good designers start with what a vehicle must do, then make it look great. Function first!')
    } else toast('Your garage is full. Remove a vehicle to make space.', 'alert')
  }

  // The vehicle really tries the mission in front of you, then Zion explains how it went.
  function testDrive(s) {
    const division = divisionOfMover(d.mover)
    const opt = s.options[division]
    clearTimeout(timer.current)
    setResult(null)
    setDrive({ rating: opt.rating, id: Date.now(), mission: s.title })
    play('whoosh')
    timer.current = setTimeout(() => {
      setResult({ s, division, opt })
      if (opt.rating === 'great') {
        play('win')
        confetti({ count: 120 })
        recordWin(`design:${s.id}:${division}`)
      } else play(opt.rating === 'ok' ? 'good' : 'bad')
      learn(`design-test:${division}`, `${part.name} belong to ${getDivision(division).name}. ${opt.why}`)
    }, opt.rating === 'ok' ? 5600 : 4600)
  }

  const driving = drive && !result
  const [lastMission, setLastMission] = useState(null)
  const run = (m) => {
    setLastMission(m)
    testDrive(m)
  }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* On a phone the vehicle stays pinned at the top while you choose parts; on a wide screen the whole column stays put. */}
      <div className="contents lg:sticky lg:top-4 lg:block">
        <div className="sticky top-2 z-20 overflow-hidden rounded-3xl bg-zts-midnight shadow-xl ring-4 ring-zts-midnight/30 lg:static">
          <VehicleArt key={drive?.id || 'still'} design={d} drive={drive} className="block h-auto w-full" />
          <div className="flex items-center gap-2 bg-zts-midnight p-2 sm:p-3">
            <input
              value={d.name}
              onChange={(e) => setD({ ...d, name: e.target.value.slice(0, 24) })}
              aria-label="Vehicle name"
              className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-center text-lg font-extrabold text-white outline-none placeholder:text-white/40 focus:bg-white/20"
              placeholder="Name your vehicle"
            />
            <button type="button" onClick={() => run(lastMission || scenarios[0])} disabled={!!driving} aria-label="Test drive" className="rounded-xl bg-green-600 p-2.5 text-white hover:brightness-110 disabled:opacity-50"><Icon name="play" className="h-6 w-6" /></button>
            <button type="button" onClick={() => { setD({ ...randomDesign() }); setDrive(null); setResult(null); play('tap') }} aria-label="Surprise me with a random design" className="rounded-xl bg-zts-blue p-2.5 text-white hover:brightness-110"><Icon name="shuffle" className="h-6 w-6" /></button>
            <button type="button" onClick={save} disabled={full} aria-label="Save to garage" className="rounded-xl bg-zts-orange p-2.5 text-white hover:brightness-110 disabled:opacity-40"><Icon name="download" className="h-6 w-6" /></button>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-1 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-zts-graphite/70"><Icon name="flask" className="h-4 w-4" />Test drive: pick a mission</p>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" aria-label="Missions">
            {scenarios.map((s) => (
              <li key={s.id} className="shrink-0">
                <button type="button" onClick={() => run(s)} disabled={!!driving} className={`flex items-center gap-2 rounded-full px-4 py-2 font-extrabold shadow transition hover:-translate-y-0.5 disabled:opacity-50 ${lastMission?.id === s.id ? 'bg-zts-midnight text-white' : 'bg-white text-zts-midnight'}`}>
                  <Icon name={s.icon} className="h-5 w-5 text-zts-blue" />{s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {driving && <p role="status" className="mt-3 rounded-2xl bg-white p-3 font-bold text-zts-midnight shadow">{d.name || 'Your vehicle'} is trying: {drive.mission}</p>}

        {result && (
          <div aria-live="polite" className="animate-pop mt-3 flex items-start gap-3 rounded-3xl bg-zts-midnight p-4 text-white shadow-lg">
            <ZionAvatar className="h-12 w-12" />
            <div className="flex-1">
              <span className="sr-only">Zion says: </span>
              <p className="text-lg font-extrabold">
                <Icon name={ratingLabel[result.opt.rating].icon} className="mr-1.5 h-5 w-5 text-zts-orange" />
                {result.s.title}: {ratingLabel[result.opt.rating].text}
              </p>
              <p className="mt-1">{result.opt.why}</p>
              <p className="mt-2 text-sm text-white/70">
                {part.name} belong to {getDivision(result.division).name}.{result.opt.rating !== 'great' && ' Try different parts and test again!'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6 lg:mt-0">
        <Step n={1} title="How does it move?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {movers.map((m) => <PartCard key={m.id} label={m.name} note={m.note} selected={d.mover === m.id} onClick={() => set({ mover: m.id })} design={{ ...d, mover: m.id }} />)}
          </div>
        </Step>

        <Step n={2} title="Pick a shape">
          <div className="grid grid-cols-3 gap-2">
            {bodies.map((b) => <PartCard key={b.id} label={b.name} selected={d.body === b.id} onClick={() => set({ body: b.id })} design={{ ...d, body: b.id }} />)}
          </div>
        </Step>

        <Step n={3} title="Paint it">
          <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Colour">
            {colours.map((c) => (
              <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={d.colour === c} onClick={() => set({ colour: c })} className={`h-11 w-11 rounded-full shadow ring-offset-2 transition ${d.colour === c ? 'scale-110 ring-4 ring-zts-orange' : 'ring-1 ring-black/10'}`} style={{ background: c }} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {liveries.map((l) => <PartCard key={l.id} label={l.name} selected={d.livery === l.id} onClick={() => set({ livery: l.id })} design={{ ...d, livery: l.id }} />)}
          </div>
        </Step>

        <Step n={4} title="Add something on top">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {tops.map((t) => <PartCard key={t.id} label={t.name} selected={d.top === t.id} onClick={() => set({ top: t.id })} design={{ ...d, top: t.id }} />)}
          </div>
          <div className="mt-3 flex gap-2" role="group" aria-label="Size">
            {sizes.map((z) => (
              <button key={z.id} type="button" aria-pressed={d.size === z.id} onClick={() => set({ size: z.id })} className={`flex-1 rounded-2xl px-3 py-2 text-sm font-extrabold ${d.size === z.id ? 'bg-zts-midnight text-white' : 'bg-white text-zts-midnight shadow'}`}>{z.name}</button>
            ))}
          </div>
        </Step>
      </div>

      <section aria-labelledby="garage-h" className="mt-8 lg:col-span-2">
        <h2 id="garage-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="home" className="mr-2 h-6 w-6 text-green-700" />My garage</h2>
        <Garage />
      </section>
    </div>
  )
}
