'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { Garden, GardenTask } from '@/types'
import { BarChart3, Sprout, CheckCircle, Calendar, TrendingUp } from 'lucide-react'
import { SocialStats } from '@/components/social/SocialStats'

export function StatsTab() {
  const { storageProvider } = useStorage()
  const { tier, isPro } = useTier()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        
        // Carica tasks da tutti i giardini
        const allTasks: GardenTask[] = []
        for (const garden of loadedGardens) {
          const gardenTasks = await storageProvider.getTasks(garden.id)
          allTasks.push(...(gardenTasks || []))
        }
        setTasks(allTasks)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [storageProvider])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Caricamento statistiche...</p>
      </div>
    )
  }

  // Calcola metriche
  const activePlants = tasks.filter(t => !t.completed && t.taskType === 'Sowing').length
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Task per tipo
  const tasksByType = tasks.reduce((acc, task) => {
    acc[task.taskType] = (acc[task.taskType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Metriche Generali */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sprout size={20} className="text-green-600" />
            <h3 className="text-sm font-medium text-gray-600">Piante Attive</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{activePlants}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={20} className="text-blue-600" />
            <h3 className="text-sm font-medium text-gray-600">Task Completati</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{completedTasks}</div>
          <div className="text-xs text-gray-500 mt-1">
            {completionRate.toFixed(0)}% completamento
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-purple-600" />
            <h3 className="text-sm font-medium text-gray-600">Task Totali</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={20} className="text-orange-600" />
            <h3 className="text-sm font-medium text-gray-600">Orti</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900">{gardens.length}</div>
        </div>
      </div>

      {/* Task per Tipo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          Task per Tipo
        </h3>
        
        <div className="space-y-3">
          {Object.entries(tasksByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => {
              const typeLabels: Record<string, string> = {
                'Sowing': 'Semina',
                'Transplant': 'Trapianto',
                'Fertilize': 'Concimazione',
                'Treatment': 'Trattamento',
                'Prune': 'Potatura',
                'Harvest': 'Raccolta'
              }
              
              const maxCount = Math.max(...Object.values(tasksByType))
              const percentage = (count / maxCount) * 100
              
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {typeLabels[type] || type}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Statistiche Social */}
      <SocialStats />

      {/* Sezione PRO */}
      {isPro && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Analytics Avanzate (PRO)
          </h3>
          <p className="text-gray-600 mb-4">
            Grafici dettagliati e analisi avanzate disponibili per utenti PRO.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">Produttività Mensile</h4>
              <p className="text-sm text-gray-600">Grafico disponibile nella versione PRO completa</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">Confronto Periodi</h4>
              <p className="text-sm text-gray-600">Confronta performance tra mesi/anni</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

