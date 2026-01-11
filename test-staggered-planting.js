/**
 * Test rapido per il motore di scaglionamento PROFESSIONALE
 * Esegui con: node test-staggered-planting.js
 */

// Simulazione del motore professionale
const PROFESSIONAL_STAGGERING_CONFIG = {
  'POMODORO': { batches: 3, interval: 21, reason: 'Gestione raccolta intensiva, distribuzione carico lavoro', harvestWindow: 14 },
  'LATTUGA': { batches: 4, interval: 14, reason: 'Ciclo breve, deperibilità alta', harvestWindow: 7 },
  'PEPERONE': { batches: 3, interval: 21, reason: 'Raccolta manuale intensiva, evita picchi operativi', harvestWindow: 21 },
  'ZUCCHINA': { batches: 2, interval: 21, reason: 'Produzione continua, evita sovraccarico raccolta', harvestWindow: 30 },
};

function testProfessionalStaggering(plantName, surfaceHectares = 1) {
  const config = PROFESSIONAL_STAGGERING_CONFIG[plantName.toUpperCase()];
  
  if (!config) {
    // Fallback per piante non configurate
    return {
      recommended: true,
      reason: `${plantName}: Gestione operativa standard per ${surfaceHectares}ha`,
      batches: Math.max(2, Math.ceil(surfaceHectares / 2)),
      interval: 21,
      harvestWindow: 14
    };
  }
  
  let { batches, interval, reason, harvestWindow } = config;
  
  // Adattamento per superficie grande
  if (surfaceHectares > 2) {
    const additionalBatches = Math.ceil(surfaceHectares / 2);
    batches = Math.min(batches + additionalBatches, 6);
    reason += ` - Superficie ${surfaceHectares}ha richiede distribuzione raccolta`;
  }
  
  const startDate = new Date();
  const batchDates = [];
  
  for (let i = 0; i < batches; i++) {
    const batchDate = new Date(startDate);
    batchDate.setDate(batchDate.getDate() + (i * interval));
    batchDates.push({
      lotto: i + 1,
      data: batchDate.toLocaleDateString('it-IT'),
      superficie: (surfaceHectares / batches).toFixed(1) + ' ha'
    });
  }
  
  const harvestCapacityPerDay = 0.5; // ettari/giorno
  const totalHarvestDays = surfaceHectares / harvestCapacityPerDay;
  
  return {
    recommended: true,
    plantName,
    surfaceHectares,
    batches,
    interval,
    reason,
    batchDates,
    operationalBenefits: {
      harvestDistribution: `Raccolta distribuita su ${batches} lotti invece di concentrata`,
      laborOptimization: `${(surfaceHectares/batches).toFixed(1)}ha per lotto = gestibile`,
      qualityMaintenance: `Finestra raccolta ${harvestWindow} giorni per lotto`,
      riskReduction: `${batches} finestre di mercato diverse`
    },
    totalHarvestDays: Math.ceil(totalHarvestDays),
    harvestWindow
  };
}

// Test con diverse colture e superfici
console.log('🌱 TEST MOTORE SCAGLIONAMENTO PROFESSIONALE ORTOMIO\n');

const testCases = [
  { plant: 'Pomodoro', surface: 10 },
  { plant: 'Pomodoro', surface: 2 },
  { plant: 'Lattuga', surface: 5 },
  { plant: 'Peperone', surface: 8 },
  { plant: 'Zucchina', surface: 3 }
];

testCases.forEach(({ plant, surface }) => {
  console.log(`\n📋 ${plant.toUpperCase()} - ${surface} ETTARI`);
  console.log('=' .repeat(50));
  
  const result = testProfessionalStaggering(plant, surface);
  
  console.log(`✅ SCAGLIONAMENTO SEMPRE RACCOMANDATO`);
  console.log(`   Motivo: ${result.reason}`);
  console.log(`   Lotti: ${result.batches}`);
  console.log(`   Intervallo: ${result.interval} giorni`);
  console.log(`   Piano semine:`);
  result.batchDates.forEach(batch => {
    console.log(`     Lotto ${batch.lotto}: ${batch.data} (${batch.superficie})`);
  });
  
  console.log(`\n   💼 BENEFICI OPERATIVI:`);
  console.log(`     • ${result.operationalBenefits.harvestDistribution}`);
  console.log(`     • ${result.operationalBenefits.laborOptimization}`);
  console.log(`     • ${result.operationalBenefits.qualityMaintenance}`);
  console.log(`     • ${result.operationalBenefits.riskReduction}`);
  
  console.log(`\n   📊 ANALISI CAPACITÀ:`);
  console.log(`     • Giorni totali raccolta: ${result.totalHarvestDays}`);
  console.log(`     • Finestra qualità per lotto: ${result.harvestWindow} giorni`);
  console.log(`     • Capacità richiesta: 0.5 ha/giorno`);
});

console.log('\n🎯 PRINCIPIO CHIAVE:');
console.log('OGNI coltura su scala commerciale beneficia dello scaglionamento!');
console.log('Non è questione di "tipo di pianta" ma di GESTIONE OPERATIVA.');
console.log('\n💡 ESEMPI CRITICI:');
console.log('• 10ha pomodori tutti insieme = IMPOSSIBILE raccogliere in 10 giorni');
console.log('• 5ha lattuga insieme = Deperisce prima di finire raccolta');
console.log('• 8ha peperoni insieme = Picco manodopera insostenibile');