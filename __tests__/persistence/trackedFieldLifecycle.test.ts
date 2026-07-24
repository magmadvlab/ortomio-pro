import assert from 'node:assert/strict'
import test from 'node:test'

import { createTrackedField } from '../../services/trackedFieldService'

const config = {
  rowCount: 2,
  rowLengthMeters: 1,
  plantSpacingCm: 50,
  rowSpacingCm: 150,
  plantName: 'Pomodoro',
  variety: 'San Marzano',
  plantingDate: '2026-07-24',
  zoneName: 'Campo',
  orientation: 'N-S' as const,
}

test('tracked field persists rows and individual plants', async () => {
  const rows: any[] = []
  const plants: any[] = []
  const storage = {
    createFieldRow: async (row: any) => {
      const created = { ...row, id: `row-${rows.length + 1}` }
      rows.push(created)
      return created
    },
    deleteFieldRow: async () => {},
    createIndividualPlant: async (plant: any) => {
      const created = { ...plant, id: `plant-${plants.length + 1}` }
      plants.push(created)
      return created
    },
    deleteIndividualPlant: async () => {},
  }

  const result = await createTrackedField(storage, 'garden-1', config)
  assert.equal(result.rows.length, 2)
  assert.equal(result.plants.length, 4)
  assert.deepEqual(result.plants.map(plant => plant.plantCode), [
    'F1-P001', 'F1-P002', 'F2-P001', 'F2-P002',
  ])
})

test('tracked field compensates persisted records after a partial failure', async () => {
  const deletedRows: string[] = []
  const deletedPlants: string[] = []
  let plantSequence = 0
  const storage = {
    createFieldRow: async (row: any) => ({ ...row, id: 'row-1' }),
    deleteFieldRow: async (id: string) => { deletedRows.push(id) },
    createIndividualPlant: async (plant: any) => {
      plantSequence += 1
      if (plantSequence === 2) throw new Error('database unavailable')
      return { ...plant, id: `plant-${plantSequence}` }
    },
    deleteIndividualPlant: async (id: string) => { deletedPlants.push(id) },
  }

  await assert.rejects(
    createTrackedField(storage, 'garden-1', { ...config, rowCount: 1 }),
    /database unavailable/
  )
  assert.deepEqual(deletedPlants, ['plant-1'])
  assert.deepEqual(deletedRows, ['row-1'])
})
