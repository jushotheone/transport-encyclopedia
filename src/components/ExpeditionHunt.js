'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Icon, { Stars } from '@/components/Icon'
import { ZionAvatar } from '@/components/Zion'
import AirfieldScene from '@/components/scenes/AirfieldScene'
import { hunts } from '@/lib/hunts'
import { spotKey } from '@/lib/expeditions'
import { learn, recordWin } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'

const SCENES = { airfield: AirfieldScene }
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5)
const pick = (a) => a[Math.floor(Math.random() * a.length)]

// A riddle hunt: Zion asks, the child finds the answer in a wide, living scene.
// New order and new wording each time, so it does not turn into something to memorise.
export default function ExpeditionHunt({ division }) {
  const hunt = hunts[division.slug]
  const Scene = SCENES[hunt.scene]
  const [order, setOrder] = useState(null) // [{ ...target, riddle }]
  const [step, setStep] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [msg, setMsg] = useState(null)
  const [pulse, setPulse] = useState(null)
  const [hint, setHint] = useState(false)
  const [touched, setTouched] = useState(false)
  const timer = useRef(null)

  const start = useCallback(() => {
    setOrder(shuffle(hunt.targets).map((t) => ({ ...t, riddle: pick(t.riddles) })))
    setStep(0)
    setWrong(0)
    setMsg(null)
    setHint(false)
  }, [hunt])

  useEffect(() => {
    start()
    return () => clearTimeout(timer.current)
  }, [start])

  if (!order) return null
  const done = step >= order.length
  const current = done ? null : order[step]
  const found = order.slice(0, step).map((t) => t.id)
  const stars = wrong <= 1 ? 3 : wrong <= 4 ? 2 : 1

  function bump(id) {
    setPulse(id)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPulse(null), 600)
  }

  function pickObject(id) {
    if (done) return
    setTouched(true)
    bump(id)
    const t = hunt.targets.find((x) => x.id === id)
    const d = hunt.decoys.find((x) => x.id === id)

    if (t && t.id === current.id) {
      const last = step + 1 >= order.length
      setStep(step + 1)
      setHint(false)
      setMsg({ kind: 'right', title: t.title, fact: t.fact })
      recordWin(spotKey(division.slug, t.id))
      learn(spotKey(division.slug, t.id), `${t.title}: ${t.fact}`, true)
      play(last ? 'win' : 'good')
      if (last) confetti({ count: 170 })
      return
    }
    setWrong((w) => w + 1)
    play('tap')
    const thing = t || d
    if (!thing) return
    if (d) learn(`explore:${division.slug}:decoy:${d.id}`, `${d.title}: ${d.fact}`, true)
    setMsg({ kind: t ? 'other' : 'decoy', title: thing.title, fact: thing.fact })
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {!touched && !done && <p className="text-sm text-zts-graphite/80 sm:text-base">{hunt.intro}</p>}

      {done ? (
        <div className="animate-pop flex items-center gap-4 rounded-3xl bg-gradient-to-br from-zts-orange to-amber-400 p-4 text-zts-midnight shadow-xl">
          <ZionAvatar className="h-16 w-16" />
          <div className="flex-1">
            <p className="text-xl font-extrabold">The plane is ready for take-off!</p>
            <p className="font-bold">You solved all {order.length} riddles with {wrong} wrong {wrong === 1 ? 'tap' : 'taps'}.</p>
            <div className="mt-1 flex items-center gap-3"><Stars count={stars} className="h-7 w-7" />
              <button type="button" onClick={start} className="rounded-full bg-zts-midnight px-4 py-1.5 text-sm font-extrabold text-white hover:bg-zts-blue"><Icon name="retry" className="mr-1.5 h-4 w-4" />Play again</button>
            </div>
          </div>
        </div>
      ) : (
        <div data-target={current.id} className="flex gap-3 rounded-3xl bg-white p-3 shadow-lg ring-1 ring-zts-midnight/10 sm:p-4">
          <ZionAvatar className="h-12 w-12 sm:h-14 sm:w-14" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold uppercase tracking-wide text-zts-blue">Riddle {step + 1} of {order.length}</p>
              <button type="button" onClick={() => setHint((h) => !h)} className="text-xs font-extrabold text-zts-blue underline sm:text-sm">
                <Icon name="lightbulb" className="mr-1 h-4 w-4" />{hint ? 'Hide hint' : 'Hint'}
              </button>
            </div>
            <p className="text-base font-bold leading-snug text-zts-midnight sm:text-lg"><span className="sr-only">Zion says: </span>{current.riddle}</p>
            {hint && <p className="animate-pop mt-1 rounded-xl bg-yellow-50 p-2 text-sm font-bold text-yellow-900">{current.hint}</p>}
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl shadow-xl ring-4 ring-zts-midnight/20">
        <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain" style={{ height: 'clamp(230px, calc(100dvh - 368px), 460px)' }} tabIndex={0} aria-label="The scene. Swipe sideways to look around." onScroll={() => setTouched(true)}>
          <Scene onPick={pickObject} found={found} pulse={pulse} celebrate={done} />
        </div>
        {!touched && (
          <p className="pointer-events-none absolute right-3 top-3 animate-pulse rounded-full bg-black/55 px-3 py-1 text-sm font-extrabold text-white">
            Swipe to look around <Icon name="next" className="ml-1 h-4 w-4" />
          </p>
        )}
        {msg && (
          <div aria-live="polite" className="animate-pop absolute inset-x-3 bottom-3 flex items-start gap-3 rounded-2xl bg-zts-midnight/95 p-3 text-white shadow-2xl">
            <ZionAvatar className="h-10 w-10" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-extrabold">
                {msg.kind === 'right' && <><Icon name="ok" className="mr-1 h-4 w-4 text-green-400" />Yes! It&apos;s the {msg.title.toLowerCase()}!</>}
                {msg.kind === 'other' && <>That&apos;s the {msg.title.toLowerCase()}, but we need something else first.</>}
                {msg.kind === 'decoy' && <>That&apos;s the {msg.title.toLowerCase()}! Good spotting, but not what we need.</>}
              </p>
              <p className="text-white/90">{msg.fact}</p>
            </div>
            <button type="button" onClick={() => setMsg(null)} aria-label="Close" className="rounded-full bg-white/15 p-1.5 hover:bg-white/25"><Icon name="close" className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  )
}
