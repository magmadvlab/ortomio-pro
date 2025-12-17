/**
 * Test per plantFuzzySearchService
 */

import { fuzzySearchPlant } from '../../services/plantFuzzySearchService';
import { normalizeText } from '../../utils/textNormalizer';

describe('plantFuzzySearchService', () => {
  describe('normalizeText', () => {
    it('should normalize text correctly', () => {
      expect(normalizeText('Pomodoro')).toBe('pomodoro');
      expect(normalizeText('Pomìdoro')).toBe('pomidoro');
      expect(normalizeText('Pomodoro  Romana')).toBe('pomodoro romana');
      expect(normalizeText('Pomodoro!')).toBe('pomodoro');
    });
  });

  describe('fuzzySearchPlant', () => {
    it('should find pomodoro by synonym pummador', async () => {
      const results = await fuzzySearchPlant('pummador', 'it-campania');
      expect(results.length).toBeGreaterThan(0);
      const pomodoroResult = results.find(r => r.plantId === 'pomodoro');
      expect(pomodoroResult).toBeDefined();
      if (pomodoroResult) {
        expect(pomodoroResult.matchType).toBe('synonym');
      }
    });

    it('should find carosello by synonym barattiere', async () => {
      const results = await fuzzySearchPlant('barattiere', 'it-puglia');
      expect(results.length).toBeGreaterThan(0);
      const caroselloResult = results.find(r => r.plantId === 'carosello');
      expect(caroselloResult).toBeDefined();
      if (caroselloResult) {
        expect(caroselloResult.matchType).toBe('synonym');
        expect(caroselloResult.archetypeId).toBe('A2');
      }
    });

    it('should NOT find pomodoro when searching for burattino', async () => {
      const results = await fuzzySearchPlant('burattino', 'it');
      // burattino non è un sinonimo valido, quindi non dovrebbe trovare nulla
      const pomodoroResult = results.find(r => r.plantId === 'pomodoro');
      expect(pomodoroResult).toBeUndefined();
    });

    it('should find carosello by synonym cianciuffo', async () => {
      const results = await fuzzySearchPlant('cianciuffo', 'it-puglia');
      expect(results.length).toBeGreaterThan(0);
      const caroselloResult = results.find(r => r.plantId === 'carosello');
      expect(caroselloResult).toBeDefined();
    });

    it('should filter by archetype when provided', async () => {
      const results = await fuzzySearchPlant('pomodoro', 'it', 'A1');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(r => {
        expect(r.archetypeId).toBe('A1');
      });
    });

    it('should return empty array for query shorter than 2 characters', async () => {
      const results = await fuzzySearchPlant('p', 'it');
      expect(results).toEqual([]);
    });
  });
});

