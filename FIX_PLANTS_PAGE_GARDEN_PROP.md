# Fix Plants Page - Garden Prop Missing

**Data**: 15 Gennaio 2026  
**Problema**: Runtime error "Cannot read properties of undefined (reading 'id')"  
**Causa**: `SmartPlantManager` richiede prop `garden` ma non veniva passata

---

## 🐛 Errore

```
Runtime TypeError
Cannot read properties of undefined (reading 'id')
components/plants/SmartPlantManager.tsx (96:14)

useEffect(() => {
  loadPlants();
  loadRowsAndMappings();
  loadSyncStatistics();
}, [garden.id]); // ❌ garden era undefined
```

---

## 🔧 Fix Applicato

### File Modificato: `app/app/plants/page.tsx`

**Prima** (non funzionante):
```tsx
export default function PlantsPage() {
  return (
    <FeatureGate feature="INDIVIDUAL_PLANTS">
      <SmartPlantManager /> {/* ❌ Manca prop garden */}
    </FeatureGate>
  )
}
```

**Dopo** (funzionante):
```tsx
export default function PlantsPage() {
  const { storageProvider } = useStorage()
  const [activeGarden, setActiveGarden] = useState<Garden | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveGarden()
  }, [storageProvider])

  const loadActiveGarden = async () => {
    try {
      setLoading(true)
      const gardens = await storageProvider.getGardens()
      if (gardens.length > 0) {
        setActiveGarden(gardens[0])
      }
    } catch (error) {
      console.error('Error loading garden:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  if (!activeGarden) {
    return <div>Nessun giardino disponibile</div>
  }

  return (
    <FeatureGate feature="INDIVIDUAL_PLANTS">
      <SmartPlantManager garden={activeGarden} /> {/* ✅ Prop garden passata */}
    </FeatureGate>
  )
}
```

---

## ✅ Modifiche Applicate

1. **Aggiunto state management**:
   - `activeGarden`: Garden attivo da passare al componente
   - `loading`: Stato caricamento

2. **Aggiunto useEffect**:
   - Carica lista giardini all'avvio
   - Seleziona primo giardino disponibile

3. **Aggiunto loading state**:
   - Mostra "Caricamento..." durante fetch

4. **Aggiunto empty state**:
   - Mostra messaggio se nessun giardino disponibile

5. **Passata prop garden**:
   - `<SmartPlantManager garden={activeGarden} />`

---

## 🧪 Test

- [x] Nessun errore TypeScript
- [x] Nessun errore runtime
- [x] Componente riceve prop garden correttamente
- [x] Loading state funziona
- [x] Empty state funziona

---

## 📝 Note

### Perché è successo?

Il componente `SmartPlantManager` è stato creato per essere riusabile e richiede sempre un `garden` come prop. La pagina iniziale era troppo semplice e non gestiva il caricamento del garden.

### Pattern Applicato

Stesso pattern usato nelle altre pagine (orchard, vineyard, olives):
1. Carica giardini da storage
2. Seleziona primo disponibile
3. Passa al componente figlio

### Miglioramenti Futuri (opzionali)

- [ ] Aggiungere selector per scegliere giardino
- [ ] Salvare ultimo giardino selezionato in localStorage
- [ ] Aggiungere paginazione se molti giardini

---

## ✅ Status

**RISOLTO** - La pagina `/app/plants` ora funziona correttamente.
