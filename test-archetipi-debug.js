// Test per verificare caricamento archetipi
console.log('🧪 Test Archetipi OrtoMio');

// Simula il caricamento degli archetipi
const mockArchetypes = [
  {
    id: 'A1',
    label: 'Solanacee da frutto',
    icon: '🍅',
    botanicalFamily: 'Solanaceae',
    examples: ['pomodoro', 'peperone', 'melanzana']
  },
  {
    id: 'A4',
    label: 'Insalate',
    icon: '🥬',
    botanicalFamily: 'Asteraceae',
    examples: ['lattuga', 'radicchio', 'rucola']
  },
  {
    id: 'A5',
    label: 'Leguminose',
    icon: '🫛',
    botanicalFamily: 'Fabaceae',
    examples: ['fave', 'piselli', 'fagioli']
  }
];

// Simula la trasformazione in piante
const plantsFromArchetypes = mockArchetypes.flatMap(archetype => {
  if (!archetype.examples) return [];
  
  return archetype.examples.slice(0, 2).map((example, index) => ({
    id: `${archetype.id}_${index}`,
    name: example.charAt(0).toUpperCase() + example.slice(1),
    scientific_name: `${archetype.botanicalFamily} sp.`,
    difficulty: archetype.id === 'A4' || archetype.id === 'A5' ? 'facile' : 'media',
    archetypeId: archetype.id,
    icon: archetype.icon
  }));
});

console.log('✅ Archetipi caricati:', mockArchetypes.length);
console.log('✅ Piante generate:', plantsFromArchetypes.length);

plantsFromArchetypes.forEach(plant => {
  console.log(`${plant.icon} ${plant.name} (${plant.archetypeId}) - ${plant.difficulty}`);
});

console.log('\n🎯 Test completato - Gli archetipi dovrebbero mostrare:');
console.log('🍅 Pomodoro, Peperone (A1)');
console.log('🥬 Lattuga, Radicchio (A4)'); 
console.log('🫛 Fave, Piselli (A5)');