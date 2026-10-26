'use client'
import { useState } from 'react'
import { isCorrectAnswer } from '@/lib/utils'
import { learn, recordQuizWin } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'

export default function Quiz({ slug, question, choices, answer, accent }) {
  const [picked, setPicked] = useState(null)
  if (!question || choices.length < 2) return null

  const answered = picked !== null
  const correct = answered && isCorrectAnswer(choices[picked], picked, answer)

  function choose(i) {
    if (answered) return
    setPicked(i)
    if (isCorrectAnswer(choices[i], i, answer)) {
      recordQuizWin(slug)
      learn(`quiz:${slug}`, `${question} ${choices[i]}.`)
      confetti({ count: 70 })
      play('good')
    } else play('bad')
  }

  return (
    <section
      aria-labelledby="quiz-heading"
      className="rounded-3xl p-6 text-white shadow-lg"
      style={{ background: `linear-gradient(135deg, #102A43, ${accent})` }}
    >
      <h2 id="quiz-heading" className="text-xl font-extrabold">🎮 Mission Quiz</h2>
      <p className="mt-2 text-lg font-semibold">{question}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {choices.map((choice, i) => {
          const isRight = isCorrectAnswer(choice, i, answer)
          const state = !answered
            ? 'bg-white/15 hover:bg-white/30'
            : isRight
              ? 'bg-green-500 text-white'
              : picked === i
                ? 'bg-red-500/80 text-white'
                : 'bg-white/10 opacity-70'
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={`w-full rounded-2xl px-4 py-3 text-left font-bold transition ${state}`}
              >
                <span aria-hidden="true" className="mr-2 opacity-70">{String.fromCharCode(65 + i)}.</span>
                {choice}
                {answered && isRight && <span className="sr-only"> (correct answer)</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <div aria-live="polite" className="mt-4 min-h-6 font-bold">
        {answered && (correct ? '🎉 Brilliant! You got it. That is one more discovery!' : '🤔 Not quite. The right answer is highlighted, so now you know!')}
      </div>
      {answered && (
        <button
          type="button"
          onClick={() => setPicked(null)}
          className="mt-2 rounded-full bg-white/20 px-4 py-1 text-sm font-bold hover:bg-white/30"
        >
          Try again
        </button>
      )}
    </section>
  )
}
