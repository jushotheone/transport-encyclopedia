import Link from 'next/link'
import SoundToggle from '@/components/SoundToggle'
import StreakChip from '@/components/StreakChip'
import Toaster from '@/components/Toaster'
import DailyCheckIn from '@/components/DailyCheckIn'
import Music from '@/components/Music'
import Icon from '@/components/Icon'
import Logo from '@/components/Logo'

const links = [
  { href: '/', label: 'Map', icon: 'map' },
  { href: '/play', label: 'Play', icon: 'gamepad' },
  { href: '/cards', label: 'Cards', icon: 'layers' },
  { href: '/studio', label: 'Studio', icon: 'hammer' },
  { href: '/passport', label: 'Passport', icon: 'medal' },
]

export default function LayoutWrapper({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="bg-zts-midnight text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-extrabold">
            <Logo className="h-10 w-10" />
            <span className="leading-tight">
              Zion Transport System
              <span className="block text-xs font-semibold text-zts-blue">Explorer&apos;s Encyclopedia</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <StreakChip />
            <SoundToggle />
          </div>
        </div>
        <nav aria-label="Main" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold hover:bg-white/15">
              <Icon name={l.icon} className="h-4 w-4" />{l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main" className="flex-1">{children}</main>
      <Toaster />
      <DailyCheckIn />
      <Music />

      <footer className="bg-zts-midnight px-4 py-8 text-center text-sm text-white/80">
        <p className="font-bold text-white">Built by Zion and family</p>
        <p className="mt-1">Explore how the world moves. Real vehicles are real, and future ideas are labelled.</p>
        <p className="mt-1 text-xs text-white/50">Your progress is saved only on this device.</p>
        <p className="mt-3"><Link href="/creator" className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white hover:bg-white/20"><Icon name="hammer" className="mr-1.5 h-4 w-4" />For Zion: Creator Hub</Link></p>
      </footer>
    </div>
  )
}
