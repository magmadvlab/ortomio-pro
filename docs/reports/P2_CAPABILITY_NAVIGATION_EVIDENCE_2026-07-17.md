# P2 — Evidenze capability e navigazione unica

- **Data:** 17 luglio 2026
- **Branch:** `codex/ortomio-p2-capabilities`
- **Migrazioni:** nessuna
- **Stato:** completata e verificata localmente

## Contratto consegnato

`config/capabilities.ts` e la fonte unica per route, label, gruppo, ruolo, tier, provider, dipendenze schema, feature flag, maturita e target UI. Il profilo server `/api/auth/capabilities` deriva ruolo e tier dalla sessione; non invia credenziali provider al client.

Lo stesso catalogo alimenta:

- sidebar desktop e drawer mobile;
- bottom navigation;
- shell FREE di compatibilita;
- ricerca globale e destinazioni dei risultati;
- pagina Help e link al manuale;
- badge persistente delle pagine Beta e Simulazione.

## Decisioni route

| Route | Decisione |
|---|---|
| `/app/diary` | percorso canonico del Diario |
| `/app/journal` | alias con redirect a `/app/diary` |
| `/app/smart` | percorso canonico Smart Hub |
| `/app/smart-simple` | alias con redirect a `/app/smart` |
| `/app/compare` | route contestuale, non esposta nel menu globale |
| `/app/reports` | route tecnica legacy con redirect a `/app/export` |
| `/app/zones` | alias legacy con redirect a `/app/garden/zones` |
| `/app/pianifica` | alias legacy con redirect a `/app/planner` |

Admin e configurazione satellite richiedono ruolo `admin`; il tier PRO non concede accesso da solo. NDVI e Smart Hub restano visibili con badge `Simulazione` finche i provider reali non superano i gate dedicati.

## Link eliminati

Sono stati eliminati dalla navigazione e da Help i riferimenti a route o capitoli inesistenti: progress, recipes, guides, search, seeds, gardens, gamification, social sharing e badge system. Le ricerche di semi e raccolti ora portano rispettivamente a Semenzaio e Raccolti.

## Verifiche

- `npm run test:capabilities` — 7/7;
- `npm run type-check` — verde;
- `npm run test:security` — 10/10;
- `npm run test:precision-hub` — 228/228;
- `npm run build` — 141/141 pagine generate;
- `git diff --check` — verde.

I test mirati verificano esistenza delle pagine, parita desktop/mobile, separazione admin, badge di maturita, link Help, destinazioni ricerca e redirect delle route tecniche legacy.
