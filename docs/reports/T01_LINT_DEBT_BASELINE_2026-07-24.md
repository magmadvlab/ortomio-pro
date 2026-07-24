# T01 - Debito lint storico

## Metodo

`npm run lint` con `--format json` per contare per regola, non a occhio. Ogni lotto: leggere il file coinvolto per intero prima di rimuovere qualunque binding — un warning "unused" non e' mai stato rimosso alla cieca in questo lotto. Import mai usati e blocchi `catch` senza binding sono rimossi. Un getter di `useState` mai letto ma il cui setter e' ancora chiamato viene omesso dalla destrutturazione (`const [, setX] = useState(...)`), non eliminato — cambiare la logica di fetch/stato e' una decisione di prodotto separata, fuori da un lotto di pulizia lint.

## Baseline all'apertura di T01 (24/07/2026, sera)

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1277 |
| `@typescript-eslint/no-unused-vars` | 0 | 1151 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| `import/no-anonymous-default-export` | 0 | 4 |
| `prefer-const` | 1 | 0 |
| **Totale** | **1** | **2642** |

## Lotto 1 (24/07/2026, sera) - chiuso

- `prefer-const` (1 errore): `app/api/calendar/tasks/route.ts:24`, variabile mai riassegnata.
- `import/no-anonymous-default-export` (4 warning): `services/geoClimateService.ts`, `services/individualPlantService.ts`, `services/plantMonitoringService.ts`, `services/plantOperationsService.ts` - assegnato l'oggetto a una costante nominata prima di `export default`.
- `@typescript-eslint/no-unused-vars` in `components/shared/HomeDashboard.tsx` (49 -> 0 in questo file): icone e componenti importati mai usati rimossi (inclusi import di modali mai wirati: `IntegratedFieldOperationsModal`, `QuickOperationModal`, `TraditionalCropsWidget`, `OliveHarvest`, `VineHarvest`, `IrrigationZonesWidget` - stesso pattern di stato-morto gia' visto altrove nel progetto); `useTier()` rimosso perche' nessun valore del suo ritorno era letto; 4 coppie di stato completamente morte rimosse (`isGardenSelectorOpen`, `showIntegratedOperationsModal`, `selectedFieldRowsForOperations`, `showQuickOperationModal`/`quickOperationType` - setter mai chiamati, verificato con grep prima di rimuovere); 5 coppie con getter morto ma setter ancora in uso portate a `const [, setX] = useState(...)` senza toccare la logica di fetch (`irrigationZones`, `loadingIrrigationZones`, `weather`, `weatherLoading`, `loadingPlan`); 6 blocchi `catch (e) {}`/`catch (error) {}` con binding mai letto convertiti a `catch {}`; 2 parametri `id` mai usati rimossi da callback inline dove il tipo di destinazione ammette meno parametri (assegnazione strutturale di funzione, nessuna rottura).
- **Verifiche:** type-check verde; `test:release` 228/228; build produzione verde; lint del file target sceso da 49 a 0 voci `no-unused-vars` (restano solo `exhaustive-deps` e `no-explicit-any`, deliberatamente non toccati in questo lotto).

## Stato dopo il lotto 1

| Regola | Errori | Warning |
|---|---:|---:|
| `@typescript-eslint/no-explicit-any` | 0 | 1277 |
| `@typescript-eslint/no-unused-vars` | 0 | 1102 |
| `react-hooks/exhaustive-deps` | 0 | 174 |
| `@next/next/no-img-element` | 0 | 36 |
| **Totale** | **0** | **2589** |

## Cosa NON e' stato toccato e perche'

- **`react-hooks/exhaustive-deps` (174):** in `HomeDashboard.tsx` sono deliberatamente soppressi con commenti espliciti nel codice ("Only re-run when garden ID changes" ecc.) per evitare loop di render. Aggiungere le dipendenze mancanti senza verificare ogni caso rischia di introdurre loop infiniti o fetch ridondanti - richiede lotto dedicato con test di regressione mirati, non una pulizia meccanica.
- **`@typescript-eslint/no-explicit-any` (1277):** ogni istanza richiede scegliere/scrivere un tipo corretto, non e' un'operazione meccanica. Lotto separato, probabilmente il piu' grande e piu' lento dei quattro.
- **`@next/next/no-img-element` (36):** sostituire `<img>` con `next/image` richiede verificare dimensioni e dominio remoto per ogni immagine, non solo cambiare il tag.

## Prossimo lotto

Nessun file scelto ancora. Ripetere il metodo: `npm run lint -- --format json`, ordinare per file con piu' occorrenze della stessa regola, leggere il file intero prima di modificarlo, verificare grep di ogni identificatore prima di rimuoverlo, type-check + `test:release` + build dopo ogni lotto.
