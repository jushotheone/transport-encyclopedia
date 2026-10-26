'use client'
import { useState } from 'react'
import Link from 'next/link'
import ExplorerCard from '@/components/ExplorerCard'
import { rarityOf } from '@/lib/story'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'

// Pack opening: a sealed card appears, the child taps it, and it flips with a flash.
export default function CardReveal({ vehicle, onClose }) {
  const [open, setOpen] = useState(false)
  const rarity = rarityOf(vehicle.slug)

  function reveal() {
    if (open) return
    setOpen(true)
    play('card')
    confetti({ count: rarity.id === 'legendary' ? 260 : rarity.id === 'epic' ? 180 : 100, y: 0.45 })
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="New card unlocked" className="fixed inset-0 z-[75] flex flex-col items-center justify-center gap-4 bg-black/80 p-4 text-center text-white">
      <h2 className="animate-pop text-3xl font-extrabold">{open ? `${rarity.label} card!` : 'New card unlocked!'}</h2>
      {!open ? (
        <button
          type="button"
          onClick={reveal}
          autoFocus
          className="animate-floaty flex aspect-[5/7] w-48 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-zts-blue via-indigo-700 to-zts-orange text-6xl shadow-[0_0_60px_#1D9BF0]"
        >
          <span aria-hidden="true">🃏</span>
          <span className="mt-3 text-lg font-extrabold">Tap to reveal!</span>
        </button>
      ) : (
        <div className="animate-pop w-52">
          <ExplorerCard vehicle={vehicle} flippable />
        </div>
      )}
      {open && (
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-zts-orange px-6 py-3 font-extrabold hover:brightness-110">Add to collection ✓</button>
          <Link href="/cards" className="rounded-full bg-white/15 px-6 py-3 font-extrabold hover:bg-white/25">See all cards</Link>
        </div>
      )}
    </div>
  )
}
