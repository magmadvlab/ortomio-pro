/**
 * Irrigation Calculator Service
 * Calcola automaticamente volumi e durate per sistemi di irrigazione manuali
 * basandosi su parametri fisici dell'impianto
 */

export interface ManualIrrigationSystem {
  type: 'drip' | 'sprinkler' | 'hose' | 'furrow'
  
  // Parametri comuni
  pressureBar?: number
  
  // Parametri per goccia
  dripperFlowRateLph?: number // Litri per ora per gocciolatore
  dripperCount?: number // Numero gocciolatori
  dripperSpacingCm?: number // Distanza tra gocciolatori
  rowLengthM?: number // Lunghezza filare
  
  // Parametri per sprinkler
  sprinklerFlowRateLph?: number // Portata per ugello
  sprinklerCount?: number // Numero ugelli
  sprinklerEfficiency?: number // Efficienza (default 75%)
  
  // Parametri per tubo/manichetta
  hoseDiameterMm?: number // Diametro interno tubo
  hoseFlowRateLpm?: number // Portata misurata (litri per minuto)
  
  // Parametri per solco
  furrowLengthM?: number // Lunghezza solco
  furrowWidthCm?: number // Larghezza solco
  furrowDepthCm?: number // Profondità solco
  infiltrationRateMmh?: number // Velocità infiltrazione (mm/h)
}

export interface IrrigationCalculation {
  estimatedFlowRateLph: number // Portata stimata (L/h)
  durationMinutes: number // Durata per raggiungere volume target
  volumeLiters: number // Volume effettivo che verrà erogato
  method: string // Metodo di calcolo usato
  confidence: 'high' | 'medium' | 'low' // Affidabilità stima
  notes: string[] // Note e avvisi
}

class IrrigationCalculatorService {
  /**
   * Calcola durata e volume per sistema a goccia
   */
  calculateDripSystem(
    system: ManualIrrigationSystem,
    targetVolumeLiters: number
  ): IrrigationCalculation {
    const notes: string[] = []
    
    // Metodo 1: Portata per gocciolatore × numero gocciolatori
    if (system.dripperFlowRateLph && system.dripperCount) {
      const totalFlowRateLph = system.dripperFlowRateLph * system.dripperCount
      const durationMinutes = Math.ceil((targetVolumeLiters / totalFlowRateLph) * 60)
      
      return {
        estimatedFlowRateLph: totalFlowRateLph,
        durationMinutes,
        volumeLiters: targetVolumeLiters,
        method: 'Goccia: portata × numero gocciolatori',
        confidence: 'high',
        notes: [
          `${system.dripperCount} gocciolatori × ${system.dripperFlowRateLph} L/h`,
          `Portata totale: ${totalFlowRateLph.toFixed(1)} L/h`
        ]
      }
    }
    
    // Metodo 2: Calcolo da passo gocciolatori e lunghezza filare
    if (system.dripperSpacingCm && system.dripperFlowRateLph && system.rowLengthM) {
      const spacingM = system.dripperSpacingCm / 100
      const drippersCount = Math.floor(system.rowLengthM / spacingM)
      const totalFlowRateLph = system.dripperFlowRateLph * drippersCount
      const durationMinutes = Math.ceil((targetVolumeLiters / totalFlowRateLph) * 60)
      
      notes.push(`Calcolati ${drippersCount} gocciolatori su ${system.rowLengthM}m`)
      notes.push(`Passo: ${system.dripperSpacingCm}cm`)
      
      return {
        estimatedFlowRateLph: totalFlowRateLph,
        durationMinutes,
        volumeLiters: targetVolumeLiters,
        method: 'Goccia: calcolo da passo e lunghezza',
        confidence: 'high',
        notes
      }
    }
    
    // Fallback: stima generica
    notes.push('⚠️ Parametri incompleti, usando stima generica')
    notes.push('Configura portata gocciolatori per calcolo preciso')
    
    return {
      estimatedFlowRateLph: 20, // Stima conservativa
      durationMinutes: Math.ceil((targetVolumeLiters / 20) * 60),
      volumeLiters: targetVolumeLiters,
      method: 'Goccia: stima generica',
      confidence: 'low',
      notes
    }
  }

  /**
   * Calcola durata e volume per sistema sprinkler
   */
  calculateSprinklerSystem(
    system: ManualIrrigationSystem,
    targetVolumeLiters: number
  ): IrrigationCalculation {
    const notes: string[] = []
    const efficiency = system.sprinklerEfficiency || 75 // Default 75%
    
    if (system.sprinklerFlowRateLph && system.sprinklerCount) {
      const totalFlowRateLph = system.sprinklerFlowRateLph * system.sprinklerCount
      const effectiveFlowRateLph = totalFlowRateLph * (efficiency / 100)
      const durationMinutes = Math.ceil((targetVolumeLiters / effectiveFlowRateLph) * 60)
      
      notes.push(`${system.sprinklerCount} ugelli × ${system.sprinklerFlowRateLph} L/h`)
      notes.push(`Efficienza: ${efficiency}%`)
      notes.push(`Portata effettiva: ${effectiveFlowRateLph.toFixed(1)} L/h`)
      
      return {
        estimatedFlowRateLph: effectiveFlowRateLph,
        durationMinutes,
        volumeLiters: targetVolumeLiters,
        method: 'Sprinkler: portata × ugelli × efficienza',
        confidence: 'high',
        notes
      }
    }
    
    // Fallback
    notes.push('⚠️ Parametri incompleti, usando stima generica')
    notes.push('Configura portata ugelli per calcolo preciso')
    
    const estimatedFlowLph = 50 * (efficiency / 100) // Stima conservativa
    
    return {
      estimatedFlowRateLph: estimatedFlowLph,
      durationMinutes: Math.ceil((targetVolumeLiters / estimatedFlowLph) * 60),
      volumeLiters: targetVolumeLiters,
      method: 'Sprinkler: stima generica',
      confidence: 'low',
      notes
    }
  }

  /**
   * Calcola durata e volume per tubo/manichetta
   * Usa formula di Torricelli se disponibile pressione e diametro
   */
  calculateHoseSystem(
    system: ManualIrrigationSystem,
    targetVolumeLiters: number
  ): IrrigationCalculation {
    const notes: string[] = []
    
    // Metodo 1: Portata misurata (più affidabile)
    if (system.hoseFlowRateLpm) {
      const flowRateLph = system.hoseFlowRateLpm * 60
      const durationMinutes = Math.ceil(targetVolumeLiters / system.hoseFlowRateLpm)
      
      notes.push(`Portata misurata: ${system.hoseFlowRateLpm} L/min`)
      notes.push('💡 Misura effettuata con cronometro e secchio')
      
      return {
        estimatedFlowRateLph: flowRateLph,
        durationMinutes,
        volumeLiters: targetVolumeLiters,
        method: 'Tubo: portata misurata',
        confidence: 'high',
        notes
      }
    }
    
    // Metodo 2: Calcolo da diametro e pressione (Torricelli semplificato)
    if (system.hoseDiameterMm && system.pressureBar) {
      // Formula semplificata: Q = A × v
      // v ≈ √(2 × g × h) dove h = pressione in metri d'acqua
      // 1 bar ≈ 10 metri d'acqua
      const diameterM = system.hoseDiameterMm / 1000
      const areaM2 = Math.PI * Math.pow(diameterM / 2, 2)
      const heightM = system.pressureBar * 10
      const velocityMs = Math.sqrt(2 * 9.81 * heightM) * 0.6 // Coefficiente di efflusso ~0.6
      const flowRateM3s = areaM2 * velocityMs
      const flowRateLph = flowRateM3s * 1000 * 3600 // Converti in L/h
      const flowRateLpm = flowRateLph / 60
      const durationMinutes = Math.ceil(targetVolumeLiters / flowRateLpm)
      
      notes.push(`Diametro: ${system.hoseDiameterMm}mm, Pressione: ${system.pressureBar} bar`)
      notes.push(`Portata calcolata: ${flowRateLpm.toFixed(1)} L/min`)
      notes.push('⚠️ Stima teorica, misura reale può variare')
      
      return {
        estimatedFlowRateLph: flowRateLph,
        durationMinutes,
        volumeLiters: targetVolumeLiters,
        method: 'Tubo: calcolo da diametro e pressione',
        confidence: 'medium',
        notes
      }
    }
    
    // Fallback: stima generica basata su diametro comune
    const estimatedFlowLpm = system.hoseDiameterMm 
      ? (system.hoseDiameterMm / 10) * 2 // Stima: ~2 L/min per cm di diametro
      : 15 // Default per tubo standard
    
    notes.push('⚠️ Parametri incompleti, usando stima generica')
    notes.push('💡 Misura la portata: riempi un secchio da 10L e cronometra')
    
    return {
      estimatedFlowRateLph: estimatedFlowLpm * 60,
      durationMinutes: Math.ceil(targetVolumeLiters / estimatedFlowLpm),
      volumeLiters: targetVolumeLiters,
      method: 'Tubo: stima generica',
      confidence: 'low',
      notes
    }
  }

  /**
   * Calcola durata e volume per irrigazione a solco
   */
  calculateFurrowSystem(
    system: ManualIrrigationSystem,
    targetVolumeLiters: number
  ): IrrigationCalculation {
    const notes: string[] = []
    
    if (system.furrowLengthM && system.furrowWidthCm && system.infiltrationRateMmh) {
      // Calcola volume necessario per bagnare il solco
      const widthM = system.furrowWidthCm / 100
      const areaM2 = system.furrowLengthM * widthM
      
      // Volume per raggiungere profondità desiderata (es. 50mm)
      const targetDepthMm = 50 // Profondità standard
      const volumeNeededLiters = areaM2 * targetDepthMm
      
      // Tempo necessario considerando infiltrazione
      const infiltrationRateMms = system.infiltrationRateMmh / 3600
      const durationMinutes = Math.ceil((targetDepthMm / infiltrationRateMms) / 60)
      
      notes.push(`Solco: ${system.furrowLengthM}m × ${system.furrowWidthCm}cm`)
      notes.push(`Infiltrazione: ${system.infiltrationRateMmh} mm/h`)
      notes.push(`Volume stimato: ${volumeNeededLiters.toFixed(0)} L`)
      
      return {
        estimatedFlowRateLph: (volumeNeededLiters / durationMinutes) * 60,
        durationMinutes,
        volumeLiters: Math.max(targetVolumeLiters, volumeNeededLiters),
        method: 'Solco: calcolo da dimensioni e infiltrazione',
        confidence: 'medium',
        notes
      }
    }
    
    // Fallback
    notes.push('⚠️ Parametri incompleti, usando stima generica')
    notes.push('Configura dimensioni solco per calcolo preciso')
    
    return {
      estimatedFlowRateLph: 100, // Stima generica
      durationMinutes: Math.ceil((targetVolumeLiters / 100) * 60),
      volumeLiters: targetVolumeLiters,
      method: 'Solco: stima generica',
      confidence: 'low',
      notes
    }
  }

  /**
   * Calcola automaticamente durata e volume basandosi sul tipo di sistema
   */
  calculate(
    system: ManualIrrigationSystem,
    targetVolumeLiters: number
  ): IrrigationCalculation {
    switch (system.type) {
      case 'drip':
        return this.calculateDripSystem(system, targetVolumeLiters)
      
      case 'sprinkler':
        return this.calculateSprinklerSystem(system, targetVolumeLiters)
      
      case 'hose':
        return this.calculateHoseSystem(system, targetVolumeLiters)
      
      case 'furrow':
        return this.calculateFurrowSystem(system, targetVolumeLiters)
      
      default:
        return {
          estimatedFlowRateLph: 30,
          durationMinutes: Math.ceil((targetVolumeLiters / 30) * 60),
          volumeLiters: targetVolumeLiters,
          method: 'Stima generica',
          confidence: 'low',
          notes: ['Sistema non riconosciuto, usando valori predefiniti']
        }
    }
  }

  /**
   * Calcola volume da durata e portata
   */
  calculateVolumeFromDuration(
    flowRateLph: number,
    durationMinutes: number
  ): number {
    return (flowRateLph / 60) * durationMinutes
  }

  /**
   * Calcola durata da volume e portata
   */
  calculateDurationFromVolume(
    flowRateLph: number,
    volumeLiters: number
  ): number {
    if (flowRateLph <= 0) return 0
    return Math.ceil((volumeLiters / flowRateLph) * 60)
  }

  /**
   * Suggerisce parametri mancanti basandosi su valori tipici
   */
  suggestMissingParameters(system: Partial<ManualIrrigationSystem>): string[] {
    const suggestions: string[] = []
    
    if (system.type === 'drip') {
      if (!system.dripperFlowRateLph) {
        suggestions.push('Portata gocciolatore tipica: 2-4 L/h')
      }
      if (!system.dripperSpacingCm) {
        suggestions.push('Passo gocciolatori tipico: 30-50 cm')
      }
    }
    
    if (system.type === 'sprinkler') {
      if (!system.sprinklerFlowRateLph) {
        suggestions.push('Portata ugello tipica: 50-200 L/h')
      }
      if (!system.sprinklerEfficiency) {
        suggestions.push('Efficienza sprinkler tipica: 70-80%')
      }
    }
    
    if (system.type === 'hose') {
      if (!system.hoseFlowRateLpm && !system.hoseDiameterMm) {
        suggestions.push('Misura la portata: riempi un secchio da 10L e cronometra')
        suggestions.push('Diametro tubo comune: 12-19mm (1/2" - 3/4")')
      }
      if (!system.pressureBar) {
        suggestions.push('Pressione acquedotto tipica: 2-4 bar')
      }
    }
    
    if (system.type === 'furrow') {
      if (!system.infiltrationRateMmh) {
        suggestions.push('Velocità infiltrazione tipica: 10-30 mm/h (dipende dal terreno)')
      }
    }
    
    return suggestions
  }
}

export const irrigationCalculatorService = new IrrigationCalculatorService()
