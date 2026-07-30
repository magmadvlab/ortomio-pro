/**
 * Compliance AI Service
 * AI-powered assistance for GlobalG.A.P. compliance and regulatory requirements
 */

import { getAIProvider } from './aiProviderAdapter';
import type { CreditFeature } from '@/lib/credits';
import type {
  GlobalGapRiskManagementPlan,
  GlobalGapRecallProcedure,
  RiskItem,
  ControlProcedure,
  MonitoringSchedule,
  TriggerEvent,
  DecisionMaker,
  EscalationStep,
  TemplateMessage
} from '../types/globalGapCompliance';

export interface ComplianceAIRequest {
  type: 'assessment' | 'risk_analysis' | 'documentation' | 'training' | 'audit_prep';
  context: {
    gardenType: string;
    complianceLevel: 'AF' | 'CB' | 'FV' | 'ALL';
    currentRecords?: any[];
    specificRequirement?: string;
  };
  query: string;
}

export interface ComplianceAssessmentResult {
  overallScore: number;
  gaps: string[];
  recommendations: string[];
  priorityActions: string[];
}

export interface TrainingContentResult {
  title: string;
  objectives: string[];
  content: string[];
  practicalExercises: string[];
  assessmentQuestions: string[];
}

/**
 * Calls the active AI provider with a JSON schema and returns the parsed
 * response. Uses the client-side custom provider when configured, otherwise
 * falls back to the credit-gated server route `/api/ai/generate`.
 */
async function generateStructured<T>(
  prompt: string,
  schema: Record<string, unknown>,
  systemInstruction: string,
  feature: CreditFeature,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<T> {
  const provider = await getAIProvider('ai_gemini');

  let text: string;
  if (provider?.generateContentWithSchema) {
    const response = await provider.generateContentWithSchema(prompt, schema, {
      systemInstruction,
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });
    text = response.text;
  } else {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          systemInstruction,
          temperature: options.temperature
        }
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || error.error || 'Richiesta AI non riuscita');
    }

    const data = await response.json();
    text = data.text;
  }

  if (!text) {
    throw new Error('Risposta AI vuota');
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('La risposta AI non era in un formato JSON valido');
  }
}

const assessmentSchema = {
  type: 'object',
  properties: {
    overallScore: { type: 'number', description: 'Stima percentuale di conformità, 0-100' },
    gaps: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
    priorityActions: { type: 'array', items: { type: 'string' } }
  },
  required: ['overallScore', 'gaps', 'recommendations', 'priorityActions']
};

const riskManagementPlanSchema = {
  type: 'object',
  properties: {
    plan_name: { type: 'string' },
    identified_risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['environmental', 'contamination', 'physical', 'biological', 'chemical'] },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          probability: { type: 'string', enum: ['unlikely', 'possible', 'likely', 'certain'] },
          source: { type: 'string' }
        },
        required: ['category', 'description', 'severity', 'probability', 'source']
      }
    },
    control_procedures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          procedure_description: { type: 'string' },
          responsible_person: { type: 'string' },
          monitoring_frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'] },
          effectiveness_indicators: { type: 'array', items: { type: 'string' } },
          documentation_required: { type: 'array', items: { type: 'string' } }
        },
        required: ['procedure_description', 'responsible_person', 'monitoring_frequency', 'effectiveness_indicators', 'documentation_required']
      }
    }
  },
  required: ['plan_name', 'identified_risks', 'control_procedures']
};

const recallProcedureSchema = {
  type: 'object',
  properties: {
    trigger_events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          event_type: { type: 'string' },
          description: { type: 'string' },
          severity_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          automatic_trigger: { type: 'boolean' },
          notification_required: { type: 'boolean' }
        },
        required: ['event_type', 'description', 'severity_level', 'automatic_trigger', 'notification_required']
      }
    },
    decision_makers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'string' },
          authority_level: { type: 'string', enum: ['local', 'regional', 'national', 'international'] }
        },
        required: ['position', 'authority_level']
      }
    },
    escalation_timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          time_from_detection: { type: 'number', description: 'Minuti dalla rilevazione' },
          action_required: { type: 'string' },
          responsible_person: { type: 'string' },
          notification_targets: { type: 'array', items: { type: 'string' } }
        },
        required: ['time_from_detection', 'action_required', 'responsible_person', 'notification_targets']
      }
    },
    template_messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message_type: { type: 'string', enum: ['initial_alert', 'customer_notification', 'authority_report', 'all_clear'] },
          template_text: { type: 'string' },
          required_fields: { type: 'array', items: { type: 'string' } }
        },
        required: ['message_type', 'template_text', 'required_fields']
      }
    },
    traceability_method: { type: 'string' },
    stock_reconciliation_method: { type: 'string' }
  },
  required: ['trigger_events', 'decision_makers', 'escalation_timeline', 'template_messages', 'traceability_method', 'stock_reconciliation_method']
};

const trainingContentSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    objectives: { type: 'array', items: { type: 'string' } },
    content: { type: 'array', items: { type: 'string' } },
    practicalExercises: { type: 'array', items: { type: 'string' } },
    assessmentQuestions: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'objectives', 'content', 'practicalExercises', 'assessmentQuestions']
};

export class ComplianceAIService {

  /**
   * Generate AI-powered compliance assessment
   */
  static async generateComplianceAssessment(
    gardenType: string,
    currentRecords: any[],
    targetStandard: 'AF' | 'CB' | 'FV' | 'ALL' = 'ALL'
  ): Promise<ComplianceAssessmentResult> {
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
- Sistemi di tracciabilità`;

    try {
      return await generateStructured<ComplianceAssessmentResult>(
        prompt,
        assessmentSchema,
        systemInstruction,
        'compliance_assessment',
        { temperature: 0.3, maxTokens: 1500 }
      );
    } catch (error) {
      console.error('Compliance AI analysis failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Errore nell\'analisi di conformità AI');
    }
  }

  /**
   * Generate a risk management plan draft with AI assistance.
   * Dates, ids and cross-references are assembled locally after the AI
   * response: the model is not a reliable source for stable identifiers or
   * calendar dates, only for the substantive risk/procedure content.
   */
  static async generateGlobalGapRiskManagementPlan(
    gardenType: string,
    location: string,
    existingRisks: string[] = []
  ): Promise<Partial<GlobalGapRiskManagementPlan>> {
    const systemInstruction = `Sei un esperto in gestione dei rischi agricoli secondo GlobalG.A.P. AF 1.2.2.
    Crea piani di gestione rischi specifici per l'Italia considerando clima, normative locali e best practices.`;

    const prompt = `
PIANO GESTIONE RISCHI - GLOBALGAP AF 1.2.2

AZIENDA: ${gardenType} in ${location}
RISCHI IDENTIFICATI: ${existingRisks.join(', ') || 'Da identificare'}

REQUISITO AF 1.2.2: "Piano di gestione che stabilisce strategie per minimizzare i rischi identificati"

GENERA:
1. Un elenco di rischi specifici per ${gardenType} in ${location || 'Italia'} (climatici, biologici, chimici, fisici, operativi)
2. Per ciascun rischio, una procedura di controllo con misure preventive, monitoraggio e documentazione richiesta

Sii concreto e specifico per il contesto agricolo italiano, non generico.`;

    const raw = await generateStructured<{
      plan_name: string;
      identified_risks: Array<Omit<RiskItem, 'id' | 'risk_score'>>;
      control_procedures: Array<Omit<ControlProcedure, 'risk_id' | 'implementation_date'>>;
    }>(
      prompt,
      riskManagementPlanSchema,
      systemInstruction,
      'compliance_risk_plan',
      { temperature: 0.4, maxTokens: 2000 }
    );

    const severityWeight: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const probabilityWeight: Record<string, number> = { unlikely: 1, possible: 2, likely: 3, certain: 4 };

    const identifiedRisks: RiskItem[] = raw.identified_risks.map((risk, index) => ({
      ...risk,
      id: `ai-risk-${index + 1}`,
      risk_score: (severityWeight[risk.severity] || 1) * (probabilityWeight[risk.probability] || 1)
    }));

    const implementationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const controlProcedures: ControlProcedure[] = raw.control_procedures.map((procedure, index) => ({
      ...procedure,
      risk_id: identifiedRisks[index]?.id || identifiedRisks[0]?.id || 'ai-risk-1',
      implementation_date: implementationDate
    }));

    const monitoringSchedule: MonitoringSchedule[] = controlProcedures.map((procedure, index) => ({
      procedure_id: `${procedure.risk_id}-procedure-${index + 1}`,
      frequency: procedure.monitoring_frequency,
      next_check_date: implementationDate,
      responsible_person: procedure.responsible_person,
      checklist_items: procedure.effectiveness_indicators
    }));

    return {
      plan_name: raw.plan_name,
      risk_assessment_date: new Date().toISOString().split('T')[0],
      plan_implementation_date: implementationDate,
      identified_risks: identifiedRisks,
      control_procedures: controlProcedures,
      monitoring_schedule: monitoringSchedule,
      responsible_person: '',
      next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active' as const
    };
  }

  /**
   * Generate a recall procedure draft with AI assistance. Contact details
   * (phone/email) are never invented by the model and are left blank for
   * the user to fill in the form.
   */
  static async generateGlobalGapRecallProcedure(
    gardenType: string,
    products: string[],
    distributionChannels: string[]
  ): Promise<Partial<GlobalGapRecallProcedure>> {
    const systemInstruction = `Sei un esperto in procedure di richiamo prodotti secondo GlobalG.A.P. AF 9.1.
    Crea procedure specifiche per l'Italia considerando normative HACCP, tracciabilità e comunicazioni obbligatorie.`;

    const prompt = `
PROCEDURA RICHIAMO PRODOTTI - GLOBALGAP AF 9.1

AZIENDA: ${gardenType}
PRODOTTI: ${products.join(', ') || 'non specificati'}
CANALI DISTRIBUZIONE: ${distributionChannels.join(', ') || 'non specificati'}

REQUISITO AF 9.1: "Procedure documentate per gestire/avviare richiamo prodotti certificati"

GENERA:
1. Eventi scatenanti che richiedono un richiamo (contaminazione, corpi estranei, superamento limiti residui, problemi etichettatura)
2. Ruoli decisionali (posizione e livello di autorità, senza inventare nomi o contatti reali)
3. Timeline di escalation con tempi in minuti dalla rilevazione
4. Modelli di messaggio di comunicazione (allerta iniziale, notifica clienti, notifica autorità)
5. Metodo di tracciabilità e riconciliazione scorte, specifico per ${gardenType} con canali ${distributionChannels.join(', ') || 'misti'}`;

    const raw = await generateStructured<{
      trigger_events: TriggerEvent[];
      decision_makers: Array<Pick<DecisionMaker, 'position' | 'authority_level'>>;
      escalation_timeline: EscalationStep[];
      template_messages: TemplateMessage[];
      traceability_method: string;
      stock_reconciliation_method: string;
    }>(
      prompt,
      recallProcedureSchema,
      systemInstruction,
      'compliance_recall_procedure',
      { temperature: 0.3, maxTokens: 2500 }
    );

    const decisionMakers: DecisionMaker[] = raw.decision_makers.map(maker => ({
      name: '',
      position: maker.position,
      contact_info: { phone: '', email: '' },
      authority_level: maker.authority_level
    }));

    return {
      procedure_version: '1.0',
      last_updated: new Date().toISOString().split('T')[0],
      trigger_events: raw.trigger_events,
      decision_makers: decisionMakers,
      communication_plan: {
        internal_contacts: [],
        external_contacts: [],
        notification_methods: ['phone', 'email', 'sms'],
        escalation_timeline: raw.escalation_timeline,
        template_messages: raw.template_messages
      },
      traceability_method: raw.traceability_method,
      stock_reconciliation_method: raw.stock_reconciliation_method,
      status: 'active' as const
    };
  }

  /**
   * Generate training content for compliance requirements
   */
  static async generateTrainingContent(
    topic: string,
    targetAudience: 'owner' | 'workers' | 'supervisors',
    complianceStandard: 'AF' | 'CB' | 'FV'
  ): Promise<TrainingContentResult> {
    const audienceMap = {
      owner: 'Titolare/Responsabile aziendale',
      workers: 'Operatori agricoli',
      supervisors: 'Capi squadra/Supervisori'
    };

    const systemInstruction = `Sei un formatore esperto in GlobalG.A.P. e sicurezza alimentare.
    Crea contenuti formativi pratici e coinvolgenti per il settore agricolo italiano.`;

    const prompt = `
CONTENUTO FORMATIVO GLOBALGAP

ARGOMENTO: ${topic}
DESTINATARI: ${audienceMap[targetAudience]}
STANDARD: GlobalG.A.P. IFA V5.2 - Modulo ${complianceStandard}

Genera un titolo, 5-6 obiettivi formativi, 8-10 sezioni di contenuto (teoria + esempi pratici italiani + normative),
5-6 esercitazioni pratiche e 10 domande di valutazione. Adatta linguaggio e complessità al target audience.`;

    try {
      return await generateStructured<TrainingContentResult>(
        prompt,
        trainingContentSchema,
        systemInstruction,
        'compliance_training',
        { temperature: 0.5, maxTokens: 2000 }
      );
    } catch (error) {
      console.error('Training content AI generation failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Errore nella generazione del contenuto formativo');
    }
  }
}
