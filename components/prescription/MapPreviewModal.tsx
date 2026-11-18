'use client'

import { useState } from 'react'
import type { PrescriptionMap } from '@/types/prescriptionMaps'
import { prescriptionPreview } from '@/lib/prescription/preview'
import NativeDialog from '@/components/shared/NativeDialog'

const COLORS = ['#166534', '#0369a1', '#a16207', '#7e22ce', '#be123c', '#0f766e']
export default function MapPreviewModal({ map, onClose }: { map: PrescriptionMap; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const preview = prescriptionPreview(map.zones)
  const sourceLabels: Record<string, string> = { ndviData: 'NDVI', plantLevelData: 'Piante', rowLevelData: 'Filari', soilData: 'Suolo', weatherData: 'Meteo' }
  const sources = Object.entries(map.dataSources ?? {}).filter(([, used]) => used).map(([key]) => sourceLabels[key] || key)
  const qualities = { measured: 'Misurati', mixed: 'Misure e stime', estimated: 'Stimati', insufficient: 'Dati insufficienti' }
  return <NativeDialog titleId="map-preview-title" onClose={onClose}>
    <div className="flex items-start justify-between gap-4"><div><h2 id="map-preview-title" className="text-xl font-semibold">Anteprima: {map.name}</h2><p className="mt-1 text-sm text-gray-600">{map.gardenName} · Revisione {map.versionNumber ?? 1} · {map.zones.length} zone</p></div><button autoFocus onClick={onClose} className="rounded-lg border px-3 py-2">Chiudi</button></div>
    {preview.paths.length > 0 ? <svg viewBox="0 0 400 400" role="img" aria-label={`Geometrie delle zone di ${map.name}, Nord in alto`} className="my-5 max-h-96 w-full rounded-lg border bg-gray-50">
      <text x="380" y="16" fontSize="10" textAnchor="middle">N ↑</text>
      {preview.paths.map((zone, index) => <path key={zone.id} d={zone.path} fill={COLORS[index % COLORS.length]} fillRule="evenodd" fillOpacity={selected && selected !== zone.id ? 0.25 : 0.65} stroke={selected === zone.id ? '#111827' : '#fff'} strokeWidth={selected === zone.id ? 3 : 1}><title>{map.zones.find(item => item.id === zone.id)?.zoneName}</title></path>)}
    </svg> : <p role="alert" className="my-4 rounded-lg bg-amber-50 p-4 text-amber-900">La mappa non contiene geometrie valide da visualizzare. Controlla le coordinate delle zone.</p>}
    {preview.invalidCount > 0 && preview.paths.length > 0 && <p role="alert" className="text-amber-900">{preview.invalidCount} zone hanno coordinate non valide e non sono disegnate.</p>}
    <dl className="grid gap-2 text-sm sm:grid-cols-2"><div><dt className="font-semibold">Fonti della revisione</dt><dd>{sources.join(', ') || 'Non indicate'}</dd></div><div><dt className="font-semibold">Origine dei dati</dt><dd>{map.algorithmMetadata ? qualities[map.algorithmMetadata.sourceQuality] : 'Non indicata'}</dd></div><div><dt className="font-semibold">Periodo delle fonti</dt><dd>{map.dataSourcePeriod?.startDate && map.dataSourcePeriod?.endDate ? `${map.dataSourcePeriod.startDate} – ${map.dataSourcePeriod.endDate}` : 'Non indicato'}</dd></div><div><dt className="font-semibold">Completezza dei dati</dt><dd>{Number.isFinite(map.dataCompleteness) ? `${map.dataCompleteness}%` : 'Non indicata'}</dd></div></dl>
    {map.validationErrors?.length ? <ul className="my-3 list-disc pl-5 text-sm text-amber-900">{map.validationErrors.map((message, index) => <li key={index}>{message}</li>)}</ul> : null}
    <p className="my-3 text-sm text-gray-600">Seleziona una zona nella tabella per evidenziarla. Le quantità e le geometrie provengono dalla revisione salvata.</p>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col" className="p-2">Zona</th><th scope="col" className="p-2">Area (m²)</th><th scope="col" className="p-2">Dose</th><th scope="col" className="p-2">Prodotto</th></tr></thead><tbody>{map.zones.map(zone => <tr key={zone.id} className={selected === zone.id ? 'bg-green-50' : ''}>
      <td className="border-t p-2"><span aria-hidden="true" className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: preview.paths.some(path => path.id === zone.id) ? COLORS[preview.paths.findIndex(path => path.id === zone.id) % COLORS.length] : '#6b7280' }} /><button aria-pressed={selected === zone.id} onClick={() => setSelected(selected === zone.id ? null : zone.id)} className="rounded text-green-800 underline">{zone.zoneName || `Zona ${zone.zoneNumber}`}</button></td>
      <td className="border-t p-2">{Number.isFinite(zone.areaSqm) ? zone.areaSqm.toLocaleString('it-IT') : 'Non indicata'}</td><td className="border-t p-2">{Number.isFinite(zone.prescription?.applicationRate) ? `${zone.prescription.applicationRate.toLocaleString('it-IT')} ${zone.prescription.unit}` : 'Non indicata'}</td><td className="border-t p-2">{zone.prescription?.productName || 'Non indicato'}</td>
    </tr>)}</tbody></table></div>
  </NativeDialog>
}
