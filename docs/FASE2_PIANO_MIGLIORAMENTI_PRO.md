# FASE 2: Piano Miglioramenti Funzionalità PRO

## Sommario Esecutivo

**Obiettivo**: Completare e ottimizzare le funzionalità PRO Professional per renderle production-ready al 100%.

**Stato Attuale**: 75% completamento medio
- Logica/engine: 90% completo
- Storage/Database: 60% completo (irrigazione ancora in localStorage)
- UI/Dashboard: 65% completo (mancano pagine dedicate)
- Alert/Notifiche: 30% completo

**Target FASE 2**: 95% completamento
- Tutte le funzionalità PRO con pagine dedicate
- Storage 100% su Supabase
- Sistema alert/notifiche funzionante
- Export PDF professionale
- Wizard completi per colture specializzate

**Timeline stimata**: 4-5 settimane (20-25 giorni lavorativi)

---

## Priorità Implementazione

### 🔴 **CRITICAL** (Blocca produzione - Sprint 1-2)
1. Migrazione Irrigazione a Supabase
2. Pagina dedicata Irrigazione `/app/irrigation`
3. Pagina dedicata Fertilizzazione `/app/fertilization`
4. PDF Export reale
5. Alert sistema (safety interval, irrigazione, Brix)

### 🟡 **HIGH** (Valore utente alto - Sprint 3-4)
6. Wizard Colture Specializzate (olivo, vite, albero)
7. Form Registrazione Specializzate (frangitura, Brix, potatura)
8. Dashboard metriche Irrigazione e Fertilizzazione
9. Analytics Multi-Anno
10. Badge Migration Supabase

### 🟢 **MEDIUM** (Nice to have - Sprint 5-6)
11. Backup automatico cloud
12. ML Predictions avanzate
13. Integrazione sensori IoT
14. Template export personalizzabili
15. Social features (leaderboard)

---

## Sprint 1: Sistema Irrigazione Completo (5 giorni)

### Obiettivo
Creare pagina dedicata `/app/irrigation` con gestione completa zone irrigue e migrazione storage a Supabase.

### Database Migration

**File**: `/database/migrations/add_irrigation_system.sql`

```sql
-- Tabella sistemi irrigazione
CREATE TABLE irrigation_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Manual', 'Drip', 'Sprinkler', 'Micro', 'Soaker')),
  water_source TEXT CHECK (water_source IN ('Municipal', 'Well', 'Rainwater', 'River')),
  pressure_bar DECIMAL(4,2),
  flow_rate_lh DECIMAL(8,2), -- Litri/ora totale sistema
  has_timer BOOLEAN DEFAULT FALSE,
  has_valve BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella zone irrigue
CREATE TABLE irrigation_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id UUID REFERENCES irrigation_systems(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  area_sqm DECIMAL(8,2) NOT NULL,
  irrigation_method TEXT NOT NULL CHECK (irrigation_method IN (
    'Manual', 'Hose', 'DripLine', 'Drippers', 'MicroSprinkler', 'Sprinkler', 'SoakerHose'
  )),

  -- Configurazione tecnica
  flow_rate_lh DECIMAL(8,2), -- Litri/ora zona
  dripper_spacing_cm INTEGER,
  dripper_flow_rate_lh DECIMAL(4,2),
  dripline_spacing_cm INTEGER,
  num_drippers INTEGER,

  -- Piante associate
  plant_types JSONB, -- Array nomi piante

  -- Automazione
  is_automated BOOLEAN DEFAULT FALSE,
  valve_id TEXT,
  schedule JSONB, -- { days: [1,3,5], time: "06:00", duration: 30 }

  -- Tracking
  last_watered_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella log irrigazioni
CREATE TABLE watering_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES irrigation_zones(id) ON DELETE CASCADE NOT NULL,
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,

  watered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  liters_used DECIMAL(8,2),

  method TEXT CHECK (method IN ('Automatic', 'Manual')),
  weather_condition TEXT, -- Sunny, Cloudy, Rainy
  soil_moisture_before INTEGER, -- 0-100%
  soil_moisture_after INTEGER,

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_irrigation_systems_garden ON irrigation_systems(garden_id);
CREATE INDEX idx_irrigation_zones_system ON irrigation_zones(system_id);
CREATE INDEX idx_irrigation_zones_garden ON irrigation_zones(garden_id);
CREATE INDEX idx_watering_logs_zone ON watering_logs(zone_id);
CREATE INDEX idx_watering_logs_garden ON watering_logs(garden_id);
CREATE INDEX idx_watering_logs_date ON watering_logs(watered_at);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_irrigation_systems
  BEFORE UPDATE ON irrigation_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_irrigation_zones
  BEFORE UPDATE ON irrigation_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE watering_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own irrigation data
CREATE POLICY irrigation_systems_policy ON irrigation_systems
  FOR ALL USING (
    garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  );

CREATE POLICY irrigation_zones_policy ON irrigation_zones
  FOR ALL USING (
    garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  );

CREATE POLICY watering_logs_policy ON watering_logs
  FOR ALL USING (
    garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid())
  );
```

### Storage Provider Update

**File**: `/packages/core/storage/interface.ts`

```typescript
interface IStorageProvider {
  // ... existing methods

  // Irrigation Systems
  getIrrigationSystems(gardenId?: string): Promise<IrrigationSystem[]>
  createIrrigationSystem(system: Omit<IrrigationSystem, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationSystem>
  updateIrrigationSystem(id: string, updates: Partial<IrrigationSystem>): Promise<IrrigationSystem>
  deleteIrrigationSystem(id: string): Promise<void>

  // Irrigation Zones
  getIrrigationZones(systemId?: string, gardenId?: string): Promise<IrrigationZone[]>
  createIrrigationZone(zone: Omit<IrrigationZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<IrrigationZone>
  updateIrrigationZone(id: string, updates: Partial<IrrigationZone>): Promise<IrrigationZone>
  deleteIrrigationZone(id: string): Promise<void>

  // Watering Logs
  getWateringLogs(zoneId?: string, gardenId?: string, dateRange?: { from: string; to: string }): Promise<WateringLog[]>
  createWateringLog(log: Omit<WateringLog, 'id' | 'createdAt'>): Promise<WateringLog>
  updateWateringLog(id: string, updates: Partial<WateringLog>): Promise<WateringLog>
  deleteWateringLog(id: string): Promise<void>
}
```

### Pagina Irrigazione

**File**: `/app/(dashboard)/app/irrigation/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useStorage } from '@/packages/core/hooks/useStorage'
import { IrrigationSystem, IrrigationZone, WateringLog } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { IrrigationSystemCard } from '@/components/irrigation/IrrigationSystemCard'
import { IrrigationZoneList } from '@/components/irrigation/IrrigationZoneList'
import { WateringHistory } from '@/components/irrigation/WateringHistory'
import { IrrigationMetrics } from '@/components/irrigation/IrrigationMetrics'
import { IrrigationSystemWizard } from '@/components/irrigation/IrrigationSystemWizard'
import { IrrigationZoneWizard } from '@/components/irrigation/IrrigationZoneWizard'
import { WateringLogForm } from '@/components/irrigation/WateringLogForm'

export default function IrrigationPage() {
  const { storageProvider } = useStorage()
  const [systems, setSystems] = useState<IrrigationSystem[]>([])
  const [zones, setZones] = useState<IrrigationZone[]>([])
  const [logs, setLogs] = useState<WateringLog[]>([])
  const [selectedSystem, setSelectedSystem] = useState<IrrigationSystem | null>(null)
  const [loading, setLoading] = useState(true)

  const [showSystemWizard, setShowSystemWizard] = useState(false)
  const [showZoneWizard, setShowZoneWizard] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [systemsData, zonesData, logsData] = await Promise.all([
        storageProvider.getIrrigationSystems(),
        storageProvider.getIrrigationZones(),
        storageProvider.getWateringLogs()
      ])

      setSystems(systemsData)
      setZones(zonesData)
      setLogs(logsData)

      if (systemsData.length > 0 && !selectedSystem) {
        setSelectedSystem(systemsData[0])
      }
    } catch (error) {
      console.error('Error loading irrigation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSystem = async (system: Omit<IrrigationSystem, 'id'>) => {
    await storageProvider.createIrrigationSystem(system)
    await loadData()
    setShowSystemWizard(false)
  }

  const handleCreateZone = async (zone: Omit<IrrigationZone, 'id'>) => {
    await storageProvider.createIrrigationZone(zone)
    await loadData()
    setShowZoneWizard(false)
  }

  const handleLogWatering = async (log: Omit<WateringLog, 'id'>) => {
    await storageProvider.createWateringLog(log)
    await loadData()
    setShowLogForm(false)
  }

  if (loading) {
    return <div className="p-6">Caricamento...</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💧 Irrigazione</h1>
          <p className="text-gray-600 mt-1">Gestione sistemi e zone irrigue</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setShowLogForm(true)} variant="outline">
            📝 Registra Irrigazione
          </Button>
          <Button onClick={() => setShowZoneWizard(true)} variant="outline">
            ➕ Nuova Zona
          </Button>
          <Button onClick={() => setShowSystemWizard(true)}>
            🔧 Nuovo Sistema
          </Button>
        </div>
      </div>

      {/* Metriche */}
      <IrrigationMetrics
        systems={systems}
        zones={zones}
        logs={logs}
      />

      {/* Sistema selezionato */}
      {systems.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold mb-2">Nessun sistema irrigazione</h3>
          <p className="text-gray-600 mb-4">Crea il tuo primo sistema per iniziare</p>
          <Button onClick={() => setShowSystemWizard(true)}>
            Crea Sistema
          </Button>
        </Card>
      ) : (
        <>
          {/* Tabs sistemi */}
          <div className="flex gap-2 border-b">
            {systems.map(system => (
              <button
                key={system.id}
                onClick={() => setSelectedSystem(system)}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  selectedSystem?.id === system.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {system.name}
              </button>
            ))}
          </div>

          {/* Sistema corrente */}
          {selectedSystem && (
            <>
              <IrrigationSystemCard
                system={selectedSystem}
                onEdit={() => {/* TODO */}}
                onDelete={() => {/* TODO */}}
              />

              <IrrigationZoneList
                zones={zones.filter(z => z.systemId === selectedSystem.id)}
                onEditZone={() => {/* TODO */}}
                onDeleteZone={() => {/* TODO */}}
                onWaterZone={(zone) => {
                  setShowLogForm(true)
                  // Pre-fill zone
                }}
              />

              <WateringHistory
                logs={logs.filter(l =>
                  zones.find(z => z.id === l.zoneId)?.systemId === selectedSystem.id
                )}
              />
            </>
          )}
        </>
      )}

      {/* Wizards */}
      {showSystemWizard && (
        <IrrigationSystemWizard
          onComplete={handleCreateSystem}
          onCancel={() => setShowSystemWizard(false)}
        />
      )}

      {showZoneWizard && selectedSystem && (
        <IrrigationZoneWizard
          system={selectedSystem}
          onComplete={handleCreateZone}
          onCancel={() => setShowZoneWizard(false)}
        />
      )}

      {showLogForm && (
        <WateringLogForm
          zones={zones}
          onSubmit={handleLogWatering}
          onCancel={() => setShowLogForm(false)}
        />
      )}
    </div>
  )
}
```

### Componenti Irrigazione

**1. IrrigationMetrics** - `/components/irrigation/IrrigationMetrics.tsx`
```typescript
// KPI cards: Zone totali, Litri/mese, Costo acqua, Zone irrigate oggi
```

**2. IrrigationSystemCard** - `/components/irrigation/IrrigationSystemCard.tsx`
```typescript
// Dettagli sistema: tipo, portata, pressione, timer, valvole
```

**3. IrrigationZoneList** - `/components/irrigation/IrrigationZoneList.tsx`
```typescript
// Tabella zone con: nome, area, metodo, portata, ultima irrigazione
// Azioni: Modifica, Elimina, Irriga Ora
```

**4. WateringHistory** - `/components/irrigation/WateringHistory.tsx`
```typescript
// Grafico irrigazioni nel tempo + tabella storico
```

**5. IrrigationSystemWizard** - `/components/irrigation/IrrigationSystemWizard.tsx`
```typescript
// Wizard creazione sistema: tipo → fonte acqua → pressione → portata
```

**6. IrrigationZoneWizard** - `/components/irrigation/IrrigationZoneWizard.tsx`
```typescript
// Wizard zona: nome → area → metodo → config tecnica → piante
```

**7. WateringLogForm** - `/components/irrigation/WateringLogForm.tsx`
```typescript
// Form registrazione: zona, data/ora, durata, litri, meteo, umidità
```

### Alert Sistema

**Aggiungi a healthAlertEngine.ts**:

```typescript
async function checkIrrigationDeficit(context: AlertCheckContext): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = []
  const zones = await storageProvider.getIrrigationZones(context.garden.id)
  const logs = await storageProvider.getWateringLogs(undefined, context.garden.id)

  for (const zone of zones) {
    const lastWatering = logs
      .filter(l => l.zoneId === zone.id)
      .sort((a, b) => new Date(b.wateredAt).getTime() - new Date(a.wateredAt).getTime())[0]

    if (!lastWatering) continue

    const daysSinceWatering = daysBetween(new Date(lastWatering.wateredAt), new Date())

    // Alert se non irrigato da >3 giorni in estate, >5 giorni resto anno
    const threshold = [6, 7, 8].includes(new Date().getMonth()) ? 3 : 5

    if (daysSinceWatering > threshold) {
      alerts.push({
        gardenId: context.garden.id,
        alertType: 'water',
        severity: daysSinceWatering > threshold + 2 ? 'critical' : 'warning',
        source: 'irrigation_tracking',
        title: `Zona "${zone.name}" senz'acqua`,
        message: `Ultima irrigazione ${daysSinceWatering} giorni fa. Piante potrebbero soffrire stress idrico.`,
        recommendation: `Irriga con ${zone.flowRateLh ? Math.round(zone.areaSqm * 5 / zone.flowRateLh) : 30} minuti di irrigazione.`,
        metadata: {
          zoneId: zone.id,
          daysSinceWatering,
          lastWateredAt: lastWatering.wateredAt
        }
      })
    }
  }

  return alerts
}
```

### Aggiornare Navigation

**File**: `/components/professional/Sidebar.tsx`

Aggiungere voce menu:

```typescript
{
  label: 'GESTIONE AVANZATA',
  tier: 'PRO',
  collapsible: true,
  items: [
    { href: '/app/irrigation', label: 'Irrigazione', icon: Droplets }, // NUOVO
    { href: '/app/fertilization', label: 'Fertilizzazione', icon: Leaf }, // NUOVO (Sprint 2)
    { href: '/app/analytics', label: 'Analytics', icon: BarChart },
    { href: '/app/treatments', label: 'Trattamenti', icon: Syringe },
    { href: '/app/mechanical-work', label: 'Lavorazioni', icon: Tractor },
    { href: '/app/export', label: 'Export', icon: Download },
  ]
}
```

---

## Sprint 2: Sistema Fertilizzazione Completo (5 giorni)

### Obiettivo
Creare pagina dedicata `/app/fertilization` con piano fertilizzazione, storico interventi, dashboard nutrienti.

### Database Migration

**File**: `/database/migrations/add_fertilization_system.sql`

```sql
-- Tabella fertilizzazioni effettuate
CREATE TABLE fertilizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,

  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Prodotto
  product_name TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN (
    'Organic', 'Mineral', 'OrganicMineral', 'Foliar', 'Biostimulant'
  )),

  -- NPK
  n_percentage DECIMAL(5,2),
  p_percentage DECIMAL(5,2),
  k_percentage DECIMAL(5,2),

  -- Microelementi (opzionale)
  micronutrients JSONB, -- { "Fe": 2, "Mg": 1.5, ... }

  -- Dosaggio
  quantity DECIMAL(8,2) NOT NULL,
  quantity_unit TEXT NOT NULL CHECK (quantity_unit IN ('g', 'kg', 'ml', 'L')),
  area_sqm DECIMAL(8,2),
  dosage_per_sqm DECIMAL(8,2), -- Calcolato: quantity / area_sqm

  -- Modalità
  application_method TEXT CHECK (application_method IN (
    'Soil', 'Foliar', 'Fertigation', 'Broadcast', 'SideDressing'
  )),

  -- Fase
  growth_phase TEXT CHECK (growth_phase IN (
    'Establishment', 'Vegetative', 'Flowering', 'Fruiting', 'Ripening'
  )),

  -- Meteo
  weather_condition TEXT,
  soil_temperature_c DECIMAL(4,2),

  -- Motivo
  reason TEXT, -- "Carenza azoto", "Piano stagionale", "Boost fioritura"
  notes TEXT,

  -- Tracking
  cost_eur DECIMAL(8,2),
  operator TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella analisi suolo
CREATE TABLE soil_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,

  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  lab_name TEXT,

  -- Parametri base
  ph DECIMAL(3,1),
  ec_ms_cm DECIMAL(5,2), -- Conducibilità elettrica
  organic_matter_percentage DECIMAL(5,2),

  -- Macro-nutrienti (ppm o mg/kg)
  n_ppm DECIMAL(8,2),
  p_ppm DECIMAL(8,2),
  k_ppm DECIMAL(8,2),
  ca_ppm DECIMAL(8,2),
  mg_ppm DECIMAL(8,2),
  s_ppm DECIMAL(8,2),

  -- Micro-nutrienti
  fe_ppm DECIMAL(8,2),
  mn_ppm DECIMAL(8,2),
  zn_ppm DECIMAL(8,2),
  cu_ppm DECIMAL(8,2),
  b_ppm DECIMAL(8,2),
  mo_ppm DECIMAL(8,2),

  -- Texture
  clay_percentage DECIMAL(5,2),
  silt_percentage DECIMAL(5,2),
  sand_percentage DECIMAL(5,2),
  texture_class TEXT, -- "Sandy Loam", "Clay", ecc.

  -- Note
  recommendations TEXT, -- Raccomandazioni laboratorio
  notes TEXT,

  -- Allegati
  pdf_url TEXT, -- Link a PDF analisi

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella piano fertilizzazione
CREATE TABLE fertilization_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE NOT NULL,
  plant_name TEXT NOT NULL,
  variety TEXT,

  season TEXT NOT NULL, -- "Spring 2025"

  -- Piano generato
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'ai', -- 'ai', 'manual', 'soil_analysis'

  -- Schedule
  schedule JSONB NOT NULL, -- Array di interventi pianificati
  /*
  [
    {
      "phase": "Establishment",
      "daysAfterPlanting": 7,
      "npk": "10-20-10",
      "dosageGPerSqm": 50,
      "method": "Soil",
      "notes": "Radicazione iniziale"
    },
    ...
  ]
  */

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),

  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_fertilizations_garden ON fertilizations(garden_id);
CREATE INDEX idx_fertilizations_plant ON fertilizations(plant_name);
CREATE INDEX idx_fertilizations_date ON fertilizations(applied_at);
CREATE INDEX idx_soil_analyses_garden ON soil_analyses(garden_id);
CREATE INDEX idx_fertilization_plans_garden ON fertilization_plans(garden_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_fertilizations
  BEFORE UPDATE ON fertilizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_soil_analyses
  BEFORE UPDATE ON soil_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_fertilization_plans
  BEFORE UPDATE ON fertilization_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE fertilizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertilization_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY fertilizations_policy ON fertilizations
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY soil_analyses_policy ON soil_analyses
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));

CREATE POLICY fertilization_plans_policy ON fertilization_plans
  FOR ALL USING (garden_id IN (SELECT id FROM gardens WHERE user_id = auth.uid()));
```

### Pagina Fertilizzazione

**File**: `/app/(dashboard)/app/fertilization/page.tsx`

Struttura simile a irrigation con:
- Dashboard NPK (grafico trend nutrienti)
- Piano fertilizzazione stagionale
- Storico fertilizzazioni
- Form registrazione fertilizzazione
- Upload analisi suolo (PDF)

### Componenti Fertilizzazione

1. **FertilizationMetrics** - KPI: NPK applicato, costo totale, interventi/mese
2. **NPKTrendChart** - Grafico trend N, P, K nel tempo
3. **FertilizationPlan** - Tabella piano stagionale con checkbox completamento
4. **FertilizationHistory** - Storico interventi con filtri
5. **FertilizationForm** - Form registrazione completo
6. **SoilAnalysisUpload** - Upload PDF + parsing campi
7. **NutrientDeficitAlert** - Alert carenze da analisi suolo

---

## Sprint 3: PDF Export Professionale (3 giorni)

### Obiettivo
Implementare export PDF reale con grafica professionale per analytics, treatments, calendario.

### Installazione Dipendenze

```bash
npm install pdfkit @types/pdfkit
npm install canvas @napi-rs/canvas  # Per grafici embedded
```

### API PDF Export

**File**: `/app/api/export/pdf/route.ts` (aggiornare)

```typescript
import PDFDocument from 'pdfkit'
import { createCanvas } from '@napi-rs/canvas'

export async function POST(request: Request) {
  const { type, gardenId, dateRange } = await request.json()

  // Create PDF document
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  // Buffer stream
  const chunks: Buffer[] = []
  doc.on('data', chunk => chunks.push(chunk))

  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
  })

  // Header
  doc.fontSize(24).text('OrtoMio - Report', { align: 'center' })
  doc.fontSize(10).text(new Date().toLocaleDateString('it-IT'), { align: 'center' })
  doc.moveDown(2)

  if (type === 'analytics') {
    await generateAnalyticsPDF(doc, gardenId, dateRange)
  } else if (type === 'treatments') {
    await generateTreatmentsPDF(doc, gardenId, dateRange)
  } else if (type === 'calendar') {
    await generateCalendarPDF(doc, gardenId, dateRange)
  }

  // Finalize
  doc.end()

  const pdfBuffer = await pdfPromise

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ortomio-${type}-${Date.now()}.pdf"`
    }
  })
}

async function generateAnalyticsPDF(doc, gardenId, dateRange) {
  // Carica dati analytics
  const data = await loadAnalyticsData(gardenId, dateRange)

  // Sezione KPI
  doc.fontSize(16).text('📊 Metriche Principali', { underline: true })
  doc.moveDown()

  doc.fontSize(12).text(`Produzione Totale: ${data.totalProduction} kg`)
  doc.text(`Valore Stimato: €${data.totalRevenue}`)
  doc.text(`ROI: ${data.roiPercentage}%`)
  doc.moveDown(2)

  // Sezione Grafici
  doc.fontSize(16).text('📈 Grafici', { underline: true })
  doc.moveDown()

  // Genera grafico produzione (usando canvas)
  const chart = generateProductionChart(data.crops)
  const chartImage = chart.toBuffer('image/png')
  doc.image(chartImage, { width: 500 })

  doc.moveDown(2)

  // Tabella colture
  doc.fontSize(16).text('🌱 Dettaglio Colture', { underline: true })
  doc.moveDown()

  // Header tabella
  doc.fontSize(10)
  doc.text('Coltura', 50, doc.y, { width: 150, continued: true })
  doc.text('Kg', 200, doc.y, { width: 80, continued: true })
  doc.text('€/kg', 280, doc.y, { width: 80, continued: true })
  doc.text('Valore', 360, doc.y, { width: 100 })
  doc.moveDown()

  // Righe
  data.crops.forEach(crop => {
    doc.text(crop.name, 50, doc.y, { width: 150, continued: true })
    doc.text(crop.kg.toFixed(1), 200, doc.y, { width: 80, continued: true })
    doc.text(crop.pricePerKg.toFixed(2), 280, doc.y, { width: 80, continued: true })
    doc.text(`€${crop.totalValue.toFixed(2)}`, 360, doc.y, { width: 100 })
    doc.moveDown(0.5)
  })

  // Footer
  doc.fontSize(8).text(
    'Generato da OrtoMio PRO - https://ortomio.com',
    50,
    doc.page.height - 50,
    { align: 'center' }
  )
}

function generateProductionChart(crops) {
  const canvas = createCanvas(500, 300)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 500, 300)

  // Bar chart logic
  const maxKg = Math.max(...crops.map(c => c.kg))
  const barWidth = 400 / crops.length

  crops.forEach((crop, i) => {
    const barHeight = (crop.kg / maxKg) * 200
    const x = 50 + i * barWidth
    const y = 250 - barHeight

    // Bar
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(x, y, barWidth - 10, barHeight)

    // Label
    ctx.fillStyle = '#000000'
    ctx.font = '10px Arial'
    ctx.fillText(crop.name, x, 270)
    ctx.fillText(`${crop.kg}kg`, x, y - 5)
  })

  return canvas
}
```

### Template PDF Avanzati

Creare template con:
- Logo OrtoMio in header
- Tabelle formattate con bordi
- Grafici embedded (bar chart, pie chart, line chart)
- Paginazione automatica
- Footer con data/ora generazione
- Stile professionale (colori brand, font consistenti)

---

## Sprint 4: Wizard Colture Specializzate (4 giorni)

### Obiettivo
Completare wizard aggiunta olivo, vite, albero da frutto con step guidati e validazione.

### Wizard Olivo

**File**: `/components/olives/OliveTreeWizard.tsx`

**Step 1**: Varietà
- Dropdown varietà (da oliveMasterSheets)
- Auto-complete con search
- Info varietà selezionata (produttività, resistenza freddo, ecc.)

**Step 2**: Età e Impianto
- Data impianto (DatePicker)
- Età albero (calcolata o manuale)
- Sesto impianto: distanza file/pianta (m)
- Numero totale alberi

**Step 3**: Metodo Raccolta
- Radio buttons: Manual/Mechanical/Shaking
- Info metodo (pros/cons)
- Periodo raccolta preferito

**Step 4**: Configurazione Avanzata (PRO)
- Tipo oliveto: Intensivo/Tradizionale/Super-intensivo
- Irrigazione: Si/No + tipo
- Potatura: Vaso/Monocono/Spalliera
- Obiettivo: Olio/Tavola

**Step 5**: Riepilogo
- Visualizza tutti i dati inseriti
- Pulsante "Crea Oliveto"

### Wizard Vite

**File**: `/components/vineyard/VineWizard.tsx`

Simile a OliveTreeWizard con:
- Varietà uva (Sangiovese, Nebbiolo, ecc.)
- Clone (es. Sangiovese R24)
- Portinnesto (SO4, 1103P, ecc.)
- Sistema allevamento (Guyot, Cordone, Pergola)
- Brix target (default per varietà)
- Densità impianto (ceppi/ha)

### Wizard Albero Frutta

**File**: `/components/orchard/FruitTreeWizard.tsx`

Con:
- Categoria (Pomacee/Drupacee/Agrumi/Frutta Secca)
- Specie (Melo, Pero, Pesco, ecc.)
- Varietà con info impollinazione
- Portinnesto (nano, semi-vigore, vigore)
- Impollinatori richiesti (se self-sterile)
- Chill hours varietà

---

## Sprint 5: Form Registrazione Specializzate (3 giorni)

### 1. Form Frangitura Olive

**File**: `/components/olives/OliveMillingForm.tsx`

Campi:
- Data frangitura
- Kg olive frante
- Litri olio prodotto
- Resa % (calcolata automatica)
- Acidità %
- Perossidi (meq O2/kg)
- Polifenoli totali (mg/kg)
- Panel test score (opzionale)
- Frantoio
- Note organolettiche
- Costo frangitura €

Output:
- Salvato in tabella `olive_millings`
- Dashboard produzione olio aggiornata

### 2. Form Misura Brix

**File**: `/components/vineyard/BrixMeasurementForm.tsx`

Campi:
- Data misurazione
- Valore Brix °
- Campione (n° grappoli testati)
- Posizione grappolo (Alto/Medio/Basso)
- Note (colore, consistenza)

Output:
- Salvato in `vine_brix_readings`
- Grafico Brix aggiornato
- Calcolo giorni mancanti a vendemmia
- Alert se Brix >= target

### 3. Form Potatura Alberi

**File**: `/components/orchard/TreePruningForm.tsx`

Campi:
- Albero/Varietà
- Data potatura
- Tipo: Allevamento/Produzione/Rinnovo/Riforma
- Intensità: Leggera/Media/Pesante
- Legno rimosso (kg stimato)
- Durata lavoro (ore)
- Operatore
- Foto prima/dopo
- Note

Output:
- Salvato in `tree_pruning_logs`
- Storico potature per albero

---

## Sprint 6: Analytics Multi-Anno e Alert Avanzati (4 giorni)

### Analytics Multi-Anno

**Nuova sezione in /app/analytics**:

Tab "Confronto Anni":
- Dropdown selezione anni (2023, 2024, 2025)
- Grafici comparativi:
  - Produzione totale/anno (line chart)
  - ROI %/anno
  - Migliori colture/anno
  - Costi/anno
- Tabella pivot: Coltura × Anno × Kg

### Alert Avanzati

Completare healthAlertEngine con:

**1. Alert Safety Interval Trattamenti**
```typescript
async function checkTreatmentSafetyInterval(): Promise<HealthAlert[]> {
  const treatments = await storageProvider.getTreatments()
  const alerts: HealthAlert[] = []

  treatments.forEach(t => {
    if (!t.safetyIntervalDays) return

    const safetyEnd = addDays(new Date(t.date), t.safetyIntervalDays)
    const daysRemaining = daysBetween(new Date(), safetyEnd)

    if (daysRemaining > 0) {
      alerts.push({
        gardenId: t.gardenId,
        plantId: t.plantId,
        alertType: 'safety_interval',
        severity: 'critical',
        source: 'treatment_tracking',
        title: `⚠️ NON RACCOGLIERE ${t.plantName}`,
        message: `Periodo carenza attivo per ${t.product}. Ancora ${daysRemaining} giorni.`,
        recommendation: `Raccolta consentita dal ${safetyEnd.toLocaleDateString('it-IT')}`,
        metadata: { treatmentId: t.id, daysRemaining }
      })
    }
  })

  return alerts
}
```

**2. Alert Brix Target Vigneto**
```typescript
async function checkBrixTarget(): Promise<HealthAlert[]> {
  const vineyards = await storageProvider.getVineyards()
  const alerts: HealthAlert[] = []

  for (const vineyard of vineyards) {
    const readings = await storageProvider.getBrixReadings(vineyard.id)
    const latest = readings[readings.length - 1]

    if (!latest || !vineyard.brixTarget) continue

    if (latest.brix >= vineyard.brixTarget) {
      alerts.push({
        gardenId: vineyard.gardenId,
        alertType: 'harvest_ready',
        severity: 'info',
        source: 'brix_tracking',
        title: `🍇 ${vineyard.variety} pronta per vendemmia`,
        message: `Brix raggiunto: ${latest.brix}° (target ${vineyard.brixTarget}°)`,
        recommendation: 'Pianifica vendemmia nei prossimi 2-5 giorni per ottimale maturazione',
        metadata: { vineyardId: vineyard.id, currentBrix: latest.brix }
      })
    }
  }

  return alerts
}
```

**3. Alert Frangitura Urgente**
```typescript
async function checkOliveMillingUrgency(): Promise<HealthAlert[]> {
  const harvests = await storageProvider.getOliveHarvests()
  const alerts: HealthAlert[] = []

  harvests.forEach(h => {
    if (h.milled) return

    const hoursSinceHarvest = hoursBetween(new Date(h.harvestedAt), new Date())

    if (hoursSinceHarvest > 24) {
      alerts.push({
        gardenId: h.gardenId,
        alertType: 'quality_degradation',
        severity: hoursSinceHarvest > 48 ? 'critical' : 'warning',
        source: 'olive_tracking',
        title: '⚠️ Frangitura Urgente',
        message: `Olive raccolte ${hoursSinceHarvest}h fa. Qualità olio a rischio!`,
        recommendation: 'Frangi SUBITO per preservare polifenoli e bassa acidità',
        metadata: { harvestId: h.id, hoursSinceHarvest }
      })
    }
  })

  return alerts
}
```

---

## Riepilogo File da Creare/Modificare FASE 2

### Database Migrations (3 file)
1. `/database/migrations/add_irrigation_system.sql`
2. `/database/migrations/add_fertilization_system.sql`
3. `/database/migrations/add_specialized_crops_tracking.sql` (millings, brix, pruning)

### Pagine (2 nuove)
1. `/app/(dashboard)/app/irrigation/page.tsx`
2. `/app/(dashboard)/app/fertilization/page.tsx`

### Componenti Irrigazione (7 nuovi)
1. `/components/irrigation/IrrigationMetrics.tsx`
2. `/components/irrigation/IrrigationSystemCard.tsx`
3. `/components/irrigation/IrrigationZoneList.tsx`
4. `/components/irrigation/WateringHistory.tsx`
5. `/components/irrigation/IrrigationSystemWizard.tsx`
6. `/components/irrigation/IrrigationZoneWizard.tsx`
7. `/components/irrigation/WateringLogForm.tsx`

### Componenti Fertilizzazione (7 nuovi)
1. `/components/fertilization/FertilizationMetrics.tsx`
2. `/components/fertilization/NPKTrendChart.tsx`
3. `/components/fertilization/FertilizationPlan.tsx`
4. `/components/fertilization/FertilizationHistory.tsx`
5. `/components/fertilization/FertilizationForm.tsx`
6. `/components/fertilization/SoilAnalysisUpload.tsx`
7. `/components/fertilization/NutrientDeficitAlert.tsx`

### Wizard Colture (3 nuovi)
1. `/components/olives/OliveTreeWizard.tsx`
2. `/components/vineyard/VineWizard.tsx`
3. `/components/orchard/FruitTreeWizard.tsx`

### Form Specializzate (3 nuovi)
1. `/components/olives/OliveMillingForm.tsx`
2. `/components/vineyard/BrixMeasurementForm.tsx`
3. `/components/orchard/TreePruningForm.tsx`

### API/Servizi (2 modifiche)
1. `/app/api/export/pdf/route.ts` (aggiornare con PDF reale)
2. `/services/healthAlertEngine.ts` (aggiungere 4 nuove funzioni alert)

### Storage Provider (1 modifica)
1. `/packages/core/storage/interface.ts` (aggiungere metodi irrigation + fertilization)

### Navigation (1 modifica)
1. `/components/professional/Sidebar.tsx` (aggiungere Irrigazione e Fertilizzazione)

### Analytics (1 estensione)
1. `/app/(dashboard)/app/analytics/page.tsx` (aggiungere tab multi-anno)

**TOTALE: ~30 file nuovi + 5 modifiche = 35 file**

---

## Timeline e Effort

| Sprint | Giorni | Effort | Priorità |
|--------|--------|--------|----------|
| Sprint 1: Irrigazione | 5 | Alta | CRITICAL |
| Sprint 2: Fertilizzazione | 5 | Alta | CRITICAL |
| Sprint 3: PDF Export | 3 | Media | CRITICAL |
| Sprint 4: Wizard Colture | 4 | Media | HIGH |
| Sprint 5: Form Registrazione | 3 | Bassa | HIGH |
| Sprint 6: Analytics & Alert | 4 | Media | MEDIUM |

**TOTALE: 24 giorni lavorativi (~5 settimane)**

---

## Metriche di Successo FASE 2

### Completamento Funzionalità:
- ✅ Irrigazione: 70% → **100%**
- ✅ Fertilizzazione: 65% → **100%**
- ✅ Export PDF: 60% → **95%**
- ✅ Colture Specializzate: 75% → **95%**
- ✅ Analytics: 80% → **90%**
- ✅ Alert Sistema: 30% → **90%**

### KPI Utente:
- ⬆️ +40% adozione funzionalità PRO
- ⬆️ +60% registrazione dati irrigazione/fertilizzazione
- ⬆️ +80% completion wizard colture
- ⬆️ +50% export PDF generati/mese
- ⬇️ -30% carenze nutrienti non rilevate

---

## Domande Pre-Implementazione

1. **Storage Priority**: Iniziare con migrazione Irrigazione a Supabase (Sprint 1) o procedere in parallelo con Fertilizzazione?
2. **PDF Library**: Preferisci `pdfkit` (Node.js) o `puppeteer` (headless browser, più potente ma più pesante)?
3. **Alert Delivery**: Solo dashboard in-app o anche notifiche email/push?
4. **Wizard UX**: Preferisci wizard multi-step (4-5 step) o form singolo lungo con sezioni collapsable?
5. **Analytics Multi-Anno**: Limite storico dati (ultimi 3 anni, 5 anni, illimitato)?

---

## Note Finali

Questo piano copre il **completamento al 95%** delle funzionalità PRO Professional.

**Prossimi passi**:
1. Approvazione piano FASE 2
2. Setup database migrations (Sprint 1)
3. Implementazione pagina Irrigazione
4. Test e deploy incrementale

---

**Ready for approval and implementation! 🚀**
