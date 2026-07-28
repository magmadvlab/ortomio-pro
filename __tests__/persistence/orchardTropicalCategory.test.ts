import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getDefaultFruitTreeCategory,
  synchronizeOrchardTypeWithCategory,
} from '../../lib/orchard/orchardCategory'

test('tropical orchard defaults to the exotic fruit-tree subcategory', () => {
  assert.equal(getDefaultFruitTreeCategory('tropical'), 'ESOTICHE')
  assert.equal(getDefaultFruitTreeCategory('apple'), '')
})

test('exotic category persists as tropical without changing other orchard types', () => {
  assert.equal(synchronizeOrchardTypeWithCategory('mixed', 'ESOTICHE'), 'tropical')
  assert.equal(synchronizeOrchardTypeWithCategory('apple', 'POMACEE'), 'apple')
})

test('leaving the exotic category removes the stale tropical classification', () => {
  assert.equal(synchronizeOrchardTypeWithCategory('tropical', ''), 'mixed')
  assert.equal(synchronizeOrchardTypeWithCategory('tropical', 'MEDITERRANEA'), 'mixed')
})
