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
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Filter,
  Download,
  Share2,
  Upload,
  X,
  RotateCcw,
  Check,
  FlaskConical,
  Shield,
  Loader2,
  FileImage,
  Activity
} from 'lucide-react'
import { plantHealthMonitoringService } from '@/services/plantHealthMonitoringService'
import { weatherService } from '@/services/weatherService'
import MobileResponsiveButtonGroup from '@/components/shared/MobileResponsiveButtonGroup'
import WeatherWidget from '@/components/weather/WeatherWidget'

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

export default function PlantHealthPage() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [photoModal, setPhotoModal] = useState<PhotoAnalysisModal>({ isOpen: false })
  const [agronomistModal, setAgronomistModal] = useState<AgronomistModal>({ isOpen: false })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [weather, setWeather] = useState<{ temp: number; rainMm: number; condition: string } | null>(null)
  
  // Camera states
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [symptomsText, setSymptomsText] = useState('')
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    loadHealthAlerts()
    loadWeather()
  }, [])

  const loadWeather = async () => {
    try {
      // Usa il servizio meteo reale
      const weatherData = await weatherService.getWeatherForUserLocation()
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
  }

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

  const retakePhoto = () => {
    setCapturedImage(null)
    setSelectedFiles([])
    startCamera()
  }

  const loadHealthAlerts = async () => {
    try {
      setLoading(true)
      // Simula il caricamento degli alert di salute
      const mockGarden = { 
        id: 'garden-1', 
        name: 'Orto Principale',
        sizeSqMeters: 100,
        createdAt: new Date().toISOString()
      }
      const healthAlerts = await plantHealthMonitoringService.analyzeGardenHealth(mockGarden, [])
      setAlerts(healthAlerts)
    } catch (error) {
      console.error('Error loading health alerts:', error)
    } finally {
      setLoading(false)
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
      const mockDiagnoses = [
        {
          diagnosis: 'Peronospora della vite',
          confidence: 0.87,
          category: 'Fungal' as const,
          severity: 'high' as const,
          symptoms: ['Macchie oleose su foglie', 'Muffa bianca pagina inferiore', 'Ingiallimento fogliare'],
          treatments: ['Rame ossicloruro', 'Bicarbonato di potassio', 'Olio di neem'],
          urgency: 3
        },
        {
          diagnosis: 'Oidio (mal bianco)',
          confidence: 0.73,
          category: 'Fungal' as const,
          severity: 'medium' as const,
          symptoms: ['Patina bianca su foglie', 'Deformazione fogliare', 'Crescita stentata'],
          treatments: ['Zolfo bagnabile', 'Bicarbonato di sodio', 'Latte diluito'],
          urgency: 5
        },
        {
          diagnosis: 'Carenza di azoto',
          confidence: 0.65,
          category: 'Deficiency' as const,
          severity: 'low' as const,
          symptoms: ['Ingiallimento foglie basali', 'Crescita rallentata', 'Foglie piccole'],
          treatments: ['Concime organico', 'Compost maturo', 'Sangue di bue'],
          urgency: 7
        }
      ]

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

  if (loading) {
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
                <h1 className="text-2xl font-bold text-gray-900">Salute delle Piante</h1>
                <p className="text-gray-600">Monitoraggio AI e consulti specialistici</p>
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
                  onClick: () => setPhotoModal({ isOpen: true, alert: { 
                    id: 'quick-photo', 
                    plantName: 'Diagnosi Rapida', 
                    description: 'Scatta una foto per analisi AI immediata' 
                  } as any })
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alert Totali</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtri:</span>
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
              <option value="harvest_timing">Timing raccolta</option>
              <option value="weather_stress">Stress climatico</option>
            </select>

            <div className="ml-auto text-sm text-gray-600">
              {filteredAlerts.length} di {alerts.length} alert
            </div>
          </div>
        </div>

        {/* Health Alerts */}
        <div className="space-y-4">
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
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Azioni Consigliate:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {alert.suggestedActions.map((action, index) => (
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
                              <button className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                                <Eye className="w-3 h-3" />
                                Monitora
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun alert trovato</h3>
            <p className="text-gray-600">
              {alerts.length === 0 
                ? 'Tutte le piante sono in salute! 🌱'
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