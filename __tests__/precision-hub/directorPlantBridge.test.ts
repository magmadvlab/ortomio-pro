import test from 'node:test'
import assert from 'node:assert/strict'

import { mapUnhealthyPlantsToAlerts } from '@/services/directorService'
import type { GardenPlant } from '@/types/individualPlant'

function makePlant(overrides: Partial<GardenPlant>): GardenPlant {
  return {
    id: 'plant-1',
    gardenId: 'garden-1',
    positionInRow: 1,
    plantCode: 'F1-P001',
    plantName: 'Pomodoro',
    status: 'healthy',
    healthScore: 90,
    photos: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

test('mapUnhealthyPlantsToAlerts returns empty array when all plants are healthy', () => {
  const plants: GardenPlant[] = [
    makePlant({ id: 'plant-1', status: 'healthy', healthScore: 95 }),
    makePlant({ id: 'plant-2', status: 'healthy', healthScore: 80 }),
  ]
  const alerts = mapUnhealthyPlantsToAlerts(plants)
  assert.equal(alerts.length, 0)
})

test('mapUnhealthyPlantsToAlerts returns alert for diseased plant', () => {
  const plants: GardenPlant[] = [
    makePlant({ id: 'plant-sick', status: 'diseased', plantName: 'Basilico', healthScore: 40 }),
  ]
  const alerts = mapUnhealthyPlantsToAlerts(plants)
  assert.equal(alerts.length, 1)
  const alert = alerts[0]
  assert.equal(alert.plantId, 'plant-sick')
  assert.equal(alert.gardenId, 'garden-1')
  assert.equal(alert.alertType, 'disease')
  assert.equal(alert.severity, 'warning')
  assert.equal(alert.resolved, false)
  assert.ok(alert.title.length > 0)
  assert.ok(alert.message.length > 0)
  assert.ok(alert.id.length > 0)
  assert.ok(alert.createdAt.length > 0)
})

test('mapUnhealthyPlantsToAlerts returns critical alert for plant with very low healthScore', () => {
  const plants: GardenPlant[] = [
    makePlant({ id: 'plant-critical', status: 'diseased', plantName: 'Zucchina', healthScore: 15 }),
  ]
  const alerts = mapUnhealthyPlantsToAlerts(plants)
  assert.equal(alerts.length, 1)
  assert.equal(alerts[0].severity, 'critical')
})

test('mapUnhealthyPlantsToAlerts filters out harvested and transplanted plants', () => {
  const plants: GardenPlant[] = [
    makePlant({ id: 'plant-harvested', status: 'harvested' }),
    makePlant({ id: 'plant-transplanted', status: 'transplanted' }),
    makePlant({ id: 'plant-dead', status: 'dead', plantName: 'Lattuga' }),
  ]
  const alerts = mapUnhealthyPlantsToAlerts(plants)
  // Only dead plant generates alert; harvested/transplanted are terminal states without disease alert
  const ids = alerts.map(a => a.plantId)
  assert.ok(!ids.includes('plant-harvested'), 'harvested should not generate alert')
  assert.ok(!ids.includes('plant-transplanted'), 'transplanted should not generate alert')
})

test('mapUnhealthyPlantsToAlerts returns warning for dead plant', () => {
  const plants: GardenPlant[] = [
    makePlant({ id: 'plant-dead', status: 'dead', plantName: 'Peperone', healthScore: 0 }),
  ]
  const alerts = mapUnhealthyPlantsToAlerts(plants)
  assert.equal(alerts.length, 1)
  assert.equal(alerts[0].plantId, 'plant-dead')
  assert.equal(alerts[0].alertType, 'disease')
})

test('mapUnhealthyPlantsToAlerts handles empty array', () => {
  const alerts = mapUnhealthyPlantsToAlerts([])
  assert.equal(alerts.length, 0)
})
