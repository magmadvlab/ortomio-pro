# Implementation Plan: Integrazione Sensore IoT Tuya

## Overview

Questo piano implementa l'integrazione di sensori wireless Tuya reali con il sistema Smart Hub esistente di OrtoMio. L'implementazione seguirà un approccio incrementale, costruendo layer per layer dal client API fino all'interfaccia utente, con testing continuo per validare ogni componente.

## Tasks

- [ ] 1. Setup Infrastruttura e Database
  - Creare le nuove tabelle Supabase per credenziali Tuya, mappature dispositivi e dati storici
  - Configurare variabili ambiente per chiavi di criptazione
  - Creare migration Supabase con schema completo
  - _Requirements: 1.2, 1.4, 5.1, 5.2_

- [ ] 2. Implementare TuyaCloudAPIClient
  - [ ] 2.1 Creare client base con autenticazione OAuth 2.0
    - Implementare classe `TuyaCloudAPIClient` in `services/tuyaCloudAPIClient.ts`
    - Implementare metodi `authenticate()` e `refreshToken()`
    - Gestire token storage e refresh automatico
    - Implementare rate limiting (max 100 chiamate/minuto)
    - _Requirements: 1.1, 15.4_
  
  - [ ] 2.2 Scrivere property test per autenticazione
    - **Property 1: Validazione Credenziali**
    - **Validates: Requirements 1.1, 1.3**
  
  - [ ] 2.3 Implementare metodi recupero dispositivi
    - Implementare `getDevices()`, `getDeviceInfo()`, `getDeviceStatus()`
    - Gestire paginazione risultati
    - Implementare retry logic con backoff esponenziale
    - _Requirements: 2.1, 2.2, 3.4_
  
  - [ ] 2.4 Scrivere property test per rilevamento dispositivi
    - **Property 5: Rilevamento Dispositivi**
    - **Property 6: Estrazione Informazioni Dispositivo**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ] 2.5 Implementare gestione errori e resilienza
    - Gestire timeout, errori di rete, rate limiting
    - Implementare logging errori
    - _Requirements: 3.4, 11.1, 11.5_
  
  - [ ] 2.6 Scrivere property test per retry logic
    - **Property 10: Retry Logic su Fallimento**
    - **Validates: Requirements 3.4**

- [ ] 3. Checkpoint - Validare TuyaCloudAPIClient
  - Testare connessione con account Tuya reale dell'utente
  - Verificare recupero dispositivi funzionante
  - Assicurarsi che tutti i test passino
  - Chiedere all'utente se ci sono domande

- [ ] 4. Implementare Sistema di Criptazione Credenziali
  - [ ] 4.1 Creare servizio di criptazione
    - Implementare `EncryptionService` in `services/encryptionService.ts`
    - Utilizzare crypto.subtle API con AES-256-GCM
    - Derivare chiave da master key in env variables
    - _Requirements: 1.4_
  
  - [ ] 4.2 Scrivere property test per criptazione
    - **Property 2: Criptazione Credenziali**
    - **Property 3: Round Trip Credenziali**
    - **Validates: Requirements 1.2, 1.4**
  
  - [ ] 4.3 Implementare storage sicuro credenziali
    - Creare funzioni per salvare/recuperare credenziali da Supabase
    - Criptare prima del salvataggio, decriptare dopo il recupero
    - _Requirements: 1.2, 1.4_
  
  - [ ] 4.4 Scrivere unit test per edge cases criptazione
    - Testare credenziali vuote, molto lunghe, caratteri speciali
    - _Requirements: 1.4_

- [ ] 5. Implementare TuyaIntegrationService
  - [ ] 5.1 Creare servizio di orchestrazione
    - Implementare classe `TuyaIntegrationService` in `services/tuyaIntegrationService.ts`
    - Implementare gestione configurazione (save/get credentials)
    - Implementare discovery dispositivi
    - _Requirements: 1.1, 1.2, 2.1_
  
  - [ ] 5.2 Implementare mappatura Tuya → SmartDevice
    - Creare funzione `mapTuyaToSmartDevice()`
    - Implementare mappature parametri standard (temp_current, humidity_value, etc.)
    - Gestire parametri non mappati in metadata
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 5.3 Scrivere property test per mappatura dati
    - **Property 12: Trasformazione Tuya → SmartDevice**
    - **Property 13: Mappatura Parametri Standard**
    - **Property 14: Metadata per Parametri Non Mappati**
    - **Validates: Requirements 4.1, 4.2, 4.3**
  
  - [ ] 5.4 Implementare sincronizzazione dispositivi
    - Implementare `syncDevices()` e `syncSingleDevice()`
    - Implementare auto-sync con polling configurabile
    - Gestire cache locale per resilienza
    - _Requirements: 3.1, 3.2, 11.1_
  
  - [ ] 5.5 Scrivere property test per sincronizzazione
    - **Property 9: Validazione Dati Ricevuti**
    - **Property 11: Preservazione Timestamp**
    - **Validates: Requirements 3.2, 3.5**

- [ ] 6. Implementare Storage Dati Storici
  - [ ] 6.1 Creare servizio per dati storici
    - Implementare `saveHistoricalData()` in TuyaIntegrationService
    - Utilizzare batch insert per performance (max 100 record)
    - Implementare `getHistoricalData()` con filtri temporali
    - _Requirements: 5.1, 5.3_
  
  - [ ] 6.2 Scrivere property test per storage dati
    - **Property 16: Salvataggio Dati Storici**
    - **Validates: Requirements 5.1, 5.3**
  
  - [ ] 6.3 Implementare archiviazione dati vecchi
    - Creare job per archiviare dati oltre retention period
    - Implementare logica di cleanup automatico
    - _Requirements: 5.4, 5.5_
  
  - [ ] 6.4 Scrivere property test per archiviazione
    - **Property 17: Archiviazione Dati Vecchi**
    - **Validates: Requirements 5.5**

- [ ] 7. Checkpoint - Validare Layer di Servizi
  - Testare sincronizzazione con sensore reale
  - Verificare salvataggio dati storici su Supabase
  - Controllare che criptazione funzioni correttamente
  - Assicurarsi che tutti i test passino
  - Chiedere all'utente se ci sono domande

- [ ] 8. Estendere Tipo SmartDevice
  - [ ] 8.1 Aggiornare definizione tipo in types.ts
    - Aggiungere campi opzionali: source, tuyaDeviceId, tuyaMetadata
    - Mantenere compatibilità con codice esistente
    - _Requirements: 4.1, 9.4_
  
  - [ ] 8.2 Scrivere unit test per compatibilità tipo
    - Verificare che dispositivi simulati continuino a funzionare
    - Verificare che nuovi campi siano opzionali
    - _Requirements: 13.1_

- [ ] 9. Creare API Routes Next.js per Tuya
  - [ ] 9.1 Creare route per configurazione credenziali
    - Implementare `app/api/tuya/credentials/route.ts`
    - Endpoint POST per salvare credenziali
    - Endpoint GET per recuperare credenziali (decriptate)
    - Endpoint DELETE per rimuovere credenziali
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 9.2 Scrivere property test per gestione credenziali
    - **Property 4: Rimozione Completa Credenziali**
    - **Validates: Requirements 1.5**
  
  - [ ] 9.3 Creare route per discovery dispositivi
    - Implementare `app/api/tuya/devices/route.ts`
    - Endpoint GET per lista dispositivi
    - Endpoint GET per dettagli singolo dispositivo
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 9.4 Creare route per sincronizzazione dati
    - Implementare `app/api/tuya/sync/route.ts`
    - Endpoint POST per trigger sync manuale
    - Endpoint GET per status ultima sincronizzazione
    - _Requirements: 3.1, 3.2_
  
  - [ ] 9.5 Scrivere integration test per API routes
    - Testare tutti gli endpoint con dati mock
    - Verificare gestione errori
    - _Requirements: 1.1, 2.1, 3.1_

- [ ] 10. Implementare Componente Configurazione Tuya
  - [ ] 10.1 Creare TuyaConfigurationPanel component
    - Implementare form per inserimento credenziali
    - Implementare validazione client-side
    - Mostrare stato connessione (connesso/disconnesso)
    - _Requirements: 1.1, 1.3_
  
  - [ ] 10.2 Implementare test connessione
    - Bottone "Test Connessione" che valida credenziali
    - Mostrare feedback successo/errore
    - _Requirements: 1.1, 1.3_
  
  - [ ] 10.3 Implementare discovery dispositivi UI
    - Mostrare lista dispositivi Tuya rilevati
    - Permettere mappatura dispositivo Tuya → SmartDevice
    - Permettere assegnazione nome personalizzato
    - _Requirements: 2.1, 2.2, 14.2_
  
  - [ ] 10.4 Scrivere unit test per componente configurazione
    - Testare validazione form
    - Testare gestione stati (loading, success, error)
    - _Requirements: 1.1, 1.3_

- [ ] 11. Integrare Dati Tuya in IntegratedSmartHub
  - [ ] 11.1 Modificare IntegratedSmartHub per supportare dual mode
    - Aggiungere logica per distinguere dispositivi simulati vs reali
    - Mostrare badge "REALE" o "SIMULAZIONE" per ogni dispositivo
    - Utilizzare dati da TuyaIntegrationService quando source='tuya'
    - _Requirements: 9.1, 9.2, 9.4, 13.2_
  
  - [ ] 11.2 Scrivere property test per dual mode
    - **Property 44: Gestione Dispositivi Misti**
    - **Validates: Requirements 13.2, 13.3**
  
  - [ ] 11.3 Implementare auto-sync in background
    - Avviare polling ogni 30 secondi quando Smart Hub è visibile
    - Ridurre a 5 minuti quando utente è su altre pagine
    - Fermare polling quando app in background
    - _Requirements: 3.1_
  
  - [ ] 11.4 Implementare indicatori stato connessione
    - Mostrare indicatore "online/offline" per ogni sensore
    - Mostrare timestamp ultimo aggiornamento
    - Mostrare indicatore "dati non aggiornati" quando usa cache
    - _Requirements: 6.3, 6.4, 11.2_
  
  - [ ] 11.5 Scrivere property test per visualizzazione
    - **Property 18: Visualizzazione Parametri Correnti**
    - **Property 19: Visualizzazione Timestamp**
    - **Property 20: Indicatore Stato Offline**
    - **Validates: Requirements 6.1, 6.3, 6.4**

- [ ] 12. Checkpoint - Validare Integrazione UI
  - Testare visualizzazione dati reali da sensore Tuya
  - Verificare che badge REALE/SIMULAZIONE siano visibili
  - Testare auto-sync funzionante
  - Assicurarsi che tutti i test passino
  - Chiedere all'utente se ci sono domande

- [ ] 13. Implementare Dashboard Grafici Storici
  - [ ] 13.1 Creare componente TuyaHistoricalChart
    - Implementare grafico con libreria Chart.js o Recharts
    - Supportare selezione intervallo temporale (24h, 7d, 30d, 1y)
    - Mostrare statistiche (min, max, media)
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [ ] 13.2 Scrivere property test per grafici
    - **Property 21: Generazione Grafico Storico**
    - **Property 22: Filtro Intervallo Temporale**
    - **Property 23: Calcolo Statistiche**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
  
  - [ ] 13.3 Implementare aggregazione per dataset grandi
    - Aggregare dati quando > 1000 punti
    - Utilizzare media per aggregazione
    - _Requirements: 7.5_
  
  - [ ] 13.4 Scrivere property test per aggregazione
    - **Property 24: Aggregazione Dati Grandi**
    - **Validates: Requirements 7.5**
  
  - [ ] 13.5 Integrare grafici in IntegratedSmartHub
    - Aggiungere tab "Storico" per ogni dispositivo
    - Mostrare grafici per ogni parametro disponibile
    - _Requirements: 7.1_

- [ ] 14. Implementare Sistema Alert e Notifiche
  - [ ] 14.1 Creare servizio gestione soglie
    - Implementare `ThresholdService` in `services/thresholdService.ts`
    - Implementare CRUD per configurazione soglie
    - Salvare soglie su Supabase
    - _Requirements: 8.1, 8.4_
  
  - [ ] 14.2 Scrivere property test per soglie
    - **Property 25: Salvataggio Configurazione Soglie**
    - **Property 28: Configurazione Soglie Min/Max**
    - **Validates: Requirements 8.1, 8.4**
  
  - [ ] 14.3 Implementare logica generazione alert
    - Controllare valori vs soglie ad ogni sync
    - Generare alert quando valore supera soglia
    - Chiudere alert quando valore rientra
    - _Requirements: 8.2, 8.5_
  
  - [ ] 14.4 Scrivere property test per alert
    - **Property 26: Generazione Alert su Superamento Soglia**
    - **Property 29: Chiusura Automatica Alert**
    - **Validates: Requirements 8.2, 8.5**
  
  - [ ] 14.5 Creare componente UI per alert
    - Mostrare notifiche in-app per alert attivi
    - Permettere configurazione soglie da UI
    - Mostrare storico alert
    - _Requirements: 8.3, 8.4_
  
  - [ ] 14.6 Scrivere property test per visualizzazione alert
    - **Property 27: Visualizzazione Notifica Alert**
    - **Validates: Requirements 8.3**

- [ ] 15. Implementare Sistema Export Dati
  - [ ] 15.1 Creare servizio export
    - Implementare `ExportService` in `services/exportService.ts`
    - Supportare formato CSV e JSON
    - Implementare filtri per intervallo temporale e parametri
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ] 15.2 Scrivere property test per export
    - **Property 33: Export Multi-Formato**
    - **Property 34: Completezza Dati Export**
    - **Property 35: Filtro Export per Parametri**
    - **Validates: Requirements 10.2, 10.3, 10.4**
  
  - [ ] 15.3 Creare API route per export
    - Implementare `app/api/tuya/export/route.ts`
    - Generare file e fornire link download
    - _Requirements: 10.5_
  
  - [ ] 15.4 Scrivere property test per link download
    - **Property 36: Disponibilità Link Download**
    - **Validates: Requirements 10.5**
  
  - [ ] 15.5 Creare componente UI per export
    - Bottone "Esporta Dati" in dashboard
    - Modal per selezione opzioni export
    - Download automatico file generato
    - _Requirements: 10.1, 10.5_

- [ ] 16. Checkpoint - Validare Funzionalità Avanzate
  - Testare grafici storici con dati reali
  - Configurare soglie e verificare alert
  - Testare export dati in CSV e JSON
  - Assicurarsi che tutti i test passino
  - Chiedere all'utente se ci sono domande

- [ ] 17. Implementare Gestione Multi-Sensore
  - [ ] 17.1 Estendere UI per supportare multipli sensori
    - Mostrare lista di tutti i sensori configurati
    - Permettere aggiunta/rimozione sensori
    - Mostrare stato di ogni sensore (online/offline)
    - _Requirements: 14.1, 14.2_
  
  - [ ] 17.2 Scrivere property test per multi-sensore
    - **Property 46: Supporto Multi-Sensore**
    - **Property 47: Personalizzazione Nome Sensore**
    - **Validates: Requirements 14.1, 14.2**
  
  - [ ] 17.3 Implementare associazione sensore-zona
    - Permettere di associare ogni sensore a una zona dell'orto
    - Salvare associazione su database
    - Mostrare zona associata in UI
    - _Requirements: 14.4_
  
  - [ ] 17.4 Scrivere property test per associazione zona
    - **Property 49: Associazione Sensore-Zona**
    - **Validates: Requirements 14.4**
  
  - [ ] 17.5 Implementare gestione sensori rimossi
    - Permettere di disattivare sensori
    - Mantenere dati storici di sensori disattivati
    - Mostrare badge "INATTIVO" per sensori rimossi
    - _Requirements: 14.5_
  
  - [ ] 17.6 Scrivere property test per sensori rimossi
    - **Property 50: Preservazione Dati Sensore Rimosso**
    - **Validates: Requirements 14.5**

- [ ] 18. Implementare Gestione Errori Avanzata
  - [ ] 18.1 Implementare cache resiliente
    - Cache in-memory per ultimi 5 minuti
    - Cache su database per ultime 24 ore
    - Utilizzo automatico cache su fallimento API
    - _Requirements: 11.1, 11.2_
  
  - [ ] 18.2 Scrivere property test per cache
    - **Property 37: Utilizzo Cache su Fallimento Connessione**
    - **Property 38: Indicatore Dati Cached**
    - **Validates: Requirements 11.1, 11.2**
  
  - [ ] 18.3 Implementare sincronizzazione post-ripristino
    - Rilevare ripristino connessione
    - Sincronizzare dati mancanti automaticamente
    - _Requirements: 11.3_
  
  - [ ] 18.4 Scrivere property test per ripristino
    - **Property 39: Sincronizzazione Post-Ripristino**
    - **Validates: Requirements 11.3**
  
  - [ ] 18.5 Implementare notifiche sensore offline
    - Rilevare sensore offline > 10 minuti
    - Inviare notifica in-app all'utente
    - _Requirements: 11.4_
  
  - [ ] 18.6 Scrivere property test per notifiche offline
    - **Property 40: Notifica Sensore Offline Prolungato**
    - **Validates: Requirements 11.4**

- [ ] 19. Implementare Logging e Monitoring
  - [ ] 19.1 Implementare logging strutturato
    - Loggare tutti gli errori API con dettagli
    - Loggare metriche di performance (latenza, successo/fallimento)
    - Utilizzare formato JSON per log
    - _Requirements: 11.5_
  
  - [ ] 19.2 Scrivere property test per logging
    - **Property 41: Logging Errori**
    - **Validates: Requirements 11.5**
  
  - [ ] 19.3 Implementare rilevamento anomalie
    - Calcolare media e deviazione standard per ogni parametro
    - Segnalare valori oltre 3 deviazioni standard
    - _Requirements: 12.3_
  
  - [ ] 19.4 Scrivere property test per anomalie
    - **Property 42: Segnalazione Anomalie Dati**
    - **Validates: Requirements 12.3**
  
  - [ ] 19.5 Implementare monitoraggio latenza
    - Misurare latenza di ogni chiamata API
    - Segnalare latenza > 10 secondi
    - _Requirements: 12.5_
  
  - [ ] 19.6 Scrivere property test per latenza
    - **Property 43: Segnalazione Latenza Eccessiva**
    - **Validates: Requirements 12.5**

- [ ] 20. Testing di Compatibilità e Regressione
  - [ ] 20.1 Testare compatibilità con Smart Hub esistente
    - Verificare che dispositivi simulati continuino a funzionare
    - Testare mix di dispositivi reali e simulati
    - Verificare che tutte le funzionalità esistenti funzionino
    - _Requirements: 13.1, 13.2_
  
  - [ ] 20.2 Scrivere property test per compatibilità
    - **Property 44: Gestione Dispositivi Misti**
    - **Property 45: Ritorno a Simulazione**
    - **Validates: Requirements 13.2, 13.3, 13.5**
  
  - [ ] 20.3 Testare switch tra modalità
    - Testare passaggio da simulazione a reale
    - Testare passaggio da reale a simulazione
    - Verificare sincronizzazione immediata
    - _Requirements: 9.3, 9.5, 13.5_
  
  - [ ] 20.4 Scrivere property test per switch modalità
    - **Property 30: Selezione Automatica Fonte Dati**
    - **Property 31: Indicazione Fonte Dati**
    - **Property 32: Sincronizzazione Cambio Modalità**
    - **Validates: Requirements 9.2, 9.4, 9.5**

- [ ] 21. Checkpoint Finale - Test End-to-End
  - Configurare credenziali Tuya reali
  - Connettere sensore fisico dell'utente
  - Testare acquisizione dati per almeno 1 ora
  - Verificare tutti i flussi: configurazione, sync, visualizzazione, grafici, alert, export
  - Verificare performance (latenza < 5 secondi, UI responsive)
  - Assicurarsi che tutti i test passino
  - Chiedere all'utente feedback finale

- [ ] 22. Documentazione e Deployment
  - [ ] 22.1 Creare documentazione utente
    - Guida setup credenziali Tuya
    - Guida configurazione sensori
    - Guida utilizzo dashboard e grafici
    - FAQ e troubleshooting
    - _Requirements: Tutti_
  
  - [ ] 22.2 Aggiornare README.md
    - Documentare nuove variabili ambiente
    - Documentare processo di setup
    - Aggiungere sezione "Integrazione IoT Tuya"
  
  - [ ] 22.3 Preparare deployment
    - Verificare tutte le variabili ambiente configurate
    - Eseguire migrations Supabase su produzione
    - Configurare feature flag per rollout graduale
    - _Requirements: Tutti_
  
  - [ ] 22.4 Deploy su staging per beta testing
    - Deploy su ambiente staging
    - Testare con sensore reale
    - Raccogliere feedback utente
  
  - [ ] 22.5 Deploy su produzione
    - Abilitare feature flag per utenti beta
    - Monitorare metriche e errori
    - Rollout graduale a tutti gli utenti

## Notes

- Tutti i task sono obbligatori per garantire copertura completa e qualità del codice
- Ogni task referenzia i requirements specifici per tracciabilità
- I checkpoint assicurano validazione incrementale
- I property test validano le correctness properties del design
- I unit test validano esempi specifici e edge case
- Testing con sensore reale è critico per validare l'integrazione
