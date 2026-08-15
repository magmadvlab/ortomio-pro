import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = (path: string) => {
  assert.equal(existsSync(path), true, `missing commercial surface: ${path}`)
  return readFileSync(path, 'utf8')
}

const readIfExists = (path: string) => existsSync(path) ? readFileSync(path, 'utf8') : ''

const commercialSourceCorpus = () => [
  'components/landing/content.ts',
  'components/landing/LandingPage.tsx',
  'components/landing/LandingHeader.tsx',
  'components/landing/LandingFooter.tsx',
  'components/landing/PilotRequestForm.tsx',
  'components/landing/sections/Hero.tsx',
  'components/landing/sections/OrchestratorSection.tsx',
  'components/landing/sections/HowItWorks.tsx',
  'components/landing/sections/ReasonWhySection.tsx',
  'components/landing/sections/DecisionScenario.tsx',
  'components/landing/sections/PillarTransparency.tsx',
  'components/landing/sections/PrecisionEvidence.tsx',
  'components/landing/sections/PillarTraceability.tsx',
  'components/landing/sections/CertificationEvidence.tsx',
  'components/landing/sections/PlanningMemory.tsx',
  'components/landing/sections/SpecialistCrops.tsx',
  'components/landing/sections/AudienceSplit.tsx',
  'components/landing/sections/BenefitsList.tsx',
  'components/landing/sections/FinalCta.tsx',
  'app/come-funziona/page.tsx',
].map(read).concat(
  readIfExists('components/landing/sections/MaturitySection.tsx'),
).join('\n')

test('commercial pages end with one guided-trial CTA and no early commercial CTA', () => {
  const commercialSource = commercialSourceCorpus()
  const pages = [
    {
      page: read('components/landing/LandingPage.tsx'),
    },
    {
      page: read('app/come-funziona/page.tsx'),
    },
  ]

  assert.equal((commercialSource.match(/Richiedi una prova guidata/g) ?? []).length, 1)
  for (const actionLabel of ['Prova la demo ora', 'Richiedi una demo', 'Prenota una demo', 'Inizia la prova']) {
    assert.equal(commercialSource.includes(actionLabel), false, actionLabel)
  }
  assert.equal(commercialSource.includes('mailto:'), false)

  for (const { page } of pages) {
    assert.equal((page.match(/<FinalCta \/>/g) ?? []).length, 1)
    const finalCtaIndex = page.indexOf('<FinalCta />')
    const mainStartIndex = page.indexOf('<main')
    const mainEndIndex = page.indexOf('</main>', finalCtaIndex)
    const footerIndex = page.indexOf('<LandingFooter />')
    assert.equal(finalCtaIndex > mainStartIndex, true)
    assert.equal(finalCtaIndex < mainEndIndex, true)
    assert.equal(page.slice(finalCtaIndex + '<FinalCta />'.length, mainEndIndex).trim(), '')
    assert.equal(footerIndex > mainEndIndex, true)
  }
})

test('homepage names the differentiated AI promise and specialist crops without technical audit language', () => {
  assert.equal(existsSync('components/landing/content.ts'), true)
  const source = read('components/landing/content.ts')

  for (const phrase of [
    'AI agronomica dal satellite alla singola pianta',
    'vigneto',
    'oliveto',
    'frutteto',
    'vivaio',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }

  const homepage = [
    read('components/landing/LandingPage.tsx'),
    read('components/landing/LandingFooter.tsx'),
    read('components/landing/sections/SpecialistCrops.tsx'),
    read('components/landing/sections/PlanningMemory.tsx'),
  ].join('\n')

  for (const technicalLabel of ['NO-GO', 'release candidate', 'maturità verificabile', 'funzione in beta']) {
    assert.equal(homepage.toLowerCase().includes(technicalLabel.toLowerCase()), false, technicalLabel)
  }
  assert.equal(homepage.includes('MaturitySection'), false)
})

test('homepage explains the operational journey, nursery flow, and per-row plant traceability', () => {
  const source = [
    read('components/landing/sections/HowItWorks.tsx'),
    read('components/landing/sections/PillarTraceability.tsx'),
  ].join('\n')

  for (const phrase of [
    'filo conduttore',
    'Descrivi il contesto in cui lavori',
    'Decidi cosa fare e quando',
    'Dal vivaio al filare',
    'posizione esatta nel filare',
    'ogni pianta, vite o albero',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }

  for (const jargon of ['priorità spiegabili', 'pianifichi il task', 'nursing', 'hardening']) {
    assert.equal(source.toLowerCase().includes(jargon.toLowerCase()), false, jargon)
  }
})

test('specialist crop copy describes the nursery flow in customer-facing Italian', () => {
  const source = read('components/landing/content.ts').toLowerCase()

  for (const phrase of ['crescita in vivaio', 'preparazione al trapianto', 'posizione nel filare']) {
    assert.equal(source.includes(phrase), true, phrase)
  }
  for (const internalTerm of ['nursing', 'hardening']) {
    assert.equal(source.includes(internalTerm), false, internalTerm)
  }
})

test('commercial pages do not link to technical manuals or generic contacts', () => {
  const source = [
    read('components/landing/LandingHeader.tsx'),
    read('components/landing/LandingFooter.tsx'),
    read('app/come-funziona/page.tsx'),
  ].join('\n')

  for (const excluded of ['/docs/manual/', 'Manuali', 'Documentazione', 'mailto:']) {
    assert.equal(source.includes(excluded), false, excluded)
  }
})

test('come funziona uses commercial agronomic language instead of system jargon', () => {
  assert.equal(existsSync('app/come-funziona/page.tsx'), true)
  const source = read('app/come-funziona/page.tsx')

  for (const phrase of [
    'Dal campo alla decisione, senza perdere nessun passaggio',
    'Parte dalla situazione reale del campo',
    'Ti mostra cosa richiede attenzione',
    'Spiega perché propone un intervento',
    'Collega il lavoro al risultato',
    'Condizioni del campo, colture, lavori e costi nello stesso quadro',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }

  for (const jargon of ['segnale', 'briefing', 'provenienza', 'fase fenologica', 'task', 'esito']) {
    assert.equal(source.toLowerCase().includes(jargon.toLowerCase()), false, jargon)
  }
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
    'AI mette queste informazioni in relazione',
    'decisione resta al responsabile',
    'evidenza pronta da recuperare',
    'bozze AI iniziali da completare e verificare',
  ]) {
    assert.equal(source.toLowerCase().includes(phrase.toLowerCase()), true, phrase)
  }
})

test('commercial surfaces avoid internal jargon and unsupported promises', () => {
  const source = commercialSourceCorpus().toLowerCase()
  const precisionEvidence = read('components/landing/sections/PrecisionEvidence.tsx').toLowerCase()

  for (const forbidden of [
    'briefing',
    'orchestratore',
    'segnali correlati',
    'certificazione automatica',
    'emette certificati',
    'sostituisce l’ente certificatore',
    'conformità garantita',
    'certificazione garantita',
    'decisioni autonome',
    'decide autonomamente',
    'diagnosi automatica',
    'risultati garantiti',
    'ROI garantito',
    '100% di successo',
    'clienti soddisfatti',
    'pilot completato',
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden)
  }
  assert.equal(source.includes('quando i dati satellitari sono disponibili'), true)
  assert.equal(source.includes('telemetria'), true)
  for (const requiredIoTPhrase of [
    'Con dispositivi associati, la telemetria registra portata e litri erogati.',
    'OrtoMio mantiene distinti valori misurati, inseriti manualmente, pianificati e calcolati.',
  ]) {
    assert.equal(precisionEvidence.includes(requiredIoTPhrase.toLowerCase()), true, requiredIoTPhrase)
  }
})

test('certification and planning sections are contiguous after plant traceability', () => {
  const home = read('components/landing/LandingPage.tsx')

  assert.match(
    home,
    /<PillarTraceability \/>\s*<CertificationEvidence \/>\s*<PlanningMemory \/>\s*<SpecialistCrops \/>/,
  )
  assert.equal(home.includes('HowItWorks'), false)
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

test('homepage closes with action-oriented audience benefits and the approved guided-trial copy', () => {
  const audiences = read('components/landing/sections/AudienceSplit.tsx')
  const benefits = read('components/landing/sections/BenefitsList.tsx')
  const finalCta = read('components/landing/sections/FinalCta.tsx')
  const taskSixSource = [audiences, benefits, finalCta].join('\n')
  const normalizedSource = taskSixSource.replace(/\s+/g, ' ')

  for (const phrase of [
    'memoria condivisa',
    'dalla decisione alla verifica',
    'Confronta i clienti',
    'prepara ogni visita',
    'storia del consiglio',
  ]) {
    assert.equal(normalizedSource.includes(phrase), true, phrase)
  }

  for (const phrase of [
    'Cosa puoi verificare',
    'Dove serve attenzione prima di organizzare la giornata.',
    'Perché viene proposto un intervento.',
    'Cosa ha ricevuto ogni pianta e come ha risposto.',
    'Come piano, lavorazioni, costi e raccolto si confrontano.',
    'Quali informazioni sono pronte per registri e certificazioni.',
    'Come la storia aziendale continua tra una stagione e la successiva.',
  ]) {
    assert.equal(benefits.includes(phrase), true, phrase)
  }

  for (const phrase of [
    'Porta un caso reale. Lo ricostruiamo insieme in OrtoMio.',
    'Indicaci azienda, coltura ed esigenza principale. Prepareremo una prova guidata sui flussi più vicini al tuo lavoro: osservazione del campo, priorità AI, tracciabilità delle piante, pianificazione, IoT, NDVI o preparazione delle evidenze per le certificazioni.',
    'Ti ricontatteremo per preparare una dimostrazione coerente con il tuo contesto.',
  ]) {
    assert.equal(normalizedSource.includes(phrase), true, phrase)
  }

  for (const forbidden of [
    'briefing',
    'orchestratore',
    'segnali correlati',
    'mailto:',
    'manuali',
    'NO-GO',
    'release candidate',
    'maturità verificabile',
    'funzione in beta',
  ]) {
    assert.equal(taskSixSource.toLowerCase().includes(forbidden.toLowerCase()), false, forbidden)
  }
})

test('landing shell keeps manuals and contacts out of the post-CTA navigation', () => {
  const shell = [
    read('components/landing/LandingHeader.tsx'),
    read('components/landing/LandingFooter.tsx'),
  ].join('\n')

  for (const excluded of ['/docs/manual/', 'Manuali', 'Documentazione', 'mailto:', 'Contatti']) {
    assert.equal(shell.includes(excluded), false, excluded)
  }
  assert.equal(shell.includes('Accedi'), true)
  assert.equal(shell.includes('Come funziona'), true)
})

test('verification benefits use the exact neutral checklist without source-state machinery', () => {
  const source = read('components/landing/sections/BenefitsList.tsx')

  for (const phrase of [
    "'Dove serve attenzione prima di organizzare la giornata.'",
    "'Perché viene proposto un intervento.'",
    "'Cosa ha ricevuto ogni pianta e come ha risposto.'",
    "'Come piano, lavorazioni, costi e raccolto si confrontano.'",
    "'Quali informazioni sono pronte per registri e certificazioni.'",
    "'Come la storia aziendale continua tra una stagione e la successiva.'",
  ]) {
    assert.equal(source.includes(phrase), true, phrase)
  }

  assert.equal(source.includes('{ text:'), false)
  assert.equal(source.includes('swatch'), false)
  assert.equal(source.includes('Swatch'), false)
  assert.match(source, /<Check[^>]+aria-hidden="true"/)
})
