# M08 - Matrice multi-cliente e RLS

## Stato

Preparazione locale disponibile; certificazione staging bloccata da M06-M07.

## Identita' fixture

| Soggetto | ID fixture | Ambito |
|---|---|---|
| Cliente A / amministratore | `10000000-0000-4000-8000-000000000001` | garden e organizzazione A |
| Cliente B / amministratore | `20000000-0000-4000-8000-000000000002` | garden e organizzazione B |
| Operatore A | da creare in staging | accesso limitato alle assegnazioni A |
| Operatore B | da creare in staging | accesso limitato alle assegnazioni B |

Le fixture SQL esistenti sono `supabase/tests/fixtures/p1_security_fixture.sql`, `supabase/tests/p1_security_rls.sql` e `supabase/tests/p3_core_persistence.sql`.

## Matrice di certificazione

| Percorso | Lettura A->B | Scrittura A->B | Evidenza locale | Evidenza staging |
|---|---:|---:|---|---|
| gardens / land_zones / soil state | negata | negata | guard API e test M03-M04 | mancante |
| planner / task / diario / ledger | negata | negata | fixture P1/P3 | mancante |
| irrigazione / nutrizione / trattamenti | negata | negata | test lifecycle locali | mancante |
| export CSV/PDF e audit | negata | negata | route autorizzate | mancante |
| alert / cron / notifiche | negata | negata | guard cron/device | mancante |
| NDVI / prescription maps / cache | negata | negata | test P6 locali | mancante |
| organizzazioni / inviti / ruoli | negata | negata | guard organizzazione | mancante |
| storage allegati e foto | negata | negata | nessuna prova completa | mancante |
| admin e release readiness | negata ai non-admin | negata ai non-admin | test guard admin | mancante |

## Procedura staging

1. Ripristinare il dump M07 su staging.
2. Applicare i batch M06 approvati.
3. Creare due utenti e due aziende senza service-role nelle sessioni di test.
4. Eseguire ogni query come `authenticated`, cambiando il claim `sub`.
5. Verificare SELECT, INSERT, UPDATE e DELETE cross-cliente.
6. Ripetere tramite API e UI, includendo cache, export, cron e processi concorrenti.
7. Eseguire Security Advisor e allegare l'output privo di dati sensibili.
8. Rimuovere le fixture o distruggere lo staging.

## Condizione di uscita

M08 resta bloccato finche' tutte le celle staging non risultano negate con prova allegata e Security Advisor non e' stato rieseguito.
