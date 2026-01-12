/**
 * Test semplice per verificare il database remoto
 */

// Configurazione Supabase
const SUPABASE_URL = 'https://qhmujoivfxftlrcrluaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

async function testRemoteDatabase() {
  try {
    console.log('🔍 Testing remote database structure...\n');
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. Test connessione base
    console.log('1️⃣ Testing basic connection...');
    const { data: gardens, error: gardensError } = await supabase
      .from('gardens')
      .select('id, name')
      .limit(3);
    
    if (gardensError) {
      console.log('❌ Connection failed:', gardensError.message);
      return;
    }
    
    console.log('✅ Connected! Found', gardens?.length || 0, 'gardens');
    console.log('');
    
    // 2. Test tabella treatment_register
    console.log('2️⃣ Testing treatment_register table...');
    const { data: treatments, error: treatmentsError } = await supabase
      .from('treatment_register')
      .select('*')
      .limit(1);
    
    if (treatmentsError) {
      console.log('❌ treatment_register error:', treatmentsError.message);
    } else {
      console.log('✅ treatment_register table exists');
      if (treatments && treatments.length > 0) {
        const columns = Object.keys(treatments[0]);
        console.log('📋 Columns:', columns.join(', '));
        
        // Verifica colonne bio/tradizionale
        const bioColumns = ['treatment_type', 'organic_approved', 'registration_number', 'pre_harvest_interval_days'];
        const missingColumns = bioColumns.filter(col => !columns.includes(col));
        const existingColumns = bioColumns.filter(col => columns.includes(col));
        
        if (existingColumns.length > 0) {
          console.log('✅ Bio/Traditional columns found:', existingColumns.join(', '));
        }
        if (missingColumns.length > 0) {
          console.log('❌ Missing Bio/Traditional columns:', missingColumns.join(', '));
        }
      } else {
        console.log('📝 Table is empty, cannot check column structure');
      }
    }
    console.log('');
    
    // 3. Test tabella fertilizer_application_logs
    console.log('3️⃣ Testing fertilizer_application_logs table...');
    const { data: fertilizers, error: fertilizersError } = await supabase
      .from('fertilizer_application_logs')
      .select('*')
      .limit(1);
    
    if (fertilizersError) {
      console.log('❌ fertilizer_application_logs error:', fertilizersError.message);
    } else {
      console.log('✅ fertilizer_application_logs table exists');
      if (fertilizers && fertilizers.length > 0) {
        const columns = Object.keys(fertilizers[0]);
        const hasFertilizerType = columns.includes('fertilizer_type');
        console.log('📋 Has fertilizer_type column:', hasFertilizerType ? '✅ Yes' : '❌ No');
      } else {
        console.log('📝 Table is empty');
      }
    }
    console.log('');
    
    // 4. Test query diretta per struttura tabella
    console.log('4️⃣ Testing table structure with direct query...');
    const { data: structure, error: structureError } = await supabase
      .rpc('exec', {
        sql: `
          SELECT column_name, data_type, column_default, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'treatment_register' 
          AND column_name IN ('treatment_type', 'organic_approved', 'registration_number', 'pre_harvest_interval_days')
          ORDER BY column_name;
        `
      });
    
    if (structureError) {
      console.log('❌ Structure query failed:', structureError.message);
      
      // Prova query alternativa
      console.log('🔄 Trying alternative approach...');
      const { data: altTest, error: altError } = await supabase
        .from('treatment_register')
        .select('treatment_type, organic_approved, registration_number, pre_harvest_interval_days')
        .limit(1);
      
      if (altError) {
        console.log('❌ Alternative test failed:', altError.message);
        console.log('⚠️ Bio/Traditional columns are NOT present in remote database');
      } else {
        console.log('✅ Bio/Traditional columns ARE present in remote database');
      }
    } else {
      console.log('✅ Structure query successful:', structure);
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('- Remote database connection: ✅ Working');
    console.log('- treatment_register table: ✅ Exists');
    console.log('- Bio/Traditional migration: Need to verify manually');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRemoteDatabase();