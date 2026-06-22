# Farm Command Center — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire un cockpit multi-appezzamento che mostra lo stato aggregato (rosso/giallo/verde) di tutti i giardini, alert prioritizzati per urgenza e meteo in tempo reale — alimentato da una Supabase Edge Function con cache 30 minuti.

**Architecture:** L'Edge Function `compute-field-alerts` viene invocata dal client al caricamento della pagina; legge dati da Supabase + OpenMeteo, esegue 5 checker puri (acqua, trattamenti, caldo, malattia, raccolta), scrive i risultati in `field_alerts` con TTL 30 min, e ritorna la cache se ancora valida. Il frontend è un layout ibrido: WeatherStrip in cima, FieldMapPanel schematico a sinistra, AlertPriorityList a destra.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.8, Supabase JS v2, `node:test` (runner nativo), Tailwind CSS 4

---

## Mappa file

| File | Tipo | Responsabilità |
|------|------|---------------|
| `types/fieldAlerts.ts` | Crea | Tipi `FieldAlert`, `AlertSeverity`, `AlertCategory`, `WeatherData` |
| `supabase/migrations/20260622120000_add_field_alerts.sql` | Crea | Tabella `field_alerts` + indice |
| `packages/core/storage/interface.ts` | Modifica | Aggiunge `getFieldAlerts`, `upsertFieldAlerts` |
| `packages/storage-cloud/SupabaseStorageProvider.ts` | Modifica | Implementa i due nuovi metodi |
| `packages/storage-local/LocalStorageProvider.ts` | Modifica | Implementa stub (ritorna `[]`, noop) |
| `services/fieldAlertCheckers.ts` | Crea | 5 checker puri: water, treatment, heat, disease, harvest |
| `services/openMeteoService.ts` | Crea | `fetchWeatherForecast(lat, lon)` → `WeatherData` |
| `supabase/functions/compute-field-alerts/index.ts` | Crea | Edge Function: cache + checkers + OpenMeteo |
| `services/fieldAlertService.ts` | Crea | Client service con in-memory cache 5 min |
| `components/farm/WeatherStrip.tsx` | Crea | Barra meteo superiore |
| `components/farm/FieldMapPanel.tsx` | Crea | Griglia schematica appezzamenti colorati |
| `components/farm/AlertPriorityList.tsx` | Crea | Lista alert ordinata per severity + CTA |
| `components/farm/FarmCommandCenter.tsx` | Crea | Componente radice che compone i tre sopra |
| `app/farm/page.tsx` | Crea | Route `/farm` Next.js |
| `components/shared/HomeDashboardSimple.tsx` | Modifica | Aggiunge link di navigazione a `/farm` |
| `__tests__/precision-hub/fieldAlertCheckers.test.ts` | Crea | Test TDD per i 5 checker puri |
| `__tests__/precision-hub/fieldAlertService.test.ts` | Crea | Test cache in-memory del client service |

---

## Task 1: Tipi TypeScript condivisi

**Files:**
- Crea: `types/fieldAlerts.ts`

- [ ] **Step 1: Crea il file dei tipi**

```typescript
// types/fieldAlerts.ts

export type AlertSeverity = 'ok' | 'warning' | 'critical'
export type AlertCategory = 'water' | 'treatment' | 'heat' | 'disease' | 'harvest'

export interface FieldAlert {
  id?: string
  gardenId: string
  category: AlertCategory
  severity: AlertSeverity
  message: string
  computedAt: string   // ISO timestamp
  expiresAt: string    // computedAt + 30min
  meta?: Record<string, unknown>
}

export interface WeatherData {
  daily: {
    time: string[]                        // YYYY-MM-DD per 7 giorni
    temperature_2m_max: number[]          // °C
    temperature_2m_min: number[]          // °C
    precipitation_sum: number[]           // mm
    sunshine_duration: number[]           // secondi
    precipitation_probability_max: number[] // 0-100
    windspeed_10m_max: number[]           // km/h
  }
}

export interface FieldAlertsResult {
  alerts: FieldAlert[]
  fromCache: boolean
  computedAt: string
}
```

- [ ] **Step 2: Verifica compilazione**

```bash
npm run type-check 2>&1 | grep fieldAlerts
```

Atteso: nessun output (0 errori).

- [ ] **Step 3: Commit**

```bash
git add types/fieldAlerts.ts
git commit -m "feat: add FieldAlert types for Farm Command Center"
```

---

## Task 2: Migrazione DB

**Files:**
- Crea: `supabase/migrations/20260622120000_add_field_alerts.sql`

- [ ] **Step 1: Crea il file di migrazione**

```sql
-- supabase/migrations/20260622120000_add_field_alerts.sql

CREATE TABLE IF NOT EXISTS field_alerts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id    uuid NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  category     text NOT NULL CHECK (category IN ('water','treatment','heat','disease','harvest')),
  severity     text NOT NULL CHECK (severity IN ('ok','warning','critical')),
  message      text NOT NULL,
  computed_at  timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  meta         jsonb
);

CREATE INDEX IF NOT EXISTS idx_field_alerts_garden_expires
  ON field_alerts (garden_id, expires_at DESC);

-- RLS: solo l'owner del garden può leggere/scrivere i suoi alert
ALTER TABLE field_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can manage field_alerts"
  ON field_alerts
  USING (
    garden_id IN (
      SELECT id FROM gardens WHERE user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Applica migrazione in locale (se Supabase CLI attivo)**

```bash
supabase migration up 2>&1 | tail -5
```

Se non c'è Supabase locale attivo, saltare questo step — la migrazione verrà applicata al deploy.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260622120000_add_field_alerts.sql
git commit -m "feat: add field_alerts table with RLS"
```

---

## Task 3: Storage interface + provider implementations

**Files:**
- Modifica: `packages/core/storage/interface.ts`
- Modifica: `packages/storage-cloud/SupabaseStorageProvider.ts`
- Modifica: `packages/storage-local/LocalStorageProvider.ts`

- [ ] **Step 1: Aggiungi import e metodi all'interfaccia**

In `packages/core/storage/interface.ts`, aggiungi l'import in cima (con gli altri import):

```typescript
import type { FieldAlert } from '../../../types/fieldAlerts';
```

Aggiungi i due metodi alla fine dell'interfaccia `IStorageProvider` (prima della chiusura `}`):

```typescript
  // Field Alerts (Farm Command Center)
  getFieldAlerts(gardenId: string): Promise<FieldAlert[]>;
  upsertFieldAlerts(gardenId: string, alerts: FieldAlert[]): Promise<void>;
```

- [ ] **Step 2: Implementa in SupabaseStorageProvider**

In `packages/storage-cloud/SupabaseStorageProvider.ts`, aggiungi l'import in cima:

```typescript
import type { FieldAlert } from '@/types/fieldAlerts';
```

Aggiungi i due metodi alla fine della classe (prima della chiusura `}`):

```typescript
  async getFieldAlerts(gardenId: string): Promise<FieldAlert[]> {
    if (!this.client) return [];
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('field_alerts')
      .select('*')
      .eq('garden_id', gardenId)
      .gt('expires_at', now)
      .order('expires_at', { ascending: false });
    if (error) return [];
    return (data ?? []).map(row => ({
      id: row.id,
      gardenId: row.garden_id,
      category: row.category,
      severity: row.severity,
      message: row.message,
      computedAt: row.computed_at,
      expiresAt: row.expires_at,
      meta: row.meta ?? undefined,
    }));
  }

  async upsertFieldAlerts(gardenId: string, alerts: FieldAlert[]): Promise<void> {
    if (!this.client) return;
    // cancella vecchi alert per questo garden, poi inserisce i nuovi
    await this.client.from('field_alerts').delete().eq('garden_id', gardenId);
    if (alerts.length === 0) return;
    await this.client.from('field_alerts').insert(
      alerts.map(a => ({
        garden_id: a.gardenId,
        category: a.category,
        severity: a.severity,
        message: a.message,
        computed_at: a.computedAt,
        expires_at: a.expiresAt,
        meta: a.meta ?? null,
      }))
    );
  }
```

- [ ] **Step 3: Implementa stub in LocalStorageProvider**

In `packages/storage-local/LocalStorageProvider.ts`, aggiungi l'import:

```typescript
import type { FieldAlert } from '@/types/fieldAlerts';
```

Aggiungi i due metodi stub alla fine della classe:

```typescript
  async getFieldAlerts(_gardenId: string): Promise<FieldAlert[]> {
    return [];
  }

  async upsertFieldAlerts(_gardenId: string, _alerts: FieldAlert[]): Promise<void> {
    // localStorage non persiste alert calcolati server-side
  }
```

- [ ] **Step 4: Verifica compilazione**

```bash
npm run type-check 2>&1 | grep -E "(interface|StorageProvider|LocalStorage)" | head -10
```

Atteso: 0 errori.

- [ ] **Step 5: Commit**

```bash
git add packages/core/storage/interface.ts packages/storage-cloud/SupabaseStorageProvider.ts packages/storage-local/LocalStorageProvider.ts
git commit -m "feat: add getFieldAlerts and upsertFieldAlerts to storage interface"
```

---

## Task 4: Checker puri (TDD)

**Files:**
- Crea: `services/fieldAlertCheckers.ts`
- Crea: `__tests__/precision-hub/fieldAlertCheckers.test.ts`

- [ ] **Step 1: Crea il file dei test**

```typescript
// __tests__/precision-hub/fieldAlertCheckers.test.ts
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkWaterAlert,
  checkTreatmentAlert,
  checkHeatAlert,
  checkDiseaseAlert,
  checkHarvestAlert,
} from '../../services/fieldAlertCheckers';
import type { WeatherData } from '../../types/fieldAlerts';

const gardenId = 'garden-test-1';

const makeWeather = (precipMm: number[] = [0,0,0,0,0,0,0], tempMax: number[] = [25,25,25,25,25,25,25]): WeatherData => ({
  daily: {
    time: ['2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22'],
    temperature_2m_max: tempMax,
    temperature_2m_min: tempMax.map(t => t - 10),
    precipitation_sum: precipMm,
    sunshine_duration: [36000,36000,36000,36000,36000,36000,36000],
    precipitation_probability_max: [10,10,10,10,10,10,10],
    windspeed_10m_max: [12,12,12,12,12,12,12],
  }
});

// ── WATER ──────────────────────────────────────────────────────
describe('checkWaterAlert', () => {
  test('ok when irrigation within 3 days and no deficit', () => {
    const today = new Date('2026-06-22');
    const lastIrrigation = new Date('2026-06-20').toISOString();
    const result = checkWaterAlert(gardenId, [lastIrrigation], makeWeather([2,2,2,2,2,2,2]), today);
    assert.equal(result.severity, 'ok');
  });

  test('warning when precipitation deficit > 10mm', () => {
    const today = new Date('2026-06-22');
    const result = checkWaterAlert(gardenId, [], makeWeather([0,0,0,0,0,0,0]), today);
    assert.equal(result.severity, 'warning');
  });

  test('critical when no irrigation for 5+ days and deficit > 25mm', () => {
    const today = new Date('2026-06-22');
    const oldIrrigation = new Date('2026-06-15').toISOString(); // 7 giorni fa
    const result = checkWaterAlert(gardenId, [oldIrrigation], makeWeather([0,0,0,0,0,0,0]), today);
    assert.equal(result.severity, 'critical');
  });
});

// ── TREATMENT ──────────────────────────────────────────────────
describe('checkTreatmentAlert', () => {
  test('ok when no treatments needed', () => {
    const today = new Date('2026-06-22');
    const result = checkTreatmentAlert(gardenId, [], today);
    assert.equal(result.severity, 'ok');
  });

  test('warning when treatment due in 2 days', () => {
    const today = new Date('2026-06-22');
    const nextDue = new Date('2026-06-24').toISOString();
    const result = checkTreatmentAlert(gardenId, [{ nextDueDate: nextDue }], today);
    assert.equal(result.severity, 'warning');
  });

  test('critical when treatment overdue by 1+ day', () => {
    const today = new Date('2026-06-22');
    const overdue = new Date('2026-06-20').toISOString();
    const result = checkTreatmentAlert(gardenId, [{ nextDueDate: overdue }], today);
    assert.equal(result.severity, 'critical');
  });
});

// ── HEAT ───────────────────────────────────────────────────────
describe('checkHeatAlert', () => {
  test('ok at normal temperature', () => {
    const result = checkHeatAlert(gardenId, makeWeather([0,0,0,0,0,0,0], [22,22,22,22,22,22,22]));
    assert.equal(result.severity, 'ok');
  });

  test('warning when 2+ consecutive days above 35°C', () => {
    const result = checkHeatAlert(gardenId, makeWeather([0,0,0,0,0,0,0], [36,37,36,25,25,25,25]));
    assert.equal(result.severity, 'warning');
  });

  test('critical when temperature exceeds 40°C', () => {
    const result = checkHeatAlert(gardenId, makeWeather([0,0,0,0,0,0,0], [41,41,40,25,25,25,25]));
    assert.equal(result.severity, 'critical');
  });
});

// ── DISEASE ────────────────────────────────────────────────────
describe('checkDiseaseAlert', () => {
  test('ok in dry conditions', () => {
    const result = checkDiseaseAlert(gardenId, makeWeather([0,0,0,0,0,0,0]));
    assert.equal(result.severity, 'ok');
  });

  test('warning after 3+ rainy days (peronospora risk)', () => {
    const result = checkDiseaseAlert(gardenId, makeWeather([5,6,4,0,0,0,0]));
    assert.equal(result.severity, 'warning');
  });

  test('critical after 5+ rainy days', () => {
    const result = checkDiseaseAlert(gardenId, makeWeather([5,6,4,3,7,0,0]));
    assert.equal(result.severity, 'critical');
  });
});

// ── HARVEST ────────────────────────────────────────────────────
describe('checkHarvestAlert', () => {
  test('ok when no plants nearing harvest', () => {
    const today = new Date('2026-06-22');
    const result = checkHarvestAlert(gardenId, [], today);
    assert.equal(result.severity, 'ok');
  });

  test('warning when harvest window opens within 7 days', () => {
    const today = new Date('2026-06-22');
    const soon = new Date('2026-06-27').toISOString();
    const result = checkHarvestAlert(gardenId, [{ expectedHarvestDate: soon, harvested: false }], today);
    assert.equal(result.severity, 'warning');
  });

  test('critical when harvest window is open and not harvested', () => {
    const today = new Date('2026-06-22');
    const past = new Date('2026-06-20').toISOString();
    const result = checkHarvestAlert(gardenId, [{ expectedHarvestDate: past, harvested: false }], today);
    assert.equal(result.severity, 'critical');
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che falliscano**

```bash
npm run test:precision-hub 2>&1 | grep -E "(fieldAlertCheckers|FAIL|fail)" | head -10
```

Atteso: errori di importazione (file non esiste ancora).

- [ ] **Step 3: Crea l'implementazione**

```typescript
// services/fieldAlertCheckers.ts
import type { FieldAlert, AlertSeverity, WeatherData } from '@/types/fieldAlerts';

function makeAlert(
  gardenId: string,
  category: FieldAlert['category'],
  severity: AlertSeverity,
  message: string,
  meta?: Record<string, unknown>
): FieldAlert {
  const computedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  return { gardenId, category, severity, message, computedAt, expiresAt, meta };
}

// ─── WATER ────────────────────────────────────────────────────────────────────
export function checkWaterAlert(
  gardenId: string,
  irrigationDates: string[],   // ISO timestamps delle ultime irrigazioni
  weather: WeatherData,
  today: Date
): FieldAlert {
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const totalPrecipMm = weather.daily.precipitation_sum.reduce((a, b) => a + b, 0);

  const lastIrrigationDate = irrigationDates.length > 0
    ? new Date(Math.max(...irrigationDates.map(d => new Date(d).getTime())))
    : null;

  const daysSinceIrrigation = lastIrrigationDate
    ? Math.floor((today.getTime() - lastIrrigationDate.getTime()) / 86400000)
    : 999;

  // Stima deficit: ETP semplificata = 4mm/giorno per estate mediterranea
  const etpWeek = 28;
  const deficit = etpWeek - totalPrecipMm;

  if (daysSinceIrrigation >= 5 && deficit > 25) {
    return makeAlert(gardenId, 'water', 'critical',
      `Deficit idrico critico: ${Math.round(deficit)}mm · ultima irrigazione ${daysSinceIrrigation}gg fa`,
      { deficit, daysSinceIrrigation }
    );
  }
  if (deficit > 10) {
    return makeAlert(gardenId, 'water', 'warning',
      `Deficit idrico: ${Math.round(deficit)}mm negli ultimi 7gg`,
      { deficit }
    );
  }
  return makeAlert(gardenId, 'water', 'ok', 'Idratazione adeguata');
}

// ─── TREATMENT ────────────────────────────────────────────────────────────────
export function checkTreatmentAlert(
  gardenId: string,
  pendingTreatments: Array<{ nextDueDate: string }>,
  today: Date
): FieldAlert {
  if (pendingTreatments.length === 0) {
    return makeAlert(gardenId, 'treatment', 'ok', 'Nessun trattamento in scadenza');
  }

  const todayMs = today.getTime();
  let mostUrgentDiff = Infinity; // positivo = futuro, negativo = scaduto

  for (const t of pendingTreatments) {
    const dueMs = new Date(t.nextDueDate).getTime();
    const diff = Math.floor((dueMs - todayMs) / 86400000); // giorni
    if (diff < mostUrgentDiff) mostUrgentDiff = diff;
  }

  if (mostUrgentDiff < 0) {
    return makeAlert(gardenId, 'treatment', 'critical',
      `Trattamento scaduto da ${Math.abs(mostUrgentDiff)} giorno/i`,
      { daysOverdue: Math.abs(mostUrgentDiff) }
    );
  }
  if (mostUrgentDiff <= 2) {
    return makeAlert(gardenId, 'treatment', 'warning',
      `Trattamento in scadenza tra ${mostUrgentDiff} giorno/i`,
      { daysUntilDue: mostUrgentDiff }
    );
  }
  return makeAlert(gardenId, 'treatment', 'ok', 'Trattamenti nella norma');
}

// ─── HEAT ─────────────────────────────────────────────────────────────────────
const HEAT_WARNING_THRESHOLD = 35  // °C
const HEAT_CRITICAL_THRESHOLD = 40 // °C
const CONSECUTIVE_DAYS_FOR_WARNING = 2

export function checkHeatAlert(
  gardenId: string,
  weather: WeatherData
): FieldAlert {
  const temps = weather.daily.temperature_2m_max;

  if (temps.some(t => t >= HEAT_CRITICAL_THRESHOLD)) {
    return makeAlert(gardenId, 'heat', 'critical',
      `Temperature critiche: ${Math.max(...temps).toFixed(0)}°C previsti`,
      { maxTemp: Math.max(...temps) }
    );
  }

  let consecutiveHot = 0;
  for (const t of temps) {
    if (t >= HEAT_WARNING_THRESHOLD) {
      consecutiveHot++;
      if (consecutiveHot >= CONSECUTIVE_DAYS_FOR_WARNING) {
        return makeAlert(gardenId, 'heat', 'warning',
          `${consecutiveHot} giorni consecutivi sopra ${HEAT_WARNING_THRESHOLD}°C`,
          { consecutiveDays: consecutiveHot }
        );
      }
    } else {
      consecutiveHot = 0;
    }
  }

  return makeAlert(gardenId, 'heat', 'ok', 'Temperature nella norma');
}

// ─── DISEASE (modello Mills semplificato: gg pioggia come proxy bagnatura fogliare) ──
export function checkDiseaseAlert(
  gardenId: string,
  weather: WeatherData
): FieldAlert {
  const rainyDays = weather.daily.precipitation_sum.filter(mm => mm > 1).length;

  if (rainyDays >= 5) {
    return makeAlert(gardenId, 'disease', 'critical',
      `Rischio malattia critico: ${rainyDays} giorni piovosi negli ultimi 7gg`,
      { rainyDays }
    );
  }
  if (rainyDays >= 3) {
    return makeAlert(gardenId, 'disease', 'warning',
      `Rischio peronospora/oidio: ${rainyDays} giorni piovosi recenti`,
      { rainyDays }
    );
  }
  return makeAlert(gardenId, 'disease', 'ok', 'Condizioni sfavorevoli alle malattie');
}

// ─── HARVEST ──────────────────────────────────────────────────────────────────
export function checkHarvestAlert(
  gardenId: string,
  plants: Array<{ expectedHarvestDate: string; harvested: boolean }>,
  today: Date
): FieldAlert {
  const readyPlants = plants.filter(p => !p.harvested);
  if (readyPlants.length === 0) {
    return makeAlert(gardenId, 'harvest', 'ok', 'Nessuna coltura in prossimità di raccolta');
  }

  const todayMs = today.getTime();
  let mostUrgent = { diff: Infinity, date: '' };

  for (const p of readyPlants) {
    const harvestMs = new Date(p.expectedHarvestDate).getTime();
    const diff = Math.floor((harvestMs - todayMs) / 86400000);
    if (diff < mostUrgent.diff) mostUrgent = { diff, date: p.expectedHarvestDate };
  }

  if (mostUrgent.diff < 0) {
    return makeAlert(gardenId, 'harvest', 'critical',
      `Finestra di raccolta aperta da ${Math.abs(mostUrgent.diff)} giorni — agire subito`,
      { daysOverdue: Math.abs(mostUrgent.diff) }
    );
  }
  if (mostUrgent.diff <= 7) {
    return makeAlert(gardenId, 'harvest', 'warning',
      `Raccolta prevista tra ${mostUrgent.diff} giorni`,
      { daysUntilHarvest: mostUrgent.diff }
    );
  }
  return makeAlert(gardenId, 'harvest', 'ok', 'Nessuna raccolta imminente');
}
```

- [ ] **Step 4: Esegui i test per verificare che passino**

```bash
npm run test:precision-hub 2>&1 | grep -E "(fieldAlertCheckers|pass|fail)" | head -20
```

Atteso: 15 test pass (3 per checker × 5 categorie).

- [ ] **Step 5: Commit**

```bash
git add services/fieldAlertCheckers.ts __tests__/precision-hub/fieldAlertCheckers.test.ts
git commit -m "feat: add field alert checkers (water, treatment, heat, disease, harvest) with TDD"
```

---

## Task 5: OpenMeteo Service

**Files:**
- Crea: `services/openMeteoService.ts`

- [ ] **Step 1: Crea il servizio**

```typescript
// services/openMeteoService.ts
import type { WeatherData } from '@/types/fieldAlerts';

const OPENMETEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherForecast(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'sunshine_duration',
      'precipitation_probability_max',
      'windspeed_10m_max',
    ].join(','),
    timezone: 'Europe/Rome',
    past_days: '7',
    forecast_days: '1',
  });

  const res = await fetch(`${OPENMETEO_BASE}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`OpenMeteo error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json as WeatherData;
}
```

- [ ] **Step 2: Verifica compilazione**

```bash
npm run type-check 2>&1 | grep openMeteo
```

Atteso: 0 errori.

- [ ] **Step 3: Commit**

```bash
git add services/openMeteoService.ts
git commit -m "feat: add OpenMeteo weather forecast service"
```

---

## Task 6: Edge Function `compute-field-alerts`

**Files:**
- Crea: `supabase/functions/compute-field-alerts/index.ts`

- [ ] **Step 1: Crea la directory e il file**

```bash
mkdir -p /Volumes/990P/ortomio-main/supabase/functions/compute-field-alerts
```

- [ ] **Step 2: Crea l'Edge Function**

```typescript
// supabase/functions/compute-field-alerts/index.ts
// Deno runtime — non usare import da @/ qui, usa URL o path relativi

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  checkWaterAlert,
  checkTreatmentAlert,
  checkHeatAlert,
  checkDiseaseAlert,
  checkHarvestAlert,
} from '../../services/fieldAlertCheckers.ts';
import { fetchWeatherForecast } from '../../services/openMeteoService.ts';
import type { FieldAlert } from '../../types/fieldAlerts.ts';

const CACHE_TTL_MINUTES = 30;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { gardenId } = await req.json() as { gardenId: string };
    if (!gardenId) {
      return new Response(JSON.stringify({ error: 'gardenId required' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Controlla cache
    const now = new Date();
    const { data: cached } = await supabase
      .from('field_alerts')
      .select('*')
      .eq('garden_id', gardenId)
      .gt('expires_at', now.toISOString())
      .limit(10);

    if (cached && cached.length > 0) {
      const alerts: FieldAlert[] = cached.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        gardenId: r.garden_id as string,
        category: r.category as FieldAlert['category'],
        severity: r.severity as FieldAlert['severity'],
        message: r.message as string,
        computedAt: r.computed_at as string,
        expiresAt: r.expires_at as string,
        meta: r.meta as Record<string, unknown> | undefined,
      }));
      return Response.json({ alerts, fromCache: true, computedAt: alerts[0].computedAt });
    }

    // 2. Leggi garden
    const { data: garden, error: gardenError } = await supabase
      .from('gardens')
      .select('id, name, coordinates')
      .eq('id', gardenId)
      .single();

    if (gardenError || !garden) {
      return new Response(JSON.stringify({ error: 'Garden not found' }), { status: 404 });
    }

    const coords = garden.coordinates as { latitude: number; longitude: number } | null;

    // 3. Fetch meteo (fallback a Roma se no coordinate)
    let weather;
    try {
      weather = await fetchWeatherForecast(
        coords?.latitude ?? 41.9,
        coords?.longitude ?? 12.5
      );
    } catch {
      weather = null;
    }

    // 4. Leggi dati dal DB
    const todayIso = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    const [{ data: treatments }, { data: irrigations }, { data: plants }] = await Promise.all([
      supabase.from('treatment_records').select('next_due_date').eq('garden_id', gardenId).gte('next_due_date', sevenDaysAgo),
      supabase.from('watering_logs').select('created_at').eq('garden_id', gardenId).gte('created_at', sevenDaysAgo),
      supabase.from('plants').select('expected_harvest_date, harvested').eq('garden_id', gardenId),
    ]);

    // 5. Esegui checker
    const today = now;
    const dummyWeather = weather ?? {
      daily: {
        time: Array(7).fill(todayIso),
        temperature_2m_max: Array(7).fill(25),
        temperature_2m_min: Array(7).fill(15),
        precipitation_sum: Array(7).fill(0),
        sunshine_duration: Array(7).fill(36000),
        precipitation_probability_max: Array(7).fill(10),
        windspeed_10m_max: Array(7).fill(10),
      }
    };

    const irrigationDates = (irrigations ?? []).map((r: Record<string, string>) => r.created_at);
    const pendingTreatments = (treatments ?? [])
      .filter((r: Record<string, string>) => r.next_due_date)
      .map((r: Record<string, string>) => ({ nextDueDate: r.next_due_date }));
    const plantList = (plants ?? [])
      .filter((r: Record<string, unknown>) => r.expected_harvest_date)
      .map((r: Record<string, unknown>) => ({
        expectedHarvestDate: r.expected_harvest_date as string,
        harvested: Boolean(r.harvested),
      }));

    const alerts: FieldAlert[] = [
      checkWaterAlert(gardenId, irrigationDates, dummyWeather, today),
      checkTreatmentAlert(gardenId, pendingTreatments, today),
      ...(weather ? [checkHeatAlert(gardenId, weather), checkDiseaseAlert(gardenId, weather)] : []),
      checkHarvestAlert(gardenId, plantList, today),
    ];

    // 6. Scrivi in DB
    const expiresAt = new Date(now.getTime() + CACHE_TTL_MINUTES * 60 * 1000).toISOString();
    await supabase.from('field_alerts').delete().eq('garden_id', gardenId);
    await supabase.from('field_alerts').insert(
      alerts.map(a => ({
        garden_id: a.gardenId,
        category: a.category,
        severity: a.severity,
        message: a.message,
        computed_at: a.computedAt,
        expires_at: expiresAt,
        meta: a.meta ?? null,
      }))
    );

    return Response.json({ alerts, fromCache: false, computedAt: now.toISOString() });

  } catch (err) {
    console.error('compute-field-alerts error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
```

- [ ] **Step 3: Verifica che il file esista**

```bash
ls supabase/functions/compute-field-alerts/
```

Atteso: `index.ts`

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/compute-field-alerts/
git commit -m "feat: add compute-field-alerts Edge Function with 5 checkers and 30min cache"
```

---

## Task 7: Client service con cache in-memory

**Files:**
- Crea: `services/fieldAlertService.ts`
- Crea: `__tests__/precision-hub/fieldAlertService.test.ts`

- [ ] **Step 1: Crea i test**

```typescript
// __tests__/precision-hub/fieldAlertService.test.ts
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock fetch globale
let lastFetchUrl = '';
let mockAlerts = [
  { gardenId: 'g1', category: 'water' as const, severity: 'warning' as const,
    message: 'Test', computedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60000).toISOString() }
];

global.fetch = async (input: RequestInfo | URL) => {
  lastFetchUrl = input.toString();
  return {
    ok: true,
    json: async () => ({ alerts: mockAlerts, fromCache: false, computedAt: new Date().toISOString() }),
  } as Response;
};

// Import DOPO il mock fetch
const { getFieldAlerts, clearFieldAlertsCache } = await import('../../services/fieldAlertService');

describe('fieldAlertService', () => {
  beforeEach(() => {
    clearFieldAlertsCache();
    lastFetchUrl = '';
  });

  test('fetches alerts on first call', async () => {
    const alerts = await getFieldAlerts('g1', 'http://localhost:54321');
    assert.equal(alerts.length, 1);
    assert.ok(lastFetchUrl.includes('compute-field-alerts'));
  });

  test('returns cache on second call within 5 minutes', async () => {
    await getFieldAlerts('g1', 'http://localhost:54321');
    lastFetchUrl = '';
    const alerts = await getFieldAlerts('g1', 'http://localhost:54321');
    assert.equal(alerts.length, 1);
    assert.equal(lastFetchUrl, ''); // nessuna fetch
  });

  test('fetches fresh data for different gardenId', async () => {
    await getFieldAlerts('g1', 'http://localhost:54321');
    lastFetchUrl = '';
    await getFieldAlerts('g2', 'http://localhost:54321');
    assert.ok(lastFetchUrl.includes('compute-field-alerts'));
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che falliscano**

```bash
npm run test:precision-hub 2>&1 | grep fieldAlertService | head -5
```

Atteso: errori di importazione.

- [ ] **Step 3: Crea il service**

```typescript
// services/fieldAlertService.ts
import type { FieldAlert } from '@/types/fieldAlerts';

interface CacheEntry {
  alerts: FieldAlert[]
  ts: number
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minuti
const cache = new Map<string, CacheEntry>();

export function clearFieldAlertsCache(): void {
  cache.clear();
}

export async function getFieldAlerts(
  gardenId: string,
  supabaseFunctionsUrl: string
): Promise<FieldAlert[]> {
  const cached = cache.get(gardenId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.alerts;
  }

  const res = await fetch(`${supabaseFunctionsUrl}/compute-field-alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gardenId }),
  });

  if (!res.ok) return [];

  const { alerts } = await res.json() as { alerts: FieldAlert[] };
  cache.set(gardenId, { alerts, ts: Date.now() });
  return alerts;
}
```

- [ ] **Step 4: Esegui i test**

```bash
npm run test:precision-hub 2>&1 | grep -E "(fieldAlertService|pass|fail)" | head -10
```

Atteso: 3 pass.

- [ ] **Step 5: Commit**

```bash
git add services/fieldAlertService.ts __tests__/precision-hub/fieldAlertService.test.ts
git commit -m "feat: add fieldAlertService with 5min in-memory cache"
```

---

## Task 8: WeatherStrip e FieldMapPanel

**Files:**
- Crea: `components/farm/WeatherStrip.tsx`
- Crea: `components/farm/FieldMapPanel.tsx`

- [ ] **Step 1: Crea WeatherStrip**

```typescript
// components/farm/WeatherStrip.tsx
'use client'
import { useEffect, useState } from 'react';
import type { WeatherData } from '@/types/fieldAlerts';
import type { FieldAlert } from '@/types/fieldAlerts';

interface WeatherStripProps {
  lat: number
  lon: number
  alerts: FieldAlert[]
}

export function WeatherStrip({ lat, lon, alerts }: WeatherStripProps) {
  const [weather, setWeather] = useState<WeatherData['daily'] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,sunshine_duration',
      timezone: 'Europe/Rome',
      forecast_days: '1',
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(r => r.json())
      .then((d: WeatherData) => setWeather(d.daily))
      .catch(() => null);
  }, [lat, lon]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const todayIdx = 0;
  const tempMax = weather?.temperature_2m_max?.[todayIdx];
  const wind = weather?.windspeed_10m_max?.[todayIdx];
  const rainProb = weather?.precipitation_probability_max?.[todayIdx];
  const sunshine = weather?.sunshine_duration?.[todayIdx];
  const sunHours = sunshine ? (sunshine / 3600).toFixed(1) : null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-green-950 text-green-100 text-sm border-b border-green-800 flex-wrap">
      {tempMax != null && <span>🌡 {tempMax.toFixed(0)}°C</span>}
      {wind != null && <span>💨 {wind.toFixed(0)} km/h</span>}
      {rainProb != null && <span>💧 {rainProb}% pioggia</span>}
      {sunHours && <span>☀️ {sunHours}h sole</span>}
      <span className="ml-auto flex gap-2">
        {criticalCount > 0 && (
          <span className="bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            {criticalCount} critico/i
          </span>
        )}
        {warningCount > 0 && (
          <span className="bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            {warningCount} attenzione
          </span>
        )}
        {criticalCount === 0 && warningCount === 0 && (
          <span className="bg-green-700 text-white rounded-full px-2 py-0.5 text-xs font-bold">
            Tutto OK
          </span>
        )}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Crea FieldMapPanel**

```typescript
// components/farm/FieldMapPanel.tsx
import type { Garden } from '@/types';
import type { FieldAlert } from '@/types/fieldAlerts';

interface FieldMapPanelProps {
  gardens: Garden[]
  alerts: FieldAlert[]
  onFieldSelect: (gardenId: string) => void
}

function getFieldColor(gardenId: string, alerts: FieldAlert[]): { bg: string; border: string; text: string } {
  const fieldAlerts = alerts.filter(a => a.gardenId === gardenId);
  if (fieldAlerts.some(a => a.severity === 'critical')) {
    return { bg: 'bg-red-900/70', border: 'border-red-500', text: 'text-red-200' };
  }
  if (fieldAlerts.some(a => a.severity === 'warning')) {
    return { bg: 'bg-amber-900/70', border: 'border-amber-500', text: 'text-amber-200' };
  }
  return { bg: 'bg-green-900/70', border: 'border-green-600', text: 'text-green-200' };
}

function getStatusIcon(gardenId: string, alerts: FieldAlert[]): string {
  const fieldAlerts = alerts.filter(a => a.gardenId === gardenId);
  if (fieldAlerts.some(a => a.severity === 'critical')) return '🚨';
  if (fieldAlerts.some(a => a.severity === 'warning')) return '⚠';
  return '✓';
}

export function FieldMapPanel({ gardens, alerts, onFieldSelect }: FieldMapPanelProps) {
  return (
    <div className="p-3 h-full overflow-y-auto">
      <p className="text-xs text-green-400 font-semibold uppercase mb-2">
        📍 {gardens.length} Appezzamenti
      </p>
      <div className="grid grid-cols-2 gap-2">
        {gardens.map(garden => {
          const { bg, border, text } = getFieldColor(garden.id, alerts);
          const icon = getStatusIcon(garden.id, alerts);
          return (
            <button
              key={garden.id}
              onClick={() => onFieldSelect(garden.id)}
              className={`${bg} ${border} ${text} border rounded-lg p-3 text-left text-xs hover:opacity-90 transition-opacity`}
            >
              <div className="font-bold truncate">{garden.name}</div>
              <div className="mt-1">{icon}</div>
              {garden.primaryCrop && (
                <div className="text-[10px] opacity-70 mt-1 truncate">{garden.primaryCrop}</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
        <span><span className="text-red-400">■</span> Critico</span>
        <span><span className="text-amber-400">■</span> Attenzione</span>
        <span><span className="text-green-400">■</span> OK</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verifica compilazione**

```bash
npm run type-check 2>&1 | grep -E "(WeatherStrip|FieldMapPanel)" | head -10
```

Atteso: 0 errori.

- [ ] **Step 4: Commit**

```bash
git add components/farm/WeatherStrip.tsx components/farm/FieldMapPanel.tsx
git commit -m "feat: add WeatherStrip and FieldMapPanel components"
```

---

## Task 9: AlertPriorityList

**Files:**
- Crea: `components/farm/AlertPriorityList.tsx`

- [ ] **Step 1: Crea il componente**

```typescript
// components/farm/AlertPriorityList.tsx
import type { FieldAlert } from '@/types/fieldAlerts';
import Link from 'next/link';

interface AlertPriorityListProps {
  alerts: FieldAlert[]
  highlightedGardenId?: string
  getGardenName: (gardenId: string) => string
}

const CATEGORY_ICONS: Record<FieldAlert['category'], string> = {
  water: '💧',
  treatment: '🧪',
  heat: '🌡',
  disease: '🍄',
  harvest: '📅',
};

const CTA: Record<FieldAlert['category'], { label: string; href: string } | null> = {
  treatment: { label: 'Registra intervento →', href: '/dashboard' },
  disease: { label: 'Vedi prescrizione AI →', href: '/dashboard' },
  water: { label: 'Pianifica irrigazione →', href: '/dashboard' },
  heat: null,
  harvest: null,
};

function sortAlerts(alerts: FieldAlert[]): FieldAlert[] {
  const order: Record<string, number> = { critical: 0, warning: 1, ok: 2 };
  return [...alerts].sort((a, b) => (order[a.severity] ?? 2) - (order[b.severity] ?? 2));
}

export function AlertPriorityList({ alerts, highlightedGardenId, getGardenName }: AlertPriorityListProps) {
  const activeAlerts = sortAlerts(alerts.filter(a => a.severity !== 'ok'));
  const okAlerts = alerts.filter(a => a.severity === 'ok');

  return (
    <div className="p-3 overflow-y-auto h-full">
      <p className="text-xs text-green-400 font-semibold uppercase mb-2">Priorità oggi</p>

      <div className="flex flex-col gap-2">
        {activeAlerts.map((alert, i) => {
          const isCritical = alert.severity === 'critical';
          const isHighlighted = alert.gardenId === highlightedGardenId;
          const cta = CTA[alert.category];
          const borderColor = isCritical ? 'border-red-500' : 'border-amber-500';
          const bgColor = isCritical ? 'bg-red-950/60' : 'bg-amber-950/60';
          const badgeColor = isCritical ? 'bg-red-600' : 'bg-amber-500';
          const titleColor = isCritical ? 'text-red-300' : 'text-amber-300';

          return (
            <div
              key={`${alert.gardenId}-${alert.category}-${i}`}
              id={`alert-${alert.gardenId}`}
              className={`${bgColor} border-l-4 ${borderColor} rounded-r-lg p-3 transition-all ${
                isHighlighted ? 'ring-1 ring-white/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${titleColor}`}>
                  {CATEGORY_ICONS[alert.category]} {getGardenName(alert.gardenId)}
                </span>
                <span className={`${badgeColor} text-white text-[10px] rounded-full px-2 py-0.5 font-bold`}>
                  {isCritical ? 'CRITICO' : 'ATTENZIONE'}
                </span>
              </div>
              <p className="text-xs text-green-100">{alert.message}</p>
              {cta && (
                <Link href={cta.href} className="mt-2 inline-block text-[10px] bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 transition-colors">
                  {cta.label}
                </Link>
              )}
            </div>
          );
        })}

        {okAlerts.length > 0 && (
          <div className="bg-green-950/40 border-l-4 border-green-700 rounded-r-lg p-3">
            <p className="text-xs text-green-400 font-semibold">
              ✓ {okAlerts.map(a => getGardenName(a.gardenId)).join(', ')} — Nessun alert
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              Ultimo controllo: {new Date(okAlerts[0].computedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}

        {alerts.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">Nessun dato disponibile</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifica compilazione**

```bash
npm run type-check 2>&1 | grep AlertPriorityList
```

Atteso: 0 errori.

- [ ] **Step 3: Commit**

```bash
git add components/farm/AlertPriorityList.tsx
git commit -m "feat: add AlertPriorityList with severity ordering and contextual CTA"
```

---

## Task 10: FarmCommandCenter + route + link navigazione

**Files:**
- Crea: `components/farm/FarmCommandCenter.tsx`
- Crea: `app/farm/page.tsx`
- Modifica: `components/shared/HomeDashboardSimple.tsx` (aggiunge link a `/farm`)

- [ ] **Step 1: Crea FarmCommandCenter**

```typescript
// components/farm/FarmCommandCenter.tsx
'use client'
import { useEffect, useRef, useState, useCallback } from 'react';
import { useStorage } from '@/packages/core/hooks/useStorage';
import { getFieldAlerts, clearFieldAlertsCache } from '@/services/fieldAlertService';
import { WeatherStrip } from './WeatherStrip';
import { FieldMapPanel } from './FieldMapPanel';
import { AlertPriorityList } from './AlertPriorityList';
import type { FieldAlert } from '@/types/fieldAlerts';
import type { Garden } from '@/types';

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

export function FarmCommandCenter() {
  const { storageProvider } = useStorage();
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [allAlerts, setAllAlerts] = useState<FieldAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  const loadAlerts = useCallback(async (gardenList: Garden[], forceRefresh = false) => {
    if (forceRefresh) clearFieldAlertsCache();
    setLoading(true);
    try {
      const alertArrays = await Promise.all(
        gardenList.map(g => getFieldAlerts(g.id, SUPABASE_FUNCTIONS_URL))
      );
      const flat = alertArrays.flat();
      setAllAlerts(flat);
      if (flat.length > 0) {
        const expires = flat.reduce((min, a) =>
          a.expiresAt < min ? a.expiresAt : min, flat[0].expiresAt
        );
        setNextRefresh(new Date(expires));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!storageProvider) return;
    let cancelled = false;
    storageProvider.getGardens().then(gs => {
      if (cancelled) return;
      setGardens(gs);
      loadAlerts(gs);
    });
    return () => { cancelled = true; };
  }, [storageProvider, loadAlerts]);

  const handleFieldSelect = (gardenId: string) => {
    setHighlightedId(gardenId);
    document.getElementById(`alert-${gardenId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const primaryGarden = gardens[0];
  const coords = primaryGarden?.coordinates;
  const getGardenName = (id: string) => gardens.find(g => g.id === id)?.name ?? id;

  if (loading && gardens.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-green-400">
        <span className="animate-pulse">Caricamento appezzamenti...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-green-950 text-green-100 rounded-xl overflow-hidden border border-green-800">

      {/* WeatherStrip */}
      {coords && (
        <WeatherStrip lat={coords.latitude} lon={coords.longitude} alerts={allAlerts} />
      )}

      {/* Main: map + list */}
      <div className="flex flex-1 min-h-0">
        <div className="w-2/5 border-r border-green-800">
          <FieldMapPanel gardens={gardens} alerts={allAlerts} onFieldSelect={handleFieldSelect} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <AlertPriorityList
            alerts={allAlerts}
            highlightedGardenId={highlightedId}
            getGardenName={getGardenName}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-green-900/50 text-[11px] text-gray-400 border-t border-green-800">
        <span>
          {loading ? 'Aggiornamento...' : nextRefresh
            ? `Prossimo ricalcolo: ${nextRefresh.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
            : 'Dati aggiornati'}
        </span>
        <button
          onClick={() => loadAlerts(gardens, true)}
          className="text-green-400 hover:text-green-200 transition-colors"
          disabled={loading}
        >
          ↻ Aggiorna ora
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crea la route `/app/farm/page.tsx`**

```bash
mkdir -p /Volumes/990P/ortomio-main/app/farm
```

```typescript
// app/farm/page.tsx
import { FarmCommandCenter } from '@/components/farm/FarmCommandCenter';

export default function FarmPage() {
  return (
    <main className="p-4 h-[calc(100vh-4rem)]">
      <FarmCommandCenter />
    </main>
  );
}
```

- [ ] **Step 3: Aggiungi link di navigazione in HomeDashboardSimple**

Cerca la riga che contiene la navigazione principale in `components/shared/HomeDashboardSimple.tsx`:

```bash
grep -n "href\|Link\|nav\|pianifica\|planner" /Volumes/990P/ortomio-main/components/shared/HomeDashboardSimple.tsx | head -10
```

Trova un link di navigazione esistente (es. verso `/pianifica` o `/dashboard`) e aggiungi accanto ad esso:

```typescript
import Link from 'next/link';
// ... nel JSX, vicino agli altri link di navigazione:
<Link
  href="/farm"
  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-800 hover:bg-green-700 text-green-100 text-sm font-medium transition-colors"
>
  🌾 Command Center
</Link>
```

- [ ] **Step 4: Verifica compilazione completa**

```bash
npm run type-check 2>&1 | grep -v tsbuildinfo | grep -i error | head -15
```

Atteso: 0 errori nuovi.

- [ ] **Step 5: Esegui test suite**

```bash
npm run test:precision-hub 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

Atteso: pass aumentati di 18 (15 checker + 3 service), fail invariati a 2.

- [ ] **Step 6: Commit finale**

```bash
git add components/farm/ app/farm/ components/shared/HomeDashboardSimple.tsx
git commit -m "feat: Farm Command Center — cockpit multi-appezzamento con alert engine e meteo integrato"
```

---

## Verifica finale

- [ ] **Type-check globale**

```bash
npm run type-check 2>&1 | grep -v tsbuildinfo | grep -i error
```

Atteso: 0 errori.

- [ ] **Test suite**

```bash
npm run test:precision-hub 2>&1 | grep -E "^ℹ (tests|pass|fail)"
```

Atteso: 176 tests, 174 pass, 2 fail (pre-esistenti).

- [ ] **Nuovi file presenti**

```bash
ls components/farm/ services/fieldAlertCheckers.ts services/fieldAlertService.ts services/openMeteoService.ts supabase/functions/compute-field-alerts/ types/fieldAlerts.ts
```

Atteso: tutti i file esistono senza errori.
