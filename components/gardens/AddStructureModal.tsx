import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HydroponicSystemConfig, AquaponicSystemConfig, AeroponicSystemConfig } from '@/types/indoorGrowing';
import { HydroponicConfigForm } from './HydroponicConfigForm';
import { AquaponicConfigForm } from './AquaponicConfigForm';
import { AeroponicConfigForm } from './AeroponicConfigForm';
import { PotSizeConfig } from './PotSizeConfig';
import { BedSizeConfig } from './BedSizeConfig';
import { ContainerSizeConfig } from './ContainerSizeConfig';

interface AddStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (structures: StructureUpdate) => void;
  existingStructures?: ExistingStructures;
}

export interface ExistingStructures {
  hasHydroponic?: boolean;
  hasAquaponic?: boolean;
  hasAeroponic?: boolean;
  hasPots?: boolean;
  hasBeds?: boolean;
  hasContainers?: boolean;
}

export interface StructureUpdate {
  hydroponicConfig?: HydroponicSystemConfig;
  aquaponicConfig?: AquaponicSystemConfig;
  aeroponicConfig?: AeroponicSystemConfig;
  potCount?: number;
  potDiameter?: number;
  bedCount?: number;
  bedLength?: number;
  bedWidth?: number;
  containerCount?: number;
  containerLength?: number;
  containerWidth?: number;
  containerHeight?: number;
}

type StructureType = 'hydroponic' | 'aquaponic' | 'aeroponic' | 'pots' | 'beds' | 'containers';

export const AddStructureModal: React.FC<AddStructureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingStructures = {}
}) => {
  const [selectedStructures, setSelectedStructures] = useState<Set<StructureType>>(new Set());
  const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select');
  const [currentConfiguring, setCurrentConfiguring] = useState<StructureType | null>(null);

  // Stati per configurazioni
  const [hydroponicConfig, setHydroponicConfig] = useState<HydroponicSystemConfig | null>(null);
  const [aquaponicConfig, setAquaponicConfig] = useState<AquaponicSystemConfig | null>(null);
  const [aeroponicConfig, setAeroponicConfig] = useState<AeroponicSystemConfig | null>(null);
  const [potCount, setPotCount] = useState<number>(0);
  const [potDiameter, setPotDiameter] = useState<number>(0);
  const [bedCount, setBedCount] = useState<number>(0);
  const [bedLength, setBedLength] = useState<number>(0);
  const [bedWidth, setBedWidth] = useState<number>(0);
  const [containerCount, setContainerCount] = useState<number>(0);
  const [containerLength, setContainerLength] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const structureOptions: Array<{
    type: StructureType;
    label: string;
    description: string;
    disabled: boolean;
  }> = [
    {
      type: 'hydroponic',
      label: 'Idroponica',
      description: 'Sistemi NFT, DWC, Ebb & Flow',
      disabled: existingStructures.hasHydroponic || false
    },
    {
      type: 'aquaponic',
      label: 'Acquaponica',
      description: 'Sistema integrato con pesci',
      disabled: existingStructures.hasAquaponic || false
    },
    {
      type: 'aeroponic',
      label: 'Aeroponica',
      description: 'Coltivazione con nebulizzazione',
      disabled: existingStructures.hasAeroponic || false
    },
    {
      type: 'pots',
      label: 'Vasi',
      description: 'Vasi in terracotta o plastica',
      disabled: existingStructures.hasPots || false
    },
    {
      type: 'beds',
      label: 'Letti Rialzati',
      description: 'Cassoni rialzati in legno',
      disabled: existingStructures.hasBeds || false
    },
    {
      type: 'containers',
      label: 'Cassoni/Vasche',
      description: 'Contenitori per coltivazione',
      disabled: existingStructures.hasContainers || false
    }
  ];

  const handleToggleStructure = (type: StructureType) => {
    const newSelected = new Set(selectedStructures);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedStructures(newSelected);
  };

  const handleStartConfiguration = () => {
    if (selectedStructures.size === 0) {
      alert('Seleziona almeno una struttura da aggiungere');
      return;
    }
    setCurrentStep('configure');
    // Inizia con la prima struttura selezionata
    const firstStructure = Array.from(selectedStructures)[0];
    setCurrentConfiguring(firstStructure);
  };

  const handleNextConfiguration = () => {
    const structuresArray = Array.from(selectedStructures);
    const currentIndex = structuresArray.indexOf(currentConfiguring!);

    if (currentIndex < structuresArray.length - 1) {
      // Passa alla prossima struttura
      setCurrentConfiguring(structuresArray[currentIndex + 1]);
    } else {
      // Finito - salva tutto
      handleSaveAll();
    }
  };

  const handleSaveAll = () => {
    const update: StructureUpdate = {};

    if (selectedStructures.has('hydroponic') && hydroponicConfig) {
      update.hydroponicConfig = hydroponicConfig;
    }
    if (selectedStructures.has('aquaponic') && aquaponicConfig) {
      update.aquaponicConfig = aquaponicConfig;
    }
    if (selectedStructures.has('aeroponic') && aeroponicConfig) {
      update.aeroponicConfig = aeroponicConfig;
    }
    if (selectedStructures.has('pots')) {
      update.potCount = potCount;
      update.potDiameter = potDiameter;
    }
    if (selectedStructures.has('beds')) {
      update.bedCount = bedCount;
      update.bedLength = bedLength;
      update.bedWidth = bedWidth;
    }
    if (selectedStructures.has('containers')) {
      update.containerCount = containerCount;
      update.containerLength = containerLength;
      update.containerWidth = containerWidth;
      update.containerHeight = containerHeight;
    }

    onSave(update);
    handleClose();
  };

  const handleClose = () => {
    setSelectedStructures(new Set());
    setCurrentStep('select');
    setCurrentConfiguring(null);
    // Reset configurazioni
    setHydroponicConfig(null);
    setAquaponicConfig(null);
    setAeroponicConfig(null);
    setPotCount(0);
    setPotDiameter(0);
    setBedCount(0);
    setBedLength(0);
    setBedWidth(0);
    setContainerCount(0);
    setContainerLength(0);
    setContainerWidth(0);
    setContainerHeight(0);
    onClose();
  };

  if (!isOpen) return null;

  const structureLabels: Record<StructureType, string> = {
    hydroponic: 'Idroponica',
    aquaponic: 'Acquaponica',
    aeroponic: 'Aeroponica',
    pots: 'Vasi',
    beds: 'Letti Rialzati',
    containers: 'Cassoni/Vasche'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {currentStep === 'select' ? 'Aggiungi Strutture' : `Configura ${structureLabels[currentConfiguring!]}`}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Chiudi"
            >
              <X size={24} />
            </button>
          </div>

          {/* Step 1: Selezione strutture */}
          {currentStep === 'select' && (
            <div className="space-y-6">
              <p className="text-gray-700">
                Seleziona le strutture che vuoi aggiungere al tuo orto:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4">
                {structureOptions.map((option) => (
                  <div
                    key={option.type}
                    className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                      option.disabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : selectedStructures.has(option.type)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                    onClick={() => !option.disabled && handleToggleStructure(option.type)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStructures.has(option.type)}
                        disabled={option.disabled}
                        onChange={() => {}}
                        className="mt-1 h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{option.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        {option.disabled && (
                          <p className="text-xs text-orange-600 mt-2">Già presente nell'orto</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleStartConfiguration}
                  disabled={selectedStructures.size === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continua ({selectedStructures.size} selezionate)
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Configurazione strutture */}
          {currentStep === 'configure' && currentConfiguring && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Configura i dettagli per: <strong>{structureLabels[currentConfiguring]}</strong>
                  {' '}({Array.from(selectedStructures).indexOf(currentConfiguring) + 1} di {selectedStructures.size})
                </p>
              </div>

              {currentConfiguring === 'hydroponic' && (
                <HydroponicConfigForm
                  initialConfig={hydroponicConfig || undefined}
                  onSubmit={(config) => setHydroponicConfig(config)}
                />
              )}

              {currentConfiguring === 'aquaponic' && (
                <AquaponicConfigForm
                  initialConfig={aquaponicConfig || undefined}
                  onSubmit={(config) => setAquaponicConfig(config)}
                />
              )}

              {currentConfiguring === 'aeroponic' && (
                <AeroponicConfigForm
                  initialConfig={aeroponicConfig || undefined}
                  onSubmit={(config) => setAeroponicConfig(config)}
                />
              )}

              {currentConfiguring === 'pots' && (
                <PotSizeConfig
                  initialCount={potCount}
                  initialDiameter={potDiameter}
                  onConfigChange={(count: number, diameter: number) => {
                    setPotCount(count);
                    setPotDiameter(diameter);
                  }}
                />
              )}

              {currentConfiguring === 'beds' && (
                <BedSizeConfig
                  initialCount={bedCount}
                  initialLength={bedLength}
                  initialWidth={bedWidth}
                  onConfigChange={(count: number, length: number, width: number) => {
                    setBedCount(count);
                    setBedLength(length);
                    setBedWidth(width);
                  }}
                />
              )}

              {currentConfiguring === 'containers' && (
                <ContainerSizeConfig
                  initialCount={containerCount}
                  initialLength={containerLength}
                  initialWidth={containerWidth}
                  initialHeight={containerHeight}
                  containerType="Cassone"
                  onConfigChange={(count: number, length: number, width: number, height: number, _holes: number, _areaSqMeters: number) => {
                    setContainerCount(count);
                    setContainerLength(length);
                    setContainerWidth(width);
                    setContainerHeight(height);
                  }}
                />
              )}

              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => {
                    setCurrentStep('select');
                    setCurrentConfiguring(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Indietro
                </button>
                <button
                  onClick={handleNextConfiguration}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  {Array.from(selectedStructures).indexOf(currentConfiguring) === selectedStructures.size - 1
                    ? 'Salva Tutto'
                    : 'Avanti'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
