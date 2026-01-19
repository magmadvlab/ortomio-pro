'use client'

import React, { useState, useEffect } from 'react'
import { Leaf, Plus, TrendingUp, Droplet, Calendar } from 'lucide-react'
import { OliveMaturityData } from '@/types/olive'
import { getSupabaseClient } from '@/config/supabase'

interface OliveMaturityTrackerProps {
  oliveGroveId: string
  oliveGroveName?: string
}

export default function OliveMaturityTracker({ oliveGroveId, oliveGroveName }: OliveMaturityTrackerProps) {
  const [measurements, setMeasurements] = useState<OliveMaturityData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newData, setNewData] = useState<Partial<OliveMaturityData>>({
    measurementDate: new Date(),
    invaiatura_percentage: 0,
    color_stage: 'green'
  })

  useEffect(() => {
    loadMeasurements()
  }, [oliveGroveId])

  const loadMeasurements = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('olive_maturity_tracking')
        .select('*')
        .eq('olive_grove_id', oliveGroveId)
        .order('measurement_date', { ascending: false })

      if (error) throw error
      setMeasurements(data || [])
    } catch (error) {
      console.error('Error loading maturity data:', error)
    }
  }

  const calculateJaenIndex = (invaiatura: number): number => {
    // Simplified Jaén Index calculation based on invaiatura %
    // 0% = 0, 100% = 7
    return (invaiatura / 100) * 7
  }

  const estimateOilContent = (jaenIndex: number): number => {
    // Simplified estimation: oil content increases with maturity
    // Index 0-2: 12-16%, Index 2-4: 16-20%, Index 4-7: 20-24%
    if (jaenIndex < 2) return 12 + (jaenIndex / 2) * 4
    if (jaenIndex < 4) return 16 + ((jaenIndex - 2) / 2) * 4
    return 20 + ((jaenIndex - 4) / 3) * 4
  }

  const getHarvestRecommendation = (jaenIndex: number): { text: string, color: string, urgency: string } => {
    if (jaenIndex < 1.5) {
      return { text: 'Troppo presto - Olive verdi', color: 'text-red-600', urgency: 'bg-red-100 text-red-800' }
    } else if (jaenIndex >= 1.5 && jaenIndex < 2.0) {
      return { text: 'Inizio invaiatura - Attendere', color: 'text-orange-600', urgency: 'bg-orange-100 text-orange-800' }
    } else if (jaenIndex >= 2.0 && jaenIndex <= 3.5) {
      return { text: '✅ Ottimale per olio qualità', color: 'text-green-600', urgency: 'bg-green-100 text-green-800' }
    } else if (jaenIndex > 3.5 && jaenIndex < 5.0) {
      return { text: 'Buono per olio quantità', color: 'text-blue-600', urgency: 'bg-blue-100 text-blue-800' }
    } else {
      return { text: 'Sovramaturazione - Raccolta urgente', color: 'text-yellow-600', urgency: 'bg-yellow-100 text-yellow-800' }
    }
  }

  const handleSave = async () => {
    if (newData.invaiatura_percentage === undefined || newData.invaiatura_percentage < 0) {
      alert('Inserisci una percentuale di invaiatura valida')
      return
    }

    try {
      const supabase = getSupabaseClient()
      const jaenIndex = calculateJaenIndex(newData.invaiatura_percentage)
      const oilContent = estimateOilContent(jaenIndex)
      const recommendation = getHarvestRecommendation(jaenIndex)

      const { error } = await supabase
        .from('olive_maturity_tracking')
        .insert({
          olive_grove_id: oliveGroveId,
          measurement_date: newData.measurementDate,
          invaiatura_percentage: newData.invaiatura_percentage,
          color_stage: newData.color_stage,
          pulp_firmness: newData.pulp_firmness || null,
          detachment_force: newData.detachment_force || null,
          estimated_oil_content: oilContent,
          jaen_index: jaenIndex,
          harvest_recommendation: recommendation.text,
          notes: newData.notes || null
        })

      if (error) throw error

      await loadMeasurements()
      setShowAddModal(false)
      setNewData({
        measurementDate: new Date(),
        invaiatura_percentage: 0,
        color_stage: 'green'
      })
    } catch (error) {
      console.error('Error saving maturity data:', error)
      alert('Errore nel salvataggio')
    }
  }

  const latestMeasurement = measurements[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Leaf className="text-green-600" size={20} />
            Maturazione Olive (Indice Jaén)
          </h3>
          {oliveGroveName && (
            <p className="text-sm text-gray-600">{oliveGroveName}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          Nuova Misurazione
        </button>
      </div>

      {/* Latest Measurement */}
      {latestMeasurement && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ultima Misurazione</p>
              <p className="text-sm text-gray-500">
                {new Date(latestMeasurement.measurement_date).toLocaleDateString('it-IT')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              getHarvestRecommendation(latestMeasurement.jaen_index).urgency
            }`}>
              {getHarvestRecommendation(latestMeasurement.jaen_index).text}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-xs text-gray-600">Indice Jaén</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {latestMeasurement.jaen_index.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">scala 0-7</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="text-purple-600" size={16} />
                <span className="text-xs text-gray-600">Invaiatura</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {latestMeasurement.invaiatura_percentage}%
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="text-blue-600" size={16} />
                <span className="text-xs text-gray-600">Olio Stimato</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {latestMeasurement.estimated_oil_content.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-orange-600" size={16} />
                <span className="text-xs text-gray-600">Stadio Colore</span>
              </div>
              <p className="text-lg font-bold text-orange-600 capitalize">
                {latestMeasurement.color_stage === 'green' ? '🟢 Verde' :
                 latestMeasurement.color_stage === 'turning' ? '🟡 Viraggio' :
                 latestMeasurement.color_stage === 'purple' ? '🟣 Viola' :
                 latestMeasurement.color_stage === 'black' ? '⚫ Nero' : latestMeasurement.color_stage}
              </p>
            </div>
          </div>

          {latestMeasurement.notes && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Note</p>
              <p className="text-sm text-gray-700">{latestMeasurement.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!latestMeasurement && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Leaf size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuna misurazione disponibile</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a monitorare la maturazione delle olive</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Prima Misurazione
          </button>
        </div>
      )}

      {/* Reference Values */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">📊 Indice di Maturazione Jaén</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900 mb-2">Scala Indice (0-7)</p>
            <p className="text-blue-700">• 0-1.5: Olive verdi (troppo presto)</p>
            <p className="text-blue-700">• 1.5-2.0: Inizio invaiatura</p>
            <p className="text-green-700 font-medium">• 2.0-3.5: ✅ Ottimale olio qualità</p>
            <p className="text-blue-700">• 3.5-5.0: Buono olio quantità</p>
            <p className="text-blue-700">• &gt;5.0: Sovramaturazione</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-2">Contenuto Olio</p>
            <p className="text-blue-700">• Indice 0-2: 12-16%</p>
            <p className="text-green-700 font-medium">• Indice 2-4: 16-20% ✅</p>
            <p className="text-blue-700">• Indice 4-7: 20-24%</p>
            <p className="text-xs text-gray-600 mt-2">
              * Valori stimati, variano per varietà e condizioni
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      {measurements.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Storico Misurazioni</h4>
          <div className="space-y-3">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-green-700">
                      {measurement.jaen_index.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-600">Jaén</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(measurement.measurement_date).toLocaleDateString('it-IT')}
                    </p>
                    <p className="text-xs text-gray-600">
                      Invaiatura: {measurement.invaiatura_percentage}% | 
                      Olio: {measurement.estimated_oil_content.toFixed(1)}% | 
                      {measurement.color_stage === 'green' ? '🟢' :
                       measurement.color_stage === 'turning' ? '🟡' :
                       measurement.color_stage === 'purple' ? '🟣' : '⚫'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  getHarvestRecommendation(measurement.jaen_index).urgency
                }`}>
                  {measurement.jaen_index >= 2.0 && measurement.jaen_index <= 3.5 ? 'Ottimale' :
                   measurement.jaen_index < 2.0 ? 'Presto' : 'Maturo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Nuova Misurazione Maturazione</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Misurazione *
                </label>
                <input
                  type="date"
                  value={newData.measurementDate?.toISOString().split('T')[0]}
                  onChange={(e) => setNewData(prev => ({ ...prev, measurementDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invaiatura (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={newData.invaiatura_percentage || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, invaiatura_percentage: parseInt(e.target.value) }))}
                    placeholder="es. 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {newData.invaiatura_percentage !== undefined && newData.invaiatura_percentage >= 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Indice Jaén: {calculateJaenIndex(newData.invaiatura_percentage).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stadio Colore *
                  </label>
                  <select
                    value={newData.color_stage}
                    onChange={(e) => setNewData(prev => ({ ...prev, color_stage: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="green">🟢 Verde</option>
                    <option value="turning">🟡 Viraggio</option>
                    <option value="purple">🟣 Viola</option>
                    <option value="black">⚫ Nero</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consistenza Polpa <span className="text-xs text-gray-500">(opzionale)</span>
                  </label>
                  <select
                    value={newData.pulp_firmness || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, pulp_firmness: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleziona...</option>
                    <option value="hard">Dura</option>
                    <option value="medium">Media</option>
                    <option value="soft">Morbida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forza Distacco <span className="text-xs text-gray-500">(opzionale)</span>
                  </label>
                  <select
                    value={newData.detachment_force || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, detachment_force: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleziona...</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Bassa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note <span className="text-xs text-gray-500">(opzionale)</span>
                </label>
                <textarea
                  value={newData.notes || ''}
                  onChange={(e) => setNewData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Osservazioni..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {newData.invaiatura_percentage !== undefined && newData.invaiatura_percentage >= 0 && (
                <div className={`rounded-lg border-2 p-4 ${
                  calculateJaenIndex(newData.invaiatura_percentage) >= 2.0 && calculateJaenIndex(newData.invaiatura_percentage) <= 3.5
                    ? 'bg-green-50 border-green-200'
                    : calculateJaenIndex(newData.invaiatura_percentage) < 2.0
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className="text-sm font-semibold mb-1">
                    {getHarvestRecommendation(calculateJaenIndex(newData.invaiatura_percentage)).text}
                  </p>
                  <p className="text-xs text-gray-600">
                    Olio stimato: {estimateOilContent(calculateJaenIndex(newData.invaiatura_percentage)).toFixed(1)}%
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewData({
                      measurementDate: new Date(),
                      invaiatura_percentage: 0,
                      color_stage: 'green'
                    })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={newData.invaiatura_percentage === undefined || newData.invaiatura_percentage < 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
