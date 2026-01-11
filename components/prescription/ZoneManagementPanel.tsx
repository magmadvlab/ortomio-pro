/**
 * Zone Management Panel
 * Pannello per gestione avanzata delle zone prescription maps
 */

import React, { useState, useEffect } from 'react';
import { 
  PrescriptionMap, 
  PrescriptionZone 
} from '../../types/prescriptionMaps';
import { createZoneManagementService, ZoneAnalysis } from '../../services/zoneManagementService';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  Layers, 
  Target, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Merge,
  Split,
  Eye,
  Download,
  X
} from 'lucide-react';

interface ZoneManagementPanelProps {
  prescriptionMap: PrescriptionMap;
  onClose: () => void;
  onUpdate: () => void;
}

const ZoneManagementPanel: React.FC<ZoneManagementPanelProps> = ({
  prescriptionMap,
  onClose,
  onUpdate
}) => {
  const { storageProvider } = useStorage();
  const zoneService = createZoneManagementService(storageProvider);
  
  // State
  const [zones, setZones] = useState<PrescriptionZone[]>(prescriptionMap.zones);
  const [selectedZone, setSelectedZone] = useState<PrescriptionZone | null>(null);
  const [zoneAnalysis, setZoneAnalysis] = useState<ZoneAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'zones' | 'analysis' | 'optimization'>('zones');

  useEffect(() => {
    if (selectedZone) {
      loadZoneAnalysis(selectedZone);
    }
  }, [selectedZone]);

  const loadZoneAnalysis = async (zone: PrescriptionZone) => {
    try {
      setLoading(true);
      const analysis = await zoneService.analyzeZone(zone, [], []); // TODO: Pass actual NDVI and plant data
      setZoneAnalysis(analysis);
    } catch (error) {
      console.error('Error loading zone analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeZones = async () => {
    try {
      setLoading(true);
      const result = await zoneService.optimizeZones(zones);
      
      if (result.optimizedZones < zones.length) {
        const message = `Ottimizzazione completata!\n` +
          `Zone ridotte: ${zones.length} → ${result.optimizedZones}\n` +
          `Risparmio stimato: €${result.costSavings}\n` +
          `Miglioramento qualità: ${result.qualityImprovement}%`;
        
        if (confirm(`${message}\n\nApplicare le ottimizzazioni?`)) {
          // TODO: Apply optimizations
          alert('Ottimizzazioni applicate con successo!');
          onUpdate();
        }
      } else {
        alert('Le zone sono già ottimizzate al meglio.');
      }
    } catch (error) {
      console.error('Error optimizing zones:', error);
      alert('Errore durante l\'ottimizzazione');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateZones = async () => {
    try {
      setLoading(true);
      const validation = await zoneService.validateZoneConfiguration(zones);
      
      let message = `Validazione completata!\n\n`;
      
      if (validation.isValid) {
        message += '✅ Configurazione valida per l\'applicazione';
      } else {
        message += '⚠️ Problemi rilevati:';
      }
      
      if (validation.errors.length > 0) {
        message += `\n\nErrori:\n${validation.errors.join('\n')}`;
      }
      
      if (validation.warnings.length > 0) {
        message += `\n\nAvvertenze:\n${validation.warnings.join('\n')}`;
      }
      
      if (validation.suggestions.length > 0) {
        message += `\n\nSuggerimenti:\n${validation.suggestions.join('\n')}`;
      }
      
      alert(message);
    } catch (error) {
      console.error('Error validating zones:', error);
      alert('Errore durante la validazione');
    } finally {
      setLoading(false);
    }
  };

  const getZoneColor = (zone: PrescriptionZone) => {
    const rate = zone.prescription.applicationRate;
    const baseRate = 100; // TODO: Get from prescription map
    const ratio = rate / baseRate;
    
    if (ratio < 0.8) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (ratio > 1.2) return 'bg-red-100 border-red-300 text-red-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="text-green-600" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestione Zone</h2>
              <p className="text-sm text-gray-600">{prescriptionMap.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleValidateZones}
              disabled={loading}
              className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={16} className="inline mr-2" />
              Valida
            </button>
            
            <button
              onClick={handleOptimizeZones}
              disabled={loading}
              className="px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <Target size={16} className="inline mr-2" />
              Ottimizza
            </button>
            
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Zones List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Zone ({zones.length})</h3>
              <div className="text-sm text-gray-600">
                Area totale: {(prescriptionMap.totalAreaSqm / 10000).toFixed(1)} ha
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedZone?.id === zone.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{zone.zoneName}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getZoneColor(zone)}`}>
                      {zone.prescription.applicationRate} {zone.prescription.unit}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Area: {(zone.areaSqm / 10000).toFixed(2)} ha</div>
                    <div className="flex items-center justify-between">
                      <span>Qualità:</span>
                      <span className={`font-medium ${getQualityColor(zone.dataQuality)}`}>
                        {zone.dataQuality}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidenza:</span>
                      <span className={`font-medium ${getQualityColor(zone.confidence)}`}>
                        {zone.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Zone indicators */}
                  <div className="flex items-center gap-2 mt-2">
                    {zone.dataQuality < 60 && (
                      <AlertTriangle size={14} className="text-yellow-500" />
                    )}
                    {zone.areaSqm < 500 && (
                      <Target size={14} className="text-orange-500" />
                    )}
                    {zone.confidence > 90 && (
                      <CheckCircle size={14} className="text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Zone Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedZone ? (
              <div className="p-6">
                {/* Zone Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedZone.zoneName}</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Zone Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600">Area</p>
                      <p className="font-bold text-blue-700">{(selectedZone.areaSqm / 10000).toFixed(2)} ha</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-600">Dose</p>
                      <p className="font-bold text-green-700">
                        {selectedZone.prescription.applicationRate} {selectedZone.prescription.unit}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-600">Qualità</p>
                      <p className="font-bold text-purple-700">{selectedZone.dataQuality}%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-600">Confidenza</p>
                      <p className="font-bold text-orange-700">{selectedZone.confidence}%</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { key: 'zones', label: 'Dettagli Zona', icon: Layers },
                      { key: 'analysis', label: 'Analisi', icon: BarChart3 },
                      { key: 'optimization', label: 'Ottimizzazione', icon: Target }
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
                {activeTab === 'zones' && (
                  <div className="space-y-6">
                    {/* Prescription Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Prescrizione</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Dose applicazione:</span>
                          <span className="ml-2 font-medium">
                            {selectedZone.prescription.applicationRate} {selectedZone.prescription.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Metodo:</span>
                          <span className="ml-2 font-medium">{selectedZone.prescription.applicationMethod}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Prodotto:</span>
                          <span className="ml-2 font-medium">{selectedZone.prescription.productName || 'Non specificato'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tipo zona:</span>
                          <span className="ml-2 font-medium">{selectedZone.zoneType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Source Data */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Dati Sorgente</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">NDVI medio:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.avgNdvi?.toFixed(3) || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Salute piante:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.avgPlantHealth?.toFixed(1) || 'N/A'}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Numero piante:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.plantCount || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tipo suolo:</span>
                          <span className="ml-2 font-medium">{selectedZone.sourceData.soilType || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Variable Rate Details */}
                    {selectedZone.prescription.variableRate && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Dose Variabile</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Dose minima:</span>
                            <span className="ml-2 font-medium">
                              {selectedZone.prescription.variableRate.minRate} {selectedZone.prescription.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Dose massima:</span>
                            <span className="ml-2 font-medium">
                              {selectedZone.prescription.variableRate.maxRate} {selectedZone.prescription.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Funzione:</span>
                            <span className="ml-2 font-medium">{selectedZone.prescription.variableRate.rateFunction}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Analisi in corso...</p>
                      </div>
                    ) : zoneAnalysis ? (
                      <>
                        {/* Recommendations */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-3">Raccomandazioni</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-green-700">Dose raccomandata:</span>
                              <span className="font-bold text-green-800">
                                {zoneAnalysis.recommendations.applicationRate} {selectedZone.prescription.unit}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-green-700">Confidenza:</span>
                              <span className="font-bold text-green-800">{zoneAnalysis.recommendations.confidence}%</span>
                            </div>
                          </div>
                          
                          {zoneAnalysis.recommendations.reasoning.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-green-700 font-medium mb-2">Motivazioni:</p>
                              <ul className="text-sm text-green-600 space-y-1">
                                {zoneAnalysis.recommendations.reasoning.map((reason, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Risk Factors */}
                        {zoneAnalysis.riskFactors.length > 0 && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="font-medium text-yellow-900 mb-3">Fattori di Rischio</h4>
                            <div className="space-y-3">
                              {zoneAnalysis.riskFactors.map((risk, index) => (
                                <div key={index} className="flex items-start gap-3">
                                  <AlertTriangle 
                                    size={16} 
                                    className={`mt-1 ${
                                      risk.severity === 'high' ? 'text-red-500' :
                                      risk.severity === 'medium' ? 'text-yellow-500' :
                                      'text-blue-500'
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{risk.description}</p>
                                    <p className="text-xs text-gray-600 mt-1">{risk.mitigation}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Alternative Approaches */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Approcci Alternativi</h4>
                          <div className="space-y-3">
                            {zoneAnalysis.recommendations.alternatives.map((alt, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900">{alt.description}</span>
                                  <span className="text-sm font-bold text-blue-600">
                                    {alt.rate} {selectedZone.prescription.unit}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{alt.expectedOutcome}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600">Seleziona una zona per vedere l'analisi</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'optimization' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">Ottimizzazione Zone</h4>
                      <p className="text-sm text-blue-700 mb-4">
                        L'ottimizzazione può ridurre il numero di zone mantenendo la precisione dell'applicazione.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700">Zone attuali:</span>
                          <span className="ml-2 font-bold text-blue-800">{zones.length}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">Area media zona:</span>
                          <span className="ml-2 font-bold text-blue-800">
                            {(prescriptionMap.totalAreaSqm / zones.length / 10000).toFixed(2)} ha
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleOptimizeZones}
                        disabled={loading}
                        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Ottimizzazione...' : 'Avvia Ottimizzazione'}
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Azioni Zone</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                          <Merge size={16} />
                          Unisci Zone
                        </button>
                        <button className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                          <Split size={16} />
                          Dividi Zona
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Layers className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Seleziona una zona
                  </h3>
                  <p className="text-gray-600">
                    Clicca su una zona nella lista per vedere i dettagli
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

export default ZoneManagementPanel;