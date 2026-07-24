import { getSupabaseClient } from '@/config/supabase'
import type { SeasonAnalysis } from '@/types/memory'

export async function saveSeasonAdjustmentDecision(
  gardenId: string,
  year: number,
  season: SeasonAnalysis['season'],
  adjustments: SeasonAnalysis['nextYearAdjustments']
): Promise<void> {
  const client = getSupabaseClient()
  if (!client) throw new Error('Cloud season adjustment storage unavailable')
  if (!gardenId || !Number.isInteger(year) || adjustments.length === 0) {
    throw new Error('Season adjustment decision requires garden, year and adjustments')
  }
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) throw authError || new Error('User not authenticated')
  const { error } = await client.from('season_adjustment_decisions').upsert({
    garden_id: gardenId,
    user_id: user.id,
    season_year: year,
    season,
    adjustments,
    accepted_at: new Date().toISOString(),
  }, { onConflict: 'garden_id,season_year,season' })
  if (error) throw error
}
