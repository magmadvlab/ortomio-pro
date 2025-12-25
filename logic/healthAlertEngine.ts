/**
 * Health Alert Engine
 * Analisi proattiva dei rischi sanitari e generazione consigli automatici
 */

import { Garden, GardenTask } from '@/types'
import { getSeasonForDate } from '@/utils/seasonalAdjustment'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { parseISO, differenceInDays } from 'date-fns'

export interface HealthAlert {
  type: 'weather' | 'disease' | 'pest' | 'nutrient' | 'stress' | 'maintenance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  affectedPlants?: string[]
  action?: string
  urgency?: 'immediate' | 'soon' | 'monitor'
  confidence?: number // 0-100, quanto siamo sicuri del rischio
}

/**
 * Analizza proattivamente i rischi sanitari per il giardino
 */
export async function analyzeHealthRisks(
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date()
): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = []
  
  // Filtra piante attive
  const activePlants = tasks.filter(
    t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
  )
  
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
  if (garden.coordinates) {
    const weatherAlerts = await analyzeWeatherRisks(garden, activePlants, currentDate)
    alerts.push(...weatherAlerts)
  }
  
  // 4. Analisi rischi da pattern storici
  const patternAlerts = analyzeHistoricalPatterns(activePlants, garden)
  alerts.push(...patternAlerts)
  
  // 5. Analisi rischi da stress
  const stressAlerts = analyzeStressRisks(activePlants, tasks, currentDate)
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
  currentDate: Date
): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = []
  
  // TODO: Integrare con weatherService per ottenere previsioni
  // Per ora, generiamo alert generici basati su stagione
  
  return alerts
}

/**
 * Analizza pattern storici (placeholder - da integrare con gardenMemoryService)
 */
function analyzeHistoricalPatterns(
  plants: GardenTask[],
  garden: Garden
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  
  // TODO: Integrare con gardenMemoryService per analizzare pattern storici
  // Es: "Negli ultimi 2 anni, questa zona ha avuto problemi con afidi a maggio"
  
  return alerts
}

/**
 * Analizza rischi da stress
 */
function analyzeStressRisks(
  plants: GardenTask[],
  tasks: GardenTask[],
  currentDate: Date
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

