// Design Studio parts. Every "mover" belongs to a transport division, so a design has real consequences
// on a mission: function first, looks second (the ZTS vehicle design rule).
export const bodies = [
  { id: 'pod', name: 'Pod' },
  { id: 'long', name: 'Long' },
  { id: 'wedge', name: 'Sleek' },
]

export const movers = [
  { id: 'wheels', name: 'Wheels', icon: 'car', division: 'road', note: 'Great on roads.' },
  { id: 'railwheels', name: 'Rail wheels', icon: 'train', division: 'rail', note: 'Needs tracks.' },
  { id: 'wings', name: 'Wings', icon: 'plane', division: 'air', note: 'Flies far and fast.' },
  { id: 'rotor', name: 'Rotor', icon: 'cog', division: 'air', note: 'Hovers and lands anywhere.' },
  { id: 'hull', name: 'Hull', icon: 'ship', division: 'water', note: 'Floats on water.' },
  { id: 'rocket', name: 'Rocket', icon: 'rocket', division: 'space', note: 'Leaves the planet.' },
  { id: 'hook', name: 'Cable hook', icon: 'cablecar', division: 'cable', note: 'Rides a cable.' },
  { id: 'hover', name: 'Hover jets', icon: 'atom', division: 'future', note: 'Experimental!' },
]

export const tops = [
  { id: 'windows', name: 'Windows' },
  { id: 'cargo', name: 'Cargo box' },
  { id: 'antenna', name: 'Antenna' },
  { id: 'none', name: 'Plain' },
]

export const colours = ['#1D9BF0', '#F28C28', '#D64045', '#24875D', '#7057D9', '#008C95', '#F59E0B', '#F4FAFD']
export const stickers = ['star', 'zap', 'flame', 'heart', 'cat', 'bird', 'rocket', 'gem']
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
