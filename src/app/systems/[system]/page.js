import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getVehiclesBySystem } from '@/lib/sheets'
import { divisions, getDivision } from '@/lib/divisions'
import CardGrid from '@/components/CardGrid'
import RouteLadder from '@/components/RouteLadder'
import ExpeditionLink from '@/components/ExpeditionLink'

export const revalidate = 300

export function generateStaticParams() {
  return divisions.map((d) => ({ system: d.slug }))
}

export async function generateMetadata({ params }) {
  const division = getDivision((await params).system)
  if (!division) return {}
  return { title: division.name, description: division.description }
}

export default async function SystemPage({ params }) {
  const { system } = await params
  const division = getDivision(system)
  if (!division) notFound()

  const vehicles = (await getVehiclesBySystem(division.slug)).map(
    ({ name, slug, system, image, origin_country, flag_emoji, funFact, description }) => ({ name, slug, system, image, origin_country, flag_emoji, funFact, description })
  )

  return (
    <>
      <section className="starfield px-4 py-12 text-white" style={{ background: `linear-gradient(135deg, ${division.accent}, #102A43)` }}>
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm font-bold text-white/80 hover:text-white">← Network map</Link>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl"><span aria-hidden="true">{division.emoji}</span> {division.name}</h1>
          <p className="mt-1 text-lg font-bold uppercase tracking-wide text-white/80">{division.tagline}</p>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{division.description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <RouteLadder division={division} />
        <ExpeditionLink division={division} />
        <section aria-labelledby="binder-h">
          <h2 id="binder-h" className="mb-1 text-2xl font-extrabold text-zts-midnight">🃏 {division.name.replace(' Transport', '')} cards</h2>
          <p className="mb-4 text-zts-graphite/80">Tap a locked card to open its mission deck and collect it.</p>
          <CardGrid vehicles={vehicles} />
        </section>
      </div>
    </>
  )
}
