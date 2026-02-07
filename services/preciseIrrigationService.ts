/**
 * Precise Irrigation Service
 * Calcola la distribuzione dell'acqua per singola pianta basandosi su geometria e bulbo bagnato
 */

export interface DripperConfig {
  flowRateLph: number;      // Litri/ora del gocciolatore
  spacingCm: number;        // Distanza tra gocciolatori (cm)
  offsetCm?: number;        // Offset del primo gocciolatore (cm)
  wettingRadiusCm?: number; // Raggio di bagnatura (cm) - default 30cm
}

export interface PlantPosition {
  id: string;
  distanceFromStartCm: number; // Distanza dall'inizio del filare (cm)
}

export interface WaterDistributionResult {
  plantId: string;
  litersReceived: number;
  coveragePercent: number; // % di copertura (0-100) - quanto la pianta è "centrata" nel bulbo
  efficiency: number;      // Efficienza di irrigazione (0-1) - basata sulla distanza
  sourceDrippers: number;  // Numero di gocciolatori che contribuiscono
}

export class PreciseIrrigationService {
  /**
   * Calcola l'acqua ricevuta da ogni pianta in un'irrigazione
   */
  calculateWatering(
    rowLengthCm: number,
    dripperConfig: DripperConfig,
    plants: PlantPosition[],
    durationMinutes: number
  ): WaterDistributionResult[] {
    const results: WaterDistributionResult[] = [];
    const wettingRadius = dripperConfig.wettingRadiusCm || 30; // 30cm default radius
    const offset = dripperConfig.offsetCm || 0;
    
    // 1. Genera posizioni virtuali dei gocciolatori
    const drippers: number[] = [];
    for (let pos = offset; pos <= rowLengthCm; pos += dripperConfig.spacingCm) {
      drippers.push(pos);
    }
    
    // 2. Per ogni pianta, calcola l'acqua ricevuta dai gocciolatori vicini
    plants.forEach(plant => {
      let totalLiters = 0;
      let maxEfficiency = 0;
      let contributingDrippers = 0;
      
      drippers.forEach(dripperPos => {
        const distance = Math.abs(plant.distanceFromStartCm - dripperPos);
        
        // Se la pianta è dentro il raggio di bagnatura del gocciolatore
        if (distance <= wettingRadius) {
          // Modello di distribuzione: Lineare (100% al centro, 0% al bordo)
          // Potrebbe essere migliorato con gaussiana o modelli specifici per tipo di suolo
          const efficiency = 1 - (distance / wettingRadius);
          
          // Acqua erogata da questo gocciolatore in questo intervallo di tempo
          const dripperOutputLiters = (dripperConfig.flowRateLph / 60) * durationMinutes;
          
          // Acqua effettivamente raggiungente la zona radilace (stimata)
          const receivedFromDripper = dripperOutputLiters * efficiency;
          
          totalLiters += receivedFromDripper;
          maxEfficiency = Math.max(maxEfficiency, efficiency);
          contributingDrippers++;
        }
      });
      
      results.push({
        plantId: plant.id,
        litersReceived: Math.round(totalLiters * 100) / 100,
        coveragePercent: Math.round(maxEfficiency * 100),
        efficiency: Math.round(maxEfficiency * 100) / 100,
        sourceDrippers: contributingDrippers
      });
    });
    
    return results;
  }
  
  /**
   * Suggerisce la configurazione ottimale dei gocciolatori per le piante date
   */
  optimizeDripperSpacing(
    plants: PlantPosition[],
    availableSpacings: number[] = [20, 30, 40, 50, 60]
  ): { bestSpacing: number; score: number } {
    let bestSpacing = availableSpacings[0];
    let bestScore = -1;
    
    availableSpacings.forEach(spacing => {
      // Simula efficienza media con questo passo
      const config: DripperConfig = {
        flowRateLph: 2.0, // Valore dummy per il calcolo geometrico
        spacingCm: spacing,
        wettingRadiusCm: 30
      };
      
      // Calcolo su una durata fittizia di 60 min
      // Usiamo una lunghezza sufficiente a coprire l'ultima pianta
      const maxDist = Math.max(...plants.map(p => p.distanceFromStartCm)) + 100;
      const results = this.calculateWatering(maxDist, config, plants, 60);
      
      // Score basato sull'efficienza media (vogliamo che le piante siano vicine ai gocciolatori)
      const avgEfficiency = results.reduce((sum, r) => sum + r.efficiency, 0) / results.length;
      
      if (avgEfficiency > bestScore) {
        bestScore = avgEfficiency;
        bestSpacing = spacing;
      }
    });
    
    return { bestSpacing, score: bestScore };
  }
}

export const preciseIrrigationService = new PreciseIrrigationService();
