// What Zion says on the home screen. It reacts to what the child has done, and it changes from day to day so it
// does not become something to tune out. Short sentences, friendly, never a lecture.
import { hashString } from '@/lib/routegen'
import { DAILY_FLAGS, dailyFlags, levelsCleared, repairedCount } from '@/lib/explorer'
import { divisions } from '@/lib/divisions'

export function zionTip(s, day) {
  const name = s.profile.name || 'explorer'
  const slugs = divisions.map((d) => d.slug)
  const fixed = repairedCount(s, slugs)
  const flags = dailyFlags(s)
  const claimed = s.daily.day === day && s.daily.claimed
  const pick = (list) => list[hashString(`${day}:${name}`) % list.length]

  if (fixed === slugs.length) return `The Control Room is open, ${name}! Come and see what the Route Breaker left behind.`
  if (DAILY_FLAGS.every((f) => flags.includes(f)) && !claimed) return `You finished all four missions, ${name}! Your daily chest is waiting.`
  const started = slugs.some((d) => levelsCleared(s, d) > 0) || s.cards.length > 0
  if (!started) return `Hi ${name}, I'm Zion! The Route Breaker is wrecking the network. Tap a hub and help me fix it!`

  const options = []
  if (fixed > 0) options.push(`Nice one, ${name}! ${fixed} route${fixed === 1 ? ' is' : 's are'} fixed. ${slugs.length - fixed} to go.`)
  const partly = slugs.find((d) => levelsCleared(s, d) > 0 && levelsCleared(s, d) < 3)
  if (partly) options.push(`You started on the ${divisions.find((d) => d.slug === partly).name.replace(' Transport', '').toLowerCase()} route. Want to finish it?`)
  if (s.learned.length > 2) {
    const fact = s.learned[hashString(day) % s.learned.length].text
    options.push(`Quick recap: ${fact}`)
  }
  if (!flags.includes('play')) options.push(`Today's Daily Challenge is ready. Can you beat it, ${name}?`)
  if (s.designs.length === 0) options.push(`Have you tried the Design Studio? You can build your own vehicle and test it on a mission.`)
  options.push(`What shall we explore today, ${name}?`)
  return pick(options)
}
