# M13 - Provider esterni

## Open-Meteo

Smoke reale eseguito il 24/07/2026 sull'endpoint forecast:

- risposta HTTP valida;
- timezone restituita `Europe/Rome`;
- un giorno presente;
- serie `temperature_2m_max` e `precipitation_sum` presenti.

Il codice dispone gia' di timeout/cache e persistenza meteo, ma SLA, rate e osservabilita' vanno misurati su staging.

## Provider avanzato

| Provider | Configurazione ambiente | Stato |
|---|---|---|
| Sentinel Hub | assente | non chiamato |
| ThingsBoard | assente | non chiamato |

Non e' stato scelto o attivato un provider avanzato. La selezione deve indicare owner, credenziali staging, budget, kill switch e dataset/device reale.

## Condizione di uscita

M13 resta parziale finche' Open-Meteo non ha contract test periodico e un solo provider avanzato non completa uno smoke osservabile con credenziali staging.
