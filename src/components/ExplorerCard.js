'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { getDivision } from '@/lib/divisions'
import { rarityOf } from '@/lib/story'
import { safeUrl } from '@/lib/utils'
import SceneArt from '@/components/SceneArt'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

// A collectible vehicle card. Rare cards get a holographic shine that follows the finger or mouse.
export default function ExplorerCard({ vehicle, flippable = false, flipped: forced, className = '' }) {
  const division = getDivision(vehicle.system) || { accent: '#1D9BF0', name: vehicle.system }
  const rarity = rarityOf(vehicle.slug)
  const img = safeUrl(vehicle.image)
  const ref = useRef(null)
  const [flip, setFlip] = useState(false)
  const showBack = forced ?? flip

  function tilt(e) {
    const el = ref.current
    if (!el) return
    const b = el.getBoundingClientRect()
    const x = (e.clientX - b.left) / b.width
    const y = (e.clientY - b.top) / b.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 16}deg`)
  }
  function reset() {
    const el = ref.current
    if (!el) return
    ;['--rx', '--ry'].forEach((p) => el.style.setProperty(p, '0deg'))
  }

  const face = 'absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]'
  return (
    <div className={`w-full max-w-[240px] [perspective:900px] ${className}`}>
      <div
        ref={ref}
        onPointerMove={tilt}
        onPointerLeave={reset}
        onClick={flippable ? () => setFlip((f) => !f) : undefined}
        role={flippable ? 'button' : undefined}
        tabIndex={flippable ? 0 : undefined}
        onKeyDown={flippable ? (e) => (e.key === 'Enter' || e.key === ' ') && setFlip((f) => !f) : undefined}
        aria-label={flippable ? `${vehicle.name} card. Tap to flip.` : undefined}
        className="relative aspect-[5/7] w-full cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: `rotateX(var(--rx,0deg)) rotateY(calc(var(--ry,0deg) + ${showBack ? 180 : 0}deg))` }}
      >
        <div
          className={`${face} p-2 shadow-xl`}
          style={{ background: `linear-gradient(145deg, ${rarity.colour}, ${division.accent} 55%, #102A43)` }}
        >
          <div className="flex h-full flex-col rounded-xl bg-[#0b1626] p-2 text-white">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
              <span style={{ color: rarity.colour }}>{rarity.label}</span>
              <DivisionIcon slug={vehicle.system} className="h-4 w-4" />
            </div>
            <div className="relative mt-1 flex-1 overflow-hidden rounded-lg" style={{ background: `linear-gradient(135deg, ${division.accent}, #102A43)` }}>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={vehicle.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <>
                  <SceneArt slug={vehicle.system} className="absolute inset-0 h-full w-full" />
                  <span className="relative flex h-full items-center justify-center text-white drop-shadow-lg" aria-hidden="true"><DivisionIcon slug={vehicle.system} className="h-16 w-16" /></span>
                </>
              )}
            </div>
            <p className="mt-1.5 truncate text-center text-base font-extrabold leading-tight">{vehicle.name}</p>
            <p className="truncate text-center text-[11px] text-white/70">
              {vehicle.flag_emoji} {vehicle.origin_country || division.name}
            </p>
          </div>
          {rarity.holo && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-color-dodge opacity-60"
              style={{
                background: `radial-gradient(circle at var(--mx,30%) var(--my,20%), #fff9, transparent 45%), linear-gradient(115deg, transparent 20%, #ff6ec7 40%, #6ee7ff 55%, #fef08a 70%, transparent 85%)`,
                backgroundSize: '100% 100%, 250% 250%',
              }}
            />
          )}
        </div>

        <div className={`${face} flex flex-col justify-between bg-[#0b1626] p-4 text-white ring-4`} style={{ transform: 'rotateY(180deg)', '--tw-ring-color': rarity.colour }}>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: rarity.colour }}><Icon name="sparkles" className="mr-1 h-3.5 w-3.5" />Fun fact</p>
            <p className="mt-2 text-sm font-bold leading-snug">{vehicle.funFact || vehicle.description || 'More facts coming soon!'}</p>
          </div>
          <Link href={`/vehicles/${vehicle.slug}`} onClick={(e) => e.stopPropagation()} className="rounded-full bg-white/15 py-2 text-center text-sm font-extrabold hover:bg-white/25">
            Open file
          </Link>
        </div>
      </div>
    </div>
  )
}

export function LockedCard({ vehicle }) {
  const division = getDivision(vehicle.system) || { accent: '#64748b' }
  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className="relative flex aspect-[5/7] w-full max-w-[240px] flex-col items-center justify-center rounded-2xl border-4 border-dashed border-slate-300 bg-slate-100 text-center text-slate-500 transition hover:border-zts-orange hover:bg-orange-50"
    >
      <span className="opacity-30" aria-hidden="true"><DivisionIcon slug={vehicle.system} className="h-12 w-12" /></span>
      <Icon name="lock" className="mt-2 h-8 w-8" />
      <span className="mt-1 px-3 text-sm font-extrabold">Discover to collect</span>
      <span className="sr-only">{vehicle.name} card, locked</span>
    </Link>
  )
}
