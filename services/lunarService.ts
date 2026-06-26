/**
 * @deprecated Use lunarPhaseService.ts directly.
 * This file exists only for backward compatibility.
 */

import {
  getLunarPhase,
  getPhaseDisplayName,
  getPhaseEmoji,
  isWaxingPhase,
  getIlluminationFraction,
  getDayInCycle,
  type LunarPhase,
} from './lunarPhaseService'

export interface LunarPhaseData {
  phase: string
  phaseEmoji: string
  illumination: number
  isWaxing: boolean
  dayInCycle: number
}

class LunarService {
  getLunarPhase(date: Date = new Date()): LunarPhaseData {
    const phase: LunarPhase = getLunarPhase(date)
    return {
      phase: getPhaseDisplayName(phase),
      phaseEmoji: getPhaseEmoji(phase),
      illumination: Math.round(getIlluminationFraction(date) * 100),
      isWaxing: isWaxingPhase(phase),
      dayInCycle: getDayInCycle(date),
    }
  }
}

export const createLunarService = () => new LunarService()
export default createLunarService
