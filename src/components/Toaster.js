'use client'
import { useEffect, useState } from 'react'
import { onToast } from '@/lib/toast'
import Icon from '@/components/Icon'

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
          <Icon name={t.icon} className="h-6 w-6 text-zts-orange" />
          <span className="font-bold">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
