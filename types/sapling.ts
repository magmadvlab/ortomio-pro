export interface Sapling {
  id: string
  plantName: string
  variety?: string
  source: 'nursery' | 'own'
  status: 'nursery' | 'ready_to_plant' | 'planted'
  purchaseDate: string
  quantity: number
  supplier?: string
  rootstockType?: string
  plantingDate?: string
  location?: string
  notes?: string
  gardenId: string
}

export interface SaplingBatch {
  id: string
  plantName: string
  variety?: string
  source: 'nursery' | 'own'
  totalQuantity: number
  remainingQuantity: number
  purchaseDate: string
  supplier?: string
  rootstockType?: string
  pricePerUnit?: number
  totalCost?: number
  notes?: string
  gardenId: string
  initialQuantity?: number
  quantity?: number
  currentQuantity?: number
  phase?: 'Purchased' | 'Nursery' | 'ReadyToPlant' | 'Planted'
  plantingDate?: string
  location?: string
  expectedEstablishmentDate?: string
  rootstock?: string
  spacing?: number
  photoLog?: { date: string; image: string; notes?: string }[]
  saplingType?: 'FruitTree' | 'Olive' | 'Vine'
  specializedCropId?: string
  
  // Individual saplings in this batch
  saplings: SaplingItem[]
}

export interface SaplingItem {
  id: string
  batchId: string
  status: 'nursery' | 'ready_to_plant' | 'planted' | 'dead'
  plantingDate?: string
  location?: string
  health: 'excellent' | 'good' | 'fair' | 'poor'
  notes?: string
}

export interface SaplingPlanting {
  id: string
  saplingId: string
  plantingDate: string
  location: string
  soilType?: string
  spacing?: number
  irrigation?: string
  fertilizer?: string
  notes?: string
  gardenId: string
}

export interface SaplingStats {
  totalSaplings: number
  inNursery: number
  readyToPlant: number
  planted: number
  survivalRate: number
  averageAge: number
}

export interface SaplingFilters {
  status?: 'all' | 'nursery' | 'ready_to_plant' | 'planted'
  plantName?: string
  source?: 'all' | 'nursery' | 'own'
  supplier?: string
}
