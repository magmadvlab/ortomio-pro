# Changelog - FASE 1

Tutte le modifiche significative della FASE 1 sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-12-25

### Added

#### Sistema Health Alerts 🆕
- **Database**: Nuova tabella `health_alerts` con RLS, trigger, e 4 indici ottimizzati
- **Storage Providers**: Metodi CRUD completi in SupabaseStorageProvider e LocalStorageProvider
  - `getHealthAlerts(gardenId?: string)`
  - `getHealthAlert(id: string)`
  - `createHealthAlert(alert)`
  - `updateHealthAlert(id, updates)`
  - `deleteHealthAlert(id)`
- **Alert Engine**: Servizio `/services/healthAlertEngine.ts` con 4 tipi di controlli:
  - Weather disease risk (peronospora, oidio, ecc.)
  - Water deficit (task irrigazione overdue)
  - Seasonal pest warnings
  - Sensor alerts (pH, EC, nutrient levels)
- **Cron Job**: API route `/app/api/cron/health-check/route.ts`
  - Schedule: 2x al giorno (8:00 e 20:00)
  - Batch processing di tutti i giardini
  - Deduplicazione automatica alert
  - Weather data caching (15 min TTL)
  - Error handling e logging dettagliato
- **UI Components**:
  - `AlertCard.tsx`: Card alert con severity styling e azioni
  - Estensione `HealthDashboard.tsx` con sezione "Alert Automatici"
- **Vercel Cron**: Configurazione in `vercel.json` per esecuzione automatica

#### Componenti Nuovi
- **PlantCard** (`/components/garden/PlantCard.tsx`):
  - Progress bar maturità pianta
  - Status badge (growing/ready/attention)
  - Stats (giorni attivi, data piantata)
  - Quick action "Raccogli ora" se pronta
- **OnboardingBanner** (`/components/onboarding/OnboardingBanner.tsx`):
  - Banner benvenuto dismissable
  - 2 modalità configurazione: Auto-detect location | Manuale
  - Integration con GardenOnboarding in quick mode
  - Persistenza dismiss in localStorage

#### Script e Tools
- **test-health-check.ts**: Script locale per testare cron job health alerts
  - Carica tutti i giardini
  - Genera e salva alert
  - Logging dettagliato
  - Usage: `npm run test:health-check`

#### Documentazione 📚
- `MODIFICHE_DATABASE_FASE1.md`: Schema database, deployment procedure, rollback
- `FASE1_IMPLEMENTAZIONE_COMPLETA.md`: Dettagli tecnici completi di tutti gli Sprint
- `FASE1_TEST_PLAN.md`: Piano test manuale dettagliato (750+ righe)
- `FASE1_RIEPILOGO_COMPLETO.md`: Riepilogo implementazione e checklist
- `FASE1_QUICK_START.md`: Guida rapida testing e deployment
- `FASE1_README.md`: Panoramica generale FASE 1
- `CHANGELOG_FASE1.md`: Questo file

### Changed

#### Navigazione
- **Sidebar riorganizzata** (Sprint 1):
  - Riduzione da 19 a 5 voci principali per FREE/PLUS tier
  - Menu groups collapsabili per PRO tier:
    - "COLTURE SPECIALIZZATE" (Frutteto, Oliveto, Vigneto)
    - "GESTIONE AVANZATA" (Analytics, Trattamenti, Lavorazioni)
  - Icons aggiornate con Lucide React
  - Modificati:
    - `/components/shared/FreeSidebar.tsx`
    - `/components/consumer/Sidebar.tsx`
    - `/components/professional/Sidebar.tsx`
    - `/components/shared/MobileBottomNav.tsx`
    - `/components/shared/MobileMenu.tsx`

#### Gestione Raccolto
- **ListView** (`/components/garden/ListView.tsx`):
  - 🔴 **BUG FIX CRITICO**: Trigger harvest modal ora cerca `sowingTask` collegato prima di check maturity
  - Auto-open `HarvestPromptModal` quando task completato su pianta matura
  - Integration harvest log con task completion
- **GlobalQuickActions**: Aggiunto button "Raccolto" al FAB
- **HarvestPromptModal**: Ora modal principale unificato (deprecato `QuickHarvestForm`)

#### Il Mio Orto
- **PlantsView** (`/components/garden/PlantsView.tsx`):
  - Estrazione `PlantCard` da inline a componente separato
  - Integration harvest modal in tab Piante
  - Maturity detection e status badges
- **GardenView**: Aggiornato per supportare harvest trigger da tutte le tab

#### Salute
- **HealthDashboard** (`/components/health/HealthDashboard.tsx`):
  - Nuova sezione "Alert Automatici" con alert system
  - Stato generale orto con emoji (😊/😐/😟)
  - Alert ordinati per severity (critical > warning > info)
  - Handler risoluzione alert
  - Integrazione con storage provider methods

#### Onboarding
- **UserOnboardingWizard**: Aggiunto skip button per permettere dismissal
- **Dashboard** (`/app/(dashboard)/app/page.tsx`): Integration OnboardingBanner per nuovi utenti
- **GardenOnboarding**: Quick mode (3 step invece di 6) per onboarding veloce

#### Storage
- **Interface** (`/packages/core/storage/interface.ts`):
  - Aggiunto import `HealthAlert`
  - Aggiunti 5 metodi per health alerts
- **SupabaseStorageProvider** (`/packages/storage-cloud/SupabaseStorageProvider.ts`):
  - Implementati 5 metodi health alerts (linee 2996-3113)
  - Aggiunti mapper functions `mapHealthAlertFromDB` e `mapHealthAlertToDB`
- **LocalStorageProvider** (`/packages/storage-local/LocalStorageProvider.ts`):
  - Aggiunto `HEALTH_ALERTS` storage key
  - Implementati 5 metodi health alerts (linee 1432-1486)

#### Configurazione
- **vercel.json**: Aggiunta cron job `/api/cron/health-check` con schedule "0 8,20 * * *"
- **package.json**: Aggiunto script `test:health-check`

### Fixed

#### Bug Critici 🔴
- **Harvest trigger logic** (`ListView.tsx`):
  - **Problema**: `isPlantMature(task)` falliva per task non-Sowing/Transplant
  - **Fix**: Cerca `sowingTask` collegato prima di chiamare `isPlantMature()`
  - **Impatto**: Harvest modal ora appare correttamente per tutti i tipi di task
  - **Issue**: #FASE1-001

#### Bug Minori
- Navigazione confusa tra Planner/Calendario/Diario (ora unificati in "Il Mio Orto")
- Onboarding bloccante (ora progressivo e skippable)
- Missing health alerts interface methods (implementati in storage providers)

### Deprecated

- **QuickHarvestForm** (`/components/harvest/QuickHarvestForm.tsx`):
  - Sostituito da `HarvestPromptModal` unificato
  - Mantenuto per backward compatibility (da rimuovere in v2.0.0)

### Removed

Nessun file rimosso in questa versione (solo redirect mantenuti per backward compatibility).

### Security

- **RLS Policies** su tabella `health_alerts`:
  - Users can view only own alerts (garden_id match)
  - Users can update only own alerts
  - Service role can insert (per cron job)
- **Cron Secret**: Autenticazione richiesta per endpoint health-check
- **SQL Injection**: Parametrized queries in storage providers

### Performance

- **Weather API Caching**: 15 minuti TTL per ridurre API calls
- **Alert Deduplication**: Previene duplicati (stesso title + type + garden)
- **Database Indices**: 4 indici ottimizzati su `health_alerts` per query veloci
- **Batch Processing**: Cron job processa tutti i giardini in un singolo job

---

## [Unreleased]

### Planned for FASE 2

#### Features
- Tooltips contestuali per onboarding inline
- Push notifications per alert critici
- Email digest settimanale health alerts
- ML-based disease prediction
- Smart Hub sensor integration completa
- Alert prioritization intelligente
- Virtual scrolling per PlantsView (>50 piante)

#### Testing
- Unit tests (Jest + React Testing Library)
- Integration tests
- E2E tests (Playwright)
- Test coverage >80%

#### Performance
- Service Worker per offline mode
- Image lazy loading optimization
- Code splitting avanzato

#### Documentation
- API documentation (OpenAPI/Swagger)
- Component Storybook
- Video tutorials onboarding

---

## Versionamento

### Schema Versioning

Questo progetto usa [Semantic Versioning](https://semver.org/):

- **MAJOR version**: Breaking changes incompatibili
- **MINOR version**: Nuove features backward-compatible
- **PATCH version**: Bug fixes backward-compatible

### Versione Corrente: 1.0.0

- **1**: MAJOR - Prima release completa FASE 1
- **0**: MINOR - Nessuna feature oltre FASE 1
- **0**: PATCH - Zero bug fix post-release (prima release)

### Prossime Versioni Previste

- **1.0.1**: Hotfix se necessari post-deploy
- **1.1.0**: FASE 2 features (tooltips, notifications)
- **2.0.0**: Breaking changes (rimozione deprecated components)

---

## Migration Guide

### Da Pre-FASE1 a 1.0.0

#### Database Migration

**RICHIESTO**: Eseguire migration SQL

```bash
psql $DATABASE_URL < database/migrations/add_health_alerts.sql
```

**Cosa fa**:
- Crea tabella `health_alerts`
- Abilita RLS con policies
- Crea 4 indici
- Crea trigger `updated_at`

**Rollback**:
```sql
DROP TABLE IF EXISTS health_alerts CASCADE;
```

#### Code Changes

**Backward Compatible**: No breaking changes

**Opzionali** (per beneficiare delle nuove features):

1. **Aggiornare Sidebar components** se customizzati
2. **Sostituire QuickHarvestForm** con HarvestPromptModal
3. **Integrare OnboardingBanner** in dashboard custom

#### Environment Variables

**Nuove variabili richieste**:

```bash
# Per cron job (Vercel/produzione)
CRON_SECRET=your_random_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Generate CRON_SECRET:
# openssl rand -base64 32
```

#### Vercel Configuration

**RICHIESTO**: Aggiornare `vercel.json`

Se hai custom `vercel.json`, aggiungi:

```json
{
  "crons": [
    {
      "path": "/api/cron/health-check",
      "schedule": "0 8,20 * * *"
    }
  ]
}
```

---

## Testing Checklist

### Pre-Deploy Testing

- [ ] Database migration applicata in staging
- [ ] Build Next.js senza errori (`npm run build`)
- [ ] Type check senza errori (`npm run type-check`)
- [ ] Test health check locale (`npm run test:health-check`)
- [ ] Test manuale UX completo ([FASE1_TEST_PLAN.md](./docs/FASE1_TEST_PLAN.md))

### Post-Deploy Verification

- [ ] Cron job eseguita con successo (check Vercel logs)
- [ ] Alert generati visibili in `/app/advice`
- [ ] Harvest modal trigger funziona
- [ ] Onboarding banner appare per nuovi utenti
- [ ] Navigazione sidebar aggiornata
- [ ] No errori in browser console
- [ ] No breaking changes per utenti esistenti

---

## Known Issues

### v1.0.0

#### Minori
1. **Weather API**: Open-Meteo free non ha `humidity` (default 70%)
   - Workaround presente
   - Fix previsto: upgrade API in FASE 2

2. **Sensor Data**: Placeholder in cron job
   - Nessun impatto
   - Integration completa in FASE 2

3. **Alert Deduplication**: Solo per stesso `title + type + garden`
   - Possibili duplicati se messaggio diverso
   - Fix previsto: hash contenuto

#### Limitazioni
1. **Cron Frequency**: 2x/giorno (non real-time)
   - Design choice per costi API
   - Sufficiente per use case corrente

2. **LocalStorage**: No cron job support
   - Alert solo per utenti Supabase
   - Accettabile: feature PRO

---

## Contributors

- **Implementation**: Claude Sonnet 4.5 + Development Team
- **Design**: Basato su patterns OrtoMio esistenti
- **Testing**: Community (post-release)

---

## Support & Resources

### Documentation
- [FASE1_README.md](./docs/FASE1_README.md) - Panoramica
- [FASE1_QUICK_START.md](./docs/FASE1_QUICK_START.md) - Testing & Deploy
- [FASE1_IMPLEMENTAZIONE_COMPLETA.md](./docs/FASE1_IMPLEMENTAZIONE_COMPLETA.md) - Dettagli tecnici
- [MODIFICHE_DATABASE_FASE1.md](./database/MODIFICHE_DATABASE_FASE1.md) - Database

### Commands
```bash
npm run dev              # Sviluppo locale
npm run build            # Build produzione
npm run test:health-check  # Test cron job
npm run type-check       # Verifica TypeScript
```

### Links
- **Repository**: [GitHub Link]
- **Documentation**: `/docs/FASE1_*.md`
- **Issues**: [GitHub Issues]

---

**Versione**: 1.0.0
**Data Release**: 25 Dicembre 2024
**Status**: ✅ Stabile - Pronto per Production
