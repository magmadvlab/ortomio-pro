# ORCHESTRATOR TARGET ARCHITECTURE (2026-03-09)

## Obiettivo architetturale
Portare il sistema a una regola unica:
- Ogni intervento e un evento orchestrato persistito.
- Ogni evento include snapshot contestuale completo (meteo, geo, altitudine, esposizione, ostacoli, fonte dati, qualita dato).
- Manuale e IOT condividono lo stesso pipeline dati.

## Principi
1. Single write path: una sola pipeline di persistenza per tutte le operazioni.
2. Context-first: nessuna operazione senza context snapshot valido.
3. Source-traceability: origine evento sempre esplicita (`manual`, `iot`, `orchestrator`).
4. Garden-anchored weather: meteo operativo sempre calcolato sulle coordinate del garden target.
5. Immutable event log + projection: registro eventi append-only, viste/materializzazioni per UI.

## Modello dati target (canonico)

### 1) `operation_events` (nuova tabella centrale)
Campi minimi raccomandati:
- `id UUID PK`
- `garden_id UUID NOT NULL`
- `scope_type TEXT CHECK IN ('garden','row','plant','tree')`
- `scope_id UUID NOT NULL`
- `operation_type TEXT` (watering, fertilizing, treatment, work, pruning, sfemminellatura, harvest, ...)
- `actor_type TEXT CHECK IN ('manual','iot','orchestrator')`
- `actor_id UUID NULL` (utente o device owner)
- `device_id TEXT NULL`
- `executed_at TIMESTAMPTZ NOT NULL`
- `payload JSONB NOT NULL` (quantita, prodotto, dose, durata, note, allegati)
- `context_snapshot JSONB NOT NULL`
- `source_ref JSONB` (tabella/id origine, se evento derivato)
- `created_at TIMESTAMPTZ DEFAULT now()`

Indici:
- `(garden_id, executed_at desc)`
- `(scope_type, scope_id, executed_at desc)`
- GIN su `context_snapshot`

### 2) Struttura `context_snapshot` (JSONB)
```json
{
  "geo": {
    "latitude": 0,
    "longitude": 0,
    "altitude_m": 0,
    "source": "garden_coordinates",
    "accuracy_m": 0
  },
  "microclimate": {
    "sun_exposure": "FullSun",
    "daily_sun_hours": 7.2,
    "aspect_direction": "South",
    "wind_protection": "Medium",
    "obstacles_version": "obs_v3",
    "obstacle_summary": [{"azimuth":180,"height":8,"distance":12,"type":"Building"}]
  },
  "weather": {
    "provider": "open-meteo",
    "observed_at": "2026-03-09T10:12:00Z",
    "temperature_c": 18.2,
    "humidity_pct": 65,
    "wind_kmh": 9,
    "precip_mm": 0,
    "pressure_hpa": 1014,
    "condition": "sunny"
  },
  "astro": {
    "season": "spring",
    "lunar_phase": "First Quarter",
    "illumination_pct": 50,
    "sunrise": "06:30",
    "sunset": "19:30"
  },
  "quality": {
    "context_score": 0.98,
    "fallback_used": false,
    "fallback_reason": null
  }
}
```

### 3) Versionamento contesto garden
Aggiungere tabella `garden_context_versions`:
- snapshot anagrafica geo-clima (coordinate, altitudine, esposizione, ostacoli)
- hash/versione usata da `operation_events.context_snapshot.microclimate.obstacles_version`

## Flussi applicativi target

### Manuale
1. UI compila intervento.
2. Orchestratore risolve context da `garden_id` + timestamp intervento.
3. Persistenza su `operation_events`.
4. Proiezione verso viste compatibili UI (`individual_plant_operations`, `tree_treatments`) via worker/trigger.

### IOT
1. Ingest raw telemetria con `device_id`.
2. Normalizzazione in evento operativo.
3. Enrichment context (geo garden + meteo + microclima).
4. Persistenza su `operation_events` con `actor_type='iot'`.

### Orchestrator-derived
1. Evento padre (es. filare) crea eventi figli per scope pianta/albero con `source_ref`.
2. Tutti i figli ereditano timestamp e context coerente del padre, salvo override espliciti.

## Correzioni schema minime (short-term)
1. Allineare subito `daily_weather_log` a un solo contratto (`garden_id`, `temperature_min/max`).
2. Estendere `individual_plant_operations` con:
- `weather_conditions JSONB`
- `operation_context JSONB`
- `geo_snapshot JSONB`
3. Estendere `tree_treatments` con:
- `operation_context JSONB`
- `geo_snapshot JSONB`
- `actor_type`, `device_id`
4. Introdurre `garden_obstacles` write path effettivo da onboarding.

## Refactor applicativo (phased rollout)

### Fase 0 - Stabilizzazione (1 sprint)
- Fix P0 da gap register.
- Eliminare fallback Roma nei percorsi operativi (mantenerlo solo per UI non critica e con flag fallback esplicito).
- Correggere `user_id` in `cultivationOrchestrator`.

### Fase 1 - Canonical context persistence (1 sprint)
- Aggiornare `UnifiedOperationRequest` e `executeUnifiedOperation` per context obbligatorio o resolver interno obbligatorio.
- Aggiornare provider cloud/local per leggere/scrivere `operation_context`.
- Aggiornare entry manuali pianta/albero.

### Fase 2 - Event log centrale (2 sprint)
- Introdurre `operation_events`.
- Implementare adapter di compatibilita verso UI esistente.
- Mantenere doppia scrittura temporanea con feature flag.

### Fase 3 - Backfill e analytics (1 sprint)
- Backfill eventi storici da tabelle legacy.
- Calcolo punteggio qualita contesto per evento.
- Dashboard qualità dati (percentuale eventi con context completo).

## KPI di successo
1. `context_completeness_rate >= 99%` sugli eventi nuovi.
2. `garden_weather_binding_rate = 100%` (nessun fallback non esplicito nei log operativi).
3. `event_traceability_rate = 100%` (actor/source sempre valorizzati).
4. Zero mismatch schema runtime sui moduli diario/frutteto.

## Test e controlli da rendere obbligatori
1. Contract tests provider cloud/local su payload `operation_context`.
2. Integration test manuale/IOT/orchestrator con verifica snapshot meteo/geo.
3. DB migration test su ambiente staging con diff schema automatico.
4. E2E frutteto batch create + diario interventi con context persistito.

## Decisioni architetturali da confermare prima implementazione
1. Usare `operation_events` come fonte unica o estendere tabelle legacy senza tabella centrale.
2. Livello di storicizzazione ostacoli (`snapshot full` vs `version reference`).
3. Strategia backfill storico (best effort vs strict validation).
