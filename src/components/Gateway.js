'use client'
import { useEffect, useState } from 'react'
import { divisions } from '@/lib/divisions'
import { markIntroSeen, useExplorer } from '@/lib/explorer'
import { play } from '@/lib/sound'

// The Future Gateway: stillness, then transport paths emerge and join into one living network.
const STEPS = [
  { text: 'Take a slow breath in… and out.', sub: 'Be still. Picture the future you are growing towards.' },
  { text: 'Tiny lines of light appear…', sub: 'Roads, rails, flight paths, ocean routes.' },
  { text: 'They connect into one living network.', sub: 'Zion Transport System.' },
  { text: 'Welcome, explorer.', sub: '' },
]

export default function Gateway() {
  const { intro } = useExplorer()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (step < 1 || step > 2) return
    const t = setTimeout(() => {
      setStep((n) => n + 1)
      play(step === 1 ? 'rise' : 'whoosh')
    }, 3000)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (step !== 3) return
    const t = setTimeout(finish, 2200)
    return () => clearTimeout(t)
  })

  function finish() {
    setLeaving(true)
    setTimeout(markIntroSeen, 600)
  }

  if (!mounted || intro) return null
  const cur = STEPS[step]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Entering the Future Gateway"
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-[#06101c] px-6 text-center text-white transition-all duration-700 ${leaving ? 'scale-150 opacity-0' : ''}`}
    >
      <div className="starfield absolute inset-0 opacity-70" aria-hidden="true" />
      <button type="button" onClick={finish} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
        Skip ⏭
      </button>

      <svg viewBox="-100 -100 200 200" className="absolute h-[min(90vw,90vh)] w-[min(90vw,90vh)]" aria-hidden="true">
        {step === 0 && (
          <circle r="22" fill="none" stroke="#1D9BF0" strokeWidth="1.5" className="animate-breathe" style={{ transformOrigin: 'center' }} />
        )}
        {step >= 1 &&
          divisions.map((d, i) => {
            const a = ((-90 + i * 45) * Math.PI) / 180
            const x = Math.cos(a) * 80
            const y = Math.sin(a) * 80
            const mx = Math.cos(a + 0.5) * 50
            const my = Math.sin(a + 0.5) * 50
            return (
              <g key={d.slug}>
                <path
                  d={`M${x} ${y} Q${mx} ${my} 0 0`}
                  fill="none"
                  stroke={d.accent}
                  strokeWidth={step >= 2 ? 2.4 : 1.2}
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  strokeLinecap="round"
                  className="animate-drift"
                  style={{ animationDuration: `${1.4 + i * 0.12}s`, animationDelay: `${i * 0.15}s`, filter: `drop-shadow(0 0 3px ${d.accent})` }}
                />
                <circle cx={x} cy={y} r="3.2" fill={d.accent} opacity={step >= 2 ? 1 : 0.5} />
              </g>
            )
          })}
        {step >= 2 && <circle r="9" fill="#F28C28" className="animate-pulsering" style={{ transformOrigin: 'center' }} />}
        {step >= 2 && <circle r="6" fill="#fff" />}
      </svg>

      <div className="relative z-10 mt-[55vh] max-w-md" aria-live="polite">
        <p className="text-3xl font-extrabold sm:text-4xl">{cur.text}</p>
        {cur.sub && <p className="mt-2 text-lg text-white/70">{cur.sub}</p>}
        {step === 0 && (
          <button
            type="button"
            autoFocus
            onClick={() => {
              play('rise')
              setStep(1)
            }}
            className="mt-6 rounded-full bg-zts-orange px-8 py-3 text-lg font-extrabold shadow-lg hover:brightness-110"
          >
            I&apos;m ready ✨
          </button>
        )}
      </div>
    </div>
  )
}
