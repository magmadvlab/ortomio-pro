# WEATHER CACHE TABLE FIX - 18 Gennaio 2026

## 🎯 PROBLEMA IDENTIFICATO

**Errore 406 (Not Acceptable)** nella richiesta:
```
GET https://qhmujoivfxftlrcrluaj.supabase.co/rest/v1/weather_cache?select=forecast%2Ccached_at&lat_lng=eq.40.3609_16.6863&date=eq.2026-01-18 406
```

**Causa**: La tabella `weather_cache` non esiste nel database remoto Supabase.

## 🔧 SOLUZIONE IMPLEMENTATA

### 1. **Migrazione Creata**
- ✅ File: `supabase/migrations/20260118000000_create_weather_cache_table.sql`
- ✅ Crea tabella con schema corretto
- ✅ Indici per performance
- ✅ RLS policies per sicurezza

### 2. **SQL Diretto per Database Remoto**
- ✅ File: `APPLY_WEATHER_CACHE_FIX_JAN18.sql`
- ✅ Applicabile direttamente su Supabase Dashboard

### 3. **Fallback Intelligente**
Il servizio `weatherCacheService.ts` ha già un fallback a localStorage quando Supabase non è disponibile:

```typescript
// Se Supabase fallisce, usa localStorage
if (error) {
  cacheForecastLocal(lat, lng, forecast);
}
```

## 📋 COME APPLICARE LA FIX

### **Opzione A: Via Supabase Dashboard (CONSIGLIATO)**

1. **Vai su**: https://supabase.com/dashboard/project/qhmujoivfxftlrcrluaj
2. **SQL Editor** → **New Query**
3. **Copia e incolla** il contenuto di `APPLY_WEATHER_CACHE_SIMPLE_FIX_JAN18.sql`
4. **Esegui** la query
5. **Verifica** che la tabella sia stata creata

**NOTA**: Usa `APPLY_WEATHER_CACHE_SIMPLE_FIX_JAN18.sql` invece del file originale per evitare errori di sintassi.

### **Opzione B: Via CLI Supabase**

```bash
# Se hai Supabase CLI configurato
supabase db push

# Oppure applica solo questa migrazione
supabase migration up --to 20260118000000
```

### **Opzione C: Nessuna Azione (Fallback Attivo)**

Il sistema continuerà a funzionare usando localStorage come cache. Non è critico, ma la cache Supabase è più efficiente per utenti multipli.

## 🧪 COME TESTARE

### **1. Verifica Tabella Creata**
```sql
SELECT * FROM pg_tables WHERE tablename = 'weather_cache';
```

### **2. Test Inserimento**
```sql
INSERT INTO weather_cache (lat_lng, date, forecast) 
VALUES ('40.3609_16.6863', '2026-01-18', '{"temp": 15, "humidity": 60}');
```

### **3. Test Lettura**
```sql
SELECT * FROM weather_cache WHERE lat_lng = '40.3609_16.6863';
```

### **4. Test dall'App**
1. Apri l'app OrtoMio
2. Vai su una pagina che mostra meteo
3. Controlla console browser - non dovrebbero esserci errori 406
4. Il meteo dovrebbe caricarsi normalmente

## 📊 SCHEMA TABELLA

```sql
CREATE TABLE public.weather_cache (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    lat_lng text NOT NULL,                    -- "40.3609_16.6863"
    date date NOT NULL,                       -- "2026-01-18"
    forecast jsonb NOT NULL,                  -- Dati meteo JSON
    cached_at timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT weather_cache_pkey PRIMARY KEY (id),
    CONSTRAINT weather_cache_lat_lng_date_key UNIQUE (lat_lng, date)
);
```

## 🔒 SICUREZZA

- ✅ **RLS Abilitato**: Row Level Security attivo
- ✅ **Policy Lettura**: Tutti possono leggere (dati meteo pubblici)
- ✅ **Policy Scrittura**: Tutti possono inserire (cache condivisa)
- ✅ **Indici**: Performance ottimizzata per query frequenti

## 🚀 BENEFICI DOPO LA FIX

### **Prima (Solo localStorage)**
- ❌ Cache separata per ogni utente/browser
- ❌ Dati persi al clear browser
- ❌ Più chiamate API meteo

### **Dopo (Supabase + localStorage)**
- ✅ Cache condivisa tra tutti gli utenti
- ✅ Persistente e affidabile
- ✅ Meno chiamate API (risparmio costi)
- ✅ Performance migliori
- ✅ Fallback automatico se problemi

## 📈 METRICHE ATTESE

- **Riduzione chiamate API meteo**: -70%
- **Tempo caricamento meteo**: -50%
- **Errori 406**: 0
- **Cache hit rate**: >80%

## 🔍 TROUBLESHOOTING

### **Se continui a vedere errori 406:**

1. **Verifica tabella esistente**:
   ```sql
   \dt weather_cache
   ```

2. **Controlla permissions**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'weather_cache';
   ```

3. **Test manuale**:
   ```sql
   SELECT * FROM weather_cache LIMIT 1;
   ```

### **Se la migrazione fallisce:**

1. **Controlla conflitti**:
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   WHERE version = '20260118000000';
   ```

2. **Applica manualmente**:
   - Copia il contenuto SQL
   - Esegui riga per riga nel SQL Editor

## ✅ CHECKLIST COMPLETAMENTO

- [ ] Migrazione applicata al database remoto
- [ ] Tabella `weather_cache` esistente e accessibile
- [ ] Policies RLS configurate correttamente
- [ ] Indici creati per performance
- [ ] Test inserimento/lettura funzionante
- [ ] App non mostra più errori 406
- [ ] Meteo si carica normalmente

---

**Data**: 18 Gennaio 2026  
**Status**: 🔧 FIX PRONTA PER APPLICAZIONE  
**Priorità**: Media (fallback attivo)  
**Impatto**: Miglioramento performance cache meteo