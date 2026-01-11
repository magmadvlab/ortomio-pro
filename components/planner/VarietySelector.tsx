import React, { useState, useMemo } from 'react';
import { ExoticFruitVariety } from '@/types/exoticFruit';
import { translateUsdaZone } from '@/services/usdaZoneTranslator';
import { CheckCircle, Snowflake, Flame, Container, Ruler, Calendar, Info } from 'lucide-react';

interface VarietySelectorProps {
  varieties: ExoticFruitVariety[];
  recommendedVariety?: string;
  userUsdaZone?: string;
  onSelectVariety?: (variety: ExoticFruitVariety) => void;
  selectedVarietyId?: string;
}

type FilterType = 'all' | 'climate' | 'container' | 'dwarf';

const VarietySelector: React.FC<VarietySelectorProps> = ({
  varieties,
  recommendedVariety,
  userUsdaZone,
  onSelectVariety,
  selectedVarietyId,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedVarietyId || recommendedVariety);

  // Filter varieties based on selected filter
  const filteredVarieties = useMemo(() => {
    let filtered = [...varieties];

    if (filter === 'climate' && userUsdaZone) {
      const userZoneNum = parseFloat(userUsdaZone.replace(/[a-z]/i, ''));
      filtered = filtered.filter(v => 
        v.bestUsdaZones.some(zone => Math.abs(zone - userZoneNum) <= 1)
      );
    } else if (filter === 'container') {
      filtered = filtered.filter(v => v.containerFriendly);
    } else if (filter === 'dwarf') {
      filtered = filtered.filter(v => v.dwarf);
    }

    return filtered;
  }, [varieties, filter, userUsdaZone]);

  const handleSelectVariety = (variety: ExoticFruitVariety) => {
    setSelectedId(variety.id);
    if (onSelectVariety) {
      onSelectVariety(variety);
    }
  };

  if (varieties.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 mb-4 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Seleziona Varietà</h3>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Tutte
          </button>
          {userUsdaZone && (
            <button
              onClick={() => setFilter('climate')}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                filter === 'climate'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Adatte al mio clima
            </button>
          )}
          <button
            onClick={() => setFilter('container')}
            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
              filter === 'container'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Per vaso
          </button>
          <button
            onClick={() => setFilter('dwarf')}
            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
              filter === 'dwarf'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Nane
          </button>
        </div>
      </div>

      {/* Varieties List */}
      <div className="p-4 space-y-3">
        {filteredVarieties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Info size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Nessuna varietà trovata con i filtri selezionati</p>
          </div>
        ) : (
          filteredVarieties.map((variety) => {
            const isRecommended = recommendedVariety === variety.name;
            const isSelected = selectedId === variety.id;

            return (
              <div
                key={variety.id}
                onClick={() => handleSelectVariety(variety)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isRecommended
                    ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-800">{variety.name}</h4>
                      {isRecommended && (
                        <span className="bg-yellow-full max-w-sm text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-3">
                          <CheckCircle size={12} />
                          Consigliata
                        </span>
                      )}
                      {variety.dwarf && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Nano
                        </span>
                      )}
                    </div>
                    {variety.notes && (
                      <p className="text-sm text-gray-600 mb-2">{variety.notes}</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} className="text-blue-600 shrink-0" />
                  )}
                </div>

                {/* Variety Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {/* Cold Hardiness */}
                  <div className="flex items-center gap-3 text-sm">
                    <Snowflake size={16} className="text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Resistenza freddo</div>
                      <div className="font-semibold text-gray-700">{variety.coldHardiness}°C</div>
                    </div>
                  </div>

                  {/* Heat Tolerance */}
                  <div className="flex items-center gap-3 text-sm">
                    <Flame size={16} className="text-orange-500" />
                    <div>
                      <div className="text-xs text-gray-500">Tolleranza caldo</div>
                      <div className="font-semibold text-gray-700">{variety.heatTolerance}°C</div>
                    </div>
                  </div>

                  {/* Container Friendly */}
                  {variety.containerFriendly && (
                    <div className="flex items-center gap-3 text-sm">
                      <Container size={16} className="text-green-500" />
                      <div>
                        <div className="text-xs text-gray-500">Vaso</div>
                        <div className="font-semibold text-gray-700">Sì</div>
                      </div>
                    </div>
                  )}

                  {/* Maturity Years */}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-500">Maturità</div>
                      <div className="font-semibold text-gray-700">
                        {variety.maturityYears} {variety.maturityYears === 1 ? 'anno' : 'anni'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* USDA Zones */}
                {variety.bestUsdaZones.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Climi ideali:</div>
                    <div className="flex flex-wrap gap-3">
                      {variety.bestUsdaZones.map((zone, idx) => {
                        // Converti numero zona in formato stringa (es. 9 -> '9a', 10 -> '10a')
                        const zoneStr = zone.toString();
                        const zoneKey = zoneStr.includes('a') || zoneStr.includes('b') ? zoneStr : `${zoneStr}a`;
                        const translated = translateUsdaZone(zoneKey);
                        const isCompatible = userUsdaZone && Math.abs(parseFloat(userUsdaZone.replace(/[a-z]/i, '')) - zone) <= 1;
                        
                        return (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-0.5 rounded ${
                              isCompatible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                            title={`${translated.climateName} (${translated.minTemp})`}
                          >
                            {translated.emoji} {translated.climateName.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Harvest Months */}
                {variety.harvestMonths.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Mesi di raccolta:</div>
                    <div className="flex flex-wrap gap-3">
                      {variety.harvestMonths.map((month, idx) => {
                        const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
                        return (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800"
                          >
                            {monthNames[month - 1]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VarietySelector;










