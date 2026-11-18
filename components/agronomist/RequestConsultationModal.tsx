'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import NativeDialog from '@/components/shared/NativeDialog'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { useAuth } from '@/packages/core/hooks/useAuth'
import type { Agronomist } from '@/types/agronomist'

const statusLabels: Record<string, string> = { scheduled: 'In attesa di invio', processing: 'Invio in corso', sent: 'Accettata dal servizio email', delivered: 'Email consegnata', failed: 'Invio da riprovare automaticamente', dead_letter: 'Invio non riuscito', suppressed: 'Invio annullato' }
type RequestEntry = { id: string; subject: string; status: string; created_at: string; last_error?: string }
export default function RequestConsultationModal({ gardenId, topic, description, onClose }: { gardenId: string; topic: string; description: string; onClose: () => void }) {
  const { storageProvider } = useStorage()
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Agronomist[]>([])
  const [requests, setRequests] = useState<RequestEntry[]>([])
  const [contactId, setContactId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [reload, setReload] = useState(0)
  const requestId = useRef<string | null>(null)
  async function history() {
    const response = await fetch(`/api/agronomist/requests?${new URLSearchParams({ gardenId })}`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok || !Array.isArray(data.requests)) throw new Error(data.error || 'Storico non disponibile.')
    return data.requests as RequestEntry[]
  }
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    async function load() {
      try {
        if (!user || !storageProvider.getAgronomists) throw new Error('Accedi per caricare i tuoi contatti.')
        const [items, recent] = await Promise.all([storageProvider.getAgronomists(user.id), history()])
        if (active) { setContacts(items); setRequests(recent) }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'Caricamento non riuscito.') }
      finally { if (active) setLoading(false) }
    }
    void load()
    return () => { active = false }
    // garden and identity define the request scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gardenId, user?.id, storageProvider, reload])

  async function addContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return
    const data = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      if (!user || !storageProvider.createAgronomist) throw new Error('Archivio contatti non disponibile.')
      const saved = await storageProvider.createAgronomist({ userId: user.id, name: String(data.get('name')).trim(), email: String(data.get('email')).trim(), preferredContactMethod: 'Email', consultationFrequency: 'OnDemand' })
      setContacts(items => [...items, saved]); setContactId(saved.id)
      setMessage('Contatto salvato. Ora completa la richiesta qui sotto.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Contatto non salvato.') }
    finally { setBusy(false) }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || submitted) return
    const data = new FormData(event.currentTarget)
    setBusy(true); setError(''); setMessage('')
    requestId.current ??= crypto.randomUUID()
    try {
      const response = await fetch('/api/agronomist/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: requestId.current, gardenId, agronomistId: contactId, topic: String(data.get('topic')), notes: String(data.get('notes')), urgency: String(data.get('urgency')) }) })
      const result = await response.json()
      if (!response.ok || typeof result.status !== 'string' || !result.id) throw new Error(result.error || 'Esito non disponibile: aggiorna lo storico prima di riprovare.')
      setSubmitted(true); setMessage(`Richiesta registrata. ${statusLabels[result.status] || result.status}.`)
      setRequests(await history())
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Invio non riuscito. Aggiorna lo storico prima di riprovare.') }
    finally { setBusy(false) }
  }
  const field = 'mt-1 block w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-900'
  return <NativeDialog titleId="request-consultation-title" onClose={onClose} busy={busy}>
    <div className="flex items-start justify-between gap-3"><h2 id="request-consultation-title" className="text-xl font-semibold">Richiedi un consulto</h2><button type="button" disabled={busy} onClick={onClose} className="rounded-lg border px-3 py-2">Chiudi</button></div>
    <p className="my-3 text-sm text-gray-600">Scegli il tuo agronomo. La richiesta viene inviata via email con il tuo indirizzo per la risposta. Disponibilità, compenso e tempi si concordano direttamente con il professionista.</p>
    {error && <p role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
    {message && <p role="status" className="my-3 rounded-lg bg-green-50 p-3 text-green-900">{message}</p>}
    {loading ? <p role="status">Caricamento contatti e richieste…</p> : <>
      <details className="my-4 rounded-lg border p-3"><summary>Aggiungi un agronomo ai contatti</summary><form onSubmit={addContact} className="mt-3 space-y-3"><fieldset disabled={busy || submitted} className="space-y-3"><label className="block">Nome del professionista<input name="name" required maxLength={150} className={field} /></label><label className="block">Email del professionista<input name="email" type="email" required maxLength={254} className={field} /></label><button className="rounded-lg border px-4 py-2">Salva contatto</button></fieldset></form></details>
      <form onSubmit={submit} className="space-y-4"><fieldset disabled={busy || submitted} className="space-y-4">
        <label className="block">Invia a<select required value={contactId} onChange={event => setContactId(event.target.value)} className={field}><option value="">Seleziona un agronomo</option>{contacts.filter(item => item.email).map(item => <option key={item.id} value={item.id}>{item.name} — {item.email}</option>)}</select></label>
        <label className="block">Oggetto<input name="topic" required minLength={3} maxLength={200} defaultValue={topic.slice(0, 200)} className={field} /></label>
        <label className="block">Priorità richiesta<select name="urgency" className={field}><option value="standard">Standard</option><option value="urgent">Urgente</option></select></label>
        <label className="block">Problema, sintomi e interventi già eseguiti<textarea name="notes" required minLength={10} maxLength={4000} rows={5} defaultValue={description} className={field} /></label>
        <button disabled={!contactId} className="rounded-lg bg-purple-700 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Invio…' : 'Invia richiesta via email'}</button>
      </fieldset></form>
      <section className="mt-6 border-t pt-4"><h3 className="font-semibold">Ultime richieste per questo terreno</h3><button disabled={busy} className="my-2 underline" onClick={() => setReload(value => value + 1)}>Aggiorna stato</button>{requests.length ? <ul className="space-y-2">{requests.map(item => <li key={item.id} className="rounded-lg bg-gray-50 p-3"><strong>{item.subject}</strong><p className="text-sm">{new Date(item.created_at).toLocaleString('it-IT')} · {statusLabels[item.status] || item.status}</p>{item.last_error && <p className="text-sm text-red-800">{item.last_error}</p>}</li>)}</ul> : <p>Nessuna richiesta registrata.</p>}</section>
    </>}
  </NativeDialog>
}
