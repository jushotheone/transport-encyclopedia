'use client'
import { useEffect, useState } from 'react'
import { divisions, getDivision } from '@/lib/divisions'
import { scenarios, disruptions, ratingPoints, ratingLabel } from '@/lib/missions'
import { readProgress, recordWin } from '@/lib/explorer'

function Stars({ count }) {
  return (
    <p className="text-5xl" role="img" aria-label={`${count} out of 3 stars`}>
      {[1, 2, 3].map((n) => (n <= count ? '⭐' : '☆'))}
    </p>
  )
}

function OptionGrid({ onPick, blocked }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {divisions.map((d) => {
        const isBlocked = d.slug === blocked
        return (
          <li key={d.slug}>
            <button
              type="button"
              disabled={isBlocked}
              onClick={() => onPick(d.slug)}
              className="flex h-full w-full flex-col items-center rounded-2xl p-4 text-center font-extrabold text-white shadow transition enabled:hover:-translate-y-1 enabled:hover:shadow-xl disabled:opacity-30"
              style={{ background: `linear-gradient(145deg, ${d.accent}, #102A43)` }}
            >
              <span className="text-4xl" aria-hidden="true">{isBlocked ? '🚫' : d.emoji}</span>
              <span className="mt-1 text-sm">{d.name.replace(' Transport', '')}</span>
              {isBlocked && <span className="text-xs font-semibold">Broken!</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default function MissionGame() {
  const [done, setDone] = useState([])
  const [scenario, setScenario] = useState(null)
  const [planA, setPlanA] = useState(null)
  const [stage, setStage] = useState('pick') // pick | planA | broken | planB | result
  const [planB, setPlanB] = useState(null)

  useEffect(() => {
    setDone(readProgress().wins)
  }, [])

  function start(s) {
    setScenario(s)
    setPlanA(null)
    setPlanB(null)
    setStage('planA')
  }

  function chooseA(slug) {
    setPlanA(slug)
    setStage('broken')
  }

  function chooseB(slug) {
    setPlanB(slug)
    const points = ratingPoints[scenario.options[planA].rating] + ratingPoints[scenario.options[slug].rating]
    if (Math.floor(points) >= 2) {
      recordWin(`mission:${scenario.id}`)
      setDone((d) => (d.includes(`mission:${scenario.id}`) ? d : [...d, `mission:${scenario.id}`]))
    }
    setStage('result')
  }

  if (stage === 'pick') {
    return (
      <div>
        <h2 className="text-2xl font-extrabold text-zts-midnight">Pick a mission</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {scenarios.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => start(s)}
                className="flex h-full w-full items-start gap-4 rounded-3xl bg-white p-5 text-left shadow-lg ring-1 ring-zts-midnight/10 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <span className="text-5xl" aria-hidden="true">{s.emoji}</span>
                <span>
                  <span className="block text-xl font-extrabold text-zts-midnight">
                    {s.title} {done.includes(`mission:${s.id}`) && <span title="Completed">✅</span>}
                  </span>
                  <span className="text-sm text-zts-graphite/80">{s.story}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const panel = 'rounded-3xl p-6 shadow-lg'
  const briefing = (
    <div className={`${panel} bg-white`}>
      <p className="text-4xl" aria-hidden="true">{scenario.emoji}</p>
      <h2 className="text-2xl font-extrabold text-zts-midnight">{scenario.title}</h2>
      <p className="mt-1 text-lg">{scenario.story}</p>
    </div>
  )

  if (stage === 'planA') {
    return (
      <div className="space-y-5">
        {briefing}
        <h3 className="text-xl font-extrabold text-zts-midnight">🗺️ Plan A: how will you do it?</h3>
        <OptionGrid onPick={chooseA} />
      </div>
    )
  }

  if (stage === 'broken') {
    const a = getDivision(planA)
    return (
      <div className={`${panel} bg-zts-midnight text-center text-white`} role="alert">
        <p className="text-6xl animate-floaty" aria-hidden="true">⚠️</p>
        <h2 className="mt-2 text-3xl font-extrabold text-zts-orange">The Route Breaker strikes!</h2>
        <p className="mt-3 text-xl">
          You chose {a.emoji} <strong>{a.name}</strong>. {disruptions[planA]}
        </p>
        <p className="mt-2 text-white/80">Plan A is out. The mission still has to be completed!</p>
        <button
          type="button"
          onClick={() => setStage('planB')}
          className="mt-6 rounded-full bg-zts-orange px-8 py-3 text-lg font-extrabold hover:brightness-110"
        >
          Find a backup plan →
        </button>
      </div>
    )
  }

  if (stage === 'planB') {
    return (
      <div className="space-y-5">
        {briefing}
        <h3 className="text-xl font-extrabold text-zts-midnight">🔄 Plan B: what is your backup?</h3>
        <OptionGrid onPick={chooseB} blocked={planA} />
      </div>
    )
  }

  const a = scenario.options[planA]
  const b = scenario.options[planB]
  const stars = Math.min(3, Math.floor(ratingPoints[a.rating] + ratingPoints[b.rating]))
  const headline = ['Not this time. Learn from it and try again!', 'Good try, explorer!', 'Great mission!', 'Perfect mission, Captain!'][stars]

  const review = (label, slug, opt) => {
    const d = getDivision(slug)
    return (
      <li className="rounded-2xl bg-white p-4 shadow">
        <p className="text-sm font-bold uppercase text-zts-graphite/60">{label}</p>
        <p className="text-lg font-extrabold text-zts-midnight">
          {d.emoji} {d.name} <span className="text-base">{ratingLabel[opt.rating].emoji} {ratingLabel[opt.rating].text}</span>
        </p>
        <p>{opt.why}</p>
      </li>
    )
  }

  return (
    <div className="space-y-5">
      <div className={`${panel} bg-zts-midnight text-center text-white`}>
        <Stars count={stars} />
        <h2 className="mt-2 text-3xl font-extrabold">{headline}</h2>
      </div>
      <ul className="space-y-3">
        {review('Plan A', planA, a)}
        {review('Plan B', planB, b)}
      </ul>
      <div className={`${panel} border-l-8 border-zts-orange bg-orange-50`}>
        <h3 className="font-extrabold text-zts-midnight">🧠 Engineer&apos;s tip: always have a backup</h3>
        <p>
          Real transport networks plan for things going wrong. Having more than one way to get somewhere is called{' '}
          <strong>route redundancy</strong>, and it keeps people and supplies moving when one route breaks.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => start(scenario)} className="rounded-full bg-zts-blue px-6 py-3 font-extrabold text-white">
          🔁 Try this mission again
        </button>
        <button type="button" onClick={() => setStage('pick')} className="rounded-full bg-zts-orange px-6 py-3 font-extrabold text-white">
          🎯 Pick another mission
        </button>
      </div>
    </div>
  )
}
