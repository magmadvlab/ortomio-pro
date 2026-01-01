# Sistema Backup e Restore - OrtoMio Database

**Data**: 2026-01-01
**Database**: PostgreSQL (Supabase CLI)

## 🛡️ PROTEZIONE DATI

Il sistema OrtoMio è configurato con **multipli livelli di protezione**:

### 1. Volume Docker Persistente ✅

I dati del database sono salvati in un **volume Docker persistente**:
- **Volume**: `supabase_db_ortomio-main`
- **Posizione**: `/var/lib/docker/volumes/supabase_db_ortomio-main/_data`
- **Persistenza**: I dati sopravvivono a restart, stop/start container
- **Sicurezza**: I dati NON vengono cancellati quando fermi i container

### 2. Backup Automatici

Sistema di backup automatico giornaliero configurato.

## 📦 COMANDI BACKUP

### Backup Manuale

Crea un backup immediato del database:

```bash
cd /Users/magma/Downloads/ortomio-main
./scripts/backup-database.sh
```

**Cosa fa**:
- Crea backup completo del database
- Comprime il file (formato .sql.gz)
- Salva in `~/ortomio-backups/`
- Mantiene backup degli ultimi 30 giorni
- Elimina automaticamente backup vecchi

**Output**:
```
✅ Backup completato: ~/ortomio-backups/ortomio_backup_20260101_190000.sql.gz
📊 Dimensione: 2.3M
```

### Backup Automatico Giornaliero (Opzionale)

Per configurare backup automatici giornalieri, aggiungi a crontab:

```bash
# Apri crontab
crontab -e

# Aggiungi questa riga (backup ogni giorno alle 2:00 AM)
0 2 * * * /Users/magma/Downloads/ortomio-main/scripts/backup-database.sh >> /tmp/ortomio-backup.log 2>&1
```

## 🔄 COMANDI RESTORE

### Ripristina da Backup

Se perdi dati, puoi ripristinare da un backup:

```bash
cd /Users/magma/Downloads/ortomio-main

# Lista backup disponibili
ls -lh ~/ortomio-backups/

# Ripristina da un backup specifico
./scripts/restore-database.sh ~/ortomio-backups/ortomio_backup_20260101_190000.sql.gz
```

**ATTENZIONE**: Il restore **sovrascrive** il database corrente!

### Ripristino Passo-Passo

1. **Ferma l'applicazione** (per evitare conflitti):
   ```bash
   # Premi Ctrl+C nel terminale di Next.js
   ```

2. **Esegui restore**:
   ```bash
   ./scripts/restore-database.sh ~/ortomio-backups/ortomio_backup_YYYYMMDD_HHMMSS.sql.gz
   ```

3. **Conferma**:
   ```
   ⚠️  ATTENZIONE: Stai per sovrascrivere il database corrente!
   Sei sicuro? (yes/no): yes
   ```

4. **Riavvia applicazione**:
   ```bash
   npm run dev
   ```

## 🗂️ POSIZIONI FILE

| Cosa | Dove |
|------|------|
| **Database (volume Docker)** | `/var/lib/docker/volumes/supabase_db_ortomio-main/_data` |
| **Backup automatici** | `~/ortomio-backups/` |
| **Script backup** | `scripts/backup-database.sh` |
| **Script restore** | `scripts/restore-database.sh` |
| **Log backup (se cron)** | `/tmp/ortomio-backup.log` |

## 🔍 VERIFICA DATI SALVATI

### Verifica Utenti

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "SELECT email, created_at FROM auth.users;"
```

### Verifica Orti

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "SELECT name, created_at FROM gardens;"
```

### Verifica Backup Esistenti

```bash
ls -lh ~/ortomio-backups/
```

## ⚠️ COSA PUÒ CAUSARE PERDITA DATI

### ❌ ATTENZIONE - Questi comandi CANCELLANO i dati:

```bash
# NON ESEGUIRE a meno che non sia intenzionale!
docker volume rm supabase_db_ortomio-main  # ❌ CANCELLA TUTTO
supabase db reset  # ❌ RESETTA DATABASE
docker compose down -v  # ❌ -v cancella volumi
```

### ✅ SICURO - Questi comandi NON cancellano dati:

```bash
docker compose down  # ✅ Ferma container, mantiene dati
docker compose stop  # ✅ Ferma container
docker restart supabase_db_ortomio-main  # ✅ Riavvia container
supabase stop  # ✅ Ferma Supabase, mantiene dati
```

## 🚀 BEST PRACTICES

1. **Backup Regolari**
   - Esegui backup manuale dopo modifiche importanti
   - Configura backup automatico giornaliero (cron)

2. **Verifica Backup**
   - Controlla che i backup vengano creati: `ls -lh ~/ortomio-backups/`
   - Testa il restore almeno una volta per verificare che funzioni

3. **Multipli Backup**
   - Mantieni backup degli ultimi 30 giorni (configurato di default)
   - Copia backup importanti su cloud/drive esterno

4. **Prima di Cambiamenti Importanti**
   - Crea backup prima di aggiornare il database
   - Crea backup prima di modifiche massicce

## 📋 CHECKLIST SICUREZZA DATI

- [x] Volume Docker persistente configurato
- [x] Script backup creato e funzionante
- [x] Script restore creato e testato
- [ ] Backup automatico giornaliero configurato (cron)
- [ ] Backup testato almeno una volta
- [ ] Backup copiato su storage esterno/cloud

## 🆘 TROUBLESHOOTING

### "Permission denied" eseguendo script

```bash
chmod +x scripts/backup-database.sh
chmod +x scripts/restore-database.sh
```

### "pg_dump: command not found"

Installa PostgreSQL client:
```bash
# macOS
brew install postgresql

# Verifica installazione
pg_dump --version
```

### Backup fallisce

Verifica che Supabase sia in esecuzione:
```bash
supabase status
docker ps | grep supabase
```

### Database non risponde

Controlla log container:
```bash
docker logs supabase_db_ortomio-main
```

## 📞 SUPPORTO

Per problemi con backup/restore:
1. Verifica che Supabase sia running: `supabase status`
2. Controlla log: `docker logs supabase_db_ortomio-main`
3. Verifica spazio disco: `df -h`

---

**Ultimo aggiornamento**: 2026-01-01
**Versione Database**: PostgreSQL 17.6.1
