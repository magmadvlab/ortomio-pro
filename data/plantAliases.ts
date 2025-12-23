/**
 * Database aliases/sinonimi per nomi comuni di piante
 * Mappa sinonimi italiani e nomi alternativi alle forme canoniche usate nel database
 */

export interface PlantAlias {
  /** Sinonimi/nomi alternativi (chiavi) */
  aliases: string[];
  /** Nome canonico usato nel database (valore) */
  canonical: string;
}

/**
 * Mappatura sinonimi -> nome canonico
 * Quando l'utente cerca un sinonimo, viene normalizzato al nome canonico
 */
export const plantAliases: PlantAlias[] = [
  // FRUTTA ESOTICA
  {
    aliases: ['banana', 'banane'],
    canonical: 'banano'
  },
  
  // CEREALI
  {
    aliases: ['grano', 'grano tenero', 'grano duro'],
    canonical: 'frumento'
  },
  {
    aliases: ['triticum', 'triticum aestivum', 'triticum durum'],
    canonical: 'frumento'
  },
  {
    aliases: ['mais', 'granturco', 'granoturco'],
    canonical: 'mais'
  },
  {
    aliases: ['orzo'],
    canonical: 'orzo'
  },
  {
    aliases: ['avena'],
    canonical: 'avena'
  },
  
  // ORTAGGI - Sinonimi comuni
  {
    aliases: ['patate', 'patata'],
    canonical: 'patata'
  },
  {
    aliases: ['radicchi', 'radicchio'],
    canonical: 'radicchio'
  },
  {
    aliases: ['spinaci', 'spinacio'],
    canonical: 'spinacio'
  },
  {
    aliases: ['finocchi', 'finocchio'],
    canonical: 'finocchio'
  },
  {
    aliases: ['pomodori', 'pomodoro'],
    canonical: 'pomodoro'
  },
  {
    aliases: ['peperoncini', 'peperoncino'],
    canonical: 'peperoncino'
  },
  {
    aliases: ['zucchine', 'zucchina', 'zucchino'],
    canonical: 'zucchina'
  },
  {
    aliases: ['melanzane', 'melanzana'],
    canonical: 'melanzana'
  },
  {
    aliases: ['lattughe', 'lattuga'],
    canonical: 'lattuga'
  },
  {
    aliases: ['fagioli', 'fagiolo'],
    canonical: 'fagiolo'
  },
  {
    aliases: ['piselli', 'pisello'],
    canonical: 'pisello'
  },
  {
    aliases: ['carote', 'carota'],
    canonical: 'carota'
  },
  {
    aliases: ['cipolle', 'cipolla'],
    canonical: 'cipolla'
  },
  
  // ERBE AROMATICHE
  {
    aliases: ['basilici', 'basilico'],
    canonical: 'basilico'
  },
  {
    aliases: ['rosmarini', 'rosmarino'],
    canonical: 'rosmarino'
  },
  {
    aliases: ['salvie', 'salvia'],
    canonical: 'salvia'
  },
  
  // FRUTTI
  {
    aliases: ['fragole', 'fragola'],
    canonical: 'fragola'
  },
  {
    aliases: ['lamponi', 'lampone'],
    canonical: 'lampone'
  },
  {
    aliases: ['mirtilli', 'mirtillo'],
    canonical: 'mirtillo'
  },
  
  // ALBERI DA FRUTTO
  {
    aliases: ['melo', 'meli', 'mela', 'mele'],
    canonical: 'melo'
  },
  {
    aliases: ['pero', 'peri', 'pera', 'pere'],
    canonical: 'pero'
  },
  {
    aliases: ['pesco', 'peschi', 'pesca', 'pesche'],
    canonical: 'pesco'
  },
  {
    aliases: ['albicocco', 'albicocchi', 'albicocca', 'albicocche'],
    canonical: 'albicocco'
  },
  {
    aliases: ['ciliegio', 'ciliegi', 'ciliegia', 'ciliegie'],
    canonical: 'ciliegio'
  },
  {
    aliases: ['olivo', 'olivi', 'oliva', 'olive'],
    canonical: 'olivo'
  },
  {
    aliases: ['vite', 'viti', 'uva'],
    canonical: 'vite'
  },
  
  // NUOVE VERDURE
  {
    aliases: ['zucche', 'zucca'],
    canonical: 'zucca'
  },
  {
    aliases: ['cetrioli', 'cetriolo'],
    canonical: 'cetriolo'
  },
  {
    aliases: ['meloni', 'melone'],
    canonical: 'melone'
  },
  {
    aliases: ['angurie', 'anguria', 'cocomero'],
    canonical: 'anguria'
  },
  {
    aliases: ['peperoni', 'peperone'],
    canonical: 'peperone-dolce'
  },
  {
    aliases: ['agli', 'aglio'],
    canonical: 'aglio'
  },
  {
    aliases: ['porri', 'porro'],
    canonical: 'porro'
  },
  {
    aliases: ['scalogni', 'scalogno'],
    canonical: 'scalogno'
  },
  {
    aliases: ['barbabietole', 'barbabietola'],
    canonical: 'barbabietola-rossa'
  },
  {
    aliases: ['rape', 'rapa'],
    canonical: 'rapa'
  },
  {
    aliases: ['ravanelli', 'ravanello'],
    canonical: 'ravanello'
  },
  {
    aliases: ['sedani', 'sedano'],
    canonical: 'sedano'
  },
  {
    aliases: ['prezzemoli', 'prezzemolo'],
    canonical: 'prezzemolo'
  },
  {
    aliases: ['carciofi', 'carciofo'],
    canonical: 'carciofo'
  },
  {
    aliases: ['asparagi', 'asparago'],
    canonical: 'asparago'
  },
  {
    aliases: ['rucole', 'rucola'],
    canonical: 'rucola'
  },
  {
    aliases: ['pastinache', 'pastinaca'],
    canonical: 'pastinaca'
  },
  {
    aliases: ['topinambur', 'topinamburi'],
    canonical: 'topinambur'
  },
  {
    aliases: ['patate-dolci', 'patata-dolce', 'batata'],
    canonical: 'patata-dolce'
  },
  {
    aliases: ['erba-cipollina', 'erba cipollina'],
    canonical: 'erba-cipollina'
  },
  
  // NUOVE INSALATE E FOGLIE
  {
    aliases: ['indivie', 'indivia'],
    canonical: 'indivia-riccia'
  },
  {
    aliases: ['scarole', 'scarola'],
    canonical: 'scarola'
  },
  {
    aliases: ['cicorie', 'cicoria'],
    canonical: 'cicoria'
  },
  {
    aliases: ['catalogne', 'catalogna'],
    canonical: 'catalogna'
  },
  {
    aliases: ['puntarelle', 'puntarella'],
    canonical: 'puntarelle'
  },
  {
    aliases: ['bietole', 'bietola'],
    canonical: 'bietola-da-costa'
  },
  {
    aliases: ['crescioni', 'crescione'],
    canonical: 'crescione'
  },
  {
    aliases: ['portulache', 'portulaca'],
    canonical: 'portulaca'
  },
  
  // NUOVI CAVOLI E BRASSICACEE
  {
    aliases: ['cavolfiori', 'cavolfiore'],
    canonical: 'cavolfiore'
  },
  {
    aliases: ['broccoli', 'broccolo'],
    canonical: 'broccolo'
  },
  {
    aliases: ['cavolo-romanesco', 'romanesco'],
    canonical: 'cavolo-romanesco'
  },
  {
    aliases: ['cavolo-cappuccio', 'cavolo cappuccio'],
    canonical: 'cavolo-cappuccio'
  },
  {
    aliases: ['verze', 'verza', 'cavolo-verza'],
    canonical: 'cavolo-verza'
  },
  {
    aliases: ['cavolo-nero', 'cavolo nero'],
    canonical: 'cavolo-nero'
  },
  {
    aliases: ['cavolo-riccio', 'kale', 'cavolo riccio'],
    canonical: 'cavolo-riccio-kale'
  },
  {
    aliases: ['cavolo-rosso', 'cavolo rosso'],
    canonical: 'cavolo-rosso'
  },
  {
    aliases: ['cavolini-di-bruxelles', 'cavolini di bruxelles', 'cavoletti di bruxelles'],
    canonical: 'cavolini-di-bruxelles'
  },
  {
    aliases: ['cime-di-rapa', 'cime di rapa', 'broccoletti'],
    canonical: 'cime-di-rapa'
  },
  {
    aliases: ['cavolo-rapa', 'kohlrabi'],
    canonical: 'cavolo-rapa-kohlrabi'
  },
  {
    aliases: ['cavolo-cinese', 'pak-choi', 'pak choi'],
    canonical: 'cavolo-cinese-pak-choi'
  },
  
  // NUOVI LEGUMI
  {
    aliases: ['fagiolini', 'fagiolino'],
    canonical: 'fagiolino'
  },
  {
    aliases: ['fagioli-secchi', 'fagiolo secco'],
    canonical: 'fagiolo-secco'
  },
  {
    aliases: ['piselli-mangiatutto', 'pisello mangiatutto', 'taccole'],
    canonical: 'pisello-mangiatutto'
  },
  {
    aliases: ['fave', 'fava'],
    canonical: 'fava'
  },
  {
    aliases: ['ceci', 'cece'],
    canonical: 'ceci'
  },
  {
    aliases: ['lenticchie', 'lenticchia'],
    canonical: 'lenticchia'
  },
  {
    aliases: ['lupini', 'lupino'],
    canonical: 'lupino'
  },
  {
    aliases: ['cicerchie', 'cicerchia'],
    canonical: 'cicerchia'
  },
  {
    aliases: ['soia', 'soja'],
    canonical: 'soia'
  },
  {
    aliases: ['taccole', 'taccola'],
    canonical: 'taccole'
  },
  
  // NUOVE AROMATICHE
  {
    aliases: ['maggiorane', 'maggiorana'],
    canonical: 'maggiorana'
  },
  {
    aliases: ['alloro', 'lauro'],
    canonical: 'alloro'
  },
  {
    aliases: ['coriandoli', 'coriandolo'],
    canonical: 'coriandolo'
  },
  {
    aliases: ['aneti', 'aneto'],
    canonical: 'aneto'
  },
  {
    aliases: ['finocchietto', 'finocchietto-selvatico'],
    canonical: 'finocchietto-selvatico'
  },
  {
    aliases: ['santoreggie', 'santoreggia'],
    canonical: 'santoreggia'
  },
  {
    aliases: ['melisse', 'melissa'],
    canonical: 'melissa'
  },
  {
    aliases: ['erba-luigia', 'cedrina', 'erba luigia'],
    canonical: 'erba-luigia-cedrina'
  },
  {
    aliases: ['dragoncelli', 'dragoncello', 'estragone'],
    canonical: 'dragoncello'
  },
  {
    aliases: ['rute', 'ruta'],
    canonical: 'ruta'
  },
  {
    aliases: ['borragini', 'borragine'],
    canonical: 'borragine'
  },
  {
    aliases: ['calendule', 'calendula'],
    canonical: 'calendula-edibile'
  },
  {
    aliases: ['nasturzi', 'nasturzio'],
    canonical: 'nasturzio-edibile'
  },
  {
    aliases: ['camomille', 'camomilla'],
    canonical: 'camomilla'
  },
  {
    aliases: ['zafferani', 'zafferano'],
    canonical: 'zafferano'
  },
  {
    aliases: ['capperi', 'cappero'],
    canonical: 'cappero'
  },
  
  // NUOVI FRUTTI ESOTICI
  {
    aliases: ['gelsi', 'gelso'],
    canonical: 'gelso'
  },
  {
    aliases: ['giuggioli', 'giuggiolo'],
    canonical: 'giuggiolo'
  },
  {
    aliases: ['corbezzoli', 'corbezzolo'],
    canonical: 'corbezzolo'
  },
  {
    aliases: ['mirti', 'mirto'],
    canonical: 'mirto'
  },
  {
    aliases: ['sorbi', 'sorbo'],
    canonical: 'sorbo-domestico'
  },
  {
    aliases: ['azzaroli', 'azzarolo'],
    canonical: 'azzarolo'
  },
  {
    aliases: ['carrubi', 'carrubo'],
    canonical: 'carrubo'
  },
  {
    aliases: ['alchechengi', 'physalis'],
    canonical: 'alchechengi'
  },
  {
    aliases: ['sambuchi', 'sambuco'],
    canonical: 'sambuco'
  },
  {
    aliases: ['cornioli', 'corniolo'],
    canonical: 'corniolo'
  },
  {
    aliases: ['prugnoli', 'prugnolo'],
    canonical: 'prugnolo'
  },
  
  // NUOVI FRUTTI DI BOSCO
  {
    aliases: ['more', 'mora'],
    canonical: 'mora'
  },
  {
    aliases: ['ribes', 'ribes-rosso'],
    canonical: 'ribes-rosso'
  },
  {
    aliases: ['ribes-nero', 'ribes nero'],
    canonical: 'ribes-nero'
  },
  {
    aliases: ['uva-spina', 'uva spina'],
    canonical: 'uva-spina'
  },
  {
    aliases: ['fragoline-di-bosco', 'fragolina di bosco'],
    canonical: 'fragolina-di-bosco'
  }
];

/**
 * Trova il nome canonico per un alias/sinonimo
 * @param query Nome cercato dall'utente
 * @returns Nome canonico se trovato, altrimenti la query originale
 */
export const normalizeToCanonical = (query: string): string => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Se la query contiene più di una parola, potrebbe essere una varietà (es. "peperoncino habanero")
  // In questo caso, prova prima a normalizzare solo la prima parola
  const words = normalizedQuery.split(/\s+/);
  const firstWord = words[0];
  const hasVariety = words.length > 1;
  
  // Cerca un alias che corrisponda
  for (const aliasGroup of plantAliases) {
    if (aliasGroup.aliases.some(alias => {
      const aliasNorm = alias.toLowerCase().trim();
      
      // Match esatto (sempre valido)
      if (aliasNorm === normalizedQuery) return true;
      
      // Se c'è una varietà, normalizza solo se il match è esatto sulla prima parola
      if (hasVariety) {
        // Match esatto sulla prima parola (es. "peperoncino habanero" -> "peperoncino")
        if (aliasNorm === firstWord) return true;
        // Match esatto dell'alias con la prima parola (es. "peperoncini" -> "peperoncino")
        if (firstWord === aliasNorm || aliasNorm === firstWord) return true;
        // Non normalizzare se l'alias è più lungo della prima parola e contiene spazi
        // (evita di normalizzare "peperoncino habanero" quando cerca "peperoncino")
        return false;
      }
      
      // Match con includes solo se non c'è varietà (per gestire "banana nano" -> "banana")
      // Ma solo se l'alias è una parola singola o se la query inizia con l'alias
      if (normalizedQuery.startsWith(aliasNorm + ' ') || normalizedQuery === aliasNorm) {
        return true;
      }
      
      return false;
    })) {
      // Se c'è una varietà, mantieni la varietà dopo la normalizzazione
      if (hasVariety && words.length > 1) {
        const restOfQuery = words.slice(1).join(' ');
        return `${aliasGroup.canonical} ${restOfQuery}`;
      }
      return aliasGroup.canonical;
    }
  }
  
  // Nessun alias trovato, ritorna la query originale
  return query;
};

/**
 * Ottiene tutti gli alias per un nome canonico
 * @param canonical Nome canonico
 * @returns Array di sinonimi/alias
 */
export const getAliasesForCanonical = (canonical: string): string[] => {
  const normalizedCanonical = canonical.toLowerCase().trim();
  const aliasGroup = plantAliases.find(a => a.canonical.toLowerCase() === normalizedCanonical);
  return aliasGroup ? aliasGroup.aliases : [];
};

