/**
 * Integrated Challenge Service
 * Servizio per gestire challenge integrate con il calendario e i task
 */

import { GardenTask } from '../types'
import { format, isSameDay, parseISO, startOfDay, endOfDay } from 'date-fns'

export interface ChallengeAction {
  id: string
  description: string
  completed: boolean
  linkedTaskId?: string
  type: 'task' | 'photo' | 'note' | 'measurement'
  requiredValue?: string | number
}

export interface DailyChallenge {
  id: string
  date: string
  title: string
  description: string
  type: 'task' | 'photo' | 'harvest' | 'learning' | 'social' | 'maintenance'
  difficulty: 'easy' | 'medium' | 'hard'
  xp: number
  badge?: {
    emoji: string
    name: string
    description: string
  }
  actions: ChallengeAction[]
  completed: boolean
  completedAt?: string
  progress: number // 0-100
}

export interface ChallengeTemplate {
  id: string
  title: string
  description: string
  type: DailyChallenge['type']
  difficulty: DailyChallenge['difficulty']
  xp: number
  badge?: DailyChallenge['badge']
  conditions: {
    taskTypes?: string[]
    plantTypes?: string[]
    minTasks?: number
    season?: string[]
    dayOfWeek?: number[]
  }
  actionTemplates: Omit<ChallengeAction, 'id' | 'completed'>[]
}

class IntegratedChallengeService {
  private challengeTemplates: ChallengeTemplate[] = [
    // Task-based challenges
    {
      id: 'sowing-master',
      title: '🌱 Maestro Seminatore',
      description: 'Completa tutte le semine pianificate e documenta il processo',
      type: 'task',
      difficulty: 'medium',
      xp: 150,
      badge: {
        emoji: '🌱',
        name: 'Seminatore del Giorno',
        description: 'Hai completato tutte le semine con documentazione'
      },
      conditions: {
        taskTypes: ['Sowing'],
        minTasks: 1
      },
      actionTemplates: [
        {
          description: 'Completa tutte le semine pianificate',
          type: 'task',
          linkedTaskId: 'auto'
        },
        {
          description: 'Scatta foto del terreno preparato',
          type: 'photo'
        },
        {
          description: 'Annota varietà e profondità di semina',
          type: 'note'
        }
      ]
    },
    {
      id: 'harvest-expert',
      title: '🥕 Raccoglitore Esperto',
      description: 'Raccogli tutto quello che è pronto e registra peso e qualità',
      type: 'harvest',
      difficulty: 'easy',
      xp: 100,
      badge: {
        emoji: '🥕',
        name: 'Raccoglitore del Giorno',
        description: 'Hai completato tutti i raccolti con precisione'
      },
      conditions: {
        taskTypes: ['Harvest'],
        minTasks: 1
      },
      actionTemplates: [
        {
          description: 'Completa tutti i raccolti pianificati',
          type: 'task',
          linkedTaskId: 'auto'
        },
        {
          description: 'Pesa e registra il raccolto (kg)',
          type: 'measurement',
          requiredValue: 0.1
        },
        {
          description: 'Valuta la qualità del prodotto',
          type: 'note'
        }
      ]
    },
    {
      id: 'watering-perfect',
      title: '💧 Irrigatore Perfetto',
      description: 'Completa l\'irrigazione e monitora l\'umidità del suolo',
      type: 'task',
      difficulty: 'easy',
      xp: 75,
      conditions: {
        taskTypes: ['Watering'],
        minTasks: 1
      },
      actionTemplates: [
        {
          description: 'Completa tutte le irrigazioni',
          type: 'task',
          linkedTaskId: 'auto'
        },
        {
          description: 'Controlla umidità del suolo',
          type: 'note'
        }
      ]
    },
    {
      id: 'maintenance-hero',
      title: '🔧 Eroe della Manutenzione',
      description: 'Completa tutte le attività di manutenzione dell\'orto',
      type: 'maintenance',
      difficulty: 'medium',
      xp: 125,
      badge: {
        emoji: '🔧',
        name: 'Manutentore Esperto',
        description: 'Hai mantenuto l\'orto in perfette condizioni'
      },
      conditions: {
        taskTypes: ['Pruning', 'Weeding', 'Mulching', 'Staking'],
        minTasks: 2
      },
      actionTemplates: [
        {
          description: 'Completa tutte le attività di manutenzione',
          type: 'task',
          linkedTaskId: 'auto'
        },
        {
          description: 'Scatta foto prima e dopo',
          type: 'photo'
        },
        {
          description: 'Annota miglioramenti osservati',
          type: 'note'
        }
      ]
    },
    // Learning challenges (for days without tasks)
    {
      id: 'garden-observer',
      title: '👁️ Osservatore Attento',
      description: 'Fai un giro dell\'orto e documenta lo stato delle piante',
      type: 'learning',
      difficulty: 'easy',
      xp: 50,
      conditions: {
        minTasks: 0 // For days without tasks
      },
      actionTemplates: [
        {
          description: 'Fai un giro completo dell\'orto',
          type: 'note'
        },
        {
          description: 'Scatta 3 foto di piante diverse',
          type: 'photo'
        },
        {
          description: 'Annota cambiamenti osservati',
          type: 'note'
        }
      ]
    },
    {
      id: 'strategic-planner',
      title: '📋 Pianificatore Strategico',
      description: 'Pianifica le attività della prossima settimana',
      type: 'learning',
      difficulty: 'medium',
      xp: 100,
      conditions: {
        minTasks: 0,
        dayOfWeek: [0, 6] // Weekend
      },
      actionTemplates: [
        {
          description: 'Rivedi il calendario della settimana',
          type: 'note'
        },
        {
          description: 'Aggiungi 2 nuovi task',
          type: 'task'
        },
        {
          description: 'Controlla previsioni meteo',
          type: 'note'
        }
      ]
    },
    {
      id: 'photo-documentarian',
      title: '📷 Documentarista dell\'Orto',
      description: 'Crea un diario fotografico del progresso delle piante',
      type: 'photo',
      difficulty: 'easy',
      xp: 75,
      badge: {
        emoji: '📷',
        name: 'Fotografo dell\'Orto',
        description: 'Hai documentato perfettamente il tuo orto'
      },
      conditions: {
        minTasks: 0
      },
      actionTemplates: [
        {
          description: 'Scatta 5 foto di alta qualità',
          type: 'photo'
        },
        {
          description: 'Aggiungi descrizioni alle foto',
          type: 'note'
        },
        {
          description: 'Confronta con foto precedenti',
          type: 'note'
        }
      ]
    }
  ]

  /**
   * Genera challenge intelligenti per una data specifica
   */
  generateChallengeForDate(date: Date, tasks: GardenTask[]): DailyChallenge {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayOfWeek = date.getDay()
    
    // Filtra task per la data
    const dayTasks = tasks.filter(task => {
      const taskDate = task.suggestedDate ? parseISO(task.suggestedDate) : parseISO(task.date)
      return isSameDay(taskDate, date)
    })

    // Trova template appropriato
    const template = this.findBestTemplate(dayTasks, dayOfWeek)
    
    // Genera challenge dal template
    return this.createChallengeFromTemplate(template, dateStr, dayTasks)
  }

  /**
   * Trova il miglior template per i task del giorno
   */
  private findBestTemplate(dayTasks: GardenTask[], dayOfWeek: number): ChallengeTemplate {
    // Priorità ai template che matchano i task esistenti
    for (const template of this.challengeTemplates) {
      if (this.templateMatches(template, dayTasks, dayOfWeek)) {
        return template
      }
    }

    // Fallback a challenge generiche
    const fallbackTemplates = this.challengeTemplates.filter(t => 
      t.conditions.minTasks === 0
    )
    
    // Preferisci challenge weekend nei weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const weekendTemplate = fallbackTemplates.find(t => 
        t.conditions.dayOfWeek?.includes(dayOfWeek)
      )
      if (weekendTemplate) return weekendTemplate
    }

    return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)]
  }

  /**
   * Verifica se un template matcha le condizioni
   */
  private templateMatches(template: ChallengeTemplate, dayTasks: GardenTask[], dayOfWeek: number): boolean {
    const { conditions } = template

    // Verifica numero minimo task
    if (conditions.minTasks && dayTasks.length < conditions.minTasks) {
      return false
    }

    // Verifica tipi di task
    if (conditions.taskTypes && conditions.taskTypes.length > 0) {
      const hasMatchingTask = dayTasks.some(task => 
        conditions.taskTypes!.includes(task.taskType)
      )
      if (!hasMatchingTask) return false
    }

    // Verifica giorno della settimana
    if (conditions.dayOfWeek && !conditions.dayOfWeek.includes(dayOfWeek)) {
      return false
    }

    return true
  }

  /**
   * Crea challenge da template
   */
  private createChallengeFromTemplate(
    template: ChallengeTemplate, 
    dateStr: string, 
    dayTasks: GardenTask[]
  ): DailyChallenge {
    const actions: ChallengeAction[] = template.actionTemplates.map((actionTemplate, index) => {
      let linkedTaskId: string | undefined

      // Collega automaticamente ai task del giorno se richiesto
      if (actionTemplate.linkedTaskId === 'auto' && actionTemplate.type === 'task') {
        const matchingTask = dayTasks.find(task => 
          template.conditions.taskTypes?.includes(task.taskType)
        )
        linkedTaskId = matchingTask?.id
      }

      return {
        id: `${template.id}-action-${index}`,
        description: this.personalizeActionDescription(actionTemplate.description, dayTasks),
        completed: false,
        linkedTaskId,
        type: actionTemplate.type,
        requiredValue: actionTemplate.requiredValue
      }
    })

    return {
      id: `${template.id}-${dateStr}`,
      date: dateStr,
      title: template.title,
      description: this.personalizeDescription(template.description, dayTasks),
      type: template.type,
      difficulty: template.difficulty,
      xp: template.xp,
      badge: template.badge,
      actions,
      completed: false,
      progress: 0
    }
  }

  /**
   * Personalizza descrizione challenge
   */
  private personalizeDescription(description: string, dayTasks: GardenTask[]): string {
    if (dayTasks.length === 0) return description

    const taskTypes = [...new Set(dayTasks.map(t => t.taskType))]
    const plantNames = [...new Set(dayTasks.map(t => t.plantName))]

    let personalized = description

    // Sostituisci placeholder con dati reali
    if (taskTypes.length === 1) {
      personalized = personalized.replace(/tutte le semine/g, `${dayTasks.length} semine`)
      personalized = personalized.replace(/tutti i raccolti/g, `${dayTasks.length} raccolti`)
    }

    if (plantNames.length <= 3) {
      personalized += ` (${plantNames.join(', ')})`
    }

    return personalized
  }

  /**
   * Personalizza descrizione azione
   */
  private personalizeActionDescription(description: string, dayTasks: GardenTask[]): string {
    const taskCount = dayTasks.length
    
    if (taskCount > 0) {
      description = description.replace(/tutte le semine pianificate/g, `${taskCount} semine`)
      description = description.replace(/tutti i raccolti pianificati/g, `${taskCount} raccolti`)
      description = description.replace(/tutte le irrigazioni/g, `${taskCount} irrigazioni`)
      description = description.replace(/tutte le attività di manutenzione/g, `${taskCount} attività`)
    }

    return description
  }

  /**
   * Aggiorna progresso challenge
   */
  updateChallengeProgress(challenge: DailyChallenge): DailyChallenge {
    const completedActions = challenge.actions.filter(a => a.completed).length
    const totalActions = challenge.actions.length
    const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0
    const completed = progress === 100

    return {
      ...challenge,
      progress,
      completed,
      completedAt: completed && !challenge.completedAt ? new Date().toISOString() : challenge.completedAt
    }
  }

  /**
   * Completa azione challenge
   */
  completeAction(challenge: DailyChallenge, actionId: string): DailyChallenge {
    const updatedActions = challenge.actions.map(action =>
      action.id === actionId ? { ...action, completed: true } : action
    )

    const updatedChallenge = {
      ...challenge,
      actions: updatedActions
    }

    return this.updateChallengeProgress(updatedChallenge)
  }

  /**
   * Genera challenge per un mese
   */
  generateMonthChallenges(year: number, month: number, tasks: GardenTask[]): DailyChallenge[] {
    const challenges: DailyChallenge[] = []
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const challenge = this.generateChallengeForDate(date, tasks)
      challenges.push(challenge)
    }

    return challenges
  }

  /**
   * Calcola statistiche challenge
   */
  calculateChallengeStats(challenges: DailyChallenge[]) {
    const total = challenges.length
    const completed = challenges.filter(c => c.completed).length
    const totalXP = challenges.reduce((sum, c) => sum + (c.completed ? c.xp : 0), 0)
    const averageProgress = challenges.reduce((sum, c) => sum + c.progress, 0) / total

    const byType = challenges.reduce((acc, challenge) => {
      acc[challenge.type] = (acc[challenge.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byDifficulty = challenges.reduce((acc, challenge) => {
      acc[challenge.difficulty] = (acc[challenge.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      completed,
      completionRate: (completed / total) * 100,
      totalXP,
      averageProgress,
      byType,
      byDifficulty,
      streak: this.calculateStreak(challenges)
    }
  }

  /**
   * Calcola streak corrente
   */
  private calculateStreak(challenges: DailyChallenge[]): number {
    const sortedChallenges = challenges
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const challenge of sortedChallenges) {
      const challengeDate = new Date(challenge.date)
      challengeDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate.getTime() - challengeDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
        currentDate = challengeDate
      } else {
        break
      }
    }

    return streak
  }
}

export const integratedChallengeService = new IntegratedChallengeService()