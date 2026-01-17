# Guida Setup Tuya IoT Integration - OrtoMio

## 📋 Stato Attuale

✅ **Completato**:
- Credenziali Tuya Cloud configurate in `.env.local`
- Script per recuperare Device ID pronto
- Pagina Smart Hub semplificata creata
- Spec completa dell'integrazione disponibile

⏳ **Da Completare**:
- Ottenere Device ID del tuo water timer
- Testare connessione con dispositivo reale
- Implementare integrazione completa secondo spec

---

## 🔑 Credenziali Configurate

Le tue credenziali Tuya Cloud sono già configurate in `.env.local`:

```bash
TUYA_CLIENT_ID=a4syyyy7y3p5dnjfcpee
TUYA_CLIENT_SECRET=3b04319928f942a68cf3fbab4cc94dc0
TUYA_REGION=eu
TUYA_PROJECT_CODE=p1768555490796nn5su9
```

---

## 📱 Step 1: Ottenere il Device ID

Hai **2 opzioni** per ottenere il Device ID del tuo Tuya RF:433 Wireless Water Timer:

### Opzione A: Usa lo Script Automatico (CONSIGLIATO)

1. **Esegui lo script**:
   ```bash
   node scripts/get-tuya-devices.js
   ```

2. **Lo script farà**:
   - Autenticazione con Tuya Cloud usando le tue credenziali
   - Recupero lista di tutti i dispositivi collegati al tuo account
   - Visualizzazione dettagli di ogni dispositivo (nome, ID, stato)

3. **Output atteso**:
   ```
   🔐 Autenticazione con Tuya Cloud...
   ✅ Autenticazione riuscita!
   
   📱 Recupero lista dispositivi...
   ✅ Trovati 1 dispositivo/i:
   
   ═══════════════════════════════════════════════════════════
   
   📱 Dispositivo 1:
      Nome: Water Timer RF:433
      Device ID: bf1234567890abcdef
      Categoria: kg
      Product ID: keyjqtuyaq0t
      Online: ✅ Sì
      Status:
         - switch: true
         - battery_percentage: 85
   
   ═══════════════════════════════════════════════════════════
   
   💾 Copia il Device ID del tuo water timer e usalo nell'app OrtoMio!
   ```

4. **Copia il Device ID** mostrato nell'output

### Opzione B: Trova il Device ID nell'App Tuya Smart

1. Apri l'app **Tuya Smart** sul tuo smartphone
2. Seleziona il tuo **Water Timer RF:433**
3. Vai su **Impostazioni** (icona ingranaggio)
4. Cerca **"Device Information"** o **"Informazioni Dispositivo"**
5. Copia il **Device ID** (stringa alfanumerica tipo `bf1234567890abcdef`)

---

## 🔧 Step 2: Configurare il Device ID

Una volta ottenuto il Device ID:

1. **Apri il file `.env.local`**

2. **Trova la riga**:
   ```bash
   # TUYA_DEVICE_ID=your_device_id_here
   ```

3. **Sostituisci con il tuo Device ID**:
   ```bash
   TUYA_DEVICE_ID=bf1234567890abcdef
   ```
   (usa il Device ID reale che hai ottenuto)

4. **Salva il file**

---

## 🚀 Step 3: Testare la Connessione

### Avvia l'App Locale

Se non è già avviata:

```bash
npm run dev
```

L'app sarà disponibile su: **http://localhost:3002**

### Accedi alla Pagina Smart Hub

Vai su: **http://localhost:3002/app/smart-simple**

Dovresti vedere:
- Form per inserire credenziali Tuya (già precompilate)
- Bottone "Connetti a Tuya Cloud"
- Una volta connesso: stato del dispositivo in tempo reale

---

## 📊 Cosa Aspettarsi

### Versione Attuale (Semplificata)

La pagina `/app/smart-simple` è una **versione semplificata** per testare la connessione:

✅ **Funzionalità Disponibili**:
- Form configurazione credenziali Tuya
- Test connessione a Tuya Cloud
- Visualizzazione stato dispositivo (simulato)
- UI pulita senza dipendenze da librerie UI complesse

⚠️ **Limitazioni Attuali**:
- Dati ancora simulati (non connessione reale)
- Nessun controllo reale del dispositivo
- Nessun salvataggio dati storici

### Versione Completa (Da Implementare)

Secondo la spec in `.kiro/specs/tuya-iot-integration/`, l'integrazione completa includerà:

🎯 **Funzionalità Complete**:
- ✅ Connessione reale a Tuya Cloud API
- ✅ Acquisizione dati real-time dal sensore (< 5 secondi latenza)
- ✅ Controllo remoto valvola (apri/chiudi)
- ✅ Salvataggio dati storici su Supabase
- ✅ Grafici storici (24h, 7d, 30d, 1 anno)
- ✅ Sistema alert con soglie configurabili
- ✅ Export dati (CSV, JSON)
- ✅ Supporto multi-sensore (fino a 10 dispositivi)
- ✅ Modalità dual (reale + simulazione)
- ✅ Gestione errori e resilienza

---

## 🛠️ Prossimi Passi Implementazione

Una volta ottenuto il Device ID e testata la connessione, seguiremo il piano in `.kiro/specs/tuya-iot-integration/tasks.md`:

### Fase 1: Setup Infrastruttura (Task 1-3)
- Creare tabelle Supabase per credenziali e dati storici
- Implementare `TuyaCloudAPIClient` per comunicare con Tuya API
- Testare autenticazione e recupero dispositivi

### Fase 2: Servizi Core (Task 4-7)
- Implementare criptazione credenziali
- Creare `TuyaIntegrationService` per orchestrazione
- Implementare mappatura dati Tuya → SmartDevice
- Implementare storage dati storici

### Fase 3: Integrazione UI (Task 8-12)
- Estendere tipo `SmartDevice` per supportare Tuya
- Creare API routes Next.js
- Integrare dati reali in `IntegratedSmartHub`
- Implementare auto-sync in background

### Fase 4: Funzionalità Avanzate (Task 13-17)
- Dashboard grafici storici
- Sistema alert e notifiche
- Export dati
- Gestione multi-sensore

### Fase 5: Testing e Deploy (Task 18-22)
- Testing con sensore reale per 24 ore
- Gestione errori avanzata
- Logging e monitoring
- Documentazione e deployment

---

## 📚 Documentazione Tecnica

### File Chiave

1. **Spec Completa**:
   - `.kiro/specs/tuya-iot-integration/requirements.md` - 15 requirements dettagliati
   - `.kiro/specs/tuya-iot-integration/design.md` - Architettura e design tecnico
   - `.kiro/specs/tuya-iot-integration/tasks.md` - Piano implementazione (22 task)

2. **Codice Attuale**:
   - `app/app/smart-simple/page.tsx` - Pagina Smart Hub semplificata
   - `scripts/get-tuya-devices.js` - Script per recuperare Device ID
   - `components/smart/IntegratedSmartHub.tsx` - Smart Hub completo (esistente)

3. **Configurazione**:
   - `.env.local` - Credenziali Tuya e altre API keys

### API Tuya Cloud

Endpoint che useremo:

```
POST /v1.0/token
  → Autenticazione e ottenimento access token

GET /v1.0/users/{uid}/devices
  → Lista dispositivi utente

GET /v1.0/devices/{device_id}/status
  → Status corrente dispositivo (real-time)

POST /v1.0/devices/{device_id}/commands
  → Inviare comandi al dispositivo (apri/chiudi valvola)
```

### Parametri Water Timer

Il tuo Tuya RF:433 Wireless Water Timer dovrebbe esporre questi parametri:

| Codice Tuya | Descrizione | Tipo |
|-------------|-------------|------|
| `switch` | Stato valvola (on/off) | Boolean |
| `battery_percentage` | Livello batteria (%) | Integer 0-100 |
| `countdown` | Timer conto alla rovescia (secondi) | Integer |
| `work_state` | Stato operativo | String |

---

## 🐛 Troubleshooting

### Problema: Script non trova dispositivi

**Possibili cause**:
1. Dispositivo non collegato all'account Tuya
2. Progetto Cloud non autorizzato ad accedere ai dispositivi

**Soluzione**:
1. Vai su https://iot.tuya.com
2. Seleziona il tuo progetto
3. Vai su **"Link Devices"**
4. Collega il tuo account Tuya Smart al progetto Cloud

### Problema: Errore "Invalid signature"

**Causa**: Credenziali errate o scadute

**Soluzione**:
1. Verifica Client ID e Client Secret su https://iot.tuya.com
2. Assicurati di aver selezionato il progetto corretto
3. Rigenera le credenziali se necessario

### Problema: Dispositivo offline

**Causa**: Water timer non connesso alla rete

**Soluzione**:
1. Verifica che il dispositivo sia acceso
2. Controlla connessione WiFi/RF del dispositivo
3. Riavvia il dispositivo se necessario

---

## 📞 Supporto

Se incontri problemi:

1. **Controlla i log**: Lo script mostra errori dettagliati
2. **Verifica credenziali**: Assicurati che siano corrette in `.env.local`
3. **Testa connessione**: Usa l'app Tuya Smart per verificare che il dispositivo sia online
4. **Chiedi aiuto**: Fornisci l'output completo dello script per debugging

---

## ✅ Checklist

Prima di procedere con l'implementazione completa:

- [ ] Ho eseguito `node scripts/get-tuya-devices.js`
- [ ] Ho ottenuto il Device ID del mio water timer
- [ ] Ho aggiunto il Device ID in `.env.local`
- [ ] Ho testato la pagina `/app/smart-simple`
- [ ] Il dispositivo risulta online nell'app Tuya Smart
- [ ] Sono pronto per l'implementazione completa

---

**Prossimo Step**: Una volta completata questa checklist, possiamo iniziare l'implementazione completa seguendo il piano in `tasks.md`! 🚀
