# Specifica: Configurazione Campo Aperto / Serra

**Data:** 2026-01-02
**Categoria:** CAMPO APERTO / SERRA (simili)
**Priorità:** ALTA - Implementazione immediata

---

## 1. OBIETTIVI

Creare step configurazione per Campo Aperto e Serra con:
1. ✅ Conversioni automatiche area (m² → are → ha)
2. ✅ Configurazione filari (opzionale)
3. ✅ Strutture aggiuntive (opzionale, aggiungibili dopo)

---

## 2. STRUTTURA UI

### **Input Superficie Principale**

```
Campo Aperto (opzionale)

💡 Inserisci la superficie totale del tuo campo aperto.

┌─────────────────────────────────┬──────────┐
│ 2000                            │ m²  [▼] │
└─────────────────────────────────┴──────────┘

┌───────────────────────────────────────────┐
│ Superficie Totale:                        │
│ • 2000 m²                                 │
│ • 20 are                                  │
│ • 0.2 ha                                  │
└───────────────────────────────────────────┘
```

**Dropdown unità:**
- m² (metri quadrati)
- are
- ha (ettari)

**Conversioni automatiche:**
- Input: 2000 m² → Mostra: 20 are, 0.2 ha
- Input: 2 ha → Mostra: 20000 m², 200 are
- Input: 50 are → Mostra: 5000 m², 0.5 ha

---

### **Configurazione Filari (Collassabile)**

```
┌────────────────────────────────────────────┐
│ [▼] Configurazione Filari (Opzionale)     │
├────────────────────────────────────────────┤
│                                            │
│ 💡 Specifica numero e dimensioni filari.  │
│    Potrai personalizzare le distanze tra  │
│    file quando pianterai le colture.      │
│                                            │
│ Numero Filari:                             │
│ ┌──────────────┐                           │
│ │ Es. 30       │                           │
│ └──────────────┘                           │
│                                            │
│ Lunghezza Filari (m):                      │
│ ┌──────────────┐                           │
│ │ Es. 100      │                           │
│ └──────────────┘                           │
│                                            │
│ Larghezza Totale (m) - Opzionale:         │
│ ┌──────────────┐                           │
│ │ Es. 20       │                           │
│ └──────────────┘                           │
│                                            │
│ ℹ️ Se specifichi larghezza e numero        │
│    filari, calcoleremo automaticamente     │
│    la distanza media tra file.             │
│                                            │
│ ┌─────────────────────────────────────┐   │
│ │ ✓ Distanza media tra file: 67 cm   │   │
│ └─────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

**Calcolo automatico distanza:**
```javascript
distanzaMedia = (larghezzaTotale / numeroFilari) * 100 // cm
// Esempio: (20m / 30 filari) * 100 = 67 cm
```

---

### **Strutture Aggiuntive (Opzionale)**

```
┌────────────────────────────────────────────┐
│ Strutture Aggiuntive (Opzionale)          │
├────────────────────────────────────────────┤
│                                            │
│ Hai strutture aggiuntive come vasi,       │
│ letti rialzati o cassoni?                 │
│                                            │
│ ┌──────────────────┐  ┌─────────────────┐ │
│ │ Aggiungi Ora     │  │ Salta - Dopo    │ │
│ └──────────────────┘  └─────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

**Se clicca "Aggiungi Ora"** → mostra checkbox:
```
☐ Vasi
☐ Letti Rialzati
☐ Cassoni
☐ Vasche

[Continua]
```

---

### **Differenza SERRA**

Per Serra, aggiungere:

```
┌────────────────────────────────────────────┐
│ ☐ Serra Stagionale                        │
├────────────────────────────────────────────┤
│                                            │
│ Attiva nei mesi:                           │
│ ☑ Gen ☑ Feb ☑ Mar ☑ Apr ☐ Mag ☐ Giu      │
│ ☐ Lug ☐ Ago ☐ Set ☑ Ott ☑ Nov ☑ Dic      │
│                                            │
│ 💡 Per colture esotiche (mango, papaya)   │
│    che richiedono copertura solo nei      │
│    mesi freddi.                            │
│                                            │
└────────────────────────────────────────────┘
```

---

## 3. LOGICA A 2 LIVELLI

### **LIVELLO 1: Wizard (Setup Base)**
Salva configurazione generica:
```json
{
  "gardenType": "OpenField",
  "sizeSqMeters": 2000,
  "sizeUnit": "sqm",
  "rowConfig": {
    "numberOfRows": 30,
    "lengthMeters": 100,
    "widthMeters": 20,
    "defaultRowSpacingCm": 67
  },
  "additionalStructures": {
    "hasVasi": false,
    "hasLettiRialzati": false,
    "hasCassoni": false
  }
}
```

### **LIVELLO 2: Pianificazione Colture**
Quando utente pianta, personalizza per coltura:
```json
{
  "fieldRows": [
    {
      "rowNumbers": "1-5",
      "crop": "Pomodoro San Marzano",
      "spacingCm": 80,  // Personalizzato (default era 67)
      "plantSpacingCm": 40
    },
    {
      "rowNumbers": "11-15",
      "crop": "Zucca Rossa",
      "spacingCm": 200,  // Personalizzato (molto più largo)
      "plantSpacingCm": 100
    }
  ]
}
```

---

## 4. COMPONENTI DA CREARE/MODIFICARE

### **Nuovo Componente: `OpenFieldSizeConfig.tsx`**
```typescript
interface OpenFieldSizeConfigProps {
  onConfigChange: (config: OpenFieldConfig) => void;
  initialValue?: OpenFieldConfig;
}

interface OpenFieldConfig {
  sizeSqMeters: number;
  sizeUnit: AreaUnit;
  rowConfig?: {
    numberOfRows: number;
    lengthMeters: number;
    widthMeters?: number;
    defaultRowSpacingCm?: number;
  };
  showAdditionalStructures: boolean;
}
```

**Funzionalità:**
1. Input superficie con dropdown unità
2. Calcolo conversioni real-time (useEffect)
3. Sezione filari collassabile
4. Calcolo distanza media automatico
5. Pulsanti "Aggiungi Strutture" / "Salta"

---

### **Modificare: `SizeConfigurationStep.tsx`**

Aggiungere logica condizionale basata su gardenType:

```typescript
{gardenType === 'OpenField' && (
  <OpenFieldSizeConfig
    onConfigChange={handleOpenFieldChange}
    initialValue={openFieldConfig}
  />
)}

{gardenType === 'Greenhouse' && (
  <>
    <OpenFieldSizeConfig
      onConfigChange={handleOpenFieldChange}
      initialValue={openFieldConfig}
    />
    <SeasonalGreenhouseConfig
      onConfigChange={handleSeasonalChange}
      initialValue={seasonalConfig}
    />
  </>
)}
```

---

## 5. UTILS DA CREARE

### **File: `utils/areaConverter.ts`** (già esiste, verificare)

```typescript
export type AreaUnit = 'sqm' | 'are' | 'hectare';

export function convertToSqMeters(value: number, unit: AreaUnit): number {
  switch (unit) {
    case 'sqm': return value;
    case 'are': return value * 100;
    case 'hectare': return value * 10000;
  }
}

export function convertFromSqMeters(sqMeters: number, targetUnit: AreaUnit): number {
  switch (targetUnit) {
    case 'sqm': return sqMeters;
    case 'are': return sqMeters / 100;
    case 'hectare': return sqMeters / 10000;
  }
}

export function getAllConversions(value: number, unit: AreaUnit): {
  sqm: string;
  are: string;
  hectare: string;
} {
  const sqMeters = convertToSqMeters(value, unit);
  return {
    sqm: sqMeters.toFixed(2),
    are: (sqMeters / 100).toFixed(2),
    hectare: (sqMeters / 10000).toFixed(4)
  };
}
```

---

## 6. DATABASE SCHEMA

### **Modificare tabella `gardens`**

```sql
-- Aggiungere colonna row_config
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS row_config JSONB;

COMMENT ON COLUMN gardens.row_config IS
'Configurazione filari: numberOfRows, lengthMeters, widthMeters, defaultRowSpacingCm';

-- Aggiungere colonna seasonal_config per serre
ALTER TABLE gardens ADD COLUMN IF NOT EXISTS seasonal_config JSONB;

COMMENT ON COLUMN gardens.seasonal_config IS
'Configurazione stagionale serra: activeMonths array [1-12]';
```

**Esempio row_config:**
```json
{
  "numberOfRows": 30,
  "lengthMeters": 100,
  "widthMeters": 20,
  "defaultRowSpacingCm": 67
}
```

**Esempio seasonal_config:**
```json
{
  "isSeasonal": true,
  "activeMonths": [1, 2, 3, 4, 10, 11, 12]
}
```

---

## 7. TEST PLAN

### **Test 1: Conversioni Area**
1. Inserisci 2000 m²
2. Verifica mostra: "2000 m² = 20 are = 0.2 ha"
3. Cambia unità → "are"
4. Inserisci 20 are
5. Verifica mostra: "2000 m² = 20 are = 0.2 ha"

### **Test 2: Configurazione Filari**
1. Inserisci 30 filari
2. Inserisci 100m lunghezza
3. Inserisci 20m larghezza
4. Verifica calcolo: "Distanza media: 67 cm"
5. Rimuovi larghezza
6. Verifica: calcolo distanza scompare

### **Test 3: Strutture Aggiuntive**
1. Click "Salta - Dopo"
2. Verifica: prosegue senza mostrare checkbox
3. Torna indietro
4. Click "Aggiungi Ora"
5. Verifica: mostra checkbox Vasi/Letti/Cassoni

### **Test 4: Serra Stagionale**
1. Seleziona tipo: "Serra"
2. Verifica: mostra checkbox "Serra Stagionale"
3. Seleziona mesi: Gen-Apr, Ott-Dic
4. Salva
5. Verifica DB: seasonal_config salvato correttamente

---

## 8. FILE DA MODIFICARE/CREARE

### **Nuovi file:**
1. `components/gardens/OpenFieldSizeConfig.tsx`
2. `components/gardens/SeasonalGreenhouseConfig.tsx`
3. `supabase/migrations/20260102140000_add_row_config_seasonal_config.sql`

### **File da modificare:**
1. `components/gardens/SizeConfigurationStep.tsx` - aggiungere logica condizionale
2. `types.ts` - aggiungere rowConfig e seasonalConfig a interface Garden
3. `utils/areaConverter.ts` - verificare funzioni esistenti

---

## 9. PRIORITY ORDER

1. **PRIMA:** Creare `OpenFieldSizeConfig.tsx` con conversioni
2. **POI:** Aggiungere sezione filari collassabile
3. **POI:** Aggiungere pulsanti strutture aggiuntive
4. **INFINE:** Creare `SeasonalGreenhouseConfig.tsx` per serra

---

## 10. NOTE IMPLEMENTAZIONE

- Tutte le configurazioni sono **opzionali** - utente può skipparle
- Conversioni area devono essere **real-time** (useEffect su cambio valore/unità)
- Distanza filari è **suggestiva** - verrà personalizzata in fase piantagione
- Database migrations solo **DOPO** test locale completo
- Mantenere backward compatibility con orti esistenti (rowConfig può essere null)
