import { Garden, GardenTask } from '../types';
import { GardenAccessory, AccessoryCategory } from '../types/accessories';
import { PlantMasterSheet } from '../types';

/**
 * Motore logico per gestione accessori giardino (Pro Feature)
 * Calcola task automatici per manutenzione e suggerimenti
 */

export interface AccessoryTaskAdvice {
  taskType: 'Installation' | 'Maintenance' | 'Replacement' | 'Suggestion';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  accessoryId?: string;
  suggestedAccessory?: {
    category: 'Support' | 'Netting' | 'Wire' | 'Structure';
    type?: string;
    heightCm?: number;
    material?: string;
    quantity?: number;
    usedFor?: string[];
  };
}

/**
 * Calcola task per accessori giardino
 */
export const calculateAccessoryTasks = (
  garden: Garden,
  accessories: GardenAccessory[],
  currentDate: Date = new Date()
): AccessoryTaskAdvice[] => {
  const tasksAdvice: AccessoryTaskAdvice[] = [];
  const gardenAccessories = accessories.filter(a => a.gardenId === garden.id);

  for (const accessory of gardenAccessories) {
    // 1. MANUTENZIONE PROGRAMMATA
    if (accessory.lastMaintenance) {
      const daysSinceMaintenance = Math.floor(
        (currentDate.getTime() - new Date(accessory.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Manutenzione annuale per reti e strutture
      if (daysSinceMaintenance > 365 && (accessory.category === 'Netting' || accessory.category === 'Structure')) {
        tasksAdvice.push({
          taskType: 'Maintenance',
          priority: 'Medium',
          message: `Manutenzione accessorio: ${accessory.name}`,
          dueDate: currentDate.toISOString().split('T')[0],
          instructions: [
            `Accessorio: ${accessory.name} (${accessory.category})`,
            'Ispeziona per usura o danni',
            'Pulisci e rimuovi detriti',
            'Verifica che sia ancora funzionale',
            'Ripara o sostituisci se necessario',
            'Registra la data della manutenzione'
          ],
          accessoryId: accessory.id
        });
      }
    }

    // 2. SOSTITUZIONE SCADUTA
    if (accessory.needsReplacement) {
      tasksAdvice.push({
        taskType: 'Replacement',
        priority: 'High',
        message: `⚠️ Sostituisci accessorio: ${accessory.name}`,
        dueDate: currentDate.toISOString().split('T')[0],
        instructions: [
          `Accessorio: ${accessory.name} (${accessory.category})`,
          'L\'accessorio è marcato per sostituzione',
          'Rimuovi vecchio accessorio',
          'Installa nuovo accessorio',
          'Registra data installazione',
          'Aggiorna stato nel sistema'
        ],
        accessoryId: accessory.id
      });
    }

    // 3. CONTROLLO DURATA PREVISTA
    if (accessory.installationDate && accessory.expectedLifespan) {
      const installationDate = new Date(accessory.installationDate);
      const expectedEndDate = new Date(
        installationDate.getTime() + accessory.expectedLifespan * 365 * 24 * 60 * 60 * 1000
      );
      const daysUntilReplacement = Math.floor(
        (expectedEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilReplacement <= 30 && daysUntilReplacement > 0) {
        tasksAdvice.push({
          taskType: 'Replacement',
          priority: 'Medium',
          message: `Accessorio ${accessory.name} si avvicina alla fine della durata prevista`,
          dueDate: expectedEndDate.toISOString().split('T')[0],
          instructions: [
            `Accessorio: ${accessory.name}`,
            `Durata prevista: ${accessory.expectedLifespan} anni`,
            `Installato: ${new Date(accessory.installationDate).toLocaleDateString()}`,
            `Fine durata prevista: ${expectedEndDate.toLocaleDateString()}`,
            'Prepara sostituzione',
            'Ispeziona per usura anticipata'
          ],
          accessoryId: accessory.id
        });
      }
    }
  }

  return tasksAdvice;
};

/**
 * Suggerisce accessori necessari per una pianta specifica
 */
export const suggestAccessoriesForPlant = (
  plantName: string,
  masterData: PlantMasterSheet | null
): AccessoryTaskAdvice[] => {
  const suggestions: AccessoryTaskAdvice[] = [];

  if (!masterData) return suggestions;

  const plantNameLower = plantName.toLowerCase();
  
  // PRIORITÀ 1: Usa supportRequirements se presente (dati strutturati)
  if (masterData.supportRequirements) {
    const req = masterData.supportRequirements;
    
    if (req.needsSupport && req.supportType) {
      const supportTypeMap: Record<string, { category: 'Support' | 'Netting'; type: string }> = {
        'Stake': { category: 'Support', type: 'Stake' },
        'Trellis': { category: 'Support', type: 'Trellis' },
        'Cage': { category: 'Support', type: 'Cage' },
        'Net': { category: 'Netting', type: 'Shade' },
        'Espalier': { category: 'Support', type: 'Espalier' }
      };
      
      const supportInfo = supportTypeMap[req.supportType] || { category: 'Support' as const, type: req.supportType };
      
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'High',
        message: `Installa ${req.supportType === 'Stake' ? 'tutore/paletto' : req.supportType === 'Trellis' ? 'spalliera' : req.supportType.toLowerCase()} per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          `${plantName} necessita di supporto per crescere correttamente`,
          req.supportType === 'Trellis' ? 'Installa spalliera robusta' : req.supportType === 'Stake' ? 'Installa tutore o paletto' : `Installa ${req.supportType.toLowerCase()}`,
          req.supportHeight ? `Altezza consigliata: ${req.supportHeight}cm` : 'Altezza adeguata alla crescita della pianta',
          req.supportTiming === 'AtTransplant' ? 'Posiziona supporto durante trapianto' : req.supportTiming === 'BeforeFlowering' ? 'Installa prima della fioritura' : 'Installa quando necessario',
          req.climbingType === 'Twining' ? 'La pianta si arrampica avvolgendo il supporto' : req.climbingType === 'Tendril' ? 'La pianta usa viticci per arrampicarsi' : 'Lega delicatamente senza stringere troppo',
          req.notes || 'Controlla regolarmente che il supporto sia stabile'
        ].filter(Boolean),
        suggestedAccessory: {
          category: supportInfo.category,
          type: supportInfo.type,
          heightCm: req.supportHeight,
          material: req.supportType === 'Trellis' ? 'Bamboo o Acciaio' : req.supportType === 'Stake' ? 'Bamboo, Legno o Acciaio' : undefined,
          usedFor: [plantName]
        }
      });
    }
    
    // Accessori aggiuntivi
    if (req.additionalAccessories) {
      for (const acc of req.additionalAccessories) {
        if (acc.type === 'Net') {
          const netTypeMap: Record<string, string> = {
            'InsectProtection': 'Insect',
            'Shade': 'Shade',
            'Harvest': 'Harvest',
            'WindProtection': 'Shade'
          };
          
          suggestions.push({
            taskType: 'Suggestion',
            priority: acc.required ? 'High' : 'Medium',
            message: `Considera rete ${acc.purpose === 'InsectProtection' ? 'antinsetto' : acc.purpose === 'Shade' ? 'ombreggiante' : acc.purpose === 'Harvest' ? 'per raccolta' : 'di protezione'} per ${plantName}`,
            dueDate: new Date().toISOString().split('T')[0],
            instructions: [
              acc.purpose === 'InsectProtection' ? `Protezione da parassiti per ${plantName}` : 
              acc.purpose === 'Shade' ? `Protezione dal sole eccessivo` :
              acc.purpose === 'Harvest' ? `Facilita la raccolta` :
              `Protezione dal vento`,
              acc.timing || 'Installa quando necessario',
              'Assicurati che la rete non tocchi le foglie',
              'Rimuovi durante impollinazione se necessario'
            ],
            suggestedAccessory: {
              category: 'Netting',
              type: netTypeMap[acc.purpose] || 'Shade',
              usedFor: [plantName]
            }
          });
        }
      }
    }
  }
  
  // PRIORITÀ 2: Riconoscimento specifico per piante comuni (fallback se supportRequirements non presente)
  if (!masterData.supportRequirements) {
    // FAGIOLI ARRAMPICANTI / FAGIOLINI A METRO
    if (plantNameLower.includes('fagiol') && 
        (plantNameLower.includes('rampicant') || plantNameLower.includes('metro') || 
         plantNameLower.includes('a metro'))) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'High',
        message: `Installa spalliera per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          'I fagioli arrampicanti necessitano di supporto robusto',
          'Installa spalliera o rete alta almeno 2-3 metri',
          'Posiziona supporto prima della semina/trapianto',
          'I fagioli si arrampicano naturalmente con viticci',
          'Supporto robusto necessario per sostenere il peso dei baccelli'
        ],
        suggestedAccessory: {
          category: 'Support',
          type: 'Trellis',
          heightCm: 250,
          material: 'Bamboo o Acciaio',
          usedFor: [plantName]
        }
      });
    }
    
    // PISELLI RAMPICANTI
    if (plantNameLower.includes('pisell') && plantNameLower.includes('rampicant')) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'High',
        message: `Installa rete o spalliera per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          'I piselli rampicanti necessitano di supporto leggero',
          'Installa rete o spalliera alta 1.5-2 metri',
          'Posiziona supporto durante trapianto',
          'I piselli si arrampicano con viticci delicati'
        ],
        suggestedAccessory: {
          category: 'Netting',
          type: 'Shade',
          heightCm: 180,
          material: 'Rete plastica o filo',
          usedFor: [plantName]
        }
      });
    }
    
    // POMODORI
    if (plantNameLower.includes('pomodoro')) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'High',
        message: `Installa tutore per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          'I pomodori necessitano di supporto per crescere verticalmente',
          'Installa tutore o paletto alto almeno 1.5-2 metri',
          'Posiziona durante trapianto',
          'Lega delicatamente man mano che la pianta cresce',
          'Varietà indeterminate crescono continuamente'
        ],
        suggestedAccessory: {
          category: 'Support',
          type: 'Stake',
          heightCm: 150,
          material: 'Bamboo, Legno o Acciaio',
          usedFor: [plantName]
        }
      });
    }
    
    // PEPERONI
    if (plantNameLower.includes('peperon')) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'Medium',
        message: `Considera paletto per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          'Paletto opzionale ma consigliato per varietà alte',
          'Installa paletto alto 0.8-1 metro',
          'Utile in zone ventose o per varietà pesanti',
          'Posiziona durante trapianto o quando necessario'
        ],
        suggestedAccessory: {
          category: 'Support',
          type: 'Stake',
          heightCm: 80,
          material: 'Bamboo o Legno',
          usedFor: [plantName]
        }
      });
    }
    
    // MELANZANE
    if (plantNameLower.includes('melanzan')) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'Medium',
        message: `Considera paletto per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          'Paletto consigliato per sostenere i frutti pesanti',
          'Installa paletto alto circa 1 metro',
          'Posiziona durante trapianto',
          'Previene piegamento del fusto'
        ],
        suggestedAccessory: {
          category: 'Support',
          type: 'Stake',
          heightCm: 100,
          material: 'Bamboo o Legno',
          usedFor: [plantName]
        }
      });
    }
    
    // ZUCCHINE (non supporto ma protezione vento)
    if (plantNameLower.includes('zucchin')) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'Low',
        message: `Considera protezione vento per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          'Le zucchine non necessitano supporto',
          'In zone ventose può essere utile rete di protezione',
          'Installa solo se necessario',
          'Proteggi soprattutto durante crescita iniziale'
        ],
        suggestedAccessory: {
          category: 'Netting',
          type: 'Shade',
          usedFor: [plantName]
        }
      });
    }
  }
  
  // PRIORITÀ 3: Fallback su campi esistenti (se supportRequirements non presente)
  if (!masterData.supportRequirements) {
    const needsSupport = (masterData as any).needsSupport || false;
    const isClimbing = (masterData as any).growthHabit?.includes('Climbing') || false;
    const isTall = (masterData as any).maxHeight && (masterData as any).maxHeight > 100; // > 1 metro

    // PIANTE CHE NECESSITANO SUPPORTO (fallback generico)
    if (needsSupport || isClimbing) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'High',
        message: `Installa supporto per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          `${plantName} necessita di supporto per crescere correttamente`,
          isClimbing ? 'Installa tutore o spalliera per piante rampicanti' : 'Installa paletto o gabbia per piante alte',
          'Posiziona supporto vicino alla pianta',
          'Legare delicatamente senza stringere troppo',
          'Controlla regolarmente che il supporto sia stabile'
        ],
        suggestedAccessory: {
          category: 'Support',
          type: isClimbing ? 'Trellis' : 'Stake',
          heightCm: isTall ? (masterData as any).maxHeight : undefined,
          usedFor: [plantName]
        }
      });
    }

    // PIANTE ALTE CHE NECESSITANO PALETTI
    if (isTall && !isClimbing) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'Medium',
        message: `Considera paletto per ${plantName} (pianta alta)`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          `${plantName} può crescere fino a ${(masterData as any).maxHeight}cm`,
          'Installa paletto robusto per prevenire piegamento',
          'Posiziona paletto durante trapianto o prima che la pianta cresca troppo',
          'Usa legature morbide per non danneggiare il fusto'
        ],
        suggestedAccessory: {
          category: 'Support',
          type: 'Stake',
          heightCm: (masterData as any).maxHeight,
          usedFor: [plantName]
        }
      });
    }
  }

  // PIANTE SENSIBILI A PARASSITI - RETI ANTINSETTO
  if (masterData.susceptibility?.pests && masterData.susceptibility.pests.length > 0) {
    // Evita duplicati se già suggerito in additionalAccessories
    const alreadySuggested = suggestions.some(s => 
      s.suggestedAccessory?.category === 'Netting' && 
      s.suggestedAccessory?.type === 'Insect'
    );
    
    if (!alreadySuggested) {
      suggestions.push({
        taskType: 'Suggestion',
        priority: 'Medium',
        message: `Considera rete antinsetto per ${plantName}`,
        dueDate: new Date().toISOString().split('T')[0],
        instructions: [
          `${plantName} è sensibile a: ${masterData.susceptibility.pests.join(', ')}`,
          'Installa rete antinsetto per proteggere la pianta',
          'Assicurati che la rete non tocchi le foglie',
          'Rimuovi rete durante impollinazione se necessario'
        ],
        suggestedAccessory: {
          category: 'Netting',
          type: 'Insect',
          usedFor: [plantName]
        }
      });
    }
  }

  // PIANTE DA FRUTTO - RETI RACCOLTA
  if (plantNameLower.includes('olivo') || plantNameLower.includes('vite') || 
      plantNameLower.includes('melo') || plantNameLower.includes('pero') ||
      masterData.cropType === 'FruitTree') {
    suggestions.push({
      taskType: 'Suggestion',
      priority: 'Low',
      message: `Considera rete per raccolta frutta per ${plantName}`,
      dueDate: new Date().toISOString().split('T')[0],
      instructions: [
        'Rete per raccolta facilita la raccolta dei frutti',
        'Posiziona rete sotto la pianta durante periodo raccolta',
        'Rimuovi rete dopo raccolta per evitare accumulo detriti'
      ],
      suggestedAccessory: {
        category: 'Netting',
        type: 'Harvest',
        usedFor: [plantName]
      }
    });
  }

  return suggestions;
};

