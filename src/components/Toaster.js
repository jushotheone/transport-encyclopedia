'use client'
import { useEffect, useState } from 'react'
import { onToast } from '@/lib/toast'

export default function Toaster() {
  const [items, setItems] = useState([])

  useEffect(
    () =>
      onToast((t) => {
        setItems((list) => [...list.slice(-2), t])
        setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 4200)
      }),
    []
  )

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div key={t.id} className="animate-pop flex max-w-md items-start gap-3 rounded-2xl bg-zts-midnight px-4 py-3 text-white shadow-2xl ring-2 ring-zts-orange">
          <span className="text-2xl" aria-hidden="true">{t.icon}</span>
          <span className="font-bold">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
