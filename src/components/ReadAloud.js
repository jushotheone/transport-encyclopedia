'use client'
import { useEffect, useState } from 'react'

export default function ReadAloud({ text }) {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    setSupported('speechSynthesis' in window)
    return () => window.speechSynthesis?.cancel()
  }, [])

  if (!supported || !text) return null

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-GB'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="rounded-full bg-zts-midnight px-4 py-2 text-sm font-bold text-white shadow hover:bg-zts-blue"
    >
      {speaking ? '⏹️ Stop reading' : '🔊 Read it to me'}
    </button>
  )
}
