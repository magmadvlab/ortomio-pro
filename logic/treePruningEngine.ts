/**
 * Engine per potatura alberi (inclusi agrumi)
 * Suggerisce potatura in base a stagione, tipo di albero e condizioni
 */

import { Garden, GardenTask } from '../types';
import { calculateMoonPhase } from './lunarCalendar';

export interface TreePruningAdvice {
  taskType: 'TreePruning';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  suggestedDate: string; // ISO date string - data suggerita
  instructions: string[];
  treeType: 'Pome' | 'Stone' | 'Citrus' | 'Nut' | 'Berry';
  pruningType: 'Formative' | 'Maintenance' | 'Rejuvenation';
  season: 'Winter' | 'Summer';
  lunarAdvice?: string;
}

/**
 * Calcola suggerimenti per potatura alberi da frutto (inclusi agrumi)
 * 
 * **Scopo**: Suggerisce quando potare alberi da frutto in base a tipo di albero, stagione,
 * fasi lunari e potature già completate.
 * 
 * **Supporto agrumi**: Include logica specifica per agrumi che hanno esigenze diverse
 * rispetto ad altri fruttiferi:
 * - Potatura invernale leggera (solo rimozione rami secchi)
 * - Potatura principale in primavera (Marzo-Aprile) invece che inverno
 * - Potatura estiva per rimozione succhioni
 * 
 * **Cosa considera**:
 * - **Tipo albero**: Pome (mele, pere), Stone (pesche, ciliegie), Citrus (agrumi), Nut (noci), Berry (frutti di bosco)
 * - **Stagione**:
 *   - Inverno (Dicembre-Febbraio): Potatura principale per la maggior parte degli alberi
 *   - Primavera (Marzo-Aprile): Potatura principale per agrumi
 *   - Estate (Giugno-Luglio): Potatura verde per controllo vegetazione
 * - **Fasi lunari**: Preferisce luna calante per potatura (tradizione contadina)
 * - **Potature già completate**: Non suggerisce potature già eseguite nell'anno corrente
 * 
 * **Output**: Array di suggerimenti con:
 * - Tipo albero
 * - Tipo potatura (Formative/Maintenance/Rejuvenation)
 * - Stagione (Winter/Summer)
 * - Data suggerita
 * - Istruzioni dettagliate specifiche per tipo albero
 * - Consiglio lunare se applicabile
 * 
 * **Nota**: I suggerimenti hanno `suggestedDate` ma l'utente può completarli in data diversa.
 * 
 * @param garden - Giardino per cui calcolare i suggerimenti
 * @param currentDate - Data corrente (default: oggi)
 * @param tasks - Array di task esistenti per identificare alberi e potature completate
 * @returns TreePruningAdvice[] - Array di suggerimenti per potatura alberi
 */
export function calculateTreePruningTasks(
  garden: Garden,
  currentDate: Date = new Date(),
  tasks: GardenTask[]
): TreePruningAdvice[] {
  const suggestions: TreePruningAdvice[] = [];

  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Trova tutti i task di alberi da frutto nel giardino
  const fruitTreeTasks = tasks.filter(
    t => t.gardenId === garden.id && 
    (t.fruitTreeData || t.taskType === 'TreePruning' || 
     t.plantName.toLowerCase().includes('albero') || 
     t.plantName.toLowerCase().includes('frutto'))
  );

  if (fruitTreeTasks.length === 0) {
    return suggestions; // Nessun albero nel giardino
  }

  // Verifica potature già completate quest'anno
  const currentYearCompletions = tasks.filter(
    t => t.taskType === 'TreePruning' && 
    t.completed && 
    new Date(t.date).getFullYear() === currentYear
  );

  // Calcola fase lunare
  const moonInfo = calculateMoonPhase(currentDate);
  const lunarAdvice = moonInfo.isWaning 
    ? '🌙 Luna calante: momento ideale per potatura'
    : '⚠️ Luna crescente: meglio aspettare luna calante per potatura';

  // 1. POTATURA INVERNALE (Dicembre-Febbraio)
  // Per la maggior parte degli alberi da frutto (esclusi agrumi)
  if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
    const suggestedDate = new Date(currentYear, currentMonth === 12 ? 11 : currentMonth - 1, 15);
    
    // Potatura per alberi da frutto standard (non agrumi)
    const nonCitrusTrees = fruitTreeTasks.filter(
      t => !t.treePruningData || t.treePruningData.treeType !== 'Citrus'
    );

    if (nonCitrusTrees.length > 0 && !currentYearCompletions.some(t => t.treePruningData?.season === 'Winter')) {
      suggestions.push({
        taskType: 'TreePruning',
        priority: 'High',
        message: 'Potatura invernale alberi da frutto',
        suggestedDate: suggestedDate.toISOString().split('T')[0],
        instructions: [
          'Esegui potatura durante il riposo vegetativo (dicembre-febbraio)',
          'Rimuovi rami secchi, malati, danneggiati o che si incrociano',
          'Apri la chioma per favorire penetrazione luce e aereazione',
          'Taglia sopra gemma esterna per favorire crescita verso l\'esterno',
          'Mantieni forma a vaso o palmetta secondo sistema di allevamento',
          'Disinfetta attrezzi tra un albero e l\'altro per prevenire malattie',
          'Evita potatura con temperature sotto zero'
        ],
        treeType: 'Pome', // Default, può essere specificato per albero
        pruningType: 'Maintenance',
        season: 'Winter',
        lunarAdvice
      });
    }

    // Potatura agrumi (diversa da altri fruttiferi)
    const citrusTrees = fruitTreeTasks.filter(
      t => t.treePruningData?.treeType === 'Citrus'
    );

    if (citrusTrees.length > 0) {
      // Agrumi: potatura più leggera in inverno, principale in primavera
      suggestions.push({
        taskType: 'TreePruning',
        priority: 'Medium',
        message: 'Potatura invernale agrumi (leggera)',
        suggestedDate: suggestedDate.toISOString().split('T')[0],
        instructions: [
          'Agrumi: potatura invernale leggera (rimozione rami secchi)',
          'Evita potature drastiche in inverno per agrumi',
          'Rimuovi solo rami morti, malati o danneggiati',
          'La potatura principale degli agrumi si fa in primavera (marzo-aprile)',
          'Proteggi i tagli con mastice cicatrizzante',
          'Disinfetta attrezzi tra un albero e l\'altro'
        ],
        treeType: 'Citrus',
        pruningType: 'Maintenance',
        season: 'Winter',
        lunarAdvice
      });
    }
  }

  // 2. POTATURA PRIMAVERILE AGRUMI (Marzo-Aprile)
  // Potatura principale per agrumi (diversa da altri fruttiferi)
  if (currentMonth === 3 || currentMonth === 4) {
    const citrusTrees = fruitTreeTasks.filter(
      t => t.treePruningData?.treeType === 'Citrus'
    );

    if (citrusTrees.length > 0) {
      const suggestedDate = new Date(currentYear, currentMonth - 1, 10);
      const moonInfo = calculateMoonPhase(suggestedDate);
      const lunarAdvice = moonInfo.isWaning 
        ? '🌙 Luna calante: momento ideale per potatura agrumi'
        : '⚠️ Luna crescente: meglio aspettare luna calante';

      suggestions.push({
        taskType: 'TreePruning',
        priority: 'High',
        message: 'Potatura primaverile agrumi (principale)',
        suggestedDate: suggestedDate.toISOString().split('T')[0],
        instructions: [
          'Agrumi: potatura principale in primavera (marzo-aprile)',
          'Rimuovi succhioni e rami che crescono verso l\'interno',
          'Apri la chioma per favorire aereazione e penetrazione luce',
          'Mantieni forma globosa o a vaso aperto',
          'Taglia rami che toccano il terreno',
          'Riduci altezza se necessario (max 3-4m per facilitare raccolta)',
          'Dopo potatura, applica concimazione per favorire ripresa vegetativa',
          'Proteggi i tagli principali con mastice cicatrizzante',
          'Disinfetta attrezzi tra un albero e l\'altro'
        ],
        treeType: 'Citrus',
        pruningType: 'Maintenance',
        season: 'Winter', // Anche se tecnicamente primavera, usiamo 'Winter' per coerenza con altri engine
        lunarAdvice
      });
    }
  }

  // 3. POTATURA ESTIVA (Giugno-Luglio)
  // Potatura verde per controllo vegetazione
  if (currentMonth === 6 || currentMonth === 7) {
    const suggestedDate = new Date(currentYear, currentMonth - 1, 15);
    const moonInfo = calculateMoonPhase(suggestedDate);
    const lunarAdvice = moonInfo.isWaning 
      ? '🌙 Luna calante: ideale per potatura verde'
      : '⚠️ Luna crescente: meglio aspettare luna calante';

    suggestions.push({
      taskType: 'TreePruning',
      priority: 'Medium',
      message: 'Potatura estiva (controllo vegetazione)',
      suggestedDate: suggestedDate.toISOString().split('T')[0],
      instructions: [
        'Potatura verde estiva per controllo vegetazione eccessiva',
        'Rimuovi succhioni e rami che crescono verticalmente',
        'Dirada rami troppo fitti per favorire maturazione frutti',
        'Rimuovi rami danneggiati o malati',
        'Per agrumi: rimuovi succhioni basali e rami che toccano il terreno',
        'Evita potature drastiche in estate (stress idrico)',
        'Irriga dopo potatura se necessario'
      ],
      treeType: 'Pome', // Default
      pruningType: 'Maintenance',
      season: 'Summer',
      lunarAdvice
    });
  }

  return suggestions;
}
