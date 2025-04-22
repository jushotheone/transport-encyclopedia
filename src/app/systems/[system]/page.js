import { getVehiclesBySystem } from '@/lib/sheets'
import VehicleCard from '@/components/VehicleCard'

export async function generateStaticParams() {
  const systems = ['air', 'road', 'rail', 'water', 'space', 'pipeline', 'cable', 'future']
  return systems.map((system) => ({ system }))
}

// ✅ Moved `params` destructure inside the function body
export default async function SystemPage(props) {
  const { system } = await props.params
  const vehicles = await getVehiclesBySystem(system)

  console.log('SYSTEM:', system)
  console.log('VEHICLES:', vehicles)

  return (
    <main className="bg-gray-50 min-h-screen px-4 py-12 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize text-purple-700">
          🚦 {system} Transport
        </h1>

        {vehicles.length === 0 ? (
          <p>No vehicles found for this system yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}