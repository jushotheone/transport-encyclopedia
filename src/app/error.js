'use client'

export default function Error({ reset }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-7xl" aria-hidden="true">🔧</p>
      <h1 className="mt-4 text-3xl font-extrabold text-zts-midnight">The signal dropped!</h1>
      <p className="mt-2 text-zts-graphite/80">Something went wrong on our side. Let&apos;s try again.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-zts-orange px-6 py-3 font-extrabold text-white">
        Try again
      </button>
    </div>
  )
}
