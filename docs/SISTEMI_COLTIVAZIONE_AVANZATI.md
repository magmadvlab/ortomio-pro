# Sistemi di Coltivazione Avanzati

Documentazione completa per la gestione di serre, sistemi idroponici, acquaponici, aeroponici e accessori in OrtoMio AI.

## Indice

1. [Serre e Tunnel](#serre-e-tunnel)
2. [Sistemi Idroponici](#sistemi-idroponici)
3. [Sistemi Acquaponici](#sistemi-acquaponici)
4. [Sistemi Aeroponici](#sistemi-aeroponici)
5. [Coltivazione Indoor](#coltivazione-indoor)
6. [Accessori Giardino](#accessori-giardino)
7. [Monitoraggio Parametri](#monitoraggio-parametri)
8. [Suggerimenti Automatici](#suggerimenti-automatici)

---

## Serre e Tunnel

### Configurazione

Le serre e i tunnel possono essere configurati durante la creazione del giardino o modificando un giardino esistente.

**Tipi di Struttura:**
- **Archetti**: Serra tradizionale con archetti
- **Tunnel**: Tunnel/polytunnel semplice
- **ColdFrame**: Cassone freddo
- **Polytunnel**: Tunnel in polietilene

**Tipi di Copertura:**
- **Polietilene**: Film plastico (spessore configurabile in micron)
- **Policarbonato**: Lastre rigide
- **Vetro**: Vetro tradizionale
- **Rete**: Rete ombreggiante o protettiva

**Caratteristiche:**
- Spaziatura archetti (cm)
- Altezza archetti (cm)
- Materiale archetti (Acciaio, Alluminio, PVC, Bambù)
- Ventilazione (opzionale)
- Riscaldamento (opzionale)
- Temperature min/max garantite

### Utilizzo

Le serre vengono riconosciute automaticamente dal sistema e i suggerimenti vengono adattati alle condizioni protette. Le piante che richiedono serra (come frutta esotica) possono essere coltivate solo in giardini di tipo `Greenhouse` o `Tunnel`.

---

## Sistemi Idroponici

### Tipi di Sistemi Supportati

1. **NFT (Nutrient Film Technique)**
   - Canali con flusso continuo di soluzione nutritiva
   - Configurazione: lunghezza canali, pendenza, portata, numero canali

2. **DWC (Deep Water Culture)**
   - Piante sospese su secchi con radici in soluzione ossigenata
   - Configurazione: dimensione secchi, numero secchi, pompa aria

3. **Ebb & Flow (Flood and Drain)**
   - Allagamento periodico del substrato
   - Configurazione: profondità allagamento, durata, frequenza

4. **Drip System**
   - Irrigazione a goccia con timer
   - Configurazione: portata gocciolatori, numero, frequenza timer

5. **Wick System**
   - Sistema passivo con stoppini
   - Configurazione base

6. **Kratky Method**
   - Sistema passivo senza pompe
   - Configurazione base

### Configurazione Soluzione Nutritiva

- **Capacità Serbatoio**: Litri totali
- **Volume Attuale**: Litri attuali di soluzione
- **pH Target**: pH obiettivo (tipicamente 5.5-6.5)
- **EC Target**: Conducibilità elettrica target (tipicamente 1.5-3.0 mS/cm)
- **Marca Nutrienti**: Opzionale
- **Formula NPK**: Opzionale

### Manutenzione

- **Frequenza Cambio Soluzione**: Giorni tra cambi completi
- **Frequenza Controllo pH**: Giorni tra controlli pH/EC

### Monitoraggio

Il sistema genera automaticamente suggerimenti per:
- Controlli pH/EC programmati
- Cambio soluzione nutritiva
- Aggiunta nutrienti quando volume basso
- Pulizia sistema mensile
- Controllo radici (per NFT/DWC)
- Alert critici se parametri fuori range

---

## Sistemi Acquaponici

### Configurazione

**Tipo Sistema:**
- MediaBed
- NFT
- DWC
- Ibrido

**Vasca Pesci:**
- Capacità vasca (litri)
- Specie pesci (es. Tilapia, Carpe)
- Numero pesci
- Biomassa pesci (kg)

**Filtrazione:**
- Filtro meccanico (opzionale)
- Filtro biologico (opzionale)
- Materiale biofilter
- Volume biofilter

**Parametri Qualità Acqua Target:**
- pH: 6.8-7.2
- Ammoniaca: < 0.5 mg/L
- Nitriti: < 0.5 mg/L
- Nitrati: 20-80 mg/L
- Temperatura: Range specifico per specie pesci
- Ossigeno disciolto: mg/L

**Ciclo Acqua:**
- Portata pompa (L/min)
- Frequenza cicli

**Manutenzione:**
- Frequenza test acqua (giorni)
- Frequenza alimentazione pesci (volte/giorno)
- Quantità mangime per pasto

### Monitoraggio

Il sistema genera automaticamente suggerimenti per:
- Test qualità acqua programmati
- Alimentazione pesci
- Manutenzione filtri
- Alert critici per salute pesci (ammoniaca/nitriti alti)
- Controllo ciclo azoto

### Alert Critici

Il sistema monitora automaticamente:
- **Ammoniaca critica**: > target * 2 → AZIONE IMMEDIATA
- **Nitriti critici**: > target * 2 → AZIONE IMMEDIATA
- **pH fuori range**: < 6.5 o > 7.5 → AZIONE IMMEDIATA

---

## Sistemi Aeroponici

### Configurazione

**Tipo Sistema:**
- Alta Pressione (High Pressure)
- Bassa Pressione (Low Pressure)
- Ultrasonico

**Nebulizzazione:**
- Numero ugelli
- Portata per ugello (L/h)
- Frequenza nebulizzazione (volte/giorno)
- Durata ciclo (secondi)
- Intervallo tra cicli (minuti)
- Pressione (PSI, solo per High Pressure)

**Soluzione Nutritiva:**
- Capacità serbatoio (L)
- pH target
- EC target

**Camera Radici:**
- Volume camera (L)
- Sistema drenaggio (opzionale)
- Ventilazione (opzionale)

**Manutenzione:**
- Frequenza pulizia ugelli (giorni)
- Frequenza cambio soluzione (giorni)

### Monitoraggio

Il sistema genera automaticamente suggerimenti per:
- Pulizia ugelli programmata
- Controllo nebulizzazione
- Cambio soluzione nutritiva
- Manutenzione camera radici
- Alert se sistema non nebulizza correttamente

### Importante

⚠️ **CRITICO**: Se il sistema non nebulizza per più di 30 minuti, le radici si seccano. Il sistema monitora questo e genera alert urgenti.

---

## Coltivazione Indoor

### Configurazione

**Illuminazione:**
- Tipo: LED, HPS, MH, Fluorescente, Naturale, Ibrido
- Wattaggio totale (W)
- Spettro: Completo, Vegetativo, Fioritura, Personalizzato
- Ore luce/giorno

**Clima:**
- Temperatura: Min, Target, Max (°C)
- Umidità: Min, Target, Max (%)
- Ventilazione:
  - Aspiratore (opzionale)
  - Immissione aria (opzionale)
  - Ventilazione circolazione (opzionale)

**Spazio Coltivabile:**
- Larghezza (cm)
- Lunghezza (cm)
- Altezza (cm)

**Automazione (opzionale):**
- Timer
- Monitoraggio sensori
- Nutrienti automatici
- Controllo pH automatico
- Controllo EC automatico

---

## Accessori Giardino

### Categorie

1. **Supporto**
   - Paletti (Stake)
   - Tutori (Tutor)
   - Spalliere (Trellis)
   - Gabbie (Cage)

2. **Rete**
   - Ombreggiante (Shade)
   - Antigrandine (Hail)
   - Antinsetto (Insect)
   - Raccolta (Harvest)

3. **Filo**
   - Acciaio (Steel)
   - Plastica (Plastic)

4. **Struttura**
   - Strutture complesse

### Gestione

Gli accessori possono essere:
- Aggiunti manualmente tramite `AccessoriesManager`
- Suggeriti automaticamente dal sistema in base alle piante
- Associati a piante specifiche
- Tracciati per manutenzione e sostituzione

### Suggerimenti Automatici

Il sistema suggerisce automaticamente accessori necessari per:
- Piante che necessitano supporto
- Piante rampicanti
- Piante alte (> 1 metro)
- Piante sensibili a parassiti (reti antinsetto)
- Piante da frutto (reti raccolta)

### Manutenzione

Il sistema genera automaticamente suggerimenti per:
- Manutenzione annuale (reti e strutture)
- Sostituzione accessori scaduti
- Alert per accessori marcati per sostituzione

---

## Monitoraggio Parametri

### Letture Idroponiche

**Parametri Registrabili:**
- pH
- EC (mS/cm)
- Temperatura acqua (°C)
- Volume serbatoio (L)
- Note

**Widget Dashboard:**
Mostra ultima lettura con:
- pH attuale vs target (con indicatore visivo)
- EC attuale vs target
- Volume soluzione residua (%)
- Alert se parametri fuori range

### Letture Acquaponiche

**Parametri Registrabili:**
- pH
- Ammoniaca (mg/L)
- Nitriti (mg/L)
- Nitrati (mg/L)
- Temperatura acqua (°C)
- Ossigeno disciolto (mg/L)
- Note

**Widget Dashboard:**
Mostra ultima lettura con:
- Tutti i parametri con indicatori di stato
- Alert critici per salute pesci
- Indicatori visivi per valori fuori range

---

## Suggerimenti Automatici

### Director Integration

Il `director.ts` (orchestrator) integra automaticamente tutti gli engine per sistemi avanzati:

1. **Hydroponic Engine**: Genera task per controlli pH/EC, cambio soluzione, pulizia
2. **Aquaponic Engine**: Genera task per test acqua, alimentazione pesci, manutenzione filtri
3. **Aeroponic Engine**: Genera task per pulizia ugelli, controllo nebulizzazione
4. **Accessories Engine**: Genera task per manutenzione e sostituzione accessori

### Priorità Task

- **Critical**: Parametri fuori range critico, sistema non funzionante
- **High**: Manutenzione urgente, parametri fuori range moderato
- **Medium**: Manutenzione programmata, controlli di routine
- **Low**: Controlli preventivi, suggerimenti generali

### Alert Urgenti

Il sistema genera alert urgenti per:
- pH/EC idroponica fuori range critico
- Ammoniaca/nitriti acquaponica critici per pesci
- Sistema aeroponico non nebulizza correttamente
- Volume soluzione idroponica molto basso
- Accessori da sostituire immediatamente

---

## Integrazione UI

### Dashboard

I widget vengono mostrati automaticamente nella dashboard principale quando:
- Giardino ha configurazione idroponica → `HydroponicMonitorWidget`
- Giardino ha configurazione acquaponica → `AquaponicMonitorWidget`
- Giardino ha configurazione aeroponica → `AeroponicMonitorWidget`
- Giardino ha accessori → `AccessoriesWidget`

### Planner

Quando si aggiunge una pianta a un giardino idroponico:
- Il sistema suggerisce automaticamente il sistema idroponico appropriato
- Permette selezione canale/secchio specifico (se multipli)
- Mostra suggerimenti specifici per idroponica

### Visual Planner

Il Visual Planner può visualizzare:
- Serre/tunnel come aree separate
- Accessori posizionati (paletti, reti, spalliere)
- Sistemi idroponici (serbatoi, canali NFT, secchi DWC)

---

## Feature Pro

Tutti i sistemi avanzati (serre, idroponica, acquaponica, aeroponica, accessori) sono disponibili solo per utenti **Pro**.

Gli utenti **Free** possono:
- Creare giardini tradizionali (OpenField, RaisedBed)
- Vedere suggerimenti per accessori base
- Utilizzare tutte le altre funzionalità standard

---

## Best Practices

### Idroponica

1. Controlla pH/EC ogni 2-3 giorni
2. Cambia soluzione completamente ogni 14 giorni
3. Mantieni volume serbatoio > 50%
4. Pulisci sistema mensilmente
5. Monitora radici per segni di malattia

### Acquaponica

1. Testa qualità acqua ogni 3 giorni
2. Alimenta pesci 2 volte al giorno
3. Monitora ammoniaca/nitriti giornalmente durante maturazione
4. Mantieni filtro biologico attivo
5. Non sovralimentare pesci

### Aeroponica

1. Pulisci ugelli ogni 7 giorni
2. Verifica nebulizzazione giornalmente
3. Cambia soluzione ogni 14 giorni
4. Mantieni camera radici pulita e ventilata
5. Testa sistema prima di lasciarlo incustodito

### Accessori

1. Registra data installazione
2. Imposta durata prevista
3. Controlla annualmente per usura
4. Sostituisci reti danneggiate immediatamente
5. Pulisci fili e strutture regolarmente

---

## Troubleshooting

### Parametri Fuori Range

**pH Idroponica:**
- Troppo alto (> 7): Aggiungi pH Down
- Troppo basso (< 5): Aggiungi pH Up
- Controlla che pompa funzioni correttamente

**EC Idroponica:**
- Troppo alta: Diluisci con acqua
- Troppo bassa: Aggiungi nutrienti

**Ammoniaca Acquaponica:**
- Alta: Cambio parziale acqua (20-30%)
- Aggiungi batteri benefici
- Riduci alimentazione pesci temporaneamente

**Sistema Aeroponico Non Nebulizza:**
- Controlla pressione (se High Pressure)
- Pulisci ugelli immediatamente
- Verifica che pompa funzioni
- Controlla perdite nel sistema

---

## Note Tecniche

### Storage

Tutti i dati vengono salvati in:
- **LocalStorage**: Per utenti locali
- **Supabase**: Per utenti cloud (Pro)

### Database Schema

Le nuove tabelle e colonne sono state aggiunte a `database/schema.sql`:
- `gardens.garden_type`
- `gardens.greenhouse_config` (JSONB)
- `gardens.hydroponic_config` (JSONB)
- `gardens.aquaponic_config` (JSONB)
- `gardens.aeroponic_config` (JSONB)
- `gardens.indoor_config` (JSONB)
- `garden_accessories` (tabella)
- `hydroponic_readings` (tabella)
- `aquaponic_readings` (tabella)
- `garden_tasks.hydroponic_data` (JSONB)
- `garden_tasks.aquaponic_data` (JSONB)
- `garden_tasks.aeroponic_data` (JSONB)

### Types

Tutti i nuovi types sono definiti in:
- `types/indoorGrowing.ts`
- `types/greenhouse.ts`
- `types/accessories.ts`
- `types.ts` (esteso)

---

## Supporto

Per domande o problemi con i sistemi avanzati, consulta:
- La documentazione inline nei componenti
- I tooltip informativi nei form
- I suggerimenti automatici del director







