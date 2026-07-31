# Design: effetto dell'altitudine nel motore predittivo

## Contesto

`services/agronomicPredictionPipelineService.ts::buildYieldPredictions` calcola la finestra di raccolto (`harvestWindow`) con `harvestDays = 60` fisso per qualunque pianta/altitudine (riga 137). `CanonicalPredictionInput` non ha alcun campo altitudine, e la funzione che costruisce quell'input (`loadCanonicalPredictionInput`) non interroga mai la tabella `gardens` — recupera solo task, meteo, suolo, piante e sensori.

## Verifica della regola agronomica (richiesta esplicita dell'utente: non inventare)

Il codice ha già una regola empirica reale codificata in `utils/altitudeUtils.ts::calculateAltitudeDelay`: **5 giorni di ritardo ogni 100m di altitudine** (commento nel codice: "media tra 4-7 giorni ogni 100m"), coerente con la nota "legge bioclimatica di Hopkins" spesso citata in agronomia per il ritardo fenologico in quota (fioritura/maturazione). Oggi questa regola è usata solo da `adjustPlantingDates`/`calculateAltitudePlantingDelay` per ritardare la data di semina/trapianto. Riusarla identica per ritardare la finestra di raccolto è coerente: stesso fenomeno fisico (temperature più basse in quota rallentano lo sviluppo fenologico), applicato all'altro estremo del ciclo colturale. Nessuna nuova formula viene introdotta.

## Verifica del dato (stesso controllo già fatto altre volte in questa sessione per evitare campi mai popolati)

`Garden.altitudeMeters?: number` (types.ts:365) è un campo realmente inserito dall'utente in `components/GardenOnboarding.tsx` (righe 49, 607, 944) e modificabile in `components/settings/GardenEditModal.tsx` — non un altro caso di "campo esiste nel tipo ma zero occorrenze nei dati reali" (a differenza di `PlantMasterSheet.season`, scoperto in una fase precedente di questa stessa sessione). La colonna DB `altitude_meters` esiste dalla migrazione iniziale (`20251201000000_initial_schema.sql:36`).

## Obiettivo

Far arrivare `altitudeMeters` fino alla pipeline predittiva e usarlo per allungare `harvestDays` in `buildYieldPredictions`, riusando `calculateAltitudeDelay` esistente.

## Modifiche

### 1. `services/agronomicPredictionPipelineService.ts` — tipo

`CanonicalPredictionInput` guadagna un campo:

```typescript
altitudeMeters?: number
```

### 2. `services/agronomicPredictionPipelineService.ts` — `loadCanonicalPredictionInput`

Aggiungere una query alla tabella `gardens` all'interno del `Promise.all` esistente (stesso pattern delle altre 5 query già presenti — task, meteo, suolo, piante, sensori), per recuperare `altitude_meters` del giardino. Mappare il valore nel nuovo campo `altitudeMeters` dell'oggetto ritornato.

### 3. `services/agronomicPredictionPipelineService.ts` — `buildYieldPredictions`

Sostituire `const harvestDays = 60` (riga 137) con:

```typescript
const harvestDays = 60 + calculateAltitudeDelay(input.altitudeMeters ?? 0)
```

Import di `calculateAltitudeDelay` da `utils/altitudeUtils.ts` (funzione già esistente, non modificata).

### Non incluso

- Nessuna differenziazione per tipo di pianta (precoce/standard/tardiva), a differenza di `calculateAltitudePlantingDelay` usata per la semina — la pipeline predittiva non ha oggi una classificazione di questo tipo per le piante osservate (`PlantHealthData` non la include); aggiungerla sarebbe scope creep non richiesto. Il ritardo si applica uniformemente a `harvestDays`.
- Nessuna modifica a `utils/altitudeUtils.ts` — la funzione `calculateAltitudeDelay` viene riusata così com'è.
- Nessuna modifica a `services/plantingWindowOptimizer.ts` o all'endpoint `/api/garden/sun-exposure/planting-windows` — gap separato (altitudine non passata a `findPlantingWindows` in quell'endpoint), notato durante il lavoro precedente di questa sessione ma esplicitamente fuori scope qui.
- Nessuna modifica a `hashPredictionInput`/`canonicalize` — il nuovo campo entra automaticamente nell'hash esistente (funzione generica su tutto l'oggetto input), nessuna modifica necessaria.

## Verifica

- `tsc --noEmit` pulito.
- `next build` verde.
- `test:release` verde (nessuna regressione).
- Verifica manuale (se possibile): per un giardino con `altitudeMeters` impostato e non nullo, confrontare `harvestWindow` prima/dopo — la finestra deve spostarsi in avanti di `calculateAltitudeDelay(altitudeMeters)` giorni rispetto a un giardino identico a quota zero.
