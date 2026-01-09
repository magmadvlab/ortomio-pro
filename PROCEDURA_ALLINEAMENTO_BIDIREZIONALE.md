# 🔄 PROCEDURA ALLINEAMENTO BIDIREZIONALE DATABASE

**Obiettivo**: Sincronizzare completamente database locale e online

## 📋 **STRATEGIA**

### **Situazione Attuale**
- **Database Locale**: 70 tabelle (con nostre implementazioni)
- **Database Online**: ~63 tabelle (schema base + alcune che non abbiamo)

### **Piano di Sincronizzazione**
1. **Online → Locale**: Importare tabelle mancanti dal database online
2. **Locale → Online**: Esportare le nostre implementazioni al database online
3. **Risultato**: Entrambi i database con tutte le tabelle (70+)

## 🚀 **PROCEDURA PASSO-PASSO**

### **PASSO 1: ANALISI DIFFERENZE**
```bash
# Esegui script di analisi
chmod +x sync_databases_bidirectional.sh
./sync_databases_bidirectional.sh
```

Questo script:
- Conta tabelle in entrambi i database
- Esporta schemi completi
- Identifica tabelle mancanti in ciascun database
- Genera piano di sincronizzazione

### **PASSO 2: IMPORTARE TABELLE ONLINE → LOCALE**
```bash
# 1. Backup database locale
pg_dump postgresql://postgres:postgres@127.0.0.1:54324/postgres > backup_locale_pre_sync.sql

# 2. Importare schema online (solo tabelle mancanti)
# Questo richiederà editing manuale del file schema_online_YYYYMMDD.sql
# per rimuovere tabelle già esistenti

# 3. Applicare al database locale
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -f schema_online_filtered.sql
```

### **PASSO 3: ESPORTARE TABELLE LOCALE → ONLINE**
```bash
# 1. Backup database online
pg_dump postgresql://postgres:[PASSWORD]@db.qhmujoivfxftlrcluaj.supabase.co:5432/postgres > backup_online_pre_sync.sql

# 2. Applicare nostre migrazioni
supabase link --project-ref qhmujoivfxftlrcluaj
supabase db push

# 3. Verificare risultato
supabase db diff
```

### **PASSO 4: VERIFICA FINALE**
```bash
# Contare tabelle finali
echo "Tabelle locale:"
psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

echo "Tabelle online:"
psql postgresql://postgres:[PASSWORD]@db.qhmujoivfxftlrcluaj.supabase.co:5432/postgres -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

## ⚠️ **ATTENZIONI CRITICHE**

### **Prima di Iniziare**
- 🚨 **BACKUP OBBLIGATORI** di entrambi i database
- 🚨 **PASSWORD DATABASE** online necessaria
- 🚨 **SUPABASE CLI** installato e configurato

### **Durante la Sincronizzazione**
- 🚨 **CONFLITTI TABELLE** - Alcune tabelle potrebbero esistere in entrambi con schemi diversi
- 🚨 **DATI ESISTENTI** - Attenzione a non sovrascrivere dati importanti
- 🚨 **RLS POLICIES** - Verificare che le policy di sicurezza siano mantenute

### **Gestione Conflitti**
Se una tabella esiste in entrambi i database ma con schemi diversi:
1. **Analizzare differenze** con `pg_dump --schema-only`
2. **Creare migrazione** per allineare gli schemi
3. **Testare su database di staging** prima di applicare

## 🎯 **RISULTATO ATTESO**

Dopo la sincronizzazione completa:
- **Database Locale**: Tutte le tabelle online + nostre implementazioni
- **Database Online**: Tutte le tabelle originali + nostre implementazioni
- **Totale**: ~75+ tabelle in entrambi i database
- **Funzionalità**: Sistema completo OrtoMio Pro operativo

## 📋 **CHECKLIST FINALE**

### **Verifica Locale**
- [ ] Tutte le tabelle online importate
- [ ] Nostre implementazioni mantenute
- [ ] Archetipi e profili operativi
- [ ] Sistema orchestratore funzionante

### **Verifica Online**
- [ ] Tutte le tabelle originali mantenute
- [ ] Nostre implementazioni applicate
- [ ] App online funzionante
- [ ] Performance accettabili

### **Test Integrazione**
- [ ] Login/registrazione funzionanti
- [ ] Creazione giardini operativa
- [ ] Sistema pianificazione attivo
- [ ] Analytics e dashboard operative

---

**🎯 OBIETTIVO**: Database completamente sincronizzati con tutte le funzionalità PRO operative su entrambi gli ambienti.