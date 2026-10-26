'use client'
import VehicleArt from '@/components/VehicleArt'
import { deleteDesign, MAX_DESIGNS, useExplorer } from '@/lib/explorer'

export default function Garage({ editable = true }) {
  const { designs } = useExplorer()
  if (designs.length === 0) {
    return <p className="rounded-2xl bg-white p-6 text-center shadow">Your garage is empty. Design your first vehicle in the studio!</p>
  }
  return (
    <div>
      <p className="mb-3 font-extrabold text-zts-midnight">{designs.length} of {MAX_DESIGNS} garage spaces used</p>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {designs.map((d) => (
          <li key={d.id} className="rounded-2xl bg-white p-3 text-center shadow ring-1 ring-zts-midnight/10">
            <VehicleArt design={d} className="w-full" />
            <p className="truncate font-extrabold text-zts-midnight">{d.name}</p>
            <p className="text-xs text-zts-graphite/60">Designed {d.created}</p>
            {editable && (
              <button type="button" onClick={() => window.confirm(`Remove ${d.name} from your garage?`) && deleteDesign(d.id)} className="mt-1 text-xs font-bold text-red-600 hover:underline">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
