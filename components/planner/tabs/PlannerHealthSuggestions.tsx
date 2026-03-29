'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Garden, GardenTask } from '@/types'
import { plantHealthMonitoringService, HealthAlert, HealthAction } from '@/services/plantHealthMonitoringService'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { 
  Camera, 
  UserCheck, 
  AlertTriangle, 
  Stethoscope, 
  Brain, 
  Calendar,
  Clock,
  TrendingDown,
  Eye,
  Phone,
  Zap,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react'

interface PlannerHealthSuggestionsProps {
  garden: Garden
  tasks: GardenTask[]
  onCreateTask: (task: Omit<GardenTask, 'id'>) => Promise<void>
}

export default function PlannerHealthSuggestions({ garden, tasks, onCreateTask }: PlannerHealthSuggestionsProps) {
  const { storageProvider } = useStorage()
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<HealthAlert | null>(null)
  const [showAgronomistModal, setShowAgronomistModal] = useState(false)
  const [showPhotoAnalysisModal, setShowPhotoAnalysisModal] = useState(false)

  const generateHealthAlerts = useCallback(async () => {
    setLoading(true)
    
    try {
      // Utilizza il servizio di monitoraggio per analizzare il giardino
      const devices = storageProvider?.getDevices
        ? await storageProvider.getDevices(garden.id).catch(() => [])
        : []
      const alerts = await plantHealthMonitoringService.analyzeGardenHealth(garden, tasks, { devices })
      setHealthAlerts(alerts)
    } catch (error) {
      console.error('Error analyzing garden health:', error)
      setHealthAlerts([])
    } finally {
      setLoading(false)
    }
  }, [garden, tasks, storageProvider])

  useEffect(() => {
    generateHealthAlerts()
  }, [generateHealthAlerts])

  const getSeverityColor = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800'
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800'
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800'
    }
  }

  const getSeverityIcon = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="text-red-600" size={20} />
      case 'high': return <AlertTriangle className="text-orange-600" size={20} />
      case 'medium': return <Eye className="text-yellow-600" size={20} />
      case 'low': return <Info className="text-blue-600" size={20} />
    }
  }

  const getTypeIcon = (type: HealthAlert['type']) => {
    switch (type) {
      case 'disease_risk': return <Stethoscope className="text-red-600" size={24} />
      case 'pest_alert': return <AlertTriangle className="text-orange-600" size={24} />
      case 'nutrient_deficiency': return <Zap className="text-yellow-600" size={24} />
      case 'stress_symptoms': return <TrendingDown className="text-purple-600" size={24} />
      case 'harvest_timing': return <CheckCircle className="text-green-600" size={24} />
    }
  }

  const getActionIcon = (type: HealthAction['type']) => {
    switch (type) {
      case 'photo_analysis': return <Camera className="text-blue-600" size={16} />
      case 'agronomist_contact': return <UserCheck className="text-green-600" size={16} />
      case 'intervention': return <Zap className="text-orange-600" size={16} />
      case 'monitoring': return <Eye className="text-purple-600" size={16} />
    }
  }

  const handleActionClick = async (alert: HealthAlert, action: HealthAction) => {
    switch (action.type) {
      case 'photo_analysis':
        setSelectedAlert(alert)
        setShowPhotoAnalysisModal(true)
        break
      
      case 'agronomist_contact':
        setSelectedAlert(alert)
        setShowAgronomistModal(true)
        break
      
      case 'intervention':
      case 'monitoring':
        // Crea task nel planner utilizzando il servizio
        try {
          const taskTemplate = await plantHealthMonitoringService.createTaskFromAction(alert, action, garden)
          await onCreateTask(taskTemplate as Omit<GardenTask, 'id'>)
          window.alert('✅ Task aggiunto al planner!')
        } catch (error) {
          console.error('Error creating task:', error)
          window.alert('❌ Errore nella creazione del task')
        }
        break
    }
  }

  const handlePhotoAnalysis = async () => {
    if (!selectedAlert) return
    
    // Simula analisi AI
    setLoading(true)
    
    // TODO: Implementare chiamata API per analisi AI
    setTimeout(() => {
      setLoading(false)
      setShowPhotoAnalysisModal(false)
      
      // Simula risultato analisi
      const analysisResult = {
        confidence: 0.87,
        diagnosis: 'Peronospora del pomodoro (Phytophthora infestans)',
        severity: 'Moderata',
        recommendations: [
          'Rimuovere foglie infette',
          'Applicare fungicida rameico',
          'Migliorare aerazione',
          'Ridurre irrigazione fogliare'
        ]
      }
      
      window.alert(`🤖 Analisi AI Completata!\n\nDiagnosi: ${analysisResult.diagnosis}\nSeverità: ${analysisResult.severity}\nConfidenza: ${(analysisResult.confidence * 100).toFixed(0)}%\n\nRaccomandazioni:\n${analysisResult.recommendations.join('\n')}`)
    }, 3000)
  }

  const handleAgronomistContact = async (message: string) => {
    if (!selectedAlert) return
    
    // Simula invio richiesta consulto
    const consultationRequest = {
      alertId: selectedAlert.id,
      plantName: selectedAlert.plantName,
      plantCode: selectedAlert.plantCode,
      problem: selectedAlert.description,
      urgency: selectedAlert.severity,
      message,
      requestedAt: new Date().toISOString()
    }
    
    // TODO: Implementare invio richiesta a sistema agronomi
    console.log('Consultation request:', consultationRequest)
    
    setShowAgronomistModal(false)
    window.alert('📞 Richiesta di consulto inviata!\n\nUn agronomo ti contatterà entro 24 ore per discutere il problema.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Analisi salute piante in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="text-green-600" size={28} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monitoraggio Salute Piante</h2>
            <p className="text-gray-600">AI rileva problemi e suggerisce azioni immediate</p>
          </div>
        </div>

        {/* Stats rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {healthAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
            </p>
            <p className="text-sm text-red-700">Urgenti</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {healthAlerts.filter(a => a.severity === 'medium').length}
            </p>
            <p className="text-sm text-yellow-700">Da Monitorare</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {healthAlerts.filter(a => a.photoRequired).length}
            </p>
            <p className="text-sm text-blue-700">Foto Richieste</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {healthAlerts.filter(a => a.agronomistConsultation).length}
            </p>
            <p className="text-sm text-green-700">Consulti Agronomo</p>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {healthAlerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-lg shadow-md border-l-4 border-l-orange-500">
            <div className="p-6">
              {/* Header Alert */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.plantName}
                      </h3>
                      {alert.plantCode && (
                        <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {alert.plantCode}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>
                    
                    {/* Timing info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>Rilevato {new Date(alert.detectedAt).toLocaleDateString('it-IT')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Urgenza: {alert.urgencyDays} giorni</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {getSeverityIcon(alert.severity)}
              </div>

              {/* Azioni Suggerite */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <ArrowRight size={16} />
                  Azioni Consigliate
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {alert.suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(alert, action)}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        action.priority === 'high' 
                          ? 'border-red-200 bg-red-50 hover:border-red-300'
                          : action.priority === 'medium'
                          ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                          : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getActionIcon(action.type)}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">{action.title}</h5>
                          <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">⏱️ {action.estimatedTime}</span>
                            {action.cost && (
                              <span className="text-green-600 font-medium">€{action.cost}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                {alert.photoRequired && (
                  <button
                    onClick={() => {
                      setSelectedAlert(alert)
                      setShowPhotoAnalysisModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Camera size={16} />
                    Analisi AI con Foto
                  </button>
                )}
                
                {alert.agronomistConsultation && (
                  <button
                    onClick={() => {
                      setSelectedAlert(alert)
                      setShowAgronomistModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone size={16} />
                    Contatta Agronomo
                  </button>
                )}
                
                <button
                  onClick={() => {
                    // Segna come risolto utilizzando il servizio
                    plantHealthMonitoringService.dismissAlert(alert.id)
                    setHealthAlerts(prev => prev.filter(a => a.id !== alert.id))
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <CheckCircle size={16} />
                  Risolto
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Analisi Foto */}
      {showPhotoAnalysisModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="text-blue-600" />
                Analisi AI - {selectedAlert.plantName}
              </h3>
              
              <p className="text-gray-600 mb-4">
                Scatta o carica foto delle piante per ottenere una diagnosi automatica AI
              </p>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600 mb-3">
                    Carica foto delle foglie, frutti o parti interessate
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        void handlePhotoAnalysis()
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    <Camera size={16} />
                    Seleziona Foto
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Suggerimenti per foto ottimali:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Scatta in buona luce naturale</li>
                    <li>• Includi foglie sane e malate per confronto</li>
                    <li>• Foto ravvicinate dei sintomi</li>
                    <li>• Evita ombre e riflessi</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowPhotoAnalysisModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contatto Agronomo */}
      {showAgronomistModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="text-green-600" />
                Consulto Agronomo - {selectedAlert.plantName}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-green-900 mb-1">Problema Rilevato:</h4>
                  <p className="text-sm text-green-800">{selectedAlert.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Messaggio per l'Agronomo (opzionale)
                  </label>
                  <textarea
                    placeholder="Descrivi ulteriori dettagli, sintomi osservati, trattamenti già effettuati..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={4}
                    id="agronomist-message"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-900 mb-2">📞 Cosa aspettarsi:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Risposta entro 24 ore</li>
                    <li>• Consulto telefonico o video</li>
                    <li>• Diagnosi professionale</li>
                    <li>• Piano di trattamento personalizzato</li>
                    <li>• Costo: €50 (rimborsabile se cliente premium)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowAgronomistModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    const message = (document.getElementById('agronomist-message') as HTMLTextAreaElement)?.value || ''
                    handleAgronomistContact(message)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Richiedi Consulto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {healthAlerts.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tutte le piante sono in salute! 🌱
          </h3>
          <p className="text-gray-600">
            Nessun problema rilevato. Il sistema continua a monitorare automaticamente.
          </p>
        </div>
      )}
    </div>
  )
}
