/**
 * Point Rotation Generator Service
 * Genera rotazione ottimale per un punto dell'orto basandosi su score e finestre stagionali
 */

import { GardenPoint, GardenPointScore } from './gardenPointScorer';
import { SeasonalSunWindow } from './seasonalSunWindows';
import { Garden } from '../types';
import { getAllMasterSheets } from './plantMasterService';

export interface RotationPlan {
  coltura: string;
  inizio: Date;
  fine: Date;
  metodo: 'Seed' | 'Seedling';
  resaStimata: number; // kg
  categoria: 'Estivo' | 'Primaverile' | 'Autunnale' | 'FogliaEstiva';
}

/**
 * Genera rotazione ottimale per un punto dell'orto
 * 
 * Algoritmo:
 * 1. Ordina categorie per score (dal più alto)
 * 2. Per ogni categoria con score ≥70%:
 *    - Trova finestra di impianto ottimale
 *    - Calcola durata ciclo coltura
 *    - Verifica sovrapposizioni con colture già pianificate
 *    - Aggiungi alla rotazione se possibile
 * 3. Ottimizza date per massimizzare cicli
 */
export function generatePointRotation(
  point: GardenPoint,
  scores: GardenPointScore,
  windows: SeasonalSunWindow[],
  soilType?: Garden['soilType'],
  altitudeMeters?: number
): RotationPlan[] {
  const rotation: RotationPlan[] = [];
  const allPlants = getAllMasterSheets();
  const currentYear = new Date().getFullYear();

  // Ordina raccomandazioni per score (dal più alto)
  const sortedRecommendations = [...scores.recommendations].sort(
    (a, b) => b.score - a.score
  );

  // Mappa categorie a piante disponibili
  const categoryPlants: Record<string, string[]> = {
    'Orto Estivo': ['Pomodoro', 'Peperone', 'Melanzana', 'Zucchina', 'Cetriolo'],
    'Foglia Primavera': ['Insalata', 'Spinaci', 'Rucola', 'Bietola', 'Cipolla'],
    'Foglia Estate': ['Lattuga', 'Basilico', 'Prezzemolo', 'Coriandolo'],
    'Aromatiche': ['Basilico', 'Prezzemolo', 'Menta', 'Rosmarino', 'Salvia'],
  };

  // Per ogni raccomandazione con score ≥70%
  for (const rec of sortedRecommendations) {
    if (rec.score < 70) continue;

    const plants = categoryPlants[rec.category] || [];
    if (plants.length === 0) continue;

    // Trova finestra stagionale corrispondente
    let targetWindow: SeasonalSunWindow | undefined;
    let startMonth = 1;
    let endMonth = 12;

    if (rec.category === 'Orto Estivo') {
      targetWindow = windows.find((w) => w.period === 'Giu-Lug');
      startMonth = 5; // Maggio
      endMonth = 8; // Agosto
    } else if (rec.category === 'Foglia Primavera') {
      targetWindow = windows.find((w) => w.period === 'Feb-Mar') || windows.find((w) => w.period === 'Apr-Mag');
      startMonth = 2; // Febbraio
      endMonth = 5; // Maggio
    } else if (rec.category === 'Foglia Estate') {
      targetWindow = windows.find((w) => w.period === 'Giu-Lug');
      startMonth = 5; // Maggio
      endMonth = 9; // Settembre
    } else if (rec.category === 'Aromatiche') {
      // Aromatiche possono essere piantate in qualsiasi periodo con buon sole
      targetWindow = windows.find((w) => w.avgHours >= 3);
      startMonth = 4; // Aprile
      endMonth = 9; // Settembre
    }

    if (!targetWindow) continue;

    // Scegli prima pianta disponibile
    const plantName = plants[0];
    const plantMaster = allPlants.find((p) => p.commonName === plantName);
    if (!plantMaster) continue;

    // Calcola date di impianto
    // Usa cycleDurationDays da aiMetadata.timeline se disponibile, altrimenti default 60 giorni
    const cycleDays = plantMaster.aiMetadata?.timeline?.cycleDurationDays || 60;
    const inizio = new Date(currentYear, startMonth - 1, 15); // Metà mese
    const fine = new Date(inizio);
    fine.setDate(fine.getDate() + cycleDays);

    // Verifica sovrapposizioni con rotazioni esistenti
    const overlaps = rotation.some((r) => {
      return (
        (inizio >= r.inizio && inizio <= r.fine) ||
        (fine >= r.inizio && fine <= r.fine) ||
        (inizio <= r.inizio && fine >= r.fine)
      );
    });

    if (overlaps) {
      // Prova a spostare la data per evitare sovrapposizioni
      const lastRotation = rotation[rotation.length - 1];
      if (lastRotation) {
        inizio.setTime(lastRotation.fine.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 giorni
        fine.setTime(inizio.getTime() + cycleDays * 24 * 60 * 60 * 1000);
      }
    }

    // Determina categoria per tipo
    let categoria: RotationPlan['categoria'] = 'Primaverile';
    if (rec.category === 'Orto Estivo') categoria = 'Estivo';
    else if (rec.category === 'Foglia Estate') categoria = 'FogliaEstiva';
    else if (startMonth >= 8) categoria = 'Autunnale';

    // Stima resa basata su score
    const resaBase = rec.resaStimata || 3;
    const resaStimata = Math.round((resaBase * rec.score) / 100 * 10) / 10;

    rotation.push({
      coltura: plantName,
      inizio,
      fine,
      metodo: 'Seedling', // Default, può essere aggiustato
      resaStimata,
      categoria,
    });

    // Limita a max 5 rotazioni per punto
    if (rotation.length >= 5) break;
  }

  return rotation;
}

