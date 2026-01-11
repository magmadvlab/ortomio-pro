/**
 * Badge System - Sistema Gamification
 * Gestione badge, award, verifica possesso
 */

export interface BadgeInfo {
  id: string; // formato: "challenge_22_4" o "streak_7", "streak_30"
  nome: string;
  emoji: string;
  descrizione: string;
  earned_at?: Date;
}

/**
 * Award badge a un utente
 * @param userId ID utente
 * @param badgeInfo Informazioni badge
 * @returns true se badge assegnato, false se già posseduto
 */
export async function awardBadge(
  userId: string,
  badgeInfo: BadgeInfo
): Promise<boolean> {
  try {
    // Verifica se badge già posseduto
    const alreadyEarned = await checkBadgeEarned(userId, badgeInfo.id);
    if (alreadyEarned) {
      return false; // Già posseduto
    }
    
    // Salva badge (localStorage per FREE, Supabase per PRO)
    const badgeData: BadgeInfo = {
      id: badgeInfo.id,
      nome: badgeInfo.nome,
      emoji: badgeInfo.emoji,
      descrizione: badgeInfo.descrizione,
      earned_at: new Date()
    };
    
    // Salva in localStorage (temporaneo, poi migrare a Supabase)
    // Solo nel browser
    if (typeof window !== 'undefined') {
      const badges = getUserBadges(userId);
      badges.push(badgeData);
      localStorage.setItem(`user_badges_${userId}`, JSON.stringify(badges));
    }
    
    return true;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
}

/**
 * Verifica se utente ha già guadagnato un badge
 * @param userId ID utente
 * @param badgeId ID badge
 * @returns true se posseduto, false altrimenti
 */
export async function checkBadgeEarned(
  userId: string,
  badgeId: string
): Promise<boolean> {
  try {
    const badges = getUserBadges(userId);
    return badges.some(b => b.id === badgeId);
  } catch (error) {
    console.error('Error checking badge:', error);
    return false;
  }
}

/**
 * Ottiene lista badge utente
 * @param userId ID utente
 * @returns Array di badge guadagnati
 */
export function getUserBadges(userId: string): BadgeInfo[] {
  // Durante SSR, ritorna array vuoto
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(`user_badges_${userId}`);
    if (!stored) return [];
    
    const badges = JSON.parse(stored);
    return badges.map((b: any) => ({
      id: b.id || b.badge_id,
      nome: b.nome || b.badge_name,
      emoji: b.emoji || b.badge_emoji,
      descrizione: b.descrizione || b.badge_description,
      earned_at: b.earned_at ? new Date(b.earned_at) : undefined
    }));
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Ottiene badge per challenge specifica
 * @param userId ID utente
 * @param challengeId ID challenge (formato: "giorno-mese")
 * @returns BadgeInfo o null
 */
export function getBadgeForChallenge(
  userId: string,
  challengeId: string
): BadgeInfo | null {
  const badgeId = `challenge_${challengeId.replace('-', '_')}`;
  const badges = getUserBadges(userId);
  return badges.find(b => b.id === badgeId) || null;
}

/**
 * Ottiene badge streak
 * @param userId ID utente
 * @param streakDays Giorni streak (7, 30, 100)
 * @returns BadgeInfo o null
 */
export function getStreakBadge(
  userId: string,
  streakDays: number
): BadgeInfo | null {
  const badgeId = `streak_${streakDays}`;
  const badges = getUserBadges(userId);
  return badges.find(b => b.id === badgeId) || null;
}

/**
 * Statistiche badge utente
 */
export function getBadgeStats(userId: string): {
  total: number;
  byType: {
    challenge: number;
    streak: number;
    other: number;
  };
  recent: BadgeInfo[]; // Ultimi 5 badge guadagnati
} {
  const badges = getUserBadges(userId);
  
  return {
    total: badges.length,
    byType: {
      challenge: badges.filter(b => b.id.startsWith('challenge_')).length,
      streak: badges.filter(b => b.id.startsWith('streak_')).length,
      other: badges.filter(b => !b.id.startsWith('challenge_') && !b.id.startsWith('streak_')).length
    },
    recent: badges
      .sort((a, b) => {
        const aDate = a.earned_at?.getTime() || 0;
        const bDate = b.earned_at?.getTime() || 0;
        return bDate - aDate;
      })
      .slice(0, 5)
  };
}
