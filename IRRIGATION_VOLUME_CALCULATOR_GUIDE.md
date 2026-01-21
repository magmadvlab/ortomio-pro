# Guida: Calcolo Automatico Volumi Irrigazione

## 📊 Panoramica

Il sistema di irrigazione OrtomIO ora include un **calcolatore automatico** che stima volumi e durate per sistemi di irrigazione manuali basandosi sui parametri fisici dell'impianto.

## 🎯 Cosa Fa

Il calcolatore:
- **Calcola automaticamente la durata** necessaria per erogare un volume target
- **Stima la portata** del sistema basandosi su parametri tecnici
- **Fornisce affidabilità** della stima (alta/media/bassa)
- **Suggerisce parametri mancanti** per migliorare il calcolo

## 🔧 Sistemi Supportati

### 1. Sistema a Goccia (Drip)

**Parametri richiesti:**
- **Portata gocciolatore** (L/h): es. 2-4 L/h per gocciolatore standard
- **Numero gocciolatori** OPPURE **Passo gocciolatori** (cm) + lunghezza filare

**Formula:**
```
Portata totale = Portata gocciolatore × Numero gocciolatori
Durata (min) = (Volume target / Portata totale) × 60
```

**Esempio:**
- 20 gocciolatori da 2 L/h = 40 L/h totali
- Per erogare 10 litri: (10 / 40) × 60 = 15 minuti

**Valori tipici:**
- Gocciolatore standard: 2-4 L/h
- Gocciolatore autocompensante: 2-8 L/h
- Passo gocciolatori: 30-50 cm

---

### 2. Sistema Sprinkler

**Parametri richiesti:**
- **Portata ugello** (L/h): es. 50-200 L/h per ugello
- **Numero ugelli**
- **Efficienza** (%): default 75%

**Formula:**
```
Portata totale = Portata ugello × Numero ugelli × (Efficienza / 100)
Durata (min) = (Volume target / Portata effettiva) × 60
```

**Esempio:**
- 4 ugelli da 100 L/h con efficienza 75%
- Portata effettiva: 4 × 100 × 0.75 = 300 L/h
- Per erogare 50 litri: (50 / 300) × 60 = 10 minuti

**Valori tipici:**
- Sprinkler piccolo: 50-100 L/h
- Sprinkler medio: 100-200 L/h
- Sprinkler grande: 200-500 L/h
- Efficienza: 70-80%

---

### 3. Tubo/Manichetta (Hose)

**Parametri richiesti (in ordine di preferenza):**

**Opzione A - Portata misurata** (più affidabile):
- **Portata misurata** (L/min): misura con secchio e cronometro

**Opzione B - Calcolo teorico**:
- **Diametro tubo** (mm): es. 12mm (1/2"), 19mm (3/4")
- **Pressione** (bar): es. 2-4 bar

**Formula (Opzione A):**
```
Durata (min) = Volume target / Portata misurata
```

**Formula (Opzione B - Torricelli semplificato):**
```
Velocità (m/s) = √(2 × g × h) × 0.6
dove h = Pressione (bar) × 10 metri
Portata = Area tubo × Velocità
```

**Come misurare la portata:**
1. Prendi un secchio da 10 litri
2. Apri il rubinetto al massimo
3. Cronometra quanto tempo impiega a riempirsi
4. Calcola: Portata (L/min) = 10 / Tempo (min)

**Esempio:**
- Secchio 10L si riempie in 40 secondi = 0.67 minuti
- Portata = 10 / 0.67 = 15 L/min
- Per erogare 30 litri: 30 / 15 = 2 minuti

**Valori tipici:**
- Tubo 1/2" (12mm) a 3 bar: ~10-15 L/min
- Tubo 3/4" (19mm) a 3 bar: ~20-30 L/min
- Tubo 1" (25mm) a 3 bar: ~40-60 L/min

---

### 4. Irrigazione a Solco (Furrow)

**Parametri richiesti:**
- **Lunghezza solco** (m)
- **Larghezza solco** (cm)
- **Velocità infiltrazione** (mm/h): dipende dal tipo di terreno

**Formula:**
```
Area = Lunghezza × Larghezza
Volume necessario = Area × Profondità target (50mm)
Durata = Profondità / Velocità infiltrazione
```

**Esempio:**
- Solco 10m × 30cm con infiltrazione 20 mm/h
- Area = 10 × 0.3 = 3 m²
- Volume = 3 × 50mm = 150 litri
- Durata = 50 / 20 = 2.5 ore

**Valori tipici infiltrazione:**
- Terreno sabbioso: 20-30 mm/h
- Terreno medio: 10-20 mm/h
- Terreno argilloso: 5-10 mm/h

---

## 📱 Come Usare il Calcolatore

### Passo 1: Accedi al Form di Registrazione
1. Vai in **Irrigazione** → **Registra Irrigazione**
2. Seleziona **Filari Campo Aperto** (non zone irrigue)

### Passo 2: Configura il Sistema
1. Clicca su **"Configura"** nel box blu "Calcolo Automatico"
2. Seleziona il **tipo di sistema** (Goccia, Sprinkler, Tubo, Solco)
3. Inserisci i **parametri del tuo impianto**

### Passo 3: Verifica il Calcolo
Il sistema mostrerà:
- ✅ **Portata stimata** (L/h)
- ⏱️ **Durata necessaria** (minuti)
- 🎯 **Affidabilità** (Alta/Media/Bassa)
- 📝 **Note e suggerimenti**

### Passo 4: Registra l'Irrigazione
- Il volume e la durata calcolati vengono salvati automaticamente
- Puoi modificare manualmente se necessario

---

## 💡 Suggerimenti per Migliorare l'Accuratezza

### Per Sistema a Goccia:
1. **Conta i gocciolatori** sul filare
2. **Leggi la portata** sull'etichetta del gocciolatore (es. "2 L/h")
3. Se non trovi l'etichetta, misura riempiendo un bicchiere per 1 ora

### Per Sprinkler:
1. **Conta gli ugelli** attivi
2. **Leggi la portata** sull'ugello o nel manuale
3. Considera l'**efficienza**: con vento forte riduci al 70%

### Per Tubo:
1. **Misura sempre la portata reale** con secchio e cronometro
2. È il metodo più affidabile!
3. Se usi il calcolo teorico, misura il **diametro interno** del tubo

### Per Solco:
1. **Fai un test di infiltrazione**: versa acqua e misura quanto tempo impiega ad infiltrarsi
2. Considera il **tipo di terreno**: sabbioso = veloce, argilloso = lento

---

## 🎨 Interpretazione Affidabilità

### 🟢 Alta (High)
- Tutti i parametri necessari sono stati forniti
- Calcolo basato su misure dirette
- Stima accurata ±10%

### 🟡 Media (Medium)
- Alcuni parametri mancanti
- Calcolo basato su formule teoriche
- Stima accurata ±20%

### 🟠 Bassa (Low)
- Parametri insufficienti
- Stima generica basata su valori tipici
- Stima accurata ±30-50%

**Consiglio:** Con affidabilità bassa, configura i parametri mancanti per migliorare il calcolo!

---

## 📊 Esempi Pratici

### Esempio 1: Orto con Goccia
**Situazione:**
- Filare di pomodori lungo 10 metri
- Gocciolatori ogni 30 cm
- Portata gocciolatore: 2 L/h

**Calcolo:**
- Numero gocciolatori: 10m / 0.3m = 33 gocciolatori
- Portata totale: 33 × 2 = 66 L/h
- Per dare 20 litri: (20 / 66) × 60 = 18 minuti

### Esempio 2: Vigneto con Tubo
**Situazione:**
- Filare di viti lungo 50 metri
- Tubo 3/4" (19mm)
- Portata misurata: 25 L/min

**Calcolo:**
- Per dare 100 litri: 100 / 25 = 4 minuti

### Esempio 3: Frutteto con Sprinkler
**Situazione:**
- 6 alberi da frutto
- 2 sprinkler da 150 L/h ciascuno
- Efficienza 75% (poco vento)

**Calcolo:**
- Portata effettiva: 2 × 150 × 0.75 = 225 L/h
- Per dare 50 litri: (50 / 225) × 60 = 13 minuti

---

## 🔍 Risoluzione Problemi

### "Affidabilità Bassa"
**Causa:** Parametri insufficienti
**Soluzione:** 
- Misura la portata con secchio e cronometro
- Conta i gocciolatori/ugelli
- Leggi le specifiche tecniche dell'impianto

### "Durata Troppo Lunga/Corta"
**Causa:** Parametri errati o portata sovrastimata/sottostimata
**Soluzione:**
- Verifica i parametri inseriti
- Misura la portata reale
- Controlla che non ci siano perdite o ostruzioni

### "Calcolo Non Disponibile"
**Causa:** Nessun parametro configurato
**Soluzione:**
- Clicca su "Configura"
- Seleziona il tipo di sistema
- Inserisci almeno i parametri base

---

## 📈 Vantaggi del Calcolo Automatico

✅ **Precisione**: Calcoli basati su formule fisiche reali
✅ **Risparmio idrico**: Eroga esattamente l'acqua necessaria
✅ **Tracciabilità**: Registra parametri impianto per uso futuro
✅ **Ottimizzazione**: Identifica inefficienze nell'impianto
✅ **Certificazioni**: Dati precisi per certificazioni bio

---

## 🚀 Prossimi Passi

1. **Configura il tuo sistema** la prima volta
2. **Salva i parametri** per riutilizzarli
3. **Monitora i consumi** nel tempo
4. **Ottimizza** basandoti sui dati reali

---

## 📞 Supporto

Per domande o problemi:
- Consulta il **Manuale Utente** → Sezione Irrigazione
- Contatta il supporto tecnico
- Chiedi al tuo agronomo di fiducia

---

**Versione:** 1.0  
**Data:** 21 Gennaio 2026  
**Sistema:** OrtomIO Professional
