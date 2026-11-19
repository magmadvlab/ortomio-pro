'use client'

import { useEffect, useState, type FormEvent } from 'react'
import type { Garden } from '@/types'
import type { FieldRow } from '@/types/fieldRow'
import type { GardenPlant } from '@/types/individualPlant'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { buildIndividualPlant } from '@/lib/plants/createIndividualPlant'
import NativeDialog from '@/components/shared/NativeDialog'

export default function AddIndividualPlantModal({ garden, initialRowId, onClose, onCreated }: {
  garden: Garden; initialRowId?: string; onClose: () => void; onCreated: () => void
}) {
  const { storageProvider } = useStorage()
  const [rowId, setRowId] = useState(initialRowId ?? '')
  const [rows, setRows] = useState<FieldRow[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        if (!storageProvider.getFieldRows) throw new Error('Archivio filari non disponibile.')
        const result = await storageProvider.getFieldRows(garden.id)
        if (active) { setRows(result); if (initialRowId && !result.some(row => row.id === initialRowId)) throw new Error('Il filare richiesto non appartiene a questo terreno.') }
      } catch (cause) { if (active) { setLoadFailed(true); setError(cause instanceof Error ? cause.message : 'Impossibile caricare i filari.') } }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [garden.id, initialRowId, storageProvider])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || saved) return
    setBusy(true); setError('')
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '')
    try {
      if (!storageProvider.createIndividualPlant) throw new Error('Archivio piante non disponibile.')
      const rowId = text('fieldRowId')
      if (rowId && !rows.some(row => row.id === rowId)) throw new Error('Il filare selezionato non appartiene a questo terreno.')
      const plant = buildIndividualPlant({ gardenId: garden.id, plantName: text('plantName'), plantCode: text('plantCode'), variety: text('variety'), fieldRowId: rowId, positionInRow: Number(text('positionInRow')), plantingDate: text('plantingDate'), source:(text('source') || undefined) as GardenPlant['source'], expectedHarvestDate:text('expectedHarvestDate'), status: text('status') as GardenPlant['status'], healthScore: Number(text('healthScore')), notes: text('notes') })
      await storageProvider.createIndividualPlant(plant)
      setSaved(true)
      onCreated()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Salvataggio non riuscito. Riprova.') }
    finally { setBusy(false) }
  }
  const field = 'mt-1 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-900'
  return <NativeDialog titleId="add-plant-title" onClose={onClose} busy={busy}>
    <h2 id="add-plant-title" className="text-xl font-semibold">Aggiungi pianta a {garden.name}</h2>
    <p className="my-3 text-sm text-gray-600">Registra un esemplare già presente in campo. Per semine o lotti da trapiantare usa Piantine.</p>
    {error && <p role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy || loading || loadFailed || saved} className="grid gap-4 sm:grid-cols-2">
        <label>Nome pianta *<input autoFocus required name="plantName" maxLength={150} className={field} /></label>
        <label>Codice identificativo *<input required name="plantCode" maxLength={100} className={field} placeholder="Es. F1-P001" /></label>
        <label>Varietà<input name="variety" maxLength={150} className={field} /></label>
        <label>Filare<select name="fieldRowId" value={rowId} onChange={event => setRowId(event.target.value)} className={field}><option value="">Senza filare</option>{rows.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        <label>Posizione *<input required name="positionInRow" type="number" min="1" step="1" className={field} /></label>
        <label>Origine<select name="source" className={field}><option value="">Non registrata</option><option value="seed">Seme in campo</option><option value="nursery">Piantina da vivaio</option><option value="transplant">Trapianto dal semenzaio</option></select></label>
        <label>Raccolta prevista per la varietà<input name="expectedHarvestDate" type="date" className={field} /></label>
        <label>Data di impianto<input name="plantingDate" type="date" className={field} /></label>
        <label>Stato osservato *<select required name="status" defaultValue="" className={field}><option value="" disabled>Seleziona</option><option value="healthy">Sana</option><option value="diseased">Con sintomi</option><option value="dead">Morta</option><option value="harvested">Raccolta</option><option value="transplanted">Trapiantata</option></select></label>
        <label>Valutazione salute osservata (0–100) *<input required name="healthScore" type="number" min="0" max="100" step="1" className={field} /></label>
        <label className="sm:col-span-2">Note<textarea name="notes" rows={3} maxLength={2000} className={field} /></label>
      </fieldset>
      <div className="flex justify-end gap-3"><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border px-4 py-2">Annulla</button><button disabled={busy || loading || loadFailed || saved} className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Salvataggio…' : 'Salva pianta'}</button></div>
    </form>
  </NativeDialog>
}
