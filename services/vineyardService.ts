// ============================================================================
// VINEYARD SERVICE - COMPREHENSIVE VINEYARD MANAGEMENT
// Professional service layer for complete vineyard operations
// ============================================================================

import { 
  VineyardConfiguration,
  VineyardVine,
  VineyardDashboardData,
  VineyardFilters,
  VineSearchCriteria,
  VineyardWizardData
} from '@/types/vineyard'
import { getSupabaseClient } from '@/config/supabase'

class VineyardService {
  // ============================================================================
  // VINEYARD CONFIGURATION MANAGEMENT
  // ============================================================================

  async getVineyardConfigurations(gardenId: string): Promise<VineyardConfiguration[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_configurations')
        .select('*')
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapVineyardConfigurationFromDatabase) || []
    } catch (error) {
      console.error('Error fetching vineyard configurations:', error)
      return []
    }
  }

  async createVineyardConfiguration(config: Omit<VineyardConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<VineyardConfiguration> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_configurations')
        .insert([this.mapVineyardConfigurationToDatabase(config)])
        .select()
        .single()

      if (error) throw error

      return this.mapVineyardConfigurationFromDatabase(data)
    } catch (error) {
      console.error('Error creating vineyard configuration:', error)
      throw error
    }
  }

  async updateVineyardConfiguration(id: string, updates: Partial<VineyardConfiguration>): Promise<VineyardConfiguration> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_configurations')
        .update(this.mapVineyardConfigurationToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapVineyardConfigurationFromDatabase(data)
    } catch (error) {
      console.error('Error updating vineyard configuration:', error)
      throw error
    }
  }

  async deleteVineyardConfiguration(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('vineyard_configurations')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting vineyard configuration:', error)
      throw error
    }
  }

  // ============================================================================
  // VINE MANAGEMENT
  // ============================================================================

  async getVineyardVines(vineyardId: string, filters?: VineSearchCriteria): Promise<VineyardVine[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('vineyard_vines')
        .select('*')
        .eq('vineyard_id', vineyardId)
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

      return data?.map(this.mapVineFromDatabase) || []
    } catch (error) {
      console.error('Error fetching vineyard vines:', error)
      return []
    }
  }

  async getVineById(vineId: string): Promise<VineyardVine | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_vines')
        .select('*')
        .eq('id', vineId)
        .single()

      if (error) throw error

      return data ? this.mapVineFromDatabase(data) : null
    } catch (error) {
      console.error('Error fetching vine by ID:', error)
      return null
    }
  }

  async createVine(vine: Omit<VineyardVine, 'id' | 'createdAt' | 'updatedAt'>): Promise<VineyardVine> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_vines')
        .insert([this.mapVineToDatabase(vine)])
        .select()
        .single()

      if (error) throw error

      return this.mapVineFromDatabase(data)
    } catch (error) {
      console.error('Error creating vine:', error)
      throw error
    }
  }

  async updateVine(id: string, updates: Partial<VineyardVine>): Promise<VineyardVine> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_vines')
        .update(this.mapVineToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapVineFromDatabase(data)
    } catch (error) {
      console.error('Error updating vine:', error)
      throw error
    }
  }

  async deleteVine(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('vineyard_vines')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting vine:', error)
      throw error
    }
  }

  async bulkCreateVines(vines: Omit<VineyardVine, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<VineyardVine[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_vines')
        .insert(vines.map(vine => this.mapVineToDatabase(vine)))
        .select()

      if (error) throw error

      return data?.map(this.mapVineFromDatabase) || []
    } catch (error) {
      console.error('Error bulk creating vines:', error)
      throw error
    }
  }

  // ============================================================================
  // DASHBOARD AND ANALYTICS
  // ============================================================================

  async getVineyardDashboardData(gardenId: string): Promise<VineyardDashboardData> {
    try {
      const supabase = getSupabaseClient()
      
      // Get basic counts
      const [vineyardsResult, vinesResult] = await Promise.all([
        supabase
          .from('vineyard_configurations')
          .select('id')
          .eq('garden_id', gardenId),
        supabase
          .from('vineyard_vines')
          .select('*')
          .eq('garden_id', gardenId)
          .eq('is_active', true)
      ])

      const vineyards = vineyardsResult.data || []
      const vines = vinesResult.data || []

      const vinesNeedingAttention = vines.filter(v => 
        v.needs_pruning || v.needs_treatment || v.health_status !== 'healthy'
      ).length

      const healthyVines = vines.filter(v => v.health_status === 'healthy').length
      const healthyPercentage = vines.length > 0 ? (healthyVines / vines.length) * 100 : 0

      const totalYield = vines.reduce((sum, v) => sum + (v.last_harvest_kg || 0), 0)
      const averageYield = vines.length > 0 ? totalYield / vines.length : 0

      const averageBrix = vines.length > 0 
        ? vines.reduce((sum, v) => sum + (v.sugar_content_brix || 0), 0) / vines.length 
        : 0

      return {
        totalVineyards: vineyards.length,
        totalVines: vines.length,
        vinesNeedingAttention,
        upcomingHarvests: 0, // Would be calculated from harvest schedules
        recentActivities: [], // Would be populated from activity logs
        healthyVinesPercentage: Math.round(healthyPercentage),
        averageYieldPerVine: Math.round(averageYield * 100) / 100,
        totalYieldThisYear: Math.round(totalYield),
        averageBrix: Math.round(averageBrix * 10) / 10,
        criticalAlerts: [], // Would be populated based on conditions
        upcomingTasks: [] // Would be populated from schedules
      }
    } catch (error) {
      console.error('Error fetching vineyard dashboard data:', error)
      return {
        totalVineyards: 0,
        totalVines: 0,
        vinesNeedingAttention: 0,
        upcomingHarvests: 0,
        recentActivities: [],
        healthyVinesPercentage: 0,
        averageYieldPerVine: 0,
        totalYieldThisYear: 0,
        averageBrix: 0,
        criticalAlerts: [],
        upcomingTasks: []
      }
    }
  }

  // ============================================================================
  // WIZARD OPERATIONS
  // ============================================================================

  async createVineyardFromWizard(wizardData: VineyardWizardData): Promise<VineyardConfiguration> {
    try {
      const supabase = getSupabaseClient()
      
      // Create vineyard configuration
      const { data: vineyard, error: vineyardError } = await supabase
        .from('vineyard_configurations')
        .insert([{
          garden_id: wizardData.basicInfo?.gardenId,
          name: wizardData.basicInfo?.name || 'New Vineyard',
          description: wizardData.basicInfo?.description,
          vineyard_type: wizardData.basicInfo?.vineyardType || 'wine',
          established_date: wizardData.basicInfo?.establishedDate,
          total_area_sqm: wizardData.basicInfo?.totalAreaSqm,
          row_spacing_m: wizardData.layout?.rowSpacingM,
          vine_spacing_m: wizardData.layout?.vineSpacingM,
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

      if (vineyardError) throw vineyardError

      // Create vines if provided
      if (wizardData.vines?.vineData && wizardData.vines.vineData.length > 0) {
        const vinesToCreate = wizardData.vines.vineData.map(vine => ({
          ...vine,
          vineyard_id: vineyard.id,
          garden_id: wizardData.basicInfo?.gardenId,
          is_active: true,
          needs_pruning: false,
          needs_treatment: false,
          needs_replacement: false,
          cumulative_yield_kg: 0
        }))

        await this.bulkCreateVines(vinesToCreate as any)
      }

      return this.mapVineyardConfigurationFromDatabase(vineyard)
    } catch (error) {
      console.error('Error creating vineyard from wizard:', error)
      throw error
    }
  }

  // ============================================================================
  // DATABASE MAPPING METHODS
  // ============================================================================

  private mapVineyardConfigurationFromDatabase(data: any): VineyardConfiguration {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      description: data.description,
      vineyardType: data.vineyard_type,
      establishedDate: data.established_date,
      totalAreaSqm: data.total_area_sqm,
      totalVines: data.total_vines || 0,
      vinesPerHectare: data.vines_per_hectare,
      rowSpacingM: data.row_spacing_m,
      vineSpacingM: data.vine_spacing_m,
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

  private mapVineyardConfigurationToDatabase(config: Partial<VineyardConfiguration>): any {
    return {
      garden_id: config.gardenId,
      name: config.name,
      description: config.description,
      vineyard_type: config.vineyardType,
      established_date: config.establishedDate,
      total_area_sqm: config.totalAreaSqm,
      total_vines: config.totalVines,
      vines_per_hectare: config.vinesPerHectare,
      row_spacing_m: config.rowSpacingM,
      vine_spacing_m: config.vineSpacingM,
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

  private mapVineFromDatabase(data: any): VineyardVine {
    return {
      id: data.id,
      vineyardId: data.vineyard_id,
      gardenId: data.garden_id,
      vineNumber: data.vine_number,
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
      vineAgeYears: data.vine_age_years,
      trunkDiameterCm: data.trunk_diameter_cm,
      vineHeightM: data.vine_height_m,
      canopyWidthM: data.canopy_width_m,
      trainingSystem: data.training_system,
      healthStatus: data.health_status,
      vigorLevel: data.vigor_level,
      productivityStatus: data.productivity_status,
      expectedYieldKg: data.expected_yield_kg,
      lastHarvestKg: data.last_harvest_kg,
      lastHarvestDate: data.last_harvest_date,
      cumulativeYieldKg: data.cumulative_yield_kg || 0,
      sugarContentBrix: data.sugar_content_brix,
      acidityLevel: data.acidity_level,
      phLevel: data.ph_level,
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

  private mapVineToDatabase(vine: Partial<VineyardVine>): any {
    return {
      vineyard_id: vine.vineyardId,
      garden_id: vine.gardenId,
      vine_number: vine.vineNumber,
      qr_code: vine.qrCode,
      zone_id: vine.zoneId,
      field_row_id: vine.fieldRowId,
      section_id: vine.sectionId,
      row_number: vine.rowNumber,
      position_in_row: vine.positionInRow,
      gps_latitude: vine.gpsLatitude,
      gps_longitude: vine.gpsLongitude,
      variety: vine.variety,
      rootstock: vine.rootstock,
      planting_date: vine.plantingDate,
      vine_age_years: vine.vineAgeYears,
      trunk_diameter_cm: vine.trunkDiameterCm,
      vine_height_m: vine.vineHeightM,
      canopy_width_m: vine.canopyWidthM,
      training_system: vine.trainingSystem,
      health_status: vine.healthStatus,
      vigor_level: vine.vigorLevel,
      productivity_status: vine.productivityStatus,
      expected_yield_kg: vine.expectedYieldKg,
      last_harvest_kg: vine.lastHarvestKg,
      last_harvest_date: vine.lastHarvestDate,
      cumulative_yield_kg: vine.cumulativeYieldKg,
      sugar_content_brix: vine.sugarContentBrix,
      acidity_level: vine.acidityLevel,
      ph_level: vine.phLevel,
      notes: vine.notes,
      special_requirements: vine.specialRequirements,
      needs_pruning: vine.needsPruning,
      needs_treatment: vine.needsTreatment,
      needs_replacement: vine.needsReplacement,
      is_active: vine.isActive
    }
  }
}

export const vineyardService = new VineyardService()