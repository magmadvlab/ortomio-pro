import React, { useState } from 'react';
import { ExoticFruitCrop, FeasibilityResult } from '@/types/exoticFruit';
import { translateUsdaZone, getUsdaZoneBadge } from '@/services/usdaZoneTranslator';
import { CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, MapPin, Shield, Thermometer } from 'lucide-react';

interface GeographicFeasibilityCardProps {
  plant: ExoticFruitCrop;
  feasibilityResult: FeasibilityResult;
  userLocation?: {
    city?: string;
    region?: string;
    usdaZone?: string;
  };
  collapsible?: boolean;
}

const GeographicFeasibilityCard: React.FC<GeographicFeasibilityCardProps> = ({
  plant,
  feasibilityResult,
  userLocation,
  collapsible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const getFeasibilityColor = (feasibility: FeasibilityResult['feasibility']) => {
    switch (feasibility) {
      case 'Ideal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Possible':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Difficult':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NotRecommended':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getFeasibilityIcon = (feasibility: FeasibilityResult['feasibility']) => {
    switch (feasibility) {
      case 'Ideal':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'Possible':
        return <AlertTriangle size={20} className="text-yellow-full max-w-sm" />;
      case 'Difficult':
        return <AlertTriangle size={20} className="text-orange-600" />;
      case 'NotRecommended':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Info size={20} className="text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
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

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'openField':
        return '🌱';
      case 'container':
        return '🪴';
      case 'greenhouse':
        return '🏠';
      default:
        return '📦';
    }
  };

  return (
    <div className={`bg-white rounded-xl border-2 ${getFeasibilityColor(feasibilityResult.feasibility)} mb-4 shadow-sm`}>
      {/* Header - Always Visible */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          {getFeasibilityIcon(feasibilityResult.feasibility)}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-gray-800">Fattibilità Geografica</h3>
              {userLocation && (
                <div className="text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-3">
                    <MapPin size={12} />
                    {userLocation.city || userLocation.region || 'La tua zona'}
                  </span>
                  {userLocation.usdaZone && (
                    <div className="group relative">
                      <span className={getUsdaZoneBadge(userLocation.usdaZone).className}>
                        {translateUsdaZone(userLocation.usdaZone).emoji} {translateUsdaZone(userLocation.usdaZone).climateName}
                        <Info size={10} className="ml-1 opacity-60" />
                      </span>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        <div className="font-semibold mb-1">{translateUsdaZone(userLocation.usdaZone).climateName}</div>
                        <div className="text-gray-300 mb-1">{translateUsdaZone(userLocation.usdaZone).description}</div>
                        <div className="text-gray-400 text-xs">
                          <div>Temperatura minima: {translateUsdaZone(userLocation.usdaZone).minTemp}</div>
                          <div>Riferimento: {translateUsdaZone(userLocation.usdaZone).geographicReference}</div>
                          <div className="mt-1 pt-1 border-t border-gray-700">Zona tecnica: {translateUsdaZone(userLocation.usdaZone).technicalZone}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Score Badge */}
              <div className="flex items-center gap-3">
                <div className={`${getScoreColor(feasibilityResult.score)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                  {feasibilityResult.score}/100
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {feasibilityResult.feasibility === 'Ideal' && 'Ideale'}
                  {feasibilityResult.feasibility === 'Possible' && 'Possibile'}
                  {feasibilityResult.feasibility === 'Difficult' && 'Difficile'}
                  {feasibilityResult.feasibility === 'NotRecommended' && 'Sconsigliato'}
                </span>
              </div>
              
              {/* Recommended System */}
              {feasibilityResult.recommendedSystem && (
                <div className="text-xs text-gray-600 flex items-center gap-3">
                  <span>{getSystemIcon(feasibilityResult.recommendedSystem)}</span>
                  <span>{getSystemLabel(feasibilityResult.recommendedSystem)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {collapsible && (
          <button className="text-gray-500 hover:text-gray-700">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
          {/* Recommended Variety */}
          {feasibilityResult.recommendedVariety && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-1">
                <Info size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Varietà Consigliata</span>
              </div>
              <p className="text-sm text-blue-800">{feasibilityResult.recommendedVariety}</p>
            </div>
          )}

          {/* Required Protections */}
          {feasibilityResult.requiredProtections.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield size={16} className="text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">Protezioni Necessarie</span>
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                {feasibilityResult.requiredProtections.map((protection, index) => (
                  <li key={index}>{protection}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {feasibilityResult.warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={16} className="text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">Avvisi</span>
              </div>
              <ul className="list-disc list-inside text-sm text-orange-800 space-y-1 ml-2">
                {feasibilityResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Personalized Timeline */}
          {feasibilityResult.personalizedTimeline && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Thermometer size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-700">Calendario Personalizzato</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                {feasibilityResult.personalizedTimeline.sowingDate && (
                  <div>
                    <span className="font-medium text-gray-700">Semina: </span>
                    <span className="text-gray-600">{feasibilityResult.personalizedTimeline.sowingDate}</span>
                  </div>
                )}
                {feasibilityResult.personalizedTimeline.transplantDate && (
                  <div>
                    <span className="font-medium text-gray-700">Trapianto: </span>
                    <span className="text-gray-600">{feasibilityResult.personalizedTimeline.transplantDate}</span>
                  </div>
                )}
                {feasibilityResult.personalizedTimeline.harvestStart && (
                  <div>
                    <span className="font-medium text-gray-700">Raccolta: </span>
                    <span className="text-gray-600">
                      {feasibilityResult.personalizedTimeline.harvestStart}
                      {feasibilityResult.personalizedTimeline.harvestEnd && 
                        ` - ${feasibilityResult.personalizedTimeline.harvestEnd}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeographicFeasibilityCard;









