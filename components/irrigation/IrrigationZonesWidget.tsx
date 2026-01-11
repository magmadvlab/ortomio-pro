'use client'

import React, { useState, useEffect } from 'react';
import { IrrigationZone, IrrigationSchedule } from '@/types/irrigation';
import { Garden } from '@/types';
import { calculateZoneIrrigationSchedule } from '@/services/irrigationService';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Droplets, Clock, AlertCircle, CheckCircle, Plus, ChevronRight } from 'lucide-react';
import { IrrigationZoneWizard } from './IrrigationZoneWizard';
import { getWeatherForecast } from '@/services/weatherService';

interface IrrigationZonesWidgetProps {
  garden: Garden;
  tasks: any[]; // GardenTask[]
  onOpenManager?: () => void;
}

export function IrrigationZonesWidget({ garden, tasks, onOpenManager }: IrrigationZonesWidgetProps) {
  const { storageProvider } = useStorage();
  const [zones, setZones] = useState<IrrigationZone[]>([]);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Implementare getIrrigationSystems e getIrrigationZones nello storage provider
        // Per ora usiamo localStorage come fallback
        const stored = localStorage.getItem(`irrigationZones_${garden.id}`);
        if (stored) {
          const zonesData = JSON.parse(stored);
          setZones(zonesData);
          
          // Calcola schedule per ogni zona
          if (garden.coordinates) {
            const forecast = await getWeatherForecast(
              garden.coordinates.latitude,
              garden.coordinates.longitude
            );
            setWeather(forecast);
          }
          
          const schedulesPromises = zonesData.map(async (zone: IrrigationZone) => {
            return await calculateZoneIrrigationSchedule(
              zone,
              zone.plantTaskIds,
              tasks,
              garden,
              weather
            );
          });
          
          const schedulesData = await Promise.all(schedulesPromises);
          setSchedules(schedulesData.filter(s => s.litersNeeded > 0));
        }
      } catch (error) {
        console.error('Error loading irrigation zones:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [garden.id, tasks, weather]);

  const handleZoneCreate = async (zone: IrrigationZone) => {
    try {
      // TODO: Implementare createIrrigationZone nello storage provider
      const updated = [...zones, zone];
      localStorage.setItem(`irrigationZones_${garden.id}`, JSON.stringify(updated));
      setZones(updated);
      setShowWizard(false);
      
      // Ricalcola schedule
      const schedule = await calculateZoneIrrigationSchedule(
        zone,
        zone.plantTaskIds,
        tasks,
        garden,
        weather
      );
      if (schedule.litersNeeded > 0) {
        setSchedules([...schedules, schedule]);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <Droplets size={24} className="text-blue-100" />
          <div>
            <h3 className="font-bold text-lg">Zone Irrigue</h3>
            <p className="text-sm opacity-90">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeSchedules = schedules.filter(s => s.suggestedDurationMinutes > 0);
  const totalMinutes = activeSchedules.reduce((sum, s) => sum + s.suggestedDurationMinutes, 0);
  const totalLiters = activeSchedules.reduce((sum, s) => sum + s.litersNeeded, 0);

  return (
    <>
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden min-h-[140px] flex flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Droplets size={24} className="text-blue-100" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Zone Irrigue</h3>
                <p className="text-sm opacity-90">Gestisci l'irrigazione</p>
              </div>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-3"
            >
              <Plus size={16} />
              Nuova
            </button>
          </div>

          {zones.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm opacity-90">
                Nessuna zona configurata. Crea una zona per iniziare!
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-3 text-base">
                  <p className="text-xl md:text-2xl font-bold">{zones.length}</p>
                  <p className="text-xs opacity-90">Zone</p>
                </div>
                {activeSchedules.length > 0 && (
                  <>
                    <div className="bg-white/20 rounded-lg px-4 py-3 text-base">
                      <p className="text-xl md:text-2xl font-bold">{Math.round(totalMinutes)}</p>
                      <p className="text-xs opacity-90">Minuti</p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-4 py-3 text-base">
                      <p className="text-xl md:text-2xl font-bold">{Math.round(totalLiters)}</p>
                      <p className="text-xs opacity-90">Litri</p>
                    </div>
                  </>
                )}
              </div>

              {activeSchedules.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold opacity-90 mb-1">Oggi:</p>
                  {activeSchedules.slice(0, 3).map((schedule) => {
                    const zone = zones.find(z => z.id === schedule.zoneId);
                    if (!zone) return null;
                    
                    return (
                      <div 
                        key={schedule.zoneId} 
                        className="bg-white/10 rounded-lg p-3 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Droplets size={14} />
                          <span className="font-medium">{schedule.zoneName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {schedule.weatherAdjustment?.action === 'CANCEL' ? (
                            <span className="text-xs opacity-75">Sospesa</span>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span className="text-xs font-semibold">
                                {Math.round(schedule.suggestedDurationMinutes)} min
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {activeSchedules.length > 3 && (
                    <button
                      onClick={onOpenManager}
                      className="w-full text-xs text-center opacity-75 hover:opacity-100 mt-1"
                    >
                      Vedi tutte ({activeSchedules.length}) →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <Droplets size={120} className="absolute -right-4 -bottom-10 text-white opacity-10" />
      </div>

      {showWizard && (
        <IrrigationZoneWizard
          garden={garden}
          beds={[]} // TODO: Caricare beds da storage
          systemId={garden.id} // Per ora 1 sistema = 1 giardino
          onComplete={handleZoneCreate}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </>
  );
}

