# Tasks

- **Aggiornamento:** 24 luglio 2026
- **Stato:** M01-M02 chiusi per la release; M03-M05 conclusi solo localmente o come censimento; M06-M15 aperti/bloccati; M16 non iniziato
- **Deploy:** codice M01-M09 e le 8 migrazioni nuove sono in produzione dal 24/07/2026, per decisione esplicita dell'utente e senza staging (gate O06 non soddisfatto) — dettaglio in `ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md` §8
- **Coda canonica:** `docs/reports/execution-plans/ORTOMIO_PIANO_MASTER_COMPLETAMENTO_2026-07-24.md`

## Avanzamento sintetico

- [x] M01 - consolidamento feature flag e chiusura D5 (`c458bd9`);
- [x] M02 - dashboard senza dati fittizi e lint reale (`583902a`);
- [ ] M03 - implementazione locale pronta; API legacy migrata alla route canonica (O02 chiuso 24/07, `fcd97de`); resta solo la certificazione staging della migrazione (O01);
- [ ] M04 - implementazione locale pronta; migrazione staging e helper seed aperti;
- [ ] M05 - censimento pronto; 81 esiti correnti da riconciliare nei milestone M13-M15; M11-M12 locali azzerati;
- [ ] M06-M08 - migrazioni, restore e RLS bloccati senza staging;
- [ ] M09 - convergenza locale verificata; resta la certificazione staging;
- [ ] M10 - lifecycle locale pronto; consegna/webhook provider da certificare in staging;
- [ ] M11-M15 - debito locale M11-M12 azzerato; giornata reale, pilot, provider, AI e commerciale incompleti;
- [ ] M16 - audit finale non iniziato.

## Regola

Il piano master e' l'unica coda operativa corrente. Il suo registro `O01-O44` e' il conteggio canonico del lavoro aperto. Ogni nuova scoperta deve aggiornare nello stesso commit il blocco proprietario, il registro e il riepilogo; `[L]` non equivale a chiuso per la release.
