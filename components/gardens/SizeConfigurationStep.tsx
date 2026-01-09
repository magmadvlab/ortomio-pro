import React, { useEffect, useState, useCallback } from 'react';
import { GardenType, StructureConfig } from '@/types';
import { AreaUnit, convertToSqMeters, convertFromSqMeters } from '@/utils/areaConverter';
import { GreenhouseConfig } from '@/types/greenhouse';
import { HydroponicSystemConfig, AquaponicSystemConfig, AeroponicSystemConfig, IndoorGrowingConfig } from '@/types/indoorGrowing';
import { PotSizeConfig } from './PotSizeConfig';
import { BedSizeConfig } from './BedSizeConfig';
import { ContainerSizeConfig } from './ContainerSizeConfig';
import { OpenFieldSizeConfig, OpenFieldConfig } from './OpenFieldSizeConfig';
import { GreenhouseConfigForm } from './GreenhouseConfigForm';
import { HydroponicConfigForm } from './HydroponicConfigForm';
import { AquaponicConfigForm } from './AquaponicConfigForm';
import { AeroponicConfigForm } from './AeroponicConfigForm';
import { IndoorConfigForm } from './IndoorConfigForm';
import { InfoTooltip } from '../shared/InfoTooltip';
import { Info } from 'lucide-react';

interface SizeConfigurationStepProps {
  gardenType: GardenType | '';
  onSizeCalculated: (sizeSqMeters: number, sizeUnit: AreaUnit) => void;
  initialSize?: number;
  initialUnit?: AreaUnit;
  
  // Configs avanzate
  greenhouseConfig?: GreenhouseConfig;
  onGreenhouseConfigChange?: (config: GreenhouseConfig) => void;
  hydroponicConfig?: HydroponicSystemConfig;
  onHydroponicConfigChange?: (config: HydroponicSystemConfig) => void;
  aquaponicConfig?: AquaponicSystemConfig;
  onAquaponicConfigChange?: (config: AquaponicSystemConfig) => void;
  aeroponicConfig?: AeroponicSystemConfig;
  onAeroponicConfigChange?: (config: AeroponicSystemConfig) => void;
  indoorConfig?: IndoorGrowingConfig;
  onIndoorConfigChange?: (config: IndoorGrowingConfig) => void;
  
  // Configs base
  potCount?: number;
  potDiameter?: number;
  onPotConfigChange?: (count: number, diameter: number) => void;
  bedCount?: number;
  bedLength?: number;
  bedWidth?: number;
  bedHeight?: number;
  bedHoles?: number;
  onBedConfigChange?: (count: number, length: number, width: number, height: number, holes: number) => void;
  containerCount?: number;
  containerLength?: number;
  containerWidth?: number;
  containerHeight?: number;
  containerHoles?: number;
  onContainerConfigChange?: (count: number, length: number, width: number, height: number, holes: number) => void;
  tankCount?: number;
  tankLength?: number;
  tankWidth?: number;
  tankHeight?: number;
  tankHoles?: number;
  onTankConfigChange?: (count: number, length: number, width: number, height: number, holes: number) => void;
  openFieldSize?: string;
  openFieldUnit?: AreaUnit;
  onOpenFieldConfigChange?: (size: string, unit: AreaUnit) => void;
  onStructureConfigChange?: (config: StructureConfig) => void;
}

export const SizeConfigurationStep: React.FC<SizeConfigurationStepProps> = ({
  gardenType,
  onSizeCalculated,
  initialSize,
  initialUnit = 'sqm',
  greenhouseConfig,
  onGreenhouseConfigChange,
  hydroponicConfig,
  onHydroponicConfigChange,
  aquaponicConfig,
  onAquaponicConfigChange,
  aeroponicConfig,
  onAeroponicConfigChange,
  indoorConfig,
  onIndoorConfigChange,
  potCount = 0,
  potDiameter = 0,
  onPotConfigChange,
  bedCount = 0,
  bedLength = 0,
  bedWidth = 0,
  bedHeight = 0,
  bedHoles = 0,
  onBedConfigChange,
  containerCount = 0,
  containerLength = 0,
  containerWidth = 0,
  containerHeight = 0,
  containerHoles = 0,
  onContainerConfigChange,
  tankCount = 0,
  tankLength = 0,
  tankWidth = 0,
  tankHeight = 0,
  tankHoles = 0,
  onTankConfigChange,
  openFieldSize = '',
  openFieldUnit = 'sqm',
  onOpenFieldConfigChange,
  onStructureConfigChange,
}) => {
  // Stati per accumulare le aree di ciascun componente
  const [openFieldAreaSqMeters, setOpenFieldAreaSqMeters] = useState<number>(0);
  const [potsAreaSqMeters, setPotsAreaSqMeters] = useState<number>(0);
  const [bedsAreaSqMeters, setBedsAreaSqMeters] = useState<number>(0);
  const [containersAreaSqMeters, setContainersAreaSqMeters] = useState<number>(0);
  const [tanksAreaSqMeters, setTanksAreaSqMeters] = useState<number>(0);
  const [greenhouseAreaSqMeters, setGreenhouseAreaSqMeters] = useState<number>(0);
  const [indoorAreaSqMeters, setIndoorAreaSqMeters] = useState<number>(0);
  const [hydroponicAreaSqMeters, setHydroponicAreaSqMeters] = useState<number>(0);
  const [aquaponicAreaSqMeters, setAquaponicAreaSqMeters] = useState<number>(0);
  const [aeroponicAreaSqMeters, setAeroponicAreaSqMeters] = useState<number>(0);

  // Stato per memorizzare la configurazione dei filari (rows)
  const [currentRowConfig, setCurrentRowConfig] = useState<OpenFieldConfig['rowConfig'] | undefined>(undefined);

  // Inizializza gli stati dai valori esistenti al mount
  useEffect(() => {
    // Inizializza campo aperto
    if (openFieldSize) {
      const numValue = parseFloat(openFieldSize);
      if (!isNaN(numValue) && numValue > 0) {
        setOpenFieldAreaSqMeters(convertToSqMeters(numValue, openFieldUnit));
      }
    } else if (initialSize && initialSize > 0) {
      setOpenFieldAreaSqMeters(convertToSqMeters(initialSize, initialUnit));
    }

    // Inizializza vasi
    if (potCount > 0 && potDiameter > 0) {
      const areaPerPot = Math.PI * Math.pow(potDiameter / 2, 2) / 10000; // m²
      setPotsAreaSqMeters(potCount * areaPerPot);
    }

    // Inizializza letti
    if (bedCount > 0 && bedLength > 0 && bedWidth > 0) {
      const areaPerBed = (bedLength * bedWidth) / 10000; // m²
      setBedsAreaSqMeters(bedCount * areaPerBed);
    }
  }, []); // Solo al mount

  // Calcola superficie totale SOMMANDO tutte le aree configurate
  useEffect(() => {
    let totalAreaSqMeters = 0;
    
    // Somma tutte le aree configurate
    totalAreaSqMeters += openFieldAreaSqMeters || 0;
    totalAreaSqMeters += potsAreaSqMeters || 0;
    totalAreaSqMeters += bedsAreaSqMeters || 0;
    totalAreaSqMeters += containersAreaSqMeters || 0;
    totalAreaSqMeters += tanksAreaSqMeters || 0;
    totalAreaSqMeters += greenhouseAreaSqMeters || 0;
    totalAreaSqMeters += indoorAreaSqMeters || 0;
    totalAreaSqMeters += hydroponicAreaSqMeters || 0;
    totalAreaSqMeters += aquaponicAreaSqMeters || 0;
    totalAreaSqMeters += aeroponicAreaSqMeters || 0;
    
    onSizeCalculated(totalAreaSqMeters, 'sqm');
  }, [
    openFieldAreaSqMeters,
    potsAreaSqMeters,
    bedsAreaSqMeters,
    containersAreaSqMeters,
    tanksAreaSqMeters,
    greenhouseAreaSqMeters,
    indoorAreaSqMeters,
    hydroponicAreaSqMeters,
    aquaponicAreaSqMeters,
    aeroponicAreaSqMeters,
    onSizeCalculated
  ]);

  // Calcola area serre quando cambia la configurazione
  useEffect(() => {
    if (!greenhouseConfig) {
      setGreenhouseAreaSqMeters(0);
      return;
    }

    let area = 0;
    
    // Gestisci strutture multiple se presenti
    if ('structures' in greenhouseConfig && Array.isArray(greenhouseConfig.structures)) {
      greenhouseConfig.structures.forEach((structure) => {
        if (structure.length && structure.width) {
          // length e width sono in metri per GreenhouseStructure
          area += structure.length * structure.width;
        }
      });
    } else {
      // Configurazione singola (retrocompatibilità)
      if (greenhouseConfig.length && greenhouseConfig.width) {
        // length e width sono in metri per GreenhouseConfig
        area = greenhouseConfig.length * greenhouseConfig.width;
      }
    }
    
    setGreenhouseAreaSqMeters(area);
  }, [greenhouseConfig]);

  // Calcola area indoor quando cambia la configurazione
  useEffect(() => {
    if (!indoorConfig?.growSpace?.length || !indoorConfig?.growSpace?.width) {
      setIndoorAreaSqMeters(0);
      return;
    }

    // growSpace.length e width sono in cm
    const area = (indoorConfig.growSpace.length * indoorConfig.growSpace.width) / 10000; // cm² -> m²
    setIndoorAreaSqMeters(area);
  }, [indoorConfig]);

  // Calcola area idroponica quando cambia la configurazione
  useEffect(() => {
    if (!hydroponicConfig) {
      setHydroponicAreaSqMeters(0);
      return;
    }

    let area = 0;
    
    if (hydroponicConfig.nftConfig) {
      // NFT: channelLength è in cm, assumiamo 10cm larghezza canale
      const channelArea = (hydroponicConfig.nftConfig.channelLength * 10) / 10000; // cm² -> m²
      area = hydroponicConfig.nftConfig.channelCount * channelArea;
    } else if (hydroponicConfig.dwcConfig) {
      // DWC: assumiamo secchio circolare ø30cm (raggio 0.15m)
      const bucketArea = Math.PI * Math.pow(0.15, 2); // m²
      area = hydroponicConfig.dwcConfig.bucketCount * bucketArea;
    }
    
    setHydroponicAreaSqMeters(area);
  }, [hydroponicConfig]);

  // Calcola area acquaponica quando cambia la configurazione
  useEffect(() => {
    // Per ora lasciamo 0, da implementare quando la config sarà disponibile
    setAquaponicAreaSqMeters(0);
  }, [aquaponicConfig]);

  // Calcola area aeroponica quando cambia la configurazione
  useEffect(() => {
    // Per ora lasciamo 0, da implementare quando la config sarà disponibile
    setAeroponicAreaSqMeters(0);
  }, [aeroponicConfig]);

  const handlePotChange = useCallback((count: number, diameter: number, area: number) => {
    // area è già in m², calcolata dal componente PotSizeConfig
    setPotsAreaSqMeters(area);

    if (onPotConfigChange) {
      onPotConfigChange(count, diameter);
    }
  }, [onPotConfigChange]);

  const handleBedChange = useCallback((count: number, length: number, width: number, height: number, holes: number, area: number) => {
    // area è già in m², calcolata dal componente BedSizeConfig
    setBedsAreaSqMeters(area);

    if (onBedConfigChange) {
      onBedConfigChange(count, length, width, height, holes);
    }
  }, [onBedConfigChange]);

  const handleContainerChange = useCallback((count: number, length: number, width: number, height: number, holes: number, area: number) => {
    // area è già in m², calcolata dal componente ContainerSizeConfig
    setContainersAreaSqMeters(area);

    if (onContainerConfigChange) {
      onContainerConfigChange(count, length, width, height, holes);
    }
  }, [onContainerConfigChange]);

  const handleTankChange = useCallback((count: number, length: number, width: number, height: number, holes: number, area: number) => {
    // area è già in m², calcolata dal componente ContainerSizeConfig
    setTanksAreaSqMeters(area);

    if (onTankConfigChange) {
      onTankConfigChange(count, length, width, height, holes);
    }
  }, [onTankConfigChange]);

  const handleOpenFieldChange = useCallback((config: OpenFieldConfig) => {
    // sizeSqMeters è già in m², convertito dal componente OpenFieldSizeConfig
    setOpenFieldAreaSqMeters(config.sizeSqMeters);

    // Salva la configurazione dei filari se presente
    setCurrentRowConfig(config.rowConfig);

    if (onOpenFieldConfigChange) {
      const displayValue = convertFromSqMeters(config.sizeSqMeters, config.sizeUnit).toFixed(2);
      onOpenFieldConfigChange(displayValue, config.sizeUnit);
    }
  }, [onOpenFieldConfigChange]);

  const handleGreenhouseConfigChange = useCallback((config: GreenhouseConfig) => {
    // L'area viene calcolata nel useEffect dedicato
    if (onGreenhouseConfigChange) {
      onGreenhouseConfigChange(config);
    }
  }, [onGreenhouseConfigChange]);

  const handleIndoorConfigChange = useCallback((config: IndoorGrowingConfig) => {
    // L'area viene calcolata nel useEffect dedicato
    if (onIndoorConfigChange) {
      onIndoorConfigChange(config);
    }
  }, [onIndoorConfigChange]);

  const handleHydroponicConfigChange = useCallback((config: HydroponicSystemConfig) => {
    // L'area viene calcolata nel useEffect dedicato
    if (onHydroponicConfigChange) {
      onHydroponicConfigChange(config);
    }
  }, [onHydroponicConfigChange]);

  const handleAquaponicConfigChange = useCallback((config: AquaponicSystemConfig) => {
    // L'area viene calcolata nel useEffect dedicato
    if (onAquaponicConfigChange) {
      onAquaponicConfigChange(config);
    }
  }, [onAquaponicConfigChange]);

  const handleAeroponicConfigChange = useCallback((config: AeroponicSystemConfig) => {
    // L'area viene calcolata nel useEffect dedicato
    if (onAeroponicConfigChange) {
      onAeroponicConfigChange(config);
    }
  }, [onAeroponicConfigChange]);

  // Costruisce oggetto StructureConfig completo da tutti gli stati
  const buildStructureConfig = (): StructureConfig => {
    const config: StructureConfig = {};

    // Campo aperto
    if (openFieldSize) {
      const numValue = parseFloat(openFieldSize);
      if (!isNaN(numValue) && numValue > 0) {
        config.openField = {
          size: numValue,
          unit: openFieldUnit
        };
      }
    }

    // Filari (rows) - AGGIUNTO per salvare la configurazione dei filari
    if (currentRowConfig && currentRowConfig.numberOfRows > 0 && currentRowConfig.lengthMeters > 0) {
      config.rows = [];
      for (let i = 0; i < currentRowConfig.numberOfRows; i++) {
        config.rows.push({
          name: `Filare ${i + 1}`,
          length: currentRowConfig.lengthMeters,
          distance: currentRowConfig.defaultRowSpacingCm,
          plantSpacing: undefined
        });
      }
    }

    // Vasi
    if (potCount > 0 && potDiameter > 0) {
      config.pots = [{
        count: potCount,
        diameter: potDiameter
      }];
    }

    // Letti
    if (bedCount > 0 && bedLength > 0 && bedWidth > 0) {
      config.beds = [{
        count: bedCount,
        length: bedLength,
        width: bedWidth,
        height: bedHeight,
        holes: bedHoles > 0 ? bedHoles : undefined
      }];
    }

    // Cassoni
    if (containerCount > 0 && containerLength > 0 && containerWidth > 0) {
      config.containers = [{
        count: containerCount,
        length: containerLength,
        width: containerWidth,
        height: containerHeight,
        holes: containerHoles > 0 ? containerHoles : undefined
      }];
    }

    // Vasche
    if (tankCount > 0 && tankLength > 0 && tankWidth > 0) {
      config.tanks = [{
        count: tankCount,
        length: tankLength,
        width: tankWidth,
        height: tankHeight,
        holes: tankHoles > 0 ? tankHoles : undefined
      }];
    }

    return config;
  };

  // Notifica cambiamenti nella configurazione strutture
  useEffect(() => {
    if (onStructureConfigChange) {
      const config = buildStructureConfig();
      onStructureConfigChange(config);
    }
  }, [
    openFieldSize,
    openFieldUnit,
    currentRowConfig,
    potCount,
    potDiameter,
    bedCount,
    bedLength,
    bedWidth,
    bedHeight,
    bedHoles,
    containerCount,
    containerLength,
    containerWidth,
    containerHeight,
    containerHoles,
    tankCount,
    tankLength,
    tankWidth,
    tankHeight,
    tankHoles,
    onStructureConfigChange
  ]);

  // Calcola superficie totale per il riepilogo
  const calculateTotalArea = (): number => {
    return (
      (openFieldAreaSqMeters || 0) +
      (potsAreaSqMeters || 0) +
      (bedsAreaSqMeters || 0) +
      (containersAreaSqMeters || 0) +
      (tanksAreaSqMeters || 0) +
      (greenhouseAreaSqMeters || 0) +
      (indoorAreaSqMeters || 0) +
      (hydroponicAreaSqMeters || 0) +
      (aquaponicAreaSqMeters || 0) +
      (aeroponicAreaSqMeters || 0)
    );
  };

  // Crea breakdown delle componenti per il riepilogo
  const getAreaBreakdown = (): Array<{ label: string; area: number }> => {
    const breakdown: Array<{ label: string; area: number }> = [];
    
    if (openFieldAreaSqMeters > 0) {
      breakdown.push({ label: 'Campo Aperto', area: openFieldAreaSqMeters });
    }
    if (potsAreaSqMeters > 0) {
      breakdown.push({ label: 'Vasi', area: potsAreaSqMeters });
    }
    if (bedsAreaSqMeters > 0) {
      breakdown.push({ label: 'Letti Rialzati', area: bedsAreaSqMeters });
    }
    if (containersAreaSqMeters > 0) {
      breakdown.push({ label: 'Cassoni', area: containersAreaSqMeters });
    }
    if (tanksAreaSqMeters > 0) {
      breakdown.push({ label: 'Vasche', area: tanksAreaSqMeters });
    }
    if (greenhouseAreaSqMeters > 0) {
      breakdown.push({ label: 'Serra/Tunnel', area: greenhouseAreaSqMeters });
    }
    if (indoorAreaSqMeters > 0) {
      breakdown.push({ label: 'Indoor', area: indoorAreaSqMeters });
    }
    if (hydroponicAreaSqMeters > 0) {
      breakdown.push({ label: 'Idroponica', area: hydroponicAreaSqMeters });
    }
    if (aquaponicAreaSqMeters > 0) {
      breakdown.push({ label: 'Acquaponica', area: aquaponicAreaSqMeters });
    }
    if (aeroponicAreaSqMeters > 0) {
      breakdown.push({ label: 'Aeroponica', area: aeroponicAreaSqMeters });
    }
    
    return breakdown;
  };

  const totalArea = calculateTotalArea();
  const areaBreakdown = getAreaBreakdown();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gray-800">Configurazione Strutture e Dimensioni</h3>
        <InfoTooltip content="Configura tutti gli elementi del tuo spazio coltivabile. La superficie totale verrà calcolata automaticamente sommando tutti gli elementi." />
      </div>

      {/* Info Box: Spiega che si possono configurare più elementi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">
              Configurazione Multipla
            </p>
            <p className="text-xs text-blue-700">
              Puoi configurare più tipi di strutture contemporaneamente (es. campo aperto + vasi + letti rialzati). 
              La superficie totale verrà calcolata automaticamente sommando tutti gli elementi configurati.
            </p>
          </div>
        </div>
      </div>

      {/* Campo Aperto - Sempre disponibile */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Campo Aperto <span className="text-gray-500 font-normal">(opzionale)</span>
        </label>
        <OpenFieldSizeConfig
          initialValue={{
            sizeSqMeters: openFieldSize ? parseFloat(openFieldSize) : (initialSize || 0),
            sizeUnit: openFieldUnit,
            showAdditionalStructures: false
          }}
          onConfigChange={handleOpenFieldChange}
        />
      </div>

      {/* Vasi - Sempre disponibili */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Vasi <span className="text-gray-500 font-normal">(opzionale)</span>
        </label>
        <PotSizeConfig
          initialCount={potCount}
          initialDiameter={potDiameter}
          onConfigChange={handlePotChange}
        />
      </div>

      {/* Letti Rialzati - Sempre disponibili */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Letti Rialzati <span className="text-gray-500 font-normal">(opzionale)</span>
        </label>
        <BedSizeConfig
          initialCount={bedCount}
          initialLength={bedLength}
          initialWidth={bedWidth}
          initialHeight={bedHeight}
          initialHoles={bedHoles}
          onConfigChange={handleBedChange}
        />
      </div>

      {/* Cassoni - Sempre disponibili */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cassoni <span className="text-gray-500 font-normal">(opzionale)</span>
        </label>
        <ContainerSizeConfig
          containerType="Cassone"
          initialCount={containerCount}
          initialLength={containerLength}
          initialWidth={containerWidth}
          initialHeight={containerHeight}
          initialHoles={containerHoles}
          onConfigChange={handleContainerChange}
        />
      </div>

      {/* Vasche - Sempre disponibili */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Vasche <span className="text-gray-500 font-normal">(opzionale)</span>
        </label>
        <ContainerSizeConfig
          containerType="Vasca"
          initialCount={tankCount}
          initialLength={tankLength}
          initialWidth={tankWidth}
          initialHeight={tankHeight}
          initialHoles={tankHoles}
          onConfigChange={handleTankChange}
        />
      </div>

      {/* Serra/Tunnel - Solo se tipo giardino è Greenhouse o Tunnel */}
      {(gardenType === 'Greenhouse' || gardenType === 'Tunnel') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Serra / Tunnel
          </label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Configura le dimensioni della serra. La superficie verrà aggiunta al totale.
            </p>
          </div>
          <GreenhouseConfigForm
            initialConfig={greenhouseConfig}
            onSubmit={handleGreenhouseConfigChange}
          />
        </div>
      )}

      {/* Indoor - Solo se tipo giardino è Indoor */}
      {gardenType === 'Indoor' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Spazio Indoor
          </label>
          <IndoorConfigForm
            initialConfig={indoorConfig}
            onSubmit={handleIndoorConfigChange}
          />
        </div>
      )}

      {/* Idroponica - Solo se tipo giardino è Hydroponic */}
      {(gardenType === 'Hydroponic' || gardenType === 'NFT' || gardenType === 'DWC' || 
        gardenType === 'EbbFlow' || gardenType === 'Drip' || gardenType === 'Wick' || gardenType === 'Kratky') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sistema Idroponico
          </label>
          <HydroponicConfigForm
            initialConfig={hydroponicConfig}
            onSubmit={handleHydroponicConfigChange}
          />
        </div>
      )}

      {/* Acquaponica - Solo se tipo giardino è Aquaponic */}
      {gardenType === 'Aquaponic' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sistema Acquaponico
          </label>
          <AquaponicConfigForm
            initialConfig={aquaponicConfig}
            onSubmit={handleAquaponicConfigChange}
          />
        </div>
      )}

      {/* Aeroponica - Solo se tipo giardino è Aeroponic */}
      {gardenType === 'Aeroponic' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Sistema Aeroponico
          </label>
          <AeroponicConfigForm
            initialConfig={aeroponicConfig}
            onSubmit={handleAeroponicConfigChange}
          />
        </div>
      )}

      {/* Riepilogo Superficie Totale */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-800">Superficie Totale Coltivabile:</span>
            <span className="text-2xl font-bold text-green-700">
              {totalArea.toFixed(2)} m²
            </span>
          </div>
          
          {areaBreakdown.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-300">
              <p className="text-xs font-semibold text-gray-700 mb-2">Dettaglio componenti:</p>
              <div className="space-y-1">
                {areaBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-gray-600">
                    <span>{item.label}:</span>
                    <span className="font-medium">{item.area.toFixed(2)} m²</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {totalArea === 0 && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
              <Info size={14} />
              Configura almeno un elemento per calcolare la superficie totale.
            </p>
          )}
          
          <p className="text-xs text-gray-600 mt-3">
            La superficie totale è calcolata automaticamente sommando tutti gli elementi configurati.
          </p>
        </div>
      </div>
    </div>
  );
};

