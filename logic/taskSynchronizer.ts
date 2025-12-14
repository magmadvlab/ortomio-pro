/**
 * Task Synchronizer
 * Sincronizza suggerimenti dell'orchestrator con completamenti reali
 * Gestisce il caso in cui un lavoro viene fatto in data diversa da quella suggerita
 */

import { GardenTask } from '../types';

/**
 * Sincronizza un task quando viene completato, tracciando la differenza tra data suggerita e data effettiva
 * 
 * **Scopo**: Quando un lavoro viene fatto in data diversa da quella suggerita dall'orchestrator,
 * questa funzione aggiorna i campi di tracking per mantenere traccia sia della data suggerita
 * originale che della data effettiva di completamento.
 * 
 * **Caso d'uso principale**: 
 * - L'orchestrator suggerisce di fare la potatura il 18 febbraio
 * - L'utente completa la potatura il 26 febbraio (8 giorni dopo)
 * - Questa funzione registra entrambe le date per tracciabilità e ricalcolo corretto
 * 
 * **Cosa fa**:
 * - Se il task è suggerito (`isSuggested: true`) e ha `suggestedDate`:
 *   - Confronta `suggestedDate` con la data effettiva di completamento
 *   - Se diverse, aggiorna `actualCompletedDate` con la data effettiva
 *   - Mantiene `suggestedDate` originale per tracciabilità
 *   - Aggiorna `date` con la data effettiva (per calendario)
 *   - Aggiunge nota automatica sulla differenza (es. "Completato 8 giorni dopo")
 * - Se il task non è suggerito, aggiorna semplicemente la data
 * 
 * **Importante**: La data effettiva viene poi usata da `updateOrchestratorFromCompletion` per
 * ricalcolare i prossimi suggerimenti basandosi sulla realtà, non sulla previsione.
 * 
 * @param task - Task da sincronizzare
 * @param actualDate - Data effettiva in cui il task è stato completato
 * @returns GardenTask - Task aggiornato con `actualCompletedDate` e note
 */
export function syncTaskCompletion(
  task: GardenTask,
  actualDate: Date
): GardenTask {
  const updatedTask = { ...task };
  
  // Se è un task suggerito
  if (task.isSuggested && task.suggestedDate) {
    const suggestedDate = new Date(task.suggestedDate);
    const actualDateStr = actualDate.toISOString().split('T')[0];
    const suggestedDateStr = suggestedDate.toISOString().split('T')[0];

    // Se completato in data diversa da quella suggerita
    if (actualDateStr !== suggestedDateStr) {
      updatedTask.actualCompletedDate = actualDate.toISOString();
      updatedTask.date = actualDateStr; // Aggiorna anche la data principale
      
      // Aggiungi nota sulla differenza
      const daysDiff = Math.floor(
        (actualDate.getTime() - suggestedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diffNote = `\n\n[Completato ${daysDiff > 0 ? `${daysDiff} giorni dopo` : `${Math.abs(daysDiff)} giorni prima`} rispetto alla data suggerita (${suggestedDateStr})]`;
      updatedTask.notes = (updatedTask.notes || '') + diffNote;
    } else {
      // Completato nella data suggerita
      updatedTask.actualCompletedDate = actualDate.toISOString();
    }
  } else {
    // Task non suggerito, usa semplicemente la data di completamento
    updatedTask.date = actualDate.toISOString().split('T')[0];
  }

  updatedTask.completed = true;
  return updatedTask;
}

/**
 * Marca un suggerimento come completato e gestisce il caso in cui viene completato in data diversa
 * 
 * **Scopo**: Quando un suggerimento viene completato, questa funzione gestisce due scenari:
 * 1. Completato nella data suggerita: aggiorna semplicemente il task originale
 * 2. Completato in data diversa: marca il suggerimento come completato E crea un nuovo task
 *    con la data effettiva per il calendario, mantenendo il link al suggerimento originale
 * 
 * **Perché due task**:
 * - Il suggerimento originale viene mantenuto per tracciabilità (quando era stato suggerito)
 * - Il nuovo task con data effettiva viene usato per il calendario e visualizzazione
 * - Entrambi sono linkati per mantenere la relazione
 * 
 * @param suggestedTaskId - ID del task suggerito da completare
 * @param actualDate - Data effettiva in cui il lavoro è stato completato
 * @param allTasks - Array di tutti i task per trovare il suggerimento
 * @returns Oggetto con `updatedTask` (suggerimento marcato) e opzionalmente `newTask` (se data diversa)
 * @throws Error se il task suggerito non viene trovato
 */
export function markSuggestionAsCompleted(
  suggestedTaskId: string,
  actualDate: Date,
  allTasks: GardenTask[]
): { updatedTask: GardenTask; newTask?: GardenTask } {
  const suggestedTask = allTasks.find(t => t.id === suggestedTaskId);
  
  if (!suggestedTask || !suggestedTask.isSuggested) {
    throw new Error(`Task suggerito non trovato: ${suggestedTaskId}`);
  }

  const suggestedDate = suggestedTask.suggestedDate 
    ? new Date(suggestedTask.suggestedDate)
    : new Date(suggestedTask.date);
  
  const actualDateStr = actualDate.toISOString().split('T')[0];
  const suggestedDateStr = suggestedDate.toISOString().split('T')[0];

  // Se completato nella stessa data suggerita, aggiorna semplicemente
  if (actualDateStr === suggestedDateStr) {
    const updatedTask = syncTaskCompletion(suggestedTask, actualDate);
    return { updatedTask };
  }

  // Se completato in data diversa:
  // 1. Marca il task suggerito come completato (per tracciabilità)
  const updatedSuggestedTask: GardenTask = {
    ...suggestedTask,
    completed: true,
    actualCompletedDate: actualDate.toISOString(),
    notes: (suggestedTask.notes || '') + `\n\n[Completato in data diversa: ${actualDateStr} invece di ${suggestedDateStr}]`
  };

  // 2. Crea nuovo task con data effettiva (per calendario)
  const newTask: GardenTask = {
    ...suggestedTask,
    id: crypto.randomUUID(),
    date: actualDateStr,
    suggestedDate: suggestedDateStr, // Mantiene riferimento alla data suggerita
    actualCompletedDate: actualDate.toISOString(),
    completed: true,
    notes: (suggestedTask.notes || '') + `\n\n[Completato il ${actualDateStr}. Data suggerita: ${suggestedDateStr}]`
  };

  return { updatedTask: updatedSuggestedTask, newTask };
}

/**
 * Restituisce tutti i task suggeriti non ancora completati
 * 
 * **Scopo**: Filtra i task per trovare quelli generati automaticamente dall'orchestrator
 * che non sono ancora stati completati dall'utente.
 * 
 * **Uso**: Viene chiamato dal dashboard e calendario per mostrare all'utente
 * i suggerimenti in attesa di completamento.
 * 
 * @param tasks - Array di tutti i task del giardino
 * @returns GardenTask[] - Array di task suggeriti non completati
 */
export function getPendingSuggestions(tasks: GardenTask[]): GardenTask[] {
  return tasks.filter(
    t => t.isSuggested === true && !t.completed
  );
}

/**
 * Aggiorna l'orchestrator quando un lavoro viene completato, usando la data effettiva per ricalcolare suggerimenti
 * 
 * **Scopo**: Quando un lavoro viene completato (soprattutto se in data diversa da quella suggerita),
 * questa funzione determina se l'orchestrator deve ricalcolare i prossimi suggerimenti e quale
 * data usare come base per i calcoli.
 * 
 * **Logica critica**:
 * - Se un task suggerito è stato completato in data diversa, usa la **data effettiva** (`actualCompletedDate`)
 *   per ricalcolare i prossimi suggerimenti, NON la data suggerita originale
 * - Questo garantisce che i suggerimenti futuri siano basati sulla realtà, non sulla previsione
 * - Esempio: Se la potatura era suggerita per il 18 febbraio ma fatta il 26 febbraio, i prossimi
 *   suggerimenti (es. prossima potatura) partiranno dal 26 febbraio, non dal 18
 * 
 * **Output**: 
 * - `shouldRecalculate`: true se l'orchestrator deve ricalcolare
 * - `baseDate`: Data da usare come base per i nuovi calcoli (data effettiva se disponibile)
 * 
 * @param completedTask - Task che è stato completato
 * @param allTasks - Array di tutti i task per contesto
 * @returns Oggetto con flag `shouldRecalculate` e `baseDate` per ricalcolo
 */
export function updateOrchestratorFromCompletion(
  completedTask: GardenTask,
  allTasks: GardenTask[]
): {
  shouldRecalculate: boolean;
  baseDate: Date; // Data da usare per ricalcolare prossimi suggerimenti
} {
  // Se è un task suggerito completato in data diversa
  if (completedTask.isSuggested && completedTask.actualCompletedDate) {
    const actualDate = new Date(completedTask.actualCompletedDate);
    
    return {
      shouldRecalculate: true,
      baseDate: actualDate // Usa data effettiva, non quella suggerita
    };
  }

  // Se è un task normale o completato nella data suggerita
  if (completedTask.completed) {
    const completionDate = completedTask.actualCompletedDate 
      ? new Date(completedTask.actualCompletedDate)
      : new Date(completedTask.date);

    return {
      shouldRecalculate: true,
      baseDate: completionDate
    };
  }

  return {
    shouldRecalculate: false,
    baseDate: new Date()
  };
}

/**
 * Verifica se un suggerimento è ancora valido o se è scaduto
 * 
 * **Scopo**: Determina se un suggerimento generato dall'orchestrator è ancora rilevante
 * o se è passato troppo tempo dalla data suggerita.
 * 
 * **Logica**:
 * - Un suggerimento è considerato valido se non sono passati più di 30 giorni dalla data suggerita
 * - Dopo 30 giorni, il suggerimento viene considerato scaduto e può essere rimosso o rigenerato
 * 
 * **Uso**: Viene chiamato per pulire suggerimenti vecchi o per determinare se rigenerare
 * suggerimenti basandosi su nuove condizioni.
 * 
 * @param suggestedTask - Task suggerito da verificare
 * @param currentDate - Data corrente (default: oggi)
 * @returns Oggetto con `valid: boolean` e opzionale `reason` se non valido
 */
export function isSuggestionStillValid(
  suggestedTask: GardenTask,
  currentDate: Date = new Date()
): { valid: boolean; reason?: string } {
  if (!suggestedTask.isSuggested || !suggestedTask.suggestedDate) {
    return { valid: true };
  }

  const suggestedDate = new Date(suggestedTask.suggestedDate);
  const daysDiff = Math.floor(
    (currentDate.getTime() - suggestedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Suggerimento valido se non è passato più di 30 giorni dalla data suggerita
  if (daysDiff > 30) {
    return {
      valid: false,
      reason: `Suggerimento scaduto (${daysDiff} giorni fa)`
    };
  }

  return { valid: true };
}
