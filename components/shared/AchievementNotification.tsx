'use client'

import React, { useEffect } from 'react'
import { X, Trophy, TrendingUp } from 'lucide-react'

interface AchievementNotificationProps {
  badge: {
    emoji: string
    name: string
    description: string
  }
  nextAchievement?: {
    name: string
    progress: number
    target: number
  }
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function AchievementNotification({
  badge,
  nextAchievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: AchievementNotificationProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay, onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in">
      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 rounded-xl border-2 border-yellow-300 shadow-2xl p-6 max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl animate-bounce">{badge.emoji}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={20} className="text-yellow-600" />
                <h3 className="text-lg font-bold text-gray-900">Traguardo Sbloccato!</h3>
              </div>
              <p className="text-sm text-gray-600">{badge.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-yellow-200 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 font-medium">{badge.description}</p>

        {/* Next Achievement Progress */}
        {nextAchievement && (
          <div className="bg-white/70 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Prossimo obiettivo:</span>
              </div>
              <span className="text-xs text-gray-600">
                {nextAchievement.progress} / {nextAchievement.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(nextAchievement.progress / nextAchievement.target) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">{nextAchievement.name}</p>
          </div>
        )}

        {/* Celebration Animation */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 text-2xl animate-ping">🎉</div>
          <div className="absolute top-4 right-4 text-2xl animate-ping" style={{ animationDelay: '0.2s' }}>⭐</div>
          <div className="absolute bottom-4 left-1/2 text-2xl animate-ping" style={{ animationDelay: '0.4s' }}>🏆</div>
        </div>
      </div>
    </div>
  )
}

