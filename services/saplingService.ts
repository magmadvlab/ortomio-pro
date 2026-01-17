import { Sapling, SaplingBatch, SaplingItem, SaplingPlanting, SaplingStats, SaplingFilters } from '@/types/sapling'
import { getSupabaseClient } from '@/config/supabase'

class SaplingService {
  async getSaplings(gardenId: string, filters?: SaplingFilters): Promise<Sapling[]> {
    try {
      const supabase = getSupabaseClient()
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

      return data?.map(this.mapSaplingFromDatabase) || []
    } catch (error) {
      console.error('Error fetching saplings:', error)
      return []
    }
  }

  async addSapling(sapling: Omit<Sapling, 'id'>): Promise<Sapling> {
    try {
      const supabase = getSupabaseClient()
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
      const supabase = getSupabaseClient()
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
      const supabase = getSupabaseClient()
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
      const supabase = getSupabaseClient()
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
      const supabase = getSupabaseClient()
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
      const supabase = getSupabaseClient()
      // First, update the sapling status
      await this.updateSapling(saplingId, { 
        status: 'planted',
        plantingDate: planting.plantingDate,
        location: planting.location
      })

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
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('saplings')
        .select('*')
        .eq('garden_id', gardenId)

      if (error) throw error

      const saplings = data || []
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
            const purchaseDate = new Date(s.purchase_date)
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
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('saplings')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('status', 'ready_to_plant')
        .order('purchase_date', { ascending: true })

      if (error) throw error

      return data?.map(this.mapSaplingFromDatabase) || []
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
}

export const saplingService = new SaplingService()