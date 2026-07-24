import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCalendarCells } from '../../lib/calendar/exportPDF'

test('calendar PDF cells align Monday-first and carry operational context', () => {
  const date = new Date(2026, 6, 1)
  const cells = buildCalendarCells({
    month: 7,
    year: 2026,
    tasks: [{ date, title: 'Irriga', type: 'Irrigation', completed: false }],
    weather: [{ date, temp_max: 31, icon: '☀️' }],
    lunarPhases: [{ date, phase: 'Calante', emoji: '🌘' }],
    almanacco: [{ date, proverbio: 'Proverbio verificato' }],
  })

  assert.equal(cells.length, 31)
  assert.equal(cells[0].column, 2)
  assert.equal(cells[0].tasks[0].title, 'Irriga')
  assert.equal(cells[0].weather?.temp_max, 31)
  assert.equal(cells[0].lunarPhase?.phase, 'Calante')
  assert.equal(cells[0].almanacco?.proverbio, 'Proverbio verificato')
})
