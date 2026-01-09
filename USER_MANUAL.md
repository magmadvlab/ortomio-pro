# 📖 Manuale Utente OrtoMio

## Indice

1. [Introduzione](#introduzione)
2. [Primi Passi](#primi-passi)
3. [Dashboard (Home)](#dashboard-home)
4. [Planner (Semina)](#planner-semina)
   - [Matching Geografico e Fattibilità](#matching-geografico-e-fattibilità)
5. [Journal (Diario)](#journal-diario)
6. [Advice (Cura)](#advice-cura)
7. [Harvest (Raccolto)](#harvest-raccolto)
8. [Calendario Intelligente](#calendario-intelligente)
9. [Lavorazioni Meccaniche (Terreni Grandi)](#lavorazioni-meccaniche-terreni-grandi)
10. [Potatura Alberi](#potatura-alberi)
11. [Smart Hub](#smart-hub)
12. [Gestione Fertilizzanti](#gestione-fertilizzanti)
13. [Lavorazioni Terra](#lavorazioni-terra)
14. [Gestione Fitofarmaci](#gestione-fitofarmaci)
15. [Funzionalità Avanzate](#funzionalità-avanzate)
16. [FAQ](#faq)

---

## Introduzione

Benvenuto in **OrtoMio**! Questo manuale ti guiderà attraverso tutte le funzionalità dell'applicazione per aiutarti a gestire il tuo orto in modo efficace.

### Cosa Puoi Fare con OrtoMio

- Ricevere suggerimenti personalizzati basati sulla tua posizione
- Calcolare automaticamente la fattibilità di piante esotiche per la tua zona climatica
- Selezionare varietà ottimali e sistemi di coltivazione consigliati
- Pianificare semine e trapianti con guide passo-passo
- Monitorare la crescita delle piante con foto e analisi AI
- Ottenere consigli per trattamenti e cure
- Tracciare i raccolti e calcolare il valore generato
- Gestire l'irrigazione con sensori intelligenti
- Pianificare lavori invernali e preparazioni stagionali

---

## Primi Passi

### 1. Configurazione Iniziale

Al primo avvio, OrtoMio ti chiederà di:

1. **Impostare il tuo orto**:
   - Nome dell'orto
   - Dimensioni (metri quadri, are, o ettari - per terreni più grandi)
   - Tipo di terreno (Argilloso, Sabbioso, Limoso, etc.)
   - pH del terreno (opzionale)
   - Posizione GPS (consigliato per suggerimenti personalizzati)
   - Altitudine (calcolata automaticamente dalle coordinate, ma puoi correggerla manualmente)
   - Esposizione solare e orientamento

   **Foto Panoramica 360° (Opzionale ma Consigliata)**:
   - Per calcolare con precisione l'incidenza della luce solare e del sole sull'orto,
     puoi caricare una foto panoramica 360° durante la configurazione
   - La foto 360° permette di analizzare l'esposizione solare da TUTTE le direzioni
     (Nord, Sud, Est, Ovest) simultaneamente
   - Identifica automaticamente ostacoli (edifici, alberi, montagne) che possono
     ombreggiare l'orto in momenti specifici della giornata
   - Calcola le ore di sole per ogni direzione cardinale, non solo un momento
     (come la foto mezzogiorno)
   - Popola automaticamente i campi esposizione solare e orientamento con dati precisi
   - Migliora la precisione dei suggerimenti dell'app basati sull'esposizione reale

   **Calcolo Preciso Giorno-per-Giorno**:
   - OrtoMio calcola l'esposizione solare per ogni giorno dell'anno considerando:
     - La posizione del sole nel cielo (che cambia durante l'anno)
     - Gli ostacoli 3D configurati (palazzi, alberi) con altezza e distanza
     - La direzione degli ostacoli rispetto al punto dell'orto
   - Il sistema verifica ogni 10 minuti se il sole è bloccato da un ostacolo
   - Puoi vedere le ore di sole per qualsiasi data specifica
   - Il grafico mensile mostra l'andamento durante tutto l'anno

   **Gestione Ostacoli**:
   - Puoi aggiungere ostacoli manualmente specificando:
     - Direzione (Nord, Sud, Est, Ovest o azimut personalizzato)
     - Altezza in metri
     - Distanza orizzontale in metri
     - Larghezza angolare (quanto copre l'ostacolo)
     - Tipo (Edificio, Albero, Montagna, Altro)
   - Oppure carica una foto 360° per estrazione automatica
   - Gli ostacoli vengono salvati e usati per tutti i calcoli futuri

   **Periodo Ottimale**:
   - Il sistema identifica automaticamente il periodo migliore dell'anno per coltivare
   - Mostra i mesi consecutivi con almeno 6 ore di sole diretto
   - Fornisce suggerimenti su quali colture piantare in base all'esposizione disponibile

2. **Permessi richiesti**:
   - **Geolocalizzazione**: per suggerimenti basati sulla tua zona
   - **Fotocamera**: per scattare foto delle piante e analisi AI

### 2. Navigazione

L'app è organizzata in 6 sezioni principali accessibili dalla barra di navigazione in basso:

- 🏠 **Home** - Dashboard principale
- 🌱 **Semina** - Pianificazione e suggerimenti
- 📔 **Diario** - Attività e monitoraggio
- 🛡️ **Cura** - Diagnosi e trattamenti
- 🧺 **Raccolto** - Registrazione e statistiche
- 📡 **Smart** - Sensori e irrigazione

---

## Dashboard (Home)

La Dashboard è la schermata principale che ti offre una panoramica completa del tuo orto.

### Widget Meteo

Il widget meteo mostra:

- **Temperatura attuale** e condizioni
- **Previsioni** per i prossimi giorni
- **Allarmi critici**:
  - ⚠️ **Gelate** (temperature < 0°C)
  - 🌡️ **Caldo estremo** (temperature > 35°C)
  - 🌧️ **Piogge intense** (> 20mm)

### Lavori Preparatori Invernali

Durante i mesi di preparazione (Nov-Feb per orto estivo, Giu-Ago per orto invernale), la Dashboard mostra automaticamente un piano strutturato di lavori:

- **Categorie**:
  - 🪨 **Suolo**: Pulizia, lavorazioni, preparazione
  - 📦 **Concimazione**: Concimazione di fondo, compost
  - 🔧 **Struttura**: Preparazione tutori, sistemi irrigazione
  - 📅 **Pianificazione**: Semine indoor, acquisto semi

Ogni lavoro include:

- Descrizione dettagliata
- Materiali necessari con quantità
- Istruzioni passo-passo
- Tempo stimato
- Priorità (Critical, High, Medium, Low)

**Come usare**: Clicca "Aggiungi al Diario" per salvare il lavoro come attività da completare.

### Fabbisogno Idrico Giornaliero

La sezione mostra:

- **Totale litri/giorno** per tutto l'orto
- **Breakdown per pianta** con quantità specifica
- Calcolo basato su:
  - Fase di crescita (germinazione, vegetativa, produzione)
  - Tipo di pianta
  - Condizioni meteo

### Photo Reminders

Il sistema ti ricorda automaticamente di scattare foto ogni 15 giorni per tracciare i progressi delle piante. Le foto vengono salvate nella timeline del Diario.

### Modalità Vacanza

Se hai programmato una vacanza, la Dashboard mostra:

- **Giorni rimanenti** prima della partenza
- **Piano di sopravvivenza** con task da completare
- **Categorie**: Raccolti, Irrigazione, Protezione, Suolo

Clicca su "Modalità Vacanza" per configurare le date e generare il piano automatico.

### Piano del Giorno (Director)

Il **Piano del Giorno** è generato automaticamente dall'orchestratore centrale (Director) e combina tutti i sistemi di calcolo per ottimizzare le attività dell'orto.

#### Tipo Terreno e Altitudine

Il sistema considera il tipo di terreno e l'altitudine per ottimizzare i suggerimenti:

**Tipo Terreno**:

- **Terreni scuri** (Argilloso, Torboso): Si scaldano prima → anticipo di 3-7 giorni per semina/trapianto
- **Terreni chiari** (Sabbioso, Calcareo): Si scaldano dopo → ritardo di 3-7 giorni
- **Terreni medi** (Franco, Limoso): Nessun aggiustamento

**Compatibilità Piante**:

- Alcune piante hanno preferenze forti per terreni specifici
- Esempio: Carote preferiscono terreni sabbiosi, Pomodori preferiscono argillosi
- Il sistema ti avvisa se una pianta non è ottimale per il tuo terreno e suggerisce alternative

**Altitudine**:

- Ogni 100m di altitudine → ritardo di ~5 giorni per impianto
- Piante precoci (lattughe, ravanelli): ritardo ridotto del 50%
- Piante tardive (pomodori, peperoni): ritardo aumentato del 20%
- Temperatura effettiva: -0.6°C ogni 100m di altitudine

**Come Viene Utilizzato**:

- Le finestre di impianto vengono automaticamente aggiustate per terreno e altitudine
- I suggerimenti piante vengono filtrati per compatibilità terreno
- Le date nel piano annuale vengono aggiustate automaticamente
- Il sistema verifica se il terreno è pronto (temperatura suolo) prima di suggerire trapianti

#### Classificazione Solare Stagionale

Il Director analizza l'esposizione solare del tuo orto e lo classifica in base a 4 finestre stagionali:

- **Feb-Mar** (Avvio primaverile): Ore di sole per l'inizio della stagione
- **Apr-Mag** (Crescita vegetativa): Ore di sole durante la crescita
- **Giu-Lug** (Massimo solare): Ore di sole nel periodo estivo
- **Ago-Set** (Maturazione + stress): Ore di sole durante maturazione

**Tipi di Orto**:

- **Orto Estivo**: ≥6 ore di sole continuo in Giu-Lug (ideale per pomodori, peperoni, melanzane)
- **Orto Primaverile/Autunnale**: <6h sole Giu-Lug ma ≥3-4h Mar-Apr (ideale per insalate, spinaci, piselli)
- **Orto Misto**: Caratteristiche intermedie

**Alert di Compatibilità**:

- Se una pianta esistente non è ottimale per il tipo di orto, vedrai un alert con suggerimenti di alternative
- Gli alert sono informativi (non bloccano operazioni) ma aiutano a ottimizzare la resa

**Suggerimenti Piante Ottimizzati**:

- Il Director suggerisce piante specifiche per il tuo tipo di orto
- Mostra finestre di impianto ottimali considerando seme vs piantina
- Ordina i suggerimenti per percentuale di adattamento al tuo orto

### Impostazioni Orto

Clicca l'icona ⚙️ in alto a destra per:

- Modificare nome e dimensioni
- Aggiornare tipo terreno e pH
- Impostare/modificare posizione GPS
- Configurare esposizione solare e orientamento
- Gestire più orti (crea, elimina, passa da uno all'altro)

---

## Planner (Semina)

La sezione Planner ti aiuta a pianificare e organizzare le semine e i trapianti.

### Suggerimenti Stagionali

All'apertura, OrtoMio mostra automaticamente:

- **Piante consigliate** per la stagione corrente
- Basate su: posizione GPS, mese corrente, clima locale
- Ogni suggerimento include:
  - Nome pianta e varietà
  - Periodo di semina/trapianto
  - Metodo consigliato (Dal Seme / Dalla Piantina)
  - Calendario colturale (semina, trapianto, raccolta)

**Come usare**: Clicca su una pianta per vedere i dettagli completi.

### Ricerca Pianta Specifica

Usa la barra di ricerca per trovare una pianta specifica:

1. Digita il nome (es. "Pomodoro", "Zucchina")
2. Clicca "Cerca"
3. Visualizza informazioni dettagliate:
   - Guida completa "For Dummies"
   - Consociazioni consigliate
   - Distanze ottimali
   - Fabbisogno idrico specifico

### Guide "For Dummies"

Quando selezioni una pianta, ottieni guide complete:

#### Guida Semina Passo-Passo

- **Preparazione terreno** (4 passi)
- **Semina** (4 passi)
- **Cura post-semina** (4 passi)
- **Troubleshooting** (4 problemi comuni)

#### Guida Trapianto

- **Preparazione piantina** (4 passi)
- **Preparazione terreno** (4 passi)
- **Trapianto** (4 passi)
- **Cura post-trapianto** (4 passi)

#### Guida Raccolta

- **Quando raccogliere** (segni di maturazione)
- **Come raccogliere** (metodo corretto)
- **Conservazione** (come mantenere fresco)

### Matching Geografico e Fattibilità

OrtoMio calcola automaticamente la fattibilità di ogni pianta per la tua zona geografica, specialmente per frutti esotici e piante con esigenze climatiche specifiche.

#### Come Funziona

Quando cerchi una pianta nel Planner, il sistema:

1. **Rileva la tua posizione** usando il GPS del dispositivo
2. **Calcola la zona climatica USDA** basata su temperature minime invernali
3. **Valuta fattibilità** considerando:
   - Zona USDA
   - Altitudine
   - Distanza dal mare
   - Temperature medie ed estreme

#### Score di Fattibilità

Ogni pianta riceve un **score da 0 a 100**:

- **80-100 (Ideale)**: ✅ Perfettamente adatta alla tua zona, nessuna protezione speciale necessaria
- **50-79 (Possibile)**: ⚠️ Può crescere con alcune accortezze o protezioni temporanee
- **20-49 (Difficile)**: 🔶 Richiede protezioni significative o sistemi controllati (serra)
- **0-19 (Sconsigliato)**: ❌ Clima non adatto, considera alternative o sistemi completamente controllati

#### Selezione Varietà

Per piante esotiche, OrtoMio suggerisce automaticamente la **varietà più adatta** alla tua zona:

- **Resistenza al freddo**: Varietà più rustiche per zone fresche
- **Adattabilità al vaso**: Varietà nane per coltivazione in contenitore
- **Zone USDA ideali**: Ogni varietà ha zone climatiche preferite

#### Sistemi di Coltivazione Consigliati

Il sistema suggerisce automaticamente il metodo migliore:

- **🌱 Piena Terra**: Per zone climatiche ideali, con o senza protezioni temporanee
- **🪴 Vaso**: Per zone borderline, spostabile indoor in inverno
- **🏠 Serra**: Per zone con clima non ideale (fredda, temperata o tropicale)

#### Filtri Categoria Visual

Nel Planner puoi filtrare le piante per categoria:

- **🥬 Orto**: Ortaggi tradizionali
- **🍎 Frutteto**: Alberi da frutto
- **🌴 Esotici**: Frutti tropicali e subtropicali
- **🌿 Aromatiche**: Erbe aromatiche e officinali

Questi filtri ti aiutano a trovare rapidamente il tipo di pianta che stai cercando.

#### Widget Dashboard

Nella Dashboard principale trovi il widget **"Matching Geografico"** che mostra:

- **Piante Ideali**: Frutti esotici perfettamente adatti alla tua zona (score 80+)
- **Nuove Opportunità**: Piante possibili con qualche accortezza (score 50-79)
- **Attenzione Clima**: Piante difficili o sconsigliate per la tua zona (score <50)

Clicca su "Vedi tutte" per esplorare tutte le piante disponibili nel Planner.

### Distinzione Dal Seme / Dalla Piantina

OrtoMio distingue tra:

- **Dal Seme**: semina diretta in campo
- **Dalla Piantina**: trapianto di piantine già cresciute

Seleziona il metodo per vedere la guida specifica. Le guide si adattano automaticamente.

### Consociazioni Consigliate

Per ogni pianta, OrtoMio mostra:

- ✅ **Piante benefiche**: da piantare vicine
- ❌ **Piante da evitare**: incompatibili
- Motivo della compatibilità/incompatibilità

**Esempio**: Pomodoro beneficia di Basilico (allontana insetti), ma va evitato vicino a Patate (stessa famiglia, malattie comuni).

### Visual Garden Planner

Clicca "Apri Planner Visivo" per:

- **Progettare graficamente** l'orto
- **Posizionare piante** con drag & drop
- **Verificare distanze** e collisioni
- **Suggerimenti rotazione** (evita stessa famiglia nello stesso punto)
- **Calcolo spazio** utilizzato e disponibile

### Integrazione Calendario Lunare

Nel Planner, OrtoMio integra il calendario lunare tradizionale:

- **Fase lunare corrente** visualizzata
- **Suggerimenti** per semine in fase crescente/calante
- **Indicazioni** per trapianti e raccolte

### Banca Semi

Accedi alla Banca Semi dalla Dashboard per:

- **Aggiungere semi** all'inventario
- **Tracciare quantità** e varietà
- **Gestire scadenze** con alert automatici
- **Cercare semi** per pianta

### Aggiungere al Diario

Dopo aver selezionato una pianta e configurato:

- Quantità piante
- Tipo posizione (Vaso, Aiuola, Campo)
- Metodo (Dal Seme / Dalla Piantina)
- Data semina/trapianto
- Eventuali note

Clicca "Aggiungi al Diario" per salvare l'attività.

---

## Journal (Diario)

Il Diario è il centro di monitoraggio delle tue attività e piante.

### Vista Attività

Il Diario mostra tutte le attività organizzate per:

- **Stato**: Attive / Completate
- **Stagione**: Estivo / Invernale
- **Tipo**: Semina, Trapianto, Raccolto, Trattamento, Altro

### Aggiungere Attività Manuale

1. Clicca "Aggiungi Attività"
2. Compila:
   - Nome pianta
   - Varietà
   - Tipo attività
   - Data
   - Note opzionali
3. Salva

### Timeline Foto

Per ogni attività attiva, puoi:

- **Scattare foto** per tracciare i progressi
- **Visualizzare timeline** con date e giorni dalla semina
- **Analisi AI** delle foto per:
  - Diagnosi problemi (malattie, carenze)
  - Verifica maturazione (Brix)
  - Stato generale della pianta

**Photo Reminders**: Il sistema ti ricorda automaticamente ogni 15 giorni di scattare una foto.

### Lifecycle Coach

Per ogni pianta attiva, OrtoMio monitora automaticamente:

#### Fasi di Crescita

- **Sowing** (Semina)
- **Germination** (Germinazione)
- **Nursing** (Cura semenzale)
- **Hardening** (Indurimento)
- **Transplanting** (Trapianto)
- **Production** (Produzione)

#### Consigli Automatici

Il Coach ti chiede domande specifiche:

- "Hai visto i primi germogli?" → Se sì, passa a fase Nursing
- "Le piantine sono pronte per il trapianto?" → Verifica condizioni meteo
- "Stai vedendo i primi fiori?" → Inizia concimazione potassio

#### Sub-Task Automatici

Quando necessario, il Coach crea automaticamente:

- Task di controllo germinazione
- Task di trapianto
- Task di raccolta

### Nutrient Coach

Calcola automaticamente il fabbisogno NPK basato su:

- **Categoria pianta** (Da foglia, Da frutto, Da radice, Legume)
- **Fase fenologica** (Establishment, Vegetative, Reproductive)
- **Tipo terreno** (Argilloso, Sabbioso, Limoso, etc.)

**Consigli**:

- Quando concimare
- Quale elemento (Azoto, Fosforo, Potassio)
- Dosaggio suggerito
- Note specifiche per il tuo terreno

### Health Coach

Suggerisce trattamenti preventivi basati su:

- **Famiglia botanica** (Solanaceae, Cucurbitaceae, etc.)
- **Stagione** (primavera, estate, autunno, inverno)
- **Età pianta** (giorni dalla semina)

**Prodotti suggeriti**:

- Zeolite Micronizzata (preventivo)
- Olio di Neem (repellente)
- Propoli Agricola (rinforzante)
- Macerato di Ortica (repellente + azoto)

**Auto-scheduling**: Quando completi un trattamento, il sistema crea automaticamente il prossimo trattamento nella data corretta.

### Analisi Brix

Per verificare la maturazione:

1. Inserisci il valore Brix misurato
2. Clicca "Check"
3. Ottieni analisi AI che indica:
   - Se è il momento giusto per raccogliere
   - Qualità del frutto
   - Consigli per migliorare

### Raccolti Parziali

Per tracciare raccolti durante la crescita:

1. Clicca "Raccolto Parziale" su una pianta
2. Inserisci quantità e unità
3. Valuta qualità (1-5 stelle)
4. Aggiungi foto opzionale
5. Salva

I raccolti parziali vengono salvati nella cronologia e contano nelle statistiche.

---

## Advice (Cura)

La sezione Advice ti aiuta a diagnosticare e curare problemi delle piante.

### Gestione Fertilizzanti

OrtoMio ti aiuta a gestire i fertilizzanti in modo intelligente:

**Inventario Fertilizzanti**:

- Aggiungi prodotti fertilizzanti al tuo inventario (organici, minerali, correttivi)
- Traccia quantità disponibili e scadenze
- Ricevi alert quando scorte sono basse o prodotti stanno per scadere
- Calcola costi totali per stagione

**Suggerimenti Automatici**:

- Quando il sistema rileva che una pianta ha bisogno di nutrienti (azoto, fosforo, potassio), suggerisce automaticamente prodotti concreti disponibili
- Dosaggi calcolati in base a:
  - Tipo terreno (argilloso trattiene più, sabbioso perde)
  - Fase pianta (pre-impianto, crescita, fioritura)
  - Area da fertilizzare
- Timing ottimale per applicazione

**Autoproduzione Compost**:

- Traccia produzione compost tradizionale, lombrico, bokashi
- Calcola rapporto C/N materiali per compost ottimale
- Stima data maturazione in base a condizioni
- Istruzioni passo-passo per ogni tipo compost

**Incompatibilità Prodotti**:

- Il sistema avvisa se prodotti sono incompatibili tra loro
- Evita mescolanze che possono causare problemi (es. calce + letame fresco)

### Lavorazioni Terra

**Timing "Terreno in Tempera"**:

- OrtoMio calcola automaticamente quando il terreno è "in tempera" (né troppo bagnato né troppo secco)
- Ricevi alert quando terreno diventa lavorabile dopo pioggia
- Finestra ottimale per lavorazioni: 3-5 giorni dopo pioggia (dipende da tipo terreno)

**Suggerimenti Lavorazioni**:

- Vangatura: Preparazione profonda (30-40cm) per nuova stagione
- Sarchiatura: Lavorazione superficiale (5-10cm) per aerazione e controllo infestanti
- Rincalzatura: Accumulo terreno attorno a base pianta (patate, porri, finocchi)
- Pacciamatura: Copertura con materiale organico per trattenere umidità
- No-dig: Metodo senza lavorazione per terreni già strutturati

**Attrezzi Consigliati**:

- Per aree piccole (< 200 m²): Vanga, zappa manuale
- Per aree medie (200-1000 m²): Motozappa
- Per aree grandi (> 1000 m²): Trattore con aratro/fresatrice

**Problemi Rilevati**:

- Compattazione: Terreno troppo compatto, suggerisce sarchiatura profonda
- Suola di lavorazione: Stessa profondità ripetuta, suggerisce variazione profondità
- Erosione: Terreno esposto, suggerisce pacciamatura

### Gestione Fitofarmaci

**Inventario Fitofarmaci**:

- Aggiungi prodotti fitofarmaci (bio e convenzionali) al tuo inventario
- Traccia quantità, scadenze, tempi di carenza
- Alert prodotti in scadenza o scorte basse
- Verifica disponibilità prodotti prima di trattamenti pianificati

**Suggerimenti Prodotti**:

- Quando il sistema rileva un problema (peronospora, afidi, etc.), suggerisce prodotti concreti disponibili
- Filtra prodotti in base a:
  - Preferenze utente (bio, convenzionale, misto)
  - Patentino fitosanitario (per prodotti convenzionali)
  - Efficacia contro problema specifico
- Dosaggi calcolati in base a gravità problema

**Timing Critico**:

- Verifica condizioni meteo prima di trattamento:
  - Pioggia prevista: Alert dilavamento
  - Temperatura: Minima/massima per prodotto
  - Vento: Massimo consentito per applicazione
- Conflitto con raccolta:
  - Se raccolta prevista prima di fine periodo carenza, sistema suggerisce:
    1. Tratta ora, ritarda raccolta
    2. Raccogli prima, poi tratta
    3. Usa alternativa senza carenza

**Registro Trattamenti** (Solo PRO_PROFESSIONAL):

- Registra ogni trattamento con:
  - Data e prodotto usato
  - Dosaggio e metodo applicazione
  - Condizioni meteo al momento trattamento
  - Fine periodo carenza
- Visualizza storico trattamenti per pianta o periodo
- Esporta registro in CSV per documentazione
- Alert trattamenti ancora in periodo carenza

**Preparati Naturali (Macerati)**:

- Ricette per macerati, decotti, infusi:
  - Macerato ortica: Azoto + repellente afidi
  - Macerato aglio: Fungicida leggero
  - Decotto equiseto: Silicio, anticrittogamico
  - Infuso tanaceto: Repellente insetti
- Istruzioni preparazione, dosaggio, conservazione
- Traccia produzione macerati fatti in casa

**Incompatibilità Prodotti**:

- Sistema avvisa se prodotti sono incompatibili (es. rame + zolfo)
- Evita mescolanze che possono causare fitotossicità

### Diagnosi Tramite Descrizione

1. **Descrivi il problema**:
   - "Le foglie del pomodoro sono gialle"
   - "Vedo macchie bianche sulle zucchine"
   - "Gli afidi attaccano i fagioli"

2. Clicca "Cerca Consiglio"

3. Ottieni:
   - **Diagnosi** del problema
   - **Causa probabile**
   - **Trattamento consigliato** (bio o tradizionale)
   - **Prodotti specifici** con dosaggi
   - **Prevenzione futura**

### Diagnosi Tramite Foto

1. **Carica una foto** della pianta con il problema
2. Clicca "Analizza Foto"
3. L'AI analizza e fornisce:
   - Diagnosi visiva
   - Gravità del problema
   - Trattamento immediato
   - Prevenzione

### Trattamenti Suggeriti

Per ogni problema, OrtoMio suggerisce:

- **Prodotti bio** (preferiti quando possibile)
- **Prodotti tradizionali** (se necessario)
- **Dosaggi precisi**
- **Frequenza applicazione**
- **Note importanti** (es. "Non dare sotto il sole forte")

### Aggiungere Trattamento al Diario

Dopo aver ricevuto un consiglio:

1. Clicca "Aggiungi al Diario"
2. Il sistema crea automaticamente:
   - Task di trattamento con data suggerita
   - Prossimo trattamento programmato (se il prodotto richiede frequenza)
3. Riceverai promemoria automatici

### Calendario Trattamenti

Nella sezione "Prevenzione Futura", puoi vedere:

- **Trattamenti programmati** per le prossime settimane
- **Prodotti da usare** con date
- **Piante da trattare**

---

## Harvest (Raccolto)

La sezione Harvest ti permette di registrare raccolti e analizzare i risultati.

### Registrare un Raccolto

#### Raccolto Parziale

Per raccogliere durante la crescita senza completare la pianta:

1. Vai in "Raccolti"
2. Clicca su una pianta attiva
3. Compila:
   - **Quantità** (es. 2.5)
   - **Unità** (kg, g, pezzi)
   - **Qualità** (1-5 stelle)
   - **Data raccolto**
   - **Foto** (opzionale)
4. Clicca "Registra Raccolto"

**Automaticamente**:

- Le ricette vengono generate e mostrate in un modal
- Il raccolto viene salvato nella cronologia
- Le statistiche vengono aggiornate

#### Raccolto Finale

Per completare una pianta:

1. Vai in "Diario"
2. Trova la pianta
3. Clicca "Raccolto Finale"
4. Compila i dati come per raccolto parziale
5. La pianta viene marcata come completata

### Ricette AI

Dopo ogni raccolto, OrtoMio genera automaticamente:

- **2-3 ricette italiane tradizionali**
- Basate su: pianta raccolta, quantità, stagione
- Ogni ricetta include:
  - Nome tradizionale
  - Ingredienti con quantità
  - Procedimento passo-passo
  - Tempo preparazione
  - Numero porzioni

**Come visualizzare**:

- Le ricette appaiono automaticamente dopo il salvataggio
- Vengono salvate nel raccolto per consultazione futura

### Analisi Economica

La Dashboard dei Raccolti mostra:

#### Valore Generato

- Calcolo basato su prezzi bio medi
- Valore per ogni tipo di coltura
- Totale complessivo

#### Costi Stimati

- Acqua, concime, semi
- Stima: 0.75€/kg prodotto

#### Risparmio Netto

- Differenza tra valore e costi
- Risparmio totale dell'orto

### Statistiche per Coltura

Per ogni tipo di pianta vedi:

- **Resa totale** (kg raccolti)
- **Numero piante** coltivate
- **Valore generato** (€)
- **Media per pianta**

### Filtri Stagionali

Puoi filtrare i raccolti per:

- **Tutti** (estivo + invernale)
- **Estivo** (aprile-settembre)
- **Invernale** (ottobre-marzo)

---

## Calendario Intelligente

Il Calendario Intelligente integra tutte le informazioni utili per la gestione dell'orto in un'unica vista mensile.

### Visualizzazione Calendario

Il calendario mostra:

- **Giorni del mese** con evidenziazione del giorno corrente
- **Task programmati** per ogni giorno (semine, trapianti, raccolti, trattamenti)
- **Fasi lunari** visualizzate con emoji
- **Eventi stagionali** (equinozi, solstizi, festività agricole)
- **Detti contadini** del giorno con varianti regionali
- **Challenge giornaliere** per mantenere l'orto attivo

### Navigazione

- **Cambia mese**: Usa le frecce per navigare tra i mesi
- **Clicca un giorno**: Visualizza dettagli completi per quella data
- **Visualizza task**: I task sono colorati per tipo (semina, trapianto, raccolto, trattamento)

### Informazioni per Giorno

Quando selezioni un giorno, vedi:

- **Fase lunare corrente** con consiglio agronomico
  - Luna crescente: ideale per semine di ortaggi da foglia e frutto
  - Luna calante: ideale per semine di ortaggi da radice e potature
  - Luna piena: momento ideale per raccolto e raccolta erbe officinali
  - Luna nuova: riposo, pianificazione e preparazione terreno

- **Detti contadini** tradizionali italiani con varianti regionali
- **Challenge del giorno** (es. "Controlla umidità terreno", "Raccogli erbe aromatiche")
- **Eventi stagionali** (es. Equinozio di Primavera, Festa di San Giuseppe)
- **Task programmati** per quel giorno con possibilità di completarli

### Integrazione con Task

- I task dal Planner e Journal appaiono automaticamente nel calendario
- Puoi completare task direttamente dal calendario
- I task suggeriti dal sistema sono evidenziati diversamente

### Esportazione

Puoi esportare il calendario in formato PDF per stamparlo o condividerlo.

---

## Smart Hub

Lo Smart Hub simula sensori IoT per monitorare l'orto.

### Sensori Umidità

Per ogni sensore configurato vedi:

- **Umidità terreno** (percentuale)
- **Indicatore visivo** circolare
- **Stato** (Secco, Normale, Umido, Saturo)

### Analisi AI

Clicca "Analizza con AI" per ottenere:

- **Consiglio irrigazione** basato su:
  - Umidità attuale
  - Tipo pianta
  - Condizioni meteo
  - Fase crescita
- **Raccomandazione** (Irriga ora, Aspetta, Non irrigare)

### Controllo Valvole

Per ogni valvola puoi:

- **Aprire/Chiudere** manualmente
- **Configurare** soglie automatiche
- **Vedere stato** (Aperta/Chiusa)

### Aggiungere Dispositivo

1. Clicca "Aggiungi Dispositivo"
2. Scegli tipo:
   - **Sensore Umidità**
   - **Valvola Irrigazione**
3. Assegna a una pianta o zona
4. Configura impostazioni

---

## Lavorazioni Meccaniche (Terreni Grandi)

Per orti e terreni più grandi (> 1000 m²), OrtoMio fornisce suggerimenti specifici per lavorazioni meccaniche come aratura e fresatura.

### Quando Usare Lavorazioni Meccaniche

Le lavorazioni meccaniche sono consigliate per:

- **Terreni grandi**: Superficie >= 1000 m²
- **Preparazione stagionale**: Prima della semina principale
- **Terreni compatti**: Che necessitano di lavorazione profonda
- **Rinnovo colturale**: Cambio coltura principale

### Suggerimenti Automatici

Il sistema analizza automaticamente:

- **Dimensione terreno**: Suggerisce trattore per terreni >= 5000 m², manuale per 1000-5000 m²
- **Stagione**:
  - Aratura: Ottobre-Febbraio (preparazione invernale)
  - Fresatura: Marzo-Aprile (preparazione primaverile)
- **Condizioni meteo**: Verifica previsioni pioggia per evitare lavorazioni con terreno bagnato
- **Task completati**: Non suggerisce lavorazioni già eseguite

### Terreno in Tempera

Il sistema calcola quando il terreno è "in tempera" (condizione ottimale per lavorazione):

- **Verifica umidità**: Dopo piogge, calcola quando il terreno raggiunge umidità ottimale
- **Avviso tempestivo**: Ti avvisa quando è il momento migliore per lavorare
- **Evita compattazione**: Previene lavorazioni su terreno troppo bagnato o troppo secco

### Tipi di Lavorazione

#### Aratura

- **Quando**: Ottobre-Febbraio
- **Profondità**: 25-40 cm
- **Scopo**: Rovesciamento terreno, interramento residui colturali
- **Attrezzatura**: Trattore con aratro per terreni grandi, vanga per piccoli

#### Fresatura

- **Quando**: Marzo-Aprile
- **Profondità**: 15-20 cm
- **Scopo**: Affinamento terreno, preparazione letto semina
- **Attrezzatura**: Fresa per terreni grandi, zappa per piccoli

### Registrazione Lavorazioni

Puoi registrare lavorazioni completate:

1. Vai in "Lavorazioni Meccaniche"
2. Clicca "Aggiungi Lavorazione"
3. Compila:
   - Tipo lavorazione (Aratura/Fresatura)
   - Data esecuzione
   - Superficie lavorata (m²)
   - Profondità (cm)
   - Attrezzatura usata
   - Condizioni meteo
   - Note opzionali
4. Salva

Le lavorazioni registrate vengono considerate dal sistema per evitare suggerimenti duplicati.

---

## Potatura Alberi

OrtoMio fornisce suggerimenti intelligenti per la potatura di alberi da frutto, inclusi agrumi.

### Tipi di Alberi Supportati

- **Pomacee**: Mele, pere (potatura invernale)
- **Drupacee**: Pesche, ciliegie, albicocche (potatura invernale)
- **Agrumi**: Arance, limoni, mandarini (potatura primaverile)
- **Frutta a guscio**: Noci, nocciole (potatura invernale)
- **Frutti di bosco**: Lamponi, more (potatura stagionale)

### Suggerimenti Potatura Automatici

Il sistema calcola automaticamente:

- **Tipo albero**: Identifica dal tuo inventario
- **Stagione ottimale**:
  - Inverno (Dicembre-Febbraio): Potatura principale per la maggior parte degli alberi
  - Primavera (Marzo-Aprile): Potatura principale per agrumi
  - Estate (Giugno-Luglio): Potatura verde per controllo vegetazione
- **Fasi lunari**: Preferisce luna calante per potatura (tradizione contadina)
- **Potature completate**: Non suggerisce potature già eseguite nell'anno corrente

### Tipi di Potatura

#### Potatura Formativa

- **Quando**: Primi 3-5 anni di vita dell'albero
- **Scopo**: Creare struttura principale, forma desiderata
- **Intensità**: Media-Alta

#### Potatura di Manutenzione

- **Quando**: Alberi maturi (dopo 5 anni)
- **Scopo**: Mantenere forma, rimuovere rami secchi/malati
- **Intensità**: Media

#### Potatura di Ringiovanimento

- **Quando**: Alberi vecchi (>15 anni)
- **Scopo**: Rinnovare struttura, stimolare nuova crescita
- **Intensità**: Alta

### Istruzioni Specifiche per Tipo

Ogni tipo di albero ha istruzioni dettagliate:

- **Pomacee**: Potatura a vaso o piramide, tagli sopra gemma esterna
- **Drupacee**: Potatura leggera, evitare tagli grossi, preferire estate
- **Agrumi**: Potatura primaverile leggera, rimozione succhioni estivi
- **Frutta a guscio**: Potatura minima, solo rami secchi

### Consigli Lunari

Il sistema integra consigli basati su fasi lunari:

- **Luna calante**: ⭐ Momento ideale per potatura
- **Luna crescente**: ⚠️ Meglio aspettare luna calante

### Registrazione Potature

Dopo aver completato una potatura:

1. Vai in "Potatura Alberi"
2. Seleziona l'albero potato
3. Compila:
   - Tipo potatura eseguita
   - Data potatura
   - Intensità (Leggera/Media/Alta)
   - Note (es. "Rimossi rami secchi", "Potatura formativa")
4. Salva

Le potature registrate vengono considerate per i suggerimenti futuri.

---

## Funzionalità Avanzate

### Calendario Lunare

OrtoMio calcola automaticamente:

- **Fase lunare corrente** (Nuova, Crescente, Piena, Calante)
- **Giorni ideali** per semine foglie/frutti (crescente)
- **Giorni ideali** per semine radici (calante)
- **Giorni ideali** per trapianti (crescente)

Visualizzato in:

- Dashboard (fase corrente)
- Planner (suggerimenti per semina)
- Journal (consigli per attività)

### Consociazioni

Il sistema conosce le relazioni tra piante:

**Benefiche**:

- Pomodoro + Basilico (allontana insetti)
- Carota + Cipolla (si proteggono a vicenda)
- Fagioli + Mais (fissazione azoto)

**Da Evitare**:

- Pomodoro + Patata (stessa famiglia, malattie)
- Fagioli + Cipolla (inibizione crescita)

Visualizzato in Planner quando selezioni una pianta.

### Rotazione Colture

Il Visual Garden Planner suggerisce:

- **Evitare stessa famiglia** nello stesso punto
- **Successioni ottimali** (es. dopo pomodoro, pianta legumi)
- **Riposo terreno** quando necessario

### Successione Intelligente

Quando una pianta finisce, OrtoMio suggerisce:

- **Cosa piantare dopo** per non lasciare spazio vuoto
- **Tempi ottimali** per la successione
- **Compatibilità** con piante vicine

Accessibile dalla Dashboard come "Mai più Aiuole Vuote".

### Fabbisogno Idrico Specifico

Calcolo avanzato basato su:

- **Fase fenologica**:
  - Germinazione: fabbisogno minimo
  - Vegetativa: fabbisogno medio
  - Produzione: fabbisogno massimo
- **Tipo pianta**: ogni pianta ha esigenze diverse
- **Condizioni meteo**: adattamento in base a pioggia/temperatura

Visualizzato in Dashboard come totale giornaliero e breakdown per pianta.

### Piano Lavori Preparatori Invernali

Generato automaticamente per:

- **Orto Estivo**: Novembre-Febbraio
- **Orto Invernale**: Giugno-Agosto

Include:

- **Pulizia residui** colture precedenti
- **Concimazione di fondo** (compost, letame)
- **Preparazione strutture** (tutori, irrigazione)
- **Pianificazione** semine indoor

Ogni lavoro ha:

- Priorità (Critical, High, Medium, Low)
- Mese consigliato
- Materiali necessari
- Istruzioni dettagliate

### Configurazione Modalità Vacanza

Configurazione:

1. Vai in Dashboard
2. Clicca "Modalità Vacanza"
3. Inserisci:
   - Data partenza
   - Data ritorno
   - Tipo orto (Estivo/Invernale)
4. Genera piano automatico

Il piano include:

- **Raccolti urgenti** da fare prima della partenza
- **Irrigazione** da programmare
- **Protezioni** (ombreggiature, pacciamature)
- **Preparazioni suolo** (pacciamatura per trattenere umidità)

Ogni task ha:

- Priorità
- Giorni prima della partenza
- Tempo stimato
- Istruzioni

### Gestione Banca Semi

Gestione inventario:

- **Aggiungi semi**: nome, varietà, quantità, data acquisto, scadenza
- **Visualizza inventario**: lista completa con quantità
- **Alert scadenze**: notifiche per semi in scadenza
- **Cerca semi**: ricerca per pianta o varietà

Accessibile dalla Dashboard.

---

## FAQ

### Come funziona l'AI?

OrtoMio usa Google Gemini AI per:

- Suggerimenti stagionali personalizzati
- Analisi foto per diagnosi
- Generazione ricette
- Consigli specifici per piante

**Nota**: Richiede API Key configurata. Senza API Key, alcune funzionalità usano dati predefiniti.

### I miei dati sono sicuri?

Sì! Tutti i dati sono salvati **localmente** nel browser (LocalStorage). Nessun dato viene inviato a server esterni (tranne API meteo e AI per funzionalità specifiche).

### Posso usare OrtoMio offline?

Parzialmente. Funziona offline per:

- Visualizzare dati salvati
- Aggiungere attività
- Consultare guide

Richiede connessione per:

- Suggerimenti AI
- Previsioni meteo
- Analisi foto

### Come cambio la posizione dell'orto?

1. Vai in Dashboard
2. Clicca icona ⚙️ (Impostazioni)
3. Modifica posizione GPS o inserisci manualmente
4. Salva

### Le ricette vengono salvate?

Sì! Le ricette vengono salvate in ogni raccolto. Attualmente sono visualizzabili solo subito dopo il salvataggio. Una funzionalità futura permetterà di richiamarle dalla cronologia.

### Come funziona l'auto-scheduling?

Quando completi un trattamento che richiede frequenza (es. Zeolite ogni 20 giorni), OrtoMio crea automaticamente il prossimo trattamento nella data corretta. Riceverai un promemoria nel Diario.

### Posso avere più orti?

Sì! Puoi creare e gestire più orti:

- Clicca sul nome orto in alto a sinistra
- Seleziona "Aggiungi Nuovo Orto"
- Configura le impostazioni
- Passa da un orto all'altro dal menu

### Come funziona il Visual Garden Planner?

1. Vai in Planner
2. Clicca "Apri Planner Visivo"
3. Trascina piante sulla griglia
4. Il sistema verifica:
   - Distanze corrette
   - Collisioni
   - Rotazione colture
5. Salva il layout

### Cosa sono i "Lavori Preparatori Invernali"?

Sono attività strutturate per preparare l'orto alla stagione successiva:

- **Inverno** (Nov-Feb): preparazione per orto estivo
- **Estate** (Giu-Ago): preparazione per orto invernale

Generati automaticamente in base al mese corrente.

### Come funziona il Fabbisogno Idrico?

Il sistema calcola automaticamente:

- Fabbisogno per ogni pianta in base alla fase
- Totale giornaliero per tutto l'orto
- Breakdown dettagliato

Considera:

- Tipo pianta
- Fase crescita (germinazione, vegetativa, produzione)
- Condizioni meteo (pioggia, temperatura)

---

## Supporto

Per problemi o domande:

- Consulta questo manuale
- Verifica la documentazione tecnica (TECHNICAL_DOCS.md)
- Controlla la console del browser per errori

---

**Buon orto con OrtoMio!** 🌱
