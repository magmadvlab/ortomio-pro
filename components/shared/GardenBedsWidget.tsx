import React, { useState, useEffect } from 'react';
import { Garden } from '@/types';
import { GardenBed, BedType } from '@/types/gardenBed';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { calculateGardenSpace } from '@/logic/spaceCalculator';
import { getMasterSheet } from '@/services/plantMasterService';
import { Grid, AlertTriangle, TrendingUp } from 'lucide-react';

interface GardenBedsWidgetProps {
  garden: Garden;
  tasks?: any[]; // GardenTask[]
  onOpenManagement?: () => void;
}

export const GardenBedsWidget: React.FC<GardenBedsWidgetProps> = ({
  garden,
  tasks = [],
  onOpenManagement
}) => {
  const { storageProvider } = useStorage();
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [spaceCalculation, setSpaceCalculation] = useState<any>(null);

  useEffect(() => {
    if (garden?.id) {
      loadBeds();
    }
  }, [garden?.id, storageProvider]);

  useEffect(() => {
    if (beds.length > 0) {
      calculateSpace();
    } else {
      // Reset calculation se non ci sono letti
      setSpaceCalculation(null);
    }
  }, [beds, tasks, garden]);

  const loadBeds = async () => {
    try {
      if (!garden?.id) {
        console.warn('GardenBedsWidget: No garden ID provided');
        setLoading(false);
        return;
      }
      const gardenBeds = await storageProvider.getGardenBeds(garden.id);
      console.log('GardenBedsWidget: Loaded beds', gardenBeds.length);
      setBeds(gardenBeds);
    } catch (error) {
      console.error('GardenBedsWidget: Error loading beds:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSpace = () => {
    if (!garden || beds.length === 0) return;
    
    const masterSheets = new Map();
    tasks.forEach(task => {
      if (task.plantName) {
        const master = getMasterSheet(task.plantName);
        if (master) {
          masterSheets.set(task.plantName.toLowerCase(), master);
        }
      }
    });

    try {
      const calculation = calculateGardenSpace(garden, beds, tasks, masterSheets);
      setSpaceCalculation(calculation);
    } catch (error) {
      console.error('Error calculating garden space:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center py-4 text-gray-500">Caricamento...</div>
      </div>
    );
  }

  const byType = {
    RaisedBed: beds.filter(b => b.bedType === 'RaisedBed').length,
    Container: beds.filter(b => b.bedType === 'Container').length,
    Pot: beds.filter(b => b.bedType === 'Pot').length,
    Greenhouse: beds.filter(b => b.bedType === 'Greenhouse').length,
    Hydroponic: beds.filter(b => b.bedType === 'Hydroponic').length,
  };
  const total = beds.length;

  const fullBeds = spaceCalculation?.bedsCalculations?.filter(
    (calc: any) => calc.occupancyPercentage >= 90
  ) || [];
  const almostFullBeds = spaceCalculation?.bedsCalculations?.filter(
    (calc: any) => calc.occupancyPercentage >= 80 && calc.occupancyPercentage < 90
  ) || [];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Grid size={20} className="text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">Zone di Coltivazione</h3>
        </div>
        {onOpenManagement && (
          <button
            onClick={onOpenManagement}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Gestisci
          </button>
        )}
      </div>

      {total === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nessuna zona definita. Crea il primo letto per organizzare meglio il tuo giardino!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{byType.RaisedBed}</div>
              <div className="text-xs text-gray-600">Cassoni</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{byType.Container}</div>
              <div className="text-xs text-gray-600">Contenitori</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">{byType.Pot}</div>
              <div className="text-xs text-gray-600">Vasi</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{byType.Greenhouse + byType.Hydroponic}</div>
              <div className="text-xs text-gray-600">Strutture</div>
            </div>
          </div>

          {/* Spazio totale */}
          {spaceCalculation && garden.sizeSqMeters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Spazio totale</span>
                <span className="text-sm font-bold text-gray-800">{garden.sizeSqMeters?.toFixed(2) || '0.00'} m²</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Letti definiti</span>
                <span className="text-sm font-semibold text-gray-700">{spaceCalculation.totalBedsArea.toFixed(2)} m²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupato</span>
                <span className="text-sm font-semibold text-green-600">{spaceCalculation.totalOccupiedArea.toFixed(2)} m²</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, garden.sizeSqMeters ? (spaceCalculation.totalOccupiedArea / garden.sizeSqMeters) * 100 : 0)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Alert letti pieni */}
          {fullBeds.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm text-red-800">
                {fullBeds.length} letto/i pieno/i ({'>'}90%)
              </span>
            </div>
          )}

          {almostFullBeds.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-600" />
              <span className="text-sm text-yellow-800">
                {almostFullBeds.length} letto/i quasi pieno/i (80-90%)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

