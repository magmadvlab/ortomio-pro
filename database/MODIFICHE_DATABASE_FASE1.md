# Modifiche Database - FASE 1 Sprint 4

## ⚠️ IMPORTANTE
Questo documento registra tutte le modifiche al database effettuate durante la FASE 1.
**NON applicare queste modifiche alla versione online** finché non viene esplicitamente richiesto.

**Versione locale**: Include tutte le modifiche sotto elencate
**Versione online**: Mantiene lo schema originale (pre-FASE 1)

---

## Data: 2024-12-24
## Sprint: 4 - Salute Proattiva
## Feature: Sistema Alert Automatici

### 1. Nuova Tabella: `health_alerts`

**File migration**: `/database/migrations/add_health_alerts.sql`

**Scopo**: Memorizzare alert automatici per la salute delle piante basati su meteo, task in ritardo, stagionalità, sensori IoT.

#### Schema Tabella

```sql
CREATE TABLE IF NOT EXISTS health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('weather', 'water', 'disease', 'pest', 'nutrient')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  source TEXT NOT NULL, -- 'weather_api', 'task_overdue', 'sensor', 'ai', 'seasonal'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recommendation TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

#### Campi Principali

| Campo | Tipo | Descrizione | Valori Possibili |
|-------|------|-------------|------------------|
| `id` | UUID | Primary key auto-generata | - |
| `garden_id` | UUID | FK a gardens (CASCADE delete) | - |
| `plant_id` | UUID | FK a plants (SET NULL delete) | NULL se alert generale |
| `alert_type` | TEXT | Categoria alert | 'weather', 'water', 'disease', 'pest', 'nutrient' |
| `severity` | TEXT | Gravità alert | 'info', 'warning', 'critical' |
| `source` | TEXT | Origine alert | 'weather_api', 'task_overdue', 'sensor', 'ai', 'seasonal' |
| `title` | TEXT | Titolo breve | es. "Rischio Peronospora" |
| `message` | TEXT | Descrizione dettagliata | - |
| `recommendation` | TEXT | Azione consigliata | NULL se non applicabile |
| `resolved` | BOOLEAN | Se risolto dall'utente | Default: FALSE |
| `resolved_at` | TIMESTAMPTZ | Timestamp risoluzione | NULL se non risolto |
| `created_at` | TIMESTAMPTZ | Timestamp creazione | Auto NOW() |
| `updated_at` | TIMESTAMPTZ | Timestamp ultimo update | Auto NOW() |
| `metadata` | JSONB | Dati extra strutturati | JSON con temp, humidity, ecc. |

#### Row Level Security (RLS)

**CRITICO**: RLS abilitato per sicurezza

```sql
-- Abilita RLS
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: utente vede solo alert dei suoi giardini
CREATE POLICY health_alerts_user ON health_alerts
  FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id
      FROM gardens
      WHERE id = health_alerts.garden_id
    )
  );
```

**Cosa fa**: Ogni utente vede solo gli alert relativi ai propri giardini (via FK garden_id → gardens.user_id).

#### Trigger Auto-Update

```sql
-- Funzione trigger per updated_at
CREATE OR REPLACE FUNCTION update_health_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER health_alerts_updated_at
  BEFORE UPDATE ON health_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_health_alerts_updated_at();
```

**Cosa fa**: Aggiorna automaticamente `updated_at` ogni volta che un record viene modificato.

#### Indici per Performance

```sql
-- Indice su garden_id (query frequenti per giardino)
CREATE INDEX idx_health_alerts_garden ON health_alerts(garden_id);

-- Indice parziale su alert non risolti (query dashboard)
CREATE INDEX idx_health_alerts_unresolved ON health_alerts(garden_id, resolved)
WHERE resolved = FALSE;

-- Indice su created_at per ordinamento cronologico
CREATE INDEX idx_health_alerts_created ON health_alerts(created_at DESC);

-- Indice parziale su severity per alert critici
CREATE INDEX idx_health_alerts_severity ON health_alerts(severity)
WHERE resolved = FALSE;
```

**Perché**:
- `idx_health_alerts_garden`: Query per giardino (principale use case)
- `idx_health_alerts_unresolved`: Dashboard mostra solo non risolti
- `idx_health_alerts_created`: Ordinamento cronologico
- `idx_health_alerts_severity`: Filtro per criticità

---

## Esempio Dati Alert

### Alert Meteo - Rischio Peronospora

```json
{
  "id": "uuid-generated",
  "garden_id": "garden-uuid",
  "plant_id": null,
  "alert_type": "disease",
  "severity": "warning",
  "source": "weather_api",
  "title": "Rischio Peronospora",
  "message": "Condizioni favorevoli per peronospora su 3 piante: pioggia prevista domani, umidità 85%, temperatura 22°C",
  "recommendation": "Tratta preventivamente con prodotti rameici (ossicloruro di rame o poltiglia bordolese) oggi prima della pioggia. Evita irrigazione fogliare.",
  "resolved": false,
  "resolved_at": null,
  "created_at": "2024-12-24T10:00:00Z",
  "updated_at": "2024-12-24T10:00:00Z",
  "metadata": {
    "temp": 22,
    "humidity": 85,
    "affectedPlants": ["Pomodoro San Marzano", "Pomodoro Ciliegino", "Patate"]
  }
}
```

### Alert Task - Irrigazione in Ritardo

```json
{
  "id": "uuid-generated",
  "garden_id": "garden-uuid",
  "plant_id": "plant-uuid",
  "alert_type": "water",
  "severity": "critical",
  "source": "task_overdue",
  "title": "Irrigazione in Ritardo",
  "message": "Basilico non irrigato da 7 giorni. Rischio stress idrico.",
  "recommendation": "URGENTE: Irriga abbondantemente nelle ore serali. Verifica lo stato delle foglie.",
  "resolved": false,
  "resolved_at": null,
  "created_at": "2024-12-24T08:00:00Z",
  "updated_at": "2024-12-24T08:00:00Z",
  "metadata": {
    "plantName": "Basilico",
    "daysSinceLastWatering": 7,
    "taskId": "task-uuid"
  }
}
```

### Alert Stagionale - Afidi

```json
{
  "id": "uuid-generated",
  "garden_id": "garden-uuid",
  "plant_id": null,
  "alert_type": "pest",
  "severity": "info",
  "source": "seasonal",
  "title": "Periodo Afidi",
  "message": "Periodo di massima diffusione afidi. 5 piante sensibili presenti.",
  "recommendation": "Controlla regolarmente la pagina inferiore delle foglie. In caso di infestazione leggera, usa sapone molle di potassio. Per infestazioni gravi, usa piretro naturale.",
  "resolved": false,
  "resolved_at": null,
  "created_at": "2024-04-15T00:00:00Z",
  "updated_at": "2024-04-15T00:00:00Z",
  "metadata": {
    "month": 4,
    "affectedPlants": ["Pomodori", "Peperoni", "Melanzane", "Fave", "Zucchine"]
  }
}
```

---

## Query Utili

### 1. Ottieni tutti gli alert non risolti per un giardino

```sql
SELECT * FROM health_alerts
WHERE garden_id = 'garden-uuid'
  AND resolved = FALSE
ORDER BY
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'warning' THEN 2
    WHEN 'info' THEN 3
  END,
  created_at DESC;
```

### 2. Conta alert per severity

```sql
SELECT severity, COUNT(*) as count
FROM health_alerts
WHERE garden_id = 'garden-uuid'
  AND resolved = FALSE
GROUP BY severity;
```

### 3. Alert creati nelle ultime 24 ore

```sql
SELECT * FROM health_alerts
WHERE garden_id = 'garden-uuid'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 4. Risolvi un alert

```sql
UPDATE health_alerts
SET resolved = TRUE,
    resolved_at = NOW(),
    updated_at = NOW()
WHERE id = 'alert-uuid';
```

### 5. Alert per tipo

```sql
SELECT alert_type, COUNT(*) as count
FROM health_alerts
WHERE garden_id = 'garden-uuid'
  AND resolved = FALSE
GROUP BY alert_type
ORDER BY count DESC;
```

---

## Integrazione Applicazione

### Storage Interface

**File**: `/packages/core/storage/interface.ts`

Aggiunti metodi:

```typescript
// Health Alerts (Salute Proattiva)
getHealthAlerts(gardenId?: string): Promise<HealthAlert[]>;
getHealthAlert(id: string): Promise<HealthAlert | null>;
createHealthAlert(alert: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthAlert>;
updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert>;
deleteHealthAlert(id: string): Promise<void>;
```

### Type Definitions

**File**: `/types/healthAlert.ts`

```typescript
export type AlertType = 'weather' | 'water' | 'disease' | 'pest' | 'nutrient'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertSource = 'weather_api' | 'task_overdue' | 'sensor' | 'ai' | 'seasonal'

export interface HealthAlert {
  id: string
  gardenId: string
  plantId?: string
  alertType: AlertType
  severity: AlertSeverity
  source: AlertSource
  title: string
  message: string
  recommendation?: string
  resolved: boolean
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}
```

### Alert Engine

**File**: `/services/healthAlertEngine.ts`

Funzioni principali:
- `checkHealthAlerts()` - Entry point per generazione alert
- `checkWeatherDiseaseRisk()` - Alert basati su meteo (peronospora, oidio, gelo, stress termico)
- `checkWaterDeficit()` - Alert per irrigazioni in ritardo
- `checkSeasonalPests()` - Alert stagionali (afidi, nottua)
- `checkSensorAlerts()` - Alert da sensori IoT

---

## Procedura Applicazione su Versione Online

**⚠️ DA ESEGUIRE SOLO QUANDO RICHIESTO**

### Step 1: Backup Database

```bash
# Backup completo database produzione
pg_dump -h your-supabase-host -U postgres -d postgres > backup_pre_fase1.sql
```

### Step 2: Applicare Migration

```bash
# Copia file migration su server
scp database/migrations/add_health_alerts.sql user@server:/tmp/

# Applica migration (connessione a Supabase)
psql -h your-supabase-host -U postgres -d postgres -f /tmp/add_health_alerts.sql
```

### Step 3: Verifica

```sql
-- Verifica tabella creata
\d health_alerts

-- Verifica RLS abilitato
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename = 'health_alerts';

-- Verifica policy
SELECT * FROM pg_policies
WHERE tablename = 'health_alerts';

-- Verifica indici
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'health_alerts';

-- Verifica trigger
SELECT tgname, tgtype FROM pg_trigger
WHERE tgrelid = 'health_alerts'::regclass;
```

### Step 4: Deploy Codice

1. Aggiornare storage provider Supabase con implementazione metodi health alerts
2. Deploy frontend con nuovi componenti
3. Attivare cron job per generazione alert automatici

### Step 5: Test Produzione

1. Creare alert manualmente per test
2. Verificare RLS funzionante (utenti vedono solo propri alert)
3. Testare risoluzione alert
4. Verificare performance query con indici

---

## Rollback (se necessario)

```sql
-- Rimuovere trigger
DROP TRIGGER IF EXISTS health_alerts_updated_at ON health_alerts;

-- Rimuovere funzione trigger
DROP FUNCTION IF EXISTS update_health_alerts_updated_at();

-- Rimuovere policy
DROP POLICY IF EXISTS health_alerts_user ON health_alerts;

-- Disabilitare RLS
ALTER TABLE health_alerts DISABLE ROW LEVEL SECURITY;

-- Eliminare tabella
DROP TABLE IF EXISTS health_alerts;
```

---

## Note Implementazione

### Performance Considerations

1. **Indici parziali**: Usati per alert non risolti (caso più frequente)
2. **JSONB metadata**: Permette flessibilità senza alterare schema
3. **Cascade delete**: Alert eliminati automaticamente se giardino eliminato
4. **Set NULL delete**: Alert mantiene storico anche se pianta eliminata

### Security

1. **RLS obbligatorio**: Impedisce accesso cross-user
2. **Policy user-based**: Join con gardens.user_id via auth.uid()
3. **Trigger updated_at**: Audit trail automatico

### Scalability

1. **Cron job**: Generazione alert 2x al giorno (non real-time)
2. **Deduplicazione**: Engine controlla alert esistenti prima di creare duplicati
3. **Auto-cleanup**: Alert >7 giorni auto-risolti (opzionale, da implementare)

---

## Implementazione Storage Providers

### SupabaseStorageProvider

**File**: `/packages/storage-cloud/SupabaseStorageProvider.ts`

**Metodi implementati** (linee 2996-3113):
```typescript
async getHealthAlerts(gardenId?: string): Promise<HealthAlert[]>
async getHealthAlert(id: string): Promise<HealthAlert | null>
async createHealthAlert(alert: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthAlert>
async updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert>
async deleteHealthAlert(id: string): Promise<void>
```

**Mapper functions**:
- `mapHealthAlertFromDB(db: any): HealthAlert` - Converte snake_case → camelCase
- `mapHealthAlertToDB(alert): any` - Converte camelCase → snake_case

**Pattern implementato**:
- ✅ Segue pattern esistente (getTask, createTask, ecc.)
- ✅ Error handling con PGRST116 (Not Found)
- ✅ Ordinamento per `created_at DESC`
- ✅ Filtro opzionale per `garden_id`

### LocalStorageProvider

**File**: `/packages/storage-local/LocalStorageProvider.ts`

**Storage key**: `ortoHealthAlerts`

**Metodi implementati** (linee 1432-1486):
```typescript
async getHealthAlerts(gardenId?: string): Promise<HealthAlert[]>
async getHealthAlert(id: string): Promise<HealthAlert | null>
async createHealthAlert(alert: Omit<HealthAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthAlert>
async updateHealthAlert(id: string, updates: Partial<HealthAlert>): Promise<HealthAlert>
async deleteHealthAlert(id: string): Promise<void>
```

**Caratteristiche**:
- ✅ UUID generato con `crypto.randomUUID()`
- ✅ Timestamp `createdAt` e `updatedAt` automatici
- ✅ Ordinamento per `createdAt DESC`
- ✅ Filtro in-memory per `gardenId`

---

## Changelog

### 2024-12-24 - v1.1.0
- ✅ Implementati metodi health alerts in SupabaseStorageProvider
- ✅ Implementati metodi health alerts in LocalStorageProvider
- ✅ Aggiunti mapper functions (DB ↔ App)
- ✅ Sistema completamente funzionante (locale + cloud)

### 2024-12-24 - v1.0.0
- ✅ Creata tabella `health_alerts`
- ✅ Abilitato RLS con policy user-based
- ✅ Aggiunti 4 indici per performance
- ✅ Creato trigger `updated_at`
- ✅ Documentazione completa schema

---

## Contatti

Per domande o problemi relativi a questa migration:
- **Sprint**: FASE 1 - Sprint 4
- **Feature**: Salute Proattiva
- **Data creazione**: 2024-12-24

---

**STATO**: ✅ COMPLETAMENTE IMPLEMENTATO (locale + storage providers) - ⏳ In attesa di deploy su produzione
