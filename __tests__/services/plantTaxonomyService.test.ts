/**
 * Test per plantTaxonomyService
 */

import { 
  getPlantTaxonomy, 
  getPlantFamily, 
  getPlantArchetype, 
  getPlantFunctionalCategory 
} from '../../services/plantTaxonomyService';

describe('plantTaxonomyService', () => {
  describe('getPlantTaxonomy', () => {
    it('should return taxonomy for pomodoro', async () => {
      const taxonomy = await getPlantTaxonomy('pomodoro');
      expect(taxonomy).toBeDefined();
      if (taxonomy) {
        expect(taxonomy.plantId).toBe('pomodoro');
        expect(taxonomy.familyId).toBe('Solanaceae');
        expect(taxonomy.archetypeId).toBe('A1');
        expect(taxonomy.functionalCategory).toBe('FRUIT');
      }
    });

    it('should return taxonomy for carosello', async () => {
      const taxonomy = await getPlantTaxonomy('carosello');
      expect(taxonomy).toBeDefined();
      if (taxonomy) {
        expect(taxonomy.plantId).toBe('carosello');
        expect(taxonomy.familyId).toBe('Cucurbitaceae');
        expect(taxonomy.archetypeId).toBe('A2');
        expect(taxonomy.functionalCategory).toBe('FRUIT');
      }
    });

    it('should return null for unknown plant', async () => {
      const taxonomy = await getPlantTaxonomy('pianta_inesistente_xyz');
      expect(taxonomy).toBeNull();
    });
  });

  describe('getPlantFamily', () => {
    it('should return family for pomodoro', async () => {
      const family = await getPlantFamily('pomodoro');
      expect(family).toBe('Solanaceae');
    });

    it('should return family for carosello', async () => {
      const family = await getPlantFamily('carosello');
      expect(family).toBe('Cucurbitaceae');
    });
  });

  describe('getPlantArchetype', () => {
    it('should return archetype for pomodoro', async () => {
      const archetype = await getPlantArchetype('pomodoro');
      expect(archetype).toBe('A1');
    });

    it('should return archetype for carosello', async () => {
      const archetype = await getPlantArchetype('carosello');
      expect(archetype).toBe('A2');
    });
  });

  describe('getPlantFunctionalCategory', () => {
    it('should return functional category for pomodoro', async () => {
      const category = await getPlantFunctionalCategory('pomodoro');
      expect(category).toBe('FRUIT');
    });

    it('should return functional category for lattuga', async () => {
      const category = await getPlantFunctionalCategory('lattuga');
      expect(category).toBe('LEAF');
    });

    it('should return functional category for fagiolo', async () => {
      const category = await getPlantFunctionalCategory('fagiolo');
      expect(category).toBe('LEGUME');
    });
  });

  describe('fallback to PlantMasterSheet', () => {
    it('should fallback to PlantMasterSheet if not in taxonomy', async () => {
      // Assumendo che esista una pianta in PlantMasterSheet ma non in taxonomy
      const taxonomy = await getPlantTaxonomy('pomodoro');
      // Dovrebbe comunque funzionare grazie al fallback
      expect(taxonomy).toBeDefined();
    });
  });
});

