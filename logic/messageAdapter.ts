/**
 * Message Adapter
 * Adatta messaggi e comunicazioni in base all'esperienza dell'utente
 */

import { UserProfile } from '../types';

export interface Message {
  title?: string;
  content: string;
  detailLevel: 'minimal' | 'standard' | 'detailed';
  technicalTerms?: string[];
  actionable?: boolean;
}

/**
 * Adatta messaggio a expertise utente
 */
export function adaptMessage(
  message: Message,
  userProfile?: UserProfile
): string {
  const expertise = 'intermediate'; // Default expertise level
  const detailLevel = userProfile?.preferences?.detailLevel || 'standard';
  const style = userProfile?.preferences?.preferredCommunicationStyle || 'conversational';

  switch (expertise) {
    case 'beginner':
      return formatForBeginner(message, detailLevel, style);
    case 'expert':
      return formatForExpert(message, detailLevel, style);
    default:
      return formatForIntermediate(message, detailLevel, style);
  }
}

/**
 * Formato per principianti: dettagliato, educativo, rassicurante
 */
function formatForBeginner(
  message: Message,
  detailLevel: 'minimal' | 'standard' | 'detailed',
  style: 'conversational' | 'formal'
): string {
  let output = message.content;

  // Aggiungi spiegazioni per termini tecnici
  if (message.technicalTerms && detailLevel !== 'minimal') {
    const explanations: Record<string, string> = {
      NPK: 'azoto, fosforo e potassio (i nutrienti principali delle piante)',
      pH: 'misura dell\'acidità del terreno (da 0 a 14)',
      peronospora: 'una malattia fungina comune',
      afidi: 'piccoli insetti che succhiano la linfa delle piante',
      trapianto: 'spostare una piantina dal semenzaio al terreno definitivo',
      sarchiatura: 'lavorazione superficiale del terreno per arieggiarlo',
    };

    for (const term of message.technicalTerms) {
      if (explanations[term.toLowerCase()]) {
        output = output.replace(
          new RegExp(`\\b${term}\\b`, 'gi'),
          `${term} (${explanations[term.toLowerCase()]})`
        );
      }
    }
  }

  // Aggiungi contesto se dettagliato
  if (detailLevel === 'detailed' && message.actionable) {
    output += ' Questo ti aiuterà a mantenere le tue piante sane e produttive.';
  }

  // Stile conversazionale vs formale
  if (style === 'conversational') {
    output = output.replace(/devi/g, 'ti consiglio di');
    output = output.replace(/è necessario/g, 'è meglio');
  }

  return output;
}

/**
 * Formato per esperti: conciso, tecnico, diretto
 */
function formatForExpert(
  message: Message,
  detailLevel: 'minimal' | 'standard' | 'detailed',
  style: 'conversational' | 'formal'
): string {
  let output = message.content;

  // Rimuovi spiegazioni superflue
  output = output.replace(/\([^)]*\)/g, ''); // Rimuovi parentesi esplicative

  // Se minimale, mantieni solo informazioni essenziali
  if (detailLevel === 'minimal') {
    // Estrai solo azioni chiave
    const actionMatch = output.match(/(?:→|→|azione:)\s*(.+)/i);
    if (actionMatch) {
      output = actionMatch[1];
    }
  }

  // Stile formale per esperti (default)
  if (style === 'formal') {
    output = output.replace(/ti consiglio/g, 'si consiglia');
    output = output.replace(/puoi/g, 'è possibile');
  }

  return output.trim();
}

/**
 * Formato per intermedi: bilanciato
 */
function formatForIntermediate(
  message: Message,
  detailLevel: 'minimal' | 'standard' | 'detailed',
  style: 'conversational' | 'formal'
): string {
  // Default: usa messaggio originale con piccoli aggiustamenti
  let output = message.content;

  if (detailLevel === 'minimal') {
    // Rimuovi dettagli non essenziali
    output = output.split('.')[0] + '.'; // Prima frase
  }

  return output;
}

/**
 * Determina livello dettaglio basato su contesto
 */
export function determineDetailLevel(
  userProfile: UserProfile | undefined,
  context: {
    urgency?: 'low' | 'medium' | 'high';
    complexity?: 'simple' | 'moderate' | 'complex';
    userRequestedDetail?: boolean;
  }
): 'minimal' | 'standard' | 'detailed' {
  const userPreference = userProfile?.preferences?.detailLevel || 'standard';

  // Override basato su contesto
  if (context.userRequestedDetail) {
    return 'detailed';
  }

  if (context.urgency === 'high') {
    return 'minimal'; // Messaggi urgenti devono essere concisi
  }

  if (context.complexity === 'complex' && userProfile?.expertise === 'beginner') {
    return 'detailed'; // Principianti hanno bisogno di più dettagli per cose complesse
  }

  return userPreference;
}

/**
 * Formatta messaggio per notifica
 */
export function formatForNotification(
  message: Message,
  userProfile?: UserProfile
): { title: string; body: string } {
  const adapted = adaptMessage(message, userProfile);
  const expertise = 'intermediate'; // Default expertise level

  let title = message.title || 'OrtoMio';
  let body = adapted;

  // Per principianti, aggiungi emoji per attirare attenzione
  if (expertise === 'beginner') {
    if (message.content.toLowerCase().includes('gelo')) {
      title = '⚠️ Attenzione: Gelo Previsto';
    } else if (message.content.toLowerCase().includes('raccolta')) {
      title = '🌾 Pronto per la Raccolta';
    } else if (message.content.toLowerCase().includes('irriga')) {
      title = '💧 Ricorda di Irrigare';
    }
  }

  // Limita lunghezza per notifiche
  if (body.length > 150) {
    body = body.substring(0, 147) + '...';
  }

  return { title, body };
}

