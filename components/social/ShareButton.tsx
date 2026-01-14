/**
 * Share Button Component
 * Pulsante per condivisione rapida di achievement e challenge
 */

'use client'

import React, { useState } from 'react'
import { Share2, Camera } from 'lucide-react'
import { ShareableContent } from '@/services/socialSharingService'
import { SocialShareModal } from './SocialShareModal'

interface ShareButtonProps {
  content: ShareableContent
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
  onPhotoCapture?: () => void
  userPhoto?: string
}

export function ShareButton({ 
  content, 
  variant = 'default', 
  className = '',
  onPhotoCapture,
  userPhoto
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const getButtonContent = () => {
    switch (variant) {
      case 'icon-only':
        return <Share2 size={18} />
      case 'compact':
        return (
          <>
            <Share2 size={16} />
            <span>Condividi</span>
          </>
        )
      default:
        return (
          <>
            <Share2 size={18} />
            <span>Condividi Traguardo</span>
          </>
        )
    }
  }

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium transition-colors'
    
    switch (variant) {
      case 'icon-only':
        return `${baseClasses} p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 ${className}`
      case 'compact':
        return `${baseClasses} px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 ${className}`
      default:
        return `${baseClasses} px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg ${className}`
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={getButtonClasses()}
        title="Condividi sui social media"
      >
        {getButtonContent()}
      </button>

      <SocialShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        content={content}
        userPhoto={userPhoto}
        onPhotoCapture={onPhotoCapture}
      />
    </>
  )
}

// Hook per creare contenuto condivisibile da achievement
export function useShareableAchievement(achievement: {
  id: string
  title: string
  description: string
  icon?: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}, userStats?: {
  level?: number
  xp?: number
  streak?: number
}) {
  const content: ShareableContent = {
    type: 'achievement',
    title: achievement.title,
    description: achievement.description,
    stats: userStats,
    badge: {
      emoji: achievement.icon || '🏆',
      name: achievement.title,
      rarity: achievement.rarity || 'common'
    }
  }
  
  return content
}

// Hook per creare contenuto condivisibile da challenge
export function useShareableChallenge(challenge: {
  id: string
  title: string
  description: string
  progress: number
  target: number
  completedAt?: Date
}, userStats?: {
  streak?: number
  level?: number
}) {
  const content: ShareableContent = {
    type: 'challenge',
    title: challenge.title,
    description: `${challenge.description} (${challenge.progress}/${challenge.target})`,
    stats: userStats
  }
  
  return content
}

// Hook per creare contenuto condivisibile da raccolto
export function useShareableHarvest(harvest: {
  plantName: string
  weight: number
  date: Date
  photo?: string
}, userStats?: {
  harvestWeight?: number
  plantsCount?: number
}) {
  const content: ShareableContent = {
    type: 'harvest',
    title: `Raccolto di ${harvest.plantName}`,
    description: `Oggi ho raccolto ${harvest.weight} kg di ${harvest.plantName} dal mio orto! 🌱`,
    image: harvest.photo,
    stats: {
      harvestWeight: harvest.weight,
      ...userStats
    }
  }
  
  return content
}

// Hook per creare contenuto condivisibile da milestone
export function useShareableMilestone(milestone: {
  type: 'level' | 'xp' | 'streak' | 'plants'
  value: number
  description: string
}, userStats?: {
  level?: number
  xp?: number
  streak?: number
}) {
  const titles = {
    level: `🌟 Livello ${milestone.value} Raggiunto!`,
    xp: `⚡ ${milestone.value} XP Totalizzati!`,
    streak: `🔥 ${milestone.value} Giorni Consecutivi!`,
    plants: `🌱 ${milestone.value} Piante Coltivate!`
  }
  
  const content: ShareableContent = {
    type: 'milestone',
    title: titles[milestone.type],
    description: milestone.description,
    stats: userStats
  }
  
  return content
}