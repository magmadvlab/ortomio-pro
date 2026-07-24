'use client'

import React, { useState, useEffect } from 'react';
import { IrrigationZone, IrrigationSchedule } from '@/types/irrigation';
import { Garden, GardenBed } from '@/types';
import { calculateZoneIrrigationSchedule } from '@/services/irrigationService';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { Droplets, Clock, AlertCircle, CheckCircle, Plus, ChevronRight } from 'lucide-react';
import { IrrigationZoneWizard } from './IrrigationZoneWizard';
import { getWeatherForecast, type WeatherForecast } from '@/services/weatherService';

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
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [systemId, setSystemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [systems, gardenBeds] = await Promise.all([
          storageProvider.getIrrigationSystems(garden.id),
          storageProvider.getGardenBeds(garden.id),
        ]);
        const activeSystem = systems[0];
        setSystemId(activeSystem?.id || null);
        setBeds(gardenBeds);
        const zonesData = activeSystem
          ? await storageProvider.getIrrigationZones(activeSystem.id, garden.id)
          : [];
        setZones(zonesData);
        const rawForecast = garden.coordinates
          ? (await getWeatherForecast(
              garden.coordinates.latitude,
              garden.coordinates.longitude
            ))[0]
          : null;
        const forecast: WeatherForecast | null = rawForecast ? {
          ...rawForecast,
          date: rawForecast.date instanceof Date
            ? rawForecast.date.toISOString().slice(0, 10)
            : String(rawForecast.date),
          tempMin: rawForecast.tempMin ?? rawForecast.temp_min ?? 0,
          tempMax: rawForecast.tempMax ?? rawForecast.temp_max ?? 0,
          rainMm: rawForecast.rainMm ?? rawForecast.precipitation ?? 0,
          windSpeed: rawForecast.windSpeed ?? rawForecast.wind_speed ?? 0,
          humidity: rawForecast.humidity ?? 0,
        } : null;
        setWeather(forecast);
        const schedulesData = await Promise.all(
          zonesData.map((zone: IrrigationZone) =>
            calculateZoneIrrigationSchedule(
              zone,
              zone.plantTaskIds ?? [],
              tasks,
              garden,
              forecast
            )
          )
        );
        setSchedules(schedulesData.filter(s => (s.litersNeeded ?? 0) > 0));
      } catch (error) {
        console.error('Error loading irrigation zones:', error);
        setError('Zone irrigue non disponibili. Verifica la connessione e riprova.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [garden, tasks, storageProvider]);

  const handleZoneCreate = async (zone: IrrigationZone) => {
    try {
      if (!systemId) throw new Error('Create an irrigation system before adding zones');
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...zoneInput } = zone;
      const created = await storageProvider.createIrrigationZone({
        ...zoneInput,
        systemId,
      });
      const updated = [...zones, created];
      setZones(updated);
      setShowWizard(false);
      
      // Ricalcola schedule
      const schedule = await calculateZoneIrrigationSchedule(
        created,
        created.plantTaskIds ?? [],
        tasks,
        garden,
        weather
      );
      if ((schedule.litersNeeded ?? 0) > 0) {
        setSchedules([...schedules, schedule]);
      }
    } catch (error) {
      console.error('Error creating zone:', error);
      setError(error instanceof Error ? error.message : 'Creazione zona non riuscita');
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

  const activeSchedules = schedules.filter(s => (s.suggestedDurationMinutes ?? 0) > 0);
  const totalMinutes = activeSchedules.reduce((sum, s) => sum + (s.suggestedDurationMinutes ?? 0), 0);
  const totalLiters = activeSchedules.reduce((sum, s) => sum + (s.litersNeeded ?? 0), 0);

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
              onClick={() => systemId ? setShowWizard(true) : onOpenManager?.()}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center gap-3"
            >
              <Plus size={16} />
              Nuova
            </button>
          </div>

          {zones.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm opacity-90">
                {error || (systemId
                  ? 'Nessuna zona configurata. Crea una zona per iniziare!'
                  : 'Configura prima un impianto irriguo dal gestore.')}
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
                                {Math.round(schedule.suggestedDurationMinutes ?? 0)} min
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

      {showWizard && systemId && (
        <IrrigationZoneWizard
          garden={garden}
          beds={beds}
          systemId={systemId}
          onComplete={handleZoneCreate}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </>
  );
}
