/**
 * DailyDiaryService - Sistema di registrazione giornaliera automatica
 *
 * Questo servizio tiene traccia di tutti i parametri che influenzano la crescita vegetativa:
 * - Dati meteorologici giornalieri
 * - Calcolo GDD (Growing Degree Days)
 * - Ore di freddo per colture perenni
 * - Indici di stress (freddo, caldo, idrico)
 * - Eventi automatici e manuali
 *
 * Obiettivo: Costruire una base dati storica per:
 * 1. Confronto anno su anno
 * 2. Sistema predittivo per raccomandazioni
 */

import { getSupabaseClient } from '@/config/supabase'

// ============================================================================
// TYPES
// ============================================================================

export interface DailyWeatherLog {
  id?: string
  user_id: string
  log_date: string
  temp_min: number
  temp_max: number
  temp_avg: number
  humidity_min?: number
  humidity_max?: number
  humidity_avg?: number
  precipitation_mm: number
  wind_speed_avg?: number
  wind_speed_max?: number
  solar_radiation?: number
  uv_index?: number
  eto_calculated?: number
  weather_conditions?: string
  data_source: 'api' | 'manual' | 'station'
  raw_data?: Record<string, unknown>
}

export interface CultivationDailyTracking {
  id?: string
  user_id: string
  cultivation_id: string
  tracking_date: string
  daily_gdd: number
  accumulated_gdd: number
  daily_chill_hours?: number
  accumulated_chill_hours?: number
  cold_stress_index: number
  heat_stress_index: number
  water_stress_index: number
  phenological_stage?: string
  growth_rate_estimate?: number
  health_score?: number
  notes?: string
}

export interface DiaryEvent {
  id?: string
  user_id: string
  cultivation_id?: string
  zone_id?: string
  event_date: string
  event_type: 'weather_alert' | 'stress_detected' | 'phase_change' | 'treatment' | 'harvest' | 'observation' | 'pest_disease' | 'irrigation' | 'fertilization' | 'pruning' | 'other'
  event_category: 'automatic' | 'manual'
  severity?: 'info' | 'warning' | 'critical'
  title: string
  description?: string
  parameters_affected?: string[]
  weather_context?: Record<string, unknown>
  recommendations?: string[]
  resolved: boolean
  resolved_at?: string
  resolved_notes?: string
}

export interface GDDParameters {
  crop_type: string
  t_base: number
  t_optimal_min: number
  t_optimal_max: number
  t_max_threshold: number
  gdd_to_germination?: number
  gdd_to_flowering?: number
  gdd_to_harvest?: number
  chill_hours_required?: number
}

export interface YearlyComparisonData {
  cultivation_id: string
  year: number
  total_gdd: number
  total_chill_hours?: number
  total_precipitation: number
  avg_temperature: number
  stress_days_cold: number
  stress_days_heat: number
  stress_days_water: number
  yield_kg?: number
  quality_score?: number
  season_start?: string
  season_end?: string
  notes?: string
}

export interface PredictiveInsight {
  id?: string
  user_id: string
  cultivation_id?: string
  insight_date: string
  insight_type: 'yield_prediction' | 'stress_warning' | 'optimal_action' | 'disease_risk' | 'harvest_timing' | 'comparison_analysis'
  confidence_score: number
  title: string
  description: string
  data_basis?: Record<string, unknown>
  recommended_actions?: string[]
  valid_until?: string
  was_accurate?: boolean
  accuracy_notes?: string
}

// ============================================================================
// DAILY DIARY SERVICE
// ============================================================================

class DailyDiaryService {
  // Helper per ottenere il client Supabase
  private get supabase() {
    return getSupabaseClient()
  }

  // --------------------------------------------------------------------------
  // REGISTRAZIONE GIORNALIERA PRINCIPALE
  // --------------------------------------------------------------------------

  /**
   * Esegue la registrazione giornaliera completa
   * Da chiamare una volta al giorno (idealmente la sera)
   */
  async runDailyRegistration(userId: string, date?: string): Promise<{
    weatherLog: DailyWeatherLog | null
    cultivationsUpdated: number
    eventsGenerated: number
    errors: string[]
  }> {
    const logDate = date || new Date().toISOString().split('T')[0]
    const errors: string[] = []
    let weatherLog: DailyWeatherLog | null = null
    let cultivationsUpdated = 0
    let eventsGenerated = 0

    try {
      // 1. Registra dati meteo giornalieri
      weatherLog = await this.recordDailyWeather(userId, logDate)

      if (!weatherLog) {
        errors.push('Impossibile registrare i dati meteo')
        return { weatherLog, cultivationsUpdated, eventsGenerated, errors }
      }

      // 2. Aggiorna tracking per ogni coltivazione attiva
      const cultivations = await this.getActiveCultivations(userId)

      for (const cultivation of cultivations) {
        try {
          await this.updateCultivationTracking(userId, cultivation, weatherLog, logDate)
          cultivationsUpdated++
        } catch (err) {
          errors.push(`Errore tracking ${cultivation.id}: ${err}`)
        }
      }

      // 3. Genera eventi automatici basati sui dati
      const events = await this.generateAutomaticEvents(userId, weatherLog, logDate)
      eventsGenerated = events.length

    } catch (err) {
      errors.push(`Errore generale: ${err}`)
    }

    return { weatherLog, cultivationsUpdated, eventsGenerated, errors }
  }

  // --------------------------------------------------------------------------
  // REGISTRAZIONE METEO
  // --------------------------------------------------------------------------

  /**
   * Registra i dati meteorologici giornalieri
   */
  async recordDailyWeather(userId: string, date: string): Promise<DailyWeatherLog | null> {
    try {
      // Controlla se esiste già un log per questa data
      const { data: existing, error: existingError } = await this.supabase
        .from('daily_weather_log')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .single()

      if (existing && !existingError) {
        return existing as DailyWeatherLog
      }

      // Ottieni i dati meteo dall'API
      const weatherData = await this.fetchWeatherData(userId, date)

      if (!weatherData) {
        return null
      }

      // Calcola ETo (evapotraspirazione di riferimento)
      const eto = this.calculateETo(
        weatherData.temp_min ?? 0,
        weatherData.temp_max ?? 0,
        weatherData.solar_radiation,
        date
      )

      const log: DailyWeatherLog = {
        user_id: userId,
        log_date: date,
        temp_min: weatherData.temp_min ?? 0,
        temp_max: weatherData.temp_max ?? 0,
        temp_avg: weatherData.temp_avg ?? 0,
        precipitation_mm: weatherData.precipitation_mm ?? 0,
        humidity_min: weatherData.humidity_min,
        humidity_max: weatherData.humidity_max,
        humidity_avg: weatherData.humidity_avg,
        wind_speed_avg: weatherData.wind_speed_avg,
        wind_speed_max: weatherData.wind_speed_max,
        solar_radiation: weatherData.solar_radiation,
        uv_index: weatherData.uv_index,
        weather_conditions: weatherData.weather_conditions,
        eto_calculated: eto,
        data_source: 'api',
        raw_data: weatherData.raw_data
      }

      const { data, error } = await this.supabase
        .from('daily_weather_log')
        .insert(log)
        .select()
        .single()

      if (error || !data) throw error || new Error('No data returned')
      return data as DailyWeatherLog

    } catch (err) {
      console.error('Errore registrazione meteo:', err)
      return null
    }
  }

  /**
   * Recupera dati meteo da API o stazione locale
   */
  private async fetchWeatherData(userId: string, date: string): Promise<Partial<DailyWeatherLog> | null> {
    try {
      // Ottieni la posizione dell'utente
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('latitude, longitude, location')
        .eq('id', userId)
        .single()

      if (error || !profile?.latitude || !profile?.longitude) {
        // Fallback: usa coordinate di default (Roma)
        const lat = 41.9028
        const lon = 12.4964
        return this.fetchFromOpenMeteo(lat, lon, date)
      }

      return this.fetchFromOpenMeteo(profile.latitude, profile.longitude, date)
    } catch (err) {
      console.error('Errore fetch weather:', err)
      return null
    }
  }

  /**
   * Fetch da Open-Meteo API
   */
  private async fetchFromOpenMeteo(lat: number, lon: number, date: string): Promise<Partial<DailyWeatherLog> | null> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max,wind_speed_10m_mean,shortwave_radiation_sum,uv_index_max,weather_code&timezone=auto&start_date=${date}&end_date=${date}`

      const response = await fetch(url)
      const data = await response.json()

      if (!data.daily) return null

      const daily = data.daily
      const tempMin = daily.temperature_2m_min[0]
      const tempMax = daily.temperature_2m_max[0]

      return {
        temp_min: tempMin,
        temp_max: tempMax,
        temp_avg: (tempMin + tempMax) / 2,
        humidity_min: daily.relative_humidity_2m_min?.[0],
        humidity_max: daily.relative_humidity_2m_max?.[0],
        humidity_avg: daily.relative_humidity_2m_min && daily.relative_humidity_2m_max
          ? (daily.relative_humidity_2m_min[0] + daily.relative_humidity_2m_max[0]) / 2
          : undefined,
        precipitation_mm: daily.precipitation_sum[0] || 0,
        wind_speed_avg: daily.wind_speed_10m_mean?.[0],
        wind_speed_max: daily.wind_speed_10m_max?.[0],
        solar_radiation: daily.shortwave_radiation_sum?.[0],
        uv_index: daily.uv_index_max?.[0],
        weather_conditions: this.weatherCodeToCondition(daily.weather_code?.[0]),
        raw_data: data
      }
    } catch (err) {
      console.error('Errore Open-Meteo:', err)
      return null
    }
  }

  /**
   * Converte codice meteo in descrizione
   */
  private weatherCodeToCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: 'sereno',
      1: 'prevalentemente sereno',
      2: 'parzialmente nuvoloso',
      3: 'nuvoloso',
      45: 'nebbia',
      48: 'nebbia con brina',
      51: 'pioggerella leggera',
      53: 'pioggerella moderata',
      55: 'pioggerella intensa',
      61: 'pioggia leggera',
      63: 'pioggia moderata',
      65: 'pioggia intensa',
      71: 'neve leggera',
      73: 'neve moderata',
      75: 'neve intensa',
      80: 'rovesci leggeri',
      81: 'rovesci moderati',
      82: 'rovesci intensi',
      95: 'temporale',
      96: 'temporale con grandine leggera',
      99: 'temporale con grandine'
    }
    return conditions[code] || 'non disponibile'
  }

  /**
   * Calcola ETo con formula Hargreaves semplificata
   */
  private calculateETo(tempMin: number, tempMax: number, solarRad?: number, date?: string): number {
    // Formula Hargreaves-Samani
    const tempAvg = (tempMin + tempMax) / 2
    const tempRange = tempMax - tempMin

    // Ra: radiazione extraterrestre (approssimazione)
    // Per semplicità usiamo un valore medio per l'Italia
    const Ra = solarRad ? solarRad / 0.16 : 15 // MJ/m²/day

    const eto = 0.0023 * (tempAvg + 17.8) * Math.sqrt(Math.max(0, tempRange)) * Ra * 0.408

    return Math.round(eto * 100) / 100
  }

  // --------------------------------------------------------------------------
  // TRACKING COLTIVAZIONI
  // --------------------------------------------------------------------------

  /**
   * Ottieni coltivazioni attive dell'utente
   */
  private async getActiveCultivations(userId: string): Promise<Array<{
    id: string
    crop_type: string
    variety?: string
    planting_date?: string
    zone_id?: string
    status: string
  }>> {
    const { data, error } = await this.supabase
      .from('cultivations')
      .select('id, crop_type, variety, planting_date, zone_id, status')
      .eq('user_id', userId)
      .in('status', ['active', 'growing', 'flowering', 'fruiting'])

    if (error || !data) {
      console.error('Errore fetch cultivations:', error)
      return []
    }

    return data
  }

  /**
   * Aggiorna il tracking giornaliero per una coltivazione
   */
  async updateCultivationTracking(
    userId: string,
    cultivation: { id: string; crop_type: string; planting_date?: string },
    weather: DailyWeatherLog,
    date: string
  ): Promise<CultivationDailyTracking | null> {
    try {
      // Ottieni parametri GDD per questa coltura
      const gddParams = await this.getGDDParameters(cultivation.crop_type)

      // Calcola GDD giornaliero
      const dailyGDD = this.calculateDailyGDD(
        weather.temp_min,
        weather.temp_max,
        gddParams.t_base,
        gddParams.t_max_threshold
      )

      // Ottieni GDD accumulato precedente
      const accumulatedGDD = await this.getAccumulatedGDD(userId, cultivation.id, date)

      // Calcola ore di freddo (per colture perenni)
      const dailyChillHours = this.calculateChillHours(weather.temp_min, weather.temp_max)
      const accumulatedChillHours = await this.getAccumulatedChillHours(userId, cultivation.id, date)

      // Calcola indici di stress
      const coldStress = this.calculateColdStressIndex(weather.temp_min, gddParams.t_base)
      const heatStress = this.calculateHeatStressIndex(weather.temp_max, gddParams.t_optimal_max)
      const waterStress = this.calculateWaterStressIndex(
        weather.precipitation_mm,
        weather.eto_calculated || 0,
        weather.humidity_avg
      )

      // Determina fase fenologica
      const phenoStage = this.determinePhenologicalStage(
        accumulatedGDD + dailyGDD,
        gddParams
      )

      // Stima tasso di crescita
      const growthRate = this.estimateGrowthRate(dailyGDD, gddParams, coldStress, heatStress, waterStress)

      const tracking: CultivationDailyTracking = {
        user_id: userId,
        cultivation_id: cultivation.id,
        tracking_date: date,
        daily_gdd: dailyGDD,
        accumulated_gdd: accumulatedGDD + dailyGDD,
        daily_chill_hours: dailyChillHours,
        accumulated_chill_hours: (accumulatedChillHours || 0) + dailyChillHours,
        cold_stress_index: coldStress,
        heat_stress_index: heatStress,
        water_stress_index: waterStress,
        phenological_stage: phenoStage,
        growth_rate_estimate: growthRate
      }

      // Upsert nel database
      const { data, error } = await this.supabase
        .from('cultivation_daily_tracking')
        .upsert(tracking, {
          onConflict: 'user_id,cultivation_id,tracking_date'
        })
        .select()
        .single()

      if (error || !data) {
        console.error('Errore upsert tracking:', error)
        throw error || new Error('No data returned')
      }

      // Genera eventi se necessario
      await this.checkAndGenerateStressEvents(userId, cultivation.id, tracking, date)

      return data as CultivationDailyTracking

    } catch (err) {
      console.error('Errore tracking cultivation:', err)
      return null
    }
  }

  /**
   * Ottieni parametri GDD per una coltura
   */
  async getGDDParameters(cropType: string): Promise<GDDParameters> {
    // Prima prova dal database
    const { data, error } = await this.supabase
      .from('gdd_crop_parameters')
      .select('*')
      .eq('crop_type', cropType.toLowerCase())
      .single()

    if (data && !error) {
      return data as GDDParameters
    }

    // Fallback a valori di default
    return this.getDefaultGDDParameters(cropType)
  }

  /**
   * Parametri GDD di default per colture comuni
   */
  private getDefaultGDDParameters(cropType: string): GDDParameters {
    const defaults: Record<string, GDDParameters> = {
      pomodoro: { crop_type: 'pomodoro', t_base: 10, t_optimal_min: 20, t_optimal_max: 30, t_max_threshold: 35, gdd_to_germination: 100, gdd_to_flowering: 600, gdd_to_harvest: 1200 },
      zucchina: { crop_type: 'zucchina', t_base: 10, t_optimal_min: 18, t_optimal_max: 28, t_max_threshold: 35, gdd_to_germination: 80, gdd_to_flowering: 400, gdd_to_harvest: 700 },
      peperone: { crop_type: 'peperone', t_base: 12, t_optimal_min: 20, t_optimal_max: 30, t_max_threshold: 35, gdd_to_germination: 120, gdd_to_flowering: 700, gdd_to_harvest: 1400 },
      melanzana: { crop_type: 'melanzana', t_base: 12, t_optimal_min: 22, t_optimal_max: 30, t_max_threshold: 35, gdd_to_germination: 130, gdd_to_flowering: 750, gdd_to_harvest: 1500 },
      lattuga: { crop_type: 'lattuga', t_base: 4, t_optimal_min: 15, t_optimal_max: 22, t_max_threshold: 28, gdd_to_germination: 50, gdd_to_harvest: 500 },
      fagiolo: { crop_type: 'fagiolo', t_base: 10, t_optimal_min: 18, t_optimal_max: 28, t_max_threshold: 35, gdd_to_germination: 80, gdd_to_flowering: 450, gdd_to_harvest: 900 },
      vite: { crop_type: 'vite', t_base: 10, t_optimal_min: 20, t_optimal_max: 30, t_max_threshold: 38, gdd_to_flowering: 350, gdd_to_harvest: 1500, chill_hours_required: 800 },
      olivo: { crop_type: 'olivo', t_base: 9, t_optimal_min: 18, t_optimal_max: 28, t_max_threshold: 40, gdd_to_flowering: 500, gdd_to_harvest: 2000, chill_hours_required: 400 },
      melo: { crop_type: 'melo', t_base: 7, t_optimal_min: 18, t_optimal_max: 25, t_max_threshold: 35, gdd_to_flowering: 300, gdd_to_harvest: 1800, chill_hours_required: 1000 },
      pero: { crop_type: 'pero', t_base: 7, t_optimal_min: 18, t_optimal_max: 25, t_max_threshold: 35, gdd_to_flowering: 280, gdd_to_harvest: 1700, chill_hours_required: 900 },
      pesco: { crop_type: 'pesco', t_base: 7, t_optimal_min: 20, t_optimal_max: 28, t_max_threshold: 35, gdd_to_flowering: 250, gdd_to_harvest: 1400, chill_hours_required: 700 }
    }

    return defaults[cropType.toLowerCase()] || {
      crop_type: cropType,
      t_base: 10,
      t_optimal_min: 18,
      t_optimal_max: 28,
      t_max_threshold: 35,
      gdd_to_germination: 100,
      gdd_to_flowering: 500,
      gdd_to_harvest: 1000
    }
  }

  // --------------------------------------------------------------------------
  // CALCOLI GDD E STRESS
  // --------------------------------------------------------------------------

  /**
   * Calcola GDD giornaliero
   * Formula: GDD = ((Tmax + Tmin) / 2) - Tbase
   * Con limiti upper e lower
   */
  calculateDailyGDD(tempMin: number, tempMax: number, tBase: number, tMaxThreshold: number): number {
    // Applica limiti
    const adjustedMin = Math.max(tempMin, tBase)
    const adjustedMax = Math.min(tempMax, tMaxThreshold)

    // Calcola media
    const avgTemp = (adjustedMin + adjustedMax) / 2

    // GDD = media - tBase (minimo 0)
    const gdd = Math.max(0, avgTemp - tBase)

    return Math.round(gdd * 10) / 10
  }

  /**
   * Calcola ore di freddo (Chill Hours)
   * Metodo Utah semplificato: ore tra 0-7°C
   */
  calculateChillHours(tempMin: number, tempMax: number): number {
    // Stima semplificata basata su temperature giornaliere
    const avgTemp = (tempMin + tempMax) / 2

    if (avgTemp < 0) return 0
    if (avgTemp <= 7) {
      // Stima ore in base a quanto la temperatura è nel range ottimale
      const optimalRange = 7
      const efficiency = 1 - Math.abs(avgTemp - 3.5) / optimalRange
      return Math.round(24 * efficiency * 10) / 10
    }
    if (avgTemp <= 13) {
      // Efficacia ridotta
      return Math.round((13 - avgTemp) / 6 * 12 * 10) / 10
    }

    return 0
  }

  /**
   * Indice di stress da freddo (0-1)
   */
  calculateColdStressIndex(tempMin: number, tBase: number): number {
    if (tempMin >= tBase) return 0

    const deficit = tBase - tempMin
    // Stress aumenta esponenzialmente sotto tBase
    const stress = Math.min(1, deficit / 15)

    return Math.round(stress * 100) / 100
  }

  /**
   * Indice di stress da caldo (0-1)
   */
  calculateHeatStressIndex(tempMax: number, tOptimalMax: number): number {
    if (tempMax <= tOptimalMax) return 0

    const excess = tempMax - tOptimalMax
    // Stress aumenta con temperature oltre l'ottimale
    const stress = Math.min(1, excess / 10)

    return Math.round(stress * 100) / 100
  }

  /**
   * Indice di stress idrico (0-1)
   */
  calculateWaterStressIndex(precipitation: number, eto: number, humidity?: number): number {
    // Rapporto tra precipitazioni e evapotraspirazione
    const waterBalance = eto > 0 ? precipitation / eto : 1

    let stress = 0

    if (waterBalance < 0.5) {
      // Deficit idrico
      stress = (0.5 - waterBalance) * 2
    }

    // Considera anche umidità
    if (humidity !== undefined && humidity < 40) {
      stress += (40 - humidity) / 100
    }

    return Math.round(Math.min(1, stress) * 100) / 100
  }

  /**
   * Determina la fase fenologica basata su GDD accumulati
   */
  determinePhenologicalStage(accumulatedGDD: number, params: GDDParameters): string {
    if (params.gdd_to_germination && accumulatedGDD < params.gdd_to_germination) {
      return 'germinazione'
    }
    if (params.gdd_to_flowering && accumulatedGDD < params.gdd_to_flowering) {
      return 'vegetativa'
    }
    if (params.gdd_to_harvest && accumulatedGDD < params.gdd_to_harvest) {
      return 'fioritura/fruttificazione'
    }
    return 'maturazione'
  }

  /**
   * Stima tasso di crescita (0-100%)
   */
  estimateGrowthRate(
    dailyGDD: number,
    params: GDDParameters,
    coldStress: number,
    heatStress: number,
    waterStress: number
  ): number {
    // GDD ottimale giornaliero (circa 15-20 per la maggior parte delle colture)
    const optimalDailyGDD = (params.t_optimal_max - params.t_base) * 0.5

    // Efficienza GDD
    const gddEfficiency = Math.min(1, dailyGDD / optimalDailyGDD)

    // Riduci per stress
    const stressFactor = 1 - (coldStress * 0.5 + heatStress * 0.3 + waterStress * 0.4)

    const rate = gddEfficiency * Math.max(0, stressFactor) * 100

    return Math.round(rate)
  }

  // --------------------------------------------------------------------------
  // GDD ACCUMULATO
  // --------------------------------------------------------------------------

  /**
   * Ottieni GDD accumulato fino a una data
   */
  async getAccumulatedGDD(userId: string, cultivationId: string, beforeDate: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('cultivation_daily_tracking')
      .select('accumulated_gdd')
      .eq('user_id', userId)
      .eq('cultivation_id', cultivationId)
      .lt('tracking_date', beforeDate)
      .order('tracking_date', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return 0
    }

    return data.accumulated_gdd || 0
  }

  /**
   * Ottieni ore di freddo accumulate
   */
  async getAccumulatedChillHours(userId: string, cultivationId: string, beforeDate: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('cultivation_daily_tracking')
      .select('accumulated_chill_hours')
      .eq('user_id', userId)
      .eq('cultivation_id', cultivationId)
      .lt('tracking_date', beforeDate)
      .order('tracking_date', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return 0
    }

    return data.accumulated_chill_hours || 0
  }

  // --------------------------------------------------------------------------
  // GENERAZIONE EVENTI AUTOMATICI
  // --------------------------------------------------------------------------

  /**
   * Genera eventi automatici basati sui dati meteo
   */
  async generateAutomaticEvents(
    userId: string,
    weather: DailyWeatherLog,
    date: string
  ): Promise<DiaryEvent[]> {
    const events: DiaryEvent[] = []

    // Evento gelata
    if (weather.temp_min <= 0) {
      events.push({
        user_id: userId,
        event_date: date,
        event_type: 'weather_alert',
        event_category: 'automatic',
        severity: weather.temp_min < -3 ? 'critical' : 'warning',
        title: 'Gelata rilevata',
        description: `Temperatura minima: ${weather.temp_min}°C`,
        parameters_affected: ['cold_stress', 'growth_rate'],
        weather_context: { temp_min: weather.temp_min },
        recommendations: [
          'Verificare danni da gelo sulle piante',
          'Considerare coperture protettive per colture sensibili'
        ],
        resolved: false
      })
    }

    // Evento caldo estremo
    if (weather.temp_max >= 35) {
      events.push({
        user_id: userId,
        event_date: date,
        event_type: 'weather_alert',
        event_category: 'automatic',
        severity: weather.temp_max >= 40 ? 'critical' : 'warning',
        title: 'Caldo estremo',
        description: `Temperatura massima: ${weather.temp_max}°C`,
        parameters_affected: ['heat_stress', 'water_stress', 'growth_rate'],
        weather_context: { temp_max: weather.temp_max },
        recommendations: [
          'Aumentare frequenza irrigazioni',
          'Considerare ombreggiamento',
          'Evitare lavorazioni nelle ore più calde'
        ],
        resolved: false
      })
    }

    // Evento pioggia abbondante
    if (weather.precipitation_mm >= 30) {
      events.push({
        user_id: userId,
        event_date: date,
        event_type: 'weather_alert',
        event_category: 'automatic',
        severity: weather.precipitation_mm >= 50 ? 'warning' : 'info',
        title: 'Pioggia abbondante',
        description: `Precipitazioni: ${weather.precipitation_mm}mm`,
        parameters_affected: ['water_balance', 'disease_risk'],
        weather_context: { precipitation: weather.precipitation_mm },
        recommendations: [
          'Verificare drenaggio',
          'Monitorare rischio malattie fungine',
          'Rimandare trattamenti fitosanitari'
        ],
        resolved: false
      })
    }

    // Evento siccità (se no pioggia per lungo periodo)
    if (weather.precipitation_mm === 0 && weather.eto_calculated && weather.eto_calculated > 5) {
      events.push({
        user_id: userId,
        event_date: date,
        event_type: 'weather_alert',
        event_category: 'automatic',
        severity: 'info',
        title: 'Alta evapotraspirazione',
        description: `ETo: ${weather.eto_calculated}mm - Nessuna precipitazione`,
        parameters_affected: ['water_stress'],
        weather_context: { eto: weather.eto_calculated, precipitation: 0 },
        recommendations: [
          'Verificare umidità del suolo',
          'Programmare irrigazione se necessario'
        ],
        resolved: false
      })
    }

    // Salva eventi nel database
    for (const event of events) {
      await this.supabase.from('diary_events').insert(event)
    }

    return events
  }

  /**
   * Controlla e genera eventi di stress per una coltivazione
   */
  private async checkAndGenerateStressEvents(
    userId: string,
    cultivationId: string,
    tracking: CultivationDailyTracking,
    date: string
  ): Promise<void> {
    // Stress da freddo significativo
    if (tracking.cold_stress_index > 0.5) {
      await this.supabase.from('diary_events').insert({
        user_id: userId,
        cultivation_id: cultivationId,
        event_date: date,
        event_type: 'stress_detected',
        event_category: 'automatic',
        severity: tracking.cold_stress_index > 0.8 ? 'critical' : 'warning',
        title: 'Stress da freddo rilevato',
        description: `Indice stress freddo: ${Math.round(tracking.cold_stress_index * 100)}%`,
        parameters_affected: ['growth_rate', 'health'],
        recommendations: ['Monitorare la pianta nei prossimi giorni'],
        resolved: false
      })
    }

    // Stress da caldo significativo
    if (tracking.heat_stress_index > 0.5) {
      await this.supabase.from('diary_events').insert({
        user_id: userId,
        cultivation_id: cultivationId,
        event_date: date,
        event_type: 'stress_detected',
        event_category: 'automatic',
        severity: tracking.heat_stress_index > 0.8 ? 'critical' : 'warning',
        title: 'Stress da caldo rilevato',
        description: `Indice stress caldo: ${Math.round(tracking.heat_stress_index * 100)}%`,
        parameters_affected: ['growth_rate', 'water_needs'],
        recommendations: ['Aumentare irrigazione', 'Considerare ombreggiamento'],
        resolved: false
      })
    }

    // Stress idrico significativo
    if (tracking.water_stress_index > 0.5) {
      await this.supabase.from('diary_events').insert({
        user_id: userId,
        cultivation_id: cultivationId,
        event_date: date,
        event_type: 'stress_detected',
        event_category: 'automatic',
        severity: tracking.water_stress_index > 0.8 ? 'critical' : 'warning',
        title: 'Stress idrico rilevato',
        description: `Indice stress idrico: ${Math.round(tracking.water_stress_index * 100)}%`,
        parameters_affected: ['growth_rate', 'yield'],
        recommendations: ['Irrigare il prima possibile'],
        resolved: false
      })
    }
  }

  // --------------------------------------------------------------------------
  // EVENTI MANUALI
  // --------------------------------------------------------------------------

  /**
   * Registra un evento manuale nel diario
   */
  async recordManualEvent(event: Omit<DiaryEvent, 'event_category'>): Promise<DiaryEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('diary_events')
        .insert({ ...event, event_category: 'manual' })
        .select()
        .single()

      if (error || !data) {
        console.error('Errore registrazione evento:', error)
        return null
      }
      return data as DiaryEvent
    } catch (err) {
      console.error('Errore registrazione evento:', err)
      return null
    }
  }

  /**
   * Risolvi un evento
   */
  async resolveEvent(eventId: string, notes?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('diary_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_notes: notes
        })
        .eq('id', eventId)

      return !error
    } catch (err) {
      console.error('Errore risoluzione evento:', err)
      return false
    }
  }

  // --------------------------------------------------------------------------
  // QUERY DIARIO
  // --------------------------------------------------------------------------

  /**
   * Ottieni entry del diario per un singolo giorno
   */
  async getDailyEntry(
    gardenId: string,
    date: Date | string
  ): Promise<{
    weather: DailyWeatherLog | null
    tracking: CultivationDailyTracking[]
    events: DiaryEvent[]
  }> {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    
    const [weatherRes, trackingRes, eventsRes] = await Promise.all([
      this.supabase
        .from('daily_weather_log')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('log_date', dateStr)
        .maybeSingle(),
      this.supabase
        .from('cultivation_daily_tracking')
        .select('*')
        .eq('tracking_date', dateStr),
      this.supabase
        .from('diary_events')
        .select('*')
        .eq('event_date', dateStr)
    ])

    return {
      weather: weatherRes.data || null,
      tracking: trackingRes.data || [],
      events: eventsRes.data || []
    }
  }

  /**
   * Ottieni entries del diario per un periodo
   */
  async getDiaryEntries(
    userId: string,
    startDate: string,
    endDate: string,
    cultivationId?: string
  ): Promise<{
    weather: DailyWeatherLog[]
    tracking: CultivationDailyTracking[]
    events: DiaryEvent[]
  }> {
    const [weatherRes, trackingRes, eventsRes] = await Promise.all([
      this.supabase
        .from('daily_weather_log')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date'),

      this.supabase
        .from('cultivation_daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('tracking_date', startDate)
        .lte('tracking_date', endDate)
        .order('tracking_date')
        .then(res => {
          if (cultivationId && res.data) {
            return { ...res, data: res.data.filter(t => t.cultivation_id === cultivationId) }
          }
          return res
        }),

      this.supabase
        .from('diary_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date')
        .then(res => {
          if (cultivationId && res.data) {
            return { ...res, data: res.data.filter(e => !e.cultivation_id || e.cultivation_id === cultivationId) }
          }
          return res
        })
    ])

    return {
      weather: (weatherRes.data || []) as DailyWeatherLog[],
      tracking: (trackingRes.data || []) as CultivationDailyTracking[],
      events: (eventsRes.data || []) as DiaryEvent[]
    }
  }

  /**
   * Confronto anno su anno
   */
  async getYearOverYearComparison(
    userId: string,
    cultivationId: string,
    years: number[] = []
  ): Promise<YearlyComparisonData[]> {
    if (years.length === 0) {
      // Ultimi 3 anni
      const currentYear = new Date().getFullYear()
      years = [currentYear, currentYear - 1, currentYear - 2]
    }

    const comparisons: YearlyComparisonData[] = []

    for (const year of years) {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      // Ottieni dati aggregati
      const { data: tracking, error: trackingError } = await this.supabase
        .from('cultivation_daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('cultivation_id', cultivationId)
        .gte('tracking_date', startDate)
        .lte('tracking_date', endDate)

      const { data: weather, error: weatherError } = await this.supabase
        .from('daily_weather_log')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)

      if (!trackingError && tracking && tracking.length > 0) {
        const lastTracking = tracking[tracking.length - 1]
        const totalPrecip = weather?.reduce((sum, w) => sum + (w.precipitation_mm || 0), 0) || 0
        const avgTemp = weather && weather.length > 0 
          ? weather.reduce((sum, w) => sum + (w.temp_avg || 0), 0) / weather.length 
          : 0

        comparisons.push({
          cultivation_id: cultivationId,
          year,
          total_gdd: lastTracking.accumulated_gdd || 0,
          total_chill_hours: lastTracking.accumulated_chill_hours,
          total_precipitation: totalPrecip,
          avg_temperature: Math.round(avgTemp * 10) / 10,
          stress_days_cold: tracking.filter(t => t.cold_stress_index > 0.5).length,
          stress_days_heat: tracking.filter(t => t.heat_stress_index > 0.5).length,
          stress_days_water: tracking.filter(t => t.water_stress_index > 0.5).length,
          season_start: tracking[0]?.tracking_date,
          season_end: lastTracking.tracking_date
        })
      }
    }

    return comparisons
  }

  // --------------------------------------------------------------------------
  // PREDIZIONI
  // --------------------------------------------------------------------------

  /**
   * Genera insight predittivi basati sui dati storici
   */
  async generatePredictiveInsights(
    userId: string,
    cultivationId: string
  ): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = []
    const today = new Date().toISOString().split('T')[0]

    // Ottieni dati attuali
    const { data: currentTracking, error } = await this.supabase
      .from('cultivation_daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('cultivation_id', cultivationId)
      .order('tracking_date', { ascending: false })
      .limit(7)

    if (error || !currentTracking || currentTracking.length === 0) {
      return insights
    }

    const latest = currentTracking[0]
    const gddParams = await this.getGDDParameters(latest.phenological_stage || 'default')

    // Previsione raccolta
    if (gddParams.gdd_to_harvest && latest.accumulated_gdd) {
      const remainingGDD = gddParams.gdd_to_harvest - latest.accumulated_gdd
      if (remainingGDD > 0) {
        // Stima giorni rimanenti (media 15 GDD/giorno)
        const avgDailyGDD = currentTracking.reduce((sum, t) => sum + t.daily_gdd, 0) / currentTracking.length
        const estimatedDays = Math.round(remainingGDD / (avgDailyGDD || 15))

        const harvestDate = new Date()
        harvestDate.setDate(harvestDate.getDate() + estimatedDays)

        insights.push({
          user_id: userId,
          cultivation_id: cultivationId,
          insight_date: today,
          insight_type: 'harvest_timing',
          confidence_score: 0.7,
          title: 'Previsione raccolta',
          description: `Basandosi sui GDD accumulati (${Math.round(latest.accumulated_gdd)}/${gddParams.gdd_to_harvest}), la raccolta è stimata tra circa ${estimatedDays} giorni.`,
          data_basis: {
            accumulated_gdd: latest.accumulated_gdd,
            target_gdd: gddParams.gdd_to_harvest,
            avg_daily_gdd: avgDailyGDD
          },
          recommended_actions: estimatedDays < 14
            ? ['Preparare attrezzatura per raccolta', 'Ridurre irrigazione gradualmente']
            : [],
          valid_until: harvestDate.toISOString().split('T')[0]
        })
      }
    }

    // Warning stress
    const recentStress = currentTracking.filter(t =>
      t.cold_stress_index > 0.3 || t.heat_stress_index > 0.3 || t.water_stress_index > 0.3
    )

    if (recentStress.length >= 3) {
      const avgColdStress = recentStress.reduce((s, t) => s + t.cold_stress_index, 0) / recentStress.length
      const avgHeatStress = recentStress.reduce((s, t) => s + t.heat_stress_index, 0) / recentStress.length
      const avgWaterStress = recentStress.reduce((s, t) => s + t.water_stress_index, 0) / recentStress.length

      let stressType = ''
      let actions: string[] = []

      if (avgColdStress > avgHeatStress && avgColdStress > avgWaterStress) {
        stressType = 'freddo'
        actions = ['Applicare pacciamatura', 'Considerare coperture protettive']
      } else if (avgHeatStress > avgWaterStress) {
        stressType = 'caldo'
        actions = ['Aumentare frequenza irrigazione', 'Applicare ombreggiamento']
      } else {
        stressType = 'idrico'
        actions = ['Verificare sistema irrigazione', 'Aumentare volume irriguo']
      }

      insights.push({
        user_id: userId,
        cultivation_id: cultivationId,
        insight_date: today,
        insight_type: 'stress_warning',
        confidence_score: 0.8,
        title: `Stress ${stressType} persistente`,
        description: `La pianta sta subendo stress da ${stressType} da ${recentStress.length} giorni. Questo potrebbe impattare la resa finale.`,
        data_basis: {
          cold_stress_avg: avgColdStress,
          heat_stress_avg: avgHeatStress,
          water_stress_avg: avgWaterStress,
          days_affected: recentStress.length
        },
        recommended_actions: actions
      })
    }

    // Salva insights
    for (const insight of insights) {
      await this.supabase.from('predictive_insights').insert(insight)
    }

    return insights
  }
}

// Export singleton
export const dailyDiaryService = new DailyDiaryService()
export default dailyDiaryService
