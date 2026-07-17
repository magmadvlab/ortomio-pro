import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { PhytoProduct } from '@/data/phytoproducts'
import type { TreatmentRecordDB } from '@/types'

type TreatmentStorage = Pick<IStorageProvider, 'getTreatments' | 'createTreatment' | 'getTreatment' | 'updateTreatment'> & Partial<Pick<IStorageProvider, 'getPhytoInventoryItem' | 'updatePhytoInventoryItem'>> & { persistenceKind?: IStorageProvider['persistenceKind'] }

const assertDurable = (storage: TreatmentStorage) => { if (storage.persistenceKind === 'local') throw new Error('Treatment registry requires durable cloud storage') }

export interface TreatmentRecord {
  id: string
  gardenId: string
  taskId?: string
  productId: string
  productName: string
  plantName: string
  treatmentDate: Date
  dosage: string
  applicationMethod: string
  targetPestDisease: string
  weatherConditions?: { temp: number; humidity: number; wind: number }
  safetyIntervalEndDate: Date
  notes?: string
  createdAt: Date
}

const mapRecord = (row: TreatmentRecordDB): TreatmentRecord => {
  const interval = row.pre_harvest_interval_days || 0
  const end = new Date(row.treatment_date)
  end.setDate(end.getDate() + interval)
  return { id: row.id, gardenId: row.garden_id || '', taskId: row.task_id || undefined, productId: row.registration_number || row.product_name, productName: row.product_name, plantName: row.crop_name, treatmentDate: new Date(row.treatment_date), dosage: `${row.dosage ?? ''} ${row.dosage_unit ?? ''}`.trim(), applicationMethod: row.method || 'spray', targetPestDisease: row.reason || '', weatherConditions: row.weather_conditions ? { temp: row.weather_conditions.temp || 0, humidity: row.weather_conditions.humidity || 0, wind: Number(row.weather_conditions.wind) || 0 } : undefined, safetyIntervalEndDate: end, notes: row.notes, createdAt: new Date(row.created_at) }
}

export async function registerTreatment(storage: TreatmentStorage, gardenId: string, input: { taskId?: string; product: PhytoProduct; plantName: string; treatmentDate: Date; dosage: string; applicationMethod: string; targetPestDisease: string; weatherConditions?: { temp: number; humidity: number; wind: number }; operatorName?: string; productLotCode?: string; notes?: string; confirmedExecution?: boolean; inventoryUsage?: { itemId: string; quantity: number } }): Promise<TreatmentRecord> {
  assertDurable(storage)
  if (input.inventoryUsage && !input.confirmedExecution) throw new Error('Inventory can only be consumed after confirmed execution')
  const [amount, unit] = input.dosage.trim().split(/\s+/, 2)
  const saved = await storage.createTreatment({ garden_id: gardenId, task_id: input.taskId, crop_name: input.plantName, treatment_date: input.treatmentDate.toISOString().slice(0, 10), product_name: input.product.name, active_ingredient: input.product.activeIngredient, dosage: Number(amount) || undefined, dosage_unit: ['ml', 'g', 'kg', 'L'].includes(unit) ? unit as TreatmentRecordDB['dosage_unit'] : undefined, method: input.applicationMethod.toLowerCase().includes('soil') ? 'soil' : 'spray', reason: input.targetPestDisease.toLowerCase().includes('prevent') ? 'preventive' : 'curative', treatment_type: input.product.allowedInOrganic ? 'organic' : 'conventional', organic_approved: input.product.allowedInOrganic, registration_number: input.product.id, product_lot_code: input.productLotCode, pre_harvest_interval_days: input.product.safetyInterval, weather_conditions: input.weatherConditions ? { temp: input.weatherConditions.temp, humidity: input.weatherConditions.humidity, wind: String(input.weatherConditions.wind) } : undefined, operator_name: input.operatorName, notes: input.notes })
  const persisted = await storage.getTreatment(saved.id)
  if (!persisted) throw new Error('Treatment write could not be verified after persistence')
  if (input.inventoryUsage) {
    if (!storage.getPhytoInventoryItem || !storage.updatePhytoInventoryItem) throw new Error('Inventory persistence capability unavailable')
    const item = await storage.getPhytoInventoryItem(input.inventoryUsage.itemId)
    if (!item || item.garden_id !== gardenId) throw new Error('Inventory item not found')
    if (input.inventoryUsage.quantity <= 0 || item.quantity < input.inventoryUsage.quantity) throw new Error('Invalid or insufficient inventory quantity')
    await storage.updatePhytoInventoryItem(item.id, { quantity: item.quantity - input.inventoryUsage.quantity })
  }
  return mapRecord(persisted)
}

export async function recordTreatmentOutcome(storage: TreatmentStorage, id: string, effectivenessScore: number, notes?: string): Promise<TreatmentRecord> {
  assertDurable(storage)
  if (effectivenessScore < 0 || effectivenessScore > 100) throw new Error('Effectiveness must be between 0 and 100')
  const updated = await storage.updateTreatment(id, { effectiveness_score: effectivenessScore, outcome_recorded_at: new Date().toISOString(), outcome_notes: notes })
  return mapRecord(updated)
}

export async function getTreatmentHistory(storage: TreatmentStorage, gardenId: string, plantName?: string, dateRange?: { start: Date; end: Date }): Promise<TreatmentRecord[]> {
  assertDurable(storage)
  const rows = await storage.getTreatments(gardenId, dateRange ? { dateFrom: dateRange.start.toISOString().slice(0, 10), dateTo: dateRange.end.toISOString().slice(0, 10) } : undefined)
  return rows.map(mapRecord).filter(row => !plantName || row.plantName.toLocaleLowerCase('it-IT').includes(plantName.toLocaleLowerCase('it-IT'))).sort((a, b) => b.treatmentDate.getTime() - a.treatmentDate.getTime())
}

export const checkSafetyInterval = (treatment: TreatmentRecord, currentDate = new Date()) => currentDate < treatment.safetyIntervalEndDate
export async function getActiveSafetyIntervals(storage: TreatmentStorage, gardenId: string) { return (await getTreatmentHistory(storage, gardenId)).filter(row => checkSafetyInterval(row)) }

export async function exportRegistry(storage: TreatmentStorage, gardenId: string, format: 'pdf' | 'csv'): Promise<string> {
  const records = await getTreatmentHistory(storage, gardenId)
  if (format === 'pdf') return JSON.stringify(records, null, 2)
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return [['Data','Prodotto','Pianta','Dosaggio','Metodo','Target','Fine Carenza','Note'].map(escape).join(','), ...records.map(row => [row.treatmentDate.toISOString().slice(0, 10), row.productName, row.plantName, row.dosage, row.applicationMethod, row.targetPestDisease, row.safetyIntervalEndDate.toISOString().slice(0, 10), row.notes].map(escape).join(','))].join('\n')
}
