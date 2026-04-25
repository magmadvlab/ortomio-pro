/**
 * Continuous Monitoring Service
 * Sistema di monitoraggio continuo per OrtoMio Professional
 * 
 * Funzionalità:
 * - Monitoraggio stato piante in tempo reale
 * - Allerte intelligenti basate su AI
 * - Notifiche proattive per interventi
 * - Controllo automatico parametri critici
 * - Integrazione con Director per azioni automatiche
 */

import { Garden, GardenTask } from '@/types'
import { GardenPlant, PlantOperation } from '@/types/individualPlant'
import { directorService } from '@/services/directorService'
import { sendNotification, NotificationData } from './notificationService'
import { getWeatherForecast } from './weatherService'

export interface MonitoringAlert {
  id: string
  plantId?: string
  gardenId: string
  type: 'critical' | 'warning' | 'info'
  category: 'health' | 'irrigation' | 'nutrition' | 'weather' | 'pest' | 'disease' | 'harvest'
  title: string
  message: string
  actionRequired: boolean
  suggestedActions: string[]
  priority: 1 | 2 | 3 | 4 | 5 // 1 = massima priorità
  createdAt: string
  resolvedAt?: string
  autoResolvable: boolean
  metadata?: Record<string, any>
}

export interface PlantHealthStatus {
  plantId: string
  plantCode: string
  plantName: string
  healthScore: number // 0-100
  status: 'healthy' | 'warning' | 'critical' | 'dead'
  lastChecked: string
  issues: {
    type: 'irrigation' | 'nutrition' | 'pest' | 'disease' | 'environmental'
    severity: 'low' | 'medium' | 'high'
    description: string
    detectedAt: string
  }[]
  nextActions: {
    action: string
    priority: 'low' | 'medium' | 'high'
    dueDate: string
    estimatedDuration: number // minuti
  }[]
}

export interface MonitoringConfig {
  gardenId: string
  enabled: boolean
  storageProvider?: {
    getGarden: (gardenId: string) => Promise<Garden | null>
    getTasks: (gardenId?: string) => Promise<GardenTask[]>
    getIndividualPlants?: (gardenId: string) => Promise<GardenPlant[]>
    getPlantOperations?: (plantId: string) => Promise<PlantOperation[]>
    createTask?: (task: Omit<GardenTask, 'id'>) => Promise<GardenTask>
  }
  notificationTarget?: {
    userId: string
    userEmail: string
  }
  checkIntervalMinutes: number
  alertThresholds: {
    healthScoreWarning: number // sotto questo valore = warning
    healthScoreCritical: number // sotto questo valore = critical
    daysWithoutWater: number
    daysWithoutFertilizer: number
    temperatureMin: number
    temperatureMax: number
    humidityMin: number
    humidityMax: number
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    immediateForCritical: boolean
  }
  autoActions: {
    createTasks: boolean
    adjustIrrigation: boolean
    orderSupplies: boolean
  }
}

/**
 * CONFIGURAZIONE DEFAULT
 */
export const DEFAULT_MONITORING_CONFIG: Omit<MonitoringConfig, 'gardenId'> = {
  enabled: true,
  checkIntervalMinutes: 60, // Controllo ogni ora
  alertThresholds: {
    healthScoreWarning: 70,
    healthScoreCritical: 50,
    daysWithoutWater: 3,
    daysWithoutFertilizer: 14,
    temperatureMin: 5,
    temperatureMax: 35,
    humidityMin: 40,
    humidityMax: 90
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    immediateForCritical: true
  },
  autoActions: {
    createTasks: true,
    adjustIrrigation: false, // Richiede hardware IoT
    orderSupplies: false // Richiede integrazione e-commerce
  }
}

/**
 * CLASSE PRINCIPALE MONITORING SERVICE
 */
export class ContinuousMonitoringService {
  private config: MonitoringConfig
  private alerts: Map<string, MonitoringAlert> = new Map()
  private plantStatuses: Map<string, PlantHealthStatus> = new Map()
  private isRunning: boolean = false
  private intervalId?: NodeJS.Timeout

  constructor(config: MonitoringConfig) {
    this.config = config
  }

  private getOperationDate(operation: PlantOperation): string {
    return operation.operationDate || operation.date
  }

  /**
   * Avvia il monitoraggio continuo
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Monitoring already running')
      return
    }

    this.isRunning = true
    console.log(`🔍 Starting continuous monitoring for garden ${this.config.gardenId}`)
    
    // Primo controllo immediato
    this.performMonitoringCheck()
    
    // Programma controlli periodici
    this.intervalId = setInterval(() => {
      this.performMonitoringCheck()
    }, this.config.checkIntervalMinutes * 60 * 1000)
  }

  /**
   * Ferma il monitoraggio
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.isRunning = false
    console.log(`⏹️ Stopped monitoring for garden ${this.config.gardenId}`)
  }

  /**
   * Esegue un ciclo completo di monitoraggio
   */
  private async performMonitoringCheck(): Promise<void> {
    try {
      console.log(`🔍 Performing monitoring check for garden ${this.config.gardenId}`)
      
      // 1. Carica dati giardino e piante
      const { garden, plants, tasks, operations } = await this.loadGardenData()
      
      // 2. Analizza stato di ogni pianta
      const plantStatuses = await this.analyzePlantHealth(plants, operations)
      
      // 3. Controlla condizioni ambientali
      const environmentalAlerts = await this.checkEnvironmentalConditions(garden)
      
      // 4. Verifica scadenze e programmi
      const scheduleAlerts = await this.checkScheduleCompliance(tasks, operations)
      
      // 5. Integrazione con Director per allerte urgenti
      const directorAlerts = await this.getDirectorAlerts(garden, tasks)
      
      // 6. Consolida tutti gli alert
      const allAlerts = [
        ...environmentalAlerts,
        ...scheduleAlerts,
        ...directorAlerts
      ]
      
      // 7. Processa nuovi alert
      await this.processNewAlerts(allAlerts)
      
      // 8. Aggiorna stati piante
      this.updatePlantStatuses(plantStatuses)
      
      // 9. Esegui azioni automatiche se configurate
      if (this.config.autoActions.createTasks) {
        await this.executeAutoActions(allAlerts)
      }
      
      console.log(`✅ Monitoring check completed. Found ${allAlerts.length} alerts`)
      
    } catch (error) {
      console.error('Error in monitoring check:', error)
    }
  }

  /**
   * Carica dati del giardino
   */
  private async loadGardenData(): Promise<{
    garden: Garden
    plants: GardenPlant[]
    tasks: GardenTask[]
    operations: PlantOperation[]
  }> {
    const storageProvider = this.config.storageProvider
    if (!storageProvider) {
      throw new Error('Monitoring storageProvider non configurato')
    }

    const garden = await storageProvider.getGarden(this.config.gardenId)
    if (!garden) {
      throw new Error(`Giardino ${this.config.gardenId} non trovato`)
    }

    const plants = storageProvider.getIndividualPlants
      ? await storageProvider.getIndividualPlants(this.config.gardenId)
      : []

    const tasks = await storageProvider.getTasks(this.config.gardenId)
    const operations = storageProvider.getPlantOperations
      ? (await Promise.all(
          plants.map(async (plant) => {
            try {
              return await storageProvider.getPlantOperations!(plant.id)
            } catch (error) {
              console.error(`Error loading operations for plant ${plant.id}:`, error)
              return []
            }
          })
        )).flat()
      : []

    return {
      garden,
      plants,
      tasks,
      operations
    }
  }

  /**
   * Analizza salute di ogni pianta
   */
  private async analyzePlantHealth(
    plants: GardenPlant[],
    operations: PlantOperation[]
  ): Promise<PlantHealthStatus[]> {
    const statuses: PlantHealthStatus[] = []
    
    for (const plant of plants) {
      const plantOperations = operations.filter(op => op.plantId === plant.id)
      const status = await this.calculatePlantHealthStatus(plant, plantOperations)
      statuses.push(status)
    }
    
    return statuses
  }

  /**
   * Calcola stato di salute di una pianta
   */
  private async calculatePlantHealthStatus(
    plant: GardenPlant,
    operations: PlantOperation[]
  ): Promise<PlantHealthStatus> {
    const now = new Date()
    const issues: PlantHealthStatus['issues'] = []
    const nextActions: PlantHealthStatus['nextActions'] = []
    
    // Controlla ultima irrigazione
    const lastWatering = operations
      .filter(op => op.operationType === 'watering')
      .sort((a, b) => new Date(this.getOperationDate(b)).getTime() - new Date(this.getOperationDate(a)).getTime())[0]
    
    if (!lastWatering || this.daysSince(this.getOperationDate(lastWatering)) > this.config.alertThresholds.daysWithoutWater) {
      issues.push({
        type: 'irrigation',
        severity: 'high',
        description: `Nessuna irrigazione da ${lastWatering ? this.daysSince(this.getOperationDate(lastWatering)) : 'mai'} giorni`,
        detectedAt: now.toISOString()
      })
      
      nextActions.push({
        action: 'Irrigazione urgente',
        priority: 'high',
        dueDate: now.toISOString(),
        estimatedDuration: 15
      })
    }
    
    // Controlla ultima fertilizzazione
    const lastFertilizing = operations
      .filter(op => op.operationType === 'fertilizing')
      .sort((a, b) => new Date(this.getOperationDate(b)).getTime() - new Date(this.getOperationDate(a)).getTime())[0]
    
    if (!lastFertilizing || this.daysSince(this.getOperationDate(lastFertilizing)) > this.config.alertThresholds.daysWithoutFertilizer) {
      issues.push({
        type: 'nutrition',
        severity: 'medium',
        description: `Nessuna fertilizzazione da ${lastFertilizing ? this.daysSince(this.getOperationDate(lastFertilizing)) : 'mai'} giorni`,
        detectedAt: now.toISOString()
      })
      
      nextActions.push({
        action: 'Fertilizzazione',
        priority: 'medium',
        dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 30
      })
    }
    
    // Calcola health score
    let healthScore = plant.healthScore || 100
    
    // Penalizza per ogni issue
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high': healthScore -= 30; break
        case 'medium': healthScore -= 15; break
        case 'low': healthScore -= 5; break
      }
    })
    
    healthScore = Math.max(0, Math.min(100, healthScore))
    
    // Determina status
    let status: PlantHealthStatus['status'] = 'healthy'
    if (healthScore < this.config.alertThresholds.healthScoreCritical) {
      status = 'critical'
    } else if (healthScore < this.config.alertThresholds.healthScoreWarning) {
      status = 'warning'
    }
    
    return {
      plantId: plant.id,
      plantCode: plant.plantCode || `P-${plant.id.slice(0, 8)}`,
      plantName: plant.plantName,
      healthScore,
      status,
      lastChecked: now.toISOString(),
      issues,
      nextActions
    }
  }

  /**
   * Controlla condizioni ambientali
   */
  private async checkEnvironmentalConditions(garden: Garden): Promise<MonitoringAlert[]> {
    const alerts: MonitoringAlert[] = []
    
    if (!garden.coordinates) {
      return alerts
    }
    
    try {
      const forecast = await getWeatherForecast(
        garden.coordinates.latitude,
        garden.coordinates.longitude
      )
      
      const todayForecast = forecast[0]
      if (!todayForecast) return alerts

      const temperature = typeof todayForecast.temp_max === 'number'
        ? todayForecast.temp_max
        : typeof todayForecast.temp_min === 'number'
          ? todayForecast.temp_min
          : undefined
      const humidity = typeof todayForecast.humidity === 'number' ? todayForecast.humidity : undefined
      
      // Controllo temperatura
      if (typeof temperature === 'number' && temperature < this.config.alertThresholds.temperatureMin) {
        alerts.push({
          id: `temp-low-${Date.now()}`,
          gardenId: this.config.gardenId,
          type: 'warning',
          category: 'weather',
          title: 'Temperatura troppo bassa',
          message: `Temperatura prevista: ${temperature}°C. Rischio danni da freddo.`,
          actionRequired: true,
          suggestedActions: [
            'Coprire piante sensibili al freddo',
            'Spostare vasi in serra o al riparo',
            'Verificare sistema antigelo se presente'
          ],
          priority: 2,
          createdAt: new Date().toISOString(),
          autoResolvable: false,
          metadata: { temperature, threshold: this.config.alertThresholds.temperatureMin, forecastDate: todayForecast.date }
        })
      }
      
      if (typeof temperature === 'number' && temperature > this.config.alertThresholds.temperatureMax) {
        alerts.push({
          id: `temp-high-${Date.now()}`,
          gardenId: this.config.gardenId,
          type: 'warning',
          category: 'weather',
          title: 'Temperatura troppo alta',
          message: `Temperatura prevista: ${temperature}°C. Rischio stress idrico.`,
          actionRequired: true,
          suggestedActions: [
            'Aumentare frequenza irrigazione',
            'Installare ombreggiature temporanee',
            'Verificare mulching per ridurre evaporazione'
          ],
          priority: 2,
          createdAt: new Date().toISOString(),
          autoResolvable: false,
          metadata: { temperature, threshold: this.config.alertThresholds.temperatureMax, forecastDate: todayForecast.date }
        })
      }
      
      // Controllo umidità se disponibile
      if (humidity !== undefined) {
        if (humidity < this.config.alertThresholds.humidityMin) {
          alerts.push({
            id: `humidity-low-${Date.now()}`,
            gardenId: this.config.gardenId,
            type: 'info',
            category: 'weather',
            title: 'Umidità bassa',
            message: `Umidità prevista: ${humidity}%. Possibile stress idrico.`,
            actionRequired: false,
            suggestedActions: [
              'Considerare irrigazione aggiuntiva',
              'Verificare mulching'
            ],
            priority: 4,
            createdAt: new Date().toISOString(),
            autoResolvable: true,
            metadata: { humidity, threshold: this.config.alertThresholds.humidityMin, forecastDate: todayForecast.date }
          })
        }
        
        if (humidity > this.config.alertThresholds.humidityMax) {
          alerts.push({
            id: `humidity-high-${Date.now()}`,
            gardenId: this.config.gardenId,
            type: 'warning',
            category: 'weather',
            title: 'Umidità alta',
            message: `Umidità prevista: ${humidity}%. Rischio malattie fungine.`,
            actionRequired: true,
            suggestedActions: [
              'Migliorare ventilazione',
              'Ridurre irrigazione fogliare',
              'Monitorare segni di malattie fungine'
            ],
            priority: 3,
            createdAt: new Date().toISOString(),
            autoResolvable: false,
            metadata: { humidity, threshold: this.config.alertThresholds.humidityMax, forecastDate: todayForecast.date }
          })
        }
      }
      
    } catch (error) {
      console.error('Error checking environmental conditions:', error)
    }
    
    return alerts
  }

  /**
   * Verifica compliance con programmi e scadenze
   */
  private async checkScheduleCompliance(
    tasks: GardenTask[],
    operations: PlantOperation[]
  ): Promise<MonitoringAlert[]> {
    const alerts: MonitoringAlert[] = []
    const now = new Date()
    
    // Controlla task scaduti
    const overdueTasks = tasks.filter(task => 
      !task.completed && 
      new Date(task.date) < now
    )
    
    if (overdueTasks.length > 0) {
      alerts.push({
        id: `overdue-tasks-${Date.now()}`,
        gardenId: this.config.gardenId,
        type: 'warning',
        category: 'health',
        title: `${overdueTasks.length} task scaduti`,
        message: `Hai ${overdueTasks.length} task non completati oltre la scadenza.`,
        actionRequired: true,
        suggestedActions: [
          'Rivedi e completa i task scaduti',
          'Riprogramma se necessario',
          'Verifica impatto su salute piante'
        ],
        priority: 2,
        createdAt: now.toISOString(),
        autoResolvable: false,
        metadata: { overdueCount: overdueTasks.length, taskIds: overdueTasks.map(t => t.id) }
      })
    }
    
    // Controlla task in scadenza (prossimi 2 giorni)
    const upcomingTasks = tasks.filter(task => {
      if (task.completed) return false
      const taskDate = new Date(task.date)
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      return taskDate >= now && taskDate <= twoDaysFromNow
    })
    
    if (upcomingTasks.length > 0) {
      alerts.push({
        id: `upcoming-tasks-${Date.now()}`,
        gardenId: this.config.gardenId,
        type: 'info',
        category: 'health',
        title: `${upcomingTasks.length} task in scadenza`,
        message: `Hai ${upcomingTasks.length} task da completare nei prossimi 2 giorni.`,
        actionRequired: false,
        suggestedActions: [
          'Pianifica il tempo per completare i task',
          'Prepara materiali necessari'
        ],
        priority: 4,
        createdAt: now.toISOString(),
        autoResolvable: true,
        metadata: { upcomingCount: upcomingTasks.length, taskIds: upcomingTasks.map(t => t.id) }
      })
    }
    
    return alerts
  }

  /**
   * Ottiene allerte dal Director
   */
  private async getDirectorAlerts(garden: Garden, _tasks: GardenTask[]): Promise<MonitoringAlert[]> {
    const alerts: MonitoringAlert[] = []
    
    try {
      const urgentAlerts = await directorService.getUrgentWeatherAlerts(garden)
      
      urgentAlerts.forEach((alert, index) => {
        alerts.push({
          id: `director-${Date.now()}-${index}`,
          gardenId: this.config.gardenId,
          type: alert.blockOperations ? 'critical' : 'warning',
          category: 'weather', // La maggior parte degli alert del Director sono meteo
          title: alert.message,
          message: alert.action,
          actionRequired: Boolean(alert.blockOperations),
          suggestedActions: [alert.action],
          priority: alert.blockOperations ? 1 : 2,
          createdAt: new Date().toISOString(),
          autoResolvable: false,
          metadata: { source: 'director', blockOperations: alert.blockOperations }
        })
      })
      
    } catch (error) {
      console.error('Error getting Director alerts:', error)
    }
    
    return alerts
  }

  /**
   * Processa nuovi alert
   */
  private async processNewAlerts(newAlerts: MonitoringAlert[]): Promise<void> {
    for (const alert of newAlerts) {
      // Controlla se è un alert duplicato
      const existingAlert = Array.from(this.alerts.values()).find(existing => 
        existing.category === alert.category &&
        existing.title === alert.title &&
        !existing.resolvedAt
      )
      
      if (existingAlert) {
        continue // Skip duplicati
      }
      
      // Salva nuovo alert
      this.alerts.set(alert.id, alert)
      
      // Invia notifiche se configurate
      if (this.config.notifications.email || this.config.notifications.push) {
        await this.sendAlertNotification(alert)
      }
      
      console.log(`🚨 New alert: ${alert.title} (${alert.type})`)
    }
  }

  /**
   * Invia notifica per alert
   */
  private async sendAlertNotification(alert: MonitoringAlert): Promise<void> {
    const target = this.config.notificationTarget
    if (!target) {
      console.log(`📧 Notification target non configurato per alert: ${alert.title}`)
      return
    }

    const notification: NotificationData = {
      userId: target.userId,
      userEmail: target.userEmail,
      type: 'weather_alert',
      subject: alert.title,
      templateData: {
        title: alert.title,
        message: alert.message,
        suggestedActions: alert.suggestedActions,
        priority: alert.priority
      }
    }

    console.log(`📧 Notification prepared for alert: ${alert.title}`)
    void sendNotification(notification, {}).catch((error) => {
      console.error('Error sending monitoring notification:', error)
    })
  }

  /**
   * Aggiorna stati piante
   */
  private updatePlantStatuses(statuses: PlantHealthStatus[]): void {
    statuses.forEach(status => {
      this.plantStatuses.set(status.plantId, status)
    })
  }

  /**
   * Esegue azioni automatiche
   */
  private async executeAutoActions(alerts: MonitoringAlert[]): Promise<void> {
    const storageProvider = this.config.storageProvider
    if (!storageProvider?.createTask) {
      return
    }

    for (const alert of alerts) {
      if (!alert.actionRequired || !this.config.autoActions.createTasks) {
        continue
      }
      
      // Crea task automatici per alert critici
      if (alert.type === 'critical' && alert.suggestedActions.length > 0) {
        const dueDate = new Date()
        const taskType: GardenTask['taskType'] =
          alert.category === 'irrigation'
            ? 'Irrigation'
            : alert.category === 'nutrition'
              ? 'Fertilize'
              : alert.category === 'harvest'
                ? 'Harvest'
                : alert.category === 'weather' || alert.category === 'health' || alert.category === 'disease' || alert.category === 'pest'
                  ? 'Treatment'
                  : 'Treatment'

        await storageProvider.createTask({
          gardenId: this.config.gardenId,
          plantName: 'Monitoraggio automatico',
          taskType,
          date: dueDate.toISOString().split('T')[0],
          completed: false,
          aiGenerated: true,
          isSuggested: true,
          notes: [alert.title, alert.message, ...alert.suggestedActions].join('\n'),
          suggestedBy: 'continuousMonitoringService'
        })
        console.log(`🤖 Automatic task created for: ${alert.title}`)
      }
    }
  }

  /**
   * Utility: calcola giorni da una data
   */
  private daysSince(dateString: string): number {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * API PUBBLICHE
   */

  /**
   * Ottiene tutti gli alert attivi
   */
  getActiveAlerts(): MonitoringAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolvedAt)
  }

  /**
   * Ottiene alert per categoria
   */
  getAlertsByCategory(category: MonitoringAlert['category']): MonitoringAlert[] {
    return this.getActiveAlerts().filter(alert => alert.category === category)
  }

  /**
   * Ottiene stati di tutte le piante
   */
  getAllPlantStatuses(): PlantHealthStatus[] {
    return Array.from(this.plantStatuses.values())
  }

  /**
   * Ottiene stato di una pianta specifica
   */
  getPlantStatus(plantId: string): PlantHealthStatus | undefined {
    return this.plantStatuses.get(plantId)
  }

  /**
   * Risolve un alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId)
    if (alert && !alert.resolvedAt) {
      alert.resolvedAt = new Date().toISOString()
      this.alerts.set(alertId, alert)
      return true
    }
    return false
  }

  /**
   * Aggiorna configurazione
   */
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Riavvia se l'intervallo è cambiato
    if (newConfig.checkIntervalMinutes && this.isRunning) {
      this.stop()
      this.start()
    }
  }

  /**
   * Ottiene statistiche di monitoraggio
   */
  getMonitoringStats(): {
    totalAlerts: number
    criticalAlerts: number
    warningAlerts: number
    infoAlerts: number
    plantsMonitored: number
    healthyPlants: number
    warningPlants: number
    criticalPlants: number
    averageHealthScore: number
    lastCheckTime: string
  } {
    const activeAlerts = this.getActiveAlerts()
    const plantStatuses = this.getAllPlantStatuses()
    
    return {
      totalAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.type === 'critical').length,
      warningAlerts: activeAlerts.filter(a => a.type === 'warning').length,
      infoAlerts: activeAlerts.filter(a => a.type === 'info').length,
      plantsMonitored: plantStatuses.length,
      healthyPlants: plantStatuses.filter(p => p.status === 'healthy').length,
      warningPlants: plantStatuses.filter(p => p.status === 'warning').length,
      criticalPlants: plantStatuses.filter(p => p.status === 'critical').length,
      averageHealthScore: plantStatuses.length > 0 
        ? plantStatuses.reduce((sum, p) => sum + p.healthScore, 0) / plantStatuses.length 
        : 0,
      lastCheckTime: new Date().toISOString()
    }
  }
}

/**
 * FACTORY FUNCTION
 */
export function createMonitoringService(gardenId: string, customConfig?: Partial<MonitoringConfig>): ContinuousMonitoringService {
  const config: MonitoringConfig = {
    ...DEFAULT_MONITORING_CONFIG,
    gardenId,
    ...customConfig
  }
  
  return new ContinuousMonitoringService(config)
}

/**
 * SINGLETON MANAGER PER MULTIPLE GARDENS
 */
export class MonitoringManager {
  private services: Map<string, ContinuousMonitoringService> = new Map()
  
  /**
   * Avvia monitoraggio per un giardino
   */
  startMonitoring(gardenId: string, config?: Partial<MonitoringConfig>): void {
    if (this.services.has(gardenId)) {
      console.warn(`Monitoring already active for garden ${gardenId}`)
      return
    }
    
    const service = createMonitoringService(gardenId, config)
    this.services.set(gardenId, service)
    service.start()
  }
  
  /**
   * Ferma monitoraggio per un giardino
   */
  stopMonitoring(gardenId: string): void {
    const service = this.services.get(gardenId)
    if (service) {
      service.stop()
      this.services.delete(gardenId)
    }
  }
  
  /**
   * Ottiene servizio per un giardino
   */
  getService(gardenId: string): ContinuousMonitoringService | undefined {
    return this.services.get(gardenId)
  }
  
  /**
   * Ottiene tutti gli alert di tutti i giardini
   */
  getAllAlerts(): MonitoringAlert[] {
    const allAlerts: MonitoringAlert[] = []
    this.services.forEach(service => {
      allAlerts.push(...service.getActiveAlerts())
    })
    return allAlerts.sort((a, b) => a.priority - b.priority)
  }
  
  /**
   * Ferma tutti i monitoraggi
   */
  stopAll(): void {
    this.services.forEach((service, gardenId) => {
      service.stop()
    })
    this.services.clear()
  }
}

// Singleton globale
export const monitoringManager = new MonitoringManager()
