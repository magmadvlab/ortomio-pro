/**
 * Intelligent Notification Service
 * Sistema di notifiche intelligenti per OrtoMio Professional
 * 
 * Funzionalità:
 * - Notifiche contestuali basate su AI
 * - Prioritizzazione intelligente
 * - Raggruppamento automatico
 * - Timing ottimale per invio
 * - Personalizzazione per utente
 * - Integrazione con monitoraggio continuo
 */

import { MonitoringAlert, PlantHealthStatus } from './continuousMonitoringService'
import { sendNotification, NotificationData, NotificationType } from './notificationService'
import { Garden, GardenTask } from '@/types'
import { GardenPlant } from '@/types/individualPlant'

export interface IntelligentNotification {
  id: string
  userId: string
  gardenId: string
  type: 'immediate' | 'scheduled' | 'digest'
  priority: 1 | 2 | 3 | 4 | 5 // 1 = massima priorità
  category: 'critical' | 'operational' | 'informational' | 'educational'
  title: string
  message: string
  actionable: boolean
  actions?: {
    id: string
    label: string
    type: 'task' | 'navigation' | 'external'
    data: any
  }[]
  context: {
    plantIds?: string[]
    taskIds?: string[]
    alertIds?: string[]
    weatherRelated?: boolean
    timesSensitive?: boolean
  }
  aiGenerated: boolean
  aiConfidence?: number // 0-1
  scheduledFor?: string
  sentAt?: string
  readAt?: string
  dismissedAt?: string
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  userId: string
  enabled: boolean
  quietHours: {
    start: string // HH:MM
    end: string // HH:MM
  }
  digestFrequency: 'never' | 'daily' | 'weekly'
  digestTime: string // HH:MM
  categories: {
    critical: boolean
    operational: boolean
    informational: boolean
    educational: boolean
  }
  channels: {
    email: boolean
    push: boolean
    sms: boolean
    inApp: boolean
  }
  aiPersonalization: boolean
  maxNotificationsPerDay: number
}

export interface NotificationContext {
  user: {
    id: string
    email: string
    timezone: string
    experience: 'beginner' | 'intermediate' | 'expert'
    preferences: NotificationPreferences
  }
  garden: Garden
  plants: GardenPlant[]
  tasks: GardenTask[]
  alerts: MonitoringAlert[]
  plantStatuses: PlantHealthStatus[]
  weather?: {
    current: any
    forecast: any[]
  }
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
}

/**
 * CLASSE PRINCIPALE INTELLIGENT NOTIFICATION SERVICE
 */
export class IntelligentNotificationService {
  private notifications: Map<string, IntelligentNotification> = new Map()
  private pendingDigests: Map<string, IntelligentNotification[]> = new Map()
  private aiPromptCache: Map<string, string> = new Map()

  /**
   * Processa alert e genera notifiche intelligenti
   */
  async processAlerts(
    alerts: MonitoringAlert[],
    context: NotificationContext,
    supabaseClient: any
  ): Promise<IntelligentNotification[]> {
    const notifications: IntelligentNotification[] = []
    
    // Raggruppa alert per categoria e priorità
    const groupedAlerts = this.groupAlerts(alerts)
    
    for (const [category, categoryAlerts] of groupedAlerts) {
      // Genera notifica per ogni gruppo
      const notification = await this.generateNotificationForAlerts(
        categoryAlerts,
        context,
        category
      )
      
      if (notification) {
        notifications.push(notification)
      }
    }
    
    // Applica logica di prioritizzazione e timing
    const optimizedNotifications = await this.optimizeNotifications(
      notifications,
      context
    )
    
    // Salva e programma notifiche
    for (const notification of optimizedNotifications) {
      this.notifications.set(notification.id, notification)
      await this.scheduleNotification(notification, context, supabaseClient)
    }
    
    return optimizedNotifications
  }

  /**
   * Raggruppa alert per categoria
   */
  private groupAlerts(alerts: MonitoringAlert[]): Map<string, MonitoringAlert[]> {
    const groups = new Map<string, MonitoringAlert[]>()
    
    alerts.forEach(alert => {
      const key = `${alert.category}-${alert.type}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(alert)
    })
    
    return groups
  }

  /**
   * Genera notifica intelligente per un gruppo di alert
   */
  private async generateNotificationForAlerts(
    alerts: MonitoringAlert[],
    context: NotificationContext,
    category: string
  ): Promise<IntelligentNotification | null> {
    if (alerts.length === 0) return null
    
    const highestPriority = Math.min(...alerts.map(a => a.priority)) as IntelligentNotification['priority']
    const isTimesSensitive = alerts.some(a => a.type === 'critical')
    
    // Determina tipo di notifica
    let notificationType: IntelligentNotification['type'] = 'scheduled'
    if (highestPriority <= 2 || isTimesSensitive) {
      notificationType = 'immediate'
    } else if (context.user.preferences.digestFrequency !== 'never') {
      notificationType = 'digest'
    }
    
    // Genera contenuto con AI
    const { title, message, actions } = await this.generateAIContent(
      alerts,
      context
    )
    const notificationActions = actions ?? []
    
    const notification: IntelligentNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: context.user.id,
      gardenId: context.garden.id,
      type: notificationType,
      priority: highestPriority,
      category: this.mapAlertCategoryToNotificationCategory(alerts[0].category),
      title,
      message,
      actionable: notificationActions.length > 0,
      actions: notificationActions,
      context: {
        alertIds: alerts.map(a => a.id),
        plantIds: alerts.filter(a => a.plantId).map(a => a.plantId!),
        weatherRelated: alerts.some(a => a.category === 'weather'),
        timesSensitive: isTimesSensitive
      },
      // generateAIContent usa ancora generateRuleBasedContent (nessuna chiamata AI reale,
      // vedi TODO li' dentro): non dichiarare contenuto/confidenza AI che non esiste.
      aiGenerated: false,
      aiConfidence: undefined,
      scheduledFor: notificationType === 'immediate' 
        ? new Date().toISOString()
        : this.calculateOptimalSendTime(context),
      metadata: {
        alertCount: alerts.length,
        categories: [...new Set(alerts.map(a => a.category))],
        generatedAt: new Date().toISOString()
      }
    }
    
    return notification
  }

  /**
   * Genera contenuto con AI
   */
  private async generateAIContent(
    alerts: MonitoringAlert[],
    context: NotificationContext
  ): Promise<{
    title: string
    message: string
    actions: IntelligentNotification['actions']
  }> {
    // Crea prompt per AI
    const prompt = this.buildAIPrompt(alerts, context)
    
    // Cache per evitare chiamate duplicate
    const cacheKey = this.hashPrompt(prompt)
    if (this.aiPromptCache.has(cacheKey)) {
      return JSON.parse(this.aiPromptCache.get(cacheKey)!)
    }
    
    try {
      // TODO: Implementare chiamata AI reale
      // Per ora usa logica rule-based
      const result = this.generateRuleBasedContent(alerts, context)
      
      // Cache risultato
      this.aiPromptCache.set(cacheKey, JSON.stringify(result))
      
      return result
    } catch (error) {
      console.error('Error generating AI content:', error)
      return this.generateFallbackContent(alerts, context)
    }
  }

  /**
   * Genera contenuto con regole (fallback)
   */
  private generateRuleBasedContent(
    alerts: MonitoringAlert[],
    context: NotificationContext
  ): {
    title: string
    message: string
    actions: IntelligentNotification['actions']
  } {
    const alertCount = alerts.length
    const categories = [...new Set(alerts.map(a => a.category))]
    const hasPlantSpecific = alerts.some(a => a.plantId)
    
    let title: string
    let message: string
    const actions: IntelligentNotification['actions'] = []
    
    // Genera titolo
    if (alertCount === 1) {
      title = alerts[0].title
    } else if (categories.length === 1) {
      const categoryName = this.getCategoryDisplayName(categories[0])
      title = `${alertCount} alert ${categoryName}`
    } else {
      title = `${alertCount} alert nel tuo orto`
    }
    
    // Genera messaggio
    if (alertCount === 1) {
      message = alerts[0].message
      
      // Aggiungi azioni suggerite
      alerts[0].suggestedActions.forEach((action, index) => {
        actions.push({
          id: `action-${index}`,
          label: action,
          type: 'task',
          data: { alertId: alerts[0].id, action }
        })
      })
    } else {
      // Raggruppa per categoria
      const categoryMessages: string[] = []
      categories.forEach(category => {
        const categoryAlerts = alerts.filter(a => a.category === category)
        const categoryName = this.getCategoryDisplayName(category)
        categoryMessages.push(`${categoryAlerts.length} ${categoryName}`)
      })
      
      message = `Hai ${categoryMessages.join(', ')} che richiedono attenzione.`
      
      // Azione per vedere tutti gli alert
      actions.push({
        id: 'view-all',
        label: 'Vedi tutti gli alert',
        type: 'navigation',
        data: { route: '/app/monitoring', alertIds: alerts.map(a => a.id) }
      })
    }
    
    // Personalizza per livello esperienza
    if (context.user.experience === 'beginner') {
      message += ' Controlla la sezione Monitoraggio per dettagli e suggerimenti.'
    }
    
    return { title, message, actions }
  }

  /**
   * Genera contenuto di fallback
   */
  private generateFallbackContent(
    alerts: MonitoringAlert[],
    context: NotificationContext
  ): {
    title: string
    message: string
    actions: IntelligentNotification['actions']
  } {
    return {
      title: `${alerts.length} alert nel tuo orto`,
      message: 'Controlla la sezione Monitoraggio per i dettagli.',
      actions: [{
        id: 'view-monitoring',
        label: 'Vai al Monitoraggio',
        type: 'navigation',
        data: { route: '/app/monitoring' }
      }]
    }
  }

  /**
   * Ottimizza timing e priorità delle notifiche
   */
  private async optimizeNotifications(
    notifications: IntelligentNotification[],
    context: NotificationContext
  ): Promise<IntelligentNotification[]> {
    // Ordina per priorità
    notifications.sort((a, b) => a.priority - b.priority)
    
    // Applica rate limiting
    const maxPerDay = context.user.preferences.maxNotificationsPerDay
    if (notifications.length > maxPerDay) {
      // Mantieni solo le più prioritarie
      notifications.splice(maxPerDay)
    }
    
    // Raggruppa digest se necessario
    const digestNotifications = notifications.filter(n => n.type === 'digest')
    if (digestNotifications.length > 1) {
      const combinedDigest = this.combineDigestNotifications(
        digestNotifications,
        context
      )
      
      // Rimuovi digest individuali e aggiungi quello combinato
      const nonDigest = notifications.filter(n => n.type !== 'digest')
      notifications.splice(0, notifications.length, ...nonDigest, combinedDigest)
    }
    
    // Ottimizza timing
    notifications.forEach(notification => {
      if (notification.type === 'scheduled') {
        notification.scheduledFor = this.calculateOptimalSendTime(context)
      }
    })
    
    return notifications
  }

  /**
   * Combina notifiche digest
   */
  private combineDigestNotifications(
    digestNotifications: IntelligentNotification[],
    context: NotificationContext
  ): IntelligentNotification {
    const totalAlerts = digestNotifications.reduce(
      (sum, n) => sum + (n.metadata?.alertCount || 1), 0
    )
    
    const digestPriority = Math.min(...digestNotifications.map(n => n.priority)) as IntelligentNotification['priority']
    
    return {
      id: `digest-${Date.now()}`,
      userId: context.user.id,
      gardenId: context.garden.id,
      type: 'digest',
      priority: digestPriority,
      category: 'informational',
      title: `Riepilogo giornaliero: ${totalAlerts} alert`,
      message: `Il tuo orto ha ${totalAlerts} situazioni che richiedono attenzione.`,
      actionable: true,
      actions: [{
        id: 'view-digest',
        label: 'Vedi riepilogo completo',
        type: 'navigation',
        data: { route: '/app/monitoring' }
      }],
      context: {
        alertIds: digestNotifications.flatMap(n => n.context.alertIds || [])
      },
      aiGenerated: false, // titolo/messaggio da template, nessuna chiamata AI
      scheduledFor: this.calculateDigestSendTime(context),
      metadata: {
        combinedNotifications: digestNotifications.length,
        totalAlerts,
        generatedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Calcola tempo ottimale per invio
   */
  private calculateOptimalSendTime(context: NotificationContext): string {
    const now = new Date()
    const userTz = context.user.timezone || 'Europe/Rome'
    
    // Converti in timezone utente
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTz }))
    const hour = userTime.getHours()
    
    // Evita quiet hours
    const quietStart = parseInt(context.user.preferences.quietHours.start.split(':')[0])
    const quietEnd = parseInt(context.user.preferences.quietHours.end.split(':')[0])
    
    if (hour >= quietStart || hour < quietEnd) {
      // Programma per dopo le quiet hours
      const nextSendTime = new Date(userTime)
      nextSendTime.setHours(quietEnd, 0, 0, 0)
      
      if (nextSendTime <= userTime) {
        nextSendTime.setDate(nextSendTime.getDate() + 1)
      }
      
      return nextSendTime.toISOString()
    }
    
    // Ottimizza per momento della giornata
    if (hour < 8) {
      // Troppo presto, programma per le 8
      const sendTime = new Date(userTime)
      sendTime.setHours(8, 0, 0, 0)
      return sendTime.toISOString()
    }
    
    if (hour > 20) {
      // Troppo tardi, programma per domani mattina
      const sendTime = new Date(userTime)
      sendTime.setDate(sendTime.getDate() + 1)
      sendTime.setHours(8, 0, 0, 0)
      return sendTime.toISOString()
    }
    
    // Orario buono, invia subito
    return now.toISOString()
  }

  /**
   * Calcola tempo per digest
   */
  private calculateDigestSendTime(context: NotificationContext): string {
    const now = new Date()
    const userTz = context.user.timezone || 'Europe/Rome'
    const digestTime = context.user.preferences.digestTime || '08:00'
    
    const [hour, minute] = digestTime.split(':').map(Number)
    
    const sendTime = new Date(now.toLocaleString('en-US', { timeZone: userTz }))
    sendTime.setHours(hour, minute, 0, 0)
    
    // Se l'orario è già passato oggi, programma per domani
    if (sendTime <= now) {
      sendTime.setDate(sendTime.getDate() + 1)
    }
    
    return sendTime.toISOString()
  }

  /**
   * Programma invio notifica
   */
  private async scheduleNotification(
    notification: IntelligentNotification,
    context: NotificationContext,
    supabaseClient: any
  ): Promise<void> {
    const notificationData: NotificationData = {
      userId: context.user.id,
      userEmail: context.user.email,
      type: this.mapToNotificationType(notification.category),
      subject: notification.title,
      templateData: {
        title: notification.title,
        message: notification.message,
        actions: notification.actions,
        gardenName: context.garden.name,
        priority: notification.priority,
        aiGenerated: notification.aiGenerated,
      },
    }
    const result = await sendNotification(notificationData, supabaseClient, {
      gardenId: context.garden.id,
      scheduledFor: notification.type === 'immediate'
        ? new Date().toISOString()
        : notification.scheduledFor,
      idempotencyKey: `${context.user.id}:${context.garden.id}:${notification.id}:email`,
    })
    if (!result.success) {
      throw new Error(result.error || 'notification_enqueue_failed')
    }
    this.notifications.set(notification.id, notification)
  }

  /**
   * Invia notifica immediatamente
   */
  private async sendNotificationNow(
    notification: IntelligentNotification,
    context: NotificationContext,
    supabaseClient: any
  ): Promise<void> {
    try {
      const notificationData: NotificationData = {
        userId: context.user.id,
        userEmail: context.user.email,
        type: this.mapToNotificationType(notification.category),
        subject: notification.title,
        templateData: {
          title: notification.title,
          message: notification.message,
          actions: notification.actions,
          gardenName: context.garden.name,
          priority: notification.priority,
          aiGenerated: notification.aiGenerated
        }
      }

      const result = await sendNotification(notificationData, supabaseClient)

      if (result.success) {
        notification.sentAt = new Date().toISOString()
      } else {
        console.error(`Notification "${notification.title}" not sent: ${result.error}`)
      }

      this.notifications.set(notification.id, notification)

    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  /**
   * Aggiunge notifica al digest
   */
  private addToDigest(notification: IntelligentNotification, userId: string): void {
    if (!this.pendingDigests.has(userId)) {
      this.pendingDigests.set(userId, [])
    }
    
    this.pendingDigests.get(userId)!.push(notification)
  }

  /**
   * UTILITY FUNCTIONS
   */

  private buildAIPrompt(alerts: MonitoringAlert[], context: NotificationContext): string {
    return `Generate a notification for ${alerts.length} garden alerts...` // TODO: Prompt completo
  }

  private hashPrompt(prompt: string): string {
    // Simple hash per cache
    let hash = 0
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  private mapAlertCategoryToNotificationCategory(
    alertCategory: MonitoringAlert['category']
  ): IntelligentNotification['category'] {
    const mapping: Record<MonitoringAlert['category'], IntelligentNotification['category']> = {
      'health': 'critical',
      'irrigation': 'operational',
      'nutrition': 'operational',
      'weather': 'critical',
      'pest': 'critical',
      'disease': 'critical',
      'harvest': 'informational'
    }
    
    return mapping[alertCategory] || 'informational'
  }

  private mapToNotificationType(category: IntelligentNotification['category']): NotificationType {
    const mapping: Record<IntelligentNotification['category'], NotificationType> = {
      'critical': 'weather_alert',
      'operational': 'task_reminder',
      'informational': 'harvest_logged',
      'educational': 'fertilization-suggested'
    }
    
    return mapping[category] || 'task_reminder'
  }

  private getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      'health': 'di salute',
      'irrigation': 'di irrigazione',
      'nutrition': 'di nutrizione',
      'weather': 'meteo',
      'pest': 'di parassiti',
      'disease': 'di malattie',
      'harvest': 'di raccolta'
    }
    
    return names[category] || category
  }

  /**
   * API PUBBLICHE
   */

  /**
   * Ottiene tutte le notifiche per un utente
   */
  getUserNotifications(userId: string): IntelligentNotification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => a.priority - b.priority)
  }

  /**
   * Marca notifica come letta
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId)
    if (notification && !notification.readAt) {
      notification.readAt = new Date().toISOString()
      this.notifications.set(notificationId, notification)
      return true
    }
    return false
  }

  /**
   * Dismisses notifica
   */
  dismissNotification(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId)
    if (notification && !notification.dismissedAt) {
      notification.dismissedAt = new Date().toISOString()
      this.notifications.set(notificationId, notification)
      return true
    }
    return false
  }

  /**
   * Ottiene digest pendenti per un utente
   */
  getPendingDigest(userId: string): IntelligentNotification[] {
    return this.pendingDigests.get(userId) || []
  }

  /**
   * Invia digest giornaliero
   */
  async sendDailyDigest(userId: string, context: NotificationContext, supabaseClient: any): Promise<boolean> {
    const pendingNotifications = this.getPendingDigest(userId)

    if (pendingNotifications.length === 0) {
      return false
    }

    const digestNotification = this.combineDigestNotifications(
      pendingNotifications,
      context
    )

    await this.sendNotificationNow(digestNotification, context, supabaseClient)
    
    // Pulisci digest pendenti
    this.pendingDigests.delete(userId)
    
    return true
  }
}

/**
 * SINGLETON
 */
export const intelligentNotificationService = new IntelligentNotificationService()
