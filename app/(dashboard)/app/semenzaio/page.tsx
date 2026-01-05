'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGarden } from '@/packages/core/context/GardenContext';
import { useStorage } from '@/packages/core/context/StorageContext';
import SeedlingDashboard from '@/components/seedling/SeedlingDashboard';
import { getAvailableSeedsForPlant, consumeSeedsForSowing } from '@/services/seedInventoryService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Seed, X, CheckCircle } from 'lucide-react';

export default function SemenzaioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeGarden } = useGarden();
  const { storageProvider } = useStorage();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSeedSelector, setShowSeedSelector] = useState(false);
  const [availableSeeds, setAvailableSeeds] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [seedQuantity, setSeedQuantity] = useState(25);

  // Parametri URL per integrazione con Pianifica
  const shouldCreate = searchParams.get('create') === 'true';
  const plantName = searchParams.get('plant');
  const variety = searchParams.get('variety');
  const archetypeId = searchParams.get('archetypeId');
  const fromPage = searchParams.get('from');

  // Prefill data for new batch
  const [prefilledData, setPrefilledData] = useState({
    plantName: '',
    variety: '',
    source: 'home' as 'home' | 'nursery',
    quantity: 20
  });

  useEffect(() => {
    loadBatches();

    // Se arriviamo dalla pianificazione con richiesta di creare batch
    if (shouldCreate && plantName && activeGarden) {
      setPrefilledData({
        plantName: decodeURIComponent(plantName),
        variety: variety ? decodeURIComponent(variety) : '',
        source: 'home',
        quantity: 20
      });

      // Carica semi disponibili per questa pianta
      loadAvailableSeeds(decodeURIComponent(plantName));
      setShowSeedSelector(true);
    }
  }, [shouldCreate, plantName, variety, activeGarden]);

  const loadBatches = async () => {
    try {
      if (!activeGarden || !storageProvider) {
        setLoading(false);
        return;
      }

      // Carica batches dal database
      const loadedBatches = await storageProvider.getSeedlingBatches?.(activeGarden.id) || [];

      // Converti le date da stringhe a oggetti Date
      const formattedBatches = loadedBatches.map(batch => ({
        ...batch,
        startDate: new Date(batch.startDate),
        expectedTransplantDate: new Date(batch.expectedTransplantDate),
        actualTransplantDate: batch.actualTransplantDate ? new Date(batch.actualTransplantDate) : undefined,
        photos: batch.photos || []
      }));

      setBatches(formattedBatches);
      setLoading(false);
    } catch (error) {
      console.error('Error loading seedling batches:', error);
      setLoading(false);
    }
  };

  const loadAvailableSeeds = (plantName: string) => {
    if (!activeGarden) return;

    const seeds = getAvailableSeedsForPlant(activeGarden.id, plantName);
    setAvailableSeeds(seeds);
  };

  const handleSeedSelect = (seed: any) => {
    setSelectedSeed(seed);
  };

  const handleCreateBatchFromSeeds = async () => {
    if (!selectedSeed || !activeGarden || !storageProvider) return;

    try {
      // 1. Consuma semi dalla banca
      const consumeResult = consumeSeedsForSowing(
        activeGarden.id,
        selectedSeed.varietyName,
        seedQuantity
      );

      if (!consumeResult.success) {
        alert(consumeResult.message);
        return;
      }

      // 2. Crea batch nel semenzaio
      const newBatch = {
        id: `batch_${Date.now()}`,
        plantName: prefilledData.plantName,
        variety: selectedSeed.varietyName,
        source: 'home' as const,
        currentPhase: 'germination' as const,
        startDate: new Date(),
        quantity: seedQuantity,
        survivingQuantity: seedQuantity,
        seedsPlanted: seedQuantity,
        germinationRate: 0,
        seedPacketId: selectedSeed.id,
        archetypeId: archetypeId || '',
        photos: [],
        notes: `Semi piantati: ${seedQuantity}. Pacchetto: ${selectedSeed.varietyName} (${selectedSeed.source})`,
        expectedTransplantDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 giorni
      };

      // Salva nel database
      await storageProvider.addSeedlingBatch?.(activeGarden.id, newBatch);

      // Aggiorna UI
      setBatches(prev => [newBatch, ...prev]);
      setShowSeedSelector(false);
      setShowCreateForm(false);
      setSelectedSeed(null);

      alert(`✅ ${consumeResult.message}\n🌱 Batch creato con successo!`);
    } catch (error) {
      console.error('Error creating batch:', error);
      alert('Errore nella creazione del batch');
    }
  };

  const handleBackNavigation = () => {
    if (fromPage === 'pianifica') {
      router.push('/app/pianifica');
    } else {
      router.push('/app/garden');
    }
  };

  const getPhaseInfo = (phase) => {
    const phases = {
      germination: { label: 'Germinazione', color: 'yellow', icon: '🌰' },
      nursing: { label: 'Crescita', color: 'blue', icon: '🌱' },
      hardening: { label: 'Indurimento', color: 'orange', icon: '🌿' },
      ready: { label: 'Pronto', color: 'green', icon: '✅' },
      transplanted: { label: 'Trapiantato', color: 'gray', icon: '🌳' }
    };
    return phases[phase] || phases.germination;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento semenzaio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navigazione */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBackNavigation}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Indietro
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    🌱 Semenzaio Pro
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gestisci i tuoi batch di semina
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                + Nuovo Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistiche rapide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch Attivi</p>
                <p className="text-xl font-bold text-blue-600">
                  {batches.filter(b => b.currentPhase !== 'transplanted').length}
                </p>
              </div>
              <span className="text-2xl">🌱</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pronti</p>
                <p className="text-xl font-bold text-green-600">
                  {batches.filter(b => b.currentPhase === 'ready').length}
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Piantine</p>
                <p className="text-xl font-bold text-orange-600">
                  {batches.reduce((sum, b) => sum + b.survivingQuantity, 0)}
                </p>
              </div>
              <span className="text-2xl">🌿</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sopravvivenza</p>
                <p className="text-xl font-bold text-purple-600">
                  {batches.length > 0 
                    ? Math.round(batches.reduce((sum, b) => sum + (b.survivingQuantity / b.quantity), 0) / batches.length * 100)
                    : 0}%
                </p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Avvisi per batch pronti */}
        {batches.filter(b => b.currentPhase === 'ready').length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-600">🔔</span>
              <h3 className="font-semibold text-orange-900">Piantine Pronte per Trapianto!</h3>
            </div>
            <div className="space-y-1">
              {batches.filter(b => b.currentPhase === 'ready').map(batch => (
                <p key={batch.id} className="text-sm text-orange-800">
                  • {batch.plantName} ({batch.variety}) - {batch.survivingQuantity} piantine
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Lista Batch */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">I Tuoi Batch</h2>
          </div>

          <div className="p-6">
            {batches.length > 0 ? (
              <div className="space-y-4">
                {batches.map((batch) => {
                  const phaseInfo = getPhaseInfo(batch.currentPhase);
                  const daysSinceStart = Math.floor((new Date() - batch.startDate) / (1000 * 60 * 60 * 24));
                  const survivalRate = Math.round((batch.survivingQuantity / batch.quantity) * 100);
                  
                  return (
                    <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{phaseInfo.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{batch.plantName}</h3>
                            <p className="text-sm text-gray-600">Varietà: {batch.variety}</p>
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          phaseInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                          phaseInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          phaseInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          phaseInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {phaseInfo.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Piantine</p>
                          <p className="font-medium">{batch.survivingQuantity}/{batch.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sopravvivenza</p>
                          <p className="font-medium">{survivalRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Giorni</p>
                          <p className="font-medium">{daysSinceStart}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Trapianto previsto</p>
                          <p className="font-medium text-xs">
                            {batch.expectedTransplantDate.toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Sopravvivenza</span>
                          <span>{survivalRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              survivalRate >= 80 ? 'bg-green-500' :
                              survivalRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${survivalRate}%` }}
                          />
                        </div>
                      </div>
                      
                      {batch.notes && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {batch.notes}
                        </p>
                      )}
                      
                      {batch.currentPhase === 'ready' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                            Trapianta nel Giardino
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🌱</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun batch attivo</h3>
                <p className="text-gray-600 mb-4">
                  {shouldCreate 
                    ? `Perfetto! Stai per creare un batch per ${plantName}` 
                    : 'Inizia creando il tuo primo batch di semenzaio'
                  }
                </p>
                {!shouldCreate && (
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crea Primo Batch
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form creazione batch (modal semplice) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crea Nuovo Batch</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCreateBatch({
                plantName: formData.get('plantName'),
                variety: formData.get('variety'),
                quantity: parseInt(formData.get('quantity')),
                source: formData.get('source'),
                notes: formData.get('notes')
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pianta</label>
                  <input
                    name="plantName"
                    type="text"
                    defaultValue={prefilledData.plantName || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Varietà</label>
                  <input
                    name="variety"
                    type="text"
                    defaultValue={prefilledData.variety || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantità semi</label>
                  <input
                    name="quantity"
                    type="number"
                    defaultValue={prefilledData.quantity || 20}
                    min="1"
                    max="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonte semi</label>
                  <select
                    name="source"
                    defaultValue={prefilledData.source || 'home'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="home">Casa (semi propri)</option>
                    <option value="nursery">Vivaio</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    name="notes"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Note opzionali..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Crea Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}