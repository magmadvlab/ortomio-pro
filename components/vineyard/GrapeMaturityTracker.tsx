'use client'

import React, { useState, useEffect } from 'react'
import { Grape, Plus, TrendingUp, Droplet, Activity, Calendar, AlertCircle } from 'lucide-react'
import { GrapeMaturityData } from '@/types/vineyard'
import { getSupabaseClient } from '@/config/supabase'

interface GrapeMaturityTrackerProps {
  vineyardId: string
  vineyardName?: string
}

export default function GrapeMaturityTracker({ vineyardId, vineyardName }: GrapeMaturityTrackerProps) {
  const [measurements, setMeasurements] = useState<GrapeMaturityData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newData, setNewData] = useState<Partial<GrapeMaturityData>>({
    measurementDate: new Date(),
    brix: 0,
    ph: 0,
    totalAcidity: 0
  })

  useEffect(() => {
    loadMeasurements()
  }, [vineyardId])

  const loadMeasurements = async () => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('vineyard_maturity_tracking')
        .select('*')
        .eq('vineyard_id', vineyardId)
        .order('measurement_date', { ascending: false })

      if (error) throw error
      setMeasurements(data || [])
    } catch (error) {
      console.error('Error loading maturity data:', error)
    }
  }

  const calculateEstimatedAlcohol = (brix: number) => {
    return brix * 0.6
  }

  const getHarvestRecommendation = (brix: number): { text: string, color: string, urgency: string } => {
    if (brix < 18) {
      return { text: 'Troppo presto - Attendere', color: 'text-red-600', urgency: 'bg-red-100 text-red-800' }
    } else if (brix >= 18 && brix < 20) {
      return { text: 'Ancora acerbo - Monitorare', color: 'text-orange-600', urgency: 'bg-orange-100 text-orange-800' }
    } else if (brix >= 20 && brix < 24) {
      return { text: '✅ Maturazione ottimale', color: 'text-green-600', urgency: 'bg-green-100 text-green-800' }
    } else if (brix >= 24 && brix < 26) {
      return { text: 'Vendemmia consigliata presto', color: 'text-yellow-600', urgency: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { text: '⚠️ Sovramaturazione - Vendemmia urgente', color: 'text-red-600', urgency: 'bg-red-100 text-red-800' }
    }
  }

  const handleSave = async () => {
    if (!newData.brix || newData.brix <= 0) {
      alert('Inserisci un valore Brix valido')
      return
    }

    try {
      const supabase = getSupabaseClient()
      const estimatedAlcohol = calculateEstimatedAlcohol(newData.brix)
      const recommendation = getHarvestRecommendation(newData.brix)

      const { error } = await supabase
        .from('vineyard_maturity_tracking')
        .insert({
          vineyard_id: vineyardId,
          measurement_date: newData.measurementDate,
          brix: newData.brix,
          ph: newData.ph || null,
          total_acidity: newData.totalAcidity || null,
          malic_acid: newData.malicAcid || null,
          tartaric_acid: newData.tartaricAcid || null,
          berry_weight: newData.berryWeight || null,
          berry_color: newData.berryColor || null,
          estimated_alcohol: estimatedAlcohol,
          harvest_recommendation: recommendation.text,
          tasting_notes: newData.tastingNotes || null
        })

      if (error) throw error

      await loadMeasurements()
      setShowAddModal(false)
      setNewData({
        measurementDate: new Date(),
        brix: 0,
        ph: 0,
        totalAcidity: 0
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
            <Grape className="text-purple-600" size={20} />
            Maturazione Tecnologica Uva
          </h3>
          {vineyardName && (
            <p className="text-sm text-gray-600">{vineyardName}</p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={18} />
          Nuova Misurazione
        </button>
      </div>

      {/* Latest Measurement */}
      {latestMeasurement && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ultima Misurazione</p>
              <p className="text-sm text-gray-500">
                {new Date(latestMeasurement.measurement_date).toLocaleDateString('it-IT')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              getHarvestRecommendation(latestMeasurement.brix).urgency
            }`}>
              {getHarvestRecommendation(latestMeasurement.brix).text}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="text-purple-600" size={16} />
                <span className="text-xs text-gray-600">Brix (Zuccheri)</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{latestMeasurement.brix}°Bx</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-blue-600" size={16} />
                <span className="text-xs text-gray-600">pH</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {latestMeasurement.ph ? latestMeasurement.ph.toFixed(2) : '-'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-xs text-gray-600">Acidità Totale</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {latestMeasurement.total_acidity ? `${latestMeasurement.total_acidity.toFixed(1)} g/L` : '-'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Grape className="text-orange-600" size={16} />
                <span className="text-xs text-gray-600">Alcol Stimato</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {latestMeasurement.estimated_alcohol?.toFixed(1)}%
              </p>
            </div>
          </div>

          {latestMeasurement.tasting_notes && (
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Note Degustazione</p>
              <p className="text-sm text-gray-700">{latestMeasurement.tasting_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!latestMeasurement && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Grape size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessuna misurazione disponibile</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a monitorare la maturazione dell'uva</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={18} />
            Prima Misurazione
          </button>
        </div>
      )}

      {/* Reference Values */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">📊 Valori di Riferimento per Vino</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900 mb-1">Brix (Zuccheri)</p>
            <p className="text-blue-700">• &lt;18°Bx: Troppo presto</p>
            <p className="text-blue-700">• 18-20°Bx: Ancora acerbo</p>
            <p className="text-green-700 font-medium">• 20-24°Bx: ✅ Ottimale</p>
            <p className="text-blue-700">• 24-26°Bx: Vendemmia presto</p>
            <p className="text-blue-700">• &gt;26°Bx: Sovramaturazione</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-1">pH</p>
            <p className="text-green-700 font-medium">• 3.0-3.6: ✅ Ottimale</p>
            <p className="text-blue-700">• &lt;3.0: Troppo acido</p>
            <p className="text-blue-700">• &gt;3.6: Poco acido</p>
          </div>
          <div>
            <p className="font-medium text-blue-900 mb-1">Acidità Totale</p>
            <p className="text-green-700 font-medium">• 5-8 g/L: ✅ Ottimale</p>
            <p className="text-blue-700">• &lt;5 g/L: Bassa</p>
            <p className="text-blue-700">• &gt;8 g/L: Alta</p>
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
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-purple-700">{measurement.brix}</span>
                    <span className="text-xs text-gray-600">°Bx</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(measurement.measurement_date).toLocaleDateString('it-IT')}
                    </p>
                    <p className="text-xs text-gray-600">
                      pH: {measurement.ph?.toFixed(2) || '-'} | 
                      Acidità: {measurement.total_acidity?.toFixed(1) || '-'} g/L | 
                      Alcol: {measurement.estimated_alcohol?.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  getHarvestRecommendation(measurement.brix).urgency
                }`}>
                  {measurement.brix >= 20 && measurement.brix < 24 ? 'Ottimale' :
                   measurement.brix < 20 ? 'Acerbo' : 'Maturo'}
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
                    Brix (°Bx) * <span className="text-xs text-gray-500">(Zuccheri)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.1"
                    value={newData.brix || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, brix: parseFloat(e.target.value) }))}
                    placeholder="es. 22.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {newData.brix && newData.brix > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Alcol stimato: {calculateEstimatedAlcohol(newData.brix).toFixed(1)}%
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    pH <span className="text-xs text-gray-500">(opzionale)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="14"
                    step="0.01"
                    value={newData.ph || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, ph: parseFloat(e.target.value) }))}
                    placeholder="es. 3.4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acidità Totale (g/L) <span className="text-xs text-gray-500">(opzionale)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newData.totalAcidity || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, totalAcidity: parseFloat(e.target.value) }))}
                    placeholder="es. 6.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Acino (g) <span className="text-xs text-gray-500">(opzionale)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newData.berryWeight || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, berryWeight: parseFloat(e.target.value) }))}
                    placeholder="es. 2.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note Degustazione <span className="text-xs text-gray-500">(opzionale)</span>
                </label>
                <textarea
                  value={newData.tastingNotes || ''}
                  onChange={(e) => setNewData(prev => ({ ...prev, tastingNotes: e.target.value }))}
                  rows={3}
                  placeholder="Colore, sapore, consistenza..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {newData.brix && newData.brix > 0 && (
                <div className={`rounded-lg border-2 p-4 ${
                  newData.brix >= 20 && newData.brix < 24
                    ? 'bg-green-50 border-green-200'
                    : newData.brix < 20
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className="text-sm font-semibold mb-1">
                    {getHarvestRecommendation(newData.brix).text}
                  </p>
                  <p className="text-xs text-gray-600">
                    Alcol stimato: {calculateEstimatedAlcohol(newData.brix).toFixed(1)}% vol
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewData({
                      measurementDate: new Date(),
                      brix: 0,
                      ph: 0,
                      totalAcidity: 0
                    })
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newData.brix || newData.brix <= 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
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
