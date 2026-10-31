'use client'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import ExplorerCard from '@/components/ExplorerCard'
import VoiceInput from '@/components/VoiceInput'
import { ZionAvatar } from '@/components/Zion'
import { divisions } from '@/lib/divisions'
import { completeness } from '@/lib/health'
import { toSheetRow } from '@/lib/columns'
import { flagFor } from '@/lib/flags'
import { assembleQuiz, disassembleQuiz, firstMissingStep, nextTier, quickQuiz, quizProblem, STEPS, stepDone, suggestions, TIERS, tierFor } from '@/lib/creatorQuest'
import { slugify, splitChoices } from '@/lib/utils'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'
import { recordCreated } from '@/lib/explorer'
import { publishVehicle, updateVehicle } from '@/app/creator/actions'

const box = 'w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-zts-midnight outline-none focus:border-zts-blue'
const chip = (on) => `rounded-full px-4 py-2 text-base font-extrabold shadow-sm transition ${on ? 'bg-zts-blue text-white' : 'bg-white text-zts-midnight hover:bg-sky-50'}`

const BLANK = { name: '', system: 'air', description: '', funFact: '', bonus_fact: '', manufacturers: '', origin_country: '', zions_note: '', zions_recommendation: '', image: '', video_url: '', custom_sound_url: '', learn_more: '', quiz_question: '', quiz_choices: '', quiz_answer: '' }

const toForm = (v) => ({
  ...BLANK,
  ...Object.fromEntries(Object.keys(BLANK).map((k) => [k, v[k] ?? ''])),
  manufacturers: (v.manufacturers || []).join(', '),
  quiz_choices: (v.quiz_choices || []).join('\n'),
})

// The card, in a frame that changes as it gets more complete.
export function TierCard({ vehicle, pct }) {
  const tier = tierFor(pct)
  const up = nextTier(pct)
  return (
    <div className="mx-auto w-full max-w-[268px]">
      <div className="rounded-[22px] p-[5px] shadow-xl transition-all duration-500" style={{ background: tier.ring, backgroundSize: tier.id === 'legendary' ? '300% 300%' : undefined }}>
        <div className="flex justify-center rounded-[18px] bg-zts-midnight p-2"><ExplorerCard vehicle={vehicle} flippable /></div>
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-lg font-extrabold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white" style={{ color: tier.text }}><Icon name={tier.icon} className="h-5 w-5" /></span>
        {tier.name} card
      </p>
      <p className="text-center text-sm font-bold text-white/70">{up ? `Add a few more things to reach ${up.name}.` : 'The top level. Amazing!'}</p>
    </div>
  )
}

function Ask({ children }) {
  return (
    <div className="flex items-start gap-3">
      <ZionAvatar className="h-12 w-12 shrink-0" />
      <p className="rounded-2xl rounded-tl-sm bg-white p-3 text-lg font-extrabold text-zts-midnight shadow">{children}</p>
    </div>
  )
}

function QuizStep({ v, setV, vehicle, sugg }) {
  const [round, setRound] = useState(0) // changes when a ready-made quiz is dropped in, to reset the boxes
  const start = useMemo(() => disassembleQuiz(v.quiz_question, v.quiz_choices, v.quiz_answer), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [q, setQ] = useState(start)
  const apply = (next) => {
    setQ(next)
    setV((x) => ({ ...x, ...assembleQuiz(next) }))
  }
  const quick = (kind) => {
    const made = quickQuiz(kind, vehicle, sugg)
    if (!made) return toast(kind === 'country' ? 'Add the country first.' : 'Add who builds it first.', 'star')
    play('good')
    setRound((r) => r + 1)
    apply({ ...made, wrongs: [0, 1, 2].map((i) => made.wrongs[i] || '') })
  }
  const choices = splitChoices(v.quiz_choices)
  const problem = v.quiz_question ? quizProblem(v.quiz_question, choices, v.quiz_answer) : null
  return (
    <div className="space-y-3" key={round}>
      <p className="font-extrabold text-zts-midnight">One tap quizzes</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip(false)} onClick={() => quick('country')}><Icon name="globe" className="mr-1.5 h-4 w-4" />From its country</button>
        <button type="button" className={chip(false)} onClick={() => quick('maker')}><Icon name="factory" className="mr-1.5 h-4 w-4" />From who builds it</button>
      </div>
      <p className="pt-2 font-extrabold text-zts-midnight">Or write your own</p>
      <label className="block text-sm font-extrabold uppercase text-zts-graphite/70" htmlFor="q-q">Question</label>
      <VoiceInput id="q-q" multiline={false} value={q.question} onChange={(t) => apply({ ...q, question: t })} placeholder="What is the fastest…?" />
      <label className="block text-sm font-extrabold uppercase text-green-700" htmlFor="q-r">The right answer</label>
      <input id="q-r" className={`${box} border-green-300`} value={q.right} onChange={(e) => apply({ ...q, right: e.target.value })} />
      {[0, 1, 2].map((i) => (
        <div key={i}>
          <label className="block text-sm font-extrabold uppercase text-red-700" htmlFor={`q-w${i}`}>Wrong answer {i + 1}{i > 0 ? ' (optional)' : ''}</label>
          <input id={`q-w${i}`} className={`${box} border-red-200`} value={q.wrongs[i]} onChange={(e) => apply({ ...q, wrongs: q.wrongs.map((w, j) => (j === i ? e.target.value : w)) })} />
        </div>
      ))}
      {problem && <p className="text-sm font-bold text-red-600">{problem}</p>}
    </div>
  )
}

export default function VehicleQuest({ initial, vehicles, canPublish, onPublished, onBack }) {
  const router = useRouter()
  const [v, setV] = useState(initial ? toForm(initial) : BLANK)
  const [step, setStep] = useState(initial ? null : -1) // -1 = name and division (new vehicles only)
  const [errors, setErrors] = useState([])
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const set = (k) => (val) => setV((x) => ({ ...x, [k]: typeof val === 'string' ? val : val.target.value }))
  const sugg = useMemo(() => suggestions(vehicles), [vehicles])

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
  const tier = tierFor(progress.pct)
  const taken = !initial && v.name.trim() && vehicles.some((x) => x.slug === vehicle.slug)
  const quizIssue = quizProblem(vehicle.quiz_question, vehicle.quiz_choices, v.quiz_answer)
  const ready = v.name.trim() && v.description.trim().length >= 15 && !taken && !quizIssue

  // Start editing where the work is needed.
  useEffect(() => {
    if (initial) setStep(firstMissingStep(progress.items))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Level-up moment: only when the card moves up a tier.
  const tierIndex = TIERS.findIndex((t) => t.id === tier.id)
  const lastIndex = useRef(tierIndex)
  useEffect(() => {
    if (tierIndex > lastIndex.current) {
      play('win')
      confetti({ count: 90, y: 0.4 })
      toast(`${tier.name} card! Nice work.`, 'trophy')
    }
    lastIndex.current = tierIndex
  }, [tierIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // A gentle nudge after five minutes: stopping is allowed.
  useEffect(() => {
    const t = setTimeout(() => toast('Five minutes! Save your card and take a break, or keep going.', 'timer'), 5 * 60 * 1000)
    return () => clearTimeout(t)
  }, [])

  function save() {
    setErrors([])
    start(async () => {
      const input = { ...v, more_images: initial?.more_images || [] }
      const result = initial ? await updateVehicle(initial.slug, input) : await publishVehicle(input)
      if (!result.ok) {
        play('bad')
        return setErrors(result.errors)
      }
      const firstToday = recordCreated()
      play('win')
      confetti({ count: 140, y: 0.5 })
      toast(firstToday ? 'Saved! +10 points for creating today.' : 'Saved! It is live in the app.', 'rocket')
      setSaved(true)
      router.refresh()
      onPublished({ slug: result.slug, name: v.name.trim(), edited: Boolean(initial), tier: tier.name })
    })
  }

  const total = STEPS.length
  const s = step >= 0 ? STEPS[step] : null
  const ringPct = Math.round(((step < 0 ? 0 : step) / total) * 100)

  let body = null
  if (step === -1) {
    body = (
      <div className="space-y-4">
        <Ask>What is your new vehicle called?</Ask>
        <VoiceInput id="vq-name" multiline={false} value={v.name} onChange={set('name')} placeholder="Double-decker bus" />
        {taken && <p className="text-sm font-bold text-red-600">That one is already in the app. Go back and pick it from the list to add to it.</p>}
        <label className="block text-sm font-extrabold uppercase text-zts-graphite/70" htmlFor="vq-div">Which division?</label>
        <select id="vq-div" className={box} value={v.system} onChange={set('system')}>
          {divisions.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </div>
    )
  } else if (s) {
    const field = {
      description: <VoiceInput id="vq-f" rows={4} value={v.description} onChange={set('description')} />,
      funFact: <VoiceInput id="vq-f" rows={3} value={v.funFact} onChange={set('funFact')} />,
      zions_note: <VoiceInput id="vq-f" rows={3} value={v.zions_note} onChange={set('zions_note')} />,
      zions_recommendation: <VoiceInput id="vq-f" rows={2} value={v.zions_recommendation} onChange={set('zions_recommendation')} />,
      origin_country: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {sugg.countries.slice(0, 18).map((c) => (
              <button key={c} type="button" className={chip(v.origin_country === c)} onClick={() => { play('tap'); setV((x) => ({ ...x, origin_country: c })) }}>{flagFor(c)} {c}</button>
            ))}
          </div>
          <input aria-label="Another country" className={box} value={v.origin_country} onChange={set('origin_country')} placeholder="Or type another country" />
        </div>
      ),
      manufacturers: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {sugg.makers.slice(0, 16).map((m) => {
              const list = vehicle.manufacturers
              const on = list.includes(m)
              return (
                <button key={m} type="button" className={chip(on)} aria-pressed={on} onClick={() => { play('tap'); setV((x) => ({ ...x, manufacturers: (on ? list.filter((y) => y !== m) : [...list, m]).join(', ') })) }}>{m}</button>
              )
            })}
          </div>
          <input aria-label="Companies" className={box} value={v.manufacturers} onChange={set('manufacturers')} placeholder="Or type a company. Use commas for more than one" />
        </div>
      ),
      quiz: <QuizStep v={v} setV={setV} vehicle={vehicle} sugg={sugg} />,
      extras: (
        <div className="space-y-3">
          {[['image', 'Photo link', 'https://…'], ['custom_sound_url', 'Sound link', 'https://…'], ['video_url', 'YouTube video link', 'https://youtu.be/…'], ['learn_more', 'Learn more links', 'Websites a grown-up approves, with commas']].map(([k, t, ph]) => (
            <div key={k}>
              <label className="block text-sm font-extrabold uppercase text-zts-graphite/70" htmlFor={`vq-${k}`}>{t}</label>
              <input id={`vq-${k}`} className={box} value={v[k]} onChange={set(k)} placeholder={ph} />
            </div>
          ))}
        </div>
      ),
    }[s.key]
    body = (
      <div className="space-y-4">
        <Ask>{s.ask}</Ask>
        {field}
      </div>
    )
  }

  const canNext = step === -1 ? v.name.trim() && !taken : true
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {initial && (
          <p className="rounded-2xl bg-white p-3 text-xl font-extrabold text-zts-midnight shadow">
            {initial.name} <span className="text-base text-zts-graphite/70">· {divisions.find((d) => d.slug === initial.system)?.name}</span>
          </p>
        )}
        <nav aria-label="Steps" className="flex flex-wrap items-center gap-1.5">
          {STEPS.map((x, i) => (
            <button key={x.key} type="button" onClick={() => setStep(i)} aria-label={x.title} aria-current={i === step} disabled={step === -1 && !v.name.trim()}
              className={`h-3.5 rounded-full transition-all ${i === step ? 'w-8 bg-zts-orange' : stepDone(x, progress.items) ? 'w-3.5 bg-green-500' : 'w-3.5 bg-slate-300'}`} />
          ))}
          <span className="ml-auto text-sm font-extrabold text-zts-graphite/70">{step >= 0 ? `${step + 1} of ${total}` : 'Start'}</span>
        </nav>
        {s && <h3 className="text-2xl font-extrabold text-zts-midnight">{s.title}</h3>}
        <div role="progressbar" aria-valuenow={ringPct} aria-valuemin={0} aria-valuemax={100} aria-label="Quest progress" className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-zts-orange transition-all" style={{ width: `${ringPct}%` }} />
        </div>
        {body}
        <div className="flex gap-3 pt-2">
          {(step > 0 || (step === 0 && !initial)) && <button type="button" onClick={() => setStep(step - 1)} className="rounded-full bg-slate-200 px-5 py-3 font-extrabold text-zts-midnight hover:bg-slate-300"><Icon name="back" className="mr-1.5 h-4 w-4" />Back</button>}
          {step < total - 1 && (
            <button type="button" disabled={!canNext} onClick={() => { play('tap'); setStep(step + 1) }} className="ml-auto rounded-full bg-zts-blue px-6 py-3 text-lg font-extrabold text-white shadow hover:brightness-110 disabled:opacity-40">
              {s && !stepDone(s, progress.items) ? 'Skip for now' : 'Next'}<Icon name="next" className="ml-1.5 h-4 w-4" />
            </button>
          )}
        </div>
        <button type="button" onClick={onBack} className="text-sm font-bold text-zts-graphite/70 underline">Back to the vehicle list</button>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <div className="rounded-3xl bg-zts-midnight p-5 text-white shadow-xl">
          <p className="text-center text-sm font-extrabold uppercase tracking-wide text-white/70">Your card, live</p>
          <div className="mt-3"><TierCard vehicle={{ ...vehicle, system: v.system }} pct={progress.pct} /></div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100} aria-label="How complete this card is">
            <div className="h-full rounded-full bg-gradient-to-r from-zts-blue to-zts-orange transition-all" style={{ width: `${progress.pct}%` }} />
          </div>
          <p className="mt-1 text-sm font-bold">{progress.done} of {progress.total} things added</p>
        </div>

        {errors.length > 0 && (
          <ul role="alert" className="space-y-1 rounded-2xl bg-red-50 p-3 font-bold text-red-700">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        )}
        {canPublish ? (
          <button type="button" disabled={!ready || pending || saved} onClick={save} className="w-full rounded-full bg-green-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-40">
            <Icon name="rocket" className="mr-2 h-5 w-5" />{pending ? 'Saving…' : initial ? 'Save my card' : 'Publish my card'}
          </button>
        ) : (
          <button type="button" disabled={!ready} onClick={() => navigator.clipboard?.writeText(toSheetRow({ ...vehicle, quiz_answer: v.quiz_answer })).then(() => toast('Copied! Paste it into the first empty row of the Vehicles tab.', 'share'))} className="w-full rounded-full bg-zts-orange px-6 py-4 text-lg font-extrabold text-white shadow-lg disabled:opacity-40">
            <Icon name="share" className="mr-2 h-5 w-5" />Copy this row for the sheet
          </button>
        )}
        {!ready && <p className="text-sm text-zts-graphite/70">{taken ? 'That name is taken.' : quizIssue ? 'Finish or clear the quiz to save.' : 'Add a name and a description of a sentence or two to switch the button on.'} You can save at any step.</p>}
      </div>
    </div>
  )
}
