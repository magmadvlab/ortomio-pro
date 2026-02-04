# 🌍 Sistema Zone Terreno - Implementazione Completa

**Data**: 4 Febbraio 2026  
**Status**: ✅ Implementazione Base Completata  
**Approccio**: Zone fisse semplici, nessun GPS, memoria del terreno preservata

---

## 📋 Cosa È Stato Implementato

### 1. Database (Migrazione SQL) ✅

**File**: `database/migrations/20260204100000_add_land_zones_and_memory_simplified.sql`

**Tabelle Create**:

#### `land_zones` - Zone Fisse del Terreno
```sql
- id (UUID)
- garden_id (riferimento orto)
- user_id (proprietario)
- zone_name (es. "Zona A", "Zona Nord")
- zone_code (opzionale, es. "ZA")
- area_hectares (superficie in ettari - OBBLIGATORIO)
- current_status ('active' | 'resting')
- status_since (data cambio status)
- soil_type (opzionale: argilloso, sabbioso, limoso)
- notes (note libere)
- created_at, updated_at
```

#### `soil_memory` - Memoria Permanente del Terreno
```sql
- id (UUID)
- land_zone_id (riferimento zona)
- garden_id, user_id
- field_row_id (opzionale, può essere NULL se filare eliminato)
- crop_name, crop_variety, crop_family, crop_type
- planting_date, harvest_date, days_to_harvest
- season_year, season_type
- yield_kg, yield_per_hectare, quality_rating
- nitrogen_impact, organic_matter_added, soil_structure_impact
- fertilization_type, irrigation_method, treatments_count
- success_score, planting_context, ai_notes
- created_at, updated_at
```

#### `garden_rows` - Aggiunto Campo Zona
```sql
ALTER TABLE garden_rows 
ADD COLUMN land_zone_id UUID REFERENCES land_zones(id);
```

**Funzioni SQL Create**:
- `get_zone_rotation_suggestions(zone_id, years_back)` - Suggerimenti rotazione
- `calculate_zone_soil_health(zone_id)` - Calcolo salute terreno
- `get_zone_history(zone_id, years_back)` - Storico completo zona

**RLS Policies**: ✅ Tutte configurate per user_id

---

### 2. Servizio TypeScript ✅

**File**: `services/landZoneService.ts`

**Interfacce**:
```typescript
interface LandZone {
  id: string
  garden_id: string
  zone_name: string
  area_hectares: number
  current_status: 'active' | 'resting'
  soil_type?: string
  notes?: string
  // ... altri campi
}

interface SoilMemory {
  land_zone_id: string
  crop_name: string
  crop_family: string
  planting_date: string
  nitrogen_impact?: number
  success_score?: number
  // ... altri campi
}

interface ZoneSoilHealth {
  zone_id: string
  zone_name: string
  health_score: number
  nitrogen_balance: number
  diversity_score: number
  recommendation: string
}

interface ZoneRotationSuggestion {
  family: string
  reason: string
  score: number
  nitrogen_benefit: 'high' | 'medium' | 'low'
}
```

**Funzioni Implementate**:
- `getLandZones(gardenId)` - Ottiene tutte le zone
- `getLandZone(zoneId)` - Ottiene una zona specifica
- `createLandZone(gardenId, userId, zoneData)` - Crea nuova zona
- `updateLandZone(zoneId, updates)` - Aggiorna zona
- `deleteLandZone(zoneId)` - Elimina zona
- `toggleZoneStatus(zoneId)` - Cambia status (active ↔ resting)
- `getZoneRotationSuggestions(zoneId)` - Suggerimenti rotazione
- `calculateZoneSoilHealth(zoneId)` - Calcola salute terreno
- `getZoneHistory(zoneId)` - Storico completo
- `getZoneSoilMemory(zoneId)` - Memoria del terreno
- `countActiveFieldRowsInZone(zoneId)` - Conta filari attivi
- `getFieldRowsInZone(zoneId)` - Ottiene filari della zona
- `getZoneStats(zoneId)` - Statistiche aggregate

---

### 3. Pagina UI Gestione Zone ✅

**File**: `app/app/garden/zones/page.tsx`

**Funzionalità Implementate**:
- ✅ Lista zone con card visuale
- ✅ Visualizzazione status (🟢 Attiva / 🟡 Riposo)
- ✅ Statistiche per zona (superficie, filari, salute terreno)
- ✅ Salute del terreno con punteggio 0-100
- ✅ Suggerimenti rotazione colture
- ✅ Toggle status (Attiva ↔ Riposo)
- ✅ Link ai filari della zona
- ✅ Pulsante storico zona
- ✅ Eliminazione zona
- ⏳ Modal creazione zona (TODO)

**UI Features**:
- Card colorate per status (verde = attiva, giallo = riposo)
- Visualizzazione salute terreno con punteggio
- Suggerimenti rotazione con score
- Statistiche aggregate (filari, superficie, bilancio azoto)
- Responsive design

---

## 🔄 Workflow Utente

### Setup Iniziale (Una Volta)

1. **Vai su `/app/garden/zones`**
2. **Clicca "Nuova Zona"**
3. **Compila**:
   - Nome: "Zona A"
   - Superficie: 2 ha
   - Tipo terreno: argilloso (opzionale)
   - Note: "Zona nord, ben esposta"
4. **Ripeti per altre zone** (es. Zona B)
5. ✅ Setup completato!

### Ogni Stagione

1. **Vai su "Gestione Zone"**
2. **Scegli quale zona coltivare**:
   - Zona A → Clicca "🟢 Attiva"
   - Zona B → Clicca "🟡 Metti a Riposo"
3. **Vai su "Filari"**
4. **Crea filari** selezionando "Zona A" dal dropdown
5. **Trapianta normalmente**
6. Sistema registra tutto in `soil_memory` collegato alla Zona A

### Fine Stagione

1. **Raccogli tutto**
2. **Elimina filari** (se necessario)
3. **Vai su "Gestione Zone"**
4. **Inverti status**:
   - Zona A → "🟡 Metti a Riposo"
   - Zona B → "🟢 Attiva"
5. **LA MEMORIA RIMANE** nella Zona A! ✅

### Consulta Storico

1. **Vai su "Gestione Zone"**
2. **Clicca "Storico"** su una zona
3. **Vedi**:
   - Tutte le colture piantate in quella zona
   - Performance per anno
   - Bilancio nutrienti
   - Suggerimenti AI per prossima coltura

---

## 🚀 Prossimi Passi (TODO)

### 1. Modal Creazione Zona ⏳
**File da modificare**: `app/app/garden/zones/page.tsx`

Implementare form con:
- Input nome zona (obbligatorio)
- Input codice zona (opzionale)
- Input superficie in ettari (obbligatorio, number)
- Select tipo terreno (opzionale)
- Textarea note (opzionale)
- Pulsanti Salva/Annulla

### 2. Modifica Creazione Filare ⏳
**File da modificare**: `app/app/garden/rows/edit/page.tsx`

Aggiungere:
- Dropdown selezione zona (obbligatorio)
- Caricare zone disponibili per l'orto
- Salvare `land_zone_id` quando si crea/modifica filare
- Validazione: zona obbligatoria

### 3. Estendere Storico Filare ⏳
**File da modificare**: `components/fieldrows/FieldRowCropHistoryPanel.tsx`

Modificare per:
- Accettare anche `zoneId` come prop (oltre a `rowId`)
- Se `zoneId` fornito, mostrare storico di tutta la zona
- Query su `land_zone_id` invece di solo `garden_row_id`
- Visualizzazione aggregata per zona

### 4. Integrazione Trapianto ⏳
**File da modificare**: `services/transplantOrchestrationService.ts`

Quando si trapianta dal vivaio a un filare:
- Ottenere `land_zone_id` dal filare
- Registrare in `soil_memory` con `land_zone_id`
- Così la memoria persiste anche se il filare viene eliminato

### 5. Modal Storico Zona ⏳
**File da creare**: `components/zones/ZoneHistoryModal.tsx`

Componente per visualizzare:
- Timeline storico colture
- Grafici bilancio nutrienti
- Statistiche performance
- Suggerimenti rotazione dettagliati

### 6. Pagina Modifica Zona ⏳
**File da creare**: `app/app/garden/zones/edit/page.tsx`

Pagina dedicata per:
- Modificare nome, superficie, tipo terreno
- Cambiare status
- Visualizzare storico completo
- Gestire note e osservazioni

---

## 📊 Architettura Sistema

```
GARDEN (Orto)
  ↓
LAND_ZONES (Zone Fisse)
  ├─ Zona A (2 ha) - ATTIVA
  │   ↓
  │   FIELD_ROWS (Filari Temporanei)
  │   ├─ Filare 1 (Pomodori)
  │   ├─ Filare 2 (Peperoni)
  │   └─ Filare 3 (Melanzane)
  │       ↓
  │       SOIL_MEMORY (Memoria Permanente)
  │       └─ Collegata alla Zona A
  │
  └─ Zona B (2 ha) - RIPOSO
      ↓
      SOIL_MEMORY (Memoria Storica)
      ├─ 2025: Leguminose (fagioli)
      ├─ 2024: Crucifere (cavoli)
      └─ 2023: Cucurbitacee (zucchine)
```

---

## 🎯 Vantaggi Implementazione

### 1. Semplicità ✅
- Configuri zone una volta sola
- Non serve GPS preciso
- Facile da capire e usare

### 2. Realistico ✅
- Rispecchia la realtà agricola
- Zone fisse, filari temporanei
- Memoria del terreno preservata

### 3. Flessibile ✅
- Puoi avere 2, 3, 4+ zone
- Dimensioni diverse per zona
- Rotazione personalizzabile

### 4. AI Efficace ✅
- Memoria chiara per zona
- Suggerimenti basati su storico zona
- Bilancio nutrienti per zona

---

## 🔧 Come Applicare la Migrazione

### Opzione 1: Supabase CLI (Locale)
```bash
# Applica migrazione al database locale
supabase db reset

# Oppure solo questa migrazione
psql -h localhost -U postgres -d postgres -f database/migrations/20260204100000_add_land_zones_and_memory_simplified.sql
```

### Opzione 2: Supabase Dashboard (Produzione)
1. Vai su Supabase Dashboard
2. SQL Editor
3. Copia/incolla il contenuto di `20260204100000_add_land_zones_and_memory_simplified.sql`
4. Esegui

### Opzione 3: Supabase CLI (Produzione)
```bash
# Link al progetto remoto
supabase link --project-ref YOUR_PROJECT_REF

# Push migrazione
supabase db push
```

---

## 📝 Note Tecniche

### Relazioni Database
- `land_zones.garden_id` → `gardens.id` (CASCADE DELETE)
- `land_zones.user_id` → `auth.users.id` (CASCADE DELETE)
- `soil_memory.land_zone_id` → `land_zones.id` (CASCADE DELETE)
- `soil_memory.field_row_id` → `garden_rows.id` (SET NULL) ← Importante!
- `garden_rows.land_zone_id` → `land_zones.id` (SET NULL)

### Perché SET NULL su field_row_id?
Quando elimini un filare, la memoria del terreno NON viene eliminata.
Il campo `field_row_id` diventa NULL, ma `land_zone_id` rimane.
Così la memoria persiste collegata alla zona! ✅

### RLS Policies
Tutte le tabelle hanno RLS abilitato con policies basate su `user_id = auth.uid()`.
Gli utenti vedono solo le proprie zone e memoria.

---

## 🧪 Test Consigliati

### Test 1: Crea Zone
1. Vai su `/app/garden/zones`
2. Crea "Zona A" (2 ha)
3. Crea "Zona B" (2 ha)
4. Verifica che appaiano nella lista

### Test 2: Cambia Status
1. Clicca "🟡 Metti a Riposo" su Zona A
2. Verifica che diventi gialla
3. Clicca "🟢 Attiva" su Zona A
4. Verifica che diventi verde

### Test 3: Crea Filare con Zona
1. Vai su `/app/garden/rows/edit`
2. Seleziona "Zona A" dal dropdown
3. Crea filare
4. Verifica che `land_zone_id` sia salvato

### Test 4: Storico Zona
1. Trapianta alcune piante in filari della Zona A
2. Vai su "Gestione Zone"
3. Clicca "Storico" su Zona A
4. Verifica che mostri le colture

### Test 5: Memoria Persiste
1. Crea filare in Zona A con colture
2. Elimina il filare
3. Vai su "Storico" Zona A
4. Verifica che la memoria sia ancora presente ✅

---

## 📚 Documentazione Correlata

- `SISTEMA_ZONE_SEMPLIFICATO.md` - Specifica completa approccio
- `FIELD_ROW_CROP_ROTATION_SYSTEM_COMPLETE.md` - Sistema rotazione filari
- `GUIDA_STORICO_ROTAZIONE_COLTURE.md` - Guida utente storico

---

## ✅ Checklist Completamento

### Implementato ✅
- [x] Migrazione database semplificata
- [x] Tabella `land_zones`
- [x] Tabella `soil_memory`
- [x] Campo `land_zone_id` in `garden_rows`
- [x] Funzioni SQL helper
- [x] RLS Policies
- [x] Servizio TypeScript `landZoneService.ts`
- [x] Pagina UI `/app/garden/zones`
- [x] Visualizzazione zone con card
- [x] Toggle status zona
- [x] Statistiche e salute terreno
- [x] Suggerimenti rotazione

### Da Completare ⏳
- [ ] Modal creazione zona
- [ ] Modal modifica zona
- [ ] Dropdown selezione zona in creazione filare
- [ ] Estensione storico per zone
- [ ] Integrazione trapianto con zone
- [ ] Modal storico zona dettagliato
- [ ] Grafici e visualizzazioni avanzate
- [ ] Export/Import configurazione zone

---

**Sistema pronto per essere testato e completato! 🚀**

