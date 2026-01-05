# 🚀 DEPLOY MIGRAZIONI PRODUZIONE - ORCHESTRATORE

## 📋 **MIGRAZIONI DA APPLICARE AL DATABASE ONLINE**

### **ORDINE DI ESECUZIONE** (CRITICO!)

1. **Base Orchestratore** - `20260105000000_add_cultivation_orchestrator.sql`
2. **Trigger e Automazioni** - `20260105010000_add_orchestrator_triggers.sql`  
3. **Analytics** - `20260105020000_add_orchestrator_analytics.sql`

### **METODO 1: Supabase Dashboard**

1. Vai su [supabase.com](https://supabase.com) → Il tuo progetto OrtoMio
2. **SQL Editor** → **New Query**
3. Copia e incolla il contenuto di ogni migrazione **IN ORDINE**
4. Esegui una alla volta e verifica successo

### **METODO 2: CLI (se configurato)**

```bash
# Se hai supabase CLI collegato al progetto online
supabase db push --project-ref YOUR_PROJECT_REF
```

### **METODO 3: Manuale via psql**

```bash
# Sostituisci con i tuoi dati di connessione produzione
psql -h YOUR_DB_HOST -p 5432 -U postgres -d postgres -f supabase/migrations/20260105000000_add_cultivation_orchestrator.sql
psql -h YOUR_DB_HOST -p 5432 -U postgres -d postgres -f supabase/migrations/20260105010000_add_orchestrator_triggers.sql
psql -h YOUR_DB_HOST -p 5432 -U postgres -d postgres -f supabase/migrations/20260105020000_add_orchestrator_analytics.sql
```

## ✅ **VERIFICHE POST-MIGRAZIONE**

### **1. Controlla Tabelle Create**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cultivation%'
ORDER BY table_name;

-- Dovrebbe restituire:
-- cultivation_analytics_dashboard
-- cultivation_dashboard  
-- cultivation_issues
-- cultivation_plans
-- cultivation_statistics
```

### **2. Controlla Funzioni**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%cultivation%'
ORDER BY routine_name;

-- Dovrebbe restituire:
-- advance_cultivation_phase
-- advance_cultivation_phase_validated
-- calculate_cultivation_statistics
-- get_available_materials
-- get_recurring_issues
```

### **3. Test Funzionalità**
```sql
-- Test validazione fasi
SELECT is_valid_phase_transition('sowing', 'germination'); -- TRUE
SELECT is_valid_phase_transition('sowing', 'harvesting');  -- FALSE

-- Test materiali disponibili (con garden ID reale)
SELECT get_available_materials('YOUR_GARDEN_UUID', 'A1');
```

### **4. Verifica RLS Policies**
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'cultivation%';

-- Tutte le tabelle dovrebbero avere rowsecurity = true
```

## 🎯 **RISULTATO ATTESO**

Dopo le migrazioni avrai:

- ✅ **8 nuove tabelle** per orchestratore completo
- ✅ **12 funzioni** per automazioni e validazioni  
- ✅ **6 trigger automatici** per consumo materiali
- ✅ **2 dashboard** per monitoraggio e analytics
- ✅ **Sistema completo** tracciabilità seme → raccolta

## 🚨 **IN CASO DI ERRORI**

### **Errore: Tabella già esistente**
```sql
-- Controlla se tabelle esistono già
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('cultivation_plans', 'sapling_inventory');

-- Se esistono, potrebbero essere versioni precedenti
-- Valuta se fare DROP o ALTER per allineare
```

### **Errore: Funzione già esistente**
```sql
-- Le migrazioni hanno IF NOT EXISTS, ma se ci sono conflitti:
DROP FUNCTION IF EXISTS advance_cultivation_phase CASCADE;
-- Poi ri-esegui la migrazione
```

### **Errore: RLS Policy**
```sql
-- Se ci sono conflitti con policy esistenti:
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- Poi ri-esegui la migrazione
```

## 📞 **SUPPORTO**

Se incontri problemi:
1. Controlla i log di errore completi
2. Verifica che l'utente abbia permessi CREATE
3. Controlla che non ci siano conflitti con tabelle esistenti
4. Testa su database di staging prima di produzione

---

**⚠️ IMPORTANTE**: Fai sempre un backup del database prima di applicare le migrazioni in produzione!

**🎯 OBIETTIVO**: Sistema orchestratore completo funzionante in produzione per gestire l'intero ciclo di coltivazione OrtoMio.