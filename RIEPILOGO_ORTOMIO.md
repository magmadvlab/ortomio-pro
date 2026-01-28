# OrtoMio - riepilogo funzionalita (basato su codice)

## Scopo e metodo
Questo documento riassume le funzionalita principali presenti nel repository.
Le voci sono basate su file reali (pagine Next.js, componenti, servizi, tipi e schema).
Non include affermazioni non verificabili o promesse di marketing.

Fonti principali usate:
- package.json
- app/app/* e app/(auth)/*
- components/*
- services/*
- types/* e packages/*
- config/features.ts
- database/* e deploy_sql/*

## Stack e architettura (evidenza nel codice)
- Next.js 16 con React 19 e TypeScript: package.json
- Styling Tailwind: package.json, tailwind.config.js, index.css
- Storage con provider locale e Supabase: packages/core/storage/*, packages/storage-local/*, packages/storage-cloud/*, config/supabase.ts
- Feature flags per moduli: config/features.ts

## Aree funzionali principali

### 1) Orti e struttura fisica (giardini, zone, filari, aiuole)
- Gestione orti e struttura: /app/garden e /app/zones.
- Selettori di posizione e gestione zone/filari: components/shared/LocationSelector.tsx, components/settings/ZoneFieldRowManager.tsx.
- Servizi di gestione zone/filari: services/zoneManagementService.ts, services/zoneMappingService.ts, services/plantRowSyncService.ts.
- Tipi dati: types/gardenSpaces.ts, types/fieldRow.ts, types/gardenBed.ts.

### 2) Pianificazione, calendario e task
- Planner principale con tab AI, calendario, timeline, lista task, rotazioni e controllo biologico: app/app/planner/page.tsx.
- Planner classico e smart planner: app/app/planner-classic/page.tsx, components/planner/SmartPlanner.tsx, components/planner/ClassicPlannerWithRotation.tsx.
- Calendario task: app/app/calendar/page.tsx, app/api/calendar/tasks/route.ts.
- Servizi task: services/taskCalculationService.ts, services/weatherAwareTaskScheduler.ts.

### 3) Diario operativo e timeline
- Diario operativo con eventi rapidi: app/app/journal/page.tsx, components/diary/OperationalDiary.tsx.
- Diario con viste timeline, automatico e calendario: app/app/diary/page.tsx, components/diary/UnifiedTimelineDiary.tsx, components/diary/AutomatedDiaryViewer.tsx.
- Servizi e cron: services/operationalDiaryService.ts, app/api/cron/daily-diary/route.ts, app/api/cron/weekly-photo-reminders/route.ts.

### 4) Piante individuali e monitoraggio salute
- Gestione piante individuali e monitoraggio: app/app/plants/page.tsx, components/plants/SmartPlantManager.tsx, components/plants/PlantMonitoringDashboard.tsx.
- Heatmap e foto: components/plants/PlantHealthHeatmap.tsx, components/plants/PlantPhotoTimeline.tsx.
- Salute piante e diagnosi: app/app/health/page.tsx, services/plantHealthMonitoringService.ts, services/healthAlertEngine.ts.
- Tipi dati: types/individualPlant.ts, types/healthAlert.ts.

### 5) Banca semi, semenzaio, piantine e alberelli
- Banca semi e semenzaio: app/app/semenzaio/page.tsx, components/SeedInventory.tsx, components/SeedlingManager.tsx, components/SaplingManager.tsx.
- Servizi dedicati: services/seedInventoryService.ts, services/seedlingService.ts, services/saplingService.ts.
- Storage per semi e lotti: packages/core/storage/interface.ts (SeedPacket, SeedlingBatch, SaplingBatch).

### 6) Irrigazione
- Dashboard irrigazione e gestione zone: app/app/irrigation/page.tsx, components/irrigation/ProfessionalIrrigationDashboard.tsx, components/irrigation/IrrigationZoneManager.tsx.
- Servizi di calcolo e gestione: services/irrigationService.ts, services/advancedIrrigationService.ts, services/irrigationCalculatorService.ts.
- Tipi dati: types/irrigation.ts.

### 7) Nutrizione e trattamenti
- Dashboard nutrizione e inventario: app/app/nutrition/page.tsx, components/nutrition/*, components/fertilizer/*.
- Trattamenti fitosanitari: app/app/treatments/page.tsx, components/treatments/TreatmentDashboard.tsx.
- Servizi: services/advancedNutritionService.ts, services/fertilizationCalculator.ts, services/fertilizerInventoryService.ts, services/treatmentRegistryService.ts, services/integratedTreatmentService.ts, services/phytosanitaryAlertsService.ts.

### 8) Raccolta e registri
- Gestione raccolti: app/app/harvest/page.tsx, components/harvest/HarvestDashboard.tsx, components/harvest/HarvestRegistrationModal.tsx.
- Servizi: services/harvestTrackingService.ts.
- Storage: packages/core/storage/interface.ts (HarvestLogData).

### 9) Analisi, report e comparazioni
- Analytics e BI: app/app/analytics/page.tsx, app/api/analytics/professional/route.ts.
- Reportistica: app/app/reports/page.tsx.
- Comparazioni: app/app/compare/page.tsx, app/app/compare/detailed/page.tsx.
- Componenti analisi: components/analysis/SeasonAnalysisView.tsx, components/professional/AnalyticsTable.tsx.

### 10) Colture e domini specializzati
- Frutteto: app/app/orchard/page.tsx, components/orchard/*, services/orchardService.ts.
- Vigneto: app/app/vineyard/page.tsx, components/vineyard/*, services/vineyardService.ts.
- Oliveto: app/app/olives/page.tsx, components/olives/*.
- Tipi dati: types/orchard.ts, types/vineyard.ts, types/olive.ts.

### 11) AI e suggerimenti
- API AI: app/api/ai/chat/route.ts, app/api/ai/diagnose/route.ts, app/api/ai/suggestions/route.ts, app/api/ai/predictions/route.ts, app/api/ai/recipe/route.ts.
- Componenti UI AI: components/ai/*, components/ai/predictions/*.
- Servizi AI: services/geminiService.ts, services/aiProviderAdapter.ts, services/aiSuggestionsService.ts, services/aiPredictiveEngine.ts, services/contextAwareAIService.ts.
- Feature flags: config/features.ts (AI_PREDICTIONS, COLLABORATIVE_AI).

### 12) Dati satellitari e agricoltura di precisione
- NDVI e mappe: app/app/ndvi/page.tsx, app/app/prescription-maps/page.tsx.
- Servizi: services/ndviSatelliteService.ts, services/satelliteDataService.ts, services/vegetationIndexService.ts, services/prescriptionMapsService.ts.
- Componenti: components/ndvi/NDVIDashboard.tsx, components/prescription/*.
- Configurazione credenziali satellitari: components/settings/SatelliteCredentialsManager.tsx.

### 13) Droni, sensori e IoT
- API droni: app/api/drone/flight-plans/route.ts, app/api/drone/execute/route.ts, app/api/drone/auto-plan/route.ts.
- Servizio droni: services/droneIntegrationService.ts.
- Sensori: app/api/sensors/readings/route.ts, services/iotSensorService.ts, services/sensorDataService.ts.
- UI smart hub: components/smart/IntegratedSmartHub.tsx, components/shared/HydroponicMonitorWidget.tsx, components/shared/AquaponicMonitorWidget.tsx.

### 14) Tracciabilita, compliance e certificazioni
- Certificazioni: app/app/certifications/page.tsx, components/compliance/*.
- Servizi: services/globalGapComplianceService.ts, services/unifiedCertificationsService.ts.
- Blockchain: app/api/blockchain/*, services/blockchainTraceabilityService.ts.

### 15) Export, manuali e supporto
- Export PDF/CSV: app/app/export/page.tsx, app/api/export/pdf/route.ts, app/api/export/csv/route.ts, services/exportService.ts.
- Manuali: app/docs/manual/[slug]/page.tsx, app/api/docs/manual/[slug]/route.ts.
- Supporto: app/app/help/page.tsx, app/api/support/submit/route.ts.

### 16) Impostazioni, account e organizzazioni
- Auth: app/(auth)/*, app/auth/callback/route.ts, app/api/auth/register/route.ts.
- Impostazioni: app/app/settings/page.tsx.
- Gestione API keys e organizzazione: components/settings/APIKeysManager.tsx, components/settings/OrganizationManager.tsx, services/apiKeysService.ts, services/organizationService.ts, services/apiConfigurationService.ts.
- Crediti AI: app/api/credits/status/route.ts, app/api/credits/deduct/route.ts.

## Dati e persistenza
- Interfaccia storage unica con molte entita (giardini, task, semi, trattamenti, inventari, ecc.): packages/core/storage/interface.ts.
- Provider locali e cloud: packages/storage-local/LocalStorageProvider.ts, packages/storage-cloud/SupabaseStorageProvider.ts.
- Schema e migrazioni DB: database/schema.sql, database/migrations/*, deploy_sql/*.

## Stato e limiti noti (evidenza nel codice)
- Alcune funzioni sono dietro feature flag e possono essere disattivate: config/features.ts.
- Alcune pagine usano dati mock o placeholder:
  - Analytics: app/app/analytics/page.tsx (commenti e valori mock).
  - Reports: app/app/reports/page.tsx (dati mock).
  - Irrigazione e nutrizione: app/app/irrigation/page.tsx, app/app/nutrition/page.tsx (config caricati in modo simulato).
  - Journal: app/app/journal/page.tsx (TODO per salvataggio eventi rapidi).

## Note finali
Se vuoi un livello di dettaglio maggiore (es. database, API contract o flussi utente completi), posso estendere il documento con nuove sezioni sempre basate su file specifici del repo.
