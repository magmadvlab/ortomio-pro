/**
 * Engine per lavorazioni meccaniche (aratura, fresatura)
 * Per terreni più grandi che utilizzano trattori e attrezzature
 */

import { Garden, GardenTask } from '../types';
import { getWeatherForecast } from '../services/weatherService';
import { convertToSqMeters } from '../utils/areaConverter';

// Work types
export type WorkType = 
  // Suolo (esistenti)
  | 'Plowing' | 'Subsoiling' | 'Harrowing' | 'Tilling' | 'Rolling' | 'Hoeing' | 'EarthingUp' | 'Mulching' | 'PostSowingRolling'
  // Preparazione Terreno (nuove)
  | 'Clearing' | 'Stumping' | 'StoneRemoval' | 'Leveling' | 'DeepSubsoiling'
  | 'Digging' | 'DeepHarrowing' | 'Crumbling' | 'Scraping' | 'SurfaceLeveling'
  // Tecniche Moderne
  | 'MinimumTillage' | 'StripTillage' | 'NoTill'
  // Chioma
  | 'FormativePruning' | 'MaintenancePruning' | 'RejuvenationPruning' | 'SummerPruning' | 'WinterPruning'
  | 'Thinning' | 'Suckering' | 'Defoliation' | 'Tying' | 'OliveShredding' | 'RunnerManagement'
  | 'StrawberryMulching' | 'StrawberryCleaning' | 'CaneRemoval' | 'TipPruning' | 'RaspberryTying'
  | 'SuckerThinning' | 'FruitBagging' | 'ExoticThinning' | 'Shredding'
  // Generale
  | 'Topping' | 'Pruning'

// Equipment types
export type EquipmentType = 
  // Trattore e attrezzi trattore
  | 'Tractor' | 'RotaryHarrow' | 'Shredder' | 'FertilizerSpreader' | 'Seeder'
  | 'Topper' | 'Defoliator' | 'PrePruner' | 'Thinner'
  // Piccoli mezzi
  | 'Rototiller' | 'Cultivator' | 'Mower' | 'BrushCutter' | 'TrackedCart' | 'BackpackSprayer'
  // Attrezzi elettrificati
  | 'ElectricTier' | 'ElectricPruner' | 'TelescopicPruner'
  // Manuale
  | 'Manual'

export interface MechanicalWorkAdvice {
  taskType: WorkType;
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  suggestedDate: string; // ISO date string - data suggerita
  instructions: string[];
  equipmentType: EquipmentType;
  equipmentAttachment?: string; // Attrezzo specifico quando equipmentType = 'Tractor'
  depth?: number; // cm
  area?: number; // m²
  weatherWarning?: string;
}

/**
 * Calcola suggerimenti per lavorazioni meccaniche (aratura e fresatura)
 * 
 * **Scopo**: Suggerisce quando eseguire aratura e fresatura per terreni più grandi che utilizzano
 * trattori e attrezzature meccaniche invece di lavorazioni manuali con zappa.
 * 
 * **Quando viene suggerito**:
 * - Solo per terreni > 1000 m² (1 are)
 * - Terreni più piccoli non ricevono suggerimenti (lavorazione manuale sufficiente)
 * 
 * **Cosa considera**:
 * - **Dimensione terreno**: Determina se suggerire trattore vs manuale
 *   - Terreni >= 5000 m²: Suggerisce trattore
 *   - Terreni 1000-5000 m²: Suggerisce manuale o trattore leggero
 * - **Stagione**: 
 *   - Aratura: Autunno/Inverno (Ottobre-Febbraio) - preparazione terreno per semine primaverili
 *   - Fresatura: Primavera (Marzo-Aprile) - preparazione letto di semina
 * - **Condizioni meteo**: Verifica previsioni pioggia per evitare lavorazioni con terreno bagnato
 * - **Task già completati**: Non suggerisce lavorazioni già eseguite
 * 
 * **Output**: Array di suggerimenti con:
 * - Tipo lavorazione (Plowing/Tilling)
 * - Data suggerita (`suggestedDate`)
 * - Priorità (High/Medium/Low)
 * - Istruzioni dettagliate
 * - Tipo attrezzatura consigliata
 * - Avvisi meteo se presenti
 * 
 * **Nota importante**: I suggerimenti hanno `suggestedDate` ma l'utente può completarli in data diversa.
 * La data effettiva viene tracciata con `actualCompletedDate` per ricalcolare correttamente i prossimi suggerimenti.
 * 
 * @param garden - Giardino per cui calcolare i suggerimenti
 * @param currentDate - Data corrente (default: oggi)
 * @param tasks - Array di task esistenti per verificare lavorazioni già completate
 * @returns Promise<MechanicalWorkAdvice[]> - Array di suggerimenti per lavorazioni meccaniche
 */
export async function calculateMechanicalWorkTasks(
  garden: Garden,
  currentDate: Date = new Date(),
  tasks: GardenTask[]
): Promise<MechanicalWorkAdvice[]> {
  const suggestions: MechanicalWorkAdvice[] = [];

  // Converti dimensione in m² se necessario
  const sizeInSqM = convertToSqMeters(
    garden.sizeSqMeters,
    garden.sizeUnit || 'sqm'
  );

  // Solo per terreni > 1000 m² (1 are)
  if (sizeInSqM < 1000) {
    return suggestions; // Terreno troppo piccolo per lavorazioni meccaniche
  }

  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Verifica lavorazioni già completate
  const completedPlowing = tasks.some(
    t => t.taskType === 'Plowing' && t.completed
  );
  const completedTilling = tasks.some(
    t => t.taskType === 'Tilling' && t.completed
  );

  // Determina tipo attrezzatura in base alla dimensione
  const equipmentType: 'Tractor' | 'Manual' = sizeInSqM >= 5000 ? 'Tractor' : 'Manual';

  // 1. ARATURA (Autunno/Inverno - Ottobre-Febbraio)
  // Aratura profonda per preparare il terreno per le semine primaverili
  if (!completedPlowing && (currentMonth >= 10 || currentMonth <= 2)) {
    const suggestedDate = new Date(currentYear, currentMonth === 10 || currentMonth === 11 || currentMonth === 12 ? currentMonth - 1 : 11, 15);
    
    // Verifica condizioni meteo
    let weatherWarning: string | undefined;
    if (garden.coordinates) {
      try {
        const weather = await getWeatherForecast(
          garden.coordinates.latitude,
          garden.coordinates.longitude
        );
        if (weather && weather.rainForecastMm > 10) {
          weatherWarning = `⚠️ Pioggia prevista (${weather.rainForecastMm.toFixed(1)}mm). Evita aratura con terreno bagnato.`;
        }
      } catch (error) {
        console.error('Error fetching weather for mechanical work:', error);
      }
    }

    suggestions.push({
      taskType: 'Plowing',
      priority: currentMonth === 11 || currentMonth === 12 || currentMonth === 1 ? 'High' : 'Medium',
      message: 'Aratura profonda per preparazione terreno',
      suggestedDate: suggestedDate.toISOString().split('T')[0],
      instructions: [
        'Esegui aratura profonda (30-40 cm) per arieggiare il terreno',
        'Lavora quando il terreno è in tempera (né troppo bagnato né troppo secco)',
        'Evita aratura con terreno gelato o eccessivamente bagnato',
        equipmentType === 'Tractor' 
          ? 'Usa aratro a versoio o ripuntatore per terreni compatti'
          : 'Per terreni più piccoli, considera vangatura profonda manuale',
        'Dopo aratura, lascia il terreno esposto alle intemperie per migliorare struttura',
        'Programma aratura almeno 2-3 settimane prima delle semine primaverili'
      ],
      equipmentType,
      depth: equipmentType === 'Tractor' ? 35 : 25,
      area: sizeInSqM,
      weatherWarning
    });
  }

  // 2. FRESATURA (Primavera - Marzo-Aprile)
  // Fresatura superficiale per preparare il letto di semina
  if (!completedTilling && (currentMonth === 3 || currentMonth === 4)) {
    const suggestedDate = new Date(currentYear, currentMonth - 1, 10);
    
    // Verifica condizioni meteo
    let weatherWarning: string | undefined;
    if (garden.coordinates) {
      try {
        const weather = await getWeatherForecast(
          garden.coordinates.latitude,
          garden.coordinates.longitude
        );
        if (weather && weather.rainForecastMm > 5) {
          weatherWarning = `⚠️ Pioggia prevista. Attendi terreno asciutto per fresatura.`;
        }
      } catch (error) {
        console.error('Error fetching weather for mechanical work:', error);
      }
    }

    suggestions.push({
      taskType: 'Tilling',
      priority: 'High',
      message: 'Fresatura superficiale per preparazione letto di semina',
      suggestedDate: suggestedDate.toISOString().split('T')[0],
      instructions: [
        'Esegui fresatura superficiale (15-20 cm) per affinare il terreno',
        'Rimuovi erbe infestanti e sassi',
        'Livella il terreno per facilitare semina e irrigazione',
        equipmentType === 'Tractor'
          ? 'Usa fresa rotativa o erpice rotante'
          : 'Per piccole superfici, usa zappa o motozappa',
        'Non fresare terreno troppo bagnato per evitare compattazione',
        'Dopo fresatura, attendi 2-3 giorni prima di seminare per stabilizzazione'
      ],
      equipmentType,
      depth: equipmentType === 'Tractor' ? 18 : 15,
      area: sizeInSqM,
      weatherWarning
    });
  }

  return suggestions;
}
