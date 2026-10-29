'use client'
import { useEffect, useState } from 'react'
import { divisions } from '@/lib/divisions'
import { AVATARS, markIntroSeen, setProfile, useExplorer } from '@/lib/explorer'
import { play } from '@/lib/sound'
import { Avatar } from '@/components/Icon'
import { ZionAvatar, ZionSays } from '@/components/Zion'

// The Future Gateway: stillness, then transport paths emerge and join into one living network.
const STEPS = [
  { text: 'Take a slow breath in… and out.', sub: 'Be still. Picture the future you are growing towards.' },
  { text: 'Tiny lines of light appear…', sub: 'Roads, rails, flight paths, ocean routes.' },
  { text: 'They connect into one living network.', sub: 'Zion Transport System.' },
  { text: 'Welcome, explorer.', sub: "I'm Zion. Let's fix the network together." },
]

export default function Gateway() {
  const { intro, profile } = useExplorer()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
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
      className={`fixed inset-x-0 top-0 z-[90] overflow-y-auto overscroll-contain bg-[#06101c] text-center text-white transition-all duration-700 ${leaving ? 'scale-150 opacity-0' : ''}`}
      style={{ height: '100dvh' }}
    >
      <div className="starfield pointer-events-none fixed inset-0 opacity-70" aria-hidden="true" />
      <button type="button" onClick={finish} className="fixed right-4 top-4 z-20 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20">
        Skip
      </button>

      <svg
        viewBox="-100 -100 200 200"
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
        style={step === 0 ? { top: '22%', width: 'min(55vw, 28dvh)', height: 'min(55vw, 28dvh)' } : { top: '40%', width: 'min(90vw, 55dvh)', height: 'min(90vw, 55dvh)' }}
        aria-hidden="true"
      >
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

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-end px-6 pb-28 pt-24">
      <div className="w-full" aria-live="polite">
        {step === 3 && <div className="animate-pop mb-3 flex justify-center"><ZionAvatar className="h-24 w-24" priority /></div>}
        <p className={`${step === 0 ? 'text-2xl' : 'text-3xl'} font-extrabold sm:text-4xl`}>{cur.text}</p>
        {cur.sub && <p className="mt-2 text-base text-white/70 sm:text-lg">{cur.sub}</p>}
        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setProfile({ name: name.trim() || profile.name || 'Explorer', avatar })
              play('rise')
              setStep(1)
            }}
            className="mt-4 space-y-3"
          >
            <div>
              <label htmlFor="explorer-name" className="block text-sm font-bold text-white/80">What is your explorer name?</label>
              <input
                id="explorer-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 14))}
                placeholder="Explorer"
                autoComplete="off"
                className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-2.5 text-center text-xl font-extrabold text-white outline-none placeholder:text-white/30 focus:bg-white/20"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Choose your explorer">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={avatar === a}
                  aria-label={`Explorer ${a}`}
                  onClick={() => setAvatar(a)}
                  className={`rounded-full p-0.5 transition ${avatar === a ? 'ring-4 ring-white' : 'opacity-70 hover:opacity-100'}`}
                >
                  <Avatar name={a} className="h-10 w-10" />
                </button>
              ))}
            </div>
            <button type="submit" className="rounded-full bg-zts-orange px-8 py-3 text-lg font-extrabold shadow-lg hover:brightness-110">
              I&apos;m ready
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  )
}
