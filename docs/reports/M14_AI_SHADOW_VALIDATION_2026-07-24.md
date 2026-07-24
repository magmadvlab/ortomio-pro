# M14 - AI e regole agronomiche in shadow

## Evidenza locale

- almeno sei scenari canonici eseguibili;
- azione principale, confidenza e direzione ROI deterministiche;
- input mancanti producono `insufficient_data`;
- dati simulati non aumentano la confidenza;
- alert salute deterministici e deduplicati;
- prediction outcome riproducibile;
- route autorizzate e generazione GET mock disabilitata.

Verifica del 24/07/2026: 9/9 test mirati verdi.

## Protocollo shadow

Per ogni caso reale registrare versione regole/modello, input e fonti, segnali mancanti, raccomandazione, confidenza, decisione umana, azione eseguita e outcome. Nessuna raccomandazione critica puo' auto-eseguire.

## Metriche richieste

- falsi positivi e falsi negativi per dominio;
- tasso accettazione e motivi rifiuto;
- copertura segnali autorevoli;
- calibrazione confidenza;
- outcome positivo/negativo/non misurabile;
- soglie di rollback per versione.

## Blocco

M14 resta parziale: manca un dataset reale approvato, un periodo shadow e la revisione firmata da un responsabile agronomico.
