/**
 * Servizio Integrato per Trattamenti e Fertilizzanti AI
 * Collega: AI → Scheda Prodotto → Task → Calendario → Reminder
 */

import { ProductCard, GardenTask, Garden } from '@/types';
import { generateProductCard, findOrCreateProductCard } from './productCardService';
import { addDays, format } from 'date-fns';

export interface TreatmentRequest {
  productName: string;
  type: 'fertilizer' | 'treatment';
  diseaseContext?: string;
  plantContext?: string;
  garden: Garden;
  userId: string;
  
  // Parametri applicazione
  applicationArea?: {
    type: 'field' | 'rows' | 'individual_plants';
    fieldSize?: number; // m²
    rowCount?: number;
    rowLength?: number; // metri
    plantCount?: number;
  };
  
  // Scheduling
  startDate?: string; // ISO date
  customFrequency?: number; // giorni, override del default
  totalApplications?: number; // quante volte applicare
}

export interface TreatmentPlan {
  productCard: ProductCard;
  tasks: GardenTask[];
  totalCost?: number;
  totalQuantity: string;
  applicationSchedule: Array<{
    date: string;
    taskId: string;
    quantity: string;
    notes: string;
  }>;
}

export class IntegratedTreatmentService {
  
  /**
   * Crea un piano completo di trattamento/fertilizzazione
   */
  static async createTreatmentPlan(
    request: TreatmentRequest,
    existingCards: ProductCard[]
  ): Promise<TreatmentPlan> {
    
    // 1. Genera o trova scheda prodotto AI
    const productCard = await findOrCreateProductCard(
      request.productName,
      request.type,
      existingCards,
      {
        diseaseContext: request.diseaseContext,
        plantContext: request.plantContext,
        userId: request.userId,
        gardenId: request.garden.id
      }
    );

    // 2. Calcola quantità per applicazione
    const quantityPerApplication = this.calculateQuantityPerApplication(
      productCard,
      request.applicationArea
    );

    // 3. Determina frequenza e numero applicazioni
    const frequency = request.customFrequency || productCard.defaultRepeatDays || 14;
    const totalApplications = request.totalApplications || this.getDefaultApplicationCount(productCard.type);

    // 4. Genera calendario applicazioni
    const startDate = request.startDate ? new Date(request.startDate) : new Date();
    const applicationSchedule = [];
    const tasks: GardenTask[] = [];

    for (let i = 0; i < totalApplications; i++) {
      const applicationDate = addDays(startDate, i * frequency);
      const taskId = crypto.randomUUID();
      
      // Crea task per questa applicazione
      const task: GardenTask = {
        id: taskId,
        gardenId: request.garden.id,
        plantName: request.plantContext || 'Tutte le piante',
        taskType: request.type === 'fertilizer' ? 'Fertilize' : 'Treatment',
        date: format(applicationDate, 'yyyy-MM-dd'),
        nextDueDate: format(applicationDate, 'yyyy-MM-dd'),
        notes: this.generateTaskNotes(productCard, quantityPerApplication, request.applicationArea, i + 1, totalApplications),
        completed: false,
        season: this.getCurrentSeason(),
        locationType: request.applicationArea?.type === 'field' ? 'Ground' : 'Pot',
        stage: 'Vegetative',
        // Metadati per collegamento con scheda prodotto
        metadata: {
          productCardId: productCard.id,
          productName: productCard.name,
          productType: productCard.type,
          dosage: quantityPerApplication,
          applicationMethod: productCard.applicationMethod,
          applicationNumber: i + 1,
          totalApplications: totalApplications,
          bestTime: productCard.bestTime,
          precautions: productCard.precautions
        }
      };

      tasks.push(task);
      
      applicationSchedule.push({
        date: format(applicationDate, 'yyyy-MM-dd'),
        taskId: taskId,
        quantity: quantityPerApplication,
        notes: `Applicazione ${i + 1}/${totalApplications} - ${productCard.name}`
      });
    }

    // 5. Calcola totali
    const totalQuantity = this.calculateTotalQuantity(quantityPerApplication, totalApplications);

    return {
      productCard,
      tasks,
      totalQuantity,
      applicationSchedule
    };
  }

  /**
   * Calcola quantità per singola applicazione basata su area e dosaggio
   */
  private static calculateQuantityPerApplication(
    productCard: ProductCard,
    applicationArea?: TreatmentRequest['applicationArea']
  ): string {
    if (!applicationArea || !productCard.recommendedDosage) {
      return productCard.recommendedDosage || 'Seguire istruzioni confezione';
    }

    // Estrai dosaggio numerico dalla stringa (es. "200g/m²" → 200)
    const dosageMatch = productCard.recommendedDosage.match(/(\d+(?:\.\d+)?)/);
    if (!dosageMatch) {
      return productCard.recommendedDosage;
    }

    const dosageValue = parseFloat(dosageMatch[1]);
    const dosageUnit = productCard.recommendedDosage.replace(dosageMatch[0], '').trim();

    let totalArea = 0;

    switch (applicationArea.type) {
      case 'field':
        totalArea = applicationArea.fieldSize || 0;
        break;
      case 'rows':
        // Assumiamo larghezza media di 1.5m per filare
        totalArea = (applicationArea.rowCount || 0) * (applicationArea.rowLength || 0) * 1.5;
        break;
      case 'individual_plants':
        // Per piante individuali, assumiamo 1m² per pianta
        totalArea = applicationArea.plantCount || 0;
        break;
    }

    if (totalArea === 0) {
      return productCard.recommendedDosage;
    }

    // Calcola quantità totale
    if (dosageUnit.includes('/m²') || dosageUnit.includes('per m²')) {
      const totalQuantity = dosageValue * totalArea;
      const unit = dosageUnit.replace('/m²', '').replace('per m²', '').trim();
      return `${totalQuantity}${unit}`;
    }

    // Per dosaggi in ml/L, assumiamo 1L per 10m²
    if (dosageUnit.includes('/L') || dosageUnit.includes('per L')) {
      const litersNeeded = Math.ceil(totalArea / 10);
      const totalQuantity = dosageValue * litersNeeded;
      const unit = dosageUnit.replace('/L', '').replace('per L', '').trim();
      return `${totalQuantity}${unit} in ${litersNeeded}L acqua`;
    }

    return productCard.recommendedDosage;
  }

  /**
   * Calcola quantità totale per tutto il ciclo
   */
  private static calculateTotalQuantity(quantityPerApplication: string, totalApplications: number): string {
    const quantityMatch = quantityPerApplication.match(/(\d+(?:\.\d+)?)/);
    if (!quantityMatch) {
      return `${quantityPerApplication} x ${totalApplications} applicazioni`;
    }

    const singleQuantity = parseFloat(quantityMatch[1]);
    const totalQuantity = singleQuantity * totalApplications;
    const unit = quantityPerApplication.replace(quantityMatch[0], '').trim();

    return `${totalQuantity}${unit} totali`;
  }

  /**
   * Genera note dettagliate per il task
   */
  private static generateTaskNotes(
    productCard: ProductCard,
    quantity: string,
    applicationArea?: TreatmentRequest['applicationArea'],
    applicationNumber?: number,
    totalApplications?: number
  ): string {
    let notes = `🧪 ${productCard.name}\n`;
    
    if (applicationNumber && totalApplications) {
      notes += `📅 Applicazione ${applicationNumber}/${totalApplications}\n`;
    }
    
    notes += `💧 Dosaggio: ${quantity}\n`;
    
    if (productCard.applicationMethod) {
      notes += `🎯 Metodo: ${productCard.applicationMethod}\n`;
    }
    
    if (productCard.bestTime) {
      notes += `⏰ Momento migliore: ${productCard.bestTime}\n`;
    }

    if (applicationArea) {
      switch (applicationArea.type) {
        case 'field':
          notes += `🌾 Area: ${applicationArea.fieldSize}m² (campo)\n`;
          break;
        case 'rows':
          notes += `🌱 Area: ${applicationArea.rowCount} filari x ${applicationArea.rowLength}m\n`;
          break;
        case 'individual_plants':
          notes += `🪴 Piante: ${applicationArea.plantCount} piante individuali\n`;
          break;
      }
    }

    if (productCard.precautions && productCard.precautions.length > 0) {
      notes += `\n⚠️ PRECAUZIONI:\n`;
      productCard.precautions.forEach(precaution => {
        notes += `• ${precaution}\n`;
      });
    }

    return notes.trim();
  }

  /**
   * Numero default di applicazioni per tipo
   */
  private static getDefaultApplicationCount(type: 'fertilizer' | 'treatment'): number {
    return type === 'fertilizer' ? 3 : 4; // Fertilizzanti: 3 volte, Trattamenti: 4 volte
  }

  /**
   * Determina stagione corrente
   */
  private static getCurrentSeason(): 'Summer' | 'Winter' {
    const month = new Date().getMonth() + 1;
    if (month >= 4 && month <= 9) return 'Summer';
    return 'Winter';
  }

  /**
   * Aggiorna task esistente con informazioni prodotto
   */
  static async updateTaskWithProduct(
    task: GardenTask,
    productCard: ProductCard,
    quantity: string
  ): Promise<GardenTask> {
    return {
      ...task,
      notes: `${task.notes || ''}\n\n🧪 PRODOTTO: ${productCard.name}\n💧 Dosaggio: ${quantity}${
        productCard.bestTime ? `\n⏰ Momento migliore: ${productCard.bestTime}` : ''
      }${
        productCard.precautions && productCard.precautions.length > 0 
          ? `\n\n⚠️ PRECAUZIONI:\n${productCard.precautions.map(p => `• ${p}`).join('\n')}`
          : ''
      }`,
      metadata: {
        ...task.metadata,
        productCardId: productCard.id,
        productName: productCard.name,
        productType: productCard.type,
        dosage: quantity,
        applicationMethod: productCard.applicationMethod,
        bestTime: productCard.bestTime,
        precautions: productCard.precautions
      }
    };
  }

  /**
   * Genera reminder intelligenti basati su meteo
   */
  static generateWeatherAwareReminders(
    tasks: GardenTask[],
    weatherForecast?: Array<{ date: string; conditions: string; precipitation: number }>
  ): Array<{ taskId: string; message: string; suggestedAction: 'postpone' | 'proceed' | 'advance' }> {
    if (!weatherForecast) return [];

    const reminders: Array<{ taskId: string; message: string; suggestedAction: 'postpone' | 'proceed' | 'advance' }> = [];

    for (const task of tasks) {
      const taskDate = task.nextDueDate || task.date;
      const weather = weatherForecast.find(w => w.date === taskDate);
      
      if (!weather) continue;

      const isRainy = weather.precipitation > 5 || weather.conditions === 'rain';
      const isStormy = weather.conditions === 'storm';

      if (isStormy) {
        reminders.push({
          taskId: task.id,
          message: `⛈️ ATTENZIONE: Prevista tempesta il ${taskDate}. Rimandare il trattamento di 2-3 giorni per sicurezza.`,
          suggestedAction: 'postpone'
        });
      } else if (isRainy && task.taskType === 'Treatment') {
        reminders.push({
          taskId: task.id,
          message: `🌧️ Pioggia prevista il ${taskDate}. Il trattamento potrebbe essere dilavato. Considerare di rimandare.`,
          suggestedAction: 'postpone'
        });
      } else if (isRainy && task.taskType === 'Fertilize') {
        reminders.push({
          taskId: task.id,
          message: `🌧️ Pioggia prevista il ${taskDate}. Ottimo per fertilizzanti radicali, evitare quelli fogliari.`,
          suggestedAction: 'proceed'
        });
      }
    }

    return reminders;
  }
}
