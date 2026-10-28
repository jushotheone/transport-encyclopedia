'use client'
import { useEffect, useState } from 'react'
import { checkIn, useExplorer } from '@/lib/explorer'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import Icon from '@/components/Icon'

export default function DailyCheckIn() {
  const [reward, setReward] = useState(null)
  const { profile } = useExplorer()

  useEffect(() => {
    const r = checkIn()
    if (r) {
      setReward(r)
      play('good')
      if (r.milestone || r.earnedFreeze) setTimeout(() => confetti({ count: 100 }), 300)
    }
  }, [])

  if (!reward) return null
  const { streak, xp, freezeUsed, earnedFreeze, lost, milestone } = reward

  return (
    <div role="dialog" aria-modal="true" aria-label="Daily reward" className="fixed inset-x-0 top-0 z-[70] flex overflow-y-auto bg-black/70 p-4" style={{ height: '100dvh' }}>
      <div className="animate-pop m-auto w-full max-w-sm rounded-3xl bg-gradient-to-b from-zts-midnight to-slate-900 p-8 text-center text-white shadow-2xl ring-4 ring-zts-orange">
        <p className="animate-floaty flex justify-center text-orange-400" aria-hidden="true"><Icon name="flame" className="h-20 w-20" fill="currentColor" /></p>
        <h2 className="mt-2 text-3xl font-extrabold">
          {streak === 1 ? (lost ? 'Fresh start!' : `Welcome, ${profile.name || 'explorer'}!`) : `Day ${streak} streak, ${profile.name || 'explorer'}!`}
        </h2>
        <p className="mt-2 text-lg text-white/85">
          {streak === 1
            ? lost
              ? `Your ${lost}-day streak took a break, and that is okay. Every explorer starts again, so let's go!`
              : 'Come back every day to grow your streak and earn rewards.'
            : milestone
              ? 'A streak milestone! You are building a real habit.'
              : 'You came back. That is how explorers get great!'}
        </p>
        <p className="mt-4 rounded-2xl bg-white/10 py-3 text-xl font-extrabold text-zts-orange">+{xp} bonus XP</p>
        {freezeUsed && <p className="mt-3 text-sm font-bold text-sky-300"><Icon name="snowflake" className="mr-1 h-4 w-4" />A streak freeze saved your streak yesterday!</p>}
        {earnedFreeze && <p className="mt-3 text-sm font-bold text-sky-300"><Icon name="snowflake" className="mr-1 h-4 w-4" />You earned a streak freeze. It protects you if you miss a day.</p>}
        <button
          type="button"
          onClick={() => setReward(null)}
          autoFocus
          className="mt-6 w-full rounded-full bg-zts-orange py-3 text-lg font-extrabold hover:brightness-110"
        >
          Let&apos;s explore
        </button>
      </div>
    </div>
  )
}
