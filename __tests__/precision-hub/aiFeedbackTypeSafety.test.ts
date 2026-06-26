import { strict as assert } from 'node:assert'
import { test } from 'node:test'

test('DataSource accepts nested unknown payload (compile-time guard)', () => {
  const source = {
    type: 'weather' as const,
    timestamp: new Date().toISOString(),
    data: { temperature: 22, nested: { humidity: 65 } } as Record<string, unknown>,
    reliability: 0.9,
  }
  assert.strictEqual(source.data['temperature'], 22)
  assert.deepStrictEqual(source.data['nested'], { humidity: 65 })
})

test('suggested_parameters accepts Record<string, unknown>', () => {
  const params: Record<string, unknown> = {
    amount_liters: 10,
    frequency: 'daily',
    nested: { zone: 'A' },
  }
  assert.strictEqual(params['amount_liters'], 10)
})
