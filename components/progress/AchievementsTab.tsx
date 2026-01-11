'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Award, Target, TrendingUp } from 'lucide-react'
import { getUserBadges, getBadgeStats } from '@/lib/challenges/badgeSystem'
import { getStreak } from '@/lib/challenges/streakCalculator'
import { ChallengeSystem } from '@/components/challenges/ChallengeSystem'
import { ShareButton } from '@/components/social/ShareButton'
import { useAuth } from '@/packages/core/hooks/useAuth'
import { checkAndAssignBadges, assignSeasonalBadges } from '@/lib/challenges/initialBadges'

export function AchievementsTab() {
  const { user } = useAuth()
  const [userId, setUserId] = useState<string | null>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [badgeStats, setBadgeStats] = useState<any>({ total: 0, byType: { challenge: 0, streak: 0, other: 0 }, recent: [] })
  const [streak, setStreak] = useState<{ current: number; longest: number; lastDate: Date | null }>({ current: 0, longest: 0, lastDate: null })

  useEffect(() => {
    const id = user?.id || localStorage.getItem('user_id') || 'demo-user'
    setUserId(id)
    
    if (id) {
      // Assegna badge iniziali e stagionali automaticamente
      const initializeBadges = async () => {
        try {
          await checkAndAssignBadges(id, {
            hasCompletedTasks: true, // Assume che l'utente abbia fatto qualche attività
            hasUsedPlanner: true,    // Assume che abbia visitato il planner
            hasConfiguredGarden: true // Assume che abbia un orto configurato
          })
          await assignSeasonalBadges(id)
          
          // Ricarica badge dopo l'assegnazione
          setTimeout(() => {
            const userBadges = getUserBadges(id)
            const stats = getBadgeStats(id)
            const userStreak = getStreak(id)
            
            setBadges(userBadges)
            setBadgeStats(stats)
            setStreak(userStreak)
            
            console.log('✅ Badge caricati:', userBadges.length)
          }, 500)
        } catch (error) {
          console.error('Errore inizializzazione badge:', error)
          // Fallback: carica badge esistenti
          const userBadges = getUserBadges(id)
          const stats = getBadgeStats(id)
          const userStreak = getStreak(id)
          
          setBadges(userBadges)
          setBadgeStats(stats)
          setStreak(userStreak)
        }
      }
      
      initializeBadges()
    }
  }, [user])

  // Calcola livello e XP (semplificato)
  const totalXP = badges.length * 100 + streak.current * 10
  const currentLevel = Math.floor(totalXP / 1000) + 1
  const xpForCurrentLevel = totalXP % 1000
  const xpForNextLevel = 1000
  const levelProgress = (xpForCurrentLevel / xpForNextLevel) * 100

  const levelNames: Record<number, string> = {
    1: '🌱 Ortolano Principiante',
    2: '🌿 Ortolano Apprendista',
    3: '🌳 Ortolano Esperto',
    4: '🏆 Maestro Ortolano',
    5: '👑 Leggenda dell\'Orto'
  }

  const levelName = levelNames[currentLevel] || levelNames[1]

  return (
    <div className="space-y-6">
      {/* Livello Attuale */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{levelName}</h2>
            <p className="text-sm text-gray-600 mt-1">Livello {currentLevel}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{totalXP}</div>
            <div className="text-sm text-gray-600">XP totali</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>XP: {xpForCurrentLevel} / {xpForNextLevel}</span>
            <span>Prossimo livello: {currentLevel + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-full max-w-sm to-orange-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
        
        {/* Streak Info */}
        {streak.current > 0 && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <TrendingUp size={16} className="text-orange-600" />
            <span className="text-gray-700">
              <strong>{streak.current}</strong> giorni di attività consecutiva
              {streak.longest > streak.current && (
                <span className="text-gray-500 ml-2">
                  (Record: {streak.longest} giorni)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Badge Sbloccati */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Badge Sbloccati</h3>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {badges.length} badge
            </span>
            {badges.length === 0 && (
              <button
                onClick={async () => {
                  if (userId) {
                    await checkAndAssignBadges(userId, {
                      hasCompletedTasks: true,
                      hasUsedPlanner: true,
                      hasConfiguredGarden: true
                    })
                    await assignSeasonalBadges(userId)
                    
                    setTimeout(() => {
                      const userBadges = getUserBadges(userId)
                      setBadges(userBadges)
                    }, 500)
                  }
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Sblocca Badge
              </button>
            )}
          </div>
        </div>
        
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Trophy size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nessun badge ancora sbloccato</p>
            <p className="text-sm text-gray-400 mt-1">Completa attività per sbloccare badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-full max-w-sm hover:shadow-md transition-all duration-200 relative group"
              >
                <div className="text-4xl mb-2">{badge.emoji || '🏆'}</div>
                <div className="text-xs font-medium text-gray-700 text-center">
                  {badge.nome || 'Badge'}
                </div>
                {badge.earned_at && (
                  <div className="text-[10px] text-gray-500 mt-1">
                    {new Date(badge.earned_at).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })}
                  </div>
                )}
                
                {/* Share Button - Appare al hover */}
                <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ShareButton
                    content={{
                      type: 'achievement',
                      title: badge.nome || 'Badge Sbloccato',
                      description: `Ho sbloccato il badge "${badge.nome}" in OrtoMio!`,
                      stats: {
                        level: currentLevel,
                        xp: totalXP,
                        streak: streak.current
                      },
                      badge: {
                        emoji: badge.emoji || '🏆',
                        name: badge.nome || 'Badge',
                        rarity: 'common'
                      }
                    }}
                    variant="icon-only"
                    className="shadow-md"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prossimi Obiettivi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Target size={20} className="text-green-600" />
          Prossimi Obiettivi
        </h3>
        
        <div className="space-y-4">
          {/* Obiettivo 1: Maestro Seminatore */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">🎯 Maestro Seminatore</h4>
              <span className="text-xs text-gray-500">10/25</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Completa 25 semine</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>

          {/* Obiettivo 2: Raccolto Abbondante */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">🎯 Raccolto Abbondante</h4>
              <span className="text-xs text-gray-500">72/100 kg</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Raccogli 100 kg totali</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          {/* Obiettivo 3: Varietà */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">🎯 Varietà</h4>
              <span className="text-xs text-gray-500">8/15</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">Coltiva 15 tipi diversi di piante</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '53%' }} />
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Suggerimento:</strong> Le challenge giornaliere sono ora integrate nella 
            <a href="/app/progress?tab=overview" className="font-medium underline hover:text-blue-900 ml-1">
              Panoramica
            </a> 
            insieme al calendario per una migliore esperienza utente.
          </p>
        </div>
      </div>
    </div>
  )
}

