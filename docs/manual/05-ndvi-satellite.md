# NDVI satellitare

[← Indice](./README.md)

**Stato:** beta; indisponibile senza provider Sentinel verificato.

La pipeline usa l'API Statistical di Sentinel Hub con autenticazione server-side. Salva provider, intervallo, geometria, copertura nuvolosa, algoritmo, qualità e payload di provenienza. Valori mancanti, geometrie non valide o qualità insufficiente producono errore o stato indisponibile: non esiste fallback casuale.

NDVI è un segnale di scouting e non una diagnosi. Prima dell'attivazione servono credenziali di staging, provider smoke, controllo costi e confronto con osservazioni di campo.
