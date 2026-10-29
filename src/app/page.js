import Link from 'next/link'
import { fetchVehicles } from '@/lib/sheets'
import Gateway from '@/components/Gateway'
import HudBar from '@/components/HudBar'
import NetworkMap from '@/components/NetworkMap'
import DailyPanel from '@/components/DailyPanel'
import Icon from '@/components/Icon'
import InstallPrompt from '@/components/InstallPrompt'
import ZionGuide from '@/components/ZionGuide'

export const revalidate = 300

const tiles = [
  { href: '/play', icon: 'gamepad', title: 'Play', text: 'Puzzles, missions and mystery vehicles', colour: '#D64045' },
  { href: '/cards', icon: 'layers', title: 'My Cards', text: 'Collect shiny vehicle cards', colour: '#4246A3' },
  { href: '/studio', icon: 'hammer', title: 'Design Studio', text: 'Invent your own vehicle', colour: '#24875D' },
  { href: '/passport', icon: 'medal', title: 'Passport', text: 'Badges, streaks and what you learned', colour: '#E97828' },
]

export default async function HomePage() {
  const vehicles = await fetchVehicles()
  return (
    <>
      <Gateway />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold text-zts-midnight sm:text-5xl">
            The network is <span className="text-red-600">breaking</span>.
          </h1>
          <p className="mt-2 text-lg text-zts-graphite/80">
            The Route Breaker has damaged every route. Tap a hub, repair its route and find out why.
          </p>
        </header>

        <ZionGuide />
        <HudBar totalCards={vehicles.length} />
        <NetworkMap />
        <InstallPrompt />
        <DailyPanel vehicleSlugs={vehicles.map((v) => v.slug)} />

        <ul className="grid grid-cols-2 gap-4">
          {tiles.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="flex h-full flex-col rounded-3xl p-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-2xl" style={{ background: `linear-gradient(145deg, ${t.colour}, #102A43)` }}>
                <Icon name={t.icon} className="h-10 w-10" />
                <span className="mt-1 text-xl font-extrabold">{t.title}</span>
                <span className="text-sm text-white/85">{t.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
