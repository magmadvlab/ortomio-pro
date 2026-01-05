'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCultivationOrchestrator } from '../../../../services/cultivationOrchestrator';

// Dati archetipi inline per evitare problemi di importazione
const archetypes = [
  {
    id: 'A1',
    label: 'Solanacee da frutto',
    icon: '🍅',
    botanicalFamily: 'Solanaceae',
    category: 'vegetable',
    examples: ['pomodoro', 'peperoncino', 'melanzana', 'peperone']
  },
  {
    id: 'A2',
    label: 'Cucurbitacee fresche',
    icon: '🥒',
    botanicalFamily: 'Cucurbitaceae',
    category: 'vegetable',
    examples: ['zucchina', 'cetriolo', 'carosello']
  },
  {
    id: 'A3',
    label: 'Cucurbitacee grosse',
    icon: '🍈',
    botanicalFamily: 'Cucurbitaceae',
    category: 'vegetable',
    examples: ['melone', 'anguria', 'zucca']
  },
  {
    id: 'A4',
    label: 'Insalate',
    icon: '🥬',
    botanicalFamily: 'Asteraceae',
    category: 'vegetable',
    examples: ['lattuga', 'radicchio', 'cicoria', 'rucola']
  },
  {
    id: 'A5',
    label: 'Foglie robuste',
    icon: '🥬',
    botanicalFamily: 'Amaranthaceae',
    category: 'vegetable',
    examples: ['bietola', 'spinacio']
  },
  {
    id: 'A6',
    label: 'Brassiche',
    icon: '🥦',
    botanicalFamily: 'Brassicaceae',
    category: 'vegetable',
    examples: ['cavolo', 'broccolo', 'cavolfiore', 'ravanello']
  },
  {
    id: 'A7',
    label: 'Bulbi',
    icon: '🧅',
    botanicalFamily: 'Amaryllidaceae',
    category: 'vegetable',
    examples: ['cipolla', 'aglio', 'porro']
  },
  {
    id: 'A8',
    label: 'Radici & tuberi',
    icon: '🥕',
    botanicalFamily: 'Apiaceae/Solanaceae',
    category: 'vegetable',
    examples: ['carota', 'patata', 'barbabietola', 'rapa']
  },
  {
    id: 'A9',
    label: 'Legumi',
    icon: '🫘',
    botanicalFamily: 'Fabaceae',
    category: 'vegetable',
    examples: ['fagiolo', 'pisello', 'fava', 'cece']
  },
  {
    id: 'A10',
    label: 'Aromatiche',
    icon: '🌿',
    botanicalFamily: 'Lamiaceae/Apiaceae',
    category: 'aromatic',
    examples: ['basilico', 'rosmarino', 'salvia', 'prezzemolo']
  },
  {
    id: 'A11',
    label: 'Piccoli frutti',
    icon: '🫐',
    botanicalFamily: 'Rosaceae/Ericaceae',
    category: 'berry',
    examples: ['fragola', 'lampone', 'mirtillo', 'mora']
  },
  {
    id: 'A12',
    label: 'Colture legnose',
    icon: '🌳',
    botanicalFamily: 'Varie',
    category: 'tree',
    examples: ['frutteto', 'olivo', 'vite']
  }
];

interface PlantItem {
  id: string;
  name: string;
  scientific_name: string;
  difficulty: string;
  archetypeId: string;
  archetypeCategory: string;
  icon: string;
  family: string;
}

function PianificaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantItem | null>(null);
  const [availableMaterials, setAvailableMaterials] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [gardenId, setGardenId] = useState<string | null>(null);

  // Ottieni garden ID (in un'app reale verrebbe dal context/props)
  const orchestrator = useCultivationOrchestrator(gardenId || 'mock-garden-id');

  // Controlla se arriviamo dal modal "Nuova Pianta"
  const fromModal = searchParams.get('from') === 'modal';
  const preselectedPlant = searchParams.get('plant');

  useEffect(() => {
    // TODO: Ottieni gardenId dal context utente
    setGardenId('mock-garden-id');
    loadPlants();
  }, []);

  useEffect(() => {
    if (preselectedPlant && plants.length > 0) {
      const plant = plants.find(p => p.name.toLowerCase() === preselectedPlant.toLowerCase());
      if (plant) {
        handlePlantSelect(plant);
      }
    }
  }, [preselectedPlant, plants]);

  const loadPlants = () => {
    // Carica piante dagli archetipi evitando duplicati
    setTimeout(() => {
      try {
        console.log('Loading plants from archetypes...');
        
        // Filtra archetipi in base al tipo di giardino
        // TODO: Ottieni garden type dal database
        const gardenType = 'orto'; // Mock - dovrebbe venire dal database
        
        let filteredArchetypes = archetypes;
        if (gardenType === 'orto') {
          // Solo archetipi A1-A10 per orti
          filteredArchetypes = archetypes.filter(a => 
            a.category === 'vegetable' || a.category === 'aromatic'
          );
        } else if (gardenType === 'frutteto') {
          // Solo archetipi A11-A12 per frutteti
          filteredArchetypes = archetypes.filter(a => 
            a.category === 'berry' || a.category === 'tree'
          );
        }
        
        // Crea lista piante uniche dagli esempi degli archetipi
        const plantsFromArchetypes: PlantItem[] = [];
        const seenPlants = new Set();
        
        filteredArchetypes.forEach(archetype => {
          if (archetype.examples) {
            archetype.examples.forEach(example => {
              const plantName = example.charAt(0).toUpperCase() + example.slice(1);
              const plantKey = plantName.toLowerCase();
              
              // Evita duplicati (es. "pomodoro" e "pomodori")
              if (!seenPlants.has(plantKey)) {
                seenPlants.add(plantKey);
                
                // Determina difficoltà basata su archetipo
                let difficulty = 'media';
                if (['A4', 'A5', 'A10'].includes(archetype.id)) {
                  difficulty = 'facile'; // Insalate, foglie robuste, aromatiche
                } else if (['A1', 'A2', 'A9'].includes(archetype.id)) {
                  difficulty = 'media'; // Solanacee, cucurbitacee fresche, legumi
                } else if (['A3', 'A6', 'A7', 'A8', 'A11', 'A12'].includes(archetype.id)) {
                  difficulty = 'difficile'; // Cucurbitacee grosse, brassiche, bulbi, radici, frutti
                }
                
                plantsFromArchetypes.push({
                  id: `${archetype.id}_${plantKey}`,
                  name: plantName,
                  scientific_name: `${archetype.botanicalFamily} sp.`,
                  difficulty: difficulty,
                  archetypeId: archetype.id,
                  archetypeCategory: archetype.category,
                  icon: archetype.icon,
                  family: archetype.botanicalFamily
                });
              }
            });
          }
        });
        
        console.log('Piante create dagli archetipi:', plantsFromArchetypes.length);
        
        // Ordina per nome
        plantsFromArchetypes.sort((a, b) => a.name.localeCompare(b.name));
        
        setPlants(plantsFromArchetypes);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento piante:', error);
        setLoading(false);
      }
    }, 500);
  };

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlantSelect = async (plant: PlantItem) => {
    setSelectedPlant(plant);
    setAvailableMaterials(null);
    setSelectedMaterial(null);
    
    if (gardenId) {
      try {
        // Ottieni materiali disponibili dall'orchestratore
        const materials = await orchestrator.getAvailableMaterials(plant.archetypeId);
        setAvailableMaterials(materials);
        console.log('Materiali disponibili:', materials);
      } catch (error) {
        console.error('Errore nel caricamento materiali:', error);
        // Fallback con dati mock
        setAvailableMaterials({
          seeds: [],
          seedlings: [],
          saplings: [],
          recommendedMaterial: plant.archetypeCategory === 'tree' ? 'sapling' : 'seed'
        });
      }
    }
  };

  const handleMaterialSelect = (materialType: string, materialData: any = null) => {
    setSelectedMaterial({
      type: materialType,
      data: materialData
    });
  };

  const handleCreatePlan = async () => {
    if (!selectedPlant || !selectedMaterial || !gardenId) return;
    
    try {
      const plan = await orchestrator.createPlan({
        archetypeId: selectedPlant.archetypeId,
        plantName: selectedPlant.name,
        varietyName: selectedMaterial.data?.variety_name,
        startingMaterial: selectedMaterial.type,
        materialId: selectedMaterial.data?.id,
        quantity: 1, // TODO: Permettere selezione quantità
        plannedStartDate: new Date()
      });
      
      console.log('Piano creato:', plan);
      
      // Reindirizza alla fase appropriata
      if (selectedMaterial.type === 'seed') {
        router.push(`/app/semenzaio?planId=${plan.id}`);
      } else if (selectedMaterial.type === 'seedling') {
        router.push(`/app/garden?planId=${plan.id}&action=transplant`);
      } else if (selectedMaterial.type === 'sapling') {
        router.push(`/app/garden?planId=${plan.id}&action=plant`);
      }
      
    } catch (error) {
      console.error('Errore nella creazione del piano:', error);
      // Fallback al flusso esistente
      handleLegacyFlow();
    }
  };

  const handleLegacyFlow = () => {
    // Flusso esistente per compatibilità
    if (!selectedPlant) return;
    
    if (selectedMaterial.type === 'seed') {
      const params = new URLSearchParams({
        create: 'true',
        plant: selectedPlant.name,
        variety: selectedPlant.scientific_name,
        archetypeId: selectedPlant.archetypeId || '',
        from: 'pianifica'
      });
      router.push(`/app/semenzaio?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        add: 'true',
        plant: selectedPlant.name,
        method: 'transplant',
        archetypeId: selectedPlant.archetypeId || ''
      });
      router.push(`/app/garden?${params.toString()}`);
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
                  Scegli la pianta e il materiale di partenza
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!selectedPlant ? (
          /* STEP 1: Selezione Pianta */
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

            {/* Lista piante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPlants.slice(0, 12).map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => handlePlantSelect(plant)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{plant.icon || '🌱'}</span>
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
        ) : !selectedMaterial ? (
          /* STEP 2: Selezione Materiale */
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
                <span className="text-2xl">{selectedPlant.icon || '🌱'}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPlant.name}</h2>
                  <p className="text-sm text-gray-600 italic">{selectedPlant.scientific_name}</p>
                </div>
              </div>
            </div>

            {/* Selezione materiale */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Da cosa vuoi partire?</h3>
              
              {availableMaterials ? (
                <div className="space-y-4">
                  {/* Semi */}
                  {availableMaterials.seeds.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🌰</span>
                        <div>
                          <h4 className="font-semibold">Semi disponibili</h4>
                          <p className="text-sm text-gray-600">{availableMaterials.seeds.length} varietà in magazzino</p>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {availableMaterials.seeds.map((seed: any) => (
                          <button
                            key={seed.id}
                            onClick={() => handleMaterialSelect('seed', seed)}
                            className="text-left p-2 border rounded hover:bg-green-50 hover:border-green-300"
                          >
                            <div className="font-medium">{seed.variety_name}</div>
                            <div className="text-sm text-gray-500">
                              Quantità: {seed.quantity_remaining} • Scadenza: {seed.expiry_year}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Piantine */}
                  {availableMaterials.seedlings.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🌿</span>
                        <div>
                          <h4 className="font-semibold">Piantine disponibili</h4>
                          <p className="text-sm text-gray-600">{availableMaterials.seedlings.length} lotti pronti</p>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {availableMaterials.seedlings.map((seedling: any) => (
                          <button
                            key={seedling.id}
                            onClick={() => handleMaterialSelect('seedling', seedling)}
                            className="text-left p-2 border rounded hover:bg-green-50 hover:border-green-300"
                          >
                            <div className="font-medium">{seedling.plant_name}</div>
                            <div className="text-sm text-gray-500">
                              Quantità: {seedling.current_quantity} • Fase: {seedling.phase}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alberelli */}
                  {availableMaterials.saplings.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🌳</span>
                        <div>
                          <h4 className="font-semibold">Alberelli disponibili</h4>
                          <p className="text-sm text-gray-600">{availableMaterials.saplings.length} piante pronte</p>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {availableMaterials.saplings.map((sapling: any) => (
                          <button
                            key={sapling.id}
                            onClick={() => handleMaterialSelect('sapling', sapling)}
                            className="text-left p-2 border rounded hover:bg-green-50 hover:border-green-300"
                          >
                            <div className="font-medium">{sapling.variety_name}</div>
                            <div className="text-sm text-gray-500">
                              Età: {sapling.age_years} anni • Altezza: {sapling.height_cm}cm
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opzione "Acquista nuovo" */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <span className="text-2xl">🛒</span>
                      <h4 className="font-semibold mt-2">Non hai materiale?</h4>
                      <p className="text-sm text-gray-600 mb-3">Procedi comunque per pianificare l'acquisto</p>
                      <button
                        onClick={() => handleMaterialSelect(availableMaterials.recommendedMaterial)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Pianifica acquisto {availableMaterials.recommendedMaterial === 'seed' ? 'semi' : 
                                           availableMaterials.recommendedMaterial === 'seedling' ? 'piantine' : 'alberelli'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Caricamento materiali disponibili...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 3: Conferma e Creazione Piano */
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => setSelectedPlant(null)} className="hover:text-green-600">Piante</button>
              <span>›</span>
              <button onClick={() => setSelectedMaterial(null)} className="hover:text-green-600">{selectedPlant.name}</button>
              <span>›</span>
              <span className="font-medium text-gray-900">Conferma</span>
            </div>

            {/* Riepilogo */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Riepilogo Piano di Coltivazione</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedPlant.icon}</span>
                  <div>
                    <h4 className="font-semibold">{selectedPlant.name}</h4>
                    <p className="text-sm text-gray-600">{selectedPlant.scientific_name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Materiale di partenza:</h5>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span>{selectedMaterial.type === 'seed' ? '🌰' : selectedMaterial.type === 'seedling' ? '🌿' : '🌳'}</span>
                      <span className="font-medium">
                        {selectedMaterial.type === 'seed' ? 'Semi' : 
                         selectedMaterial.type === 'seedling' ? 'Piantine' : 'Alberelli'}
                      </span>
                    </div>
                    {selectedMaterial.data && (
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedMaterial.data.variety_name || selectedMaterial.data.plant_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={handleCreatePlan}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Crea Piano di Coltivazione
                  </button>
                </div>
              </div>
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