import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildWizardOrchardTrees,
  validateWizardOrchardTreeInputs,
} from '../../lib/orchard/orchardTreePayload'

test('wizard tree payload preserves camelCase scope for the bulk mapper', () => {
  const [tree] = buildWizardOrchardTrees(
    [{ treeNumber: ' A-01 ', variety: ' Avocado ' }],
    'orchard-1',
    'garden-1'
  )

  assert.equal(tree.orchardId, 'orchard-1')
  assert.equal(tree.gardenId, 'garden-1')
  assert.equal(tree.treeNumber, 'A-01')
  assert.equal(tree.variety, 'Avocado')
  assert.equal(tree.healthStatus, 'healthy')
  assert.equal(tree.isActive, true)
  assert.equal('orchard_id' in tree, false)
  assert.equal('garden_id' in tree, false)
})

test('wizard tree payload rejects incomplete identities instead of inventing them', () => {
  assert.throws(
    () => buildWizardOrchardTrees([{ treeNumber: 'A-01' }], 'orchard-1', 'garden-1'),
    /orchard_tree_identity_required:0/
  )
})

test('wizard tree payload requires both ownership scopes', () => {
  assert.throws(
    () => buildWizardOrchardTrees([], '', 'garden-1'),
    /orchard_tree_scope_required/
  )
})

test('wizard tree identities are validated before the orchard insert', () => {
  assert.throws(
    () => validateWizardOrchardTreeInputs([{ variety: 'Mango' }], 'garden-1'),
    /orchard_tree_identity_required:0/
  )

  const serviceSource = readFileSync(
    new URL('../../services/orchardService.ts', import.meta.url),
    'utf8'
  )
  const methodSource = serviceSource.slice(
    serviceSource.indexOf('async createOrchardFromWizard')
  )
  const validationIndex = methodSource.indexOf('validateWizardOrchardTreeInputs(wizardTrees, gardenId)')
  const insertIndex = methodSource.indexOf(".from('orchard_configurations')")
  assert.ok(validationIndex >= 0 && validationIndex < insertIndex)
})

test('wizard bulk failure compensates the newly-created orchard configuration', () => {
  const serviceSource = readFileSync(
    new URL('../../services/orchardService.ts', import.meta.url),
    'utf8'
  )

  assert.match(
    serviceSource,
    /catch \(treeError\)[\s\S]*?from\('orchard_configurations'\)[\s\S]*?\.delete\(\)[\s\S]*?throw treeError/
  )
  assert.match(serviceSource, /orchard_tree_bulk_failed_and_rollback_failed/)
})
