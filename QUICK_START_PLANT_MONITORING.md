# 🚀 QUICK START - Sistema Monitoraggio Piante

## ⚡ INTEGRAZIONE RAPIDA (5 MINUTI)

### Step 1: Applicare Migration Database
```bash
# Locale
supabase migration up

# Oppure copia/incolla SQL da:
# supabase/migrations/20260116030000_create_plant_monitoring_system.sql
# nel Supabase Dashboard → SQL Editor
```

### Step 2: Integrare UI in PlantLifecycleManager

Apri `components/plants/PlantLifecycleManager.tsx` e aggiungi:

```typescript
// 1. Import componenti (in alto)
import PlantPhotoTimeline from './PlantPhotoTimeline'
import MaturityTracker from './MaturityTracker'
import BrixTracker from './BrixTracker'
import TreatmentTracker from './TreatmentTracker'

// 2. Aggiungi tab nella navigation (riga ~250)
const tabs = [
  { id: 'overview', label: 'Panoramica', icon: Activity },
  { id: 'operations', label: `Operazioni (${operations.length})`, icon: FileText },
  { id: 'photos', label: 'Foto', icon: Camera },        // NUOVO
  { id: 'maturity', label: 'Maturazione', icon: Target }, // NUOVO
  { id: 'brix', label: 'Brix', icon: Droplet },         // NUOVO
  { id: 'treatments', label: 'Cure', icon: Bug },       // NUOVO
  { id: 'schedule', label: 'Programmazione', icon: Calendar },
  { id: 'analytics', label: 'Analisi', icon: BarChart3 },
  { id: 'settings', label: 'Impostazioni', icon: Settings }
]

// 3. Aggiungi rendering tab (dopo operations tab, riga ~700)
{activeTab === 'photos' && (
  <PlantPhotoTimeline
    plantId={plant.id}
    gardenId={plant.gardenId}
    onPhotoUploaded={() => {
      // Ricarica dati se necessario
      console.log('Foto caricata!')
    }}
  />
)}

{activeTab === 'maturity' && (
  <MaturityTracker
    plantId={plant.id}
    gardenId={plant.gardenId}
    plantName={plant.plantName}
  />
)}

{activeTab === 'brix' && (
  <BrixTracker
    plantId={plant.id}
    gardenId={plant.gardenId}
    plantName={plant.plantName}
  />
)}

{activeTab === 'treatments' && (
  <TreatmentTracker
    plantId={plant.id}
    gardenId={plant.gardenId}
    plantName={plant.plantName}
  />
)}
```

### Step 3: Test!
```bash
npm run dev
# Vai su http://localhost:3000/app/plants
# Seleziona una pianta
# Prova i nuovi tab!
```

---

## 📸 TEST RAPIDO FUNZIONALITÀ

### Test 1: Upload Foto
1. Tab "Foto"
2. Click "Aggiungi Foto"
3. Seleziona immagine
4. Scegli tipo: "Generale"
5. Aggiungi nota: "Prima foto test"
6. Click "Carica Foto"
7. ✅ Foto appare in timeline

### Test 2: Maturazione
1. Tab "Maturazione"
2. Click "Registra Stato"
3. Seleziona stadio: "Immature"
4. Slider percentuale: 50%
5. Cambio colore: 30%
6. Consistenza: "Firm"
7. Click "Salva Stato"
8. ✅ Vedi stato corrente con barra progresso

### Test 3: Brix
1. Tab "Brix"
2. Click "Nuova Misurazione"
3. Inserisci valore: 12.5
4. Metodo: "Rifrattometro"
5. Posizione: "Medio"
6. Frutto: 1
7. Click "Salva Misurazione"
8. ✅ Vedi valore con valutazione qualità

### Test 4: Trattamento
1. Tab "Cure"
2. Click "Nuovo Trattamento"
3. Carica foto before
4. Problema: "Carenza Azoto"
5. Gravità: "Media"
6. Prodotto: "Concime NPK"
7. Dosaggio: 30g
8. Click "Inizia Tracking"
9. ✅ Trattamento appare in lista attivi

---

## 🔧 CONFIGURAZIONE STORAGE (Opzionale)

Per upload foto reale su Supabase Storage:

```typescript
// In services/plantMonitoringService.ts
// Sostituire uploadPhoto() con:

async uploadPhoto(request: PhotoUploadRequest): Promise<PlantPhoto> {
  const photoId = crypto.randomUUID()
  const fileName = `${request.gardenId}/${request.plantId}/${photoId}.jpg`
  
  // Upload a Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('plant-photos')
    .upload(fileName, request.file)
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(fileName)
  
  const photo: PlantPhoto = {
    id: photoId,
    plantId: request.plantId,
    gardenId: request.gardenId,
    url: publicUrl,
    capturedAt: new Date().toISOString(),
    uploadedAt: new Date().toISOString(),
    photoType: request.photoType,
    linkedOperationId: request.linkedOperationId,
    isBeforePhoto: request.isBeforePhoto,
    notes: request.notes,
    tags: request.tags,
    photos: []
  }
  
  // Salva in database
  const { error: dbError } = await supabase
    .from('plant_photos')
    .insert({
      id: photo.id,
      plant_id: photo.plantId,
      garden_id: photo.gardenId,
      url: photo.url,
      captured_at: photo.capturedAt,
      uploaded_at: photo.uploadedAt,
      photo_type: photo.photoType,
      linked_operation_id: photo.linkedOperationId,
      is_before_photo: photo.isBeforePhoto,
      notes: photo.notes,
      tags: photo.tags
    })
  
  if (dbError) throw dbError
  
  return photo
}
```

---

## 🤖 INTEGRAZIONE AI (Opzionale)

### OpenAI Vision per Analisi Foto

```typescript
// In services/plantMonitoringService.ts
// Sostituire analyzePhoto() con:

async analyzePhoto(request: AIPhotoAnalysisRequest): Promise<PlantPhoto['aiAnalysis']> {
  const photo = await this.getPhotoById(request.photoId)
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { 
          type: "text", 
          text: `Analizza questa pianta e fornisci:
          1. Health score (0-100)
          2. Problemi rilevati (malattie, parassiti, carenze)
          3. Raccomandazioni specifiche
          Rispondi in formato JSON.` 
        },
        { 
          type: "image_url", 
          image_url: { url: photo.url } 
        }
      ]
    }],
    max_tokens: 500
  })
  
  const result = JSON.parse(response.choices[0].message.content)
  
  return {
    healthScore: result.healthScore,
    detectedIssues: result.issues || [],
    confidence: 0.85,
    recommendations: result.recommendations || [],
    analyzedAt: new Date().toISOString()
  }
}
```

### Setup OpenAI
```bash
npm install openai
```

```typescript
// In services/plantMonitoringService.ts (top)
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
```

```bash
# In .env.local
OPENAI_API_KEY=sk-...
```

---

## 📱 MOBILE OPTIMIZATION

Tutti i componenti sono già mobile-friendly con:
- Touch targets ≥ 44px
- Responsive grid (2 col mobile, 4 col desktop)
- Modal fullscreen su mobile
- Slider touch-friendly
- Upload foto da camera mobile

Test su mobile:
```bash
# Esponi server su rete locale
npm run dev -- --host

# Accedi da smartphone
http://192.168.1.X:3000/app/plants
```

---

## 🐛 TROUBLESHOOTING

### Foto non si caricano
- Verifica bucket "plant-photos" esiste in Supabase Storage
- Verifica RLS policies su storage bucket
- Check console browser per errori

### Migration fallisce
- Verifica tabella `garden_plants` esiste
- Verifica tabella `plant_operations` esiste
- Applica migrations precedenti prima

### Componenti non appaiono
- Verifica import corretti in PlantLifecycleManager
- Check console per errori TypeScript
- Verifica plant.id e garden.id sono validi

---

## 📚 DOCUMENTAZIONE COMPLETA

Per dettagli completi vedi:
- `PLANT_MONITORING_SYSTEM_COMPLETE.md` - Documentazione tecnica
- `SESSION_SUMMARY_JAN16_PLANT_MONITORING.md` - Riepilogo sessione
- `docs/manual/21-individual-plants.md` - Manuale utente

---

## ✅ CHECKLIST INTEGRAZIONE

- [ ] Migration database applicata
- [ ] Import componenti in PlantLifecycleManager
- [ ] Tab aggiunti in navigation
- [ ] Rendering tab implementato
- [ ] Test upload foto
- [ ] Test tracking maturazione
- [ ] Test misurazione Brix
- [ ] Test tracking trattamenti
- [ ] Test mobile
- [ ] (Opzionale) Storage Supabase configurato
- [ ] (Opzionale) AI integrata

---

**Tempo stimato integrazione base: 5-10 minuti** ⚡

**Con Storage e AI: 30-60 minuti** 🚀

---

*Quick Start Guide - Sistema Monitoraggio Piante*  
*16 Gennaio 2026*
