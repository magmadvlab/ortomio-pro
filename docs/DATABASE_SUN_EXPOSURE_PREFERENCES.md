# 🌞 Database: Esposizione Solare e Preferenze Utente

**Data:** 2026-01-04
**Scopo:** Documentare come vengono salvati e come interagiscono i dati di esposizione solare, ostacoli e preferenze utente

---

## 📊 Schema Database - Esposizione Solare

### 1. Tabella `gardens` - Dati Base Esposizione

**Colonne per esposizione solare:**

| Colonna | Tipo | Nullable | Descrizione | UI Equivalente |
|---------|------|----------|-------------|----------------|
| `sun_exposure` | TEXT | YES | Esposizione generale | "FullSun", "PartSun", "Shade" |
| `daily_sun_hours` | INTEGER | YES | Ore di sole giornaliere | Es. 6 (ore) |
| `aspect_direction` | TEXT | YES | Direzione esposizione | "North", "South", "East", "West", "Flat" |
| `photo_north_offset` | NUMERIC(5,2) | YES | Offset nord da foto 360° | 0-360 gradi |

#### Constraints

```sql
CHECK (sun_exposure = ANY (ARRAY['FullSun'::text, 'PartSun'::text, 'Shade'::text]))
CHECK (daily_sun_hours >= 0 AND daily_sun_hours <= 24)
CHECK (aspect_direction = ANY (ARRAY['North'::text, 'South'::text, 'East'::text, 'West'::text, 'Flat'::text]))
CHECK (photo_north_offset >= 0 AND photo_north_offset <= 360)
```

#### Esempio Dati

```sql
INSERT INTO gardens (
  user_id,
  name,
  sun_exposure,
  daily_sun_hours,
  aspect_direction,
  photo_north_offset
) VALUES (
  'user-uuid',
  'Orto di Roberto',
  'FullSun',      -- ☀️ Pieno sole
  8,              -- 8 ore di sole al giorno
  'South',        -- Esposto a sud
  45.5            -- Nord della foto è a 45.5° rispetto al nord reale
);
```

---

### 2. Tabella `garden_obstacles` - Ostacoli che Fanno Ombra

**Struttura completa:**

| Colonna | Tipo | Nullable | Default | Descrizione |
|---------|------|----------|---------|-------------|
| `id` | UUID | NO | uuid_generate_v4() | ID univoco ostacolo |
| `garden_id` | UUID | NO | - | FK → gardens(id) |
| `azimuth` | NUMERIC | NO | - | Direzione angolare (0-360°) |
| `height_meters` | NUMERIC | NO | - | Altezza ostacolo in metri |
| `distance_meters` | NUMERIC | NO | - | Distanza dall'orto in metri |
| `width_degrees` | NUMERIC | YES | 30 | Ampiezza angolare (gradi) |
| `type` | TEXT | YES | 'Other' | Tipo ostacolo |
| `source` | TEXT | YES | 'manual' | Come è stato rilevato |
| `description` | TEXT | YES | - | Descrizione libera |
| `created_at` | TIMESTAMPTZ | YES | now() | Data creazione |
| `updated_at` | TIMESTAMPTZ | YES | now() | Data aggiornamento |

#### Tipi di Ostacoli

```typescript
type ObstacleType =
  | 'Edificio a Sud'     // Dalla UI: "Edificio a Sud"
  | 'Edificio a Est'     // Dalla UI: "Edificio a Est"
  | 'Edificio a Ovest'   // Dalla UI: "Edificio a Ovest"
  | 'Albero'             // Dalla UI: "Albero"
  | 'Montagna'           // Dalla UI: "Montagna"
  | 'Other'              // Default
```

#### Source Values

```typescript
type ObstacleSource =
  | 'manual'    // Aggiunto manualmente dall'utente
  | 'photo360'  // Rilevato da foto 360°
  | 'ai'        // Rilevato da AI su foto normale
```

#### Esempio Dati - Edificio a Sud

```sql
INSERT INTO garden_obstacles (
  garden_id,
  azimuth,
  height_meters,
  distance_meters,
  width_degrees,
  type,
  source,
  description
) VALUES (
  'garden-uuid',
  180,          -- 180° = Sud
  15,           -- Palazzo di 15 metri (≈5 piani)
  25,           -- A 25 metri dall'orto
  60,           -- Occupa 60° di ampiezza (edificio largo)
  'Edificio a Sud',
  'manual',
  'Palazzo condominiale a sud che fa ombra al pomeriggio'
);
```

#### Esempio Dati - Albero

```sql
INSERT INTO garden_obstacles (
  garden_id,
  azimuth,
  height_meters,
  distance_meters,
  width_degrees,
  type,
  source,
  description
) VALUES (
  'garden-uuid',
  90,           -- 90° = Est
  8,            -- Albero alto 8 metri
  5,            -- A 5 metri dall'orto
  15,           -- Occupa circa 15° (albero non troppo largo)
  'Albero',
  'manual',
  'Noce che fa ombra al mattino'
);
```

---

## 🧮 Come Interagiscono i Dati

### Calcolo Ombra da Ostacoli

Il sistema può calcolare quando e quanto ombra fa un ostacolo:

```typescript
// Formula semplificata per calcolo ombra
function calculateShadow(obstacle: Obstacle, time: Date, latitude: number): Shadow {
  const sunAzimuth = calculateSunAzimuth(time, latitude)
  const sunElevation = calculateSunElevation(time, latitude)

  // L'ostacolo fa ombra se il sole è dietro di lui
  const azimuthDiff = Math.abs(sunAzimuth - obstacle.azimuth)
  const isInShadow = azimuthDiff < (obstacle.width_degrees / 2)

  if (!isInShadow) return { hasShadow: false }

  // Calcola lunghezza ombra
  const shadowLength = obstacle.height_meters / Math.tan(sunElevation * Math.PI / 180)
  const affectsGarden = shadowLength >= obstacle.distance_meters

  return {
    hasShadow: affectsGarden,
    shadowLength,
    affectsGarden
  }
}
```

### Workflow Completo

1. **Utente configura orto:**
   ```sql
   -- Salva esposizione base
   UPDATE gardens SET
     sun_exposure = 'FullSun',
     daily_sun_hours = 8,
     aspect_direction = 'South'
   WHERE id = 'garden-uuid';
   ```

2. **Utente aggiunge ostacoli (manualmente o da foto):**
   ```sql
   -- Edificio a sud
   INSERT INTO garden_obstacles (...) VALUES (...);

   -- Albero a est
   INSERT INTO garden_obstacles (...) VALUES (...);
   ```

3. **Sistema calcola ore sole effettive:**
   ```typescript
   async function calculateActualSunHours(gardenId: string): Promise<number> {
     const garden = await getGarden(gardenId)
     const obstacles = await getGardenObstacles(gardenId)

     // Parti dalle ore dichiarate
     let effectiveSunHours = garden.daily_sun_hours || 8

     // Sottrai ore perse per ostacoli
     for (const obstacle of obstacles) {
       const hoursLost = calculateHoursLostByObstacle(
         obstacle,
         garden.latitude,
         garden.longitude
       )
       effectiveSunHours -= hoursLost
     }

     return Math.max(0, effectiveSunHours)
   }
   ```

4. **Sistema consiglia piante in base a sole effettivo:**
   ```typescript
   const effectiveSunHours = await calculateActualSunHours(gardenId)

   if (effectiveSunHours >= 6) {
     // Piante da pieno sole
     suggestions = ['Pomodori', 'Peperoni', 'Melanzane']
   } else if (effectiveSunHours >= 4) {
     // Piante da mezz'ombra
     suggestions = ['Lattuga', 'Spinaci', 'Rucola']
   } else {
     // Piante da ombra
     suggestions = ['Prezzemolo', 'Basilico', 'Menta']
   }
   ```

---

## 👤 Profili Utente e Preferenze

### Tabella `profiles` - Dati Utente

**Campi principali:**

| Campo | Tipo | Nullable | Default | Descrizione |
|-------|------|----------|---------|-------------|
| `id` | UUID | NO | - | FK → auth.users(id) |
| `tier` | TEXT | NO | 'PRO' | Tier utente (solo PRO) |
| `ai_credits_total` | INTEGER | YES | - | Crediti AI totali |
| `ai_credits_used` | INTEGER | YES | - | Crediti AI usati |
| `ai_credits_reset_date` | DATE | YES | - | Data reset crediti |
| `preferences` | JSONB | YES | - | Preferenze generiche JSON |
| `first_name` | TEXT | YES | - | Nome |
| `last_name` | TEXT | YES | - | Cognome |
| `company` | TEXT | YES | - | Azienda agricola |
| `onboarding_completed` | BOOLEAN | YES | - | Onboarding completato |

#### Esempio `preferences` JSONB

```json
{
  "language": "it",
  "theme": "light",
  "units": {
    "temperature": "celsius",
    "distance": "metric",
    "area": "hectare"
  },
  "garden_defaults": {
    "soil_type": "Loamy",
    "irrigation_method": "drip"
  }
}
```

### Tabella `notification_preferences` - Preferenze Notifiche

**Struttura:**

| Campo | Tipo | Default | Descrizione |
|-------|------|---------|-------------|
| `id` | UUID | uuid_generate_v4() | ID univoco |
| `user_id` | UUID | - | FK → auth.users(id) |
| `email_enabled` | BOOLEAN | true | Email abilitate |
| `task_reminders` | BOOLEAN | true | Reminder task |
| `weather_alerts` | BOOLEAN | true | Alert meteo |
| `challenge_notifications` | BOOLEAN | true | Notifiche sfide |
| `harvest_notifications` | BOOLEAN | true | Notifiche raccolti |
| `seed_notifications` | BOOLEAN | true | Notifiche semi |
| `created_at` | TIMESTAMPTZ | now() | Data creazione |
| `updated_at` | TIMESTAMPTZ | now() | Data aggiornamento |

#### Trigger Automatico

Quando un utente si registra, viene automaticamente creato un record in `notification_preferences`:

```sql
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();
```

#### Query Esempio - Utente Completo

```sql
SELECT
  u.id,
  u.email,
  p.tier,
  p.ai_credits_total,
  p.ai_credits_used,
  p.first_name,
  p.last_name,
  p.company,
  p.preferences,
  np.email_enabled,
  np.task_reminders,
  np.weather_alerts,
  np.challenge_notifications,
  np.harvest_notifications,
  np.seed_notifications
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN notification_preferences np ON np.user_id = u.id
WHERE u.email = 'roberto.lalinga@gmail.com';
```

---

## 🔗 Relazioni Tra Tabelle

```
auth.users (1)
    ↓
    ├─→ profiles (1:1)
    │     └─→ preferences (JSONB)
    │
    ├─→ notification_preferences (1:1)
    │
    └─→ gardens (1:N)
          ├─→ sun_exposure (campo)
          ├─→ daily_sun_hours (campo)
          ├─→ aspect_direction (campo)
          └─→ garden_obstacles (1:N)
                ├─→ azimuth
                ├─→ height_meters
                ├─→ distance_meters
                └─→ width_degrees
```

---

## 💡 Use Cases Pratici

### UC1: Utente Crea Orto con Wizard Esposizione Solare

```typescript
// 1. L'utente completa il wizard visivo
const sunExposureData = {
  location: 'Pieno campo',  // UI: "Pieno campo" | "Vicino muro" | "Balcone"
  morning: 3,               // Slider: ore sole mattino
  midday: 5,                // Slider: ore sole mezzogiorno
  afternoon: 3,             // Slider: ore sole pomeriggio
  obstacles: [
    { type: 'Edificio a Sud', ... },
    { type: 'Albero', ... }
  ]
}

// 2. Il sistema calcola e salva
const totalSunHours = sunExposureData.morning + sunExposureData.midday + sunExposureData.afternoon

await db.transaction(async (tx) => {
  // Salva garden
  const garden = await tx.insert(gardens).values({
    user_id: userId,
    name: 'Orto di Roberto',
    sun_exposure: totalSunHours >= 6 ? 'FullSun' : totalSunHours >= 4 ? 'PartSun' : 'Shade',
    daily_sun_hours: totalSunHours,
    aspect_direction: determineAspect(sunExposureData)
  })

  // Salva ostacoli
  for (const obstacle of sunExposureData.obstacles) {
    await tx.insert(garden_obstacles).values({
      garden_id: garden.id,
      ...convertObstacleUIToDb(obstacle)
    })
  }
})
```

### UC2: Sistema Consiglia Orari Irrigazione in Base a Sole

```typescript
async function suggestIrrigationTimes(gardenId: string): Promise<IrrigationSuggestion[]> {
  const garden = await getGarden(gardenId)
  const obstacles = await getGardenObstacles(gardenId)

  // Calcola ore con sole/ombra durante la giornata
  const sunMap = calculateSunMapForDay(garden, obstacles, new Date())

  // Trova finestre con ombra (meglio per irrigare)
  const shadyPeriods = sunMap.filter(period => !period.inFullSun)

  return shadyPeriods.map(period => ({
    time: period.startTime,
    reason: `Ombra da ${period.shadowSource} - ideale per irrigare`
  }))
}
```

---

## 🎯 Prossimi Passi

1. **Verificare utente roberto.lalinga@gmail.com:**
   - ✅ Creare utente se non esiste
   - ✅ Verificare preferenze di default create

2. **Testare wizard esposizione solare:**
   - Creare orto con wizard
   - Aggiungere ostacoli
   - Verificare calcoli ore sole

3. **Integrare con Solar Engine:**
   - Calcoli avanzati ombre
   - Suggerimenti piante
   - Ottimizzazione layout orto

---

**Documentazione Correlata:**
- [Tier Simplification](TIER_SIMPLIFICATION_PRO_ONLY.md)
- [Field Rows Integration](FIELD_ROWS_INTEGRATION_COMPLETE.md)
