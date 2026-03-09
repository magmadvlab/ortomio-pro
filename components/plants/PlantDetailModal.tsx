/**
 * Plant Detail Modal
 * Mostra dettagli completi pianta con storico operazioni
 */

import React, { useState, useEffect } from 'react';
import { GardenPlant, PlantOperation } from '../../types/individualPlant';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { createUnifiedOperationsService } from '../../services/unifiedOperationsService';
import { X, Droplets, Zap, Scissors, AlertTriangle, Calendar, TrendingUp, Camera, Plus, Bot, Cpu, Save } from 'lucide-react';

interface PlantDetailModalProps {
  plant: GardenPlant;
  isOpen: boolean;
  onClose: () => void;
}

const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, isOpen, onClose }) => {
  const { storageProvider } = useStorage();
  const unifiedOperationsService = createUnifiedOperationsService(storageProvider);
  const [operations, setOperations] = useState<PlantOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'watering' | 'fertilizing' | 'treatment' | 'work'>('all');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [savingManualEntry, setSavingManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState<{
    sourceType: 'manual' | 'iot';
    operationType: 'watering' | 'fertilizing' | 'treatment' | 'work';
    operationDate: string;
    operationTime: string;
    quantity: string;
    unit: string;
    productName: string;
    notes: string;
  }>({
    sourceType: 'manual',
    operationType: 'watering',
    operationDate: new Date().toISOString().split('T')[0],
    operationTime: new Date().toTimeString().slice(0, 5),
    quantity: '',
    unit: 'L',
    productName: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && plant.id) {
      loadOperations();
    }
  }, [isOpen, plant.id]);

  useEffect(() => {
    setManualEntry(prev => {
      if (prev.operationType === 'watering') return { ...prev, unit: 'L' };
      if (prev.operationType === 'fertilizing') return { ...prev, unit: 'g' };
      if (prev.operationType === 'treatment') return { ...prev, unit: 'ml' };
      return { ...prev, unit: 'sessione' };
    });
  }, [manualEntry.operationType]);

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

  const registerManualOperation = async () => {
    try {
      if (!plant.id || !plant.gardenId) {
        alert('Pianta non valida');
        return;
      }

      setSavingManualEntry(true);
      const normalizedQuantity = manualEntry.quantity.trim() !== '' ? Number(manualEntry.quantity) : undefined;
      const normalizedNotes = manualEntry.notes?.trim();

      const result = await unifiedOperationsService.executeUnifiedOperation({
        level: 'plant',
        gardenId: plant.gardenId,
        plantIds: [plant.id],
        operationType: manualEntry.operationType,
        operationDate: manualEntry.operationDate,
        operationTime: manualEntry.operationTime || undefined,
        quantity: Number.isFinite(normalizedQuantity as number) ? normalizedQuantity : undefined,
        unit: manualEntry.unit?.trim() || undefined,
        productName: manualEntry.productName?.trim() || undefined,
        notes: normalizedNotes || undefined,
        sourceType: manualEntry.sourceType,
        propagateToPlants: false
      });

      if (!result.success) {
        alert(`Errore registrazione intervento:\n${(result.errors || ['Errore sconosciuto']).join('\n')}`);
        return;
      }

      setShowManualEntry(false);
      setManualEntry(prev => ({
        ...prev,
        operationDate: new Date().toISOString().split('T')[0],
        operationTime: new Date().toTimeString().slice(0, 5),
        quantity: '',
        productName: '',
        notes: ''
      }));
      await loadOperations();
    } catch (error) {
      console.error('Error registering manual operation:', error);
      alert('Errore durante la registrazione dell\'intervento');
    } finally {
      setSavingManualEntry(false);
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

  const getOperationSourceMeta = (operation: PlantOperation): {
    label: string;
    className: string;
    icon: React.ReactNode;
  } => {
    if ((operation as any).isFieldRowOperation) {
      return {
        label: 'Orchestratore Filare',
        className: 'bg-blue-100 text-blue-700',
        icon: <Bot size={12} />
      };
    }

    const sourceType = operation.sourceType
      || ((operation as any).parentOperationTable === 'iot_sensor' ? 'iot' : undefined)
      || ((operation as any).parentOperationTable === 'manual_orchestrator' ? 'manual' : undefined)
      || ((operation.notes || '').includes('[IOT]') ? 'iot' : undefined)
      || ((operation.notes || '').includes('[MANUAL]') ? 'manual' : undefined)
      || 'manual';

    if (sourceType === 'iot') {
      return {
        label: 'IOT',
        className: 'bg-violet-100 text-violet-700',
        icon: <Cpu size={12} />
      };
    }

    if (sourceType === 'orchestrator_auto' || sourceType === 'orchestrator_sync') {
      return {
        label: 'Orchestratore',
        className: 'bg-indigo-100 text-indigo-700',
        icon: <Bot size={12} />
      };
    }

    return {
      label: 'Manuale',
      className: 'bg-emerald-100 text-emerald-700',
      icon: <Save size={12} />
    };
  };

  const filteredOperations = activeTab === 'all' 
    ? operations 
    : operations.filter(op => op.operationType === activeTab);

  const plantingDateValue = plant.plantedDate || plant.plantingDate;
  const plantingDate = plantingDateValue ? new Date(plantingDateValue) : null;
  const hasValidPlantingDate = !!plantingDate && !isNaN(plantingDate.getTime());
  const orchestratorActive = plant.orchestratorEnabled !== false;

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

          {/* Carta d'Identità */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Carta d'Identità Pianta
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-green-100 text-xs mb-1">📅 Piantata il</div>
                <div className="font-medium">
                  {hasValidPlantingDate ? (
                    plantingDate!.toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  ) : (
                    'Data non disponibile'
                  )}
                </div>
                <div className="text-green-100 text-xs mt-1">
                  {hasValidPlantingDate ? (
                    `${Math.floor((new Date().getTime() - plantingDate!.getTime()) / (1000 * 60 * 60 * 24))} giorni fa`
                  ) : (
                    'N/D'
                  )}
                </div>
              </div>
              
              {plant.plantingContext ? (
                <>
                  {/* Meteo */}
                  {(plant.plantingContext.weather?.temp || plant.plantingContext.weather?.temperature) && (
                    <div>
                      <div className="text-green-100 text-xs mb-1">🌡️ Meteo Impianto</div>
                      <div className="font-medium">
                        {plant.plantingContext.weather?.temp || plant.plantingContext.weather?.temperature}°C
                      </div>
                      <div className="text-green-100 text-xs mt-1">
                        {plant.plantingContext.weather?.condition || 
                         plant.plantingContext.weather?.description || 'N/D'}
                      </div>
                      {plant.plantingContext.weather?.humidity && (
                        <div className="text-green-100 text-xs">
                          💧 {plant.plantingContext.weather.humidity}%
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Fase Lunare */}
                  {(plant.plantingContext.lunar || plant.plantingContext.moon) && (
                    <div>
                      <div className="text-green-100 text-xs mb-1">🌙 Fase Lunare</div>
                      <div className="font-medium">
                        {(plant.plantingContext.lunar?.phaseEmoji || plant.plantingContext.moon?.emoji || '🌙')} {' '}
                        {plant.plantingContext.lunar?.phase || plant.plantingContext.moon?.phase || 'N/D'}
                      </div>
                      <div className="text-green-100 text-xs mt-1">
                        {(plant.plantingContext.lunar?.isWaxing || plant.plantingContext.moon?.waxing) ? 'Crescente' : 'Calante'}
                      </div>
                      {(plant.plantingContext.lunar?.illumination || plant.plantingContext.moon?.illumination) && (
                        <div className="text-green-100 text-xs">
                          ✨ {plant.plantingContext.lunar?.illumination || plant.plantingContext.moon?.illumination}% illuminata
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Stagione */}
                  {plant.plantingContext.season && (
                    <div>
                      <div className="text-green-100 text-xs mb-1">🌍 Stagione</div>
                      <div className="font-medium capitalize">
                        {plant.plantingContext.season === 'spring' ? '🌸 Primavera' :
                         plant.plantingContext.season === 'summer' ? '☀️ Estate' :
                         plant.plantingContext.season === 'autumn' ? '🍂 Autunno' : 
                         plant.plantingContext.season === 'winter' ? '❄️ Inverno' : plant.plantingContext.season}
                      </div>
                    </div>
                  )}
                  
                  {/* Ore di luce */}
                  {plant.plantingContext.daylight && (
                    <div>
                      <div className="text-green-100 text-xs mb-1">☀️ Ore di Luce</div>
                      <div className="font-medium">
                        {plant.plantingContext.daylight.hours ? 
                          `${plant.plantingContext.daylight.hours.toFixed(1)}h` : 'N/D'}
                      </div>
                      {plant.plantingContext.daylight.sunrise && plant.plantingContext.daylight.sunset && (
                        <div className="text-green-100 text-xs mt-1">
                          🌅 {plant.plantingContext.daylight.sunrise} - 🌇 {plant.plantingContext.daylight.sunset}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="col-span-2 text-center py-4">
                  <div className="text-green-100 text-sm">
                    ℹ️ Contesto ambientale non disponibile
                  </div>
                  <div className="text-green-100 text-xs mt-1">
                    Questa pianta è stata creata prima dell'implementazione del sistema di tracciamento
                  </div>
                </div>
              )}
              
              {plant.photos && plant.photos.length > 0 && (
                <div>
                  <div className="text-green-100 text-xs mb-1">📸 Ultima Foto</div>
                  <div className="font-medium">
                    {(() => {
                      // Trova l'operazione più recente con foto
                      const photoOps = operations.filter(op => op.photos && op.photos.length > 0);
                      if (photoOps.length > 0) {
                        const lastPhotoOp = photoOps[0]; // Già ordinato per data
                        const daysSince = Math.floor((new Date().getTime() - new Date(lastPhotoOp.date).getTime()) / (1000 * 60 * 60 * 24));
                        return `${daysSince} giorni fa`;
                      }
                      return 'Nessuna foto';
                    })()}
                  </div>
                </div>
              )}
              
              {plant.source && (
                <div>
                  <div className="text-green-100 text-xs mb-1">🌱 Origine</div>
                  <div className="font-medium">
                    {plant.source === 'seed' ? '🌾 Da seme' :
                     plant.source === 'nursery' ? '🏪 Vivaio' :
                     plant.source === 'transplant' ? '🔄 Trapianto' : 'N/D'}
                  </div>
                </div>
              )}
            </div>
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

        {/* Orchestratore + registrazione manuale/IOT */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Bot size={16} className="text-blue-600" />
                Orchestratore Interventi Pianta
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${orchestratorActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {orchestratorActive ? 'Attivo' : 'Solo Manuale'}
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Gli eventi automatici (filare/IOT) e quelli manuali sono tracciati nello stesso diario orchestrato.
              </p>
            </div>
            <button
              onClick={() => setShowManualEntry(prev => !prev)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Registra Intervento
            </button>
          </div>

          {showManualEntry && (
            <div className="bg-white border border-blue-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Origine</label>
                <select
                  value={manualEntry.sourceType}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, sourceType: e.target.value as 'manual' | 'iot' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="manual">Manuale</option>
                  <option value="iot">IOT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo intervento</label>
                <select
                  value={manualEntry.operationType}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, operationType: e.target.value as 'watering' | 'fertilizing' | 'treatment' | 'work' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="watering">Irrigazione</option>
                  <option value="fertilizing">Fertilizzazione</option>
                  <option value="treatment">Trattamento</option>
                  <option value="work">Lavorazione</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={manualEntry.operationDate}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, operationDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ora</label>
                <input
                  type="time"
                  value={manualEntry.operationTime}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, operationTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantità</label>
                <input
                  type="number"
                  step="0.01"
                  value={manualEntry.quantity}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="es. 2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unità</label>
                <input
                  type="text"
                  value={manualEntry.unit}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="L, g, ml..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Prodotto (opzionale)</label>
                <input
                  type="text"
                  value={manualEntry.productName}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="es. NPK 20-20-20, rame, ecc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={manualEntry.notes}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  placeholder="Dettagli intervento..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  onClick={registerManualOperation}
                  disabled={savingManualEntry || !manualEntry.operationDate || !manualEntry.operationType}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingManualEntry ? 'Salvataggio...' : 'Salva Intervento'}
                </button>
              </div>
            </div>
          )}
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
                  {(() => {
                    const sourceMeta = getOperationSourceMeta(operation);
                    return (
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getOperationIcon(operation.operationType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {getOperationLabel(operation.operationType)}
                          </h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded inline-flex items-center gap-1 ${sourceMeta.className}`}>
                            {sourceMeta.icon}
                            {sourceMeta.label}
                          </span>
                          {(operation as any).isFieldRowOperation && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              🌾 Filare
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
                    );
                  })()}

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
                          <span className="ml-2 font-medium">
                            {operation.waterAmount || operation.quantity || 'N/A'} {operation.unit || 'L'}
                          </span>
                        </div>
                      </>
                    )}

                    {operation.operationType === 'fertilizing' && (
                      <>
                        <div>
                          <span className="text-gray-600">Tipo:</span>
                          <span className="ml-2 font-medium">{operation.fertilizerType || operation.productName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dosaggio:</span>
                          <span className="ml-2 font-medium">
                            {operation.dosage || (operation.quantity ? `${operation.quantity} ${operation.unit || ''}`.trim() : 'N/A')}
                          </span>
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
                          <span className="ml-2 font-medium">{operation.product || operation.productName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dosaggio:</span>
                          <span className="ml-2 font-medium">
                            {operation.dosage || (operation.quantity ? `${operation.quantity} ${operation.unit || ''}`.trim() : 'N/A')}
                          </span>
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
                          <span className="ml-2 font-medium">{operation.workType || operation.productName || 'Intervento manuale'}</span>
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
                        <span className="font-medium">Note:</span> {operation.notes.replace(/^\[(MANUAL|IOT)\]\s*/i, '')}
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
                Piantata il: {hasValidPlantingDate ? plantingDate!.toLocaleDateString('it-IT') : 'Data non disponibile'}
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
