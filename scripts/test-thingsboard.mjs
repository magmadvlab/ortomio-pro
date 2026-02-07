
// Simple script to test ThingsBoard connectivity using native fetch
// Run with: node scripts/test-thingsboard.mjs

const THINGSBOARD_URL = process.env.THINGSBOARD_URL || 'https://eu.thingsboard.cloud';
const THINGSBOARD_ACCESS_TOKEN = process.env.THINGSBOARD_ACCESS_TOKEN || 'gw9J0ABVb47qjSwVRlTN';

console.log(`🔧 Configuring ThingsBoard Test:
  URL: ${THINGSBOARD_URL}
  Token: ${THINGSBOARD_ACCESS_TOKEN.substring(0, 5)}...
`);

async function sendData(endpoint, data) {
    const url = `${THINGSBOARD_URL}/api/v1/${THINGSBOARD_ACCESS_TOKEN}/${endpoint}`;
    console.log(`📤 Sending to ${endpoint}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log(`✅ Success! ${endpoint} sent.`);
        } else {
            console.error(`❌ Error ${response.status}: ${response.statusText}`);
            const text = await response.text();
            console.error(`   Body: ${text}`);
        }
    } catch (error) {
        console.error(`❌ Network Error:`, error.message);
    }
}

async function runTest() {
    console.log('🔄 Starting Connectivity Test...');

    // 1. Test Telemetry
    await sendData('telemetry', {
        test_type: 'node_script',
        status: 'connected',
        temperature: 25.5,
        humidity: 60
    });

    // 2. Test Attributes
    await sendData('attributes', {
        firmware_version: '1.0.0',
        last_boot: new Date().toISOString(),
        location: 'Test Script'
    });

    console.log('🎉 Test Completed.');
}

runTest();
