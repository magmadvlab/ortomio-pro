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
import { getSupabaseClient } from '@/config/supabase'

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
      
      // Prima verifica se la tabella esiste
      const { data: zones, error } = await supabase
        .from('irrigation_zones')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
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

      // Se non ci sono zone, ritorna array vuoto
      if (!zones || zones.length === 0) {
        return []
      }

      // Prova a ottenere i sistemi di irrigazione associati
      try {
        const { data: systems } = await supabase
          .from('irrigation_systems')
          .select('*')
          .in('zone_id', zones.map(z => z.id))

        // Mappa i dati combinando zone e sistemi
        return zones.map(zone => ({
          ...this.mapZoneFromDatabase(zone),
          systems: systems?.filter(s => s.zone_id === zone.id) || []
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
      const { data, error } = await supabase
        .from('irrigation_systems')
        .select('*')
        .eq('zone_id', zoneId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapSystemFromDatabase) || []
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
    weatherData?: any
  ): Promise<WaterRequirement> {
    try {
      const supabase = getSupabaseClient()
      
      // Get zone information for area calculation
      const { data: zone, error: zoneError } = await supabase
        .from('irrigation_zones')
        .select('area_sqm, efficiency_percentage')
        .eq('id', zoneId)
        .single()

      if (zoneError) throw zoneError

      // Calculate crop evapotranspiration
      const etcMm = et0Mm * kcCoefficient

      // Calculate irrigation need (considering effective rainfall)
      const effectiveRainfallMm = weatherData?.effectiveRainfallMm || 0
      const irrigationNeedMm = Math.max(0, etcMm - effectiveRainfallMm)

      // Calculate recommended volume (1mm over 1m² = 1 liter)
      const recommendedVolumeLiters = irrigationNeedMm * zone.area_sqm

      // Adjust for system efficiency (default 85%)
      const systemEfficiency = zone.efficiency_percentage || 85
      const adjustedVolumeLiters = recommendedVolumeLiters / (systemEfficiency / 100)

      const waterRequirement: Omit<WaterRequirement, 'id'> = {
        zoneId,
        calculationDate: date,
        et0Mm,
        kcCoefficient,
        etcMm,
        cropStage: cropStage || 'vegetative',
        weatherData: weatherData || {},
        irrigationNeedMm,
        recommendedVolumeLiters: adjustedVolumeLiters,
        calculationMethod: 'penman_monteith',
        confidenceLevel: 85,
        aiAdjustmentFactor: 1.0,
        createdAt: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('water_requirements')
        .insert([this.mapWaterRequirementToDatabase(waterRequirement)])
        .select()
        .single()

      if (error) throw error

      return this.mapWaterRequirementFromDatabase(data)
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

  async getIrrigationEfficiencyReport(zoneId: string, period: string): Promise<EfficiencyReport> {
    try {
      const supabase = getSupabaseClient()
      
      // Get zone info
      const { data: zone, error: zoneError } = await supabase
        .from('irrigation_zones')
        .select('name')
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

      return {
        zoneId,
        zoneName: zone.name,
        period,
        averageEfficiency,
        uniformityCoefficient,
        waterUseEfficiency,
        recommendations
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
      
      // Get active zones count
      const { data: zones, error: zonesError } = await supabase
        .from('irrigation_zones')
        .select('id')
        .eq('garden_id', gardenId)
        .eq('is_active', true)

      if (zonesError) {
        // Check if it's a table not found error
        const errorMessage = zonesError.message || ''
        if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          console.warn('Irrigation tables not found. Please run the irrigation system migration.')
          console.warn('Run: supabase migration up --file supabase/migrations/20260117010000_create_advanced_irrigation_system.sql')
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
        throw zonesError
      }

      // Get active systems count
      const { data: systems, error: systemsError } = await supabase
        .from('irrigation_systems')
        .select('id')
        .eq('is_active', true)

      if (systemsError) throw systemsError

      // Get today's irrigations
      const today = new Date().toISOString().split('T')[0]
      const { data: todayLogs, error: logsError } = await supabase
        .from('irrigation_logs')
        .select('id')
        .gte('start_time', today)
        .lt('start_time', today + 'T23:59:59')

      if (logsError) throw logsError

      // Get weekly consumption
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: weeklyLogs, error: weeklyError } = await supabase
        .from('irrigation_logs')
        .select('actual_volume_liters')
        .gte('start_time', weekAgo)
        .not('actual_volume_liters', 'is', null)

      if (weeklyError) throw weeklyError

      const weeklyConsumption = weeklyLogs?.reduce(
        (sum, log) => sum + (log.actual_volume_liters || 0), 0
      ) || 0

      // Get recent logs
      const { data: recentLogs, error: recentError } = await supabase
        .from('irrigation_logs')
        .select(`
          *,
          irrigation_zones (name),
          irrigation_systems (name)
        `)
        .order('start_time', { ascending: false })
        .limit(5)

      if (recentError) throw recentError

      // Get upcoming schedules
      const { data: upcomingSchedules, error: schedulesError } = await supabase
        .from('irrigation_schedules')
        .select(`
          *,
          irrigation_zones (name)
        `)
        .eq('is_active', true)
        .gte('next_execution_date', today)
        .order('next_execution_date', { ascending: true })
        .limit(5)

      if (schedulesError) throw schedulesError

      return {
        activeZones: zones?.length || 0,
        activeSystems: systems?.length || 0,
        todayIrrigations: todayLogs?.length || 0,
        weeklyConsumption,
        currentAlerts: [], // Would need alert system implementation
        recentLogs: recentLogs?.map(this.mapLogFromDatabase) || [],
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

  private mapZoneFromDatabase(data: any): IrrigationZone {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      description: data.description,
      areaSqm: data.area_sqm,
      soilType: data.soil_type,
      slopePercentage: data.slope_percentage,
      sunExposure: data.sun_exposure,
      drainageQuality: data.drainage_quality,
      waterRetention: data.water_retention,
      phLevel: data.ph_level,
      organicMatterPercentage: data.organic_matter_percentage,
      isActive: data.is_active,
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
      zoneId: data.zone_id,
      name: data.name,
      systemType: data.system_type,
      brand: data.brand,
      model: data.model,
      installationDate: data.installation_date,
      flowRateLh: data.flow_rate_lh,
      pressureBar: data.pressure_bar,
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
      efficiencyPercentage: data.efficiency_percentage,
      uniformityCoefficient: data.uniformity_coefficient,
      isActive: data.is_active,
      lastMaintenanceDate: data.last_maintenance_date,
      nextMaintenanceDate: data.next_maintenance_date,
      maintenanceIntervalDays: data.maintenance_interval_days,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapSystemToDatabase(system: Partial<IrrigationSystem>): any {
    return {
      zone_id: system.zoneId,
      name: system.name,
      system_type: system.systemType,
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
}

export const advancedIrrigationService = new AdvancedIrrigationService()