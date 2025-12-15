/**
 * Script to create superadmin user
 * Usage: npx tsx scripts/create_superadmin.ts
 */

import { getSupabaseClient } from '../config/supabase';

async function createSuperadmin() {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('❌ Supabase client not available');
    process.exit(1);
  }

  const email = process.env.SUPERADMIN_EMAIL || 'admin@ortomio.ai';
  const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

  console.log('🔐 Creating superadmin user...');
  console.log(`📧 Email: ${email}`);

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/app`,
      },
    });

    if (authError) {
      // If user already exists, try to sign in
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists, signing in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('❌ Error signing in:', signInError.message);
          console.log('💡 Try resetting password or use existing credentials');
          process.exit(1);
        }

        console.log('✅ Signed in successfully');
        const userId = signInData.user.id;
        await setSuperadminTier(userId);
        return;
      }

      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    console.log('✅ User created:', authData.user.id);

    // 2. Set tier to PRO_PROFESSIONAL
    await setSuperadminTier(authData.user.id);

    console.log('\n🎉 Superadmin created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\n💡 You can now log in with these credentials');

  } catch (error: any) {
    console.error('❌ Error creating superadmin:', error.message);
    process.exit(1);
  }
}

async function setSuperadminTier(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  console.log('🔧 Setting tier to PRO_PROFESSIONAL...');

  // Update profile via RPC or direct update
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      tier: 'PRO_PROFESSIONAL',
      ai_credits_total: 999999,
      ai_credits_used: 0,
    }, {
      onConflict: 'id',
    });

  if (profileError) {
    console.error('❌ Error updating profile:', profileError.message);
    throw profileError;
  }

  console.log('✅ Tier set to PRO_PROFESSIONAL');
  console.log('✅ Credits set to 999999');
}

// Run if executed directly
if (require.main === module) {
  createSuperadmin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createSuperadmin, setSuperadminTier };
