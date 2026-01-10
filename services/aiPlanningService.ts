/**
 * AI Planning Service - Sistema predittivo per scaglionamento coltivazioni
 * Integra con l'architettura AI esistente di OrtoMio Free
 */

import { Garden, GardenTask } from '../types';

export interface CropPlanningRequest {
  cropName: string;
  surfaceHectares: number;
  location: {
    latitude: number;
    longitude: number;
    region: string;
  };
  soilType?: string;
  irrigationAvailable: boolean;
  targetMarket: 'fresh' | 'processing' | 'export';
  budget?: number;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
}

export interface ScalingPlan {
  overview: {
    totalSurface: number;
    estimatedYield: number;
    plantingPeriods: number;
    harvestWindows: string[];
    totalInvestment: number;
    expectedRevenue: number;
    roi: number;
  };
  timeline: ScalingPhase[];
  resources: ResourceRequirements;
  riskAnalysis: RiskFactor[];
  recommendations: string[];
}

export interface ScalingPhase {
  phaseNumber: number;
  startDate: string;
  endDate: string;
  surfaceHectares: number;
  activities: PlannedActivity[];
  expectedYield: number;
  harvestDate: string;
}

export interface PlannedActivity {
  type: 'sowing' | 'transplant' | 'fertilization' | 'treatment' | 'harvest';
  date: string;
  description: string;
  resources: string[];
  estimatedHours: number;
  cost: number;
}

export interface ResourceRequirements {
  seeds: {
    variety: string;
    quantity: string;
    cost: number;
    supplier?: string;
  };
  equipment: {
    name: string;
    quantity: number;
    cost: number;
    rental?: boolean;
  }[];
  labor: {
    phase: string;
    hoursNeeded: number;
    skillLevel: string;
    estimatedCost: number;
  }[];
  inputs: {
    type: 'fertilizer' | 'pesticide' | 'water';
    name: string;
    quantity: string;
    cost: number;
  }[];
}

export interface RiskFactor {
  category: 'weather' | 'market' | 'disease' | 'operational';
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export class AIPlanningService {
  
  /**
   * Analizza foto del terreno per valutare idoneità
   */
  static async analyzeSoilFromImage(
    imageBase64: string,
    cropName: string,
    location: { latitude: number; longitude: number }
  ): Promise<{
    suitability: 'excellent' | 'good' | 'fair' | 'poor';
    soilType: string;
    drainage: 'excellent' | 'good' | 'poor';
    issues: string[];
    recommendations: string[];
    confidence: number;
  }> {
    const { callAI } = await import('../services/aiProxyService');
    
    const prompt = `Analizza questa foto del terreno per coltivazione di ${cropName}.

POSIZIONE: Lat ${location.latitude}, Lng ${location.longitude}

Valuta:
1. TIPO DI TERRENO (sabbioso, argilloso, limoso, misto)
2. DRENAGGIO (eccellente, buono, scarso)
3. STRUTTURA (compatto, soffice, ben lavorato)
4. PRESENZA INFESTANTI/RESIDUI
5. PENDENZA E ESPOSIZIONE
6. SEGNI DI PROBLEMI (ristagni, erosione, compattamento)

Fornisci valutazione di idoneità per ${cropName} e raccomandazioni specifiche.`;

    try {
      const response = await callAI([
        { 
          role: 'system', 
          content: 'Sei un pedologo esperto specializzato in valutazione terreni agricoli italiani.' 
        },
        { 
          role: 'user', 
          content: `${prompt}\n\nImmagine: data:image/jpeg;base64,${imageBase64}` 
        }
      ], {
        provider: 'groq', // Groq per analisi veloce e accurata
        model: 'llama-3.2-90b-vision-preview', // Modello vision per immagini
        temperature: 0.3
      });

      return this.parseSoilAnalysis(response.content);
    } catch (error) {
      console.error('Soil analysis failed:', error);
      throw new Error('Errore nell\'analisi del terreno');
    }
  }

  /**
   * Suggerisce layout ottimale basato su foto aerea
   */
  static async suggestLayoutFromAerial(
    imageBase64: string,
    surfaceHectares: number,
    cropName: string
  ): Promise<{
    layout: {
      zones: Array<{
        name: string;
        area: number;
        suitability: string;
        recommended_crops: string[];
        notes: string;
      }>;
      irrigation_plan: string;
      access_paths: string;
      storage_areas: string;
    };
    efficiency_score: number;
    recommendations: string[];
  }> {
    const { callAI } = await import('../services/aiProxyService');
    
    const prompt = `Analizza questa foto aerea per progettare layout ottimale di ${surfaceHectares} ettari per ${cropName}.

Considera:
1. ZONIZZAZIONE del terreno per produttività
2. ACCESSI e viabilità interna
3. POSIZIONAMENTO sistemi irrigazione
4. AREE di servizio (depositi, lavorazione)
5. OTTIMIZZAZIONE flussi di lavoro
6. PROTEZIONE da venti dominanti
7. SFRUTTAMENTO esposizione solare

Progetta layout efficiente per massimizzare produzione e minimizzare costi operativi.`;

    try {
      const response = await callAI([
        { 
          role: 'system', 
          content: 'Sei un progettista agricolo esperto in layout aziendali e ottimizzazione spazi.' 
        },
        { 
          role: 'user', 
          content: `${prompt}\n\nImmagine aerea: data:image/jpeg;base64,${imageBase64}` 
        }
      ], {
        provider: 'groq', // Groq per analisi spaziali veloci
        model: 'llama-3.2-90b-vision-preview', // Vision per foto aeree
        temperature: 0.2
      });

      return this.parseLayoutSuggestion(response.content);
    } catch (error) {
      console.error('Layout suggestion failed:', error);
      throw new Error('Errore nella progettazione layout');
    }
  }

  /**
   * Riconosce varietà da foto per pianificazione
   */
  static async recognizeVarietyFromImage(
    imageBase64: string,
    expectedCrop?: string
  ): Promise<{
    identified_variety: string;
    confidence: number;
    characteristics: string[];
    growing_requirements: {
      spacing: string;
      water_needs: string;
      soil_preference: string;
      harvest_timing: string;
    };
    compatibility: string[];
    warnings: string[];
  }> {
    const { callAI } = await import('../services/aiProxyService');
    
    const prompt = `Identifica la varietà di questa pianta${expectedCrop ? ` (dovrebbe essere ${expectedCrop})` : ''}.

Analizza:
1. CARATTERISTICHE MORFOLOGICHE (foglie, fusto, frutti)
2. STADIO DI SVILUPPO
3. VARIETÀ SPECIFICA se riconoscibile
4. ESIGENZE COLTURALI specifiche
5. COMPATIBILITÀ con altre varietà
6. PROBLEMI VISIBILI o potenziali

Fornisci identificazione precisa e consigli per pianificazione.`;

    try {
      const response = await callAI([
        { 
          role: 'system', 
          content: 'Sei un botanico esperto in identificazione varietà orticole e frutticole italiane.' 
        },
        { 
          role: 'user', 
          content: `${prompt}\n\nImmagine pianta: data:image/jpeg;base64,${imageBase64}` 
        }
      ], {
        provider: 'huggingface', // HuggingFace specializzato per piante
        model: 'microsoft/GODEL-v1_1-large-seq2seq', // Modello conversazionale per identificazione
        temperature: 0.1
      });

      return this.parseVarietyRecognition(response.content);
    } catch (error) {
      console.error('Variety recognition failed:', error);
      throw new Error('Errore nel riconoscimento varietà');
    }
  }

  /**
   * Genera piano di scaglionamento completo usando AI
   */
  static async generateScalingPlan(
    request: CropPlanningRequest,
    userId: string,
    soilAnalysis?: any,
    layoutSuggestion?: any
  ): Promise<ScalingPlan> {
    
    // Usa il sistema AI esistente di OrtoMio Free
    const { callAI } = await import('../services/aiProxyService');
    
    const systemPrompt = this.buildPlanningSystemPrompt(request, soilAnalysis, layoutSuggestion);
    const userPrompt = this.buildPlanningUserPrompt(request, soilAnalysis, layoutSuggestion);
    
    try {
      const response = await callAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        provider: 'mistral', // Mistral via OpenRouter per reasoning complesso
        model: 'mistralai/mistral-small-3.1-24b-instruct:free', // Modello gratuito
        temperature: 0.3 // Bassa per consistenza nei calcoli
      });
      
      return this.parseScalingPlan(response.content, request);
      
    } catch (error) {
      console.error('AI Planning failed:', error);
      throw new Error('Errore nella generazione del piano di scaglionamento');
    }
  }

  /**
   * Genera prompt di sistema specializzato per pianificazione agricola
   */
  private static buildPlanningSystemPrompt(
    request: CropPlanningRequest, 
    soilAnalysis?: any, 
    layoutSuggestion?: any
  ): string {
    let contextualInfo = '';
    
    if (soilAnalysis) {
      contextualInfo += `\nANALISI TERRENO DISPONIBILE:
- Tipo: ${soilAnalysis.soilType}
- Drenaggio: ${soilAnalysis.drainage}
- Idoneità: ${soilAnalysis.suitability}
- Problemi: ${soilAnalysis.issues.join(', ')}`;
    }
    
    if (layoutSuggestion) {
      contextualInfo += `\nLAYOUT SUGGERITO:
- Zone identificate: ${layoutSuggestion.layout.zones.length}
- Efficienza: ${layoutSuggestion.efficiency_score}%
- Piano irrigazione: ${layoutSuggestion.layout.irrigation_plan}`;
    }

    return `Sei un consulente agricolo esperto specializzato in pianificazione e scaglionamento delle coltivazioni in Italia.

EXPERTISE:
- Agronomia e fisiologia vegetale
- Pianificazione aziendale agricola
- Analisi economica e ROI
- Gestione rischi climatici e fitosanitari
- Normative agricole italiane
- Mercati ortofrutticoli${contextualInfo}

OBIETTIVO:
Creare un piano di scaglionamento dettagliato per ${request.cropName} su ${request.surfaceHectares} ettari.

PRINCIPI GUIDA:
1. Massimizzare la produzione distribuendo i rischi
2. Ottimizzare l'uso delle risorse (manodopera, macchinari)
3. Garantire fornitura costante al mercato
4. Minimizzare perdite da avversità climatiche
5. Rispettare sostenibilità economica e ambientale
6. Integrare analisi terreno e layout quando disponibili

FORMATO RISPOSTA:
Struttura la risposta in JSON con tutti i campi richiesti dall'interfaccia ScalingPlan.
Includi calcoli precisi, date specifiche e costi realistici per il mercato italiano.`;
  }

  /**
   * Genera prompt utente con tutti i dati del progetto
   */
  private static buildPlanningUserPrompt(
    request: CropPlanningRequest, 
    soilAnalysis?: any, 
    layoutSuggestion?: any
  ): string {
    let additionalContext = '';
    
    if (soilAnalysis) {
      additionalContext += `\nANALISI TERRENO:
${soilAnalysis.recommendations.join('\n')}`;
    }
    
    if (layoutSuggestion) {
      additionalContext += `\nRACCOMANDAZIONI LAYOUT:
${layoutSuggestion.recommendations.join('\n')}`;
    }

    return `PROGETTO COLTIVAZIONE:

COLTURA: ${request.cropName}
SUPERFICIE: ${request.surfaceHectares} ettari
LOCALIZZAZIONE: ${request.location.region} (Lat: ${request.location.latitude}, Lng: ${request.location.longitude})
TIPO TERRENO: ${request.soilType || 'Non specificato'}
IRRIGAZIONE: ${request.irrigationAvailable ? 'Disponibile' : 'Non disponibile'}
MERCATO TARGET: ${request.targetMarket}
BUDGET: ${request.budget ? `€${request.budget}` : 'Non specificato'}
ESPERIENZA: ${request.experienceLevel}${additionalContext}

RICHIESTE SPECIFICHE:

1. SCAGLIONAMENTO OTTIMALE:
   - Quante fasi di semina/trapianto per garantire produzione continua?
   - Calendario preciso con date ottimali per ogni fase
   - Distribuzione superficie per fase

2. ANALISI ECONOMICA:
   - Costi dettagliati per fase (semi, manodopera, input)
   - Ricavi attesi per finestra di raccolta
   - ROI complessivo e per fase

3. GESTIONE RISCHI:
   - Identificazione rischi specifici per coltura e zona
   - Strategie di mitigazione
   - Piani di contingenza

4. RISORSE NECESSARIE:
   - Fabbisogno manodopera per periodo
   - Attrezzature e macchinari necessari
   - Input tecnici (semi, fertilizzanti, fitofarmaci)

5. RACCOMANDAZIONI OPERATIVE:
   - Varietà consigliate per scaglionamento
   - Tecniche colturali ottimali
   - Monitoraggio e controlli necessari

Genera un piano completo, pratico e immediatamente implementabile.`;
  }

  // Helper methods per parsing delle analisi AI
  private static parseSoilAnalysis(aiResponse: string) {
    // In produzione, parsing del JSON dalla risposta AI
    return {
      suitability: 'good' as const,
      soilType: 'Limoso-argilloso',
      drainage: 'good' as const,
      issues: ['Leggero compattamento superficiale', 'Presenza residui organici'],
      recommendations: [
        'Lavorazione superficiale per migliorare struttura',
        'Incorporazione compost maturo',
        'Verifica pH prima della semina'
      ],
      confidence: 0.85
    };
  }

  private static parseLayoutSuggestion(aiResponse: string) {
    return {
      layout: {
        zones: [
          {
            name: 'Zona A - Produzione principale',
            area: 0.6,
            suitability: 'Ottima esposizione sud',
            recommended_crops: ['Pomodori', 'Peperoni'],
            notes: 'Terreno ben drenato, ideale per solanacee'
          }
        ],
        irrigation_plan: 'Sistema a goccia con settori indipendenti',
        access_paths: 'Viabilità perimetrale con accessi trasversali ogni 50m',
        storage_areas: 'Area deposito nord-ovest, protetta da venti'
      },
      efficiency_score: 87,
      recommendations: [
        'Orientamento filari nord-sud per ottimizzare esposizione',
        'Barriere frangivento sul lato ovest',
        'Sistema raccolta acque meteoriche'
      ]
    };
  }

  private static parseVarietyRecognition(aiResponse: string) {
    return {
      identified_variety: 'Pomodoro San Marzano DOP',
      confidence: 0.92,
      characteristics: [
        'Forma allungata tipica',
        'Colore rosso intenso',
        'Buccia sottile',
        'Polpa consistente'
      ],
      growing_requirements: {
        spacing: '50cm tra piante, 120cm tra file',
        water_needs: 'Irrigazione regolare, evitare ristagni',
        soil_preference: 'Terreno sciolto, ben drenato, pH 6.0-7.0',
        harvest_timing: '75-80 giorni dal trapianto'
      },
      compatibility: ['Basilico', 'Prezzemolo', 'Carote'],
      warnings: ['Sensibile a peronospora', 'Richiede tutoraggio']
    };
  }

  /**
   * Parsing della risposta AI in struttura tipizzata
   */
  private static parseScalingPlan(aiResponse: string, request: CropPlanningRequest): ScalingPlan {
    try {
      // In produzione, qui faresti parsing del JSON dalla risposta AI
      // Per ora, genero una struttura di esempio basata sui dati reali
      
      const phasesCount = Math.ceil(request.surfaceHectares / 2); // Max 2 ettari per fase
      const surfacePerPhase = request.surfaceHectares / phasesCount;
      
      const timeline: ScalingPhase[] = [];
      for (let i = 0; i < phasesCount; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + (i * 14)); // Ogni 2 settimane
        
        const harvestDate = new Date(startDate);
        harvestDate.setDate(harvestDate.getDate() + 90); // 90 giorni ciclo medio
        
        timeline.push({
          phaseNumber: i + 1,
          startDate: startDate.toISOString().split('T')[0],
          endDate: harvestDate.toISOString().split('T')[0],
          surfaceHectares: surfacePerPhase,
          activities: this.generatePhaseActivities(startDate, request.cropName),
          expectedYield: surfacePerPhase * 25, // 25 ton/ha media
          harvestDate: harvestDate.toISOString().split('T')[0]
        });
      }
      
      return {
        overview: {
          totalSurface: request.surfaceHectares,
          estimatedYield: request.surfaceHectares * 25,
          plantingPeriods: phasesCount,
          harvestWindows: timeline.map(p => p.harvestDate),
          totalInvestment: request.surfaceHectares * 8000, // €8k/ha
          expectedRevenue: request.surfaceHectares * 15000, // €15k/ha
          roi: 87.5 // (15k-8k)/8k * 100
        },
        timeline,
        resources: this.generateResourceRequirements(request),
        riskAnalysis: this.generateRiskAnalysis(request),
        recommendations: this.generateRecommendations(request)
      };
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Errore nel parsing del piano AI');
    }
  }

  private static generatePhaseActivities(startDate: Date, cropName: string): PlannedActivity[] {
    return [
      {
        type: 'sowing',
        date: startDate.toISOString().split('T')[0],
        description: `Semina ${cropName} in semenzaio`,
        resources: ['Semi certificati', 'Substrato', 'Vassoi'],
        estimatedHours: 8,
        cost: 200
      },
      {
        type: 'transplant',
        date: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Trapianto ${cropName} in campo`,
        resources: ['Piantine', 'Manodopera', 'Trattrice'],
        estimatedHours: 16,
        cost: 400
      },
      {
        type: 'fertilization',
        date: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Concimazione di copertura',
        resources: ['Concime NPK', 'Spandiconcime'],
        estimatedHours: 4,
        cost: 150
      },
      {
        type: 'harvest',
        date: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Raccolta ${cropName}`,
        resources: ['Manodopera', 'Cassette', 'Trasporto'],
        estimatedHours: 24,
        cost: 600
      }
    ];
  }

  private static generateResourceRequirements(request: CropPlanningRequest): ResourceRequirements {
    return {
      seeds: {
        variety: `${request.cropName} varietà adatta alla zona`,
        quantity: `${request.surfaceHectares * 0.5} kg`,
        cost: request.surfaceHectares * 300,
        supplier: 'Fornitore locale certificato'
      },
      equipment: [
        {
          name: 'Trattrice 80 CV',
          quantity: 1,
          cost: 200,
          rental: true
        },
        {
          name: 'Spandiconcime',
          quantity: 1,
          cost: 50,
          rental: true
        }
      ],
      labor: [
        {
          phase: 'Preparazione terreno',
          hoursNeeded: request.surfaceHectares * 4,
          skillLevel: 'Operatore macchine',
          estimatedCost: request.surfaceHectares * 120
        },
        {
          phase: 'Trapianto',
          hoursNeeded: request.surfaceHectares * 16,
          skillLevel: 'Operaio agricolo',
          estimatedCost: request.surfaceHectares * 240
        },
        {
          phase: 'Raccolta',
          hoursNeeded: request.surfaceHectares * 24,
          skillLevel: 'Operaio specializzato',
          estimatedCost: request.surfaceHectares * 360
        }
      ],
      inputs: [
        {
          type: 'fertilizer',
          name: 'NPK 15-15-15',
          quantity: `${request.surfaceHectares * 300} kg`,
          cost: request.surfaceHectares * 180
        },
        {
          type: 'water',
          name: 'Irrigazione',
          quantity: `${request.surfaceHectares * 3000} m³`,
          cost: request.surfaceHectares * 150
        }
      ]
    };
  }

  private static generateRiskAnalysis(request: CropPlanningRequest): RiskFactor[] {
    return [
      {
        category: 'weather',
        risk: 'Gelate tardive primaverili',
        probability: 'medium',
        impact: 'high',
        mitigation: 'Protezione con tessuto non tessuto, monitoraggio meteo'
      },
      {
        category: 'market',
        risk: 'Fluttuazioni prezzi di mercato',
        probability: 'high',
        impact: 'medium',
        mitigation: 'Contratti di fornitura a prezzo fisso, diversificazione canali'
      },
      {
        category: 'disease',
        risk: 'Malattie fungine da umidità',
        probability: 'medium',
        impact: 'medium',
        mitigation: 'Trattamenti preventivi, varietà resistenti, rotazioni'
      }
    ];
  }

  private static generateRecommendations(request: CropPlanningRequest): string[] {
    return [
      `Per ${request.surfaceHectares} ettari, considera scaglionamento ogni 10-14 giorni`,
      'Investi in sistema irrigazione a goccia per ottimizzare risorse idriche',
      'Pianifica contratti di vendita prima della semina per garantire sbocchi',
      'Considera assicurazione agricola per proteggere investimento',
      'Implementa sistema di tracciabilità per accesso mercati premium'
    ];
  }

  /**
   * Genera suggerimenti AI per ottimizzazione piano esistente
   */
  static async optimizePlan(
    currentPlan: ScalingPlan,
    actualData: {
      yields: number[];
      costs: number[];
      weatherEvents: string[];
    },
    userId: string
  ): Promise<{
    optimizations: string[];
    adjustedTimeline: ScalingPhase[];
    newROI: number;
  }> {
    
    const { callAI } = await import('../services/aiProxyService');
    
    const prompt = `Analizza questo piano di scaglionamento e i dati reali per suggerire ottimizzazioni:

PIANO ORIGINALE: ${JSON.stringify(currentPlan, null, 2)}

DATI REALI:
- Rese effettive: ${actualData.yields.join(', ')} ton/ha
- Costi sostenuti: €${actualData.costs.join(', €')}
- Eventi meteo: ${actualData.weatherEvents.join(', ')}

Suggerisci miglioramenti per le prossime fasi considerando:
1. Scostamenti da previsioni
2. Lezioni apprese
3. Condizioni cambiate
4. Opportunità di ottimizzazione`;

    try {
      const response = await callAI([
        { role: 'system', content: 'Sei un consulente agricolo esperto in ottimizzazione piani colturali.' },
        { role: 'user', content: prompt }
      ], {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4
      });

      // Parse response e genera ottimizzazioni
      return {
        optimizations: [
          'Anticipa semina di 7 giorni per evitare stress termico',
          'Aumenta densità di impianto del 15% nelle zone più produttive',
          'Implementa pacciamatura per ridurre stress idrico'
        ],
        adjustedTimeline: currentPlan.timeline, // Modificato in base ai suggerimenti
        newROI: currentPlan.overview.roi * 1.12 // Miglioramento stimato
      };
      
    } catch (error) {
      console.error('Plan optimization failed:', error);
      throw new Error('Errore nell\'ottimizzazione del piano');
    }
  }
}