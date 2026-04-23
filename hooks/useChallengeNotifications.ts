/**
 * useChallengeNotifications Hook
 * Gestisce le notifiche contestuali dei challenge quando l'utente completa azioni
 */

import { useState, useCallback } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'

export interface ChallengeProgress {
  challengeId: string
  title: string
  progress: { current: number; target: number }
  badge?: { emoji: string; name: string }
  message: string
  isCompleted: boolean
}

export type ChallengeAction = 'sowing' | 'harvest' | 'photo' | 'task_complete' | 'treatment' | 'fertilize'

/**
 * Hook per gestire le notifiche challenge contestuali
 */
export function useChallengeNotifications() {
  const { storageProvider } = useStorage()
  const [activeNotification, setActiveNotification] = useState<ChallengeProgress | null>(null)
  
  /**
   * Controlla se un'azione completa o progredisce un challenge
   */
  const checkChallengeProgress = useCallback(async (
    action: ChallengeAction,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<ChallengeProgress | null> => {
    if (!userId) return null
    
    try {
      // Solo traguardi progressivi operativi; la gamification giornaliera e' stata rimossa.
      const progressiveChallenges = await checkProgressiveChallenges(action, userId, metadata)
      if (progressiveChallenges) {
        return progressiveChallenges
      }
      
      return null
    } catch (error) {
      console.error('Error checking challenge progress:', error)
      return null
    }
  }, [storageProvider])
  
  /**
   * Controlla challenge progressivi (es. "Completa 5 semine")
   */
  const checkProgressiveChallenges = async (
    action: ChallengeAction,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<ChallengeProgress | null> => {
    try {
      // Conta azioni completate dall'utente
      const tasks = await storageProvider.getTasks?.(metadata?.gardenId) || []
      
      if (action === 'sowing') {
        const sowingCount = tasks.filter(t => t.taskType === 'Sowing' && t.completed).length
        
        // Challenge "Pollice Verde" - 5 semine
        if (sowingCount === 5) {
          return {
            challengeId: 'pollice-verde-5',
            title: 'Pollice Verde',
            progress: { current: 5, target: 10 },
            badge: { emoji: '🌱', name: 'Pollice Verde' },
            message: 'Hai completato 5 semine! Continua così per sbloccare "Maestro Seminatore"',
            isCompleted: false
          }
        }
        
        // Challenge "Maestro Seminatore" - 10 semine
        if (sowingCount === 10) {
          return {
            challengeId: 'maestro-seminatore-10',
            title: 'Maestro Seminatore',
            progress: { current: 10, target: 20 },
            badge: { emoji: '👨‍🌾', name: 'Maestro Seminatore' },
            message: 'Incredibile! Hai completato 10 semine!',
            isCompleted: true
          }
        }
      }
      
      if (action === 'harvest') {
        const harvestCount = tasks.filter(t => t.taskType === 'Harvest' && t.completed).length
        
        if (harvestCount === 1) {
          return {
            challengeId: 'primo-raccolto',
            title: 'Primo Raccolto',
            progress: { current: 1, target: 1 },
            badge: { emoji: '🍅', name: 'Primo Raccolto' },
            message: 'Congratulazioni per il tuo primo raccolto!',
            isCompleted: true
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error checking progressive challenges:', error)
      return null
    }
  }
  
  /**
   * Mostra una notifica challenge
   */
  const showChallengeNotification = useCallback((progress: ChallengeProgress) => {
    setActiveNotification(progress)
    
    // Auto-hide dopo 5 secondi
    setTimeout(() => {
      setActiveNotification(null)
    }, 5000)
  }, [])
  
  /**
   * Nasconde la notifica corrente
   */
  const hideNotification = useCallback(() => {
    setActiveNotification(null)
  }, [])
  
  return {
    checkChallengeProgress,
    showChallengeNotification,
    hideNotification,
    activeNotification
  }
}





