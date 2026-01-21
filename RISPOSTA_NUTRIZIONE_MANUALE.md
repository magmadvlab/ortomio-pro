# 📝 Risposta: Come Funziona la Nutrizione Manuale

## Le Tue Domande

### ❓ "Come viene gestita la nutrizione quando non è IOT?"

**Risposta:** Il sistema registra **manualmente** tutti i dati attraverso un form completo. L'operatore inserisce:

1. **Prodotto utilizzato** (da inventario)
2. **Dosaggio applicato** (g/m², ml/L, ecc.)
3. **Metodo applicazione** (manuale, fertirrigazione, spray, ecc.)
4. **Data e ora** applicazione
5. **Condizioni meteo** (temperatura, umidità, vento)
6. **Condizioni terreno** (umidità, pH, temperatura)
7. **Durata** applicazione
8. **Operatore** che ha eseguito
9. **Note** e osservazioni
10. **Foto** prima/dopo (opzionali)

### ❓ "I dati si possono salvare?"

**Risposta:** ✅ **SÌ, TUTTI I DATI VENGONO SALVATI** nel database e sono:

- ✅ **Permanenti** - Storico completo
- ✅ **Tracciabili** - Per certificazioni
- ✅ **Consultabili** - Da dashboard, timeline, report
- ✅ **Esportabili** - Per audit e certificazioni
- ✅ **Analizzabili** - Grafici, trend, efficacia

### ❓ "Se ho un filare di pomodori e do nutrimento, come viene registrato?"

**Risposta:** Ecco il flusso completo:

```
1. VAI IN: Nutrizione → Nuovo Trattamento

2. SELEZIONA DOVE:
   ☑ Filare: Pomodori

3. SELEZIONA COSA:
   Tipo: Fertilizzazione
   Prodotto: Concime NPK 20-20-20
   Dosaggio: 50 g/m²

4. SELEZIONA COME:
   Metodo: Fertirrigazione
   Durata: 30 minuti
   Attrezzatura: Pompa irroratrice

5. QUANDO:
   Data: 21/01/2026
   Ora: 08:30

6. CONDIZIONI:
   Meteo: 22°C, 65% umidità, soleggiato
   Terreno: 45% umidità, pH 6.5

7. SALVA

✅ RISULTATO:
   • Trattamento salvato nel database
   • Collegato al filare Pomodori
   • Visibile in timeline filare
   • Incluso in report certificazioni
   • Stock prodotto aggiornato
```

### ❓ "Come vedo cosa, quando e in che condizioni è stato somministrato?"

**Risposta:** Hai **5 modi** per vedere i dati:

#### 1️⃣ **Timeline Filare** (Consigliato)
```
Filari → Pomodori → Timeline

Vedi:
  21 Gen 2026 08:30
  🌱 Fertilizzazione
  Concime NPK 20-20-20 • 50 g/m²
  Fertirrigazione • 30 min
  Meteo: ☀️ 22°C, 65% umidità
  Operatore: Mario Rossi
  Efficacia: 8/10
  [Foto Prima] [Foto Dopo]
```

#### 2️⃣ **Dashboard Nutrizione**
```
Nutrizione → Dashboard

Vedi:
  • Trattamenti Recenti (ultimi 5)
  • Statistiche (biologico %, efficacia, costi)
  • Alert (stock basso, efficacia ridotta)
```

#### 3️⃣ **Storico Trattamenti**
```
Nutrizione → Trattamenti → Storico

Filtri:
  • Per data
  • Per filare
  • Per tipo trattamento
  • Per prodotto
  • Solo biologici
```

#### 4️⃣ **Diario Operativo**
```
Diario → Operativo → 21 Gen 2026

Vedi tutte le operazioni del giorno:
  • Irrigazione
  • Nutrizione ✓
  • Trattamenti
  • Lavorazioni
```

#### 5️⃣ **Report Certificazioni**
```
Certificazioni → Report → Gennaio 2026

Vedi:
  • Tutti i trattamenti del periodo
  • Conformità biologica
  • Prodotti utilizzati
  • Dosaggi applicati
```

### ❓ "Se è manuale o fertirrigazione?"

**Risposta:** Il sistema **distingue automaticamente** e registra:

#### 🖐️ **Manuale**
```
Metodo: Manuale
Applicazione: Spray fogliare
Attrezzatura: Pompa a spalla
Durata: 45 minuti (cronometrata)
Volume: 20 litri
Operatore: Mario Rossi

Registrato:
  ✅ Dosaggio inserito manualmente
  ✅ Durata cronometrata
  ✅ Volume calcolato
  ✅ Operatore registrato
```

#### 💧 **Fertirrigazione**
```
Metodo: Fertirrigazione
Applicazione: Attraverso sistema irrigazione
Concentrazione: 50g/10L
Durata: 30 minuti (da sistema irrigazione)
Volume: 100 litri (da sistema irrigazione)
Operatore: Mario Rossi

Registrato:
  ✅ Dosaggio calcolato automaticamente
  ✅ Durata da log irrigazione
  ✅ Volume da log irrigazione
  ✅ Collegato a log irrigazione
  ✅ Area coperta da zona irrigua
```

**Differenza chiave:**
- **Manuale** = Tutti i dati inseriti manualmente
- **Fertirrigazione** = Durata e volume da sistema irrigazione, dosaggio calcolato automaticamente

---

## 📊 Esempio Pratico Completo

### Scenario: Fertilizzazione Filare Pomodori

**Cosa fai:**
```
1. Apri: Nutrizione → Nuovo Trattamento
2. Seleziona: Filare Pomodori
3. Scegli: Concime NPK 20-20-20
4. Imposta: 50 g/m² • Fertirrigazione
5. Inserisci: Data 21/01, Ora 08:30
6. Aggiungi: Meteo e condizioni terreno
7. Salva
```

**Cosa viene salvato:**
```
✅ Trattamento ID: abc123
✅ Filare: Pomodori (100 m²)
✅ Prodotto: Concime NPK 20-20-20
✅ Dosaggio: 50 g/m² (5 kg totali)
✅ Metodo: Fertirrigazione
✅ Data: 21/01/2026 08:30
✅ Durata: 30 minuti
✅ Volume acqua: 100 litri
✅ Concentrazione: 50g/10L
✅ Operatore: Mario Rossi
✅ Meteo: 22°C, 65% umidità, soleggiato
✅ Terreno: 45% umidità, pH 6.5
✅ Costo: €40.50
✅ Biologico: Sì
✅ Stock aggiornato: 10kg → 5kg
```

**Dove lo vedi:**
```
1. Timeline Filare Pomodori
   → Vedi trattamento con tutti i dettagli

2. Dashboard Nutrizione
   → Appare in "Trattamenti Recenti"

3. Diario Operativo 21/01
   → Appare tra le operazioni del giorno

4. Report Certificazioni
   → Incluso nel report mensile

5. Analytics Nutrizione
   → Contribuisce a statistiche e grafici
```

**7 giorni dopo - Follow-up:**
```
1. Apri: Timeline Filare Pomodori
2. Clicca: Trattamento 21/01
3. Aggiungi: Follow-up
4. Inserisci:
   • Osservazioni: "Crescita migliorata"
   • Efficacia: 8/10
   • Foto dopo
5. Salva

✅ Follow-up collegato al trattamento
✅ Efficacia registrata
✅ Foto documentazione completa
```

---

## 🎯 Riepilogo Veloce

### Cosa Registra il Sistema

| Dato | Manuale | Fertirrigazione | IOT |
|------|---------|-----------------|-----|
| **Prodotto** | ✅ Selezione | ✅ Selezione | ✅ Auto |
| **Dosaggio** | ✅ Inserito | ✅ Calcolato | ✅ Auto |
| **Durata** | ✅ Cronometrata | ✅ Da irrigazione | ✅ Auto |
| **Volume** | ✅ Calcolato | ✅ Da irrigazione | ✅ Auto |
| **Meteo** | ✅ Inserito | ✅ Inserito | ✅ Auto |
| **Terreno** | ✅ Inserito | ✅ Inserito | ✅ Auto |
| **Operatore** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Costi** | ✅ Calcolato | ✅ Calcolato | ✅ Auto |
| **Foto** | ✅ Opzionale | ✅ Opzionale | ✅ Opzionale |

### Dove Vedi i Dati

| Vista | Cosa Vedi | Filtri |
|-------|-----------|--------|
| **Timeline Filare** | Tutti i trattamenti del filare | Per data |
| **Dashboard** | Ultimi 5 trattamenti | - |
| **Storico** | Tutti i trattamenti | Data, tipo, filare, prodotto |
| **Diario** | Operazioni per giorno | Data |
| **Report** | Trattamenti per periodo | Data, certificazione |
| **Analytics** | Grafici e statistiche | Periodo, tipo |

### Tracciabilità

✅ **Ogni trattamento include:**
- Data e ora esatta
- Prodotto e dosaggio
- Metodo applicazione
- Operatore
- Condizioni meteo
- Condizioni terreno
- Durata
- Costi
- Efficacia
- Foto documentazione
- Note

✅ **Tutto salvato permanentemente**
✅ **Consultabile in qualsiasi momento**
✅ **Esportabile per certificazioni**
✅ **Analizzabile per ottimizzazioni**

---

## ✅ Conclusione

**Sì, il sistema registra TUTTO:**
- ✅ Quando è stato irrigato (data, ora, durata)
- ✅ Quale nutrimento è stato dato (prodotto, dosaggio)
- ✅ Quando sono stati fatti i lavori (data, operatore)
- ✅ Trattamenti e prodotti (cosa, quando, quanto)
- ✅ Lavorazioni e tipo (data, tipo, durata)
- ✅ Meteo del giorno (temperatura, umidità, vento)

**E puoi vedere tutto in:**
- Timeline filare
- Dashboard nutrizione
- Storico trattamenti
- Diario operativo
- Report certificazioni
- Analytics

**Sia per sistemi manuali che IOT!** 🌱

---

**Versione:** 1.0  
**Data:** 21 Gennaio 2026  
**Sistema:** OrtomIO Professional
