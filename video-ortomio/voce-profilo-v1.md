# Voce OrtoMio — profilo e candidate (v1)

## Profilo

| Tratto | Cerchiamo | Evitiamo |
|---|---|---|
| Genere | Maschile | — (Marco è già RicettaZero, Chiara MealDesk: serve una voce distinta) |
| Età percepita | 40–55 anni | Giovane da social, anziano da documentario |
| Timbro | Caldo, pieno, medio-basso | Cupo da thriller, impostato da trailer |
| Energia | Calma, sicura | Urlata da spot, sussurrata da meditazione |
| Ritmo | Regolare, con le pause date dal montaggio | Corsa, pause teatrali |
| Registro | Concreto, da chi conosce il campo | Commerciale, seduttivo, ironico |
| Accento | Italiano standard | Regionale marcato (romanesco, siciliano) |

## Candidate (libreria ElevenLabs, 25/10)

| # | Nome | voice_id | Perché | Rischio |
|---|---|---|---|---|
| 1 | Adriatico — Warm Italian Voice | `covxL85MSd0uUrktE45z` | Caldo e pieno, adatto a spot moderni e narrazione istituzionale, buon controllo del ritmo | Può scivolare nel cinematografico |
| 2 | Luigi — Italiano naturale | `KUqzTMhYFYqnFWfMUjfX` | Caldo, rassicurante, naturale; età media | Forse troppo morbido per un B2B |
| 3 | Max — The Italian Storyteller | `UCeW7wElM5dxewmr4a8l` | Caldo, chiaro, tono affidabile e moderno, spot e documentari | Età non dichiarata, forse più giovane |
| 4 | Dimitri Grassi — PRO | `4J1q3WHQLvitp3s2bWyq` | Calmo e rassicurante, età media | Poca energia su una chiusura |
| 5 | Tommy — Deep, Authoritative, Commercial | `m89dRj4KHNccJf6fsDYV` | Presenza forte da spot | Voce «da pubblicità», ironia non voluta |

Escluse: accenti regionali (Valerio, Roberto, Fra 5, Domenico), voci da thriller o meditazione (Edgardo, Dade M, Achille Valerio), descrizioni insufficienti.

## Scelta

**25/10, utente: Adriatico** (`covxL85MSd0uUrktE45z`), modello `eleven_v4`.

## File di lavoro

- `public/audio/adriatico/take.mp3` — ripresa completa originale (60,96 s).
- `public/audio/adriatico/4a.mp3`, `4c.mp3` — frasi rigenerate perché gli elenchi suonavano come domande.
- `public/audio/adriatico/take-v2.mp3` — **ripresa da usare** (62,92 s): take originale con 4a e 4c sostituite, tagli a metà silenzio (4a: 22,09–31,08 s; 4c: 39,15–48,94 s dell'originale), 0,15 s di respiro attorno alle frasi innestate. Ogni pezzo verificato con whisper separatamente; sul file intero whisper perde «Anche non inter-» e «Dalla», ma l'audio è integro.

## Prova a 3 voci (consuma crediti)

Proposta del tavolo: **Adriatico, Max, Luigi**, modello `eleven_v4`, stessa frase:

> Ogni mattina, una coda di azioni motivate: cosa fare, perché, quanto costa aspettare. La decisione resta tua. OrtoMio. Decisioni agronomiche verificabili.

**Lanciata il 25/10** su richiesta dell'utente: flow ElevenLabs `0GlPh12jCI8TEG51Cpd4`, una ripresa per voce, 154 crediti ciascuna (462 in totale). Nodi: Adriatico `UQguTib8c86tldY7GFYH`, Max `aYSuPkjLLtcBLwAhpZPJ`, Luigi `QNef0CauNmlGaA7wedXi`.

La frase contiene il nome del prodotto (prova di pronuncia), un elenco con ritmo, una frase breve sul ruolo e la chiusura.
