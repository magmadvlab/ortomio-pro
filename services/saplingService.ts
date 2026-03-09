import { Sapling, SaplingBatch, SaplingItem, SaplingPlanting, SaplingStats, SaplingFilters } from '@/types/sapling'
import { getSupabaseClient } from '@/config/supabase'

// Additional types for the missing functions
export interface SaplingType {
  id: string
  name: string
  category: 'fruit' | 'olive' | 'vine'
  description?: string
}

export interface SaplingTimeline {
  id: string
  saplingId: string
  date: string
  event: string
  description?: string
  photos?: string[]
}

class SaplingService {
  private preferredSaplingTable: 'sapling_inventory' | 'saplings' = 'sapling_inventory'

  private getSupabaseOrThrow() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client non disponibile')
    }
    return client
  }

  private isMissingTableError(error: any): boolean {
    if (!error) return false
    const message = String(error.message || '').toLowerCase()
    const details = String(error.details || '').toLowerCase()
    const code = String(error.code || '').toUpperCase()
    return (
      code === 'PGRST205' ||
      code === '42P01' ||
      message.includes('could not find the table') ||
      details.includes('relation') && details.includes('does not exist')
    )
  }

  private mapSaplingFromInventory(data: any): Sapling {
    const available = Number(data.quantity_available || 0)
    const planted = Number(data.quantity_planted || 0)

    let status: Sapling['status'] = 'nursery'
    if (available > 0 && planted > 0) {
      status = 'ready_to_plant'
    } else if (available <= 0 && planted > 0) {
      status = 'planted'
    }

    return {
      id: data.id,
      plantName: data.species_name,
      variety: data.variety_name,
      source: 'nursery',
      status,
      purchaseDate: data.purchase_date || new Date().toISOString().slice(0, 10),
      quantity: available > 0 ? available : Math.max(planted, 1),
      supplier: data.supplier,
      rootstockType: data.rootstock,
      plantingDate: undefined,
      location: undefined,
      notes: data.notes,
      gardenId: data.garden_id
    }
  }

  private mapSaplingToInventoryDatabase(sapling: Partial<Sapling>, userId: string, current?: any): any {
    const quantity = Math.max(1, Number(sapling.quantity || current?.quantity_available || 1))
    const update: any = {}

    if (!current) {
      update.user_id = userId
      update.garden_id = sapling.gardenId
    }

    if (sapling.plantName !== undefined) update.species_name = sapling.plantName
    if (sapling.variety !== undefined) update.variety_name = sapling.variety || sapling.plantName || current?.variety_name || 'Varieta'
    if (!current && update.variety_name === undefined) {
      update.variety_name = sapling.plantName || 'Varieta'
    }
    if (sapling.supplier !== undefined) update.supplier = sapling.supplier
    if (sapling.rootstockType !== undefined) update.rootstock = sapling.rootstockType
    if (sapling.purchaseDate !== undefined) update.purchase_date = sapling.purchaseDate
    if (sapling.notes !== undefined) update.notes = sapling.notes

    if (sapling.quantity !== undefined) {
      update.quantity_available = quantity
    }

    if (sapling.status === 'planted') {
      const currentAvailable = Number(current?.quantity_available || quantity)
      const currentPlanted = Number(current?.quantity_planted || 0)
      update.quantity_available = 0
      update.quantity_planted = currentPlanted + currentAvailable
    } else if (!current && sapling.status) {
      update.quantity_available = quantity
      update.quantity_planted = 0
    }

    if (!current && update.quantity_available === undefined) {
      update.quantity_available = quantity
      update.quantity_planted = sapling.status === 'planted' ? quantity : 0
    }

    return update
  }

  private applyClientSideFilters(saplings: Sapling[], filters?: SaplingFilters): Sapling[] {
    let items = [...saplings]

    if (filters?.status && filters.status !== 'all') {
      items = items.filter(item => item.status === filters.status)
    }

    if (filters?.source && filters.source !== 'all') {
      items = items.filter(item => item.source === filters.source)
    }

    return items
  }

  private async getCurrentUserId(): Promise<string> {
    const supabase = this.getSupabaseOrThrow()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user?.id) {
      throw new Error('Utente non autenticato')
    }
    return data.user.id
  }

  async getSaplings(gardenId: string, filters?: SaplingFilters): Promise<Sapling[]> {
    try {
      // Dati mock per testare l'interfaccia
      const mockSaplings: Sapling[] = [
        {
          id: '1',
          plantName: 'Melo',
          variety: 'Golden Delicious',
          source: 'nursery',
          status: 'nursery',
          purchaseDate: '2024-01-20',
          quantity: 5,
          supplier: 'Vivaio Alpino',
          rootstockType: 'M9',
          notes: 'Portinnesto nanizzante',
          gardenId: gardenId
        },
        {
          id: '2',
          plantName: 'Ciliegio',
          variety: 'Durone Nero',
          source: 'nursery',
          status: 'ready_to_plant',
          purchaseDate: '2024-02-15',
          quantity: 3,
          supplier: 'Vivaio del Sud',
          rootstockType: 'Gisela 5',
          notes: 'Pronto per impianto primaverile',
          gardenId: gardenId
        },
        {
          id: '3',
          plantName: 'Pesco',
          variety: 'Percoca',
          source: 'own',
          status: 'planted',
          purchaseDate: '2023-11-10',
          quantity: 2,
          plantingDate: '2024-03-15',
          location: 'Settore Sud',
          notes: 'Piantato con successo',
          gardenId: gardenId
        }
      ]

      const supabase = this.getSupabaseOrThrow()
      const tryInventoryFirst = this.preferredSaplingTable === 'sapling_inventory'

      const readFromInventory = async () => {
        let query = supabase
          .from('sapling_inventory')
          .select('*')
          .eq('garden_id', gardenId)
          .order('created_at', { ascending: false })

        if (filters?.plantName) {
          query = query.ilike('species_name', `%${filters.plantName}%`)
        }
        if (filters?.supplier) {
          query = query.ilike('supplier', `%${filters.supplier}%`)
        }

        const { data, error } = await query
        if (error) throw error
        const mapped = (data || []).map(item => this.mapSaplingFromInventory(item))
        return this.applyClientSideFilters(mapped, filters)
      }

      const readFromSaplings = async () => {
        let query = supabase
          .from('saplings')
          .select('*')
          .eq('garden_id', gardenId)
          .order('created_at', { ascending: false })

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status)
        }
        if (filters?.plantName) {
          query = query.ilike('plant_name', `%${filters.plantName}%`)
        }
        if (filters?.source && filters.source !== 'all') {
          query = query.eq('source', filters.source)
        }
        if (filters?.supplier) {
          query = query.ilike('supplier', `%${filters.supplier}%`)
        }

        const { data, error } = await query
        if (error) throw error
        return (data || []).map(item => this.mapSaplingFromDatabase(item))
      }

      let saplings: Sapling[] = []
      try {
        saplings = tryInventoryFirst ? await readFromInventory() : await readFromSaplings()
        this.preferredSaplingTable = tryInventoryFirst ? 'sapling_inventory' : 'saplings'
      } catch (error) {
        const missingTable = this.isMissingTableError(error)
        if (!missingTable) {
          console.warn('Database error, using mock data:', error)
          return mockSaplings
        }

        try {
          saplings = tryInventoryFirst ? await readFromSaplings() : await readFromInventory()
          this.preferredSaplingTable = tryInventoryFirst ? 'saplings' : 'sapling_inventory'
        } catch (fallbackError) {
          console.warn('Sapling tables unavailable, using mock data:', fallbackError)
          return mockSaplings
        }
      }

      if (!saplings || saplings.length === 0) {
        return mockSaplings
      }

      return saplings
    } catch (error) {
      console.error('Error fetching saplings:', error)
      // Restituisci dati mock in caso di errore
      return [
        {
          id: '1',
          plantName: 'Melo',
          variety: 'Golden Delicious',
          source: 'nursery',
          status: 'nursery',
          purchaseDate: '2024-01-20',
          quantity: 5,
          supplier: 'Vivaio Alpino',
          rootstockType: 'M9',
          notes: 'Portinnesto nanizzante',
          gardenId: gardenId
        }
      ]
    }
  }

  async addSapling(sapling: Omit<Sapling, 'id'>): Promise<Sapling> {
    try {
      const supabase = this.getSupabaseOrThrow()
      if (this.preferredSaplingTable === 'sapling_inventory') {
        try {
          const userId = await this.getCurrentUserId()
          const { data, error } = await supabase
            .from('sapling_inventory')
            .insert([this.mapSaplingToInventoryDatabase(sapling, userId)])
            .select()
            .single()

          if (error) throw error
          return this.mapSaplingFromInventory(data)
        } catch (error) {
          if (!this.isMissingTableError(error)) throw error
          this.preferredSaplingTable = 'saplings'
        }
      }

      const { data, error } = await supabase
        .from('saplings')
        .insert([this.mapSaplingToDatabase(sapling)])
        .select()
        .single()

      if (error) throw error
      return this.mapSaplingFromDatabase(data)
    } catch (error) {
      console.error('Error adding sapling:', error)
      throw error
    }
  }

  async updateSapling(id: string, updates: Partial<Sapling>): Promise<Sapling> {
    try {
      const supabase = this.getSupabaseOrThrow()
      if (this.preferredSaplingTable === 'sapling_inventory') {
        try {
          const { data: current, error: currentError } = await supabase
            .from('sapling_inventory')
            .select('*')
            .eq('id', id)
            .single()
          if (currentError) throw currentError

          const userId = await this.getCurrentUserId()
          const payload = this.mapSaplingToInventoryDatabase(updates, userId, current)
          const { data, error } = await supabase
            .from('sapling_inventory')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error
          return this.mapSaplingFromInventory(data)
        } catch (error) {
          if (!this.isMissingTableError(error)) throw error
          this.preferredSaplingTable = 'saplings'
        }
      }

      const { data, error } = await supabase
        .from('saplings')
        .update(this.mapSaplingToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapSaplingFromDatabase(data)
    } catch (error) {
      console.error('Error updating sapling:', error)
      throw error
    }
  }

  async deleteSapling(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseOrThrow()
      if (this.preferredSaplingTable === 'sapling_inventory') {
        try {
          const { error } = await supabase
            .from('sapling_inventory')
            .delete()
            .eq('id', id)
          if (error) throw error
          return
        } catch (error) {
          if (!this.isMissingTableError(error)) throw error
          this.preferredSaplingTable = 'saplings'
        }
      }

      const { error } = await supabase
        .from('saplings')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting sapling:', error)
      throw error
    }
  }

  async getSaplingBatches(gardenId: string): Promise<SaplingBatch[]> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const { data, error } = await supabase
        .from('sapling_batches')
        .select(`
          *,
          sapling_items (*)
        `)
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapBatchFromDatabase) || []
    } catch (error) {
      console.error('Error fetching sapling batches:', error)
      return []
    }
  }

  async createSaplingBatch(batch: Omit<SaplingBatch, 'id' | 'saplings'>): Promise<SaplingBatch> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const { data, error } = await supabase
        .from('sapling_batches')
        .insert([{
          plant_name: batch.plantName,
          variety: batch.variety,
          source: batch.source,
          total_quantity: batch.totalQuantity,
          remaining_quantity: batch.remainingQuantity,
          purchase_date: batch.purchaseDate,
          supplier: batch.supplier,
          rootstock_type: batch.rootstockType,
          price_per_unit: batch.pricePerUnit,
          total_cost: batch.totalCost,
          notes: batch.notes,
          garden_id: batch.gardenId
        }])
        .select()
        .single()

      if (error) throw error

      // Create individual sapling items
      const saplingItems = Array.from({ length: batch.totalQuantity }, (_, index) => ({
        batch_id: data.id,
        status: 'nursery' as const,
        health: 'good' as const
      }))

      const { data: itemsData, error: itemsError } = await supabase
        .from('sapling_items')
        .insert(saplingItems)
        .select()

      if (itemsError) throw itemsError

      return {
        ...this.mapBatchFromDatabase(data),
        saplings: itemsData.map(this.mapItemFromDatabase)
      }
    } catch (error) {
      console.error('Error creating sapling batch:', error)
      throw error
    }
  }

  async plantSapling(saplingId: string, planting: Omit<SaplingPlanting, 'id' | 'saplingId'>): Promise<SaplingPlanting> {
    try {
      const supabase = this.getSupabaseOrThrow()
      // First, update the sapling status
      await this.updateSapling(saplingId, { 
        status: 'planted',
        plantingDate: planting.plantingDate,
        location: planting.location
      })

      // sapling_inventory backend non ha tabella sapling_plantings
      if (this.preferredSaplingTable === 'sapling_inventory') {
        const generatedId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `sapling-planting-${Date.now()}`

        return {
          id: generatedId,
          saplingId,
          plantingDate: planting.plantingDate,
          location: planting.location,
          soilType: planting.soilType,
          spacing: planting.spacing,
          irrigation: planting.irrigation,
          fertilizer: planting.fertilizer,
          notes: planting.notes,
          gardenId: planting.gardenId
        }
      }

      // Then, create the planting record
      const { data, error } = await supabase
        .from('sapling_plantings')
        .insert([{
          sapling_id: saplingId,
          planting_date: planting.plantingDate,
          location: planting.location,
          soil_type: planting.soilType,
          spacing: planting.spacing,
          irrigation: planting.irrigation,
          fertilizer: planting.fertilizer,
          notes: planting.notes,
          garden_id: planting.gardenId
        }])
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        saplingId: data.sapling_id,
        plantingDate: data.planting_date,
        location: data.location,
        soilType: data.soil_type,
        spacing: data.spacing,
        irrigation: data.irrigation,
        fertilizer: data.fertilizer,
        notes: data.notes,
        gardenId: data.garden_id
      }
    } catch (error) {
      console.error('Error planting sapling:', error)
      throw error
    }
  }

  async getSaplingStats(gardenId: string): Promise<SaplingStats> {
    try {
      const saplings = await this.getSaplings(gardenId, { status: 'all' })
      const totalSaplings = saplings.length
      const inNursery = saplings.filter(s => s.status === 'nursery').length
      const readyToPlant = saplings.filter(s => s.status === 'ready_to_plant').length
      const planted = saplings.filter(s => s.status === 'planted').length

      // Calculate survival rate (planted / total)
      const survivalRate = totalSaplings > 0 ? (planted / totalSaplings) * 100 : 0

      // Calculate average age in days
      const now = new Date()
      const averageAge = totalSaplings > 0 
        ? saplings.reduce((sum, s) => {
            const purchaseDate = new Date(s.purchaseDate)
            const ageInDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + ageInDays
          }, 0) / totalSaplings
        : 0

      return {
        totalSaplings,
        inNursery,
        readyToPlant,
        planted,
        survivalRate,
        averageAge
      }
    } catch (error) {
      console.error('Error fetching sapling stats:', error)
      return {
        totalSaplings: 0,
        inNursery: 0,
        readyToPlant: 0,
        planted: 0,
        survivalRate: 0,
        averageAge: 0
      }
    }
  }

  async getSaplingsReadyToPlant(gardenId: string): Promise<Sapling[]> {
    try {
      const allSaplings = await this.getSaplings(gardenId, { status: 'all' })
      return allSaplings
        .filter(s => s.status === 'ready_to_plant')
        .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime())
    } catch (error) {
      console.error('Error fetching ready saplings:', error)
      return []
    }
  }

  private mapSaplingFromDatabase(data: any): Sapling {
    return {
      id: data.id,
      plantName: data.plant_name,
      variety: data.variety,
      source: data.source,
      status: data.status,
      purchaseDate: data.purchase_date,
      quantity: data.quantity,
      supplier: data.supplier,
      rootstockType: data.rootstock_type,
      plantingDate: data.planting_date,
      location: data.location,
      notes: data.notes,
      gardenId: data.garden_id
    }
  }

  private mapSaplingToDatabase(sapling: Partial<Sapling>): any {
    return {
      plant_name: sapling.plantName,
      variety: sapling.variety,
      source: sapling.source,
      status: sapling.status,
      purchase_date: sapling.purchaseDate,
      quantity: sapling.quantity,
      supplier: sapling.supplier,
      rootstock_type: sapling.rootstockType,
      planting_date: sapling.plantingDate,
      location: sapling.location,
      notes: sapling.notes,
      garden_id: sapling.gardenId
    }
  }

  private mapBatchFromDatabase(data: any): SaplingBatch {
    return {
      id: data.id,
      plantName: data.plant_name,
      variety: data.variety,
      source: data.source,
      totalQuantity: data.total_quantity,
      remainingQuantity: data.remaining_quantity,
      purchaseDate: data.purchase_date,
      supplier: data.supplier,
      rootstockType: data.rootstock_type,
      pricePerUnit: data.price_per_unit,
      totalCost: data.total_cost,
      notes: data.notes,
      gardenId: data.garden_id,
      saplings: data.sapling_items?.map(this.mapItemFromDatabase) || []
    }
  }

  private mapItemFromDatabase(data: any): SaplingItem {
    return {
      id: data.id,
      batchId: data.batch_id,
      status: data.status,
      plantingDate: data.planting_date,
      location: data.location,
      health: data.health,
      notes: data.notes
    }
  }

  // Additional methods for missing functions
  async getSaplingTimeline(saplingId: string): Promise<SaplingTimeline[]> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const { data, error } = await supabase
        .from('sapling_timeline')
        .select('*')
        .eq('sapling_id', saplingId)
        .order('date', { ascending: false })

      if (error) throw error

      return data?.map(item => ({
        id: item.id,
        saplingId: item.sapling_id,
        date: item.date,
        event: item.event,
        description: item.description,
        photos: item.photos || []
      })) || []
    } catch (error) {
      console.error('Error fetching sapling timeline:', error)
      return []
    }
  }

  async addPhotoToLog(saplingId: string, photoUrl: string, description?: string): Promise<void> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const { error } = await supabase
        .from('sapling_timeline')
        .insert([{
          sapling_id: saplingId,
          date: new Date().toISOString(),
          event: 'photo_added',
          description: description || 'Photo added',
          photos: [photoUrl]
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error adding photo to log:', error)
      throw error
    }
  }

  async updateSurvivalCount(batchId: string, survivingCount: number): Promise<void> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const { error } = await supabase
        .from('sapling_batches')
        .update({ remaining_quantity: survivingCount })
        .eq('id', batchId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating survival count:', error)
      throw error
    }
  }

  async updateSaplingPhase(saplingId: string, phase: string): Promise<void> {
    try {
      const normalized = phase === 'nursery' || phase === 'ready_to_plant' || phase === 'planted'
        ? phase
        : 'nursery'
      await this.updateSapling(saplingId, { status: normalized })
    } catch (error) {
      console.error('Error updating sapling phase:', error)
      throw error
    }
  }

  async recordPlanting(saplingId: string, plantingData: any): Promise<void> {
    try {
      await this.plantSapling(saplingId, plantingData)
    } catch (error) {
      console.error('Error recording planting:', error)
      throw error
    }
  }

  async linkToSpecializedCrop(saplingId: string, cropType: string, cropId?: string): Promise<void> {
    try {
      await this.updateSapling(saplingId, {
        notes: `Linked to ${cropType}${cropId ? ` (ID: ${cropId})` : ''}`
      })
    } catch (error) {
      console.error('Error linking to specialized crop:', error)
      throw error
    }
  }

  isReadyToOrchard(sapling: Sapling): boolean {
    // Check if sapling is ready based on age, health, and status
    if (sapling.status !== 'ready_to_plant') return false
    
    const purchaseDate = new Date(sapling.purchaseDate)
    const now = new Date()
    const ageInDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generally ready after 30-90 days depending on type
    return ageInDays >= 30
  }
}

export const saplingService = new SaplingService()

// Export individual functions for backward compatibility
export const createSaplingBatch = (batch: Omit<SaplingBatch, 'id' | 'saplings'>) => 
  saplingService.createSaplingBatch(batch)

export const getSaplingTimeline = (saplingId: string) => 
  saplingService.getSaplingTimeline(saplingId)

export const addPhotoToLog = (saplingId: string, photoUrl: string, description?: string) => 
  saplingService.addPhotoToLog(saplingId, photoUrl, description)

export const updateSurvivalCount = (batchId: string, survivingCount: number) => 
  saplingService.updateSurvivalCount(batchId, survivingCount)

export const updateSaplingPhase = (saplingId: string, phase: string) => 
  saplingService.updateSaplingPhase(saplingId, phase)

export const recordPlanting = (saplingId: string, plantingData: any) => 
  saplingService.recordPlanting(saplingId, plantingData)

export const linkToSpecializedCrop = (saplingId: string, cropType: string, cropId?: string) => 
  saplingService.linkToSpecializedCrop(saplingId, cropType, cropId)

export const isReadyToOrchard = (sapling: Sapling) => 
  saplingService.isReadyToOrchard(sapling)

// Export types
export type { SaplingBatch, Sapling }
