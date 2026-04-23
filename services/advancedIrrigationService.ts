import { 
  IrrigationZone, 
  IrrigationSystem, 
  IrrigationLog, 
  IrrigationSchedule, 
  WaterRequirement,
  IrrigationSensor,
  SensorReading,
  WaterAnalytics,
  EfficiencyReport,
  IrrigationDashboardData,
  IrrigationAlert,
  SystemStatus,
  ActualIrrigationData,
  DateRange,
  IrrigationFilters
} from '@/types/irrigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient as getSupabaseClientUnsafe } from '@/config/supabase'
import { getDefaultStorageProvider } from '@/packages/core/storage/factory'
import {
  getAgronomicMeasuredFeedbackRecords,
  summarizeAgronomicMeasuredFeedback,
  type AgronomicMeasuredFeedbackSummary,
} from '@/services/agronomicMeasuredFeedbackService'
import {
  findAgronomicProfileLearningSnapshot,
  getAgronomicProfileLearningSnapshots,
} from '@/services/agronomicProfileLearningService'
import { resolveAgronomicCropProfile } from '@/services/agronomicKernelService'
import {
  calculateSoilHydraulicProfile,
  getLatestSoilAnalysis,
  type SoilHydraulicProfile,
} from '@/services/soilAnalysisService'
import { resolveIrrigationWaterQualityProfile } from '@/services/irrigationWaterQualityService'
import {
  inferOperationalContextTagsFromIrrigationSystems,
  inferOperationalContextTagsFromSite,
  mergeOperationalContextTags,
} from '@/services/agronomicOperationalContextService'
import {
  resolveAgronomicPriorityProfileSync,
  scoreAgronomicPriority,
} from '@/services/agronomicPriorityService'
import {
  buildAgronomicDecisionExplanation,
  resolveAgronomicDecisionUrgencyLabel,
} from '@/services/agronomicDecisionExplanationService'
import type {
  AgronomicCropProfile,
  AgronomicSignalKey,
  ResolvedAgronomicCropProfile,
} from '@/types/agronomicKernel'
import type { ArchetypeId } from '@/types/archetypes'
import type { FunctionalCategory } from '@/data/plantTaxonomy'
import type { IrrigationWaterQualityProfile } from '@/types/irrigation'

const getSupabaseClient = (): SupabaseClient => {
  const client = getSupabaseClientUnsafe()
  if (!client) {
    throw new Error('Supabase client not configured')
  }
  return client
}

interface AgronomicResolutionInput {
  plantId?: string
  cropName?: string
  archetypeId?: ArchetypeId
  functionalCategory?: FunctionalCategory
}

class AdvancedIrrigationService {
  // ============================================================================
  // ZONE MANAGEMENT
  // ============================================================================

  async getIrrigationZones(gardenId: string): Promise<IrrigationZone[]> {
    try {
      const supabase = getSupabaseClient()
      
      // Validate gardenId parameter
      if (!gardenId || gardenId.trim() === '') {
        console.warn('Invalid gardenId provided to getIrrigationZones')
        return []
      }
      
      // Query compatibile con schema legacy e advanced, poi filtra client-side.
      const { data: zoneRows, error } = await supabase
        .from('irrigation_zones')
        .select('*')
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching irrigation zones:', error)
        // Se la tabella non esiste o c'è un errore di validazione, ritorna array vuoto
        if (error.code === 'PGRST116' || 
            error.message.includes('does not exist') ||
            error.code === '22P02' || // Invalid UUID format
            error.message.includes('invalid input syntax')) {
          console.warn('irrigation_zones table does not exist or invalid parameters, returning empty array')
          return []
        }
        throw error
      }

      const zones = (zoneRows || []).filter((zone) => zone.is_active !== false)

      // Se non ci sono zone, ritorna array vuoto
      if (!zones || zones.length === 0) {
        return []
      }

      // Prova a ottenere i sistemi di irrigazione associati
      try {
        let systems: any[] | null = null

        if (Object.prototype.hasOwnProperty.call(zones[0], 'system_id')) {
          const legacySystemIds = Array.from(
            new Set(
              zones
                .map((zone) => zone.system_id)
                .filter((systemId) => typeof systemId === 'string' && systemId.length > 0)
            )
          )

          if (legacySystemIds.length > 0) {
            const legacySystemsQuery = await supabase
              .from('irrigation_systems')
              .select('*')
              .in('id', legacySystemIds)

            systems = legacySystemsQuery.data
          } else {
            systems = []
          }
        } else {
          const advancedSystemsQuery = await supabase
            .from('irrigation_systems')
            .select('*')
            .in('zone_id', zones.map(z => z.id))

          systems = advancedSystemsQuery.data
        }

        // Mappa i dati combinando zone e sistemi
        return zones.map(zone => ({
          ...this.mapZoneFromDatabase(zone),
          systems: Object.prototype.hasOwnProperty.call(zone, 'system_id')
            ? systems?.filter(s => s.id === zone.system_id) || []
            : systems?.filter(s => s.zone_id === zone.id) || []
        }))
      } catch (systemError) {
        console.warn('Error fetching irrigation systems, returning zones without systems:', systemError)
        // Ritorna le zone senza i sistemi se c'è un errore
        return zones.map(zone => this.mapZoneFromDatabase(zone))
      }
    } catch (error) {
      console.error('Error fetching irrigation zones:', error)
      return []
    }
  }

  async getIrrigationZone(zoneId: string): Promise<IrrigationZone | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_zones')
        .select('*')
        .eq('id', zoneId)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        return null
      }

      const mappedZone = this.mapZoneFromDatabase(data)
      const systems = await this.getIrrigationSystems(zoneId).catch(() => [])
      return {
        ...mappedZone,
        systems,
      }
    } catch (error) {
      console.error('Error fetching irrigation zone:', error)
      return null
    }
  }

  async createIrrigationZone(zone: Omit<IrrigationZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationZone> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_zones')
        .insert([this.mapZoneToDatabase(zone)])
        .select()
        .single()

      if (error) throw error

      return this.mapZoneFromDatabase(data)
    } catch (error) {
      console.error('Error creating irrigation zone:', error)
      throw error
    }
  }

  async updateIrrigationZone(id: string, updates: Partial<IrrigationZone>): Promise<IrrigationZone> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_zones')
        .update(this.mapZoneToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapZoneFromDatabase(data)
    } catch (error) {
      console.error('Error updating irrigation zone:', error)
      throw error
    }
  }

  async deleteIrrigationZone(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('irrigation_zones')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting irrigation zone:', error)
      throw error
    }
  }

  // ============================================================================
  // SYSTEM MANAGEMENT
  // ============================================================================

  async getIrrigationSystems(zoneId: string): Promise<IrrigationSystem[]> {
    try {
      const supabase = getSupabaseClient()
      let data: any[] | null = null
      let error: any = null

      const { data: zoneRow, error: zoneError } = await supabase
        .from('irrigation_zones')
        .select('*')
        .eq('id', zoneId)
        .single()

      if (zoneError) throw zoneError

      if (zoneRow && Object.prototype.hasOwnProperty.call(zoneRow, 'system_id')) {
        if (zoneRow.system_id) {
          const legacySystemQuery = await supabase
            .from('irrigation_systems')
            .select('*')
            .eq('id', zoneRow.system_id)

          data = legacySystemQuery.data
          error = legacySystemQuery.error
        } else if (zoneRow.garden_id) {
          const legacyGardenQuery = await supabase
            .from('irrigation_systems')
            .select('*')
            .eq('garden_id', zoneRow.garden_id)
            .order('created_at', { ascending: false })

          data = legacyGardenQuery.data
          error = legacyGardenQuery.error
        }
      } else {
        const advancedQuery = await supabase
          .from('irrigation_systems')
          .select('*')
          .eq('zone_id', zoneId)
          .order('created_at', { ascending: false })

        data = advancedQuery.data
        error = advancedQuery.error
      }

      if (error) throw error

      return (data || [])
        .filter((system) => system.is_active !== false)
        .map(this.mapSystemFromDatabase)
    } catch (error) {
      console.error('Error fetching irrigation systems:', error)
      return []
    }
  }

  async createIrrigationSystem(system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationSystem> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_systems')
        .insert([this.mapSystemToDatabase(system)])
        .select()
        .single()

      if (error) throw error

      return this.mapSystemFromDatabase(data)
    } catch (error) {
      console.error('Error creating irrigation system:', error)
      throw error
    }
  }

  async updateIrrigationSystem(id: string, updates: Partial<IrrigationSystem>): Promise<IrrigationSystem> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_systems')
        .update(this.mapSystemToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapSystemFromDatabase(data)
    } catch (error) {
      console.error('Error updating irrigation system:', error)
      throw error
    }
  }

  async deleteIrrigationSystem(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('irrigation_systems')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting irrigation system:', error)
      throw error
    }
  }

  // ============================================================================
  // IRRIGATION LOGGING
  // ============================================================================

  async startIrrigation(
    zoneId: string, 
    systemId: string, 
    plannedDurationMinutes: number,
    plannedVolumeLiters: number,
    irrigationType: 'scheduled' | 'manual' | 'emergency' | 'test' = 'manual'
  ): Promise<IrrigationLog> {
    try {
      const supabase = getSupabaseClient()
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser()
      
      const logData = {
        zone_id: zoneId,
        system_id: systemId,
        start_time: new Date().toISOString(),
        planned_duration_minutes: plannedDurationMinutes,
        planned_volume_liters: plannedVolumeLiters,
        irrigation_type: irrigationType,
        trigger_source: irrigationType === 'manual' ? 'user' : 'schedule',
        operator_id: user?.id,
        automatic_trigger: irrigationType !== 'manual'
      }

      const { data, error } = await supabase
        .from('irrigation_logs')
        .insert([logData])
        .select()
        .single()

      if (error) throw error

      return this.mapLogFromDatabase(data)
    } catch (error) {
      console.error('Error starting irrigation:', error)
      throw error
    }
  }

  async stopIrrigation(logId: string, actualData: ActualIrrigationData): Promise<IrrigationLog> {
    try {
      const supabase = getSupabaseClient()
      
      const updateData = {
        end_time: new Date().toISOString(),
        actual_duration_minutes: actualData.actualDurationMinutes,
        actual_volume_liters: actualData.actualVolumeLiters,
        pressure_variations: JSON.stringify(actualData.pressureReadings),
        weather_conditions: actualData.environmentalConditions.weatherConditions,
        temperature_celsius: actualData.environmentalConditions.temperatureCelsius,
        humidity_percentage: actualData.environmentalConditions.humidityPercentage,
        wind_speed_kmh: actualData.environmentalConditions.windSpeedKmh,
        soil_moisture_before_percentage: actualData.environmentalConditions.soilMoistureBefore,
        soil_moisture_after_percentage: actualData.environmentalConditions.soilMoistureAfter,
        soil_temperature_celsius: actualData.environmentalConditions.soilTemperatureCelsius,
        issues_detected: actualData.issues || [],
        pressure_start_bar: actualData.pressureReadings[0] || null,
        pressure_end_bar: actualData.pressureReadings[actualData.pressureReadings.length - 1] || null,
        pressure_avg_bar: actualData.pressureReadings.length > 0 
          ? actualData.pressureReadings.reduce((a, b) => a + b, 0) / actualData.pressureReadings.length 
          : null
      }

      const { data, error } = await supabase
        .from('irrigation_logs')
        .update(updateData)
        .eq('id', logId)
        .select()
        .single()

      if (error) throw error

      return this.mapLogFromDatabase(data)
    } catch (error) {
      console.error('Error stopping irrigation:', error)
      throw error
    }
  }

  async getIrrigationHistory(
    zoneId: string, 
    dateRange?: DateRange, 
    filters?: IrrigationFilters
  ): Promise<IrrigationLog[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('irrigation_logs')
        .select('*')
        .eq('zone_id', zoneId)
        .order('start_time', { ascending: false })

      if (dateRange) {
        query = query
          .gte('start_time', dateRange.startDate)
          .lte('start_time', dateRange.endDate)
      }

      if (filters?.irrigationType && filters.irrigationType.length > 0) {
        query = query.in('irrigation_type', filters.irrigationType)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(this.mapLogFromDatabase) || []
    } catch (error) {
      console.error('Error fetching irrigation history:', error)
      return []
    }
  }

  // ============================================================================
  // WATER REQUIREMENTS CALCULATION
  // ============================================================================

  async calculateWaterRequirements(
    zoneId: string, 
    date: string,
    et0Mm: number,
    kcCoefficient: number,
    cropStage?: string,
    weatherData?: any,
    agronomicInput?: AgronomicResolutionInput
  ): Promise<WaterRequirement> {
    try {
      const supabase = getSupabaseClient()
      
      // Get zone information for area calculation
      const { data: zone, error: zoneError } = await supabase
        .from('irrigation_zones')
        .select('area_sqm, efficiency_percentage, water_retention, garden_id, drainage_quality, slope_percentage, sun_exposure, soil_type, ph_level, organic_matter_percentage')
        .eq('id', zoneId)
        .single()

      if (zoneError) throw zoneError

      const resolvedAgronomicProfile = await this.resolveWaterRequirementProfile(agronomicInput)
      const effectiveCropStage = cropStage || this.getAgronomicFallbackStage(resolvedAgronomicProfile?.profile)
      const hydraulicRootZoneDepthCm = this.getHydraulicRootZoneDepthCm(
        resolvedAgronomicProfile?.profile
      )
      const irrigationSystems = await this.getIrrigationSystems(zoneId).catch(() => [])
      const waterQualityProfile = await resolveIrrigationWaterQualityProfile({
        gardenId: zone.garden_id,
        zoneId,
        systems: irrigationSystems,
      })
      const latestSoilAnalysis = await getLatestSoilAnalysis(supabase, zoneId, zone.garden_id)
      const soilHydraulicProfile = calculateSoilHydraulicProfile(latestSoilAnalysis, {
        rootZoneDepthCm: hydraulicRootZoneDepthCm,
        rootDepthSource: hydraulicRootZoneDepthCm ? 'crop_profile' : 'default',
        zone: this.mapZoneFromDatabase({
          id: zoneId,
          garden_id: zone.garden_id,
          area_sqm: zone.area_sqm,
          water_retention: zone.water_retention,
          drainage_quality: zone.drainage_quality,
          slope_percentage: zone.slope_percentage,
          soil_type: zone.soil_type,
          ph_level: zone.ph_level,
          organic_matter_percentage: zone.organic_matter_percentage,
          is_active: true,
          name: 'Zone',
          created_at: date,
          updated_at: date,
        }),
        waterQualityProfile,
      })
      const enrichedWeatherData = this.enrichWeatherDataWithWaterQuality(
        weatherData,
        waterQualityProfile
      )

      // Calculate crop evapotranspiration
      const etcMm = et0Mm * kcCoefficient

      // Calculate irrigation need (considering effective rainfall)
      const effectiveRainfallMm = enrichedWeatherData?.effectiveRainfallMm || 0
      const baseIrrigationNeedMm = Math.max(0, etcMm - effectiveRainfallMm)
      const siteAdjustedBaseNeedMm = this.applySiteWeatherBindingAdjustment(
        baseIrrigationNeedMm,
        zone.slope_percentage,
        zone.sun_exposure
      )
      const irrigationNeedMm = this.applyWaterQualityLeachingAdjustment(
        siteAdjustedBaseNeedMm,
        waterQualityProfile
      )
      const soilWaterBalance = this.buildEstimatedSoilWaterBalance(
        soilHydraulicProfile,
        irrigationNeedMm,
        zone.water_retention
      )

      // Calculate recommended volume (1mm over 1m² = 1 liter)
      const soilAdjustedIrrigationNeedMm = this.applySoilConstraintAdjustment(
        irrigationNeedMm,
        soilHydraulicProfile,
        soilWaterBalance
      )
      const recommendedVolumeLiters = soilAdjustedIrrigationNeedMm * zone.area_sqm

      // Adjust for system efficiency (default 85%)
      const systemEfficiency = zone.efficiency_percentage || 85
      const adjustedVolumeLiters = recommendedVolumeLiters / (systemEfficiency / 100)
      const recommendedDurationMinutes = this.estimateRecommendedDurationMinutes(
        adjustedVolumeLiters,
        irrigationSystems,
        soilWaterBalance
      )
      const measuredFeedbackSummary = await this.getWaterMeasuredFeedbackSummary(
        zoneId,
        agronomicInput?.cropName,
        resolvedAgronomicProfile?.profile.id
      )
      const aiAdjustmentFactor = this.getAgronomicAdjustmentFactor(
        resolvedAgronomicProfile?.profile,
        effectiveCropStage,
        measuredFeedbackSummary
      )
      const confidenceLevel = this.calculateAgronomicConfidenceLevel(
        resolvedAgronomicProfile,
        effectiveCropStage,
        enrichedWeatherData,
        measuredFeedbackSummary,
        soilHydraulicProfile,
        waterQualityProfile
      )
      const aiReasoning = this.buildAgronomicReasoning(
        resolvedAgronomicProfile,
        effectiveCropStage,
        enrichedWeatherData,
        systemEfficiency,
        zone.water_retention,
        aiAdjustmentFactor,
        measuredFeedbackSummary,
        soilHydraulicProfile,
        soilWaterBalance,
        waterQualityProfile,
        zone.slope_percentage,
        zone.sun_exposure
      )

      const waterRequirement: Omit<WaterRequirement, 'id'> = {
        zoneId,
        calculationDate: date,
        et0Mm,
        kcCoefficient,
        etcMm,
        cropStage: effectiveCropStage,
        weatherData: enrichedWeatherData,
        waterQualityProfile: waterQualityProfile || undefined,
        soilWaterBalance,
        irrigationNeedMm: soilAdjustedIrrigationNeedMm,
        recommendedVolumeLiters: adjustedVolumeLiters,
        recommendedDurationMinutes,
        calculationMethod: 'penman_monteith',
        confidenceLevel,
        aiAdjustmentFactor,
        aiReasoning,
        createdAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('water_requirements')
        .insert([this.mapWaterRequirementToDatabase(waterRequirement)])
        .select()
        .single()

      if (error) throw error

      return {
        ...this.mapWaterRequirementFromDatabase(data),
        weatherData: enrichedWeatherData,
        waterQualityProfile: waterQualityProfile || undefined,
        soilWaterBalance,
        irrigationNeedMm: soilAdjustedIrrigationNeedMm,
      }
    } catch (error) {
      console.error('Error calculating water requirements:', error)
      throw error
    }
  }

  async getWaterRequirementsHistory(zoneId: string, period: string): Promise<WaterRequirement[]> {
    try {
      const supabase = getSupabaseClient()
      
      // Calculate date range based on period
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'season':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      const { data, error } = await supabase
        .from('water_requirements')
        .select('*')
        .eq('zone_id', zoneId)
        .gte('calculation_date', startDate.toISOString().split('T')[0])
        .lte('calculation_date', endDate.toISOString().split('T')[0])
        .order('calculation_date', { ascending: false })

      if (error) throw error

      return data?.map(this.mapWaterRequirementFromDatabase) || []
    } catch (error) {
      console.error('Error fetching water requirements history:', error)
      return []
    }
  }

  // ============================================================================
  // SCHEDULING
  // ============================================================================

  async createIrrigationSchedule(schedule: Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationSchedule> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .insert([this.mapScheduleToDatabase(schedule)])
        .select()
        .single()

      if (error) throw error

      return this.mapScheduleFromDatabase(data)
    } catch (error) {
      console.error('Error creating irrigation schedule:', error)
      throw error
    }
  }

  async getActiveSchedules(gardenId: string): Promise<IrrigationSchedule[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .select(`
          *,
          irrigation_zones!inner (garden_id)
        `)
        .eq('irrigation_zones.garden_id', gardenId)
        .eq('is_active', true)
        .order('next_execution_date', { ascending: true })

      if (error) throw error

      return data?.map(this.mapScheduleFromDatabase) || []
    } catch (error) {
      console.error('Error fetching active schedules:', error)
      return []
    }
  }

  async executeScheduledIrrigation(scheduleId: string): Promise<IrrigationLog> {
    try {
      const supabase = getSupabaseClient()
      
      // Get schedule details
      const { data: schedule, error: scheduleError } = await supabase
        .from('irrigation_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single()

      if (scheduleError) throw scheduleError

      // Start irrigation
      const log = await this.startIrrigation(
        schedule.zone_id,
        schedule.system_id,
        schedule.duration_minutes,
        0, // Will be calculated based on system flow rate
        'scheduled'
      )

      // Update schedule's last execution date
      await supabase
        .from('irrigation_schedules')
        .update({ 
          last_execution_date: new Date().toISOString().split('T')[0],
          next_execution_date: this.calculateNextExecutionDate(schedule)
        })
        .eq('id', scheduleId)

      return log
    } catch (error) {
      console.error('Error executing scheduled irrigation:', error)
      throw error
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getWaterConsumptionAnalytics(gardenId: string, period: string): Promise<WaterAnalytics> {
    try {
      const supabase = getSupabaseClient()
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      // Get irrigation logs for the period
      const { data: logs, error } = await supabase
        .from('irrigation_logs')
        .select(`
          *,
          irrigation_zones!inner (garden_id, name, area_sqm)
        `)
        .eq('irrigation_zones.garden_id', gardenId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .not('actual_volume_liters', 'is', null)

      if (error) throw error

      const irrigationLogs = logs || []

      // Calculate analytics
      const totalConsumptionLiters = irrigationLogs.reduce(
        (sum, log) => sum + (log.actual_volume_liters || 0), 0
      )

      const averageDailyConsumption = totalConsumptionLiters / 
        Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

      // Find peak consumption day
      const dailyConsumption = new Map<string, number>()
      irrigationLogs.forEach(log => {
        const day = log.start_time.split('T')[0]
        dailyConsumption.set(day, (dailyConsumption.get(day) || 0) + (log.actual_volume_liters || 0))
      })

      const peakConsumptionDay = Array.from(dailyConsumption.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || ''

      // Calculate efficiency trend (simplified)
      const efficiencyTrend = irrigationLogs.length > 0 
        ? irrigationLogs.reduce((sum, log) => {
            const planned = log.planned_volume_liters || 1
            const actual = log.actual_volume_liters || 0
            return sum + (actual / planned)
          }, 0) / irrigationLogs.length * 100
        : 0

      // Group by zones
      const zoneConsumption = new Map<string, { name: string, total: number, efficiency: number, count: number }>()
      irrigationLogs.forEach(log => {
        const zoneId = log.zone_id
        const zoneName = log.irrigation_zones?.name || 'Unknown Zone'
        const current = zoneConsumption.get(zoneId) || { name: zoneName, total: 0, efficiency: 0, count: 0 }
        
        current.total += log.actual_volume_liters || 0
        current.efficiency += ((log.actual_volume_liters || 0) / (log.planned_volume_liters || 1)) * 100
        current.count += 1
        
        zoneConsumption.set(zoneId, current)
      })

      const consumptionByZone = Array.from(zoneConsumption.entries()).map(([zoneId, data]) => ({
        zoneId,
        zoneName: data.name,
        totalLiters: data.total,
        averageEfficiency: data.count > 0 ? data.efficiency / data.count : 0,
        costEuros: data.total * 0.002 // Approximate cost per liter
      }))

      return {
        totalConsumptionLiters,
        averageDailyConsumption,
        peakConsumptionDay,
        efficiencyTrend,
        costAnalysis: {
          totalWaterCost: totalConsumptionLiters * 0.002,
          totalEnergyCost: totalConsumptionLiters * 0.001,
          costPerLiter: 0.003,
          costPerSqm: 0,
          savingsVsManual: totalConsumptionLiters * 0.0005
        },
        consumptionByZone,
        monthlyTrends: [] // Would need more complex calculation
      }
    } catch (error) {
      console.error('Error fetching water consumption analytics:', error)
      return {
        totalConsumptionLiters: 0,
        averageDailyConsumption: 0,
        peakConsumptionDay: '',
        efficiencyTrend: 0,
        costAnalysis: {
          totalWaterCost: 0,
          totalEnergyCost: 0,
          costPerLiter: 0,
          costPerSqm: 0,
          savingsVsManual: 0
        },
        consumptionByZone: [],
        monthlyTrends: []
      }
    }
  }

  async getIrrigationEfficiencyReport(
    zoneId: string,
    period: string,
    agronomicInput?: AgronomicResolutionInput
  ): Promise<EfficiencyReport> {
    try {
      const supabase = getSupabaseClient()
      
      // Get zone info
      const { data: zone, error: zoneError } = await supabase
        .from('irrigation_zones')
        .select('name, description, garden_id, slope_percentage, sun_exposure')
        .eq('id', zoneId)
        .single()

      if (zoneError) throw zoneError

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      // Get irrigation logs
      const { data: logs, error } = await supabase
        .from('irrigation_logs')
        .select('*')
        .eq('zone_id', zoneId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .not('actual_volume_liters', 'is', null)

      if (error) throw error

      const irrigationLogs = logs || []

      // Calculate efficiency metrics
      let totalEfficiency = 0
      let uniformitySum = 0
      let waterUseEfficiencySum = 0
      let validLogs = 0

      irrigationLogs.forEach(log => {
        if (log.planned_volume_liters && log.actual_volume_liters) {
          const efficiency = (log.actual_volume_liters / log.planned_volume_liters) * 100
          totalEfficiency += efficiency
          
          if (log.distribution_uniformity) {
            uniformitySum += log.distribution_uniformity
          }
          
          if (log.application_efficiency) {
            waterUseEfficiencySum += log.application_efficiency
          }
          
          validLogs++
        }
      })

      const averageEfficiency = validLogs > 0 ? totalEfficiency / validLogs : 0
      const uniformityCoefficient = validLogs > 0 ? uniformitySum / validLogs : 0
      const waterUseEfficiency = validLogs > 0 ? waterUseEfficiencySum / validLogs : 0

      // Generate recommendations
      const recommendations: string[] = []
      
      if (averageEfficiency < 80) {
        recommendations.push('Considera di verificare il sistema per perdite o malfunzionamenti')
      }
      
      if (uniformityCoefficient < 85) {
        recommendations.push('Migliora la distribuzione uniforme dell\'acqua regolando gli emettitori')
      }
      
      if (waterUseEfficiency < 75) {
        recommendations.push('Ottimizza gli orari di irrigazione per ridurre l\'evaporazione')
      }

      if (recommendations.length === 0) {
        recommendations.push('Il sistema sta funzionando in modo ottimale')
      }

      const systems = await this.getIrrigationSystems(zoneId).catch(() => [])
      const operationalContextTags = mergeOperationalContextTags(
        inferOperationalContextTagsFromIrrigationSystems(systems),
        inferOperationalContextTagsFromSite({
          slopePercentage: zone.slope_percentage,
          sunExposure: zone.sun_exposure,
        })
      )
      const waterQualityProfile = await resolveIrrigationWaterQualityProfile({
        gardenId: zone.garden_id,
        zoneId,
        systems,
      })

      if (waterQualityProfile?.qualityBand === 'critical') {
        recommendations.push(
          `Qualita acqua critica: ${waterQualityProfile.riskFlags.join(', ') || 'verifica salinita, pH e bicarbonati'}.`
        )
      } else if (waterQualityProfile?.qualityBand === 'caution') {
        recommendations.push(
          `Qualita acqua da monitorare: ${waterQualityProfile.riskFlags.join(', ') || 'controlli acqua consigliati'}.`
        )
      }

      const resolvedAgronomicProfile =
        (agronomicInput
          ? await this.resolveWaterRequirementProfile(agronomicInput)
          : resolveAgronomicPriorityProfileSync({
              hints: [zone.name, zone.description],
            })) || null
      const availableSignals = this.getAvailableWaterSignalsFromEfficiencyLogs(irrigationLogs)
      const priorityResult = scoreAgronomicPriority({
        baseScore: this.calculateIrrigationRecommendationPriorityBaseScore(
          averageEfficiency,
          uniformityCoefficient,
          waterUseEfficiency
        ),
        confidence: this.calculateIrrigationRecommendationConfidence(validLogs),
        resolvedProfile: resolvedAgronomicProfile,
        focus: 'water',
        availableSignals,
      })
      const decisionExplanation = buildAgronomicDecisionExplanation({
        source: 'irrigation',
        focus: 'water',
        priorityResult,
        urgencyLabel: resolveAgronomicDecisionUrgencyLabel(priorityResult.score),
        resolvedProfile: resolvedAgronomicProfile,
        availableSignals,
      })

      return {
        zoneId,
        zoneName: zone.name,
        period,
        averageEfficiency,
        uniformityCoefficient,
        waterUseEfficiency,
        recommendations,
        agronomicProfileId: resolvedAgronomicProfile?.profile.id,
        operationalContextTags,
        priorityScore: priorityResult.score,
        priorityConfidence: priorityResult.confidence,
        missingSignals: priorityResult.signalCoverage.missingP0Signals,
        decisionExplanation,
      }
    } catch (error) {
      console.error('Error generating efficiency report:', error)
      return {
        zoneId,
        zoneName: 'Unknown Zone',
        period,
        averageEfficiency: 0,
        uniformityCoefficient: 0,
        waterUseEfficiency: 0,
        recommendations: ['Errore nel calcolo delle metriche di efficienza']
      }
    }
  }

  async getDashboardData(gardenId: string): Promise<IrrigationDashboardData> {
    try {
      const supabase = getSupabaseClient()

      const today = new Date().toISOString().split('T')[0]
      const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      // Query base compatibile con entrambi gli schemi.
      const zonesQuery = await supabase
        .from('irrigation_zones')
        .select('*')
        .eq('garden_id', gardenId)

      if (zonesQuery.error) {
        if (this.isMissingRelationError(zonesQuery.error, 'irrigation_zones')) {
          return this.createEmptyDashboardData()
        }
        throw zonesQuery.error
      }

      const zones = (zonesQuery.data || []).filter((zone) => zone.is_active !== false)
      const usesLegacySchema =
        zones.length > 0 && Object.prototype.hasOwnProperty.call(zones[0], 'system_id')

      if (zones.length === 0) {
        return this.createEmptyDashboardData()
      }

      // Active systems: derive from schema variant without hitting invalid columns.
      let systems: any[] | null = null
      let systemsError: any = null
      if (usesLegacySchema) {
        const legacySystemIds = Array.from(
          new Set(
            zones
              .map((zone) => zone.system_id)
              .filter((systemId) => typeof systemId === 'string' && systemId.length > 0)
          )
        )
        systems = legacySystemIds.map((id) => ({ id }))
      } else {
        const advancedSystemsQuery = await supabase
          .from('irrigation_systems')
          .select(`
            id,
            is_active,
            irrigation_zones!inner (garden_id)
          `)
          .eq('irrigation_zones.garden_id', gardenId)

        systems = (advancedSystemsQuery.data || []).filter((system) => system.is_active !== false)
        systemsError = advancedSystemsQuery.error
      }

      if (systemsError) {
        const legacySystemsQuery = await supabase
          .from('irrigation_systems')
          .select('id')
          .eq('garden_id', gardenId)

        systems = legacySystemsQuery.data
        systemsError = legacySystemsQuery.error
      }

      if (systemsError && !this.isMissingRelationError(systemsError, 'irrigation_systems')) {
        throw systemsError
      }

      // Irrigation logs: choose source from schema variant.
      let todayLogs: any[] | null = null
      let weeklyConsumption = 0
      let recentLogs: any[] | null = null
      let upcomingSchedules: any[] | null = []

      const canUseLegacyLogs = usesLegacySchema

      if (!canUseLegacyLogs) {
        const advancedTodayLogsQuery = await supabase
          .from('irrigation_logs')
          .select('id, zone_id')
          .gte('start_time', today)
          .lt('start_time', `${today}T23:59:59`)

        if (advancedTodayLogsQuery.error) {
          throw advancedTodayLogsQuery.error
        }

        todayLogs = advancedTodayLogsQuery.data

        const weeklyLogsQuery = await supabase
          .from('irrigation_logs')
          .select('actual_volume_liters')
          .gte('start_time', weekAgoIso)
          .not('actual_volume_liters', 'is', null)

        if (weeklyLogsQuery.error) throw weeklyLogsQuery.error

        weeklyConsumption = weeklyLogsQuery.data?.reduce(
          (sum, log) => sum + (log.actual_volume_liters || 0),
          0
        ) || 0

        const recentLogsQuery = await supabase
          .from('irrigation_logs')
          .select(`
            *,
            irrigation_zones (name),
            irrigation_systems (name)
          `)
          .order('start_time', { ascending: false })
          .limit(5)

        if (recentLogsQuery.error) throw recentLogsQuery.error
        recentLogs = recentLogsQuery.data

        const schedulesQuery = await supabase
          .from('irrigation_schedules')
          .select(`
            *,
            irrigation_zones (name)
          `)
          .eq('is_active', true)
          .gte('next_execution_date', today)
          .order('next_execution_date', { ascending: true })
          .limit(5)

        if (schedulesQuery.error && !this.isMissingRelationError(schedulesQuery.error, 'irrigation_schedules')) {
          throw schedulesQuery.error
        }

        upcomingSchedules = schedulesQuery.data || []
      } else {
        const legacyTodayLogsQuery = await supabase
          .from('watering_logs')
          .select('id, zone_id')
          .eq('garden_id', gardenId)
          .eq('date', today)

        if (legacyTodayLogsQuery.error && !this.isMissingRelationError(legacyTodayLogsQuery.error, 'watering_logs')) {
          throw legacyTodayLogsQuery.error
        }

        todayLogs = legacyTodayLogsQuery.data || []

        const legacyWeeklyLogsQuery = await supabase
          .from('watering_logs')
          .select('liters_applied, watered_at, date')
          .eq('garden_id', gardenId)
          .gte('watered_at', weekAgoIso)

        if (legacyWeeklyLogsQuery.error && this.isMissingColumnError(legacyWeeklyLogsQuery.error, 'watered_at')) {
          const fallbackWeeklyLogsQuery = await supabase
            .from('watering_logs')
            .select('liters_applied, date')
            .eq('garden_id', gardenId)
            .gte('date', weekAgoIso.split('T')[0])

          if (fallbackWeeklyLogsQuery.error) throw fallbackWeeklyLogsQuery.error
          weeklyConsumption = fallbackWeeklyLogsQuery.data?.reduce(
            (sum, log) => sum + (Number(log.liters_applied) || 0),
            0
          ) || 0
        } else {
          if (legacyWeeklyLogsQuery.error) throw legacyWeeklyLogsQuery.error
          weeklyConsumption = legacyWeeklyLogsQuery.data?.reduce(
            (sum, log) => sum + (Number(log.liters_applied) || 0),
            0
          ) || 0
        }

        const legacyRecentLogsQuery = await supabase
          .from('watering_logs')
          .select(`
            *,
            irrigation_zones (name)
          `)
          .eq('garden_id', gardenId)
          .order('watered_at', { ascending: false })
          .limit(5)

        if (legacyRecentLogsQuery.error && this.isMissingColumnError(legacyRecentLogsQuery.error, 'watered_at')) {
          const fallbackRecentLogsQuery = await supabase
            .from('watering_logs')
            .select(`
              *,
              irrigation_zones (name)
            `)
            .eq('garden_id', gardenId)
            .order('created_at', { ascending: false })
            .limit(5)

          if (fallbackRecentLogsQuery.error) throw fallbackRecentLogsQuery.error
          recentLogs = fallbackRecentLogsQuery.data
        } else {
          if (legacyRecentLogsQuery.error) throw legacyRecentLogsQuery.error
          recentLogs = legacyRecentLogsQuery.data
        }

        upcomingSchedules = []
      }

      return {
        activeZones: zones?.length || 0,
        activeSystems: systems?.length || 0,
        todayIrrigations: todayLogs?.length || 0,
        weeklyConsumption,
        currentAlerts: [], // Would need alert system implementation
        recentLogs: canUseLegacyLogs
          ? recentLogs?.map((log) => this.mapLegacyWateringLogToIrrigationLog(log)) || []
          : recentLogs?.map(this.mapLogFromDatabase) || [],
        upcomingSchedules: upcomingSchedules?.map(this.mapScheduleFromDatabase) || [],
        systemStatus: [] // Would need system status monitoring
      }
    } catch (error) {
      // Better error logging
      console.error('Error fetching dashboard data:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      })
      
      // Check if it's a table not found error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage?.includes('relation') && errorMessage?.includes('does not exist')) {
        console.warn('Irrigation tables not found. Please run the irrigation system migration.')
        console.warn('Run: supabase migration up --file supabase/migrations/20260117010000_create_advanced_irrigation_system.sql')
      }
      
      return this.createEmptyDashboardData()
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private calculateNextExecutionDate(schedule: any): string {
    const today = new Date()
    let nextDate = new Date(today)

    switch (schedule.schedule_type) {
      case 'daily':
        nextDate.setDate(today.getDate() + 1)
        break
      case 'weekly':
        nextDate.setDate(today.getDate() + 7)
        break
      case 'interval':
        nextDate.setDate(today.getDate() + (schedule.frequency_days || 1))
        break
      default:
        nextDate.setDate(today.getDate() + 1)
    }

    return nextDate.toISOString().split('T')[0]
  }

  // ============================================================================
  // DATABASE MAPPING METHODS
  // ============================================================================

  private createEmptyDashboardData(): IrrigationDashboardData {
    return {
      activeZones: 0,
      activeSystems: 0,
      todayIrrigations: 0,
      weeklyConsumption: 0,
      currentAlerts: [],
      recentLogs: [],
      upcomingSchedules: [],
      systemStatus: []
    }
  }

  private isMissingColumnError(error: any, columnName: string): boolean {
    const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase()
    const target = columnName.toLowerCase()
    return (
      message.includes(target) &&
      (message.includes('column') ||
        message.includes('schema cache') ||
        error?.code === '42703' ||
        error?.code === 'PGRST204')
    )
  }

  private isMissingRelationError(error: any, relationName: string): boolean {
    const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()
    const target = relationName.toLowerCase()
    return (
      (message.includes('relation') && message.includes('does not exist') && message.includes(target)) ||
      (message.includes('could not find') && message.includes(target)) ||
      error?.code === '42P01' ||
      error?.code === 'PGRST205'
    )
  }

  private mapLegacySystemType(type?: string): IrrigationSystem['systemType'] {
    switch ((type || '').toLowerCase()) {
      case 'manual':
        return 'manual'
      case 'sprinkler':
        return 'sprinkler'
      case 'micro':
        return 'micro'
      case 'subsurface':
        return 'subsurface'
      case 'drip':
      case 'soaker':
      default:
        return 'drip'
    }
  }

  private mapZoneFromDatabase(data: any): IrrigationZone {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      description: data.description,
      areaSqm: data.area_sqm,
      soilType: data.soil_type || 'mixed',
      slopePercentage: data.slope_percentage ?? 0,
      sunExposure: data.sun_exposure || 'full',
      drainageQuality: data.drainage_quality || 'good',
      waterRetention: data.water_retention || 'medium',
      phLevel: data.ph_level,
      organicMatterPercentage: data.organic_matter_percentage,
      isActive: data.is_active ?? true,
      systems: data.irrigation_systems?.map(this.mapSystemFromDatabase) || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapZoneToDatabase(zone: Partial<IrrigationZone>): any {
    return {
      garden_id: zone.gardenId,
      name: zone.name,
      description: zone.description,
      area_sqm: zone.areaSqm,
      soil_type: zone.soilType,
      slope_percentage: zone.slopePercentage,
      sun_exposure: zone.sunExposure,
      drainage_quality: zone.drainageQuality,
      water_retention: zone.waterRetention,
      ph_level: zone.phLevel,
      organic_matter_percentage: zone.organicMatterPercentage,
      is_active: zone.isActive
    }
  }

  private mapSystemFromDatabase(data: any): IrrigationSystem {
    return {
      id: data.id,
      gardenId: data.garden_id || '',
      zoneId: data.zone_id || '',
      name: data.name,
      systemType: data.system_type || this.mapLegacySystemType(data.type),
      waterSource: data.water_source || undefined,
      brand: data.brand,
      model: data.model,
      installationDate: data.installation_date,
      flowRateLh: data.flow_rate_lh ?? 0,
      pressureBar: data.pressure_bar ?? 0,
      operatingPressureMinBar: data.operating_pressure_min_bar,
      operatingPressureMaxBar: data.operating_pressure_max_bar,
      pipeConfig: {
        diameterMm: data.pipe_diameter_mm,
        material: data.pipe_material,
        lengthM: data.pipe_length_m
      },
      emitterConfig: {
        type: data.emitter_type,
        spacingCm: data.emitter_spacing_cm,
        flowRateLh: data.emitter_flow_rate_lh,
        count: data.emitter_count
      },
      coverageConfig: {
        radiusM: data.coverage_radius_m,
        angleDegrees: data.coverage_angle_degrees,
        overlapPercentage: data.overlap_percentage
      },
      efficiencyPercentage: data.efficiency_percentage ?? 85,
      uniformityCoefficient: data.uniformity_coefficient,
      isActive: data.is_active ?? true,
      lastMaintenanceDate: data.last_maintenance_date,
      nextMaintenanceDate: data.next_maintenance_date,
      maintenanceIntervalDays: data.maintenance_interval_days ?? 90,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapSystemToDatabase(system: Partial<IrrigationSystem>): any {
    return {
      garden_id: system.gardenId,
      zone_id: system.zoneId,
      name: system.name,
      system_type: system.systemType,
      water_source: system.waterSource,
      brand: system.brand,
      model: system.model,
      installation_date: system.installationDate,
      flow_rate_lh: system.flowRateLh,
      pressure_bar: system.pressureBar,
      operating_pressure_min_bar: system.operatingPressureMinBar,
      operating_pressure_max_bar: system.operatingPressureMaxBar,
      pipe_diameter_mm: system.pipeConfig?.diameterMm,
      pipe_material: system.pipeConfig?.material,
      pipe_length_m: system.pipeConfig?.lengthM,
      emitter_type: system.emitterConfig?.type,
      emitter_spacing_cm: system.emitterConfig?.spacingCm,
      emitter_flow_rate_lh: system.emitterConfig?.flowRateLh,
      emitter_count: system.emitterConfig?.count,
      coverage_radius_m: system.coverageConfig?.radiusM,
      coverage_angle_degrees: system.coverageConfig?.angleDegrees,
      overlap_percentage: system.coverageConfig?.overlapPercentage,
      efficiency_percentage: system.efficiencyPercentage,
      uniformity_coefficient: system.uniformityCoefficient,
      is_active: system.isActive,
      last_maintenance_date: system.lastMaintenanceDate,
      next_maintenance_date: system.nextMaintenanceDate,
      maintenance_interval_days: system.maintenanceIntervalDays,
      notes: system.notes
    }
  }

  private mapLogFromDatabase(data: any): IrrigationLog {
    return {
      id: data.id,
      zoneId: data.zone_id,
      systemId: data.system_id,
      startTime: data.start_time,
      endTime: data.end_time,
      plannedDurationMinutes: data.planned_duration_minutes,
      actualDurationMinutes: data.actual_duration_minutes,
      plannedVolumeLiters: data.planned_volume_liters,
      actualVolumeLiters: data.actual_volume_liters,
      flowRateMeasuredLh: data.flow_rate_measured_lh,
      pressureData: {
        startBar: data.pressure_start_bar,
        endBar: data.pressure_end_bar,
        avgBar: data.pressure_avg_bar,
        variations: data.pressure_variations ? JSON.parse(data.pressure_variations) : []
      },
      environmentalData: {
        weatherConditions: data.weather_conditions,
        temperatureCelsius: data.temperature_celsius,
        humidityPercentage: data.humidity_percentage,
        windSpeedKmh: data.wind_speed_kmh,
        soilMoistureBefore: data.soil_moisture_before_percentage,
        soilMoistureAfter: data.soil_moisture_after_percentage,
        soilTemperatureCelsius: data.soil_temperature_celsius
      },
      irrigationType: data.irrigation_type,
      triggerSource: data.trigger_source,
      operatorId: data.operator_id,
      operatorNotes: data.operator_notes,
      distributionUniformity: data.distribution_uniformity,
      applicationEfficiency: data.application_efficiency,
      issuesDetected: data.issues_detected || [],
      alertsTriggered: data.alerts_triggered || [],
      waterCostEuros: data.water_cost_euros,
      energyCostEuros: data.energy_cost_euros,
      createdAt: data.created_at
    }
  }

  private mapLegacyWateringLogToIrrigationLog(data: any): IrrigationLog {
    const startTime = data.watered_at || data.created_at || new Date().toISOString()
    const durationMinutes = data.duration_minutes ?? 0
    const litersApplied = Number(data.liters_applied) || 0

    return {
      id: data.id,
      zoneId: data.zone_id,
      systemId: undefined,
      startTime,
      endTime: undefined,
      plannedDurationMinutes: durationMinutes,
      actualDurationMinutes: durationMinutes,
      plannedVolumeLiters: litersApplied,
      actualVolumeLiters: litersApplied,
      flowRateMeasuredLh: durationMinutes > 0 ? litersApplied / (durationMinutes / 60) : undefined,
      pressureData: {
        startBar: undefined,
        endBar: undefined,
        avgBar: undefined,
        variations: []
      },
      environmentalData: {
        weatherConditions: data.weather_condition,
        temperatureCelsius: data.air_temperature_c,
        humidityPercentage: undefined,
        windSpeedKmh: undefined,
        soilMoistureBefore: data.soil_moisture_before,
        soilMoistureAfter: data.soil_moisture_after,
        soilTemperatureCelsius: undefined
      },
      irrigationType:
        data.method === 'Automatic' || data.method === 'Timer' ? 'scheduled' : 'manual',
      triggerSource: data.method || 'legacy',
      operatorId: undefined,
      operatorNotes: data.notes,
      distributionUniformity: undefined,
      applicationEfficiency: undefined,
      issuesDetected: [],
      alertsTriggered: [],
      waterCostEuros: undefined,
      energyCostEuros: undefined,
      createdAt: data.created_at || startTime
    }
  }

  private mapScheduleFromDatabase(data: any): IrrigationSchedule {
    return {
      id: data.id,
      zoneId: data.zone_id,
      systemId: data.system_id,
      name: data.name,
      description: data.description,
      isActive: data.is_active,
      scheduleType: data.schedule_type,
      startDate: data.start_date,
      endDate: data.end_date,
      daysOfWeek: data.days_of_week,
      timeSlots: data.time_slots,
      durationMinutes: data.duration_minutes,
      frequencyDays: data.frequency_days,
      lastExecutionDate: data.last_execution_date,
      nextExecutionDate: data.next_execution_date,
      conditions: {
        weatherConditions: data.weather_conditions,
        soilMoistureThresholdMin: data.soil_moisture_threshold_min,
        soilMoistureThresholdMax: data.soil_moisture_threshold_max,
        temperatureThresholdMin: data.temperature_threshold_min,
        temperatureThresholdMax: data.temperature_threshold_max,
        rainDelayHours: data.rain_delay_hours,
        rainThresholdMm: data.rain_threshold_mm
      },
      allowManualOverride: data.allow_manual_override,
      priorityLevel: data.priority_level,
      seasonalAdjustmentPercentage: data.seasonal_adjustment_percentage,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapScheduleToDatabase(schedule: Partial<IrrigationSchedule>): any {
    return {
      zone_id: schedule.zoneId,
      system_id: schedule.systemId,
      name: schedule.name,
      description: schedule.description,
      is_active: schedule.isActive,
      schedule_type: schedule.scheduleType,
      start_date: schedule.startDate,
      end_date: schedule.endDate,
      days_of_week: schedule.daysOfWeek,
      time_slots: schedule.timeSlots,
      duration_minutes: schedule.durationMinutes,
      frequency_days: schedule.frequencyDays,
      last_execution_date: schedule.lastExecutionDate,
      next_execution_date: schedule.nextExecutionDate,
      weather_conditions: schedule.conditions?.weatherConditions,
      soil_moisture_threshold_min: schedule.conditions?.soilMoistureThresholdMin,
      soil_moisture_threshold_max: schedule.conditions?.soilMoistureThresholdMax,
      temperature_threshold_min: schedule.conditions?.temperatureThresholdMin,
      temperature_threshold_max: schedule.conditions?.temperatureThresholdMax,
      rain_delay_hours: schedule.conditions?.rainDelayHours,
      rain_threshold_mm: schedule.conditions?.rainThresholdMm,
      allow_manual_override: schedule.allowManualOverride,
      priority_level: schedule.priorityLevel,
      seasonal_adjustment_percentage: schedule.seasonalAdjustmentPercentage
    }
  }

  private mapWaterRequirementFromDatabase(data: any): WaterRequirement {
    return {
      id: data.id,
      zoneId: data.zone_id,
      calculationDate: data.calculation_date,
      et0Mm: data.et0_mm,
      kcCoefficient: data.kc_coefficient,
      etcMm: data.etc_mm,
      cropStage: data.crop_stage,
      cropAgeDays: data.crop_age_days,
      leafAreaIndex: data.leaf_area_index,
      weatherData: {
        effectiveRainfallMm: data.effective_rainfall_mm,
        temperatureAvgCelsius: data.temperature_avg_celsius,
        humidityAvgPercentage: data.humidity_avg_percentage,
        windSpeedAvgKmh: data.wind_speed_avg_kmh,
        solarRadiationMjm2: data.solar_radiation_mjm2
      },
      soilWaterBalance: {
        soilWaterDeficitMm: data.soil_water_deficit_mm,
        fieldCapacityMm: data.field_capacity_mm,
        wiltingPointMm: data.wilting_point_mm,
        availableWaterMm: data.available_water_mm
      },
      irrigationNeedMm: data.irrigation_need_mm,
      recommendedVolumeLiters: data.recommended_volume_liters,
      recommendedDurationMinutes: data.recommended_duration_minutes,
      calculationMethod: data.calculation_method,
      weatherDataSource: data.weather_data_source,
      confidenceLevel: data.confidence_level,
      aiAdjustmentFactor: data.ai_adjustment_factor,
      aiConfidenceScore: data.ai_confidence_score,
      aiReasoning: data.ai_reasoning,
      createdAt: data.created_at
    }
  }

  private mapWaterRequirementToDatabase(requirement: Partial<WaterRequirement>): any {
    return {
      zone_id: requirement.zoneId,
      calculation_date: requirement.calculationDate,
      et0_mm: requirement.et0Mm,
      kc_coefficient: requirement.kcCoefficient,
      etc_mm: requirement.etcMm,
      crop_stage: requirement.cropStage,
      crop_age_days: requirement.cropAgeDays,
      leaf_area_index: requirement.leafAreaIndex,
      effective_rainfall_mm: requirement.weatherData?.effectiveRainfallMm,
      temperature_avg_celsius: requirement.weatherData?.temperatureAvgCelsius,
      humidity_avg_percentage: requirement.weatherData?.humidityAvgPercentage,
      wind_speed_avg_kmh: requirement.weatherData?.windSpeedAvgKmh,
      solar_radiation_mjm2: requirement.weatherData?.solarRadiationMjm2,
      soil_water_deficit_mm: requirement.soilWaterBalance?.soilWaterDeficitMm,
      field_capacity_mm: requirement.soilWaterBalance?.fieldCapacityMm,
      wilting_point_mm: requirement.soilWaterBalance?.wiltingPointMm,
      available_water_mm: requirement.soilWaterBalance?.availableWaterMm,
      irrigation_need_mm: requirement.irrigationNeedMm,
      recommended_volume_liters: requirement.recommendedVolumeLiters,
      recommended_duration_minutes: requirement.recommendedDurationMinutes,
      calculation_method: requirement.calculationMethod,
      weather_data_source: requirement.weatherDataSource,
      confidence_level: requirement.confidenceLevel,
      ai_adjustment_factor: requirement.aiAdjustmentFactor,
      ai_confidence_score: requirement.aiConfidenceScore,
      ai_reasoning: requirement.aiReasoning
    }
  }

  private async resolveWaterRequirementProfile(
    agronomicInput?: AgronomicResolutionInput
  ): Promise<ResolvedAgronomicCropProfile | null> {
    if (!agronomicInput) {
      return null
    }

    const plantId = agronomicInput.plantId || agronomicInput.cropName
    const hasResolutionInput =
      Boolean(plantId) ||
      Boolean(agronomicInput.archetypeId) ||
      Boolean(agronomicInput.functionalCategory)

    if (!hasResolutionInput) {
      return null
    }

    return resolveAgronomicCropProfile({
      plantId,
      archetypeId: agronomicInput.archetypeId,
      functionalCategory: agronomicInput.functionalCategory,
    })
  }

  private getAgronomicFallbackStage(profile?: AgronomicCropProfile | null): string {
    if (!profile) {
      return 'vegetative'
    }

    return (
      profile.phenology.decisionCriticalStages[0] ||
      profile.phenology.stages[0] ||
      'vegetative'
    )
  }

  private getAgronomicAdjustmentFactor(
    profile?: AgronomicCropProfile | null,
    cropStage?: string,
    measuredFeedbackSummary?: AgronomicMeasuredFeedbackSummary | null
  ): number {
    let baseFactor = 1

    if (!profile) {
      baseFactor = 1
    } else {
      const isSensitiveStage = cropStage
        ? profile.water.sensitiveStages.includes(cropStage)
        : false
      const irrigationTuning = profile.irrigationTuning

      switch (profile.water.strategy) {
        case 'uniform_supply':
          baseFactor = isSensitiveStage ? 1.04 : 1.02
          break
        case 'deficit_sensitive':
          baseFactor = isSensitiveStage ? 1.06 : 1.03
          break
        case 'quality_oriented':
          baseFactor = isSensitiveStage ? 1.05 : 1.01
          break
        case 'stress_tolerant':
          baseFactor = isSensitiveStage ? 1 : 0.97
          break
        case 'recirculating':
          baseFactor = 1
          break
        default:
          baseFactor = 1
          break
      }

      baseFactor += irrigationTuning?.baseAdjustment ?? 0

      if (isSensitiveStage) {
        baseFactor += irrigationTuning?.sensitiveStageAdjustment ?? 0
      }
    }

    if (!measuredFeedbackSummary) {
      return Number(Math.max(0.9, Math.min(1.18, baseFactor)).toFixed(2))
    }

    const feedbackWeight = profile?.irrigationTuning?.measuredFeedbackWeight ?? 1
    const correction = Math.max(
      -0.06,
      Math.min(0.12, (measuredFeedbackSummary.scoreAdjustment / 100) * feedbackWeight)
    )
    return Number(Math.max(0.9, Math.min(1.18, baseFactor + correction)).toFixed(2))
  }

  private calculateAgronomicConfidenceLevel(
    resolvedProfile: ResolvedAgronomicCropProfile | null,
    cropStage?: string,
    weatherData?: any,
    measuredFeedbackSummary?: AgronomicMeasuredFeedbackSummary | null,
    soilHydraulicProfile?: SoilHydraulicProfile | null,
    waterQualityProfile?: IrrigationWaterQualityProfile | null
  ): number {
    if (!resolvedProfile) {
      return 70
    }

    let confidence = 58
    confidence += 6

    switch (resolvedProfile.source) {
      case 'plant_id':
        confidence += 8
        break
      case 'custom_crop':
        confidence += 6
        break
      case 'taxonomy':
      case 'functional_category':
        confidence += 4
        break
      case 'fallback':
        confidence -= 4
        break
    }

    if (cropStage) {
      confidence += 4
    }

    if (weatherData?.effectiveRainfallMm !== undefined) {
      confidence += 2
    }

    const p0Signals = resolvedProfile.profile.water.recommendedSignals.filter(
      (signal) => signal.priority === 'P0'
    )

    if (p0Signals.length === 0) {
      confidence += 4
    } else {
      const availableSignals = this.getAvailableAgronomicSignals(weatherData)
      const coveredSignals = p0Signals.filter((signal) => availableSignals.has(signal.key))
      confidence += Math.round((coveredSignals.length / p0Signals.length) * 16) - 4
    }

    if (measuredFeedbackSummary) {
      confidence += Math.round(measuredFeedbackSummary.confidenceAdjustment * 100 * 0.45)
    }

    if (soilHydraulicProfile) {
      confidence += 5
    }

    if (waterQualityProfile?.salinity || waterQualityProfile?.ph || waterQualityProfile?.bicarbonates) {
      confidence += 4
    } else if (waterQualityProfile?.waterSource) {
      confidence += 1
    }

    return Math.max(45, Math.min(95, confidence))
  }

  private buildAgronomicReasoning(
    resolvedProfile: ResolvedAgronomicCropProfile | null,
    cropStage: string,
    weatherData: any,
    systemEfficiency: number,
    waterRetention?: string,
    aiAdjustmentFactor?: number,
    measuredFeedbackSummary?: AgronomicMeasuredFeedbackSummary | null,
    soilHydraulicProfile?: SoilHydraulicProfile | null,
    soilWaterBalance?: WaterRequirement['soilWaterBalance'],
    waterQualityProfile?: IrrigationWaterQualityProfile | null,
    slopePercentage?: number,
    sunExposure?: string
  ): string | undefined {
    if (!resolvedProfile) {
      return undefined
    }

    const availableSignals = this.getAvailableAgronomicSignals(weatherData)
    const p0Signals = resolvedProfile.profile.water.recommendedSignals.filter(
      (signal) => signal.priority === 'P0'
    )
    const coveredP0Signals = p0Signals.filter((signal) => availableSignals.has(signal.key))
    const missingP0Signals = p0Signals.filter((signal) => !availableSignals.has(signal.key))
    const rootProfile = resolvedProfile.profile.water.rootProfile

    const notes = [
      `Agronomic profile '${resolvedProfile.profile.label}' resolved via ${resolvedProfile.source}.`,
      `Water strategy: ${resolvedProfile.profile.water.strategy}. Root depth ${rootProfile.effectiveDepthCmMin}-${rootProfile.effectiveDepthCmMax} cm (${rootProfile.rootingPattern}).`,
      `Decision stage: ${cropStage}. Sensitive stages: ${resolvedProfile.profile.water.sensitiveStages.join(', ') || 'n/a'}.`,
      `P0 signal coverage: ${coveredP0Signals.length}/${p0Signals.length || 0}.`,
      `Zone water retention: ${waterRetention || 'unknown'}. System efficiency: ${systemEfficiency}%.`,
    ]

    const siteBindingSummary = this.summarizeSiteWeatherBinding(slopePercentage, sunExposure)
    if (siteBindingSummary) {
      notes.push(siteBindingSummary)
    }

    if (soilHydraulicProfile && soilWaterBalance) {
      notes.push(
        `Soil hydraulic profile (${soilHydraulicProfile.source}, quality ${soilHydraulicProfile.hydraulicQuality}): ${soilHydraulicProfile.textureClass} texture, FC ${soilHydraulicProfile.fieldCapacityVolumetricPercent}% [${soilHydraulicProfile.fieldCapacitySource}], WP ${soilHydraulicProfile.wiltingPointVolumetricPercent}% [${soilHydraulicProfile.wiltingPointSource}], AWH ${soilHydraulicProfile.availableWaterHoldingMmPerMeter} mm/m, infiltration ${soilHydraulicProfile.estimatedInfiltrationRateMmh} mm/h [${soilHydraulicProfile.infiltrationSource}].`
      )
      notes.push(
        `Zone-first balance: depth ${soilWaterBalance.rootZoneDepthCm || soilHydraulicProfile.rootZoneDepthCm} cm, effective depth ${soilWaterBalance.effectiveRootableDepthCm || soilHydraulicProfile.effectiveRootableDepthCm} cm [${soilWaterBalance.rootDepthSource || soilHydraulicProfile.rootDepthSource}], available water ${soilWaterBalance.availableWaterMm || 0} mm, deficit ${soilWaterBalance.soilWaterDeficitMm || 0} mm, refill target ${soilWaterBalance.refillEventTargetMm || soilHydraulicProfile.refillEventTargetMm || 0} mm/event, compaction risk ${soilHydraulicProfile.compactionRisk}, drainage ${soilHydraulicProfile.drainageClass}, salinity accumulation risk ${soilWaterBalance.salinityAccumulationRisk || soilHydraulicProfile.salinityAccumulationRisk}.`
      )
      if (soilWaterBalance.pulseSplitRecommended) {
        notes.push(
          `Pulse splitting recommended (${soilWaterBalance.pulseCountSuggestion || 2} pulses) because the zone cannot safely refill in one event under current drainage/compaction/salinity constraints.`
        )
      }
    } else {
      notes.push('No soil hydraulic profile available: irrigation volume still relies on ET0/Kc and generic zone retention only.')
    }

    if (waterQualityProfile) {
      const waterQualityNotes = [
        `Water source: ${waterQualityProfile.sourceLabel || waterQualityProfile.waterSource || 'unknown'}.`,
        `Quality band: ${waterQualityProfile.qualityBand} (${waterQualityProfile.qualityScore}/100).`,
      ]

      if (waterQualityProfile.salinity) {
        waterQualityNotes.push(
          `Salinity ${waterQualityProfile.salinity.value} ${waterQualityProfile.salinity.unit}.`
        )
      }

      if (waterQualityProfile.ph) {
        waterQualityNotes.push(`pH ${waterQualityProfile.ph.value}.`)
      }

      if (waterQualityProfile.bicarbonates) {
        waterQualityNotes.push(
          `Bicarbonates ${waterQualityProfile.bicarbonates.value} ${waterQualityProfile.bicarbonates.unit}.`
        )
      }

      if (waterQualityProfile.leachingFractionPercent) {
        waterQualityNotes.push(
          `Operational volume includes a ${waterQualityProfile.leachingFractionPercent}% leaching fraction due to water quality pressure.`
        )
      }

      if (waterQualityProfile.riskFlags.length > 0) {
        waterQualityNotes.push(`Water quality risks: ${waterQualityProfile.riskFlags.join(', ')}.`)
      }

      if (waterQualityProfile.recommendations.length > 0) {
        waterQualityNotes.push(
          `Water quality recommendations: ${waterQualityProfile.recommendations.join(' ')}`
        )
      }

      notes.push(waterQualityNotes.join(' '))
    } else {
      notes.push('No irrigation-water quality profile available: source, salinity, pH, and bicarbonates are not yet constraining the recommendation.')
    }

    if (missingP0Signals.length > 0) {
      notes.push(
        `Missing high-priority signals: ${missingP0Signals.map((signal) => signal.key).join(', ')}.`
      )
    }

    if (resolvedProfile.warnings.length > 0) {
      notes.push(`Resolution warnings: ${resolvedProfile.warnings.join(' ')}`)
    }

    if (aiAdjustmentFactor && aiAdjustmentFactor !== 1) {
      notes.push(
        `Suggested agronomic adjustment factor: ${aiAdjustmentFactor.toFixed(2)}. This is informative and not auto-applied to the Penman-Monteith base volume yet.`
      )
    }

    if (measuredFeedbackSummary?.rationale?.length) {
      notes.push(
        `Recent measured feedback (${measuredFeedbackSummary.matchedBy}, n=${measuredFeedbackSummary.sampleCount}): ${measuredFeedbackSummary.rationale.join(' ')}`
      )
    }

    notes.push('Kc remains the user-provided coefficient until crop-stage Kc curves are formalized in the irrigation engine.')

    return notes.join(' ')
  }

  private getHydraulicRootZoneDepthCm(profile?: AgronomicCropProfile | null): number | undefined {
    if (!profile) {
      return undefined
    }

    const rootProfile = profile.water.rootProfile
    return Math.round((rootProfile.effectiveDepthCmMin + rootProfile.effectiveDepthCmMax) / 2)
  }

  private applySiteWeatherBindingAdjustment(
    irrigationNeedMm: number,
    slopePercentage?: number | null,
    sunExposure?: string | null
  ): number {
    let multiplier = 1

    const slope = typeof slopePercentage === 'number' ? slopePercentage : 0
    if (slope >= 12) {
      multiplier += 0.05
    } else if (slope >= 5) {
      multiplier += 0.02
    }

    const normalizedExposure = (sunExposure || '').toLowerCase()
    if (normalizedExposure.includes('full')) {
      multiplier += 0.04
    } else if (normalizedExposure.includes('shade')) {
      multiplier -= 0.04
    } else if (normalizedExposure.includes('partial')) {
      multiplier += 0.01
    }

    return Number((irrigationNeedMm * Math.max(0.9, Math.min(1.12, multiplier))).toFixed(2))
  }

  private summarizeSiteWeatherBinding(
    slopePercentage?: number,
    sunExposure?: string
  ): string | null {
    const notes: string[] = []
    if (typeof slopePercentage === 'number' && slopePercentage > 0) {
      if (slopePercentage >= 12) {
        notes.push(`Steep slope ${slopePercentage}% increases runoff risk and tightens irrigation timing.`)
      } else if (slopePercentage >= 5) {
        notes.push(`Slope ${slopePercentage}% slightly reduces water residence after events.`)
      }
    }

    const normalizedExposure = (sunExposure || '').toLowerCase()
    if (normalizedExposure.includes('full')) {
      notes.push('Full sun exposure likely pushes ET demand above the plain regional baseline.')
    } else if (normalizedExposure.includes('shade')) {
      notes.push('Sheltered exposure may slow canopy drying relative to the regional forecast.')
    }

    return notes.length > 0 ? notes.join(' ') : null
  }

  private buildEstimatedSoilWaterBalance(
    soilHydraulicProfile: SoilHydraulicProfile | null,
    irrigationNeedMm: number,
    waterRetention?: string
  ): WaterRequirement['soilWaterBalance'] | undefined {
    if (!soilHydraulicProfile) {
      return undefined
    }

    const rootZoneDepthMm = soilHydraulicProfile.effectiveRootableDepthCm * 10
    const fieldCapacityMm = Number(
      ((soilHydraulicProfile.fieldCapacityVolumetricPercent / 100) * rootZoneDepthMm).toFixed(1)
    )
    const wiltingPointMm = Number(
      ((soilHydraulicProfile.wiltingPointVolumetricPercent / 100) * rootZoneDepthMm).toFixed(1)
    )
    const availableWaterMm = Number(Math.max(0, fieldCapacityMm - wiltingPointMm).toFixed(1))

    let deficitMultiplier = 1.12
    if (waterRetention === 'low') deficitMultiplier = 1.3
    if (waterRetention === 'high') deficitMultiplier = 1.03

    if (soilHydraulicProfile.compactionRisk === 'medium') deficitMultiplier += 0.04
    if (soilHydraulicProfile.compactionRisk === 'high') deficitMultiplier += 0.08
    if (soilHydraulicProfile.drainageClass === 'slow') deficitMultiplier += 0.05
    if (soilHydraulicProfile.salinityAccumulationRisk === 'medium') deficitMultiplier += 0.04
    if (soilHydraulicProfile.salinityAccumulationRisk === 'high') deficitMultiplier += 0.08

    const soilWaterDeficitMm = Number(
      Math.min(availableWaterMm, Math.max(0, irrigationNeedMm * deficitMultiplier)).toFixed(1)
    )

    return {
      soilWaterDeficitMm,
      fieldCapacityMm,
      wiltingPointMm,
      availableWaterMm,
      rootZoneDepthCm: soilHydraulicProfile.rootZoneDepthCm,
      effectiveRootableDepthCm: soilHydraulicProfile.effectiveRootableDepthCm,
      fieldCapacityVolumetricPercent: soilHydraulicProfile.fieldCapacityVolumetricPercent,
      wiltingPointVolumetricPercent: soilHydraulicProfile.wiltingPointVolumetricPercent,
      estimatedInfiltrationRateMmh: soilHydraulicProfile.estimatedInfiltrationRateMmh,
      textureClass: soilHydraulicProfile.textureClass,
      drainageClass: soilHydraulicProfile.drainageClass,
      compactionRisk: soilHydraulicProfile.compactionRisk,
      salinityAccumulationRisk: soilHydraulicProfile.salinityAccumulationRisk,
      hydraulicQuality: soilHydraulicProfile.hydraulicQuality,
      fieldCapacitySource: soilHydraulicProfile.fieldCapacitySource,
      wiltingPointSource: soilHydraulicProfile.wiltingPointSource,
      infiltrationSource: soilHydraulicProfile.infiltrationSource,
      rootDepthSource: soilHydraulicProfile.rootDepthSource,
      effectiveStorageFraction: soilHydraulicProfile.effectiveStorageFraction,
      refillTriggerThresholdPercent: soilHydraulicProfile.refillTriggerThresholdPercent,
      refillEventTargetMm: soilHydraulicProfile.refillEventTargetMm,
      pulseSplitRecommended: soilHydraulicProfile.pulseSplitRecommended,
      pulseCountSuggestion: soilHydraulicProfile.pulseCountSuggestion,
      drainageConstraintFactor: soilHydraulicProfile.drainageConstraintFactor,
      compactionConstraintFactor: soilHydraulicProfile.compactionConstraintFactor,
      salinityPressureIndex: soilHydraulicProfile.salinityPressureIndex,
      hydraulicSource: soilHydraulicProfile.source,
      notes: soilHydraulicProfile.notes,
    }
  }

  private applySoilConstraintAdjustment(
    irrigationNeedMm: number,
    soilHydraulicProfile?: SoilHydraulicProfile | null,
    soilWaterBalance?: WaterRequirement['soilWaterBalance']
  ): number {
    if (!soilHydraulicProfile || irrigationNeedMm <= 0) {
      return irrigationNeedMm
    }

    let factor = 1

    factor *= soilHydraulicProfile.drainageConstraintFactor || 1
    factor *= soilHydraulicProfile.compactionConstraintFactor || 1

    if (soilHydraulicProfile.salinityAccumulationRisk === 'medium') factor *= 1.03
    if (soilHydraulicProfile.salinityAccumulationRisk === 'high') factor *= 1.08
    if (soilHydraulicProfile.hydraulicQuality === 'estimated') factor *= 0.97

    const adjustedNeed = Number((irrigationNeedMm * factor).toFixed(2))
    const refillCap = soilWaterBalance?.refillEventTargetMm

    if (
      typeof refillCap === 'number' &&
      refillCap > 0 &&
      soilWaterBalance?.pulseSplitRecommended !== true
    ) {
      return Number(Math.min(adjustedNeed, refillCap).toFixed(2))
    }

    return adjustedNeed
  }

  private estimateRecommendedDurationMinutes(
    recommendedVolumeLiters: number,
    systems: IrrigationSystem[],
    soilWaterBalance?: WaterRequirement['soilWaterBalance']
  ): number | undefined {
    if (recommendedVolumeLiters <= 0) {
      return undefined
    }

    const flowRateLh = systems.find((system) => typeof system.flowRateLh === 'number' && system.flowRateLh > 0)?.flowRateLh
    if (!flowRateLh || flowRateLh <= 0) {
      return undefined
    }

    const pulseCount = Math.max(1, soilWaterBalance?.pulseCountSuggestion || 1)
    return Number(((recommendedVolumeLiters / flowRateLh) * 60 / pulseCount).toFixed(0))
  }

  private applyWaterQualityLeachingAdjustment(
    irrigationNeedMm: number,
    waterQualityProfile?: IrrigationWaterQualityProfile | null
  ): number {
    if (!waterQualityProfile?.leachingFractionPercent || irrigationNeedMm <= 0) {
      return irrigationNeedMm
    }

    return Number(
      (irrigationNeedMm * (1 + waterQualityProfile.leachingFractionPercent / 100)).toFixed(2)
    )
  }

  private enrichWeatherDataWithWaterQuality(
    weatherData: any,
    waterQualityProfile?: IrrigationWaterQualityProfile | null
  ): WaterRequirement['weatherData'] {
    const baseWeatherData: WaterRequirement['weatherData'] = {
      effectiveRainfallMm: Number(weatherData?.effectiveRainfallMm ?? 0),
      temperatureAvgCelsius:
        weatherData?.temperatureAvgCelsius !== undefined
          ? Number(weatherData.temperatureAvgCelsius)
          : undefined,
      humidityAvgPercentage:
        weatherData?.humidityAvgPercentage !== undefined
          ? Number(weatherData.humidityAvgPercentage)
          : undefined,
      windSpeedAvgKmh:
        weatherData?.windSpeedAvgKmh !== undefined
          ? Number(weatherData.windSpeedAvgKmh)
          : undefined,
      solarRadiationMjm2:
        weatherData?.solarRadiationMjm2 !== undefined
          ? Number(weatherData.solarRadiationMjm2)
          : undefined,
    }

    if (!waterQualityProfile) {
      return baseWeatherData
    }

    return {
      ...baseWeatherData,
      waterSalinity: baseWeatherData.waterSalinity ?? waterQualityProfile.salinity?.value,
      waterPh: baseWeatherData.waterPh ?? waterQualityProfile.ph?.value,
      waterBicarbonates:
        baseWeatherData.waterBicarbonates ?? waterQualityProfile.bicarbonates?.value,
      waterSource: baseWeatherData.waterSource ?? waterQualityProfile.waterSource,
      waterQualityBand: baseWeatherData.waterQualityBand ?? waterQualityProfile.qualityBand,
      waterQualityNotes:
        baseWeatherData.waterQualityNotes ?? waterQualityProfile.notes ?? [],
    }
  }

  private async getWaterMeasuredFeedbackSummary(
    zoneId: string,
    cropName?: string,
    profileId?: string
  ): Promise<AgronomicMeasuredFeedbackSummary | null> {
    try {
      const storageProvider = getDefaultStorageProvider()
      const zone = await this.getIrrigationZone(zoneId)
      if (!zone?.gardenId) {
        return null
      }

      const records = await getAgronomicMeasuredFeedbackRecords(storageProvider, zone.gardenId)
      const measuredFeedbackSummary = summarizeAgronomicMeasuredFeedback(records, {
        focus: 'water',
        zoneId,
        plantName: cropName,
      })
      const learningSnapshots = await getAgronomicProfileLearningSnapshots(storageProvider, zone.gardenId)
      const learningSnapshot = findAgronomicProfileLearningSnapshot(learningSnapshots, {
        focus: 'water',
        zoneId,
        plantName: cropName,
        profileId,
      })

      if (!learningSnapshot) {
        return measuredFeedbackSummary
      }

      if (!measuredFeedbackSummary) {
        return {
          sampleCount: learningSnapshot.sampleCount,
          matchedBy: learningSnapshot.zoneId === zoneId ? 'zone' : learningSnapshot.plantName ? 'plant' : 'focus',
          latestRecordedAt: learningSnapshot.updatedAt,
          scoreAdjustment: learningSnapshot.scoreAdjustment,
          confidenceAdjustment: learningSnapshot.confidenceAdjustment,
          positiveSignals: learningSnapshot.scoreAdjustment < 0 ? 1 : 0,
          negativeSignals: learningSnapshot.scoreAdjustment > 0 ? 1 : 0,
          rationale: learningSnapshot.rationale,
        }
      }

      return {
        ...measuredFeedbackSummary,
        sampleCount: Math.max(measuredFeedbackSummary.sampleCount, learningSnapshot.sampleCount),
        latestRecordedAt: learningSnapshot.updatedAt || measuredFeedbackSummary.latestRecordedAt,
        scoreAdjustment: measuredFeedbackSummary.scoreAdjustment + learningSnapshot.scoreAdjustment,
        confidenceAdjustment: Math.min(
          0.18,
          measuredFeedbackSummary.confidenceAdjustment + learningSnapshot.confidenceAdjustment
        ),
        rationale: [
          ...measuredFeedbackSummary.rationale,
          ...learningSnapshot.rationale,
        ],
      }
    } catch (error) {
      console.error('Error loading measured water feedback summary:', error)
      return null
    }
  }

  private getAvailableAgronomicSignals(weatherData?: any): Set<AgronomicSignalKey> {
    const availableSignals = new Set<AgronomicSignalKey>()

    if (!weatherData) {
      return availableSignals
    }

    if (
      weatherData.temperatureAvgCelsius !== undefined ||
      weatherData.humidityAvgPercentage !== undefined ||
      weatherData.windSpeedAvgKmh !== undefined ||
      weatherData.solarRadiationMjm2 !== undefined
    ) {
      availableSignals.add('weather_current')
    }

    if (
      weatherData.forecastSummary ||
      weatherData.forecastSource ||
      weatherData.forecastHours !== undefined
    ) {
      availableSignals.add('weather_forecast')
    }

    if (weatherData.effectiveRainfallMm !== undefined) {
      availableSignals.add('rain_gauge_local')
    }

    if (
      weatherData.soilMoisture10cm !== undefined ||
      weatherData.soilMoisture10 !== undefined
    ) {
      availableSignals.add('soil_moisture_10cm')
    }

    if (
      weatherData.soilMoisture30cm !== undefined ||
      weatherData.soilMoisture30 !== undefined
    ) {
      availableSignals.add('soil_moisture_30cm')
    }

    if (
      weatherData.soilMoisture60cm !== undefined ||
      weatherData.soilMoisture60 !== undefined
    ) {
      availableSignals.add('soil_moisture_60cm')
    }

    if (weatherData.soilTensionKpa !== undefined) {
      availableSignals.add('soil_tension_kpa')
    }

    if (
      weatherData.leafWetness !== undefined ||
      weatherData.leafWetnessHours !== undefined
    ) {
      availableSignals.add('leaf_wetness')
    }

    if (weatherData.dewPointCelsius !== undefined) {
      availableSignals.add('dew_point')
    }

    if (weatherData.vpdKpa !== undefined) {
      availableSignals.add('vpd')
    }

    if (weatherData.canopyTemperatureCelsius !== undefined) {
      availableSignals.add('canopy_temperature')
    }

    if (weatherData.flowRateActual !== undefined) {
      availableSignals.add('flow_rate_actual')
    }

    if (weatherData.linePressure !== undefined) {
      availableSignals.add('line_pressure')
    }

    if (weatherData.waterSalinity !== undefined) {
      availableSignals.add('water_salinity')
    }

    if (weatherData.waterPh !== undefined) {
      availableSignals.add('water_ph')
    }

    if (weatherData.waterBicarbonates !== undefined) {
      availableSignals.add('water_bicarbonates')
    }

    if (weatherData.phenologyObservation) {
      availableSignals.add('phenology_observation')
    }

    if (weatherData.qualityResult) {
      availableSignals.add('quality_result')
    }

    if (weatherData.operationLedgerReference) {
      availableSignals.add('operation_ledger')
    }

    if (weatherData.ndvi !== undefined) {
      availableSignals.add('ndvi')
    }

    if (weatherData.satelliteVigor !== undefined) {
      availableSignals.add('satellite_vigor')
    }

    return availableSignals
  }

  private calculateIrrigationRecommendationPriorityBaseScore(
    averageEfficiency: number,
    uniformityCoefficient: number,
    waterUseEfficiency: number
  ): number {
    const efficiencyGap = Math.max(0, 100 - averageEfficiency)
    const uniformityGap = Math.max(0, 100 - uniformityCoefficient)
    const waterUseGap = Math.max(0, 100 - waterUseEfficiency)

    return Math.max(
      20,
      Math.min(
        100,
        Math.round(efficiencyGap * 0.45 + uniformityGap * 0.25 + waterUseGap * 0.3)
      )
    )
  }

  private calculateIrrigationRecommendationConfidence(validLogs: number): number {
    if (validLogs >= 8) return 0.88
    if (validLogs >= 4) return 0.78
    if (validLogs >= 2) return 0.68
    return 0.52
  }

  private getAvailableWaterSignalsFromEfficiencyLogs(logs: any[]): Set<AgronomicSignalKey> {
    const availableSignals = new Set<AgronomicSignalKey>(['operation_ledger'])

    if (logs.length === 0) {
      return availableSignals
    }

    availableSignals.add('flow_rate_actual')

    if (logs.some((log) => log.pressure_avg_bar !== null || log.pressure_start_bar !== null)) {
      availableSignals.add('line_pressure')
    }

    if (logs.some((log) => log.soil_moisture_before_percentage !== null || log.soil_moisture_after_percentage !== null)) {
      availableSignals.add('soil_moisture_10cm')
    }

    if (logs.some((log) => log.weather_conditions || log.temperature_celsius !== null || log.humidity_percentage !== null)) {
      availableSignals.add('weather_current')
    }

    return availableSignals
  }
}

export const advancedIrrigationService = new AdvancedIrrigationService()
