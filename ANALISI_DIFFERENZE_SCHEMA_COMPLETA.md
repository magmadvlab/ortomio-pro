# 🔍 ANALISI COMPLETA DIFFERENZE SCHEMA DATABASE

**Data**: 5 Gennaio 2026  
**Confronto**: Database Online vs Database Locale

## 📊 **STATISTICHE GENERALI**

| Metrica | Online | Locale | Differenza |
|---------|--------|--------|------------|
| **Tabelle Totali** | 63 | 47 | -16 |
| **Tabelle Mancanti** | - | 28 | ❌ |
| **Tabelle Extra** | - | 12 | ✅ |

## ❌ **TABELLE MANCANTI NEL DATABASE LOCALE (28)**

### **🔧 Configurazioni e API (CRITICHE)**
- `api_configurations` - ❌ **CRITICA** - Configurazioni API personalizzate
- `crop_archetypes` - ❌ **CRITICA** - Archetipi delle colture
- `crop_profiles` - ❌ **CRITICA** - Profili delle colture
- `plant_families` - ❌ **CRITICA** - Famiglie botaniche
- `plant_taxonomy` - ❌ **CRITICA** - Tassonomia piante
- `plant_synonyms` - ❌ **CRITICA** - Sinonimi piante
- `plant_rules` - ❌ **CRITICA** - Regole rotazioni/consociazioni

### **📅 Calendario e Sfide**
- `calendar_tasks` - Attività calendario
- `challenge_completions` - Completamento sfide
- `user_badges` - Badge utenti

### **🌱 Colture Personalizzate**
- `custom_crops` - Colture personalizzate
- `crop_learning_events` - Eventi apprendimento colture
- `crop_mechanical_works` - Lavori meccanici per coltura

### **🏡 Gestione Giardino Avanzata**
- `garden_correlations` - Correlazioni giardino
- `garden_patterns` - Pattern giardino  
- `garden_rows` - Righe giardino
- `garden_season_analyses` - Analisi stagionali
- `garden_tree_memories` - Memoria alberi
- `garden_zone_memories` - Memoria zone

### **💰 Analytics Professionali**
- `professional_analytics` - Analytics professionali
- `yield_predictions` - Previsioni raccolto
- `vegetation_indices` - Indici vegetazione

### **🔬 Monitoraggio Avanzato**
- `sensor_readings` - Letture sensori
- `soil_analysis` - Analisi suolo
- `weather_reschedule_logs` - Log riprogrammazioni meteo

### **🚜 Sistemi Avanzati**
- `fertilization_logs` - Log fertilizzazioni
- `treatment_registry` - Registro trattamenti (diverso da treatment_register)
- `mechanical_work_sequences` - Sequenze lavori meccanici

## ✅ **TABELLE EXTRA NEL DATABASE LOCALE (12)**

### **🎯 Sistema Orchestratore (NOSTRE AGGIUNTE)**
- `cultivation_plans` - ✅ **CORE** - Piani coltivazione
- `cultivation_statistics` - ✅ **ANALYTICS** - Statistiche coltivazione  
- `cultivation_issues` - ✅ **TRACKING** - Problemi coltivazione
- `detailed_harvests` - ✅ **HARVEST** - Raccolti dettagliati
- `phase_transitions` - ✅ **AUTOMATION** - Transizioni fasi
- `sapling_inventory` - ✅ **INVENTORY** - Inventario piantine
- `cultivation_analytics_dashboard` - ✅ **DASHBOARD** - Dashboard analytics
- `cultivation_dashboard` - ✅ **DASHBOARD** - Dashboard principale

### **🔧 Sistemi Aggiuntivi**
- `health_alerts` - ✅ Avvisi salute piante
- `plant_instances` - ✅ Istanze piante
- `scalar_production_timeline` - ✅ Timeline produzione scalare
- `seedling_photos` - ✅ Foto piantine

## 🚨 **PRIORITÀ DI ALLINEAMENTO**

### **🔴 PRIORITÀ MASSIMA (da applicare subito)**
1. `api_configurations` - Necessaria per configurazioni API
2. `crop_archetypes` - Base per tutto il sistema
3. `crop_profiles` - Profili coltivazione
4. `plant_families` - Famiglie botaniche
5. `plant_taxonomy` - Tassonomia completa
6. `plant_synonyms` - Ricerca fuzzy piante

### **🟡 PRIORITÀ ALTA (importanti)**
7. `calendar_tasks` - Sistema calendario
8. `custom_crops` - Colture personalizzate
9. `professional_analytics` - Analytics PRO
10. `sensor_readings` - Letture sensori

### **🟢 PRIORITÀ MEDIA (opzionali)**
11. `challenge_completions` - Sistema sfide
12. `user_badges` - Gamification
13. `garden_correlations` - Correlazioni avanzate
14. `yield_predictions` - Previsioni raccolto

## 🎯 **PIANO DI AZIONE**

### **Fase 1: Tabelle Critiche (IMMEDIATA)**
```sql
-- Applicare migrazioni per:
1. api_configurations
2. crop_archetypes  
3. crop_profiles
4. plant_families
5. plant_taxonomy
6. plant_synonyms
7. plant_rules
```

### **Fase 2: Sistemi Avanzati (SETTIMANA PROSSIMA)**
```sql
-- Applicare migrazioni per:
8. calendar_tasks
9. custom_crops
10. professional_analytics
11. sensor_readings
12. soil_analysis
```

### **Fase 3: Features Opzionali (FUTURO)**
```sql
-- Applicare migrazioni per:
13. challenge_completions
14. user_badges
15. garden_correlations
16. yield_predictions
```

## 🔧 **MIGRAZIONI DA CREARE**

### **Mancanti nel nostro sistema:**
- Migrazione per `api_configurations` (esiste ma non applicata?)
- Migrazione per sistema tassonomia piante completo
- Migrazione per calendario tasks
- Migrazione per analytics professionali

### **Da verificare online:**
- Le nostre 12 tabelle orchestratore devono essere applicate online
- Verificare che le funzioni orchestratore siano presenti online

## 🎯 **RISULTATO ATTESO**

Dopo l'allineamento completo:
- **Database Locale**: 63+ tabelle (tutte quelle online + nostre aggiunte)
- **Database Online**: 63+ tabelle (tutte esistenti + nostre aggiunte orchestratore)
- **Funzionalità**: Sistema completo con orchestratore + tutte le features PRO

## ⚠️ **NOTE CRITICHE**

1. **Non eliminare** le nostre 12 tabelle extra - sono miglioramenti
2. **Priorità assoluta** alle tabelle di tassonomia piante
3. **Testare** ogni migrazione prima di applicarla online
4. **Backup** obbligatorio prima di ogni modifica online

---

**🎯 PROSSIMO PASSO**: Creare le migrazioni per le tabelle critiche mancanti e applicarle al database locale, poi replicare online.