import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import type { MechanicalWorkRecord } from '../../types'
import { calculateMechanicalWorkStats } from '../../lib/mechanical-work/mechanicalWorkStats'

const work = (overrides: Partial<MechanicalWorkRecord>): MechanicalWorkRecord => ({
  id: 'work-1',
  garden_id: 'garden-1',
  work_type: 'Tilling',
  work_date: '2026-07-28',
  area_m2: 100,
  created_at: '2026-07-28T08:00:00Z',
  ...overrides,
})

test('mechanical analytics expose only observed persisted measures', () => {
  const stats = calculateMechanicalWorkStats([
    work({
      id: 'with-cost',
      equipment_type: 'Tractor',
      work_metadata: { standardCost: 80 },
    }),
    work({
      id: 'without-cost',
      work_type: 'Harrowing',
      area_m2: 50,
      equipment_type: 'Manual',
    }),
  ], new Date('2026-07-28T12:00:00Z'))

  assert.equal(stats.totalOperations, 2)
  assert.equal(stats.totalAreaSqm, 150)
  assert.equal(stats.equipmentTypes, 2)
  assert.equal(stats.monthlyObservedCost, 80)
  assert.deepEqual(stats.operationsByType, [
    { type: 'Harrowing', count: 1 },
    { type: 'Tilling', count: 1 },
  ])
})

test('missing cost evidence stays unavailable instead of becoming zero', () => {
  const stats = calculateMechanicalWorkStats([
    work({ work_metadata: undefined }),
  ], new Date('2026-07-28T12:00:00Z'))

  assert.equal(stats.monthlyObservedCost, null)
})

test('mechanical work page contains no in-memory equipment or dead report actions', () => {
  const source = readFileSync(
    new URL('../../app/app/mechanical-work/page.tsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /storageProvider\.getMechanicalWorks\(activeGarden\.id\)/)
  assert.match(source, /storageProvider\.createMechanicalWork\(/)
  assert.doesNotMatch(source, /loadEquipment|EquipmentModal|MechanicalWorkWizard/)
  assert.doesNotMatch(source, /Modifica|Visualizza Calendario|Esporta Report/)
  assert.doesNotMatch(source, /efficiency:\s*0|fuelUsed:\s*0|monthlyTrend:\s*\[0,\s*0,\s*0\]/)
})
