'use client'
import Link from 'next/link'
import { divisions } from '@/lib/divisions'
import { fieldMissionFor } from '@/lib/story'
import {
  DAILY_FLAGS, claimDailyChest, completeFieldMission, dailyFlags, dayKey, levelsCleared, useExplorer,
} from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'

export default function DailyPanel({ vehicleSlugs = [] }) {
  const s = useExplorer()
  const flags = dailyFlags(s)
  const field = fieldMissionFor(dayKey())
  const allDone = DAILY_FLAGS.every((f) => flags.includes(f))
  const claimed = s.daily.day === dayKey() && s.daily.claimed

  const nextRoute = [...divisions].sort((a, b) => levelsCleared(s, a.slug) - levelsCleared(s, b.slug)).find((d) => levelsCleared(s, d.slug) < 3)
  const nextCard = vehicleSlugs.find((slug) => !s.cards.includes(slug))

  const tasks = [
    { flag: 'puzzle', emoji: '🧩', text: 'Repair part of a route', href: nextRoute ? `/play/route/${nextRoute.slug}` : '/control-room' },
    { flag: 'card', emoji: '🃏', text: 'Discover a new vehicle card', href: nextCard ? `/vehicles/${nextCard}` : '/cards' },
    { flag: 'play', emoji: '🎮', text: 'Win a quiz or game', href: '/play' },
  ]

  function doField() {
    if (completeFieldMission()) {
      play('good')
      confetti({ count: 60 })
      toast('Field mission complete! +5 XP. The best exploring happens in the real world.', '🔭')
    }
  }

  function openChest() {
    if (claimDailyChest()) {
      play('win')
      confetti({ count: 200 })
      toast('Daily chest opened! +25 XP', '🎁')
    }
  }

  const done = flags.length
  return (
    <section aria-labelledby="daily-h" className="rounded-3xl bg-white p-5 shadow-lg ring-1 ring-zts-midnight/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="daily-h" className="text-xl font-extrabold text-zts-midnight">📅 Today&apos;s Missions</h2>
          <p className="text-sm text-zts-graphite/70">About 5 minutes. Finish all four to open the daily chest.</p>
        </div>
        <p className="rounded-full bg-orange-100 px-3 py-1 text-sm font-extrabold text-orange-700">
          🔥 {s.streak} day{s.streak === 1 ? '' : 's'} {s.freezes > 0 && <span title="Streak freezes protect you if you miss a day">· ❄️×{s.freezes}</span>}
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {tasks.map((t) => {
          const ok = flags.includes(t.flag)
          return (
            <li key={t.flag}>
              <Link
                href={t.href}
                className={`flex items-center gap-3 rounded-2xl p-3 font-bold transition ${ok ? 'bg-green-50 text-green-800' : 'bg-slate-50 text-zts-midnight hover:bg-sky-50'}`}
              >
                <span className="text-2xl" aria-hidden="true">{ok ? '✅' : t.emoji}</span>
                <span className="flex-1">{t.text}</span>
                {!ok && <span className="text-zts-blue">Go →</span>}
              </Link>
            </li>
          )
        })}
        <li className={`rounded-2xl p-3 ${flags.includes('field') ? 'bg-green-50' : 'bg-amber-50'}`}>
          <p className="flex items-center gap-3 font-bold text-zts-midnight">
            <span className="text-2xl" aria-hidden="true">{flags.includes('field') ? '✅' : field.emoji}</span>
            <span>Field mission: {field.title}</span>
          </p>
          <p className="mt-1 pl-10 text-sm text-zts-graphite/80">{field.text}</p>
          {!flags.includes('field') && (
            <button type="button" onClick={doField} className="ml-10 mt-2 rounded-full bg-zts-orange px-4 py-1.5 text-sm font-extrabold text-white hover:brightness-110">
              I did it! ✔
            </button>
          )}
        </li>
      </ul>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zts-midnight p-3 text-white">
        <span className={`text-4xl ${allDone && !claimed ? 'animate-floaty' : 'opacity-60'}`} aria-hidden="true">{claimed ? '📭' : '🎁'}</span>
        <p className="flex-1 font-bold">
          {claimed ? 'Chest opened. Come back tomorrow for a new one!' : allDone ? 'Your chest is ready!' : `Daily chest: ${done}/${DAILY_FLAGS.length} missions done`}
        </p>
        {allDone && !claimed && (
          <button type="button" onClick={openChest} className="rounded-full bg-zts-orange px-4 py-2 font-extrabold hover:brightness-110">
            Open!
          </button>
        )}
      </div>
    </section>
  )
}
