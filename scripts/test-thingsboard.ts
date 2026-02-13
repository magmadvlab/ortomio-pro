
import { thingsboardService } from '../services/thingsboardService';

async function testThingsBoard() {
    console.log('🔄 Testing ThingsBoard connectivity...');

    // 1. Test Telemetry
    try {
        console.log('📊 Sending test telemetry...');
        await thingsboardService.sendTelemetry({
            test_value: 123,
            status: 'active',
            last_check: new Date().toISOString()
        });
        console.log('✅ Telemetry sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send telemetry:', error);
    }

    // 2. Test Attributes
    try {
        console.log('🏷️ Sending test attributes...');
        await thingsboardService.sendAttributes({
            firmware_version: '1.0.0',
            location: 'OrtoMio Hub'
        });
        console.log('✅ Attributes sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send attributes:', error);
    }
}

testThingsBoard();
