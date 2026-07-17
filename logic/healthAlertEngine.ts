/**
 * Health Alert Engine
 * Analisi proattiva dei rischi sanitari e generazione consigli automatici
 */

import { Garden, GardenTask, SmartDevice } from '@/types'
import { getSeasonForDate } from '@/utils/seasonalAdjustment'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { weatherService } from '@/services/weatherService'
import { getScopedHealthMicroclimateSnapshot } from '@/services/healthMicroclimateService'
import { parseISO, differenceInDays } from 'date-fns'
import { inferHealthCropContext } from '@/utils/healthCropContext'

export interface HealthAlert {
  type: 'weather' | 'disease' | 'pest' | 'nutrient' | 'stress' | 'maintenance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  affectedPlants?: string[]
  action?: string
  urgency?: 'immediate' | 'soon' | 'monitor'
  confidence?: number // 0-100, quanto siamo sicuri del rischio
  evidence?: {
    ruleId: string
    ruleVersion: string
    sourceKind: 'observed' | 'predicted'
    freshnessHours?: number
    contraindications: string[]
  }
}

export interface HealthRiskAnalysisOptions {
  devices?: SmartDevice[]
  environmentalHistorySummary?: {
    entries: number
    highDiseasePressureDays: number
    highSoilWaterStressDays: number
    deficitWaterBalanceDays: number
  } | null
  productAvailability?: 'available' | 'unavailable' | 'unknown'
  windSpeedKmh?: number
  rainfallMm?: number
  nextHarvestDate?: string
}

function getHealthRelevantTasks(garden: Garden, tasks: GardenTask[]): GardenTask[] {
  const activeTasks = tasks.filter((task) => !task.completed && Boolean(task.plantName))
  const cropContext = inferHealthCropContext(garden)

  if (cropContext.id !== 'generic') {
    return activeTasks
  }

  const growingTasks = activeTasks.filter(
    (task) => task.taskType === 'Sowing' || task.taskType === 'Transplant'
  )

  return growingTasks.length > 0 ? growingTasks : activeTasks
}

function uniquePlantNames(plants: GardenTask[], fallback: string[]): string[] {
  const names = Array.from(new Set(plants.map((plant) => plant.plantName).filter(Boolean)))
  return names.length > 0 ? names : fallback
}

function getWoodySeasonalRisks(plants: GardenTask[], season: string, garden: Garden): HealthAlert[] {
  const cropContext = inferHealthCropContext(garden)
  const plantNames = uniquePlantNames(
    plants,
    cropContext.id === 'vineyard'
      ? ['Vite']
      : cropContext.id === 'olive'
        ? ['Olivo']
        : ['Alberi da frutto']
  )

  if (cropContext.id === 'vineyard') {
    if (season === 'Spring') {
      return [
        {
          type: 'disease',
          severity: 'high',
          message: 'Primavera umida: aumenta la pressione di peronospora e oidio nel vigneto.',
          affectedPlants: plantNames,
          action: 'Controlla i filari piu chiusi, verifica foglie basali e grappolini, programma un controllo post-pioggia.',
          urgency: 'soon',
          confidence: 84,
        },
      ]
    }

    if (season === 'Summer') {
      return [
        {
          type: 'stress',
          severity: 'high',
          message: 'Nel vigneto cresce il rischio di stress idrico e scottature sui grappoli.',
          affectedPlants: plantNames,
          action: 'Controlla turgore fogliare, stato dei grappoli e uniformita della parete vegetativa.',
          urgency: 'immediate',
          confidence: 88,
        },
      ]
    }
  }

  if (cropContext.id === 'olive') {
    if (season === 'Summer') {
      return [
        {
          type: 'pest',
          severity: 'high',
          message: 'Estate favorevole alla mosca olearia nelle zone piu umide e fitte.',
          affectedPlants: plantNames,
          action: 'Controlla trappole, punture sui frutti e differenze tra parcelle esposte e ombreggiate.',
          urgency: 'soon',
          confidence: 82,
        },
      ]
    }

    if (season === 'Fall') {
      return [
        {
          type: 'maintenance',
          severity: 'medium',
          message: 'Avvicinandosi alla raccolta, l oliveto richiede controlli piu ravvicinati su invaiatura e sanita del frutto.',
          affectedPlants: plantNames,
          action: 'Rivedi il ritmo dei controlli e allinea i rilievi con la finestra di raccolta.',
          urgency: 'soon',
          confidence: 78,
        },
      ]
    }
  }

  if (cropContext.id === 'orchard') {
    if (season === 'Spring') {
      return [
        {
          type: 'pest',
          severity: 'medium',
          message: 'Nel frutteto va monitorata la pressione su germogli, fiori e primi frutti.',
          affectedPlants: plantNames,
          action: 'Controlla allegagione, giovani getti e sintomi precoci su foglie e frutti.',
          urgency: 'soon',
          confidence: 76,
        },
      ]
    }

    if (season === 'Summer') {
      return [
        {
          type: 'stress',
          severity: 'high',
          message: 'I frutti sono esposti a stress idrico, cascola e scottature nelle giornate piu calde.',
          affectedPlants: plantNames,
          action: 'Verifica uniformita irrigua, carico produttivo e frutti piu esposti al sole.',
          urgency: 'immediate',
          confidence: 86,
        },
      ]
    }
  }

  return []
}

/**
 * Analizza proattivamente i rischi sanitari per il giardino
 */
export async function analyzeHealthRisks(
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date(),
  options: HealthRiskAnalysisOptions = {}
): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = []
  
  const activePlants = getHealthRelevantTasks(garden, tasks)
  
  if (activePlants.length === 0) {
    return alerts
  }
  
  const season = garden.coordinates 
    ? getSeasonForDate(currentDate, garden.coordinates.latitude)
    : 'Spring'
  
  // 1. Analisi rischi stagionali
  const seasonalAlerts = analyzeSeasonalRisks(activePlants, season, garden)
  alerts.push(...seasonalAlerts)
  
  // 2. Analisi rischi per età delle piante
  const ageAlerts = analyzePlantAgeRisks(activePlants, currentDate)
  alerts.push(...ageAlerts)
  
  // 3. Analisi rischi meteo (se disponibili coordinate)
  const weatherAlerts = await analyzeWeatherRisks(garden, activePlants, options)
  alerts.push(...weatherAlerts)
  
  // 4. Analisi rischi da pattern storici
  const patternAlerts = analyzeHistoricalPatterns(options)
  alerts.push(...patternAlerts)
  
  // 5. Analisi rischi da stress
  const stressAlerts = analyzeStressRisks(activePlants, tasks)
  alerts.push(...stressAlerts)
  
  return prioritizeAlerts(alerts)
}

/**
 * Analizza rischi stagionali
 */
function analyzeSeasonalRisks(
  plants: GardenTask[],
  season: string,
  garden: Garden
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  const cropContext = inferHealthCropContext(garden)

  if (cropContext.id !== 'generic') {
    return getWoodySeasonalRisks(plants, season, garden)
  }
  
  if (season === 'Spring') {
    // Afidi primaverili
    const susceptiblePlants = plants.filter(t => 
      ['Pomodoro', 'Zucchina', 'Peperone', 'Melanzana', 'Fagiolo'].includes(t.plantName)
    )
    if (susceptiblePlants.length > 0) {
      alerts.push({
        type: 'pest',
        severity: 'medium',
        message: 'Stagione afidi in arrivo. Le piante giovani sono particolarmente vulnerabili.',
        affectedPlants: susceptiblePlants.map(t => t.plantName),
        action: 'Ispeziona foglie e steli ogni 2-3 giorni. Usa insetticidi naturali (sapone molle, olio di neem) se necessario.',
        urgency: 'soon',
        confidence: 75
      })
    }
    
    // Peronospora con umidità primaverile
    const peronosporaPlants = plants.filter(t => 
      ['Pomodoro', 'Patata', 'Cetriolo'].includes(t.plantName)
    )
    if (peronosporaPlants.length > 0) {
      alerts.push({
        type: 'disease',
        severity: 'high',
        message: 'Rischio peronospora con aumento umidità primaverile.',
        affectedPlants: peronosporaPlants.map(t => t.plantName),
        action: 'Evita irrigazione fogliare. Usa trattamenti preventivi a base di rame se necessario.',
        urgency: 'soon',
        confidence: 80
      })
    }
  }
  
  if (season === 'Summer') {
    // Stress idrico e termico
    alerts.push({
      type: 'stress',
      severity: 'high',
      message: 'Caldo estivo aumenta fabbisogno idrico e rischio stress termico.',
      affectedPlants: plants.map(t => t.plantName),
      action: 'Aumenta frequenza irrigazione (mattina presto o sera). Considera ombreggiamento per piante sensibili.',
      urgency: 'immediate',
      confidence: 90
    })
    
    // Afidi e acari estivi
    const pestSusceptible = plants.filter(t => 
      ['Pomodoro', 'Zucchina', 'Peperone', 'Cetriolo'].includes(t.plantName)
    )
    if (pestSusceptible.length > 0) {
      alerts.push({
        type: 'pest',
        severity: 'high',
        message: 'Alta stagione per afidi e acari. Monitora attentamente.',
        affectedPlants: pestSusceptible.map(t => t.plantName),
        action: 'Controlla quotidianamente. Tratta immediatamente se rilevi infestazione.',
        urgency: 'immediate',
        confidence: 85
      })
    }
  }
  
  if (season === 'Fall') {
    // Malattie fungine autunnali
    const fungalSusceptible = plants.filter(t => 
      ['Pomodoro', 'Zucchina', 'Cetriolo'].includes(t.plantName)
    )
    if (fungalSusceptible.length > 0) {
      alerts.push({
        type: 'disease',
        severity: 'high',
        message: 'Umidità autunnale favorisce malattie fungine.',
        affectedPlants: fungalSusceptible.map(t => t.plantName),
        action: 'Riduci irrigazione. Rimuovi foglie morte. Considera trattamenti preventivi.',
        urgency: 'soon',
        confidence: 80
      })
    }
  }
  
  if (season === 'Winter') {
    // Protezione dal gelo
    const winterPlants = plants.filter(t => t.season === 'Winter')
    if (winterPlants.length > 0) {
      alerts.push({
        type: 'weather',
        severity: 'medium',
        message: 'Piante invernali necessitano protezione dal gelo.',
        affectedPlants: winterPlants.map(t => t.plantName),
        action: 'Proteggi con teli o spostale in serra se possibile.',
        urgency: 'monitor',
        confidence: 70
      })
    }
  }
  
  return alerts
}

/**
 * Analizza rischi basati sull'età delle piante
 */
function analyzePlantAgeRisks(
  plants: GardenTask[],
  currentDate: Date
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  
  for (const plant of plants) {
    if (!plant.date) continue
    
    const plantingDate = parseISO(plant.date)
    const daysSincePlanting = differenceInDays(currentDate, plantingDate)
    const master = getMasterSheetSync(plant.plantName)
    
    if (!master) continue
    
    // Piante molto giovani (0-14 giorni) - stress da trapianto
    if (daysSincePlanting < 14 && plant.taskType === 'Transplant') {
      alerts.push({
        type: 'stress',
        severity: 'medium',
        message: `${plant.plantName} è ancora in fase di adattamento post-trapianto.`,
        affectedPlants: [plant.plantName],
        action: 'Monitora attentamente. Evita stress aggiuntivi (eccesso acqua, concimazioni aggressive).',
        urgency: 'monitor',
        confidence: 85
      })
    }
    
    // Piante in fase critica di crescita (basato su giorni alla maturità)
    if (master.daysToMaturity) {
      const maturityPercentage = (daysSincePlanting / master.daysToMaturity) * 100
      
      // Fase critica: 30-60% della maturità (massima vulnerabilità)
      if (maturityPercentage >= 30 && maturityPercentage <= 60) {
        alerts.push({
          type: 'maintenance',
          severity: 'medium',
          message: `${plant.plantName} è in fase critica di crescita. Richiede attenzione particolare.`,
          affectedPlants: [plant.plantName],
          action: 'Assicurati di irrigazione regolare e controllo parassiti frequente.',
          urgency: 'soon',
          confidence: 70
        })
      }
    }
  }
  
  return alerts
}

/**
 * Analizza rischi meteo (placeholder - da integrare con weatherService)
 */
async function analyzeWeatherRisks(
  garden: Garden,
  plants: GardenTask[],
  options: HealthRiskAnalysisOptions = {}
): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = []
  const cropContext = inferHealthCropContext(garden)
  const plantNames = uniquePlantNames(
    plants,
    cropContext.id === 'vineyard'
      ? ['Vite']
      : cropContext.id === 'olive'
        ? ['Olivo']
        : cropContext.id === 'orchard'
          ? ['Alberi da frutto']
          : plants.map((plant) => plant.plantName)
  )

  const [weatherData, microclimate] = await Promise.all([
    garden.coordinates ? weatherService.getWeatherForGarden(garden).catch(() => null) : Promise.resolve(null),
    getScopedHealthMicroclimateSnapshot(garden, { devices: options.devices || [] }).catch(() => null),
  ])

  const nextDays = Array.isArray(weatherData?.forecast) ? weatherData?.forecast.slice(0, 3) : []
  const avgForecastTemp =
    nextDays.length > 0
      ? nextDays.reduce((sum, day) => sum + ((day.tempMin + day.tempMax) / 2), 0) / nextDays.length
      : weatherData?.temp
  const maxRain = nextDays.reduce((max, day) => Math.max(max, day.rainMm || 0), weatherData?.rainMm || 0)
  const maxHumidity = nextDays.reduce((max, day) => Math.max(max, day.humidity || 0), weatherData?.humidity || 0)
  const effectiveTemp = microclimate?.metrics.airTemperature ?? avgForecastTemp
  const effectiveRain = Math.max(microclimate?.metrics.rainGaugeLocalMm || 0, maxRain || 0)
  const effectiveHumidity = microclimate?.metrics.airHumidity ?? maxHumidity
  const signalSuffix =
    microclimate?.supportingSignals && microclimate.supportingSignals.length > 0
      ? ` Segnali: ${microclimate.supportingSignals.slice(0, 4).join(', ')}.`
      : ''

  if (
    effectiveTemp !== undefined &&
    effectiveHumidity !== undefined &&
    (microclimate?.fungalPressure === 'high' ||
      (effectiveHumidity >= 80 && effectiveTemp >= 12 && effectiveTemp <= 28 && effectiveRain >= 1))
  ) {
    alerts.push({
      type: 'disease',
      severity:
        cropContext.id === 'vineyard' && microclimate?.fungalPressure === 'high'
          ? 'critical'
          : cropContext.id === 'vineyard' || microclimate?.fungalPressure === 'high'
            ? 'high'
            : 'medium',
      message:
        cropContext.id === 'vineyard'
          ? `Finestra infettiva nel vigneto: peronospora e oidio favoriti da umidita, bagnatura fogliare e pioggia locale.${signalSuffix}`
          : cropContext.id === 'olive'
            ? `Microclima favorevole a occhio di pavone e ristagni di umidita nell oliveto.${signalSuffix}`
            : cropContext.id === 'orchard'
              ? `Microclima favorevole a ticchiolatura e altre pressioni fungine nel frutteto.${signalSuffix}`
              : `Condizioni meteo favorevoli a malattie fungine.${signalSuffix}`,
      affectedPlants: plantNames,
      action:
        cropContext.id === 'vineyard'
          ? 'Controlla foglie basali, grappolini e parcelle chiuse entro 24 ore.'
          : cropContext.id === 'olive'
            ? 'Verifica chioma interna, foglie persistenti umide e differenze tra aree ventilate e chiuse.'
            : cropContext.id === 'orchard'
              ? 'Controlla foglie e frutti nelle aree piu fitte o bagnate dopo pioggia.'
              : 'Programma un controllo post-pioggia ed evita bagnature fogliari non necessarie.',
      urgency: microclimate?.fungalPressure === 'high' ? 'immediate' : 'soon',
      confidence: microclimate?.hasRecentData ? 92 : 81,
    })
  }

  if (
    microclimate?.waterStress === 'high' ||
    microclimate?.heatStress === 'high' ||
    (effectiveTemp !== undefined && effectiveTemp >= 32)
  ) {
    alerts.push({
      type: 'stress',
      severity: microclimate?.waterStress === 'high' || microclimate?.heatStress === 'high' ? 'high' : 'medium',
      message:
        cropContext.id === 'vineyard'
          ? `Stress idrico o termico in crescita nel vigneto, con rischio su parete vegetativa e grappoli.${signalSuffix}`
          : cropContext.id === 'olive'
            ? `Stress idrico o termico nell oliveto, con rischio di rallentamento e cascola.${signalSuffix}`
            : cropContext.id === 'orchard'
              ? `Stress idrico o termico nel frutteto, con rischio di cascola e scottature.${signalSuffix}`
              : `Stress idrico o termico in aumento sulle colture.${signalSuffix}`,
      affectedPlants: plantNames,
      action:
        cropContext.id === 'vineyard'
          ? 'Verifica umidita del profilo, delta chioma-aria e uniformita di distribuzione lungo i filari.'
          : cropContext.id === 'olive'
            ? 'Controlla tensione idrica, stato delle drupe e uniformita irrigua tra le zone.'
            : cropContext.id === 'orchard'
              ? 'Controlla profondita radicale, chioma esposta e tenuta dei frutti nelle ore piu calde.'
              : 'Controlla umidita suolo, VPD e stress visivo prima di aumentare l irrigazione.',
      urgency: 'immediate',
      confidence: microclimate?.hasRecentData ? 90 : 76,
    })
  }

  if (weatherData && weatherData.temp < 2) {
    alerts.push({
      type: 'weather',
      severity: 'high',
      message: `Rischio gelo con temperatura prevista ${weatherData.temp}°C.`,
      affectedPlants: plantNames,
      action: 'Proteggi le colture sensibili e sospendi interventi fogliari non indispensabili.',
      urgency: 'immediate',
      confidence: 88,
    })
  }

  return alerts
}

/**
 * Analizza pattern storici dalla memoria ambientale canonica.
 */
function analyzeHistoricalPatterns(options: HealthRiskAnalysisOptions): HealthAlert[] {
  const summary = options.environmentalHistorySummary
  if (!summary || summary.entries === 0) return []
  const contraindications = [
    (options.windSpeedKmh || 0) > 15 ? 'vento_elevato_no_fogliare' : null,
    (options.rainfallMm || 0) > 5 ? 'pioggia_dilavante' : null,
    options.productAvailability === 'unavailable' ? 'prodotto_non_disponibile' : null,
    options.nextHarvestDate ? 'verificare_carenza' : null,
  ].filter((value): value is string => Boolean(value))
  const alerts: HealthAlert[] = []
  if (summary.highDiseasePressureDays >= 2) alerts.push({
    type: 'disease', severity: 'high',
    message: `Pressione fungina persistente in ${summary.highDiseasePressureDays} giornate del ledger ambientale.`,
    action: 'Conferma i sintomi sul campo prima di passare da rischio a diagnosi e proposta.', urgency: 'soon', confidence: 82,
    evidence: { ruleId: 'history:fungal-pressure', ruleVersion: 'health-rules-2026-07-17', sourceKind: 'predicted', contraindications },
  })
  if (summary.highSoilWaterStressDays >= 2 || summary.deficitWaterBalanceDays >= 3) alerts.push({
    type: 'stress', severity: 'high',
    message: 'Stress idrico ricorrente rilevato dalla memoria ambientale canonica.',
    action: 'Conferma con misura locale e confronta fabbisogno, piano ed erogazione.', urgency: 'soon', confidence: 80,
    evidence: { ruleId: 'history:water-stress', ruleVersion: 'health-rules-2026-07-17', sourceKind: 'predicted', contraindications },
  })
  return alerts
}

/**
 * Analizza rischi da stress
 */
function analyzeStressRisks(
  plants: GardenTask[],
  tasks: GardenTask[]
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  
  // Piante con molti task non completati = possibile stress
  for (const plant of plants) {
    const plantTasks = tasks.filter(t => 
      t.plantName === plant.plantName && 
      !t.completed &&
      (t.taskType === 'Treatment' || t.taskType === 'Fertilize')
    )
    
    if (plantTasks.length > 3) {
      alerts.push({
        type: 'stress',
        severity: 'medium',
        message: `${plant.plantName} ha diversi trattamenti in sospeso. Potrebbe essere sotto stress.`,
        affectedPlants: [plant.plantName],
        action: 'Verifica lo stato della pianta. Completa i trattamenti necessari.',
        urgency: 'soon',
        confidence: 60
      })
    }
  }
  
  return alerts
}

/**
 * Prioritizza gli alert per severità e urgenza
 */
function prioritizeAlerts(alerts: HealthAlert[]): HealthAlert[] {
  return alerts.sort((a, b) => {
    // Prima per severità
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff
    
    // Poi per urgenza
    const urgencyOrder = { immediate: 0, soon: 1, monitor: 2 }
    const urgencyA = a.urgency || 'monitor'
    const urgencyB = b.urgency || 'monitor'
    const urgencyDiff = urgencyOrder[urgencyA] - urgencyOrder[urgencyB]
    if (urgencyDiff !== 0) return urgencyDiff
    
    // Infine per confidence (più alta = più importante)
    return (b.confidence || 0) - (a.confidence || 0)
  })
}
