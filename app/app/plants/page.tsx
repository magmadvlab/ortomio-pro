'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { Garden, GardenTask } from '@/types'
import { Sprout, Package, TreePine, Plus, ArrowRight } from 'lucide-react'
import { PlantsView } from '@/components/garden/PlantsView'
import SeedInventory from '@/components/seedbank/SeedInventory'
import SaplingDashboard from '@/components/seedbank/SaplingDashboard'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import Link from 'next/link'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'

type TabType = 'plants' | 'seeds' | 'saplings' | 'trees'

export default function PlantsPage() {
  const { storageProvider } = useStorage()
  const searchParams = useSearchParams()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [tasks, setTasks] = useState<GardenTask[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('plants')
  const [showGardenWizard, setShowGardenWizard] = useState(false)
  
  // URL parameters
  const gardenParam = searchParams.get('garden')
  const fieldRowParam = searchParams.get('fieldRow')
  const tabParam = searchParams.get('tab') as TabType | null

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedGardens, loadedTasks] = await Promise.all([
          storageProvider.getGardens(),
          storageProvider.getTasks()
        ])
        setGardens(loadedGardens)
        setTasks(loadedTasks)
        
        // If a specific row is requested, force plants tab for coherent navigation
        if (fieldRowParam) {
          setActiveTab('plants')
        } else if (tabParam && ['plants', 'seeds', 'saplings', 'trees'].includes(tabParam)) {
          setActiveTab(tabParam)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [storageProvider, tabParam, fieldRowParam])

  const handleUpdateTask = async (updatedTask: GardenTask) => {
    try {
      await storageProvider.updateTask(updatedTask.id, updatedTask)
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    )
  }

  const activeGarden = gardenParam
    ? gardens.find(g => g.id === gardenParam) || gardens[0]
    : gardens[0]

  if (!activeGarden) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nessun orto trovato</h2>
            <p className="text-gray-600 mb-6">Crea il tuo primo orto per iniziare</p>
            <button
              onClick={() => setShowGardenWizard(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Crea il tuo orto
            </button>
          </div>
        </div>

        {/* Garden Creation Wizard */}
        {showGardenWizard && (
          <GardenTypeWizard
            onComplete={async (garden) => {
              try {
                console.log('✅ Garden created:', garden)
                const updatedGardens = await storageProvider.getGardens()
                setGardens(updatedGardens)
                setShowGardenWizard(false)
              } catch (error) {
                console.error('Error after garden creation:', error)
              }
            }}
            onCancel={() => setShowGardenWizard(false)}
          />
        )}
      </>
    )
  }

  const tabs = [
    { id: 'plants' as const, label: 'Piante in Orto', icon: Sprout, description: 'Piante già coltivate' },
    { id: 'seeds' as const, label: 'Banca Semi', icon: Package, description: 'Inventario semi' },
    { id: 'saplings' as const, label: 'Vivaio', icon: Sprout, description: 'Piantine da trapiantare' },
    { id: 'trees' as const, label: 'Alberi & Perenni', icon: TreePine, description: 'Frutteto, vigneto, oliveto' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/app/garden/rows?garden=${activeGarden.id}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Torna ai filari"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {fieldRowParam ? (
                    <>🌾 Piante del Filare - {activeGarden.name}</>
                  ) : (
                    <>🌱 Gestione Piante Professionale</>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {fieldRowParam ? (
                    `Visualizzazione piante individuali del filare selezionato in ${activeGarden.name}`
                  ) : (
                    `Monitoraggio completo di piante, semi, vivaio e alberi per ${activeGarden.name}`
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/app/semenzaio"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Sprout size={16} />
                Semenzaio
              </Link>
              <Link
                href={`/app/garden?tab=plants&garden=${activeGarden.id}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Aggiungi Pianta
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'text-green-600 border-green-600 bg-green-50'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'plants' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Sprout className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Piante Attive</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(tasks || []).filter(t => !t.completed && t.gardenId === activeGarden.id).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Package className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Varietà Coltivate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set((tasks || []).filter(t => t.gardenId === activeGarden.id).map(t => t.plantName)).size}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Sprout className="text-orange-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Pronte per Raccolto</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(tasks || []).filter(t => t.stage === 'Fruiting' && t.gardenId === activeGarden.id).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <TreePine className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Nuove Semine</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(tasks || []).filter(t => {
                        const plantingDate = new Date(t.date)
                        const daysAgo = (new Date().getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24)
                        return daysAgo <= 7 && t.gardenId === activeGarden.id
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Row Filter Notification */}
            {fieldRowParam && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">🌾</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Filtrando per Filare Specifico</h3>
                      <p className="text-sm text-blue-700">
                        Visualizzando solo le piante del filare selezionato dalla dashboard
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/app/plants?tab=plants&garden=${activeGarden.id}`}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Vedi Tutte
                  </Link>
                </div>
              </div>
            )}

            {/* Smart Plant Manager Integration */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      🔍 Monitoraggio Piante Individuali
                    </h2>
                    <p className="text-gray-600 mt-1">Sistema avanzato per tracciare ogni singola pianta</p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/app/semenzaio"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                    >
                      <Sprout size={16} />
                      Vivaio
                    </Link>
                    <Link
                      href={`/app/garden?tab=plants&garden=${activeGarden.id}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Aggiungi Pianta
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Smart Plant Manager Component */}
              <SmartPlantManager 
                garden={activeGarden} 
                fieldRow={fieldRowParam || undefined}
              />
            </div>

            {/* Traditional Plants View (Legacy) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vista Tradizionale (Tasks)</h3>
                <span className="text-sm text-gray-500">Sistema legacy - migrazione in corso</span>
              </div>
              <PlantsView
                garden={activeGarden}
                tasks={(tasks || []).filter(t => t.gardenId === activeGarden.id)}
                onUpdateTask={handleUpdateTask}
              />
            </div>
          </div>
        )}

        {activeTab === 'seeds' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Package className="text-blue-600" />
                    Banca dei Semi
                  </h2>
                  <p className="text-gray-600 mt-1">Gestisci il tuo inventario di semi e pianifica le semine</p>
                </div>
                <Link
                  href="/app/semenzaio?action=add-seed"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Aggiungi Semi
                </Link>
              </div>
              
              <SeedInventory garden={activeGarden} />
            </div>
          </div>
        )}

        {activeTab === 'saplings' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Sprout className="text-orange-600" />
                    Vivaio e Piantine
                  </h2>
                  <p className="text-gray-600 mt-1">Gestisci piantine da trapiantare e pianifica i trapianti</p>
                </div>
                <Link
                  href="/app/semenzaio?action=add-sapling"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Aggiungi Piantine
                </Link>
              </div>
              
              <SaplingDashboard garden={activeGarden} />
            </div>
          </div>
        )}

        {activeTab === 'trees' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <TreePine className="text-purple-600" />
                    Alberi e Piante Perenni
                  </h2>
                  <p className="text-gray-600 mt-1">Gestione specializzata per frutteto, vigneto e oliveto</p>
                </div>
              </div>

              {/* Specialized Systems Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Frutteto */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TreePine className="text-green-600" size={32} />
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Frutteto</h3>
                      <p className="text-sm text-green-700">Gestione alberi da frutto</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-800 mb-4">
                    Sistema specializzato per la gestione di alberi da frutto con monitoraggio individuale, 
                    potature programmate e analisi della produzione.
                  </p>
                  <Link
                    href="/app/orchard"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apri Frutteto
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Vigneto */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-purple-600 text-2xl">🍇</div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">Vigneto</h3>
                      <p className="text-sm text-purple-700">Gestione viti e vendemmia</p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-800 mb-4">
                    Sistema specializzato per la viticoltura con gestione delle viti individuali, 
                    monitoraggio della maturazione e pianificazione della vendemmia.
                  </p>
                  <Link
                    href="/app/vineyard"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Apri Vigneto
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Oliveto */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-yellow-600 text-2xl">🫒</div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-900">Oliveto</h3>
                      <p className="text-sm text-yellow-700">Gestione olivi e raccolta</p>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-800 mb-4">
                    Sistema specializzato per l'olivicoltura con monitoraggio degli olivi, 
                    gestione delle potature e ottimizzazione della raccolta.
                  </p>
                  <Link
                    href="/app/olives"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Apri Oliveto
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Integration Note */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl">💡</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Gestione Integrata</h4>
                    <p className="text-sm text-blue-800">
                      Le piante perenni (alberi da frutto, viti, olivi) sono gestite attraverso sistemi specializzati 
                      che offrono funzionalità avanzate specifiche per ogni tipo di coltivazione. 
                      Ogni sistema include monitoraggio individuale delle piante, pianificazione delle operazioni 
                      e analisi della produzione.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
