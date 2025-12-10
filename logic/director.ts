import { Garden, GardenTask, PlantMasterSheet, DailyPlan, UrgentAlert, ClimateWarning, LifecycleTask, NutrientTask, HealthTask, LunarAdvice } from '../types';
import { getWeatherForecast, getWeatherForecast7Days, WeatherForecast } from '../services/weatherService';
import { checkLifecycleStatus, LifecycleAdvice } from './lifecycleEngine';
import { calculateNutrientNeeds, NutrientAdvice } from './nutrientEngine';
import { calculateHealthStrategy, HealthAdvice } from './healthEngine';
import { calculateMoonPhase, isIdealPhaseFor } from './lunarCalendar';
import { getMasterSheet } from '../services/plantMasterService';
import { getActivePlants } from '../services/taskCalculationService';
import { adjustIrrigationForRain } from './rainManager';
// Specialized crop engines (Pro Features)
import { calculateStrawberryTasks, StrawberryTaskAdvice } from './strawberryEngine';
import { calculateFruitTreeTasks, FruitTreeTaskAdvice } from './fruitTreeEngine';
import { calculateAromaticTasks, AromaticTaskAdvice } from './aromaticEngine';
import { calculateOliveTasks, OliveTaskAdvice, isMillingUrgent } from './oliveEngine';
import { calculateVineTasks, VineTaskAdvice, isWinemakingUrgent } from './vineEngine';
import { StrawberryCrop } from '../types/strawberry';
import { FruitTreeCrop } from '../types/fruitTree';
import { AromaticMedicinalCrop } from '../types/aromatic';
import { OliveCrop } from '../types/olive';
import { VineCrop } from '../types/vine';
// Annual Planner integration
import { generateAnnualPlan, AnnualPlan, suggestSuccessions } from './annualPlannerEngine';

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
  annualPlan?: AnnualPlan
): Promise<DailyPlan> => {
  // PRIORITÀ 1: CLIMA (incontrollabile, blocca operazioni)
  const { alerts: urgentAlerts, warnings: climateWarnings } = await checkWeatherUrgency(
    garden.coordinates
  );

  // PRIORITÀ 2: CICLO VITALE (cosa fare)
  const lifecycleTasks: LifecycleTask[] = [];
  const nutrientTasks: NutrientTask[] = [];
  const healthTasks: HealthTask[] = [];

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
        const taskDate = new Date(t.plantingDate);
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
        if (t.harvestDate) {
          const harvestDate = new Date(t.harvestDate);
          const daysDiff = Math.floor((currentDate.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff <= 30; // Ultimi 30 giorni
        }
        return false;
      });

      for (const harvest of recentHarvests) {
        if (harvest.harvestDate && harvest.bed) {
          const successions = suggestSuccessions(harvest.harvestDate, harvest.bed, annualPlan);
          if (successions.length > 0) {
            const nextPlanting = successions[0];
            const existingTask = activeTasks.find(t => 
              t.plantName === nextPlanting.plantName && 
              t.bed === nextPlanting.bed
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

  for (const task of activeTasks) {
    const masterData = getMasterSheet(task.plantName);
    if (!masterData) continue;

    // Check lifecycle status
    const lifecycleAdvice = await checkLifecycleStatus(task, masterData, garden, currentDate);
    
    if (lifecycleAdvice) {
      lifecycleTasks.push({
        taskId: task.id,
        plantName: task.plantName,
        phase: lifecycleAdvice.phase,
        message: lifecycleAdvice.message,
        priority: lifecycleAdvice.type === 'WARNING' ? 'High' : 
                  lifecycleAdvice.type === 'TASK' ? 'Medium' : 'Low',
        action: lifecycleAdvice.actionYes
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

    // Se non c'è lifecycle advice ma la pianta è attiva, calcola comunque nutrienti e salute
    if (!lifecycleAdvice) {
      const daysActive = Math.floor(
        (currentDate.getTime() - new Date(task.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const nutrientAdvice = calculateNutrientNeeds(masterData, daysActive, garden.soilType);
      if (nutrientAdvice.shouldFertilize) {
        nutrientTasks.push({
          plantName: task.plantName,
          element: nutrientAdvice.elementFocus,
          adviceTitle: nutrientAdvice.adviceTitle,
          adviceBody: nutrientAdvice.adviceBody + ' ' + applySoilModifier(nutrientAdvice, garden.soilType),
          priority: 'Medium'
        });
      }

      const healthAdvice = calculateHealthStrategy(masterData, daysActive);
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
            warnings.push({
              type: 'Disease Prevention',
              severity: 'Low',
              message: `Prevenzione malattie per ${task.plantName}: ${preventiveMeasures.slice(0, 2).join(', ')}`,
              recommendation: preventiveMeasures.join('; ')
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
      weatherForecast = await getWeatherForecast(garden.coordinates.latitude, garden.coordinates.longitude);
    } catch (error) {
      console.error('Error fetching weather for specialized crops:', error);
    }
  }

  for (const task of activeTasks) {
    const masterData = getMasterSheet(task.plantName);
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
    } catch (error) {
      console.error(`Error calculating specialized tasks for ${task.plantName}:`, error);
    }
  }

  // Aggiungi task specializzati al piano
  lifecycleTasks.push(...specializedTasks);

  // PRIORITÀ 5: TRADIZIONE (ottimizzazione lunare)
  const lunarAdvice = generateLunarAdvice(currentDate);

  // Determina priorità complessiva
  const overallPriority = determineOverallPriority(urgentAlerts, lifecycleTasks);

  return {
    date: currentDate.toISOString().split('T')[0],
    urgentAlerts,
    lifecycleTasks,
    nutrientTasks,
    healthTasks,
    climateWarnings,
    lunarAdvice,
    priority: overallPriority
  };
};

