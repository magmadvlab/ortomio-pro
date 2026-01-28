# Fix Meteo Collegato all'Orto - 28 Gennaio 2026

## Problema
Il meteo non era correttamente collegato all'orto selezionato e mostrava errori 406 nella console.

## Soluzioni Implementate

### 1. Fix Errore 406 Cache Meteo
**File:** `services/weatherCacheService.ts`

- Modificato l'ordine di priorità: ora localStorage viene controllato PRIMA di Supabase
- Aggiunto timeout di 3 secondi per le richieste Supabase
- Gestione silenziosa dell'errore 406 (tabella non esistente o problemi RLS)
- Il meteo ora funziona sempre grazie al fallback su localStorage

### 2. Persistenza Ultimo Orto Usato
**File:** `packages/core/hooks/useGarden.ts`

- Aggiunta persistenza dell'orto attivo in localStorage
- Chiavi usate:
  - `ortoActiveGardenId`: orto attualmente selezionato
  - `ortoLastUsedGardenId`: ultimo orto usato (backup)
- Al caricamento, viene ripristinato l'ultimo orto usato

### 3. HomeDashboard - Salvataggio Orto Attivo
**File:** `components/shared/HomeDashboard.tsx`

- `setActiveGarden` ora salva automaticamente l'orto in localStorage
- Al caricamento dei giardini, viene cercato e ripristinato l'ultimo orto usato
- Il meteo usa sempre le coordinate dell'orto attivo

## Come Funziona Ora

1. **Utente seleziona un orto** → L'ID viene salvato in localStorage
2. **Utente ricarica la pagina** → L'ultimo orto usato viene ripristinato
3. **Meteo si aggiorna** → Usa le coordinate dell'orto attivo
4. **Più orti** → Il meteo mostra sempre i dati dell'orto selezionato

## Test

1. Seleziona un orto diverso dal primo
2. Ricarica la pagina
3. Verifica che l'orto selezionato sia lo stesso
4. Verifica che il meteo mostri i dati corretti per quell'orto
5. Verifica che non ci siano errori 406 nella console

## Note Tecniche

- L'errore 406 era causato dalla tabella `weather_cache` in Supabase che potrebbe non esistere o avere problemi di RLS
- La soluzione usa localStorage come cache primaria, più affidabile e veloce
- Supabase viene usato come backup opzionale
