/**
 * Disease Database
 * Database completo di 30+ patologie con sintomi visivi, condizioni favorevoli e piani trattamento
 */

import { Season } from '../utils/seasonalAdjustment';

export interface Disease {
  id: string;
  name: string;
  nameIT: string; // Nome italiano
  category: 'Fungal' | 'Bacterial' | 'Viral' | 'Pest' | 'Deficiency' | 'Environmental';
  affectedPlants: string[]; // Nomi comuni piante
  season: Season[]; // Stagioni più comuni
  symptoms: {
    visual: string[]; // Descrizioni sintomi visivi
    keywords: string[]; // Parole chiave per matching
    severity: 'Mild' | 'Moderate' | 'Severe';
  };
  conditions: {
    temperature?: { min: number; max: number }; // Range temperatura
    humidity?: { min: number; max: number }; // Range umidità
    weather?: string[]; // Condizioni meteo favorevoli
  };
  treatment: {
    organic: string[]; // Trattamenti biologici
    preventive: string[]; // Prevenzione
    steps: string[]; // Piano trattamento step-by-step
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  };
  images?: string[]; // URL o path immagini riferimento
}

export const diseaseDatabase: Disease[] = [
  // FUNGHI
  {
    id: 'peronospora',
    name: 'Downy Mildew',
    nameIT: 'Peronospora',
    category: 'Fungal',
    affectedPlants: ['Pomodoro', 'Peperone', 'Melanzana', 'Cucumber', 'Lattuga', 'Cipolla'],
    season: ['Spring', 'Summer'],
    symptoms: {
      visual: [
        'Macchie gialle o marroni sulla pagina superiore delle foglie',
        'Muffa grigio-viola sulla pagina inferiore delle foglie',
        'Foglie che si seccano e cadono',
        'Colpisce prima le foglie basali'
      ],
      keywords: ['peronospora', 'muffa', 'macchie gialle', 'foglie secche', 'muffa grigia'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 10, max: 25 },
      humidity: { min: 85, max: 100 },
      weather: ['Pioggia', 'Umidità alta', 'Nebbia']
    },
    treatment: {
      organic: ['Rame (massimo 4kg/ettaro/anno)', 'Zeolite micronizzata', 'Propoli'],
      preventive: [
        'Evitare ristagni d\'acqua',
        'Irrigare al mattino, non alla sera',
        'Spaziatura adeguata tra le piante',
        'Rimuovere foglie infette immediatamente'
      ],
      steps: [
        '1. Rimuovere immediatamente tutte le foglie colpite',
        '2. Applicare Rame (se non superato limite annuale) o Zeolite micronizzata',
        '3. Ridurre irrigazione e migliorare circolazione aria',
        '4. Ripetere trattamento ogni 7-10 giorni fino a scomparsa sintomi',
        '5. Monitorare per 2 settimane dopo ultimo trattamento'
      ],
      urgency: 'High'
    }
  },
  {
    id: 'oidio',
    name: 'Powdery Mildew',
    nameIT: 'Oidio (Mal Bianco)',
    category: 'Fungal',
    affectedPlants: ['Zucchina', 'Cetriolo', 'Melone', 'Anguria', 'Pisello', 'Fagiolo'],
    season: ['Summer', 'Autumn'],
    symptoms: {
      visual: [
        'Patina bianca polverosa su foglie e fusti',
        'Foglie che si accartocciano e ingialliscono',
        'Crescita stentata della pianta',
        'Colpisce prima le foglie giovani'
      ],
      keywords: ['oidio', 'mal bianco', 'patina bianca', 'polvere bianca', 'foglie accartocciate'],
      severity: 'Moderate'
    },
    conditions: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 50, max: 80 },
      weather: ['Umidità moderata', 'Notti fresche', 'Giornate calde']
    },
    treatment: {
      organic: ['Zeolite micronizzata', 'Bicarbonato di sodio (5g/L)', 'Latte (10% in acqua)'],
      preventive: [
        'Evitare irrigazione fogliare',
        'Migliorare circolazione aria',
        'Pacciamatura per evitare schizzi di terra',
        'Varietà resistenti'
      ],
      steps: [
        '1. Rimuovere foglie gravemente colpite',
        '2. Applicare Zeolite micronizzata o soluzione bicarbonato (5g/L)',
        '3. Trattare al mattino presto quando foglie sono asciutte',
        '4. Ripetere ogni 5-7 giorni fino a scomparsa',
        '5. Alternative: latte diluito (10%) o decotto equiseto'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'alternaria',
    name: 'Alternaria',
    nameIT: 'Alternaria',
    category: 'Fungal',
    affectedPlants: ['Pomodoro', 'Peperone', 'Patata'],
    season: ['Summer', 'Autumn'],
    symptoms: {
      visual: [
        'Macchie circolari marroni con anelli concentrici',
        'Macchie su foglie, fusti e frutti',
        'Foglie che ingialliscono e cadono',
        'Lesioni su frutti maturi'
      ],
      keywords: ['alternaria', 'macchie marroni', 'anelli concentrici', 'macchie frutti'],
      severity: 'Moderate'
    },
    conditions: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 70, max: 90 },
      weather: ['Pioggia', 'Umidità alta']
    },
    treatment: {
      organic: ['Rame', 'Zeolite', 'Propoli'],
      preventive: [
        'Rotazione colturale (non solanacee per 3 anni)',
        'Rimuovere detriti vegetali',
        'Evitare irrigazione fogliare',
        'Spaziatura adeguata'
      ],
      steps: [
        '1. Rimuovere parti colpite',
        '2. Applicare Rame o Zeolite',
        '3. Migliorare drenaggio e circolazione aria',
        '4. Trattare ogni 10-14 giorni'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'botrite',
    name: 'Botrytis',
    nameIT: 'Botrite (Muffa Grigia)',
    category: 'Fungal',
    affectedPlants: ['Pomodoro', 'Fragola', 'Lattuga', 'Fagiolo'],
    season: ['Spring', 'Autumn', 'Winter'],
    symptoms: {
      visual: [
        'Muffa grigia su foglie, fiori e frutti',
        'Tessuti che diventano molli e marciscono',
        'Colpisce parti danneggiate o senescenti',
        'Si diffonde rapidamente in condizioni umide'
      ],
      keywords: ['botrite', 'muffa grigia', 'marciume', 'tessuti molli'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 15, max: 25 },
      humidity: { min: 90, max: 100 },
      weather: ['Umidità molto alta', 'Condensa', 'Nebbia']
    },
    treatment: {
      organic: ['Propoli', 'Bacillus subtilis', 'Rame'],
      preventive: [
        'Rimuovere parti morte o danneggiate',
        'Evitare ristagni d\'acqua',
        'Migliorare ventilazione',
        'Raccogliere frutti maturi tempestivamente'
      ],
      steps: [
        '1. Rimuovere immediatamente tutte le parti colpite',
        '2. Applicare Propoli o Bacillus subtilis',
        '3. Ridurre umidità (ventilazione, riscaldamento)',
        '4. Trattare ogni 5-7 giorni',
        '5. Isolare piante gravemente colpite'
      ],
      urgency: 'High'
    }
  },
  {
    id: 'fusarium',
    name: 'Fusarium Wilt',
    nameIT: 'Fusarium',
    category: 'Fungal',
    affectedPlants: ['Pomodoro', 'Peperone', 'Melanzana', 'Fagiolo'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Appassimento foglie da basso verso alto',
        'Foglie che ingialliscono e si seccano',
        'Fusto con striature marroni all\'interno',
        'Pianta che muore progressivamente'
      ],
      keywords: ['fusarium', 'appassimento', 'striature marroni', 'pianta muore'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 60, max: 80 },
      weather: ['Caldo', 'Terreno umido']
    },
    treatment: {
      organic: ['Micorrize', 'Trichoderma', 'Rotazione (4-5 anni)'],
      preventive: [
        'Varietà resistenti',
        'Rotazione colturale lunga (4-5 anni)',
        'Terreno ben drenato',
        'Evitare stress idrico'
      ],
      steps: [
        '1. Rimuovere pianta colpita immediatamente (non compostare)',
        '2. Disinfettare attrezzi e terreno',
        '3. Non piantare solanacee nello stesso punto per 4-5 anni',
        '4. Usare varietà resistenti',
        '5. Migliorare drenaggio terreno'
      ],
      urgency: 'Critical'
    }
  },

  // BATTERI
  {
    id: 'maculatura_batterica',
    name: 'Bacterial Spot',
    nameIT: 'Maculatura Batterica',
    category: 'Bacterial',
    affectedPlants: ['Pomodoro', 'Peperone'],
    season: ['Spring', 'Summer'],
    symptoms: {
      visual: [
        'Piccole macchie scure su foglie e frutti',
        'Macchie che diventano crostose',
        'Foglie che cadono prematuramente',
        'Frutti con lesioni superficiali'
      ],
      keywords: ['maculatura batterica', 'macchie scure', 'crostose', 'lesioni frutti'],
      severity: 'Moderate'
    },
    conditions: {
      temperature: { min: 20, max: 30 },
      humidity: { min: 80, max: 100 },
      weather: ['Pioggia', 'Umidità alta', 'Schizzi d\'acqua']
    },
    treatment: {
      organic: ['Rame', 'Propoli', 'Bacillus subtilis'],
      preventive: [
        'Evitare irrigazione fogliare',
        'Rotazione colturale',
        'Rimuovere detriti vegetali',
        'Spaziatura adeguata'
      ],
      steps: [
        '1. Rimuovere foglie colpite',
        '2. Applicare Rame o Propoli',
        '3. Evitare irrigazione fogliare',
        '4. Trattare ogni 7-10 giorni'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'cancro_batterico',
    name: 'Bacterial Canker',
    nameIT: 'Cancro Batterico',
    category: 'Bacterial',
    affectedPlants: ['Pomodoro'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Foglie con margini necrotici',
        'Fusti con lesioni marroni',
        'Frutti con macchie bianche al centro',
        'Pianta che appassisce'
      ],
      keywords: ['cancro batterico', 'margini necrotici', 'lesioni fusto', 'macchie bianche frutti'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 70, max: 90 },
      weather: ['Caldo', 'Umidità']
    },
    treatment: {
      organic: ['Rame', 'Rimozione pianta'],
      preventive: [
        'Semi certificati',
        'Rotazione colturale',
        'Disinfettare attrezzi',
        'Evitare ferite alle piante'
      ],
      steps: [
        '1. Rimuovere pianta colpita (non compostare)',
        '2. Disinfettare attrezzi',
        '3. Non piantare pomodori nello stesso punto per 3 anni',
        '4. Usare semi certificati'
      ],
      urgency: 'High'
    }
  },

  // VIRUS
  {
    id: 'mosaico',
    name: 'Mosaic Virus',
    nameIT: 'Virus del Mosaico',
    category: 'Viral',
    affectedPlants: ['Pomodoro', 'Peperone', 'Cetriolo', 'Zucchina'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Foglie con pattern a mosaico (verde chiaro/scuro)',
        'Foglie deformate e accartocciate',
        'Crescita stentata',
        'Frutti deformati o assenti'
      ],
      keywords: ['mosaico', 'pattern foglie', 'foglie deformate', 'crescita stentata'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 20, max: 30 },
      weather: ['Trasmesso da afidi', 'Contatto']
    },
    treatment: {
      organic: ['Rimozione pianta', 'Controllo afidi'],
      preventive: [
        'Controllo afidi (vettori)',
        'Varietà resistenti',
        'Rimuovere piante infette immediatamente',
        'Disinfettare attrezzi'
      ],
      steps: [
        '1. Rimuovere immediatamente pianta colpita',
        '2. Controllare e trattare afidi',
        '3. Disinfettare attrezzi',
        '4. Non compostare piante infette'
      ],
      urgency: 'High'
    }
  },
  {
    id: 'accartocciamento',
    name: 'Leaf Curl Virus',
    nameIT: 'Accartocciamento Foglie',
    category: 'Viral',
    affectedPlants: ['Pomodoro', 'Peperone'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Foglie che si accartocciano verso l\'alto',
        'Foglie più piccole del normale',
        'Crescita stentata',
        'Frutti ridotti o assenti'
      ],
      keywords: ['accartocciamento', 'foglie piccole', 'crescita stentata'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 25, max: 35 },
      weather: ['Trasmesso da mosche bianche']
    },
    treatment: {
      organic: ['Rimozione pianta', 'Controllo mosche bianche'],
      preventive: [
        'Controllo mosche bianche (vettori)',
        'Reti anti-insetto',
        'Rimuovere piante infette'
      ],
      steps: [
        '1. Rimuovere pianta colpita',
        '2. Controllare e trattare mosche bianche',
        '3. Usare reti anti-insetto'
      ],
      urgency: 'High'
    }
  },

  // PARASSITI
  {
    id: 'afidi',
    name: 'Aphids',
    nameIT: 'Afidi',
    category: 'Pest',
    affectedPlants: ['Tutte'],
    season: ['Spring', 'Summer'],
    symptoms: {
      visual: [
        'Piccoli insetti verdi, neri o gialli su foglie e fusti',
        'Foglie accartocciate e deformate',
        'Melata appiccicosa sulle foglie',
        'Formiche che si nutrono della melata'
      ],
      keywords: ['afidi', 'pidocchi', 'melata', 'foglie accartocciate', 'formiche'],
      severity: 'Moderate'
    },
    conditions: {
      temperature: { min: 15, max: 30 },
      weather: ['Primavera', 'Estate']
    },
    treatment: {
      organic: ['Olio di Neem', 'Sapone molle', 'Piretro', 'Coccinelle'],
      preventive: [
        'Consociazioni (tagete, nasturzio)',
        'Insetti utili (coccinelle, crisope)',
        'Monitoraggio settimanale'
      ],
      steps: [
        '1. Rimuovere manualmente se poche piante',
        '2. Applicare Olio di Neem + Sapone molle',
        '3. Trattare al tramonto per evitare danni api',
        '4. Ripetere ogni 5-7 giorni se necessario',
        '5. Introdurre coccinelle se disponibili'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'aleurodidi',
    name: 'Whiteflies',
    nameIT: 'Mosche Bianche (Aleurodidi)',
    category: 'Pest',
    affectedPlants: ['Pomodoro', 'Peperone', 'Melanzana', 'Zucchina'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Piccole mosche bianche che volano quando si scuote la pianta',
        'Foglie ingiallite e appiccicose',
        'Melata sulle foglie',
        'Fumaggine nera'
      ],
      keywords: ['mosche bianche', 'aleurodidi', 'fumaggine', 'foglie ingiallite'],
      severity: 'Moderate'
    },
    conditions: {
      temperature: { min: 20, max: 30 },
      weather: ['Caldo', 'Siccitario']
    },
    treatment: {
      organic: ['Olio di Neem', 'Trappole gialle', 'Piretro'],
      preventive: [
        'Reti anti-insetto',
        'Consociazioni (tagete)',
        'Monitoraggio'
      ],
      steps: [
        '1. Installare trappole gialle',
        '2. Applicare Olio di Neem',
        '3. Trattare al tramonto',
        '4. Ripetere ogni 7 giorni'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'ragnetti_rossi',
    name: 'Spider Mites',
    nameIT: 'Ragnetti Rossi',
    category: 'Pest',
    affectedPlants: ['Pomodoro', 'Peperone', 'Fagiolo', 'Cetriolo'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Foglie con puntini gialli',
        'Ragnatele sottili su foglie e fusti',
        'Foglie che si seccano e cadono',
        'Pianta che deperisce'
      ],
      keywords: ['ragnetti rossi', 'ragnatele', 'puntini gialli', 'foglie secche'],
      severity: 'Moderate'
    },
    conditions: {
      temperature: { min: 25, max: 35 },
      humidity: { min: 30, max: 50 },
      weather: ['Caldo', 'Siccitario']
    },
    treatment: {
      organic: ['Acaro predatore', 'Olio di Neem', 'Spruzzo acqua forte'],
      preventive: [
        'Aumentare umidità',
        'Irrigazione fogliare leggera',
        'Monitoraggio'
      ],
      steps: [
        '1. Spruzzare acqua forte sulle foglie (rimuove ragnetti)',
        '2. Aumentare umidità ambiente',
        '3. Applicare Olio di Neem',
        '4. Introdurre acari predatori se disponibili'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'nematodi',
    name: 'Nematodes',
    nameIT: 'Nematodi',
    category: 'Pest',
    affectedPlants: ['Pomodoro', 'Peperone', 'Melanzana', 'Carota'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Crescita stentata',
        'Foglie ingiallite',
        'Radici con noduli',
        'Pianta che appassisce'
      ],
      keywords: ['nematodi', 'radici noduli', 'crescita stentata', 'appassimento'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: 20, max: 30 },
      weather: ['Terreno caldo']
    },
    treatment: {
      organic: ['Tagete (pianta trappola)', 'Rotazione', 'Solarizzazione'],
      preventive: [
        'Rotazione colturale (3-4 anni)',
        'Tagete come pianta trappola',
        'Solarizzazione terreno',
        'Varietà resistenti'
      ],
      steps: [
        '1. Rimuovere piante colpite',
        '2. Piantare tagete (pianta trappola)',
        '3. Solarizzare terreno in estate',
        '4. Non piantare solanacee nello stesso punto per 3-4 anni'
      ],
      urgency: 'High'
    }
  },

  // CARENZE
  {
    id: 'clorosi',
    name: 'Chlorosis',
    nameIT: 'Clorosi (Carenza Ferro)',
    category: 'Deficiency',
    affectedPlants: ['Tutte'],
    season: ['Spring', 'Summer'],
    symptoms: {
      visual: [
        'Foglie gialle con venature verdi',
        'Colpisce prima foglie giovani',
        'Crescita stentata',
        'Pianta debole'
      ],
      keywords: ['clorosi', 'foglie gialle', 'venature verdi', 'carenza ferro'],
      severity: 'Mild'
    },
    conditions: {
      weather: ['Terreno calcareo', 'pH alto']
    },
    treatment: {
      organic: ['Ferro chelato', 'Acidificare terreno', 'Compost'],
      preventive: [
        'Controllare pH terreno',
        'Aggiungere compost',
        'Evitare terreno troppo calcareo'
      ],
      steps: [
        '1. Verificare pH terreno (dovrebbe essere 6-7)',
        '2. Applicare Ferro chelato',
        '3. Acidificare terreno se necessario (torba, zolfo)',
        '4. Aggiungere compost maturo'
      ],
      urgency: 'Low'
    }
  },
  {
    id: 'necrosi_marginale',
    name: 'Marginal Necrosis',
    nameIT: 'Necrosi Marginale (Carenza Potassio)',
    category: 'Deficiency',
    affectedPlants: ['Pomodoro', 'Peperone', 'Zucchina'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Margini foglie che diventano marroni e secchi',
        'Foglie che si arricciano',
        'Frutti piccoli o deformati',
        'Pianta debole'
      ],
      keywords: ['necrosi marginale', 'margini marroni', 'carenza potassio'],
      severity: 'Moderate'
    },
    conditions: {
      weather: ['Terreno sabbioso', 'Lisciviazione']
    },
    treatment: {
      organic: ['Cenere', 'Solfato di potassio', 'Compost'],
      preventive: [
        'Aggiungere compost regolarmente',
        'Pacciamatura',
        'Fertirrigazione con potassio'
      ],
      steps: [
        '1. Applicare cenere (ricca di potassio)',
        '2. Aggiungere compost maturo',
        '3. Fertirrigare con potassio se terreno sabbioso',
        '4. Pacciamare per ridurre lisciviazione'
      ],
      urgency: 'Medium'
    }
  },
  {
    id: 'ingiallimento',
    name: 'Yellowing',
    nameIT: 'Ingiallimento Generale (Carenza Azoto)',
    category: 'Deficiency',
    affectedPlants: ['Tutte'],
    season: ['Spring', 'Summer'],
    symptoms: {
      visual: [
        'Foglie gialle uniformi',
        'Colpisce prima foglie vecchie',
        'Crescita stentata',
        'Pianta debole'
      ],
      keywords: ['ingiallimento', 'foglie gialle', 'carenza azoto'],
      severity: 'Mild'
    },
    conditions: {
      weather: ['Terreno povero', 'Lisciviazione']
    },
    treatment: {
      organic: ['Macerato ortica', 'Compost', 'Sangue di bue'],
      preventive: [
        'Aggiungere compost regolarmente',
        'Rotazione con leguminose',
        'Pacciamatura'
      ],
      steps: [
        '1. Applicare macerato ortica (ricco azoto)',
        '2. Aggiungere compost maturo',
        '3. Considerare sangue di bue se disponibile',
        '4. Pacciamare'
      ],
      urgency: 'Low'
    }
  },

  // AMBIENTALI
  {
    id: 'scottature',
    name: 'Sunburn',
    nameIT: 'Scottature Solari',
    category: 'Environmental',
    affectedPlants: ['Pomodoro', 'Peperone', 'Lattuga'],
    season: ['Summer'],
    symptoms: {
      visual: [
        'Macchie bianche o gialle su foglie e frutti',
        'Tessuti che diventano secchi e cartacei',
        'Colpisce parti esposte al sole diretto',
        'Frutti con macchie bianche'
      ],
      keywords: ['scottature', 'macchie bianche', 'sole diretto', 'tessuti secchi'],
      severity: 'Mild'
    },
    conditions: {
      temperature: { min: 30, max: 40 },
      weather: ['Sole intenso', 'Caldo estremo']
    },
    treatment: {
      organic: ['Ombreggiamento', 'Pacciamatura'],
      preventive: [
        'Ombreggiamento parziale in estate',
        'Pacciamatura per mantenere umidità',
        'Irrigazione adeguata'
      ],
      steps: [
        '1. Installare ombreggiamento parziale',
        '2. Aumentare irrigazione',
        '3. Pacciamare per mantenere umidità',
        '4. Rimuovere parti gravemente danneggiate'
      ],
      urgency: 'Low'
    }
  },
  {
    id: 'gelate',
    name: 'Frost Damage',
    nameIT: 'Danni da Gelata',
    category: 'Environmental',
    affectedPlants: ['Tutte'],
    season: ['Winter', 'Spring'],
    symptoms: {
      visual: [
        'Foglie nere e molli',
        'Tessuti che diventano trasparenti',
        'Pianta che appassisce',
        'Colpisce parti esposte'
      ],
      keywords: ['gelata', 'foglie nere', 'tessuti trasparenti', 'freddo'],
      severity: 'Severe'
    },
    conditions: {
      temperature: { min: -5, max: 5 },
      weather: ['Gelo', 'Brina']
    },
    treatment: {
      organic: ['Protezione', 'Rimozione parti danneggiate'],
      preventive: [
        'Coprire piante con teli o campane',
        'Pacciamatura pesante',
        'Piantare dopo ultime gelate',
        'Monitorare previsioni meteo'
      ],
      steps: [
        '1. Coprire piante con teli o campane',
        '2. Rimuovere parti danneggiate dopo gelata',
        '3. Monitorare per nuovi danni',
        '4. Proteggere meglio in futuro'
      ],
      urgency: 'High'
    }
  },
  {
    id: 'asfissia_radicale',
    name: 'Root Asphyxia',
    nameIT: 'Asfissia Radicale',
    category: 'Environmental',
    affectedPlants: ['Tutte'],
    season: ['Spring', 'Autumn', 'Winter'],
    symptoms: {
      visual: [
        'Foglie che ingialliscono',
        'Pianta che appassisce',
        'Radici marce e nere',
        'Terreno sempre bagnato'
      ],
      keywords: ['asfissia', 'radici marce', 'terreno bagnato', 'ristagno'],
      severity: 'Severe'
    },
    conditions: {
      humidity: { min: 90, max: 100 },
      weather: ['Ristagno d\'acqua', 'Terreno argilloso']
    },
    treatment: {
      organic: ['Migliorare drenaggio', 'Baulature', 'Aggiungere sabbia'],
      preventive: [
        'Migliorare drenaggio terreno',
        'Creare baulature',
        'Aggiungere sabbia se terreno argilloso',
        'Evitare ristagni'
      ],
      steps: [
        '1. Migliorare drenaggio immediatamente',
        '2. Creare baulature se terreno argilloso',
        '3. Aggiungere sabbia per migliorare struttura',
        '4. Ridurre irrigazione',
        '5. Rimuovere piante gravemente colpite'
      ],
      urgency: 'High'
    }
  }
];

/**
 * Trova malattie per una pianta specifica
 */
export const getDiseasesForPlant = (plantName: string): Disease[] => {
  return diseaseDatabase.filter(d => 
    d.affectedPlants.some(p => 
      p.toLowerCase().includes(plantName.toLowerCase()) || 
      plantName.toLowerCase().includes(p.toLowerCase()) ||
      p === 'Tutte'
    )
  );
};

/**
 * Trova malattie per stagione
 */
export const getDiseasesForSeason = (season: Season): Disease[] => {
  return diseaseDatabase.filter(d => d.season.includes(season));
};

/**
 * Trova malattia per ID
 */
export const getDiseaseById = (id: string): Disease | undefined => {
  return diseaseDatabase.find(d => d.id === id);
};

