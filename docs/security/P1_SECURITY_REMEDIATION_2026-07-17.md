# OrtoMio — Evidenze P1 sicurezza e ownership

- Data: 17 luglio 2026
- Branch: `codex/ortomio-p1-security`
- Migrazione: `20260717000000_p1_security_hardening.sql`
- Stato: implementazione locale completa; gate remoto in attesa di staging

## Risultato

La P1 introduce autorizzazione server canonica, protezione di `/app/*`, ownership per garden e organizzazione, autenticazione cron/device, rate limit e chiusura delle route P0. La migrazione corregge le view `SECURITY DEFINER`, i `search_path` mutabili, i grant delle funzioni privilegiate, le policy mancanti dei ledger e la ricorsione delle policy multi-tenant.

## Verifiche eseguite

- `npm run type-check`: verde;
- `npm run test:security`: 10/10;
- `npm run test:precision-hub`: 228/228;
- `npm run build`: 140/140 pagine;
- `git diff --check`: verde;
- PostgreSQL usa-e-getta con immagine locale: fixture, migrazione P1 e `p1_security_rls.sql` completati con `ON_ERROR_STOP=1`;
- test RLS: due utenti, due garden e due organizzazioni; letture cross-tenant invisibili e insert cross-garden rifiutato;
- il test SQL termina con `ROLLBACK`, quindi non conserva fixture.

## Stato remoto e gate

Il dashboard Supabase identifica `ortomiopro/main` come **Production**, piano **Free**, senza branch e senza backup disponibili. Non esiste quindi una destinazione staging sulla quale applicare la migrazione come richiesto dal piano. La migrazione non è stata applicata alla produzione e il Security Advisor remoto resta alla baseline di 6 errori, 70 warning e 2 suggerimenti.

Il rollback pre-commit è garantito dalla transazione della migrazione. Un rollback post-commit non deve riaprire view o RPC privilegiate: richiede snapshot/backup o una forward-fix verificata. Poiché il progetto remoto non offre backup, il gate di rollout resta bloccato finché non viene predisposto staging e un punto di ripristino.

## Verifica post-deploy

Eseguire nell'ordine:

1. applicare la migrazione su staging;
2. eseguire `supabase/tests/p1_security_rls.sql`;
3. eseguire `supabase/snippets/p1_security_verification.sql`;
4. rieseguire Security Advisor;
5. abilitare Leaked Password Protection e verificare registrazione/reset;
6. acquisire snapshot/backup prima della produzione.
