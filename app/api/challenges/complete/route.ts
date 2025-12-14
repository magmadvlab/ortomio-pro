/**
 * Challenge Completion API
 * Salva challenge completions, award badge, update punti e streak
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardBadge } from '../../../../lib/challenges/badgeSystem';
import { updateStreak } from '../../../../lib/challenges/streakCalculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/challenges/complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      challenge_id, 
      actions_completed, 
      photo_url,
      points_awarded,
      badge_earned
    } = body;
    
    if (!user_id || !challenge_id || !points_awarded) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, challenge_id, points_awarded' },
        { status: 400 }
      );
    }
    
    // 1. Verifica se challenge già completata
    const { data: existing } = await supabase
      .from('challenge_completions')
      .select('id')
      .eq('user_id', user_id)
      .eq('challenge_id', challenge_id)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'Challenge already completed' },
        { status: 400 }
      );
    }
    
    // 2. Salva completion
    const { data: completion, error: completionError } = await supabase
      .from('challenge_completions')
      .insert({
        user_id,
        challenge_id,
        actions_completed: actions_completed || [],
        photo_url: photo_url || null,
        points_awarded,
        badge_earned: badge_earned || null
      })
      .select()
      .single();
    
    if (completionError) {
      console.error('Error saving challenge completion:', completionError);
      return NextResponse.json(
        { error: completionError.message },
        { status: 500 }
      );
    }
    
    // 3. Award badge (se non già posseduto)
    if (badge_earned) {
      const badgeParts = badge_earned.split(' ');
      const badgeEmoji = badgeParts[0];
      const badgeName = badgeParts.slice(1).join(' ');
      
      await awardBadge(user_id, {
        id: `challenge_${challenge_id.replace('-', '_')}`,
        nome: badgeName,
        emoji: badgeEmoji,
        descrizione: `Badge guadagnato completando challenge ${challenge_id}`
      });
    }
    
    // 4. Update punti totali utente
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_points')
      .eq('id', user_id)
      .single();
    
    const newTotalPoints = (profile?.total_points || 0) + points_awarded;
    
    await supabase
      .from('profiles')
      .update({ total_points: newTotalPoints })
      .eq('id', user_id);
    
    // 5. Update streak
    const streakData = await updateStreak(user_id);
    
    return NextResponse.json({
      success: true,
      completion,
      points_awarded,
      total_points: newTotalPoints,
      streak: streakData
    });
  } catch (error) {
    console.error('Error in POST /api/challenges/complete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/challenges/complete?user_id=&challenge_id=
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const challengeId = searchParams.get('challenge_id');
    
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }
    
    let query = supabase
      .from('challenge_completions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });
    
    if (challengeId) {
      query = query.eq('challenge_id', challengeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching challenge completions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ completions: data || [] });
  } catch (error) {
    console.error('Error in GET /api/challenges/complete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
