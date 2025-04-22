import { getVehicleBySlug } from '@/lib/sheets'
import ManufacturerList from '@/components/ManufacturerList'


export async function generateStaticParams() {
  const vehicles = ['helicopter', 'rocket'] // Expand as you add more
  return vehicles.map((slug) => ({ slug }))
}

export default async function VehicleDetailPage({ params }) {
  const vehicle = getVehicleBySlug(params.slug)

  if (!vehicle) {
    return <div className="p-8">Vehicle not found.</div>
  }

  const { name, image, description, funFact, manufacturers } = vehicle

  return (
    <main className="bg-white text-gray-800 min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">{name}</h1>
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover rounded mb-6"
        />

        <p className="text-lg text-gray-700 mb-4">{description}</p>

        {funFact && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <strong>Fun Fact:</strong> {funFact}
          </div>
        )}

        {manufacturers?.length > 0 && (
            <ManufacturerList manufacturers={manufacturers} />
        )}
      </div>
    </main>
  )
}