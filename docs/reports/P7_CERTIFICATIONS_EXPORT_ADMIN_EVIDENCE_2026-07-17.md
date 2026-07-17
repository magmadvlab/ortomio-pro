# P7 — Evidenze certificazioni, export e Admin

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p7-certifications-export-admin`
- **Migrazione:** `20260717050000_p7_regulatory_exports_admin.sql`
- **Stato:** implementazione locale completata; migrazione e policy storage restano chiuse fino al rollout staging P8

## Certificazioni

- documenti generali e BIO hanno owner, fonte, riferimento, checksum e policy RLS per garden;
- gli eventi di evidenza collegano garden, tipo certificazione, entita, operatore, data, fonte e payload;
- eventi regolatori sono append-only: `UPDATE` e `DELETE` sono revocati e un trigger blocca anche il table owner;
- sorgenti `simulated` e `demo` non possono avere `certification_eligible=true`;
- il dossier include soltanto documenti/eventi `observed|imported` eleggibili e produce un riepilogo con record, esclusioni e anomalie;
- la panoramica unificata non usa piu attivita mock in memoria; legge certificazioni, audit ed evidenze persistite;
- il progresso GlobalGAP non e piu fissato al 45%, ma deriva dal checklist DB;
- la UI dichiara che si tratta di readiness interna: OrtoMio non attribuisce certificazioni e non invia submission ufficiali.

## Export

- CSV e PDF sono generati lato server soltanto dopo `requireGardenAccess` per uno specifico garden;
- dataset ammessi: configurazione garden minimizzata, attivita, diario, registro trattamenti e dossier certificazioni;
- il CSV ha ordine stabile, quoting completo, BOM UTF-8 e neutralizzazione delle formule da foglio di calcolo;
- il PDF e un vero `application/pdf` con paginazione, non un file testo o una pagina HTML stampabile;
- ogni file riporta schema, timestamp, timezone, garden, periodo e tabelle fonte;
- ogni export persiste utente, garden, dataset, formato, righe, fonti e SHA-256; il file non viene restituito se l'audit fallisce;
- i vecchi dati mock di bypass sono stati eliminati e anche l'export GlobalGAP passa dal percorso auditato.

## Admin

- `/api/admin/overview` applica `requireAdmin` e calcola utenti, accessi recenti e garden lato server;
- provider health espone soltanto `healthy`, `configured`, `not_configured` o `error`, mai valori dei secret;
- la pagina non interroga piu colonne `profiles.last_sign_in_at` inesistenti e non presenta pulsanti backup/log/configurazione senza backend;
- il reinvio verifica email e auditato con admin, target, esito e timestamp;
- capability e route restano role-based: il tier non concede accesso Admin.

## Verifiche

- `npm run test:regulatory-exports-admin` — 7/7;
- `npm run test:security` — 10/10;
- `npm run test:capabilities` — 7/7;
- `npm run test:precision-hub` — 228/228;
- `npm run type-check` — verde;
- `npm run build` — 143/143 pagine;
- PostgreSQL 16 usa-e-getta — migrazione applicata due volte; RLS cross-garden, vincolo demo, append-only, audit export e rollback verdi;
- `git diff --check` — verde.

## Gate non forzati

La migrazione non viene applicata a Supabase `main` in assenza di uno staging con snapshot e rollback. La policy effettiva del bucket usato per documenti/foto deve essere inventariata e verificata sul progetto remoto prima di abilitare upload regolatori. Smoke CSV/PDF con dati reali, Security Advisor e audit post-deploy appartengono a P8.
