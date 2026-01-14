/**
 * AI Transparency Panel
 * Mostra come l'AI è arrivata alle sue conclusioni
 */

import React, { useState } from 'react'
import {
  X,
  Brain,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Calculator,
  Eye,
  ChevronRight
} from 'lucide-react'
import type { AISuggestion, AITransparencyLog } from '@/types/aiFeedback'

interface AITransparencyPanelProps {
  suggestion: AISuggestion
  transparencyLog: AITransparencyLog
  onClose: () => void
}

export default function AITransparencyPanel({
  suggestion,
  transparencyLog,
  onClose
}: AITransparencyPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'calculations' | 'alternatives'>('overview')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trasparenza AI</h2>
                <p className="text-purple-100">Come l'AI è arrivata a questa conclusione</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-semibold mb-1">{suggestion.title}</h3>
            <p className="text-sm text-purple-100">{suggestion.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {[
              { id: 'overview', label: 'Panoramica', icon: Brain },
              { id: 'data', label: 'Dati Usati', icon: Database },
              { id: 'calculations', label: 'Calcoli', icon: Calculator },
              { id: 'alternatives', label: 'Alternative', icon: GitBranch }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="text-purple-600" size={20} />
                  Processo Decisionale
                </h3>
                
                {/* Decision Tree */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Albero Decisionale</h4>
                  <div className="space-y-2">
                    {transparencyLog.decision_tree.map((node, index) => (
                      <div key={index} className="flex items-start gap-3 pl-4 border-l-2 border-purple-300">
                        <ChevronRight size={16} className="text-purple-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{node.condition}</span>
                            <span className="text-xs text-gray-500">Peso: {(node.weight * 100).toFixed(0)}%</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{node.result}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rules Triggered */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Regole Attivate</h4>
                <div className="space-y-2">
                  {transparencyLog.rules_triggered.map((rule, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        rule.triggered ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rule.triggered ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <AlertCircle size={16} className="text-gray-400" />
                        )}
                        <span className="text-sm font-medium">{rule.rule}</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        Impatto: {rule.impact > 0 ? '+' : ''}{(rule.impact * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weights Applied */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pesi Applicati</h4>
                <div className="space-y-2">
                  {Object.entries(transparencyLog.weights_applied).map(([factor, weight]) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{factor}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${(weight as number) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {((weight as number) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Models Used */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Modelli AI Utilizzati</h4>
                <div className="flex flex-wrap gap-2">
                  {transparencyLog.models_used.map((model, index) => (
                    <div key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {model}
                      {transparencyLog.model_versions[index] && (
                        <span className="text-purple-600 ml-1">v{transparencyLog.model_versions[index]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Database className="text-blue-600" size={20} />
                  Dati di Input
                </h3>
                
                {/* Weather Data */}
                {transparencyLog.weather_data_used && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">☁️ Dati Meteo</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(transparencyLog.weather_data_used, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Soil Data */}
                {transparencyLog.soil_data_used && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">🌱 Dati Suolo</h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(transparencyLog.soil_data_used, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Plant Health Data */}
                {transparencyLog.plant_health_data_used && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">🌿 Dati Salute Piante</h4>
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(transparencyLog.plant_health_data_used, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Historical Data */}
                {transparencyLog.historical_data_used && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">📊 Dati Storici</h4>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(transparencyLog.historical_data_used, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* User Preferences */}
                {transparencyLog.user_preferences_used && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">👤 Preferenze Utente</h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(transparencyLog.user_preferences_used, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Calculations Tab */}
          {activeTab === 'calculations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="text-green-600" size={20} />
                  Calcoli Eseguiti
                </h3>
                
                <div className="space-y-4">
                  {transparencyLog.calculations.map((calc, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Step {index + 1}: {calc.step}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Completato
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Formula:</span>
                        <code className="block mt-1 bg-white p-2 rounded text-sm text-gray-800 font-mono">
                          {calc.formula}
                        </code>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Input:</span>
                        <div className="mt-1 bg-white p-2 rounded text-sm">
                          {Object.entries(calc.inputs).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1">
                              <span className="text-gray-600">{key}:</span>
                              <span className="text-gray-900 font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">Output:</span>
                        <div className="mt-1 bg-green-100 p-2 rounded text-sm font-medium text-green-900">
                          {String(calc.output)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Thresholds */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Soglie Utilizzate</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(transparencyLog.thresholds_used).map(([threshold, value]) => (
                      <div key={threshold} className="bg-blue-50 rounded-lg p-3">
                        <span className="text-sm text-gray-700">{threshold}</span>
                        <div className="text-lg font-bold text-blue-600 mt-1">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternatives Tab */}
          {activeTab === 'alternatives' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GitBranch className="text-orange-600" size={20} />
                  Alternative Valutate
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  L'AI ha considerato queste alternative prima di scegliere il suggerimento finale
                </p>
                
                <div className="space-y-4">
                  {transparencyLog.alternatives_evaluated.map((alt, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{alt.option}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Score:</span>
                          <div className="bg-white px-3 py-1 rounded-full">
                            <span className="text-sm font-bold text-gray-900">{alt.score.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">/100</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <span className="text-sm font-medium text-red-900">Perché non scelto:</span>
                        <p className="text-sm text-red-800 mt-1">{alt.reason_not_chosen}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Generato: {new Date(transparencyLog.logged_at).toLocaleString('it-IT')}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
