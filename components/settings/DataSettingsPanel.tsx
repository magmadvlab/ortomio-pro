'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/config/supabase'
import { accountClosureRequest, readUserSettings, saveAccountClosureRequest, type AccountClosureRequest } from '@/services/userSettingsService'

export default function DataSettingsPanel() {
  const [request, setRequest] = useState<AccountClosureRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    const client = getSupabaseClient()
    if (!client) { setError('Connessione all’account non disponibile.'); setLoading(false); return }
    void readUserSettings(client).then(settings => { if (active) setRequest(accountClosureRequest(settings)) }).catch(() => { if (active) setError('Impossibile caricare lo stato. Riprova.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retry])
  async function save(value: boolean) {
    if (busy || (value && !confirmed)) return
    setBusy(true); setError('')
    try {
      const client = getSupabaseClient()
      if (!client) throw new Error('Accedi nuovamente.')
      setRequest(await saveAccountClosureRequest(client, value)); setConfirmed(false)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Operazione non riuscita.') }
    finally { setBusy(false) }
  }
  return <section className="space-y-6"><h2 className="text-lg font-semibold">Gestione dati</h2>
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4"><h3 className="font-medium text-blue-900">Esporta i tuoi registri</h3><p className="my-3 text-sm text-blue-800">Scegli terreno, registro e periodo. Scarica attività, diario, trattamenti e dossier disponibili in CSV o PDF.</p><Link className="inline-block rounded-lg bg-blue-700 px-4 py-2 text-white" href="/app/export">Apri esportazione dati</Link></div>
    <div className="rounded-lg border border-red-200 p-4"><h3 className="font-medium">Chiusura account e cancellazione dati</h3><p className="my-3 text-sm text-gray-600">La richiesta viene registrata nel tuo profilo e resa visibile all’amministratore, che verifica dati condivisi, organizzazioni e tempi di conservazione prima della cancellazione. Finché è in attesa puoi ritirarla.</p>
      {error && <p role="alert" className="my-3 text-red-800">{error} <button disabled={busy} className="underline" onClick={() => setRetry(value => value + 1)}>Ricarica stato</button></p>}
      {loading ? <p role="status">Caricamento stato…</p> : request?.status === 'requested' ? <><p role="status">Richiesta registrata il {new Date(request.requestedAt).toLocaleString('it-IT')}. In attesa di gestione amministrativa.</p><p className="my-2 break-all text-sm">Riferimento: {request.id}</p><button disabled={busy || Boolean(error)} className="rounded-lg border px-4 py-2" onClick={() => void save(false)}>Ritira richiesta</button></> : <><label className="my-4 flex items-start gap-3"><input type="checkbox" checked={confirmed} disabled={busy || Boolean(error)} onChange={event => setConfirmed(event.target.checked)} />Chiedo la chiusura del mio account e la cancellazione dei dati secondo le condizioni di conservazione applicabili.</label><button disabled={!confirmed || busy || Boolean(error)} onClick={() => void save(true)} className="rounded-lg bg-red-700 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Registrazione…' : 'Registra richiesta di chiusura'}</button>{request?.status === 'withdrawn' && <p role="status" className="mt-3">La richiesta precedente è stata ritirata.</p>}</>}
    </div>
  </section>
}
