/**
 * Treatment Tracker
 * Sistema per tracciare cure con foto before/after
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Bug, Camera, CheckCircle, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'
import { TreatmentTracking } from '@/types/plantMonitoring'
import { treatmentTrackingService } from '@/services/plantMonitoringService'

interface TreatmentTrackerProps {
  plantId: string
  gardenId: string
  plantName: string
}

export default function TreatmentTracker({
  plantId,
  gardenId,
  plantName
}: TreatmentTrackerProps) {
  const [activeTreatments, setActiveTreatments] = useState<TreatmentTracking[]>([])
  const [effectiveness, setEffectiveness] = useState<any>(null)
  const [showStartModal, setShowStartModal] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentTracking | null>(null)

  useEffect(() => {
    loadTreatmentData()
  }, [plantId])

  const loadTreatmentData = async () => {
    try {
      const [active, eff] = await Promise.all([
        treatmentTrackingService.getActiveTreatments(plantId),
        treatmentTrackingService.calculateTreatmentEffectiveness(plantId)
      ])
      
      setActiveTreatments(active)
      setEffectiveness(eff)
    } catch (error) {
      console.error('Error loading treatment data:', error)
    }
  }

  const getIssueTypeLabel = (type: TreatmentTracking['issue']['type']) => {
    const labels: Record<TreatmentTracking['issue']['type'], string> = {
      disease: 'Malattia',
      pest: 'Parassita',
      nutrient_deficiency: 'Carenza Nutrizionale',
      water_stress: 'Stress Idrico',
      other: 'Altro'
    }
    return labels[type]
  }

  const getSeverityColor = (severity: TreatmentTracking['issue']['severity']) => {
    const colors: Record<TreatmentTracking['issue']['severity'], string> = {
      low: 'bg-yellow-100 text-yellow-700',
      medium: 'bg-orange-100 text-orange-700',
      high: 'bg-red-100 text-red-700',
      critical: 'bg-red-200 text-red-900'
    }
    return colors[severity]
  }

  const getOutcomeIcon = (status: NonNullable<TreatmentTracking['outcome']>['status']) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="text-green-600" size={20} />
      case 'improving': return <TrendingUp className="text-blue-600" size={20} />
      case 'no_change': return <AlertTriangle className="text-yellow-600" size={20} />
      case 'worsening': return <AlertTriangle className="text-red-600" size={20} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bug className="text-orange-600" size={20} />
            Tracking Trattamenti
          </h3>
          <p className="text-sm text-gray-600">{plantName}</p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Camera size={18} />
          Nuovo Trattamento
        </button>
      </div>

      {/* Statistiche Efficacia */}
      {effectiveness && effectiveness.totalTreatments > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Efficacia Trattamenti</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Totali</p>
              <p className="text-2xl font-bold text-gray-900">{effectiveness.totalTreatments}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Risolti</p>
              <p className="text-2xl font-bold text-green-600">{effectiveness.resolved}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Efficacia Media</p>
              <p className="text-2xl font-bold text-blue-600">{effectiveness.avgEffectiveness}%</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Giorni Medi</p>
              <p className="text-2xl font-bold text-purple-600">{effectiveness.avgDaysToResolution}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trattamenti Attivi */}
      {activeTreatments.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Trattamenti in Corso</h4>
          {activeTreatments.map(treatment => (
            <div
              key={treatment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTreatment(treatment)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(treatment.issue.severity)}`}>
                      {treatment.issue.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">{getIssueTypeLabel(treatment.issue.type)}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{treatment.issue.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Trattamento: {treatment.treatment.productName}
                  </p>
                </div>
                {treatment.outcome && getOutcomeIcon(treatment.outcome.status)}
              </div>

              {/* Timeline foto */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Camera size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{treatment.beforePhotos.length} before</span>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <div className="flex items-center gap-1">
                  <Camera size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{treatment.afterPhotos.length} after</span>
                </div>
              </div>

              {/* Progress */}
              {treatment.outcome && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Efficacia:</span>
                    <span className="font-semibold text-gray-900">{treatment.outcome.effectiveness}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${treatment.outcome.effectiveness}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Bug size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessun trattamento attivo</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a tracciare i trattamenti con foto before/after</p>
          <button
            onClick={() => setShowStartModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Camera size={18} />
            Inizia Tracking
          </button>
        </div>
      )}

      {/* Modal Dettaglio Trattamento */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Dettaglio Trattamento: {selectedTreatment.issue.name}
            </h3>

            {/* Info Problema */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-semibold">{getIssueTypeLabel(selectedTreatment.issue.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gravità</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedTreatment.issue.severity)}`}>
                    {selectedTreatment.issue.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rilevato</p>
                  <p className="font-semibold">
                    {new Date(selectedTreatment.issue.detectedAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Metodo</p>
                  <p className="font-semibold">{selectedTreatment.issue.detectionMethod}</p>
                </div>
              </div>
            </div>

            {/* Trattamento Applicato */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Trattamento Applicato</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Prodotto</p>
                  <p className="font-semibold">{selectedTreatment.treatment.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dosaggio</p>
                  <p className="font-semibold">
                    {selectedTreatment.treatment.dosage} {selectedTreatment.treatment.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Metodo</p>
                  <p className="font-semibold">{selectedTreatment.treatment.applicationMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data</p>
                  <p className="font-semibold">
                    {new Date(selectedTreatment.treatment.appliedAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
            </div>

            {/* Foto Before/After */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Documentazione Fotografica</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Prima del Trattamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTreatment.beforePhotos.map((photoId, index) => (
                      <div key={photoId} className="aspect-square bg-gray-200 rounded-lg">
                        {/* TODO: Caricare foto reale */}
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera size={32} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Dopo il Trattamento</p>
                  <div className="space-y-2">
                    {selectedTreatment.afterPhotos.map((after, index) => (
                      <div key={after.photoId} className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 bg-gray-200 rounded">
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Camera size={20} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">+{after.daysAfterTreatment} giorni</p>
                            {after.improvementScore && (
                              <p className="text-xs text-gray-600">
                                Miglioramento: {after.improvementScore}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outcome */}
            {selectedTreatment.outcome && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {getOutcomeIcon(selectedTreatment.outcome.status)}
                  Risultato
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Stato</p>
                    <p className="font-semibold capitalize">{selectedTreatment.outcome.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Efficacia</p>
                    <p className="font-semibold">{selectedTreatment.outcome.effectiveness}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giorni Risoluzione</p>
                    <p className="font-semibold">{selectedTreatment.outcome.daysToResolution || 'N/A'}</p>
                  </div>
                </div>
                {selectedTreatment.outcome.notes && (
                  <p className="text-sm text-gray-700 mt-3">{selectedTreatment.outcome.notes}</p>
                )}
              </div>
            )}

            {/* Pulsanti */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedTreatment(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Chiudi
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Aggiungi Foto After
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
