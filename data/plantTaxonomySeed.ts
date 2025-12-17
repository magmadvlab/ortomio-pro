/**
 * Seed dati iniziali per tassonomia piante
 * Piante comuni + sinonimi dialettali per fuzzy search
 */

import { PlantTaxonomy, PlantSynonym, PlantFamily } from './plantTaxonomy';
import { normalizeText } from '../utils/textNormalizer';

/**
 * Famiglie botaniche principali
 */
export const plantFamiliesSeed: PlantFamily[] = [
  { id: 'Solanaceae', name: 'Solanaceae', commonNames: ['Solanacee'] },
  { id: 'Cucurbitaceae', name: 'Cucurbitaceae', commonNames: ['Cucurbitacee'] },
  { id: 'Brassicaceae', name: 'Brassicaceae', commonNames: ['Brassicacee', 'Crocifere'] },
  { id: 'Fabaceae', name: 'Fabaceae', commonNames: ['Leguminose', 'Fabacee'] },
  { id: 'Amaryllidaceae', name: 'Amaryllidaceae', commonNames: ['Amaryllidacee'] },
  { id: 'Apiaceae', name: 'Apiaceae', commonNames: ['Ombrellifere'] },
  { id: 'Asteraceae', name: 'Asteraceae', commonNames: ['Composite', 'Asteracee'] },
  { id: 'Amaranthaceae', name: 'Amaranthaceae', commonNames: ['Amarantacee'] },
  { id: 'Lamiaceae', name: 'Lamiaceae', commonNames: ['Labiate'] },
  { id: 'Rosaceae', name: 'Rosaceae', commonNames: ['Rosacee'] },
  { id: 'Rutaceae', name: 'Rutaceae', commonNames: ['Rutacee'] }
];

/**
 * Tassonomia piante comuni (minimo 50-100 piante)
 */
export const plantTaxonomySeed: PlantTaxonomy[] = [
  // A1: Solanacee (frutti estivi)
  {
    plantId: 'pomodoro',
    names: { it: 'Pomodoro', en: 'Tomato' },
    familyId: 'Solanaceae',
    archetypeId: 'A1',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'peperone',
    names: { it: 'Peperone', en: 'Bell Pepper' },
    familyId: 'Solanaceae',
    archetypeId: 'A1',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'peperoncino',
    names: { it: 'Peperoncino', en: 'Chili Pepper' },
    familyId: 'Solanaceae',
    archetypeId: 'A1',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'melanzana',
    names: { it: 'Melanzana', en: 'Eggplant' },
    familyId: 'Solanaceae',
    archetypeId: 'A1',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'patata',
    names: { it: 'Patata', en: 'Potato' },
    familyId: 'Solanaceae',
    archetypeId: 'A1',
    functionalCategory: 'ROOT',
    tags: ['orto', 'estivo']
  },

  // A2: Cucurbitacee (striscianti/rampicanti)
  {
    plantId: 'zucchina',
    names: { it: 'Zucchina', en: 'Zucchini' },
    familyId: 'Cucurbitaceae',
    archetypeId: 'A2',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'cetriolo',
    names: { it: 'Cetriolo', en: 'Cucumber' },
    familyId: 'Cucurbitaceae',
    archetypeId: 'A2',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'carosello',
    names: { it: 'Carosello', 'it-puglia': 'Barattiere', en: 'Carosello Melon' },
    familyId: 'Cucurbitaceae',
    archetypeId: 'A2',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo', 'puglia']
  },
  {
    plantId: 'zucca',
    names: { it: 'Zucca', en: 'Pumpkin' },
    familyId: 'Cucurbitaceae',
    archetypeId: 'A2',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'melone',
    names: { it: 'Melone', en: 'Melon' },
    familyId: 'Cucurbitaceae',
    archetypeId: 'A2',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'anguria',
    names: { it: 'Anguria', en: 'Watermelon' },
    familyId: 'Cucurbitaceae',
    archetypeId: 'A2',
    functionalCategory: 'FRUIT',
    tags: ['orto', 'estivo']
  },

  // A3: Cavoli & brassiche
  {
    plantId: 'cavolfiore',
    names: { it: 'Cavolfiore', en: 'Cauliflower' },
    familyId: 'Brassicaceae',
    archetypeId: 'A3',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'broccoli',
    names: { it: 'Broccoli', en: 'Broccoli' },
    familyId: 'Brassicaceae',
    archetypeId: 'A3',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'cavolo cappuccio',
    names: { it: 'Cavolo Cappuccio', en: 'Cabbage' },
    familyId: 'Brassicaceae',
    archetypeId: 'A3',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'cavolo nero',
    names: { it: 'Cavolo Nero', en: 'Black Cabbage' },
    familyId: 'Brassicaceae',
    archetypeId: 'A3',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'rucola',
    names: { it: 'Rucola', en: 'Arugula' },
    familyId: 'Brassicaceae',
    archetypeId: 'A3',
    functionalCategory: 'LEAF',
    tags: ['orto', 'primaverile']
  },
  {
    plantId: 'ravanello',
    names: { it: 'Ravanello', en: 'Radish' },
    familyId: 'Brassicaceae',
    archetypeId: 'A3',
    functionalCategory: 'ROOT',
    tags: ['orto', 'primaverile']
  },

  // A4: Legumi
  {
    plantId: 'fagiolo',
    names: { it: 'Fagiolo', en: 'Bean' },
    familyId: 'Fabaceae',
    archetypeId: 'A4',
    functionalCategory: 'LEGUME',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'fagiolino',
    names: { it: 'Fagiolino', en: 'Green Bean' },
    familyId: 'Fabaceae',
    archetypeId: 'A4',
    functionalCategory: 'LEGUME',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'pisello',
    names: { it: 'Pisello', en: 'Pea' },
    familyId: 'Fabaceae',
    archetypeId: 'A4',
    functionalCategory: 'LEGUME',
    tags: ['orto', 'primaverile']
  },
  {
    plantId: 'fava',
    names: { it: 'Fava', en: 'Fava Bean' },
    familyId: 'Fabaceae',
    archetypeId: 'A4',
    functionalCategory: 'LEGUME',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'cece',
    names: { it: 'Cece', en: 'Chickpea' },
    familyId: 'Fabaceae',
    archetypeId: 'A4',
    functionalCategory: 'LEGUME',
    tags: ['orto', 'estivo']
  },

  // A5: Allium
  {
    plantId: 'cipolla',
    names: { it: 'Cipolla', en: 'Onion' },
    familyId: 'Amaryllidaceae',
    archetypeId: 'A5',
    functionalCategory: 'ROOT',
    tags: ['orto', 'primaverile']
  },
  {
    plantId: 'aglio',
    names: { it: 'Aglio', en: 'Garlic' },
    familyId: 'Amaryllidaceae',
    archetypeId: 'A5',
    functionalCategory: 'ROOT',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'porro',
    names: { it: 'Porro', en: 'Leek' },
    familyId: 'Amaryllidaceae',
    archetypeId: 'A5',
    functionalCategory: 'ROOT',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'scalogno',
    names: { it: 'Scalogno', en: 'Shallot' },
    familyId: 'Amaryllidaceae',
    archetypeId: 'A5',
    functionalCategory: 'ROOT',
    tags: ['orto', 'primaverile']
  },

  // A6: Ombrellifere
  {
    plantId: 'carota',
    names: { it: 'Carota', en: 'Carrot' },
    familyId: 'Apiaceae',
    archetypeId: 'A6',
    functionalCategory: 'ROOT',
    tags: ['orto', 'primaverile']
  },
  {
    plantId: 'finocchio',
    names: { it: 'Finocchio', en: 'Fennel' },
    familyId: 'Apiaceae',
    archetypeId: 'A6',
    functionalCategory: 'ROOT',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'sedano',
    names: { it: 'Sedano', en: 'Celery' },
    familyId: 'Apiaceae',
    archetypeId: 'A6',
    functionalCategory: 'LEAF',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'prezzemolo',
    names: { it: 'Prezzemolo', en: 'Parsley' },
    familyId: 'Apiaceae',
    archetypeId: 'A6',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'primaverile']
  },

  // A7: Insalate & cicorie
  {
    plantId: 'lattuga',
    names: { it: 'Lattuga', en: 'Lettuce' },
    familyId: 'Asteraceae',
    archetypeId: 'A7',
    functionalCategory: 'LEAF',
    tags: ['orto', 'primaverile']
  },
  {
    plantId: 'cicoria',
    names: { it: 'Cicoria', en: 'Chicory' },
    familyId: 'Asteraceae',
    archetypeId: 'A7',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'radicchio',
    names: { it: 'Radicchio', en: 'Radicchio' },
    familyId: 'Asteraceae',
    archetypeId: 'A7',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'carciofo',
    names: { it: 'Carciofo', en: 'Artichoke' },
    familyId: 'Asteraceae',
    archetypeId: 'A7',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'indivia',
    names: { it: 'Indivia', en: 'Endive' },
    familyId: 'Asteraceae',
    archetypeId: 'A7',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },

  // A8: Bietole & spinaci
  {
    plantId: 'bietola',
    names: { it: 'Bietola', en: 'Chard' },
    familyId: 'Amaranthaceae',
    archetypeId: 'A8',
    functionalCategory: 'LEAF',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'spinacio',
    names: { it: 'Spinacio', en: 'Spinach' },
    familyId: 'Amaranthaceae',
    archetypeId: 'A8',
    functionalCategory: 'LEAF',
    tags: ['orto', 'invernale']
  },
  {
    plantId: 'barbabietola',
    names: { it: 'Barbabietola', en: 'Beetroot' },
    familyId: 'Amaranthaceae',
    archetypeId: 'A8',
    functionalCategory: 'ROOT',
    tags: ['orto', 'estivo']
  },

  // A9: Aromatiche mediterranee
  {
    plantId: 'basilico',
    names: { it: 'Basilico', en: 'Basil' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'estivo']
  },
  {
    plantId: 'rosmarino',
    names: { it: 'Rosmarino', en: 'Rosemary' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'perenne']
  },
  {
    plantId: 'salvia',
    names: { it: 'Salvia', en: 'Sage' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'perenne']
  },
  {
    plantId: 'menta',
    names: { it: 'Menta', en: 'Mint' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'perenne']
  },
  {
    plantId: 'timo',
    names: { it: 'Timo', en: 'Thyme' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'perenne']
  },
  {
    plantId: 'origano',
    names: { it: 'Origano', en: 'Oregano' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'perenne']
  },
  {
    plantId: 'maggiorena',
    names: { it: 'Maggiorena', en: 'Marjoram' },
    familyId: 'Lamiaceae',
    archetypeId: 'A9',
    functionalCategory: 'AROMATIC',
    tags: ['orto', 'estivo']
  },

  // A10: Fruttiferi a nocciolo (drupacee)
  {
    plantId: 'pesca',
    names: { it: 'Pesca', en: 'Peach' },
    familyId: 'Rosaceae',
    archetypeId: 'A10',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'albicocca',
    names: { it: 'Albicocca', en: 'Apricot' },
    familyId: 'Rosaceae',
    archetypeId: 'A10',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'ciliegia',
    names: { it: 'Ciliegia', en: 'Cherry' },
    familyId: 'Rosaceae',
    archetypeId: 'A10',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'susina',
    names: { it: 'Susina', en: 'Plum' },
    familyId: 'Rosaceae',
    archetypeId: 'A10',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },

  // A11: Fruttiferi a pomo (pomacee)
  {
    plantId: 'mela',
    names: { it: 'Mela', en: 'Apple' },
    familyId: 'Rosaceae',
    archetypeId: 'A11',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'pera',
    names: { it: 'Pera', en: 'Pear' },
    familyId: 'Rosaceae',
    archetypeId: 'A11',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'cotogna',
    names: { it: 'Cotogna', en: 'Quince' },
    familyId: 'Rosaceae',
    archetypeId: 'A11',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },

  // A12: Agrumi
  {
    plantId: 'limone',
    names: { it: 'Limone', en: 'Lemon' },
    familyId: 'Rutaceae',
    archetypeId: 'A12',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'arancio',
    names: { it: 'Arancio', en: 'Orange' },
    familyId: 'Rutaceae',
    archetypeId: 'A12',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  },
  {
    plantId: 'mandarino',
    names: { it: 'Mandarino', en: 'Mandarin' },
    familyId: 'Rutaceae',
    archetypeId: 'A12',
    functionalCategory: 'SPECIALIZED',
    tags: ['frutteto']
  }
];

/**
 * Sinonimi dialettali e varianti comuni
 * IMPORTANTE: "barattiere" mappa a "carosello" (NON a pomodoro!)
 */
export const plantSynonymsSeed: PlantSynonym[] = [
  // Pomodoro - varianti dialettali
  { 
    synonym: 'pummador', 
    normalizedSynonym: normalizeText('pummador'), 
    plantId: 'pomodoro', 
    locale: 'it-campania', 
    confidence: 0.9, 
    source: 'system' 
  },
  { 
    synonym: "p'mdòr", 
    normalizedSynonym: normalizeText("p'mdòr"), 
    plantId: 'pomodoro', 
    locale: 'it', 
    confidence: 0.8, 
    source: 'system' 
  },
  { 
    synonym: 'pomodori', 
    normalizedSynonym: normalizeText('pomodori'), 
    plantId: 'pomodoro', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'pomidoro', 
    normalizedSynonym: normalizeText('pomidoro'), 
    plantId: 'pomodoro', 
    locale: 'it', 
    confidence: 0.9, 
    source: 'system' 
  },

  // Zucchina - varianti
  { 
    synonym: 'zucchino', 
    normalizedSynonym: normalizeText('zucchino'), 
    plantId: 'zucchina', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'cucuzza', 
    normalizedSynonym: normalizeText('cucuzza'), 
    plantId: 'zucchina', 
    locale: 'it-sicilia', 
    confidence: 0.9, 
    source: 'system' 
  },
  { 
    synonym: 'cocozza', 
    normalizedSynonym: normalizeText('cocozza'), 
    plantId: 'zucchina', 
    locale: 'it-campania', 
    confidence: 0.9, 
    source: 'system' 
  },
  { 
    synonym: 'zucchine', 
    normalizedSynonym: normalizeText('zucchine'), 
    plantId: 'zucchina', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },

  // Carosello/Barattiere - IMPORTANTE: barattiere mappa a carosello!
  { 
    synonym: 'barattiere', 
    normalizedSynonym: normalizeText('barattiere'), 
    plantId: 'carosello', 
    locale: 'it-puglia', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'carosello', 
    normalizedSynonym: normalizeText('carosello'), 
    plantId: 'carosello', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'tondo di fasano', 
    normalizedSynonym: normalizeText('tondo di fasano'), 
    plantId: 'carosello', 
    locale: 'it-puglia', 
    confidence: 0.9, 
    source: 'system' 
  },
  { 
    synonym: 'cianciuffo', 
    normalizedSynonym: normalizeText('cianciuffo'), 
    plantId: 'carosello', 
    locale: 'it-puglia', 
    confidence: 0.9, 
    source: 'system' 
  },
  { 
    synonym: 'carosello barattiere', 
    normalizedSynonym: normalizeText('carosello barattiere'), 
    plantId: 'carosello', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },

  // Altri sinonimi comuni
  { 
    synonym: 'peperoni', 
    normalizedSynonym: normalizeText('peperoni'), 
    plantId: 'peperone', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'melanzane', 
    normalizedSynonym: normalizeText('melanzane'), 
    plantId: 'melanzana', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'patate', 
    normalizedSynonym: normalizeText('patate'), 
    plantId: 'patata', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'cetrioli', 
    normalizedSynonym: normalizeText('cetrioli'), 
    plantId: 'cetriolo', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'zucche', 
    normalizedSynonym: normalizeText('zucche'), 
    plantId: 'zucca', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'cavoli', 
    normalizedSynonym: normalizeText('cavoli'), 
    plantId: 'cavolfiore', 
    locale: 'it', 
    confidence: 0.8, 
    source: 'system' 
  },
  { 
    synonym: 'fagioli', 
    normalizedSynonym: normalizeText('fagioli'), 
    plantId: 'fagiolo', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'piselli', 
    normalizedSynonym: normalizeText('piselli'), 
    plantId: 'pisello', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'fave', 
    normalizedSynonym: normalizeText('fave'), 
    plantId: 'fava', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'ceci', 
    normalizedSynonym: normalizeText('ceci'), 
    plantId: 'cece', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'cipolle', 
    normalizedSynonym: normalizeText('cipolle'), 
    plantId: 'cipolla', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'agli', 
    normalizedSynonym: normalizeText('agli'), 
    plantId: 'aglio', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'porri', 
    normalizedSynonym: normalizeText('porri'), 
    plantId: 'porro', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'carote', 
    normalizedSynonym: normalizeText('carote'), 
    plantId: 'carota', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'finocchi', 
    normalizedSynonym: normalizeText('finocchi'), 
    plantId: 'finocchio', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'lattughe', 
    normalizedSynonym: normalizeText('lattughe'), 
    plantId: 'lattuga', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'bietole', 
    normalizedSynonym: normalizeText('bietole'), 
    plantId: 'bietola', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  },
  { 
    synonym: 'spinaci', 
    normalizedSynonym: normalizeText('spinaci'), 
    plantId: 'spinacio', 
    locale: 'it', 
    confidence: 1.0, 
    source: 'system' 
  }
];

