# Sistema Irrigazione

[← Torna all'Indice](./README.md)

---

## Panoramica

Il modulo irrigazione è un blocco operativo maturo per configurare impianti, stimare fabbisogni, calcolare durate e registrare interventi irrigui. La parte Smart Hub/attuatori è collegata ma non ancora una automazione autonoma completa.

---

## Stato modulo

**Stato attuale**: operativo per calcolo e registro; ibrido per automazione hardware.

La parte consolidata oggi è:
- sistemi irrigui persistiti
- zone irrigue persistite
- componenti irrigui e portate
- log irrigui persistiti
- calcolo litri → minuti in base alla portata
- supporto a filari, aiuole, zone e contesto meteo
- compatibilità con schemi legacy e advanced
- collegamento opzionale a `valve_id` e dispositivi Smart Hub

Non va presentato come già chiuso:
- apertura/chiusura valvole garantita in campo
- automazione irrigua non presidiata
- controllo universale di timer, elettrovalvole e provider cloud
- sincronizzazione certa tra comando valvola, telemetria, litri reali e log irriguo
- raccomandazioni sempre basate su sensori reali

---

## Cosa è disponibile ora

Il sistema può gestire:
- tipo impianto
- fonte acqua
- pressione
- zone irrigue
- metodo di irrigazione
- portata zona
- gocciolatori, ali gocciolanti e componenti
- pianificazione/durata suggerita
- irrigazioni registrate
- litri applicati
- umidità prima/dopo quando disponibile
- meteo e note operative

Il calcolo principale è pragmatico:

`litri necessari / portata oraria = durata suggerita`

Per ali gocciolanti può usare:
- portata totale
- portata per metro
- passo gocciolatori e portata per gocciolatore

---

## Registro irriguo

I log irrigui sono la chiusura operativa più affidabile del modulo.

Un log può contenere:
- zona
- giardino
- data e orario
- durata
- litri applicati
- metodo
- meteo
- umidità suolo prima/dopo
- temperatura
- note
- valvola collegata se presente
- stato completamento

Questi dati alimentano storico, confronto e altri riepiloghi operativi.

---

## Relazione con Smart Hub

L'irrigazione può usare dati e dispositivi Smart Hub, ma i due livelli vanno distinti.

Smart Hub può fornire:
- letture umidità e qualità dato
- sensori collegati a zone o filari
- valvole registrate come device
- stato ultimo comando
- log automazione e outcome

Il modulo irrigazione resta però il luogo in cui il lavoro va ricostruito come intervento agronomico registrato. Un comando valvola o un evento telemetry non sostituisce automaticamente un log irriguo completo se non esiste una riconciliazione esplicita.

---

## Automazione irrigua

Oggi l'automazione va letta come supporto controllato:
- una zona può riferirsi a una valvola
- la command route può inviare o simulare un comando limitato
- i log Smart Hub possono registrare decisioni, comandi, risultati e outcome
- ThingsBoard è supportato come invio attributi; Tuya diretto non è chiuso in questa route

Non è ancora un sistema autonomo da lasciare gestire irrigazioni critiche senza supervisione e senza controllo campo.

---

## Uso consigliato

Usa il modulo per:
- configurare impianti e zone
- stimare durate realistiche
- registrare irrigazioni effettive
- confrontare litri, durate e risposta coltura
- usare sensori come segnale aggiuntivo quando disponibili
- collegare valvole e Smart Hub solo dove il flusso è verificato

Non usarlo come:
- garanzia di attuazione fisica automatica
- controllo remoto universale
- sostituto di verifica idraulica e sopralluogo
- automazione safety-critical senza supervisione

---

## Limiti attuali

- alcuni tipi legacy e advanced convivono ancora
- non tutti i flussi sono orchestrati dalla stessa fonte dati
- i sensori reali non sono obbligatori per tutti i consigli
- il controllo attuatori dipende dal provider e dalla conferma telemetrica
- la riconciliazione comando → acqua erogata → log finale non è ancora sempre automatica

---

## Backlog tracciato

Da trattare come sviluppo futuro:
- unificazione definitiva dei tipi irrigazione legacy/advanced
- automazione valvole con conferma bidirezionale robusta
- regole automatiche con soglie, blocchi sicurezza e audit
- creazione automatica o assistita del log irriguo da telemetria confermata
- confronto sistematico tra acqua erogata, sensori, meteo, salute e resa
- UI unica per irrigazione + device + automazioni

---

[← Torna all'Indice](./README.md)
