import { Sapling, SaplingBatch, SaplingItem, SaplingPlanting, SaplingStats, SaplingFilters } from '@/types/sapling'
import { getSupabaseClient } from '@/config/supabase'

type SaplingBatchRow = {
  id: string
  plant_name: string
  variety: string | null
  sapling_type?: SaplingBatch['saplingType'] | null
  source: Sapling['source']
  total_quantity: number
  remaining_quantity: number
  purchase_date: string
  supplier: string | null
  rootstock_type: string | null
  price_per_unit?: number | null
  total_cost?: number | null
  notes: string | null
  garden_id: string
  sapling_items?: SaplingItemRow[] | null
}

type SaplingItemRow = {
  id: string
  batch_id: string
  status: SaplingItem['status']
  planting_date: string | null
  location: string | null
  health: SaplingItem['health']
  notes: string | null
}

type SaplingBatchInsert = {
  p_plant_name: string
  p_variety: string | null
  p_source: Sapling['source']
  p_total_quantity: number
  p_purchase_date: string
  p_supplier: string | null
  p_rootstock_type: string | null
  p_price_per_unit: number | null
  p_total_cost: number | null
  p_notes: string | null
  p_garden_id: string
  p_sapling_type: NonNullable<SaplingBatch['saplingType']>
  p_initial_status: Sapling['status']
  p_planting_date: string | null
  p_location: string | null
}

export interface SaplingType {
  id: string
  name: string
  category: 'fruit' | 'olive' | 'vine'
  description?: string
}

class SaplingService {
  private getSupabaseOrThrow() {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error('Supabase client non disponibile')
    }
    return client
  }

  private mapSaplingFromBatch(data: SaplingBatchRow): Sapling {
    const items = data.sapling_items || []
    const counts = items.reduce((acc, item) => {
      const status = item.status || 'nursery'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    let status: Sapling['status'] = 'nursery'
    if ((counts.planted || 0) > 0 && (counts.ready_to_plant || 0) === 0 && (counts.nursery || 0) === 0) {
      status = 'planted'
    } else if ((counts.ready_to_plant || 0) > 0 || (data.remaining_quantity > 0 && data.remaining_quantity < data.total_quantity)) {
      status = 'ready_to_plant'
    }

    return {
      id: data.id,
      plantName: data.plant_name,
      variety: data.variety ?? undefined,
      source: data.source || 'nursery',
      status,
      purchaseDate: data.purchase_date,
      quantity: data.remaining_quantity,
      supplier: data.supplier ?? undefined,
      rootstockType: data.rootstock_type ?? undefined,
      plantingDate: undefined,
      location: undefined,
      notes: data.notes ?? undefined,
      gardenId: data.garden_id,
    }
  }

  private inferSaplingType(
    plantName: string,
    explicitType?: SaplingBatch['saplingType'],
  ): NonNullable<SaplingBatch['saplingType']> {
    if (explicitType) return explicitType
    const normalizedName = plantName.toLowerCase()
    if (normalizedName.includes('oliv')) return 'Olive'
    if (normalizedName.includes('vite') || normalizedName.includes('uva')) return 'Vine'
    return 'FruitTree'
  }

  private mapSaplingToBatchDatabase(sapling: Partial<Sapling>): Partial<SaplingBatchRow> {
    const update: Partial<SaplingBatchRow> = {}

    if (sapling.plantName !== undefined) update.plant_name = sapling.plantName
    if (sapling.variety !== undefined) update.variety = sapling.variety
    if (sapling.source !== undefined) update.source = sapling.source
    if (sapling.supplier !== undefined) update.supplier = sapling.supplier
    if (sapling.rootstockType !== undefined) update.rootstock_type = sapling.rootstockType
    if (sapling.purchaseDate !== undefined) update.purchase_date = sapling.purchaseDate
    if (sapling.notes !== undefined) update.notes = sapling.notes

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

  async getSaplings(gardenId: string, filters?: SaplingFilters): Promise<Sapling[]> {
    const supabase = this.getSupabaseOrThrow()
    const { data, error } = await supabase
      .from('sapling_batches')
      .select(`
        *,
        sapling_items (id, batch_id, status, planting_date, location, health, notes)
      `)
      .eq('garden_id', gardenId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saplings:', error)
      throw error
    }

    let mapped = ((data || []) as SaplingBatchRow[]).map(item => this.mapSaplingFromBatch(item))
    if (filters?.plantName) {
      const plantName = filters.plantName.toLowerCase()
      mapped = mapped.filter(item => item.plantName.toLowerCase().includes(plantName))
    }
    if (filters?.supplier) {
      const supplier = filters.supplier.toLowerCase()
      mapped = mapped.filter(item => (item.supplier || '').toLowerCase().includes(supplier))
    }
    return this.applyClientSideFilters(mapped, filters)
  }

  async addSapling(sapling: Omit<Sapling, 'id'>): Promise<Sapling> {
    const created = await this.createSaplingBatch({
      plantName: sapling.plantName,
      variety: sapling.variety,
      source: sapling.source,
      totalQuantity: sapling.quantity,
      remainingQuantity: sapling.status === 'planted' ? 0 : sapling.quantity,
      purchaseDate: sapling.purchaseDate,
      supplier: sapling.supplier,
      rootstockType: sapling.rootstockType,
      notes: sapling.notes,
      gardenId: sapling.gardenId,
    }, sapling.status, sapling.plantingDate, sapling.location)

    return this.mapSaplingFromBatch({
      id: created.id,
      plant_name: created.plantName,
      variety: created.variety ?? null,
      source: created.source,
      total_quantity: created.totalQuantity,
      remaining_quantity: created.remainingQuantity,
      purchase_date: created.purchaseDate,
      supplier: created.supplier ?? null,
      rootstock_type: created.rootstockType ?? null,
      notes: created.notes ?? null,
      garden_id: created.gardenId,
      sapling_items: created.saplings.map(item => ({
        id: item.id,
        batch_id: item.batchId,
        status: item.status,
        planting_date: item.plantingDate ?? null,
        location: item.location ?? null,
        health: item.health,
        notes: item.notes ?? null,
      })),
    })
  }

  async updateSapling(id: string, updates: Partial<Sapling>): Promise<Sapling> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const {
        status,
        plantingDate,
        location,
        quantity,
        ...metadataUpdates
      } = updates

      if (status) {
        const { error: statusError } = await supabase.rpc('set_sapling_batch_status', {
          p_batch_id: id,
          p_status: status,
          p_planting_date: plantingDate || null,
          p_location: location || null,
        })
        if (statusError) throw statusError
      }

      if (quantity !== undefined) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error('La quantita degli alberelli deve essere un intero positivo')
        }
        const { error: quantityError } = await supabase.rpc('resize_sapling_batch', {
          p_batch_id: id,
          p_total_quantity: quantity,
        })
        if (quantityError) throw quantityError
      }

      const { data: current, error: currentError } = await supabase
        .from('sapling_batches')
        .select('*, sapling_items (id, batch_id, status, planting_date, location, health, notes)')
        .eq('id', id)
        .single()
      if (currentError) throw currentError

      const payload = this.mapSaplingToBatchDatabase(metadataUpdates)
      if (Object.keys(payload).length === 0) {
        return this.mapSaplingFromBatch(current as SaplingBatchRow)
      }
      const { data, error } = await supabase
        .from('sapling_batches')
        .update(payload)
        .eq('id', id)
        .select('*, sapling_items (id, batch_id, status, planting_date, location, health, notes)')
        .single()
      if (error) throw error
      return this.mapSaplingFromBatch(data as SaplingBatchRow)
    } catch (error) {
      console.error('Error updating sapling:', error)
      throw error
    }
  }

  async deleteSapling(id: string): Promise<void> {
    try {
      const supabase = this.getSupabaseOrThrow()
      const { error } = await supabase
        .from('sapling_batches')
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

      return ((data || []) as SaplingBatchRow[]).map(row => this.mapBatchFromDatabase(row))
    } catch (error) {
      console.error('Error fetching sapling batches:', error)
      throw error
    }
  }

  async createSaplingBatch(
    batch: Omit<SaplingBatch, 'id' | 'saplings'>,
    initialStatus: Sapling['status'] = 'nursery',
    plantingDate?: string,
    location?: string,
  ): Promise<SaplingBatch> {
    try {
      if (!Number.isInteger(batch.totalQuantity) || batch.totalQuantity <= 0) {
        throw new Error('La quantita totale deve essere un intero positivo')
      }
      if (!batch.plantName.trim() || !batch.purchaseDate || !batch.gardenId) {
        throw new Error('Pianta, data e giardino sono obbligatori')
      }

      const supabase = this.getSupabaseOrThrow()
      const payload: SaplingBatchInsert = {
        p_plant_name: batch.plantName.trim(),
        p_variety: batch.variety || null,
        p_source: batch.source,
        p_total_quantity: batch.totalQuantity,
        p_purchase_date: batch.purchaseDate,
        p_supplier: batch.supplier || null,
        p_rootstock_type: batch.rootstockType || null,
        p_price_per_unit: batch.pricePerUnit ?? null,
        p_total_cost: batch.totalCost ?? null,
        p_notes: batch.notes || null,
        p_garden_id: batch.gardenId,
        p_sapling_type: this.inferSaplingType(batch.plantName, batch.saplingType),
        p_initial_status: initialStatus,
        p_planting_date: initialStatus === 'planted' ? plantingDate || batch.purchaseDate : null,
        p_location: initialStatus === 'planted' ? location || null : null,
      }
      const { data: createdId, error } = await supabase.rpc('create_sapling_batch_with_items', payload)
      if (error) throw error
      if (typeof createdId !== 'string') {
        throw new Error('Creazione batch non confermata dal database')
      }

      const { data, error: readError } = await supabase
        .from('sapling_batches')
        .select('*, sapling_items (id, batch_id, status, planting_date, location, health, notes)')
        .eq('id', createdId)
        .single()
      if (readError) throw readError
      return this.mapBatchFromDatabase(data as SaplingBatchRow)
    } catch (error) {
      console.error('Error creating sapling batch:', error)
      throw error
    }
  }

  async plantSapling(saplingId: string, planting: Omit<SaplingPlanting, 'id' | 'saplingId'>): Promise<SaplingPlanting> {
    try {
      const supabase = this.getSupabaseOrThrow()
      if (!planting.plantingDate || !planting.location || !planting.gardenId) {
        throw new Error('Data, posizione e giardino sono obbligatori')
      }

      const { data, error } = await supabase
        .rpc('record_sapling_item_planting', {
          p_sapling_item_id: saplingId,
          p_planting_date: planting.plantingDate,
          p_location: planting.location,
          p_notes: planting.notes || null,
          p_garden_id: planting.gardenId,
          p_soil_type: planting.soilType || null,
          p_spacing: planting.spacing ?? null,
          p_irrigation: planting.irrigation || null,
          p_fertilizer: planting.fertilizer || null,
        })

      if (error) throw error
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Messa a dimora non confermata dal database')
      }
      const result = data as {
        planting_id?: string
        sapling_id?: string
        planting_date?: string
        location?: string
        garden_id?: string
      }
      if (!result.planting_id || !result.sapling_id || !result.planting_date || !result.location || !result.garden_id) {
        throw new Error('Risposta messa a dimora incompleta')
      }

      return {
        id: result.planting_id,
        saplingId: result.sapling_id,
        plantingDate: result.planting_date,
        location: result.location,
        soilType: planting.soilType,
        spacing: planting.spacing,
        irrigation: planting.irrigation,
        fertilizer: planting.fertilizer,
        notes: planting.notes,
        gardenId: result.garden_id
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
      throw error
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
      throw error
    }
  }

  private mapBatchFromDatabase(data: SaplingBatchRow): SaplingBatch {
    const totalQuantity = data.total_quantity
    const remainingQuantity = data.remaining_quantity
    const items = data.sapling_items || []
    const plantedItem = items.find((item) => item.status === 'planted')
    const saplingType = this.inferSaplingType(
      data.plant_name,
      data.sapling_type ?? undefined,
    )

    return {
      id: data.id,
      plantName: data.plant_name,
      variety: data.variety ?? undefined,
      source: data.source,
      totalQuantity,
      remainingQuantity,
      purchaseDate: data.purchase_date,
      supplier: data.supplier ?? undefined,
      rootstockType: data.rootstock_type ?? undefined,
      pricePerUnit: data.price_per_unit ?? undefined,
      totalCost: data.total_cost ?? undefined,
      notes: data.notes ?? undefined,
      gardenId: data.garden_id,
      initialQuantity: totalQuantity,
      quantity: totalQuantity,
      currentQuantity: remainingQuantity,
      phase: remainingQuantity > 0 ? 'Purchased' : 'Planted',
      plantingDate: plantedItem?.planting_date ?? undefined,
      location: plantedItem?.location ?? undefined,
      photoLog: [],
      saplingType,
      saplings: items.map(item => this.mapItemFromDatabase(item))
    }
  }

  private mapItemFromDatabase(data: SaplingItemRow): SaplingItem {
    return {
      id: data.id,
      batchId: data.batch_id,
      status: data.status,
      plantingDate: data.planting_date ?? undefined,
      location: data.location ?? undefined,
      health: data.health,
      notes: data.notes ?? undefined
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

  async recordPlanting(
    saplingId: string,
    plantingData: Omit<SaplingPlanting, 'id' | 'saplingId'>
  ): Promise<void> {
    try {
      await this.plantSapling(saplingId, plantingData)
    } catch (error) {
      console.error('Error recording planting:', error)
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

export const addPhotoToLog = (saplingId: string, photoUrl: string, description?: string) => 
  saplingService.addPhotoToLog(saplingId, photoUrl, description)

export const recordPlanting = (
  saplingId: string,
  plantingData: Omit<SaplingPlanting, 'id' | 'saplingId'>
) =>
  saplingService.recordPlanting(saplingId, plantingData)

export const isReadyToOrchard = (sapling: Sapling) => 
  saplingService.isReadyToOrchard(sapling)

export const useSaplingForPlanting = async (
  storageProvider: {
    getSaplingBatch?: (batchId: string) => Promise<SaplingBatch | null | undefined>
    updateSaplingBatch?: (batchId: string, updates: Partial<SaplingBatch>) => Promise<unknown>
  },
  batchId: string,
  quantity: number
): Promise<boolean> => {
  if (!storageProvider.getSaplingBatch || !storageProvider.updateSaplingBatch) {
    return false
  }

  const batch = await storageProvider.getSaplingBatch(batchId)
  if (!batch) {
    return false
  }

  const availableQuantity =
    batch.currentQuantity ??
    batch.remainingQuantity ??
    batch.quantity ??
    batch.totalQuantity

  if (availableQuantity < quantity) {
    return false
  }

  const nextQuantity = Math.max(0, availableQuantity - quantity)
  await storageProvider.updateSaplingBatch(batchId, {
    ...batch,
    currentQuantity: nextQuantity,
    remainingQuantity: nextQuantity,
    quantity: batch.quantity ?? batch.totalQuantity,
    phase: nextQuantity > 0 ? 'Purchased' : 'Planted',
  })

  return true
}

// Export types
export type { SaplingBatch, Sapling }
