'use client'

import React from 'react'
import { Trophy, Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface AchievementBadgeProps {
  id: string
  title: string
  description: string
  icon?: string
  unlocked: boolean
  unlockedAt?: Date
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export function AchievementBadge({
  id,
  title,
  description,
  icon,
  unlocked,
  unlockedAt,
  rarity = 'common',
}: AchievementBadgeProps) {
  const rarityColors = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-yellow-100 border-yellow-400',
  }

  return (
    <Card
      variant={unlocked ? 'interactive' : 'default'}
      className={`p-4 text-center relative overflow-hidden ${
        unlocked ? rarityColors[rarity] : 'opacity-60'
      }`}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <Lock className="text-gray-400" size={32} />
        </div>
      )}
      
      <div className="mb-3">
        {icon ? (
          <div className="text-4xl">{icon}</div>
        ) : (
          <Trophy
            className={`mx-auto ${
              unlocked ? 'text-ortomio-green-600' : 'text-gray-400'
            }`}
            size={48}
          />
        )}
      </div>
      
      <h4 className={`font-semibold mb-1 ${
        unlocked ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {title}
      </h4>
      
      <p className={`text-sm ${
        unlocked ? 'text-gray-600' : 'text-gray-400'
      }`}>
        {description}
      </p>
      
      {unlocked && unlockedAt && (
        <p className="text-xs text-gray-500 mt-2">
          Sbloccato il {unlockedAt.toLocaleDateString('it-IT')}
        </p>
      )}
    </Card>
  )
}

