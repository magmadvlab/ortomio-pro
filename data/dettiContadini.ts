/**
 * Database Detti Contadini Italiani
 * Proverbi e detti tradizionali organizzati per mese/stagione
 * Con spiegazioni e consigli per l'orto
 */

export interface DettoContadino {
  mese: number; // 1-12
  giorno?: number; // Opzionale, per detti specifici di un giorno
  detto: string;
  varianteRegionale?: Record<string, string>; // Varianti in dialetto per regione
  spiegazione: string;
  consiglioOrto?: string;
  fonte?: string;
}

export const dettiContadini: DettoContadino[] = [
  // GENNAIO
  {
    mese: 1,
    giorno: 1,
    detto: 'Anno nuovo, vita nuova',
    spiegazione: 'Il Capodanno segna un nuovo inizio, anche per l\'orto. È il momento di pianificare la stagione agricola.',
    consiglioOrto: 'Prepara il calendario delle semine. Ordina semi e attrezzi. Pulisci e organizza la serra/semenzaio.',
    fonte: 'Tradizione popolare'
  },
  {
    mese: 1,
    giorno: 6,
    detto: 'L\'Epifania tutte le feste porta via',
    spiegazione: 'Dopo l\'Epifania, si torna alla normalità e si riprende il lavoro agricolo.',
    consiglioOrto: 'Ultimi giorni di riposo. Dopo l\'Epifania, inizia preparazione terreno per semine primaverili.',
    fonte: 'Tradizione popolare'
  },
  {
    mese: 1,
    detto: 'Gennaio, il mese più freddo dell\'anno',
    spiegazione: 'Gennaio è tradizionalmente il mese più rigido, con gelate notturne frequenti.',
    consiglioOrto: 'Proteggi piante sensibili dal gelo. Non seminare all\'aperto. Lavora in serra o semenzaio.',
    fonte: 'Tradizione popolare'
  },
  {
    mese: 1,
    detto: 'Se gennaio non è gelato, marzo è rovinato',
    spiegazione: 'Un gennaio mite può portare a un marzo freddo e problematico per le semine.',
    consiglioOrto: 'Se gennaio è mite, non anticipare le semine. Aspetta marzo per valutare meglio.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 1,
    detto: 'Gennaio asciutto, granaio ricco',
    spiegazione: 'Un gennaio senza piogge eccessive favorisce la conservazione dei raccolti.',
    consiglioOrto: 'Controlla umidità in magazzino. Ventila i locali di conservazione.',
    fonte: 'Tradizione contadina'
  },
  
  // FEBBRAIO
  {
    mese: 2,
    giorno: 2,
    detto: 'Per la Candelora, dall\'inverno siamo fuora; ma se piove o tira vento, dell\'inverno siamo dentro',
    spiegazione: 'La Candelora (2 febbraio) predice il tempo: se è soleggiata, l\'inverno continua; se è nuvolosa, la primavera arriva presto.',
    consiglioOrto: 'Osserva il tempo della Candelora per pianificare semine. Se nuvoloso, puoi anticipare alcune semine.',
    fonte: 'Tradizione popolare italiana'
  },
  {
    mese: 2,
    detto: 'Febbraio corto e amaro',
    spiegazione: 'Febbraio è il mese più corto ma spesso il più rigido, con gelate tardive.',
    consiglioOrto: 'Non abbassare la guardia. Le gelate di febbraio possono danneggiare piante già in crescita.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 2,
    detto: 'Febbraio nevoso, estate gioiosa',
    spiegazione: 'La neve di febbraio porta nutrienti al terreno e preannuncia un\'estate favorevole.',
    consiglioOrto: 'La neve protegge il terreno dal gelo intenso. Dopo lo scioglimento, il terreno sarà più fertile.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 2,
    detto: 'Se febbraio non febbreggia, marzo marzeggia',
    spiegazione: 'Se febbraio è mite, marzo sarà freddo e ventoso.',
    consiglioOrto: 'Non fidarti di un febbraio mite. Aspetta marzo per semine all\'aperto.',
    fonte: 'Tradizione contadina'
  },
  
  // MARZO
  {
    mese: 3,
    giorno: 19,
    detto: 'San Giuseppe, semina senza paura',
    spiegazione: 'Il 19 marzo (San Giuseppe) segna tradizionalmente l\'inizio della primavera agricola.',
    consiglioOrto: 'Semina fave, piselli, lattughe in pieno campo. Trapianti di cipolle, aglio.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 3,
    detto: 'Marzo pazzerello, esce il sole e prendi l\'ombrello',
    spiegazione: 'Marzo è un mese instabile, con alternanza di sole e pioggia.',
    consiglioOrto: 'Proteggi semine da piogge eccessive. Usa tunnel o coperture temporanee.',
    fonte: 'Tradizione popolare'
  },
  {
    mese: 3,
    detto: 'Marzo ventoso, aprile piovoso, maggio fiorito',
    spiegazione: 'Un marzo ventoso porta un aprile piovoso e un maggio ricco di fiori.',
    consiglioOrto: 'Prepara drenaggio per aprile. Marzo ventoso aiuta a seccare il terreno.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 3,
    detto: 'A marzo ogni cespuglio è un orto',
    spiegazione: 'Marzo è il mese in cui tutto inizia a crescere e fiorire.',
    consiglioOrto: 'Massima attività di semina e trapianto. Monitora crescita quotidiana.',
    fonte: 'Tradizione contadina'
  },
  
  // APRILE
  {
    mese: 4,
    detto: 'Aprile dolce dormire',
    spiegazione: 'Aprile è un mese piacevole, ma non bisogna dormire: è il momento cruciale per le semine.',
    consiglioOrto: 'Massima attività! Semine di pomodori, zucchine, peperoni. Trapianti in pieno campo.',
    fonte: 'Tradizione popolare'
  },
  {
    mese: 4,
    detto: 'Aprile piovoso, maggio ventoso, anno fruttuoso',
    spiegazione: 'Le piogge di aprile e i venti di maggio favoriscono un raccolto abbondante.',
    consiglioOrto: 'Le piogge di aprile sono preziose. Non irrigare eccessivamente se piove.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 4,
    detto: 'Aprile fa il fiore, maggio gli dà il colore',
    spiegazione: 'Ad aprile le piante fioriscono, a maggio i frutti maturano.',
    consiglioOrto: 'Proteggi fioriture da gelate tardive. Supporta piante rampicanti.',
    fonte: 'Tradizione contadina'
  },
  
  // MAGGIO
  {
    mese: 5,
    detto: 'Maggio asciutto, granaio ricco',
    spiegazione: 'Un maggio senza piogge eccessive favorisce la crescita e la maturazione.',
    consiglioOrto: 'Irrigazione regolare necessaria se maggio è secco. Monitora umidità terreno.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 5,
    detto: 'Maggio ventoso, anno fruttuoso',
    spiegazione: 'I venti di maggio favoriscono l\'impollinazione e prevengono malattie fungine.',
    consiglioOrto: 'I venti aiutano l\'impollinazione. Proteggi piante delicate da venti forti.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 5,
    detto: 'A maggio ogni uccello fa il suo nido',
    spiegazione: 'Maggio è il mese della riproduzione e della crescita per tutti gli esseri viventi.',
    consiglioOrto: 'Massima crescita vegetativa. Supporta piante con tutori. Controlla parassiti.',
    fonte: 'Tradizione popolare'
  },
  
  // GIUGNO
  {
    mese: 6,
    detto: 'Giugno la falce in pugno',
    spiegazione: 'Giugno è il mese dei primi raccolti, si inizia a mietere.',
    consiglioOrto: 'Raccogli erbe aromatiche, lattughe, rucola. Inizia raccolti di pomodori precoci.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 6,
    detto: 'Giugno, sole e luna',
    spiegazione: 'Giugno ha le giornate più lunghe dell\'anno (solstizio d\'estate).',
    consiglioOrto: 'Massima luce solare. Irrigazione intensa necessaria. Raccogli erbe al mattino presto.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 6,
    detto: 'Giugno ventoso, anno fruttuoso',
    spiegazione: 'I venti di giugno favoriscono l\'impollinazione e prevengono malattie.',
    consiglioOrto: 'I venti aiutano l\'impollinazione. Proteggi piante da venti forti.',
    fonte: 'Tradizione contadina'
  },
  
  // LUGLIO
  {
    mese: 7,
    detto: 'Luglio, sole e caldo',
    spiegazione: 'Luglio è il mese più caldo, con massima intensità solare.',
    consiglioOrto: 'Irrigazione mattutina e serale. Ombreggiamento per piante sensibili. Raccogli al mattino presto.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 7,
    detto: 'Luglio asciutto, granaio ricco',
    spiegazione: 'Un luglio senza piogge eccessive favorisce la maturazione dei frutti.',
    consiglioOrto: 'Irrigazione regolare essenziale. Controlla umidità terreno. Raccogli pomodori, zucchine, peperoni.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 7,
    detto: 'A luglio, ogni frutto è maturo',
    spiegazione: 'Luglio è il mese della massima maturazione per molti ortaggi estivi.',
    consiglioOrto: 'Raccogli quotidianamente per stimolare nuova produzione. Conserva o trasforma i raccolti.',
    fonte: 'Tradizione contadina'
  },
  
  // AGOSTO
  {
    mese: 8,
    detto: 'Agosto, riposo e raccolto',
    spiegazione: 'Agosto è il mese del riposo estivo ma anche dei grandi raccolti.',
    consiglioOrto: 'Raccogli pomodori, melanzane, peperoni. Pianifica semine autunnali. Irrigazione intensa.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 8,
    detto: 'Agosto asciutto, granaio ricco',
    spiegazione: 'Un agosto senza piogge eccessive favorisce la maturazione e la conservazione.',
    consiglioOrto: 'Irrigazione regolare. Raccogli e conserva. Prepara terreno per semine autunnali.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 8,
    giorno: 15,
    detto: 'Ferragosto, estate al massimo',
    spiegazione: 'Il 15 agosto (Ferragosto) segna il culmine dell\'estate.',
    consiglioOrto: 'Massima produzione estiva. Raccogli quotidianamente. Inizia semine autunnali in semenzaio.',
    fonte: 'Tradizione popolare'
  },
  
  // SETTEMBRE
  {
    mese: 9,
    detto: 'Settembre, l\'uva è matura',
    spiegazione: 'Settembre è il mese della vendemmia e dei raccolti autunnali.',
    consiglioOrto: 'Raccogli uva, pomodori tardivi, peperoni. Semina spinaci, valerianella, rucola autunnale.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 9,
    detto: 'Settembre piovoso, ottobre ventoso, anno fruttuoso',
    spiegazione: 'Le piogge di settembre e i venti di ottobre favoriscono i raccolti autunnali.',
    consiglioOrto: 'Le piogge di settembre sono preziose. Non irrigare eccessivamente se piove.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 9,
    detto: 'A settembre, ogni frutto è maturo',
    spiegazione: 'Settembre è il mese della maturazione per molti frutti autunnali.',
    consiglioOrto: 'Raccogli quotidianamente. Conserva o trasforma i raccolti. Prepara terreno per inverno.',
    fonte: 'Tradizione contadina'
  },
  
  // OTTOBRE
  {
    mese: 10,
    detto: 'Ottobre, semina e raccolta',
    spiegazione: 'Ottobre è il mese delle semine autunnali e degli ultimi raccolti estivi.',
    consiglioOrto: 'Semina aglio, cipolle, fave. Raccogli ultimi pomodori, peperoni. Prepara terreno per inverno.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 10,
    detto: 'Ottobre ventoso, anno fruttuoso',
    spiegazione: 'I venti di ottobre favoriscono la maturazione e prevengono malattie fungine.',
    consiglioOrto: 'I venti aiutano a seccare il terreno. Proteggi piante da venti forti.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 10,
    detto: 'Ottobre piovoso, novembre ventoso, anno fruttuoso',
    spiegazione: 'Le piogge di ottobre e i venti di novembre favoriscono i raccolti invernali.',
    consiglioOrto: 'Le piogge di ottobre sono preziose. Prepara drenaggio per novembre.',
    fonte: 'Tradizione contadina'
  },
  
  // NOVEMBRE
  {
    mese: 11,
    giorno: 11,
    detto: 'Per San Martino, ogni mosto diventa vino',
    spiegazione: 'L\'11 novembre (San Martino) segna l\'Estate di San Martino e l\'apertura dei vini nuovi.',
    consiglioOrto: 'Ultimi raccolti autunnali. Preparazione terreno per inverno. Semine invernali: aglio, cipolle, fave.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 11,
    detto: 'Novembre, prepara l\'inverno',
    spiegazione: 'Novembre è il mese di preparazione per l\'inverno.',
    consiglioOrto: 'Proteggi piante dal freddo. Pulisci e organizza attrezzi. Pianifica prossima stagione.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 11,
    detto: 'Novembre ventoso, dicembre gelido',
    spiegazione: 'Un novembre ventoso preannuncia un dicembre freddo.',
    consiglioOrto: 'Proteggi piante dal vento e dal freddo. Prepara coperture per gelate.',
    fonte: 'Tradizione contadina'
  },
  
  // DICEMBRE
  {
    mese: 12,
    detto: 'Dicembre gelido, gennaio freddo',
    spiegazione: 'Un dicembre molto freddo preannuncia un gennaio rigido.',
    consiglioOrto: 'Massima protezione dal gelo. Non lavorare terreno gelato. Pianifica prossima stagione.',
    fonte: 'Tradizione contadina'
  },
  {
    mese: 12,
    giorno: 25,
    detto: 'Natale con i tuoi, Pasqua con chi vuoi',
    spiegazione: 'Tradizione popolare che lega le festività principali.',
    consiglioOrto: 'Giorno di riposo. Dopo Natale, inizia pianificazione semine primaverili.',
    fonte: 'Tradizione popolare'
  },
  {
    mese: 12,
    detto: 'Dicembre nevoso, anno fruttuoso',
    spiegazione: 'La neve di dicembre porta nutrienti al terreno e preannuncia un anno favorevole.',
    consiglioOrto: 'La neve protegge il terreno dal gelo intenso. Dopo lo scioglimento, il terreno sarà più fertile.',
    fonte: 'Tradizione contadina'
  }
];

/**
 * Ottiene i detti contadini per un mese specifico
 */
export function getDettiForMonth(mese: number): DettoContadino[] {
  return dettiContadini.filter(d => d.mese === mese);
}

/**
 * Ottiene i detti contadini per una data specifica
 */
export function getDettiForDate(date: Date): DettoContadino[] {
  const mese = date.getMonth() + 1;
  const giorno = date.getDate();
  
  return dettiContadini.filter(d => 
    d.mese === mese && (d.giorno === undefined || d.giorno === giorno)
  );
}

/**
 * Ottiene un detto casuale per un mese
 */
export function getRandomDettoForMonth(mese: number): DettoContadino | null {
  const detti = getDettiForMonth(mese);
  if (detti.length === 0) return null;
  
  return detti[Math.floor(Math.random() * detti.length)];
}
