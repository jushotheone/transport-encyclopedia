// Minimal event bus so any code can show a small reward message.
const listeners = new Set()

export function toast(message, icon = 'lightbulb') {
  listeners.forEach((l) => l({ id: Math.random().toString(36).slice(2), message, icon }))
}

export function onToast(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
