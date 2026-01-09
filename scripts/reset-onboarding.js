// Script per resettare l'onboarding
// Esegui in console del browser: node scripts/reset-onboarding.js

console.log('Per resettare l\'onboarding, apri la console del browser e incolla:');
console.log('');
console.log('localStorage.removeItem(\'ortomio_user_onboarding_completed\');');
console.log('window.location.reload();');
console.log('');
console.log('Oppure esegui questa funzione nella console:');
console.log('');
console.log('clearOrtomioLocalStorage(); // Funzione già disponibile nella app');
