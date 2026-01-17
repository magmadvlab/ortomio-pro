# Guida Applicazione Migrazione Multi-Tenancy

## 🎯 Panoramica

Questa guida ti aiuta ad applicare la migrazione per il sistema multi-tenancy e gestione API keys al tuo database Supabase.

## 📋 Tabelle da Creare

La migrazione `20260116040000_create_multi_tenancy_system.sql` crea **6 nuove tabelle**:

### 1. **organizations** 
- Entità aziende/cooperative/fattorie
- Informazioni di contatto e configurazioni
- Proprietario e metadati

### 2. **roles**
- Ruoli con permessi granulari
- Ruoli di sistema (Owner, Admin, Agronomist, Operator, Viewer)
- Ruoli personalizzati

### 3. **organization_members**
- Utenti appartenenti alle organizzazioni
- Associazione con ruoli
- Stati (Active, Invited, Suspended)

### 4. **organization_invitations**
- Sistema di inviti via email
- Token di sicurezza con scadenza
- Tracciamento stato inviti

### 5. **garden_assignments**
- Assegnazione giardini specifici ai membri
- Livelli di accesso (Full, ReadWrite, ReadOnly)
- Tracciamento assegnazioni

### 6. **api_keys**
- Chiavi API per servizi esterni
- Crittografia AES-256-GCM
- Supporto per 8 servizi (OpenAI, Anthropic, etc.)

## 🚀 Metodi di Applicazione

### Metodo 1: Supabase CLI (Raccomandato)

```bash
# 1. Assicurati di essere nella directory del progetto
cd /path/to/your/ortomio-project

# 2. Verifica connessione Supabase
supabase status

# 3. Applica la migrazione
supabase db push

# 4. Verifica che sia stata applicata
supabase db diff
```

### Metodo 2: Dashboard Supabase

1. **Apri Supabase Dashboard**
   - Vai su https://supabase.com/dashboard
   - Seleziona il tuo progetto OrtoMio

2. **SQL Editor**
   - Clicca su "SQL Editor" nella sidebar
   - Crea una nuova query

3. **Copia e Incolla**
   - Copia tutto il contenuto di `supabase/migrations/20260116040000_create_multi_tenancy_system.sql`
   - Incolla nell'editor SQL
   - Clicca "Run"

4. **Verifica Risultati**
   - Controlla che non ci siano errori
   - Verifica che le tabelle siano state create

### Metodo 3: Script di Applicazione

```bash
# Usa lo script preparato
psql -h your-supabase-host -U postgres -d postgres -f APPLY_MULTI_TENANCY_MIGRATION_JAN17.sql
```

## ✅ Verifica Applicazione

### 1. Controlla Tabelle Create

```sql
-- Verifica che tutte le 6 tabelle esistano
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'organizations', 
    'roles', 
    'organization_members', 
    'organization_invitations', 
    'garden_assignments', 
    'api_keys'
);
```

### 2. Controlla Politiche RLS

```sql
-- Verifica politiche di sicurezza
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 
    'roles', 
    'organization_members', 
    'organization_invitations', 
    'garden_assignments', 
    'api_keys'
);
```

### 3. Controlla Indici

```sql
-- Verifica indici di performance
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
    'organizations', 
    'roles', 
    'organization_members', 
    'organization_invitations', 
    'garden_assignments', 
    'api_keys'
)
AND indexname LIKE 'idx_%';
```

### 4. Test Funzione Sistema

```sql
-- Testa la funzione di creazione ruoli di sistema
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_system_roles_for_organization'
AND routine_schema = 'public';
```

## 🔧 Risoluzione Problemi

### Errore: "relation already exists"
```sql
-- Se alcune tabelle esistono già, usa:
DROP TABLE IF EXISTS organizations CASCADE;
-- Poi riapplica la migrazione
```

### Errore: "permission denied"
```sql
-- Assicurati di avere i permessi giusti
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Errore: "function does not exist"
```sql
-- Riapplica solo la parte delle funzioni
CREATE OR REPLACE FUNCTION create_system_roles_for_organization(org_id UUID)
-- ... resto della funzione
```

## 🎉 Dopo l'Applicazione

### 1. Testa l'Interfaccia
- Vai su `/app/settings` nella tua app
- Dovresti vedere le nuove sezioni "Organization" e "API Keys"

### 2. Crea Prima Organizzazione
- Clicca "Crea Organizzazione"
- Compila i dati della tua azienda
- Verifica che i ruoli di sistema vengano creati automaticamente

### 3. Configura API Keys
- Vai nella sezione "API Keys"
- Aggiungi le tue chiavi per OpenAI, Anthropic, etc.
- Testa le connessioni

### 4. Invita Team Members
- Usa il sistema di inviti per aggiungere collaboratori
- Assegna ruoli appropriati
- Configura accessi ai giardini specifici

## 📊 Struttura Completa

```
Multi-Tenancy System
├── Organizations (Aziende)
│   ├── Contact Info (Email, Phone, Address)
│   ├── Settings (Logo, Website)
│   └── Owner (Proprietario)
├── Roles (Ruoli)
│   ├── System Roles (Owner, Admin, Agronomist, Operator, Viewer)
│   ├── Custom Roles (Personalizzati)
│   └── Permissions (Permessi granulari)
├── Members (Membri)
│   ├── User Association (Associazione utenti)
│   ├── Role Assignment (Assegnazione ruoli)
│   └── Status Management (Gestione stati)
├── Invitations (Inviti)
│   ├── Email Invites (Inviti via email)
│   ├── Token Security (Token di sicurezza)
│   └── Expiration (Scadenza)
├── Garden Assignments (Assegnazioni Giardini)
│   ├── Member Access (Accesso membri)
│   ├── Access Levels (Livelli accesso)
│   └── Tracking (Tracciamento)
└── API Keys (Chiavi API)
    ├── Service Support (8 servizi supportati)
    ├── Encryption (Crittografia AES-256-GCM)
    └── Usage Tracking (Tracciamento utilizzo)
```

## 🔐 Sicurezza

- **Row Level Security (RLS)** attivato su tutte le tabelle
- **Crittografia AES-256-GCM** per le API keys
- **Permessi granulari** basati sui ruoli
- **Isolamento dati** per organizzazione
- **Token sicuri** per gli inviti

## 📞 Supporto

Se incontri problemi durante l'applicazione:

1. **Controlla i log** di Supabase per errori specifici
2. **Verifica i permessi** del database
3. **Controlla la connessione** di rete
4. **Riprova** l'applicazione della migrazione

La migrazione è stata testata e dovrebbe applicarsi senza problemi su database Supabase standard.