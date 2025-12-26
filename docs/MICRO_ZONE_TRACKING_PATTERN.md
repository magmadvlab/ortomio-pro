# Pattern Micro-Zone Tracking per Form Operazioni

## Stato Implementazione

| Form | Garden Selector | Bed/Row | Filtro Indoor/Outdoor | Status |
|------|-----------------|---------|----------------------|--------|
| **Lavorazioni Meccaniche** | ✅ | ✅ | ✅ | **COMPLETO** |
| **Irrigazione** | ⚠️ | ✅ | N/A | Complesso (Systems/Zones) |
| **Fertilizzazione** | ✅ | ✅ | N/A | Via task context |
| **Trattamenti** | ✅ | ✅ | N/A | Via garden prop |

## Pattern Implementato (Lavorazioni Meccaniche)

### 1. State Management

```typescript
// Garden selection
const [gardens, setGardens] = useState<any[]>([])
const [selectedGardenId, setSelectedGardenId] = useState<string>('')

// Micro-zone tracking
const [beds, setBeds] = useState<any[]>([])
const [rows, setRows] = useState<any[]>([])
const [selectedBedId, setSelectedBedId] = useState<string>('')
const [selectedRowId, setSelectedRowId] = useState<string>('')
```

### 2. Data Loading (useEffect)

```typescript
// Carica beds e rows quando cambia il garden
useEffect(() => {
  const loadGardenStructure = async () => {
    if (!selectedGardenId) {
      setBeds([])
      setRows([])
      setSelectedBedId('')
      setSelectedRowId('')
      return
    }

    try {
      // Carica aiuole
      const gardenBeds = await storageProvider.getGardenBeds(selectedGardenId)
      setBeds(gardenBeds || [])

      // Carica file se ci sono aiuole
      if (gardenBeds && gardenBeds.length > 0) {
        const allRows: any[] = []
        for (const bed of gardenBeds) {
          const bedRows = await storageProvider.getFieldRows(selectedGardenId, bed.id)
          if (bedRows) {
            allRows.push(...bedRows)
          }
        }
        setRows(allRows)
      } else {
        setRows([])
      }
    } catch (error) {
      console.error('Error loading garden structure:', error)
      setBeds([])
      setRows([])
    }
  }

  loadGardenStructure()
}, [selectedGardenId, storageProvider])
```

### 3. UI Components

#### Garden Selector (Obbligatorio)

```tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Orto/Giardino *
  </label>
  <select
    required
    value={selectedGardenId}
    onChange={(e) => setSelectedGardenId(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
  >
    <option value="">Seleziona orto...</option>
    {gardens.map(garden => (
      <option key={garden.id} value={garden.id}>
        {garden.name} ({garden.type || 'outdoor'})
      </option>
    ))}
  </select>
</div>
```

#### Micro-Zone Selectors (Opzionali)

```tsx
{selectedGardenId && beds.length > 0 && (
  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
      <MapPin size={18} className="text-blue-600" />
      Dove (opzionale)
    </h3>

    {/* Bed selector */}
    <div className="mb-3">
      <label className="text-xs font-semibold text-gray-700 mb-2 block">
        Aiuola/Letto
      </label>
      <select
        value={selectedBedId}
        onChange={(e) => setSelectedBedId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tutto l'orto</option>
        {beds.map(bed => (
          <option key={bed.id} value={bed.id}>{bed.name}</option>
        ))}
      </select>
    </div>

    {/* Row selector */}
    {rows.length > 0 && selectedBedId && (
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-2 block">
          Fila/Filare
        </label>
        <select
          value={selectedRowId}
          onChange={(e) => setSelectedRowId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tutta l'aiuola</option>
          {rows.filter(row => row.bedId === selectedBedId).map(row => (
            <option key={row.id} value={row.id}>{row.name}</option>
          ))}
        </select>
      </div>
    )}
  </div>
)}
```

### 4. Filtro Intelligente Indoor/Outdoor

```typescript
// Filtra tipi di lavorazione in base al tipo di garden
const getAvailableWorkTypes = () => {
  const selectedGarden = gardens.find(g => g.id === selectedGardenId)
  if (!selectedGarden) return []

  const gardenType = selectedGarden.type || 'outdoor'

  // Lavorazioni non applicabili a sistemi indoor
  const outdoorOnlyWorks: WorkType[] = [
    'Plowing', 'Subsoiling', 'Harrowing', 'Tilling', 'Rolling', 'Hoeing', 'EarthingUp',
    'PostSowingRolling', 'Clearing', 'Stumping', 'StoneRemoval', 'Leveling', 'DeepSubsoiling',
    'Digging', 'DeepHarrowing', 'Crumbling', 'Scraping', 'SurfaceLeveling',
    'MinimumTillage', 'StripTillage', 'NoTill'
  ]

  // Se è indoor (aeroponic, hydroponic, aquaponic), escludi lavorazioni suolo
  if (['aeroponic', 'hydroponic', 'aquaponic'].includes(gardenType)) {
    return [
      // Solo lavorazioni chioma/gestione piante
      'FormativePruning', 'MaintenancePruning', 'RejuvenationPruning',
      'SummerPruning', 'WinterPruning', 'Thinning', 'Suckering',
      'Defoliation', 'Tying', 'Mulching', /* ... */
    ] as WorkType[]
  }

  // Per outdoor/raised-bed, tutte le lavorazioni sono disponibili
  return [ /* tutte le lavorazioni */ ] as WorkType[]
}
```

### 5. Salvataggio con Micro-Zone

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const newWork = await storageProvider.createMechanicalWork({
      garden_id: selectedGardenId || undefined,
      bed_id: selectedBedId || undefined,      // ✅ Micro-zone
      row_id: selectedRowId || undefined,      // ✅ Micro-zone
      work_type: formData.work_type!,
      work_date: formData.work_date!,
      area_m2: formData.area_m2,
      // ... altri campi
    })
    // ...
  } catch (error) {
    console.error('Error saving work:', error)
  }
}
```

### 6. Reset Form

```typescript
const resetForm = () => {
  setFormData({ /* reset form data */ })
  setSelectedCropId('')
  setSelectedBedId('')      // ✅ Reset bed
  setSelectedRowId('')      // ✅ Reset row
}
```

## Database Schema

### Type Definition

```typescript
export interface MechanicalWorkRecord {
  id: string
  user_id: string
  garden_id?: string
  bed_id?: string    // ✅ Micro-zone tracking
  row_id?: string    // ✅ Micro-zone tracking
  work_type: MechanicalWorkType
  work_date: string
  // ... altri campi
}
```

### Migration SQL (già applicata)

```sql
-- mechanical_work_register table già ha bed_id e row_id tramite migration:
-- database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql

ALTER TABLE mechanical_work_register
  ADD COLUMN IF NOT EXISTS bed_id UUID REFERENCES garden_beds(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS row_id UUID REFERENCES garden_rows(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mechanical_work_register_bed
  ON mechanical_work_register(bed_id) WHERE bed_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mechanical_work_register_row
  ON mechanical_work_register(row_id) WHERE row_id IS NOT NULL;
```

## Come Applicare ad Altri Form

### Checklist per Nuovi Form

- [ ] Aggiungere state per gardens, beds, rows, selectedIds
- [ ] Aggiungere useEffect per caricare garden structure
- [ ] Aggiungere Garden selector nell'UI (obbligatorio)
- [ ] Aggiungere Bed/Row selectors nell'UI (opzionali)
- [ ] Aggiungere bed_id/row_id al payload di salvataggio
- [ ] Aggiungere bed_id/row_id al type interface
- [ ] Verificare che migration database sia applicata
- [ ] (Opzionale) Aggiungere filtro intelligente per garden.type

### Form da Completare

#### Irrigazione (app/irrigation/page.tsx)
- **Complessità**: Alta (usa Systems/Zones invece di garden diretto)
- **Necessità**: Garden selector nella pagina principale
- **Note**: Architecture complessa, potrebbe richiedere refactoring

#### Altri Form (se presenti)
- Verificare se ci sono altri form operazioni
- Applicare stesso pattern di lavorazioni meccaniche

## Benefici

✅ **Tracking granulare**: Sapere esattamente dove è stata eseguita ogni operazione
✅ **Analytics precise**: Report per aiuola/filare
✅ **UX migliorata**: Filtro automatico operazioni in base a garden type
✅ **Pattern riusabile**: Stessa logica applicabile a tutti i form
✅ **Database ready**: Migration già applicata, basta usare i campi

## Riferimenti

- **Implementazione completa**: `app/(dashboard)/app/mechanical-work/page.tsx`
- **Type definitions**: `types.ts` (MechanicalWorkRecord)
- **Migration SQL**: `database/migrations/CONSOLIDATED_microzone_tracking_FINAL.sql`
- **Component esempio bed/row**: `components/professional/TreatmentRegisterForm.tsx`
