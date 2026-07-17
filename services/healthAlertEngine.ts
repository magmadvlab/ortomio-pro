/**
 * Health Alert Engine
 * Genera alert automatici per la salute delle piante basati su:
 * - Condizioni meteo (rischio malattie fungine, stress termico)
 * - Task non completati (irrigazione, trattamenti)
 * - Alert stagionali (parassiti, malattie tipiche del periodo)
 * - Dati sensori IoT (opzionale)
 */

import { AlertCheckContext, HealthAlert, AlertType, AlertSeverity } from '@/types/healthAlert'
import { GardenTask } from '@/types'
import { confidenceForMonitoringSource } from '@/services/healthMonitoringPolicyService'

/**
 * Controlla e genera tutti gli alert di salute per un giardino
 */
export async function checkHealthAlerts(context: AlertCheckContext): Promise<Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[]> {
  const alerts: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] = []

  // Check 1: Weather-based disease risk
  if (context.weather) {
    alerts.push(...checkWeatherDiseaseRisk(context))
  }

  // Check 2: Overdue irrigation tasks
  alerts.push(...checkWaterDeficit(context))

  // Check 3: Seasonal pest warnings
  alerts.push(...checkSeasonalPests(context))

  // Check 4: Nutrient deficiency (da sensori IoT)
  if (context.sensorData && context.sensorData.length > 0) {
    alerts.push(...checkSensorAlerts(context))
  }

  alerts.push(...checkHistoricalEnvironmentalRisk(context))

  const checkedAt = new Date(context.checkedAt || new Date().toISOString())
  const contraindications = [
    (context.weather?.windSpeed || 0) > 15 ? 'vento_elevato_no_applicazione_fogliare' : null,
    (context.weather?.rainMm || 0) > 5 ? 'pioggia_dilavante' : null,
    context.productAvailability === 'unavailable' ? 'prodotto_non_disponibile' : null,
    context.nextHarvestDate ? 'verificare_intervallo_carenza_prima_del_raccolto' : null,
  ].filter((value): value is string => Boolean(value))
  const enriched = alerts.map((alert) => {
    const sourceKind = alert.source === 'sensor' ? 'observed' : 'predicted'
    const sourceAt = alert.source === 'sensor'
      ? String(alert.metadata?.timestamp || checkedAt.toISOString())
      : String(context.weather?.recordedAt || checkedAt.toISOString())
    const freshnessHours = Math.max(0, (checkedAt.getTime() - new Date(sourceAt).getTime()) / 3_600_000)
    const proposedConfidence = alert.source === 'sensor' ? 0.95 : alert.source === 'seasonal' ? 0.6 : context.environmentalHistorySummary?.entries ? 0.82 : 0.72
    const confidence = confidenceForMonitoringSource(sourceKind, proposedConfidence)
    return {
      ...alert,
      metadata: {
        ...(alert.metadata || {}),
        fingerprint: buildHealthAlertFingerprint(alert),
        sourceKind,
        workflowStage: 'risk',
        diagnosisConfirmed: false,
        executionConfirmed: false,
        ruleId: `${alert.alertType}:${alert.source}`,
        ruleVersion: 'health-rules-2026-07-17',
        confidence,
        checkedAt: checkedAt.toISOString(),
        sourceRecordedAt: sourceAt,
        freshnessHours,
        contraindications,
        inputSnapshot: {
          weather: context.weather || null,
          environmentalHistorySummary: context.environmentalHistorySummary || null,
          productAvailability: context.productAvailability || 'unknown',
          nextHarvestDate: context.nextHarvestDate || null,
        },
      },
    }
  })
  return Array.from(new Map(enriched.map(alert => [String(alert.metadata?.fingerprint), alert])).values())
}

export const buildHealthAlertFingerprint = (
  alert: Pick<HealthAlert, 'gardenId' | 'plantId' | 'alertType' | 'source' | 'title'>
) => [alert.gardenId, alert.plantId || 'garden', alert.alertType, alert.source, alert.title]
  .map(value => String(value).trim().toLocaleLowerCase('it-IT').replace(/\s+/g, '-'))
  .join(':')

function checkHistoricalEnvironmentalRisk(context: AlertCheckContext): Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] {
  const summary = context.environmentalHistorySummary
  if (!summary || summary.entries === 0) return []
  const alerts: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] = []
  if (summary.highDiseasePressureDays >= 2) {
    alerts.push({
      gardenId: context.garden.id, alertType: 'disease', severity: 'warning', source: 'ai',
      title: 'Pressione fungina persistente',
      message: `${summary.highDiseasePressureDays} giornate recenti mostrano pressione fungina elevata nei dati ambientali persistiti.`,
      recommendation: 'Esegui un controllo visivo prima di formulare diagnosi o trattamento.', resolved: false,
      metadata: { historicalPattern: true, days: summary.highDiseasePressureDays },
    })
  }
  if (summary.highSoilWaterStressDays >= 2 || summary.deficitWaterBalanceDays >= 3) {
    alerts.push({
      gardenId: context.garden.id, alertType: 'water', severity: 'warning', source: 'ai',
      title: 'Stress idrico persistente',
      message: 'Il ledger ambientale mostra stress idrico ricorrente, non un singolo valore isolato.',
      recommendation: 'Conferma con sensore o misura manuale e confronta volume pianificato ed erogato.', resolved: false,
      metadata: { historicalPattern: true, highStressDays: summary.highSoilWaterStressDays, deficitDays: summary.deficitWaterBalanceDays },
    })
  }
  return alerts
}

/**
 * Check per rischi malattie basati su meteo
 */
function checkWeatherDiseaseRisk(context: AlertCheckContext): Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { weather, tasks, garden } = context
  const alerts: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] = []

  if (!weather) return alerts

  // Rischio PERONOSPORA (Tomatoes, Potatoes, Cucurbits)
  // Condizioni: alta umidità (>80%) + temp 15-25°C + pioggia prevista
  if (weather.humidity > 80 && weather.temp > 15 && weather.temp < 25 && weather.rainTomorrow) {
    const vulnerablePlants = tasks.filter(t =>
      !t.completed &&
      (t.taskType === 'Sowing' || t.taskType === 'Transplant') &&
      (t.plantName.toLowerCase().includes('pomodor') ||
       t.plantName.toLowerCase().includes('patata') ||
       t.plantName.toLowerCase().includes('zucch') ||
       t.plantName.toLowerCase().includes('cetriolo'))
    )

    if (vulnerablePlants.length > 0) {
      alerts.push({
        gardenId: garden.id,
        alertType: 'disease',
        severity: 'warning',
        source: 'weather_api',
        title: 'Rischio Peronospora',
        message: `Condizioni favorevoli per peronospora su ${vulnerablePlants.length} piante: pioggia prevista domani, umidità ${weather.humidity}%, temperatura ${weather.temp}°C`,
        recommendation: 'Valuta una proposta preventiva solo dopo controllo visivo, etichetta prodotto, disponibilita, vento, pioggia e intervallo di carenza. Evita irrigazione fogliare.',
        resolved: false,
        metadata: {
          temp: weather.temp,
          humidity: weather.humidity,
          affectedPlants: vulnerablePlants.map(p => p.plantName)
        }
      })
    }
  }

  // Rischio OIDIO (Powdery Mildew)
  // Condizioni: alta umidità (>70%) + temp 20-30°C + no pioggia
  if (weather.humidity > 70 && weather.temp > 20 && weather.temp < 30 && !weather.rainTomorrow) {
    const vulnerablePlants = tasks.filter(t =>
      !t.completed &&
      (t.taskType === 'Sowing' || t.taskType === 'Transplant') &&
      (t.plantName.toLowerCase().includes('zucch') ||
       t.plantName.toLowerCase().includes('melone') ||
       t.plantName.toLowerCase().includes('vite'))
    )

    if (vulnerablePlants.length > 0) {
      alerts.push({
        gardenId: garden.id,
        alertType: 'disease',
        severity: 'info',
        source: 'weather_api',
        title: 'Rischio Oidio (Mal Bianco)',
        message: `Condizioni favorevoli per oidio: umidità ${weather.humidity}%, temperatura ${weather.temp}°C. ${vulnerablePlants.length} piante sensibili.`,
        recommendation: 'Monitora le foglie per macchie bianche polverose. In caso di sintomi, conferma la diagnosi e valuta un prodotto autorizzato con i controlli operativi richiesti.',
        resolved: false,
        metadata: {
          temp: weather.temp,
          humidity: weather.humidity,
          affectedPlants: vulnerablePlants.map(p => p.plantName)
        }
      })
    }
  }

  // Alert GELO
  if (weather.temp < 2) {
    alerts.push({
      gardenId: garden.id,
      alertType: 'weather',
      severity: 'critical',
      source: 'weather_api',
      title: '⚠️ Allerta Gelo',
      message: `Temperatura prevista: ${weather.temp}°C. Rischio danni da gelo alle colture sensibili.`,
      recommendation: 'Proteggi piante sensibili con teli non tessuti (TNT). Ritira in casa le piante in vaso. Non irrigare prima del gelo.',
      resolved: false,
      metadata: { temp: weather.temp }
    })
  }

  // Alert STRESS TERMICO
  if (weather.temp > 35) {
    alerts.push({
      gardenId: garden.id,
      alertType: 'weather',
      severity: 'warning',
      source: 'weather_api',
      title: 'Stress Termico',
      message: `Temperature elevate previste: ${weather.temp}°C. Rischio stress idrico e scottature fogliari.`,
      recommendation: 'Aumenta frequenza irrigazioni (preferibilmente al mattino presto). Considera ombreggiatura temporanea per piante in vaso. Evita concimazioni fogliari.',
      resolved: false,
      metadata: { temp: weather.temp }
    })
  }

  return alerts
}

/**
 * Check per carenze idriche (task irrigazione in ritardo)
 */
function checkWaterDeficit(context: AlertCheckContext): Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { tasks, garden } = context
  const alerts: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] = []

  // Trova task irrigazione non completati da >3 giorni
  const now = new Date(context.checkedAt || new Date().toISOString())
  const overdueIrrigation = tasks.filter(t => {
    if (t.taskType !== 'Watering' && t.taskType !== 'Irrigazione') return false
    if (t.completed) return false

    const taskDate = new Date(t.date || t.nextDueDate || '')
    const daysSince = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 3
  })

  overdueIrrigation.forEach(task => {
    const taskDate = new Date(task.date || task.nextDueDate || '')
    const daysSince = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))

    alerts.push({
      gardenId: garden.id,
      plantId: task.plantName,
      alertType: 'water',
      severity: daysSince > 7 ? 'critical' : 'warning',
      source: 'task_overdue',
      title: 'Irrigazione in Ritardo',
      message: `${task.plantName} non irrigato da ${daysSince} giorni. Rischio stress idrico.`,
      recommendation: daysSince > 7
        ? 'URGENTE: Irriga abbondantemente nelle ore serali. Verifica lo stato delle foglie.'
        : 'Irriga abbondantemente nelle ore serali o al mattino presto.',
      resolved: false,
      metadata: {
        plantName: task.plantName,
        daysSinceLastWatering: daysSince,
        taskId: task.id
      }
    })
  })

  return alerts
}

/**
 * Check per alert stagionali (parassiti, malattie tipiche del periodo)
 */
function checkSeasonalPests(context: AlertCheckContext): Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { tasks, garden } = context
  const alerts: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] = []

  const currentMonth = new Date(context.checkedAt || new Date().toISOString()).getMonth() + 1 // 1-12
  const activePlants = tasks.filter(t =>
    !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')
  )

  // AFIDI (Aprile-Giugno, Settembre)
  if ([4, 5, 6, 9].includes(currentMonth)) {
    const vulnerablePlants = activePlants.filter(t =>
      t.plantName.toLowerCase().includes('pomodor') ||
      t.plantName.toLowerCase().includes('peperone') ||
      t.plantName.toLowerCase().includes('melanzana') ||
      t.plantName.toLowerCase().includes('fava')
    )

    if (vulnerablePlants.length > 0) {
      alerts.push({
        gardenId: garden.id,
        alertType: 'pest',
        severity: 'info',
        source: 'seasonal',
        title: 'Periodo Afidi',
        message: `Periodo di massima diffusione afidi. ${vulnerablePlants.length} piante sensibili presenti.`,
        recommendation: 'Controlla regolarmente la pagina inferiore delle foglie. In caso di infestazione leggera, usa sapone molle di potassio. Per infestazioni gravi, usa piretro naturale.',
        resolved: false,
        metadata: {
          month: currentMonth,
          affectedPlants: vulnerablePlants.map(p => p.plantName)
        }
      })
    }
  }

  // NOTTUA (Maggio-Settembre)
  if ([5, 6, 7, 8, 9].includes(currentMonth)) {
    const vulnerablePlants = activePlants.filter(t =>
      t.plantName.toLowerCase().includes('pomodor') ||
      t.plantName.toLowerCase().includes('cavolo') ||
      t.plantName.toLowerCase().includes('lattuga')
    )

    if (vulnerablePlants.length > 0) {
      alerts.push({
        gardenId: garden.id,
        alertType: 'pest',
        severity: 'info',
        source: 'seasonal',
        title: 'Periodo Nottua',
        message: `Periodo di attività nottua (bruchi verdi). Controlla ${vulnerablePlants.length} piante sensibili.`,
        recommendation: 'Ispeziona piante al tramonto. Rimuovi manualmente i bruchi. In caso di infestazione, usa Bacillus thuringiensis (biologico).',
        resolved: false,
        metadata: {
          month: currentMonth,
          affectedPlants: vulnerablePlants.map(p => p.plantName)
        }
      })
    }
  }

  return alerts
}

/**
 * Check alert da sensori IoT
 */
function checkSensorAlerts(context: AlertCheckContext): Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] {
  const { sensorData, garden } = context
  const alerts: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>[] = []

  if (!sensorData) return alerts

  // Check umidità suolo
  const moistureSensors = sensorData.filter(s => s.type === 'soil_moisture')
  moistureSensors.forEach(sensor => {
    if (sensor.value < 30) {
      alerts.push({
        gardenId: garden.id,
        alertType: 'water',
        severity: sensor.value < 20 ? 'critical' : 'warning',
        source: 'sensor',
        title: 'Umidità Suolo Bassa',
        message: `Umidità suolo: ${sensor.value}% ${sensor.zoneId ? `(Zona ${sensor.zoneId})` : ''}. Terreno troppo secco.`,
        recommendation: 'Conferma la lettura e valuta una proposta irrigua misurata; considera pacciamatura per trattenere umidità.',
        resolved: false,
        metadata: {
          sensorType: 'soil_moisture',
          value: sensor.value,
          zoneId: sensor.zoneId,
          timestamp: sensor.timestamp
        }
      })
    }
  })

  return alerts
}

/**
 * Helper: Calcola giorni tra due date
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 1000 * 60 * 60 * 24
  const diffMs = Math.abs(date2.getTime() - date1.getTime())
  return Math.floor(diffMs / oneDay)
}
