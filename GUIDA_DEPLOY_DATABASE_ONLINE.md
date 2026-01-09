# 🚀 GUIDA DEPLOY DATABASE ONLINE

**Obiettivo**: Allineare il database online con quello locale (70 tabelle)

## 🔍 **SITUAZIONE ATTUALE**

### **Database Locale** ✅
- **70 tabelle** complete
- **29 migrazioni** applicate
- **19 archetipi** configurati
- **Sistema orchestratore** operativo

### **Database Online** ❓
- **63 tabelle** (stima)
- **Migrazioni nostre** NON applicate
- **Sistema orchestratore** mancante
- **Tassonomia piante** mancante

## 🎯 **METODI DI DEPLOY**

### **Metodo 1: Supabase CLI (RACCOMANDATO)**

#### **Prerequisiti**
```bash
# Installare Supabase CLI se non presente
npm install -g supabase

# Verificare installazione
supabase --version
```

#### **Procedura**
```bash
# 1. Collegare progetto online
supabase link --project-ref YOUR_PROJECT_REF

# 2. Verificare differenze
supabase db diff

# 3. Applicare tutte le migrazioni
supabase db push

# 4. Verificare risultato
supabase db diff --schema public
```

### **Metodo 2: Dashboard Supabase**

#### **Procedura**
1. Vai su **https://dashboard.supabase.com**
2. Apri il tuo progetto OrtoMio
3. Vai su **Database → Migrations**
4. Carica i file in questo ordine:

```
1. 20260105060000_add_plant_taxonomy_system.sql
2. 20260105070000_seed_crop_archetypes.sql
3. 20260105000000_add_cultivation_orchestrator.sql
4. 20260105010000_add_orchestrator_triggers.sql
5. 20260105020000_add_orchestrator_analytics.sql
6. 20260105080000_add_missing_critical_tables.sql
7. 20260105090000_add_gamification_and_garden_advanced.sql
8. 20260105100000_add_remaining_missing_tables.sql
```

### **Metodo 3: SQL Editor Manuale**

#### **Procedura**
1. Dashboard Supabase → **SQL Editor**
2. Crea nuova query
3. Copia/incolla contenuto di ogni migrazione
4. Esegui in ordine cronologico
5. Verifica risultato dopo ogni migrazione

### **Metodo 4: Script Automatico**

#### **Configurazione Script**
```bash
# Modifica deploy_to_production.sh
PROJECT_REF="il-tuo-project-ref"
DB_PASSWORD="la-tua-password-db"

# Rendi eseguibile
chmod +x deploy_to_production.sh

# Esegui
./deploy_to_production.sh
```

## 📋 **CHECKLIST PRE-DEPLOY**

### **✅ Preparazione**
- [ ] **Backup database online** (OBBLIGATORIO)
- [ ] **Verifica credenziali** accesso
- [ ] **Test migrazioni** su database di staging
- [ ] **Modalità manutenzione** attiva (opzionale)

### **✅ Informazioni Necessarie**
- [ ] **Project Reference** (da dashboard Supabase)
- [ ] **Database Password** (da dashboard Supabase)
- [ ] **Connection String** completa

### **✅ File Migrazioni**
- [ ] `20260105060000_add_plant_taxonomy_system.sql`
- [ ] `20260105070000_seed_crop_archetypes.sql`
- [ ] `20260105000000_add_cultivation_orchestrator.sql`
- [ ] `20260105010000_add_orchestrator_triggers.sql`
- [ ] `20260105020000_add_orchestrator_analytics.sql`
- [ ] `20260105080000_add_missing_critical_tables.sql`
- [ ] `20260105090000_add_gamification_and_garden_advanced.sql`
- [ ] `20260105100000_add_remaining_missing_tables.sql`

## 🔧 **TROVARE CREDENZIALI SUPABASE**

### **Project Reference**
1. Dashboard Supabase → Il tuo progetto
2. **Settings → General**
3. Copia **Reference ID**

### **Database Password**
1. Dashboard Supabase → Il tuo progetto
2. **Settings → Database**
3. **Connection string** → Copia password

### **Connection String Completa**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

## ⚠️ **ATTENZIONI CRITICHE**

### **Prima del Deploy**
- 🚨 **BACKUP OBBLIGATORIO** - Sempre fare backup prima di modifiche
- 🚨 **TEST SU STAGING** - Testare su ambiente di test se disponibile
- 🚨 **ORARIO DEPLOY** - Preferire orari di bassa attività
- 🚨 **TEAM DISPONIBILE** - Avere supporto per eventuali rollback

### **Durante il Deploy**
- 🚨 **ORDINE MIGRAZIONI** - Rispettare ordine cronologico
- 🚨 **VERIFICA ERRORI** - Controllare output di ogni migrazione
- 🚨 **ROLLBACK READY** - Avere piano di rollback pronto

### **Dopo il Deploy**
- 🚨 **VERIFICA FUNZIONALITÀ** - Testare app online
- 🚨 **PERFORMANCE CHECK** - Verificare performance query
- 🚨 **RLS POLICIES** - Controllare sicurezza accesso dati

## 📊 **VERIFICA POST-DEPLOY**

### **Query di Verifica**
```sql
-- Conteggio tabelle totali
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verifica archetipi
SELECT COUNT(*) as archetipi FROM crop_archetypes;

-- Verifica profili
SELECT COUNT(*) as profili FROM crop_profiles;

-- Verifica orchestratore
SELECT COUNT(*) as piani FROM cultivation_plans;

-- Lista tabelle aggiunte
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'crop_archetypes', 'crop_profiles', 'cultivation_plans',
    'api_configurations', 'calendar_tasks', 'professional_analytics'
  )
ORDER BY table_name;
```

### **Risultati Attesi**
- **Tabelle totali**: 70+ (vs 63 iniziali)
- **Archetipi**: 19
- **Profili**: 16
- **Piani coltivazione**: 0 (tabella vuota ma esistente)

## 🎯 **TROUBLESHOOTING**

### **Errore: "relation already exists"**
- **Causa**: Tabella già presente
- **Soluzione**: Normale, migrazione usa `IF NOT EXISTS`

### **Errore: "permission denied"**
- **Causa**: Credenziali errate
- **Soluzione**: Verificare password e project ref

### **Errore: "function does not exist"**
- **Causa**: Dipendenze mancanti
- **Soluzione**: Applicare migrazioni in ordine

### **Performance Lente**
- **Causa**: Indici non ottimizzati
- **Soluzione**: Verificare che tutti gli indici siano creati

## 🚀 **PROSSIMI PASSI POST-DEPLOY**

1. **Test Completo App** - Verificare tutte le funzionalità
2. **Performance Monitoring** - Monitorare query lente
3. **User Acceptance Testing** - Test con utenti reali
4. **Documentazione Update** - Aggiornare documentazione API
5. **Rollout Graduale** - Abilitare funzionalità gradualmente

---

**🎯 OBIETTIVO**: Database online allineato con locale (70 tabelle) con tutte le funzionalità PRO operative.