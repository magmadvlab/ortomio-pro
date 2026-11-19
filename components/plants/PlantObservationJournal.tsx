'use client'

import { useEffect, useState } from 'react'
import { CREDIT_COSTS } from '@/lib/credits'
import type { GardenPlant } from '@/types/individualPlant'
import { assessPlantImage, plantObservationContext, listPlantObservations, preparePlantJpeg, readPlantPhotoReport, savePlantObservation, savePlantReport, type PlantObservation } from '@/services/plantPhotoObservationService'

export default function PlantObservationJournal({ plant }: { plant: GardenPlant }) {
  const [photos,setPhotos] = useState<PlantObservation[]>([])
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const [hasMore,setHasMore] = useState(false)
  useEffect(() => {
    let active = true
    listPlantObservations(plant.gardenId,plant.id).then(rows => {
      if (active) { setPhotos(rows); setHasMore(rows.length === 10) }
    }).catch(() => { if (active) setMessage('Lettura dello storico non riuscita.') })
    return () => { active = false }
  },[plant.gardenId,plant.id])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setMessage('')
    try { await action() }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Operazione non riuscita.') }
    finally { setBusy(false) }
  }

  function addPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    void run(async () => {
      await savePlantObservation(plant.gardenId, plant.id, await preparePlantJpeg(file))
      const rows = await listPlantObservations(plant.gardenId, plant.id)
      setPhotos(rows)
      setHasMore(rows.length === 10)
      setMessage('Foto salvata nello storico.')
    })
  }

  return <section className="space-y-3 rounded-lg border p-4">
    <h3 className="font-semibold">Diario fotografico · {plant.plantCode}</h3>
    <label className="block">Aggiungi una foto
      <input type="file" accept="image/*" disabled={busy} className="block" onChange={addPhoto}/>
    </label>
    <label className="block">Scatta una foto
      <input type="file" accept="image/*" capture="environment" disabled={busy} className="block" onChange={addPhoto}/>
    </label>
    {Boolean(plant.photos?.length) && <details><summary>Foto già associate alla pianta</summary>
      {plant.photos.map((url,i) => <img key={i} loading="lazy" className="max-h-48" src={url} alt={`Foto precedente di ${plant.plantCode}`}/>)}
    </details>}
    {message && <p role="status">{message}</p>}
    {photos.map(photo => {
      const report = readPlantPhotoReport(photo.ai_analysis)
      return <article className="space-y-2 border-t pt-3" key={photo.id}>
        <time>{new Date(photo.captured_at).toLocaleString('it-IT')}</time>
        <img loading="lazy" className="max-h-56 rounded" src={photo.url} alt={`Pianta ${plant.plantCode}`}/>
        {report ? <>
          <p><strong>Segni visibili</strong> {report.observation}</p>
          {report.hypotheses.map((h,i) => <div key={i}><strong>{h.cause}</strong>
            <p>Verifica: {h.check}</p><p>Se confermata: {h.action}</p>
            {h.substance && <p>Sostanza da valutare: {h.substance}</p>}</div>)}
          <p>Controllo successivo: {report.followUp}</p>
        </> : photo.url.startsWith('data:image/') && <button type="button" disabled={busy}
          className="rounded border px-3 py-2" onClick={() => void run(async () => {
            const context = await plantObservationContext(plant.gardenId,plant.fieldRowId || undefined)
            const analysis = await assessPlantImage(photo.url,[plant.plantName, plant.variety].filter(Boolean).join(' · '),context)
            await savePlantReport(plant.gardenId,plant.id,photo.id,analysis)
            setPhotos(current => current.map(row => row.id === photo.id ? {...row,ai_analysis:analysis} : row))
          })}>Analizza con Gemini · {CREDIT_COSTS.advanced_analysis} crediti</button>}
      </article>
    })}
    {hasMore && <button type="button" disabled={busy} onClick={() => void run(async () => {
      const rows = await listPlantObservations(plant.gardenId,plant.id,photos.length)
      setPhotos(current => [...current,...rows]); setHasMore(rows.length === 10)
    })}>Foto precedenti</button>}
  </section>
}
