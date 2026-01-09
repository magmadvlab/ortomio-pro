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
        recommendation: 'Tratta preventivamente con prodotti rameici (ossicloruro di rame o poltiglia bordolese) oggi prima della pioggia. Evita irrigazione fogliare.',
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
        recommendation: 'Monitora le foglie per macchie bianche polverose. In caso di sintomi, tratta con zolfo bagnabile o bicarbonato di potassio.',
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
  const overdueIrrigation = tasks.filter(t => {
    if (t.taskType !== 'Watering' && t.taskType !== 'Irrigazione') return false
    if (t.completed) return false

    const taskDate = new Date(t.date || t.nextDueDate || '')
    const daysSince = Math.floor((new Date().getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysSince > 3
  })

  overdueIrrigation.forEach(task => {
    const taskDate = new Date(task.date || task.nextDueDate || '')
    const daysSince = Math.floor((new Date().getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24))

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

  const currentMonth = new Date().getMonth() + 1 // 1-12
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
        recommendation: 'Irriga abbondantemente. Considera pacciamatura per trattenere umidità.',
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
