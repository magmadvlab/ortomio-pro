// __tests__/precision-hub/fieldAlertCheckers.test.ts
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkWaterAlert,
  checkTreatmentAlert,
  checkHeatAlert,
  checkDiseaseAlert,
  checkHarvestAlert,
} from '../../services/fieldAlertCheckers';
import type { WeatherData } from '../../types/fieldAlerts';

const gardenId = 'garden-test-1';

const makeWeather = (precipMm: number[] = [0,0,0,0,0,0,0], tempMax: number[] = [25,25,25,25,25,25,25]): WeatherData => ({
  daily: {
    time: ['2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22'],
    temperature_2m_max: tempMax,
    temperature_2m_min: tempMax.map(t => t - 10),
    precipitation_sum: precipMm,
    sunshine_duration: [36000,36000,36000,36000,36000,36000,36000],
    precipitation_probability_max: [10,10,10,10,10,10,10],
    windspeed_10m_max: [12,12,12,12,12,12,12],
  }
});

// ── WATER ──────────────────────────────────────────────────────
describe('checkWaterAlert', () => {
  test('ok when irrigation within 3 days and no deficit', () => {
    const today = new Date('2026-06-22');
    const lastIrrigation = new Date('2026-06-20').toISOString();
    const result = checkWaterAlert(gardenId, [lastIrrigation], makeWeather([2,2,2,2,2,2,2]), today);
    assert.equal(result.severity, 'ok');
  });

  test('warning when precipitation deficit > 10mm', () => {
    const today = new Date('2026-06-22');
    const result = checkWaterAlert(gardenId, [], makeWeather([0,0,0,0,0,0,0]), today);
    assert.equal(result.severity, 'warning');
  });

  test('critical when no irrigation for 5+ days and deficit > 25mm', () => {
    const today = new Date('2026-06-22');
    const oldIrrigation = new Date('2026-06-15').toISOString(); // 7 giorni fa
    const result = checkWaterAlert(gardenId, [oldIrrigation], makeWeather([0,0,0,0,0,0,0]), today);
    assert.equal(result.severity, 'critical');
  });
});

// ── TREATMENT ──────────────────────────────────────────────────
describe('checkTreatmentAlert', () => {
  test('ok when no treatments needed', () => {
    const today = new Date('2026-06-22');
    const result = checkTreatmentAlert(gardenId, [], today);
    assert.equal(result.severity, 'ok');
  });

  test('warning when treatment due in 2 days', () => {
    const today = new Date('2026-06-22');
    const nextDue = new Date('2026-06-24').toISOString();
    const result = checkTreatmentAlert(gardenId, [{ nextDueDate: nextDue }], today);
    assert.equal(result.severity, 'warning');
  });

  test('critical when treatment overdue by 1+ day', () => {
    const today = new Date('2026-06-22');
    const overdue = new Date('2026-06-20').toISOString();
    const result = checkTreatmentAlert(gardenId, [{ nextDueDate: overdue }], today);
    assert.equal(result.severity, 'critical');
  });
});

// ── HEAT ───────────────────────────────────────────────────────
describe('checkHeatAlert', () => {
  test('ok at normal temperature', () => {
    const result = checkHeatAlert(gardenId, makeWeather([0,0,0,0,0,0,0], [22,22,22,22,22,22,22]));
    assert.equal(result.severity, 'ok');
  });

  test('warning when 2+ consecutive days above 35°C', () => {
    const result = checkHeatAlert(gardenId, makeWeather([0,0,0,0,0,0,0], [36,37,36,25,25,25,25]));
    assert.equal(result.severity, 'warning');
  });

  test('critical when temperature exceeds 40°C', () => {
    const result = checkHeatAlert(gardenId, makeWeather([0,0,0,0,0,0,0], [41,41,40,25,25,25,25]));
    assert.equal(result.severity, 'critical');
  });
});

// ── DISEASE ────────────────────────────────────────────────────
describe('checkDiseaseAlert', () => {
  test('ok in dry conditions', () => {
    const result = checkDiseaseAlert(gardenId, makeWeather([0,0,0,0,0,0,0]));
    assert.equal(result.severity, 'ok');
  });

  test('warning after 3+ rainy days (peronospora risk)', () => {
    const result = checkDiseaseAlert(gardenId, makeWeather([5,6,4,0,0,0,0]));
    assert.equal(result.severity, 'warning');
  });

  test('critical after 5+ rainy days', () => {
    const result = checkDiseaseAlert(gardenId, makeWeather([5,6,4,3,7,0,0]));
    assert.equal(result.severity, 'critical');
  });
});

// ── HARVEST ────────────────────────────────────────────────────
describe('checkHarvestAlert', () => {
  test('ok when no plants nearing harvest', () => {
    const today = new Date('2026-06-22');
    const result = checkHarvestAlert(gardenId, [], today);
    assert.equal(result.severity, 'ok');
  });

  test('warning when harvest window opens within 7 days', () => {
    const today = new Date('2026-06-22');
    const soon = new Date('2026-06-27').toISOString();
    const result = checkHarvestAlert(gardenId, [{ expectedHarvestDate: soon, harvested: false }], today);
    assert.equal(result.severity, 'warning');
  });

  test('critical when harvest window is open and not harvested', () => {
    const today = new Date('2026-06-22');
    const past = new Date('2026-06-20').toISOString();
    const result = checkHarvestAlert(gardenId, [{ expectedHarvestDate: past, harvested: false }], today);
    assert.equal(result.severity, 'critical');
  });
});
