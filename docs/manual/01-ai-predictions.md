# Predizioni AI

[← Indice](./README.md)

**Stato:** disattivato nella release candidate.

Il backend genera predizioni riproducibili per resa, rischio malattia e fabbisogno idrico solo da segnali persistiti e autorizzati. Ogni risultato conserva input hash, versione del modello o regola, orizzonte, confidenza e validità. Se i dati sono insufficienti restituisce `insufficient_data`, senza inventare una previsione.

L'attivazione generale richiede migrazione remota, raccolta outcome, calibrazione e pilot. La pagina non deve essere usata come diagnosi né come autorizzazione automatica a un intervento.
