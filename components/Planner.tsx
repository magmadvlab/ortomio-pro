
import React, { useState, useEffect } from 'react';
import { getSeasonalSuggestions, getSpecificPlantDetails } from '../services/geminiService';
import { PlantSuggestion, GeoLocation, SpecificPlantInfo, Garden, GrowingLocation } from '../types';
import { MapPin, Loader2, PlusCircle, Search, Leaf, ArrowRight, Droplets, FlaskConical, Scale, Edit3, Sun, Thermometer, Layers, Clock, Info, CalendarPlus, Settings, Gauge, Sprout, AlertTriangle, CheckCircle, Calendar, Sparkles, Box, LayoutGrid, Flower2 } from 'lucide-react';

interface PlannerProps {
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling', date?: string, taskType?: any, additionalData?: any) => void;
  garden: Garden;
}

const parseMonthsFromText = (text: string | undefined): number[] => {
    if (!text) return [];
    const monthsIT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
    const shortMonthsIT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
    const lowerText = text.toLowerCase();
    const activeIndices: number[] = [];

    // Simple detection of month names
    monthsIT.forEach((m, i) => {
        if (lowerText.includes(m) || lowerText.includes(shortMonthsIT[i])) {
            activeIndices.push(i);
        }
    });

    // Simple range fill (if exactly 2 months found and implies range)
    if (activeIndices.length >= 2) {
         const min = Math.min(...activeIndices);
         const max = Math.max(...activeIndices);
         // Heuristic: if range is valid (e.g. Feb-Apr) and text implies range
         if (max - min < 6 && (lowerText.includes('-') || lowerText.includes(' a ') || lowerText.includes(' tra '))) {
             for(let k=min; k<=max; k++) {
                 if(!activeIndices.includes(k)) activeIndices.push(k);
             }
         }
    }
    return activeIndices;
};

const PlantCalendar: React.FC<{ sowing: string, transplant: string, harvest: string }> = ({ sowing, transplant, harvest }) => {
    const monthLabels = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
    const activeSowing = parseMonthsFromText(sowing);
    const activeTransplant = parseMonthsFromText(transplant);
    const activeHarvest = parseMonthsFromText(harvest);
    const currentMonth = new Date().getMonth();

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Calendar size={16}/> Calendario Colturale
            </h4>
            
            <div className="mb-1 grid grid-cols-12 gap-1">
                 {monthLabels.map((m, i) => (
                    <div key={i} className={`text-[10px] text-center font-bold ${i === currentMonth ? "text-green-600 underline scale-110" : "text-gray-400"}`}>
                        {m}
                    </div>
                ))}
            </div>

            <div className="space-y-1.5">
                {/* Sowing Row */}
                <div className="flex items-center gap-2">
                    <div className="grid grid-cols-12 gap-1 flex-1 h-2.5">
                        {monthLabels.map((_, i) => (
                            <div key={i} className={`rounded-sm ${activeSowing.includes(i) ? 'bg-orange-400' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>
                
                {/* Transplant Row */}
                <div className="flex items-center gap-2">
                     <div className="grid grid-cols-12 gap-1 flex-1 h-2.5">
                        {monthLabels.map((_, i) => (
                            <div key={i} className={`rounded-sm ${activeTransplant.includes(i) ? 'bg-green-500' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Harvest Row */}
                <div className="flex items-center gap-2">
                     <div className="grid grid-cols-12 gap-1 flex-1 h-2.5">
                        {monthLabels.map((_, i) => (
                            <div key={i} className={`rounded-sm ${activeHarvest.includes(i) ? 'bg-yellow-400' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-3 justify-center text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-2">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Semina</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Trapianto</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Raccolta</span>
            </div>
        </div>
    );
};

const Planner: React.FC<PlannerProps> = ({ onAddToJournal, garden }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Specific search state
  const [searchQuery, setSearchQuery] = useState('');
  const [specificResult, setSpecificResult] = useState<SpecificPlantInfo | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Custom Irrigation & Batches State
  const [customIrrigationFreq, setCustomIrrigationFreq] = useState('');
  const [customIrrigationMethod, setCustomIrrigationMethod] = useState('');
  
  // Succession & Fertilizer Settings
  const [numBatches, setNumBatches] = useState(1);
  const [batchInterval, setBatchInterval] = useState(14);
  const [createFertilizerTasks, setCreateFertilizerTasks] = useState(true);
  
  const [isIndoorSeed, setIsIndoorSeed] = useState(false);

  // Stats / Tracking Input
  const [plantingQuantity, setPlantingQuantity] = useState<number>(1);
  const [locationType, setLocationType] = useState<GrowingLocation>('Ground');

  useEffect(() => {
    if (specificResult) {
        setCustomIrrigationFreq(specificResult.irrigation.frequency);
        setCustomIrrigationMethod(specificResult.irrigation.method);
        setNumBatches(1);
        setIsIndoorSeed(false);
        setPlantingQuantity(1); // Reset
        setLocationType('Ground'); // Reset
        // Default interval to AI suggestion or 14 days
        setBatchInterval(specificResult.successionIntervalDays && specificResult.successionIntervalDays > 0 
            ? specificResult.successionIntervalDays 
            : 14);
    }
  }, [specificResult]);

  const handleGetSuggestions = async () => {
      // Use garden location if available, otherwise browser location
      setLoading(true);
      setError(null);
      let lat = garden.coordinates?.latitude;
      let lng = garden.coordinates?.longitude;

      const fetchSugg = async (l: number, ln: number) => {
           try {
              const results = await getSeasonalSuggestions(l, ln);
              if (results && results.length > 0) {
                setSuggestions(results);
              } else {
                setError("Nessun suggerimento disponibile per la tua posizione.");
              }
            } catch (err: any) {
              const errorMsg = err?.message || "Errore sconosciuto";
              if (errorMsg.includes("API Key")) {
                setError("Chiave API non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.");
              } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
                setError("Chiave API non valida. Verifica la configurazione in .env");
              } else {
                setError(`Errore durante il recupero dei suggerimenti: ${errorMsg}`);
              }
            } finally {
              setLoading(false);
            }
      }

      if (lat && lng) {
          fetchSugg(lat, lng);
      } else if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(
            async (position) => {
                fetchSugg(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                setLoading(false);
                // Fallback a coordinate di default (Roma)
                console.warn("Geolocalizzazione non disponibile, uso coordinate di default (Roma)");
                fetchSugg(41.9028, 12.4964);
            },
            { timeout: 10000, enableHighAccuracy: false }
           );
      } else {
           // Fallback a coordinate di default (Roma)
           console.warn("Geolocalizzazione non supportata, uso coordinate di default (Roma)");
           fetchSugg(41.9028, 12.4964);
      }
  }

  const handleSpecificSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    let lat = garden.coordinates?.latitude || 41.9028; // Default Rome if no location
    let lng = garden.coordinates?.longitude || 12.4964;

    setSearchLoading(true);
    setSpecificResult(null);
    setError(null);
    try {
        const result = await getSpecificPlantDetails(searchQuery, lat, lng);
        if (result) {
          setSpecificResult(result);
        } else {
          setError("Nessun risultato trovato per questa ricerca. Prova con un nome diverso.");
        }
    } catch (e: any) {
        console.error(e);
        const errorMsg = e?.message || "Errore sconosciuto";
        if (errorMsg.includes("API Key")) {
          setError("Chiave API non configurata. Configura VITE_GEMINI_API_KEY nel file .env per utilizzare questa funzionalità.");
        } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
          setError("Chiave API non valida. Verifica la configurazione in .env");
        } else {
          setError(`Errore nella ricerca: ${errorMsg}`);
        }
    } finally {
        setSearchLoading(false);
    }
  };

  const calculateTotalFertilizer = (gm2: number) => {
      if (!garden?.sizeSqMeters) return null;
      const totalGrams = gm2 * garden.sizeSqMeters;
      return totalGrams >= 1000 ? `${(totalGrams / 1000).toFixed(1)} kg` : `${totalGrams} g`;
  };

  const getFertilizerRecommendation = () => {
      if (!garden?.soilType) return null;
      const type = garden.soilType;
      
      if (['Sandy', 'Clay', 'Chalky'].includes(type)) {
          return {
              type: 'Organic',
              label: 'Consigliato: Organico',
              reason: type === 'Sandy' ? "Migliora la ritenzione idrica." : type === 'Clay' ? "Migliora il drenaggio e la struttura." : "Bilancia il suolo calcareo."
          };
      } else if (type === 'Peaty') {
          return {
              type: 'Classic',
              label: 'Consigliato: Minerale',
              reason: "Il suolo organico può beneficiare di un bilanciamento minerale mirato."
          };
      }
      return { type: 'Organic', label: 'Consigliato: Organico', reason: "Nutre la pianta e migliora la vita del suolo." };
  };

  const getSoilAnalysis = () => {
      if (!specificResult?.soil) return null;
      
      const { phMin, phMax, typeDescription } = specificResult.soil;
      const userPh = garden?.soilPh;
      const userType = garden?.soilType;

      const analysis = {
          hasData: false,
          phStatus: 'unknown' as 'unknown' | 'good' | 'low' | 'high',
          phMsg: '',
          phAdvice: '',
          typeMsg: ''
      };

      if (userPh) {
          analysis.hasData = true;
          if (userPh >= phMin && userPh <= phMax) {
              analysis.phStatus = 'good';
              analysis.phMsg = `pH Perfetto (${userPh})`;
          } else if (userPh < phMin) {
              analysis.phStatus = 'low';
              analysis.phMsg = `pH Acido (${userPh})`;
              analysis.phAdvice = `Per alzare il pH verso ${phMin}, incorpora calce agricola o cenere di legna.`;
          } else {
              analysis.phStatus = 'high';
              analysis.phMsg = `pH Basico (${userPh})`;
              analysis.phAdvice = `Per abbassare il pH verso ${phMax}, usa zolfo, torba acida o aghi di pino.`;
          }
      }

      if (userType) {
          analysis.hasData = true;
          const typeMap: Record<string, string> = {
              'Clay': 'Argilloso', 'Sandy': 'Sabbioso', 'Loamy': 'Franco', 
              'Peaty': 'Torba', 'Chalky': 'Calcareo', 'Silty': 'Limoso'
          };
          const userTypeIT = typeMap[userType] || userType;
          
          let advice = "";
          const descLower = typeDescription.toLowerCase();
          
          if (userType === 'Clay') {
              if (descLower.includes('drenante') || descLower.includes('sciolto') || descLower.includes('sabbioso')) {
                   advice = "Terreno pesante. Aggiungi sabbia e compost per evitare ristagni.";
              }
          } else if (userType === 'Sandy') {
              if (descLower.includes('umido') || descLower.includes('ritenzione')) {
                  advice = "Terreno leggero. Aggiungi materia organica (humus/compost) per trattenere l'acqua.";
              }
          } else if (userType === 'Chalky') {
             if (descLower.includes('acido')) {
                 advice = "Terreno calcareo. Evita piante acidofile o coltiva in vaso con terriccio specifico.";
             }
          }
          
          analysis.typeMsg = `Suolo ${userTypeIT}. ${advice}`;
      }

      return analysis;
  };

  // Unified function to add plant(s)
  const handlePlanPlanting = (method: 'Seed' | 'Seedling') => {
      if (!specificResult) return;
      const today = new Date();
      const soilAnalysis = getSoilAnalysis();
      const soilNote = soilAnalysis?.hasData ? `\n🌍 Suolo: ${soilAnalysis.phMsg}. ${soilAnalysis.typeMsg}` : '';

      // Create Batches
      for (let i = 0; i < numBatches; i++) {
          const plantingDate = new Date(today);
          plantingDate.setDate(today.getDate() + (i * batchInterval));
          const dateStr = plantingDate.toISOString().split('T')[0];

          const batchNote = numBatches > 1 ? ` (Lotto ${i + 1}/${numBatches})` : '';
          
          let notes = `Metodo: ${method === 'Seed' ? 'Seme' : 'Trapianto'}${isIndoorSeed ? ' (Indoor)' : ''}.${batchNote}\nIrrigazione: ${customIrrigationFreq}.\nConcime Base: ${specificResult.fertilizer.organicType} (${specificResult.fertilizer.organicDosageGm2}g/mq).${soilNote}`;
          
          if (isIndoorSeed && specificResult.indoor && method === 'Seed') {
              notes += `\n💡 Luce: ${specificResult.indoor.lightHours}h, Temp: ${specificResult.indoor.germinationTemp}.`;
          }
          
          const harvestData = {
              minBrix: specificResult.harvest.minBrix,
              visualSigns: specificResult.harvest.visualSigns
          };
          notes += `\n🧺 Raccolta: ${specificResult.harvest.visualSigns}.` + (specificResult.harvest.minBrix ? ` Brix ideale: >${specificResult.harvest.minBrix}°` : '');

          const plantingStats = {
              initialQuantity: plantingQuantity,
              currentQuantity: plantingQuantity, // Assume all alive at start
              locationType: locationType
          };

          // Add Main Task
          onAddToJournal(
              specificResult.name, 
              notes, 
              specificResult.variety, 
              method, 
              dateStr,
              method === 'Seed' ? 'Sowing' : 'Transplant',
              { ...harvestData, ...plantingStats } // Merge harvest and stats info
          );

          // Add Fertilizer Reminders if enabled
          if (createFertilizerTasks && specificResult.fertilizer.scheduleDays) {
              specificResult.fertilizer.scheduleDays.forEach(daysOffset => {
                   const fertDate = new Date(plantingDate);
                   fertDate.setDate(plantingDate.getDate() + daysOffset);
                   const fertDateStr = fertDate.toISOString().split('T')[0];
                   
                   const fertNote = `Richiamo concimazione per ${specificResult.name} (Lotto ${i + 1}).\nUsa: ${specificResult.fertilizer.classicType} o simile.`;
                   
                   onAddToJournal(
                       specificResult.name,
                       fertNote,
                       specificResult.variety,
                       undefined,
                       fertDateStr,
                       'Fertilize'
                   );
              });
          }
      }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const soilAnalysis = getSoilAnalysis();
  const fertRecommendation = getFertilizerRecommendation();

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-green-800">Cosa vuoi coltivare?</h1>
        <p className="text-green-600">Pianifica per: <b>{garden.name}</b></p>
      </header>

      {/* SEARCH SECTION - PRIMARY */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Search size={20} className="text-green-600"/>
            Cerca Specie o Varietà
        </h2>
        <form onSubmit={handleSpecificSearch} className="relative">
            <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Es. Pomodoro Datterino, Lattuga..."
                className="w-full p-4 pr-12 rounded-xl border-2 border-green-100 focus:border-green-500 focus:ring-0 outline-none text-lg transition-all"
            />
            <button 
                type="submit"
                disabled={searchLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 p-2.5 rounded-lg text-white hover:bg-green-700 shadow-md transition-all"
            >
                {searchLoading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
            </button>
        </form>

        {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-600"/>
                    {error}
                </p>
            </div>
        )}

        {!garden.coordinates && (
             <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                <MapPin size={12}/> Configura la posizione dell'orto per date più precise.
             </p>
        )}

        {specificResult && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 mb-4">
                    <h3 className="font-bold text-xl text-green-900">{specificResult.name}</h3>
                    <p className="text-green-700 font-medium italic">Varietà: {specificResult.variety}</p>
                    <p className="text-sm text-gray-600 mt-2 bg-white p-3 rounded-lg border border-green-50">{specificResult.notes}</p>
                </div>

                {/* VISUAL CALENDAR */}
                <PlantCalendar 
                    sowing={specificResult.seedSowingWindow} 
                    transplant={specificResult.transplantWindow} 
                    harvest={specificResult.harvestWindow} 
                />
                
                {/* ADVANCED SOIL ANALYSIS */}
                {soilAnalysis && (soilAnalysis.hasData || specificResult.soil) && (
                    <div className={`mb-6 p-5 rounded-xl border-2 ${soilAnalysis.phStatus === 'good' ? 'bg-white border-green-100' : 'bg-white border-yellow-100'}`}>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm uppercase">
                            <FlaskConical size={18} className="text-purple-600"/> Analisi Compatibilità Suolo
                        </h4>
                        
                        <div className="space-y-4">
                             <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                 <span className="font-bold">Richiesto:</span> pH {specificResult.soil.phMin}-{specificResult.soil.phMax}. {specificResult.soil.typeDescription}
                             </div>

                             {soilAnalysis.hasData ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1.5 rounded-full ${soilAnalysis.phStatus === 'good' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {soilAnalysis.phStatus === 'good' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${soilAnalysis.phStatus === 'good' ? 'text-green-800' : 'text-red-800'}`}>
                                                {soilAnalysis.phMsg}
                                            </p>
                                            {soilAnalysis.phAdvice && (
                                                <p className="text-xs text-gray-600 mt-1 bg-yellow-50 p-2 rounded border border-yellow-100">
                                                    💡 <b>Correzione:</b> {soilAnalysis.phAdvice}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {garden?.soilType && (
                                        <div className="flex items-start gap-3 border-t border-gray-100 pt-3">
                                            <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
                                                <Layers size={16}/>
                                            </div>
                                            <div>
                                                 <p className="text-sm text-gray-700">{soilAnalysis.typeMsg}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             ) : (
                                 <p className="text-xs text-gray-500 italic flex items-center gap-1">
                                     <Info size={12}/> Configura il pH e il tipo di terra nella Dashboard per un'analisi dettagliata.
                                 </p>
                             )}
                        </div>
                    </div>
                )}

                {/* Technical Data: Irrigation & Fertilizer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3 text-sm uppercase justify-between">
                            <span className="flex items-center gap-2"><Droplets size={16} /> Piano Irrigazione</span>
                            <Edit3 size={14} className="opacity-50" />
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-blue-700 mb-1">Frequenza</label>
                                <input 
                                    type="text"
                                    value={customIrrigationFreq}
                                    onChange={(e) => setCustomIrrigationFreq(e.target.value)}
                                    className="w-full text-sm p-2 rounded-lg border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    placeholder="Es. Ogni 2 giorni"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-700 mb-1">Metodo</label>
                                <input 
                                    type="text"
                                    value={customIrrigationMethod}
                                    onChange={(e) => setCustomIrrigationMethod(e.target.value)}
                                    className="w-full text-sm p-2 rounded-lg border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    placeholder="Es. A goccia"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 relative overflow-hidden">
                        <h4 className="flex items-center gap-2 font-bold text-purple-800 mb-3 text-sm uppercase">
                            <FlaskConical size={16} /> Nutrizione
                        </h4>
                        
                        {fertRecommendation && garden?.soilType && (
                            <div className="mb-3 bg-white/60 p-2 rounded-lg border border-purple-100 flex items-start gap-2">
                                <Sparkles size={14} className="text-purple-600 mt-0.5 shrink-0"/>
                                <div className="text-xs">
                                    <span className="font-bold text-purple-800 block">{fertRecommendation.label}</span>
                                    <span className="text-purple-700 leading-tight">{fertRecommendation.reason}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 text-sm">
                            <div className={`p-2 rounded-lg transition-colors ${fertRecommendation?.type === 'Organic' ? 'bg-white shadow-sm border border-purple-200' : 'opacity-80'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-purple-900 text-xs uppercase mb-0.5">Organico (Bio)</p>
                                        <p className="font-medium text-purple-950 leading-tight">{specificResult.fertilizer.organicType}</p>
                                    </div>
                                    {fertRecommendation?.type === 'Organic' && garden?.soilType && <CheckCircle size={16} className="text-purple-600 shrink-0"/>}
                                </div>
                                <div className="flex items-center gap-2 text-purple-700 mt-2 text-xs">
                                    <Scale size={14} className="shrink-0" />
                                    <span>{specificResult.fertilizer.organicDosageGm2} g/m²</span>
                                    {garden?.sizeSqMeters && (
                                        <span className="font-bold bg-purple-100 px-2 py-0.5 rounded text-purple-800 ml-auto">
                                            Tot: {calculateTotalFertilizer(specificResult.fertilizer.organicDosageGm2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`p-2 rounded-lg transition-colors ${fertRecommendation?.type === 'Classic' ? 'bg-white shadow-sm border border-purple-200' : 'opacity-80'}`}>
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-purple-900 text-xs uppercase mb-0.5">Minerale (Classico)</p>
                                        <p className="font-medium text-purple-950 leading-tight">{specificResult.fertilizer.classicType}</p>
                                    </div>
                                     {fertRecommendation?.type === 'Classic' && garden?.soilType && <CheckCircle size={16} className="text-purple-600 shrink-0"/>}
                                </div>
                                <div className="flex items-center gap-2 text-purple-700 mt-2 text-xs">
                                    <Scale size={14} className="shrink-0" />
                                    <span>{specificResult.fertilizer.classicDosageGm2} g/m²</span>
                                    {garden?.sizeSqMeters && (
                                        <span className="font-bold bg-purple-100 px-2 py-0.5 rounded text-purple-800 ml-auto">
                                            Tot: {calculateTotalFertilizer(specificResult.fertilizer.classicDosageGm2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {specificResult.fertilizer.scheduleDays && specificResult.fertilizer.scheduleDays.length > 0 && (
                                 <div className="pt-2 border-t border-purple-200 mt-1">
                                    <p className="text-xs text-purple-800 font-bold mb-1 flex items-center gap-1">
                                        <Clock size={12}/> Programma Concimazione:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {specificResult.fertilizer.scheduleDays.map(d => (
                                            <span key={d} className="bg-white text-purple-800 text-[10px] px-1.5 py-0.5 rounded border border-purple-200 shadow-sm font-mono">
                                                +{d} gg
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Advanced Settings: Succession & Reminders */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                     <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase flex items-center gap-2">
                        <Settings size={16}/> Opzioni Avanzate
                     </h4>

                     {/* Quantity and Location (New) */}
                     <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div>
                             <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
                                <Sprout size={14}/> QUANTE PIANTE?
                             </label>
                             <input 
                                type="number" 
                                min="1" 
                                value={plantingQuantity}
                                onChange={(e) => setPlantingQuantity(parseInt(e.target.value) || 1)}
                                className="w-full p-2 rounded-lg border border-gray-300 font-bold text-gray-800 text-center"
                             />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
                                <MapPin size={14}/> DOVE?
                             </label>
                             <div className="flex gap-2">
                                 <button 
                                    onClick={() => setLocationType('Pot')}
                                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'Pot' ? 'bg-orange-100 border-orange-400 text-orange-800' : 'bg-white border-gray-300'}`}
                                    title="Vaso"
                                 >
                                     <Box size={18}/>
                                 </button>
                                 <button 
                                    onClick={() => setLocationType('Ground')}
                                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'Ground' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-gray-300'}`}
                                    title="Piena Terra"
                                 >
                                     <Flower2 size={18}/>
                                 </button>
                                 <button 
                                    onClick={() => setLocationType('RaisedBed')}
                                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'RaisedBed' ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-gray-300'}`}
                                    title="Letto/Cassone"
                                 >
                                     <LayoutGrid size={18}/>
                                 </button>
                             </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                                    <Layers size={14}/> SCAGLIONAMENTO (Lotti)
                                </label>
                                {numBatches > 1 && <span className="text-xs text-green-600 font-bold">{numBatches} lotti</span>}
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="6" 
                                        step="1"
                                        value={numBatches}
                                        onChange={(e) => setNumBatches(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                                    />
                                    <span className="font-bold text-gray-800 text-sm w-4">{numBatches}</span>
                                </div>
                                
                                {numBatches > 1 && (
                                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <span>Intervallo:</span>
                                            <input 
                                                type="number" 
                                                min="7"
                                                max="90"
                                                value={batchInterval}
                                                onChange={(e) => setBatchInterval(parseInt(e.target.value) || 14)}
                                                className="w-10 text-center font-bold border-b border-gray-300 focus:border-green-500 outline-none"
                                            />
                                            <span>gg</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            Fine: {(() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + ((numBatches - 1) * batchInterval));
                                                return d.toLocaleDateString('it-IT', {day: 'numeric', month: 'short'});
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                             <div 
                                onClick={() => setCreateFertilizerTasks(!createFertilizerTasks)}
                                className={`flex-1 p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${createFertilizerTasks ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'}`}
                             >
                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${createFertilizerTasks ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                                    {createFertilizerTasks && <CalendarPlus size={14} className="text-white"/>}
                                </div>
                                <div>
                                    <span className={`block text-xs font-bold ${createFertilizerTasks ? 'text-purple-900' : 'text-gray-500'}`}>Promemoria Concime</span>
                                    <span className="text-[10px] text-gray-500 leading-tight block">Crea attività future nel diario</span>
                                </div>
                             </div>
                        </div>
                     </div>
                </div>

                <div className="flex gap-2 mb-4 bg-orange-50 p-2 rounded text-xs text-orange-800 border border-orange-100">
                    <Gauge size={16} />
                    <span><b>Raccolta:</b> {specificResult.harvest.visualSigns} {specificResult.harvest.minBrix ? `(Ideal >${specificResult.harvest.minBrix}° Brix)` : ''}</span>
                </div>

                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Scegli come iniziare:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-orange-700">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-lg">🌰</span>
                                </div>
                                <span className="font-bold">Dal Seme</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3 text-sm">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isIndoorSeed} 
                                        onChange={() => setIsIndoorSeed(!isIndoorSeed)}
                                        className="rounded text-orange-600 focus:ring-orange-500" 
                                    />
                                    <span className="text-gray-700 font-medium">Indoor / Semenzaio</span>
                                </label>
                            </div>

                            {isIndoorSeed && specificResult.indoor && (
                                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-3 text-xs space-y-2">
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <Sun size={14}/> <span>Luce: <b>{specificResult.indoor.lightHours}h</b>/giorno</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <Thermometer size={14}/> <span>Temp: <b>{specificResult.indoor.germinationTemp}</b></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-orange-800">
                                        <Clock size={14}/> <span>Trapianto tra: <b>{specificResult.indoor.transplantSize}</b></span>
                                    </div>
                                </div>
                            )}

                            {!isIndoorSeed && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-400 uppercase">Periodo Semina</p>
                                    <p className="font-medium text-gray-800">{specificResult.seedSowingWindow}</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => handlePlanPlanting('Seed')}
                            className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 shadow-md mt-2"
                        >
                            {numBatches > 1 ? `Pianifica ${numBatches} Semine` : 'Pianifica Semina'}
                        </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border-2 border-green-100 hover:border-green-300 transition-all shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-green-700">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Leaf size={18} />
                                </div>
                                <span className="font-bold">Dalla Piantina</span>
                            </div>
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 uppercase">Periodo Trapianto</p>
                                <p className="font-medium text-gray-800">{specificResult.transplantWindow}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handlePlanPlanting('Seedling')}
                            className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-md mt-2"
                        >
                             {numBatches > 1 ? `Pianifica ${numBatches} Trapianti` : 'Pianifica Trapianto'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {!suggestions.length && !loading && (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-blue-900">Suggerimenti Locali</h3>
            <p className="text-sm text-blue-700">Scopri cosa piantare ora nel tuo orto.</p>
          </div>
          <button
            onClick={handleGetSuggestions}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-105"
          >
            <MapPin size={24} />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={32} className="text-green-600 animate-spin mb-2" />
          <p className="text-gray-500 text-sm">Analisi meteo in corso...</p>
        </div>
      )}

      {suggestions.length > 0 && !loading && (
        <div className="pt-4">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Suggeriti per Oggi</h2>
                    <p className="text-sm text-gray-500">Ideali per il clima attuale.</p>
                </div>
                <button onClick={handleGetSuggestions} className="text-xs text-green-600 font-medium hover:bg-green-50 px-2 py-1 rounded">
                    Aggiorna
                </button>
            </div>
            
            <div className="grid gap-4">
                {suggestions.map((plant, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">{plant.name}</h3>
                                <p className="text-xs text-gray-500 italic">{plant.scientificName}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-bold 
                            ${plant.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                                plant.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {plant.difficulty === 'Easy' ? 'Facile' : plant.difficulty === 'Medium' ? 'Media' : 'Difficile'}
                            </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{plant.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Finestra Semina</span>
                                <span className="text-sm font-semibold text-gray-700">{plant.plantingWindow}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Raccolta</span>
                                <span className="text-sm font-semibold text-gray-700">{plant.harvestTime}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => onAddToJournal(plant.name, `Suggerito per: ${plant.plantingWindow}`, '', 'Seed', todayStr, 'Sowing', undefined)}
                            className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-bold text-sm hover:bg-green-100 flex items-center justify-center gap-2"
                        >
                            <PlusCircle size={16} />
                            Aggiungi al Diario
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
