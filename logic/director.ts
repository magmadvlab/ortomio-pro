'use client';

import { Garden, GardenTask, PlantMasterSheet, DailyPlan, UrgentAlert, ClimateWarning, LifecycleTask, NutrientTask, HealthTask, LunarAdvice, MechanicalWorkTask, TreePruningTask } from '../types';
import { getWeatherForecast, getWeatherForecast7Days, WeatherForecast } from '../services/weatherService';
import { checkLifecycleStatus, LifecycleAdvice } from './lifecycleEngine';
import { calculateNutrientNeeds, NutrientAdvice } from './nutrientEngine';
import { calculateHealthStrategy, HealthAdvice, calculateWindEffect } from './healthEngine';
import { calculateMoonPhase, isIdealPhaseFor } from './lunarCalendar';
import { getMasterSheetSync } from '../services/plantMasterService';
import { isCustomCrop } from '../services/taskCompletionHook';
import { generateSuggestions, calculatePlantingTiming, calculateHarvestTiming } from '../services/learningEngine';
import { getActivePlants } from '../services/taskCalculationService';
import { adjustIrrigationForRain } from './rainManager';
import { calculateFertigationPlan } from './fertigationEngine';
import { getPreventiveMeasures } from './diseaseDiagnosisEngine';
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
import { calculateHydroponicTasks, HydroponicTaskAdvice } from './hydroponicEngine';
import { calculateAquaponicTasks, AquaponicTaskAdvice } from './aquaponicEngine';
import { calculateAeroponicTasks, AeroponicTaskAdvice } from './aeroponicEngine';
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
import { UserProfile } from '../types';
import { SeedlingBatch } from '../services/seedlingService';
import { getSeasonForDate } from '../utils/seasonalAdjustment';
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

/**
 * Verifica urgenze climatiche (gelo, caldo estremo, siccità)
 * PRIORITÀ 1: Clima incontrollabile che blocca operazioni
 */
const checkWeatherUrgency = async (
  coordinates?: { latitude: number; longitude: number }
): Promise<{ alerts: UrgentAlert[]; warnings: ClimateWarning[] }> => {
  const alerts: UrgentAlert[] = [];
  const warnings: ClimateWarning[] = [];

  if (!coordinates) {
    return { alerts, warnings };
  }

  try {
    const forecast = await getWeatherForecast(coordinates.latitude, coordinates.longitude);
    
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
    if (forecast.rainForecastMm < 1) {
      warnings.push({
        type: 'Rain',
        severity: 'Medium',
        message: 'Nessuna pioggia prevista nei prossimi giorni',
        recommendation: 'Programma irrigazioni regolari, considera pacciamatura per trattenere umidità'
      });
    } else if (forecast.rainForecastMm > 20) {
      warnings.push({
        type: 'Rain',
        severity: 'High',
        message: `Pioggia intensa prevista: ${forecast.rainForecastMm.toFixed(1)}mm`,
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
  seedlingBatches?: SeedlingBatch[]
): Promise<DailyPlan> => {
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

  // Ottieni forecast 7 giorni per gestione pioggia
  let forecast7Days: WeatherForecast[] = [];
  if (garden.coordinates) {
    try {
      forecast7Days = await getWeatherForecast7Days(garden.coordinates.latitude, garden.coordinates.longitude) || [];
    } catch (error) {
      console.warn('Could not load 7-day forecast:', error);
    }
  }

  // Filtra solo piante attive (non completate)
  const activeTasks = getActivePlants(tasks.filter(t => t.gardenId === garden.id));

  // Verifica deviazioni dal piano annuale (se disponibile)
  const annualPlanDeviations: UrgentAlert[] = [];
  if (annualPlan) {
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = currentMonth <= 3 ? 'Q1' : currentMonth <= 6 ? 'Q2' : currentMonth <= 9 ? 'Q3' : 'Q4';
    const quarterPlan = annualPlan.quarters[currentQuarter];
    
    if (quarterPlan) {
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

  // Aggiungi deviazioni annual plan agli alert
  urgentAlerts.push(...annualPlanDeviations);

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

          // Verifica se terreno è pronto (se abbiamo temperatura aria disponibile)
          if (garden.coordinates && masterData.transplanting?.minTemp) {
            try {
              const forecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
              if (forecast && forecast.tempMin !== undefined) {
                const effectiveTemp = garden.altitudeMeters 
                  ? calculateEffectiveTemperature(garden.altitudeMeters, forecast.tempMin)
                  : forecast.tempMin;
                const soilTemp = calculateSoilHeatingRate(garden.soilType, effectiveTemp);
                const isReady = isSoilReadyForPlanting(
                  garden.soilType,
                  effectiveTemp,
                  masterData.transplanting.minTemp
                );

                if (!isReady) {
                  lifecycleMessage += ` ⚠️ Terreno non ancora pronto (temp. suolo: ${soilTemp.toFixed(1)}°C, richiesta: ${masterData.transplanting.minTemp}°C)`;
                  lifecycleAction = `${lifecycleAction || ''} Aspetta che il terreno si scaldi. Data suggerita: ${adjustedWindowStart.toLocaleDateString('it-IT')}`.trim();
                }
              }
            } catch (error) {
              // Ignora errori meteo, continua con logica normale
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

      const nutrientAdvice = calculateNutrientNeeds(masterData, daysActive, garden.soilType);
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
              ? await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude) || undefined
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
      const forecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
      weatherForecast = forecast || undefined;
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
      // TODO: Ottenere letture parametri da storage provider quando disponibile
      const hydroponicReadings: HydroponicReading[] | undefined = undefined;
      const hydroponicTasks = calculateHydroponicTasks(garden, tasks, currentDate, hydroponicReadings);
      
      for (const ht of hydroponicTasks) {
        advancedSystemTasks.push({
          taskId: '', // Task a livello giardino, non associato a pianta specifica
          plantName: `Sistema Idroponico (${garden.hydroponicConfig?.systemType || 'Idroponico'})`,
          phase: `Idroponica: ${ht.taskType}`,
          message: ht.isUrgent ? `⚠️ URGENTE: ${ht.message}` : ht.message,
          priority: ht.priority === 'Critical' ? 'Critical' : (ht.priority === 'High' ? 'High' : 'Medium'),
          action: ht.instructions.join('; ')
        });
      }
    } catch (error) {
      console.error('Error calculating hydroponic tasks:', error);
    }
  }

  // ACQUAPONICA
  if (garden.gardenType === 'Aquaponic') {
    try {
      // TODO: Ottenere letture parametri da storage provider quando disponibile
      const aquaponicReadings: AquaponicReading[] | undefined = undefined;
      const aquaponicTasks = calculateAquaponicTasks(garden, tasks, currentDate, aquaponicReadings);
      
      for (const at of aquaponicTasks) {
        advancedSystemTasks.push({
          taskId: '',
          plantName: 'Sistema Acquaponico',
          phase: `Acquaponica: ${at.taskType}`,
          message: at.isUrgent ? `⚠️ URGENTE: ${at.message}` : at.message,
          priority: at.priority === 'Critical' ? 'Critical' : (at.priority === 'High' ? 'High' : 'Medium'),
          action: at.instructions.join('; ')
        });
      }
    } catch (error) {
      console.error('Error calculating aquaponic tasks:', error);
    }
  }

  // AEROPONICA
  if (garden.gardenType === 'Aeroponic') {
    try {
      const aeroponicTasks = calculateAeroponicTasks(garden, tasks, currentDate);
      
      for (const at of aeroponicTasks) {
        advancedSystemTasks.push({
          taskId: '',
          plantName: 'Sistema Aeroponico',
          phase: `Aeroponica: ${at.taskType}`,
          message: at.isUrgent ? `⚠️ URGENTE: ${at.message}` : at.message,
          priority: at.priority === 'Critical' ? 'Critical' : (at.priority === 'High' ? 'High' : 'Medium'),
          action: at.instructions.join('; ')
        });
      }
    } catch (error) {
      console.error('Error calculating aeroponic tasks:', error);
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

  // Aggiungi task sistemi avanzati al piano
  lifecycleTasks.push(...advancedSystemTasks);

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
    // Verifica se è una coltura personalizzata
    const customCrop = await isCustomCrop(sowing.plantName);
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
    const activeIntervals = await getActiveSafetyIntervals(garden.id);
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
          weather = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
        } catch (error) {
          console.warn('Could not load weather for irrigation:', error);
        }
      }
      
      for (const zone of zones) {
        if (zone.plantTaskIds.length === 0) continue; // Salta zone senza piante
        
        const schedule = await calculateZoneIrrigationSchedule(
          zone,
          zone.plantTaskIds,
          tasks,
          garden,
          weather
        );
        
        // Includi anche zone manuali senza portata (mostrano solo litri)
        if (schedule.litersNeeded > 0) {
          irrigationTasks.push({
            zoneId: schedule.zoneId,
            zoneName: schedule.zoneName,
            litersNeeded: schedule.litersNeeded,
            durationMinutes: schedule.suggestedDurationMinutes,
            priority: schedule.priority,
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

  return {
    date: currentDate.toISOString().split('T')[0],
    urgentAlerts,
    lifecycleTasks,
    nutrientTasks,
    healthTasks,
    climateWarnings,
    lunarAdvice,
    priority: overallPriority,
    mechanicalWorkTasks,
    treePruningTasks,
    pendingSuggestions,
    solarClassification: solarClassification || undefined,
    irrigationTasks: irrigationTasks.length > 0 ? irrigationTasks : undefined
  };
};

