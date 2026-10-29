'use client'
import { useEffect, useState } from 'react'
import { ZionSays } from '@/components/Zion'
import { dayKey, useExplorer } from '@/lib/explorer'
import { zionTip } from '@/lib/zionTips'

export default function ZionGuide() {
  const s = useExplorer()
  const [day, setDay] = useState(null)
  useEffect(() => setDay(dayKey()), [])
  // Wait until we know the child's own date, so the server and the browser never disagree.
  if (!day) return <div className="min-h-[5.5rem]" aria-hidden="true" />
  return <ZionSays avatar="h-16 w-16">{zionTip(s, day)}</ZionSays>
}
