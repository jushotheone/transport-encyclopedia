'use client'
import { useEffect, useState } from 'react'
import { buildRounds } from '@/lib/guess'
import { learn, recordWin } from '@/lib/explorer'
import { play } from '@/lib/sound'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

export default function GuessGame({ vehicles }) {
  const [rounds, setRounds] = useState(null)
  const [round, setRound] = useState(0)
  const [shown, setShown] = useState(1)
  const [result, setResult] = useState(null) // { picked, correct }
  const [score, setScore] = useState(0)

  useEffect(() => {
    setRounds(buildRounds(vehicles))
  }, [vehicles])

  function restart() {
    setRounds(buildRounds(vehicles))
    setRound(0)
    setShown(1)
    setResult(null)
    setScore(0)
  }

  if (!rounds) return null

  // Not enough vehicles with enough clues to make a fair mystery.
  if (rounds.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow">
        <p className="flex justify-center text-zts-blue" aria-hidden="true"><Icon name="satellite" className="h-14 w-14" /></p>
        <p className="mt-2 text-lg font-bold">Zion needs to add a few more details to his vehicles, like where they are from and fun facts, before this game can start. Check back soon!</p>
      </div>
    )
  }

  if (round >= rounds.length) {
    return (
      <div className="rounded-3xl bg-zts-midnight p-8 text-center text-white shadow-lg">
        <p className="flex justify-center text-yellow-300" aria-hidden="true"><Icon name="trophy" className="h-16 w-16" /></p>
        <h2 className="mt-2 text-3xl font-extrabold">You scored {score} points!</h2>
        <p className="mt-1 text-white/80">Fewer clues means more points. Can you beat that?</p>
        <button type="button" onClick={restart} className="mt-6 rounded-full bg-zts-orange px-8 py-3 text-lg font-extrabold hover:brightness-110">
          <Icon name="retry" className="mr-1.5 h-5 w-5" />Play again
        </button>
      </div>
    )
  }

  const { vehicle, clues, choices } = rounds[round]
  const points = Math.max(1, clues.length + 1 - shown)

  function pick(choice) {
    if (result) return
    const correct = choice.slug === vehicle.slug
    setResult({ picked: choice.slug, correct })
    if (correct) {
      setScore((s) => s + points)
      recordWin(`guess:${vehicle.slug}`)
      learn(`guess:${vehicle.slug}`, `${vehicle.name}: ${vehicle.funFact || vehicle.description.split(/(?<=[.!?])\s+/)[0]}`)
      play('good')
    } else play('bad')
  }

  function next() {
    setRound((r) => r + 1)
    setShown(1)
    setResult(null)
  }

  return (
    <div className="space-y-5">
      <p className="font-bold text-zts-graphite/70">
        Mystery {round + 1} of {rounds.length} · Score {score}
      </p>

      <ol className="space-y-3" aria-label="Clues">
        {clues.slice(0, shown).map((c, i) => (
          <li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-4 text-lg shadow animate-cardin">
            <span className="text-zts-blue" aria-hidden="true">{c.flag ? <span className="text-3xl">{c.flag}</span> : c.icon === 'division' ? <DivisionIcon slug={c.slug} className="h-8 w-8" /> : <Icon name={c.icon} className="h-8 w-8" />}</span>
            <span><span className="font-extrabold text-zts-blue">Clue {i + 1}: </span>{c.text}</span>
          </li>
        ))}
      </ol>

      {!result && shown < clues.length && (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="rounded-full bg-zts-midnight px-5 py-2 font-extrabold text-white hover:bg-zts-blue"
        >
          <Icon name="search" className="mr-1.5 h-5 w-5" />Another clue (worth fewer points)
        </button>
      )}

      <h2 className="text-xl font-extrabold text-zts-midnight">
        Who am I? <span className="text-zts-orange">{points} {points === 1 ? 'point' : 'points'}</span>
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {choices.map((c) => {
          const isAnswer = c.slug === vehicle.slug
          const state = !result
            ? 'bg-white hover:-translate-y-0.5 hover:shadow-lg'
            : isAnswer
              ? 'bg-green-500 text-white'
              : result.picked === c.slug
                ? 'bg-red-500/80 text-white'
                : 'bg-white opacity-60'
          return (
            <li key={c.slug}>
              <button
                type="button"
                disabled={!!result}
                onClick={() => pick(c)}
                className={`w-full rounded-2xl p-4 text-left text-lg font-extrabold shadow transition ${state}`}
              >
                <DivisionIcon slug={c.system} className="mr-2 h-5 w-5" />{c.name}
                {result && isAnswer && <span className="sr-only"> (correct answer)</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {result && (
        <div aria-live="polite" className="rounded-2xl bg-orange-50 p-4 shadow">
          <p className="text-xl font-extrabold text-zts-midnight">
            {result.correct ? `Yes! It is the ${vehicle.name}! +${points}` : `Not quite. It was the ${vehicle.name}!`}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={next} className="rounded-full bg-zts-orange px-6 py-2 font-extrabold text-white">
              {round + 1 === rounds.length ? 'See my score' : 'Next mystery'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
