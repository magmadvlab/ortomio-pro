// ============================================================================
// VINEYARD BUD LOAD SERVICE - RAVAZ INDEX CALCULATION
// Professional service for bud load management and Ravaz Index
// ============================================================================

import { 
  BudLoadData, 
  RavazIndexCalculation,
  VineyardKPIs 
} from '@/types/vineyard'
import { getSupabaseClient } from '@/config/supabase'

class VineyardBudLoadService {
  private getClientOrThrow() {
    const supabase = getSupabaseClient()
    if (!supabase) {
      throw new Error('Supabase client not configured')
    }
    return supabase
  }

  // ============================================================================
  // RAVAZ INDEX CALCULATION
  // ============================================================================

  /**
   * Calculate Ravaz Index and provide interpretation
   * Ravaz Index = Grape Yield (kg) / Pruning Wood Weight (kg)
   * 
   * Interpretation:
   * < 5: Under-production (too much vegetative growth)
   * 5-10: Optimal balance
   * > 10: Over-production (vine stress, quality issues)
   */
  calculateRavazIndex(grapeYield: number, pruningWoodWeight: number): RavazIndexCalculation {
    if (pruningWoodWeight === 0) {
      return {
        ravazIndex: 0,
        interpretation: 'under-production',
        recommendation: 'Impossibile calcolare: peso legno di potatura = 0',
        color: 'gray',
        icon: '⚠️'
      }
    }

    const ravazIndex = grapeYield / pruningWoodWeight

    if (ravazIndex < 3) {
      return {
        ravazIndex,
        interpretation: 'under-production',
        recommendation: 'Sotto-produzione severa. Aumentare carico gemme del 20-30%. Ridurre vigoria con potatura meno severa.',
        color: 'red',
        icon: '⬇️'
      }
    } else if (ravazIndex < 5) {
      return {
        ravazIndex,
        interpretation: 'under-production',
        recommendation: 'Sotto-produzione. Aumentare carico gemme del 10-15%. Considerare potatura meno severa.',
        color: 'orange',
        icon: '📉'
      }
    } else if (ravazIndex <= 10) {
      return {
        ravazIndex,
        interpretation: 'optimal',
        recommendation: 'Equilibrio ottimale vegeto-produttivo! Mantenere carico gemme attuale.',
        color: 'green',
        icon: '✅'
      }
    } else if (ravazIndex <= 15) {
      return {
        ravazIndex,
        interpretation: 'over-production',
        recommendation: 'Sovra-produzione. Ridurre carico gemme del 10-15%. Rischio qualità compromessa.',
        color: 'yellow',
        icon: '📈'
      }
    } else {
      return {
        ravazIndex,
        interpretation: 'severe-over-production',
        recommendation: 'Sovra-produzione severa! Ridurre carico gemme del 20-30%. Alto rischio stress vite e qualità scarsa.',
        color: 'red',
        icon: '⬆️'
      }
    }
  }

  /**
   * Calculate optimal bud load based on pruning wood weight
   */
  calculateOptimalBudLoad(pruningWoodWeight: number, targetRavazIndex: number = 7): number {
    // Target Ravaz Index of 7 is middle of optimal range (5-10)
    return pruningWoodWeight * targetRavazIndex
  }

  /**
   * Calculate recommended buds per vine
   */
  calculateRecommendedBuds(
    pruningWoodWeight: number,
    averageClusterWeight: number = 0.15, // kg
    targetYieldPerVine: number = 2 // kg
  ): number {
    // Estimate buds needed based on target yield
    // Assuming 70% bud fertility and 1.5 clusters per shoot
    const clustersNeeded = targetYieldPerVine / averageClusterWeight
    const shootsNeeded = clustersNeeded / 1.5
    const budsNeeded = shootsNeeded / 0.7 // Account for 70% fertility
    
    return Math.round(budsNeeded)
  }

  // ============================================================================
  // DATABASE OPERATIONS
  // ============================================================================

  async getBudLoadHistory(vineyardId: string): Promise<BudLoadData[]> {
    try {
      const supabase = this.getClientOrThrow()
      const { data, error } = await supabase
        .from('vineyard_bud_load')
        .select('*')
        .eq('vineyard_id', vineyardId)
        .order('season', { ascending: false })

      if (error) throw error

      return data?.map(this.mapBudLoadFromDatabase) || []
    } catch (error) {
      console.error('Error fetching bud load history:', error)
      return []
    }
  }

  async getLatestBudLoad(vineyardId: string): Promise<BudLoadData | null> {
    try {
      const supabase = this.getClientOrThrow()
      const { data, error } = await supabase
        .from('vineyard_bud_load')
        .select('*')
        .eq('vineyard_id', vineyardId)
        .order('season', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      return data ? this.mapBudLoadFromDatabase(data) : null
    } catch (error) {
      console.error('Error fetching latest bud load:', error)
      return null
    }
  }

  async recordBudLoad(budLoad: Omit<BudLoadData, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudLoadData> {
    try {
      const supabase = this.getClientOrThrow()
      
      // Calculate Ravaz Index if both values are present
      let ravazIndex = budLoad.ravazIndex
      if (budLoad.grapeYield && budLoad.pruningWoodWeight) {
        const calculation = this.calculateRavazIndex(budLoad.grapeYield, budLoad.pruningWoodWeight)
        ravazIndex = calculation.ravazIndex
      }

      const { data, error } = await supabase
        .from('vineyard_bud_load')
        .insert([{
          ...this.mapBudLoadToDatabase(budLoad),
          ravaz_index: ravazIndex
        }])
        .select()
        .single()

      if (error) throw error

      return this.mapBudLoadFromDatabase(data)
    } catch (error) {
      console.error('Error recording bud load:', error)
      throw error
    }
  }

  async updateBudLoad(id: string, updates: Partial<BudLoadData>): Promise<BudLoadData> {
    try {
      const supabase = this.getClientOrThrow()
      
      // Recalculate Ravaz Index if relevant values changed
      const updateData = this.mapBudLoadToDatabase(updates)
      if (updates.grapeYield || updates.pruningWoodWeight) {
        const existing = await supabase
          .from('vineyard_bud_load')
          .select('*')
          .eq('id', id)
          .single()

        if (existing.data) {
          const grapeYield = updates.grapeYield || existing.data.grape_yield
          const pruningWoodWeight = updates.pruningWoodWeight || existing.data.pruning_wood_weight
          
          if (grapeYield && pruningWoodWeight) {
            const calculation = this.calculateRavazIndex(grapeYield, pruningWoodWeight)
            updateData.ravaz_index = calculation.ravazIndex
          }
        }
      }

      const { data, error } = await supabase
        .from('vineyard_bud_load')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapBudLoadFromDatabase(data)
    } catch (error) {
      console.error('Error updating bud load:', error)
      throw error
    }
  }

  async deleteBudLoad(id: string): Promise<void> {
    try {
      const supabase = this.getClientOrThrow()
      const { error } = await supabase
        .from('vineyard_bud_load')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting bud load:', error)
      throw error
    }
  }

  // ============================================================================
  // ANALYTICS AND TRENDS
  // ============================================================================

  async getBudLoadTrend(vineyardId: string): Promise<{
    seasons: string[]
    ravazIndices: number[]
    yields: number[]
    pruningWeights: number[]
    trend: 'improving' | 'stable' | 'declining'
    averageRavazIndex: number
  }> {
    try {
      const history = await this.getBudLoadHistory(vineyardId)
      
      if (history.length === 0) {
        return {
          seasons: [],
          ravazIndices: [],
          yields: [],
          pruningWeights: [],
          trend: 'stable',
          averageRavazIndex: 0
        }
      }

      const seasons = history.map(h => h.season)
      const ravazIndices = history.map(h => h.ravazIndex || 0)
      const yields = history.map(h => h.grapeYield)
      const pruningWeights = history.map(h => h.pruningWoodWeight)

      // Calculate trend
      let trend: 'improving' | 'stable' | 'declining' = 'stable'
      if (ravazIndices.length >= 2) {
        const recent = ravazIndices.slice(0, 2)
        const optimalRange = [5, 10]
        
        const recentDistance = Math.abs(recent[0] - 7.5) // Distance from optimal center
        const previousDistance = Math.abs(recent[1] - 7.5)
        
        if (recentDistance < previousDistance - 0.5) {
          trend = 'improving'
        } else if (recentDistance > previousDistance + 0.5) {
          trend = 'declining'
        }
      }

      const averageRavazIndex = ravazIndices.reduce((sum, val) => sum + val, 0) / ravazIndices.length

      return {
        seasons,
        ravazIndices,
        yields,
        pruningWeights,
        trend,
        averageRavazIndex
      }
    } catch (error) {
      console.error('Error calculating bud load trend:', error)
      return {
        seasons: [],
        ravazIndices: [],
        yields: [],
        pruningWeights: [],
        trend: 'stable',
        averageRavazIndex: 0
      }
    }
  }

  // ============================================================================
  // DATABASE MAPPING
  // ============================================================================

  private mapBudLoadFromDatabase(data: any): BudLoadData {
    return {
      id: data.id,
      vineyardId: data.vineyard_id,
      season: data.season,
      pruningDate: data.pruning_date,
      pruningWoodWeight: data.pruning_wood_weight,
      harvestDate: data.harvest_date,
      grapeYield: data.grape_yield,
      ravazIndex: data.ravaz_index,
      budsPerVine: data.buds_per_vine,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapBudLoadToDatabase(budLoad: Partial<BudLoadData>): any {
    return {
      vineyard_id: budLoad.vineyardId,
      season: budLoad.season,
      pruning_date: budLoad.pruningDate,
      pruning_wood_weight: budLoad.pruningWoodWeight,
      harvest_date: budLoad.harvestDate,
      grape_yield: budLoad.grapeYield,
      ravaz_index: budLoad.ravazIndex,
      buds_per_vine: budLoad.budsPerVine,
      notes: budLoad.notes
    }
  }
}

export const vineyardBudLoadService = new VineyardBudLoadService()
