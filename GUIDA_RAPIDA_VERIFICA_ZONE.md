# 🎯 Guida Rapida: Verifica Sistema Zone

## 🔍 Verifica in 3 Passi

### Passo 1: Apri SQL Editor
```
https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor
```

### Passo 2: Esegui Query Veloce
Copia e incolla questa query:

```sql
-- Query veloce per verificare tutto
SELECT 
  'land_zones' as tabella,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'land_zones'
  ) THEN '✅ ESISTE' ELSE '❌ MANCANTE' END as stato
UNION ALL
SELECT 
  'soil_memory' as tabella,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'soil_memory'
  ) THEN '✅ ESISTE' ELSE '❌ MANCANTE' END as stato
UNION ALL
SELECT 
  'garden_rows.land_zone_id' as tabella,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'garden_rows' 
    AND column_name = 'land_zone_id'
  ) THEN '✅ ESISTE' ELSE '❌ MANCANTE' END as stato;
```

### Passo 3: Leggi il Risultato

#### ✅ Risultato OK (tutto funziona):
```
tabella                    | stato
---------------------------|-------------
land_zones                 | ✅ ESISTE
soil_memory                | ✅ ESISTE
garden_rows.land_zone_id   | ✅ ESISTE
```

**→ Sei pronto! Vai su `/app/garden/zones` e crea le tue zone**

---

#### ❌ Risultato KO (migrazione mancante):
```
tabella                    | stato
---------------------------|-------------
land_zones                 | ❌ MANCANTE
soil_memory                | ❌ MANCANTE
garden_rows.land_zone_id   | ❌ MANCANTE
```

**→ Devi applicare la migrazione (vedi sotto)**

---

## 🔧 Applicare la Migrazione (se mancante)

### Opzione A: SQL Editor (Veloce)

1. Apri il file: `supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql`
2. Copia TUTTO il contenuto
3. Incolla nel SQL Editor di Supabase
4. Clicca "Run" (o Cmd+Enter)
5. Aspetta il messaggio: "✅ Migration completed successfully!"

### Opzione B: Supabase CLI (se installato)

```bash
supabase db push
```

---

## 🎨 Cosa Ottieni

### 1. Macro-Zone Stabili (`land_zones`)
```
Zona A - 2 ha (attiva)
Zona B - 2 ha (riposo)
```

### 2. Filari Temporanei (`garden_rows`)
```
Filare 1 → Zona A
Filare 2 → Zona A
Filare 3 → Zona A
...
```

### 3. Memoria Terreno (`soil_memory`)
```
Zona A - 2024: Pomodori (famiglia Solanacee)
Zona A - 2023: Fagioli (famiglia Leguminose)
Zona B - 2024: Riposo
Zona B - 2023: Zucchine (famiglia Cucurbitacee)
```

---

## 🔄 Workflow Operativo

### Anno 1:
1. Crea "Zona A 2 ha" (attiva) e "Zona B 2 ha" (riposo)
2. Crea filari e assegnali a Zona A
3. Coltiva in Zona A, Zona B riposa

### Anno 2:
1. Archivia filari Zona A (pulsante "Chiudi Stagione")
2. Cambia stato: Zona A → riposo, Zona B → attiva
3. Crea nuovi filari e assegnali a Zona B
4. Coltiva in Zona B, Zona A riposa

### Vantaggi:
- ✅ Non perdi la posizione fisica (Zona A/B restano)
- ✅ Non perdi lo storico (soil_memory conserva tutto)
- ✅ Puoi riutilizzare i numeri filare (1, 2, 3...)
- ✅ Rotazione semplificata (alterna A/B ogni anno)

---

## 📱 Test Rapido UI

Dopo aver verificato il database:

1. **Vai su:** `http://localhost:3000/app/garden/zones`
2. **Dovresti vedere:**
   - Pulsante "Crea Nuova Zona"
   - Lista zone (vuota se è la prima volta)
3. **Crea una zona di test:**
   - Nome: "Zona Test"
   - Area: 2 ha
   - Stato: Attiva
4. **Vai su:** `http://localhost:3000/app/garden/rows`
5. **Crea un filare:**
   - Dovresti vedere dropdown "Assegna a Zona"
   - Seleziona "Zona Test"

---

## ❓ Cosa Mi Serve da Te

Dimmi semplicemente:

1. **"✅ Tutto OK"** → Le tabelle esistono, posso usare le zone
2. **"❌ Tabelle mancanti"** → Devo applicare la migrazione
3. **"⚠️ Errore: [messaggio]"** → C'è un problema, mandami lo screenshot

---

## 🚀 Link Utili

- **SQL Editor:** https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor
- **Database Settings:** https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/settings/database
- **Table Editor:** https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor

---

## 💡 Pro Tip

Se vuoi vedere i dati direttamente nel Table Editor:

1. Vai su: https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor
2. Clicca su "Tables" nella sidebar
3. Cerca "land_zones" e "soil_memory"
4. Se le vedi → ✅ Migrazione applicata!
5. Se non le vedi → ❌ Devi applicare la migrazione
