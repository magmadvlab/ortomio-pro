import { PlantMasterSheet, GardenTask, Garden } from '../types';
import { protectionProducts, PlantProtectionProduct } from '../data/treatments';
import { getSeasonForDate, Season } from '../utils/seasonalAdjustment';

export interface HealthAdvice {
  productToUse: string; // Nome del prodotto
  productId?: string; // ID per riferimento
  reason: string; // Perché?
  priority: 'High' | 'Medium' | 'Low';
  actionType: 'Prevent' | 'Monitor';
  nextTreatmentDate?: string; // Data suggerita per prossimo trattamento
  dosage?: string;
  applicationNotes?: string;
  season?: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  windAdvice?: WindAdvice; // Consiglio aggiuntivo per vento
}

export interface WindAdvice {
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  action?: string;
  improvement?: string;
}

/**
 * Determina la stagione corrente dal mese e latitudine
 * @deprecated Usa getSeasonForDate invece. Mantenuto per retrocompatibilità.
 */
export const getCurrentSeason = (latitude: number = 0): Season => {
  return getSeasonForDate(new Date(), latitude);
};

/**
 * Trova un prodotto per ID
 */
export const getProductById = (id: string): PlantProtectionProduct | undefined => {
  return protectionProducts.find(p => p.id === id);
};

/**
 * Calcola la prossima data di trattamento basata sulla frequenza
 */
export const calculateNextTreatmentDate = (
  productId: string,
  lastTreatmentDate?: string
): string | undefined => {
  const product = getProductById(productId);
  if (!product || product.frequencyDays === 0) return undefined;
  
  const baseDate = lastTreatmentDate 
    ? new Date(lastTreatmentDate)
    : new Date();
  
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + product.frequencyDays);
  
  return nextDate.toISOString().split('T')[0];
};

/**
 * Calcola la strategia di difesa per una pianta
 */
export const calculateHealthStrategy = (
  plant: PlantMasterSheet,
  daysActive: number,
  season?: Season,
  latitude: number = 0
): HealthAdvice | null => {
  const currentSeason = season || getCurrentSeason(latitude);
  
  // 1. STRATEGIA GENERICA DI RINFORZO (Tutti) - Post-trapianto
  if (daysActive < 14) {
    const propoli = getProductById('propoli');
    return {
      productToUse: 'Propoli o Alghe',
      productId: 'propoli',
      reason: 'Aiuta a superare lo stress da trapianto e stimola le difese naturali della pianta.',
      priority: 'Low',
      actionType: 'Prevent',
      dosage: propoli?.dosage,
      applicationNotes: propoli?.notes,
      season: currentSeason
    };
  }

  // 2. STRATEGIA PER CUCURBITACEE (Zucchine, Cetrioli, Meloni)
  // Problema principale: Oidio (Mal bianco)
  if (plant.family === 'Cucurbitaceae') {
    if (daysActive > 30 && (currentSeason === 'Spring' || currentSeason === 'Summer')) {
      const zeolite = getProductById('zeolite');
      return {
        productToUse: 'Zeolite Micronizzata',
        productId: 'zeolite',
        reason: 'Le cucurbitacee sono soggette a Oidio (mal bianco) quando l\'umidità sale. La Zeolite asciuga la foglia creando una barriera fisica.',
        priority: 'High',
        actionType: 'Prevent',
        dosage: zeolite?.dosage,
        applicationNotes: zeolite?.notes,
        season: currentSeason,
        nextTreatmentDate: calculateNextTreatmentDate('zeolite')
      };
    }
  }

  // 3. STRATEGIA PER SOLANACEE (Pomodori, Melanzane)
  // Problema principale: Peronospora (funghi) e Cimici/Afidi
  if (plant.family === 'Solanaceae') {
    if (currentSeason === 'Spring' && daysActive > 20) {
      const zeolite = getProductById('zeolite');
      const rame = getProductById('rame');
      return {
        productToUse: 'Rame (Basso Dosaggio) o Zeolite',
        productId: 'zeolite', // Preferiamo Zeolite se possibile
        reason: 'Prevenzione Peronospora tipica delle piogge primaverili. La Zeolite è preferibile al Rame se possibile.',
        priority: 'Medium',
        actionType: 'Prevent',
        dosage: rame?.dosage,
        applicationNotes: 'Usare Rame solo se necessario e rispettare limiti biologici annuali. Preferire Zeolite.',
        season: currentSeason,
        nextTreatmentDate: calculateNextTreatmentDate('zeolite')
      };
    }
    
    if (currentSeason === 'Summer' && daysActive > 40) {
      const neem = getProductById('neem');
      const sapone = getProductById('sapone_molle');
      return {
        productToUse: 'Olio di Neem + Sapone Molle',
        productId: 'neem',
        reason: 'In estate aumenta la pressione di Cimici e Afidi. Il Neem li rende sterili e repellente. Il sapone molle lava la melata.',
        priority: 'High',
        actionType: 'Prevent',
        dosage: `${neem?.dosage} + ${sapone?.dosage}`,
        applicationNotes: 'Applicare al tramonto. Il sapone molle migliora l\'adesione del Neem.',
        season: currentSeason,
        nextTreatmentDate: calculateNextTreatmentDate('neem')
      };
    }
  }

  // 4. STRATEGIA PER BRASSICACEE (Cavoli)
  // Problema: Cavolaia (bruchi)
  if (plant.family === 'Brassicaceae' && daysActive > 20) {
    const bacillus = getProductById('bacillus_thuringiensis');
    return {
      productToUse: 'Bacillus Thuringiensis (o controllo manuale)',
      productId: 'bacillus_thuringiensis',
      reason: 'Controlla la pagina inferiore delle foglie per uova di Cavolaia (farfalla bianca). Intervenire tempestivamente.',
      priority: 'Medium',
      actionType: 'Monitor',
      dosage: bacillus?.dosage,
      applicationNotes: 'Controllare settimanalmente la pagina inferiore delle foglie.',
      season: currentSeason
    };
  }

  // 5. Logica basata su suscettibilità specifica
  if (plant.susceptibility) {
    const { fungalDiseases, pests, preventiveStrategy, criticalPeriods } = plant.susceptibility;
    
    // Controlla se siamo in un periodo critico
    let isCriticalPeriod = false;
    let criticalRisk: 'High' | 'Medium' | 'Low' = 'Low';
    
    if (criticalPeriods && criticalPeriods.length > 0) {
      for (const period of criticalPeriods) {
        if (period.season === currentSeason && 
            daysActive >= period.daysActive.min && 
            daysActive <= period.daysActive.max) {
          isCriticalPeriod = true;
          criticalRisk = period.risk;
          break;
        }
      }
    }
    
    // Se alta suscettibilità e pianta adulta o periodo critico
    if (preventiveStrategy === 'HIGH' && (daysActive > 30 || isCriticalPeriod)) {
      // Priorità a funghi se presenti e in stagione umida
      if (fungalDiseases.length > 0 && (currentSeason === 'Spring' || currentSeason === 'Summer')) {
        const zeolite = getProductById('zeolite');
        const priority = isCriticalPeriod && criticalRisk === 'High' ? 'High' : 'Medium';
        return {
          productToUse: 'Zeolite Micronizzata',
          productId: 'zeolite',
          reason: `Prevenzione ${fungalDiseases.join(', ')}. La Zeolite crea una barriera fisica protettiva.`,
          priority,
          actionType: 'Prevent',
          dosage: zeolite?.dosage,
          applicationNotes: zeolite?.notes,
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('zeolite')
        };
      }
      
      // Priorità a parassiti se presenti e in estate
      if (pests.length > 0 && currentSeason === 'Summer' && daysActive > 30) {
        const neem = getProductById('neem');
        const priority = isCriticalPeriod && criticalRisk === 'High' ? 'High' : 'Medium';
        return {
          productToUse: 'Olio di Neem',
          productId: 'neem',
          reason: `Prevenzione ${pests.join(', ')}. Il Neem agisce come repellente e interferisce con il ciclo riproduttivo.`,
          priority,
          actionType: 'Prevent',
          dosage: neem?.dosage,
          applicationNotes: neem?.notes,
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('neem')
        };
      }
    }
    
    // Se media suscettibilità, suggerisce solo in periodi critici
    if (preventiveStrategy === 'MEDIUM' && isCriticalPeriod) {
      if (fungalDiseases.length > 0) {
        const zeolite = getProductById('zeolite');
        return {
          productToUse: 'Zeolite Micronizzata',
          productId: 'zeolite',
          reason: `Periodo critico per ${fungalDiseases.join(', ')}. Prevenzione consigliata.`,
          priority: criticalRisk === 'High' ? 'High' : 'Medium',
          actionType: 'Prevent',
          dosage: zeolite?.dosage,
          applicationNotes: zeolite?.notes,
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('zeolite')
        };
      }
      
      if (pests.length > 0) {
        const neem = getProductById('neem');
        return {
          productToUse: 'Olio di Neem',
          productId: 'neem',
          reason: `Periodo critico per ${pests.join(', ')}. Prevenzione consigliata.`,
          priority: criticalRisk === 'High' ? 'High' : 'Medium',
          actionType: 'Prevent',
          dosage: neem?.dosage,
          applicationNotes: neem?.notes,
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('neem')
        };
      }
    }
    
    // Se bassa suscettibilità, suggerisce solo se esplicitamente necessario (periodo critico con rischio alto)
    if (preventiveStrategy === 'LOW' && isCriticalPeriod && criticalRisk === 'High') {
      if (fungalDiseases.length > 0 || pests.length > 0) {
        const propoli = getProductById('propoli');
        return {
          productToUse: 'Propoli Agricola',
          productId: 'propoli',
          reason: `Rinforzo delle difese naturali durante periodo critico.`,
          priority: 'Low',
          actionType: 'Prevent',
          dosage: propoli?.dosage,
          applicationNotes: propoli?.notes,
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('propoli')
        };
      }
    }
  }

  return null;
};

/**
 * Crea un nuovo task per il prossimo trattamento ricorrente
 * Chiamato quando un trattamento è completato per auto-schedulare il prossimo
 */
export const scheduleNextTreatment = (
  taskId: string,
  productId: string,
  lastTreatmentDate: string,
  gardenId: string,
  plantName: string,
  variety?: string
): GardenTask | null => {
  const product = getProductById(productId);
  
  if (!product || product.frequencyDays === 0) {
    return null; // Prodotto non trovato o non ricorrente
  }

  // Calcola prossima data
  const nextDate = calculateNextTreatmentDate(productId, lastTreatmentDate);
  
  if (!nextDate) {
    return null;
  }

  // Crea nuovo task
  const nextTask: GardenTask = {
    id: crypto.randomUUID(),
    gardenId,
    plantName,
    variety,
    taskType: 'Treatment',
    treatmentProductId: productId,
    date: nextDate,
    completed: false,
    notes: `Trattamento ricorrente: ${product.name}. ${product.notes || ''}`
  };

  return nextTask;
};

/**
 * Calcola l'effetto del vento sulla salute della pianta
 * Ristagno aria (basso vento) → rischio funghi
 * Vento forte → stress meccanico + evapotraspirazione
 */
export const calculateWindEffect = (
  windProtection: Garden['windProtection'],
  plant: PlantMasterSheet
): WindAdvice => {
  if (!windProtection) {
    return {
      risk: 'LOW',
      message: '✅ Circolazione aria non specificata. Assumendo condizioni normali.',
    };
  }

  if (windProtection === 'Low') {
    // Ristagno aria = funghi
    const fungiRisk = plant.susceptibility?.fungalDiseases && plant.susceptibility.fungalDiseases.length > 0;

    if (fungiRisk) {
      return {
        risk: 'HIGH',
        message: `⚠️ Bassa circolazione aria + pianta suscettibile = alto rischio Oidio/Peronospora.`,
        action: 'Aumenta frequenza trattamenti preventivi (Zeolite ogni 10gg invece di 20gg). Applica trattamenti al mattino quando l\'aria è più secca.',
        improvement: 'Considera ventilatore solare, pota vegetazione circostante, o installa frangivento parziale per migliorare circolazione senza bloccare completamente il vento.',
      };
    }

    // Anche senza funghi specifici, ristagno aria è problematico
    return {
      risk: 'MEDIUM',
      message: 'Bassa circolazione aria può favorire sviluppo di malattie fungine.',
      action: 'Monitora attentamente segni di funghi (macchie fogliari, muffa). Trattamenti preventivi consigliati.',
      improvement: 'Migliora circolazione aria potando vegetazione circostante o installando ventilatore.',
    };
  }

  if (windProtection === 'High') {
    // Vento forte = stress meccanico + evapotraspirazione
    const isTallPlant = plant.family === 'Solanaceae' || // Pomodori, peperoni
                        plant.family === 'Cucurbitaceae' || // Zucchine rampicanti
                        plant.commonName.toUpperCase().includes('FAGIOLO') ||
                        plant.commonName.toUpperCase().includes('PISELLO');

    if (isTallPlant) {
      return {
        risk: 'MEDIUM',
        message: 'Vento forte: stress meccanico e disidratazione accelerata per piante alte.',
        action: 'Tutoraggio obbligatorio per piante alte. Aumenta irrigazione del 20% per compensare evapotraspirazione. Lega i fusti ai tutori con rafia o legacci morbidi.',
        improvement: 'Installa frangivento o siepe protettiva a 2-3 metri di distanza per ridurre velocità vento senza eliminarlo completamente.',
      };
    }

    // Piante basse ma comunque stressate
    return {
      risk: 'MEDIUM',
      message: 'Vento forte può causare disidratazione e stress meccanico.',
      action: 'Aumenta frequenza irrigazione del 15-20%. Proteggi piante giovani con teli o campane.',
      improvement: 'Considera frangivento parziale per ridurre velocità vento.',
    };
  }

  // Medium = condizioni ottimali
  return {
    risk: 'LOW',
    message: '✅ Circolazione aria ottimale. Vento moderato previene ristagno senza causare stress eccessivo.',
  };
};

