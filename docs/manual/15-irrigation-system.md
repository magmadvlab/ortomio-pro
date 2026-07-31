# Sistema di irrigazione

[← Indice](./README.md)

**Stato:** beta.

Il modulo gestisce impianti, zone, fabbisogni, piani e registrazioni. Volume pianificato e volume misurato sono campi distinti; pioggia e sensori reali possono correggere il fabbisogno. Un suggerimento non crea un'attività fittizia.

L'apertura di una valvola segue il lifecycle Smart Hub e richiede conferma. Scheduling automatico, analytics avanzati e automazione non presidiata restano disattivati finché staging e pilot non superano i gate.

Dal 30/07/2026 la pagina mostra un selettore di orto quando ne hai più di uno configurato: prima il selettore mancava e l'irrigazione era raggiungibile solo per il primo orto della lista, indipendentemente dalla coltura.

Il completamento di un task di irrigazione dalla dashboard apre ora il registro di log misurato (stessa form di questa pagina) invece di segnare il task fatto senza traccia dell'acqua effettivamente usata.
