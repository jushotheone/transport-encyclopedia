import DesignStudio from '@/components/DesignStudio'

export const metadata = { title: 'Design Studio', description: 'Design your own vehicle, then test it on a mission.' }

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-extrabold text-zts-midnight">🛠️ Design Studio</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Build a vehicle from parts. Then send it on a mission. Function comes first, so pick parts that fit the job!</p>
      <DesignStudio />
    </div>
  )
}
