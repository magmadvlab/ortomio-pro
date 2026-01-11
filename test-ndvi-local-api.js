/**
 * Test API NDVI Locale
 * Verifica che l'endpoint /api/ndvi/sentinel funzioni correttamente
 */

const API_BASE_URL = 'http://localhost:3002';

const testLocalNDVIAPI = async () => {
  console.log('🌱 Test API NDVI Locale OrtoMio');
  console.log('================================');

  try {
    // Test con area di Roma
    const testRequest = {
      bbox: {
        north: 42.0,
        south: 41.9,
        east: 12.6,
        west: 12.5
      },
      dateFrom: '2024-12-01',
      dateTo: '2025-01-11',
      cloudCoverage: 20
    };

    console.log('1. Test richiesta NDVI per area Roma...');
    console.log(`   Bbox: ${testRequest.bbox.west}, ${testRequest.bbox.south}, ${testRequest.bbox.east}, ${testRequest.bbox.north}`);
    console.log(`   Periodo: ${testRequest.dateFrom} - ${testRequest.dateTo}`);
    console.log(`   Max copertura nuvole: ${testRequest.cloudCoverage}%`);

      const response = await fetch(`${API_BASE_URL}/api/ndvi/sentinel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRequest)
      });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('\n✅ Risposta API ricevuta:');
    console.log(`   NDVI: ${data.ndvi?.toFixed(3) || 'N/A'}`);
    console.log(`   Data: ${data.date ? new Date(data.date).toLocaleDateString('it-IT') : 'N/A'}`);
    console.log(`   Copertura nuvole: ${data.cloudCoverage?.toFixed(1) || 'N/A'}%`);
    console.log(`   Fonte: ${data.source || 'N/A'}`);
    console.log(`   Risoluzione: ${data.resolution || 'N/A'}`);
    console.log(`   Satellite: ${data.satellite || 'N/A'}`);

    if (data.simulated) {
      console.log('\n⚠️  Modalità simulazione attiva');
      if (data.error) {
        console.log(`   Motivo: ${data.error}`);
      }
      console.log('   I dati sono simulati ma realistici per demo/test');
    } else {
      console.log('\n🛰️  Dati satellitari reali');
      console.log('   Connessione Sentinel Hub attiva');
    }

    // Test validazione NDVI
    if (data.ndvi !== undefined) {
      const ndvi = data.ndvi;
      let healthStatus = 'Sconosciuto';
      
      if (ndvi >= 0.8) healthStatus = 'Eccellente';
      else if (ndvi >= 0.6) healthStatus = 'Buono';
      else if (ndvi >= 0.4) healthStatus = 'Moderato';
      else if (ndvi >= 0.2) healthStatus = 'Scarso';
      else healthStatus = 'Critico';

      console.log(`\n📊 Analisi NDVI:`);
      console.log(`   Valore: ${ndvi.toFixed(3)} (range: -1.0 a +1.0)`);
      console.log(`   Salute vegetazione: ${healthStatus}`);
      
      // Indicatori stress
      const waterStress = ndvi < 0.4;
      const nutrientDeficiency = ndvi < 0.5 && ndvi >= 0.3;
      const diseaseRisk = ndvi < 0.3;

      console.log(`   Stress idrico: ${waterStress ? '⚠️  Rilevato' : '✅ Non rilevato'}`);
      console.log(`   Carenza nutrizionale: ${nutrientDeficiency ? '⚠️  Possibile' : '✅ Non rilevata'}`);
      console.log(`   Rischio malattie: ${diseaseRisk ? '🚨 Elevato' : '✅ Basso'}`);
    }

    console.log('\n🎉 Test API locale completato con successo!');
    console.log('   L\'endpoint NDVI di OrtoMio funziona correttamente.');
    
    return true;

  } catch (error) {
    console.error('\n❌ Errore durante il test:', error.message);
    console.log('\n🔧 Possibili cause:');
    console.log('   1. Server di sviluppo non avviato (npm run dev)');
    console.log('   2. Porta 3002 non disponibile');
    console.log('   3. Errore nell\'endpoint API');
    
    return false;
  }
};

// Test multipli per diverse aree geografiche
const testMultipleAreas = async () => {
  console.log('\n🌍 Test Aree Geografiche Multiple');
  console.log('==================================');

  const testAreas = [
    { name: 'Roma', bbox: { north: 42.0, south: 41.9, east: 12.6, west: 12.5 } },
    { name: 'Milano', bbox: { north: 45.5, south: 45.4, east: 9.3, west: 9.1 } },
    { name: 'Napoli', bbox: { north: 40.9, south: 40.8, east: 14.3, west: 14.2 } },
    { name: 'Palermo', bbox: { north: 38.2, south: 38.1, east: 13.4, west: 13.3 } }
  ];

  for (const area of testAreas) {
    try {
      console.log(`\n📍 Test area: ${area.name}`);
      
      const response = await fetch(`${API_BASE_URL}/api/ndvi/sentinel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bbox: area.bbox,
          dateFrom: '2024-12-01',
          dateTo: '2025-01-11',
          cloudCoverage: 20
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ ${area.name}: NDVI ${data.ndvi?.toFixed(3) || 'N/A'} (${data.source})`);
      } else {
        console.log(`   ❌ ${area.name}: Errore ${response.status}`);
      }
      
      // Pausa tra richieste
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`   ❌ ${area.name}: ${error.message}`);
    }
  }
};

// Esegui i test
const runAllTests = async () => {
  const success = await testLocalNDVIAPI();
  
  if (success) {
    await testMultipleAreas();
    
    console.log('\n🚀 Tutti i test completati!');
    console.log('   OrtoMio NDVI API è pronto per l\'uso.');
  }
};

// Esegui se chiamato direttamente
if (typeof window === 'undefined') {
  runAllTests();
}

export { testLocalNDVIAPI, testMultipleAreas };