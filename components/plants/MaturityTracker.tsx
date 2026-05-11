/**
 * Maturity Tracker
 * Sistema per tracciare stati maturazione progressivi
 */

'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Target, AlertCircle, CheckCircle, Droplet } from 'lucide-react'
import { MaturityStage } from '@/types/plantMonitoring'
import { maturityTrackingService } from '@/services/plantMonitoringService'

interface MaturityTrackerProps {
  plantId: string
  gardenId: string
  fieldRowId?: string
  plantName: string
}

export default function MaturityTracker({
  plantId,
  gardenId,
  fieldRowId,
  plantName
}: MaturityTrackerProps) {
  const [currentStage, setCurrentStage] = useState<MaturityStage | null>(null)
  const [history, setHistory] = useState<MaturityStage[]>([])
  const [trend, setTrend] = useState<any>(null)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [newStage, setNewStage] = useState<Partial<MaturityStage>>({
    stage: 'immature',
    maturityPercentage: 0,
    indicators: {}
  })

  useEffect(() => {
    loadMaturityData()
  }, [plantId])

  const loadMaturityData = async () => {
    try {
      const [current, hist, trendData] = await Promise.all([
        maturityTrackingService.getCurrentMaturityStage(plantId, fieldRowId),
        maturityTrackingService.getMaturityHistory(plantId, fieldRowId),
        maturityTrackingService.getMaturityTrend(plantId, fieldRowId)
      ])
      
      setCurrentStage(current)
      setHistory(hist)
      setTrend(trendData)
    } catch (error) {
      console.error('Error loading maturity data:', error)
    }
  }

  const handleRecordStage = async () => {
    if (!newStage.stage || newStage.maturityPercentage === undefined) {
      alert('Compila tutti i campi obbligatori')
      return
    }

    try {
      await maturityTrackingService.recordMaturityStage(plantId, gardenId, {
        fieldRowId,
        stage: newStage.stage,
        maturityPercentage: newStage.maturityPercentage,
        indicators: newStage.indicators || {},
        notes: newStage.notes
      })

      await loadMaturityData()
      setShowRecordModal(false)
      setNewStage({
        stage: 'immature',
        maturityPercentage: 0,
        indicators: {}
      })
    } catch (error) {
      console.error('Error recording maturity stage:', error)
      alert('Errore nel salvataggio')
    }
  }

  const getStageLabel = (stage: MaturityStage['stage']) => {
    const labels: Record<MaturityStage['stage'], string> = {
      seedling: 'Piantina',
      vegetative: 'Vegetativa',
      flowering: 'Fioritura',
      fruit_set: 'Allegagione',
      immature: 'Acerbo',
      veraison: 'Invaiatura',
      mature: 'Maturo',
      overripe: 'Sovramaturo',
      senescent: 'Senescente'
    }
    return labels[stage]
  }

  const getStageColor = (stage: MaturityStage['stage']) => {
    const colors: Record<MaturityStage['stage'], string> = {
      seedling: 'bg-green-100 text-green-700',
      vegetative: 'bg-green-200 text-green-800',
      flowering: 'bg-yellow-100 text-yellow-700',
      fruit_set: 'bg-orange-100 text-orange-700',
      immature: 'bg-red-100 text-red-700',
      veraison: 'bg-purple-100 text-purple-700',
      mature: 'bg-blue-100 text-blue-700',
      overripe: 'bg-gray-100 text-gray-700',
      senescent: 'bg-gray-200 text-gray-800'
    }
    return colors[stage]
  }

  const getMaturityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-blue-600'
    if (percentage >= 70) return 'text-purple-600'
    if (percentage >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Maturazione</h3>
          <p className="text-sm text-gray-600">{plantName}</p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Target size={18} />
          Registra Stato
        </button>
      </div>

      {/* Stato Corrente */}
      {currentStage ? (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStageColor(currentStage.stage)}`}>
                {getStageLabel(currentStage.stage)}
              </span>
              <p className="text-sm text-gray-600 mt-2">
                Ultimo aggiornamento: {new Date(currentStage.assessedAt).toLocaleDateString('it-IT')}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-bold ${getMaturityColor(currentStage.maturityPercentage)}`}>
                {currentStage.maturityPercentage}%
              </p>
              <p className="text-sm text-gray-600">Maturazione</p>
            </div>
          </div>

          {/* Barra progresso */}
          <div className="mb-4">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-blue-500 transition-all duration-500"
                style={{ width: `${currentStage.maturityPercentage}%` }}
              />
            </div>
          </div>

          {/* Indicatori */}
          {currentStage.indicators && Object.keys(currentStage.indicators).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {currentStage.indicators.colorChange !== undefined && (
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Cambio Colore</p>
                  <p className="text-lg font-semibold">{currentStage.indicators.colorChange}%</p>
                </div>
              )}
              {currentStage.indicators.firmness && (
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Consistenza</p>
                  <p className="text-sm font-semibold capitalize">{currentStage.indicators.firmness.replace('_', ' ')}</p>
                </div>
              )}
              {currentStage.indicators.sugarContent !== undefined && (
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Zuccheri (Brix)</p>
                  <p className="text-lg font-semibold">{currentStage.indicators.sugarContent}°</p>
                </div>
              )}
            </div>
          )}

          {/* Stima raccolta */}
          {currentStage.daysToOptimalHarvest !== undefined && (
            <div className="bg-white rounded-lg p-4 flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Raccolta Ottimale</p>
                <p className="font-semibold text-gray-900">
                  {currentStage.daysToOptimalHarvest === 0 ? 'Oggi!' : 
                   currentStage.daysToOptimalHarvest === 1 ? 'Domani' :
                   `Tra ${currentStage.daysToOptimalHarvest} giorni`}
                </p>
                {currentStage.optimalHarvestDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(currentStage.optimalHarvestDate).toLocaleDateString('it-IT')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Target size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuno stato registrato</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a tracciare la maturazione</p>
          <button
            onClick={() => setShowRecordModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Target size={18} />
            Registra Primo Stato
          </button>
        </div>
      )}

      {/* Trend */}
      {trend && trend.currentPercentage > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            Trend Maturazione
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Incremento Settimanale</p>
              <p className="text-xl font-bold text-green-600">+{trend.weeklyIncrease}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Velocità</p>
              <p className="text-xl font-bold capitalize">{trend.trend === 'fast' ? '🚀 Veloce' : trend.trend === 'slow' ? '🐌 Lenta' : '➡️ Normale'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Raccolta Prevista</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(trend.projectedHarvestDate).toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Storico */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Storico Valutazioni</h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((stage, index) => (
              <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(stage.stage)}`}>
                    {getStageLabel(stage.stage)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(stage.assessedAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <span className={`text-lg font-bold ${getMaturityColor(stage.maturityPercentage)}`}>
                  {stage.maturityPercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Registrazione */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Registra Stato Maturazione</h3>

            <div className="space-y-4">
              {/* Stadio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stadio Fenologico
                </label>
                <select
                  value={newStage.stage}
                  onChange={(e) => setNewStage(prev => ({ ...prev, stage: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="seedling">Piantina</option>
                  <option value="vegetative">Vegetativa</option>
                  <option value="flowering">Fioritura</option>
                  <option value="fruit_set">Allegagione</option>
                  <option value="immature">Acerbo</option>
                  <option value="veraison">Invaiatura</option>
                  <option value="mature">Maturo</option>
                  <option value="overripe">Sovramaturo</option>
                </select>
              </div>

              {/* Percentuale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentuale Maturazione: {newStage.maturityPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newStage.maturityPercentage}
                  onChange={(e) => setNewStage(prev => ({ ...prev, maturityPercentage: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Indicatori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cambio Colore (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStage.indicators?.colorChange || ''}
                    onChange={(e) => setNewStage(prev => ({
                      ...prev,
                      indicators: { ...prev.indicators, colorChange: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consistenza
                  </label>
                  <select
                    value={newStage.indicators?.firmness || ''}
                    onChange={(e) => setNewStage(prev => ({
                      ...prev,
                      indicators: { ...prev.indicators, firmness: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Non specificato</option>
                    <option value="very_hard">Molto Duro</option>
                    <option value="hard">Duro</option>
                    <option value="firm">Sodo</option>
                    <option value="soft">Morbido</option>
                    <option value="very_soft">Molto Morbido</option>
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={newStage.notes || ''}
                  onChange={(e) => setNewStage(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Osservazioni aggiuntive..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Pulsanti */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleRecordStage}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Salva Stato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
