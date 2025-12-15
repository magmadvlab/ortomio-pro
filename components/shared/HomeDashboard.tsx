'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { Garden, GardenTask } from '@/types'
import { 
  ChevronDown, MapPin, Droplets, Moon, Sun, Snowflake, 
  Package, AlertTriangle, Calendar, Wrench, Info, Plus,
  CheckCircle, X, Loader2, Cloud, CloudRain, ThermometerSun
} from 'lucide-react'
import { generateWinterPreparationPlan } from '@/logic/winterPreparationEngine'
import { calculateMoonPhase } from '@/logic/lunarCalendar'
import VacationMode from '@/components/VacationMode'
import SeedInventory from '@/components/SeedInventory'
import { SeedlingReadyWidget } from '@/components/shared/SeedlingReadyWidget'
import SeedlingManager from '@/components/SeedlingManager'
import { SpecializedCropsWidget } from '@/components/shared/SpecializedCropsWidget'
import FruitTreeManagement from '@/components/FruitTreeManagement'
import StrawberryManagement from '@/components/StrawberryManagement'
import ExoticFruitManagement from '@/components/ExoticFruitManagement'
import AromaticManagement from '@/components/AromaticManagement'
import RaspberryManagement from '@/components/RaspberryManagement'
import OliveHarvest from '@/components/OliveHarvest'
import VineHarvest from '@/components/VineHarvest'
import { AccessoriesWidget } from '@/components/shared/AccessoriesWidget'
import { GardenBedsWidget } from '@/components/shared/GardenBedsWidget'
import { HydroponicMonitorWidget } from '@/components/shared/HydroponicMonitorWidget'
import { AquaponicMonitorWidget } from '@/components/shared/AquaponicMonitorWidget'
import { AeroponicMonitorWidget } from '@/components/shared/AeroponicMonitorWidget'
import GeographicMatchingWidget from '@/components/shared/GeographicMatchingWidget'
import { AccessoriesManager } from '@/components/AccessoriesManager'
import { BedManager } from '@/components/gardens/BedManager'
import { ReadingForm } from '@/components/hydroponic/ReadingForm'
import { getDailyGardenPlan } from '@/logic/director'
import { DailyPlan } from '@/types'
import { SeedlingBatch } from '@/services/seedlingService'
import { getMasterSheet } from '@/services/plantMasterService'
import Link from 'next/link'

interface HomeDashboardProps {
  garden?: Garden
  tasks?: GardenTask[]
  onUpdateGarden?: (garden: Garden) => void
  onUpdateTask?: (task: GardenTask) => void
}

export function HomeDashboard({ garden, tasks = [], onUpdateGarden, onUpdateTask }: HomeDashboardProps) {
  const { storageProvider } = useStorage()
  const { tier } = useTier()
  
  // Auto-sync listener
  useEffect(() => {
    const handleAutoSync = async () => {
      if (storageProvider && 'sync' in storageProvider && typeof storageProvider.sync === 'function') {
        try {
          await storageProvider.sync()
          localStorage.setItem('ortomio_last_sync', new Date().toISOString())
        } catch (error) {
          // Log error silently without interrupting UX
          console.error('Auto sync error:', error)
        }
      }
    }
    
    // Listen for auto-sync events
    window.addEventListener('ortomio-auto-sync', handleAutoSync)
    
    return () => {
      window.removeEventListener('ortomio-auto-sync', handleAutoSync)
    }
  }, [storageProvider])
  const [gardens, setGardens] = useState<Garden[]>([])
  const [activeGarden, setActiveGarden] = useState<Garden | null>(garden || null)
  const [isGardenSelectorOpen, setIsGardenSelectorOpen] = useState(false)
  const [gardenType, setGardenType] = useState<'Summer' | 'Winter'>('Winter')
  const [showSeedInventory, setShowSeedInventory] = useState(false)
  const [showSeedlingManager, setShowSeedlingManager] = useState(false)
  const [showVacationMode, setShowVacationMode] = useState(false)
  const [showSpecializedCropManagement, setShowSpecializedCropManagement] = useState<string | null>(null)
  const [prepTasks, setPrepTasks] = useState<any[]>([])
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [weather, setWeather] = useState<{ temp: number; code: number; rainForecastMm: number } | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [seedlingBatches, setSeedlingBatches] = useState<SeedlingBatch[]>([])
  // NEW STATES FOR ADVANCED SYSTEM WIDGETS
  const [showHydroponicReadingForm, setShowHydroponicReadingForm] = useState(false)
  const [showAquaponicReadingForm, setShowAquaponicReadingForm] = useState(false)
  const [showAeroponicReadingForm, setShowAeroponicReadingForm] = useState(false)
  const [showAccessoriesManager, setShowAccessoriesManager] = useState(false)
  const [showBedManager, setShowBedManager] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState<'hydroponic' | 'aquaponic' | 'aeroponic' | null>(null)
  
  // States for new garden creation
  const [showNewGardenModal, setShowNewGardenModal] = useState(false)
  const [newGardenData, setNewGardenData] = useState({
    name: '',
    sizeSqMeters: '',
    soilPh: '',
    soilType: ''
  })
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>(tasks || [])

  useEffect(() => {
    const loadSeedlingBatches = async () => {
      if (!activeGarden) return
      try {
        const batches = await storageProvider.getSeedlingBatches(activeGarden.id)
        setSeedlingBatches(batches)
      } catch (error) {
        console.error('Error loading seedling batches:', error)
      }
    }
    loadSeedlingBatches()
  }, [storageProvider, activeGarden])

  useEffect(() => {
    const loadGardens = async () => {
      try {
        const loadedGardens = await storageProvider.getGardens()
        setGardens(loadedGardens)
        if (loadedGardens.length > 0 && !activeGarden) {
          setActiveGarden(loadedGardens[0])
        }
      } catch (error) {
        console.error('Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider])

  // Load tasks when active garden changes
  useEffect(() => {
    const loadTasksForGarden = async () => {
      if (activeGarden) {
        try {
          const loadedTasks = await storageProvider.getTasks(activeGarden.id)
          setGardenTasks(loadedTasks || [])
        } catch (error) {
          console.error('Error loading tasks for garden:', error)
          setGardenTasks([])
        }
      } else {
        setGardenTasks([])
      }
    }
    loadTasksForGarden()
  }, [activeGarden, storageProvider])

  // Inizializza gardenType solo quando cambia activeGarden
  useEffect(() => {
    if (activeGarden) {
      // Determina tipo orto basato sul mese solo quando cambia l'orto attivo
      const month = new Date().getMonth() + 1
      setGardenType((month >= 4 && month <= 9) ? 'Summer' : 'Winter')
      
      // Carica meteo
      if (activeGarden.coordinates) {
        fetchWeather(activeGarden.coordinates.latitude, activeGarden.coordinates.longitude)
      }
    }
  }, [activeGarden])

  // Aggiorna i task preparatori quando cambia gardenType o activeGarden
  useEffect(() => {
    if (activeGarden) {
      // Carica lavori preparatori con il gardenType corrente (che può essere cambiato dall'utente)
      const prep = generateWinterPreparationPlan(activeGarden, gardenType)
      setPrepTasks(prep)
    }
  }, [activeGarden, gardenType])

  useEffect(() => {
    if (activeGarden && gardenTasks) {
      // Carica daily plan quando cambiano batch o tasks
      loadDailyPlan()
    }
  }, [activeGarden, gardenTasks, seedlingBatches])

  const fetchWeather = async (lat: number, lng: number) => {
    setWeatherLoading(true)
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=precipitation_sum,weathercode&timezone=auto`
      )
      const data = await response.json()
      if (data.current_weather && data.daily) {
        setWeather({
          temp: data.current_weather.temperature,
          code: data.current_weather.weathercode,
          rainForecastMm: data.daily.precipitation_sum[0] || 0
        })
      }
    } catch (e) {
      console.error('Weather fetch failed', e)
    } finally {
      setWeatherLoading(false)
    }
  }

  const loadDailyPlan = async () => {
    if (!activeGarden || !gardenTasks) return
    setLoadingPlan(true)
    try {
      const plan = await getDailyGardenPlan(activeGarden, gardenTasks, new Date(), undefined, undefined, seedlingBatches)
      setDailyPlan(plan)
    } catch (error) {
      console.error('Error loading daily plan:', error)
    } finally {
      setLoadingPlan(false)
    }
  }

  const moonPhase = calculateMoonPhase(new Date())
  const moonName = moonPhase.isWaxing ? 'Primo Quarto' : moonPhase.isWaning ? 'Ultimo Quarto' : moonPhase.phase === 'Full' ? 'Luna Piena' : moonPhase.phase === 'New' ? 'Luna Nuova' : 'Primo Quarto'
  const moonAdvice = moonPhase.isWaxing ? 'Luna Crescente: Ideale per semina foglie/frutti e trapianti' : moonPhase.isWaning ? 'Luna Calante: Ideale per semina radici e raccolta foglie' : ''

  const getSoilLabel = (type: string) => {
    const labels: Record<string, string> = {
      'Loamy': 'Franco',
      'Clay': 'Argilloso',
      'Sandy': 'Sabbioso',
      'Silty': 'Limoso'
    }
    return labels[type] || type
  }

  const getWeatherLabel = (code: number) => {
    if (code <= 3) return 'Sereno'
    if (code <= 48) return 'Nuvoloso'
    if (code <= 55) return 'Pioggia leggera'
    if (code <= 65) return 'Pioggia'
    if (code <= 77) return 'Neve'
    return 'Nuvoloso'
  }

  const getIrrigationStatus = () => {
    if (!weather) return { status: 'IRRIGAZIONE REGOLARE', detail: 'Meteo stabile.', color: 'bg-green-50 border-green-200' }
    if (weather.rainForecastMm > 5) return { status: 'IRRIGAZIONE SOSPESA', detail: 'Pioggia prevista.', color: 'bg-blue-50 border-blue-200' }
    if (weather.temp > 25) return { status: 'IRRIGAZIONE AUMENTATA', detail: 'Temperature elevate.', color: 'bg-orange-50 border-orange-200' }
    return { status: 'IRRIGAZIONE REGOLARE', detail: 'Meteo stabile.', color: 'bg-green-50 border-green-200' }
  }

  const irrigationStatus = getIrrigationStatus()
  const winterTasks = tasks.filter(t => !t.completed && t.season === 'Winter').length
  const upcomingReminders = tasks.filter(t => {
    if (!t.nextDueDate || t.completed) return false
    const due = new Date(t.nextDueDate)
    const diffDays = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  }).length

  const activePlants = tasks.filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant')).length

  if (!activeGarden) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nessun giardino trovato</p>
          <Link href="/app" className="text-green-600 hover:text-green-800 font-medium">
            Crea il tuo primo orto
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <button
              onClick={() => setIsGardenSelectorOpen(!isGardenSelectorOpen)}
              className="flex items-center gap-2 text-left"
            >
              <h1 className="text-xl font-bold text-gray-900">{activeGarden.name}</h1>
              <ChevronDown size={20} className="text-gray-500" />
            </button>
            <p className="text-xs text-gray-500 mt-0.5">Localizzato</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewGardenModal(true)}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Aggiungi Nuovo Orto"
            >
              <Plus size={20} />
            </button>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Garden Selector Dropdown */}
        {isGardenSelectorOpen && (
          <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {gardens.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGarden(g)
                  setIsGardenSelectorOpen(false)
                  if (onUpdateGarden) onUpdateGarden(g)
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <p className="font-semibold text-gray-900">{g.name}</p>
                <p className="text-xs text-gray-500">{g.sizeSqMeters} m²</p>
              </button>
            ))}
            <div className="border-t border-gray-200">
              <button
                onClick={() => {
                  setIsGardenSelectorOpen(false)
                  setShowNewGardenModal(true)
                }}
                className="w-full text-left px-4 py-3 hover:bg-green-50 text-green-600 font-semibold flex items-center gap-2"
              >
                <Plus size={16} />
                Aggiungi Nuovo Orto
              </button>
            </div>
          </div>
        )}

        {/* Garden Parameters */}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {activeGarden.sizeSqMeters} m²
          </span>
          {activeGarden.soilType && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {getSoilLabel(activeGarden.soilType)} {activeGarden.soilType === 'Loamy' ? '(Ideale)' : ''}
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            4h sole (Ombra parziale)
          </span>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <h2 className="text-sm font-medium opacity-90 mb-2">Meteo: {activeGarden.name}</h2>
          {weatherLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Caricamento...</span>
            </div>
          ) : weather ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud size={32} className="text-yellow-200" />
                <div>
                  <p className="text-sm opacity-90">{getWeatherLabel(weather.code)}</p>
                  <p className="text-3xl font-bold">{weather.temp.toFixed(1)}°C</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm opacity-80">Posizione non disponibile</p>
          )}
        </div>

        {/* Irrigation Status */}
        <div className={`${irrigationStatus.color} border rounded-xl p-4 flex items-center gap-3`}>
          <Droplets size={24} className="text-blue-600" />
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{irrigationStatus.status}</h3>
            <p className="text-xs text-gray-600">{irrigationStatus.detail}</p>
          </div>
        </div>

        {/* Preparatory Works */}
        {prepTasks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wrench size={20} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">
                  Preparazione per orto {gardenType === 'Summer' ? 'estivo' : 'invernale'}
                </h3>
              </div>
              <Info size={18} className="text-blue-600" />
            </div>
            <div className="space-y-2">
              {prepTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="bg-white rounded-lg border border-blue-100 p-3">
                  <button
                    onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                        <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {task.category === 'Structure' ? 'Struttura' : task.category === 'Fertilization' ? 'Concimazione' : 'Pianificazione'} {task.dueMonth === 1 ? 'Gen' : 'Feb'}
                        </span>
                      </div>
                      <ChevronDown 
                        size={18} 
                        className={`text-gray-400 transition-transform ${expandedTaskId === task.id ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>
                  {expandedTaskId === task.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Materiali:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {task.materials.map((mat: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{mat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Istruzioni:</p>
                        <ol className="text-xs text-gray-600 space-y-1">
                          {task.instructions.map((inst: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                              <span>{inst}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">Tempo stimato: {task.estimatedTime}</span>
                        <button
                          onClick={async () => {
                            // Aggiungi al diario
                            if (storageProvider && activeGarden) {
                              const newTask: GardenTask = {
                                id: crypto.randomUUID(),
                                gardenId: activeGarden.id,
                                plantName: task.title,
                                taskType: 'Treatment', // Usa Treatment come default per task generici
                                date: new Date().toISOString().split('T')[0],
                                notes: `${task.description}\n\nMateriali: ${task.materials.join(', ')}\nTempo: ${task.estimatedTime}`,
                                completed: false,
                                season: gardenType
                              }
                              try {
                                await storageProvider.createTask(newTask)
                                // Ricarica i tasks
                                const updatedTasks = await storageProvider.getTasks(activeGarden.id)
                                if (onUpdateTask && updatedTasks) {
                                  // Notifica il parent component se necessario
                                }
                                alert('Lavoro aggiunto al Diario!')
                              } catch (error) {
                                console.error('Error adding task:', error)
                                alert('Errore nell\'aggiunta del lavoro')
                              }
                            }
                          }}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Aggiungi al Diario
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lunar Phase */}
        <div className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={28} className="text-yellow-200" />
              <div>
                <h3 className="font-bold text-lg">Fase Lunare</h3>
                <p className="text-sm opacity-90">{moonName}</p>
              </div>
            </div>
            <div className="text-4xl">🌙</div>
          </div>
          {moonAdvice && (
            <p className="text-xs opacity-90 mt-2">{moonAdvice}</p>
          )}
        </div>

        {/* Garden Type Selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setGardenType('Summer')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                gardenType === 'Summer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sun size={16} className="inline mr-1" />
              Orto Estivo
            </button>
            <button
              onClick={() => setGardenType('Winter')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                gardenType === 'Winter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Snowflake size={16} className="inline mr-1" />
              Orto Invernale
            </button>
          </div>
        </div>

        {/* Vacation Mode */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Modalità Vacanza</h3>
                <p className="text-xs text-gray-600">Piano di sopravvivenza per le tue piante</p>
              </div>
            </div>
            <button
              onClick={() => setShowVacationMode(true)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Imposta Vacanza
            </button>
          </div>
        </div>

        {/* Plant Coach */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <Sun size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              {activePlants > 0 ? (
                <p className="text-sm text-gray-800">
                  Hai {activePlants} pianta/e attiva/e. Vai al Diario per vedere i suggerimenti!
                </p>
              ) : (
                <p className="text-sm text-gray-800">
                  Nessuna pianta attiva al momento. Aggiungi una semina o trapianto per ricevere suggerimenti personalizzati!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <Calendar size={24} className="mx-auto mb-2 text-gray-600" />
            <p className="text-xs text-gray-600 mb-1">ATTIVITÀ {gardenType === 'Summer' ? 'ESTIVE' : 'INVERNALI'}</p>
            <p className="text-2xl font-bold text-gray-900">{winterTasks}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <AlertTriangle size={24} className="mx-auto mb-2 text-orange-600" />
            <p className="text-xs text-gray-600 mb-1">PROMEMORIA IN SCADENZA</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingReminders}</p>
          </div>
        </div>

        {/* Seed Bank */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Banca dei Semi</h3>
                <p className="text-xs text-gray-600">Gestisci l'inventario dei tuoi semi</p>
              </div>
            </div>
            <button
              onClick={() => setShowSeedInventory(true)}
              className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
            >
              Apri
            </button>
          </div>
        </div>

        {/* Seedling Ready Widget */}
        {activeGarden && (
          <SeedlingReadyWidget 
            garden={activeGarden} 
            onOpenManager={() => setShowSeedlingManager(true)}
          />
        )}

        {/* Specialized Crops Widget */}
        {activeGarden && tasks && (
          <SpecializedCropsWidget
            garden={activeGarden}
            tasks={tasks}
            onOpenManagement={(cropType) => setShowSpecializedCropManagement(cropType)}
          />
        )}

        {/* Geographic Matching Widget */}
        {activeGarden && (
          <GeographicMatchingWidget garden={activeGarden} />
        )}

        {/* Advanced Growing Systems Widgets */}
        {activeGarden && (
          <>
            {/* Hydroponic Monitor */}
            {(activeGarden.gardenType?.startsWith('Hydroponic') || 
              activeGarden.gardenType === 'NFT' || 
              activeGarden.gardenType === 'DWC' || 
              activeGarden.gardenType === 'EbbFlow' || 
              activeGarden.gardenType === 'Drip' || 
              activeGarden.gardenType === 'Wick' || 
              activeGarden.gardenType === 'Kratky' ||
              activeGarden.gardenType === 'Hydroponic') && (
              <HydroponicMonitorWidget
                garden={activeGarden}
                onOpenDetails={() => setShowReadingForm('hydroponic')}
              />
            )}

            {/* Aquaponic Monitor */}
            {activeGarden.gardenType === 'Aquaponic' && (
              <AquaponicMonitorWidget
                garden={activeGarden}
                onOpenDetails={() => setShowReadingForm('aquaponic')}
              />
            )}

            {/* Aeroponic Monitor */}
            {activeGarden.gardenType === 'Aeroponic' && (
              <AeroponicMonitorWidget
                garden={activeGarden}
                onOpenDetails={() => setShowReadingForm('aeroponic')}
              />
            )}

            {/* Accessories Widget */}
            <AccessoriesWidget
              garden={activeGarden}
              onOpenManagement={() => setShowAccessoriesManager(true)}
            />
          </>
        )}

        {/* Garden Beds Widget - Always visible if garden exists */}
        {activeGarden ? (
          <GardenBedsWidget
            garden={activeGarden}
            tasks={tasks}
            onOpenManagement={() => setShowBedManager(true)}
          />
        ) : (
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
            <div className="text-center py-4 text-gray-500 text-sm">
              Nessun giardino selezionato
            </div>
          </div>
        )}

        {/* Urgent Reminders */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          {upcomingReminders > 0 ? (
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-600" />
              <p className="text-sm text-gray-800">
                Hai {upcomingReminders} promemoria in scadenza. Controlla il Diario!
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm text-gray-800">
                Tutto sotto controllo! Nessuna scadenza imminente.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showSeedInventory && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Banca dei Semi</h2>
              <button
                onClick={() => setShowSeedInventory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <SeedInventory garden={activeGarden} />
            </div>
          </div>
        </div>
      )}

      {showSeedlingManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Gestione Semenzai</h2>
              <button
                onClick={() => setShowSeedlingManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <SeedlingManager
                garden={activeGarden}
                batches={seedlingBatches}
                onBatchUpdate={async (batch) => {
                  await storageProvider.updateSeedlingBatch(batch.id, batch)
                  const updated = await storageProvider.getSeedlingBatches(activeGarden.id)
                  setSeedlingBatches(updated)
                }}
                onBatchCreate={async (batch) => {
                  await storageProvider.createSeedlingBatch(batch)
                  const updated = await storageProvider.getSeedlingBatches(activeGarden.id)
                  setSeedlingBatches(updated)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showVacationMode && activeGarden && onUpdateGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Modalità Vacanza</h2>
              <button
                onClick={() => setShowVacationMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <VacationMode 
                garden={activeGarden} 
                tasks={tasks}
                onUpdateGarden={onUpdateGarden}
              />
            </div>
          </div>
        </div>
      )}

      {/* Specialized Crop Management Modals */}
      {showSpecializedCropManagement && activeGarden && tasks && onUpdateTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {showSpecializedCropManagement === 'FruitTree' && 'Gestione Alberi da Frutto'}
                {showSpecializedCropManagement === 'Strawberry' && 'Gestione Fragole'}
                {showSpecializedCropManagement === 'Olive' && 'Gestione Olive'}
                {showSpecializedCropManagement === 'Vine' && 'Gestione Vite'}
                {showSpecializedCropManagement === 'ExoticFruit' && 'Gestione Frutti Esotici'}
                {showSpecializedCropManagement === 'Aromatic' && 'Gestione Erbe Aromatiche'}
                {showSpecializedCropManagement === 'Raspberry' && 'Gestione Lamponi'}
              </h2>
              <button
                onClick={() => setShowSpecializedCropManagement(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              {showSpecializedCropManagement === 'FruitTree' && (
                <FruitTreeManagement
                  tasks={tasks}
                  garden={activeGarden}
                  onUpdateTask={onUpdateTask}
                />
              )}
              {showSpecializedCropManagement === 'Strawberry' && (
                <StrawberryManagement
                  tasks={tasks}
                  garden={activeGarden}
                  onUpdateTask={onUpdateTask}
                />
              )}
              {showSpecializedCropManagement === 'ExoticFruit' && (
                <ExoticFruitManagement
                  tasks={tasks}
                  garden={activeGarden}
                  onUpdateTask={onUpdateTask}
                />
              )}
              {showSpecializedCropManagement === 'Aromatic' && (
                <AromaticManagement
                  tasks={tasks}
                  garden={activeGarden}
                  onUpdateTask={onUpdateTask}
                />
              )}
              {showSpecializedCropManagement === 'Raspberry' && (
                <RaspberryManagement
                  tasks={tasks}
                  garden={activeGarden}
                  onUpdateTask={onUpdateTask}
                />
              )}
              {showSpecializedCropManagement === 'Olive' && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Droplets className="text-yellow-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-800">Gestione Olivi</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    La gestione completa degli olivi e la registrazione della raccolta sono disponibili nel Diario.
                    Vai al Diario per registrare la raccolta delle olive e calcolare la resa di olio.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Colture Olivi Attive:</strong> {tasks.filter(t => {
                        const master = getMasterSheet(t.plantName);
                        return master?.cropType === 'Olive';
                      }).length}
                    </p>
                  </div>
                </div>
              )}
              {showSpecializedCropManagement === 'Vine' && (
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="text-purple-500" size={24} />
                    <h3 className="text-xl font-bold text-gray-800">Gestione Viti</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    La gestione completa delle viti e la registrazione della vendemmia sono disponibili nel Diario.
                    Vai al Diario per registrare la vendemmia e monitorare il Brix.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Colture Viti Attive:</strong> {tasks.filter(t => {
                        const master = getMasterSheet(t.plantName);
                        return master?.cropType === 'Vine';
                      }).length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accessories Manager Modal */}
      {showAccessoriesManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Gestione Accessori</h2>
              <button
                onClick={() => setShowAccessoriesManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <AccessoriesManager
                garden={activeGarden}
                onClose={() => setShowAccessoriesManager(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bed Manager Modal */}
      {showBedManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Gestione Zone di Coltivazione</h2>
              <button
                onClick={() => setShowBedManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <BedManager
                garden={activeGarden}
                tasks={tasks}
                onClose={() => setShowBedManager(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reading Form Modal */}
      {showReadingForm && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {showReadingForm === 'hydroponic' ? 'Registra Lettura Idroponica' : 
                 showReadingForm === 'aquaponic' ? 'Registra Test Acqua Acquaponica' : 
                 'Registra Lettura Aeroponica'}
              </h2>
              <button
                onClick={() => setShowReadingForm(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <ReadingForm
                garden={activeGarden}
                readingType={showReadingForm as 'hydroponic' | 'aquaponic'}
                onComplete={() => {
                  setShowReadingForm(null);
                  // Ricarica widget se necessario
                }}
                onCancel={() => setShowReadingForm(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Garden Creation Modal */}
      {showNewGardenModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nuovo Orto</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Orto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGardenData.name}
                  onChange={(e) => setNewGardenData({...newGardenData, name: e.target.value})}
                  placeholder="Es. Orto Casa"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensioni (m²) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newGardenData.sizeSqMeters}
                    onChange={(e) => setNewGardenData({...newGardenData, sizeSqMeters: e.target.value})}
                    placeholder="50"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    pH Suolo
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="9"
                    value={newGardenData.soilPh}
                    onChange={(e) => setNewGardenData({...newGardenData, soilPh: e.target.value})}
                    placeholder="6.5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo di Terreno
                </label>
                <select
                  value={newGardenData.soilType}
                  onChange={(e) => setNewGardenData({...newGardenData, soilType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Seleziona...</option>
                  <option value="Loamy">Franco (Equilibrato)</option>
                  <option value="Clay">Argilloso</option>
                  <option value="Sandy">Sabbioso</option>
                  <option value="Silty">Limoso</option>
                  <option value="Peaty">Torba</option>
                  <option value="Chalky">Calcareo</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewGardenModal(false)
                  setNewGardenData({ name: '', sizeSqMeters: '', soilPh: '', soilType: '' })
                }}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={async () => {
                  if (!newGardenData.name.trim() || !newGardenData.sizeSqMeters.trim()) {
                    alert('Compila almeno nome e dimensioni')
                    return
                  }
                  
                  const size = parseInt(newGardenData.sizeSqMeters)
                  if (isNaN(size) || size <= 0) {
                    alert('Le dimensioni devono essere un numero positivo')
                    return
                  }
                  
                  try {
                    const newGarden: Garden = {
                      id: crypto.randomUUID(),
                      name: newGardenData.name.trim(),
                      sizeSqMeters: size,
                      soilPh: newGardenData.soilPh ? parseFloat(newGardenData.soilPh) : undefined,
                      soilType: (newGardenData.soilType as Garden['soilType']) || undefined,
                      createdAt: new Date().toISOString(),
                      coordinates: activeGarden?.coordinates // Usa coordinate dell'orto corrente se disponibili
                    }
                    
                    await storageProvider.createGarden(newGarden)
                    const updatedGardens = await storageProvider.getGardens()
                    setGardens(updatedGardens)
                    setActiveGarden(newGarden)
                    setShowNewGardenModal(false)
                    setNewGardenData({ name: '', sizeSqMeters: '', soilPh: '', soilType: '' })
                    
                    // Carica task per il nuovo orto (saranno vuoti inizialmente)
                    const newGardenTasks = await storageProvider.getTasks(newGarden.id)
                    setGardenTasks(newGardenTasks || [])
                    
                    if (onUpdateGarden) {
                      onUpdateGarden(newGarden)
                    }
                  } catch (error) {
                    console.error('Error creating garden:', error)
                    alert('Errore nella creazione dell\'orto: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'))
                  }
                }}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Crea Orto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

