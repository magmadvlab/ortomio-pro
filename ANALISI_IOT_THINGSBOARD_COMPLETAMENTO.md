# 📊 ANALISI COMPLETA SISTEMA IoT - COMPLETAMENTO CON THINGSBOARD

**Data**: 7 Febbraio 2026  
**Stato Attuale**: Parte IoT **Parzialmente Implementata**  
**Obiettivo**: Completare integrazione con **ThingsBoard** anzichè solo Tuya

---

## 🔍 ANALISI DELLO STATO ATTUALE

### ✅ Cosa È IMPLEMENTATO

1. **Backend Tuya (Parziale)**
   - Credenziali Tuya Cloud configurate in `.env.local`
   - Script `scripts/get-tuya-devices.js` per recupero Device ID
   - Device ID configurato: `bfe9bb2e1df0b298a1wr8` (Timer acqua RF)
   - Specifica tecnica completa in `.kiro/specs/tuya-iot-integration/`

2. **Componente Frontend (Completo)**
   - `components/smart/IntegratedSmartHub.tsx` - 940 righe
   - Supporta dispositivi IoT base (switch, parametri)
   - Integrazione con ActionButton e InterventionWizard
   - UI per visualizzazione dati e controllo remotoffc
   - Supporta Drone e operazioni multiple

3. **Strutture Dati**
   - Tipo `SmartDevice` in `types/index.ts`
   - Database schema per dispositivi IoT
   - Supporto real-time alerts

4. **Funzionalità Integrate**
   - ✅ Plant health monitoring
   - ✅ AI predictions system
   - ✅ Nutrition tracking
   - ✅ Drone operations
   - ✅ Action buttons framework

### ❌ Cosa MANCA

1. **Connettore Tuya Completo**
   - ❌ `TuyaCloudAPIClient` non implementato
   - ❌ `TuyaIntegrationService` non implementato
   - ❌ API routes per Tuya non create
   - ❌ Real-time sync non attivo
   - ❌ Data validation incomplete

2. **Funzionalità Avanzate IoT**
   - ❌ Grafici storici dati sensori
   - ❌ Export dati (CSV/JSON)
   - ❌ Threshold alerts sistema
   - ❌ Gestione multi-dispositivi scalabile
   - ❌ Caching e resilienza

3. **ThingsBoard (NON IMPLEMENTATO)**
   - ❌ Connessione MQTT/REST a ThingsBoard
   - ❌ Device provisioning in ThingsBoard
   - ❌ Rules engine integration
   - ❌ Dashboard ThingsBoard
   - ❌ Analytics avanzate

4. **Infrastruttura**
   - ❌ Database migrations per sensori
   - ❌ Tabelle storage storico
   - ❌ Background jobs per polling
   - ❌ Error handling e resilienza
   - ❌ Rate limiting

---

## 🎯 WHY THINGSBOARD INSTEAD OF TUYA-ONLY?

### Vantaggi ThingsBoard vs Solo Tuya

| Aspetto | Tuya Only | ThingsBoard |
|---------|-----------|------------|
| **Multi-Provider** | Solo Tuya | ✅ Tuya, Google, AWS, Azure, LoRaWAN, Zigbee, etc. |
| **Rules Engine** | Limitato | ✅ Automazioni avanzate |
| **Dashboard** | App Tuya | ✅ Dashboard customizzabile full-control |
| **Analytics** | Basic | ✅ Advanced analytics e ML |
| **Open Source** | ❌ Closed | ✅ Open source (opzione self-hosted) |
| **API** | REST limited | ✅ Complete REST + MQTT |
| **Scalabilità** | ~10 dispositivi | ✅ Migliaia di dispositivi |
| **Costo** | Pay per feature | ✅ Free self-hosted o cloud economico |
| **Controllo Dati** | Tuya cloud | ✅ Your server (privacy compliance) |
| **Integrazione AI** | ❌ | ✅ Custom integrations |

**Decisione**: ThingsBoard come **hub centrale**, Tuya come **gateway device**

---

## 🏗️ ARCHITETTURA PROPOSTA

### Stack Completo IoT

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (OrtoMio)                       │
│         IntegratedSmartHub.tsx + Componenti IoT                 │
│    Charts, Analytics, Control, Alerts, Device Management        │
└─────────────────────────────────────────────────────────────────┘
                              ↑↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js + Supabase)                 │
│   ┌──────────────────┐      ┌──────────────────┐                │
│   │   OrtoMio API    │←────→│  ThingsBoard API │                │
│   │  - Device Mgmt   │      │  - Telemetry    │                │
│   │  - Alerts        │      │  - Rules Engine │                │
│   │  - Analytics     │      │  - Dashboards   │                │
│   └──────────────────┘      └──────────────────┘                │
│         ↓                           ↓                             │
│    ┌─────────────────┐      ┌──────────────────┐               │
│    │  Supabase DB    │      │ ThingsBoard DB   │               │
│    │  - Devices      │      │ - Telemetry     │               │
│    │  - Alerts       │      │ - Rules         │               │
│    │  - History      │      │ - Dashboards    │               │
│    └─────────────────┘      └──────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│              DISPOSITIVI + GATEWAY (Hardware Layer)              │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐   │
│  │ Tuya Timer  │  │ LoRaWAN  │  │  Zigbee    │  │  MQTT    │   │
│  │ (Sensore)   │  │ (Multi)  │  │ (Garden)   │  │ (Custom) │   │
│  └─────────────┘  └──────────┘  └────────────┘  └──────────┘   │
│         │                │              │             │          │
│         └────────────────┴──────────────┴─────────────┘          │
│                          │                                        │
│                    ThingsBoard Gateway                            │
│            (MQTT Broker + Device Mgmt)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Flusso Dati Realtime

```
Sensore IoT → ThingsBoard MQTT → ThingsBoard Server
                                      ↓
                               ✅ Telemetry Storage
                               ✅ Rules Engine
                               ✅ Alerts Trigger
                                      ↓
                    ┌────────────────┬────────────────┐
                    ↓                ↓                 ↓
            Next.js API Routes   Webhooks         WebSocket
                    ↓                ↓                 ↓
            Supabase Update   Alert Notification  Real-time UI
                    ↓                ↓                 ↓
            ┌────────────────────────┴─────────────────┐
            ↓
    IntegratedSmartHub Dashboard
    - Live charts
    - Device controls
    - Alerts display
    - Analytics
```

---

## 📋 COMPONENTI DA IMPLEMENTARE

### FASE 1: Infrastruttura ThingsBoard (2-3 giorni)

#### 1.1 Setup ThingsBoard
- [ ] Configurare ThingsBoard (Cloud o Self-Hosted)
- [ ] Creare tenant OrtoMio
- [ ] Configurare API token
- [ ] Setup MQTT broker
- [ ] Configurare SSL/TLS

#### 1.2 Creazione Device Types
- [ ] Device Type: "Smart Irrigation" (valvole, timer)
- [ ] Device Type: "Environmental Sensor" (temp, umidità, luce)
- [ ] Device Type: "Soil Monitor" (pH, EC, umidità)
- [ ] Device Type: "Weather Station" (meteo)
- [ ] Device Type: "Drone" (telemetria)

#### 1.3 Setup Gateway
- [ ] Installare ThingsBoard MQTT Broker
- [ ] Configurare Tuya connector in ThingsBoard
- [ ] Configurare LoRaWAN gateway (opzionale)
- [ ] Setup Zigbee gateway (opzionale)

### FASE 2: Backend Integration (3-4 giorni)

#### 2.1 Servizi Core
```typescript
// services/thingsboard/ThingsboardAPIClient.ts
- Authentication (OAuth/API Token)
- Device management (CRUD)
- Telemetry push
- Attribute management
- RPC commands

// services/thingsboard/TelemetryService.ts
- Receive telemetry from TB
- Process and validate data
- Store in Supabase
- Trigger alerts
- Generate events

// services/thingsboard/RulesService.ts
- Create rule chains
- Escalation logic
- Smart automations
- Notifications

// services/thingsboard/AlertService.ts
- Threshold monitoring
- Alert generation
- Alert persistence
- Alert notifications
```

#### 2.2 Database Schema
```sql
-- Storage sensori IoT
CREATE TABLE iot_devices (
  id UUID PRIMARY KEY,
  garden_id UUID REFERENCES gardens(id),
  device_id STRING, -- ThingsBoard device ID
  name STRING,
  type STRING, -- Smart Irrigation, Env Sensor, etc
  provider STRING, -- tuya, mqtt, lora, etc
  status STRING, -- online, offline, error
  config JSONB, -- Device configuration
  attributes JSONB, -- ThingsBoard attributes
  last_telemetry_at TIMESTAMP,
  battery_level INT,
  signal_strength INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Storage dati storici telemetria
CREATE TABLE iot_telemetry (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES iot_devices(id),
  parameter STRING, -- temperature, humidity, switch, etc
  value NUMERIC,
  unit STRING,
  timestamp TIMESTAMP,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  INDEX ON (device_id, parameter, timestamp)
);

-- Storage alerts
CREATE TABLE iot_alerts (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES iot_devices(id),
  type STRING, -- threshold, connection, error
  severity STRING, -- critical, warning, info
  message STRING,
  value NUMERIC,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  acknowledged_by_user_id UUID,
  created_at TIMESTAMP
);

-- Storage soglie configurabili
CREATE TABLE iot_thresholds (
  id UUID PRIMARY KEY,
  device_id UUID REFERENCES iot_devices(id),
  parameter STRING,
  min_value NUMERIC,
  max_value NUMERIC,
  alert_enabled BOOLEAN,
  notification_enabled BOOLEAN,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 2.3 API Routes (`app/api/iot/`)
```
/api/iot/
  ├── /devices
  │   ├── GET (list)
  │   ├── POST (create)
  │   └── /[id]
  │       ├── GET (detail)
  │       ├── PUT (update)
  │       ├── DELETE (remove)
  │       └── /telemetry
  │           ├── GET (history)
  │           └── POST (push)
  ├── /alerts
  │   ├── GET (list)
  │   ├── POST (acknowledge)
  │   └── /[id]/settings
  │       └── PUT (update thresholds)
  ├── /thresholds
  │   ├── GET (list)
  │   ├── POST (create)
  │   └── /[id]
  │       ├── PUT (update)
  │       └── DELETE (remove)
  ├── /webhooks
  │   └── POST (receive ThingsBoard events)
  └── /sync
      └── POST (force sync)
```

### FASE 3: Frontend Components (2-3 giorni)

#### 3.1 Componenti Nuovi
```typescript
// components/iot/IoTDeviceCard.tsx
- Display device status
- Show current values
- Quick controls
- Battery indicator
- Connection status

// components/iot/IoTChart.tsx
- Historical data visualization
- Multiple parameters
- Time range selector
- Aggregation options
- Export button

// components/iot/IoTAlertManager.tsx
- List active alerts
- Acknowledge alerts
- Configure thresholds
- Set notification preferences

// components/iot/IoTDeviceWizard.tsx
- Add new device
- Configure thresholds
- Select parameters to monitor
- Setup alerts

// components/iot/IoTDashboard.tsx
- Overview all devices
- Device grid layout
- Quick stats (online/offline)
- Recent alerts
- System health
```

#### 3.2 Modifche a IntegratedSmartHub.tsx
```typescript
- Import IoT components
- Add IoT tab
- Real-time telemetry display
- Alert integration
- Historical charts
- Device management UI
```

### FASE 4: Real-time Sync & Automation (2 giorni)

#### 4.1 Background Services
```typescript
// services/iot/TelemetryPollingService.ts
- Poll ThingsBoard API
- Intelligent polling (active/inactive modes)
- Cache management
- Error handling with retries

// services/iot/WebSocketService.ts
- WebSocket connection to ThingsBoard
- Real-time telemetry streaming
- Auto-reconnection
- Data validation

// services/iot/AlertTriggerService.ts
- Monitor thresholds in real-time
- Generate alerts
- Send notifications
- Create tasks for interventions
```

#### 4.2 Automation Rules
```
Rule 1: Temperature Alert
  IF temperature > max_threshold
  THEN create alert + send notification + suggest intervention

Rule 2: Low Battery Alert
  IF battery_level < 20%
  THEN create warning alert + suggest replacement

Rule 3: Device Offline
  IF device not reporting for 5 min
  THEN mark offline + create alert

Rule 4: Smart Irrigation
  IF soil_humidity < min_threshold AND weather != rainy
  THEN create irrigation task + suggest valve opening

Rule 5: Health Integration
  IF parameter indicates stress
  THEN create health alert in plant monitoring system
```

---

## 📊 ROADMAP IMPLEMENTAZIONE

### Week 1: Foundation (7-14 Feb)
- **Day 1-2**: ThingsBoard setup + device types
- **Day 3-4**: Backend services core + API routes
- **Day 5-7**: Database schema + migrations
- **Deliverable**: Fully functional backend + basic UI

### Week 2: Advanced Features (14-21 Feb)
- **Day 1-2**: Real-time sync + WebSocket
- **Day 3-4**: Advanced charts + analytics
- **Day 5-7**: Automation rules + alerts
- **Deliverable**: Complete real-time system

### Week 3: Polish & Deploy (21-28 Feb)
- **Day 1-2**: Testing + edge cases
- **Day 3-4**: Documentation + user guides
- **Day 5-7**: Deployment + monitoring
- **Deliverable**: Production-ready IoT platform

---

## 🔧 TECHNICAL REQUIREMENTS

### Hardware
- **ThingsBoard Server**: 2GB RAM, 10GB Storage (minimum)
- **MQTT Broker**: CPU 2-4 cores, 2GB RAM
- **IoT Devices**: Support MQTT, HTTP, or custom protocols

### Software Stack
```
Backend:
- Next.js 16+ (existing)
- Supabase PostgreSQL (existing)
- ThingsBoard REST/MQTT APIs (new)
- Node.js 22+ (existing)

Frontend:
- React 19+ (existing)
- Recharts for charts (existing)
- Lucide icons (existing)
- TailwindCSS (existing)

Infrastructure:
- ThingsBoard Cloud or Self-Hosted
- MQTT Broker (Mosquitto or TB internal)
- Docker for containerization
```

### Dependencies to Add
```json
{
  "mqtt": "^5.3.0",
  "axios": "^1.6.0",
  "ws": "^8.14.0",
  "date-fns": "^2.30.0",
  "recharts": "^2.10.0"
}
```

---

## 💰 COST ANALYSIS

### Option 1: ThingsBoard Cloud (SaaS)
- **Startup**: Free tier (1 device)
- **Production**: $99-299/month for 100-1000 devices
- **Advantage**: No infrastructure management

### Option 2: Self-Hosted ThingsBoard
- **Server Cost**: $5-20/month (VPS)
- **Setup Time**: 4-8 hours
- **Advantage**: Full control, better privacy

### Option 3: Hybrid (Recommended)
- **Development**: Cloud free tier
- **Production**: Self-hosted on existing infrastructure
- **Cost**: Same as self-hosted, better experience

**Budget Estimate**: €50-200/month OR one-time setup €200-500

---

## 🚀 NEXT IMMEDIATE STEPS

1. **Today (7 Feb)**
   - ✅ Review this analysis
   - ✅ Decide: Cloud vs Self-Hosted ThingsBoard
   - ✅ Allocate 3 weeks development time

2. **Tomorrow (8 Feb)**
   - Setup ThingsBoard (cloud or server)
   - Create tenant + API credentials
   - Configure device types

3. **This Week**
   - Begin FASE 1 implementation
   - Create database migrations
   - Implement backend services

4. **Next Week**
   - API routes + integration
   - Frontend components
   - Real-time sync

---

## 📚 REFERENCES & DOCUMENTATION

### Official Docs
- [ThingsBoard Documentation](https://thingsboard.io/docs/)
- [ThingsBoard REST API](https://thingsboard.io/docs/reference/http-api/)
- [ThingsBoard MQTT API](https://thingsboard.io/docs/reference/mqtt-api/)
- [Tuya Open Platform](https://developer.tuya.com/en/docs/)

### Repository Files
- `.kiro/specs/tuya-iot-integration/requirements.md` - Complete requirements
- `.kiro/specs/tuya-iot-integration/design.md` - Technical design
- `.kiro/specs/tuya-iot-integration/tasks.md` - Task breakdown
- `TUYA_IOT_SETUP_GUIDE.md` - Current Tuya setup
- `TUYA_DEVICE_CONFIGURED.md` - Device configuration

### Existing Code
- `components/smart/IntegratedSmartHub.tsx` - UI base
- `types/index.ts` - Data types
- `services/` - Backend services structure
- `app/api/` - API routes base

---

## ✅ COMPLETION CHECKLIST

### Backend Infrastructure
- [ ] ThingsBoard server deployed + configured
- [ ] MQTT broker operational
- [ ] API credentials generated
- [ ] Device types created in ThingsBoard
- [ ] Tuya connector configured (if using)

### Database
- [ ] Migration files created
- [ ] iot_devices table
- [ ] iot_telemetry table
- [ ] iot_alerts table
- [ ] iot_thresholds table

### Services
- [ ] ThingsboardAPIClient
- [ ] TelemetryService
- [ ] AlertService
- [ ] RulesService
- [ ] WebSocket service

### API Routes
- [ ] /api/iot/devices/*
- [ ] /api/iot/alerts/*
- [ ] /api/iot/thresholds/*
- [ ] /api/iot/webhooks
- [ ] /api/iot/sync

### Components
- [ ] IoTDeviceCard
- [ ] IoTChart
- [ ] IoTAlertManager
- [ ] IoTDeviceWizard
- [ ] IoTDashboard
- [ ] IntegratedSmartHub updates

### Testing
- [ ] Unit tests for services
- [ ] Integration tests
- [ ] E2E testing
- [ ] Real device testing
- [ ] Load testing

### Documentation
- [ ] Setup guide
- [ ] API documentation
- [ ] User manual
- [ ] Troubleshooting guide
- [ ] Architecture diagrams

---

## 🎯 SUCCESS METRICS

When complete, OrtoMio will have:

✅ **Real-time IoT data acquisition** < 5s latency  
✅ **Multi-device support** - Scalable to 100+ devices  
✅ **Advanced analytics** - Historical data + trends  
✅ **Intelligent alerts** - Threshold-based automation  
✅ **Professional dashboard** - Complete device management  
✅ **Open platform** - Support for multiple device types  
✅ **Enterprise-ready** - Self-hosted or cloud deployment  
✅ **AI integration** - Smart suggestions + automations  
✅ **Market advantage** - Complete agriculture 4.0 solution  

---

**Status**: 🔴 NOT STARTED - Ready for implementation  
**Complexity**: MEDIUM-HIGH  
**Time Required**: 3 weeks full-time development  
**Team**: 1-2 developers  

**Ready to begin? Let's start! 🚀**
