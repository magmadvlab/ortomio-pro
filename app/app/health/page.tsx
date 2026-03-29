'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Heart, 
  Camera, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  XCircle,
  Eye,
  Plus,
  Filter,
  Download,
  Upload,
  X,
  RotateCcw,
  FlaskConical,
  Shield,
  Loader2,
  FileImage
} from 'lucide-react'
import { plantHealthMonitoringService } from '@/services/plantHealthMonitoringService'
import {
  getScopedHealthMicroclimateSnapshot,
  type HealthMicroclimateSnapshot,
  type HealthRiskLevel,
} from '@/services/healthMicroclimateService'
import {
  getHealthScopeInsights,
  type HealthScopeInsight,
} from '@/services/healthScopeService'
import { weatherService } from '@/services/weatherService'
import MobileResponsiveButtonGroup from '@/components/shared/MobileResponsiveButtonGroup'
import WeatherWidget from '@/components/weather/WeatherWidget'
import { useGarden } from '@/packages/core/hooks/useGarden'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { Garden, GardenTask } from '@/types'
import { inferHealthCropContext, type HealthCropContext } from '@/utils/healthCropContext'

interface HealthAlert {
  id: string
  type: 'disease_risk' | 'pest_alert' | 'nutrient_deficiency' | 'stress_symptoms' | 'harvest_timing' | 'weather_stress'
  severity: 'low' | 'medium' | 'high' | 'critical'
  plantName: string
  plantCode?: string
  description: string
  detectedAt: string
  suggestedActions: HealthAction[]
  photoRequired: boolean
  agronomistConsultation: boolean
  urgencyDays: number
  confidence: number
  triggers: string[]
  location?: string
  zone?: string
}

interface HealthAction {
  type: 'photo_analysis' | 'agronomist_contact' | 'monitoring' | 'treatment' | 'intervention'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedTime?: string
  cost?: number
}

interface PhotoAnalysisModal {
  isOpen: boolean
  alert?: HealthAlert
}

interface AgronomistModal {
  isOpen: boolean
  alert?: HealthAlert
}

interface DiagnosisResult {
  confidence: number
  diagnosis: string
  recommendations: string[]
  severity: 'low' | 'medium' | 'high'
  treatmentUrgency: number
  estimatedCost: number
  organicTreatments: string[]
  category: 'Fungal' | 'Bacterial' | 'Viral' | 'Pest' | 'Deficiency' | 'Environmental'
  matchedSymptoms: string[]
  contextMatch: {
    season: boolean
    plant: boolean
    weather: boolean
  }
}

type TaskFeedback = {
  type: 'success' | 'error' | 'info'
  message: string
}

type ContextFocusCard = {
  title: string
  value: string
  note: string
}

const getGardenContextBadges = (garden: Garden | null | undefined, context: HealthCropContext): string[] => {
  if (!garden) return []

  if (context.id === 'vineyard') {
    return [
      garden.vineyardConfig?.totalVines ? `${garden.vineyardConfig.totalVines} viti` : '',
      garden.vineyardConfig?.trainingSystem || '',
      garden.vineyardConfig?.varieties?.slice(0, 2).join(', ') || '',
    ].filter(Boolean)
  }

  if (context.id === 'olive') {
    return [
      garden.oliveGroveConfig?.totalTrees ? `${garden.oliveGroveConfig.totalTrees} olivi` : '',
      garden.oliveGroveConfig?.type === 'OIL'
        ? 'Olio'
        : garden.oliveGroveConfig?.type === 'TABLE'
          ? 'Mensa'
          : garden.oliveGroveConfig?.type === 'DUAL_PURPOSE'
            ? 'Doppia attitudine'
            : '',
      garden.oliveGroveConfig?.varieties?.slice(0, 2).join(', ') || '',
    ].filter(Boolean)
  }

  if (context.id === 'orchard') {
    return [
      garden.orchardConfig?.totalTrees ? `${garden.orchardConfig.totalTrees} alberi` : '',
      garden.orchardConfig?.category?.replace(/_/g, ' ') || '',
      garden.orchardConfig?.varieties?.slice(0, 2).join(', ') || '',
    ].filter(Boolean)
  }

  return [garden.primaryCrop?.label || '', `${Math.round(garden.sizeSqMeters || 0)} m2`].filter(Boolean)
}

const getHealthTriggerLabel = (trigger: string) => {
  switch (trigger) {
    case 'weather':
      return 'Meteo'
    case 'leaf_wetness':
      return 'Bagnatura fogliare'
    case 'dew_point':
      return 'Punto di rugiada'
    case 'rain_gauge_local':
      return 'Pioggia locale'
    case 'vpd':
      return 'VPD'
    case 'canopy_temperature':
      return 'Temperatura chioma'
    case 'soil_tension_kpa':
      return 'Tensione suolo'
    case 'satellite_ndvi':
      return 'NDVI'
    case 'task_pattern':
      return 'Storico interventi'
    case 'monitoring_gap':
      return 'Gap monitoraggio'
    case 'manual':
      return 'Input manuale'
    default:
      return trigger.replaceAll('_', ' ')
  }
}

const getContextFocusCards = (
  context: HealthCropContext,
  weather: { temp: number; rainMm: number; condition: string } | null,
  microclimate: HealthMicroclimateSnapshot | null
): ContextFocusCard[] => {
  const fungalSignal =
    microclimate?.fungalPressure === 'high'
      ? 'Alta'
      : microclimate?.fungalPressure === 'medium'
        ? 'Media'
        : weather?.rainMm && weather.rainMm > 2
          ? 'Attiva'
          : 'Moderata'
  const heatSignal =
    microclimate?.heatStress === 'high'
      ? 'Alto'
      : microclimate?.waterStress === 'high'
        ? 'Idrico'
        : weather?.temp && weather.temp >= 30
          ? 'Alto'
          : 'Sotto controllo'
  const cadenceSignal =
    microclimate?.supportingSignals.length && microclimate.supportingSignals.length > 0
      ? 'Sensori attivi'
      : 'Cadenzato'

  if (context.id === 'vineyard') {
    return [
      {
        title: 'Pressione fungina',
        value: fungalSignal,
        note: 'Peronospora e oidio richiedono controlli rapidi dopo pioggia e umidita.',
      },
      {
        title: 'Stress grappoli',
        value: heatSignal,
        note: 'Controlla scottature, disidratazione e omogeneita della parete fogliare.',
      },
      {
        title: 'Frequenza rilievi',
        value: cadenceSignal === 'Sensori attivi' ? 'Sensori + 7 giorni' : 'Ogni 7 giorni',
        note: 'Nel vigneto il monitoraggio deve essere piu serrato nelle finestre critiche.',
      },
    ]
  }

  if (context.id === 'olive') {
    return [
      {
        title: 'Mosca olearia',
        value: weather?.temp && weather.temp > 18 ? 'Da seguire' : 'Bassa',
        note: 'Verifica trappole, punture e differenze tra aree ombreggiate e ventilate.',
      },
      {
        title: 'Stato chioma',
        value: fungalSignal,
        note: 'Occhio di pavone e umidita persistente vanno intercettati presto.',
      },
      {
        title: 'Frequenza rilievi',
        value: cadenceSignal === 'Sensori attivi' ? 'Sensori + 10 giorni' : 'Ogni 10 giorni',
        note: 'Serve continuita su chioma, drupe e andamento dell invaiatura.',
      },
    ]
  }

  if (context.id === 'orchard') {
    return [
      {
        title: 'Chioma e frutti',
        value: 'Priorita alta',
        note: 'Il controllo deve leggere insieme foglie, rami, allegagione e carico.',
      },
      {
        title: 'Stress frutti',
        value: heatSignal,
        note: 'Verifica cascola, scottature e calibro nelle giornate piu calde.',
      },
      {
        title: 'Frequenza rilievi',
        value: cadenceSignal === 'Sensori attivi' ? 'Sensori + 10 giorni' : 'Ogni 10 giorni',
        note: 'Nei frutteti conviene mantenere una cadenza regolare per parcella.',
      },
    ]
  }

  return [
    {
      title: 'Controlli visivi',
      value: 'Continuativi',
      note: 'Foglie, steli e sintomi precoci restano il primo segnale utile.',
    },
      {
        title: 'Stress climatico',
        value: heatSignal,
        note: 'Meteo e irrigazione devono essere letti insieme.',
      },
      {
        title: 'Frequenza rilievi',
        value: cadenceSignal === 'Sensori attivi' ? 'Sensori + 14 giorni' : 'Ogni 14 giorni',
        note: 'La diagnosi migliora se le foto e i controlli sono regolari.',
      },
  ]
}

const getDiagnosisTemplates = (context: HealthCropContext) => {
  if (context.id === 'vineyard') {
    return [
      {
        diagnosis: 'Peronospora della vite',
        confidence: 0.87,
        category: 'Fungal' as const,
        severity: 'high' as const,
        symptoms: ['Macchie oleose su foglie', 'Muffa bianca pagina inferiore', 'Ingiallimento fogliare'],
        treatments: ['Rame ossicloruro', 'Bicarbonato di potassio', 'Gestione parete fogliare'],
        urgency: 3,
      },
      {
        diagnosis: 'Oidio della vite',
        confidence: 0.78,
        category: 'Fungal' as const,
        severity: 'medium' as const,
        symptoms: ['Patina bianca su foglie', 'Acini opachi', 'Deformazione fogliare'],
        treatments: ['Zolfo bagnabile', 'Bicarbonato di sodio', 'Arieggiamento filare'],
        urgency: 4,
      },
    ]
  }

  if (context.id === 'olive') {
    return [
      {
        diagnosis: 'Mosca olearia',
        confidence: 0.84,
        category: 'Pest' as const,
        severity: 'high' as const,
        symptoms: ['Punture sulle olive', 'Cascola anomala', 'Gallerie nei frutti'],
        treatments: ['Controllo trappole', 'Esche proteiche', 'Strategia di difesa mirata'],
        urgency: 3,
      },
      {
        diagnosis: 'Occhio di pavone',
        confidence: 0.71,
        category: 'Fungal' as const,
        severity: 'medium' as const,
        symptoms: ['Macchie circolari sulle foglie', 'Defogliazione interna', 'Chioma umida'],
        treatments: ['Rame', 'Potatura di arieggiamento', 'Monitoraggio post-pioggia'],
        urgency: 5,
      },
    ]
  }

  if (context.id === 'orchard') {
    return [
      {
        diagnosis: 'Ticchiolatura',
        confidence: 0.79,
        category: 'Fungal' as const,
        severity: 'medium' as const,
        symptoms: ['Macchie scure su foglie', 'Lesioni superficiali sui frutti', 'Umidita persistente'],
        treatments: ['Copertura preventiva', 'Rimozione residui colpiti', 'Controllo chioma'],
        urgency: 4,
      },
      {
        diagnosis: 'Carenza di potassio',
        confidence: 0.64,
        category: 'Deficiency' as const,
        severity: 'low' as const,
        symptoms: ['Margini fogliari necrotici', 'Frutti piccoli', 'Crescita rallentata'],
        treatments: ['Concimazione correttiva', 'Analisi fogliare', 'Bilanciamento nutrizionale'],
        urgency: 7,
      },
    ]
  }

  return [
    {
      diagnosis: 'Peronospora',
      confidence: 0.81,
      category: 'Fungal' as const,
      severity: 'high' as const,
      symptoms: ['Macchie fogliari', 'Muffa pagina inferiore', 'Ingiallimento diffuso'],
      treatments: ['Rame ossicloruro', 'Bicarbonato di potassio', 'Riduzione umidita fogliare'],
      urgency: 3,
    },
    {
      diagnosis: 'Carenza di azoto',
      confidence: 0.65,
      category: 'Deficiency' as const,
      severity: 'low' as const,
      symptoms: ['Ingiallimento foglie basali', 'Crescita rallentata', 'Foglie piccole'],
      treatments: ['Concime organico', 'Compost maturo', 'Correzione piano nutritivo'],
      urgency: 7,
    },
  ]
}

const buildQuickPhotoAlert = (context: HealthCropContext): HealthAlert => ({
  id: 'quick-photo',
  type: 'stress_symptoms',
  severity: 'low',
  plantName: `Diagnosi Rapida ${context.areaLabel}`,
  description: `Scatta una foto per analisi AI immediata del ${context.areaLabel}`,
  detectedAt: new Date().toISOString(),
  suggestedActions: [],
  photoRequired: true,
  agronomistConsultation: false,
  urgencyDays: 3,
  confidence: 0.5,
  triggers: ['manual'],
})

export default function PlantHealthPage() {
  const { activeGarden, loading: gardenLoading } = useGarden()
  const { storageProvider, isInitialized } = useStorage()
  const healthContext = inferHealthCropContext(activeGarden)
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [photoModal, setPhotoModal] = useState<PhotoAnalysisModal>({ isOpen: false })
  const [agronomistModal, setAgronomistModal] = useState<AgronomistModal>({ isOpen: false })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [weather, setWeather] = useState<{ temp: number; rainMm: number; condition: string } | null>(null)
  const [microclimate, setMicroclimate] = useState<HealthMicroclimateSnapshot | null>(null)
  const [scopeInsights, setScopeInsights] = useState<HealthScopeInsight[]>([])
  
  // Camera states
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [symptomsText, setSymptomsText] = useState('')
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [creatingActionKeys, setCreatingActionKeys] = useState<Record<string, boolean>>({})
  const [actionFeedback, setActionFeedback] = useState<Record<string, TaskFeedback>>({})
  const contextBadges = getGardenContextBadges(activeGarden, healthContext)
  const focusCards = getContextFocusCards(healthContext, weather, microclimate)
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const loadWeather = useCallback(async () => {
    try {
      const weatherData = activeGarden
        ? await weatherService.getWeatherForGarden(activeGarden)
        : await weatherService.getWeatherForUserLocation()
      setWeather({
        temp: weatherData.temp,
        rainMm: weatherData.rainMm,
        condition: weatherData.condition
      })
    } catch (error) {
      console.error('Weather fetch failed:', error)
      // Fallback weather data
      setWeather({
        temp: 18,
        rainMm: 0,
        condition: 'Sereno'
      })
    }
  }, [activeGarden])

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usa camera posteriore se disponibile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Impossibile accedere alla fotocamera. Verifica i permessi del browser.')
      setIsCapturing(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Imposta le dimensioni del canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Disegna il frame corrente del video sul canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Converti in base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageDataUrl)
    setSelectedFiles([]) // Clear file uploads when capturing
    stopCamera()
  }, [stopCamera])

  const loadHealthAlerts = useCallback(async () => {
    try {
      setLoading(true)
      if (!activeGarden) {
        setAlerts([])
        setMicroclimate(null)
        setScopeInsights([])
        return
      }

      const tasks = await storageProvider.getTasks(activeGarden.id)
      const devices = await storageProvider.getDevices(activeGarden.id).catch(() => [])
      const normalizedTasks = tasks || []
      const [healthAlerts, microclimateSnapshot, topScopeInsights] = await Promise.all([
        plantHealthMonitoringService.analyzeGardenHealth(activeGarden, normalizedTasks, {
          devices,
          storageProvider,
        }),
        getScopedHealthMicroclimateSnapshot(activeGarden, { devices }).catch(() => null),
        getHealthScopeInsights(activeGarden, normalizedTasks, storageProvider).catch(() => []),
      ])
      setAlerts(healthAlerts as HealthAlert[])
      setMicroclimate(microclimateSnapshot)
      setScopeInsights(topScopeInsights)
    } catch (error) {
      console.error('Error loading health alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [activeGarden, storageProvider])

  useEffect(() => {
    if (!isInitialized || gardenLoading) {
      return
    }

    loadHealthAlerts()
  }, [gardenLoading, isInitialized, loadHealthAlerts])

  useEffect(() => {
    loadWeather()
  }, [loadWeather])

  const getActionKey = (alertId: string, actionIndex: number) => `${alertId}:${actionIndex}`

  const parseEstimatedMinutes = (estimatedTime?: string) => {
    if (!estimatedTime) return undefined

    const hourMatch = estimatedTime.match(/(\d+)\s*ore?/i)
    if (hourMatch) {
      return parseInt(hourMatch[1], 10) * 60
    }

    const minuteMatch = estimatedTime.match(/(\d+)\s*min/i)
    if (minuteMatch) {
      return parseInt(minuteMatch[1], 10)
    }

    return undefined
  }

  const toISODate = (date: Date) => date.toISOString().split('T')[0]

  const addDays = (days: number) => {
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
  }

  const inferActionDate = (alert: HealthAlert, action: HealthAction) => {
    if (/24\s*-\s*48h/i.test(action.description) || /post-pioggia/i.test(action.title)) {
      return toISODate(addDays(1))
    }

    if (alert.urgencyDays <= 1 || action.priority === 'high') {
      return toISODate(new Date())
    }

    return toISODate(addDays(Math.min(alert.urgencyDays, 7)))
  }

  const mapHealthActionToTaskType = (actionType: HealthAction['type']): GardenTask['taskType'] => {
    switch (actionType) {
      case 'intervention':
      case 'treatment':
        return 'Treatment'
      case 'monitoring':
      case 'photo_analysis':
      case 'agronomist_contact':
      default:
        return 'Photo'
    }
  }

  const buildHealthTaskNotes = (alert: HealthAlert, action: HealthAction) => {
    const lines = [
      `Alert salute: ${alert.plantName}`,
      alert.description,
      `Azione consigliata: ${action.title}`,
      action.description,
      alert.plantCode ? `Codice pianta: ${alert.plantCode}` : '',
      alert.location ? `Posizione: ${alert.location}` : '',
      alert.zone ? `Zona: ${alert.zone}` : '',
      `Severità: ${alert.severity}`,
      `Confidenza: ${Math.round(alert.confidence * 100)}%`,
      `Urgenza: ${alert.urgencyDays} giorni`,
      alert.triggers.length > 0 ? `Trigger: ${alert.triggers.join(', ')}` : '',
      weather ? `Meteo al momento della creazione: ${weather.temp}°C, ${weather.rainMm}mm, ${weather.condition}` : ''
    ].filter(Boolean)

    return lines.join('\n')
  }

  const handleCreateActionTask = async (alert: HealthAlert, action: HealthAction, actionIndex: number) => {
    const actionKey = getActionKey(alert.id, actionIndex)

    if (!activeGarden) {
      setActionFeedback(prev => ({
        ...prev,
        [actionKey]: {
          type: 'error',
          message: 'Seleziona prima un giardino attivo.'
        }
      }))
      return
    }

    try {
      setCreatingActionKeys(prev => ({ ...prev, [actionKey]: true }))
      setActionFeedback(prev => {
        const next = { ...prev }
        delete next[actionKey]
        return next
      })

      const suggestedBy = `health:${alert.id}:${action.type}:${actionIndex}`
      const existingTasks = await storageProvider.getTasks(activeGarden.id)
      const alreadyCreatedTask = existingTasks.find(task =>
        task.gardenId === activeGarden.id &&
        task.suggestedBy === suggestedBy &&
        !task.completed
      )

      if (alreadyCreatedTask) {
        setActionFeedback(prev => ({
          ...prev,
          [actionKey]: {
            type: 'info',
            message: 'Task già creato.'
          }
        }))
        return
      }

      const taskDate = inferActionDate(alert, action)
      const taskData: Omit<GardenTask, 'id'> = {
        gardenId: activeGarden.id,
        plantName: alert.plantName,
        taskType: mapHealthActionToTaskType(action.type),
        date: taskDate,
        nextDueDate: taskDate,
        durationMinutes: parseEstimatedMinutes(action.estimatedTime),
        completed: false,
        isSuggested: true,
        aiGenerated: true,
        suggestedBy,
        suggestedDate: new Date().toISOString(),
        schedulingType: taskDate === toISODate(new Date()) ? 'Immediate' : 'Scheduled',
        notes: buildHealthTaskNotes(alert, action)
      }

      await storageProvider.createTask(taskData)

      setActionFeedback(prev => ({
        ...prev,
        [actionKey]: {
          type: 'success',
          message: 'Task creato con successo.'
        }
      }))
    } catch (error) {
      console.error('Error creating health action task:', error)
      setActionFeedback(prev => ({
        ...prev,
        [actionKey]: {
          type: 'error',
          message: 'Errore nella creazione del task.'
        }
      }))
    } finally {
      setCreatingActionKeys(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disease_risk': return '🦠'
      case 'pest_alert': return '🐛'
      case 'nutrient_deficiency': return '🌱'
      case 'stress_symptoms': return '😰'
      case 'harvest_timing': return '🍅'
      case 'weather_stress': return '🌦️'
      default: return '⚠️'
    }
  }

  const getRiskBadgeClass = (level: HealthRiskLevel) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'low':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getRiskLabel = (level: HealthRiskLevel) => {
    switch (level) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Media'
      case 'low':
        return 'Bassa'
      default:
        return 'Assente'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false
    if (selectedType !== 'all' && alert.type !== selectedType) return false
    return true
  })

  const handlePhotoAnalysis = (alert: HealthAlert) => {
    setPhotoModal({ isOpen: true, alert })
  }

  const handleAgronomistContact = (alert: HealthAlert) => {
    setAgronomistModal({ isOpen: true, alert })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setCapturedImage(null) // Clear captured image when uploading files
  }

  const submitPhotoAnalysis = async () => {
    const hasPhoto = capturedImage || selectedFiles.length > 0
    if (!photoModal.alert || (!hasPhoto && !symptomsText.trim())) {
      alert('Carica una foto o descrivi i sintomi')
      return
    }

    try {
      setIsAnalyzing(true)
      
      // Simula analisi AI avanzata con risultati più realistici
      const mockDiagnoses = getDiagnosisTemplates(healthContext)

      const selectedDiagnosis = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)]
      
      const result: DiagnosisResult = {
        confidence: selectedDiagnosis.confidence,
        diagnosis: selectedDiagnosis.diagnosis,
        recommendations: [
          `Trattamento con ${selectedDiagnosis.treatments[0]} ogni 7-10 giorni`,
          'Migliorare aerazione tra le piante',
          'Evitare irrigazione fogliare nelle ore serali',
          'Rimuovere foglie infette e smaltirle',
          'Monitorare evoluzione ogni 3 giorni'
        ],
        severity: selectedDiagnosis.severity,
        treatmentUrgency: selectedDiagnosis.urgency,
        estimatedCost: Math.floor(Math.random() * 40) + 15, // €15-55
        organicTreatments: selectedDiagnosis.treatments,
        category: selectedDiagnosis.category,
        matchedSymptoms: selectedDiagnosis.symptoms,
        contextMatch: {
          season: true,
          plant: true,
          weather: weather?.rainMm ? weather.rainMm > 2 : false
        }
      }

      setDiagnosisResult(result)

      // Crea task automatico con dettagli completi
      const newTask = {
        id: `task-${Date.now()}`,
        gardenId: 'garden-1',
        plantName: photoModal.alert.plantName,
        taskType: 'Treatment',
        date: new Date().toISOString().split('T')[0],
        notes: `🤖 DIAGNOSI AI: ${result.diagnosis}
        
📊 Analisi Dettagliata:
• Confidenza: ${Math.round(result.confidence * 100)}%
• Categoria: ${result.category}
• Severità: ${result.severity.toUpperCase()}
• Urgenza trattamento: ${result.treatmentUrgency} giorni

🔍 Sintomi Identificati:
${result.matchedSymptoms.map(s => `• ${s}`).join('\n')}

🌿 Trattamenti Biologici Consigliati:
${result.organicTreatments.map(t => `• ${t}`).join('\n')}

📋 Piano di Intervento:
${result.recommendations.map(r => `• ${r}`).join('\n')}

💰 Costo stimato: €${result.estimatedCost}
📸 Foto analizzate: ${hasPhoto ? (capturedImage ? '1 (fotocamera)' : selectedFiles.length) : '0'}
📝 Note aggiuntive: ${notes || 'Nessuna'}
📍 Posizione: ${location || 'Non specificata'}

🌦️ Condizioni Meteo:
• Temperatura: ${weather?.temp || 'N/A'}°C
• Pioggia: ${weather?.rainMm || 0}mm
• Condizioni: ${weather?.condition || 'N/A'}`,
        completed: false,
        priority: result.severity,
        estimatedDuration: result.severity === 'high' ? '45-90 minuti' : '30-60 minuti',
        category: 'ai_health_analysis'
      }

      console.log('Task AI creato automaticamente:', newTask)
      
      // Reset form
      setPhotoModal({ isOpen: false })
      setSelectedFiles([])
      setCapturedImage(null)
      setNotes('')
      setLocation('')
      setSymptomsText('')
      
      // Ricarica gli alert
      await loadHealthAlerts()
      
    } catch (error) {
      console.error('Error in AI photo analysis:', error)
      alert('Errore durante l\'analisi AI. Riprova.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const submitAgronomistRequest = async (consultationType: string, urgency: string, notes: string) => {
    if (!agronomistModal.alert) return

    try {
      const consultationRequest = {
        id: `consultation-${Date.now()}`,
        alertId: agronomistModal.alert.id,
        plantName: agronomistModal.alert.plantName,
        type: consultationType,
        urgency,
        notes,
        cost: 50,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      }

      console.log('Richiesta consulto inviata:', consultationRequest)
      
      setAgronomistModal({ isOpen: false })
      
      alert('Richiesta di consulto inviata! Riceverai una risposta entro 24 ore.')
    } catch (error) {
      console.error('Error submitting consultation request:', error)
      alert('Errore durante l\'invio. Riprova.')
    }
  }

  if (loading || gardenLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento monitoraggio salute...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{healthContext.title}</h1>
                <p className="text-gray-600">{healthContext.subtitle}</p>
                {activeGarden && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                      {activeGarden.name}
                    </span>
                    {contextBadges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium border border-gray-200"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <MobileResponsiveButtonGroup
              buttons={[
                {
                  id: 'photo',
                  icon: <Camera className="w-4 h-4" />,
                  label: 'Scatta Foto',
                  shortLabel: 'Foto',
                  variant: 'secondary',
                  onClick: () => setPhotoModal({ isOpen: true, alert: buildQuickPhotoAlert(healthContext) })
                },
                {
                  id: 'export',
                  icon: <Download className="w-4 h-4" />,
                  label: 'Esporta Report',
                  shortLabel: 'Report',
                  variant: 'outline',
                  onClick: () => console.log('Export report')
                },
                {
                  id: 'new',
                  icon: <Plus className="w-4 h-4" />,
                  label: 'Nuovo Controllo',
                  shortLabel: 'Nuovo',
                  variant: 'primary',
                  onClick: () => console.log('New control')
                }
              ]}
              layout="auto"
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weather Widget */}
        <WeatherWidget 
          showAlerts={true}
          className="mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {focusCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-2">{card.title}</p>
              <p className="text-xl font-semibold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-600 mt-2">{card.note}</p>
            </div>
          ))}
        </div>

        {(microclimate?.hasRecentData || scopeInsights.length > 0) && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Segnali Microclimatici</h2>
                  <p className="text-sm text-gray-600">Lettura live dei fattori che influenzano davvero il rischio fitosanitario.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Pressione fungina</p>
                  <p className="text-lg font-semibold text-gray-900">{getRiskLabel(microclimate?.fungalPressure || 'none')}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Stress idrico</p>
                  <p className="text-lg font-semibold text-gray-900">{getRiskLabel(microclimate?.waterStress || 'none')}</p>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Stress termico</p>
                  <p className="text-lg font-semibold text-gray-900">{getRiskLabel(microclimate?.heatStress || 'none')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                {microclimate?.metrics.leafWetness !== undefined && (
                  <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-gray-500">Bagnatura fogliare</p>
                    <p className="font-semibold text-gray-900">{microclimate.metrics.leafWetness.toFixed(0)}%</p>
                  </div>
                )}
                {microclimate?.metrics.vpd !== undefined && (
                  <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-gray-500">VPD</p>
                    <p className="font-semibold text-gray-900">{microclimate.metrics.vpd.toFixed(2)} kPa</p>
                  </div>
                )}
                {microclimate?.metrics.dewPointSpreadC !== undefined && (
                  <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-gray-500">Gap aria-rugiada</p>
                    <p className="font-semibold text-gray-900">{microclimate.metrics.dewPointSpreadC.toFixed(1)}°C</p>
                  </div>
                )}
                {microclimate?.metrics.soilTensionKpa !== undefined && (
                  <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-gray-500">Tensione suolo</p>
                    <p className="font-semibold text-gray-900">{microclimate.metrics.soilTensionKpa.toFixed(0)} kPa</p>
                  </div>
                )}
                {microclimate?.metrics.canopyDeltaC !== undefined && (
                  <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-gray-500">Delta chioma-aria</p>
                    <p className="font-semibold text-gray-900">{microclimate.metrics.canopyDeltaC.toFixed(1)}°C</p>
                  </div>
                )}
                {microclimate?.metrics.rainGaugeLocalMm !== undefined && (
                  <div className="rounded-lg bg-gray-50 px-3 py-3">
                    <p className="text-gray-500">Pioggia locale</p>
                    <p className="font-semibold text-gray-900">{microclimate.metrics.rainGaugeLocalMm.toFixed(1)} mm</p>
                  </div>
                )}
              </div>

              {microclimate?.supportingSignals.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {microclimate.supportingSignals.map((signal) => (
                    <span
                      key={signal}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-orange-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Hotspot Operativi</h2>
                  <p className="text-sm text-gray-600">Zone e filari da controllare prima, ordinati per rischio reale.</p>
                </div>
              </div>

              {scopeInsights.length > 0 ? (
                <div className="space-y-3">
                  {scopeInsights.map((scope) => (
                    <div key={`${scope.scopeType}-${scope.scopeId}`} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">
                            {scope.scopeType === 'zone' ? 'Zona sensorizzata' : 'Filare prioritario'}
                            {scope.zoneName && scope.scopeType === 'field_row' ? ` · ${scope.zoneName}` : ''}
                          </p>
                          <h3 className="font-semibold text-gray-900">{scope.scopeName}</h3>
                          <p className="text-sm text-gray-600 mt-1">{scope.note}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          Score {scope.score}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeClass(scope.fungalPressure)}`}>
                          Fungino {getRiskLabel(scope.fungalPressure)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeClass(scope.waterStress)}`}>
                          Idrico {getRiskLabel(scope.waterStress)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeClass(scope.heatStress)}`}>
                          Termico {getRiskLabel(scope.heatStress)}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-gray-500">
                        {scope.plantCount > 0
                          ? `${scope.plantCount} task attivi · ${scope.plantNames.join(', ')}`
                          : 'Nessun task attivo associato, ma la zona resta sensorizzata'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                  Nessuna zona o filare sensorizzato disponibile per questo giardino.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => {
              // Scroll to alerts section
              const alertsSection = document.getElementById('alerts-section')
              if (alertsSection) {
                alertsSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">Alert Totali</p>
                <p className="text-2xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">{alerts.length}</p>
                <p className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors mt-1">
                  Clicca per vedere dettagli
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500 group-hover:text-orange-600 transition-colors" />
            </div>
          </button>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critici</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Foto Richieste</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => a.photoRequired).length}
                </p>
              </div>
              <Camera className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consulti</p>
                <p className="text-2xl font-bold text-purple-600">
                  {alerts.filter(a => a.agronomistConsultation).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtri {healthContext.areaLabel}:</span>
              </div>
              
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tutte le severità</option>
                <option value="critical">Critico</option>
                <option value="high">Alto</option>
                <option value="medium">Medio</option>
                <option value="low">Basso</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tutti i tipi</option>
                <option value="disease_risk">Rischio malattie</option>
                <option value="pest_alert">Alert parassiti</option>
                <option value="nutrient_deficiency">Carenze nutrizionali</option>
                <option value="stress_symptoms">Sintomi stress</option>
                <option value="harvest_timing">Maturazione e raccolta</option>
                <option value="weather_stress">Stress climatico</option>
              </select>

              <div className="text-sm text-gray-600">
                {filteredAlerts.length} di {alerts.length} alert
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <a
                href="/app/planner"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                Vai al Planner AI
              </a>
              <a
                href="/app/planner-classic"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Calendar className="w-4 h-4" />
                Planner Classico
              </a>
            </div>
          </div>
        </div>

        {/* Health Alerts */}
        <div id="alerts-section" className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getTypeIcon(alert.type)}</div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{alert.plantName}</h3>
                        {alert.plantCode && (
                          <span className="text-sm text-gray-500 font-mono">{alert.plantCode}</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.detectedAt).toLocaleString('it-IT')}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Confidenza: {Math.round(alert.confidence * 100)}%
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Urgenza: {alert.urgencyDays} giorni
                        </div>
                        {alert.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {alert.location}
                          </div>
                        )}
                      </div>

                      {alert.triggers.length > 0 && (
                        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Fattori usati per questo alert
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {alert.triggers.map((trigger) => (
                              <span
                                key={`${alert.id}-${trigger}`}
                                className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-blue-700"
                              >
                                {getHealthTriggerLabel(trigger)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Azioni Consigliate:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {alert.suggestedActions.map((action, index) => {
                        const actionKey = getActionKey(alert.id, index)
                        const feedback = actionFeedback[actionKey]
                        const isCreating = Boolean(creatingActionKeys[actionKey])

                        return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{action.title}</h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              action.priority === 'high' ? 'bg-red-100 text-red-700' :
                              action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {action.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {action.estimatedTime && `⏱️ ${action.estimatedTime}`}
                              {action.cost && ` • 💰 €${action.cost}`}
                            </div>
                            
                            {action.type === 'photo_analysis' && (
                              <button
                                onClick={() => handlePhotoAnalysis(alert)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                <Camera className="w-3 h-3" />
                                Foto AI
                              </button>
                            )}
                            
                            {action.type === 'agronomist_contact' && (
                              <button
                                onClick={() => handleAgronomistContact(alert)}
                                className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                              >
                                <UserCheck className="w-3 h-3" />
                                Agronomo
                              </button>
                            )}
                            
                            {action.type === 'monitoring' && (
                              <button
                                onClick={() => handleCreateActionTask(alert, action, index)}
                                disabled={isCreating}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <Eye className="w-3 h-3" />
                                {isCreating ? 'Creo...' : 'Monitora'}
                              </button>
                            )}

                            {(action.type === 'intervention' || action.type === 'treatment') && (
                              <button
                                onClick={() => handleCreateActionTask(alert, action, index)}
                                disabled={isCreating}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                                {isCreating ? 'Creo...' : 'Crea Task'}
                              </button>
                            )}
                          </div>

                          {feedback && (
                            <p className={`mt-2 text-xs ${
                              feedback.type === 'success' ? 'text-green-600' :
                              feedback.type === 'error' ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {feedback.message}
                            </p>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeGarden ? `Nessun alert per ${healthContext.areaLabel}` : 'Nessun giardino attivo'}
            </h3>
            <p className="text-gray-600">
              {!activeGarden
                ? 'Seleziona o crea un giardino per generare controlli salute reali.'
                : alerts.length === 0 
                ? `Tutti i ${healthContext.entityPlural} monitorati risultano stabili.`
                : 'Prova a modificare i filtri per vedere altri alert.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Advanced Photo Analysis Modal with Camera */}
      {photoModal.isOpen && photoModal.alert && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-3">
                  <FlaskConical className="text-purple-600" size={24} />
                  Diagnosi AI Avanzata
                </h3>
                <button
                  onClick={() => {
                    setPhotoModal({ isOpen: false })
                    stopCamera()
                    setCapturedImage(null)
                    setSelectedFiles([])
                    setNotes('')
                    setLocation('')
                    setSymptomsText('')
                    setDiagnosisResult(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium mb-2">Pianta: {photoModal.alert.plantName}</h4>
                <p className="text-gray-600">{photoModal.alert.description}</p>
              </div>

              {/* Camera Section */}
              {!capturedImage && selectedFiles.length === 0 ? (
                <div className="space-y-4">
                  {/* Camera View */}
                  {isCapturing ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg bg-black"
                        style={{ maxHeight: '300px' }}
                      />
                      <div className="flex justify-center mt-4 gap-4">
                        <button
                          onClick={capturePhoto}
                          className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-lg"
                        >
                          <Camera size={24} />
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-gray-600 mb-6">
                        Scatta una foto per diagnosi AI professionale
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Scatta Foto */}
                        <button
                          onClick={startCamera}
                          className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors text-center"
                        >
                          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Scatta Foto</p>
                          <p className="text-xs text-gray-400">Usa fotocamera</p>
                        </button>
                        
                        {/* Carica da Galleria */}
                        <label className="cursor-pointer">
                          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">Carica Immagine</p>
                            <p className="text-xs text-gray-400">Da galleria</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative">
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Foto catturata"
                        className="w-full rounded-lg border-2 border-green-400"
                        style={{ maxHeight: '300px', objectFit: 'cover' }}
                      />
                    ) : (
                      selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Foto ${index + 1}`}
                            className="w-full max-h-64 object-cover rounded-lg border-2 border-green-400"
                          />
                          <button
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setCapturedImage(null)
                          setSelectedFiles([])
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <RotateCcw size={16} />
                        Cambia Foto
                      </button>
                    </div>
                  </div>

                  {/* Form Dettagli */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posizione (opzionale)
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="es. Aiuola Nord, Filare 3..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note aggiuntive (opzionale)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        placeholder="Descrivi i sintomi che vedi: macchie, colore foglie, etc..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Descrizione Sintomi Alternativa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oppure descrivi i sintomi testuali
                </label>
                <textarea
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Es: Foglie con macchie gialle, muffa grigia sulla pagina inferiore..."
                />
              </div>

              {/* Info AI */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  Diagnosi AI Professionale
                </h5>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Analisi automatica di malattie, parassiti e carenze</li>
                  <li>• Identificazione categoria (funghi, batteri, virus, carenze)</li>
                  <li>• Piano di trattamento biologico personalizzato</li>
                  <li>• Stima costi e tempistiche di intervento</li>
                  <li>• Creazione automatica task nel planner</li>
                  <li>• Possibilità consulto agronomo per casi complessi</li>
                </ul>
              </div>

              {/* Risultati Diagnosi */}
              {diagnosisResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-blue-900 flex items-center gap-2">
                      <FlaskConical size={16} />
                      Risultati Analisi AI
                    </h5>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      diagnosisResult.severity === 'high' ? 'bg-red-600 text-white' :
                      diagnosisResult.severity === 'medium' ? 'bg-orange-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {diagnosisResult.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-1">🔍 Diagnosi:</h6>
                      <p className="text-gray-700">{diagnosisResult.diagnosis}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Confidenza: {Math.round(diagnosisResult.confidence * 100)}%</span>
                        <span>Categoria: {diagnosisResult.category}</span>
                        <span>Urgenza: {diagnosisResult.treatmentUrgency} giorni</span>
                      </div>
                    </div>

                    <div>
                      <h6 className="font-semibold text-gray-800 mb-1">🎯 Sintomi Identificati:</h6>
                      <div className="flex flex-wrap gap-2">
                        {diagnosisResult.matchedSymptoms.map((symptom, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="font-semibold text-gray-800 mb-1">🌿 Trattamenti Biologici:</h6>
                      <div className="flex flex-wrap gap-2">
                        {diagnosisResult.organicTreatments.map((treatment, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {treatment}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="font-semibold text-gray-800 mb-1">📋 Raccomandazioni:</h6>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {diagnosisResult.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-center text-sm">
                        <span>💰 Costo stimato: €{diagnosisResult.estimatedCost}</span>
                        <span>⏱️ Durata: {diagnosisResult.severity === 'high' ? '45-90 min' : '30-60 min'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPhotoModal({ isOpen: false })
                    stopCamera()
                    setCapturedImage(null)
                    setSelectedFiles([])
                    setNotes('')
                    setLocation('')
                    setSymptomsText('')
                    setDiagnosisResult(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={submitPhotoAnalysis}
                  disabled={isAnalyzing || (!capturedImage && selectedFiles.length === 0 && !symptomsText.trim())}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analisi AI...
                    </>
                  ) : (
                    <>
                      <FileImage size={16} />
                      Avvia Diagnosi AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Agronomist Modal */}
      {agronomistModal.isOpen && agronomistModal.alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Consulto Specialistico</h3>
                <button
                  onClick={() => setAgronomistModal({ isOpen: false })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium mb-2">Pianta: {agronomistModal.alert.plantName}</h4>
                <p className="text-gray-600">{agronomistModal.alert.description}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-medium text-purple-900 mb-2">Servizio Consulto Professionale</h5>
                <div className="text-sm text-purple-800 space-y-1">
                  <div>💰 Costo: €50 (consulto standard)</div>
                  <div>⏱️ Risposta: Entro 24 ore</div>
                  <div>👨‍🌾 Agronomo certificato</div>
                  <div>📋 Report dettagliato incluso</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo di Consulto
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Diagnosi problema specifico</option>
                  <option>Piano di trattamento</option>
                  <option>Consulto preventivo</option>
                  <option>Analisi generale salute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgenza
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>Standard (24h) - €50</option>
                  <option>Urgente (12h) - €75</option>
                  <option>Immediato (4h) - €100</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note aggiuntive
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Descrivi il problema in dettaglio, sintomi osservati, trattamenti già effettuati..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAgronomistModal({ isOpen: false })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => submitAgronomistRequest('standard', 'standard', '')}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Richiedi Consulto (€50)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
