# 🚀 Next Steps - Land Zones Integration

**Priority**: HIGH  
**Estimated Time**: 2-3 hours  
**Dependencies**: Land Zones System Base (✅ Complete)

---

## 📋 Overview

Complete the land zones system integration by implementing:
1. Zone creation modal
2. Zone selection in field row creation
3. Extended crop history for zones
4. Transplant service integration

---

## 🎯 Step 1: Zone Creation Modal (30 min)

### File to Modify
`app/app/garden/zones/page.tsx`

### Implementation

Replace the TODO modal with a complete form:

```typescript
// Add state for form
const [zoneForm, setZoneForm] = useState({
  zone_name: '',
  zone_code: '',
  area_hectares: 0,
  soil_type: '',
  notes: ''
})
const [saving, setSaving] = useState(false)

// Add handler
const handleCreateZone = async () => {
  try {
    setSaving(true)
    
    if (!zoneForm.zone_name.trim()) {
      alert('Il nome della zona è obbligatorio')
      return
    }
    
    if (zoneForm.area_hectares <= 0) {
      alert('La superficie deve essere maggiore di 0')
      return
    }
    
    await createLandZone(
      selectedGarden!.id,
      // Get user ID from auth
      (await supabase.auth.getUser()).data.user!.id,
      {
        zone_name: zoneForm.zone_name,
        zone_code: zoneForm.zone_code || undefined,
        area_hectares: zoneForm.area_hectares,
        soil_type: zoneForm.soil_type || undefined,
        notes: zoneForm.notes || undefined
      }
    )
    
    // Reset form
    setZoneForm({
      zone_name: '',
      zone_code: '',
      area_hectares: 0,
      soil_type: '',
      notes: ''
    })
    
    setShowCreateModal(false)
    await loadZones(selectedGarden!.id)
    alert('✅ Zona creata con successo')
  } catch (error) {
    console.error('Error creating zone:', error)
    alert('❌ Errore durante la creazione della zona')
  } finally {
    setSaving(false)
  }
}

// Replace modal JSX
{showCreateModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Crea Nuova Zona</h2>
      
      <div className="space-y-4">
        {/* Nome Zona */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nome Zona *
          </label>
          <input
            type="text"
            value={zoneForm.zone_name}
            onChange={(e) => setZoneForm({ ...zoneForm, zone_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Es. Zona A, Zona Nord"
          />
        </div>

        {/* Codice Zona */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Codice Zona (opzionale)
          </label>
          <input
            type="text"
            value={zoneForm.zone_code}
            onChange={(e) => setZoneForm({ ...zoneForm, zone_code: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Es. ZA, ZN"
          />
        </div>

        {/* Superficie */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Superficie (ettari) *
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={zoneForm.area_hectares}
            onChange={(e) => setZoneForm({ ...zoneForm, area_hectares: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Es. 2.0"
          />
        </div>

        {/* Tipo Terreno */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tipo Terreno (opzionale)
          </label>
          <select
            value={zoneForm.soil_type}
            onChange={(e) => setZoneForm({ ...zoneForm, soil_type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">Seleziona...</option>
            <option value="argilloso">Argilloso</option>
            <option value="sabbioso">Sabbioso</option>
            <option value="limoso">Limoso</option>
            <option value="misto">Misto</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Note (opzionale)
          </label>
          <textarea
            value={zoneForm.notes}
            onChange={(e) => setZoneForm({ ...zoneForm, notes: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Es. Zona ben esposta, terreno fertile"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={() => setShowCreateModal(false)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handleCreateZone}
          disabled={saving || !zoneForm.zone_name.trim() || zoneForm.area_hectares <= 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creazione...
            </>
          ) : (
            <>
              <Plus size={16} />
              Crea Zona
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
```

### Testing
1. Click "Nuova Zona"
2. Fill form with valid data
3. Click "Crea Zona"
4. Verify zone appears in list
5. Test validation (empty name, zero area)

---

## 🎯 Step 2: Zone Selection in Field Row Creation (45 min)

### File to Modify
`app/app/garden/rows/edit/page.tsx`

### Implementation

#### 1. Add state for zones
```typescript
const [availableZones, setAvailableZones] = useState<LandZone[]>([])
const [selectedZoneId, setSelectedZoneId] = useState<string>('')
```

#### 2. Load zones in useEffect
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      // ... existing code ...
      
      if (garden) {
        setGarden(garden)
        
        // Load available zones
        const zones = await getLandZones(garden.id)
        setAvailableZones(zones)
        
        // ... rest of existing code ...
        
        if (isEditing && fieldRowId) {
          const existingRow = fieldRows?.find(r => r.id === fieldRowId)
          if (existingRow) {
            // ... existing code ...
            
            // Set selected zone
            if (existingRow.land_zone_id) {
              setSelectedZoneId(existingRow.land_zone_id)
            }
          }
        }
      }
    } catch (error) {
      // ... existing error handling ...
    }
  }
  loadData()
}, [/* ... existing dependencies ... */])
```

#### 3. Add zone selector in form (after garden name, before basic info)
```typescript
{/* Zone Selection */}
<div className="border-b pb-6 mb-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 Zona Terreno</h3>
  
  {availableZones.length === 0 ? (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 mb-2">
        ⚠️ Nessuna zona configurata per questo orto
      </p>
      <Link
        href={`/app/garden/zones?garden=${garden.id}`}
        className="text-yellow-700 underline hover:text-yellow-900"
      >
        Crea prima una zona →
      </Link>
    </div>
  ) : (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Seleziona Zona *
      </label>
      <select
        value={selectedZoneId}
        onChange={(e) => setSelectedZoneId(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="">Seleziona una zona...</option>
        {availableZones.map(zone => (
          <option key={zone.id} value={zone.id}>
            {zone.zone_name} ({zone.area_hectares} ha) - {zone.current_status === 'active' ? '🟢 Attiva' : '🟡 Riposo'}
          </option>
        ))}
      </select>
      
      {selectedZoneId && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Filare verrà assegnato a: <strong>{availableZones.find(z => z.id === selectedZoneId)?.zone_name}</strong>
          </p>
        </div>
      )}
    </div>
  )}
</div>
```

#### 4. Update handleSave to include zone
```typescript
const handleSave = async () => {
  try {
    // ... existing validation ...
    
    // Validate zone selection
    if (!selectedZoneId) {
      setError('Devi selezionare una zona per il filare')
      return
    }
    
    const fieldRowData = {
      // ... existing fields ...
      land_zone_id: selectedZoneId, // Add this
      // ... rest of fields ...
    }
    
    // ... rest of save logic ...
  } catch (error) {
    // ... existing error handling ...
  }
}
```

#### 5. Update save button disabled condition
```typescript
<button
  onClick={handleSave}
  disabled={
    saving || 
    !fieldRowForm.name.trim() || 
    fieldRowForm.lengthMeters <= 0 ||
    !selectedZoneId // Add this
  }
  // ... rest of button props ...
>
```

### Testing
1. Go to `/app/garden/rows/edit`
2. Verify zone dropdown appears
3. Select a zone
4. Create field row
5. Verify `land_zone_id` is saved
6. Edit existing row - verify zone is pre-selected

---

## 🎯 Step 3: Extend Crop History for Zones (60 min)

### File to Modify
`components/fieldrows/FieldRowCropHistoryPanel.tsx`

### Implementation

#### 1. Update props to accept zoneId
```typescript
interface FieldRowCropHistoryPanelProps {
  rowId?: string // Make optional
  zoneId?: string // Add this
  rowName?: string
  zoneName?: string // Add this
}
```

#### 2. Update component logic
```typescript
export default function FieldRowCropHistoryPanel({ 
  rowId, 
  zoneId, 
  rowName, 
  zoneName 
}: FieldRowCropHistoryPanelProps) {
  // ... existing state ...
  
  useEffect(() => {
    if (rowId) {
      loadRowHistory()
    } else if (zoneId) {
      loadZoneHistory()
    }
  }, [rowId, zoneId])
  
  const loadZoneHistory = async () => {
    if (!zoneId) return
    
    try {
      setLoading(true)
      
      // Get zone history
      const history = await getZoneHistory(zoneId)
      setHistory(history)
      
      // Get zone rotation suggestions
      const suggestions = await getZoneRotationSuggestions(zoneId)
      setSuggestions(suggestions)
      
      // Get zone soil health
      const health = await calculateZoneSoilHealth(zoneId)
      // ... process health data ...
      
    } catch (error) {
      console.error('Error loading zone history:', error)
      setError('Errore nel caricamento dello storico zona')
    } finally {
      setLoading(false)
    }
  }
  
  // ... rest of component ...
  
  // Update title
  const title = zoneName 
    ? `Storico Zona: ${zoneName}`
    : `Storico Filare: ${rowName || 'Sconosciuto'}`
  
  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
      {/* ... rest of JSX ... */}
    </div>
  )
}
```

### Testing
1. Open zone history modal
2. Verify it shows all crops from that zone
3. Verify rotation suggestions are zone-specific
4. Compare with field row history

---

## 🎯 Step 4: Transplant Service Integration (45 min)

### File to Modify
`services/transplantOrchestrationService.ts`

### Implementation

#### 1. Update transplant function to get zone
```typescript
export async function transplantToFieldRow(
  nurseryPlantId: string,
  targetFieldRowId: string,
  gardenId: string,
  userId: string
): Promise<TransplantResult> {
  try {
    // ... existing code ...
    
    // Get field row to extract zone
    const { data: fieldRow, error: rowError } = await supabase
      .from('garden_rows')
      .select('*, land_zone_id')
      .eq('id', targetFieldRowId)
      .single()
    
    if (rowError) throw rowError
    
    // ... existing transplant logic ...
    
    // Register in crop history
    await registerInCropHistory(
      targetFieldRowId,
      fieldRow.land_zone_id, // Pass zone ID
      gardenId,
      userId,
      nurseryPlant,
      context
    )
    
    // ... rest of function ...
  } catch (error) {
    // ... error handling ...
  }
}

async function registerInCropHistory(
  fieldRowId: string,
  landZoneId: string | null, // Add this parameter
  gardenId: string,
  userId: string,
  plant: any,
  context: any
) {
  try {
    // Insert in field_row_crop_history
    const { error: historyError } = await supabase
      .from('field_row_crop_history')
      .insert({
        garden_row_id: fieldRowId,
        garden_id: gardenId,
        user_id: userId,
        crop_name: plant.plant_name,
        crop_variety: plant.variety,
        crop_family: determineCropFamily(plant.plant_name),
        planting_date: new Date().toISOString(),
        planting_context: context
      })
    
    if (historyError) throw historyError
    
    // If zone exists, also register in soil_memory
    if (landZoneId) {
      const { error: memoryError } = await supabase
        .from('soil_memory')
        .insert({
          land_zone_id: landZoneId,
          field_row_id: fieldRowId,
          garden_id: gardenId,
          user_id: userId,
          crop_name: plant.plant_name,
          crop_variety: plant.variety,
          crop_family: determineCropFamily(plant.plant_name),
          planting_date: new Date().toISOString(),
          season_year: new Date().getFullYear(),
          season_type: getCurrentSeason(),
          planting_context: context
        })
      
      if (memoryError) {
        console.error('Error registering in soil_memory:', memoryError)
        // Don't throw - soil memory is optional
      }
    }
  } catch (error) {
    console.error('Error registering in crop history:', error)
    throw error
  }
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}
```

### Testing
1. Transplant a plant from nursery to field row
2. Verify entry in `field_row_crop_history`
3. Verify entry in `soil_memory` with correct `land_zone_id`
4. Delete field row
5. Verify soil_memory entry persists

---

## 🧪 Complete Integration Test

### Test Scenario: Full Workflow

1. **Create Zones**
   - Create "Zona A" (2 ha)
   - Create "Zona B" (2 ha)
   - Verify both appear in list

2. **Set Status**
   - Set Zona A to Active
   - Set Zona B to Resting
   - Verify colors change

3. **Create Field Rows**
   - Create 3 field rows in Zona A
   - Verify zone selection works
   - Verify `land_zone_id` is saved

4. **Transplant Plants**
   - Transplant 5 plants to field rows
   - Verify entries in `soil_memory`
   - Verify `land_zone_id` is correct

5. **View History**
   - Open zone history for Zona A
   - Verify all 5 plants appear
   - Verify rotation suggestions

6. **Delete Field Rows**
   - Delete all 3 field rows
   - Verify plants are removed
   - Verify `soil_memory` persists

7. **Check Memory**
   - Open zone history for Zona A again
   - Verify all 5 plants still in history
   - Verify `field_row_id` is NULL
   - Verify `land_zone_id` is still Zona A

8. **Switch Zones**
   - Set Zona A to Resting
   - Set Zona B to Active
   - Create new field rows in Zona B
   - Verify workflow works for Zona B

### Expected Results
- ✅ All steps complete without errors
- ✅ Soil memory persists after field row deletion
- ✅ Zone history shows complete crop history
- ✅ Rotation suggestions are zone-specific
- ✅ Status changes reflect in UI immediately

---

## 📝 Checklist

### Step 1: Zone Creation Modal
- [ ] Add form state
- [ ] Implement handleCreateZone
- [ ] Add form validation
- [ ] Replace modal JSX
- [ ] Test creation
- [ ] Test validation

### Step 2: Zone Selection in Field Row
- [ ] Add zones state
- [ ] Load zones in useEffect
- [ ] Add zone selector UI
- [ ] Update handleSave
- [ ] Update validation
- [ ] Test creation with zone
- [ ] Test editing with zone

### Step 3: Extend Crop History
- [ ] Update props interface
- [ ] Add loadZoneHistory function
- [ ] Update useEffect
- [ ] Update title logic
- [ ] Test zone history view
- [ ] Compare with row history

### Step 4: Transplant Integration
- [ ] Update transplant function
- [ ] Add registerInCropHistory zone parameter
- [ ] Add soil_memory insert
- [ ] Add getCurrentSeason helper
- [ ] Test transplant
- [ ] Verify soil_memory entry

### Integration Test
- [ ] Complete full workflow test
- [ ] Verify memory persistence
- [ ] Verify zone switching
- [ ] Document any issues

---

## 🚨 Common Issues & Solutions

### Issue: Zone dropdown empty
**Solution**: Verify zones exist for the garden. Create zones first.

### Issue: land_zone_id not saving
**Solution**: Check storageProvider.createFieldRow accepts land_zone_id parameter.

### Issue: Soil memory not persisting
**Solution**: Verify ON DELETE SET NULL on field_row_id foreign key.

### Issue: History not showing zone data
**Solution**: Check getZoneHistory function is querying soil_memory correctly.

---

## 📚 Reference Documentation

- `LAND_ZONES_SYSTEM_COMPLETE.md` - Complete system documentation
- `SISTEMA_ZONE_SEMPLIFICATO.md` - Simplified approach specification
- `services/landZoneService.ts` - Service API reference
- `database/migrations/20260204100000_add_land_zones_and_memory_simplified.sql` - Database schema

---

**Ready to implement! Follow steps in order for best results.** 🚀

