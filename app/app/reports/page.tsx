'use client'

import React, { useState } from 'react'
import { 
  FileText, Download, Calendar, TrendingUp, Award, 
  Leaf, Droplets, Bug, Scissors, DollarSign, BarChart3,
  CheckCircle, AlertTriangle, Camera, MapPin
} from 'lucide-react'

export default function PlantReportsPage() {
  const [selectedReport, setSelectedReport] = useState<'summary' | 'detailed' | 'comparison'>('summary')
  const [selectedCrop, setSelectedCrop] = useState('pomodoro')

  // DATI MOCK REALISTICI
  const mockData = {
    pomodoro: {
      name: 'Pomodoro San Marzano',
      variety: 'San Marzano DOP',
      location: 'Zona Nord - Filare 3',
      plantingDate: '15/01/2026',
      harvestDate: '15/03/2026',
      duration: 60,
      
      // OPERAZIONI
      operations: [
        {
          date: '10/01/2026',
          type: 'Lavorazione',
          title: 'Fresatura Terreno',
          details: 'Motozappa, 30m², 60min, €30',
          icon: Scissors,
          color: 'blue'
        },
        {
          date: '15/01/2026',
          type: 'Trapianto',
          title: 'Trapianto 10 Piantine',
          details: 'Distanza 50cm, da semenzaio',
          icon: Leaf,
          color: 'green'
        },
        {
          date: '21/01/2026',
          type: 'Fertilizzazione',
          title: 'Nitrato di Calcio',
          details: '1.08kg via fertirrigazione, 30m²',
          icon: Droplets,
          color: 'purple'
        },
        {
          date: '21/01/2026',
          type: 'Irrigazione',
          title: 'Irrigazione a Goccia',
          details: '150L, 45min, con fertirrigazione',
          icon: Droplets,
          color: 'blue'
        },
        {
          date: '28/01/2026',
          type: 'Problema',
          title: 'Afidi Rilevati',
          details: 'Afidi neri su foglie giovani',
          icon: Bug,
          color: 'red'
        },
        {
          date: '29/01/2026',
          type: 'Trattamento',
          title: 'Sapone Molle',
          details: '200ml spray fogliare contro afidi',
          icon: Bug,
          color: 'orange'
        },
        {
          date: '15/03/2026',
          type: 'Raccolta',
          title: 'Primo Raccolto',
          details: '18.5kg, qualità 4.5/5, brix 6.2',
          icon: Award,
          color: 'yellow'
        }
      ],
      
      // RISULTATI
      results: {
        totalYield: 18.5,
        yieldPerPlant: 1.85,
        quality: 4.5,
        brix: 6.2,
        defects: 5,
        marketValue: 240
      },
      
      // COSTI
      costs: {
        preparation: 30,
        plants: 20,
        fertilizers: 15,
        treatments: 10,
        irrigation: 10,
        total: 85
      },
      
      // ROI
      roi: {
        revenue: 240,
        costs: 85,
        profit: 155,
        percentage: 182
      },
      
      // PROBLEMI
      issues: [
        {
          date: '28/01/2026',
          problem: 'Afidi neri',
          severity: 'Media',
          solution: 'Sapone molle',
          resolved: true,
          daysToResolve: 1
        }
      ],
      
      // FOTO
      photos: 5,
      
      // METEO MEDIO
      weather: {
        avgTemp: 16,
        totalRain: 45,
        sunnyDays: 42
      }
    },
    lattuga: {
      name: 'Lattuga Romana',
      variety: 'Romana Verde',
      location: 'Zona Sud - Aiuola B',
      plantingDate: '05/01/2026',
      harvestDate: '05/03/2026',
      duration: 60,
      operations: [
        { date: '03/01/2026', type: 'Lavorazione', title: 'Vangatura', details: '20m², manuale', icon: Scissors, color: 'blue' },
        { date: '05/01/2026', type: 'Semina', title: 'Semina Diretta', details: '100 semi, file 30cm', icon: Leaf, color: 'green' },
        { date: '10/01/2026', type: 'Osservazione', title: 'Germinazione', details: '85% germinazione', icon: CheckCircle, color: 'green' },
        { date: '05/03/2026', type: 'Raccolta', title: 'Raccolta Scalare', details: '12kg, qualità 4/5', icon: Award, color: 'yellow' }
      ],
      results: { totalYield: 12, yieldPerPlant: 0.12, quality: 4, brix: 0, defects: 8, marketValue: 96 },
      costs: { preparation: 15, plants: 5, fertilizers: 8, treatments: 5, irrigation: 7, total: 40 },
      roi: { revenue: 96, costs: 40, profit: 56, percentage: 140 },
      issues: [],
      photos: 3,
      weather: { avgTemp: 14, totalRain: 35, sunnyDays: 45 }
    }
  }

  const currentData = mockData[selectedCrop as keyof typeof mockData]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Report Storico Piante</h1>
              <p className="text-green-100">Analisi completa delle colture con dati reali</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
              <Download size={18} />
              Esporta PDF
            </button>
          </div>
          
          {/* Selettore Coltura */}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedCrop('pomodoro')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCrop === 'pomodoro'
                  ? 'bg-white text-green-600 font-medium'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              🍅 Pomodoro San Marzano
            </button>
            <button
              onClick={() => setSelectedCrop('lattuga')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCrop === 'lattuga'
                  ? 'bg-white text-green-600 font-medium'
                  : 'bg-green-500 text-white hover:bg-green-400'
              }`}
            >
              🥬 Lattuga Romana
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 bg-white rounded-lg p-2 border border-gray-200">
          {[
            { id: 'summary', label: 'Riepilogo', icon: FileText },
            { id: 'detailed', label: 'Dettagliato', icon: BarChart3 },
            { id: 'comparison', label: 'Confronto', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedReport === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* RIEPILOGO */}
        {selectedReport === 'summary' && (
          <div className="space-y-6">
            
            {/* INFO COLTURA */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Informazioni Coltura</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Coltura</div>
                  <div className="font-semibold text-gray-900">{currentData.name}</div>
                  <div className="text-sm text-gray-500">{currentData.variety}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Posizione</div>
                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                    <MapPin size={14} className="text-green-600" />
                    {currentData.location}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Periodo</div>
                  <div className="font-semibold text-gray-900">{currentData.plantingDate}</div>
                  <div className="text-sm text-gray-500">→ {currentData.harvestDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Durata Ciclo</div>
                  <div className="font-semibold text-gray-900">{currentData.duration} giorni</div>
                  <div className="text-sm text-gray-500">{(currentData.duration / 7).toFixed(1)} settimane</div>
                </div>
              </div>
            </div>

            {/* KPI PRINCIPALI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Award className="text-green-600" size={24} />
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    Resa
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {currentData.results.totalYield} kg
                </div>
                <div className="text-sm text-gray-600">
                  {currentData.results.yieldPerPlant} kg/pianta
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-yellow-600" size={24} />
                  <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    Qualità
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {currentData.results.quality}/5 ⭐
                </div>
                <div className="text-sm text-gray-600">
                  {currentData.results.brix > 0 ? `Brix ${currentData.results.brix}°` : 'Eccellente'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-blue-600" size={24} />
                  <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                    Ricavi
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  €{currentData.results.marketValue}
                </div>
                <div className="text-sm text-gray-600">
                  €{(currentData.results.marketValue / currentData.results.totalYield).toFixed(1)}/kg
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="text-purple-600" size={24} />
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                    ROI
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  +{currentData.roi.percentage}%
                </div>
                <div className="text-sm text-gray-600">
                  Profitto €{currentData.roi.profit}
                </div>
              </div>
            </div>

            {/* TIMELINE OPERAZIONI */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Timeline Operazioni</h2>
              <div className="space-y-3">
                {currentData.operations.map((op, idx) => {
                  const Icon = op.icon
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 p-4 rounded-lg border-l-4 bg-${op.color}-50 border-${op.color}-500`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${op.color}-100 flex items-center justify-center`}>
                        <Icon className={`text-${op.color}-600`} size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{op.title}</h3>
                          <span className="text-sm text-gray-500">{op.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{op.details}</p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-${op.color}-100 text-${op.color}-700`}>
                          {op.type}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ANALISI COSTI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Analisi Costi</h2>
                <div className="space-y-3">
                  {Object.entries(currentData.costs).map(([key, value]) => {
                    if (key === 'total') return null
                    const labels: Record<string, string> = {
                      preparation: 'Preparazione Terreno',
                      plants: 'Piantine/Semi',
                      fertilizers: 'Fertilizzanti',
                      treatments: 'Trattamenti',
                      irrigation: 'Irrigazione'
                    }
                    const percentage = ((value / currentData.costs.total) * 100).toFixed(0)
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{labels[key]}</span>
                          <span className="font-semibold text-gray-900">€{value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Totale Costi</span>
                      <span className="text-xl font-bold text-gray-900">€{currentData.costs.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Riepilogo Economico</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Ricavi Totali</span>
                    <span className="text-xl font-bold text-blue-600">€{currentData.roi.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Costi Totali</span>
                    <span className="text-xl font-bold text-red-600">€{currentData.roi.costs}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-semibold text-gray-900">Profitto Netto</span>
                    <span className="text-2xl font-bold text-green-600">€{currentData.roi.profit}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <span className="font-semibold text-gray-900">ROI</span>
                    <span className="text-2xl font-bold text-purple-600">+{currentData.roi.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PROBLEMI E SOLUZIONI */}
            {currentData.issues.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🐛 Problemi e Soluzioni</h2>
                <div className="space-y-3">
                  {currentData.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <AlertTriangle className="text-orange-600 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{issue.problem}</h3>
                          <span className="text-sm text-gray-500">{issue.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Gravità:</span>
                            <span className="ml-2 font-medium text-orange-600">{issue.severity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Soluzione:</span>
                            <span className="ml-2 font-medium text-gray-900">{issue.solution}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Risolto in:</span>
                            <span className="ml-2 font-medium text-green-600">{issue.daysToResolve} giorno</span>
                          </div>
                        </div>
                        {issue.resolved && (
                          <div className="mt-2 flex items-center gap-2 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Problema Risolto</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATISTICHE AGGIUNTIVE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="text-blue-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Documentazione</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.photos}</div>
                <div className="text-sm text-gray-600">Foto Timeline</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="text-purple-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Operazioni</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.operations.length}</div>
                <div className="text-sm text-gray-600">Registrazioni Totali</div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-green-600" size={24} />
                  <h3 className="font-semibold text-gray-900">Meteo Medio</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{currentData.weather.avgTemp}°C</div>
                <div className="text-sm text-gray-600">{currentData.weather.sunnyDays} giorni sole</div>
              </div>
            </div>

          </div>
        )}

        {/* DETTAGLIATO */}
        {selectedReport === 'detailed' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BarChart3 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Dettagliato</h3>
            <p className="text-gray-600 mb-4">
              Analisi approfondita con grafici, trend e correlazioni
            </p>
            <p className="text-sm text-gray-500">
              Questa sezione mostrerà grafici dettagliati di crescita, consumo risorse, e analytics avanzate
            </p>
          </div>
        )}

        {/* CONFRONTO */}
        {selectedReport === 'comparison' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Confronto Cicli</h3>
            <p className="text-gray-600 mb-4">
              Confronta questo ciclo con cicli precedenti della stessa coltura
            </p>
            <p className="text-sm text-gray-500">
              Questa sezione mostrerà differenze di resa, qualità, costi e ROI tra cicli diversi
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
