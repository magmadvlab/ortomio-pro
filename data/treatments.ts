import { PlantProtectionProduct } from '../types';

export const protectionProducts: PlantProtectionProduct[] = [
  {
    id: 'zeolite',
    name: 'Zeolite Micronizzata',
    type: 'PREVENTIVE',
    allowedInOrganic: true,
    target: ['Funghi', 'Insetti masticatori', 'Eccesso umidità'],
    frequencyDays: 20, // Crea una patina protettiva duratura
    dosage: '3-5g per litro (fogliare) o a polvere secca',
    notes: 'Crea una barriera fisica. Ridà alla foglia se piove molto.',
    applicationMethod: 'Foliar',
    bestTime: 'Morning'
  },
  {
    id: 'neem',
    name: 'Olio di Neem',
    type: 'REPELLENT',
    allowedInOrganic: true,
    target: ['Afidi', 'Cimici', 'Ditteri'],
    frequencyDays: 14,
    dosage: '5ml per litro + emulsionante',
    notes: 'Agisce per ingestione e repulsione. Dare la sera al tramonto.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening'
  },
  {
    id: 'sapone_molle',
    name: 'Sapone Molle Potassico',
    type: 'CURATIVE',
    allowedInOrganic: true,
    target: ['Afidi', 'Cocciniglia', 'Melata'],
    frequencyDays: 0, // Al bisogno
    dosage: '10-15ml per litro',
    notes: 'Lava via la melata e soffoca gli insetti a corpo molle. Usare come "vettore" per il Neem.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening'
  },
  {
    id: 'propoli',
    name: 'Propoli Agricola',
    type: 'PREVENTIVE',
    allowedInOrganic: true,
    target: ['Funghi', 'Batteri', 'Cicatrizzazione'],
    frequencyDays: 15,
    dosage: '2-3ml per litro',
    notes: 'Potente cicatrizzante naturale dopo potature o grandine. Attira impollinatori.',
    applicationMethod: 'Foliar',
    bestTime: 'Any'
  },
  {
    id: 'macerato_ortica',
    name: 'Macerato di Ortica',
    type: 'REPELLENT',
    allowedInOrganic: true,
    target: ['Afidi', 'Ragnetto Rosso'],
    frequencyDays: 10,
    dosage: 'Diluizione 1:10 (preventivo) o 1:5 (curativo)',
    notes: 'Attenzione all\'odore. Fornisce anche azoto fogliare.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening'
  },
  {
    id: 'rame',
    name: 'Rame (Basso Dosaggio)',
    type: 'CURATIVE',
    allowedInOrganic: true,
    target: ['Peronospora', 'Batteriosi'],
    frequencyDays: 21,
    dosage: 'Massimo 4kg/ha/anno (rispettare limiti biologici)',
    notes: 'Usare solo in prevenzione primaverile. Non superare i limiti annuali.',
    applicationMethod: 'Foliar',
    bestTime: 'Morning'
  },
  {
    id: 'bacillus_thuringiensis',
    name: 'Bacillus Thuringiensis',
    type: 'CURATIVE',
    allowedInOrganic: true,
    target: ['Cavolaia', 'Notte', 'Lepidotteri'],
    frequencyDays: 0, // Al bisogno
    dosage: 'Seguire indicazioni prodotto',
    notes: 'Batterio che attacca solo le larve. Controllare pagina inferiore foglie per uova.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening'
  },
  
  // PRODOTTI CHIMICI CLASSICI (richiedono patentino fitosanitario)
  {
    id: 'deltametrina',
    name: 'Deltametrina',
    type: 'CURATIVE',
    allowedInOrganic: false,
    requiresLicense: true,
    target: ['Afidi', 'Cimici', 'Lepidotteri', 'Coleotteri'],
    frequencyDays: 14,
    dosage: 'Seguire indicazioni prodotto (tipicamente 0.5-1g per litro)',
    notes: '⚠️ Richiede patentino fitosanitario. Rispettare tempi di carenza. Insetticida piretroide ad ampio spettro.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening',
    safetyInterval: 7 // Giorni di carenza
  },
  {
    id: 'azoxystrobin',
    name: 'Azoxystrobin',
    type: 'PREVENTIVE',
    allowedInOrganic: false,
    requiresLicense: true,
    target: ['Peronospora', 'Oidio', 'Alternaria', 'Septoria'],
    frequencyDays: 10,
    dosage: 'Seguire indicazioni prodotto (tipicamente 0.5-1ml per litro)',
    notes: '⚠️ Richiede patentino. Fungicida sistemico ad ampio spettro. Usare in rotazione con altri principi attivi per evitare resistenze.',
    applicationMethod: 'Foliar',
    bestTime: 'Morning',
    safetyInterval: 14
  },
  {
    id: 'lambda_cialotrina',
    name: 'Lambda-cialotrina',
    type: 'CURATIVE',
    allowedInOrganic: false,
    requiresLicense: true,
    target: ['Afidi', 'Cimici', 'Tripidi', 'Aleurodidi'],
    frequencyDays: 10,
    dosage: 'Seguire indicazioni prodotto (tipicamente 0.3-0.5ml per litro)',
    notes: '⚠️ Richiede patentino. Insetticida piretroide efficace contro insetti succhiatori. Non utilizzare in fioritura per proteggere api.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening',
    safetyInterval: 7
  },
  {
    id: 'mancozeb',
    name: 'Mancozeb',
    type: 'PREVENTIVE',
    allowedInOrganic: false,
    requiresLicense: true,
    target: ['Peronospora', 'Alternaria', 'Antracnosi'],
    frequencyDays: 7,
    dosage: 'Seguire indicazioni prodotto (tipicamente 2-3g per litro)',
    notes: '⚠️ Richiede patentino. Fungicida di contatto, efficace in prevenzione. Non sistemico, quindi copertura completa necessaria.',
    applicationMethod: 'Foliar',
    bestTime: 'Morning',
    safetyInterval: 21
  },
  {
    id: 'imidacloprid',
    name: 'Imidacloprid',
    type: 'CURATIVE',
    allowedInOrganic: false,
    requiresLicense: true,
    target: ['Afidi', 'Cimici', 'Aleurodidi', 'Coleotteri'],
    frequencyDays: 14,
    dosage: 'Seguire indicazioni prodotto (tipicamente 0.5-1ml per litro)',
    notes: '⚠️ Richiede patentino. Insetticida sistemico neonicotinoide. ⚠️ ATTENZIONE: Altamente tossico per api. NON utilizzare in fioritura o vicino a fiori.',
    applicationMethod: 'Foliar',
    bestTime: 'Evening',
    safetyInterval: 21
  }
];





