# Piano Maestro - BeautyApp, PitStop, HappyPet

Data avvio: 2026-07-01

## Obiettivo

Portare BeautyApp a un livello realmente funzionante e testabile, poi allineare PitStop e HappyPet allo stesso standard operativo.

Le tre applicazioni hanno finalita diverse, ma condividono una logica business molto simile:

- una attivita eroga servizi;
- un cliente finale prenota, riceve comunicazioni e conserva storico;
- operatori e sedi gestiscono agenda, interventi, trattamenti e richiami;
- il sistema genera azioni proattive per riportare il cliente;
- lato attivita e lato cliente devono restare separati, ma comunicare in modo continuo;
- la parte cliente deve evolvere in una PWA installabile su smartphone.

Questo piano va seguito in ordine. Non si passa alla fase successiva senza aver superato il gate della fase precedente.

## Principi

1. BeautyApp e la base madre.
2. Prima si rende BeautyApp testabile, poi si allineano PitStop e HappyPet.
3. Ogni decisione deve essere verificabile con dati demo, test o check automatici.
4. Lato attivita e lato cliente sono superfici distinte.
5. La PWA cliente deve poter dialogare con piu aziende, non solo con una singola attivita.
6. Il core comune si estrae solo dopo aver stabilizzato i tre prodotti.

## Modello Comune

| Concetto comune | BeautyApp | PitStop | HappyPet |
| --- | --- | --- | --- |
| Attivita | salone, studio, spa | officina, gommista, carrozzeria | toelettatura, pet shop |
| Cliente | cliente beauty | cliente officina | proprietario animale |
| Oggetto/storico | Beauty Passport | veicolo/intervento | animale/trattamento |
| Servizio | trattamento | intervento/lavorazione | grooming service |
| Appuntamento | prenotazione | prenotazione/intervento | appuntamento |
| Operatore | stylist/estetista | meccanico/accettatore | groomer |
| Azione proattiva | richiamo trattamento/prodotto | manutenzione/scadenza | ricorrenza cura |
| Notifica | WhatsApp/email/outbox | WhatsApp/email/outbox | WhatsApp/email/outbox |
| Area cliente | passport cliente | portale cliente/veicolo | portale proprietario/animale |

## Architettura Di Distribuzione

Ogni prodotto deve avere due superfici:

| Superficie | Utente | Scopo |
| --- | --- | --- |
| App attivita | azienda, operatori, admin | gestione agenda, servizi, clienti, notifiche, richiami, produzione |
| App cliente / PWA | cliente finale | prenotare, confermare, vedere storico, ricevere messaggi, gestire consensi |

La PWA cliente deve diventare una esperienza mobile installabile. Nel medio periodo deve poter mostrare piu aziende collegate allo stesso cliente.

Esempio:

- cliente collegato a un salone BeautyApp;
- stesso cliente collegato a una officina PitStop;
- stesso cliente collegato a una toelettatura HappyPet;
- una sola area cliente mostra contesti separati, notifiche e azioni disponibili.

## Stato Iniziale

| App | Stato attuale | Problema principale | Priorita |
| --- | --- | --- | --- |
| BeautyApp | piu completa come piattaforma | va resa davvero testabile end-to-end | 1 |
| PitStop | flusso verticale solido e testato | va allineata al modello SaaS/cliente di BeautyApp | 2 |
| HappyPet | buona idea e stack recente | contiene ancora legacy e va ripulita | 3 |

## Fase 0 - Piano E Modello Operativo

Obiettivo: fissare il piano e usarlo come riferimento fedele.

Checklist:

- [x] Creare documento maestro.
- [ ] Confermare che BeautyApp e la base madre.
- [ ] Confermare che PitStop e HappyPet non si toccano prima del gate BeautyApp.
- [ ] Creare se necessario un documento di avanzamento per ogni app.
- [ ] Ogni intervento futuro deve indicare quale fase e quale gate sta servendo.

Gate:

- Il piano esiste in repository.
- Le fasi sono ordinate.
- I criteri di completamento sono espliciti.

## Fase 1 - BeautyApp Testabile

Obiettivo: BeautyApp deve diventare verificabile da zero con dati demo e flusso end-to-end.

### 1.1 Audit Testabilita

Checklist:

- [x] Leggere struttura attuale BeautyApp.
- [x] Mappare script disponibili: `check:release`, `smoke:production`, build, type-check, eventuali seed.
- [x] Mappare route lato attivita.
- [x] Mappare route lato cliente.
- [x] Mappare flussi prenotazione, notifiche, proattivita e passport.
- [x] Elencare cosa e gia verificato automaticamente.
- [x] Elencare cosa oggi richiede controllo manuale.

Output:

- documento `docs/AUDIT_BEAUTYAPP_TESTABILITA.md` nel workspace corrente;
- lista gap ordinata per priorita.

Gate:

- sappiamo esattamente quali flussi BeautyApp copre e quali no.

### 1.2 Dati Demo Stabili

Checklist:

- [x] Definire business demo.
- [x] Definire sedi demo.
- [x] Definire operatori demo.
- [x] Definire clienti demo.
- [x] Definire servizi demo.
- [x] Definire appuntamenti demo.
- [x] Definire prodotti demo.
- [x] Definire notifiche demo.
- [x] Definire azioni proattive demo.
- [x] Creare comando seed demo.
- [x] Creare comando reset demo.

Comandi attesi:

```bash
npm run demo:reset
npm run demo:seed
```

Gate:

- da database pulito o stato noto si puo ricreare sempre lo stesso scenario demo.

Stato:

- completato in BeautyApp con business demo `beauty-demo-test`;
- comandi verificati: `npm run demo:reset`, `npm run demo:seed`.

### 1.3 Check Release Piu Severo

Checklist:

- [x] Estendere `npm run check:release`.
- [x] Verificare presenza route critiche.
- [x] Verificare presenza schema/tabelle critiche.
- [x] Verificare configurazione minima env.
- [x] Verificare outbox notifiche.
- [x] Verificare cron proattivo.
- [x] Verificare pagina pubblica prenotazione.
- [x] Verificare area cliente/passport.
- [x] Fallire con messaggi leggibili se manca qualcosa.

Comandi obbligatori:

```bash
npm run check:release
npx tsc --noEmit
npm run build
```

Gate:

- `check:release` non e solo presenza file, ma controllo reale delle superfici critiche.

Stato:

- completato come check strutturale iniziale: `check:release` controlla script package, route cliente/attivita, action critiche, schema export, migrazioni richieste ed env example;
- resta da affiancare E2E browser, ma non da sostituire questo check.

### 1.4 Test Flusso Attivita

Checklist:

- [ ] Login attivita.
- [ ] Onboarding o selezione business.
- [ ] Configurazione identita attivita.
- [ ] Creazione/modifica sede.
- [ ] Creazione/modifica operatore.
- [ ] Creazione/modifica servizio.
- [ ] Configurazione disponibilita.
- [ ] Vista dashboard.
- [ ] Vista agenda.
- [ ] Gestione appuntamento.

Gate:

- un operatore puo configurare una attivita minima senza interventi manuali nel database.

### 1.5 Test Flusso Cliente

Checklist:

- [ ] Apertura pagina pubblica attivita.
- [ ] Scelta servizio.
- [ ] Scelta sede, se presente.
- [ ] Scelta operatore, se presente.
- [ ] Scelta slot disponibile.
- [x] Prima data utile visibile quando il mese e pieno.
- [ ] Inserimento dati cliente.
- [ ] Creazione prenotazione.
- [ ] Conferma visibile lato attivita.
- [ ] Storico visibile lato cliente.

Gate:

- il cliente puo prenotare e l'attivita vede la prenotazione.

### 1.6 Test Notifiche E Proattivita

Checklist:

- [ ] Generazione evento notifica.
- [ ] Stato notifica leggibile.
- [ ] Retry o errore operativo visibile.
- [ ] Generazione azione proattiva.
- [ ] Azione manuale approvabile.
- [ ] Azione automatica controllata da impostazioni.
- [ ] Conversione azione -> prenotazione.

Gate:

- il sistema non solo registra appuntamenti, ma genera e traccia ritorni.

Stato:

- primo smoke tecnico completato con `npm run test:business-flow`;
- il check verifica business, servizio, sede, operatore, cliente, disponibilita, appuntamento, notifica, azione proattiva e passport, poi prova una scrittura transazionale con rollback.

### 1.7 Test Passport Cliente

Checklist:

- [x] Creazione trattamento chiuso.
- [x] Creazione storico cliente.
- [x] Collegamento prodotto o routine, se disponibile.
- [x] Visibilita lato cliente.
- [ ] Consensi rispettati.

Gate:

- il cliente ha una memoria utile del servizio ricevuto.

Stato:

- smoke tecnico aggiunto in BeautyApp come `npm run test:treatment-close-flow`;
- verifica appuntamento completato, creazione passport visibile, status event, completamento azione `missing_passport`, collegamento prodotto, generazione azioni `follow_up` e `rebook`;
- usa transazione con rollback, quindi puo essere ripetuto senza sporcare il database demo.

### 1.8 Test End-To-End Minimo

Comando atteso:

```bash
npm run test:e2e
```

Primo comando intermedio aggiunto:

```bash
npm run test:e2e-public-booking
```

Flusso minimo:

1. seed demo;
2. login attivita;
3. configurazione base;
4. prenotazione pubblica;
5. gestione appuntamento;
6. chiusura trattamento;
7. generazione notifica;
8. generazione azione proattiva;
9. verifica area cliente/passport.

Gate finale Fase 1:

- BeautyApp e dimostrabile con test e dati demo.
- Ogni nuovo lavoro puo partire da uno stato noto.

Stato:

- primo smoke E2E pubblico completato su `http://127.0.0.1:3015/b/beauty-demo-test`;
- verifica rendering pagina pubblica, business demo, servizio demo e `/api/health`;
- script E2E browser completo aggiunto in BeautyApp come `npm run test:e2e-browser-booking`;
- `test:e2e-browser-booking` verde su `http://127.0.0.1:3015/b/beauty-demo-test`;
- il test browser seleziona servizio, giorno, orario, compila il form ospite, conferma la prenotazione e verifica la nuova riga appuntamento su DB.
- aggiunto `npm run test:next-availability-flow`: satura il mese demo, verifica che il calendario non abbia giorni prenotabili e che la prima data utile successiva venga trovata automaticamente.

### 1.9 Trial Aziende

Checklist:

- [x] Definire periodo di prova aziende.
- [x] Impostare trial full a 30 giorni.
- [x] Creare piano `trial_full_30`.
- [x] Collegare le nuove aziende al piano trial full.
- [x] Verificare entitlement full: sedi illimitate, operatori illimitati, WhatsApp incluso, proattivita inclusa.

Gate:

- ogni nuova azienda parte con esperienza completa per 30 giorni.

Stato:

- implementato in BeautyApp con `src/lib/trial.ts`;
- `createBusiness` usa `trial_full_30` e `getFullTrialEndsAt`;
- aggiunta migrazione `0019_full_trial_30_days.sql`;
- aggiunto smoke `npm run test:full-trial-flow`.

## Fase 2 - BeautyApp PWA Cliente

Obiettivo: separare davvero lato cliente e lato attivita.

Checklist:

- [ ] Definire route cliente dedicate.
- [x] Aggiungere manifest PWA.
- [x] Aggiungere icone PWA.
- [ ] Rendere layout mobile-first.
- [ ] Aggiungere installabilita smartphone.
- [ ] Login/magic link cliente.
- [ ] Elenco aziende collegate.
- [ ] Appuntamenti futuri.
- [ ] Storico/passport.
- [ ] Notifiche ricevute.
- [ ] Azioni disponibili: prenota, conferma, sposta, rispondi.
- [ ] Gestione consensi.

Gate:

- un cliente puo usare BeautyApp da smartphone senza entrare nella dashboard attivita.

Nota tecnica risolta durante test locale:

- risolto il conflitto su `/manifest.webmanifest` rimuovendo il file statico duplicato e mantenendo `src/app/manifest.ts` come unica fonte Next;
- manifest verificato con risposta `200` e `content-type: application/manifest+json`;
- aggiunte icone PWA PNG/maskable `public/icons/icon-192.png` e `public/icons/icon-512.png`;
- resta da verificare l'installabilita mobile completa in browser.

## Fase 3 - BeautyApp Produzione Robusta

Obiettivo: ogni deploy deve avere stato verde/rosso chiaro.

Checklist:

- [ ] Smoke test produzione.
- [ ] Controllo migrazioni.
- [ ] Controllo env.
- [ ] Controllo Supabase.
- [ ] Controllo WhatsApp/outbox.
- [ ] Controllo cron.
- [ ] Checklist post-deploy.
- [ ] CI minima, se possibile.

Comandi attesi:

```bash
npm run check:release
npm run smoke:production
npm run build
```

Gate:

- un deploy non viene considerato valido senza check automatici verdi.

## Fase 4 - Allineamento PitStop

Obiettivo: portare PitStop allo standard BeautyApp mantenendo il dominio officina.

Checklist:

- [ ] Audit differenze rispetto a BeautyApp.
- [ ] Allineare modello business/attivita.
- [ ] Allineare ruoli/operatori/sedi.
- [ ] Separare lato cliente e lato officina.
- [ ] Creare PWA cliente.
- [ ] Allineare notification events/outbox.
- [ ] Allineare orchestratore proattivo.
- [ ] Creare dati demo/reset.
- [ ] Creare check release.
- [ ] Creare test flusso cliente/officina.

Flusso gate:

1. cliente prenota;
2. officina gestisce intervento;
3. sistema invia/traccia notifica;
4. sistema genera richiamo;
5. richiamo si converte in nuova prenotazione.

Gate:

- PitStop raggiunge lo standard BeautyApp per testabilita e separazione cliente/attivita.

## Fase 5 - Allineamento HappyPet

Obiettivo: pulire HappyPet dal legacy e portarla allo stesso standard.

Checklist:

- [ ] Audit legacy Vena Machine.
- [ ] Isolare o rimuovere route non coerenti.
- [ ] Consolidare proprietari.
- [ ] Consolidare animali.
- [ ] Consolidare servizi.
- [ ] Consolidare appuntamenti.
- [ ] Consolidare foto/storico.
- [ ] Separare lato cliente e lato attivita.
- [ ] Creare PWA cliente.
- [ ] Allineare notification/outbox.
- [ ] Allineare proattivita.
- [ ] Creare dati demo/reset.
- [ ] Creare check release.
- [ ] Creare test flusso proprietario/animale.

Flusso gate:

1. proprietario prenota;
2. attivita gestisce trattamento;
3. vengono salvati storico e foto;
4. sistema genera richiamo;
5. richiamo si converte in nuova prenotazione.

Gate:

- HappyPet non e piu uno scaffold con legacy, ma una app pet testabile.

## Fase 6 - Core Comune

Obiettivo: estrarre riuso solo quando i tre prodotti sono stabili.

Possibili moduli comuni:

- tipi business;
- tipi customer;
- notifiche/outbox;
- proattivita;
- PWA cliente;
- componenti UI comuni;
- check release comuni;
- fixture demo comuni.

Regola:

- non estrarre core prima di aver completato BeautyApp e almeno un allineamento tra PitStop o HappyPet.

Gate:

- il core comune nasce da codice funzionante, non da astrazione prematura.

## Ordine Di Esecuzione

1. Fase 0 - Piano e modello operativo.
2. Fase 1 - BeautyApp testabile.
3. Fase 2 - BeautyApp PWA cliente.
4. Fase 3 - BeautyApp produzione robusta.
5. Fase 4 - Allineamento PitStop.
6. Fase 5 - Allineamento HappyPet.
7. Fase 6 - Core comune.

## Stato Avanzamento

| Fase | Stato | Note |
| --- | --- | --- |
| Fase 0 | in corso | documento creato, da confermare e usare come riferimento |
| Fase 1 | in corso | audit, demo/reset, business-flow, next-availability, trial full 30 giorni, check release strutturale, E2E pubblico, E2E browser ospite e smoke chiusura/passport completati; prossimo passo: dashboard attivita autenticata |
| Fase 2 | non iniziata | dipende da Fase 1 |
| Fase 3 | non iniziata | dipende da Fase 1 |
| Fase 4 | non iniziata | dipende da BeautyApp testabile |
| Fase 5 | non iniziata | dipende da BeautyApp testabile |
| Fase 6 | non iniziata | dipende da stabilita dei tre prodotti |

## Prossima Azione

Iniziare dal blocco P0 della Fase 1:

1. entrare in `/Volumes/990P/beautyapp`;
2. leggere lo schema minimo per fixture demo;
3. creare `demo:reset` e `demo:seed`;
4. estendere `check:release`;
5. aggiungere un primo smoke business-flow.
6. aggiungere smoke chiusura trattamento/passport.
