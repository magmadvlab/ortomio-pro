# Guida Integrazione Dati Satellitari - OrtoMio NDVI

## 🛰️ STATO ATTUALE

Dalle immagini fornite, vedo che hai già:
- ✅ **Account Copernicus attivo** (roberto.lalinga@gmail.com)
- ✅ **Configurazione "OrtoMio NDVI"** creata
- ✅ **Layer NDVI disponibili** (Vegetation Index - NDVI)
- ✅ **Sistema integrato** nel codice

## 🔧 CONFIGURAZIONE CREDENZIALI

### 1. Ottieni le Credenziali dall'Account Copernicus

Dal tuo account Copernicus che vedo nelle immagini:

1. **Configuration ID**: `a9646191-f172-4e6e-a965-670c4a222898`
2. **Client ID**: Visibile nelle impostazioni account
3. **Client Secret**: Generabile dalle impostazioni OAuth

### 2. Configura le Variabili d'Ambiente

Crea/aggiorna il file `.env.local`:

```bash
# Sentinel Hub / Copernicus Credentials
SH_CLIENT_ID=your_client_id_here
SH_CLIENT_SECRET=your_client_secret_here
SH_INSTANCE_ID=a9646191-f172-4e6e-a965-670c4a222898

# Alternative names (for compatibility)
SENTINEL_HUB_CLIENT_ID=your_client_id_here
SENTINEL_HUB_CLIENT_SECRET=your_client_secret_here
COPERNICUS_CLIENT_ID=your_client_id_here
COPERNICUS_CLIENT_SECRET=your_client_secret_here
```

### 3. Verifica Configurazione

Esegui il test di connessione:

```bash
# Avvia il server
npm run dev

# In un altro terminale, testa la connessione
node test-sentinel-hub-local.js
```

## 🎯 FUNZIONALITÀ DISPONIBILI

### Dashboard NDVI Completo
- **Analisi Real-time**: Dati Sentinel-2 ogni 5 giorni
- **Mappa Interattiva**: Visualizzazione NDVI con overlay
- **Trend Storico**: Analisi temporale vegetazione
- **Zone Analysis**: Analisi per aree specifiche
- **Stress Detection**: Rilevamento automatico problemi

### Integrazione con Sistema Salute Piante
- **Alert Automatici**: Basati su valori NDVI critici
- **Raccomandazioni AI**: Suggerimenti basati su dati satellitari
- **Task Creation**: Creazione automatica interventi
- **Monitoraggio Continuo**: Tracking salute vegetazione

## 📊 LAYER DISPONIBILI

Dal tuo account Copernicus:

1. **Agriculture** - Analisi agricole generali
2. **Atmospheric penetration** - Correzione atmosferica
3. **Bathymetric** - Analisi batimetriche
4. **Color Infrared (vegetation)** - Infrarosso per vegetazione
5. **False color (urban)** - Falsi colori urbani
6. **Geology** - Analisi geologiche
7. **Moisture Index** - Indice umidità
8. **Natural color (true color)** - Colori naturali
9. **SWIR** - Short Wave Infrared
10. **Vegetation Index - NDVI** - ⭐ **PRINCIPALE**

## 🚀 UTILIZZO PRATICO

### 1. Accesso Dashboard NDVI
```
/app/ndvi → Dashboard completa NDVI
```

### 2. Widget Dashboard Principale
Il widget NDVI è già integrato nella dashboard principale e mostra:
- Valore NDVI corrente
- Stato salute vegetazione
- Trend recente
- Alert automatici

### 3. Integrazione Planner
- Tab "Salute Piante" include dati satellitari
- Raccomandazioni basate su NDVI
- Task automatici per zone critiche

## 🔍 INTERPRETAZIONE VALORI NDVI

### Scala Valori
- **0.8 - 1.0**: Vegetazione eccellente (verde scuro)
- **0.6 - 0.8**: Vegetazione buona (verde)
- **0.4 - 0.6**: Vegetazione moderata (giallo-verde)
- **0.2 - 0.4**: Vegetazione scarsa (arancio)
- **0.0 - 0.2**: Vegetazione critica (rosso)
- **< 0.0**: Acqua/suolo nudo

### Alert Automatici
- **NDVI < 0.3**: Alert critico → Intervento urgente
- **NDVI < 0.5**: Alert alto → Monitoraggio intensivo
- **NDVI < 0.7**: Alert medio → Controllo regolare

## 🛠️ TROUBLESHOOTING

### Problema: "Credenziali Non Configurate"
**Soluzione**: Verifica che le variabili d'ambiente siano impostate correttamente

### Problema: "API Error 401"
**Soluzione**: Rigenera Client Secret dall'account Copernicus

### Problema: "No Data Available"
**Soluzione**: 
- Verifica copertura nuvolosa (max 20%)
- Controlla date richieste (Sentinel-2 ogni 5 giorni)
- Verifica coordinate garden

### Problema: Dati Simulati
**Soluzione**: Il sistema usa dati simulati realistici se l'API non è disponibile

## 📈 OTTIMIZZAZIONI AVANZATE

### 1. Cache Intelligente
```typescript
// Implementato: cache automatica per 6 ore
const cacheKey = `ndvi_${garden.id}_${date}`;
```

### 2. Fallback Graceful
```typescript
// Se API non disponibile → dati simulati realistici
// Se nuvole > 20% → immagine precedente
// Se errore → notifica + retry automatico
```

### 3. Multi-Source Support
- **Primario**: Sentinel-2 (10m, gratuito)
- **Backup**: Landsat-8 (30m, gratuito)
- **Premium**: EOSDA Land Viewer (commerciale)

## 🎨 PERSONALIZZAZIONI UI

### Colori NDVI
```css
/* Già implementato */
.ndvi-excellent { color: #16a34a; } /* Verde scuro */
.ndvi-good { color: #22c55e; }      /* Verde */
.ndvi-moderate { color: #eab308; }   /* Giallo */
.ndvi-poor { color: #f97316; }       /* Arancio */
.ndvi-critical { color: #ef4444; }   /* Rosso */
```

### Mappa Interattiva
- Zoom/Pan automatico su garden
- Overlay NDVI con opacità regolabile
- Controlli layer multipli
- Export immagini

## 📱 MOBILE OPTIMIZATION

Il sistema è già ottimizzato per mobile:
- Touch-friendly controls
- Responsive layout
- Swipe navigation
- Offline fallback

## 🔮 ROADMAP FUTURO

### Fase 1 (Attuale) ✅
- Integrazione Sentinel-2
- Dashboard NDVI
- Alert automatici

### Fase 2 (Prossima)
- Machine Learning predictions
- Crop-specific analysis
- Weather correlation

### Fase 3 (Avanzata)
- Drone integration
- IoT sensors fusion
- Prescription maps

## 📞 SUPPORTO

Per problemi con l'integrazione satellitare:

1. **Verifica Status**: `/app/ndvi` → Sentinel Hub Status
2. **Test API**: `node test-sentinel-hub-local.js`
3. **Log Debug**: Console browser → Network tab
4. **Documentazione**: [Sentinel Hub Docs](https://docs.sentinel-hub.com/)

---

## ✅ CHECKLIST ATTIVAZIONE

- [ ] Credenziali configurate in `.env.local`
- [ ] Server Next.js avviato (`npm run dev`)
- [ ] Test connessione superato
- [ ] Dashboard NDVI accessibile
- [ ] Widget dashboard funzionante
- [ ] Alert salute piante attivi

Una volta completata la checklist, il sistema satellitare sarà completamente operativo!