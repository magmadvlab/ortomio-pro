# 🔄 Guida Backup e Sincronizzazione Database OrtoMio

## 🎯 Obiettivo
Creare una copia speculare del database remoto in locale per sviluppare in sicurezza.

## 🚀 Procedura Completa (Automatica)

### 1. Esegui lo script principale
```bash
./backup_and_sync_database.sh
```

Questo script:
- ✅ Installa Supabase CLI (se necessario)
- ✅ Fa login su Supabase
- ✅ Esporta schema e dati dal database remoto
- ✅ Configura database locale
- ✅ Importa tutti i dati
- ✅ Crea configurazioni per switch rapido

### 2. Switch tra database

**Passa a database LOCALE:**
```bash
./switch_to_local.sh
npm run dev
```

**Torna a database REMOTO:**
```bash
./switch_to_remote.sh
npm run dev
```

## 📁 File Creati

### Backup
- `database_backups/ortomio_backup_[timestamp].sql` - Backup completo
- `database_backups/ortomio_schema_[timestamp].sql` - Solo schema
- `database_backups/ortomio_data_[timestamp].sql` - Solo dati

### Configurazioni
- `.env.local.development` - Config per database locale
- `.env.local.backup_[timestamp]` - Backup config remoto

### Script Utility
- `switch_to_local.sh` - Switch rapido a locale
- `switch_to_remote.sh` - Switch rapido a remoto

## 🔧 Verifica Manuale

### Controlla database locale attivo
```bash
supabase status
```

### Controlla tabelle importate
```bash
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "\dt"
```

### Test connessione app
```bash
npm run dev
# Vai su http://localhost:3000
```

## ⚠️ Troubleshooting

### Supabase CLI non installato
```bash
# macOS con Homebrew
brew install supabase/tap/supabase

# Oppure segui: https://supabase.com/docs/guides/cli/getting-started
```

### Errori di importazione
```bash
# Reset e riprova
supabase db reset
./backup_and_sync_database.sh
```

### Database locale non si avvia
```bash
# Stop e restart
supabase stop
supabase start
```

## 🎯 Workflow Sviluppo Consigliato

1. **Backup iniziale** (una volta)
   ```bash
   ./backup_and_sync_database.sh
   ```

2. **Sviluppo su locale** (quotidiano)
   ```bash
   ./switch_to_local.sh
   npm run dev
   # Sviluppa le nuove funzionalità
   ```

3. **Test su remoto** (prima del deploy)
   ```bash
   ./switch_to_remote.sh
   npm run dev
   # Testa che tutto funzioni
   ```

4. **Deploy** (quando pronto)
   ```bash
   # Push delle modifiche
   git add .
   git commit -m "Precision Agriculture Evolution - Phase 1"
   git push
   ```

## 🔒 Sicurezza

- ✅ Backup automatici con timestamp
- ✅ Configurazioni separate per locale/remoto
- ✅ Nessuna perdita di dati remoti
- ✅ Rollback rapido in caso di problemi

## 📊 Vantaggi

- 🚀 **Sviluppo veloce**: Database locale più rapido
- 🔒 **Sicurezza**: Zero rischi per dati produzione
- 🔄 **Flessibilità**: Switch rapido locale ↔ remoto
- 💾 **Backup**: Copie di sicurezza automatiche
- 🧪 **Testing**: Ambiente identico per test

---

**Creato**: 12 Gennaio 2026  
**Versione**: 1.0  
**Status**: Pronto per l'uso