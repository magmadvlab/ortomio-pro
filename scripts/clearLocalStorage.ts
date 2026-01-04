/**
 * Script per pulire il localStorage accumulato
 * ATTENZIONE: Questo eliminerà TUTTI i dati in localStorage
 * Assicurati di aver già migrato i dati su Supabase prima di eseguire questo script
 */

export const clearAllLocalStorageData = () => {
  if (typeof window === 'undefined') {
    console.error('Questo script può essere eseguito solo nel browser');
    return;
  }

  const keysToKeep = [
    // Mantieni solo le preferenze utente essenziali
    'ortomio_user_name',
    'ortomio_user_onboarding_completed',
  ];

  const allKeys = Object.keys(localStorage);
  let removedCount = 0;
  let totalSize = 0;

  console.log(`📊 Analisi localStorage...`);
  console.log(`Totale chiavi: ${allKeys.length}`);

  // Prima passa - calcola dimensioni
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        const sizeInBytes = new Blob([value]).size;
        totalSize += sizeInBytes;
      }
    }
  });

  console.log(`💾 Dimensione totale da rimuovere: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Seconda passa - rimuovi
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      const value = localStorage.getItem(key);
      if (value) {
        const sizeInBytes = new Blob([value]).size;
        console.log(`🗑️  Rimuovo ${key}: ${(sizeInBytes / 1024).toFixed(2)} KB`);
        localStorage.removeItem(key);
        removedCount++;
      }
    }
  });

  console.log(`✅ Pulizia completata!`);
  console.log(`   - Chiavi rimosse: ${removedCount}`);
  console.log(`   - Spazio liberato: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Chiavi mantenute: ${keysToKeep.length}`);

  return {
    removedCount,
    totalSizeBytes: totalSize,
    keptKeys: keysToKeep
  };
};

// Funzione per mostrare dimensioni localStorage
export const analyzeLocalStorageSize = () => {
  if (typeof window === 'undefined') {
    console.error('Questo script può essere eseguito solo nel browser');
    return null;
  }

  const allKeys = Object.keys(localStorage);
  const analysis: Array<{key: string, sizeKB: number}> = [];
  let totalSize = 0;

  allKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      const sizeInBytes = new Blob([value]).size;
      totalSize += sizeInBytes;
      analysis.push({
        key,
        sizeKB: sizeInBytes / 1024
      });
    }
  });

  // Ordina per dimensione decrescente
  analysis.sort((a, b) => b.sizeKB - a.sizeKB);

  console.log(`📊 Analisi localStorage (Top 20):`);
  console.log(`══════════════════════════════════════════════`);
  analysis.slice(0, 20).forEach((item, index) => {
    console.log(`${index + 1}. ${item.key}: ${item.sizeKB.toFixed(2)} KB`);
  });
  console.log(`══════════════════════════════════════════════`);
  console.log(`💾 TOTALE: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  return {
    items: analysis,
    totalSizeMB: totalSize / 1024 / 1024,
    totalKeys: allKeys.length
  };
};

// Per uso da console browser
if (typeof window !== 'undefined') {
  (window as any).clearOrtomioLocalStorage = clearAllLocalStorageData;
  (window as any).analyzeOrtomioStorage = analyzeLocalStorageSize;

  console.log(`🔧 Funzioni disponibili nella console:`);
  console.log(`   - analyzeOrtomioStorage() - Analizza dimensioni localStorage`);
  console.log(`   - clearOrtomioLocalStorage() - Pulisce localStorage (mantiene solo preferenze)`);
}
