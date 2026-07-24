import { SeedPacket, SeedConsumption, SeedAlert, SeedInventoryStats, SeedSearchFilters } from '@/types/seedInventory'
import { getSupabaseClient } from '@/config/supabase'

const normalizeForLookup = (value?: string) => (value || '').trim().toLowerCase()

const getSupabaseOrThrow = () => {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error('Supabase client non disponibile')
  }
  return supabase
}

export class SeedInventoryService {
  constructor(private readonly clientFactory: () => ReturnType<typeof getSupabaseOrThrow> = getSupabaseOrThrow) {}

  async getSeedPackets(gardenId: string, filters?: SeedSearchFilters): Promise<SeedPacket[]> {
    try {
      const supabase = this.clientFactory()
      let query = supabase
        .from('seed_inventory')
        .select('*')
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })

      if (filters?.searchTerm) {
        query = query.or(`variety_name.ilike.%${filters.searchTerm}%,species_name.ilike.%${filters.searchTerm}%,supplier.ilike.%${filters.searchTerm}%`)
      }

      if (filters?.source && filters.source !== 'all') {
        query = query.eq('source', filters.source)
      }

      if (filters?.isOpen !== undefined) {
        query = query.eq('is_open', filters.isOpen)
      }

      if (filters?.expiryYear) {
        query = query.eq('expiry_year', filters.expiryYear)
      }

      const { data, error } = await query

      if (error) throw error

      const packets = data?.map(this.mapFromDatabase) || []
      return packets
    } catch (error) {
      console.error('Error fetching seed packets:', error)
      throw error
    }
  }

  async addSeedPacket(packet: Omit<SeedPacket, 'id'>): Promise<SeedPacket> {
    try {
      const supabase = this.clientFactory()
      const { data, error } = await supabase
        .from('seed_inventory')
        .insert([this.mapToDatabase(packet)])
        .select()
        .single()

      if (error) throw error

      const mapped = this.mapFromDatabase(data)
      return mapped
    } catch (error) {
      console.error('Error adding seed packet:', error)
      throw error
    }
  }

  async updateSeedPacket(id: string, updates: Partial<SeedPacket>): Promise<SeedPacket> {
    try {
      const supabase = this.clientFactory()
      const { data, error } = await supabase
        .from('seed_inventory')
        .update(this.mapToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const mapped = this.mapFromDatabase(data)
      return mapped
    } catch (error) {
      console.error('Error updating seed packet:', error)
      throw error
    }
  }

  async deleteSeedPacket(id: string): Promise<void> {
    try {
      const supabase = this.clientFactory()
      const { error } = await supabase
        .from('seed_inventory')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting seed packet:', error)
      throw error
    }
  }

  async consumeSeeds(consumption: Omit<SeedConsumption, 'id'>): Promise<SeedConsumption> {
    try {
      const supabase = this.clientFactory()
      // First, record the consumption
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('seed_consumptions')
        .insert([{
          seed_packet_id: consumption.seedPacketId,
          plant_name: consumption.plantName,
          variety: consumption.variety,
          quantity_used: consumption.quantityUsed,
          date: consumption.date,
          purpose: consumption.purpose,
          notes: consumption.notes,
          garden_id: consumption.gardenId
        }])
        .select()
        .single()

      if (consumptionError) throw consumptionError

      // Then, update the seed packet quantity
      await this.updateSeedQuantityAfterConsumption(consumption.seedPacketId, consumption.quantityUsed)

      return {
        id: consumptionData.id,
        seedPacketId: consumptionData.seed_packet_id,
        plantName: consumptionData.plant_name,
        variety: consumptionData.variety,
        quantityUsed: consumptionData.quantity_used,
        date: consumptionData.date,
        purpose: consumptionData.purpose,
        notes: consumptionData.notes,
        gardenId: consumptionData.garden_id
      }
    } catch (error) {
      console.error('Error consuming seeds:', error)
      throw error
    }
  }

  async getAvailableSeedsForPlant(gardenId: string, plantName: string, variety?: string): Promise<SeedPacket[]> {
    try {
      const supabase = this.clientFactory()
      let query = supabase
        .from('seed_inventory')
        .select('*')
        .eq('garden_id', gardenId)
        .ilike('variety_name', `%${plantName}%`)
        .neq('quantity_remaining', 'Empty')
        .gte('expiry_year', new Date().getFullYear())

      if (variety) {
        query = query.ilike('species_name', `%${variety}%`)
      }

      const { data, error } = await query

      if (error) throw error

      const packets = data?.map(this.mapFromDatabase) || []
      return packets
    } catch (error) {
      console.error('Error fetching available seeds:', error)
      throw error
    }
  }

  async getExpiringSeeds(gardenId: string, monthsAhead: number = 12): Promise<SeedPacket[]> {
    try {
      const supabase = this.clientFactory()
      const targetYear = new Date().getFullYear() + Math.floor(monthsAhead / 12)
      
      const { data, error } = await supabase
        .from('seed_inventory')
        .select('*')
        .eq('garden_id', gardenId)
        .lte('expiry_year', targetYear)
        .neq('quantity_remaining', 'Empty')

      if (error) throw error

      return data?.map(this.mapFromDatabase) || []
    } catch (error) {
      console.error('Error fetching expiring seeds:', error)
      throw error
    }
  }

  async getLowStockSeeds(gardenId: string): Promise<SeedPacket[]> {
    try {
      const supabase = this.clientFactory()
      const { data, error } = await supabase
        .from('seed_inventory')
        .select('*')
        .eq('garden_id', gardenId)
        .in('quantity_remaining', ['Low', 'Empty'])

      if (error) throw error

      return data?.map(this.mapFromDatabase) || []
    } catch (error) {
      console.error('Error fetching low stock seeds:', error)
      throw error
    }
  }

  async getInventoryStats(gardenId: string): Promise<SeedInventoryStats> {
    try {
      const supabase = this.clientFactory()
      const { data, error } = await supabase
        .from('seed_inventory')
        .select('*')
        .eq('garden_id', gardenId)

      if (error) throw error

      const packets = data || []
      const currentYear = new Date().getFullYear()
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      return {
        totalPackets: packets.length,
        totalVarieties: new Set(packets.map(p => p.variety_name)).size,
        expiringCount: packets.filter(p => p.expiry_year <= currentYear + 1).length,
        lowStockCount: packets.filter(p => ['Low', 'Empty'].includes(p.quantity_remaining)).length,
        expiredCount: packets.filter(p => p.expiry_year < currentYear).length,
        recentlyAdded: packets.filter(p => new Date(p.created_at) > oneWeekAgo).length
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error)
      throw error
    }
  }

  private async updateSeedQuantityAfterConsumption(seedPacketId: string, quantityUsed: number): Promise<void> {
    try {
      const supabase = this.clientFactory()
      // Get current packet
      const { data: packet, error: fetchError } = await supabase
        .from('seed_inventory')
        .select('*')
        .eq('id', seedPacketId)
        .single()

      if (fetchError) throw fetchError

      // Calculate new quantity status
      let newQuantityRemaining = packet.quantity_remaining
      
      // Simple logic: if we used seeds, reduce the status
      if (quantityUsed > 0) {
        switch (packet.quantity_remaining) {
          case 'High':
            newQuantityRemaining = quantityUsed > 50 ? 'Medium' : 'High'
            break
          case 'Medium':
            newQuantityRemaining = quantityUsed > 20 ? 'Low' : 'Medium'
            break
          case 'Low':
            newQuantityRemaining = quantityUsed > 5 ? 'Empty' : 'Low'
            break
        }
      }

      // Update the packet
      const { error: updateError } = await supabase
        .from('seed_inventory')
        .update({ 
          quantity_remaining: newQuantityRemaining,
          is_open: true // Mark as opened when seeds are consumed
        })
        .eq('id', seedPacketId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Error updating seed quantity:', error)
      throw error
    }
  }

  private mapFromDatabase(data: any): SeedPacket {
    return {
      id: data.id,
      varietyId: data.variety_id,
      varietyName: data.variety_name,
      speciesName: data.species_name,
      purchaseDate: data.purchase_date,
      expiryYear: data.expiry_year,
      isOpen: data.is_open,
      quantityRemaining: data.quantity_remaining,
      source: data.source,
      supplier: data.supplier,
      notes: data.notes,
      gardenId: data.garden_id,
      initialQuantity: data.initial_quantity,
      currentQuantity: data.current_quantity,
      quantityDisplay: data.quantity_display,
      quantityMin: data.quantity_min,
      quantityMax: data.quantity_max,
      quantityExact: data.quantity_exact
    }
  }

  private mapToDatabase(packet: Partial<SeedPacket>): any {
    return {
      variety_id: packet.varietyId,
      variety_name: packet.varietyName,
      species_name: packet.speciesName,
      purchase_date: packet.purchaseDate,
      expiry_year: packet.expiryYear,
      is_open: packet.isOpen,
      quantity_remaining: packet.quantityRemaining,
      source: packet.source,
      supplier: packet.supplier,
      notes: packet.notes,
      garden_id: packet.gardenId,
      initial_quantity: packet.initialQuantity,
      current_quantity: packet.currentQuantity,
      quantity_display: packet.quantityDisplay,
      quantity_min: packet.quantityMin,
      quantity_max: packet.quantityMax,
      quantity_exact: packet.quantityExact
    }
  }
}

export const seedInventoryService = new SeedInventoryService()

export const getSeedPackets = (gardenId: string, filters?: SeedSearchFilters): Promise<SeedPacket[]> =>
  seedInventoryService.getSeedPackets(gardenId, filters)

export const addSeedPacket = (packet: Omit<SeedPacket, 'id'>) => 
  seedInventoryService.addSeedPacket(packet)

export const updateSeedPacket = (
  gardenIdOrId: string,
  idOrUpdates: string | Partial<SeedPacket>,
  maybeUpdates?: Partial<SeedPacket>
) => {
  const id = typeof idOrUpdates === 'string' ? idOrUpdates : gardenIdOrId
  const updates = (typeof idOrUpdates === 'string' ? maybeUpdates : idOrUpdates) || {}
  return seedInventoryService.updateSeedPacket(id, updates)
}

export const deleteSeedPacket = (gardenIdOrId: string, maybeId?: string) => 
  seedInventoryService.deleteSeedPacket(maybeId || gardenIdOrId)

export const getExpiringSeeds = (gardenId: string, monthsAhead: number = 12): Promise<SeedPacket[]> =>
  seedInventoryService.getExpiringSeeds(gardenId, monthsAhead)

export const getExpiredSeeds = async (gardenId: string, referenceYear = new Date().getFullYear()): Promise<SeedPacket[]> =>
  (await seedInventoryService.getSeedPackets(gardenId)).filter((packet) => packet.expiryYear < referenceYear)

export const getLowStockSeeds = (gardenId: string): Promise<SeedPacket[]> =>
  seedInventoryService.getLowStockSeeds(gardenId)

export const findSeedsForPlant = async (gardenId: string, plantName: string, variety?: string): Promise<SeedPacket[]> => {
  const plantKey = normalizeForLookup(plantName)
  const varietyKey = normalizeForLookup(variety)

  return (await seedInventoryService.getSeedPackets(gardenId)).filter((packet) => {
    const nameMatch =
      normalizeForLookup(packet.varietyName).includes(plantKey) ||
      normalizeForLookup(packet.speciesName).includes(plantKey)

    if (!nameMatch) {
      return false
    }

    if (!varietyKey) {
      return packet.quantityRemaining !== 'Empty'
    }

    return (
      packet.quantityRemaining !== 'Empty' &&
      (normalizeForLookup(packet.varietyName).includes(varietyKey) ||
        normalizeForLookup(packet.speciesName).includes(varietyKey))
    )
  })
}

export const useSeedForPlanting = async (
  gardenId: string,
  seedPacketId: string,
  quantity: number,
  service: Pick<SeedInventoryService, 'getSeedPackets' | 'consumeSeeds'> = seedInventoryService,
): Promise<boolean> => {
  const packets = await service.getSeedPackets(gardenId)
  const packet = packets.find((item) => item.id === seedPacketId)

  if (!packet) {
    return false
  }

  const currentQuantity =
    packet.currentQuantity ??
    packet.quantityExact ??
    packet.quantityMin ??
    null

  if (currentQuantity !== null && currentQuantity < quantity) {
    return false
  }

  await service.consumeSeeds({
    seedPacketId,
    plantName: packet.speciesName || packet.varietyName,
    variety: packet.varietyName,
    quantityUsed: quantity,
    date: new Date().toISOString().slice(0, 10),
    purpose: 'sowing',
    gardenId,
  })

  await service.getSeedPackets(gardenId)
  return true
}

export const shouldShowJanuaryAlert = (): boolean => {
  const now = new Date()
  return now.getMonth() === 0 // January is month 0
}

// Export types
export type { SeedPacket, SeedConsumption, SeedAlert, SeedInventoryStats, SeedSearchFilters }
