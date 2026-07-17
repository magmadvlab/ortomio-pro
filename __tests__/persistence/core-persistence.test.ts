import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { OperationalDiaryService } from '@/services/operationalDiaryService'
import { createUnifiedAgronomicMemoryService } from '@/services/unifiedAgronomicMemoryService'
import { createBulkOperation, updatePlantsHealthAfterTreatment } from '@/services/plantOperationsService'
import { registerTreatment, checkSafetyInterval } from '@/services/treatmentRegistryService'
import { addPhytoProduct, getPhytoInventory } from '@/services/phytoInventoryService'
import { bioFungicides } from '@/data/phytoproducts'
import type { DiaryEvent } from '@/types/diary'

test('diary write is re-read and survives service recreation', async () => {
  const rows: DiaryEvent[] = []
  const storage = {
    async getDiaryEvents(gardenId: string) { return rows.filter(row => row.gardenId === gardenId && row.status === 'active') },
    async createDiaryEvent(input: any) { const now = new Date().toISOString(); const row = { ...input, id: 'event-1', status: 'active', revision: 1, createdAt: now, updatedAt: now }; rows.push(row); return row },
    async updateDiaryEvent() { throw new Error('unused') },
    async voidDiaryEvent() { throw new Error('unused') },
  }
  const first = new OperationalDiaryService(storage)
  await first.addEntry('garden-1', { date: '2026-07-17', time: '10:00', type: 'observation', category: 'care', title: 'Controllo', description: 'Osservazione reale', source: 'manual', verified: true })
  const afterRestart = new OperationalDiaryService(storage)
  assert.equal((await afterRestart.getEntries('garden-1')).length, 1)
})

test('critical diary writes fail closed without cloud capability', async () => {
  await assert.rejects(() => new OperationalDiaryService().addEntry('garden-1', { date: '2026-07-17', time: '10:00', type: 'observation', category: 'care', title: 'No fallback', description: '', source: 'manual', verified: true }), /Cloud diary capability unavailable/)
})

test('plant, treatment and inventory writers reject browser-local persistence', async () => {
  const local = { persistenceKind: 'local' as const } as any
  const plantResult = await createBulkOperation(local, 'garden-1', { operationType: 'watering', operationDate: '2026-07-17', plantIds: ['p-1'] })
  assert.equal(plantResult.success, false)
  assert.match(plantResult.errors?.[0] || '', /durable cloud storage/)
  await assert.rejects(() => registerTreatment(local, 'garden-1', { product: bioFungicides[0], plantName: 'Pomodoro', treatmentDate: new Date(), dosage: '20 g', applicationMethod: 'foliar', targetPestDisease: 'peronospora' }), /durable cloud storage/)
  await assert.rejects(() => getPhytoInventory(local, 'garden-1'), /durable cloud storage/)
})

test('agronomic memory writes through canonical event storage, not preferences', async () => {
  const events: any[] = []
  const service = createUnifiedAgronomicMemoryService({ async createAgronomicMemoryEvent(event: any) { events.push(event); return event }, async getAgronomicMemoryEvents() { return events } } as any)
  await service.appendEvent({ gardenId: 'garden-1', type: 'outcome', sourceService: 'test', summary: 'Measured outcome', payload: { confidence: 0.9 } })
  assert.equal(events.length, 1)
})

test('bulk plant operation is idempotent at the writer boundary and does not assume health improvement', async () => {
  const rows = new Map<string, any>()
  const storage = {
    async createPlantOperation(input: any) { const id = input.idempotencyKey; const row = rows.get(id) || { ...input, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; rows.set(id, row); return row },
    async getPlantOperations(plantId: string) { return [...rows.values()].filter(row => row.plantId === plantId) },
  }
  const operation = { operationType: 'treatment' as const, operationDate: '2026-07-17', plantIds: ['plant-1'] }
  await createBulkOperation(storage, 'garden-1', operation)
  await createBulkOperation(storage, 'garden-1', operation)
  assert.equal(rows.size, 1)
  await assert.rejects(() => updatePlantsHealthAfterTreatment(), /measured observation outcome/)
})

test('treatment register derives and preserves the safety interval', async () => {
  let saved: any
  const storage = {
    async createTreatment(input: any) { saved = { ...input, id: 't-1', user_id: 'u-1', created_at: '2026-07-17T00:00:00Z' }; return saved },
    async getTreatment() { return saved },
    async getTreatments() { return saved ? [saved] : [] },
  }
  const record = await registerTreatment(storage, 'garden-1', { product: bioFungicides[0], plantName: 'Pomodoro', treatmentDate: new Date('2026-07-17T00:00:00Z'), dosage: '20 g', applicationMethod: 'foliar', targetPestDisease: 'peronospora' })
  assert.equal(record.safetyIntervalEndDate.toISOString().slice(0, 10), '2026-07-24')
  assert.equal(checkSafetyInterval(record, new Date('2026-07-20T00:00:00Z')), true)
})

test('treatment inventory changes only after confirmed execution', async () => {
  let saved: any
  const item: any = { id: 'stock-1', garden_id: 'garden-1', quantity: 5 }
  const storage: any = {
    async createTreatment(input: any) { saved = { ...input, id: 't-2', user_id: 'u-1', created_at: new Date().toISOString() }; return saved },
    async getTreatment() { return saved }, async getTreatments() { return saved ? [saved] : [] },
    async getPhytoInventoryItem() { return item }, async updatePhytoInventoryItem(_id: string, updates: any) { Object.assign(item, updates); return item },
  }
  const base = { product: bioFungicides[0], plantName: 'Pomodoro', treatmentDate: new Date(), dosage: '20 g', applicationMethod: 'foliar', targetPestDisease: 'peronospora', inventoryUsage: { itemId: 'stock-1', quantity: 1 } }
  await assert.rejects(() => registerTreatment(storage, 'garden-1', base), /confirmed execution/)
  assert.equal(item.quantity, 5)
  await registerTreatment(storage, 'garden-1', { ...base, confirmedExecution: true })
  assert.equal(item.quantity, 4)
})

test('phyto inventory uses provider-backed upsert and is readable after recreation', async () => {
  const rows: any[] = []
  const storage = {
    async getPhytoInventory() { return rows },
    async createPhytoInventoryItem(input: any) { const now = new Date().toISOString(); const row = { ...input, id: 'i-1', created_at: now, updated_at: now }; rows.push(row); return row },
    async updatePhytoInventoryItem(id: string, updates: any) { Object.assign(rows.find(row => row.id === id), updates); return rows.find(row => row.id === id) },
  }
  await addPhytoProduct(storage, 'garden-1', bioFungicides[0], 2)
  await addPhytoProduct(storage, 'garden-1', bioFungicides[0], 1)
  assert.equal((await getPhytoInventory(storage, 'garden-1'))[0].quantity, 3)
})

test('P3 migration contains idempotency, durable memory and regulatory guards', () => {
  const sql = readFileSync('supabase/migrations/20260717010000_p3_core_persistence.sql', 'utf8')
  for (const marker of ['agronomic_memory_events', 'diary_event_revisions', 'idempotency_key', 'protect_treatment_regulatory_fields', "status IN ('active','voided')"]) assert.match(sql, new RegExp(marker.replace(/[()]/g, '\\$&')))
})
