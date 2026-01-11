/**
 * Test Social Sharing - Aggiunge badge di esempio per testare la condivisione sociale
 */

// Funzione per aggiungere badge di test
function addTestBadges() {
  const userId = 'demo-user'
  
  const testBadges = [
    {
      id: 'first_sowing',
      nome: 'Prima Semina',
      emoji: '🌱',
      descrizione: 'Hai completato la tua prima semina!',
      earned_at: new Date('2026-01-10')
    },
    {
      id: 'harvest_master',
      nome: 'Maestro del Raccolto',
      emoji: '🥕',
      descrizione: 'Hai raccolto 10 kg di verdure!',
      earned_at: new Date('2026-01-09')
    },
    {
      id: 'streak_7',
      nome: 'Settimana Perfetta',
      emoji: '🔥',
      descrizione: '7 giorni consecutivi di attività',
      earned_at: new Date('2026-01-08')
    },
    {
      id: 'green_thumb',
      nome: 'Pollice Verde',
      emoji: '👍',
      descrizione: 'Hai coltivato 5 varietà diverse',
      earned_at: new Date('2026-01-07')
    },
    {
      id: 'challenge_11_1',
      nome: 'Pianificatore Strategico',
      emoji: '📋',
      descrizione: 'Challenge dell\'11 gennaio completata',
      earned_at: new Date('2026-01-11')
    }
  ]
  
  // Salva in localStorage
  localStorage.setItem(`user_badges_${userId}`, JSON.stringify(testBadges))
  
  console.log('✅ Badge di test aggiunti:', testBadges.length)
  console.log('🎯 Vai su Progressi → Traguardi per vedere i badge')
  console.log('📱 Passa il mouse sui badge per vedere il pulsante di condivisione')
  
  return testBadges
}

// Funzione per testare la condivisione
function testSocialSharing() {
  console.log('🧪 Test Social Sharing System')
  
  // Test generazione testo condivisione
  const testContent = {
    type: 'achievement',
    title: 'Prima Semina',
    description: 'Hai completato la tua prima semina!',
    stats: {
      level: 2,
      xp: 150,
      streak: 7
    },
    badge: {
      emoji: '🌱',
      name: 'Prima Semina',
      rarity: 'common'
    }
  }
  
  // Simula generazione testo
  const shareText = `🏆 Ho sbloccato un nuovo traguardo in OrtoMio!

🌱 Prima Semina
Hai completato la tua prima semina!

📊 Livello: 2 • XP: 150

#OrtoMio #OrtoIntelligente #Giardinaggio #Achievement #Traguardo #PoliceVerde`
  
  console.log('📝 Testo di condivisione generato:')
  console.log(shareText)
  
  // Test URL condivisione
  const platforms = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://ortomio.ai')}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://ortomio.ai')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' https://ortomio.ai')}`
  }
  
  console.log('🔗 URL di condivisione:')
  Object.entries(platforms).forEach(([platform, url]) => {
    console.log(`${platform}: ${url}`)
  })
  
  return { shareText, platforms }
}

// Funzione per pulire i badge di test
function clearTestBadges() {
  const userId = 'demo-user'
  localStorage.removeItem(`user_badges_${userId}`)
  console.log('🧹 Badge di test rimossi')
}

// Esegui test
console.log('🚀 Inizializzazione test Social Sharing...')
addTestBadges()
testSocialSharing()

console.log(`
📋 ISTRUZIONI TEST:
1. Vai su http://localhost:3002/app/progress?tab=achievements
2. Dovresti vedere 5 badge sbloccati
3. Passa il mouse sui badge per vedere il pulsante di condivisione (icona blu)
4. Clicca sul pulsante per aprire il modal di condivisione
5. Testa la condivisione su diverse piattaforme
6. Testa la funzione "Copia Testo"

🔧 COMANDI UTILI:
- addTestBadges() - Aggiunge badge di test
- clearTestBadges() - Rimuove badge di test
- testSocialSharing() - Testa generazione contenuti
`)