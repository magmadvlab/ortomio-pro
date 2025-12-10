import { VarietyMapping } from '../types';

// Mappatura Varietà -> Specie + Tag
// Mappa le varietà più comuni alle loro schede master e tag comportamentali
export const varietyMappings: VarietyMapping[] = [
  // POMODORI - Indeterminati
  { varietyName: 'San Marzano', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Cuor di Bue', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Cuore di Bue', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Datterino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pachino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Ciliegia', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Cherry', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Costoluto fiorentino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Costoluto di Parma', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Principe Borghese', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pera d\'Abruzzo', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pizzutello', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Marzano', speciesId: 'pomodoro', tags: ['indeterminate'] },
  
  // POMODORI - Determinati
  { varietyName: 'Roma', speciesId: 'pomodoro', tags: ['determinate'] },
  { varietyName: 'Pisanello', speciesId: 'pomodoro', tags: ['determinate'] },
  { varietyName: 'Pizza', speciesId: 'pomodoro', tags: ['determinate'] },
  { varietyName: 'Patataro', speciesId: 'pomodoro', tags: ['determinate'] },
  
  // PEPERONCINI - Chinense (germinazione lenta)
  { varietyName: 'Carolina Reaper', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Trinidad Scorpion', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Habanero', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Ghost Pepper', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Bhut Jolokia', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: '7 Pot', speciesId: 'peperoncino', tags: ['chinense'] },
  
  // PEPERONCINI - Annuum (germinazione veloce)
  { varietyName: 'Jalapeno', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Cayenna', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Serrano', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Anaheim', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Poblano', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Friggitello', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Piccante calabrese', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Diavolicchio', speciesId: 'peperoncino', tags: ['annuum'] },
  
  // PEPERONI DOLCI
  { varietyName: 'Peperone', speciesId: 'peperone', tags: [] },
  { varietyName: 'Peperone giallo', speciesId: 'peperone', tags: [] },
  { varietyName: 'Peperone rosso', speciesId: 'peperone', tags: [] },
  { varietyName: 'Peperone verde', speciesId: 'peperone', tags: [] },
  { varietyName: 'Quadrato d\'Asti', speciesId: 'peperone', tags: [] },
  { varietyName: 'Corno di toro', speciesId: 'peperone', tags: [] },
  { varietyName: 'Corno di Carmagnola', speciesId: 'peperone', tags: [] },
  
  // ZUCCHINE
  { varietyName: 'Zucchino', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchina', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino nero di Milano', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino romanesco', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino striato', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino tondo', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino di Faenza', speciesId: 'zucchina', tags: ['bush'] },
  
  // MELANZANE
  { varietyName: 'Melanzana', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana violetta', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana lunga', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana tonda', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Violetta di Firenze', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Violetta lunga', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Black Beauty', speciesId: 'melanzana', tags: [] },
  
  // LATTUGHE
  { varietyName: 'Lattuga', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga romana', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga iceberg', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga butterhead', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lollo', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lollo rossa', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Canasta', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Trocadero', speciesId: 'lattuga', tags: [] },
  
  // BASILICO
  { varietyName: 'Basilico', speciesId: 'basilico', tags: [] },
  { varietyName: 'Basilico genovese', speciesId: 'basilico', tags: [] },
  { varietyName: 'Basilico napoletano', speciesId: 'basilico', tags: [] },
  { varietyName: 'Basilico a foglia larga', speciesId: 'basilico', tags: [] },
  { varietyName: 'Basilico rosso', speciesId: 'basilico', tags: [] },
  
  // FAGIOLI
  { varietyName: 'Fagiolo', speciesId: 'fagiolo', tags: [] },
  { varietyName: 'Fagiolo nano', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo rampicante', speciesId: 'fagiolo', tags: ['vining'] },
  { varietyName: 'Borlotto', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Borlotto nano', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Borlotto rampicante', speciesId: 'fagiolo', tags: ['vining'] },
  { varietyName: 'Cannellino', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Spagna', speciesId: 'fagiolo', tags: ['vining'] },
  { varietyName: 'Fagiolo di Spagna', speciesId: 'fagiolo', tags: ['vining'] },
  
  // PISELLI
  { varietyName: 'Pisello', speciesId: 'pisello', tags: [] },
  { varietyName: 'Pisello nano', speciesId: 'pisello', tags: ['bush'] },
  { varietyName: 'Pisello rampicante', speciesId: 'pisello', tags: ['vining'] },
  { varietyName: 'Pisello mangiatutto', speciesId: 'pisello', tags: [] },
  { varietyName: 'Pisello da sgranare', speciesId: 'pisello', tags: [] },
  
  // CAROTE
  { varietyName: 'Carota', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota nantese', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota lunga', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota corta', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota di Amsterdam', speciesId: 'carota', tags: [] },
  
  // CIPOLLE
  { varietyName: 'Cipolla', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla bianca', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla rossa', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla dorata', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla di Tropea', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla di Barletta', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla di Bassano', speciesId: 'cipolla', tags: [] }
];





