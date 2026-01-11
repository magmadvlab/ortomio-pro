/**
 * Social Sharing Test Component
 * Componente per testare la funzionalità di condivisione sociale
 */

'use client'

import React, { useState } from 'react'
import { Share2, Trophy, Plus, Trash2, TestTube } from 'lucide-react'
import { ShareButton, useShareableAchievement } from '@/components/social/ShareButton'
import { awardBadge, getUserBadges, BadgeInfo } from '@/lib/challenges/badgeSystem'

export default function SocialSharingTest() {
  const [badges, setBadges] = useState<BadgeInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carica badge esistenti
  React.useEffect(() => {
    const userId = 'demo-user'
    const userBadges = getUserBadges(userId)
    setBadges(userBadges)
  }, [])

  // Badge di test predefiniti
  const testBadges = [
    {
      id: 'first_sowing',
      nome: 'Prima Semina',
      emoji: '🌱',
      descrizione: 'Hai completato la tua prima semina!'
    },
    {
      id: 'harvest_master',
      nome: 'Maestro del Raccolto',
      emoji: '🥕',
      descrizione: 'Hai raccolto 10 kg di verdure!'
    },
    {
      id: 'streak_7',
      nome: 'Settimana Perfetta',
      emoji: '🔥',
      descrizione: '7 giorni consecutivi di attività'
    },
    {
      id: 'green_thumb',
      nome: 'Pollice Verde',
      emoji: '👍',
      descrizione: 'Hai coltivato 5 varietà diverse'
    },
    {
      id: 'challenge_master',
      nome: 'Maestro delle Sfide',
      emoji: '🎯',
      descrizione: 'Hai completato 10 challenge'
    },
    {
      id: 'water_saver',
      nome: 'Risparmiatore d\'Acqua',
      emoji: '💧',
      descrizione: 'Hai ottimizzato l\'irrigazione'
    }
  ]

  const addTestBadge = async (badgeData: any) => {
    setIsLoading(true)
    try {
      const userId = 'demo-user'
      const success = await awardBadge(userId, {
        ...badgeData,
        earned_at: new Date()
      })
      
      if (success) {
        const updatedBadges = getUserBadges(userId)
        setBadges(updatedBadges)
      }
    } catch (error) {
      console.error('Errore aggiunta badge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAllBadges = () => {
    const userId = 'demo-user'
    localStorage.removeItem(`user_badges_${userId}`)
    setBadges([])
  }

  const addAllTestBadges = async () => {
    setIsLoading(true)
    for (const badge of testBadges) {
      await addTestBadge(badge)
      // Piccola pausa per evitare problemi
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TestTube className="text-blue-600" size={24} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Test Condivisione Sociale</h1>
              <p className="text-sm text-gray-600">Testa la funzionalità di condivisione badge e achievement</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addAllTestBadges}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Aggiungi Tutti i Badge
            </button>
            <button
              onClick={clearAllBadges}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Pulisci Badge
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Come testare:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Clicca "Aggiungi Tutti i Badge" per creare badge di test</li>
            <li>2. Passa il mouse sui badge per vedere il pulsante di condivisione</li>
            <li>3. Clicca il pulsante per aprire il modal di condivisione</li>
            <li>4. Testa le diverse piattaforme social</li>
            <li>5. Testa la funzione "Copia Testo"</li>
          </ol>
        </div>
      </div>

      {/* Badge Disponibili per Test */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Badge Disponibili per Test</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testBadges.map((badge) => {
            const isEarned = badges.some(b => b.id === badge.id)
            return (
              <div
                key={badge.id}
                className={`p-4 border rounded-lg text-center transition-all ${
                  isEarned 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{badge.emoji}</div>
                <h3 className="font-medium text-gray-900 text-sm">{badge.nome}</h3>
                <p className="text-xs text-gray-600 mt-1">{badge.descrizione}</p>
                {!isEarned && (
                  <button
                    onClick={() => addTestBadge(badge)}
                    disabled={isLoading}
                    className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Sblocca
                  </button>
                )}
                {isEarned && (
                  <div className="mt-3 text-xs text-green-600 font-medium">
                    ✅ Sbloccato
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Badge Sbloccati con Condivisione */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Badge Sbloccati ({badges.length})</h2>
          <span className="text-sm text-gray-600">
            Passa il mouse per vedere il pulsante di condivisione
          </span>
        </div>
        
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <Trophy size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nessun badge sbloccato</p>
            <p className="text-sm text-gray-400 mt-1">Clicca "Aggiungi Tutti i Badge" per iniziare il test</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge, idx) => {
              const shareableContent = useShareableAchievement(
                {
                  id: badge.id,
                  title: badge.nome,
                  description: badge.descrizione,
                  icon: badge.emoji,
                  rarity: 'common',
                  unlockedAt: badge.earned_at
                },
                {
                  level: 2,
                  xp: 250,
                  streak: 7
                }
              )

              return (
                <div
                  key={idx}
                  className="relative p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{badge.emoji}</div>
                    <h3 className="font-medium text-gray-900 text-sm">{badge.nome}</h3>
                    <p className="text-xs text-gray-600 mt-1">{badge.descrizione}</p>
                    {badge.earned_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(badge.earned_at).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                  
                  {/* Share Button - Appare al hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ShareButton
                      content={shareableContent}
                      variant="icon-only"
                      className="shadow-md"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Test Diretto Condivisione */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Test Diretto Condivisione</h2>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🏆 Achievement di Test
              </h3>
              <p className="text-gray-600 mt-1">Testa direttamente la condivisione senza hover</p>
            </div>
            <ShareButton
              content={{
                type: 'achievement',
                title: 'Maestro OrtoMio',
                description: 'Hai raggiunto il livello massimo in OrtoMio!',
                stats: {
                  level: 5,
                  xp: 5000,
                  streak: 30
                },
                badge: {
                  emoji: '👑',
                  name: 'Maestro OrtoMio',
                  rarity: 'legendary'
                }
              }}
              variant="default"
            />
          </div>
        </div>
      </div>
    </div>
  )
}