
// Logic copied from PreciseIrrigationService for standalone testing without TS setup issues

class PreciseIrrigationService {
    calculateWatering(
        rowLengthCm,
        dripperConfig,
        plants,
        durationMinutes
    ) {
        const results = [];
        const wettingRadius = dripperConfig.wettingRadiusCm || 30;
        const offset = dripperConfig.offsetCm || 0;

        // 1. Genera posizioni virtuali dei gocciolatori
        const drippers = [];
        for (let pos = offset; pos <= rowLengthCm; pos += dripperConfig.spacingCm) {
            drippers.push(pos);
        }

        // 2. Per ogni pianta, calcola l'acqua ricevuta dai gocciolatori vicini
        plants.forEach(plant => {
            let totalLiters = 0;
            let maxEfficiency = 0;
            let contributingDrippers = 0;

            drippers.forEach(dripperPos => {
                const distance = Math.abs(plant.distanceFromStartCm - dripperPos);

                if (distance <= wettingRadius) {
                    // Modello di distribuzione: Lineare (100% al centro, 0% al bordo)
                    const efficiency = 1 - (distance / wettingRadius);

                    const dripperOutputLiters = (dripperConfig.flowRateLph / 60) * durationMinutes;
                    const receivedFromDripper = dripperOutputLiters * efficiency;

                    totalLiters += receivedFromDripper;
                    maxEfficiency = Math.max(maxEfficiency, efficiency);
                    contributingDrippers++;
                }
            });

            results.push({
                plantId: plant.id,
                litersReceived: Math.round(totalLiters * 100) / 100,
                coveragePercent: Math.round(maxEfficiency * 100),
                efficiency: Math.round(maxEfficiency * 100) / 100,
                sourceDrippers: contributingDrippers
            });
        });

        return results;
    }
}

const service = new PreciseIrrigationService();

// Configurazione test
const rowLengthCm = 500;
const dripperConfig = {
    flowRateLph: 2.0,
    spacingCm: 30,
    wettingRadiusCm: 20
};

const plants = [
    { id: 'P1-Perfect', distanceFromStartCm: 30 },
    { id: 'P2-Good', distanceFromStartCm: 40 },
    { id: 'P3-Edge', distanceFromStartCm: 49 },
    { id: 'P4-Miss', distanceFromStartCm: 15 },
    { id: 'P5-Far', distanceFromStartCm: 75 }
];

console.log('--- TEST PRECISE IRRIGATION (JS) ---');
console.log('Configurazione:', JSON.stringify(dripperConfig, null, 2));

const durationMinutes = 60;
console.log(`\nSimulazione irrigazione per ${durationMinutes} minuti...`);

const results = service.calculateWatering(
    rowLengthCm,
    dripperConfig,
    plants,
    durationMinutes
);

console.log('\nRisultati per pianta (Litri ricevuti):');
results.forEach(r => {
    const p = plants.find(plant => plant.id === r.plantId);
    console.log(`Pianta ${r.plantId} (@${p?.distanceFromStartCm}cm):`);
    console.log(`  - Litri: ${r.litersReceived} L`);
    console.log(`  - Efficienza: ${r.efficiency}`);
    console.log(`  - Copertura: ${r.coveragePercent}%`);
    console.log(`  - Fonti: ${r.sourceDrippers} gocciolatori`);
});

const p1 = results.find(r => r.plantId === 'P1-Perfect');
if (p1 && p1.litersReceived >= 2.0) {
    console.log('\n✅ TEST PASSATO: Pianta P1 riceve circa 2L (o più se sovrapposizione)');
} else {
    console.log('\n❌ TEST FALLITO: Pianta P1 dovrebbe ricevere ~2L, ha ricevuto ' + p1?.litersReceived);
}
