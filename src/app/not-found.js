import Link from 'next/link'
import Icon from '@/components/Icon'

export const metadata = { title: 'Lost route' }

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="flex justify-center text-zts-blue"><Icon name="compass" className="h-20 w-20" /></p>
      <h1 className="mt-4 text-3xl font-extrabold text-zts-midnight">Uh-oh, this route doesn&apos;t exist!</h1>
      <p className="mt-2 text-zts-graphite/80">
        Maybe the Route Breaker moved it, or maybe the link is wrong. Let&apos;s get you back on track.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-zts-orange px-6 py-3 font-extrabold text-white">
        Back to mission control
      </Link>
    </div>
  )
}
