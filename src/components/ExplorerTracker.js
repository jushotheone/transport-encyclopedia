'use client'
import { useEffect } from 'react'
import { recordVisit } from '@/lib/explorer'

export default function ExplorerTracker({ slug }) {
  useEffect(() => {
    recordVisit(slug)
  }, [slug])
  return null
}
