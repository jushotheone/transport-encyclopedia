'use client'
import Icon from '@/components/Icon'

export default function Error({ reset }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="flex justify-center text-zts-orange"><Icon name="wrench" className="h-20 w-20" /></p>
      <h1 className="mt-4 text-3xl font-extrabold text-zts-midnight">The signal dropped!</h1>
      <p className="mt-2 text-zts-graphite/80">Something went wrong on our side. Let&apos;s try again.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-zts-orange px-6 py-3 font-extrabold text-white">
        Try again
      </button>
    </div>
  )
}
