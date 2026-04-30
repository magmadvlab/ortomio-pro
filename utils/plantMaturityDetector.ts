/**
 * Plant Maturity Detector
 * Utility per determinare se una pianta è matura e pronta per il raccolto
 */

import { GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { parseISO, differenceInDays } from 'date-fns'

export interface PlantMaturityContext {
  gardenId?: string
  gardenName?: string
  gardenType?: string | null
  soilType?: string | null
  soilPh?: number | null
  sunExposure?: string | null
  aspectDirection?: string | null
  altitudeMeters?: number | null
  slopePercentage?: number | null
  hasIndoor?: boolean | null
  hasGreenhouse?: boolean | null
  fieldRowId?: string
  fieldRowName?: string
  plantCount?: number | null
  weatherHistory?: Array<{
    date: string
    tempMin?: number | null
    tempMax?: number | null
    precipitationMm?: number | null
    humidityAvg?: number | null
    condition?: string | null
  }>
  weatherForecast?: Array<{
    date: string
    tempMin?: number | null
    tempMax?: number | null
    precipitationMm?: number | null
    humidityAvg?: number | null
    condition?: string | null
  }>
}

const getContextualMaturityAdjustment = (context?: PlantMaturityContext | null): number => {
  if (!context) return 0

  let adjustment = 0
  if (context.hasIndoor || context.hasGreenhouse) adjustment -= 4
  if (context.sunExposure === 'full_sun') adjustment += 2
  if (context.sunExposure === 'partial_shade') adjustment -= 1
  if (typeof context.altitudeMeters === 'number' && context.altitudeMeters > 600) adjustment -= 2
  if (typeof context.slopePercentage === 'number' && context.slopePercentage > 12) adjustment -= 1
  if (context.soilType === 'sandy') adjustment += 1
  if (context.soilType === 'clay') adjustment -= 1
  const recentRain = context.weatherHistory?.slice(-7).reduce((sum, day) => sum + (day.precipitationMm || 0), 0) || 0
  const recentHeatDays = context.weatherHistory?.slice(-7).filter((day) => (day.tempMax || 0) >= 35).length || 0
  const incomingWetDays = context.weatherForecast?.slice(0, 5).filter((day) => (day.precipitationMm || 0) >= 5).length || 0
  const incomingHeatDays = context.weatherForecast?.slice(0, 5).filter((day) => (day.tempMax || 0) >= 34).length || 0
  if (recentRain >= 40) adjustment -= 2
  if (recentHeatDays >= 3) adjustment += 2
  if (incomingWetDays >= 2) adjustment -= 1
  if (incomingHeatDays >= 2) adjustment += 1
  return adjustment
}

/**
 * Determina se una pianta è matura basandosi sul task di semina/trapianto
 * 
 * @param task - Task da controllare (deve essere Sowing o Transplant)
 * @returns true se la pianta è matura, false altrimenti
 */
export function isPlantMature(task: GardenTask, context?: PlantMaturityContext | null): boolean {
  // Solo task di semina o trapianto possono avere piante mature
  if (task.taskType !== 'Sowing' && task.taskType !== 'Transplant') {
    return false
  }
  
  // Se il task non è completato, la pianta non può essere matura
  if (!task.completed) {
    return false
  }
  
  // Se non c'è una data, non possiamo calcolare
  if (!task.date) {
    return false
  }
  
  // Ottieni i dati master della pianta
  const master = getMasterSheetSync(task.plantName)
  if (!master || !master.daysToMaturity) {
    return false
  }
  
  // Calcola giorni dalla semina/trapianto
  const plantingDate = parseISO(task.date)
  const today = new Date()
  const daysSincePlanting = differenceInDays(today, plantingDate)
  
  // La pianta è matura se sono passati almeno i giorni necessari
  // Aggiungiamo un margine di 5 giorni per flessibilità
  const adjustedDaysToMaturity = Math.max(7, master.daysToMaturity + getContextualMaturityAdjustment(context))
  return daysSincePlanting >= (adjustedDaysToMaturity - 5)
}

/**
 * Calcola la resa attesa per una pianta matura
 * 
 * @param task - Task di semina/trapianto
 * @returns Quantità attesa in kg (stima)
 */
export function calculateExpectedYield(task: GardenTask, context?: PlantMaturityContext | null): number {
  const master = getMasterSheetSync(task.plantName)
  if (!master || !master.expectedYield) {
    // Default: 1kg per pianta se non specificato
    return task.currentQuantity || task.initialQuantity || 1
  }
  
  const quantity = task.currentQuantity || task.initialQuantity || 1
  const contextualMultiplier =
    context?.hasIndoor || context?.hasGreenhouse
      ? 0.92
      : context?.soilType === 'sandy'
        ? 0.95
        : context?.soilType === 'clay'
          ? 0.9
          : 1
  const futureRain = context?.weatherForecast?.slice(0, 5).reduce((sum, day) => sum + (day.precipitationMm || 0), 0) || 0
  const futureHeat = context?.weatherForecast?.slice(0, 5).filter((day) => (day.tempMax || 0) >= 34).length || 0
  const historyHeat = context?.weatherHistory?.slice(-7).filter((day) => (day.tempMax || 0) >= 35).length || 0
  const weatherMultiplier =
    futureRain >= 20 ? 0.95 : futureHeat >= 2 ? 0.94 : historyHeat >= 3 ? 0.96 : 1
  const yieldPerPlant = (master.expectedYield.min || 1) * contextualMultiplier // kg per pianta
  
  return quantity * yieldPerPlant * weatherMultiplier
}

/**
 * Ottiene informazioni sulla maturità della pianta
 * 
 * @param task - Task da controllare
 * @returns Informazioni sulla maturità o null se non applicabile
 */
export function getMaturityInfo(task: GardenTask, context?: PlantMaturityContext | null): {
  isMature: boolean
  daysSincePlanting: number
  daysToMaturity: number
  maturityPercentage: number
} | null {
  if (task.taskType !== 'Sowing' && task.taskType !== 'Transplant') {
    return null
  }
  
  if (!task.date || !task.completed) {
    return null
  }
  
  const master = getMasterSheetSync(task.plantName)
  if (!master || !master.daysToMaturity) {
    return null
  }
  
  const plantingDate = parseISO(task.date)
  const today = new Date()
  const daysSincePlanting = differenceInDays(today, plantingDate)
  const daysToMaturity = master.daysToMaturity
  
  const maturityPercentage = Math.min(100, (daysSincePlanting / daysToMaturity) * 100)
  const adjustedDaysToMaturity = Math.max(7, daysToMaturity + getContextualMaturityAdjustment(context))
  const isMature = daysSincePlanting >= (adjustedDaysToMaturity - 5)

  return {
    isMature,
    daysSincePlanting,
    daysToMaturity: adjustedDaysToMaturity,
    maturityPercentage: Math.round(Math.min(100, (daysSincePlanting / adjustedDaysToMaturity) * 100))
  }
}





