# Tuya IoT Integration - Session Summary

**Data**: 16 Gennaio 2026  
**Obiettivo**: Setup integrazione Tuya RF:433 Wireless Water Timer

---

## ✅ Completato

### 1. Identificazione Dispositivo
- **Nome**: Timer acqua RF
- **Device ID**: `bfe9bb2e1df0b298a1wr8`
- **Tipo**: RF:433 (Radio Frequency 433 MHz)
- **Gateway**: Gateway Sub-GHz
- **Stato**: Online (segnale eccellente -52dBm)

### 2. Configurazione Credenziali
Aggiunte in `.env.local`:
```bash
TUYA_CLIENT_ID=a4syyyy7y3p5dnjfcpee
TUYA_CLIENT_SECRET=3b04319928f942a68cf3fbab4cc94dc0
TUYA_REGION=eu
TUYA_PROJECT_CODE=p1768555490796nn5su9
TUYA_DEVICE_ID=bfe9bb2e1df0b298a1wr8
```

### 3. Pagina Smart Hub Semplificata
Creata `app/app/smart-simple/page.tsx`:
- Form configurazione credenziali
- UI pulita senza dipendenze shadcn/ui
- Simulazione stato dispositivo
- Pronta per integrazione reale

### 4. Script Recupero Dispositivi
Creato `scripts/get-tuya-devices.cjs`:
- Autenticazione Tuya Cloud API
- Recupero lista dispositivi
- Visualizzazione dettagli
- **Problema**: Errore "sign invalid" su API devices (comune con Tuya)

### 5. Documentazione Completa
Creati 5 documenti:
- `TUYA_QUICK_START.md` - Guida rapida
- `TUYA_IOT_SETUP_GUIDE.md` - Guida completa
- `TUYA_DEVICE_CONFIGURED.md` - Info dispositivo
- `TUYA_READY_TO_TEST.md` - Istruzioni test
- `PUSH_SUCCESS_JAN16_TUYA.md` - Summary tecnico

---

## ⏳ In Corso

### Autorizzazione API Tuya IoT Platform

L'utente sta configurando l'autorizzazione nel progetto Tuya:

**Tipo**: Third-Party Project Authorization

**Campi da compilare**:
- **Authorized Project**: `p1768555490796nn5su9`
- **Remarks**: Autorizzazione per OrtoMio web app
- **Authorized APIs**: 
  - ✅ IoT Core (Device Management, Control, Status)
  - ✅ Smart Home Basic Service
  - ✅ Authorization Token Management
  - Oppure: "Allow Access to My Project Data by Any API"

**Perché necessario**: Senza questa autorizzazione, le chiamate API per recuperare e controllare i dispositivi falliscono con errori di permessi.

---

## 🔍 Problema Identificato

### Smart Hub Pagina Completa

La pagina originale `app/app/smart/page.tsx` ha problemi di rendering in locale.

**Prossimo Step**: 
1. Aprire http://localhost:3002/app/smart
2. Identificare l'errore specifico (console browser)
3. Fixare il problema

**File coinvolti**:
- `app/app/smart/page.tsx` - Pagina principale
- `components/smart/IntegratedSmartHub.tsx` - Componente Smart Hub

---

## 📊 Architettura Proposta

### Flusso Dati Real-Time

```
Timer acqua RF (433MHz)
    ↓
Gateway Sub-GHz (Tuya)
    ↓
Tuya Cloud API
    ↓
OrtoMio API Route (/api/tuya/*)
    ↓
TuyaIntegrationService
    ↓
Supabase Database
    ↓
IntegratedSmartHub UI
```

### Componenti da Implementare

1. **TuyaCloudAPIClient** (`services/tuyaCloudAPIClient.ts`)
   - Autenticazione OAuth 2.0
   - Chiamate API dispositivi
   - Rate limiting e retry logic

2. **TuyaIntegrationService** (`services/tuyaIntegrationService.ts`)
   - Orchestrazione
   - Mappatura dati Tuya → SmartDevice
   - Sincronizzazione periodica
   - Cache per resilienza

3. **API Routes Next.js**
   - `/api/tuya/credentials` - Gestione credenziali
   - `/api/tuya/devices` - Lista dispositivi
   - `/api/tuya/sync` - Sincronizzazione dati
   - `/api/tuya/control` - Controllo dispositivi

4. **Database Tables**
   - `tuya_credentials` - Credenziali criptate
   - `tuya_device_mappings` - Mappatura dispositivi
   - `sensor_historical_data` - Dati storici
   - `tuya_sync_log` - Log sincronizzazioni

---

## 🎯 Funzionalità Target

### Fase 1: Connessione Base (1-2 settimane)
- ✅ Autenticazione Tuya Cloud
- ✅ Recupero lista dispositivi
- ✅ Lettura stato dispositivo real-time
- ✅ Controllo remoto valvola (apri/chiudi)

### Fase 2: Dati Storici (1 settimana)
- Salvataggio dati su Supabase
- Grafici storici (24h, 7d, 30d, 1y)
- Statistiche (min, max, media)

### Fase 3: Funzionalità Avanzate (1-2 settimane)
- Sistema alert con soglie configurabili
- Export dati (CSV, JSON)
- Supporto multi-sensore (fino a 10 dispositivi)
- Associazione sensore-zona orto

### Fase 4: Testing e Deploy (1 settimana)
- Testing 24h con dispositivo reale
- Gestione errori e resilienza
- Documentazione utente
- Deployment graduale

**Totale stimato**: 4-6 settimane per implementazione completa

---

## 📝 Note Tecniche

### Protocollo RF:433
- Comunicazione wireless a basso consumo
- Range: 30-100 metri
- Batteria: 6-12 mesi tipici
- Gateway necessario per internet

### Sicurezza
- Credenziali criptate AES-256-GCM
- Comunicazione HTTPS
- Token OAuth 2.0 con refresh automatico
- Rate limiting API

### Performance
- Polling: 30s attivo, 5min inattivo
- Cache: 5 min in-memory, 24h database
- Batch insert per dati storici
- Aggregazione per grafici > 1000 punti

---

## 🚀 Prossimi Step Immediati

1. ✅ **Completare autorizzazione API** su Tuya IoT Platform
2. 🔍 **Identificare errore** pagina Smart Hub completa
3. 🔧 **Fixare problema** rendering
4. ✅ **Testare connessione** con dispositivo reale
5. 📝 **Decidere** se procedere con implementazione completa

---

## 📚 Risorse

### Documentazione
- Spec completa: `.kiro/specs/tuya-iot-integration/`
- Requirements: 15 requirements dettagliati
- Design: Architettura tecnica completa
- Tasks: 22 task implementazione

### API Tuya
- Base URL: `https://openapi.tuyaeu.com`
- Region: Western Europe (eu)
- Autenticazione: OAuth 2.0
- Rate Limit: 100 chiamate/minuto

### Parametri Water Timer
| Parametro | Descrizione | Tipo |
|-----------|-------------|------|
| `switch` | Stato valvola | Boolean |
| `battery_percentage` | Batteria (%) | Integer 0-100 |
| `countdown` | Timer (secondi) | Integer |
| `work_state` | Stato operativo | String |

---

**Status**: Setup completato, in attesa di completare autorizzazione API e identificare errore pagina Smart Hub completa.
