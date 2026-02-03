'use client';

import React, { useState, useEffect } from 'react';

export default function PianificaPage() {
  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula caricamento piante
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
    }, 800);
  }, []);

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
      alert(`Ottima scelta! Coltivare ${selectedPlant.name} da seme ti darà il controllo completo del processo. Vai al Semenzaio per creare un nuovo batch.`);
    } else {
      alert(`Perfetto! Coltivare ${selectedPlant.name} da piantina è più veloce e garantisce risultati. Procedi con il trapianto diretto.`);
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
                      <span className="text-2xl">🌱</span>
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
                  <span className="text-2xl">🌱</span>
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