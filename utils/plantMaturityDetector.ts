/**
 * Plant Maturity Detector
 * Utility per determinare se una pianta è matura e pronta per il raccolto
 */

import { GardenTask } from '@/types'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { parseISO, differenceInDays } from 'date-fns'

/**
 * Determina se una pianta è matura basandosi sul task di semina/trapianto
 * 
 * @param task - Task da controllare (deve essere Sowing o Transplant)
 * @returns true se la pianta è matura, false altrimenti
 */
export function isPlantMature(task: GardenTask): boolean {
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
  return daysSincePlanting >= (master.daysToMaturity - 5)
}

/**
 * Calcola la resa attesa per una pianta matura
 * 
 * @param task - Task di semina/trapianto
 * @returns Quantità attesa in kg (stima)
 */
export function calculateExpectedYield(task: GardenTask): number {
  const master = getMasterSheetSync(task.plantName)
  if (!master || !master.expectedYield) {
    // Default: 1kg per pianta se non specificato
    return task.currentQuantity || task.initialQuantity || 1
  }
  
  const quantity = task.currentQuantity || task.initialQuantity || 1
  const yieldPerPlant = master.expectedYield.min || 1 // kg per pianta
  
  return quantity * yieldPerPlant
}

/**
 * Ottiene informazioni sulla maturità della pianta
 * 
 * @param task - Task da controllare
 * @returns Informazioni sulla maturità o null se non applicabile
 */
export function getMaturityInfo(task: GardenTask): {
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
  const isMature = daysSincePlanting >= (daysToMaturity - 5)
  
  return {
    isMature,
    daysSincePlanting,
    daysToMaturity,
    maturityPercentage: Math.round(maturityPercentage)
  }
}







