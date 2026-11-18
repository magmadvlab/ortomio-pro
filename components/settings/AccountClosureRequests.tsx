'use client'
import { useEffect, useState } from 'react'
import type { AccountClosureRequest } from '@/services/userSettingsService'
type Entry = { userId: string; name: string; email?: string; request: AccountClosureRequest | null }
export default function AccountClosureRequests() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    void fetch(`/api/admin/account-closure-requests?offset=${offset}`, { cache: 'no-store' }).then(async response => {
      const data = await response.json()
      if (!response.ok || !Array.isArray(data.requests)) throw new Error(data.error || 'Richieste non disponibili.')
      if (active) { setEntries(data.requests); setTotal(data.total) }
    }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Caricamento non riuscito.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [offset, retry])
  return <section className="rounded-lg bg-white p-6 shadow"><h2 className="text-lg font-semibold">Richieste di chiusura account</h2><p className="my-3 text-sm text-gray-600">Contatta il richiedente, verifica organizzazioni e dati condivisi e applica la procedura di conservazione prima di cancellare l’account dal sistema di autenticazione.</p><button onClick={() => setRetry(value => value + 1)} disabled={loading} className="mb-3 underline">Aggiorna richieste</button>{error ? <p role="alert" className="text-red-800">{error}</p> : loading ? <p role="status">Caricamento…</p> : <><ul className="space-y-3">{entries.map(entry => <li key={entry.userId} className="rounded-lg border p-3"><p className="font-medium">{entry.name || entry.userId} — {entry.email}</p><p className="break-all text-sm">Account: {entry.userId}</p>{entry.request && <p className="break-all text-sm">Richiesta {entry.request.id} · {new Date(entry.request.requestedAt).toLocaleString('it-IT')}</p>}</li>)}</ul>{total === 0 && <p>Nessuna richiesta in attesa.</p>}<div className="mt-3 flex gap-4"><button disabled={offset === 0} onClick={() => setOffset(value => Math.max(0, value - 50))}>Precedenti</button><span>{total} richieste</span><button disabled={offset + 50 >= total} onClick={() => setOffset(value => value + 50)}>Successive</button></div></>}</section>
}
