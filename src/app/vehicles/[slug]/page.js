import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchVehicles } from '@/lib/sheets'
import { getDivision } from '@/lib/divisions'
import { extractYouTubeID, safeUrl } from '@/lib/utils'
import VehicleCard from '@/components/VehicleCard'
import Quiz from '@/components/Quiz'
import ReadAloud from '@/components/ReadAloud'
import SoundButton from '@/components/SoundButton'
import ExplorerTracker from '@/components/ExplorerTracker'

export const revalidate = 300

async function findVehicle(slug) {
  const vehicles = await fetchVehicles()
  const vehicle = vehicles.find((v) => v.slug.toLowerCase() === slug.toLowerCase())
  return { vehicles, vehicle }
}

export async function generateMetadata({ params }) {
  const { vehicle } = await findVehicle((await params).slug)
  if (!vehicle) return {}
  return { title: vehicle.name, description: vehicle.description.slice(0, 160) }
}

function FactBox({ title, children, className }) {
  return (
    <section className={`rounded-3xl p-6 shadow ${className}`}>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-2 text-lg">{children}</div>
    </section>
  )
}

export default async function VehiclePage({ params }) {
  const { slug } = await params
  const { vehicles, vehicle } = await findVehicle(slug)
  if (!vehicle) notFound()

  const division = getDivision(vehicle.system) || { name: vehicle.system, slug: '', emoji: '🚦', accent: '#1D9BF0', mission: '' }
  const images = [vehicle.image, ...vehicle.more_images].map(safeUrl).filter(Boolean)
  const youtubeId = extractYouTubeID(vehicle.video_url)
  const links = vehicle.learn_more.split(',').map(safeUrl).filter(Boolean)
  const related = vehicles.filter((v) => v.system === vehicle.system && v.slug !== vehicle.slug).slice(0, 3)
  const readText = [vehicle.name + '.', vehicle.description, vehicle.funFact && 'Fun fact. ' + vehicle.funFact, vehicle.bonus_fact && 'Did you know? ' + vehicle.bonus_fact]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <ExplorerTracker slug={vehicle.slug} />
      <header
        className="starfield px-4 py-10 text-white"
        style={{ background: `linear-gradient(135deg, ${division.accent}, #102A43)` }}
      >
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm font-bold text-white/80">
            <Link href="/" className="hover:text-white">Mission control</Link>
            {division.slug && (
              <>
                {' / '}
                <Link href={`/systems/${division.slug}`} className="hover:text-white">{division.name}</Link>
              </>
            )}
          </nav>
          <p className="mt-4 text-sm font-extrabold uppercase tracking-widest text-white/80">Mission file</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            <span aria-hidden="true">{division.emoji}</span> {vehicle.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <ReadAloud text={readText} />
            {safeUrl(vehicle.custom_sound_url) && <SoundButton src={safeUrl(vehicle.custom_sound_url)} label={vehicle.name} />}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
        {images.length > 0 ? (
          <section aria-label={`Pictures of ${vehicle.name}`} className="grid gap-4 sm:grid-cols-2">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${vehicle.name}, picture ${i + 1}`}
                className={`w-full rounded-3xl object-cover shadow-lg ${i === 0 && images.length % 2 === 1 ? 'h-80 sm:col-span-2' : 'h-60'}`}
              />
            ))}
          </section>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-3xl bg-white text-center text-zts-graphite/70 shadow">
            📸 Zion is still hunting for the perfect photo of this one!
          </div>
        )}

        <section aria-labelledby="explains" className="rounded-3xl border-l-8 bg-white p-6 shadow" style={{ borderColor: division.accent }}>
          <h2 id="explains" className="text-xl font-extrabold text-zts-midnight">🗣️ Zion explains</h2>
          {vehicle.description ? (
            <p className="mt-2 text-lg leading-relaxed">{vehicle.description}</p>
          ) : (
            <p className="mt-2 text-zts-graphite/70">Zion hasn&apos;t written this part yet. Stay tuned!</p>
          )}
          {vehicle.zions_note && <p className="mt-3 font-bold italic" style={{ color: division.accent }}>Zion says: &ldquo;{vehicle.zions_note}&rdquo;</p>}
        </section>

        {vehicle.funFact && (
          <FactBox title="🎉 Fun fact!" className="bg-yellow-100 text-yellow-900">{vehicle.funFact}</FactBox>
        )}

        {youtubeId && (
          <section aria-labelledby="watch">
            <h2 id="watch" className="mb-2 text-xl font-extrabold text-zts-midnight">📹 Watch it in action</h2>
            <div className="aspect-video overflow-hidden rounded-3xl shadow-lg">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title={`Video: ${vehicle.name}`}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </section>
        )}

        <Quiz
          slug={vehicle.slug}
          question={vehicle.quiz_question}
          choices={vehicle.quiz_choices}
          answer={vehicle.quiz_answer}
          accent={division.accent}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {vehicle.origin_country && (
            <FactBox title="📍 Where is it from?" className="bg-white">
              <span className="mr-2 text-3xl">{vehicle.flag_emoji || '🌍'}</span>
              {vehicle.origin_country}
            </FactBox>
          )}
          {vehicle.manufacturers.length > 0 && (
            <FactBox title="🏭 Who builds it?" className="bg-white">
              <ul className="list-disc pl-5">
                {vehicle.manufacturers.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </FactBox>
          )}
        </div>

        {vehicle.bonus_fact && (
          <FactBox title="🧠 Did you know?" className="bg-blue-100 text-blue-900">{vehicle.bonus_fact}</FactBox>
        )}

        {vehicle.zions_recommendation && (
          <FactBox title="💬 Zion recommends…" className="bg-zts-midnight text-white">{vehicle.zions_recommendation}</FactBox>
        )}

        {links.length > 0 && (
          <section aria-labelledby="more">
            <h2 id="more" className="text-xl font-extrabold text-zts-midnight">📚 Want to learn more?</h2>
            <p className="text-sm text-zts-graphite/70">These open other websites. Ask a grown-up if you are not sure.</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {links.map((href) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="break-all font-bold text-zts-blue underline">
                    {new URL(href).hostname.replace(/^www\./, '')}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="next">
            <h2 id="next" className="mb-4 text-2xl font-extrabold text-zts-midnight">Next on your mission</h2>
            <ul className="grid gap-6 sm:grid-cols-3">
              {related.map((v) => (
                <li key={v.slug}>
                  <VehicleCard vehicle={v} accent={division.accent} emoji={division.emoji} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  )
}
