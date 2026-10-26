import PassportView from '@/components/PassportView'

export const metadata = { title: 'Explorer Passport' }

export default function PassportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-extrabold text-zts-midnight">🎖️ Explorer Passport</h1>
      <PassportView />
    </div>
  )
}
