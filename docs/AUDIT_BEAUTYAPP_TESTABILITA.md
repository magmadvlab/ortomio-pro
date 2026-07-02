# Audit Testabilita BeautyApp

Data audit: 2026-07-01

Documento collegato: `docs/PIANO_MAESTRO_BEAUTYAPP_PITSTOP_HAPPYPET.md`

## Sintesi

BeautyApp e la base piu matura tra i tre prodotti, ma oggi non e ancora "funzionante da test" nel senso operativo richiesto.

Ha gia molte superfici importanti:

- dashboard attivita;
- area cliente;
- prenotazione pubblica;
- server actions;
- cron;
- notifiche/outbox;
- orchestratore proattivo;
- console produzione;
- billing scaffold;
- schema Drizzle modulare;
- migration Supabase.

Il problema principale e che la verifica attuale e ancora parziale:

- `check:release` controlla soprattutto presenza di file e stringhe;
- `smoke:production` controlla health e cron, non il flusso business;
- non esistono test applicativi versionati;
- non esistono comandi demo/reset;
- non esiste un E2E minimo cliente -> prenotazione -> attivita -> notifica -> passport.

Conclusione: BeautyApp e funzionalmente avanti, ma va trasformata in una app riproducibile e verificabile.

## Stato Script

Script presenti in `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
npm run db:check-production
npm run check:release
npm run smoke:production
```

Script mancanti per il livello richiesto:

```bash
npm run test:e2e
npm run test:smoke-local
```

Script aggiunti nel primo blocco P0:

```bash
npm run demo:reset
npm run demo:seed
npm run test:business-flow
npm run test:next-availability-flow
npm run test:treatment-close-flow
npm run test:full-trial-flow
npm run test:e2e-public-booking
npm run test:e2e-browser-booking
```

## Superfici Presenti

### Lato Cliente

Route presenti:

- `/b/[slug]` pagina pubblica prenotazione;
- `/account/prenotazioni`;
- `/account/prenotazioni/[id]/sposta`;
- `/account/passaporto`;
- `/esplora`;
- `/onboarding/cliente`.

Valutazione:

- buona base per PWA cliente;
- gia esiste separazione route customer/dashboard;
- manca ancora installabilita PWA cliente completa;
- manca test automatico del flusso cliente.

### Lato Attivita

Route presenti:

- `/dashboard`;
- `/dashboard/prenotazioni`;
- `/dashboard/prenotazioni/nuova`;
- `/dashboard/prenotazioni/[id]`;
- `/dashboard/prenotazioni/[id]/chiudi`;
- `/dashboard/clienti`;
- `/dashboard/clienti/[id]`;
- `/dashboard/servizi`;
- `/dashboard/disponibilita`;
- `/dashboard/prodotti`;
- `/dashboard/azioni`;
- `/dashboard/notifiche`;
- `/dashboard/impostazioni`;
- `/dashboard/billing`;
- `/dashboard/produzione`.

Valutazione:

- superficie gestionale molto completa;
- buona base per attivita reale;
- manca test automatico di configurazione minima attivita.

### API/Cron

Route presenti:

- `/api/health`;
- `/api/cron/reminders`;
- `/api/cron/proactive`;
- `/api/cron/notifications/retry`.

Valutazione:

- smoke production gia presente;
- manca smoke locale con dati demo;
- manca verifica che cron generi davvero notifiche/azioni con fixture note.

## Schema E Moduli

Schema Drizzle modulare presente:

- `businesses`;
- `billing`;
- `customers`;
- `services`;
- `calendar`;
- `appointments`;
- `journey`;
- `operations`;
- `products`;
- `capabilities`;
- `preferences`;
- `proactive-rules`.

Moduli business importanti:

- `src/lib/slots.ts`;
- `src/lib/orchestrator/index.ts`;
- `src/lib/notifications.ts`;
- `src/lib/notification-retry.ts`;
- `src/lib/proactive-policy.ts`;
- `src/lib/proactive-rules.ts`;
- `src/lib/production-checks.ts`;
- `src/lib/business.ts`;
- `src/lib/customer.ts`;
- `src/lib/billing.ts`.

Valutazione:

- architettura adatta a diventare base madre;
- prima di estrarre core comune serve stabilizzare i flussi con test.

## Check Esistenti

### `check:release`

File: `scripts/check-release-readiness.mjs`

Controlla:

- console produzione;
- console notifiche;
- automazione proattiva;
- impostazioni proattive;
- catalogo prodotti;
- profilo pubblico multi-verticale;
- piano completamento.

Limite:

- controlla presenza di stringhe, non comportamento reale;
- non verifica database;
- non verifica seed demo;
- non verifica prenotazione;
- non verifica creazione cliente/appuntamento;
- non verifica passport;
- non verifica conversione proattiva.

### `db:check-production`

File: `scripts/check-production-db.ts`

Controlla:

- migration/table/column critiche da `0008` a `0016`;
- billing tables;
- notification observability;
- cron runs.

Limite:

- richiede `DATABASE_URL`;
- e production-oriented;
- non crea fixture;
- non verifica flusso business.

### `smoke:production`

File: `scripts/smoke-production.ts`

Controlla:

- `/api/health`;
- `/api/cron/reminders`;
- `/api/cron/proactive`;
- `/api/cron/notifications/retry`.

Limite:

- non verifica UI;
- non verifica dati generati;
- non verifica prenotazione pubblica;
- non verifica area cliente.

## Gap Prioritari

### P0 - Dati Demo E Reset

Senza dati demo ripetibili non possiamo testare fedelmente.

Da creare:

- [x] business demo;
- [x] sede demo;
- [x] operatori demo;
- [x] cliente demo;
- [x] servizi demo;
- [x] disponibilita demo;
- [x] appuntamento demo;
- [x] prodotto demo;
- [x] notifica demo;
- [x] azione proattiva demo;
- [x] passport demo.

Comandi target:

```bash
npm run demo:reset
npm run demo:seed
```

Stato:

- completato con business demo `beauty-demo-test`;
- seed verificato con output `Demo seed complete: /b/beauty-demo-test`.

### P0 - Check Release Strutturale

`check:release` deve diventare piu severo.

Da aggiungere:

- [x] verifica script demo;
- [x] verifica script e2e o smoke locale;
- [x] verifica route customer critiche;
- [x] verifica route dashboard critiche;
- [x] verifica server actions critiche;
- [x] verifica migration critiche fino a `0018`;
- [x] verifica PWA manifest;
- [x] verifica che i documenti di piano siano presenti.

Stato:

- completato come check strutturale iniziale;
- manifest PWA verificato dopo risoluzione conflitto `/manifest.webmanifest`;
- icone PNG/maskable aggiunte e verificate;
- resta la verifica di installabilita completa da affrontare nella Fase 2.

### P1 - Smoke Locale Business

Prima di Playwright serve uno smoke locale/API semplice.

Flusso minimo:

1. dati demo presenti;
2. business demo leggibile;
3. servizi demo leggibili;
4. slot disponibili calcolabili;
5. prenotazione demo creabile;
6. notifica demo creabile;
7. azione proattiva demo generabile.

Comando target:

```bash
npm run test:business-flow
```

Stato:

- completato come primo smoke tecnico;
- verifica righe demo per business, servizio, sede, operatore, cliente, disponibilita, appuntamento, notifica, azione proattiva e passport;
- prova una creazione appuntamento/notifica/azione in transazione con rollback.

### P1 - Smoke Chiusura Trattamento E Passport

Comando aggiunto:

```bash
npm run test:treatment-close-flow
```

Stato:

- completato come smoke tecnico della parte attivita/passport;
- verifica appuntamento completato;
- verifica creazione passport visibile al cliente;
- verifica evento stato `completato`;
- verifica completamento azione `missing_passport`;
- verifica collegamento prodotto al passport;
- verifica generazione azioni `follow_up` e `rebook`;
- usa transazione con rollback.

Output verificato:

```text
OK appointment completed
OK passport visible
OK status event completed
OK missing passport completed
OK passport product linked
OK follow up action generated
OK rebook action generated
OK treatment close flow demo data and rollback write path
```

### P1 - Calendario Pieno E Prima Data Utile

Comando aggiunto:

```bash
npm run test:next-availability-flow
```

Stato:

- completato come smoke tecnico del caso calendario saturo;
- crea appuntamenti temporanei marcati `Next availability flow check`;
- satura tutti gli slot del mese demo visibile;
- verifica che il mese non abbia piu giorni prenotabili;
- verifica che `fetchNextAvailableSlot` trovi automaticamente la prima disponibilita successiva;
- esegue cleanup mirato finale delle righe create.

Output verificato:

```text
OK saturation appointments 40
OK saturated visible month
OK next available slot 2026-08-04 09:00
OK next availability flow with saturated calendar
```

### P1 - Trial Full 30 Giorni

Comando aggiunto:

```bash
npm run test:full-trial-flow
```

Stato:

- completato come smoke tecnico del trial aziende;
- verifica piano `trial_full_30`;
- verifica subscription `trialing`;
- verifica durata 30 giorni;
- verifica limiti full: sedi e operatori senza limite;
- verifica WhatsApp e proattivita inclusi.

Output verificato:

```text
OK full trial plan
OK full trial subscription
OK full trial duration 30 days
OK full trial entitlements
```

### P1 - E2E Browser Minimo

Solo dopo i dati demo.

Primo step completato senza nuove dipendenze:

- `npm run test:e2e-public-booking`;
- richiede un dev server raggiungibile;
- usa `E2E_BASE_URL`, `SMOKE_BASE_URL` o `NEXT_PUBLIC_APP_URL`;
- verifica pagina pubblica demo, rendering business, rendering servizio e `/api/health`.

Flusso:

1. apri pagina pubblica `/b/[slug]`;
2. seleziona servizio;
3. seleziona slot;
4. inserisci dati cliente;
5. crea prenotazione;
6. accedi lato dashboard;
7. verifica prenotazione;
8. chiudi trattamento;
9. verifica passport/area cliente.

Comando target:

```bash
npm run test:e2e
```

Comando intermedio disponibile:

```bash
E2E_BASE_URL=http://127.0.0.1:3015 npm run test:e2e-public-booking
```

Comando browser aggiunto:

```bash
E2E_BASE_URL=http://127.0.0.1:3015 npm run test:e2e-browser-booking
```

Stato:

- script creato in BeautyApp come `scripts/browser-public-booking-e2e.mjs`;
- non introduce Playwright o nuove dipendenze: usa Google Chrome headless via Chrome DevTools Protocol;
- flusso previsto: pagina pubblica, scelta servizio, calendario, slot, form ospite, conferma, verifica appuntamento su DB;
- correzioni gia applicate: selettore calendario per `7 10p`/`7 10!`, cleanup Chrome temporaneo, uso di `Primo disponibile`, attesa idratazione React prima del click servizio;
- calendario saturo coperto separatamente da `npm run test:next-availability-flow`;
- comando verde su `http://127.0.0.1:3015/b/beauty-demo-test`;
- ultimo output verificato: `OK browser guest booking flow` e `OK appointment created for +393335680009`.

Nota tecnica risolta:

- conflitto `/manifest.webmanifest` risolto eliminando il file statico duplicato `public/manifest.webmanifest`;
- `src/app/manifest.ts` e ora l'unica fonte del manifest;
- verifica locale: `GET /manifest.webmanifest` risponde `200` con `content-type: application/manifest+json`.

Nota icone PWA:

- generatore aggiunto: `scripts/generate-pwa-icons.mjs`;
- asset generati: `public/icons/icon-192.png` e `public/icons/icon-512.png`;
- verifica file: PNG RGBA 192x192 e 512x512;
- manifest aggiornato con `purpose: maskable`.

### P2 - PWA Cliente

Da fare dopo testabilita base:

- manifest mirato alla customer app;
- icone PNG/maskable;
- layout mobile-first;
- installabilita;
- area cliente chiara;
- aziende collegate;
- appuntamenti;
- passport;
- notifiche;
- consensi.

## Primo Blocco Implementativo Consigliato

Ordine fedele:

1. [x] Aggiungere `scripts/demo-reset.ts`.
2. [x] Aggiungere `scripts/demo-seed.ts`.
3. [x] Aggiungere script `demo:reset` e `demo:seed` in `package.json`.
4. [x] Estendere `check-release-readiness.mjs` per richiedere gli script demo.
5. [x] Aggiungere `scripts/check-business-flow.ts`.
6. [x] Aggiungere script `test:business-flow`.
7. [ ] Solo dopo introdurre E2E browser.

## Gate Fase 1.1

Audit completato quando:

- la struttura attuale e mappata;
- i gap sono ordinati;
- il primo blocco implementativo e chiaro.

Stato: completato come audit iniziale. Primo blocco P0 demo/business-flow completato dopo audit.

## Prossima Azione Operativa

Entrare in BeautyApp e implementare il blocco P0:

```bash
cd /Volumes/990P/beautyapp
```

Poi:

1. rendere `check:release` piu strutturale su route/schema/env;
2. aggiungere smoke locale/API piu vicino al comportamento utente;
3. introdurre E2E browser sul flusso `/b/beauty-demo-test`;
4. avviare la fase PWA cliente solo dopo un E2E minimo verde.

Verifiche eseguite:

```bash
npm run check:release
npx tsc --noEmit --tsBuildInfoFile /private/tmp/beautyapp-p0-tsconfig.tsbuildinfo
npm run demo:reset
npm run demo:seed
npm run test:business-flow
npm run test:treatment-close-flow
```

Secondo avanzamento eseguito:

```bash
npm run check:release
npx tsc --noEmit --tsBuildInfoFile /private/tmp/beautyapp-checkrelease-tsconfig.tsbuildinfo
npm run test:business-flow
npm run test:full-trial-flow
```

Terzo avanzamento eseguito:

```bash
npm run dev -- -p 3015
E2E_BASE_URL=http://127.0.0.1:3015 npm run test:e2e-public-booking
```

Quarto avanzamento eseguito:

```bash
E2E_BASE_URL=http://127.0.0.1:3015 npm run test:e2e-browser-booking
```

Esito:

- script E2E browser aggiunto e progressivamente corretto;
- la funzione applicativa `fetchMonthAvailability` e stata verificata via `tsx` e restituisce disponibilita per i martedi di luglio 2026;
- il test e stato corretto per attendere l'idratazione React prima di cliccare il servizio;
- il test compila il form ospite, conferma la prenotazione e verifica la creazione appuntamento sul DB;
- output finale: `OK browser guest booking flow http://127.0.0.1:3015/b/beauty-demo-test`;
- output finale: `OK appointment created for +393335680009`.
