import { RaspberryCrop, RaspberryTask } from '../types/raspberry';
import { GardenTask } from '../types';

/**
 * Motore logico per gestione lamponi (Pro Feature)
 * Calcola task automatici basati su varietà, tipo canne e stagione
 */

export interface RaspberryTaskAdvice {
  taskType: 'CaneRemoval' | 'Pruning' | 'SupportInstallation' | 'Harvest' | 'Fertilization' | 'Propagation';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  dueDate: string; // ISO date string
  instructions: string[];
  canesType?: 'Primocane' | 'Floricane';
}

/**
 * Calcola task per gestione lamponi
 */
export const calculateRaspberryTasks = (
  crop: RaspberryCrop,
  currentDate: Date = new Date()
): RaspberryTaskAdvice[] => {
  const tasks: RaspberryTaskAdvice[] = [];
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // 1. RIMOZIONE CANNE ESAURITE (Dopo raccolta per Summer-bearing/Floricane)
  if (crop.varietyType === 'Summer-bearing' && crop.canesType === 'Floricane') {
    // Rimuovi canne floricane dopo la raccolta (agosto-settembre)
    if (currentMonth === 8 || currentMonth === 9) {
      tasks.push({
        taskType: 'CaneRemoval',
        priority: 'High',
        message: 'Rimuovi canne floricane esaurite dopo la raccolta',
        dueDate: new Date(currentYear, 7, 15).toISOString().split('T')[0], // 15 agosto
        instructions: [
          'Taglia alla base tutte le canne che hanno prodotto frutti (floricane)',
          'Lascia solo le canne primocane nuove (verdi, senza frutti)',
          'Le primocane produrranno l\'anno prossimo',
          'Disinfetta le cesoie tra una pianta e l\'altra',
          'Rimuovi canne deboli, malate o danneggiate'
        ],
        canesType: 'Floricane'
      });
    }
  }

  // 2. POTATURA INVERNALE (Dicembre-Febbraio)
  // Per varietà Summer-bearing: pota le primocane lasciando solo le più vigorose
  // Per varietà Ever-bearing/Fall-bearing: taglia tutte le canne a terra per produzione solo su primocane
  if (currentMonth === 12 || currentMonth === 1 || currentMonth === 2) {
    if (crop.varietyType === 'Summer-bearing') {
      tasks.push({
        taskType: 'Pruning',
        priority: 'High',
        message: 'Potatura invernale: seleziona e lega le canne primocane migliori',
        dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0], // 15 gennaio
        instructions: [
          'Seleziona 4-6 canne primocane più vigorose per pianta',
          'Taglia le canne deboli, malate o troppo fitte',
          'Accorcia le canne selezionate a 1.5-2m di altezza',
          'Lega le canne selezionate al trelis',
          'Rimuovi tutti i polloni basali eccetto quelli necessari per propagazione',
          'Mantieni 15-20cm tra le canne per favorire aereazione'
        ],
        canesType: 'Primocane'
      });
    } else if (crop.varietyType === 'Ever-bearing' || crop.varietyType === 'Fall-bearing') {
      // Per varietà rifiorenti: taglia tutte le canne a terra per produzione solo autunnale
      tasks.push({
        taskType: 'Pruning',
        priority: 'High',
        message: 'Potatura invernale: taglia tutte le canne a terra (produzione solo su primocane)',
        dueDate: new Date(currentYear, 0, 15).toISOString().split('T')[0], // 15 gennaio
        instructions: [
          'Taglia tutte le canne a livello del suolo',
          'Questo favorirà produzione solo su canne primocane nuove in autunno',
          'Rimuovi tutti i detriti e bruciali o compostali lontano dalle piante',
          'Se vuoi doppia produzione (estate + autunno), mantieni alcune canne floricane',
          'Disinfetta le cesoie dopo ogni pianta'
        ],
        canesType: 'Primocane'
      });
    }
  }

  // 3. INSTALLAZIONE SUPPORTI (Marzo-Aprile, se necessario)
  if (crop.supportRequired && crop.trainingSystem === 'Trellis' && (currentMonth === 3 || currentMonth === 4)) {
    tasks.push({
      taskType: 'SupportInstallation',
      priority: 'Medium',
      message: 'Verifica e installa supporti (trelis) per le canne',
      dueDate: new Date(currentYear, 2, 1).toISOString().split('T')[0], // 1 marzo
      instructions: [
        'Installa pali robusti ogni 3-4m lungo la fila',
        'Posiziona fili orizzontali a 60cm, 120cm e 180cm di altezza',
        'Usa filo zincato o plastificato resistente',
        'Lega le canne ai fili con legacci morbidi (rafia, filo plastificato)',
        'Mantieni le canne verticali per favorire aereazione e raccolta',
        'Verifica che i supporti siano stabili prima della crescita vigorosa'
      ]
    });
  }

  // 4. RACCOLTA (Durante harvestWindow)
  const isInHarvestWindow = 
    (currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth) ||
    (crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && 
     (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth));

  if (isInHarvestWindow) {
    tasks.push({
      taskType: 'Harvest',
      priority: 'High',
      message: 'Raccogli lamponi maturi ogni 2-3 giorni',
      dueDate: currentDate.toISOString().split('T')[0],
      instructions: [
        'Raccogli al mattino quando i frutti sono freschi e sodi',
        'I frutti maturi si staccano facilmente dal ricettacolo',
        'Raccogli solo frutti completamente maturi (non raccogliere acerbi)',
        'Usa contenitori bassi per evitare schiacciamenti',
        'Rimuovi frutti marci o danneggiati per prevenire malattie',
        'Raccogli regolarmente (ogni 2-3 giorni) durante la stagione',
        'Conserva in frigorifero subito dopo la raccolta'
      ],
      canesType: crop.canesType
    });
  }

  // 5. CONCIMAZIONE PRIMAVERILE (Marzo-Aprile)
  if (currentMonth === 3 || currentMonth === 4) {
    tasks.push({
      taskType: 'Fertilization',
      priority: 'Medium',
      message: 'Concimazione primaverile per supportare crescita canne',
      dueDate: new Date(currentYear, 2, 15).toISOString().split('T')[0], // 15 marzo
      instructions: [
        'Usa concime bilanciato NPK (es. 10-10-10) o organico maturo',
        'Applica 50-80g per pianta di concime',
        'Distribuisci uniformemente intorno alla base della pianta',
        'Lavora leggermente nel terreno e irriga dopo',
        'Evita concimi ad alto contenuto di azoto che favoriscono solo vegetazione'
      ]
    });
  }

  // 6. PROPAGAZIONE (Ottobre-Novembre o Marzo-Aprile)
  if (crop.propagationMethod === 'Suckers' && (currentMonth === 10 || currentMonth === 11 || currentMonth === 3 || currentMonth === 4)) {
    tasks.push({
      taskType: 'Propagation',
      priority: 'Low',
      message: 'Propagazione: rimuovi polloni basali per nuovi impianti',
      dueDate: new Date(currentYear, currentMonth === 10 || currentMonth === 11 ? 9 : 2, 15).toISOString().split('T')[0],
      instructions: [
        'Scava intorno ai polloni basali (suckers) che crescono dalla pianta madre',
        'Taglia il collegamento con la pianta madre mantenendo radici',
        'Trapianta i polloni in nuova posizione o vasi',
        'Mantieni terreno umido per favorire radicazione',
        'Rimuovi solo polloni vigorosi e sani',
        'Non rimuovere troppi polloni dalla stessa pianta madre'
      ]
    });
  }

  return tasks;
};

/**
 * Verifica se è il momento ottimale per la raccolta
 */
export const isOptimalHarvestTime = (
  crop: RaspberryCrop,
  currentDate: Date = new Date()
): boolean => {
  const currentMonth = currentDate.getMonth() + 1;
  return (
    (currentMonth >= crop.harvestWindow.startMonth && currentMonth <= crop.harvestWindow.endMonth) ||
    (crop.harvestWindow.startMonth > crop.harvestWindow.endMonth && 
     (currentMonth >= crop.harvestWindow.startMonth || currentMonth <= crop.harvestWindow.endMonth))
  );
};

/**
 * Calcola numero canne da rimuovere dopo raccolta
 */
export const calculateCanesToRemove = (
  crop: RaspberryCrop,
  totalCanes: number
): number => {
  if (crop.varietyType === 'Summer-bearing' && crop.canesType === 'Floricane') {
    // Rimuovi tutte le canne floricane esaurite (circa 50% delle canne totali)
    return Math.floor(totalCanes * 0.5);
  }
  return 0;
};


