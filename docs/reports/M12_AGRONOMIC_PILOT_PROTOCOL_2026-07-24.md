# M12 - Protocollo pilot agronomico

## Guardrail

- nessun comando fisico senza approvazione umana;
- garden, zona, coltura, prodotto e operatore reali;
- valori pianificati separati da valori misurati;
- fallimento provider visibile e nessun fallback simulato;
- outcome registrato dopo ogni intervento.

## Cicli richiesti

| Dominio | Input autorevole | Approvazione | Evidenza esecuzione | Outcome |
|---|---|---|---|---|
| irrigazione | portata misurata, area, deficit, meteo | responsabile | contatore/volume e ora | risposta suolo/pianta |
| nutrizione | analisi, catalogo, lotto e stock | responsabile | dose, unita', operatore | analisi o osservazione |
| trattamento | prodotto autorizzato, target, intervallo | responsabile abilitato | registro e condizioni | efficacia/fitotossicita' |
| salute | segnale reale e confidenza | responsabile | task o osservazione | conferma/falso positivo |

## Evidenze locali

I test lifecycle verificano unita' e range, retry/dead-letter, separazione volume pianificato/misurato, adattamento pioggia senza task fittizi e stock modificato solo dopo esecuzione confermata.

## Blocco

M12 richiede azienda pilota, attrezzatura, cataloghi e responsabili identificati. Nessun ciclo reale e' stato eseguito in questa sessione.
