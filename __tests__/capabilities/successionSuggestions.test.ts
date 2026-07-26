import assert from 'node:assert/strict'
import test from 'node:test'
import type { Garden, GardenTask } from '../../types'
import { checkEmptySpaceOpportunity } from '../../logic/successionEngine'
import { getAllMasterSheets } from '../../services/plantMasterService'

function garden(overrides: Partial<Garden> = {}): Garden {
  return {
    id: 'garden-1',
    name: 'Orto Test',
    gardenType: 'OpenField',
    coordinates: { latitude: 41.9, longitude: 12.5 },
    ...overrides,
  } as Garden
}

function task(overrides: Partial<GardenTask> = {}): GardenTask {
  return {
    id: 'task-1',
    gardenId: 'garden-1',
    plantName: 'Pomodoro',
    taskType: 'Harvest',
    date: '2026-04-01T08:00:00+02:00',
    completed: false,
    lifecycleState: 'Production',
    ...overrides,
  } as GardenTask
}

test('checkEmptySpaceOpportunity reports the removed plant name distinct from the suggested one', () => {
  const allMasterSheets = getAllMasterSheets()
  const harvestTask = task()
  const suggestion = checkEmptySpaceOpportunity(harvestTask, allMasterSheets, garden(), new Date('2026-04-01T12:00:00+02:00'))

  assert.ok(suggestion, 'expected a succession suggestion for a Solanaceae harvest task')
  // Master sheet data stores commonName uppercase (verified empirically: 'POMODORO')
  assert.equal(suggestion!.removedPlantName, 'POMODORO')
  assert.equal(suggestion!.plant.commonName, 'ZUCCHINA')
  assert.notEqual(suggestion!.removedPlantName, suggestion!.plant.commonName)
})

test('checkEmptySpaceOpportunity returns null when the harvested plant is not in the master sheets', () => {
  const allMasterSheets = getAllMasterSheets()
  const harvestTask = task({ plantName: 'PiantaInesistenteXYZ' })
  const suggestion = checkEmptySpaceOpportunity(harvestTask, allMasterSheets, garden(), new Date('2026-04-01T12:00:00+02:00'))

  assert.equal(suggestion, null)
})
