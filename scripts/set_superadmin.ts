#!/usr/bin/env tsx
/**
 * Script universale per impostare superadmin sia locale che remoto
 * 
 * Usage locale:
 *   npx tsx scripts/set_superadmin.ts roberto.lalinga@gmail.com
 * 
 * Usage remoto (con variabili ambiente):
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/set_superadmin.ts roberto.lalinga@gmail.com
 * 
 * Oppure usa .env.local per le credenziali remote
 */

import { createClient } from '@supabase/supabase-js'

// Determina se siamo in locale o remoto
const isLocal = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost') || 
                process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1') ||
                !process.env.NEXT_PUBLIC_SUPABASE_URL

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    'http://127.0.0.1:54321'

// Per operazioni admin, usa service role key se disponibile, altrimenti anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                    process.env.VITE_SUPABASE_ANON_KEY ||
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setSuperadmin(email: string) {
  console.log(`🔐 Setting superadmin tier for: ${email}`)
  console.log(`📍 Environment: ${isLocal ? 'LOCAL' : 'REMOTE'}`)
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`)

  try {
    let user: { id: string; email: string } | null = null

    if (isLocal) {
      // In locale, usa query diretta al database
      console.log('🔍 Searching user in local database...')
      
      // Prova prima con l'API auth se disponibile
      try {
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()
        
        if (!userError && users?.users) {
          const foundUser = users.users.find(u => u.email === email)
          if (foundUser) {
            user = { id: foundUser.id, email: foundUser.email || email }
          }
        }
      } catch (e) {
        console.log('⚠️  Admin API not available, using direct database query...')
      }

      // Se non trovato, usa query diretta tramite Supabase (solo locale)
      if (!user) {
        try {
          // Prova a usare RPC o query diretta tramite Supabase
          const { data: userData, error: queryError } = await supabase
            .from('auth.users')
            .select('id, email')
            .eq('email', email)
            .single()
          
          if (!queryError && userData) {
            user = userData as { id: string; email: string }
          }
        } catch (e) {
          // Se anche questo fallisce, l'utente non esiste
          console.log('⚠️  Direct query not available')
        }
      }
    } else {
      // In remoto, usa Admin API
      console.log('🔍 Searching user via Admin API...')
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) {
        throw userError
      }

      const foundUser = users.users.find(u => u.email === email)
      if (foundUser) {
        user = { id: foundUser.id, email: foundUser.email || email }
      }
    }

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      
      if (isLocal) {
        console.log('\n💡 To create the user locally, run:')
        console.log(`   psql postgresql://postgres:postgres@127.0.0.1:54324/postgres -c "INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', '${email}', crypt('your-password', gen_salt('bf')), NOW(), '{\"provider\":\"email\",\"providers\":[\"email\"]}', '{}', NOW(), NOW()) RETURNING id, email;"`)
      } else {
        console.log('\n💡 Create the user first via the registration page or Supabase Dashboard')
      }
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (${user.id})\n`)

    // Set tier to PRO with unlimited credits
    console.log('🔧 Setting tier to PRO...')
    const { error: tierError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        tier: 'PRO',
        ai_credits_total: 999999,
        ai_credits_used: 0,
      }, {
        onConflict: 'id',
      })

    if (tierError) {
      throw tierError
    }

    console.log('✅ Tier set to PRO')
    console.log('✅ Credits set to 999999')

    // Try to grant credits via function (optional, for logging)
    try {
      const { error: creditsError } = await supabase.rpc('admin_grant_credits', {
        p_user_id: user.id,
        p_amount: 999999,
      })

      if (creditsError && !creditsError.message.includes('already')) {
        console.warn('⚠️  Credits function error (non-critical):', creditsError.message)
      } else {
        console.log('✅ Credits granted via function')
      }
    } catch (e) {
      console.warn('⚠️  Credits function not available (non-critical)')
    }

    console.log('\n🎉 Superadmin configured successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 User ID: ${user.id}`)
    console.log(`📍 Environment: ${isLocal ? 'LOCAL' : 'REMOTE'}`)
    console.log('\n💡 You can now log in and access PRO features')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    process.exit(1)
  }
}

// Get email from command line or environment
const email = process.argv[2] || process.env.SUPERADMIN_EMAIL

if (!email) {
  console.error('❌ Email required!')
  console.error('\nUsage:')
  console.error('  npx tsx scripts/set_superadmin.ts <email>')
  console.error('\nOr set environment variable:')
  console.error('  SUPERADMIN_EMAIL=your-email@example.com npx tsx scripts/set_superadmin.ts')
  console.error('\nFor remote Supabase, also set:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

setSuperadmin(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

