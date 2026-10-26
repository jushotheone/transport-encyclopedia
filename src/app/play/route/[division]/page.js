import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDivision } from '@/lib/divisions'
import RouteBuilder from '@/components/RouteBuilder'

export async function generateMetadata({ params }) {
  const d = getDivision((await params).division)
  return d ? { title: `Route Builder: ${d.name}` } : {}
}

export default async function RoutePage({ params }) {
  const division = getDivision((await params).division)
  if (!division) notFound()
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/systems/${division.slug}`} className="text-sm font-bold text-zts-blue hover:underline">← {division.name} hub</Link>
      <h1 className="mt-2 text-3xl font-extrabold text-zts-midnight">{division.emoji} Route Builder: {division.name.replace(' Transport', '')}</h1>
      <p className="mb-5 mt-1 text-zts-graphite/80">Turn the tiles to connect the start to the goal. Watch out, the Route Breaker will try to wreck your route!</p>
      <RouteBuilder division={division} />
    </div>
  )
}
