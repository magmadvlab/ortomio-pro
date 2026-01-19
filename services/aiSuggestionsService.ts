/**
 * AI Suggestions Service
 * Manages AI-generated suggestions for garden management
 */

export interface AISuggestion {
  id: string
  title: string
  description: string
  type: 'PLANTING_PLAN' | 'HARVEST_TIMING' | 'ROTATION_PLAN' | 'IRRIGATION' | 'NUTRITION' | 'GENERAL'
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  gardenId?: string
  userId: string
  createdAt: string
  actionData?: any
}

class AISuggestionsService {
  private baseUrl = '/api/ai/suggestions'

  /**
   * Get AI suggestions for a user
   */
  async getSuggestions(params: {
    userId: string
    gardenId?: string
    type?: string[]
    status?: string[]
  }): Promise<AISuggestion[]> {
    try {
      const searchParams = new URLSearchParams()
      searchParams.append('user_id', params.userId)
      
      if (params.gardenId) {
        searchParams.append('garden_id', params.gardenId)
      }
      
      if (params.type && params.type.length > 0) {
        searchParams.append('suggestion_type', params.type.join(','))
      }
      
      if (params.status && params.status.length > 0) {
        searchParams.append('status', params.status.join(','))
      }

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching AI suggestions:', error)
      return []
    }
  }

  /**
   * Create a new AI suggestion
   */
  async createSuggestion(suggestion: Omit<AISuggestion, 'id' | 'createdAt' | 'status'>): Promise<AISuggestion | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: suggestion.userId,
          garden_id: suggestion.gardenId,
          suggestion_type: suggestion.type,
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority || 'MEDIUM',
          action_data: suggestion.actionData
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create suggestion: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating AI suggestion:', error)
      return null
    }
  }

  /**
   * Update suggestion status
   */
  async updateSuggestionStatus(suggestionId: string, status: 'ACCEPTED' | 'DISMISSED'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${suggestionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      return response.ok
    } catch (error) {
      console.error('Error updating suggestion status:', error)
      return false
    }
  }

  /**
   * Generate contextual suggestions based on garden data
   */
  async generateContextualSuggestions(params: {
    userId: string
    gardenId: string
    context: 'planner' | 'irrigation' | 'nutrition' | 'general'
    gardenData?: any
  }): Promise<AISuggestion[]> {
    try {
      // This would typically call an AI service to generate suggestions
      // For now, return mock suggestions based on context
      const mockSuggestions = this.getMockSuggestions(params.context, params.userId, params.gardenId)
      
      // In a real implementation, you would:
      // 1. Send garden data to AI service
      // 2. Get AI-generated suggestions
      // 3. Store them in the database
      // 4. Return the suggestions
      
      return mockSuggestions
    } catch (error) {
      console.error('Error generating contextual suggestions:', error)
      return []
    }
  }

  private getMockSuggestions(context: string, userId: string, gardenId: string): AISuggestion[] {
    const baseId = `mock-${context}-${Date.now()}`
    
    switch (context) {
      case 'irrigation':
        return [
          {
            id: `${baseId}-1`,
            title: 'Irrigazione Mattutina Consigliata',
            description: 'Le temperature elevate previste richiedono irrigazione nelle prime ore del mattino',
            type: 'IRRIGATION',
            status: 'PENDING',
            priority: 'HIGH',
            userId,
            gardenId,
            createdAt: new Date().toISOString()
          }
        ]
      
      case 'nutrition':
        return [
          {
            id: `${baseId}-1`,
            title: 'Fertilizzazione Azotata',
            description: 'Le piante a foglia verde potrebbero beneficiare di fertilizzante azotato',
            type: 'NUTRITION',
            status: 'PENDING',
            priority: 'MEDIUM',
            userId,
            gardenId,
            createdAt: new Date().toISOString()
          }
        ]
      
      case 'planner':
        return [
          {
            id: `${baseId}-1`,
            title: 'Semina Stagionale',
            description: 'È il momento ideale per seminare ortaggi autunnali',
            type: 'PLANTING_PLAN',
            status: 'PENDING',
            priority: 'MEDIUM',
            userId,
            gardenId,
            createdAt: new Date().toISOString()
          }
        ]
      
      default:
        return [
          {
            id: `${baseId}-1`,
            title: 'Controllo Generale',
            description: 'Verifica lo stato generale delle piante e del terreno',
            type: 'GENERAL',
            status: 'PENDING',
            priority: 'LOW',
            userId,
            gardenId,
            createdAt: new Date().toISOString()
          }
        ]
    }
  }
}

export const aiSuggestionsService = new AISuggestionsService()
export default aiSuggestionsService