'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { FeatureGate } from '@/components/shared/FeatureGate'
import { OrchardConfiguration } from '@/types/orchard'
import { Garden, GardenTask } from '@/types'
import { orchardService } from '@/services/orchardService'
import OrchardDashboard from '@/components/orchard/OrchardDashboard'
import OrchardWizard from '@/components/orchard/OrchardWizard'
import TreeManager from '@/components/orchard/TreeManager'
import PruningManager from '@/components/orchard/PruningManager'
import HarvestManager from '@/components/orchard/HarvestManager'
import SmartPlantManager from '@/components/plants/SmartPlantManager'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { 
  TreePine, 
  ArrowLeft, 
  Settings, 
  Scissors, 
  Calendar, 
  BarChart3,
  Users,
  Eye,
  Plus,
  X,
  AlertCircle
} from 'lucide-react'

type ViewMode = 'dashboard' | 'trees' | 'individual-plants' | 'pruning' | 'harvest' | 'analytics'

export default function OrchardPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [selectedGardenId, setSelectedGardenId] = useState<string>('')
  const [selectedOrchard, setSelectedOrchard] = useState<OrchardConfiguration | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGardens()
  }, [storageProvider])

  const loadGardens = async () => {
    try {
      setLoading(true)
      const gardensList = await storageProvider.getGardens()
      setGardens(gardensList)
      
      if (gardensList.length > 0 && !selectedGardenId) {
        setSelectedGardenId(gardensList[0].id)
      }
    } catch (error) {
      console.error('Error loading gardens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrchard = () => {
    setShowWizard(true)
  }

  const handleSelectOrchard = (orchard: OrchardConfiguration) => {
    setSelectedOrchard(orchard)
    setViewMode('trees')
  }

  const handleWizardComplete = (orchardId: string) => {
    setShowWizard(false)
    // Reload orchards and select the new one
    loadGardens()
  }

  const renderNavigation = () => {
    if (!selectedOrchard) return null

    const navItems = [
      { key: 'trees', label: 'Alberi', icon: TreePine },
      { key: 'individual-plants', label: 'Piante Individuali', icon: Users },
      { key: 'pruning', label: 'Potature', icon: Scissors },
      { key: 'harvest', label: 'Raccolte', icon: Calendar },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 }
    ]

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedOrchard(null)
                setViewMode('dashboard')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Torna alla Dashboard
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Frutteto:</span>
            <span className="font-medium text-gray-900">{selectedOrchard.name}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => setViewMode(item.key as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  viewMode === item.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (!selectedGardenId) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TreePine className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Nessun giardino disponibile</p>
          <p className="text-sm text-gray-500">Crea un giardino dalla Dashboard per iniziare</p>
        </div>
      )
    }

    if (!selectedOrchard) {
      return (
        <OrchardDashboard
          gardenId={selectedGardenId}
          onCreateOrchard={handleCreateOrchard}
          onSelectOrchard={handleSelectOrchard}
        />
      )
    }

    switch (viewMode) {
      case 'trees':
        return (
          <TreeManager
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
          />
        )
      case 'individual-plants':
        const selectedGarden = gardens.find(g => g.id === selectedGardenId)
        return selectedGarden ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900">Gestione Piante Individuali</h3>
                  <p className="text-sm text-blue-800">
                    Tracciamento dettagliato di ogni singolo albero del frutteto con foto, salute e operazioni
                  </p>
                </div>
              </div>
            </div>
            <SmartPlantManager garden={selectedGarden} />
          </div>
        ) : null
      case 'pruning':
        return (
          <PruningManager
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
          />
        )
      case 'harvest':
        return (
          <HarvestManager
            orchardId={selectedOrchard.id}
            gardenId={selectedGardenId}
          />
        )
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Frutteto</h3>
            <p className="text-gray-600">Funzionalità in sviluppo</p>
          </div>
        )
      default:
        return (
          <OrchardDashboard
            gardenId={selectedGardenId}
            onCreateOrchard={handleCreateOrchard}
            onSelectOrchard={handleSelectOrchard}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TreePine className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <FeatureGate feature="ORCHARD">
      <div className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Garden Selection */}
        {gardens.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona Giardino
            </label>
            <select
              value={selectedGardenId}
              onChange={(e) => {
                setSelectedGardenId(e.target.value)
                setSelectedOrchard(null)
                setViewMode('dashboard')
              }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {gardens.map(garden => (
                <option key={garden.id} value={garden.id}>
                  {garden.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        {renderNavigation()}

        {/* Content */}
        {renderContent()}

        {/* Wizard Modal */}
        {showWizard && (
          <OrchardWizard
            gardenId={selectedGardenId}
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </div>
    </FeatureGate>
  )
}

// Componente per la sezione Colture Tropicali/Esotiche
interface TropicalExoticSectionProps {
  selectedGarden: Garden
  selectedLocation: any
  tasks: GardenTask[]
}

function TropicalExoticSection({ selectedGarden, selectedLocation, tasks }: TropicalExoticSectionProps) {
  const [showTropicalModal, setShowTropicalModal] = useState(false)
  const [tropicalCrops, setTropicalCrops] = useState<any[]>([])

  // Filtra le colture tropicali/esotiche dai task esistenti
  const tropicalTasks = (tasks || []).filter(task => {
    // Lista di piante tropicali/esotiche comuni
    const tropicalPlants = ['Avocado', 'Mango', 'Papaya', 'Passion Fruit', 'Dragon Fruit', 'Lychee', 'Guava', 'Jackfruit', 'Durian', 'Rambutan']
    return tropicalPlants.includes(task.plantName)
  })

  // Lista delle colture tropicali/esotiche disponibili
  const availableTropicalCrops = [
    {
      name: 'Avocado',
      scientificName: 'Persea americana',
      climate: 'Subtropicale',
      harvestPeriod: 'Ottobre-Marzo',
      difficulty: 'Media',
      description: 'Albero sempreverde con frutti ricchi di grassi sani',
      requirements: ['Terreno ben drenato', 'Protezione dal vento', 'Irrigazione regolare']
    },
    {
      name: 'Mango',
      scientificName: 'Mangifera indica',
      climate: 'Tropicale',
      harvestPeriod: 'Giugno-Settembre',
      difficulty: 'Alta',
      description: 'Re dei frutti tropicali, richiede clima caldo',
      requirements: ['Temperature >15°C', 'Alta umidità', 'Protezione dal freddo']
    },
    {
      name: 'Papaya',
      scientificName: 'Carica papaya',
      climate: 'Tropicale',
      harvestPeriod: 'Tutto l\'anno',
      difficulty: 'Media',
      description: 'Crescita rapida, frutti ricchi di enzimi',
      requirements: ['Terreno fertile', 'Irrigazione costante', 'Protezione dal vento']
    },
    {
      name: 'Passion Fruit',
      scientificName: 'Passiflora edulis',
      climate: 'Subtropicale',
      harvestPeriod: 'Luglio-Novembre',
      difficulty: 'Bassa',
      description: 'Rampicante vigoroso con frutti aromatici',
      requirements: ['Supporto per rampicante', 'Terreno acido', 'Buona esposizione']
    },
    {
      name: 'Dragon Fruit',
      scientificName: 'Hylocereus undatus',
      climate: 'Tropicale arido',
      harvestPeriod: 'Giugno-Ottobre',
      difficulty: 'Media',
      description: 'Cactus rampicante con frutti spettacolari',
      requirements: ['Terreno sabbioso', 'Supporto robusto', 'Irrigazione moderata']
    },
    {
      name: 'Lychee',
      scientificName: 'Litchi chinensis',
      climate: 'Subtropicale',
      harvestPeriod: 'Maggio-Luglio',
      difficulty: 'Alta',
      description: 'Frutto dolce e profumato, albero ornamentale',
      requirements: ['Inverni freschi', 'Estati calde', 'Alta umidità']
    },
    {
      name: 'Guava',
      scientificName: 'Psidium guajava',
      climate: 'Tropicale',
      harvestPeriod: 'Agosto-Dicembre',
      difficulty: 'Bassa',
      description: 'Frutto ricco di vitamina C, crescita facile',
      requirements: ['Terreno fertile', 'Irrigazione regolare', 'Potatura annuale']
    },
    {
      name: 'Jackfruit',
      scientificName: 'Artocarpus heterophyllus',
      climate: 'Tropicale',
      harvestPeriod: 'Aprile-Agosto',
      difficulty: 'Alta',
      description: 'Il frutto più grande del mondo, molto nutritivo',
      requirements: ['Spazio ampio', 'Clima costante', 'Terreno profondo']
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Bassa': return 'text-green-600 bg-green-100'
      case 'Media': return 'text-yellow-600 bg-yellow-100'
      case 'Alta': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getClimateIcon = (climate: string) => {
    if (climate.includes('Tropicale')) return '🌴'
    if (climate.includes('Subtropicale')) return '🌺'
    if (climate.includes('arido')) return '🌵'
    return '🌿'
  }

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg shadow-md p-6 border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌴</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Colture Tropicali & Esotiche</h2>
              <p className="text-gray-600">Esplora frutti esotici per il tuo frutteto</p>
            </div>
          </div>
          <button
            onClick={() => setShowTropicalModal(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={16} />
            Esplora Tropicali
          </button>
        </div>

        {/* Colture tropicali esistenti */}
        {tropicalTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tropicalTasks.map((task) => {
              return (
                <div key={task.id} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🥭</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.plantName}</h3>
                      {task.variety && (
                        <p className="text-sm text-gray-600">Varietà: {task.variety}</p>
                      )}
                      {task.startDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Piantato: {format(new Date(task.startDate), 'dd MMM yyyy', { locale: it })}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                        Coltura Tropicale
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">🌴</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna coltura tropicale ancora
            </h3>
            <p className="text-gray-600 mb-4">
              Aggiungi frutti esotici per diversificare il tuo frutteto
            </p>
            <button
              onClick={() => setShowTropicalModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Scopri le Opzioni
            </button>
          </div>
        )}
      </div>

      {/* Modal Colture Tropicali */}
      {showTropicalModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTropicalModal(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">🌴</span>
                  Colture Tropicali & Esotiche
                </h2>
                <p className="text-orange-100">Scopri frutti esotici per il tuo clima</p>
              </div>
              <button
                onClick={() => setShowTropicalModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Info Climate */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Considerazioni Climatiche</h3>
                    <p className="text-sm text-blue-800">
                      Le colture tropicali richiedono attenzioni speciali in clima mediterraneo. 
                      Considera protezioni invernali, serre o coltivazione in vaso per le specie più delicate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid Colture */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTropicalCrops.map((crop, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-3xl">{getClimateIcon(crop.climate)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                        <p className="text-sm text-gray-600 italic">{crop.scientificName}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4">{crop.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Clima:</span>
                        <span className="text-sm font-medium">{crop.climate}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Raccolta:</span>
                        <span className="text-sm font-medium">{crop.harvestPeriod}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Difficoltà:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(crop.difficulty)}`}>
                          {crop.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Requisiti:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {crop.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/app/planner?crop=${encodeURIComponent(crop.name)}`}
                        className="flex-1 bg-orange-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-orange-700 transition-colors"
                      >
                        Aggiungi al Planner
                      </Link>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors">
                        Info
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sezione Consigli */}
              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Consigli per Colture Tropicali
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                  <div>
                    <h4 className="font-semibold mb-2">🏠 Protezione Invernale</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Usa serre o tunnel per le specie delicate</li>
                      <li>• Coltiva in vaso per spostare al riparo</li>
                      <li>• Applica pacciamatura protettiva</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🌡️ Gestione Microclima</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Scegli posizioni riparate dal vento</li>
                      <li>• Crea zone di maggiore umidità</li>
                      <li>• Usa frangivento naturali</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">💧 Irrigazione Speciale</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Mantieni umidità costante del suolo</li>
                      <li>• Usa irrigazione a goccia</li>
                      <li>• Nebulizza le foglie se necessario</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🌱 Nutrizione Adeguata</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Usa fertilizzanti ricchi di potassio</li>
                      <li>• Integra con microelementi</li>
                      <li>• Monitora il pH del terreno</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between">
              <button
                onClick={() => setShowTropicalModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Chiudi
              </button>
              <Link
                href="/app/planner"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Vai al Planner
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}