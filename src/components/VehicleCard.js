'use client'
import Link from 'next/link'

export default function VehicleCard({ vehicle }) {
  const { name, slug, image, description } = vehicle

  return (
    <Link
      href={`/vehicles/${slug}`}
      className="block bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover rounded mb-4"
      />
      <h3 className="text-xl font-semibold mb-1">{name}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  )
}