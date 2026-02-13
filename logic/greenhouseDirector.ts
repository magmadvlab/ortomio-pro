'use client';

import type {
  Garden,
  GardenTask,
  DirectorPrompt,
  UrgentAlert
} from '../types';
import type { GreenhouseConfig } from '../types/greenhouse';
import { format, differenceInDays, addDays } from 'date-fns';

/**
 * Director specializzato per serre
 * Genera suggerimenti specifici per gestione serra, ventilazione, riscaldamento
 * e alert meteo integrati (vento, neve, temperature estreme)
 */

export interface GreenhouseTaskAdvice {
  urgentAlerts: UrgentAlert[];
  prompts: DirectorPrompt[];
}

/**
 * Genera suggerimenti per gestione serra
 */
export function generateGreenhouseSuggestions(
  garden: Garden,
  tasks: GardenTask[],
  currentDate: Date,
  weatherForecast?: {
    tempMin?: number;
    tempMax?: number;
    windSpeed?: number;
    rainForecastMm?: number;
    snowForecastMm?: number;
  }
): GreenhouseTaskAdvice {
  const urgentAlerts: UrgentAlert[] = [];
  const prompts: DirectorPrompt[] = [];
  
  if (!garden.greenhouseConfig) {
    return { urgentAlerts, prompts };
  }
  
  const config = garden.greenhouseConfig;
  const todayIso = format(currentDate, 'yyyy-MM-dd');
  
  // ============================================
  // 1. ALERT METEO CRITICI - PRIORITÀ MASSIMA
  // ============================================
  
  if (weatherForecast) {
    // 1.1 VENTO FORTE - Chiudi finestre/aperture
    if (weatherForecast.windSpeed && weatherForecast.windSpeed > 50) {
      urgentAlerts.push({
        type: 'Storm',
        message: `⚠️ VENTO FORTE PREVISTO: ${weatherForecast.windSpeed.toFixed(0)} km/h`,
        action: 'CHIUDI IMMEDIATAMENTE tutte le finestre e aperture della serra. Verifica ancoraggio copertura e rinforza se necessario.',
        blockOperations: true,
        timing: 'now'
      });
      
      const hasOpenWindTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.plantName?.toLowerCase().includes('vento') &&
        !t.completed
      );
      
      if (!hasOpenWindTask) {
        prompts.push({
          id: `greenhouse_wind_alert_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'High',
          title: '🌪️ Vento Forte - Chiudi Serra',
          body: `Vento previsto: ${weatherForecast.windSpeed.toFixed(0)} km/h. Chiudi tutte le aperture, verifica ancoraggio copertura e rinforza punti deboli. Rischio danni strutturali!`,
          options: [{
            id: 'create_task',
            label: 'Chiudi Serra Ora',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: `Chiusura serra per vento forte (${weatherForecast.windSpeed.toFixed(0)} km/h)`,
              taskType: 'Treatment',
              date: todayIso,
              completed: false,
              isSuggested: true,
              suggestedBy: 'greenhouse_director',
              notes: 'Chiudi finestre, porte e aperture. Verifica ancoraggio copertura. Rinforza con pesi/corde se necessario. Controlla dopo la tempesta.'
            }
          }]
        });
      }
    }
    
    // 1.2 NEVE - Rimuovi accumulo
    if (weatherForecast.snowForecastMm && weatherForecast.snowForecastMm > 5) {
      urgentAlerts.push({
        type: 'Storm',
        message: `❄️ NEVE PREVISTA: ${weatherForecast.snowForecastMm.toFixed(0)} mm`,
        action: 'Prepara attrezzi per rimozione neve dalla copertura. Accumulo eccessivo può causare crollo!',
        blockOperations: false,
        timing: 'now'
      });
      
      const hasOpenSnowTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.plantName?.toLowerCase().includes('neve') &&
        !t.completed
      );
      
      if (!hasOpenSnowTask) {
        prompts.push({
          id: `greenhouse_snow_alert_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'High',
          title: '❄️ Neve Prevista - Prepara Rimozione',
          body: `Neve prevista: ${weatherForecast.snowForecastMm.toFixed(0)} mm. Prepara attrezzi per rimozione neve dalla copertura. Rimuovi accumulo appena possibile per evitare sovraccarico strutturale.`,
          options: [{
            id: 'create_task',
            label: 'Programma Rimozione Neve',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: `Rimozione neve da copertura serra`,
              taskType: 'Treatment',
              date: format(addDays(currentDate, 1), 'yyyy-MM-dd'),
              completed: false,
              isSuggested: true,
              suggestedBy: 'greenhouse_director',
              notes: 'Rimuovi neve dalla copertura con scopa morbida o attrezzo apposito. NON usare pale metalliche (rischio rottura). Lavora dall\'esterno in sicurezza.'
            }
          }]
        });
      }
    }
    
    // 1.3 CALDO ECCESSIVO - Attiva ombreggiamento/ventilazione
    if (weatherForecast.tempMax && weatherForecast.tempMax > 35) {
      const internalTemp = weatherForecast.tempMax + (config.hasHeating ? 7 : 5);
      
      urgentAlerts.push({
        type: 'Heat',
        message: `🌡️ CALDO ESTREMO: Temperatura esterna ${weatherForecast.tempMax.toFixed(0)}°C → interna ~${internalTemp.toFixed(0)}°C`,
        action: config.hasVentilation 
          ? 'APRI tutte le finestre e attiva ventilazione. Considera ombreggiamento.'
          : 'APRI tutte le finestre. Considera ombreggiamento o teli ombreggianti.',
        blockOperations: false,
        timing: 'now'
      });
      
      const hasOpenHeatTask = tasks.some(t => 
        t.gardenId === garden.id &&
        (t.plantName?.toLowerCase().includes('caldo') || t.plantName?.toLowerCase().includes('ombreggiamento')) &&
        !t.completed
      );
      
      if (!hasOpenHeatTask) {
        prompts.push({
          id: `greenhouse_heat_alert_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'High',
          title: '🌡️ Caldo Eccessivo - Ventila Serra',
          body: `Temperatura esterna prevista: ${weatherForecast.tempMax.toFixed(0)}°C. All'interno della serra può raggiungere ~${internalTemp.toFixed(0)}°C! ${config.hasVentilation ? 'Attiva ventilazione e apri finestre.' : 'Apri tutte le finestre.'} Considera ombreggiamento.`,
          options: [{
            id: 'create_task',
            label: 'Ventila e Ombreggia',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: `Ventilazione serra per caldo (${weatherForecast.tempMax.toFixed(0)}°C)`,
              taskType: 'Treatment',
              date: todayIso,
              completed: false,
              isSuggested: true,
              suggestedBy: 'greenhouse_director',
              notes: `Apri tutte le finestre e porte. ${config.hasVentilation ? 'Attiva ventilatori.' : ''} Applica teli ombreggianti o bianco di Spagna su copertura se necessario. Aumenta irrigazioni.`
            }
          }]
        });
      }
    }
    
    // 1.4 GELO - Attiva riscaldamento o chiudi
    if (weatherForecast.tempMin !== undefined && weatherForecast.tempMin < 0) {
      const internalTemp = weatherForecast.tempMin + (config.hasHeating ? 7 : 2);
      
      if (internalTemp < 2) {
        urgentAlerts.push({
          type: 'Frost',
          message: `❄️ GELO PREVISTO: Temperatura esterna ${weatherForecast.tempMin.toFixed(0)}°C → interna ~${internalTemp.toFixed(0)}°C`,
          action: config.hasHeating 
            ? 'ATTIVA riscaldamento serra. Verifica che sia funzionante.'
            : 'CHIUDI serra e aggiungi protezioni interne (teli, pacciamatura). Considera riscaldamento d\'emergenza.',
          blockOperations: true,
          timing: 'now'
        });
        
        const hasOpenFrostTask = tasks.some(t => 
          t.gardenId === garden.id &&
          (t.plantName?.toLowerCase().includes('gelo') || t.plantName?.toLowerCase().includes('riscaldamento')) &&
          !t.completed
        );
        
        if (!hasOpenFrostTask) {
          prompts.push({
            id: `greenhouse_frost_alert_${garden.id}_${todayIso}`,
            category: 'seasonal_baseline',
            priority: 'High',
            title: '❄️ Gelo Previsto - Proteggi Serra',
            body: `Temperatura minima prevista: ${weatherForecast.tempMin.toFixed(0)}°C. All'interno: ~${internalTemp.toFixed(0)}°C. ${config.hasHeating ? 'Attiva riscaldamento.' : 'Chiudi serra e aggiungi protezioni interne.'} Rischio danni da gelo!`,
            options: [{
              id: 'create_task',
              label: 'Proteggi da Gelo',
              actionType: 'create_task',
              createTask: {
                gardenId: garden.id,
                plantName: `Protezione serra da gelo (${weatherForecast.tempMin.toFixed(0)}°C)`,
                taskType: 'Treatment',
                date: todayIso,
                completed: false,
                isSuggested: true,
                suggestedBy: 'greenhouse_director',
                notes: config.hasHeating 
                  ? 'Attiva riscaldamento serra. Verifica funzionamento. Chiudi tutte le aperture per trattenere calore.'
                  : 'Chiudi serra completamente. Aggiungi teli termici interni. Pacciama base piante. Considera riscaldamento d\'emergenza (candele, stufa).'
              }
            }]
          });
        }
      }
    }
    
    // 1.5 TEMPESTA/PIOGGIA INTENSA - Verifica chiusura
    if (weatherForecast.rainForecastMm && weatherForecast.rainForecastMm > 30) {
      const hasOpenStormTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.plantName?.toLowerCase().includes('tempesta') &&
        !t.completed
      );
      
      if (!hasOpenStormTask) {
        prompts.push({
          id: `greenhouse_storm_alert_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'Medium',
          title: '🌧️ Tempesta Prevista - Verifica Serra',
          body: `Pioggia intensa prevista: ${weatherForecast.rainForecastMm.toFixed(0)} mm. Verifica che tutte le aperture siano chiuse e che non ci siano infiltrazioni. Controlla drenaggio.`,
          options: [{
            id: 'create_task',
            label: 'Verifica Chiusura',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: `Verifica chiusura serra per tempesta`,
              taskType: 'Treatment',
              date: todayIso,
              completed: false,
              isSuggested: true,
              suggestedBy: 'greenhouse_director',
              notes: 'Chiudi finestre e porte. Verifica che non ci siano infiltrazioni. Controlla drenaggio esterno. Dopo la tempesta, ispeziona copertura per danni.'
            }
          }]
        });
      }
    }
  }
  
  // ============================================
  // 2. OPERAZIONI PERIODICHE SERRA
  // ============================================
  
  // 2.1 Pulizia copertura (ogni 3 mesi)
  const lastCleaningTask = tasks
    .filter(t => 
      t.gardenId === garden.id &&
      t.plantName?.toLowerCase().includes('pulizia copertura') &&
      t.completed
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const daysSinceLastCleaning = lastCleaningTask 
    ? differenceInDays(currentDate, new Date(lastCleaningTask.date))
    : 999;
  
  if (daysSinceLastCleaning >= 90) {
    const hasOpenCleaningTask = tasks.some(t => 
      t.gardenId === garden.id &&
      t.plantName?.toLowerCase().includes('pulizia copertura') &&
      !t.completed
    );
    
    if (!hasOpenCleaningTask) {
      prompts.push({
        id: `greenhouse_cleaning_reminder_${garden.id}_${todayIso}`,
        category: 'seasonal_baseline',
        priority: 'Medium',
        title: '🧹 Pulizia Copertura Serra',
        body: `È passato ${daysSinceLastCleaning} giorni dall'ultima pulizia. Pulisci la copertura per massimizzare la trasmissione della luce (fino a +30% luminosità). Rimuovi alghe, polvere e depositi.`,
        options: [{
          id: 'create_task',
          label: 'Programma Pulizia',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Pulizia copertura serra',
            taskType: 'Treatment',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'greenhouse_director',
            notes: `Pulisci ${config.coveringType === 'Glass' ? 'vetri' : config.coveringType === 'Polycarbonate' ? 'pannelli policarbonato' : 'telo polietilene'} con acqua e sapone neutro. Rimuovi alghe, polvere, depositi. Lavora in sicurezza dall'esterno. Migliora trasmissione luce fino a +30%.`
          }
        }]
      });
    }
  }
  
  // 2.2 Disinfezione serra (inizio stagione)
  const month = currentDate.getMonth() + 1;
  const isStartOfSeason = month === 2 || month === 3; // Febbraio-Marzo
  
  if (isStartOfSeason) {
    const hasDisinfectionThisYear = tasks.some(t => 
      t.gardenId === garden.id &&
      t.plantName?.toLowerCase().includes('disinfezione') &&
      new Date(t.date).getFullYear() === currentDate.getFullYear()
    );
    
    if (!hasDisinfectionThisYear) {
      prompts.push({
        id: `greenhouse_disinfection_${garden.id}_${currentDate.getFullYear()}`,
        category: 'seasonal_baseline',
        priority: 'High',
        title: '🧪 Disinfezione Serra Inizio Stagione',
        body: 'Disinfetta la serra prima di iniziare le nuove coltivazioni. Elimina patogeni, spore fungine e uova di parassiti rimasti dall\'anno precedente. Previene malattie!',
        options: [{
          id: 'create_task',
          label: 'Programma Disinfezione',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Disinfezione serra inizio stagione',
            taskType: 'Treatment',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'greenhouse_director',
            notes: 'Svuota serra. Pulisci struttura, bancali, attrezzi. Disinfetta con prodotti idonei (es. candeggina diluita 1:10, perossido idrogeno). Arieggia bene prima di reintrodurre piante.'
          }
        }]
      });
    }
  }
  
  // 2.3 Controllo ventilazione (se presente)
  if (config.hasVentilation) {
    const lastVentCheck = tasks
      .filter(t => 
        t.gardenId === garden.id &&
        t.plantName?.toLowerCase().includes('ventilazione') &&
        t.completed
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const daysSinceVentCheck = lastVentCheck 
      ? differenceInDays(currentDate, new Date(lastVentCheck.date))
      : 999;
    
    if (daysSinceVentCheck >= 30) {
      const hasOpenVentTask = tasks.some(t => 
        t.gardenId === garden.id &&
        t.plantName?.toLowerCase().includes('ventilazione') &&
        !t.completed
      );
      
      if (!hasOpenVentTask) {
        prompts.push({
          id: `greenhouse_ventilation_check_${garden.id}_${todayIso}`,
          category: 'seasonal_baseline',
          priority: 'Low',
          title: '💨 Controllo Sistema Ventilazione',
          body: `Verifica che il sistema di ventilazione funzioni correttamente. Pulisci filtri, controlla motori e aperture automatiche.`,
          options: [{
            id: 'create_task',
            label: 'Controlla Ventilazione',
            actionType: 'create_task',
            createTask: {
              gardenId: garden.id,
              plantName: 'Controllo sistema ventilazione serra',
              taskType: 'Treatment',
              date: format(addDays(currentDate, 7), 'yyyy-MM-dd'),
              completed: false,
              isSuggested: true,
              suggestedBy: 'greenhouse_director',
              notes: 'Verifica funzionamento ventilatori. Pulisci filtri e griglie. Controlla aperture automatiche (se presenti). Lubrifica meccanismi se necessario.'
            }
          }]
        });
      }
    }
  }
  
  // 2.4 Controllo riscaldamento (se presente, in autunno)
  if (config.hasHeating && (month === 10 || month === 11)) {
    const hasHeatingCheckThisYear = tasks.some(t => 
      t.gardenId === garden.id &&
      t.plantName?.toLowerCase().includes('riscaldamento') &&
      new Date(t.date).getFullYear() === currentDate.getFullYear() &&
      new Date(t.date).getMonth() >= 9 // Da ottobre in poi
    );
    
    if (!hasHeatingCheckThisYear) {
      prompts.push({
        id: `greenhouse_heating_check_${garden.id}_${currentDate.getFullYear()}`,
        category: 'seasonal_baseline',
        priority: 'High',
        title: '🔥 Controllo Riscaldamento Serra',
        body: 'Verifica il sistema di riscaldamento PRIMA dell\'inverno. Controlla funzionamento, combustibile/energia, termostati. Evita emergenze con il gelo!',
        options: [{
          id: 'create_task',
          label: 'Controlla Riscaldamento',
          actionType: 'create_task',
          createTask: {
            gardenId: garden.id,
            plantName: 'Controllo sistema riscaldamento serra',
            taskType: 'Treatment',
            date: todayIso,
            completed: false,
            isSuggested: true,
            suggestedBy: 'greenhouse_director',
            notes: 'Verifica funzionamento riscaldamento. Controlla combustibile/energia. Testa termostati. Pulisci bruciatori/resistenze. Verifica sicurezza (CO, perdite gas). Prepara per inverno!'
          }
        }]
      });
    }
  }
  
  return { urgentAlerts, prompts };
}
