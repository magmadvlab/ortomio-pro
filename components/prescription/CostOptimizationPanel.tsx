/**
 * Cost Optimization Panel
 * Pannello per ottimizzazione avanzata costi precision farming
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  PrescriptionMap,
  CostOptimizationRequest,
  CostOptimizationResult,
  RealTimeOptimization
} from '../../types/prescriptionMaps';
import { createCostOptimizationService } from '../../services/costOptimizationService';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Leaf,
  Zap,
  Settings,
  Play,
  Pause,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  RefreshCw
} from 'lucide-react';

interface CostOptimizationPanelProps {
  prescriptionMap: PrescriptionMap;
  onClose: () => void;
  onOptimizationComplete?: (result: CostOptimizationResult) => void;
}

const CostOptimizationPanel: React.FC<CostOptimizationPanelProps> = ({
  prescriptionMap,
  onClose,
  onOptimizationComplete
}) => {
  const { storageProvider } = useStorage();
  const optimizationService = createCostOptimizationService(storageProvider);
  
  // State
  const [optimizationGoals, setOptimizationGoals] = useState({
    minimizeCost: 0.4,
    maximizeYield: 0.3,
    minimizeEnvironmentalImpact: 0.2,
    maximizeEfficiency: 0.1
  });
  
  const [constraints, setConstraints] = useState({
    maxBudget: undefined as number | undefined,
    minYieldTarget: undefined as number | undefined,
    maxEnvironmentalImpact: undefined as number | undefined,
    regulatoryLimits: {} as Record<string, number>
  });
  
  const [optimizationAlgorithm, setOptimizationAlgorithm] = useState<'genetic' | 'simulated_annealing' | 'particle_swarm' | 'gradient_descent'>('genetic');
  
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<CostOptimizationResult | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeOptimization | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'results' | 'implementation' | 'sensitivity'>('config');

  // Real-time optimization polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (optimizing && realTimeStatus) {
      interval = setInterval(async () => {
        try {
          const status = await optimizationService.getRealTimeOptimizationStatus(realTimeStatus.optimizationId);
          setRealTimeStatus(status);
          
          if (status.status === 'completed') {
            setOptimizing(false);
            // Load final results
            // In a real implementation, this would fetch the completed optimization result
          }
        } catch (error) {
          console.error('Error polling optimization status:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [optimizing, realTimeStatus]);

  const handleStartOptimization = async () => {
    try {
      setOptimizing(true);
      
      const request: CostOptimizationRequest = {
        prescriptionMapId: prescriptionMap.id,
        optimizationGoals,
        constraints,
        optimizationAlgorithm
      };
      
      // Start real-time optimization
      const optimizationId = await optimizationService.startRealTimeOptimization(request);
      
      setRealTimeStatus({
        optimizationId,
        status: 'running',
        progress: 0,
        currentBestSolution: {
          cost: prescriptionMap.costAnalysis?.totalInputCost || 0,
          yield: 4.0,
          environmental: prescriptionMap.costAnalysis?.environmentalScore || 0,
          efficiency: 75
        },
        iterationHistory: [],
        estimatedTimeRemaining: 300
      });
      
    } catch (error) {
      console.error('Error starting optimization:', error);
      alert('Errore durante l\'avvio dell\'ottimizzazione');
      setOptimizing(false);
    }
  };

  const handleRunFullOptimization = async () => {
    try {
      setOptimizing(true);
      
      const request: CostOptimizationRequest = {
        prescriptionMapId: prescriptionMap.id,
        optimizationGoals,
        constraints,
        optimizationAlgorithm
      };
      
      const result = await optimizationService.optimizeCosts(request);
      setOptimizationResult(result);
      
      if (onOptimizationComplete) {
        onOptimizationComplete(result);
      }
      
    } catch (error) {
      console.error('Error running optimization:', error);
      alert('Errore durante l\'ottimizzazione');
    } finally {
      setOptimizing(false);
    }
  };

  const normalizeGoals = () => {
    const total = Object.values(optimizationGoals).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      setOptimizationGoals(prev => ({
        minimizeCost: prev.minimizeCost / total,
        maximizeYield: prev.maximizeYield / total,
        minimizeEnvironmentalImpact: prev.minimizeEnvironmentalImpact / total,
        maximizeEfficiency: prev.maximizeEfficiency / total
      }));
    }
  };

  const getAlgorithmDescription = (algorithm: string) => {
    const descriptions = {
      genetic: 'Algoritmo genetico - Ottimo per problemi complessi multi-obiettivo',
      simulated_annealing: 'Simulated Annealing - Buon bilanciamento velocità/qualità',
      particle_swarm: 'Particle Swarm - Veloce convergenza per problemi continui',
      gradient_descent: 'Gradient Descent - Rapido ma può rimanere in minimi locali'
    };
    return descriptions[algorithm as keyof typeof descriptions] || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="text-green-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ottimizzazione Costi</h2>
              <p className="text-sm text-gray-600">{prescriptionMap.name}</p>
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
              {/* Optimization Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Obiettivi Ottimizzazione</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-green-600" size={16} />
                        <span className="text-sm font-medium text-gray-700">Minimizza Costi</span>
                      </div>
                      <span className="text-sm text-gray-600">{(optimizationGoals.minimizeCost * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={optimizationGoals.minimizeCost}
                      onChange={(e) => setOptimizationGoals(prev => ({ ...prev, minimizeCost: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-blue-600" size={16} />
                        <span className="text-sm font-medium text-gray-700">Massimizza Resa</span>
                      </div>
                      <span className="text-sm text-gray-600">{(optimizationGoals.maximizeYield * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={optimizationGoals.maximizeYield}
                      onChange={(e) => setOptimizationGoals(prev => ({ ...prev, maximizeYield: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="text-green-600" size={16} />
                        <span className="text-sm font-medium text-gray-700">Minimizza Impatto</span>
                      </div>
                      <span className="text-sm text-gray-600">{(optimizationGoals.minimizeEnvironmentalImpact * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={optimizationGoals.minimizeEnvironmentalImpact}
                      onChange={(e) => setOptimizationGoals(prev => ({ ...prev, minimizeEnvironmentalImpact: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="text-orange-600" size={16} />
                        <span className="text-sm font-medium text-gray-700">Massimizza Efficienza</span>
                      </div>
                      <span className="text-sm text-gray-600">{(optimizationGoals.maximizeEfficiency * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={optimizationGoals.maximizeEfficiency}
                      onChange={(e) => setOptimizationGoals(prev => ({ ...prev, maximizeEfficiency: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <button
                  onClick={normalizeGoals}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                  Normalizza pesi (totale 100%)
                </button>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vincoli</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Massimo (€)
                    </label>
                    <input
                      type="number"
                      value={constraints.maxBudget || ''}
                      onChange={(e) => setConstraints(prev => ({ 
                        ...prev, 
                        maxBudget: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="Nessun limite"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resa Minima (t/ha)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={constraints.minYieldTarget || ''}
                      onChange={(e) => setConstraints(prev => ({ 
                        ...prev, 
                        minYieldTarget: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="Nessun limite"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impatto Ambientale Max
                    </label>
                    <input
                      type="number"
                      value={constraints.maxEnvironmentalImpact || ''}
                      onChange={(e) => setConstraints(prev => ({ 
                        ...prev, 
                        maxEnvironmentalImpact: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      placeholder="Nessun limite"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Algorithm Selection */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Algoritmo Ottimizzazione</h4>
                
                <div className="space-y-2">
                  {(['genetic', 'simulated_annealing', 'particle_swarm', 'gradient_descent'] as const).map((algorithm) => (
                    <label key={algorithm} className="flex items-start p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="algorithm"
                        value={algorithm}
                        checked={optimizationAlgorithm === algorithm}
                        onChange={(e) => setOptimizationAlgorithm(e.target.value as any)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {algorithm.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getAlgorithmDescription(algorithm)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleStartOptimization}
                  disabled={optimizing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {optimizing ? (
                    <>
                      <Pause size={20} />
                      Ottimizzazione in corso...
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      Avvia Ottimizzazione Real-time
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleRunFullOptimization}
                  disabled={optimizing}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Target size={16} />
                  Ottimizzazione Completa
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="flex-1 overflow-y-auto">
            {/* Real-time Status */}
            {realTimeStatus && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="font-medium text-blue-900">Ottimizzazione in corso</span>
                  </div>
                  <span className="text-sm text-blue-700">
                    {realTimeStatus.progress}% completato
                  </span>
                </div>
                
                <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${realTimeStatus.progress}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-blue-600">Costo</div>
                    <div className="font-bold text-blue-900">€{realTimeStatus.currentBestSolution.cost}</div>
                  </div>
                  <div>
                    <div className="text-blue-600">Resa</div>
                    <div className="font-bold text-blue-900">{realTimeStatus.currentBestSolution.yield} t/ha</div>
                  </div>
                  <div>
                    <div className="text-blue-600">Ambientale</div>
                    <div className="font-bold text-blue-900">{realTimeStatus.currentBestSolution.environmental}</div>
                  </div>
                  <div>
                    <div className="text-blue-600">Efficienza</div>
                    <div className="font-bold text-blue-900">{realTimeStatus.currentBestSolution.efficiency}%</div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-blue-700">
                  Tempo rimanente stimato: {Math.floor(realTimeStatus.estimatedTimeRemaining / 60)}m {realTimeStatus.estimatedTimeRemaining % 60}s
                </div>
              </div>
            )}

            {optimizationResult ? (
              <div className="p-6">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { key: 'results', label: 'Risultati', icon: BarChart3 },
                      { key: 'implementation', label: 'Implementazione', icon: Settings },
                      { key: 'sensitivity', label: 'Sensibilità', icon: AlertTriangle }
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeTab === key
                            ? 'border-green-500 text-green-600'
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
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    {/* Comparison Summary */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Configurazione Originale</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Costo Totale:</span>
                            <span className="font-medium">€{optimizationResult.original.totalCost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Resa Attesa:</span>
                            <span className="font-medium">{optimizationResult.original.expectedYield} t/ha</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Score Ambientale:</span>
                            <span className="font-medium">{optimizationResult.original.environmentalScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Efficienza:</span>
                            <span className="font-medium">{optimizationResult.original.efficiencyScore}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-3">Configurazione Ottimizzata</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700">Costo Totale:</span>
                            <span className="font-bold text-green-800">€{optimizationResult.optimized.totalCost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Resa Attesa:</span>
                            <span className="font-bold text-green-800">{optimizationResult.optimized.expectedYield} t/ha</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Score Ambientale:</span>
                            <span className="font-bold text-green-800">{optimizationResult.optimized.environmentalScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">Efficienza:</span>
                            <span className="font-bold text-green-800">{optimizationResult.optimized.efficiencyScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Improvements */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Miglioramenti Ottenuti</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-700">
                            {optimizationResult.improvements.costReduction >= 0 ? '-' : '+'}{Math.abs(optimizationResult.improvements.costReduction).toFixed(1)}%
                          </div>
                          <div className="text-sm text-blue-600">Riduzione Costi</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-700">
                            +{optimizationResult.improvements.yieldIncrease.toFixed(1)}%
                          </div>
                          <div className="text-sm text-green-600">Aumento Resa</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-700">
                            +{optimizationResult.improvements.environmentalImprovement.toFixed(1)}%
                          </div>
                          <div className="text-sm text-purple-600">Miglioramento Ambientale</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-700">
                            {optimizationResult.improvements.roi.toFixed(0)}%
                          </div>
                          <div className="text-sm text-orange-600">ROI</div>
                        </div>
                      </div>
                    </div>

                    {/* Optimized Zones */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Zone Ottimizzate</h4>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {optimizationResult.optimizedZones.map((zone, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">Zona {zone.zoneId}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {zone.originalRate} → {zone.optimizedRate.toFixed(1)}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${
                                  zone.confidence >= 0.8 ? 'bg-green-500' :
                                  zone.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{zone.rationale}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Costo:</span>
                                <span className={`ml-1 font-medium ${
                                  zone.expectedImpact.costChange < 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {zone.expectedImpact.costChange >= 0 ? '+' : ''}€{zone.expectedImpact.costChange.toFixed(0)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Resa:</span>
                                <span className={`ml-1 font-medium ${
                                  zone.expectedImpact.yieldChange >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {zone.expectedImpact.yieldChange >= 0 ? '+' : ''}{zone.expectedImpact.yieldChange.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Ambiente:</span>
                                <span className={`ml-1 font-medium ${
                                  zone.expectedImpact.environmentalChange >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {zone.expectedImpact.environmentalChange >= 0 ? '+' : ''}{zone.expectedImpact.environmentalChange.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'implementation' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Piano di Implementazione</h3>
                    
                    {/* Implementation Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          €{optimizationResult.implementationPlan.totalImplementationCost}
                        </div>
                        <div className="text-sm text-blue-600">Costo Implementazione</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {optimizationResult.implementationPlan.paybackPeriod}
                        </div>
                        <div className="text-sm text-green-600">Mesi Payback</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-700">
                          {optimizationResult.implementationPlan.phases.length}
                        </div>
                        <div className="text-sm text-purple-600">Fasi</div>
                      </div>
                    </div>

                    {/* Implementation Phases */}
                    <div className="space-y-4">
                      {optimizationResult.implementationPlan.phases.map((phase, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                phase.priority === 'high' ? 'bg-red-500' :
                                phase.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}>
                                {phase.phase}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{phase.description}</h4>
                                <p className="text-sm text-gray-600">{phase.timeframe}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">€{phase.estimatedCost}</div>
                              <div className="text-sm text-green-600">+€{phase.expectedBenefits} benefici</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Zone coinvolte: {phase.zones.length}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Risk Assessment */}
                    {optimizationResult.implementationPlan.riskAssessment.length > 0 && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="text-yellow-600" size={20} />
                          <h4 className="font-medium text-yellow-900">Valutazione Rischi</h4>
                        </div>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {optimizationResult.implementationPlan.riskAssessment.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-1">⚠</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sensitivity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Analisi di Sensibilità</h3>
                    
                    <div className="space-y-4">
                      {optimizationResult.sensitivityAnalysis.map((analysis, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {analysis.parameter.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-gray-600">
                              Impatto: {(analysis.impact * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-5 gap-2 text-xs">
                            {analysis.scenarios.map((scenario, idx) => (
                              <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium text-gray-900">
                                  {scenario.change >= 0 ? '+' : ''}{scenario.change}%
                                </div>
                                <div className="text-gray-600">
                                  Costo: {scenario.costImpact >= 0 ? '+' : ''}{scenario.costImpact.toFixed(1)}%
                                </div>
                                <div className="text-gray-600">
                                  Resa: {scenario.yieldImpact >= 0 ? '+' : ''}{scenario.yieldImpact.toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // TODO: Implement export functionality
                      alert('Export ottimizzazione - funzionalità in sviluppo');
                    }}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Esporta Risultati
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Target className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ottimizzazione Costi
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Configura gli obiettivi e avvia l'ottimizzazione
                  </p>
                  <p className="text-sm text-gray-500">
                    L'algoritmo analizzerà tutte le zone per trovare<br />
                    la configurazione ottimale secondo i tuoi obiettivi
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

export default CostOptimizationPanel;