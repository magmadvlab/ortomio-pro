'use client'

import React, { useState } from 'react'
import { Droplets, Calendar, TrendingUp, AlertCircle, Plus } from 'lucide-react'

interface GrapeMaturityTrackerProps {
  vineyardId: string
  vineyardName?: string
}

interface MaturityReading {
  id: string
  date: Date
  brix: number
  ph: number
  acidity: number
  notes: string
}

export default function GrapeMaturityTracker({ vineyardId, vineyardName }: GrapeMaturityTrackerProps) {
  const [readings, setReadings] = useState<MaturityReading[]>([
    {
      id: '1',
      date: new Date('2026-09-01'),
      brix: 18.5,
      ph: 3.2,
      acidity: 8.5,
      notes: 'Inizio invaiatura'
    },
    {
      id: '2',
      date: new Date('2026-09-15'),
      brix: 21.2,
      ph: 3.3,
      acidity: 7.2,
      notes: 'Maturazione in corso'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [newReading, setNewReading] = useState({
    brix: '',
    ph: '',
    acidity: '',
    notes: ''
  })

  const addReading = () => {
    if (!newReading.brix || !newReading.ph || !newReading.acidity) return

    const reading: MaturityReading = {
      id: Date.now().toString(),
      date: new Date(),
      brix: parseFloat(newReading.brix),
      ph: parseFloat(newReading.ph),
      acidity: parseFloat(newReading.acidity),
      notes: newReading.notes
    }

    setReadings([...readings, reading])
    setNewReading({ brix: '', ph: '', acidity: '', notes: '' })
    setShowForm(false)
  }

  const getMaturityStatus = (brix: number) => {
    if (brix < 18) return { status: 'Immaturo', color: 'text-red-600', bg: 'bg-red-50' }
    if (brix >= 18 && brix < 22) return { status: 'In Maturazione', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (brix >= 22 && brix < 25) return { status: 'Maturo', color: 'text-green-600', bg: 'bg-green-50' }
    return { status: 'Sovramaturo', color: 'text-orange-600', bg: 'bg-orange-50' }
  }

  const latestReading = readings[readings.length - 1]
  const maturityStatus = latestReading ? getMaturityStatus(latestReading.brix) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets className="text-purple-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monitoraggio Maturazione Uva</h2>
              <p className="text-gray-600">Traccia zuccheri, acidità e pH per la vendemmia ottimale</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Lettura
          </button>
        </div>

        {vineyardName && (
          <div className="text-sm text-purple-700 bg-purple-100 px-3 py-2 rounded-lg inline-block">
            Vigneto: {vineyardName}
          </div>
        )}
      </div>

      {/* Current Status */}
      {latestReading && maturityStatus && (
        <div className={`rounded-xl border p-6 ${maturityStatus.bg} border-${maturityStatus.color.replace('text-', '')}-200`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={maturityStatus.color} size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Stato Attuale Maturazione</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Grado Brix</div>
              <div className={`text-3xl font-bold ${maturityStatus.color}`}>
                {latestReading.brix}°
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">pH</div>
              <div className="text-3xl font-bold text-gray-900">
                {latestReading.ph}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Acidità (g/L)</div>
              <div className="text-3xl font-bold text-gray-900">
                {latestReading.acidity}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Stato</div>
              <div className={`text-xl font-bold ${maturityStatus.color}`}>
                {maturityStatus.status}
              </div>
            </div>
          </div>

          {latestReading.notes && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">{latestReading.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Add Reading Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuova Lettura Maturazione</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grado Brix (°Bx)
              </label>
              <input
                type="number"
                step="0.1"
                value={newReading.brix}
                onChange={(e) => setNewReading({ ...newReading, brix: e.target.value })}
                placeholder="es. 22.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                pH
              </label>
              <input
                type="number"
                step="0.1"
                value={newReading.ph}
                onChange={(e) => setNewReading({ ...newReading, ph: e.target.value })}
                placeholder="es. 3.3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acidità Totale (g/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={newReading.acidity}
                onChange={(e) => setNewReading({ ...newReading, acidity: e.target.value })}
                placeholder="es. 7.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note
            </label>
            <textarea
              value={newReading.notes}
              onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
              placeholder="Osservazioni sulla maturazione..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addReading}
              disabled={!newReading.brix || !newReading.ph || !newReading.acidity}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
            >
              Salva Lettura
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

      {/* Readings History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storico Letture</h3>
        
        <div className="space-y-3">
          {readings.slice().reverse().map((reading) => {
            const status = getMaturityStatus(reading.brix)
            return (
              <div key={reading.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-sm font-medium text-gray-900">
                      {reading.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                    {status.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-600">Brix:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.brix}°</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">pH:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.ph}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Acidità:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.acidity} g/L</span>
                  </div>
                </div>

                {reading.notes && (
                  <p className="text-sm text-gray-600 mt-2">{reading.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Reference Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guida Valori di Riferimento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Grado Brix</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-600">&lt; 18°</span>
                <span className="text-gray-600">Immaturo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">18-22°</span>
                <span className="text-gray-600">In maturazione</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">22-25°</span>
                <span className="text-gray-600">Maturo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">&gt; 25°</span>
                <span className="text-gray-600">Sovramaturo</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">pH</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-900">2.8-3.0</span>
                <span className="text-gray-600">Molto acido</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">3.0-3.4</span>
                <span className="text-gray-600">Ottimale</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">3.4-3.8</span>
                <span className="text-gray-600">Poco acido</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">&gt; 3.8</span>
                <span className="text-gray-600">Troppo basso</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Acidità Totale</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-900">&gt; 10 g/L</span>
                <span className="text-gray-600">Molto alta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">6-9 g/L</span>
                <span className="text-gray-600">Ottimale</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">4-6 g/L</span>
                <span className="text-gray-600">Bassa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900">&lt; 4 g/L</span>
                <span className="text-gray-600">Molto bassa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">💡 Consigli per il Monitoraggio</p>
            <ul className="space-y-1">
              <li>• Effettua le misurazioni sempre alla stessa ora del giorno</li>
              <li>• Campiona almeno 100 acini da diverse parti del vigneto</li>
              <li>• Inizia le misurazioni 3-4 settimane prima della vendemmia prevista</li>
              <li>• Ripeti le misurazioni ogni 3-5 giorni durante la maturazione</li>
              <li>• Considera anche il colore degli acini e la facilità di distacco</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
