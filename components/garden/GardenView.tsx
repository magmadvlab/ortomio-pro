'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { TimelineView } from './TimelineView'
import { CalendarTabView } from './CalendarTabView'
import { ListView } from './ListView'
import { Calendar, List, GanttChart, Plus, Sprout, Settings, Grid3X3, X, Package, Leaf, Bot } from 'lucide-react'
import { PlantsView } from './PlantsView'
import { AddItemModal } from './AddItemModal'
import { HarvestRegistrationModal } from '../harvest/HarvestRegistrationModal'
import { PhotoCaptureModal } from '../camera/PhotoCaptureModal'
import { ContextualTip } from '@/components/shared/ContextualTip'
import { BedManager } from '@/components/gardens/BedManager'
import SeedInventory from '@/components/SeedInventory'
import SeedlingDashboard from '@/components/seedling/SeedlingDashboard'
import SaplingDashboard from '@/components/SaplingDashboard'
import Link from 'next/link'

interface GardenViewProps {
  garden: Garden
  tasks: GardenTask[]
  activeTab: 'timeline' | 'calendar' | 'plants' | 'harvest' | 'structure'
  onTabChange: (tab: 'timeline' | 'calendar' | 'plants' | 'harvest' | 'structure') => void
  onToggleTask: (id: string) => void
  onAddTask: (task: Omit<GardenTask, 'id' | 'completed' | 'gardenId'>) => void
  onDeleteTask: (id: string) => void
  onUpdateTask: (task: GardenTask) => void
}

export function GardenView({
  garden,
  tasks,
  activeTab,
  onTabChange,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTask
}: GardenViewProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showHarvestModal, setShowHarvestModal] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [showBedManager, setShowBedManager] = useState(false)
  
  const tabs = [
    { id: 'timeline' as const, label: 'Timeline', icon: GanttChart },
    { id: 'calendar' as const, label: 'Calendario', icon: Calendar },
    { id: 'plants' as const, label: 'Piante & Vivaio', icon: Sprout },
    { id: 'harvest' as const, label: 'Raccolto', icon: Package },
    { id: 'structure' as const, label: 'Struttura', icon: Grid3X3 }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 relative">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🌱 Il Mio Orto</h1>
            <p className="text-sm text-gray-600">{garden.name}</p>
          </div>
          <ContextualTip
            id="garden-intro"
            title="Benvenuto in Il Mio Orto!"
            message="Qui puoi gestire tutte le tue coltivazioni: pianifica semine, visualizza il calendario, controlla i task e monitora le tue piante."
            position="bottom"
          />
          <div className="flex gap-2">
            <Link
              href="/app/settings?section=gardens"
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Gestisci i tuoi orti"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Gestisci Orti</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Aggiungi</span>
            </button>
          </div>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-green-600 border-green-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>
      
      {/* Content */}
      <main className="p-4">
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* AI Planning Integration */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="text-purple-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Pianificazione AI</h3>
                    <p className="text-sm text-gray-600">Ottimizza il tuo calendario con l'intelligenza artificiale</p>
                  </div>
                </div>
                <Link
                  href="/app/planner"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Bot size={16} />
                  Apri Planner AI
                </Link>
              </div>
            </div>

            <CalendarTabView
              garden={garden}
              tasks={tasks}
              onUpdateTask={onUpdateTask}
              onDateClick={(date) => {
                // Switch to timeline view filtered by date
                onTabChange('timeline')
              }}
            />
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* AI Suggestions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Suggerimenti AI</h3>
                    <p className="text-sm text-gray-600">Consigli personalizzati per la tua timeline</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <Bot size={16} />
                  Ottimizza Timeline
                </button>
              </div>
            </div>

            <TimelineView
              garden={garden}
              tasks={tasks}
              onUpdateTask={onUpdateTask}
            />
          </div>
        )}

        {activeTab === 'plants' && (
          <div className="space-y-6">
            {/* Header con AI Integration */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🌱 Piante & Vivaio</h2>
                  <p className="text-gray-600 mt-1">Gestisci le tue piante e il vivaio in un unico posto</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/app/planner"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Bot size={16} />
                    Pianifica con AI
                  </Link>
                  <Link
                    href="/app/semenzaio"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Leaf size={16} />
                    Vivaio Completo
                  </Link>
                </div>
              </div>

              {/* Sub-tabs per Piante e Vivaio */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button className="px-4 py-2 border-b-2 border-green-600 text-green-600 font-medium">
                  🌿 Piante in Campo
                </button>
                <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  📦 Banca Semi
                </button>
                <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  🌱 Piantine
                </button>
                <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                  🌳 Alberelli
                </button>
              </div>

              {/* Contenuto Piante in Campo */}
              <PlantsView
                garden={garden}
                tasks={tasks}
                onUpdateTask={onUpdateTask}
              />
            </div>

            {/* Vivaio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Semi */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Banca dei Semi</h3>
                    <p className="text-sm text-gray-600">Inventario e scadenze</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Varietà disponibili:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">In scadenza:</span>
                    <span className="font-medium text-orange-600">3</span>
                  </div>
                </div>
              </div>

              {/* Piantine */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Piantine</h3>
                    <p className="text-sm text-gray-600">Lotti in crescita</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lotti attivi:</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pronte per trapianto:</span>
                    <span className="font-medium text-green-600">2</span>
                  </div>
                </div>
              </div>

              {/* Alberelli */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🌳</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Alberelli</h3>
                    <p className="text-sm text-gray-600">Portinnesti e impianti</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">In vivaio:</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pronti per impianto:</span>
                    <span className="font-medium text-blue-600">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'harvest' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📦 Raccolto</h2>
                <p className="text-gray-600 mt-1">Registra e monitora i tuoi raccolti</p>
              </div>
              <Link
                href="/app/progress?tab=harvests"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                <Package size={18} />
                Vedi Tutti i Raccolti
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistiche raccolto */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Questo Mese</h3>
                    <p className="text-sm text-gray-600">Raccolti di gennaio</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Totale raccolto:</span>
                    <span className="font-bold text-lg text-orange-600">12.5 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Varietà raccolte:</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valore stimato:</span>
                    <span className="font-medium text-green-600">€45</span>
                  </div>
                </div>
              </div>

              {/* Prossimi raccolti */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Prossimi Raccolti</h3>
                    <p className="text-sm text-gray-600">Pronti nei prossimi giorni</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-green-100">
                    <div>
                      <span className="font-medium text-gray-900">Lattuga</span>
                      <p className="text-xs text-gray-600">Aiuola A</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">2 giorni</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-green-100">
                    <div>
                      <span className="font-medium text-gray-900">Spinaci</span>
                      <p className="text-xs text-gray-600">Aiuola B</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">5 giorni</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium text-gray-900">Ravanelli</span>
                      <p className="text-xs text-gray-600">Vaso 3</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">1 settimana</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Azioni rapide raccolto */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Azioni Rapide</h4>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowHarvestModal(true)}
                  className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                >
                  📦 Registra Raccolto
                </button>
                <button 
                  onClick={() => setShowPhotoCapture(true)}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  📷 Foto Raccolto
                </button>
                <Link
                  href="/app/progress?tab=harvests"
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  📊 Analizza Rese
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Struttura del Giardino</h2>
                <p className="text-gray-600 mt-1">Gestisci aiuole, filari e zone di coltivazione</p>
              </div>
              <button
                onClick={() => setShowBedManager(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Settings size={20} />
                Gestisci Zone
              </button>
            </div>
            
            <BedManager
              garden={garden}
              tasks={tasks}
              onClose={() => {}} // Non chiudere, è integrato nella pagina
            />
          </div>
        )}
      </main>
      
      {/* FAB Quick Add */}
      <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            showQuickActions
              ? 'bg-red-500 text-white rotate-45'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
          aria-label={showQuickActions ? 'Chiudi azioni rapide' : 'Apri azioni rapide'}
        >
          {showQuickActions ? (
            <Plus size={24} className="rotate-45" />
          ) : (
            <Plus size={24} />
          )}
        </button>
        
        {showQuickActions && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 animate-in fade-in slide-in-from-bottom-4">
            {[
              { id: 'task', label: 'Nuovo Task', icon: '📋', color: 'bg-blue-500', action: () => setShowAddModal(true) },
              { id: 'harvest', label: 'Registra Raccolto', icon: '🛒', color: 'bg-orange-500', action: () => setShowHarvestModal(true) },
              { id: 'photo', label: 'Scatta Foto', icon: '📷', color: 'bg-purple-500', action: () => setShowPhotoCapture(true) },
              { id: 'sowing', label: 'Nuova Semina', icon: '🌱', color: 'bg-green-500', action: () => setShowAddModal(true) },
            ].map((action, idx) => (
              <div
                key={action.id}
                className="flex items-center gap-3"
                style={{
                  animationDelay: `${idx * 50}ms`,
                }}
              >
                <span className="bg-white text-gray-700 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    setShowQuickActions(false)
                    action.action()
                  }}
                  className={`${action.color} text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-110`}
                  aria-label={action.label}
                >
                  <span className="text-xl">{action.icon}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        garden={garden}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTask={onAddTask}
      />

      {/* Harvest Modal */}
      <HarvestRegistrationModal
        garden={garden}
        isOpen={showHarvestModal}
        onClose={() => setShowHarvestModal(false)}
        onHarvestRegistered={() => {
          // Ricarica i task per aggiornare la vista
          window.location.reload() // Semplice per ora
        }}
      />

      {/* Photo Capture Modal */}
      <PhotoCaptureModal
        garden={garden}
        isOpen={showPhotoCapture}
        onClose={() => setShowPhotoCapture(false)}
        onPhotoSaved={(photoUrl) => {
          console.log('Photo saved:', photoUrl)
          // Qui potresti aggiornare la vista o mostrare una notifica
        }}
      />
    </div>
  )
}

