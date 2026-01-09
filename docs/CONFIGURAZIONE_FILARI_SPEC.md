# Specifica: Configurazione Filari per Orti

## Problema
Attualmente quando si crea un orto, si può specificare solo l'area totale. Mancano:
- Numero di filari
- Lunghezza e larghezza filari
- Distanza tra filari (personalizzabile in base alla coltura)

## Requisiti Utente
1. **Flessibilità Stagionale**: L'orto viene dismesso e ricreato tra stagioni, ma semi/raccolti/dati devono rimanere
2. **Configurazione Filari Base**: All'inizio specificare numero, lunghezza, larghezza filari
3. **Distanze Personalizzabili**: Distanza tra filari varia in base alla coltura (pomodori vs zucche)

## Soluzione Proposta

### 1. Fix Eliminazione Orto ✅ FATTO
**File**: `supabase/migrations/20260102130000_preserve_seeds_harvests_on_garden_delete.sql`

**Comportamento**:
- Elimina garden → Semi e Raccolti rimangono (garden_id = NULL)
- Elimina garden → Piante attive, Task futuri, Beds/Rows vengono eliminati (CASCADE)

### 2. Aggiungere Campi Filari al Garden

**File da modificare**: `types.ts`

```typescript
export interface Garden {
  // ... campi esistenti ...

  // Configurazione filari (opzionale)
  rowConfig?: {
    numberOfRows: number;           // Es. 10 filari
    lengthMeters: number;           // Es. 15 metri lunghezza
    widthMeters?: number;           // Es. 8 metri larghezza totale
    defaultRowSpacingCm?: number;   // Distanza default tra filari (cm)
  };
}
```

**Migrazione Database**:
```sql
-- Aggiungi colonna JSONB per configurazione filari
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS row_config JSONB;

COMMENT ON COLUMN gardens.row_config IS
'Configurazione filari: numberOfRows, lengthMeters, widthMeters, defaultRowSpacingCm';
```

### 3. UI - Step Configurazione Dimensioni

**File**: `components/GardenOnboarding.tsx` - Step 4

Aggiungere sezione "Configurazione Filari" (opzionale) dopo la configurazione area:

```tsx
{/* Configurazione Filari (Opzionale) */}
{gardenType === 'OpenField' && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold text-gray-800 mb-3">
      Configurazione Filari (Opzionale)
    </h4>
    <p className="text-sm text-gray-600 mb-4">
      Specifica il numero e le dimensioni dei filari. Potrai personalizzare le distanze tra file quando pianterai le colture.
    </p>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numero Filari
        </label>
        <input
          type="number"
          placeholder="Es. 10"
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lunghezza Filari (m)
        </label>
        <input
          type="number"
          placeholder="Es. 15"
          min="1"
          step="0.1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>

    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Larghezza Totale (m) - Opzionale
      </label>
      <input
        type="number"
        placeholder="Es. 8"
        min="1"
        step="0.1"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <p className="text-xs text-gray-500 mt-1">
        Se specifichi larghezza e numero filari, calcoleremo automaticamente la distanza media tra file
      </p>
    </div>
  </div>
)}
```

### 4. Sistema Distanze Suggerite

Quando l'utente pianta una coltura, suggerire distanza ottimale in base al tipo:

**Esempi**:
- Pomodori: 70-80 cm tra file
- Zucchine: 100-120 cm tra file
- Angurie/Zucche: 150-200 cm tra file
- Insalate: 30-40 cm tra file

**Implementazione**:
1. Creare database `crop_spacing_recommendations` con distanze raccomandate
2. Nel form piantagione, mostrare: "Distanza raccomandata: 70-80 cm" (personalizzabile)
3. Salvare la distanza effettiva scelta dall'utente in `field_rows.spacing_cm`

### 5. Workflow Completo

```
1. Crea Orto → Step 4:
   - Area: 120 m²
   - [Opzionale] Filari: 10 filari × 15m lunghi × 8m larghezza

2. Pianta Pomodori → Form piantagione:
   - Seleziona coltura: "Pomodoro San Marzano"
   - Sistema suggerisce: "Distanza raccomandata tra file: 70-80 cm"
   - Utente può modificare: "80 cm" ✓
   - Salva in field_rows

3. Elimina Orto (fine stagione) →
   - Semi rimangono disponibili ✅
   - Raccolti storici rimangono ✅
   - Configurazione filari eliminata (va riconfigurata per nuovo orto)

4. Crea Nuovo Orto →
   - Riparti da Step 1
   - Puoi scegliere configurazione diversa (es. 12 filari invece di 10)
```

## File da Modificare

### Frontend
1. ✅ `supabase/migrations/20260102130000_preserve_seeds_harvests_on_garden_delete.sql` - CREATO
2. `types.ts` - Aggiungere `rowConfig?: { ... }` a interface Garden
3. `components/GardenOnboarding.tsx` - Step 4: aggiungere sezione filari
4. `components/gardens/SizeConfigurationStep.tsx` - Aggiungere input filari per OpenField

### Backend
5. `supabase/migrations/20260102131000_add_row_config_to_gardens.sql` - Aggiungere colonna row_config
6. `packages/storage-cloud/SupabaseStorageProvider.ts` - Map rowConfig da/per DB
7. `database/schema.sql` - Update schema documentation

### Optional (Futuro)
8. Tabella `crop_spacing_recommendations` per distanze raccomandate
9. UI form piantagione con suggerimenti distanze
10. Calcolo automatico capacità orto in base a filari + distanze

## Test Plan

1. **Test Eliminazione Orto**:
   - Crea orto con semi e raccolti
   - Elimina orto
   - Verifica: semi e raccolti ancora presenti con garden_id=NULL

2. **Test Configurazione Filari**:
   - Crea orto con 10 filari × 15m × 8m
   - Salva e verifica row_config nel DB
   - Ricarica e verifica valori persistiti

3. **Test Workflow Stagionale**:
   - Orto estivo → raccogli → elimina
   - Orto autunnale → verifica semi disponibili
   - Verifica storico raccolti completo

## Note Implementazione

- `rowConfig` è OPZIONALE - chi non vuole specificare filari può usare solo area
- Se specificato, UI può mostrare visualizzazione filari nella dashboard
- Distanze tra file sono salvate in `field_rows.spacing_cm` (già esiste nel DB)
- Sistema è flessibile: permette configurazioni diverse tra stagioni
