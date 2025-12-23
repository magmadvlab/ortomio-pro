# Guida Migrazioni Database Online

Questa guida spiega come applicare le migrazioni database su Supabase online in modo sicuro e organizzato.

## Panoramica

Le migrazioni sono organizzate in **19 gruppi logici** che devono essere applicati in ordine:

1. **01_core_schema.sql** - Schema base (DEVE essere eseguito per primo)
2. **02_user_profiles.sql** - Sistema profili utente e tier
3. **03_plant_taxonomy.sql** - Sistema tassonomia piante (tabelle)
4. **03b_plant_taxonomy_seed.sql** - Seed dati tassonomia (dopo 03)
5. **04_garden_features.sql** - Feature avanzate giardini
6. **05_irrigation_system.sql** - Sistema irrigazione
7. **06_sapling_seedling.sql** - Gestione semenzai e alberelli
8. **07_advanced_features.sql** - Feature avanzate PRO
9. **08_performance_fixes.sql** - Fix performance e ottimizzazioni
10. **09_tier_system.sql** - Sistema tier e migrazione
11. **10_add_zone_id_to_garden_tasks.sql** - Aggiunge supporto precision agriculture zones ai task
12. **11_add_completion_date_index.sql** - Indice per ottimizzare query su date completamento
13. **12_add_notification_preferences.sql** - Tabella preferenze notifiche utente
14. **13_fix_function_search_path_security.sql** - Corregge search_path mutabile su funzioni per sicurezza
15. **14_fix_rls_performance.sql** - Corregge performance RLS policies sostituendo auth.uid() con (select auth.uid())
16. **15_add_missing_foreign_key_indexes.sql** - Aggiunge indici mancanti su foreign key per performance
17. **16_improve_seed_inventory_quantity.sql** - Migliora banca dei semi con supporto quantità flessibili (range, numeri grandi)
18. **17_add_sowing_details_to_tasks.sql** - Aggiunge tracking dettagliato semina/germinazione (vassoi, piantine attese, area)
19. **18_add_task_scheduling_fields.sql** - Aggiunge schedulizzazione task (pianificazione date future, ricorrenze)

## Prerequisiti

1. **Backup Database**: Prima di applicare qualsiasi migrazione, fai un backup completo del database Supabase
2. **Accesso SQL Editor**: Accedi al SQL Editor di Supabase
3. **Verifica Estensioni**: Assicurati che le estensioni necessarie siano abilitate:
   - `uuid-ossp` (per UUID)
   - `pg_trgm` (per fuzzy search)

## Ordine di Esecuzione

### Fase 1: Schema Base (OBBLIGATORIO)

1. **01_core_schema.sql**
   - Crea tutte le tabelle base
   - Crea RLS policies base
   - Crea funzioni e trigger base
   - ⚠️ **DEVE essere eseguito per primo**

### Fase 2: User & Profiles

2. **02_user_profiles.sql**
   - Crea tabella `profiles`
   - Configura RLS per profili

### Fase 3: Plant Taxonomy

3. **03_plant_taxonomy.sql**
   - Crea tabelle: `crop_archetypes`, `crop_profiles`, `plant_families`, `plant_taxonomy`, `plant_synonyms`, `plant_rules`
   - Crea funzioni di ricerca fuzzy
   - ⚠️ **Richiede estensione `pg_trgm`**

4. **03b_plant_taxonomy_seed.sql**
   - Popola dati iniziali (famiglie, piante, sinonimi)
   - ⚠️ **Eseguire DOPO 03_plant_taxonomy.sql**

### Fase 4: Garden Features

5. **04_garden_features.sql**
   - Crea tabelle: `garden_zone_memories`, `garden_tree_memories`, `garden_patterns`, `garden_correlations`, `garden_season_analyses`
   - Crea tabelle: `garden_obstacles`, `garden_accessories`, `hydroponic_readings`, `aquaponic_readings`
   - Crea tabelle: `custom_plans`, `agronomists`, `agronomist_consultations`, `agronomist_advice`
   - Aggiunge colonne a `gardens`: `orchard_config`, `olive_grove_config`, `vineyard_config`

### Fase 5: Irrigation System

6. **05_irrigation_system.sql**
   - Crea tabelle: `irrigation_systems`, `irrigation_zones`, `irrigation_components`, `watering_logs`
   - Configura RLS per sistema irrigazione

### Fase 6: Sapling & Seedling

7. **06_sapling_seedling.sql**
   - Crea/verifica tabella `seedling_batches`
   - ⚠️ **Nota**: Questa tabella è già nello schema base, questo file è per completezza

### Fase 7: Advanced Features

8. **07_advanced_features.sql**
   - Crea tabelle: `fertilizer_inventory`, `phyto_inventory`, `treatment_registry`
   - Crea tabelle: `mechanical_work_register`, `crop_mechanical_works`
   - Crea tabelle: `custom_crops`, `crop_learning_events`
   - Aggiunge colonne a `profiles`: `pesticide_license_number`, `pesticide_license_expiry`, `preferred_treatment_type`

### Fase 8: Performance & Fixes

9. **08_performance_fixes.sql**
   - Aggiunge colonne `normalized_name` e `normalized_alias` per ricerca fuzzy veloce
   - Ottimizza tutte le RLS policies per performance
   - Fix funzioni con `SET search_path = ''`
   - ⚠️ **Eseguire DOPO tutte le altre migrazioni**

### Fase 9: Tier System

10. **09_tier_system.sql**
   - Migra da 4-tier a 3-tier system (FREE, PLUS, PRO)
   - Aggiorna constraint su `profiles.tier`
   - ⚠️ **Eseguire DOPO 02_user_profiles.sql**

### Fase 10: Precision Agriculture Zones

11. **10_add_zone_id_to_garden_tasks.sql**
   - Aggiunge colonna `zone_id` a `garden_tasks` per supporto precision agriculture
   - Gestisce il caso in cui `garden_zones` non esiste ancora (aggiunge solo colonna senza FK)
   - Crea indice `idx_garden_tasks_zone_id` per ottimizzare query
   - ⚠️ **Eseguire DOPO 01_core_schema.sql e 04_garden_features.sql**
   - ⚠️ **Se `garden_zones` viene aggiunta successivamente, aggiungere manualmente la FK**

### Fase 11: Ottimizzazioni Performance

12. **11_add_completion_date_index.sql**
   - Aggiunge indice parziale su `actual_completed_date` per ottimizzare query su task completati
   - Indice solo per task con `actual_completed_date IS NOT NULL`
   - ⚠️ **Eseguire DOPO 01_core_schema.sql**

### Fase 12: Notification Preferences

13. **12_add_notification_preferences.sql**
   - Crea tabella `notification_preferences` per gestire preferenze notifiche utente
   - Crea trigger per creare preferenze di default quando viene creato un nuovo utente
   - Configura RLS policies per sicurezza
   - ⚠️ **Eseguire DOPO 01_core_schema.sql e 02_user_profiles.sql**

### Fase 13: Fix Function Search Path Security

14. **13_fix_function_search_path_security.sql**
   - Corregge tutte le funzioni SECURITY DEFINER che hanno search_path mutabile
   - Risolve i warning del Security Advisor di Supabase
   - Imposta `SET search_path = ''` su tutte le funzioni per sicurezza
   - ⚠️ **Eseguire DOPO tutte le altre migrazioni che creano funzioni**
   - ⚠️ **Risolve i warning "Function Search Path Mutable"**

### Fase 14: Fix RLS Performance

15. **14_fix_rls_performance.sql**
   - Corregge tutte le policy RLS che usano auth.uid() direttamente
   - Sostituisce auth.uid() con (select auth.uid()) per evitare ri-valutazione per ogni riga
   - Risolve i warning "Auth RLS Initialization Plan" del Security Advisor
   - ⚠️ **Eseguire DOPO tutte le altre migrazioni che creano policy RLS**

### Fase 15: Add Missing Foreign Key Indexes

16. **15_add_missing_foreign_key_indexes.sql**
   - Aggiunge indici mancanti su foreign key per migliorare le performance
   - Risolve i warning "Unindexed Foreign Keys" del Security Advisor
   - Crea indici su: agronomist_consultations.garden_id, crop_learning_events.garden_id, garden_beds.covering_structure_id, garden_beds.structure_id
   - ⚠️ **Eseguire DOPO tutte le altre migrazioni che creano tabelle e foreign key**

## Istruzioni per Supabase SQL Editor

### Metodo 1: Esecuzione Singola (Consigliato)

1. Apri Supabase Dashboard → SQL Editor
2. Per ogni file di migrazione:
   - Copia il contenuto del file
   - Incolla nel SQL Editor
   - Clicca "Run" o premi `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Verifica che non ci siano errori
   - Procedi al file successivo

### Metodo 2: Esecuzione Multipla

1. Apri Supabase Dashboard → SQL Editor
2. Copia e incolla TUTTI i file in ordine, separati da `;`
3. Esegui tutto insieme
4. ⚠️ **Attenzione**: Se un file fallisce, tutti i successivi falliranno

## Checklist di Verifica

Dopo ogni migrazione, verifica:

- [ ] Nessun errore nella console SQL
- [ ] Tabelle create correttamente: `\dt` (in psql) o verifica in Supabase Table Editor
- [ ] RLS policies attive: verifica in Supabase Authentication → Policies
- [ ] Indici creati: verifica performance in Supabase Database → Indexes
- [ ] Funzioni create: verifica in Supabase Database → Functions

## Troubleshooting Comune

### Errore: "relation already exists"

**Causa**: La tabella/funzione esiste già nel database.

**Soluzione**: 
- Verifica se la tabella esiste: `SELECT * FROM information_schema.tables WHERE table_name = 'nome_tabella';`
- Se esiste, salta la creazione o usa `CREATE TABLE IF NOT EXISTS` (già incluso nei file)

### Errore: "extension does not exist"

**Causa**: Estensione non abilitata.

**Soluzione**: 
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Errore: "permission denied"

**Causa**: Permessi insufficienti.

**Soluzione**: 
- Verifica di essere loggato come superadmin o con permessi sufficienti
- Contatta il team Supabase se necessario

### Errore: "constraint violation"

**Causa**: Dati esistenti violano il nuovo constraint.

**Soluzione**: 
- Verifica i dati esistenti: `SELECT * FROM tabella WHERE condizione;`
- Correggi i dati prima di applicare la migrazione
- Oppure modifica temporaneamente il constraint per accettare valori legacy

### Errore: "column already exists"

**Causa**: La colonna esiste già nella tabella.

**Soluzione**: 
- I file usano `ADD COLUMN IF NOT EXISTS`, quindi questo errore non dovrebbe verificarsi
- Se si verifica, verifica manualmente: `SELECT column_name FROM information_schema.columns WHERE table_name = 'nome_tabella';`

## Rollback

Se una migrazione fallisce o causa problemi:

1. **Backup**: Hai già fatto un backup? Se sì, ripristina
2. **Rollback Manuale**: 
   - Identifica quali tabelle/colonne/funzioni sono state create
   - Rimuovile manualmente in ordine inverso
   - Verifica che il database sia tornato allo stato precedente

## Note Importanti

1. **Ordine è Critico**: Non cambiare l'ordine di esecuzione
2. **Backup Prima**: Sempre fare backup prima di applicare migrazioni
3. **Test su Staging**: Se possibile, testa prima su un database di staging
4. **Verifica Dopo**: Dopo ogni migrazione, verifica che tutto funzioni
5. **Idempotenza**: I file usano `IF NOT EXISTS` e `ON CONFLICT DO NOTHING` per essere idempotenti

## Supporto

Per problemi o domande:
1. Verifica i log di Supabase: Dashboard → Logs → Postgres Logs
2. Controlla la documentazione Supabase: https://supabase.com/docs
3. Contatta il team di sviluppo

## Stato Migrazioni

Dopo aver applicato tutte le migrazioni, verifica lo stato:

```sql
-- Verifica tabelle create
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verifica estensioni
SELECT extname 
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pg_trgm');

-- Verifica RLS attivo
SELECT tablename, policyname 
FROM pg_policies 
ORDER BY tablename, policyname;
```

