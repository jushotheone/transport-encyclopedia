import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDivision } from '@/lib/divisions'
import { expeditions } from '@/lib/expeditions'
import Expedition from '@/components/Expedition'
import Icon, { DivisionIcon, Stars } from '@/components/Icon'

export function generateStaticParams() {
  return Object.keys(expeditions).map((division) => ({ division }))
}

export async function generateMetadata({ params }) {
  const d = getDivision((await params).division)
  return d ? { title: `Expedition: ${expeditions[d.slug].place}` } : {}
}

export default async function ExplorePage({ params }) {
  const division = getDivision((await params).division)
  if (!division) notFound()
  const { place } = expeditions[division.slug]
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/systems/${division.slug}`} className="text-sm font-bold text-zts-blue hover:underline">← {division.name} hub</Link>
      <h1 className="mt-2 text-3xl font-extrabold text-zts-midnight"><DivisionIcon slug={division.slug} className="mr-2 h-8 w-8" />Expedition: the {place.toLowerCase()}</h1>
      <p className="mb-5 mt-1 text-zts-graphite/80">Explore the scene and tap the glowing question marks to find hidden discoveries.</p>
      <Expedition division={division} />
    </div>
  )
}
