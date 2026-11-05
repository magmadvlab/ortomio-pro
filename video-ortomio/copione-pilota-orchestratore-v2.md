# OrtoMio — Puntata pilota v2 «Il motore che decide che cosa viene prima»

**Data:** 28 ottobre 2026 · **Stato:** proposta, da approvare prima di generare la voce
**Sostituisce:** `copione-pilota-aspettativa-v1.md` (montato il 26/10, 96 s)
**Formato:** 16:9 + 9:16 · **Durata obiettivo:** 60–70 s · **Etichetta:** `SCENARIO DIMOSTRATIVO`

## Indicazioni dell'utente (28/10)

1. La v1 ha un ritmo troppo blando: niente cambi, niente intensità.
2. Le arance erano solo un esempio. Si parla di **raccolto in generale**, senza coltura protagonista.
3. **Nessun mese, nessuna data di stagione**: il video deve valere in qualsiasi periodo dell'anno.
4. Al centro: il **motore orchestratore** e la possibilità di **intervenire sulla singola pianta**.

## Perché la v1 è blanda (misurato su `src/ortomio/Pilot.tsx`)

| Causa | v1 | v2 |
|---|---|---|
| Clip rallentate | `playbackRate` 0,5–0,72 | velocità reale; rallenty solo su un colpo scelto |
| Durata delle inquadrature | 8–14 s, una scheda ferma per frase | 1,5–3 s; nei passaggi forti stacchi sotto il secondo |
| Transizioni | dissolvenza di 10 frame su ogni stacco | stacchi netti; zoom di spinta sul passaggio campo → filare → pianta |
| Schede | appaiono e restano ferme | si muovono mentre la voce parla: segnali che entrano, coda che si riordina, contatori |
| Immagine | overlay scuro fino a 0,72, tutto verde cupo | overlay 0,25–0,4; il campo resta luminoso |
| Voce | una ripresa continua, nessuna pausa ≥ 0,6 s | frasi brevi; pause e silenzi messi in montaggio |
| Musica | volume 0,075, fondo piatto | volume circa 0,18, crescita fino al motore, stacco a vuoto su «Decidi tu», ripartenza |
| Sottotitoli | un paragrafo intero a schermo | blocchi di massimo 6 parole |
| Tesi | aspettativa contro esito, con il motore in mezzo | motore e singola pianta al centro; il confronto atteso/reale chiude il ciclo in una battuta |

## Struttura

Le frasi della voce sono in corsivo. Il testo a schermo è fra virgolette basse. «‖» indica una pausa in montaggio.

| # | Tempo | Passaggio | Immagine e movimento | Voce |
|---|---|---|---|---|
| 1 | 0–5 s | Segnali | Sequenza veloce, uno stacco per parola, sul battere della musica: cielo che si chiude, mano nella terra, goccia da un gocciolatore, foglia ravvicinata, operaio fra i filari. Su ogni stacco una parola in maiuscolo, monospazio: «METEO», «SUOLO», «ACQUA», «PIANTE», «OPERAZIONI». | *Meteo. Suolo. Acqua. Piante. Operazioni.* |
| 2 | 5–10 s | Il problema | Le cinque parole si moltiplicano in decine di etichette che riempiono lo schermo sopra un campo dall'alto. | *Ogni giorno il campo manda segnali. ‖ Troppi da tenere a mente.* |
| 3 | 10–22 s | Il motore | Le etichette volano verso il centro e si fondono in una coda di cinque azioni. La coda si riordina sotto gli occhi: una voce sale in cima, «Controllare stress idrico», e il punteggio conta fino a 82, la confidenza fino a 0,74. | *OrtoMio li mette insieme. Li incrocia. ‖ E ti dice che cosa viene prima.* |
| 4 | 22–29 s | Il perché | La prima azione si apre: «Perché viene prima», poi «Dati usati» con meteo, suolo e irrigazione, poi «Dati mancanti» con un dato in ambra. | *Con il perché. Con i dati che ha, e quelli che mancano.* |
| 5 | 29–41 s | Fino alla pianta | Tre stacchi netti con zoom di spinta. Campo dall'alto con la griglia «NORD 02» → un filare evidenziato, «FILARE 4» → una pianta ravvicinata con il suo codice, «PIANTA 047», e la sua scheda: ultimo intervento, stato, nota. | *Non solo nel campo. ‖ Nel filare. ‖ Fino alla singola pianta.* |
| 6 | 41–44 s | Decidi tu | La musica si ferma. Una mano tocca «Conferma» sul telefono. Silenzio di mezzo secondo prima della voce. | *Decidi tu.* |
| 7 | 44–51 s | Si interviene lì | La musica riparte. L'operaio va dritto alla pianta. Il compito diventa «✓ Fatto» e scorre nel registro: pianta, ora, acqua pianificata e misurata. | *La squadra interviene lì. ‖ E quello che fa resta scritto.* |
| 8 | 51–58 s | Il raccolto | Stacchi brevi su raccolti diversi: cassette, mani che raccolgono, prodotto in linea. Sopra, la scheda per filare: atteso contro reale, filari che si accendono uno dopo l'altro; il filare 4 resta in ambra. | *Al raccolto, l'atteso accanto al reale. ‖ Filare per filare. Pianta per pianta.* |
| 9 | 58–66 s | Chiusura | Il campo dall'alto, luminoso. Logo. «Il campo non ricomincia da zero.» Poi la CTA. | *Così la stagione dopo non riparte da zero. ‖ OrtoMio.* — «Prenota la prova guidata · ortomioapp.it» |

**Testo parlato:** circa 85 parole, a 125–135 parole al minuto più le pause: 50–55 s di voce, 60–66 s di video.

## Verifica dei claim

| Frase o immagine | Fonte | Esito |
|---|---|---|
| Coda di azioni con priorità e confidenza | `services/agronomicPriorityService.ts`, manuale cap. 34 (Director, beta) | claim V; beta raccontata come funzionante (D11) |
| «Con i dati che ha, e quelli che mancano» | Matrice claim: la confidenza scende quando mancano i segnali | claim V |
| Campo → filare → singola pianta con codice | `types/individualPlant.ts`, `/app/plants` (stable) | claim V |
| «Decidi tu» | `PRODUCT.md`, Product Principles | claim V |
| Acqua pianificata e misurata nel registro | `advancedIrrigationService.ts`, ledger operativo | claim V |
| Atteso contro reale per filare e per pianta | tracciabilità pianta per pianta con raccolto; piano corretto sui raccolti registrati | claim V |
| Nessun mese, nessuna coltura, nessuna percentuale | indicazioni dell'utente 28/10 | — |
| `SCENARIO DIMOSTRATIVO` per tutto il video | D11, nessun cliente reale | resta |

## Riprese

Si usano soprattutto clip già scaricate: `P1-19546340` (campo dall'alto), `P1-14749090` (mano sulla pianta), `P1-14086016` (operaio fra gli alberi), `P1-5766179` (terreno), `P1-14823494` e `P1-10576691` (raccolto), `1c-8566854-key` (telefono con schermo sostituibile), più vigneto e frutteto da `B5`/`B7` per variare le colture nel passaggio 1.

Da cercare su Pexels e Pixabay, 2–4 s ciascuna: goccia da un gocciolatore in primo piano; cielo che si chiude o nuvole veloci; foglia ravvicinata con luce laterale. Da guardare prima di sceglierle.

## Voce

Adriatico (`covxL85MSd0uUrktE45z`), `eleven_v4`, una sola ripresa del nuovo testo: `public/audio/adriatico/orchestratore-v2.mp3`. Tono più deciso della v1: frasi corte, attacchi netti. Le pause si fanno in montaggio.
