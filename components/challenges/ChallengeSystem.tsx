'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Award, Star, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { AchievementBadge } from './AchievementBadge'
import { ProgressTracker } from './ProgressTracker'
import { ShareButton, useShareableChallenge } from '@/components/social/ShareButton'

interface Challenge {
  id: string
  title: string
  description: string
  progress: number
  target: number
  unit: string
  icon: string
  category: 'beginner' | 'seasonal' | 'advanced'
  completed?: boolean
  completedAt?: Date
}

interface Achievement {
  id: string
  title: string
  description: string
  icon?: string
  unlocked: boolean
  unlockedAt?: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export function ChallengeSystem() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState({ level: 3, xp: 2450, streak: 7 })

  useEffect(() => {
    // Load challenges and achievements from storage
    // This is a placeholder - integrate with actual data source
    setChallenges([
      {
        id: 'first-sowing',
        title: 'Prima Semina',
        description: 'Completa la tua prima semina',
        progress: 1,
        target: 1,
        unit: 'semina',
        icon: '🌱',
        category: 'beginner',
        completed: true,
        completedAt: new Date('2024-01-15')
      },
      {
        id: 'spring-2024',
        title: 'Primavera 2024',
        description: 'Coltiva 10 pomodori questa primavera',
        progress: 3,
        target: 10,
        unit: 'pomodori',
        icon: '🍅',
        category: 'seasonal',
      },
      {
        id: 'photo-master',
        title: 'Maestro delle Foto',
        description: 'Scatta 30 foto delle tue piante',
        progress: 12,
        target: 30,
        unit: 'foto',
        icon: '📷',
        category: 'advanced',
      },
    ])

    setAchievements([
      {
        id: 'first-sowing-badge',
        title: 'Pollice Verde',
        description: 'Hai completato la tua prima semina',
        icon: '🌱',
        unlocked: true,
        unlockedAt: new Date('2024-01-15'),
        rarity: 'common',
      },
      {
        id: 'first-photo-badge',
        title: 'Fotografo',
        description: 'Hai scattato la tua prima foto',
        icon: '📷',
        unlocked: true,
        unlockedAt: new Date('2024-01-20'),
        rarity: 'common',
      },
      {
        id: 'expert-badge',
        title: 'Esperto',
        description: 'Completa 100 task',
        icon: '🏆',
        unlocked: false,
        rarity: 'legendary',
      },
    ])
  }, [])

  const beginnerChallenges = challenges.filter(c => c.category === 'beginner')
  const seasonalChallenges = challenges.filter(c => c.category === 'seasonal')
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div className="space-y-6">
      {/* Beginner Path */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-ortomio-green-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">PERCORSO PRINCIPIANTE</h2>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progresso complessivo</span>
            <span className="text-sm font-semibold text-gray-900">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-ortomio-green-500 h-2 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        <div className="space-y-3">
          {beginnerChallenges.map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between">
              <div className="flex-1">
                <ProgressTracker
                  title={challenge.title}
                  progress={(challenge.progress / challenge.target) * 100}
                  current={challenge.progress}
                  target={challenge.target}
                  unit={challenge.unit}
                />
              </div>
              
              {/* Share Button per challenge completate */}
              {challenge.completed && (
                <div className="ml-4">
                  <ShareButton
                    content={useShareableChallenge(challenge, userStats)}
                    variant="compact"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Seasonal Challenges */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900">SFIDE STAGIONALI</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">🌸 Primavera 2024</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seasonalChallenges.map((challenge) => (
            <Card key={challenge.id} variant="default" className="p-4 text-center relative group">
              <div className="text-3xl mb-2">{challenge.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1">{challenge.title}</h4>
              <div className="text-sm text-gray-600 mb-2">
                {challenge.progress} / {challenge.target} {challenge.unit}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                />
              </div>
              
              {/* Share Button - Appare al hover se completata */}
              {challenge.completed && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ShareButton
                    content={useShareableChallenge(challenge, userStats)}
                    variant="compact"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>

      {/* Achievements */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-purple-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900">BADGE SBLOCCATI</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {unlockedAchievements.map((achievement) => (
            <AchievementBadge 
              key={achievement.id} 
              {...achievement} 
              userStats={userStats}
              showShareButton={true}
            />
          ))}
          {lockedAchievements.map((achievement) => (
            <AchievementBadge 
              key={achievement.id} 
              {...achievement} 
              userStats={userStats}
              showShareButton={false}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

