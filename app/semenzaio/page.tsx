'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSeedPackets, getAvailableSeedsForPlant, consumeSeedsForSowing, recordGerminationResult } from '../../services/seedInventoryService';
import { getArchetypeById } from '../../services/archetypeService';

export default function SemenzaioPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Stati per integrazione banca semi
  const [availableSeeds, setAvailableSeeds] = useState([]);
  const [selectedSeedPacket, setSelectedSeedPacket] = useState(null);
  const [seedsToUse, setSeedsToUse] = useState(20); // Default 20 semi
  const [showSeedSelection, setShowSeedSelection] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Parametri URL per integrazione
  const fromPianifica = searchParams.get('from') === 'pianifica';
  const preselectedPlant = searchParams.get('plant');
  const preselectedVariety = searchParams.get('variety');
  const preselectedArchetypeId = searchParams.get('archetypeId');
  const shouldCreate = searchParams.get('action') === 'create';

  useEffect(() => {
    // Simula caricamento dati
    setTimeout(() => {
      setBatches([
        {
          id: '1',
          plantName: 'Pomodoro',
          variety: 'San Marzano',
          currentPhase: 'nursing',
          quantity: 20,
          survivingQuantity: 18,
          startDate: new Date(),
          notes: 'Batch di test',
          seedsPlanted: 25, // Nuovi campi per tracking
          germinationRate: 80
        }
      ]);
      
      // Carica banca semi (assumiamo gardenId = 'default' per ora)
      const gardenId = 'default';
      const allSeeds = getSeedPackets(gardenId);
      setAvailableSeeds(allSeeds);
      
      // Se c'è una pianta preselezionata, filtra i semi disponibili
      if (preselectedPlant) {
        const plantsSeeds = getAvailableSeedsForPlant(gardenId, preselectedPlant);
        if (plantsSeeds.length > 0) {
          setSelectedSeedPacket(plantsSeeds[0]); // Seleziona il primo disponibile
          setShowSeedSelection(true);
        }
      }
      
      setLoading(false);
      
      // Se arriva da pianifica o con action=create, apri il form
      if (fromPianifica || shouldCreate) {
        setShowCreateForm(true);
      }
    }, 1000);
  }, [fromPianifica, shouldCreate, preselectedPlant]);

  // Funzione per creare batch con consumo semi
  const handleCreateBatch = () => {
    if (!selectedSeedPacket) {
      alert('Seleziona un pacchetto di semi dalla banca');
      return;
    }

    const gardenId = 'default';
    
    // Consuma i semi dalla banca
    const consumeResult = consumeSeedsForSowing(
      gardenId,
      selectedSeedPacket.varietyName,
      seedsToUse
    );

    if (!consumeResult.success) {
      alert(consumeResult.message);
      return;
    }

    // Crea il nuovo batch
    const newBatch = {
      id: Date.now().toString(),
      plantName: selectedSeedPacket.varietyName,
      variety: selectedSeedPacket.varietyName,
      currentPhase: 'sowing',
      quantity: seedsToUse, // Quantità = semi piantati
      survivingQuantity: seedsToUse, // Inizialmente tutti "vivi"
      startDate: new Date(),
      notes: `Creato da banca semi - Pacchetto: ${selectedSeedPacket.id}`,
      seedsPlanted: seedsToUse,
      germinationRate: null, // Sarà calcolato dopo germinazione
      seedPacketId: selectedSeedPacket.id,
      archetypeId: preselectedArchetypeId
    };

    setBatches(prev => [...prev, newBatch]);
    
    // Aggiorna la banca semi
    const updatedSeeds = getSeedPackets(gardenId);
    setAvailableSeeds(updatedSeeds);
    
    // Chiudi il form
    setShowCreateForm(false);
    setShowSeedSelection(false);
    
    alert(`✅ ${consumeResult.message}\n🌱 Batch creato con ${seedsToUse} semi`);
  };

  // Funzione per registrare germinazione
  const handleRecordGermination = (batchId, germinatedCount) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const gardenId = 'default';
    const result = recordGerminationResult(
      gardenId,
      batchId,
      batch.seedsPlanted,
      germinatedCount,
      batch.variety
    );

    // Aggiorna il batch
    setBatches(prev => prev.map(b => 
      b.id === batchId 
        ? { 
            ...b, 
            survivingQuantity: germinatedCount,
            germinationRate: result.germinationRate,
            currentPhase: 'nursing'
          }
        : b
    ));

    alert(`📊 Germinazione registrata: ${result.germinationRate.toFixed(1)}% (${result.efficiency})`);
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              🌱 Semenzaio OrtoMio Pro
            </h1>
            <p className="mt-2 text-gray-600">
              Gestisci i tuoi batch di semina e monitora la crescita delle piantine
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch Attivi</p>
                <p className="text-2xl font-bold text-blue-600">{batches.length}</p>
              </div>
              <span className="text-2xl">🌱</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Piantine Totali</p>
                <p className="text-2xl font-bold text-green-600">
                  {batches.reduce((sum, b) => sum + b.survivingQuantity, 0)}
                </p>
              </div>
              <span className="text-2xl">🌿</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pronti</p>
                <p className="text-2xl font-bold text-orange-600">
                  {batches.filter(b => b.currentPhase === 'ready').length}
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sopravvivenza</p>
                <p className="text-2xl font-bold text-purple-600">90%</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Lista Batch */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">I Tuoi Batch</h2>
              <button 
                onClick={() => setShowSeedSelection(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Nuovo Batch
              </button>
            </div>
          </div>

          <div className="p-6">
            {batches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{batch.plantName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        batch.currentPhase === 'ready' ? 'bg-green-100 text-green-800' :
                        batch.currentPhase === 'nursing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {batch.currentPhase === 'nursing' ? 'Crescita' :
                         batch.currentPhase === 'ready' ? 'Pronto' : 'Germinazione'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">Varietà: {batch.variety}</p>
                    
                    {/* Informazioni Semi e Germinazione */}
                    {batch.seedsPlanted && (
                      <div className="text-xs text-gray-500 mb-2 space-y-1">
                        <div>Semi piantati: <span className="font-medium">{batch.seedsPlanted}</span></div>
                        {batch.germinationRate !== null && (
                          <div>Germinazione: <span className={`font-medium ${
                            batch.germinationRate >= 80 ? 'text-green-600' :
                            batch.germinationRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{batch.germinationRate.toFixed(1)}%</span></div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {batch.survivingQuantity}/{batch.quantity} piantine
                      </span>
                      <span className="text-gray-500">
                        {Math.round((batch.survivingQuantity / batch.quantity) * 100)}%
                      </span>
                    </div>
                    
                    <div className="mt-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(batch.survivingQuantity / batch.quantity) * 100}%` }}
                      />
                    </div>
                    
                    {batch.notes && (
                      <p className="text-xs text-gray-500 mt-2">{batch.notes}</p>
                    )}
                    
                    {/* Azioni Batch */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {batch.currentPhase === 'sowing' && batch.seedsPlanted && (
                        <button
                          onClick={() => {
                            const germinated = prompt(`Quante piantine sono germinate? (su ${batch.seedsPlanted} semi piantati)`);
                            if (germinated !== null) {
                              handleRecordGermination(batch.id, parseInt(germinated) || 0);
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          📊 Registra Germinazione
                        </button>
                      )}
                      {batch.currentPhase === 'ready' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                          Trapianta nel Giardino
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">🌱</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun batch attivo</h3>
                <p className="text-gray-600 mb-4">Inizia creando il tuo primo batch di semenzaio</p>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Crea Primo Batch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Selezione Semi */}
        {showSeedSelection && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">🌰 Seleziona Semi dalla Banca</h2>
                  <button
                    onClick={() => setShowSeedSelection(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                {preselectedPlant && (
                  <p className="text-sm text-gray-600 mt-2">
                    Pianta selezionata: <strong>{preselectedPlant}</strong>
                  </p>
                )}
              </div>

              <div className="p-6 space-y-6">
                {/* Banca Semi Disponibili */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Semi Disponibili</h3>
                  {availableSeeds.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {availableSeeds
                        .filter(seed => !preselectedPlant || 
                          seed.varietyName.toLowerCase().includes(preselectedPlant.toLowerCase()) ||
                          seed.speciesName.toLowerCase().includes(preselectedPlant.toLowerCase())
                        )
                        .map((seed) => (
                        <div
                          key={seed.id}
                          onClick={() => setSelectedSeedPacket(seed)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedSeedPacket?.id === seed.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{seed.varietyName}</h4>
                              <p className="text-sm text-gray-600">{seed.speciesName}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  seed.quantityRemaining === 'High' ? 'bg-green-100 text-green-800' :
                                  seed.quantityRemaining === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  seed.quantityRemaining === 'Low' ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {seed.quantityRemaining}
                                </span>
                                {seed.currentQuantity && (
                                  <span className="text-gray-600">
                                    {seed.currentQuantity} semi
                                  </span>
                                )}
                                <span className="text-gray-500">
                                  Scadenza: {seed.expiryYear}
                                </span>
                              </div>
                            </div>
                            {selectedSeedPacket?.id === seed.id && (
                              <div className="text-green-600 text-xl">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <span className="text-4xl mb-2 block">📦</span>
                      <p className="text-gray-600 mb-4">Nessun seme disponibile nella banca</p>
                      <button className="text-green-600 hover:text-green-700 font-medium">
                        + Aggiungi Semi alla Banca
                      </button>
                    </div>
                  )}
                </div>

                {/* Configurazione Semina */}
                {selectedSeedPacket && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">⚙️ Configurazione Semina</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quanti semi vuoi piantare?
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            value={seedsToUse}
                            onChange={(e) => setSeedsToUse(parseInt(e.target.value) || 0)}
                            min="1"
                            max={selectedSeedPacket.currentQuantity || 100}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-600">
                            {selectedSeedPacket.currentQuantity 
                              ? `(max ${selectedSeedPacket.currentQuantity} disponibili)`
                              : '(quantità stimata)'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-blue-200 rounded p-3">
                        <h4 className="font-medium text-gray-900 mb-2">📊 Stima Risultati</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Semi piantati:</span>
                            <span className="font-semibold ml-2">{seedsToUse}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Piantine attese:</span>
                            <span className="font-semibold ml-2 text-green-600">
                              {Math.round(seedsToUse * 0.75)} - {Math.round(seedsToUse * 0.9)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          *Stima basata su tasso germinazione 75-90%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pulsanti Azione */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowSeedSelection(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleCreateBatch}
                    disabled={!selectedSeedPacket || seedsToUse <= 0}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    🌱 Crea Batch ({seedsToUse} semi)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guida rapida */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Sistema Semenzaio OrtoMio Pro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">1. Pianifica</h4>
              <p className="text-blue-700">Scegli se partire da seme o piantina con suggerimenti intelligenti</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">2. Monitora</h4>
              <p className="text-blue-700">Segui la crescita attraverso le fasi: germinazione → nursing → indurimento</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">3. Trapianta</h4>
              <p className="text-blue-700">Quando pronte, trapianta le piantine nel tuo giardino</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}