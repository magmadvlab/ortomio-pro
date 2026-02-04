/**
 * Plant Detail Modal
 * Mostra dettagli completi pianta con storico operazioni
 */

import React, { useState, useEffect } from 'react';
import { GardenPlant, PlantOperation } from '../../types/individualPlant';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { X, Droplets, Zap, Scissors, AlertTriangle, Calendar, TrendingUp, Camera } from 'lucide-react';

interface PlantDetailModalProps {
  plant: GardenPlant;
  isOpen: boolean;
  onClose: () => void;
}

const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, isOpen, onClose }) => {
  const { storageProvider } = useStorage();
  const [operations, setOperations] = useState<PlantOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'watering' | 'fertilizing' | 'treatment' | 'work'>('all');

  useEffect(() => {
    if (isOpen && plant.id) {
      loadOperations();
    }
  }, [isOpen, plant.id]);

  const loadOperations = async () => {
    try {
      setLoading(true);
      
      // 1. Carica operazioni dirette sulla pianta
      const plantOps = await storageProvider.getPlantOperations?.(plant.id) || [];
      
      // 2. Se la pianta è in un filare, carica anche le operazioni del filare
      let fieldRowOps: PlantOperation[] = [];
      if (plant.fieldRowId) {
        try {
          // Carica operazioni del filare dal database
          const rowOperations = await storageProvider.getFieldRowOperations?.(plant.fieldRowId) || [];
          
          // Converti operazioni filare in formato PlantOperation con flag speciale
          fieldRowOps = rowOperations.map((op: any) => ({
            ...op,
            id: `row-${op.id}`,
            plantId: plant.id,
            isFieldRowOperation: true, // Flag per distinguere operazioni di filare
            fieldRowName: plant.fieldRowName || 'Filare',
          }));
        } catch (error) {
          console.warn('Field row operations not available:', error);
        }
      }
      
      // 3. Combina e ordina tutte le operazioni
      const allOps = [...plantOps, ...fieldRowOps];
      setOperations(allOps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading operations:', error);
      setOperations([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'watering': return <Droplets className="text-blue-600" size={20} />;
      case 'fertilizing': return <Zap className="text-green-600" size={20} />;
      case 'treatment': return <AlertTriangle className="text-orange-600" size={20} />;
      case 'work': return <Scissors className="text-purple-600" size={20} />;
      default: return <Calendar className="text-gray-600" size={20} />;
    }
  };

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'watering': return 'Irrigazione';
      case 'fertilizing': return 'Fertilizzazione';
      case 'treatment': return 'Trattamento';
      case 'work': return 'Lavorazione';
      default: return type;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredOperations = activeTab === 'all' 
    ? operations 
    : operations.filter(op => op.operationType === activeTab);

  // Statistiche operazioni
  const stats = {
    watering: operations.filter(op => op.operationType === 'watering').length,
    fertilizing: operations.filter(op => op.operationType === 'fertilizing').length,
    treatment: operations.filter(op => op.operationType === 'treatment').length,
    work: operations.filter(op => op.operationType === 'work').length,
  };

  // Conta operazioni dirette vs filare
  const directOps = operations.filter(op => !(op as any).isFieldRowOperation).length;
  const fieldRowOps = operations.filter(op => (op as any).isFieldRowOperation).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                🌱
              </div>
              <div>
                <h2 className="text-2xl font-bold">{plant.plantCode}</h2>
                <p className="text-green-100">{plant.plantName} - {plant.variety}</p>
                {plant.fieldRowName && (
                  <p className="text-green-100 text-sm mt-1">
                    🌾 {plant.fieldRowName} - Posizione {plant.positionInRow}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} />
                <span className="text-sm">Salute</span>
              </div>
              <div className="text-2xl font-bold">{plant.healthScore}%</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={16} />
                <span className="text-sm">Irrigazioni</span>
              </div>
              <div className="text-2xl font-bold">{stats.watering}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} />
                <span className="text-sm">Fertilizzazioni</span>
              </div>
              <div className="text-2xl font-bold">{stats.fertilizing}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} />
                <span className="text-sm">Trattamenti</span>
              </div>
              <div className="text-2xl font-bold">{stats.treatment}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'Tutte', count: operations.length },
              { id: 'watering', label: 'Irrigazioni', count: stats.watering },
              { id: 'fertilizing', label: 'Fertilizzazioni', count: stats.fertilizing },
              { id: 'treatment', label: 'Trattamenti', count: stats.treatment },
              { id: 'work', label: 'Lavorazioni', count: stats.work },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-green-600 border-green-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento operazioni...</p>
            </div>
          ) : filteredOperations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessuna operazione registrata
              </h3>
              <p className="text-gray-600">
                {activeTab === 'all' 
                  ? 'Non ci sono ancora operazioni per questa pianta'
                  : `Non ci sono ${getOperationLabel(activeTab).toLowerCase()} registrate`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOperations.map((operation) => (
                <div
                  key={operation.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getOperationIcon(operation.operationType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {getOperationLabel(operation.operationType)}
                          </h4>
                          {(operation as any).isFieldRowOperation && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              🌾 Operazione Filare
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(operation.date).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {(operation as any).isFieldRowOperation && (operation as any).fieldRowName && (
                          <p className="text-xs text-blue-600 mt-1">
                            Applicata su tutto il filare: {(operation as any).fieldRowName}
                          </p>
                        )}
                      </div>
                    </div>
                    {operation.healthScoreBefore !== undefined && operation.healthScoreAfter !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getHealthColor(operation.healthScoreBefore)}`}>
                          {operation.healthScoreBefore}%
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getHealthColor(operation.healthScoreAfter)}`}>
                          {operation.healthScoreAfter}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Operation Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Context Info - Always show if available */}
                    {(operation as any).context && (
                      <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-blue-700 font-medium">🌡️ Temperatura:</span>
                            <span className="ml-2">{(operation as any).context.weather?.temperature}°C</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">💧 Umidità:</span>
                            <span className="ml-2">{(operation as any).context.weather?.humidity}%</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">{(operation as any).context.lunar?.phaseEmoji} Fase Lunare:</span>
                            <span className="ml-2">{(operation as any).context.lunar?.phase}</span>
                          </div>
                          <div>
                            <span className="text-blue-700 font-medium">🌍 Stagione:</span>
                            <span className="ml-2 capitalize">{(operation as any).context.season}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {operation.operationType === 'watering' && (
                      <>
                        <div>
                          <span className="text-gray-600">Durata:</span>
                          <span className="ml-2 font-medium">{operation.duration || 'N/A'} min</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantità:</span>
                          <span className="ml-2 font-medium">{operation.waterAmount || 'N/A'} L</span>
                        </div>
                      </>
                    )}

                    {operation.operationType === 'fertilizing' && (
                      <>
                        <div>
                          <span className="text-gray-600">Tipo:</span>
                          <span className="ml-2 font-medium">{operation.fertilizerType || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dosaggio:</span>
                          <span className="ml-2 font-medium">{operation.dosage || 'N/A'}</span>
                        </div>
                        {operation.npkRatio && (
                          <div className="col-span-2">
                            <span className="text-gray-600">NPK:</span>
                            <span className="ml-2 font-medium">{operation.npkRatio}</span>
                          </div>
                        )}
                      </>
                    )}

                    {operation.operationType === 'treatment' && (
                      <>
                        <div>
                          <span className="text-gray-600">Tipo:</span>
                          <span className="ml-2 font-medium">
                            {operation.treatmentType === 'preventive' ? 'Preventivo' : 'Curativo'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Prodotto:</span>
                          <span className="ml-2 font-medium">{operation.product || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dosaggio:</span>
                          <span className="ml-2 font-medium">{operation.dosage || 'N/A'}</span>
                        </div>
                        {operation.targetPest && (
                          <div>
                            <span className="text-gray-600">Target:</span>
                            <span className="ml-2 font-medium">{operation.targetPest}</span>
                          </div>
                        )}
                      </>
                    )}

                    {operation.operationType === 'work' && (
                      <>
                        <div>
                          <span className="text-gray-600">Tipo:</span>
                          <span className="ml-2 font-medium">{operation.workType || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Durata:</span>
                          <span className="ml-2 font-medium">{operation.duration || 'N/A'} min</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notes */}
                  {operation.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Note:</span> {operation.notes}
                      </p>
                    </div>
                  )}

                  {/* Photos */}
                  {operation.photos && operation.photos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Foto ({operation.photos.length})
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {operation.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-600">
                Piantata il: {new Date(plant.plantedDate).toLocaleDateString('it-IT')}
              </div>
              {plant.fieldRowId && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600">{directOps} operazioni dirette</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-gray-600">{fieldRowOps} operazioni filare</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailModal;
