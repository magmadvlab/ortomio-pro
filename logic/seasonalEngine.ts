/**
 * Seasonal Engine
 * Provides seasonal-specific advice (baulatura, sarchiatura, fertirrigazione)
 */

import { getSeasonForDate, Season } from '../utils/seasonalAdjustment';

export interface SeasonalAdvice {
  type: 'Baulatura' | 'Sarchiatura' | 'Fertirrigazione' | 'Pacciamatura';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  instructions: string[];
  timing: string;
}

/**
 * Get seasonal advice based on soil type and season
 */
export const getSeasonalAdvice = (
  soilType: 'Clay' | 'Sandy' | 'Loamy' | 'Peaty' | 'Chalky' | 'Silty',
  season: Season,
  currentDate: Date = new Date(),
  latitude: number = 0
): SeasonalAdvice | null => {
  const currentMonth = currentDate.getMonth(); // 0-11
  const actualSeason = getSeasonForDate(currentDate, latitude);
  // Winter: Baulatura for Clay soil
  if (season === 'Winter' && soilType === 'Clay' && (currentMonth >= 10 || currentMonth <= 2)) {
    return {
      type: 'Baulatura',
      priority: 'High',
      message: 'Terreno argilloso in inverno: crea baulature per migliorare drenaggio',
      instructions: [
        'Crea collinette alte 15-20cm lungo le file',
        'Pianta sulla sommità della baulatura',
        'Questo evita ristagni d\'acqua invernali',
        'Le baulature si scalderanno prima in primavera',
      ],
      timing: 'Prima della semina/trapianto invernale',
    };
  }

  // Summer: Sarchiatura for Clay soil
  if (season === 'Summer' && soilType === 'Clay' && currentMonth >= 5 && currentMonth <= 8) {
    return {
      type: 'Sarchiatura',
      priority: 'Medium',
      message: 'Sarchiatura estiva: rompi la crosta superficiale per ridurre evaporazione',
      instructions: [
        'Zappa leggermente la superficie (2-3cm)',
        'Interrompe la risalita capillare dell\'acqua',
        'Equivalente a risparmiare una sessione di irrigazione',
        'Fai dopo ogni pioggia o irrigazione abbondante',
      ],
      timing: 'Dopo pioggia o irrigazione, quando terreno è asciutto in superficie',
    };
  }

  // Summer: Fertirrigazione for Sandy soil
  if (season === 'Summer' && soilType === 'Sandy' && currentMonth >= 5 && currentMonth <= 8) {
    return {
      type: 'Fertirrigazione',
      priority: 'High',
      message: 'Terreno sabbioso in estate: usa fertirrigazione per nutrire senza sprecare',
      instructions: [
        'Sciogli concime liquido nell\'acqua di irrigazione',
        'Dose dimezzata rispetto a terreno normale',
        'Frequenza raddoppiata (ogni 7-10 giorni)',
        'La sabbia non trattiene nutrienti - fraziona le dosi',
      ],
      timing: 'Durante irrigazione serale, ogni 7-10 giorni',
    };
  }

  // Summer: Pacciamatura for all soil types
  if (season === 'Summer' && currentMonth >= 5 && currentMonth <= 8) {
    return {
      type: 'Pacciamatura',
      priority: 'High',
      message: 'Pacciamatura estiva: riduce evaporazione e mantiene umidità',
      instructions: [
        'Stendi 5-10cm di paglia, corteccia o erba secca',
        'Lascia spazio intorno al colletto delle piante',
        'Riduce bisogno irrigazione del 30-40%',
        'Previene crescita erbacce',
      ],
      timing: 'Dopo trapianto o quando piante sono stabilizzate',
    };
  }

  return null;
};

