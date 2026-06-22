import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  ensurePlantOperationLineageContext,
  extractRowScopeFromOperationContext,
} from '@/utils/plantOperationLineage'

describe('plantOperationLineage', () => {
  it('builds lineage chain with row scope when row id is provided', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-1',
      plantId: 'plant-1',
      fieldRowId: 'row-1',
      eventType: 'operation_write',
    })

    const identity = context.identity as Record<string, unknown>
    const lineage = context.lineage as Record<string, unknown>

    assert.equal(identity.gardenId, 'garden-1')
    assert.equal(identity.plantId, 'plant-1')
    assert.equal(identity.fieldRowId, 'row-1')
    assert.deepEqual(lineage.chain, ['garden', 'field_row', 'plant'])
    assert.equal(lineage.eventType, 'operation_write')
    assert.equal(lineage.onboardingRoot, 'garden')
  })

  it('preserves existing context fields while injecting lineage metadata', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-2',
      plantId: 'plant-2',
      operationContext: {
        season: 'spring',
        weather: {
          temperature: 24,
          humidity: 55,
          precipitation: 0,
          windSpeed: 3,
          condition: 'sereno',
          pressure: 1014,
        },
      },
    })

    assert.equal(context.season, 'spring')
    const weather = context.weather as Record<string, unknown>
    assert.equal(weather.temperature, 24)

    const lineage = context.lineage as Record<string, unknown>
    assert.equal(lineage.contextVersion, 'v1')
  })

  it('extracts row scope from normalized context', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-3',
      plantId: 'plant-3',
      gardenRowId: 'g-row-3',
    })

    const scope = extractRowScopeFromOperationContext(context)
    assert.equal(scope.gardenRowId, 'g-row-3')
    assert.equal(scope.fieldRowId, undefined)
  })

  it('extracts fieldRowId from context when gardenRowId is absent', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-4',
      plantId: 'plant-4',
      fieldRowId: 'f-row-4',
    })

    const scope = extractRowScopeFromOperationContext(context)
    assert.equal(scope.fieldRowId, 'f-row-4')
    assert.equal(scope.gardenRowId, undefined)
  })

  it('extracts both fieldRowId and gardenRowId when both are present', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-5',
      plantId: 'plant-5',
      fieldRowId: 'f-row-5',
      gardenRowId: 'g-row-5',
    })

    const scope = extractRowScopeFromOperationContext(context)
    assert.equal(scope.fieldRowId, 'f-row-5')
    assert.equal(scope.gardenRowId, 'g-row-5')
  })

  it('builds short lineage chain when no row id is provided', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-6',
      plantId: 'plant-6',
    })

    const lineage = context.lineage as Record<string, unknown>
    assert.deepEqual(lineage.chain, ['garden', 'plant'])
  })

  it('stores fieldRowId in identity and lineage when provided without gardenRowId', () => {
    const context = ensurePlantOperationLineageContext({
      gardenId: 'garden-7',
      plantId: 'plant-7',
      fieldRowId: 'f-row-7',
    })

    const identity = context.identity as Record<string, unknown>
    const lineage = context.lineage as Record<string, unknown>

    assert.equal(identity.fieldRowId, 'f-row-7')
    assert.equal(identity.gardenRowId, null)
    assert.equal(lineage.fieldRowId, 'f-row-7')
    assert.equal(lineage.gardenRowId, null)
    assert.deepEqual(lineage.chain, ['garden', 'field_row', 'plant'])
  })
})
