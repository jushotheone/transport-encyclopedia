// Route Builder puzzle engine: pure functions, no React. Levels are generated from a seed, so a
// given division and level is always the same puzzle, and every puzzle is solvable by construction.
export const N = 1
export const E = 2
export const S = 4
export const W = 8

const DIRS = [
  { bit: N, dr: -1, dc: 0 },
  { bit: E, dr: 0, dc: 1 },
  { bit: S, dr: 1, dc: 0 },
  { bit: W, dr: 0, dc: -1 },
]
const opposite = (b) => (b === N ? S : b === S ? N : b === E ? W : E)

export const rotateMask = (m) => ((m << 1) | (m >> 3)) & 15
export const rotateN = (m, n) => {
  let x = m
  for (let i = 0; i < (((n % 4) + 4) % 4); i++) x = rotateMask(x)
  return x
}

export function hashString(s) {
  let h = 2166136261
  for (const ch of s) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(list, rng) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Random self-avoiding walk from the left edge (row `start`) to the right edge (row `end`).
function findPath(rng, size, start, end, blocked, minLen) {
  const goal = end * size + (size - 1)
  const path = [[start, 0]]
  const seen = new Set([start * size])
  let budget = 4000

  const walk = (r, c) => {
    if (budget-- <= 0) return false
    if (r === end && c === size - 1) return path.length >= minLen
    for (const d of shuffle(DIRS, rng)) {
      const nr = r + d.dr
      const nc = c + d.dc
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue
      const k = nr * size + nc
      if (seen.has(k) || (blocked.has(k) && k !== goal)) continue
      seen.add(k)
      path.push([nr, nc])
      if (walk(nr, nc)) return true
      path.pop()
      seen.delete(k)
    }
    return false
  }
  return walk(start, 0) ? path.map((p) => [...p]) : null
}

const dirTo = (a, b) => DIRS.find((d) => a[0] + d.dr === b[0] && a[1] + d.dc === b[1]).bit

// The tile mask each path cell needs so that the route connects from the entrance to the exit.
function pathMasks(path, size) {
  const out = {}
  path.forEach((cell, i) => {
    let m = 0
    if (i === 0) m |= W
    else m |= dirTo(cell, path[i - 1])
    if (i === path.length - 1) m |= E
    else m |= dirTo(cell, path[i + 1])
    out[cell[0] * size + cell[1]] = m
  })
  return out
}

// Which cells light up, and the shortest lit route from entrance to exit.
export function computeFlow(size, masks, start, end) {
  const s = start * size
  if (!(masks[s] & W)) return { lit: new Set(), exit: false, route: [] }
  const lit = new Set([s])
  const parent = new Map()
  const queue = [s]
  while (queue.length) {
    const k = queue.shift()
    const r = Math.floor(k / size)
    const c = k % size
    for (const d of DIRS) {
      if (!(masks[k] & d.bit)) continue
      const nr = r + d.dr
      const nc = c + d.dc
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) continue
      const nk = nr * size + nc
      if (lit.has(nk) || !(masks[nk] & opposite(d.bit))) continue
      lit.add(nk)
      parent.set(nk, k)
      queue.push(nk)
    }
  }
  const goal = end * size + (size - 1)
  const exit = lit.has(goal) && !!(masks[goal] & E)
  const route = []
  if (exit) for (let k = goal; k !== undefined; k = parent.get(k)) route.unshift(k)
  return { lit, exit, route }
}

const DECOYS = [5, 5, 3, 3, 3, 7, 15, 0, 0] // straight, corner, tee, cross, rubble

export const SIZES = [3, 4, 5]

export function generateLevel(division, level) {
  const size = SIZES[level - 1]
  const twist = level >= 2
  const minLen = size + 2 + (size > 3 ? 1 : 0)

  for (let attempt = 0; attempt < 60; attempt++) {
    const rng = mulberry32(hashString(`${division}:${level}:${attempt}`))
    const start = Math.floor(rng() * size)
    let end = Math.floor(rng() * size)
    if (end === start) end = (end + 1) % size

    const p1 = findPath(rng, size, start, end, new Set(), minLen)
    if (!p1) continue
    let p2 = null
    if (twist) {
      const interior = new Set(p1.slice(1, -1).map(([r, c]) => r * size + c))
      for (let t = 0; t < 25 && !p2; t++) p2 = findPath(rng, size, start, end, interior, minLen)
      if (!p2) continue
    }

    const t1 = pathMasks(p1, size)
    const t2 = p2 ? pathMasks(p2, size) : null
    const target = { ...t1 }
    if (t2) for (const k in t2) target[k] = (target[k] || 0) | t2[k]

    const tiles = Array.from({ length: size * size }, (_, k) => {
      const base = k in target ? target[k] : DECOYS[Math.floor(rng() * DECOYS.length)]
      return { base, rubble: base === 0, rot0: 0 }
    })

    const solvedNow = () => {
      const masks = tiles.map((t) => rotateN(t.base, t.rot0))
      return computeFlow(size, masks, start, end).exit
    }
    for (let guard = 0; guard < 20; guard++) {
      tiles.forEach((t) => {
        t.rot0 = t.rubble ? 0 : Math.floor(rng() * 4)
      })
      if (!solvedNow()) break
    }

    const needed = (k, m) => {
      for (let n = 0; n < 4; n++) if (rotateN(tiles[k].base, tiles[k].rot0 + n) === m) return n
      return 0
    }
    const par = Object.keys(target).reduce((sum, k) => sum + needed(+k, target[k]), 0)

    return {
      size,
      start,
      end,
      twist,
      par,
      tiles,
      t1,
      t2,
      p1: p1.map(([r, c]) => r * size + c),
      p2: p2 ? p2.map(([r, c]) => r * size + c) : null,
    }
  }
  throw new Error(`Could not generate route puzzle for ${division} level ${level}`)
}

// The first tile (along the route you still need) that is not pointing the right way.
export function nextHint(level, masks, broken) {
  let route = level.p1
  let target = level.t1
  if (level.p2 && broken !== null && level.p1.slice(1, -1).includes(broken)) {
    route = level.p2
    target = level.t2
  }
  // A tile only needs the connections this route uses; a junction with extra arms is fine.
  return route.find((k) => (masks[k] & target[k]) !== target[k]) ?? null
}

export function starsFor(moves, par, hintsUsed) {
  const stars = moves <= par + 2 ? 3 : moves <= par + 6 ? 2 : 1
  return hintsUsed > 0 ? Math.min(2, stars) : stars
}
