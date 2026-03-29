/**
 * Seasonal Health Service
 * Genera alert proattivi basati su stagione e condizioni meteo
 */

import { Garden, GardenTask } from '@/types'
import type { HealthAlert } from '@/logic/healthAlertEngine'
import type { HealthMicroclimateSnapshot } from '@/services/healthMicroclimateService'
import { inferHealthCropContext } from '@/utils/healthCropContext'

function buildMicroclimateSuffix(microclimate?: HealthMicroclimateSnapshot | null): string {
  if (!microclimate?.supportingSignals?.length) {
    return ''
  }

  return ` Segnali recenti: ${microclimate.supportingSignals.slice(0, 3).join(', ')}.`
}

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
  tasks: GardenTask[],
  microclimate?: HealthMicroclimateSnapshot | null
): HealthAlert[] {
  const alerts: HealthAlert[] = []
  const cropContext = inferHealthCropContext(garden)
  const activePlants = tasks.filter((task) => !task.completed && Boolean(task.plantName))
  const microclimateSuffix = buildMicroclimateSuffix(microclimate)
  
  if (activePlants.length === 0) {
    return alerts
  }

  if (cropContext.id === 'vineyard') {
    if (season === 'Spring') {
      alerts.push({
        type: 'disease',
        severity: microclimate?.fungalPressure === 'high' ? 'critical' : 'high',
        message: `Nel vigneto aumenta il rischio di peronospora e oidio dopo piogge e umidita persistente.${microclimateSuffix}`,
        action: 'Controlla foglie basali, femminelle e grappolini nelle parcelle piu chiuse.',
        affectedPlants: Array.from(new Set(activePlants.map((task) => task.plantName))),
      })
    }

    if (season === 'Summer') {
      alerts.push({
        type: 'stress',
        severity:
          microclimate?.heatStress === 'high' || microclimate?.waterStress === 'high' ? 'critical' : 'high',
        message: `Il vigneto richiede attenzione su stress idrico e scottature dei grappoli.${microclimateSuffix}`,
        action: 'Verifica turgore fogliare, esposizione dei grappoli e uniformita del filare.',
        affectedPlants: Array.from(new Set(activePlants.map((task) => task.plantName))),
      })
    }

    return alerts
  }

  if (cropContext.id === 'olive') {
    if (season === 'Summer') {
      alerts.push({
        type: 'pest',
        severity: 'high',
        message: `Estate favorevole alla mosca olearia soprattutto nelle zone umide o poco ventilate.${microclimateSuffix}`,
        action: 'Controlla trappole, punture sui frutti e differenze tra aree del campo.',
        affectedPlants: Array.from(new Set(activePlants.map((task) => task.plantName))),
      })
    }

    if (season === 'Fall') {
      alerts.push({
        type: 'maintenance',
        severity: 'medium',
        message: `Prima della raccolta l oliveto richiede rilievi piu frequenti su sanita e invaiatura.${microclimateSuffix}`,
        action: 'Aggiorna il monitoraggio delle drupe e riallinea il calendario di raccolta.',
        affectedPlants: Array.from(new Set(activePlants.map((task) => task.plantName))),
      })
    }

    return alerts
  }

  if (cropContext.id === 'orchard') {
    if (season === 'Spring') {
      alerts.push({
        type: microclimate?.fungalPressure === 'high' ? 'disease' : 'pest',
        severity: microclimate?.fungalPressure === 'high' ? 'high' : 'medium',
        message: `Nel frutteto va monitorata la pressione su germogli, foglie e primi frutti.${microclimateSuffix}`,
        action: 'Verifica allegagione e sintomi precoci sulle varieta piu sensibili.',
        affectedPlants: Array.from(new Set(activePlants.map((task) => task.plantName))),
      })
    }

    if (season === 'Summer') {
      alerts.push({
        type: 'stress',
        severity:
          microclimate?.heatStress === 'high' || microclimate?.waterStress === 'high' ? 'critical' : 'high',
        message: `I frutti sono esposti a stress idrico, cascola e scottature nelle giornate piu calde.${microclimateSuffix}`,
        action: 'Controlla bilancio idrico, carico di frutti e aree piu esposte del frutteto.',
        affectedPlants: Array.from(new Set(activePlants.map((task) => task.plantName))),
      })
    }

    return alerts
  }
  
  // Alert primaverili
  if (season === 'Spring') {
    alerts.push({
      type: 'pest',
      severity: 'medium',
      message: `Stagione afidi. Controlla regolarmente le piante giovani per segni di infestazione.${microclimateSuffix}`,
      action: 'Ispeziona foglie e steli ogni 2-3 giorni. Usa insetticidi naturali se necessario.',
      affectedPlants: activePlants
        .filter(t => ['Pomodoro', 'Zucchina', 'Peperone', 'Melanzana'].includes(t.plantName))
        .map(t => t.plantName)
    })
    
    alerts.push({
      type: 'disease',
      severity: microclimate?.fungalPressure === 'high' ? 'high' : 'medium',
      message: `Rischio peronospora con aumento umidità primaverile.${microclimateSuffix}`,
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
      message: `Caldo estivo aumenta fabbisogno idrico e nutritivo.${microclimateSuffix}`,
      action: 'Aumenta frequenza irrigazione e considera concimazioni supplementari.',
      affectedPlants: activePlants.map(t => t.plantName)
    })
    
    alerts.push({
      type: 'pest',
      severity: 'high',
      message: `Alta stagione per afidi e acari. Monitora attentamente.${microclimateSuffix}`,
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
      severity: microclimate?.fungalPressure === 'high' ? 'critical' : 'high',
      message: `Umidità autunnale favorisce malattie fungine.${microclimateSuffix}`,
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
      message: `Piante invernali hanno bisogno di protezione dal gelo.${microclimateSuffix}`,
      action: 'Proteggi con teli o spostale in serra se possibile.',
      affectedPlants: activePlants
        .filter(t => t.season === 'Winter')
        .map(t => t.plantName)
    })
  }
  
  return alerts
}
