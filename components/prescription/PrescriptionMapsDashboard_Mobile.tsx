/**
 * Prescription Maps Dashboard - Mobile Optimized
 * Dashboard principale per gestione mappe prescrizione ottimizzato per mobile
 */

import React, { useState, useEffect } from 'react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { 
  PrescriptionMap, 
  PrescriptionGenerationRequest,
  PrescriptionMapStats 
} from '@/types/prescriptionMaps';
import { createPrescriptionMapsService } from '@/services/prescriptionMapsService';
import { createGeoExportService } from '@/services/geoExportService';
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
  Clock,
  TrendingUp,
  History,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

interface PrescriptionMapsDashboardProps {
  gardenId: string;
}

const PrescriptionMapsDashboard: React.FC<PrescriptionMapsDashboardProps> = ({ gardenId }) => {
  // Safe hook usage with error handling
  let storageProvider = null;
  
  try {
    const storage = useStorage();
    storageProvider = storage?.storageProvider;
  } catch (err) {
    console.warn('Storage context not available in PrescriptionMapsDashboard:', err);
  }
  
  // Services - only create if storageProvider is available
  const prescriptionService = storageProvider ? createPrescriptionMapsService(storageProvider) : null;
  const exportService = storageProvider ? createGeoExportService(storageProvider) : null;
  
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
  
  // Mobile states
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState<string | null>(null);
  
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
      // Mock data for demonstration
      const mockMaps: PrescriptionMap[] = [
        {
          id: '1',
          gardenId,
          gardenName: 'Orto Principale',
          name: 'Fertilizzazione Azoto Gennaio 2026',
          description: 'Mappa prescrizione per fertilizzazione azotata',
          mapType: 'fertilizer',
          generationDate: new Date('2026-01-10').toISOString(),
          dataSourcePeriod: {
            startDate: new Date('2026-01-01').toISOString(),
            endDate: new Date('2026-01-10').toISOString()
          },
          dataSources: {
            ndviData: true,
            plantLevelData: true,
            rowLevelData: false,
            soilData: true,
            weatherData: false
          },
          zones: [],
          totalZones: 8,
          totalAreaSqm: 125000,
          exportFormats: {
            shapefile: true,
            kml: true,
            isoxml: true,
            geojson: true,
            csv: true
          },
          areaHectares: 12.5,
          zonesCount: 8,
          applicationRate: { min: 120, max: 180, unit: 'kg/ha' },
          costSavings: 340,
          inputReduction: 22,
          status: 'completed',
          validationStatus: 'valid',
          qualityScore: 92,
          dataCompleteness: 95,
          createdAt: new Date('2026-01-10').toISOString(),
          updatedAt: new Date('2026-01-11').toISOString()
        },
        {
          id: '2',
          gardenId,
          gardenName: 'Campo Nord',
          name: 'Semina Mais Primavera',
          description: 'Mappa prescrizione per semina mais',
          mapType: 'seeding',
          generationDate: new Date('2026-01-08').toISOString(),
          dataSourcePeriod: {
            startDate: new Date('2025-12-15').toISOString(),
            endDate: new Date('2026-01-08').toISOString()
          },
          dataSources: {
            ndviData: true,
            plantLevelData: false,
            rowLevelData: true,
            soilData: true,
            weatherData: true
          },
          zones: [],
          totalZones: 6,
          totalAreaSqm: 83000,
          exportFormats: {
            shapefile: true,
            kml: true,
            isoxml: true,
            geojson: true,
            csv: true
          },
          areaHectares: 8.3,
          zonesCount: 6,
          applicationRate: { min: 65000, max: 85000, unit: 'semi/ha' },
          costSavings: 180,
          inputReduction: 15,
          status: 'completed',
          validationStatus: 'valid',
          qualityScore: 88,
          dataCompleteness: 90,
          createdAt: new Date('2026-01-08').toISOString(),
          updatedAt: new Date('2026-01-09').toISOString()
        }
      ];
      setPrescriptionMaps(mockMaps);
    } catch (error) {
      console.error('Error loading prescription maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
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
    if (!prescriptionService) {
      alert('Servizio non disponibile. Riprova più tardi.');
      return;
    }

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

  const getMapTypeLabel = (mapType: string) => {
    switch (mapType) {
      case 'fertilizer': return 'Fertilizzante';
      case 'seeding': return 'Semina';
      case 'irrigation': return 'Irrigazione';
      case 'treatment': return 'Trattamento';
      case 'harvest': return 'Raccolta';
      default: return 'Generico';
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
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Mobile Header */}
      <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Map className="text-green-600 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                Prescription Maps
              </h2>
              <p className="text-sm lg:text-base text-gray-600">
                Mappe prescrizione per precision farming
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowHistoricalComparison(true)}
              className="bg-blue-600 text-white px-4 py-3 lg:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[44px] text-sm lg:text-base"
            >
              <History size={18} />
              <span className="hidden sm:inline">Confronto Storico</span>
              <span className="sm:hidden">Storico</span>
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-4 py-3 lg:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 min-h-[44px] text-sm lg:text-base font-medium"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuova Mappa</span>
              <span className="sm:hidden">Nuova</span>
            </button>
          </div>
        </div>

        {/* Mobile Statistics Grid */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
            <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-blue-600 truncate">Mappe</p>
                  <p className="text-lg lg:text-xl font-bold text-blue-700">{stats.totalMapsGenerated}</p>
                </div>
                <Map className="text-blue-600 flex-shrink-0" size={18} />
              </div>
            </div>

            <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-green-600 truncate">Area</p>
                  <p className="text-lg lg:text-xl font-bold text-green-700">{stats.totalAreaCovered}ha</p>
                </div>
                <Layers className="text-green-600 flex-shrink-0" size={18} />
              </div>
            </div>

            <div className="bg-purple-50 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-purple-600 truncate">Qualità</p>
                  <p className="text-lg lg:text-xl font-bold text-purple-700">{stats.averageQualityScore}%</p>
                </div>
                <BarChart3 className="text-purple-600 flex-shrink-0" size={18} />
              </div>
            </div>

            <div className="bg-orange-50 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-orange-600 truncate">Risparmio</p>
                  <p className="text-lg lg:text-xl font-bold text-orange-700">€{stats.totalCostSavings}</p>
                </div>
                <DollarSign className="text-orange-600 flex-shrink-0" size={18} />
              </div>
            </div>

            <div className="bg-cyan-50 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-cyan-600 truncate">ROI</p>
                  <p className="text-lg lg:text-xl font-bold text-cyan-700">{stats.averageRoi}%</p>
                </div>
                <TrendingUp className="text-cyan-600 flex-shrink-0" size={18} />
              </div>
            </div>

            <div className="bg-indigo-50 p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs lg:text-sm text-indigo-600 truncate">Riduzione</p>
                  <p className="text-lg lg:text-xl font-bold text-indigo-700">{stats.inputReductionAchieved}%</p>
                </div>
                <CheckCircle className="text-indigo-600 flex-shrink-0" size={18} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maps List - Mobile Optimized */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Mappe Prescrizione</h3>
        </div>

        {prescriptionMaps.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Map className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna mappa prescrizione
            </h3>
            <p className="text-gray-600 mb-6 text-sm lg:text-base">
              Crea la tua prima mappa prescrizione per iniziare con il precision farming
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors min-h-[44px] font-medium"
            >
              Crea Prima Mappa
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="divide-y divide-gray-200">
                {prescriptionMaps.map((map) => (
                  <div key={map.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getMapTypeIcon(map.mapType)}
                        <div>
                          <h4 className="font-semibold text-gray-900">{map.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{getMapTypeLabel(map.mapType)}</span>
                            <span>•</span>
                            <span>{map.areaHectares} ha</span>
                            <span>•</span>
                            <span>{map.zonesCount} zone</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getValidationStatusColor(map.validationStatus)}`}>
                              {map.validationStatus === 'valid' ? 'Valida' : 
                               map.validationStatus === 'warning' ? 'Attenzione' : 'Invalida'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <div className="font-semibold text-gray-900">Qualità: {map.qualityScore}%</div>
                          <div className="text-gray-600">Risparmio: €{map.costSavings}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedMap(map);
                              setShowZoneManagement(true);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Gestisci Zone"
                          >
                            <Settings size={18} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedMap(map);
                              setShowCostOptimization(true);
                            }}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Ottimizza Costi"
                          >
                            <Target size={18} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedMap(map);
                              setShowExportModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Esporta"
                          >
                            <Download size={18} />
                          </button>
                          
                          <button
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Anteprima"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {prescriptionMaps.map((map) => (
                <div key={map.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {getMapTypeIcon(map.mapType)}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{map.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{getMapTypeLabel(map.mapType)}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowMobileActions(showMobileActions === map.id ? null : map.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-semibold ml-1">{map.areaHectares} ha</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Zone:</span>
                      <span className="font-semibold ml-1">{map.zonesCount}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Qualità:</span>
                      <span className="font-semibold ml-1">{map.qualityScore}%</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-600">Risparmio:</span>
                      <span className="font-semibold ml-1">€{map.costSavings}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${getValidationStatusColor(map.validationStatus)}`}>
                      {map.validationStatus === 'valid' ? 'Valida' : 
                       map.validationStatus === 'warning' ? 'Attenzione' : 'Invalida'}
                    </span>
                    
                    <span className="text-xs text-gray-500">
                      {new Date(map.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Mobile Actions Menu */}
                  {showMobileActions === map.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setSelectedMap(map);
                            setShowZoneManagement(true);
                            setShowMobileActions(null);
                          }}
                          className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <Settings size={16} />
                          Gestisci Zone
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedMap(map);
                            setShowCostOptimization(true);
                            setShowMobileActions(null);
                          }}
                          className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <Target size={16} />
                          Ottimizza
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedMap(map);
                            setShowExportModal(true);
                            setShowMobileActions(null);
                          }}
                          className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <Download size={16} />
                          Esporta
                        </button>
                        
                        <button
                          onClick={() => setShowMobileActions(null)}
                          className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]"
                        >
                          <Eye size={16} />
                          Anteprima
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Nuova Mappa Prescrizione</h3>
              <p className="text-gray-600 mb-4">Funzionalità in sviluppo...</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 min-h-[44px]"
                >
                  Annulla
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 min-h-[44px]"
                >
                  Crea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other modals would be similarly optimized... */}
      {showZoneManagement && selectedMap && (
        <ZoneManagementPanel
          prescriptionMap={selectedMap}
          onClose={() => setShowZoneManagement(false)}
          onUpdate={() => loadPrescriptionMaps()}
        />
      )}

      {showExportModal && selectedMap && (
        <MapExportModal
          prescriptionMap={selectedMap}
          onClose={() => setShowExportModal(false)}
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
          onClose={() => setShowCostOptimization(false)}
        />
      )}
    </div>
  );
};

export default PrescriptionMapsDashboard;