'use client'

export default function ManufacturerList({ manufacturers }) {
  if (!manufacturers || manufacturers.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🚧 Manufacturers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {manufacturers.map((mfg, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-gray-50 p-4 rounded shadow hover:shadow-md transition"
          >
            {mfg.logo && (
              <img
                src={mfg.logo}
                alt={`${mfg.name} logo`}
                className="w-16 h-16 object-contain rounded"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">{mfg.name}</h3>
              <p className="text-sm text-gray-600">{mfg.country}</p>
              {mfg.website && (
                <a
                  href={mfg.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}