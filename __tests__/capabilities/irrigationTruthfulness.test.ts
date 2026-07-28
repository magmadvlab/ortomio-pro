import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync(
  new URL('../../app/app/irrigation/page.tsx', import.meta.url),
  'utf8',
)
const dashboard = readFileSync(
  new URL('../../components/irrigation/ProfessionalIrrigationDashboard.tsx', import.meta.url),
  'utf8',
)
const wateringForm = readFileSync(
  new URL('../../components/irrigation/WateringLogForm.tsx', import.meta.url),
  'utf8',
)

test('irrigation page contains no demo KPIs, sample zones or development tabs', () => {
  assert.doesNotMatch(page, />85L</)
  assert.doesNotMatch(page, />15%</)
  assert.doesNotMatch(page, />68%</)
  assert.doesNotMatch(page, /Zona Pomodori|Zona Insalate|Zona Erbe Aromatiche/)
  assert.doesNotMatch(page, /Componente in sviluppo/)
  assert.doesNotMatch(page, /id: 'analytics'|id: 'scheduler'/)
  assert.doesNotMatch(page, /IrrigationConfigWizard|IrrigationAnalyticsModal/)
})

test('irrigation actions expose only destinations supplied by the live page', () => {
  assert.doesNotMatch(page, /onNavigateToAnalytics=|onNavigateToScheduler=/)
  assert.match(dashboard, /\{onNavigateToAnalytics && \(/)
  assert.match(dashboard, /\{onNavigateToScheduler && \(/)
  assert.match(page, /onZoneSelect=\{\(zone\) => \{[\s\S]*setSelectedZoneId\(zone\.id\)[\s\S]*setActiveTab\('systems'\)/)
})

test('watering form finalizes one execution path for single or batch logs', () => {
  assert.match(wateringForm, /if \(!selectedZone\?\.bedIds\?\.length \|\| selectedRowIds\.length === 0\) \{[\s\S]*await onSubmit\(/)
  assert.match(wateringForm, /\} else \{[\s\S]*for \(const log of logsToCreate\)[\s\S]*if \(onExecuted\) \{[\s\S]*await onExecuted\(logsToCreate\)/)
  assert.match(page, /onSubmit=\{async \(log\) => \{[\s\S]*executeWateringLogThroughUnifiedService\(storageProvider, log\)[\s\S]*finalizeWateringExecution\(\[log\]\)/)
})
