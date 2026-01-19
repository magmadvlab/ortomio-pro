'use client'

import React, { useState } from 'react'
import { CircleDot, Calendar, TrendingUp, AlertCircle, Plus } from 'lucide-react'

interface OliveMaturityTrackerProps {
  oliveGroveId: string
  oliveGroveName?: string
}

interface MaturityReading {
  id: string
  date: Date
  jaenIndex: number
  colorStage: number
  notes: string
}

export default function OliveMaturityTracker({ oliveGroveId, oliveGroveName }: OliveMaturityTrackerProps) {
  const [readings, setReadings] = useState<MaturityReading[]>([
    {
      id: '1',
      date: new Date('2026-10-01'),
      jaenIndex: 1.5,
      colorStage: 2,
      notes: 'Inizio invaiatura'
    },
    {
      id: '2',
      date: new Date('2026-10-15'),
      jaenIndex: 3.2,
      colorStage: 4,
      notes: 'Maturazione avanzata'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [newReading, setNewReading] = useState({
    jaenIndex: '',
    colorStage: '0',
    notes: ''
  })

  const addReading = () => {
    if (!newReading.jaenIndex || !newReading.colorStage) return

    const reading: MaturityReading = {
      id: Date.now().toString(),
      date: new Date(),
      jaenIndex: parseFloat(newReading.jaenIndex),
      colorStage: parseInt(newReading.colorStage),
      notes: newReading.notes
    }

    setReadings([...readings, reading])
    setNewReading({ jaenIndex: '', colorStage: '0', notes: '' })
    setShowForm(false)
  }

  const getMaturityStatus = (jaenIndex: number) => {
    if (jaenIndex < 1) return { status: 'Verde', color: 'text-green-600', bg: 'bg-green-50', harvest: 'Troppo presto' }
    if (jaenIndex >= 1 && jaenIndex < 2.5) return { status: 'Invaiatura', color: 'text-yellow-600', bg: 'bg-yellow-50', harvest: 'Olio verde fruttato' }
    if (jaenIndex >= 2.5 && jaenIndex < 3.5) return { status: 'Ottimale', color: 'text-purple-600', bg: 'bg-purple-50', harvest: 'Momento ideale' }
    return { status: 'Sovramatura', color: 'text-orange-600', bg: 'bg-orange-50', harvest: 'Raccolta urgente' }
  }

  const colorStages = [
    { value: 0, label: 'Verde intenso', color: 'bg-green-700' },
    { value: 1, label: 'Verde giallastro', color: 'bg-green-500' },
    { value: 2, label: 'Verde con macchie rosse', color: 'bg-yellow-500' },
    { value: 3, label: 'Rosso-violaceo', color: 'bg-red-500' },
    { value: 4, label: 'Nero con polpa bianca', color: 'bg-purple-700' },
    { value: 5, label: 'Nero con polpa viola', color: 'bg-purple-900' },
    { value: 6, label: 'Nero con polpa viola scura', color: 'bg-gray-900' },
    { value: 7, label: 'Completamente nero', color: 'bg-black' }
  ]

  const latestReading = readings[readings.length - 1]
  const maturityStatus = latestReading ? getMaturityStatus(latestReading.jaenIndex) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CircleDot className="text-green-600" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monitoraggio Maturazione Olive</h2>
              <p className="text-gray-600">Indice di Jaén per determinare il momento ottimale di raccolta</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            Nuova Lettura
          </button>
        </div>

        {oliveGroveName && (
          <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg inline-block">
            Oliveto: {oliveGroveName}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Cos'è l'Indice di Jaén?</p>
            <p className="mb-2">
              L'Indice di Jaén valuta la maturazione delle olive basandosi sul colore della buccia e della polpa. 
              È il metodo più affidabile per determinare il momento ottimale di raccolta.
            </p>
            <p className="font-medium">
              Si calcola campionando 100 olive e classificandole in 8 categorie di colore (0-7), 
              poi si applica la formula: Σ(n × categoria) / 100
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {latestReading && maturityStatus && (
        <div className={`rounded-xl border p-6 ${maturityStatus.bg} border-${maturityStatus.color.replace('text-', '')}-200`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={maturityStatus.color} size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Stato Attuale Maturazione</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Indice di Jaén</div>
              <div className={`text-4xl font-bold ${maturityStatus.color}`}>
                {latestReading.jaenIndex.toFixed(1)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Stato Maturazione</div>
              <div className={`text-2xl font-bold ${maturityStatus.color}`}>
                {maturityStatus.status}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Raccomandazione</div>
              <div className="text-lg font-semibold text-gray-900">
                {maturityStatus.harvest}
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
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indice di Jaén Calcolato
            </label>
            <input
              type="number"
              step="0.1"
              value={newReading.jaenIndex}
              onChange={(e) => setNewReading({ ...newReading, jaenIndex: e.target.value })}
              placeholder="es. 2.8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Campiona 100 olive e calcola: Σ(n × categoria) / 100
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stadio Colore Prevalente
            </label>
            <select
              value={newReading.colorStage}
              onChange={(e) => setNewReading({ ...newReading, colorStage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {colorStages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.value} - {stage.label}
                </option>
              ))}
            </select>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={addReading}
              disabled={!newReading.jaenIndex}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
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

      {/* Color Scale Reference */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scala Colori Indice di Jaén</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {colorStages.map((stage) => (
            <div key={stage.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <div className={`w-12 h-12 rounded-full ${stage.color} flex-shrink-0`}></div>
              <div>
                <div className="font-semibold text-gray-900">Categoria {stage.value}</div>
                <div className="text-sm text-gray-600">{stage.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Readings History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storico Letture</h3>
        
        <div className="space-y-3">
          {readings.slice().reverse().map((reading) => {
            const status = getMaturityStatus(reading.jaenIndex)
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

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="text-xs text-gray-600">Indice di Jaén:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.jaenIndex.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Stadio colore:</span>
                    <span className="ml-2 font-semibold text-gray-900">{reading.colorStage}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guida Interpretazione Indice</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Indice di Jaén</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Stato</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo Olio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Azione</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-green-600">&lt; 1.0</td>
                <td className="py-3 px-4">Verde</td>
                <td className="py-3 px-4 text-sm text-gray-600">Troppo amaro</td>
                <td className="py-3 px-4 text-sm text-gray-600">Attendere</td>
              </tr>
              <tr className="border-b border-gray-100 bg-yellow-50">
                <td className="py-3 px-4 font-medium text-yellow-600">1.0 - 2.5</td>
                <td className="py-3 px-4">Invaiatura</td>
                <td className="py-3 px-4 text-sm text-gray-600">Olio verde fruttato</td>
                <td className="py-3 px-4 text-sm text-gray-600">Buono per olio premium</td>
              </tr>
              <tr className="border-b border-gray-100 bg-purple-50">
                <td className="py-3 px-4 font-medium text-purple-600">2.5 - 3.5</td>
                <td className="py-3 px-4">Ottimale</td>
                <td className="py-3 px-4 text-sm text-gray-600">Equilibrato</td>
                <td className="py-3 px-4 text-sm text-gray-600">Momento ideale raccolta</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-orange-600">&gt; 3.5</td>
                <td className="py-3 px-4">Sovramatura</td>
                <td className="py-3 px-4 text-sm text-gray-600">Olio dolce</td>
                <td className="py-3 px-4 text-sm text-gray-600">Raccolta urgente</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">💡 Consigli Pratici</h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• Campiona 100 olive da diverse parti dell'oliveto</li>
          <li>• Raccogli olive da altezze diverse della chioma</li>
          <li>• Ripeti il campionamento ogni 7-10 giorni</li>
          <li>• Per olio extravergine di alta qualità, raccogli con indice 1.5-2.5</li>
          <li>• Per olio più dolce e meno amaro, raccogli con indice 2.5-3.5</li>
          <li>• Considera anche le condizioni meteo previste</li>
        </ul>
      </div>
    </div>
  )
}
