# Integrazioni: capire cosa è collegato

Alcune funzioni usano servizi esterni per dati, analisi o dispositivi. Prima di configurare un collegamento chiarisci quale funzione deve abilitare e chi ne gestisce accesso e costi.

## Dove andare

Le aree dedicate sono **Impostazioni → API Keys**, **Dati Satellitari** e **Smart Hub**. Gli amministratori possono avere una voce **Configurazione satellite** e lo stato dei provider in **Admin**.

## Controllo per l’utente

1. Identifica la funzione non disponibile: per esempio NDVI o una lettura del sensore.
2. Leggi il messaggio e controlla l’ora dell’ultimo dato.
3. Verifica con il responsabile che il servizio sia previsto per il tuo account.
4. Dopo la configurazione controlla una lettura reale sul terreno giusto.
5. Se manca, conserva il messaggio e segnala il problema; non modificare chiavi per tentativi.

## Configurazione per il responsabile

1. Usa credenziali del servizio corretto e del contesto previsto.
2. Compila il modulo dedicato senza condividere i segreti in chat o schermate.
3. Salva nel modulo e controlla il risultato.
4. Verifica poi il dato nella funzione finale: una configurazione presente non garantisce che l’intera integrazione funzioni.
5. Registra chi gestisce il collegamento e come intervenire in caso di indisponibilità.

## Limite del test satellite

Il controllo della connessione nella schermata satellitare può mostrare successo anche per alcune risposte di errore. Non usarlo come unica verifica: richiedi una prova con un dato reale e una provenienza riconoscibile. Il supporto deve verificare lo stato del servizio se la mappa resta assente.

## Quando intervenire

Dopo una rotazione delle credenziali, una modifica al provider o un’assenza prolungata di dati. Non sostituire un dato mancante con una simulazione per mantenere i grafici popolati.

## Limiti

Il manuale utente non è una documentazione delle API per sviluppatori. La presenza di opzioni nel menu non certifica tutte le integrazioni. Per nuove connessioni o automazioni coinvolgi il responsabile tecnico e quello operativo.
