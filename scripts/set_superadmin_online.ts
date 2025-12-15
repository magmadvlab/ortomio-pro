/**
 * Script to set superadmin tier online (for Vercel/Supabase Cloud)
 * Usage: 
 *   npx tsx scripts/set_superadmin_online.ts <email>
 * 
 * Or set environment variables:
 *   SUPERADMIN_EMAIL=your-email@example.com npx tsx scripts/set_superadmin_online.ts
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setSuperadminOnline(email: string) {
  console.log('🔐 Setting superadmin tier for:', email)

  try {
    // 1. Find user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      throw userError
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      console.log('\nAvailable users:')
      users.users.forEach(u => console.log(`  - ${u.email} (${u.id})`))
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`)

    // 2. Set tier to PRO_PROFESSIONAL
    console.log('🔧 Setting tier to PRO_PROFESSIONAL...')
    const { error: tierError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        tier: 'PRO_PROFESSIONAL',
        ai_credits_total: 999999,
        ai_credits_used: 0,
      }, {
        onConflict: 'id',
      })

    if (tierError) {
      throw tierError
    }

    console.log('✅ Tier set to PRO_PROFESSIONAL')
    console.log('✅ Credits set to 999999')

    // 3. Grant credits via function (optional, for logging)
    try {
      const { error: creditsError } = await supabase.rpc('admin_grant_credits', {
        p_user_id: user.id,
        p_amount: 999999,
      })

      if (creditsError && !creditsError.message.includes('already')) {
        console.warn('⚠️  Credits function error (non-critical):', creditsError.message)
      }
    } catch (e) {
      console.warn('⚠️  Credits function not available (non-critical)')
    }

    console.log('\n🎉 Superadmin configured successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 User ID: ${user.id}`)
    console.log('\n💡 You can now log in and access PRO features')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Get email from command line or environment
const email = process.argv[2] || process.env.SUPERADMIN_EMAIL

if (!email) {
  console.error('❌ Email required!')
  console.error('\nUsage:')
  console.error('  npx tsx scripts/set_superadmin_online.ts <email>')
  console.error('\nOr set environment variable:')
  console.error('  SUPERADMIN_EMAIL=your-email@example.com npx tsx scripts/set_superadmin_online.ts')
  process.exit(1)
}

setSuperadminOnline(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
