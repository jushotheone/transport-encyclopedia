'use client'
import { useEffect, useState } from 'react'
import { facts } from '@/lib/facts'
import { dayKey, learn, recordWin } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

const ROUND = 10
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5)

// Statements built from Zion's own vehicles: a real fact, or a real fact stuck on the wrong vehicle.
function zionItems(vehicles, n) {
  const withFact = vehicles.filter((v) => v.funFact)
  if (withFact.length < 2) return []
  return shuffle(withFact).slice(0, n).map((v) => {
    const real = Math.random() < 0.5
    const other = shuffle(withFact.filter((o) => o.slug !== v.slug && o.funFact !== v.funFact))[0]
    const shown = real || !other ? v.funFact : other.funFact
    const isReal = shown === v.funFact
    return { id: `z-${v.slug}-${isReal ? 'r' : 'f'}`, real: isReal, fromZion: true, text: `${v.name}: ${shown}`, truth: isReal ? `${v.name}: ${v.funFact}` : `That fact is about a different vehicle. The real fact for the ${v.name}: ${v.funFact}` }
  })
}

const buildDeck = (vehicles) => {
  const zion = zionItems(vehicles, 4)
  return shuffle([...zion, ...shuffle(facts).slice(0, ROUND - zion.length)])
}

export default function FactGame({ vehicles = [] }) {
  const [deck, setDeck] = useState(null)
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState(null) // true = said "Fact", false = said "Fake"
  const [right, setRight] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState(0)

  useEffect(() => setDeck(buildDeck(vehicles)), [vehicles])

  function restart() {
    setDeck(buildDeck(vehicles))
    setI(0)
    setAnswer(null)
    setRight(0)
    setCombo(0)
    setBest(0)
  }

  if (!deck) return null
  const done = i >= deck.length

  if (done) {
    const stars = right >= 9 ? 3 : right >= 7 ? 2 : 1
    return (
      <div className="animate-pop rounded-3xl bg-zts-midnight p-8 text-center text-white shadow-xl">
        <p className="flex justify-center"><Stars count={stars} className="h-12 w-12" /></p>
        <h2 className="mt-2 text-3xl font-extrabold">{right} out of {deck.length} right!</h2>
        <p className="mt-1 text-white/80">Best streak: {best} in a row. Every answer you saw is saved in your learning log.</p>
        <button type="button" onClick={restart} className="mt-6 rounded-full bg-zts-orange px-8 py-3 text-lg font-extrabold hover:brightness-110"><Icon name="retry" className="mr-1.5 h-5 w-5" />Play again</button>
      </div>
    )
  }

  const f = deck[i]
  const answered = answer !== null
  const correct = answered && answer === f.real

  function pick(saidFact) {
    if (answered) return
    setAnswer(saidFact)
    const ok = saidFact === f.real
    const nextCombo = ok ? combo + 1 : 0
    setCombo(nextCombo)
    setBest((b) => Math.max(b, nextCombo))
    if (ok) setRight((r) => r + 1)
    play(ok ? 'good' : 'bad')
    learn(`fact:${f.id}`, f.truth, true)
  }

  function next() {
    const last = i + 1 >= deck.length
    setAnswer(null)
    setI(i + 1)
    if (last) {
      const total = right
      if (total >= 7) {
        recordWin(`fact:${dayKey()}`)
        play('win')
        confetti({ count: 80 + total * 15 })
      }
      toast('Your answers were added to your learning log.', 'book')
    }
  }

  const btn = 'flex-1 rounded-3xl px-4 py-5 text-2xl font-extrabold shadow-lg transition active:scale-95 disabled:opacity-60'
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-extrabold text-zts-midnight">
        <span>Question {i + 1} of {deck.length}</span>
        <span>{combo > 1 ? <><Icon name="flame" className="mr-1 h-5 w-5 text-orange-500" />{combo} in a row!</> : <><Icon name="ok" className="mr-1 h-5 w-5 text-green-600" />{right}</>}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-zts-orange transition-all" style={{ width: `${(i / deck.length) * 100}%` }} /></div>

      <div key={i} className="animate-cardin relative flex min-h-52 items-center justify-center rounded-3xl bg-white p-6 text-center shadow-lg ring-1 ring-zts-midnight/10">
        {f.fromZion && <span className="absolute left-4 top-3 rounded-full bg-zts-orange px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white"><Icon name="pencil" className="mr-1 h-3.5 w-3.5" />From Zion&apos;s notes</span>}
        <p className="text-2xl font-bold leading-snug text-zts-midnight sm:text-3xl">{f.text}</p>
      </div>

      <div className="flex gap-3">
        <button type="button" disabled={answered} onClick={() => pick(true)} className={`${btn} bg-green-500 text-white ${answered && f.real ? 'ring-4 ring-green-300' : ''}`}><Icon name="ok" className="mr-2 h-7 w-7" />Fact</button>
        <button type="button" disabled={answered} onClick={() => pick(false)} className={`${btn} bg-red-500 text-white ${answered && !f.real ? 'ring-4 ring-red-300' : ''}`}><Icon name="no" className="mr-2 h-7 w-7" />Fake</button>
      </div>

      {answered && (
        <div aria-live="polite" className="animate-pop rounded-3xl bg-zts-midnight p-5 text-white shadow-lg">
          <p className="text-xl font-extrabold">{correct ? 'Yes!' : 'Not quite!'} That was a {f.real ? 'fact' : 'fake'}.</p>
          <p className="mt-1 text-lg"><Icon name="lightbulb" className="mr-1.5 h-5 w-5 text-yellow-300" />{f.truth}</p>
          <button type="button" onClick={next} className="mt-3 rounded-full bg-zts-orange px-6 py-2 font-extrabold hover:brightness-110">
            {i + 1 >= deck.length ? 'See my score' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
