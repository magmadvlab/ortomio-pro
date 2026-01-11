/**
 * Test WMS Endpoint Fix - Verifica Sentinel Hub Copernicus
 * Test per verificare il fix dell'endpoint WMS NDVI
 */

const WMS_CONFIG = {
  baseUrl: 'https://sh.dataspace.copernicus.eu/ogc/wms/a9646191-f172-4e6e-a965-670c4a222898',
  oldUrl: 'https://services.sentinel-hub.com/ogc/wms/a9646191-f172-4e6e-a965-670c4a222898'
};

async function testWMSEndpoint() {
  console.log('🧪 Test WMS Endpoint Fix - OrtoMio NDVI');
  console.log('=====================================\n');

  // Test 1: GetCapabilities
  console.log('1️⃣ Test GetCapabilities');
  try {
    const capabilitiesUrl = `${WMS_CONFIG.baseUrl}?service=WMS&request=GetCapabilities`;
    console.log(`URL: ${capabilitiesUrl}`);
    
    const response = await fetch(capabilitiesUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 503) {
      console.log('⚠️  503 Service Unavailable - Overload temporaneo Sentinel Hub');
      console.log('   Questo è normale, riprova tra 10-30 minuti');
    } else if (response.ok) {
      console.log('✅ Endpoint WMS funzionante!');
      
      // Prova a leggere le capabilities
      const text = await response.text();
      if (text.includes('WMS_Capabilities')) {
        console.log('✅ Capabilities XML valido ricevuto');
      }
    } else {
      console.log(`❌ Errore: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Errore di rete: ${error.message}`);
  }

  console.log('\n2️⃣ Test GetMap Request');
  try {
    // Test GetMap con parametri base
    const getMapUrl = `${WMS_CONFIG.baseUrl}?` +
      'service=WMS&version=1.3.0&request=GetMap&' +
      'layers=VEGETATION_INDEX&' +
      'format=image/png&' +
      'transparent=true&' +
      'width=256&height=256&' +
      'crs=EPSG:4326&' +
      'bbox=41.8,12.4,41.9,12.5'; // Roma area test
    
    console.log(`URL: ${getMapUrl.substring(0, 100)}...`);
    
    const response = await fetch(getMapUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      if (contentType?.includes('image/png')) {
        console.log('✅ Immagine PNG ricevuta correttamente!');
      } else {
        console.log('⚠️  Risposta non è un\'immagine PNG');
      }
    } else if (response.status === 503) {
      console.log('⚠️  503 Service Unavailable - Overload temporaneo');
    } else {
      console.log(`❌ Errore GetMap: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Errore GetMap: ${error.message}`);
  }

  console.log('\n3️⃣ Confronto Endpoint');
  console.log('Endpoint CORRETTO (nuovo):');
  console.log(`✅ ${WMS_CONFIG.baseUrl}`);
  console.log('Endpoint SBAGLIATO (vecchio):');
  console.log(`❌ ${WMS_CONFIG.oldUrl}`);
  
  console.log('\n4️⃣ Parametri WMSTileLayer Ottimali');
  console.log('layers: "VEGETATION_INDEX"');
  console.log('format: "image/png"');
  console.log('transparent: true');
  console.log('version: "1.3.0"');
  console.log('tileSize: 256');

  console.log('\n🎯 RISULTATO TEST');
  console.log('================');
  console.log('Se vedi 503 → Normale, Sentinel Hub overloaded');
  console.log('Se vedi 200 → Endpoint funziona perfettamente!');
  console.log('Se vedi 404 → Problema configurazione');
  console.log('\nIl fix WMSTileLayer dovrebbe risolvere i problemi di stabilità.');
}

// Esegui test
testWMSEndpoint().catch(console.error);