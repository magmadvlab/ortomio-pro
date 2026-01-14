import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGardens() {
  console.log('🔍 Checking gardens in database...\n')
  
  const { data: gardens, error } = await supabase
    .from('gardens')
    .select('*')
    .limit(10)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  if (!gardens || gardens.length === 0) {
    console.log('❌ No gardens found in database')
    console.log('\nYou need to:')
    console.log('1. Open the app: http://localhost:3002')
    console.log('2. Login')
    console.log('3. Create a garden named "orto di rob"')
    console.log('4. Then run this script again')
    return
  }
  
  console.log(`✅ Found ${gardens.length} garden(s):\n`)
  gardens.forEach((g, i) => {
    console.log(`${i + 1}. ${g.name}`)
    console.log(`   ID: ${g.id}`)
    console.log(`   User: ${g.user_id}`)
    console.log(`   Created: ${g.created_at}\n`)
  })
}

checkGardens().catch(console.error)
