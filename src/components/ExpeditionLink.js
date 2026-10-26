'use client'
import Link from 'next/link'
import { expeditions, spotKey } from '@/lib/expeditions'
import { useExplorer } from '@/lib/explorer'

export default function ExpeditionLink({ division }) {
  const s = useExplorer()
  const { place, spots } = expeditions[division.slug]
  const found = spots.filter((p) => s.wins.includes(spotKey(division.slug, p.id))).length
  return (
    <Link href={`/explore/${division.slug}`} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-lg ring-1 ring-zts-midnight/10 transition hover:-translate-y-1 hover:shadow-2xl">
      <span className="text-5xl" aria-hidden="true">🔭</span>
      <span className="flex-1">
        <span className="block text-xl font-extrabold text-zts-midnight">Explore the {place.toLowerCase()}</span>
        <span className="text-sm text-zts-graphite/70">{found === spots.length ? '🏅 Expedition complete!' : `${found} of ${spots.length} discoveries found. Can you find them all?`}</span>
      </span>
      <span className="font-extrabold text-zts-blue">Go →</span>
    </Link>
  )
}
