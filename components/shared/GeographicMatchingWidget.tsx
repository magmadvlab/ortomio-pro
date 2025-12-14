import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { ExoticFruitCrop } from '@/types/exoticFruit';
import { getAllMasterSheets } from '@/services/plantMasterService';
import { calculateFeasibility, getUserLocationProfile } from '@/services/geographicMatchingService';
import { MapPin, Sparkles, AlertTriangle, CheckCircle, ArrowRight, Leaf } from 'lucide-react';
import Link from 'next/link';

interface GeographicMatchingWidgetProps {
  garden: Garden;
}

interface PlantFeasibility {
  plant: ExoticFruitCrop;
  feasibility: any;
}

const GeographicMatchingWidget: React.FC<GeographicMatchingWidgetProps> = ({ garden }) => {
  const [userLocation, setUserLocation] = useState<any>(null);
  const [idealPlants, setIdealPlants] = useState<PlantFeasibility[]>([]);
  const [opportunities, setOpportunities] = useState<PlantFeasibility[]>([]);
  const [warnings, setWarnings] = useState<PlantFeasibility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const location = await getUserLocationProfile();
        if (!location) {
          setLoading(false);
          return;
        }

        setUserLocation(location);

        // Get all exotic fruits
        const allSheets = getAllMasterSheets();
        const exoticFruits = allSheets.filter(
          (p) => p.cropType === 'ExoticFruit' && (p as unknown as ExoticFruitCrop).climateCompatibility
        ) as unknown as ExoticFruitCrop[];

        // Calculate feasibility for each
        const feasibilities: PlantFeasibility[] = exoticFruits.map((plant) => ({
          plant,
          feasibility: calculateFeasibility(plant, location),
        }));

        // Categorize
        setIdealPlants(
          feasibilities
            .filter((f) => f.feasibility.feasibility === 'Ideal' && f.feasibility.score >= 80)
            .slice(0, 3)
        );
        setOpportunities(
          feasibilities
            .filter(
              (f) =>
                f.feasibility.feasibility === 'Possible' &&
                f.feasibility.score >= 50 &&
                f.feasibility.score < 80
            )
            .slice(0, 3)
        );
        setWarnings(
          feasibilities
            .filter((f) => f.feasibility.feasibility === 'Difficult' || f.feasibility.feasibility === 'NotRecommended')
            .slice(0, 2)
        );
      } catch (error) {
        console.error('Error loading geographic matching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Matching Geografico</h3>
        </div>
        <p className="text-sm text-gray-600">Caricamento...</p>
      </div>
    );
  }

  if (!userLocation) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Matching Geografico</h3>
        </div>
        <Link
          href="/app/planner"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Vedi tutte
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="text-xs text-gray-600 mb-4 flex items-center gap-1">
        <MapPin size={12} />
        {userLocation.city || userLocation.region || 'La tua zona'}
        {userLocation.usdaZone && ` (${userLocation.usdaZone})`}
      </div>

      {/* Ideal Plants */}
      {idealPlants.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-700">Piante Ideali</span>
          </div>
          <div className="space-y-2">
            {idealPlants.map((item, idx) => (
              <div
                key={idx}
                className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{(item.plant as any).commonName || (item.plant as any).name || (item.plant as any).plantName || 'Sconosciuto'}</span>
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.feasibility.score}/100
                  </span>
                </div>
                {item.feasibility.recommendedVariety && (
                  <div className="text-xs text-gray-600 mt-1">
                    Varietà: {item.feasibility.recommendedVariety}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-yellow-600" />
            <span className="text-sm font-semibold text-gray-700">Nuove Opportunità</span>
          </div>
          <div className="space-y-2">
            {opportunities.map((item, idx) => (
              <div
                key={idx}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{(item.plant as any).commonName || (item.plant as any).name || (item.plant as any).plantName || 'Sconosciuto'}</span>
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.feasibility.score}/100
                  </span>
                </div>
                {item.feasibility.recommendedSystem && (
                  <div className="text-xs text-gray-600 mt-1">
                    Sistema: {item.feasibility.recommendedSystem === 'openField' ? 'Piena Terra' : item.feasibility.recommendedSystem === 'container' ? 'Vaso' : 'Serra'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">Attenzione Clima</span>
          </div>
          <div className="space-y-2">
            {warnings.map((item, idx) => (
              <div
                key={idx}
                className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{(item.plant as any).commonName || (item.plant as any).name || (item.plant as any).plantName || 'Sconosciuto'}</span>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.feasibility.score}/100
                  </span>
                </div>
                {item.feasibility.warnings.length > 0 && (
                  <div className="text-xs text-orange-800 mt-1">
                    {item.feasibility.warnings[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {idealPlants.length === 0 && opportunities.length === 0 && warnings.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <Leaf size={24} className="mx-auto mb-2 text-gray-400" />
          <p>Nessuna pianta esotica disponibile per la tua zona</p>
        </div>
      )}
    </div>
  );
};

export default GeographicMatchingWidget;

