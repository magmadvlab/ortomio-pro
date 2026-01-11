# 🔍 Database Real Issues Check - OrtoMio PRO

## Possibili Problemi Reali nel Database

Anche se abbiamo risolto gli errori del linter Supabase, potrebbero esistere ancora problemi pratici che impediscono all'app di funzionare correttamente.

### 🚨 **Problemi Critici Possibili**

#### **1. Tabelle Mancanti**
Le nuove funzionalità richiedono tabelle che potrebbero non essere state create:

```sql
-- Tabelle critiche che DEVONO esistere:
- prescription_maps
- prescription_zones  
- prescription_map_exports
- garden_plants
- plant_operations
- plant_harvests
- operation_sync_log
```

**Sintomo**: Errori 404 o "relation does not exist" quando si accede alle nuove funzionalità.

#### **2. Colonne Mancanti per Row Tracking**
Il row tracking richiede colonne specifiche:

```sql
-- Colonne che DEVONO esistere:
watering_logs.field_row_id
nutrition_logs.field_row_id
mechanical_work_logs.field_row_id
garden_plants.plant_code
garden_plants.row_id
garden_plants.field_row_id
```

**Sintomo**: Errori quando si prova a salvare operazioni con row tracking.

#### **3. View Mancanti o Corrotte**
Le view potrebbero non essere state ricreate correttamente:

```sql
-- View critiche:
individual_plants
plant_operations_complete
plant_production_summary
plants_per_row_summary
row_health_summary
```

**Sintomo**: Errori nelle pagine che mostrano statistiche piante o operazioni.

#### **4. RLS Policies Mancanti**
Senza RLS policies, gli utenti potrebbero vedere dati di altri utenti:

```sql
-- Policy che DEVONO esistere:
prescription_maps: "Users can view their own prescription maps"
garden_plants: "Users can view their own garden plants"
plant_operations: "Users can view their own plant operations"
```

**Sintomo**: Dati vuoti o errori di permessi.

#### **5. Foreign Key Constraints Rotte**
Le relazioni tra tabelle potrebbero essere inconsistenti:

```sql
-- Relazioni critiche:
garden_plants.garden_id -> gardens.id
garden_plants.row_id -> garden_rows.id
garden_plants.field_row_id -> field_rows.id
plant_operations.plant_id -> garden_plants.id
prescription_zones.prescription_map_id -> prescription_maps.id
```

**Sintomo**: Errori quando si prova a creare relazioni o dati orfani.

### 🧪 **Come Verificare i Problemi**

#### **Step 1: Esegui Check Completo**
```sql
-- Esegui questo file per verificare tutto:
check_app_breaking_issues.sql
```

#### **Step 2: Controlla Errori Specifici**
```sql
-- Per problemi dettagliati:
check_db_issues.sql
```

#### **Step 3: Test Funzionalità App**
1. **Prescription Maps**: Vai a `/app/prescription-maps`
2. **Plant Tracking**: Vai a `/app/plants`
3. **NDVI**: Vai a `/app/ndvi`
4. **Irrigation**: Vai a `/app/irrigation`

### 🔧 **Soluzioni per Problemi Comuni**

#### **Se Tabelle Mancanti**
```sql
-- Applica migrazioni in ordine:
20260111260000_minimal_safe_migration.sql
20260111270000_fix_security_issues.sql
20260111280000_final_security_definer_fix.sql
```

#### **Se Colonne Mancanti**
```sql
-- Aggiungi colonne row tracking:
ALTER TABLE watering_logs ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id);
ALTER TABLE nutrition_logs ADD COLUMN IF NOT EXISTS field_row_id UUID REFERENCES field_rows(id);
```

#### **Se View Mancanti**
```sql
-- Ricrea view critiche:
DROP VIEW IF EXISTS individual_plants CASCADE;
CREATE VIEW individual_plants AS SELECT * FROM garden_plants;
```

#### **Se RLS Mancante**
```sql
-- Abilita RLS:
ALTER TABLE prescription_maps ENABLE ROW LEVEL SECURITY;
-- Crea policy:
CREATE POLICY "Users can view their own prescription maps" ON prescription_maps
    FOR SELECT USING (garden_id IN (SELECT g.id FROM gardens g WHERE g.user_id = auth.uid()));
```

### 🎯 **Problemi Più Probabili**

#### **1. Migrazioni Non Applicate** (90% probabilità)
- Le nuove tabelle non sono state create nel database online
- Soluzione: Applicare tutte le migrazioni in ordine

#### **2. RLS Policies Mancanti** (70% probabilità)  
- Le tabelle esistono ma senza protezione RLS
- Soluzione: Applicare migrazione security fix

#### **3. View Corrotte** (60% probabilità)
- Le view esistono ma con SECURITY DEFINER
- Soluzione: Ricreare view senza SECURITY DEFINER

#### **4. Dati Inconsistenti** (40% probabilità)
- Foreign key constraints violate
- Soluzione: Cleanup dati orfani

#### **5. Permessi Mancanti** (30% probabilità)
- L'utente authenticated non ha accesso
- Soluzione: Grant permessi corretti

### 📋 **Checklist Diagnostica**

```
□ Esegui check_app_breaking_issues.sql
□ Verifica che tutte le migrazioni siano applicate
□ Controlla che le view esistano e siano accessibili
□ Testa accesso alle nuove pagine dell'app
□ Verifica che i dati si salvino correttamente
□ Controlla che non ci siano errori nella console browser
□ Testa che gli utenti vedano solo i propri dati
```

### 🚨 **Red Flags da Cercare**

- **Errore**: "relation 'prescription_maps' does not exist"
- **Errore**: "column 'field_row_id' does not exist"  
- **Errore**: "permission denied for table"
- **Errore**: "view 'individual_plants' does not exist"
- **Comportamento**: Dati vuoti nelle nuove sezioni
- **Comportamento**: Errori quando si salva

### 💡 **Prossimi Passi**

1. **Esegui i check SQL** per identificare problemi specifici
2. **Applica le migrazioni mancanti** se necessario
3. **Testa l'app** per verificare che tutto funzioni
4. **Riporta errori specifici** se ne trovi

I file di check sono pronti per identificare esattamente quali problemi esistono nel database reale! 🔍