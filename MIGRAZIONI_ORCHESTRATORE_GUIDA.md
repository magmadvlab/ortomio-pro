# 🚀 GUIDA MIGRAZIONI ORCHESTRATORE COLTIVAZIONE

## 📋 **MIGRAZIONI DA ESEGUIRE**

### **1. Migrazione Base** 
```sql
-- File: supabase/migrations/20260105000000_add_cultivation_orchestrator.sql
-- Crea: cultivation_plans, sapling_inventory, phase_transitions
-- Aggiunge: funzioni base, RLS policies, indici
```

### **2. Migrazione Trigger**
```sql
-- File: supabase/migrations/20260105010000_add_orchestrator_triggers.sql  
-- Crea: trigger automatici, validazioni, dashboard view
-- Aggiunge: automazioni consumo semi/alberelli
```

### **3. Migrazione Analytics**
```sql
-- File: supabase/migrations/20260105020000_add_orchestrator_analytics.sql
-- Crea: cultivation_statistics, cultivation_issues, detailed_harvests
-- Aggiunge: funzioni analytics, report problemi ricorrenti
```

## 🔧 **COME ESEGUIRE**

### **Opzione A: Supabase Dashboard**
1. Vai su [supabase.com](https://supabase.com) → Il tuo progetto
2. SQL Editor → New Query
3. Copia e incolla il contenuto di ogni migrazione **in ordine**
4. Esegui una alla volta

### **Opzione B: CLI Locale**
```bash
cd /Users/magma/Downloads/ortomio-main
supabase db push
```

### **Opzione C: Manuale**
```bash
# 1. Migrazione base
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/20260105000000_add_cultivation_orchestrator.sql

# 2. Trigger
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/20260105010000_add_orchestrator_triggers.sql

# 3. Analytics  
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/20260105020000_add_orchestrator_analytics.sql
```

## 📊 **COSA VIENE CREATO**

### **Tabelle Principali**
- ✅ `cultivation_plans` - Piano maestro coltivazione
- ✅ `phase_transitions` - Log dettagliato ogni transizione
- ✅ `sapling_inventory` - Inventario alberelli (frutteti/oliveti)
- ✅ `cultivation_statistics` - Statistiche aggregate
- ✅ `cultivation_issues` - Tracking problemi ricorrenti
- ✅ `detailed_harvests` - Raccolti dettagliati

### **Funzioni Automatiche**
- ✅ `advance_cultivation_phase_validated()` - Avanza fase con validazioni
- ✅ `get_available_materials()` - Materiali disponibili per archetipo
- ✅ `calculate_cultivation_statistics()` - Calcola statistiche periodiche
- ✅ `get_recurring_issues()` - Report problemi ricorrenti

### **Trigger Automatici**
- ✅ Auto-consumo semi quando crei piano
- ✅ Auto-scala alberelli quando pianti
- ✅ Auto-aggiorna quantità su transizioni
- ✅ Auto-calcola statistiche su raccolto

### **View Dashboard**
- ✅ `cultivation_dashboard` - Vista completa piani attivi
- ✅ `cultivation_analytics_dashboard` - Analytics e performance

## 🔗 **RELAZIONI CREATE**

```
cultivation_plans (CENTRO)
├── user_id → auth.users
├── garden_id → gardens  
├── seed_inventory_id → seed_inventory
├── seedling_batch_id → seedling_batches
├── sapling_inventory_id → sapling_inventory
└── phase_transitions[] (1:N)

phase_transitions
├── cultivation_plan_id → cultivation_plans
└── [log completo ogni cambio fase]

sapling_inventory (NUOVO)
├── user_id → auth.users
├── garden_id → gardens
└── [gestione alberelli frutteti/oliveti]

cultivation_statistics
├── user_id → auth.users
├── garden_id → gardens
└── [metriche aggregate per archetipo]

cultivation_issues
├── cultivation_plan_id → cultivation_plans
└── [tracking problemi e risoluzioni]

detailed_harvests
├── cultivation_plan_id → cultivation_plans
└── [raccolti dettagliati con qualità]
```

## 🎯 **ESEMPI UTILIZZO POST-MIGRAZIONE**

### **1. Crea Piano da Seme**
```sql
SELECT * FROM get_available_materials('garden-uuid', 'A1');

INSERT INTO cultivation_plans (
    user_id, garden_id, archetype_id, plant_name,
    starting_material, seed_inventory_id, current_phase
) VALUES (
    'user-uuid', 'garden-uuid', 'A1', 'Pomodoro',
    'seed', 'seed-uuid', 'sowing'
);
-- ✅ Trigger auto-consuma semi
```

### **2. Avanza Fase**
```sql
SELECT advance_cultivation_phase_validated(
    'plan-uuid',
    'germination',
    'Indoor',
    8, -- quantità dopo germinazione
    'Germinati 8 su 10 semi',
    '["foto1.jpg"]'::jsonb
);
-- ✅ Validazione automatica
-- ✅ Log in phase_transitions
-- ✅ Aggiornamento cultivation_plans
```

### **3. Dashboard Completa**
```sql
SELECT * FROM cultivation_dashboard 
WHERE user_id = 'user-uuid' 
AND is_active = true;
-- ✅ Vista completa tutti i piani attivi
```

### **4. Analytics Performance**
```sql
SELECT calculate_cultivation_statistics('user-uuid');
SELECT * FROM cultivation_analytics_dashboard;
-- ✅ Statistiche automatiche
-- ✅ Confronti con media
-- ✅ Trend temporali
```

## ⚠️ **VERIFICHE POST-MIGRAZIONE**

### **1. Controlla Tabelle**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'cultivation%';
```

### **2. Controlla Funzioni**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%cultivation%';
```

### **3. Controlla RLS**
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'cultivation%';
```

### **4. Test Funzionalità**
```sql
-- Test materiali disponibili
SELECT get_available_materials('test-garden', 'A1');

-- Test validazione fasi
SELECT is_valid_phase_transition('sowing', 'germination'); -- TRUE
SELECT is_valid_phase_transition('sowing', 'harvesting');  -- FALSE
```

## 🎉 **RISULTATO FINALE**

Dopo le migrazioni avrai:

✅ **Sistema Orchestrato Completo**
- Tracciamento ciclo vita completo
- Relazioni forti tra tutte le banche
- Automazioni intelligenti
- Analytics avanzate

✅ **Database Strutturato**
- Ogni passo registrato
- Statistiche automatiche  
- Report problemi ricorrenti
- Performance tracking

✅ **Scalabilità**
- Supporta orto, frutteto, oliveto
- Gestisce semi, piantine, alberelli
- Estendibile per nuovi archetipi

Il sistema è ora **production-ready** per gestire l'intero ciclo di coltivazione! 🌱✨