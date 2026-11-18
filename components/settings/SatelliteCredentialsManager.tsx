'use client'

import { useCallback, useEffect, useState } from 'react'
import { Satellite, RefreshCw } from 'lucide-react'
import Link from 'next/link'

type Configuration = { configured: boolean; clientIdPresent: boolean; clientSecretPresent: boolean }

export default function SatelliteCredentialsManager() {
  const [config, setConfig] = useState<Configuration | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkedAt, setCheckedAt] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/ndvi/config-status', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(response.status === 403 ? 'Questa configurazione è riservata agli amministratori.' : 'Impossibile leggere la configurazione satellitare.')
      if (typeof data.configured !== 'boolean' || typeof data.clientIdPresent !== 'boolean' || typeof data.clientSecretPresent !== 'boolean') throw new Error('Risposta di configurazione non valida.')
      setConfig(data)
    } catch (cause) { setConfig(null); setError(cause instanceof Error ? cause.message : 'Caricamento non riuscito.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function testConnection() {
    setBusy(true); setError(''); setCheckedAt('')
    try {
      const response = await fetch('/api/ndvi/test-connection', { method: 'POST' })
      const data = await response.json()
      if (!response.ok || data.success !== true || data.status !== 'connected' || typeof data.checkedAt !== 'string' || !Number.isFinite(Date.parse(data.checkedAt))) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Il servizio non ha confermato la connessione.')
      }
      setCheckedAt(data.checkedAt)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Test non riuscito.') }
    finally { setBusy(false) }
  }
  return <section className="space-y-5" aria-labelledby="satellite-title">
    <h2 id="satellite-title" className="flex items-center gap-2 text-xl font-semibold"><Satellite aria-hidden="true" /> Configurazione satellitare</h2>
    <p className="text-gray-700">Verifica la connessione dell’app al servizio Copernicus e consulta i dati dei tuoi appezzamenti.</p>
    {loading && <p role="status">Caricamento configurazione…</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    {config && <dl className="grid gap-3 rounded-xl border bg-gray-50 p-4 sm:grid-cols-2">
      <div><dt className="font-medium">Client ID</dt><dd>{config.clientIdPresent ? 'Configurato' : 'Da configurare'}</dd></div>
      <div><dt className="font-medium">Client Secret</dt><dd>{config.clientSecretPresent ? 'Configurato' : 'Da configurare'}</dd></div>
    </dl>}
    {checkedAt && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-900">Connessione verificata il {new Date(checkedAt).toLocaleString('it-IT')}. Apri NDVI per acquisire le osservazioni del terreno selezionato.</p>}
    <div className="flex flex-wrap gap-3">
      <button onClick={testConnection} disabled={busy || loading || !config?.configured} className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50"><RefreshCw size={18} aria-hidden="true" className={busy ? 'animate-spin' : ''} />{busy ? 'Verifica in corso…' : 'Verifica connessione'}</button>
      <button onClick={load} disabled={busy || loading} className="rounded-lg border border-gray-400 px-4 py-2">Aggiorna stato</button>
      <Link href="/app/ndvi" className="rounded-lg border border-gray-400 px-4 py-2 text-green-800">Apri NDVI</Link>
    </div>
    <details className="rounded-xl border p-4"><summary className="cursor-pointer font-medium">Configurazione per l’amministratore</summary><div className="mt-3 space-y-3 text-sm text-gray-700">
      <p>Le credenziali sono gestite nei segreti della piattaforma che ospita OrtoMio. Il browser mostra soltanto la loro presenza.</p>
      <ol className="list-decimal space-y-2 pl-5"><li>Crea un client OAuth nell’account Copernicus autorizzato.</li><li>Configura <code>SH_CLIENT_ID</code> e <code>SH_CLIENT_SECRET</code> nei segreti del server e applica la configurazione al servizio.</li><li>Premi Aggiorna stato e Verifica connessione.</li><li>Apri NDVI, seleziona il terreno e controlla data e qualità delle osservazioni.</li></ol>
      <a href="https://shapps.dataspace.copernicus.eu/" target="_blank" rel="noopener noreferrer" className="inline-block text-green-800 underline">Apri la console Copernicus</a>
    </div></details>
  </section>
}
