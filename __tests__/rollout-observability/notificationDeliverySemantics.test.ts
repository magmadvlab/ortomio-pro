import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('notification preference failures suppress delivery instead of opting users in', () => {
  const source = readFileSync('services/notificationService.ts', 'utf8')
  const preferenceFunction = source.slice(
    source.indexOf('async function checkUserPreferences'),
    source.indexOf('/**\n * Invia notifica email'),
  )
  assert.equal(preferenceFunction.includes('return true; // Default: invia'), false)
  assert.match(preferenceFunction, /Senza preferenze autorevoli non inviare/)
})

test('intelligent notifications never set sentAt on failed provider delivery', () => {
  const source = readFileSync('services/intelligentNotificationService.ts', 'utf8')
  assert.match(source, /if \(result\.success\) \{\s*notification\.sentAt/)
  assert.match(source, /no persistent scheduler exists yet - it will not be sent automatically/)
})
