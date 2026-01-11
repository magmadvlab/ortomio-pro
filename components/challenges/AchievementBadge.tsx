'use client'

import React, { useState } from 'react'
import { Trophy, Lock, Share2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ShareButton, useShareableAchievement } from '@/components/social/ShareButton'

interface AchievementBadgeProps {
  id: string
  title: string
  description: string
  icon?: string
  unlocked: boolean
  unlockedAt?: Date
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  userStats?: {
    level?: number
    xp?: number
    streak?: number
  }
  showShareButton?: boolean
}

export function AchievementBadge({
  id,
  title,
  description,
  icon,
  unlocked,
  unlockedAt,
  rarity = 'common',
  userStats,
  showShareButton = true,
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const rarityColors = {
    common: 'bg-gray-100 border-gray-300',
    rare: 'bg-blue-100 border-blue-300',
    epic: 'bg-purple-100 border-purple-300',
    legendary: 'bg-yellow-100 border-yellow-400',
  }

  const shareableContent = useShareableAchievement(
    { id, title, description, icon, rarity, unlockedAt },
    userStats
  )

  return (
    <div
      className={`p-4 text-center relative overflow-hidden transition-all duration-200 rounded-lg border ${
        unlocked ? rarityColors[rarity] : 'opacity-60'
      } ${isHovered && unlocked ? 'transform scale-105 shadow-lg' : ''} ${
        unlocked ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <Lock className="text-gray-400" size={32} />
        </div>
      )}
      
      {/* Share Button - Solo per badge sbloccati */}
      {unlocked && showShareButton && (
        <div className={`absolute top-2 right-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <ShareButton
            content={shareableContent}
            variant="icon-only"
            className="shadow-md"
          />
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

      {/* Rarity Indicator */}
      {unlocked && rarity !== 'common' && (
        <div className="absolute top-2 left-2">
          <div className={`w-3 h-3 rounded-full ${
            rarity === 'rare' ? 'bg-blue-500' :
            rarity === 'epic' ? 'bg-purple-500' :
            rarity === 'legendary' ? 'bg-yellow-500' : 'bg-gray-500'
          }`} />
        </div>
      )}
    </div>
  )
}

