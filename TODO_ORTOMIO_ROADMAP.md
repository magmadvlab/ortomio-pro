# 🚀 OrtoMio - Roadmap Sviluppo e TODO List

## 📋 STATO ATTUALE (Completato)

### ✅ Row Tracking System (COMPLETATO)
- [x] **Database Schema**: Aggiunte colonne `bed_row_id`, `field_row_id` a tutte le tabelle operazioni
- [x] **Migrazioni Database**: Applicate tutte le migrazioni per row tracking
- [x] **UI Forms**: Aggiornati form lavorazioni meccaniche per mostrare filari campo aperto
- [x] **Salvataggio Dati**: Logica per distinguere tra `garden_rows` e `field_rows`
- [x] **Test Funzionamento**: Verificato che Orto di Rob mostra correttamente i 4 filari

### ✅ Dashboard Cleanup (COMPLETATO)
- [x] **Rimosso AccessoriesWidget** dalla dashboard principale
- [x] **Rimosso GardenBedsWidget** (Zone di Coltivazione) dalla dashboard
- [x] **Integrato AccessoriesManager** in `/app/mechanical-work`
- [x] **Aggiunto tab "Struttura"** in `/app/garden` per gestione zone

---

## 🎯 TODO PRIORITARI

### 1. 🌙 WIDGET METEO + LUNA SMART (ALTA PRIORITÀ)
**Obiettivo**: Unificare meteo e fase lunare con consigli pratici immediati

#### 📋 Tasks:
- [ ] **Creare nuovo componente** `WeatherLunarWidget.tsx`
- [ ] **Integrare calcolo fase lunare** con logica consigli
- [ ] **Logica consigli intelligenti**:
  - Luna Crescente → Semina ortaggi da frutto (pomodori, zucchine, fagioli)
  - Luna Calante → Semina radici (carote, cipolle), trapianti
  - Combinare con condizioni meteo per consigli ottimali
- [ ] **UI Design**: Widget unificato con sezioni meteo + luna + consigli
- [ ] **Sostituire** WeatherWidget esistente nella dashboard
- [ ] **Test**: Verificare consigli corretti per diverse fasi lunari

#### 🌙 Specifiche Consigli Lunari:
```
LUNA CRESCENTE (Linfa verso l'alto):
- Semina: Pomodori, peperoni, zucche, fagioli, piselli, lattuga, spinaci
- Focus: Sviluppo fogliare e frutti

LUNA CALANTE (Linfa verso radici):
- Semina: Patate, carote, cipolle, rape, cavoli, bietole
- Trapianti: Favorisce radicamento
- Raccolta: Ortaggi da conservare (aglio, cipolle)
```

---

### 2. 🧹 DASHBOARD SIMPLIFICATION (ALTA PRIORITÀ)
**Obiettivo**: Dashboard essenziale con solo informazioni actionable

#### 📋 Tasks:
- [ ] **Rimuovere widget non essenziali**:
  - [ ] Checklist Stagionale → Spostare in `/app/planner`
  - [ ] Stato Salute + Prossimi Giorni → Semplificare o rimuovere
  - [ ] Orto Estivo/Invernale → Spostare in `/app/planner`
  - [ ] Banca dei Semi → Spostare in `/app/semenzaio`
  - [ ] Piantine Pronte → Ridurre prominenza o spostare
  - [ ] Alberelli → Ridurre prominenza o spostare
  - [ ] Matching Geografico → Spostare in `/app/search`

- [ ] **Dashboard finale** dovrebbe contenere solo:
  - Meteo + Luna Smart Widget
  - Task Urgenti di Oggi (max 3-5)
  - Raccolti Pronti (se presenti)
  - Quick Actions

---

### 3. 🌱 TRACCIABILITÀ PIANTA-PER-PIANTA (MEDIA PRIORITÀ)
**Obiettivo**: Sistema completo Orto → Filare → Pianta Singola

#### 📋 Phase 1: Calcolo Automatico Piante
- [ ] **Funzione calcolo piante**:
  ```sql
  CREATE FUNCTION calculate_plants_in_row(
    row_length_m DECIMAL,
    plant_spacing_cm INTEGER
  ) RETURNS INTEGER
  ```
- [ ] **Aggiornare UI filari** per mostrare numero piante calcolato
- [ ] **Auto-calcolo inverso**: Da numero piante → lunghezza minima

#### 📋 Phase 2: Database Schema Piante Individuali
- [ ] **Tabella `garden_plants`**:
  ```sql
  CREATE TABLE garden_plants (
    id UUID PRIMARY KEY,
    row_id UUID REFERENCES garden_rows(id),
    field_row_id UUID REFERENCES field_rows(id),
    position_in_row INTEGER, -- 1, 2, 3...
    plant_code TEXT, -- "F1-P001"
    variety TEXT,
    planting_date DATE,
    status TEXT, -- 'healthy', 'diseased', 'dead'
    coordinates JSONB -- {x: 1.5, y: 0}
  );
  ```

- [ ] **Tabella `plant_operations`**:
  ```sql
  CREATE TABLE plant_operations (
    id UUID PRIMARY KEY,
    plant_id UUID REFERENCES garden_plants(id),
    operation_type TEXT, -- 'watering', 'fertilizing', 'treatment'
    operation_date DATE,
    quantity DECIMAL,
    notes TEXT,
    photo_urls TEXT[]
  );
  ```

#### 📋 Phase 3: UI Gestione Piante Individuali
- [ ] **Vista filare con piante numerate**
- [ ] **Click pianta** → Modal dettagli + operazioni
- [ ] **Sistema foto per pianta** → Cronologia visiva crescita
- [ ] **Tracking stato salute** → Indicatori visivi
- [ ] **Operazioni per pianta** → Irrigazione, fertilizzazione, trattamenti specifici

---

### 4. 🔧 COMPLETARE ROW TRACKING (MEDIA PRIORITÀ)
**Obiettivo**: Estendere row tracking a tutti i form operazioni

#### 📋 Tasks:
- [ ] **Aggiornare form Irrigazione** (`/app/irrigation`):
  - [ ] Caricare `field_rows` oltre a `garden_rows`
  - [ ] Logica salvataggio con `field_row_id`
  - [ ] Test con Orto di Rob

- [ ] **Aggiornare form Trattamenti** (`/app/treatments`):
  - [ ] Caricare `field_rows` oltre a `garden_rows`
  - [ ] Logica salvataggio con `field_row_id`
  - [ ] Test con Orto di Rob

- [ ] **Aggiornare form Fertilizzazione** (`/app/nutrition`):
  - [ ] Caricare `field_rows` oltre a `garden_rows`
  - [ ] Logica salvataggio con `field_row_id`
  - [ ] Test con Orto di Rob

---

### 5. 📱 UX IMPROVEMENTS (BASSA PRIORITÀ)
**Obiettivo**: Migliorare esperienza utente generale

#### 📋 Tasks:
- [ ] **Mobile responsiveness** per tutti i nuovi form
- [ ] **Loading states** per operazioni database
- [ ] **Error handling** migliorato
- [ ] **Feedback visivo** per operazioni completate
- [ ] **Tooltips** per spiegare funzionalità avanzate

---

## 🗂️ SPOSTAMENTI SEZIONI

### 📍 Sezioni da Riorganizzare:
- **Checklist Stagionale** → `/app/planner` (Pianificazione)
- **Banca dei Semi** → `/app/semenzaio` (Semenzaio)
- **Piantine/Alberelli** → `/app/semenzaio` (Semenzaio)
- **Matching Geografico** → `/app/search` (Ricerca Piante)
- **Fase Lunare** → Integrata in Meteo Smart Widget
- **Accessori** → `/app/mechanical-work` ✅ (FATTO)
- **Zone Coltivazione** → `/app/garden?tab=structure` ✅ (FATTO)

---

## 🎯 MILESTONE

### 🏁 Milestone 1: Dashboard Essenziale (1-2 giorni)
- Widget Meteo + Luna Smart
- Rimozione widget non essenziali
- Dashboard pulita e actionable

### 🏁 Milestone 2: Row Tracking Completo (2-3 giorni)
- Tutti i form operazioni supportano field_rows
- Test completo su tutti i tipi di operazioni
- Documentazione aggiornata

### 🏁 Milestone 3: Tracciabilità Pianta-per-Pianta (1-2 settimane)
- Calcolo automatico piante
- Database schema piante individuali
- UI per gestione piante singole
- Sistema foto e tracking salute

---

## 📝 NOTE TECNICHE

### 🔧 Considerazioni Implementazione:
- **Performance**: Ottimizzare query per grandi numeri di piante
- **Storage**: Gestione efficiente foto piante
- **Scalabilità**: Sistema deve funzionare con centinaia di piante
- **Backup**: Strategia backup per dati critici piante

### 🧪 Testing Strategy:
- **Unit Tests**: Funzioni calcolo piante
- **Integration Tests**: Form operazioni con row tracking
- **E2E Tests**: Flusso completo orto → filare → pianta
- **Performance Tests**: Caricamento con molte piante

---

## 🚀 PRIORITÀ ESECUZIONE

1. **IMMEDIATO**: Widget Meteo + Luna Smart
2. **QUESTA SETTIMANA**: Dashboard Simplification
3. **PROSSIMA SETTIMANA**: Completare Row Tracking
4. **PROSSIMO MESE**: Tracciabilità Pianta-per-Pianta

---

*Ultimo aggiornamento: 10 Gennaio 2026*
*Stato: Row Tracking completato, Dashboard cleanup completato*