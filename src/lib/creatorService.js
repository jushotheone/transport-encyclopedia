// What happens when Zion presses Publish. All the safety rules live here and are tested with a pretend sheet.
import { buildChallenge, buildVehicle } from '@/lib/creatorWrite'

const HOUR = 60 * 60 * 1000

// Turns a failure from Google into something a grown-up can act on.
export function explain(err, email = '') {
  const text = String(err?.message || err || '')
  if (/403|permission|forbidden|insufficient|caller does not have/i.test(text)) {
    return `The sheet is not shared with edit access yet. In Google Sheets, press Share and add ${email || 'the service account email'} as an Editor.`
  }
  return 'Something went wrong saving that. Nothing was lost. Please try again in a moment.'
}

export function createService({ isAuthed, store, enabled, review = () => false, email = '', now = () => Date.now(), limit = 40, onSaved = () => {} }) {
  const stamps = []

  async function guard() {
    if (!(await isAuthed())) return { ok: false, errors: ['The Creator Hub is locked. Enter the PIN first.'] }
    if (!enabled()) return { ok: false, errors: ['Publishing from the hub is not switched on yet. Ask a grown-up to turn it on.'] }
    const t = now()
    while (stamps.length && t - stamps[0] > HOUR) stamps.shift()
    if (stamps.length >= limit) return { ok: false, errors: ['That is a lot of changes in one go. Take a short break and try again later.'] }
    return null
  }

  async function run(fn) {
    const blocked = await guard()
    if (blocked) return blocked
    try {
      const result = await fn()
      if (result.ok) {
        stamps.push(now())
        onSaved()
      }
      return result
    } catch (err) {
      return { ok: false, errors: [explain(err, email)] }
    }
  }

  return {
    publishVehicle: (input) =>
      run(async () => {
        const built = buildVehicle(input, { mode: 'new', existingSlugs: await store.vehicleSlugs() })
        if (!built.ok) return built
        await store.appendVehicle(built.cells)
        return { ok: true, slug: built.slug }
      }),

    updateVehicle: (slug, input) =>
      run(async () => {
        const built = buildVehicle(input, { mode: 'edit', slug: String(slug || '').trim().toLowerCase() })
        if (!built.ok) return built
        const found = await store.replaceVehicle(built.slug, built.cells)
        return found ? { ok: true, slug: built.slug } : { ok: false, errors: ['That vehicle could not be found in the sheet.'] }
      }),

    publishChallenge: (input) =>
      run(async () => {
        const built = buildChallenge(input, { review: review(), knownSlugs: await store.vehicleSlugs() })
        if (!built.ok) return built
        await store.appendChallenge(built.cells)
        return { ok: true, review: built.review }
      }),
  }
}
