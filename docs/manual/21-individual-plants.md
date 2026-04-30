# Gestione Piante Individuali

[← Torna all'Indice](./README.md)

---

## Stato Modulo

**Stato attuale**: **storico operativo parziale, integrato nel ledger come segnale specializzato**

Le piante individuali sono una fonte reale di storico operativo quando i flussi applicativi registrano operazioni a livello pianta. Nella chiusura T2 queste operazioni non vengono forzate dentro la proiezione primaria `decisione/task -> operazione -> outcome`, perche hanno una semantica diversa: sono segnali specializzati di attivita su singola pianta.

Per questo vengono esposte attraverso `agronomic_operation_signal_projection`.

---

## Cosa E Supportato Oggi

- lettura di operazioni individuali da `individual_plant_operations`
- collegamento delle operazioni a pianta, giardino e data quando i record sorgente lo contengono
- esposizione delle operazioni pianta come eventi `signal` nel servizio `operationalLedgerService`
- visualizzazione nel registro attivita quando il provider DB restituisce eventi ledger
- convivenza con altri segnali specializzati come automazioni, qualita e prescription export

---

## Perche Non Sono Nel Ledger Primario

Il ledger primario deve rispondere alla domanda:

> cosa e stato deciso, cosa e stato fatto, dove, da quale fonte, e quale risultato e stato ottenuto?

Le operazioni su singola pianta possono essere parte di questa storia, ma spesso sono osservazioni o interventi puntuali senza un task/outcome completo. Per evitare di perdere significato o duplicare tabelle, T2 le mantiene in una proiezione companion.

---

## Limiti Attuali

- non ogni pianta ha necessariamente uno storico completo
- QR code per pianta, genealogia completa, ranking produttivo e programmi breeding non sono garantiti dal codice T2
- le analisi predittive per singola pianta dipendono da dati disponibili e da moduli fuori dalla chiusura T2
- la produzione al momento puo contenere poche righe reali nella proiezione specializzata

---

## Uso Consigliato

- registrare interventi su pianta quando il workflow lo permette
- mantenere note e riferimenti coerenti a pianta/filare/zona
- usare il registro attivita per leggere lo storico normalizzato
- non interpretare l'assenza di eventi come assenza assoluta di piante: puo indicare assenza di operazioni storiche registrate

---

## TODO Futuri

- chiarire quali flussi pianta devono produrre outcome misurabili
- decidere se alcuni eventi pianta debbano entrare anche nella proiezione primaria quando collegati a task e risultati
- definire una UX specifica per visualizzare segnali pianta quando la produzione contiene dati rappresentativi
- spostare eventuali promesse su QR, genealogia, breeding e ranking in roadmap finche non sono implementate end-to-end

---

[← Torna all'Indice](./README.md)
