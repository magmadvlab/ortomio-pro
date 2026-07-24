# M11 - Giornata operativa end-to-end

## Evidenze locali disponibili

- diario: scrittura, rilettura dopo ricreazione servizio e fail-closed senza cloud;
- operazioni piante: idempotency key al writer;
- task agronomici: creazione e completamento registrati nel decision ledger;
- outcome: feedback operatore sincronizzato prima dell'evidenza di coda;
- export: timezone canonica `Europe/Rome`;
- comandi fisici: retry limitato, timeout e dead letter.

## Transizioni task uniformi

- `garden_tasks.operational_status` esplicita `open`, `in_progress`, `completed` e `cancelled`;
- riapertura e annullamento richiedono un motivo sia nel client sia nella funzione database;
- `transition_garden_task` serializza la transizione con row lock, verifica il proprietario e limita le transizioni ammesse;
- ogni cambio produce un evento persistente con attore, stato precedente/successivo, motivo e chiave di idempotenza per utente;
- il replay della stessa richiesta e' innocuo, mentre il riuso discordante della chiave viene rifiutato;
- test locali: type-check verde e persistenza 29/29.

## Ricorrenze e cambio ora

- il calendario operativo usa esplicitamente `Europe/Rome`, senza dipendere dalla timezone del processo;
- ricorrenze giornaliere e settimanali conservano l'ora locale attraverso entrambi i cambi DST;
- le ricorrenze mensili mantengono il giorno originario e ripiegano sull'ultimo giorno valido del mese;
- intervalli non positivi e range invertiti falliscono senza produrre occorrenze;
- i task ricorrenti iniziati prima del range richiesto vengono inclusi, mentre l'istanza iniziale non viene duplicata;
- test locali aggiornati: type-check verde e persistenza 33/33.

## Riconciliazione debito core

- la dashboard consumer carica i task reali dell'orto e riattiva il widget ricette sui raccolti effettivi;
- gli alias creati dal wizard colture registrano l'utente autenticato;
- tre occorrenze `placeholder` di soli label/prop UI sono classificate esplicitamente come accettate;
- gli alert salute creano task persistenti collegati e non duplicabili dalla UI; il conteggio attenzione deriva dai task trattamento aperti;
- le voci M11 pianificate scendono da 58 a 50; nessuna voce release resta non classificata.

## Sequenza da certificare

1. Responsabile crea piano e task.
2. Operatore apre il task assegnato.
3. Esecuzione registra misura/evidenza e idempotency key.
4. Task passa a completato una sola volta.
5. Diario riceve evento e revisione.
6. Ledger decisionale collega decisione, task, esecuzione e outcome.
7. Riapertura o annullamento conserva audit e motivo.
8. Export finale riconcilia task, diario, trattamento e ledger.

## Gap

- giornata simulata con utenti e ruoli reali non eseguita;
- il decision ledger conserva ancora una migrazione da preference cache, residuo M09;
- migrazioni P3-P5 non applicate sullo schema candidato.

Le parti locali `O25-O26` sono completate. M11 resta parziale finche' la sequenza completa non viene eseguita e riconciliata su staging.
