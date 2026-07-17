import type { IStorageProvider } from '@/packages/core/storage/interface'
import type { PhytoProduct } from '@/data/phytoproducts'
import type { UrgentAlert, PhytoInventoryItemDB } from '@/types'

type InventoryStorage = Pick<IStorageProvider, 'getPhytoInventory' | 'createPhytoInventoryItem' | 'updatePhytoInventoryItem'> & { persistenceKind?: IStorageProvider['persistenceKind'] }
const assertDurable = (storage: InventoryStorage) => { if (storage.persistenceKind === 'local') throw new Error('Phyto inventory requires durable cloud storage') }
export type PhytoInventoryItem = Omit<PhytoInventoryItemDB, 'garden_id' | 'product_id' | 'product_name' | 'product_type' | 'expiry_date' | 'safety_interval_days' | 'requires_license' | 'allowed_in_organic' | 'cost_per_unit' | 'created_at' | 'updated_at'> & { gardenId: string; productId: string; productName: string; productType: PhytoProduct['type']; expiryDate?: Date; safetyIntervalDays?: number; requiresLicense: boolean; allowedInOrganic: boolean; costPerUnit?: number; createdAt: Date; updatedAt: Date }

const mapItem = (row: PhytoInventoryItemDB): PhytoInventoryItem => ({ id: row.id, gardenId: row.garden_id, productId: row.product_id || row.product_name, productName: row.product_name, productType: row.product_type as PhytoProduct['type'], category: row.category, active_ingredient: row.active_ingredient, quantity: row.quantity, unit: row.unit, expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined, safetyIntervalDays: row.safety_interval_days || undefined, requiresLicense: row.requires_license || false, allowedInOrganic: row.allowed_in_organic || false, costPerUnit: row.cost_per_unit || undefined, supplier: row.supplier, notes: row.notes, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) })

export async function getPhytoInventory(storage: InventoryStorage, gardenId: string) { assertDurable(storage); return (await storage.getPhytoInventory(gardenId)).map(mapItem) }
export async function addPhytoProduct(storage: InventoryStorage, gardenId: string, product: PhytoProduct, quantity: number, expiryDate?: Date, cost?: number, supplier?: string, lotCode?: string): Promise<PhytoInventoryItem> {
  assertDurable(storage)
  if (!(quantity > 0)) throw new Error('Inventory quantity must be positive')
  const existing = (await storage.getPhytoInventory(gardenId)).find(item => item.product_id === product.id)
  const saved = existing
    ? await storage.updatePhytoInventoryItem(existing.id, { quantity: existing.quantity + quantity, expiry_date: expiryDate?.toISOString().slice(0, 10) || existing.expiry_date, cost_per_unit: cost ?? existing.cost_per_unit, supplier: supplier ?? existing.supplier })
    : await storage.createPhytoInventoryItem({ garden_id: gardenId, product_id: product.id, product_name: product.name, product_type: product.allowedInOrganic ? 'bio' : 'conventional', category: product.category, active_ingredient: product.activeIngredient, lot_code: lotCode, quantity, unit: product.dosage.unit.includes('mL') || product.dosage.unit.includes('L') ? 'L' : product.dosage.unit.includes('g') ? 'kg' : 'units', expiry_date: expiryDate?.toISOString().slice(0, 10), safety_interval_days: product.safetyInterval, requires_license: product.requiresLicense, allowed_in_organic: product.allowedInOrganic, cost_per_unit: cost, supplier })
  return mapItem(saved)
}
export async function checkExpiryAlerts(storage: InventoryStorage, gardenId: string): Promise<UrgentAlert[]> {
  const alerts: UrgentAlert[] = []
  for (const item of await getPhytoInventory(storage, gardenId)) if (item.expiryDate) { const days = Math.ceil((item.expiryDate.getTime() - Date.now()) / 86400000); if (days <= 30) alerts.push({ type: 'Planning', message: days < 0 ? `Prodotto scaduto: ${item.productName}` : `Prodotto in scadenza: ${item.productName} (${days} giorni)`, action: days < 0 ? 'Rimuovi e smaltisci correttamente' : 'Usa prima della scadenza o rinnova', blockOperations: false }) }
  return alerts
}
export async function checkLowStock(storage: InventoryStorage, gardenId: string, _season: 'Spring' | 'Summer' | 'Autumn' | 'Winter') { return (await getPhytoInventory(storage, gardenId)).flatMap(item => { const min = item.unit === 'units' ? 5 : 0.5; return item.quantity < min * 3 ? [{ item, reason: `Scorta ${item.quantity < min ? 'molto ' : ''}bassa: ${item.quantity}${item.unit}`, urgency: item.quantity < min ? 'high' as const : 'medium' as const }] : [] }) }
export async function getRequiredProducts(planned: Array<{ productId: string; quantityNeeded: number; unit: string }>, storage: InventoryStorage, gardenId: string) { const inventory = await getPhytoInventory(storage, gardenId); return planned.map(item => { const found = inventory.find(stock => stock.productId === item.productId); return { productId: item.productId, productName: found?.productName || item.productId, needed: item.quantityNeeded, available: found?.quantity || 0, unit: item.unit } }) }
