'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { TimelineView } from './TimelineView'
import { CalendarTabView } from './CalendarTabView'
import { ListView } from './ListView'
import { Calendar, List, GanttChart, Plus, Sprout, Settings, Grid3X3, X } from 'lucide-react'
import { PlantsView } from './PlantsView'
import { AddItemModal } from './AddItemModal'
import { HarvestRegistrationModal } from '../harvest/HarvestRegistrationModal'
import { PhotoCaptureModal } from '../camera/PhotoCaptureModal'
import { ContextualTip } from '@/components/shared/ContextualTip'
import { BedManager } from '@/components/gardens/BedManager'
import Link from 'next/link'

interface GardenViewProps {
  garden: Garden
  tasks: GardenTask[]
  activeTab: 'timeline' | 'calendar' | 'list' | 'plants' | 'structure'
  onTabChange: (tab: 'timeline' | 'calendar' | 'list' | 'plants' | 'structure') => void
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
    { id: 'list' as const, label: 'Lista', icon: List },
    { id: 'plants' as const, label: 'Piante', icon: Sprout },
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
        {activeTab === 'timeline' && (
          <TimelineView
            garden={garden}
            tasks={tasks}
            onUpdateTask={onUpdateTask}
          />
        )}
        
        {activeTab === 'calendar' && (
          <CalendarTabView
            garden={garden}
            tasks={tasks}
            onUpdateTask={onUpdateTask}
            onDateClick={(date) => {
              // Switch to list view filtered by date
              onTabChange('list')
            }}
          />
        )}
        
        {activeTab === 'list' && (
          <ListView
            garden={garden}
            tasks={tasks}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
          />
        )}
        
        {activeTab === 'plants' && (
          <PlantsView
            garden={garden}
            tasks={tasks}
            onUpdateTask={onUpdateTask}
          />
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

