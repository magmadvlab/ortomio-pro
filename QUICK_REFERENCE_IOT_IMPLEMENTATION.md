# 🔍 QUICK REFERENCE - IoT ThingsBoard Integration

**Documento**: Fast lookup reference  
**Target**: Developers durante implementazione

---

## 📚 DOCUMENT MAP

Leggi questi documenti in questo ordine:

```
1. 📋 SOMMARIO_ESECUTIVO_IOT_THINGSBOARD.md (5 min)
   └─ Quick overview, business case, approval

2. 📊 ANALISI_IOT_THINGSBOARD_COMPLETAMENTO.md (20 min)
   └─ Complete system analysis, architecture, requirements

3. 🎯 COMPARAZIONE_STRATEGICA_TUYA_VS_THINGSBOARD.md (15 min)
   └─ Why ThingsBoard vs alternatives

4. 📋 PROSSIMI_STEP_IOT_IMPLEMENTATION.md (20 min)
   └─ Decisions, action items, WBS

5. 🔨 PIANO_IMPLEMENTAZIONE_IOT_THINGSBOARD_DETTAGLIATO.md (30 min)
   └─ Step-by-step implementation guide

6. 🔍 QUESTO DOCUMENTO (5 min)
   └─ Quick reference and checklists
```

---

## ⚡ QUICK LINKS

### Credenziali & Access

```
ThingsBoard Cloud: https://thingsboard.cloud
ThingsBoard GitHub: https://github.com/thingsboard/thingsboard
Community Forum: https://community.thingsboard.io/

Documentazione:
- REST API: https://thingsboard.io/docs/reference/http-api/
- MQTT API: https://thingsboard.io/docs/reference/mqtt-api/
- Device Protocol: https://thingsboard.io/docs/reference/device-connectivity/

Tuya Integration:
- Tuya Developer: https://developer.tuya.com/en/docs/
- Tuya Cloud API: https://developer.tuya.com/en/docs/cloud/api-reference
```

### Credenziali Tuya Attuali

```
Client ID:      a4syyyy7y3p5dnjfcpee
Region:         eu
Device ID:      bfe9bb2e1df0b298a1wr8
Device Name:    Timer acqua RF

⚠️ KEEP SECURE - Store only in .env.local
```

---

## 🔧 ENVIRONMENT VARIABLES

### Aggiungi a `.env.local`

```bash
# ThingsBoard Configuration
THINGSBOARD_URL=http://localhost:8080              # or cloud URL
THINGSBOARD_API_TOKEN=YOUR_TOKEN_HERE              # From ThingsBoard
THINGSBOARD_TENANT_ID=YOUR_TENANT_ID               # Your tenant

# MQTT Configuration  
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_password

# IoT Settings
IOT_POLLING_INTERVAL_ACTIVE=30000                  # 30 seconds
IOT_POLLING_INTERVAL_INACTIVE=300000               # 5 minutes
IOT_DATA_RETENTION_DAYS=365
IOT_ALERT_CHECK_INTERVAL=10000                     # 10 seconds

# Tuya Configuration (dual-mode)
TUYA_CLIENT_ID=a4syyyy7y3p5dnjfcpee
TUYA_CLIENT_SECRET=3b04319928f942a68cf3fbab4cc94dc0
TUYA_REGION=eu
TUYA_PROJECT_CODE=p1768555490796nn5su9
TUYA_DEVICE_ID=bfe9bb2e1df0b298a1wr8
```

---

## 📦 DEPENDENCIES TO INSTALL

```bash
npm install mqtt axios ws recharts date-fns

# DevDependencies
npm install --save-dev @types/mqtt @types/node
```

---

## 🏗️ ARCHITECTURE AT A GLANCE

```
┌─ Frontend (OrtoMio React App) ─────────────────────┐
│  IntegratedSmartHub.tsx                            │
│  + IoTDeviceCard, IoTChart, IoTAlertManager       │
└──────────────────┬──────────────────────────────────┘
                   │ (HTTP/WebSocket)
┌──────────────────▼──────────────────────────────────┐
│ Next.js API Routes (/api/iot/*)                    │
│  - Device Management                               │
│  - Telemetry Acquisition                           │
│  - Alert Management                                │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼─────────┐  ┌────────▼──────────┐
│ Supabase DB     │  │ ThingsBoard API   │
│ (PostgreSQL)    │  │ + MQTT Broker     │
└─────────────────┘  └────────┬──────────┘
                               │
                      ┌────────▼──────────┐
                      │ IoT Devices       │
                      │ (Tuya, MQTT, etc)│
                      └───────────────────┘
```

---

## 📋 DATABASE TABLES QUICK REFERENCE

### Table: `iot_devices`
```sql
id UUID                          -- Primary key
garden_id UUID                   -- Foreign key → gardens
thingsboard_device_id VARCHAR    -- ThingsBoard device ID (UNIQUE)
name VARCHAR                     -- Device name
device_type VARCHAR              -- Smart Irrigation, Env Sensor, etc
provider VARCHAR                 -- tuya, mqtt, lora, etc
status VARCHAR                   -- online, offline, error
config JSONB                     -- Device-specific configuration
battery_level INTEGER            -- 0-100
signal_strength INTEGER          -- dBm or %
last_telemetry_at TIMESTAMP
created_at TIMESTAMP
```

### Table: `iot_telemetry`
```sql
id UUID
device_id UUID                   -- Foreign key → iot_devices
parameter_name VARCHAR           -- temperature, humidity, etc
parameter_value NUMERIC
unit_of_measure VARCHAR          -- °C, %, lux, etc
timestamp TIMESTAMP
reported_at TIMESTAMP            -- Device timestamp
processed BOOLEAN
created_at TIMESTAMP

INDEX: (device_id, timestamp DESC)
```

### Table: `iot_alerts`
```sql
id UUID
device_id UUID
garden_id UUID
alert_type VARCHAR               -- threshold_exceeded, offline, etc
severity VARCHAR                 -- critical, warning, info
title VARCHAR
description TEXT
parameter_name VARCHAR
parameter_value NUMERIC
threshold_min/max NUMERIC
is_active BOOLEAN
acknowledged BOOLEAN
created_at TIMESTAMP
```

### Table: `iot_thresholds`
```sql
id UUID
device_id UUID
user_id UUID
parameter_name VARCHAR
min_value NUMERIC
max_value NUMERIC
alert_enabled BOOLEAN
notification_enabled BOOLEAN
created_at TIMESTAMP
```

---

## 🔌 API ENDPOINTS REFERENCE

### Device Management
```
GET    /api/iot/devices                    # List devices
POST   /api/iot/devices                    # Create device
GET    /api/iot/devices/[id]               # Get device detail
PUT    /api/iot/devices/[id]               # Update device
DELETE /api/iot/devices/[id]               # Delete device
```

### Telemetry
```
GET    /api/iot/telemetry                  # Get historical data
GET    /api/iot/telemetry/[device_id]      # Get device telemetry
POST   /api/iot/telemetry/[device_id]      # Post device data
```

### Alerts
```
GET    /api/iot/alerts                     # List alerts
POST   /api/iot/alerts/[id]/acknowledge    # Acknowledge alert
PUT    /api/iot/alerts/[id]                # Update alert
```

### Thresholds
```
GET    /api/iot/thresholds                 # List thresholds
POST   /api/iot/thresholds                 # Create threshold
PUT    /api/iot/thresholds/[id]            # Update threshold
DELETE /api/iot/thresholds/[id]            # Delete threshold
```

### System
```
POST   /api/iot/webhooks                   # ThingsBoard webhook
POST   /api/iot/sync                       # Force sync
GET    /api/iot/status                     # System status
```

---

## 🔑 Key Services

### ThingsboardAPIClient
```typescript
// Location: services/thingsboard/ThingsboardAPIClient.ts

client.authenticate(username, password)    # Auth
client.setApiToken(token)                  # Set API token
client.getDevices(pageSize, page)          # Get device list
client.getDevice(deviceId)                 # Get device
client.createDevice(name, type, config)    # Create device
client.deleteDevice(deviceId)              # Delete device
client.getLatestTelemetry(deviceId, keys)  # Get latest data
client.getTelemetryRange(...)              # Get historical data
client.sendRPCCommand(deviceId, method, params)  # Send command
client.getDeviceAttributes(deviceId)       # Get attributes
client.setServerAttributes(deviceId, attrs) # Set attributes
```

### TelemetryService
```typescript
// Location: services/thingsboard/TelemetryService.ts

telemetryService.initialize()              # Start service
telemetryService.connectMQTT()             # Connect to MQTT
telemetryService.startPolling()            # Start polling
telemetryService.startDevicePolling(...)   # Poll specific device
telemetryService.stopPolling()             # Stop all polling
```

### AlertService
```typescript
// Location: services/thingsboard/AlertService.ts

alertService.checkThresholds(deviceId, data)
alertService.createAlert(deviceId, threshold, value)
alertService.acknowledgeAlert(alertId)
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests
```
□ ThingsboardAPIClient
  □ authenticate()
  □ getDevices()
  □ createDevice()
  □ getTelemetry()
  □ sendRPCCommand()

□ TelemetryService
  □ processTelemetry()
  □ storeTelemetry()
  □ checkThresholds()

□ AlertService
  □ createAlert()
  □ acknowledgeAlert()
```

### Integration Tests
```
□ API Endpoints
  □ GET /api/iot/devices
  □ POST /api/iot/devices
  □ GET /api/iot/telemetry
  □ POST /api/iot/alerts/[id]/acknowledge

□ Database
  □ Insert device
  □ Insert telemetry
  □ Create alert
  □ Update threshold
```

### E2E Tests
```
□ Device connection workflow
□ Telemetry acquisition (real device)
□ Alert trigger on threshold
□ User action (acknowledge alert)
□ Dashboard real-time update
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: ThingsBoard Authentication Failed
```
Error: 401 Unauthorized

Solution:
□ Verify API token in .env.local
□ Check token hasn't expired
□ Confirm tenant ID is correct
□ Try login via ThingsBoard UI first
```

### Issue 2: MQTT Connection Timeout
```
Error: MQTT connect timeout

Solution:
□ Check MQTT broker is running
□ Verify MQTT_BROKER_URL in .env
□ Check firewall port 1883
□ Verify username/password
```

### Issue 3: Telemetry Not Stored
```
Error: Data received but not in DB

Solution:
□ Check database connection
□ Verify iot_telemetry table exists
□ Check RLS policies allow insert
□ Verify device_id is valid UUID
```

### Issue 4: Alerts Not Triggering
```
Error: Value exceeds threshold but no alert

Solution:
□ Verify threshold configured
□ Check alert_enabled = true
□ Verify telemetry is being received
□ Check threshold min/max values
```

---

## 📈 PERFORMANCE TUNING

### Database Optimization
```sql
-- Create indexes for frequent queries
CREATE INDEX idx_iot_telemetry_device_timestamp 
  ON iot_telemetry(device_id, timestamp DESC);

CREATE INDEX idx_iot_alerts_device_active
  ON iot_alerts(device_id, is_active);

-- Archivize old telemetry
DELETE FROM iot_telemetry 
WHERE timestamp < NOW() - INTERVAL '365 days';
```

### API Optimization
```typescript
// Implement caching
const cache = new Map()

// Batch telemetry inserts
const batch = Array(100)

// Use connection pooling
const pool = new Pool({ max: 10 })
```

### Frontend Optimization
```typescript
// Use React.memo for components
export default memo(IoTDeviceCard)

// Lazy load charts
const IoTChart = lazy(() => import('./IoTChart'))

// Implement virtual scrolling for device lists
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
```
□ All tests passing
□ Code reviewed
□ Database backed up
□ .env.local configured
□ ThingsBoard verified
□ MQTT broker ready
```

### Deployment
```
□ Build production bundle
□ Migrate database
□ Deploy to staging first
□ Smoke test all endpoints
□ Test with real device
□ Deploy to production
```

### Post-Deployment
```
□ Monitor error logs
□ Check performance metrics
□ Verify all features working
□ Collect user feedback
□ Document issues found
```

---

## 📞 CONTACT & SUPPORT

### Immediate Issues
```
Technical Problem:     Check Common Issues section above
ThingsBoard Help:      https://community.thingsboard.io/
API Question:          Check /api/iot/{endpoint} docs
```

### Weekly Status
```
Standup:     Daily 9:00 AM (15 min)
Review:      Friday 4:00 PM (1 hour)
Status Rep:  Weekly Monday morning
```

---

## ✅ READY CHECKLIST

Before starting development:

```
□ ThingsBoard account created
□ .env.local configured with credentials
□ npm install completed
□ Database migrations applied
□ First device created in ThingsBoard
□ API test working (curl or Postman)
□ Development branch created
□ IDE configured for TypeScript
□ Node debugger ready
□ npm start works locally
```

---

## 🎯 DAILY CHECKLIST

Each day:

```
□ Pull latest changes
□ Run npm test
□ Review logs
□ Check alerts/errors
□ Standup completed
□ Code committed
□ Progress updated
```

---

## 📊 PROGRESS TRACKING

Print this and update daily:

```
WEEK 1 (Infrastructure):  ▓▓▓▓▓▓▓░░░ 70% | Blockers: None
WEEK 2 (Backend):        ▓▓▓▓░░░░░░ 40% | Blockers: [TBD]
WEEK 3 (Frontend):       ░░░░░░░░░░  0% | Blockers: [TBD]
WEEK 4 (Testing):        ░░░░░░░░░░  0% | Blockers: [TBD]

Days to launch: 28
Critical path items: 5
Risks (Yellow): 2
Risks (Red): 0
```

---

## 🎓 LEARNING RESOURCES

If new to these technologies:

```
ThingsBoard:
- Video intro: https://youtu.be/...
- Docs walkthrough: 2-3 hours
- Hello World example: 1-2 hours

MQTT:
- Basics: 2 hours
- Publish/Subscribe: 1 hour
- Production patterns: 3 hours

TypeScript + Node.js:
- Assumed knowledge
- Quick refresh if needed
```

---

**Last Updated**: 7 Febbraio 2026  
**Status**: READY FOR IMPLEMENTATION  

**Questions?** Vedi i documenti dettagliati o contatta il team! 🚀
