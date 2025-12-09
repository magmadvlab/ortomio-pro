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
  }
];



