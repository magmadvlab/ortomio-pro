'use client'

import React, { useState } from 'react'
import { Bug, Calendar, AlertTriangle, TrendingUp, Plus } from 'lucide-react'

interface OliveFlyMonitorProps {
  oliveGroveId: string
  oliveGroveName?: string
}

interface TrapReading {
  id: string
  date: Date
  trapNumber: number
  fliesCount: number
  temperature: number
  notes: string
}

export default function OliveFlyMonitor({ oliveGroveId, oliveGroveName }: OliveFlyMonitorProps) {
  const [readings, setReadings] = useState<TrapReading[]>([
    {
      id: '1',
      date: new Date('2026-06-15'),
      trapNumber: 1,
      fliesCount: 3,
      temperature: 24,
      notes: 'Prima cattura stagionale'
    },
    {
      id: '2',
      date: new Date('2026-07-01'),
      trapNumber: 1,
      fliesCount: 12,
      temperature: 28,
      notes: 'Aumento popolazione'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [newReading, setNewReading] = useState({
    trapNumber: '1',
    fliesCount: '',
    temperature: '',
    notes: ''
  })

  const addReading = () => {
    if (!newReading.fliesCount || !newReading.temperature) return

    const reading: TrapReading = {
      id: Date.now().toString(),
      date: new Date(),
      trapNumber: parseInt(newReading.trapNumber),
      fliesCount: parseInt(newReading.fliesCount),
      temperature: parseFloat(newReading.temperature),
      notes: newReading.notes
    }

    setReadings([...readings, reading])
    setNewReading({ trapNumber: '1', fliesCount: '', temperature: '', notes: '' })
    setShowForm(false)
  }

  const getRiskLevel = (fliesCount: number) => {
    if (fliesCount === 0) return { level: 'Assente', color: 'text-green-600', bg: 'bg-green-50', action: 'Nessun trattamento' }
    if (fliesCount <= 5) return { level: 'Basso', color: 'text-blue-600', bg: 'bg-blue-50', action: 'Monitoraggio' }
    if (fliesCount <= 15) return { level: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-50', action: 'Preparare trattamento' }
    if (fliesCount <= 30) return { level: 'Alto', color: 'text-orange-600', bg: 'bg-orange-50', action: 'Trattamento consigliato' }
    return { level: 'Critico', color: 'text-red-600', bg: 'bg-red-50', action: 'Trattamento urgente' }
  }

  const latestReading = readings[readings.length - 1]
  const riskLevel = latestReading ? getRiskLevel(latestReading.fliesCount) : null

  // Calculate average flies per week
  const recentReadings = readings.slice(-4)
  const avgFlies = recentReadings.length > 0 
    ? recentReadings.reduce((sum, r) => sum + r.fliesCount, 0) / recentReadings.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bug className="text-red-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monitoraggio Mosca Olearia</h2>
              <p className="text-gray-600">Tracciamento Bactrocera oleae per trattamenti mirati</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Lettura
          </button>
        </div>

        {oliveGroveName && (
          <div className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg inline-block">
            Oliveto: {oliveGroveName}
          </div>
        )}
      </div>

      {/* Current Status */}
      {latestReading && riskLevel && (
        <div className={`rounded-xl border p-6 ${riskLevel.bg} border-${riskLevel.color.replace('text-', '')}-200`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className={riskLevel.color} size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Livello di Rischio Attuale</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Catture Ultima Trappola</div>
              <div className={`text-4xl font-bold ${riskLevel.color}`}>
                {latestReading.fliesCount}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Livello Rischio</div>
              <div className={`text-2xl font-bold ${riskLevel.color}`}>
                {riskLevel.level}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Media Settimanale</div>
              <div className="text-2xl font-bold text-gray-900">
                {avgFlies.toFixed(1)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Azione Raccomandata</div>
              <div className="text-lg font-semibold text-gray-900">
                {riskLevel.action}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuova Lettura Trappola</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero Trappola
              </label>
              <input
                type="number"
                value={newReading.trapNumber}
                onChange={(e) => setNewReading({ ...newReading, trapNumber: e.target.value })}
                placeholder="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numero Mosche Catturate
              </label>
              <input
                type="number"
                value={newReading.fliesCount}
                onChange={(e) => setNewReading({ ...newReading, fliesCount: e.target.value })}
                placeholder="es. 8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={newReading.temperature}
                onChange={(e) => setNewReading({ ...newReading, temperature: e.target.value })}
                placeholder="es. 26.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
              placeholder="Osservazioni sulla popolazione..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addReading}
              disabled={!newReading.fliesCount || !newReading.temperature}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storico Catture</h3>
        
        <div className="space-y-3">
          {readings.slice().reverse().map((reading) => {
            const risk = getRiskLevel(reading.fliesCount)
            return (
              <div key={reading.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={16} />
                    <span className="text-sm font-medium text-gray-900">
                      {reading.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${risk.color} ${risk.bg}`}>
                    {risk.level}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-600">Trappola:</span>
                    <span className="ml-2 font-semibold text-gray-900">#{reading.trapNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Catture:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.fliesCount}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Temp:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.temperature}°C</span>
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

      {/* Risk Level Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Soglie di Intervento</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Catture/Trappola</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Livello Rischio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Azione</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-green-50">
                <td className="py-3 px-4 font-medium text-green-600">0</td>
                <td className="py-3 px-4">Assente</td>
                <td className="py-3 px-4 text-sm text-gray-600">Nessun trattamento necessario</td>
              </tr>
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-3 px-4 font-medium text-blue-600">1-5</td>
                <td className="py-3 px-4">Basso</td>
                <td className="py-3 px-4 text-sm text-gray-600">Continuare monitoraggio</td>
              </tr>
              <tr className="border-b border-gray-100 bg-yellow-50">
                <td className="py-3 px-4 font-medium text-yellow-600">6-15</td>
                <td className="py-3 px-4">Medio</td>
                <td className="py-3 px-4 text-sm text-gray-600">Preparare trattamento preventivo</td>
              </tr>
              <tr className="border-b border-gray-100 bg-orange-50">
                <td className="py-3 px-4 font-medium text-orange-600">16-30</td>
                <td className="py-3 px-4">Alto</td>
                <td className="py-3 px-4 text-sm text-gray-600">Trattamento consigliato</td>
              </tr>
              <tr className="bg-red-50">
                <td className="py-3 px-4 font-medium text-red-600">&gt; 30</td>
                <td className="py-3 px-4">Critico</td>
                <td className="py-3 px-4 text-sm text-gray-600">Trattamento urgente necessario</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Treatment Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Opzioni di Trattamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">🌿 Metodi Biologici</h4>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Trappole cromotropiche gialle</li>
              <li>• Trappole a feromoni</li>
              <li>• Spinosad (ammesso in biologico)</li>
              <li>• Caolino (argilla bianca)</li>
            </ul>
          </div>

          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="font-semibold text-blue-900 mb-2">⚗️ Metodi Convenzionali</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Dimetoato (dove permesso)</li>
              <li>• Fosmet</li>
              <li>• Lambda-cialotrina</li>
              <li>• Deltametrina</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">💡 Consigli per il Monitoraggio</h4>
        <ul className="space-y-2 text-sm text-red-800">
          <li>• Installa 1 trappola ogni 1-2 ettari di oliveto</li>
          <li>• Posiziona le trappole a 1.5-2m di altezza sul lato sud delle piante</li>
          <li>• Controlla le trappole settimanalmente da giugno a ottobre</li>
          <li>• Sostituisci le trappole ogni 4-6 settimane</li>
          <li>• Il periodo critico è luglio-settembre con temperature 20-30°C</li>
          <li>• Intervieni quando le catture superano 5-10 mosche/trappola/settimana</li>
        </ul>
      </div>
    </div>
  )
}
