import Link from 'next/link'
import { safeUrl } from '@/lib/utils'

export default function VehicleCard({ vehicle, accent = '#1D9BF0', emoji = '🚦' }) {
  const { name, slug, image, description } = vehicle
  const src = safeUrl(image)

  return (
    <Link
      href={`/vehicles/${slug}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-zts-midnight/10 transition hover:-translate-y-1 hover:shadow-2xl"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} loading="lazy" className="h-48 w-full object-cover" />
      ) : (
        <div
          className="flex h-48 items-center justify-center text-6xl"
          style={{ background: `linear-gradient(135deg, ${accent}, #102A43)` }}
          aria-hidden="true"
        >
          {emoji}
        </div>
      )}
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-zts-midnight">{name}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-zts-graphite/80">{description}</p>
        <p className="mt-3 text-sm font-extrabold" style={{ color: accent }}>Open mission file →</p>
      </div>
    </Link>
  )
}
