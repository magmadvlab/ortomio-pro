# 🔍 Verifica Migrazioni Supabase - Land Zones

## ⚠️ IMPORTANTE: Sicurezza Password

**NON condividere MAI la password del database pubblicamente!**

Ho rimosso la password dalla conversazione per sicurezza. Se l'hai condivisa, cambiala immediatamente:
1. Vai su: https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/settings/database
2. Clicca "Reset database password"
3. Salva la nuova password in modo sicuro

---

## 📋 Come Verificare le Migrazioni

### Metodo 1: SQL Editor (CONSIGLIATO) ✅

1. **Apri il SQL Editor di Supabase:**
   ```
   https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj/editor
   ```

2. **Copia e incolla il contenuto del file:**
   ```
   verify-land-zones-migration.sql
   ```

3. **Esegui la query** (pulsante "Run" o Cmd+Enter)

4. **Controlla i risultati:**
   - ✅ Dovresti vedere 2 tabelle: `land_zones`, `soil_memory`
   - ✅ Colonna `land_zone_id` in `garden_rows`
   - ✅ 5 funzioni helper
   - ✅ 8 RLS policies

---

### Metodo 2: Applicare la Migrazione

Se le tabelle NON esistono, devi applicare la migrazione:

1. **Apri il SQL Editor di Supabase**

2. **Copia e incolla il contenuto del file:**
   ```
   supabase/migrations/20260204120000_add_land_zones_and_soil_memory.sql
   ```

3. **Esegui la migrazione** (pulsante "Run")

4. **Verifica il successo:**
   - Dovresti vedere il messaggio: "✅ Migration completed successfully!"

---

### Metodo 3: Supabase CLI (Locale)

Se hai Supabase CLI installato:

```bash
# 1. Collega il progetto (se non l'hai già fatto)
supabase link --project-ref qhmujoivfxftlrcrluaj

# 2. Applica le migrazioni
supabase db push

# 3. Verifica lo stato
supabase migration list
```

---

## 🎯 Cosa Controlla la Verifica

### 1. Tabelle Create
- ✅ `land_zones` - Macro-zone stabili (es. "Zona A 2 ha", "Zona B 2 ha")
- ✅ `soil_memory` - Memoria permanente del terreno

### 2. Modifiche a Tabelle Esistenti
- ✅ `garden_rows.land_zone_id` - Collega filari temporanei a zone stabili
- ✅ Constraint univoco su `row_number` solo per filari attivi (permette riutilizzo)

### 3. Funzioni Helper
- ✅ `get_zone_active_field_rows()` - Ottieni filari attivi di una zona
- ✅ `count_zone_active_field_rows()` - Conta filari attivi
- ✅ `get_zone_history()` - Storico colture zona
- ✅ `calculate_zone_soil_health()` - Calcola salute terreno
- ✅ `get_zone_rotation_suggestions()` - Suggerimenti rotazione

### 4. RLS Policies
- ✅ 4 policies per `land_zones` (SELECT, INSERT, UPDATE, DELETE)
- ✅ 4 policies per `soil_memory` (SELECT, INSERT, UPDATE, DELETE)

---

## 📊 Risultati Attesi

### Se la migrazione È applicata:
```
✅ 2 tabelle trovate
✅ 1 colonna aggiunta
✅ 1 constraint creato
✅ 5 funzioni create
✅ 8 policies attive
```

### Se la migrazione NON è applicata:
```
❌ Tabelle mancanti: land_zones, soil_memory
❌ Colonna mancante: garden_rows.land_zone_id
```

---

## 🚀 Prossimi Passi

### Se la migrazione è OK:
1. Vai su `/app/garden/zones` per creare le tue macro-zone
2. Crea "Zona A 2 ha" e "Zona B 2 ha"
3. Assegna i filari alle zone quando li crei

### Se la migrazione NON è applicata:
1. Applica la migrazione usando il Metodo 2 sopra
2. Poi verifica di nuovo con il Metodo 1

---

## 💡 Domande Frequenti

**Q: Perdo i dati esistenti?**
A: No! La migrazione usa `IF NOT EXISTS` e `ADD COLUMN IF NOT EXISTS`. È sicura.

**Q: Posso annullare la migrazione?**
A: Sì, ma non è necessario. Le tabelle nuove non interferiscono con quelle esistenti.

**Q: Devo riavviare l'app?**
A: No, le modifiche al database sono immediate.

---

## 📞 Cosa Fare Dopo

Dopo aver verificato, dimmi:
1. ✅ "Le tabelle esistono" → Possiamo procedere con l'uso
2. ❌ "Le tabelle non esistono" → Applico la migrazione per te
3. ⚠️ "Ho un errore" → Mandami lo screenshot dell'errore
