import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock fetch globale
let lastFetchUrl = '';
let mockAlerts = [
  { gardenId: 'g1', category: 'water' as const, severity: 'warning' as const,
    message: 'Test', computedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60000).toISOString() }
];

global.fetch = async (input: RequestInfo | URL) => {
  lastFetchUrl = input.toString();
  return {
    ok: true,
    json: async () => ({ alerts: mockAlerts, fromCache: false, computedAt: new Date().toISOString() }),
  } as Response;
};

// Import DOPO il mock fetch
const { getFieldAlerts, clearFieldAlertsCache } = await import('../../services/fieldAlertService');

describe('fieldAlertService', () => {
  beforeEach(() => {
    clearFieldAlertsCache();
    lastFetchUrl = '';
  });

  test('fetches alerts on first call', async () => {
    const alerts = await getFieldAlerts('g1', 'http://localhost:54321');
    assert.equal(alerts.length, 1);
    assert.ok(lastFetchUrl.includes('compute-field-alerts'));
  });

  test('returns cache on second call within 5 minutes', async () => {
    await getFieldAlerts('g1', 'http://localhost:54321');
    lastFetchUrl = '';
    const alerts = await getFieldAlerts('g1', 'http://localhost:54321');
    assert.equal(alerts.length, 1);
    assert.equal(lastFetchUrl, ''); // nessuna fetch
  });

  test('fetches fresh data for different gardenId', async () => {
    await getFieldAlerts('g1', 'http://localhost:54321');
    lastFetchUrl = '';
    await getFieldAlerts('g2', 'http://localhost:54321');
    assert.ok(lastFetchUrl.includes('compute-field-alerts'));
  });
});
