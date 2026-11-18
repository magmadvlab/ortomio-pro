import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generatePlantReportPDF } from '../../lib/reports/exportReportPDF'

test('plant report retains operations, costs and totals after PDF library upgrade', async () => {
  const pdf = await generatePlantReportPDF({ plantName: 'Pomodoro fixture', variety: 'San Marzano', plantingDate: '2026-05-01', location: 'Filare prova', totalCost: 42, totalYield: 15, qualityScore: 8, cycleLength: 100, operations: [{ date: '2026-05-02', type: 'Semina', description: 'Operazione verificata', cost: 12 }], costBreakdown: { seeds: 12, fertilizers: 10, treatments: 0, labor: 15, water: 5, other: 0 }, economicSummary: { totalRevenue: 75, totalCosts: 42, netProfit: 33, roi: 78.6 } })
  const bytes = Buffer.from(await pdf.arrayBuffer())
  assert.ok(bytes.length > 1000)
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
  if (spawnSync('pdftotext', ['-v']).status === 0) {
    const directory = mkdtempSync(join(tmpdir(), 'ortomio-pdf-test-'))
    try {
      const file = join(directory, 'report.pdf'); writeFileSync(file, bytes)
      const text = execFileSync('pdftotext', [file, '-'], { encoding: 'utf8' })
      assert.match(text, /Pomodoro fixture/)
      assert.match(text, /Operazione verificata/)
      assert.match(text, /42\.00/)
      assert.match(text, /78\.6%/)
    } finally { rmSync(directory, { recursive: true }) }
  }
})
