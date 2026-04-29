'use client'

type QuickExecutionOutcome = 'good' | 'attention' | 'critical' | null

interface TaskExecutionQuickFeedbackProps {
  outcome?: QuickExecutionOutcome
  followUpRequired?: boolean
  onOutcomeChange: (outcome: QuickExecutionOutcome) => void
  onFollowUpRequiredChange: (value: boolean) => void
}

const outcomeOptions: Array<{ value: Exclude<QuickExecutionOutcome, null>; label: string }> = [
  { value: 'good', label: 'Esito buono' },
  { value: 'attention', label: 'Serve attenzione' },
  { value: 'critical', label: 'Criticita rilevata' },
]

export default function TaskExecutionQuickFeedback({
  outcome = null,
  followUpRequired = false,
  onOutcomeChange,
  onFollowUpRequiredChange,
}: TaskExecutionQuickFeedbackProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Quick feedback</p>
      <p className="mt-1 text-xs text-amber-900">Registra subito l’esito percepito e se serve un follow-up.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {outcomeOptions.map((option) => {
          const isActive = outcome === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onOutcomeChange(isActive ? null : option.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-amber-700 bg-amber-700 text-white'
                  : 'border-amber-300 bg-white text-amber-900 hover:border-amber-400'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-900">
        <input
          type="checkbox"
          checked={followUpRequired}
          onChange={(event) => onFollowUpRequiredChange(event.target.checked)}
          className="rounded border-amber-300"
        />
        Follow-up richiesto
      </label>
    </div>
  )
}
