import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildInterventionInsert,
  buildInterventionUpdate,
} from '../../services/interventionService'

const scheduledDate = new Date('2026-07-27T08:30:00.000Z')
const now = new Date('2026-07-26T15:30:00.000Z')
const sourceContext = {
  sourceType: 'ndvi' as const,
  sourceData: { ndvi: 0.42 },
  zoneId: '00000000-0000-0000-0000-000000000001',
  zoneName: 'Zona nord',
  timestamp: new Date('2026-07-26T15:00:00.000Z'),
  urgency: 'high' as const,
}

test('intervention insert contains only columns from the SQL table', () => {
  const payload = buildInterventionInsert({
    type: 'scouting',
    title: 'Verifica stress',
    description: 'Controllo foglie',
    zoneId: sourceContext.zoneId,
    zoneName: sourceContext.zoneName,
    scheduledDate,
    priority: 'high',
    sourceContext,
    parameters: { fieldRowId: 'row-1' },
    status: 'scheduled',
    gardenId: '00000000-0000-0000-0000-000000000002',
  }, '00000000-0000-0000-0000-000000000003', now)

  assert.deepEqual(Object.keys(payload).sort(), [
    'assigned_to',
    'completed_at',
    'created_at',
    'description',
    'garden_id',
    'id',
    'parameters',
    'priority',
    'scheduled_date',
    'source_context',
    'status',
    'title',
    'type',
    'updated_at',
    'user_id',
    'zone_id',
    'zone_name',
  ])
  assert.equal(payload.scheduled_date, scheduledDate.toISOString())
  assert.equal(payload.created_at, now.toISOString())
  assert.equal('scheduledDate' in payload, false)
  assert.equal('sourceContext' in payload, false)
})

test('intervention update maps changed application fields to SQL columns', () => {
  const payload = buildInterventionUpdate({
    scheduledDate,
    assignedTo: 'Mario',
    zoneId: sourceContext.zoneId,
    sourceContext,
    status: 'in_progress',
  }, now)

  assert.deepEqual(payload, {
    updated_at: now.toISOString(),
    zone_id: sourceContext.zoneId,
    scheduled_date: scheduledDate.toISOString(),
    assigned_to: 'Mario',
    status: 'in_progress',
    source_context: sourceContext,
  })
})
