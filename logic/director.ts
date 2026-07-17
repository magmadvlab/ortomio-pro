'use client';

import type {
  DailyPlan,
  Garden,
  GardenTask,
  DirectorPrompt,
  UrgentAlert,
  LifecycleTask,
  NutrientTask,
  HealthTask,
  ClimateWarning,
  LunarAdvice,
  UserProfile,
  PlantMasterSheet,
  MechanicalWorkTask,
  TreePruningTask,
  SeedPacket,
  FertilizerApplicationLogDB,
  TreatmentRecordDB
} from '../types';
import { getWeatherForecast, getWeatherForecast7Days, WeatherForecast } from '../services/weatherService';
import { checkLifecycleStatus, LifecycleAdvice } from './lifecycleEngine';
import { calculateNutrientNeeds, NutrientAdvice } from './nutrientEngine';
import { calculateHealthStrategy, HealthAdvice, calculateWindEffect } from './healthEngine';
import { calculateMoonPhase, isIdealPhaseFor, getNextLunarWindows, getNextIdealDate } from './lunarCalendar';
import { getMasterSheetSync } from '../services/plantMasterService';
import { isCustomCrop } from '../services/taskCompletionHook';
import { generateSuggestions, calculatePlantingTiming, calculateHarvestTiming } from '../services/learningEngine';
import { getActivePlants } from '../services/taskCalculationService';
import { adjustIrrigationForRain } from './rainManager';
import { calculateFertigationPlan } from './fertigationEngine';
import { getPreventiveMeasures } from './diseaseDiagnosisEngine';
import { calculateIrrigationDesignSuggestions } from './irrigationDesignEngine';
// Specialized crop engines (Pro Features)
import { calculateStrawberryTasks, StrawberryTaskAdvice } from './strawberryEngine';
import { calculateFruitTreeTasks, FruitTreeTaskAdvice } from './fruitTreeEngine';
import { calculateAromaticTasks, AromaticTaskAdvice } from './aromaticEngine';
import { calculateOliveTasks, OliveTaskAdvice, isMillingUrgent } from './oliveEngine';
import { calculateVineTasks, VineTaskAdvice, isWinemakingUrgent } from './vineEngine';
import { calculateExoticFruitTasks, ExoticFruitTaskAdvice } from './exoticFruitEngine';
import { calculateRaspberryTasks, RaspberryTaskAdvice } from './raspberryEngine';
import { StrawberryCrop } from '../types/strawberry';
import { FruitTreeCrop } from '../types/fruitTree';
import { AromaticMedicinalCrop } from '../types/aromatic';
import { OliveCrop } from '../types/olive';
import { VineCrop } from '../types/vine';
import { ExoticFruitCrop } from '../types/exoticFruit';
import { RaspberryCrop } from '../types/raspberry';
// Advanced growing systems engines (Pro Features)
import { generateHydroponicSuggestions, HydroponicTaskAdvice } from './hydroponicDirector';
import { generateAquaponicSuggestions, AquaponicTaskAdvice } from './aquaponicDirector';
import { generateAeroponicSuggestions, AeroponicTaskAdvice } from './aeroponicDirector';
import { generateGreenhouseSuggestions, GreenhouseTaskAdvice } from './greenhouseDirector';
import { calculateAccessoryTasks, AccessoryTaskAdvice } from './accessoriesEngine';
import { GardenAccessory } from '../types/accessories';
import { HydroponicReading, AquaponicReading } from '../types/indoorGrowing';
// Annual Planner integration
import { generateAnnualPlan, AnnualPlan, suggestSuccessions } from './annualPlannerEngine';
// Nuovi engine per lavorazioni meccaniche, potatura alberi, timeline calendario
import { calculateMechanicalWorkTasks, MechanicalWorkAdvice } from './mechanicalWorkEngine';
import { calculateTreePruningTasks, TreePruningAdvice } from './treePruningEngine';
import { generateTimelineFromSowing, convertToGardenTask } from './calendarTimelineEngine';
import { getPendingSuggestions, updateOrchestratorFromCompletion } from './taskSynchronizer';
// Solar Classification integration
import {
  calculateGardenSolarClassification,
  validatePlantCompatibility,
} from './solarClassificationHelper';
import { getAllHistoricalWeather } from '../services/historicalWeatherService';
import { SeedlingBatch } from '../services/seedlingService';
import { getSeasonForDate } from '../utils/seasonalAdjustment';
import { getAllReadyBatches, getReadyBatchesForPlant } from '../services/seedlingBatchHelper';
import { isReadyToTransplant } from '../services/seedlingService';
// Soil and Altitude utilities
import {
  calculateSoilWarmingDelay,
  calculateSoilHeatingRate,
  isSoilReadyForPlanting,
  getSoilCompatibility,
  adjustDateForSoilType,
} from '../utils/soilTemperatureUtils';
import {
  calculateEffectiveTemperature,
  calculateAltitudePlantingDelay,
  adjustPlantingDates,
} from '../utils/altitudeUtils';
import { getEffectiveTemperature } from '../services/sensorDataService';
// Memory Service
import {
  getZoneMemory,
  getBestPlantingDate,
  getRecurringProblems,
  getTreeMemory,
} from '../services/gardenMemoryService';
// FERTILIZER, TILLAGE, PHYTO Engines
import { suggestFertilizerProduct, FertilizerRecommendation } from './fertilizerEngine';
import { checkLowStock as checkFertilizerStock, getFertilizerAlerts } from '../services/fertilizerInventoryService';
import { suggestTillageWork, calculateTemperaTiming } from './tillageEngine';
import { getSoilState } from '../services/soilStateService';
import { suggestPhytoProduct, checkTreatmentTiming } from './phytoEngine';
import { getActiveSafetyIntervals } from '../services/treatmentRegistryService';
import { assessPlantingWeatherWindow } from './plantingWeatherDecisionEngine'

const normalizeWeatherForecastEntry = (entry: any): WeatherForecast => ({
  date:
    entry?.date instanceof Date
      ? entry.date.toISOString()
      : typeof entry?.date === 'string'
        ? entry.date
        : new Date().toISOString(),
  tempMin: Number(entry?.tempMin ?? entry?.temp_min ?? entry?.temp ?? 0),
  tempMax: Number(entry?.tempMax ?? entry?.temp_max ?? entry?.temp ?? 0),
  temp:
    entry?.temp !== undefined
      ? Number(entry.temp)
      : Number(entry?.tempMax ?? entry?.temp_max ?? entry?.tempMin ?? entry?.temp_min ?? 0),
  condition: String(entry?.condition ?? 'unknown'),
  rainMm: Number(entry?.rainMm ?? entry?.precipitation ?? entry?.rainForecastMm ?? 0),
  rainForecastMm: Number(entry?.rainForecastMm ?? entry?.precipitation ?? entry?.rainMm ?? 0),
  precipitation: Number(entry?.precipitation ?? entry?.rainMm ?? entry?.rainForecastMm ?? 0),
  windSpeed: Number(entry?.windSpeed ?? entry?.wind_speed ?? entry?.wind ?? 0),
  wind: Number(entry?.wind ?? entry?.windSpeed ?? entry?.wind_speed ?? 0),
  code: entry?.code ?? entry?.weathercode,
  weathercode: entry?.weathercode ?? entry?.code,
  temp_min: Number(entry?.temp_min ?? entry?.tempMin ?? entry?.temp ?? 0),
  temp_max: Number(entry?.temp_max ?? entry?.tempMax ?? entry?.temp ?? 0),
  wind_speed: Number(entry?.wind_speed ?? entry?.windSpeed ?? entry?.wind ?? 0),
  humidity: Number(entry?.humidity ?? 0),
  snowfall: entry?.snowfall !== undefined ? Number(entry.snowfall) : undefined,
  max_hourly_precipitation: Number(entry?.max_hourly_precipitation ?? 0),
  max_hourly_showers: Number(entry?.max_hourly_showers ?? 0),
  wind_gusts: Number(entry?.wind_gusts ?? entry?.wind_speed ?? entry?.windSpeed ?? 0),
  cape_max: Number(entry?.cape_max ?? 0),
  hourly_weather_codes: Array.isArray(entry?.hourly_weather_codes) ? entry.hourly_weather_codes : [],
  snowForecastMm:
    entry?.snowForecastMm !== undefined
      ? Number(entry.snowForecastMm)
      : entry?.snowfall !== undefined
        ? Number(entry.snowfall)
        : undefined,
})

const getCurrentWeatherForecast = async (
  coordinates?: { latitude: number; longitude: number }
): Promise<WeatherForecast | undefined> => {
  if (!coordinates) {
    return undefined
  }

  const forecast = await getWeatherForecast(coordinates.latitude, coordinates.longitude)
  return forecast.length > 0 ? normalizeWeatherForecastEntry(forecast[0]) : undefined
}

/**
 * Verifica urgenze climatiche (gelo, caldo estremo, siccità)
 * PRIORITÀ 1: Clima incontrollabile che blocca operazioni
 */
export const checkWeatherUrgency = async (
  coordinates?: { latitude: number; longitude: number }
): Promise<{ alerts: UrgentAlert[]; warnings: ClimateWarning[] }> => {
  const alerts: UrgentAlert[] = [];
  const warnings: ClimateWarning[] = [];

  if (!coordinates) {
    return { alerts, warnings };
  }

  try {
    const forecast = await getCurrentWeatherForecast(coordinates);
    
    if (!forecast) {
      return { alerts, warnings };
    }

    // Check gelo (frost) - CRITICO
    if (forecast.tempMin !== undefined && forecast.tempMin < 2) {
      alerts.push({
        type: 'Frost',
        message: `⚠️ GELATA PREVISTA: Temperatura minima ${forecast.tempMin.toFixed(1)}°C`,
        action: 'Copri immediatamente le piante sensibili con teli o sposta i vasi al riparo',
        blockOperations: true
      });
    }

    // Check caldo estremo
    if (forecast.tempMax !== undefined && forecast.tempMax > 35) {
      alerts.push({
        type: 'Heat',
        message: `🌡️ CALDO ESTREMO: Temperatura massima ${forecast.tempMax.toFixed(1)}°C`,
        action: 'Aumenta irrigazioni, ombreggia piante sensibili, evita trapianti',
        blockOperations: false
      });
    }

    // Check siccità (nessuna pioggia prevista)
    const rainForecastMm = forecast.rainForecastMm ?? 0;

    if (rainForecastMm < 1) {
      warnings.push({
        type: 'Rain',
        severity: 'Medium',
        message: 'Nessuna pioggia prevista nei prossimi giorni',
        recommendation: 'Programma irrigazioni regolari, considera pacciamatura per trattenere umidità'
      });
    } else if (rainForecastMm > 20) {
      warnings.push({
        type: 'Rain',
        severity: 'High',
        message: `Pioggia intensa prevista: ${rainForecastMm.toFixed(1)}mm`,
        recommendation: 'Evita trattamenti fogliari, verifica drenaggio, sospendi irrigazioni'
      });
    }

    // Warning temperatura
    if (forecast.tempMin !== undefined && forecast.tempMin < 8) {
      warnings.push({
        type: 'Temperature',
        severity: 'Medium',
        message: `Temperature basse previste: minima ${forecast.tempMin.toFixed(1)}°C`,
        recommendation: 'Proteggi piante sensibili, evita trapianti fino a riscaldamento'
      });
    }

  } catch (error) {
    console.error('Error checking weather urgency:', error);
  }

  return { alerts, warnings };
};

/**
 * Applica modificatori per tipo di terreno ai consigli
 * PRIORITÀ 3: Come fare le operazioni in base al terreno
 */
const applySoilModifier = (
  advice: NutrientAdvice | HealthAdvice,
  soilType?: Garden['soilType']
): string => {
  if (!soilType || soilType === 'Loamy') {
    return '';
  }

  if (soilType === 'Sandy') {
    return '⚠️ Suolo Sabbioso: Dividi le dosi a metà e applica con frequenza doppia. Usa pacciamatura.';
  }

  if (soilType === 'Clay') {
    return '⚠️ Suolo Argilloso: Puoi dare dosi piene ma meno frequentemente. Importante: sarchiatura post-applicazione.';
  }

  return '';
};

/**
 * Applica aggiustamenti per tipo terreno e altitudine a una data di impianto
 * Combina ritardo altitudine + correzione tipo terreno
 * 
 * @param garden - Giardino con informazioni terreno e altitudine
 * @param baseDate - Data base di semina/trapianto
 * @param plantType - Tipo di pianta per calcolare ritardo altitudine differenziato
 * @returns Data ottimale aggiustata
 */
function applySoilAndAltitudeAdjustments(
  garden: Garden,
  baseDate: Date,
  plantType?: 'early' | 'standard' | 'late'
): Date {
  let adjustedDate = new Date(baseDate);

  // 1. Applica ritardo altitudine (se presente)
  if (garden.altitudeMeters && garden.altitudeMeters > 200) {
    const altitudeDelay = calculateAltitudePlantingDelay(
      garden.altitudeMeters,
      plantType || 'standard'
    );
    adjustedDate.setDate(adjustedDate.getDate() + altitudeDelay);
  }

  // 2. Applica correzione tipo terreno (anticipo/ritardo riscaldamento)
  const soilDelay = calculateSoilWarmingDelay(garden.soilType);
  adjustedDate.setDate(adjustedDate.getDate() + soilDelay);

  return adjustedDate;
}

/**
 * Determina tipo pianta per calcolo ritardo altitudine
 */
function getPlantTypeForAltitude(plantName: string): 'early' | 'standard' | 'late' {
  const nameUpper = plantName.toUpperCase();
  
  // Piante precoci
  const earlyPlants = ['LATTUGA', 'INSALATA', 'RUCOLA', 'SPINACIO', 'RAVANELLO', 'RAPANELLO'];
  if (earlyPlants.some(name => nameUpper.includes(name))) {
    return 'early';
  }
  
  // Piante tardive
  const latePlants = ['POMODORO', 'PEPERONE', 'MELANZANA', 'ZUCCHINA', 'CETRIOLO'];
  if (latePlants.some(name => nameUpper.includes(name))) {
    return 'late';
  }
  
  return 'standard';
}

/**
 * Determina priorità complessiva del piano giornaliero
 */
const determineOverallPriority = (
  alerts: UrgentAlert[],
  lifecycleTasks: LifecycleTask[]
): 'Critical' | 'High' | 'Medium' | 'Low' => {
  if (alerts.some(a => a.blockOperations)) {
    return 'Critical';
  }
  if (alerts.length > 0 || lifecycleTasks.some(t => t.priority === 'Critical' || t.priority === 'High')) {
    return 'High';
  }
  if (lifecycleTasks.length > 0) {
    return 'Medium';
  }
  return 'Low';
};

/**
 * Genera consiglio lunare per il giorno
 * PRIORITÀ 5: Ottimizzazione tradizionale
 */
const generateLunarAdvice = (currentDate: Date): LunarAdvice | undefined => {
  const moonInfo = calculateMoonPhase(currentDate);
  
  const idealFor: string[] = [];
  
  if (moonInfo.isWaxing) {
    idealFor.push('Semina foglie/frutti', 'Trapianto', 'Raccolta frutti');
  }
  if (moonInfo.isWaning) {
    idealFor.push('Semina radici', 'Raccolta foglie', 'Potatura');
  }

  return {
    phase: moonInfo.phase,
    phaseName: moonInfo.name,
    advice: moonInfo.isWaxing 
      ? 'Luna Crescente: ideale per crescita parte aerea'
      : 'Luna Calante: ideale per crescita radici',
    idealFor
  };
};

/**
 * Director - Orchestratore Centrale
 * Combina tutti i motori in un unico piano giornaliero ottimizzato
 * 
 * Gerarchia Priorità:
 * 1. Clima (incontrollabile, blocca operazioni)
 * 2. Ciclo Vitale (cosa fare)
 * 3. Terreno (come farlo)
 * 4. Salute (prevenzione)
 * 5. Tradizione (ottimizzazione lunare)
 */
export const getDailyGardenPlan = async (
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date(),
  annualPlan?: AnnualPlan,
  userProfile?: UserProfile,
  seedlingBatches?: SeedlingBatch[],
  storageProvider?: any, // IStorageProvider - opzionale per retrocompatibilità
  seedInventory?: SeedPacket[] // Banca semi per suggerimenti
): Promise<DailyPlan> => {
  const primaryArchetypeId =
    garden.primaryCrop?.archetypeId ??
    (garden.gardenType === 'Vineyard'
      ? 'L1'
      : garden.gardenType === 'OliveGrove'
        ? 'L2'
        : garden.gardenType === 'Orchard'
          ? 'L3'
          : 'MIX');

  const isWoodyCrop =
    primaryArchetypeId === 'A12' ||
    primaryArchetypeId === 'L1' ||
    primaryArchetypeId === 'L2' ||
    primaryArchetypeId === 'L3' ||
    primaryArchetypeId === 'L3_CITRUS' ||
    primaryArchetypeId === 'L3_STONE' ||
    primaryArchetypeId === 'L3_POME' ||
    primaryArchetypeId === 'L3_EXOTIC';

  // PRIORITÀ 1: CLIMA (incontrollabile, blocca operazioni)
  const { alerts: urgentAlerts, warnings: climateWarnings } = await checkWeatherUrgency(
    garden.coordinates
  );

  // PRIORITÀ 1.5: CLASSIFICAZIONE SOLARE (coordinamento variabili)
  let solarClassification = null;
  if (garden.coordinates) {
    try {
      // Carica dati meteo storici per calcoli temperatura
      let historicalWeather = null;
      try {
        historicalWeather = await getAllHistoricalWeather(
          garden.coordinates.latitude,
          garden.coordinates.longitude,
          currentDate.getFullYear()
        );
      } catch (weatherError) {
        console.warn('Could not load historical weather, continuing without temperature adjustments:', weatherError);
        // Continua senza dati meteo storici
      }
      
      solarClassification = await calculateGardenSolarClassification(
        garden, 
        currentDate,
        historicalWeather,
        seedlingBatches
      );
    } catch (error) {
      console.error('Error calculating solar classification:', error);
      // Continua senza classificazione solare se errore
    }
  }

  // PRIORITÀ 2: CICLO VITALE (cosa fare)
  const lifecycleTasks: LifecycleTask[] = [];
  const nutrientTasks: NutrientTask[] = [];
  const healthTasks: HealthTask[] = [];
  const warnings: ClimateWarning[] = [...climateWarnings]; // Inizia con i warning climatici

  // PRIORITÀ 0: BASELINE STAGIONALE (proattiva, anche senza task)
  const baselinePrompts: DirectorPrompt[] = [];

  const todayIso = currentDate.toISOString().split('T')[0];
  const month = currentDate.getMonth() + 1;
  const latitude = garden.coordinates?.latitude ?? 0;

  // Storage-backed logs (best-effort): fertilizer applications + treatments
  let fertilizerApplicationLogs: FertilizerApplicationLogDB[] = [];
  let treatmentLogs: TreatmentRecordDB[] = [];
  try {
    if (storageProvider?.getFertilizerApplicationLogs) {
      fertilizerApplicationLogs =
        (await storageProvider.getFertilizerApplicationLogs(garden.id)) || [];
    }
  } catch (error) {
    console.warn('Could not load fertilizer application logs:', error);
  }

  try {
    if (storageProvider?.getTreatments) {
      treatmentLogs = (await storageProvider.getTreatments(garden.id)) || [];
    }
  } catch (error) {
    console.warn('Could not load treatment logs:', error);
  }

  const hasOpenTask = (taskType: GardenTask['taskType']) =>
    tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === taskType &&
        !t.completed
    );

  const hasOpenTaskWithPlantName = (taskType: GardenTask['taskType'], plantNameMatch: string) =>
    tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === taskType &&
        !t.completed &&
        (t.plantName || '').toLowerCase().includes(plantNameMatch.toLowerCase())
    );

  const hasOpenIndoorSowing = () =>
    tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === 'Sowing' &&
        !t.completed &&
        (t.locationType === 'Tray' || t.suggestedBy === 'director_baseline')
    );

  const hasRecentCompletedIndoorSowing = (daysBack: number = 14) => {
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === 'Sowing' &&
        t.completed &&
        new Date(t.date) >= cutoffDate &&
        (t.locationType === 'Tray' || t.suggestedBy === 'director_baseline')
    );
  };

  const hasRecentFertilizerApplication = (daysBack: number, matchText?: string) => {
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return fertilizerApplicationLogs.some((l) => {
      if ((l as any).garden_id !== garden.id) return false;
      const when = new Date((l as any).application_date);
      if (when < cutoffDate) return false;

      if (!matchText) return true;
      const hay = `${(l as any).product_name || ''} ${(l as any).product_id || ''} ${l.notes || ''}`.toLowerCase();
      return hay.includes(matchText.toLowerCase());
    });
  };

  const getUpcomingFertilizerRepeats = (daysAhead: number) => {
    const to = new Date(currentDate);
    to.setDate(to.getDate() + daysAhead);

    return fertilizerApplicationLogs
      .filter((l) => (l as any).garden_id === garden.id)
      .filter((l) => !!(l as any).next_application_date)
      .filter((l) => {
        const next = new Date((l as any).next_application_date as string);
        return next >= currentDate && next <= to;
      })
      .sort((a, b) =>
        new Date((a as any).next_application_date as string).getTime() -
        new Date((b as any).next_application_date as string).getTime()
      );
  };

  const hasRecentTreatment = (daysBack: number, matchText?: string) => {
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return treatmentLogs.some((t) => {
      if ((t as any).garden_id !== garden.id) return false;
      const when = new Date((t as any).treatment_date);
      if (when < cutoffDate) return false;

      if (!matchText) return true;
      const hay = `${(t as any).product_name || ''} ${(t as any).active_ingredient || ''} ${(t as any).reason || ''} ${t.notes || ''}`.toLowerCase();
      return hay.includes(matchText.toLowerCase());
    });
  };

  // Check se esiste task completato negli ultimi N giorni (evita riproposte inutili)
  const hasRecentCompletedTask = (
    taskType: GardenTask['taskType'],
    daysBack: number = 30,
    plantNameMatch?: string
  ) => {
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === taskType &&
        t.completed &&
        new Date(t.date) >= cutoffDate &&
        (!plantNameMatch || t.plantName?.toLowerCase().includes(plantNameMatch.toLowerCase()))
    );
  };

  // Ottieni forecast 7 giorni per gestione pioggia (usato anche per baseline meteo-aware)
  let forecast7Days: WeatherForecast[] = [];
  if (garden.coordinates) {
    try {
      const rawForecast =
        (await getWeatherForecast7Days(
          garden.coordinates.latitude,
          garden.coordinates.longitude
        )) || [];
      forecast7Days = rawForecast.map(normalizeWeatherForecastEntry);
    } catch (error) {
      console.warn('Could not load 7-day forecast:', error);
    }
  }

  const next48hRainMm = forecast7Days
    .slice(0, 2)
    .reduce((sum, f) => sum + (f.rainForecastMm || 0), 0);
  const isSoilWorkRiskyNow = next48hRainMm >= 8;

  // Rivaluta ogni giorno le semine e i trapianti programmati quando entrano
  // nell'orizzonte meteo utile. La data non e' considerata definitiva finche'
  // anche i due giorni successivi non risultano compatibili con l'attecchimento.
  if (forecast7Days.length > 0) {
    const scheduledPlantings = tasks.filter((task) =>
      task.gardenId === garden.id &&
      !task.completed &&
      (task.taskType === 'Sowing' || task.taskType === 'Transplant') &&
      (task.schedulingType === 'Scheduled' || !!task.scheduledDate) &&
      !!(task.scheduledDate || task.date)
    )

    for (const task of scheduledPlantings) {
      const scheduledDate = String(task.scheduledDate || task.date).slice(0, 10)
      const master = getMasterSheetSync(task.plantName)
      const operation = task.taskType === 'Transplant' ? 'transplant' : 'direct_sowing'
      const assessment = assessPlantingWeatherWindow({
        operation,
        requestedDate: scheduledDate,
        forecast: forecast7Days,
        cropMinTemperature: operation === 'transplant'
          ? master?.transplanting?.minTemp
          : master?.germination?.minTemp,
        cropMaxTemperature: master?.germination?.maxTemp,
      })

      if (assessment.status === 'POSTPONE') {
        lifecycleTasks.push({
          taskId: `weather-reschedule-${task.id}-${scheduledDate}`,
          plantName: task.plantName,
          phase: task.taskType === 'Transplant' ? 'Transplanting' : 'Sowing',
          message: `⚠️ ${task.taskType === 'Transplant' ? 'Trapianto' : 'Semina'} del ${new Date(`${scheduledDate}T12:00:00`).toLocaleDateString('it-IT')} da rimandare. ${assessment.headline}. ${assessment.reasons.join(' ')}`,
          priority: 'Critical',
          action: assessment.recommendedDate
            ? `Sposta l’evento al ${new Date(`${assessment.recommendedDate}T12:00:00`).toLocaleDateString('it-IT')} e ricontrolla il meteo il giorno precedente.`
            : 'Non mettere in campo: mantieni protette le piantine o conserva i semi e attendi una nuova finestra meteo.',
        })
      }
    }
  }

  // Nota: baseline iniziale solo per orto/misto (non legnose)
  if (!isWoodyCrop) {
    if (isSoilWorkRiskyNow) {
      const temperaBucket = `${currentDate.getFullYear()}-${String(month).padStart(2, '0')}-${Math.floor(
        (currentDate.getDate() - 1) / 3
      )}`;

      baselinePrompts.push({
        id: `seasonal_baseline_tempera_${garden.id}_${temperaBucket}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: 'Terreno bagnato: aspetta la tempera',
        body: `Nei prossimi 1-2 giorni sono previsti circa ${Math.round(next48hRainMm)} mm di pioggia. Evita lavorazioni e concimazioni di fondo su terreno bagnato: rischi compattamento e marciumi. Pianifica appena il terreno torna in tempera.`,
        options: [
          {
            id: 'dismiss',
            label: 'Ok, mi regolo',
            actionType: 'dismiss'
          }
        ]
      });
    }

    // Fine Dicembre / Gennaio: pulizia residui
    if (month === 12 || month === 1) {
      const hasOpenClearingBaselineTasks =
        hasOpenTaskWithPlantName('Clearing', 'pulizia') ||
        hasOpenTaskWithPlantName('Clearing', 'ripristino') ||
        hasOpenTaskWithPlantName('Clearing', 'pulizia terreno');

      const hasRecentClearingBaselineTasks =
        hasRecentCompletedTask('Clearing', 60, 'pulizia') ||
        hasRecentCompletedTask('Clearing', 60, 'ripristino') ||
        hasRecentCompletedTask('Clearing', 60, 'pulizia terreno');

      if (!hasOpenClearingBaselineTasks && !hasRecentClearingBaselineTasks) {
        const basePriority: DirectorPrompt['priority'] = isSoilWorkRiskyNow ? 'Medium' : 'High';
        const weatherNote = isSoilWorkRiskyNow
          ? `\n\nNota meteo: con pioggia prevista (~${Math.round(next48hRainMm)} mm/48h) fai solo rimozione residui "leggera" e rimanda lavorazioni pesanti.`
          : '';
        baselinePrompts.push({
          id: `seasonal_baseline_clearing_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: basePriority,
          title: 'Pulizia e ripristino dell’orto',
          body: `Rimuovi residui delle colture precedenti, erbacce e pacciamature vecchie. È il momento migliore per ripartire “pulito” prima della preparazione del suolo.${weatherNote}`,
          options: [
            {
              id: 'create_task',
              label: 'Aggiungi task: Pulizia terreno',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Pulizia terreno (baseline stagionale)',
                taskType: 'Clearing',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_baseline',
                notes: 'Rimuovi residui vecchio orto, erbacce, pacciamature deteriorate. Smaltisci o compost se idoneo.'
              }
            },
            {
              id: 'dismiss',
              label: 'Già fatto / non serve',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }

    // Dicembre -> Marzo: gestione scarti (verde vs legna/ramaglie)
    if (month === 12 || month === 1 || month === 2 || month === 3) {
      const hasOpenWasteTasks =
        hasOpenTaskWithPlantName('Mulching', 'gestione scarti') ||
        hasOpenTaskWithPlantName('Clearing', 'gestione legna') ||
        hasOpenTaskWithPlantName('Treatment', 'smaltimento materiale malato') ||
        hasOpenTaskWithPlantName('Treatment', 'disinfezione attrezzi');

      const hasRecentWasteTasks =
        hasRecentCompletedTask('Mulching', 30, 'gestione scarti') ||
        hasRecentCompletedTask('Clearing', 30, 'gestione legna') ||
        hasRecentCompletedTask('Treatment', 30, 'smaltimento materiale malato') ||
        hasRecentCompletedTask('Treatment', 30, 'disinfezione attrezzi');

      if (!hasOpenWasteTasks && !hasRecentWasteTasks) {
        baselinePrompts.push({
          id: `seasonal_baseline_waste_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'Medium',
          title: 'Gestione scarti dell’orto: compost o legna?',
          body: 'Separa gli scarti: (1) residui verdi/erbacei (piante annuali, foglie, erba) in genere compostabili; (2) legna/ramaglie (potature, fusti molto duri) da cippare/pacciamare, bruciare dove consentito o eventualmente vendere/regalare. Evita di compostare materiale con malattie importanti.',
          options: [
            {
              id: 'green_compost',
              label: 'Ho scarti verdi: avvio compost',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Gestione scarti verdi → compost',
                taskType: 'Mulching',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_baseline',
                notes: 'Avvia/integra cumulo compost: alterna “verdi” (azoto) e “secchi” (carbonio). Mantieni umido ma non fradicio. Se sospetti malattie, non compostare: smaltisci separatamente.'
              }
            },
            {
              id: 'woody_manage',
              label: 'Ho legna/ramaglie: cippato / brucio / vendo',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Gestione legna/ramaglie (potature/scarti duri)',
                taskType: 'Clearing',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_baseline',
                notes: 'Se possibile cippa e usa come pacciamatura/camminamenti. In alternativa brucia solo dove consentito e in sicurezza, oppure valuta vendita/regalo. Non lasciare cumuli umidi vicino alle colture (rischio parassiti/muffe).' 
              }
            },
            {
              id: 'diseased_material',
              label: 'Ho materiale malato: NON compostare (smaltimento separato)',
              actionType: 'create_task',
              createTasks: [
                {
                  gardenId: garden.id,
                  plantName: 'Smaltimento materiale malato (non compostare)',
                  taskType: 'Treatment',
                  date: todayIso,
                  completed: false,
                  isSuggested: true,
                  suggestedDate: todayIso,
                  suggestedBy: 'director_baseline',
                  notes: 'Se sospetti o vedi malattie importanti (muffe, virosi, marciumi diffusi), NON compostare: smaltisci separatamente secondo regole locali. Rimuovi residui infetti dall’area coltivata.'
                },
                {
                  gardenId: garden.id,
                  plantName: 'Disinfezione attrezzi e vassoi (post materiale malato)',
                  taskType: 'Treatment',
                  date: todayIso,
                  completed: false,
                  isSuggested: true,
                  suggestedDate: todayIso,
                  suggestedBy: 'director_baseline',
                  notes: 'Disinfetta attrezzi, forbici, tutori, vassoi e contenitori usati (es. soluzione candeggina diluita o prodotti idonei). Lava mani/guanti e riduci contaminazioni incrociate. Smaltisci i rifiuti infetti separatamente.'
                }
              ]
            },
            {
              id: 'dismiss',
              label: 'Più tardi',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }

    // Gennaio: concimazione di fondo
    if (month === 1 || month === 2) {
      const hasOpenBaseFertilizationTasks =
        hasOpenTaskWithPlantName('Fertilize', 'concimazione di fondo') ||
        hasOpenTaskWithPlantName('Fertilize', 'fondo');

      const hasRecentBaseFertilizationTasks =
        hasRecentCompletedTask('Fertilize', 45, 'concimazione di fondo') ||
        hasRecentCompletedTask('Fertilize', 45, 'fondo');

      const hasRecentBaseFertilizationLog =
        hasRecentFertilizerApplication(45, 'fondo') ||
        hasRecentFertilizerApplication(45, 'compost') ||
        hasRecentFertilizerApplication(45, 'letame');

      if (!hasOpenBaseFertilizationTasks && !hasRecentBaseFertilizationTasks && !hasRecentBaseFertilizationLog) {
        const basePriority: DirectorPrompt['priority'] = isSoilWorkRiskyNow ? 'Low' : 'Medium';
        const weatherNote = isSoilWorkRiskyNow
          ? `\n\nNota meteo: con pioggia prevista (~${Math.round(next48hRainMm)} mm/48h) rimanda la concimazione di fondo a terreno in tempera.`
          : '';
        baselinePrompts.push({
          id: `seasonal_baseline_fondo_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: basePriority,
          title: 'Concimazione di fondo (preparazione suolo)',
          body: `Se vuoi impostare un orto estivo produttivo, prepara ora il suolo con ammendante/compost maturo e una lavorazione leggera, evitando di lavorare su terreno bagnato.${weatherNote}`,
          options: [
            {
              id: 'create_task',
              label: 'Aggiungi task: Concimazione di fondo',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Concimazione di fondo (baseline stagionale)',
                taskType: 'Fertilize',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_baseline',
                notes: 'Distribuisci compost maturo o letame pellettato e incorpora superficialmente. Evita lavorazioni con terreno troppo bagnato (non in tempera).' 
              }
            },
            {
              id: 'dismiss',
              label: 'Più avanti',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }

    // Promemoria: ripetizione concimazioni programmate (da log next_application_date)
    const upcomingRepeats = getUpcomingFertilizerRepeats(3);
    if (upcomingRepeats.length > 0) {
      const next = upcomingRepeats[0];
      const nextDateIso = (next as any).next_application_date as string || todayIso;
      const productLabel = (next as any).product_name || (next as any).product_id;

      const hasOpenRepeatTask =
        hasOpenTaskWithPlantName('Fertilize', 'ripeti fertilizzazione') ||
        (productLabel ? hasOpenTaskWithPlantName('Fertilize', productLabel) : false);

      if (!hasOpenRepeatTask) {
        baselinePrompts.push({
          id: `seasonal_baseline_fertilizer_repeat_${garden.id}_${nextDateIso}`,
          category: 'seasonal_baseline',
          priority: 'Medium',
          title: 'Promemoria: ripeti fertilizzazione',
          body: `Hai una fertilizzazione programmata${productLabel ? ` (${productLabel})` : ''} entro pochi giorni (data: ${new Date(nextDateIso).toLocaleDateString('it-IT')}). Se il terreno è bagnato o è prevista pioggia, preferisci rimandare a terreno in tempera o usare fertirrigazione se adatta.`,
          options: [
            {
              id: 'create_task_repeat',
              label: `Aggiungi task (data: ${new Date(nextDateIso).toLocaleDateString('it-IT')})`,
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: `Ripeti fertilizzazione${productLabel ? `: ${productLabel}` : ''}`,
                taskType: 'Fertilize',
                date: nextDateIso,
                completed: false,
                isSuggested: true,
                suggestedDate: nextDateIso,
                suggestedBy: 'director_fertilizer',
                notes: `Promemoria generato da log fertilizzazione. Prodotto: ${productLabel || 'n/d'}. Log id: ${next.id}. Se vuoi mantenere lo storico, registra l'applicazione dopo averla eseguita.`
              }
            },
            {
              id: 'dismiss',
              label: 'Più tardi',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }

    // Prevenzione base (zeolite/caolino/neem/rame) - meteo/season-aware, dedupe via treatment logs
    // Nota: è volutamente "soft" e non blocca operazioni.
    if (month >= 3 && month <= 9) {
      const alreadyDidCaolino = hasRecentTreatment(14, 'caolino');
      const alreadyDidZeolite = hasRecentTreatment(14, 'zeolite');
      const alreadyDidNeem = hasRecentTreatment(14, 'neem');
      const alreadyDidRame = hasRecentTreatment(14, 'rame');

      const rainySoon = next48hRainMm >= 5;
      const hotSeason = month >= 5 && month <= 8;

      if ((rainySoon || hotSeason) && !(alreadyDidCaolino && alreadyDidZeolite && alreadyDidNeem && alreadyDidRame)) {
        baselinePrompts.push({
          id: `seasonal_baseline_prevention_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: rainySoon ? 'Medium' : 'Low',
          title: 'Prevenzione (bio): zeolite/caolino/neem/rame',
          body: `In stagione ${hotSeason ? 'calda' : 'primaverile'}${rainySoon ? ` e con pioggia a breve (~${Math.round(next48hRainMm)} mm/48h)` : ''}, la prevenzione riduce stress e pressione di malattie/parassiti. Se usi questi prodotti, alterna e rispetta tempi di carenza su colture da raccolta.`,
          options: [
            {
              id: 'create_task_zeolite',
              label: alreadyDidZeolite ? 'Zeolite (già fatta di recente)' : 'Aggiungi task: Zeolite (fogliare)',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Prevenzione: Zeolite (fogliare)',
                taskType: 'Treatment',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_prevention',
                notes: 'Zeolite: barriera fisica, utile come prevenzione in periodi umidi. Applica al mattino/sera, evita pioggia imminente se possibile.'
              }
            },
            {
              id: 'create_task_caolino',
              label: alreadyDidCaolino ? 'Caolino (già fatto di recente)' : 'Aggiungi task: Caolino (barriera insetti/caldo)',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Prevenzione: Caolino',
                taskType: 'Treatment',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_prevention',
                notes: 'Caolino: barriera contro insetti e colpi di sole. Utile in estate. Richiede bagnatura uniforme; riapplica dopo piogge forti.'
              }
            },
            {
              id: 'create_task_neem',
              label: alreadyDidNeem ? 'Neem (già fatto di recente)' : 'Aggiungi task: Olio di Neem (preventivo)',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Prevenzione: Olio di Neem',
                taskType: 'Treatment',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_prevention',
                notes: 'Neem: utile su afidi/mosche bianche in prevenzione/prime fasi. Tratta la sera, evita pieno sole e fioriture molto attive. Ripeti dopo 7-10 giorni se necessario.'
              }
            },
            {
              id: 'create_task_rame',
              label: alreadyDidRame ? 'Rame (già fatto di recente)' : 'Aggiungi task: Rame (antifungino preventivo)',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Prevenzione: Rame (antifungino)',
                taskType: 'Treatment',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_prevention',
                notes: 'Rame: antifungino preventivo (peronospora/alternaria). Rispetta dosi e limiti annuali. Evita trattamenti se vento forte o pioggia immediata.'
              }
            },
            {
              id: 'dismiss',
              label: 'Più tardi',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }
  
    // Fine Gennaio -> Febbraio: semine indoor basate su banca semi disponibili
    if (month === 1 || month === 2) {
      if (!hasOpenIndoorSowing() && !hasRecentCompletedIndoorSowing(14)) {
        const indoorSpecies = ['pomodoro', 'peperoncino', 'melanzana', 'peperone'];

        const usableIndoorSeeds = (seedInventory || []).filter((seed: SeedPacket) => {
          const species = (seed.speciesName || '').toLowerCase();
          const isIndoorSpecies = indoorSpecies.includes(species);

          const currentQty = typeof seed.currentQuantity === 'number' ? seed.currentQuantity : undefined;
          const notEmpty = seed.quantityRemaining !== 'Empty' && currentQty !== 0;

          const expiryYear = typeof seed.expiryYear === 'number' ? seed.expiryYear : undefined;
          const notExpired = expiryYear === undefined || expiryYear >= currentDate.getFullYear();

          return isIndoorSpecies && notEmpty && notExpired;
        });

        const missingIndoorSpecies = indoorSpecies.filter((sp) => {
          const anyForSpecies = (seedInventory || []).some(
            (s: SeedPacket) => (s.speciesName || '').toLowerCase() === sp
          );
          const anyUsableForSpecies = usableIndoorSeeds.some(
            (s: SeedPacket) => (s.speciesName || '').toLowerCase() === sp
          );
          return !anyForSpecies || !anyUsableForSpecies;
        });

        if (usableIndoorSeeds.length > 0) {
          // Calcola prossime finestre lunari per semina FRUITING (pomodoro/peperoncino/melanzana)
          const lunarWindows = getNextLunarWindows('sowing', 'FRUITING', currentDate, 3);
          const currentMoonInfo = calculateMoonPhase(currentDate);

          // Ordina per priorità: peperoncino first (più lento), poi pomodoro
          const sorted = usableIndoorSeeds.sort((a: SeedPacket, b: SeedPacket) => {
            const aSpecies = (a.speciesName || '').toLowerCase();
            const bSpecies = (b.speciesName || '').toLowerCase();
            const aPrio = aSpecies === 'peperoncino' ? 0 : 1;
            const bPrio = bSpecies === 'peperoncino' ? 0 : 1;
            return aPrio - bPrio;
          });

          const bySpecies = sorted.reduce<Record<string, number>>((acc, seed) => {
            const sp = (seed.speciesName || '').toLowerCase();
            acc[sp] = (acc[sp] || 0) + 1;
            return acc;
          }, {});

          const speciesSummary = Object.entries(bySpecies)
            .map(([sp, count]) => `${sp.charAt(0).toUpperCase()}${sp.slice(1)} (${count})`)
            .join(', ');

          const hasPeperoncino = !!bySpecies['peperoncino'];

          // Genera info fase lunare per titolo e body
          let lunarInfo = '';
          let lunarTitle = '';
          const activeWindow = lunarWindows.find(w => w.isActive);

          if (activeWindow) {
            lunarTitle = ` 🌒 Luna ${activeWindow.phaseName} ATTIVA`;
            lunarInfo = `\n\n🌙 Fase Lunare: ${currentMoonInfo.name} (${activeWindow.phaseName}) fino al ${activeWindow.endDate.toLocaleDateString('it-IT')}.\n✅ Momento IDEALE per seminare piante da frutto (favorisce germinazione e sviluppo aereo)!`;
          } else if (lunarWindows.length > 0) {
            const nextWindow = lunarWindows[0];
            lunarTitle = ` (Prossima Luna Crescente: ${nextWindow.startDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })})`;
            lunarInfo = `\n\n🌙 Fase Lunare: ${currentMoonInfo.name} (Calante). Per semina ideale, aspetta Luna Crescente dal ${nextWindow.startDate.toLocaleDateString('it-IT')} (tra ${nextWindow.daysFromNow} giorni).`;
          }

          // Crea opzioni semina per OGGI + finestre lunari
          const seedOptions: any[] = [];

          // Se luna è attiva, mostra opzione "SEMINA OGGI"
          if (activeWindow) {
            seedOptions.push(...sorted.slice(0, 3).map((seed: SeedPacket) => ({
              id: `sow_today_${seed.id}`,
              label: `✅ OGGI: ${seed.speciesName} - ${seed.varietyName}`,
              actionType: 'create_task' as const,
              createTask: {
                gardenId: garden.id,
                plantName: seed.speciesName,
                variety: seed.varietyName,
                taskType: 'Sowing' as const,
                plantingMethod: 'Seed' as const,
                locationType: 'Tray' as const,
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_lunar',
                notes: `Semina indoor ${seed.varietyName} in ${currentMoonInfo.name} (ideale per piante da frutto). Sanifica vassoi, substrato leggero, tappetino riscaldante (22-26°C), luce LED/timer. Mantieni umidità costante.`
              }
            })));
          }

          // Aggiungi opzioni per prossime finestre lunari (max 2)
          lunarWindows.slice(0, 2).forEach((window, idx) => {
            if (!window.isActive && sorted.length > 0) {
              const seed = sorted[0]; // Usa primo seed (priorità peperoncino)
              const dateStr = window.startDate.toISOString().split('T')[0];
              seedOptions.push({
                id: `sow_lunar_window_${idx}_${seed.id}`,
                label: `${window.startDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}: ${seed.speciesName} - Luna Crescente (tra ${window.daysFromNow} gg)`,
                actionType: 'create_task' as const,
                createTask: {
                  gardenId: garden.id,
                  plantName: seed.speciesName,
                  variety: seed.varietyName,
                  taskType: 'Sowing' as const,
                  plantingMethod: 'Seed' as const,
                  locationType: 'Tray' as const,
                  date: dateStr,
                  completed: false,
                  isSuggested: true,
                  suggestedDate: dateStr,
                  suggestedBy: 'director_lunar',
                  notes: `Semina indoor ${seed.varietyName} pianificata per ${window.phaseName} (fase ideale per piante da frutto). Sanifica vassoi, substrato leggero, tappetino riscaldante (22-26°C), luce LED/timer.`
                }
              });
            }
          });

          const purchaseOption =
            missingIndoorSpecies.length > 0
              ? {
                  id: 'buy_seeds',
                  label: `Promemoria acquisto semi (${missingIndoorSpecies
                    .map((s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
                    .join(', ')})`,
                  actionType: 'create_task' as const,
                  createTask: {
                    gardenId: garden.id,
                    plantName: 'Promemoria acquisto semi (indoor)',
                    taskType: 'Treatment' as const,
                    date: todayIso,
                    completed: false,
                    isSuggested: true,
                    suggestedDate: todayIso,
                    suggestedBy: 'director_baseline',
                    notes: `Specie indoor senza semi utilizzabili (mancanti o scaduti): ${missingIndoorSpecies.join(
                      ', '
                    )}. Valuta acquisto e inserimento in banca semi.`
                  }
                }
              : undefined;

          baselinePrompts.push({
            id: `seasonal_baseline_indoor_sowing_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: activeWindow ? 'High' : (latitude >= 39 ? 'High' : 'Medium'),
            title: `Semine Indoor${lunarTitle}`,
            body: `Hai semi indoor utilizzabili per: ${speciesSummary}. ${hasPeperoncino ? 'Il peperoncino ha tempi lunghi: conviene partire ora.' : 'Gennaio-Febbraio è ideale per partire indoor.'}${lunarInfo}\n\nScegli quando seminare:`,
            options: [
              ...seedOptions,
              ...(purchaseOption ? [purchaseOption] : []),
              {
                id: 'dismiss',
                label: 'Ignora calendario lunare',
                actionType: 'dismiss'
              }
            ]
          });
        } else {
          // Fallback se banca semi vuota (come prima, ma solo 1 opzione generica)
          baselinePrompts.push({
            id: `seasonal_baseline_indoor_sowing_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: 'Low',
            title: 'Semine indoor: peperoncino e solanacee',
            body: 'Gennaio-Febbraio è il momento per semine indoor di peperoncino, pomodoro, melanzana. Nota: non hai semi in banca, valuta acquisto.',
            options: [
              {
                id: 'buy_seeds',
                label: 'Promemoria acquisto semi',
                actionType: 'create_task',
                createTask: {
                  gardenId: garden.id,
                  plantName: 'Promemoria acquisto semi (indoor)',
                  taskType: 'Treatment',
                  date: todayIso,
                  completed: false,
                  isSuggested: true,
                  suggestedDate: todayIso,
                  suggestedBy: 'director_baseline',
                  notes: 'Valuta acquisto semi per semine indoor (peperoncino/pomodoro/melanzana/peperone) e inseriscili in banca semi.'
                }
              },
              {
                id: 'dismiss',
                label: 'Ok, valuto',
                actionType: 'dismiss'
              }
            ]
          });
        }
      }
    }

    // Febbraio: controllo impianto/attrezzature (pre-irrigazione)
    if (month === 2 || month === 3) {
      const hasOpenEquipmentOrIrrigationTasks =
        hasOpenTaskWithPlantName('Treatment', 'controllo impianto') ||
        hasOpenTaskWithPlantName('Treatment', 'attrezzature') ||
        hasOpenTaskWithPlantName('Treatment', 'irrigaz');

      const hasRecentEquipmentOrIrrigationTasks =
        hasRecentCompletedTask('Treatment', 60, 'controllo impianto') ||
        hasRecentCompletedTask('Treatment', 60, 'attrezzature') ||
        hasRecentCompletedTask('Treatment', 60, 'irrigaz');

      if (!hasOpenEquipmentOrIrrigationTasks && !hasRecentEquipmentOrIrrigationTasks) {
        baselinePrompts.push({
          id: `seasonal_baseline_equipment_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'Low',
          title: 'Controllo attrezzature e irrigazione',
          body: 'Controlla tubi, raccordi, valvole, timer e accessori. Se trovi crepe/occlusioni ora è il momento migliore per sostituire e pianificare l’impianto prima dei trapianti.',
          options: [
            {
              id: 'create_task',
              label: 'Aggiungi task: Controllo impianto/attrezzi',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Controllo impianto/attrezzature (baseline stagionale)',
                taskType: 'Treatment',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_baseline',
                notes: 'Verifica tubi e raccordi, eventuali perdite, filtri, timer, valvole. Valuta sostituzioni/acquisti prima dell’aumento fabbisogno idrico.'
              }
            },
            {
              id: 'open_wizard_irrigation',
              label: 'Apri wizard: Progetta impianto',
              actionType: 'open_wizard',
              href: `/app/irrigation?gardenId=${garden.id}&wizard=design`
            },
            {
              id: 'dismiss',
              label: 'Salta',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }
  }

  const activeTasks = getActivePlants(tasks.filter(t => t.gardenId === garden.id));

  // PRIORITÀ 1.6: SUGGERIMENTI TRAPIANTO DA BATCH PIANTINE PRONTE
  // Controlla se ci sono batch di piantine pronte per trapianto
  if (seedlingBatches && seedlingBatches.length > 0) {
    const readyBatches = getAllReadyBatches(seedlingBatches, garden);
    
    for (const batch of readyBatches) {
      // Verifica se esiste già un task di trapianto per questa pianta
      const existingTransplantTask = activeTasks.find(
        t => t.plantName === batch.plantName && 
        t.taskType === 'Transplant' &&
        (!batch.variety || t.variety === batch.variety)
      );
      
      if (!existingTransplantTask && batch.currentQuantity && batch.currentQuantity > 0) {
        // Suggerisci trapianto per questo batch
        const masterData = getMasterSheetSync(batch.plantName);
        if (masterData && masterData.transplanting) {
          // Verifica condizioni meteo per trapianto
          let transplantDate = currentDate;
          if (batch.expectedTransplantDate) {
            transplantDate = new Date(batch.expectedTransplantDate);
          }
          
          // Verifica fase lunare ideale
          const moonCheck = isIdealPhaseFor('transplant', masterData.nutrientCategory, transplantDate);
          if (!moonCheck.ideal && moonCheck.daysUntilIdeal) {
            transplantDate.setDate(transplantDate.getDate() + moonCheck.daysUntilIdeal);
          }
          
          // Verifica condizioni meteo
          try {
            if (garden.coordinates) {
              const { checkTransplantConditions } = await import('../services/weatherService');
              // Recupera temperatura minima richiesta dalla pianta
              const minTemp = masterData.transplanting.minTemp || 10; // Default 10°C
              const weatherCheck = await checkTransplantConditions(
                garden.coordinates.latitude,
                garden.coordinates.longitude,
                minTemp
              );
              
              if (!weatherCheck.isSuitable) {
                // Posticipa se condizioni non ideali (usa giorni suggeriti o default 3)
                transplantDate.setDate(transplantDate.getDate() + 3);
              }
            }
          } catch (error) {
            console.warn('Error checking transplant conditions:', error);
          }
          
          lifecycleTasks.push({
            taskId: batch.id, // Usa ID batch come taskId
            plantName: batch.plantName + (batch.variety ? ` (${batch.variety})` : ''),
            phase: 'Transplanting',
            message: `🌱 Piantine pronte per trapianto: ${batch.plantName}${batch.variety ? ` (${batch.variety})` : ''}. Disponibili: ${batch.currentQuantity}/${batch.quantity} piantine${batch.source === 'nursery' && batch.nurseryName ? ` acquistate da ${batch.nurseryName}` : ' seminate in casa'}. Data suggerita: ${transplantDate.toLocaleDateString('it-IT')}`,
            priority: 'High',
            action: `Trapianta ${batch.currentQuantity} piantine. Prepara il terreno con compost maturo, annaffia abbondantemente dopo il trapianto e proteggi dal sole diretto per i primi giorni.${batch.source === 'nursery' && batch.purchaseDate ? ` Acquistate il ${new Date(batch.purchaseDate).toLocaleDateString('it-IT')}.` : ` Seminate il ${new Date(batch.sowingDate).toLocaleDateString('it-IT')}.`}`
          });
        }
      }
    }
  }

  // Verifica deviazioni dal piano annuale (se disponibile)
  const annualPlanDeviations: UrgentAlert[] = [];
  if (annualPlan) {
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4';
    const quarterPlan = annualPlan.quarters[currentQuarter];
    
    if (quarterPlan) {
      // Nota: per colture legnose (frutteto/oliveto/vigneto) evitiamo logiche tipiche dell'orto
      // come rotazioni/successioni automatiche.
      if (!isWoodyCrop) {
        // Verifica se ci sono piantagioni previste per questo mese che non sono state eseguite
        const expectedPlantings = quarterPlan.plantings.filter(p => p.month === currentMonth);
        const actualPlantings = activeTasks.filter(t => {
          const taskDate = new Date(t.date);
          return taskDate.getMonth() + 1 === currentMonth;
        });
        
        for (const expected of expectedPlantings) {
          const found = actualPlantings.find(t => t.plantName === expected.plantName);
          if (!found) {
            annualPlanDeviations.push({
              type: 'Planning',
              message: `⚠️ PIANIFICAZIONE: ${expected.plantName} prevista per questo mese non ancora piantata`,
              action: `Considera di piantare ${expected.plantName} entro la fine del mese per rispettare il piano annuale`,
              blockOperations: false
            });
          }
        }

        // Verifica successioni suggerite
        const recentHarvests = tasks.filter(t => {
          if (t.taskType === 'Harvest' && t.date) {
            const harvestDate = new Date(t.date);
            const daysDiff = Math.floor((currentDate.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff >= 0 && daysDiff <= 30; // Ultimi 30 giorni
          }
          return false;
        });

        for (const harvest of recentHarvests) {
          if (harvest.date && harvest.locationType) {
            const successions = suggestSuccessions(harvest.date, harvest.locationType || '', annualPlan);
            if (successions.length > 0) {
              const nextPlanting = successions[0];
              const existingTask = activeTasks.find(t => 
                t.plantName === nextPlanting.plantName && 
                t.locationType === nextPlanting.bed
              );
              if (!existingTask) {
                annualPlanDeviations.push({
                  type: 'Succession',
                  message: `🌱 SUCCESSIONE SUGGERITA: Dopo ${harvest.plantName}, considera ${nextPlanting.plantName}`,
                  action: `Piantare ${nextPlanting.plantName} in ${nextPlanting.bed || 'aiuola disponibile'} per ottimizzare rotazione`,
                  blockOperations: false
                });
              }
            }
          }
        }
      }
    }
  }

  // Aggiungi deviazioni annual plan agli alert
  urgentAlerts.push(...annualPlanDeviations);

  // ==========================================
  // FERTILIZATION AUTO-SCHEDULING
  // ==========================================
  // Pattern identico a harvest succession
  if (storageProvider && typeof storageProvider.getFertilizerApplicationLogs === 'function') {
    try {
      const daysAgo90 = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      const in3Days = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);

      const fertApplications = await storageProvider.getFertilizerApplicationLogs(
        garden.id,
        { from: daysAgo90.toISOString().split('T')[0] }
      );

      // Trova applicazioni che richiedono ripetizione
      const fertTasksNeeded = fertApplications.filter((app: any) =>
        app.nextApplicationDate &&
        new Date(app.nextApplicationDate) <= in3Days // Alert 3 giorni prima
      );

      for (const app of fertTasksNeeded) {
        const linkedTask = tasks.find(t => t.id === app.taskId);
        const daysUntilNext = Math.ceil(
          (new Date(app.nextApplicationDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilNext <= 0) {
          // Scaduto - urgente - TODO: Fix urgentTasks structure
          console.log(`Fertilizzazione scaduta: ${app.fertilizerProductName}`);
        } else {
          // In arrivo - reminder - TODO: Fix upcomingTasks structure
          console.log(`Fertilizzazione in arrivo: ${app.fertilizerProductName} tra ${daysUntilNext} giorni`);
        }
      }
    } catch (error) {
      // Tabella non ancora creata o errore DB - non bloccante
      if (error instanceof Error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        console.error('Error in fertilization auto-scheduling:', error);
      }
    }
  }

    // PRIORITÀ 2.4: SUGGERIMENTO PROGETTAZIONE IMPIANTO IRRIGAZIONE
  // Se ci sono colture attive ma non esiste ancora un impianto, proponi il wizard con una bozza.
  try {
    const hasActivePlantings = activeTasks.some(
      (t) => t.taskType === 'Sowing' || t.taskType === 'Transplant'
    );

    if (hasActivePlantings) {
      const { getDefaultStorageProvider } = await import(
        '../packages/core/storage/factory'
      );
      const provider = getDefaultStorageProvider();

      const existingSystems = await provider.getIrrigationSystems(garden.id);

      const designSuggestion = calculateIrrigationDesignSuggestions(
        garden,
        activeTasks,
        existingSystems
      );

      if (designSuggestion) {
        const zonesSummary = designSuggestion.zones
          .slice(0, 3)
          .map((z) => `${z.zoneName} (${Math.round(z.areaSqm)} m²)`)
          .join(', ');

        // Persist draft in storage so it can be resumed across devices.
        try {
          const hasExistingDraft = existingSystems.some(
            (s) => (s.name || '').toLowerCase().includes('bozza')
          );

          if (existingSystems.length === 0 && !hasExistingDraft) {
            const systemType =
              designSuggestion.systemType === 'drip'
                ? 'Drip'
                : designSuggestion.systemType === 'sprinkler'
                  ? 'Sprinkler'
                  : 'Manual';

            const draftSystem = await provider.createIrrigationSystem({
              gardenId: garden.id,
              name: 'Impianto Irrigazione (Bozza)',
              type: systemType,
              waterSource: 'Municipal',
              pressureBar: designSuggestion.pressureBar,
              hasTimer: true,
              hasValve: true,
              notes: 'DRAFT: creato automaticamente dal Director'
            });

            for (const z of designSuggestion.zones) {
              const method =
                z.method === 'drip'
                  ? 'Dripline'
                  : z.method === 'sprinkler'
                    ? 'Sprinkler'
                    : 'Manual';

              await provider.createIrrigationZone({
                systemId: draftSystem.id,
                gardenId: garden.id,
                name: z.zoneName,
                areaSqm: z.areaSqm,
                method,
                flowRateLph: z.flowRateLph,
                plantTypes: z.plantTypes,
                isAutomated: method !== 'Manual',
                schedule: undefined,
                lastWateredAt: undefined,
                valveId: undefined,
                bedIds: [],
                plantTaskIds: [],
                notes: 'DRAFT: proposta automatica',
                calculatedFromComponents: true,
                manualConfig:
                  method === 'Manual'
                    ? {
                        mode: 'liters'
                      }
                    : undefined,
                driplineConfig:
                  method === 'Dripline'
                    ? {
                        lengthMeters: z.driplineLength,
                        spacing: z.emitterSpacing
                      }
                    : undefined,
                microSprinklerConfig:
                  method === 'Sprinkler'
                    ? {
                        count: z.sprinklerCount,
                        flowRateLph: z.flowRateLph / Math.max(z.sprinklerCount || 1, 1)
                      }
                    : undefined,
                drippersConfig: undefined
              });
            }
          }
        } catch (persistError) {
          console.warn('Error persisting irrigation draft:', persistError);
        }

        urgentAlerts.push({
          type: 'Planning',
          message: `${isWoodyCrop ? '💧 Suggerimento (coltura legnosa)' : '💧 Suggerimento'}: progetta impianto irrigazione (${designSuggestion.systemType}). Zone: ${zonesSummary}${designSuggestion.zones.length > 3 ? '…' : ''}`,
          action: `${isWoodyCrop ? 'Per frutteti/oliveti/vigneti di solito conviene irrigazione localizzata e gestione volumi per pianta. ' : ''}Apri il wizard “Progetta impianto” per applicare la bozza: portata ${designSuggestion.flowRateLpm} L/min, pressione ${designSuggestion.pressureBar} bar, costo stimato €${Math.round(designSuggestion.estimatedCost)}.`,
          blockOperations: false,
          proactiveContext: {
            historicalPattern: 'Proposta automatica basata su colture attive e superficie del giardino',
            currentConditions: `Superficie: ${Math.round(designSuggestion.totalArea)} m²; Zone: ${designSuggestion.zones.length}`,
            predictedRisk: 'Senza impianto, rischio irrigazioni irregolari e stress idrico nelle fasi critiche',
            confidence: 0.55,
          },
          timing: 'this_week',
        });
      }
    }
  } catch (error) {
    console.warn('Error generating irrigation design suggestion:', error);
  }

  // Validazione compatibilità piante con classificazione solare e tipo terreno
  if (solarClassification) {
    for (const task of activeTasks) {
      // Validazione compatibilità solare
      const solarCompatibility = validatePlantCompatibility(
        task.plantName,
        solarClassification.classification,
        solarClassification.windows
      );
      
      if (!solarCompatibility.compatible) {
        urgentAlerts.push({
          type: 'SolarCompatibility',
          message: `⚠️ COMPATIBILITÀ SOLARE: ${task.plantName} - ${solarCompatibility.reason || 'Non ottimale per tipo orto'}`,
          action: solarCompatibility.alternativePlants 
            ? `Considera alternative: ${solarCompatibility.alternativePlants.join(', ')}`
            : 'Verifica esposizione solare richiesta',
          blockOperations: false, // Suggerimento, non blocco
        });
      }

      // Validazione compatibilità terreno
      const soilCompatibility = getSoilCompatibility(task.plantName, garden.soilType);
      if (!soilCompatibility.compatible) {
        urgentAlerts.push({
          type: 'SolarCompatibility', // Usa stesso tipo per coerenza
          message: `⚠️ COMPATIBILITÀ TERRENO: ${task.plantName} - ${soilCompatibility.reason || 'Non ottimale per tipo terreno'}`,
          action: soilCompatibility.optimalSoilTypes 
            ? `Terreni ottimali: ${soilCompatibility.optimalSoilTypes.join(', ')}. Considera miglioramenti o varietà resistenti.`
            : 'Verifica requisiti terreno della pianta',
          blockOperations: false,
        });
      }
    }

    // Validazione annual plan con classificazione solare
    if (annualPlan && solarClassification) {
      const currentMonth = currentDate.getMonth() + 1;
      const currentQuarter = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4';
      const quarterPlan = annualPlan.quarters[currentQuarter];
      
      if (quarterPlan) {
        const expectedPlantings = quarterPlan.plantings.filter(p => p.month === currentMonth);
        for (const expected of expectedPlantings) {
          const compatibility = validatePlantCompatibility(
            expected.plantName,
            solarClassification.classification,
            solarClassification.windows
          );
          
          if (!compatibility.compatible) {
            urgentAlerts.push({
              type: 'SolarCompatibility',
              message: `⚠️ PIANIFICAZIONE SOLARE: ${expected.plantName} prevista per questo mese non è ottimale per tipo orto`,
              action: compatibility.alternativePlants 
                ? `Considera alternative: ${compatibility.alternativePlants.join(', ')}`
                : 'Verifica esposizione solare richiesta',
              blockOperations: false,
            });
          }
        }
      }
    }
  }

  for (const task of activeTasks) {
    const masterData = getMasterSheetSync(task.plantName);
    if (!masterData) continue;

    // Check lifecycle status
    const lifecycleAdvice = await checkLifecycleStatus(task, masterData, garden, currentDate);
    
    if (lifecycleAdvice) {
      let lifecycleMessage = lifecycleAdvice.message;
      let lifecycleAction = lifecycleAdvice.actionYes;

      // Ottimizza timing basato su finestre di impianto solari, terreno e altitudine
      if (solarClassification && (task.taskType === 'Sowing' || task.taskType === 'Transplant')) {
        const relevantWindow = solarClassification.plantingWindows.find(
          pw => pw.recommendedPlants.some(rp => 
            task.plantName.toLowerCase().includes(rp.toLowerCase())
          )
        );

        if (relevantWindow) {
          const taskDate = new Date(task.date);
          const windowStart = new Date(relevantWindow.startDate);
          const windowEnd = new Date(relevantWindow.endDate);

          // Applica aggiustamenti terreno e altitudine alla finestra
          const plantType = getPlantTypeForAltitude(task.plantName);
          const adjustedWindowStart = applySoilAndAltitudeAdjustments(garden, windowStart, plantType);
          const adjustedWindowEnd = applySoilAndAltitudeAdjustments(garden, windowEnd, plantType);

          // Verifica se terreno è pronto (usa sensori se disponibili, altrimenti API meteo)
          if (masterData.transplanting?.minTemp) {
            try {
              const tempResult = await getEffectiveTemperature(garden, undefined, currentDate);
              const effectiveTemp = tempResult.temperature;
              
              // Per temperatura suolo, applica modificatore tipo terreno
              const soilTemp = calculateSoilHeatingRate(garden.soilType, effectiveTemp);
              const isReady = isSoilReadyForPlanting(
                garden.soilType,
                effectiveTemp,
                masterData.transplanting.minTemp
              );

              if (!isReady) {
                const sourceInfo = tempResult.source === 'sensor' 
                  ? `da sensore ${tempResult.sensorType}`
                  : tempResult.source === 'weather_api'
                  ? 'da previsioni meteo'
                  : 'stimata';
                lifecycleMessage += ` ⚠️ Terreno non ancora pronto (temp. suolo: ${soilTemp.toFixed(1)}°C ${sourceInfo}, richiesta: ${masterData.transplanting.minTemp}°C)`;
                lifecycleAction = `${lifecycleAction || ''} Aspetta che il terreno si scaldi. Data suggerita: ${adjustedWindowStart.toLocaleDateString('it-IT')}`.trim();
              }
            } catch (error) {
              // Ignora errori meteo, continua con logica normale
              console.warn('Errore verifica temperatura terreno:', error);
            }
          }

          if (taskDate < adjustedWindowStart || taskDate > adjustedWindowEnd) {
            const adjustments: string[] = [];
            if (garden.altitudeMeters && garden.altitudeMeters > 200) {
              adjustments.push(`altitudine ${garden.altitudeMeters}m`);
            }
            if (garden.soilType && garden.soilType !== 'Loamy') {
              adjustments.push(`terreno ${garden.soilType}`);
            }
            const adjustmentsText = adjustments.length > 0 ? ` (aggiustata per ${adjustments.join(', ')})` : '';
            lifecycleMessage += ` ⚠️ Fuori finestra ottimale${adjustmentsText} (${adjustedWindowStart.toLocaleDateString('it-IT')} - ${adjustedWindowEnd.toLocaleDateString('it-IT')})`;
            lifecycleAction = `${lifecycleAction || ''} Finestra ottimale: ${adjustedWindowStart.toLocaleDateString('it-IT')} - ${adjustedWindowEnd.toLocaleDateString('it-IT')}`.trim();
          }
        }
      }

      lifecycleTasks.push({
        taskId: task.id,
        plantName: task.plantName,
        phase: lifecycleAdvice.phase,
        message: lifecycleMessage,
        priority: lifecycleAdvice.type === 'WARNING' ? 'High' : 
                  lifecycleAdvice.type === 'TASK' ? 'Medium' : 'Low',
        action: lifecycleAction
      });

      // Estrai consigli nutrizionali e salute dal lifecycle advice
      if (lifecycleAdvice.relatedAdvice?.nutrients) {
        const nutrientAdvice = lifecycleAdvice.relatedAdvice.nutrients;
        if (nutrientAdvice.shouldFertilize) {
          nutrientTasks.push({
            plantName: task.plantName,
            element: nutrientAdvice.elementFocus,
            adviceTitle: nutrientAdvice.adviceTitle,
            adviceBody: nutrientAdvice.adviceBody + ' ' + applySoilModifier(nutrientAdvice, garden.soilType),
            priority: nutrientAdvice.elementFocus === 'None' ? 'Low' : 'Medium'
          });
        }
      }

      if (lifecycleAdvice.relatedAdvice?.health) {
        const healthAdvice = lifecycleAdvice.relatedAdvice.health;
        healthTasks.push({
          plantName: task.plantName,
          productToUse: healthAdvice.productToUse,
          reason: healthAdvice.reason + ' ' + applySoilModifier(healthAdvice, garden.soilType),
          priority: healthAdvice.priority,
          actionType: healthAdvice.actionType
        });
      }
    }

    // Calcola giorni attivi per tutti i task (usato anche fuori dal blocco)
    const daysActive = Math.floor(
      (currentDate.getTime() - new Date(task.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Se non c'è lifecycle advice ma la pianta è attiva, calcola comunque nutrienti e salute
    if (!lifecycleAdvice) {

      const nutrientAdvice = calculateNutrientNeeds(masterData, daysActive, garden.soilType, task.taskType);
      if (nutrientAdvice.shouldFertilize) {
        nutrientTasks.push({
          plantName: task.plantName,
          element: nutrientAdvice.elementFocus,
          adviceTitle: nutrientAdvice.adviceTitle,
          adviceBody: nutrientAdvice.adviceBody + ' ' + applySoilModifier(nutrientAdvice, garden.soilType),
          priority: 'Medium'
        });

        // FERTILIZER ENGINE: Suggerisci prodotto concreto
        try {
          const fertilizerRec = await suggestFertilizerProduct(
            nutrientAdvice.elementFocus,
            garden.soilType,
            'top_dressing'
          );
          if (fertilizerRec) {
            // Aggiungi alert se scorte basse
            const stockAlerts = await checkFertilizerStock(garden.id, getSeasonForDate(currentDate, garden.coordinates?.latitude || 0));
            if (stockAlerts.length > 0) {
              urgentAlerts.push({
                type: 'Planning',
                message: `⚠️ Scorte fertilizzanti basse: ${stockAlerts[0].item.productName}`,
                action: stockAlerts[0].reason,
                blockOperations: false,
              });
            }
          }
        } catch (error) {
          console.error('Error suggesting fertilizer product:', error);
        }
      }

      // Calcola stagione per health strategy
      const season = garden.coordinates 
        ? getSeasonForDate(currentDate, garden.coordinates.latitude)
        : undefined;
      const latitude = garden.coordinates?.latitude || 0;
      
      const healthAdvice = calculateHealthStrategy(
        masterData, 
        daysActive, 
        season, 
        latitude, 
        userProfile
      );
      if (healthAdvice) {
        // Aggiungi wind factor al health advice
        const windAdvice = calculateWindEffect(garden.windProtection, masterData);
        if (windAdvice.risk !== 'LOW') {
          // Integra wind advice nel reason
          healthAdvice.reason += ` ${windAdvice.message}`;
          if (windAdvice.action) {
            healthAdvice.applicationNotes = (healthAdvice.applicationNotes || '') + ` ${windAdvice.action}`;
          }
          healthAdvice.windAdvice = windAdvice;
          
          // Aumenta priorità se rischio alto
          if (windAdvice.risk === 'HIGH' && healthAdvice.priority === 'Medium') {
            healthAdvice.priority = 'High';
          }
        }

        healthTasks.push({
          plantName: task.plantName,
          productToUse: healthAdvice.productToUse,
          reason: healthAdvice.reason + ' ' + applySoilModifier(healthAdvice, garden.soilType),
          priority: healthAdvice.priority,
          actionType: healthAdvice.actionType
        });

        // PHYTO ENGINE: Suggerisci prodotto concreto con timing critico
        if (healthAdvice.actionType === 'Prevent') {
          try {
            const weatherForecast = garden.coordinates
              ? await getCurrentWeatherForecast(garden.coordinates)
              : undefined;
            const phytoRec = await suggestPhytoProduct(
              healthAdvice.reason,
              masterData,
              weatherForecast || undefined,
              userProfile
            );

            if (phytoRec) {
              // Verifica timing con raccolta
              const harvestTask = tasks.find(
                (t) => t.plantName === task.plantName && t.taskType === 'Harvest' && !t.completed
              );
              if (harvestTask) {
                const timingCheck = await checkTreatmentTiming(
                  phytoRec.product,
                  weatherForecast || undefined,
                  new Date(harvestTask.date)
                );

                if (timingCheck.conflict) {
                  urgentAlerts.push({
                    type: 'Planning',
                    message: `⚠️ Conflitto trattamento/raccolta: ${timingCheck.message}`,
                    action: timingCheck.options.map((o) => o.action).join(' o '),
                    blockOperations: false,
                    timing: 'now',
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error suggesting phyto product:', error);
          }
        }
      } else if (garden.windProtection && garden.windProtection !== 'Medium') {
        // Se non c'è health advice ma c'è problema vento, aggiungi warning
        const windAdvice = calculateWindEffect(garden.windProtection, masterData);
        if (windAdvice.risk !== 'LOW') {
          warnings.push({
            type: 'Wind',
            severity: windAdvice.risk === 'HIGH' ? 'High' : 'Medium',
            message: `Vento: ${windAdvice.message}`,
            recommendation: windAdvice.action || windAdvice.improvement || 'Monitora condizioni vento',
          });
        }
      }

      // Fertirrigazione: Calcola piano fertirrigazione se necessario
      const fertigationPlan = calculateFertigationPlan(task, masterData, garden, currentDate);
      if (fertigationPlan.shouldFertigate) {
        const priority = garden.soilType === 'Sandy' ? 'High' : 'Medium';
        const productInfo = fertigationPlan.product 
          ? `${fertigationPlan.product.name} (${fertigationPlan.dosage.totalForIrrigation.toFixed(1)}${fertigationPlan.dosage.unit})`
          : 'Fertirrigazione consigliata';
        
        lifecycleTasks.push({
          taskId: task.id,
          plantName: task.plantName,
          phase: 'Fertirrigazione',
          message: `💧 ${productInfo} per ${task.plantName}`,
          priority,
          action: fertigationPlan.instructions.join('; ')
        });
      }

      // Prevenzione Malattie: Suggerimenti preventivi basati su stagione/meteo
      if (daysActive > 20) {
        const season = getSeasonForDate(currentDate, garden.coordinates?.latitude || 0);
        const preventiveMeasures = getPreventiveMeasures(task.plantName, season, garden);
        if (preventiveMeasures.length > 0) {
          // Aggiungi solo se non ci sono già health tasks critici
          const hasCriticalHealth = healthTasks.some(ht => ht.priority === 'High' && ht.plantName === task.plantName);
          if (!hasCriticalHealth) {
            // Aggiungi come UrgentAlert invece di ClimateWarning (prevenzione malattie non è un warning climatico)
            urgentAlerts.push({
              type: 'Planning',
              message: `Prevenzione malattie per ${task.plantName}: ${preventiveMeasures.slice(0, 2).join(', ')}`,
              action: preventiveMeasures.join('; '),
              blockOperations: false
            });
          }
        }
      }
    }

    // Rain Management: Verifica se task richiede irrigazione e aggiusta in base a pioggia
    if (forecast7Days.length > 0 && (task.taskType === 'Fertilize' || daysActive % 3 === 0)) {
      // Task che potrebbero richiedere irrigazione (fertilizzazione o routine)
      const irrigationAdjustment = adjustIrrigationForRain(task, forecast7Days, garden);
      
      if (irrigationAdjustment.action === 'CANCEL') {
        // Aggiungi warning per skip irrigazione
        warnings.push({
          type: 'Rain',
          severity: 'Medium',
          message: `Irrigazione non necessaria per ${task.plantName}: ${irrigationAdjustment.message}`,
          recommendation: irrigationAdjustment.nextScheduledDate 
            ? `Riprogramma irrigazione per ${irrigationAdjustment.nextScheduledDate.toLocaleDateString('it-IT')}`
            : 'Monitora umidità terreno'
        });
      } else if (irrigationAdjustment.action === 'REDUCE') {
        // Aggiungi warning per riduzione dose
        warnings.push({
          type: 'Rain',
          severity: 'Low',
          message: `Riduci irrigazione per ${task.plantName}: ${irrigationAdjustment.message}`,
          recommendation: `Irriga per ${irrigationAdjustment.adjustedDuration} minuti invece del normale`
        });
      }
    }
  }

  // PRIORITÀ 4.5: GESTIONE COLTURE SPECIALIZZATE (Pro Features)
  // Verifica e aggiunge task per fragole, frutteti, erbe, olivo, vite
  const specializedTasks: LifecycleTask[] = [];
  let weatherForecast: WeatherForecast | undefined;

  if (garden.coordinates) {
    try {
      weatherForecast = await getCurrentWeatherForecast(garden.coordinates);
    } catch (error) {
      console.error('Error fetching weather for specialized crops:', error);
    }
  }

  for (const task of activeTasks) {
    const masterData = getMasterSheetSync(task.plantName);
    if (!masterData || !masterData.cropType) continue;

    try {
      // FRAGOLE
      if (masterData.cropType === 'Strawberry') {
        const strawberryCrop = masterData as unknown as StrawberryCrop;
        const strawberryTasks = calculateStrawberryTasks(strawberryCrop, currentDate);
        
        for (const st of strawberryTasks) {
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Fragole: ${st.taskType}`,
            message: st.message,
            priority: st.priority === 'High' ? 'High' : 'Medium',
            action: st.instructions.join('; ')
          });
        }
      }

      // FRUTTETI
      if (masterData.cropType === 'FruitTree') {
        const fruitTreeCrop = masterData as unknown as FruitTreeCrop;
        const treeAge = task.fruitTreeData?.treeAge || 1; // Default 1 anno se non specificato
        const fruitTreeTasks = calculateFruitTreeTasks(fruitTreeCrop, treeAge, currentDate);
        
        for (const ft of fruitTreeTasks) {
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Frutteto: ${ft.taskType}`,
            message: ft.message,
            priority: ft.priority === 'High' ? 'High' : 'Medium',
            action: ft.instructions.join('; ')
          });
        }
      }

      // ERBE AROMATICHE/OFFICINALI
      if (masterData.cropType === 'Aromatic' || masterData.cropType === 'Medicinal') {
        const aromaticCrop = masterData as unknown as AromaticMedicinalCrop;
        const aromaticTasks = calculateAromaticTasks(aromaticCrop, currentDate);
        
        for (const at of aromaticTasks) {
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Erbe: ${at.taskType}`,
            message: at.message,
            priority: at.priority === 'High' ? 'High' : 'Medium',
            action: at.instructions.join('; ')
          });
        }
      }

      // OLIVO
      if (masterData.cropType === 'Olive') {
        const oliveCrop = masterData as unknown as OliveCrop;
        const oliveTasks = calculateOliveTasks(oliveCrop, currentDate, weatherForecast);
        
        for (const ot of oliveTasks) {
          // Se è frangitura urgente, aumenta priorità
          const isUrgent = ot.taskType === 'Milling' && ot.isUrgent;
          
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Olivo: ${ot.taskType}`,
            message: isUrgent ? `⚠️ URGENTE: ${ot.message}` : ot.message,
            priority: isUrgent ? 'Critical' : (ot.priority === 'High' ? 'High' : 'Medium'),
            action: ot.instructions.join('; ')
          });
        }
      }

      // VITE
      if (masterData.cropType === 'Vine') {
        const vineCrop = masterData as unknown as VineCrop;
        const vineTasks = calculateVineTasks(vineCrop, currentDate, weatherForecast);
        
        for (const vt of vineTasks) {
          // Se è vinificazione urgente, aumenta priorità
          const isUrgent = vt.taskType === 'Winemaking' && vt.isUrgent;
          
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Vite: ${vt.taskType}`,
            message: isUrgent ? `⚠️ URGENTE: ${vt.message}` : vt.message,
            priority: isUrgent ? 'Critical' : (vt.priority === 'High' ? 'High' : 'Medium'),
            action: vt.instructions.join('; ')
          });
        }
      }

      // FRUTTA ESOTICA
      if (masterData.cropType === 'ExoticFruit') {
        const exoticCrop = masterData as unknown as ExoticFruitCrop;
        const exoticTasks = calculateExoticFruitTasks(exoticCrop, garden, currentDate);
        
        for (const et of exoticTasks) {
          // Se è avviso climatico, aumenta priorità
          const isClimateWarning = et.climateWarning;
          
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Frutta Esotica: ${et.taskType}`,
            message: isClimateWarning ? `🌡️ CLIMA: ${et.message}` : et.message,
            priority: isClimateWarning ? 'High' : (et.priority === 'High' ? 'High' : 'Medium'),
            action: et.instructions.join('; ')
          });
        }
      }

      // LAMPONI
      if (masterData.cropType === 'Raspberry') {
        const raspberryCrop = masterData as unknown as RaspberryCrop;
        const raspberryTasks = calculateRaspberryTasks(raspberryCrop, currentDate);
        
        for (const rt of raspberryTasks) {
          specializedTasks.push({
            taskId: task.id,
            plantName: task.plantName,
            phase: `Lamponi: ${rt.taskType}`,
            message: rt.message,
            priority: rt.priority === 'High' ? 'High' : 'Medium',
            action: rt.instructions.join('; ')
          });
        }
      }
    } catch (error) {
      console.error(`Error calculating specialized tasks for ${task.plantName}:`, error);
    }
  }

  // Aggiungi task specializzati al piano
  lifecycleTasks.push(...specializedTasks);

  // NUOVO: SISTEMI IDROPONICI/ACQUAPONICI/AEROPONICI
  // Task a livello giardino per manutenzione sistemi avanzati
  const advancedSystemTasks: LifecycleTask[] = [];

  // IDROPONICA
  if (garden.gardenType && (
    garden.gardenType.startsWith('Hydroponic') || 
    garden.gardenType === 'NFT' || 
    garden.gardenType === 'DWC' || 
    garden.gardenType === 'EbbFlow' || 
    garden.gardenType === 'Drip' || 
    garden.gardenType === 'Wick' || 
    garden.gardenType === 'Kratky' ||
    garden.gardenType === 'Hydroponic'
  )) {
    try {
      // Ottieni letture parametri da storage provider se disponibile
      let hydroponicReadings: HydroponicReading[] = [];
      if (storageProvider?.getHydroponicReadings) {
        hydroponicReadings = await storageProvider.getHydroponicReadings(garden.id) || [];
      }
      
      const hydroponicAdvice = generateHydroponicSuggestions(garden, tasks, hydroponicReadings, currentDate);
      
      // Aggiungi alert urgenti
      urgentAlerts.push(...hydroponicAdvice.urgentAlerts);
      
      // Aggiungi prompts come baseline
      baselinePrompts.push(...hydroponicAdvice.prompts);
    } catch (error) {
      console.error('Error calculating hydroponic tasks:', error);
    }
  }

  // ACQUAPONICA
  if (garden.gardenType === 'Aquaponic') {
    try {
      // Ottieni letture parametri da storage provider se disponibile
      let aquaponicReadings: AquaponicReading[] = [];
      if (storageProvider?.getAquaponicReadings) {
        aquaponicReadings = await storageProvider.getAquaponicReadings(garden.id) || [];
      }
      
      const aquaponicAdvice = generateAquaponicSuggestions(garden, tasks, aquaponicReadings, currentDate);
      
      // Aggiungi alert urgenti
      urgentAlerts.push(...aquaponicAdvice.urgentAlerts);
      
      // Aggiungi prompts come baseline
      baselinePrompts.push(...aquaponicAdvice.prompts);
    } catch (error) {
      console.error('Error calculating aquaponic tasks:', error);
    }
  }

  // AEROPONICA
  if (garden.gardenType === 'Aeroponic') {
    try {
      const aeroponicAdvice = generateAeroponicSuggestions(garden, tasks, currentDate);
      
      // Aggiungi alert urgenti
      urgentAlerts.push(...aeroponicAdvice.urgentAlerts);
      
      // Aggiungi prompts come baseline
      baselinePrompts.push(...aeroponicAdvice.prompts);
    } catch (error) {
      console.error('Error calculating aeroponic tasks:', error);
    }
  }

  // SERRA
  if (garden.gardenType === 'Greenhouse' || garden.greenhouseConfig) {
    try {
      // Ottieni forecast meteo per alert serra
      let weatherForecast = undefined;
      if (garden.coordinates && forecast7Days.length > 0) {
        weatherForecast = {
          tempMin: forecast7Days[0].temp_min,
          tempMax: forecast7Days[0].temp_max,
          windSpeed: forecast7Days[0].wind_speed,
          rainForecastMm: forecast7Days[0].precipitation,
          snowForecastMm: forecast7Days[0].snowfall
        };
      }
      
      const greenhouseAdvice = generateGreenhouseSuggestions(garden, tasks, currentDate, weatherForecast);
      
      // Aggiungi alert urgenti
      urgentAlerts.push(...greenhouseAdvice.urgentAlerts);
      
      // Aggiungi prompts come baseline
      baselinePrompts.push(...greenhouseAdvice.prompts);
    } catch (error) {
      console.error('Error calculating greenhouse tasks:', error);
    }
  }

  // ACCESSORI
  // TODO: Implementare quando storage provider supporta accessori
  // try {
  //   const accessories = await storageProvider.getAccessories(garden.id);
  //   if (accessories && accessories.length > 0) {
  //     const accessoryTasks = calculateAccessoryTasks(garden, accessories, currentDate);
  //     for (const at of accessoryTasks) {
  //       const accessoryName = accessories.find(a => a.id === at.accessoryId)?.name || 'Accessorio';
  //       advancedSystemTasks.push({
  //         taskId: at.accessoryId || '',
  //         plantName: at.accessoryId ? `Accessorio: ${accessoryName}` : 'Accessori Giardino',
  //         phase: `Accessori: ${at.taskType}`,
  //         message: at.message,
  //         priority: at.priority === 'High' ? 'High' : 'Medium',
  //         action: at.instructions.join('; ')
  //       });
  //     }
  //   }
  // } catch (error) {
  //   console.error('Error calculating accessory tasks:', error);
  // }

  // GENERAZIONE TIMELINE AUTOMATICA DALLE SEMINE COMPLETATE
  // Quando una semina viene completata, genera automaticamente tutte le fasi successive
  const completedSowings = tasks.filter(
    t => t.gardenId === garden.id && 
    t.taskType === 'Sowing' && 
    t.completed && 
    !t.isSuggested // Solo semine manuali, non suggerite
  );

  const timelineSuggestedTasks: GardenTask[] = [];
  for (const sowing of completedSowings) {
    // Verifica se è una coltura personalizzata (solo se storageProvider è disponibile)
    const customCrop = storageProvider ? await isCustomCrop(storageProvider, sowing.plantName) : null;
    let sowingMasterData = getMasterSheetSync(sowing.plantName);
    
    // Se è una coltura personalizzata, usa suggerimenti appresi invece del master sheet
    if (customCrop && !sowingMasterData) {
      const suggestions = generateSuggestions(customCrop);
      const harvestTiming = calculateHarvestTiming(customCrop);
      
      // Crea timeline basata su pattern appresi
      if (harvestTiming.confidence > 0.4 && harvestTiming.avgDays) {
        // Crea un master sheet minimo per generare timeline
        // Nota: Cast a unknown necessario perché PlantMasterSheet richiede molte proprietà
        // che non abbiamo per colture personalizzate. Questo è un workaround temporaneo.
        sowingMasterData = {
          id: customCrop.id,
          commonName: customCrop.common_name,
          scientificName: customCrop.scientific_name || '',
          family: customCrop.family || 'Unknown',
          nutrientCategory: 'FRUITING' as any,
          requiredTools: {
            seedTray: false,
            seedSoil: false,
            heatingMat: false,
            sprayer: false
          },
          germination: {
            preSoak: false,
            sowingDepth: 1,
            idealTemp: '20-24°C',
            minTemp: 15,
            lightRequirement: 'Either',
            emergenceDays: { min: 7, max: 14 },
            coveringNeeded: false
          },
          seedlingCare: {
            idealTemp: '18-22°C',
            wateringFrequency: 'Daily',
            lightRequirement: 'FullSun',
            transplantReadyDays: { min: 30, max: 45 }
          },
          baseInstructions: {
            sowing: { window: suggestions.planting || 'Da definire' },
            harvest: { window: `${harvestTiming.avgDays} giorni dalla semina` }
          }
        } as unknown as PlantMasterSheet;
      } else {
        // Dati insufficienti, salta
        continue;
      }
    }
    
    if (sowingMasterData) {
      const timeline = generateTimelineFromSowing(sowing, sowingMasterData, garden);
      // Converti i suggerimenti in GardenTask
      for (const suggested of timeline.suggestedTasks) {
        // Verifica se il task suggerito esiste già
        const existingTask = tasks.find(
          t => t.gardenId === garden.id &&
          t.plantName === suggested.plantName &&
          t.taskType === suggested.taskType &&
          t.suggestedBy === suggested.suggestedBy &&
          t.suggestedDate === suggested.suggestedDate
        );
        
        if (!existingTask) {
          timelineSuggestedTasks.push(convertToGardenTask(suggested, sowing));
        }
      }
    }
  }

  // TILLAGE ENGINE: Verifica terreno in tempera per lavorazioni
  try {
    const soilState = await getSoilState(garden.id, garden.id);
    if (soilState) {
      const temperaCheck = await calculateTemperaTiming(
        garden,
        soilState.lastRainDate || new Date(),
        soilState.lastRainAmount || 0
      );

      if (temperaCheck.isTempera) {
        urgentAlerts.push({
          type: 'Planning',
          message: `✅ Terreno in tempera. Finestra ottimale per lavorazione.`,
          action: 'Esegui lavorazione pianificata',
          timing: 'now',
          blockOperations: false,
        });
      }
    }
  } catch (error) {
    console.error('Error checking tillage timing:', error);
  }

  // Verifica trattamenti in periodo carenza
  try {
    const { getSupabaseStorageProvider } = await import('../packages/core/storage/factory');
    const treatmentStorage = getSupabaseStorageProvider();
    if (!treatmentStorage) throw new Error('Cloud treatment registry unavailable');
    const activeIntervals = await getActiveSafetyIntervals(treatmentStorage, garden.id);
    if (activeIntervals.length > 0) {
      urgentAlerts.push({
        type: 'Safety',
        message: `⚠️ ${activeIntervals.length} trattamenti ancora in periodo carenza`,
        action: 'Non raccogliere fino a fine periodo carenza',
        blockOperations: false,
      });
    }
  } catch (error) {
    console.error('Error checking safety intervals:', error);
  }

  // LAVORAZIONI MECCANICHE (per terreni > 1000 m²)
  const mechanicalWorkSuggestions = await calculateMechanicalWorkTasks(garden, currentDate, tasks);
  const mechanicalWorkTasks: MechanicalWorkTask[] = mechanicalWorkSuggestions.map(s => ({
    suggestedDate: s.suggestedDate,
    priority: s.priority,
    message: s.message,
    instructions: s.instructions,
    workType: s.taskType,
    equipmentType: s.equipmentType,
    area: s.area,
    weatherWarning: s.weatherWarning
  }));

  // POTATURA ALBERI (inclusi agrumi)
  const treePruningSuggestions = calculateTreePruningTasks(garden, currentDate, tasks);
  const treePruningTasks: TreePruningTask[] = treePruningSuggestions.map(s => ({
    suggestedDate: s.suggestedDate,
    priority: s.priority,
    message: s.message,
    instructions: s.instructions,
    treeType: s.treeType,
    pruningType: s.pruningType,
    season: s.season,
    lunarAdvice: s.lunarAdvice
  }));

  // PENDING SUGGESTIONS (task suggeriti non ancora completati)
  const pendingSuggestions = getPendingSuggestions(tasks);

  // PRIORITÀ 5: TRADIZIONE (ottimizzazione lunare)
  const lunarAdvice = generateLunarAdvice(currentDate);

  // Determina priorità complessiva
  const overallPriority = determineOverallPriority(urgentAlerts, lifecycleTasks);

  // PRIORITÀ 2.5: IRRIGAZIONE (dopo ciclo vitale, prima di nutrienti)
  const irrigationTasks: import('../types/irrigation').IrrigationTask[] = [];
  try {
    // Carica zone irrigue per questo giardino
    const { getDefaultStorageProvider } = await import('../packages/core/storage/factory');
    const storageProvider = getDefaultStorageProvider();
    
    // Per ora 1 sistema = 1 giardino (semplificazione)
    const systems = await storageProvider.getIrrigationSystems(garden.id);
    if (systems.length > 0) {
      const system = systems[0]; // Prendi il primo sistema
      const zones = await storageProvider.getIrrigationZones(system.id);
      
      // Calcola schedule per ogni zona
      const { calculateZoneIrrigationSchedule } = await import('../services/irrigationService');
      
      let weather = null;
      if (garden.coordinates) {
        try {
          weather = await getCurrentWeatherForecast(garden.coordinates) ?? null;
        } catch (error) {
          console.warn('Could not load weather for irrigation:', error);
        }
      }
      
      for (const zone of zones) {
        if (!zone.plantTaskIds || zone.plantTaskIds.length === 0) continue; // Salta zone senza piante
        
        const schedule = await calculateZoneIrrigationSchedule(
          zone,
          zone.plantTaskIds,
          tasks,
          garden,
          weather
        );
        
        // Includi anche zone manuali senza portata (mostrano solo litri)
        if ((schedule.litersNeeded ?? 0) > 0) {
          irrigationTasks.push({
            zoneId: schedule.zoneId,
            zoneName: schedule.zoneName ?? zone.name,
            litersNeeded: schedule.litersNeeded ?? 0,
            durationMinutes: schedule.suggestedDurationMinutes ?? 0,
            priority: schedule.priority ?? 'Low',
            valveId: zone.valveId,
            manualMode: schedule.manualMode,
            showLitersOnly: schedule.showLitersOnly,
            weatherAdjustment: schedule.weatherAdjustment,
            fertigationInfo: schedule.fertigationInfo
          });
        }
      }
    }
  } catch (error) {
    console.warn('Error calculating irrigation tasks:', error);
    // Continua senza irrigation tasks se errore
  }

  // IMPORTANTE: Filtra suggerimenti non applicabili per sistemi idroponici/acquaponici/aeroponici
  // Non suggerire irrigazione/fertilizzazione tradizionale per questi sistemi
  const isAdvancedGrowingSystem = garden.gardenType && [
    'Hydroponic', 'NFT', 'DWC', 'EbbFlow', 'Drip', 'Wick', 'Kratky',
    'Aquaponic', 'Aeroponic'
  ].includes(garden.gardenType);

  if (isAdvancedGrowingSystem) {
    // Filtra lifecycle tasks che suggeriscono irrigazione/fertilizzazione tradizionale
    const filteredLifecycleTasks = lifecycleTasks.filter(task => {
      const message = task.message.toLowerCase();
      const action = (task.action || '').toLowerCase();
      
      // Rimuovi suggerimenti di irrigazione tradizionale
      if (message.includes('irrigazione') || message.includes('annaffia') || action.includes('irrigazione')) {
        return false;
      }
      
      // Rimuovi suggerimenti di fertilizzazione tradizionale (ma mantieni fertirrigazione)
      if ((message.includes('fertilizza') || action.includes('fertilizza')) && 
          !message.includes('fertirrigazione') && !action.includes('fertirrigazione')) {
        return false;
      }
      
      return true;
    });
    
    // Filtra nutrient tasks (fertilizzazione tradizionale non applicabile)
    const filteredNutrientTasks = nutrientTasks.filter(task => {
      // Per sistemi idroponici, la gestione nutrienti è tramite EC, non fertilizzazione tradizionale
      return false; // Rimuovi tutti i nutrient tasks tradizionali
    });
    
    // Filtra baseline prompts che suggeriscono operazioni non applicabili
    const filteredBaselinePrompts = baselinePrompts.filter(prompt => {
      const title = prompt.title.toLowerCase();
      const body = prompt.body.toLowerCase();
      
      // Rimuovi prompts di concimazione di fondo
      if (title.includes('concimazione') || body.includes('concimazione di fondo')) {
        return false;
      }
      
      // Rimuovi prompts di lavorazione terreno (non applicabili per idroponica)
      if (title.includes('lavorazione') || title.includes('tempera') || body.includes('lavorazione')) {
        return false;
      }
      
      return true;
    });
    
    // Sostituisci con versioni filtrate
    lifecycleTasks.length = 0;
    lifecycleTasks.push(...filteredLifecycleTasks);
    
    nutrientTasks.length = 0;
    nutrientTasks.push(...filteredNutrientTasks);
    
    baselinePrompts.length = 0;
    baselinePrompts.push(...filteredBaselinePrompts);
  }

  return {
    date: currentDate.toISOString().split('T')[0],
    urgentAlerts,
    lifecycleTasks,
    nutrientTasks,
    healthTasks,
    climateWarnings,
    baselinePrompts: baselinePrompts.length > 0 ? baselinePrompts : undefined,
    lunarAdvice,
    priority: overallPriority,
    mechanicalWorkTasks,
    treePruningTasks,
    pendingSuggestions,
    solarClassification: solarClassification || undefined,
    irrigationTasks: irrigationTasks.length > 0 ? irrigationTasks : undefined
  };
};

/**
 * FUNZIONI HELPER ESTRATTE PER TESTABILITÀ
 * Queste funzioni erano inline in getDailyGardenPlan, ora sono modulari
 */

/**
 * Genera task del ciclo vitale per le piante del giardino
 */
export const generateLifecycleTasks = async (
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date()
): Promise<LifecycleTask[]> => {
  const lifecycleTasks: LifecycleTask[] = [];
  
  // Logica estratta da getDailyGardenPlan
  // Qui andrebbe la logica per generare i lifecycle tasks
  // Per ora ritorno array vuoto per evitare errori
  
  return lifecycleTasks;
};

/**
 * Genera allerte urgenti basate su meteo e condizioni critiche
 */
export const generateUrgentAlerts = async (
  garden: Garden,
  currentDate: Date = new Date()
): Promise<UrgentAlert[]> => {
  const urgentAlerts: UrgentAlert[] = [];
  
  // Logica estratta da checkWeatherUrgency
  if (garden.coordinates) {
    try {
      const { alerts } = await checkWeatherUrgency(garden.coordinates);
      urgentAlerts.push(...alerts);
    } catch (error) {
      console.warn('Error checking weather urgency:', error);
    }
  }
  
  return urgentAlerts;
};

/**
 * Genera prompt baseline stagionali proattivi
 */
export const generateBaselinePrompts = async (
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date = new Date()
): Promise<DirectorPrompt[]> => {
  const baselinePrompts: DirectorPrompt[] = [];
  const month = currentDate.getMonth() + 1;
  const todayIso = currentDate.toISOString().split('T')[0];
  
  const primaryArchetypeId = garden.primaryCrop?.archetypeId ?? 'MIX';
  const isWoodyCrop = ['A12', 'L1', 'L2', 'L3', 'L3_CITRUS', 'L3_STONE', 'L3_POME', 'L3_EXOTIC'].includes(primaryArchetypeId);
  
  // Helper functions
  const hasOpenTaskWithPlantName = (taskType: GardenTask['taskType'], plantNameMatch: string) =>
    tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === taskType &&
        !t.completed &&
        (t.plantName || '').toLowerCase().includes(plantNameMatch.toLowerCase())
    );

  const hasRecentCompletedTask = (
    taskType: GardenTask['taskType'],
    daysBack: number = 30,
    plantNameMatch?: string
  ) => {
    const cutoffDate = new Date(currentDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return tasks.some(
      (t) =>
        t.gardenId === garden.id &&
        t.taskType === taskType &&
        t.completed &&
        new Date(t.date) >= cutoffDate &&
        (!plantNameMatch || t.plantName?.toLowerCase().includes(plantNameMatch.toLowerCase()))
    );
  };
  
  // Baseline per orto/misto (non legnose)
  if (!isWoodyCrop) {
    // Fine Dicembre / Gennaio: pulizia residui
    if (month === 12 || month === 1) {
      const hasOpenClearingBaselineTasks =
        hasOpenTaskWithPlantName('Clearing', 'pulizia') ||
        hasOpenTaskWithPlantName('Clearing', 'ripristino') ||
        hasOpenTaskWithPlantName('Clearing', 'pulizia terreno');

      const hasRecentClearingBaselineTasks =
        hasRecentCompletedTask('Clearing', 60, 'pulizia') ||
        hasRecentCompletedTask('Clearing', 60, 'ripristino') ||
        hasRecentCompletedTask('Clearing', 60, 'pulizia terreno');

      if (!hasOpenClearingBaselineTasks && !hasRecentClearingBaselineTasks) {
        baselinePrompts.push({
          id: `seasonal_baseline_clearing_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'High',
          title: 'Pulizia e ripristino dell\'orto',
          body: 'Rimuovi residui delle colture precedenti, erbacce e pacciamature vecchie. È il momento migliore per ripartire "pulito" prima della preparazione del suolo.',
          options: [
            {
              id: 'create_task',
              label: 'Aggiungi task: Pulizia terreno',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: 'Pulizia terreno (baseline stagionale)',
                taskType: 'Clearing',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedDate: todayIso,
                suggestedBy: 'director_baseline',
                notes: 'Rimuovi residui vecchio orto, erbacce, pacciamature deteriorate. Smaltisci o compost se idoneo.'
              }
            },
            {
              id: 'dismiss',
              label: 'Già fatto / non serve',
              actionType: 'dismiss'
            }
          ]
        });
      }
    }
  }
  
  return baselinePrompts;
};
