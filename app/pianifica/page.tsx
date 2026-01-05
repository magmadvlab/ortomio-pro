'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllArchetypes } from '../../services/archetypeService';

interface PlantItem {
  id: string;
  name: string;
  scientific_name: string;
  difficulty: string;
  archetypeId: string;
  icon: string;
}

function PianificaPageContent() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Parametri URL per integrazione
  const fromModal = searchParams.get('from') === 'modal';
  const suggestedPlant = searchParams.get('plant');

  useEffect(() => {
    // Carica piante da archetipi invece di dati mock
    setTimeout(() => {
      const allArchetypes = getAllArchetypes();
      const plantsFromArchetypes = allArchetypes.flatMap(archetype => {
        if (!archetype.examples) return [];
        
        return archetype.examples.slice(0, 2).map((example, index) => ({
          id: `${archetype.id}_${index}`,
          name: example.charAt(0).toUpperCase() + example.slice(1),
          scientific_name: `${archetype.botanicalFamily} sp.`,
          difficulty: archetype.id === 'A4' || archetype.id === 'A5' ? 'facile' : 
                     archetype.id === 'A1' || archetype.id === 'A2' ? 'media' : 'difficile',
          archetypeId: archetype.id,
          icon: archetype.icon
        }));
      });
      
      setPlants(plantsFromArchetypes);
      
      // Se c'è una pianta suggerita, pre-selezionala
      if (suggestedPlant) {
        const suggested = plantsFromArchetypes.find(p => 
          p.name.toLowerCase() === suggestedPlant.toLowerCase()
        );
        if (suggested) {
          setSelectedPlant(suggested);
          setSearchTerm(suggestedPlant);
        }
      }
      
      setLoading(false);
    }, 800);
  }, [suggestedPlant]);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlantSelect = (plant: PlantItem) => {
    setSelectedPlant(plant);
    setSelectedMethod(null);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'seed') {
      if (!selectedPlant) return;
      
      // Reindirizza al semenzaio con parametri per pre-compilazione
      const params = new URLSearchParams({
        plant: selectedPlant.name,
        variety: selectedPlant.scientific_name,
        archetypeId: selectedPlant.archetypeId || '',
        from: 'pianifica'
      });
      router.push(`/app/semenzaio?${params.toString()}`);
    } else {
      if (!selectedPlant) return;
      
      // Per piantina, potrebbe aprire il wizard di trapianto diretto
      alert(`Perfetto! Coltivare ${selectedPlant.name} da piantina è più veloce e garantisce risultati. Procedi con il trapianto diretto.`);
      // Qui potresti aprire un modal per trapianto diretto o reindirizzare
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento piante...</p>
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
              📅 Pianifica Coltivazione
            </h1>
            <p className="mt-2 text-gray-600">
              Scegli la pianta e il metodo di coltivazione più adatto
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedPlant ? (
          /* Selezione Pianta */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Seleziona la Pianta</h2>
              
              {/* Ricerca */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Cerca pianta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Lista piante */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlants.map((plant) => (
                  <div
                    key={plant.id}
                    onClick={() => handlePlantSelect(plant)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{plant.icon || '🌱'}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                        <p className="text-sm text-gray-600 italic">{plant.scientific_name}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        plant.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                        plant.difficulty === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {plant.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Pianificazione Selezionata */
          <div className="space-y-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button 
                onClick={() => setSelectedPlant(null)}
                className="hover:text-green-600"
              >
                Piante
              </button>
              <span>›</span>
              <span className="font-medium text-gray-900">{selectedPlant.name}</span>
            </div>

            {/* Info pianta selezionata */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{selectedPlant.icon || '🌱'}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlant.name}</h2>
                  <p className="text-gray-600 italic">{selectedPlant.scientific_name}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                    selectedPlant.difficulty === 'facile' ? 'bg-green-100 text-green-800' :
                    selectedPlant.difficulty === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Difficoltà: {selectedPlant.difficulty}
                  </span>
                </div>
              </div>
            </div>

            {/* Selezione metodo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-6">Come vuoi coltivare {selectedPlant.name}?</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Dal Seme */}
                <div 
                  onClick={() => handleMethodSelect('seed')}
                  className={`cursor-pointer p-6 border-2 rounded-lg transition-all ${
                    selectedMethod === 'seed' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🌰</span>
                    <h4 className="text-lg font-semibold">Dal Seme</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">Tempo: ~90 giorni</p>
                      <p className="text-xs text-orange-700">Include germinazione e crescita</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-green-700 mb-2">✓ Vantaggi</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Controllo completo del processo</li>
                        <li>• Costo molto ridotto</li>
                        <li>• Maggiore soddisfazione</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-700 mb-2">⚠ Considerazioni</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Richiede più tempo e attenzione</li>
                        <li>• Rischio di fallimento germinazione</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Dalla Piantina */}
                <div 
                  onClick={() => handleMethodSelect('transplant')}
                  className={`cursor-pointer p-6 border-2 rounded-lg transition-all ${
                    selectedMethod === 'transplant' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🌿</span>
                    <h4 className="text-lg font-semibold">Dalla Piantina</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Tempo: ~60 giorni</p>
                      <p className="text-xs text-green-700">Trapianto immediato</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-green-700 mb-2">✓ Vantaggi</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Risultato garantito</li>
                        <li>• Tempo ridotto al minimo</li>
                        <li>• Perfetto per principianti</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-700 mb-2">⚠ Considerazioni</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Costo maggiore</li>
                        <li>• Meno varietà disponibili</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {selectedMethod && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Metodo selezionato: {selectedMethod === 'seed' ? 'Dal Seme 🌰' : 'Dalla Piantina 🌿'}
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    {selectedMethod === 'seed' 
                      ? 'Vai al Semenzaio per creare un nuovo batch e monitorare la crescita'
                      : 'Procedi con il trapianto diretto nel tuo giardino'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PianificaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Caricamento...</div>}>
      <PianificaPageContent />
    </Suspense>
  )
}