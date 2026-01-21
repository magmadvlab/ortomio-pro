'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { useStorage } from '@/packages/core/hooks/useStorage'
// import { getChallengeForDate } from '@/data/giornateSpeciali' // REMOVED: gamification
import { GardenTask } from '@/types'
import { Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ProgressCardProps {
  tasks: GardenTask[]
  gardenId?: string
}

export function ProgressCard({ tasks, gardenId }: ProgressCardProps) {
  const { user } = useAuth()
  const { storageProvider } = useStorage()
  const [challengeProgress, setChallengeProgress] = useState<{
    title: string
    progress: number
    target: number
    badge?: { emoji: string; name: string }
    isCompleted: boolean
  } | null>(null)

  useEffect(() => {
    const loadChallengeProgress = async () => {
      if (!user?.id || !gardenId) return

      try {
        // 1. Controlla challenge giornaliero
        // const todayChallenge = getChallengeForDate(new Date()) // REMOVED: gamification
        const todayChallenge = null; // Gamification removed
        if (todayChallenge) {
          const challengeId = `${todayChallenge.giorno}-${todayChallenge.mese}`
          
          // Verifica se challenge già completata usando localStorage (fallback)
          const completedKey = `challenge_${challengeId}_${user.id}`
          const alreadyCompleted = localStorage.getItem(completedKey) !== null

          if (!alreadyCompleted) {
            // Calcola progresso basato su azioni completate
            // Per semplicità, assumiamo che almeno un'azione sia stata completata se ci sono task completati oggi
            const today = new Date().toISOString().split('T')[0]
            const todayCompletedTasks = (tasks || []).filter(t => t.completed && t.date === today).length
            const progress = Math.min(todayCompletedTasks, todayChallenge.challenge.azioni.length)

            if (progress > 0) {
              const challengeBadge = todayChallenge.challenge.badge
              setChallengeProgress({
                title: todayChallenge.challenge.titolo,
                progress,
                target: todayChallenge.challenge.azioni.length,
                badge: challengeBadge
                  ? { emoji: challengeBadge.emoji, name: challengeBadge.nome }
                  : undefined,
                isCompleted: progress >= todayChallenge.challenge.azioni.length
              })
              return
            }
          }
        }

        // 2. Controlla challenge progressivi
        const sowingCount = (tasks || []).filter(t => t.taskType === 'Sowing' && t.completed).length
        const harvestCount = (tasks || []).filter(t => t.taskType === 'Harvest' && t.completed).length

        // Challenge "Pollice Verde" - 5 semine
        if (sowingCount >= 5 && sowingCount < 10) {
          setChallengeProgress({
            title: 'Pollice Verde',
            progress: sowingCount,
            target: 10,
            badge: { emoji: '🌱', name: 'Pollice Verde' },
            isCompleted: false
          })
          return
        }

        // Challenge "Maestro Seminatore" - 10 semine
        if (sowingCount >= 10 && sowingCount < 20) {
          setChallengeProgress({
            title: 'Maestro Seminatore',
            progress: sowingCount,
            target: 20,
            badge: { emoji: '👨‍🌾', name: 'Maestro Seminatore' },
            isCompleted: false
          })
          return
        }

        // Challenge "Primo Raccolto"
        if (harvestCount === 1) {
          setChallengeProgress({
            title: 'Primo Raccolto',
            progress: 1,
            target: 1,
            badge: { emoji: '🍅', name: 'Primo Raccolto' },
            isCompleted: true
          })
          return
        }

        // Nessun challenge attivo
        setChallengeProgress(null)
      } catch (error) {
        console.error('Error loading challenge progress:', error)
        setChallengeProgress(null)
      }
    }

    loadChallengeProgress()
  }, [user?.id, gardenId, tasks, storageProvider])

  if (!challengeProgress) {
    return null
  }

  const progressPercentage = Math.min((challengeProgress.progress / challengeProgress.target) * 100, 100)

  return (
    <Link href="/app/progress?tab=achievements" className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-3">
          <Trophy className="text-amber-500" size={18} />
          Prossimo Traguardo
        </h3>
        
        <div className="flex items-center gap-5">
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-1">
              {challengeProgress.badge?.emoji} {challengeProgress.title}
            </div>
            <div className="text-sm text-gray-500 mb-3">
              {challengeProgress.progress}/{challengeProgress.target} completati
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Badge Icon */}
          <div className="w-15 h-15 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{challengeProgress.badge?.emoji || '🏆'}</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {challengeProgress.isCompleted ? 'Completato!' : `${challengeProgress.target - challengeProgress.progress} rimanenti`}
          </span>
          <ArrowRight size={16} className="text-gray-400" />
        </div>
      </div>
    </Link>
  )
}
