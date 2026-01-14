# Precision Agriculture Evolution - Requirements Document

## 🎯 PROJECT OVERVIEW

**Project Name**: Precision Agriculture Evolution - Phase 1  
**Timeline**: 6 weeks  
**Priority**: HIGH - Critical for market dominance  
**Status**: Ready for implementation

## 📋 CURRENT STATE ANALYSIS

### ✅ STRONG FOUNDATION ALREADY IN PLACE
OrtoMio has successfully implemented:
- **NDVI Satellite System** - Complete with Sentinel Hub integration
- **Prescription Maps** - Full VRT system with 5 export formats
- **Smart Hub IoT** - Universal sensor integration
- **Integrated Staggering** - World's first coordinated planning system
- **Drone Operations** - Complete aerial analysis platform
- **Nutrition & Treatments** - Bio/Traditional system

### ❌ IDENTIFIED GAPS FOR EVOLUTION
1. **Disconnected Workflows**: Users must manually navigate between NDVI alerts and action creation
2. **Missing Validation Loop**: No systematic field verification of sensor alerts
3. **Export Complexity**: High error rate when exporting to GPS terminals
4. **Static Zone Management**: Zones created but not reused or versioned

## 🚀 PHASE 1 REQUIREMENTS (6 weeks)

### REQUIREMENT 1: Action Button Integration
**Epic**: Insight → Action in 1 Click

#### User Stories
```
As an agricultural professional,
I want to create interventions directly from NDVI stress maps,
So that I can respond to crop issues immediately without losing context.

As a farm manager,
I want to generate prescription maps from drone-detected problem areas,
So that I can address issues with precision rather than blanket treatments.

As an IoT user,
I want to create irrigation tasks directly from soil moisture alerts,
So that I can respond to plant stress in real-time.
```

#### Acceptance Criteria
- [ ] **NDVI Integration**: "Create Intervention" button on all NDVI stress visualizations
- [ ] **Drone Integration**: "Create Intervention" button on drone anomaly detection results
- [ ] **IoT Integration**: "Create Intervention" button on Smart Hub critical alerts
- [ ] **Workflow Wizard**: 4-step guided process (Scouting/Prescription/Irrigation/Treatment)
- [ ] **Auto-population**: Zone coordinates, area, and crop data pre-filled
- [ ] **Context Preservation**: Maintain source data (NDVI values, sensor readings) in intervention

#### Technical Requirements
```typescript
interface ActionButtonProps {
  sourceType: 'ndvi' | 'drone' | 'iot';
  sourceData: NDVIData | DroneData | IoTAlert;
  zoneId: string;
  onActionCreated: (action: InterventionAction) => void;
}

interface InterventionAction {
  type: 'scouting' | 'prescription' | 'irrigation' | 'treatment';
  zoneId: string;
  sourceContext: {
    type: string;
    data: any;
    timestamp: Date;
  };
  parameters: Record<string, any>;
}
```

#### Definition of Done
- [ ] Action buttons visible and functional on NDVI, Drone, and IoT interfaces
- [ ] Wizard completes successfully for all 4 intervention types
- [ ] Source context preserved and accessible in created interventions
- [ ] Mobile responsive design tested
- [ ] Integration tests passing for all source types

### REQUIREMENT 2: Smart Scouting System
**Epic**: Automated Field Validation

#### User Stories
```
As a precision agriculture specialist,
I want automatic scouting tasks generated for NDVI anomalies,
So that I can validate satellite data with ground truth observations.

As a farm worker,
I want guided checklists for field scouting,
So that I can collect consistent, valuable data even without expert knowledge.

As an agronomist,
I want geotagged photos and notes from scouting activities,
So that I can build a comprehensive field history for decision making.
```

#### Acceptance Criteria
- [ ] **Automatic Task Generation**: Scouting tasks created when NDVI < threshold or IoT alerts trigger
- [ ] **Crop-Specific Checklists**: Symptom identification guides for major crops (tomatoes, lettuce, etc.)
- [ ] **Photo Capture**: Geotagged photos with automatic GPS coordinates
- [ ] **Note System**: Structured field notes with predefined categories
- [ ] **Zone Integration**: Tasks automatically linked to existing zone management system
- [ ] **Completion Tracking**: Task status and completion analytics

#### Technical Requirements
```typescript
interface ScoutingTask {
  id: string;
  zoneId: string;
  triggerType: 'ndvi_alert' | 'iot_alert' | 'manual';
  triggerData: any;
  cropType: string;
  status: 'pending' | 'in_progress' | 'completed';
  checklist: ScoutingChecklistItem[];
  photos: GeotaggedPhoto[];
  notes: FieldNote[];
  createdAt: Date;
  completedAt?: Date;
}

interface ScoutingChecklistItem {
  category: 'disease' | 'pest' | 'nutrient' | 'water_stress';
  question: string;
  response?: 'yes' | 'no' | 'unsure';
  severity?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}
```

#### Definition of Done
- [ ] Automatic task generation working for NDVI and IoT triggers
- [ ] Crop-specific checklists implemented for top 5 crops
- [ ] Photo capture with GPS working on mobile devices
- [ ] Task completion workflow functional end-to-end
- [ ] Analytics dashboard showing task completion rates

### REQUIREMENT 3: Export Wizard Enhancement
**Epic**: Error-Free Machinery Integration

#### User Stories
```
As a farm equipment operator,
I want a guided export process for my specific GPS terminal,
So that I can avoid compatibility errors and failed field applications.

As a precision agriculture consultant,
I want to validate prescription maps before export,
So that I can ensure data quality and prevent costly field mistakes.

As a farm manager,
I want customizable export templates for my operation,
So that I can standardize formats across my team and equipment.
```

#### Acceptance Criteria
- [ ] **Equipment Database**: Support for 20+ major GPS terminal brands/models
- [ ] **Guided Selection**: Step-by-step wizard for brand → model → format selection
- [ ] **Pre-Export Validation**: Coordinate system, units, and data range checks
- [ ] **File Preview**: Visual preview of export data before download
- [ ] **Template System**: Saveable templates for repeated use
- [ ] **Format Support**: ISO-XML, Shapefile, KML, CSV, GeoTIFF maintained and enhanced

#### Technical Requirements
```typescript
interface ExportWizardConfig {
  equipmentBrand: string;
  equipmentModel: string;
  outputFormat: 'iso-xml' | 'shapefile' | 'kml' | 'csv' | 'geotiff';
  coordinateSystem: string;
  units: 'metric' | 'imperial';
  validation: ValidationRules;
}

interface ValidationRules {
  coordinateRange: [number, number, number, number]; // bbox
  valueRange: [number, number];
  requiredFields: string[];
  formatSpecificRules: Record<string, any>;
}
```

#### Definition of Done
- [ ] Equipment database populated with 20+ terminals
- [ ] Wizard workflow functional for all supported formats
- [ ] Validation catches common error conditions
- [ ] Preview accurately represents export data
- [ ] Template save/load functionality working
- [ ] Error rate reduced by 90% in testing

## 🔧 TECHNICAL ARCHITECTURE

### Database Schema Changes
```sql
-- Action buttons and interventions
CREATE TABLE intervention_actions (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  zone_id UUID REFERENCES zones(id),
  source_context JSONB NOT NULL,
  parameters JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scouting system
CREATE TABLE scouting_tasks (
  id UUID PRIMARY KEY,
  zone_id UUID REFERENCES zones(id),
  trigger_type TEXT NOT NULL,
  trigger_data JSONB,
  crop_type TEXT,
  status TEXT DEFAULT 'pending',
  checklist JSONB,
  photos JSONB[],
  notes JSONB[],
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Export templates
CREATE TABLE export_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  equipment_brand TEXT,
  equipment_model TEXT,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
```typescript
// Action buttons
POST /api/actions/create-intervention
GET /api/actions/available/:zoneId

// Scouting
POST /api/scouting/tasks
GET /api/scouting/tasks/:gardenId
PUT /api/scouting/tasks/:taskId
POST /api/scouting/tasks/:taskId/photos

// Export wizard
GET /api/export/equipment
POST /api/export/validate
POST /api/export/preview
GET /api/export/templates/:userId
POST /api/export/templates
```

### Component Structure
```
components/
├── actions/
│   ├── ActionButton.tsx           # Reusable action button
│   ├── InterventionWizard.tsx     # 4-step intervention creation
│   └── ActionHistory.tsx          # Track created actions
├── scouting/
│   ├── ScoutingTaskList.tsx       # Task management interface
│   ├── ScoutingForm.tsx           # Field data collection
│   ├── PhotoCapture.tsx           # Geotagged photo capture
│   └── ChecklistBuilder.tsx       # Crop-specific checklists
└── export/
    ├── ExportWizard.tsx           # Guided export process
    ├── EquipmentSelector.tsx      # Brand/model selection
    ├── ValidationPanel.tsx        # Pre-export validation
    └── TemplateManager.tsx        # Template save/load
```

## 📊 SUCCESS METRICS

### Phase 1 KPIs
- **Workflow Efficiency**: 70% reduction in clicks from alert to action creation
- **Field Validation**: 80% of alerts validated through scouting within 24 hours
- **Export Success**: 90% reduction in GPS terminal import errors
- **User Adoption**: 60% of users utilize new integrated workflows within 30 days

### Technical Metrics
- **Performance**: All new features load within 3 seconds
- **Reliability**: 99.5% uptime for new API endpoints
- **Mobile**: 95% mobile compatibility score
- **Error Rate**: <1% error rate in production

## 🎯 ACCEPTANCE CRITERIA SUMMARY

### Must Have (P0)
- [ ] Action buttons functional on NDVI, Drone, IoT interfaces
- [ ] Scouting task generation and completion workflow
- [ ] Export wizard with equipment database and validation
- [ ] Mobile responsive design for all new features
- [ ] Integration with existing zone management system

### Should Have (P1)
- [ ] Advanced checklist customization
- [ ] Batch export operations
- [ ] Analytics dashboard for new workflows
- [ ] Template sharing between users

### Could Have (P2)
- [ ] Offline mode for scouting tasks
- [ ] Advanced photo analysis (AI crop health detection)
- [ ] Integration with external weather APIs for scouting timing

## 🚀 IMPLEMENTATION PHASES

### Week 1-2: Action Button Integration
- Implement ActionButton component
- Create InterventionWizard workflow
- Integrate with existing NDVI, Drone, IoT systems
- Testing and refinement

### Week 3-4: Smart Scouting System
- Build scouting task management
- Implement photo capture and GPS tagging
- Create crop-specific checklists
- Integration testing

### Week 5-6: Export Wizard Enhancement
- Build equipment database and selection
- Implement validation and preview systems
- Create template management
- End-to-end testing and optimization

---

**Document Version**: 1.0  
**Created**: January 12, 2026  
**Status**: Ready for Development Sprint Planning