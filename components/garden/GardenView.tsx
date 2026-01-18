'use client'

import React, { useState } from 'react'
import { Garden, GardenTask } from '@/types'
import { TimelineView } from './TimelineView'
import { CalendarTabView } from './CalendarTabView'
import { ListView } from './ListView'
import ActivityRegistry from './ActivityRegistry'
import TraceabilityWidget from './TraceabilityWidget'
import { Calendar, GanttChart, Plus, Sprout, Settings, Grid3X3, Package, Leaf, Bot, FileText, Shield, Activity, BarChart3, TrendingUp } from 'lucide-react'
import { PlantsView } from './PlantsView'
import { AddItemModal } from './AddItemModal'
import { HarvestRegistrationModal } from '../harvest/HarvestRegistrationModal'
import { PhotoCaptureModal } from '../camera/PhotoCaptureModal'
import { ContextualTip } from '@/components/shared/ContextualTip'
import { BedManager } from '@/components/gardens/BedManager'
import OperationalDiary from '../diary/OperationalDiary'
import DailyGardenReport from './DailyGardenReport'
import ProfessionalDashboard from '../professional/ProfessionalDashboard'
import Link from 'next/link'

interface GardenViewProps {
  garden: Garden
  tasks: GardenTask[]
  activeTab: 'operations' | 'planning' | 'monitoring' | 'plants' | 'compliance' | 'analytics' | 'structure'
  onTabChange: (tab: 'operations' | 'planning' | 'monitoring' | 'plants' | 'compliance' | 'analytics' | 'structure') => void
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
    { id: 'operations' as const, label: 'Operazioni', icon: Activity },
    { id: 'planning' as const, label: 'Pianificazione', icon: Calendar },
    { id: 'monitoring' as const, label: 'Monitoraggio', icon: BarChart3 },
    { id: 'plants' as const, label: 'Piante & Vivaio', icon: Sprout },
    { id: 'compliance' as const, label: 'Conformità', icon: Shield },
    { id: 'analytics' as const, label: 'Analytics', icon: TrendingUp },
    { id: 'structure' as const, label: 'Struttura', icon: Grid3X3 }
  ]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 relative">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">🌱 Il Mio Orto</h1>
            <p className="text-sm text-gray-600">{garden.name}</p>
          </div>
          <ContextualTip
            id="garden-intro"
            title="Benvenuto in Il Mio Orto!"
            message="Qui puoi gestire tutte le tue coltivazioni: pianifica semine, visualizza il calendario, controlla i task e monitora le tue piante."
            position="bottom"
          />
          {/* Mobile: Dropdown menu for actions */}
          <div className="flex gap-2 md:gap-3">
            <Link
              href="/app/settings?section=gardens"
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 md:px-4 md:py-3 md:text-base"
              title="Gestisci i tuoi orti"
            >
              <Settings size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Gestisci Orti</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 text-sm md:px-4 md:text-base"
            >
              <Plus size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden sm:inline">Aggiungi</span>
            </button>
          </div>
        </div>
        
        {/* Tab Switcher - Mobile Responsive */}
        <div className="border-b border-gray-200">
          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-1 overflow-x-auto pb-2 md:gap-3 md:overflow-visible" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitScrollbar: { display: 'none' }
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 text-sm md:text-base md:px-4 ${
                    isActive
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="p-4">
        {activeTab === 'operations' && (
          <ProfessionalDashboard
            garden={garden}
            tasks={tasks}
            onTaskAction={(action, taskId) => {
              if (action === 'create') {
                setShowAddModal(true)
              } else if (action === 'view' && taskId) {
                // Navigate to task detail or open modal
                console.log('View task:', taskId)
              }
            }}
            onNavigate={(path) => {
              // Handle navigation to other sections
              if (path.includes('registry')) onTabChange('monitoring')
              else if (path.includes('compliance')) onTabChange('compliance')
              else if (path.includes('analytics')) onTabChange('analytics')
              else if (path.includes('planner')) onTabChange('planning')
            }}
          />
        )}

        {activeTab === 'planning' && (
          <div className="space-y-6">
            {/* AI Planning Integration */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="text-purple-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Pianificazione AI Professionale</h3>
                    <p className="text-sm text-gray-600">Ottimizza il calendario con intelligenza artificiale e dati reali</p>
                  </div>
                </div>
                <Link
                  href="/app/planner"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
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
                // Switch to operations view
                onTabChange('operations')
              }}
            />
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <OperationalDiary
              gardenId={garden.id}
              onEntryAdded={(entry) => {
                console.log('New diary entry:', entry)
              }}
            />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">🔗 Conformità e Tracciabilità</h2>
                <p className="text-gray-600 mt-1">Gestione automatica compliance e tracciabilità prodotti</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <Shield size={16} />
                Sistema Attivo
              </div>
            </div>
            
            <TraceabilityWidget
              garden={garden}
              tasks={tasks}
              onRecordActivity={(activity) => {
                console.log('New traceability record:', activity)
              }}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Business Intelligence Dashboard */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">📊 Business Intelligence</h2>
                  <p className="text-gray-600 mt-1">KPI operativi e analisi performance</p>
                </div>
                <Link
                  href="/app/analytics"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3"
                >
                  <BarChart3 size={16} />
                  Dashboard Completo
                </Link>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-green-600">Resa Media</p>
                      <p className="text-2xl font-bold text-green-700">2.3 kg/m²</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-blue-600">Efficienza</p>
                      <p className="text-2xl font-bold text-blue-700">87%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Package className="text-orange-600" size={20} />
                    <div>
                      <p className="text-sm text-orange-600">Costo/kg</p>
                      <p className="text-2xl font-bold text-orange-700">€1.20</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="text-purple-600" size={20} />
                    <div>
                      <p className="text-sm text-purple-600">Conformità</p>
                      <p className="text-2xl font-bold text-purple-700">100%</p>
                    </div>
                  </div>
                </div>
              </div>

              <DailyGardenReport
                garden={garden}
                tasks={tasks}
                onTaskClick={(taskId) => {
                  console.log('Task clicked:', taskId)
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'plants' && (
          <div className="space-y-6">
            {/* Header con AI Integration */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">🌱 Gestione Piante Professionale</h2>
                  <p className="text-gray-600 mt-1">Monitoraggio individuale e operazioni di precisione</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/app/planner"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
                  >
                    <Bot size={16} />
                    Pianifica con AI
                  </Link>
                  <Link
                    href="/app/plants"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3"
                  >
                    <Leaf size={16} />
                    Vista Completa
                  </Link>
                </div>
              </div>

              <PlantsView
                garden={garden}
                tasks={tasks}
                onUpdateTask={onUpdateTask}
              />
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Struttura e Layout</h2>
                <p className="text-gray-600 mt-1">Gestisci aiuole, filari e zone di coltivazione</p>
              </div>
              <button
                onClick={() => setShowBedManager(true)}
                className="flex items-center gap-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                  <span className="text-lg md:text-xl">{action.icon}</span>
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

