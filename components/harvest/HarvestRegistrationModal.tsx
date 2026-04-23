'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Sprout, AlertCircle, CheckCircle } from 'lucide-react';
import type { GardenTask, HarvestLogData } from '@/types';
import { addPassiveEventListener } from '@/utils/passiveEventListeners';

interface Harvest {
  id: string;
  plant_name: string;
  variety?: string;
  quantity: number;
  unit: HarvestLogData['unit'];
  harvest_date: string;
  rating?: HarvestLogData['rating']; // Changed from quality_rating to match database
  notes?: string;
  garden_id: string;
  zone_id?: string;
  field_id?: string;
  task_id?: string; // Collegamento al task di coltivazione
  is_tracked?: boolean; // true se collegato a una coltura tracciata
  created_at: string;
}

const HARVEST_UNITS: HarvestLogData['unit'][] = ['kg', 'g', 'units'];

interface PlantedCrop {
  taskId: string;
  plantName: string;
  variety?: string;
  plantingDate: string;
  stage: string;
  quantity?: number;
  locationType: string;
  zoneId?: string;
  rowId?: string;
  isReadyToHarvest: boolean;
  daysFromPlanting: number;
  expectedHarvestDate?: string;
}

export interface HarvestLaunchRequest {
  key: number;
  sourceTaskId: string;
  plantName?: string;
  date?: string;
  zoneId?: string;
  rowId?: string;
  rowNumber?: string;
}

interface HarvestRegistrationModalProps {
  harvest?: Harvest | null;
  gardenId: string;
  plantedCrops: GardenTask[]; // Colture effettivamente piantate
  launchContext?: HarvestLaunchRequest | null;
  onSave: (harvest: Omit<Harvest, 'id' | 'created_at'>) => void | Promise<void>;
  onClose: () => void;
}

export const HarvestRegistrationModal: React.FC<HarvestRegistrationModalProps> = ({
  harvest,
  gardenId,
  plantedCrops,
  launchContext,
  onSave,
  onClose
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<HarvestLogData['unit']>('kg');
  const [harvestDate, setHarvestDate] = useState('');
  const [qualityRating, setQualityRating] = useState<HarvestLogData['rating'] | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtra e prepara le colture piantate per il raccolto
  const availableCrops = React.useMemo(() => {
    const now = new Date();
    
    return (plantedCrops || [])
      .filter(task => {
        // Solo task di semina/trapianto completati
        if (!task.completed || !['Sowing', 'Transplant'].includes(task.taskType)) {
          return false;
        }
        
        // Calcola giorni dalla semina/trapianto
        const plantingDate = new Date(task.date);
        const daysFromPlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Considera pronto per il raccolto se:
        // - È in fase di fruttificazione/raccolta
        // - Sono passati almeno 30 giorni (soglia minima)
        const isReadyToHarvest = task.stage === 'Fruiting' || 
                                task.stage === 'Harvested' || 
                                daysFromPlanting >= 30;
        
        return isReadyToHarvest;
      })
      .map(task => {
        const plantingDate = new Date(task.date);
        const daysFromPlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          taskId: task.id,
          plantName: task.plantName,
          variety: task.variety,
          plantingDate: task.date,
          stage: task.stage || 'Unknown',
          quantity: task.quantity || task.currentQuantity,
          locationType: task.locationType || 'Ground',
          zoneId: task.zoneId,
          rowId: task.rowId,
          isReadyToHarvest: task.stage === 'Fruiting' || daysFromPlanting >= 60,
          daysFromPlanting,
          expectedHarvestDate: task.expectedTransplantDate // Potremmo calcolare una data di raccolto stimata
        } as PlantedCrop;
      })
      .sort((a, b) => {
        // Ordina per prontezza al raccolto e poi per giorni dalla semina
        if (a.isReadyToHarvest && !b.isReadyToHarvest) return -1;
        if (!a.isReadyToHarvest && b.isReadyToHarvest) return 1;
        return b.daysFromPlanting - a.daysFromPlanting;
      });
  }, [plantedCrops]);

  useEffect(() => {
    if (harvest) {
      // Modalità modifica
      setSelectedTaskId(harvest.task_id || '');
      setIsManualEntry(!harvest.task_id);
      setPlantName(harvest.plant_name);
      setVariety(harvest.variety || '');
      setQuantity(harvest.quantity.toString());
      setUnit(harvest.unit);
      setHarvestDate(harvest.harvest_date);
      setQualityRating(harvest.rating || null);
      setNotes(harvest.notes || '');
    } else {
      // Modalità creazione - imposta data di oggi
      setHarvestDate(new Date().toISOString().split('T')[0]);
      if (launchContext) {
        setSelectedTaskId(launchContext.sourceTaskId);
        setHarvestDate(launchContext.date || new Date().toISOString().split('T')[0]);
        setPlantName(launchContext.plantName || '');
        setNotes(
          [
            launchContext.plantName ? `Task sorgente per ${launchContext.plantName}` : null,
            launchContext.zoneId ? `Zona ${launchContext.zoneId}` : null,
            launchContext.rowNumber ? `Fila ${launchContext.rowNumber}` : launchContext.rowId ? `Riga ${launchContext.rowId}` : null,
          ].filter(Boolean).join(' • ')
        );
      }
    }

    // Gestione tasto ESC per chiudere il modal
    const handleEscKey = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        handleClose();
      }
    };

    const removeEscListener = addPassiveEventListener(document, 'keydown', handleEscKey);
    
    // Previeni lo scroll del body quando il modal è aperto
    document.body.style.overflow = 'hidden';

    return () => {
      removeEscListener();
      document.body.style.overflow = 'unset';
    };
  }, [harvest, launchContext, onClose]);

  useEffect(() => {
    if (harvest || !launchContext) {
      return;
    }

    const trackedCrop = availableCrops.find((crop) => crop.taskId === launchContext.sourceTaskId);
    if (trackedCrop) {
      setIsManualEntry(false);
      setSelectedTaskId(trackedCrop.taskId);
      return;
    }

    setIsManualEntry(true);
    if (launchContext.plantName) {
      setPlantName(launchContext.plantName);
    }
  }, [availableCrops, harvest, launchContext]);

  // Quando si seleziona una coltura tracciata, popola automaticamente i campi
  useEffect(() => {
    if (selectedTaskId && !isManualEntry) {
      const selectedCrop = availableCrops.find(crop => crop.taskId === selectedTaskId);
      if (selectedCrop) {
        setPlantName(selectedCrop.plantName);
        setVariety(selectedCrop.variety || '');
        // Suggerisci unità di misura basata sul tipo di pianta
        const suggestedUnit = getSuggestedUnit(selectedCrop.plantName);
        setUnit(suggestedUnit);
      }
    }
  }, [selectedTaskId, isManualEntry, availableCrops]);

  const getSuggestedUnit = (plantName: string): HarvestLogData['unit'] => {
    const lowerName = plantName.toLowerCase();
    
    // Frutti grandi/ortaggi da peso
    if (['pomodoro', 'zucchina', 'melanzana', 'peperone', 'cetriolo', 'zucca'].some(p => lowerName.includes(p))) {
      return 'kg';
    }
    
    // Verdure a foglia/erbe
    if (['lattuga', 'spinaci', 'rucola', 'basilico', 'prezzemolo', 'salvia'].some(p => lowerName.includes(p))) {
      return 'units';
    }
    
    // Radici/tuberi piccoli
    if (['ravanello', 'carota', 'cipolla', 'aglio'].some(p => lowerName.includes(p))) {
      return 'units';
    }
    
    // Legumi
    if (['fagiolo', 'pisello', 'fava'].some(p => lowerName.includes(p))) {
      return 'kg';
    }
    
    // Default
    return 'kg';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startTime = performance.now();
    console.log('Form submitted!', { isManualEntry, plantName, quantity, harvestDate });
    
    // Validazione rapida
    if (isManualEntry && (!plantName.trim() || !quantity || !harvestDate)) {
      alert('Compila tutti i campi obbligatori per l\'inserimento manuale');
      return;
    }
    
    if (!isManualEntry && !selectedTaskId && availableCrops.length > 0) {
      alert('Seleziona una coltura da raccogliere o passa all\'inserimento manuale');
      return;
    }
    
    if (!isManualEntry && availableCrops.length === 0) {
      alert('Non ci sono colture tracciate disponibili. Usa l\'inserimento manuale.');
      return;
    }

    setLoading(true);
    
    try {
      // Ottimizza la ricerca della coltura selezionata
      const selectedCrop = selectedTaskId ? 
        availableCrops.find(crop => crop.taskId === selectedTaskId) : null;
      
      const harvestData = {
        plant_name: plantName.trim(),
        variety: variety.trim() || undefined,
        quantity: parseFloat(quantity),
        unit,
        harvest_date: harvestDate,
        rating: qualityRating ?? undefined,
        notes: notes.trim() || undefined,
        garden_id: gardenId,
        zone_id: selectedCrop?.zoneId,
        field_id: selectedCrop?.rowId,
        task_id: selectedTaskId || undefined,
        is_tracked: !isManualEntry && !!selectedTaskId
      };

      console.log('Saving harvest data:', harvestData);
      
      // Usa Promise.resolve per gestire sia sync che async onSave
      await Promise.resolve(onSave(harvestData));
      
      const endTime = performance.now();
      console.log(`Form submission took ${endTime - startTime}ms`);
      
      // Chiudi il modal dopo il salvataggio
      handleClose();
    } catch (error) {
      console.error('Error saving harvest:', error);
      alert('Errore nel salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Assicurati che il body scroll sia ripristinato
    document.body.style.overflow = 'unset';
    
    // Chiama la funzione onClose passata dal parent
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Chiudi il modal solo se si clicca direttamente sull'overlay
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Previeni la propagazione dell'evento per evitare la chiusura accidentale
    e.stopPropagation();
  };

  const commonPlants = [
    'Pomodoro', 'Zucchina', 'Melanzana', 'Peperone', 'Cetriolo',
    'Lattuga', 'Spinaci', 'Rucola', 'Basilico', 'Prezzemolo',
    'Carota', 'Ravanello', 'Cipolla', 'Aglio', 'Patata',
    'Fagiolo', 'Pisello', 'Fava', 'Fragola', 'Mela'
  ];

  const units = ['kg', 'g', 'pz', 'mazzi', 'cassette', 'litri'];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Fruiting': return 'text-green-600 bg-green-50';
      case 'Flowering': return 'text-yellow-600 bg-yellow-50';
      case 'Vegetative': return 'text-blue-600 bg-blue-50';
      case 'Harvested': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {harvest ? 'Modifica Raccolto' : 'Nuovo Raccolto'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 -m-2 touch-manipulation"
            aria-label="Chiudi modal"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Selezione Tipo di Registrazione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo di registrazione
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsManualEntry(false);
                  setSelectedTaskId('');
                  setPlantName('');
                  setVariety('');
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all touch-manipulation ${
                  !isManualEntry
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 active:border-green-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sprout className="text-green-600" size={20} />
                  <span className="font-medium text-base">Coltura Tracciata</span>
                </div>
                <p className="text-sm text-gray-600">
                  Raccolto da piante che hai seminato/trapiantato
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsManualEntry(true);
                  setSelectedTaskId('');
                  setPlantName('');
                  setVariety('');
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all touch-manipulation ${
                  isManualEntry
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 active:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="text-blue-600" size={20} />
                  <span className="font-medium text-base">Inserimento Manuale</span>
                </div>
                <p className="text-sm text-gray-600">
                  Raccolto non tracciato nel sistema
                </p>
              </button>
            </div>
          </div>

          {/* Selezione Coltura Tracciata */}
          {!isManualEntry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona coltura da raccogliere *
              </label>
              
              {availableCrops.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-yellow-600" size={20} />
                    <div>
                      <p className="font-medium text-yellow-800">Nessuna coltura pronta</p>
                      <p className="text-sm text-yellow-700">
                        Non ci sono colture tracciate pronte per il raccolto. 
                        Usa "Inserimento Manuale" per registrare raccolti non tracciati.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualEntry(true);
                        setSelectedTaskId('');
                        setPlantName('');
                        setVariety('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Passa a Inserimento Manuale
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={!isManualEntry}
                >
                  <option value="">Seleziona una coltura...</option>
                  {availableCrops.map((crop) => (
                    <option key={crop.taskId} value={crop.taskId}>
                      {crop.plantName} {crop.variety ? `(${crop.variety})` : ''} - 
                      {crop.daysFromPlanting} giorni - {crop.stage}
                      {crop.quantity ? ` - ${crop.quantity} piante` : ''}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Info coltura selezionata */}
              {selectedTaskId && availableCrops.find(c => c.taskId === selectedTaskId) && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  {(() => {
                    const crop = availableCrops.find(c => c.taskId === selectedTaskId)!;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-900">
                            {crop.plantName} {crop.variety ? `(${crop.variety})` : ''}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(crop.stage)}`}>
                            {crop.stage}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                          <div>
                            <span className="font-medium">Piantato:</span> {new Date(crop.plantingDate).toLocaleDateString('it-IT')}
                          </div>
                          <div>
                            <span className="font-medium">Giorni:</span> {crop.daysFromPlanting}
                          </div>
                          {crop.quantity && (
                            <div>
                              <span className="font-medium">Piante:</span> {crop.quantity}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Ambiente:</span> {crop.locationType}
                          </div>
                        </div>
                        {crop.isReadyToHarvest && (
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Pronto per il raccolto</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Inserimento Manuale - Nome Pianta */}
          {isManualEntry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pianta *
              </label>
              <input
                type="text"
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                list="plants"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome della pianta"
                required
              />
              <datalist id="plants">
                {commonPlants.map(plant => (
                  <option key={plant} value={plant} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Questo raccolto non sarà collegato al sistema di tracciamento
              </p>
            </div>
          )}

          {/* Varietà */}
          {(isManualEntry || selectedTaskId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varietà
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Varietà (opzionale)"
                disabled={!isManualEntry && selectedTaskId ? !!availableCrops.find(c => c.taskId === selectedTaskId)?.variety : false}
              />
            </div>
          )}

          {/* Quantità e Unità */}
          {(isManualEntry || selectedTaskId) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantità *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unità *
                </label>
                <select
                  value={unit}
                  onChange={(e) => {
                    const nextUnit = e.target.value as HarvestLogData['unit'];
                    if (HARVEST_UNITS.includes(nextUnit)) {
                      setUnit(nextUnit);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Data Raccolto */}
          {(isManualEntry || selectedTaskId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Raccolto *
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Qualità */}
          {(isManualEntry || selectedTaskId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualità
              </label>
              <div className="flex items-center gap-2">
                {([1, 2, 3, 4, 5] as HarvestLogData['rating'][]).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setQualityRating(qualityRating === rating ? null : rating)}
                    className={`p-1 rounded ${
                      qualityRating && qualityRating >= rating
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star size={24} fill={qualityRating && qualityRating >= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
                {qualityRating && (
                  <span className="text-sm text-gray-600 ml-2">
                    {qualityRating}/5
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Note */}
          {(isManualEntry || selectedTaskId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Note aggiuntive (opzionale)"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 touch-manipulation text-base sm:text-sm font-medium"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-base sm:text-sm font-medium"
              disabled={loading || (
                !isManualEntry && !selectedTaskId && availableCrops.length > 0
              ) || (
                isManualEntry && (!plantName.trim() || !quantity || !harvestDate)
              )}
            >
              {loading ? 'Salvando...' : harvest ? 'Aggiorna' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
