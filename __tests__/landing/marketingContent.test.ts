import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = (path: string) => readFileSync(path, 'utf8')

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
