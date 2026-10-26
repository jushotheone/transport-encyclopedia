import ControlRoomView from '@/components/ControlRoomView'

export const metadata = { title: 'Control Room', description: 'Collect the clues about the Route Breaker.' }

export default function ControlRoomPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-4xl font-extrabold text-zts-midnight">🛰️ Control Room</h1>
      <p className="mb-6 mt-1 text-lg text-zts-graphite/80">Your clue board. Repair routes to unlock the clues, then look for the pattern.</p>
      <ControlRoomView />
    </div>
  )
}
