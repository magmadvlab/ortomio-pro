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
import { SaplingReadyWidget } from '@/components/shared/SaplingReadyWidget'
import SaplingManager from '@/components/SaplingManager'
import { GardenTypeWizard } from '@/components/GardenTypeWizard'
import { SpecializedCropsWidget } from '@/components/shared/SpecializedCropsWidget'
import { TraditionalCropsWidget } from '@/components/shared/TraditionalCropsWidget'
import FruitTreeManagement from '@/components/FruitTreeManagement'
import StrawberryManagement from '@/components/StrawberryManagement'
import ExoticFruitManagement from '@/components/ExoticFruitManagement'
import AromaticManagement from '@/components/AromaticManagement'
import RaspberryManagement from '@/components/RaspberryManagement'
import OliveHarvest from '@/components/OliveHarvest'
import VineHarvest from '@/components/VineHarvest'
import { AccessoriesWidget } from '@/components/shared/AccessoriesWidget'
import { GardenBedsWidget } from '@/components/shared/GardenBedsWidget'
import { IrrigationZonesWidget } from '@/components/irrigation/IrrigationZonesWidget'
import { IrrigationZoneManager } from '@/components/irrigation/IrrigationZoneManager'
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
import { getMasterSheetSync } from '@/services/plantMasterService'
import { SeedPacket } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QuickActions } from './QuickActions'
import { GardenSelectorCard } from './GardenSelectorCard'
import { TaskCard } from './TaskCard'
import WeatherWidget from '@/components/WeatherWidget'
import { GardenCard } from './GardenCard'
import { ProgressCard } from './ProgressCard'
import { WeatherTaskWidget } from './WeatherTaskAlert'
import { isToday, isSameDay, addDays, parseISO, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Heart, ArrowRight, Sparkles } from 'lucide-react'

interface HomeDashboardProps {
  garden?: Garden
  tasks?: GardenTask[]
  onUpdateGarden?: (garden: Garden) => void
  onUpdateTask?: (task: GardenTask) => void
}

export function HomeDashboard({ garden, tasks = [], onUpdateGarden, onUpdateTask }: HomeDashboardProps) {
  const { storageProvider } = useStorage()
  const { tier, isPro } = useTier()
  const router = useRouter()

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
  const [gardenType, setGardenType] = useState<'Summer' | 'Winter'>('Winter')
  const [showSeedInventory, setShowSeedInventory] = useState(false)
  const [showSeedlingManager, setShowSeedlingManager] = useState(false)
  const [showSaplingManager, setShowSaplingManager] = useState(false)
  const [showVacationMode, setShowVacationMode] = useState(false)
  const [showSpecializedCropManagement, setShowSpecializedCropManagement] = useState<string | null>(null)
  const [prepTasks, setPrepTasks] = useState<any[]>([])
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
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
  const [showHydroponicReadingForm, setShowHydroponicReadingForm] = useState(false)
  const [showAquaponicReadingForm, setShowAquaponicReadingForm] = useState(false)
  const [showAeroponicReadingForm, setShowAeroponicReadingForm] = useState(false)
  const [showAccessoriesManager, setShowAccessoriesManager] = useState(false)
  const [showBedManager, setShowBedManager] = useState(false)
  const [showIrrigationManager, setShowIrrigationManager] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState<'hydroponic' | 'aquaponic' | 'aeroponic' | null>(null)
  
  // States for new garden creation
  const [showGardenTypeWizard, setShowGardenTypeWizard] = useState(false)
  // Memoizza tasks per evitare re-render inutili
  const tasksMemo = React.useMemo(() => tasks || [], [tasks])
  const [gardenTasks, setGardenTasks] = useState<GardenTask[]>(tasksMemo)
  
  // Aggiorna gardenTasks solo se tasks cambia realmente
  React.useEffect(() => {
    setGardenTasks(tasksMemo)
  }, [tasksMemo])

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

  const loadDailyPlan = React.useCallback(async () => {
    if (!activeGarden || !gardenTasks) return
    setLoadingPlan(true)
    try {
      const plan = await getDailyGardenPlan(activeGarden, gardenTasks, new Date(), undefined, undefined, seedlingBatches, storageProvider, seedPackets)
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
  }, [activeGarden, gardenTasks, seedlingBatches, storageProvider, seedPackets])

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
      setGardenTasks(updatedTasks || [])
    } catch (error) {
      console.error('Error applying baseline prompt option:', error)
      alert('Errore nella creazione del task. Riprova.')
    }
  }

  useEffect(() => {
    if (activeGarden && gardenTasks) {
      // Carica daily plan quando cambiano batch o tasks
      loadDailyPlan()
    }
  }, [activeGarden, gardenTasks, seedlingBatches, loadDailyPlan])

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
      {/* Header con Garden Selector Card - Solo mobile */}
      <header className="px-4 py-3 sticky top-0 z-10 bg-transparent lg:hidden">
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

      <main className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top Row: Garden Card + Weather Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Garden Card */}
          {activeGarden && (
            <GardenCard garden={activeGarden} tasks={gardenTasks} />
          )}
          
          {/* Weather Card */}
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl p-5 lg:p-6 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium opacity-90 mb-1">Meteo: {activeGarden.name}</h2>
              {activeGarden.coordinates && (
                <p className="text-xs opacity-75">
                  {format(new Date(), 'EEEE d MMMM', { locale: it })}
                </p>
              )}
            </div>
            {weather && (
              <div className="text-right">
                <div className="text-4xl font-bold">{weather.temp.toFixed(0)}°</div>
                <p className="text-xs opacity-90">{getWeatherLabel(weather.code)}</p>
              </div>
            )}
          </div>
          
          {weatherLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Caricamento meteo...</span>
            </div>
          ) : weather ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                <CloudRain size={18} className="mx-auto mb-1 sm:size-5" />
                <p className="text-xs opacity-90">Pioggia</p>
                <p className="text-base sm:text-lg font-bold">{weather.rainForecastMm.toFixed(0)}mm</p>
                </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                <ThermometerSun size={18} className="mx-auto mb-1 sm:size-5" />
                <p className="text-xs opacity-90">Temperatura</p>
                <p className="text-base sm:text-lg font-bold">{weather.temp.toFixed(0)}°C</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                <Cloud size={18} className="mx-auto mb-1 sm:size-5" />
                <p className="text-xs opacity-90">Condizioni</p>
                <p className="text-xs sm:text-sm font-semibold">{getWeatherLabel(weather.code)}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-sm opacity-80">Posizione non disponibile</p>
              <p className="text-xs opacity-60 mt-1">Aggiungi coordinate per vedere il meteo</p>
            </div>
          )}
        </div>
      </div>

        {/* COSA FARE OGGI */}
        {(() => {
          const today = new Date()
          const todayTasks = gardenTasks.filter(t => {
            if (t.completed) return false
            const taskDate = t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date)
            return isSameDay(taskDate, today)
          })

          return (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-green-600 lg:size-6" />
                  COSA FARE OGGI
                </h2>
                {todayTasks.length > 0 && (
                  <Link
                    href="/app/garden?tab=list"
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        if (activeGarden) {
                          const updatedTasks = await storageProvider.getTasks(activeGarden.id)
                          setGardenTasks(updatedTasks || [])
                        }
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
                        if (activeGarden) {
                          const updatedTasks = await storageProvider.getTasks(activeGarden.id)
                          setGardenTasks(updatedTasks || [])
                        }
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
                        if (activeGarden) {
                          const updatedTasks = await storageProvider.getTasks(activeGarden.id)
                          setGardenTasks(updatedTasks || [])
                        }
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
            tasks={gardenTasks}
            onTaskUpdate={async (task) => {
              await storageProvider.updateTask(task.id, task)
              const updatedTasks = await storageProvider.getTasks(activeGarden.id)
              setGardenTasks(updatedTasks || [])
            }}
          />
        )}

        {/* DIRECTOR - BASELINE STAGIONALE (prompt strutturati) */}
        {dailyPlan && dailyPlan.baselinePrompts && dailyPlan.baselinePrompts.length > 0 && (
          <div className="bg-white rounded-xl border-2 border-green-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-green-600 lg:size-6" />
                Checklist Stagionale
              </h2>
              <span className="text-xs font-semibold text-gray-500">Proposta dal Director</span>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="flex-1">
                <input
                  value={baselineSearch}
                  onChange={(e) => setBaselineSearch(e.target.value)}
                  placeholder="Cerca..."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800"
                />
              </div>
              <div>
                <select
                  value={baselinePriorityFilter}
                  onChange={(e) => setBaselinePriorityFilter(e.target.value as any)}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800"
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
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{p.title}</p>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Stagionale
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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

                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.options.map((opt) => (
                            <button
                              key={opt.id}
                              onClick={() => handleBaselineOption(p.id, opt)}
                              className={`text-sm font-semibold px-3 py-2 rounded-lg border transition ${
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
                        className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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

        {/* Bottom Row: Health + Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Widget Stato Salute */}
          {(() => {
            const activePlants = gardenTasks.filter(t => !t.completed && (t.taskType === 'Sowing' || t.taskType === 'Transplant'))
            const healthStatus = activePlants.length > 0 ? 'good' : 'none'
            
            return (
              <Link href="/app/advice" className="block">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow h-full">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart size={18} className="text-green-600" />
                    Stato Salute
                  </h3>
                  
                  {healthStatus === 'none' ? (
                    <p className="text-sm text-gray-600">Aggiungi piante per monitorare la loro salute</p>
                  ) : (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                          😊
                        </div>
                        <div className="flex-1">
                          <h4 className="text-green-600 font-semibold mb-0.5">Buono</h4>
                          <p className="text-xs text-gray-500">{activePlants.length} piante monitorate</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-green-600">
                          ✅ {activePlants.length} piante in salute
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-amber-100 rounded-lg text-sm text-amber-600">
                          ⚠️ 0 richiedono attenzione
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            )
          })()}

          {/* Prossimi Giorni */}
          {(() => {
            const nextDays = [1, 2, 3, 4, 5, 6, 7].map(days => {
              const date = addDays(new Date(), days)
              const dayTasks = gardenTasks.filter(t => {
                if (t.completed) return false
                const taskDate = t.nextDueDate ? parseISO(t.nextDueDate) : parseISO(t.date)
                return isSameDay(taskDate, date)
              })
              return { date, tasks: dayTasks, dayName: format(date, 'EEEE', { locale: it }) }
            })
            
            const hasUpcomingTasks = nextDays.some(d => d.tasks.length > 0)
            
            return (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-gray-600" />
                  Prossimi Giorni
                </h3>
                
                {!hasUpcomingTasks ? (
                  <p className="text-sm text-gray-600 text-center py-4">
                    Nessun task programmato per i prossimi 7 giorni
                  </p>
                ) : (
                  <div className="space-y-2">
                    {nextDays.filter(d => d.tasks.length > 0).slice(0, 5).map((day, idx) => (
                      <Link
                        key={idx}
                        href={`/app/garden?tab=calendar&date=${format(day.date, 'yyyy-MM-dd')}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-white px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200">
                            {format(day.date, 'dd', { locale: it })}
                          </span>
                          <span className="text-sm text-gray-900 capitalize">{day.dayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                            {day.tasks.length} task
                          </span>
                          <ArrowRight size={14} className="text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Progress Card */}
        {activeGarden && (
          <ProgressCard tasks={gardenTasks} gardenId={activeGarden.id} />
        )}

        {/* Weather Widget - 7 Day Forecast */}
        {activeGarden && activeGarden.coordinates?.latitude && activeGarden.coordinates?.longitude && (
          <WeatherWidget
            latitude={activeGarden.coordinates.latitude}
            longitude={activeGarden.coordinates.longitude}
            activePlants={gardenTasks
              .filter(t => !t.completed && t.plantName)
              .map(t => ({
                plantName: t.plantName,
                minTemp: undefined // TODO: Extract from plant master data if available
              }))
            }
          />
        )}

        {/* Irrigation Status - Spostato dopo Prossimi Giorni */}

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

        {/* Sapling Ready Widget */}
        {activeGarden && (
          <SaplingReadyWidget 
            garden={activeGarden} 
            onOpenManager={() => setShowSaplingManager(true)}
            onCreateOrchard={(batch) => {
              // TODO: Implementare creazione impianto specializzato
              console.log('Create orchard from batch:', batch)
              alert('Funzionalità in sviluppo: creazione impianto da alberello')
            }}
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

        {/* Irrigation Zones Widget */}
        {activeGarden && (
          <IrrigationZonesWidget
            garden={activeGarden}
            tasks={tasks}
            onOpenManager={() => setShowIrrigationManager(true)}
          />
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

      {showSaplingManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Gestione Alberelli</h2>
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
                batches={[]}
                onBatchUpdate={async (batch) => {
                  // TODO: Implementare updateSaplingBatch nello storage provider
                  const stored = localStorage.getItem(`saplingBatches_${activeGarden.id}`)
                  const batches = stored ? JSON.parse(stored) : []
                  const updated = batches.map((b: any) => b.id === batch.id ? batch : b)
                  localStorage.setItem(`saplingBatches_${activeGarden.id}`, JSON.stringify(updated))
                }}
                onBatchCreate={async (batch) => {
                  // TODO: Implementare createSaplingBatch nello storage provider
                  const stored = localStorage.getItem(`saplingBatches_${activeGarden.id}`)
                  const batches = stored ? JSON.parse(stored) : []
                  const updated = [...batches, batch]
                  localStorage.setItem(`saplingBatches_${activeGarden.id}`, JSON.stringify(updated))
                }}
                onCreateOrchard={(batch) => {
                  // TODO: Implementare creazione impianto specializzato
                  console.log('Create orchard from batch:', batch)
                  alert('Funzionalità in sviluppo: creazione impianto da alberello')
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
                        const master = getMasterSheetSync(t.plantName);
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

      {/* Irrigation Zone Manager Modal */}
      {showIrrigationManager && activeGarden && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Gestione Zone Irrigue</h2>
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
                zones={[]}
                onZoneUpdate={async (zone) => {
                  // TODO: Implementare update
                }}
                onZoneDelete={async (zoneId) => {
                  // TODO: Implementare delete
                }}
                onZoneCreate={async (zone) => {
                  // TODO: Implementare create
                }}
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
              const newGardenTasks = await storageProvider.getTasks(garden.id)
              setGardenTasks(newGardenTasks || [])
              
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
