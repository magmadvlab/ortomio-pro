'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Calendar, Database, Download, FileText, Leaf, Package, ShieldCheck } from 'lucide-react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import type { Garden } from '@/types'

type ExportFormat = 'csv' | 'pdf'
type ExportDataset = 'garden' | 'tasks' | 'diary' | 'treatments' | 'certification_dossier'

const datasets: Array<{ id: ExportDataset; label: string; description: string; icon: typeof Calendar }> = [
  { id: 'garden', label: 'Orto', description: 'Configurazione minimizzata', icon: Package },
  { id: 'tasks', label: 'Attività', description: 'Task e operazioni', icon: Calendar },
  { id: 'diary', label: 'Diario', description: 'Registro giornaliero', icon: FileText },
  { id: 'treatments', label: 'Trattamenti', description: 'Registro fitosanitario', icon: Leaf },
  { id: 'certification_dossier', label: 'Dossier', description: 'Evidenze certificazione reali', icon: ShieldCheck },
]

export default function ExportPage() {
  const { storageProvider } = useStorage()
  const [gardens, setGardens] = useState<Garden[]>([])
  const [gardenId, setGardenId] = useState('')
  const [dataset, setDataset] = useState<ExportDataset>('tasks')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    storageProvider.getGardens().then(items => {
      setGardens(items)
      setGardenId(current => current || items[0]?.id || '')
    }).catch(error => console.error('Error loading gardens for export:', error)).finally(() => setLoading(false))
  }, [storageProvider])

  const startExport = () => {
    if (!gardenId) return
    const params = new URLSearchParams({ garden_id: gardenId, dataset })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    window.location.assign(`/api/export/${format}?${params.toString()}`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Caricamento export...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Download className="text-green-600" />Export autorizzato</h1>
          <p className="text-gray-600 mt-1">File server-side per un singolo orto, con schema, periodo, fonti, timezone, checksum e audit.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <section className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Orto autorizzato</label>
            <select value={gardenId} onChange={event => setGardenId(event.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {gardens.length === 0 && <option value="">Nessun orto disponibile</option>}
              {gardens.map(garden => <option key={garden.id} value={garden.id}>{garden.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-500">L'export multi-orto è disabilitato: ownership e audit vengono verificati per ogni garden.</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Dataset</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {datasets.map(item => <button key={item.id} onClick={() => setDataset(item.id)} className={`p-4 border-2 rounded-lg text-left ${dataset === item.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <item.icon className="mb-2 text-green-700" size={22} /><div className="font-medium">{item.label}</div><div className="text-xs text-gray-600">{item.description}</div>
              </button>)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">Dal<input type="date" value={from} onChange={event => setFrom(event.target.value)} className="mt-2 w-full px-3 py-2 border rounded-lg" /></label>
            <label className="text-sm font-medium text-gray-700">Al<input type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} className="mt-2 w-full px-3 py-2 border rounded-lg" /></label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setFormat('csv')} className={`p-4 border-2 rounded-lg ${format === 'csv' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}><Database className="mx-auto mb-2" />CSV stabile</button>
            <button onClick={() => setFormat('pdf')} className={`p-4 border-2 rounded-lg ${format === 'pdf' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}><BarChart3 className="mx-auto mb-2" />PDF paginato</button>
          </div>

          <div className="flex justify-end"><button disabled={!gardenId || Boolean(from && to && from > to)} onClick={startExport} className="bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2"><Download size={20} />Esporta {format.toUpperCase()}</button></div>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          Il dossier certificazioni esclude eventi e documenti demo/simulati. Ogni export è registrato con garden, utente, dataset, periodo, schema, fonti, numero record e SHA-256. Nessun file viene prodotto se l'audit non può essere persistito.
        </section>
      </main>
    </div>
  )
}
