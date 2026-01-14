const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserGardens() {
  const userId = '73317116-7df0-4c34-a1f7-d2828a92ac39'
  
  console.log('🔍 Checking gardens for user:', userId)
  console.log('📍 Database URL:', supabaseUrl)
  
  // Check gardens table
  const { data: gardens, error: gardensError } = await supabase
    .from('gardens')
    .select('*')
    .eq('user_id', userId)
  
  if (gardensError) {
    console.error('❌ Error fetching gardens:', gardensError)
  } else {
    console.log('\n🌱 Gardens found:', gardens?.length || 0)
    if (gardens && gardens.length > 0) {
      gardens.forEach((garden, idx) => {
        console.log(`\nGarden ${idx + 1}:`)
        console.log('  ID:', garden.id)
        console.log('  Name:', garden.name)
        console.log('  Type:', garden.type)
        console.log('  Created:', garden.created_at)
      })
    } else {
      console.log('⚠️  NO GARDENS FOUND - Wizard should start!')
    }
  }
  
  // Check user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (profileError) {
    console.error('\n❌ Error fetching profile:', profileError)
  } else {
    console.log('\n👤 User Profile:')
    console.log('  Name:', profile?.name)
    console.log('  Onboarding completed:', profile?.onboarding_completed)
    console.log('  Created:', profile?.created_at)
  }
}

checkUserGardens().catch(console.error)
