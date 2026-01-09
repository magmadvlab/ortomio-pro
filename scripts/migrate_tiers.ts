/**
 * Migration script to update existing PRO users to PRO_CONSUMER
 * Run this after deploying the new tier system
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateTiers() {
  console.log('Starting tier migration...')
  
  try {
    // Find all users with tier = 'PRO'
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('tier', 'PRO')
    
    if (fetchError) {
      console.error('Error fetching profiles:', fetchError)
      return
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No PRO users found to migrate')
      return
    }
    
    console.log(`Found ${profiles.length} PRO users to migrate`)
    
    // Update each PRO user to PRO_CONSUMER
    for (const profile of profiles) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tier: 'PRO_CONSUMER' })
        .eq('id', profile.id)
      
      if (updateError) {
        console.error(`Error updating profile ${profile.id}:`, updateError)
        continue
      }
      
      // Grant initial credits (50 for PRO_CONSUMER)
      const { error: creditsError } = await supabase.rpc('grant_credits', {
        p_user_id: profile.id,
        p_amount: 50
      })
      
      if (creditsError) {
        console.error(`Error granting credits to ${profile.id}:`, creditsError)
      } else {
        // Log transaction
        await supabase.from('ai_credit_transactions').insert({
          user_id: profile.id,
          amount: 50,
          type: 'monthly_grant',
          description: 'Initial credits after migration to PRO_CONSUMER'
        })
      }
      
      console.log(`✓ Migrated user ${profile.id} to PRO_CONSUMER`)
    }
    
    console.log('Migration completed!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateTiers()






















