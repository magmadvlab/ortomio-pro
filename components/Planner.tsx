
import React, { useState, useEffect } from 'react';
import { getSeasonalSuggestions, getSpecificPlantDetails, isApiKeyConfigured, checkApiAvailableAsync } from '../services/geminiService';
import { PlantSuggestion, GeoLocation, SpecificPlantInfo, Garden, GrowingLocation } from '../types';
import { MapPin, Loader2, PlusCircle, Search, Leaf, ArrowRight, Droplets, FlaskConical, Scale, Edit3, Sun, Thermometer, Layers, Clock, Info, CalendarPlus, Settings, Gauge, Sprout, AlertTriangle, CheckCircle, Calendar, Sparkles, Box, LayoutGrid, Flower2, Package, Map as MapIcon, Bot, TrendingUp, Camera } from 'lucide-react';
import { getCurrentPositionWithRetry, getDefaultCoordinates } from '../services/geolocationService';
import { findSeedsForPlant, getExpiringSeeds } from '@/services/seedInventoryService';
import { calculateMoonPhase, getMoonPhaseName, isIdealPhaseFor } from '../logic/lunarCalendar';
import { getSuggestedBatches, calculateStaggeredPlanting } from '../logic/staggeredPlantingEngine';
import { getAllMasterSheets, getMasterSheetSync } from '../services/plantMasterService';
import { getAllSpecializedMasterSheets, getMasterSheetsByCropType } from '../data/specializedCropMasterSheets';
import { checkPHCompatibility } from '../logic/soilPHEngine';
import PHCompatibilityChecker from './PHCompatibilityChecker';
import FertigationPlanner from './FertigationPlanner';
import VisualGardenPlanner from './VisualGardenPlanner';
import SpecializedCropForm, { SpecializedCropType } from './SpecializedCropForm';
import CustomCropForm from './CustomCropForm';
import PlantingWizard from './PlantingWizard';
import { useTier } from '../packages/core/hooks/useTier';
import { PlantSuggestionForWindow } from '../services/seasonalPlantSuggestions';
import { GardenClassification } from '../services/seasonalSunWindows';
import { PlantingWindow, adjustForPlantingMethod } from '../services/plantingWindowOptimizer';
import { getDailyGardenPlan } from '../logic/director';
import { DailyPlan } from '../types';
import { PlantLifecycleTimeline, parseMonthsFromText as parseMonthsFromTextNew } from './planner/PlantLifecycleTimeline'
import { CompanionPlants } from './planner/CompanionPlants'
import { DailyTip } from './planner/DailyTip'
import { PlantExpectations } from './planner/PlantExpectations'
import { PopularPlantsTags } from './planner/PopularPlantsTags'
import { SimplifiedPlantingForm } from './planner/SimplifiedPlantingForm'
import { AccessoriesSuggestionsSection } from './planner/AccessoriesSuggestionsSection';
import { getMasterSheet } from '../services/plantMasterService';
import GeographicFeasibilityCard from './planner/GeographicFeasibilityCard';
import VarietySelector from './planner/VarietySelector';
import CultivationSystemSelector from './planner/CultivationSystemSelector';
import { calculateFeasibility, getUserLocationProfile } from '../services/geographicMatchingService';
import { ExoticFruitCrop } from '../types/exoticFruit';
import { GardenBed } from '../types/gardenBed';
import { useStorage } from '../packages/core/hooks/useStorage';
import { calculateBedSpace } from '../logic/spaceCalculator';
// AI Integration
import AIPlanningWizard from './ai/AIPlanningWizard';
import PlanPreviewModal from './ai/PlanPreviewModal';
import AIActionButton from './ai/AIActionButton';
import PlannerAIChat from './planner/PlannerAIChat';
import { ScalingPlan } from '../services/aiPlanningService';

interface PlannerProps {
  onAddToJournal: (plantName: string, notes: string, variety?: string, method?: 'Seed' | 'Seedling' | 'Sapling', date?: string, taskType?: any, additionalData?: any) => void;
  garden: Garden;
  tasks?: any[]; // Per il Visual Planner
  onUpdateTask?: (task: any) => void; // Per il Visual Planner
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
         // Heuristic: if range is valid (es. Feb-Apr) and text implies range
         if (max - min < 6 && (lowerText.includes('-') || lowerText.includes(' a ') || lowerText.includes(' tra '))) {
             for(let k=min; k<=max; k++) {
                 if(!activeIndices.includes(k)) activeIndices.push(k);
             }
         }
    }
    return activeIndices;
};

const PlantCalendar: React.FC<{ sowing: string, transplant: string, harvest: string }> = ({ sowing, transplant, harvest }) => {
  // Scroll orizzontale su mobile
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    setCurrentMonth(new Date().getMonth());
  }, []);
  
  const monthLabels = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
  const activeSowing = parseMonthsFromText(sowing);
  const activeTransplant = parseMonthsFromText(transplant);
  const activeHarvest = parseMonthsFromText(harvest);
  
  if (!mounted) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-3 text-sm uppercase tracking-wider">
          <Calendar size={16}/> Calendario Colturale
        </h4>
        <div className="h-32 flex items-center justify-center text-gray-400">
          Caricamento...
        </div>
      </div>
    );
  }

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-3 text-sm uppercase tracking-wider">
                <Calendar size={16}/> Calendario Colturale
            </h4>
            
            <div className="mb-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                 {monthLabels.map((m, i) => (
                    <div key={i} className={`text-[10px] text-center font-bold ${i === currentMonth ? "text-green-600 underline scale-110" : "text-gray-400"}`}>
                        {m}
                    </div>
                ))}
            </div>

            <div className="space-y-1.5">
                {/* Sowing Row */}
                <div className="flex items-center gap-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 h-2.5">
                        {monthLabels.map((_, i) => (
                            <div key={i} className={`rounded-sm ${activeSowing.includes(i) ? 'bg-orange-400' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>
                
                {/* Transplant Row */}
                <div className="flex items-center gap-3">
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 h-2.5">
                        {monthLabels.map((_, i) => (
                            <div key={i} className={`rounded-sm ${activeTransplant.includes(i) ? 'bg-green-500' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Harvest Row */}
                <div className="flex items-center gap-3">
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 h-2.5">
                        {monthLabels.map((_, i) => (
                            <div key={i} className={`rounded-sm ${activeHarvest.includes(i) ? 'bg-yellow-400' : 'bg-gray-100'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-3 justify-center text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-2">
                <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Semina</span>
                <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500"></div> Trapianto</span>
                <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-yellow-full max-w-sm"></div> Raccolta</span>
            </div>
        </div>
    );
};

const Planner: React.FC<PlannerProps> = ({ onAddToJournal, garden, tasks = [], onUpdateTask }) => {
  const { isPro, checkLimit, limit } = useTier();
  const [showVisualPlanner, setShowVisualPlanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlantSuggestion[]>([]);
  const [seasonalPlantSuggestions, setSeasonalPlantSuggestions] = useState<PlantSuggestionForWindow[]>([]);
  const [gardenClassification, setGardenClassification] = useState<GardenClassification | null>(null);
  const [loadingSeasonalSuggestions, setLoadingSeasonalSuggestions] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<Record<number, 'Seed' | 'Seedling'>>({});
  const [error, setError] = useState<string | null>(null);
  
  // AI Chat state - inizializzato come chiuso ma con pulsante visibile
  const [showAIChat, setShowAIChat] = useState(false);
  
  // Director - Piano Giornaliero Intelligente
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loadingDailyPlan, setLoadingDailyPlan] = useState(false);
  
  // Verifica limiti task per Free
  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const tasksLimit = checkLimit('maxTasksPerGarden', activeTasksCount);
  
  // Specific search state
  const [searchQuery, setSearchQuery] = useState('');
  const [specificResult, setSpecificResult] = useState<SpecificPlantInfo | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPopularPlant, setSelectedPopularPlant] = useState<string | null>(null);
  
  // Planting method state - simplified
  const [plantingMethod, setPlantingMethod] = useState<'now' | 'transplant' | 'later'>('now');
  const [plantingDate, setPlantingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(12);
  
  // Specialized crops state
  const [selectedCropCategory, setSelectedCropCategory] = useState<'all' | SpecializedCropType>('all');
  const [selectedSpecializedCrop, setSelectedSpecializedCrop] = useState<any>(null);
  const [showCustomCropForm, setShowCustomCropForm] = useState(false);
  
  // Planting Wizard state
  const [showPlantingWizard, setShowPlantingWizard] = useState(false);
  const [wizardPlantData, setWizardPlantData] = useState<{
    plantName: string;
    plantNotes?: string;
    variety?: string;
  } | null>(null);

  // Custom Irrigation & Batches State
  const [customIrrigationFreq, setCustomIrrigationFreq] = useState('');
  const [customIrrigationMethod, setCustomIrrigationMethod] = useState('');
  
  /**
   * SEMINA SCAGLIONATA - Pianificazione Multi-Lotto
   * 
   * Permette di pianificare più semine della stessa pianta a intervalli regolari
   * per avere raccolti distribuiti nel tempo invece di un unico raccolto concentrato.
   * 
   * PARAMETRI:
   * - numBatches: Numero di lotti da piantare (es. 3 lotti = 3 semine separate)
   * - batchInterval: Giorni tra un lotto e il successivo (es. 14 giorni)
   * 
   * BENEFICI:
   * - Raccolti distribuiti: invece di raccogliere tutto insieme, raccogli a scaglioni
   * - Riduce sprechi: evita sovrapproduzione in un singolo momento
   * - Estende stagione: prolunga il periodo di disponibilità del prodotto
   * 
   * ESEMPIO: 3 lotti di pomodori ogni 14 giorni = raccolto da luglio a settembre
   */
  const [numBatches, setNumBatches] = useState(1);
  const [batchInterval, setBatchInterval] = useState(14);
  const [createFertilizerTasks, setCreateFertilizerTasks] = useState(true);
  
  const [isIndoorSeed, setIsIndoorSeed] = useState(false);

  // Stats / Tracking Input
  const [plantingQuantity, setPlantingQuantity] = useState<number>(1);
  const [locationType, setLocationType] = useState<GrowingLocation>('Ground');
  
  // Geographic matching state
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; usdaZone?: string; city?: string; region?: string } | null>(null);
  const [feasibilityResult, setFeasibilityResult] = useState<any>(null);
  const [selectedVariety, setSelectedVariety] = useState<any>(null);
  const [selectedCultivationSystem, setSelectedCultivationSystem] = useState<'openField' | 'container' | 'greenhouse' | undefined>(undefined);
  
  // Garden beds state
  const { storageProvider } = useStorage();
  const [beds, setBeds] = useState<GardenBed[]>([]);
  const [selectedBedId, setSelectedBedId] = useState<string | undefined>(undefined);
  const [bedSpaceCalculations, setBedSpaceCalculations] = useState<Record<string, any>>({});
  const [selectedVisualCategory, setSelectedVisualCategory] = useState<'all' | 'Orto' | 'Frutteto' | 'Esotici' | 'Aromatiche'>('all');

  // AI Planning state
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ScalingPlan | null>(null);

  // Load user location on mount
  useEffect(() => {
    const loadUserLocation = async () => {
      const location = await getUserLocationProfile();
      if (location) {
        setUserLocation({
          lat: location.lat,
          lon: location.lon,
          usdaZone: location.usdaZone,
          city: location.city,
          region: location.region,
        });
      }
    };
    loadUserLocation();
  }, []);

  // Load garden beds
  useEffect(() => {
    const loadBeds = async () => {
      try {
        const gardenBeds = await storageProvider.getGardenBeds(garden.id);
        setBeds(gardenBeds);
        
        // Calculate space for each bed
        if (tasks.length > 0) {
          const masterSheets: Map<string, any> = new Map<string, any>();
          tasks.forEach(task => {
            if (task.plantName) {
              const master = getMasterSheetSync(task.plantName);
              if (master) {
                masterSheets.set(task.plantName.toLowerCase(), master);
              }
            }
          });
          
          const calculations: Record<string, any> = {};
          gardenBeds.forEach(bed => {
            calculations[bed.id] = calculateBedSpace(bed, tasks, masterSheets);
          });
          setBedSpaceCalculations(calculations);
        }
      } catch (error) {
        console.error('Error loading beds:', error);
      }
    };
    loadBeds();
  }, [garden.id, tasks]);

  useEffect(() => {
    if (specificResult) {
        setCustomIrrigationFreq(specificResult.irrigation.frequency);
        setCustomIrrigationMethod(specificResult.irrigation.method);
        setIsIndoorSeed(false);
        setPlantingQuantity(1); // Reset
        setLocationType('Ground'); // Reset
        setSelectedVariety(null);
        setSelectedCultivationSystem(undefined);
        setSelectedBedId(undefined); // Reset bed selection
        
        // Calculate optimal staggered planting
        const masterSheets = getAllMasterSheets();
        const masterSheet = masterSheets.find(p => 
          p.commonName.toUpperCase() === specificResult.name.toUpperCase()
        );
        
        if (masterSheet) {
          const suggested = getSuggestedBatches(masterSheet);
          setNumBatches(suggested.batches);
          setBatchInterval(suggested.interval);
          
          // Calculate feasibility for exotic fruits
          if (masterSheet.cropType === 'ExoticFruit' && userLocation) {
            const exoticCrop = masterSheet as unknown as ExoticFruitCrop;
            if (exoticCrop.climateCompatibility) {
              const feasibility = calculateFeasibility(exoticCrop, userLocation);
              setFeasibilityResult(feasibility);
              setSelectedCultivationSystem(feasibility.recommendedSystem);
              if (feasibility.recommendedVariety && exoticCrop.varieties) {
                const variety = exoticCrop.varieties.find(v => v.name === feasibility.recommendedVariety);
                if (variety) {
                  setSelectedVariety(variety);
                }
              }
            } else {
              setFeasibilityResult(null);
            }
          } else {
            setFeasibilityResult(null);
          }
        } else {
          // Fallback to AI suggestion or default
          setNumBatches(1);
          setBatchInterval(specificResult.successionIntervalDays && specificResult.successionIntervalDays > 0 
              ? specificResult.successionIntervalDays 
              : 14);
          setFeasibilityResult(null);
        }
    }
  }, [specificResult, userLocation]);

  // Calcola piano giornaliero con Director quando cambiano garden/tasks
  useEffect(() => {
    if (!garden || tasks.length === 0) {
      setDailyPlan(null);
      return;
    }

    setLoadingDailyPlan(true);
    getDailyGardenPlan(garden, tasks, new Date())
      .then(plan => {
        setDailyPlan(plan);
        // Usa classificazione solare dal piano per filtrare suggerimenti
        if (plan.solarClassification) {
          setGardenClassification(plan.solarClassification.classification);
        }
      })
      .catch(error => {
        console.error('Error generating daily plan:', error);
      })
      .finally(() => {
        setLoadingDailyPlan(false);
      });
  }, [garden, tasks]);

  const loadSeasonalPlantSuggestions = async () => {
    if (!garden.coordinates) {
      console.warn('Garden coordinates not available for plant suggestions')
      return
    }

    setLoadingSeasonalSuggestions(true)
    try {
      const response = await fetch(
        `/api/garden/sun-exposure/plant-suggestions?gardenId=${garden.id}`
      )

      if (response.ok) {
        const data = await response.json()
        // Converti date da string a Date
        const suggestions = (data.suggestions || []).map((s: any) => ({
          ...s,
          plantingWindow: {
            start: new Date(s.plantingWindow.start),
            end: new Date(s.plantingWindow.end),
          },
        }))
        setSeasonalPlantSuggestions(suggestions)
        setGardenClassification(data.classification || null)
      } else {
        // Gestisci errori HTTP
        const errorData = await response.json().catch(() => ({ error: 'unknown_error' }))
        console.error('Error loading seasonal plant suggestions:', response.status, errorData)
        
        // Se è un errore 404 (garden not found) o 400 (missing coordinates), 
        // non loggare come errore critico
        if (response.status === 404 || response.status === 400) {
          console.warn('Garden data incomplete for suggestions:', errorData.error)
          setSeasonalPlantSuggestions([])
        }
      }
    } catch (error) {
      console.error('Error loading seasonal plant suggestions:', error)
      setSeasonalPlantSuggestions([])
    } finally {
      setLoadingSeasonalSuggestions(false)
    }
  }

  // Funzione helper per convertire PlantSuggestionForWindow in PlantSuggestion
  const convertToPlantSuggestion = (suggestion: PlantSuggestionForWindow): PlantSuggestion => {
    const startMonth = suggestion.plantingWindow.start.toLocaleDateString('it-IT', { month: 'long' });
    const endMonth = suggestion.plantingWindow.end.toLocaleDateString('it-IT', { month: 'long' });
    const plantingWindowStr = `${startMonth} - ${endMonth}`;
    
    return {
      name: suggestion.plantName,
      description: suggestion.reason,
      plantingWindow: plantingWindowStr,
      harvestTime: 'Variabile',
      difficulty: 'Medium' as const,
      waterNeeds: 'Medium' as const,
    };
  };

  // Funzione helper per caricare suggerimenti solari e convertirli
  const loadSolarSuggestions = async (): Promise<void> => {
    if (!garden.coordinates) {
      throw new Error('Coordinate giardino non disponibili');
    }

    setLoadingSeasonalSuggestions(true);
    try {
      const response = await fetch(
        `/api/garden/sun-exposure/plant-suggestions?gardenId=${garden.id}`
      );

      if (response.ok) {
        const data = await response.json();
        // Converti date da string a Date
        const solarSuggestions = (data.suggestions || []).map((s: any) => ({
          ...s,
          plantingWindow: {
            start: new Date(s.plantingWindow.start),
            end: new Date(s.plantingWindow.end),
          },
        }));
        
        setSeasonalPlantSuggestions(solarSuggestions);
        setGardenClassification(data.classification || null);
        
        // Converti anche in formato PlantSuggestion per la sezione "Suggeriti per Oggi"
        const convertedSuggestions = solarSuggestions.map(convertToPlantSuggestion);
        setSuggestions(convertedSuggestions);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'unknown_error' }));
        throw new Error(errorData.error || 'Errore nel caricamento suggerimenti solari');
      }
    } catch (error) {
      console.error('Error loading solar suggestions:', error);
      throw error;
    } finally {
      setLoadingSeasonalSuggestions(false);
    }
  };

  const handleGetSuggestions = async () => {
      // Use garden location if available, otherwise browser location
      setLoading(true);
      setError(null);
      let lat = garden.coordinates?.latitude;
      let lng = garden.coordinates?.longitude;

      const fetchSugg = async (l: number, ln: number) => {
           try {
              // Prima verifica se Gemini è disponibile
              const apiAvailable = await checkApiAvailableAsync();
              
              if (!apiAvailable) {
                // Fallback: usa suggerimenti basati su esposizione solare (non richiede Gemini)
                console.log('Gemini API non disponibile, uso suggerimenti basati su esposizione solare');
                await loadSolarSuggestions();
                setLoading(false);
                return;
              }
              
              // Se Gemini è disponibile, usa quello
              const results = await getSeasonalSuggestions(l, ln);
              if (results && results.length > 0) {
                setSuggestions(results);
              } else {
                setError("Nessun suggerimento disponibile per la tua posizione.");
              }
            } catch (err: any) {
              const errorMsg = err?.message || "Errore sconosciuto";
              
              // Se errore è per API Key non configurata, fallback a suggerimenti solari
              if (errorMsg.includes("API Key") || errorMsg.includes("API Key non configurata")) {
                console.log('Gemini API non configurata, uso suggerimenti basati su esposizione solare');
                try {
                  await loadSolarSuggestions();
                } catch (fallbackError: any) {
                  setError("Chiave API non configurata. Configura NEXT_PUBLIC_GEMINI_API_KEY nel file .env o nelle Impostazioni > API Keys");
                }
              } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
                // Per errori di autenticazione, prova fallback
                console.log('Errore autenticazione Gemini, provo fallback a suggerimenti solari');
                try {
                  await loadSolarSuggestions();
                } catch (fallbackError: any) {
                  setError("Chiave API non valida. Verifica la configurazione in .env");
                }
              } else {
                // Per altri errori, prova fallback a suggerimenti solari
                console.log('Errore Gemini, provo fallback a suggerimenti solari:', errorMsg);
                try {
                  await loadSolarSuggestions();
                } catch (fallbackError: any) {
                  setError(`Errore durante il recupero dei suggerimenti: ${errorMsg}`);
                }
              }
            } finally {
              setLoading(false);
            }
      }

      if (lat && lng) {
          // Usa coordinate salvate dell'orto
          await fetchSugg(lat, lng);
      } else {
          // Prova geolocalizzazione con retry
          const result = await getCurrentPositionWithRetry(2, {
              timeout: 20000, // 20 secondi su mobile
              enableHighAccuracy: false,
              maximumAge: 300000, // 5 minuti
          });
          
          if (result.success && result.latitude && result.longitude) {
              await fetchSugg(result.latitude, result.longitude);
          } else {
              // Fallback silenzioso a coordinate di default
              console.warn("Geolocalizzazione non disponibile, uso coordinate di default:", result.error);
              const defaultCoords = getDefaultCoordinates();
              await fetchSugg(defaultCoords.latitude, defaultCoords.longitude);
          }
      }
  }

  const handleSpecificSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Use garden coordinates if available, otherwise use default coordinates
    const defaultCoords = getDefaultCoordinates();
    let lat = garden.coordinates?.latitude || defaultCoords.latitude;
    let lng = garden.coordinates?.longitude || defaultCoords.longitude;

    setSearchLoading(true);
    setSpecificResult(null);
    setError(null);
    
    try {
      const result = await getSpecificPlantDetails(searchQuery, lat, lng);
      if (result) {
        setSpecificResult(result);
      } else {
        // Pianta non trovata né localmente né via AI
        const localMaster = getMasterSheetSync(searchQuery);
        if (!localMaster && !isApiKeyConfigured()) {
          setError("Pianta non trovata nel database locale. Configura NEXT_PUBLIC_GEMINI_API_KEY nel file .env per cercare piante non presenti nel database.");
        } else {
          setError("Nessun risultato trovato per questa ricerca. Prova con un nome diverso o usa 'Aggiungi Coltura Personalizzata'.");
        }
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg = e?.message || "Errore sconosciuto";
      if (errorMsg.includes("API Key")) {
        // Se API non configurata ma pianta non trovata localmente
        const localMaster = getMasterSheetSync(searchQuery);
        if (!localMaster) {
          setError("Pianta non trovata nel database locale. Configura NEXT_PUBLIC_GEMINI_API_KEY nel file .env per cercare piante non presenti nel database.");
        } else {
          setError("Errore imprevisto. La pianta dovrebbe essere disponibile localmente.");
        }
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

  /**
   * COMPATIBILITÀ pH - Analisi Suolo
   * 
   * Verifica se il pH del terreno è compatibile con le esigenze della pianta selezionata.
   * Ogni pianta ha un range di pH ottimale (phMin-phMax) per assorbire correttamente i nutrienti.
   * 
   * ANALISI:
   * - pH Perfetto: Il pH del terreno è nel range ottimale della pianta
   * - pH Acido: Il pH è troppo basso (< phMin) - la pianta potrebbe avere carenze
   * - pH Basico: Il pH è troppo alto (> phMax) - alcuni nutrienti potrebbero essere bloccati
   * 
   * CORREZIONI SUGGERITE:
   * - Per alzare pH (da acido a neutro): Calce agricola, cenere di legna
   * - Per abbassare pH (da basico a neutro): Zolfo, torba acida, aghi di pino
   * 
   * IMPORTANTE: Le correzioni del pH richiedono tempo (settimane/mesi) per essere efficaci.
   * Per correzioni rapide, considera di piantare in vaso con terriccio adatto.
   */
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
              locationType: locationType,
              bedId: selectedBedId // Add bed association
          };

          // Salva fase lunare
          const plantingDateObj = new Date(plantingDate);
          const moonPhase = calculateMoonPhase(plantingDateObj);

          // Add Main Task
          onAddToJournal(
              specificResult.name, 
              notes, 
              specificResult.variety, 
              method, 
              dateStr,
              method === 'Seed' ? 'Sowing' : 'Transplant',
              { 
                ...harvestData, 
                ...plantingStats,
                moonPhase: moonPhase.phase // Salva fase lunare
              } // Merge harvest and stats info
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

  // AI Planning handlers
  const handlePlanGenerated = (plan: ScalingPlan) => {
    setGeneratedPlan(plan);
    setShowAIWizard(false);
    setShowPlanPreview(true);
  };

  const handlePlanConfirm = async (plan: ScalingPlan) => {
    // Converti il piano AI in task del giardino
    const newTasks: any[] = [];
    
    plan.timeline.forEach((phase) => {
      phase.activities.forEach((activity) => {
        const task = {
          id: `ai-${Date.now()}-${Math.random()}`,
          gardenId: garden.id,
          plantName: `${plan.overview.totalSurface}ha - Fase ${phase.phaseNumber}`,
          taskType: activity.type === 'sowing' ? 'Sowing' :
                   activity.type === 'transplant' ? 'Transplant' :
                   activity.type === 'fertilization' ? 'Fertilize' :
                   activity.type === 'harvest' ? 'Harvest' : 'Treatment',
          date: activity.date,
          completed: false,
          isSuggested: true,
          suggestedBy: 'ai_planning_wizard',
          suggestedDate: activity.date,
          notes: `${activity.description}\n\nRisorse: ${activity.resources.join(', ')}\nOre stimate: ${activity.estimatedHours}h\nCosto: €${activity.cost}`,
          surfaceHectares: phase.surfaceHectares,
          expectedYield: phase.expectedYield,
          estimatedCost: activity.cost,
          aiGenerated: true,
          planPhase: phase.phaseNumber
        };
        
        // Usa onAddToJournal per ogni task
        onAddToJournal(
          task.plantName,
          task.notes,
          undefined, // variety
          activity.type === 'sowing' ? 'Seed' : activity.type === 'transplant' ? 'Seedling' : undefined,
          task.date,
          task.taskType,
          {
            surfaceHectares: phase.surfaceHectares,
            expectedYield: phase.expectedYield,
            estimatedCost: activity.cost,
            aiGenerated: true,
            planPhase: phase.phaseNumber
          }
        );
      });
    });

    setShowPlanPreview(false);
    setGeneratedPlan(null);
  };

  const handlePlanReject = () => {
    setShowPlanPreview(false);
    setGeneratedPlan(null);
  };

  const handleConsultOnly = () => {
    // Salva il piano per consultazione senza creare task
    console.log('Piano salvato per consultazione:', generatedPlan);
    setShowPlanPreview(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const soilAnalysis = getSoilAnalysis();
  const fertRecommendation = getFertilizerRecommendation();

  return (
    <div className="p-4 sm:p-8 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Pianifica Coltivazione</h1>
            <p className="text-sm text-gray-600 mt-1">Dashboard → Planner</p>
          </div>
          
          {/* AI Integration Buttons */}
          <div className="flex items-center gap-3">
            {/* AI Action Button per assistenza generale */}
            <AIActionButton
              context={{
                component: 'planner',
                data: { garden, tasks: tasks.length },
                action: 'suggest'
              }}
              variant="compact"
            />
            
            {/* Bottone principale AI Planning */}
            <button
              onClick={() => setShowAIWizard(true)}
              className="relative px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-green-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
            >
              <Bot size={20} className="animate-bounce" />
              <span className="font-medium">🤖 Pianifica con AI</span>
              <Sparkles size={16} className="opacity-80 animate-spin" />
              
              {/* Badge NEW */}
              <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-bounce">
                NEW
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout - Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column */}
        <div className="space-y-6">

      {/* Visual Planner Modal */}
      {/* 
       * VISUAL GARDEN PLANNER - Pianificazione Visiva dell'Orto
       * 
       * Feature Pro che permette di visualizzare e organizzare le piante
       * in un layout grafico dell'orto. Funzionalità:
       * 
       * - Drag & Drop: Trascina le piante per posizionarle nell'orto
       * - Zoom: Ingrandisci/riduci per vedere dettagli o panoramica
       * - Grid: Attiva/disattiva griglia per allineamento preciso
       * - Collision Detection: Avvisa se piante sono troppo vicine
       * - Companion Planting: Suggerisce consociazioni favorevoli
       * - Spacing Calculator: Calcola automaticamente distanze ottimali
       * 
       * Utile per pianificare layout ottimale considerando:
       * - Spazio necessario per ogni pianta
       * - Consociazioni favorevoli/sfavorevoli
       * - Rotazione colture
       * - Esposizione solare per zona
       */}
      {showVisualPlanner && onUpdateTask && (
        <VisualGardenPlanner
          garden={garden}
          tasks={tasks}
          onUpdateTask={onUpdateTask}
          onClose={() => setShowVisualPlanner(false)}
        />
      )}

          {/* SEARCH SECTION - PRIMARY */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-3">
            <Search size={20} className="text-green-600"/>
            Cerca Specie o Varietà
        </h2>
        
        {/* Visual Category Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedVisualCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVisualCategory === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tutte
          </button>
          <button
            onClick={() => setSelectedVisualCategory('Orto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVisualCategory === 'Orto'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🥬 Orto
          </button>
          <button
            onClick={() => {
              setSelectedVisualCategory('Orto');
              // Filtra per piante invernali
              setSearchQuery('cavolo spinaci rucola lattuga invernale');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300`}
          >
            ❄️ Orto Invernale
          </button>
          <button
            onClick={() => setSelectedVisualCategory('Frutteto')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVisualCategory === 'Frutteto'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🍎 Frutteto
          </button>
          <button
            onClick={() => setSelectedVisualCategory('Esotici')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVisualCategory === 'Esotici'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌴 Esotici
          </button>
          <button
            onClick={() => setSelectedVisualCategory('Aromatiche')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedVisualCategory === 'Aromatiche'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌿 Aromatiche
          </button>
        </div>
        
        {/* Search Box */}
        <form onSubmit={handleSpecificSearch} className="relative">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-transparent focus-within:border-ortomio-green-500 focus-within:bg-white transition-all">
                <span className="text-lg md:text-xl">🔍</span>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={selectedVisualCategory === 'all' ? "Cerca una pianta da coltivare..." : `Cerca in ${selectedVisualCategory}...`}
                    className="flex-1 bg-transparent border-none outline-none text-base"
                />
                <button 
                    type="submit"
                    disabled={searchLoading}
                    className="bg-ortomio-green-500 p-3 rounded-lg text-white hover:bg-ortomio-green-600 shadow-md transition-all disabled:opacity-50"
                >
                    {searchLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                </button>
            </div>
        </form>

        {/* Popular Plants Tags */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Popolari in questo periodo:</h4>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  // Mostra piante estive
                  const summerPlants = [
                    { name: 'Pomodoro', emoji: '🍅', id: 'pomodoro' },
                    { name: 'Peperone', emoji: '🫑', id: 'peperone' },
                    { name: 'Zucchina', emoji: '🥒', id: 'zucchina' },
                    { name: 'Melanzana', emoji: '🍆', id: 'melanzana' },
                    { name: 'Peperoncino', emoji: '🌶️', id: 'peperoncino' }
                  ];
                  // Aggiorna i suggerimenti
                }}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
              >
                ☀️ Estive
              </button>
              <button 
                onClick={() => {
                  // Mostra piante invernali
                  const winterPlants = [
                    { name: 'Cavolo', emoji: '🥬', id: 'cavolo' },
                    { name: 'Spinaci', emoji: '🥬', id: 'spinaci' },
                    { name: 'Rucola', emoji: '🥬', id: 'rucola' },
                    { name: 'Lattuga', emoji: '🥬', id: 'lattuga' },
                    { name: 'Ravanelli', emoji: '🔴', id: 'ravanelli' }
                  ];
                  // Aggiorna i suggerimenti
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
              >
                ❄️ Invernali
              </button>
            </div>
          </div>
          
          <PopularPlantsTags
            plants={seasonalPlantSuggestions.length > 0 
              ? seasonalPlantSuggestions.slice(0, 5).map(s => ({
                  name: s.plantName,
                  emoji: s.plantName === 'Pomodoro' ? '🍅' :
                         s.plantName === 'Peperone' ? '🫑' :
                         s.plantName === 'Zucchina' ? '🥒' :
                         s.plantName === 'Melanzana' ? '🍆' :
                         s.plantName === 'Peperoncino' ? '🌶️' :
                         s.plantName === 'Cavolo' ? '🥬' :
                         s.plantName === 'Spinaci' ? '🥬' :
                         s.plantName === 'Rucola' ? '🥬' :
                         s.plantName === 'Lattuga' ? '🥬' :
                         s.plantName === 'Ravanelli' ? '🔴' : '🌱',
                  id: s.plantId
                }))
              : // Fallback per piante invernali se non ci sono suggerimenti stagionali
                [
                  { name: 'Cavolo', emoji: '🥬', id: 'cavolo' },
                  { name: 'Spinaci', emoji: '🥬', id: 'spinaci' },
                  { name: 'Rucola', emoji: '🥬', id: 'rucola' },
                  { name: 'Lattuga', emoji: '🥬', id: 'lattuga' },
                  { name: 'Ravanelli', emoji: '🔴', id: 'ravanelli' }
                ]
            }
            selectedPlant={selectedPopularPlant || specificResult?.name}
            onSelect={async (plantName) => {
              setSelectedPopularPlant(plantName)
              setSearchQuery(plantName)
              // Trigger search automatically
              const coords = garden.coordinates || getDefaultCoordinates();
              try {
                setSearchLoading(true)
                setError(null)
                const result = await getSpecificPlantDetails(plantName, coords.latitude, coords.longitude)
                setSpecificResult(result)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Errore nella ricerca')
              } finally {
                setSearchLoading(false)
              }
            }}
          />
        </div>

          {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 font-medium flex items-center gap-3">
                      <AlertTriangle size={16} className="text-red-600"/>
                      {error}
                  </p>
              </div>
          )}
          </div>

          {/* AI Generated Tasks Section */}
          {tasks.filter(t => t.aiGenerated).length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bot size={24} className="text-blue-600" />
                  <div>
                    <h2 className="text-lg font-bold text-blue-800">Task Generati da AI</h2>
                    <p className="text-sm text-blue-600">
                      {tasks.filter(t => t.aiGenerated).length} task creati dal sistema di pianificazione AI
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AIActionButton
                    context={{
                      component: 'planner',
                      data: { aiTasks: tasks.filter(t => t.aiGenerated).length },
                      action: 'optimize'
                    }}
                    variant="compact"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Fasi AI */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {Array.from(new Set(tasks.filter(t => t.aiGenerated).map(t => t.planPhase))).map(phase => (
                    <span key={phase} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                      Fase {phase}
                    </span>
                  ))}
                </div>
                
                {/* Task AI più recenti */}
                <div className="grid gap-3">
                  {tasks.filter(t => t.aiGenerated).slice(0, 3).map((task) => (
                    <div key={task.id} className="bg-white border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-800">{task.plantName}</h4>
                            <p className="text-sm text-gray-600">
                              {task.taskType} • {new Date(task.date).toLocaleDateString('it-IT')}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <Bot size={12} className="text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">Generato da AI</span>
                              {task.planPhase && (
                                <span className="text-xs text-gray-500">• Fase {task.planPhase}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <AIActionButton
                          context={{
                            component: 'planner',
                            data: task,
                            action: 'optimize'
                          }}
                          variant="compact"
                        />
                      </div>
                      
                      {task.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700 line-clamp-3">{task.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {tasks.filter(t => t.aiGenerated).length > 3 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Vedi tutti i {tasks.filter(t => t.aiGenerated).length} task AI →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

      {/* SPECIALIZED CROPS SECTION */}
      {isPro && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <Sparkles size={20} className="text-purple-600"/>
              Colture Specializzate
            </h2>
            <button
              onClick={() => setShowCustomCropForm(true)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-3"
            >
              <PlusCircle size={16} />
              Aggiungi Coltura Personalizzata
            </button>
          </div>
          
          {/* Custom Crop Form */}
          {showCustomCropForm && (
            <div className="mb-4">
              <CustomCropForm
                gardenId={garden.id}
                onSuccess={(cropData) => {
                  setShowCustomCropForm(false);
                  // Apri il wizard per aggiungere al Diario
                  setWizardPlantData({
                    plantName: cropData.commonName,
                    plantNotes: cropData.notes,
                    variety: cropData.scientificName // Usa scientificName come variety se disponibile
                  });
                  setShowPlantingWizard(true);
                }}
                onCancel={() => setShowCustomCropForm(false)}
              />
            </div>
          )}
          
          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={selectedCropCategory}
              onChange={(e) => {
                setSelectedCropCategory(e.target.value as 'all' | SpecializedCropType);
                setSelectedSpecializedCrop(null);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tutte</option>
              <option value="FruitTree">Alberi da Frutto</option>
              <option value="Olive">Olive 🇮🇹 TRADIZIONALE</option>
              <option value="Vine">Vite 🇮🇹 TRADIZIONALE</option>
              <option value="Strawberry">Fragole</option>
              <option value="ExoticFruit">Frutti Esotici</option>
              <option value="Aromatic">Erbe Aromatiche</option>
              <option value="Raspberry">Lamponi</option>
            </select>
          </div>

          {/* Specialized Crops List */}
          {selectedCropCategory !== 'all' && !selectedSpecializedCrop && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getMasterSheetsByCropType(selectedCropCategory).map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedSpecializedCrop(crop)}
                  className="w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="font-semibold text-gray-800">{crop.commonName}</div>
                  {crop.scientificName && (
                    <div className="text-xs text-gray-500 italic">{crop.scientificName}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Specialized Crop Form */}
          {selectedSpecializedCrop && (
            <div className="mt-4">
              <SpecializedCropForm
                cropType={selectedCropCategory as SpecializedCropType}
                masterSheet={selectedSpecializedCrop}
                garden={garden}
                onSubmit={(data) => {
                  onAddToJournal(
                    data.plantName,
                    data.notes,
                    data.variety,
                    undefined,
                    data.date,
                    data.taskType,
                    data.additionalData
                  );
                  setSelectedSpecializedCrop(null);
                  setSelectedCropCategory('all');
                }}
                onCancel={() => {
                  setSelectedSpecializedCrop(null);
                }}
              />
            </div>
          )}
        </div>
      )}

        {!garden.coordinates && (
             <p className="text-xs text-orange-500 mt-2 flex items-center gap-3">
                <MapPin size={12}/> Configura la posizione dell'orto per date più precise.
             </p>
        )}

          {specificResult && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Plant Header with Gradient */}
              <div className="bg-gradient-to-br from-ortomio-green-500 to-ortomio-green-600 p-6 text-white">
                <div className="flex items-center gap-5">
                  <div className="text-6xl bg-white/20 rounded-xl w-24 h-24 flex items-center justify-center">
                    {specificResult.name === 'Pomodoro' ? '🍅' : 
                     specificResult.name === 'Peperone' ? '🫑' :
                     specificResult.name === 'Zucchina' ? '🥒' :
                     specificResult.name === 'Melanzana' ? '🍆' :
                     specificResult.name === 'Peperoncino' ? '🌶️' : '🌱'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-1">{specificResult.name}</h2>
                    <p className="text-white/90 text-sm mb-3">{specificResult.variety || 'Solanaceae'}</p>
                    <div className="flex gap-3 flex-wrap">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">☀️ Pieno sole</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">💧 Media</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">⏱️ 80-100 giorni</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Plant Info */}
                {specificResult.notes && (
                  <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                    <p className="text-sm text-gray-700">{specificResult.notes}</p>
                  </div>
                )}
                    
                    {/* Geographic Feasibility Card - For Exotic Fruits */}
                    {feasibilityResult && (() => {
                      const masterSheets = getAllMasterSheets();
                      const masterSheet = masterSheets.find(p => 
                        p.commonName.toUpperCase() === specificResult.name.toUpperCase()
                      );
                      if (masterSheet && masterSheet.cropType === 'ExoticFruit') {
                        return (
                          <GeographicFeasibilityCard
                            plant={masterSheet as unknown as ExoticFruitCrop}
                            feasibilityResult={feasibilityResult}
                            userLocation={userLocation || undefined}
                          />
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Variety Selector - For Exotic Fruits */}
                    {(() => {
                      const masterSheets = getAllMasterSheets();
                      const masterSheet = masterSheets.find(p => 
                        p.commonName.toUpperCase() === specificResult.name.toUpperCase()
                      );
                      if (masterSheet && masterSheet.cropType === 'ExoticFruit') {
                        const exoticCrop = masterSheet as unknown as ExoticFruitCrop;
                        if (exoticCrop.varieties && exoticCrop.varieties.length > 0) {
                          return (
                            <VarietySelector
                              varieties={exoticCrop.varieties}
                              recommendedVariety={feasibilityResult?.recommendedVariety}
                              userUsdaZone={userLocation?.usdaZone}
                              onSelectVariety={(variety) => setSelectedVariety(variety)}
                              selectedVarietyId={selectedVariety?.id}
                            />
                          );
                        }
                      }
                      return null;
                    })()}
                    
                    {/* Cultivation System Selector - For Exotic Fruits */}
                    {(() => {
                      const masterSheets = getAllMasterSheets();
                      const masterSheet = masterSheets.find(p => 
                        p.commonName.toUpperCase() === specificResult.name.toUpperCase()
                      );
                      if (masterSheet && masterSheet.cropType === 'ExoticFruit') {
                        const exoticCrop = masterSheet as unknown as ExoticFruitCrop;
                        if (exoticCrop.cultivationSystems) {
                          return (
                            <CultivationSystemSelector
                              plant={exoticCrop}
                              recommendedSystem={feasibilityResult?.recommendedSystem}
                              userUsdaZone={userLocation?.usdaZone}
                              onSelectSystem={(system) => setSelectedCultivationSystem(system)}
                              selectedSystem={selectedCultivationSystem}
                            />
                          );
                        }
                      }
                      return null;
                    })()}
                    
                    {/* Seed Availability */}
                    {(() => {
                      const availableSeeds = findSeedsForPlant(garden.id, specificResult.name, specificResult.variety);
                      const expiringSeeds = getExpiringSeeds(garden.id, new Date().getFullYear()).filter(s => 
                        s.speciesName.toLowerCase() === specificResult.name.toLowerCase()
                      );
                      
                      if (availableSeeds.length > 0 || expiringSeeds.length > 0) {
                        return (
                          <div className="mt-3 bg-white p-3 rounded-lg border border-green-50">
                            <div className="flex items-center gap-3 mb-2">
                              <Package size={16} className="text-green-600" />
                              <span className="text-sm font-bold text-gray-700">Semi Disponibili:</span>
                            </div>
                            <div className="space-y-1">
                              {availableSeeds.map(seed => (
                                <div key={seed.id} className="text-xs flex items-center justify-between">
                                  <span>{seed.varietyName} ({seed.quantityRemaining === 'High' ? 'Alta' : seed.quantityRemaining === 'Medium' ? 'Media' : 'Bassa'})</span>
                                  {expiringSeeds.find(e => e.id === seed.id) && (
                                    <span className="text-orange-600 font-bold">⚠️ Scade {seed.expiryYear}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                </div>

                {/* VISUAL CALENDAR - Usa il nuovo componente migliorato */}
                {specificResult.seedSowingWindow && specificResult.transplantWindow && specificResult.harvestWindow ? (
                  <PlantLifecycleTimeline
                    sowingMonths={parseMonthsFromTextNew(specificResult.seedSowingWindow)}
                    transplantMonths={parseMonthsFromTextNew(specificResult.transplantWindow)}
                    harvestMonths={parseMonthsFromTextNew(specificResult.harvestWindow)}
                    plantName={specificResult.name}
                    variety={specificResult.variety}
                  />
                ) : (
                  <PlantCalendar 
                    sowing={specificResult.seedSowingWindow || ''} 
                    transplant={specificResult.transplantWindow || ''} 
                    harvest={specificResult.harvestWindow || ''} 
                  />
                )}
                
                {/* ADVANCED SOIL ANALYSIS */}
                {soilAnalysis && (soilAnalysis.hasData || specificResult.soil) && (
                    <div className={`mb-6 p-5 rounded-xl border-2 ${soilAnalysis.phStatus === 'good' ? 'bg-white border-green-100' : 'bg-white border-yellow-100'}`}>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-3 text-sm uppercase">
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
                                                <p className="text-xs text-gray-600 mt-1 bg-yellow-50 p-3 rounded border border-yellow-full max-w-sm">
                                                    💡 <b>Correzione:</b> {soilAnalysis.phAdvice}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {garden?.soilType && (
                                        <div className="flex items-start gap-3 border-t border-gray-100 pt-3">
                                            <div className="p-3.5 rounded-full bg-blue-100 text-blue-600">
                                                <Layers size={16}/>
                                            </div>
                                            <div>
                                                 <p className="text-sm text-gray-700">{soilAnalysis.typeMsg}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             ) : (
                                 <p className="text-xs text-gray-500 italic flex items-center gap-3">
                                     <Info size={12}/> Configura il pH e il tipo di terra nella Dashboard per un'analisi dettagliata.
                                 </p>
                             )}
                        </div>
                    </div>
                )}

                {/* Technical Data: Irrigation & Fertilizer */}
                <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <h4 className="flex items-center gap-3 font-bold text-blue-800 mb-3 text-sm uppercase justify-between">
                            <span className="flex items-center gap-3"><Droplets size={16} /> Piano Irrigazione</span>
                            <Edit3 size={14} className="opacity-50" />
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-blue-700 mb-1">Frequenza</label>
                                <input 
                                    type="text"
                                    value={customIrrigationFreq}
                                    onChange={(e) => setCustomIrrigationFreq(e.target.value)}
                                    className="w-full text-sm p-3 rounded-lg border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    placeholder="Es. Ogni 2 giorni"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-700 mb-1">Metodo</label>
                                <input 
                                    type="text"
                                    value={customIrrigationMethod}
                                    onChange={(e) => setCustomIrrigationMethod(e.target.value)}
                                    className="w-full text-sm p-3 rounded-lg border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    placeholder="Es. A goccia"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 relative overflow-hidden">
                        <h4 className="flex items-center gap-3 font-bold text-purple-800 mb-3 text-sm uppercase">
                            <FlaskConical size={16} /> Nutrizione
                        </h4>
                        
                        {fertRecommendation && garden?.soilType && (
                            <div className="mb-3 bg-white/60 p-3 rounded-lg border border-purple-100 flex items-start gap-2">
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
                                <div className="flex items-center gap-3 text-purple-700 mt-2 text-xs">
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
                                <div className="flex items-center gap-3 text-purple-700 mt-2 text-xs">
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
                                    <p className="text-xs text-purple-800 font-bold mb-1 flex items-center gap-3">
                                        <Clock size={12}/> Programma Concimazione:
                                    </p>
                                    <div className="flex flex-wrap gap-3">
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
                
                {/* Simplified Planting Form */}
                <SimplifiedPlantingForm
                  plantName={specificResult.name}
                  variety={specificResult.variety}
                  plantingMethod={plantingMethod}
                  onPlantingMethodChange={setPlantingMethod}
                  plantingDate={plantingDate}
                  onPlantingDateChange={setPlantingDate}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  onSubmit={() => {
                    // Determine method based on plantingMethod state
                    const method: 'Seed' | 'Seedling' = plantingMethod === 'transplant' ? 'Seedling' : 'Seed';
                    const dateToUse = plantingMethod === 'later' ? plantingDate : new Date().toISOString().split('T')[0];
                    
                    // Update plantingQuantity and trigger handlePlanPlanting
                    setPlantingQuantity(quantity);
                    
                    // If plantingMethod is 'later', we need to handle it differently
                    if (plantingMethod === 'later') {
                      // Create a task for future date
                      const soilAnalysis = getSoilAnalysis();
                      const soilNote = soilAnalysis?.hasData ? `\n🌍 Suolo: ${soilAnalysis.phMsg}. ${soilAnalysis.typeMsg}` : '';
                      const notes = `Metodo: ${method === 'Seed' ? 'Seme' : 'Trapianto'}.\nIrrigazione: ${customIrrigationFreq || 'Da definire'}.\nConcime Base: ${specificResult.fertilizer.organicType} (${specificResult.fertilizer.organicDosageGm2}g/mq).${soilNote}`;
                      
                      const plantingStats = {
                        initialQuantity: quantity,
                        currentQuantity: quantity,
                        locationType: locationType,
                        bedId: selectedBedId
                      };
                      
                      onAddToJournal(
                        specificResult.name,
                        notes,
                        specificResult.variety,
                        method,
                        dateToUse,
                        method === 'Seed' ? 'Sowing' : 'Transplant',
                        plantingStats
                      );
                    } else {
                      // Use existing handlePlanPlanting for 'now' and 'transplant'
                      handlePlanPlanting(method);
                    }
                    
                    // Reset form
                    setSpecificResult(null);
                    setSearchQuery('');
                    setSelectedPopularPlant(null);
                    setPlantingMethod('now');
                    setQuantity(12);
                  }}
                  isLoading={false}
                />

                {/* Advanced Settings: Succession & Reminders - Hidden by default, show in collapsible section */}
                <details className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                     <summary className="font-bold text-gray-700 mb-3 text-sm uppercase flex items-center gap-3 cursor-pointer">
                        <Settings size={16}/> Opzioni Avanzate
                     </summary>

                     {/* Quantity and Location (New) */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div>
                             <label className="text-xs font-bold text-gray-600 flex items-center gap-3 mb-2">
                                <Sprout size={14}/> QUANTE PIANTE?
                             </label>
                             <input 
                                type="number" 
                                min="1" 
                                value={plantingQuantity}
                                onChange={(e) => setPlantingQuantity(parseInt(e.target.value) || 1)}
                                className="w-full p-3 rounded-lg border border-gray-300 font-bold text-gray-800 text-center"
                             />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 flex items-center gap-3 mb-2">
                                <MapPin size={14}/> DOVE?
                             </label>
                             <div className="flex gap-3 flex-wrap">
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
                                 {/* Hydroponic Systems - Only show if garden is hydroponic */}
                                 {(garden.gardenType?.startsWith('Hydroponic') || 
                                   garden.gardenType === 'NFT' || 
                                   garden.gardenType === 'DWC' || 
                                   garden.gardenType === 'EbbFlow' || 
                                   garden.gardenType === 'Drip' || 
                                   garden.gardenType === 'Wick' || 
                                   garden.gardenType === 'Kratky') && (
                                   <>
                                     {garden.gardenType === 'NFT' && (
                                       <button 
                                         onClick={() => setLocationType('HydroponicNFT')}
                                         className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'HydroponicNFT' ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-300'}`}
                                         title="NFT"
                                       >
                                         <Droplets size={18}/>
                                       </button>
                                     )}
                                     {garden.gardenType === 'DWC' && (
                                       <button 
                                         onClick={() => setLocationType('HydroponicDWC')}
                                         className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'HydroponicDWC' ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-300'}`}
                                         title="DWC"
                                       >
                                         <Droplets size={18}/>
                                       </button>
                                     )}
                                     {garden.gardenType === 'EbbFlow' && (
                                       <button 
                                         onClick={() => setLocationType('HydroponicEbbFlow')}
                                         className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'HydroponicEbbFlow' ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-300'}`}
                                         title="Flusso e Riflusso"
                                       >
                                         <Droplets size={18}/>
                                       </button>
                                     )}
                                     {garden.gardenType === 'Drip' && (
                                       <button 
                                         onClick={() => setLocationType('HydroponicDrip')}
                                         className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'HydroponicDrip' ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-300'}`}
                                         title="Drip"
                                       >
                                         <Droplets size={18}/>
                                       </button>
                                     )}
                                     {garden.gardenType === 'Wick' && (
                                       <button 
                                         onClick={() => setLocationType('HydroponicWick')}
                                         className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'HydroponicWick' ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-300'}`}
                                         title="Wick"
                                       >
                                         <Droplets size={18}/>
                                       </button>
                                     )}
                                     {garden.gardenType === 'Kratky' && (
                                       <button 
                                         onClick={() => setLocationType('HydroponicKratky')}
                                         className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'HydroponicKratky' ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-white border-gray-300'}`}
                                         title="Kratky"
                                       >
                                         <Droplets size={18}/>
                                       </button>
                                     )}
                                   </>
                                 )}
                                 {/* Aquaponic - Only show if garden is aquaponic */}
                                 {garden.gardenType === 'Aquaponic' && (
                                   <button 
                                     onClick={() => setLocationType('Aquaponic')}
                                     className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'Aquaponic' ? 'bg-cyan-100 border-cyan-400 text-cyan-800' : 'bg-white border-gray-300'}`}
                                     title="Acquaponica"
                                   >
                                     <Droplets size={18}/>
                                   </button>
                                 )}
                                 {/* Aeroponic - Only show if garden is aeroponic */}
                                 {garden.gardenType === 'Aeroponic' && (
                                   <button 
                                     onClick={() => setLocationType('Aeroponic')}
                                     className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'Aeroponic' ? 'bg-indigo-100 border-indigo-400 text-indigo-800' : 'bg-white border-gray-300'}`}
                                     title="Aeroponica"
                                   >
                                     <Droplets size={18}/>
                                   </button>
                                 )}
                                 {/* Indoor - Only show if garden is indoor */}
                                 {garden.gardenType === 'Indoor' && (
                                   <button 
                                     onClick={() => setLocationType('Indoor')}
                                     className={`flex-1 py-2 rounded-lg border flex items-center justify-center ${locationType === 'Indoor' ? 'bg-gray-100 border-gray-400 text-gray-800' : 'bg-white border-gray-300'}`}
                                     title="Indoor"
                                   >
                                     <Sun size={18}/>
                                   </button>
                                 )}
                             </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-gray-600 flex items-center gap-3">
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
                                    <div className="mt-3 pt-2 border-t border-gray-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-xs text-gray-600">
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
                                                    // Usa array statico per evitare problemi di hydration SSR
                                                    const monthNamesShort = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 
                                                                           'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + ((numBatches - 1) * batchInterval));
                                                    const day = d.getDate();
                                                    const month = monthNamesShort[d.getMonth()];
                                                    return `${day} ${month}`;
                                                })()}
                                            </div>
                                        </div>
                                        {(() => {
                                          const masterSheets = getAllMasterSheets();
                                          const masterSheet = masterSheets.find(p => 
                                            p.commonName.toUpperCase() === (specificResult?.name || '').toUpperCase()
                                          );
                                          if (masterSheet && numBatches > 1) {
                                            const advice = calculateStaggeredPlanting(masterSheet);
                                            if (advice.recommended && advice.benefits.length > 0) {
                                              return (
                                                <div className="bg-green-50 rounded p-3 text-[10px] text-green-700 border border-green-200">
                                                  <p className="font-bold mb-1">💡 Benefici:</p>
                                                  <ul className="list-disc list-inside space-y-0.5">
                                                    {advice.benefits.map((benefit, idx) => (
                                                      <li key={idx}>{benefit}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              );
                                            }
                                          }
                                          return null;
                                        })()}
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
                </details>

                <div className="flex gap-3 mb-4 bg-orange-50 p-2 rounded text-xs text-orange-800 border border-orange-100">
                    <Gauge size={16} />
                    <span><b>Raccolta:</b> {specificResult.harvest.visualSigns} {specificResult.harvest.minBrix ? `(Ideal >${specificResult.harvest.minBrix}° Brix)` : ''}</span>
                </div>

                {/* Moon Phase Indicator */}
                {(() => {
                  const today = new Date();
                  const moonInfo = calculateMoonPhase(today);
                  const moonCheck = isIdealPhaseFor('sowing', 'FRUITING', today); // Default, si può migliorare
                  const moonEmoji = moonInfo.isWaxing ? '🌒' : moonInfo.isWaning ? '🌘' : moonInfo.phase === 'Full' ? '🌕' : moonInfo.phase === 'New' ? '🌑' : '🌓';
                  
                  return (
                    <div className={`mb-4 p-3 rounded-xl border ${moonCheck.ideal ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-xl md:text-2xl">{moonEmoji}</span>
                        <div>
                          <span className="font-bold text-gray-800">Luna {moonInfo.name}</span>
                          <p className="text-xs text-gray-600">{moonCheck.reason}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Accessori Consigliati */}
                {specificResult && (
                  <AccessoriesSuggestionsSection
                    plantName={specificResult.name}
                    masterData={getMasterSheetSync(specificResult.name)}
                    garden={garden}
                  />
                )}

                {/* Selezione Zona di Coltivazione */}
                {beds.length > 0 && (
                  <div className="mb-4 bg-white p-4 rounded-xl border-2 border-blue-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                      <LayoutGrid size={16} className="text-blue-600" />
                      Zona di coltivazione
                    </label>
                    <select
                      value={selectedBedId || ''}
                      onChange={(e) => {
                        setSelectedBedId(e.target.value || undefined);
                        // Update locationType based on bed type
                        const selectedBed = beds.find(b => b.id === e.target.value);
                        if (selectedBed) {
                          if (selectedBed.bedType === 'Greenhouse') {
                            setLocationType('Ground'); // Greenhouse non è un GrowingLocation valido, usa Ground
                          } else if (selectedBed.bedType === 'Hydroponic') {
                            setLocationType('HydroponicNFT'); // Usa un valore valido
                          } else if (selectedBed.bedType === 'Aquaponic') {
                            setLocationType('Aquaponic');
                          } else if (selectedBed.bedType === 'Aeroponic') {
                            setLocationType('Aeroponic');
                          } else if (selectedBed.bedType === 'Indoor') {
                            setLocationType('Indoor');
                          } else if (selectedBed.bedType === 'Pot') {
                            setLocationType('Pot');
                          } else if (selectedBed.bedType === 'RaisedBed') {
                            setLocationType('RaisedBed');
                          } else if (selectedBed.bedType === 'Container') {
                            setLocationType('Ground'); // Container non è un GrowingLocation valido, usa Ground
                          } else {
                            setLocationType('Ground');
                          }
                        }
                      }}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Piena terra (non in letto specifico)</option>
                      {beds.map(bed => {
                        const calc = bedSpaceCalculations[bed.id];
                        const occupancy = calc?.occupancyPercentage || 0;
                        return (
                          <option key={bed.id} value={bed.id}>
                            {bed.name} ({bed.bedType === 'RaisedBed' ? 'Cassone' : bed.bedType === 'Pot' ? 'Vaso' : bed.bedType}) - {bed.areaSqMeters?.toFixed(2)} m²
                            {calc && ` - ${occupancy.toFixed(0)}% occupato`}
                          </option>
                        );
                      })}
                    </select>
                    {selectedBedId && bedSpaceCalculations[selectedBedId] && (
                      (() => {
                        const calc = bedSpaceCalculations[selectedBedId];
                        const isAlmostFull = calc.occupancyPercentage >= 80;
                        if (isAlmostFull) {
                          return (
                            <div className={`mt-2 p-2 rounded-lg text-sm ${
                              calc.occupancyPercentage >= 90 
                                ? 'bg-red-50 border border-red-200 text-red-800' 
                                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                            }`}>
                              <div className="flex items-center gap-3">
                                <AlertTriangle size={14} />
                                <span>
                                  Questo letto è {calc.occupancyPercentage.toFixed(0)}% occupato.
                                  Spazio disponibile: {calc.availableArea.toFixed(2)} m²
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()
                    )}
                  </div>
                )}

                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Scegli come iniziare:</h4>
                <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3 text-orange-700">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-lg">🌰</span>
                                </div>
                                <span className="font-bold">Dal Seme</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-3 text-sm">
                                <label className="flex items-center gap-3 cursor-pointer">
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
                                    <div className="flex items-center gap-3 text-orange-800">
                                        <Sun size={14}/> <span>Luce: <b>{specificResult.indoor.lightHours}h</b>/giorno</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-orange-800">
                                        <Thermometer size={14}/> <span>Temp: <b>{specificResult.indoor.germinationTemp}</b></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-orange-800">
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
                            <div className="flex items-center gap-3 mb-3 text-green-700">
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

                {/* GUIDA COMPLETA "FOR DUMMIES" */}
                {specificResult.guide && (
                    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border-2 border-green-200">
                            <h3 className="font-bold text-lg md:text-xl text-green-900 mb-2 flex items-center gap-3">
                                <Sparkles size={24} className="text-green-600"/>
                                Guida Completa "For Dummies"
                            </h3>
                            <p className="text-green-800 text-sm leading-relaxed">{specificResult.guide.introduction}</p>
                        </div>

                        {/* GUIDA SEMINA PASSO-PASSO */}
                        <div className="bg-white p-5 rounded-xl border-2 border-orange-100 shadow-sm">
                            <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-3 text-lg">
                                <Sprout size={20} className="text-orange-600"/>
                                Guida Semina Passo-Passo
                            </h4>
                            <ol className="space-y-3">
                                {specificResult.guide.sowingSteps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                                            {idx + 1}
                                        </span>
                                        <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* GUIDA TRAPIANTO */}
                        <div className="bg-white p-5 rounded-xl border-2 border-green-100 shadow-sm">
                            <h4 className="font-bold text-green-900 mb-4 flex items-center gap-3 text-lg">
                                <ArrowRight size={20} className="text-green-600"/>
                                Guida Trapianto
                            </h4>
                            <ol className="space-y-3">
                                {specificResult.guide.transplantSteps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-sm">
                                            {idx + 1}
                                        </span>
                                        <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* CONSIGLI PER LA CURA */}
                        <div className="bg-white p-5 rounded-xl border-2 border-blue-100 shadow-sm">
                            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-3 text-lg">
                                <Droplets size={20} className="text-blue-600"/>
                                Consigli per la Cura
                            </h4>
                            <ul className="space-y-2">
                                {specificResult.guide.careTips.map((tip, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
                                        <p className="text-gray-700 leading-relaxed">{tip}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ERRORI COMUNI */}
                        {specificResult.guide.commonMistakes && specificResult.guide.commonMistakes.length > 0 && (
                            <div className="bg-white p-5 rounded-xl border-2 border-red-100 shadow-sm">
                                <h4 className="font-bold text-red-900 mb-4 flex items-center gap-3 text-lg">
                                    <AlertTriangle size={20} className="text-red-600"/>
                                    Errori Comuni da Evitare
                                </h4>
                                <ul className="space-y-3">
                                    {specificResult.guide.commonMistakes.map((mistake, idx) => (
                                        <li key={idx} className="flex gap-3">
                                            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5"/>
                                            <p className="text-gray-700 leading-relaxed">{mistake}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* GUIDA RACCOLTA */}
                        <div className="bg-white p-5 rounded-xl border-2 border-purple-100 shadow-sm">
                            <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-3 text-lg">
                                <Calendar size={20} className="text-purple-600"/>
                                Guida Raccolta
                            </h4>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{specificResult.guide.harvestGuide}</p>
                        </div>
                    </div>
                )}
            </div>
        )}

      {/* Alert dal Director */}
      {dailyPlan && dailyPlan.urgentAlerts && dailyPlan.urgentAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-full max-w-sm rounded-xl p-4 mb-6">
          <h3 className="font-bold text-yellow-full max-w-sm flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-yellow-full max-w-sm" />
            Avvisi Importanti
          </h3>
          <div className="space-y-2">
            {dailyPlan.urgentAlerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-full max-w-sm">
                <p className="text-sm font-medium text-yellow-full max-w-sm">{alert.message}</p>
                {alert.action && (
                  <p className="text-xs text-yellow-full max-w-sm mt-1">{alert.action}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggerimenti basati su Finestre Stagionali */}
      {garden.coordinates && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-green-900 flex items-center gap-3">
                <Sun size={20} className="text-yellow-full max-w-sm" />
                Suggerimenti per Tipo di Orto
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Piante ottimizzate per le finestre solari del tuo orto
                {dailyPlan?.solarClassification && ' (da Director)'}
              </p>
            </div>
            <button
              onClick={loadSeasonalPlantSuggestions}
              disabled={loadingSeasonalSuggestions}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {loadingSeasonalSuggestions ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analizza Orto
                </>
              )}
            </button>
          </div>

          {gardenClassification && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">
                  {gardenClassification.type === 'Estivo' && '🌞'}
                  {gardenClassification.type === 'NonEstivo' && '🌱'}
                  {gardenClassification.type === 'Misto' && '🌍'}
                </span>
                <span className="font-semibold text-gray-900">
                  Orto {gardenClassification.type === 'Estivo' ? 'Estivo' : gardenClassification.type === 'NonEstivo' ? 'Primaverile/Autunnale' : 'Misto'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {gardenClassification.recommendations[0]}
              </p>
            </div>
          )}

          {seasonalPlantSuggestions.length > 0 && (
            <div className="space-y-3">
              {seasonalPlantSuggestions.slice(0, 6).map((suggestion, idx) => {
                const selectedMethod = selectedMethods[idx] || suggestion.method;
                const plantingWindow: PlantingWindow = {
                  category: suggestion.category as any,
                  startDate: new Date(suggestion.plantingWindow.start),
                  endDate: new Date(suggestion.plantingWindow.end),
                  method: selectedMethod,
                  recommendedPlants: [suggestion.plantName],
                  reason: suggestion.reason,
                  cycles: 1,
                };
                const adjustedWindow = adjustForPlantingMethod(plantingWindow, selectedMethod, suggestion.plantName);
                const displayStartDate = adjustedWindow.adjustedStartDate || adjustedWindow.startDate;
                
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{suggestion.plantName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-3">
                            <Calendar size={12} />
                            {(() => {
                              // Usa array statico per evitare problemi di hydration SSR
                              const monthNamesShort = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 
                                                       'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
                              const formatDate = (date: Date) => {
                                const day = date.getDate();
                                const month = monthNamesShort[date.getMonth()];
                                return `${day} ${month}`;
                              };
                              return `${formatDate(displayStartDate)} - ${formatDate(adjustedWindow.endDate)}`;
                            })()}
                          </span>
                          <span className="flex items-center gap-3">
                            {selectedMethod === 'Seed' ? <Sprout size={12} /> : <Sprout size={12} />}
                            {selectedMethod === 'Seed' ? 'Semina' : 'Trapianto'}
                          </span>
                          <span className="text-green-600 font-medium">
                            {(suggestion.suitabilityScore * 100).toFixed(0)}% adatto
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-gray-600">Metodo:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMethods({ ...selectedMethods, [idx]: 'Seed' });
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              selectedMethod === 'Seed' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Seme
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMethods({ ...selectedMethods, [idx]: 'Seedling' });
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              selectedMethod === 'Seedling' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Piantina
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            setSearchQuery(suggestion.plantName);
                            handleSpecificSearch(new Event('submit') as any);
                          }}
                          className="mt-2 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          Pianifica questa pianta →
                        </button>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.category === 'Estivo' ? 'bg-orange-100 text-orange-800' :
                        suggestion.category === 'Primaverile' ? 'bg-green-100 text-green-800' :
                        suggestion.category === 'FogliaEstiva' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {suggestion.category}
                      </div>
                    </div>
                  </div>
                );
              })}
              {seasonalPlantSuggestions.length > 6 && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  +{seasonalPlantSuggestions.length - 6} altre piante disponibili
                </p>
              )}
            </div>
          )}
        </div>
      )}

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
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Suggeriti per Oggi</h2>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Finestra Semina</span>
                                <span className="text-sm font-semibold text-gray-700">{plant.plantingWindow}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100">
                                <span className="text-gray-400 block text-[10px] uppercase font-bold">Raccolta</span>
                                <span className="text-sm font-semibold text-gray-700">{plant.harvestTime}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => onAddToJournal(plant.name, `Suggerito per: ${plant.plantingWindow}`, '', 'Seed', todayStr, 'Sowing', undefined)}
                            className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-bold text-sm hover:bg-green-100 flex items-center justify-center gap-3"
                        >
                            <PlusCircle size={16} />
                            Aggiungi al Diario
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Planting Wizard - per colture personalizzate e piante normali */}
      {showPlantingWizard && wizardPlantData && (
        <PlantingWizard
          plantName={wizardPlantData.plantName}
          plantNotes={wizardPlantData.plantNotes}
          variety={wizardPlantData.variety}
          garden={garden}
          onComplete={(data) => {
            // Prepara le note complete
            let notes = data.notes || '';
            if (wizardPlantData.plantNotes) {
              notes = wizardPlantData.plantNotes + (notes ? '\n' + notes : '');
            }
            
            // Prepara additionalData
            const additionalData: any = {
              initialQuantity: data.quantity,
              currentQuantity: data.quantity,
              locationType: data.locationType,
              season: data.season
            };
            
            if (data.selectedSeedPacketId) {
              additionalData.selectedSeedPacketId = data.selectedSeedPacketId;
            }

            // Chiama onAddToJournal
            onAddToJournal(
              data.plantName,
              notes,
              data.variety,
              data.method,
              data.date,
              data.taskType,
              additionalData
            );
            
            // Chiudi wizard
            setShowPlantingWizard(false);
            setWizardPlantData(null);
          }}
          onCancel={() => {
            setShowPlantingWizard(false);
            setWizardPlantData(null);
          }}
        />
      )}

      {/* AI Planning Wizard Modal */}
      {showAIWizard && (
        <AIPlanningWizard
          garden={garden}
          onPlanGenerated={handlePlanGenerated}
          onClose={() => setShowAIWizard(false)}
        />
      )}

      {/* Plan Preview Modal */}
      {showPlanPreview && generatedPlan && (
        <PlanPreviewModal
          plan={generatedPlan}
          onConfirm={handlePlanConfirm}
          onReject={handlePlanReject}
          onConsultOnly={handleConsultOnly}
          isOpen={showPlanPreview}
        />
      )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-5">
        {/* Daily Tip */}
        <DailyTip 
          tip={`Nella tua zona${garden.coordinates ? ` (${garden.name})` : ''}, il periodo ideale per seminare ${specificResult?.name || 'pomodori'} è tra Febbraio e Marzo in semenzaio protetto.`}
          location={garden.name}
        />

        {/* Companion Plants */}
        {specificResult && (
          <CompanionPlants />
        )}

        {/* Plant Expectations */}
        {specificResult && (
          <PlantExpectations 
            harvestDays={specificResult.harvestWindow || '80-100 giorni'}
          />
        )}
        </div>
      </div>
      
      {/* AI Chat */}
      <PlannerAIChat
        garden={garden}
        tasks={tasks}
        isOpen={showAIChat}
        onToggle={() => setShowAIChat(!showAIChat)}
      />
    </div>
  );
};

export default Planner;
