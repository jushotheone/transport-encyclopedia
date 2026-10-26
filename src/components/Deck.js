'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Quiz from '@/components/Quiz'
import ReadAloud from '@/components/ReadAloud'
import SoundButton from '@/components/SoundButton'
import CardReveal from '@/components/CardReveal'
import SceneArt from '@/components/SceneArt'
import { learn, recordCard } from '@/lib/explorer'
import { play } from '@/lib/sound'

// One card = one idea. Cards are plain data built on the server (see vehicle page).
function Reveal({ card, accent }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-expanded={open}
      className="flex min-h-72 w-full flex-col items-center justify-center rounded-3xl p-8 text-center text-white shadow-lg"
      style={{ background: open ? '#0f766e' : `linear-gradient(135deg, ${accent}, #102A43)` }}
    >
      <span className="text-6xl" aria-hidden="true">{open ? card.icon : '❓'}</span>
      <span className="mt-3 text-2xl font-extrabold">{card.title}</span>
      <span className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">
        {open ? card.body : 'Tap to reveal!'}
      </span>
    </button>
  )
}

function CardBody({ card, accent, slug }) {
  switch (card.type) {
    case 'cover':
      return (
        <div
          className="relative flex min-h-72 flex-col items-center justify-end overflow-hidden rounded-3xl text-center text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accent}, #102A43)` }}
        >
          {card.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image} alt={card.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <SceneArt slug={card.slug} className="absolute inset-0 h-full w-full" />
              <span className="absolute inset-x-0 top-8 text-8xl drop-shadow-lg" aria-hidden="true">{card.emoji}</span>
            </>
          )}
          <div className="relative w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-16">
            <h2 className="text-4xl font-extrabold">{card.name}</h2>
            <p className="font-bold uppercase tracking-wide text-white/85">{card.division}</p>
            <p className="mt-2 text-sm text-white/80">Swipe or tap Next to start →</p>
          </div>
        </div>
      )
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.src} alt={card.alt} className="h-80 w-full rounded-3xl object-cover shadow-lg sm:h-96" />
      )
    case 'video':
      return (
        <div className="aspect-video overflow-hidden rounded-3xl shadow-lg">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${card.id}`}
            title={card.title}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )
    case 'reveal':
      return <Reveal key={card.title} card={card} accent={accent} />
    case 'quiz':
      return <Quiz slug={slug} question={card.question} choices={card.choices} answer={card.answer} accent={accent} />
    case 'final':
      return (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl bg-zts-midnight p-8 text-center text-white shadow-lg">
          <p className="text-6xl" aria-hidden="true">🎖️</p>
          <h2 className="mt-2 text-3xl font-extrabold">Discovery logged!</h2>
          <p className="mt-1 text-white/80">Where next, explorer?</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {card.related.map((r) => (
              <Link key={r.slug} href={`/vehicles/${r.slug}`} className="rounded-full bg-white/15 px-4 py-2 font-bold hover:bg-white/30">
                {r.name} →
              </Link>
            ))}
            <Link href="/play" className="rounded-full bg-zts-orange px-4 py-2 font-extrabold hover:brightness-110">🎮 Play a game</Link>
          </div>
        </div>
      )
    default: // 'text' and 'fact'
      return (
        <div
          className="flex min-h-72 flex-col justify-center rounded-3xl p-8 shadow-lg"
          style={card.tone === 'dark' ? { background: '#102A43', color: '#fff' } : { background: '#fff', borderLeft: `10px solid ${accent}` }}
        >
          <p className="text-5xl" aria-hidden="true">{card.icon}</p>
          <h2 className="mt-2 text-lg font-extrabold uppercase tracking-wide opacity-70">{card.title}</h2>
          <p className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">{card.body}</p>
          {card.note && <p className="mt-4 text-lg font-bold italic" style={{ color: accent }}>{card.note}</p>}
        </div>
      )
  }
}

const speakable = (c) =>
  c.type === 'cover' ? c.name : c.type === 'reveal' ? `${c.title}. ${c.body}` : c.body ? `${c.title}. ${c.body}` : ''

export default function Deck({ cards, accent, slug, soundUrl, name, vehicle }) {
  const [i, setI] = useState(0)
  const [reveal, setReveal] = useState(false)
  const [dir, setDir] = useState(1)
  const startX = useRef(null)
  const last = cards.length - 1

  function go(n) {
    if (n < 0 || n > last) return
    setDir(n > i ? 1 : -1)
    setI(n)
    play('tap')
  }

  // Reaching the last card finishes the deck: the vehicle's collectible card unlocks and a fact is logged.
  const finished = i === last
  useEffect(() => {
    if (!finished) return
    if (recordCard(slug)) setReveal(true)
    const fact = vehicle.funFact || vehicle.description.split(/(?<=[.!?])\s+/)[0]
    if (fact) learn(`vehicle:${slug}`, `${vehicle.name}: ${fact}`)
  }, [finished, slug, vehicle])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(i + 1)
      if (e.key === 'ArrowLeft') go(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const card = cards[i]

  return (
    <section aria-roledescription="carousel" aria-label={`${name} cards`} className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-extrabold text-zts-midnight" aria-live="polite">Card {i + 1} of {cards.length}</p>
        <div className="flex gap-2">
          <ReadAloud text={speakable(card)} key={i} />
          {soundUrl && <SoundButton src={soundUrl} label={name} />}
        </div>
      </div>

      <div
        key={i}
        className={dir > 0 ? 'animate-cardin' : 'animate-cardin-back'}
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null) return
          const dx = e.changedTouches[0].clientX - startX.current
          startX.current = null
          if (Math.abs(dx) > 60) go(dx < 0 ? i + 1 : i - 1)
        }}
      >
        <CardBody card={card} accent={accent} slug={slug} />
      </div>

      {reveal && <CardReveal vehicle={vehicle} onClose={() => setReveal(false)} />}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="rounded-full bg-white px-6 py-3 text-lg font-extrabold shadow disabled:opacity-30"
        >
          ← Back
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {cards.map((_, n) => (
            <span key={n} className="h-2.5 w-2.5 rounded-full" style={{ background: n === i ? accent : '#cbd5e1' }} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === last}
          className="rounded-full px-6 py-3 text-lg font-extrabold text-white shadow disabled:opacity-30"
          style={{ background: accent }}
        >
          Next →
        </button>
      </div>
    </section>
  )
}
