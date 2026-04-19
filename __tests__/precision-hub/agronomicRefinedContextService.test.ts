import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildAgronomicRefinedContext,
  deriveOperationalContextTagsFromRefinedContext,
  normalizeCultivarContext,
} from '@/services/agronomicRefinedContextService'

test('normalizeCultivarContext unifies varietal fields and infers production intent', () => {
  const cultivarContext = normalizeCultivarContext({
    primaryCultivar: 'Coratina',
    speciesLabel: 'Olive',
    operationalContextTags: ['oil_cultivar'],
  })

  assert.deepEqual(cultivarContext, {
    cultivarId: undefined,
    cultivarLabel: 'Coratina',
    speciesLabel: 'Olive',
    productionIntent: 'oil',
  })
})

test('buildAgronomicRefinedContext derives subsystem and site profile from metadata', () => {
  const result = buildAgronomicRefinedContext({
    cultivarLabel: 'Sangiovese',
    speciesLabel: 'Vite',
    productionIntent: 'wine',
    gardenType: 'Greenhouse Vineyard',
    irrigationMode: 'drip',
    trainingSystem: 'Guyot',
    rootstock: '1103P',
    altitudeMeters: 720,
    slopePercentage: 14,
    sunExposure: 'Full',
    soilType: 'Loamy',
    terroir: 'coastal hillside',
    textValues: ['docg block with protected greenhouse support'],
  })

  assert.equal(result.refinedContext.cultivarContext?.cultivarLabel, 'Sangiovese')
  assert.equal(result.refinedContext.cultivarContext?.productionIntent, 'wine')
  assert.equal(result.refinedContext.subSystemContext?.systemType, 'protected_culture')
  assert.equal(result.refinedContext.subSystemContext?.irrigationMode, 'pressurized_irrigation')
  assert.equal(result.refinedContext.subSystemContext?.trainingSystem, 'Guyot')
  assert.equal(result.refinedContext.subSystemContext?.rootstock, '1103P')
  assert.equal(result.refinedContext.siteOperationalProfile?.exposureClass, 'exposed')
  assert.equal(result.refinedContext.siteOperationalProfile?.slopeClass, 'steep')
  assert.equal(result.refinedContext.siteOperationalProfile?.soilType, 'Loamy')
  assert.equal(result.operationalContextTags.includes('protected_culture'), true)
  assert.equal(result.operationalContextTags.includes('pressurized_irrigation'), true)
  assert.equal(result.operationalContextTags.includes('wine_grape'), true)
  assert.equal(result.operationalContextTags.includes('high_altitude_site'), true)
  assert.equal(result.operationalContextTags.includes('coastal_site'), true)
  assert.equal(result.operationalContextTags.includes('steep_slope_site'), true)
  assert.equal(result.operationalContextTags.includes('exposed_site'), true)
})

test('deriveOperationalContextTagsFromRefinedContext preserves intent and site classes', () => {
  const tags = deriveOperationalContextTagsFromRefinedContext({
    cultivarContext: {
      cultivarLabel: 'Arbequina',
      productionIntent: 'table_olive',
    },
    subSystemContext: {
      systemType: 'olive_grove',
      irrigationMode: 'rainfed',
    },
    siteOperationalProfile: {
      altitudeMeters: 650,
      slopePercentage: 4,
      exposureClass: 'sheltered',
      siteTags: ['coastal_site'],
    },
  })

  assert.deepEqual(tags, [
    'olive_grove',
    'rainfed',
    'table_olive',
    'high_altitude_site',
    'sheltered_site',
    'coastal_site',
  ])
})
