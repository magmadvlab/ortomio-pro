import { CompanionRule } from '../types';

/**
 * Database delle consociazioni tra piante
 * Basato su principi agronomici e tradizionali
 */
export const companionRules: CompanionRule[] = [
  // POMODORO - Beneficial
  {
    plant1: 'POMODORO',
    plant2: 'BASILICO',
    relationship: 'Beneficial',
    reason: 'Il basilico migliora il sapore dei pomodori e tiene lontani afidi e mosche bianche',
    spacingModifier: -10 // Possono stare più vicini
  },
  {
    plant1: 'POMODORO',
    plant2: 'PREZZEMOLO',
    relationship: 'Beneficial',
    reason: 'Attira insetti benefici e migliora la crescita',
    spacingModifier: -5
  },
  {
    plant1: 'POMODORO',
    plant2: 'AGLIO',
    relationship: 'Beneficial',
    reason: 'L\'aglio tiene lontani afidi e altri parassiti',
    spacingModifier: 0
  },
  {
    plant1: 'POMODORO',
    plant2: 'CIPOLLA',
    relationship: 'Beneficial',
    reason: 'Tiene lontani parassiti e migliora la salute del terreno',
    spacingModifier: 0
  },
  {
    plant1: 'POMODORO',
    plant2: 'FAGIOLO',
    relationship: 'Beneficial',
    reason: 'I fagioli fissano azoto che beneficia i pomodori',
    spacingModifier: 0
  },
  {
    plant1: 'POMODORO',
    plant2: 'LATTUGA',
    relationship: 'Beneficial',
    reason: 'La lattuga sfrutta l\'ombra dei pomodori e mantiene umidità',
    spacingModifier: -15
  },
  
  // POMODORO - Harmful
  {
    plant1: 'POMODORO',
    plant2: 'PATATA',
    relationship: 'Harmful',
    reason: 'Stessa famiglia (Solanaceae), rischio malattie comuni e competizione',
    spacingModifier: 30 // Molto più distanza
  },
  {
    plant1: 'POMODORO',
    plant2: 'MELANZANA',
    relationship: 'Harmful',
    reason: 'Stessa famiglia (Solanaceae), rischio malattie comuni',
    spacingModifier: 30
  },
  {
    plant1: 'POMODORO',
    plant2: 'PEPERONCINO',
    relationship: 'Harmful',
    reason: 'Stessa famiglia (Solanaceae), ma può funzionare se ben distanziate',
    spacingModifier: 20
  },
  {
    plant1: 'POMODORO',
    plant2: 'FINOCCHIO',
    relationship: 'Harmful',
    reason: 'Il finocchio inibisce la crescita dei pomodori',
    spacingModifier: 50
  },
  
  // ZUCCHINA - Beneficial
  {
    plant1: 'ZUCCHINA',
    plant2: 'MAIS',
    relationship: 'Beneficial',
    reason: 'Il mais fornisce supporto e ombra parziale, le zucchine mantengono umidità',
    spacingModifier: 0
  },
  {
    plant1: 'ZUCCHINA',
    plant2: 'FAGIOLO',
    relationship: 'Beneficial',
    reason: 'I fagioli fissano azoto, le zucchine beneficiano',
    spacingModifier: 0
  },
  {
    plant1: 'ZUCCHINA',
    plant2: 'NASTURZIO',
    relationship: 'Beneficial',
    reason: 'Tiene lontani afidi e altri parassiti',
    spacingModifier: -10
  },
  
  // ZUCCHINA - Harmful
  {
    plant1: 'ZUCCHINA',
    plant2: 'PATATA',
    relationship: 'Harmful',
    reason: 'Competizione per spazio e nutrienti',
    spacingModifier: 40
  },
  
  // LATTUGA - Beneficial
  {
    plant1: 'LATTUGA',
    plant2: 'RAVANELLO',
    relationship: 'Beneficial',
    reason: 'Crescita complementare, il ravanello cresce veloce e non compete',
    spacingModifier: -10
  },
  {
    plant1: 'LATTUGA',
    plant2: 'CAROTA',
    relationship: 'Beneficial',
    reason: 'Crescita complementare, radici a profondità diverse',
    spacingModifier: -5
  },
  {
    plant1: 'LATTUGA',
    plant2: 'CIPOLLA',
    relationship: 'Beneficial',
    reason: 'La cipolla tiene lontani parassiti delle lattughe',
    spacingModifier: 0
  },
  
  // FAGIOLO - Beneficial
  {
    plant1: 'FAGIOLO',
    plant2: 'MAIS',
    relationship: 'Beneficial',
    reason: 'Il mais fornisce supporto, i fagioli fissano azoto',
    spacingModifier: 0
  },
  {
    plant1: 'FAGIOLO',
    plant2: 'ZUCCHINA',
    relationship: 'Beneficial',
    reason: 'Crescita complementare, i fagioli fissano azoto',
    spacingModifier: 0
  },
  
  // FAGIOLO - Harmful
  {
    plant1: 'FAGIOLO',
    plant2: 'CIPOLLA',
    relationship: 'Harmful',
    reason: 'La cipolla inibisce la crescita dei fagioli',
    spacingModifier: 30
  },
  {
    plant1: 'FAGIOLO',
    plant2: 'AGLIO',
    relationship: 'Harmful',
    reason: 'L\'aglio inibisce la crescita dei fagioli',
    spacingModifier: 30
  },
  
  // CAROTA - Beneficial
  {
    plant1: 'CAROTA',
    plant2: 'CIPOLLA',
    relationship: 'Beneficial',
    reason: 'Si proteggono a vicenda dai rispettivi parassiti (mosca carota e mosca cipolla)',
    spacingModifier: -5
  },
  {
    plant1: 'CAROTA',
    plant2: 'PORRO',
    relationship: 'Beneficial',
    reason: 'Stesso principio della cipolla, protezione reciproca',
    spacingModifier: -5
  },
  {
    plant1: 'CAROTA',
    plant2: 'LATTUGA',
    relationship: 'Beneficial',
    reason: 'Crescita complementare, radici a profondità diverse',
    spacingModifier: -5
  },
  
  // CAVOLO - Beneficial
  {
    plant1: 'CAVOLO',
    plant2: 'POMODORO',
    relationship: 'Beneficial',
    reason: 'Il pomodoro tiene lontana la cavolaia',
    spacingModifier: 0
  },
  {
    plant1: 'CAVOLO',
    plant2: 'SEDANO',
    relationship: 'Beneficial',
    reason: 'Il sedano tiene lontana la cavolaia',
    spacingModifier: -5
  },
  
  // PEPERONCINO - Beneficial
  {
    plant1: 'PEPERONCINO',
    plant2: 'BASILICO',
    relationship: 'Beneficial',
    reason: 'Il basilico migliora il sapore e tiene lontani parassiti',
    spacingModifier: -10
  },
  {
    plant1: 'PEPERONCINO',
    plant2: 'ORIGANO',
    relationship: 'Beneficial',
    reason: 'L\'origano tiene lontani parassiti',
    spacingModifier: -5
  },
  
  // MELANZANA - Beneficial
  {
    plant1: 'MELANZANA',
    plant2: 'FAGIOLO',
    relationship: 'Beneficial',
    reason: 'I fagioli fissano azoto che beneficia le melanzane',
    spacingModifier: 0
  },
  
  // CIPOLLA - Harmful (già coperto sopra con fagioli)
  {
    plant1: 'CIPOLLA',
    plant2: 'FAGIOLO',
    relationship: 'Harmful',
    reason: 'La cipolla inibisce la crescita dei fagioli',
    spacingModifier: 30
  },
  {
    plant1: 'CIPOLLA',
    plant2: 'PISELLO',
    relationship: 'Harmful',
    reason: 'La cipolla inibisce la crescita dei piselli',
    spacingModifier: 30
  },
  
  // Regole generiche per famiglie (da usare come fallback)
  // Queste verranno gestite dalla logica, non nel database
];

/**
 * Cerca una regola specifica tra due piante
 */
export const findCompanionRule = (
  plant1: string,
  plant2: string
): CompanionRule | undefined => {
  // Cerca in entrambe le direzioni (A+B e B+A)
  return companionRules.find(
    rule =>
      rule.plant1 && rule.plant2 &&
      ((rule.plant1.toUpperCase() === plant1.toUpperCase() &&
        rule.plant2.toUpperCase() === plant2.toUpperCase()) ||
      (rule.plant1.toUpperCase() === plant2.toUpperCase() &&
        rule.plant2.toUpperCase() === plant1.toUpperCase()))
  );
};

/**
 * Trova tutte le piante benefiche per una data pianta
 */
export const findBeneficialCompanions = (plantName: string): CompanionRule[] => {
  return companionRules.filter(
    rule =>
      rule.plant1 && rule.plant2 &&
      (rule.plant1.toUpperCase() === plantName.toUpperCase() ||
        rule.plant2.toUpperCase() === plantName.toUpperCase()) &&
      rule.relationship === 'Beneficial'
  );
};

/**
 * Trova tutte le piante dannose per una data pianta
 */
export const findHarmfulCompanions = (plantName: string): CompanionRule[] => {
  return companionRules.filter(
    rule =>
      rule.plant1 && rule.plant2 &&
      (rule.plant1.toUpperCase() === plantName.toUpperCase() ||
        rule.plant2.toUpperCase() === plantName.toUpperCase()) &&
      rule.relationship === 'Harmful'
  );
};

