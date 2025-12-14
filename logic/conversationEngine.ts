/**
 * Conversation Engine
 * Gestisce dialogo naturale con l'utente, sostituendo form statici con conversazioni guidate
 */

import { Garden, GardenTask } from '../types';
import { ZoneMemory } from '../types/memory';
import { getZoneMemory } from '../services/gardenMemoryService';
import { UserProfile } from '../types';

export interface ConversationState {
  currentTopic: 'planting' | 'harvest' | 'problem' | 'general' | 'harvest_log' | 'task_creation';
  pendingQuestions: string[];
  collectedData: Record<string, any>;
  userExpertise: 'beginner' | 'intermediate' | 'expert';
  context?: {
    garden?: Garden;
    task?: GardenTask;
    zoneId?: string;
  };
}

export interface ConversationResponse {
  message: string;
  nextQuestion?: string;
  suggestions?: string[];
  requiresInput: boolean;
  canComplete: boolean;
  completedData?: Record<string, any>;
}

/**
 * Processa input utente e genera risposta
 */
export async function processUserInput(
  input: string,
  state: ConversationState,
  userProfile?: UserProfile
): Promise<{ response: ConversationResponse; newState: ConversationState }> {
  const intent = extractIntent(input, state);
  const expertise = userProfile?.expertise || state.userExpertise || 'intermediate';

  // Aggiorna stato con dati raccolti dall'input
  const updatedState = updateStateFromInput(state, input, intent);

  // Genera risposta basata su intent e stato
  const response = await generateResponse(updatedState, intent, expertise);

  // Determina prossima domanda se necessario
  if (response.requiresInput && !response.nextQuestion) {
    response.nextQuestion = determineNextQuestion(updatedState);
  }

  return {
    response,
    newState: updatedState,
  };
}

/**
 * Estrae intent da input naturale
 */
function extractIntent(
  input: string,
  state: ConversationState
): 'plant' | 'harvest' | 'problem' | 'confirm' | 'deny' | 'provide_info' | 'unknown' {
  const lowerInput = input.toLowerCase().trim();

  // Parole chiave per intent
  if (
    lowerInput.includes('piant') ||
    lowerInput.includes('semin') ||
    lowerInput.includes('trapiant') ||
    lowerInput.includes('metto')
  ) {
    return 'plant';
  }

  if (
    lowerInput.includes('raccolt') ||
    lowerInput.includes('raccogli') ||
    lowerInput.includes('pronto')
  ) {
    return 'harvest';
  }

  if (
    lowerInput.includes('problema') ||
    lowerInput.includes('malattia') ||
    lowerInput.includes('insetto') ||
    lowerInput.includes('foglie gialle') ||
    lowerInput.includes('non cresce')
  ) {
    return 'problem';
  }

  if (
    lowerInput.includes('sì') ||
    lowerInput.includes('si') ||
    lowerInput.includes('ok') ||
    lowerInput.includes('corretto') ||
    lowerInput.includes('giusto') ||
    lowerInput.includes('confermo')
  ) {
    return 'confirm';
  }

  if (
    lowerInput.includes('no') ||
    lowerInput.includes('non') ||
    lowerInput.includes('sbagliato') ||
    lowerInput.includes('correggi')
  ) {
    return 'deny';
  }

  // Se contiene numeri o date, probabilmente sta fornendo informazioni
  if (/\d/.test(lowerInput) || lowerInput.includes('oggi') || lowerInput.includes('ieri')) {
    return 'provide_info';
  }

  return 'unknown';
}

/**
 * Aggiorna stato con dati dall'input
 */
function updateStateFromInput(
  state: ConversationState,
  input: string,
  intent: string
): ConversationState {
  const newState = { ...state };
  const lowerInput = input.toLowerCase();

  // Estrai informazioni comuni
  if (intent === 'provide_info') {
    // Estrai date
    const dateMatch = input.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}/);
    if (dateMatch) {
      newState.collectedData.date = dateMatch[0];
    }

    // Estrai numeri (quantità, giorni, ecc.)
    const numberMatch = input.match(/\d+/);
    if (numberMatch) {
      const num = parseInt(numberMatch[0]);
      if (!newState.collectedData.quantity) {
        newState.collectedData.quantity = num;
      } else if (!newState.collectedData.days) {
        newState.collectedData.days = num;
      }
    }

    // Estrai nomi piante comuni
    const commonPlants = [
      'pomodoro',
      'zucchina',
      'peperone',
      'melanzana',
      'lattuga',
      'basilico',
      'prezzemolo',
      'fagiolo',
      'pisello',
      'carota',
      'cipolla',
      'aglio',
    ];
    for (const plant of commonPlants) {
      if (lowerInput.includes(plant)) {
        newState.collectedData.plant = plant;
        break;
      }
    }
  }

  return newState;
}

/**
 * Genera risposta basata su stato e intent
 */
async function generateResponse(
  state: ConversationState,
  intent: string,
  expertise: 'beginner' | 'intermediate' | 'expert'
): Promise<ConversationResponse> {
  // Recupera memoria se necessario
  let memory: ZoneMemory | null = null;
  if (state.context?.zoneId && state.context?.garden) {
    memory = await getZoneMemory(state.context.zoneId, state.context.garden.id);
  }

  switch (state.currentTopic) {
    case 'planting':
      return handlePlantingConversation(state, intent, memory, expertise);
    case 'harvest':
      return handleHarvestConversation(state, intent, memory, expertise);
    case 'problem':
      return handleProblemConversation(state, intent, memory, expertise);
    case 'harvest_log':
      return handleHarvestLogConversation(state, intent, memory, expertise);
    case 'task_creation':
      return handleTaskCreationConversation(state, intent, memory, expertise);
    default:
      return handleGeneralConversation(state, intent, expertise);
  }
}

/**
 * Gestisce conversazione per piantagione
 */
function handlePlantingConversation(
  state: ConversationState,
  intent: string,
  memory: ZoneMemory | null,
  expertise: 'beginner' | 'intermediate' | 'expert'
): ConversationResponse {
  const data = state.collectedData;

  if (!data.plant) {
    return {
      message: expertise === 'beginner'
        ? 'Cosa vuoi piantare? Dimmi il nome della pianta.'
        : 'Quale pianta?',
      requiresInput: true,
      canComplete: false,
      suggestions: memory
        ? memory.plantingHistory
            .slice(-5)
            .map((p) => p.plant)
            .filter((v, i, a) => a.indexOf(v) === i)
        : undefined,
    };
  }

  if (!data.date && !data.method) {
    const bestDate = memory?.patterns.bestPlantingDate;
    return {
      message: bestDate
        ? `Per ${data.plant}, l'anno scorso hai avuto ottimi risultati trapiantando il ${bestDate.toLocaleDateString('it-IT', {
            month: 'long',
            day: 'numeric',
          })}. Vuoi usare la stessa data?`
        : expertise === 'beginner'
        ? `Quando vuoi piantare ${data.plant}? Dimmi la data o se preferisci partire da seme o piantina.`
        : `Data per ${data.plant}? O metodo (seme/piantina)?`,
      requiresInput: true,
      canComplete: false,
      suggestions: bestDate ? ['Sì, stessa data', 'No, altra data'] : ['Seme', 'Piantina'],
    };
  }

  if (!data.zoneId && state.context?.garden) {
    return {
      message: expertise === 'beginner'
        ? `In quale zona dell'orto vuoi mettere ${data.plant}?`
        : `Zona per ${data.plant}?`,
      requiresInput: true,
      canComplete: false,
    };
  }

  // Abbastanza dati per completare
  return {
    message: `Perfetto! Ho registrato: ${data.plant}${data.date ? ` per il ${data.date}` : ''}${data.method ? ` da ${data.method}` : ''}. Vuoi aggiungere altro?`,
    requiresInput: false,
    canComplete: true,
    completedData: data,
  };
}

/**
 * Gestisce conversazione per raccolta
 */
function handleHarvestConversation(
  state: ConversationState,
  intent: string,
  memory: ZoneMemory | null,
  expertise: 'beginner' | 'intermediate' | 'expert'
): ConversationResponse {
  const data = state.collectedData;

  if (!data.plant) {
    return {
      message: expertise === 'beginner'
        ? 'Cosa hai raccolto? Dimmi il nome della pianta.'
        : 'Quale pianta?',
      requiresInput: true,
      canComplete: false,
    };
  }

  if (!data.quantity) {
    return {
      message: expertise === 'beginner'
        ? `Quanto hai raccolto di ${data.plant}? Dimmi la quantità in kg o numero di pezzi.`
        : `Quantità ${data.plant}?`,
      requiresInput: true,
      canComplete: false,
    };
  }

  if (!data.quality && expertise === 'beginner') {
    return {
      message: `Come valuti la qualità del raccolto di ${data.plant}? Da 1 a 5.`,
      requiresInput: true,
      canComplete: false,
      suggestions: ['1', '2', '3', '4', '5'],
    };
  }

  return {
    message: `Registrato: ${data.quantity}${data.unit || 'kg'} di ${data.plant}${data.quality ? ` (qualità: ${data.quality}/5)` : ''}.`,
    requiresInput: false,
    canComplete: true,
    completedData: data,
  };
}

/**
 * Gestisce conversazione per problemi
 */
function handleProblemConversation(
  state: ConversationState,
  intent: string,
  memory: ZoneMemory | null,
  expertise: 'beginner' | 'intermediate' | 'expert'
): ConversationResponse {
  const data = state.collectedData;

  if (!data.plant) {
    return {
      message: expertise === 'beginner'
        ? 'Quale pianta ha problemi? Dimmi il nome.'
        : 'Pianta interessata?',
      requiresInput: true,
      canComplete: false,
    };
  }

  if (!data.problem) {
    // Suggerisci problemi ricorrenti dalla memoria
    const recurringProblems = memory?.patterns.recurringProblems || [];
    return {
      message: expertise === 'beginner'
        ? `Che problema ha ${data.plant}? Descrivi cosa vedi (foglie gialle, insetti, macchie, ecc.).`
        : `Problema su ${data.plant}?`,
      requiresInput: true,
      canComplete: false,
      suggestions:
        recurringProblems.length > 0
          ? recurringProblems.map((p) => p.problem)
          : ['Foglie gialle', 'Insetti', 'Macchie', 'Non cresce'],
    };
  }

  // Suggerisci trattamenti efficaci dalla memoria
  const effectiveTreatments = memory?.patterns.successfulTreatments.filter(
    (t) => t.problem === data.problem
  ) || [];

  if (effectiveTreatments.length > 0) {
    return {
      message: `Per ${data.problem} su ${data.plant}, l'anno scorso hai usato ${effectiveTreatments[0].treatment} con successo. Vuoi ripetere?`,
      requiresInput: true,
      canComplete: false,
      suggestions: ['Sì', 'No, altro trattamento'],
    };
  }

  return {
    message: `Ho registrato il problema: ${data.problem} su ${data.plant}. Vuoi che suggerisca un trattamento?`,
    requiresInput: false,
    canComplete: true,
    completedData: data,
  };
}

/**
 * Gestisce conversazione per log raccolta
 */
function handleHarvestLogConversation(
  state: ConversationState,
  intent: string,
  memory: ZoneMemory | null,
  expertise: 'beginner' | 'intermediate' | 'expert'
): ConversationResponse {
  return handleHarvestConversation(state, intent, memory, expertise);
}

/**
 * Gestisce conversazione per creazione task
 */
function handleTaskCreationConversation(
  state: ConversationState,
  intent: string,
  memory: ZoneMemory | null,
  expertise: 'beginner' | 'intermediate' | 'expert'
): ConversationResponse {
  // Simile a planting conversation
  return handlePlantingConversation(state, intent, memory, expertise);
}

/**
 * Gestisce conversazione generale
 */
function handleGeneralConversation(
  state: ConversationState,
  intent: string,
  expertise: 'beginner' | 'intermediate' | 'expert'
): ConversationResponse {
  if (intent === 'plant') {
    return {
      message: expertise === 'beginner'
        ? 'Ottimo! Vuoi piantare qualcosa. Dimmi cosa vuoi piantare.'
        : 'Cosa vuoi piantare?',
      requiresInput: true,
      canComplete: false,
    };
  }

  if (intent === 'harvest') {
    return {
      message: expertise === 'beginner'
        ? 'Vuoi registrare un raccolto? Dimmi cosa hai raccolto.'
        : 'Cosa hai raccolto?',
      requiresInput: true,
      canComplete: false,
    };
  }

  return {
    message: expertise === 'beginner'
      ? 'Come posso aiutarti? Puoi dirmi cosa vuoi fare (piantare, raccogliere, segnalare un problema).'
      : 'Dimmi cosa vuoi fare.',
    requiresInput: true,
    canComplete: false,
    suggestions: ['Piantare', 'Raccogliere', 'Problema'],
  };
}

/**
 * Determina prossima domanda basata su stato
 */
function determineNextQuestion(state: ConversationState): string {
  const data = state.collectedData;

  switch (state.currentTopic) {
    case 'planting':
      if (!data.plant) return 'Cosa vuoi piantare?';
      if (!data.date && !data.method) return 'Quando o come (seme/piantina)?';
      if (!data.zoneId) return 'In quale zona?';
      return 'Vuoi aggiungere altro?';

    case 'harvest':
      if (!data.plant) return 'Cosa hai raccolto?';
      if (!data.quantity) return 'Quanto hai raccolto?';
      return 'Vuoi aggiungere altro?';

    case 'problem':
      if (!data.plant) return 'Quale pianta ha problemi?';
      if (!data.problem) return 'Che problema vedi?';
      return 'Vuoi suggerimenti per il trattamento?';

    default:
      return 'Come posso aiutarti?';
  }
}

/**
 * Inizia nuova conversazione
 */
export function startConversation(
  topic: ConversationState['currentTopic'],
  context?: ConversationState['context'],
  userExpertise: 'beginner' | 'intermediate' | 'expert' = 'intermediate'
): ConversationState {
  return {
    currentTopic: topic,
    pendingQuestions: [],
    collectedData: {},
    userExpertise: userExpertise,
    context,
  };
}

