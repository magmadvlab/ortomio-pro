/**
 * Seasonal Health Service
 * Genera alert proattivi basati su stagione e condizioni meteo
 */

import { Garden, GardenTask } from '@/types'
import type { HealthAlert } from '@/logic/healthAlertEngine'
import { getSeasonForDate } from '@/utils/seasonalAdjustment'

/**
 * Ottiene alert sanitari stagionali
 * 
 * @param season - Stagione corrente
 * @param garden - Giardino
 * @param tasks - Task attivi
 * @returns Array di alert sanitari
 */
export function getSeasonalHealthAlerts(
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | string,
  garden: Garden,
  tasks: GardenTask[]
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  const activePlants = tasks.filter(
    t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
  )
  
  if (activePlants.length === 0) {
    return alerts
  }
  
  // Alert primaverili
  if (season === 'Spring') {
    alerts.push({
      type: 'pest',
      severity: 'medium',
      message: 'Stagione afidi. Controlla regolarmente le piante giovani per segni di infestazione.',
      action: 'Ispeziona foglie e steli ogni 2-3 giorni. Usa insetticidi naturali se necessario.',
      affectedPlants: activePlants
        .filter(t => ['Pomodoro', 'Zucchina', 'Peperone', 'Melanzana'].includes(t.plantName))
        .map(t => t.plantName)
    })
    
    alerts.push({
      type: 'disease',
      severity: 'medium',
      message: 'Rischio peronospora con aumento umidità primaverile.',
      action: 'Evita irrigazione fogliare. Usa trattamenti preventivi se necessario.',
      affectedPlants: activePlants
        .filter(t => ['Pomodoro', 'Patata'].includes(t.plantName))
        .map(t => t.plantName)
    })
  }
  
  // Alert estivi
  if (season === 'Summer') {
    alerts.push({
      type: 'nutrient',
      severity: 'medium',
      message: 'Caldo estivo aumenta fabbisogno idrico e nutritivo.',
      action: 'Aumenta frequenza irrigazione e considera concimazioni supplementari.',
      affectedPlants: activePlants.map(t => t.plantName)
    })
    
    alerts.push({
      type: 'pest',
      severity: 'high',
      message: 'Alta stagione per afidi e acari. Monitora attentamente.',
      action: 'Controlla quotidianamente. Tratta immediatamente se rilevi infestazione.',
      affectedPlants: activePlants
        .filter(t => ['Pomodoro', 'Zucchina', 'Peperone'].includes(t.plantName))
        .map(t => t.plantName)
    })
  }
  
  // Alert autunnali
  if (season === 'Fall') {
    alerts.push({
      type: 'disease',
      severity: 'high',
      message: 'Umidità autunnale favorisce malattie fungine.',
      action: 'Riduci irrigazione. Rimuovi foglie morte. Considera trattamenti preventivi.',
      affectedPlants: activePlants
        .filter(t => ['Pomodoro', 'Zucchina'].includes(t.plantName))
        .map(t => t.plantName)
    })
  }
  
  // Alert invernali
  if (season === 'Winter') {
    alerts.push({
      type: 'nutrient',
      severity: 'low',
      message: 'Piante invernali hanno bisogno di protezione dal gelo.',
      action: 'Proteggi con teli o spostale in serra se possibile.',
      affectedPlants: activePlants
        .filter(t => t.season === 'Winter')
        .map(t => t.plantName)
    })
  }
  
  return alerts
}
