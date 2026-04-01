import { getMarketPrice } from '@/data/marketPrices'
import type {
  FertilizerApplicationLogDB,
  FertilizerInventoryItemDB,
  HarvestLogData,
  MechanicalWorkRecord,
  PhytoInventoryItemDB,
  TreatmentRecordDB,
} from '@/types'
import type { WateringLog } from '@/types/irrigation'

export type OperationalEconomicsSource =
  | 'observed'
  | 'inventory_derived'
  | 'estimated'

export interface OperationalEconomicsAssessment {
  estimatedCost: number
  actualCost?: number
  costSource: OperationalEconomicsSource
  waterCost?: number
  energyCost?: number
  laborCost?: number
  equipmentCost?: number
  productCost?: number
  economicValue?: number
  netEconomicImpact?: number
  rationale: string[]
}

type InventoryCostItem = {
  id?: string | null
  name?: string | null
  unit?: string | null
  costPerUnit?: number | null
}

const roundMetric = (value: number, digits: number = 2) =>
  Number(value.toFixed(digits))

const toNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const normalizeText = (value?: string | null) =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

const buildInventoryIndex = (items: InventoryCostItem[]): Map<string, InventoryCostItem> => {
  const index = new Map<string, InventoryCostItem>()

  items.forEach((item) => {
    const normalizedId = normalizeText(item.id)
    const normalizedName = normalizeText(item.name)

    if (normalizedId) {
      index.set(`id:${normalizedId}`, item)
    }
    if (normalizedName) {
      index.set(`name:${normalizedName}`, item)
    }
  })

  return index
}

const normalizeQuantityByArea = (
  amount: number,
  unit?: string | null,
  areaSqm?: number | null
): { quantity: number; unit: string } => {
  const normalizedUnit = normalizeText(unit) || ''
  const safeAmount = Math.max(0, amount)
  const safeAreaSqm = typeof areaSqm === 'number' && areaSqm > 0 ? areaSqm : null

  if (normalizedUnit === 'kg/ha') {
    const quantity = safeAreaSqm ? safeAmount * (safeAreaSqm / 10000) : safeAmount
    return { quantity, unit: 'kg' }
  }

  if (normalizedUnit === 'l/ha') {
    const quantity = safeAreaSqm ? safeAmount * (safeAreaSqm / 10000) : safeAmount
    return { quantity, unit: 'l' }
  }

  return { quantity: safeAmount, unit: normalizedUnit }
}

const convertQuantity = (
  amount: number,
  fromUnit?: string | null,
  targetUnit?: string | null
): number | null => {
  const normalizedFrom = normalizeText(fromUnit)
  const normalizedTarget = normalizeText(targetUnit)
  if (!normalizedFrom || !normalizedTarget) {
    return null
  }

  if (normalizedFrom === normalizedTarget) {
    return amount
  }

  if (normalizedFrom === 'g' && normalizedTarget === 'kg') {
    return amount / 1000
  }
  if (normalizedFrom === 'kg' && normalizedTarget === 'g') {
    return amount * 1000
  }
  if (normalizedFrom === 'ml' && normalizedTarget === 'l') {
    return amount / 1000
  }
  if (normalizedFrom === 'l' && normalizedTarget === 'ml') {
    return amount * 1000
  }

  return null
}

const resolveInventoryCost = (
  input: {
    productId?: string | null
    productName?: string | null
    quantity: number
    quantityUnit?: string | null
  },
  index: Map<string, InventoryCostItem>
): number | null => {
  const candidate =
    (input.productId ? index.get(`id:${normalizeText(input.productId)}`) : undefined) ||
    (input.productName ? index.get(`name:${normalizeText(input.productName)}`) : undefined)

  if (!candidate) {
    return null
  }

  const costPerUnit = toNumber(candidate.costPerUnit)
  if (costPerUnit === null || costPerUnit < 0) {
    return null
  }

  const convertedQuantity = convertQuantity(input.quantity, input.quantityUnit, candidate.unit)
  if (convertedQuantity === null) {
    return null
  }

  return roundMetric(Math.max(0, convertedQuantity) * costPerUnit)
}

const inferMinutesFromArea = (
  areaSqm: number | null,
  equipmentType?: string | null
): number => {
  if (!areaSqm || areaSqm <= 0) {
    return 25
  }

  const normalizedEquipment = normalizeText(equipmentType)
  const sqmPerHour =
    normalizedEquipment === 'tractor'
      ? 900
      : normalizedEquipment === 'rototiller'
        ? 260
        : normalizedEquipment === 'cultivator'
          ? 220
          : normalizedEquipment === 'manual'
            ? 55
            : 140

  return Math.max(15, (areaSqm / sqmPerHour) * 60)
}

const convertHarvestQuantityToKg = (
  quantity: number,
  unit: HarvestLogData['unit']
): number | null => {
  if (unit === 'kg') {
    return quantity
  }

  if (unit === 'g') {
    return quantity / 1000
  }

  return null
}

const getSeasonFromDate = (value?: string): 'Summer' | 'Winter' => {
  const date = value ? new Date(value) : new Date()
  const month = date.getMonth()
  return month >= 5 && month <= 8 ? 'Summer' : 'Winter'
}

export function estimateIrrigationOperationEconomics(
  log: Pick<WateringLog, 'litersApplied' | 'durationMinutes' | 'method'>
): OperationalEconomicsAssessment {
  const litersApplied = Math.max(0, log.litersApplied || 0)
  const durationMinutes = Math.max(0, log.durationMinutes || 0)
  const waterCost = roundMetric(litersApplied * 0.002)
  const energyHourlyRate =
    log.method === 'Manual' ? 0.18 : log.method === 'Automatic' ? 0.48 : 0.32
  const laborHourlyRate =
    log.method === 'Manual' ? 14 : log.method === 'Automatic' ? 3.5 : 2.2
  const energyCost = roundMetric((durationMinutes / 60) * energyHourlyRate)
  const laborCost = roundMetric((durationMinutes / 60) * laborHourlyRate)
  const estimatedCost = roundMetric(waterCost + energyCost + laborCost)

  return {
    estimatedCost,
    costSource: 'estimated',
    waterCost,
    energyCost,
    laborCost,
    rationale: [
      `Costo acqua stimato su ${litersApplied.toFixed(0)} L.`,
      `Costo operativo derivato da ${durationMinutes.toFixed(0)} minuti e metodo ${log.method}.`,
    ],
  }
}

export function estimateFertilizationOperationEconomics(
  log: Pick<
    FertilizerApplicationLogDB,
    | 'fertilizerProductId'
    | 'fertilizerProductName'
    | 'dosageAmount'
    | 'dosageUnit'
    | 'areaSqm'
    | 'method'
  >,
  inventoryItems: FertilizerInventoryItemDB[] = []
): OperationalEconomicsAssessment {
  const rationale: string[] = []
  const { quantity, unit } = normalizeQuantityByArea(log.dosageAmount, log.dosageUnit, log.areaSqm)
  const inventoryCost = resolveInventoryCost(
    {
      productId: log.fertilizerProductId,
      productName: log.fertilizerProductName,
      quantity,
      quantityUnit: unit,
    },
    buildInventoryIndex(
      inventoryItems.map((item) => ({
        id: item.product_id || item.id,
        name: item.product_name,
        unit: item.unit,
        costPerUnit: item.cost_per_unit,
      }))
    )
  )

  const fallbackUnitCost =
    unit === 'kg'
      ? 2.8
      : unit === 'g'
        ? 0.0028
        : unit === 'l'
          ? 4.5
          : unit === 'ml'
            ? 0.0045
            : 0.02

  const productCost = roundMetric(
    inventoryCost ?? Math.max(0, quantity) * fallbackUnitCost
  )
  const inferredMinutes = Math.max(
    12,
    (typeof log.areaSqm === 'number' && log.areaSqm > 0 ? log.areaSqm / 45 : 0) * 60
  )
  const laborCost = roundMetric((inferredMinutes / 60) * 14)
  const equipmentCost = roundMetric(
    log.method === 'fertigation' ? 3.5 : log.method === 'foliar' ? 5 : 2
  )
  const totalCost = roundMetric(productCost + laborCost + equipmentCost)

  if (inventoryCost !== null) {
    rationale.push('Costo prodotto derivato da giacenza fertilizzanti e costo unitario.')
  } else {
    rationale.push('Costo prodotto stimato da dose applicata e benchmark unitario.')
  }
  rationale.push('Costo lavoro stimato su tempo operativo standard per superficie e metodo.')

  return {
    estimatedCost: totalCost,
    actualCost: inventoryCost !== null ? totalCost : undefined,
    costSource: inventoryCost !== null ? 'inventory_derived' : 'estimated',
    productCost,
    laborCost,
    equipmentCost,
    rationale,
  }
}

export function estimateTreatmentOperationEconomics(
  treatment: Pick<
    TreatmentRecordDB,
    | 'product_name'
    | 'dosage'
    | 'dosage_unit'
    | 'area_treated'
    | 'method'
  >,
  inventoryItems: PhytoInventoryItemDB[] = []
): OperationalEconomicsAssessment {
  const rationale: string[] = []
  const { quantity, unit } = normalizeQuantityByArea(
    treatment.dosage || 0,
    treatment.dosage_unit,
    treatment.area_treated
  )
  const inventoryCost = resolveInventoryCost(
    {
      productName: treatment.product_name,
      quantity,
      quantityUnit: unit,
    },
    buildInventoryIndex(
      inventoryItems.map((item) => ({
        id: item.product_id || item.id,
        name: item.product_name,
        unit: item.unit,
        costPerUnit: item.cost_per_unit,
      }))
    )
  )

  const fallbackUnitCost =
    unit === 'kg'
      ? 18
      : unit === 'g'
        ? 0.018
        : unit === 'l'
          ? 22
          : unit === 'ml'
            ? 0.022
            : 0.08

  const productCost = roundMetric(
    inventoryCost ?? Math.max(0, quantity) * fallbackUnitCost
  )
  const inferredMinutes = Math.max(
    15,
    (typeof treatment.area_treated === 'number' && treatment.area_treated > 0
      ? treatment.area_treated / 60
      : 0) * 60
  )
  const laborCost = roundMetric((inferredMinutes / 60) * 15)
  const equipmentCost = roundMetric(
    treatment.method === 'spray' || treatment.method === 'foliar' ? 6 : 3
  )
  const totalCost = roundMetric(productCost + laborCost + equipmentCost)

  if (inventoryCost !== null) {
    rationale.push('Costo fitosanitario derivato da inventario e costo unitario disponibile.')
  } else {
    rationale.push('Costo fitosanitario stimato da dose e benchmark per unita di prodotto.')
  }
  rationale.push('Costo operativo completato con lavoro e attrezzatura standard.')

  return {
    estimatedCost: totalCost,
    actualCost: inventoryCost !== null ? totalCost : undefined,
    costSource: inventoryCost !== null ? 'inventory_derived' : 'estimated',
    productCost,
    laborCost,
    equipmentCost,
    rationale,
  }
}

export function estimateMechanicalOperationEconomics(
  work: Pick<MechanicalWorkRecord, 'area_m2' | 'equipment_type' | 'operator_name'> & {
    work_metadata?: Record<string, unknown> | null
  }
): OperationalEconomicsAssessment {
  const rationale: string[] = []
  const metadataCost = toNumber(work.work_metadata?.cost)
  if (metadataCost !== null) {
    return {
      estimatedCost: roundMetric(metadataCost),
      actualCost: roundMetric(metadataCost),
      costSource: 'observed',
      rationale: ['Costo lavorazione letto da metadati operativi registrati.'],
    }
  }

  const durationMinutes =
    toNumber(work.work_metadata?.durationMinutes) ??
    inferMinutesFromArea(toNumber(work.area_m2), work.equipment_type)
  const normalizedEquipment = normalizeText(work.equipment_type)
  const equipmentHourlyRate =
    normalizedEquipment === 'tractor'
      ? 32
      : normalizedEquipment === 'rototiller'
        ? 18
        : normalizedEquipment === 'cultivator'
          ? 12
          : normalizedEquipment === 'manual'
            ? 0
            : 8
  const laborHourlyRate = normalizedEquipment === 'manual' ? 16 : 19
  const equipmentCost = roundMetric((durationMinutes / 60) * equipmentHourlyRate)
  const laborCost = roundMetric((durationMinutes / 60) * laborHourlyRate)
  const estimatedCost = roundMetric(equipmentCost + laborCost)

  rationale.push(
    work.work_metadata?.durationMinutes
      ? 'Costo lavorazione normalizzato su durata effettiva registrata.'
      : 'Costo lavorazione stimato da superficie trattata e produttivita dell’attrezzatura.'
  )
  if (work.operator_name) {
    rationale.push('Costo lavoro valorizzato su operatore esplicitamente registrato.')
  }

  return {
    estimatedCost,
    costSource: 'estimated',
    laborCost,
    equipmentCost,
    rationale,
  }
}

export function estimateHarvestOperationEconomics(
  harvest: Pick<
    HarvestLogData,
    | 'quantity'
    | 'unit'
    | 'rating'
    | 'date'
    | 'plantName'
    | 'marketValue'
    | 'costPerKg'
  >
): OperationalEconomicsAssessment {
  const rationale: string[] = []
  const quantityKg = convertHarvestQuantityToKg(harvest.quantity, harvest.unit)

  if (quantityKg === null) {
    return {
      estimatedCost: 0,
      costSource: 'estimated',
      rationale: ['Valore raccolta non stimato: unita non convertibile in kg senza dato peso medio.'],
    }
  }

  const season = getSeasonFromDate(harvest.date)
  const baseMarketPrice =
    typeof harvest.marketValue === 'number' && Number.isFinite(harvest.marketValue)
      ? harvest.marketValue
      : getMarketPrice((harvest.plantName || 'GENERIC').toUpperCase(), season)
  const qualityMultiplier =
    harvest.rating >= 5 ? 1.18 : harvest.rating === 4 ? 1.08 : harvest.rating === 3 ? 1 : 0.9
  const economicValue = roundMetric(quantityKg * baseMarketPrice * qualityMultiplier)
  const handlingCostPerKg =
    typeof harvest.costPerKg === 'number' && Number.isFinite(harvest.costPerKg)
      ? harvest.costPerKg
      : 0.38
  const estimatedCost = roundMetric(quantityKg * handlingCostPerKg)
  const netEconomicImpact = roundMetric(economicValue - estimatedCost)

  rationale.push('Valore raccolta stimato su prezzo di mercato stagionale e classe qualitativa.')
  rationale.push('Costo raccolta valorizzato su handling €/kg registrato o benchmark operativo.')

  return {
    estimatedCost,
    actualCost:
      typeof harvest.costPerKg === 'number' && Number.isFinite(harvest.costPerKg)
        ? estimatedCost
        : undefined,
    costSource:
      typeof harvest.costPerKg === 'number' && Number.isFinite(harvest.costPerKg)
        ? 'observed'
        : 'estimated',
    economicValue,
    netEconomicImpact,
    rationale,
  }
}
