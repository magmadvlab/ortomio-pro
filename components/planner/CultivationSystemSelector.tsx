import React from 'react';
import { ExoticFruitCrop } from '@/types/exoticFruit';
import { translateUsdaZone } from '@/services/usdaZoneTranslator';
import { CheckCircle, AlertTriangle, Info, Home, Container, Sprout, Shield, Thermometer, Ruler } from 'lucide-react';

interface CultivationSystemSelectorProps {
  plant: ExoticFruitCrop;
  recommendedSystem?: 'openField' | 'container' | 'greenhouse';
  userUsdaZone?: string;
  onSelectSystem?: (system: 'openField' | 'container' | 'greenhouse') => void;
  selectedSystem?: 'openField' | 'container' | 'greenhouse';
}

const CultivationSystemSelector: React.FC<CultivationSystemSelectorProps> = ({
  plant,
  recommendedSystem,
  userUsdaZone,
  onSelectSystem,
  selectedSystem,
}) => {
  const cultivationSystems = plant.cultivationSystems;

  if (!cultivationSystems) {
    return null;
  }

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'openField':
        return <Sprout size={24} className="text-green-600" />;
      case 'container':
        return <Container size={24} className="text-blue-600" />;
      case 'greenhouse':
        return <Home size={24} className="text-purple-600" />;
      default:
        return <Info size={24} className="text-gray-600" />;
    }
  };

  const getSystemLabel = (system: string) => {
    switch (system) {
      case 'openField':
        return 'Piena Terra';
      case 'container':
        return 'Vaso';
      case 'greenhouse':
        return 'Serra';
      default:
        return system;
    }
  };

  const getSystemDescription = (system: string) => {
    switch (system) {
      case 'openField':
        return 'Coltivazione direttamente nel terreno';
      case 'container':
        return 'Coltivazione in vaso o contenitore';
      case 'greenhouse':
        return 'Coltivazione in serra o ambiente controllato';
      default:
        return '';
    }
  };

  const checkSystemFeasibility = (system: 'openField' | 'container' | 'greenhouse'): {
    feasible: boolean;
    reason?: string;
  } => {
    if (system === 'openField') {
      const openField = cultivationSystems.openField;
      if (!openField?.possible) {
        return { feasible: false, reason: 'Non possibile in piena terra' };
      }
      if (userUsdaZone && openField.requires?.minUsdaZone) {
        const userZoneNum = parseFloat(userUsdaZone.replace(/[a-z]/i, ''));
        if (userZoneNum < openField.requires.minUsdaZone) {
          const userZoneDesc = translateUsdaZone(userUsdaZone);
          const requiredZoneNum = openField.requires.minUsdaZone;
          // Le zone 11+ non hanno sottovarianti a/b, usiamo il numero direttamente
          // Le zone 7-10 hanno sottovarianti, quindi aggiungiamo 'a' se non specificato
          const requiredZoneKey = requiredZoneNum >= 11 
            ? requiredZoneNum.toString() 
            : (requiredZoneNum.toString().includes('a') || requiredZoneNum.toString().includes('b') 
                ? requiredZoneNum.toString() 
                : `${requiredZoneNum}a`);
          const requiredZoneDesc = translateUsdaZone(requiredZoneKey);
          
          return {
            feasible: false,
            reason: `Il tuo clima (${userZoneDesc.climateName}, ${userZoneDesc.minTemp}) è troppo freddo. Richiede clima più caldo (${requiredZoneDesc.climateName}, ${requiredZoneDesc.minTemp})`,
          };
        }
      }
      return { feasible: true };
    }

    if (system === 'container') {
      const container = cultivationSystems.container;
      if (!container?.possible) {
        return { feasible: false, reason: 'Non adatto alla coltivazione in vaso' };
      }
      return { feasible: true };
    }

    if (system === 'greenhouse') {
      return { feasible: true }; // Greenhouse is always feasible if defined
    }

    return { feasible: false };
  };

  const systems: Array<'openField' | 'container' | 'greenhouse'> = ['openField', 'container', 'greenhouse'];

  return (
    <div className="bg-white rounded-xl border-2 border-purple-200 mb-4 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-1">Sistema di Coltivazione</h3>
        <p className="text-sm text-gray-600">Scegli il metodo di coltivazione più adatto</p>
      </div>

      {/* Systems Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4">
        {systems.map((system) => {
          const systemData =
            system === 'openField'
              ? cultivationSystems.openField
              : system === 'container'
              ? cultivationSystems.container
              : cultivationSystems.greenhouse;

          if (!systemData) {
            return null;
          }

          // Type-safe access for each system
          const openFieldData = system === 'openField' ? cultivationSystems.openField : null;
          const containerData = system === 'container' ? cultivationSystems.container : null;
          const greenhouseData = system === 'greenhouse' ? cultivationSystems.greenhouse : null;

          const feasibility = checkSystemFeasibility(system);
          const isRecommended = recommendedSystem === system;
          const isSelected = selectedSystem === system;
          const isFeasible = feasibility.feasible;

          return (
            <div
              key={system}
              onClick={() => isFeasible && onSelectSystem && onSelectSystem(system)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : isRecommended && isFeasible
                  ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                  : isFeasible
                  ? 'border-gray-200 bg-white hover:border-gray-300'
                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getSystemIcon(system)}
                  <div>
                    <h4 className="font-bold text-gray-800">{getSystemLabel(system)}</h4>
                    <p className="text-xs text-gray-500">{getSystemDescription(system)}</p>
                  </div>
                </div>
                {isSelected && <CheckCircle size={20} className="text-purple-600 shrink-0" />}
                {isRecommended && !isSelected && (
                  <span className="bg-yellow-full max-w-sm text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Consigliato
                  </span>
                )}
              </div>

              {/* Feasibility Status */}
              {!isFeasible && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <AlertTriangle size={14} className="inline mr-1" />
                  {feasibility.reason || 'Non fattibile'}
                </div>
              )}

              {/* System Requirements */}
              <div className="space-y-2 text-sm">
                {openFieldData && openFieldData.possible && (
                  <>
                    {openFieldData.requires?.protection !== 'None' && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <Shield size={16} className="text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Protezione:</div>
                          <div className="text-xs text-gray-600">
                            {openFieldData.requires?.protectionType || openFieldData.requires?.protection}
                          </div>
                        </div>
                      </div>
                    )}
                    {openFieldData.requires?.minUsdaZone && (() => {
                      const requiredZoneStr = openFieldData.requires.minUsdaZone.toString();
                      const requiredZoneKey = requiredZoneStr.includes('a') || requiredZoneStr.includes('b') ? requiredZoneStr : `${requiredZoneStr}a`;
                      const requiredZoneDesc = translateUsdaZone(requiredZoneKey);
                      
                      return (
                        <div className="flex items-start gap-3 text-gray-700">
                          <Thermometer size={16} className="text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">Clima minimo richiesto:</div>
                            <div className="text-xs text-gray-600">
                              {requiredZoneDesc.emoji} {requiredZoneDesc.climateName} ({requiredZoneDesc.minTemp})
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {containerData && containerData.possible && (
                  <>
                    {containerData.minSizeLiters && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <Ruler size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Dimensione minima:</div>
                          <div className="text-xs text-gray-600">{containerData.minSizeLiters}L</div>
                        </div>
                      </div>
                    )}
                    {containerData.moveableIndoor && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <Home size={16} className="text-purple-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Spostabile indoor:</div>
                          <div className="text-xs text-gray-600">
                            {containerData.indoorMonths
                              ? `Mesi: ${containerData.indoorMonths.join(', ')}`
                              : 'Sì, in inverno'}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {greenhouseData && (
                  <>
                    <div className="flex items-start gap-3 text-gray-700">
                      <Home size={16} className="text-purple-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Tipo serra:</div>
                        <div className="text-xs text-gray-600">
                          {greenhouseData.type === 'Cold' && 'Serra fredda'}
                          {greenhouseData.type === 'Warm' && 'Serra temperata'}
                          {greenhouseData.type === 'Tropical' && 'Serra tropicale'}
                        </div>
                      </div>
                    </div>
                    {greenhouseData.heatingRequired && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <Thermometer size={16} className="text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Riscaldamento:</div>
                          <div className="text-xs text-gray-600">Richiesto</div>
                        </div>
                      </div>
                    )}
                    {greenhouseData.minTempGreenhouse && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <Thermometer size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">Temp. minima:</div>
                          <div className="text-xs text-gray-600">{greenhouseData.minTempGreenhouse}°C</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CultivationSystemSelector;

