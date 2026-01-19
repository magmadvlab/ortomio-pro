'use client'

import React, { useState } from 'react'
import { Calculator, Info, TrendingUp, AlertCircle } from 'lucide-react'

interface RavazIndexCalculatorProps {
  vineyardId: string
  vineyardName?: string
}

export default function RavazIndexCalculator({ vineyardId, vineyardName }: RavazIndexCalculatorProps) {
  const [pruningWeight, setPruningWeight] = useState<string>('')
  const [grapeYield, setGrapeYield] = useState<string>('')
  const [ravazIndex, setRavazIndex] = useState<number | null>(null)
  const [recommendation, setRecommendation] = useState<string>('')

  const calculateRavazIndex = () => {
    const pruning = parseFloat(pruningWeight)
    const yield_ = parseFloat(grapeYield)

    if (isNaN(pruning) || isNaN(yield_) || pruning === 0) {
      return
    }

    const index = yield_ / pruning
    setRavazIndex(index)

    // Interpretazione Indice di Ravaz
    if (index < 3) {
      setRecommendation('Carico gemme INSUFFICIENTE - Aumentare il numero di gemme in potatura per incrementare la produzione')
    } else if (index >= 3 && index <= 7) {
      setRecommendation('Carico gemme OTTIMALE - Equilibrio perfetto tra produzione e vigore vegetativo')
    } else if (index > 7 && index <= 10) {
      setRecommendation('Carico gemme ECCESSIVO - Ridurre leggermente il numero di gemme per migliorare la qualità')
    } else {
      setRecommendation('Carico gemme MOLTO ECCESSIVO - Riduzione drastica necessaria per evitare stress alla pianta')
    }
  }

  const getIndexColor = (index: number) => {
    if (index < 3) return 'text-yellow-600'
    if (index >= 3 && index <= 7) return 'text-green-600'
    if (index > 7 && index <= 10) return 'text-orange-600'
    return 'text-red-600'
  }

  const getIndexBgColor = (index: number) => {
    if (index < 3) return 'bg-yellow-50 border-yellow-200'
    if (index >= 3 && index <= 7) return 'bg-green-50 border-green-200'
    if (index > 7 && index <= 10) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="text-purple-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calcolo Indice di Ravaz</h2>
            <p className="text-gray-600">Ottimizza il carico gemme per equilibrio produzione-qualità</p>
          </div>
        </div>

        {vineyardName && (
          <div className="text-sm text-purple-700 bg-purple-100 px-3 py-2 rounded-lg inline-block">
            Vigneto: {vineyardName}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Cos'è l'Indice di Ravaz?</p>
            <p className="mb-2">
              L'Indice di Ravaz è il rapporto tra il peso dell'uva prodotta e il peso del legno di potatura. 
              Indica l'equilibrio tra produzione e vigore vegetativo della vite.
            </p>
            <p className="font-medium">Formula: Indice di Ravaz = Peso Uva (kg) / Peso Legno Potatura (kg)</p>
          </div>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inserisci i Dati</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso Legno di Potatura (kg/pianta)
            </label>
            <input
              type="number"
              step="0.1"
              value={pruningWeight}
              onChange={(e) => setPruningWeight(e.target.value)}
              placeholder="es. 0.8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Peso medio del legno rimosso per pianta</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produzione Uva (kg/pianta)
            </label>
            <input
              type="number"
              step="0.1"
              value={grapeYield}
              onChange={(e) => setGrapeYield(e.target.value)}
              placeholder="es. 4.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Produzione media di uva per pianta</p>
          </div>
        </div>

        <button
          onClick={calculateRavazIndex}
          disabled={!pruningWeight || !grapeYield}
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Calculator size={20} />
          Calcola Indice di Ravaz
        </button>
      </div>

      {/* Results */}
      {ravazIndex !== null && (
        <div className={`rounded-xl border p-6 ${getIndexBgColor(ravazIndex)}`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className={getIndexColor(ravazIndex)} size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Risultato</h3>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Indice di Ravaz</div>
            <div className={`text-4xl font-bold ${getIndexColor(ravazIndex)}`}>
              {ravazIndex.toFixed(2)}
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${
            ravazIndex >= 3 && ravazIndex <= 7 
              ? 'bg-green-100 border-green-300' 
              : 'bg-yellow-100 border-yellow-300'
          }`}>
            <div className="flex items-start gap-2">
              <AlertCircle className={ravazIndex >= 3 && ravazIndex <= 7 ? 'text-green-600' : 'text-yellow-600'} size={20} />
              <div>
                <p className="font-semibold text-gray-900 mb-1">Raccomandazione</p>
                <p className="text-sm text-gray-800">{recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tabella di Riferimento</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Indice di Ravaz</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Interpretazione</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Azione</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-yellow-600">&lt; 3</td>
                <td className="py-3 px-4">Carico insufficiente</td>
                <td className="py-3 px-4 text-sm text-gray-600">Aumentare numero gemme</td>
              </tr>
              <tr className="border-b border-gray-100 bg-green-50">
                <td className="py-3 px-4 font-medium text-green-600">3 - 7</td>
                <td className="py-3 px-4">Equilibrio ottimale</td>
                <td className="py-3 px-4 text-sm text-gray-600">Mantenere carico attuale</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium text-orange-600">7 - 10</td>
                <td className="py-3 px-4">Carico eccessivo</td>
                <td className="py-3 px-4 text-sm text-gray-600">Ridurre leggermente gemme</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-red-600">&gt; 10</td>
                <td className="py-3 px-4">Carico molto eccessivo</td>
                <td className="py-3 px-4 text-sm text-gray-600">Riduzione drastica necessaria</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">💡 Consigli Pratici</h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Misura il peso del legno di potatura subito dopo la potatura invernale</li>
          <li>• Pesa l'uva al momento della vendemmia per ogni pianta campione</li>
          <li>• Ripeti la misurazione su almeno 10-15 piante rappresentative</li>
          <li>• L'indice ottimale può variare leggermente in base alla varietà e al sistema di allevamento</li>
          <li>• Monitora l'indice per 2-3 anni per identificare il trend</li>
        </ul>
      </div>
    </div>
  )
}
