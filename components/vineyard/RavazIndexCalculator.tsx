'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, TrendingUp, TrendingDown, Minus, Plus, Calendar, Scale, Grape, Info } from 'lucide-react'
import { BudLoadData, RavazIndexCalculation } from '@/types/vineyard'
import { vineyardBudLoadService } from '@/services/vineyardBudLoadService'

interface RavazIndexCalculatorProps {
  vineyardId: string
  vineyardName?: string
}

export default function RavazIndexCalculator({ vineyardId, vineyardName }: RavazIndexCalculatorProps) {
  const [history, setHistory] = useState<BudLoadData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [calculation, setCalculation] = useState<RavazIndexCalculation | null>(null)
  
  const [newData, setNewData] = useState<Partial<BudLoadData>>({
    season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    pruningDate: new Date(),
    pruningWoodWeight: 0,
    grapeYield: 0,
    budsPerVine: 0
  })

  useEffect(() => {
    loadHistory()
  }, [vineyardId])

  const loadHistory = async () => {
    const data = await vineyardBudLoadService.getBudLoadHistory(vineyardId)
    setHistory(data)
  }

  const handleCalculate = () => {
    if (newData.grapeYield && newData.pruningWoodWeight) {
      const calc = vineyardBudLoadService.calculateRavazIndex(
        newData.grapeYield,
        newData.pruningWoodWeight
      )
      setCalculation(calc)
    }
  }

  const handleSave = async () => {
    if (!newData.pruningWoodWeight || !newData.grapeYield) {
      alert('Inserisci peso legno potatura e resa uva')
      return
    }

    try {
      await vineyardBudLoadService.recordBudLoad({
        vineyardId,
        season: newData.season!,
        pruningDate: newData.pruningDate!,
        pruningWoodWeight: newData.pruningWoodWeight,
        harvestDate: newData.harvestDate,
        grapeYield: newData.grapeYield,
        budsPerVine: newData.budsPerVine,
        notes: newData.notes
      })

      await loadHistory()
      setShowAddModal(false)
      setCalculation(null)
      setNewData({
        season: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        pruningDate: new Date(),
        pruningWoodWeight: 0,
        grapeYield: 0,
        budsPerVine: 0
      })
    } catch (error) {
      console.error('Error saving bud load:', error)
      alert('Errore nel salvataggio')
    }
  }

  const getColorClasses = (interpretation: RavazIndexCalculation['interpretation']) => {
    switch (interpretation) {
      case 'optimal':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          badge: 'bg-green-100 text-green-800'
        }
      case 'under-production':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-100 text-orange-800'
        }
      case 'over-production':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          badge: 'bg-yellow-100 text-yellow-800'
        }
      case 'severe-over-production':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-800'
        }
    }
  }

  const latestData = history[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calculator className="text-purple-600" size={20} />
            Calcolo Carico Gemme (Indice di Ravaz)
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
          Nuova Stagione
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Cos'è l'Indice di Ravaz?</p>
            <p className="mb-2">
              L'Indice di Ravaz misura l'equilibrio vegeto-produttivo della vite:
            </p>
            <div className="space-y-1 ml-4">
              <p>• <strong>Formula:</strong> Resa Uva (kg) / Peso Legno Potatura (kg)</p>
              <p>• <strong>&lt; 5:</strong> Sotto-produzione (troppa vigoria)</p>
              <p>• <strong>5-10:</strong> ✅ Equilibrio ottimale</p>
              <p>• <strong>&gt; 10:</strong> Sovra-produzione (stress vite, qualità scarsa)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Result */}
      {latestData && latestData.ravazIndex && (
        <div className={`rounded-xl border-2 p-6 ${
          latestData.ravazIndex >= 5 && latestData.ravazIndex <= 10
            ? 'bg-green-50 border-green-200'
            : latestData.ravazIndex < 5
            ? 'bg-orange-50 border-orange-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Indice di Ravaz Attuale</p>
              <p className="text-5xl font-bold text-gray-900">{latestData.ravazIndex.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Stagione {latestData.season}</p>
            </div>
            <div className="text-right">
              {latestData.ravazIndex >= 5 && latestData.ravazIndex <= 10 ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✅ Ottimale
                </span>
              ) : latestData.ravazIndex < 5 ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  ⬇️ Sotto-produzione
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  ⬆️ Sovra-produzione
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Grape className="text-purple-600" size={16} />
                <span className="text-xs text-gray-600">Resa Uva</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{latestData.grapeYield} kg</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="text-orange-600" size={16} />
                <span className="text-xs text-gray-600">Peso Legno</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{latestData.pruningWoodWeight} kg</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">💡 Raccomandazione</p>
            <p className="text-sm text-gray-700">
              {latestData.ravazIndex >= 5 && latestData.ravazIndex <= 10
                ? 'Equilibrio ottimale vegeto-produttivo! Mantenere carico gemme attuale.'
                : latestData.ravazIndex < 5
                ? `Sotto-produzione. Aumentare carico gemme del ${latestData.ravazIndex < 3 ? '20-30%' : '10-15%'}. Ridurre vigoria con potatura meno severa.`
                : `Sovra-produzione. Ridurre carico gemme del ${latestData.ravazIndex > 15 ? '20-30%' : '10-15%'}. Rischio qualità compromessa.`}
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!latestData && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Calculator size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-2">Nessun dato disponibile</p>
          <p className="text-sm text-gray-500 mb-4">Inizia a tracciare il carico gemme del tuo vigneto</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus size={18} />
            Prima Misurazione
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Storico Stagioni</h4>
          <div className="space-y-3">
            {history.map((data) => {
              const isOptimal = data.ravazIndex && data.ravazIndex >= 5 && data.ravazIndex <= 10
              const isUnder = data.ravazIndex && data.ravazIndex < 5
              
              return (
                <div key={data.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
                      isOptimal ? 'bg-green-100' : isUnder ? 'bg-orange-100' : 'bg-yellow-100'
                    }`}>
                      <span className={`text-xl font-bold ${
                        isOptimal ? 'text-green-700' : isUnder ? 'text-orange-700' : 'text-yellow-700'
                      }`}>
                        {data.ravazIndex?.toFixed(1) || '-'}
                      </span>
                      <span className="text-xs text-gray-600">Ravaz</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Stagione {data.season}</p>
                      <p className="text-xs text-gray-600">
                        {data.grapeYield}kg uva / {data.pruningWoodWeight}kg legno
                      </p>
                      {data.budsPerVine && (
                        <p className="text-xs text-gray-500">{data.budsPerVine} gemme/vite</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {isOptimal ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Ottimale</span>
                    ) : isUnder ? (
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Sotto</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Sovra</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Nuova Misurazione Carico Gemme</h3>

            <div className="space-y-4">
              {/* Season */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stagione
                </label>
                <input
                  type="text"
                  value={newData.season}
                  onChange={(e) => setNewData(prev => ({ ...prev, season: e.target.value }))}
                  placeholder="es. 2025-2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Pruning Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Potatura
                  </label>
                  <input
                    type="date"
                    value={newData.pruningDate?.toISOString().split('T')[0]}
                    onChange={(e) => setNewData(prev => ({ ...prev, pruningDate: new Date(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Legno Potatura (kg) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newData.pruningWoodWeight || ''}
                    onChange={(e) => {
                      setNewData(prev => ({ ...prev, pruningWoodWeight: parseFloat(e.target.value) }))
                      setCalculation(null)
                    }}
                    placeholder="es. 1.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Harvest Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Vendemmia
                  </label>
                  <input
                    type="date"
                    value={newData.harvestDate?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setNewData(prev => ({ ...prev, harvestDate: new Date(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resa Uva (kg) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newData.grapeYield || ''}
                    onChange={(e) => {
                      setNewData(prev => ({ ...prev, grapeYield: parseFloat(e.target.value) }))
                      setCalculation(null)
                    }}
                    placeholder="es. 12.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Buds Per Vine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemme per Vite (opzionale)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newData.budsPerVine || ''}
                  onChange={(e) => setNewData(prev => ({ ...prev, budsPerVine: parseInt(e.target.value) }))}
                  placeholder="es. 12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={newData.notes || ''}
                  onChange={(e) => setNewData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  placeholder="Osservazioni..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={!newData.pruningWoodWeight || !newData.grapeYield}
                className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 font-medium"
              >
                <Calculator className="inline mr-2" size={16} />
                Calcola Indice di Ravaz
              </button>

              {/* Calculation Result */}
              {calculation && (
                <div className={`rounded-lg border-2 p-4 ${getColorClasses(calculation.interpretation).bg} ${getColorClasses(calculation.interpretation).border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Indice di Ravaz</p>
                      <p className={`text-3xl font-bold ${getColorClasses(calculation.interpretation).text}`}>
                        {calculation.icon} {calculation.ravazIndex.toFixed(2)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(calculation.interpretation).badge}`}>
                      {calculation.interpretation === 'optimal' ? 'Ottimale' :
                       calculation.interpretation === 'under-production' ? 'Sotto-produzione' :
                       calculation.interpretation === 'over-production' ? 'Sovra-produzione' :
                       'Sovra-produzione Severa'}
                    </span>
                  </div>
                  <div className={`bg-white rounded p-3 ${getColorClasses(calculation.interpretation).text}`}>
                    <p className="text-sm font-medium mb-1">Raccomandazione:</p>
                    <p className="text-sm">{calculation.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setCalculation(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSave}
                  disabled={!newData.pruningWoodWeight || !newData.grapeYield}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Salva Dati
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
