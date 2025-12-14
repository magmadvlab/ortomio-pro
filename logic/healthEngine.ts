import { PlantMasterSheet, GardenTask, Garden, UserProfile, PlantProtectionProduct } from '../types';
import { protectionProducts } from '../data/treatments';
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
 * Verifica se un prodotto è disponibile per l'utente
 * in base a patentino e preferenze
 */
function isProductAvailable(
  product: PlantProtectionProduct,
  userProfile?: UserProfile
): boolean {
  // Se utente preferisce solo bio
  if (userProfile?.preferredTreatmentType === 'organic') {
    return product.allowedInOrganic;
  }
  
  // Se prodotto richiede patentino, verificare validità
  if (product.requiresLicense) {
    if (!userProfile?.pesticideLicense) {
      return false; // Nessun patentino registrato
    }
    
    // Verifica validità patentino
    if (!userProfile.pesticideLicense.isValid) {
      return false; // Patentino scaduto o non valido
    }
  }
  
  return true;
}

/**
 * Calcola la strategia di difesa per una pianta
 */
export const calculateHealthStrategy = (
  plant: PlantMasterSheet,
  daysActive: number,
  season?: Season,
  latitude: number = 0,
  userProfile?: UserProfile
): HealthAdvice | null => {
  const currentSeason = season || getCurrentSeason(latitude);
  
  // Filtra prodotti disponibili in base a patentino e preferenze
  const availableProducts = protectionProducts.filter(product => 
    isProductAvailable(product, userProfile)
  );
  
  // 1. STRATEGIA GENERICA DI RINFORZO (Tutti) - Post-trapianto
  if (daysActive < 14) {
    const propoli = availableProducts.find(p => p.id === 'propoli');
    if (propoli) {
      return {
        productToUse: 'Propoli o Alghe',
        productId: 'propoli',
        reason: 'Aiuta a superare lo stress da trapianto e stimola le difese naturali della pianta.',
        priority: 'Low',
        actionType: 'Prevent',
        dosage: propoli.dosage,
        applicationNotes: propoli.notes,
        season: currentSeason
      };
    }
  }

  // 2. STRATEGIA PER CUCURBITACEE (Zucchine, Cetrioli, Meloni)
  // Problema principale: Oidio (Mal bianco)
  if (plant.family === 'Cucurbitaceae') {
    if (daysActive > 30 && (currentSeason === 'Spring' || currentSeason === 'Summer')) {
      // Prova prima con Zeolite (bio)
      let zeolite = availableProducts.find(p => p.id === 'zeolite');
      if (!zeolite) {
        // Se non disponibile, prova con Azoxystrobin (chimico, richiede patentino)
        zeolite = availableProducts.find(p => p.id === 'azoxystrobin');
      }
      
      if (zeolite) {
        return {
          productToUse: zeolite.name + (zeolite.requiresLicense ? ' (Richiede Patentino)' : ''),
          productId: zeolite.id,
          reason: 'Le cucurbitacee sono soggette a Oidio (mal bianco) quando l\'umidità sale. ' + 
            (zeolite.id === 'zeolite' 
              ? 'La Zeolite asciuga la foglia creando una barriera fisica.'
              : 'Fungicida sistemico efficace contro Oidio.'),
          priority: 'High',
          actionType: 'Prevent',
          dosage: zeolite.dosage,
          applicationNotes: zeolite.notes + (zeolite.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate(zeolite.id)
        };
      }
    }
  }

  // 3. STRATEGIA PER SOLANACEE (Pomodori, Melanzane)
  // Problema principale: Peronospora (funghi) e Cimici/Afidi
  if (plant.family === 'Solanaceae') {
    if (currentSeason === 'Spring' && daysActive > 20) {
      // Preferisci Zeolite (bio), poi Rame (bio), poi Azoxystrobin (chimico)
      const zeolite = availableProducts.find(p => p.id === 'zeolite');
      const rame = availableProducts.find(p => p.id === 'rame');
      const azoxystrobin = availableProducts.find(p => p.id === 'azoxystrobin');
      
      const product = zeolite || rame || azoxystrobin;
      if (product) {
        return {
          productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
          productId: product.id,
          reason: 'Prevenzione Peronospora tipica delle piogge primaverili. ' +
            (product.id === 'zeolite' ? 'La Zeolite è preferibile (biologica).' :
             product.id === 'rame' ? 'Rame efficace ma rispettare limiti biologici annuali.' :
             'Fungicida sistemico efficace.'),
          priority: 'Medium',
          actionType: 'Prevent',
          dosage: product.dosage,
          applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate(product.id)
        };
      }
    }
    
    if (currentSeason === 'Summer' && daysActive > 40) {
      // Preferisci Neem (bio), poi prodotti chimici se disponibili
      const neem = availableProducts.find(p => p.id === 'neem');
      const sapone = availableProducts.find(p => p.id === 'sapone_molle');
      const deltametrina = availableProducts.find(p => p.id === 'deltametrina');
      
      if (neem && sapone) {
        return {
          productToUse: 'Olio di Neem + Sapone Molle',
          productId: 'neem',
          reason: 'In estate aumenta la pressione di Cimici e Afidi. Il Neem li rende sterili e repellente. Il sapone molle lava la melata.',
          priority: 'High',
          actionType: 'Prevent',
          dosage: `${neem.dosage} + ${sapone.dosage}`,
          applicationNotes: 'Applicare al tramonto. Il sapone molle migliora l\'adesione del Neem.',
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('neem')
        };
      } else if (deltametrina) {
        return {
          productToUse: deltametrina.name + ' (Richiede Patentino)',
          productId: 'deltametrina',
          reason: 'Insetticida ad ampio spettro efficace contro Cimici e Afidi estivi.',
          priority: 'High',
          actionType: 'Prevent',
          dosage: deltametrina.dosage,
          applicationNotes: deltametrina.notes + ' ⚠️ Richiede patentino fitosanitario.',
          season: currentSeason,
          nextTreatmentDate: calculateNextTreatmentDate('deltametrina')
        };
      }
    }
  }

  // 4. STRATEGIA PER BRASSICACEE (Cavoli)
  // Problema: Cavolaia (bruchi)
  if (plant.family === 'Brassicaceae' && daysActive > 20) {
    // Preferisci Bacillus (bio), poi prodotti chimici se disponibili
    const bacillus = availableProducts.find(p => p.id === 'bacillus_thuringiensis');
    const deltametrina = availableProducts.find(p => p.id === 'deltametrina');
    
    const product = bacillus || deltametrina;
    if (product) {
      return {
        productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
        productId: product.id,
        reason: product.id === 'bacillus_thuringiensis'
          ? 'Controlla la pagina inferiore delle foglie per uova di Cavolaia (farfalla bianca). Intervenire tempestivamente.'
          : 'Insetticida ad ampio spettro efficace contro cavolaia e altri lepidotteri.',
        priority: 'Medium',
        actionType: product.id === 'bacillus_thuringiensis' ? 'Monitor' : 'Prevent',
        dosage: product.dosage,
        applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
        season: currentSeason,
        nextTreatmentDate: product.frequencyDays > 0 ? calculateNextTreatmentDate(product.id) : undefined
      };
    }
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
        const zeolite = availableProducts.find(p => p.id === 'zeolite');
        const azoxystrobin = availableProducts.find(p => p.id === 'azoxystrobin');
        const product = zeolite || azoxystrobin;
        
        if (product) {
          const priority = isCriticalPeriod && criticalRisk === 'High' ? 'High' : 'Medium';
          return {
            productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
            productId: product.id,
            reason: `Prevenzione ${fungalDiseases.join(', ')}. ` +
              (product.id === 'zeolite' 
                ? 'La Zeolite crea una barriera fisica protettiva.'
                : 'Fungicida sistemico efficace.'),
            priority,
            actionType: 'Prevent',
            dosage: product.dosage,
            applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
            season: currentSeason,
            nextTreatmentDate: calculateNextTreatmentDate(product.id)
          };
        }
      }
      
      // Priorità a parassiti se presenti e in estate
      if (pests.length > 0 && currentSeason === 'Summer' && daysActive > 30) {
        const neem = availableProducts.find(p => p.id === 'neem');
        const deltametrina = availableProducts.find(p => p.id === 'deltametrina');
        const product = neem || deltametrina;
        
        if (product) {
          const priority = isCriticalPeriod && criticalRisk === 'High' ? 'High' : 'Medium';
          return {
            productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
            productId: product.id,
            reason: `Prevenzione ${pests.join(', ')}. ` +
              (product.id === 'neem'
                ? 'Il Neem agisce come repellente e interferisce con il ciclo riproduttivo.'
                : 'Insetticida ad ampio spettro efficace.'),
            priority,
            actionType: 'Prevent',
            dosage: product.dosage,
            applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
            season: currentSeason,
            nextTreatmentDate: calculateNextTreatmentDate(product.id)
          };
        }
      }
    }
    
    // Se media suscettibilità, suggerisce solo in periodi critici
    if (preventiveStrategy === 'MEDIUM' && isCriticalPeriod) {
      if (fungalDiseases.length > 0) {
        const zeolite = availableProducts.find(p => p.id === 'zeolite');
        const azoxystrobin = availableProducts.find(p => p.id === 'azoxystrobin');
        const product = zeolite || azoxystrobin;
        
        if (product) {
          return {
            productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
            productId: product.id,
            reason: `Periodo critico per ${fungalDiseases.join(', ')}. Prevenzione consigliata.`,
            priority: criticalRisk === 'High' ? 'High' : 'Medium',
            actionType: 'Prevent',
            dosage: product.dosage,
            applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
            season: currentSeason,
            nextTreatmentDate: calculateNextTreatmentDate(product.id)
          };
        }
      }
      
      if (pests.length > 0) {
        const neem = availableProducts.find(p => p.id === 'neem');
        const deltametrina = availableProducts.find(p => p.id === 'deltametrina');
        const product = neem || deltametrina;
        
        if (product) {
          return {
            productToUse: product.name + (product.requiresLicense ? ' (Richiede Patentino)' : ''),
            productId: product.id,
            reason: `Periodo critico per ${pests.join(', ')}. Prevenzione consigliata.`,
            priority: criticalRisk === 'High' ? 'High' : 'Medium',
            actionType: 'Prevent',
            dosage: product.dosage,
            applicationNotes: product.notes + (product.requiresLicense ? ' ⚠️ Richiede patentino fitosanitario.' : ''),
            season: currentSeason,
            nextTreatmentDate: calculateNextTreatmentDate(product.id)
          };
        }
      }
    }
    
    // Se bassa suscettibilità, suggerisce solo se esplicitamente necessario (periodo critico con rischio alto)
    if (preventiveStrategy === 'LOW' && isCriticalPeriod && criticalRisk === 'High') {
      if (fungalDiseases.length > 0 || pests.length > 0) {
        const propoli = availableProducts.find(p => p.id === 'propoli');
        if (propoli) {
          return {
            productToUse: 'Propoli Agricola',
            productId: 'propoli',
            reason: `Rinforzo delle difese naturali durante periodo critico.`,
            priority: 'Low',
            actionType: 'Prevent',
            dosage: propoli.dosage,
            applicationNotes: propoli.notes,
            season: currentSeason,
            nextTreatmentDate: calculateNextTreatmentDate('propoli')
          };
        }
      }
    }
  }

  return null;
}

/**
 * Helper per ottenere prodotti disponibili filtrati
 */
/**
 * Helper per ottenere prodotti disponibili filtrati
 */
export function getAvailableProducts(userProfile?: UserProfile): PlantProtectionProduct[] {
  return protectionProducts.filter(product => isProductAvailable(product, userProfile));
}

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

