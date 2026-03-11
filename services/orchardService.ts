// ============================================================================
// ORCHARD SERVICE - COMPREHENSIVE ORCHARD MANAGEMENT
// Professional service layer for complete orchard operations
// ============================================================================

import {
  OrchardConfiguration,
  OrchardTree,
  TreePhoto,
  PhenologicalObservation,
  PruningSchedule,
  TreePruningRecord,
  HarvestSchedule,
  TreeHarvestRecord,
  TreeTreatment,
  OrchardAnalytics,
  OrchardDashboardData,
  OrchardFilters,
  TreeSearchCriteria,
  OrchardWizardData,
  BulkTreeImport
} from '@/types/orchard'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient as getSupabaseClientUnsafe } from '@/config/supabase'

const getSupabaseClient = (): SupabaseClient => {
  const client = getSupabaseClientUnsafe()
  if (!client) {
    throw new Error('Supabase client not configured')
  }
  return client
}

class OrchardService {
  private readonly BULK_TREE_CHUNK_SIZE = 200

  private parseDate(value: unknown): Date | null {
    if (typeof value !== 'string' || !value.trim()) return null
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  private roundToSingleDecimal(value: number): number {
    if (!Number.isFinite(value)) return 0
    return Math.round(value * 10) / 10
  }

  private clampPercentage(value: number): number {
    if (!Number.isFinite(value)) return 0
    return Math.max(0, Math.min(100, Math.round(value)))
  }

  private isMissingColumnError(error: any): boolean {
    if (!error) return false
    const code = String(error.code || '').toUpperCase()
    const message = String(error.message || '').toLowerCase()
    const details = String(error.details || '').toLowerCase()

    return (
      code === 'PGRST204' ||
      code === 'PGRST205' ||
      code === '42703' ||
      message.includes('could not find the') && message.includes('column') ||
      message.includes('column') && message.includes('does not exist') ||
      details.includes('column') && details.includes('does not exist')
    )
  }

  private extractMissingColumn(error: any): string | null {
    const combined = `${error?.message || ''} ${error?.details || ''}`
    const patterns = [
      /column ['"]?([a-zA-Z0-9_]+)['"]? does not exist/i,
      /could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i,
      /column ['"]?([a-zA-Z0-9_]+)['"]? of relation/i,
    ]

    for (const pattern of patterns) {
      const match = combined.match(pattern)
      if (match?.[1]) return match[1]
    }

    return null
  }

  private stripColumnFromRows(rows: any[], column: string): any[] {
    return rows.map((row) => {
      if (!(column in row)) return row
      const copy = { ...row }
      delete copy[column]
      return copy
    })
  }
  // ============================================================================
  // ORCHARD CONFIGURATION MANAGEMENT
  // ============================================================================

  async getOrchardConfigurations(gardenId: string): Promise<OrchardConfiguration[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_configurations')
        .select('*')
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapOrchardConfigurationFromDatabase) || []
    } catch (error) {
      console.error('Error fetching orchard configurations:', error)
      return []
    }
  }

  async createOrchardConfiguration(config: Omit<OrchardConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrchardConfiguration> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_configurations')
        .insert([this.mapOrchardConfigurationToDatabase(config)])
        .select()
        .single()

      if (error) throw error

      return this.mapOrchardConfigurationFromDatabase(data)
    } catch (error) {
      console.error('Error creating orchard configuration:', error)
      throw error
    }
  }

  async updateOrchardConfiguration(id: string, updates: Partial<OrchardConfiguration>): Promise<OrchardConfiguration> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_configurations')
        .update(this.mapOrchardConfigurationToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapOrchardConfigurationFromDatabase(data)
    } catch (error) {
      console.error('Error updating orchard configuration:', error)
      throw error
    }
  }

  async deleteOrchardConfiguration(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('orchard_configurations')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting orchard configuration:', error)
      throw error
    }
  }

  // ============================================================================
  // TREE MANAGEMENT
  // ============================================================================

  async getOrchardTrees(orchardId: string, filters?: TreeSearchCriteria): Promise<OrchardTree[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('orchard_trees')
        .select('*')
        .eq('orchard_id', orchardId)
        .eq('is_active', true)
        .order('row_number', { ascending: true })
        .order('position_in_row', { ascending: true })

      // Apply filters
      if (filters?.variety) {
        query = query.ilike('variety', `%${filters.variety}%`)
      }
      if (filters?.healthStatus && filters.healthStatus.length > 0) {
        query = query.in('health_status', filters.healthStatus)
      }
      if (filters?.vigorLevel && filters.vigorLevel.length > 0) {
        query = query.in('vigor_level', filters.vigorLevel)
      }
      if (filters?.needsPruning !== undefined) {
        query = query.eq('needs_pruning', filters.needsPruning)
      }
      if (filters?.needsTreatment !== undefined) {
        query = query.eq('needs_treatment', filters.needsTreatment)
      }
      if (filters?.location?.zoneId) {
        query = query.eq('zone_id', filters.location.zoneId)
      }
      if (filters?.location?.fieldRowId) {
        query = query.eq('field_row_id', filters.location.fieldRowId)
      }
      if (filters?.location?.rowNumber) {
        query = query.eq('row_number', filters.location.rowNumber)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(this.mapTreeFromDatabase) || []
    } catch (error) {
      console.error('Error fetching orchard trees:', error)
      return []
    }
  }

  async getTreeById(treeId: string): Promise<OrchardTree | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_trees')
        .select('*')
        .eq('id', treeId)
        .single()

      if (error) throw error

      return data ? this.mapTreeFromDatabase(data) : null
    } catch (error) {
      console.error('Error fetching tree by ID:', error)
      return null
    }
  }

  async createTree(tree: Omit<OrchardTree, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrchardTree> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_trees')
        .insert([this.mapTreeToDatabase(tree)])
        .select()
        .single()

      if (error) throw error

      return this.mapTreeFromDatabase(data)
    } catch (error) {
      console.error('Error creating tree:', error)
      throw error
    }
  }

  async updateTree(id: string, updates: Partial<OrchardTree>): Promise<OrchardTree> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_trees')
        .update(this.mapTreeToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapTreeFromDatabase(data)
    } catch (error) {
      console.error('Error updating tree:', error)
      throw error
    }
  }

  async deleteTree(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('orchard_trees')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting tree:', error)
      throw error
    }
  }

  async bulkCreateTrees(trees: Omit<OrchardTree, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<OrchardTree[]> {
    try {
      const supabase = getSupabaseClient()
      const mappedTrees = trees.map(tree => this.mapTreeToDatabase(tree))
      if (mappedTrees.length === 0) return []

      const createdRows: any[] = []

      for (let i = 0; i < mappedTrees.length; i += this.BULK_TREE_CHUNK_SIZE) {
        const chunk = mappedTrees.slice(i, i + this.BULK_TREE_CHUNK_SIZE)
        let sanitizedChunk = [...chunk]
        let lastError: any = null

        for (let attempt = 0; attempt < 20; attempt++) {
          const { data, error } = await supabase
            .from('orchard_trees')
            .insert(sanitizedChunk)
            .select()

          if (!error) {
            createdRows.push(...(data || []))
            lastError = null
            break
          }

          lastError = error
          if (!this.isMissingColumnError(error)) break

          const missingColumn = this.extractMissingColumn(error)
          if (!missingColumn) break

          const hasColumn = sanitizedChunk.some((row) => Object.prototype.hasOwnProperty.call(row, missingColumn))
          if (!hasColumn) break

          console.warn(`orchard_trees schema drift detected, retrying without column: ${missingColumn}`)
          sanitizedChunk = this.stripColumnFromRows(sanitizedChunk, missingColumn)
        }

        if (lastError) {
          throw lastError
        }
      }

      return createdRows.map(this.mapTreeFromDatabase)
    } catch (error) {
      console.error('Error bulk creating trees:', error)
      throw error
    }
  }

  // ============================================================================
  // TREE PHOTOS MANAGEMENT
  // ============================================================================

  async getTreePhotos(treeId: string): Promise<TreePhoto[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_photos')
        .select('*')
        .eq('tree_id', treeId)
        .order('taken_date', { ascending: false })

      if (error) throw error

      return data?.map(this.mapTreePhotoFromDatabase) || []
    } catch (error) {
      console.error('Error fetching tree photos:', error)
      return []
    }
  }

  async addTreePhoto(photo: Omit<TreePhoto, 'id' | 'createdAt'>): Promise<TreePhoto> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_photos')
        .insert([this.mapTreePhotoToDatabase(photo)])
        .select()
        .single()

      if (error) throw error

      return this.mapTreePhotoFromDatabase(data)
    } catch (error) {
      console.error('Error adding tree photo:', error)
      throw error
    }
  }

  async deleteTreePhoto(photoId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('tree_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting tree photo:', error)
      throw error
    }
  }

  // ============================================================================
  // PHENOLOGICAL MONITORING
  // ============================================================================

  async getPhenologicalObservations(orchardId: string, treeId?: string): Promise<PhenologicalObservation[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('phenological_observations')
        .select('*')
        .order('observation_date', { ascending: false })

      if (treeId) {
        query = query.eq('tree_id', treeId)
      } else {
        query = query.eq('orchard_id', orchardId)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(this.mapPhenologicalObservationFromDatabase) || []
    } catch (error) {
      console.error('Error fetching phenological observations:', error)
      return []
    }
  }

  async addPhenologicalObservation(observation: Omit<PhenologicalObservation, 'id' | 'createdAt'>): Promise<PhenologicalObservation> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('phenological_observations')
        .insert([this.mapPhenologicalObservationToDatabase(observation)])
        .select()
        .single()

      if (error) throw error

      return this.mapPhenologicalObservationFromDatabase(data)
    } catch (error) {
      console.error('Error adding phenological observation:', error)
      throw error
    }
  }

  // ============================================================================
  // PRUNING MANAGEMENT
  // ============================================================================

  async getPruningSchedules(orchardId: string): Promise<PruningSchedule[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('pruning_schedules')
        .select('*')
        .eq('orchard_id', orchardId)
        .order('scheduled_start_date', { ascending: true })

      if (error) throw error

      return data?.map(this.mapPruningScheduleFromDatabase) || []
    } catch (error) {
      console.error('Error fetching pruning schedules:', error)
      return []
    }
  }

  async createPruningSchedule(schedule: Omit<PruningSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PruningSchedule> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('pruning_schedules')
        .insert([this.mapPruningScheduleToDatabase(schedule)])
        .select()
        .single()

      if (error) throw error

      return this.mapPruningScheduleFromDatabase(data)
    } catch (error) {
      console.error('Error creating pruning schedule:', error)
      throw error
    }
  }

  async getTreePruningRecords(treeId: string): Promise<TreePruningRecord[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_pruning_records')
        .select('*')
        .eq('tree_id', treeId)
        .order('pruning_date', { ascending: false })

      if (error) throw error

      return data?.map(this.mapTreePruningRecordFromDatabase) || []
    } catch (error) {
      console.error('Error fetching tree pruning records:', error)
      return []
    }
  }

  async addTreePruningRecord(record: Omit<TreePruningRecord, 'id' | 'createdAt'>): Promise<TreePruningRecord> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_pruning_records')
        .insert([this.mapTreePruningRecordToDatabase(record)])
        .select()
        .single()

      if (error) throw error

      return this.mapTreePruningRecordFromDatabase(data)
    } catch (error) {
      console.error('Error adding tree pruning record:', error)
      throw error
    }
  }

  // ============================================================================
  // HARVEST MANAGEMENT
  // ============================================================================

  async getHarvestSchedules(orchardId: string): Promise<HarvestSchedule[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('harvest_schedules')
        .select('*')
        .eq('orchard_id', orchardId)
        .order('estimated_start_date', { ascending: true })

      if (error) throw error

      return data?.map(this.mapHarvestScheduleFromDatabase) || []
    } catch (error) {
      console.error('Error fetching harvest schedules:', error)
      return []
    }
  }

  async createHarvestSchedule(schedule: Omit<HarvestSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<HarvestSchedule> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('harvest_schedules')
        .insert([this.mapHarvestScheduleToDatabase(schedule)])
        .select()
        .single()

      if (error) throw error

      return this.mapHarvestScheduleFromDatabase(data)
    } catch (error) {
      console.error('Error creating harvest schedule:', error)
      throw error
    }
  }

  async getTreeHarvestRecords(treeId: string): Promise<TreeHarvestRecord[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_harvest_records')
        .select('*')
        .eq('tree_id', treeId)
        .order('harvest_date', { ascending: false })

      if (error) throw error

      return data?.map(this.mapTreeHarvestRecordFromDatabase) || []
    } catch (error) {
      console.error('Error fetching tree harvest records:', error)
      return []
    }
  }

  async getOrchardHarvestRecords(orchardId: string): Promise<TreeHarvestRecord[]> {
    try {
      const trees = await this.getOrchardTrees(orchardId)
      const treeIds = trees.map((tree) => tree.id).filter(Boolean)
      if (treeIds.length === 0) return []

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_harvest_records')
        .select('*')
        .in('tree_id', treeIds)
        .order('harvest_date', { ascending: false })

      if (error) throw error

      return data?.map(this.mapTreeHarvestRecordFromDatabase) || []
    } catch (error) {
      console.error('Error fetching orchard harvest records:', error)
      return []
    }
  }

  async addTreeHarvestRecord(record: Omit<TreeHarvestRecord, 'id' | 'createdAt'>): Promise<TreeHarvestRecord> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_harvest_records')
        .insert([this.mapTreeHarvestRecordToDatabase(record)])
        .select()
        .single()

      if (error) throw error

      const { data: treeHarvestRows, error: treeHarvestError } = await supabase
        .from('tree_harvest_records')
        .select('quantity_kg, harvest_date')
        .eq('tree_id', record.treeId)

      if (treeHarvestError) throw treeHarvestError

      const allHarvestRows = treeHarvestRows || []
      const cumulativeYieldKg = allHarvestRows.reduce((sum, item) => {
        const quantity = Number(item.quantity_kg || 0)
        return sum + (Number.isFinite(quantity) ? quantity : 0)
      }, 0)

      const latestHarvest = allHarvestRows
        .filter((item) => this.parseDate(item.harvest_date))
        .sort((left, right) => {
          const leftTime = this.parseDate(left.harvest_date)?.getTime() || 0
          const rightTime = this.parseDate(right.harvest_date)?.getTime() || 0
          return rightTime - leftTime
        })[0]

      await this.updateTree(record.treeId, {
        lastHarvestKg: Number(latestHarvest?.quantity_kg || record.quantityKg || 0),
        lastHarvestDate: latestHarvest?.harvest_date || record.harvestDate,
        cumulativeYieldKg: this.roundToSingleDecimal(cumulativeYieldKg)
      })

      return this.mapTreeHarvestRecordFromDatabase(data)
    } catch (error) {
      console.error('Error adding tree harvest record:', error)
      throw error
    }
  }

  // ============================================================================
  // TREE TREATMENTS
  // ============================================================================

  async getTreeTreatments(treeId: string): Promise<TreeTreatment[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_treatments')
        .select('*')
        .eq('tree_id', treeId)
        .order('treatment_date', { ascending: false })

      if (error) throw error

      return data?.map(this.mapTreeTreatmentFromDatabase) || []
    } catch (error) {
      console.error('Error fetching tree treatments:', error)
      return []
    }
  }

  async addTreeTreatment(treatment: Omit<TreeTreatment, 'id' | 'createdAt'>): Promise<TreeTreatment> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('tree_treatments')
        .insert([this.mapTreeTreatmentToDatabase(treatment)])
        .select()
        .single()

      if (error) throw error

      return this.mapTreeTreatmentFromDatabase(data)
    } catch (error) {
      console.error('Error adding tree treatment:', error)
      throw error
    }
  }

  // ============================================================================
  // ANALYTICS AND DASHBOARD
  // ============================================================================

  async getOrchardDashboardData(gardenId: string): Promise<OrchardDashboardData> {
    try {
      const supabase = getSupabaseClient()
      const safeRows = async (label: string, query: PromiseLike<{ data: any[] | null; error: any }>) => {
        const result = await query
        if (result.error) {
          console.error(`Error loading orchard dashboard ${label}:`, result.error)
          return []
        }
        return result.data || []
      }

      const [orchards, trees] = await Promise.all([
        safeRows(
          'orchards',
          supabase
            .from('orchard_configurations')
            .select('*')
            .eq('garden_id', gardenId)
        ),
        safeRows(
          'trees',
          supabase
            .from('orchard_trees')
            .select('*')
            .eq('garden_id', gardenId)
            .eq('is_active', true)
        )
      ])

      const orchardIds = orchards.map((orchard) => orchard.id).filter(Boolean)
      const treeIds = trees.map((tree) => tree.id).filter(Boolean)

      const [
        pruningSchedules,
        harvestSchedules,
        pruningRecords,
        harvestRecords,
        treatmentRecords
      ] = await Promise.all([
        orchardIds.length > 0
          ? safeRows(
              'pruning schedules',
              supabase
                .from('pruning_schedules')
                .select('*')
                .in('orchard_id', orchardIds)
            )
          : Promise.resolve([]),
        orchardIds.length > 0
          ? safeRows(
              'harvest schedules',
              supabase
                .from('harvest_schedules')
                .select('*')
                .in('orchard_id', orchardIds)
            )
          : Promise.resolve([]),
        treeIds.length > 0
          ? safeRows(
              'pruning records',
              supabase
                .from('tree_pruning_records')
                .select('*')
                .in('tree_id', treeIds)
            )
          : Promise.resolve([]),
        treeIds.length > 0
          ? safeRows(
              'harvest records',
              supabase
                .from('tree_harvest_records')
                .select('*')
                .in('tree_id', treeIds)
            )
          : Promise.resolve([]),
        treeIds.length > 0
          ? safeRows(
              'tree treatments',
              supabase
                .from('tree_treatments')
                .select('*')
                .in('tree_id', treeIds)
            )
          : Promise.resolve([])
      ])

      const totalOrchards = orchards.length
      const totalTrees = trees.length
      const attentionHealthStates = new Set(['stressed', 'diseased', 'pest_damage', 'weather_damage', 'dead'])
      const healthyTrees = trees.filter((tree) => tree.health_status === 'healthy').length
      const treesNeedingAttention = trees.filter((tree) =>
        tree.needs_pruning ||
        tree.needs_treatment ||
        tree.needs_replacement ||
        attentionHealthStates.has(tree.health_status)
      ).length
      const healthyTreesPercentage = totalTrees > 0
        ? this.clampPercentage((healthyTrees / totalTrees) * 100)
        : 0

      const treeById = new Map(trees.map((tree) => [tree.id, tree]))
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const nextThirtyDays = new Date(startOfToday)
      nextThirtyDays.setDate(nextThirtyDays.getDate() + 30)
      const currentYear = today.getFullYear()

      const isOpenSchedule = (status?: string) => status !== 'completed' && status !== 'cancelled'
      const getDuePriority = (dateValue?: string): 'low' | 'medium' | 'high' => {
        const dueDate = this.parseDate(dateValue)
        if (!dueDate) return 'medium'
        const diffDays = Math.ceil((dueDate.getTime() - startOfToday.getTime()) / 86400000)
        if (diffDays <= 7) return 'high'
        if (diffDays <= 21) return 'medium'
        return 'low'
      }

      const upcomingHarvestSchedules = harvestSchedules.filter((schedule) => {
        if (!isOpenSchedule(schedule.status)) return false
        const estimatedStart = this.parseDate(schedule.estimated_start_date)
        if (!estimatedStart) return false
        return estimatedStart >= startOfToday && estimatedStart <= nextThirtyDays
      })

      const currentYearHarvestRecords = harvestRecords.filter((record) => {
        const harvestDate = this.parseDate(record.harvest_date)
        return harvestDate?.getFullYear() === currentYear
      })

      let totalYieldThisYear = currentYearHarvestRecords.reduce((sum, record) => {
        const quantity = Number(record.quantity_kg || 0)
        return sum + (Number.isFinite(quantity) ? quantity : 0)
      }, 0)

      let harvestedTreeIds = new Set(currentYearHarvestRecords.map((record) => record.tree_id).filter(Boolean))

      if (totalYieldThisYear === 0) {
        const lastHarvestFallbackTrees = trees.filter((tree) => {
          const lastHarvestDate = this.parseDate(tree.last_harvest_date)
          const lastHarvestKg = Number(tree.last_harvest_kg || 0)
          return lastHarvestDate?.getFullYear() === currentYear && lastHarvestKg > 0
        })

        if (lastHarvestFallbackTrees.length > 0) {
          totalYieldThisYear = lastHarvestFallbackTrees.reduce((sum, tree) => sum + Number(tree.last_harvest_kg || 0), 0)
          harvestedTreeIds = new Set(lastHarvestFallbackTrees.map((tree) => tree.id))
        }
      }

      const averageYieldPerTree = harvestedTreeIds.size > 0
        ? this.roundToSingleDecimal(totalYieldThisYear / harvestedTreeIds.size)
        : 0

      const qualityWeights: Record<string, number> = {
        premium: 100,
        first: 85,
        second: 65,
        processing: 35,
        waste: 10
      }

      const qualityWeightTotal = currentYearHarvestRecords.reduce((sum, record) => {
        const quantity = Number(record.quantity_kg || 0) || 1
        return sum + quantity
      }, 0)

      const qualityScore = qualityWeightTotal > 0
        ? currentYearHarvestRecords.reduce((sum, record) => {
            const quantity = Number(record.quantity_kg || 0) || 1
            const score = qualityWeights[record.quality_class] ?? 50
            return sum + score * quantity
          }, 0) / qualityWeightTotal
        : 0

      const expectedYieldTotal = trees.reduce((sum, tree) => {
        const expectedYield = Number(tree.expected_yield_kg || 0)
        return sum + (Number.isFinite(expectedYield) ? expectedYield : 0)
      }, 0)

      const yieldPerformanceScore = expectedYieldTotal > 0 && totalYieldThisYear > 0
        ? this.clampPercentage((totalYieldThisYear / expectedYieldTotal) * 100)
        : 0

      const completedHarvestSchedules = harvestSchedules.filter((schedule) => schedule.status === 'completed')
      const totalRevenue = completedHarvestSchedules.reduce((sum, schedule) => {
        const directRevenue = Number(schedule.total_revenue || 0)
        if (directRevenue > 0) return sum + directRevenue
        const actualYield = Number(schedule.actual_yield_kg || 0)
        const actualPrice = Number(schedule.actual_price_per_kg || 0)
        return sum + (actualYield > 0 && actualPrice > 0 ? actualYield * actualPrice : 0)
      }, 0)
      const totalCosts = completedHarvestSchedules.reduce((sum, schedule) => {
        const harvestCosts = Number(schedule.harvest_costs || 0)
        return sum + (Number.isFinite(harvestCosts) ? harvestCosts : 0)
      }, 0)

      const profitabilityScore = totalRevenue > 0
        ? this.clampPercentage(((totalRevenue - totalCosts) / totalRevenue) * 100)
        : this.clampPercentage(
            healthyTreesPercentage * 0.45 +
            qualityScore * 0.3 +
            yieldPerformanceScore * 0.25
          )

      const formatPruningType = (value?: string) => {
        switch (value) {
          case 'winter': return 'Potatura invernale'
          case 'summer': return 'Potatura verde'
          case 'training': return 'Potatura di allevamento'
          case 'production': return 'Potatura di produzione'
          case 'renovation': return 'Potatura di rinnovo'
          case 'corrective': return 'Potatura correttiva'
          default: return 'Potatura'
        }
      }

      const formatTreatmentType = (value?: string) => {
        switch (value) {
          case 'fertilization': return 'Fertilizzazione'
          case 'pest_control': return 'Controllo parassiti'
          case 'disease_control': return 'Controllo malattie'
          case 'weed_control': return 'Controllo infestanti'
          case 'growth_regulation': return 'Regolazione crescita'
          case 'soil_amendment': return 'Ammendamento suolo'
          case 'foliar_nutrition': return 'Nutrizione fogliare'
          default: return 'Trattamento'
        }
      }

      const recentActivities = [
        ...harvestRecords.map((record) => {
          const tree = treeById.get(record.tree_id)
          const quantity = Number(record.quantity_kg || 0)
          return {
            id: `harvest-${record.id}`,
            type: 'harvest' as const,
            date: record.harvest_date,
            treeNumber: tree?.tree_number,
            variety: tree?.variety,
            description: quantity > 0 ? `Raccolta registrata: ${this.roundToSingleDecimal(quantity)} kg` : 'Raccolta registrata',
            quantityKg: quantity > 0 ? this.roundToSingleDecimal(quantity) : undefined,
            operator: record.operator_name
          }
        }),
        ...pruningRecords.map((record) => {
          const tree = treeById.get(record.tree_id)
          return {
            id: `pruning-${record.id}`,
            type: 'pruning' as const,
            date: record.pruning_date,
            treeNumber: tree?.tree_number,
            variety: tree?.variety,
            description: formatPruningType(record.pruning_type),
            operator: record.operator_name
          }
        }),
        ...treatmentRecords.map((record) => {
          const tree = treeById.get(record.tree_id)
          return {
            id: `treatment-${record.id}`,
            type: 'treatment' as const,
            date: record.treatment_date,
            treeNumber: tree?.tree_number,
            variety: tree?.variety,
            description: formatTreatmentType(record.treatment_type),
            operator: record.operator_name
          }
        })
      ]
        .filter((activity) => this.parseDate(activity.date))
        .sort((left, right) => {
          const leftTime = this.parseDate(left.date)?.getTime() || 0
          const rightTime = this.parseDate(right.date)?.getTime() || 0
          return rightTime - leftTime
        })
        .slice(0, 8)

      const upcomingTasks = [
        ...pruningSchedules
          .filter((schedule) => isOpenSchedule(schedule.status) && this.parseDate(schedule.scheduled_start_date))
          .map((schedule) => ({
            id: `pruning-${schedule.id}`,
            type: 'pruning' as const,
            title: schedule.name || 'Intervento di potatura',
            dueDate: schedule.scheduled_start_date,
            estimatedDuration: this.roundToSingleDecimal(
              Number(schedule.total_estimated_hours || 0) ||
              (Number(schedule.estimated_hours_per_tree || 0) * Number(schedule.estimated_trees || 0)) ||
              2
            ),
            priority: getDuePriority(schedule.scheduled_start_date)
          })),
        ...harvestSchedules
          .filter((schedule) => isOpenSchedule(schedule.status) && this.parseDate(schedule.estimated_start_date))
          .map((schedule) => ({
            id: `harvest-${schedule.id}`,
            type: 'harvest' as const,
            title: schedule.name || `Raccolta ${schedule.variety || ''}`.trim(),
            dueDate: schedule.estimated_start_date,
            estimatedDuration: this.roundToSingleDecimal(Number(schedule.actual_hours || 0) || 4),
            priority: getDuePriority(schedule.estimated_start_date)
          }))
      ]
        .sort((left, right) => {
          const leftTime = this.parseDate(left.dueDate)?.getTime() || 0
          const rightTime = this.parseDate(right.dueDate)?.getTime() || 0
          return leftTime - rightTime
        })
        .slice(0, 6)

      const diseasedTrees = trees.filter((tree) => tree.health_status === 'diseased').length
      const pestDamageTrees = trees.filter((tree) => tree.health_status === 'pest_damage').length
      const weatherDamageTrees = trees.filter((tree) => tree.health_status === 'weather_damage').length
      const replacementTrees = trees.filter((tree) => tree.needs_replacement || tree.health_status === 'dead').length
      const urgentHarvestSchedules = upcomingHarvestSchedules.filter((schedule) => {
        const estimatedStart = this.parseDate(schedule.estimated_start_date)
        if (!estimatedStart) return false
        const diffDays = Math.ceil((estimatedStart.getTime() - startOfToday.getTime()) / 86400000)
        return diffDays <= 7
      })
      const overduePruningSchedules = pruningSchedules.filter((schedule) => {
        const scheduledStart = this.parseDate(schedule.scheduled_start_date)
        return isOpenSchedule(schedule.status) && !!scheduledStart && scheduledStart < startOfToday
      })

      const criticalAlerts = [
        diseasedTrees > 0 ? {
          id: 'disease-alert',
          type: 'disease' as const,
          severity: diseasedTrees / Math.max(totalTrees, 1) >= 0.1 ? 'critical' as const : 'high' as const,
          title: 'Sintomi di malattia rilevati',
          description: `${diseasedTrees} alberi risultano marcati come malati e richiedono verifica mirata.`,
          affectedTrees: diseasedTrees,
          actionRequired: 'Ispezionare i sintomi e pianificare il trattamento.',
          dueDate: startOfToday.toISOString()
        } : null,
        pestDamageTrees > 0 ? {
          id: 'pest-alert',
          type: 'pest' as const,
          severity: pestDamageTrees / Math.max(totalTrees, 1) >= 0.1 ? 'high' as const : 'medium' as const,
          title: 'Danni da parassiti da verificare',
          description: `${pestDamageTrees} alberi mostrano danni da parassiti.`,
          affectedTrees: pestDamageTrees,
          actionRequired: 'Controllare i focolai e valutare un intervento dedicato.',
          dueDate: startOfToday.toISOString()
        } : null,
        weatherDamageTrees > 0 ? {
          id: 'weather-alert',
          type: 'weather' as const,
          severity: weatherDamageTrees / Math.max(totalTrees, 1) >= 0.1 ? 'high' as const : 'medium' as const,
          title: 'Danni meteo da verificare',
          description: `${weatherDamageTrees} alberi hanno danni da eventi meteo registrati.`,
          affectedTrees: weatherDamageTrees,
          actionRequired: 'Effettuare un controllo strutturale e fotografico degli alberi colpiti.',
          dueDate: startOfToday.toISOString()
        } : null,
        replacementTrees > 0 || overduePruningSchedules.length > 0 ? {
          id: 'maintenance-alert',
          type: 'maintenance' as const,
          severity: replacementTrees > 0 ? 'critical' as const : 'high' as const,
          title: 'Manutenzione frutteto prioritaria',
          description: replacementTrees > 0
            ? `${replacementTrees} alberi richiedono sostituzione o risultano non più attivi.`
            : `${overduePruningSchedules.length} interventi di potatura risultano in ritardo.`,
          affectedTrees: Math.max(
            replacementTrees,
            overduePruningSchedules.reduce((sum, schedule) => sum + Number(schedule.estimated_trees || 0), 0)
          ),
          actionRequired: replacementTrees > 0
            ? 'Valutare i reimpianti e aggiornare la configurazione del frutteto.'
            : 'Riprogrammare e chiudere gli interventi di potatura arretrati.',
          dueDate: overduePruningSchedules[0]?.scheduled_start_date
        } : null,
        urgentHarvestSchedules.length > 0 ? {
          id: 'harvest-alert',
          type: 'harvest_ready' as const,
          severity: urgentHarvestSchedules.length > 1 ? 'high' as const : 'medium' as const,
          title: 'Raccolte imminenti',
          description: `${urgentHarvestSchedules.length} raccolte sono previste entro i prossimi 7 giorni.`,
          affectedTrees: urgentHarvestSchedules.reduce((sum, schedule) => sum + Number(schedule.estimated_trees || 0), 0),
          actionRequired: 'Confermare squadre, logistica e finestre di raccolta.',
          dueDate: urgentHarvestSchedules[0]?.estimated_start_date
        } : null
      ].filter(Boolean)

      return {
        totalOrchards,
        totalTrees,
        treesNeedingAttention,
        upcomingHarvests: upcomingHarvestSchedules.length,
        recentActivities,
        healthyTreesPercentage,
        averageYieldPerTree,
        totalYieldThisYear: this.roundToSingleDecimal(totalYieldThisYear),
        profitabilityScore,
        criticalAlerts: criticalAlerts as OrchardDashboardData['criticalAlerts'],
        upcomingTasks
      }
    } catch (error) {
      console.error('Error fetching orchard dashboard data:', error)
      return {
        totalOrchards: 0,
        totalTrees: 0,
        treesNeedingAttention: 0,
        upcomingHarvests: 0,
        recentActivities: [],
        healthyTreesPercentage: 0,
        averageYieldPerTree: 0,
        totalYieldThisYear: 0,
        profitabilityScore: 0,
        criticalAlerts: [],
        upcomingTasks: []
      }
    }
  }

  async getOrchardAnalytics(orchardId: string, period: string): Promise<OrchardAnalytics | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('orchard_analytics')
        .select('*')
        .eq('orchard_id', orchardId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      return data ? this.mapOrchardAnalyticsFromDatabase(data) : null
    } catch (error) {
      console.error('Error fetching orchard analytics:', error)
      return null
    }
  }

  // ============================================================================
  // WIZARD AND BULK OPERATIONS
  // ============================================================================

  async createOrchardFromWizard(wizardData: OrchardWizardData): Promise<OrchardConfiguration> {
    try {
      const supabase = getSupabaseClient()

      // Start transaction
      const { data: orchard, error: orchardError } = await supabase
        .from('orchard_configurations')
        .insert([{
          garden_id: wizardData.basicInfo?.gardenId,
          name: wizardData.basicInfo?.name || 'New Orchard',
          description: wizardData.basicInfo?.description,
          orchard_type: wizardData.basicInfo?.orchardType || 'mixed',
          established_date: wizardData.basicInfo?.establishedDate,
          total_area_sqm: wizardData.basicInfo?.totalAreaSqm,
          row_spacing_m: wizardData.layout?.rowSpacingM,
          tree_spacing_m: wizardData.layout?.treeSpacingM,
          training_system: wizardData.layout?.trainingSystem,
          irrigation_system: wizardData.layout?.irrigationSystem,
          main_varieties: wizardData.varieties?.mainVarieties || [],
          rootstock_types: wizardData.varieties?.rootstockTypes || [],
          organic_certified: wizardData.management?.organicCertified || false,
          precision_management: wizardData.management?.precisionManagement || false,
          climate_zone: wizardData.management?.climateZone,
          soil_type: wizardData.management?.soilType
        }])
        .select()
        .single()

      if (orchardError) throw orchardError

      // Create trees if provided
      if (wizardData.trees?.treeData && wizardData.trees.treeData.length > 0) {
        const treesToCreate = wizardData.trees.treeData.map(tree => ({
          ...tree,
          orchard_id: orchard.id,
          garden_id: wizardData.basicInfo?.gardenId,
          is_active: true,
          needs_pruning: false,
          needs_treatment: false,
          needs_replacement: false,
          cumulative_yield_kg: 0
        }))

        await this.bulkCreateTrees(treesToCreate as any)
      }

      return this.mapOrchardConfigurationFromDatabase(orchard)
    } catch (error) {
      console.error('Error creating orchard from wizard:', error)
      throw error
    }
  }

  // ============================================================================
  // DATABASE MAPPING METHODS
  // ============================================================================

  private mapOrchardConfigurationFromDatabase(data: any): OrchardConfiguration {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      description: data.description,
      orchardType: data.orchard_type,
      establishedDate: data.established_date,
      totalAreaSqm: data.total_area_sqm,
      totalTrees: data.total_trees || 0,
      treesPerHectare: data.trees_per_hectare,
      rowSpacingM: data.row_spacing_m,
      treeSpacingM: data.tree_spacing_m,
      trainingSystem: data.training_system,
      mainVarieties: data.main_varieties || [],
      rootstockTypes: data.rootstock_types || [],
      climateZone: data.climate_zone,
      soilType: data.soil_type,
      irrigationSystem: data.irrigation_system,
      organicCertified: data.organic_certified || false,
      precisionManagement: data.precision_management || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    }
  }

  private mapOrchardConfigurationToDatabase(config: Partial<OrchardConfiguration>): any {
    return {
      garden_id: config.gardenId,
      name: config.name,
      description: config.description,
      orchard_type: config.orchardType,
      established_date: config.establishedDate,
      total_area_sqm: config.totalAreaSqm,
      total_trees: config.totalTrees,
      trees_per_hectare: config.treesPerHectare,
      row_spacing_m: config.rowSpacingM,
      tree_spacing_m: config.treeSpacingM,
      training_system: config.trainingSystem,
      main_varieties: config.mainVarieties,
      rootstock_types: config.rootstockTypes,
      climate_zone: config.climateZone,
      soil_type: config.soilType,
      irrigation_system: config.irrigationSystem,
      organic_certified: config.organicCertified,
      precision_management: config.precisionManagement
    }
  }

  private mapTreeFromDatabase(data: any): OrchardTree {
    return {
      id: data.id,
      orchardId: data.orchard_id,
      gardenId: data.garden_id,
      treeNumber: data.tree_number,
      qrCode: data.qr_code,
      zoneId: data.zone_id,
      fieldRowId: data.field_row_id,
      sectionId: data.section_id,
      rowNumber: data.row_number,
      positionInRow: data.position_in_row,
      gpsLatitude: data.gps_latitude,
      gpsLongitude: data.gps_longitude,
      variety: data.variety,
      rootstock: data.rootstock,
      plantingDate: data.planting_date,
      treeAgeYears: data.tree_age_years,
      trunkDiameterCm: data.trunk_diameter_cm,
      treeHeightM: data.tree_height_m,
      canopyWidthM: data.canopy_width_m,
      trainingSystem: data.training_system,
      healthStatus: data.health_status,
      vigorLevel: data.vigor_level,
      productivityStatus: data.productivity_status,
      expectedYieldKg: data.expected_yield_kg,
      lastHarvestKg: data.last_harvest_kg,
      lastHarvestDate: data.last_harvest_date,
      cumulativeYieldKg: data.cumulative_yield_kg || 0,
      notes: data.notes,
      specialRequirements: data.special_requirements,
      needsPruning: data.needs_pruning || false,
      needsTreatment: data.needs_treatment || false,
      needsReplacement: data.needs_replacement || false,
      isActive: data.is_active !== false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapTreeToDatabase(tree: Partial<OrchardTree>): any {
    const payload = {
      orchard_id: tree.orchardId,
      garden_id: tree.gardenId,
      tree_number: tree.treeNumber,
      qr_code: tree.qrCode,
      zone_id: tree.zoneId,
      field_row_id: tree.fieldRowId,
      section_id: tree.sectionId,
      row_number: tree.rowNumber,
      position_in_row: tree.positionInRow,
      gps_latitude: tree.gpsLatitude,
      gps_longitude: tree.gpsLongitude,
      variety: tree.variety,
      rootstock: tree.rootstock,
      planting_date: tree.plantingDate,
      tree_age_years: tree.treeAgeYears,
      trunk_diameter_cm: tree.trunkDiameterCm,
      tree_height_m: tree.treeHeightM,
      canopy_width_m: tree.canopyWidthM,
      training_system: tree.trainingSystem,
      health_status: tree.healthStatus,
      vigor_level: tree.vigorLevel,
      productivity_status: tree.productivityStatus,
      expected_yield_kg: tree.expectedYieldKg,
      last_harvest_kg: tree.lastHarvestKg,
      last_harvest_date: tree.lastHarvestDate,
      cumulative_yield_kg: tree.cumulativeYieldKg,
      notes: tree.notes,
      special_requirements: tree.specialRequirements,
      needs_pruning: tree.needsPruning,
      needs_treatment: tree.needsTreatment,
      needs_replacement: tree.needsReplacement,
      is_active: tree.isActive
    }

    // Avoid sending undefined fields to Supabase (prevents schema drift 400 errors).
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    )
  }

  // Additional mapping methods would be implemented here for other types
  // (TreePhoto, PhenologicalObservation, etc.) following the same pattern

  private mapTreePhotoFromDatabase(data: any): TreePhoto {
    return {
      id: data.id,
      treeId: data.tree_id,
      photoUrl: data.photo_url,
      photoType: data.photo_type,
      takenDate: data.taken_date,
      phenologicalStage: data.phenological_stage,
      aiAnalysis: data.ai_analysis,
      annotations: data.annotations,
      weatherConditions: data.weather_conditions,
      notes: data.notes,
      createdAt: data.created_at,
      createdBy: data.created_by
    }
  }

  private mapTreePhotoToDatabase(photo: Partial<TreePhoto>): any {
    return {
      tree_id: photo.treeId,
      photo_url: photo.photoUrl,
      photo_type: photo.photoType,
      taken_date: photo.takenDate,
      phenological_stage: photo.phenologicalStage,
      ai_analysis: photo.aiAnalysis,
      annotations: photo.annotations,
      weather_conditions: photo.weatherConditions,
      notes: photo.notes
    }
  }

  private mapPhenologicalObservationFromDatabase(data: any): PhenologicalObservation {
    return {
      id: data.id,
      treeId: data.tree_id,
      orchardId: data.orchard_id,
      observationDate: data.observation_date,
      phenologicalStage: data.phenological_stage,
      stageIntensity: data.stage_intensity,
      bbchCode: data.bbch_code,
      bbchDescription: data.bbch_description,
      temperatureC: data.temperature_c,
      humidityPercent: data.humidity_percent,
      weatherConditions: data.weather_conditions,
      observationMethod: data.observation_method,
      confidenceLevel: data.confidence_level,
      photos: data.photos || [],
      notes: data.notes,
      createdAt: data.created_at,
      createdBy: data.created_by
    }
  }

  private mapPhenologicalObservationToDatabase(observation: Partial<PhenologicalObservation>): any {
    return {
      tree_id: observation.treeId,
      orchard_id: observation.orchardId,
      observation_date: observation.observationDate,
      phenological_stage: observation.phenologicalStage,
      stage_intensity: observation.stageIntensity,
      bbch_code: observation.bbchCode,
      bbch_description: observation.bbchDescription,
      temperature_c: observation.temperatureC,
      humidity_percent: observation.humidityPercent,
      weather_conditions: observation.weatherConditions,
      observation_method: observation.observationMethod,
      confidence_level: observation.confidenceLevel,
      photos: observation.photos,
      notes: observation.notes
    }
  }

  private mapPruningScheduleFromDatabase(data: any): PruningSchedule {
    return {
      id: data.id,
      orchardId: data.orchard_id,
      name: data.name,
      pruningType: data.pruning_type,
      scheduledStartDate: data.scheduled_start_date,
      scheduledEndDate: data.scheduled_end_date,
      optimalPhenologicalStage: data.optimal_phenological_stage,
      targetCriteria: data.target_criteria || {},
      estimatedTrees: data.estimated_trees,
      pruningIntensity: data.pruning_intensity,
      pruningObjectives: data.pruning_objectives || [],
      techniques: data.techniques || [],
      estimatedHoursPerTree: data.estimated_hours_per_tree,
      totalEstimatedHours: data.total_estimated_hours,
      requiredTools: data.required_tools || [],
      status: data.status,
      completionPercentage: data.completion_percentage || 0,
      actualStartDate: data.actual_start_date,
      actualEndDate: data.actual_end_date,
      actualHours: data.actual_hours,
      treesPruned: data.trees_pruned || 0,
      instructions: data.instructions,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    }
  }

  private mapPruningScheduleToDatabase(schedule: Partial<PruningSchedule>): any {
    return {
      orchard_id: schedule.orchardId,
      name: schedule.name,
      pruning_type: schedule.pruningType,
      scheduled_start_date: schedule.scheduledStartDate,
      scheduled_end_date: schedule.scheduledEndDate,
      optimal_phenological_stage: schedule.optimalPhenologicalStage,
      target_criteria: schedule.targetCriteria,
      estimated_trees: schedule.estimatedTrees,
      pruning_intensity: schedule.pruningIntensity,
      pruning_objectives: schedule.pruningObjectives,
      techniques: schedule.techniques,
      estimated_hours_per_tree: schedule.estimatedHoursPerTree,
      total_estimated_hours: schedule.totalEstimatedHours,
      required_tools: schedule.requiredTools,
      status: schedule.status,
      completion_percentage: schedule.completionPercentage,
      actual_start_date: schedule.actualStartDate,
      actual_end_date: schedule.actualEndDate,
      actual_hours: schedule.actualHours,
      trees_pruned: schedule.treesPruned,
      instructions: schedule.instructions,
      notes: schedule.notes
    }
  }

  private mapTreePruningRecordFromDatabase(data: any): TreePruningRecord {
    return {
      id: data.id,
      treeId: data.tree_id,
      pruningScheduleId: data.pruning_schedule_id,
      pruningDate: data.pruning_date,
      pruningType: data.pruning_type,
      operatorName: data.operator_name,
      durationMinutes: data.duration_minutes,
      branchesRemoved: data.branches_removed,
      woodRemovedKg: data.wood_removed_kg,
      pruningIntensity: data.pruning_intensity,
      techniquesUsed: data.techniques_used || [],
      treeConditionBefore: data.tree_condition_before,
      treeConditionAfter: data.tree_condition_after,
      pruningQuality: data.pruning_quality,
      objectivesMet: data.objectives_met || [],
      beforePhotos: data.before_photos || [],
      afterPhotos: data.after_photos || [],
      notes: data.notes,
      followUpRequired: data.follow_up_required || false,
      followUpDate: data.follow_up_date,
      followUpNotes: data.follow_up_notes,
      createdAt: data.created_at,
      createdBy: data.created_by
    }
  }

  private mapTreePruningRecordToDatabase(record: Partial<TreePruningRecord>): any {
    return {
      tree_id: record.treeId,
      pruning_schedule_id: record.pruningScheduleId,
      pruning_date: record.pruningDate,
      pruning_type: record.pruningType,
      operator_name: record.operatorName,
      duration_minutes: record.durationMinutes,
      branches_removed: record.branchesRemoved,
      wood_removed_kg: record.woodRemovedKg,
      pruning_intensity: record.pruningIntensity,
      techniques_used: record.techniquesUsed,
      tree_condition_before: record.treeConditionBefore,
      tree_condition_after: record.treeConditionAfter,
      pruning_quality: record.pruningQuality,
      objectives_met: record.objectivesMet,
      before_photos: record.beforePhotos,
      after_photos: record.afterPhotos,
      notes: record.notes,
      follow_up_required: record.followUpRequired,
      follow_up_date: record.followUpDate,
      follow_up_notes: record.followUpNotes
    }
  }

  private mapHarvestScheduleFromDatabase(data: any): HarvestSchedule {
    return {
      id: data.id,
      orchardId: data.orchard_id,
      name: data.name,
      variety: data.variety,
      harvestType: data.harvest_type,
      estimatedStartDate: data.estimated_start_date,
      estimatedEndDate: data.estimated_end_date,
      optimalMaturityIndices: data.optimal_maturity_indices,
      targetZones: data.target_zones || [],
      estimatedTrees: data.estimated_trees,
      estimatedYieldKg: data.estimated_yield_kg,
      qualityStandards: data.quality_standards,
      harvestMethod: data.harvest_method,
      containersNeeded: data.containers_needed,
      storageRequirements: data.storage_requirements,
      transportArrangements: data.transport_arrangements,
      targetMarket: data.target_market,
      expectedPricePerKg: data.expected_price_per_kg,
      status: data.status,
      completionPercentage: data.completion_percentage || 0,
      actualStartDate: data.actual_start_date,
      actualEndDate: data.actual_end_date,
      actualYieldKg: data.actual_yield_kg,
      actualTreesHarvested: data.actual_trees_harvested,
      averageQualityScore: data.average_quality_score,
      qualityDistribution: data.quality_distribution,
      actualPricePerKg: data.actual_price_per_kg,
      totalRevenue: data.total_revenue,
      harvestCosts: data.harvest_costs,
      instructions: data.instructions,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    }
  }

  private mapHarvestScheduleToDatabase(schedule: Partial<HarvestSchedule>): any {
    return {
      orchard_id: schedule.orchardId,
      name: schedule.name,
      variety: schedule.variety,
      harvest_type: schedule.harvestType,
      estimated_start_date: schedule.estimatedStartDate,
      estimated_end_date: schedule.estimatedEndDate,
      optimal_maturity_indices: schedule.optimalMaturityIndices,
      target_zones: schedule.targetZones,
      estimated_trees: schedule.estimatedTrees,
      estimated_yield_kg: schedule.estimatedYieldKg,
      quality_standards: schedule.qualityStandards,
      harvest_method: schedule.harvestMethod,
      containers_needed: schedule.containersNeeded,
      storage_requirements: schedule.storageRequirements,
      transport_arrangements: schedule.transportArrangements,
      target_market: schedule.targetMarket,
      expected_price_per_kg: schedule.expectedPricePerKg,
      status: schedule.status,
      completion_percentage: schedule.completionPercentage,
      actual_start_date: schedule.actualStartDate,
      actual_end_date: schedule.actualEndDate,
      actual_yield_kg: schedule.actualYieldKg,
      actual_trees_harvested: schedule.actualTreesHarvested,
      average_quality_score: schedule.averageQualityScore,
      quality_distribution: schedule.qualityDistribution,
      actual_price_per_kg: schedule.actualPricePerKg,
      total_revenue: schedule.totalRevenue,
      harvest_costs: schedule.harvestCosts,
      instructions: schedule.instructions,
      notes: schedule.notes
    }
  }

  private mapTreeHarvestRecordFromDatabase(data: any): TreeHarvestRecord {
    return {
      id: data.id,
      treeId: data.tree_id,
      harvestScheduleId: data.harvest_schedule_id,
      harvestDate: data.harvest_date,
      harvestTime: data.harvest_time,
      operatorName: data.operator_name,
      pickerId: data.picker_id,
      quantityKg: data.quantity_kg,
      fruitCount: data.fruit_count,
      averageFruitWeightG: data.average_fruit_weight_g,
      qualityClass: data.quality_class,
      brixLevel: data.brix_level,
      firmnessKgCm2: data.firmness_kg_cm2,
      colorScore: data.color_score,
      defectsPercentage: data.defects_percentage,
      starchIndex: data.starch_index,
      acidityLevel: data.acidity_level,
      oilContentPercentage: data.oil_content_percentage,
      weatherConditions: data.weather_conditions,
      temperatureC: data.temperature_c,
      humidityPercent: data.humidity_percent,
      containerId: data.container_id,
      storageLocation: data.storage_location,
      photos: data.photos || [],
      qualityPhotos: data.quality_photos || [],
      notes: data.notes,
      batchNumber: data.batch_number,
      lotNumber: data.lot_number,
      createdAt: data.created_at,
      createdBy: data.created_by
    }
  }

  private mapTreeHarvestRecordToDatabase(record: Partial<TreeHarvestRecord>): any {
    return {
      tree_id: record.treeId,
      harvest_schedule_id: record.harvestScheduleId,
      harvest_date: record.harvestDate,
      harvest_time: record.harvestTime,
      operator_name: record.operatorName,
      picker_id: record.pickerId,
      quantity_kg: record.quantityKg,
      fruit_count: record.fruitCount,
      average_fruit_weight_g: record.averageFruitWeightG,
      quality_class: record.qualityClass,
      brix_level: record.brixLevel,
      firmness_kg_cm2: record.firmnessKgCm2,
      color_score: record.colorScore,
      defects_percentage: record.defectsPercentage,
      starch_index: record.starchIndex,
      acidity_level: record.acidityLevel,
      oil_content_percentage: record.oilContentPercentage,
      weather_conditions: record.weatherConditions,
      temperature_c: record.temperatureC,
      humidity_percent: record.humidityPercent,
      container_id: record.containerId,
      storage_location: record.storageLocation,
      photos: record.photos,
      quality_photos: record.qualityPhotos,
      notes: record.notes,
      batch_number: record.batchNumber,
      lot_number: record.lotNumber
    }
  }

  private mapTreeTreatmentFromDatabase(data: any): TreeTreatment {
    return {
      id: data.id,
      treeId: data.tree_id,
      treatmentDate: data.treatment_date,
      treatmentType: data.treatment_type,
      productName: data.product_name,
      activeIngredient: data.active_ingredient,
      concentration: data.concentration,
      dosage: data.dosage,
      dosageUnit: data.dosage_unit,
      applicationMethod: data.application_method,
      equipmentUsed: data.equipment_used,
      operatorName: data.operator_name,
      targetPestDisease: data.target_pest_disease,
      treatmentReason: data.treatment_reason,
      severityLevel: data.severity_level,
      weatherConditions: data.weather_conditions,
      temperatureC: data.temperature_c,
      windSpeedKmh: data.wind_speed_kmh,
      humidityPercent: data.humidity_percent,
      effectivenessRating: data.effectiveness_rating,
      effectivenessNotes: data.effectiveness_notes,
      followUpRequired: data.follow_up_required || false,
      followUpDate: data.follow_up_date,
      preharvestIntervalDays: data.preharvest_interval_days,
      reentryIntervalHours: data.reentry_interval_hours,
      organicApproved: data.organic_approved || false,
      beforePhotos: data.before_photos || [],
      afterPhotos: data.after_photos || [],
      notes: data.notes,
      productCost: data.product_cost,
      laborCost: data.labor_cost,
      totalCost: data.total_cost,
      createdAt: data.created_at,
      createdBy: data.created_by
    }
  }

  private mapTreeTreatmentToDatabase(treatment: Partial<TreeTreatment>): any {
    return {
      tree_id: treatment.treeId,
      treatment_date: treatment.treatmentDate,
      treatment_type: treatment.treatmentType,
      product_name: treatment.productName,
      active_ingredient: treatment.activeIngredient,
      concentration: treatment.concentration,
      dosage: treatment.dosage,
      dosage_unit: treatment.dosageUnit,
      application_method: treatment.applicationMethod,
      equipment_used: treatment.equipmentUsed,
      operator_name: treatment.operatorName,
      target_pest_disease: treatment.targetPestDisease,
      treatment_reason: treatment.treatmentReason,
      severity_level: treatment.severityLevel,
      weather_conditions: treatment.weatherConditions,
      temperature_c: treatment.temperatureC,
      wind_speed_kmh: treatment.windSpeedKmh,
      humidity_percent: treatment.humidityPercent,
      effectiveness_rating: treatment.effectivenessRating,
      effectiveness_notes: treatment.effectivenessNotes,
      follow_up_required: treatment.followUpRequired,
      follow_up_date: treatment.followUpDate,
      preharvest_interval_days: treatment.preharvestIntervalDays,
      reentry_interval_hours: treatment.reentryIntervalHours,
      organic_approved: treatment.organicApproved,
      before_photos: treatment.beforePhotos,
      after_photos: treatment.afterPhotos,
      notes: treatment.notes,
      product_cost: treatment.productCost,
      labor_cost: treatment.laborCost,
      total_cost: treatment.totalCost
    }
  }

  private mapOrchardAnalyticsFromDatabase(data: any): OrchardAnalytics {
    return {
      id: data.id,
      orchardId: data.orchard_id,
      analysisDate: data.analysis_date,
      periodStart: data.period_start,
      periodEnd: data.period_end,
      totalYieldKg: data.total_yield_kg,
      yieldPerTreeKg: data.yield_per_tree_kg,
      yieldPerHectareKg: data.yield_per_hectare_kg,
      averageQualityScore: data.average_quality_score,
      premiumPercentage: data.premium_percentage,
      firstClassPercentage: data.first_class_percentage,
      processingPercentage: data.processing_percentage,
      totalRevenue: data.total_revenue,
      revenuePerTree: data.revenue_per_tree,
      revenuePerHectare: data.revenue_per_hectare,
      totalCosts: data.total_costs,
      profitMarginPercentage: data.profit_margin_percentage,
      laborHoursPerTree: data.labor_hours_per_tree,
      costPerKg: data.cost_per_kg,
      treesPerLaborHour: data.trees_per_labor_hour,
      healthyTreesPercentage: data.healthy_trees_percentage,
      diseasedTreesCount: data.diseased_trees_count,
      pestDamagePercentage: data.pest_damage_percentage,
      mortalityRatePercentage: data.mortality_rate_percentage,
      organicTreatmentsPercentage: data.organic_treatments_percentage,
      waterUsagePerTree: data.water_usage_per_tree,
      carbonFootprintKg: data.carbon_footprint_kg,
      industryBenchmarkYield: data.industry_benchmark_yield,
      performanceVsBenchmark: data.performance_vs_benchmark,
      createdAt: data.created_at,
      createdBy: data.created_by
    }
  }

  private mapDashboardDataFromDatabase(data: any): OrchardDashboardData {
    return {
      totalOrchards: data.total_orchards || 0,
      totalTrees: data.total_trees || 0,
      treesNeedingAttention: data.trees_needing_attention || 0,
      upcomingHarvests: data.upcoming_harvests || 0,
      recentActivities: data.recent_activities || [],
      healthyTreesPercentage: data.healthy_trees_percentage || 0,
      averageYieldPerTree: data.average_yield_per_tree || 0,
      totalYieldThisYear: data.total_yield_this_year || 0,
      profitabilityScore: data.profitability_score || 0,
      criticalAlerts: data.critical_alerts || [],
      upcomingTasks: data.upcoming_tasks || []
    }
  }
}

export const orchardService = new OrchardService()
