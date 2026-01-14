// ============================================
// SCHEDE PRODOTTO AI (Fertilizzanti e Trattamenti)
// ============================================

export interface ProductCard {
  id: string;
  userId: string;
  gardenId?: string; // Opzionale: associato a un orto specifico

  name: string; // Nome commerciale o generico (es. "NPK 10-10-10", "Bacillus thuringiensis")
  type: 'fertilizer' | 'treatment';
  category?: string; // 'organic', 'mineral', 'biostimulant', 'fungal', 'pest', 'bacterial', etc.

  // Dati generati da AI
  description?: string; // Descrizione dettagliata del prodotto
  scientificName?: string; // Nome scientifico (es. "Bacillus thuringiensis var. kurstaki")
  activeIngredients?: string; // Principi attivi (es. "Azoto 10%, Fosforo 10%, Potassio 10%")

  // Dosaggio e applicazione
  recommendedDosage?: string; // Dosaggio consigliato (es. "200g/m²", "10ml/L acqua")
  applicationMethod?: string; // Metodo di applicazione (es. "Fogliare", "Radicale", "Nebulizzazione")
  applicationFrequency?: string; // Frequenza testuale (es. "Ogni 14 giorni")
  defaultRepeatDays?: number; // Giorni tra applicazioni

  // Aggiustamenti stagionali
  seasonalAdjustment?: {
    summer?: number; // Moltiplicatore estate (es. 0.8 = più frequente)
    winter?: number; // Moltiplicatore inverno (es. 1.5 = meno frequente)
  };

  // Informazioni di sicurezza e best practices
  precautions?: string[]; // Precauzioni d'uso
  bestFor?: string[]; // Lista di piante/malattie per cui è indicato
  avoidWith?: string[]; // Incompatibilità (es. "Non usare con rame")
  bestTime?: string; // Momento migliore applicazione (es. "Mattina presto", "Sera dopo tramonto")
  phRequirement?: string; // pH ottimale se rilevante

  // Compatibilità biologico
  organicCertified?: boolean; // Ammesso in agricoltura biologica

  // Metadati
  createdAt: string; // ISO date
  lastUsed?: string; // ISO date ultima applicazione
  timesUsed?: number; // Quante volte usato

  // AI generation tracking
  aiGenerated: boolean; // Generato da AI?
  aiProvider?: string; // 'groq', 'openai', etc.
  aiModel?: string; // Modello usato
  aiPrompt?: string; // Prompt usato (opzionale, per debug)

  // Storico applicazioni (opzionale, per tracking dettagliato)
  applicationHistory?: Array<{
    date: string; // ISO date
    taskId?: string; // Riferimento a GardenTask se applicato
    plantName?: string; // Nome pianta trattata
    dosageUsed: string; // Dosaggio effettivo usato
    notes?: string;
  }>;
}