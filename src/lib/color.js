// Small colour helpers for the vehicle drawings.
const parse = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')

// p from -1 (black) to 1 (white)
export function shade(hex, p) {
  const [r, g, b] = parse(hex)
  const t = p < 0 ? 0 : 255
  const k = Math.abs(p)
  return toHex(r + (t - r) * k, g + (t - g) * k, b + (t - b) * k)
}

export function isLight(hex) {
  const [r, g, b] = parse(hex)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}

// A paint-scheme colour that stands out against the body colour.
export const accentFor = (hex) => (isLight(hex) ? shade(hex, -0.6) : '#ffffff')
