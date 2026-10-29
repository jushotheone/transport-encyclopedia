import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDivision } from '@/lib/divisions'
import { expeditions } from '@/lib/expeditions'
import Expedition from '@/components/Expedition'
import ExpeditionHunt from '@/components/ExpeditionHunt'
import { hunts } from '@/lib/hunts'
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
    <div className="mx-auto max-w-2xl px-4 py-3 sm:py-8">
      <Link href={`/systems/${division.slug}`} className="text-sm font-bold text-zts-blue hover:underline">← {division.name} hub</Link>
      <h1 className="mt-1 text-2xl font-extrabold text-zts-midnight sm:mt-2 sm:text-3xl"><DivisionIcon slug={division.slug} className="mr-2 h-8 w-8" />Expedition: the {place.toLowerCase()}</h1>
      {hunts[division.slug] ? (
        <div className="mt-2 sm:mt-3"><ExpeditionHunt division={division} /></div>
      ) : (
        <>
          <p className="mb-5 mt-1 text-zts-graphite/80">Explore the scene and tap the glowing question marks to find hidden discoveries.</p>
          <Expedition division={division} />
        </>
      )}
    </div>
  )
}
