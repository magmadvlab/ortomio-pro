import type { AgronomicCropProfile } from '../types/agronomicKernel';

export const AGRONOMIC_CROP_PROFILES: AgronomicCropProfile[] = [
  {
    id: 'open_field_cereals',
    label: 'Open-field cereals',
    cropFamily: 'Poaceae',
    lifecycle: 'annual',
    systems: ['open_field'],
    primaryScope: 'plot',
    supportedPlantIds: ['frumento', 'grano', 'grano duro', 'grano tenero', 'orzo', 'mais'],
    tags: ['cereals', 'broadacre', 'field_scale'],
    phenology: {
      stages: ['emergence', 'tillering', 'stem_extension', 'heading', 'flowering', 'grain_fill', 'harvest'],
      decisionCriticalStages: ['tillering', 'stem_extension', 'flowering', 'grain_fill'],
    },
    water: {
      strategy: 'stress_tolerant',
      rootProfile: { effectiveDepthCmMin: 40, effectiveDepthCmMax: 140, rootingPattern: 'deep' },
      sensitiveStages: ['stem_extension', 'flowering', 'grain_fill'],
      recommendedSignals: [
        { key: 'weather_forecast', priority: 'P0', reason: 'Rainfall and heat windows drive field operations and water balance.' },
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Root-zone availability matters more than surface moisture.' },
        { key: 'soil_moisture_60cm', priority: 'P1', reason: 'Deep storage supports cereals through dry spells.' },
        { key: 'soil_tension_kpa', priority: 'P1', reason: 'Stress onset should be detected before irreversible yield loss.' },
      ],
    },
    nutrition: {
      strategy: 'nitrogen_sensitive',
      highDemandStages: ['tillering', 'stem_extension', 'grain_fill'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Nitrogen timing must stay traceable against stage and outcome.' },
        { key: 'satellite_vigor', priority: 'P1', reason: 'Spatial vigor helps split-zone top dressing decisions.' },
      ],
    },
    health: {
      priorities: ['weed_competition', 'foliar_disease', 'nutrient_imbalance', 'water_stress'],
      recommendedSignals: [
        { key: 'weather_current', priority: 'P0', reason: 'Disease and spray windows depend on real field weather.' },
        { key: 'phenology_observation', priority: 'P0', reason: 'Protection and nutrition choices must follow crop stage.' },
      ],
    },
    quality: {
      targetMetrics: ['yield', 'protein', 'test_weight'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Kernel quality must close the loop with field decisions.' },
      ],
    },
  },
  {
    id: 'winter_cereals',
    label: 'Winter cereals',
    cropFamily: 'Poaceae',
    lifecycle: 'annual',
    systems: ['open_field'],
    primaryScope: 'plot',
    supportedPlantIds: ['frumento', 'grano', 'grano duro', 'grano tenero', 'orzo', 'avena', 'segale', 'triticale'],
    tags: ['winter_cereals', 'broadacre', 'field_scale', 'vernini'],
    phenology: {
      stages: ['sowing', 'emergence', 'tillering', 'stem_extension', 'heading', 'flowering', 'grain_fill', 'maturity', 'harvest'],
      decisionCriticalStages: ['tillering', 'stem_extension', 'heading', 'flowering', 'grain_fill'],
    },
    water: {
      strategy: 'deficit_sensitive',
      rootProfile: { effectiveDepthCmMin: 45, effectiveDepthCmMax: 150, rootingPattern: 'deep' },
      sensitiveStages: ['stem_extension', 'flowering', 'grain_fill'],
      recommendedSignals: [
        { key: 'weather_forecast', priority: 'P0', reason: 'Late winter and spring rainfall windows drive N timing and stress risk.' },
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Mid-root storage is the best short-cycle indicator in vernini crops.' },
        { key: 'soil_moisture_60cm', priority: 'P1', reason: 'Deep reserve becomes decisive near grain fill.' },
        { key: 'soil_tension_kpa', priority: 'P1', reason: 'Stress onset at heading and flowering must be detected early.' },
      ],
    },
    nutrition: {
      strategy: 'nitrogen_sensitive',
      highDemandStages: ['tillering', 'stem_extension', 'heading'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Split nitrogen strategy must be tied to stage and rainfall windows.' },
        { key: 'satellite_vigor', priority: 'P1', reason: 'Variable vigor is useful for top-dressing zoning.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'weed_competition', 'nutrient_imbalance', 'water_stress'],
      recommendedSignals: [
        { key: 'weather_current', priority: 'P0', reason: 'Rusts, septoria, and spray windows are tightly weather dependent.' },
        { key: 'phenology_observation', priority: 'P0', reason: 'Protection and nutrition must track real crop stage in cereals.' },
      ],
    },
    quality: {
      targetMetrics: ['yield', 'protein', 'test_weight', 'hectoliter_weight'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Protein and grain quality should validate fertilization and stress management.' },
      ],
    },
  },
  {
    id: 'leafy_vegetables',
    label: 'Leafy vegetables and brassicas',
    cropFamily: 'Mixed leafy',
    lifecycle: 'annual',
    systems: ['open_field', 'protected_culture', 'indoor', 'hydroponic'],
    primaryScope: 'row',
    supportedPlantIds: ['lattuga', 'cicoria', 'radicchio', 'spinacio', 'bietola', 'rucola', 'cavolfiore', 'broccoli', 'cavolo'],
    tags: ['leafy', 'high_turnover', 'market_quality'],
    phenology: {
      stages: ['establishment', 'vegetative_growth', 'market_maturity', 'harvest'],
      decisionCriticalStages: ['establishment', 'vegetative_growth', 'market_maturity'],
    },
    water: {
      strategy: 'uniform_supply',
      rootProfile: { effectiveDepthCmMin: 15, effectiveDepthCmMax: 45, rootingPattern: 'shallow' },
      sensitiveStages: ['establishment', 'vegetative_growth', 'market_maturity'],
      recommendedSignals: [
        { key: 'soil_moisture_10cm', priority: 'P0', reason: 'Shallow roots need near-surface moisture control.' },
        { key: 'weather_forecast', priority: 'P0', reason: 'Leaf quality and field accessibility depend on short-term weather.' },
        { key: 'leaf_wetness', priority: 'P1', reason: 'Leaf diseases accelerate with wet canopies.' },
      ],
    },
    nutrition: {
      strategy: 'vegetative_push',
      highDemandStages: ['vegetative_growth'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Short cycles need exact nutrient timing and dose records.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'sap_sucking_pests', 'water_stress'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P0', reason: 'Leaf diseases are driven by wetness duration.' },
        { key: 'dew_point', priority: 'P1', reason: 'Condensation risk matters in dense canopies and protected systems.' },
      ],
    },
    quality: {
      targetMetrics: ['marketable_yield', 'leaf_quality', 'shelf_life'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Leaf quality must be linked to irrigation and disease control.' },
      ],
    },
  },
  {
    id: 'field_brassicas',
    label: 'Field brassicas',
    cropFamily: 'Brassicaceae',
    lifecycle: 'annual',
    systems: ['open_field', 'protected_culture'],
    primaryScope: 'row',
    supportedPlantIds: ['cavolfiore', 'broccoli', 'cavolo', 'verza', 'cavolo cappuccio', 'cavolo nero', 'cavolini di bruxelles', 'rapa'],
    tags: ['brassicas', 'field_vegetables', 'quality_sensitive'],
    phenology: {
      stages: ['establishment', 'rosette_growth', 'head_or_curd_initiation', 'bulking', 'market_maturity', 'harvest'],
      decisionCriticalStages: ['establishment', 'head_or_curd_initiation', 'bulking', 'market_maturity'],
    },
    water: {
      strategy: 'uniform_supply',
      rootProfile: { effectiveDepthCmMin: 20, effectiveDepthCmMax: 70, rootingPattern: 'medium' },
      sensitiveStages: ['establishment', 'head_or_curd_initiation', 'bulking'],
      recommendedSignals: [
        { key: 'soil_moisture_10cm', priority: 'P0', reason: 'Establishment and shallow rooting phases require tight moisture control.' },
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Bulking quality depends on stable root-zone supply.' },
        { key: 'weather_forecast', priority: 'P0', reason: 'Heat and rainfall spikes directly affect compactness and rot pressure.' },
        { key: 'leaf_wetness', priority: 'P1', reason: 'Brassica foliar diseases accelerate under repeated wet canopy periods.' },
      ],
    },
    nutrition: {
      strategy: 'balanced_growth',
      highDemandStages: ['rosette_growth', 'head_or_curd_initiation', 'bulking'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Nitrogen and calcium timing need clean traceability in brassicas.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'sap_sucking_pests', 'water_stress', 'nutrient_imbalance'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P0', reason: 'Alternaria and bacterial pressure rise quickly on wet foliage.' },
        { key: 'dew_point', priority: 'P1', reason: 'Condensation windows matter in dense brassica canopies.' },
      ],
    },
    quality: {
      targetMetrics: ['head_uniformity', 'compactness', 'marketable_yield', 'shelf_life'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Commercial quality should validate water and calcium management.' },
      ],
    },
  },
  {
    id: 'fruiting_vegetables',
    label: 'Fruiting vegetables',
    cropFamily: 'Mixed fruiting vegetables',
    lifecycle: 'annual',
    systems: ['open_field', 'protected_culture', 'indoor', 'hydroponic'],
    primaryScope: 'plant',
    supportedPlantIds: ['pomodoro', 'peperone', 'peperoncino', 'melanzana', 'zucchina', 'cetriolo', 'melone', 'anguria'],
    tags: ['fruiting', 'quality_driven', 'stage_sensitive'],
    phenology: {
      stages: ['establishment', 'vegetative_growth', 'flowering', 'fruit_set', 'fruit_fill', 'harvest'],
      decisionCriticalStages: ['flowering', 'fruit_set', 'fruit_fill', 'harvest'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 25, effectiveDepthCmMax: 90, rootingPattern: 'medium' },
      sensitiveStages: ['flowering', 'fruit_set', 'fruit_fill'],
      recommendedSignals: [
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Stable root-zone water avoids blossom drop and quality loss.' },
        { key: 'vpd', priority: 'P1', reason: 'Fruiting vegetables are sensitive to evaporative demand peaks.' },
        { key: 'canopy_temperature', priority: 'P1', reason: 'Thermal stress affects set and fruit quality.' },
      ],
    },
    nutrition: {
      strategy: 'fruiting_support',
      highDemandStages: ['flowering', 'fruit_set', 'fruit_fill'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Nutrient balance must be linked to fruit load and stage.' },
        { key: 'quality_result', priority: 'P1', reason: 'Fruit quality validates the nutrition strategy.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'fruit_quality_pressure', 'sap_sucking_pests', 'water_stress'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P0', reason: 'Foliar pathogen pressure depends on wetness duration.' },
        { key: 'dew_point', priority: 'P1', reason: 'Condensation drives protected-culture disease pressure.' },
      ],
    },
    quality: {
      targetMetrics: ['brix', 'firmness', 'marketable_yield'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P0', reason: 'Fruit quality is a direct economic outcome.' },
      ],
    },
  },
  {
    id: 'legumes',
    label: 'Legumes',
    cropFamily: 'Fabaceae',
    lifecycle: 'annual',
    systems: ['open_field', 'protected_culture'],
    primaryScope: 'row',
    supportedPlantIds: ['fagiolo', 'fagiolino', 'pisello', 'fava', 'cece'],
    tags: ['legume', 'nitrogen_fixing'],
    phenology: {
      stages: ['emergence', 'vegetative_growth', 'flowering', 'pod_fill', 'harvest'],
      decisionCriticalStages: ['flowering', 'pod_fill'],
    },
    water: {
      strategy: 'deficit_sensitive',
      rootProfile: { effectiveDepthCmMin: 25, effectiveDepthCmMax: 80, rootingPattern: 'medium' },
      sensitiveStages: ['flowering', 'pod_fill'],
      recommendedSignals: [
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Water stress at flowering sharply reduces pod set.' },
        { key: 'weather_forecast', priority: 'P0', reason: 'Short-cycle irrigation and disease windows are weather-driven.' },
      ],
    },
    nutrition: {
      strategy: 'balanced_growth',
      highDemandStages: ['establishment', 'flowering'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Starter nutrition and correction events must stay traceable.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'sap_sucking_pests', 'water_stress'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P1', reason: 'Wet canopy conditions increase foliar disease pressure.' },
      ],
    },
    quality: {
      targetMetrics: ['yield', 'pod_quality', 'uniformity'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Harvest quality validates water and timing decisions.' },
      ],
    },
  },
  {
    id: 'broadacre_legumes',
    label: 'Broadacre legumes',
    cropFamily: 'Fabaceae',
    lifecycle: 'annual',
    systems: ['open_field'],
    primaryScope: 'plot',
    supportedPlantIds: ['cece', 'lenticchia', 'fava', 'favino', 'pisello proteico', 'pisello da granella'],
    tags: ['legume', 'broadacre', 'protein_crop', 'field_scale'],
    phenology: {
      stages: ['sowing', 'emergence', 'vegetative_growth', 'flowering', 'pod_set', 'seed_fill', 'maturity', 'harvest'],
      decisionCriticalStages: ['flowering', 'pod_set', 'seed_fill'],
    },
    water: {
      strategy: 'deficit_sensitive',
      rootProfile: { effectiveDepthCmMin: 30, effectiveDepthCmMax: 110, rootingPattern: 'deep' },
      sensitiveStages: ['flowering', 'pod_set', 'seed_fill'],
      recommendedSignals: [
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Pod set and grain filling depend on stable mid-profile moisture.' },
        { key: 'weather_forecast', priority: 'P0', reason: 'Rainfall and heat stress strongly shape flowering success and disease pressure.' },
        { key: 'soil_moisture_60cm', priority: 'P1', reason: 'Deep reserve matters in dryland legumes late in the cycle.' },
      ],
    },
    nutrition: {
      strategy: 'balanced_growth',
      highDemandStages: ['establishment', 'flowering'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Starter P-K nutrition and corrections must stay traceable even in N-fixing crops.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'water_stress', 'weed_competition', 'sap_sucking_pests'],
      recommendedSignals: [
        { key: 'weather_current', priority: 'P0', reason: 'Ascochyta-like disease windows and field access depend on real weather.' },
        { key: 'phenology_observation', priority: 'P1', reason: 'Pulse crop decisions must follow real flowering and pod stages.' },
      ],
    },
    quality: {
      targetMetrics: ['yield', 'protein', 'seed_uniformity', 'marketable_grain'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Grain size and protein help validate water and nutrition strategy.' },
      ],
    },
  },
  {
    id: 'aromatic_mediterranean',
    label: 'Mediterranean aromatics',
    cropFamily: 'Lamiaceae',
    lifecycle: 'perennial',
    systems: ['open_field', 'protected_culture', 'indoor'],
    primaryScope: 'plant',
    supportedPlantIds: ['basilico', 'rosmarino', 'salvia', 'menta', 'timo', 'origano'],
    tags: ['aromatic', 'mediterranean', 'quality'],
    phenology: {
      stages: ['establishment', 'vegetative_growth', 'cut_cycle', 'flowering'],
      decisionCriticalStages: ['vegetative_growth', 'cut_cycle'],
    },
    water: {
      strategy: 'stress_tolerant',
      rootProfile: { effectiveDepthCmMin: 15, effectiveDepthCmMax: 60, rootingPattern: 'medium' },
      sensitiveStages: ['establishment', 'cut_cycle'],
      recommendedSignals: [
        { key: 'soil_moisture_10cm', priority: 'P0', reason: 'Surface drying impacts young aromatic stands quickly.' },
        { key: 'vpd', priority: 'P1', reason: 'High evaporative demand affects biomass and aroma quality.' },
      ],
    },
    nutrition: {
      strategy: 'balanced_growth',
      highDemandStages: ['establishment', 'vegetative_growth'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P1', reason: 'Low-input systems still need traceable interventions.' },
      ],
    },
    health: {
      priorities: ['root_disease', 'foliar_disease', 'water_stress'],
      recommendedSignals: [
        { key: 'weather_current', priority: 'P0', reason: 'Humidity and overwatering drive the main disease risks.' },
      ],
    },
    quality: {
      targetMetrics: ['aroma_intensity', 'leaf_quality', 'marketable_yield'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Repeated cuts require quality tracking, not only yield.' },
      ],
    },
  },
  {
    id: 'perennial_field_vegetables',
    label: 'Perennial field vegetables',
    cropFamily: 'Mixed perennial vegetables',
    lifecycle: 'perennial',
    systems: ['open_field', 'protected_culture'],
    primaryScope: 'row',
    supportedPlantIds: ['carciofo', 'asparago'],
    tags: ['perennial', 'field_vegetable', 'multi_year'],
    phenology: {
      stages: ['dormancy', 'bud_break', 'vegetative_growth', 'harvest_window', 'recharge'],
      decisionCriticalStages: ['bud_break', 'harvest_window', 'recharge'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 35, effectiveDepthCmMax: 120, rootingPattern: 'deep' },
      sensitiveStages: ['bud_break', 'harvest_window'],
      recommendedSignals: [
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Root-zone stability matters for spear/head quality and regrowth.' },
        { key: 'weather_forecast', priority: 'P0', reason: 'Harvest planning and disease windows are weather-sensitive.' },
      ],
    },
    nutrition: {
      strategy: 'quality_finish',
      highDemandStages: ['vegetative_growth', 'recharge'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Multi-year stands need nutrition tracking by campaign.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'root_disease', 'water_stress'],
      recommendedSignals: [
        { key: 'phenology_observation', priority: 'P0', reason: 'Perennial vegetables need campaign-aware decisions.' },
      ],
    },
    quality: {
      targetMetrics: ['head_size', 'uniformity', 'marketable_yield'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Market quality is a stronger KPI than total biomass alone.' },
      ],
    },
  },
  {
    id: 'artichoke_open_field',
    label: 'Artichoke',
    cropFamily: 'Asteraceae',
    lifecycle: 'perennial',
    systems: ['open_field'],
    primaryScope: 'row',
    supportedPlantIds: ['carciofo', 'cardo'],
    tags: ['artichoke', 'perennial', 'field_vegetable', 'quality_sensitive'],
    phenology: {
      stages: ['summer_rest', 'bud_break', 'vegetative_growth', 'head_initiation', 'harvest_window', 'recharge'],
      decisionCriticalStages: ['bud_break', 'head_initiation', 'harvest_window', 'recharge'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 35, effectiveDepthCmMax: 130, rootingPattern: 'deep' },
      sensitiveStages: ['bud_break', 'head_initiation', 'harvest_window'],
      recommendedSignals: [
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Head quality and regrowth require stable root-zone moisture.' },
        { key: 'weather_forecast', priority: 'P0', reason: 'Heat, wind, and rainfall directly affect head compactness and harvest windows.' },
        { key: 'soil_moisture_60cm', priority: 'P1', reason: 'Multi-year stands benefit from understanding deep reserve availability.' },
      ],
    },
    nutrition: {
      strategy: 'quality_finish',
      highDemandStages: ['vegetative_growth', 'head_initiation', 'recharge'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Perennial head crops need campaign-aware fertility records.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'sap_sucking_pests', 'water_stress', 'root_disease'],
      recommendedSignals: [
        { key: 'phenology_observation', priority: 'P0', reason: 'Artichoke decisions are highly stage-sensitive across multiple flushes.' },
        { key: 'weather_current', priority: 'P1', reason: 'Humidity and warm spells drive aphids and fungal pressure.' },
      ],
    },
    quality: {
      targetMetrics: ['head_size', 'head_compactness', 'uniformity', 'marketable_yield'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P0', reason: 'Commercial head quality should validate irrigation and stage timing.' },
      ],
    },
  },
  {
    id: 'industrial_broadacre',
    label: 'Industrial and broadacre crops',
    cropFamily: 'Mixed industrial crops',
    lifecycle: 'annual',
    systems: ['open_field'],
    primaryScope: 'plot',
    supportedPlantIds: ['mais', 'girasole', 'colza', 'soia', 'bietola da zucchero', 'sorgo', 'cotone', 'tabacco'],
    tags: ['industrial', 'broadacre', 'extensive', 'field_scale'],
    phenology: {
      stages: ['sowing', 'emergence', 'vegetative_growth', 'flowering', 'reproductive_fill', 'maturity', 'harvest'],
      decisionCriticalStages: ['vegetative_growth', 'flowering', 'reproductive_fill', 'harvest'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 35, effectiveDepthCmMax: 170, rootingPattern: 'deep' },
      sensitiveStages: ['flowering', 'reproductive_fill'],
      recommendedSignals: [
        { key: 'weather_forecast', priority: 'P0', reason: 'Broadacre industrial crops depend on weather windows for stress and operations.' },
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Root-zone supply is the first operational control point across crops.' },
        { key: 'soil_moisture_60cm', priority: 'P1', reason: 'Deep storage often decides resilience in extensive systems.' },
        { key: 'satellite_vigor', priority: 'P1', reason: 'Spatial vigor is useful for variable-rate or zone-based interventions.' },
      ],
    },
    nutrition: {
      strategy: 'fruiting_support',
      highDemandStages: ['vegetative_growth', 'flowering', 'reproductive_fill'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Costly broadacre inputs require strict auditability by stage and zone.' },
        { key: 'ndvi', priority: 'P1', reason: 'Canopy vigor helps discriminate input response in large fields.' },
      ],
    },
    health: {
      priorities: ['weed_competition', 'foliar_disease', 'water_stress', 'nutrient_imbalance'],
      recommendedSignals: [
        { key: 'weather_current', priority: 'P0', reason: 'Stress and disease windows in extensive crops are driven by real weather.' },
        { key: 'phenology_observation', priority: 'P1', reason: 'Reproductive timing strongly changes intervention value.' },
      ],
    },
    quality: {
      targetMetrics: ['yield', 'oil_or_dry_matter', 'uniformity', 'marketable_output'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Industrial crop value must validate water, timing, and nutrition choices.' },
      ],
    },
  },
  {
    id: 'orchard_generic',
    label: 'Orchard crops',
    cropFamily: 'Woody orchard crops',
    lifecycle: 'perennial',
    systems: ['orchard'],
    primaryScope: 'tree',
    tags: ['orchard', 'woody', 'quality'],
    phenology: {
      stages: ['dormancy', 'bud_break', 'flowering', 'fruit_set', 'fruit_growth', 'maturation', 'harvest'],
      decisionCriticalStages: ['flowering', 'fruit_set', 'fruit_growth', 'harvest'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 40, effectiveDepthCmMax: 180, rootingPattern: 'deep' },
      sensitiveStages: ['flowering', 'fruit_set', 'fruit_growth'],
      recommendedSignals: [
        { key: 'soil_moisture_30cm', priority: 'P0', reason: 'Tree water balance must be tracked below the surface layer.' },
        { key: 'canopy_temperature', priority: 'P1', reason: 'Tree stress appears in canopy heat before visual damage.' },
      ],
    },
    nutrition: {
      strategy: 'quality_finish',
      highDemandStages: ['fruit_set', 'fruit_growth'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Tree nutrition has long carry-over effects and must be audited.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'fruit_quality_pressure', 'sap_sucking_pests', 'water_stress'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P0', reason: 'Many orchard disease models depend on leaf wetness duration.' },
        { key: 'dew_point', priority: 'P1', reason: 'Condensation windows improve disease-risk timing.' },
      ],
    },
    quality: {
      targetMetrics: ['fruit_size', 'defect_incidence', 'marketable_yield'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P0', reason: 'Outcome quality must validate pruning, irrigation, and protection.' },
      ],
    },
  },
  {
    id: 'olive_grove_oil',
    label: 'Olive grove',
    cropFamily: 'Oleaceae',
    lifecycle: 'perennial',
    systems: ['olive_grove'],
    primaryScope: 'tree',
    supportedPlantIds: ['olivo', 'oliva'],
    tags: ['olive', 'oil_quality', 'woody'],
    phenology: {
      stages: ['dormancy', 'bud_break', 'flowering', 'fruit_set', 'pit_hardening', 'veraison', 'harvest'],
      decisionCriticalStages: ['flowering', 'fruit_set', 'pit_hardening', 'veraison', 'harvest'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 50, effectiveDepthCmMax: 200, rootingPattern: 'deep' },
      sensitiveStages: ['flowering', 'fruit_set', 'veraison'],
      recommendedSignals: [
        { key: 'soil_tension_kpa', priority: 'P0', reason: 'Olive water stress timing is more useful than generic volume tracking.' },
        { key: 'canopy_temperature', priority: 'P1', reason: 'Thermal stress helps estimate hidden summer stress.' },
      ],
    },
    nutrition: {
      strategy: 'quality_finish',
      highDemandStages: ['fruit_set', 'oil_accumulation'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Oil yield and alternation require campaign-level traceability.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'fruit_quality_pressure', 'water_stress'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P0', reason: 'Peacock spot pressure depends on wet foliage periods.' },
        { key: 'phenology_observation', priority: 'P0', reason: 'Olive fly and harvest timing depend on stage and veraison.' },
      ],
    },
    quality: {
      targetMetrics: ['oil_yield_percentage', 'oil_quality', 'defect_incidence'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P0', reason: 'Oil outcome must close the loop with agronomic decisions.' },
      ],
    },
  },
  {
    id: 'vineyard_quality',
    label: 'Vineyard',
    cropFamily: 'Vitaceae',
    lifecycle: 'perennial',
    systems: ['vineyard'],
    primaryScope: 'row',
    supportedPlantIds: ['vite', 'uva'],
    tags: ['vineyard', 'wine', 'quality'],
    phenology: {
      stages: ['dormancy', 'bud_break', 'shoot_growth', 'flowering', 'fruit_set', 'veraison', 'ripening', 'harvest'],
      decisionCriticalStages: ['flowering', 'fruit_set', 'veraison', 'ripening', 'harvest'],
    },
    water: {
      strategy: 'quality_oriented',
      rootProfile: { effectiveDepthCmMin: 40, effectiveDepthCmMax: 180, rootingPattern: 'deep' },
      sensitiveStages: ['flowering', 'fruit_set', 'veraison', 'ripening'],
      recommendedSignals: [
        { key: 'soil_tension_kpa', priority: 'P0', reason: 'Vine stress should be measured with root-zone tension proxies.' },
        { key: 'canopy_temperature', priority: 'P1', reason: 'Canopy thermal stress strongly affects quality and ripening.' },
      ],
    },
    nutrition: {
      strategy: 'quality_finish',
      highDemandStages: ['shoot_growth', 'fruit_set'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Vine nutrition must stay linked to vigor and berry quality.' },
      ],
    },
    health: {
      priorities: ['foliar_disease', 'fruit_quality_pressure', 'water_stress'],
      recommendedSignals: [
        { key: 'leaf_wetness', priority: 'P0', reason: 'Downy mildew and similar diseases require wetness-aware models.' },
        { key: 'dew_point', priority: 'P0', reason: 'Night condensation and dew cycles are agronomically decisive.' },
        { key: 'vpd', priority: 'P1', reason: 'Evaporative demand affects ripening and stress balance.' },
      ],
    },
    quality: {
      targetMetrics: ['brix', 'acidity', 'yield', 'quality_score'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P0', reason: 'Berry quality must validate the irrigation and canopy strategy.' },
      ],
    },
  },
  {
    id: 'controlled_environment_leafy',
    label: 'Controlled-environment leafy crops',
    cropFamily: 'Controlled environment leafy',
    lifecycle: 'annual',
    systems: ['indoor', 'hydroponic', 'aquaponic', 'aeroponic'],
    primaryScope: 'bed',
    tags: ['cea', 'leafy', 'recirculating'],
    phenology: {
      stages: ['nursery', 'establishment', 'vegetative_growth', 'harvest'],
      decisionCriticalStages: ['establishment', 'vegetative_growth', 'harvest'],
    },
    water: {
      strategy: 'recirculating',
      rootProfile: { effectiveDepthCmMin: 5, effectiveDepthCmMax: 20, rootingPattern: 'shallow' },
      sensitiveStages: ['establishment', 'vegetative_growth'],
      recommendedSignals: [
        { key: 'water_ph', priority: 'P0', reason: 'Solution chemistry is a primary driver in recirculating systems.' },
        { key: 'water_salinity', priority: 'P1', reason: 'Salinity drift must remain under control in closed loops.' },
      ],
    },
    nutrition: {
      strategy: 'solution_driven',
      highDemandStages: ['vegetative_growth'],
      recommendedSignals: [
        { key: 'operation_ledger', priority: 'P0', reason: 'Every solution correction must be fully logged.' },
      ],
    },
    health: {
      priorities: ['root_disease', 'foliar_disease', 'nutrient_imbalance'],
      recommendedSignals: [
        { key: 'vpd', priority: 'P0', reason: 'Controlled environments need humidity and transpiration discipline.' },
        { key: 'dew_point', priority: 'P1', reason: 'Condensation is a major disease trigger in dense leafy crops.' },
      ],
    },
    quality: {
      targetMetrics: ['leaf_quality', 'uniformity', 'marketable_yield'],
      recommendedSignals: [
        { key: 'quality_result', priority: 'P1', reason: 'Uniformity and quality validate setpoint strategy.' },
      ],
    },
  },
];

export const AGRONOMIC_PROFILE_ALIASES: Record<string, string> = {
  grano: 'winter_cereals',
  cereali: 'open_field_cereals',
  'cereali vernini': 'winter_cereals',
  frumento: 'winter_cereals',
  'grano duro': 'winter_cereals',
  'grano tenero': 'winter_cereals',
  orzo: 'winter_cereals',
  avena: 'winter_cereals',
  segale: 'winter_cereals',
  triticale: 'winter_cereals',
  wheat: 'winter_cereals',
  barley: 'winter_cereals',
  rye: 'winter_cereals',
  oats: 'winter_cereals',
  mais: 'industrial_broadacre',
  maize: 'industrial_broadacre',
  sorgo: 'industrial_broadacre',
  girasole: 'industrial_broadacre',
  sunflower: 'industrial_broadacre',
  colza: 'industrial_broadacre',
  canola: 'industrial_broadacre',
  soia: 'industrial_broadacre',
  soybean: 'industrial_broadacre',
  'bietola da zucchero': 'industrial_broadacre',
  sorgum: 'industrial_broadacre',
  carciofo: 'artichoke_open_field',
  asparago: 'perennial_field_vegetables',
  artichoke: 'artichoke_open_field',
  asparagus: 'perennial_field_vegetables',
  pomodoro: 'fruiting_vegetables',
  peperone: 'fruiting_vegetables',
  peperoncino: 'fruiting_vegetables',
  melanzana: 'fruiting_vegetables',
  zucchina: 'fruiting_vegetables',
  cetriolo: 'fruiting_vegetables',
  tomato: 'fruiting_vegetables',
  pepper: 'fruiting_vegetables',
  cucumber: 'fruiting_vegetables',
  lattuga: 'leafy_vegetables',
  cicoria: 'leafy_vegetables',
  radicchio: 'leafy_vegetables',
  spinacio: 'leafy_vegetables',
  bietola: 'leafy_vegetables',
  rucola: 'leafy_vegetables',
  cavolfiore: 'field_brassicas',
  broccoli: 'field_brassicas',
  cavolo: 'field_brassicas',
  verza: 'field_brassicas',
  'cavolo cappuccio': 'field_brassicas',
  'cavolo nero': 'field_brassicas',
  brassicas: 'field_brassicas',
  brassicacee: 'field_brassicas',
  lettuce: 'leafy_vegetables',
  spinach: 'leafy_vegetables',
  fagiolo: 'legumes',
  fagiolino: 'legumes',
  pisello: 'legumes',
  fava: 'broadacre_legumes',
  favino: 'broadacre_legumes',
  cece: 'broadacre_legumes',
  lenticchia: 'broadacre_legumes',
  'pisello proteico': 'broadacre_legumes',
  leguminose: 'broadacre_legumes',
  bean: 'legumes',
  pea: 'legumes',
  chickpea: 'broadacre_legumes',
  lentil: 'broadacre_legumes',
  'broadacre legumes': 'broadacre_legumes',
  basilico: 'aromatic_mediterranean',
  rosmarino: 'aromatic_mediterranean',
  salvia: 'aromatic_mediterranean',
  menta: 'aromatic_mediterranean',
  timo: 'aromatic_mediterranean',
  basil: 'aromatic_mediterranean',
  rosemary: 'aromatic_mediterranean',
  olivo: 'olive_grove_oil',
  oliva: 'olive_grove_oil',
  oliveto: 'olive_grove_oil',
  olive: 'olive_grove_oil',
  'olive grove': 'olive_grove_oil',
  vite: 'vineyard_quality',
  uva: 'vineyard_quality',
  vigneto: 'vineyard_quality',
  vineyard: 'vineyard_quality',
  grapevine: 'vineyard_quality',
  frutteto: 'orchard_generic',
  orchard: 'orchard_generic',
  greenhouse: 'controlled_environment_leafy',
  serra: 'controlled_environment_leafy',
  hydroponic: 'controlled_environment_leafy',
  aquaponic: 'controlled_environment_leafy',
  aeroponic: 'controlled_environment_leafy',
};

export const AGRONOMIC_FALLBACK_BY_FUNCTIONAL_CATEGORY: Record<string, string> = {
  LEAF: 'leafy_vegetables',
  FRUIT: 'fruiting_vegetables',
  ROOT: 'leafy_vegetables',
  AROMATIC: 'aromatic_mediterranean',
  LEGUME: 'legumes',
  SPECIALIZED: 'orchard_generic',
};
