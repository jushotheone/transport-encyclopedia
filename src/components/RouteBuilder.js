'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { N, E, S, W, SIZES, computeFlow, generateLevel, nextHint, rotateN, starsFor } from '@/lib/routegen'
import { routeThemes, clues } from '@/lib/story'
import { learn, levelsCleared, recordLevel, useExplorer } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

const EDGES = [[N, 50, 0], [E, 100, 50], [S, 50, 100], [W, 0, 50]]

function Tile({ tile, rot, lit, broken, hinted, accent, deco, disabled, onClick, label }) {
  if (tile.rubble || broken) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-900/70 text-2xl sm:text-3xl" aria-label={broken ? 'Broken tile' : 'Rubble'}>
        <span className={broken ? 'animate-shake text-red-400' : 'text-slate-500'}><Icon name={broken ? 'zap' : 'mountain'} className="h-8 w-8" /></span>
      </div>
    )
  }
  const d = EDGES.filter(([bit]) => tile.base & bit).map(([, x, y]) => `M50 50L${x} ${y}`).join('')
  const colour = lit ? accent : '#64748b'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`aspect-square rounded-xl bg-slate-800 transition active:scale-95 ${hinted ? 'animate-pulse ring-4 ring-yellow-300' : 'hover:bg-slate-700'}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full transition-transform duration-200 ease-out"
        style={{ transform: `rotate(${rot * 90}deg)`, filter: lit ? `drop-shadow(0 0 5px ${accent})` : 'none' }}
        aria-hidden="true"
      >
        <path d={d} stroke="#0b1220" strokeWidth="30" strokeLinecap="round" fill="none" />
        {deco === 'sleepers' && <path d={d} stroke="#a16207" strokeWidth="28" strokeDasharray="5 9" fill="none" opacity="0.9" />}
        <path d={d} stroke={colour} strokeWidth={deco === 'dots' ? 6 : 12} strokeLinecap="round" fill="none" />
        {deco === 'dash' && <path d={d} stroke="#fff" strokeWidth="2.5" strokeDasharray="6 8" fill="none" opacity={lit ? 0.9 : 0.35} />}
        {deco === 'dots' && <path d={d} stroke="#fff" strokeWidth="12" strokeDasharray="1 14" strokeLinecap="round" fill="none" opacity="0.8" />}
        {deco === 'flow' && lit && <path d={d} stroke="#fff" strokeWidth="4" strokeDasharray="6 6" fill="none" opacity="0.85" className="animate-flow" />}
        <circle cx="50" cy="50" r="10" fill={colour} />
      </svg>
    </button>
  )
}

function Board({ division, theme, level, onDone }) {
  const data = useMemo(() => generateLevel(division.slug, level), [division.slug, level])
  const { size } = data
  const [rots, setRots] = useState(() => data.tiles.map((t) => t.rot0))
  const [broken, setBroken] = useState(null)
  const [phase, setPhase] = useState('play') // play | strike | won
  const [moves, setMoves] = useState(0)
  const [hints, setHints] = useState(0)
  const [hintKey, setHintKey] = useState(null)
  const [step, setStep] = useState(-1)
  const [result, setResult] = useState(null)
  const routeRef = useRef([])
  const reported = useRef(false)

  const masks = data.tiles.map((t, k) => (k === broken ? 0 : rotateN(t.base, rots[k])))
  const flow = computeFlow(size, masks, data.start, data.end)
  routeRef.current = flow.route

  // 1) the route connects. On later levels the Route Breaker strikes once, mid-journey.
  useEffect(() => {
    if (!flow.exit || phase !== 'play') return
    if (data.twist && broken === null) {
      setPhase('strike')
      play('good')
    } else {
      setPhase('won')
    }
  }, [flow.exit, phase, broken, data.twist])

  useEffect(() => {
    if (phase !== 'strike') return
    const t = setTimeout(() => {
      const interior = routeRef.current.slice(1, -1)
      setBroken(interior[Math.floor(Math.random() * interior.length)])
      setHintKey(null)
      play('strike')
      setPhase('play')
    }, 1100)
    return () => clearTimeout(t)
  }, [phase])

  // 2) the vehicle drives the finished route, then the rewards land.
  const cells = flow.route
  useEffect(() => {
    if (phase !== 'won') return
    setStep(0)
    const t = setInterval(() => setStep((n) => n + 1), 260)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'won' || step < cells.length + 1 || reported.current) return
    reported.current = true
    const stars = starsFor(moves, data.par, hints)
    const { repairedNow } = recordLevel(division.slug, level, stars)
    learn(`route:${division.slug}`, theme.learned)
    play('win')
    confetti({ count: 120 + stars * 40 })
    setResult({ stars, repairedNow })
  }, [phase, step, cells.length, moves, hints, data.par, division.slug, level, theme.learned])

  function rotate(k) {
    if (phase !== 'play') return
    setRots((r) => r.map((v, i) => (i === k ? v + 1 : v)))
    setMoves((m) => m + 1)
    setHintKey(null)
    play('tap')
  }

  function hint() {
    const k = nextHint(data, masks, broken)
    if (k !== null) {
      setHintKey(k)
      setHints((h) => h + 1)
      play('tap')
    }
  }

  const stepCell = (i) => {
    if (i < 0) return { r: data.start, c: -0.8 }
    if (i >= cells.length) return { r: data.end, c: size - 0.2 }
    return { r: Math.floor(cells[i] / size), c: cells[i] % size }
  }
  const pos = stepCell(step)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-extrabold text-white">
        <span className="rounded-full bg-white/10 px-3 py-1">Moves {moves}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">Par {data.par}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">{data.twist ? <><Icon name="alert" className="mr-1 h-4 w-4 text-amber-300" />The Route Breaker is watching</> : 'Warm-up level'}</span>
      </div>

      <p role="status" className="min-h-14 rounded-2xl bg-white/10 px-4 py-3 text-center font-bold text-white">
        {phase === 'strike' && 'Connected! But wait…'}
        {phase === 'play' && broken !== null && 'The Route Breaker broke a tile! Find another way through!'}
        {phase === 'play' && broken === null && 'Tap tiles to turn them. Link the glowing start to the goal flag!'}
        {phase === 'won' && step < cells.length + 1 && 'Off it goes…'}
        {phase === 'won' && step >= cells.length + 1 && 'Route complete!'}
      </p>

      <div className={`relative mx-auto w-full max-w-md px-14 ${phase === 'strike' ? 'animate-shake' : ''}`}>
        <span className="absolute left-0 flex w-14 -translate-y-1/2 flex-col items-center text-[10px] font-extrabold leading-tight text-white" style={{ top: `${((data.start + 0.5) / size) * 100}%` }}>
          <DivisionIcon slug={division.slug} className="h-7 w-7" />{theme.from}
        </span>
        <span className="absolute right-0 flex w-14 -translate-y-1/2 flex-col items-center text-[10px] font-extrabold leading-tight text-white" style={{ top: `${((data.end + 0.5) / size) * 100}%` }}>
          <Icon name="flag" className="h-7 w-7" />{theme.to}
        </span>

        <div className="relative">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {data.tiles.map((tile, k) => (
              <Tile
                key={k}
                tile={tile}
                rot={rots[k]}
                lit={flow.lit.has(k)}
                broken={k === broken}
                hinted={hintKey === k}
                accent={division.accent}
                deco={theme.deco}
                disabled={phase !== 'play'}
                onClick={() => rotate(k)}
                label={`Row ${Math.floor(k / size) + 1}, column ${(k % size) + 1}. Tap to turn.`}
              />
            ))}
          </div>
          {phase === 'won' && step >= 0 && (
            <span
              className="pointer-events-none absolute text-3xl transition-all duration-[260ms] ease-linear"
              style={{ left: `${((pos.c + 0.5) / size) * 100}%`, top: `${((pos.r + 0.5) / size) * 100}%`, transform: 'translate(-50%,-50%)' }}
              aria-hidden="true"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"><Icon name={theme.vehicle} className="h-6 w-6 text-zts-midnight" /></span>
            </span>
          )}
        </div>
      </div>

      {phase !== 'won' && (
        <div className="flex justify-center gap-3">
          <button type="button" onClick={hint} disabled={phase !== 'play'} className="rounded-full bg-yellow-400 px-5 py-2 font-extrabold text-zts-midnight disabled:opacity-40">
            <Icon name="lightbulb" className="mr-1 h-5 w-5" />Hint <span className="text-xs">(max 2 stars)</span>
          </button>
        </div>
      )}

      {result && (
        <div className="animate-pop space-y-3 rounded-3xl bg-white p-5 text-zts-midnight shadow-2xl">
          <p className="flex justify-center"><Stars count={result.stars} className="h-12 w-12" /></p>
          <p className="rounded-2xl bg-sky-50 p-3 font-bold"><Icon name="lightbulb" className="mr-1.5 h-5 w-5 text-yellow-500" />{theme.learned}</p>
          {result.repairedNow && (
            <div className="rounded-2xl bg-orange-50 p-3">
              <p className="font-extrabold">{division.name} route repaired!</p>
              <p className="text-sm">A new clue appeared: <strong>{clues[division.slug].glyph} {clues[division.slug].title}</strong>. See it in the <Link href="/control-room" className="font-bold text-zts-blue underline">Control Room</Link>.</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {level < 3 && (
              <button type="button" onClick={() => onDone?.('next')} className="rounded-full bg-zts-orange px-5 py-2 font-extrabold text-white">Next level</button>
            )}
            <button type="button" onClick={() => onDone?.('retry')} className="rounded-full bg-zts-blue px-5 py-2 font-extrabold text-white"><Icon name="retry" className="mr-1.5 h-5 w-5" />Beat your stars</button>
            <Link href={`/systems/${division.slug}`} className="rounded-full bg-slate-200 px-5 py-2 font-extrabold">Back to hub</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RouteBuilder({ division }) {
  const s = useExplorer()
  const theme = routeThemes[division.slug]
  const [level, setLevel] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const picked = useRef(false)
  const stars = s.levels[division.slug] || {}

  // Start on the first level the child has not cleared yet.
  useEffect(() => {
    if (picked.current) return
    picked.current = true
    setLevel(Math.min(3, levelsCleared(s, division.slug) + 1))
  }, [s, division.slug])

  const unlocked = (n) => n === 1 || stars[n - 1] > 0

  function handle(action) {
    if (action === 'next') setLevel((n) => Math.min(3, n + 1))
    if (action === 'retry') setAttempt((a) => a + 1)
  }

  return (
    <div className="mx-auto max-w-lg rounded-[2rem] p-4 shadow-2xl sm:p-6" style={{ background: `linear-gradient(160deg, #0b1220, ${division.accent}55 140%)` }}>
      <div className="mb-4 flex gap-2" role="tablist" aria-label="Levels">
        {SIZES.map((_, i) => {
          const n = i + 1
          const ok = unlocked(n)
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={level === n}
              disabled={!ok}
              onClick={() => {
                setLevel(n)
                setAttempt(0)
              }}
              className={`flex-1 rounded-2xl px-2 py-2 text-center text-sm font-extrabold transition ${level === n ? 'bg-white text-zts-midnight' : 'bg-white/10 text-white'} disabled:opacity-40`}
            >
              {ok ? `Level ${n}` : <><Icon name="lock" className="mr-1 h-4 w-4" />Level {n}</>}
              <span className="block text-xs">{stars[n] ? <Stars count={stars[n]} className="h-4 w-4" /> : ok ? 'Not yet' : 'Locked'}</span>
            </button>
          )
        })}
      </div>
      <Board key={`${division.slug}-${level}-${attempt}`} division={division} theme={theme} level={level} onDone={handle} />
    </div>
  )
}
