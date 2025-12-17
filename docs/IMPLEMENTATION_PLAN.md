# Piano d'Implementazione - OrtoMio AI

## Stato Attuale

### ✅ Completato

1. **Architettura Base**
   - ✅ Storage Abstraction Layer (`IStorageProvider`)
   - ✅ `LocalStorageProvider` implementato
   - ✅ `SupabaseStorageProvider` implementato
   - ✅ Factory pattern per creazione provider
   - ✅ Tier System (FREE/PRO) implementato
   - ✅ `TierProvider` e `useTier` hook

2. **Database**
   - ✅ Schema Supabase completo (`database/schema.sql`)
   - ✅ RLS policies configurate
   - ✅ Funzioni RPC implementate
   - ✅ Docker setup documentato

3. **Documentazione**
   - ✅ ARCHITECTURE.md
   - ✅ Setup guide (Docker, Cloud, Local)
   - ✅ Migration guide
   - ✅ Deploy strategy

### ⚠️ Incompleto / Da Migliorare

1. **Integrazione Storage Provider**
   - ⚠️ `App.tsx` usa ancora `StorageService` legacy invece di `IStorageProvider`
   - ⚠️ Componenti non utilizzano `storageProvider` passato come prop
   - ⚠️ Persistenza dati ancora sincrona (localStorage) invece di async (Supabase)

2. **Migrazione Dati**
   - ⚠️ Script migrazione localStorage → Supabase non completamente implementato
   - ⚠️ Wizard migrazione UI non implementato

3. **Testing**
   - ⚠️ Nessun test automatizzato
   - ⚠️ Test integrazione storage provider mancanti

4. **Documentazione**
   - ⚠️ ARCHITECTURE.md semplificato (manca Services Layer, UI Components dettagli)
   - ⚠️ Manca documentazione API dei servizi

---

## Piano d'Implementazione

### FASE 1: Migrazione App.tsx a IStorageProvider (Priorità ALTA)

**Obiettivo**: Sostituire completamente `StorageService` con `IStorageProvider` in `App.tsx`

**Task**:

1. **Refactoring App.tsx**
   - [ ] Convertire caricamento dati da sincrono a async
   - [ ] Sostituire `StorageService.getGardens()` con `storageProvider.getGardens()`
   - [ ] Sostituire `StorageService.getTasks()` con `storageProvider.getTasks()`
   - [ ] Sostituire `StorageService.getDevices()` con `storageProvider.getDevices()`
   - [ ] Convertire salvataggio dati da sincrono a async
   - [ ] Gestire loading states durante operazioni async
   - [ ] Gestire errori async con try/catch

2. **Gestione Stato Async**
   - [ ] Aggiungere loading state per inizializzazione
   - [ ] Aggiungere error state per gestione errori
   - [ ] Mostrare loading indicator durante caricamento dati
   - [ ] Mostrare error message se caricamento fallisce

3. **Testing**
   - [ ] Test con localStorage (Free tier)
   - [ ] Test con Supabase locale (Docker)
   - [ ] Verificare che dati vengano salvati correttamente
   - [ ] Verificare che dati vengano caricati correttamente

**Stima**: 2-3 giorni

**File da modificare**:
- `App.tsx`
- Eventuali componenti che accedono direttamente a StorageService

---

### FASE 2: Migrazione Componenti a Storage Provider (Priorità ALTA)

**Obiettivo**: Far utilizzare `IStorageProvider` a tutti i componenti invece di `StorageService`

**Task**:

1. **Analisi Componenti**
   - [ ] Identificare tutti i componenti che usano `StorageService`
   - [ ] Creare lista componenti da migrare

2. **Migrazione Componenti**
   - [ ] `Dashboard.tsx` - Usa `storageProvider` per gardens
   - [ ] `Planner.tsx` - Usa `storageProvider` per tasks
   - [ ] `Journal.tsx` - Usa `storageProvider` per tasks
   - [ ] `HarvestLog.tsx` - Usa `storageProvider` per harvest logs
   - [ ] `SeedInventory.tsx` - Usa `storageProvider` per seed packets
   - [ ] `SmartHub.tsx` - Usa `storageProvider` per devices
   - [ ] Altri componenti che accedono a storage

3. **Pattern da seguire**
   ```typescript
   // Passare storageProvider come prop o context
   interface ComponentProps {
     storageProvider: IStorageProvider;
   }
   
   // Usare async/await per operazioni
   const loadData = async () => {
     const data = await storageProvider.getGardens();
     setGardens(data);
   };
   ```

**Stima**: 3-4 giorni

**File da modificare**:
- Tutti i componenti in `components/`
- Servizi che usano StorageService

---

### FASE 3: Context per Storage Provider (Priorità MEDIA)

**Obiettivo**: Creare un React Context per `IStorageProvider` per evitare prop drilling

**Task**:

1. **Creare StorageContext**
   - [ ] Creare `packages/core/context/StorageContext.tsx`
   - [ ] Provider che fornisce `IStorageProvider` a tutti i componenti
   - [ ] Hook `useStorage()` per accedere al provider

2. **Integrare in App.tsx**
   - [ ] Wrappare app con `StorageProvider`
   - [ ] Rimuovere prop drilling di `storageProvider`

3. **Aggiornare Componenti**
   - [ ] Sostituire props con `useStorage()` hook
   - [ ] Rimuovere `storageProvider` dalle props

**Stima**: 1 giorno

**File da creare/modificare**:
- `packages/core/context/StorageContext.tsx`
- `packages/core/hooks/useStorage.ts`
- `App.tsx`
- Componenti che usano storage

---

### FASE 4: Migrazione Dati localStorage → Supabase (Priorità MEDIA)

**Obiettivo**: Implementare wizard migrazione completo per utenti Free → Pro

**Task**:

1. **Script Migrazione**
   - [ ] Creare `scripts/migrateLocalToCloud.ts`
   - [ ] Funzione `createBackup()` - Backup dati localStorage
   - [ ] Funzione `migrateLocalToCloud()` - Migrazione dati
   - [ ] Gestione errori e rollback
   - [ ] Validazione dati prima di migrare

2. **UI Wizard**
   - [ ] Creare componente `MigrationWizard.tsx` (già esiste, verificare)
   - [ ] Preview dati da migrare
   - [ ] Progress indicator durante migrazione
   - [ ] Success/error feedback
   - [ ] Opzione rollback

3. **Testing**
   - [ ] Test migrazione gardens
   - [ ] Test migrazione tasks
   - [ ] Test migrazione seed inventory
   - [ ] Test migrazione harvest logs
   - [ ] Test rollback

**Stima**: 2-3 giorni

**File da creare/modificare**:
- `scripts/migrateLocalToCloud.ts`
- `components/MigrationWizard.tsx` (verificare se esiste)
- `services/migrationService.ts`

---

### FASE 5: Completamento ARCHITECTURE.md (Priorità BASSA)

**Obiettivo**: Aggiornare documentazione architettura con dettagli completi

**Task**:

1. **Aggiungere sezioni mancanti**
   - [ ] Services Layer - Documentare tutti i servizi
   - [ ] UI Components - Lista completa componenti
   - [ ] Logic Engines - Lista completa (30+ engines)
   - [ ] Pattern Architetturali - Documentare pattern usati
   - [ ] Flusso Dati - Dettagliare flusso Free vs Pro

2. **Migliorare diagrammi**
   - [ ] Aggiungere Services Layer al diagramma
   - [ ] Aggiungere flussi dati dettagliati
   - [ ] Aggiungere diagramma sequenza operazioni

3. **Aggiungere esempi**
   - [ ] Esempi codice per ogni layer
   - [ ] Esempi utilizzo hooks
   - [ ] Esempi pattern implementati

**Stima**: 1-2 giorni

**File da modificare**:
- `docs/ARCHITECTURE.md`

---

### FASE 6: Testing e Validazione (Priorità ALTA)

**Obiettivo**: Assicurare che tutto funzioni correttamente

**Task**:

1. **Test Manuali Free Tier**
   - [ ] Test senza Supabase configurato
   - [ ] Verificare localStorage funziona
   - [ ] Verificare limiti Free applicati
   - [ ] Verificare upgrade prompts

2. **Test Manuali Pro Tier**
   - [ ] Avviare Docker Supabase
   - [ ] Configurare `.env` con credenziali Supabase
   - [ ] Impostare tier PRO
   - [ ] Verificare connessione Supabase
   - [ ] Test CRUD operations
   - [ ] Verificare dati in Supabase Studio
   - [ ] Test funzionalità Pro (time-lapse, analytics, etc.)

3. **Test Migrazione**
   - [ ] Creare dati in localStorage (Free)
   - [ ] Eseguire migrazione a Supabase
   - [ ] Verificare dati migrati correttamente
   - [ ] Test rollback

4. **Test Performance**
   - [ ] Verificare tempi caricamento dati
   - [ ] Verificare caching funziona
   - [ ] Test con grandi quantità di dati

**Stima**: 2-3 giorni

---

### FASE 7: Refactoring StorageService (Priorità BASSA)

**Obiettivo**: Deprecare `StorageService` e mantenere solo per compatibilità legacy

**Task**:

1. **Mark StorageService come deprecated**
   - [ ] Aggiungere `@deprecated` JSDoc
   - [ ] Aggiungere warning in console quando usato
   - [ ] Documentare migration path

2. **Mantenere per compatibilità**
   - [ ] Mantenere `StorageService` per backward compatibility
   - [ ] Internamente può usare `LocalStorageProvider`
   - [ ] Pianificare rimozione in versione futura

**Stima**: 0.5 giorni

**File da modificare**:
- `services/storageService.ts`

---

## Priorità Implementazione

### 🔴 CRITICO (Fare subito)

1. **FASE 1**: Migrazione App.tsx a IStorageProvider
   - Blocca utilizzo Supabase
   - Necessario per funzionalità Pro

2. **FASE 2**: Migrazione Componenti
   - Necessario per coerenza architetturale
   - Blocca sviluppo nuove features

### 🟡 IMPORTANTE (Fare presto)

3. **FASE 6**: Testing e Validazione
   - Assicura qualità implementazione
   - Identifica bug prima di deploy

4. **FASE 4**: Migrazione Dati
   - Necessario per utenti esistenti
   - Migliora UX upgrade Free → Pro

### 🟢 UTILE (Fare quando possibile)

5. **FASE 3**: Context per Storage Provider
   - Migliora developer experience
   - Riduce prop drilling

6. **FASE 5**: Completamento ARCHITECTURE.md
   - Migliora documentazione
   - Aiuta onboarding nuovi sviluppatori

7. **FASE 7**: Refactoring StorageService
   - Pulizia codice
   - Non urgente

---

## Checklist Pre-Deploy

Prima di fare deploy su Vercel (Free) o pubblicare Pro:

- [ ] FASE 1 completata - App.tsx usa IStorageProvider
- [ ] FASE 2 completata - Componenti usano IStorageProvider
- [ ] FASE 6 completata - Test manuali passati
- [ ] Build senza errori: `npm run build`
- [ ] Test locale Free (senza Supabase): funziona
- [ ] Test locale Pro (con Docker): funziona
- [ ] Nessun errore in console browser
- [ ] Dati salvati correttamente (localStorage o Supabase)
- [ ] Limit indicators funzionano (Free tier)
- [ ] Upgrade prompts appaiono (Free tier)
- [ ] Funzionalità Pro disponibili (Pro tier)

---

## Note Implementazione

### Docker Setup

Se Docker è in esecuzione:

```bash
# Verifica container
docker ps

# Se Supabase non è avviato
cd docker
docker-compose up -d

# Verifica Supabase Studio
open http://localhost:3000
```

### Variabili Ambiente

**Free Tier (Vercel)**:
```env
VITE_GEMINI_API_KEY=your_key
# NON configurare VITE_SUPABASE_URL
```

**Pro Tier (Locale)**:
```env
VITE_GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Testing Strategy

1. **Test Free**: Rimuovere variabili Supabase da `.env`
2. **Test Pro**: Configurare Supabase locale (Docker)
3. **Test Migrazione**: Creare dati in localStorage, poi migrare

---

## Timeline Stimata

- **FASE 1**: 2-3 giorni
- **FASE 2**: 3-4 giorni
- **FASE 3**: 1 giorno
- **FASE 4**: 2-3 giorni
- **FASE 5**: 1-2 giorni
- **FASE 6**: 2-3 giorni
- **FASE 7**: 0.5 giorni

**Totale**: ~12-17 giorni lavorativi

**Priorità CRITICA**: ~7-10 giorni lavorativi

---

## Rischi e Mitigazioni

### Rischio 1: Perdita dati durante migrazione
- **Mitigazione**: Backup automatico prima di migrare
- **Mitigazione**: Test completo su dati di test

### Rischio 2: Performance degradate con async
- **Mitigazione**: Implementare loading states
- **Mitigazione**: Caching intelligente
- **Mitigazione**: Lazy loading componenti

### Rischio 3: Incompatibilità con codice esistente
- **Mitigazione**: Mantenere StorageService per compatibilità
- **Mitigazione**: Migrazione graduale componente per componente
- **Mitigazione**: Test estensivi

---

## Prossimi Passi Immediati

1. ✅ **Ora**: Creare questo piano (completato)
2. 🔄 **Prossimo**: Iniziare FASE 1 - Migrazione App.tsx
3. ⏳ **Dopo**: Continuare con FASE 2 - Migrazione Componenti

---

**Data creazione**: 2025-01-XX
**Ultimo aggiornamento**: 2025-01-XX
**Stato**: 🟡 In Attesa Implementazione













