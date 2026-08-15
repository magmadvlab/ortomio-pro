import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('guided trial collects and submits the four approved fields', () => {
  const source = readFileSync('components/landing/PilotRequestForm.tsx', 'utf8')
  for (const field of ['name', 'email', 'company', 'message']) assert.match(source, new RegExp(`name="${field}"`))
  assert.match(source, /guided_trial/)
  assert.match(source, /placeholder="Coltura, dimensione aziendale ed esigenza che vuoi approfondire"/)
  assert.match(source, /onClose\?: \(\) => void/)
  assert.match(source, /aria-label="Chiudi il modulo"/)
})

test('guided trial cannot close during a deferred submission and restores the invoking control', () => {
  const form = readFileSync('components/landing/PilotRequestForm.tsx', 'utf8')
  const finalCta = readFileSync('components/landing/sections/FinalCta.tsx', 'utf8')

  assert.match(form, /if \(status === 'submitting'\) return/)
  assert.match(form, /disabled=\{status === 'submitting'\}/)
  assert.match(finalCta, /const triggerRef = useRef<HTMLButtonElement>\(null\)/)
  assert.match(finalCta, /ref=\{triggerRef\}/)
  assert.match(finalCta, /triggerRef\.current\?\.focus\(\)/)
})

test('transparency keeps four stable panels while preserving roving focus navigation', () => {
  const source = readFileSync('components/landing/sections/PillarTransparency.tsx', 'utf8')

  assert.match(source, /TABS\.map\(\(tab, i\) => \(/)
  assert.match(source, /id=\{`transparency-panel-\$\{i\}`\}/)
  assert.match(source, /hidden=\{tab !== activeTab\}/)
  assert.match(source, /tabIndex=\{tab === activeTab \? 0 : -1\}/)
  assert.match(source, /document\.getElementById\(`transparency-tab-/)
  assert.match(source, /e\.key === 'ArrowRight'/)
  assert.match(source, /e\.key === 'ArrowLeft'/)
})

test('support route preserves the company on guided trial requests', () => {
  const source = readFileSync('app/api/support/submit/route.ts', 'utf8')
  assert.match(source, /formData\.get\('company'\)/)
  assert.match(source, /guided_trial/)
})
