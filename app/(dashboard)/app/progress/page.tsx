'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, ShoppingBasket, BarChart3 } from 'lucide-react'
import { AchievementsTab } from '@/components/progress/AchievementsTab'
import { HarvestsTab } from '@/components/progress/HarvestsTab'
import { StatsTab } from '@/components/progress/StatsTab'
import { ContextualTip } from '@/components/shared/ContextualTip'

function ProgressPageContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'achievements'
  
  const tabs = [
    { id: 'achievements', label: 'Traguardi', icon: Trophy },
    { id: 'harvests', label: 'Raccolti', icon: ShoppingBasket },
    { id: 'stats', label: 'Statistiche', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 relative">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">📊 Progressi</h1>
          <ContextualTip
            id="progress-intro"
            title="Traccia i tuoi progressi"
            message="Qui puoi vedere i tuoi traguardi, statistiche dei raccolti e metriche generali. Completa task e raccogli per sbloccare nuovi badge!"
            position="bottom"
          />
        </div>
        
        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <a
                key={tab.id}
                href={`/app/progress?tab=${tab.id}`}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-green-600 border-green-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </a>
            )
          })}
        </div>
      </header>
      
      {/* Content */}
      <main className="p-4">
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'harvests' && <HarvestsTab />}
        {activeTab === 'stats' && <StatsTab />}
      </main>
    </div>
  )
}

export default function ProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    }>
      <ProgressPageContent />
    </Suspense>
  )
}

