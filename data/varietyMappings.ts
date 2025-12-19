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
  { varietyName: 'Cipolla di Bassano', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla di Cannara', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla di Vatolla', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla ramata', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla borettana', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla di Certaldo', speciesId: 'cipolla', tags: [] },
  
  // POMODORI - Varietà regionali aggiuntive
  { varietyName: 'Pomodoro di Pachino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro di San Marzano', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Fiaschetto', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Re Umberto', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Belmonte', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Fiorentino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro di Sorrento', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Piennolo', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Corbarino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Giallo', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Nero di Crimea', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro Verde', speciesId: 'pomodoro', tags: ['indeterminate'] },
  
  // PEPERONCINI - Varietà aggiuntive
  { varietyName: 'Naga Viper', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Trinidad Moruga Scorpion', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Chocolate Habanero', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Scotch Bonnet', speciesId: 'peperoncino', tags: ['chinense'] },
  { varietyName: 'Aji Amarillo', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Cayenne Long Slim', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Thai Dragon', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Tabasco', speciesId: 'peperoncino', tags: ['annuum'] },
  
  // ZUCCHINE - Varietà aggiuntive
  { varietyName: 'Zucchino siciliano', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino genovese', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino bianco', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino giallo', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Zucchino rampicante', speciesId: 'zucchina', tags: ['vining'] },
  { varietyName: 'Zucchino patisson', speciesId: 'zucchina', tags: ['bush'] },
  
  // MELANZANE - Varietà aggiuntive
  { varietyName: 'Melanzana di Rotonda', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana bianca', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana rossa', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana striata', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana di Barbentane', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana giapponese', speciesId: 'melanzana', tags: [] },
  
  // LATTUGHE - Varietà aggiuntive
  { varietyName: 'Lattuga batavia', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga cappuccina', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga gentile', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga bionda', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga scarola', speciesId: 'lattuga', tags: [] },
  { varietyName: 'Lattuga riccia', speciesId: 'lattuga', tags: [] },
  
  // FAGIOLI - Varietà aggiuntive
  { varietyName: 'Fagiolo corona', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo toscanello', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo zolfino', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo cannellino', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo di Spagna bianco', speciesId: 'fagiolo', tags: ['vining'] },
  { varietyName: 'Fagiolo di Spagna rosso', speciesId: 'fagiolo', tags: ['vining'] },
  
  // PISELLI - Varietà aggiuntive
  { varietyName: 'Pisello telefono', speciesId: 'pisello', tags: ['vining'] },
  { varietyName: 'Pisello mezza rama', speciesId: 'pisello', tags: ['bush'] },
  { varietyName: 'Pisello senatore', speciesId: 'pisello', tags: ['bush'] },
  { varietyName: 'Pisello progress', speciesId: 'pisello', tags: ['bush'] },
  { varietyName: 'Pisello meraviglia d\'Italia', speciesId: 'pisello', tags: ['vining'] },
  { varietyName: 'Pisello zuccherino', speciesId: 'pisello', tags: ['vining'] },
  
  // CAROTE - Varietà aggiuntive
  { varietyName: 'Carota chantenay', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota imperator', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota parigi', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota viola', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota gialla', speciesId: 'carota', tags: [] },
  { varietyName: 'Carota bianca', speciesId: 'carota', tags: [] },
  
  // PATATE - Nuove varietà
  { varietyName: 'Patata', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata primura', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata spunta', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata kennebec', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata monalisa', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata agata', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata ratte', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata viola', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata rossa', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata gialla', speciesId: 'patata', tags: [] },
  { varietyName: 'Patata di montagna', speciesId: 'patata', tags: [] },
  
  // RADICCHIO - Nuove varietà
  { varietyName: 'Radicchio', speciesId: 'radicchio', tags: [] },
  { varietyName: 'Radicchio di Treviso', speciesId: 'radicchio', tags: [] },
  { varietyName: 'Radicchio di Chioggia', speciesId: 'radicchio', tags: [] },
  { varietyName: 'Radicchio di Verona', speciesId: 'radicchio', tags: [] },
  { varietyName: 'Radicchio di Castelfranco', speciesId: 'radicchio', tags: [] },
  { varietyName: 'Radicchio variegato', speciesId: 'radicchio', tags: [] },
  
  // SPINACI - Nuove varietà
  { varietyName: 'Spinacio', speciesId: 'spinacio', tags: [] },
  { varietyName: 'Spinacio gigante d\'inverno', speciesId: 'spinacio', tags: [] },
  { varietyName: 'Spinacio matador', speciesId: 'spinacio', tags: [] },
  { varietyName: 'Spinacio viroflay', speciesId: 'spinacio', tags: [] },
  { varietyName: 'Spinacio riccio', speciesId: 'spinacio', tags: [] },
  { varietyName: 'Spinacio liscio', speciesId: 'spinacio', tags: [] },
  
  // FINOCCHIO - Nuove varietà
  { varietyName: 'Finocchio', speciesId: 'finocchio', tags: [] },
  { varietyName: 'Finocchio di Firenze', speciesId: 'finocchio', tags: [] },
  { varietyName: 'Finocchio romano', speciesId: 'finocchio', tags: [] },
  { varietyName: 'Finocchio dolce', speciesId: 'finocchio', tags: [] },
  
  // MAIS - Nuove varietà
  { varietyName: 'Mais', speciesId: 'mais', tags: [] },
  { varietyName: 'Mais dolce', speciesId: 'mais', tags: [] },
  { varietyName: 'Mais bicolor', speciesId: 'mais', tags: [] },
  { varietyName: 'Mais rosso', speciesId: 'mais', tags: [] },
  { varietyName: 'Mais giallo', speciesId: 'mais', tags: [] },
  { varietyName: 'Mais bianco', speciesId: 'mais', tags: [] },
  
  // VARIETÀ ZUCCA
  { varietyName: 'Zucca trombetta', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca mantovana', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca butternut', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca Hokkaido', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca spaghetti', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca da semi', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca Delica', speciesId: 'zucca', tags: [] },
  { varietyName: 'Zucca rosa', speciesId: 'zucca', tags: [] },
  
  // VARIETÀ CETRIOLO
  { varietyName: 'Cetriolino', speciesId: 'cetriolo', tags: [] },
  { varietyName: 'Cetriolo tortarello', speciesId: 'cetriolo', tags: [] },
  
  // VARIETÀ POMODORO
  { varietyName: 'Pomodorino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodorino ciliegino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodorino datterino', speciesId: 'pomodoro', tags: ['indeterminate'] },
  { varietyName: 'Pomodoro da salsa', speciesId: 'pomodoro', tags: ['determinate'] },
  { varietyName: 'Pomodoro da insalata', speciesId: 'pomodoro', tags: ['determinate'] },
  
  // VARIETÀ PEPERONE
  { varietyName: 'Peperone friggitello', speciesId: 'peperone-dolce', tags: [] },
  { varietyName: 'Peperone corno di toro', speciesId: 'peperone-dolce', tags: [] },
  { varietyName: 'Peperone quadrato', speciesId: 'peperone-dolce', tags: [] },
  { varietyName: 'Peperone giallo', speciesId: 'peperone-dolce', tags: [] },
  { varietyName: 'Peperone rosso', speciesId: 'peperone-dolce', tags: [] },
  { varietyName: 'Peperone verde', speciesId: 'peperone-dolce', tags: [] },
  
  // VARIETÀ MELANZANA
  { varietyName: 'Melanzana lunga', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana tonda', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana bianca', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Melanzana violetta', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Violetta Lunga', speciesId: 'melanzana', tags: [] },
  { varietyName: 'Tonda', speciesId: 'melanzana', tags: [] },
  
  // VARIETÀ PEPERONCINO
  { varietyName: 'Peperoncino ornamentale', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Peperoncino calabrese', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Peperoncino a mazzetti', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Peperoncino tondo piccante', speciesId: 'peperoncino', tags: ['annuum'] },
  { varietyName: 'Peperoncino lungo piccante', speciesId: 'peperoncino', tags: ['annuum'] },
  
  // VARIETÀ ZUCCHINA
  { varietyName: 'Zucchino tondo', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Romanesco', speciesId: 'zucchina', tags: ['bush'] },
  { varietyName: 'Trombetta', speciesId: 'zucchina', tags: ['bush'] },
  
  // VARIETÀ CIPOLLA
  { varietyName: 'Cipollotto', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla rossa', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla bianca', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Cipolla dorata', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Tropea', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Borettana', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Giarratana', speciesId: 'cipolla', tags: [] },
  { varietyName: 'Ramata di Montoro', speciesId: 'cipolla', tags: [] },
  
  // VARIETÀ AGLIO
  { varietyName: 'Aglio rosso', speciesId: 'aglio', tags: [] },
  { varietyName: 'Aglio bianco', speciesId: 'aglio', tags: [] },
  { varietyName: 'Aglio violetto', speciesId: 'aglio', tags: [] },
  { varietyName: 'Aglione', speciesId: 'aglio', tags: [] },
  { varietyName: 'Rosso di Sulmona', speciesId: 'aglio', tags: [] },
  { varietyName: 'Violetto di Nubia', speciesId: 'aglio', tags: [] },
  { varietyName: 'Bianco Polesano', speciesId: 'aglio', tags: [] },
  { varietyName: 'Rosso di Castelliri', speciesId: 'aglio', tags: [] },
  
  // VARIETÀ SEDANO
  { varietyName: 'Sedano da taglio', speciesId: 'sedano', tags: [] },
  { varietyName: 'Sedano da costa', speciesId: 'sedano', tags: [] },
  
  // VARIETÀ FAGIOLO
  { varietyName: 'Fagiolo dall\'occhio', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo borlotto', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo cannellino', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo nero', speciesId: 'fagiolo', tags: ['bush'] },
  { varietyName: 'Fagiolo rosso (kidney)', speciesId: 'fagiolo', tags: ['bush'] },
  
  // VARIETÀ LEGUMI
  { varietyName: 'Ceci nero', speciesId: 'ceci', tags: [] },
  { varietyName: 'Lenticchia rossa', speciesId: 'lenticchia', tags: [] },
  
  // ALTRI
  { varietyName: 'Indivia belga', speciesId: 'indivia-riccia', tags: [] },
  { varietyName: 'Daikon', speciesId: 'ravanello', tags: [] },
  { varietyName: 'Cardo gobbo', speciesId: 'cardo', tags: [] },
  { varietyName: 'Scorzonera', speciesId: 'scorzonera', tags: [] },
  { varietyName: 'Salsefrica', speciesId: 'salsefrica', tags: [] },
  { varietyName: 'Rafano', speciesId: 'rafano', tags: [] },
  { varietyName: 'Senape (semi)', speciesId: 'senape-semi', tags: [] }
];





