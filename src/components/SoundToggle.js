'use client'
import { setMuted, useExplorer } from '@/lib/explorer'

export default function SoundToggle() {
  const { muted } = useExplorer()
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
