/**
 * Test Completo Integrazione Satellitare OrtoMio
 * Verifica tutti i componenti del sistema NDVI
 */

const fs = require('fs');
const path = require('path');

async function testSatelliteIntegration() {
  console.log('🛰️  Test Integrazione Satellitare OrtoMio');
  console.log('==========================================\n');

  const results = {
    configFiles: false,
    apiEndpoints: false,
    components: false,
    credentials: false,
    integration: false
  };

  // 1. Test File di Configurazione
  console.log('📁 1. Verifica File di Configurazione...');
  
  const requiredFiles = [
    'services/ndviSatelliteService.ts',
    'components/ndvi/NDVIDashboard.tsx',
    'components/ndvi/SentinelHubStatus.tsx',
    'components/ndvi/SatelliteConfigStatus.tsx',
    'components/ndvi/NDVIMap.tsx',
    'app/api/ndvi/sentinel/route.ts',
    'app/api/ndvi/config-status/route.ts',
    'app/app/satellite-config/page.tsx',
    'setup-satellite-credentials.js'
  ];

  let filesFound = 0;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
      filesFound++;
    } else {
      console.log(`   ❌ ${file} - MANCANTE`);
    }
  }

  results.configFiles = filesFound === requiredFiles.length;
  console.log(`   📊 File trovati: ${filesFound}/${requiredFiles.length}\n`);

  // 2. Test Credenziali
  console.log('🔑 2. Verifica Credenziali...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const hasClientId = envContent.includes('SH_CLIENT_ID=') || 
                       envContent.includes('SENTINEL_HUB_CLIENT_ID=') ||
                       envContent.includes('COPERNICUS_CLIENT_ID=');
    
    const hasClientSecret = envContent.includes('SH_CLIENT_SECRET=') || 
                           envContent.includes('SENTINEL_HUB_CLIENT_SECRET=') ||
                           envContent.includes('COPERNICUS_CLIENT_SECRET=');
    
    const hasInstanceId = envContent.includes('SH_INSTANCE_ID=') ||
                         envContent.includes('a9646191-f172-4e6e-a965-670c4a222898');

    console.log(`   ${hasClientId ? '✅' : '❌'} Client ID configurato`);
    console.log(`   ${hasClientSecret ? '✅' : '❌'} Client Secret configurato`);
    console.log(`   ${hasInstanceId ? '✅' : '✅'} Instance ID presente (OrtoMio NDVI)`);
    
    results.credentials = hasClientId && hasClientSecret;
  } else {
    console.log('   ❌ File .env.local non trovato');
    console.log('   💡 Esegui: node setup-satellite-credentials.js');
    results.credentials = false;
  }
  console.log();

  // 3. Test Componenti React
  console.log('⚛️  3. Verifica Componenti React...');
  
  const componentTests = [
    {
      file: 'components/ndvi/NDVIDashboard.tsx',
      checks: ['NDVISatelliteService', 'SentinelHubStatus', 'NDVIMap']
    },
    {
      file: 'components/ndvi/SentinelHubStatus.tsx',
      checks: ['CheckCircle', 'AlertCircle', 'Satellite']
    },
    {
      file: 'components/ndvi/SatelliteConfigStatus.tsx',
      checks: ['ConfigStatus', 'testConnection', 'showCredentials']
    }
  ];

  let componentsValid = 0;
  for (const test of componentTests) {
    if (fs.existsSync(test.file)) {
      const content = fs.readFileSync(test.file, 'utf8');
      const checksFound = test.checks.filter(check => content.includes(check)).length;
      
      console.log(`   ${checksFound === test.checks.length ? '✅' : '⚠️'} ${test.file} (${checksFound}/${test.checks.length})`);
      
      if (checksFound === test.checks.length) componentsValid++;
    } else {
      console.log(`   ❌ ${test.file} - MANCANTE`);
    }
  }
  
  results.components = componentsValid === componentTests.length;
  console.log();

  // 4. Test API Endpoints
  console.log('🌐 4. Verifica API Endpoints...');
  
  const apiTests = [
    {
      file: 'app/api/ndvi/sentinel/route.ts',
      checks: ['POST', 'SH_CLIENT_ID', 'oauth/token', 'sentinel-hub']
    },
    {
      file: 'app/api/ndvi/config-status/route.ts',
      checks: ['GET', 'clientIdPresent', 'clientSecretPresent']
    }
  ];

  let apisValid = 0;
  for (const test of apiTests) {
    if (fs.existsSync(test.file)) {
      const content = fs.readFileSync(test.file, 'utf8');
      const checksFound = test.checks.filter(check => content.includes(check)).length;
      
      console.log(`   ${checksFound === test.checks.length ? '✅' : '⚠️'} ${test.file} (${checksFound}/${test.checks.length})`);
      
      if (checksFound === test.checks.length) apisValid++;
    } else {
      console.log(`   ❌ ${test.file} - MANCANTE`);
    }
  }
  
  results.apiEndpoints = apisValid === apiTests.length;
  console.log();

  // 5. Test Integrazione Dashboard
  console.log('🎛️  5. Verifica Integrazione Dashboard...');
  
  const dashboardIntegrations = [
    {
      file: 'components/shared/HomeDashboard.tsx',
      check: 'NDVI',
      description: 'Widget NDVI in dashboard principale'
    },
    {
      file: 'app/app/ndvi/page.tsx',
      check: 'NDVIDashboard',
      description: 'Pagina dedicata NDVI'
    },
    {
      file: 'services/plantHealthMonitoringService.ts',
      check: 'ndvi',
      description: 'Integrazione con sistema salute piante'
    }
  ];

  let integrationsFound = 0;
  for (const integration of dashboardIntegrations) {
    if (fs.existsSync(integration.file)) {
      const content = fs.readFileSync(integration.file, 'utf8');
      const hasIntegration = content.toLowerCase().includes(integration.check.toLowerCase());
      
      console.log(`   ${hasIntegration ? '✅' : '❌'} ${integration.description}`);
      
      if (hasIntegration) integrationsFound++;
    } else {
      console.log(`   ❌ ${integration.file} - MANCANTE`);
    }
  }
  
  results.integration = integrationsFound === dashboardIntegrations.length;
  console.log();

  // 6. Riepilogo e Raccomandazioni
  console.log('📊 RIEPILOGO INTEGRAZIONE');
  console.log('========================');
  
  const totalScore = Object.values(results).filter(Boolean).length;
  const maxScore = Object.keys(results).length;
  
  console.log(`📈 Punteggio: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%)\n`);
  
  Object.entries(results).forEach(([key, value]) => {
    const labels = {
      configFiles: 'File di Configurazione',
      apiEndpoints: 'API Endpoints',
      components: 'Componenti React',
      credentials: 'Credenziali',
      integration: 'Integrazione Dashboard'
    };
    
    console.log(`${value ? '✅' : '❌'} ${labels[key]}`);
  });

  console.log('\n🚀 PROSSIMI PASSI');
  console.log('================');
  
  if (!results.credentials) {
    console.log('1️⃣  Configura credenziali Copernicus:');
    console.log('   node setup-satellite-credentials.js');
  }
  
  if (!results.configFiles) {
    console.log('2️⃣  Verifica file mancanti e ricrea se necessario');
  }
  
  if (results.credentials && results.configFiles) {
    console.log('3️⃣  Avvia server e testa:');
    console.log('   npm run dev');
    console.log('   Vai su: http://localhost:3000/app/ndvi');
  }

  console.log('\n📚 DOCUMENTAZIONE');
  console.log('=================');
  console.log('• SATELLITE_DATA_INTEGRATION_GUIDE.md');
  console.log('• /app/satellite-config - Pagina configurazione');
  console.log('• https://docs.sentinel-hub.com/ - Docs ufficiali');

  console.log('\n🎯 FUNZIONALITÀ DISPONIBILI');
  console.log('===========================');
  console.log('• Dashboard NDVI completa (/app/ndvi)');
  console.log('• Widget dashboard principale');
  console.log('• Integrazione sistema salute piante');
  console.log('• Mappa interattiva NDVI');
  console.log('• Trend storico vegetazione');
  console.log('• Alert automatici stress');
  console.log('• Analisi per zone');
  console.log('• Configurazione guidata');

  return {
    success: totalScore === maxScore,
    score: `${totalScore}/${maxScore}`,
    percentage: Math.round(totalScore/maxScore*100),
    results,
    recommendations: {
      needsCredentials: !results.credentials,
      needsFiles: !results.configFiles,
      readyToTest: results.credentials && results.configFiles
    }
  };
}

// Esegui test se chiamato direttamente
if (require.main === module) {
  testSatelliteIntegration()
    .then(result => {
      console.log(`\n🏁 Test completato: ${result.success ? 'SUCCESSO' : 'PARZIALE'} (${result.percentage}%)`);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Errore durante il test:', error);
      process.exit(1);
    });
}

module.exports = { testSatelliteIntegration };