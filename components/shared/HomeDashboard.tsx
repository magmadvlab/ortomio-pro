'use client'

import React, { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useTier } from '@/packages/core/hooks/useTier'
import { Garden, GardenTask } from '@/types'
import { 
  ChevronDown, MapPin, Droplets, Moon, Sun, Snowflake, 
  Package, AlertTriangle, Calendar, Wrench, Info, Plus,
  CheckCircle, X, Loader2, Cloud, CloudRain, ThermometerSun,
  Zap, Satellite, Map, BarChart3, ArrowRight
} from 'lucide-react'
import VacationMode from '@/components/VacationMode'
import SeedInventory from '@/components/SeedInventory'

import SeedlingManager from '@/components/SeedlingManager'

import SaplingManager from '@/components/SaplingManager'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'

import { TraditionalCropsWidget } from '@/components/shared/TraditionalCropsWidget'
import FruitTreeManagement from '@/components/FruitTreeManagement'
import StrawberryManagement from '@/components/StrawberryManagement'
import ExoticFruitManagement from '@/components/ExoticFruitManagement'
import AromaticManagement from '@/components/AromaticManagement'
import RaspberryManagement from '@/components/RaspberryManagement'
import OliveHarvest from '@/components/OliveHarvest'
import VineHarvest from '@/components/VineHarvest'


import { IrrigationZonesWidget } from '@/components/irrigation/IrrigationZonesWidget'
import IrrigationZoneManager from '@/components/irrigation/IrrigationZoneManager'
import { IrrigationZone } from '@/types/irrigation'






import { ReadingForm } from '@/components/hydroponic/ReadingForm'
import { getDailyGardenPlan } from '@/logic/director'
import { DailyPlan } from '@/types'
import { SeedlingBatch } from '@/services/seedlingService'
import { getMasterSheetSync } from '@/services/plantMasterService'
import { SeedPacket } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QuickActions } from './QuickActions'
import { GardenSelectorCard } from './GardenSelectorCard'
import { TaskCard } from './TaskCard'
import WeatherLunarWidget from '@/components/WeatherLunarWidget'
import AISuggestionsWidget from '@/components/ai/AISuggestionsWidget'
import { GardenCard } from './GardenCard'
import { ProgressCard } from './ProgressCard'
import { WeatherTaskWidget } from './WeatherTaskAlert'
import { isToday, isSameDay, addDays, parseISO, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Heart, Sparkles } from 'lucide-react'

interface HomeDashboardProps {
  garden?: Garden
  tasks?: GardenTask[]
  onUpdateGarden?: (garden: Garden) => void
  onUpdateTask?: (task: GardenTask) => void
  onRefreshTasks?: () => Promise<void>
}

export default function HomeDashboard({ garden, tasks = [], onUpdateGarden, onUpdateTask, onRefreshTasks }: HomeDashboardProps) {
  const { storageProvider } = useStorage()
  const { tier, isPro } = useTier()
  const router = useRouter()

  console.log('🏠 HomeDashboard render:', {
    gardenProp: garden?.name || 'NO GARDEN PROP',
    gardenId: garden?.id,
    tasksCount: tasks.length
  })

  const getBaselineDismissKey = (gardenId: string) => `ortomio_baseline_dismissed_${gardenId}`
  const getBaselineShowAllKey = (gardenId: string) => `ortomio_baseline_show_all_${gardenId}`
  const getBaselineDismissPrefKey = (gardenId: string) => `baseline_dismissed_${gardenId}`
  const getBaselineShowAllPrefKey = (gardenId: string) => `baseline_show_all_${gardenId}`
  const [dismissedBaselinePrompts, setDismissedBaselinePrompts] = useState<Record<string, string>>({})
  
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

  // Sync activeGarden with garden prop
  useEffect(() => {
    if (garden) {
      console.log('🔄 Syncing activeGarden from prop:', garden.name, garden.id)
      setActiveGarden(garden)
    }
  }, [garden])
  const [irrigationZones, setIrrigationZones] = useState<IrrigationZone[]>([])
  const [loadingIrrigationZones, setLoadingIrrigationZones] = useState(false)
  const [showSeedInventory, setShowSeedInventory] = useState(false)
  const [weather, setWeather] = useState<{ temp: number; code: number; rainForecastMm: number } | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [seedlingBatches, setSeedlingBatches] = useState<SeedlingBatch[]>([])
  const [seedPackets, setSeedPackets] = useState<SeedPacket[]>([])
  const [showAllBaselinePrompts, setShowAllBaselinePrompts] = useState(false)
  const [baselineSearch, setBaselineSearch] = useState('')
  const [baselinePriorityFilter, setBaselinePriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  // NEW STATES FOR ADVANCED SYSTEM WIDGETS
  const [showIrrigationManager, setShowIrrigationManager] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState<'hydroponic' | 'aquaponic' | 'aeroponic' | null>(null)
  
  // States for modals
  const [showVacationMode, setShowVacationMode] = useState(false)
  const [showSeedlingManager, setShowSeedlingManager] = useState(false)
  const [showSaplingManager, setShowSaplingManager] = useState(false)
  const [showSpecializedCropManagement, setShowSpecializedCropManagement] = useState<'FruitTree' | 'Strawberry' | 'Olive' | 'Vine' | 'ExoticFruit' | 'Aromatic' | 'Raspberry' | null>(null)
  
  // States for new garden creation
  const [showGardenTypeWizard, setShowGardenTypeWizard] = useState(false)
  
  // Use tasks prop directly instead of local state to prevent infinite loops
  const currentTasks = tasks || []

  // Helper function to refresh tasks
  const refreshTasks = React.useCallback(async () => {
    if (onRefreshTasks) {
      await onRefreshTasks()
    }
  }, [onRefreshTasks])

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
    const loadSeedPackets = async () => {
      if (!activeGarden) return
      try {
        const packets = await storageProvider.getSeedPackets(activeGarden.id)
        setSeedPackets(packets || [])
      } catch (error) {
        console.error('Error loading seed packets:', error)
        setSeedPackets([])
      }
    }
    loadSeedPackets()
  }, [storageProvider, activeGarden])

  useEffect(() => {
    const loadGardens = async () => {
      try {
        console.log('🔄 HomeDashboard: Loading gardens internally...')
        const loadedGardens = await storageProvider.getGardens()
        console.log('✅ HomeDashboard: Gardens loaded:', loadedGardens.length)
        setGardens(loadedGardens)
        // Only set activeGarden if we don't have one from props and none is set
        if (loadedGardens.length > 0 && !activeGarden && !garden) {
          console.log('✅ HomeDashboard: Setting first garden as active:', loadedGardens[0].name)
          setActiveGarden(loadedGardens[0])
        }
      } catch (error) {
        console.error('❌ HomeDashboard: Error loading gardens:', error)
      }
    }
    loadGardens()
  }, [storageProvider, garden])

  // Load irrigation zones when active garden changes
  useEffect(() => {
    const loadIrrigationZones = async () => {
      if (!activeGarden) {
        setIrrigationZones([])
        return
      }
      
      setLoadingIrrigationZones(true)
      try {
        // Prima carica i sistemi di irrigazione per questo giardino
        const systems = await storageProvider.getIrrigationSystems(activeGarden.id)
        
        // Poi carica tutte le zone per tutti i sistemi
        const allZones: IrrigationZone[] = []
        for (const system of systems) {
          const zones = await storageProvider.getIrrigationZones(system.id)
          allZones.push(...zones)
        }
        
        setIrrigationZones(allZones)
      } catch (error) {
        console.error('Error loading irrigation zones:', error)
        setIrrigationZones([])
      } finally {
        setLoadingIrrigationZones(false)
      }
    }
    
    loadIrrigationZones()
  }, [activeGarden, storageProvider])

  useEffect(() => {
    if (!activeGarden) return

    const loadDismissed = async () => {
      try {
        if (storageProvider.getUserPreference) {
          const fromCloud = await storageProvider.getUserPreference<Record<string, string>>(
            getBaselineDismissPrefKey(activeGarden.id)
          )
          if (fromCloud && typeof fromCloud === 'object') {
            setDismissedBaselinePrompts(fromCloud)
            return
          }
        }
      } catch (e) {
        // fallback below
      }

      try {
        const raw = localStorage.getItem(getBaselineDismissKey(activeGarden.id))
        const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {}
        setDismissedBaselinePrompts(parsed || {})
      } catch (e) {
        setDismissedBaselinePrompts({})
      }
    }

    loadDismissed()
  }, [activeGarden?.id, storageProvider])

  useEffect(() => {
    if (!activeGarden) return

    const loadShowAll = async () => {
      try {
        if (storageProvider.getUserPreference) {
          const fromCloud = await storageProvider.getUserPreference<boolean>(
            getBaselineShowAllPrefKey(activeGarden.id)
          )
          if (typeof fromCloud === 'boolean') {
            setShowAllBaselinePrompts(fromCloud)
            return
          }
        }
      } catch (e) {
        // fallback below
      }

      try {
        const raw = localStorage.getItem(getBaselineShowAllKey(activeGarden.id))
        setShowAllBaselinePrompts(raw === '1')
      } catch (e) {
        setShowAllBaselinePrompts(false)
      }
    }

    loadShowAll()
  }, [activeGarden?.id, storageProvider])

  // Load weather when active garden changes
  useEffect(() => {
    if (activeGarden && activeGarden.coordinates) {
      fetchWeather(activeGarden.coordinates.latitude, activeGarden.coordinates.longitude)
    }
  }, [activeGarden])

  // Removed useCallback to avoid dependency array issues
  // Function is now defined inline in useEffect

  const handleBaselineOption = async (promptId: string, option: any) => {
    if (!activeGarden) return
    if (!option) return

    if (option.actionType === 'open_wizard') {
      if (option.href) {
        router.push(option.href)
      }
      return
    }

    if (option.actionType === 'dismiss') {
      try {
        const updated = {
          ...dismissedBaselinePrompts,
          [promptId]: new Date().toISOString(),
        }
        localStorage.setItem(getBaselineDismissKey(activeGarden.id), JSON.stringify(updated))
        setDismissedBaselinePrompts(updated)

        if (storageProvider.setUserPreference) {
          await storageProvider.setUserPreference(getBaselineDismissPrefKey(activeGarden.id), updated)
        }
      } catch (error) {
        console.error('Error persisting dismissed baseline prompt:', error)
      }
      return
    }

    if (option.actionType !== 'create_task') return
    const tasksToCreate = option.createTasks || (option.createTask ? [option.createTask] : [])
    if (tasksToCreate.length === 0) return

    try {
      for (const t of tasksToCreate) {
        await storageProvider.createTask(t)
      }
      const updatedTasks = await storageProvider.getTasks(activeGarden.id)
      await refreshTasks()
    } catch (error) {
      console.error('Error applying baseline prompt option:', error)
      alert('Errore nella creazione del task. Riprova.')
    }
  }

  useEffect(() => {
    // Define loadDailyPlan inline to avoid dependency array issues
    const loadDailyPlan = async () => {
      if (!activeGarden || !tasks) return
      setLoadingPlan(true)
      try {
        const plan = await getDailyGardenPlan(
          activeGarden, 
          tasks, 
          new Date(), 
          undefined, 
          undefined, 
          seedlingBatches || [], 
          storageProvider, 
          seedPackets || []
        )
        setDailyPlan(plan)
      } catch (error) {
        // Gestisci silenziosamente l'errore (es. tabella irrigation_systems non esiste)
        // Il director continua comunque a funzionare senza irrigation tasks
        console.warn('Error loading daily plan (continuing without irrigation tasks):', error)
        // Imposta un piano vuoto per evitare loop
        setDailyPlan({
          date: new Date().toISOString().split('T')[0],
          urgentAlerts: [],
          lifecycleTasks: [],
          nutrientTasks: [],
          healthTasks: [],
          climateWarnings: [],
          baselinePrompts: [],
          lunarAdvice: undefined,
          priority: 'Low',
          irrigationTasks: []
        })
      } finally {
        setLoadingPlan(false)
      }
    }

    if (activeGarden && tasks) {
      loadDailyPlan()
    }
  }, [activeGarden, tasks, seedlingBatches, seedPackets, storageProvider])

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

  if (!activeGarden) {
    console.log('⚠️ HomeDashboard: No activeGarden, showing create message. Gardens:', gardens.length)
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

  console.log('✅ HomeDashboard: Rendering with activeGarden:', activeGarden.name, activeGarden.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header con Garden Selector Card - Solo mobile */}
      <header className="px-4 py-3 min-h-[44px] touch-manipulation sticky top-0 z-50 bg-transparent lg:hidden">
        <GardenSelectorCard
          gardens={gardens}
          activeGarden={activeGarden}
          tasks={tasks}
          onGardenChange={(garden) => {
            setActiveGarden(garden)
            if (onUpdateGarden) onUpdateGarden(garden)
          }}
          onAddGarden={() => setShowGardenTypeWizard(true)}
        />
      </header>

      <main className="p-4 lg:p-4 sm:p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Row: Garden Card + Weather Card */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Garden Card */}
          {activeGarden && (
            <GardenCard garden={activeGarden} tasks={currentTasks} />
          )}

          {/* Weather + Lunar Widget - Unified forecast with lunar advice */}
          {activeGarden && activeGarden.coordinates?.latitude && activeGarden.coordinates?.longitude && (
            <WeatherLunarWidget
              latitude={activeGarden.coordinates.latitude}
              longitude={activeGarden.coordinates.longitude}
              gardens={gardens}
              activePlants={currentTasks
                .filter(t => !t.completed && t.plantName)
                .map(t => ({
                  plantName: t.plantName,
                  minTemp: undefined
                }))
              }
            />
          )}
      </div>

        {/* AI Suggestions Widget - Suggerimenti urgenti */}
        {activeGarden && (
          <AISuggestionsWidget
            maxItems={3}
            priorities={['CRITICAL', 'HIGH']}
            compact={true}
          />
        )}

        {/* COSA FARE OGGI */}
        {(() => {
          const today = new Date()
          const todayTasks = currentTasks.filter(t => {
            if (t.completed) return false
            const taskDate = t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date)
            return isSameDay(taskDate, today)
          })

          return (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar size={20} className="text-green-600 lg:size-6" />
                  COSA FARE OGGI
                </h2>
                {todayTasks.length > 0 && (
                  <Link
                    href="/app/garden?tab=list"
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-3"
                  >
                    Vedi tutti
                    <ArrowRight size={16} />
                  </Link>
                )}
          </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  <p className="text-gray-600 font-medium">Nessun task per oggi!</p>
                  <p className="text-sm text-gray-500 mt-1">Goditi il tuo orto 🌱</p>
        </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todayTasks.slice(0, 6).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      compact={true}
                      onComplete={async (id) => {
                        const updatedTask = { ...task, completed: true }
                        if (onUpdateTask) {
                          await onUpdateTask(updatedTask)
                        }
                        // Ricarica tasks
                        await refreshTasks()
                      }}
                      onReschedule={async (id) => {
                        const newDate = addDays(new Date(), 1)
                        const updatedTask = { ...task, nextDueDate: format(newDate, 'yyyy-MM-dd') }
                        if (onUpdateTask) {
                          await onUpdateTask(updatedTask)
                        }
                      }}
                      onEdit={onUpdateTask}
                      onDelete={async (id) => {
                        await storageProvider.deleteTask(id)
                        await refreshTasks()
                      }}
                      onHarvest={async (harvestData) => {
                        await storageProvider.createHarvestLog({
                          ...harvestData,
                          gardenId: activeGarden!.id
                        } as any)
                      }}
                      onFertilize={async (fertData) => {
                        await storageProvider.createFertilizerApplicationLog(fertData)
                        // Ricarica tasks dopo fertilizzazione
                        await refreshTasks()
                      }}
                      showSuggestions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* METEO-INTELLIGENTE: Alert task riprogrammati per meteo sfavorevole */}
        {activeGarden && activeGarden.coordinates && (
          <WeatherTaskWidget
            garden={activeGarden}
            tasks={currentTasks}
            onTaskUpdate={async (task) => {
              await storageProvider.updateTask(task.id, task)
              await refreshTasks()
            }}
          />
        )}

        {/* DIRECTOR - BASELINE STAGIONALE (prompt strutturati) */}
        {dailyPlan && dailyPlan.baselinePrompts && dailyPlan.baselinePrompts.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-green-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles size={20} className="text-green-600 lg:size-6" />
                Checklist Stagionale
              </h2>
              <span className="text-xs font-semibold text-gray-500">Proposta dal Director</span>
            </div>

            <div className="flex flex-col md:flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1">
                <input
                  value={baselineSearch}
                  onChange={(e) => setBaselineSearch(e.target.value)}
                  placeholder="Cerca..."
                  className="w-full text-sm px-4 py-3 min-h-[44px] touch-manipulation text-base rounded-lg border border-gray-200 bg-white text-gray-800"
                />
              </div>
              <div>
                <select
                  value={baselinePriorityFilter}
                  onChange={(e) => setBaselinePriorityFilter(e.target.value as any)}
                  className="text-sm px-4 py-3 min-h-[44px] touch-manipulation text-base rounded-lg border border-gray-200 bg-white text-gray-800"
                >
                  <option value="All">Tutte le priorità</option>
                  <option value="High">Alta</option>
                  <option value="Medium">Media</option>
                  <option value="Low">Bassa</option>
                </select>
              </div>
            </div>

            {(() => {
              const q = baselineSearch.trim().toLowerCase()
              const visiblePrompts = dailyPlan.baselinePrompts
                .filter((p) => !dismissedBaselinePrompts[p.id])
                .filter((p) => (baselinePriorityFilter === 'All' ? true : p.priority === baselinePriorityFilter))
                .filter((p) => {
                  if (!q) return true
                  return `${p.title} ${p.body}`.toLowerCase().includes(q)
                })

              const hasMore = visiblePrompts.length > 6
              const promptsToShow = showAllBaselinePrompts ? visiblePrompts : visiblePrompts.slice(0, 6)

              return (
                <>
                  <div className="space-y-3">
                    {promptsToShow.map((p) => (
                      <div key={p.id} className="border border-gray-200 rounded-xl p-4 bg-green-50/40">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-gray-900">{p.title}</p>
                              <span className="px-2 py-0 min-h-[44px] touch-manipulation.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Stagionale
                              </span>
                              <span className={`px-2 py-0 min-h-[44px] touch-manipulation.5 rounded text-[10px] font-bold ${
                                p.priority === 'High' ? 'bg-red-100 text-red-700' :
                                p.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}
                              >
                                {p.priority === 'High' ? 'Alta' : p.priority === 'Medium' ? 'Media' : 'Bassa'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{p.body}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3">
                          {p.options.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => handleBaselineOption(p.id, opt)}
                              className={`text-sm font-semibold px-3 py-2 min-h-[44px] touch-manipulation rounded-lg border transition ${
                                opt.actionType === 'create_task'
                                  ? 'bg-white border-green-200 text-green-700 hover:bg-green-50'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() =>
                          setShowAllBaselinePrompts((v) => {
                            const next = !v
                            if (activeGarden) {
                              try {
                                localStorage.setItem(getBaselineShowAllKey(activeGarden.id), next ? '1' : '0')
                              } catch (e) {}

                              if (storageProvider.setUserPreference) {
                                storageProvider
                                  .setUserPreference(getBaselineShowAllPrefKey(activeGarden.id), next)
                                  .catch(() => {})
                              }
                            }
                            return next
                          })
                        }
                        className="text-sm font-semibold px-4 py-2 min-h-[44px] touch-manipulation rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        {showAllBaselinePrompts ? 'Mostra meno' : `Mostra altri (${visiblePrompts.length - 6})`}
                      </button>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Progress Card */}
        {activeGarden && (
          <ProgressCard tasks={currentTasks} gardenId={activeGarden.id} />
        )}

        {/* Link Rapidi alle Funzionalità Avanzate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Trattamenti */}
          <Link href="/app/nutrition">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Trattamenti AI</h3>
                  <p className="text-sm text-gray-600">Sistema intelligente</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Gestione completa fertilizzanti e trattamenti con suggerimenti AI
              </p>
              <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
                Vai ai Trattamenti
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Irrigazione */}
          <Link href="/app/irrigation">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplets className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Irrigazione</h3>
                  <p className="text-sm text-gray-600">Gestione intelligente</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Sistema irrigazione con consigli meteo e ottimizzazione consumi
              </p>
              <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                Vai all'Irrigazione
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* NDVI Satellitare */}
          <Link href="/app/ndvi">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Satellite className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">NDVI Satellitare</h3>
                  <p className="text-sm text-gray-600">Monitoraggio da satellite</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Analisi vegetazione con immagini satellitari Sentinel-2
              </p>
              <div className="mt-4 flex items-center text-purple-600 font-medium text-sm">
                Vai all'Analisi NDVI
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Mappe Prescrizione */}
          <Link href="/app/prescription-maps">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Map className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Mappe Prescrizione</h3>
                  <p className="text-sm text-gray-600">Precision farming</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Crea mappe a rateo variabile per trattori e macchinari
              </p>
              <div className="mt-4 flex items-center text-orange-600 font-medium text-sm">
                Vai alle Mappe
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Certificazioni */}
          <Link href="/app/certifications">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border-2 border-teal-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Certificazioni</h3>
                  <p className="text-sm text-gray-600">Bio, GlobalGAP, SQNPI</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Gestione completa certificazioni con form e checklist
              </p>
              <div className="mt-4 flex items-center text-teal-600 font-medium text-sm">
                Vai alle Certificazioni
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/app/analytics">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Statistiche e report</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Dashboard completa con grafici, trend e previsioni
              </p>
              <div className="mt-4 flex items-center text-pink-600 font-medium text-sm">
                Vai agli Analytics
                <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Modals */}
      {showSeedInventory && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Banca dei Semi</h2>
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
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Gestione Semenzai</h2>
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

      {showSaplingManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Gestione Alberelli</h2>
              <button
                onClick={() => setShowSaplingManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <SaplingManager
                garden={activeGarden}
                batches={[]} // Sarà caricato internamente dal componente
                onBatchUpdate={async (batch) => {
                  try {
                    await storageProvider.updateSaplingBatch(batch.id, batch)
                    // Il componente si ricaricherà automaticamente
                  } catch (error) {
                    console.error('Error updating sapling batch:', error)
                    alert('Errore durante l\'aggiornamento del batch')
                  }
                }}
                onBatchCreate={async (batch) => {
                  try {
                    await storageProvider.createSaplingBatch(batch)
                    // Il componente si ricaricherà automaticamente
                  } catch (error) {
                    console.error('Error creating sapling batch:', error)
                    alert('Errore durante la creazione del batch')
                  }
                }}
                onCreateOrchard={async (batch) => {
                  try {
                    if (!activeGarden) return
                    
                    // Create a specialized crop task for the orchard
                    const orchardTask: GardenTask = {
                      id: crypto.randomUUID(),
                      gardenId: activeGarden.id,
                      plantName: batch.plantName,
                      variety: batch.variety,
                      taskType: 'Transplant',
                      date: new Date().toISOString().split('T')[0],
                      notes: `Impianto specializzato creato da alberello batch: ${batch.plantName} (${batch.variety || 'varietà standard'})\nQuantità: ${batch.quantity} piante\nPortinnesto: ${batch.rootstock || 'Non specificato'}`,
                      completed: false,
                      season: 'Summer',
                      locationType: 'Ground',
                      stage: 'Vegetative'
                    }
                    
                    // Create the task
                    await storageProvider.createTask(orchardTask)
                    
                    // Update the batch to link it to the created orchard
                    const updatedBatch = {
                      ...batch,
                      specializedCropId: orchardTask.id,
                      phase: 'ReadyToOrchard' as const
                    }
                    await storageProvider.updateSaplingBatch(batch.id, updatedBatch)
                    
                    // Reload tasks and batches
                    await refreshTasks()
                    
                    alert(`Impianto specializzato creato con successo!\nPianta: ${batch.plantName}\nQuantità: ${batch.quantity} piante\nControlla il Diario per gestire il nuovo impianto.`)
                  } catch (error) {
                    console.error('Error creating orchard:', error)
                    alert('Errore durante la creazione dell\'impianto: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'))
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showVacationMode && activeGarden && onUpdateGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Modalità Vacanza</h2>
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
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">
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
            <div className="p-4 sm:p-4 sm:p-6">
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
                <div className="p-4 sm:p-4 sm:p-6 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Droplets className="text-yellow-full max-w-sm" size={24} />
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Olivi</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    La gestione completa degli olivi e la registrazione della raccolta sono disponibili nel Diario.
                    Vai al Diario per registrare la raccolta delle olive e calcolare la resa di olio.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Colture Olivi Attive:</strong> {tasks.filter(t => {
                        const master = getMasterSheetSync(t.plantName);
                        return master?.cropType === 'Olive';
                      }).length}
                    </p>
                  </div>
                </div>
              )}
              {showSpecializedCropManagement === 'Vine' && (
                <div className="p-4 sm:p-4 sm:p-6 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="text-purple-500" size={24} />
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">Gestione Viti</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    La gestione completa delle viti e la registrazione della vendemmia sono disponibili nel Diario.
                    Vai al Diario per registrare la vendemmia e monitorare il Brix.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Colture Viti Attive:</strong> {tasks.filter(t => {
                        const master = getMasterSheetSync(t.plantName);
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

      {/* Irrigation Zone Manager Modal */}
      {showIrrigationManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Gestione Zone Irrigue</h2>
              <button
                onClick={() => setShowIrrigationManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {/* TODO: Caricare zone da storage */}
              <IrrigationZoneManager
                garden={activeGarden}
                zones={irrigationZones}
                onZoneUpdate={async (zone) => {
                  try {
                    await storageProvider.updateIrrigationZone(zone.id, zone)
                    // Ricarica le zone
                    const systems = await storageProvider.getIrrigationSystems(activeGarden.id)
                    const allZones: IrrigationZone[] = []
                    for (const system of systems) {
                      const zones = await storageProvider.getIrrigationZones(system.id)
                      allZones.push(...zones)
                    }
                    setIrrigationZones(allZones)
                  } catch (error) {
                    console.error('Error updating irrigation zone:', error)
                    alert('Errore durante l\'aggiornamento della zona')
                  }
                }}
                onZoneDelete={async (zoneId) => {
                  try {
                    await storageProvider.deleteIrrigationZone(zoneId)
                    // Rimuovi la zona dallo stato locale
                    setIrrigationZones(prev => prev.filter(z => z.id !== zoneId))
                  } catch (error) {
                    console.error('Error deleting irrigation zone:', error)
                    alert('Errore durante l\'eliminazione della zona')
                  }
                }}
                onZoneCreate={async (zone) => {
                  try {
                    const newZone = await storageProvider.createIrrigationZone(zone)
                    // Aggiungi la nuova zona allo stato locale
                    setIrrigationZones(prev => [...prev, newZone])
                  } catch (error) {
                    console.error('Error creating irrigation zone:', error)
                    alert('Errore durante la creazione della zona')
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reading Form Modal */}
      {showReadingForm && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-[95vw] sm:max-w-[95vw] sm:max-w-2xl w-full max-h-[95vh] sm:max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">
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

      {/* Garden Type Wizard */}
      {showGardenTypeWizard && (
        <GardenTypeWizard
          onComplete={async (garden) => {
            try {
              await storageProvider.createGarden(garden)
              const updatedGardens = await storageProvider.getGardens()
              setGardens(updatedGardens)
              setActiveGarden(garden)
              setShowGardenTypeWizard(false)
              
              // Carica task per il nuovo giardino (saranno vuoti inizialmente)
              await refreshTasks()
              
              if (onUpdateGarden) {
                onUpdateGarden(garden)
              }
            } catch (error) {
              console.error('Error creating garden:', error)
              alert('Errore nella creazione: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'))
            }
          }}
          onCancel={() => setShowGardenTypeWizard(false)}
        />
      )}

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  )
}