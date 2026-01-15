'use client'

import { AlertTriangle, Clock, Target, CheckCircle } from 'lucide-react'
import type { DiseasePredicition } from '@/services/aiPredictiveEngine'

interface Props {
  predictions: DiseasePredicition[]
}

export default function DiseasePredictionsCard({ predictions }: Props) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-900 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-900 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-900 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-900 border-green-200'
      default: return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5" />
      case 'MEDIUM':
        return <Clock className="w-5 h-5" />
      case 'LOW':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  if (predictions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Nessuna Malattia Prevista
        </h3>
        <p className="text-gray-600">
          Le tue piante sembrano in ottima salute! Continua così.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <div
          key={prediction.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {prediction.plantName}
                </h3>
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2
                  ${getSeverityColor(prediction.severity)}
                `}>
                  {getSeverityIcon(prediction.severity)}
                  {prediction.severity}
                </span>
              </div>
              <p className="text-gray-600 font-medium">
                {prediction.disease}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(prediction.probability * 100)}%
              </div>
              <div className="text-sm text-gray-500">
                Probabilità
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Lead Time</div>
              <div className="text-lg font-bold text-gray-900">
                {prediction.leadTime} giorni
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Confidence</div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(prediction.confidence * 100)}%
              </div>
            </div>
          </div>

          {/* Symptoms */}
          {prediction.symptoms.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Sintomi da Monitorare
              </h4>
              <ul className="space-y-1">
                {prediction.symptoms.map((symptom, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preventive Measures */}
          {prediction.preventiveMeasures.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Misure Preventive
              </h4>
              <ul className="space-y-1">
                {prediction.preventiveMeasures.map((measure, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatments */}
          {prediction.treatments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Trattamenti Consigliati
              </h4>
              <ul className="space-y-1">
                {prediction.treatments.map((treatment, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{treatment}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
