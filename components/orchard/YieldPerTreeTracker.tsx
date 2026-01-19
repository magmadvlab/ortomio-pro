'use client'

import React, { useState } from 'react'
import { Target, Calendar, TrendingUp, Plus, BarChart3 } from 'lucide-react'

interface YieldPerTreeTrackerProps {
  orchardId: string
  orchardName?: string
}

interface TreeYield {
  id: string
  treeNumber: string
  variety: string
  year: number
  yieldKg: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  notes: string
}

export default function YieldPerTreeTracker({ orchardId, orchardName }: YieldPerTreeTrackerProps) {
  const [yields, setYields] = useState<TreeYield[]>([
    {
      id: '1',
      treeNumber: 'A-12',
      variety: 'Melo Golden Delicious',
      year: 2025,
      yieldKg: 45,
      quality: 'excellent',
      notes: 'Ottima produzione'
    },
    {
      id: '2',
      treeNumber: 'A-13',
      variety: 'Melo Golden Delicious',
      year: 2025,
      yieldKg: 38,
      quality: 'good',
      notes: 'Buona produzione'
    },
    {
      id: '3',
      treeNumber: 'B-05',
      variety: 'Pero Conference',
      year: 2025,
      yieldKg: 52,
      quality: 'excellent',
      notes: 'Produzione eccezionale'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [newYield, setNewYield] = useState({
    treeNumber: '',
    variety: '',
    yieldKg: '',
    quality: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    notes: ''
  })

  const addYield = () => {
    if (!newYield.treeNumber || !newYield.variety || !newYield.yieldKg) return

    const yieldRecord: TreeYield = {
      id: Date.now().toString(),
      treeNumber: newYield.treeNumber,
      variety: newYield.variety,
      year: new Date().getFullYear(),
      yieldKg: parseFloat(newYield.yieldKg),
      quality: newYield.quality,
      notes: newYield.notes
    }

    setYields([...yields, yieldRecord])
    setNewYield({ treeNumber: '', variety: '', yieldKg: '', quality: 'good', notes: '' })
    setShowForm(false)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return { color: 'text-green-600', bg: 'bg-green-50', label: 'Eccellente' }
      case 'good': return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Buona' }
      case 'fair': return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Discreta' }
      case 'poor': return { color: 'text-red-600', bg: 'bg-red-50', label: 'Scarsa' }
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', label: 'N/D' }
    }
  }

  // Calculate statistics
  const currentYear = new Date().getFullYear()
  const currentYearYields = yields.filter(y => y.year === currentYear)
  const avgYield = currentYearYields.length > 0
    ? currentYearYields.reduce((sum, y) => sum + y.yieldKg, 0) / currentYearYields.length
    : 0
  const totalYield = currentYearYields.reduce((sum, y) => sum + y.yieldKg, 0)
  const topPerformer = currentYearYields.length > 0
    ? currentYearYields.reduce((max, y) => y.yieldKg > max.yieldKg ? y : max, currentYearYields[0])
    : null

  // Group by variety
  const yieldsByVariety = currentYearYields.reduce((acc, y) => {
    if (!acc[y.variety]) {
      acc[y.variety] = []
    }
    acc[y.variety].push(y)
    return acc
  }, {} as Record<string, TreeYield[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="text-green-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tracciamento Resa per Pianta</h2>
              <p className="text-gray-600">Monitora la produttività individuale di ogni albero</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Registrazione
          </button>
        </div>

        {orchardName && (
          <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg inline-block">
            Frutteto: {orchardName}
          </div>
        )}
      </div>

      {/* Statistics Overview */}
      {currentYearYields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Resa Media</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {avgYield.toFixed(1)} kg
            </div>
            <div className="text-xs text-gray-500 mt-1">per pianta</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Produzione Totale</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {totalYield.toFixed(0)} kg
            </div>
            <div className="text-xs text-gray-500 mt-1">{currentYear}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-600" size={16} />
              <span className="text-sm font-medium text-gray-700">Piante Monitorate</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {currentYearYields.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">quest'anno</div>
          </div>

          {topPerformer && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-medium text-gray-700">Top Performer</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {topPerformer.treeNumber}
              </div>
              <div className="text-xs text-gray-500 mt-1">{topPerformer.yieldKg} kg</div>
            </div>
          )}
        </div>
      )}

      {/* Add Yield Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registra Resa Pianta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero/Codice Pianta
              </label>
              <input
                type="text"
                value={newYield.treeNumber}
                onChange={(e) => setNewYield({ ...newYield, treeNumber: e.target.value })}
                placeholder="es. A-15, Fila 3-12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varietà
              </label>
              <input
                type="text"
                value={newYield.variety}
                onChange={(e) => setNewYield({ ...newYield, variety: e.target.value })}
                placeholder="es. Melo Golden Delicious"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resa (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={newYield.yieldKg}
                onChange={(e) => setNewYield({ ...newYield, yieldKg: e.target.value })}
                placeholder="es. 42.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualità Frutti
              </label>
              <select
                value={newYield.quality}
                onChange={(e) => setNewYield({ ...newYield, quality: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="excellent">Eccellente</option>
                <option value="good">Buona</option>
                <option value="fair">Discreta</option>
                <option value="poor">Scarsa</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={newYield.notes}
              onChange={(e) => setNewYield({ ...newYield, notes: e.target.value })}
              placeholder="Osservazioni sulla produzione..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addYield}
              disabled={!newYield.treeNumber || !newYield.variety || !newYield.yieldKg}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
            >
              Salva Registrazione
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Yields by Variety */}
      {Object.keys(yieldsByVariety).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rese per Varietà ({currentYear})</h3>
          
          <div className="space-y-6">
            {Object.entries(yieldsByVariety).map(([variety, varietyYields]) => {
              const varietyAvg = varietyYields.reduce((sum, y) => sum + y.yieldKg, 0) / varietyYields.length
              const varietyTotal = varietyYields.reduce((sum, y) => sum + y.yieldKg, 0)
              
              return (
                <div key={variety} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{variety}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Media: <span className="font-semibold text-gray-900">{varietyAvg.toFixed(1)} kg</span>
                      </span>
                      <span className="text-gray-600">
                        Totale: <span className="font-semibold text-gray-900">{varietyTotal.toFixed(0)} kg</span>
                      </span>
                      <span className="text-gray-600">
                        Piante: <span className="font-semibold text-gray-900">{varietyYields.length}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {varietyYields.map((yieldRecord) => {
                      const qualityInfo = getQualityColor(yieldRecord.quality)
                      return (
                        <div key={yieldRecord.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{yieldRecord.treeNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${qualityInfo.color} ${qualityInfo.bg}`}>
                              {qualityInfo.label}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {yieldRecord.yieldKg} kg
                          </div>
                          {yieldRecord.notes && (
                            <p className="text-xs text-gray-600 mt-2">{yieldRecord.notes}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Yields Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tutte le Registrazioni</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Pianta</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Varietà</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Anno</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Resa (kg)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Qualità</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Note</th>
              </tr>
            </thead>
            <tbody>
              {yields.slice().reverse().map((yieldRecord) => {
                const qualityInfo = getQualityColor(yieldRecord.quality)
                return (
                  <tr key={yieldRecord.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{yieldRecord.treeNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{yieldRecord.variety}</td>
                    <td className="py-3 px-4 text-gray-700">{yieldRecord.year}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">{yieldRecord.yieldKg} kg</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${qualityInfo.color} ${qualityInfo.bg}`}>
                        {qualityInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{yieldRecord.notes || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Consigli per il Tracciamento</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Assegna un codice univoco a ogni pianta (es. Fila-Posizione: A-12)</li>
          <li>• Pesa i frutti subito dopo la raccolta per ogni pianta</li>
          <li>• Registra anche la qualità per identificare le piante migliori</li>
          <li>• Monitora le stesse piante per più anni per identificare trend</li>
          <li>• Usa i dati per decisioni di potatura e diradamento</li>
          <li>• Le piante con resa costantemente bassa potrebbero necessitare interventi</li>
        </ul>
      </div>
    </div>
  )
}
