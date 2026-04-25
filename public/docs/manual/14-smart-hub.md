# Smart Hub Integrato

[← Torna all'Indice](./README.md)

---

## Panoramica

Smart Hub raccoglie telemetria, dispositivi e primi comandi IoT. Il perimetro attuale è reale ma misto: l'ingestione sensori e alcune strutture dispositivo sono persistite, mentre controllo attuatori e automazioni restano da usare con prudenza.

---

## Stato modulo

**Stato attuale**: telemetria persistente con controllo limitato.

La parte consolidata oggi è:
- API sensori `/api/sensors/readings`
- validazione tipo sensore, range valore, qualità dato, calibrazione, batteria e segnale
- persistenza letture su tabella sensori tramite `sensorDataService`
- tabella `smart_devices` per dispositivi `Sensor`, `Valve` e `Hub`
- campi provider `manual`, `tuya`, `thingsboard`
- scope dispositivo verso zona, filare, pianta o albero
- log automazioni su `smart_device_automation_logs`
- route comando per valvole con provider manuale/ThingsBoard e controllo ownership

Non va presentato come già chiuso:
- device registry definitivo per ogni hardware
- provisioning automatico multi-provider
- controllo diretto Tuya dalla command route
- garanzia di esecuzione fisica del comando senza conferma telemetrica
- automazioni irrigue critiche non presidiate
- orchestrazione stabile di attuatori come prodotto safety-critical

---

## Telemetria sensori

Le letture sensori supportano dati come:
- umidità suolo e tensione
- temperatura aria, suolo, acqua e canopy
- umidità aria, dew point, VPD e leaf wetness
- pH, EC, salinità e qualità acqua
- portata, pressione linea e livello serbatoio
- vento, pioggia locale, radiazione solare e PAR

Ogni lettura può includere:
- `garden_id`
- `zone_id`
- `irrigation_zone_id`
- `sensor_id`
- provider
- flag simulazione
- qualità dato
- stato calibrazione
- batteria
- segnale

Questo è il livello più affidabile del dominio Smart Hub.

---

## Dispositivi e scope

`smart_devices` permette di descrivere sensori, valvole e hub collegandoli a un giardino e, quando disponibile, a:
- zona
- filare
- albero
- pianta

Sono presenti campi per stato online, ultimo comando, ultimo stato valvola confermato, portata reale, pressione linea, auto mode e soglie.

Questi campi rendono possibile costruire un registro dispositivi, ma non equivalgono ancora a un onboarding hardware completo e validato per ogni provider.

---

## Comandi attuatori

La route `/api/iot/devices/command` accetta un comando valvola booleano per un device esistente e verifica che il giardino appartenga all'utente.

Comportamento attuale:
- in locale senza Supabase il comando è simulato
- provider `thingsboard`: invia attributi a ThingsBoard e attende conferma tramite telemetria
- provider `manual`: registra una risposta locale/manuale
- provider `tuya`: ritorna `501`, dispatch diretto non implementato

Quindi il comando è supporto operativo limitato, non una garanzia di attuazione fisica.

---

## Automazioni

`smart_device_automation_logs` registra eventi come:
- decisione
- comando inviato
- risultato comando
- telemetria
- outcome

I log possono contenere fonte, trigger, decisione, confidenza, stato comando, litri target/sessione, umidità, variazione irrigua, portata, pressione e outcome.

Questo consente analytics e audit interno delle automazioni. Non significa che esista già un motore autonomo stabile da lasciare eseguire irrigazioni critiche senza supervisione.

---

## Uso consigliato

Usa Smart Hub per:
- raccogliere letture sensori
- verificare qualità e freschezza della telemetria
- associare sensori e valvole a zone o filari
- inviare comandi limitati dove il provider è supportato
- analizzare eventi e outcome delle automazioni già registrate

Non usarlo come:
- console unica di automazione critica
- garanzia di apertura/chiusura fisica valvole
- device-management universale
- integrazione completa Tuya/ThingsBoard/multi-provider
- sostituto di controlli in campo per irrigazioni ad alto rischio

---

## Backlog tracciato

Da trattare come sviluppo futuro:
- provisioning dispositivi completo
- dispatch provider diretto e conferma bidirezionale per più vendor
- safety guardrails per automazioni irrigue
- riconciliazione comando → telemetria → outcome → log irriguo
- UI di gestione dispositivi coerente con `smart_devices`
- regole automatiche stabili e testate per produzione

---

[← Torna all'Indice](./README.md)
