'use client'
import { setMusic, setMuted, useExplorer } from '@/lib/explorer'

export default function SoundToggle() {
  const { muted, music } = useExplorer()
  const btn = 'rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20'
  return (
    <>
      <button type="button" onClick={() => setMusic(!music)} aria-pressed={music} aria-label={music ? 'Turn music off' : 'Turn music on'} className={`${btn} ${music ? 'ring-2 ring-zts-orange' : 'opacity-70'}`}>
        🎵
      </button>
      <button type="button" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? 'Turn sound effects on' : 'Turn sound effects off'} className={btn}>
        {muted ? '🔇' : '🔊'}
      </button>
    </>
  )
}
