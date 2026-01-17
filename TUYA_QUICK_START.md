# 🚀 Tuya IoT - Quick Start

## ⚡ Azione Immediata

### Step 1: Ottieni il Device ID

Esegui questo comando:

```bash
node scripts/get-tuya-devices.js
```

### Step 2: Copia il Device ID

Dall'output dello script, copia il **Device ID** del tuo water timer (es: `bf1234567890abcdef`)

### Step 3: Aggiorna .env.local

Apri `.env.local` e trova questa riga:

```bash
# TUYA_DEVICE_ID=your_device_id_here
```

Sostituisci con:

```bash
TUYA_DEVICE_ID=bf1234567890abcdef
```

(usa il tuo Device ID reale)

### Step 4: Testa la Pagina

L'app è già avviata su: **http://localhost:3002**

Vai su: **http://localhost:3002/app/smart-simple**

---

## 📚 Documentazione Completa

- **Setup Dettagliato**: `TUYA_IOT_SETUP_GUIDE.md`
- **Session Summary**: `PUSH_SUCCESS_JAN16_TUYA.md`
- **Spec Completa**: `.kiro/specs/tuya-iot-integration/`

---

## 🆘 Problemi?

### Script non trova dispositivi?

1. Vai su https://iot.tuya.com
2. Seleziona il tuo progetto
3. Vai su **"Link Devices"**
4. Collega il tuo account Tuya Smart

### Dispositivo offline?

1. Verifica che sia acceso
2. Controlla connessione WiFi/RF
3. Riavvia il dispositivo

---

## ✅ Checklist

- [ ] Eseguito `node scripts/get-tuya-devices.js`
- [ ] Ottenuto Device ID
- [ ] Aggiornato `.env.local`
- [ ] Testato pagina `/app/smart-simple`
- [ ] Dispositivo online

**Fatto?** Sei pronto per l'implementazione completa! 🎉
