'use client'
import { useEffect, useState } from 'react'
import NativeDialog from '@/components/shared/NativeDialog'
import { getSupabaseClient } from '@/config/supabase'
import { validateSuggestionTasks, type PlanningTaskDraft } from '@/lib/planner/suggestionTasks'
import type { AISuggestion } from '@/types/aiFeedback'

export default function PlannerSuggestionTaskDialog({ suggestion, onClose, onCreated }: {
  suggestion: AISuggestion; onClose: () => void; onCreated: () => Promise<void>
}) {
  const emptyTask = (): PlanningTaskDraft => ({ plantName: '', date: '', taskType: suggestion.suggestion_type === 'HARVEST_TIMING' ? 'Harvest' : 'Sowing' })
  const [tasks, setTasks] = useState<PlanningTaskDraft[]>(() => {
    try { return validateSuggestionTasks(suggestion.suggestion_type, suggestion.suggested_parameters?.tasks) }
    catch { return [emptyTask()] }
  })
  const [rows, setRows] = useState<{ id: string; name: string }[]>([])
  const [rowsLoaded, setRowsLoaded] = useState(false)
  useEffect(() => {
    let active = true
    const client = getSupabaseClient()
    if (!client || !suggestion.garden_id) return
    void client.from('field_rows').select('id,name').eq('garden_id', suggestion.garden_id).order('name').then(result => {
      if (!active) return
      if (result.error) setError('Impossibile caricare i filari del terreno. Riprova prima di confermare.')
      else { setRows(result.data ?? []); setRowsLoaded(true) }
    })
    return () => { active = false }
  }, [suggestion.garden_id])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const update = (index: number, value: Partial<PlanningTaskDraft>) => setTasks(tasks.map((task, i) => i === index ? { ...task, ...value } : task))
  async function submit() {
    setError(''); setBusy(true)
    try {
      const reviewed = validateSuggestionTasks(suggestion.suggestion_type, tasks)
      if (!rowsLoaded || reviewed.some(task => task.fieldRowId && !rows.some(row => row.id === task.fieldRowId))) throw new Error('Seleziona un filare disponibile oppure l’intero terreno.')
      const client = getSupabaseClient()
      if (!client) throw new Error('Database non disponibile.')
      const result = await client.rpc('accept_planner_suggestion', { p_suggestion_id: suggestion.id, p_tasks: reviewed })
      if (result.error || !Array.isArray(result.data?.taskIds) || !result.data.taskIds.length) {
        throw new Error(result.error?.code === 'PGRST202' ? 'Pianificazione non ancora attivata sul database. La richiesta non è stata accettata.' : 'Impossibile pianificare le attività. Verifica il terreno, le date e lo stato del suggerimento.')
      }
      await onCreated(); onClose()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Pianificazione non riuscita.') }
    finally { setBusy(false) }
  }
  return <NativeDialog titleId="planner-review-title" onClose={onClose} busy={busy}>
    <h2 id="planner-review-title" className="text-xl font-bold">Pianifica le attività</h2>
    <p className="mt-2">{suggestion.title}</p>
    <p className="my-3 text-sm">Verifica colture, tipo di attività e date prima di confermare. Verranno creati task nel calendario; le operazioni resteranno da eseguire.</p>
    <form onSubmit={event => { event.preventDefault(); void submit() }}>
      {tasks.map((task, index) => <fieldset key={index} disabled={busy} className="my-3 grid gap-3 rounded border p-3">
        <legend>Attività {index + 1}</legend>
        <label>Coltura<input required maxLength={200} value={task.plantName} onChange={e => update(index, { plantName: e.target.value })} className="block w-full rounded border p-2" /></label>
        <label>Destinazione<select value={task.fieldRowId ?? ''} onChange={e => update(index, { fieldRowId: e.target.value || undefined })} disabled={!rowsLoaded} className="block w-full rounded border p-2">
          <option value="">Terreno del suggerimento, senza filare specifico</option>
          {task.fieldRowId && !rows.some(row => row.id === task.fieldRowId) && <option value={task.fieldRowId}>Filare proposto non disponibile</option>}
          {rows.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
        </select></label>
        <label>Operazione<select value={task.taskType} onChange={e => update(index, { taskType: e.target.value as PlanningTaskDraft['taskType'] })} className="block w-full rounded border p-2">
          {suggestion.suggestion_type === 'HARVEST_TIMING' ? <option value="Harvest">Raccolta</option> : <><option value="Sowing">Semina</option><option value="Transplant">Trapianto</option></>}
        </select></label>
        <label>Data<input required type="date" min="1900-01-01" max="2200-12-31" value={task.date} onChange={e => update(index, { date: e.target.value })} className="block w-full rounded border p-2" /></label>
        <label>Numero di piante o unità (facoltativo)<input type="number" min={1} max={1000000} step={1} value={task.quantity ?? ''} onChange={e => update(index, { quantity: e.target.value ? Number(e.target.value) : undefined })} className="block w-full rounded border p-2" /></label>
        <label>Note<textarea maxLength={2000} value={task.notes ?? ''} onChange={e => update(index, { notes: e.target.value })} className="block w-full rounded border p-2" /></label>
        {tasks.length > 1 && <button type="button" onClick={() => setTasks(tasks.filter((_, i) => i !== index))}>Rimuovi attività</button>}
      </fieldset>)}
      {error && <p role="alert" className="my-3 text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy || tasks.length >= 20} onClick={() => setTasks([...tasks, emptyTask()])} className="rounded border p-2">Aggiungi attività</button>
        <button type="button" disabled={busy} onClick={onClose} className="rounded border p-2">Annulla</button>
        <button type="submit" disabled={busy || !rowsLoaded} className="rounded bg-green-700 p-2 text-white">{busy ? 'Salvataggio…' : `Conferma e crea ${tasks.length} attività`}</button>
      </div>
    </form>
  </NativeDialog>
}
