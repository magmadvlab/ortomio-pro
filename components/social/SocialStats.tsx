/**
 * Social Stats Component
 * Mostra statistiche delle condivisioni social nella sezione progressi
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Share2, TrendingUp, Users, Heart } from 'lucide-react'
import { getShareStats } from '@/services/socialSharingService'

export function SocialStats() {
  const [stats, setStats] = useState({
    total: 0,
    byPlatform: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    recent: [] as Array<{ platform: string; contentType: string; timestamp: string }>
  })

  useEffect(() => {
    const shareStats = getShareStats()
    setStats(shareStats)
  }, [])

  const platformEmojis: Record<string, string> = {
    facebook: '📘',
    twitter: '🐦',
    instagram: '📸',
    whatsapp: '💬',
    telegram: '✈️'
  }

  const typeEmojis: Record<string, string> = {
    achievement: '🏆',
    challenge: '🎯',
    harvest: '🌱',
    milestone: '🎉'
  }

  const getMostUsedPlatform = () => {
    const platforms = Object.entries(stats.byPlatform)
    if (platforms.length === 0) return null
    
    return platforms.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  const getMostSharedType = () => {
    const types = Object.entries(stats.byType)
    if (types.length === 0) return null
    
    return types.reduce((max, current) => 
      current[1] > max[1] ? current : max
    )
  }

  const mostUsedPlatform = getMostUsedPlatform()
  const mostSharedType = getMostSharedType()

  if (stats.total === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Condivisioni Social</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📱</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Inizia a condividere!
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            Condividi i tuoi traguardi sui social per ispirare altri coltivatori
          </p>
          <div className="flex justify-center gap-2">
            {Object.entries(platformEmojis).map(([platform, emoji]) => (
              <span key={platform} className="text-2xl opacity-50">
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Share2 size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Condivisioni Social</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-500">condivisioni totali</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Piattaforma Preferita */}
        {mostUsedPlatform && (
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">
              {platformEmojis[mostUsedPlatform[0]] || '📱'}
            </div>
            <div className="text-sm font-medium text-blue-900 capitalize">
              {mostUsedPlatform[0]}
            </div>
            <div className="text-xs text-blue-700">
              {mostUsedPlatform[1]} condivisioni
            </div>
          </div>
        )}

        {/* Tipo Più Condiviso */}
        {mostSharedType && (
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">
              {typeEmojis[mostSharedType[0]] || '🌟'}
            </div>
            <div className="text-sm font-medium text-green-900 capitalize">
              {mostSharedType[0] === 'achievement' ? 'Traguardi' :
               mostSharedType[0] === 'challenge' ? 'Sfide' :
               mostSharedType[0] === 'harvest' ? 'Raccolti' :
               mostSharedType[0] === 'milestone' ? 'Milestone' : mostSharedType[0]}
            </div>
            <div className="text-xs text-green-700">
              {mostSharedType[1]} condivisioni
            </div>
          </div>
        )}
      </div>

      {/* Breakdown per Piattaforma */}
      {Object.keys(stats.byPlatform).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Per Piattaforma</h4>
          <div className="space-y-2">
            {Object.entries(stats.byPlatform)
              .sort(([,a], [,b]) => b - a)
              .map(([platform, count]) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platformEmojis[platform] || '📱'}</span>
                    <span className="text-sm text-gray-700 capitalize">{platform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Condivisioni Recenti */}
      {stats.recent.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Condivisioni Recenti</h4>
          <div className="space-y-2">
            {stats.recent.slice(0, 3).map((share, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{platformEmojis[share.platform] || '📱'}</span>
                  <span className="text-gray-600">
                    {share.contentType === 'achievement' ? 'Traguardo' :
                     share.contentType === 'challenge' ? 'Sfida' :
                     share.contentType === 'harvest' ? 'Raccolto' :
                     share.contentType === 'milestone' ? 'Milestone' : share.contentType}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(share.timestamp).toLocaleDateString('it-IT', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Suggerimento</span>
        </div>
        <p className="text-xs text-purple-800">
          Condividi regolarmente i tuoi progressi per ispirare altri coltivatori e costruire una community!
        </p>
      </div>
    </div>
  )
}