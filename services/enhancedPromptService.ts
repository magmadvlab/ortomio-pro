/**
 * Enhanced Prompt Engineering Service
 * Improved prompts with better structure, context management, and domain expertise
 */

import { Garden, GardenTask, UserProfile } from '../types';

export interface PromptContext {
  user?: UserProfile;
  garden?: Garden;
  activeTasks?: GardenTask[];
  season?: string;
  weatherContext?: string;
  agronomicContext?: string;
  previousInteractions?: string[];
}

export class EnhancedPromptService {
  
  /**
   * Generate context-aware system instruction
   */
  static generateSystemInstruction(context: PromptContext): string {
    const baseInstruction = `Sei un agronomo esperto specializzato in agricoltura italiana sostenibile e biologica.`;
    
    const contextualElements = [];
    
    if (context.user?.expertise) {
      const levelMap = {
        'beginner': 'Usa linguaggio semplice e fornisci spiegazioni dettagliate passo-passo.',
        'intermediate': 'Bilancia dettagli tecnici con praticità.',
        'expert': 'Puoi usare terminologia tecnica avanzata.'
      };
      contextualElements.push(levelMap[context.user.expertise]);
    }
    
    if (context.garden?.primaryCrop?.label) {
      contextualElements.push(`Specializzati in ${context.garden.primaryCrop.label}.`);
    }
    
    if (context.season) {
      contextualElements.push(`Considera che siamo in ${context.season}.`);
    }

    if (context.agronomicContext) {
      contextualElements.push(`Contesto agronomico: ${context.agronomicContext}`);
    }
    
    return [baseInstruction, ...contextualElements].join(' ');
  }

  /**
   * Enhanced plant identification prompt with better structure
   */
  static generatePlantIdentificationPrompt(
    query: string, 
    context: PromptContext
  ): string {
    const systemContext = this.generateSystemInstruction(context);
    
    return `${systemContext}

RICHIESTA: Informazioni complete per "${query}"
POSIZIONE: ${context.garden?.coordinates ? `Lat ${context.garden.coordinates.latitude}, Lng ${context.garden.coordinates.longitude}` : 'Italia'}
STAGIONE: ${context.season || 'Corrente'}

STRUTTURA RISPOSTA RICHIESTA:
1. IDENTIFICAZIONE: Nome comune e scientifico
2. TIMING OTTIMALE: Quando seminare/trapiantare/raccogliere
3. GUIDA PRATICA: 6 passi per semina, 5 per trapianto
4. CURA SETTIMANALE: 6 consigli di manutenzione
5. ERRORI COMUNI: 4 errori da evitare con soluzioni
6. RACCOLTA: Segni visivi e tecniche

PRIORITÀ:
- Adatta consigli al clima italiano
- Considera sostenibilità e metodi biologici
- Fornisci misurazioni precise (cm, giorni, temperature)
- Includi varietà locali quando possibile`;
  }

  /**
   * Enhanced image analysis prompt with lifecycle awareness
   */
  static generateImageAnalysisPrompt(
    context: PromptContext & {
      plantName?: string;
      lifecycleStage?: string;
      daysFromSowing?: number;
    }
  ): string {
    const basePrompt = `Analizza questa foto dell'orto con expertise agronomica.`;
    
    const contextElements = [];
    
    if (context.plantName) {
      contextElements.push(`PIANTA ATTESA: ${context.plantName}`);
    }
    
    if (context.lifecycleStage && context.daysFromSowing) {
      const stageMap: Record<string, string> = {
        'Sowing': `Semina recente (${context.daysFromSowing} giorni fa). Cerca: germinazione, condizioni substrato, problemi emergenza.`,
        'Nursing': `Piantina giovane (${context.daysFromSowing} giorni). Valuta: crescita, filatura, pronta per trapianto.`,
        'Production': `Pianta adulta (${context.daysFromSowing} giorni). Controlla: salute, maturazione frutti, malattie.`
      };
      contextElements.push(stageMap[context.lifecycleStage] || 'Valuta stato generale.');
    }
    
    if (context.weatherContext) {
      contextElements.push(`METEO RECENTE: ${context.weatherContext}`);
    }
    
    const analysisFramework = `
ANALISI RICHIESTA:
1. IDENTIFICAZIONE: Conferma specie e varietà se possibile
2. STADIO SVILUPPO: Fase di crescita attuale
3. STATO SALUTE: Problemi visibili (malattie, carenze, stress)
4. AZIONI IMMEDIATE: Cosa fare oggi/questa settimana
5. PREVENZIONE: Come evitare problemi futuri

FORMATO: Risposta concisa ma completa in italiano, max 200 parole.`;
    
    return [basePrompt, ...contextElements, analysisFramework].join('\n\n');
  }

  /**
   * Enhanced problem diagnosis with severity assessment
   */
  static generateDiagnosisPrompt(
    problem: string,
    context: PromptContext
  ): string {
    return `${this.generateSystemInstruction(context)}

PROBLEMA RIPORTATO: "${problem}"
${context.garden ? `GIARDINO: ${context.garden.name}` : ''}
${context.weatherContext ? `CONDIZIONI METEO: ${context.weatherContext}` : ''}

DIAGNOSI RICHIESTA:
1. IDENTIFICAZIONE PROBLEMA: Nome tecnico e causa probabile
2. GRAVITÀ: Bassa/Media/Alta/Critica con giustificazione
3. SINTOMI CHIAVE: Lista specifica di segni visivi
4. AZIONE IMMEDIATA: Cosa fare nelle prossime 24-48h
5. TRATTAMENTO COMPLETO: Piano step-by-step
6. PREVENZIONE: Come evitare recidive

PRIORITÀ SOLUZIONI:
1. Metodi biologici e sostenibili
2. Prodotti facilmente reperibili in Italia
3. Costi contenuti per hobbisti
4. Sicurezza per famiglia e ambiente`;
  }

  /**
   * Generate seasonal recommendations with local expertise
   */
  static generateSeasonalPrompt(
    latitude: number,
    longitude: number,
    context: PromptContext
  ): string {
    const climateZone = latitude > 45 ? 'Nord Italia' : 
                       latitude > 41 ? 'Centro Italia' : 'Sud Italia';
    
    return `${this.generateSystemInstruction(context)}

POSIZIONE: ${climateZone} (Lat: ${latitude}, Lng: ${longitude})
PERIODO: ${context.season || new Date().toLocaleDateString('it-IT')}

SUGGERIMENTI STAGIONALI RICHIESTI:
Fornisci 5 ortaggi/erbe IDEALI per piantare ADESSO in questa zona climatica.

CRITERI SELEZIONE:
- Adatti al clima locale specifico
- Timing ottimale per semina/trapianto
- Facilità per livello utente: ${context.user?.expertise || 'principiante'}
- Varietà tradizionali italiane quando possibile
- Considerazioni su rotazioni e consociazioni

PER OGNI PIANTA INCLUDI:
- Perché è ideale ora
- Finestra temporale precisa
- Difficoltà e cure richieste
- Tempo alla raccolta
- Fabbisogno idrico`;
  }
}
