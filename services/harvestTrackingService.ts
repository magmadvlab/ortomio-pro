/**
 * Harvest Tracking Service
 * Gestisce il collegamento tra colture piantate e raccolti
 * Fornisce analisi di resa e performance
 */

import { GardenTask } from '@/types';

export interface HarvestData {
  id: string;
  plant_name: string;
  variety?: string;
  quantity: number;
  unit: string;
  harvest_date: string;
  rating?: number; // Changed from quality_rating to match database
  notes?: string;
  garden_id: string;
  zone_id?: string;
  field_id?: string;
  task_id?: string; // Collegamento al task di coltivazione
  is_tracked?: boolean; // true se collegato a una coltura tracciata
  created_at: string;
}

export interface PlantedCrop {
  taskId: string;
  plantName: string;
  variety?: string;
  plantingDate: string;
  stage: string;
  quantity?: number;
  locationType: string;
  zoneId?: string;
  rowId?: string;
  isReadyToHarvest: boolean;
  daysFromPlanting: number;
  expectedHarvestDate?: string;
  estimatedYield?: number; // kg stimati
}

export interface HarvestAnalysis {
  totalHarvested: number;
  averageYield: number;
  bestPerformingVariety?: string;
  worstPerformingVariety?: string;
  harvestEfficiency: number; // % di piante che hanno prodotto raccolto
  qualityTrend: 'improving' | 'declining' | 'stable';
  seasonalPerformance: Record<string, number>;
}

export class HarvestTrackingService {
  /**
   * Filtra e prepara le colture piantate per il raccolto
   */
  static getAvailableCropsForHarvest(plantedCrops: GardenTask[]): PlantedCrop[] {
    const now = new Date();
    
    return plantedCrops
      .filter(task => {
        // Solo task di semina/trapianto completati
        if (!task.completed || !['Sowing', 'Transplant'].includes(task.taskType)) {
          return false;
        }
        
        // Calcola giorni dalla semina/trapianto
        const plantingDate = new Date(task.date);
        const daysFromPlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Considera pronto per il raccolto se:
        // - È in fase di fruttificazione/raccolta
        // - Sono passati almeno 30 giorni (soglia minima)
        const isReadyToHarvest = task.stage === 'Fruiting' || 
                                task.stage === 'Harvested' || 
                                daysFromPlanting >= 30;
        
        return isReadyToHarvest;
      })
      .map(task => {
        const plantingDate = new Date(task.date);
        const daysFromPlanting = Math.floor((now.getTime() - plantingDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          taskId: task.id,
          plantName: task.plantName,
          variety: task.variety,
          plantingDate: task.date,
          stage: task.stage || 'Unknown',
          quantity: task.quantity || task.currentQuantity,
          locationType: task.locationType || 'Ground',
          zoneId: task.zoneId,
          rowId: task.rowId,
          isReadyToHarvest: task.stage === 'Fruiting' || daysFromPlanting >= 60,
          daysFromPlanting,
          expectedHarvestDate: this.calculateExpectedHarvestDate(task),
          estimatedYield: this.estimateYield(task)
        } as PlantedCrop;
      })
      .sort((a, b) => {
        // Ordina per prontezza al raccolto e poi per giorni dalla semina
        if (a.isReadyToHarvest && !b.isReadyToHarvest) return -1;
        if (!a.isReadyToHarvest && b.isReadyToHarvest) return 1;
        return b.daysFromPlanting - a.daysFromPlanting;
      });
  }

  /**
   * Calcola la data di raccolto stimata basata sul tipo di pianta
   */
  private static calculateExpectedHarvestDate(task: GardenTask): string | undefined {
    const plantingDate = new Date(task.date);
    const plantName = task.plantName.toLowerCase();
    
    // Giorni tipici dalla semina/trapianto al raccolto
    const harvestDays: Record<string, number> = {
      'pomodoro': 80,
      'zucchina': 50,
      'melanzana': 90,
      'peperone': 75,
      'cetriolo': 60,
      'lattuga': 45,
      'spinaci': 40,
      'rucola': 30,
      'basilico': 60,
      'prezzemolo': 70,
      'carota': 70,
      'ravanello': 25,
      'cipolla': 120,
      'aglio': 180,
      'patata': 90,
      'fagiolo': 60,
      'pisello': 70,
      'fava': 90
    };
    
    // Trova il numero di giorni per questa pianta
    const days = Object.entries(harvestDays).find(([plant]) => 
      plantName.includes(plant)
    )?.[1] || 70; // Default 70 giorni
    
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + days);
    
    return harvestDate.toISOString().split('T')[0];
  }

  /**
   * Stima la resa basata sul tipo di pianta e quantità
   */
  private static estimateYield(task: GardenTask): number {
    const plantName = task.plantName.toLowerCase();
    const quantity = task.quantity || task.currentQuantity || 1;
    
    // Resa media per pianta in kg
    const yieldPerPlant: Record<string, number> = {
      'pomodoro': 3.0,
      'zucchina': 2.5,
      'melanzana': 2.0,
      'peperone': 1.5,
      'cetriolo': 2.0,
      'lattuga': 0.3,
      'spinaci': 0.2,
      'rucola': 0.1,
      'basilico': 0.1,
      'prezzemolo': 0.1,
      'carota': 0.2,
      'ravanello': 0.05,
      'cipolla': 0.3,
      'aglio': 0.1,
      'patata': 1.0,
      'fagiolo': 0.5,
      'pisello': 0.3,
      'fava': 0.4
    };
    
    // Trova la resa per questa pianta
    const yieldPer = Object.entries(yieldPerPlant).find(([plant]) => 
      plantName.includes(plant)
    )?.[1] || 0.5; // Default 0.5 kg per pianta
    
    return quantity * yieldPer;
  }

  /**
   * Suggerisce l'unità di misura più appropriata per una pianta
   */
  static getSuggestedUnit(plantName: string): string {
    const lowerName = plantName.toLowerCase();
    
    // Frutti grandi/ortaggi da peso
    if (['pomodoro', 'zucchina', 'melanzana', 'peperone', 'cetriolo', 'zucca'].some(p => lowerName.includes(p))) {
      return 'kg';
    }
    
    // Verdure a foglia/erbe
    if (['lattuga', 'spinaci', 'rucola', 'basilico', 'prezzemolo', 'salvia'].some(p => lowerName.includes(p))) {
      return 'mazzi';
    }
    
    // Radici/tuberi piccoli
    if (['ravanello', 'carota', 'cipolla', 'aglio'].some(p => lowerName.includes(p))) {
      return 'pz';
    }
    
    // Legumi
    if (['fagiolo', 'pisello', 'fava'].some(p => lowerName.includes(p))) {
      return 'kg';
    }
    
    // Default
    return 'kg';
  }

  /**
   * Analizza le performance dei raccolti
   */
  static analyzeHarvestPerformance(
    harvests: HarvestData[], 
    plantedCrops: GardenTask[]
  ): HarvestAnalysis {
    const trackedHarvests = harvests.filter(h => h.is_tracked && h.task_id);
    
    // Calcola totale raccolto
    const totalHarvested = trackedHarvests.reduce((sum, h) => sum + h.quantity, 0);
    
    // Calcola resa media per pianta
    const harvestsByTask = trackedHarvests.reduce((acc, harvest) => {
      if (!harvest.task_id) return acc;
      if (!acc[harvest.task_id]) acc[harvest.task_id] = [];
      acc[harvest.task_id].push(harvest);
      return acc;
    }, {} as Record<string, HarvestData[]>);
    
    let totalYield = 0;
    let totalPlants = 0;
    
    Object.entries(harvestsByTask).forEach(([taskId, taskHarvests]) => {
      const task = plantedCrops.find(t => t.id === taskId);
      if (task) {
        const plantCount = task.quantity || task.currentQuantity || 1;
        const harvestTotal = taskHarvests.reduce((sum, h) => sum + h.quantity, 0);
        totalYield += harvestTotal;
        totalPlants += plantCount;
      }
    });
    
    const averageYield = totalPlants > 0 ? totalYield / totalPlants : 0;
    
    // Analizza performance per varietà
    const varietyPerformance = trackedHarvests.reduce((acc, harvest) => {
      const key = `${harvest.plant_name}${harvest.variety ? ` (${harvest.variety})` : ''}`;
      if (!acc[key]) acc[key] = { total: 0, count: 0 };
      acc[key].total += harvest.quantity;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
    
    const varietyAverages = Object.entries(varietyPerformance).map(([variety, data]) => ({
      variety,
      average: data.total / data.count
    })).sort((a, b) => b.average - a.average);
    
    const bestPerformingVariety = varietyAverages[0]?.variety;
    const worstPerformingVariety = varietyAverages[varietyAverages.length - 1]?.variety;
    
    // Calcola efficienza raccolto (% di task che hanno prodotto raccolto)
    const tasksWithHarvest = new Set(trackedHarvests.map(h => h.task_id)).size;
    const totalCompletedTasks = plantedCrops.filter(t => 
      t.completed && ['Sowing', 'Transplant'].includes(t.taskType)
    ).length;
    const harvestEfficiency = totalCompletedTasks > 0 ? (tasksWithHarvest / totalCompletedTasks) * 100 : 0;
    
    // Analizza trend qualità
    const qualityRatings = trackedHarvests
      .filter(h => h.rating)
      .sort((a, b) => new Date(a.harvest_date).getTime() - new Date(b.harvest_date).getTime())
      .map(h => h.rating!);
    
    let qualityTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (qualityRatings.length >= 3) {
      const firstHalf = qualityRatings.slice(0, Math.floor(qualityRatings.length / 2));
      const secondHalf = qualityRatings.slice(Math.ceil(qualityRatings.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.3) qualityTrend = 'improving';
      else if (secondAvg < firstAvg - 0.3) qualityTrend = 'declining';
    }
    
    // Performance stagionale
    const seasonalPerformance = trackedHarvests.reduce((acc, harvest) => {
      const month = new Date(harvest.harvest_date).getMonth();
      const season = month >= 2 && month <= 4 ? 'Primavera' :
                    month >= 5 && month <= 7 ? 'Estate' :
                    month >= 8 && month <= 10 ? 'Autunno' : 'Inverno';
      
      if (!acc[season]) acc[season] = 0;
      acc[season] += harvest.quantity;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalHarvested,
      averageYield,
      bestPerformingVariety,
      worstPerformingVariety,
      harvestEfficiency,
      qualityTrend,
      seasonalPerformance
    };
  }

  /**
   * Genera suggerimenti per migliorare i raccolti
   */
  static generateHarvestSuggestions(analysis: HarvestAnalysis): string[] {
    const suggestions: string[] = [];
    
    if (analysis.harvestEfficiency < 70) {
      suggestions.push('🌱 Efficienza raccolto bassa. Considera di migliorare la cura delle piante o la qualità del terreno.');
    }
    
    if (analysis.qualityTrend === 'declining') {
      suggestions.push('📉 La qualità dei raccolti sta diminuendo. Verifica nutrizione e irrigazione.');
    }
    
    if (analysis.qualityTrend === 'improving') {
      suggestions.push('📈 Ottimo! La qualità dei raccolti sta migliorando. Continua così!');
    }
    
    if (analysis.bestPerformingVariety) {
      suggestions.push(`🏆 La varietà "${analysis.bestPerformingVariety}" sta dando i migliori risultati.`);
    }
    
    if (analysis.averageYield < 1) {
      suggestions.push('⚡ Resa media bassa. Considera fertilizzazione o varietà più produttive.');
    }
    
    // Suggerimenti stagionali
    const seasons = Object.keys(analysis.seasonalPerformance);
    if (seasons.length > 1) {
      const bestSeason = seasons.reduce((a, b) => 
        analysis.seasonalPerformance[a] > analysis.seasonalPerformance[b] ? a : b
      );
      suggestions.push(`🌞 La stagione migliore per i tuoi raccolti è ${bestSeason}.`);
    }
    
    return suggestions;
  }
}