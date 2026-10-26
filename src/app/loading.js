import Icon from '@/components/Icon'
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status">
      <p className="animate-floaty text-xl font-extrabold text-zts-midnight"><Icon name="rocket" className="mr-2 h-6 w-6 text-zts-orange" />Preparing your mission…</p>
    </div>
  )
}
