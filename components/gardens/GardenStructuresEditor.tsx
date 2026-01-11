import React, { useState, useEffect } from 'react';
import { Garden, GardenType, StructureConfig } from '@/types';
import { SizeConfigurationStep } from './SizeConfigurationStep';
import { GreenhouseConfig } from '@/types/greenhouse';
import { HydroponicSystemConfig, AquaponicSystemConfig, AeroponicSystemConfig, IndoorGrowingConfig } from '@/types/indoorGrowing';
import { AreaUnit, convertToSqMeters, convertFromSqMeters } from '@/utils/areaConverter';
import { X, Save, Grid } from 'lucide-react';

interface GardenStructuresEditorProps {
  garden: Garden;
  onSave: (updatedGarden: Garden) => void;
  onCancel: () => void;
}

export const GardenStructuresEditor: React.FC<GardenStructuresEditorProps> = ({
  garden,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  
  // Stati per le strutture base
  const [potCount, setPotCount] = useState<number>(0);
  const [potDiameter, setPotDiameter] = useState<number>(0);
  const [bedCount, setBedCount] = useState<number>(0);
  const [bedLength, setBedLength] = useState<number>(0);
  const [bedWidth, setBedWidth] = useState<number>(0);
  const [bedHeight, setBedHeight] = useState<number>(0);
  const [bedHoles, setBedHoles] = useState<number>(0);
  const [containerCount, setContainerCount] = useState<number>(0);
  const [containerLength, setContainerLength] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [containerHoles, setContainerHoles] = useState<number>(0);
  const [tankCount, setTankCount] = useState<number>(0);
  const [tankLength, setTankLength] = useState<number>(0);
  const [tankWidth, setTankWidth] = useState<number>(0);
  const [tankHeight, setTankHeight] = useState<number>(0);
  const [tankHoles, setTankHoles] = useState<number>(0);
  const [openFieldSize, setOpenFieldSize] = useState<string>('');
  const [openFieldUnit, setOpenFieldUnit] = useState<AreaUnit>('sqm');
  
  // Stati per strutture avanzate
  const [greenhouseConfig, setGreenhouseConfig] = useState<GreenhouseConfig | undefined>(garden.greenhouseConfig);
  const [hydroponicConfig, setHydroponicConfig] = useState<HydroponicSystemConfig | undefined>(garden.hydroponicConfig);
  const [aquaponicConfig, setAquaponicConfig] = useState<AquaponicSystemConfig | undefined>(garden.aquaponicConfig);
  const [aeroponicConfig, setAeroponicConfig] = useState<AeroponicSystemConfig | undefined>(garden.aeroponicConfig);
  const [indoorConfig, setIndoorConfig] = useState<IndoorGrowingConfig | undefined>(garden.indoorConfig);
  
  // Stato per struttura config e dimensione calcolata
  const [structureConfig, setStructureConfig] = useState<StructureConfig | undefined>(garden.structureConfig);
  const [calculatedSizeSqMeters, setCalculatedSizeSqMeters] = useState<number>(garden.sizeSqMeters || 0);

  // Inizializza stati da structureConfig esistente
  useEffect(() => {
    if (garden.structureConfig) {
      const config = garden.structureConfig;
      
      // Ripristina campo aperto
      if (config.openField) {
        setOpenFieldSize(config.openField.size.toString());
        setOpenFieldUnit(config.openField.unit);
      }
      
      // Ripristina vasi
      if (config.pots && config.pots.length > 0) {
        const pot = config.pots[0];
        setPotCount(pot.count);
        setPotDiameter(pot.diameter);
      }
      
      // Ripristina letti
      if (config.beds && config.beds.length > 0) {
        const bed = config.beds[0];
        setBedCount(bed.count);
        setBedLength(bed.length);
        setBedWidth(bed.width);
        setBedHeight(bed.height);
        setBedHoles(bed.holes || 0);
      }
      
      // Ripristina cassoni
      if (config.containers && config.containers.length > 0) {
        const container = config.containers[0];
        setContainerCount(container.count);
        setContainerLength(container.length);
        setContainerWidth(container.width);
        setContainerHeight(container.height);
        setContainerHoles(container.holes || 0);
      }
      
      // Ripristina vasche
      if (config.tanks && config.tanks.length > 0) {
        const tank = config.tanks[0];
        setTankCount(tank.count);
        setTankLength(tank.length);
        setTankWidth(tank.width);
        setTankHeight(tank.height);
        setTankHoles(tank.holes || 0);
      }
    } else {
      // Se non c'è structureConfig, prova a inizializzare da sizeSqMeters esistente
      if (garden.sizeSqMeters && garden.sizeSqMeters > 0) {
        const displayValue = convertFromSqMeters(garden.sizeSqMeters, garden.sizeUnit || 'sqm');
        setOpenFieldSize(displayValue.toFixed(2));
        setOpenFieldUnit(garden.sizeUnit || 'sqm');
      }
    }
  }, [garden]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedGarden: Garden = {
        ...garden,
        structureConfig: structureConfig,
        sizeSqMeters: calculatedSizeSqMeters,
        sizeUnit: 'sqm',
        greenhouseConfig: greenhouseConfig,
        hydroponicConfig: hydroponicConfig,
        aquaponicConfig: aquaponicConfig,
        aeroponicConfig: aeroponicConfig,
        indoorConfig: indoorConfig,
      };
      
      onSave(updatedGarden);
    } catch (error) {
      console.error('Error saving garden structures:', error);
      alert('Errore nel salvataggio delle modifiche. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Grid size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Modifica Strutture</h2>
              <p className="text-sm text-gray-500">{garden.name}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Aggiungi o modifica le strutture del tuo orto.</strong> Puoi configurare più tipi di strutture contemporaneamente. 
              La superficie totale verrà calcolata automaticamente sommando tutti gli elementi.
            </p>
          </div>

          <SizeConfigurationStep
            gardenType={garden.gardenType || ''}
            onSizeCalculated={(sizeSqMeters, unit) => {
              setCalculatedSizeSqMeters(sizeSqMeters);
            }}
            initialSize={garden.sizeSqMeters}
            initialUnit={garden.sizeUnit || 'sqm'}
            greenhouseConfig={greenhouseConfig}
            onGreenhouseConfigChange={setGreenhouseConfig}
            hydroponicConfig={hydroponicConfig}
            onHydroponicConfigChange={setHydroponicConfig}
            aquaponicConfig={aquaponicConfig}
            onAquaponicConfigChange={setAquaponicConfig}
            aeroponicConfig={aeroponicConfig}
            onAeroponicConfigChange={setAeroponicConfig}
            indoorConfig={indoorConfig}
            onIndoorConfigChange={setIndoorConfig}
            potCount={potCount}
            potDiameter={potDiameter}
            onPotConfigChange={(count, diameter) => {
              setPotCount(count);
              setPotDiameter(diameter);
            }}
            bedCount={bedCount}
            bedLength={bedLength}
            bedWidth={bedWidth}
            bedHeight={bedHeight}
            bedHoles={bedHoles}
            onBedConfigChange={(count, length, width, height, holes) => {
              setBedCount(count);
              setBedLength(length);
              setBedWidth(width);
              setBedHeight(height);
              setBedHoles(holes);
            }}
            containerCount={containerCount}
            containerLength={containerLength}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            containerHoles={containerHoles}
            onContainerConfigChange={(count, length, width, height, holes) => {
              setContainerCount(count);
              setContainerLength(length);
              setContainerWidth(width);
              setContainerHeight(height);
              setContainerHoles(holes);
            }}
            tankCount={tankCount}
            tankLength={tankLength}
            tankWidth={tankWidth}
            tankHeight={tankHeight}
            tankHoles={tankHoles}
            onTankConfigChange={(count, length, width, height, holes) => {
              setTankCount(count);
              setTankLength(length);
              setTankWidth(width);
              setTankHeight(height);
              setTankHoles(holes);
            }}
            openFieldSize={openFieldSize}
            openFieldUnit={openFieldUnit}
            onOpenFieldConfigChange={(size, unit) => {
              setOpenFieldSize(size);
              setOpenFieldUnit(unit);
            }}
            onStructureConfigChange={(config) => {
              setStructureConfig(config);
            }}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={loading || calculatedSizeSqMeters <= 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
          >
            <Save size={18} />
            {loading ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </div>
    </div>
  );
};

