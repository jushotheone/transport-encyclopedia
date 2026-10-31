// A practice "spreadsheet" kept in a temporary file, used only when Google is not connected (local development).
// It has the same shape as a Google worksheet, so the Creator Hub code path is identical.
import fs from 'fs'
import os from 'os'
import path from 'path'

const file = () => process.env.ZTS_DEV_STORE || path.join(os.tmpdir(), 'zts-dev-sheet.json')

function read() {
  try {
    return JSON.parse(fs.readFileSync(file(), 'utf8'))
  } catch {
    return {}
  }
}

export const devRows = (title) => (read()[title] || []).map((r) => [...r])

export function devSheet(title) {
  const load = () => read()[title] || []
  const save = (rows) => fs.writeFileSync(file(), JSON.stringify({ ...read(), [title]: rows }))
  let pending = null
  return {
    async getRows() {
      return load().map((cells, i) => ({ _rawData: cells, rowNumber: i + 2 }))
    },
    async addRow(values) {
      save([...load(), values.map(String)])
    },
    async loadCells() {
      pending = load()
    },
    getCell(rowIndex, colIndex) {
      const rows = pending || load()
      const at = rowIndex - 1 // sheet row 1 is the header row
      return {
        set stringValue(v) {
          rows[at][colIndex] = String(v)
        },
        set value(v) {
          rows[at][colIndex] = v == null ? '' : String(v)
        },
      }
    },
    async saveUpdatedCells() {
      if (pending) save(pending)
      pending = null
    },
  }
}
