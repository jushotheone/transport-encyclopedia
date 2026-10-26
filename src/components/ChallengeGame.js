'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Icon, { Stars } from '@/components/Icon'
import { dailyQuestions, levelForSkill, makeQuestion } from '@/lib/challenges'
import { dayKey, learn, recordDaily, recordRun, useExplorer } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'

const LEVELS = ['', 'Scout', 'Navigator', 'Captain']
const LIGHTNING_SECONDS = 10

function Media({ media }) {
  const audio = useRef(null)
  const [on, setOn] = useState(false)
  if (!media) return null
  if (media.kind === 'image') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.src} alt="A vehicle. Work out which one it is." className="mx-auto h-48 w-full max-w-md rounded-2xl object-cover shadow" />
  }
  return (
    <button
      type="button"
      onClick={() => {
        if (!audio.current) {
          audio.current = new Audio(media.src)
          audio.current.onended = () => setOn(false)
        }
        audio.current.currentTime = 0
        audio.current.play().then(() => setOn(true)).catch(() => setOn(false))
      }}
      className="mx-auto flex items-center gap-2 rounded-full bg-zts-blue px-6 py-3 font-extrabold text-white shadow hover:brightness-110"
    >
      <Icon name={on ? 'volume' : 'play'} className="h-5 w-5" />{on ? 'Playing…' : 'Play the sound'}
    </button>
  )
}

function Question({ q, picked, onPick, lightning, timeLeft }) {
  const answered = picked !== null
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
        <span className="rounded-full bg-zts-midnight px-3 py-1 text-white">{LEVELS[q.level]}</span>
        {q.source === 'zion' && (
          <span className="rounded-full bg-zts-orange px-3 py-1 text-white">
            <Icon name="pencil" className="mr-1 h-3.5 w-3.5" />{q.authored ? 'Written by Zion' : "From Zion's notes"}
          </span>
        )}
        {lightning && (
          <span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-white">
            <Icon name="zap" className="mr-1 h-3.5 w-3.5" />Route Breaker lightning round
          </span>
        )}
      </div>

      {lightning && !answered && (
        <div className="h-3 overflow-hidden rounded-full bg-slate-200" role="timer" aria-label={`${Math.ceil(timeLeft)} seconds left`}>
          <div className="h-full rounded-full bg-red-500 transition-[width] duration-100 ease-linear" style={{ width: `${(timeLeft / LIGHTNING_SECONDS) * 100}%` }} />
        </div>
      )}

      <div className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-zts-midnight/10">
        <h2 className="text-2xl font-extrabold leading-snug text-zts-midnight">{q.prompt}</h2>
        {q.quote && <blockquote className="mt-3 rounded-2xl border-l-8 border-zts-blue bg-sky-50 p-4 text-lg font-bold italic text-zts-midnight">{q.quote}</blockquote>}
        <div className="mt-3"><Media media={q.media} /></div>
      </div>

      <ul className={`grid gap-3 ${q.choices.length === 2 ? 'grid-cols-2' : 'sm:grid-cols-2'}`}>
        {q.choices.map((c, i) => {
          const state = !answered ? 'bg-white text-zts-midnight hover:-translate-y-0.5 hover:shadow-lg' : c.correct ? 'bg-green-600 text-white' : picked === i ? 'bg-red-600 text-white' : 'bg-white text-zts-midnight opacity-50'
          return (
            <li key={i}>
              <button type="button" disabled={answered} onClick={() => onPick(i)} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left text-lg font-extrabold shadow transition ${state}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-sm">{String.fromCharCode(65 + i)}</span>
                <span className="flex-1">{c.label}</span>
                {c.sub && <span className="text-2xl" aria-hidden="true">{c.sub}</span>}
                {answered && c.correct && <Icon name="ok" className="h-6 w-6" />}
                {answered && !c.correct && picked === i && <Icon name="no" className="h-6 w-6" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function ChallengeGame({ vehicles, extra, mode }) {
  const s = useExplorer()
  const [today, setToday] = useState(null)
  const [questions, setQuestions] = useState([])
  const [q, setQ] = useState(null)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [skill, setSkill] = useState(0)
  const [lives, setLives] = useState(3)
  const [recent, setRecent] = useState([])
  const [lightning, setLightning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(LIGHTNING_SECONDS)
  const [done, setDone] = useState(false)
  const [practice, setPractice] = useState(false)
  const [marks, setMarks] = useState([])
  const [newBest, setNewBest] = useState(false)
  const [copied, setCopied] = useState(false)
  const finished = useRef(false)
  const daily = mode === 'daily'

  const alreadyPlayed = daily && !practice && s.challenge.daily.day === today
  const total = daily ? questions.length : null

  function begin(isPractice = false) {
    finished.current = false
    const day = dayKey()
    setToday(day)
    setPractice(isPractice)
    setIdx(0); setPicked(null); setCorrect(0); setSkill(0); setLives(3); setRecent([]); setDone(false); setMarks([]); setNewBest(false); setLightning(false)
    if (daily) {
      const list = dailyQuestions(vehicles, extra, day)
      setQuestions(list)
      setQ(list[0] || null)
    } else {
      const first = makeQuestion({ vehicles, extra, level: 1 })
      setQ(first)
      setRecent(first ? [first.type, first.signature] : [])
    }
  }

  useEffect(() => begin(false), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Lightning countdown: running out of time counts as a wrong answer.
  useEffect(() => {
    if (!lightning || picked !== null || !q) return
    const t = setInterval(() => setTimeLeft((n) => Math.max(0, n - 0.1)), 100)
    return () => clearInterval(t)
  }, [lightning, picked, q])

  useEffect(() => {
    if (lightning && picked === null && timeLeft <= 0) answer(-1)
  })

  function answer(i) {
    if (picked !== null || !q) return
    setPicked(i)
    const ok = i >= 0 && q.choices[i].correct
    setMarks((m) => [...m, ok])
    if (ok) setCorrect((c) => c + 1)
    if (!daily) {
      setSkill((n) => (ok ? n + 1 : Math.max(0, n - 2)))
      if (!ok) setLives((l) => l - 1)
    }
    play(ok ? 'good' : 'bad')
    learn(`ch:${q.id}`, q.explain, true)
  }

  function next() {
    const lastDaily = daily && idx + 1 >= questions.length
    const dead = !daily && lives <= 0
    if (lastDaily || dead || (daily && !questions.length)) return finish()
    const n = idx + 1
    setIdx(n)
    setPicked(null)
    if (daily) {
      setQ(questions[n])
      setLightning(false)
    } else {
      const nextQ = makeQuestion({ vehicles, extra, level: levelForSkill(skill), recent })
      if (!nextQ) return finish()
      setQ(nextQ)
      setRecent((r) => [...r.slice(-8), nextQ.type, nextQ.signature])
      const strike = n >= 3 && !lightning && Math.random() < 0.25
      setLightning(strike)
      setTimeLeft(LIGHTNING_SECONDS)
    }
  }

  function finish() {
    if (finished.current) return
    finished.current = true
    setDone(true)
    if (daily && !practice) {
      recordDaily(today, correct, questions.length)
      if (correct >= Math.ceil(questions.length * 0.6)) {
        play('win')
        confetti({ count: 80 + correct * 20 })
      }
    }
    if (!daily) {
      setNewBest(recordRun(correct))
      if (correct >= 5) {
        play('win')
        confetti({ count: 80 + correct * 10 })
      }
    }
    toast('Every answer is saved in your learning log.', 'book')
  }

  async function share() {
    const line = marks.map((m) => (m ? '■' : '□')).join('')
    const text = `Zion Transport System Daily ${today}: ${s.challenge.daily.score}/${s.challenge.daily.total}\n${line}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast(text, 'share')
    }
  }

  const stats = useMemo(() => {
    const pct = daily ? (questions.length ? correct / questions.length : 0) : 0
    return daily ? (pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1) : correct >= 10 ? 3 : correct >= 5 ? 2 : 1
  }, [daily, correct, questions.length])

  if (today === null) return null

  if (!q && !done) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow">
        <Icon name="telescope" className="mx-auto h-12 w-12 text-zts-blue" />
        <p className="mt-2 text-lg font-bold">Zion needs to add a few more vehicles before this challenge can start. Check back soon!</p>
      </div>
    )
  }

  if (alreadyPlayed && !done) {
    const d = s.challenge.daily
    return (
      <div className="animate-pop space-y-4 rounded-3xl bg-zts-midnight p-8 text-center text-white shadow-xl">
        <Icon name="trophy" className="mx-auto h-14 w-14 text-yellow-300" />
        <h2 className="text-3xl font-extrabold">You finished today&apos;s challenge!</h2>
        <p className="text-xl">You scored {d.score} out of {d.total}.</p>
        <p className="text-white/70">A brand new challenge unlocks tomorrow. Compare scores with friends and family!</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={share} className="rounded-full bg-zts-orange px-6 py-3 font-extrabold hover:brightness-110">
            <Icon name="share" className="mr-2 h-5 w-5" />{copied ? 'Copied!' : 'Copy my score'}
          </button>
          <button type="button" onClick={() => begin(true)} className="rounded-full bg-white/15 px-6 py-3 font-extrabold hover:bg-white/25">
            <Icon name="retry" className="mr-2 h-5 w-5" />Practice (not scored)
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="animate-pop space-y-4 rounded-3xl bg-zts-midnight p-8 text-center text-white shadow-xl">
        <p className="flex justify-center"><Stars count={stats} className="h-12 w-12" /></p>
        <h2 className="text-3xl font-extrabold">
          {daily ? `${correct} out of ${questions.length}` : `${correct} right in a row`}
        </h2>
        {!daily && <p className="text-white/80">{newBest ? 'A new personal best!' : `Your best is ${s.challenge.best}.`}</p>}
        {daily && practice && <p className="text-white/70">Practice round, so your score was not saved.</p>}
        <div className="flex flex-wrap justify-center gap-3">
          {daily && !practice && (
            <button type="button" onClick={share} className="rounded-full bg-zts-orange px-6 py-3 font-extrabold hover:brightness-110">
              <Icon name="share" className="mr-2 h-5 w-5" />{copied ? 'Copied!' : 'Copy my score'}
            </button>
          )}
          <button type="button" onClick={() => begin(daily)} className="rounded-full bg-white/15 px-6 py-3 font-extrabold hover:bg-white/25">
            <Icon name="retry" className="mr-2 h-5 w-5" />{daily ? 'Practice again' : 'Run again'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-extrabold text-zts-midnight">
        {daily ? <span>Question {idx + 1} of {questions.length}</span> : <span>Streak: {correct}</span>}
        {daily ? (
          <span className="flex gap-1" aria-hidden="true">
            {questions.map((_, i) => <span key={i} className={`h-3 w-3 rounded-full ${i < marks.length ? (marks[i] ? 'bg-green-500' : 'bg-red-400') : i === idx ? 'bg-zts-orange' : 'bg-slate-300'}`} />)}
          </span>
        ) : (
          <span className="flex gap-1" aria-label={`${lives} lives left`}>
            {[0, 1, 2].map((i) => <Icon key={i} name="heart" className={`h-6 w-6 ${i < lives ? 'text-red-500' : 'text-slate-300'}`} fill={i < lives ? 'currentColor' : 'none'} />)}
          </span>
        )}
      </div>

      <Question key={q.id + idx} q={q} picked={picked} onPick={answer} lightning={lightning} timeLeft={timeLeft} />

      {picked !== null && (
        <div aria-live="polite" className="animate-pop rounded-3xl bg-zts-midnight p-5 text-white shadow-lg">
          <p className="text-xl font-extrabold">{picked >= 0 && q.choices[picked].correct ? 'Correct!' : picked === -1 ? 'Out of time!' : 'Not quite.'}</p>
          <p className="mt-1 text-lg"><Icon name="lightbulb" className="mr-1.5 h-5 w-5 text-yellow-300" />{q.explain}</p>
          <button type="button" onClick={next} className="mt-3 rounded-full bg-zts-orange px-6 py-2 font-extrabold hover:brightness-110">
            {!daily && lives <= 0 ? 'See my result' : daily && idx + 1 >= questions.length ? 'See my score' : 'Next question'}
          </button>
        </div>
      )}
    </div>
  )
}
