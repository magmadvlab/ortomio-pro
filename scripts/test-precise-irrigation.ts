
import { preciseIrrigationService, DripperConfig, PlantPosition } from '../services/preciseIrrigationService.ts';

// Configurazione test
const rowLengthCm = 500; // 5 metri
const dripperConfig: DripperConfig = {
    flowRateLph: 2.0, // 2 litri/ora
    spacingCm: 30,    // Gocciolatore ogni 30cm
    wettingRadiusCm: 20 // Raggio bagnatura 20cm
};

// Piante in posizioni diverse
// Gocciolatori a: 0, 30, 60, 90, 120, 150...
const plants: PlantPosition[] = [
    { id: 'P1-Perfect', distanceFromStartCm: 30 }, // Esattamente sul gocciolatore (dovrebbe ricevere max)
    { id: 'P2-Good', distanceFromStartCm: 40 },    // A 10cm dal gocciolatore (metà raggio)
    { id: 'P3-Edge', distanceFromStartCm: 49 },    // Al limite (19cm, quasi fuori)
    { id: 'P4-Miss', distanceFromStartCm: 15 },    // A metà tra 0 e 30 (15cm da entrambi, sovrapposizione?)
    { id: 'P5-Far', distanceFromStartCm: 75 }      // A metà tra 60 e 90 (15cm da entrambi)
];

console.log('--- TEST PRECISE IRRIGATION ---');
console.log('Configurazione:', JSON.stringify(dripperConfig, null, 2));

const durationMinutes = 60; // 1 ora di irrigazione
console.log(`\nSimulazione irrigazione per ${durationMinutes} minuti...`);

const results = preciseIrrigationService.calculateWatering(
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

// Verifica logica
const p1 = results.find(r => r.plantId === 'P1-Perfect');
if (p1 && p1.litersReceived >= 2.0) {
    console.log('\n✅ TEST PASSATO: Pianta P1 riceve circa 2L (o più se sovrapposizione)');
} else {
    console.log('\n❌ TEST FALLITO: Pianta P1 dovrebbe ricevere ~2L, ha ricevuto ' + p1?.litersReceived);
}
