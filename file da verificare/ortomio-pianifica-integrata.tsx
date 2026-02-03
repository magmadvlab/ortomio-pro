'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PianificaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Controlla se arriviamo dal modal "Nuova Pianta"
  const fromModal = searchParams.get('from') === 'modal';
  const preselectedPlant = searchParams.get('plant');

  useEffect(() => {
    loadPlants();
    
    // Se c'è una pianta preselezionata dal modal
    if (preselectedPlant) {
      const plant = plants.find(p => p.name.toLowerCase() === preselectedPlant.toLowerCase());
      if (plant) {
        setSelectedPlant(plant);
      }
    }
  }, [preselectedPlant, plants]);

  const loadPlants = () => {
    // Simula caricamento piante (in produzione: chiamata API Supabase)
    setTimeout(() => {
      setPlants([
        { id: 1, name: 'Pomodoro', scientific_name: 'Solanum lycopersicum', difficulty: 'media' },
        { id: 2, name: 'Basilico', scientific_name: 'Ocimum basilicum', difficulty: 'facile' },
        { id: 3, name: 'Peperoncino', scientific_name: 'Capsicum annuum', difficulty: 'media' },
        { id: 4, name: 'Lattuga', scientific_name: 'Lactuca sativa', difficulty: 'facile' },
        { id: 5, name: 'Melanzana', scientific_name: 'Solanum melongena', difficulty: 'difficile' },
        { id: 6, name: 'Zucchina', scientific_name: 'Cucurbita pepo', difficulty: 'facile' }
      ]);
      setLoading(false);
    }, 500);
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
    setSelectedMethod(null);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    
    if (method === 'seed') {
      // Reindirizza al semenzaio con parametri
      router.push(`/app/semenzaio?create=true&plant=${encodeURIComponent(selectedPlant.name)}&from=pianifica`);
    } else {
      // Reindirizza al giardino per trapianto diretto
      router.push(`/app/garden?add=true&plant=${encodeURIComponent(selectedPlant.name)}&method=transplant`);
    }
  };

  const handleBackToGarden = () => {
    if (fromModal) {
      router.push('/app/garden');
    } else {
      router.back();
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
      {/* Header con navigazione */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBackToGarden}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Indietro
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Pianifica Coltivazione
                </h1>
                <p className="text-sm text-gray-600">
                  Scegli la pianta e il metodo più adatto
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!selectedPlant ? (
          /* Selezione Pianta */
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Seleziona la Pianta</h2>
            
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

            {/* Lista piante compatta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPlants.slice(0, 8).map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => handlePlantSelect(plant)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌱</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{plant.name}</h3>
                      <p className="text-xs text-gray-500 italic">{plant.scientific_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      plant.difficulty === 'facile' ? 'bg-green-100 text-green-700' :
                      plant.difficulty === 'media' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {plant.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Selezione Metodo */
          <div className="space-y-6">
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

            {/* Info pianta */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPlant.name}</h2>
                  <p className="text-sm text-gray-600 italic">{selectedPlant.scientific_name}</p>
                </div>
              </div>
            </div>

            {/* Selezione metodo - COMPATTA per integrazione */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Come vuoi coltivare {selectedPlant.name}?</h3>
              
              <div className="space-y-4">
                {/* Dal Seme */}
                <div 
                  onClick={() => handleMethodSelect('seed')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌰</span>
                      <div>
                        <h4 className="font-semibold group-hover:text-orange-700">Dal Seme</h4>
                        <p className="text-sm text-gray-600">Controllo completo, più economico</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">~90 giorni</p>
                      <p className="text-xs text-gray-500">→ Semenzaio</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-orange-50 p-2 rounded text-xs">
                    <p className="text-orange-800">
                      ✓ Economico • ✓ Varietà ampie • ✓ Controllo totale
                    </p>
                  </div>
                </div>

                {/* Dalla Piantina */}
                <div 
                  onClick={() => handleMethodSelect('transplant')}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌿</span>
                      <div>
                        <h4 className="font-semibold group-hover:text-green-700">Dalla Piantina</h4>
                        <p className="text-sm text-gray-600">Risultato garantito, più veloce</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">~60 giorni</p>
                      <p className="text-xs text-gray-500">→ Giardino</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-green-50 p-2 rounded text-xs">
                    <p className="text-green-800">
                      ✓ Veloce • ✓ Garantito • ✓ Facile per principianti
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggerimento intelligente */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Suggerimento</p>
                    <p className="text-blue-700">
                      {selectedPlant.difficulty === 'facile' 
                        ? 'Entrambi i metodi sono adatti per questa pianta facile da coltivare.'
                        : selectedPlant.difficulty === 'difficile'
                        ? 'Per questa pianta difficile, consigliamo di partire da piantina.'
                        : 'Pianta di difficoltà media: scegli in base alla tua esperienza.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}