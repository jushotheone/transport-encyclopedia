// The "Vehicles" tab, column by column. Adding a column? Add it to the END of the sheet and to this list,
// so existing positions never move. Pure data, so the Creator Hub (browser) can share it with the sheet reader.
export const COLUMNS = [
  'name', 'slug', 'system', 'image', 'description', 'funFact', 'manufacturers', 'more_images', 'video_url',
  'zions_note', 'origin_country', 'flag_emoji', 'bonus_fact', 'learn_more', 'quiz_question', 'quiz_choices',
  'quiz_answer', 'custom_sound_url', 'zions_recommendation',
]

const flat = (x) => String(x ?? '').replace(/[\t\r\n]+/g, ' ').trim()

// One vehicle as a list of cells, one per column, in sheet order.
export function toCells(v) {
  const cell = {
    ...v,
    manufacturers: (v.manufacturers || []).join(', '),
    more_images: (v.more_images || []).join(', '),
    quiz_choices: (v.quiz_choices || []).join(' | '),
  }
  return COLUMNS.map((c) => flat(cell[c]))
}

// The same row as tab-separated text: paste it into an empty row of the sheet and it fills every column.
export const toSheetRow = (v) => toCells(v).join('\t')

export const CHALLENGE_COLUMNS = ['vehicle slug', 'question', 'right answer', 'wrong 1', 'wrong 2', 'wrong 3', 'explanation', 'approved']

// One written challenge as a list of cells for the "Challenges" tab.
export function toChallengeCells({ vehicle = '', question, correct, wrongs = [], explanation = '', approved = 'yes' }) {
  const w = [...wrongs, '', '', ''].slice(0, 3)
  return [vehicle, question, correct, ...w, explanation, approved].map(flat)
}

// One written challenge as a tab-separated row for the optional "Challenges" tab.
export const toChallengeRow = (c) => toChallengeCells(c).join('\t')
