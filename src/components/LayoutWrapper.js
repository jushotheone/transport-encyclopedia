import Link from 'next/link'
import { divisions } from '@/lib/divisions'

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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            <span aria-hidden="true" className="text-2xl">🛸</span>
            <span>
              Zion Transport System
              <span className="block text-xs font-semibold text-zts-blue">The Explorer&apos;s Encyclopedia</span>
            </span>
          </Link>
          <nav aria-label="Transport divisions" className="flex flex-wrap gap-1">
            {divisions.map((d) => (
              <Link
                key={d.slug}
                href={`/systems/${d.slug}`}
                title={d.name}
                className="rounded-full px-3 py-1 text-sm font-bold hover:bg-white/15"
              >
                <span aria-hidden="true">{d.emoji}</span>
                <span className="sr-only">{d.name}</span>
              </Link>
            ))}
            <Link href="/play" className="rounded-full bg-zts-orange px-4 py-1 text-sm font-extrabold hover:brightness-110">
              🎮 Play
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">{children}</main>

      <footer className="bg-zts-midnight px-4 py-8 text-center text-sm text-white/80">
        <p className="font-bold text-white">Built by Zion and family 🚀</p>
        <p className="mt-1">Explore how the world moves. Real vehicles are real, and future ideas are labelled.</p>
        <p className="mt-3">
          <Link href="/" className="underline hover:text-white">Back to mission control</Link>
        </p>
      </footer>
    </div>
  )
}
