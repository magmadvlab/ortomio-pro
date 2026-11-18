# Collaudo locale isolato — OrtoMio

Questo ambiente usa Docker e uno snapshot di solo schema, senza account o contenuti produttivi. Non ripara automaticamente la storia delle migrazioni. Vedere [esiti e limiti](./EXECUTION.md).

## Avvio

Prerequisiti: Docker attivo, Node 22+, npm e Supabase CLI. Da questo repository:

```sh
npm ci
node scripts/audit/local-supabase.mjs prepare
node scripts/audit/start-local-app.mjs
```

`prepare` legge lo schema dal progetto collegato solo alla prima preparazione; tutte le scritture sono indirizzate al container `supabase_db_ortomio-audit-local`. Il workdir è `/tmp/ortomio-audit-local`, porta API 55421, DB 55422, Studio 55423, mailbox 55424. I progetti Docker già presenti non vengono resettati. I log che possono contenere chiavi locali hanno permessi 0600.

Il server dedicato usa `http://127.0.0.1:3004`, directory `.next-audit`, auth reale e credenziali solo locali, provider AI disabilitati. La chiave di cifratura è effimera per questa esecuzione: non usare questo ambiente per conservare credenziali reali. Le fixture vengono eliminate/rollbackate.

## Verifiche

In un secondo terminale:

```sh
node scripts/audit/local-supabase.mjs test
node scripts/audit/http-contracts.mjs
node scripts/audit/local-supabase.mjs restore
npm run test:app
npm run type-check
NEXT_BUILD_DIR=.next-audit-build npm run build
npm run docs:hygiene
npm run lint
npm audit
```

`restore` esporta e ripristina il database locale in `ortomio_restore_drill`, riesegue gli assert SQL, poi elimina soltanto quel DB temporaneo. I contratti SQL usano una transazione con rollback; HTTP crea due account `example.test` e rimuove account/terreni nel blocco `finally`. Nessuna richiesta ai provider esterni è prevista.

Per fermare l’app: Ctrl+C nel suo terminale. Per fermare solo Supabase di audit:

```sh
supabase stop --workdir /tmp/ortomio-audit-local
```

Non usare `docker system prune`, `supabase db reset --linked` o reset dei progetti altrui. Se `/tmp` viene ripulita, rieseguire `prepare`.

## Preparazione del rilascio

1. Fissare il candidato Git preservando i cambiamenti concorrenti; non pubblicare una directory condivisa ancora mutabile.
2. Risolvere il drift storico, acquisire backup produttivo e provarne il recupero. Applicare soltanto le migrazioni pianificate dopo confronto con lo schema remoto; le tre nuove migrazioni sono state provate sul clone.
3. Configurare la chiave AES server stabile, custodirla separatamente dal DB. Ruotare le credenziali esposte e collegare i provider autorizzati. Il nuovo `.env.example` distingue variabili pubbliche da server.
4. Lo script `scripts/audit/migrate-api-credentials.ts` è in dry-run di default e gestisce `api_configurations` e il vecchio `api_keys`; `--apply` modifica le righe, `--allow-remote` è richiesto fuori localhost. Per `api_keys` decodifica i due formati legacy, cifra un archivio completo e trasferisce in una transazione le chiavi personali OpenAI/Anthropic/GoogleAI/WeatherAPI. Non sovrascrive configurazioni esistenti e non converte credenziali organizzative in personali: `legacyNeedsReview` deve essere risolto prima del rilascio. I servizi non mappati restano archiviati per trasferimento mirato, compreso Sentinel. Non eliminare dati per risolvere un conflitto di servizio.
5. Configurare preview con database distinto: le variabili Supabase correnti su Vercel includono production e preview. La sola chiave AES separata non isola i dati.
6. Prima di pubblicare i nuovi cron, configurare provider email/mittente/destinatario e verificare gli opt-out. Le ore sono UTC. Il piano Hobby è giornaliero, con precisione nell’ora: non promettere SLA istantanei.
7. Eseguire smoke remoto con account dedicati, callback password senza localhost, browser autenticato, due tenant, monitoraggio/coda/provider e idempotenza. Registrare ID deployment/run e osservare almeno una ricorrenza completa.
8. Per un rollback applicativo conservare il deployment precedente e la chiave AES. Non annullare colonne/migrazioni con DROP sui dati nuovi: provare il recupero in ambiente isolato e valutare compatibilità del vecchio codice con i privilegi revocati.

Il pilot agronomico e la calibrazione di rese, malattie, fabbisogno e costi richiedono dati approvati: i test software non sostituiscono questo requisito.
