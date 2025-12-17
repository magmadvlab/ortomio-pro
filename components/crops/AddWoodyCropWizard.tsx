import React, { useState, useEffect } from 'react';
import { Garden, GardenTask } from '../../types';
import { useStorage } from '../../packages/core/hooks/useStorage';
import { fruitTreeMasterSheets } from '../../data/fruitTreeMasterSheets';
import { oliveMasterSheets } from '../../data/oliveMasterSheets';
import { vineMasterSheets } from '../../data/vineMasterSheets';
import { FruitTreeCrop } from '../../types/fruitTree';
import { OliveCrop } from '../../types/olive';
import { VineCrop } from '../../types/vine';
import { isChillRequirementMet } from '../../logic/fruitTreeEngine';
import { detectExistingOrchard, detectExistingOliveGrove, detectExistingVineyard } from '../../services/orchardDetectionService';
import { CreateOrchardWizard } from './CreateOrchardWizard';
import { X, ArrowRight, ArrowLeft, TreePine, CircleDot, Grape, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AddWoodyCropWizardProps {
  garden: Garden;
  onComplete: (task: GardenTask) => void;
  onCancel: () => void;
  initialCropType?: 'FruitTree' | 'Olive' | 'Vine';
  defaultVarietyType?: 'Wine' | 'Table' | 'Oil' | 'Dual-purpose'; // Precompila varietyType da alias
}

type CropType = 'FruitTree' | 'Olive' | 'Vine';
type WizardStep = 'type' | 'details' | 'compatibility' | 'complete';

export const AddWoodyCropWizard: React.FC<AddWoodyCropWizardProps> = ({
  garden,
  onComplete,
  onCancel,
  initialCropType,
  defaultVarietyType
}) => {
  const { storageProvider } = useStorage();
  const [step, setStep] = useState<WizardStep>(initialCropType ? 'details' : 'type');
  const [cropType, setCropType] = useState<CropType | null>(initialCropType || null);
  
  // Rilevamento frutteto/oliveto/vigneto
  const [showOrchardWizard, setShowOrchardWizard] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  // Dettagli comuni
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [isNewPlanting, setIsNewPlanting] = useState(true);
  const [treeAge, setTreeAge] = useState<string>('');
  
  // Dettagli specifici per tipo
  // Precompila varietyType da defaultVarietyType se disponibile
  const getInitialVarietyTypeVine = (): 'Wine' | 'Table' => {
    if (defaultVarietyType === 'Wine') return 'Wine';
    if (defaultVarietyType === 'Table') return 'Table';
    return 'Wine'; // default
  };
  
  const getInitialVarietyTypeOlive = (): 'Oil' | 'Table' | 'Dual-purpose' => {
    if (defaultVarietyType === 'Oil') return 'Oil';
    if (defaultVarietyType === 'Table') return 'Table';
    if (defaultVarietyType === 'Dual-purpose') return 'Dual-purpose';
    return 'Oil'; // default
  };
  
  const [trainingSystem, setTrainingSystem] = useState<'Guyot' | 'Cordon' | 'Pergola' | 'Alberello'>('Guyot');
  const [varietyTypeOlive, setVarietyTypeOlive] = useState<'Oil' | 'Table' | 'Dual-purpose'>(getInitialVarietyTypeOlive());
  const [varietyTypeVine, setVarietyTypeVine] = useState<'Wine' | 'Table'>(getInitialVarietyTypeVine());
  const [treeType, setTreeType] = useState<'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry'>('Pome');
  
  // Rileva frutteto/oliveto/vigneto quando si seleziona il tipo
  useEffect(() => {
    const checkExisting = async () => {
      if (!cropType || !garden.id) return;
      
      setIsChecking(true);
      try {
        const tasks = await storageProvider.getTasks(garden.id);
        
        if (cropType === 'FruitTree') {
          const detection = await detectExistingOrchard(garden.id, tasks);
          setDetectionResult(detection);
          // Se non esiste frutteto configurato nel garden, mostra wizard
          if (!detection.exists && !garden.orchardConfig) {
            setShowOrchardWizard(true);
          }
        } else if (cropType === 'Olive') {
          const detection = await detectExistingOliveGrove(garden.id, tasks);
          setDetectionResult(detection);
          if (!detection.exists && !garden.oliveGroveConfig) {
            setShowOrchardWizard(true);
          }
        } else if (cropType === 'Vine') {
          const detection = await detectExistingVineyard(garden.id, tasks);
          setDetectionResult(detection);
          if (!detection.exists && !garden.vineyardConfig) {
            setShowOrchardWizard(true);
          }
        }
      } catch (error) {
        console.error('Error detecting orchard/grove/vineyard:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkExisting();
  }, [cropType, garden.id, storageProvider]);

  const getAvailableVarieties = () => {
    if (cropType === 'FruitTree') {
      return fruitTreeMasterSheets.map(sheet => ({
        id: sheet.id,
        name: sheet.commonName,
        data: sheet as FruitTreeCrop
      }));
    } else if (cropType === 'Olive') {
      return oliveMasterSheets.map(sheet => ({
        id: sheet.id,
        name: sheet.commonName,
        data: sheet as OliveCrop
      }));
    } else if (cropType === 'Vine') {
      return vineMasterSheets.map(sheet => ({
        id: sheet.id,
        name: sheet.commonName,
        data: sheet as VineCrop
      }));
    }
    return [];
  };

  const selectedVarietyData = getAvailableVarieties().find(v => v.id === selectedVariety)?.data;

  const handleComplete = async () => {
    if (!cropType || !selectedVarietyData) return;

    const age = isNewPlanting ? 0 : parseInt(treeAge) || 0;
    const today = new Date().toISOString().split('T')[0];

    const baseTask: Partial<GardenTask> = {
      gardenId: garden.id,
      plantName: selectedVarietyData.commonName,
      date: today,
      taskType: 'Sowing',
      completed: false,
      locationType: 'Ground',
      initialQuantity: 1,
      currentQuantity: 1,
    };

    if (cropType === 'FruitTree') {
      const fruitTreeData = selectedVarietyData as FruitTreeCrop;
      const task: GardenTask = {
        ...baseTask,
        fruitTreeData: {
          treeAge: age,
          pruningType: 'Formative',
          pruningSeason: 'Winter'
        },
        archetypeId: 'L3' as any,
      } as GardenTask;
      await storageProvider.createTask(task);
      onComplete(task);
    } else if (cropType === 'Olive') {
      const oliveData = selectedVarietyData as OliveCrop;
      const task: GardenTask = {
        ...baseTask,
        oliveData: {
          varietyType: varietyTypeOlive,
          harvestMethod: oliveData.harvestMethod || 'Manual',
          pruningType: 'Winter'
        },
        archetypeId: 'L2' as any,
      } as GardenTask;
      await storageProvider.createTask(task);
      onComplete(task);
    } else if (cropType === 'Vine') {
      const vineData = selectedVarietyData as VineCrop;
      const task: GardenTask = {
        ...baseTask,
        vineData: {
          varietyType: varietyTypeVine, // Usa lo stato invece del master sheet
          trainingSystem: trainingSystem,
          pruningType: 'Winter',
          operationType: 'Pruning'
        },
        archetypeId: 'L1' as any,
      } as GardenTask;
      await storageProvider.createTask(task);
      onComplete(task);
    }
  };

  const checkCompatibility = () => {
    if (!selectedVarietyData || cropType !== 'FruitTree') return null;
    
    const fruitTreeData = selectedVarietyData as FruitTreeCrop;
    if (!fruitTreeData.chillHours) return null;

    const chillMet = garden.coordinates 
      ? isChillRequirementMet(fruitTreeData, garden.coordinates, garden.altitudeMeters)
      : true;

    return {
      compatible: chillMet,
      message: chillMet 
        ? 'Clima compatibile con questa varietà'
        : `Questa varietà richiede ${fruitTreeData.chillHours} ore di freddo. La tua località potrebbe non soddisfare questo requisito.`
    };
  };

  const compatibility = checkCompatibility();
  
  // Se deve mostrare wizard creazione frutteto/oliveto/vigneto
  if (showOrchardWizard) {
    return (
      <CreateOrchardWizard
        garden={garden}
        orchardType={cropType === 'FruitTree' ? 'orchard' : cropType === 'Olive' ? 'oliveGrove' : 'vineyard'}
        onComplete={(config) => {
          setShowOrchardWizard(false);
          // Ricarica garden per avere config aggiornata
          storageProvider.getGarden(garden.id).then(updatedGarden => {
            if (updatedGarden) {
              Object.assign(garden, updatedGarden);
            }
          });
        }}
        onCancel={() => {
          setShowOrchardWizard(false);
          // Opzionale: permettere di saltare e aggiungere direttamente
          // Per ora, se cancella torna indietro
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Aggiungi {cropType === 'FruitTree' ? 'Albero da Frutto' : cropType === 'Olive' ? 'Olivo' : 'Vite'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Tipo Coltura */}
          {step === 'type' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Seleziona Tipo Coltura</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setCropType('FruitTree');
                    setStep('details');
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <TreePine className="mx-auto mb-2 text-green-600" size={32} />
                  <div className="font-semibold">Albero da Frutto</div>
                  <div className="text-sm text-gray-600 mt-1">Melo, Pero, Pesco...</div>
                </button>
                <button
                  onClick={() => {
                    setCropType('Olive');
                    setStep('details');
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <CircleDot className="mx-auto mb-2 text-green-600" size={32} />
                  <div className="font-semibold">Olivo</div>
                  <div className="text-sm text-gray-600 mt-1">Da olio o mensa</div>
                </button>
                <button
                  onClick={() => {
                    setCropType('Vine');
                    setStep('details');
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
                >
                  <Grape className="mx-auto mb-2 text-green-600" size={32} />
                  <div className="font-semibold">Vite</div>
                  <div className="text-sm text-gray-600 mt-1">Da vino o tavola</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Dettagli */}
          {step === 'details' && cropType && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Dettagli {cropType === 'FruitTree' ? 'Albero' : cropType === 'Olive' ? 'Olivo' : 'Vite'}</h3>
              
              {/* Info frutteto/oliveto/vigneto esistente */}
              {detectionResult?.exists && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-1">
                        {cropType === 'FruitTree' && `Frutteto esistente: ${detectionResult.category || 'Misto'}`}
                        {cropType === 'Olive' && `Oliveto esistente: ${detectionResult.type || 'Misto'}`}
                        {cropType === 'Vine' && `Vigneto esistente: ${detectionResult.type || 'Misto'}`}
                      </p>
                      <p className="text-blue-700">
                        {detectionResult.count} {cropType === 'Vine' ? 'viti' : 'alberi'} già presenti.
                        {detectionResult.varieties && detectionResult.varieties.length > 0 && (
                          <span> Varietà: {detectionResult.varieties.slice(0, 3).join(', ')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isChecking && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Verifica configurazione esistente...</p>
                </div>
              )}
              
              {/* Varietà */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varietà
                </label>
                <select
                  value={selectedVariety}
                  onChange={(e) => setSelectedVariety(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleziona varietà...</option>
                  {getAvailableVarieties().map(variety => (
                    <option key={variety.id} value={variety.id}>
                      {variety.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Età / Nuovo Impianto */}
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isNewPlanting}
                    onChange={(e) => setIsNewPlanting(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Nuovo impianto</span>
                </label>
                {!isNewPlanting && (
                  <input
                    type="number"
                    value={treeAge}
                    onChange={(e) => setTreeAge(e.target.value)}
                    placeholder="Età in anni"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mt-2"
                  />
                )}
              </div>

              {/* Dettagli specifici per tipo */}
              {cropType === 'Vine' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo Utilizzo
                    </label>
                    <select
                      value={varietyTypeVine}
                      onChange={(e) => setVarietyTypeVine(e.target.value as 'Wine' | 'Table')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Wine">Da Vino</option>
                      <option value="Table">Da Tavola</option>
                    </select>
                    {defaultVarietyType && (
                      <p className="mt-1 text-xs text-gray-500">
                        Precompilato da ricerca: {defaultVarietyType === 'Wine' ? 'Da Vino' : 'Da Tavola'}
                      </p>
                    )}
                  </div>
                  {selectedVarietyData && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sistema di Allevamento
                      </label>
                      <select
                        value={trainingSystem}
                        onChange={(e) => setTrainingSystem(e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Guyot">Guyot</option>
                        <option value="Cordon">Cordon</option>
                        <option value="Pergola">Pergola</option>
                        <option value="Alberello">Alberello</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {cropType === 'Olive' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo Utilizzo
                  </label>
                  <select
                    value={varietyTypeOlive}
                    onChange={(e) => setVarietyTypeOlive(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Oil">Da Olio</option>
                    <option value="Table">Da Mensa</option>
                    <option value="Dual-purpose">Dual-purpose</option>
                  </select>
                </div>
              )}

              {/* Verifica Compatibilità (solo per nuovi impianti) */}
              {isNewPlanting && compatibility && (
                <div className={`p-4 rounded-lg border-2 mb-4 ${
                  compatibility.compatible 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {compatibility.compatible ? (
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <div className="text-sm">
                      {compatibility.message}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottoni Navigazione */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep('type')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Indietro
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!selectedVariety}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Completa
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

