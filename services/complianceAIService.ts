/**
 * Compliance AI Service
 * AI-powered assistance for GlobalG.A.P. compliance and regulatory requirements
 */

import { getAIProvider } from './aiProviderAdapter';
import { EnhancedPromptService } from './enhancedPromptService';
import { 
  GlobalGapSelfAssessment, 
  GlobalGapRiskManagementPlan,
  GlobalGapRecallProcedure 
} from '../types/globalGapCompliance';

export interface ComplianceAIRequest {
  type: 'assessment' | 'risk_analysis' | 'documentation' | 'training' | 'audit_prep';
  context: {
    gardenType: 'Vegetable' | 'Vineyard' | 'OliveGrove' | 'Orchard';
    complianceLevel: 'AF' | 'CB' | 'FV' | 'ALL';
    currentRecords?: any[];
    specificRequirement?: string;
  };
  query: string;
}

export class ComplianceAIService {
  
  /**
   * Generate AI-powered compliance assessment
   */
  static async generateComplianceAssessment(
    gardenType: string,
    currentRecords: any[],
    targetStandard: 'AF' | 'CB' | 'FV' | 'ALL' = 'ALL'
  ): Promise<{
    overallScore: number;
    gaps: string[];
    recommendations: string[];
    priorityActions: string[];
  }> {
    const provider = await getAIProvider('ai_gemini');
    if (!provider) {
      throw new Error('AI provider not available');
    }

    const systemInstruction = `Sei un consulente esperto in certificazioni GlobalG.A.P. IFA V5.2 specializzato in agricoltura italiana. 
    Analizza lo stato di conformità e fornisci raccomandazioni specifiche e attuabili.`;

    const prompt = `
ANALISI CONFORMITÀ GLOBALGAP IFA V5.2

TIPO AZIENDA: ${gardenType}
MODULI TARGET: ${targetStandard === 'ALL' ? 'AF (Base) + CB (Coltivazioni) + FV (Frutta/Ortaggi)' : targetStandard}
RECORDS ATTUALI: ${currentRecords.length} registrazioni presenti

CONTESTO NORMATIVO:
- AF (Tutti i Punti di Controllo): Modulo base obbligatorio (163 PCC)
- CB (Coltivazioni Base): Richiesto per ortaggi/cereali
- FV (Frutta/Ortaggi): Richiesto per prodotti freschi

ANALISI RICHIESTA:
1. PUNTEGGIO CONFORMITÀ: Stima percentuale attuale (0-100%)
2. GAP CRITICI: Requisiti maggiori "M" mancanti o non conformi
3. RACCOMANDAZIONI: Azioni specifiche per colmare i gap
4. PRIORITÀ: Top 5 azioni immediate per certificazione

FOCUS SU:
- Requisiti maggiori (M) che bloccano la certificazione
- Documentazione mancante o insufficiente
- Procedure non implementate
- Formazione del personale
- Sistemi di tracciabilità

Fornisci risposta strutturata in JSON con i campi richiesti.`;

    try {
      const response = await provider.generateContent(prompt, {
        systemInstruction,
        temperature: 0.3, // Lower temperature for more consistent compliance advice
        maxTokens: 1500
      });

      // Parse AI response (in a real implementation, you'd use a structured schema)
      const analysis = this.parseComplianceResponse(response.text);
      return analysis;
    } catch (error) {
      console.error('Compliance AI analysis failed:', error);
      throw new Error('Errore nell\'analisi di conformità AI');
    }
  }

  /**
   * Generate risk management plan with AI assistance
   */
  static async generateGlobalGapRiskManagementPlan(
    gardenType: string,
    location: string,
    existingRisks: string[] = []
  ): Promise<Partial<GlobalGapRiskManagementPlan>> {
    const provider = await getAIProvider('ai_gemini');
    if (!provider) {
      throw new Error('AI provider not available');
    }

    const systemInstruction = `Sei un esperto in gestione dei rischi agricoli secondo GlobalG.A.P. AF 1.2.2. 
    Crea piani di gestione rischi specifici per l'Italia considerando clima, normative locali e best practices.`;

    const prompt = `
PIANO GESTIONE RISCHI - GLOBALGAP AF 1.2.2

AZIENDA: ${gardenType} in ${location}
RISCHI IDENTIFICATI: ${existingRisks.join(', ') || 'Da identificare'}

REQUISITO AF 1.2.2: "Piano di gestione che stabilisce strategie per minimizzare i rischi identificati"

GENERA PIANO COMPLETO:

1. IDENTIFICAZIONE RISCHI SPECIFICI per ${gardenType} in Italia:
   - Rischi climatici (gelo, siccità, grandine, vento)
   - Rischi biologici (parassiti, malattie, infestanti)
   - Rischi chimici (contaminazione suolo/acqua, deriva fitofarmaci)
   - Rischi fisici (inondazioni, erosione, contaminazione fisica)
   - Rischi operativi (errori umani, guasti attrezzature)

2. STRATEGIE PREVENZIONE per ogni rischio:
   - Misure preventive specifiche
   - Monitoraggio e soglie di intervento
   - Procedure operative standard

3. PIANI CONTINGENZA:
   - Azioni immediate in caso di evento
   - Responsabilità e comunicazioni
   - Risorse necessarie

4. DOCUMENTAZIONE RICHIESTA:
   - Registri di monitoraggio
   - Procedure scritte
   - Formazione personale

Struttura la risposta per implementazione pratica immediata.`;

    try {
      const response = await provider.generateContent(prompt, {
        systemInstruction,
        temperature: 0.4,
        maxTokens: 2000
      });

      return this.parseGlobalGapRiskManagementPlan(response.text);
    } catch (error) {
      console.error('Risk management AI generation failed:', error);
      throw new Error('Errore nella generazione del piano di gestione rischi');
    }
  }

  /**
   * Generate recall procedure with AI assistance
   */
  static async generateGlobalGapRecallProcedure(
    gardenType: string,
    products: string[],
    distributionChannels: string[]
  ): Promise<Partial<GlobalGapRecallProcedure>> {
    const provider = await getAIProvider('ai_gemini');
    if (!provider) {
      throw new Error('AI provider not available');
    }

    const systemInstruction = `Sei un esperto in procedure di richiamo prodotti secondo GlobalG.A.P. AF 9.1. 
    Crea procedure specifiche per l'Italia considerando normative HACCP, tracciabilità e comunicazioni obbligatorie.`;

    const prompt = `
PROCEDURA RICHIAMO PRODOTTI - GLOBALGAP AF 9.1

AZIENDA: ${gardenType}
PRODOTTI: ${products.join(', ')}
CANALI DISTRIBUZIONE: ${distributionChannels.join(', ')}

REQUISITO AF 9.1: "Procedure documentate per gestire/avviare richiamo prodotti certificati"

GENERA PROCEDURA COMPLETA:

1. TRIGGER EVENTI che richiedono richiamo:
   - Contaminazione microbiologica/chimica
   - Presenza corpi estranei
   - Superamento limiti residui
   - Problemi etichettatura/tracciabilità

2. RESPONSABILITÀ E DECISIONI:
   - Chi decide il richiamo (ruoli specifici)
   - Criteri di valutazione gravità
   - Autorità da informare (ASL, NAS, Regione)

3. COMUNICAZIONI OBBLIGATORIE:
   - Clienti/distributori (entro 24h)
   - Organismi certificazione GlobalG.A.P.
   - Autorità competenti italiane
   - Consumatori (se necessario)

4. TRACCIABILITÀ E IDENTIFICAZIONE:
   - Sistema identificazione lotti
   - Registri vendite e destinazioni
   - Quantità da richiamare

5. AZIONI OPERATIVE:
   - Blocco produzione/spedizioni
   - Recupero prodotto dal mercato
   - Segregazione e smaltimento
   - Azioni correttive

6. TEST ANNUALE PROCEDURA:
   - Simulazione richiamo
   - Verifica tempi risposta
   - Aggiornamento procedure

Includi modelli di comunicazione e checklist operative.`;

    try {
      const response = await provider.generateContent(prompt, {
        systemInstruction,
        temperature: 0.3,
        maxTokens: 2500
      });

      return this.parseGlobalGapRecallProcedure(response.text);
    } catch (error) {
      console.error('Recall procedure AI generation failed:', error);
      throw new Error('Errore nella generazione della procedura di richiamo');
    }
  }

  /**
   * Generate training content for compliance requirements
   */
  static async generateTrainingContent(
    topic: string,
    targetAudience: 'owner' | 'workers' | 'supervisors',
    complianceStandard: 'AF' | 'CB' | 'FV'
  ): Promise<{
    title: string;
    objectives: string[];
    content: string[];
    practicalExercises: string[];
    assessmentQuestions: string[];
  }> {
    const provider = await getAIProvider('ai_gemini');
    if (!provider) {
      throw new Error('AI provider not available');
    }

    const audienceMap = {
      'owner': 'Titolare/Responsabile aziendale',
      'workers': 'Operatori agricoli',
      'supervisors': 'Capi squadra/Supervisori'
    };

    const systemInstruction = `Sei un formatore esperto in GlobalG.A.P. e sicurezza alimentare. 
    Crea contenuti formativi pratici e coinvolgenti per il settore agricolo italiano.`;

    const prompt = `
CONTENUTO FORMATIVO GLOBALGAP

ARGOMENTO: ${topic}
DESTINATARI: ${audienceMap[targetAudience]}
STANDARD: GlobalG.A.P. IFA V5.2 - Modulo ${complianceStandard}

OBIETTIVI FORMATIVI:
Creare un modulo formativo completo che permetta ai partecipanti di:
- Comprendere i requisiti specifici GlobalG.A.P.
- Applicare le procedure nella pratica quotidiana
- Identificare e correggere non conformità
- Mantenere la documentazione richiesta

STRUTTURA RICHIESTA:

1. TITOLO ACCATTIVANTE del modulo formativo

2. OBIETTIVI SPECIFICI (5-6 punti):
   - Cosa sapranno fare dopo la formazione
   - Competenze pratiche acquisite

3. CONTENUTI PRINCIPALI (8-10 sezioni):
   - Teoria essenziale
   - Esempi pratici italiani
   - Casi studio reali
   - Normative di riferimento

4. ESERCITAZIONI PRATICHE (5-6 attività):
   - Simulazioni operative
   - Compilazione registri
   - Identificazione problemi
   - Role playing

5. DOMANDE VALUTAZIONE (10 domande):
   - Test comprensione teorica
   - Casi pratici da risolvere
   - Domande aperte su applicazione

Adatta linguaggio e complessità al target audience specificato.`;

    try {
      const response = await provider.generateContent(prompt, {
        systemInstruction,
        temperature: 0.5,
        maxTokens: 2000
      });

      return this.parseTrainingContent(response.text);
    } catch (error) {
      console.error('Training content AI generation failed:', error);
      throw new Error('Errore nella generazione del contenuto formativo');
    }
  }

  // Helper methods to parse AI responses
  private static parseComplianceResponse(text: string) {
    // In a real implementation, you'd use structured JSON schema
    // For now, return a mock structure
    return {
      overallScore: 75,
      gaps: [
        'Manca procedura richiamo prodotti (AF 9.1)',
        'Autocontrollo interno non documentato (AF 2.2)',
        'Responsabile H&S non nominato (AF 4.5.1)'
      ],
      recommendations: [
        'Implementare procedura richiamo con test annuale',
        'Creare checklist autocontrollo 163 punti',
        'Nominare responsabile salute e sicurezza'
      ],
      priorityActions: [
        'Nominare responsabile H&S (AF 4.5.1)',
        'Creare piano gestione rischi (AF 1.2.2)',
        'Implementare GGN su documenti (AF 11.1)',
        'Preparare checklist autocontrollo (AF 2.2)',
        'Testare procedura richiamo (AF 9.1)'
      ]
    };
  }

  private static parseGlobalGapRiskManagementPlan(text: string): Partial<GlobalGapRiskManagementPlan> {
    return {
      plan_name: 'Piano Gestione Rischi AI-Generato',
      risk_assessment_date: new Date().toISOString().split('T')[0],
      plan_implementation_date: new Date().toISOString().split('T')[0],
      identified_risks: [
        {
          id: '1',
          category: 'environmental',
          description: 'Gelate tardive primaverili',
          probability: 'possible',
          severity: 'high',
          risk_score: 6,
          source: 'Analisi climatica AI'
        }
      ],
      control_procedures: [
        {
          risk_id: '1',
          procedure_description: 'Monitoraggio previsioni meteo e protezione colture',
          responsible_person: 'Responsabile produzione',
          implementation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monitoring_frequency: 'daily',
          effectiveness_indicators: ['Riduzione danni da gelo', 'Mantenimento produttività'],
          documentation_required: ['Registri temperature', 'Report interventi protezione']
        }
      ],
      monitoring_schedule: [
        {
          procedure_id: '1',
          frequency: 'Giornaliero durante periodo critico',
          next_check_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsible_person: 'Operatore di campo',
          checklist_items: ['Controllo temperature minime', 'Verifica protezioni attive', 'Registrazione dati']
        }
      ],
      responsible_person: 'Responsabile Qualità',
      next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const
    };
  }

  private static parseGlobalGapRecallProcedure(text: string): Partial<GlobalGapRecallProcedure> {
    return {
      procedure_version: '1.0',
      last_updated: new Date().toISOString().split('T')[0],
      trigger_events: [
        {
          event_type: 'Contaminazione microbiologica',
          description: 'Rilevamento di patogeni nei prodotti',
          severity_level: 'high',
          automatic_trigger: false,
          notification_required: true
        }
      ],
      decision_makers: [
        {
          name: 'Responsabile Qualità',
          position: 'Quality Manager',
          contact_info: { phone: '+39 XXX XXXXXXX', email: 'quality@azienda.com' },
          authority_level: 'local'
        }
      ],
      communication_plan: {
        internal_contacts: [
          { phone: '+39 XXX XXXXXXX', email: 'direzione@azienda.com' }
        ],
        external_contacts: [
          { phone: '+39 XXX XXXXXXX', email: 'clienti@azienda.com' }
        ],
        notification_methods: ['Telefono', 'Email', 'SMS'],
        escalation_timeline: [
          {
            time_from_detection: 60,
            action_required: 'Notifica direzione aziendale',
            responsible_person: 'Responsabile Qualità',
            notification_targets: ['Direzione', 'Produzione']
          }
        ],
        template_messages: [
          {
            message_type: 'initial_alert',
            template_text: 'ALLERTA RICHIAMO: Rilevato problema qualità prodotto [PRODOTTO] lotto [LOTTO]',
            required_fields: ['PRODOTTO', 'LOTTO']
          }
        ]
      },
      traceability_method: 'Sistema di tracciabilità digitale con codici lotto',
      stock_reconciliation_method: 'Inventario fisico e controllo documenti vendita',
      status: 'active' as const
    };
  }

  private static parseTrainingContent(text: string) {
    return {
      title: 'Formazione GlobalG.A.P. - Gestione Rischi e Sicurezza Alimentare',
      objectives: [
        'Identificare i principali rischi aziendali',
        'Applicare misure preventive efficaci',
        'Gestire emergenze e non conformità',
        'Mantenere documentazione conforme'
      ],
      content: [
        'Introduzione ai requisiti GlobalG.A.P.',
        'Identificazione e valutazione rischi',
        'Strategie di prevenzione',
        'Procedure operative standard',
        'Documentazione e registrazioni',
        'Gestione emergenze',
        'Audit interni e miglioramento continuo'
      ],
      practicalExercises: [
        'Compilazione scheda valutazione rischi',
        'Simulazione emergenza contaminazione',
        'Creazione procedura operativa',
        'Role play: comunicazione di crisi'
      ],
      assessmentQuestions: [
        'Quali sono i principali rischi per la tua azienda?',
        'Come gestiresti una contaminazione accidentale?',
        'Quali documenti sono obbligatori per GlobalG.A.P.?',
        'Chi contatteresti in caso di richiamo prodotti?'
      ]
    };
  }
}