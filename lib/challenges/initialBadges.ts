/**
 * Initial Badges System
 * Sistema per assegnare badge iniziali agli utenti
 */

import { awardBadge, BadgeInfo } from './badgeSystem'

// Badge iniziali che ogni utente dovrebbe avere
const INITIAL_BADGES: Omit<BadgeInfo, 'earned_at'>[] = [
  {
    id: 'welcome_ortomio',
    nome: 'Benvenuto in OrtoMio',
    emoji: '🌱',
    descrizione: 'Hai iniziato il tuo viaggio in OrtoMio!'
  },
  {
    id: 'first_login',
    nome: 'Primo Accesso',
    emoji: '🚪',
    descrizione: 'Hai effettuato il primo accesso all\'app'
  },
  {
    id: 'explorer',
    nome: 'Esploratore',
    emoji: '🔍',
    descrizione: 'Hai esplorato le funzionalità di OrtoMio'
  }
]

// Badge basati su attività comuni
const ACTIVITY_BADGES: Omit<BadgeInfo, 'earned_at'>[] = [
  {
    id: 'first_task',
    nome: 'Prima Attività',
    emoji: '✅',
    descrizione: 'Hai completato la tua prima attività'
  },
  {
    id: 'planner_user',
    nome: 'Pianificatore',
    emoji: '📋',
    descrizione: 'Hai usato il Planner AI'
  },
  {
    id: 'garden_manager',
    nome: 'Gestore Orto',
    emoji: '🏡',
    descrizione: 'Hai configurato il tuo orto'
  }
]

/**
 * Assegna badge iniziali a un utente
 */
export async function assignInitialBadges(userId: string): Promise<void> {
  try {
    for (const badge of INITIAL_BADGES) {
      await awardBadge(userId, badge)
    }
    console.log(`✅ Badge iniziali assegnati a ${userId}`)
  } catch (error) {
    console.error('Errore assegnazione badge iniziali:', error)
  }
}

/**
 * Assegna badge basati su attività
 */
export async function assignActivityBadges(userId: string, activities: string[]): Promise<void> {
  try {
    for (const activity of activities) {
      const badge = ACTIVITY_BADGES.find(b => b.id === activity)
      if (badge) {
        await awardBadge(userId, badge)
      }
    }
  } catch (error) {
    console.error('Errore assegnazione badge attività:', error)
  }
}

/**
 * Controlla e assegna badge automaticamente
 */
export async function checkAndAssignBadges(userId: string, context?: {
  hasCompletedTasks?: boolean
  hasUsedPlanner?: boolean
  hasConfiguredGarden?: boolean
}): Promise<void> {
  try {
    // Assegna sempre badge iniziali
    await assignInitialBadges(userId)
    
    // Assegna badge basati su contesto
    const activities: string[] = []
    
    if (context?.hasCompletedTasks) {
      activities.push('first_task')
    }
    
    if (context?.hasUsedPlanner) {
      activities.push('planner_user')
    }
    
    if (context?.hasConfiguredGarden) {
      activities.push('garden_manager')
    }
    
    await assignActivityBadges(userId, activities)
    
  } catch (error) {
    console.error('Errore controllo badge automatici:', error)
  }
}

/**
 * Badge stagionali (gennaio 2026)
 */
export const SEASONAL_BADGES: Omit<BadgeInfo, 'earned_at'>[] = [
  {
    id: 'january_2026',
    nome: 'Gennaio 2026',
    emoji: '❄️',
    descrizione: 'Hai iniziato l\'anno con OrtoMio!'
  },
  {
    id: 'winter_gardener',
    nome: 'Ortolano Invernale',
    emoji: '🧥',
    descrizione: 'Coltivi anche in inverno!'
  },
  {
    id: 'new_year_resolution',
    nome: 'Buoni Propositi',
    emoji: '🎯',
    descrizione: 'OrtoMio è il tuo proposito per il 2026!'
  }
]

/**
 * Assegna badge stagionali
 */
export async function assignSeasonalBadges(userId: string): Promise<void> {
  try {
    const currentMonth = new Date().getMonth() // 0 = gennaio
    const currentYear = new Date().getFullYear()
    
    if (currentMonth === 0 && currentYear === 2026) {
      // Gennaio 2026 - assegna badge stagionali
      for (const badge of SEASONAL_BADGES) {
        await awardBadge(userId, badge)
      }
      console.log(`✅ Badge stagionali gennaio 2026 assegnati a ${userId}`)
    }
  } catch (error) {
    console.error('Errore assegnazione badge stagionali:', error)
  }
}