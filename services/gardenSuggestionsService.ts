/**
 * Garden Suggestions Service
 * Genera suggerimenti intelligenti e dinamici per il giardino
 * basati su dati reali, stagione, meteo e stato delle piante
 */

import { Garden, GardenTask } from '@/types'

export interface SmartSuggestion {
  id: string
  type: 'urgent' | 'optimal' | 'seasonal' | 'weather' | 'maintenance'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes: number
  icon: string
  actionable: boolean
  dueDate?: string
  conditions?: string[]
}

export class GardenSuggestionsService {
  
  /**
   * Genera suggerimenti intelligenti basati su contesto completo
   */
  static generateSmartSuggestions(
    garden: Garden,
    tasks: GardenTask[],
    currentTime: Date = new Date()
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    const hour = currentTime.getHours()
    const month = currentTime.getMonth() + 1
    const dayOfYear = this.getDayOfYear(currentTime)
    
    // Analizza stato task
    const overdueTasks = this.getOverdueTasks(tasks, currentTime)
    const todayTasks = this.getTodayTasks(tasks, currentTime)
    const upcomingTasks = this.getUpcomingTasks(tasks, currentTime)
    
    // 1. SUGGERIMENTI URGENTI
    suggestions.push(...this.generateUrgentSuggestions(overdueTasks, todayTasks))
    
    // 2. SUGGERIMENTI OTTIMALI BASATI SU ORARIO
    suggestions.push(...this.generateTimeBasedSuggestions(hour, garden))
    
    // 3. SUGGERIMENTI STAGIONALI
    suggestions.push(...this.generateSeasonalSuggestions(month, dayOfYear, garden))
    
    // 4. SUGGERIMENTI METEO-DIPENDENTI
    suggestions.push(...this.generateWeatherBasedSuggestions(garden, currentTime))
    
    // 5. SUGGERIMENTI MANUTENZIONE
    suggestions.push(...this.generateMaintenanceSuggestions(garden, tasks, currentTime))
    
    // Ordina per priorità e rilevanza
    return this.prioritizeSuggestions(suggestions, currentTime).slice(0, 4)
  }
  
  private static generateUrgentSuggestions(
    overdueTasks: GardenTask[],
    todayTasks: GardenTask[]
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    if (overdueTasks.length > 0) {
      suggestions.push({
        id: 'urgent-overdue',
        type: 'urgent',
        title: `${overdueTasks.length} task in ritardo`,
        description: `Completa le attività scadute: ${overdueTasks.slice(0, 2).map(t => t.taskType).join(', ')}`,
        priority: 'high',
        estimatedMinutes: overdueTasks.length * 15,
        icon: '⚠️',
        actionable: true,
        conditions: ['Task scaduti richiedono attenzione immediata']
      })
    }
    
    if (todayTasks.length > 3) {
      suggestions.push({
        id: 'busy-day',
        type: 'urgent',
        title: 'Giornata intensa',
        description: `${todayTasks.length} task programmati oggi. Inizia presto per completare tutto`,
        priority: 'medium',
        estimatedMinutes: todayTasks.length * 20,
        icon: '📋',
        actionable: true,
        conditions: ['Molti task programmati per oggi']
      })
    }
    
    return suggestions
  }
  
  private static generateTimeBasedSuggestions(
    hour: number,
    garden: Garden
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // MATTINA (6-10): Irrigazione e controlli
    if (hour >= 6 && hour <= 10) {
      suggestions.push({
        id: 'morning-watering',
        type: 'optimal',
        title: 'Irrigazione mattutina',
        description: 'Momento ideale per innaffiare - temperatura fresca, assorbimento ottimale',
        priority: 'high',
        estimatedMinutes: 20,
        icon: '💧',
        actionable: true,
        conditions: ['Temperatura fresca', 'Evaporazione minima', 'Assorbimento ottimale']
      })
      
      suggestions.push({
        id: 'morning-inspection',
        type: 'optimal',
        title: 'Controllo mattutino',
        description: 'Ispeziona le piante per danni notturni, parassiti o malattie',
        priority: 'medium',
        estimatedMinutes: 15,
        icon: '🔍',
        actionable: true,
        conditions: ['Luce naturale ottimale', 'Piante riposate']
      })
    }
    
    // MEZZOGIORNO (11-14): Evitare stress
    if (hour >= 11 && hour <= 14) {
      suggestions.push({
        id: 'midday-rest',
        type: 'optimal',
        title: 'Pausa dalle attività intensive',
        description: 'Evita trapianti e potature. Momento ideale per pianificazione e pulizia attrezzi',
        priority: 'low',
        estimatedMinutes: 30,
        icon: '☀️',
        actionable: false,
        conditions: ['Sole intenso', 'Stress termico per piante']
      })
    }
    
    // SERA (16-19): Attività intensive
    if (hour >= 16 && hour <= 19) {
      suggestions.push({
        id: 'evening-activities',
        type: 'optimal',
        title: 'Attività serali',
        description: 'Momento perfetto per trapianti, potature e raccolta',
        priority: 'high',
        estimatedMinutes: 45,
        icon: '🌅',
        actionable: true,
        conditions: ['Temperatura mite', 'Luce sufficiente', 'Piante meno stressate']
      })
      
      suggestions.push({
        id: 'evening-harvest',
        type: 'optimal',
        title: 'Raccolta serale',
        description: 'Raccogli ortaggi a foglia e erbe aromatiche per massimo sapore',
        priority: 'medium',
        estimatedMinutes: 25,
        icon: '🥬',
        actionable: true,
        conditions: ['Concentrazione oli essenziali massima']
      })
    }
    
    return suggestions
  }
  
  private static generateSeasonalSuggestions(
    month: number,
    dayOfYear: number,
    garden: Garden
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // INVERNO (Dic-Feb)
    if (month === 12 || month <= 2) {
      suggestions.push({
        id: 'winter-planning',
        type: 'seasonal',
        title: 'Pianificazione invernale',
        description: 'Progetta la prossima stagione, ordina semi, prepara semenzaio',
        priority: 'medium',
        estimatedMinutes: 60,
        icon: '📋',
        actionable: true,
        conditions: ['Stagione di riposo', 'Tempo per pianificazione']
      })
      
      if (garden.gardenType === 'Greenhouse') {
        suggestions.push({
          id: 'greenhouse-winter',
          type: 'seasonal',
          title: 'Coltivazioni in serra',
          description: 'Semina lattuga, spinaci, ravanelli per raccolti invernali',
          priority: 'high',
          estimatedMinutes: 40,
          icon: '🏠',
          actionable: true,
          conditions: ['Serra protetta', 'Crescita lenta ma costante']
        })
      }
    }
    
    // PRIMAVERA (Mar-Mag)
    if (month >= 3 && month <= 5) {
      suggestions.push({
        id: 'spring-sowing',
        type: 'seasonal',
        title: 'Semine primaverili',
        description: 'Semina pomodori, peperoni, melanzane in semenzaio protetto',
        priority: 'high',
        estimatedMinutes: 45,
        icon: '🌱',
        actionable: true,
        conditions: ['Temperature in aumento', 'Giorni più lunghi']
      })
      
      // Suggerimento specifico per metà marzo
      if (month === 3 && dayOfYear >= 75) {
        suggestions.push({
          id: 'spring-soil-prep',
          type: 'seasonal',
          title: 'Preparazione terreno',
          description: 'Lavora il terreno, aggiungi compost, prepara aiuole per trapianti',
          priority: 'high',
          estimatedMinutes: 90,
          icon: '🚜',
          actionable: true,
          conditions: ['Terreno non più gelato', 'Umidità ottimale']
        })
      }
    }
    
    // ESTATE (Giu-Ago)
    if (month >= 6 && month <= 8) {
      suggestions.push({
        id: 'summer-harvest',
        type: 'seasonal',
        title: 'Raccolta estiva',
        description: 'Controlla maturazione pomodori, zucchine, peperoni ogni 2-3 giorni',
        priority: 'high',
        estimatedMinutes: 30,
        icon: '🍅',
        actionable: true,
        conditions: ['Picco produttivo', 'Maturazione rapida']
      })
      
      suggestions.push({
        id: 'summer-watering',
        type: 'seasonal',
        title: 'Irrigazione estiva',
        description: 'Aumenta frequenza irrigazione, controlla pacciamatura',
        priority: 'high',
        estimatedMinutes: 25,
        icon: '💧',
        actionable: true,
        conditions: ['Evaporazione elevata', 'Stress idrico']
      })
    }
    
    // AUTUNNO (Set-Nov)
    if (month >= 9 && month <= 11) {
      suggestions.push({
        id: 'autumn-sowing',
        type: 'seasonal',
        title: 'Semine autunnali',
        description: 'Semina ortaggi invernali: cavoli, porri, fave, piselli',
        priority: 'high',
        estimatedMinutes: 50,
        icon: '🍂',
        actionable: true,
        conditions: ['Temperature miti', 'Crescita lenta ma robusta']
      })
      
      suggestions.push({
        id: 'autumn-cleanup',
        type: 'seasonal',
        title: 'Pulizia autunnale',
        description: 'Rimuovi piante esaurite, prepara compost, proteggi piante sensibili',
        priority: 'medium',
        estimatedMinutes: 75,
        icon: '🧹',
        actionable: true,
        conditions: ['Fine ciclo estivo', 'Preparazione inverno']
      })
    }
    
    return suggestions
  }
  
  private static generateWeatherBasedSuggestions(
    garden: Garden,
    currentTime: Date
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // Simulazione condizioni meteo (in produzione useresti API meteo reali)
    const month = currentTime.getMonth() + 1
    const isWinter = month === 12 || month <= 2
    const isRainy = Math.random() > 0.7 // 30% probabilità pioggia
    const isWindy = Math.random() > 0.8 // 20% probabilità vento forte
    
    if (isRainy) {
      suggestions.push({
        id: 'rainy-day',
        type: 'weather',
        title: 'Giornata piovosa',
        description: 'Evita irrigazione, controlla drenaggio, lavora in serra o semenzaio',
        priority: 'medium',
        estimatedMinutes: 30,
        icon: '🌧️',
        actionable: true,
        conditions: ['Pioggia prevista', 'Terreno saturo']
      })
    }
    
    if (isWindy) {
      suggestions.push({
        id: 'windy-day',
        type: 'weather',
        title: 'Vento forte',
        description: 'Controlla tutori, proteggi piante giovani, evita trattamenti',
        priority: 'high',
        estimatedMinutes: 20,
        icon: '💨',
        actionable: true,
        conditions: ['Vento oltre 25 km/h', 'Rischio danni meccanici']
      })
    }
    
    if (isWinter && garden.coordinates?.latitude && garden.coordinates.latitude > 45) {
      suggestions.push({
        id: 'frost-protection',
        type: 'weather',
        title: 'Protezione dal gelo',
        description: 'Copri piante sensibili con tessuto non tessuto, svuota annaffiatoi',
        priority: 'high',
        estimatedMinutes: 35,
        icon: '❄️',
        actionable: true,
        conditions: ['Temperature sotto 0°C previste', 'Nord Italia']
      })
    }
    
    return suggestions
  }
  
  private static generateMaintenanceSuggestions(
    garden: Garden,
    tasks: GardenTask[],
    currentTime: Date
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = []
    
    // Controllo se ci sono task di manutenzione recenti (usando 'Treatment' come proxy)
    const lastMaintenanceTask = tasks
      .filter(t => (t.taskType === 'Treatment' || t.taskType === 'Prune') && t.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    
    const daysSinceLastMaintenance = lastMaintenanceTask
      ? Math.floor((currentTime.getTime() - new Date(lastMaintenanceTask.date).getTime()) / (1000 * 60 * 60 * 24))
      : 30
    
    if (daysSinceLastMaintenance > 14) {
      suggestions.push({
        id: 'tool-maintenance',
        type: 'maintenance',
        title: 'Manutenzione attrezzi',
        description: 'Pulisci e affila attrezzi, controlla irrigazione, verifica tutori',
        priority: 'medium',
        estimatedMinutes: 45,
        icon: '🔧',
        actionable: true,
        conditions: [`${daysSinceLastMaintenance} giorni dall'ultima manutenzione`]
      })
    }
    
    // Controllo compost (usando 'Fertilize' come proxy per compost)
    const lastCompostTask = tasks
      .filter(t => t.taskType === 'Fertilize' && t.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    
    const daysSinceCompost = lastCompostTask
      ? Math.floor((currentTime.getTime() - new Date(lastCompostTask.date).getTime()) / (1000 * 60 * 60 * 24))
      : 21
    
    if (daysSinceCompost > 20) {
      suggestions.push({
        id: 'compost-turn',
        type: 'maintenance',
        title: 'Gestione compost',
        description: 'Gira il compost, aggiungi materiale secco se necessario, controlla umidità',
        priority: 'low',
        estimatedMinutes: 25,
        icon: '♻️',
        actionable: true,
        conditions: [`${daysSinceCompost} giorni dall'ultimo controllo`]
      })
    }
    
    return suggestions
  }
  
  private static prioritizeSuggestions(
    suggestions: SmartSuggestion[],
    currentTime: Date
  ): SmartSuggestion[] {
    const hour = currentTime.getHours()
    
    return suggestions.sort((a, b) => {
      // Priorità per tipo
      const typeWeight = {
        urgent: 100,
        optimal: 80,
        weather: 70,
        seasonal: 60,
        maintenance: 40
      }
      
      // Priorità per livello
      const priorityWeight = {
        high: 30,
        medium: 20,
        low: 10
      }
      
      // Bonus per orario appropriato
      let timeBonus = 0
      if (a.type === 'optimal') {
        if ((hour >= 6 && hour <= 10) || (hour >= 16 && hour <= 19)) {
          timeBonus = 20
        }
      }
      
      const scoreA = typeWeight[a.type] + priorityWeight[a.priority] + timeBonus
      const scoreB = typeWeight[b.type] + priorityWeight[b.priority]
      
      return scoreB - scoreA
    })
  }
  
  // Utility methods
  private static getOverdueTasks(tasks: GardenTask[], currentTime: Date): GardenTask[] {
    const today = currentTime.toISOString().split('T')[0]
    return tasks.filter(t => !t.completed && t.date < today)
  }
  
  private static getTodayTasks(tasks: GardenTask[], currentTime: Date): GardenTask[] {
    const today = currentTime.toISOString().split('T')[0]
    return tasks.filter(t => !t.completed && t.date === today)
  }
  
  private static getUpcomingTasks(tasks: GardenTask[], currentTime: Date): GardenTask[] {
    const today = currentTime.toISOString().split('T')[0]
    const nextWeek = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    return tasks.filter(t => !t.completed && t.date > today && t.date <= nextWeek)
  }
  
  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
}