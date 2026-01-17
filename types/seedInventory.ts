export interface SeedPacket {
  id: string
  varietyId: string
  varietyName: string
  speciesName: string
  purchaseDate: string
  expiryYear: number
  isOpen: boolean
  quantityRemaining: 'High' | 'Medium' | 'Low' | 'Empty'
  source: 'purchased' | 'harvested'
  supplier?: string
  notes?: string
  gardenId: string
  
  // Optional detailed quantity tracking
  initialQuantity?: number
  currentQuantity?: number
  quantityDisplay?: string
  quantityMin?: number
  quantityMax?: number
  quantityExact?: number
}

export interface SeedConsumption {
  id: string
  seedPacketId: string
  plantName: string
  variety?: string
  quantityUsed: number
  date: string
  purpose: 'sowing' | 'testing' | 'sharing'
  notes?: string
  gardenId: string
}

export interface SeedAlert {
  id: string
  type: 'expiring' | 'expired' | 'low_stock' | 'empty'
  seedPacketId: string
  message: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  acknowledged: boolean
}

export interface SeedInventoryStats {
  totalPackets: number
  totalVarieties: number
  expiringCount: number
  lowStockCount: number
  expiredCount: number
  recentlyAdded: number
}

export interface SeedSearchFilters {
  searchTerm?: string
  status?: 'all' | 'expiring' | 'low' | 'expired'
  source?: 'all' | 'purchased' | 'harvested'
  isOpen?: boolean
  expiryYear?: number
}

export interface QuantityParsed {
  display: string
  exact?: number
  min?: number
  max?: number
}