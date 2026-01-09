# 🔄 Sincronizzazione tra Dispositivi

## Panoramica

OrtoMio sincronizza automaticamente i dati tra tutti i dispositivi quando usi un account Supabase (versione PRO/PLUS). I dati sono salvati nel database cloud e vengono sincronizzati in tempo reale.

## Come Funziona

### Architettura

```
Dispositivo 1 (PC)          Dispositivo 2 (Mobile)          Dispositivo 3 (Tablet)
     │                              │                              │
     │                              │                              │
     └──────────────┬───────────────┴──────────────┬──────────────┘
                    │                              │
                    ▼                              ▼
            Supabase Database (Cloud)
                    │
                    ├── gardens
                    ├── garden_tasks
                    ├── harvest_logs
                    ├── seed_inventory
                    └── ... (tutte le tabelle)
```

### Meccanismo di Sincronizzazione

1. **Salvataggio Automatico**
   - Quando crei/modifichi/elimini dati su un dispositivo, vengono salvati immediatamente nel database Supabase
   - Non serve salvare manualmente: tutto è automatico

2. **Caricamento Automatico**
   - Quando apri l'app su un altro dispositivo, i dati vengono caricati automaticamente dal database
   - I dati sono sempre aggiornati perché vengono letti direttamente dal cloud

3. **Sincronizzazione in Tempo Reale** (Futuro)
   - Supabase supporta real-time subscriptions
   - Quando implementato, le modifiche su un dispositivo appariranno istantaneamente su tutti gli altri dispositivi

## Requisiti per la Sincronizzazione

### ✅ Versione PRO/PLUS (Supabase)
- **Account Supabase**: Devi essere registrato e loggato
- **Connessione Internet**: Necessaria per sincronizzare i dati
- **Stesso Account**: Tutti i dispositivi devono usare lo stesso account email

### ❌ Versione FREE (LocalStorage)
- **Nessuna Sincronizzazione**: I dati sono salvati solo nel browser locale
- **Non Condivisi**: Ogni dispositivo ha i propri dati separati
- **Nessun Backup**: I dati possono essere persi se cancelli i dati del browser

## Cosa Viene Sincronizzato

### ✅ Dati Sincronizzati (PRO/PLUS)

- ✅ **Orti/Giardini** (`gardens`)
  - Nome, posizione, tipo di terreno, dimensioni
  - Configurazioni avanzate (idroponica, acquaponica, ecc.)

- ✅ **Task/Attività** (`garden_tasks`)
  - Task completati e da fare
  - Date, note, suggerimenti

- ✅ **Raccolti** (`harvest_logs`)
  - Storico di tutti i raccolti
  - Quantità, date, foto

- ✅ **Inventario Semi** (`seed_inventory`)
  - Buste semi disponibili
  - Quantità, date di scadenza

- ✅ **Aiuole** (`garden_beds`)
  - Configurazione delle aiuole
  - Storico delle piantagioni

- ✅ **Foto** (`photo_logs`)
  - Foto time-lapse e documentazione

- ✅ **Letture Idroponiche/Acquaponiche** (`hydroponic_readings`, `aquaponic_readings`)
  - Monitoraggio parametri avanzati

### ❌ Dati NON Sincronizzati

- ❌ **Preferenze Browser** (localStorage)
  - Impostazioni UI locali
  - Cache temporanea

- ❌ **Smart Devices** (se non ancora migrati)
  - Alcuni dispositivi IoT potrebbero essere ancora in localStorage

## Come Verificare la Sincronizzazione

### Test Manuale

1. **Dispositivo 1**:
   - Crea un nuovo orto o modifica un task
   - Attendi qualche secondo

2. **Dispositivo 2**:
   - Apri l'app (o ricarica la pagina)
   - Dovresti vedere le modifiche del Dispositivo 1

### Verifica Account

1. Vai su **Impostazioni** → **Account**
2. Verifica che l'email sia la stessa su tutti i dispositivi
3. Se l'email è diversa, i dati non verranno sincronizzati

## Risoluzione Problemi

### I dati non si sincronizzano

**Possibili cause:**

1. **Non sei loggato**
   - Verifica che ci sia l'icona utente in alto a destra
   - Se non c'è, fai login con lo stesso account

2. **Connessione Internet assente**
   - Verifica la connessione WiFi/dati
   - Prova a ricaricare la pagina

3. **Account diverso**
   - Assicurati di usare lo stesso account email su tutti i dispositivi
   - Verifica nelle Impostazioni → Account

4. **Cache del browser**
   - Prova a fare "Hard Refresh" (Ctrl+Shift+R o Cmd+Shift+R)
   - Oppure cancella la cache del browser

### Dati duplicati

**Causa**: Potresti aver creato gli stessi dati su dispositivi diversi prima di fare login.

**Soluzione**:
1. Identifica quali dati sono duplicati
2. Elimina manualmente i duplicati
3. I dati futuri verranno sincronizzati correttamente

### Perdita dati

**Causa**: Potresti aver eliminato dati su un dispositivo mentre eri offline.

**Soluzione**:
1. I dati eliminati vengono sincronizzati quando torni online
2. Se hai bisogno di recuperare dati, contatta il supporto

## Best Practices

1. **Sempre Online**: Per la migliore esperienza, mantieni la connessione Internet attiva
2. **Stesso Account**: Usa sempre lo stesso account email su tutti i dispositivi
3. **Attendi Sincronizzazione**: Dopo modifiche importanti, attendi qualche secondo prima di chiudere l'app
4. **Backup Periodici**: Anche se i dati sono nel cloud, fai backup periodici usando l'export CSV/PDF

## Domande Frequenti

### Q: Quanto tempo ci vuole per sincronizzare?
**R**: Generalmente pochi secondi. Se modifichi qualcosa su un dispositivo, gli altri dispositivi vedranno le modifiche al prossimo caricamento della pagina.

### Q: Posso usare l'app offline?
**R**: Sì, ma le modifiche verranno salvate solo localmente fino a quando non torni online. Quando torni online, i dati verranno sincronizzati automaticamente.

### Q: I dati sono sicuri nel cloud?
**R**: Sì, Supabase usa crittografia end-to-end e rispetta gli standard di sicurezza GDPR. Solo tu puoi vedere i tuoi dati.

### Q: Posso sincronizzare con più account?
**R**: No, ogni account ha i propri dati separati. Se vuoi condividere dati, devi usare lo stesso account su tutti i dispositivi.

### Q: Cosa succede se elimino l'account?
**R**: Tutti i dati verranno eliminati permanentemente. Assicurati di fare un backup prima di eliminare l'account.

## Supporto

Se hai problemi con la sincronizzazione:
1. Verifica la connessione Internet
2. Verifica di essere loggato con lo stesso account
3. Prova a ricaricare la pagina
4. Contatta il supporto se il problema persiste

