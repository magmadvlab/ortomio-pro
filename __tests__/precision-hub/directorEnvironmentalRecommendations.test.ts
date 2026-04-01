import test from 'node:test'
import assert from 'node:assert/strict'

import { directorService } from '@/services/directorService'

test('director recommendations include persistent environmental history guidance', () => {
  const recommendations = (directorService as any).generateRecommendations(
    {},
    [],
    {
      gardenId: 'garden-1',
      entries: 6,
      trackedZones: 2,
      highSoilWaterStressDays: 3,
      mediumSoilWaterStressDays: 1,
      highDiseasePressureDays: 2,
      sensorLocalDays: 2,
      deficitWaterBalanceDays: 4,
      surplusWaterBalanceDays: 0,
      lowDryingPowerDays: 2,
      latestSoilWaterStressLevel: 'high',
      dominantWeatherSourceClass: 'station',
    }
  )

  assert.ok(
    recommendations.some((entry: string) => entry.includes('Pressione ambientale persistente'))
  )
  assert.ok(
    recommendations.some((entry: string) => entry.includes('Deficit idrico persistente'))
  )
  assert.ok(
    recommendations.some((entry: string) => entry.includes('Bassa capacita di asciugatura'))
  )
})
