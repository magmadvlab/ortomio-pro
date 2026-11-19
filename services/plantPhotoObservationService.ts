import { reportSchema, type PlantPhotoReport } from '@/types/plantPhotoReport'
export { readPlantPhotoReport } from '@/types/plantPhotoReport'
import { getSupabaseClient } from '@/config/supabase'
import { generatePhotoAnalysisContent } from './photoAnalysisService'

export type PlantObservation = { id: string; url: string; captured_at: string; ai_analysis: unknown }

function db() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Archivio foto non disponibile.')
  return client
}

export async function assessPlantImage(image: string, plantName: string, context = ''): Promise<PlantPhotoReport> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(image)
  if (!match) throw new Error('Formato foto non supportato.')
  const prompt = `Esamina i pixel della foto della coltura ${JSON.stringify(plantName)}. Contesto registrato: ${JSON.stringify(context)}.
Rispondi in italiano con JSON { "observation": "segni realmente visibili e limiti della foto", "hypotheses": [{"cause":"possibile causa","category":"nutrizione|acqua|fitosanitario|altro","check":"come distinguere la causa in campo","action":"intervento condizionato alla verifica","substance":"nutriente o principio attivo candidato oppure null"}], "followUp":"cosa osservare o fotografare di nuovo" }.
Includi maturity: not_visible se manca un organo raccoglibile ben visibile, developing se ancora in sviluppo, check_harvest se i segni visibili giustificano una verifica di raccolta per questa varietà. Descrivi cosa verificare sul posto, senza stimare zuccheri o consistenza dalla foto. Con ingiallimento distingui età delle foglie, nervature, distribuzione, umidità e cause alternative. Se la foto non è interpretabile usa hypotheses: []. Non attribuire infezioni o carenze con certezza da un solo colore. Per nutrizione indica il nutriente solo con evidenze compatibili e spiega come correggere una carenza confermata. Per parassiti o patogeni solo con segni specifici indica la classe e, se motivato per la specie e il bersaglio, un principio attivo candidato da verificare. Specifica che prima di trattare occorrono conferma del bersaglio e verifica del formulato autorizzato e della sua etichetta per coltura e impiego. Se manca evidenza lascia substance a null e proponi verifiche. Nessun marchio, dosaggio o dichiarazione di autorizzazione. Nessun prodotto per semplice stress idrico.`
  const text = await generatePhotoAnalysisContent(match[2], prompt, match[1])
  return reportSchema.parse(JSON.parse(text.trim().replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'')))
}

export async function listPlantObservations(gardenId: string, plantId: string, offset = 0) {
  const {data,error} = await db().from('plant_photos').select('id,url,captured_at,ai_analysis')
    .eq('garden_id',gardenId).eq('plant_id',plantId).order('captured_at',{ascending:false}).order('id').range(offset,offset+9)
  if (error) throw error
  return (data ?? []) as PlantObservation[]
}

export async function savePlantObservation(gardenId: string, plantId: string, jpeg: string) {
  const {error} = await db().from('plant_photos').insert({
    garden_id:gardenId, plant_id:plantId, url:jpeg, captured_at:new Date().toISOString(), photo_type:'health_issue',
  })
  if (error) throw error
}

export async function plantObservationContext(gardenId: string, rowId?: string) {
  const client = db()
  const soil = await client.from('gardens').select('soil_type,soil_ph').eq('id',gardenId).maybeSingle()
  const water = rowId ? await client.from('watering_logs').select('date,liters_applied')
    .eq('garden_id',gardenId).eq('field_row_id',rowId).eq('completed',true)
    .order('date',{ascending:false}).limit(3) : null
  return JSON.stringify({suolo_del_terreno:soil.data, ultime_irrigazioni_del_filare:water?.data ?? null})
}

export async function savePlantReport(gardenId: string, plantId: string, id: string, report: PlantPhotoReport) {
  const {error} = await db().from('plant_photos').update({ai_analysis:{...report, analyzedAt:new Date().toISOString()}})
    .eq('garden_id',gardenId).eq('plant_id',plantId).eq('id',id).select('id').single()
  if (error) throw error
}

export async function preparePlantJpeg(file: File) {
  const url = URL.createObjectURL(file)
  const bitmap = new Image()
  bitmap.src = url
  try {
    await bitmap.decode()
    const scale = Math.min(1, 1280 / Math.max(bitmap.width,bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1,Math.round(bitmap.width*scale))
    canvas.height = Math.max(1,Math.round(bitmap.height*scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Decodifica immagine non disponibile.')
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height)
    return canvas.toDataURL('image/jpeg',0.76)
  } finally { URL.revokeObjectURL(url) }
}
