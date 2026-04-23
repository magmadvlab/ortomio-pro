/**
 * DiaryPredictiveEngine - Motore Predittivo per il Diario Giornaliero
 *
 * Questo engine analizza i dati storici del diario per:
 * 1. Prevedere problemi prima che si verifichino
 * 2. Suggerire azioni ottimali basate su pattern passati
 * 3. Confrontare annate per identificare best practices
 * 4. Stimare rese e qualità del raccolto
 *
 * Utilizza algoritmi di machine learning semplificati e pattern matching
 * per fornire raccomandazioni accurate anche senza AI esterna.
 */

import { getSupabaseClient } from '@/config/supabase'
import { dailyDiaryService, type CultivationDailyTracking, type DailyWeatherLog, type DiaryEvent, type PredictiveInsight, type YearlyComparisonData } from './dailyDiaryService'
import {
  getPersistedZoneEnvironmentalHistorySummary,
  type ZoneEnvironmentalHistorySummary,
} from '@/services/environmentalMonitoringService'

// ============================================================================
// TYPES
// ============================================================================

export interface WeatherPattern {
  pattern_type: 'drought' | 'wet_period' | 'cold_spell' | 'heat_wave' | 'frost_risk' | 'optimal'
  start_date: string
  end_date?: string
  duration_days: number
  severity: number // 0-1
  affected_parameters: string[]
  historical_impact?: {
    yield_impact_percent: number
    quality_impact_percent: number
    recovery_days: number
  }
}

export interface CropPrediction {
  cultivation_id: string
  crop_type: string
  predicted_harvest_date: string
  confidence: number
  predicted_yield_kg?: number
  yield_vs_average_percent?: number
  predicted_quality_score?: number
  risk_factors: {
    factor: string
    probability: number
    impact: 'low' | 'medium' | 'high'
    mitigation: string[]
  }[]
  optimal_actions: {
    action: string
    timing: string
    priority: 'low' | 'medium' | 'high'
    expected_benefit: string
  }[]
}

export interface SeasonAnalysis {
  year: number
  growing_season_start: string
  growing_season_end: string
  total_growing_days: number
  total_gdd: number
  total_chill_hours: number
  total_precipitation_mm: number
  avg_temperature: number
  stress_events: {
    type: string
    count: number
    total_days: number
  }[]
  best_performing_crops: string[]
  worst_performing_crops: string[]
  key_learnings: string[]
}

export interface ActionRecommendation {
  id: string
  action_type: 'irrigation' | 'fertilization' | 'pest_control' | 'pruning' | 'harvest' | 'protection' | 'treatment'
  title: string
  description: string
  urgency: 'immediate' | 'today' | 'this_week' | 'planning'
  confidence: number
  affected_cultivations: string[]
  weather_window?: {
    start: string
    end: string
    conditions: string
  }
  data_basis: string[]
}

interface CultivationRecord {
  id: string
  crop_type: string
  status?: string
  zone_id?: string
}

interface TrackingWithCultivation extends CultivationDailyTracking {
  cultivations?: {
    crop_type?: string
  } | null
}

// ============================================================================
// PREDICTIVE ENGINE
// ============================================================================

class DiaryPredictiveEngine {
  // Helper per ottenere il client Supabase
  private get supabase(): NonNullable<ReturnType<typeof getSupabaseClient>> {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    return supabase
  }

  // --------------------------------------------------------------------------
  // ANALISI PATTERN METEO
  // --------------------------------------------------------------------------

  /**
   * Rileva pattern meteorologici significativi
   */
  async detectWeatherPatterns(
    userId: string,
    days: number = 14
  ): Promise<WeatherPattern[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: weatherData } = await this.supabase
      .from('daily_weather_log')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .lte('log_date', endDate.toISOString().split('T')[0])
      .order('log_date')

    const weather = (weatherData || []) as DailyWeatherLog[]
    if (weather.length < 3) return []

    const patterns: WeatherPattern[] = []

    // Rileva siccità (5+ giorni senza pioggia con alta ETo)
    let droughtDays = 0
    let droughtStart = ''
    for (const day of weather) {
      if (day.precipitation_mm < 1 && (day.eto_calculated || 0) > 3) {
        if (droughtDays === 0) droughtStart = day.log_date
        droughtDays++
      } else {
        if (droughtDays >= 5) {
          patterns.push({
            pattern_type: 'drought',
            start_date: droughtStart,
            end_date: weather[weather.indexOf(day) - 1]?.log_date,
            duration_days: droughtDays,
            severity: Math.min(1, droughtDays / 14),
            affected_parameters: ['water_stress', 'growth_rate', 'yield']
          })
        }
        droughtDays = 0
      }
    }

    // Rileva ondate di caldo (3+ giorni >35°C)
    let heatDays = 0
    let heatStart = ''
    let maxHeatTemp = 0
    for (const day of weather) {
      if (day.temp_max >= 35) {
        if (heatDays === 0) heatStart = day.log_date
        heatDays++
        maxHeatTemp = Math.max(maxHeatTemp, day.temp_max)
      } else {
        if (heatDays >= 3) {
          patterns.push({
            pattern_type: 'heat_wave',
            start_date: heatStart,
            end_date: weather[weather.indexOf(day) - 1]?.log_date,
            duration_days: heatDays,
            severity: Math.min(1, (maxHeatTemp - 35) / 10),
            affected_parameters: ['heat_stress', 'water_needs', 'pollination']
          })
        }
        heatDays = 0
        maxHeatTemp = 0
      }
    }

    // Rileva ondate di freddo (3+ giorni <5°C)
    let coldDays = 0
    let coldStart = ''
    let minColdTemp = 100
    for (const day of weather) {
      if (day.temp_min <= 5) {
        if (coldDays === 0) coldStart = day.log_date
        coldDays++
        minColdTemp = Math.min(minColdTemp, day.temp_min)
      } else {
        if (coldDays >= 3) {
          patterns.push({
            pattern_type: 'cold_spell',
            start_date: coldStart,
            end_date: weather[weather.indexOf(day) - 1]?.log_date,
            duration_days: coldDays,
            severity: Math.min(1, (5 - minColdTemp) / 10),
            affected_parameters: ['cold_stress', 'growth_rate', 'germination']
          })
        }
        coldDays = 0
        minColdTemp = 100
      }
    }

    // Rileva rischio gelata (previsione basata su trend)
    const recentWeather = weather.slice(-5)
    const tempTrend = this.calculateTrend(recentWeather.map((w: DailyWeatherLog) => w.temp_min))
    if (tempTrend < -1 && recentWeather[recentWeather.length - 1].temp_min < 5) {
      patterns.push({
        pattern_type: 'frost_risk',
        start_date: new Date().toISOString().split('T')[0],
        duration_days: 0,
        severity: Math.min(1, Math.abs(tempTrend) / 3),
        affected_parameters: ['frost_damage', 'survival']
      })
    }

    // Rileva periodo ottimale
    const optimalDays = weather.filter((w: DailyWeatherLog) =>
      w.temp_min >= 10 &&
      w.temp_max <= 30 &&
      w.temp_max >= 20 &&
      (w.precipitation_mm > 0 || (w.humidity_avg || 60) >= 50)
    )
    if (optimalDays.length >= 5) {
      patterns.push({
        pattern_type: 'optimal',
        start_date: optimalDays[0].log_date,
        end_date: optimalDays[optimalDays.length - 1].log_date,
        duration_days: optimalDays.length,
        severity: 0,
        affected_parameters: ['growth_rate', 'health']
      })
    }

    return patterns
  }

  /**
   * Calcola trend lineare
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  // --------------------------------------------------------------------------
  // PREVISIONI COLTURE
  // --------------------------------------------------------------------------

  /**
   * Genera previsioni complete per una coltivazione
   */
  async generateCropPrediction(
    userId: string,
    cultivationId: string
  ): Promise<CropPrediction | null> {
    // Ottieni dati coltivazione
    const { data: cultivation } = await this.supabase
      .from('cultivations')
      .select('*')
      .eq('id', cultivationId)
      .single()

    if (!cultivation) return null

    // Ottieni tracking recente
    const { data: trackingData } = await this.supabase
      .from('cultivation_daily_tracking')
      .select('*')
      .eq('cultivation_id', cultivationId)
      .order('tracking_date', { ascending: false })
      .limit(30)

    const tracking = (trackingData || []) as CultivationDailyTracking[]
    if (tracking.length === 0) return null

    const latest = tracking[0]
    const gddParams = await dailyDiaryService.getGDDParameters(cultivation.crop_type)
    const zoneHistorySummary = await this.getRecentZoneHistorySummary(
      userId,
      cultivation.zone_id,
      new Date().toISOString().split('T')[0]
    )

    // Calcola data raccolta prevista
    const remainingGDD = (gddParams.gdd_to_harvest || 1000) - (latest.accumulated_gdd || 0)
    const avgDailyGDD = tracking.reduce((sum: number, t: CultivationDailyTracking) => sum + t.daily_gdd, 0) / tracking.length
    const daysToHarvest = Math.max(0, Math.round(remainingGDD / (avgDailyGDD || 10)))

    const harvestDate = new Date()
    harvestDate.setDate(harvestDate.getDate() + daysToHarvest)

    // Analizza fattori di rischio
    const riskFactors = await this.analyzeRiskFactors(
      userId,
      cultivationId,
      tracking,
      zoneHistorySummary
    )

    // Genera azioni ottimali
    const optimalActions = await this.generateOptimalActions(
      userId,
      cultivation,
      tracking,
      riskFactors,
      zoneHistorySummary
    )

    // Stima resa basata su stress accumulato
    const yieldEstimate = this.estimateYield(tracking, gddParams)

    return {
      cultivation_id: cultivationId,
      crop_type: cultivation.crop_type,
      predicted_harvest_date: harvestDate.toISOString().split('T')[0],
      confidence: this.calculatePredictionConfidence(tracking.length, remainingGDD),
      predicted_yield_kg: yieldEstimate.predicted_kg,
      yield_vs_average_percent: yieldEstimate.vs_average,
      predicted_quality_score: yieldEstimate.quality,
      risk_factors: riskFactors,
      optimal_actions: optimalActions
    }
  }

  /**
   * Analizza fattori di rischio
   */
  private async analyzeRiskFactors(
    userId: string,
    cultivationId: string,
    tracking: CultivationDailyTracking[],
    zoneHistorySummary?: ZoneEnvironmentalHistorySummary | null
  ): Promise<CropPrediction['risk_factors']> {
    const risks: CropPrediction['risk_factors'] = []

    // Rischio stress idrico
    const waterStressDays = tracking.filter(t => t.water_stress_index > 0.5).length
    if (waterStressDays > 3) {
      risks.push({
        factor: 'Stress idrico persistente',
        probability: Math.min(0.9, waterStressDays / 10),
        impact: waterStressDays > 7 ? 'high' : 'medium',
        mitigation: [
          'Aumentare frequenza irrigazione',
          'Verificare sistema di irrigazione',
          'Applicare pacciamatura per ridurre evaporazione'
        ]
      })
    }

    if (
      zoneHistorySummary &&
      (
        zoneHistorySummary.highSoilWaterStressDays >= 3 ||
        zoneHistorySummary.latestSoilWaterStressLevel === 'high'
      )
    ) {
      risks.push({
        factor: 'Vincolo idrico persistente di zona',
        probability: Math.min(
          0.92,
          0.35 + zoneHistorySummary.highSoilWaterStressDays * 0.1
        ),
        impact:
          zoneHistorySummary.latestSoilWaterStressLevel === 'high' ||
          zoneHistorySummary.highSoilWaterStressDays >= 5
            ? 'high'
            : 'medium',
        mitigation: [
          'Ricalibrare i turni irrigui sulla storia ambientale della zona',
          'Verificare umidita del suolo a 30-60 cm e uniformita di distribuzione',
          'Preferire interventi piu frazionati se il deficit resta alto per piu giorni'
        ]
      })
    }

    // Rischio stress termico
    const heatStressDays = tracking.filter(t => t.heat_stress_index > 0.5).length
    if (heatStressDays > 2) {
      risks.push({
        factor: 'Stress da caldo',
        probability: Math.min(0.8, heatStressDays / 7),
        impact: heatStressDays > 5 ? 'high' : 'medium',
        mitigation: [
          'Applicare ombreggiamento',
          'Irrigare nelle ore più fresche',
          'Considerare trattamenti antistress'
        ]
      })
    }

    // Rischio malattie fungine (umidità + temperatura)
    const { data: weatherData } = await this.supabase
      .from('daily_weather_log')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(7)

    const weather = (weatherData || []) as DailyWeatherLog[]
    if (weather.length > 0) {
      const fungalRiskDays = weather.filter((w: DailyWeatherLog) =>
        (w.humidity_avg || 60) > 80 &&
        w.temp_avg >= 15 &&
        w.temp_avg <= 25
      ).length

      if (fungalRiskDays >= 3) {
        risks.push({
          factor: 'Rischio malattie fungine',
          probability: Math.min(0.85, fungalRiskDays / 5),
          impact: 'high',
          mitigation: [
            'Trattamento preventivo con fungicida',
            'Migliorare circolazione aria',
            'Ridurre bagnatura fogliare'
          ]
        })
      }
    }

    if (zoneHistorySummary && zoneHistorySummary.highDiseasePressureDays >= 3) {
      risks.push({
        factor: 'Pressione ambientale favorevole a patogeni',
        probability: Math.min(0.9, 0.4 + zoneHistorySummary.highDiseasePressureDays * 0.08),
        impact: zoneHistorySummary.highDiseasePressureDays >= 5 ? 'high' : 'medium',
        mitigation: [
          'Usare il ledger ambientale di zona per scegliere la finestra di trattamento',
          'Ridurre bagnatura fogliare e migliorare aerazione',
          'Controllare se i sensori locali confermano umidita persistente'
        ]
      })
    }

    // Rischio da GDD insufficienti
    const avgGDD = tracking.reduce((sum, t) => sum + t.daily_gdd, 0) / tracking.length
    if (avgGDD < 5) {
      risks.push({
        factor: 'Crescita rallentata',
        probability: 0.7,
        impact: 'medium',
        mitigation: [
          'Considerare copertura per aumentare temperatura',
          'Rimandare trapianti di colture sensibili',
          'Monitorare sviluppo fenologico'
        ]
      })
    }

    return risks
  }

  /**
   * Genera azioni ottimali
   */
  private async generateOptimalActions(
    userId: string,
    cultivation: { crop_type: string; status: string },
    tracking: CultivationDailyTracking[],
    risks: CropPrediction['risk_factors'],
    zoneHistorySummary?: ZoneEnvironmentalHistorySummary | null
  ): Promise<CropPrediction['optimal_actions']> {
    const actions: CropPrediction['optimal_actions'] = []
    const today = new Date()

    // Azioni basate su stress recente
    const recentTracking = tracking.slice(0, 7)
    const avgWaterStress = recentTracking.reduce((s, t) => s + t.water_stress_index, 0) / recentTracking.length

    if (avgWaterStress > 0.3) {
      actions.push({
        action: 'Irrigazione supplementare',
        timing: 'Entro 24-48 ore',
        priority: avgWaterStress > 0.6 ? 'high' : 'medium',
        expected_benefit: 'Riduzione stress idrico del 50-70%'
      })
    }

    if (
      zoneHistorySummary &&
      (
        zoneHistorySummary.highSoilWaterStressDays >= 2 ||
        zoneHistorySummary.latestSoilWaterStressLevel === 'high'
      )
    ) {
      actions.push({
        action: 'Ricalibrazione irrigua sulla storia di zona',
        timing: zoneHistorySummary.latestSoilWaterStressLevel === 'high' ? 'Entro 24 ore' : 'Questa settimana',
        priority: zoneHistorySummary.latestSoilWaterStressLevel === 'high' ? 'high' : 'medium',
        expected_benefit: 'Riduzione del rischio di deficit persistente e migliore coerenza tra meteo, sensori e suolo'
      })
    }

    if (zoneHistorySummary && zoneHistorySummary.highDiseasePressureDays >= 3) {
      actions.push({
        action: 'Sfrutta una finestra asciutta confermata dal ledger ambientale',
        timing: 'Prossimi 2-3 giorni',
        priority: zoneHistorySummary.highDiseasePressureDays >= 5 ? 'high' : 'medium',
        expected_benefit: 'Migliore efficacia dei trattamenti e minore pressione fungina residua'
      })
    }

    // Azioni basate su fase fenologica
    const currentStage = recentTracking[0]?.phenological_stage

    if (currentStage === 'fioritura/fruttificazione') {
      actions.push({
        action: 'Concimazione potassica',
        timing: 'Questa settimana',
        priority: 'medium',
        expected_benefit: 'Migliore allegagione e qualità frutti'
      })
    }

    if (currentStage === 'vegetativa') {
      actions.push({
        action: 'Concimazione azotata leggera',
        timing: 'Prossimi 7 giorni',
        priority: 'medium',
        expected_benefit: 'Stimolo crescita vegetativa'
      })
    }

    // Azioni preventive basate su rischi
    for (const risk of risks) {
      if (risk.probability > 0.5 && risk.impact !== 'low') {
        actions.push({
          action: risk.mitigation[0],
          timing: risk.impact === 'high' ? 'Immediatamente' : 'Questa settimana',
          priority: risk.impact === 'high' ? 'high' : 'medium',
          expected_benefit: `Riduzione rischio ${risk.factor.toLowerCase()}`
        })
      }
    }

    // Ordina per priorità
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return actions.slice(0, 5) // Max 5 azioni
  }

  /**
   * Stima resa basata su dati tracking
   */
  private estimateYield(
    tracking: CultivationDailyTracking[],
    gddParams: { gdd_to_harvest?: number }
  ): { predicted_kg?: number; vs_average?: number; quality?: number } {
    if (tracking.length === 0) return {}

    // Calcola fattore stress medio
    const avgColdStress = tracking.reduce((s, t) => s + t.cold_stress_index, 0) / tracking.length
    const avgHeatStress = tracking.reduce((s, t) => s + t.heat_stress_index, 0) / tracking.length
    const avgWaterStress = tracking.reduce((s, t) => s + t.water_stress_index, 0) / tracking.length

    // Impatto stimato sulla resa (ogni stress riduce del 10-30%)
    const stressImpact = 1 - (avgColdStress * 0.2 + avgHeatStress * 0.15 + avgWaterStress * 0.25)

    // Giorni con crescita ottimale
    const optimalDays = tracking.filter(t =>
      t.growth_rate_estimate && t.growth_rate_estimate > 70
    ).length
    const optimalRatio = optimalDays / tracking.length

    // Qualità stimata (0-100)
    const quality = Math.round(
      (stressImpact * 0.5 + optimalRatio * 0.5) * 100
    )

    return {
      vs_average: Math.round((stressImpact * 100) - 100),
      quality: Math.max(0, Math.min(100, quality))
    }
  }

  /**
   * Calcola confidence della previsione
   */
  private calculatePredictionConfidence(dataPoints: number, remainingGDD: number): number {
    // Più dati = più confidence
    const dataConfidence = Math.min(1, dataPoints / 30)

    // Meno GDD rimanenti = più confidence
    const gddConfidence = remainingGDD > 500 ? 0.5 : 1 - (remainingGDD / 1000)

    return Math.round((dataConfidence * 0.6 + gddConfidence * 0.4) * 100) / 100
  }

  // --------------------------------------------------------------------------
  // ANALISI STAGIONALE
  // --------------------------------------------------------------------------

  /**
   * Genera analisi completa della stagione
   */
  async generateSeasonAnalysis(
    userId: string,
    year: number
  ): Promise<SeasonAnalysis | null> {
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    // Ottieni tutti i dati meteo dell'anno
    const { data: weatherData } = await this.supabase
      .from('daily_weather_log')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date')

    const weather = (weatherData || []) as DailyWeatherLog[]
    if (weather.length < 30) return null

    // Ottieni tracking coltivazioni
    const { data: trackingData } = await this.supabase
      .from('cultivation_daily_tracking')
      .select('*, cultivations(crop_type)')
      .eq('user_id', userId)
      .gte('tracking_date', startDate)
      .lte('tracking_date', endDate)

    // Calcola statistiche meteo
    const tracking = (trackingData || []) as TrackingWithCultivation[]
    const totalPrecip = weather.reduce((sum: number, w: DailyWeatherLog) => sum + (w.precipitation_mm || 0), 0)
    const avgTemp = weather.reduce((sum: number, w: DailyWeatherLog) => sum + (w.temp_avg || 0), 0) / weather.length

    // Trova inizio/fine stagione vegetativa (prima/ultima giornata con GDD > 0)
    const growingDays = weather.filter((w: DailyWeatherLog) => {
      const avgT = (w.temp_min + w.temp_max) / 2
      return avgT > 10 // Base temperature comune
    })

    const seasonStart = growingDays[0]?.log_date || startDate
    const seasonEnd = growingDays[growingDays.length - 1]?.log_date || endDate

    // Calcola GDD totali e ore freddo
    let totalGDD = 0
    let totalChillHours = 0
    for (const w of weather) {
      const dailyGDD = dailyDiaryService.calculateDailyGDD(w.temp_min, w.temp_max, 10, 35)
      totalGDD += dailyGDD
      totalChillHours += dailyDiaryService.calculateChillHours(w.temp_min, w.temp_max)
    }

    // Conta eventi stress
    const stressEvents: SeasonAnalysis['stress_events'] = []

    if (tracking) {
      const coldStressDays = tracking.filter(t => t.cold_stress_index > 0.5).length
      const heatStressDays = tracking.filter(t => t.heat_stress_index > 0.5).length
      const waterStressDays = tracking.filter(t => t.water_stress_index > 0.5).length

      if (coldStressDays > 0) {
        stressEvents.push({ type: 'Stress freddo', count: coldStressDays, total_days: coldStressDays })
      }
      if (heatStressDays > 0) {
        stressEvents.push({ type: 'Stress caldo', count: heatStressDays, total_days: heatStressDays })
      }
      if (waterStressDays > 0) {
        stressEvents.push({ type: 'Stress idrico', count: waterStressDays, total_days: waterStressDays })
      }
    }

    // Genera key learnings
    const keyLearnings = this.generateKeyLearnings(weather, tracking, totalGDD, totalPrecip)

    return {
      year,
      growing_season_start: seasonStart,
      growing_season_end: seasonEnd,
      total_growing_days: growingDays.length,
      total_gdd: Math.round(totalGDD),
      total_chill_hours: Math.round(totalChillHours),
      total_precipitation_mm: Math.round(totalPrecip),
      avg_temperature: Math.round(avgTemp * 10) / 10,
      stress_events: stressEvents,
      best_performing_crops: [],
      worst_performing_crops: [],
      key_learnings: keyLearnings
    }
  }

  /**
   * Genera lezioni chiave dalla stagione
   */
  private generateKeyLearnings(
    weather: DailyWeatherLog[],
    tracking: any[] | null,
    totalGDD: number,
    totalPrecip: number
  ): string[] {
    const learnings: string[] = []

    // Analisi precipitazioni
    if (totalPrecip < 400) {
      learnings.push('Stagione siccitosa - pianificare irrigazione supplementare per il prossimo anno')
    } else if (totalPrecip > 1000) {
      learnings.push('Stagione molto piovosa - migliorare drenaggio e prevenzione fungina')
    }

    // Analisi GDD
    if (totalGDD < 1500) {
      learnings.push('Stagione fresca con GDD limitati - preferire varietà precoci')
    } else if (totalGDD > 2500) {
      learnings.push('Stagione calda con abbondanti GDD - opportunità per colture a ciclo lungo')
    }

    // Analisi gelate tardive
    const springFrosts = weather.filter(w => {
      const month = parseInt(w.log_date.split('-')[1])
      return month >= 3 && month <= 5 && w.temp_min <= 0
    })
    if (springFrosts.length > 0) {
      learnings.push(`${springFrosts.length} gelate tardive primaverili - proteggere trapianti precoci`)
    }

    // Analisi stress
    if (tracking) {
      const highStressDays = tracking.filter(t =>
        t.cold_stress_index > 0.7 || t.heat_stress_index > 0.7 || t.water_stress_index > 0.7
      ).length

      if (highStressDays > 20) {
        learnings.push('Molti giorni di stress elevato - investire in sistemi di protezione')
      }
    }

    return learnings
  }

  // --------------------------------------------------------------------------
  // RACCOMANDAZIONI GIORNALIERE
  // --------------------------------------------------------------------------

  /**
   * Genera raccomandazioni giornaliere
   */
  async generateDailyRecommendations(userId: string): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = []
    const today = new Date().toISOString().split('T')[0]

    // Ottieni meteo recente
    const { data: weatherData } = await this.supabase
      .from('daily_weather_log')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(7)

    // Ottieni coltivazioni attive
    const { data: cultivationsData } = await this.supabase
      .from('cultivations')
      .select('id, crop_type, status, zone_id')
      .eq('user_id', userId)
      .in('status', ['active', 'growing', 'flowering', 'fruiting'])

    const weather = (weatherData || []) as DailyWeatherLog[]
    const cultivations = (cultivationsData || []) as CultivationRecord[]
    if (cultivations.length === 0) return recommendations

    // Ottieni tracking recente per tutte le coltivazioni
    const { data: allTrackingData } = await this.supabase
      .from('cultivation_daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('tracking_date', { ascending: false })
      .limit(100)

    // Analizza pattern meteo
    const patterns = await this.detectWeatherPatterns(userId, 7)
    const zoneIds = Array.from(
      new Set(
        cultivations
          .map((cultivation) => cultivation.zone_id)
          .filter((zoneId): zoneId is string => Boolean(zoneId))
      )
    )
    const zoneHistorySummaries = await Promise.all(
      zoneIds.map((zoneId) => this.getRecentZoneHistorySummary(userId, zoneId, today))
    )
    const stressedZones = zoneHistorySummaries.filter(
      (summary): summary is ZoneEnvironmentalHistorySummary =>
        summary !== null &&
        (
          summary.highSoilWaterStressDays >= 2 ||
          summary.latestSoilWaterStressLevel === 'high'
        )
    )

    // Raccomandazione irrigazione basata su stress idrico
    const allTracking = (allTrackingData || []) as CultivationDailyTracking[]
    if (allTracking.length > 0) {
      const waterStressedCrops = cultivations.filter((c: CultivationRecord) => {
        const cropTracking = allTracking.filter((t: CultivationDailyTracking) => t.cultivation_id === c.id).slice(0, 3)
        const avgStress = cropTracking.reduce((s: number, t: CultivationDailyTracking) => s + t.water_stress_index, 0) / (cropTracking.length || 1)
        return avgStress > 0.4
      })

      if (waterStressedCrops.length > 0) {
        recommendations.push({
          id: `irr-${Date.now()}`,
          action_type: 'irrigation',
          title: 'Irrigazione necessaria',
          description: `${waterStressedCrops.length} coltivazioni mostrano stress idrico. Irrigare per prevenire danni.`,
          urgency: 'today',
          confidence: 0.85,
          affected_cultivations: waterStressedCrops.map((c: CultivationRecord) => c.id),
          data_basis: ['tracking_water_stress', 'weather_eto']
        })
      }
    }

    if (stressedZones.length > 0) {
      recommendations.push({
        id: `zone-ledger-irr-${Date.now()}`,
        action_type: 'irrigation',
        title: 'Zone con deficit idrico persistente',
        description: `${stressedZones.length} zone mostrano stress idrico medio-alto nel ledger ambientale persistito. Prioritizzare turni e verifiche sulle zone piu instabili.`,
        urgency: stressedZones.some((summary) => summary.latestSoilWaterStressLevel === 'high')
          ? 'today'
          : 'this_week',
        confidence: 0.82,
        affected_cultivations: cultivations
          .filter((cultivation) =>
            stressedZones.some((summary) => summary.zoneId === cultivation.zone_id)
          )
          .map((cultivation) => cultivation.id),
        data_basis: ['zone_environmental_ledger', 'soil_water_balance_history', 'tracking_water_stress']
      })
    }

    // Raccomandazione protezione gelo
    const frostPattern = patterns.find(p => p.pattern_type === 'frost_risk')
    if (frostPattern) {
      const sensitiveCrops = cultivations.filter((c: CultivationRecord) =>
        ['pomodoro', 'peperone', 'melanzana', 'zucchina', 'basilico'].includes(c.crop_type.toLowerCase())
      )

      if (sensitiveCrops.length > 0) {
        recommendations.push({
          id: `frost-${Date.now()}`,
          action_type: 'protection',
          title: 'Protezione antigelo',
          description: 'Rischio gelata rilevato. Proteggere le colture sensibili con tessuto non tessuto.',
          urgency: 'immediate',
          confidence: frostPattern.severity,
          affected_cultivations: sensitiveCrops.map((c: CultivationRecord) => c.id),
          data_basis: ['weather_trend', 'temp_min_forecast']
        })
      }
    }

    // Raccomandazione trattamento preventivo (umidità alta)
    if (weather.length > 0) {
      const highHumidityDays = weather.filter((w: DailyWeatherLog) => (w.humidity_avg || 60) > 80).length
      if (highHumidityDays >= 3) {
        recommendations.push({
          id: `fungal-${Date.now()}`,
          action_type: 'treatment',
          title: 'Trattamento antifungino preventivo',
          description: 'Alta umidità persistente. Considerare trattamento preventivo contro malattie fungine.',
          urgency: 'this_week',
          confidence: 0.75,
          affected_cultivations: cultivations.map((c: CultivationRecord) => c.id),
          weather_window: this.findDryWindow(weather),
          data_basis: ['humidity_trend', 'fungal_risk_model']
        })
      }
    }

    // Raccomandazione raccolta basata su GDD
    for (const cultivation of cultivations) {
      const cropTracking = allTracking.filter((t: CultivationDailyTracking) => t.cultivation_id === cultivation.id)
      if (cropTracking.length > 0) {
        const latest = cropTracking[0]
        const gddParams = await dailyDiaryService.getGDDParameters(cultivation.crop_type)

        if (gddParams.gdd_to_harvest && latest.accumulated_gdd >= gddParams.gdd_to_harvest * 0.95) {
          recommendations.push({
            id: `harvest-${cultivation.id}`,
            action_type: 'harvest',
            title: `Raccolta ${cultivation.crop_type}`,
            description: `GDD accumulati (${Math.round(latest.accumulated_gdd)}) vicini al target (${gddParams.gdd_to_harvest}). Verificare maturazione.`,
            urgency: 'this_week',
            confidence: 0.8,
            affected_cultivations: [cultivation.id],
            data_basis: ['gdd_accumulation', 'phenological_stage']
          })
        }
      }
    }

    // Ordina per urgenza
    const urgencyOrder = { immediate: 0, today: 1, this_week: 2, planning: 3 }
    recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

    return recommendations
  }

  private async getRecentZoneHistorySummary(
    userId: string,
    zoneId?: string,
    endDate: string = new Date().toISOString().split('T')[0],
    days: number = 7
  ): Promise<ZoneEnvironmentalHistorySummary | null> {
    if (!zoneId) {
      return null
    }

    const startDate = new Date(`${endDate}T12:00:00.000Z`)
    startDate.setDate(startDate.getDate() - Math.max(0, days - 1))

    return getPersistedZoneEnvironmentalHistorySummary({
      userId,
      zoneId,
      startDate: startDate.toISOString().split('T')[0],
      endDate,
    }).catch(() => null)
  }

  /**
   * Trova finestra meteo favorevole per trattamenti
   */
  private findDryWindow(weather: DailyWeatherLog[]): { start: string; end: string; conditions: string } | undefined {
    // Cerca 2+ giorni consecutivi senza pioggia
    for (let i = 0; i < weather.length - 1; i++) {
      if (weather[i].precipitation_mm < 1 && weather[i + 1].precipitation_mm < 1) {
        return {
          start: weather[i + 1].log_date, // Più recente
          end: weather[i].log_date,
          conditions: 'Assenza precipitazioni, condizioni ideali per trattamenti'
        }
      }
    }
    return undefined
  }

  // --------------------------------------------------------------------------
  // CONFRONTO ANNATE
  // --------------------------------------------------------------------------

  /**
   * Confronta performance tra annate diverse
   */
  async compareYears(
    userId: string,
    cultivationId: string,
    years: number[]
  ): Promise<{
    comparisons: YearlyComparisonData[]
    analysis: string
    bestYear: number
    recommendations: string[]
  }> {
    const comparisons = await dailyDiaryService.getYearOverYearComparison(userId, cultivationId, years)

    if (comparisons.length === 0) {
      return {
        comparisons: [],
        analysis: 'Dati insufficienti per il confronto',
        bestYear: years[0],
        recommendations: ['Continuare a raccogliere dati per almeno una stagione completa']
      }
    }

    // Trova anno migliore (meno stress, più GDD)
    const scored = comparisons.map(c => ({
      ...c,
      score: c.total_gdd - (c.stress_days_cold + c.stress_days_heat + c.stress_days_water) * 20
    }))

    const bestYear = scored.reduce((best, c) => c.score > best.score ? c : best).year

    // Genera analisi
    const analysis = this.generateComparisonAnalysis(comparisons)

    // Genera raccomandazioni
    const recommendations = this.generateComparisonRecommendations(comparisons, bestYear)

    return {
      comparisons,
      analysis,
      bestYear,
      recommendations
    }
  }

  private generateComparisonAnalysis(comparisons: YearlyComparisonData[]): string {
    if (comparisons.length < 2) {
      return 'Serve almeno un altro anno di dati per un confronto significativo.'
    }

    const [recent, previous] = comparisons

    let analysis = `Confronto ${recent.year} vs ${previous.year}: `

    const gddDiff = recent.total_gdd - previous.total_gdd
    if (Math.abs(gddDiff) > 100) {
      analysis += gddDiff > 0
        ? `Stagione più calda (+${gddDiff} GDD). `
        : `Stagione più fresca (${gddDiff} GDD). `
    }

    const precipDiff = recent.total_precipitation - previous.total_precipitation
    if (Math.abs(precipDiff) > 100) {
      analysis += precipDiff > 0
        ? `Più piovosa (+${Math.round(precipDiff)}mm). `
        : `Più secca (${Math.round(precipDiff)}mm). `
    }

    const stressDiff = (recent.stress_days_cold + recent.stress_days_heat + recent.stress_days_water) -
      (previous.stress_days_cold + previous.stress_days_heat + previous.stress_days_water)

    if (Math.abs(stressDiff) > 5) {
      analysis += stressDiff > 0
        ? `Più giorni di stress (+${stressDiff}). `
        : `Meno giorni di stress (${stressDiff}). `
    }

    return analysis
  }

  private generateComparisonRecommendations(comparisons: YearlyComparisonData[], bestYear: number): string[] {
    const recommendations: string[] = []
    const best = comparisons.find(c => c.year === bestYear)

    if (!best) return recommendations

    // Analizza pattern dell'anno migliore
    if (best.stress_days_water < 5) {
      recommendations.push('Nell\'anno migliore lo stress idrico era minimo - prioritizzare irrigazione costante')
    }

    if (best.total_precipitation > 600) {
      recommendations.push('Le stagioni piovose hanno dato i migliori risultati - non ridurre irrigazione in periodi secchi')
    }

    // Confronta con altri anni
    const avgStress = comparisons.reduce((sum, c) =>
      sum + c.stress_days_cold + c.stress_days_heat + c.stress_days_water, 0
    ) / comparisons.length

    if (avgStress > 30) {
      recommendations.push('Mediamente troppi giorni di stress - investire in sistemi di protezione e irrigazione')
    }

    return recommendations
  }
}

// Export singleton
export const diaryPredictiveEngine = new DiaryPredictiveEngine()
export default diaryPredictiveEngine
