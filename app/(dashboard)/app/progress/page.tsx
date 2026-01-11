'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, ShoppingBasket, BarChart3, Calendar, Target } from 'lucide-react'
import { AchievementsTab } from '@/components/progress/AchievementsTab'
import { HarvestsTab } from '@/components/progress/HarvestsTab'
import { StatsTab } from '@/components/progress/StatsTab'
import { ContextualTip } from '@/components/shared/ContextualTip'
import { ChallengeSystem } from '@/components/challenges/ChallengeSystem'

function ProgressPageContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  
  const tabs = [
    { id: 'overview', label: 'Panoramica', icon: Trophy },
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'harvests' && <HarvestsTab />}
        {activeTab === 'stats' && <StatsTab />}
      </main>
    </div>
  )
}

// New Overview Tab that integrates challenges with calendar and dashboard
function OverviewTab() {
  const today = new Date()
  const currentMonth = today.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  
  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-green-600" size={24} />
            Oggi - {today.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <span className="text-sm text-gray-500">{currentMonth}</span>
        </div>
        
        {/* Daily Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-green-900">Attività Completate</p>
                <p className="text-2xl font-bold text-green-700">3/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBasket className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-blue-900">Raccolti Oggi</p>
                <p className="text-2xl font-bold text-blue-700">2.3 kg</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-purple-900">XP Guadagnati</p>
                <p className="text-2xl font-bold text-purple-700">+150</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <a 
            href="/app/planner" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            📅 Vai al Calendario
          </a>
          <a 
            href="/app/irrigation" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            💧 Registra Irrigazione
          </a>
          <a 
            href="/app/harvests" 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            🥕 Registra Raccolto
          </a>
        </div>
      </div>

      {/* Challenge System - Integrated with Calendar Context */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Target className="text-green-600" size={20} />
            Challenge Integrate
          </h3>
          <a 
            href="/app/planner" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Vai al Calendario →
          </a>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800">
            🎯 <strong>Novità:</strong> Le challenge sono ora completamente integrate nel calendario! 
            Ogni giorno ha challenge personalizzate basate sui tuoi task pianificati.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-purple-900">Challenge Intelligenti</h4>
            <p className="text-sm text-purple-700 mt-1">
              Generate automaticamente dai tuoi task
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📅</div>
            <h4 className="font-semibold text-blue-900">Calendario Unificato</h4>
            <p className="text-sm text-blue-700 mt-1">
              Task e challenge in un'unica vista
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-yellow-900">XP Automatici</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Guadagna XP completando task e challenge
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Panoramica Settimanale</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">Attività Completate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">8.7 kg</div>
            <div className="text-sm text-gray-600">Raccolti Totali</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Badge Sbloccati</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">7</div>
            <div className="text-sm text-gray-600">Giorni Consecutivi</div>
          </div>
        </div>
      </div>

      {/* Quick Links to Other Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="/app/progress?tab=achievements"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-600 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="font-semibold text-gray-900">Traguardi</h4>
          </div>
          <p className="text-sm text-gray-600">Vedi tutti i badge e obiettivi</p>
        </a>
        
        <a 
          href="/app/progress?tab=harvests"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBasket className="text-green-600 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="font-semibold text-gray-900">Raccolti</h4>
          </div>
          <p className="text-sm text-gray-600">Storico raccolti e produzioni</p>
        </a>
        
        <a 
          href="/app/progress?tab=stats"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
            <h4 className="font-semibold text-gray-900">Statistiche</h4>
          </div>
          <p className="text-sm text-gray-600">Analisi dettagliate e metriche</p>
        </a>
      </div>
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

