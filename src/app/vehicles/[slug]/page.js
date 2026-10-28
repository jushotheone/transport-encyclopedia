import Link from 'next/link'
import { notFound } from 'next/navigation'
import { fetchVehicles } from '@/lib/sheets'
import { getDivision } from '@/lib/divisions'
import { extractYouTubeID, quizProblem, safeUrl } from '@/lib/utils'
import Deck from '@/components/Deck'
import ExplorerTracker from '@/components/ExplorerTracker'
import Icon from '@/components/Icon'

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

// Break long paragraphs into short cards of at most two sentences.
function chunk(text, maxLen = 170) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const out = []
  for (const s of sentences) {
    const prev = out[out.length - 1]
    if (prev && prev.length + s.length < maxLen) out[out.length - 1] = `${prev} ${s}`
    else out.push(s)
  }
  return out
}

function buildCards(vehicle, division, related, images, youtubeId) {
  const cards = [
    {
      type: 'cover',
      slug: vehicle.system,
      name: vehicle.name,
      image: images[0] || null,
      division: division.name,
    },
  ]

  chunk(vehicle.description).forEach((body, n, all) =>
    cards.push({
      type: 'text',
      icon: 'megaphone',
      title: all.length > 1 ? `Zion explains (${n + 1}/${all.length})` : 'Zion explains',
      body,
      note: n === all.length - 1 && vehicle.zions_note ? `Zion says: "${vehicle.zions_note}"` : null,
    })
  )

  if (youtubeId) cards.push({ type: 'video', id: youtubeId, title: `Video: ${vehicle.name}` })
  images.slice(1).forEach((src, n) => cards.push({ type: 'image', src, alt: `${vehicle.name}, picture ${n + 2}` }))

  if (vehicle.funFact) cards.push({ type: 'reveal', icon: 'sparkles', title: 'Fun fact', body: vehicle.funFact })
  if (vehicle.origin_country)
    cards.push({ type: 'reveal', icon: 'globe', flag: vehicle.flag_emoji, title: 'Where is it from?', body: vehicle.origin_country })
  if (vehicle.manufacturers.length)
    cards.push({ type: 'reveal', icon: 'factory', title: 'Who builds it?', body: vehicle.manufacturers.join(', ') })
  if (vehicle.bonus_fact) cards.push({ type: 'reveal', icon: 'brain', title: 'Did you know?', body: vehicle.bonus_fact })

  if (vehicle.quiz_question && !quizProblem(vehicle.quiz_question, vehicle.quiz_choices, vehicle.quiz_answer))
    cards.push({ type: 'quiz', question: vehicle.quiz_question, choices: vehicle.quiz_choices, answer: vehicle.quiz_answer })

  if (vehicle.zions_recommendation)
    cards.push({ type: 'fact', tone: 'dark', icon: 'chat', title: 'Zion recommends', body: vehicle.zions_recommendation })

  cards.push({ type: 'final', related: related.map(({ name, slug }) => ({ name, slug })) })
  return cards
}

export default async function VehiclePage({ params }) {
  const { slug } = await params
  const { vehicles, vehicle } = await findVehicle(slug)
  if (!vehicle) notFound()

  const division = getDivision(vehicle.system) || { name: vehicle.system, slug: '', accent: '#1D9BF0' }
  const images = [vehicle.image, ...vehicle.more_images].map(safeUrl).filter(Boolean)
  const related = vehicles.filter((v) => v.system === vehicle.system && v.slug !== vehicle.slug).slice(0, 2)
  const links = vehicle.learn_more.split(',').map(safeUrl).filter(Boolean)
  const cards = buildCards(vehicle, division, related, images, extractYouTubeID(vehicle.video_url))

  return (
    <>
      <ExplorerTracker slug={vehicle.slug} />
      <div
        className="starfield px-4 pb-24 pt-8 text-white"
        style={{ background: `linear-gradient(135deg, ${division.accent}, #102A43)` }}
      >
        <nav aria-label="Breadcrumb" className="mx-auto max-w-2xl text-sm font-bold text-white/80">
          <Link href="/" className="hover:text-white">Mission control</Link>
          {division.slug && (
            <>
              {' / '}
              <Link href={`/systems/${division.slug}`} className="hover:text-white">{division.name}</Link>
            </>
          )}
        </nav>
      </div>

      <div className="mx-auto -mt-16 max-w-2xl px-4 pb-12">
        <Deck
          cards={cards}
          accent={division.accent}
          slug={vehicle.slug}
          name={vehicle.name}
          vehicle={{ slug: vehicle.slug, name: vehicle.name, system: vehicle.system, image: vehicle.image, origin_country: vehicle.origin_country, flag_emoji: vehicle.flag_emoji, funFact: vehicle.funFact, description: vehicle.description }}
          soundUrl={safeUrl(vehicle.custom_sound_url)}
        />

        {links.length > 0 && (
          <details className="mt-8 rounded-2xl bg-white p-4 shadow">
            <summary className="cursor-pointer font-extrabold text-zts-midnight"><Icon name="users" className="mr-2 h-5 w-5" />Grown-ups corner: learn more</summary>
            <p className="mt-2 text-sm text-zts-graphite/70">These links open other websites.</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {links.map((href) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="break-all font-bold text-zts-blue underline">
                    {new URL(href).hostname.replace(/^www\./, '')}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </>
  )
}
