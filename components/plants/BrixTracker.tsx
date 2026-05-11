/**
 * Brix Tracker
 * Sistema per misurare e tracciare gradi Brix
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Droplet, TrendingUp, Camera, Plus, Calendar } from 'lucide-react'
import { BrixHistory, BrixMeasurementRequest } from '@/types/plantMonitoring'
import { brixManagementService } from '@/services/plantMonitoringService'

interface BrixTrackerProps {
  plantId: string
  gardenId: string
  fieldRowId?: string
  plantName: string
}

export default function BrixTracker({
  plantId,
  gardenId,
  fieldRowId,
  plantName
}: BrixTrackerProps) {
  const [history, setHistory] = useState<BrixHistory[]>([])
  const [trend, setTrend] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMeasurement, setNewMeasurement] = useState<Partial<BrixMeasurementRequest>>({
    method: 'refractometer',
    fruitLocation: 'middle',
    fruitNumber: 1
  })

  useEffect(() => {
    loadBrixData()
  }, [plantId])

  const loadBrixData = async () => {
    try {
      const [hist, trendData] = await Promise.all([
        brixManagementService.getBrixHistory(plantId, fieldRowId),
        brixManagementService.getBrixTrend(plantId, fieldRowId)
      ])
      
      setHistory(hist)
      setTrend(trendData)
    } catch (error) {
      console.error('Error loading Brix data:', error)
    }
  }

  const handleAddMeasurement = async () => {
    if (!newMeasurement.value || newMeasurement.value < 0 || newMeasurement.value > 30) {
      alert('Inserisci un valore Brix valido (0-30)')
      return
    }

    try {
      const request: BrixMeasurementRequest = {
        plantId,
        gardenId,
        fieldRowId,
        method: newMeasurement.method!,
        value: newMeasurement.value,
        fruitLocation: newMeasurement.fruitLocation!,
        fruitNumber: newMeasurement.fruitNumber!,
        notes: newMeasurement.notes
      }

      await brixManagementService.recordBrixMeasurement(request)
      await loadBrixData()
      
      setShowAddModal(false)
      setNewMeasurement({
        method: 'refractometer',
        fruitLocation: 'middle',
        fruitNumber: 1
      })
    } catch (error) {
      console.error('Error adding measurement:', error)
      alert('Errore nel salvataggio')
    }
  }

  const getBrixQuality = (brix: number) => {
    if (brix >= 16) return { label: 'Eccellente', color: 'text-green-600', bg: 'bg-green-50' }
    if (brix >= 14) return { label: 'Ottimo', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (brix >= 12) return { label: 'Buono', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (brix >= 10) return { label: 'Discreto', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { label: 'Basso', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const getMethodLabel = (method: BrixHistory['method']) => {
    const labels: Record<BrixHistory['method'], string> = {
      refractometer: 'Rifrattometro',
      ai_estimation: 'Stima AI',
      manual: 'Manuale'
    }
    return labels[method]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Droplet className="text-blue-600" size={20} />
            Gradi Brix
          </h3>
          <p className="text-sm text-gray-600">{plantName}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Nuova Misurazione
        </button>
      </div>

      {/* Stato Corrente */}
      {trend && trend.current > 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Brix Attuale</p>
              <p className="text-5xl font-bold text-blue-600">{trend.current}°</p>
              {(() => {
                const quality = getBrixQuality(trend.current)
                return (
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${quality.bg} ${quality.color}`}>
                    {quality.label}
                  </span>
                )
              })()}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={trend.trend === 'increasing' ? 'text-green-600' : trend.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'} size={20} />
                <span className="text-sm font-medium text-gray-700">
                  {trend.trend === 'increasing' ? 'In Aumento' : trend.trend === 'decreasing' ? 'In Calo' : 'Stabile'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {trend.weeklyIncrease > 0 ? '+' : ''}{trend.weeklyIncrease}° / settimana
              </p>
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Media</p>
              <p className="text-xl font-bold text-gray-900">{trend.average}°</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Minimo</p>
              <p className="text-xl font-bold text-gray-900">{trend.min}°</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-gray-600">Massimo</p>
              <p className="text-xl font-bold text-gray-900">{trend.max}°</p>
            </div>
          </div>

          {/* Raccomandazione */}
          <div className="mt-4 bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">💡 Raccomandazione</p>
            <p className="text-sm text-gray-700">
              {trend.current >= 14 ? 
                'Ottimo livello di zuccheri! La frutta è pronta per la raccolta.' :
                trend.current >= 12 ?
                'Buon livello. Considera di attendere ancora qualche giorno per zuccheri ottimali.' :
                'Livello ancora basso. Attendi almeno 1-2 settimane prima della raccolta.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Droplet size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuna misurazione</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a tracciare i gradi Brix</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Prima Misurazione
          </button>
        </div>
      )}

      {/* Grafico Trend (semplificato) */}
      {history.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Andamento Brix</h4>
          <div className="h-32 flex items-end gap-2">
            {history.slice(0, 10).reverse().map((measurement, index) => {
              const maxBrix = Math.max(...history.map(h => h.brixValue))
              const height = (measurement.brixValue / maxBrix) * 100
              const quality = getBrixQuality(measurement.brixValue)
              
              return (
                <div key={measurement.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs font-medium text-gray-700">{measurement.brixValue}°</div>
                  <div
                    className={`w-full ${quality.bg} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${height}%` }}
                    title={`${measurement.brixValue}° - ${new Date(measurement.measurementDate).toLocaleDateString('it-IT')}`}
                  />
                  <div className="text-xs text-gray-500">
                    {new Date(measurement.measurementDate).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Storico Misurazioni */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Storico Misurazioni</h4>
          <div className="space-y-2">
            {history.slice(0, 5).map((measurement) => {
              const quality = getBrixQuality(measurement.brixValue)
              return (
                <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${quality.bg} rounded-lg flex items-center justify-center`}>
                      <span className={`text-lg font-bold ${quality.color}`}>{measurement.brixValue}°</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(measurement.measurementDate).toLocaleDateString('it-IT')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getMethodLabel(measurement.method)} • Frutto #{measurement.fruitSample.fruitNumber} • {measurement.fruitSample.location}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${quality.bg} ${quality.color}`}>
                    {quality.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal Nuova Misurazione */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Nuova Misurazione Brix</h3>

            <div className="space-y-4">
              {/* Valore Brix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gradi Brix (°Bx)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={newMeasurement.value || ''}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                  placeholder="es. 14.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Valore tipico: 10-20°Bx</p>
              </div>

              {/* Metodo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metodo Misurazione
                </label>
                <select
                  value={newMeasurement.method}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, method: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="refractometer">⭐ Rifrattometro (Preciso ±0.2°Bx) - RACCOMANDATO</option>
                  <option value="ai_estimation">Spettrometro Hardware (Approssimativo ±1-2°Bx)</option>
                  <option value="manual">Stima Manuale (Molto Impreciso ±2-3°Bx)</option>
                </select>
                <div className="mt-2 text-xs">
                  {newMeasurement.method === 'refractometer' && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 text-green-700">
                      ✅ <strong>Raccomandato:</strong> Rifrattometro manuale (€20-50). Preciso e affidabile.
                    </div>
                  )}
                  {newMeasurement.method === 'ai_estimation' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-700">
                      ⚠️ <strong>Richiede hardware:</strong> Spettrometro fisico (es: Thunder Optics €50-80).
                      <br/>NON funziona con solo fotocamera smartphone!
                    </div>
                  )}
                  {newMeasurement.method === 'manual' && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
                      ❌ <strong>Molto impreciso:</strong> Solo per stima rapida. Non usare per decisioni importanti.
                    </div>
                  )}
                </div>
              </div>

              {/* Posizione Frutto */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posizione Pianta
                  </label>
                  <select
                    value={newMeasurement.fruitLocation}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, fruitLocation: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="top">Alto</option>
                    <option value="middle">Medio</option>
                    <option value="bottom">Basso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Frutto
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMeasurement.fruitNumber}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, fruitNumber: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={newMeasurement.notes || ''}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Osservazioni..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Pulsanti */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddMeasurement}
                  disabled={!newMeasurement.value}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Salva Misurazione
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
