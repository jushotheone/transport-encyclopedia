import PassportView from '@/components/PassportView'
import Icon from '@/components/Icon'

export const metadata = { title: 'Explorer Passport' }

export default function PassportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-4xl font-extrabold text-zts-midnight"><Icon name="medal" className="mr-2 h-9 w-9 text-zts-orange align-[-0.12em]" />Explorer Passport</h1>
      <PassportView />
    </div>
  )
}
