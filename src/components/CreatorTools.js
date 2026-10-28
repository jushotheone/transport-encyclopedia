'use client'
import { useMemo, useState } from 'react'
import Icon from '@/components/Icon'
import ExplorerCard from '@/components/ExplorerCard'
import { Question } from '@/components/ChallengeGame'
import { divisions } from '@/lib/divisions'
import { completeness } from '@/lib/health'
import { toChallengeRow, toSheetRow } from '@/lib/columns'
import { flagFor } from '@/lib/flags'
import { cleanChoice, quizProblem, resolveAnswers, slugify, splitChoices } from '@/lib/utils'
import { confetti } from '@/lib/confetti'
import { play } from '@/lib/sound'
import { toast } from '@/lib/toast'

const field = 'mt-1 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg font-bold text-zts-midnight outline-none focus:border-zts-blue'
const label = 'block text-sm font-extrabold uppercase tracking-wide text-zts-graphite/70'

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
    confetti({ count: 70, y: 0.5 })
    toast(done, 'ok')
  } catch {
    toast('Your browser would not let me copy. Select the text in the box below and copy it.', 'alert')
  }
}

function VehicleMaker({ existing }) {
  const [v, setV] = useState({ name: '', system: 'air', description: '', funFact: '', bonus_fact: '', manufacturers: '', origin_country: '', zions_note: '', zions_recommendation: '', image: '', video_url: '', custom_sound_url: '', learn_more: '', quiz_question: '', quiz_choices: '', quiz_answer: '' })
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const vehicle = useMemo(() => {
    const choices = splitChoices(v.quiz_choices)
    return {
      ...v,
      name: v.name.trim() || 'Your vehicle',
      slug: slugify(v.name) || 'your-vehicle',
      flag_emoji: flagFor(v.origin_country),
      manufacturers: v.manufacturers.split(',').map((s) => s.trim()).filter(Boolean),
      more_images: [],
      quiz_choices: choices,
    }
  }, [v])

  const progress = completeness(vehicle)
  const quizIssue = quizProblem(vehicle.quiz_question, vehicle.quiz_choices, vehicle.quiz_answer)
  const taken = existing.includes(vehicle.slug) && v.name.trim()
  const choices = vehicle.quiz_choices
  const ready = v.name.trim() && v.description.trim().length >= 10 && !taken && !quizIssue

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field id="vm-name" title="What is it called?">
          <input id="vm-name" className={field} value={v.name} onChange={set('name')} placeholder="Double-decker bus" />
          {taken && <p className="mt-1 text-sm font-bold text-red-600">That one is already in the game. Pick a different name, or edit it in the sheet.</p>}
        </Field>
        <Field id="vm-div" title="Which division?">
          <select id="vm-div" className={field} value={v.system} onChange={set('system')}>
            {divisions.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </Field>
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

        <details className="rounded-3xl bg-slate-50 p-4">
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

        <button type="button" disabled={!ready} onClick={() => copy(toSheetRow({ ...vehicle, quiz_question: v.quiz_question.trim() }), 'Copied! Now paste it into the first empty row of the Vehicles tab.')} className="w-full rounded-full bg-zts-orange px-6 py-4 text-lg font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-40">
          <Icon name="share" className="mr-2 h-5 w-5" />Copy this row for the sheet
        </button>
        <p className="text-sm text-zts-graphite/70">
          In the sheet, click the first empty box in column A of the <strong>Vehicles</strong> tab, then paste. Every column fills in for you.
          {!ready && ' Add a name and a description to switch the button on.'}
        </p>
      </div>
    </div>
  )
}

function QuestionMaker({ vehicles }) {
  const [c, setC] = useState({ vehicle: '', question: '', correct: '', w1: '', w2: '', w3: '', explanation: '' })
  const [picked, setPicked] = useState(null)
  const set = (k) => (e) => {
    setC((x) => ({ ...x, [k]: e.target.value }))
    setPicked(null)
  }
  const wrongs = [c.w1, c.w2, c.w3].map(cleanChoice).filter(Boolean)
  const q = useMemo(() => {
    const options = [{ label: cleanChoice(c.correct) || 'Your right answer', correct: true }, ...wrongs.map((w) => ({ label: w, correct: false }))]
    return {
      id: 'preview', level: 1, source: 'zion', authored: true, prompt: c.question || 'Your question appears here', quote: '',
      choices: options.sort((a, b) => a.label.localeCompare(b.label)), explain: c.explanation || cleanChoice(c.correct),
    }
  }, [c, wrongs])
  const dup = new Set([cleanChoice(c.correct), ...wrongs].map((s) => s.toLowerCase())).size !== wrongs.length + 1
  const ready = c.question.trim() && c.correct.trim() && wrongs.length >= 1 && !dup

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
        <button type="button" disabled={!ready} onClick={() => copy(toChallengeRow({ vehicle: c.vehicle, question: c.question, correct: cleanChoice(c.correct), wrongs, explanation: c.explanation }), 'Copied! Paste it into the first empty row of the Challenges tab.')} className="w-full rounded-full bg-zts-orange px-6 py-4 text-lg font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-40">
          <Icon name="share" className="mr-2 h-5 w-5" />Copy this question for the sheet
        </button>
        <p className="text-sm text-zts-graphite/70">Paste into column A of the <strong>Challenges</strong> tab. The last column already says <em>yes</em>, so it shows up in the game within a few minutes.</p>
      </div>
    </div>
  )
}

export default function CreatorTools({ vehicles }) {
  const [tab, setTab] = useState('vehicle')
  const slugs = vehicles.map((v) => v.slug)
  const tabBtn = (id) => `flex-1 rounded-2xl px-4 py-3 text-lg font-extrabold transition ${tab === id ? 'bg-zts-midnight text-white shadow-lg' : 'bg-white text-zts-midnight shadow'}`
  return (
    <div className="space-y-5">
      <div className="flex gap-2" role="tablist" aria-label="What would you like to make?">
        <button type="button" role="tab" aria-selected={tab === 'vehicle'} onClick={() => setTab('vehicle')} className={tabBtn('vehicle')}><Icon name="car" className="mr-2 h-5 w-5" />New vehicle</button>
        <button type="button" role="tab" aria-selected={tab === 'question'} onClick={() => setTab('question')} className={tabBtn('question')}><Icon name="pencil" className="mr-2 h-5 w-5" />New question</button>
      </div>
      {tab === 'vehicle' ? <VehicleMaker existing={slugs} /> : <QuestionMaker vehicles={vehicles} />}
    </div>
  )
}
