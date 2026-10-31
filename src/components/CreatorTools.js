'use client'
import { useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import ExplorerCard from '@/components/ExplorerCard'
import { Question } from '@/components/ChallengeGame'
import { ZionAvatar } from '@/components/Zion'
import { divisions } from '@/lib/divisions'
import { completeness } from '@/lib/health'
import { toChallengeRow, toSheetRow } from '@/lib/columns'
import { flagFor } from '@/lib/flags'
import { cleanChoice, quizProblem, slugify, splitChoices } from '@/lib/utils'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'
import { publishChallenge, publishVehicle, updateVehicle } from '@/app/creator/actions'

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

const BLANK = { name: '', system: 'air', description: '', funFact: '', bonus_fact: '', manufacturers: '', origin_country: '', zions_note: '', zions_recommendation: '', image: '', video_url: '', custom_sound_url: '', learn_more: '', quiz_question: '', quiz_choices: '', quiz_answer: '' }

// Turns a vehicle from the sheet back into the form's fields, so an existing entry can be added to.
const toForm = (v) => ({
  ...BLANK,
  ...Object.fromEntries(Object.keys(BLANK).map((k) => [k, v[k] ?? ''])),
  manufacturers: (v.manufacturers || []).join(', '),
  quiz_choices: (v.quiz_choices || []).join('\n'),
})

function VehicleMaker({ initial, existing, canPublish, onPublished }) {
  const router = useRouter()
  const [v, setV] = useState(initial ? toForm(initial) : BLANK)
  const [errors, setErrors] = useState([])
  const [pending, start] = useTransition()
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const vehicle = useMemo(
    () => ({
      ...v,
      name: v.name.trim() || 'Your vehicle',
      slug: initial?.slug || slugify(v.name) || 'your-vehicle',
      flag_emoji: flagFor(v.origin_country),
      manufacturers: v.manufacturers.split(',').map((s) => s.trim()).filter(Boolean),
      more_images: initial?.more_images || [],
      quiz_choices: splitChoices(v.quiz_choices),
    }),
    [v, initial]
  )

  const progress = completeness(vehicle)
  const choices = vehicle.quiz_choices
  const quizIssue = quizProblem(vehicle.quiz_question, choices, v.quiz_answer)
  const taken = !initial && v.name.trim() && existing.includes(vehicle.slug)
  const ready = v.name.trim() && v.description.trim().length >= 15 && !taken && !quizIssue

  function publish() {
    setErrors([])
    start(async () => {
      const input = { ...v, more_images: initial?.more_images || [] }
      const result = initial ? await updateVehicle(initial.slug, input) : await publishVehicle(input)
      if (!result.ok) {
        play('bad')
        return setErrors(result.errors)
      }
      play('win')
      confetti({ count: 140, y: 0.5 })
      toast(initial ? 'Saved! Your changes are live.' : `${v.name.trim()} is live in the app!`, 'rocket')
      if (!initial) setV(BLANK)
      router.refresh()
      onPublished({ slug: result.slug, name: v.name.trim(), edited: Boolean(initial) })
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {initial && (
          <p className="rounded-2xl bg-amber-50 p-3 font-bold text-amber-900">
            <Icon name="pencil" className="mr-1.5 h-4 w-4" />You are adding to <strong>{initial.name}</strong>. Fill in what is missing, then press Save changes.
          </p>
        )}
        {initial ? (
          <div className="rounded-2xl bg-white p-4 shadow">
            <p className={label}>Vehicle</p>
            <p className="text-2xl font-extrabold text-zts-midnight">{initial.name}</p>
            <p className="font-bold text-zts-graphite/70">{divisions.find((d) => d.slug === initial.system)?.name || initial.system}</p>
          </div>
        ) : (<>
        <Field id="vm-name" title="What is it called?">
          <input id="vm-name" className={field} value={v.name} onChange={set('name')} placeholder="Double-decker bus" />
          {taken && <p className="mt-1 text-sm font-bold text-red-600">That one is already in the app. Pick a different name, or open it from &ldquo;Your vehicle files&rdquo; to add to it.</p>}
        </Field>
        <Field id="vm-div" title="Which division?">
          <select id="vm-div" className={field} value={v.system} onChange={set('system')}>
            {divisions.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </Field>
        </>)}
        <Field id="vm-desc" title="Tell your friends about it" hint="Two or three sentences, like you are explaining it out loud.">
          <textarea id="vm-desc" rows={3} className={field} value={v.description} onChange={set('description')} />
        </Field>
        <Field id="vm-fact" title="A fun fact" hint="Something that makes people say wow.">
          <textarea id="vm-fact" rows={2} className={field} value={v.funFact} onChange={set('funFact')} />
        </Field>
        <Field id="vm-bonus" title="Did you know…?"><textarea id="vm-bonus" rows={2} className={field} value={v.bonus_fact} onChange={set('bonus_fact')} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="vm-country" title="Where is it from?">
            <input id="vm-country" className={field} value={v.origin_country} onChange={set('origin_country')} placeholder="Japan" />
            {vehicle.flag_emoji && <p className="mt-1 text-2xl">{vehicle.flag_emoji}</p>}
          </Field>
          <Field id="vm-makers" title="Who builds it?" hint="Separate with commas."><input id="vm-makers" className={field} value={v.manufacturers} onChange={set('manufacturers')} /></Field>
        </div>
        <Field id="vm-note" title="Your own note" hint="What do YOU think? Friends will be asked about it.">
          <textarea id="vm-note" rows={2} className={field} value={v.zions_note} onChange={set('zions_note')} />
        </Field>
        <Field id="vm-rec" title="Zion recommends…"><input id="vm-rec" className={field} value={v.zions_recommendation} onChange={set('zions_recommendation')} /></Field>

        <fieldset className="space-y-3 rounded-3xl bg-sky-50 p-4">
          <legend className="px-2 text-lg font-extrabold text-zts-midnight"><Icon name="brain" className="mr-1 h-5 w-5" />Write a quiz</legend>
          <Field id="vm-q" title="Question"><input id="vm-q" className={field} value={v.quiz_question} onChange={set('quiz_question')} /></Field>
          <Field id="vm-choices" title="Choices" hint="One choice on each line.">
            <textarea id="vm-choices" rows={4} className={field} value={v.quiz_choices} onChange={set('quiz_choices')} />
          </Field>
          <Field id="vm-ans" title="Which one is right?">
            <select id="vm-ans" className={field} value={v.quiz_answer} onChange={set('quiz_answer')} disabled={choices.length < 2}>
              <option value="">{choices.length < 2 ? 'Add at least 2 choices first' : 'Pick the right answer'}</option>
              {choices.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          {quizIssue && v.quiz_question && <p className="text-sm font-bold text-red-600">{quizIssue}</p>}
        </fieldset>

        <details className="rounded-3xl bg-slate-50 p-4" open={Boolean(initial)}>
          <summary className="cursor-pointer text-lg font-extrabold text-zts-midnight"><Icon name="eye" className="mr-1 h-5 w-5" />Photos, sound and video</summary>
          <div className="mt-3 space-y-4">
            <Field id="vm-img" title="Photo link" hint="A web address that starts with https://"><input id="vm-img" className={field} value={v.image} onChange={set('image')} /></Field>
            <Field id="vm-snd" title="Sound link"><input id="vm-snd" className={field} value={v.custom_sound_url} onChange={set('custom_sound_url')} /></Field>
            <Field id="vm-vid" title="YouTube video link"><input id="vm-vid" className={field} value={v.video_url} onChange={set('video_url')} /></Field>
            <Field id="vm-more" title="Learn more links" hint="Grown-up approved websites, separated by commas."><input id="vm-more" className={field} value={v.learn_more} onChange={set('learn_more')} /></Field>
          </div>
        </details>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-3xl bg-zts-midnight p-5 text-white shadow-xl">
          <p className="text-sm font-extrabold uppercase tracking-wide text-white/70">This is what your friends will see</p>
          <div className="mt-3 flex justify-center"><ExplorerCard vehicle={{ ...vehicle, system: v.system }} flippable /></div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100} aria-label="How complete this entry is">
            <div className="h-full rounded-full bg-gradient-to-r from-zts-blue to-zts-orange transition-all" style={{ width: `${progress.pct}%` }} />
          </div>
          <p className="mt-1 text-sm font-bold">{progress.done} of {progress.total} things added</p>
        </div>

        <ul className="space-y-2 rounded-3xl bg-white p-4 shadow ring-1 ring-zts-midnight/10">
          {progress.items.map((i) => (
            <li key={i.key} className={`flex gap-3 rounded-2xl p-2 ${i.done ? 'bg-green-50' : 'bg-slate-50'}`}>
              <Icon name={i.done ? 'ok' : 'plus'} className={`mt-0.5 h-6 w-6 ${i.done ? 'text-green-600' : 'text-slate-400'}`} />
              <span><span className="block font-extrabold text-zts-midnight">{i.label}</span><span className="text-sm text-zts-graphite/70">{i.unlocks}</span></span>
            </li>
          ))}
        </ul>

        <Problems errors={errors} />
        {canPublish ? (
          <button type="button" disabled={!ready || pending} onClick={publish} className={publishBtn}>
            <Icon name="rocket" className="mr-2 h-5 w-5" />{pending ? 'Publishing…' : initial ? 'Save changes' : 'Publish to the app'}
          </button>
        ) : (
          <button type="button" disabled={!ready} onClick={() => copy(toSheetRow({ ...vehicle, quiz_answer: v.quiz_answer }), 'Copied! Paste it into the first empty row of the Vehicles tab.')} className={`${publishBtn} bg-zts-orange`}>
            <Icon name="share" className="mr-2 h-5 w-5" />Copy this row for the sheet
          </button>
        )}
        {!ready && <p className="text-sm text-zts-graphite/70">Add a name and a description to switch the button on.</p>}
      </div>
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
  return (
    <div className="space-y-4">
      <Field id="vp-div" title="Which division?" hint="Pick a division, then choose a vehicle to finish. The emptiest ones are at the top.">
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
  const slugs = vehicles.map((v) => v.slug)

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
              <p>{notice.edited ? `${notice.name} was updated and is live!` : `${notice.name} is live!`}</p>
              <Link href={`/vehicles/${notice.slug}`} className="text-sm underline">See it in the app</Link>
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
          <VehicleMaker
            key={editing?.slug || 'new'}
            initial={editing}
            existing={slugs}
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
