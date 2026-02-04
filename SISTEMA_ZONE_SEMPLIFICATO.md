# 🌍 Sistema Zone Semplificato - Memoria del Terreno

**Data**: 4 Febbraio 2026  
**Approccio**: Zone fisse configurabili, filari temporanei

---

## 🎯 Concetto Base

### Il Problema Reale

Dopo la fresatura:
- ❌ Non hai posizione precisa dei filari
- ❌ I filari cambiano ogni stagione
- ✅ Ma la terra è sempre quella!

### La Soluzione Semplice

**Zone Fisse** configurate a monte:
- Zona A = 2 ha (Nord)
- Zona B = 2 ha (Sud)

**Ogni stagione scegli**:
- Zona A = orto estivo
- Zona B = riposo

**L'anno dopo inverti**:
- Zona A = riposo
- Zona B = orto autunnale

**La memoria rimane per zona!** ✅

---

## 📊 Struttura Semplificata

```
GARDEN (Orto)
  ↓
LAND_ZONES (Zone Fisse)
  ├─ Zona A (2 ha) - Configurata una volta
  └─ Zona B (2 ha) - Configurata una volta
      ↓
FIELD_ROWS (Filari Temporanei)
  ├─ Filare 1 → appartiene a Zona A
  ├─ Filare 2 → appartiene a Zona A
  └─ Filare 3 → appartiene a Zona B
      ↓
SOIL_MEMORY (Memoria Terreno)
  └─ Collegata alla Zona, non al filare!
```

---

## 🔧 Workflow Semplificato

### 1. Setup Iniziale (Una Volta)

```
1. Crei l'orto
   → "Orto Professionale" (4 ha totali)

2. Configuri le Zone Fisse
   → Zona A: 2 ha (Nord)
   → Zona B: 2 ha (Sud)
   
   Ogni zona ha:
   - Nome
   - Superficie (ha)
   - Tipo terreno (opzionale)
   - Note
```

### 2. Inizio Stagione

```
1. Scegli quale zona coltivare
   → Zona A = ATTIVA (orto estivo)
   → Zona B = RIPOSO

2. Crei i filari nella Zona A
   → Filare 1 (Zona A)
   → Filare 2 (Zona A)
   → Filare 3 (Zona A)
   
3. Trapianti le colture
   → Sistema registra in soil_memory
   → Collegato alla Zona A
```

### 3. Durante la Stagione

```
- Gestisci normalmente i filari
- Sistema registra tutto in soil_memory
- Memoria collegata alla zona, non al filare
```

### 4. Fine Stagione

```
1. Raccogli tutto
2. Elimini i filari
3. Fresatura/lavorazione terra
4. LA MEMORIA RIMANE nella Zona A! ✅
```

### 5. Prossima Stagione

```
1. Inverti le zone
   → Zona A = RIPOSO
   → Zona B = ATTIVA (orto autunnale)

2. AI consulta memoria Zona B
   → Suggerisce colture ottimali
   → Basandosi su storico Zona B

3. Crei nuovi filari in Zona B
4. Il ciclo continua!
```

---

## 📋 Schema Database Semplificato

### Tabella: land_zones (Zone Fisse)

```sql
CREATE TABLE land_zones (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Identificazione
  zone_name TEXT NOT NULL, -- "Zona A", "Zona B"
  zone_code TEXT, -- "ZA", "ZB"
  
  -- Superficie
  area_hectares DECIMAL(10, 2) NOT NULL, -- 2.0
  
  -- Stato Attuale
  current_status TEXT DEFAULT 'active', -- active, resting
  status_since TIMESTAMP DEFAULT NOW(),
  
  -- Caratteristiche (Opzionali)
  soil_type TEXT, -- argilloso, sabbioso, limoso
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabella: garden_rows (Filari con Zona)

```sql
-- Aggiungi solo il campo land_zone_id
ALTER TABLE garden_rows 
ADD COLUMN land_zone_id UUID REFERENCES land_zones(id);
```

### Tabella: soil_memory (Memoria Terreno)

```sql
-- Già esiste, usa land_zone_id
-- Quando elimini filari, la memoria rimane collegata alla zona
```

---

## 🎨 UI Semplificata

### Pagina: Gestione Zone

```
┌─────────────────────────────────────────┐
│ 🌍 Gestione Zone Terreno                │
│                                         │
│ Orto: Orto Professionale (4 ha)        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Zona A                           [Edit] │
│ 2.0 ha • Terreno argilloso              │
│                                         │
│ Status: 🟢 ATTIVA                       │
│ In coltivazione da: 15 aprile 2026      │
│                                         │
│ Filari attivi: 10                       │
│ Colture: Pomodori, Peperoni             │
│                                         │
│ 📊 Storico Zona:                        │
│ • 2025: Leguminose (fagioli)            │
│ • 2024: Crucifere (cavoli)              │
│ • 2023: Cucurbitacee (zucchine)         │
│                                         │
│ 💡 Prossimo suggerito: Leguminose       │
│                                         │
│ [Vedi Storico Completo]                 │
│ [Cambia Status → Riposo]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Zona B                           [Edit] │
│ 2.0 ha • Terreno sabbioso               │
│                                         │
│ Status: 🟡 RIPOSO                       │
│ A riposo da: 1 ottobre 2025             │
│ Fino a: 1 aprile 2026                   │
│                                         │
│ Sovescio: Veccia e segale               │
│                                         │
│ 📊 Storico Zona:                        │
│ • 2025: Solanacee (pomodori)            │
│ • 2024: Cucurbitacee (zucche)           │
│ • 2023: Leguminose (piselli)            │
│                                         │
│ 💡 Prossimo suggerito: Crucifere        │
│                                         │
│ [Vedi Storico Completo]                 │
│ [Cambia Status → Attiva]                │
└─────────────────────────────────────────┘

[+ Aggiungi Nuova Zona]
```

### Pagina: Crea Filare (Modificata)

```
┌─────────────────────────────────────────┐
│ Crea Nuovo Filare                       │
│                                         │
│ 1. Seleziona Zona *                     │
│ [Dropdown]                              │
│ ├─ Zona A (2 ha) - ATTIVA              │
│ └─ Zona B (2 ha) - RIPOSO              │
│                                         │
│ 2. Nome Filare                          │
│ [Filare 1                          ]    │
│                                         │
│ 3. Lunghezza (m)                        │
│ [10                                ]    │
│                                         │
│ ... resto configurazione ...            │
│                                         │
│ [Crea Filare]                           │
└─────────────────────────────────────────┘
```

---

## 🔄 Esempio Completo

### Anno 2026 - Primavera/Estate

```
ZONA A (2 ha) - ATTIVA
├─ Status: In coltivazione
├─ Filari: 10 filari di pomodori
├─ Memoria:
│  ├─ 2025: Leguminose (+50 azoto)
│  ├─ 2024: Crucifere (-10 azoto)
│  └─ 2023: Cucurbitacee (-30 azoto)
└─ Bilancio azoto: +10 (buono per Solanacee!)

ZONA B (2 ha) - RIPOSO
├─ Status: A riposo
├─ Sovescio: Veccia (arricchisce azoto)
├─ Memoria:
│  ├─ 2025: Solanacee (-30 azoto)
│  ├─ 2024: Cucurbitacee (-40 azoto)
│  └─ 2023: Leguminose (+60 azoto)
└─ Bilancio azoto: -10 (riposo necessario!)
```

### Anno 2026 - Autunno/Inverno

```
ZONA A (2 ha) - RIPOSO
├─ Status: A riposo
├─ Filari eliminati dopo raccolto
├─ Memoria aggiornata:
│  ├─ 2026: Solanacee (-30 azoto) ← NUOVO
│  ├─ 2025: Leguminose (+50 azoto)
│  └─ 2024: Crucifere (-10 azoto)
└─ Bilancio azoto: +10 (ancora buono)

ZONA B (2 ha) - ATTIVA
├─ Status: In coltivazione
├─ Filari: 8 filari di cavoli (Crucifere)
├─ Memoria:
│  ├─ 2025: Solanacee (-30 azoto)
│  ├─ 2024: Cucurbitacee (-40 azoto)
│  └─ 2023: Leguminose (+60 azoto)
└─ AI suggerisce: Crucifere ✅ (dopo riposo)
```

---

## 💡 Vantaggi Approccio Semplificato

### 1. Semplicità
- ✅ Configuri zone una volta sola
- ✅ Non serve GPS preciso
- ✅ Facile da capire e usare

### 2. Realistico
- ✅ Rispecchia la realtà agricola
- ✅ Zone fisse, filari temporanei
- ✅ Memoria del terreno preservata

### 3. Flessibile
- ✅ Puoi avere 2, 3, 4+ zone
- ✅ Dimensioni diverse per zona
- ✅ Rotazione personalizzabile

### 4. AI Efficace
- ✅ Memoria chiara per zona
- ✅ Suggerimenti basati su storico zona
- ✅ Bilancio nutrienti per zona

---

## 🚀 Implementazione

### 1. Modifica Minima al Database

```sql
-- Aggiungi campo zona ai filari
ALTER TABLE garden_rows 
ADD COLUMN land_zone_id UUID REFERENCES land_zones(id);

-- Indice per performance
CREATE INDEX idx_garden_rows_zone ON garden_rows(land_zone_id);
```

### 2. UI per Gestione Zone

```typescript
// Pagina: /app/garden/zones
// - Lista zone
// - Crea/Modifica zona
// - Cambia status (attiva/riposo)
// - Vedi storico zona
```

### 3. Modifica Creazione Filare

```typescript
// Aggiungi dropdown selezione zona
// Quando crei filare, assegni a una zona
// Sistema registra in soil_memory con land_zone_id
```

### 4. Storico per Zona

```typescript
// Usa land_zone_id invece di field_row_id
// Memoria persiste anche senza filari
// AI consulta memoria zona
```

---

## 📝 Workflow Utente Finale

### Setup Iniziale (Una Volta)

1. Vai su "Gestione Zone"
2. Clicca "Aggiungi Zona"
3. Compila:
   - Nome: "Zona A"
   - Superficie: 2 ha
   - Tipo terreno: argilloso (opzionale)
4. Ripeti per Zona B
5. ✅ Setup completato!

### Ogni Stagione

1. Vai su "Gestione Zone"
2. Scegli quale zona coltivare
3. Cambia status:
   - Zona A → ATTIVA
   - Zona B → RIPOSO
4. Vai su "Filari"
5. Crea filari selezionando "Zona A"
6. Trapianta normalmente
7. Sistema registra tutto in Zona A

### Fine Stagione

1. Raccogli
2. Elimina filari
3. Vai su "Gestione Zone"
4. Inverti status:
   - Zona A → RIPOSO
   - Zona B → ATTIVA
5. Prossima stagione usa Zona B

### Consulta Storico

1. Vai su "Gestione Zone"
2. Clicca "Vedi Storico Completo" su una zona
3. Vedi:
   - Tutte le colture piantate in quella zona
   - Performance per anno
   - Bilancio nutrienti
   - Suggerimenti AI per prossima coltura

---

## 🎯 Differenza con Approccio Complesso

### Approccio Complesso (GPS)
- ❌ Serve GPS preciso
- ❌ Poligoni e coordinate
- ❌ Complesso da configurare
- ❌ Difficile dopo fresatura

### Approccio Semplificato (Zone)
- ✅ Solo nome e superficie
- ✅ Nessun GPS necessario
- ✅ Facile da configurare
- ✅ Funziona sempre

---

## 🔜 Prossimi Passi

1. **Semplifica migrazione database**
   - Rimuovi GPS boundaries (opzionale)
   - Focus su: nome, superficie, status

2. **Crea UI Gestione Zone**
   - Lista zone
   - Crea/Modifica
   - Cambia status

3. **Modifica Creazione Filare**
   - Aggiungi dropdown zona
   - Obbligatorio selezionare zona

4. **Storico per Zona**
   - Visualizza memoria zona
   - Suggerimenti AI per zona

---

**Semplice, realistico, efficace! 🌍**
