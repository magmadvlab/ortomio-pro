# Configurazione Porte - OrtoMio AI

**Data**: 2026-01-01
**Stato**: ✅ OPERATIVO

## 🚀 Applicazione Next.js

- **URL**: http://localhost:3002
- **Modalità**: Development (Turbopack)
- **Autenticazione**: BYPASS attivo (modalità FREE con localStorage)
- **Build**: Next.js 16.0.8

## 🗄️ Database Supabase

### Setup CLI Supabase (ATTIVO - Raccomandato)

Container con prefisso `supabase_*_ortomio-main`:

| Servizio | Porta | Stato | Descrizione |
|----------|-------|-------|-------------|
| **Kong (API Gateway)** | 54321 | ✅ Healthy | Gateway principale API |
| **Database (PostgreSQL)** | 54324 | ✅ Healthy | Database PostgreSQL 17.6 |
| **Studio (Dashboard)** | 54326 | ✅ Healthy | Supabase Studio UI |
| **Inbucket (Email)** | 54325 | ✅ Healthy | Email testing |
| **Analytics (Logflare)** | 54327 | ✅ Healthy | Logging & analytics |

**URL Accesso**:
- Supabase Studio: http://localhost:54326
- API Gateway: http://localhost:54321
- Email Viewer: http://localhost:54325

### Setup Docker Compose (LEGACY - Deprecato)

Container con prefisso `ortomio-*`:

| Servizio | Porta | Stato | Note |
|----------|-------|-------|------|
| Kong | 8000 | ✅ Running | Usato dal setup vecchio |
| PostgreSQL | 54322 | ✅ Healthy | Database separato |
| Studio | 54330 | ⚠️ Unhealthy | Porta cambiata da 3000 |
| Auth, Storage, Realtime | - | ⚠️ Restarting | In loop di restart |

**⚠️ NOTA**: Questo setup ha problemi di configurazione. Usa il setup CLI Supabase invece.

## 🔧 Configurazione Ambiente

### File: `.env.local`

```env
# Bypass autenticazione in sviluppo locale
NEXT_PUBLIC_BYPASS_AUTH=true

# Gemini AI API Key (opzionale)
# NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

**Modalità Operative**:

1. **FREE Mode (Attuale)**:
   - BYPASS_AUTH=true
   - Nessuna connessione Supabase
   - Dati salvati in localStorage
   - Limiti: 1 orto, 50 task, 20 semi

2. **PRO Mode (Per test)**:
   - Rimuovere BYPASS_AUTH o metterlo a false
   - Configurare Supabase URL e Keys
   - Login richiesto
   - Tutte le features disponibili

### Configurazione Supabase PRO (Non Attiva)

Se vuoi testare il tier PRO con Supabase CLI:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=<service_key>
```

## 🐳 Gestione Docker

### Verificare Container Attivi

```bash
docker ps --filter "name=ortomio" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Riavviare Supabase CLI

```bash
# Fermare
supabase stop

# Avviare
supabase start
```

### Riavviare Docker Compose (Legacy - Non raccomandato)

```bash
cd docker
docker compose down
docker compose up -d
```

## 📊 Porte in Uso (Riepilogo)

| Porta | Servizio | Progetto |
|-------|----------|----------|
| 3002 | Next.js OrtoMio | OrtoMio |
| 5433 | PostgreSQL | RicettaZero |
| 6379 | Redis | RicettaZero |
| 8000 | Kong (Legacy) | OrtoMio (old) |
| 27017 | MongoDB | RicettaZero |
| 54321 | Supabase API | OrtoMio |
| 54322 | PostgreSQL (Legacy) | OrtoMio (old) |
| 54324 | PostgreSQL | OrtoMio (CLI) |
| 54325 | Inbucket | OrtoMio |
| 54326 | Supabase Studio | OrtoMio (CLI) |
| 54327 | Analytics | OrtoMio |
| 54330 | Studio (Legacy) | OrtoMio (old) |

**✅ NESSUN CONFLITTO CON PORTA 3000**

## 🎯 Comandi Rapidi

### Avviare Tutto

```bash
# 1. Avvia Next.js
npm run dev

# 2. Verifica Supabase (se necessario)
supabase status
```

### Fermare Tutto

```bash
# 1. Ferma Next.js
# Ctrl+C nel terminale

# 2. Ferma Supabase (opzionale)
supabase stop
```

### Accedere ai Servizi

- **App OrtoMio**: http://localhost:3002
- **Supabase Studio**: http://localhost:54326
- **Email Testing**: http://localhost:54325

## 🔍 Verifica Stato Sistema

```bash
# Verifica container Docker
docker ps | grep ortomio

# Verifica porta Next.js
curl http://localhost:3002

# Verifica porta Supabase API
curl http://localhost:54321/rest/v1/
```

## ⚙️ Modifiche Apportate

**Data**: 2026-01-01

1. ✅ Cambiata porta Supabase Studio da 3000 → 54330 in `docker/docker-compose.yml`
2. ✅ Aggiornato GOTRUE_SITE_URL da localhost:3000 → localhost:3002
3. ✅ Aggiornato GOTRUE_URI_ALLOW_LIST per includere 3002 e 54326
4. ✅ Verificato che Next.js usa porta 3002 (configurato in package.json)

## 📝 Note Importanti

1. **Setup Raccomandato**: Usa Supabase CLI (`supabase_*_ortomio-main`) invece del Docker Compose vecchio
2. **Modalità Sviluppo**: BYPASS_AUTH=true permette di testare senza login
3. **Container Legacy**: I container `ortomio-*` (senza supabase_) hanno problemi e possono essere rimossi
4. **Nessun Conflitto**: OrtoMio non usa porta 3000, quindi non interferisce con altri progetti

## 🚨 Troubleshooting

### Next.js non si avvia

```bash
# Verifica se la porta 3002 è occupata
lsof -i :3002

# Uccidi processo se necessario
kill -9 <PID>
```

### Supabase in loop di restart

```bash
# Ferma container problematici
docker stop ortomio-auth ortomio-storage ortomio-realtime ortomio-studio

# Usa il setup CLI invece
supabase start
```

### Database non raggiungibile

```bash
# Verifica container PostgreSQL
docker ps | grep postgres

# Connessione diretta (CLI setup)
psql postgresql://postgres:postgres@localhost:54324/postgres
```

---

**Ultima verifica**: 2026-01-01 18:45
**Stato sistema**: ✅ OPERATIVO
