import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getVehiclesBySystem } from '@/lib/sheets'
import { divisions, getDivision } from '@/lib/divisions'
import VehicleCard from '@/components/VehicleCard'

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

  const vehicles = await getVehiclesBySystem(division.slug)

  return (
    <>
      <section
        className="starfield px-4 py-14 text-white"
        style={{ background: `linear-gradient(135deg, ${division.accent}, #102A43)` }}
      >
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="text-sm font-bold text-white/80 hover:text-white">← Mission control</Link>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            <span aria-hidden="true">{division.emoji}</span> {division.name}
          </h1>
          <p className="mt-1 text-lg font-bold uppercase tracking-wide text-white/80">{division.tagline}</p>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{division.description}</p>
          <p className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 font-bold">🎯 Mission: {division.mission}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {vehicles.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow">
            <p className="text-5xl" aria-hidden="true">🛰️</p>
            <h2 className="mt-3 text-2xl font-extrabold text-zts-midnight">Zion is still exploring this route</h2>
            <p className="mt-1 text-zts-graphite/80">No vehicles here yet. Check back soon, or try another division!</p>
            <Link href="/" className="mt-5 inline-block rounded-full bg-zts-orange px-6 py-2 font-extrabold text-white">
              Pick another mission
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-2xl font-extrabold text-zts-midnight">
              {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} to discover
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <li key={vehicle.slug}>
                  <VehicleCard vehicle={vehicle} accent={division.accent} emoji={division.emoji} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
