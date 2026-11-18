# Smart Hub: sensori, valvole e stato dei comandi

Lo Smart Hub collega dispositivi e dati a un luogo preciso. Prima di usare un numero o un comando devi sapere quale dispositivo rappresenta, dove si trova e quando ha comunicato.

## Dove andare

Apri **Smart Hub** e scegli il terreno. La scheda IoT riguarda i dispositivi; la parte droni è un laboratorio simulato, descritto in [Drone](./02-drone-operations.md).

## Associare un dispositivo

1. Apri il comando di associazione e controlla **Associa Nuovo Dispositivo**.
2. Scegli **Provider** e **Tipo Dispositivo**.
3. Inserisci un nome riconoscibile e il **Device ID esterno** fornito dal sistema del dispositivo.
4. In **Scope agronomico** scegli zona, filare, albero o pianta: è il luogo a cui attribuire le misure.
5. Compila gli identificativi e i dettagli di sensore richiesti con dati reali.
6. Conferma solo dopo avere controllato il riepilogo.
7. Riapri la scheda e verifica l’arrivo di una lettura aggiornata dal luogo corretto.

La presenza di un provider nel menu non certifica che sia già configurato o validato. Un’associazione manuale non crea telemetria dal nulla.

## Leggere una misura

Controlla nome del sensore, posizione, valore, unità e ora dell’ultima lettura. Un dispositivo offline può continuare a mostrare l’ultimo valore ricevuto: non interpretarlo come misura attuale.

## Usare un comando

1. Verifica di essere sul dispositivo fisico corretto e che il responsabile abbia autorizzato l’operazione.
2. Controlla stato attuale, ultima comunicazione e l’eventuale comando già in attesa.
3. Invia una sola richiesta dal controllo previsto.
4. Leggi lo stato restituito. **In attesa** non significa eseguito.
5. Verifica la conferma e le misure; per un’operazione reale controlla anche l’esito sul posto.
6. Registra l’acqua o il lavoro effettivo nel modulo operativo quando necessario.

## Quando intervenire

Se manca una conferma, il sensore è vecchio o la posizione non coincide, chiarisci lo stato prima di inviare altri comandi. Dopo spostamento o sostituzione di un sensore aggiorna l’associazione prima di usarne i dati.

## Simulazioni e limiti

**Dispositivi demo** e risultati simulati non rappresentano apparati reali. Non usarli nei registri come prova dell’esecuzione. Il modulo è beta: automazioni, provider e conferme fisiche richiedono verifica operativa, anche se l’interfaccia consente una configurazione.
