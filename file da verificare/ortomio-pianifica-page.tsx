'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CultivationMethodSelectorAdapted from '../components/planner/CultivationMethodSelectorAdapted';
import TimelineComparison from '../components/planner/TimelineComparison';

interface PlantData {
  name: string;
  archetype_id: string;
  scientific_name: string;
  germinationDays: number;
  nursingDays: number;
  hardeningDays: number;
  transplantDays: number;
  harvestDays: number;
  difficulty: 'facile' | 'media' | 'difficile';
  season: string;
}

export default function PianificaPage() {
  const [selectedPlant, setSelectedPlant] = useState<PlantData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'seed' | 'transplant' | null>(null);
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  // Carica le piante dal database
  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('official_crops')
        .select('*')
        .order('name');

      if (error) throw error;

      // Trasforma i dati per il componente
      const transformedPlants: PlantData[] = data?.map(plant => ({
        name: plant.name,
        archetype_id: plant.archetype_id,
        scientific_name: plant.scientific_name || '',
        germinationDays: 7, // Default, dovrebbe venire da plant_master_sheet
        nursingDays: 30,
        hardeningDays: 10,
        transplantDays: 1,
        harvestDays: 90,
        difficulty: 'media' as const,
        season: 'primavera-estate'
      })) || [];

      setPlants(transformedPlants);
    } catch (error) {
      console.error('Errore caricamento piante:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlantSelect = (plant: PlantData) => {
    setSelectedPlant(plant);
    setSelectedMethod(null);
  };

  const handleMethodSelect = (method: 'seed' | 'transplant', data: any) => {
    setSelectedMethod(method);
    
    // Qui puoi salvare la pianificazione nel database
    console.log('Pianificazione selezionata:', {
      plant: selectedPlant,
      method,
      data
    });

    // Esempio: creare un task di pianificazione
    createPlanningTask(method, data);
  };

  const createPlanningTask = async (method: 'seed' | 'transplant', data: any) => {
    if (!selectedPlant) return;

    try {
      const taskData = {
        plant_name: selectedPlant.name,
        task_type: method === 'seed' ? 'semina' : 'trapianto',
        scheduled_date: new Date().toISOString(),
        method: method,
        notes: `Pianificazione ${method === 'seed' ? 'semina' : 'trapianto'} per ${selectedPlant.name}`,
        status: 'planned'
      };

      const { error } = await supabase
        .from('garden_tasks')
        .insert(taskData);

      if (error) throw error;

      alert(`Pianificazione ${method === 'seed' ? 'semina' : 'trapianto'} salvata con successo!`);
    } catch (error) {
      console.error('Errore salvataggio pianificazione:', error);
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
                {filteredPlants.slice(0, 12).map((plant) => (
                  <div
                    key={plant.name}
                    onClick={() => handlePlantSelect(plant)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                    <p className="text-sm text-gray-600 italic">{plant.scientific_name}</p>
                    <div className="mt-2 flex items-center gap-2">
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
                </div>
              </div>
            </div>

            {/* Selezione metodo */}
            <CultivationMethodSelectorAdapted
              plant={selectedPlant}
              onSelect={handleMethodSelect}
              userLevel="intermedio"
              currentSeason="primavera"
              weatherConditions={{
                temperature: 20,
                nightTemperature: 12,
                humidity: 65
              }}
            />

            {/* Timeline comparison */}
            {selectedMethod && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Timeline Dettagliata</h3>
                <TimelineComparison
                  plant={selectedPlant}
                  showBoth={false}
                  selectedMethod={selectedMethod}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}