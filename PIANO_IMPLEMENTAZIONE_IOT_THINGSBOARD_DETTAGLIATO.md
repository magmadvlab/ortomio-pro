# 📋 PIANO DI IMPLEMENTAZIONE DETTAGLIATO - IoT + ThingsBoard

**Data Creazione**: 7 Febbraio 2026  
**Versione**: 1.0  
**Status**: READY FOR IMPLEMENTATION

---

## FASE 1: SETUP THINGSBOARD (Giorni 1-2)

### Step 1.1: Scelta della Piattaforma

**OPZIONE CONSIGLIATA**: ThingsBoard Self-Hosted su VPS

```bash
# Setup su Ubuntu 22.04 VPS (€5-10/month)

# 1. Installare Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# 2. Deploy ThingsBoard
mkdir -p ~/thingsboard
cd ~/thingsboard

# Creare docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: thingsboard
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: YOUR_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data

  thingsboard:
    image: thingsboard/tb-postgres:latest
    ports:
      - "8080:8080"
      - "1883:1883"  # MQTT
      - "5685:5685"  # CoAP
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/thingsboard
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: YOUR_PASSWORD
    depends_on:
      - postgres
    volumes:
      - thingsboard_data:/data

volumes:
  postgres_data:
  thingsboard_data:
EOF

# 3. Start services
sudo docker-compose up -d

# 4. Access at http://YOUR_IP:8080
# Default credentials: sysadmin@thingsboard.org / sysadmin
```

### Step 1.2: Configurazione Iniziale ThingsBoard

1. **Login** → `http://thingsboard.your-domain.com:8080`
   - User: `sysadmin@thingsboard.org`
   - Pass: `sysadmin`

2. **System Settings** → Change admin password
   ```
   New Password: YOUR_STRONG_PASSWORD
   ```

3. **Create Tenant**
   ```
   Name: OrtoMio
   Country: Italy
   State: Active
   ```

4. **Generate API Token**
   ```
   Settings → API Tokens
   Name: OrtoMio API
   Copy Token for .env
   ```

5. **Configure MQTT Broker**
   ```
   Admin Panel → System Settings → MQTT
   Enable MQTT: TRUE
   Port: 1883
   ```

### Step 1.3: Creazione Device Types in ThingsBoard

```javascript
// 1. Login via API
POST http://thingsboard:8080/api/auth/login
{
  "username": "tenant@thingsboard.org",
  "password": "PASSWORD"
}

// 2. Creare Device Type: Smart Irrigation
POST /api/deviceProfile
{
  "name": "Smart Irrigation",
  "description": "Sensori e valvole per irrigazione intelligente",
  "type": "DEFAULT",
  "transportType": "DEFAULT",
  "telemetryAttributes": [
    {
      "key": "valve_status",
      "type": "BOOLEAN",
      "description": "Stato della valvola (open/closed)"
    },
    {
      "key": "water_flow",
      "type": "DOUBLE",
      "description": "Portata acqua (L/min)"
    },
    {
      "key": "water_total",
      "type": "LONG",
      "description": "Totale acqua erogata (L)"
    },
    {
      "key": "battery_level",
      "type": "INT",
      "description": "Livello batteria (%)"
    }
  ],
  "serverSideRpc": [
    {
      "method": "open_valve",
      "params": []
    },
    {
      "method": "close_valve",
      "params": []
    },
    {
      "method": "set_timer",
      "params": [
        { "name": "duration", "type": "INT", "description": "Durata in secondi" }
      ]
    }
  ]
}

// 3. Creare Device Type: Environmental Sensor
POST /api/deviceProfile
{
  "name": "Environmental Sensor",
  "description": "Sensore di temperatura, umidità, luminosità",
  "telemetryAttributes": [
    { "key": "temperature", "type": "DOUBLE", "description": "Temperatura (°C)" },
    { "key": "humidity", "type": "DOUBLE", "description": "Umidità relativa (%)" },
    { "key": "light_level", "type": "INT", "description": "Intensità luce (lux)" },
    { "key": "battery_level", "type": "INT", "description": "Batteria (%)" }
  ]
}

// 4. Creare Device Type: Soil Monitor
POST /api/deviceProfile
{
  "name": "Soil Monitor",
  "description": "Sensore di umidità suolo, pH, conducibilità elettrica",
  "telemetryAttributes": [
    { "key": "soil_moisture", "type": "DOUBLE", "description": "Umidità suolo (%)" },
    { "key": "soil_ph", "type": "DOUBLE", "description": "pH del suolo" },
    { "key": "soil_ec", "type": "DOUBLE", "description": "Conducibilità elettrica (μS/cm)" },
    { "key": "soil_temperature", "type": "DOUBLE", "description": "Temperatura suolo (°C)" }
  ]
}
```

### Step 1.4: Configurare Tuya Connector (Opzionale)

Se vuoi connettere il tuo Tuya timer direttamente a ThingsBoard:

```javascript
// In ThingsBoard Admin Panel
1. Connectors → Create New
2. Connector Type: Tuya Cloud API
3. Configure:
   - Client ID: a4syyyy7y3p5dnjfcpee
   - Client Secret: 3b04319928f942a68cf3fbab4cc94dc0
   - Region: EU
   - Project Code: p1768555490796nn5su9
4. Test Connection → Save
```

---

## FASE 2: SETUP BACKEND (Giorni 3-5)

### Step 2.1: Aggiornare `.env.local`

```bash
# ThingsBoard Configuration
THINGSBOARD_URL=http://localhost:8080
THINGSBOARD_API_TOKEN=YOUR_API_TOKEN
THINGSBOARD_TENANT_ID=YOUR_TENANT_ID

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_password

# Tuya Configuration (se mantenere dual mode)
TUYA_CLIENT_ID=a4syyyy7y3p5dnjfcpee
TUYA_CLIENT_SECRET=3b04319928f942a68cf3fbab4cc94dc0
TUYA_REGION=eu
TUYA_PROJECT_CODE=p1768555490796nn5su9
TUYA_DEVICE_ID=bfe9bb2e1df0b298a1wr8

# IoT Configuration
IOT_POLLING_INTERVAL_ACTIVE=30000  # 30 secondi
IOT_POLLING_INTERVAL_INACTIVE=300000  # 5 minuti
IoT_DATA_RETENTION_DAYS=365
IoT_ALERT_CHECK_INTERVAL=10000  # 10 secondi
```

### Step 2.2: Installare Dependencies

```bash
npm install mqtt axios ws recharts date-fns
npm install --save-dev @types/mqtt @types/node
```

### Step 2.3: Creare Database Migrations

```bash
# File: supabase/migrations/20260207_000000_iot_infrastructure.sql

-- 1. Tabella dispositivi IoT
CREATE TABLE iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  thingsboard_device_id VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  device_type VARCHAR NOT NULL, -- Smart Irrigation, Environmental Sensor, Soil Monitor, etc
  provider VARCHAR NOT NULL DEFAULT 'thingsboard', -- thingsboard, tuya, mqtt, lora
  status VARCHAR DEFAULT 'online', -- online, offline, error
  location VARCHAR, -- Zone name or description
  
  -- Configuration
  config JSONB, -- Device-specific settings
  metadata JSONB, -- Additional info (model, firmware, etc)
  
  -- Status monitoring
  battery_level INTEGER, -- 0-100
  signal_strength INTEGER, -- -100 to -30 dBm or 0-100%
  last_telemetry_at TIMESTAMP,
  last_online_at TIMESTAMP,
  error_count INTEGER DEFAULT 0,
  last_error VARCHAR,
  
  -- Ownership
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  updated_by_user_id UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Index per queries frequenti
CREATE INDEX idx_iot_devices_garden_id ON iot_devices(garden_id);
CREATE INDEX idx_iot_devices_thingsboard_device_id ON iot_devices(thingsboard_device_id);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);

-- 2. Tabella telemetria storica
CREATE TABLE iot_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  
  -- Dato
  parameter_name VARCHAR NOT NULL, -- temperature, humidity, valve_status, etc
  parameter_value NUMERIC,
  parameter_type VARCHAR, -- DOUBLE, INTEGER, BOOLEAN, STRING
  unit_of_measure VARCHAR, -- °C, %, L/min, etc
  
  -- Metadati
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reported_at TIMESTAMP, -- Timestamp dal dispositivo
  processed BOOLEAN DEFAULT false,
  
  -- Storage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index per queries veloci
CREATE INDEX idx_iot_telemetry_device_id_timestamp ON iot_telemetry(device_id, timestamp DESC);
CREATE INDEX idx_iot_telemetry_parameter_date ON iot_telemetry(parameter_name, timestamp DESC);

-- Auto-vacuum per retention policy
-- Cancellare dati più vecchi di 365 giorni ogni ora
ALTER TABLE iot_telemetry SET (fillfactor = 90);

-- 3. Tabella alerts
CREATE TABLE iot_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type VARCHAR NOT NULL, -- threshold_exceeded, battery_low, offline, anomaly
  severity VARCHAR NOT NULL DEFAULT 'warning', -- critical, warning, info
  title VARCHAR NOT NULL,
  description TEXT,
  
  -- Trigger data
  parameter_name VARCHAR,
  parameter_value NUMERIC,
  threshold_min NUMERIC,
  threshold_max NUMERIC,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  acknowledged_by_user_id UUID REFERENCES auth.users(id),
  
  -- Resolution
  resolved_at TIMESTAMP,
  resolution_notes VARCHAR,
  
  -- Related data
  created_intervention_id UUID REFERENCES field_interventions(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_iot_alerts_device_id ON iot_alerts(device_id);
CREATE INDEX idx_iot_alerts_garden_id ON iot_alerts(garden_id);
CREATE INDEX idx_iot_alerts_active ON iot_alerts(is_active, created_at DESC);
CREATE INDEX idx_iot_alerts_severity ON iot_alerts(severity);

-- 4. Tabella soglie configurabili
CREATE TABLE iot_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Configurazione
  parameter_name VARCHAR NOT NULL,
  min_value NUMERIC,
  max_value NUMERIC,
  
  -- Alert settings
  alert_enabled BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  auto_intervention BOOLEAN DEFAULT false,
  suggested_intervention_type VARCHAR,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  UNIQUE(device_id, parameter_name, user_id)
);

-- Index
CREATE INDEX idx_iot_thresholds_device_id ON iot_thresholds(device_id);
CREATE INDEX idx_iot_thresholds_user_id ON iot_thresholds(user_id);

-- 5. Tabella sync status
CREATE TABLE iot_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR, -- success, failed, partial
  sync_error VARCHAR,
  telemetry_count_synced INTEGER,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_thresholds ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see devices for their gardens
CREATE POLICY iot_devices_select ON iot_devices
  FOR SELECT USING (
    garden_id IN (
      SELECT id FROM gardens 
      WHERE created_by_user_id = auth.uid()
    )
  );

CREATE POLICY iot_devices_insert ON iot_devices
  FOR INSERT WITH CHECK (
    garden_id IN (
      SELECT id FROM gardens 
      WHERE created_by_user_id = auth.uid()
    ) AND created_by_user_id = auth.uid()
  );

-- Similar policies for other tables...
```

### Step 2.4: Applicare Migrazione

```bash
supabase migration up
# oppure per remote:
# psql $DATABASE_URL < supabase/migrations/20260207_000000_iot_infrastructure.sql
```

### Step 2.5: Creare Servizi Backend

**File**: `services/thingsboard/ThingsboardAPIClient.ts`

```typescript
/**
 * ThingsBoard API Client
 * Gestisce comunicazione con ThingsBoard via REST API
 */

import axios, { AxiosInstance } from 'axios'

interface ThingsboardConfig {
  url: string
  apiToken: string
  tenantId: string
}

interface DeviceInfo {
  id: string
  name: string
  type: string
  tenantId: string
  createdTime: number
  additionalInfo: Record<string, any>
}

interface Telemetry {
  [key: string]: number | string | boolean
}

interface DeviceAttributes {
  clientAttributes?: Record<string, any>
  serverAttributes?: Record<string, any>
  sharedAttributes?: Record<string, any>
}

export class ThingsboardAPIClient {
  private axiosInstance: AxiosInstance
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  constructor(private config: ThingsboardConfig) {
    this.axiosInstance = axios.create({
      baseURL: this.config.url,
      timeout: 10000,
    })
  }

  /**
   * Autenticazione con ThingsBoard
   */
  async authenticate(username: string, password: string): Promise<string> {
    try {
      const response = await this.axiosInstance.post('/api/auth/login', {
        username,
        password,
      })

      this.accessToken = response.data.token
      this.tokenExpiresAt = response.data.refreshTokenExpires
      
      // Aggiornare header per richieste future
      this.axiosInstance.defaults.headers.common['X-Authorization'] = 
        `Bearer ${this.accessToken}`

      return this.accessToken
    } catch (error) {
      throw new Error(`ThingsBoard authentication failed: ${error}`)
    }
  }

  /**
   * Autenticazione con API Token
   */
  setApiToken(token: string): void {
    this.accessToken = token
    this.axiosInstance.defaults.headers.common['X-Authorization'] = 
      `Bearer ${token}`
  }

  /**
   * Ottenere lista dispositivi
   */
  async getDevices(pageSize: number = 100, page: number = 0): Promise<DeviceInfo[]> {
    try {
      const response = await this.axiosInstance.get(
        `/api/tenant/devices?pageSize=${pageSize}&page=${page}`
      )
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to get devices: ${error}`)
    }
  }

  /**
   * Ottenere dispositivo specifico
   */
  async getDevice(deviceId: string): Promise<DeviceInfo> {
    try {
      const response = await this.axiosInstance.get(`/api/device/${deviceId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to get device: ${error}`)
    }
  }

  /**
   * Creare nuovo dispositivo
   */
  async createDevice(
    name: string,
    type: string,
    additionalInfo?: Record<string, any>
  ): Promise<DeviceInfo> {
    try {
      const response = await this.axiosInstance.post('/api/device', {
        name,
        type,
        additionalInfo: additionalInfo || {},
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to create device: ${error}`)
    }
  }

  /**
   * Eliminare dispositivo
   */
  async deleteDevice(deviceId: string): Promise<void> {
    try {
      await this.axiosInstance.delete(`/api/device/${deviceId}`)
    } catch (error) {
      throw new Error(`Failed to delete device: ${error}`)
    }
  }

  /**
   * Ottenere telemetria storica
   */
  async getLatestTelemetry(
    deviceId: string,
    keys?: string[]
  ): Promise<Record<string, Telemetry>> {
    try {
      const keysParam = keys ? `?keys=${keys.join(',')}` : ''
      const response = await this.axiosInstance.get(
        `/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries${keysParam}`
      )
      return response.data
    } catch (error) {
      throw new Error(`Failed to get telemetry: ${error}`)
    }
  }

  /**
   * Ottenere telemetria in range temporale
   */
  async getTelemetryRange(
    deviceId: string,
    keys: string[],
    startTime: number,
    endTime: number,
    limit: number = 100
  ): Promise<Record<string, Array<[number, string]>>> {
    try {
      const response = await this.axiosInstance.get(
        `/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keys.join(
          ','
        )}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`
      )
      return response.data
    } catch (error) {
      throw new Error(`Failed to get telemetry range: ${error}`)
    }
  }

  /**
   * Inviare RPC command al dispositivo
   */
  async sendRPCCommand(
    deviceId: string,
    method: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `/api/plugins/rpc/oneway/DEVICE/${deviceId}`,
        {
          method,
          params,
        }
      )
      return response.data
    } catch (error) {
      throw new Error(`Failed to send RPC command: ${error}`)
    }
  }

  /**
   * Ottenere attributi dispositivo
   */
  async getDeviceAttributes(deviceId: string): Promise<DeviceAttributes> {
    try {
      const response = await this.axiosInstance.get(
        `/api/plugins/telemetry/DEVICE/${deviceId}/attributes`
      )
      return response.data
    } catch (error) {
      throw new Error(`Failed to get device attributes: ${error}`)
    }
  }

  /**
   * Impostare attributi server-side
   */
  async setServerAttributes(
    deviceId: string,
    attributes: Record<string, any>
  ): Promise<void> {
    try {
      await this.axiosInstance.post(
        `/api/plugins/telemetry/DEVICE/${deviceId}/attributes/SERVER_SCOPE`,
        attributes
      )
    } catch (error) {
      throw new Error(`Failed to set server attributes: ${error}`)
    }
  }
}

export default ThingsboardAPIClient
```

**File**: `services/thingsboard/TelemetryService.ts`

```typescript
/**
 * Telemetry Service
 * Gestisce acquisizione, storage e processing dati telemetria
 */

import { createClient } from '@supabase/supabase-js'
import mqtt from 'mqtt'
import ThingsboardAPIClient from './ThingsboardAPIClient'

interface TelemetryData {
  deviceId: string
  parameter: string
  value: number | string | boolean
  unit: string
  timestamp: Date
}

export class TelemetryService {
  private mqttClient: mqtt.MqttClient | null = null
  private tbClient: ThingsboardAPIClient
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  private pollingTimers: Map<string, NodeJS.Timer> = new Map()
  private pollingIntervals = {
    active: parseInt(process.env.IOT_POLLING_INTERVAL_ACTIVE || '30000'),
    inactive: parseInt(process.env.IOT_POLLING_INTERVAL_INACTIVE || '300000'),
  }

  constructor() {
    this.tbClient = new ThingsboardAPIClient({
      url: process.env.THINGSBOARD_URL || '',
      apiToken: process.env.THINGSBOARD_API_TOKEN || '',
      tenantId: process.env.THINGSBOARD_TENANT_ID || '',
    })
  }

  /**
   * Inizializzare connessioni MQTT e polling
   */
  async initialize(): Promise<void> {
    try {
      // Setup autenticazione ThingsBoard
      this.tbClient.setApiToken(process.env.THINGSBOARD_API_TOKEN || '')

      // Connettere a MQTT broker
      await this.connectMQTT()

      // Avviare polling per dispositivi attivi
      await this.startPolling()
    } catch (error) {
      console.error('Telemetry service initialization failed:', error)
      throw error
    }
  }

  /**
   * Connettere a MQTT broker
   */
  private connectMQTT(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient = mqtt.connect(
        process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
        {
          username: process.env.MQTT_USERNAME,
          password: process.env.MQTT_PASSWORD,
        }
      )

      this.mqttClient.on('connect', () => {
        console.log('MQTT connected')
        this.mqttClient?.subscribe('v1/devices/me/telemetry')
        resolve()
      })

      this.mqttClient.on('message', (topic, message) => {
        this.handleMQTTMessage(topic, message)
      })

      this.mqttClient.on('error', reject)
    })
  }

  /**
   * Gestire messaggi MQTT
   */
  private handleMQTTMessage(topic: string, message: Buffer): void {
    try {
      const data = JSON.parse(message.toString())
      this.processTelemetry(data)
    } catch (error) {
      console.error('Error processing MQTT message:', error)
    }
  }

  /**
   * Avviare polling dati da ThingsBoard
   */
  private async startPolling(): Promise<void> {
    const { data: devices } = await this.supabase
      .from('iot_devices')
      .select('id, thingsboard_device_id')
      .eq('status', 'online')

    if (!devices) return

    for (const device of devices) {
      this.startDevicePolling(
        device.id,
        device.thingsboard_device_id,
        this.pollingIntervals.active
      )
    }
  }

  /**
   * Avviare polling per un dispositivo specifico
   */
  startDevicePolling(
    deviceId: string,
    tbDeviceId: string,
    interval: number
  ): void {
    if (this.pollingTimers.has(deviceId)) {
      clearInterval(this.pollingTimers.get(deviceId)!)
    }

    const timer = setInterval(async () => {
      try {
        const telemetry = await this.tbClient.getLatestTelemetry(tbDeviceId)
        await this.processTelemetry(telemetry, deviceId)
      } catch (error) {
        console.error(`Failed to poll device ${deviceId}:`, error)
      }
    }, interval)

    this.pollingTimers.set(deviceId, timer)
  }

  /**
   * Processare dati telemetria
   */
  private async processTelemetry(
    telemetry: Record<string, any>,
    deviceId?: string
  ): Promise<void> {
    try {
      // Validare dati
      if (!telemetry || typeof telemetry !== 'object') return

      // Salvare nel database
      for (const [param, value] of Object.entries(telemetry)) {
        if (deviceId) {
          await this.storeTelemetry({
            deviceId,
            parameter: param,
            value,
            unit: this.getUnitForParameter(param),
            timestamp: new Date(),
          })
        }
      }

      // Controllare soglie alert
      await this.checkThresholds(deviceId, telemetry)

      // Aggiornare status dispositivo
      if (deviceId) {
        await this.updateDeviceStatus(deviceId, 'online')
      }
    } catch (error) {
      console.error('Error processing telemetry:', error)
    }
  }

  /**
   * Salvare telemetria nel database
   */
  private async storeTelemetry(data: TelemetryData): Promise<void> {
    const { data: device } = await this.supabase
      .from('iot_devices')
      .select('id')
      .eq('id', data.deviceId)
      .single()

    if (!device) return

    const { error } = await this.supabase.from('iot_telemetry').insert({
      device_id: device.id,
      parameter_name: data.parameter,
      parameter_value: data.value,
      unit_of_measure: data.unit,
      timestamp: data.timestamp,
      reported_at: data.timestamp,
    })

    if (error) {
      console.error('Error storing telemetry:', error)
    }
  }

  /**
   * Controllare soglie alert
   */
  private async checkThresholds(
    deviceId: string | undefined,
    telemetry: Record<string, any>
  ): Promise<void> {
    if (!deviceId) return

    const { data: thresholds } = await this.supabase
      .from('iot_thresholds')
      .select('*')
      .eq('device_id', deviceId)
      .eq('alert_enabled', true)

    if (!thresholds) return

    for (const threshold of thresholds) {
      const value = telemetry[threshold.parameter_name]

      if (
        (threshold.min_value && value < threshold.min_value) ||
        (threshold.max_value && value > threshold.max_value)
      ) {
        await this.createAlert(deviceId, threshold, value)
      }
    }
  }

  /**
   * Creare alert
   */
  private async createAlert(
    deviceId: string,
    threshold: any,
    value: any
  ): Promise<void> {
    const { data: device } = await this.supabase
      .from('iot_devices')
      .select('garden_id')
      .eq('id', deviceId)
      .single()

    if (!device) return

    const { error } = await this.supabase.from('iot_alerts').insert({
      device_id: deviceId,
      garden_id: device.garden_id,
      alert_type: 'threshold_exceeded',
      severity: 'warning',
      title: `${threshold.parameter_name} - Soglia superata`,
      description: `Valore: ${value} (Min: ${threshold.min_value}, Max: ${threshold.max_value})`,
      parameter_name: threshold.parameter_name,
      parameter_value: value,
      threshold_min: threshold.min_value,
      threshold_max: threshold.max_value,
    })

    if (error) {
      console.error('Error creating alert:', error)
    }
  }

  /**
   * Aggiornare status dispositivo
   */
  private async updateDeviceStatus(
    deviceId: string,
    status: string
  ): Promise<void> {
    await this.supabase
      .from('iot_devices')
      .update({
        status,
        last_telemetry_at: new Date().toISOString(),
      })
      .eq('id', deviceId)
  }

  /**
   * Ottenere unità di misura per parametro
   */
  private getUnitForParameter(param: string): string {
    const units: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      light_level: 'lux',
      water_flow: 'L/min',
      water_total: 'L',
      soil_moisture: '%',
      soil_ph: 'pH',
      soil_ec: 'μS/cm',
      battery_level: '%',
      signal_strength: 'dBm',
    }
    return units[param] || ''
  }

  /**
   * Cleanup
   */
  stopPolling(): void {
    for (const timer of this.pollingTimers.values()) {
      clearInterval(timer)
    }
    this.pollingTimers.clear()

    if (this.mqttClient) {
      this.mqttClient.end()
    }
  }
}

export const telemetryService = new TelemetryService()
```

### Step 2.6: Creare API Routes

**File**: `app/api/iot/devices/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import ThingsboardAPIClient from '@/services/thingsboard/ThingsboardAPIClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const tbClient = new ThingsboardAPIClient({
  url: process.env.THINGSBOARD_URL || '',
  apiToken: process.env.THINGSBOARD_API_TOKEN || '',
  tenantId: process.env.THINGSBOARD_TENANT_ID || '',
})

// GET: List devices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gardenId = searchParams.get('gardenId')

    let query = supabase.from('iot_devices').select('*')
    
    if (gardenId) {
      query = query.eq('garden_id', gardenId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    )
  }
}

// POST: Create device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, device_type, garden_id, config } = body

    // Creare in ThingsBoard
    const tbDevice = await tbClient.createDevice(name, device_type, config)

    // Salvare in Supabase
    const { data, error } = await supabase
      .from('iot_devices')
      .insert({
        garden_id,
        thingsboard_device_id: tbDevice.id.id,
        name,
        device_type,
        config,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create device' },
      { status: 500 }
    )
  }
}
```

---

## FASE 3: FRONTEND COMPONENTS (Giorni 6-8)

### Step 3.1: Creare Componenti IoT

**File**: `components/iot/IoTDeviceCard.tsx`

```typescript
'use client'

import { SmartDevice } from '@/types'
import { Wifi, WifiOff, Battery, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface IoTDeviceCardProps {
  device: any // IoT device from DB
  onConfigure?: () => void
  onControl?: (command: string, params: any) => void
}

export default function IoTDeviceCard({
  device,
  onConfigure,
  onControl,
}: IoTDeviceCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const isOnline = device.status === 'online'

  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{device.name}</h3>
          <p className="text-sm text-gray-500">{device.device_type}</p>
        </div>
        <div className={`flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2 mb-4">
        {device.battery_level !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Battery size={14} />
              Battery
            </span>
            <span>{device.battery_level}%</span>
          </div>
        )}
        {device.signal_strength && (
          <div className="flex items-center justify-between text-sm">
            <span>Signal</span>
            <span>{device.signal_strength} dBm</span>
          </div>
        )}
      </div>

      {/* Last update */}
      {device.last_telemetry_at && (
        <p className="text-xs text-gray-400 mb-3">
          Last update: {new Date(device.last_telemetry_at).toLocaleTimeString()}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onConfigure}
          className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Configure
        </button>
        <button
          onClick={() => onControl?.('refresh', {})}
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
```

**File**: `components/iot/IoTChart.tsx`

```typescript
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'

interface ChartDataPoint {
  timestamp: number
  value: number
}

interface IoTChartProps {
  deviceId: string
  parameter: string
  timeRange: '24h' | '7d' | '30d' | '1y'
  unit: string
}

export default function IoTChart({
  deviceId,
  parameter,
  timeRange,
  unit,
}: IoTChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [deviceId, parameter, timeRange])

  const loadData = async () => {
    try {
      const response = await fetch(
        `/api/iot/telemetry?deviceId=${deviceId}&parameter=${parameter}&range=${timeRange}`
      )
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to load chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Loading chart...</div>
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          />
          <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
            formatter={(value) => [`${value} ${unit}`, parameter]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## FASE 4: REAL-TIME SYNC (Giorni 9-10)

### Step 4.1: WebSocket Service

**File**: `services/iot/WebSocketService.ts`

```typescript
export class IoTWebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data))
        }

        this.ws.onclose = () => {
          this.attemptReconnect(url)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(data: any) {
    // Broadcast to listeners
    window.dispatchEvent(
      new CustomEvent('iot:telemetry', { detail: data })
    )
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`Reconnecting in ${delay}ms...`)
      setTimeout(() => this.connect(url), delay)
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}
```

---

## ✅ CHECKLIST DI IMPLEMENTAZIONE

### Infrastruttura
- [ ] ThingsBoard deployed e operativo
- [ ] MQTT broker configurato
- [ ] Device types creati
- [ ] Credenziali salvate in `.env.local`

### Database
- [ ] Migrations applicate
- [ ] Tabelle create e verificate
- [ ] RLS policies attivate
- [ ] Indexes creati

### Backend Services
- [ ] ThingsboardAPIClient implementato
- [ ] TelemetryService operativo
- [ ] API routes funzionanti
- [ ] Error handling completo

### Frontend
- [ ] Componenti IoT creati
- [ ] IntegratedSmartHub aggiornato
- [ ] Real-time updates funzionanti
- [ ] UI responsive e user-friendly

### Testing
- [ ] Unit tests scritti
- [ ] Integration tests eseguiti
- [ ] Real device testing completato
- [ ] E2E testing approvato

### Documentation
- [ ] Setup guide completato
- [ ] API documentation creata
- [ ] User manual scritto
- [ ] Troubleshooting guide preparato

---

**Status**: READY TO IMPLEMENT 🚀  
**Next Step**: Begin with Step 1.1 (ThingsBoard Setup)
