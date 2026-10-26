'use client'
import { useRef, useState } from 'react'
import Icon from '@/components/Icon'

export default function SoundButton({ src, label }) {
  const audio = useRef(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    if (!audio.current) {
      audio.current = new Audio(src)
      audio.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audio.current.pause()
      audio.current.currentTime = 0
      setPlaying(false)
    } else {
      audio.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="rounded-full bg-zts-orange px-4 py-2 text-sm font-bold text-white shadow hover:brightness-110"
    >
      {playing ? <><Icon name="stop" className="mr-1 h-4 w-4" />Stop</> : <><Icon name="bell" className="mr-1 h-4 w-4" />{`Hear the ${label}`}</>}
    </button>
  )
}
