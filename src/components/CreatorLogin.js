import { unlock } from '@/app/creator/actions'
import { ZionAvatar } from '@/components/Zion'
import Icon from '@/components/Icon'

export default function CreatorLogin({ wrong }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center">
      <ZionAvatar className="mx-auto h-24 w-24" priority />
      <h1 className="mt-4 text-3xl font-extrabold text-zts-midnight">Zion&apos;s Creator Hub</h1>
      <p className="mt-1 text-zts-graphite/80">This part is for the people who build the encyclopedia. Enter the creator PIN to come in.</p>
      <form action={unlock} className="mt-6 space-y-3">
        <label htmlFor="pin" className="sr-only">Creator PIN</label>
        <input id="pin" name="pin" type="password" inputMode="text" autoComplete="current-password" required placeholder="Creator PIN" className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-xl font-bold text-zts-midnight outline-none focus:border-zts-blue" />
        {wrong && <p role="alert" className="font-bold text-red-600">That PIN is not right. Try again.</p>}
        <button type="submit" className="w-full rounded-full bg-zts-orange px-6 py-3 text-lg font-extrabold text-white shadow-lg hover:brightness-110">
          <Icon name="lock" className="mr-2 h-5 w-5" />Unlock
        </button>
      </form>
    </div>
  )
}
