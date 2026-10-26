'use client'
import Link from 'next/link'
import Garage from '@/components/Garage'
import { AVATARS, badgesOf, rankFor, ranks, replayIntro, setProfile, streakMilestones, useExplorer, xpOf } from '@/lib/explorer'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import { Avatar } from '@/components/Icon'

export default function PassportView() {
  const s = useExplorer()
  const router = useRouter()
  const xp = xpOf(s)
  const rank = rankFor(xp)
  const badges = badgesOf(s)
  const earned = badges.filter((b) => b.got).length
  const nextMilestone = streakMilestones.find((m) => m > s.streak)

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-zts-midnight to-slate-900 p-6 text-center text-white shadow-xl">
        <p className="flex justify-center" aria-hidden="true"><Avatar name={s.profile.avatar} className="h-20 w-20" iconClass="h-10 w-10" /></p>
        <label className="sr-only" htmlFor="pname">Your explorer name</label>
        <input
          id="pname"
          value={s.profile.name}
          onChange={(e) => setProfile({ name: e.target.value.slice(0, 14) })}
          placeholder="Your explorer name"
          className="mt-1 w-full max-w-xs rounded-xl bg-white/10 px-3 py-1 text-center text-2xl font-extrabold outline-none placeholder:text-white/30 focus:bg-white/20"
        />
        <div className="mt-2 flex flex-wrap justify-center gap-1" role="radiogroup" aria-label="Choose your explorer">
          {AVATARS.map((a) => (
            <button key={a} type="button" role="radio" aria-checked={s.profile.avatar === a} aria-label={`Explorer ${a}`} onClick={() => setProfile({ avatar: a })} className={`rounded-full p-0.5 ${s.profile.avatar === a ? 'ring-4 ring-white' : 'opacity-70 hover:opacity-100'}`}><Avatar name={a} className="h-10 w-10" /></button>
          ))}
        </div>
        <h2 className="mt-3 text-2xl font-extrabold"><Icon name={rank.icon} className="mr-2 h-7 w-7 text-zts-orange" />{rank.title}</h2>
        <p className="text-white/70">{xp} XP</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="All ranks">
          {ranks.map((r) => (
            <li key={r.title} className={`rounded-full px-3 py-1 text-sm font-bold ${xp >= r.min ? 'bg-zts-orange text-white' : 'bg-white/10 text-white/50'}`}>
              <Icon name={r.icon} className="mr-1 h-4 w-4" />{r.title}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="streak-h" className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-zts-midnight/10">
        <h2 id="streak-h" className="text-2xl font-extrabold text-zts-midnight"><Icon name="flame" className="mr-2 h-6 w-6 text-orange-500" />Your streak</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <p className="rounded-2xl bg-orange-50 p-3 text-3xl font-extrabold text-orange-600">{s.streak}<span className="block text-xs font-bold text-zts-graphite/60">days now</span></p>
          <p className="rounded-2xl bg-amber-50 p-3 text-3xl font-extrabold text-amber-600">{s.bestStreak}<span className="block text-xs font-bold text-zts-graphite/60">best ever</span></p>
          <p className="rounded-2xl bg-sky-50 p-3 text-3xl font-extrabold text-sky-600"><Icon name="snowflake" className="mr-1 h-6 w-6" />{s.freezes}<span className="block text-xs font-bold text-zts-graphite/60">freezes</span></p>
        </div>
        <p className="mt-3 text-sm text-zts-graphite/80">
          {nextMilestone ? `${nextMilestone - s.streak} more day${nextMilestone - s.streak === 1 ? '' : 's'} to reach a ${nextMilestone}-day streak.` : 'You have passed every streak milestone. Legend!'}{' '}
          Every 7 days you earn a streak freeze that protects you if you miss a day.
        </p>
      </section>

      <section aria-labelledby="badges-h">
        <h2 id="badges-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="medal" className="mr-2 h-6 w-6 text-zts-orange" />Badges <span className="text-base font-bold text-zts-graphite/60">{earned}/{badges.length}</span></h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {badges.map((b) => (
            <li key={b.id} className={`rounded-2xl p-3 text-center shadow ${b.got ? 'bg-white ring-2 ring-zts-orange' : 'bg-slate-100 text-slate-400'}`}>
              <p className={`flex justify-center ${b.got ? 'text-zts-orange' : 'text-slate-300'}`} aria-hidden="true"><Icon name={b.icon} className="h-10 w-10" /></p>
              <p className="font-extrabold">{b.name}</p>
              <p className="text-xs">{b.got ? 'Earned!' : b.how}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learned-h" className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-zts-midnight/10">
        <h2 id="learned-h" className="text-2xl font-extrabold text-zts-midnight"><Icon name="lightbulb" className="mr-2 h-6 w-6 text-yellow-500" />Things I have learned <span className="text-base font-bold text-zts-graphite/60">({s.learned.length})</span></h2>
        {s.learned.length === 0 ? (
          <p className="mt-2 text-zts-graphite/70">Nothing yet. Play a route puzzle or finish a vehicle deck and it will appear here!</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...s.learned].reverse().map((l) => (
              <li key={l.id} className="rounded-2xl bg-sky-50 p-3 font-bold text-zts-midnight"><Icon name="lightbulb" className="mr-2 h-4 w-4 text-yellow-500" />{l.text}</li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="garage-h">
        <h2 id="garage-h" className="mb-3 text-2xl font-extrabold text-zts-midnight"><Icon name="hammer" className="mr-2 h-6 w-6 text-green-700" />My garage</h2>
        <Garage />
        <Link href="/studio" className="mt-3 inline-block rounded-full bg-zts-orange px-5 py-2 font-extrabold text-white">Design another →</Link>
      </section>

      <button
        type="button"
        onClick={() => {
          replayIntro()
          router.push('/')
        }}
        className="rounded-full bg-zts-midnight px-5 py-2 font-extrabold text-white hover:bg-zts-blue"
      >
        <Icon name="sparkles" className="mr-2 h-5 w-5" />Replay the Future Gateway
      </button>
    </div>
  )
}
