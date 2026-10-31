'use client'
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'

// Speak instead of type. Uses the browser's own speech recognition (iPhone Safari and Chrome have it).
// Where it is missing, a hint points to the keyboard's microphone instead.
export default function VoiceInput({ value, onChange, rows = 3, multiline = true, id, placeholder, className = '' }) {
  const [supported, setSupported] = useState(null)
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState('')
  const rec = useRef(null)
  const base = useRef('')

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
    return () => rec.current?.abort?.()
  }, [])

  function join(a, b) {
    const t = `${a.trim()} ${b.trim()}`.trim()
    return t.charAt(0).toUpperCase() + t.slice(1)
  }

  function toggle() {
    if (listening) return rec.current?.stop()
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new Ctor()
    r.lang = 'en-GB'
    r.interimResults = true
    r.continuous = true
    base.current = value || ''
    r.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript
      setHeard(text)
      onChange(join(base.current, text))
    }
    r.onend = () => { setListening(false); setHeard('') }
    r.onerror = () => { setListening(false); setHeard('') }
    rec.current = r
    try { r.start(); setListening(true) } catch { setListening(false) }
  }

  const box = `w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-zts-midnight outline-none focus:border-zts-blue ${className}`
  return (
    <div>
      {multiline ? (
        <textarea id={id} rows={rows} className={box} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} className={box} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {supported && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={listening}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-lg font-extrabold shadow transition ${listening ? 'animate-pulse bg-red-500 text-white' : 'bg-zts-orange text-white hover:brightness-110'}`}
        >
          <Icon name={listening ? 'volume' : 'mic'} className="h-6 w-6" />
          {listening ? 'Listening… tap to stop' : 'Tap and talk'}
        </button>
      )}
      {listening && heard && <p className="mt-1 text-sm font-bold text-zts-graphite/70" aria-live="polite">Hearing: “{heard}”</p>}
      {supported === false && <p className="mt-1 text-sm text-zts-graphite/70">Tip: tap the microphone on your keyboard to talk instead of typing.</p>}
    </div>
  )
}
