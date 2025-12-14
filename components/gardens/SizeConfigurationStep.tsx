import React, { useEffect } from 'react';
import { GardenType } from '@/types';
import { AreaUnit, convertToSqMeters, convertFromSqMeters } from '@/utils/areaConverter';
import { GreenhouseConfig } from '@/types/greenhouse';
import { HydroponicSystemConfig, AquaponicSystemConfig, AeroponicSystemConfig, IndoorGrowingConfig } from '@/types/indoorGrowing';
import { PotSizeConfig } from './PotSizeConfig';
import { BedSizeConfig } from './BedSizeConfig';
import { OpenFieldSizeConfig } from './OpenFieldSizeConfig';
import { GreenhouseConfigForm } from './GreenhouseConfigForm';
import { HydroponicConfigForm } from './HydroponicConfigForm';
import { AquaponicConfigForm } from './AquaponicConfigForm';
import { AeroponicConfigForm } from './AeroponicConfigForm';
import { IndoorConfigForm } from './IndoorConfigForm';
import { InfoTooltip } from '../shared/InfoTooltip';

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
  openFieldSize?: string;
  openFieldUnit?: AreaUnit;
  onOpenFieldConfigChange?: (size: string, unit: AreaUnit) => void;
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
  openFieldSize = '',
  openFieldUnit = 'sqm',
  onOpenFieldConfigChange,
}) => {
  // Calcola superficie totale basata sul tipo
  useEffect(() => {
    let calculatedArea = 0;

    switch (gardenType) {
      case 'Pot':
        if (potCount > 0 && potDiameter > 0) {
          const areaPerPot = Math.PI * Math.pow(potDiameter / 2, 2) / 10000; // m²
          calculatedArea = potCount * areaPerPot;
        }
        break;

      case 'RaisedBed':
      case 'Container':
        if (bedCount > 0 && bedLength > 0 && bedWidth > 0) {
          const areaPerBed = (bedLength * bedWidth) / 10000; // m²
          calculatedArea = bedCount * areaPerBed;
        }
        break;

      case 'OpenField':
      case '':
        if (openFieldSize) {
          const numValue = parseFloat(openFieldSize);
          if (!isNaN(numValue) && numValue > 0) {
            calculatedArea = convertToSqMeters(numValue, openFieldUnit);
          }
        }
        break;

      case 'Greenhouse':
      case 'Tunnel':
        if (greenhouseConfig?.length && greenhouseConfig?.width) {
          calculatedArea = (greenhouseConfig.length * greenhouseConfig.width) / 10000; // m²
        }
        break;

      case 'Indoor':
        if (indoorConfig?.growSpace?.length && indoorConfig?.growSpace?.width) {
          calculatedArea = (indoorConfig.growSpace.length * indoorConfig.growSpace.width) / 10000; // m²
        }
        break;

      case 'Hydroponic':
      case 'NFT':
      case 'DWC':
      case 'EbbFlow':
      case 'Drip':
      case 'Wick':
      case 'Kratky':
        // Per idroponica, calcola da config se disponibile
        if (hydroponicConfig?.nftConfig) {
          // NFT: superficie = numero canali × lunghezza canale
          const channelArea = (hydroponicConfig.nftConfig.channelLength * 10) / 10000; // assumendo 10cm larghezza canale
          calculatedArea = hydroponicConfig.nftConfig.channelCount * channelArea;
        } else if (hydroponicConfig?.dwcConfig) {
          // DWC: superficie = numero secchi × area secchio (assumendo secchio circolare ø30cm)
          const bucketArea = Math.PI * Math.pow(30 / 2, 2) / 10000;
          calculatedArea = hydroponicConfig.dwcConfig.bucketCount * bucketArea;
        }
        // Altri sistemi idroponici possono essere aggiunti qui
        break;

      case 'Aquaponic':
        // Calcolo superficie da config acquaponica se disponibile
        // Per ora usa valore di default o da config
        break;

      case 'Aeroponic':
        // Calcolo superficie da config aeroponica se disponibile
        // Per ora usa valore di default o da config
        break;
    }

    onSizeCalculated(calculatedArea, 'sqm');
  }, [
    gardenType,
    potCount,
    potDiameter,
    bedCount,
    bedLength,
    bedWidth,
    openFieldSize,
    openFieldUnit,
    greenhouseConfig,
    indoorConfig,
    hydroponicConfig,
    onSizeCalculated
  ]);

  const handlePotChange = (count: number, diameter: number, area: number) => {
    if (onPotConfigChange) {
      onPotConfigChange(count, diameter);
    }
  };

  const handleBedChange = (count: number, length: number, width: number, height: number, holes: number, area: number) => {
    if (onBedConfigChange) {
      onBedConfigChange(count, length, width, height, holes);
    }
  };

  const handleOpenFieldChange = (sizeSqMeters: number, unit: AreaUnit) => {
    if (onOpenFieldConfigChange) {
      const displayValue = convertFromSqMeters(sizeSqMeters, unit).toFixed(2);
      onOpenFieldConfigChange(displayValue, unit);
    }
  };

  const handleGreenhouseConfigChange = (config: GreenhouseConfig) => {
    if (onGreenhouseConfigChange) {
      onGreenhouseConfigChange(config);
    }
  };

  const handleIndoorConfigChange = (config: IndoorGrowingConfig) => {
    if (onIndoorConfigChange) {
      onIndoorConfigChange(config);
    }
  };

  const handleHydroponicConfigChange = (config: HydroponicSystemConfig) => {
    if (onHydroponicConfigChange) {
      onHydroponicConfigChange(config);
    }
  };

  const handleAquaponicConfigChange = (config: AquaponicSystemConfig) => {
    if (onAquaponicConfigChange) {
      onAquaponicConfigChange(config);
    }
  };

  const handleAeroponicConfigChange = (config: AeroponicSystemConfig) => {
    if (onAeroponicConfigChange) {
      onAeroponicConfigChange(config);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold text-gray-800">Configurazione Dimensioni</h3>
        <InfoTooltip content="Configura le dimensioni del tuo spazio coltivabile. La superficie totale verrà calcolata automaticamente." />
      </div>

      {/* Vasi */}
      {gardenType === 'Pot' && (
        <PotSizeConfig
          initialCount={potCount}
          initialDiameter={potDiameter}
          onConfigChange={handlePotChange}
        />
      )}

      {/* Letti/Cassoni */}
      {(gardenType === 'RaisedBed' || gardenType === 'Container') && (
        <BedSizeConfig
          initialCount={bedCount}
          initialLength={bedLength}
          initialWidth={bedWidth}
          initialHeight={bedHeight}
          initialHoles={bedHoles}
          onConfigChange={handleBedChange}
        />
      )}

      {/* Campo Aperto */}
      {(gardenType === 'OpenField' || gardenType === '') && (
        <OpenFieldSizeConfig
          initialSize={initialSize}
          initialUnit={initialUnit}
          onConfigChange={handleOpenFieldChange}
        />
      )}

      {/* Serra/Tunnel */}
      {(gardenType === 'Greenhouse' || gardenType === 'Tunnel') && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Configura le dimensioni della serra. La superficie coltivabile verrà calcolata automaticamente.
            </p>
          </div>
          <GreenhouseConfigForm
            initialConfig={greenhouseConfig}
            onSubmit={handleGreenhouseConfigChange}
          />
          {greenhouseConfig?.length && greenhouseConfig?.width && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Superficie Coltivabile:</span>
                <span className="text-lg font-bold text-green-700">
                  {((greenhouseConfig.length * greenhouseConfig.width) / 10000).toFixed(2)} m²
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indoor */}
      {gardenType === 'Indoor' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Configura le dimensioni dello spazio indoor. La superficie coltivabile verrà calcolata automaticamente.
            </p>
          </div>
          <IndoorConfigForm
            initialConfig={indoorConfig}
            onSubmit={handleIndoorConfigChange}
          />
          {indoorConfig?.growSpace?.length && indoorConfig?.growSpace?.width && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Superficie Coltivabile:</span>
                <span className="text-lg font-bold text-green-700">
                  {((indoorConfig.growSpace.length * indoorConfig.growSpace.width) / 10000).toFixed(2)} m²
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Idroponica */}
      {(gardenType === 'Hydroponic' || gardenType === 'NFT' || gardenType === 'DWC' || 
        gardenType === 'EbbFlow' || gardenType === 'Drip' || gardenType === 'Wick' || gardenType === 'Kratky') && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Configura il sistema idroponico. La superficie coltivabile verrà calcolata dalla configurazione del sistema.
            </p>
          </div>
          <HydroponicConfigForm
            initialConfig={hydroponicConfig}
            onSubmit={handleHydroponicConfigChange}
          />
        </div>
      )}

      {/* Acquaponica */}
      {gardenType === 'Aquaponic' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Configura il sistema acquaponico. La superficie coltivabile verrà calcolata dalla configurazione del sistema.
            </p>
          </div>
          <AquaponicConfigForm
            initialConfig={aquaponicConfig}
            onSubmit={handleAquaponicConfigChange}
          />
        </div>
      )}

      {/* Aeroponica */}
      {gardenType === 'Aeroponic' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 Configura il sistema aeroponico. La superficie coltivabile verrà calcolata dalla configurazione del sistema.
            </p>
          </div>
          <AeroponicConfigForm
            initialConfig={aeroponicConfig}
            onSubmit={handleAeroponicConfigChange}
          />
        </div>
      )}
    </div>
  );
};

