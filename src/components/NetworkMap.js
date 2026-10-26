'use client'
import { useState } from 'react'
import Link from 'next/link'
import { divisions } from '@/lib/divisions'
import { levelsCleared, repairedCount, useExplorer } from '@/lib/explorer'
import { play } from '@/lib/sound'

const RADIUS = 35
const hubs = divisions.map((d, i) => {
  const a = ((-90 + i * 45) * Math.PI) / 180
  return { ...d, x: 50 + RADIUS * Math.cos(a), y: 50 + RADIUS * Math.sin(a) }
})

// A gentle curve from each hub into the centre, so the network looks alive rather than like spokes.
function curve(h) {
  const mx = (h.x + 50) / 2
  const my = (h.y + 50) / 2
  const nx = -(50 - h.y) * 0.2
  const ny = (50 - h.x) * 0.2
  return { d: `M${h.x} ${h.y} Q${mx + nx} ${my + ny} 50 50`, mid: { x: 0.25 * h.x + 0.5 * (mx + nx) + 12.5, y: 0.25 * h.y + 0.5 * (my + ny) + 12.5 } }
}

export default function NetworkMap() {
  const s = useExplorer()
  const [note, setNote] = useState('')
  const fixed = repairedCount(s, divisions.map((d) => d.slug))
  const open = fixed === divisions.length

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[700px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0a1d33] to-[#06101c] shadow-2xl ring-4 ring-zts-midnight">
        <div className="starfield absolute inset-0 opacity-60" aria-hidden="true" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {[14, 24, 35, 46].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.25" />
          ))}
          {hubs.map((h) => {
            const cleared = levelsCleared(s, h.slug)
            const { d, mid } = curve(h)
            const repaired = cleared === 3
            return (
              <g key={h.slug}>
                {repaired ? (
                  <>
                    <path d={d} fill="none" stroke={h.accent} strokeWidth="1.4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 1.5px ${h.accent})` }} />
                    <text fontSize="4.2" textAnchor="middle" dominantBaseline="central">
                      {h.emoji}
                      <animateMotion dur="5s" repeatCount="indefinite" path={d} />
                    </text>
                  </>
                ) : (
                  <>
                    <path d={d} fill="none" stroke={cleared ? '#f59e0b' : '#ef4444'} strokeWidth="0.9" strokeDasharray={cleared ? '3 2' : '1.2 2.6'} strokeLinecap="round" className="animate-glitch" />
                    <text x={mid.x} y={mid.y} fontSize="4" textAnchor="middle" dominantBaseline="central" className="animate-glitch">⚠️</text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {hubs.map((h) => {
          const cleared = levelsCleared(s, h.slug)
          return (
            <Link
              key={h.slug}
              href={`/systems/${h.slug}`}
              onClick={() => play('tap')}
              aria-label={`${h.name}: ${cleared === 3 ? 'route repaired' : `${cleared} of 3 repairs done`}`}
              className="group absolute flex w-[21%] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl p-1 text-center transition hover:scale-110"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              <span
                className="flex aspect-square w-[62%] items-center justify-center rounded-full text-[clamp(1.2rem,5.5vw,2.3rem)] shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${h.accent}, #102A43)`,
                  boxShadow: `0 0 ${cleared === 3 ? 22 : 8}px ${h.accent}`,
                }}
                aria-hidden="true"
              >
                {h.emoji}
              </span>
              <span className="mt-1 text-[clamp(0.55rem,2.3vw,0.8rem)] font-extrabold leading-tight text-white">{h.name.replace(' Transport', '')}</span>
              <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={`h-1.5 w-1.5 rounded-full ${n <= cleared ? 'bg-green-400' : 'bg-white/30'}`} />
                ))}
              </span>
            </Link>
          )
        })}

        {open ? (
          <Link
            href="/control-room"
            onClick={() => play('good')}
            className="absolute left-1/2 top-1/2 flex aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-zts-orange to-amber-300 text-center font-extrabold text-zts-midnight shadow-[0_0_40px_#F28C28]"
          >
            <span className="absolute inset-0 animate-pulsering rounded-full bg-zts-orange/60" aria-hidden="true" />
            <span className="relative text-3xl" aria-hidden="true">🛰️</span>
            <span className="relative text-[clamp(0.5rem,2vw,0.75rem)] leading-tight">Control Room OPEN</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              play('bad')
              setNote(`The Control Room is locked. Repair ${divisions.length - fixed} more route${divisions.length - fixed === 1 ? '' : 's'} to open it!`)
            }}
            className="absolute left-1/2 top-1/2 flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-slate-800 text-center text-white ring-2 ring-white/20"
          >
            <span className="text-2xl" aria-hidden="true">🔒</span>
            <span className="text-[clamp(0.45rem,1.8vw,0.7rem)] font-bold leading-tight">Control Room</span>
          </button>
        )}
      </div>
      <p role="status" className="mt-3 min-h-6 text-center font-bold text-zts-orange">{note}</p>
    </div>
  )
}
