export type TaskExecutionQuickOutcome = 'good' | 'attention' | 'critical' | null

interface TaskExecutionQuickPayloadInput {
  outcome?: TaskExecutionQuickOutcome
  followUpRequired?: boolean
}

const appendToken = (tokens: string[], token?: string) => {
  const normalizedToken = token?.trim()
  if (!normalizedToken) {
    return
  }

  if (tokens.some((item) => item.toLowerCase() === normalizedToken.toLowerCase())) {
    return
  }

  tokens.push(normalizedToken)
}

export const buildTaskExecutionQuickFeedbackTokens = ({
  outcome,
  followUpRequired,
}: TaskExecutionQuickPayloadInput): string[] => {
  const tokens: string[] = []
  if (outcome) {
    appendToken(tokens, `esito ${outcome}`)
  }
  if (followUpRequired) {
    appendToken(tokens, 'follow-up richiesto')
  }
  return tokens
}

export const mergeTaskExecutionQuickPayloadNotes = (
  notes?: string | null,
  quickPayload: TaskExecutionQuickPayloadInput = {}
): string | undefined => {
  const parts = notes
    ?.split('•')
    .map((part) => part.trim())
    .filter(Boolean) || []

  for (const token of buildTaskExecutionQuickFeedbackTokens(quickPayload)) {
    appendToken(parts, token)
  }

  return parts.length > 0 ? parts.join(' • ') : undefined
}

export const parseTaskExecutionQuickPayloadNotes = (notes?: string | null): {
  outcome: TaskExecutionQuickOutcome
  followUpRequired: boolean
} => {
  const normalizedNotes = notes?.toLowerCase() || ''

  return {
    outcome: normalizedNotes.includes('esito critical')
      ? 'critical'
      : normalizedNotes.includes('esito attention')
        ? 'attention'
        : normalizedNotes.includes('esito good')
          ? 'good'
          : null,
    followUpRequired: normalizedNotes.includes('follow-up richiesto'),
  }
}
