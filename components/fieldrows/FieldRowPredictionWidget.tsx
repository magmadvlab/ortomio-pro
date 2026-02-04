/**
 * Field Row Prediction Widget
 * Visualizza le predizioni AI per un singolo filare
 * Integrato con il sistema predittivo del Director
 */

'use client'

import React from 'react'
import { FieldRowPrediction } from '@/services/fieldRowPredictiveService'
import { 
  TrendingUp, 
  Droplets, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Target,
  Activity,
  Brain,
  Moon,
  CloudRain,
  Zap
} from 'lucide-react'

interface FieldRowPredictionWidgetProps {
  prediction: FieldRowPrediction
  compact?: boolean
  showDetails?: boolean
}

export function FieldRowPredictionWidget({ 
  prediction, 
  compact = false, 
  showDetails = false 
}: FieldRowPredictionWidgetProps) {
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={16} />
            <span className="text-sm font-semibold text-blue-800">AI Predictions</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(prediction.healthStatus.overallScore)}`}>
            {prediction.healthStatus.overallScore}/100
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Raccolto */}
          {prediction.harvestPrediction && (
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-green-600" />
              <span className="text-gray-700">
                Raccolto: {prediction.harvestPrediction.daysRemaining}gg
              </span>
            </div>
          )}

          {/* Resa */}
          {prediction.yieldPrediction && (
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-purple-600" />
              <span className="text-gray-700">
                Resa: {prediction.yieldPrediction.expectedKg}kg
              </span>
            </div>
          )}

          {/* Acqua */}
          <div className="flex items-center gap-2">
            <Droplets size={12} className="text-blue-600" />
            <span className="text-gray-700">
              Acqua: {prediction.waterRequirement.dailyAverage}L/gg
            </span>
          </div>

          {/* Azioni */}
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-orange-600" />
            <span className="text-gray-700">
              {prediction.recommendedActions.length} azioni
            </span>
          </div>
        </div>

        {/* Azione più urgente */}
        {prediction.recommendedActions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className={`px-2 py-1 rounded text-xs ${getPriorityColor(prediction.recommendedActions[0].priority)}`}>
              <strong>Prossima:</strong> {prediction.recommendedActions[0].action}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain size={24} />
            <div>
              <h3 className="font-bold text-lg">AI Predictions</h3>
              <p className="text-blue-100 text-sm">
                Analisi predittiva per {prediction.fieldRowName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getHealthColor(prediction.healthStatus.overallScore)} text-gray-800`}>
              Salute: {prediction.healthStatus.overallScore}/100
            </div>
            <div className="text-xs text-blue-100 mt-1">
              Aggiornato: {new Date(prediction.lastUpdated).toLocaleTimeString('it-IT')}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metriche principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Raccolto */}
          {prediction.harvestPrediction && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-green-600" size={20} />
                <span className="font-semibold text-green-800">Raccolto</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {prediction.harvestPrediction.daysRemaining} giorni
              </div>
              <div className="text-sm text-green-700">
                Data ottimale: {prediction.harvestPrediction.optimalDate.toLocaleDateString('it-IT')}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Confidenza: {Math.round(prediction.harvestPrediction.confidence * 100)}%
              </div>
            </div>
          )}

          {/* Resa */}
          {prediction.yieldPrediction && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-purple-600" size={20} />
                <span className="font-semibold text-purple-800">Resa Attesa</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {prediction.yieldPrediction.expectedKg} kg
              </div>
              <div className="text-sm text-purple-700">
                {prediction.yieldPrediction.expectedKgPerSqm} kg/m²
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Confidenza: {Math.round(prediction.yieldPrediction.confidence * 100)}%
              </div>
            </div>
          )}

          {/* Acqua */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="text-blue-600" size={20} />
              <span className="font-semibold text-blue-800">Fabbisogno Idrico</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {prediction.waterRequirement.dailyAverage} L/gg
            </div>
            <div className="text-sm text-blue-700">
              Prossimi 7gg: {prediction.waterRequirement.next7Days} L
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {prediction.waterRequirement.rainAdjustment}
            </div>
          </div>

          {/* Performance */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-gray-600" size={20} />
              <span className="font-semibold text-gray-800">Performance</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {prediction.performance.activeCount}/{prediction.performance.plantCount}
            </div>
            <div className="text-sm text-gray-700">
              Piante attive
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {prediction.performance.healthyCount} sane, {prediction.performance.problemCount} problemi
            </div>
          </div>
        </div>

        {/* Stato salute dettagliato */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-full ${getRiskColor(prediction.healthStatus.riskLevel)}`}>
              {prediction.healthStatus.riskLevel === 'low' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Stato Salute</h4>
              <p className="text-sm text-gray-600">
                Livello rischio: <span className="font-medium capitalize">{prediction.healthStatus.riskLevel}</span>
              </p>
            </div>
          </div>

          {prediction.healthStatus.mainIssues.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Problemi identificati:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {prediction.healthStatus.mainIssues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prediction.healthStatus.preventiveActions.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Azioni preventive:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {prediction.healthStatus.preventiveActions.map((action, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Azioni consigliate */}
        {prediction.recommendedActions.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target size={18} />
              Azioni Consigliate
            </h4>
            <div className="space-y-3">
              {prediction.recommendedActions.slice(0, showDetails ? undefined : 3).map((action, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(action.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{action.action}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mb-1">{action.reason}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span>⏰ {action.timing}</span>
                        {action.estimatedCost && action.estimatedCost > 0 && (
                          <span>💰 ~€{action.estimatedCost}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!showDetails && prediction.recommendedActions.length > 3 && (
              <p className="text-sm text-gray-500 mt-2">
                +{prediction.recommendedActions.length - 3} altre azioni...
              </p>
            )}
          </div>
        )}

        {/* Director Insights */}
        {showDetails && (
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
              <Brain size={18} />
              Director AI Insights
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-indigo-800 mb-2">Fase Ciclo Vitale</h5>
                <p className="text-indigo-700">{prediction.directorInsights.lifecyclePhase}</p>
              </div>

              <div>
                <h5 className="font-medium text-indigo-800 mb-2 flex items-center gap-1">
                  <Moon size={14} />
                  Timing Lunare
                </h5>
                <p className="text-indigo-700">{prediction.directorInsights.lunarTiming}</p>
              </div>

              {prediction.directorInsights.seasonalAdvice.length > 0 && (
                <div>
                  <h5 className="font-medium text-indigo-800 mb-2">Consigli Stagionali</h5>
                  <ul className="text-indigo-700 space-y-1">
                    {prediction.directorInsights.seasonalAdvice.map((advice, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                        {advice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prediction.directorInsights.weatherAlerts.length > 0 && (
                <div>
                  <h5 className="font-medium text-indigo-800 mb-2 flex items-center gap-1">
                    <CloudRain size={14} />
                    Allerte Meteo
                  </h5>
                  <ul className="text-indigo-700 space-y-1">
                    {prediction.directorInsights.weatherAlerts.map((alert, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ottimizzazioni resa */}
        {showDetails && prediction.yieldPrediction?.optimizationTips.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <TrendingUp size={18} />
              Ottimizzazioni Resa
            </h4>
            <ul className="text-sm text-yellow-800 space-y-2">
              {prediction.yieldPrediction.optimizationTips.map((tip, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fattori raccolto */}
        {showDetails && prediction.harvestPrediction?.factors && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Calendar size={18} />
              Fattori Predizione Raccolto
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {prediction.harvestPrediction.factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-green-800">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FieldRowPredictionWidget