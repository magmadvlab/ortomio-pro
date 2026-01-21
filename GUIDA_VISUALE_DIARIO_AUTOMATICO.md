# 🎨 GUIDA VISUALE - DIARIO AUTOMATICO

## 📱 COME APPARE NELL'APP

### 1. Navigazione alla Pagina Diario

```
Menu Laterale
├── 🏠 Dashboard
├── 🌱 Orto
├── 📅 Pianifica
├── 📊 Analisi
└── 📖 Diario  ← CLICCA QUI
```

### 2. Tab del Diario

```
┌─────────────────────────────────────────────────────────┐
│  📖 Diario Operativo                                    │
│  Registra e monitora tutte le attività dell'orto       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Timeline] [Diario Operativo] [⚡ Diario Automatico] [Calendario]
│     ↑              ↑                    ↑                  ↑
│  Esistente    Esistente           NUOVO!            Esistente
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Vista Diario Automatico

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡ Diario Automatico                                           │
│  Registro giornaliero meteo e calcoli agronomici - Orto di Rob │
│                                                                 │
│  [7 giorni] [30 giorni] [1 anno]  ← Selettore periodo         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 STATISTICHE AGGREGATE                                       │
│  ┌──────────┬──────────┬──────────┬──────────┐                │
│  │ 🌡️ 12.5°C│ 🌧️ 45 mm│ ⚡ 125   │ ⚠️ 3     │                │
│  │ Temp Med │ Pioggia  │ GDD Tot  │ Alert    │                │
│  └──────────┴──────────┴──────────┴──────────┘                │
│                                                                 │
│  📅 ENTRIES GIORNALIERE                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ☀️  Venerdì, 19 Gennaio 2026              🌖 68%        │  │
│  │     Giornata serena                                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 🌡️ 2.5° / 12.8°C  🌧️ 3.2 mm  💨 12 km/h  ☀️ UV 2      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ CALCOLI AGRONOMICI                                       │  │
│  │ GDD Base 10°C: 0    Ore Freddo: 0h    Stress: 25 🟢    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 💧 2 irrigazioni  ⚠️ 1 alert                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 🌧️  Giovedì, 18 Gennaio 2026              🌖 72%        │  │
│  │     Giornata piovosa                                     │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ 🌡️ 5.2° / 10.1°C  🌧️ 12.5 mm  💨 18 km/h  ☀️ UV 1     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Modal Dettaglio Entry

```
┌─────────────────────────────────────────────────────────┐
│  Dettagli 19 Gennaio 2026                          [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 DATI METEO COMPLETI                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ {                                                │   │
│  │   "temp_min": 2.5,                              │   │
│  │   "temp_max": 12.8,                             │   │
│  │   "temp_avg": 7.65,                             │   │
│  │   "precipitation_mm": 3.2,                      │   │
│  │   "humidity_avg": 75,                           │   │
│  │   "wind_speed_avg": 12,                         │   │
│  │   "uv_index_max": 2,                            │   │
│  │   "conditions": "light_rain"                    │   │
│  │ }                                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🌱 CALCOLI AGRONOMICI                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ {                                                │   │
│  │   "gdd_base_10": 0,                             │   │
│  │   "gdd_base_5": 2.65,                           │   │
│  │   "chill_hours": 0,                             │   │
│  │   "heat_stress_hours": 0,                       │   │
│  │   "water_stress_index": 25,                     │   │
│  │   "photoperiod_hours": 9.2                      │   │
│  │ }                                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🌙 FASE LUNARE                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ {                                                │   │
│  │   "phase": "waning_gibbous",                    │   │
│  │   "illumination": 68,                           │   │
│  │   "is_favorable_planting": false,               │   │
│  │   "is_favorable_pruning": true                  │   │
│  │ }                                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Chiudi]                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 ELEMENTI VISIVI

### Icone Meteo
```
☀️  clear         - Giornata serena
🌦️  light_rain    - Pioggia leggera
🌧️  rainy         - Giornata piovosa
🌡️  hot           - Giornata calda
❄️  cold          - Giornata fredda
🧊  frost         - Gelata
☁️  unknown       - Condizioni sconosciute
```

### Fasi Lunari
```
🌑  new_moon          - Luna nuova (semina favorevole)
🌒  waxing_crescent   - Luna crescente (semina favorevole)
🌓  first_quarter     - Primo quarto (semina favorevole)
🌔  waxing_gibbous    - Gibbosa crescente (semina favorevole)
🌕  full_moon         - Luna piena (potatura favorevole)
🌖  waning_gibbous    - Gibbosa calante (potatura favorevole)
🌗  last_quarter      - Ultimo quarto (potatura favorevole)
🌘  waning_crescent   - Luna calante (potatura favorevole)
```

### Indicatori Stress Idrico
```
🟢  0-30   - Condizioni ottime (verde)
🟡  30-60  - Stress moderato (giallo)
🔴  60-100 - Stress elevato (rosso)
```

### Colori Card
```
┌─────────────────────────────────┐
│ Sfondo: Bianco                  │
│ Bordo: Grigio chiaro            │
│ Hover: Ombra più marcata        │
│ Click: Apre modal dettaglio     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Sezione Agronomica:             │
│ Sfondo: Verde chiaro            │
│ Bordo: Verde                    │
│ Testo: Verde scuro              │
└─────────────────────────────────┘
```

---

## 📊 DATI VISUALIZZATI

### Card Giornaliera - Sezione Meteo
```
┌─────────────────────────────────────────┐
│ 🌡️ Temperatura                          │
│    2.5° / 12.8°C                        │
│    (min / max)                          │
├─────────────────────────────────────────┤
│ 🌧️ Pioggia                              │
│    3.2 mm                               │
├─────────────────────────────────────────┤
│ 💨 Vento                                │
│    12 km/h                              │
├─────────────────────────────────────────┤
│ ☀️ UV Index                             │
│    2                                    │
└─────────────────────────────────────────┘
```

### Card Giornaliera - Sezione Agronomica
```
┌─────────────────────────────────────────┐
│ GDD Base 10°C: 0                        │
│ (Growing Degree Days)                   │
├─────────────────────────────────────────┤
│ Ore Freddo: 0h                          │
│ (< 7°C per vernalizzazione)             │
├─────────────────────────────────────────┤
│ Stress Idrico: 25 🟢                    │
│ (0-100, basso = buono)                  │
└─────────────────────────────────────────┘
```

### Statistiche Aggregate (Header)
```
┌──────────────────────────────────────────────────────┐
│  🌡️ Temp Media    🌧️ Pioggia Tot   ⚡ GDD Tot      │
│     12.5°C           45 mm           125            │
│                                                      │
│  ⚠️ Alert                                           │
│     3                                               │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 FLUSSO UTENTE

### Scenario 1: Visualizzazione Rapida
```
1. Utente apre app
2. Click su "Diario" nel menu
3. Click su tab "⚡ Diario Automatico"
4. Vede statistiche aggregate immediate
5. Scrolla entries giornaliere
6. Identifica pattern (es: giorni piovosi consecutivi)
```

### Scenario 2: Analisi Dettagliata
```
1. Utente seleziona periodo "30 giorni"
2. Osserva trend temperatura nelle statistiche
3. Click su entry specifica (es: giorno con gelo)
4. Modal mostra dati completi JSON
5. Verifica GDD accumulati
6. Controlla fase lunare per pianificare semina
```

### Scenario 3: Confronto Pluriennale
```
1. Utente seleziona "1 anno"
2. Visualizza tutte le entries dell'anno
3. Nota accumulo GDD totale
4. Confronta con anni precedenti (via SQL)
5. Identifica pattern stagionali
6. Ottimizza timing operazioni future
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (> 768px)
```
┌─────────────────────────────────────────────────────────┐
│  Header con statistiche: 4 colonne                      │
│  ┌──────┬──────┬──────┬──────┐                         │
│  │ Temp │ Piog │ GDD  │ Alert│                         │
│  └──────┴──────┴──────┴──────┘                         │
│                                                         │
│  Card entries: Full width                               │
│  Meteo: 4 colonne                                       │
│  Agronomia: 3 colonne                                   │
└─────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────┐
│  Header statistiche:    │
│  2 colonne              │
│  ┌──────┬──────┐        │
│  │ Temp │ Piog │        │
│  ├──────┼──────┤        │
│  │ GDD  │ Alert│        │
│  └──────┴──────┘        │
│                         │
│  Card entries:          │
│  Stack verticale        │
│  Meteo: 2 colonne       │
│  Agronomia: 2 colonne   │
└─────────────────────────┘
```

---

## 🎯 INTERAZIONI

### Hover Effects
```
Card Entry:
  Default: border-gray-200
  Hover:   shadow-md + cursor-pointer
  
Button Period:
  Active:  bg-blue-600 text-white
  Hover:   bg-blue-700
  Inactive: text-gray-600 hover:text-gray-900
```

### Click Actions
```
Card Entry → Apre modal dettaglio
Button Period → Cambia periodo visualizzato
Button Chiudi Modal → Chiude modal
```

### Loading States
```
┌─────────────────────────┐
│  📅 (pulsante animato)  │
│  Caricamento diario...  │
└─────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────┐
│  📅 (icona grande grigia)       │
│                                 │
│  Nessun dato disponibile        │
│                                 │
│  Il diario automatico inizierà │
│  a registrare dati dal prossimo│
│  aggiornamento giornaliero      │
└─────────────────────────────────┘
```

---

## 🎨 PALETTE COLORI

### Colori Principali
```
Blu primario:    #2563eb (blue-600)
Verde successo:  #16a34a (green-600)
Giallo warning:  #ca8a04 (yellow-600)
Rosso alert:     #dc2626 (red-600)
Grigio testo:    #374151 (gray-700)
Grigio chiaro:   #f3f4f6 (gray-100)
```

### Colori Sezioni
```
Meteo:      Blu (#eff6ff - blue-50)
Agronomia:  Verde (#f0fdf4 - green-50)
Lunare:     Viola (#faf5ff - purple-50)
Alert:      Arancione (#fff7ed - orange-50)
```

---

## 📐 DIMENSIONI

### Spaziature
```
Gap card:        1rem (16px)
Padding card:    1.5rem (24px)
Padding modal:   1.5rem (24px)
Border radius:   0.5rem (8px)
Border width:    1px
```

### Font Sizes
```
Titolo pagina:   1.5rem (24px) - font-bold
Titolo card:     1.125rem (18px) - font-semibold
Testo normale:   0.875rem (14px)
Testo piccolo:   0.75rem (12px)
Statistiche:     1.5rem (24px) - font-bold
```

### Icone
```
Header:          32px
Card:            16px
Statistiche:     20px
Fase lunare:     2rem (emoji)
```

---

## 🎉 ESPERIENZA UTENTE

### Feedback Visivo
```
✅ Caricamento: Animazione pulse
✅ Hover: Ombra e cambio cursore
✅ Click: Transizione smooth
✅ Modal: Backdrop blur
✅ Empty state: Icona + messaggio chiaro
```

### Accessibilità
```
✅ Contrasto colori WCAG AA
✅ Focus states visibili
✅ Testi leggibili (min 14px)
✅ Icone con significato chiaro
✅ Responsive su tutti i device
```

### Performance
```
✅ Lazy loading entries
✅ Pagination implicita (periodo)
✅ Modal on-demand
✅ Dati cached dal service
```

---

**Guida creata da:** Kiro AI Assistant  
**Data:** 20 Gennaio 2026  
**Versione:** 1.0.0
