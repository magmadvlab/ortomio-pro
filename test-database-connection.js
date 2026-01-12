/**
 * Test per verificare quale database sta usando l'app
 * Esegui con: node test-database-connection.js
 */

// Simula l'ambiente Next.js
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qhmujoivfxftlrcrluaj.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Test configurazione Supabase
    console.log('📋 Environment Variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('');
    
    // Test connessione Supabase diretta
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('🔗 Testing Supabase connection...');
    
    // Test query semplice
    const { data, error } = await supabase
      .from('gardens')
      .select('id, name')
      .limit(5);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('🔄 App will use localStorage');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📊 Found', data?.length || 0, 'gardens in remote database');
      if (data && data.length > 0) {
        console.log('🌱 Sample gardens:', data.map(g => g.name || g.id).join(', '));
      }
    }
    
    console.log('');
    
    // Test presenza tabella treatment_register con nuovi campi
    console.log('🔍 Testing treatment_register table structure...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_name', 'treatment_register')
      .in('column_name', ['treatment_type', 'organic_approved', 'registration_number', 'pre_harvest_interval_days']);
    
    if (columnsError) {
      console.log('❌ Could not check table structure:', columnsError.message);
    } else {
      console.log('✅ Bio/Traditional columns in remote database:');
      columns?.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) default: ${col.column_default || 'NULL'}`);
      });
    }
    
    console.log('');
    
    // Test factory del storage provider
    console.log('🏭 Testing storage provider factory...');
    
    // Simula window object per il test
    global.window = { localStorage: {}, sessionStorage: {} };
    
    const { getDefaultStorageProvider } = await import('./packages/core/storage/factory.ts');
    const provider = getDefaultStorageProvider();
    
    console.log('📦 Active storage provider:', provider.constructor.name);
    
    if (provider.constructor.name === 'SupabaseStorageProvider') {
      console.log('✅ App is using REMOTE database (Supabase)');
    } else {
      console.log('⚠️ App is using LOCAL database (localStorage)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseConnection();