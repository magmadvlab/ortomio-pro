/**
 * Plant Health Monitoring Service
 * Sistema intelligente per monitoraggio salute piante e suggerimenti automatici
 */

import { Garden, GardenTask } from '@/types'

export interface HealthAlert {
  id: string
  type: 'disease_risk' | 'pest_alert' | 'nutrient_deficiency' | 'stress_symptoms' | 'harvest_timing' | 'weather_stress'
  severity: 'low' | 'medium' | 'high' | 'critical'
  plantCode?: string
  plantName: string
  description: string
  detectedAt: string
  suggestedActions: HealthAction[]
  photoRequired: boolean
  agronomistConsultation: boolean
  urgencyDays: number
  confidence: number
  triggers: string[]
}

export interface HealthAction {
  type: 'photo_analysis' | 'agronomist_contact' | 'intervention' | 'monitoring'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedTime: string
  cost?: number
  taskTemplate?: Partial<GardenTask>
}

export interface MonitoringRule {
  id: string
  name: string
  description: string
  triggers: MonitoringTrigger[]
  conditions: MonitoringCondition[]
  actions: HealthAction[]
  enabled: boolean
}

export interface MonitoringTrigger {
  type: 'weather' | 'calendar' | 'task_completion' | 'photo_analysis' | 'manual'
  parameters: Record<string, any>
}

export interface MonitoringCondition {
  type: 'plant_age' | 'season' | 'weather_pattern' | 'previous_issues' | 'growth_stage'
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range'
  value: any
}

/**
 * REGOLE DI MONITORAGGIO PREDEFINITE
 */
const DEFAULT_MONITORING_RULES: MonitoringRule[] = [
  {
    id: 'tomato_blight_risk',
    name: 'Rischio Peronospora Pomodoro',
    description: 'Monitora condizioni favorevoli alla peronospora su pomodori',
    triggers: [
      {
        type: 'weather',
        parameters: {
          humidity: { min: 80 },
          temperature: { min: 15, max: 25 },
          duration_hours: 12
        }
      }
    ],
    conditions: [
      {
        type: 'plant_age',
        operator: 'greater_than',
        value: 30 // giorni
      },
      {
        type: 'season',
        operator: 'in_range',
        value: ['spring', 'summer']
      }
    ],
    actions: [
      {
        type: 'photo_analysis',
        title: 'Controllo Foglie',
        description: 'Scatta foto delle foglie per rilevare primi sintomi',
        priority: 'high',
        estimatedTime: '5 min'
      },
      {
        type: 'intervention',
        title: 'Trattamento Preventivo',
        description: 'Applicare fungicida rameico preventivo',
        priority: 'medium',
        estimatedTime: '20 min',
        taskTemplate: {
          taskType: 'Treatment',
          notes: 'Trattamento preventivo peronospora - condizioni meteo favorevoli'
        }
      }
    ],
    enabled: true
  },
  {
    id: 'aphid_spring_alert',
    name: 'Allerta Afidi Primaverili',
    description: 'Monitora comparsa afidi in primavera',
    triggers: [
      {
        type: 'calendar',
        parameters: {
          month: [3, 4, 5], // Marzo-Maggio
          temperature_trend: 'increasing'
        }
      }
    ],
    conditions: [
      {
        type: 'growth_stage',
        operator: 'equals',
        value: 'vegetative'
      }
    ],
    actions: [
      {
        type: 'monitoring',
        title: 'Ispezione Settimanale',
        description: 'Controllo presenza afidi su germogli giovani',
        priority: 'medium',
        estimatedTime: '10 min',
        taskTemplate: {
          taskType: 'Photo',
          notes: 'Controllo afidi - ispezione germogli e pagina inferiore foglie'
        }
      },
      {
        type: 'photo_analysis',
        title: 'Identificazione Parassiti',
        description: 'Foto per identificare specie e pianificare controllo',
        priority: 'medium',
        estimatedTime: '3 min'
      }
    ],
    enabled: true
  },
  {
    id: 'nutrient_deficiency_detection',
    name: 'Rilevamento Carenze Nutrizionali',
    description: 'Analizza sintomi visivi di carenze nutrizionali',
    triggers: [
      {
        type: 'photo_analysis',
        parameters: {
          leaf_color_change: true,
          growth_anomalies: true
        }
      }
    ],
    conditions: [
      {
        type: 'plant_age',
        operator: 'greater_than',
        value: 14 // giorni
      }
    ],
    actions: [
      {
        type: 'photo_analysis',
        title: 'Analisi Carenze AI',
        description: 'AI analizza colore e forma foglie per identificare carenze',
        priority: 'medium',
        estimatedTime: '3 min'
      },
      {
        type: 'intervention',
        title: 'Concimazione Correttiva',
        description: 'Applicare concime specifico basato su diagnosi',
        priority: 'medium',
        estimatedTime: '15 min'
      }
    ],
    enabled: true
  },
  {
    id: 'harvest_timing_optimizer',
    name: 'Ottimizzatore Timing Raccolta',
    description: 'Suggerisce momento ottimale per raccolta',
    triggers: [
      {
        type: 'calendar',
        parameters: {
          days_from_planting: { min: 60 }, // Varia per coltura
          growth_stage: 'fruiting'
        }
      }
    ],
    conditions: [
      {
        type: 'growth_stage',
        operator: 'equals',
        value: 'mature'
      }
    ],
    actions: [
      {
        type: 'photo_analysis',
        title: 'Valutazione Maturità',
        description: 'AI analizza colore, dimensioni e maturità frutti',
        priority: 'low',
        estimatedTime: '2 min'
      },
      {
        type: 'monitoring',
        title: 'Controllo Giornaliero',
        description: 'Monitoraggio quotidiano per timing ottimale',
        priority: 'medium',
        estimatedTime: '5 min'
      }
    ],
    enabled: true
  }
]

/**
 * SERVIZIO PRINCIPALE
 */
export class PlantHealthMonitoringService {
  private rules: MonitoringRule[] = DEFAULT_MONITORING_RULES
  private activeAlerts: HealthAlert[] = []

  /**
   * Analizza giardino e genera alert di salute
   */
  async analyzeGardenHealth(garden: Garden, tasks: GardenTask[]): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = []

    // Simula analisi basata su regole
    for (const rule of this.rules.filter(r => r.enabled)) {
      const ruleAlerts = await this.evaluateRule(rule, garden, tasks)
      alerts.push(...ruleAlerts)
    }

    // Aggiungi alert basati su pattern nei task
    const taskPatternAlerts = this.analyzeTaskPatterns(tasks)
    alerts.push(...taskPatternAlerts)

    // Aggiungi alert basati su condizioni meteo (simulato)
    const weatherAlerts = await this.analyzeWeatherConditions(garden)
    alerts.push(...weatherAlerts)

    this.activeAlerts = alerts
    return alerts
  }

  /**
   * Valuta singola regola di monitoraggio
   */
  private async evaluateRule(rule: MonitoringRule, garden: Garden, tasks: GardenTask[]): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = []

    // Simula valutazione trigger e condizioni
    const triggered = this.evaluateTriggers(rule.triggers, garden, tasks)
    const conditionsMet = this.evaluateConditions(rule.conditions, garden, tasks)

    if (triggered && conditionsMet) {
      // Genera alert per piante rilevanti
      const relevantPlants = this.getRelevantPlants(rule, garden)
      
      for (const plant of relevantPlants) {
        const alert: HealthAlert = {
          id: `${rule.id}_${plant.code}_${Date.now()}`,
          type: this.getAlertTypeFromRule(rule),
          severity: this.calculateSeverity(rule, plant),
          plantCode: plant.code,
          plantName: plant.name,
          description: this.generateDescription(rule, plant),
          detectedAt: new Date().toISOString(),
          suggestedActions: rule.actions,
          photoRequired: rule.actions.some(a => a.type === 'photo_analysis'),
          agronomistConsultation: this.shouldConsultAgronomist(rule, plant),
          urgencyDays: this.calculateUrgency(rule, plant),
          confidence: 0.8, // Simulato
          triggers: rule.triggers.map(t => t.type)
        }
        
        alerts.push(alert)
      }
    }

    return alerts
  }

  /**
   * Analizza pattern nei task per rilevare problemi ricorrenti
   */
  private analyzeTaskPatterns(tasks: GardenTask[]): HealthAlert[] {
    const alerts: HealthAlert[] = []

    // Raggruppa task per pianta
    const tasksByPlant = tasks.reduce((acc, task) => {
      const key = task.plantName // Use plantName as key since plantCode doesn't exist
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
      return acc
    }, {} as Record<string, GardenTask[]>)

    // Analizza pattern per ogni pianta
    Object.entries(tasksByPlant).forEach(([plantKey, plantTasks]) => {
      // Rileva trattamenti frequenti (possibile problema ricorrente)
      const treatmentTasks = plantTasks.filter(t => t.taskType === 'Treatment')
      if (treatmentTasks.length >= 3) {
        const lastTreatment = treatmentTasks[treatmentTasks.length - 1]
        
        alerts.push({
          id: `recurring_issue_${plantKey}_${Date.now()}`,
          type: 'disease_risk',
          severity: 'medium',
          plantCode: lastTreatment.plantName, // Use plantName as plantCode doesn't exist
          plantName: lastTreatment.plantName,
          description: `Rilevati ${treatmentTasks.length} trattamenti recenti. Possibile problema ricorrente che richiede analisi approfondita.`,
          detectedAt: new Date().toISOString(),
          suggestedActions: [
            {
              type: 'agronomist_contact',
              title: 'Consulto Specialistico',
              description: 'Problema ricorrente richiede diagnosi professionale',
              priority: 'high',
              estimatedTime: '30 min',
              cost: 50
            },
            {
              type: 'photo_analysis',
              title: 'Documentazione Completa',
              description: 'Foto dettagliate per analisi approfondita',
              priority: 'medium',
              estimatedTime: '10 min'
            }
          ],
          photoRequired: true,
          agronomistConsultation: true,
          urgencyDays: 7,
          confidence: 0.7,
          triggers: ['task_pattern']
        })
      }

      // Rileva mancanza di monitoraggio
      const monitoringTasks = plantTasks.filter(t => t.taskType === 'Photo') // Use Photo as monitoring equivalent
      const daysSinceLastMonitoring = monitoringTasks.length > 0 
        ? Math.floor((Date.now() - new Date(monitoringTasks[0].date).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      if (daysSinceLastMonitoring > 14) {
        alerts.push({
          id: `monitoring_needed_${plantKey}_${Date.now()}`,
          type: 'stress_symptoms',
          severity: 'low',
          plantCode: plantTasks[0]?.plantName, // Use plantName as plantCode doesn't exist
          plantName: plantTasks[0]?.plantName || plantKey,
          description: `Nessun controllo registrato da ${daysSinceLastMonitoring} giorni. Monitoraggio raccomandato.`,
          detectedAt: new Date().toISOString(),
          suggestedActions: [
            {
              type: 'monitoring',
              title: 'Ispezione Generale',
              description: 'Controllo stato generale della pianta',
              priority: 'low',
              estimatedTime: '5 min',
              taskTemplate: {
                taskType: 'Photo',
                notes: 'Controllo generale - stato foglie, crescita, presenza parassiti'
              }
            },
            {
              type: 'photo_analysis',
              title: 'Documentazione Stato',
              description: 'Foto per documentare stato attuale',
              priority: 'low',
              estimatedTime: '3 min'
            }
          ],
          photoRequired: false,
          agronomistConsultation: false,
          urgencyDays: 7,
          confidence: 0.6,
          triggers: ['monitoring_gap']
        })
      }
    })

    return alerts
  }

  /**
   * Analizza condizioni meteo per alert preventivi
   */
  private async analyzeWeatherConditions(garden: Garden): Promise<HealthAlert[]> {
    const alerts: HealthAlert[] = []

    // Simula dati meteo (in produzione: API meteo reale)
    const weatherData = {
      temperature: 22,
      humidity: 85,
      rainfall: 15,
      forecast: {
        nextDays: [
          { temp: 24, humidity: 90, rain: 20 },
          { temp: 26, humidity: 88, rain: 5 },
          { temp: 23, humidity: 92, rain: 25 }
        ]
      }
    }

    // Integrazione dati NDVI satellitari
    try {
      const { NDVISatelliteService } = await import('../services/ndviSatelliteService')
      const ndviData = await NDVISatelliteService.getLatestNDVI(garden)
      
      if (ndviData && ndviData.ndvi_value < 0.4) {
        alerts.push({
          id: `ndvi_stress_${Date.now()}`,
          type: 'stress_symptoms',
          severity: ndviData.ndvi_value < 0.2 ? 'critical' : 'high',
          plantName: 'Vegetazione (Satellite)',
          description: `NDVI satellitare basso (${ndviData.ndvi_value.toFixed(3)}). Stress vegetativo rilevato da Sentinel-2.`,
          detectedAt: new Date().toISOString(),
          suggestedActions: [
            {
              type: 'photo_analysis',
              title: 'Verifica Visiva',
              description: 'Confronta con immagini satellitari per localizzare il problema',
              priority: 'high',
              estimatedTime: '10 min'
            },
            {
              type: 'intervention',
              title: 'Intervento Mirato',
              description: 'Irrigazione o fertilizzazione nelle zone critiche',
              priority: 'high',
              estimatedTime: '30 min'
            }
          ],
          photoRequired: true,
          agronomistConsultation: ndviData.ndvi_value < 0.2,
          urgencyDays: ndviData.ndvi_value < 0.2 ? 1 : 3,
          confidence: 0.9, // Alta confidence per dati satellitari
          triggers: ['satellite_ndvi']
        })
      }
    } catch (error) {
      console.log('NDVI service not available, skipping satellite integration')
    }

    // Condizioni favorevoli a malattie fungine
    if (weatherData.humidity > 80 && weatherData.temperature > 15 && weatherData.temperature < 28) {
      alerts.push({
        id: `fungal_risk_weather_${Date.now()}`,
        type: 'disease_risk',
        severity: 'medium',
        plantName: 'Tutte le piante sensibili',
        description: `Condizioni meteo favorevoli a malattie fungine: umidità ${weatherData.humidity}%, temperatura ${weatherData.temperature}°C`,
        detectedAt: new Date().toISOString(),
        suggestedActions: [
          {
            type: 'intervention',
            title: 'Trattamento Preventivo',
            description: 'Applicare fungicida preventivo prima delle piogge',
            priority: 'medium',
            estimatedTime: '30 min'
          },
          {
            type: 'monitoring',
            title: 'Controllo Post-Pioggia',
            description: 'Ispezione 24-48h dopo le precipitazioni',
            priority: 'medium',
            estimatedTime: '15 min'
          }
        ],
        photoRequired: false,
        agronomistConsultation: false,
        urgencyDays: 2,
        confidence: 0.75,
        triggers: ['weather']
      })
    }

    // Stress da caldo
    const hotDays = weatherData.forecast.nextDays.filter(d => d.temp > 30).length
    if (hotDays >= 2) {
      alerts.push({
        id: `heat_stress_${Date.now()}`,
        type: 'stress_symptoms',
        severity: 'medium',
        plantName: 'Piante sensibili al caldo',
        description: `Previste ${hotDays} giornate con temperature >30°C. Rischio stress idrico.`,
        detectedAt: new Date().toISOString(),
        suggestedActions: [
          {
            type: 'intervention',
            title: 'Irrigazione Preventiva',
            description: 'Aumentare frequenza irrigazione',
            priority: 'high',
            estimatedTime: '20 min'
          },
          {
            type: 'monitoring',
            title: 'Controllo Stress',
            description: 'Monitorare segni di appassimento',
            priority: 'medium',
            estimatedTime: '10 min'
          }
        ],
        photoRequired: true,
        agronomistConsultation: false,
        urgencyDays: 1,
        confidence: 0.8,
        triggers: ['weather']
      })
    }

    return alerts
  }

  /**
   * Metodi di supporto
   */
  private evaluateTriggers(triggers: MonitoringTrigger[], garden: Garden, tasks: GardenTask[]): boolean {
    // Simula valutazione trigger
    return Math.random() > 0.7 // 30% probabilità di trigger
  }

  private evaluateConditions(conditions: MonitoringCondition[], garden: Garden, tasks: GardenTask[]): boolean {
    // Simula valutazione condizioni
    return Math.random() > 0.5 // 50% probabilità condizioni soddisfatte
  }

  private getRelevantPlants(rule: MonitoringRule, garden: Garden): Array<{code: string, name: string}> {
    // Simula selezione piante rilevanti
    return [
      { code: 'F1-P015', name: 'Pomodoro San Marzano' },
      { code: 'F2-P003', name: 'Basilico Genovese' }
    ]
  }

  private getAlertTypeFromRule(rule: MonitoringRule): HealthAlert['type'] {
    if (rule.id.includes('blight') || rule.id.includes('disease')) return 'disease_risk'
    if (rule.id.includes('aphid') || rule.id.includes('pest')) return 'pest_alert'
    if (rule.id.includes('nutrient')) return 'nutrient_deficiency'
    if (rule.id.includes('harvest')) return 'harvest_timing'
    return 'stress_symptoms'
  }

  private calculateSeverity(rule: MonitoringRule, plant: any): HealthAlert['severity'] {
    // Logica per calcolare severità basata su regola e stato pianta
    if (rule.id.includes('blight')) return 'high'
    if (rule.id.includes('harvest')) return 'low'
    return 'medium'
  }

  private generateDescription(rule: MonitoringRule, plant: any): string {
    return `${rule.description} rilevata per ${plant.name}`
  }

  private shouldConsultAgronomist(rule: MonitoringRule, plant: any): boolean {
    return rule.actions.some(a => a.type === 'agronomist_contact') || 
           rule.id.includes('disease') || 
           rule.id.includes('recurring')
  }

  private calculateUrgency(rule: MonitoringRule, plant: any): number {
    if (rule.id.includes('blight') || rule.id.includes('disease')) return 2
    if (rule.id.includes('pest')) return 5
    if (rule.id.includes('harvest')) return 3
    return 7
  }

  /**
   * API pubbliche
   */
  async getActiveAlerts(): Promise<HealthAlert[]> {
    return this.activeAlerts
  }

  async dismissAlert(alertId: string): Promise<void> {
    this.activeAlerts = this.activeAlerts.filter(a => a.id !== alertId)
  }

  async createTaskFromAction(alert: HealthAlert, action: HealthAction, garden: Garden): Promise<Partial<GardenTask>> {
    const baseTask: Partial<GardenTask> = {
      gardenId: garden.id,
      plantName: alert.plantName,
      taskType: action.type === 'intervention' ? 'Treatment' : 
                action.type === 'monitoring' ? 'Photo' : 'Photo', // Default to Photo for other types
      date: new Date().toISOString().split('T')[0],
      notes: `${action.title}: ${action.description}`,
      completed: false
    }

    // Merge con template se disponibile
    if (action.taskTemplate) {
      Object.assign(baseTask, action.taskTemplate)
    }

    return baseTask
  }
}

// Istanza singleton
export const plantHealthMonitoringService = new PlantHealthMonitoringService()

export default plantHealthMonitoringService