# Migration Implementation Guide

## Quick Reference: What Needs to Be Done

### 1. CRITICAL MISSING ROUTES (Create These First)

#### Route 1: `/app/zones` - Zone Management
**Status**: ❌ MISSING - CRITICAL
**Files to Create**:
- `app/app/zones/page.tsx` - Main zone management page
- `components/zones/ZoneManager.tsx` - Zone management component
- `components/zones/ZoneForm.tsx` - Zone creation/editing form
- `components/zones/ZoneList.tsx` - Zone list view
- `components/zones/FieldRowManager.tsx` - Field and row management

**Services Needed**:
- `services/zoneManagementService.ts` - Zone CRUD operations
- `services/zoneMappingService.ts` - Zone to bed/row mapping

**Database Tables**:
- `zones` - Zone data
- `zone_fields` - Fields within zones
- `zone_rows` - Rows within fields

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/settings/ZoneFieldRowManager.tsx
vcchiortomio/vecchia app/components/prescription/ZoneManagementPanel.tsx
vcchiortomio/vecchia app/services/zoneManagementService.ts
vcchiortomio/vecchia app/services/zoneMappingService.ts
```

---

#### Route 2: `/app/harvest` - Harvest Management
**Status**: ❌ MISSING - CRITICAL
**Files to Create**:
- `app/app/harvest/page.tsx` - Main harvest page
- `components/harvest/HarvestDashboard.tsx` - Harvest dashboard
- `components/harvest/HarvestRegistrationModal.tsx` - Register harvest
- `components/harvest/QuickHarvestForm.tsx` - Quick entry form
- `components/harvest/HarvestHistory.tsx` - Harvest history

**Services Needed**:
- `services/harvestService.ts` - Harvest management (check if exists)

**Database Tables**:
- `harvests` - Harvest records
- `harvest_items` - Individual harvest items

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/harvest/HarvestRegistrationModal.tsx
vcchiortomio/vecchia app/components/harvest/QuickHarvestForm.tsx
vcchiortomio/vecchia app/components/HarvestLog.tsx
vcchiortomio/vecchia app/components/HarvestAnalytics.tsx
```

---

#### Route 3: `/app/calendar` - Integrated Calendar
**Status**: ❌ MISSING - CRITICAL
**Files to Create**:
- `app/app/calendar/page.tsx` - Main calendar page
- `components/calendar/IntegratedCalendar.tsx` - Calendar component
- `components/calendar/CalendarViewSwitcher.tsx` - View switcher
- `components/calendar/DayView.tsx` - Day view
- `components/calendar/WeekView.tsx` - Week view
- `components/calendar/MonthView.tsx` - Month view

**Services Needed**:
- `services/calendarService.ts` - Calendar operations

**Database Tables**:
- `calendar_events` - Calendar events
- `calendar_tasks` - Calendar tasks

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/calendar/IntegratedCalendarWithChallenges.tsx
vcchiortomio/vecchia app/components/calendar/CalendarViewSwitcher.tsx
vcchiortomio/vecchia app/components/calendar/DayView.tsx
vcchiortomio/vecchia app/components/calendar/WeekView.tsx
```

---

#### Route 4: `/app/treatments` - Treatment Planning
**Status**: ❌ MISSING - CRITICAL
**Files to Create**:
- `app/app/treatments/page.tsx` - Main treatments page
- `components/treatments/TreatmentDashboard.tsx` - Treatment dashboard
- `components/treatments/TreatmentPlanner.tsx` - Treatment planner
- `components/treatments/TreatmentRegistry.tsx` - Treatment registry
- `components/treatments/TreatmentHistory.tsx` - Treatment history

**Services Needed**:
- `services/treatmentRegistryService.ts` - Treatment management

**Database Tables**:
- `treatments` - Treatment records
- `treatment_applications` - Treatment applications

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/phyto/TreatmentPlanner.tsx
vcchiortomio/vecchia app/components/phyto/TreatmentRegistry.tsx
vcchiortomio/vecchia app/services/treatmentRegistryService.ts
```

---

### 2. HIGH PRIORITY ROUTES (Create After Critical)

#### Route 5: `/app/compliance` - GlobalGAP Compliance
**Status**: ❌ MISSING - HIGH
**Files to Create**:
- `app/app/compliance/page.tsx` - Main compliance page
- `components/compliance/ComplianceDashboard.tsx` - Dashboard
- `components/compliance/GlobalGapDashboard.tsx` - GlobalGAP dashboard
- `components/compliance/SelfAssessmentForm.tsx` - Self-assessment
- `components/compliance/RiskManagementPlan.tsx` - Risk management
- `components/compliance/RecallProcedure.tsx` - Recall procedures

**Services Needed**:
- `services/globalGapComplianceService.ts` - GlobalGAP compliance

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/compliance/GlobalGapDashboard.tsx
vcchiortomio/vecchia app/components/compliance/SelfAssessmentForm.tsx
vcchiortomio/vecchia app/components/compliance/RiskManagementPlan.tsx
vcchiortomio/vecchia app/components/compliance/RecallProcedure.tsx
vcchiortomio/vecchia app/services/globalGapComplianceService.ts
```

---

#### Route 6: `/app/agronomist` - Agronomist Consultations
**Status**: ❌ MISSING - HIGH
**Files to Create**:
- `app/app/agronomist/page.tsx` - Main agronomist page
- `components/agronomist/AgronomistDashboard.tsx` - Dashboard
- `components/agronomist/AgronomistSearch.tsx` - Search agronomists
- `components/agronomist/ConsultationForm.tsx` - Request consultation
- `components/agronomist/ConsultationList.tsx` - List consultations
- `components/agronomist/ContactAgronomist.tsx` - Contact form

**Services Needed**:
- `services/agronomistService.ts` - Agronomist management

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/agronomist/AgronomistSearch.tsx
vcchiortomio/vecchia app/components/agronomist/ConsultationForm.tsx
vcchiortomio/vecchia app/components/agronomist/ConsultationList.tsx
vcchiortomio/vecchia app/components/agronomist/ContactAgronomist.tsx
vcchiortomio/vecchia app/services/agronomistService.ts
```

---

### 3. EXTEND EXISTING ROUTES

#### Extend `/app/settings` - Add Bed/Row Management
**Status**: ⚠️ PARTIAL - HIGH
**Files to Add**:
- `components/settings/BedManager.tsx` - Bed management
- `components/settings/RowManager.tsx` - Row management
- `components/gardens/BedForm.tsx` - Bed form
- `components/gardens/RowManagerModal.tsx` - Row modal

**Services Needed**:
- `services/bedService.ts` - Bed management
- `services/bedMigrationService.ts` - Bed migration

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/gardens/BedManager.tsx
vcchiortomio/vecchia app/components/gardens/RowManagerModal.tsx
vcchiortomio/vecchia app/components/gardens/BedForm.tsx
vcchiortomio/vecchia app/services/bedService.ts
```

---

#### Extend `/app/planner` - Add Missing Components
**Status**: ⚠️ PARTIAL - HIGH
**Files to Add**:
- `components/planner/ZoneMappingTool.tsx` - Zone mapping
- `components/planner/CultivationSystemSelector.tsx` - System selection
- `components/planner/CultivationMethodSelector.tsx` - Method selection
- `components/planner/VarietySelector.tsx` - Variety selection
- `components/planner/PlantLifecycleTimeline.tsx` - Lifecycle view
- `components/planner/GeographicFeasibilityCard.tsx` - Feasibility check
- `components/planner/CompanionPlants.tsx` - Companion planting
- `components/planner/TimelineComparison.tsx` - Timeline comparison

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/planner/ZoneMappingTool.tsx
vcchiortomio/vecchia app/components/planner/CultivationSystemSelector.tsx
vcchiortomio/vecchia app/components/planner/CultivationMethodSelector.tsx
vcchiortomio/vecchia app/components/planner/VarietySelector.tsx
vcchiortomio/vecchia app/components/planner/PlantLifecycleTimeline.tsx
vcchiortomio/vecchia app/components/planner/GeographicFeasibilityCard.tsx
vcchiortomio/vecchia app/components/planner/CompanionPlants.tsx
vcchiortomio/vecchia app/components/planner/TimelineComparison.tsx
```

---

#### Extend `/app/plants` - Add Photo Tracking
**Status**: ⚠️ PARTIAL - HIGH
**Files to Add**:
- `components/plants/PhotoTimeline.tsx` - Photo timeline
- `components/plants/PhotoComparison.tsx` - Photo comparison
- `components/plants/WeeklyPhotoReminder.tsx` - Photo reminders
- `components/plants/VegetationIndicesChart.tsx` - Vegetation indices
- `components/plants/FertilizationSuggestion.tsx` - Fertilization suggestions

**Services Needed**:
- `services/photoAnalysisService.ts` - Photo analysis
- `services/photoComparisonService.ts` - Photo comparison
- `services/photoLogService.ts` - Photo logging

**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/photo/PhotoTimeline.tsx
vcchiortomio/vecchia app/components/photo/PhotoComparison.tsx
vcchiortomio/vecchia app/components/plantTracking/WeeklyPhotoReminder.tsx
vcchiortomio/vecchia app/components/plantTracking/VegetationIndicesChart.tsx
vcchiortomio/vecchia app/components/plantTracking/FertilizationSuggestion.tsx
```

---

### 4. MEDIUM PRIORITY ROUTES (Create After High Priority)

#### Route 7: `/app/dominance` - Market Dominance
**Status**: ❌ MISSING - MEDIUM
**Source Files to Reference**:
```
vcchiortomio/vecchia app/components/dominance/DominanceDashboard.tsx
vcchiortomio/vecchia app/services/dominanceIntegrationService.ts
```

---

#### Route 8: `/app/drone-operations` - Drone Operations
**Status**: ❌ MISSING - MEDIUM
**Source Files to Reference**:
```
vcchiortomio/vecchia app/app/(dashboard)/app/drone-operations/page.tsx
vcchiortomio/vecchia app/services/droneIntegrationService.ts
```

---

#### Route 9: `/app/blockchain-traceability` - Blockchain Traceability
**Status**: ❌ MISSING - MEDIUM
**Source Files to Reference**:
```
vcchiortomio/vecchia app/app/(dashboard)/app/blockchain-traceability/page.tsx
vcchiortomio/vecchia app/services/blockchainTraceabilityService.ts
```

---

### 5. STEP-BY-STEP IMPLEMENTATION CHECKLIST

#### Week 1: Critical Routes
- [ ] Create `/app/zones` route with zone management
- [ ] Create `/app/harvest` route with harvest registration
- [ ] Create `/app/calendar` route with calendar view
- [ ] Create `/app/treatments` route with treatment planning
- [ ] Test all 4 routes for 404 errors

#### Week 2: Extend Existing Routes
- [ ] Extend `/app/settings` with bed/row management
- [ ] Extend `/app/planner` with missing components
- [ ] Extend `/app/plants` with photo tracking
- [ ] Test all extended routes

#### Week 3: High Priority Routes
- [ ] Create `/app/compliance` route
- [ ] Create `/app/agronomist` route
- [ ] Test both routes

#### Week 4: Medium Priority Routes
- [ ] Create `/app/dominance` route
- [ ] Create `/app/drone-operations` route
- [ ] Create `/app/blockchain-traceability` route
- [ ] Test all routes

#### Week 5+: Low Priority Routes
- [ ] Create `/app/recipes` route
- [ ] Create `/app/help` and `/app/guide` routes
- [ ] Add optional features

---

### 6. DATABASE MIGRATIONS NEEDED

Create migrations for:
1. `zones` table
2. `zone_fields` table
3. `zone_rows` table
4. `harvests` table
5. `harvest_items` table
6. `treatments` table
7. `treatment_applications` table
8. `calendar_events` table
9. `calendar_tasks` table
10. `consultations` table (for agronomist)
11. `compliance_assessments` table

---

### 7. API ROUTES TO CREATE

Create API endpoints for:
1. `/api/zones/*` - Zone CRUD
2. `/api/beds/*` - Bed CRUD
3. `/api/rows/*` - Row CRUD
4. `/api/harvests/*` - Harvest CRUD
5. `/api/treatments/*` - Treatment CRUD
6. `/api/calendar/*` - Calendar operations
7. `/api/consultations/*` - Consultation CRUD
8. `/api/compliance/*` - Compliance operations

---

### 8. TESTING CHECKLIST

For each new route:
- [ ] Route loads without 404 error
- [ ] Components render correctly
- [ ] Services connect to database
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Mobile responsive design works
- [ ] Error handling works
- [ ] Loading states work
- [ ] Empty states work

---

### 9. MIGRATION COMMANDS

```bash
# Copy services from old app
cp vcchiortomio/vecchia\ app/services/zoneManagementService.ts services/
cp vcchiortomio/vecchia\ app/services/zoneMappingService.ts services/
cp vcchiortomio/vecchia\ app/services/bedService.ts services/
cp vcchiortomio/vecchia\ app/services/harvestService.ts services/
cp vcchiortomio/vecchia\ app/services/treatmentRegistryService.ts services/
cp vcchiortomio/vecchia\ app/services/agronomistService.ts services/
cp vcchiortomio/vecchia\ app/services/globalGapComplianceService.ts services/

# Copy components from old app
cp vcchiortomio/vecchia\ app/components/gardens/BedManager.tsx components/gardens/
cp vcchiortomio/vecchia\ app/components/gardens/RowManagerModal.tsx components/gardens/
cp vcchiortomio/vecchia\ app/components/harvest/HarvestRegistrationModal.tsx components/harvest/
cp vcchiortomio/vecchia\ app/components/calendar/IntegratedCalendarWithChallenges.tsx components/calendar/
cp vcchiortomio/vecchia\ app/components/compliance/GlobalGapDashboard.tsx components/compliance/
cp vcchiortomio/vecchia\ app/components/agronomist/AgronomistSearch.tsx components/agronomist/
```

---

### 10. PRIORITY SUMMARY

**CRITICAL (Do First)**:
1. Zone Management (`/app/zones`)
2. Harvest Management (`/app/harvest`)
3. Calendar (`/app/calendar`)
4. Treatments (`/app/treatments`)

**HIGH (Do Second)**:
1. Extend Settings (bed/row management)
2. Extend Planner (missing components)
3. Extend Plants (photo tracking)
4. Compliance (`/app/compliance`)
5. Agronomist (`/app/agronomist`)

**MEDIUM (Do Third)**:
1. Dominance (`/app/dominance`)
2. Drone Operations (`/app/drone-operations`)
3. Blockchain Traceability (`/app/blockchain-traceability`)

**LOW (Do Last)**:
1. Recipes (`/app/recipes`)
2. Help/Guide (`/app/help`, `/app/guide`)
3. Optional features

---

## Conclusion

This guide provides a clear roadmap for migrating missing functionality from the old app to the new app. By following the priority order and implementation checklist, you can systematically restore all missing features and eliminate 404 errors.

**Estimated Timeline**: 4-5 weeks for all critical and high-priority features.
