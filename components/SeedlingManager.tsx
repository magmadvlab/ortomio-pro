import React, { useState, useEffect } from 'react';
import { SeedlingBatch } from '../services/seedlingService';
import { Garden, PlantMasterSheet } from '../types';
import { createSeedlingBatch, createPurchasedSeedlingBatch, getSeedlingTimeline, shouldStartHardening, isReadyToTransplant, addPhotoToLog, updateSurvivalCount, updateBatchPhase } from '../services/seedlingService';
import { calculateSeedlingTimeline } from '../logic/seedlingTimelineEngine';
import { getAllMasterSheets } from '../services/plantMasterService';
import { Sprout, Calendar, Camera, AlertCircle, CheckCircle, Clock, TrendingUp, Upload, X, ArrowRight, Eye } from 'lucide-react';
import { useTier } from '../packages/core/hooks/useTier';
import UpgradePrompt from './UpgradePrompt';
import TransplantToOrchardModal from './vivaio/TransplantToOrchardModal';

interface SeedlingManagerProps {
  garden: Garden;
  batches: SeedlingBatch[];
  onBatchUpdate: (batch: SeedlingBatch) => void;
  onBatchCreate: (batch: SeedlingBatch) => void;
}

const SeedlingManager: React.FC<SeedlingManagerProps> = ({ garden, batches, onBatchUpdate, onBatchCreate }) => {
  const { can, isPro, checkLimit, limit } = useTier();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPurchased, setIsCreatingPurchased] = useState(false);
  const [newBatch, setNewBatch] = useState({
    plantName: '',
    variety: '',
    sowingDate: new Date().toISOString().split('T')[0],
    quantity: 10,
    location: 'Indoor' as const
  });
  const [newPurchasedBatch, setNewPurchasedBatch] = useState({
    plantName: '',
    variety: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    nurseryName: '',
    notes: ''
  });
  const [selectedBatch, setSelectedBatch] = useState<SeedlingBatch | null>(null);
  const [showTransplantModal, setShowTransplantModal] = useState(false);
  const [batchToTransplant, setBatchToTransplant] = useState<SeedlingBatch | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  const masterSheets = getAllMasterSheets();

  // Verifica limiti Free
  const batchesLimit = checkLimit('maxSeedlingBatches', batches.length);
  const canCreateBatch = isPro || batchesLimit.allowed;

  const handleCreateBatch = () => {
    // Verifica limite batch
    if (!canCreateBatch) {
      alert(`Limite raggiunto: massimo ${limit('maxSeedlingBatches')} batch semenzai in versione Free. Passa a Pro per batch illimitati.`);
      return;
    }

    try {
      const batch = createSeedlingBatch(
        newBatch.plantName,
        newBatch.sowingDate,
        newBatch.quantity,
        newBatch.location,
        garden.id,
        newBatch.variety || undefined
      );
      onBatchCreate(batch);
      setIsCreating(false);
      setNewBatch({
        plantName: '',
        variety: '',
        sowingDate: new Date().toISOString().split('T')[0],
        quantity: 10,
        location: 'Indoor'
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleCreatePurchasedBatch = () => {
    // Verifica limite batch
    if (!canCreateBatch) {
      alert(`Limite raggiunto: massimo ${limit('maxSeedlingBatches')} batch semenzai in versione Free. Passa a Pro per batch illimitati.`);
      return;
    }

    try {
      const batch = createPurchasedSeedlingBatch(
        newPurchasedBatch.plantName,
        newPurchasedBatch.purchaseDate,
        newPurchasedBatch.quantity,
        garden.id,
        newPurchasedBatch.variety || undefined,
        newPurchasedBatch.nurseryName || undefined,
        newPurchasedBatch.notes || undefined
      );
      onBatchCreate(batch);
      setIsCreatingPurchased(false);
      setNewPurchasedBatch({
        plantName: '',
        variety: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        quantity: 1,
        nurseryName: '',
        notes: ''
      });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handlePhotoUpload = (batch: SeedlingBatch, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verifica limite foto per batch (Free: max 5)
      const currentPhotos = batch.photoLog?.length || 0;
      const photosLimit = checkLimit('maxPhotosPerBatch', currentPhotos);
      
      if (!isPro && !photosLimit.allowed) {
        alert(`Limite raggiunto: massimo ${limit('maxPhotosPerBatch')} foto per batch in versione Free. Passa a Pro per foto illimitate.`);
        return;
      }

      setUploadingPhoto(batch.id);

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = addPhotoToLog(batch, base64);
        onBatchUpdate(updated);
        setUploadingPhoto(null);
        
        // Feedback visivo migliorato
        const successMessage = '📸 Foto aggiunta con successo!';
        
        // Mostra feedback temporaneo
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        feedbackElement.innerHTML = `
          <span>📸</span>
          <span>Foto salvata!</span>
        `;
        document.body.appendChild(feedbackElement);
        
        // Rimuovi feedback dopo 3 secondi
        setTimeout(() => {
          if (document.body.contains(feedbackElement)) {
            document.body.removeChild(feedbackElement);
          }
        }, 3000);
        
        console.log('✅ Foto aggiunta al batch:', batch.plantName, 'Totale foto:', (batch.photoLog?.length || 0) + 1);
      };
      reader.onerror = () => {
        setUploadingPhoto(null);
        
        // Feedback errore migliorato
        const errorElement = document.createElement('div');
        errorElement.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        errorElement.innerHTML = `
          <span>❌</span>
          <span>Errore caricamento foto</span>
        `;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
          if (document.body.contains(errorElement)) {
            document.body.removeChild(errorElement);
          }
        }, 3000);
        
        console.error('❌ Errore caricamento foto per batch:', batch.plantName);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPhaseColor = (phase: SeedlingBatch['phase']) => {
    switch (phase) {
      case 'Sowing': return 'bg-gray-100 text-gray-700';
      case 'Germination': return 'bg-blue-100 text-blue-700';
      case 'Nursing': return 'bg-green-100 text-green-700';
      case 'Hardening': return 'bg-orange-100 text-orange-700';
      case 'ReadyToTransplant': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPhaseLabel = (phase: SeedlingBatch['phase']) => {
    const labels = {
      'Sowing': 'Semina',
      'Germination': 'Germinazione',
      'Nursing': 'Cura Piantine',
      'Hardening': 'Aclimatazione',
      'ReadyToTransplant': 'Pronto al Trapianto'
    };
    return labels[phase];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-col md:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sprout size={24} className="text-green-600" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Gestione Semenzai</h2>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isPro && (
            <div className="text-xs text-gray-500">
              {batches.length}/{limit('maxSeedlingBatches')} batch
            </div>
          )}
          <button
            onClick={() => {
              setIsCreating(!isCreating);
              setIsCreatingPurchased(false);
            }}
            disabled={!canCreateBatch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            + Nuovo Batch
          </button>
          <button
            onClick={() => {
              setIsCreatingPurchased(!isCreatingPurchased);
              setIsCreating(false);
            }}
            disabled={!canCreateBatch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            + Piantine Acquistate
          </button>
        </div>
      </div>

      {/* Upgrade Prompt se Free e limite raggiunto */}
      {!isPro && !batchesLimit.allowed && (
        <UpgradePrompt
          feature="Batch Semenzai Illimitati"
          limit={`Massimo ${limit('maxSeedlingBatches')} batch in versione Free`}
          variant="inline"
          onUpgrade={() => console.log('Upgrade to Pro')}
        />
      )}

      {/* Form Creazione Batch Semenzai */}
      {isCreating && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-green-200">
          <h3 className="font-bold text-lg mb-4">Nuovo Batch Semenzai</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Pianta</label>
              <select
                className="w-full p-3 border rounded-lg text-sm sm:text-base"
                value={newBatch.plantName}
                onChange={(e) => setNewBatch({ ...newBatch, plantName: e.target.value })}
              >
                <option value="">Seleziona pianta</option>
                {masterSheets.map(p => (
                  <option key={p.commonName} value={p.commonName}>{p.commonName}</option>
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
                <label className="block text-sm font-semibold mb-2">Data Semina</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg"
                  value={newBatch.sowingDate}
                  onChange={(e) => setNewBatch({ ...newBatch, sowingDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Quantità</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 border rounded-lg text-sm sm:text-base"
                  value={newBatch.quantity}
                  onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Posizione</label>
                <select
                  className="w-full p-3 border rounded-lg text-sm sm:text-base"
                  value={newBatch.location}
                  onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value as any })}
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Greenhouse">Serra</option>
                  <option value="ColdFrame">Cassone</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row gap-3">
              <button
                onClick={handleCreateBatch}
                disabled={!newBatch.plantName || !canCreateBatch}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Crea Batch
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 text-sm sm:text-base"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Creazione Piantine Acquistate */}
      {isCreatingPurchased && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-blue-200">
          <h3 className="font-bold text-lg mb-4 text-blue-800">Aggiungi Piantine Acquistate al Vivaio</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Pianta</label>
              <select
                className="w-full p-3 border rounded-lg text-sm sm:text-base"
                value={newPurchasedBatch.plantName}
                onChange={(e) => setNewPurchasedBatch({ ...newPurchasedBatch, plantName: e.target.value })}
              >
                <option value="">Seleziona pianta</option>
                {masterSheets.map(p => (
                  <option key={p.commonName} value={p.commonName}>{p.commonName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Varietà (opzionale)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newPurchasedBatch.variety}
                  onChange={(e) => setNewPurchasedBatch({ ...newPurchasedBatch, variety: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Data Acquisto</label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-lg"
                  value={newPurchasedBatch.purchaseDate}
                  onChange={(e) => setNewPurchasedBatch({ ...newPurchasedBatch, purchaseDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Quantità</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 border rounded-lg text-sm sm:text-base"
                  value={newPurchasedBatch.quantity}
                  onChange={(e) => setNewPurchasedBatch({ ...newPurchasedBatch, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nome Vivaio (opzionale)</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newPurchasedBatch.nurseryName}
                  onChange={(e) => setNewPurchasedBatch({ ...newPurchasedBatch, nurseryName: e.target.value })}
                  placeholder="Es: Vivaio Rossi"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Note (opzionale)</label>
              <textarea
                className="w-full p-3 border rounded-lg h-20"
                value={newPurchasedBatch.notes}
                onChange={(e) => setNewPurchasedBatch({ ...newPurchasedBatch, notes: e.target.value })}
                placeholder="Note aggiuntive..."
              />
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row gap-3">
              <button
                onClick={handleCreatePurchasedBatch}
                disabled={!newPurchasedBatch.plantName || !canCreateBatch}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Aggiungi Piantine
              </button>
              <button
                onClick={() => setIsCreatingPurchased(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 text-sm sm:text-base"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista Batch */}
      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Sprout size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">Nessun batch semenzai attivo</p>
            <p className="text-sm text-gray-400 mt-1">Crea il tuo primo batch per iniziare</p>
          </div>
        ) : (
          batches.map(batch => {
            const timeline = getSeedlingTimeline(batch);
            const detailedTimeline = calculateSeedlingTimeline(batch, garden);
            const hardeningCheck = shouldStartHardening(batch, garden);
            const transplantCheck = isReadyToTransplant(batch, garden);
            const photosCount = batch.photoLog?.length || 0;
            const photosLimit = checkLimit('maxPhotosPerBatch', photosCount);

            return (
              <div key={batch.id} className="bg-white p-4 sm:p-6 rounded-xl border-2 border-green-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">{batch.plantName}</h3>
                      {batch.source === 'nursery' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          🏪 Acquistate
                        </span>
                      )}
                      {batch.source === 'home' || !batch.source && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          🏠 Seminate
                        </span>
                      )}
                    </div>
                    {batch.variety && <p className="text-sm text-gray-600 italic">{batch.variety}</p>}
                    {batch.source === 'nursery' && batch.nurseryName && (
                      <p className="text-xs text-gray-500 mt-1">Vivaio: {batch.nurseryName}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPhaseColor(batch.phase)}`}>
                        {getPhaseLabel(batch.phase)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(batch.sowingDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sopravvissute</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={batch.quantity}
                        className="w-16 p-3 border rounded text-center font-bold"
                        value={batch.currentQuantity || batch.quantity}
                        onChange={(e) => {
                          const updated = updateSurvivalCount(batch, parseInt(e.target.value) || 0);
                          onBatchUpdate(updated);
                        }}
                      />
                      <span className="text-gray-500">/ {String(batch.quantity)}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock size={16} className="text-gray-600" />
                    <h4 className="font-bold text-gray-700">Timeline</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Germinazione:</span>
                      <span className={detailedTimeline.germination.status === 'Completed' ? 'text-green-600 font-bold' : ''}>
                        {detailedTimeline.germination.status === 'Completed' ? '✓ Completata' : 
                         detailedTimeline.germination.daysRemaining > 0 ? `${detailedTimeline.germination.daysRemaining} giorni rimanenti` : 'In corso'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nursing:</span>
                      <span className={detailedTimeline.nursing.status === 'Completed' ? 'text-green-600 font-bold' : ''}>
                        {detailedTimeline.nursing.status === 'Completed' ? '✓ Completata' : 
                         detailedTimeline.nursing.daysRemaining > 0 ? `${detailedTimeline.nursing.daysRemaining} giorni rimanenti` : 'In corso'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hardening:</span>
                      <span>
                        {hardeningCheck.shouldStart ? (
                          <span className="text-orange-600 font-bold">⚠️ Inizia ora!</span>
                        ) : detailedTimeline.hardening.status === 'Ready' ? (
                          <span className="text-purple-600 font-bold">✓ Pronto</span>
                        ) : 'Non ancora'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trapianto previsto:</span>
                      <span className="font-bold">
                        {new Date(batch.expectedTransplantDate || '').toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alert */}
                {hardeningCheck.shouldStart && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={18} className="text-orange-600" />
                      <p className="text-sm font-bold text-orange-800">Inizia Hardening</p>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">{hardeningCheck.reason}</p>
                    <button
                      onClick={() => {
                        const updated = updateBatchPhase(batch, 'Hardening');
                        onBatchUpdate(updated);
                      }}
                      className="mt-2 px-4 py-2 bg-orange-600 text-white rounded text-sm font-bold hover:bg-orange-700"
                    >
                      Inizia Hardening
                    </button>
                  </div>
                )}

                {transplantCheck.ready && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={18} className="text-purple-600" />
                        <p className="text-sm font-bold text-purple-800">Pronto al Trapianto</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBatchToTransplant(batch);
                            setShowTransplantModal(true);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <ArrowRight size={12} />
                          Trapianta nell'Orto
                        </button>
                        <a
                          href="/app/plants?tab=plants"
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Eye size={12} />
                          Vedi Orto
                        </a>
                      </div>
                    </div>
                    {transplantCheck.warnings && transplantCheck.warnings.length > 0 && (
                      <ul className="text-xs text-purple-700 mt-1 list-disc list-inside">
                        {transplantCheck.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <strong>🤖 Trapianto Intelligente:</strong> Ogni piantina sarà tracciata individualmente nell'orto con monitoraggio automatico orchestrato per tutte le fasi di crescita.
                    </div>
                  </div>
                )}

                {/* Photo Log */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold">Foto Progressi</label>
                    {!isPro && (
                      <span className="text-xs text-gray-500">
                        {photosCount}/{limit('maxPhotosPerBatch')} foto
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {batch.photoLog?.map((photo, idx) => (
                      <div key={idx} className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border">
                        <img src={photo.image} alt={`Progress ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {photosLimit.allowed && (
                      <label className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all duration-200">
                        {uploadingPhoto === batch.id ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin text-green-600">⏳</div>
                            <span className="text-xs text-green-600 mt-1 font-medium">Salvando...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Camera size={20} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                            <span className="text-xs text-gray-400 mt-1">Foto</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(batch, e)}
                          disabled={uploadingPhoto === batch.id}
                        />
                      </label>
                    )}
                    {!photosLimit.allowed && !isPro && (
                      <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <span className="text-xs text-gray-400 text-center px-2">Limite raggiunto</span>
                      </div>
                    )}
                  </div>
                  {!photosLimit.allowed && !isPro && (
                    <UpgradePrompt
                      feature="Foto Illimitate per Batch"
                      limit={`Massimo ${limit('maxPhotosPerBatch')} foto per batch in versione Free`}
                      variant="inline"
                      onUpgrade={() => console.log('Upgrade to Pro')}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Transplant to Orchard Modal */}
      {showTransplantModal && batchToTransplant && (
        <TransplantToOrchardModal
          isOpen={showTransplantModal}
          onClose={() => {
            setShowTransplantModal(false);
            setBatchToTransplant(null);
          }}
          batch={batchToTransplant}
          garden={garden}
          onTransplantComplete={(result) => {
            if (result.success) {
              // Aggiorna il batch per riflettere il trapianto
              const availableQuantity =
                batchToTransplant.survivingQuantity ??
                batchToTransplant.currentQuantity ??
                batchToTransplant.quantity;
              const remainingQuantity = Math.max(0, availableQuantity - result.plantsCreated.length);
              const updatedBatch = {
                ...batchToTransplant,
                survivingQuantity: remainingQuantity,
                currentQuantity: remainingQuantity,
                phase: remainingQuantity > 0 
                  ? batchToTransplant.phase 
                  : 'ReadyToTransplant' as const,
                notes: [
                  batchToTransplant.notes,
                  `Trapiantate ${result.plantsCreated.length} piantine il ${result.transplantOperation.transplantDate} nel filare ${result.transplantOperation.fieldRowId}.`
                ].filter(Boolean).join('\n')
              };
              onBatchUpdate(updatedBatch);
            }
            setShowTransplantModal(false);
            setBatchToTransplant(null);
          }}
        />
      )}
    </div>
  );
};

export default SeedlingManager;
