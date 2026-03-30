/**
 * Context-Aware AI Service
 * Manages conversation context and provides intelligent assistance across the platform
 */

import { Garden, GardenTask, UserProfile, PlantMasterSheet } from '../types';
import { getAIProvider } from './aiProviderAdapter';
import { EnhancedPromptService, PromptContext } from './enhancedPromptService';
import { getWeatherForecast } from './weatherService';
import { resolveAgronomicCropProfile } from './agronomicKernelService';

export interface ConversationContext {
  sessionId: string;
  userId: string;
  gardenId?: string;
  interactions: AIInteraction[];
  contextSummary?: string;
  lastUpdated: Date;
}

export interface AIInteraction {
  id: string;
  timestamp: Date;
  type: 'question' | 'image_analysis' | 'diagnosis' | 'planning';
  userInput: string;
  aiResponse: string;
  context?: {
    plantName?: string;
    taskType?: string;
    location?: string;
  };
  feedback?: 'helpful' | 'not_helpful';
}

export interface AIAssistanceRequest {
  type: 'general' | 'plant_specific' | 'problem_diagnosis' | 'planning' | 'image_analysis';
  input: string;
  imageData?: string;
  context?: {
    plantName?: string;
    taskId?: string;
    location?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
}

export class ContextAwareAIService {
  private static conversations = new Map<string, ConversationContext>();
  
  /**
   * Get or create conversation context
   */
  static getConversationContext(
    sessionId: string, 
    userId: string, 
    gardenId?: string
  ): ConversationContext {
    const key = `${userId}_${gardenId || 'global'}`;
    
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        sessionId,
        userId,
        gardenId,
        interactions: [],
        lastUpdated: new Date()
      });
    }
    
    return this.conversations.get(key)!;
  }

  /**
   * Build comprehensive context for AI requests
   */
  static async buildContext(
    userId: string,
    gardenId?: string,
    userProfile?: UserProfile,
    plantName?: string
  ): Promise<PromptContext> {
    const context: PromptContext = {
      user: userProfile,
      previousInteractions: []
    };

    // Add garden context if available
    if (gardenId) {
      try {
        // In a real implementation, you'd fetch from storage
        // For now, we'll use a placeholder
        context.garden = {
          id: gardenId,
          name: 'Orto Principale',
          sizeSqMeters: 100,
          createdAt: new Date().toISOString()
        } as Garden;
      } catch (error) {
        console.warn('Could not load garden context:', error);
      }
    }

    // Add seasonal context
    const now = new Date();
    const month = now.getMonth() + 1;
    context.season = month >= 3 && month <= 5 ? 'Primavera' :
                    month >= 6 && month <= 8 ? 'Estate' :
                    month >= 9 && month <= 11 ? 'Autunno' : 'Inverno';

    // Add weather context if coordinates available
    if (context.garden?.coordinates) {
      try {
        const weather = await getWeatherForecast(
          context.garden.coordinates.latitude,
          context.garden.coordinates.longitude
        );
        if (weather) {
          context.weatherContext = `Temp: ${weather.tempMin}°-${weather.tempMax}°C, Pioggia: ${weather.rainForecastMm}mm`;
        }
      } catch (error) {
        console.warn('Could not load weather context:', error);
      }
    }

    if (plantName) {
      try {
        const resolvedProfile = await resolveAgronomicCropProfile({ plantId: plantName });
        context.agronomicContext = this.formatAgronomicContext(
          plantName,
          resolvedProfile.profile.label,
          resolvedProfile.profile.primaryScope,
          resolvedProfile.profile.water.strategy,
          resolvedProfile.profile.health.priorities,
          resolvedProfile.profile.quality.targetMetrics,
          resolvedProfile.warnings
        );
      } catch (error) {
        console.warn('Could not resolve agronomic profile context:', error);
      }
    }

    // Add recent interactions
    const conversation = this.getConversationContext('current', userId, gardenId);
    context.previousInteractions = conversation.interactions
      .slice(-3) // Last 3 interactions
      .map(i => `Q: ${i.userInput} A: ${i.aiResponse.substring(0, 100)}...`);

    return context;
  }

  /**
   * Process AI assistance request with full context
   */
  static async processRequest(
    request: AIAssistanceRequest,
    userId: string,
    gardenId?: string,
    userProfile?: UserProfile
  ): Promise<string> {
    const provider = await getAIProvider('ai_gemini');
    if (!provider) {
      throw new Error('AI provider not available');
    }

    const context = await this.buildContext(userId, gardenId, userProfile);
    let prompt = '';
    let systemInstruction = '';

    switch (request.type) {
      case 'plant_specific':
        context.agronomicContext = (
          await this.buildContext(userId, gardenId, userProfile, request.context?.plantName || request.input)
        ).agronomicContext;
        systemInstruction = EnhancedPromptService.generateSystemInstruction(context);
        prompt = EnhancedPromptService.generatePlantIdentificationPrompt(request.input, context);
        break;

      case 'problem_diagnosis':
        context.agronomicContext = (
          await this.buildContext(userId, gardenId, userProfile, request.context?.plantName || request.input)
        ).agronomicContext;
        systemInstruction = EnhancedPromptService.generateSystemInstruction(context);
        prompt = EnhancedPromptService.generateDiagnosisPrompt(request.input, context);
        break;

      case 'image_analysis':
        if (!request.imageData) {
          throw new Error('Image data required for image analysis');
        }
        context.agronomicContext = (
          await this.buildContext(userId, gardenId, userProfile, request.context?.plantName)
        ).agronomicContext;
        // Handle multimodal request
        systemInstruction = EnhancedPromptService.generateSystemInstruction(context);
        prompt = EnhancedPromptService.generateImageAnalysisPrompt({
          ...context,
          plantName: request.context?.plantName,
          lifecycleStage: 'Production', // Would be determined from task context
          daysFromSowing: 30 // Would be calculated from task data
        });
        break;

      case 'planning':
        context.agronomicContext = (
          await this.buildContext(userId, gardenId, userProfile, request.context?.plantName || request.input)
        ).agronomicContext;
        if (context.garden?.coordinates) {
          systemInstruction = EnhancedPromptService.generateSystemInstruction(context);
          prompt = EnhancedPromptService.generateSeasonalPrompt(
            context.garden.coordinates.latitude,
            context.garden.coordinates.longitude,
            context
          );
        } else {
          throw new Error('Garden coordinates required for planning');
        }
        break;

      default:
        // General assistance
        systemInstruction = EnhancedPromptService.generateSystemInstruction(context);
        prompt = `${request.input}

Contesto: ${context.season}, ${context.weatherContext || 'Condizioni normali'}
${context.agronomicContext ? `Profilo agronomico: ${context.agronomicContext}` : ''}
${context.previousInteractions?.length ? `Conversazione precedente: ${context.previousInteractions.join(' | ')}` : ''}

Fornisci una risposta utile e pratica in italiano.`;
    }

    try {
      const response = await provider.generateContent(prompt, {
        systemInstruction,
        temperature: 0.7,
        maxTokens: 1000
      });

      // Store interaction in conversation context
      const conversation = this.getConversationContext('current', userId, gardenId);
      const interaction: AIInteraction = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: request.type === 'general' ? 'question' : 
              request.type === 'plant_specific' ? 'question' :
              request.type === 'problem_diagnosis' ? 'diagnosis' :
              request.type,
        userInput: request.input,
        aiResponse: response.text,
        context: request.context
      };
      
      conversation.interactions.push(interaction);
      conversation.lastUpdated = new Date();

      // Keep only last 10 interactions to manage memory
      if (conversation.interactions.length > 10) {
        conversation.interactions = conversation.interactions.slice(-10);
      }

      return response.text;
    } catch (error) {
      console.error('AI request failed:', error);
      throw new Error('Errore nel processare la richiesta AI');
    }
  }

  /**
   * Get contextual suggestions for current garden state
   */
  static async getContextualSuggestions(
    gardenId: string,
    activeTasks: GardenTask[],
    userProfile?: UserProfile
  ): Promise<string[]> {
    const context = await this.buildContext(userProfile?.id || 'anonymous', gardenId, userProfile);
    
    const suggestions: string[] = [];

    // Analyze active tasks for suggestions
    const sowingTasks = activeTasks.filter(t => t.taskType === 'Sowing' && !t.completed);
    const harvestTasks = activeTasks.filter(t => t.taskType === 'Harvest' && !t.completed);
    
    if (sowingTasks.length > 0) {
      suggestions.push(`Hai ${sowingTasks.length} semine in corso. Vuoi consigli per la cura delle piantine?`);
    }
    
    if (harvestTasks.length > 0) {
      suggestions.push(`${harvestTasks.length} piante pronte per la raccolta. Serve aiuto per valutare la maturazione?`);
    }

    // Seasonal suggestions
    if (context.season === 'Primavera') {
      suggestions.push('È il momento ideale per preparare l\'orto estivo. Vuoi suggerimenti per le semine?');
    } else if (context.season === 'Autunno') {
      suggestions.push('Tempo di pianificare l\'orto invernale. Posso aiutarti con le varietà resistenti al freddo.');
    }

    // Weather-based suggestions
    if (context.weatherContext?.includes('Pioggia')) {
      suggestions.push('Con la pioggia prevista, posso consigliarti su drenaggio e prevenzione malattie fungine.');
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  private static formatAgronomicContext(
    plantName: string,
    profileLabel: string,
    primaryScope: string,
    waterStrategy: string,
    healthPriorities: string[],
    qualityTargets: string[],
    warnings: string[]
  ): string {
    const fragments = [
      `${plantName} -> profilo ${profileLabel}`,
      `scala primaria ${primaryScope}`,
      `strategia acqua ${waterStrategy}`,
      healthPriorities.length ? `pressioni sanitarie ${healthPriorities.join(', ')}` : null,
      qualityTargets.length ? `target qualita ${qualityTargets.join(', ')}` : null,
      warnings.length ? `note ${warnings.join(' | ')}` : null,
    ].filter(Boolean);

    return fragments.join('; ');
  }

  /**
   * Provide feedback on AI response
   */
  static provideFeedback(
    userId: string,
    interactionId: string,
    feedback: 'helpful' | 'not_helpful',
    gardenId?: string
  ): void {
    const conversation = this.getConversationContext('current', userId, gardenId);
    const interaction = conversation.interactions.find(i => i.id === interactionId);
    
    if (interaction) {
      interaction.feedback = feedback;
      
      // In a real implementation, you'd store this feedback for model improvement
      console.log(`Feedback received: ${feedback} for interaction ${interactionId}`);
    }
  }
}
