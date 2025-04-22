import SystemGrid from '@/components/SystemGrid'

export default function HomePage() {
  return (
    <main className="bg-gray-100 text-gray-800 font-sans min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-4">
          🌍 Explore Transport Systems
        </h1>
        <p className="text-center text-lg text-gray-600 mb-10">
          Discover how the world moves with Zion&apos;s interactive transport explorer.
        </p>

        <SystemGrid />
      </div>
    </main>
  )
}