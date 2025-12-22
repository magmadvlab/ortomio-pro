'use client';

import { GardenTask, PlantMasterSheet, Garden } from '../types';
import { calculateDaysActive } from '../services/taskCalculationService';
import { calculateNutrientNeeds, NutrientAdvice } from './nutrientEngine';
import { calculateHealthStrategy, HealthAdvice } from './healthEngine';
import { checkTransplantConditions } from '../services/weatherService';
import { calculateMoonPhase, isIdealPhaseFor, getMoonPhaseName } from './lunarCalendar';
import { isPlantNearHarvestEnd, checkEmptySpaceOpportunity } from './successionEngine';
import { getAllMasterSheets } from '../services/plantMasterService';
import { calculateAltitudeDelay, calculateAltitudePlantingDelay, adjustPlantingDates } from '../utils/altitudeUtils';
import { scheduleNextTreatment } from './healthEngine';
import { getSoilCompatibility } from '../utils/soilTemperatureUtils';
import { determineWasteDisposal, suggestHumusAddition } from './compostEngine';
import { createWeeklyReminder, updateReminderFrequency } from '../services/weeklyPhotoReminder';
import { getSupabaseClient } from '../config/supabase';
import { getCleaningInstructionsForSpecies } from './equipmentCleaningHelper';

export type LifecyclePhase = 'Sowing' | 'Germination' | 'Nursing' | 'IntermediateRepotting' | 'Hardening' | 'Transplanting' | 'Production';

export type LifecycleAdviceType = 'CHECK' | 'TASK' | 'WARNING' | 'INFO';

export interface LifecycleAdvice {
  phase: LifecyclePhase;
  type: LifecycleAdviceType;
  message: string;
  actionYes?: string; // Cosa fare se l'utente risponde "Sì"
  actionNo?: string; // Cosa fare se l'utente risponde "No"
  subTasks?: string[]; // Lista di sotto-task da completare
  postponeDays?: number; // Quanti giorni rimandare se necessario
  relatedAdvice?: {
    nutrients?: NutrientAdvice;
    health?: HealthAdvice;
  };
}

/**
 * Determina la fase corrente del ciclo vitale basandosi sui giorni trascorsi
 */
export const determineLifecyclePhase = (
  daysAlive: number,
  masterData: PlantMasterSheet,
  task: GardenTask
): LifecyclePhase => {
  // Se l'utente ha già risposto alle domande, usa lo stato salvato
  if (task.lifecycleState) {
    return task.lifecycleState;
  }

  // Fase 0: Semina (giorno 0)
  if (daysAlive === 0) {
    return 'Sowing';
  }

  // Fase 1: Germinazione (entro il range di emergenceDays)
  if (daysAlive >= masterData.germination.emergenceDays.min && 
      daysAlive <= masterData.germination.emergenceDays.max + 3) { // +3 giorni di tolleranza
    // Se l'utente ha già confermato la germinazione, passa a Nursing
    if (task.userResponses?.germinationConfirmed) {
      return 'Nursing';
    }
    return 'Germination';
  }

  // Fase 2: Nursing (dopo germinazione fino a ~30 giorni)
  if (daysAlive > masterData.germination.emergenceDays.max + 3 && daysAlive < 50) {
    // Fase 2.5: Rinvaso Intermedio (25-35 giorni, se necessario)
    if (masterData.intermediateRepotting?.needed && 
        daysAlive >= 25 && daysAlive <= 35 &&
        !task.userResponses?.intermediateRepottingDone) {
      return 'IntermediateRepotting';
    }
    return 'Nursing';
  }

  // Fase 3: Hardening (50-60 giorni, preparazione al trapianto)
  if (daysAlive >= 50 && daysAlive < 65) {
    return 'Hardening';
  }

  // Fase 4: Trapianto (60+ giorni, o se taskType è già Transplant)
  if (daysAlive >= 60 || task.taskType === 'Transplant') {
    // Se l'utente ha già trapiantato, passa a Production
    if (task.userResponses?.transplantReady || task.taskType === 'Transplant') {
      return 'Production';
    }
    return 'Transplanting';
  }

  // Fase 5: Produzione (dopo trapianto o 90+ giorni)
  if (daysAlive >= 90) {
    return 'Production';
  }

  // Default: Nursing
  return 'Nursing';
};

/**
 * Genera suggerimenti per la fase di Semina
 */
const generateSowingAdvice = (task: GardenTask, masterData: PlantMasterSheet): LifecycleAdvice | null => {
  const sowingDate = new Date(task.date);
  const moonInfo = calculateMoonPhase(sowingDate);
  const moonCheck = isIdealPhaseFor('sowing', masterData.nutrientCategory, sowingDate);
  
  // Consigli specifici per la germinazione
  const subTasks: string[] = [];
  
  // Preparazione terriccio - ADATTATO AL TIPO DI CONTENITORE
  const seedTrayType = masterData.requiredTools.seedTrayType;
  
  subTasks.push('📋 Preparazione:');
  
  if (seedTrayType === 'vasetti') {
    subTasks.push('   Contenitore: Usa vasetti individuali (non vaschette alveolate)');
    subTasks.push('   1. Inumidisci il terriccio prima di riempire i vasetti');
    subTasks.push('   2. Riempi ogni vasetto senza compattare troppo');
    subTasks.push('   3. Crea un piccolo foro al centro con un dito');
  } else if (seedTrayType === 'alveolato') {
    subTasks.push('   Contenitore: Usa vaschetta alveolata');
    subTasks.push('   1. Inumidisci il terriccio prima di riempire le celle (deve essere umido ma non bagnato)');
    subTasks.push('   2. Riempi le celle senza compattare troppo - lascia il terriccio soffice');
    subTasks.push('   3. Crea un piccolo foro con un dito o uno stuzzicadenti');
  } else {
    subTasks.push('   1. Inumidisci il terriccio prima di riempire i contenitori');
    subTasks.push('   2. Riempi senza compattare troppo - lascia il terriccio soffice');
    subTasks.push('   3. Crea un piccolo foro con un dito o uno stuzzicadenti');
  }
  
  // Etichettatura
  subTasks.push('🏷️ Etichettatura: Etichetta immediatamente ogni cella/vasetto con nome varietà e data di semina');
  
  // Note specifiche per famiglia botanica
  if (masterData.familySpecificNotes) {
    const notes = masterData.familySpecificNotes;
    
    if (notes.containerSizeAdvice) {
      subTasks.push(`\n📦 ${notes.containerSizeAdvice}`);
    }
    
    if (notes.sowingTimingAdvice) {
      subTasks.push(`\n📅 ${notes.sowingTimingAdvice}`);
    }
    
    if (notes.specialCareInstructions && notes.specialCareInstructions.length > 0) {
      subTasks.push('\n⚠️ Note speciali:');
      notes.specialCareInstructions.forEach(instruction => {
        subTasks.push(`   • ${instruction}`);
      });
    }
  }
  
  // Profondità
  subTasks.push(`🌱 Profondità: Posiziona i semi a ${masterData.germination.sowingDepth}cm di profondità`);
  
  // Temperatura e tappetino riscaldante
  const idealTemp = masterData.germination.idealTemp || '22-26°C';
  const optimalTempRange = masterData.germination.optimalTempRange;
  const heatingMatTemp = masterData.germination.heatingMatTemp;
  
  if (masterData.requiredTools.heatingMat && heatingMatTemp) {
    subTasks.push(`🌡️ Temperatura: Usa tappetino riscaldante impostato a ${heatingMatTemp}°C`);
    subTasks.push(`   Range ottimale: ${optimalTempRange ? `${optimalTempRange.min}-${optimalTempRange.max}°C` : idealTemp}`);
  } else if (optimalTempRange) {
    subTasks.push(`🌡️ Temperatura: Mantieni costante tra ${optimalTempRange.min}-${optimalTempRange.max}°C`);
  } else {
    subTasks.push(`🌡️ Temperatura: Mantieni costante tra ${idealTemp}. Usa un termometro per monitorare`);
  }
  
  // Umidità e controllo
  const humidityLevel = masterData.germination.humidityLevel;
  const soilMoistureCheck = masterData.germination.soilMoistureCheck;
  
  if (soilMoistureCheck) {
    subTasks.push(`💧 Controllo umidità: ${soilMoistureCheck}`);
  } else {
    subTasks.push('💧 Umidità: Mantieni il terreno umido ma non troppo bagnato');
  }
  
  if (humidityLevel) {
    const humidityText = humidityLevel === 'High' ? 'alta' : humidityLevel === 'Medium' ? 'media' : 'bassa';
    subTasks.push(`   Livello umidità richiesto: ${humidityText}`);
  }
  
  subTasks.push('   Usa un nebulizzatore per non spostare i semi');
  subTasks.push('   ⚠️ Controlla ogni giorno l\'umidità del terreno');
  
  // Copertura dettagliata
  if (masterData.germination.coveringNeeded) {
    const coveringType = masterData.germination.coveringType;
    const coveringRemoveWhen = masterData.germination.coveringRemoveWhen;
    
    if (coveringType === 'PlasticLid') {
      subTasks.push('📦 Copertura: Usa il coperchio trasparente del semenzaio');
    } else if (coveringType === 'PlasticWrap') {
      subTasks.push('📦 Copertura: Usa pellicola trasparente per mantenere umidità e temperatura');
    } else {
      subTasks.push('📦 Copertura: Usa pellicola trasparente per mantenere umidità e temperatura costante');
    }
    
    if (coveringRemoveWhen) {
      subTasks.push(`   ⚠️ IMPORTANTE: ${coveringRemoveWhen}`);
    } else if (masterData.germination.coveringInstructions) {
      subTasks.push(`   ⚠️ ${masterData.germination.coveringInstructions}`);
    } else {
      subTasks.push('   ⚠️ Togli la copertura non appena vedi il primo germoglio verde');
    }
  }
  
  // Ventilazione se necessaria
  if (masterData.germination.ventilationNeeded) {
    subTasks.push('💨 Ventilazione: Apri leggermente la copertura ogni 2-3 giorni per evitare condensa eccessiva');
  }
  
  // Luce
  if (masterData.germination.lightRequirement === 'Dark') {
    subTasks.push('🌑 Luce: I semi hanno bisogno di buio per germinare. Mantieni coperto.');
  } else if (masterData.germination.lightRequirement === 'Light') {
    subTasks.push('☀️ Luce: I semi hanno bisogno di luce per germinare. Non coprire.');
  } else {
    subTasks.push('🌓 Luce: I semi possono germinare sia al buio che alla luce.');
  }
  
  // Tempo atteso
  const minDays = masterData.germination.emergenceDays.min;
  const maxDays = masterData.germination.emergenceDays.max;
  subTasks.push(`⏱️ Tempo atteso: I primi germogli dovrebbero apparire tra ${minDays} e ${maxDays} giorni dalla semina`);
  
  // Pre-ammollo se necessario
  if (masterData.germination.preSoak) {
    subTasks.unshift('💧 Pre-ammollo: I semi sono stati pre-ammollati prima della semina per favorire la germinazione');
  }
  
  // Suggerimento pulizia attrezzature se necessario
  if (masterData.equipmentCleaning?.sterilizationRequired) {
    subTasks.push('\n🧹 Pulizia attrezzature:');
    subTasks.push('   Dopo questa semina, pulisci e sterilizza vaschette e attrezzature per evitare "Damping Off" (moria dei semenzai).');
    
    const cleaningInstructions = getCleaningInstructionsForSpecies(
      masterData.equipmentCleaning.seedTrayCleaning,
      masterData.equipmentCleaning.heatingMatCleaning,
      masterData.equipmentCleaning.soilReuse
    );
    
    // Aggiungi solo le prime 3-4 righe per non appesantire troppo
    cleaningInstructions.slice(0, 4).forEach(instruction => {
      subTasks.push(`   ${instruction}`);
    });
    subTasks.push('   (Vedi protocollo completo nella sezione Attrezzature)');
  }
  
  let message = `Hai appena seminato ${task.plantName}. Segui questi consigli per favorire la germinazione:`;
  let adviceType: LifecycleAdviceType = 'INFO';
  
  // Check lunare per semina
  if (!moonCheck.ideal) {
    // Warning specifico per piante che montano a seme facilmente (LEAFY)
    if (masterData.nutrientCategory === 'LEAFY' && moonCheck.daysUntilIdeal) {
      message += ` ⚠️ Attenzione: La luna è ${getMoonPhaseName(sowingDate)}. Per evitare che ${task.plantName} monti a seme, sarebbe meglio aspettare ${moonCheck.daysUntilIdeal} giorni che la luna diventi Calante.`;
      adviceType = 'WARNING';
      subTasks.unshift(`🌙 ${moonCheck.reason}`);
    } else if (moonCheck.daysUntilIdeal) {
      message += ` 🌙 ${moonCheck.reason}`;
      adviceType = 'WARNING';
      subTasks.unshift(`🌙 Luna: ${moonCheck.reason}`);
    }
  } else {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
  }
  
  return {
    phase: 'Sowing',
    type: adviceType,
    message,
    subTasks
  };
};

/**
 * Genera suggerimenti per la fase di Germinazione
 */
const generateGerminationAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet
): LifecycleAdvice | null => {
  // Se l'utente ha già confermato, non mostrare più
  if (task.userResponses?.germinationConfirmed) {
    return null;
  }

  const minDays = masterData.germination.emergenceDays.min;
  const maxDays = masterData.germination.emergenceDays.max;
  const isInWindow = daysAlive >= minDays && daysAlive <= maxDays;
  const coveringRemoveWhen = masterData.germination.coveringRemoveWhen;

  if (isInWindow) {
    const subTasks: string[] = [];
    
    subTasks.push(`👀 Cosa cercare: I primi germogli dovrebbero apparire tra ${minDays} e ${maxDays} giorni dalla semina`);
    subTasks.push('   Cerca piccoli archietti verdi che emergono dal terreno');
    
    // Istruzioni immediate quando emergono
    subTasks.push('\n⚡ AZIONE IMMEDIATA quando vedi emergere:');
    
    if (masterData.germination.coveringNeeded) {
      if (coveringRemoveWhen) {
        subTasks.push(`   1. ${coveringRemoveWhen}`);
      } else {
        subTasks.push('   1. Togli IMMEDIATAMENTE la copertura (pellicola/coperchio)');
      }
      subTasks.push('   2. Non aspettare che tutti i semi germoglino - togli il coperchio appena vedi il primo cotiledone verde');
    }
    
    // Gestione tappetino riscaldante dopo emergenza
    if (masterData.requiredTools.heatingMat) {
      subTasks.push('   3. Spegni o riduci il tappetino riscaldante (le piantine non hanno più bisogno di calore extra)');
    }
    
    // Accensione luci
    subTasks.push('   4. Accendi le luci LED immediatamente (14-16 ore al giorno)');
    subTasks.push('      Posiziona le luci a 10-15cm sopra le piantine');
    
    // Cambio metodo irrigazione
    subTasks.push('   5. Cambia metodo irrigazione: NON nebulizzare più');
    subTasks.push('      Usa bottom watering (acqua nel sottovaso) per evitare di bagnare le foglie');
    
    return {
      phase: 'Germination',
      type: 'CHECK',
      message: `Dovresti vedere i primi germogli tra ${minDays} e ${maxDays} giorni. È spuntato qualcosa?`,
      subTasks,
      actionYes: 'Ottimo! Segui le istruzioni sopra per la gestione immediata dopo l\'emergenza.',
      actionNo: 'Attendi ancora qualche giorno. Mantieni il terreno umido con il nebulizzatore e controlla la temperatura. Se dopo ' + maxDays + ' giorni non vedi nulla, controlla temperatura, umidità e profondità di semina.'
    };
  }

  // Se siamo oltre il range, chiedi comunque con più dettagli
  if (daysAlive > maxDays) {
    const subTasks: string[] = [];
    subTasks.push(`⚠️ Sono passati ${daysAlive} giorni dalla semina (range atteso: ${minDays}-${maxDays} giorni)`);
    subTasks.push('\nPossibili cause del ritardo:');
    subTasks.push('  • Temperatura troppo bassa o troppo alta');
    subTasks.push('  • Terreno troppo secco o troppo bagnato');
    subTasks.push('  • Semi troppo profondi o troppo superficiali');
    subTasks.push('  • Semi vecchi o non vitali');
    
    if (masterData.requiredTools.heatingMat && !masterData.germination.heatingMatTemp) {
      subTasks.push('  • Manca tappetino riscaldante (consigliato per questa specie)');
    }
    
    return {
      phase: 'Germination',
      type: 'WARNING',
      message: `Sono passati ${daysAlive} giorni dalla semina. Hai visto germogliare qualcosa?`,
      subTasks,
      actionYes: 'Ottimo! Passa alla fase Nursing seguendo le istruzioni per la gestione post-emergenza.',
      actionNo: 'Controlla le condizioni sopra. Potrebbe essere necessario riseminare con semi freschi.'
    };
  }

  return null;
};

/**
 * Genera suggerimenti per la fase di Nursing
 */
const generateNursingAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null
): LifecycleAdvice | null => {
  const subTasks: string[] = [];
  const care = masterData.seedlingCare;

  // Dettagli tecnici luce
  if (care.lightDetails) {
    const light = care.lightDetails;
    subTasks.push('💡 Gestione Luce:');
    
    if (light.type) {
      subTasks.push(`   Tipo: ${light.type === 'LED' ? 'LED (consigliato)' : light.type === 'Fluorescent' ? 'Fluorescente' : light.type === 'Natural' ? 'Naturale (finestra)' : 'Misto'}`);
    }
    
    if (light.distance) {
      subTasks.push(`   Distanza: ${light.distance}cm sopra le piantine`);
    } else {
      subTasks.push('   Distanza: 10-15cm sopra le piantine (regola man mano che crescono)');
    }
    
    subTasks.push(`   Fotoperiodo: ${light.hours} ore di luce al giorno`);
    
    if (light.intensity) {
      const intensityText = light.intensity === 'High' ? 'Alta' : light.intensity === 'Medium' ? 'Media' : 'Bassa';
      subTasks.push(`   Intensità: ${intensityText}`);
    }
    
    if (light.spectrum) {
      const spectrumText = light.spectrum === 'Full' ? 'Spettro completo' : light.spectrum === 'Blue' ? 'Blu (vegetativa)' : light.spectrum === 'Red' ? 'Rosso (fioritura)' : 'Misto';
      subTasks.push(`   Spettro: ${spectrumText}`);
    }
  } else if (care.lightHours) {
    subTasks.push(`💡 Luce: ${care.lightNeeds} - ${care.lightHours} ore al giorno`);
    subTasks.push('   Posiziona le luci a 10-15cm sopra le piantine');
  } else {
    subTasks.push(`💡 Luce: ${care.lightNeeds}`);
  }

  // Temperatura
  if (care.temperatureRange) {
    subTasks.push(`🌡️ Temperatura: Mantieni tra ${care.temperatureRange.min}-${care.temperatureRange.max}°C`);
  } else {
    subTasks.push(`🌡️ Temperatura: ${care.temperature}`);
  }

  // Bottom watering dettagliato
  if (care.wateringMethod === 'Bottom') {
    subTasks.push('💧 Irrigazione - Bottom Watering:');
    
    if (care.bottomWateringDepth && care.bottomWateringDuration) {
      subTasks.push(`   Riempi il sottovaso con ${care.bottomWateringDepth}cm di acqua`);
      subTasks.push(`   Lascia assorbire per ${care.bottomWateringDuration} minuti`);
    } else {
      subTasks.push('   Riempi il sottovaso con 1-2cm di acqua');
      subTasks.push('   Lascia assorbire per 15-30 minuti, poi svuota l\'acqua residua');
    }
    
    subTasks.push('   Controlla: il terriccio deve essere umido ma non bagnato');
    subTasks.push('   Frequenza: solo quando il terriccio è quasi asciutto');
  } else if (care.wateringMethod === 'Spray') {
    subTasks.push(`💧 Irrigazione: ${care.watering}`);
    subTasks.push('   Usa nebulizzatore per non bagnare le foglie');
  } else {
    subTasks.push(`💧 Irrigazione: ${care.watering}`);
    if (care.wateringMethod === 'Top') {
      subTasks.push('   Innaffia delicatamente alla base della pianta');
    }
  }

  // Ventilazione
  if (care.ventilation?.needed) {
    subTasks.push('💨 Ventilazione:');
    if (care.ventilation.method) {
      subTasks.push(`   Metodo: ${care.ventilation.method}`);
    } else {
      subTasks.push('   Usa un ventilatore leggero o apri leggermente la finestra');
    }
    
    if (care.ventilation.duration) {
      subTasks.push(`   Durata: ${care.ventilation.duration}`);
    } else {
      subTasks.push('   Durata: 2-3 ore al giorno per rinforzare il gambo');
    }
    
    subTasks.push('   Beneficio: aiuta a prevenire la "filatura" e rinforza la pianta');
  }

  // Prima fertilizzazione
  if (care.firstFertilization) {
    const fert = care.firstFertilization;
    subTasks.push('💚 Prima Fertilizzazione:');
    subTasks.push(`   Quando: ${fert.when}`);
    subTasks.push(`   Tipo: ${fert.type}`);
    if (fert.dilution) {
      subTasks.push(`   Dosaggio: ${fert.dilution}`);
    } else {
      subTasks.push('   Dosaggio: usa 1/4 della dose consigliata per iniziare');
    }
  }

  // Warning se presente
  if (care.warning) {
    subTasks.push(`⚠️ Attenzione: ${care.warning}`);
  }

  // Note sulla sensibilità ai trapianti
  if (masterData.familySpecificNotes?.transplantSensitivity) {
    const sensitivity = masterData.familySpecificNotes.transplantSensitivity;
    
    if (sensitivity === 'High') {
      subTasks.push('\n⚠️ ATTENZIONE - Sensibilità ai trapianti ALTA:');
      subTasks.push('   • Evita rinvasi multipli se possibile');
      subTasks.push('   • Se devi trapiantare, fai con estrema delicatezza');
      subTasks.push('   • Considera vasetti biodegradabili per evitare di disturbare le radici');
    } else if (sensitivity === 'Medium') {
      subTasks.push('\n⚠️ Sensibilità ai trapianti MEDIA:');
      subTasks.push('   • Trapianta con cura, evitando di rompere il pane di terra');
    }
  }

  // Note comparative se presenti
  if (masterData.familySpecificNotes?.comparisonWithSimilar) {
    subTasks.push(`\n💡 Confronto con specie simili: ${masterData.familySpecificNotes.comparisonWithSimilar}`);
  }

  // Aggiungi suggerimenti nutrizionali avanzati
  if (nutrients.shouldFertilize) {
    subTasks.push(`\n💚 Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  }

  // Aggiungi suggerimenti salute
  if (health) {
    subTasks.push(`🛡️ Protezione: ${health.productToUse} - ${health.reason}`);
  }

  // Trapianto quando
  subTasks.push(`\n📅 Prossimo passo: Trapianto ${care.transplantWhen}`);

  if (subTasks.length === 0) {
    return null;
  }

  return {
    phase: 'Nursing',
    type: 'TASK',
    message: `Le tue piantine di ${task.plantName} stanno crescendo! Segui queste cure dettagliate:`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Genera suggerimenti per la fase di Rinvaso Intermedio
 */
const generateIntermediateRepottingAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null
): LifecycleAdvice | null => {
  if (!masterData.intermediateRepotting?.needed) {
    return null;
  }

  const repotting = masterData.intermediateRepotting;
  const subTasks: string[] = [];

  // Quando fare il rinvaso
  subTasks.push(`📅 Quando: ${repotting.when}`);
  
  // Trigger per rinvaso
  if (repotting.trigger) {
    subTasks.push(`🔍 Segnale: ${repotting.trigger}`);
  } else {
    // Default basato sui giorni
    if (daysAlive >= 25 && daysAlive <= 30) {
      subTasks.push('🔍 Segnale: È il momento ideale per il rinvaso intermedio');
    } else if (daysAlive > 30) {
      subTasks.push('🔍 Segnale: Controlla se le radici escono dai fori di drenaggio');
    }
  }

  // Contenitore
  if (repotting.containerSize) {
    subTasks.push(`📦 Contenitore: ${repotting.containerSize}`);
  } else {
    subTasks.push('📦 Contenitore: vaso 10-12cm di diametro');
  }

  // Terriccio
  if (repotting.soilMix) {
    subTasks.push(`🌱 Terriccio: ${repotting.soilMix}`);
  } else {
    subTasks.push('🌱 Terriccio: terriccio universale + 30% perlite');
  }

  // Procedura passo-passo dettagliata
  subTasks.push('\n📋 Procedura passo-passo:');
  subTasks.push('   1. Prepara il nuovo contenitore con terriccio');
  subTasks.push('   2. Inumidisci leggermente il terriccio');
  subTasks.push('   3. Rimuovi delicatamente la piantina dal contenitore attuale');
  
  // Istruzioni specifiche per seppellimento gambo
  if (repotting.buryStem && repotting.buryStemInstructions) {
    subTasks.push(`   4. ${repotting.buryStemInstructions}`);
  } else if (repotting.buryStem) {
    subTasks.push('   4. Puoi interrare parte del gambo per favorire radici avventizie');
  } else {
    subTasks.push('   4. Posiziona nel nuovo contenitore alla stessa profondità');
  }
  
  subTasks.push('   5. Riempi gli spazi vuoti con terriccio');
  subTasks.push('   6. Compatta leggermente intorno alla base');

  // Cura dopo rinvaso
  if (repotting.aftercare) {
    subTasks.push(`\n💧 Dopo il rinvaso: ${repotting.aftercare}`);
  } else {
    subTasks.push('\n💧 Dopo il rinvaso: mantieni umido per 2-3 giorni, poi normale');
  }

  // Avviso sensibilità trapianti se alta
  if (masterData.familySpecificNotes?.transplantSensitivity === 'High') {
    subTasks.push('\n⚠️ ATTENZIONE: Questa specie è molto sensibile ai trapianti.');
    subTasks.push('   Fai estrema attenzione a non rompere il pane di terra.');
    subTasks.push('   Se possibile, considera di saltare questo rinvaso intermedio.');
  }

  // Aggiungi suggerimenti nutrizionali se disponibili
  if (nutrients.shouldFertilize) {
    subTasks.push(`\n💚 Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  }

  // Aggiungi suggerimenti salute se disponibili
  if (health) {
    subTasks.push(`🛡️ Protezione: ${health.productToUse} - ${health.reason}`);
  }

  return {
    phase: 'IntermediateRepotting',
    type: 'TASK',
    message: `È il momento del rinvaso intermedio per le tue piantine di ${task.plantName}!`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Genera suggerimenti per la fase di Hardening
 */
const generateHardeningAdvice = (
  task: GardenTask,
  masterData: PlantMasterSheet
): LifecycleAdvice | null => {
  const hardening = masterData.hardening;
  const subTasks: string[] = [];
  
  // Se abbiamo dati dettagliati di hardening, usali
  if (hardening && hardening.procedure) {
    const proc = hardening.procedure;
    const tempMin = hardening.temperatureMin;
    const duration = hardening.duration || 10;
    
    subTasks.push(`📅 Durata hardening: ${duration} giorni`);
    
    if (tempMin) {
      subTasks.push(`🌡️ Temperatura minima notturna: ${tempMin}°C`);
      subTasks.push(`   ⚠️ NON esporre se le temperature notturne scendono sotto ${tempMin}°C`);
    }
    
    subTasks.push('\n📋 Procedura giorno per giorno:');
    subTasks.push('\nGiorni 1-3:');
    subTasks.push(`   ${proc.days1to3 || 'Esponi le piantine all\'aperto per 2-3 ore al mattino (evita il sole diretto). Riporta dentro prima del caldo pomeridiano.'}`);
    
    subTasks.push('\nGiorni 4-6:');
    subTasks.push(`   ${proc.days4to6 || 'Aumenta l\'esposizione a 4-6 ore. Puoi esporre anche al sole diretto per 1-2 ore al mattino. Riporta dentro la sera.'}`);
    
    subTasks.push('\nGiorni 7-10:');
    subTasks.push(`   ${proc.days7to10 || 'Esponi per 6-8 ore, incluso sole diretto. Se le temperature notturne lo permettono, lascia fuori anche la notte negli ultimi 2 giorni.'}`);
    
    if (proc.finalCheck) {
      subTasks.push('\n✅ Controllo finale:');
      subTasks.push(`   ${proc.finalCheck}`);
    } else {
      subTasks.push('\n✅ Controllo finale:');
      subTasks.push('   Le piantine sono pronte se:');
      subTasks.push('   • Hanno foglie verdi e robuste (non gialle o bruciate)');
      subTasks.push('   • Il gambo è forte e non filato');
      subTasks.push('   • Hanno resistito alle condizioni esterne senza stress');
    }
  } else {
    // Procedura generica se non abbiamo dati specifici
    subTasks.push('📋 Procedura giorno per giorno:');
    subTasks.push('\nGiorni 1-3:');
    subTasks.push('   Esponi le piantine all\'aperto per 2-3 ore al mattino');
    subTasks.push('   Scegli un luogo ombreggiato (evita il sole diretto)');
    subTasks.push('   Riporta dentro prima del caldo pomeridiano');
    
    subTasks.push('\nGiorni 4-6:');
    subTasks.push('   Aumenta l\'esposizione a 4-6 ore');
    subTasks.push('   Puoi esporre anche al sole diretto per 1-2 ore al mattino');
    subTasks.push('   Riporta dentro la sera per proteggere dal freddo notturno');
    
    subTasks.push('\nGiorni 7-10:');
    subTasks.push('   Esponi per 6-8 ore, incluso sole diretto');
    subTasks.push('   Se le temperature notturne lo permettono, lascia fuori anche la notte negli ultimi 2 giorni');
    
    subTasks.push('\n✅ Controllo finale:');
    subTasks.push('   Le piantine sono pronte se hanno foglie verdi e robuste, gambo forte, e hanno resistito alle condizioni esterne');
  }
  
  subTasks.push('\n⚠️ Attenzione:');
  subTasks.push('   • Se vedi foglie gialle o bruciate, riduci l\'esposizione al sole');
  subTasks.push('   • Se le piantine appassiscono, aumenta l\'irrigazione');
  subTasks.push('   • Proteggi dal vento forte durante i primi giorni');
  
  return {
    phase: 'Hardening',
    type: 'TASK',
    message: `È il momento di preparare le piantine di ${task.plantName} al trapianto. Segui questa procedura di acclimatazione:`,
    subTasks
  };
};

/**
 * Genera suggerimenti per la fase di Trapianto
 */
const generateTransplantingAdvice = async (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null
): Promise<LifecycleAdvice | null> => {
  const subTasks: string[] = [];
  let warning: string | undefined;

  // Verifica condizioni meteo se abbiamo coordinate
  if (garden.coordinates) {
    const weatherCheck = await checkTransplantConditions(
      garden.coordinates.latitude,
      garden.coordinates.longitude,
      masterData.transplanting.minTemp
    );

    if (!weatherCheck.isSuitable) {
      return {
        phase: 'Transplanting',
        type: 'WARNING',
        message: weatherCheck.reason,
        postponeDays: 7,
        subTasks: [
          'Aspetta che le temperature notturne salgano',
          'Continua l\'acclimatazione delle piantine',
          'Prepara il terreno in anticipo'
        ]
      };
    }
  }

  // Correzione per altitudine (migliorata)
  if (garden.altitudeMeters && garden.altitudeMeters > 200) {
    // Determina tipo pianta per ritardo differenziato
    const plantNameUpper = masterData.commonName.toUpperCase();
    let plantType: 'early' | 'standard' | 'late' = 'standard';
    if (['LATTUGA', 'INSALATA', 'RUCOLA', 'SPINACIO', 'RAVANELLO'].some(name => plantNameUpper.includes(name))) {
      plantType = 'early';
    } else if (['POMODORO', 'PEPERONE', 'MELANZANA', 'ZUCCHINA', 'CETRIOLO'].some(name => plantNameUpper.includes(name))) {
      plantType = 'late';
    }
    
    const delayDays = calculateAltitudePlantingDelay(garden.altitudeMeters, plantType);
    const adjustedDate = adjustPlantingDates(new Date(), garden.altitudeMeters, plantType);
    
    if (delayDays > 0) {
      warning = `⚠️ Altitudine ${garden.altitudeMeters}m: Ritardo consigliato di ${delayDays} giorni per il trapianto rispetto alla costa. Data ottimale: ${adjustedDate.toLocaleDateString('it-IT')}`;
      subTasks.unshift(`🏔️ Correzione altitudine: Aspetta ${delayDays} giorni in più rispetto alla data standard`);
    }
  }

  // Validazione compatibilità terreno
  const soilCompatibility = getSoilCompatibility(masterData.commonName, garden.soilType);
  if (!soilCompatibility.compatible) {
    warning = `${warning || ''} ⚠️ COMPATIBILITÀ TERRENO: ${soilCompatibility.reason || 'Terreno non ottimale per questa pianta'}`.trim();
    if (soilCompatibility.optimalSoilTypes) {
      subTasks.push(`💡 Terreni ottimali: ${soilCompatibility.optimalSoilTypes.join(', ')}. Considera miglioramenti o varietà resistenti.`);
    }
  } else if (soilCompatibility.optimalSoilTypes && garden.soilType && soilCompatibility.optimalSoilTypes.includes(garden.soilType)) {
    subTasks.push(`✅ Terreno ${garden.soilType} ideale per ${masterData.commonName}`);
  }

  // Controllo temperatura suolo (se disponibile)
  if (masterData.transplanting?.minTemp && garden.coordinates) {
    try {
      // Nota: Questo richiede chiamata API meteo, quindi lo lasciamo opzionale
      // Il Director già gestisce questo controllo con dati meteo reali
      subTasks.push(`🌡️ Verifica temperatura suolo: minimo ${masterData.transplanting.minTemp}°C richiesto`);
    } catch (error) {
      // Ignora errori
    }
  }

  // Check lunare per trapianto
  const transplantDate = new Date();
  const moonCheck = isIdealPhaseFor('transplant', masterData.nutrientCategory, transplantDate);
  const moonInfo = calculateMoonPhase(transplantDate);
  
  if (!moonCheck.ideal && moonCheck.daysUntilIdeal) {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
    // Non bloccare il trapianto, ma avvisare
  } else {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
  }

  // Opzioni basate su gardenType e finalPlanting
  const finalPlanting = masterData.transplanting.finalPlanting;
  const gardenType = garden.gardenType;
  
  subTasks.push('\n📋 Preparazione in base al tipo di spazio:');
  
  // Opzioni per vaso/contenitore
  if (gardenType === 'Indoor' || (finalPlanting?.containerOptions && gardenType !== 'OpenField')) {
    subTasks.push('\n🏺 Trapianto in VASO:');
    if (finalPlanting?.containerOptions?.minSize) {
      subTasks.push(`   Dimensione minima: ${finalPlanting.containerOptions.minSize}`);
    } else {
      subTasks.push('   Dimensione minima: vaso 30cm di diametro (per piante grandi)');
    }
    
    if (finalPlanting?.containerOptions?.soilMix) {
      subTasks.push(`   Terriccio: ${finalPlanting.containerOptions.soilMix}`);
    } else {
      subTasks.push('   Terriccio: universale + 30% perlite per drenaggio');
    }
    
    if (finalPlanting?.containerOptions?.drainage) {
      subTasks.push(`   Drenaggio: ${finalPlanting.containerOptions.drainage}`);
    } else {
      subTasks.push('   Drenaggio: assicurati che il vaso abbia fori di drenaggio');
      subTasks.push('   Metti uno strato di argilla espansa sul fondo (2-3cm)');
    }
    
    subTasks.push(`   Profondità buca: ${masterData.transplanting.holeDepth}cm`);
  }
  
  // Opzioni per terra aperta
  if (gardenType === 'OpenField' || !gardenType) {
    subTasks.push('\n🌍 Trapianto in TERRA APERTA:');
    
    if (finalPlanting?.groundPlanting?.soilPrep) {
      subTasks.push(`   Preparazione terreno: ${finalPlanting.groundPlanting.soilPrep}`);
    } else {
      subTasks.push('   Preparazione terreno: zappatura profonda 40cm e arieggiatura');
    }
    
    subTasks.push(`   Buche: ${masterData.transplanting.holeDepth}cm profondità, ${masterData.transplanting.holeWidth}cm larghezza`);
    
    if (finalPlanting?.groundPlanting?.spacing) {
      subTasks.push(`   Spaziatura: ${finalPlanting.groundPlanting.spacing}`);
    } else {
      subTasks.push(`   Spaziatura: ${masterData.transplanting.spacing}`);
    }
    
    // Suggerimento humus se disponibile
    const humusSuggestion = suggestHumusAddition(garden, 6); // Assume compost maturo (6+ mesi)
    if (humusSuggestion?.shouldAdd) {
      subTasks.push(`   🌱 ${humusSuggestion.suggestion} - ${humusSuggestion.benefit}`);
    }
  }
  
  // Opzioni per cassone rialzato
  if (gardenType === 'RaisedBed' || garden.isRaisedBed) {
    subTasks.push('\n📦 Trapianto in CASSONE RIALZATO:');
    
    if (finalPlanting?.raisedBed?.bedHeight) {
      subTasks.push(`   Altezza cassone: ${finalPlanting.raisedBed.bedHeight}cm`);
    }
    
    if (finalPlanting?.raisedBed?.soilMix) {
      subTasks.push(`   Terriccio: ${finalPlanting.raisedBed.soilMix}`);
    } else {
      subTasks.push('   Terriccio: mix di terra, compost e perlite');
    }
    
    if (finalPlanting?.raisedBed?.spacing) {
      subTasks.push(`   Spaziatura: ${finalPlanting.raisedBed.spacing}`);
    } else {
      subTasks.push(`   Spaziatura: ${masterData.transplanting.spacing}`);
    }
    
    subTasks.push(`   Buche: ${masterData.transplanting.holeDepth}cm profondità`);
  }
  
  // Installazione supporto
  if (masterData.supportRequirements?.needsSupport) {
    subTasks.push('\n🪴 Installazione Supporto:');
    
    const supportTiming = finalPlanting?.supportInstallation?.when || masterData.supportRequirements.supportTiming;
    
    if (supportTiming === 'AtTransplant') {
      subTasks.push('   ⚠️ INSTALLA IL SUPPORTO SUBITO durante il trapianto');
      if (finalPlanting?.supportInstallation?.instructions) {
        subTasks.push(`   ${finalPlanting.supportInstallation.instructions}`);
      } else {
        subTasks.push(`   Tipo: ${masterData.supportRequirements.supportType || 'Paletto'}`);
        if (masterData.supportRequirements.supportHeight) {
          subTasks.push(`   Altezza: ${masterData.supportRequirements.supportHeight}cm`);
        }
      }
    } else if (supportTiming === 'BeforeFlowering') {
      subTasks.push('   Installa il supporto prima della fioritura');
    } else {
      subTasks.push('   Installa il supporto quando necessario');
    }
  }
  
  // Concimazione fase-specifica
  subTasks.push('\n💚 Concimazione:');
  if (finalPlanting?.finalFertilization) {
    const fert = finalPlanting.finalFertilization;
    subTasks.push(`   Tipo: ${fert.type === 'Vegetative' ? 'Vegetativa (ricca di azoto)' : fert.type === 'Flowering' ? 'Fioritura (ricca di fosforo e potassio)' : 'Bilanciata'}`);
    
    if (fert.product) {
      subTasks.push(`   Prodotto: ${fert.product}`);
    }
    
    if (fert.timing) {
      subTasks.push(`   Quando: ${fert.timing}`);
    }
  } else if (nutrients.shouldFertilize) {
    subTasks.push(`   Concimazione di fondo: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  } else {
    subTasks.push(`   ${masterData.transplanting.soilRequirements}`);
  }

  // Istruzioni specifiche
  subTasks.push('\n🌱 Procedura trapianto:');
  if (masterData.transplanting.buryStem) {
    subTasks.push(`   ⚠️ Interra il gambo: ${masterData.transplanting.buryStemInstructions || 'Interra fino alle prime foglie vere'}`);
  }
  
  subTasks.push('   1. Inumidisci il terreno della buca');
  subTasks.push('   2. Rimuovi delicatamente la piantina dal contenitore');
  subTasks.push('   3. Posiziona nella buca');
  subTasks.push('   4. Riempi gli spazi vuoti con terriccio');
  subTasks.push('   5. Compatta leggermente intorno alla base');
  subTasks.push('   6. Innaffia abbondantemente dopo il trapianto');

  if (masterData.transplanting.protectionNeeded) {
    subTasks.push(`\n🛡️ Protezione: ${masterData.transplanting.protectionInstructions || 'Proteggi dal sole diretto per i primi giorni'}`);
  }

  // Aggiungi suggerimenti salute
  if (health) {
    subTasks.push(`\n🛡️ Protezione preventiva: ${health.productToUse} - ${health.reason}`);
  }

  return {
    phase: 'Transplanting',
    type: 'TASK',
    message: `Le piantine di ${task.plantName} sono pronte per il trapianto definitivo! Ecco la checklist:`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Calcola la data di fine ciclo per una pianta
 * Fine Ciclo = Data Trapianto + harvestWindow.max + 30 giorni buffer
 */
export const calculateEndOfCycle = (
  task: GardenTask,
  masterData: PlantMasterSheet
): Date => {
  // Trova la data di trapianto (se taskType è Transplant, usa quella, altrimenti stima)
  let transplantDate: Date;
  
  if (task.taskType === 'Transplant') {
    transplantDate = new Date(task.date);
  } else {
    // Stima: 60 giorni dopo semina (media per trapianto)
    transplantDate = new Date(task.date);
    transplantDate.setDate(transplantDate.getDate() + 60);
  }

  // Fine Ciclo = Data Trapianto + harvestWindow.max + 30 giorni buffer
  const endOfCycle = new Date(transplantDate);
  
  // Estrai giorni massimi da harvestWindow (es. "60-90 giorni" -> 90)
  // harvestWindow può essere una stringa o un oggetto con startMonth/endMonth
  const harvestWindow = masterData.harvestWindow || '60-90 giorni';
  let maxHarvestDays = 90; // Default
  
  if (typeof harvestWindow === 'string') {
    // Formato stringa: "60-90 giorni"
  const harvestDaysMatch = harvestWindow.match(/(\d+)\s*-\s*(\d+)/);
    maxHarvestDays = harvestDaysMatch ? parseInt(harvestDaysMatch[2], 10) : 90;
  } else if (typeof harvestWindow === 'object' && harvestWindow !== null) {
    // Formato oggetto: { startMonth: number; endMonth: number; }
    // Per colture specializzate, stima giorni basandosi sulla differenza di mesi
    const monthDiff = harvestWindow.endMonth >= harvestWindow.startMonth 
      ? harvestWindow.endMonth - harvestWindow.startMonth
      : (12 - harvestWindow.startMonth) + harvestWindow.endMonth;
    maxHarvestDays = monthDiff * 30; // Approssimazione: ~30 giorni per mese
  }
  
  endOfCycle.setDate(endOfCycle.getDate() + maxHarvestDays + 30);
  
  return endOfCycle;
};

/**
 * Genera suggerimenti per la fase di Produzione
 */
const generateProductionAdvice = (
  daysAlive: number,
  task: GardenTask,
  masterData: PlantMasterSheet,
  nutrients: NutrientAdvice,
  health: HealthAdvice | null,
  currentDate: Date,
  garden: Garden
): LifecycleAdvice | null => {
  const subTasks: string[] = [];

  // Monitoraggio maturazione
  subTasks.push('Monitora la maturazione dei frutti/ortaggi');
  subTasks.push('Raccogli regolarmente per stimolare la produzione continua');

  // Check lunare per raccolto
  const harvestDate = new Date();
  const moonCheck = isIdealPhaseFor('harvest', masterData.nutrientCategory, harvestDate);
  const moonInfo = calculateMoonPhase(harvestDate);
  
  if (moonCheck.ideal) {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason} - Momento ideale per raccogliere`);
  } else if (moonCheck.daysUntilIdeal) {
    subTasks.unshift(`🌙 Luna ${moonInfo.name}: ${moonCheck.reason}`);
  }

  // Aggiungi suggerimenti nutrizionali
  if (nutrients.shouldFertilize) {
    subTasks.push(`Nutrizione: ${nutrients.adviceTitle} - ${nutrients.adviceBody}`);
  }

  // Aggiungi suggerimenti salute
  if (health) {
    subTasks.push(`Protezione: ${health.productToUse} - ${health.reason}`);
  }

  // Check fine ciclo
  const endOfCycle = calculateEndOfCycle(task, masterData);
  const daysUntilEnd = Math.floor((endOfCycle.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEnd <= 7 && daysUntilEnd >= 0) {
    // Fine ciclo imminente
    const wasteAdvice = determineWasteDisposal(masterData, 'Unknown', false, false);
    
    subTasks.push(`⚠️ Fine ciclo tra ${daysUntilEnd} giorni: Prepara la rimozione`);
    subTasks.push(`Smaltimento: ${wasteAdvice.reason}`);
    wasteAdvice.instructions.forEach(instruction => {
      subTasks.push(`  → ${instruction}`);
    });

    if (garden.hasCompostBin && wasteAdvice.canCompost) {
      subTasks.push(`✅ Puoi compostare: ${wasteAdvice.instructions.join(', ')}`);
    }
  }

  return {
    phase: 'Production',
    type: daysUntilEnd <= 7 ? 'TASK' : 'INFO',
    message: `Le tue piante di ${task.plantName} sono in produzione! ${daysUntilEnd <= 7 ? `Fine ciclo tra ${daysUntilEnd} giorni.` : 'Continua a monitorare e curare:'}`,
    subTasks,
    relatedAdvice: {
      nutrients,
      health: health || undefined
    }
  };
};

/**
 * Funzione principale: controlla lo stato del ciclo vitale e genera suggerimenti
 */
export const checkLifecycleStatus = async (
  task: GardenTask,
  masterData: PlantMasterSheet,
  garden: Garden,
  currentDate: Date = new Date()
): Promise<LifecycleAdvice | null> => {
  // Calcola giorni trascorsi
  const daysAlive = calculateDaysActive(task);

  // Determina la fase corrente
  const currentPhase = determineLifecyclePhase(daysAlive, masterData, task);

  // Calcola suggerimenti nutrizionali e di salute solo se non è fase Sowing
  // Durante Sowing (giorno 0), la pianta è in germinazione, non ha bisogno di nutrienti
  let nutrients: NutrientAdvice;
  let health: HealthAdvice | null;
  
  if (currentPhase === 'Sowing') {
    // Non calcolare nutrienti durante Sowing
    nutrients = {
      shouldFertilize: false,
      elementFocus: 'None',
      adviceTitle: '',
      adviceBody: '',
      soilNote: '',
      phase: 'Establishment'
    };
    health = null;
  } else {
    // Calcola suggerimenti nutrizionali e di salute per le altre fasi
    nutrients = calculateNutrientNeeds(masterData, daysAlive, garden.soilType, task.taskType);
    health = calculateHealthStrategy(masterData, daysAlive);
  }

  // Genera suggerimenti in base alla fase
  switch (currentPhase) {
    case 'Sowing':
      return generateSowingAdvice(task, masterData);

    case 'Germination':
      return generateGerminationAdvice(daysAlive, task, masterData);

    case 'Nursing':
      return generateNursingAdvice(daysAlive, task, masterData, garden, nutrients, health);

    case 'IntermediateRepotting':
      return generateIntermediateRepottingAdvice(daysAlive, task, masterData, nutrients, health);

    case 'Hardening':
      return generateHardeningAdvice(task, masterData);

    case 'Transplanting':
      return await generateTransplantingAdvice(daysAlive, task, masterData, garden, nutrients, health);

    case 'Production':
      return generateProductionAdvice(daysAlive, task, masterData, nutrients, health, currentDate, garden);

    default:
      return null;
  }
};

/**
 * Gestisce reminder foto settimanali quando cambia la fase del ciclo vitale
 * Chiamato quando un task cambia fase (es. da Germination a Nursing)
 */
export async function handleLifecyclePhaseChange(
  task: GardenTask,
  newPhase: LifecyclePhase,
  userId?: string
): Promise<void> {
  if (!userId || task.taskType !== 'Sowing') {
    return; // Solo per task di semina
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  try {
    // Quando entra in Germination o Nursing, crea reminder settimanale
    if (newPhase === 'Germination' || newPhase === 'Nursing' || newPhase === 'Hardening') {
      const frequencyDays = 7; // Settimanale
      await createWeeklyReminder(supabase, task.id, userId, task.gardenId, frequencyDays);
    } 
    // Quando entra in Production, aggiorna frequenza a ogni 2 settimane
    else if (newPhase === 'Production') {
      await updateReminderFrequency(supabase, task.id, 'Production');
    }
  } catch (error) {
    console.error('Error handling lifecycle phase change for reminders:', error);
    // Non bloccare il flusso se il reminder fallisce
  }
}

/**
 * Genera automaticamente il prossimo task di trattamento quando uno è completato
 * Chiamato quando un task con taskType 'Treatment' viene marcato come completed
 */
export const generateNextTreatmentTask = (
  completedTask: GardenTask,
  allTasks: GardenTask[]
): GardenTask | null => {
  // Verifica che sia un task di trattamento completato
  if (completedTask.taskType !== 'Treatment' || !completedTask.completed) {
    return null;
  }

  // Verifica che abbia un productId
  if (!completedTask.treatmentProductId) {
    return null;
  }

  // Verifica che non esista già un task futuro per lo stesso prodotto e pianta
  const existingFutureTask = allTasks.find(t => 
    t.gardenId === completedTask.gardenId &&
    t.plantName === completedTask.plantName &&
    t.taskType === 'Treatment' &&
    t.treatmentProductId === completedTask.treatmentProductId &&
    !t.completed &&
    new Date(t.date) > new Date(completedTask.date)
  );

  if (existingFutureTask) {
    return null; // Già esiste un task futuro
  }

  // Genera prossimo task
  return scheduleNextTreatment(
    completedTask.id,
    completedTask.treatmentProductId,
    completedTask.date,
    completedTask.gardenId,
    completedTask.plantName,
    completedTask.variety
  );
};

