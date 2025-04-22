'use client'
import Link from 'next/link'

const transportSystems = [
  {
    name: 'Air Transport',
    emoji: '✈️',
    slug: 'air',
    image: 'https://source.unsplash.com/400x200/?airplane',
    description: 'Planes, helicopters, drones — travel through the skies!',
  },
  {
    name: 'Road Transport',
    emoji: '🚗',
    slug: 'road',
    image: 'https://source.unsplash.com/400x200/?bus',
    description: 'Cars, bikes, buses — vehicles that move on roads.',
  },
  {
    name: 'Rail Transport',
    emoji: '🚆',
    slug: 'rail',
    image: 'https://source.unsplash.com/400x200/?train',
    description: 'Trains, subways, monorails — run on tracks.',
  },
  {
    name: 'Water Transport',
    emoji: '🚢',
    slug: 'water',
    image: 'https://source.unsplash.com/400x200/?ship',
    description: 'Boats, ships, submarines — explore the seas!',
  },
  {
    name: 'Space Transport',
    emoji: '🚀',
    slug: 'space',
    image: 'https://source.unsplash.com/400x200/?rocket',
    description: 'Rockets, capsules — reach beyond the Earth.',
  },
  {
    name: 'Pipeline Transport',
    emoji: '🛢️',
    slug: 'pipeline',
    image: 'https://source.unsplash.com/400x200/?pipeline',
    description: 'Pipelines for oil, water, gas — silent carriers.',
  },
  {
    name: 'Cable Transport',
    emoji: '🚡',
    slug: 'cable',
    image: 'https://source.unsplash.com/400x200/?cablecar',
    description: 'Cable cars and lifts — riding high in the air.',
  },
  {
    name: 'Future Tech',
    emoji: '🌀',
    slug: 'future',
    image: 'https://source.unsplash.com/400x200/?hyperloop',
    description: 'Hyperloop, flying cars, jetpacks — tomorrow’s rides!',
  },
]

export default function SystemGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {transportSystems.map((system) => (
        <Link
          key={system.slug}
          href={`/systems/${system.slug}`}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2">
            {system.emoji} {system.name}
          </h2>
          <img
            src={system.image}
            alt={system.name}
            className="rounded mb-3 w-full h-48 object-cover"
          />
          <p className="text-sm text-gray-600">{system.description}</p>
        </Link>
      ))}
    </div>
  )
}