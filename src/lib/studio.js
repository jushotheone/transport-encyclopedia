// Design Studio parts. Every "mover" belongs to a transport division, so a design has real consequences
// on a mission: function first, looks second (the ZTS vehicle design rule).
export const bodies = [
  { id: 'pod', name: 'Pod', emoji: '🥚' },
  { id: 'long', name: 'Long', emoji: '🚃' },
  { id: 'wedge', name: 'Sleek', emoji: '🔺' },
]

export const movers = [
  { id: 'wheels', name: 'Wheels', emoji: '🛞', division: 'road', note: 'Great on roads.' },
  { id: 'railwheels', name: 'Rail wheels', emoji: '🚂', division: 'rail', note: 'Needs tracks.' },
  { id: 'wings', name: 'Wings', emoji: '🪽', division: 'air', note: 'Flies far and fast.' },
  { id: 'rotor', name: 'Rotor', emoji: '🚁', division: 'air', note: 'Hovers and lands anywhere.' },
  { id: 'hull', name: 'Hull', emoji: '⛵', division: 'water', note: 'Floats on water.' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', division: 'space', note: 'Leaves the planet.' },
  { id: 'hook', name: 'Cable hook', emoji: '🚡', division: 'cable', note: 'Rides a cable.' },
  { id: 'hover', name: 'Hover jets', emoji: '🌀', division: 'future', note: 'Experimental!' },
]

export const tops = [
  { id: 'windows', name: 'Windows', emoji: '🪟' },
  { id: 'cargo', name: 'Cargo box', emoji: '📦' },
  { id: 'antenna', name: 'Antenna', emoji: '📡' },
  { id: 'none', name: 'Plain', emoji: '⬜' },
]

export const colours = ['#1D9BF0', '#F28C28', '#D64045', '#24875D', '#7057D9', '#008C95', '#F59E0B', '#F4FAFD']
export const stickers = ['⭐', '⚡', '🔥', '🌈', '🐯', '🦅', '🚀', '💎']
export const sizes = [
  { id: 0.8, name: 'Small' },
  { id: 1, name: 'Medium' },
  { id: 1.2, name: 'Big' },
]

const adjectives = ['Sky', 'Thunder', 'Turbo', 'Cosmic', 'Silver', 'Rapid', 'Brave', 'Neon', 'Mighty', 'Swift']
const nouns = ['Zipper', 'Voyager', 'Dash', 'Runner', 'Glider', 'Cruiser', 'Spark', 'Racer', 'Scout', 'Comet']

const pick = (list) => list[Math.floor(Math.random() * list.length)]

export const randomName = () => `${pick(adjectives)} ${pick(nouns)}`

export function randomDesign() {
  return {
    name: randomName(),
    body: pick(bodies).id,
    mover: pick(movers).id,
    top: pick(tops).id,
    colour: pick(colours),
    sticker: pick(stickers),
    size: pick(sizes).id,
  }
}

export const divisionOfMover = (id) => movers.find((m) => m.id === id)?.division
