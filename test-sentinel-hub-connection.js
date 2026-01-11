/**
 * Test Connessione Sentinel Hub API
 * Verifica che le credenziali funzionino correttamente
 */

const testSentinelHubConnection = async () => {
  console.log('🛰️  Test Connessione Sentinel Hub API');
  console.log('=====================================');

  const clientId = 'sh-ee976-0f29-4dca-a2ec-2ea8d9845042';
  const clientSecret = '2Q19bh3GHbZ9ELQ5H5k7dc';

  try {
    // 1. Test autenticazione OAuth2
    console.log('1. Test autenticazione OAuth2...');
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch('https://sh.dataspace.copernicus.eu/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Errore autenticazione: ${tokenResponse.status} - ${await tokenResponse.text()}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Autenticazione riuscita');
    console.log(`   Token type: ${tokenData.token_type}`);
    console.log(`   Expires in: ${tokenData.expires_in} secondi`);

    // 2. Test richiesta dati NDVI per area di test (Roma)
    console.log('\n2. Test richiesta dati NDVI...');
    
    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B04", "B08", "SCL", "dataMask"],
          output: { bands: 1 }
        };
      }

      function evaluatePixel(sample) {
        // Calcola NDVI: (NIR - Red) / (NIR + Red)
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        
        // Filtra nuvole usando Scene Classification Layer
        if (sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 10) {
          return [0]; // Nuvole, ombre, neve, acqua
        }
        
        return [ndvi];
      }
    `;

    const requestBody = {
      input: {
        bounds: {
          bbox: [12.4, 41.8, 12.6, 42.0], // Area Roma
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
          }
        },
        data: [{
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: "2024-12-01T00:00:00Z",
              to: "2025-01-11T23:59:59Z"
            },
            maxCloudCoverage: 30
          }
        }]
      },
      output: {
        width: 50,
        height: 50,
        responses: [{
          identifier: "default",
          format: {
            type: "image/png"
          }
        }]
      },
      evalscript: evalscript
    };

    const processResponse = await fetch('https://sh.dataspace.copernicus.eu/api/v1/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      console.log('❌ Errore richiesta dati:', processResponse.status);
      console.log('   Dettagli:', errorText);
      return;
    }

    console.log('✅ Richiesta dati riuscita');
    console.log(`   Status: ${processResponse.status}`);
    console.log(`   Content-Type: ${processResponse.headers.get('content-type')}`);
    console.log(`   Content-Length: ${processResponse.headers.get('content-length')} bytes`);

    // 3. Test statistiche area
    console.log('\n3. Test statistiche area...');
    
    const statsRequestBody = {
      input: {
        bounds: {
          bbox: [12.4, 41.8, 12.6, 42.0],
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
          }
        },
        data: [{
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: "2024-12-01T00:00:00Z",
              to: "2025-01-11T23:59:59Z"
            },
            maxCloudCoverage: 30
          }
        }]
      },
      aggregation: {
        timeRange: {
          from: "2024-12-01T00:00:00Z",
          to: "2025-01-11T23:59:59Z"
        },
        aggregationInterval: {
          of: "P1D"
        },
        evalscript: `
          //VERSION=3
          function setup() {
            return {
              input: ["B04", "B08", "SCL", "dataMask"],
              output: [
                { id: "ndvi", bands: 1 },
                { id: "dataMask", bands: 1 }
              ]
            };
          }

          function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            
            if (sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 10) {
              return { ndvi: [NaN], dataMask: [0] };
            }
            
            return { ndvi: [ndvi], dataMask: [sample.dataMask] };
          }
        `,
        resx: 100,
        resy: 100
      },
      calculations: {
        ndvi: {
          statistics: {
            default: {
              percentiles: {
                k: [10, 25, 50, 75, 90]
              }
            }
          }
        }
      }
    };

    const statsResponse = await fetch('https://sh.dataspace.copernicus.eu/api/v1/statistics', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statsRequestBody)
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Statistiche ottenute');
      console.log(`   Intervalli trovati: ${statsData.data?.length || 0}`);
      
      if (statsData.data && statsData.data.length > 0) {
        const latestStats = statsData.data[statsData.data.length - 1];
        if (latestStats.outputs?.ndvi?.bands?.B0?.stats) {
          const stats = latestStats.outputs.ndvi.bands.B0.stats;
          console.log(`   NDVI medio: ${stats.mean?.toFixed(3) || 'N/A'}`);
          console.log(`   NDVI min: ${stats.min?.toFixed(3) || 'N/A'}`);
          console.log(`   NDVI max: ${stats.max?.toFixed(3) || 'N/A'}`);
          console.log(`   Pixel validi: ${stats.sampleCount || 'N/A'}`);
        }
      }
    } else {
      console.log('⚠️  Statistiche non disponibili:', statsResponse.status);
    }

    console.log('\n🎉 Test completato con successo!');
    console.log('   Le credenziali Sentinel Hub sono valide e funzionanti.');
    console.log('   OrtoMio può ora accedere ai dati satellitari reali.');

  } catch (error) {
    console.error('\n❌ Errore durante il test:', error.message);
    console.log('\n🔧 Possibili soluzioni:');
    console.log('   1. Verifica che le credenziali siano corrette');
    console.log('   2. Controlla la connessione internet');
    console.log('   3. Verifica che il client Sentinel Hub sia attivo');
  }
};

// Esegui il test se chiamato direttamente
if (typeof window === 'undefined') {
  testSentinelHubConnection();
}

export { testSentinelHubConnection };