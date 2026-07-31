# Nutrizione e trattamenti

[← Indice](./README.md)

**Stato:** beta.

Piani, prodotti, registri e inventario sono persistiti. La scorta cambia solo dopo un'applicazione confermata. Per i trattamenti il registro conserva prodotto, dose, unità, garden, operatore, data e intervallo di sicurezza quando disponibili.

Calcolo dosi avanzato, compatibilità prodotti e certificazione automatica restano disattivati o fuori perimetro. Verifica etichetta, autorizzazioni, tempi di carenza e normativa con un professionista prima di intervenire.

Dal 30/07/2026 la pagina mostra un selettore di orto quando ne hai più di uno configurato: prima il selettore mancava e la nutrizione era raggiungibile solo per il primo orto della lista, indipendentemente dalla coltura.

Il completamento di un task di concimazione dalla dashboard suggerisce ora un prodotto scelto tra quelli realmente presenti nel tuo inventario (in base alla fase della pianta), invece di suggerire sempre un prodotto dal catalogo generico indipendentemente da cosa hai davvero in magazzino. Se nessun prodotto adatto è in scorta, il suggerimento resta quello generico.

L'analisi del suolo (macro/micro-nutrienti, pH, materia organica, texture) si compila ora da `/app/garden/zones`, per singola zona — prima il dato era consumato da più calcoli di nutrizione/irrigazione ma non esisteva alcun modo per inserirlo.
