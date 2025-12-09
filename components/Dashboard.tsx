
import React, { useState, useEffect } from 'react';
import { GardenTask, Garden } from '../types';
import { Sun, CloudRain, CalendarCheck, AlertTriangle, Settings, Save, Cloud, CloudLightning, Snowflake, CloudFog, Loader2, MapPin, Droplets, ThermometerSun, FlaskConical, Shovel, ChevronDown, Plus, Trash2, Home, Sparkles, CheckCircle, XCircle, Moon, Package, Plane, Camera } from 'lucide-react';
import { getCurrentPositionWithRetry, getDefaultCoordinates } from '../services/geolocationService';
import { checkLifecycleStatus, LifecycleAdvice } from '../logic/lifecycleEngine';
import { getWeatherForecast, checkCriticalWeatherAlerts } from '../services/weatherService';
import { getMasterSheet } from '../services/plantMasterService';
import { getActivePlants } from '../services/taskCalculationService';
import SeedInventory from './SeedInventory';
import { calculateMoonPhase, getMoonPhaseName } from '../logic/lunarCalendar';
import { findAllSuccessionOpportunities, SuccessionSuggestion } from '../logic/successionEngine';
import { hasUpcomingVacation, hasActiveVacation, getDaysUntilDeparture } from '../logic/vacationEngine';
import VacationMode from './VacationMode';
import { checkPhotoReminder } from '../logic/lifecycleEngine';
import { getGardenSunExposure, calculateSunExposure } from '../services/sunExposureService';
import { generateWinterPreparationPlan } from '../logic/winterPreparationEngine';
import { WinterPreparationTask } from '../types';
import { calculateTotalGardenWaterNeeds } from '../logic/waterRequirementEngine';

interface DashboardProps {
  tasks: GardenTask[];
  onNavigateToJournal: () => void;
  gardens: Garden[];
  activeGardenId: string;
  onSelectGarden: (id: string) => void;
  onAddGarden: (g: Garden) => void;
  onUpdateGarden: (g: Garden) => void;
  onDeleteGarden: (id: string) => void;
  onUpdateTask: (task: GardenTask) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    tasks, onNavigateToJournal, gardens, activeGardenId, 
    onSelectGarden, onAddGarden, onUpdateGarden, onDeleteGarden, onUpdateTask
}) => {
  const activeGarden = gardens.find(g => g.id === activeGardenId);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  // Settings Form State
  const [tempName, setTempName] = useState('');
  const [tempSize, setTempSize] = useState('');
  const [tempPh, setTempPh] = useState('');
  const [tempType, setTempType] = useState<Garden['soilType'] | ''>('');
  const [tempSunExposure, setTempSunExposure] = useState<Garden['sunExposure'] | ''>('');
  const [tempSunHours, setTempSunHours] = useState('');
  const [tempOrientation, setTempOrientation] = useState<Garden['orientation'] | ''>('');
  
  // Garden Switcher State
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Weather State
  const [weather, setWeather] = useState<{ temp: number; tempMin?: number; tempMax?: number; code: number; rainForecastMm: number } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  
  const [seasonFilter, setSeasonFilter] = useState<'Summer' | 'Winter'>('Summer');
  
  // Lifecycle Coach State
  const [lifecycleAdvices, setLifecycleAdvices] = useState<Map<string, LifecycleAdvice>>(new Map());
  const [lifecycleLoading, setLifecycleLoading] = useState(false);
  
  // Seed Inventory State
  const [showSeedInventory, setShowSeedInventory] = useState(false);
  
  // Succession Opportunities State
  const [successionOpportunities, setSuccessionOpportunities] = useState<SuccessionSuggestion[]>([]);
  
  // Vacation Mode State
  const [showVacationMode, setShowVacationMode] = useState(false);
  
  // Winter Preparation State
  const [winterTasks, setWinterTasks] = useState<WinterPreparationTask[]>([]);
  const [showWinterPrep, setShowWinterPrep] = useState(false);

  // Initialize form when opening settings or creating new
  useEffect(() => {
      if (isCreatingNew) {
          setTempName('');
          setTempSize('');
          setTempPh('');
          setTempType('');
          setTempSunExposure('');
          setTempSunHours('');
          setTempOrientation('');
      } else if (activeGarden) {
          setTempName(activeGarden.name);
          setTempSize(activeGarden.sizeSqMeters.toString());
          setTempPh(activeGarden.soilPh?.toString() || '');
          setTempType(activeGarden.soilType || '');
          setTempSunExposure(activeGarden.sunExposure || '');
          setTempSunHours(activeGarden.sunHours?.toString() || '');
          setTempOrientation(activeGarden.orientation || '');
      }
  }, [activeGarden, isEditingSettings, isCreatingNew]);

  // Determine season
  useEffect(() => {
      const month = new Date().getMonth() + 1;
      setSeasonFilter((month >= 4 && month <= 9) ? 'Summer' : 'Winter');
  }, []);
  
  // Calculate winter preparation tasks
  useEffect(() => {
    if (activeGarden) {
      const currentMonth = new Date().getMonth() + 1;
      // Show winter prep if we're in preparation season (Nov-Feb for Summer, Jun-Aug for Winter)
      const isPrepSeason = 
        (currentMonth >= 11 || currentMonth <= 2) || // Nov-Feb for Summer prep
        (currentMonth >= 6 && currentMonth <= 8); // Jun-Aug for Winter prep
      
      if (isPrepSeason) {
        const targetSeason = (currentMonth >= 11 || currentMonth <= 2) ? 'Summer' : 'Winter';
        const tasks = generateWinterPreparationPlan(activeGarden, targetSeason);
        setWinterTasks(tasks);
        setShowWinterPrep(tasks.length > 0);
      } else {
        setWinterTasks([]);
        setShowWinterPrep(false);
      }
    }
  }, [activeGarden]);

  const pendingTasks = tasks.filter(t => !t.completed && (!t.season || t.season === seasonFilter)).length;
  
  const today = new Date();
  const upcomingReminders = tasks.filter(t => {
      if (!t.nextDueDate || t.completed) return false;
      const due = new Date(t.nextDueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays >= 0 && diffDays <= 7; 
  });

  // Weather Fetching Logic
  useEffect(() => {
    // If garden has saved coordinates, use them. Otherwise, try browser geolocation.
    const fetchWeather = async (lat: number, lng: number) => {
        setWeatherLoading(true);
        setWeatherError(false);
        try {
            // Usa getWeatherForecast che include tempMin e tempMax
            const forecast = await getWeatherForecast(lat, lng);
            if (forecast) {
                setWeather({
                    temp: forecast.temp,
                    tempMin: forecast.tempMin,
                    tempMax: forecast.tempMax,
                    code: forecast.code,
                    rainForecastMm: forecast.rainForecastMm
                });
            }
        } catch (e) {
            console.error("Weather fetch failed", e);
            setWeatherError(true);
            // Se il fetch fallisce, prova con coordinate di default (Roma) come fallback
            const defaultCoords = getDefaultCoordinates();
            if (lat !== defaultCoords.latitude || lng !== defaultCoords.longitude) {
                console.warn("Tentativo con coordinate di default (Roma)");
                try {
                    const fallbackForecast = await getWeatherForecast(defaultCoords.latitude, defaultCoords.longitude);
                    if (fallbackForecast) {
                        setWeather({
                            temp: fallbackForecast.temp,
                            tempMin: fallbackForecast.tempMin,
                            tempMax: fallbackForecast.tempMax,
                            code: fallbackForecast.code,
                            rainForecastMm: fallbackForecast.rainForecastMm
                        });
                        setWeatherError(false);
                    }
                } catch (fallbackError) {
                    console.error("Fallback weather fetch also failed", fallbackError);
                }
            }
        } finally {
            setWeatherLoading(false);
        }
    };

    if (activeGarden?.coordinates) {
        // Usa coordinate salvate dell'orto
        fetchWeather(activeGarden.coordinates.latitude, activeGarden.coordinates.longitude);
    } else {
        // Prova geolocalizzazione con retry (silenzioso - non mostra errori all'utente)
        setWeatherLoading(true);
        getCurrentPositionWithRetry(2, {
            timeout: 20000, // 20 secondi su mobile
            enableHighAccuracy: false,
            maximumAge: 300000, // 5 minuti
        }).then((result) => {
            if (result.success && result.latitude && result.longitude) {
                fetchWeather(result.latitude, result.longitude);
            } else {
                // Fallback silenzioso a coordinate di default
                console.warn("Geolocalizzazione non disponibile, uso coordinate di default:", result.error);
                const defaultCoords = getDefaultCoordinates();
                fetchWeather(defaultCoords.latitude, defaultCoords.longitude);
            }
        });
    }
  }, [activeGarden]);

  // Calculate lifecycle advices for active plants
  useEffect(() => {
    if (!activeGarden) return;
    
    const activePlantTasks = getActivePlants(tasks.filter(t => t.gardenId === activeGardenId));
    if (activePlantTasks.length === 0) {
      setLifecycleAdvices(new Map());
      return;
    }

    setLifecycleLoading(true);
    const advicesMap = new Map<string, LifecycleAdvice>();

    Promise.all(
      activePlantTasks.map(async (task) => {
        const masterData = getMasterSheet(task.plantName);
        if (!masterData) return;

        try {
          const advice = await checkLifecycleStatus(task, masterData, activeGarden);
          if (advice) {
            advicesMap.set(task.id, advice);
          }
        } catch (error) {
          console.error(`Error calculating lifecycle for ${task.plantName}:`, error);
        }
      })
    ).then(() => {
      setLifecycleAdvices(advicesMap);
      setLifecycleLoading(false);
    });
  }, [tasks, activeGarden, activeGardenId]);

  // Calculate succession opportunities
  useEffect(() => {
    if (!activeGarden || tasks.length === 0) {
      setSuccessionOpportunities([]);
      return;
    }

    // Filter tasks to only include those from the active garden
    const activeGardenTasks = tasks.filter(task => task.gardenId === activeGardenId);
    const opportunities = findAllSuccessionOpportunities(activeGardenTasks);
    setSuccessionOpportunities(opportunities);
  }, [tasks, activeGarden, activeGardenId]);

  const handleLifecycleResponse = (task: GardenTask, response: boolean, advice: LifecycleAdvice) => {
    const updatedTask: GardenTask = {
      ...task,
      lifecycleState: advice.phase,
      userResponses: {
        ...task.userResponses,
        ...(advice.phase === 'Germination' && { germinationConfirmed: response }),
        ...(advice.phase === 'Transplanting' && { transplantReady: response }),
      }
    };

    // Se l'utente risponde "Sì" alla germinazione, passa a Nursing
    if (advice.phase === 'Germination' && response) {
      updatedTask.lifecycleState = 'Nursing';
    }

    // Se l'utente risponde "Sì" al trapianto, passa a Production
    if (advice.phase === 'Transplanting' && response) {
      updatedTask.lifecycleState = 'Production';
    }

    onUpdateTask(updatedTask);
  };

  const handleSaveGarden = async () => {
      const size = parseFloat(tempSize);
      const ph = parseFloat(tempPh);
      const sunHours = parseFloat(tempSunHours);
      
      // Calcola esposizione automaticamente se non specificata manualmente
      let finalSunExposure = tempSunExposure || undefined;
      let finalSunHours = !isNaN(sunHours) && sunHours > 0 && sunHours <= 12 ? sunHours : undefined;
      
      // Se non è specificata manualmente, prova a calcolarla dalle coordinate
      if (!finalSunExposure && activeGarden?.coordinates) {
          const calculated = calculateSunExposure(
              activeGarden.coordinates.latitude,
              activeGarden.coordinates.longitude,
              tempOrientation || undefined
          );
          finalSunExposure = calculated.exposure;
          finalSunHours = calculated.estimatedHours;
      }
      
      const gardenData = {
          name: tempName || 'Nuovo Orto',
          sizeSqMeters: !isNaN(size) && size > 0 ? size : 0,
          soilPh: !isNaN(ph) && ph > 0 && ph <= 14 ? ph : undefined,
          soilType: tempType || undefined,
          sunExposure: finalSunExposure,
          sunHours: finalSunHours,
          orientation: tempOrientation || undefined
      };

      if (isCreatingNew) {
          // Prova a ottenere la posizione con retry
          const result = await getCurrentPositionWithRetry(2, {
              timeout: 20000,
              enableHighAccuracy: false,
          });
          
          if (result.success && result.latitude && result.longitude) {
              // Calcola esposizione se non specificata
              if (!finalSunExposure) {
                  const calculated = calculateSunExposure(
                      result.latitude,
                      result.longitude,
                      tempOrientation || undefined
                  );
                  gardenData.sunExposure = calculated.exposure;
                  gardenData.sunHours = calculated.estimatedHours;
              }
              
              onAddGarden({
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  ...gardenData,
                  coordinates: { 
                      latitude: result.latitude, 
                      longitude: result.longitude 
                  }
              });
          } else {
              // Crea orto senza coordinate (silenzioso - non mostra errori)
              onAddGarden({
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  ...gardenData
              });
          }
          setIsCreatingNew(false);
          setIsEditingSettings(false); // Close modal
      } else if (activeGarden) {
          onUpdateGarden({
              ...activeGarden,
              ...gardenData
          });
          setIsEditingSettings(false);
      }
  };

  const updateLocation = async () => {
      if (!activeGarden) return;
      
      const result = await getCurrentPositionWithRetry(2, {
          timeout: 20000,
          enableHighAccuracy: false,
      });
      
      if (result.success && result.latitude && result.longitude) {
          onUpdateGarden({
              ...activeGarden,
              coordinates: { 
                  latitude: result.latitude, 
                  longitude: result.longitude 
              }
          });
          // Mostra feedback positivo senza alert (usa un toast o stato)
          // Per ora usiamo console.log, ma potresti aggiungere un sistema di notifiche
          console.log("✅ Posizione orto aggiornata con successo!");
      } else {
          // Non mostrare alert fastidioso - l'utente può riprovare
          // Se vuoi, puoi aggiungere un messaggio più elegante nell'UI
          console.warn("❌ Impossibile aggiornare la posizione:", result.error);
      }
  };

  const getSoilLabel = (type: string) => {
      const map: Record<string, string> = {
          'Clay': 'Argilloso',
          'Sandy': 'Sabbioso',
          'Loamy': 'Franco (Ideale)',
          'Peaty': 'Torba',
          'Chalky': 'Calcareo',
          'Silty': 'Limoso'
      };
      return map[type] || type;
  }

  const getWeatherInfo = (code: number) => {
      if (code === 0) return { label: "Cielo Sereno", icon: Sun };
      if (code >= 1 && code <= 3) return { label: "Nuvoloso", icon: Cloud };
      if (code >= 45 && code <= 48) return { label: "Nebbia", icon: CloudFog };
      if (code >= 51 && code <= 67) return { label: "Pioggia", icon: CloudRain };
      if (code >= 71 && code <= 77) return { label: "Neve", icon: Snowflake };
      if (code >= 80 && code <= 82) return { label: "Rovesci", icon: CloudRain };
      if (code >= 95) return { label: "Temporale", icon: CloudLightning };
      return { label: "Variabile", icon: Sun };
  };

  const getIrrigationAdvice = (rainMm: number, temp: number) => {
      // Calcola fabbisogno totale se disponibile
      const waterNeeds = activeGarden ? calculateTotalGardenWaterNeeds(tasks, activeGarden) : null;
      const totalLiters = waterNeeds?.totalLitersPerDay || 0;
      
      if (rainMm >= 5) {
          return { 
            status: "STOP IRRIGAZIONE", 
            detail: `Previsti ${rainMm}mm di pioggia. ${totalLiters > 0 ? `Risparmio: ${totalLiters.toFixed(1)}L oggi.` : ''}`, 
            colorClass: "bg-blue-100 border-blue-200 text-blue-900", 
            icon: CloudRain 
          };
      } else if (rainMm > 0 && rainMm < 5) {
          const reducedAmount = totalLiters > 0 ? (totalLiters * 0.5).toFixed(1) : '';
          return { 
            status: "RIDUCI AL 50%", 
            detail: `Pioggia leggera (${rainMm}mm). ${reducedAmount ? `Dai ${reducedAmount}L invece di ${totalLiters.toFixed(1)}L.` : ''}`, 
            colorClass: "bg-cyan-50 border-cyan-200 text-cyan-900", 
            icon: Droplets 
          };
      } else if (temp > 30) {
          const increasedAmount = totalLiters > 0 ? (totalLiters * 1.3).toFixed(1) : '';
          return { 
            status: "AUMENTA ACQUA", 
            detail: `Caldo intenso (${temp}°C). ${increasedAmount ? `Aumenta a ${increasedAmount}L (da ${totalLiters.toFixed(1)}L base).` : 'Aumenta irrigazione del 30%.'}`, 
            colorClass: "bg-orange-100 border-orange-200 text-orange-900", 
            icon: ThermometerSun 
          };
      } else {
          return { 
            status: "IRRIGAZIONE REGOLARE", 
            detail: totalLiters > 0 ? `Fabbisogno: ${totalLiters.toFixed(1)}L/giorno per tutto l'orto.` : "Meteo stabile.", 
            colorClass: "bg-green-50 border-green-200 text-green-900", 
            icon: Droplets 
          };
      }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header className="mt-2 flex justify-between items-start">
        <div className="relative">
             {/* GARDEN SWITCHER */}
             <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2 text-green-900 font-extrabold text-2xl hover:opacity-80 transition-opacity"
             >
                 {activeGarden?.name || 'Seleziona Orto'}
                 <ChevronDown size={24} className={`transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`}/>
             </button>
             <p className="text-green-700 text-sm flex items-center gap-1">
                 {activeGarden?.coordinates ? <><MapPin size={12}/> Localizzato</> : 'Posizione sconosciuta'}
             </p>

             {isSwitcherOpen && (
                 <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-green-100 z-50 w-64 overflow-hidden animate-in fade-in zoom-in-95">
                     <div className="p-2">
                         <p className="text-xs font-bold text-gray-400 uppercase px-2 py-1">I tuoi Orti</p>
                         {gardens.map(g => (
                             <button 
                                key={g.id}
                                onClick={() => { onSelectGarden(g.id); setIsSwitcherOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${g.id === activeGardenId ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                             >
                                 <Home size={16}/> {g.name}
                             </button>
                         ))}
                         <div className="h-px bg-gray-100 my-1"></div>
                         <button 
                            onClick={() => { setIsCreatingNew(true); setIsEditingSettings(true); setIsSwitcherOpen(false); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-green-600 hover:bg-green-50 flex items-center gap-2"
                         >
                             <Plus size={16}/> Aggiungi Nuovo Orto
                         </button>
                     </div>
                 </div>
             )}
        </div>
        <button 
            onClick={() => { setIsCreatingNew(false); setIsEditingSettings(!isEditingSettings); }}
            className="p-2 bg-white rounded-xl shadow-sm border border-green-100 text-green-700 hover:bg-green-50"
        >
            <Settings size={20} />
        </button>
      </header>

      {/* Settings Modal (Edit or Create) */}
      {(isEditingSettings) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-green-900">{isCreatingNew ? 'Nuovo Orto' : 'Configurazione Orto'}</h2>
                      <button onClick={() => setIsEditingSettings(false)}><Settings size={20} className="text-gray-400"/></button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                       <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome Orto</label>
                            <input 
                                type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                                placeholder="Es. Orto Casa"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                            />
                        </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Dimensioni (mq)</label>
                            <input 
                                type="number" value={tempSize} onChange={(e) => setTempSize(e.target.value)}
                                placeholder="Es. 50"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">pH Suolo</label>
                            <input 
                                type="number" step="0.1" value={tempPh} onChange={(e) => setTempPh(e.target.value)}
                                placeholder="Es. 6.5"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                            />
                        </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Tipo di Terreno</label>
                          <select 
                            value={tempType} onChange={(e) => setTempType(e.target.value as any)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                          >
                              <option value="">Seleziona...</option>
                              <option value="Loamy">Franco (Equilibrato)</option>
                              <option value="Clay">Argilloso (Pesante)</option>
                              <option value="Sandy">Sabbioso (Leggero)</option>
                              <option value="Silty">Limoso</option>
                              <option value="Peaty">Torba (Organico)</option>
                              <option value="Chalky">Calcareo</option>
                          </select>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Orientamento</label>
                          <select 
                            value={tempOrientation} onChange={(e) => setTempOrientation(e.target.value as any)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                          >
                              <option value="">Seleziona...</option>
                              <option value="South">Sud (Massimo sole)</option>
                              <option value="Southeast">Sud-Est</option>
                              <option value="Southwest">Sud-Ovest</option>
                              <option value="East">Est (Sole mattutino)</option>
                              <option value="West">Ovest (Sole pomeridiano)</option>
                              <option value="Northeast">Nord-Est</option>
                              <option value="Northwest">Nord-Ovest</option>
                              <option value="North">Nord (Poco sole)</option>
                          </select>
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Esposizione al Sole</label>
                          <select 
                            value={tempSunExposure} onChange={(e) => setTempSunExposure(e.target.value as any)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                          >
                              <option value="">Calcola automaticamente</option>
                              <option value="FullSun">Pieno Sole (8+ ore)</option>
                              <option value="PartialSun">Sole Parziale (5-7 ore)</option>
                              <option value="PartialShade">Ombra Parziale (3-4 ore)</option>
                              <option value="FullShade">Ombra (meno di 3 ore)</option>
                          </select>
                      </div>
                      
                      {tempSunExposure && (
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Ore di Sole/Giorno</label>
                              <input 
                                  type="number" 
                                  min="0" 
                                  max="12" 
                                  step="0.5"
                                  value={tempSunHours} 
                                  onChange={(e) => setTempSunHours(e.target.value)}
                                  placeholder="Es. 6.5"
                                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none mt-1"
                              />
                          </div>
                      )}

                      {!isCreatingNew && (
                           <button 
                                onClick={updateLocation}
                                className="w-full py-2 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 flex items-center justify-center gap-2 text-sm"
                            >
                                <MapPin size={16}/> Aggiorna Posizione GPS (Qui)
                            </button>
                      )}
                  </div>

                  <div className="flex gap-2">
                      {!isCreatingNew && (
                          <button 
                            onClick={() => { onDeleteGarden(activeGardenId); setIsEditingSettings(false); }}
                            className="p-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100"
                          >
                              <Trash2 size={20}/>
                          </button>
                      )}
                      <button 
                        onClick={handleSaveGarden}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2"
                      >
                          <Save size={18} />
                          {isCreatingNew ? 'Crea Orto' : 'Salva Modifiche'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Quick Profile Info */}
      {activeGarden && !isEditingSettings && (() => {
          const sunExposure = getGardenSunExposure(activeGarden);
          return (
              <div className="bg-green-50/50 p-4 rounded-xl border border-dashed border-green-200 flex flex-wrap gap-4 justify-between items-center text-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-green-800 flex items-center gap-1"><Settings size={14}/> <b>{activeGarden.sizeSqMeters} m²</b></span>
                      {activeGarden.soilPh && <span className="text-green-800 flex items-center gap-1"><FlaskConical size={14}/> pH <b>{activeGarden.soilPh}</b></span>}
                      {activeGarden.soilType && <span className="text-green-800 flex items-center gap-1"><Shovel size={14}/> <b>{getSoilLabel(activeGarden.soilType)}</b></span>}
                      {sunExposure && (
                          <span className="text-green-800 flex items-center gap-1">
                              <Sun size={14}/> <b>{sunExposure.estimatedHours}h</b> sole
                              <span className="text-xs text-gray-600 ml-1">({sunExposure.exposure === 'FullSun' ? 'Pieno sole' : sunExposure.exposure === 'PartialSun' ? 'Sole parziale' : sunExposure.exposure === 'PartialShade' ? 'Ombra parziale' : 'Ombra'})</span>
                          </span>
                      )}
                  </div>
              </div>
          );
      })()}

      {/* Dynamic Weather Widget */}
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden min-h-[140px] flex items-center">
        {weatherLoading ? (
             <div className="flex items-center gap-2 w-full justify-center opacity-80">
                 <Loader2 className="animate-spin" size={24} />
                 <span>Recupero meteo per {activeGarden?.name}...</span>
             </div>
        ) : weatherError ? (
            <div className="relative z-10 w-full flex flex-col items-center text-center opacity-80">
                <MapPin size={32} className="mb-2" />
                <p className="font-bold">Posizione non disponibile</p>
                <p className="text-xs mt-1">Imposta la posizione nelle impostazioni dell'orto.</p>
            </div>
        ) : weather ? (
            (() => {
                const info = getWeatherInfo(weather.code);
                const WeatherIcon = info.icon;
                return (
                    <div className="relative z-10 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold opacity-90 mb-1 flex items-center gap-2">
                                    <MapPin size={16} /> Meteo: {activeGarden?.name}
                                </h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <WeatherIcon size={48} className="text-yellow-300 animate-pulse-slow" />
                                    <div>
                                        <span className="text-5xl font-bold tracking-tighter">{weather.temp}°</span>
                                        <span className="text-xl opacity-80">C</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right mt-2">
                                <p className="text-xl font-bold">{info.label}</p>
                            </div>
                        </div>
                    </div>
                );
            })()
        ) : null}
        <CloudRain size={120} className="absolute -right-4 -bottom-10 text-white opacity-10" />
      </div>

      {/* SMART IRRIGATION SUGGESTION */}
      {weather && !weatherLoading && (
          (() => {
              const advice = getIrrigationAdvice(weather.rainForecastMm, weather.temp);
              const Icon = advice.icon;
              return (
                <div className={`${advice.colorClass} p-5 rounded-2xl border-l-8 shadow-sm flex items-start gap-4 animate-in slide-in-from-bottom-2`}>
                    <div className="bg-white/50 p-3 rounded-full flex-shrink-0">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg uppercase tracking-tight">{advice.status}</h3>
                        <p className="text-sm font-medium opacity-90 mt-1">{advice.detail}</p>
                    </div>
                </div>
              );
          })()
      )}

      {/* WATER REQUIREMENTS */}
      {activeGarden && (() => {
        const waterNeeds = calculateTotalGardenWaterNeeds(tasks, activeGarden);
        if (waterNeeds.totalLitersPerDay === 0) return null;
        
        return (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-200 rounded-full">
                <Droplets size={24} className="text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-900">Fabbisogno Idrico Giornaliero</h3>
                <p className="text-sm text-blue-700">Totale per tutto l'orto</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm mb-3">
              <p className="text-3xl font-bold text-blue-600 text-center">
                {waterNeeds.totalLitersPerDay.toFixed(1)}L
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">litri al giorno</p>
            </div>
            
            {waterNeeds.breakdown.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-xs font-bold text-blue-900 uppercase mb-2">Breakdown per pianta:</p>
                {waterNeeds.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{item.plantName}</span>
                    <span className="text-blue-600 font-bold">
                      {item.liters.toFixed(1)}L ({item.plants} piante)
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {waterNeeds.recommendations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-xs font-bold text-yellow-900 uppercase mb-1">Raccomandazioni:</p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  {waterNeeds.recommendations.map((rec, idx) => (
                    <li key={idx}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })()}

      {/* CRITICAL WEATHER ALERTS */}
      {weather && !weatherLoading && (() => {
        const alerts = checkCriticalWeatherAlerts(weather);
        if (alerts.length === 0) return null;
        
        const iconMap: Record<string, React.ComponentType<any>> = {
          'Snowflake': Snowflake,
          'ThermometerSun': ThermometerSun,
          'CloudRain': CloudRain
        };
        
        return (
          <div className="space-y-3">
            {alerts.map((alert, idx) => {
              const Icon = iconMap[alert.icon] || AlertTriangle;
              const severityColors = {
                'Critical': 'bg-red-50 border-red-400 text-red-900',
                'High': 'bg-orange-50 border-orange-400 text-orange-900',
                'Medium': 'bg-yellow-50 border-yellow-400 text-yellow-900'
              };
              
              return (
                <div key={idx} className={`${severityColors[alert.severity]} border-l-4 p-4 rounded-r-xl shadow-sm flex items-start gap-3`}>
                  <Icon size={24} className="flex-shrink-0" />
                  <p className="font-bold text-sm">{alert.message}</p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* WINTER PREPARATION TASKS */}
      {showWinterPrep && winterTasks.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-200 rounded-full">
                <Shovel size={24} className="text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-blue-900">Lavori Preparatori</h3>
                <p className="text-sm text-blue-700">Preparazione per orto {seasonFilter === 'Summer' ? 'estivo' : 'invernale'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowWinterPrep(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <XCircle size={20} />
            </button>
          </div>
          
          <div className="space-y-3">
            {winterTasks
              .sort((a, b) => {
                // Sort by priority first, then by month
                const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return a.dueMonth - b.dueMonth;
              })
              .map((task) => {
                const categoryIcons = {
                  'Soil': Shovel,
                  'Fertilization': Package,
                  'Structure': Settings,
                  'Planning': Calendar
                };
                const categoryColors = {
                  'Soil': 'bg-brown-100 text-brown-700',
                  'Fertilization': 'bg-purple-100 text-purple-700',
                  'Structure': 'bg-gray-100 text-gray-700',
                  'Planning': 'bg-blue-100 text-blue-700'
                };
                const priorityColors = {
                  'Critical': 'border-red-400 bg-red-50',
                  'High': 'border-orange-400 bg-orange-50',
                  'Medium': 'border-yellow-400 bg-yellow-50',
                  'Low': 'border-gray-300 bg-gray-50'
                };
                const Icon = categoryIcons[task.category];
                const monthNames = ['', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
                
                return (
                  <div key={task.id} className={`${priorityColors[task.priority]} border-l-4 rounded-r-xl p-4 shadow-sm`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={18} className="text-gray-600" />
                          <span className={`text-xs font-bold px-2 py-1 rounded ${categoryColors[task.category]}`}>
                            {task.category === 'Soil' ? 'Suolo' : 
                             task.category === 'Fertilization' ? 'Concimazione' :
                             task.category === 'Structure' ? 'Struttura' : 'Pianificazione'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {monthNames[task.dueMonth]}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{task.description}</p>
                        
                        {task.materials && task.materials.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-bold text-gray-600 uppercase mb-1">Materiali necessari:</p>
                            <ul className="text-xs text-gray-700 space-y-0.5">
                              {task.materials.map((mat, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <span className="text-blue-600">•</span> {mat}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Istruzioni:</p>
                          <ol className="text-xs text-gray-700 space-y-1">
                            {task.instructions.map((inst, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">{idx + 1}.</span>
                                <span>{inst}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          ⏱️ Tempo stimato: {task.estimatedTime}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Convert to GardenTask and add to journal
                        const month = new Date().getMonth() + 1;
                        const season = (month >= 4 && month <= 9) ? 'Summer' : 'Winter';
                        const taskDate = new Date();
                        taskDate.setMonth(task.dueMonth - 1);
                        taskDate.setDate(15); // Middle of the month
                        
                        onUpdateTask({
                          id: crypto.randomUUID(),
                          plantName: task.title,
                          taskType: task.category === 'Fertilization' ? 'Fertilize' : 'Treatment',
                          date: taskDate.toISOString().split('T')[0],
                          notes: `${task.description}\n\nMateriali: ${task.materials?.join(', ') || 'Nessuno'}\n\nIstruzioni:\n${task.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`,
                          gardenId: activeGarden?.id || '',
                          season,
                          completed: false
                        });
                      }}
                      className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CalendarCheck size={16} />
                      Aggiungi al Diario
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MOON PHASE WIDGET */}
      {(() => {
        const moonInfo = calculateMoonPhase(new Date());
        const moonName = moonInfo.name; // Reuse the name from moonInfo instead of recalculating
        const moonEmoji = moonInfo.isWaxing ? '🌒' : moonInfo.isWaning ? '🌘' : moonInfo.phase === 'Full' ? '🌕' : moonInfo.phase === 'New' ? '🌑' : '🌓';
        
        return (
          <div className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon size={32} className="text-yellow-200" />
                <div>
                  <h3 className="text-lg font-bold">Fase Lunare</h3>
                  <p className="text-sm opacity-90">{moonName}</p>
                </div>
              </div>
              <div className="text-4xl">{moonEmoji}</div>
            </div>
            <div className="mt-3 text-xs opacity-80">
              {moonInfo.isWaxing && 'Luna Crescente: Ideale per semina foglie/frutti e trapianti'}
              {moonInfo.isWaning && 'Luna Calante: Ideale per semina radici e raccolta foglie'}
              {moonInfo.phase === 'Full' && 'Luna Piena: Evita semine, buona per raccolti'}
              {moonInfo.phase === 'New' && 'Luna Nuova: Inizio nuovo ciclo, buona per semine'}
            </div>
          </div>
        );
      })()}

      {/* SEASON TOGGLE */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 flex gap-2 shadow-sm">
          <button onClick={() => setSeasonFilter('Summer')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${seasonFilter === 'Summer' ? 'bg-yellow-100 text-yellow-800 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Sun size={18}/> Orto Estivo
          </button>
          <button onClick={() => setSeasonFilter('Winter')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${seasonFilter === 'Winter' ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Snowflake size={18}/> Orto Invernale
          </button>
      </div>

      {/* Vacation Mode Alert */}
      {activeGarden && !showVacationMode && (hasUpcomingVacation(activeGarden) || hasActiveVacation(activeGarden)) && (
        <div className={`rounded-2xl p-5 shadow-lg border-2 ${
          hasActiveVacation(activeGarden)
            ? 'bg-green-50 border-green-300'
            : 'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${
                hasActiveVacation(activeGarden) ? 'bg-green-200' : 'bg-blue-200'
              }`}>
                <Plane size={24} className={hasActiveVacation(activeGarden) ? 'text-green-700' : 'text-blue-700'} />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {hasActiveVacation(activeGarden) ? '🌴 Sei in vacanza!' : '⏰ Vacanza in arrivo'}
                </h3>
                <p className="text-sm opacity-80">
                  {hasActiveVacation(activeGarden)
                    ? `Le tue piante sono in modalità sopravvivenza fino al ${activeGarden.vacationMode && new Date(activeGarden.vacationMode.endDate).toLocaleDateString('it-IT')}`
                    : activeGarden.vacationMode && `Parti tra ${getDaysUntilDeparture(new Date(activeGarden.vacationMode.startDate))} giorni - Completa il piano di sopravvivenza!`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowVacationMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
            >
              Apri Piano
            </button>
          </div>
        </div>
      )}

      {/* Vacation Mode Button */}
      {activeGarden && !showVacationMode && !hasUpcomingVacation(activeGarden) && !hasActiveVacation(activeGarden) && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Plane size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Modalità Vacanza</h3>
                <p className="text-xs text-gray-500">Piano di sopravvivenza per le tue piante</p>
              </div>
            </div>
            <button
              onClick={() => setShowVacationMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
            >
              Imposta Vacanza
            </button>
          </div>
        </div>
      )}

      {/* Vacation Mode Component */}
      {showVacationMode && activeGarden && (
        <VacationMode
          garden={activeGarden}
          tasks={tasks}
          onUpdateGarden={(updatedGarden) => {
            onUpdateGarden(updatedGarden);
            setShowVacationMode(false);
          }}
        />
      )}

      {/* PHOTO REMINDERS SECTION */}
      {activeGarden && !showVacationMode && (() => {
          const activePlantTasks = tasks.filter(t => 
              t.gardenId === activeGardenId && 
              !t.completed && 
              (t.taskType === 'Sowing' || t.taskType === 'Transplant')
          );
          
          const photoReminders = activePlantTasks
              .map(task => ({ task, reminder: checkPhotoReminder(task) }))
              .filter(({ reminder }) => reminder?.needsPhoto)
              .sort((a, b) => (b.reminder?.daysSinceLastPhoto || 0) - (a.reminder?.daysSinceLastPhoto || 0));
          
          if (photoReminders.length === 0) return null;
          
          return (
              <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Camera size={20} className="text-blue-600" />
                      Reminder Foto Progressi
                  </h3>
                  <div className="space-y-3">
                      {photoReminders.map(({ task, reminder }) => (
                          reminder && (
                              <div key={task.id} className={`border-l-4 p-4 rounded-r-xl ${
                                  reminder.isUrgent 
                                      ? 'bg-red-50 border-red-400' 
                                      : 'bg-blue-50 border-blue-400'
                              }`}>
                                  <div className="flex items-center gap-3">
                                      <Camera size={24} className={`${reminder.isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                                      <div className="flex-1">
                                          <h4 className="font-bold text-gray-800">{task.plantName}</h4>
                                          <p className="text-sm text-gray-700 mt-1">{reminder.message}</p>
                                          <p className="text-xs text-gray-500 mt-1">
                                              {reminder.daysSinceLastPhoto} giorni dall'ultima foto
                                          </p>
                                      </div>
                                      {reminder.isUrgent && (
                                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                              URGENTE
                                          </span>
                                      )}
                                  </div>
                              </div>
                          )
                      ))}
                  </div>
              </div>
          );
      })()}

      {/* LIFECYCLE COACH SECTION */}
      {activeGarden && !showVacationMode && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600" />
            Coach delle Piante
          </h3>
          {lifecycleLoading ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center">
              <Loader2 className="animate-spin mx-auto mb-2 text-green-600" size={24} />
              <p className="text-sm text-gray-500">Analisi delle tue piante...</p>
            </div>
          ) : lifecycleAdvices.size === 0 ? (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <p className="text-green-700">Nessuna pianta attiva al momento. Aggiungi una semina o trapianto per ricevere suggerimenti personalizzati!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(lifecycleAdvices.entries()).map(([taskId, advice]) => {
                const task = tasks.find(t => t.id === taskId);
                if (!task) return null;

                const getAdviceColor = () => {
                  switch (advice.type) {
                    case 'WARNING': return 'bg-orange-50 border-orange-200 text-orange-900';
                    case 'CHECK': return 'bg-blue-50 border-blue-200 text-blue-900';
                    case 'TASK': return 'bg-purple-50 border-purple-200 text-purple-900';
                    default: return 'bg-green-50 border-green-200 text-green-900';
                  }
                };

                return (
                  <div key={taskId} className={`${getAdviceColor()} p-5 rounded-2xl border-l-8 shadow-sm`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{task.plantName}</h4>
                        <p className="text-sm font-medium opacity-90">{advice.message}</p>
                      </div>
                      <span className="text-xs font-bold uppercase bg-white/50 px-2 py-1 rounded">
                        {advice.phase}
                      </span>
                    </div>

                    {/* Bottoni Sì/No per CHECK */}
                    {advice.type === 'CHECK' && advice.actionYes && advice.actionNo && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleLifecycleResponse(task, true, advice)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Sì
                        </button>
                        <button
                          onClick={() => handleLifecycleResponse(task, false, advice)}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          No
                        </button>
                      </div>
                    )}

                    {/* Lista sub-tasks */}
                    {advice.subTasks && advice.subTasks.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold uppercase opacity-75 mb-2">Cosa fare:</p>
                        <ul className="space-y-1">
                          {advice.subTasks.map((subTask, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-green-600 mt-1">•</span>
                              <span>{subTask}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Related Advice (Nutrients/Health) */}
                    {advice.relatedAdvice && (
                      <div className="mt-4 pt-4 border-t border-white/30">
                        {advice.relatedAdvice.nutrients && advice.relatedAdvice.nutrients.shouldFertilize && (
                          <div className="text-xs mb-2">
                            <span className="font-bold">💚 Nutrizione: </span>
                            <span>{advice.relatedAdvice.nutrients.adviceTitle}</span>
                          </div>
                        )}
                        {advice.relatedAdvice.health && (
                          <div className="text-xs">
                            <span className="font-bold">🛡️ Protezione: </span>
                            <span>{advice.relatedAdvice.health.productToUse}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Prossime Successioni */}
      {successionOpportunities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600" />
            Prossime Successioni
          </h3>
          <div className="space-y-3">
            {successionOpportunities.map((suggestion, idx) => {
              const startSowingStr = suggestion.startSowingDate.toLocaleDateString('it-IT');
              const transplantStr = suggestion.transplantDate.toLocaleDateString('it-IT');
              
              return (
                <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-800 mb-1">
                        {suggestion.plant.commonName.toLowerCase()} → {suggestion.plant.commonName.toLowerCase()}
                      </h4>
                      <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    </div>
                    <span className="text-xs font-bold uppercase bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {suggestion.daysUntilSpaceFree} giorni
                    </span>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarCheck size={16} className="text-purple-600" />
                      <span className="font-medium text-gray-700">
                        Semina: <span className="font-bold text-purple-700">{startSowingStr}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-medium text-gray-700">
                        Trapianto: <span className="font-bold text-green-700">{transplantStr}</span>
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      // Navigate to Planner with pre-selected plant
                      // This would require passing a callback or using navigation
                      console.log("Pianifica successione:", suggestion.plant.commonName);
                    }}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={16} />
                    Pianifica Successione
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-between h-32 cursor-pointer hover:bg-green-50 transition-colors" onClick={onNavigateToJournal}>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <CalendarCheck size={20} />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-800">{pendingTasks}</span>
                <p className="text-xs text-gray-500 font-medium uppercase mt-1">Attività {seasonFilter === 'Summer' ? 'Estive' : 'Invernali'}</p>
            </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-between h-32">
             <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2">
                <AlertTriangle size={20} />
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-800">{upcomingReminders.length}</span>
                <p className="text-xs text-gray-500 font-medium uppercase mt-1">Promemoria in scadenza</p>
            </div>
        </div>
      </div>

      {/* Seed Inventory Quick Access */}
      {activeGarden && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Banca dei Semi</h3>
                <p className="text-xs text-gray-500">Gestisci l'inventario dei tuoi semi</p>
              </div>
            </div>
            <button
              onClick={() => setShowSeedInventory(!showSeedInventory)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
            >
              {showSeedInventory ? 'Nascondi' : 'Apri'}
            </button>
          </div>
          {showSeedInventory && (
            <div className="mt-4">
              <SeedInventory garden={activeGarden} />
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Promemoria Urgente</h3>
        {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
                {upcomingReminders.map(task => (
                    <div key={task.id} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl">
                        <h4 className="font-bold text-gray-800">{task.plantName}</h4>
                        <p className="text-xs text-orange-600 mt-1 font-semibold">Scadenza: {new Date(task.nextDueDate!).toLocaleDateString('it-IT')}</p>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                <p className="text-green-700">Tutto sotto controllo! Nessuna scadenza imminente.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
