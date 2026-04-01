import type { ZoneEnvironmentalHistorySummary } from '@/services/environmentalMonitoringService'
import type { AgronomicEconomicSource } from '@/services/agronomicEconomicPriorityService'
import type { AgronomicPriorityFocus } from '@/services/agronomicPriorityService'
import type { AgronomicSignalKey } from '@/types/agronomicKernel'

export interface AgronomicValidationCandidateFixture {
  id: string
  focus: AgronomicPriorityFocus
  source: AgronomicEconomicSource
  baseScore: number
  confidence: number
  availableSignals?: AgronomicSignalKey[]
  isCriticalStage?: boolean
  urgencyLabel?: 'immediate' | 'next_cycle' | 'monitor'
  severity?: 'critical' | 'high' | 'medium' | 'low'
  averageEfficiency?: number
  uniformityCoefficient?: number
  waterUseEfficiency?: number
  efficacyScore?: number
  qualityScoreGap?: number
  benchmarkGap?: number
}

export interface AgronomicValidationScenarioFixture {
  id: string
  label: string
  cropNameHint?: string
  agronomicProfileId?: string
  environmentalSummary?: ZoneEnvironmentalHistorySummary
  candidates: AgronomicValidationCandidateFixture[]
  expected: {
    profileId: string
    topCandidateId: string
    minTopScore: number
    minTopConfidence: number
    roiDirection: 'positive' | 'watch' | 'defensive'
  }
}

const severeDeficit: ZoneEnvironmentalHistorySummary = {
  zoneId: 'zone-deficit',
  gardenId: 'garden-validation',
  entries: 6,
  highSoilWaterStressDays: 4,
  mediumSoilWaterStressDays: 1,
  highDiseasePressureDays: 0,
  sensorLocalDays: 2,
  deficitWaterBalanceDays: 5,
  surplusWaterBalanceDays: 0,
  lowDryingPowerDays: 0,
  latestSensorPrecedence: 'sensor_local',
  latestSoilWaterStressLevel: 'high',
  dominantWeatherSourceClass: 'historical_archive',
}

const moderateDeficit: ZoneEnvironmentalHistorySummary = {
  zoneId: 'zone-moderate-deficit',
  gardenId: 'garden-validation',
  entries: 5,
  highSoilWaterStressDays: 2,
  mediumSoilWaterStressDays: 2,
  highDiseasePressureDays: 1,
  sensorLocalDays: 1,
  deficitWaterBalanceDays: 3,
  surplusWaterBalanceDays: 0,
  lowDryingPowerDays: 1,
  latestSensorPrecedence: 'sensor_local',
  latestSoilWaterStressLevel: 'medium',
  dominantWeatherSourceClass: 'historical_archive',
}

const severeHumidity: ZoneEnvironmentalHistorySummary = {
  zoneId: 'zone-humidity',
  gardenId: 'garden-validation',
  entries: 6,
  highSoilWaterStressDays: 0,
  mediumSoilWaterStressDays: 1,
  highDiseasePressureDays: 4,
  sensorLocalDays: 2,
  deficitWaterBalanceDays: 0,
  surplusWaterBalanceDays: 3,
  lowDryingPowerDays: 4,
  latestSensorPrecedence: 'sensor_local',
  latestSoilWaterStressLevel: 'low',
  dominantWeatherSourceClass: 'historical_archive',
}

export const AGRONOMIC_VALIDATION_SCENARIOS: AgronomicValidationScenarioFixture[] = [
  {
    id: 'rainfed_wheat',
    label: 'Rainfed wheat under persistent deficit',
    cropNameHint: 'durum wheat',
    environmentalSummary: severeDeficit,
    candidates: [
      {
        id: 'water_now',
        focus: 'water',
        source: 'irrigation',
        baseScore: 66,
        confidence: 0.68,
        availableSignals: ['weather_forecast', 'soil_moisture_30cm', 'soil_moisture_60cm'],
        isCriticalStage: true,
        averageEfficiency: 74,
        uniformityCoefficient: 71,
        waterUseEfficiency: 72,
      },
      {
        id: 'nitrogen_split',
        focus: 'nutrition',
        source: 'prescription',
        baseScore: 60,
        confidence: 0.66,
        availableSignals: ['operation_ledger', 'satellite_vigor', 'weather_forecast'],
        isCriticalStage: true,
        efficacyScore: 68,
      },
    ],
    expected: {
      profileId: 'winter_cereals',
      topCandidateId: 'water_now',
      minTopScore: 80,
      minTopConfidence: 0.7,
      roiDirection: 'positive',
    },
  },
  {
    id: 'barley_nitrogen',
    label: 'Barley with nitrogen-sensitive top-dressing window',
    cropNameHint: 'barley',
    environmentalSummary: moderateDeficit,
    candidates: [
      {
        id: 'nitrogen_split',
        focus: 'nutrition',
        source: 'prescription',
        baseScore: 70,
        confidence: 0.72,
        availableSignals: ['operation_ledger', 'satellite_vigor', 'weather_forecast'],
        isCriticalStage: true,
        efficacyScore: 62,
        benchmarkGap: 8,
      },
      {
        id: 'water_support',
        focus: 'water',
        source: 'irrigation',
        baseScore: 58,
        confidence: 0.65,
        availableSignals: ['weather_forecast', 'soil_moisture_30cm'],
        isCriticalStage: true,
        averageEfficiency: 79,
        uniformityCoefficient: 77,
        waterUseEfficiency: 75,
      },
    ],
    expected: {
      profileId: 'winter_cereals',
      topCandidateId: 'nitrogen_split',
      minTopScore: 82,
      minTopConfidence: 0.74,
      roiDirection: 'positive',
    },
  },
  {
    id: 'legumes_spring_stress',
    label: 'Broadacre legumes under spring stress',
    cropNameHint: 'faba bean',
    environmentalSummary: severeDeficit,
    candidates: [
      {
        id: 'water_now',
        focus: 'water',
        source: 'irrigation',
        baseScore: 68,
        confidence: 0.69,
        availableSignals: ['weather_forecast', 'soil_moisture_30cm', 'soil_moisture_60cm'],
        isCriticalStage: true,
        averageEfficiency: 73,
        uniformityCoefficient: 72,
        waterUseEfficiency: 70,
      },
      {
        id: 'starter_correction',
        focus: 'nutrition',
        source: 'prescription',
        baseScore: 51,
        confidence: 0.64,
        availableSignals: ['operation_ledger'],
        efficacyScore: 74,
      },
    ],
    expected: {
      profileId: 'broadacre_legumes',
      topCandidateId: 'water_now',
      minTopScore: 79,
      minTopConfidence: 0.71,
      roiDirection: 'positive',
    },
  },
  {
    id: 'brassicas_bulking',
    label: 'Field brassicas during bulking under humid pressure',
    cropNameHint: 'broccoli',
    environmentalSummary: severeHumidity,
    candidates: [
      {
        id: 'quality_protection',
        focus: 'quality',
        source: 'phenology',
        baseScore: 71,
        confidence: 0.75,
        availableSignals: ['quality_result', 'weather_forecast', 'soil_moisture_30cm'],
        isCriticalStage: true,
        qualityScoreGap: 9,
      },
      {
        id: 'health_protection',
        focus: 'health',
        source: 'health',
        baseScore: 69,
        confidence: 0.73,
        availableSignals: ['leaf_wetness', 'dew_point', 'weather_current'],
        isCriticalStage: true,
        severity: 'high',
      },
    ],
    expected: {
      profileId: 'field_brassicas',
      topCandidateId: 'quality_protection',
      minTopScore: 84,
      minTopConfidence: 0.78,
      roiDirection: 'positive',
    },
  },
  {
    id: 'artichoke_harvest_window',
    label: 'Artichoke during repeated harvest windows',
    cropNameHint: 'artichokes',
    environmentalSummary: severeHumidity,
    candidates: [
      {
        id: 'quality_window',
        focus: 'quality',
        source: 'phenology',
        baseScore: 74,
        confidence: 0.78,
        availableSignals: ['quality_result', 'weather_forecast', 'soil_moisture_30cm'],
        isCriticalStage: true,
        qualityScoreGap: 10,
      },
      {
        id: 'water_support',
        focus: 'water',
        source: 'irrigation',
        baseScore: 63,
        confidence: 0.69,
        availableSignals: ['weather_forecast', 'soil_moisture_30cm', 'soil_moisture_60cm'],
        isCriticalStage: true,
        averageEfficiency: 76,
        uniformityCoefficient: 73,
        waterUseEfficiency: 71,
      },
    ],
    expected: {
      profileId: 'artichoke_open_field',
      topCandidateId: 'quality_window',
      minTopScore: 86,
      minTopConfidence: 0.8,
      roiDirection: 'positive',
    },
  },
  {
    id: 'orchard_quality_pressure',
    label: 'Orchard under fruit-quality pressure',
    agronomicProfileId: 'orchard_generic',
    cropNameHint: 'orchard',
    environmentalSummary: severeHumidity,
    candidates: [
      {
        id: 'quality_finish',
        focus: 'quality',
        source: 'phenology',
        baseScore: 72,
        confidence: 0.76,
        availableSignals: ['quality_result', 'leaf_wetness', 'dew_point'],
        isCriticalStage: true,
        qualityScoreGap: 8,
      },
      {
        id: 'health_cover',
        focus: 'health',
        source: 'health',
        baseScore: 67,
        confidence: 0.72,
        availableSignals: ['leaf_wetness', 'dew_point', 'weather_current'],
        isCriticalStage: true,
        severity: 'high',
      },
    ],
    expected: {
      profileId: 'orchard_generic',
      topCandidateId: 'quality_finish',
      minTopScore: 81,
      minTopConfidence: 0.79,
      roiDirection: 'positive',
    },
  },
  {
    id: 'olive_oil_quality',
    label: 'Olive grove with oil-quality pressure',
    cropNameHint: 'olive grove',
    environmentalSummary: moderateDeficit,
    candidates: [
      {
        id: 'quality_finish',
        focus: 'quality',
        source: 'phenology',
        baseScore: 73,
        confidence: 0.77,
        availableSignals: ['quality_result', 'phenology_observation', 'soil_tension_kpa'],
        isCriticalStage: true,
        qualityScoreGap: 7,
      },
      {
        id: 'water_support',
        focus: 'water',
        source: 'irrigation',
        baseScore: 61,
        confidence: 0.7,
        availableSignals: ['soil_tension_kpa', 'weather_forecast'],
        isCriticalStage: true,
        averageEfficiency: 77,
        uniformityCoefficient: 75,
        waterUseEfficiency: 74,
      },
    ],
    expected: {
      profileId: 'olive_grove_oil',
      topCandidateId: 'quality_finish',
      minTopScore: 82,
      minTopConfidence: 0.79,
      roiDirection: 'positive',
    },
  },
  {
    id: 'vineyard_ripening',
    label: 'Vineyard near ripening',
    cropNameHint: 'vineyard',
    environmentalSummary: moderateDeficit,
    candidates: [
      {
        id: 'quality_finish',
        focus: 'quality',
        source: 'phenology',
        baseScore: 75,
        confidence: 0.8,
        availableSignals: ['quality_result', 'dew_point', 'vpd'],
        isCriticalStage: true,
        qualityScoreGap: 9,
      },
      {
        id: 'health_cover',
        focus: 'health',
        source: 'health',
        baseScore: 66,
        confidence: 0.71,
        availableSignals: ['leaf_wetness', 'dew_point', 'weather_current'],
        isCriticalStage: true,
        severity: 'high',
      },
    ],
    expected: {
      profileId: 'vineyard_quality',
      topCandidateId: 'quality_finish',
      minTopScore: 85,
      minTopConfidence: 0.82,
      roiDirection: 'positive',
    },
  },
  {
    id: 'controlled_environment_water_quality',
    label: 'Controlled environment with water-quality constraints',
    agronomicProfileId: 'controlled_environment_leafy',
    cropNameHint: 'greenhouse',
    environmentalSummary: moderateDeficit,
    candidates: [
      {
        id: 'solution_stability',
        focus: 'water',
        source: 'irrigation',
        baseScore: 72,
        confidence: 0.79,
        availableSignals: ['water_ph', 'water_salinity'],
        isCriticalStage: true,
        averageEfficiency: 82,
        uniformityCoefficient: 84,
        waterUseEfficiency: 80,
      },
      {
        id: 'quality_uniformity',
        focus: 'quality',
        source: 'phenology',
        baseScore: 64,
        confidence: 0.74,
        availableSignals: ['quality_result', 'vpd'],
        isCriticalStage: true,
        qualityScoreGap: 6,
      },
    ],
    expected: {
      profileId: 'controlled_environment_leafy',
      topCandidateId: 'solution_stability',
      minTopScore: 77,
      minTopConfidence: 0.78,
      roiDirection: 'positive',
    },
  },
]
