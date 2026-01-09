/**
 * Irrigation Templates
 * Template predefiniti per configurazione rapida zone irrigue
 */

import { IrrigationTemplate } from '../types/irrigation';

export const irrigationTemplates: IrrigationTemplate[] = [
  {
    id: 'dripline-bed',
    name: 'Aiuola a Goccia',
    icon: '💧',
    description: 'Ala gocciolante per aiuole orto',
    method: 'Dripline',
    defaultFlowRateLph: 0, // Calcolato dinamicamente: passo 30cm, 2L/h → 6.67 L/h per metro
    typicalUse: ['Orto aiuole', 'Serra'],
    components: [
      { 
        type: 'Dripline', 
        defaultDripperSpacing: 30, // cm
        defaultFlowRate: 2 // L/h per goccia
        // L/h per metro = 2 / 0.30 = 6.67
      }
    ]
  },
  {
    id: 'drippers-vegetable',
    name: 'Orto con Gocciolatori',
    icon: '🟦',
    description: 'Gocciolatori puntuali per orto',
    method: 'Drippers',
    defaultFlowRateLph: 0, // Calcolato dinamicamente
    typicalUse: ['Orto'],
    components: [
      { 
        type: 'Dripper', 
        defaultFlowRate: 4 // L/h per gocciolatore (molto comune)
      }
    ]
  },
  {
    id: 'drippers-orchard',
    name: 'Frutteto Base',
    icon: '🌳',
    description: '2-4 gocciolatori per pianta',
    method: 'Drippers',
    defaultFlowRateLph: 0, // Calcolato dinamicamente: 4 dripper per pianta × 4L/h
    typicalUse: ['Frutteto'],
    components: [
      { 
        type: 'Dripper', 
        defaultQuantity: 4, // dripper per pianta
        defaultFlowRate: 4 // L/h per dripper
      }
    ]
  },
  {
    id: 'micro-sprinkler',
    name: 'Micro-Sprinkler',
    icon: '🌧️',
    description: 'Irrigatori sottochioma',
    method: 'MicroSprinkler',
    defaultFlowRateLph: 0, // Calcolato dinamicamente
    typicalUse: ['Frutteto', 'Oliveto'],
    components: [
      { 
        type: 'MicroSprinkler', 
        defaultFlowRate: 40 // L/h per irrigatore (default 35-60, metto 40)
      }
    ]
  }
];

/**
 * Ottieni template per ID
 */
export function getIrrigationTemplate(id: string): IrrigationTemplate | undefined {
  return irrigationTemplates.find(t => t.id === id);
}

/**
 * Ottieni template per metodo
 */
export function getTemplatesByMethod(method: IrrigationTemplate['method']): IrrigationTemplate[] {
  return irrigationTemplates.filter(t => t.method === method);
}

/**
 * Ottieni tutti i template
 */
export function getAllIrrigationTemplates(): IrrigationTemplate[] {
  return irrigationTemplates;
}

