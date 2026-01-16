# 📸 Guida Visuale: Sistema Zone e Filari

**Data:** 16 Gennaio 2026

---

## 🔄 Prima vs Dopo

### PRIMA ❌

#### LocationSelector (Mock Data)
```
┌─────────────────────────────────────────┐
│ 📍 Seleziona zona, filare o porzione... │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ ZONE                                    │
│ 🗺️ Zona Nord                            │
│    Area settentrionale                  │  ← Solo descrizione
│                                         │
│ 🗺️ Zona Sud                             │
│    Area meridionale                     │
├─────────────────────────────────────────┤
│ FILARI                                  │  ← Separati dalle zone
│ 📏 Zona Nord - Filare 1                 │
│    100m • Sesto 50cm                    │
│ 📏 Zona Nord - Filare 2                 │
│    80m • Sesto 40cm                     │
└─────────────────────────────────────────┘
```

**Problemi:**
- ❌ Nessuna dimensione zona visibile
- ❌ Filari separati dalle zone
- ❌ Non chiaro quanti filari per zona
- ❌ Dati mock hardcoded

---

### DOPO ✅

#### LocationSelector (Dati Reali + Gerarchia)
```
┌─────────────────────────────────────────┐
│ 📍 Seleziona zona, filare o porzione... │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ ZONE                        [+ Crea]    │
├─────────────────────────────────────────┤
│ 🗺️ Zona Nord                            │
│    📐 300 m²                             │  ← Dimensione visibile!
│    Area settentrionale                  │
│    2 filari                              │  ← Conteggio filari!
│    ┌─────────────────────────────────┐  │
│    │ 📏 Filare 1 #1                  │  │  ← Filari annidati!
│    │    📏 100m • Sesto 50cm         │  │
│    ├─────────────────────────────────┤  │
│    │ 📏 Filare 2 #2                  │  │
│    │    📏 80m • Sesto 40cm          │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ 🗺️ Zona Sud                             │
│    📐 400 m²                             │
│    1 filare                              │
│    ┌─────────────────────────────────┐  │
│    │ 📏 Filare 3 #3                  │  │
│    │    📏 120m • Sesto 60cm         │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ FILARI SENZA ZONA                       │  ← Nuova sezione!
│ 📏 Filare Temporaneo                    │
│    📏 50m • Sesto 30cm                  │
└─────────────────────────────────────────┘
```

**Miglioramenti:**
- ✅ Dimensioni zone sempre visibili (300 m², 400 m²)
- ✅ Filari annidati sotto le loro zone
- ✅ Conteggio filari per zona (2 filari, 1 filare)
- ✅ Sezione separata per filari senza zona
- ✅ Dati reali da Supabase
- ✅ Pulsante "Crea" per zone vuote

---

## 🆕 Nuovo Componente: ZoneFieldRowManager

### Gestione Zone

```
┌─────────────────────────────────────────────────┐
│ 🗺️ Zone dell'Orto          [+ Nuova Zona]      │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Zona Nord                        [✏️] [🗑️]  │ │
│ │ Area settentrionale                         │ │
│ │ 📐 300 m² • 2 filari                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Zona Sud                         [✏️] [🗑️]  │ │
│ │ Area meridionale                            │ │
│ │ 📐 400 m² • 1 filare                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Click su "Nuova Zona":**
```
┌─────────────────────────────────────────────────┐
│ Nuova Zona                                      │
├─────────────────────────────────────────────────┤
│ Nome Zona *                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ es. Zona Nord, Serra 1, ecc.                │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Descrizione                                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ es. Area settentrionale                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Superficie (m²) *                               │
│ ┌─────────────────────────────────────────────┐ │
│ │ es. 300                                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [💾 Crea]  [Annulla]                            │
└─────────────────────────────────────────────────┘
```

### Gestione Filari

```
┌─────────────────────────────────────────────────┐
│ 📏 Filari                  [+ Nuovo Filare]     │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Filare 1 #1                      [✏️] [🗑️]  │ │
│ │ 📏 100m • Sesto 50cm • 📍 Zona Nord         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Filare 2 #2                      [✏️] [🗑️]  │ │
│ │ 📏 80m • Sesto 40cm • 📍 Zona Nord          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Filare 3 #3                      [✏️] [🗑️]  │ │
│ │ 📏 120m • Sesto 60cm • 📍 Zona Sud          │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Click su "Nuovo Filare":**
```
┌─────────────────────────────────────────────────┐
│ Nuovo Filare                                    │
├─────────────────────────────────────────────────┤
│ Nome Filare *                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ es. Filare 1, Filare Pomodori, ecc.         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Lunghezza (m) *        Sesto Impianto (cm)     │
│ ┌──────────────────┐   ┌──────────────────────┐ │
│ │ es. 100          │   │ es. 50               │ │
│ └──────────────────┘   └──────────────────────┘ │
│                                                 │
│ Zona                   Numero Filare            │
│ ┌──────────────────┐   ┌──────────────────────┐ │
│ │ Zona Nord      ▼ │   │ es. 1                │ │
│ └──────────────────┘   └──────────────────────┘ │
│                                                 │
│ [💾 Crea]  [Annulla]                            │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Flusso Utente Completo

### 1. Setup Iniziale

```
┌─────────────────────────────────────────────────┐
│ STEP 1: Vai in Impostazioni                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: Sezione "Zone e Filari"                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: Crea Zone                               │
│                                                 │
│ [+ Nuova Zona]                                  │
│ ├─ Nome: "Zona Nord"                            │
│ ├─ Descrizione: "Area settentrionale"           │
│ ├─ Superficie: 300 m²                           │
│ └─ [Crea]                                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ STEP 4: Crea Filari                             │
│                                                 │
│ [+ Nuovo Filare]                                │
│ ├─ Nome: "Filare 1"                             │
│ ├─ Lunghezza: 100m                              │
│ ├─ Sesto: 50cm                                  │
│ ├─ Zona: "Zona Nord"                            │
│ ├─ Numero: 1                                    │
│ └─ [Crea]                                       │
└─────────────────────────────────────────────────┘
```

### 2. Uso in Operazioni

```
┌─────────────────────────────────────────────────┐
│ Form Trattamento                                │
├─────────────────────────────────────────────────┤
│ Dove vuoi applicare il trattamento?             │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📍 Zona Nord - Filare 1 (100m)            ▼ │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Prodotto: Rame Ossicloruro                      │
│ Dosaggio: 2g/L                                  │
│ Quantità: 10L                                   │
│                                                 │
│ [💾 Salva Trattamento]                          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ ✅ Trattamento salvato!                         │
│                                                 │
│ Salvato per:                                    │
│ 🗺️ Zona: Zona Nord (300 m²)                    │
│ 📏 Filare: Filare 1 #1 (100m)                   │
│ 📅 Data: 16/01/2026                             │
└─────────────────────────────────────────────────┘
```

---

## 📊 Visualizzazione Dati

### Database → UI

```
DATABASE (garden_zones)
┌──────────────────────────────────────┐
│ id: uuid-1                           │
│ name: "Zona Nord"                    │
│ description: "Area settentrionale"   │
│ area_sqm: 300                        │
│ garden_id: garden-uuid               │
└──────────────────────────────────────┘
                ↓
UI (LocationSelector)
┌──────────────────────────────────────┐
│ 🗺️ Zona Nord                         │
│    📐 300 m²                          │
│    Area settentrionale               │
│    2 filari                           │
└──────────────────────────────────────┘
```

```
DATABASE (field_rows)
┌──────────────────────────────────────┐
│ id: uuid-2                           │
│ name: "Filare 1"                     │
│ length_meters: 100                   │
│ plant_spacing_cm: 50                 │
│ row_number: 1                        │
│ zone_id: uuid-1                      │
│ garden_id: garden-uuid               │
└──────────────────────────────────────┘
                ↓
UI (LocationSelector)
┌──────────────────────────────────────┐
│    📏 Filare 1 #1                    │
│       📏 100m • Sesto 50cm           │
└──────────────────────────────────────┘
```

---

## 🎨 Stati UI

### Stato Vuoto (Nessuna Zona)

```
┌─────────────────────────────────────────────────┐
│ ZONE                        [+ Crea zona]       │
├─────────────────────────────────────────────────┤
│                                                 │
│         Nessuna zona creata.                    │
│                                                 │
│   Vai in Impostazioni per creare zone e filari. │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Stato Caricamento

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ⏳ Caricamento...                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Stato Popolato

```
┌─────────────────────────────────────────────────┐
│ ZONE                                            │
├─────────────────────────────────────────────────┤
│ 🗺️ Zona Nord (300 m²) • 2 filari               │
│    📏 Filare 1 #1 (100m)                        │
│    📏 Filare 2 #2 (80m)                         │
├─────────────────────────────────────────────────┤
│ 🗺️ Zona Sud (400 m²) • 1 filare                │
│    📏 Filare 3 #3 (120m)                        │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Dettagli Tecnici

### Query Ottimizzate

**Carica Zone con Conteggio Filari:**
```sql
SELECT 
  z.*,
  COUNT(fr.id) as field_row_count
FROM garden_zones z
LEFT JOIN field_rows fr ON z.id = fr.zone_id
WHERE z.garden_id = 'garden-uuid'
GROUP BY z.id
ORDER BY z.name;
```

**Carica Filari con Nome Zona:**
```sql
SELECT 
  fr.*,
  z.name as zone_name
FROM field_rows fr
LEFT JOIN garden_zones z ON fr.zone_id = z.id
WHERE fr.garden_id = 'garden-uuid'
ORDER BY 
  fr.row_number ASC NULLS LAST,
  fr.name ASC;
```

### Componenti TypeScript

**LocationSelector Props:**
```typescript
interface LocationSelectorProps {
  garden: Garden
  selectedZoneId?: string
  selectedFieldRowId?: string
  selectedSectionId?: string
  onLocationChange: (location: {
    zoneId?: string
    zoneName?: string
    fieldRowId?: string
    fieldRowName?: string
    sectionId?: string
    sectionName?: string
    fullLocationName: string
  }) => void
  placeholder?: string
  className?: string
}
```

**ZoneFieldRowManager Props:**
```typescript
interface ZoneFieldRowManagerProps {
  garden: Garden
}
```

---

## ✅ Checklist Visuale

### LocationSelector
- [x] ✅ Mostra dimensioni zone (📐 300 m²)
- [x] ✅ Mostra conteggio filari (2 filari)
- [x] ✅ Gerarchia zone → filari
- [x] ✅ Filari annidati sotto zone
- [x] ✅ Sezione filari senza zona
- [x] ✅ Dati reali da Supabase
- [x] ✅ Icone colorate per tipo
- [x] ✅ Informazioni complete

### ZoneFieldRowManager
- [x] ✅ Form creazione zone
- [x] ✅ Form creazione filari
- [x] ✅ Modifica inline
- [x] ✅ Eliminazione con conferma
- [x] ✅ Validazione campi
- [x] ✅ Messaggi successo/errore
- [x] ✅ Dropdown zone per filari
- [x] ✅ Responsive design

---

## 🎓 Legenda Icone

```
🏡 = Orto (Garden)
🗺️ = Zona (Zone)
📏 = Filare (Field Row)
✂️ = Porzione (Section)
🌱 = Pianta (Plant)
📐 = Dimensione/Area
📍 = Posizione/Location
#️⃣ = Numero
✏️ = Modifica
🗑️ = Elimina
💾 = Salva
➕ = Aggiungi/Crea
✅ = Completato/Successo
❌ = Errore/Problema
⏳ = Caricamento
```

---

**Guida visuale completa del sistema Zone e Filari**  
**Aggiornata al 16 Gennaio 2026**

