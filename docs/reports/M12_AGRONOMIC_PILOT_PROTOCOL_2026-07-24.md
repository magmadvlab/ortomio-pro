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

Il runtime delle lavorazioni meccaniche converge sullo storage provider durevole; il vecchio CRUD con sequenze e statistiche simulate e' stato rimosso. Anche dashboard e report delle lavorazioni leggono ora i record canonici, senza macchinari o indicatori casuali precaricati. Nutrizione usa un solo percorso analytics canonico, esporta dati tracciabili e calcola il fabbisogno tramite il motore agronomico invece di produrre dosi arbitrarie. Il tracker trattamenti risolve le foto persistite; l'uso rapido apre il wizard sul prodotto scelto. Il widget zone irrigue legge impianti, zone e aiuole dal provider, normalizza il meteo e persiste le nuove zone senza `localStorage`. Compost e macerati sono fail-closed e persistenti, con RLS owner-scoped per i preparati. Registro trattamenti e raccolto rapido usano record canonici. Type-check, persistenza 58/58 e audit sono verdi; le voci sorgente M12 scendono da 29 a zero.

## Blocco

M12 richiede azienda pilota, attrezzatura, cataloghi e responsabili identificati. Nessun ciclo reale e' stato eseguito in questa sessione.
