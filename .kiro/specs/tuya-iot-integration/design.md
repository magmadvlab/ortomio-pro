# Design Document - Integrazione Sensore IoT Tuya

## Overview

Questo documento descrive il design tecnico per integrare sensori wireless Tuya reali con il sistema Smart Hub esistente di OrtoMio. L'integrazione colma il gap critico del "layer di acquisizione reali dati" sostituendo le simulazioni con dati provenienti da dispositivi fisici.

Il sistema manterrà la compatibilità con l'interfaccia esistente `IntegratedSmartHub.tsx` e il modello dati `SmartDevice`, aggiungendo un nuovo layer di servizi per comunicare con Tuya Cloud API e sincronizzare i dati in tempo reale.

### Obiettivi Principali

1. **Integrazione Trasparente**: I dati Tuya devono integrarsi senza modifiche all'UI esistente
2. **Dual Mode**: Supporto simultaneo di dispositivi reali e simulati
3. **Real-Time**: Latenza < 5 secondi dall'acquisizione alla visualizzazione
4. **Resilienza**: Gestione robusta di errori di rete e disconnessioni
5. **Scalabilità**: Supporto fino a 10 sensori contemporaneamente

## Architecture

### Architettura a Livelli

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│              IntegratedSmartHub.tsx                      │
│           (Nessuna modifica necessaria)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Service Layer                           │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │ SmartDeviceService│  │ TuyaIntegrationService   │    │
│  │  (Esistente)      │  │      (NUOVO)             │    │
│  └──────────────────┘  └──────────────────────────┘    │
│           ↓                        ↓                     │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │ SimulationService │  │  TuyaCloudAPIClient      │    │
│  │  (Esistente)      │  │      (NUOVO)             │    │
│  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Data Layer                              │
│  ┌──────────────────┐  ┌──────────────────────────┐    │
│  │  Supabase DB     │  │  Tuya Cloud API          │    │
│  │  (Esistente)     │  │  (Esterno)               │    │
│  └──────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Flusso Dati Real-Time

```
Sensore Tuya → Tuya Cloud → TuyaCloudAPIClient → TuyaIntegrationService
                                                          ↓
                                                   Supabase DB
                                                          ↓
                                              IntegratedSmartHub UI
```

### Pattern di Polling

Il sistema utilizzerà un pattern di polling intelligente:

1. **Polling Attivo**: Ogni 30 secondi quando l'utente visualizza lo Smart Hub
2. **Polling Ridotto**: Ogni 5 minuti quando l'utente è su altre pagine
3. **Polling Sospeso**: Nessun polling quando l'app è in background

## Components and Interfaces

### 1. TuyaCloudAPIClient

Client HTTP per comunicare con Tuya Cloud API.

**Responsabilità**:
- Autenticazione OAuth 2.0 con Tuya Cloud
- Gestione token e refresh automatico
- Chiamate API per recupero dati dispositivi
- Rate limiting e retry logic

**Interfaccia**:

```typescript
interface TuyaCredentials {
  clientId: string
  clientSecret: string
  region: 'eu' | 'us' | 'cn' | 'in'
}

interface TuyaToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface TuyaDeviceInfo {
  id: string
  name: string
  category: string
  productId: string
  online: boolean
  status: TuyaDeviceStatus[]
}

interface TuyaDeviceStatus {
  code: string  // es: 'temp_current', 'humidity_value'
  value: any
  timestamp: number
}

class TuyaCloudAPIClient {
  constructor(credentials: TuyaCredentials)
  
  // Autenticazione
  async authenticate(): Promise<TuyaToken>
  async refreshToken(refreshToken: string): Promise<TuyaToken>
  
  // Dispositivi
  async getDevices(): Promise<TuyaDeviceInfo[]>
  async getDeviceInfo(deviceId: string): Promise<TuyaDeviceInfo>
  async getDeviceStatus(deviceId: string): Promise<TuyaDeviceStatus[]>
  
  // Controllo
  async sendCommand(deviceId: string, commands: any[]): Promise<boolean>
}
```

### 2. TuyaIntegrationService

Servizio di orchestrazione che mappa dati Tuya su SmartDevice.

**Responsabilità**:
- Mappatura dati Tuya → SmartDevice
- Sincronizzazione periodica con Tuya Cloud
- Gestione cache locale per resilienza
- Salvataggio dati storici su Supabase

**Interfaccia**:

```typescript
interface TuyaSensorMapping {
  tuyaDeviceId: string
  smartDeviceId: string
  parameterMappings: {
    [tuyaCode: string]: {
      smartDeviceField: keyof SmartDevice
      transform?: (value: any) => any
    }
  }
}

interface TuyaSyncResult {
  success: boolean
  devicesUpdated: number
  errors: string[]
  lastSyncTime: Date
}

class TuyaIntegrationService {
  constructor(
    apiClient: TuyaCloudAPIClient,
    supabaseClient: SupabaseClient
  )
  
  // Configurazione
  async saveCredentials(credentials: TuyaCredentials): Promise<void>
  async getCredentials(): Promise<TuyaCredentials | null>
  async testConnection(): Promise<boolean>
  
  // Mappatura dispositivi
  async discoverDevices(): Promise<TuyaDeviceInfo[]>
  async mapDevice(
    tuyaDeviceId: string,
    smartDeviceId: string,
    mappings: TuyaSensorMapping['parameterMappings']
  ): Promise<void>
  async getMappedDevices(): Promise<TuyaSensorMapping[]>
  
  // Sincronizzazione
  async syncDevices(): Promise<TuyaSyncResult>
  async syncSingleDevice(deviceId: string): Promise<SmartDevice>
  startAutoSync(intervalMs: number): void
  stopAutoSync(): void
  
  // Dati storici
  async saveHistoricalData(
    deviceId: string,
    data: TuyaDeviceStatus[]
  ): Promise<void>
  async getHistoricalData(
    deviceId: string,
    from: Date,
    to: Date
  ): Promise<SensorHistoricalData[]>
}
```

### 3. Estensione SmartDevice (Compatibilità)

Il tipo `SmartDevice` esistente verrà esteso con campi opzionali per supportare Tuya:

```typescript
export interface SmartDevice {
  // Campi esistenti
  id: string
  gardenId: string
  name: string
  type: 'Sensor' | 'Valve' | 'Hub'
  moisture: number
  isValveOpen: boolean
  flowRateLpm: number
  sessionLiters: number
  targetLiters: number
  autoThreshold: number
  autoMode: boolean
  lastUpdate: string
  
  // NUOVI campi per integrazione Tuya
  source?: 'simulation' | 'tuya'  // Indica l'origine dei dati
  tuyaDeviceId?: string           // ID dispositivo Tuya se source='tuya'
  tuyaMetadata?: {                // Metadati aggiuntivi da Tuya
    category: string
    productId: string
    online: boolean
    rawStatus: Record<string, any>
  }
}
```

### 4. Database Schema - Nuove Tabelle

#### Tabella: tuya_credentials

```sql
CREATE TABLE tuya_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id_encrypted TEXT NOT NULL,
  client_secret_encrypted TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('eu', 'us', 'cn', 'in')),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### Tabella: tuya_device_mappings

```sql
CREATE TABLE tuya_device_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tuya_device_id TEXT NOT NULL,
  smart_device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  parameter_mappings JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tuya_device_id)
);
```

#### Tabella: sensor_historical_data

```sql
CREATE TABLE sensor_historical_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  parameter_code TEXT NOT NULL,
  parameter_value NUMERIC NOT NULL,
  parameter_unit TEXT,
  source TEXT NOT NULL CHECK (source IN ('simulation', 'tuya')),
  recorded_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  
  INDEX idx_device_time (device_id, recorded_at DESC),
  INDEX idx_user_device (user_id, device_id)
);

-- Partitioning per performance (opzionale, per grandi volumi)
-- Partizionare per mese se si accumulano molti dati
```

#### Tabella: tuya_sync_log

```sql
CREATE TABLE tuya_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  sync_started_at TIMESTAMPTZ NOT NULL,
  sync_completed_at TIMESTAMPTZ,
  devices_synced INTEGER DEFAULT 0,
  errors JSONB,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  
  INDEX idx_user_time (user_id, sync_started_at DESC)
);
```

## Data Models

### Mappatura Parametri Tuya → SmartDevice

I sensori Tuya utilizzano codici standard per i parametri. Ecco le mappature comuni:

| Codice Tuya | Descrizione | Campo SmartDevice | Trasformazione |
|-------------|-------------|-------------------|----------------|
| `temp_current` | Temperatura (°C × 10) | `tuyaMetadata.rawStatus.temperature` | `value / 10` |
| `humidity_value` | Umidità (%) | `moisture` | `value` (diretto) |
| `battery_percentage` | Batteria (%) | `tuyaMetadata.rawStatus.battery` | `value` (diretto) |
| `bright_value` | Luminosità (lux) | `tuyaMetadata.rawStatus.brightness` | `value` (diretto) |

### Esempio Trasformazione Dati

**Input da Tuya API**:
```json
{
  "id": "bf1234567890abcdef",
  "name": "Sensore Orto Zona A",
  "online": true,
  "status": [
    { "code": "temp_current", "value": 235 },
    { "code": "humidity_value", "value": 65 },
    { "code": "battery_percentage", "value": 87 }
  ]
}
```

**Output SmartDevice**:
```typescript
{
  id: "smart-device-001",
  gardenId: "garden-123",
  name: "Sensore Orto Zona A",
  type: "Sensor",
  moisture: 65,
  isValveOpen: false,
  flowRateLpm: 0,
  sessionLiters: 0,
  targetLiters: 0,
  autoThreshold: 30,
  autoMode: false,
  lastUpdate: "2026-01-15T10:30:00Z",
  source: "tuya",
  tuyaDeviceId: "bf1234567890abcdef",
  tuyaMetadata: {
    category: "wsdcg",
    productId: "keyjqtuyaq0t",
    online: true,
    rawStatus: {
      temperature: 23.5,
      humidity: 65,
      battery: 87
    }
  }
}
```

## Correctness Properties

*Una property è una caratteristica o comportamento che dovrebbe essere vero in tutte le esecuzioni valide di un sistema - essenzialmente, un'affermazione formale su ciò che il sistema dovrebbe fare. Le properties servono come ponte tra specifiche leggibili dall'uomo e garanzie di correttezza verificabili dalla macchina.*


### Property 1: Validazione Credenziali

*Per qualsiasi* set di credenziali Tuya (Client ID, Client Secret, Region), il sistema deve validarle tramite chiamata API e restituire successo se valide o errore descrittivo se invalide.

**Validates: Requirements 1.1, 1.3**

### Property 2: Criptazione Credenziali

*Per qualsiasi* credenziale salvata nel database, i campi sensibili (client_id, client_secret, access_token, refresh_token) devono essere criptati prima del salvataggio.

**Validates: Requirements 1.4**

### Property 3: Round Trip Credenziali

*Per qualsiasi* set di credenziali valide, salvare e poi recuperare le credenziali deve produrre valori equivalenti dopo decriptazione.

**Validates: Requirements 1.2**

### Property 4: Rimozione Completa Credenziali

*Per qualsiasi* set di credenziali salvate, la disconnessione deve rimuovere completamente tutte le credenziali dal database.

**Validates: Requirements 1.5**

### Property 5: Rilevamento Dispositivi

*Per qualsiasi* account Tuya con credenziali valide, il sistema deve recuperare tutti i dispositivi associati all'account.

**Validates: Requirements 2.1**

### Property 6: Estrazione Informazioni Dispositivo

*Per qualsiasi* dispositivo Tuya rilevato, il sistema deve estrarre nome, tipo, categoria e stato online.

**Validates: Requirements 2.2**

### Property 7: Identificazione Parametri Multipli

*Per qualsiasi* sensore Tuya con parametri multipli, il sistema deve identificare tutti i parametri disponibili nel campo status.

**Validates: Requirements 2.3**

### Property 8: Segnalazione Stato Offline

*Per qualsiasi* sensore con campo online=false, il sistema deve segnalare lo stato offline nell'interfaccia.

**Validates: Requirements 2.4**

### Property 9: Validazione Dati Ricevuti

*Per qualsiasi* dato ricevuto da Tuya API, il sistema deve validare che la struttura contenga i campi obbligatori (code, value, timestamp).

**Validates: Requirements 3.2**

### Property 10: Retry Logic su Fallimento

*Per qualsiasi* chiamata API che fallisce, il sistema deve ritentare fino a 3 volte con backoff esponenziale prima di segnalare errore definitivo.

**Validates: Requirements 3.4**

### Property 11: Preservazione Timestamp

*Per qualsiasi* dato Tuya con timestamp, il sistema deve preservare il timestamp originale senza modifiche.

**Validates: Requirements 3.5**

### Property 12: Trasformazione Tuya → SmartDevice

*Per qualsiasi* dato Tuya valido, il sistema deve trasformarlo in un oggetto SmartDevice con tutti i campi obbligatori popolati.

**Validates: Requirements 4.1, 4.5**

### Property 13: Mappatura Parametri Standard

*Per qualsiasi* parametro Tuya standard (temp_current, humidity_value, battery_percentage), il sistema deve mapparlo sul campo SmartDevice corrispondente applicando la trasformazione corretta.

**Validates: Requirements 4.2**

### Property 14: Metadata per Parametri Non Mappati

*Per qualsiasi* parametro Tuya senza mappatura diretta, il sistema deve salvarlo nel campo tuyaMetadata.rawStatus.

**Validates: Requirements 4.3**

### Property 15: Preservazione Unità di Misura

*Per qualsiasi* dato salvato, il sistema deve preservare l'unità di misura originale del sensore.

**Validates: Requirements 4.4**

### Property 16: Salvataggio Dati Storici

*Per qualsiasi* nuovo dato ricevuto dal sensore, il sistema deve salvarlo nella tabella sensor_historical_data con tutti i campi richiesti (device_id, parameter_code, parameter_value, parameter_unit, recorded_at).

**Validates: Requirements 5.1, 5.3**

### Property 17: Archiviazione Dati Vecchi

*Per qualsiasi* operazione di salvataggio che supera il limite di storage configurato, il sistema deve archiviare i dati più vecchi prima di inserire i nuovi.

**Validates: Requirements 5.5**

### Property 18: Visualizzazione Parametri Correnti

*Per qualsiasi* sensore connesso, l'interfaccia Smart_Hub deve mostrare i valori correnti di tutti i parametri disponibili.

**Validates: Requirements 6.1**

### Property 19: Visualizzazione Timestamp

*Per qualsiasi* parametro visualizzato, il sistema deve mostrare l'ultimo timestamp di aggiornamento.

**Validates: Requirements 6.3**

### Property 20: Indicatore Stato Offline

*Per qualsiasi* sensore offline, il sistema deve mostrare un indicatore visivo chiaro dello stato offline.

**Validates: Requirements 6.4**

### Property 21: Generazione Grafico Storico

*Per qualsiasi* parametro selezionato, il sistema deve generare un grafico con i dati dell'intervallo temporale richiesto.

**Validates: Requirements 7.1**

### Property 22: Filtro Intervallo Temporale

*Per qualsiasi* intervallo temporale selezionato (24h, 7d, 30d, 1y), il sistema deve filtrare i dati storici correttamente e aggiornare il grafico.

**Validates: Requirements 7.2, 7.3**

### Property 23: Calcolo Statistiche

*Per qualsiasi* intervallo temporale con dati, il sistema deve calcolare correttamente min, max e media dei valori.

**Validates: Requirements 7.4**

### Property 24: Aggregazione Dati Grandi

*Per qualsiasi* dataset con più di 1000 punti, il sistema deve aggregare i dati prima di visualizzarli nel grafico.

**Validates: Requirements 7.5**

### Property 25: Salvataggio Configurazione Soglie

*Per qualsiasi* soglia configurata per un parametro, il sistema deve salvarla nel database e recuperarla correttamente.

**Validates: Requirements 8.1**

### Property 26: Generazione Alert su Superamento Soglia

*Per qualsiasi* valore che supera la soglia configurata (min o max), il sistema deve generare un Threshold_Alert.

**Validates: Requirements 8.2**

### Property 27: Visualizzazione Notifica Alert

*Per qualsiasi* alert generato, il sistema deve mostrare una notifica nell'interfaccia utente.

**Validates: Requirements 8.3**

### Property 28: Configurazione Soglie Min/Max

*Per qualsiasi* parametro, il sistema deve permettere di configurare sia soglia minima che massima indipendentemente.

**Validates: Requirements 8.4**

### Property 29: Chiusura Automatica Alert

*Per qualsiasi* alert attivo, quando il valore rientra nell'intervallo normale (tra min e max), il sistema deve chiudere automaticamente l'alert.

**Validates: Requirements 8.5**

### Property 30: Selezione Automatica Fonte Dati

*Per qualsiasi* dispositivo, quando un sensore Tuya è connesso, il sistema deve utilizzare automaticamente i dati reali invece della simulazione.

**Validates: Requirements 9.2**

### Property 31: Indicazione Fonte Dati

*Per qualsiasi* dispositivo visualizzato, il sistema deve mostrare chiaramente se i dati provengono da fonte 'simulation' o 'tuya'.

**Validates: Requirements 9.4**

### Property 32: Sincronizzazione Cambio Modalità

*Per qualsiasi* cambio da modalità simulazione a reale, il sistema deve sincronizzare immediatamente i dati dal sensore Tuya.

**Validates: Requirements 9.5**

### Property 33: Export Multi-Formato

*Per qualsiasi* richiesta di export, il sistema deve supportare generazione in formato CSV e JSON.

**Validates: Requirements 10.2**

### Property 34: Completezza Dati Export

*Per qualsiasi* export generato, il file deve includere tutti i parametri richiesti con timestamp e unità di misura.

**Validates: Requirements 10.3**

### Property 35: Filtro Export per Parametri

*Per qualsiasi* export con filtro parametri, solo i parametri selezionati devono essere inclusi nel file.

**Validates: Requirements 10.4**

### Property 36: Disponibilità Link Download

*Per qualsiasi* export completato, il sistema deve fornire un link valido per il download del file.

**Validates: Requirements 10.5**

### Property 37: Utilizzo Cache su Fallimento Connessione

*Per qualsiasi* fallimento di connessione a Tuya Cloud API, il sistema deve utilizzare l'ultimo valore valido ricevuto dal cache.

**Validates: Requirements 11.1**

### Property 38: Indicatore Dati Cached

*Per qualsiasi* dato proveniente da cache (non aggiornato), il sistema deve mostrare un indicatore visivo di "dati non aggiornati".

**Validates: Requirements 11.2**

### Property 39: Sincronizzazione Post-Ripristino

*Per qualsiasi* ripristino di connessione dopo un fallimento, il sistema deve sincronizzare automaticamente i dati mancanti.

**Validates: Requirements 11.3**

### Property 40: Notifica Sensore Offline Prolungato

*Per qualsiasi* sensore offline per più di 10 minuti, il sistema deve inviare una notifica all'utente.

**Validates: Requirements 11.4**

### Property 41: Logging Errori

*Per qualsiasi* errore di connessione o API, il sistema deve loggare l'errore con timestamp e dettagli per debugging.

**Validates: Requirements 11.5**

### Property 42: Segnalazione Anomalie Dati

*Per qualsiasi* dato che differisce significativamente dai valori attesi (oltre 3 deviazioni standard), il sistema deve segnalare un'anomalia.

**Validates: Requirements 12.3**

### Property 43: Segnalazione Latenza Eccessiva

*Per qualsiasi* operazione di acquisizione dati con latenza superiore a 10 secondi, il sistema deve segnalare un problema di performance.

**Validates: Requirements 12.5**

### Property 44: Gestione Dispositivi Misti

*Per qualsiasi* lista di dispositivi contenente sia dispositivi simulati che reali, il sistema deve gestirli correttamente e distinguerli visivamente.

**Validates: Requirements 13.2, 13.3**

### Property 45: Ritorno a Simulazione

*Per qualsiasi* disattivazione dell'integrazione Tuya, il sistema deve tornare alla modalità simulazione senza errori o perdita di funzionalità.

**Validates: Requirements 13.5**

### Property 46: Supporto Multi-Sensore

*Per qualsiasi* numero di sensori Tuya fino a 10, il sistema deve gestirli tutti contemporaneamente senza degradazione.

**Validates: Requirements 14.1**

### Property 47: Personalizzazione Nome Sensore

*Per qualsiasi* nuovo sensore aggiunto, il sistema deve permettere di assegnare un nome personalizzato diverso dal nome Tuya originale.

**Validates: Requirements 14.2**

### Property 48: Identificazione Fonte Dato

*Per qualsiasi* dato visualizzato, il sistema deve mostrare chiaramente quale sensore specifico ha generato quel dato.

**Validates: Requirements 14.3**

### Property 49: Associazione Sensore-Zona

*Per qualsiasi* sensore, il sistema deve permettere di associarlo a una zona specifica dell'orto (garden zone).

**Validates: Requirements 14.4**

### Property 50: Preservazione Dati Sensore Rimosso

*Per qualsiasi* sensore rimosso, il sistema deve mantenere tutti i dati storici nel database ma segnalare il dispositivo come inattivo.

**Validates: Requirements 14.5**

### Property 51: Rate Limiting API Tuya

*Per qualsiasi* sequenza di chiamate API a Tuya Cloud, il sistema deve rispettare i limiti di rate (max 100 chiamate/minuto) implementando throttling.

**Validates: Requirements 15.4**

## Error Handling

### Gestione Errori API Tuya

**Errori di Autenticazione**:
- Token scaduto → Refresh automatico del token
- Credenziali invalide → Messaggio errore chiaro all'utente
- Rate limit superato → Attesa automatica e retry

**Errori di Rete**:
- Timeout → Retry con backoff esponenziale (1s, 2s, 4s)
- Connessione persa → Utilizzo cache + indicatore "dati non aggiornati"
- DNS failure → Fallback a cache + notifica utente

**Errori Dispositivo**:
- Dispositivo offline → Indicatore visivo + notifica se > 10 minuti
- Dispositivo rimosso da account Tuya → Segnalazione + mantenimento dati storici
- Dati malformati → Validazione + logging + skip del dato

### Gestione Errori Database

**Errori di Connessione**:
- Connection pool esaurito → Retry con timeout
- Query timeout → Rollback transazione + retry
- Constraint violation → Logging + messaggio errore specifico

**Errori di Storage**:
- Disco pieno → Archiviazione automatica dati vecchi
- Limite righe superato → Partitioning automatico tabella
- Corruzione dati → Backup recovery + notifica admin

### Fallback e Resilienza

**Strategia di Fallback**:
1. Tentativo chiamata API Tuya
2. Se fallisce → Retry fino a 3 volte
3. Se ancora fallisce → Utilizzo cache locale
4. Se cache vuota → Modalità degradata (solo visualizzazione dati storici)
5. Notifica utente dello stato degradato

**Cache Strategy**:
- Cache in-memory per ultimi 5 minuti di dati
- Cache su database per ultimi 24 ore
- TTL cache: 5 minuti in condizioni normali, infinito in caso di errore

## Testing Strategy

### Approccio Dual Testing

Il sistema utilizzerà sia unit test che property-based test per garantire copertura completa:

**Unit Tests**: Verificano esempi specifici, edge case e condizioni di errore
**Property Tests**: Verificano proprietà universali su input generati randomicamente

Entrambi sono complementari e necessari per una copertura completa.

### Property-Based Testing

**Libreria**: Utilizzeremo `fast-check` per TypeScript/JavaScript

**Configurazione**:
- Minimo 100 iterazioni per test
- Seed fisso per riproducibilità
- Shrinking automatico per trovare input minimi che causano fallimenti

**Tag Format**: Ogni property test deve includere un commento:
```typescript
// Feature: tuya-iot-integration, Property 12: Trasformazione Tuya → SmartDevice
// Per qualsiasi dato Tuya valido, il sistema deve trasformarlo in SmartDevice
```

### Generatori Custom

**TuyaDeviceStatusGenerator**:
```typescript
const tuyaDeviceStatusArb = fc.record({
  code: fc.constantFrom('temp_current', 'humidity_value', 'battery_percentage'),
  value: fc.integer({ min: 0, max: 1000 }),
  timestamp: fc.date().map(d => d.getTime())
})
```

**TuyaDeviceInfoGenerator**:
```typescript
const tuyaDeviceInfoArb = fc.record({
  id: fc.hexaString({ minLength: 20, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.constantFrom('wsdcg', 'kg', 'pc'),
  online: fc.boolean(),
  status: fc.array(tuyaDeviceStatusArb, { minLength: 1, maxLength: 10 })
})
```

### Test di Integrazione

**Test con Sensore Reale**:
1. Configurare credenziali Tuya di test
2. Connettere sensore fisico dell'utente
3. Acquisire dati per 24 ore continue
4. Verificare:
   - Latenza media < 5 secondi
   - Nessuna perdita di dati
   - Corretta mappatura parametri
   - Salvataggio corretto su database

**Test di Stress**:
- Simulare 10 sensori contemporaneamente
- Generare 1000 aggiornamenti/minuto
- Verificare performance UI < 2 secondi
- Verificare nessun memory leak

### Test di Compatibilità

**Regressione Smart Hub**:
- Verificare che tutte le funzionalità esistenti continuino a funzionare
- Test con dispositivi simulati
- Test con mix simulati + reali
- Test di switch tra modalità

### Coverage Target

- **Unit Test Coverage**: > 80% delle linee di codice
- **Property Test Coverage**: 100% delle correctness properties
- **Integration Test Coverage**: Tutti i flussi critici end-to-end

## Implementation Notes

### Sicurezza

**Criptazione Credenziali**:
- Utilizzare `crypto.subtle` API per criptazione AES-256-GCM
- Chiave di criptazione derivata da master key in variabili ambiente
- Salt unico per ogni utente

**Protezione API Key**:
- Mai esporre credenziali Tuya nel client
- Tutte le chiamate Tuya tramite API route Next.js
- Rate limiting per prevenire abuso

### Performance

**Ottimizzazioni**:
- Batch insert per dati storici (max 100 record per query)
- Indici database su (device_id, recorded_at)
- Connection pooling Supabase (max 10 connessioni)
- Debouncing aggiornamenti UI (max 1 update/secondo)

**Caching**:
- Redis per cache distribuita (opzionale, per scalabilità futura)
- In-memory cache per sessione utente corrente
- Cache invalidation su cambio configurazione

### Monitoring

**Metriche da Tracciare**:
- Latenza chiamate API Tuya (p50, p95, p99)
- Tasso di successo/fallimento chiamate
- Numero dispositivi attivi per utente
- Dimensione database dati storici
- Errori di sincronizzazione

**Alerting**:
- Alert se latenza > 10 secondi per 5 minuti consecutivi
- Alert se tasso fallimento > 10% per 10 minuti
- Alert se disco database > 80% pieno

## Deployment Strategy

### Rollout Graduale

**Fase 1 - Beta Testing** (Settimana 1-2):
- Deploy su ambiente staging
- Test con sensore reale dell'utente
- Raccolta feedback e fix bug critici

**Fase 2 - Limited Release** (Settimana 3):
- Feature flag per abilitare solo per utenti beta
- Monitoraggio intensivo metriche
- Raccolta feedback utenti

**Fase 3 - General Availability** (Settimana 4):
- Abilitazione per tutti gli utenti
- Documentazione utente completa
- Supporto attivo per onboarding

### Rollback Plan

In caso di problemi critici:
1. Disabilitare feature flag integrazione Tuya
2. Sistema torna automaticamente a modalità simulazione
3. Nessuna perdita di dati (dati storici preservati)
4. Fix issue e re-deploy

### Database Migrations

**Migration Strategy**:
- Migrations incrementali con Supabase
- Nessuna modifica a tabelle esistenti
- Solo aggiunta nuove tabelle
- Rollback sicuro (drop nuove tabelle)

## Future Enhancements

### Possibili Estensioni Future

1. **Supporto Altri Provider IoT**:
   - Architettura estendibile per aggiungere Zigbee, Z-Wave, MQTT
   - Interface comune per tutti i provider

2. **Machine Learning su Dati Storici**:
   - Predizione valori futuri
   - Anomaly detection automatica
   - Ottimizzazione soglie alert

3. **Automazioni Avanzate**:
   - Trigger basati su combinazioni di sensori
   - Integrazione con valvole per irrigazione automatica
   - Scenari programmabili

4. **Dashboard Analytics Avanzato**:
   - Correlazione tra parametri
   - Heatmap temporali
   - Export report PDF

5. **Mobile App Nativa**:
   - Notifiche push per alert
   - Widget home screen con dati real-time
   - Controllo offline con sincronizzazione

## Appendix

### Tuya API Endpoints Utilizzati

```
POST /v1.0/token
  → Ottenere access token

GET /v1.0/users/{uid}/devices
  → Lista dispositivi utente

GET /v1.0/devices/{device_id}
  → Dettagli dispositivo specifico

GET /v1.0/devices/{device_id}/status
  → Status corrente dispositivo

POST /v1.0/devices/{device_id}/commands
  → Inviare comandi al dispositivo
```

### Codici Parametri Tuya Standard

| Codice | Tipo | Descrizione | Range |
|--------|------|-------------|-------|
| `temp_current` | Integer | Temperatura × 10 (°C) | -400 to 1000 |
| `humidity_value` | Integer | Umidità relativa (%) | 0 to 100 |
| `battery_percentage` | Integer | Livello batteria (%) | 0 to 100 |
| `bright_value` | Integer | Luminosità (lux) | 0 to 100000 |
| `co2_value` | Integer | CO2 (ppm) | 0 to 5000 |
| `pm25_value` | Integer | PM2.5 (μg/m³) | 0 to 999 |

### Riferimenti

- [Tuya Cloud API Documentation](https://developer.tuya.com/en/docs/cloud/)
- [Tuya OAuth 2.0 Guide](https://developer.tuya.com/en/docs/cloud/oauth-management)
- [Fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Supabase Encryption Best Practices](https://supabase.com/docs/guides/database/vault)
