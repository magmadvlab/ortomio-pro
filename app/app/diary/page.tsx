'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, Calendar, Filter, Download, Plus, Search, Clock, MapPin, Zap } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden } from '@/types'
import OperationalDiary from '@/components/diary/OperationalDiary'
import UnifiedTimelineDiary from '@/components/diary/UnifiedTimelineDiary'
import AutomatedDiaryViewer from '@/components/diary/AutomatedDiaryViewer'

export default function DiaryPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [activeView, setActiveView] = useState<'timeline' | 'operational' | 'calendar' | 'automated'>('timeline')
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    }
    loadGardens()
  }, [storageProvider])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Diario Operativo</h1>
              <p className="text-gray-600">Registra e monitora tutte le attività dell'orto</p>
            </div>
          </div>
          
          {/* Garden Selector */}
          {gardens.length > 1 && (
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-500" size={16} />
              <select
                value={activeGarden?.id || ''}
                onChange={(e) => {
                  const garden = gardens.find(g => g.id === e.target.value)
                  setActiveGarden(garden || null)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'operational', label: 'Diario Operativo', icon: BookOpen },
              { id: 'automated', label: 'Diario Automatico', icon: Zap },
              { id: 'calendar', label: 'Vista Calendario', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeView === tab.id
                      ? 'border-blue-500 text-blue-600'
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

      {/* Content */}
      {!activeGarden ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun giardino selezionato</h3>
            <p className="text-gray-600">Seleziona un giardino per visualizzare il diario operativo</p>
          </div>
        </div>
      ) : (
        <>
          {activeView === 'timeline' && (
            <UnifiedTimelineDiary gardenId={activeGarden.id} garden={activeGarden} />
          )}
          
          {activeView === 'operational' && (
            <OperationalDiary gardenId={activeGarden.id} />
          )}
          
          {activeView === 'automated' && (
            <AutomatedDiaryViewer 
              gardenId={activeGarden.id} 
              gardenName={activeGarden.name}
            />
          )}
          
          {activeView === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Vista Calendario</h3>
                <p className="text-gray-600 mb-6">
                  Visualizza le attività del diario in formato calendario
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>In sviluppo:</strong> La vista calendario sarà disponibile nella prossima versione
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick Actions */}
      {activeGarden && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
              <Plus className="text-blue-600" size={20} />
              <div>
                <p className="font-medium text-blue-900">Nuova Attività</p>
                <p className="text-sm text-blue-700">Registra una nuova operazione</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
              <Search className="text-green-600" size={20} />
              <div>
                <p className="font-medium text-green-900">Cerca Attività</p>
                <p className="text-sm text-green-700">Filtra per data o tipo</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
              <Download className="text-purple-600" size={20} />
              <div>
                <p className="font-medium text-purple-900">Esporta Diario</p>
                <p className="text-sm text-purple-700">Scarica report PDF</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
