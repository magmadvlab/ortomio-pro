# OrtoMio — Brief di implementazione sito

- **Data:** 2026-08-15
- **Tipo:** brief marketing-oriented per l'implementazione della landing page pubblica di OrtoMio
- **Fonti:** [PRODUCT.md](../../../PRODUCT.md), [DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md](../../DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md), [2026-08-15-ortomio-landing-copy-design.md](./2026-08-15-ortomio-landing-copy-design.md), mockup pubblicato (Artifact)
- **Skill applicate:** copywriting, marketing-psychology, ux-copy, impeccable (design Persuade)

## 0. Perché questo documento esiste

I documenti precedenti sono ricerca (commerciale, approfondito, verificato riga per riga contro il codice) e una prima bozza di copy (che è cresciuta fino a 9 sezioni tecniche, troppe per una singola landing). Questo brief fa il lavoro che mancava: **decide cosa va sulla landing principale, cosa va altrove, e come si implementa**, così il prossimo passo è scrivere codice, non continuare a scavare.

## 1. Posizionamento e strategia (sintesi)

**Posizionamento:** OrtoMio non è un'agenda agricola né un chatbot AI generico. È l'unico prodotto che mostra il proprio ragionamento — punteggio scomponibile, confidenza dichiarata, alternative valutate — invece di dare un consiglio a scatola chiusa.

**Meccanismo unico (quello che un concorrente non può copiare a parole):** il pannello di trasparenza AI reale (4 tab: Panoramica/Dati/Calcoli/Alternative) e l'orchestratore che correla ~20 motori in un'unica lettura giornaliera.

**Pubblico primario (nell'ordine in cui l'hero deve parlare):** aziende agricole strutturate e tecnici/consulenti agronomici, nello stesso hero, con una sezione dedicata a metà pagina che li tratta separatamente (non due funnel distinti).

**Tono:** ambizioso ma onesto. Non è una preferenza stilistica — è un requisito di prodotto: la release è demo/beta con stato commerciale NO-GO, e la documentazione interna del prodotto ha già una storia di correzione di marketing gonfiato (vedi §6). Ogni overclaim nella landing rischia di ripetere lo stesso errore in un canale diverso.

**CTA primaria:** "Prova la demo ora" → `/app` (ambiente demo, dati fittizi). **CTA secondaria, a basso peso visivo:** "Accedi" → `/login`, per chi ha già un account — vedi §4.1.

## 2. Psicologia persuasiva applicata — mappa sintetica

| Principio | Dove nella landing | Perché qui |
|---|---|---|
| Jobs to be Done | Headline hero | Vendere l'esito (verificare il calcolo), non la feature (software AI) |
| Pratfall Effect | Sezione maturità/onestà | Ammettere i limiti reali aumenta la credibilità sul resto |
| Contrast Effect | "Come funziona" | Prima (quaderni/Excel sparsi) vs dopo (lettura correlata) |
| Authority via onestà | Sezione onestà + numeri 15/14/2 verificabili | Un claim falsificabile è più credibile di un aggettivo |
| Regret/Loss Aversion azzerata | CTA finale | "Dati fittizi, nessun impegno" toglie il rischio percepito nel cliccare |
| Specificità > vaghezza | Ogni sezione | Niente "ottimizza"/"innovativo": solo meccanismi nominabili (Penman-Monteith, indice di Ravaz, ecc.) |

## 3. Architettura dell'informazione — la decisione di scope

Il materiale raccolto ha **9 differenzianti tecnici verificati**. Metterli tutti sulla landing principale la rende illeggibile (l'avevamo già notato nel mockup). La soluzione non è tagliare il materiale, è **stratificarlo su due livelli**:

### Livello 1 — Landing principale (`/`), una sola pagina, un solo argomento

In ordine, con priorità decrescente ma tutte presenti:

1. **Hero** — headline "punteggio che puoi scomporre" + sub + CTA primaria/secondaria (§4.1)
2. **Barra di stato onesta** — demo/beta dichiarato subito, non nascosto
3. **Il problema** — quaderni/Excel/fogli sparsi, linguaggio cliente
4. **Pilastro 1 — Verifica il calcolo** — pannello di trasparenza AI reale (4 tab), punteggio scomponibile, confidenza 0.3-0.98
5. **Pilastro 2 — Excel contiene i dati, OrtoMio li mette in relazione** — orchestratore + un solo esempio di rotazione botanica (non l'intera logica delle 8 famiglie, solo l'esempio Solanacee→Leguminose come prova)
6. **Pilastro 3 — Dal seme al raccolto, tracciabile** — codice pianta + collegamento a certificazione bio (è il pilastro con il valore di business più diretto e concreto)
7. **Doppio binario** — aziende agricole / tecnici e consulenti
8. **Benefici concreti** — 5 bullet, già scritti
9. **Maturità e onestà** — 15/14/2 capability, **un solo esempio curato** della cultura di correzione (raccomando: certificazioni "non sostituisce un audit", non la vicenda della success story inventata — troppo interna per un pubblico esterno)
10. **CTA finale** — ripete "Prova la demo ora", azzera il rischio

### Livello 2 — Pagina/sezione "Come funziona in profondità" (`/come-funziona` o accordion in fondo alla landing)

Materiale reale ma troppo denso per il primo livello, linkato da un CTA testuale tipo "Vedi tutti i meccanismi →" alla fine del Livello 1:

- Planning duale (classico vs AI, con scaglionamento/ROI/rischio)
- Irrigazione previsionale Penman-Monteith (dettaglio formula)
- IoT Smart Hub (ThingsBoard/Tuya, lifecycle comandi)
- Rotazione botanica completa (8 famiglie)
- Export con audit-gate e difesa CSV injection
- Indice di Ravaz (vigneto)

**Perché questa stratificazione, non un taglio:** il pubblico tecnico (consulenti agronomici) è esattamente il tipo di visitatore che clicca "vedi tutti i meccanismi" — perderemmo credibilità con loro se il materiale sparisse, ma perderemmo conversione con le aziende se restasse tutto in prima pagina. Questa è una decisione di implementazione, non di contenuto: nulla di quanto scritto finora va buttato.

### 4.1 Header e accesso all'applicazione (richiesto esplicitamente)

Header sticky, minimale:
- Logo OrtoMio a sinistra
- Badge di stato "demo/beta" (bassa intensità visiva, mono font — già nel mockup)
- A destra: **link testuale "Accedi"** (peso visivo basso, non un bottone) → `/login` — per utenti che hanno già un account
- Accanto, **CTA primaria piena** "Prova la demo" → `/app`

Distinzione intenzionale: "Accedi" è per chi torna, "Prova la demo" è per chi arriva per la prima volta e non deve pensare di aver bisogno di un account per guardare. Non unificare i due bottoni — sono due intenti diversi (Nudge Theory: il percorso a minor frizione va al visitatore nuovo, che è la maggioranza del traffico landing).

## 4. Copy — stato e fonte

Il copy sezione-per-sezione del Livello 1 è già scritto e validato in [2026-08-15-ortomio-landing-copy-design.md](./2026-08-15-ortomio-landing-copy-design.md) (sezioni 1-9, comprese le revisioni 1-4). Il copy del Livello 2 è nello stesso documento (sezioni 4quinquies, 4sexies) e nel [documento commerciale approfondito](../../DOCUMENTO_COMMERCIALE_ORTOMIO_PRO_2026-08-15_APPROFONDITO.md) (§3.10-3.15). Non va riscritto da zero — va **redistribuito** secondo la stratificazione di §3.

## 5. Direzione visiva (già validata nel mockup)

- **Mondo visivo:** "registro agronomico" — foglio di campagna/NDVI-grid, non un SaaS generico. Colore dominante verde petrolio (dal logo), accento ambra per priorità/stato beta, ground stone/paper (non cream — evita il default AI-generated).
- **Tipografia:** grotesk di sistema per display, mono per dati/etichette (misura, non costume — coerente con il prodotto che tratta la precisione del dato come tema centrale).
- **Motivo ricorrente:** legenda misurato/stimato/assente/simulato come dispositivo grafico, non solo concetto — usata nel rail laterale, negli swatch dei bullet, nei blocchi di calcolo.
- **Riferimento implementativo:** il mockup Artifact pubblicato in questa conversazione è il riferimento di fedeltà per hero e sezioni del Livello 1; va rifatto in componenti React/Tailwind coerenti con lo stack del progetto, non copiato come HTML statico.

## 6. Guardrail di onestà — non negoziabile

La ricerca ha trovato che la documentazione originale di OrtoMio (11/01/2026) conteneva una success story interamente inventata (azienda fittizia, cifre, citazione), poi trovata e rimossa in una campagna di correzione di 21 commit. Questo è il test che ogni riga della landing deve superare:

- Nessun nome di azienda cliente, nessuna cifra di risultato economico, nessuna citazione — a meno che non esistano davvero e siano autorizzate.
- Ogni numero tecnico (confidenza, punteggi, formule) deve essere verificabile nel codice, come lo sono quelli usati finora.
- La sezione maturità/onestà resta a peso pieno, mai relegata a nota a piè di pagina.

## 7. Requisiti tecnici di implementazione

- **Routing:** oggi [app/page.tsx](../../../app/page.tsx) fa solo redirect (verso `/auth/callback` se arrivano parametri Supabase, altrimenti verso `/app` dopo 1s). La landing pubblica deve intercettare la root **solo per visitatori senza sessione attiva**; un utente con sessione valida può continuare a essere reindirizzato direttamente a `/app` (comportamento da preservare, non rimuovere). Decisione da prendere in fase di piano: redirect lato server (controllo sessione in un layout/middleware) vs client-side come oggi.
- **Route login esistente:** `/login` (`app/(auth)/login`) — già presente, il link "Accedi" ci punta senza bisogno di nuovo lavoro.
- **Componenti:** landing come componente server-first (nessuna dipendenza da hook client se non per l'header sticky/reveal-on-scroll), coerente con Next.js 16 / React 19 del progetto.

## 8. Prossimi passi

1. Conferma di questo brief (struttura Livello 1/2, contenuto header, guardrail).
2. Passaggio a `writing-plans` per un piano di implementazione tecnico (file da creare/modificare, componenti, routing) — a valle dell'approvazione di questo brief, come da flusso `brainstorming → writing-plans`.
