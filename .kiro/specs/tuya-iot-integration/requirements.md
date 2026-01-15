# Requirements Document - Integrazione Sensore IoT Tuya

## Introduzione

OrtoMio dispone già di un sistema Smart Hub IoT completo con interfaccia utente per la gestione dei dispositivi. Tuttavia, attualmente i dati provengono da simulazioni e manca il "layer di acquisizione reali dati ovvero API collegate" per sensori fisici.

Questo documento definisce i requisiti per integrare sensori wireless Tuya reali con il sistema Smart Hub esistente, colmando uno dei 5 gap critici identificati per la dominanza di mercato. L'utente dispone di un sensore Tuya fisico per test e validazione.

## Glossario

- **Tuya_Cloud_API**: API REST fornite da Tuya per accedere ai dispositivi IoT registrati su account Tuya
- **Smart_Hub**: Componente esistente di OrtoMio (`IntegratedSmartHub.tsx`) che gestisce dispositivi IoT
- **Sensore_Tuya**: Dispositivo wireless Tuya fisico dell'utente che rileva parametri ambientali
- **SmartDevice**: Struttura dati esistente in OrtoMio per rappresentare dispositivi IoT
- **Supabase_DB**: Database PostgreSQL esistente utilizzato da OrtoMio
- **Real_Time_Data**: Dati acquisiti dal sensore fisico con latenza < 5 secondi
- **Simulazione_Demo**: Modalità esistente che genera dati fittizi per demo senza sensori reali
- **Sincronizzazione**: Processo di aggiornamento automatico dei dati dal sensore al database
- **Threshold_Alert**: Notifica generata quando un valore del sensore supera una soglia configurata

## Requirements

### Requirement 1: Autenticazione e Configurazione Account Tuya

**User Story:** Come amministratore di sistema, voglio configurare le credenziali API Tuya, così da poter connettere OrtoMio al mio account Tuya Cloud.

#### Acceptance Criteria

1. WHEN l'amministratore inserisce Client ID, Client Secret e Device ID Tuya, THEN il Sistema SHALL validare le credenziali tramite chiamata API Tuya
2. WHEN le credenziali sono valide, THEN il Sistema SHALL salvare le credenziali in modo sicuro nel Supabase_DB
3. WHEN le credenziali sono invalide, THEN il Sistema SHALL mostrare un messaggio di errore descrittivo
4. THE Sistema SHALL criptare le credenziali API prima del salvataggio nel database
5. WHEN l'amministratore richiede la disconnessione, THEN il Sistema SHALL rimuovere le credenziali salvate

### Requirement 2: Connessione e Rilevamento Sensore Tuya

**User Story:** Come utente, voglio che il sistema rilevi automaticamente il mio sensore Tuya, così da poterlo utilizzare senza configurazioni complesse.

#### Acceptance Criteria

1. WHEN le credenziali Tuya sono configurate, THEN il Sistema SHALL recuperare la lista dei dispositivi associati all'account
2. WHEN un Sensore_Tuya è rilevato, THEN il Sistema SHALL estrarre le informazioni del dispositivo (nome, tipo, capacità)
3. WHEN il sensore supporta parametri multipli, THEN il Sistema SHALL identificare tutti i parametri disponibili (temperatura, umidità, luminosità, ecc.)
4. IF il sensore non è raggiungibile, THEN il Sistema SHALL segnalare lo stato offline
5. THE Sistema SHALL verificare la connessione del sensore ogni 60 secondi

### Requirement 3: Acquisizione Dati Real-Time dal Sensore

**User Story:** Come utente, voglio ricevere dati aggiornati dal mio sensore Tuya in tempo reale, così da monitorare le condizioni del mio orto.

#### Acceptance Criteria

1. WHEN il sensore è connesso, THEN il Sistema SHALL richiedere i dati del sensore ogni 30 secondi
2. WHEN i dati sono ricevuti, THEN il Sistema SHALL validare la struttura e i valori dei dati
3. WHEN i dati sono validi, THEN il Sistema SHALL aggiornare l'interfaccia Smart_Hub entro 5 secondi
4. IF la richiesta API fallisce, THEN il Sistema SHALL ritentare fino a 3 volte con backoff esponenziale
5. WHEN il sensore invia dati con timestamp, THEN il Sistema SHALL preservare il timestamp originale

### Requirement 4: Mappatura Dati Tuya su Struttura SmartDevice

**User Story:** Come sviluppatore, voglio che i dati Tuya siano mappati sulla struttura SmartDevice esistente, così da mantenere compatibilità con il codice esistente.

#### Acceptance Criteria

1. WHEN i dati Tuya sono ricevuti, THEN il Sistema SHALL trasformare i dati nel formato SmartDevice
2. THE Sistema SHALL mappare i parametri Tuya (temperature, humidity) sui campi SmartDevice corrispondenti
3. WHEN un parametro Tuya non ha corrispondenza diretta, THEN il Sistema SHALL salvarlo in un campo metadata
4. THE Sistema SHALL preservare l'unità di misura originale del sensore
5. WHEN la mappatura è completata, THEN il Sistema SHALL validare che tutti i campi obbligatori SmartDevice siano popolati

### Requirement 5: Storage Storico Dati Sensore

**User Story:** Come utente, voglio che i dati del sensore siano salvati nel tempo, così da poter analizzare trend e storico.

#### Acceptance Criteria

1. WHEN nuovi dati sono ricevuti dal sensore, THEN il Sistema SHALL salvarli nel Supabase_DB
2. THE Sistema SHALL creare una tabella dedicata per i dati storici dei sensori IoT
3. WHEN i dati sono salvati, THEN il Sistema SHALL includere timestamp, device_id, parametro, valore e unità di misura
4. THE Sistema SHALL mantenere i dati storici per almeno 365 giorni
5. WHEN lo storage supera il limite configurato, THEN il Sistema SHALL archiviare i dati più vecchi

### Requirement 6: Dashboard Visualizzazione Dati Live

**User Story:** Come utente, voglio visualizzare i dati del sensore in tempo reale nel dashboard, così da monitorare le condizioni attuali.

#### Acceptance Criteria

1. WHEN accedo allo Smart_Hub, THEN il Sistema SHALL mostrare i valori correnti di tutti i parametri del sensore
2. WHEN i dati sono aggiornati, THEN il Sistema SHALL aggiornare la visualizzazione senza refresh della pagina
3. THE Sistema SHALL mostrare l'ultimo timestamp di aggiornamento per ogni parametro
4. WHEN il sensore è offline, THEN il Sistema SHALL mostrare un indicatore visivo di stato offline
5. THE Sistema SHALL utilizzare icone e colori per rappresentare visivamente i valori (es. temperatura alta = rosso)

### Requirement 7: Grafici e Trend Storici

**User Story:** Come utente, voglio visualizzare grafici dei dati storici del sensore, così da identificare pattern e trend nel tempo.

#### Acceptance Criteria

1. WHEN seleziono un parametro del sensore, THEN il Sistema SHALL mostrare un grafico delle ultime 24 ore
2. THE Sistema SHALL permettere di selezionare intervalli temporali (24h, 7 giorni, 30 giorni, 1 anno)
3. WHEN cambio l'intervallo temporale, THEN il Sistema SHALL aggiornare il grafico con i dati dell'intervallo selezionato
4. THE Sistema SHALL mostrare valori min, max e media per l'intervallo selezionato
5. WHEN il grafico contiene più di 1000 punti, THEN il Sistema SHALL aggregare i dati per migliorare le performance

### Requirement 8: Sistema di Alert e Notifiche

**User Story:** Come utente, voglio ricevere notifiche quando i valori del sensore superano soglie critiche, così da intervenire tempestivamente.

#### Acceptance Criteria

1. WHEN configuro una soglia per un parametro, THEN il Sistema SHALL salvare la configurazione nel database
2. WHEN un valore supera la soglia configurata, THEN il Sistema SHALL generare un Threshold_Alert
3. WHEN un alert è generato, THEN il Sistema SHALL mostrare una notifica nell'interfaccia utente
4. THE Sistema SHALL permettere di configurare soglie minime e massime per ogni parametro
5. WHEN un alert è attivo e il valore rientra nella norma, THEN il Sistema SHALL chiudere automaticamente l'alert

### Requirement 9: Modalità Dual Mode (Reale/Simulazione)

**User Story:** Come utente, voglio poter passare tra dati reali e simulati, così da poter fare demo anche senza sensore fisico.

#### Acceptance Criteria

1. THE Sistema SHALL mantenere la Simulazione_Demo esistente funzionante
2. WHEN un Sensore_Tuya è connesso, THEN il Sistema SHALL utilizzare automaticamente i dati reali
3. WHEN il sensore è disconnesso, THEN il Sistema SHALL permettere di attivare la modalità simulazione
4. THE Sistema SHALL mostrare chiaramente nell'interfaccia se i dati sono reali o simulati
5. WHEN passo da simulazione a reale, THEN il Sistema SHALL sincronizzare immediatamente i dati dal sensore

### Requirement 10: Export Dati per Analisi Esterne

**User Story:** Come utente avanzato, voglio esportare i dati storici del sensore, così da poterli analizzare con strumenti esterni.

#### Acceptance Criteria

1. WHEN richiedo l'export dei dati, THEN il Sistema SHALL permettere di selezionare l'intervallo temporale
2. THE Sistema SHALL supportare export in formato CSV e JSON
3. WHEN l'export è generato, THEN il Sistema SHALL includere tutti i parametri con timestamp e unità di misura
4. THE Sistema SHALL permettere di filtrare l'export per parametri specifici
5. WHEN l'export è pronto, THEN il Sistema SHALL fornire un link per il download del file

### Requirement 11: Gestione Errori e Resilienza

**User Story:** Come utente, voglio che il sistema continui a funzionare anche in caso di problemi di connessione, così da non perdere funzionalità critiche.

#### Acceptance Criteria

1. WHEN la connessione a Tuya_Cloud_API fallisce, THEN il Sistema SHALL utilizzare l'ultimo valore valido ricevuto
2. THE Sistema SHALL mostrare un indicatore di "dati non aggiornati" quando usa valori cached
3. WHEN la connessione è ripristinata, THEN il Sistema SHALL sincronizzare automaticamente i dati mancanti
4. IF il sensore è offline per più di 10 minuti, THEN il Sistema SHALL inviare una notifica all'utente
5. THE Sistema SHALL loggare tutti gli errori di connessione per debugging

### Requirement 12: Testing con Sensore Reale

**User Story:** Come sviluppatore, voglio testare l'integrazione con il sensore fisico dell'utente, così da validare l'accuratezza e affidabilità del sistema.

#### Acceptance Criteria

1. WHEN eseguo i test con il sensore reale, THEN il Sistema SHALL acquisire dati per almeno 24 ore continue
2. THE Sistema SHALL confrontare i dati Tuya con valori di riferimento noti
3. WHEN i dati differiscono significativamente, THEN il Sistema SHALL segnalare l'anomalia
4. THE Sistema SHALL misurare la latenza media di acquisizione dati
5. WHEN la latenza supera 10 secondi, THEN il Sistema SHALL segnalare un problema di performance

### Requirement 13: Compatibilità con Smart Hub Esistente

**User Story:** Come utente esistente, voglio che l'integrazione Tuya non rompa le funzionalità esistenti dello Smart Hub, così da continuare a usare le feature attuali.

#### Acceptance Criteria

1. WHEN l'integrazione Tuya è attiva, THEN il Sistema SHALL mantenere tutte le funzionalità esistenti dello Smart_Hub
2. THE Sistema SHALL permettere di gestire sia dispositivi simulati che reali contemporaneamente
3. WHEN visualizzo la lista dispositivi, THEN il Sistema SHALL distinguere chiaramente dispositivi reali da simulati
4. THE Sistema SHALL utilizzare gli stessi componenti UI esistenti per visualizzare i dati
5. WHEN disattivo l'integrazione Tuya, THEN il Sistema SHALL tornare alla modalità simulazione senza errori

### Requirement 14: Configurazione Multi-Sensore

**User Story:** Come utente con più sensori, voglio gestire multipli dispositivi Tuya, così da monitorare diverse zone del mio orto.

#### Acceptance Criteria

1. THE Sistema SHALL supportare la connessione di multipli Sensore_Tuya contemporaneamente
2. WHEN aggiungo un nuovo sensore, THEN il Sistema SHALL permettere di assegnare un nome personalizzato
3. WHEN visualizzo i dati, THEN il Sistema SHALL mostrare chiaramente quale sensore ha generato ogni dato
4. THE Sistema SHALL permettere di associare ogni sensore a una zona specifica dell'orto
5. WHEN un sensore è rimosso, THEN il Sistema SHALL mantenere i dati storici ma segnalare il dispositivo come inattivo

### Requirement 15: Performance e Scalabilità

**User Story:** Come amministratore di sistema, voglio che l'integrazione sia performante anche con molti sensori, così da garantire un'esperienza utente fluida.

#### Acceptance Criteria

1. WHEN il sistema gestisce fino a 10 sensori, THEN il Sistema SHALL mantenere latenza di aggiornamento UI < 2 secondi
2. THE Sistema SHALL utilizzare caching per ridurre le chiamate API a Tuya_Cloud_API
3. WHEN salvo dati storici, THEN il Sistema SHALL utilizzare batch insert per ottimizzare le performance del database
4. THE Sistema SHALL implementare rate limiting per rispettare i limiti API di Tuya
5. WHEN il carico aumenta, THEN il Sistema SHALL degradare gracefully senza crash

## Note Implementative

- Utilizzare Tuya Cloud API (non Tuya IoT Platform) come specificato dall'utente
- Integrare con componente esistente `IntegratedSmartHub.tsx`
- Utilizzare database Supabase esistente per storage dati
- Mantenere compatibilità con sistema simulazione per demo
- Priorità ALTA: questo completa uno dei 5 gap critici per dominanza di mercato
