# 🌡️ Esempi Alert Greenhouse Director

## Scenario 1: Vento Forte Previsto

**Meteo:** Vento 65 km/h previsto domani

### Alert Urgente
```
⚠️ VENTO FORTE PREVISTO: 65 km/h
CHIUDI IMMEDIATAMENTE tutte le finestre e aperture della serra. 
Verifica ancoraggio copertura e rinforza se necessario.
```

### Task Creato
```
Nome: Chiusura serra per vento forte (65 km/h)
Tipo: Treatment
Priorità: High
Note: Chiudi finestre, porte e aperture. Verifica ancoraggio copertura. 
      Rinforza con pesi/corde se necessario. Controlla dopo la tempesta.
```

---

## Scenario 2: Neve in Arrivo

**Meteo:** Neve 8 mm prevista stanotte

### Alert Urgente
```
❄️ NEVE PREVISTA: 8 mm
Prepara attrezzi per rimozione neve dalla copertura. 
Accumulo eccessivo può causare crollo!
```

### Task Creato
```
Nome: Rimozione neve da copertura serra
Tipo: Treatment
Data: Domani
Priorità: High
Note: Rimuovi neve dalla copertura con scopa morbida o attrezzo apposito. 
      NON usare pale metalliche (rischio rottura). 
      Lavora dall'esterno in sicurezza.
```

---

## Scenario 3: Ondata di Calore

**Meteo:** Temperatura massima 38°C  
**Serra:** NON riscaldata → Interno ~43°C

### Alert Urgente
```
🌡️ CALDO ESTREMO: Temperatura esterna 38°C → interna ~43°C
APRI tutte le finestre. Considera ombreggiamento o teli ombreggianti.
```

### Task Creato
```
Nome: Ventilazione serra per caldo (38°C)
Tipo: Treatment
Priorità: High
Note: Apri tutte le finestre e porte. Applica teli ombreggianti o 
      bianco di Spagna su copertura se necessario. Aumenta irrigazioni.
```

---

## Scenario 4: Gelo Notturno

**Meteo:** Temperatura minima -3°C  
**Serra:** Riscaldata → Interno ~4°C (OK)  
**Serra:** NON riscaldata → Interno ~0°C (CRITICO)

### Alert Urgente (Serra NON Riscaldata)
```
❄️ GELO PREVISTO: Temperatura esterna -3°C → interna ~0°C
CHIUDI serra e aggiungi protezioni interne (teli, pacciamatura). 
Considera riscaldamento d'emergenza.
```

### Task Creato
```
Nome: Protezione serra da gelo (-3°C)
Tipo: Treatment
Priorità: High
Note: Chiudi serra completamente. Aggiungi teli termici interni. 
      Pacciama base piante. Considera riscaldamento d'emergenza 
      (candele, stufa).
```

### Alert Urgente (Serra Riscaldata)
```
❄️ GELO PREVISTO: Temperatura esterna -3°C → interna ~4°C
ATTIVA riscaldamento serra. Verifica che sia funzionante.
```

### Task Creato
```
Nome: Protezione serra da gelo (-3°C)
Tipo: Treatment
Priorità: High
Note: Attiva riscaldamento serra. Verifica funzionamento. 
      Chiudi tutte le aperture per trattenere calore.
```

---

## Scenario 5: Tempesta in Arrivo

**Meteo:** Pioggia 45 mm prevista

### Prompt Medio
```
🌧️ TEMPESTA PREVISTA - Verifica Serra
Pioggia intensa prevista: 45 mm. Verifica che tutte le aperture 
siano chiuse e che non ci siano infiltrazioni. Controlla drenaggio.
```

### Task Creato
```
Nome: Verifica chiusura serra per tempesta
Tipo: Treatment
Priorità: Medium
Note: Chiudi finestre e porte. Verifica che non ci siano infiltrazioni. 
      Controlla drenaggio esterno. Dopo la tempesta, ispeziona 
      copertura per danni.
```

---

## Scenario 6: Pulizia Periodica

**Ultimo lavaggio:** 95 giorni fa

### Prompt Periodico
```
🧹 PULIZIA COPERTURA SERRA
È passato 95 giorni dall'ultima pulizia. Pulisci la copertura per 
massimizzare la trasmissione della luce (fino a +30% luminosità). 
Rimuovi alghe, polvere e depositi.
```

### Task Creato
```
Nome: Pulizia copertura serra
Tipo: Treatment
Priorità: Medium
Note: Pulisci [vetri/pannelli policarbonato/telo polietilene] con 
      acqua e sapone neutro. Rimuovi alghe, polvere, depositi. 
      Lavora in sicurezza dall'esterno. Migliora trasmissione luce 
      fino a +30%.
```

---

## Scenario 7: Disinfezione Inizio Stagione

**Periodo:** Marzo  
**Anno:** 2026 (nessuna disinfezione ancora)

### Prompt Stagionale
```
🧪 DISINFEZIONE SERRA INIZIO STAGIONE
Disinfetta la serra prima di iniziare le nuove coltivazioni. 
Elimina patogeni, spore fungine e uova di parassiti rimasti 
dall'anno precedente. Previene malattie!
```

### Task Creato
```
Nome: Disinfezione serra inizio stagione
Tipo: Treatment
Priorità: High
Note: Svuota serra. Pulisci struttura, bancali, attrezzi. 
      Disinfetta con prodotti idonei (es. candeggina diluita 1:10, 
      perossido idrogeno). Arieggia bene prima di reintrodurre piante.
```

---

## Scenario 8: Controllo Ventilazione

**Serra:** Con ventilazione automatica  
**Ultimo controllo:** 35 giorni fa

### Prompt Periodico
```
💨 CONTROLLO SISTEMA VENTILAZIONE
Verifica che il sistema di ventilazione funzioni correttamente. 
Pulisci filtri, controlla motori e aperture automatiche.
```

### Task Creato
```
Nome: Controllo sistema ventilazione serra
Tipo: Treatment
Data: +7 giorni
Priorità: Low
Note: Verifica funzionamento ventilatori. Pulisci filtri e griglie. 
      Controlla aperture automatiche (se presenti). 
      Lubrifica meccanismi se necessario.
```

---

## Scenario 9: Controllo Riscaldamento Pre-Inverno

**Periodo:** Novembre  
**Serra:** Con riscaldamento  
**Nessun controllo quest'anno**

### Prompt Stagionale
```
🔥 CONTROLLO RISCALDAMENTO SERRA
Verifica il sistema di riscaldamento PRIMA dell'inverno. 
Controlla funzionamento, combustibile/energia, termostati. 
Evita emergenze con il gelo!
```

### Task Creato
```
Nome: Controllo sistema riscaldamento serra
Tipo: Treatment
Priorità: High
Note: Verifica funzionamento riscaldamento. Controlla combustibile/energia. 
      Testa termostati. Pulisci bruciatori/resistenze. 
      Verifica sicurezza (CO, perdite gas). Prepara per inverno!
```

---

## 📊 Riepilogo Priorità

### CRITICI (Blocca Operazioni)
- 🌪️ Vento forte >50 km/h
- ❄️ Gelo con temp interna <2°C

### ALTI (Azione Immediata)
- 🌡️ Caldo >35°C
- ❄️ Neve >5 mm
- 🧪 Disinfezione inizio stagione
- 🔥 Controllo riscaldamento pre-inverno

### MEDI
- 🌧️ Tempesta >30 mm
- 🧹 Pulizia copertura (90+ giorni)

### BASSI
- 💨 Controllo ventilazione (30+ giorni)
