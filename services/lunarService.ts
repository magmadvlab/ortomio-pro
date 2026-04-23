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

const PHASE_EMOJI: Record<MoonPhaseInfo['phase'], string> = {
  New: '🌑',
  WaxingCrescent: '🌒',
  FirstQuarter: '🌓',
  WaxingGibbous: '🌔',
  Full: '🌕',
  WaningGibbous: '🌖',
  LastQuarter: '🌗',
  WaningCrescent: '🌘',
}

const calculateIllumination = (daysInCycle: number): number => {
  const cycleRatio = daysInCycle / 29.53058867
  const illumination = (1 - Math.cos(cycleRatio * 2 * Math.PI)) / 2
  return illumination * 100
}

class LunarService {
  /**
   * Ottiene la fase lunare per una data specifica
   */
  getLunarPhase(date: Date = new Date()): LunarPhaseData {
    const moonInfo = calculateMoonPhase(date);
    
    return {
      phase: moonInfo.name,
      phaseEmoji: PHASE_EMOJI[moonInfo.phase],
      illumination: Math.round(calculateIllumination(moonInfo.daysInCycle)),
      isWaxing: moonInfo.isWaxing,
      dayInCycle: moonInfo.daysInCycle
    };
  }
}

export const createLunarService = () => new LunarService();
export default createLunarService;
