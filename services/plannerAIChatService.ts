import { buildAIAssistantGroundingContext } from '@/services/aiGroundingService'

type PlannerChatErrorPayload = {
  error?: string
  message?: string
}

interface PlannerAIContextInput {
  garden?: any
  tasks?: any[]
}

interface PlannerAIResponse {
  content: string
  suggestions: string[]
  grounding?: {
    scope: string
    source: string
    confidence: number
    contextSummary: string
    missingSignals: string[]
  }
}

const plannerRecoverySuggestions = [
  'Quali task conviene pianificare questa settimana?',
  'Come priorizzare i task in base alla stagione?',
  'Quale modulo operativo devo aprire ora?',
  'Come trasformare questo consiglio in task reali?'
]

const creditRecoverySuggestions = [
  'Controlla i credits AI disponibili',
  'Apri il planner task/queue manualmente',
  'Riprova quando i credits sono disponibili',
  'Continua con pianificazione guidata senza chat AI'
]

const buildPlannerChatContext = ({ garden, tasks }: PlannerAIContextInput) => {
  const openTasks = (tasks || []).filter((task) => !task?.completed)
  const grounding = buildAIAssistantGroundingContext({
    scope: 'planner-chat',
    garden,
    extraSignals: [
      'eventuali vincoli meteo e sensori real-time',
      'conferma utente per scritture operative',
    ],
    summary: `Planner assistivo con ${openTasks.length} task aperti su ${(tasks || []).length} totali.`,
  })
  return {
    type: 'task-context' as const,
    scope: {
      module: 'planner',
      gardenId: garden?.id || null,
      gardenName: garden?.name || null,
      totalTasks: (tasks || []).length,
      openTasks: openTasks.length,
    },
    gardenContext: garden || null,
    summary: `Planner assistivo con ${openTasks.length} task aperti su ${(tasks || []).length} totali.`,
    signals: {
      taskTitles: openTasks
        .slice(0, 5)
        .map((task) => task?.title)
        .filter(Boolean),
    },
    missingSignals: grounding.missingSignals,
    routingHints: [
      { label: 'Apri Planner', route: '/planner' },
      { label: 'Apri Task', route: '/tasks' },
    ],
    grounding,
  }
}

const buildErrorMessage = (status: number, payload?: PlannerChatErrorPayload | null) => {
  if (payload?.error === 'insufficient_credits') {
    return '⚠️ Credits AI insufficienti. La chat planner resta assistiva: puoi continuare dal task planner/queue.'
  }

  if (status === 401 || status === 403) {
    return '⚠️ Questa chat AI richiede un accesso autorizzato con piano compatibile.'
  }

  if (payload?.error === 'message_required' || status === 400) {
    return '⚠️ Inserisci una domanda valida prima di inviare la richiesta.'
  }

  if (status >= 500) {
    return payload?.message || '⚠️ Motore AI temporaneamente non disponibile. Nessuna azione operativa è stata eseguita.'
  }

  return payload?.message || '⚠️ Richiesta chat non andata a buon fine. Nessuna azione operativa è stata eseguita.'
}

const appendCreditsHint = (reply?: string, creditsRemaining?: number) => {
  if (!reply) {
    return '⚠️ La chat AI non ha restituito contenuto.'
  }

  if (typeof creditsRemaining === 'number') {
    return `${reply}\n\n_Credits AI rimanenti: ${creditsRemaining}_`
  }

  return reply
}

export async function requestPlannerAIResponse(
  message: string,
  contextInput: PlannerAIContextInput
): Promise<PlannerAIResponse> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      context: buildPlannerChatContext(contextInput),
    }),
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as PlannerChatErrorPayload | null
    return {
      content: buildErrorMessage(response.status, errorPayload),
      suggestions: errorPayload?.error === 'insufficient_credits' ? creditRecoverySuggestions : plannerRecoverySuggestions,
    }
  }

  const payload = await response.json()
  return {
    content: appendCreditsHint(payload?.reply, payload?.creditsRemaining),
    suggestions: plannerRecoverySuggestions,
    grounding: payload?.grounding,
  }
}
