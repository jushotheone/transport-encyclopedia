// Zion, the explorer's guide. The portrait is a cropped copy of the approved character render.
export function ZionAvatar({ className = 'h-12 w-12', ring = true, priority = false }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/characters/zion-portrait.jpg"
      alt=""
      aria-hidden="true"
      width="96"
      height="96"
      loading={priority ? 'eager' : 'lazy'}
      className={`shrink-0 rounded-full bg-slate-200 object-cover object-[50%_28%] ${ring ? 'ring-2 ring-white shadow-md' : ''} ${className}`}
    />
  )
}

// A speech bubble from Zion. Screen readers hear "Zion says".
export function ZionSays({ children, className = '', tone = 'light', avatar = 'h-14 w-14' }) {
  const bubble = tone === 'dark' ? 'bg-zts-midnight text-white' : 'bg-white text-zts-midnight ring-1 ring-zts-midnight/10'
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <ZionAvatar className={avatar} />
      <div className={`relative flex-1 rounded-3xl rounded-bl-md px-4 py-3 text-lg font-bold leading-snug shadow-lg ${bubble}`}>
        <span className="sr-only">Zion says: </span>
        {children}
      </div>
    </div>
  )
}
