import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = (path: string) => {
  assert.equal(existsSync(path), true, `missing commercial surface: ${path}`)
  return readFileSync(path, 'utf8')
}

test('homepage exposes one guided-trial CTA and no early demo CTA', () => {
  const source = [
    read('components/landing/LandingHeader.tsx'),
    read('components/landing/sections/Hero.tsx'),
    read('components/landing/sections/FinalCta.tsx'),
    read('components/landing/content.ts'),
  ].join('\n')

  assert.equal((source.match(/Richiedi una prova guidata/g) ?? []).length, 1)
  assert.equal(source.includes('Prova la demo ora'), false)
})

test('homepage names decision verification, specialist crops, and commercial maturity', () => {
  assert.equal(existsSync('components/landing/content.ts'), true)
  const source = read('components/landing/content.ts')

  for (const phrase of [
    'decisioni agronomiche verificabili',
    'vigneto',
    'oliveto',
    'frutteto',
    'vivaio',
    'NO-GO',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})

test('come funziona route links to the existing manuals', () => {
  assert.equal(existsSync('app/come-funziona/page.tsx'), true)
  const source = read('app/come-funziona/page.tsx') + read('components/landing/content.ts')
  assert.match(source, /\/docs\/manual\//)
})

test('hero states the differentiated AI promise', () => {
  const content = read('components/landing/content.ts')
  const hero = read('components/landing/sections/Hero.tsx')

  for (const phrase of [
    'AI agronomica dal satellite alla singola pianta',
    'Tutto ciò che accade in campo diventa una decisione che puoi spiegare',
    'NDVI',
    'ogni singola pianta, vite o albero',
  ]) {
    assert.equal((content + hero).toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})

test('homepage proves observation, individual inputs, AI reasoning, and certification evidence', () => {
  const source = [
    read('components/landing/LandingPage.tsx'),
    read('components/landing/sections/ReasonWhySection.tsx'),
    read('components/landing/sections/DecisionScenario.tsx'),
    read('components/landing/sections/PrecisionEvidence.tsx'),
    read('components/landing/sections/PillarTraceability.tsx'),
    read('components/landing/sections/CertificationEvidence.tsx'),
  ].join('\n')

  for (const phrase of [
    'Un’unica lettura, dal campo alla singola pianta',
    'Un dato isolato dice poco',
    'acqua',
    'nutrimenti',
    'trattamenti',
    'NDVI',
    'IoT',
    'biologico',
    'GlobalG.A.P.',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})

test('commercial surfaces avoid internal jargon and unsupported promises', () => {
  const source = [
    read('components/landing/content.ts'),
    read('components/landing/LandingPage.tsx'),
    read('components/landing/sections/ReasonWhySection.tsx'),
    read('components/landing/sections/DecisionScenario.tsx'),
    read('components/landing/sections/PrecisionEvidence.tsx'),
    read('components/landing/sections/CertificationEvidence.tsx'),
    read('app/come-funziona/page.tsx'),
  ].join('\n').toLowerCase()

  for (const forbidden of ['briefing', 'orchestratore', 'segnali correlati', 'certificazione automatica']) {
    assert.equal(source.includes(forbidden), false, forbidden)
  }
  assert.equal(source.includes('quando i dati satellitari sono disponibili'), true)
  assert.equal(source.includes('telemetria'), true)
})

test('homepage follows the approved persuasion order and ends with one CTA', () => {
  const home = read('components/landing/LandingPage.tsx')
  const expected = [
    '<Hero />',
    '<ReasonWhySection />',
    '<DecisionScenario />',
    '<PillarTransparency />',
    '<PrecisionEvidence />',
    '<PillarTraceability />',
    '<CertificationEvidence />',
    '<PlanningMemory />',
    '<SpecialistCrops />',
    '<AudienceSplit />',
    '<BenefitsList />',
    '<FinalCta />',
  ]
  let previous = -1
  for (const component of expected) {
    const index = home.indexOf(component)
    assert.equal(index > previous, true, component)
    previous = index
  }
})
