# 🚀 QUICK START: Multi-Tenancy & API Keys

Guida rapida per utilizzare il sistema multi-tenancy e gestione API keys.

---

## 📍 ACCESSO

**Percorso**: Dashboard → Settings (⚙️) → Sezioni "API Keys" e "Organizzazione"

---

## 🔑 API KEYS - GUIDA RAPIDA

### **Perché Configurare API Keys?**

- ✅ Usa i tuoi account personali (OpenAI, Anthropic, etc.)
- ✅ Nessun limite di utilizzo imposto da OrtoMio
- ✅ Controllo completo su costi e utilizzo
- ✅ Chiavi criptate e sicure

### **Come Aggiungere una API Key**

1. **Vai a Settings → API Keys**
2. **Click "Aggiungi API Key"**
3. **Seleziona il servizio** (es: OpenAI)
4. **Inserisci i dati**:
   - Nome identificativo (es: "Account Personale OpenAI")
   - API Key (es: `sk-...`)
   - Configurazioni opzionali
5. **Testa la chiave** (click "Testa Chiave")
6. **Salva**

### **Servizi Supportati**

| Servizio | Descrizione | Dove Ottenere Key |
|----------|-------------|-------------------|
| 🤖 **OpenAI** | GPT-4, GPT-3.5, DALL-E | [platform.openai.com](https://platform.openai.com) |
| 🧠 **Anthropic** | Claude 3 Opus, Sonnet | [console.anthropic.com](https://console.anthropic.com) |
| 🔷 **Google AI** | Gemini Pro, Ultra | [makersuite.google.com](https://makersuite.google.com) |
| 🛰️ **Sentinel Hub** | Satellite, NDVI | [sentinel-hub.com](https://www.sentinel-hub.com) |
| 🌤️ **Weather API** | Meteo, Forecast | [weatherapi.com](https://www.weatherapi.com) |

### **Gestione Chiavi**

- **👁️ Visualizza**: Click icona occhio per vedere chiave completa
- **🧪 Testa**: Verifica validità chiave
- **✏️ Modifica**: Aggiorna nome o configurazioni
- **🔴 Disattiva**: Disabilita temporaneamente senza eliminare
- **🗑️ Elimina**: Rimuovi definitivamente

---

## 🏢 ORGANIZZAZIONI - GUIDA RAPIDA

### **Quando Usare le Organizzazioni?**

✅ **Aziende agricole** con più collaboratori  
✅ **Cooperative** con membri multipli  
✅ **Team** che lavorano su più campi  
✅ **Gestione permessi** granulare per utente  

### **Come Creare un'Organizzazione**

1. **Vai a Settings → Organizzazione**
2. **Click "Crea Organizzazione"**
3. **Compila i dati**:
   - Nome (es: "Azienda Agricola Rossi")
   - Tipo (Farm, Cooperative, Enterprise, Research)
   - Email, Telefono, P.IVA (opzionali)
4. **Salva**

✅ **Ruoli di sistema creati automaticamente**:
- Owner (tu)
- Administrator
- Agronomist
- Operator
- Viewer

### **Come Invitare Membri**

1. **Tab "Membri" → Click "Invita Membro"**
2. **Inserisci email** del collaboratore
3. **Seleziona ruolo**:
   - **Administrator**: Gestisce tutto tranne settings organizzazione
   - **Agronomist**: Gestisce trattamenti, nutrizione, consigli
   - **Operator**: Esegue task, registra operazioni
   - **Viewer**: Solo lettura
4. **Invia Invito**

📧 **Email inviata automaticamente** con link di accettazione (valido 7 giorni)

### **Come Assegnare Garden a Membri**

1. **Seleziona membro**
2. **Click "Assegna Garden"**
3. **Scegli garden** da assegnare
4. **Seleziona livello accesso**:
   - **Full**: Lettura, scrittura, eliminazione
   - **ReadWrite**: Lettura e scrittura
   - **ReadOnly**: Solo lettura
5. **Conferma**

---

## 🎯 SCENARI D'USO

### **Scenario 1: Piccola Azienda Agricola**

**Setup**:
- 1 Owner (proprietario)
- 1 Agronomist (consulente esterno)
- 2 Operators (dipendenti)

**Workflow**:
1. Owner crea organizzazione
2. Owner invita agronomo (ruolo: Agronomist)
3. Owner invita operatori (ruolo: Operator)
4. Owner assegna:
   - Campo Nord → Operatore 1 (ReadWrite)
   - Campo Sud → Operatore 2 (ReadWrite)
   - Tutti i campi → Agronomo (Read)

**Risultato**:
- Operatori lavorano sui loro campi
- Agronomo vede tutti i campi e prescrive trattamenti
- Owner monitora tutto

### **Scenario 2: Cooperativa Agricola**

**Setup**:
- 1 Owner (presidente cooperativa)
- 3 Administrators (membri consiglio)
- 10 Operators (soci)

**Workflow**:
1. Owner crea organizzazione tipo "Cooperative"
2. Owner invita membri consiglio (ruolo: Administrator)
3. Administrators invitano soci (ruolo: Operator)
4. Ogni socio assegnato ai propri campi

**Risultato**:
- Gestione distribuita
- Visibilità centralizzata
- Reporting aggregato

### **Scenario 3: Uso API Keys Personali**

**Setup**:
- Account OpenAI personale
- Account Sentinel Hub per NDVI

**Workflow**:
1. Vai a Settings → API Keys
2. Aggiungi OpenAI key (per AI suggestions)
3. Aggiungi Sentinel Hub credentials (per NDVI)
4. Testa entrambe le chiavi
5. Attiva

**Risultato**:
- AI suggestions usano il tuo account OpenAI
- NDVI usa il tuo account Sentinel Hub
- Nessun limite OrtoMio
- Controllo costi diretto

---

## 🔐 PERMESSI - GUIDA RAPIDA

### **Ruoli Predefiniti**

| Ruolo | Può Fare | Non Può Fare |
|-------|----------|--------------|
| **Owner** | Tutto | - |
| **Administrator** | Gestire risorse, membri | Modificare settings organizzazione |
| **Agronomist** | Trattamenti, nutrizione, consigli | Eliminare garden, gestire membri |
| **Operator** | Eseguire task, registrare operazioni | Creare garden, invitare membri |
| **Viewer** | Vedere dati assegnati | Modificare qualsiasi cosa |

### **Risorse Gestibili**

- 🌱 **Gardens**: Orti/Campi
- 🪴 **Plants**: Piante
- ✅ **Tasks**: Attività
- 🌾 **Harvests**: Raccolti
- 💊 **Treatments**: Trattamenti
- 💧 **Irrigation**: Irrigazione
- 🧪 **Nutrition**: Nutrizione
- 📊 **Analytics**: Statistiche
- 👨‍🌾 **Agronomist**: Consultazioni
- 🛰️ **NDVI**: Dati satellitari
- 📜 **Certifications**: Certificazioni

---

## 🆘 TROUBLESHOOTING

### **API Keys**

**Q: La chiave non passa il test**
- ✅ Verifica che la chiave sia corretta
- ✅ Controlla che l'account sia attivo
- ✅ Verifica credito disponibile (per servizi a pagamento)

**Q: Come nascondo la chiave?**
- ✅ Click icona occhio per mascherare/mostrare

**Q: Posso usare la stessa chiave su più dispositivi?**
- ✅ Sì, la chiave è associata al tuo account utente

### **Organizzazioni**

**Q: Come rimuovo un membro?**
- ✅ Tab Membri → Click icona cestino sul membro

**Q: Posso cambiare il ruolo di un membro?**
- ✅ Sì, click "Modifica" sul membro e seleziona nuovo ruolo

**Q: L'invito è scaduto**
- ✅ Invia nuovo invito dalla tab "Inviti"

**Q: Come elimino un'organizzazione?**
- ✅ Solo l'Owner può eliminare (button in Panoramica)

---

## 📞 SUPPORTO

**Problemi con API Keys**: apikeys@ortomio.com  
**Problemi con Organizzazioni**: organizations@ortomio.com  
**Supporto Generale**: support@ortomio.com  

---

## 🎓 RISORSE AGGIUNTIVE

- 📖 [Documentazione Completa](./MULTI_TENANCY_API_KEYS_COMPLETE.md)
- 👨‍🌾 [Sistema Agronomo](./docs/manual/11-agronomist-consultations.md)
- 🔐 [Sicurezza e Privacy](./docs/manual/security.md)

---

**Pronto per iniziare!** 🚀
