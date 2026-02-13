# Analisi Approfondita e Implementazione Tipi di Orto Specializzati

## Metadata
- **Feature**: Analisi e Implementazione Completa Tipi Orto (Idroponica, Fragole, Colture Specializzate)
- **Priority**: HIGH
- **Type**: Analysis + Implementation
- **Created**: 2026-02-13
- **Status**: Requirements Phase

---

## 1. OBIETTIVO

Analizzare in profondità l'intero ciclo di vita delle coltivazioni specializzate (idroponica, acquaponica, aeroponica, fragole) e implementare le funzionalità mancanti per renderle completamente accessibili e utilizzabili dagli utenti.

---

## 2. CONTESTO

### Situazione Attuale

L'applicazione ha un'architettura tecnica **eccellente** per gestire coltivazioni specializzate, ma presenta un **grave gap di accessibilità**:

#### ✅ Implementato a Livello Tecnico
- **Idroponica**: 6 tipi di sistemi (NFT, DWC, Ebb&Flow, Drip, Wick, Kratky)
- **Acquaponica**: 4 tipi di sistemi (MediaBed, NFT, DWC, Hybrid)
- **Aeroponica**: 3 tipi di sistemi (LowPressure, HighPressure, Ultrasonic)
- **Fragole**: 14 varietà con master sheets dettagliati
- Database completo con tabelle dedicate
- Componenti form esistenti
- Servizi di storage implementati

#### ❌ NON Accessibile da UI
- Nessuna opzione per creare orti idroponici nel wizard
- Fragole non visibili nei menu di selezione piante
- Nessun flusso guidato per configurazione sistemi specializzati
- Mancanza di dashboard dedicati per monitoraggio

### Domande Chiave da Rispondere

1. **Creazione**: Come vengono creati questi tipi di orto? Dove manca l'integrazione UI?
2. **Gestione**: Come vengono gestiti quotidianamente? Quali operazioni sono disponibili?
3. **Monitoraggio**: Come vengono monitorati i parametri? Quali dati vengono raccolti?
4. **Registrazione Dati**: Come l'utente registra letture, raccolti, operazioni?
5. **Analisi Predittiva**: Esistono algoritmi predittivi? Come vengono utilizzati i dati storici?
6. **Suggerimenti Proattivi**: Il Director/Orchestrator fornisce suggerimenti? Come vengono generati?
7. **Riutilizzo Dati**: Come i dati storici influenzano le decisioni future?
8. **Learning System**: Esiste un sistema di apprendimento? Come migliora nel tempo?

---

## 3. USER STORIES

### US-1: Creazione Orto Idroponico
**Come** utente interessato all'idroponica  
**Voglio** creare un orto idroponico tramite wizard guidato  
**Così che** possa configurare il mio sistema NFT/DWC/altro con parametri corretti

**Acceptance Criteria**:
- [ ] AC-1.1: Nel wizard di creazione orto, vedo opzione "Coltivazione Idroponica"
- [ ] AC-1.2: Posso scegliere tra 6 tipi di sistemi idroponici
- [ ] AC-1.3: Per ogni tipo, vedo descrizione, vantaggi, difficoltà
- [ ] AC-1.4: Posso configurare parametri specifici (volume serbatoio, numero piante, ecc.)
- [ ] AC-1.5: Il sistema salva la configurazione nel database
- [ ] AC-1.6: Dopo creazione, vedo dashboard dedicato per monitoraggio

### US-2: Monitoraggio Parametri Idroponici
**Come** utente con orto idroponico  
**Voglio** registrare letture giornaliere (pH, EC, temperatura)  
**Così che** possa monitorare la salute del sistema e ricevere alert

**Acceptance Criteria**:
- [ ] AC-2.1: Vedo sezione "Letture Idroponiche" nel dashboard
- [ ] AC-2.2: Posso inserire pH, EC, temperatura soluzione, volume serbatoio
- [ ] AC-2.3: Vedo storico letture con grafici trend
- [ ] AC-2.4: Ricevo alert se parametri fuori range ottimale
- [ ] AC-2.5: Il sistema suggerisce correzioni (es. "Aggiungi pH Down")
- [ ] AC-2.6: Posso esportare dati per analisi esterna

### US-3: Selezione e Gestione Fragole
**Come** utente che vuole coltivare fragole  
**Voglio** vedere le varietà disponibili e scegliere quella adatta  
**Così che** possa pianificare correttamente la coltivazione

**Acceptance Criteria**:
- [ ] AC-3.1: Nel planner, vedo categoria "Fragole" con 14 varietà
- [ ] AC-3.2: Per ogni varietà, vedo: tipo (June-bearing/Day-neutral/Ever-bearing), finestra raccolta, sistema impianto
- [ ] AC-3.3: Varietà Basilicata (Candonga, Matera) sono evidenziate come Pro Feature
- [ ] AC-3.4: Posso creare task specifici: gestione stoloni, pacciamatura, rinnovo impianto
- [ ] AC-3.5: Ricevo promemoria per operazioni stagionali (es. "Rimuovi stoloni a giugno")
- [ ] AC-3.6: Posso registrare raccolti con dati specifici (dimensione frutti, qualità)

### US-4: Analisi Predittiva e Suggerimenti
**Come** utente esperto  
**Voglio** ricevere suggerimenti basati sui miei dati storici  
**Così che** possa ottimizzare rese e prevenire problemi

**Acceptance Criteria**:
- [ ] AC-4.1: Il Director analizza dati storici (raccolti, parametri, operazioni)
- [ ] AC-4.2: Ricevo suggerimenti proattivi: "Basandoti su raccolti precedenti, aumenta EC di 0.2"
- [ ] AC-4.3: Vedo previsioni resa basate su trend storici
- [ ] AC-4.4: Il sistema identifica pattern: "Le tue fragole rendono meglio con pH 6.2"
- [ ] AC-4.5: Ricevo alert predittivi: "Rischio carenza azoto tra 5 giorni"
- [ ] AC-4.6: Posso vedere "Cosa ho imparato" - insights dal sistema

### US-5: Ciclo Completo Fragole con Learning
**Come** utente che coltiva fragole da 2 anni  
**Voglio** che il sistema impari dalle mie esperienze  
**Così che** ogni anno migliori le raccomandazioni

**Acceptance Criteria**:
- [ ] AC-5.1: Il sistema traccia: date semina, trapianto, prima raccolta, ultima raccolta
- [ ] AC-5.2: Registra: resa totale, qualità media, problemi riscontrati
- [ ] AC-5.3: Confronta anno corrente vs anni precedenti
- [ ] AC-5.4: Suggerisce miglioramenti: "L'anno scorso hai raccolto 2 settimane prima, considera..."
- [ ] AC-5.5: Identifica varietà più performanti per il mio orto
- [ ] AC-5.6: Genera report fine stagione con lessons learned

### US-6: Dashboard Unificato Colture Specializzate
**Come** utente con orto idroponico e fragole  
**Voglio** un dashboard che mostri tutto in un colpo d'occhio  
**Così che** possa gestire efficacemente le mie colture

**Acceptance Criteria**:
- [ ] AC-6.1: Vedo sezione "Colture Specializzate" nel dashboard
- [ ] AC-6.2: Per idroponica: parametri attuali, alert, prossime operazioni
- [ ] AC-6.3: Per fragole: fase corrente, giorni a raccolta, operazioni stagionali
- [ ] AC-6.4: Vedo KPI: resa/m², efficienza nutrienti, qualità raccolti
- [ ] AC-6.5: Posso confrontare performance tra varietà/sistemi
- [ ] AC-6.6: Ricevo "Daily Briefing" personalizzato

---

## 4. ANALISI APPROFONDITA RICHIESTA

### 4.1 Ciclo di Vita Completo

Per ogni tipo di coltivazione (Idroponica, Acquaponica, Aeroponica, Fragole), analizzare:

#### A. Fase Creazione
- [ ] Dove inizia il flusso? (Wizard, menu, altro?)
- [ ] Quali dati vengono raccolti?
- [ ] Come vengono validati?
- [ ] Dove vengono salvati? (Tabelle, campi JSONB)
- [ ] Quali configurazioni sono obbligatorie vs opzionali?

#### B. Fase Gestione Quotidiana
- [ ] Quali operazioni può fare l'utente?
- [ ] Dove sono i form/UI per queste operazioni?
- [ ] Come vengono registrate nel database?
- [ ] Esistono workflow guidati?
- [ ] Ci sono checklist o promemoria?

#### C. Fase Monitoraggio
- [ ] Quali parametri vengono monitorati?
- [ ] Come l'utente inserisce i dati?
- [ ] Dove vengono visualizzati? (Dashboard, grafici, tabelle)
- [ ] Esistono alert automatici?
- [ ] Come vengono calcolati i range ottimali?

#### D. Fase Registrazione Dati
- [ ] Quali tipi di dati vengono registrati? (Letture, raccolti, operazioni, foto)
- [ ] Quali form/UI esistono?
- [ ] Come vengono strutturati nel database?
- [ ] Esistono validazioni?
- [ ] Come vengono associati a task/piante?

#### E. Fase Analisi Predittiva
- [ ] Esistono algoritmi predittivi?
- [ ] Quali dati storici utilizzano?
- [ ] Come vengono generati i suggerimenti?
- [ ] Dove sono implementati? (Services, logic)
- [ ] Come vengono presentati all'utente?

#### F. Fase Suggerimenti Proattivi
- [ ] Il Director/Orchestrator gestisce questi tipi?
- [ ] Come vengono generati i suggerimenti?
- [ ] Quando vengono mostrati? (Daily briefing, alert, notifiche)
- [ ] L'utente può accettare/rifiutare?
- [ ] Come vengono tracciati i feedback?

#### G. Fase Riutilizzo Dati
- [ ] Come i dati storici influenzano decisioni future?
- [ ] Esistono sistemi di learning?
- [ ] Come vengono identificati pattern?
- [ ] Dove sono implementati gli algoritmi?
- [ ] Come migliorano nel tempo?

### 4.2 Mappatura Componenti Esistenti

Per ogni funzionalità, identificare:
- [ ] Componenti UI esistenti
- [ ] Servizi backend esistenti
- [ ] Tabelle database utilizzate
- [ ] Algoritmi/logic implementati
- [ ] Gap di implementazione

### 4.3 Analisi Gap

Identificare per ogni fase:
- [ ] Cosa è implementato ma non accessibile
- [ ] Cosa è parzialmente implementato
- [ ] Cosa manca completamente
- [ ] Priorità di implementazione

---

## 5. DELIVERABLES ATTESI

### 5.1 Documento di Analisi Completo
File: `ANALISI_COMPLETA_CICLO_VITA_COLTURE_SPECIALIZZATE.md`

Contenuto:
1. **Executive Summary**: Panoramica stato attuale
2. **Analisi per Tipo di Coltivazione**:
   - Idroponica (6 sistemi)
   - Acquaponica (4 sistemi)
   - Aeroponica (3 sistemi)
   - Fragole (14 varietà)
3. **Mappatura Ciclo di Vita**: Per ogni fase (A-G sopra)
4. **Inventario Componenti**: Cosa esiste, dove, come funziona
5. **Analisi Gap**: Cosa manca, priorità
6. **Flussi Utente**: Diagrammi e descrizioni
7. **Architettura Dati**: Come i dati fluiscono nel sistema
8. **Algoritmi Predittivi**: Quali esistono, come funzionano
9. **Sistema Learning**: Come il sistema impara e migliora

### 5.2 Piano di Implementazione
File: `PIANO_IMPLEMENTAZIONE_COLTURE_SPECIALIZZATE.md`

Contenuto:
1. **Roadmap a Fasi**:
   - Fase 1: Quick Wins (1-2 settimane)
   - Fase 2: Core Features (3-4 settimane)
   - Fase 3: Advanced Features (5-8 settimane)
   - Fase 4: AI & Learning (9-12 settimane)

2. **Per Ogni Fase**:
   - Obiettivi specifici
   - User stories da implementare
   - Componenti da creare/modificare
   - Servizi da implementare
   - Database changes
   - Testing requirements
   - Effort estimate

3. **Prioritizzazione**:
   - Must Have (MVP)
   - Should Have (V1)
   - Could Have (V2)
   - Won't Have (Future)

4. **Dipendenze e Rischi**:
   - Dipendenze tecniche
   - Rischi identificati
   - Mitigazioni proposte

### 5.3 Specifiche Tecniche Dettagliate
File: `SPECIFICHE_TECNICHE_COLTURE_SPECIALIZZATE.md`

Contenuto:
1. **Database Schema Changes**:
   - Nuove tabelle
   - Modifiche a tabelle esistenti
   - Indici da creare
   - Migrazioni SQL

2. **API/Services**:
   - Nuovi servizi da creare
   - Modifiche a servizi esistenti
   - Interfacce TypeScript
   - Validazioni

3. **Componenti UI**:
   - Nuovi componenti da creare
   - Modifiche a componenti esistenti
   - Wireframes/mockups
   - Flussi di navigazione

4. **Algoritmi e Logic**:
   - Algoritmi predittivi da implementare
   - Regole business
   - Calcoli e formule
   - Machine learning models (se applicabile)

---

## 6. CRITERI DI SUCCESSO

### Analisi Completa
- [ ] Ogni fase del ciclo di vita è documentata
- [ ] Ogni componente esistente è mappato
- [ ] Ogni gap è identificato e prioritizzato
- [ ] Flussi utente sono chiari e completi

### Piano di Implementazione
- [ ] Roadmap è realistica e dettagliata
- [ ] Effort estimates sono accurati
- [ ] Dipendenze sono identificate
- [ ] Rischi sono mitigati

### Specifiche Tecniche
- [ ] Database schema è completo e validato
- [ ] API/Services sono ben definiti
- [ ] Componenti UI hanno wireframes
- [ ] Algoritmi sono specificati con formule

---

## 7. OUT OF SCOPE (Per Questa Fase)

- Implementazione effettiva del codice (verrà dopo l'analisi)
- Testing e QA (verrà dopo implementazione)
- Documentazione utente finale (verrà dopo testing)
- Deployment e release (verrà dopo QA)

---

## 8. STAKEHOLDERS

- **Product Owner**: Definisce priorità business
- **Tech Lead**: Valida fattibilità tecnica
- **UX Designer**: Valida flussi utente
- **Data Scientist**: Valida algoritmi predittivi (se applicabile)

---

## 9. TIMELINE PROPOSTA

### Fase Analisi (Questa Spec)
- **Settimana 1**: Analisi ciclo di vita e mappatura componenti
- **Settimana 2**: Identificazione gap e creazione piano implementazione
- **Settimana 3**: Specifiche tecniche dettagliate e review

### Fase Implementazione (Spec Successive)
- Da definire dopo completamento analisi

---

## 10. DOMANDE APERTE

1. Esistono già dashboard o sezioni dedicate a colture specializzate che non abbiamo trovato?
2. Il Director/Orchestrator ha già logica per gestire idroponica/fragole?
3. Esistono algoritmi predittivi già implementati ma non utilizzati?
4. Ci sono limitazioni tecniche che dobbiamo considerare?
5. Quali sono le priorità business? (Idroponica vs Fragole vs altro)
6. Esistono requisiti di compliance per sistemi idroponici professionali?
7. Serve integrazione con hardware IoT per letture automatiche?
8. Quali metriche di successo vogliamo tracciare?

---

## 11. RIFERIMENTI

### Codice Esistente
- `types.ts` - Definizioni tipi
- `types/indoorGrowing.ts` - Tipi idroponica/acquaponica/aeroponica
- `types/strawberry.ts` - Tipi fragole
- `data/strawberryMasterSheets.ts` - Master sheets fragole
- `components/hydroponic/ReadingForm.tsx` - Form letture idroponiche
- `components/StrawberryManagement.tsx` - Gestione fragole
- `packages/storage-*/` - Storage providers
- `logic/director.ts` - Orchestrator centrale
- `services/` - Vari servizi

### Database
- `database_schema_only_20251218_083258.sql` - Schema completo
- Tabelle: `gardens`, `garden_tasks`, `harvest_logs`, `hydroponic_readings`, `aquaponic_readings`

### Documentazione
- `ANALISI_TIPI_ORTO_IMPLEMENTAZIONE.md` - Analisi iniziale
- `docs/manual/34-director-orchestrator.md` - Manuale Director
- Vari file `*_COMPLETE.md` - Documentazione features

---

## 12. NEXT STEPS

1. **Review Requirements**: Validare con stakeholders
2. **Start Analysis**: Iniziare analisi approfondita ciclo di vita
3. **Create Design Doc**: Creare documento di design dettagliato
4. **Create Tasks**: Creare task list per implementazione
5. **Estimate Effort**: Stimare effort per ogni task
6. **Get Approval**: Ottenere approvazione per procedere

---

## NOTES

- Questa è una spec di analisi, non di implementazione
- L'obiettivo è capire a fondo prima di implementare
- Focus su qualità dell'analisi, non velocità
- Documentare tutto per riferimento futuro
