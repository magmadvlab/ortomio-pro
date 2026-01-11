'use client'

import React from 'react'
import { ChallengeProgress } from '@/hooks/useChallengeNotifications'
import { Trophy, X, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ChallengeToastProps {
  progress: ChallengeProgress
  onClose: () => void
  onViewDetails?: () => void
}

export function ChallengeToast({ progress, onClose, onViewDetails }: ChallengeToastProps) {
  const router = useRouter()
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails()
    } else {
      router.push('/app/progress?tab=achievements')
    }
    onClose()
  }
  
  const progressPercentage = (progress.progress.current / progress.progress.target) * 100
  
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in lg:left-auto lg:right-6 lg:max-w-md">
      <div className="bg-gradient-to-r from-yellow-full max-w-sm via-yellow-500 to-orange-500 rounded-xl shadow-2xl p-4 text-white">
        <div className="flex items-start gap-3">
          {/* Badge/Icon */}
          <div className="flex-shrink-0">
            {progress.badge ? (
              <div className="text-4xl">{progress.badge.emoji}</div>
            ) : (
              <Trophy className="text-white" size={32} />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">
              {progress.isCompleted ? '🏆 Nuovo traguardo!' : '🎯 Challenge in corso'}
            </h3>
            <p className="text-sm opacity-95 mb-2">{progress.message}</p>
            
            {/* Progress Bar */}
            {!progress.isCompleted && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>{progress.title}</span>
                  <span>{progress.progress.current}/{progress.progress.target}</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleViewDetails}
                className="flex items-center gap-3 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
              >
                <span>Vedi dettagli</span>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-3.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Chiudi"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

