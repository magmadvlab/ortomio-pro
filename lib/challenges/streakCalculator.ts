/**
 * Streak Calculator - Calcolo streak giorni consecutivi
 * Logica: se ultima completion < 2 giorni fa, incrementa streak
 * Se > 2 giorni, reset streak
 * Badge automatici: streak_7, streak_30, streak_100
 */

export interface StreakData {
  current: number; // Streak corrente
  longest: number; // Streak più lungo mai raggiunto
  lastDate: Date | null; // Data ultima completion
}

/**
 * Calcola e aggiorna streak utente
 * @param userId ID utente
 * @param completionDate Data completamento challenge (default: oggi)
 * @returns Nuovo streak data
 */
export async function updateStreak(
  userId: string,
  completionDate: Date = new Date()
): Promise<StreakData> {
  try {
    const currentStreak = getStreak(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completionDay = new Date(completionDate);
    completionDay.setHours(0, 0, 0, 0);
    
    let newStreak = currentStreak.current;
    let newLongest = currentStreak.longest;
    let newLastDate = completionDay;
    
    // Se non c'è ultima data, inizia streak
    if (!currentStreak.lastDate) {
      newStreak = 1;
      newLongest = 1;
    } else {
      const lastDate = new Date(currentStreak.lastDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor(
        (completionDay.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === 0) {
        // Stesso giorno, non incrementare
        return currentStreak;
      } else if (daysDiff === 1) {
        // Giorno consecutivo, incrementa streak
        newStreak = currentStreak.current + 1;
        newLongest = Math.max(newStreak, currentStreak.longest);
      } else if (daysDiff <= 2) {
        // 2 giorni di differenza, continua streak (perdona 1 giorno)
        newStreak = currentStreak.current + 1;
        newLongest = Math.max(newStreak, currentStreak.longest);
      } else {
        // > 2 giorni, reset streak
        newStreak = 1;
        newLongest = currentStreak.longest; // Mantieni longest
      }
    }
    
    const newStreakData: StreakData = {
      current: newStreak,
      longest: newLongest,
      lastDate: newLastDate
    };
    
    // Salva streak (localStorage per FREE, Supabase per PRO)
    saveStreak(userId, newStreakData);
    
    // Award badge automatici per milestone
    await checkStreakBadges(userId, newStreak);
    
    return newStreakData;
  } catch (error) {
    console.error('Error updating streak:', error);
    return currentStreak;
  }
}

/**
 * Ottiene streak corrente utente
 * @param userId ID utente
 * @returns StreakData
 */
export function getStreak(userId: string): StreakData {
  try {
    const stored = localStorage.getItem(`user_streak_${userId}`);
    if (!stored) {
      return {
        current: 0,
        longest: 0,
        lastDate: null
      };
    }
    
    const data = JSON.parse(stored);
    return {
      current: data.current || 0,
      longest: data.longest || 0,
      lastDate: data.lastDate ? new Date(data.lastDate) : null
    };
  } catch (error) {
    console.error('Error getting streak:', error);
    return {
      current: 0,
      longest: 0,
      lastDate: null
    };
  }
}

/**
 * Salva streak (localStorage per ora)
 */
function saveStreak(userId: string, streakData: StreakData): void {
  try {
    localStorage.setItem(
      `user_streak_${userId}`,
      JSON.stringify({
        current: streakData.current,
        longest: streakData.longest,
        lastDate: streakData.lastDate?.toISOString() || null
      })
    );
  } catch (error) {
    console.error('Error saving streak:', error);
  }
}

/**
 * Verifica e assegna badge streak per milestone
 */
async function checkStreakBadges(userId: string, streak: number): Promise<void> {
  const milestones = [7, 30, 100];
  
  for (const milestone of milestones) {
    if (streak === milestone) {
      const { awardBadge } = await import('./badgeSystem');
      
      await awardBadge(userId, {
        id: `streak_${milestone}`,
        nome: `Streak ${milestone} Giorni`,
        emoji: milestone === 7 ? '🔥' : milestone === 30 ? '💪' : '👑',
        descrizione: `Hai completato challenge per ${milestone} giorni consecutivi!`
      });
    }
  }
}

/**
 * Reset streak (per testing o reset manuale)
 */
export function resetStreak(userId: string): void {
  saveStreak(userId, {
    current: 0,
    longest: 0,
    lastDate: null
  });
}
