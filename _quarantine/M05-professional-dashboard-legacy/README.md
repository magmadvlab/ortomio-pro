# Quarantena M05 — Professional Dashboard legacy

Spostati qui il 30/07/2026 durante il censimento M05 del codice morto,
invece di essere eliminati direttamente, su richiesta esplicita
dell'utente ("mettili in una cartella quarantena così se ci sono
problemi li possiamo recuperare").

## File

- `components/professional/Dashboard.tsx`
- `components/professional/ROISummary.tsx`
- `components/professional/AnalyticsTable.tsx`
- `components/professional/TreatmentRegister.tsx`
- `components/professional/TreatmentRegisterForm.tsx`
- `__tests__/persistence/professionalTreatmentRegister.test.ts`

## Perché sono qui

Vecchia implementazione del "Professional Dashboard" (ROI, tabella
analytics, registro trattamenti, onboarding integrato), **zero importer
in produzione** verificato con grep ricorsivo. Sostituita dal file
`components/professional/ProfessionalDashboard.tsx` (diverso file, stesso
nome concettuale — basato su `directorService`, montato in
`GardenView.tsx`).

Il piano master (`docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`)
la segnava erroneamente come viva in un censimento precedente (lotto 64):
la catena che la rendeva "viva" si interrompeva in realtà a `Dashboard.tsx`
stesso, che non ha mai avuto importer reali.

## Come recuperare

Se in futuro emerge che serviva davvero (es. la spec di un modulo
commerciale "Professional" con ROI/analytics mai completato), spostare i
file indietro alle posizioni originali con `git mv` (percorso identico,
solo senza il prefisso `_quarantine/M05-professional-dashboard-legacy/`)
e rimuovere `_quarantine` da `tsconfig.json`.

## Come eliminare definitivamente

Se dopo un periodo ragionevole nessuno li reclama, cancellare l'intera
cartella `_quarantine/M05-professional-dashboard-legacy/` con un commit
dedicato.
