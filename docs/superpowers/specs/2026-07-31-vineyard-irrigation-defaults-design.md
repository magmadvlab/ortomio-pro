# Design: irrigationDefaults per il vigneto + fix gate migrazione frutteto

## Contesto

Il frutteto (`OrchardConfiguration`) ha un campo `irrigationDefaults` (tipo linea, diametro, passo erogatori, portata) usato in `OrchardRowsView.tsx` per un pannello "Profilo standard nuovi impianti": l'utente configura il profilo una volta, lo salva, e un bottone applica in bulk il profilo a tutti i filari reali ancora privi di configurazione irrigua (senza toccare quelli già configurati manualmente).

Il vigneto (`VineyardConfiguration`) non ha questo campo. `VineyardRowsView.tsx` lo documenta già in un commento in testa al file (righe 20-25): resta possibile solo la configurazione per singolo filare (`FieldRow.irrigationLine`), niente bulk-assign.

## Scoperta collaterale (prerequisito da correggere prima)

Analizzando `services/orchardService.ts` è emerso che **nessuna migrazione in `supabase/migrations/` crea mai la colonna `irrigation_defaults` su `orchard_configurations`**. Il service ha però un pattern di fallback resiliente: se l'insert/update sulla colonna fallisce con "missing column", il codice riprova senza quel campo e scrive il valore in `localStorage` del browser (chiave `ortomio:orchard:${orchardId}:irrigationDefaults`), mascherando l'errore.

Effetto pratico: il "Profilo standard nuovi impianti" del frutteto in produzione probabilmente **non è mai stato persistito nel database reale**, solo nel browser locale di chi lo ha impostato — perso cambiando dispositivo/browser o pulendo i dati.

Stesso pattern già incontrato e chiuso per la migrazione olive `20260119020000` (verificata come già applicata). Qui il caso è diverso: qui la colonna probabilmente manca davvero (il fallback silenzioso lo lascia intuire, ma va confermato/corretto con una migrazione reale, non solo verificato).

## Obiettivo

1. Aggiungere la colonna `irrigation_defaults` mancante a `orchard_configurations` (fix del gate silenzioso esistente).
2. Aggiungere lo stesso campo, da zero e senza il pattern di fallback fragile, a `vineyard_configurations`.
3. Portare il pannello UI "Profilo standard nuovi impianti" dal frutteto al vigneto, 1:1 nello stile e comportamento.

## Modifiche

### 1. Migrazione DB

Nuovo file `supabase/migrations/<timestamp>_add_irrigation_defaults_orchard_vineyard.sql`:

```sql
ALTER TABLE orchard_configurations ADD COLUMN IF NOT EXISTS irrigation_defaults JSONB;
ALTER TABLE vineyard_configurations ADD COLUMN IF NOT EXISTS irrigation_defaults JSONB;
```

Applicata e verificata manualmente in produzione (stesso metodo usato per il gate olive: tentativo di riapplicazione idempotente + controllo Table Editor), non solo committata nel repo.

### 2. Tipo (`types/vineyard.ts`)

Aggiungere a `VineyardConfiguration`:

```typescript
irrigationDefaults?: OrchardIrrigationDefaults
```

Import diretto di `OrchardIrrigationDefaults` da `types/orchard.ts` — stesso shape esatto (`lineType`/`pipeDiameterMm`/`emitterSpacingCm`/`emitterFlowRateLph`), nessuna duplicazione di tipo.

### 3. `services/vineyardService.ts`

In `mapVineyardConfigurationFromDatabase` (riga ~465): aggiungere `irrigationDefaults: data.irrigation_defaults`.
In `mapVineyardConfigurationToDatabase`: aggiungere `irrigation_defaults: config.irrigationDefaults`.

Nessun fallback localStorage qui: la colonna esiste già (fix applicato al punto 1 prima di scrivere questo codice), quindi non serve il pattern difensivo usato in `orchardService.ts`.

### 4. `components/vineyard/VineyardRowsView.tsx`

Portare 1:1 dal blocco equivalente in `OrchardRowsView.tsx` (righe ~55-68, ~330, ~386-433, ~738-826):

- Stato: `vineyardDefaultsForm`, `vineyardDefaultsSaving`, `applyDefaultsLoading`.
- Filtro `realRowsWithoutIrrigation` sui filari reali del vigneto senza `irrigationLine` configurato (verificare se un filtro equivalente esiste già nel file e riusarlo).
- Handler `handleSaveVineyardDefaults` (salva il profilo su `VineyardConfiguration.irrigationDefaults` via `vineyardService`) e `handleApplyDefaultsToRows` (applica il profilo salvato a tutti i filari in `realRowsWithoutIrrigation`).
- Blocco UI: stessa struttura visiva (pannello ciano, 4 campi form, due bottoni "Assegna a N senza impianto" / "Salva Profilo", riepilogo testuale).
- Aggiornare il commento in testa al file (righe 20-25), oggi obsoleto, per riflettere che la feature ora esiste.

### Non incluso

- Nessuna migrazione dati per configurazioni vigneto esistenti: il campo è opzionale, resta vuoto finché l'utente non lo imposta (stesso comportamento del frutteto).
- Nessuna modifica al pattern di fallback in `orchardService.ts` — resta com'è, innocuo una volta che la colonna esiste davvero.

## Verifica

- `tsc --noEmit` pulito.
- `next build` verde.
- `test:release` (e sospetti `test:capabilities`/`test:persistence` se toccano filari) tutti verdi.
- Verifica manuale in produzione (Table Editor) che entrambe le colonne esistano dopo la migrazione.
