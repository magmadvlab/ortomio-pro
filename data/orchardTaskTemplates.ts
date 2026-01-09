/**
 * Task templates stagionali per categorie frutteto
 * Generazione automatica task basata su categoria e data impianto
 */

import { FruitTreeCategory } from '../types/orchardTypes'
import { addMonths, addDays, format } from 'date-fns'

export interface TaskTemplate {
  title: string
  description: string
  monthOffset: number // Mesi dalla data impianto (0 = stesso mese, 1 = mese successivo, etc.)
  dayOfMonth: number // Giorno del mese (1-28 per sicurezza)
  priority: 'high' | 'medium' | 'low'
  category: 'maintenance' | 'treatment' | 'harvest' | 'pruning' | 'fertilization'
  recurring?: 'yearly' | 'monthly' // Se ricorrente
}

export const orchardTaskTemplates: Record<FruitTreeCategory, TaskTemplate[]> = {
  'POMACEE': [
    {
      title: 'Potatura Invernale',
      description: 'Pota meli e peri eliminando rami secchi, malati e succhioni. Favorisci penetrazione luce e circolazione aria.',
      monthOffset: 0, // Subito dopo impianto, poi annuale
      dayOfMonth: 15,
      priority: 'high',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Trattamento Preventivo Ticchiolatura',
      description: 'Applica trattamento rameico prima della ripresa vegetativa per prevenire ticchiolatura. Ripeti se piove.',
      monthOffset: 2,
      dayOfMonth: 1,
      priority: 'high',
      category: 'treatment',
      recurring: 'yearly'
    },
    {
      title: 'Monitoraggio Fioritura',
      description: 'Monitora apertura gemme a fiore. Verifica presenza impollinatori. Attenzione a gelate tardive.',
      monthOffset: 3,
      dayOfMonth: 10,
      priority: 'medium',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Diradamento Frutti',
      description: 'Dirada i frutti lasciando 1 mela/pera ogni 15-20cm. Migliora calibro e qualità. Elimina frutti danneggiati.',
      monthOffset: 4,
      dayOfMonth: 15,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Fertirrigazione Estiva',
      description: 'Applica concime NPK bilanciato via irrigazione. Supporta ingrossamento frutti e sviluppo gemme anno prossimo.',
      monthOffset: 5,
      dayOfMonth: 1,
      priority: 'medium',
      category: 'fertilization',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Varietà Precoci',
      description: 'Raccogli frutti quando si staccano facilmente con leggera torsione. Verifica colore buccia e polpa.',
      monthOffset: 8,
      dayOfMonth: 1,
      priority: 'high',
      category: 'harvest',
      recurring: 'yearly'
    }
  ],

  'DRUPACEE': [
    {
      title: 'Trattamento Preventivo Bolla',
      description: 'Applica trattamento rameico PRIMA fioritura contro bolla del pesco. Fondamentale per prevenzione.',
      monthOffset: 1,
      dayOfMonth: 15,
      priority: 'high',
      category: 'treatment',
      recurring: 'yearly'
    },
    {
      title: 'Potatura Verde Estiva',
      description: 'Elimina succhioni e rami troppo vigorosi. Migliora areazione chioma e colorazione frutti.',
      monthOffset: 5,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Diradamento Frutti',
      description: 'Dirada pesche/albicocche lasciando 1 frutto ogni 10-15cm. Previene rottura rami e migliora calibro.',
      monthOffset: 4,
      dayOfMonth: 1,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Monitoraggio Monilia',
      description: 'Controlla frutti per marciume bruno (monilia). Rimuovi immediatamente frutti colpiti.',
      monthOffset: 6,
      dayOfMonth: 1,
      priority: 'high',
      category: 'treatment',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Frutti Maturi',
      description: 'Raccogli quando frutti sono morbidi al tatto e profumati. Pesche si conservano pochi giorni.',
      monthOffset: 6,
      dayOfMonth: 15,
      priority: 'high',
      category: 'harvest',
      recurring: 'yearly'
    }
  ],

  'AGRUMI': [
    {
      title: 'Fertirrigazione Primaverile',
      description: 'Inizia fertirrigazione settimanale con NPK 20-5-10. Agrumi sono esigenti in nutrienti.',
      monthOffset: 2,
      dayOfMonth: 1,
      priority: 'high',
      category: 'fertilization',
      recurring: 'yearly'
    },
    {
      title: 'Potatura Leggera',
      description: 'Elimina rami secchi, succhioni e incroci. Mantieni chioma aperta per circolazione aria.',
      monthOffset: 2,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Trappole Mosca Mediterranea',
      description: 'Installa trappole cromotropiche gialle contro mosca della frutta. Controlla settimanalmente.',
      monthOffset: 5,
      dayOfMonth: 1,
      priority: 'high',
      category: 'treatment',
      recurring: 'yearly'
    },
    {
      title: 'Irrigazione Costante Estiva',
      description: 'Mantieni suolo umido ma non inzuppato. Agrumi soffrono stress idrico. Irriga 2-3 volte a settimana.',
      monthOffset: 6,
      dayOfMonth: 1,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Arance/Limoni',
      description: 'Raccogli quando frutti hanno raggiunto colore e dimensione tipica varietà. Usa forbici.',
      monthOffset: 10,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'harvest',
      recurring: 'yearly'
    }
  ],

  'FRUTTA_GUSCIO': [
    {
      title: 'Potatura Formazione Giovani',
      description: 'Forma chioma aperta a vaso. Elimina rami bassi e incroci. Favorisci penetrazione luce.',
      monthOffset: 1,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Concimazione Organica',
      description: 'Distribuisci letame maturo o compost alla base piante. Incorpora leggermente nel suolo.',
      monthOffset: 2,
      dayOfMonth: 1,
      priority: 'medium',
      category: 'fertilization',
      recurring: 'yearly'
    },
    {
      title: 'Preparazione Reti Raccolta',
      description: 'Pulisci e stendi reti sotto piante prima inizio caduta frutti. Facilita raccolta meccanica.',
      monthOffset: 8,
      dayOfMonth: 15,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Noci/Nocciole',
      description: 'Raccogli appena cadono a terra. Usa scuotitore se disponibile. Raccogli tempestivamente prima fauna.',
      monthOffset: 9,
      dayOfMonth: 1,
      priority: 'high',
      category: 'harvest',
      recurring: 'yearly'
    },
    {
      title: 'Essiccazione Frutti',
      description: 'Essicca noci/nocciole a 25-30°C fino 10-12% umidità. Conserva in luogo fresco e asciutto.',
      monthOffset: 9,
      dayOfMonth: 15,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    }
  ],

  'MEDITERRANEA': [
    {
      title: 'Potatura Leggera',
      description: 'Elimina solo rami secchi e succhioni. Fichi/melograni preferiscono forma naturale.',
      monthOffset: 2,
      dayOfMonth: 1,
      priority: 'low',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Irrigazione di Soccorso',
      description: 'Irriga solo in caso di siccità prolungata. Piante resistenti ma beneficiano acqua in estate.',
      monthOffset: 6,
      dayOfMonth: 1,
      priority: 'low',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Fichi Fioroni',
      description: 'Raccogli fichi precoci (fioroni) quando morbidi al tatto. Maturazione scalare.',
      monthOffset: 6,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'harvest',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Fichi Tardivi',
      description: 'Raccogli fichi tardivi quando buccia si spacca leggermente. Visita piante ogni 2-3 giorni.',
      monthOffset: 8,
      dayOfMonth: 1,
      priority: 'medium',
      category: 'harvest',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Melograni/Cachi',
      description: 'Raccogli quando frutti hanno raggiunto colore tipico. Melograni si conservano mesi.',
      monthOffset: 10,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'harvest',
      recurring: 'yearly'
    }
  ],

  'KIWI': [
    {
      title: 'Potatura Invernale',
      description: 'Pota tralci fruttificati lasciando speroni 2-3 gemme. Elimina legno vecchio e debole.',
      monthOffset: 1,
      dayOfMonth: 15,
      priority: 'high',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Verifica Piante Maschio',
      description: 'Assicurati rapporto 1 maschio ogni 5-6 femmine. Controlla fioritura contemporanea.',
      monthOffset: 4,
      dayOfMonth: 15,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Irrigazione Abbondante',
      description: 'Irriga 2-3 volte a settimana in estate. Kiwi è molto esigente in acqua durante ingrossamento frutti.',
      monthOffset: 6,
      dayOfMonth: 1,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Potatura Verde',
      description: 'Cima germogli oltre 6-7 foglie da ultimo frutto. Elimina succhioni e feminelle.',
      monthOffset: 6,
      dayOfMonth: 15,
      priority: 'medium',
      category: 'pruning',
      recurring: 'yearly'
    },
    {
      title: 'Raccolta Kiwi',
      description: 'Raccogli quando °Brix raggiunge 6.5-7. Frutti maturano dopo raccolta. Taglia picciolo con forbici.',
      monthOffset: 10,
      dayOfMonth: 15,
      priority: 'high',
      category: 'harvest',
      recurring: 'yearly'
    }
  ],

  'ESOTICHE': [
    {
      title: 'Protezione Antigelo',
      description: 'Copri piante con teli tessuto-non-tessuto se previste temperature <5°C. Proteggi tronco.',
      monthOffset: 10,
      dayOfMonth: 1,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Concimazione Ricca',
      description: 'Applica concime organico ricco NPK. Piante tropicali sono esigenti in nutrienti.',
      monthOffset: 3,
      dayOfMonth: 1,
      priority: 'medium',
      category: 'fertilization',
      recurring: 'yearly'
    },
    {
      title: 'Irrigazione Costante',
      description: 'Mantieni suolo sempre umido. Irriga regolarmente evitando ristagni. Nebulizza chioma.',
      monthOffset: 5,
      dayOfMonth: 1,
      priority: 'high',
      category: 'maintenance',
      recurring: 'yearly'
    },
    {
      title: 'Verifica Stato Sanitario',
      description: 'Controlla foglie per stress da freddo/caldo. Intervieni tempestivamente con microelementi.',
      monthOffset: 6,
      dayOfMonth: 1,
      priority: 'medium',
      category: 'maintenance',
      recurring: 'yearly'
    }
  ]
}

/**
 * Genera task per categoria basati su data impianto
 */
export function generateOrchardTasks(
  category: FruitTreeCategory,
  plantedDate: Date,
  gardenId: string,
  gardenName: string
): Array<{
  plantName: string
  gardenId: string
  taskType: 'Treatment' | 'Prune' | 'Harvest' | 'Fertilize' | 'Irrigation'
  date: string
  completed: boolean
  dueDate?: string
  priority?: 'high' | 'medium' | 'low'
  description?: string
  recurring?: 'yearly' | 'monthly'
}> {
  const templates = orchardTaskTemplates[category] || []
  const tasks: any[] = []

  // Map template category to taskType
  const categoryToTaskType = (cat: string): 'Treatment' | 'Prune' | 'Harvest' | 'Fertilize' | 'Irrigation' => {
    if (cat === 'pruning') return 'Prune'
    if (cat === 'treatment') return 'Treatment'
    if (cat === 'harvest') return 'Harvest'
    if (cat === 'fertilization') return 'Fertilize'
    return 'Treatment' // Default fallback for 'maintenance'
  }

  templates.forEach(template => {
    // Calcola data task
    const taskDate = addMonths(plantedDate, template.monthOffset)
    taskDate.setDate(Math.min(template.dayOfMonth, 28)) // Sicurezza per mesi con meno giorni

    tasks.push({
      plantName: gardenName, // Nome del frutteto
      gardenId: gardenId,
      taskType: categoryToTaskType(template.category),
      date: format(taskDate, 'yyyy-MM-dd'),
      completed: false,
      dueDate: format(taskDate, 'yyyy-MM-dd'),
      priority: template.priority,
      description: `${template.title}: ${template.description}`,
      recurring: template.recurring
    })
  })

  // Ordina per data
  return tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Ottieni sommario task per categoria (per preview)
 */
export function getTasksSummary(category: FruitTreeCategory): string {
  const templates = orchardTaskTemplates[category] || []
  const highPriority = templates.filter(t => t.priority === 'high').length
  const total = templates.length

  return `${total} task stagionali (${highPriority} priorità alta)`
}
