import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toPersistedOrchardType,
  toPersistedVineyardTrainingSystem,
  toPersistedVineyardType,
} from '../../components/crops/orchardWizardMappings';

test('maps every UI orchard category to a supported persisted type', () => {
  assert.equal(toPersistedOrchardType('DRUPACEE'), 'mixed');
  assert.equal(toPersistedOrchardType('POMACEE'), 'mixed');
  assert.equal(toPersistedOrchardType('AGRUMI'), 'citrus');
  assert.equal(toPersistedOrchardType('FRUTTA_GUSCIO'), 'mixed');
  assert.equal(toPersistedOrchardType('MEDITERRANEA'), 'mixed');
  assert.equal(toPersistedOrchardType('KIWI'), 'mixed');
  assert.equal(toPersistedOrchardType('ESOTICHE'), 'tropical');
});

test('normalizes vineyard selections to the service contract', () => {
  assert.equal(toPersistedVineyardType('WINE'), 'wine');
  assert.equal(toPersistedVineyardType('TABLE'), 'table');
  assert.equal(toPersistedVineyardTrainingSystem('Guyot'), 'guyot');
  assert.equal(toPersistedVineyardTrainingSystem('Cordon'), 'cordon');
  assert.equal(toPersistedVineyardTrainingSystem('Alberello'), 'other');
  assert.equal(toPersistedVineyardTrainingSystem('GDC'), 'other');
});
