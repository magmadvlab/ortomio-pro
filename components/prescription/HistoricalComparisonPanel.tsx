/**
 * Historical Comparison Panel
 * Pannello per confronto storico mappe prescrizione e analisi trend
 */

import React, { useState } from 'react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  PrescriptionMap,
  HistoricalComparisonRequest,
  HistoricalComparisonResult
} from '../../types/prescriptionMaps';
import { createHistoricalComparisonService } from '../../services/historicalComparisonService';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  X,
  Download,
  RefreshCw
} from 'lucide-react';

interface HistoricalComparisonPanelProps {
  gardenId: string;
  availableMaps: PrescriptionMap[];
  onClose: () => void;
}

const HistoricalComparisonPanel: React.FC<HistoricalComparisonPanelProps> = ({
  gardenId,
  availableMaps,
  onClose
}) => {
  const { storageProvider } = useStorage();
  const comparisonService = createHistoricalComparisonService(storageProvider);
  
  // State
  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
  const [comparisonType, setComparisonType] = useState<'temporal' | 'seasonal' | 'treatment_response' | 'yield_correlation'>('temporal');
  const [timeRange, setTimeRange] = useState({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [analysisMetrics, setAnalysisMetrics] = useState<string[]>(['application_rate', 'yield', 'cost']);
  
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<HistoricalComparisonResult | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'zones' | 'seasonal' | 'insights'>('trends');

  const comparisonTypeOptions: Array<{
    value: HistoricalComparisonRequest['comparisonType']
    label: string
    desc: string
  }> = [
    { value: 'temporal', label: 'Trend Temporali', desc: 'Analisi evoluzione nel tempo' },
    { value: 'seasonal', label: 'Pattern Stagionali', desc: 'Confronto per stagioni' },
    { value: 'treatment_response', label: 'Risposta Trattamenti', desc: 'Efficacia trattamenti' },
    { value: 'yield_correlation', label: 'Correlazione Resa', desc: 'Relazione dose-resa' }
  ]

  const resultTabs: Array<{
    key: 'trends' | 'zones' | 'seasonal' | 'insights'
    label: string
    icon: typeof TrendingUp
  }> = [
    { key: 'trends', label: 'Trend Temporali', icon: TrendingUp },
    { key: 'zones', label: 'Evoluzione Zone', icon: Target },
    { key: 'seasonal', label: 'Pattern Stagionali', icon: Calendar },
    { key: 'insights', label: 'Insights', icon: Zap }
  ]

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'application_rate':
        return 'Dose Media'
      case 'yield':
        return 'Resa / Outcome'
      case 'cost':
        return 'Risparmio Economico'
      case 'quality':
        return 'Qualita Post-Intervento'
      case 'environmental':
        return 'Riduzione Input'
      default:
        return metric
    }
  }

  const handleRunComparison = async () => {
    if (selectedMaps.length < 2) {
      alert('Seleziona almeno 2 mappe per il confronto');
      return;
    }

    try {
      setLoading(true);
      
      const request: HistoricalComparisonRequest = {
        gardenId,
        mapIds: selectedMaps,
        comparisonType,
        timeRange,
        analysisMetrics
      };
      
      const result = await comparisonService.performHistoricalComparison(request);
      setComparisonResult(result);
      
    } catch (error) {
      console.error('Error running comparison:', error);
      alert('Errore durante il confronto storico');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="text-green-600" size={20} />;
      case 'decreasing': return <TrendingDown className="text-red-600" size={20} />;
      case 'stable': return <BarChart3 className="text-blue-600" size={20} />;
      case 'cyclical': return <RefreshCw className="text-purple-600" size={20} />;
      default: return <BarChart3 className="text-gray-600" size={20} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-100';
      case 'decreasing': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      case 'cyclical': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={24} />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Confronto Storico</h2>
              <p className="text-sm text-gray-600">Analisi trend e performance nel tempo</p>
            </div>
          </div>
          
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Configuration */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Map Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Selezione Mappe</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableMaps.map((map) => (
                    <label
                      key={map.id}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMaps.includes(map.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMaps(prev => [...prev, map.id]);
                          } else {
                            setSelectedMaps(prev => prev.filter(id => id !== map.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{map.name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(map.generationDate).toLocaleDateString()} • {map.totalZones} zone
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selezionate: {selectedMaps.length} mappe
                </p>
              </div>

              {/* Comparison Type */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Tipo Confronto</h4>
                <div className="space-y-2">
                  {comparisonTypeOptions.map((type) => (
                    <label key={type.value} className="flex items-start p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="comparisonType"
                        value={type.value}
                        checked={comparisonType === type.value}
                        onChange={() => setComparisonType(type.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Periodo Analisi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Inizio
                    </label>
                    <input
                      type="date"
                      value={timeRange.startDate}
                      onChange={(e) => setTimeRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Fine
                    </label>
                    <input
                      type="date"
                      value={timeRange.endDate}
                      onChange={(e) => setTimeRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Analysis Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Metriche Analisi</h4>
                <div className="space-y-2">
                  {[
                    { value: 'application_rate', label: 'Dose Applicazione' },
                    { value: 'yield', label: 'Resa' },
                    { value: 'cost', label: 'Costi' },
                    { value: 'quality', label: 'Qualità' },
                    { value: 'environmental', label: 'Impatto Ambientale' }
                  ].map((metric) => (
                    <label key={metric.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={analysisMetrics.includes(metric.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAnalysisMetrics(prev => [...prev, metric.value]);
                          } else {
                            setAnalysisMetrics(prev => prev.filter(m => m !== metric.value));
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">{metric.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Run Analysis Button */}
              <button
                onClick={handleRunComparison}
                disabled={loading || selectedMaps.length < 2}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analisi in corso...
                  </>
                ) : (
                  <>
                    <BarChart3 size={20} />
                    Avvia Confronto
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 overflow-y-auto">
            {comparisonResult ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="text-sm text-amber-800">Benchmark Qualità</div>
                    <div className="text-2xl font-bold text-amber-900 mt-1">
                      {comparisonResult.quality.adaptiveBenchmarkScore
                        ? `${comparisonResult.quality.adaptiveBenchmarkScore.toFixed(0)}%`
                        : 'n/d'}
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      Soglia allerta {comparisonResult.quality.adaptiveAlertFloorScore
                        ? `${comparisonResult.quality.adaptiveAlertFloorScore.toFixed(0)}%`
                        : 'n/d'}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Stato Storico vs Benchmark</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {comparisonResult.quality.benchmarkStatus === 'above_target'
                        ? 'Sopra target'
                        : comparisonResult.quality.benchmarkStatus === 'watch'
                          ? 'Da consolidare'
                          : comparisonResult.quality.benchmarkStatus === 'below_target'
                            ? 'Sotto soglia'
                            : 'n/d'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Gap medio {comparisonResult.quality.averageBenchmarkGap?.toFixed(1) ?? '0.0'} punti
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Benchmark Brix</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {comparisonResult.quality.brixTarget
                        ? `${comparisonResult.quality.brixTarget.toFixed(1)}°`
                        : 'n/d'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Confidence dataset {comparisonResult.quality.confidenceScore.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {comparisonResult.quality.notes && comparisonResult.quality.notes.length > 0 && (
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Memoria Sito-Specifica</h4>
                    <p className="text-sm text-blue-800">
                      {comparisonResult.quality.notes.join(' ')}
                    </p>
                  </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {resultTabs.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'trends' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Trend Temporali</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
                      {comparisonResult.temporalTrends.map((trend, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getTrendIcon(trend.trend)}
                              <span className="font-medium text-gray-900">{getMetricLabel(trend.metric)}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(trend.trend)}`}>
                              {trend.trend}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Variazione:</span>
                              <span className={`font-medium ${trend.changeRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.changeRate >= 0 ? '+' : ''}{trend.changeRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidenza:</span>
                              <span className="font-medium text-gray-900">{(trend.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Punti dati:</span>
                              <span className="font-medium text-gray-900">{trend.dataPoints.length}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'zones' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Evoluzione Zone</h3>
                    
                    <div className="space-y-4">
                      {comparisonResult.zoneEvolution.map((zone, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">{zone.zoneName}</h4>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                Performance: {zone.performanceScore}%
                              </span>
                              <div className={`w-3 h-3 rounded-full ${
                                zone.performanceScore >= 80 ? 'bg-green-500' :
                                zone.performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Applicazioni</div>
                              <div className="font-bold text-gray-900">{zone.evolution.length}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Dose Media</div>
                              <div className="font-bold text-gray-900">
                                {(zone.evolution.reduce((sum, e) => sum + e.applicationRate, 0) / zone.evolution.length).toFixed(1)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Qualità Media</div>
                              <div className="font-bold text-gray-900">
                                {(zone.evolution.reduce((sum, e) => sum + e.dataQuality, 0) / zone.evolution.length).toFixed(0)}%
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Outcome</div>
                              <div className="font-bold text-gray-900">
                                {zone.evolution.filter(e => e.actualOutcome).length > 0 ? 'Disponibile' : 'N/A'}
                              </div>
                            </div>
                          </div>
                          
                          {zone.recommendations.length > 0 && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="font-medium text-blue-900 mb-2">Raccomandazioni:</h5>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {zone.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <span className="text-blue-500 mt-1">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'seasonal' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Pattern Stagionali</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4">
                      {comparisonResult.seasonalPatterns.map((pattern, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center mb-3">
                            <h4 className="font-medium text-gray-900 capitalize">{pattern.season}</h4>
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div>
                              <div className="text-gray-600">Dose Media</div>
                              <div className="font-bold text-gray-900">
                                {pattern.averageApplicationRate.toFixed(1)}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-gray-600">Variabilità</div>
                              <div className="font-bold text-gray-900">
                                {pattern.variability.toFixed(1)}%
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-gray-600">Efficacia</div>
                              <div className={`font-bold ${
                                pattern.effectiveness >= 80 ? 'text-green-600' :
                                pattern.effectiveness >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {pattern.effectiveness.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          
                          {pattern.recommendations.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">Raccomandazioni:</div>
                              <ul className="text-xs text-gray-700 space-y-1">
                                {pattern.recommendations.slice(0, 2).map((rec, idx) => (
                                  <li key={idx}>• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Insights e Raccomandazioni</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Key Findings */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle className="text-blue-600" size={20} />
                          <h4 className="font-medium text-blue-900">Risultati Chiave</h4>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-2">
                          {comparisonResult.insights.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-blue-500 mt-1">•</span>
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Target className="text-green-600" size={20} />
                          <h4 className="font-medium text-green-900">Raccomandazioni</h4>
                        </div>
                        <ul className="text-sm text-green-700 space-y-2">
                          {comparisonResult.insights.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-green-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risk Factors */}
                      {comparisonResult.insights.riskFactors.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="text-yellow-full max-w-sm" size={20} />
                            <h4 className="font-medium text-yellow-full max-w-sm">Fattori di Rischio</h4>
                          </div>
                          <ul className="text-sm text-yellow-full max-w-sm space-y-2">
                            {comparisonResult.insights.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="text-yellow-full max-w-sm mt-1">⚠</span>
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Opportunities */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="text-purple-600" size={20} />
                          <h4 className="font-medium text-purple-900">Opportunità</h4>
                        </div>
                        <ul className="text-sm text-purple-700 space-y-2">
                          {comparisonResult.insights.opportunities.map((opp, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-purple-500 mt-1">•</span>
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Next Actions */}
                    {comparisonResult.insights.nextActions.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="text-gray-600" size={20} />
                          <h4 className="font-medium text-gray-900">Prossime Azioni</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3">
                          {comparisonResult.insights.nextActions.map((action, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="text-sm text-gray-700">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Export Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // TODO: Implement export functionality
                      alert('Export report - funzionalità in sviluppo');
                    }}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Download size={16} />
                    Esporta Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confronto Storico
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Seleziona le mappe e configura l'analisi per iniziare
                  </p>
                  <p className="text-sm text-gray-500">
                    Il confronto storico ti aiuterà a identificare trend,<br />
                    ottimizzare le strategie e migliorare le performance
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalComparisonPanel;
