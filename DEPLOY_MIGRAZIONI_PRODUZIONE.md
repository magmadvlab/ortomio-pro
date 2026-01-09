# 🚀 DEPLOY MIGRAZIONI PRODUZIONE

**Data**: 5 Gennaio 2026  
**Obiettivo**: Deploy sistema orchestratore + tassonomia su database online

## 📋 **CHECKLIST PRE-DEPLOY**

### **✅ Stato Database Locale**
- [x] Sistema orchestratore completo (8 tabelle)
- [x] Sistema tassonomia piante (6 tabelle)
- [x] 19 archetipi configurati
- [x] 16 profili tecnici
- [x] Tutte le migrazioni applicate (26/27)

### **🔍 Verifica Funzionalità**
- [x] Archetipi principali (A1-A12)
- [x] Sub-griglie (L1, L2, L3, L3_*)
- [x] Profili colture
- [x] Funzioni orchestratore
- [x] Trigger automatici

## 🎯 **PIANO DEPLOY**

### **Fase 1: Preparazione Migrazioni Online**
```bash
# 1. Creare migrazioni per database online
cp supabase/migrations/20260105060000_add_plant_taxonomy_system.sql database/migrations_online/
cp supabase/migrations/20260105070000_seed_crop_archetypes.sql database/migrations_online/

# 2. Creare script deploy orchestratore
cat supabase/migrations/20260105000000_add_cultivation_orchestrator.sql \
    supabase/migrations/20260105010000_add_orchestrator_triggers.sql \
    supabase/migrations/20260105020000_add_orchestrator_analytics.sql \
    > database/migrations_online/04_orchestrator_complete.sql
```

### **Fase 2: Deploy Sicuro**
```sql
-- 1. BACKUP DATABASE ONLINE
pg_dump [connection_string] > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

-- 2. APPLICARE MIGRAZIONI IN ORDINE
-- a) Sistema tassonomia
\i database/migrations_online/03_plant_taxonomy.sql
\i database/migrations_online/seed_crop_archetypes.sql

-- b) Sistema orchestratore  
\i database/migrations_online/04_orchestrator_complete.sql

-- c) Sistemi professionali
\i supabase/migrations/20260105030000_add_mechanical_work_register.sql
\i supabase/migrations/20260105040000_add_pro_mode_nutrition_tables.sql
\i supabase/migrations/20260105050000_add_irrigation_system.sql
```

### **Fase 3: Verifica Post-Deploy**
```sql
-- Verificare tabelle create
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'crop_%';

-- Verificare archetipi
SELECT COUNT(*) FROM crop_archetypes;

-- Verificare profili
SELECT COUNT(*) FROM crop_profiles;

-- Verificare orchestratore
SELECT COUNT(*) FROM cultivation_plans;
```

## 📦 **MIGRAZIONI DA APPLICARE ONLINE**

### **Critiche (PRIORITÀ MASSIMA)**
1. **20260105060000_add_plant_taxonomy_system.sql**
   - crop_archetypes
   - crop_profiles  
   - plant_families
   - plant_taxonomy
   - plant_synonyms
   - plant_rules

2. **20260105070000_seed_crop_archetypes.sql**
   - 19 archetipi (A1-A12 + sub-griglie)
   - 16 profili tecnici
   - Relazioni parent-child

### **Sistema Orchestratore**
3. **20260105000000_add_cultivation_orchestrator.sql**
   - cultivation_plans
   - cultivation_statistics
   - cultivation_issues
   - detailed_harvests
   - phase_transitions
   - sapling_inventory
   - cultivation_analytics_dashboard
   - cultivation_dashboard

4. **20260105010000_add_orchestrator_triggers.sql**
   - Trigger automatici
   - Funzioni di automazione

5. **20260105020000_add_orchestrator_analytics.sql**
   - Sistema analytics
   - Dashboard metriche

### **Sistemi Professionali**
6. **20260105030000_add_mechanical_work_register.sql**
7. **20260105040000_add_pro_mode_nutrition_tables.sql**
8. **20260105050000_add_irrigation_system.sql**

## 🔧 **SCRIPT DEPLOY AUTOMATICO**

```bash
#!/bin/bash
# deploy_to_production.sh

echo "🚀 DEPLOY ORTOMIO PRO - SISTEMA COMPLETO"
echo "========================================"

# Variabili
ONLINE_DB_URL="[URL_DATABASE_ONLINE]"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 1. Backup
echo "📦 Creando backup..."
mkdir -p $BACKUP_DIR
pg_dump $ONLINE_DB_URL > $BACKUP_DIR/backup_pre_deploy_$DATE.sql

# 2. Deploy tassonomia
echo "🌱 Applicando sistema tassonomia..."
psql $ONLINE_DB_URL -f supabase/migrations/20260105060000_add_plant_taxonomy_system.sql
psql $ONLINE_DB_URL -f supabase/migrations/20260105070000_seed_crop_archetypes.sql

# 3. Deploy orchestratore
echo "🎯 Applicando sistema orchestratore..."
psql $ONLINE_DB_URL -f supabase/migrations/20260105000000_add_cultivation_orchestrator.sql
psql $ONLINE_DB_URL -f supabase/migrations/20260105010000_add_orchestrator_triggers.sql
psql $ONLINE_DB_URL -f supabase/migrations/20260105020000_add_orchestrator_analytics.sql

# 4. Deploy sistemi professionali
echo "⚙️ Applicando sistemi professionali..."
psql $ONLINE_DB_URL -f supabase/migrations/20260105030000_add_mechanical_work_register.sql
psql $ONLINE_DB_URL -f supabase/migrations/20260105040000_add_pro_mode_nutrition_tables.sql
psql $ONLINE_DB_URL -f supabase/migrations/20260105050000_add_irrigation_system.sql

# 5. Verifica
echo "✅ Verificando deploy..."
psql $ONLINE_DB_URL -c "SELECT COUNT(*) as archetipi FROM crop_archetypes;"
psql $ONLINE_DB_URL -c "SELECT COUNT(*) as profili FROM crop_profiles;"
psql $ONLINE_DB_URL -c "SELECT COUNT(*) as piani FROM cultivation_plans;"

echo "🎉 Deploy completato!"
```

## ⚠️ **ATTENZIONI CRITICHE**

### **Prima del Deploy**
- [ ] **BACKUP COMPLETO** database online
- [ ] **TEST** su database di staging
- [ ] **VERIFICA** compatibilità versioni PostgreSQL
- [ ] **CONTROLLO** spazio disco disponibile

### **Durante il Deploy**
- [ ] **MODALITÀ MANUTENZIONE** attiva
- [ ] **MONITORAGGIO** log errori
- [ ] **ROLLBACK PLAN** pronto
- [ ] **COMUNICAZIONE** team

### **Dopo il Deploy**
- [ ] **VERIFICA FUNZIONALITÀ** complete
- [ ] **TEST PERFORMANCE** query complesse
- [ ] **CONTROLLO RLS** policies
- [ ] **VALIDAZIONE DATI** archetipi/profili

## 🎯 **RISULTATO ATTESO**

Dopo il deploy, il database online avrà:

### **Tabelle Totali**: ~75 tabelle
- 63 tabelle esistenti
- 8 tabelle orchestratore
- 6 tabelle tassonomia
- 3 tabelle sistemi professionali

### **Funzionalità Complete**
- ✅ Sistema orchestratore automazione
- ✅ Tassonomia piante con ricerca fuzzy
- ✅ 19 archetipi configurati
- ✅ Analytics professionali
- ✅ Gestione irrigazione avanzata
- ✅ Registro trattamenti completo

### **Performance**
- ✅ Indici ottimizzati per ricerche
- ✅ Trigger automatici per consistenza
- ✅ RLS policies per sicurezza
- ✅ Funzioni SQL ottimizzate

---

**🚨 IMPORTANTE**: Eseguire il deploy in orario di bassa attività e con team di supporto disponibile per eventuali rollback.