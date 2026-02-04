# 🚀 Applica Migrazione Land Zones - Guida Passo-Passo

## ✅ Stato Attuale

Ho verificato il tuo database Supabase e **le migrazioni NON sono ancora applicate**:

- ❌ Tabella `land_zones` - MANCANTE
- ❌ Tabella `soil_memory` - MANCANTE  
- ❌ Colonna `garden_rows.land_zone_id` - MANCANTE

## 🎯 Cosa Devi Fare

### Metodo 1: SQL Editor (CONSIGLIATO - 2 minuti) ✅

#### Passo 1: Apri SQL Editor
Clicca qui: [Supabase SQL Editor](https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor)

#### Passo 2: Apri il file della migrazione
Nel tuo editor di codice, apri:
```
supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql
```

#### Passo 3: Copia TUTTO il contenuto
- Seleziona tutto (Cmd+A o Ctrl+A)
- Copia (Cmd+C o Ctrl+C)

#### Passo 4: Incolla nel SQL Editor
- Vai nel SQL Editor di Supabase
- Incolla il contenuto (Cmd+V o Ctrl+V)

#### Passo 5: Esegui
- Clicca il pulsante "Run" (o premi Cmd+Enter)
- Aspetta qualche secondo

#### Passo 6: Verifica il successo
Dovresti vedere alla fine:
```
✅ Migration completed successfully!
Tables created: land_zones, soil_memory
Column added: garden_rows.land_zone_id
Constraint updated: row_number reusable after archiving
Functions created: get_zone_history, calculate_zone_soil_health, get_zone_rotation_suggestions
```

#### Passo 7: Verifica che funzioni
Torna al terminale ed esegui:
```bash
node verify-migrations-status.mjs
```

Dovresti vedere:
```
✅ MIGRAZIONE APPLICATA CORRETTAMENTE!
```

---

### Metodo 2: Supabase CLI (se installato)

```bash
# 1. Collega il progetto (se non l'hai già fatto)
supabase link --project-ref qhmujoivfxftlrcrluaj

# 2. Applica le migrazioni
supabase db push

# 3. Verifica
node verify-migrations-status.mjs
```

---

## 📊 Cosa Crea la Migrazione

### 1. Tabella `land_zones` (Macro-Zone Stabili)
```sql
- id (UUID)
- garden_id (riferimento al tuo orto)
- zone_name (es. "Zona A 2 ha")
- area_hectares (es. 2.0)
- current_status ('active' o 'resting')
- soil_type, notes
- created_at, updated_at
```

**Esempio d'uso:**
```
Zona A - 2 ha (attiva)   → Coltivi qui quest'anno
Zona B - 2 ha (riposo)   → Riposa quest'anno
```

### 2. Tabella `soil_memory` (Memoria Permanente Terreno)
```sql
- id (UUID)
- land_zone_id (riferimento alla zona)
- crop_name, crop_family, crop_variety
- planting_date, harvest_date
- yield_kg, quality_rating
- nitrogen_impact, organic_matter_added
- diseases_occurred, pests_occurred
- success_score, ai_notes
```

**Esempio d'uso:**
```
Zona A - 2024: Pomodori (Solanacee) - 150kg - ⭐⭐⭐⭐
Zona A - 2023: Fagioli (Leguminose) - 80kg - ⭐⭐⭐⭐⭐
Zona B - 2024: Riposo
Zona B - 2023: Zucchine (Cucurbitacee) - 120kg - ⭐⭐⭐
```

### 3. Modifica `garden_rows` (Filari Temporanei)
```sql
+ land_zone_id (UUID) → Collega filare a zona
+ Constraint univoco su row_number solo per filari attivi
  (permette riutilizzo numeri dopo archiviazione)
```

**Esempio d'uso:**
```
Filare 1 → Zona A → Pomodori → Attivo
Filare 2 → Zona A → Zucchine → Attivo
Filare 3 → Zona A → Fagioli → Archiviato (2023)
```

### 4. Funzioni Helper
- `get_zone_active_field_rows(zone_id)` - Ottieni filari attivi
- `count_zone_active_field_rows(zone_id)` - Conta filari
- `get_zone_history(zone_id, years)` - Storico colture
- `calculate_zone_soil_health(zone_id)` - Salute terreno
- `get_zone_rotation_suggestions(zone_id)` - Suggerimenti AI

### 5. RLS Policies
- 4 policies per `land_zones` (SELECT, INSERT, UPDATE, DELETE)
- 4 policies per `soil_memory` (SELECT, INSERT, UPDATE, DELETE)

---

## 🔄 Workflow Operativo (Dopo la Migrazione)

### Anno 1 (2025):
1. **Crea le zone:**
   - Vai su `/app/garden/zones`
   - Crea "Zona A 2 ha" (stato: attiva)
   - Crea "Zona B 2 ha" (stato: riposo)

2. **Crea i filari:**
   - Vai su `/app/garden/rows`
   - Crea Filare 1, 2, 3... 
   - Assegna tutti a "Zona A"

3. **Coltiva:**
   - Pianta in Zona A
   - Zona B riposa

### Anno 2 (2026):
1. **Chiudi stagione Zona A:**
   - Pulsante "Chiudi Stagione" su Zona A
   - I filari vengono archiviati (is_active=false)
   - Lo storico va in `soil_memory`

2. **Inverti le zone:**
   - Zona A → stato: riposo
   - Zona B → stato: attiva

3. **Crea nuovi filari:**
   - Crea Filare 1, 2, 3... (puoi riusare i numeri!)
   - Assegna tutti a "Zona B"

4. **Coltiva:**
   - Pianta in Zona B
   - Zona A riposa

### Vantaggi:
- ✅ **Non perdi la posizione fisica** (Zone A/B restano stabili)
- ✅ **Non perdi lo storico** (soil_memory conserva tutto)
- ✅ **Puoi riutilizzare i numeri filare** (1, 2, 3...)
- ✅ **Rotazione semplificata** (alterna A/B ogni anno)
- ✅ **AI può suggerire rotazioni** (basandosi sullo storico)

---

## 🎨 UI Disponibili (Dopo la Migrazione)

### 1. Gestione Zone: `/app/garden/zones`
```
┌─────────────────────────────────────┐
│ 🏞️  Macro-Zone Terreno              │
├─────────────────────────────────────┤
│ [+ Crea Nuova Zona]                 │
│                                     │
│ 📍 Zona A - 2 ha                    │
│    Stato: 🟢 Attiva                 │
│    Filari attivi: 15                │
│    Salute terreno: ⭐⭐⭐⭐ (85%)     │
│    [Vedi Storico] [Chiudi Stagione] │
│                                     │
│ 📍 Zona B - 2 ha                    │
│    Stato: 💤 Riposo                 │
│    Filari attivi: 0                 │
│    Salute terreno: ⭐⭐⭐⭐⭐ (95%)    │
│    [Vedi Storico] [Attiva]          │
└─────────────────────────────────────┘
```

### 2. Gestione Filari: `/app/garden/rows`
```
┌─────────────────────────────────────┐
│ 🌱 Filari Campo Aperto              │
├─────────────────────────────────────┤
│ [+ Crea Nuovo Filare]               │
│                                     │
│ Filare 1 - Pomodori                 │
│ 📍 Zona: Zona A                     │
│ 📏 Lunghezza: 50m                   │
│ [Modifica] [Archivia]               │
│                                     │
│ Filare 2 - Zucchine                 │
│ 📍 Zona: Zona A                     │
│ 📏 Lunghezza: 50m                   │
│ [Modifica] [Archivia]               │
│                                     │
│ [☑️ Mostra Archiviati]              │
└─────────────────────────────────────┘
```

### 3. Storico Zona
```
┌─────────────────────────────────────┐
│ 📊 Storico Zona A                   │
├─────────────────────────────────────┤
│ 2024 - Pomodori (Solanacee)         │
│        150kg - ⭐⭐⭐⭐               │
│                                     │
│ 2023 - Fagioli (Leguminose)         │
│        80kg - ⭐⭐⭐⭐⭐              │
│                                     │
│ 2022 - Zucchine (Cucurbitacee)      │
│        120kg - ⭐⭐⭐                │
│                                     │
│ 💡 Suggerimento AI:                 │
│    Pianta Crucifere (cavoli, broccoli)│
│    per bilanciare il terreno        │
└─────────────────────────────────────┘
```

---

## ✅ Checklist Post-Migrazione

Dopo aver applicato la migrazione:

- [ ] Esegui `node verify-migrations-status.mjs` → Vedi "✅ MIGRAZIONE APPLICATA"
- [ ] Vai su `http://localhost:3000/app/garden/zones`
- [ ] Crea "Zona A 2 ha" (attiva)
- [ ] Crea "Zona B 2 ha" (riposo)
- [ ] Vai su `http://localhost:3000/app/garden/rows`
- [ ] Crea un filare di test
- [ ] Assegna il filare a "Zona A"
- [ ] Verifica che tutto funzioni

---

## ❓ Domande Frequenti

**Q: Perdo i filari esistenti?**
A: No! I filari esistenti restano. Semplicemente ora puoi assegnarli a una zona.

**Q: Devo ricreare tutto?**
A: No! Puoi continuare a usare i filari esistenti. La colonna `land_zone_id` è opzionale (NULL).

**Q: Posso annullare la migrazione?**
A: Sì, ma non è necessario. Le nuove tabelle non interferiscono con quelle esistenti.

**Q: Quanto tempo ci vuole?**
A: 2-3 minuti per applicare la migrazione, 5 minuti per creare le prime zone.

---

## 🆘 Problemi?

### Errore: "permission denied"
→ Assicurati di essere loggato come owner del progetto Supabase

### Errore: "relation already exists"
→ La migrazione è già stata applicata! Esegui `node verify-migrations-status.mjs`

### Errore: "syntax error"
→ Assicurati di aver copiato TUTTO il file SQL, dall'inizio alla fine

---

## 📞 Prossimi Passi

Dopo aver applicato la migrazione, dimmi:

1. ✅ "Migrazione applicata!" → Ti guido nell'uso delle zone
2. ❌ "Ho un errore: [messaggio]" → Ti aiuto a risolverlo
3. ❓ "Ho una domanda: [domanda]" → Ti rispondo

---

**Pronto? Apri il SQL Editor e applica la migrazione! 🚀**
