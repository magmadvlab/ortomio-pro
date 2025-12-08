
import React, { useState, useEffect } from 'react';
import { GardenTask, Garden } from '../types';
import { Sun, CloudRain, CalendarCheck, AlertTriangle, Settings, Save, Cloud, CloudLightning, Snowflake, CloudFog, Loader2, MapPin, Droplets, ThermometerSun, FlaskConical, Shovel, ChevronDown, Plus, Trash2, Home } from 'lucide-react';

interface DashboardProps {
  tasks: GardenTask[];
  onNavigateToJournal: () => void;
  gardens: Garden[];
  activeGardenId: string;
  onSelectGarden: (id: string) => void;
  onAddGarden: (g: Garden) => void;
  onUpdateGarden: (g: Garden) => void;
  onDeleteGarden: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    tasks, onNavigateToJournal, gardens, activeGardenId, 
    onSelectGarden, onAddGarden, onUpdateGarden, onDeleteGarden 
}) => {
  const activeGarden = gardens.find(g => g.id === activeGardenId);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  
  // Settings Form State
  const [tempName, setTempName] = useState('');
  const [tempSize, setTempSize] = useState('');
  const [tempPh, setTempPh] = useState('');
  const [tempType, setTempType] = useState<Garden['soilType'] | ''>('');
  
  // Garden Switcher State
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Weather State
  const [weather, setWeather] = useState<{ temp: number; code: number; rainForecastMm: number } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  
  const [seasonFilter, setSeasonFilter] = useState<'Summer' | 'Winter'>('Summer');

  // Initialize form when opening settings or creating new
  useEffect(() => {
      if (isCreatingNew) {
          setTempName('');
          setTempSize('');
          setTempPh('');
          setTempType('');
      } else if (activeGarden) {
          setTempName(activeGarden.name);
          setTempSize(activeGarden.sizeSqMeters.toString());
          setTempPh(activeGarden.soilPh?.toString() || '');
          setTempType(activeGarden.soilType || '');
      }
  }, [activeGarden, isEditingSettings, isCreatingNew]);

  // Determine season
  useEffect(() => {
      const month = new Date().getMonth() + 1;
      setSeasonFilter((month >= 4 && month <= 9) ? 'Summer' : 'Winter');
  }, []);

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
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=precipitation_sum,weathercode&timezone=auto`
            );
            const data = await response.json();
            if (data.current_weather && data.daily) {
                setWeather({
                    temp: data.current_weather.temperature,
                    code: data.current_weather.weathercode,
                    rainForecastMm: data.daily.precipitation_sum[0] || 0
                });
            }
        } catch (e) {
            console.error("Weather fetch failed", e);
            setWeatherError(true);
            // Se il fetch fallisce, prova con coordinate di default (Roma) come fallback
            if (lat !== 41.9028 || lng !== 12.4964) {
                console.warn("Tentativo con coordinate di default (Roma)");
                try {
                    const fallbackResponse = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=41.9028&longitude=12.4964&current_weather=true&daily=precipitation_sum,weathercode&timezone=auto`
                    );
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.current_weather && fallbackData.daily) {
                        setWeather({
                            temp: fallbackData.current_weather.temperature,
                            code: fallbackData.current_weather.weathercode,
                            rainForecastMm: fallbackData.daily.precipitation_sum[0] || 0
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
        fetchWeather(activeGarden.coordinates.latitude, activeGarden.coordinates.longitude);
    } else if (navigator.geolocation) {
        setWeatherLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Geolocalizzazione non disponibile, uso coordinate di default (Roma)", error);
                // Fallback a coordinate di default (Roma) per permettere il funzionamento anche senza geolocalizzazione
                fetchWeather(41.9028, 12.4964);
            },
            { timeout: 10000, enableHighAccuracy: false }
        );
    } else {
        console.warn("Geolocalizzazione non supportata, uso coordinate di default (Roma)");
        // Fallback a coordinate di default (Roma)
        fetchWeather(41.9028, 12.4964);
    }
  }, [activeGarden]);

  const handleSaveGarden = () => {
      const size = parseFloat(tempSize);
      const ph = parseFloat(tempPh);
      
      const gardenData = {
          name: tempName || 'Nuovo Orto',
          sizeSqMeters: !isNaN(size) && size > 0 ? size : 0,
          soilPh: !isNaN(ph) && ph > 0 && ph <= 14 ? ph : undefined,
          soilType: tempType || undefined
      };

      if (isCreatingNew) {
          // Attempt to get location for new garden
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                  onAddGarden({
                      id: crypto.randomUUID(),
                      createdAt: new Date().toISOString(),
                      ...gardenData,
                      coordinates: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
                  });
              }, () => {
                   // Fallback without location
                   onAddGarden({
                      id: crypto.randomUUID(),
                      createdAt: new Date().toISOString(),
                      ...gardenData
                  });
              });
          } else {
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

  const updateLocation = () => {
      if (!activeGarden || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
          onUpdateGarden({
              ...activeGarden,
              coordinates: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
          });
          alert("Posizione orto aggiornata con successo!");
      }, () => alert("Errore nel recupero della posizione."));
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
      if (rainMm >= 5) {
          return { status: "STOP IRRIGAZIONE", detail: `Previsti ${rainMm}mm di pioggia.`, colorClass: "bg-blue-100 border-blue-200 text-blue-900", icon: CloudRain };
      } else if (rainMm > 0 && rainMm < 5) {
          return { status: "RIDUCI AL 50%", detail: `Pioggia leggera (${rainMm}mm).`, colorClass: "bg-cyan-50 border-cyan-200 text-cyan-900", icon: Droplets };
      } else if (temp > 30) {
           return { status: "AUMENTA ACQUA", detail: `Caldo intenso (${temp}°C).`, colorClass: "bg-orange-100 border-orange-200 text-orange-900", icon: ThermometerSun };
      } else {
          return { status: "IRRIGAZIONE REGOLARE", detail: "Meteo stabile.", colorClass: "bg-green-50 border-green-200 text-green-900", icon: Droplets };
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
      {activeGarden && !isEditingSettings && (
          <div className="bg-green-50/50 p-4 rounded-xl border border-dashed border-green-200 flex flex-wrap gap-4 justify-between items-center text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-green-800 flex items-center gap-1"><Settings size={14}/> <b>{activeGarden.sizeSqMeters} m²</b></span>
                  {activeGarden.soilPh && <span className="text-green-800 flex items-center gap-1"><FlaskConical size={14}/> pH <b>{activeGarden.soilPh}</b></span>}
                  {activeGarden.soilType && <span className="text-green-800 flex items-center gap-1"><Shovel size={14}/> <b>{getSoilLabel(activeGarden.soilType)}</b></span>}
              </div>
          </div>
      )}

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

      {/* SEASON TOGGLE */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 flex gap-2 shadow-sm">
          <button onClick={() => setSeasonFilter('Summer')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${seasonFilter === 'Summer' ? 'bg-yellow-100 text-yellow-800 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Sun size={18}/> Orto Estivo
          </button>
          <button onClick={() => setSeasonFilter('Winter')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${seasonFilter === 'Winter' ? 'bg-blue-100 text-blue-800 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Snowflake size={18}/> Orto Invernale
          </button>
      </div>

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
