import React, { useState } from 'react';
import { SaplingBatch, SaplingType, createSaplingBatch, getSaplingTimeline, isReadyToOrchard, addPhotoToLog, updateSurvivalCount, updateSaplingPhase, recordPlanting, linkToSpecializedCrop } from '../services/saplingService';
import { Garden } from '../types';
import { TreePine, Calendar, Camera, AlertCircle, CheckCircle, Clock, Upload, X, MapPin } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import { fruitTreeMasterSheets } from '../data/fruitTreeMasterSheets';
import { oliveMasterSheets } from '../data/oliveMasterSheets';
import { vineMasterSheets } from '../data/vineMasterSheets';

interface SaplingManagerProps {
  garden: Garden;
  batches: SaplingBatch[];
  onBatchUpdate: (batch: SaplingBatch) => void;
  onBatchCreate: (batch: SaplingBatch) => void;
  onCreateOrchard?: (batch: SaplingBatch) => void; // Callback per creare impianto specializzato
}

const SaplingManager: React.FC<SaplingManagerProps> = ({ 
  garden, 
  batches, 
  onBatchUpdate, 
  onBatchCreate,
  onCreateOrchard 
}) => {
  const { can, isPro, checkLimit, limit } = useTier();
  const [isCreating, setIsCreating] = useState(false);
  const [newBatch, setNewBatch] = useState({
    plantName: '',
    variety: '',
    saplingType: 'FruitTree' as SaplingType,
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    location: '',
    rootstock: '',
    spacing: ''
  });
  const [selectedBatch, setSelectedBatch] = useState<SaplingBatch | null>(null);

  // Verifica limiti Free
  const batchesLimit = checkLimit('maxSaplingBatches', batches.length);
  const canCreateBatch = isPro || batchesLimit.allowed;

  const getAvailablePlants = (type: SaplingType) => {
    switch (type) {
      case 'FruitTree':
        return fruitTreeMasterSheets;
      case 'Olive':
        return oliveMasterSheets;
      case 'Vine':
        return vineMasterSheets;
      default:
        return [];
    }
  };

  const handleCreateBatch = () => {
    if (!canCreateBatch) {
      alert(`Limite raggiunto: massimo ${limit('maxSaplingBatches')} batch alberelli in versione Free. Passa a Pro per batch illimitati.`);
      return;
    }

    if (!newBatch.location.trim()) {
      alert('Inserisci la posizione dove piantare gli alberelli');
      return;
    }

    try {
      const batch = createSaplingBatch(
        newBatch.plantName,
        newBatch.saplingType,
        newBatch.purchaseDate,
        newBatch.quantity,
        newBatch.location,
        garden.id,
        newBatch.variety || undefined,
        newBatch.rootstock || undefined,
        newBatch.spacing || undefined
      );
      onBatchCreate(batch);
      setIsCreating(false);
      setNewBatch({
        plantName: '',
        variety: '',
        saplingType: 'FruitTree',
        purchaseDate: new Date().toISOString().split('T')[0],
        quantity: 1,
        location: '',
        rootstock: '',
        spacing: ''
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handlePhotoUpload = (batch: SaplingBatch, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const currentPhotos = batch.photoLog?.length || 0;
      const photosLimit = checkLimit('maxPhotosPerBatch', currentPhotos);
      
      if (!isPro && !photosLimit.allowed) {
        alert(`Limite raggiunto: massimo ${limit('maxPhotosPerBatch')} foto per batch in versione Free.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = addPhotoToLog(batch, base64);
        onBatchUpdate(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordPlanting = (batch: SaplingBatch) => {
    const plantingDate = prompt('Inserisci data messa a dimora (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (plantingDate) {
      const updated = recordPlanting(batch, plantingDate);
      onBatchUpdate(updated);
    }
  };

  const handleCreateOrchard = (batch: SaplingBatch) => {
    if (onCreateOrchard) {
      onCreateOrchard(batch);
    }
  };

  const getPhaseColor = (phase: SaplingBatch['phase']) => {
    switch (phase) {
      case 'Purchased': return 'bg-gray-100 text-gray-700';
      case 'Planted': return 'bg-blue-100 text-blue-700';
      case 'Establishing': return 'bg-yellow-100 text-yellow-700';
      case 'Growing': return 'bg-green-100 text-green-700';
      case 'ReadyToOrchard': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPhaseLabel = (phase: SaplingBatch['phase']) => {
    const labels = {
      'Purchased': 'Acquistato',
      'Planted': 'Messo a dimora',
      'Establishing': 'Attecchimento',
      'Growing': 'Crescita',
      'ReadyToOrchard': 'Pronto per Impianto'
    };
    return labels[phase];
  };

  const getTypeLabel = (type: SaplingType) => {
    const labels = {
      'FruitTree': 'Albero da Frutto',
      'Olive': 'Olivo',
      'Vine': 'Vite'
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-col md:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <TreePine size={24} className="text-green-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestione Alberelli</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isPro && (
            <div className="text-xs text-gray-500">
              {batches.length}/{limit('maxSaplingBatches')} batch
            </div>
          )}
          <button
            onClick={() => setIsCreating(!isCreating)}
            disabled={!canCreateBatch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            + Nuovo Alberello
          </button>
        </div>
      </div>

      {!isPro && !batchesLimit.allowed && (
        <UpgradePrompt
          feature="Batch Alberelli Illimitati"
          limit={`Massimo ${limit('maxSaplingBatches')} batch in versione Free`}
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      )}

      {/* Form Creazione */}
      {isCreating && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-green-200">
          <h3 className="font-bold text-lg mb-4">Nuovo Alberello</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tipo</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={newBatch.saplingType}
                onChange={(e) => {
                  setNewBatch({ ...newBatch, saplingType: e.target.value as SaplingType, plantName: '' });
                }}
              >
                <option value="FruitTree">Albero da Frutto</option>
                <option value="Olive">Olivo</option>
                <option value="Vine">Vite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Pianta</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={newBatch.plantName}
                onChange={(e) => setNewBatch({ ...newBatch, plantName: e.target.value })}
              >
                <option value="">Seleziona pianta</option>
                {getAvailablePlants(newBatch.saplingType).map(p => (
                  <option key={p.id} value={p.commonName}>{p.commonName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Varietà (opzionale)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.variety}
                  onChange={(e) => setNewBatch({ ...newBatch, variety: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Data Acquisto</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.purchaseDate}
                  onChange={(e) => setNewBatch({ ...newBatch, purchaseDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Quantità</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Posizione *</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.location}
                  onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                  placeholder="Es: Frutteto Nord, Zona A..."
                />
              </div>
            </div>
            {(newBatch.saplingType === 'FruitTree' || newBatch.saplingType === 'Vine') && (
              <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Portinnesto (opzionale)</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={newBatch.rootstock}
                    onChange={(e) => setNewBatch({ ...newBatch, rootstock: e.target.value })}
                    placeholder="Es: M9, 1103P..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Distanza (opzionale)</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    value={newBatch.spacing}
                    onChange={(e) => setNewBatch({ ...newBatch, spacing: e.target.value })}
                    placeholder="Es: 3m x 4m"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCreateBatch}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                Crea
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista Batch */}
      {batches.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-xl text-center">
          <TreePine size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Nessun alberello registrato. Crea un nuovo batch per iniziare!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map(batch => {
            const timeline = getSaplingTimeline(batch);
            const readyCheck = isReadyToOrchard(batch, garden);
            
            return (
              <div key={batch.id} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-col md:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{batch.plantName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPhaseColor(batch.phase)}`}>
                        {getPhaseLabel(batch.phase)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Tipo:</span>
                        <span>{getTypeLabel(batch.saplingType)}</span>
                      </div>
                      {batch.variety && (
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">Varietà:</span>
                          <span>{batch.variety}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MapPin size={14} />
                        <span>{batch.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Quantità:</span>
                        <span>{String(batch.currentQuantity || batch.quantity)}/{String(batch.quantity)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {!batch.plantingDate && batch.phase === 'Purchased' && (
                      <button
                        onClick={() => handleRecordPlanting(batch)}
                        className="px-4 py-3 text-base bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        Registra Messa a Dimora
                      </button>
                    )}
                    {readyCheck.ready && !batch.specializedCropId && (
                      <button
                        onClick={() => handleCreateOrchard(batch)}
                        className="px-4 py-3 text-base bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                      >
                        Crea Impianto
                      </button>
                    )}
                    {batch.specializedCropId && (
                      <div className="px-4 py-3 text-base bg-green-100 text-green-800 rounded-lg text-sm font-semibold text-center">
                        Impianto Creato
                      </div>
                    )}
                  </div>
                </div>

                {timeline.nextPhase && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock size={16} className="text-blue-600" />
                      <span className="text-blue-800">
                        Prossima fase: <strong>{getPhaseLabel(timeline.nextPhase)}</strong>
                        {timeline.daysToNextPhase !== undefined && (
                          <span> tra {timeline.daysToNextPhase} giorni</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {readyCheck.warnings && readyCheck.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    {readyCheck.warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-orange-800">
                        <AlertCircle size={16} />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <Camera size={16} className="text-gray-600" />
                    <span className="text-gray-600">Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(batch, e)}
                    />
                  </label>
                  <button
                    onClick={() => setSelectedBatch(selectedBatch?.id === batch.id ? null : batch)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedBatch?.id === batch.id ? 'Nascondi' : 'Dettagli'}
                  </button>
                </div>

                {selectedBatch?.id === batch.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <div><strong>Data acquisto:</strong> {new Date(batch.purchaseDate).toLocaleDateString('it-IT')}</div>
                    {batch.plantingDate && (
                      <div><strong>Data messa a dimora:</strong> {new Date(batch.plantingDate).toLocaleDateString('it-IT')}</div>
                    )}
                    {batch.expectedEstablishmentDate && (
                      <div><strong>Attecchimento previsto:</strong> {new Date(batch.expectedEstablishmentDate).toLocaleDateString('it-IT')}</div>
                    )}
                    {batch.rootstock && (
                      <div><strong>Portinnesto:</strong> {batch.rootstock}</div>
                    )}
                    {batch.spacing && (
                      <div><strong>Distanza:</strong> {batch.spacing}</div>
                    )}
                    {batch.notes && (
                      <div><strong>Note:</strong> {batch.notes}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SaplingManager;

