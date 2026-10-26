import Link from 'next/link'
import { divisions } from '@/lib/divisions'

export default function DivisionGrid() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {divisions.map((d) => (
        <li key={d.slug}>
          <Link
            href={`/systems/${d.slug}`}
            className="group flex h-full flex-col rounded-3xl p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
            style={{ background: `linear-gradient(145deg, ${d.accent}, #102A43)` }}
          >
            <span className="text-5xl transition group-hover:scale-110" aria-hidden="true">{d.emoji}</span>
            <h3 className="mt-3 text-xl font-extrabold">{d.name}</h3>
            <p className="text-sm font-bold uppercase tracking-wide text-white/80">{d.tagline}</p>
            <p className="mt-2 flex-1 text-sm text-white/90">{d.description}</p>
            <p className="mt-4 text-sm font-extrabold">🎯 Mission: {d.mission}</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
