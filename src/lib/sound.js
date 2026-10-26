'use client'
import { getState } from '@/lib/explorer'

// Tiny synthesiser: every sound is generated in the browser, so there are no audio files to load.
let ctx = null

function audio() {
  if (typeof window === 'undefined' || getState().muted) return null
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(a, freq, at, dur, type = 'sine', vol = 0.12, slideTo) {
  const o = a.createOscillator()
  const g = a.createGain()
  const t = a.currentTime + at
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function noise(a, at, dur, vol = 0.08) {
  const len = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  const f = a.createBiquadFilter()
  const g = a.createGain()
  f.type = 'bandpass'
  f.frequency.value = 900
  g.gain.value = vol
  src.buffer = buf
  src.connect(f).connect(g).connect(a.destination)
  src.start(a.currentTime + at)
}

const notes = { c: 523, e: 659, g: 784, c2: 1047, e2: 1319 }

const sounds = {
  tap: (a) => tone(a, 440, 0, 0.08, 'triangle', 0.1, 560),
  good: (a) => [notes.c, notes.e, notes.g].forEach((f, i) => tone(a, f, i * 0.09, 0.2, 'triangle')),
  bad: (a) => tone(a, 220, 0, 0.35, 'sawtooth', 0.09, 90),
  strike: (a) => {
    noise(a, 0, 0.4, 0.12)
    tone(a, 160, 0, 0.5, 'sawtooth', 0.1, 50)
  },
  win: (a) => [notes.c, notes.e, notes.g, notes.c2, notes.e2].forEach((f, i) => tone(a, f, i * 0.1, 0.35, 'triangle', 0.13)),
  card: (a) => [notes.g, notes.c2, notes.e2, 1568].forEach((f, i) => tone(a, f, i * 0.07, 0.4, 'sine', 0.1)),
  whoosh: (a) => {
    noise(a, 0, 0.9, 0.1)
    tone(a, 200, 0, 0.9, 'sine', 0.06, 900)
  },
  rise: (a) => tone(a, 262, 0, 1.2, 'sine', 0.07, 524),
}

export function play(name) {
  const a = audio()
  if (a && sounds[name]) sounds[name](a)
}

// Gentle generative soundtrack: random notes from a pentatonic scale, so it always sounds calm and never repeats exactly.
const PENTATONIC = [0, 2, 4, 7, 9]
let musicTimer = null
let beat = 0

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer)
  musicTimer = null
}

export function startMusic(mood = 'map') {
  stopMusic()
  const state = getState()
  if (!state.music || !audio()) return
  const every = mood === 'puzzle' ? 520 : 820
  musicTimer = setInterval(() => {
    const a = audio()
    if (!a) return
    const note = (deg, oct) => 261.63 * 2 ** ((deg + oct * 12) / 12)
    const deg = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]
    tone(a, note(deg, Math.random() < 0.25 ? 1 : 0), 0, 1.8, 'sine', 0.03)
    if (beat % 4 === 0) tone(a, note(PENTATONIC[(beat / 4) % 5], -1), 0, 3, 'triangle', 0.025)
    if (mood === 'puzzle' && beat % 2 === 1) tone(a, note(deg, 1), 0.15, 0.4, 'sine', 0.015)
    beat++
  }, every)
}
