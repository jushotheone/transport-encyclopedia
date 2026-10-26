import Link from 'next/link'
import DivisionGrid from '@/components/DivisionGrid'
import ExplorerPanel from '@/components/ExplorerPanel'

export default function HomePage() {
  return (
    <>
      <section className="starfield relative overflow-hidden bg-zts-midnight px-4 pb-24 pt-16 text-center text-white">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 200"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full opacity-60"
          preserveAspectRatio="none"
        >
          {[
            ['#31A8E0', 'M0 150 C200 40 400 200 800 60'],
            ['#F59E0B', 'M0 170 C250 100 450 180 800 110'],
            ['#D64045', 'M0 120 C200 160 500 40 800 150'],
            ['#24875D', 'M0 185 C300 130 500 190 800 140'],
          ].map(([c, d]) => (
            <path key={c} d={d} fill="none" stroke={c} strokeWidth="3" strokeDasharray="400" className="animate-drift" />
          ))}
        </svg>

        <div className="relative mx-auto max-w-3xl">
          <p className="text-6xl animate-floaty" aria-hidden="true">🌍</p>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl">
            Welcome to <span className="text-zts-orange">Zion Transport System</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
            Close your eyes, take a breath, and step through the <strong>Future Gateway</strong>. A whole network of
            roads, rails, flight paths and ocean routes is waiting. Zion needs a fellow explorer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#divisions" className="rounded-full bg-zts-orange px-8 py-3 text-lg font-extrabold shadow-lg hover:brightness-110">
              🚪 Enter the Gateway
            </a>
            <Link href="/play/missions" className="rounded-full bg-white/15 px-8 py-3 text-lg font-extrabold shadow-lg hover:bg-white/25">
              🗺️ Start a mission
            </Link>
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-12 max-w-6xl space-y-14 px-4 pb-16">
        <ExplorerPanel />

        <section aria-labelledby="alert-heading" className="rounded-3xl border-4 border-dashed border-zts-orange bg-white p-6 shadow">
          <h2 id="alert-heading" className="text-2xl font-extrabold text-zts-midnight">⚠️ Network Alert: Something is breaking the routes</h2>
          <p className="mt-2 text-zts-graphite/90">
            Maps are disagreeing with the real world. Signals are acting strangely. Destinations keep shifting.
            Nobody knows what is causing it. <strong>The Route Breaker</strong> is out there, and every vehicle you learn
            about could be a clue. Can you find out how things really work, so you can spot what is wrong?
          </p>
          <Link href="/play/missions" className="mt-4 inline-block rounded-full bg-zts-orange px-6 py-2 font-extrabold text-white hover:brightness-110">
            Plan a mission and beat the Route Breaker →
          </Link>
        </section>

        <section id="divisions" aria-labelledby="divisions-heading" className="scroll-mt-6">
          <h2 id="divisions-heading" className="text-3xl font-extrabold text-zts-midnight">Choose your mission</h2>
          <p className="mb-6 mt-1 text-zts-graphite/80">Eight divisions, hundreds of discoveries. Where will you start?</p>
          <DivisionGrid />
        </section>

        <section className="rounded-3xl bg-zts-midnight p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold">A future starts with a curious mind 🌟</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/85">
            Zion is growing up to build and lead this network. The more you learn, the more ready you are for the
            future you want to build too.
          </p>
          <Link href="/systems/air" className="mt-5 inline-block rounded-full bg-zts-blue px-6 py-2 font-extrabold hover:brightness-110">
            Not sure where to start? Try the sky ✈️
          </Link>
        </section>
      </div>
    </>
  )
}
