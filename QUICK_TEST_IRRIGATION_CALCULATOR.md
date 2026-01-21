# 🚀 Test Rapido: Calcolo Automatico Volumi Irrigazione

**Tempo stimato:** 5-10 minuti  
**Prerequisiti:** App avviata in locale

---

## 📋 Checklist Pre-Test

- [ ] App avviata: `npm run dev`
- [ ] Browser aperto su `http://localhost:3000`
- [ ] Utente loggato
- [ ] Garden/Orto creato con filari

---

## 🧪 Test 1: Sistema a Goccia (2 minuti)

### Step 1: Apri Form Registrazione
1. Vai in **Irrigazione** → Dashboard
2. Clicca **"Registra Irrigazione"**

### Step 2: Seleziona Filari Campo Aperto
1. Seleziona radio **"Filari Campo Aperto"**
2. Seleziona almeno 1 filare dalla lista

### Step 3: Configura Sistema Goccia
1. Clicca **"Configura"** nel box blu "Calcolo Automatico"
2. Seleziona **"Goccia"** dal dropdown
3. Inserisci parametri:
   - Portata gocciolatore: `2` L/h
   - Numero gocciolatori: `20`
4. Inserisci volume target: `10` litri

### Step 4: Verifica Risultato
✅ **Risultato atteso:**
- Portata totale: 40 L/h
- Durata: 15 minuti
- Affidabilità: 🟢 Alta
- Note: "20 gocciolatori × 2 L/h"

### Step 5: Salva
1. Clicca **"Salva Irrigazione"**
2. Verifica che il log sia stato creato

---

## 🧪 Test 2: Sistema Sprinkler (2 minuti)

### Step 1: Apri Nuovo Form
1. Clicca **"Registra Irrigazione"** di nuovo

### Step 2: Configura Sistema Sprinkler
1. Seleziona **"Filari Campo Aperto"**
2. Seleziona filari
3. Clicca **"Configura"**
4. Seleziona **"Sprinkler"** dal dropdown
5. Inserisci parametri:
   - Portata ugello: `100` L/h
   - Numero ugelli: `4`
   - Efficienza: `75` %
6. Inserisci volume target: `50` litri

### Step 3: Verifica Risultato
✅ **Risultato atteso:**
- Portata effettiva: 300 L/h
- Durata: 10 minuti
- Affidabilità: 🟢 Alta
- Note: "4 ugelli × 100 L/h, Efficienza: 75%"

---

## 🧪 Test 3: Tubo con Portata Misurata (2 minuti)

### Step 1: Configura Sistema Tubo
1. Apri nuovo form
2. Seleziona **"Tubo/Manichetta"**
3. Inserisci parametri:
   - Portata misurata: `15` L/min
4. Inserisci volume target: `30` litri

### Step 2: Verifica Risultato
✅ **Risultato atteso:**
- Portata: 900 L/h
- Durata: 2 minuti
- Affidabilità: 🟢 Alta
- Note: "Portata misurata: 15 L/min"

---

## 🧪 Test 4: Tubo con Calcolo Teorico (2 minuti)

### Step 1: Configura Sistema Tubo (Teorico)
1. Apri nuovo form
2. Seleziona **"Tubo/Manichetta"**
3. Inserisci parametri:
   - Diametro tubo: `19` mm
   - Pressione: `3` bar
4. Inserisci volume target: `30` litri

### Step 2: Verifica Risultato
✅ **Risultato atteso:**
- Portata: ~14000-15000 L/h
- Durata: 1-2 minuti
- Affidabilità: 🟡 Media
- Note: "Diametro: 19mm, Pressione: 3 bar"

---

## 🧪 Test 5: Parametri Mancanti (1 minuto)

### Step 1: Configura Sistema Senza Parametri
1. Apri nuovo form
2. Seleziona **"Goccia"**
3. NON inserire parametri
4. Inserisci solo volume target: `10` litri

### Step 2: Verifica Risultato
✅ **Risultato atteso:**
- Portata: 20 L/h (stima generica)
- Durata: 30 minuti
- Affidabilità: 🟠 Bassa
- Note: "⚠️ Parametri incompleti"

---

## 🧪 Test 6: Calcolo in Tempo Reale (1 minuto)

### Step 1: Modifica Parametri
1. Apri form con sistema Goccia configurato
2. Modifica **Numero gocciolatori** da 20 a 40
3. Osserva il risultato

### Step 2: Verifica Aggiornamento
✅ **Risultato atteso:**
- Durata si aggiorna automaticamente da 15 a 8 minuti
- Nessun click necessario
- Calcolo istantaneo

---

## 🧪 Test 7: Pannello Espandibile (30 secondi)

### Step 1: Apri/Chiudi Pannello
1. Clicca **"Configura"** → Pannello si apre
2. Clicca **"Nascondi"** → Pannello si chiude
3. Clicca **"Configura"** → Pannello si riapre

### Step 2: Verifica
✅ **Risultato atteso:**
- Pannello si apre/chiude senza problemi
- Parametri rimangono salvati quando si riapre
- Nessun errore console

---

## 🧪 Test 8: Cambio Tipo Sistema (1 minuto)

### Step 1: Cambia Tipo Sistema
1. Apri form con Goccia configurato
2. Cambia a **"Sprinkler"**
3. Osserva i campi

### Step 2: Verifica
✅ **Risultato atteso:**
- Campi Goccia scompaiono
- Campi Sprinkler appaiono
- Calcolo si aggiorna automaticamente

---

## 📊 Riepilogo Test

### Checklist Completa
- [ ] Test 1: Sistema a Goccia - PASS
- [ ] Test 2: Sistema Sprinkler - PASS
- [ ] Test 3: Tubo Portata Misurata - PASS
- [ ] Test 4: Tubo Calcolo Teorico - PASS
- [ ] Test 5: Parametri Mancanti - PASS
- [ ] Test 6: Calcolo in Tempo Reale - PASS
- [ ] Test 7: Pannello Espandibile - PASS
- [ ] Test 8: Cambio Tipo Sistema - PASS

### Problemi Riscontrati
_Annotare qui eventuali problemi:_

```
1. 
2. 
3. 
```

---

## 🐛 Risoluzione Problemi Comuni

### Problema: "Pannello non si apre"
**Soluzione:**
- Verifica che hai selezionato "Filari Campo Aperto"
- Il pannello è disponibile solo per field rows, non per zone irrigue

### Problema: "Calcolo non si aggiorna"
**Soluzione:**
- Verifica che hai inserito almeno un parametro
- Controlla console browser per errori
- Ricarica la pagina

### Problema: "Affidabilità sempre Bassa"
**Soluzione:**
- Inserisci tutti i parametri richiesti per il tipo di sistema
- Per Goccia: portata + numero gocciolatori
- Per Sprinkler: portata + numero ugelli
- Per Tubo: portata misurata (preferibile)

### Problema: "Durata sembra errata"
**Soluzione:**
- Verifica i parametri inseriti
- Controlla le unità di misura (L/h vs L/min)
- Confronta con calcolo manuale

---

## 📸 Screenshot Consigliati

Durante il test, cattura screenshot di:
1. Pannello calcolatore aperto con parametri
2. Risultato calcolo con affidabilità Alta
3. Risultato calcolo con affidabilità Bassa
4. Form completo prima del salvataggio

---

## 📝 Feedback

Dopo i test, annota:

### Cosa Funziona Bene
```
1. 
2. 
3. 
```

### Cosa Migliorare
```
1. 
2. 
3. 
```

### Suggerimenti
```
1. 
2. 
3. 
```

---

## ✅ Conclusione Test

Se tutti i test sono passati:
- ✅ Sistema funzionante
- ✅ Pronto per uso in produzione
- ✅ Documentazione accurata

Se ci sono problemi:
- 🔧 Annotare problemi nella sezione apposita
- 🐛 Creare issue su GitHub
- 📞 Contattare supporto tecnico

---

**Tempo totale test:** ~10 minuti  
**Difficoltà:** Facile  
**Prerequisiti:** Nessuno (oltre ad app avviata)

---

**Buon test! 🚀**
