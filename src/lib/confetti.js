// Dependency-free confetti burst. Does nothing for people who prefer reduced motion.
const colours = ['#1D9BF0', '#F28C28', '#D64045', '#24875D', '#F59E0B', '#7057D9', '#31A8E0']

export function confetti({ count = 140, y = 0.35 } = {}) {
  if (typeof document === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 80 })
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const g = canvas.getContext('2d')
  const bits = Array.from({ length: count }, () => ({
    x: canvas.width / 2,
    y: canvas.height * y,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -14 - 3,
    s: Math.random() * 8 + 4,
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.4,
    c: colours[Math.floor(Math.random() * colours.length)],
  }))
  const end = performance.now() + 2600
  const frame = (now) => {
    g.clearRect(0, 0, canvas.width, canvas.height)
    bits.forEach((b) => {
      b.vy += 0.35
      b.x += b.vx
      b.y += b.vy
      b.r += b.vr
      g.save()
      g.translate(b.x, b.y)
      g.rotate(b.r)
      g.fillStyle = b.c
      g.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2)
      g.restore()
    })
    if (now < end) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
