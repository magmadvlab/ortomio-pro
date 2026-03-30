import { 
  FertilizerProduct,
  TreatmentProduct,
  NutritionTreatment,
  NutritionSchedule,
  ProductInventory,
  StockMovement,
  TreatmentHistory,
  NutritionAnalytics,
  NutritionDashboardData,
  NutritionFilters,
  DateRange,
  ComplianceRecord,
  ProductCompatibility,
  NutritionAdaptiveThresholds,
  EffectivenessAlert
} from '@/types/nutrition'
import { getSupabaseClient } from '@/config/supabase'
import { getDefaultStorageProvider } from '@/packages/core/storage/factory'
import {
  buildAgronomicNutritionLearningAdjustment,
  buildAgronomicQualityLearningAdjustment,
  getAgronomicProfileLearningSnapshots,
  type AgronomicNutritionLearningAdjustment,
  type AgronomicQualityLearningAdjustment,
} from '@/services/agronomicProfileLearningService'

const roundMetric = (value: number, digits: number = 1) =>
  Number(value.toFixed(digits))

const toEffectivenessPercent = (value?: number | null): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return roundMetric(value <= 10 ? value * 10 : value)
}

const average = (values: number[]): number =>
  values.length > 0
    ? roundMetric(values.reduce((sum, value) => sum + value, 0) / values.length)
    : 0

class AdvancedNutritionService {
  // ============================================================================
  // FERTILIZER PRODUCTS MANAGEMENT
  // ============================================================================

  async getFertilizerProducts(gardenId: string, filters?: NutritionFilters): Promise<FertilizerProduct[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('fertilizer_products')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters?.organicOnly) {
        query = query.eq('organic_approved', true)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(this.mapFertilizerFromDatabase) || []
    } catch (error) {
      console.error('Error fetching fertilizer products:', error)
      return []
    }
  }

  async createFertilizerProduct(product: Omit<FertilizerProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<FertilizerProduct> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('fertilizer_products')
        .insert([this.mapFertilizerToDatabase(product)])
        .select()
        .single()

      if (error) throw error

      return this.mapFertilizerFromDatabase(data)
    } catch (error) {
      console.error('Error creating fertilizer product:', error)
      throw error
    }
  }

  async updateFertilizerProduct(id: string, updates: Partial<FertilizerProduct>): Promise<FertilizerProduct> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('fertilizer_products')
        .update(this.mapFertilizerToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapFertilizerFromDatabase(data)
    } catch (error) {
      console.error('Error updating fertilizer product:', error)
      throw error
    }
  }

  async deleteFertilizerProduct(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('fertilizer_products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting fertilizer product:', error)
      throw error
    }
  }

  // ============================================================================
  // TREATMENT PRODUCTS MANAGEMENT
  // ============================================================================

  async getTreatmentProducts(gardenId: string, filters?: NutritionFilters): Promise<TreatmentProduct[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('treatment_products')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters?.organicOnly) {
        query = query.eq('organic_approved', true)
      }

      if (filters?.treatmentTypes && filters.treatmentTypes.length > 0) {
        query = query.in('treatment_type', filters.treatmentTypes)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(this.mapTreatmentProductFromDatabase) || []
    } catch (error) {
      console.error('Error fetching treatment products:', error)
      return []
    }
  }

  async createTreatmentProduct(product: Omit<TreatmentProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentProduct> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('treatment_products')
        .insert([this.mapTreatmentProductToDatabase(product)])
        .select()
        .single()

      if (error) throw error

      return this.mapTreatmentProductFromDatabase(data)
    } catch (error) {
      console.error('Error creating treatment product:', error)
      throw error
    }
  }

  async updateTreatmentProduct(id: string, updates: Partial<TreatmentProduct>): Promise<TreatmentProduct> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('treatment_products')
        .update(this.mapTreatmentProductToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapTreatmentProductFromDatabase(data)
    } catch (error) {
      console.error('Error updating treatment product:', error)
      throw error
    }
  }

  async deleteTreatmentProduct(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('treatment_products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting treatment product:', error)
      throw error
    }
  }

  // ============================================================================
  // NUTRITION TREATMENTS MANAGEMENT
  // ============================================================================

  async getNutritionTreatments(gardenId: string, filters?: NutritionFilters): Promise<NutritionTreatment[]> {
    try {
      const supabase = getSupabaseClient()
      let query = supabase
        .from('nutrition_treatments')
        .select('*')
        .eq('garden_id', gardenId)
        .order('scheduled_date', { ascending: false })

      if (filters?.dateRange) {
        query = query
          .gte('scheduled_date', filters.dateRange.startDate)
          .lte('scheduled_date', filters.dateRange.endDate)
      }

      if (filters?.treatmentTypes && filters.treatmentTypes.length > 0) {
        query = query.in('treatment_type', filters.treatmentTypes)
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters?.zoneIds && filters.zoneIds.length > 0) {
        query = query.in('zone_id', filters.zoneIds)
      }

      if (filters?.organicOnly) {
        query = query.eq('organic_compliant', true)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.map(this.mapTreatmentFromDatabase) || []
    } catch (error) {
      console.error('Error fetching nutrition treatments:', error)
      return []
    }
  }

  async createNutritionTreatment(treatment: Omit<NutritionTreatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<NutritionTreatment> {
    try {
      const supabase = getSupabaseClient()
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser()
      
      const treatmentData = {
        ...this.mapTreatmentToDatabase(treatment),
        operator_id: user?.id
      }

      const { data, error } = await supabase
        .from('nutrition_treatments')
        .insert([treatmentData])
        .select()
        .single()

      if (error) throw error

      // Update inventory if product is used
      if (treatment.status === 'completed' && treatment.productId) {
        await this.updateInventoryAfterTreatment(treatment.productId, treatment.dosage, treatment.gardenId)
      }

      return this.mapTreatmentFromDatabase(data)
    } catch (error) {
      console.error('Error creating nutrition treatment:', error)
      throw error
    }
  }

  async updateNutritionTreatment(id: string, updates: Partial<NutritionTreatment>): Promise<NutritionTreatment> {
    try {
      const supabase = getSupabaseClient()
      
      // Get original treatment for inventory management
      const { data: originalTreatment } = await supabase
        .from('nutrition_treatments')
        .select('*')
        .eq('id', id)
        .single()

      const { data, error } = await supabase
        .from('nutrition_treatments')
        .update(this.mapTreatmentToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update inventory if treatment is completed
      if (updates.status === 'completed' && originalTreatment?.status !== 'completed' && updates.productId) {
        await this.updateInventoryAfterTreatment(updates.productId, updates.dosage || 0, originalTreatment.garden_id)
      }

      return this.mapTreatmentFromDatabase(data)
    } catch (error) {
      console.error('Error updating nutrition treatment:', error)
      throw error
    }
  }

  async deleteTreatment(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('nutrition_treatments')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting treatment:', error)
      throw error
    }
  }

  // ============================================================================
  // NUTRITION SCHEDULES MANAGEMENT
  // ============================================================================

  async getNutritionSchedules(gardenId: string): Promise<NutritionSchedule[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('nutrition_schedules')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('next_execution_date', { ascending: true })

      if (error) throw error

      return data?.map(this.mapScheduleFromDatabase) || []
    } catch (error) {
      console.error('Error fetching nutrition schedules:', error)
      return []
    }
  }

  async createNutritionSchedule(schedule: Omit<NutritionSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<NutritionSchedule> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('nutrition_schedules')
        .insert([this.mapScheduleToDatabase(schedule)])
        .select()
        .single()

      if (error) throw error

      return this.mapScheduleFromDatabase(data)
    } catch (error) {
      console.error('Error creating nutrition schedule:', error)
      throw error
    }
  }

  async updateNutritionSchedule(id: string, updates: Partial<NutritionSchedule>): Promise<NutritionSchedule> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('nutrition_schedules')
        .update(this.mapScheduleToDatabase(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapScheduleFromDatabase(data)
    } catch (error) {
      console.error('Error updating nutrition schedule:', error)
      throw error
    }
  }

  async deleteNutritionSchedule(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('nutrition_schedules')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting nutrition schedule:', error)
      throw error
    }
  }

  // ============================================================================
  // INVENTORY MANAGEMENT
  // ============================================================================

  async getProductInventory(gardenId: string): Promise<ProductInventory[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('garden_id', gardenId)
        .order('product_name', { ascending: true })

      if (error) throw error

      return data?.map(this.mapInventoryFromDatabase) || []
    } catch (error) {
      console.error('Error fetching product inventory:', error)
      return []
    }
  }

  async getLowStockProducts(gardenId: string): Promise<ProductInventory[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .rpc('get_low_stock_products', { garden_id_param: gardenId })

      if (error) throw error

      return data?.map(this.mapInventoryFromDatabase) || []
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      return []
    }
  }

  async updateProductStock(productId: string, quantity: number, movementType: 'purchase' | 'usage' | 'waste' | 'adjustment', notes?: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get current inventory
      const { data: inventory } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', productId)
        .single()

      if (!inventory) throw new Error('Product not found in inventory')

      // Calculate new stock
      let newStock = inventory.current_stock
      if (movementType === 'purchase' || movementType === 'adjustment') {
        newStock += quantity
      } else {
        newStock -= quantity
      }

      // Update inventory
      await supabase
        .from('product_inventory')
        .update({ current_stock: Math.max(0, newStock) })
        .eq('product_id', productId)

      // Record stock movement
      await supabase
        .from('stock_movements')
        .insert([{
          product_id: productId,
          garden_id: inventory.garden_id,
          movement_type: movementType,
          quantity: quantity,
          unit: inventory.stock_unit,
          date: new Date().toISOString().split('T')[0],
          notes: notes,
          operator_id: user?.id
        }])

    } catch (error) {
      console.error('Error updating product stock:', error)
      throw error
    }
  }

  async getStockMovements(gardenId: string): Promise<StockMovement[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('garden_id', gardenId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((movement) => ({
        id: movement.id,
        productId: movement.product_id,
        movementType: movement.movement_type,
        quantity: movement.quantity,
        unit: movement.unit,
        date: movement.date,
        reference: movement.reference,
        notes: movement.notes,
        operatorId: movement.operator_id,
        createdAt: movement.created_at
      }))
    } catch (error) {
      console.error('Error fetching stock movements:', error)
      return []
    }
  }

  private async updateInventoryAfterTreatment(productId: string, dosageUsed: number, gardenId: string): Promise<void> {
    try {
      // Convert dosage to stock units and update inventory
      await this.updateProductStock(productId, dosageUsed, 'usage', 'Used in treatment')
    } catch (error) {
      console.error('Error updating inventory after treatment:', error)
      // Don't throw error to avoid breaking treatment creation
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  async getNutritionAnalytics(gardenId: string, period: string): Promise<NutritionAnalytics> {
    try {
      const supabase = getSupabaseClient()
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      // Get treatments for the period
      const { data: treatments, error } = await supabase
        .from('nutrition_treatments')
        .select('*')
        .eq('garden_id', gardenId)
        .gte('actual_application_date', startDate.toISOString().split('T')[0])
        .lte('actual_application_date', endDate.toISOString().split('T')[0])
        .eq('status', 'completed')

      if (error) throw error

      const treatmentList = treatments || []
      const { nutritionAdjustment, qualityAdjustment, adaptiveThresholds } =
        await this.getAdaptiveLearningAdjustments(gardenId)
      const effectivenessValues = treatmentList
        .map((treatment) => toEffectivenessPercent(treatment.effectiveness))
        .filter((value) => value > 0)

      // Calculate analytics
      const totalTreatments = treatmentList.length
      const totalCost = treatmentList.reduce((sum, t) => sum + (t.total_cost || 0), 0)
      const averageEffectiveness = average(effectivenessValues)

      // Calculate organic percentage
      const organicTreatments = treatmentList.filter(t => t.organic_compliant).length
      const organicPercentage = totalTreatments > 0 ? (organicTreatments / totalTreatments) * 100 : 0

      // Group by treatment type
      const treatmentsByType = this.groupTreatmentsByType(treatmentList)

      return {
        period,
        totalTreatments,
        totalCost,
        averageEffectiveness,
        treatmentsByType,
        treatmentsByZone: [], // Would need zone data
        treatmentsByProduct: [], // Would need product data
        monthlyTrends: [], // Would need more complex calculation
        seasonalPatterns: [], // Would need seasonal analysis
        costPerTreatment: totalTreatments > 0 ? totalCost / totalTreatments : 0,
        costPerSqm: 0, // Would need area calculation
        organicPercentage,
        complianceScore: organicPercentage,
        recommendations: this.generateRecommendations(
          treatmentList,
          organicPercentage,
          nutritionAdjustment,
          qualityAdjustment
        ),
        adaptiveThresholds,
      }
    } catch (error) {
      console.error('Error fetching nutrition analytics:', error)
      const { adaptiveThresholds } = this.getFallbackAdaptiveLearningAdjustments()
      return {
        period,
        totalTreatments: 0,
        totalCost: 0,
        averageEffectiveness: 0,
        treatmentsByType: [],
        treatmentsByZone: [],
        treatmentsByProduct: [],
        monthlyTrends: [],
        seasonalPatterns: [],
        costPerTreatment: 0,
        costPerSqm: 0,
        organicPercentage: 0,
        complianceScore: 0,
        recommendations: [],
        adaptiveThresholds,
      }
    }
  }

  async getDashboardData(gardenId: string): Promise<NutritionDashboardData> {
    try {
      const supabase = getSupabaseClient()
      const monthStart = new Date()
      monthStart.setDate(1)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const { nutritionAdjustment, qualityAdjustment, adaptiveThresholds } =
        await this.getAdaptiveLearningAdjustments(gardenId)
      
      // Get active treatments count
      const { data: activeTreatments } = await supabase
        .from('nutrition_treatments')
        .select('id')
        .eq('garden_id', gardenId)
        .eq('status', 'in_progress')

      // Get scheduled treatments count
      const { data: scheduledTreatments } = await supabase
        .from('nutrition_treatments')
        .select('id')
        .eq('garden_id', gardenId)
        .eq('status', 'planned')

      // Get monthly treatments count
      const { data: monthlyTreatments } = await supabase
        .from('nutrition_treatments')
        .select('id')
        .eq('garden_id', gardenId)
        .gte('actual_application_date', monthStart.toISOString().split('T')[0])

      // Get total products count
      const { data: fertilizerProducts } = await supabase
        .from('fertilizer_products')
        .select('id')
        .eq('garden_id', gardenId)
        .eq('is_active', true)

      const { data: treatmentProducts } = await supabase
        .from('treatment_products')
        .select('id')
        .eq('garden_id', gardenId)
        .eq('is_active', true)

      // Get low stock alerts
      const { data: lowStockProducts } = await supabase
        .rpc('get_low_stock_products', { garden_id_param: gardenId })

      // Get recent treatments
      const { data: recentTreatments } = await supabase
        .from('nutrition_treatments')
        .select('*')
        .eq('garden_id', gardenId)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: performanceTreatments } = await supabase
        .from('nutrition_treatments')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('status', 'completed')
        .gte('actual_application_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('actual_application_date', { ascending: false })
        .limit(20)

      // Get upcoming schedules
      const { data: upcomingSchedules } = await supabase
        .from('nutrition_schedules')
        .select('*')
        .eq('garden_id', gardenId)
        .eq('is_active', true)
        .order('next_execution_date', { ascending: true })
        .limit(5)

      // Calculate organic compliance
      const organicCompliance = await supabase
        .rpc('calculate_organic_compliance', { garden_id_param: gardenId })

      const completedTreatments =
        performanceTreatments?.map(this.mapTreatmentFromDatabase) || []
      const effectValues = completedTreatments
        .map((treatment) => toEffectivenessPercent(treatment.effectiveness))
        .filter((value) => value > 0)
      const averageEffectiveness = average(effectValues)
      const monthlyCost = roundMetric(
        completedTreatments
          .filter((treatment) => {
            const executionDate = treatment.actualApplicationDate || treatment.scheduledDate
            return executionDate >= monthStart.toISOString().split('T')[0]
          })
          .reduce((sum, treatment) => sum + (treatment.totalCost || 0), 0),
        0
      )
      const effectivenessAlerts = this.buildEffectivenessAlerts(
        completedTreatments,
        nutritionAdjustment,
        qualityAdjustment
      )

      return {
        activeTreatments: activeTreatments?.length || 0,
        scheduledTreatments: scheduledTreatments?.length || 0,
        monthlyTreatments: monthlyTreatments?.length || 0,
        totalProducts: (fertilizerProducts?.length || 0) + (treatmentProducts?.length || 0),
        lowStockAlerts: lowStockProducts?.length || 0,
        complianceAlerts: organicCompliance?.data < 80 ? 1 : 0,
        recentTreatments: recentTreatments?.map(this.mapTreatmentFromDatabase) || [],
        upcomingSchedules: upcomingSchedules?.map(this.mapScheduleFromDatabase) || [],
        lowStockProducts: lowStockProducts?.map(this.mapInventoryFromDatabase) || [],
        effectivenessAlerts,
        quickStats: {
          organicPercentage: organicCompliance?.data || 0,
          averageEffectiveness,
          monthlyCost,
          treatmentFrequency: monthlyTreatments?.length || 0
        },
        adaptiveThresholds,
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      const { adaptiveThresholds } = this.getFallbackAdaptiveLearningAdjustments()
      return {
        activeTreatments: 0,
        scheduledTreatments: 0,
        monthlyTreatments: 0,
        totalProducts: 0,
        lowStockAlerts: 0,
        complianceAlerts: 0,
        recentTreatments: [],
        upcomingSchedules: [],
        lowStockProducts: [],
        effectivenessAlerts: [],
        quickStats: {
          organicPercentage: 0,
          averageEffectiveness: 0,
          monthlyCost: 0,
          treatmentFrequency: 0
        },
        adaptiveThresholds,
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private groupTreatmentsByType(treatments: any[]) {
    const grouped = treatments.reduce((acc, treatment) => {
      const type = treatment.treatment_type
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          totalCost: 0,
          averageEffectiveness: 0,
          organicPercentage: 0,
          organicCount: 0
        }
      }
      
      acc[type].count++
      acc[type].totalCost += treatment.total_cost || 0
      acc[type].averageEffectiveness += toEffectivenessPercent(treatment.effectiveness)
      
      if (treatment.organic_compliant) {
        acc[type].organicCount++
      }
      
      return acc
    }, {})

    return Object.values(grouped).map((group: any) => ({
      ...group,
      averageEffectiveness: group.count > 0 ? roundMetric(group.averageEffectiveness / group.count) : 0,
      organicPercentage: group.count > 0 ? (group.organicCount / group.count) * 100 : 0
    }))
  }

  private generateRecommendations(
    treatments: any[],
    organicPercentage: number,
    nutritionAdjustment: AgronomicNutritionLearningAdjustment,
    qualityAdjustment: AgronomicQualityLearningAdjustment
  ) {
    const recommendations = []
    const effectivenessValues = treatments
      .map((treatment) => toEffectivenessPercent(treatment.effectiveness))
      .filter((value) => value > 0)
    const avgEffectiveness = average(effectivenessValues)
    const followUpRate =
      treatments.length > 0
        ? average(
            treatments.map((treatment) =>
              treatment.follow_up_required === true || treatment.followUpRequired === true ? 100 : 0
            )
          ) / 100
        : 0

    if (organicPercentage < 80) {
      recommendations.push({
        type: 'organic_transition',
        title: 'Aumenta l\'uso di prodotti biologici',
        description: 'Considera di sostituire alcuni prodotti convenzionali con alternative biologiche',
        potentialImprovement: 80 - organicPercentage,
        priority: 'high',
        actionItems: [
          'Identifica prodotti biologici equivalenti',
          'Testa l\'efficacia su piccole aree',
          'Pianifica la transizione graduale'
        ]
      })
    }

    if (effectivenessValues.length >= 3 && avgEffectiveness < nutritionAdjustment.effectivenessTargetPercent) {
      recommendations.push({
        type: 'effectiveness_improvement',
        title: 'Riallinea l\'efficacia dei trattamenti',
        description: `L'efficacia media osservata (${avgEffectiveness.toFixed(1)}%) è sotto il target adattivo del sito (${nutritionAdjustment.effectivenessTargetPercent}%).`,
        potentialImprovement: Math.max(
          1,
          Math.round(nutritionAdjustment.effectivenessTargetPercent - avgEffectiveness)
        ),
        priority: avgEffectiveness < nutritionAdjustment.effectivenessAlertFloorPercent ? 'high' : 'medium',
        actionItems: [
          'Verifica finestra meteo, copertura reale e uniformita di applicazione',
          'Ricalibra dose, volume e attrezzatura sulle zone con risposta piu debole',
          ...nutritionAdjustment.notes.slice(0, 1)
        ]
      })
    }

    if (treatments.length >= 4 && followUpRate >= nutritionAdjustment.followUpRateThreshold) {
      recommendations.push({
        type: 'timing_optimization',
        title: 'Riduci il bisogno di follow-up correttivi',
        description: `Il ${Math.round(followUpRate * 100)}% degli interventi recenti richiede un secondo passaggio, sopra la soglia adattiva del ${Math.round(nutritionAdjustment.followUpRateThreshold * 100)}%.`,
        potentialImprovement: Math.max(
          1,
          Math.round((followUpRate - nutritionAdjustment.followUpRateThreshold) * 100)
        ),
        priority: 'high',
        actionItems: [
          'Anticipa i trattamenti nelle finestre piu stabili del sito',
          'Controlla compatibilita miscela e copertura fogliare reale',
          ...(qualityAdjustment.notes.length > 0 ? [qualityAdjustment.notes[0]] : [])
        ]
      })
    }

    return recommendations
  }

  private getFallbackAdaptiveLearningAdjustments(): {
    nutritionAdjustment: AgronomicNutritionLearningAdjustment
    qualityAdjustment: AgronomicQualityLearningAdjustment
    adaptiveThresholds: NutritionAdaptiveThresholds
  } {
    const nutritionAdjustment = buildAgronomicNutritionLearningAdjustment([], {})
    const qualityAdjustment = buildAgronomicQualityLearningAdjustment([], {})

    return {
      nutritionAdjustment,
      qualityAdjustment,
      adaptiveThresholds: this.buildNutritionAdaptiveThresholds(
        nutritionAdjustment,
        qualityAdjustment
      ),
    }
  }

  private async getAdaptiveLearningAdjustments(gardenId: string): Promise<{
    nutritionAdjustment: AgronomicNutritionLearningAdjustment
    qualityAdjustment: AgronomicQualityLearningAdjustment
    adaptiveThresholds: NutritionAdaptiveThresholds
  }> {
    try {
      const storageProvider = getDefaultStorageProvider()
      const snapshots = await getAgronomicProfileLearningSnapshots(storageProvider, gardenId)
      const nutritionAdjustment = buildAgronomicNutritionLearningAdjustment(snapshots, {})
      const qualityAdjustment = buildAgronomicQualityLearningAdjustment(snapshots, {})

      return {
        nutritionAdjustment,
        qualityAdjustment,
        adaptiveThresholds: this.buildNutritionAdaptiveThresholds(
          nutritionAdjustment,
          qualityAdjustment
        ),
      }
    } catch (error) {
      console.warn('Unable to load agronomic learning adjustments for nutrition:', error)
      return this.getFallbackAdaptiveLearningAdjustments()
    }
  }

  private buildNutritionAdaptiveThresholds(
    nutritionAdjustment: AgronomicNutritionLearningAdjustment,
    qualityAdjustment: AgronomicQualityLearningAdjustment
  ): NutritionAdaptiveThresholds {
    return {
      effectivenessTargetPercent: nutritionAdjustment.effectivenessTargetPercent,
      effectivenessAlertFloorPercent: nutritionAdjustment.effectivenessAlertFloorPercent,
      followUpRateThresholdPercent: Math.round(nutritionAdjustment.followUpRateThreshold * 100),
      qualityTargetRating: qualityAdjustment.qualityTargetRating,
      notes: [...nutritionAdjustment.notes, ...qualityAdjustment.notes].slice(0, 4),
    }
  }

  private buildEffectivenessAlerts(
    treatments: NutritionTreatment[],
    nutritionAdjustment: AgronomicNutritionLearningAdjustment,
    qualityAdjustment: AgronomicQualityLearningAdjustment
  ): EffectivenessAlert[] {
    return treatments
      .filter((treatment) => {
        const effectiveness = toEffectivenessPercent(treatment.effectiveness)
        return (
          effectiveness > 0 &&
          (effectiveness < nutritionAdjustment.effectivenessAlertFloorPercent || treatment.followUpRequired)
        )
      })
      .slice(0, 5)
      .map((treatment) => {
        const effectiveness = toEffectivenessPercent(treatment.effectiveness)
        const executionDate = treatment.actualApplicationDate || treatment.scheduledDate
        const daysAgo = Math.max(
          0,
          Math.floor((Date.now() - new Date(executionDate).getTime()) / (1000 * 60 * 60 * 24))
        )

        return {
          treatmentId: treatment.id,
          productName: treatment.productName,
          zoneName: treatment.zoneId || treatment.fieldRowId || treatment.sectionId || 'Area generale',
          effectiveness,
          expectedEffectiveness: nutritionAdjustment.effectivenessTargetPercent,
          daysAgo,
          recommendedAction: treatment.followUpRequired
            ? 'Programma un follow-up ravvicinato e ricalibra dose, timing e copertura.'
            : qualityAdjustment.notes[0] ||
              'Verifica condizioni meteo, compatibilita miscela e uniformita di distribuzione.',
        }
      })
  }

  // ============================================================================
  // DATABASE MAPPING METHODS
  // ============================================================================

  private mapFertilizerFromDatabase(data: any): FertilizerProduct {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      brand: data.brand,
      productCode: data.product_code,
      fertilizerType: data.fertilizer_type,
      category: data.category,
      npkRatio: data.npk_ratio,
      nitrogenPercentage: data.nitrogen_percentage,
      phosphorusPercentage: data.phosphorus_percentage,
      potassiumPercentage: data.potassium_percentage,
      calciumPercentage: data.calcium_percentage,
      magnesiumPercentage: data.magnesium_percentage,
      sulfurPercentage: data.sulfur_percentage,
      microNutrients: data.micro_nutrients || [],
      recommendedDosage: data.recommended_dosage,
      dosageUnit: data.dosage_unit,
      applicationMethod: data.application_method,
      phRange: data.ph_range_min && data.ph_range_max ? {
        min: data.ph_range_min,
        max: data.ph_range_max
      } : undefined,
      compatibleProducts: data.compatible_products || [],
      incompatibleProducts: data.incompatible_products || [],
      organicApproved: data.organic_approved,
      currentStock: data.current_stock,
      stockUnit: data.stock_unit,
      costPerUnit: data.cost_per_unit,
      supplier: data.supplier,
      purchaseDate: data.purchase_date,
      expiryDate: data.expiry_date,
      applicationFrequency: data.application_frequency,
      seasonalRestrictions: data.seasonal_restrictions || [],
      cropSpecificNotes: data.crop_specific_notes,
      safetyNotes: data.safety_notes,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapFertilizerToDatabase(product: Partial<FertilizerProduct>): any {
    return {
      garden_id: product.gardenId,
      name: product.name,
      brand: product.brand,
      product_code: product.productCode,
      fertilizer_type: product.fertilizerType,
      category: product.category,
      npk_ratio: product.npkRatio,
      nitrogen_percentage: product.nitrogenPercentage,
      phosphorus_percentage: product.phosphorusPercentage,
      potassium_percentage: product.potassiumPercentage,
      calcium_percentage: product.calciumPercentage,
      magnesium_percentage: product.magnesiumPercentage,
      sulfur_percentage: product.sulfurPercentage,
      micro_nutrients: product.microNutrients,
      recommended_dosage: product.recommendedDosage,
      dosage_unit: product.dosageUnit,
      application_method: product.applicationMethod,
      ph_range_min: product.phRange?.min,
      ph_range_max: product.phRange?.max,
      compatible_products: product.compatibleProducts,
      incompatible_products: product.incompatibleProducts,
      organic_approved: product.organicApproved,
      current_stock: product.currentStock,
      stock_unit: product.stockUnit,
      cost_per_unit: product.costPerUnit,
      supplier: product.supplier,
      purchase_date: product.purchaseDate,
      expiry_date: product.expiryDate,
      application_frequency: product.applicationFrequency,
      seasonal_restrictions: product.seasonalRestrictions,
      crop_specific_notes: product.cropSpecificNotes,
      safety_notes: product.safetyNotes,
      is_active: product.isActive
    }
  }

  private mapTreatmentProductFromDatabase(data: any): TreatmentProduct {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      brand: data.brand,
      productCode: data.product_code,
      treatmentType: data.treatment_type,
      activeIngredient: data.active_ingredient,
      concentration: data.concentration,
      concentrationUnit: data.concentration_unit,
      recommendedDosage: data.recommended_dosage,
      dosageUnit: data.dosage_unit,
      applicationMethod: data.application_method,
      targetPests: data.target_pests || [],
      targetDiseases: data.target_diseases || [],
      targetWeeds: data.target_weeds || [],
      efficacyRating: data.efficacy_rating,
      organicApproved: data.organic_approved,
      preharvest_interval_days: data.preharvest_interval_days,
      reentry_interval_hours: data.reentry_interval_hours,
      toxicityClass: data.toxicity_class,
      beeHazard: data.bee_hazard,
      aquaticHazard: data.aquatic_hazard,
      soilPersistence: data.soil_persistence,
      modeOfAction: data.mode_of_action,
      resistanceGroup: data.resistance_group,
      maxApplicationsPerSeason: data.max_applications_per_season,
      currentStock: data.current_stock,
      stockUnit: data.stock_unit,
      costPerUnit: data.cost_per_unit,
      supplier: data.supplier,
      purchaseDate: data.purchase_date,
      expiryDate: data.expiry_date,
      weatherRestrictions: data.weather_restrictions || [],
      temperatureRange: data.temperature_range_min && data.temperature_range_max ? {
        min: data.temperature_range_min,
        max: data.temperature_range_max
      } : undefined,
      windSpeedLimit: data.wind_speed_limit,
      rainFastHours: data.rain_fast_hours,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapTreatmentProductToDatabase(product: Partial<TreatmentProduct>): any {
    return {
      garden_id: product.gardenId,
      name: product.name,
      brand: product.brand,
      product_code: product.productCode,
      treatment_type: product.treatmentType,
      active_ingredient: product.activeIngredient,
      concentration: product.concentration,
      concentration_unit: product.concentrationUnit,
      recommended_dosage: product.recommendedDosage,
      dosage_unit: product.dosageUnit,
      application_method: product.applicationMethod,
      target_pests: product.targetPests,
      target_diseases: product.targetDiseases,
      target_weeds: product.targetWeeds,
      efficacy_rating: product.efficacyRating,
      organic_approved: product.organicApproved,
      preharvest_interval_days: product.preharvest_interval_days,
      reentry_interval_hours: product.reentry_interval_hours,
      toxicity_class: product.toxicityClass,
      bee_hazard: product.beeHazard,
      aquatic_hazard: product.aquaticHazard,
      soil_persistence: product.soilPersistence,
      mode_of_action: product.modeOfAction,
      resistance_group: product.resistanceGroup,
      max_applications_per_season: product.maxApplicationsPerSeason,
      current_stock: product.currentStock,
      stock_unit: product.stockUnit,
      cost_per_unit: product.costPerUnit,
      supplier: product.supplier,
      purchase_date: product.purchaseDate,
      expiry_date: product.expiryDate,
      weather_restrictions: product.weatherRestrictions,
      temperature_range_min: product.temperatureRange?.min,
      temperature_range_max: product.temperatureRange?.max,
      wind_speed_limit: product.windSpeedLimit,
      rain_fast_hours: product.rainFastHours,
      is_active: product.isActive
    }
  }

  private mapTreatmentFromDatabase(data: any): NutritionTreatment {
    return {
      id: data.id,
      gardenId: data.garden_id,
      zoneId: data.zone_id,
      fieldRowId: data.field_row_id,
      sectionId: data.section_id,
      plantIds: data.plant_ids || [],
      treatmentType: data.treatment_type,
      productId: data.product_id,
      productName: data.product_name,
      dosage: data.dosage,
      dosageUnit: data.dosage_unit,
      applicationMethod: data.application_method,
      mixingInstructions: data.mixing_instructions,
      scheduledDate: data.scheduled_date,
      actualApplicationDate: data.actual_application_date,
      applicationTime: data.application_time,
      weatherConditions: data.weather_conditions,
      soilConditions: data.soil_conditions,
      operatorId: data.operator_id,
      operatorName: data.operator_name,
      equipmentUsed: data.equipment_used,
      applicationDurationMinutes: data.application_duration_minutes,
      calibrationCheck: data.calibration_check,
      mixingRatio: data.mixing_ratio,
      actualCoverage: data.actual_coverage,
      effectiveness: data.effectiveness,
      sideEffects: data.side_effects || [],
      plantResponse: data.plant_response,
      followUpRequired: data.follow_up_required,
      followUpDate: data.follow_up_date,
      organicCompliant: data.organic_compliant,
      certificationNotes: data.certification_notes,
      photosBeforeIds: data.photos_before_ids || [],
      photosAfterIds: data.photos_after_ids || [],
      productCost: data.product_cost,
      laborCost: data.labor_cost,
      equipmentCost: data.equipment_cost,
      totalCost: data.total_cost,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapTreatmentToDatabase(treatment: Partial<NutritionTreatment>): any {
    return {
      garden_id: treatment.gardenId,
      zone_id: treatment.zoneId,
      field_row_id: treatment.fieldRowId,
      section_id: treatment.sectionId,
      plant_ids: treatment.plantIds,
      treatment_type: treatment.treatmentType,
      product_id: treatment.productId,
      product_name: treatment.productName,
      product_type: treatment.treatmentType?.includes('fertiliz') ? 'fertilizer' : 'treatment',
      dosage: treatment.dosage,
      dosage_unit: treatment.dosageUnit,
      application_method: treatment.applicationMethod,
      mixing_instructions: treatment.mixingInstructions,
      scheduled_date: treatment.scheduledDate,
      actual_application_date: treatment.actualApplicationDate,
      application_time: treatment.applicationTime,
      weather_conditions: treatment.weatherConditions,
      soil_conditions: treatment.soilConditions,
      operator_name: treatment.operatorName,
      equipment_used: treatment.equipmentUsed,
      application_duration_minutes: treatment.applicationDurationMinutes,
      calibration_check: treatment.calibrationCheck,
      mixing_ratio: treatment.mixingRatio,
      actual_coverage: treatment.actualCoverage,
      effectiveness: treatment.effectiveness,
      side_effects: treatment.sideEffects,
      plant_response: treatment.plantResponse,
      follow_up_required: treatment.followUpRequired,
      follow_up_date: treatment.followUpDate,
      organic_compliant: treatment.organicCompliant,
      certification_notes: treatment.certificationNotes,
      photos_before_ids: treatment.photosBeforeIds,
      photos_after_ids: treatment.photosAfterIds,
      product_cost: treatment.productCost,
      labor_cost: treatment.laborCost,
      equipment_cost: treatment.equipmentCost,
      total_cost: treatment.totalCost,
      notes: treatment.notes,
      status: treatment.status
    }
  }

  private mapScheduleFromDatabase(data: any): NutritionSchedule {
    return {
      id: data.id,
      gardenId: data.garden_id,
      name: data.name,
      description: data.description,
      zoneId: data.zone_id,
      fieldRowId: data.field_row_id,
      sectionId: data.section_id,
      cropType: data.crop_type,
      scheduleType: data.schedule_type,
      isActive: data.is_active,
      frequency: data.frequency,
      interval: data.interval_days,
      daysOfWeek: data.days_of_week || [],
      timeSlots: data.time_slots || [],
      startDate: data.start_date,
      endDate: data.end_date,
      seasonalPattern: data.seasonal_pattern,
      growthStages: data.growth_stages || [],
      conditions: data.conditions,
      treatments: data.treatments || [],
      lastExecutionDate: data.last_execution_date,
      nextExecutionDate: data.next_execution_date,
      executionCount: data.execution_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  private mapScheduleToDatabase(schedule: Partial<NutritionSchedule>): any {
    return {
      garden_id: schedule.gardenId,
      name: schedule.name,
      description: schedule.description,
      zone_id: schedule.zoneId,
      field_row_id: schedule.fieldRowId,
      section_id: schedule.sectionId,
      crop_type: schedule.cropType,
      schedule_type: schedule.scheduleType,
      is_active: schedule.isActive,
      frequency: schedule.frequency,
      interval_days: schedule.interval,
      days_of_week: schedule.daysOfWeek,
      time_slots: schedule.timeSlots,
      start_date: schedule.startDate,
      end_date: schedule.endDate,
      seasonal_pattern: schedule.seasonalPattern,
      growth_stages: schedule.growthStages,
      conditions: schedule.conditions,
      treatments: schedule.treatments,
      last_execution_date: schedule.lastExecutionDate,
      next_execution_date: schedule.nextExecutionDate,
      execution_count: schedule.executionCount
    }
  }

  private mapInventoryFromDatabase(data: any): ProductInventory {
    return {
      productId: data.product_id,
      productName: data.product_name,
      productType: data.product_type,
      currentStock: data.current_stock,
      stockUnit: data.stock_unit,
      minimumStock: data.minimum_stock,
      maximumStock: data.maximum_stock,
      averageUsagePerMonth: data.average_usage_per_month,
      lastRestockDate: data.last_restock_date,
      nextRestockDate: data.next_restock_date,
      supplier: data.supplier,
      costPerUnit: data.cost_per_unit,
      totalValue: data.total_value,
      expiryDate: data.expiry_date,
      storageLocation: data.storage_location,
      storageConditions: data.storage_conditions,
      safetyRequirements: data.safety_requirements || []
    }
  }
}

export const advancedNutritionService = new AdvancedNutritionService()
