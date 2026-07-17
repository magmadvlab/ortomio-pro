# P8 — Evidenze rollout e osservabilita

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p8-rollout-observability`
- **Migrazione:** `20260717060000_p8_rollout_observability.sql`
- **Stato:** hardening locale completato; rollout remoto esplicitamente bloccato e fuori dalla release corrente

## Capability e rollout

- gli override capability sono persistiti server-side per scope globale o utente;
- gli stati ammessi sono `off`, `shadow`, `pilot`, `production` e `rollback`;
- la RPC di cambio stato richiede ruolo Admin, aggiorna rollout e audit nella stessa transazione;
- l'audit rollout e append-only;
- `/api/auth/capabilities` combina default locali, override globali e override utente, oltre a verificare le dipendenze schema;
- sidebar desktop/mobile, bottom nav, Help, ricerca e `FeatureGate` usano lo stesso insieme di feature risolto dal server;
- le feature non validate (`AI_PREDICTIONS`, scheduling irriguo e certificazioni avanzate) restano spente.

## Osservabilita e rollback

- `/api/admin/release-readiness` e riservato agli Admin e misura le ultime 24 ore;
- metriche: write critici/fallimenti, retry comandi, dead letter, run monitoraggio falliti, prediction mature senza outcome e latenza p95;
- soglie codificate: fallimenti write 1%, retry 5%, monitoraggio fallito 1%, zero dead letter, outcome mancanti 20%, p95 2 secondi;
- ogni superamento produce una violation e `rollbackRequired=true`;
- lo schema richiesto viene sondato tabella per tabella;
- snapshot, restore drill, Security Advisor, provider smoke e pilot richiedono identificatori esterni espliciti; senza tutti questi gate `deployReady=false`;
- nessun valore di secret o identificatore sensibile viene restituito dalla readiness.

## Release tooling

- `npm run test:release` raccoglie tutte le suite di fase e la regressione globale;
- `npm run release:check` verifica migrazioni, evidenze e flag fail-closed ma non dichiara il deploy pronto;
- `npm run release:check:remote` richiede URL e bearer Admin, legge la readiness e fallisce se un gate e assente;
- il pre-deploy usa type-check, suite release, build e manifest locale;
- gli script backup/restore non contengono piu password o host di default, richiedono URL espliciti e rifiutano client PostgreSQL di major diversa dal server;
- il restore richiede `ALLOW_RESTORE=yes` e un target separato.

## Verifiche

- `npm run test:rollout-observability` — 7/7;
- `npm run test:release` — verde, incluse tutte le suite P1-P8 e 228 test di regressione `precision-hub`;
- `npm run type-check` — verde;
- `npm run build` — verde, 144 pagine generate;
- `npm run release:check` — baseline locale verde, remote non controllato, `deployReady=false`;
- PostgreSQL 16 usa-e-getta — migrazione applicata due volte, rollout Admin auditato e non-admin rifiutato;
- PostgreSQL 18 usa-e-getta — dump custom, validazione archivio, restore su database separato e query della riga sentinella `verified`;
- `git diff --check` — verde.

## Gate esterni non forzati

Il checkout e collegato a un progetto Supabase storico, ma non e stato identificato uno staging isolato con snapshot/backup e rollback. Nessuna migrazione P1-P8 e stata applicata, nessuna capability e stata attivata, nessun provider e stato chiamato e nessun comando fisico e stato inviato. Il rollout produzione resta vietato fino a quando `release:check:remote` non risulta verde e gli identificatori di snapshot, restore drill, Security Advisor, provider smoke e pilot sono stati registrati.

P9 puo procedere solo come allineamento della baseline locale e bonifica documentale: manuale e masterdoc devono dichiarare che il rollout remoto e differito, senza presentare P1-P8 come gia distribuite in produzione.
