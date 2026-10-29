import Link from 'next/link'
import CreatorTools from '@/components/CreatorTools'
import Icon, { DivisionIcon } from '@/components/Icon'
import { dailyQuestions } from '@/lib/challenges'
import { divisions } from '@/lib/divisions'
import { auditVehicles, completeness, creatorBadges } from '@/lib/health'
import { fetchChallenges, fetchVehicles } from '@/lib/sheets'
import { ZionAvatar, ZionSays } from '@/components/Zion'
import CreatorLogin from '@/components/CreatorLogin'
import { isCreatorAuthed, pinRequired } from '@/lib/creatorAuth'
import { lock } from '@/app/creator/actions'

// Always rendered fresh on the server, so the PIN is checked on every visit, never baked in at build time.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Creator Hub',
  description: 'Build entries, check the sheet and see what your work becomes in the game.',
  robots: { index: false, follow: false },
}

// The next seven Daily Challenges, so Zion can see how much of the game is his own work.
function impact(vehicles, challenges) {
  let total = 0
  let yours = 0
  const base = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getTime() + i * 86400000).toLocaleDateString('en-CA')
    const qs = dailyQuestions(vehicles, challenges, d)
    total += qs.length
    yours += qs.filter((q) => q.source === 'zion').length
  }
  return { total, yours }
}

export default async function CreatorPage({ searchParams }) {
  if (!(await isCreatorAuthed())) return <CreatorLogin wrong={Boolean((await searchParams)?.wrong)} />
  const [vehicles, challenges] = await Promise.all([fetchVehicles(), fetchChallenges()])
  const issues = auditVehicles(vehicles)
  const errors = issues.filter((i) => i.level === 'error')
  const tips = issues.filter((i) => i.level === 'tip')
  const badges = creatorBadges(vehicles, challenges)
  const { total, yours } = impact(vehicles, challenges)
  const sheetUrl = process.env.CREATOR_SHEET_URL
  const ranked = vehicles.map((v) => ({ v, c: completeness(v) })).sort((a, b) => a.c.pct - b.c.pct)
  const biggestWin = ranked[0] && ranked[0].c.items.find((i) => !i.done)
  const slim = vehicles.map(({ name, slug }) => ({ name, slug }))

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header>
        <div className="flex items-center gap-4">
          <ZionAvatar className="h-20 w-20" priority />
          <h1 className="text-4xl font-extrabold text-zts-midnight">Zion&apos;s Creator Hub</h1>
        </div>
        <p className="mt-3 text-lg text-zts-graphite/80">Everything you add to the sheet becomes part of the game. Here you can see what your work turns into, check it for mistakes, and build new entries.</p>
        {pinRequired() && (
          <form action={lock} className="mt-3 inline">
            <button type="submit" className="mr-2 inline-flex items-center rounded-full bg-slate-200 px-4 py-2 text-sm font-extrabold text-zts-midnight hover:bg-slate-300"><Icon name="lock" className="mr-1.5 h-4 w-4" />Lock the hub</button>
          </form>
        )}
        {sheetUrl && <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center rounded-full bg-green-600 px-5 py-2 font-extrabold text-white hover:brightness-110"><Icon name="share" className="mr-2 h-4 w-4" />Open my spreadsheet</a>}
      </header>

      <section aria-labelledby="impact-h" className="rounded-3xl bg-zts-midnight p-6 text-white shadow-xl">
        <h2 id="impact-h" className="text-2xl font-extrabold">Your work in the game</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <li className="rounded-2xl bg-white/10 p-3"><span className="block text-4xl font-extrabold text-zts-orange">{vehicles.length}</span>vehicles</li>
          <li className="rounded-2xl bg-white/10 p-3"><span className="block text-4xl font-extrabold text-zts-orange">{vehicles.filter((v) => completeness(v).items.find((i) => i.key === 'quiz').done).length}</span>working quizzes</li>
          <li className="rounded-2xl bg-white/10 p-3"><span className="block text-4xl font-extrabold text-zts-orange">{challenges.length}</span>questions you wrote</li>
          <li className="rounded-2xl bg-white/10 p-3"><span className="block text-4xl font-extrabold text-zts-orange">{yours}</span>of the next {total} daily questions come from you</li>
        </ul>
        {biggestWin && <p className="mt-4 rounded-2xl bg-white/10 p-3 font-bold"><Icon name="target" className="mr-2 h-5 w-5 text-zts-orange" />Biggest win right now: add <strong>{biggestWin.label.toLowerCase()}</strong> to <strong>{ranked[0].v.name}</strong>. {biggestWin.unlocks}.</p>}
      </section>

      <section aria-labelledby="doctor-h">
        <h2 id="doctor-h" className="text-2xl font-extrabold text-zts-midnight"><Icon name="shield" className="mr-2 h-6 w-6 text-green-700" />Sheet check</h2>
        {issues.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-green-50 p-4 font-bold text-green-800"><Icon name="ok" className="mr-2 h-5 w-5" />Everything in the sheet works. Brilliant!</p>
        ) : (
          <div className="mt-3 space-y-2">
            {errors.length > 0 && <p className="font-bold text-red-700">{errors.length} thing{errors.length === 1 ? '' : 's'} to fix. These will not work in the game yet.</p>}
            <ul className="space-y-2">
              {[...errors, ...tips].map((i, n) => (
                <li key={n} className={`rounded-2xl p-3 ${i.level === 'error' ? 'bg-red-50 text-red-900' : 'bg-amber-50 text-amber-900'}`}>
                  <span className="font-extrabold"><Icon name={i.level === 'error' ? 'alert' : 'lightbulb'} className="mr-1.5 h-5 w-5" />{i.name}</span>
                  <span className="block">{i.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="make-h">
        <h2 id="make-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="sparkles" className="mr-2 h-6 w-6 text-zts-orange" />Make something new</h2>
        <CreatorTools vehicles={slim} />
      </section>

      <section aria-labelledby="files-h">
        <h2 id="files-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="layers" className="mr-2 h-6 w-6 text-zts-blue" />Your vehicle files</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ranked.map(({ v, c }) => {
            const d = divisions.find((x) => x.slug === v.system)
            const next = c.items.filter((i) => !i.done).slice(0, 2)
            return (
              <li key={v.slug} className="rounded-3xl bg-white p-4 shadow ring-1 ring-zts-midnight/10">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/vehicles/${v.slug}`} className="font-extrabold text-zts-midnight hover:underline">{d && <DivisionIcon slug={d.slug} className="mr-1.5 h-5 w-5" style={{ color: d.accent }} />}{v.name}</Link>
                  <span className="text-sm font-extrabold text-zts-blue">{c.pct}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-zts-blue to-zts-orange" style={{ width: `${c.pct}%` }} /></div>
                {next.length > 0 ? (
                  <p className="mt-2 text-sm text-zts-graphite/80">Add next: {next.map((n) => n.label.toLowerCase()).join(', ')}</p>
                ) : (
                  <p className="mt-2 text-sm font-bold text-green-700">Complete!</p>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="creator-badges-h">
        <h2 id="creator-badges-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="medal" className="mr-2 h-6 w-6 text-zts-orange" />Creator badges</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => (
            <li key={b.id} className={`rounded-2xl p-3 text-center shadow ${b.got ? 'bg-white ring-2 ring-zts-orange' : 'bg-slate-100 text-slate-400'}`}>
              <p className={`flex justify-center ${b.got ? 'text-zts-orange' : 'text-slate-300'}`}><Icon name={b.icon} className="h-9 w-9" /></p>
              <p className="font-extrabold">{b.name}</p>
              <p className="text-xs">{b.got ? 'Earned!' : `${b.how} (${b.progress})`}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
