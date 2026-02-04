/**
 * Lunar Service
 * Wrapper per le funzioni lunari da logic/lunarCalendar
 */

import { calculateMoonPhase, MoonPhaseInfo } from '../logic/lunarCalendar';

export interface LunarPhaseData {
  phase: string;
  phaseEmoji: string;
  illumination: number;
  isWaxing: boolean;
  dayInCycle: number;
}

class LunarService {
  /**
   * Ottiene la fase lunare per una data specifica
   */
  getLunarPhase(date: Date = new Date()): LunarPhaseData {
    const moonInfo = calculateMoonPhase(date);
    
    return {
      phase: moonInfo.name,
      phaseEmoji: moonInfo.emoji,
      illumination: Math.round(moonInfo.illumination),
      isWaxing: moonInfo.isWaxing,
      dayInCycle: moonInfo.dayInCycle
    };
  }
}

export const createLunarService = () => new LunarService();
export default createLunarService;
