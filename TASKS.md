# Tasks

- **Aggiornamento:** 24 luglio 2026
- **Stato:** M01-M02 chiusi per la release; M03-M05 conclusi solo localmente o come censimento; M06-M15 aperti/bloccati; M16 non iniziato
- **Coda canonica:** `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`

## Avanzamento sintetico

- [x] M01 - consolidamento feature flag e chiusura D5 (`c458bd9`);
- [x] M02 - dashboard senza dati fittizi e lint reale (`583902a`);
- [ ] M03 - implementazione locale pronta; migrazione staging e API legacy aperte;
- [ ] M04 - implementazione locale pronta; migrazione staging e helper seed aperti;
- [ ] M05 - censimento pronto; 160 esiti correnti da riconciliare nei milestone M11-M15;
- [ ] M06-M08 - migrazioni, restore e RLS bloccati senza staging;
- [ ] M09 - convergenza locale verificata; resta la certificazione staging;
- [ ] M10 - lifecycle locale pronto; consegna/webhook provider da certificare in staging;
- [ ] M11-M15 - `O25-O26` chiusi localmente; giornata reale, pilot, provider, AI e commerciale incompleti;
- [ ] M16 - audit finale non iniziato.

## Regola

Il piano master e' l'unica coda operativa corrente. Il suo registro `O01-O44` e' il conteggio canonico del lavoro aperto. Ogni nuova scoperta deve aggiornare nello stesso commit il blocco proprietario, il registro e il riepilogo; `[L]` non equivale a chiuso per la release.
