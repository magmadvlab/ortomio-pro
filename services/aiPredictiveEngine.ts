/**
 * AI Predictive Engine - OrtoMio Brain
 * Sistema di intelligenza artificiale predittiva per dominanza mercato
 */

import { GardenTask, Garden } from '@/types'

// Types for AI Predictions
export interface DiseasePredicition {
  id: string
  plantName: string
  disease: string
  probability: number // 0-1
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  leadTime: number // days
  symptoms: string[]
  preventiveMeasures: string[]
  treatments: string[]
  confidence: number // 0-1
  weatherFactors: WeatherFactor[]
  riskFactors: RiskFactor[]
}

export interface YieldPrediction {
  id: string
  plantName: string
  variety: string
  expectedYield: number // kg/m²
  yieldRange: {
    min: number
    max: number
    confidence: number
  }
  harvestWindow: {
    start: string
    end: string
    optimal: string
  }
  qualityScore: number // 0-100
  factors: YieldFactor[]
  recommendations: string[]
}

export interface ResourceOptimization {
  id: string
  type: 'WATER' | 'FERTILIZER' | 'LABOR' | 'ENERGY'
  currentUsage: number
  optimizedUsage: number
  savings: {
    amount: number
    percentage: number
    cost: number // €
  }
  schedule: OptimizationSchedule[]
  recommendations: string[]
}

interface WeatherFactor {
  factor: string
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  weight: number
  description: string
}

interface RiskFactor {
  factor: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  mitigation: string[]
}

interface YieldFactor {
  factor: string
  impact: number // -1 to 1
  description: string
  controllable: boolean
}

interface OptimizationSchedule {
  date: string
  action: string
  amount: number
  unit: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

// Weather Integration
interface WeatherData {
  temperature: {
    current: number
    min: number
    max: number
    forecast15Days: number[]
  }
  humidity: number
  precipitation: {
    current: number
    forecast15Days: number[]
  }
  windSpeed: number
  pressure: number
  uvIndex: number
  soilTemperature: number
}

// Soil Data Integration
interface SoilData {
  ph: number
  ec: number // electrical conductivity
  moisture: number
  temperature: number
  nutrients: {
    nitrogen: number
    phosphorus: number
    potassium: number
    organicMatter: number
  }
  compaction: number
  lastAnalysis: string
}

// Plant Health Data
interface PlantHealthData {
  plantId: string
  healthScore: number // 0-100
  growthStage: string
  stressIndicators: string[]
  diseases: string[]
  pests: string[]
  nutritionalStatus: {
    nitrogen: 'DEFICIENT' | 'ADEQUATE' | 'EXCESS'
    phosphorus: 'DEFICIENT' | 'ADEQUATE' | 'EXCESS'
    potassium: 'DEFICIENT' | 'ADEQUATE' | 'EXCESS'
  }
  lastUpdate: string
}

class AIPredictiveEngine {
  private diseaseModels: Map<string, any> = new Map()
  private yieldModels: Map<string, any> = new Map()
  private optimizationModels: Map<string, any> = new Map()
  
  // ===== DISEASE PREDICTION =====
  
  async predictDiseases(
    gardenId: string,
    weatherData: WeatherData,
    soilData: SoilData,
    plantHealthData: PlantHealthData[],
    tasks: GardenTask[]
  ): Promise<DiseasePredicition[]> {
    const predictions: DiseasePredicition[] = []
    
    // Analyze each plant for disease risk
    for (const plant of plantHealthData) {
      const plantPredictions = await this.analyzePlantDiseaseRisk(
        plant,
        weatherData,
        soilData,
        tasks
      )
      predictions.push(...plantPredictions)
    }
    
    // Sort by risk level and probability
    return predictions.sort((a, b) => {
      const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      return (severityWeight[b.severity] * b.probability) - (severityWeight[a.severity] * a.probability)
    })
  }
  
  private async analyzePlantDiseaseRisk(
    plant: PlantHealthData,
    weather: WeatherData,
    soil: SoilData,
    tasks: GardenTask[]
  ): Promise<DiseasePredicition[]> {
    const predictions: DiseasePredicition[] = []
    
    // Common disease patterns based on conditions
    const diseaseRules = this.getDiseaseRules(plant.plantId)
    
    for (const rule of diseaseRules) {
      const probability = this.calculateDiseaseProbability(rule, weather, soil, plant)
      
      if (probability > 0.3) { // Only show significant risks
        predictions.push({
          id: `${plant.plantId}_${rule.disease}_${Date.now()}`,
          plantName: this.getPlantName(plant.plantId),
          disease: rule.disease,
          probability,
          severity: this.calculateSeverity(probability, rule.impact),
          leadTime: rule.leadTime,
          symptoms: rule.symptoms,
          preventiveMeasures: rule.preventiveMeasures,
          treatments: rule.treatments,
          confidence: rule.confidence,
          weatherFactors: this.analyzeWeatherFactors(weather, rule),
          riskFactors: this.analyzeRiskFactors(soil, plant, rule)
        })
      }
    }
    
    return predictions
  }
  
  // ===== YIELD PREDICTION =====
  
  async predictYield(
    gardenId: string,
    weatherData: WeatherData,
    soilData: SoilData,
    plantHealthData: PlantHealthData[],
    tasks: GardenTask[]
  ): Promise<YieldPrediction[]> {
    const predictions: YieldPrediction[] = []
    
    // Group plants by type and variety
    const plantGroups = this.groupPlantsByType(plantHealthData)
    
    for (const [plantType, plants] of plantGroups) {
      const yieldPrediction = await this.calculateYieldPrediction(
        plantType,
        plants,
        weatherData,
        soilData,
        tasks
      )
      
      if (yieldPrediction) {
        predictions.push(yieldPrediction)
      }
    }
    
    return predictions
  }
  
  private async calculateYieldPrediction(
    plantType: string,
    plants: PlantHealthData[],
    weather: WeatherData,
    soil: SoilData,
    tasks: GardenTask[]
  ): Promise<YieldPrediction | null> {
    // Base yield for plant type
    const baseYield = this.getBaseYield(plantType)
    if (!baseYield) return null
    
    // Calculate factors affecting yield
    const factors = this.calculateYieldFactors(plantType, plants, weather, soil, tasks)
    
    // Apply factors to base yield
    let adjustedYield = baseYield
    let confidenceScore = 0.8
    
    for (const factor of factors) {
      adjustedYield *= (1 + factor.impact)
      if (!factor.controllable) {
        confidenceScore *= 0.95 // Reduce confidence for uncontrollable factors
      }
    }
    
    // Calculate harvest window
    const harvestWindow = this.calculateHarvestWindow(plantType, weather, plants)
    
    // Quality score based on conditions
    const qualityScore = this.calculateQualityScore(plants, weather, soil, factors)
    
    return {
      id: `yield_${plantType}_${Date.now()}`,
      plantName: plantType,
      variety: this.getVariety(plants[0]),
      expectedYield: Math.round(adjustedYield * 100) / 100,
      yieldRange: {
        min: Math.round(adjustedYield * 0.8 * 100) / 100,
        max: Math.round(adjustedYield * 1.2 * 100) / 100,
        confidence: confidenceScore
      },
      harvestWindow,
      qualityScore,
      factors,
      recommendations: this.generateYieldRecommendations(factors, plants, weather, soil)
    }
  }
  
  // ===== RESOURCE OPTIMIZATION =====
  
  async optimizeResources(
    gardenId: string,
    weatherData: WeatherData,
    soilData: SoilData,
    plantHealthData: PlantHealthData[],
    tasks: GardenTask[]
  ): Promise<ResourceOptimization[]> {
    const optimizations: ResourceOptimization[] = []
    
    // Water optimization
    const waterOpt = await this.optimizeWaterUsage(weatherData, soilData, plantHealthData, tasks)
    if (waterOpt) optimizations.push(waterOpt)
    
    // Fertilizer optimization
    const fertilizerOpt = await this.optimizeFertilizerUsage(soilData, plantHealthData, tasks)
    if (fertilizerOpt) optimizations.push(fertilizerOpt)
    
    // Labor optimization
    const laborOpt = await this.optimizeLaborSchedule(tasks, weatherData, plantHealthData)
    if (laborOpt) optimizations.push(laborOpt)
    
    // Energy optimization
    const energyOpt = await this.optimizeEnergyUsage(weatherData, tasks)
    if (energyOpt) optimizations.push(energyOpt)
    
    return optimizations
  }
  
  private async optimizeWaterUsage(
    weather: WeatherData,
    soil: SoilData,
    plants: PlantHealthData[],
    tasks: GardenTask[]
  ): Promise<ResourceOptimization | null> {
    // Calculate current water usage
    const currentUsage = this.calculateCurrentWaterUsage(tasks)
    
    // Calculate optimal water usage based on:
    // - Soil moisture
    // - Weather forecast
    // - Plant water needs
    // - Evapotranspiration
    
    const et0 = this.calculateEvapotranspiration(weather)
    const plantWaterNeeds = this.calculatePlantWaterNeeds(plants, weather)
    const soilWaterCapacity = this.calculateSoilWaterCapacity(soil)
    
    // Factor in precipitation forecast
    const forecastPrecipitation = weather.precipitation.forecast15Days.reduce((sum, p) => sum + p, 0)
    
    const optimalUsage = Math.max(0, plantWaterNeeds - forecastPrecipitation * 0.8) // 80% efficiency
    
    if (optimalUsage < currentUsage) {
      const savings = currentUsage - optimalUsage
      const costSavings = savings * 0.002 // €0.002 per liter
      
      return {
        id: `water_opt_${Date.now()}`,
        type: 'WATER',
        currentUsage,
        optimizedUsage: optimalUsage,
        savings: {
          amount: savings,
          percentage: (savings / currentUsage) * 100,
          cost: costSavings
        },
        schedule: this.generateWaterSchedule(optimalUsage, weather, plants),
        recommendations: [
          'Riduci irrigazione nei giorni di pioggia prevista',
          'Concentra irrigazione nelle ore mattutine (6-8 AM)',
          'Monitora umidità del suolo prima di irrigare',
          'Usa pacciamatura per ridurre evaporazione'
        ]
      }
    }
    
    return null
  }
  
  // ===== UTILITY METHODS =====
  
  private getDiseaseRules(plantId: string): any[] {
    // Simplified disease rules - in production, this would be ML models
    return [
      {
        disease: 'Peronospora',
        conditions: { humidity: '>80%', temperature: '15-25°C' },
        leadTime: 7,
        impact: 'HIGH',
        confidence: 0.85,
        symptoms: ['Macchie gialle su foglie', 'Muffa bianca sotto foglie'],
        preventiveMeasures: ['Migliorare ventilazione', 'Ridurre umidità'],
        treatments: ['Fungicida rameico', 'Rimozione foglie colpite']
      },
      {
        disease: 'Oidio',
        conditions: { humidity: '60-80%', temperature: '20-30°C' },
        leadTime: 5,
        impact: 'MEDIUM',
        confidence: 0.75,
        symptoms: ['Polvere bianca su foglie', 'Deformazione foglie'],
        preventiveMeasures: ['Evitare irrigazione fogliare', 'Potatura per aerazione'],
        treatments: ['Zolfo bagnabile', 'Bicarbonato di potassio']
      }
    ]
  }
  
  private calculateDiseaseProbability(rule: any, weather: WeatherData, soil: SoilData, plant: PlantHealthData): number {
    let probability = 0.1 // Base probability
    
    // Weather factors
    if (weather.humidity > 80 && rule.disease === 'Peronospora') {
      probability += 0.4
    }
    if (weather.temperature.current >= 15 && weather.temperature.current <= 25 && rule.disease === 'Peronospora') {
      probability += 0.3
    }
    
    // Plant health factors
    if (plant.healthScore < 70) {
      probability += 0.2
    }
    
    // Soil factors
    if (soil.moisture > 80) {
      probability += 0.1
    }
    
    return Math.min(probability, 1.0)
  }
  
  private calculateSeverity(probability: number, impact: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const impactWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
    const score = probability * (impactWeight[impact as keyof typeof impactWeight] || 2)
    
    if (score >= 2.5) return 'CRITICAL'
    if (score >= 2.0) return 'HIGH'
    if (score >= 1.5) return 'MEDIUM'
    return 'LOW'
  }
  
  private analyzeWeatherFactors(weather: WeatherData, rule: any): WeatherFactor[] {
    return [
      {
        factor: 'Umidità',
        impact: weather.humidity > 80 ? 'NEGATIVE' : 'POSITIVE',
        weight: 0.4,
        description: `Umidità attuale: ${weather.humidity}%`
      },
      {
        factor: 'Temperatura',
        impact: weather.temperature.current >= 15 && weather.temperature.current <= 25 ? 'NEGATIVE' : 'POSITIVE',
        weight: 0.3,
        description: `Temperatura: ${weather.temperature.current}°C`
      }
    ]
  }
  
  private analyzeRiskFactors(soil: SoilData, plant: PlantHealthData, rule: any): RiskFactor[] {
    return [
      {
        factor: 'Salute pianta',
        riskLevel: plant.healthScore < 70 ? 'HIGH' : plant.healthScore < 85 ? 'MEDIUM' : 'LOW',
        mitigation: ['Migliorare nutrizione', 'Ridurre stress idrico']
      },
      {
        factor: 'Condizioni suolo',
        riskLevel: soil.moisture > 80 ? 'HIGH' : 'LOW',
        mitigation: ['Migliorare drenaggio', 'Ridurre irrigazione']
      }
    ]
  }
  
  private groupPlantsByType(plants: PlantHealthData[]): Map<string, PlantHealthData[]> {
    const groups = new Map<string, PlantHealthData[]>()
    
    for (const plant of plants) {
      const plantType = this.getPlantName(plant.plantId)
      if (!groups.has(plantType)) {
        groups.set(plantType, [])
      }
      groups.get(plantType)!.push(plant)
    }
    
    return groups
  }
  
  private getBaseYield(plantType: string): number | null {
    // Base yields in kg/m² - simplified data
    const baseYields: Record<string, number> = {
      'Pomodoro': 8.0,
      'Lattuga': 2.5,
      'Carota': 3.0,
      'Zucchina': 6.0,
      'Peperone': 4.0,
      'Melanzana': 5.0,
      'Basilico': 1.5,
      'Prezzemolo': 1.0
    }
    
    return baseYields[plantType] || null
  }
  
  private calculateYieldFactors(
    plantType: string,
    plants: PlantHealthData[],
    weather: WeatherData,
    soil: SoilData,
    tasks: GardenTask[]
  ): YieldFactor[] {
    const factors: YieldFactor[] = []
    
    // Plant health factor
    const avgHealthScore = plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length
    factors.push({
      factor: 'Salute piante',
      impact: (avgHealthScore - 75) / 100, // -0.25 to +0.25
      description: `Punteggio salute medio: ${Math.round(avgHealthScore)}%`,
      controllable: true
    })
    
    // Soil quality factor
    const soilQuality = this.calculateSoilQuality(soil)
    factors.push({
      factor: 'Qualità suolo',
      impact: (soilQuality - 75) / 200, // -0.375 to +0.125
      description: `Qualità suolo: ${Math.round(soilQuality)}%`,
      controllable: true
    })
    
    // Weather factor
    const weatherImpact = this.calculateWeatherImpact(weather, plantType)
    factors.push({
      factor: 'Condizioni meteo',
      impact: weatherImpact,
      description: `Condizioni ${weatherImpact > 0 ? 'favorevoli' : 'sfavorevoli'}`,
      controllable: false
    })
    
    return factors
  }
  
  private calculateHarvestWindow(plantType: string, weather: WeatherData, plants: PlantHealthData[]) {
    // Simplified harvest window calculation
    const now = new Date()
    const harvestDays = this.getHarvestDays(plantType)
    
    const start = new Date(now.getTime() + (harvestDays - 7) * 24 * 60 * 60 * 1000)
    const end = new Date(now.getTime() + (harvestDays + 7) * 24 * 60 * 60 * 1000)
    const optimal = new Date(now.getTime() + harvestDays * 24 * 60 * 60 * 1000)
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      optimal: optimal.toISOString().split('T')[0]
    }
  }
  
  private calculateQualityScore(
    plants: PlantHealthData[],
    weather: WeatherData,
    soil: SoilData,
    factors: YieldFactor[]
  ): number {
    let score = 75 // Base quality score
    
    // Plant health impact
    const avgHealth = plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length
    score += (avgHealth - 75) * 0.3
    
    // Soil quality impact
    const soilQuality = this.calculateSoilQuality(soil)
    score += (soilQuality - 75) * 0.2
    
    // Weather impact
    if (weather.temperature.current >= 18 && weather.temperature.current <= 25) {
      score += 5
    }
    if (weather.humidity >= 60 && weather.humidity <= 70) {
      score += 5
    }
    
    return Math.max(0, Math.min(100, Math.round(score)))
  }
  
  private generateYieldRecommendations(
    factors: YieldFactor[],
    plants: PlantHealthData[],
    weather: WeatherData,
    soil: SoilData
  ): string[] {
    const recommendations: string[] = []
    
    // Analyze factors for recommendations
    for (const factor of factors) {
      if (factor.impact < -0.1 && factor.controllable) {
        if (factor.factor === 'Salute piante') {
          recommendations.push('Migliorare nutrizione delle piante')
          recommendations.push('Monitorare e trattare eventuali malattie')
        }
        if (factor.factor === 'Qualità suolo') {
          recommendations.push('Aggiungere compost o ammendanti organici')
          recommendations.push('Correggere pH del suolo se necessario')
        }
      }
    }
    
    // Weather-based recommendations
    if (weather.temperature.current > 30) {
      recommendations.push('Aumentare ombreggiatura nelle ore più calde')
    }
    if (weather.humidity < 50) {
      recommendations.push('Aumentare irrigazione per compensare bassa umidità')
    }
    
    return recommendations
  }
  
  // Helper methods
  private getPlantName(plantId: string): string {
    // In production, this would query the database
    return 'Pomodoro' // Simplified
  }
  
  private getVariety(plant: PlantHealthData): string {
    return 'San Marzano' // Simplified
  }
  
  private calculateSoilQuality(soil: SoilData): number {
    let score = 50
    
    // pH factor
    if (soil.ph >= 6.0 && soil.ph <= 7.0) score += 20
    else if (soil.ph >= 5.5 && soil.ph <= 7.5) score += 10
    
    // Nutrient factors
    if (soil.nutrients.nitrogen > 20) score += 10
    if (soil.nutrients.phosphorus > 15) score += 10
    if (soil.nutrients.potassium > 150) score += 10
    if (soil.nutrients.organicMatter > 3) score += 15
    
    return Math.max(0, Math.min(100, score))
  }
  
  private calculateWeatherImpact(weather: WeatherData, plantType: string): number {
    let impact = 0
    
    // Temperature impact
    const optimalTemp = this.getOptimalTemperature(plantType)
    const tempDiff = Math.abs(weather.temperature.current - optimalTemp)
    impact -= tempDiff * 0.01
    
    // Humidity impact
    if (weather.humidity >= 60 && weather.humidity <= 70) {
      impact += 0.1
    } else if (weather.humidity < 40 || weather.humidity > 90) {
      impact -= 0.1
    }
    
    return Math.max(-0.3, Math.min(0.3, impact))
  }
  
  private getOptimalTemperature(plantType: string): number {
    const optimalTemps: Record<string, number> = {
      'Pomodoro': 22,
      'Lattuga': 18,
      'Carota': 20,
      'Zucchina': 24,
      'Peperone': 25
    }
    return optimalTemps[plantType] || 22
  }
  
  private getHarvestDays(plantType: string): number {
    const harvestDays: Record<string, number> = {
      'Pomodoro': 80,
      'Lattuga': 45,
      'Carota': 70,
      'Zucchina': 50,
      'Peperone': 90
    }
    return harvestDays[plantType] || 60
  }
  
  private calculateCurrentWaterUsage(tasks: GardenTask[]): number {
    // Calculate from irrigation tasks - simplified
    return 100 // liters per day
  }
  
  private calculateEvapotranspiration(weather: WeatherData): number {
    // Simplified ET0 calculation
    return weather.temperature.current * 0.1 + weather.windSpeed * 0.05
  }
  
  private calculatePlantWaterNeeds(plants: PlantHealthData[], weather: WeatherData): number {
    // Simplified water needs calculation
    return plants.length * 2 * (1 + weather.temperature.current * 0.02)
  }
  
  private calculateSoilWaterCapacity(soil: SoilData): number {
    // Simplified soil water capacity
    return 100 - soil.moisture
  }
  
  private generateWaterSchedule(optimalUsage: number, weather: WeatherData, plants: PlantHealthData[]): OptimizationSchedule[] {
    const schedule: OptimizationSchedule[] = []
    const dailyAmount = optimalUsage / 7 // Weekly distribution
    
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      // Skip days with significant precipitation
      const precipitation = weather.precipitation.forecast15Days[i] || 0
      if (precipitation < 5) { // Less than 5mm
        schedule.push({
          date: date.toISOString().split('T')[0],
          action: 'Irrigazione',
          amount: dailyAmount,
          unit: 'litri',
          priority: 'MEDIUM'
        })
      }
    }
    
    return schedule
  }
  
  private async optimizeFertilizerUsage(
    soil: SoilData,
    plants: PlantHealthData[],
    tasks: GardenTask[]
  ): Promise<ResourceOptimization | null> {
    // Simplified fertilizer optimization
    const currentUsage = 50 // kg/month
    const optimalUsage = this.calculateOptimalFertilizer(soil, plants)
    
    if (optimalUsage < currentUsage) {
      return {
        id: `fertilizer_opt_${Date.now()}`,
        type: 'FERTILIZER',
        currentUsage,
        optimizedUsage: optimalUsage,
        savings: {
          amount: currentUsage - optimalUsage,
          percentage: ((currentUsage - optimalUsage) / currentUsage) * 100,
          cost: (currentUsage - optimalUsage) * 2.5 // €2.5 per kg
        },
        schedule: [],
        recommendations: [
          'Usa fertilizzanti a rilascio controllato',
          'Testa il suolo prima di fertilizzare',
          'Applica fertilizzanti in base alle fasi di crescita'
        ]
      }
    }
    
    return null
  }
  
  private calculateOptimalFertilizer(soil: SoilData, plants: PlantHealthData[]): number {
    let optimal = 30 // Base amount
    
    // Adjust based on soil nutrients
    if (soil.nutrients.nitrogen < 20) optimal += 10
    if (soil.nutrients.phosphorus < 15) optimal += 5
    if (soil.nutrients.potassium < 150) optimal += 8
    
    // Adjust based on plant health
    const avgHealth = plants.reduce((sum, p) => sum + p.healthScore, 0) / plants.length
    if (avgHealth < 70) optimal += 5
    
    return optimal
  }
  
  private async optimizeLaborSchedule(
    tasks: GardenTask[],
    weather: WeatherData,
    plants: PlantHealthData[]
  ): Promise<ResourceOptimization | null> {
    // Simplified labor optimization
    return null // Not implemented in this version
  }
  
  private async optimizeEnergyUsage(
    weather: WeatherData,
    tasks: GardenTask[]
  ): Promise<ResourceOptimization | null> {
    // Simplified energy optimization
    return null // Not implemented in this version
  }
}

export const aiPredictiveEngine = new AIPredictiveEngine()
export default aiPredictiveEngine