/**
 * Naive Comparison Service
 * Confronta approccio naive (coltura non ottimale) vs approccio ottimizzato
 */

import { GardenPoint, GardenPointScore } from './gardenPointScorer';
import { RotationPlan } from './pointRotationGenerator';
import { getAllMasterSheets } from './plantMasterService';

export interface ComparisonResult {
  pointId: string;
  naiveApproach: {
    plant: string;
    resa: number; // kg
    rischioFallimento: number; // %
    cicli: number;
    consumoAcqua: number; // litri
    motivoFallimento?: string;
  };
  optimizedApproach: {
    resaTotale: number; // kg
    cicli: number;
    risparmioAcqua: number; // % rispetto naive
    colture: string[];
    motivoSuccesso: string;
  };
  guadagno: {
    resaExtra: number; // kg
    cicliExtra: number;
    risparmioAcquaLitri: number;
  };
}

/**
 * Confronta approccio naive vs ottimizzato per un punto dell'orto
 */
export function compareNaiveVsOptimized(
  point: GardenPoint,
  naivePlant: string,
  scores: GardenPointScore,
  rotation: RotationPlan[]
): ComparisonResult {
  const allPlants = getAllMasterSheets();
  const naivePlantMaster = allPlants.find((p) => p.commonName === naivePlant);

  // Determina score per la coltura naive
  let naiveScore = 0;
  let motivoFallimento = '';

  if (naivePlantMaster) {
    // Determina categoria della pianta naive
    const plantNameUpper = naivePlant.toUpperCase();
    if (['POMODORO', 'PEPERONE', 'MELANZANA', 'ZUCCHINA', 'CETRIOLO'].some(name => plantNameUpper.includes(name))) {
      naiveScore = scores.scores.ortoEstivo;
      if (naiveScore < 50) {
        motivoFallimento = 'Poco sole o temperatura non ottimale per colture estive';
      }
    } else if (['INSALATA', 'LATTUGA', 'SPINACIO', 'RUCOLA'].some(name => plantNameUpper.includes(name))) {
      naiveScore = scores.scores.fogliaPrimavera;
      if (naiveScore < 50) {
        motivoFallimento = 'Troppo sole o temperatura non adatta per foglie primaverili';
      }
    } else {
      naiveScore = scores.scores.aromatiche;
      if (naiveScore < 50) {
        motivoFallimento = 'Condizioni non ottimali per questa coltura';
      }
    }
  }

  // Calcola resa naive (ridotta se score basso)
  // Nota: PlantMasterSheet non ha proprietà yield, usiamo valore di default
  const resaBaseNaive = 3; // kg/m² default
  const resaNaive = Math.round((resaBaseNaive * naiveScore) / 100 * 10) / 10;

  // Rischio fallimento basato su score
  const rischioFallimento = naiveScore < 50 ? 70 : naiveScore < 70 ? 40 : 10;

  // Cicli naive (solo 1 se score basso)
  const cicliNaive = naiveScore >= 70 ? 1 : 0;

  // Consumo acqua naive (più alto se score basso per stress)
  // Nota: PlantMasterSheet non ha proprietà water, usiamo valore di default
  const consumoAcquaBase = 10; // litri/m²/settimana default
  const consumoAcquaNaive = Math.round(consumoAcquaBase * (naiveScore < 50 ? 1.5 : 1.0) * 10) / 10;

  // Calcola approccio ottimizzato
  const resaTotaleOttimizzata = rotation.reduce((sum, r) => sum + r.resaStimata, 0);
  const cicliOttimizzati = rotation.length;
  const coltureOttimizzate = rotation.map((r) => r.coltura);

  // Consumo acqua ottimizzato (più efficiente)
  const consumoAcquaOttimizzato = rotation.reduce((sum, r) => {
    // Nota: PlantMasterSheet non ha proprietà water, usiamo valore di default
    const waterPerWeek = 10; // litri/m²/settimana default
    const weeks = Math.ceil((r.fine.getTime() - r.inizio.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return sum + waterPerWeek * weeks;
  }, 0);

  const risparmioAcquaPercentuale = consumoAcquaNaive > 0
    ? Math.round(((consumoAcquaNaive - consumoAcquaOttimizzato) / consumoAcquaNaive) * 100)
    : 0;

  const motivoSuccesso = `Rotazione ottimizzata con ${cicliOttimizzati} cicli basata su score solare. Colture selezionate per massimizzare resa e minimizzare stress.`;

  // Calcola guadagni
  const resaExtra = Math.max(0, resaTotaleOttimizzata - resaNaive);
  const cicliExtra = Math.max(0, cicliOttimizzati - cicliNaive);
  const risparmioAcquaLitri = Math.max(0, consumoAcquaNaive - consumoAcquaOttimizzato);

  return {
    pointId: point.id,
    naiveApproach: {
      plant: naivePlant,
      resa: resaNaive,
      rischioFallimento,
      cicli: cicliNaive,
      consumoAcqua: consumoAcquaNaive,
      motivoFallimento: motivoFallimento || undefined,
    },
    optimizedApproach: {
      resaTotale: Math.round(resaTotaleOttimizzata * 10) / 10,
      cicli: cicliOttimizzati,
      risparmioAcqua: risparmioAcquaPercentuale,
      colture: coltureOttimizzate,
      motivoSuccesso,
    },
    guadagno: {
      resaExtra: Math.round(resaExtra * 10) / 10,
      cicliExtra,
      risparmioAcquaLitri: Math.round(risparmioAcquaLitri * 10) / 10,
    },
  };
}

