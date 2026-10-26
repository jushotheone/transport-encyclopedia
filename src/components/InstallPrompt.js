'use client'
import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'

const KEY = 'zts-install-dismissed'

// Offers "Add to Home Screen". A home-screen icon is the easiest way to keep a daily streak going.
export default function InstallPrompt() {
  const [evt, setEvt] = useState(null)
  const [ios, setIos] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {})
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
    let dismissed = false
    try {
      dismissed = !!localStorage.getItem(KEY)
    } catch {
      // storage blocked: just show it
    }
    if (standalone || dismissed) return
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIos(isIos)
    setHidden(!isIos)
    const onPrompt = (e) => {
      e.preventDefault()
      setEvt(e)
      setHidden(false)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (hidden) return null

  const dismiss = () => {
    setHidden(true)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // ignore
    }
  }

  return (
    <section aria-label="Install the app" className="flex items-center gap-3 rounded-3xl bg-zts-blue p-4 text-white shadow-lg">
      <Icon name="phone" className="h-9 w-9 shrink-0" />
      <p className="flex-1 text-sm font-bold">
        {ios ? 'Keep your streak going: tap the Share button, then "Add to Home Screen".' : 'Put the explorer on your home screen so your streak is one tap away every day.'}
      </p>
      {evt && (
        <button type="button" onClick={async () => { evt.prompt(); await evt.userChoice; dismiss() }} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-zts-midnight">
          Add
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="rounded-full bg-white/20 p-2"><Icon name="close" className="h-4 w-4" /></button>
    </section>
  )
}
