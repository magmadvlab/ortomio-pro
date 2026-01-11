/**
 * Prescription Maps Dashboard
 * Dashboard principale per gestione mappe prescrizione
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { 
  PrescriptionMap, 
  PrescriptionGenerationRequest,
  PrescriptionMapStats 
} from '../../types/prescriptionMaps';
import { createPrescriptionMapsService } from '../../services/prescriptionMapsService';
import { createGeoExportService } from '../../services/geoExportService';
import ZoneManagementPanel from './ZoneManagementPanel';
import MapExportModal from './MapExportModal';
import HistoricalComparisonPanel from './HistoricalComparisonPanel';
import CostOptimizationPanel from './CostOptimizationPanel';
import { 
  Map, 
  Plus, 
  Download, 
  Eye, 
  Settings, 
  BarChart3,
  Layers,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  History,
  DollarSign
} from 'lucide-react';

interface PrescriptionMapsDashboardProps {
  gardenId: string;
}

const PrescriptionMapsDashboard: React.FC<PrescriptionMapsDashboardProps> = ({ gardenId }) => {
  const { storageProvider } = useStorage();
  
  // Services
  const prescriptionService = createPrescriptionMapsService(storageProvider);
  const exportService = createGeoExportService(storageProvider);
  
  // State
  const [prescriptionMaps, setPrescriptionMaps] = useState<PrescriptionMap[]>([]);
  const [stats, setStats] = useState<PrescriptionMapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMap, setSelectedMap] = useState<PrescriptionMap | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showZoneManagement, setShowZoneManagement] = useState(false);
  const [showHistoricalComparison, setShowHistoricalComparison] = useState(false);
  const [showCostOptimization, setShowCostOptimization] = useState(false);
  
  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    loadPrescriptionMaps();
    loadStats();
  }, [gardenId]);

  const loadPrescriptionMaps = async () => {
    try {
      setLoading(true);
      // TODO: Implement loading from storage provider
      // const maps = await storageProvider.getPrescriptionMaps?.(gardenId) || [];
      // setPrescriptionMaps(maps);
      setPrescriptionMaps([]); // Placeholder
    } catch (error) {
      console.error('Error loading prescription maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Implement stats loading
      setStats({
        totalMapsGenerated: 12,
        mapsGeneratedThisMonth: 3,
        totalAreaCovered: 45.6,
        popularMapTypes: { fertilizer: 8, seeding: 3, irrigation: 1 },
        popularExportFormats: { shapefile: 6, kml: 4, isoxml: 2 },
        averageZonesPerMap: 8.5,
        averageQualityScore: 87,
        averageDataCompleteness: 92,
        successRate: 95,
        totalCostSavings: 2340,
        averageRoi: 156,
        inputReductionAchieved: 18,
        activeUsers: 1,
        mapsDownloaded: 28,
        machineryIntegrations: 5
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateMap = async (request: PrescriptionGenerationRequest) => {
    try {
      setGenerating(true);
      setGenerationProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const result = await prescriptionService.generatePrescriptionMap(request);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      if (result.success) {
        alert(`✅ Mappa prescrizione generata con successo!\n${result.stats.zonesGenerated} zone create\nQualità: ${result.quality.overallScore}%`);
        await loadPrescriptionMaps();
        setShowCreateModal(false);
      } else {
        alert(`❌ Errore nella generazione:\n${result.errors?.join('\n')}`);
      }
    } catch (error) {
      console.error('Error creating prescription map:', error);
      alert('Errore nella generazione della mappa');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getMapTypeIcon = (mapType: string) => {
    switch (mapType) {
      case 'fertilizer': return <Zap className="text-green-600" size={20} />;
      case 'seeding': return <Target className="text-blue-600" size={20} />;
      case 'irrigation': return <Layers className="text-cyan-600" size={20} />;
      case 'treatment': return <CheckCircle className="text-orange-600" size={20} />;
      case 'harvest': return <TrendingUp className="text-purple-600" size={20} />;
      default: return <Map className="text-gray-600" size={20} />;
    }
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'invalid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento mappe prescrizione...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Map className="text-green-600" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mappe Prescrizione</h2>
              <p className="text-gray-600">
                Mappe prescrizione per precision farming
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus size={20} />
              Crea Nuova Mappa
            </button>
            
            <button
              onClick={() => setShowHistoricalComparison(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <History size={20} />
              Confronto Storico
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Mappe Totali</p>
                  <p className="text-xl font-bold text-blue-700">{stats.totalMapsGenerated}</p>
                </div>
                <Map className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Area Coperta</p>
                  <p className="text-xl font-bold text-green-700">{stats.totalAreaCovered} ha</p>
                </div>
                <Layers className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Qualità Media</p>
                  <p className="text-xl font-bold text-purple-700">{stats.averageQualityScore}%</p>
                </div>
                <BarChart3 className="text-purple-600" size={24} />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Risparmio</p>
                  <p className="text-xl font-bold text-orange-700">€{stats.totalCostSavings}</p>
                </div>
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>

            <div className="bg-cyan-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-600">ROI Medio</p>
                  <p className="text-xl font-bold text-cyan-700">{stats.averageRoi}%</p>
                </div>
                <Target className="text-cyan-600" size={24} />
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600">Riduzione Input</p>
                  <p className="text-xl font-bold text-indigo-700">{stats.inputReductionAchieved}%</p>
                </div>
                <CheckCircle className="text-indigo-600" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maps List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Mappe Prescrizione</h3>
        </div>

        {prescriptionMaps.length === 0 ? (
          <div className="text-center py-12">
            <Map className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna mappa prescrizione
            </h3>
            <p className="text-gray-600 mb-4">
              Crea la tua prima mappa prescrizione per iniziare con il precision farming
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Crea Prima Mappa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {prescriptionMaps.map((map) => (
              <div key={map.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getMapTypeIcon(map.mapType)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{map.name}</h4>
                      <p className="text-sm text-gray-600">{map.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{map.totalZones} zone</span>
                        <span>{(map.totalAreaSqm / 10000).toFixed(1)} ha</span>
                        <span>Qualità: {map.qualityScore}%</span>
                        <span className={`px-2 py-1 rounded-full ${getValidationStatusColor(map.validationStatus)}`}>
                          {map.validationStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMap(map);
                        setShowCostOptimization(true);
                      }}
                      className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-100 rounded-lg transition-colors"
                      title="Ottimizza Costi"
                    >
                      <DollarSign size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedMap(map);
                        setShowZoneManagement(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Gestisci Zone"
                    >
                      <Settings size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedMap(map);
                        setShowExportModal(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Esporta"
                    >
                      <Download size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        // TODO: Implement map preview
                        alert('Anteprima mappa - funzionalità in sviluppo');
                      }}
                      className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-colors"
                      title="Anteprima"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {/* Cost Analysis Summary */}
                {map.costAnalysis && (
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-600 font-medium">Risparmio vs Uniforme</p>
                      <p className="text-green-700 font-bold">€{map.costAnalysis.savingsVsUniform}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-600 font-medium">ROI Stimato</p>
                      <p className="text-blue-700 font-bold">{map.costAnalysis.roi}%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-600 font-medium">Riduzione Input</p>
                      <p className="text-purple-700 font-bold">{map.costAnalysis.inputReduction}%</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Progress Modal */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generazione Mappa Prescrizione
              </h3>
              <p className="text-gray-600 mb-4">
                Elaborazione dati e calcolo zone in corso...
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">
                {generationProgress}% completato
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePrescriptionMapModal
          gardenId={gardenId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMap}
        />
      )}

      {showExportModal && selectedMap && (
        <MapExportModal
          prescriptionMap={selectedMap}
          onClose={() => {
            setShowExportModal(false);
            setSelectedMap(null);
          }}
        />
      )}

      {showZoneManagement && selectedMap && (
        <ZoneManagementPanel
          prescriptionMap={selectedMap}
          onClose={() => {
            setShowZoneManagement(false);
            setSelectedMap(null);
          }}
          onUpdate={loadPrescriptionMaps}
        />
      )}

      {showHistoricalComparison && (
        <HistoricalComparisonPanel
          gardenId={gardenId}
          availableMaps={prescriptionMaps}
          onClose={() => setShowHistoricalComparison(false)}
        />
      )}

      {showCostOptimization && selectedMap && (
        <CostOptimizationPanel
          prescriptionMap={selectedMap}
          onClose={() => {
            setShowCostOptimization(false);
            setSelectedMap(null);
          }}
          onOptimizationComplete={(result) => {
            // Handle optimization completion
            console.log('Optimization completed:', result);
            loadPrescriptionMaps();
          }}
        />
      )}
    </div>
  );
};

/**
 * Create Prescription Map Modal Component
 */
interface CreatePrescriptionMapModalProps {
  gardenId: string;
  onClose: () => void;
  onSubmit: (request: PrescriptionGenerationRequest) => void;
}

const CreatePrescriptionMapModal: React.FC<CreatePrescriptionMapModalProps> = ({
  gardenId,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<Partial<PrescriptionGenerationRequest>>({
    gardenId,
    mapType: 'fertilizer',
    name: '',
    description: '',
    dataSources: {
      ndviWeight: 0.4,
      plantHealthWeight: 0.3,
      soilWeight: 0.2,
      historicalWeight: 0.1
    },
    zoneConfig: {
      minZoneSize: 500,
      maxZones: 15,
      similarityThreshold: 0.8,
      smoothingFactor: 0.3
    },
    prescriptionConfig: {
      baseRate: 100,
      unit: 'kg/ha',
      productName: '',
      variableRateEnabled: true,
      maxVariation: 30
    },
    exportFormats: ['shapefile', 'kml'],
    analysisPeriod: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.mapType) {
      alert('Nome e tipo mappa sono obbligatori');
      return;
    }
    
    onSubmit(formData as PrescriptionGenerationRequest);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Nuova Mappa Prescrizione</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Mappa *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="es. Fertilizzazione Primavera 2026"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo Mappa *
              </label>
              <select
                value={formData.mapType || 'fertilizer'}
                onChange={(e) => setFormData(prev => ({ ...prev, mapType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="fertilizer">Fertilizzazione</option>
                <option value="seeding">Semina</option>
                <option value="irrigation">Irrigazione</option>
                <option value="treatment">Trattamento</option>
                <option value="harvest">Raccolta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Descrizione opzionale della mappa..."
            />
          </div>

          {/* Prescription Config */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dose Base
              </label>
              <input
                type="number"
                value={formData.prescriptionConfig?.baseRate || 100}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prescriptionConfig: {
                    ...prev.prescriptionConfig!,
                    baseRate: parseFloat(e.target.value) || 100
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unità
              </label>
              <select
                value={formData.prescriptionConfig?.unit || 'kg/ha'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prescriptionConfig: {
                    ...prev.prescriptionConfig!,
                    unit: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="kg/ha">kg/ha</option>
                <option value="L/ha">L/ha</option>
                <option value="g/m²">g/m²</option>
                <option value="ml/m²">ml/m²</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variazione Max (%)
              </label>
              <input
                type="number"
                value={formData.prescriptionConfig?.maxVariation || 30}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  prescriptionConfig: {
                    ...prev.prescriptionConfig!,
                    maxVariation: parseFloat(e.target.value) || 30
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Genera Mappa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionMapsDashboard;