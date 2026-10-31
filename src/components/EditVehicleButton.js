'use client'
import Icon from '@/components/Icon'

// Asks the Creator Hub tools above to open this vehicle so Zion can add what is missing.
export default function EditVehicleButton({ slug, name }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('creator:edit', { detail: slug }))}
      aria-label={`Add to ${name}`}
      className="mt-2 rounded-full bg-zts-blue px-3 py-1 text-sm font-extrabold text-white hover:brightness-110"
    >
      <Icon name="pencil" className="mr-1 h-4 w-4" />Add to it
    </button>
  )
}
