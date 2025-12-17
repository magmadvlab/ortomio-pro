# 🔧 Soluzione: Sincronizzazione Completa di Tutte le Operazioni

## Problema Identificato

Attualmente, **lavorazioni meccaniche** e **trattamenti** vengono salvati direttamente tramite API routes (`/api/mechanical-work` e `/api/treatments`) invece di passare attraverso `IStorageProvider`. Questo significa:

- ✅ I dati sono sincronizzati (vengono salvati nel database Supabase)
- ✅ Sono riconducibili al profilo (`user_id` presente)
- ⚠️ Non seguono lo stesso pattern degli altri dati
- ⚠️ Non possono essere gestiti in modalità offline (localStorage)

## Soluzione Proposta

### Step 1: Aggiungere Tipi ai types.ts

```typescript
// Mechanical Work
export interface MechanicalWorkRecord {
  id: string
  user_id: string
  garden_id?: string
  work_type: MechanicalWorkType
  work_date: string // ISO date string
  area_m2: number
  depth_cm?: number
  equipment_type?: string
  equipment_attachment?: string
  work_metadata?: JSONB
  weather_conditions?: JSONB
  operator_name?: string
  notes?: string
  created_at: string
}

// Treatment
export interface TreatmentRecord {
  id: string
  user_id: string
  garden_id?: string
  crop_name: string
  treatment_date: string // ISO date string
  product_name: string
  active_ingredient?: string
  dosage?: number
  dosage_unit?: 'ml' | 'g' | 'kg' | 'L'
  area_treated?: number
  method?: 'spray' | 'soil' | 'seed' | 'foliar'
  reason?: 'preventive' | 'curative' | 'pest_control' | 'disease_control' | 'nutrient'
  weather_conditions?: JSONB
  operator_name?: string
  notes?: string
  created_at: string
}
```

### Step 2: Aggiungere Metodi a IStorageProvider

```typescript
// Mechanical Work (Pro Feature)
getMechanicalWorks(gardenId?: string): Promise<MechanicalWorkRecord[]>
getMechanicalWork(id: string): Promise<MechanicalWorkRecord | null>
createMechanicalWork(work: Omit<MechanicalWorkRecord, 'id' | 'user_id' | 'created_at'>): Promise<MechanicalWorkRecord>
updateMechanicalWork(id: string, updates: Partial<MechanicalWorkRecord>): Promise<MechanicalWorkRecord>
deleteMechanicalWork(id: string): Promise<void>

// Treatments (Pro Feature)
getTreatments(gardenId?: string): Promise<TreatmentRecord[]>
getTreatment(id: string): Promise<TreatmentRecord | null>
createTreatment(treatment: Omit<TreatmentRecord, 'id' | 'user_id' | 'created_at'>): Promise<TreatmentRecord>
updateTreatment(id: string, updates: Partial<TreatmentRecord>): Promise<TreatmentRecord>
deleteTreatment(id: string): Promise<void>
```

### Step 3: Implementare in SupabaseStorageProvider

```typescript
// Mechanical Work
async getMechanicalWorks(gardenId?: string): Promise<MechanicalWorkRecord[]> {
  const client = this.ensureClient()
  let query = client
    .from('mechanical_work_register')
    .select('*')
    .order('work_date', { ascending: false })
  
  if (gardenId) {
    query = query.eq('garden_id', gardenId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data.map(this.mapMechanicalWorkFromDB)
}

async createMechanicalWork(work: Omit<MechanicalWorkRecord, 'id' | 'user_id' | 'created_at'>): Promise<MechanicalWorkRecord> {
  const client = this.ensureClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data, error } = await client
    .from('mechanical_work_register')
    .insert({
      ...work,
      user_id: user.id,
      work_date: work.work_date,
    })
    .select()
    .single()
  
  if (error) throw error
  return this.mapMechanicalWorkFromDB(data)
}

// Similar for update, delete, and treatments...
```

### Step 4: Implementare in LocalStorageProvider

```typescript
// Mechanical Work
async getMechanicalWorks(gardenId?: string): Promise<MechanicalWorkRecord[]> {
  const key = 'ortomio_mechanical_works'
  const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[]
  
  if (gardenId) {
    return allWorks.filter(w => w.garden_id === gardenId)
  }
  return allWorks
}

async createMechanicalWork(work: Omit<MechanicalWorkRecord, 'id' | 'user_id' | 'created_at'>): Promise<MechanicalWorkRecord> {
  const key = 'ortomio_mechanical_works'
  const allWorks = JSON.parse(localStorage.getItem(key) || '[]') as MechanicalWorkRecord[]
  
  const newWork: MechanicalWorkRecord = {
    ...work,
    id: crypto.randomUUID(),
    user_id: 'local_user', // Per localStorage
    created_at: new Date().toISOString(),
  }
  
  allWorks.push(newWork)
  localStorage.setItem(key, JSON.stringify(allWorks))
  return newWork
}

// Similar for update, delete, and treatments...
```

### Step 5: Modificare i Componenti

**Prima** (mechanical-work/page.tsx):
```typescript
const response = await fetch('/api/mechanical-work', {
  method: 'POST',
  body: JSON.stringify(formData),
})
```

**Dopo**:
```typescript
const newWork = await storageProvider.createMechanicalWork({
  ...formData,
  garden_id: selectedGardenId || undefined,
})
```

## Vantaggi della Soluzione

1. ✅ **Consistenza**: Tutte le operazioni seguono lo stesso pattern
2. ✅ **Sincronizzazione**: I dati vengono sincronizzati automaticamente tra dispositivi
3. ✅ **Offline Support**: Con LocalStorageProvider, funziona anche offline
4. ✅ **Testabilità**: Più facile testare con mock providers
5. ✅ **Manutenibilità**: Codice più pulito e organizzato

## Implementazione

Questa soluzione richiede:
1. ✅ Aggiungere tipi a `types.ts`
2. ✅ Aggiungere metodi a `IStorageProvider`
3. ✅ Implementare in `SupabaseStorageProvider`
4. ✅ Implementare in `LocalStorageProvider`
5. ✅ Modificare `mechanical-work/page.tsx`
6. ✅ Modificare `treatments/page.tsx`

## Note Importanti

- Le API routes (`/api/mechanical-work` e `/api/treatments`) possono rimanere per retrocompatibilità, ma dovrebbero essere deprecate
- I componenti devono essere aggiornati per usare `storageProvider` invece di chiamate API dirette
- La migrazione può essere fatta gradualmente, mantenendo entrambi i metodi durante la transizione

