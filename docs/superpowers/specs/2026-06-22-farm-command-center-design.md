# Farm Command Center — Design Spec

## Contesto

Ortomio Pro si rivolge ad aziende agricole strutturate (10-50+ appezzamenti, team multi-persona) che hanno bisogno di decisioni in tempo reale e una vista aggregata di tutti i campi. Il Farm Command Center è il sotto-progetto 1 di 4 nella roadmap di potenziamento della piattaforma.

**Sotto-progetti successivi (fuori scope qui):**
- Operations & Team Management (ordini di lavoro, operatori)
- Agronomic Intelligence pluriennale (rotazioni, benchmarking)
- Agronomo Collaborator (portale consulente)

---

## Obiettivo

Fornire una schermata "cockpit" che mostri lo stato aggregato di tutti gli appezzamenti dell'azienda in un colpo d'occhio, con alert prioritizzati per urgenza e CTA contestuali per agire immediatamente.

---

## Architettura

### Flusso dati

```
OpenMeteo API  ─┐
                ├──▶  compute-field-alerts (Edge Function)  ──▶  field_alerts (Supabase)  ──▶  FarmCommandCenter (React)
Supabase DB    ─┘
```

**Strategia cache:** L'Edge Function scrive i risultati in `field_alerts` con `expires_at = now() + 30min`. Il client chiama la funzione al caricamento; se esiste un record non scaduto per quel `garden_id`, la funzione ritorna la cache senza ricalcolare. Il client mantiene anche una cache in-memory a 5 minuti per evitare chiamate ripetute durante la navigazione.

### Nuovi file

| File | Responsabilità |
|------|---------------|
| `components/farm/FarmCommandCenter.tsx` | Componente radice, carica alert, gestisce refresh |
| `components/farm/FieldMapPanel.tsx` | Mappa SVG degli appezzamenti colorata per stato |
| `components/farm/AlertPriorityList.tsx` | Lista alert ordinata per severity con CTA |
| `components/farm/WeatherStrip.tsx` | Barra meteo superiore (OpenMeteo forecast) |
| `services/fieldAlertService.ts` | Client service con cache in-memory |
| `app/api/field-alerts/route.ts` | Route Next.js proxy verso Edge Function |
| `supabase/functions/compute-field-alerts/index.ts` | Edge Function — logica di calcolo alert |
| `types/fieldAlerts.ts` | Tipi TypeScript condivisi |

### File modificati

| File | Modifica |
|------|----------|
| `components/Dashboard.tsx` | Aggiunge link/tab alla nuova route `/farm` |
| `packages/core/storage/interface.ts` | Aggiunge `getFieldAlerts` / `upsertFieldAlerts` |
| `packages/storage-cloud/SupabaseStorageProvider.ts` | Implementa i due nuovi metodi |
| `supabase/migrations/` | Nuova migrazione per `field_alerts` |

---

## Field State Model

Lo stato di ogni appezzamento è determinato dall'alert più grave attivo tra le 5 categorie:

### Categorie e soglie

| Categoria | Icona | Giallo (warning) | Rosso (critical) |
|-----------|-------|-----------------|-----------------|
| **water** | 💧 | Deficit > 10mm negli ultimi 7gg | Deficit > 25mm oppure 0 irrigazioni in 5gg |
| **treatment** | 🧪 | Trattamento in scadenza entro 2gg | Trattamento scaduto da > 1gg |
| **heat** | 🌡 | T > soglia coltura per 2gg consecutivi | T > soglia + 5°C oppure gelata prevista |
| **disease** | 🍄 | Indice infettivo (modello Mills) > 0.4 | Indice infettivo > 0.7 |
| **harvest** | 📅 | Finestra di raccolta entro 7 giorni | Finestra di raccolta aperta senza azione registrata |

**Regola colore appezzamento:** se esiste almeno un alert `critical` → rosso; altrimenti se esiste almeno un `warning` → giallo; altrimenti verde.

**Ordinamento lista alert:** (1) numero di critici DESC, (2) numero di gialli DESC, (3) nome appezzamento ASC.

### Tipo TypeScript

```ts
type AlertSeverity = 'ok' | 'warning' | 'critical'
type AlertCategory = 'water' | 'treatment' | 'heat' | 'disease' | 'harvest'

interface FieldAlert {
  id: string
  gardenId: string
  category: AlertCategory
  severity: AlertSeverity
  message: string           // testo leggibile, es. "Fungicida scaduto da 2 giorni"
  computedAt: string        // ISO timestamp
  expiresAt: string         // computedAt + 30min
  meta?: Record<string, unknown>  // dati grezzi per debug/AI
}
```

---

## Componenti UI

### Layout

Layout ibrido (tre zone):

```
┌─────────────────────────────────────────────────────────┐
│  WeatherStrip: 🌤 25°C · 💨 12km/h · 💧 8%  [2 critici] [1 attenzione] │
├─────────────────────────┬───────────────────────────────┤
│                         │  Priorità oggi                │
│   FieldMapPanel         │  🚨 Vigna Nord · Tratt. scad. │
│   (mappa SVG colorata)  │  🚨 Vigneto Sud · Oidio       │
│                         │  ⚠  Oliveto · Irrigazione     │
│                         │  ✓  Grano Est, Mais — OK      │
├─────────────────────────┴───────────────────────────────┤
│  Aggiornato: 08:14 · prossimo: 08:44  [↻ Aggiorna ora]  │
└─────────────────────────────────────────────────────────┘
```

### WeatherStrip

- **Props:** `gardenCoords: { lat: number; lon: number }`, `date: Date`
- **Dati:** OpenMeteo `/forecast` — temperatura max/min, velocità vento, probabilità pioggia, ore sole
- **Badge:** conteggio alert critici e warning in coda a destra

### FieldMapPanel

- **Props:** `gardens: Garden[]`, `alerts: FieldAlert[]`
- Il tipo `Garden` non ha dati di poligono GIS — la mappa è una **griglia schematica**: ogni appezzamento è un rettangolo colorato con nome e icona coltura, ordinati per nome
- Colore fill determinato da `computeFieldColor(gardenId, alerts)`
- Click su rettangolo → `onFieldSelect(gardenId)` → scroll ad `AlertPriorityList`
- `Garden.coordinates` (lat/lon) è usato solo dalla Edge Function per OpenMeteo, non per la visualizzazione geografica
- Legenda colori in fondo al pannello

### AlertPriorityList

- **Props:** `alerts: FieldAlert[]`, `onFieldSelect: (gardenId: string) => void`
- Lista ordinata per severity (critici prima)
- Ogni card mostra: nome appezzamento, icona categoria, messaggio, CTA contestuale
- CTA per categoria:
  - `treatment` → "Registra intervento →" (link a form trattamento esistente)
  - `disease` → "Vedi prescrizione AI →" (link a Director service)
  - `water` → "Pianifica irrigazione →"
  - `heat` / `harvest` → nessuna CTA (solo informativo)
- Appezzamenti OK raggruppati in un'unica riga collassata

### FarmCommandCenter

- **Route:** `/app/farm` (nuova pagina Next.js)
- Carica alert via `fieldAlertService.getFieldAlerts(gardenId)` all'avvio
- Mostra skeleton loading durante il fetch
- Pulsante "Aggiorna ora" bypassa la cache e ri-chiama la Edge Function
- Countdown al prossimo ricalcolo (basato su `expiresAt` del record più recente)

---

## Edge Function — `compute-field-alerts`

### Interfaccia

```
POST /functions/v1/compute-field-alerts
Body: { gardenId: string }
Response: FieldAlert[]
```

### Logica interna

```
1. Leggi garden + coordinate da Supabase
2. Controlla se esiste record field_alerts non scaduto per gardenId → ritorna cache
3. Fetch meteo 7gg da OpenMeteo (lat/lon del garden)
4. Leggi trattamenti, irrigazioni, raccolti da Supabase per il garden
5. Esegui 5 checker puri (uno per categoria) → FieldAlert[]
6. DELETE vecchi alert per gardenId + INSERT nuovi con expires_at = now() + 30min
7. Ritorna alert al client
```

### Checker puri (pure functions, testabili in isolamento)

```ts
checkWaterAlert(irrigations: WateringLog[], weather: WeatherData): FieldAlert
checkTreatmentAlert(treatments: TreatmentLog[], today: Date): FieldAlert
checkHeatAlert(weather: WeatherData, cropThresholds: Record<string, number>): FieldAlert
checkDiseaseAlert(weather: WeatherData): FieldAlert      // modello Mills semplificato
checkHarvestAlert(plants: PlantTracking[], today: Date): FieldAlert
```

---

## Schema DB

```sql
CREATE TABLE field_alerts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id    uuid NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  category     text NOT NULL CHECK (category IN ('water','treatment','heat','disease','harvest')),
  severity     text NOT NULL CHECK (severity IN ('ok','warning','critical')),
  message      text NOT NULL,
  computed_at  timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  meta         jsonb
);

CREATE INDEX ON field_alerts (garden_id, expires_at DESC);
```

---

## Strategia di test

### Unit — checker puri
Ogni checker è una pure function. Test con `node:test` (runner già usato nel progetto):
- Caso base: tutti i parametri nella norma → severity `ok`
- Soglia warning: parametro al limite → severity `warning`
- Soglia critica: parametro oltre limite → severity `critical`
- Edge case: dati mancanti → severity `ok` (fail-safe)

### Integration — Edge Function
Con `supabase functions serve` locale + DB seed:
- Prima chiamata → ricalcola e scrive in `field_alerts`
- Seconda chiamata entro 30min → ritorna cache (nessuna scrittura)
- Chiamata con `gardenId` inesistente → ritorna `[]` senza errore

### Component — React
Con alert mock:
- `FieldMapPanel` colora correttamente i poligoni per severity
- `AlertPriorityList` ordina critici prima dei warning
- Appezzamenti OK collassati in riga singola
- Click su poligono → scroll alla riga corrispondente in lista

---

## Error handling

- OpenMeteo non raggiungibile → skip checker `heat` e `disease`, ritorna alert `ok` con `meta.weatherUnavailable: true`
- Supabase non raggiungibile → Edge Function ritorna 503, client mostra banner "Dati non aggiornati"
- `expiresAt` nel passato + Edge Function irraggiungibile → mostra alert scaduti con badge "Cache scaduta"

---

## Fuori scope (sotto-progetti successivi)

- Push notification su alert critici → sotto-progetto 2 (Operations & Team)
- Assegnazione alert a operatori → sotto-progetto 2
- Confronto storico alert anno su anno → sotto-progetto 3
- Accesso agronomo consulente → sotto-progetto 4
- Integrazione hardware IoT reale → dopo sotto-progetto 2
