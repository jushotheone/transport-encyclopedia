'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useExplorer } from '@/lib/explorer'
import { startMusic, stopMusic } from '@/lib/sound'

// Starts the ambient soundtrack when the child has switched it on. The mood follows the page.
export default function Music() {
  const { music, muted } = useExplorer()
  const path = usePathname()
  const mood = path.startsWith('/play/route') ? 'puzzle' : 'map'

  useEffect(() => {
    if (!music || muted) {
      stopMusic()
      return
    }
    startMusic(mood)
    // Browsers only allow audio after a tap, so try again on the first one.
    const retry = () => startMusic(mood)
    window.addEventListener('pointerdown', retry, { once: true })
    const onVisibility = () => (document.hidden ? stopMusic() : startMusic(mood))
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pointerdown', retry)
      document.removeEventListener('visibilitychange', onVisibility)
      stopMusic()
    }
  }, [music, muted, mood])

  return null
}
