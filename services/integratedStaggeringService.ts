/**
 * Integrated Staggering Service - Sistema di Scaglionamento Integrato
 * Gestisce TUTTI i processi agricoli con memoria e coordinamento
 * Non solo raccolta, ma: irrigazione, lavorazioni, trattamenti, fertilizzanti
 */

import { PlantMasterSheet, GardenTask, Garden } from '../types';

export interface StaggeringMethod {
  type: 'seed' | 'seedling' | 'transplant';
  daysToMaturity: number;
  nurseryDays?: number; // Solo per seedling
  transplantWindow?: number; // Giorni ottimali per trapianto
}

export interface ProcessSchedule {
  processType: 'irrigation' | 'fertilization' | 'treatment' | 'cultivation' | 'harvest';
  daysFromPlanting: number[];
  description: string;
  frequency?: 'once' | 'weekly' | 'biweekly' | 'monthly';
  duration?: number; // giorni di durata del processo
  resources: {
    equipment?: string[];
    materials?: string[];
    laborHours: number;
    cost: number;
  };
}

export interface StaggeredBatch {
  batchNumber: number;
  plantingDate: Date;
  method: StaggeringMethod;
  surfaceHectares: number;
  
  // Timeline completa del lotto
  timeline: {
    nurseryStart?: Date;      // Se da seme in semenzaio
    transplantDate?: Date;    // Se trapianto
    fieldPlantingDate: Date;  // Semina diretta o trapianto in campo
    harvestStart: Date;
    harvestEnd: Date;
  };
  
  // Processi programmati per questo lotto
  scheduledProcesses: Array<{
    process: ProcessSchedule;
    scheduledDates: Date[];
    status: 'planned' | 'in_progress' | 'completed';
  }>;
  
  // Coordinamento con altri lotti
  coordination: {
    sharedResources: string[]; // Attrezzature condivise
    conflictingProcesses: string[]; // Processi che non possono sovrapporsi
    dependentBatches: number[]; // Lotti che dipendono da questo
  };
}

export interface IntegratedStaggeringPlan {
  cropName: string;
  totalSurface: number;
  method: StaggeringMethod;
  batches: StaggeredBatch[];
  
  // Gestione risorse integrate
  resourceManagement: {
    irrigationSchedule: Array<{
      date: Date;
      batchesInvolved: number[];
      waterRequirement: number; // litri
      duration: number; // minuti
    }>;
    
    fertilizationSchedule: Array<{
      date: Date;
      batchesInvolved: number[];
      fertilizerType: string;
      quantity: number; // kg
      applicationMethod: string;
    }>;
    
    treatmentSchedule: Array<{
      date: Date;
      batchesInvolved: number[];
      treatmentType: string;
      product: string;
      weatherConditions: string[];
    }>;
    
    cultivationSchedule: Array<{
      date: Date;
      batchesInvolved: number[];
      operation: string; // sarchiatura, rincalzatura, etc.
      equipment: string[];
      laborHours: number;
    }>;
  };
  
  // Analisi conflitti e ottimizzazioni
  optimization: {
    resourceConflicts: Array<{
      date: Date;
      conflictType: string;
      affectedBatches: number[];
      resolution: string;
    }>;
    
    efficiencyGains: Array<{
      process: string;
      combinedBatches: number[];
      savings: {
        laborHours: number;
        cost: number;
        equipment: string[];
      };
    }>;
  };
}

export class IntegratedStaggeringService {
  
  /**
   * Genera piano di scaglionamento integrato completo
   */
  static generateIntegratedPlan(
    plant: PlantMasterSheet,
    totalSurface: number,
    method: StaggeringMethod,
    startDate: Date = new Date(),
    garden: Garden
  ): IntegratedStaggeringPlan {
    
    // 1. Calcola numero ottimale di lotti
    const { batches: batchCount, interval } = this.calculateOptimalBatches(
      plant, totalSurface, method
    );
    
    // 2. Genera lotti con timeline complete
    const batches = this.generateBatchTimelines(
      plant, batchCount, interval, totalSurface, method, startDate
    );
    
    // 3. Programma processi per ogni lotto
    batches.forEach(batch => {
      batch.scheduledProcesses = this.generateProcessSchedule(plant, batch, method);
    });
    
    // 4. Coordina risorse tra lotti
    const resourceManagement = this.coordinateResources(batches, plant);
    
    // 5. Ottimizza e risolvi conflitti
    const optimization = this.optimizeResourceUsage(batches, resourceManagement);
    
    return {
      cropName: plant.commonName,
      totalSurface,
      method,
      batches,
      resourceManagement,
      optimization
    };
  }
  
  /**
   * Calcola lotti ottimali considerando il metodo di coltivazione
   */
  private static calculateOptimalBatches(
    plant: PlantMasterSheet,
    totalSurface: number,
    method: StaggeringMethod
  ): { batches: number; interval: number } {
    
    let baseBatches = 2;
    let baseInterval = 21;
    
    // Adatta in base al metodo
    if (method.type === 'seed') {
      // Semina diretta: più flessibile, intervalli più corti
      baseBatches = Math.max(3, Math.ceil(totalSurface / 2));
      baseInterval = 14;
    } else if (method.type === 'seedling') {
      // Da piantina: considera tempo semenzaio
      baseBatches = Math.max(2, Math.ceil(totalSurface / 3));
      baseInterval = method.nurseryDays || 21;
    } else if (method.type === 'transplant') {
      // Trapianto: finestra più ristretta
      baseBatches = Math.max(2, Math.ceil(totalSurface / 2.5));
      baseInterval = method.transplantWindow || 14;
    }
    
    // Adatta per superficie grande
    if (totalSurface > 5) {
      baseBatches = Math.min(baseBatches + Math.ceil(totalSurface / 5), 8);
    }
    
    // Considera caratteristiche della pianta
    if (plant.family === 'Asteraceae') { // Lattughe
      baseInterval = Math.min(baseInterval, 10);
    } else if (plant.family === 'Solanaceae') { // Pomodori, peperoni
      baseInterval = Math.max(baseInterval, 21);
    }
    
    return { batches: baseBatches, interval: baseInterval };
  }
  
  /**
   * Genera timeline complete per ogni lotto
   */
  private static generateBatchTimelines(
    plant: PlantMasterSheet,
    batchCount: number,
    interval: number,
    totalSurface: number,
    method: StaggeringMethod,
    startDate: Date
  ): StaggeredBatch[] {
    
    const batches: StaggeredBatch[] = [];
    const surfacePerBatch = totalSurface / batchCount;
    
    for (let i = 0; i < batchCount; i++) {
      const plantingDate = new Date(startDate);
      plantingDate.setDate(plantingDate.getDate() + (i * interval));
      
      let timeline: StaggeredBatch['timeline'];
      
      if (method.type === 'seed') {
        // Semina diretta
        timeline = {
          fieldPlantingDate: plantingDate,
          harvestStart: new Date(plantingDate.getTime() + method.daysToMaturity * 24 * 60 * 60 * 1000),
          harvestEnd: new Date(plantingDate.getTime() + (method.daysToMaturity + 14) * 24 * 60 * 60 * 1000)
        };
      } else if (method.type === 'seedling') {
        // Da piantina (semenzaio)
        const nurseryStart = new Date(plantingDate);
        nurseryStart.setDate(nurseryStart.getDate() - (method.nurseryDays || 30));
        
        timeline = {
          nurseryStart,
          transplantDate: plantingDate,
          fieldPlantingDate: plantingDate,
          harvestStart: new Date(plantingDate.getTime() + (method.daysToMaturity - (method.nurseryDays || 30)) * 24 * 60 * 60 * 1000),
          harvestEnd: new Date(plantingDate.getTime() + (method.daysToMaturity - (method.nurseryDays || 30) + 14) * 24 * 60 * 60 * 1000)
        };
      } else {
        // Trapianto
        timeline = {
          transplantDate: plantingDate,
          fieldPlantingDate: plantingDate,
          harvestStart: new Date(plantingDate.getTime() + method.daysToMaturity * 24 * 60 * 60 * 1000),
          harvestEnd: new Date(plantingDate.getTime() + (method.daysToMaturity + 14) * 24 * 60 * 60 * 1000)
        };
      }
      
      batches.push({
        batchNumber: i + 1,
        plantingDate,
        method,
        surfaceHectares: surfacePerBatch,
        timeline,
        scheduledProcesses: [],
        coordination: {
          sharedResources: [],
          conflictingProcesses: [],
          dependentBatches: []
        }
      });
    }
    
    return batches;
  }
  
  /**
   * Genera programma completo dei processi per un lotto
   */
  private static generateProcessSchedule(
    plant: PlantMasterSheet,
    batch: StaggeredBatch,
    method: StaggeringMethod
  ): StaggeredBatch['scheduledProcesses'] {
    
    const processes: ProcessSchedule[] = [];
    
    // IRRIGAZIONE - Programmata in base al ciclo
    if (method.type === 'seedling' && batch.timeline.nurseryStart) {
      processes.push({
        processType: 'irrigation',
        daysFromPlanting: [-30, -25, -20, -15, -10, -5], // Semenzaio
        description: 'Irrigazione semenzaio - nebulizzazione leggera',
        frequency: 'weekly',
        resources: {
          equipment: ['Sistema nebulizzazione', 'Timer irrigazione'],
          materials: ['Acqua'],
          laborHours: 0.5,
          cost: 10
        }
      });
    }
    
    processes.push({
      processType: 'irrigation',
      daysFromPlanting: [0, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70], // Campo
      description: 'Irrigazione campo - goccia o aspersione',
      frequency: 'weekly',
      resources: {
        equipment: ['Impianto irrigazione', 'Pompa', 'Filtri'],
        materials: ['Acqua', 'Energia elettrica'],
        laborHours: 1,
        cost: 25
      }
    });
    
    // FERTILIZZAZIONE - Basata su fabbisogni nutrizionali
    processes.push({
      processType: 'fertilization',
      daysFromPlanting: [-7], // Pre-impianto
      description: 'Concimazione di fondo',
      frequency: 'once',
      resources: {
        equipment: ['Spandiconcime', 'Trattore'],
        materials: ['Concime NPK', 'Compost'],
        laborHours: 2,
        cost: 150
      }
    });
    
    if (plant.family === 'Solanaceae' || plant.family === 'Cucurbitaceae') {
      // Piante esigenti: fertilizzazioni multiple
      processes.push({
        processType: 'fertilization',
        daysFromPlanting: [21, 42], // Copertura
        description: 'Concimazione di copertura',
        frequency: 'biweekly',
        resources: {
          equipment: ['Fertirrigazione'],
          materials: ['Concime liquido NPK'],
          laborHours: 1,
          cost: 80
        }
      });
    }
    
    // TRATTAMENTI - Preventivi e curativi
    processes.push({
      processType: 'treatment',
      daysFromPlanting: [14, 35, 56], // Preventivi
      description: 'Trattamenti fitosanitari preventivi',
      frequency: 'biweekly',
      resources: {
        equipment: ['Atomizzatore', 'DPI'],
        materials: ['Fungicidi', 'Insetticidi biologici'],
        laborHours: 1.5,
        cost: 120
      }
    });
    
    // LAVORAZIONI - Sarchiature, rincalzature
    processes.push({
      processType: 'cultivation',
      daysFromPlanting: [21, 42], // Sarchiature
      description: 'Sarchiatura e controllo infestanti',
      frequency: 'biweekly',
      resources: {
        equipment: ['Sarchiatrice', 'Trattore'],
        materials: ['Carburante'],
        laborHours: 1,
        cost: 60
      }
    });
    
    if (plant.family === 'Solanaceae') {
      processes.push({
        processType: 'cultivation',
        daysFromPlanting: [35], // Rincalzatura
        description: 'Rincalzatura piante',
        frequency: 'once',
        resources: {
          equipment: ['Rincalzatrice', 'Trattore'],
          materials: ['Carburante'],
          laborHours: 1.5,
          cost: 80
        }
      });
    }
    
    // RACCOLTA - Programmata
    const harvestDays = this.calculateHarvestDays(batch.timeline.harvestStart, batch.timeline.harvestEnd);
    processes.push({
      processType: 'harvest',
      daysFromPlanting: harvestDays,
      description: 'Raccolta scaglionata',
      frequency: 'weekly',
      duration: harvestDays.length,
      resources: {
        equipment: ['Cassette', 'Bilancia', 'Trasporto'],
        materials: ['Imballaggio'],
        laborHours: 8,
        cost: 200
      }
    });
    
    // Converte in scheduled processes con date effettive
    return processes.map(process => ({
      process,
      scheduledDates: process.daysFromPlanting.map(days => {
        const date = new Date(batch.plantingDate);
        date.setDate(date.getDate() + days);
        return date;
      }),
      status: 'planned' as const
    }));
  }
  
  /**
   * Coordina risorse tra tutti i lotti
   */
  private static coordinateResources(
    batches: StaggeredBatch[],
    plant: PlantMasterSheet
  ): IntegratedStaggeringPlan['resourceManagement'] {
    
    const irrigationSchedule: IntegratedStaggeringPlan['resourceManagement']['irrigationSchedule'] = [];
    const fertilizationSchedule: IntegratedStaggeringPlan['resourceManagement']['fertilizationSchedule'] = [];
    const treatmentSchedule: IntegratedStaggeringPlan['resourceManagement']['treatmentSchedule'] = [];
    const cultivationSchedule: IntegratedStaggeringPlan['resourceManagement']['cultivationSchedule'] = [];
    
    // Raggruppa processi per data per ottimizzare risorse
    const processMap = new Map<string, Array<{ batch: StaggeredBatch; process: any }>>();
    
    batches.forEach(batch => {
      batch.scheduledProcesses.forEach(scheduledProcess => {
        scheduledProcess.scheduledDates.forEach(date => {
          const dateKey = date.toISOString().split('T')[0];
          if (!processMap.has(dateKey)) {
            processMap.set(dateKey, []);
          }
          processMap.get(dateKey)!.push({
            batch,
            process: scheduledProcess.process
          });
        });
      });
    });
    
    // Genera schedule coordinate
    processMap.forEach((dayProcesses, dateStr) => {
      const date = new Date(dateStr);
      
      // Raggruppa per tipo di processo
      const irrigationProcesses = dayProcesses.filter(p => p.process.processType === 'irrigation');
      const fertilizationProcesses = dayProcesses.filter(p => p.process.processType === 'fertilization');
      const treatmentProcesses = dayProcesses.filter(p => p.process.processType === 'treatment');
      const cultivationProcesses = dayProcesses.filter(p => p.process.processType === 'cultivation');
      
      if (irrigationProcesses.length > 0) {
        irrigationSchedule.push({
          date,
          batchesInvolved: irrigationProcesses.map(p => p.batch.batchNumber),
          waterRequirement: irrigationProcesses.reduce((sum, p) => sum + (p.batch.surfaceHectares * 300), 0), // 300L/ha
          duration: irrigationProcesses.length * 30 // 30 min per lotto
        });
      }
      
      if (fertilizationProcesses.length > 0) {
        fertilizationSchedule.push({
          date,
          batchesInvolved: fertilizationProcesses.map(p => p.batch.batchNumber),
          fertilizerType: 'NPK 15-15-15',
          quantity: fertilizationProcesses.reduce((sum, p) => sum + (p.batch.surfaceHectares * 200), 0), // 200kg/ha
          applicationMethod: 'Fertirrigazione'
        });
      }
      
      if (treatmentProcesses.length > 0) {
        treatmentSchedule.push({
          date,
          batchesInvolved: treatmentProcesses.map(p => p.batch.batchNumber),
          treatmentType: 'Preventivo',
          product: 'Fungicida + Insetticida biologico',
          weatherConditions: ['Assenza vento', 'Umidità < 80%', 'Temperatura 15-25°C']
        });
      }
      
      if (cultivationProcesses.length > 0) {
        cultivationSchedule.push({
          date,
          batchesInvolved: cultivationProcesses.map(p => p.batch.batchNumber),
          operation: cultivationProcesses[0].process.description,
          equipment: ['Trattore', 'Sarchiatrice'],
          laborHours: cultivationProcesses.reduce((sum, p) => sum + p.process.resources.laborHours, 0)
        });
      }
    });
    
    return {
      irrigationSchedule,
      fertilizationSchedule,
      treatmentSchedule,
      cultivationSchedule
    };
  }
  
  /**
   * Ottimizza uso risorse e risolve conflitti
   */
  private static optimizeResourceUsage(
    batches: StaggeredBatch[],
    resourceManagement: IntegratedStaggeringPlan['resourceManagement']
  ): IntegratedStaggeringPlan['optimization'] {
    
    const resourceConflicts: IntegratedStaggeringPlan['optimization']['resourceConflicts'] = [];
    const efficiencyGains: IntegratedStaggeringPlan['optimization']['efficiencyGains'] = [];
    
    // Identifica conflitti di risorse
    resourceManagement.irrigationSchedule.forEach(irrigation => {
      if (irrigation.batchesInvolved.length > 3) {
        resourceConflicts.push({
          date: irrigation.date,
          conflictType: 'Sovraccarico sistema irrigazione',
          affectedBatches: irrigation.batchesInvolved,
          resolution: 'Dividere irrigazione su 2 giorni consecutivi'
        });
      }
    });
    
    // Identifica opportunità di efficienza
    resourceManagement.treatmentSchedule.forEach(treatment => {
      if (treatment.batchesInvolved.length >= 2) {
        efficiencyGains.push({
          process: 'Trattamento fitosanitario',
          combinedBatches: treatment.batchesInvolved,
          savings: {
            laborHours: (treatment.batchesInvolved.length - 1) * 0.5,
            cost: (treatment.batchesInvolved.length - 1) * 30,
            equipment: ['Atomizzatore condiviso']
          }
        });
      }
    });
    
    return {
      resourceConflicts,
      efficiencyGains
    };
  }
  
  /**
   * Calcola giorni di raccolta dal range
   */
  private static calculateHarvestDays(startDate: Date, endDate: Date): number[] {
    const days: number[] = [];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Raccolta ogni 3-4 giorni
    for (let i = 0; i <= totalDays; i += 3) {
      days.push(i);
    }
    
    return days;
  }

  /**
   * Genera calendario integrato di tutti i processi
   */
  static generateIntegratedCalendar(
    plan: IntegratedStaggeringPlan
  ): Array<{
    date: Date;
    processes: Array<{
      type: ProcessSchedule['processType'];
      batches: number[];
      description: string;
      resources: string[];
      priority: 'high' | 'medium' | 'low';
    }>;
    workload: {
      laborHours: number;
      equipmentNeeded: string[];
      conflicts: boolean;
    };
  }> {
    
    const calendar = new Map<string, any>();
    
    // Aggiungi tutti i processi al calendario
    plan.batches.forEach(batch => {
      batch.scheduledProcesses.forEach(scheduledProcess => {
        scheduledProcess.scheduledDates.forEach(date => {
          const dateKey = date.toISOString().split('T')[0];
          
          if (!calendar.has(dateKey)) {
            calendar.set(dateKey, {
              date,
              processes: [],
              workload: {
                laborHours: 0,
                equipmentNeeded: new Set<string>(),
                conflicts: false
              }
            });
          }
          
          const dayData = calendar.get(dateKey);
          
          // Trova processo esistente dello stesso tipo
          let existingProcess = dayData.processes.find(
            (p: any) => p.type === scheduledProcess.process.processType
          );
          
          if (existingProcess) {
            existingProcess.batches.push(batch.batchNumber);
          } else {
            dayData.processes.push({
              type: scheduledProcess.process.processType,
              batches: [batch.batchNumber],
              description: scheduledProcess.process.description,
              resources: scheduledProcess.process.resources.equipment || [],
              priority: this.getProcessPriority(scheduledProcess.process.processType)
            });
          }
          
          // Aggiorna workload
          dayData.workload.laborHours += scheduledProcess.process.resources.laborHours;
          (scheduledProcess.process.resources.equipment || []).forEach((eq: string) => {
            dayData.workload.equipmentNeeded.add(eq);
          });
          
          // Rileva conflitti (più di 8 ore di lavoro)
          if (dayData.workload.laborHours > 8) {
            dayData.workload.conflicts = true;
          }
        });
      });
    });
    
    // Converti in array ordinato
    return Array.from(calendar.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(day => ({
        ...day,
        workload: {
          ...day.workload,
          equipmentNeeded: Array.from(day.workload.equipmentNeeded)
        }
      }));
  }

  /**
   * Determina priorità del processo
   */
  private static getProcessPriority(processType: ProcessSchedule['processType']): 'high' | 'medium' | 'low' {
    switch (processType) {
      case 'harvest':
        return 'high'; // Raccolta non può essere rimandata
      case 'treatment':
        return 'high'; // Trattamenti hanno finestre critiche
      case 'irrigation':
        return 'medium'; // Importante ma flessibile
      case 'fertilization':
        return 'medium'; // Importante ma flessibile
      case 'cultivation':
        return 'low'; // Può essere posticipata
      default:
        return 'medium';
    }
  }

  /**
   * Simula esecuzione piano e identifica problemi operativi
   */
  static simulateExecution(
    plan: IntegratedStaggeringPlan,
    constraints: {
      maxLaborHoursPerDay: number;
      availableEquipment: string[];
      weatherRisks: Array<{
        date: Date;
        riskType: string;
        severity: 'low' | 'medium' | 'high';
      }>;
    }
  ): {
    feasible: boolean;
    criticalIssues: Array<{
      date: Date;
      issue: string;
      severity: 'warning' | 'critical';
      suggestion: string;
    }>;
    adjustments: Array<{
      batchNumber: number;
      processType: string;
      originalDate: Date;
      suggestedDate: Date;
      reason: string;
    }>;
  } {
    
    const calendar = this.generateIntegratedCalendar(plan);
    const issues: any[] = [];
    const adjustments: any[] = [];
    
    calendar.forEach(day => {
      // Verifica sovraccarico manodopera
      if (day.workload.laborHours > constraints.maxLaborHoursPerDay) {
        issues.push({
          date: day.date,
          issue: `Sovraccarico manodopera: ${day.workload.laborHours}h richieste vs ${constraints.maxLaborHoursPerDay}h disponibili`,
          severity: 'critical',
          suggestion: 'Distribuire processi su giorni adiacenti o aumentare squadra'
        });
      }
      
      // Verifica disponibilità attrezzature
      const missingEquipment = day.workload.equipmentNeeded.filter(
        eq => !constraints.availableEquipment.includes(eq)
      );
      if (missingEquipment.length > 0) {
        issues.push({
          date: day.date,
          issue: `Attrezzature mancanti: ${missingEquipment.join(', ')}`,
          severity: 'warning',
          suggestion: 'Noleggiare attrezzature o riprogrammare attività'
        });
      }
      
      // Verifica rischi meteo
      const weatherRisk = constraints.weatherRisks.find(
        risk => risk.date.toDateString() === day.date.toDateString()
      );
      if (weatherRisk && weatherRisk.severity === 'high') {
        const criticalProcesses = day.processes.filter(p => p.priority === 'high');
        if (criticalProcesses.length > 0) {
          issues.push({
            date: day.date,
            issue: `Rischio meteo alto durante processi critici: ${criticalProcesses.map(p => p.type).join(', ')}`,
            severity: 'critical',
            suggestion: 'Anticipare o posticipare processi critici'
          });
        }
      }
    });
    
    return {
      feasible: issues.filter(i => i.severity === 'critical').length === 0,
      criticalIssues: issues,
      adjustments
    };
  }

  /**
   * Ottimizza piano esistente basandosi su dati reali
   */
  static optimizePlan(
    currentPlan: IntegratedStaggeringPlan,
    actualData: {
      completedBatches: Array<{
        batchNumber: number;
        actualYield: number;
        actualCosts: number;
        actualLaborHours: number;
        issues: string[];
      }>;
      weatherData: Array<{
        date: Date;
        temperature: number;
        rainfall: number;
        conditions: string;
      }>;
      marketPrices: Array<{
        date: Date;
        pricePerKg: number;
        demand: 'low' | 'medium' | 'high';
      }>;
    }
  ): IntegratedStaggeringPlan {
    
    // Analizza performance lotti completati
    const avgYieldVariance = actualData.completedBatches.reduce((sum, batch) => {
      const expectedYield = (currentPlan.totalSurface / currentPlan.batches.length) * 25; // 25 ton/ha base
      return sum + ((batch.actualYield - expectedYield) / expectedYield);
    }, 0) / actualData.completedBatches.length;
    
    // Aggiusta previsioni lotti futuri
    const optimizedPlan = { ...currentPlan };
    
    optimizedPlan.batches = optimizedPlan.batches.map(batch => {
      const isCompleted = actualData.completedBatches.some(cb => cb.batchNumber === batch.batchNumber);
      
      if (!isCompleted) {
        // Aggiusta timeline basandosi su dati meteo
        const avgTemperature = actualData.weatherData
          .filter(w => w.date >= new Date())
          .slice(0, 30)
          .reduce((sum, w) => sum + w.temperature, 0) / 30;
        
        if (avgTemperature > 25) {
          // Temperature alte: accelera crescita
          batch.timeline.harvestStart = new Date(batch.timeline.harvestStart.getTime() - 7 * 24 * 60 * 60 * 1000);
          batch.timeline.harvestEnd = new Date(batch.timeline.harvestEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (avgTemperature < 15) {
          // Temperature basse: rallenta crescita
          batch.timeline.harvestStart = new Date(batch.timeline.harvestStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          batch.timeline.harvestEnd = new Date(batch.timeline.harvestEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
        
        // Aggiusta processi basandosi su yield variance
        if (avgYieldVariance < -0.1) {
          // Rese sotto aspettative: intensifica fertilizzazione
          batch.scheduledProcesses.forEach(sp => {
            if (sp.process.processType === 'fertilization') {
              sp.process.resources.cost *= 1.2;
              sp.scheduledDates = [...sp.scheduledDates, new Date(sp.scheduledDates[0].getTime() + 14 * 24 * 60 * 60 * 1000)];
            }
          });
        }
      }
      
      return batch;
    });
    
    return optimizedPlan;
  }

  /**
   * Genera report di performance del piano
   */
  static generatePerformanceReport(
    plan: IntegratedStaggeringPlan,
    actualData: any
  ): {
    summary: {
      totalBatches: number;
      completedBatches: number;
      avgYieldPerHa: number;
      totalRevenue: number;
      totalCosts: number;
      actualROI: number;
    };
    batchPerformance: Array<{
      batchNumber: number;
      status: 'completed' | 'in_progress' | 'planned';
      yieldVariance: number;
      costVariance: number;
      timeVariance: number;
      issues: string[];
    }>;
    recommendations: string[];
  } {
    
    const completedBatches = actualData.completedBatches || [];
    const totalRevenue = completedBatches.reduce((sum: number, batch: any) => sum + (batch.actualYield * 2.5), 0); // €2.5/kg
    const totalCosts = completedBatches.reduce((sum: number, batch: any) => sum + batch.actualCosts, 0);
    
    return {
      summary: {
        totalBatches: plan.batches.length,
        completedBatches: completedBatches.length,
        avgYieldPerHa: completedBatches.reduce((sum: number, batch: any) => sum + batch.actualYield, 0) / completedBatches.length || 0,
        totalRevenue,
        totalCosts,
        actualROI: totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0
      },
      batchPerformance: plan.batches.map(batch => {
        const actualBatch = completedBatches.find((cb: any) => cb.batchNumber === batch.batchNumber);
        
        if (actualBatch) {
          const expectedYield = batch.surfaceHectares * 25;
          const expectedCost = batch.surfaceHectares * 8000;
          
          return {
            batchNumber: batch.batchNumber,
            status: 'completed' as const,
            yieldVariance: ((actualBatch.actualYield - expectedYield) / expectedYield) * 100,
            costVariance: ((actualBatch.actualCosts - expectedCost) / expectedCost) * 100,
            timeVariance: 0, // Da calcolare basandosi su date effettive
            issues: actualBatch.issues || []
          };
        }
        
        return {
          batchNumber: batch.batchNumber,
          status: 'planned' as const,
          yieldVariance: 0,
          costVariance: 0,
          timeVariance: 0,
          issues: []
        };
      }),
      recommendations: [
        'Monitora temperature per aggiustare timeline raccolta',
        'Considera aumento densità impianto nelle zone più produttive',
        'Implementa sistema di allerta meteo per processi critici'
      ]
    };
  }
}