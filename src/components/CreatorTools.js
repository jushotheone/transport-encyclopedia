'use client'
import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import VehicleQuest from '@/components/VehicleQuest'
import { Question } from '@/components/ChallengeGame'
import { ZionAvatar } from '@/components/Zion'
import { divisions } from '@/lib/divisions'
import { completeness } from '@/lib/health'
import { toChallengeRow } from '@/lib/columns'
import { cleanChoice } from '@/lib/utils'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { useExplorer, dayKey } from '@/lib/explorer'
import { toast } from '@/lib/toast'
import { publishChallenge } from '@/app/creator/actions'

const field = 'mt-1 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-zts-midnight outline-none focus:border-zts-blue'
const label = 'block text-sm font-extrabold uppercase tracking-wide text-zts-graphite/70'
const publishBtn = 'w-full rounded-full bg-green-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-40'

function Field({ id, title, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      {hint && <p className="text-sm text-zts-graphite/60">{hint}</p>}
      {children}
    </div>
  )
}

async function copy(text, done) {
  try {
    await navigator.clipboard.writeText(text)
    play('good')
    toast(done, 'ok')
  } catch {
    toast('Your browser would not let me copy that.', 'alert')
  }
}

function Problems({ errors }) {
  if (!errors.length) return null
  return (
    <ul role="alert" className="space-y-1 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-800">
      {errors.map((e, i) => <li key={i}><Icon name="alert" className="mr-1.5 h-4 w-4" />{e}</li>)}
    </ul>
  )
}

function Published({ children }) {
  return (
    <div className="animate-pop flex items-center gap-3 rounded-2xl bg-green-50 p-3 font-bold text-green-900">
      <ZionAvatar className="h-10 w-10" />
      <div className="flex-1">{children}</div>
    </div>
  )
}

function QuestionMaker({ vehicles, canPublish, review }) {
  const router = useRouter()
  const empty = { vehicle: '', question: '', correct: '', w1: '', w2: '', w3: '', explanation: '' }
  const [c, setC] = useState(empty)
  const [picked, setPicked] = useState(null)
  const [errors, setErrors] = useState([])
  const [done, setDone] = useState(null)
  const [pending, start] = useTransition()
  const set = (k) => (e) => {
    setC((x) => ({ ...x, [k]: e.target.value }))
    setPicked(null)
    setDone(null)
  }
  const wrongs = [c.w1, c.w2, c.w3].map(cleanChoice).filter(Boolean)
  const q = useMemo(() => {
    const options = [{ label: cleanChoice(c.correct) || 'Your right answer', correct: true }, ...wrongs.map((w) => ({ label: w, correct: false }))]
    return { id: 'preview', level: 1, source: 'zion', authored: true, prompt: c.question || 'Your question appears here', quote: '', choices: options.sort((a, b) => a.label.localeCompare(b.label)), explain: c.explanation || cleanChoice(c.correct) }
  }, [c, wrongs])
  const dup = new Set([cleanChoice(c.correct), ...wrongs].map((s) => s.toLowerCase())).size !== wrongs.length + 1
  const ready = c.question.trim() && c.correct.trim() && wrongs.length >= 1 && !dup

  function publish() {
    setErrors([])
    start(async () => {
      const r = await publishChallenge({ vehicle: c.vehicle, question: c.question, correct: c.correct, wrongs, explanation: c.explanation })
      if (!r.ok) {
        play('bad')
        return setErrors(r.errors)
      }
      play('win')
      confetti({ count: 100, y: 0.5 })
      toast(r.review ? 'Saved! A grown-up needs to approve it before friends see it.' : 'Your question is live in the games!', 'rocket')
      setDone({ review: r.review })
      setC(empty)
      router.refresh()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field id="qm-v" title="Which vehicle is it about?" hint="Optional.">
          <select id="qm-v" className={field} value={c.vehicle} onChange={set('vehicle')}>
            <option value="">Any vehicle</option>
            {vehicles.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}
          </select>
        </Field>
        <Field id="qm-q" title="Your question"><input id="qm-q" className={field} value={c.question} onChange={set('question')} /></Field>
        <Field id="qm-c" title="The right answer"><input id="qm-c" className={`${field} border-green-300`} value={c.correct} onChange={set('correct')} /></Field>
        {['w1', 'w2', 'w3'].map((k, i) => (
          <Field key={k} id={`qm-${k}`} title={`Wrong answer ${i + 1}${i ? ' (optional)' : ''}`}>
            <input id={`qm-${k}`} className={field} value={c[k]} onChange={set(k)} />
          </Field>
        ))}
        <Field id="qm-e" title="Why is it right?" hint="This pops up after they answer, so they learn something."><textarea id="qm-e" rows={3} className={field} value={c.explanation} onChange={set('explanation')} /></Field>
        {dup && <p className="text-sm font-bold text-red-600">Two of your answers are the same. Make each one different.</p>}
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <p className="text-sm font-extrabold uppercase tracking-wide text-zts-graphite/70">Try it, just like a friend will</p>
        <Question q={q} picked={picked} onPick={setPicked} lightning={false} timeLeft={0} />
        {picked !== null && <p className="rounded-2xl bg-zts-midnight p-4 font-bold text-white"><Icon name="lightbulb" className="mr-1.5 h-5 w-5 text-yellow-300" />{q.explain}</p>}
        <Problems errors={errors} />
        {done && <Published>{done.review ? 'Saved! A grown-up needs to approve it before friends see it.' : 'Your question is live in the games!'}</Published>}
        {canPublish ? (
          <button type="button" disabled={!ready || pending} onClick={publish} className={publishBtn}>
            <Icon name="rocket" className="mr-2 h-5 w-5" />{pending ? 'Publishing…' : review ? 'Send for approval' : 'Publish to the games'}
          </button>
        ) : (
          <button type="button" disabled={!ready} onClick={() => copy(toChallengeRow({ vehicle: c.vehicle, question: c.question, correct: cleanChoice(c.correct), wrongs, explanation: c.explanation }), 'Copied! Paste it into the first empty row of the Challenges tab.')} className={`${publishBtn} bg-zts-orange`}>
            <Icon name="share" className="mr-2 h-5 w-5" />Copy this question for the sheet
          </button>
        )}
      </div>
    </div>
  )
}

function Setup({ email, demo }) {
  return (
    <details className="rounded-3xl bg-amber-50 p-4 text-amber-950">
      <summary className="cursor-pointer text-lg font-extrabold"><Icon name="lock" className="mr-1.5 h-5 w-5" />Want to publish straight from here? A grown-up needs to switch it on</summary>
      <ol className="mt-3 list-decimal space-y-2 pl-6 font-bold">
        <li>Open your Google Sheet and press <em>Share</em>. Add <code className="rounded bg-white px-1.5 py-0.5 break-all">{email || 'the service account email'}</code> as an <em>Editor</em>.</li>
        <li>In the hosting settings, add the variable <code className="rounded bg-white px-1.5 py-0.5">CREATOR_WRITE</code> set to <code className="rounded bg-white px-1.5 py-0.5">1</code>, then deploy again.</li>
        <li>Optional: add <code className="rounded bg-white px-1.5 py-0.5">CREATOR_REVIEW</code> set to <code className="rounded bg-white px-1.5 py-0.5">1</code> so questions wait for a grown-up to approve them first.</li>
      </ol>
      {demo && <p className="mt-2 text-sm">Google is not connected here, so publishing would go to a practice sheet only.</p>}
      <p className="mt-2 text-sm">Until then, the buttons below copy a ready-made row to paste into the sheet.</p>
    </details>
  )
}

// Zion picks a vehicle that is already in the sheet (name and division come from there) and fills in what is missing.
function VehiclePicker({ vehicles, onPick, onNew }) {
  const [div, setDiv] = useState(divisions[0].slug)
  const list = vehicles
    .filter((v) => v.system === div)
    .map((v) => ({ v, p: completeness(v) }))
    .sort((a, b) => a.p.pct - b.p.pct || a.v.name.localeCompare(b.v.name))
  const me = useExplorer()
  const doneToday = me.makeDay === dayKey()
  const emptiest = vehicles.map((v) => ({ v, p: completeness(v) })).sort((a, b) => a.p.pct - b.p.pct)[0]
  return (
    <div className="space-y-4">
      <div className={`rounded-3xl p-4 shadow ${doneToday ? 'bg-green-50 ring-2 ring-green-300' : 'bg-zts-midnight text-white'}`}>
        <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide opacity-80"><Icon name={doneToday ? 'ok' : 'timer'} className="h-4 w-4" />Today&apos;s creator mission{me.makeDays > 0 ? ` · ${me.makeDays} creator day${me.makeDays === 1 ? '' : 's'}` : ''}</p>
        <p className="mt-1 text-xl font-extrabold">{doneToday ? 'Done! You made the app better today.' : 'Finish one vehicle. About 5 minutes. Talk instead of typing.'}</p>
        {!doneToday && emptiest && (
          <button type="button" onClick={() => onPick(emptiest.v)} className="mt-3 rounded-full bg-zts-orange px-5 py-2.5 font-extrabold text-white shadow hover:brightness-110">
            <Icon name="rocket" className="mr-1.5 h-4 w-4" />Start with {emptiest.v.name}
          </button>
        )}
      </div>
      <Field id="vp-div" title="Or pick a division and choose yourself" hint="The emptiest cards are at the top.">
        <select id="vp-div" className={field} value={div} onChange={(e) => setDiv(e.target.value)}>
          {divisions.map((d) => <option key={d.slug} value={d.slug}>{d.name} ({vehicles.filter((v) => v.system === d.slug).length})</option>)}
        </select>
      </Field>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map(({ v, p }) => (
          <li key={v.slug}>
            <button type="button" onClick={() => onPick(v)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow hover:shadow-md">
              <span className="flex-1">
                <span className="block text-lg font-extrabold text-zts-midnight">{v.name}</span>
                <span className="mt-1 block h-2 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-green-500" style={{ width: `${p.pct}%` }} /></span>
              </span>
              <span className="text-sm font-extrabold text-zts-graphite/70">{p.done}/{p.total}</span>
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="font-bold text-zts-graphite/70">Nothing here yet.</li>}
      </ul>
      <button type="button" onClick={onNew} className="rounded-full bg-zts-blue px-5 py-3 font-extrabold text-white shadow hover:brightness-110">
        <Icon name="plus" className="mr-1.5 h-4 w-4" />Add a brand-new vehicle that is not in the list
      </button>
    </div>
  )
}

export default function CreatorTools({ vehicles, canPublish, review, email, demo }) {
  const [tab, setTab] = useState('vehicle')
  const [editing, setEditing] = useState(null)
  const [fresh, setFresh] = useState(false) // true when making a brand-new vehicle
  const [notice, setNotice] = useState(null) // kept here so it stays on screen after the form resets

  // The "Your vehicle files" list asks to open an entry here.
  useEffect(() => {
    const onEdit = (e) => {
      const found = vehicles.find((v) => v.slug === e.detail)
      if (!found) return
      setEditing(found)
      setNotice(null)
      setTab('vehicle')
      document.getElementById('make-h')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener('creator:edit', onEdit)
    return () => window.removeEventListener('creator:edit', onEdit)
  }, [vehicles])

  const tabBtn = (id) => `flex-1 rounded-2xl px-4 py-3 text-lg font-extrabold transition ${tab === id ? 'bg-zts-midnight text-white shadow-lg' : 'bg-white text-zts-midnight shadow'}`
  return (
    <div className="space-y-5">
      {!canPublish && <Setup email={email} demo={demo} />}
      <div className="flex gap-2" role="tablist" aria-label="What would you like to make?">
        <button type="button" role="tab" aria-selected={tab === 'vehicle'} onClick={() => setTab('vehicle')} className={tabBtn('vehicle')}><Icon name="car" className="mr-2 h-5 w-5" />Vehicles</button>
        <button type="button" role="tab" aria-selected={tab === 'question'} onClick={() => setTab('question')} className={tabBtn('question')}><Icon name="pencil" className="mr-2 h-5 w-5" />New question</button>
      </div>
      {tab === 'vehicle' ? (
        <>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setFresh(false) }} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-extrabold text-zts-midnight hover:bg-slate-300">
              <Icon name="back" className="mr-1.5 h-4 w-4" />Back to the vehicle list
            </button>
          )}
          {notice && (
            <Published>
              <p>{notice.edited ? `${notice.name} was updated and is live!` : `${notice.name} is live!`}{notice.tier ? ` It is a ${notice.tier} card.` : ''}</p>
              <p className="mt-1 text-sm font-bold">
                <Link href={`/vehicles/${notice.slug}`} className="underline">See your card</Link>
                {' · '}
                <Link href="/play" className="underline">Play the games with it</Link>
              </p>
            </Published>
          )}
          {!editing && fresh && (
            <button type="button" onClick={() => setFresh(false)} className="rounded-full bg-slate-200 px-4 py-2 text-sm font-extrabold text-zts-midnight hover:bg-slate-300">
              <Icon name="back" className="mr-1.5 h-4 w-4" />Back to the vehicle list
            </button>
          )}
          {!editing && !fresh ? (
            <VehiclePicker vehicles={vehicles} onPick={(v) => { setEditing(v); setNotice(null) }} onNew={() => setFresh(true)} />
          ) : (
          <VehicleQuest
            key={editing?.slug || 'new'}
            initial={editing}
            vehicles={vehicles}
            onBack={() => { setEditing(null); setFresh(false) }}
            canPublish={canPublish}
            onPublished={(n) => {
              setNotice(n)
              setEditing(null)
              setFresh(false)
            }}
          />
          )}
        </>
      ) : (
        <QuestionMaker vehicles={vehicles} canPublish={canPublish} review={review} />
      )}
    </div>
  )
}
