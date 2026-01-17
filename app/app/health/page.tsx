'use client'

import React, { useState, useEffect } from 'react'
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
  Share2
} from 'lucide-react'
import { plantHealthMonitoringService } from '@/services/plantHealthMonitoringService'

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
  type: 'photo_analysis' | 'agronomist_contact' | 'monitoring' | 'treatment'
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

export default function PlantHealthPage() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [photoModal, setPhotoModal] = useState<PhotoAnalysisModal>({ isOpen: false })
  const [agronomistModal, setAgronomistModal] = useState<AgronomistModal>({ isOpen: false })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    loadHealthAlerts()
  }, [])

  const loadHealthAlerts = async () => {
    try {
      setLoading(true)
      // Simula il caricamento degli alert di salute
      const mockGarden = { id: 'garden-1', name: 'Orto Principale' }
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
  }

  const submitPhotoAnalysis = async () => {
    if (!photoModal.alert || selectedFiles.length === 0) return

    try {
      // Simula l'analisi AI delle foto
      const analysisResult = {
        confidence: 0.85,
        diagnosis: 'Possibile peronospora su foglie',
        recommendations: [
          'Trattamento fungicida preventivo',
          'Migliorare aerazione tra le piante',
          'Ridurre irrigazione fogliare'
        ],
        severity: 'medium' as const
      }

      // Crea task automatico
      const newTask = {
        id: `task-${Date.now()}`,
        gardenId: 'garden-1',
        plantName: photoModal.alert.plantName,
        taskType: 'Treatment',
        date: new Date().toISOString().split('T')[0],
        notes: `AI Analysis: ${analysisResult.diagnosis}. Confidence: ${Math.round(analysisResult.confidence * 100)}%`,
        completed: false,
        priority: analysisResult.severity
      }

      console.log('Task creato automaticamente:', newTask)
      
      setPhotoModal({ isOpen: false })
      setSelectedFiles([])
      
      // Ricarica gli alert
      await loadHealthAlerts()
      
      alert('Analisi completata! Task creato automaticamente nel planner.')
    } catch (error) {
      console.error('Error in photo analysis:', error)
      alert('Errore durante l\'analisi. Riprova.')
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
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                Esporta Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Plus className="w-4 h-4" />
                Nuovo Controllo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Photo Analysis Modal */}
      {photoModal.isOpen && photoModal.alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analisi AI con Foto</h3>
                <button
                  onClick={() => setPhotoModal({ isOpen: false })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium mb-2">Pianta: {photoModal.alert.plantName}</h4>
                <p className="text-gray-600">{photoModal.alert.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carica Foto (max 5)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedFiles.length} file selezionati
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Come funziona l'analisi AI:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Carica foto chiare delle foglie, frutti o parti problematiche</li>
                  <li>• L'AI analizzerà automaticamente segni di malattie o parassiti</li>
                  <li>• Riceverai diagnosi e raccomandazioni specifiche</li>
                  <li>• Verrà creato automaticamente un task nel planner</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhotoModal({ isOpen: false })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={submitPhotoAnalysis}
                  disabled={selectedFiles.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Avvia Analisi AI
                </button>
              </div>
            </div>
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