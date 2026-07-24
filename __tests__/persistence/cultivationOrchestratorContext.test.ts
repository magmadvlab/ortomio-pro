import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const orchestrator = readFileSync(
  new URL('../../services/cultivationOrchestrator.ts', import.meta.url),
  'utf8'
)

test('cultivation plans restore their garden and botanical context', () => {
  assert.match(orchestrator, /const gardenType = await this\.resolveGardenType\(data\.garden_id\)/)
  assert.match(orchestrator, /await getPlantFamily\(plan\.plantName\)/)
  assert.match(orchestrator, /getArchetypeById\(plan\.archetypeId/)
  assert.doesNotMatch(orchestrator, /gardenType: 'OpenField'.*TODO/)
  assert.doesNotMatch(orchestrator, /family: 'Unknown'/)
})
