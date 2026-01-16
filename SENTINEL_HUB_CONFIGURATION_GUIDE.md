# Guida Configurazione Sentinel Hub - 16 Gennaio 2026

## ✅ Stato Attuale

### Local Development (http://localhost:3002)
- ✅ Server avviato su porta 3002
- ✅ Credenziali caricate da `.env.local`
- ✅ Pronto per il test

### Vercel Production (Remote)
- ⚠️ Credenziali NON configurate
- 🔧 Richiede configurazione manuale

---

## 🧪 STEP 1: Test Locale (ADESSO)

### 1.1 Apri l'App Locale
```
http://localhost:3002
```

### 1.2 Vai al Dashboard
- Fai login con le tue credenziali
- Vai alla Dashboard principale

### 1.3 Trova il Widget Sentinel Hub Status
Cerca il widget che mostra:
- 🛰️ Icona satellite
- Stato connessione (verde/rosso)
- Pulsante "Ricontrolla"

### 1.4 Verifica lo Stato
**Se vedi "Connesso a Sentinel Hub" (verde):**
✅ Le credenziali funzionano localmente!

**Se vedi "Credenziali Non Configurate" (rosso):**
❌ Problema con il caricamento delle variabili d'ambiente

---

## 🚀 STEP 2: Configurazione Vercel (SE LOCALE FUNZIONA)

### 2.1 Accedi a Vercel Dashboard
```
https://vercel.com/dashboard
```

### 2.2 Seleziona il Progetto OrtoMio

### 2.3 Vai a Settings → Environment Variables

### 2.4 Aggiungi le Credenziali Sentinel Hub

**Variabile 1:**
```
Name: SH_CLIENT_ID
Value: sh-ee976-0f29-4dca-a2ec-2ea8d9845042
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variabile 2:**
```
Name: SH_CLIENT_SECRET
Value: 2Q19bh3GHbZ9ELQ5H5k7dc
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variabile 3 (opzionale):**
```
Name: ORTOMIO_WMS_CONFIG_ID
Value: a9646191-f172-4e6e-a965-670c4a222898
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variabile 4 (opzionale):**
```
Name: ORTOMIO_WMS_BASE_URL
Value: https://sh.dataspace.copernicus.eu/ogc/wms/a9646191-f172-4e6e-a965-670c4a222898
Environments: ✅ Production ✅ Preview ✅ Development
```

### 2.5 Salva e Redeploy

Dopo aver salvato le variabili:
1. Vai alla tab **Deployments**
2. Clicca sui tre puntini dell'ultimo deployment
3. Seleziona **"Redeploy"**
4. Attendi il completamento del deploy (~2-3 minuti)

---

## 🔍 STEP 3: Verifica su Vercel

### 3.1 Apri l'App su Vercel
```
https://tuodominio.vercel.app
```

### 3.2 Vai al Dashboard

### 3.3 Controlla il Widget Sentinel Hub Status

**Dovrebbe mostrare:**
- ✅ "Connesso a Sentinel Hub" (verde)
- ✅ "Dati satellitari reali disponibili"
- ✅ "Sentinel-2 ESA Attivo"

---

## 🛠️ Troubleshooting

### Problema: "Credenziali Non Configurate" su Locale

**Soluzione 1: Riavvia il Server**
```bash
# Ferma il server (Ctrl+C nella console dove gira)
# Poi riavvia:
npm run dev
```

**Soluzione 2: Verifica il File .env.local**
```bash
# Controlla che esista
ls -la .env.local

# Verifica il contenuto
cat .env.local | grep SH_CLIENT
```

**Soluzione 3: Ricrea le Variabili**
```bash
# Aggiungi manualmente al file .env.local
echo "" >> .env.local
echo "# Sentinel Hub Credentials" >> .env.local
echo "SH_CLIENT_ID=sh-ee976-0f29-4dca-a2ec-2ea8d9845042" >> .env.local
echo "SH_CLIENT_SECRET=2Q19bh3GHbZ9ELQ5H5k7dc" >> .env.local
```

### Problema: "Credenziali Non Configurate" su Vercel

**Causa Comune:** Le variabili d'ambiente non sono state salvate correttamente

**Soluzione:**
1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Verifica che le variabili siano presenti
3. Controlla che siano abilitate per **Production**
4. Fai un nuovo deploy (non basta salvare, serve redeploy!)

### Problema: Widget Non Appare

**Verifica che il componente sia incluso nel Dashboard:**
```typescript
// In components/shared/HomeDashboard.tsx o HomeDashboardSimple.tsx
import SentinelHubStatus from '@/components/ndvi/SentinelHubStatus';

// Nel render:
<SentinelHubStatus />
```

---

## 📊 Dettagli Tecnici

### API Endpoint
```
POST /api/ndvi/sentinel
```

### Request Body
```json
{
  "bbox": {
    "north": 42.0,
    "south": 41.9,
    "east": 12.6,
    "west": 12.5
  },
  "dateFrom": "2026-01-09",
  "dateTo": "2026-01-16",
  "cloudCoverage": 20
}
```

### Response (Success)
```json
{
  "success": true,
  "ndvi": 0.65,
  "date": "2026-01-16T...",
  "cloudCoverage": 8.5,
  "source": "sentinel-hub-connected",
  "bbox": {...},
  "resolution": "10m",
  "satellite": "Sentinel-2 L2A"
}
```

### Response (Error - Credenziali Mancanti)
```json
{
  "simulated": true,
  "ndvi": 0.6,
  "date": "2026-01-16T...",
  "cloudCoverage": 12.3,
  "source": "simulated"
}
```

---

## 🔒 Sicurezza

### ✅ Best Practices Implementate

1. **Server-Side Only:** Le credenziali sono usate solo nelle API routes (non esposte al browser)
2. **Environment Variables:** Salvate in `.env.local` (gitignored)
3. **Fallback Graceful:** Se le credenziali mancano, usa dati simulati (non blocca l'app)
4. **OAuth2:** Usa il flusso client_credentials (sicuro)

### ⚠️ NON Fare

- ❌ Non committare `.env.local` su Git
- ❌ Non usare `NEXT_PUBLIC_` per le credenziali (le espone al browser)
- ❌ Non hardcodare le credenziali nel codice
- ❌ Non condividere le credenziali pubblicamente

---

## 📝 Checklist Completa

### Locale
- [ ] Server avviato su http://localhost:3002
- [ ] File `.env.local` contiene `SH_CLIENT_ID` e `SH_CLIENT_SECRET`
- [ ] Dashboard aperto nel browser
- [ ] Widget Sentinel Hub Status visibile
- [ ] Stato mostra "Connesso" (verde)

### Vercel
- [ ] Variabili d'ambiente configurate su Vercel Dashboard
- [ ] Redeploy completato
- [ ] App aperta su Vercel
- [ ] Widget Sentinel Hub Status visibile
- [ ] Stato mostra "Connesso" (verde)

---

## 🎯 Prossimi Passi

Dopo aver verificato che Sentinel Hub funziona:

1. **Test NDVI Dashboard**
   - Vai a `/app/ndvi` o cerca "NDVI" nel menu
   - Verifica che le mappe satellitari si carichino

2. **Test Prescription Maps**
   - Vai a `/app/prescription-maps`
   - Verifica che i dati NDVI siano disponibili

3. **Test Analytics**
   - Controlla che i grafici NDVI mostrino dati reali

---

**Data:** 16 Gennaio 2026  
**Status:** 🧪 PRONTO PER TEST LOCALE  
**Autore:** Kiro AI Assistant
