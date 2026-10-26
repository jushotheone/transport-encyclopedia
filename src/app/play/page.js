import Link from 'next/link'
import HudBar from '@/components/HudBar'

export const metadata = { title: 'Play', description: 'Games, missions and puzzles from Zion Transport System.' }

const games = [
  {
    href: '/',
    emoji: '🧩',
    title: 'Route Builder',
    blurb: 'Turn tiles to connect the route. The Route Breaker will wreck it, so find another way!',
    skill: 'Puzzle: plan, test, adapt',
    colour: '#24875D',
  },
  {
    href: '/studio',
    emoji: '🛠️',
    title: 'Design Studio',
    blurb: 'Invent a vehicle from parts, then see if it can survive a real mission.',
    skill: 'Creating: function first',
    colour: '#E97828',
  },
  {
    href: '/play/missions',
    emoji: '🗺️',
    title: 'Mission Planner',
    blurb: 'Plan a delivery or rescue. Then the Route Breaker wrecks your plan, so can you find a backup?',
    skill: 'Thinking: weigh up trade-offs',
    colour: '#D64045',
  },
  {
    href: '/play/guess',
    emoji: '🔎',
    title: 'Who Am I?',
    blurb: 'Clues appear one by one. Name the mystery vehicle before you run out of points!',
    skill: 'Thinking: use clues to work it out',
    colour: '#4246A3',
  },
  {
    href: '/systems/air',
    emoji: '🃏',
    title: 'Mission Cards',
    blurb: 'Flip through the card deck for every vehicle, then take on its quiz.',
    skill: 'Discovering: collect facts',
    colour: '#31A8E0',
  },
]

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-4xl font-extrabold text-zts-midnight">🎮 Play</h1>
        <p className="mt-1 text-lg text-zts-graphite/80">Every game wins you discoveries and ranks you up.</p>
      </div>
      <HudBar />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="flex h-full flex-col rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: `linear-gradient(145deg, ${g.colour}, #102A43)` }}
            >
              <span className="text-5xl" aria-hidden="true">{g.emoji}</span>
              <span className="mt-2 text-2xl font-extrabold">{g.title}</span>
              <span className="mt-1 flex-1 text-white/90">{g.blurb}</span>
              <span className="mt-4 text-sm font-bold uppercase tracking-wide text-white/80">{g.skill}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
