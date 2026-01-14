'use client'

import { NutritionStatsWidget } from '@/components/nutrition/NutritionStatsWidget'
import NutritionAISuggestionsWidget from '@/components/nutrition/NutritionAISuggestionsWidget'
import { useState, useEffect } from 'react'
import { FlaskConical, Droplets, Leaf, Calendar, Plus, BarChart3 } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'

export default function NutritionPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'treatments' | 'schedule' | 'analytics'>('overview')

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0) {
          setActiveGarden(loadedGardens[0])
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FlaskConical className="text-green-500" size={28} />
          Nutrizione & Trattamenti
        </h1>
        <p className="text-gray-600 mt-1">Gestisci fertilizzazioni e trattamenti delle tue colture</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Panoramica', icon: BarChart3 },
              { id: 'treatments', label: 'Trattamenti', icon: FlaskConical },
              { id: 'schedule', label: 'Calendario', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Contenuto */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AI Suggestions Widget */}
          {activeGarden && (
            <NutritionAISuggestionsWidget garden={activeGarden} maxItems={2} />
          )}
          
          <NutritionStatsWidget 
            treatments={[]} 
            fertilizers={[]} 
          />
          
          {/* Azioni Rapide */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Plus className="text-green-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-green-900">Nuovo Trattamento</p>
                  <p className="text-sm text-green-700">Programma fertilizzazione</p>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Droplets className="text-blue-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-blue-900">Irrigazione Nutritiva</p>
                  <p className="text-sm text-blue-700">Combina acqua e nutrienti</p>
                </div>
              </button>
              
              <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Leaf className="text-purple-600" size={20} />
                <div className="text-left">
                  <p className="font-medium text-purple-900">Analisi Fogliare</p>
                  <p className="text-sm text-purple-700">Verifica stato nutrizionale</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'treatments' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <FlaskConical className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestione Trattamenti</h2>
            <p className="text-gray-600 mb-6">
              Programma e monitora i trattamenti nutrizionali delle tue piante
            </p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Aggiungi Trattamento
            </button>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-blue-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendario Trattamenti</h2>
            <p className="text-gray-600 mb-6">
              Visualizza e pianifica i trattamenti nel tempo
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Visualizza Calendario
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto mb-4 text-purple-500" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Nutrizionali</h2>
            <p className="text-gray-600 mb-6">
              Analizza l'efficacia dei trattamenti e ottimizza la nutrizione
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              Visualizza Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}