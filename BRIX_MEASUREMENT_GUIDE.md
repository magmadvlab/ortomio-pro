# 💧 GUIDA MISURAZIONE GRADI BRIX

## 📊 COSA SONO I GRADI BRIX?

I **gradi Brix (°Bx)** misurano il contenuto di zuccheri solubili in un liquido, espressi come percentuale di saccarosio.

**Esempio:** 14°Bx = 14g di zucchero per 100g di soluzione

**Perché sono importanti:**
- Indicano maturazione frutto
- Determinano dolcezza e qualità
- Guidano timing raccolta ottimale
- Influenzano prezzo di mercato

---

## 🔬 METODI DI MISURAZIONE

### 1. RIFRATTOMETRO MANUALE ⭐ RACCOMANDATO

**Precisione:** ±0.2°Bx (molto preciso)  
**Costo:** €20-50  
**Difficoltà:** Facile

#### Come Funziona
Il rifrattometro misura come la luce si piega (rifrange) attraverso il succo del frutto. Più zuccheri = più rifrazione.

#### Procedura
```
1. Raccogli campione frutto
2. Estrai goccia di succo (schiaccia o spremi)
3. Pulisci prisma rifrattometro con acqua distillata
4. Metti 1-2 gocce succo sul prisma
5. Chiudi coperchio
6. Guarda attraverso oculare verso luce
7. Leggi valore sulla scala (linea blu/bianco)
8. Pulisci prisma dopo uso
```

#### Modelli Consigliati
- **Economico:** Rifrattometro ottico 0-32°Bx (~€20)
- **Medio:** Rifrattometro digitale con ATC (~€40)
- **Pro:** Rifrattometro digitale Atago PAL-1 (~€200)

#### Pro
✅ Molto preciso (±0.2°Bx)  
✅ Economico  
✅ Affidabile  
✅ Facile da usare  
✅ Non richiede batterie (ottico)  
✅ Durevole

#### Contro
❌ Richiede estrazione succo (distruttivo)  
❌ Serve pulire tra misurazioni  
❌ Sensibile a temperatura (usa modelli con ATC)

---

### 2. SPETTROMETRO SMARTPHONE ⚠️ APPROSSIMATIVO

**Precisione:** ±1-2°Bx (approssimativo)  
**Costo:** €30-80  
**Difficoltà:** Media

#### Cos'è
Accessorio che si attacca allo smartphone e analizza lo spettro di luce che attraversa il frutto per stimare il contenuto di zuccheri.

#### Modello Esempio
**Thunder Optics - Spettrometro per Smartphone**
- Link: https://www.amazon.it/dp/B0CTHDPSXZ
- Prezzo: ~€50-80
- Include: Spettrometro + app companion
- Funziona con: iPhone e Android

#### Come Funziona
```
1. Attacca spettrometro a smartphone
2. Apri app companion
3. Calibra con riferimento bianco
4. Posiziona frutto tra sorgente luce e spettrometro
5. Scatta foto spettrale
6. App analizza spettro e stima Brix
7. Salva misurazione
```

#### Pro
✅ Non distruttivo (non serve tagliare frutto)  
✅ Veloce (30 secondi)  
✅ Può misurare su pianta  
✅ Interessante per trend  
✅ Tecnologia innovativa

#### Contro
❌ **Approssimativo** (±1-2°Bx errore)  
❌ Richiede calibrazione frequente  
❌ Sensibile a condizioni luce ambientale  
❌ Sensibile a spessore/colore buccia  
❌ Richiede app e batteria  
❌ Meno affidabile per decisioni critiche  
❌ Curva apprendimento

#### ⚠️ LIMITAZIONI IMPORTANTI

**Fattori che influenzano precisione:**
- **Luce ambientale:** Sole diretto = errori
- **Spessore buccia:** Buccia spessa = meno preciso
- **Colore frutto:** Frutti scuri = più difficile
- **Maturazione disomogenea:** Misura solo punto specifico
- **Calibrazione:** Serve calibrare spesso con riferimenti noti
- **Temperatura:** Influenza lettura

**Quando NON usare:**
- Decisioni commerciali critiche
- Certificazioni qualità
- Contratti con specifiche Brix
- Ricerca scientifica

**Quando va bene:**
- Monitoraggio trend personale
- Confronti relativi (stesso frutto nel tempo)
- Curiosità/educazione
- Screening rapido campo

---

### 3. STIMA MANUALE ❌ SCONSIGLIATO

**Precisione:** ±2-3°Bx (molto impreciso)  
**Costo:** €0  
**Difficoltà:** Alta (richiede esperienza)

#### Come Funziona
Stima basata su:
- Colore frutto
- Consistenza al tatto
- Odore
- Esperienza personale

#### Pro
✅ Gratuito  
✅ Veloce  
✅ Non distruttivo

#### Contro
❌ Molto impreciso  
❌ Richiede anni di esperienza  
❌ Soggettivo  
❌ Non affidabile  
❌ Non documentabile

---

## 📊 CONFRONTO METODI

| Metodo | Precisione | Costo | Velocità | Distruttivo | Raccomandato |
|--------|-----------|-------|----------|-------------|--------------|
| **Rifrattometro** | ±0.2°Bx | €20-50 | 2 min | ✅ Sì | ⭐⭐⭐⭐⭐ |
| **Spettrometro** | ±1-2°Bx | €50-80 | 30 sec | ❌ No | ⭐⭐⭐ |
| **Manuale** | ±2-3°Bx | €0 | 10 sec | ❌ No | ⭐ |

---

## 🎯 RACCOMANDAZIONI D'USO

### Per Uso Hobbistico
```
Opzione 1 (Budget): Rifrattometro ottico €20
Opzione 2 (Tech): Spettrometro smartphone €50-80
```

### Per Uso Semi-Professionale
```
Rifrattometro digitale con ATC €40-60
+ Spettrometro per screening rapido (opzionale)
```

### Per Uso Professionale/Commerciale
```
Rifrattometro digitale professionale €150-300
(es: Atago PAL-1, Hanna HI96801)
```

---

## 📱 INTEGRAZIONE IN ORTOMIO

### Registrazione Misurazione

```typescript
// Nel componente BrixTracker
{
  method: 'refractometer',      // RACCOMANDATO per precisione
  value: 14.5,
  confidence: undefined,        // Non serve per rifrattometro
  notes: 'Misurazione precisa con rifrattometro digitale'
}

// Oppure

{
  method: 'ai_estimation',      // Spettrometro smartphone
  value: 14.0,
  confidence: 0.7,              // 70% confidence (approssimativo)
  notes: 'Misurazione con Thunder Optics, luce diffusa'
}
```

### Interpretazione Confidence

- **confidence: undefined** → Rifrattometro (preciso)
- **confidence: 0.9-1.0** → Spettrometro, condizioni ottime
- **confidence: 0.7-0.9** → Spettrometro, condizioni buone
- **confidence: 0.5-0.7** → Spettrometro, condizioni medie
- **confidence: <0.5** → Sconsigliato usare valore

---

## 🔬 BEST PRACTICES

### Quando Misurare
- **Ora:** Mattina presto (8-10) o sera (18-20)
- **Evitare:** Pieno sole (altera temperatura frutto)
- **Frequenza:** Ogni 3-5 giorni in fase maturazione

### Dove Misurare
- **Posizione pianta:** Campiona alto, medio, basso
- **Esposizione:** Frutti esposti a sud maturano prima
- **Numero campioni:** Minimo 3 frutti per media affidabile

### Come Campionare
```
1. Scegli 3-5 frutti rappresentativi
2. Uno da alto, medio, basso pianta
3. Misura ciascuno
4. Calcola media
5. Registra in OrtoMio con note posizione
```

### Calibrazione Spettrometro
```
Frequenza: Ogni 10 misurazioni o settimanale

Procedura:
1. Usa riferimento bianco (carta)
2. Misura campione noto (es: succo commerciale con Brix dichiarato)
3. Confronta con rifrattometro
4. Annota differenza
5. Applica correzione nelle misurazioni successive
```

---

## 📈 VALORI TIPICI BRIX

### Pomodori
- Acerbo: 4-6°Bx
- Maturo: 6-8°Bx
- Ottimo: 8-10°Bx
- Eccellente: >10°Bx

### Uva da Tavola
- Acerbo: 12-14°Bx
- Maturo: 16-18°Bx
- Ottimo: 18-20°Bx
- Eccellente: >20°Bx

### Uva da Vino
- Bianco: 18-22°Bx
- Rosso: 22-26°Bx
- Passito: >28°Bx

### Meloni
- Acerbo: 8-10°Bx
- Maturo: 12-14°Bx
- Ottimo: 14-16°Bx
- Eccellente: >16°Bx

### Fragole
- Acerbo: 6-8°Bx
- Maturo: 8-10°Bx
- Ottimo: 10-12°Bx
- Eccellente: >12°Bx

---

## ⚠️ DISCLAIMER

**Per decisioni commerciali critiche:**
- Usa SEMPRE rifrattometro professionale
- Campiona adeguatamente (min 10 frutti)
- Documenta condizioni misurazione
- Considera analisi laboratorio per contratti

**Spettrometro smartphone:**
- OK per monitoraggio personale trend
- OK per confronti relativi
- NON per certificazioni
- NON per contratti commerciali
- NON per ricerca scientifica

---

## 🛒 DOVE ACQUISTARE

### Rifrattometri
- **Amazon.it:** Cerca "rifrattometro brix"
- **Agraria locale:** Spesso disponibili
- **Online specializzati:** Hanna Instruments, Atago

### Spettrometro Smartphone
- **Thunder Optics:** https://www.amazon.it/dp/B0CTHDPSXZ
- **Alternatives:** Cerca "smartphone spectrometer"

---

## 📚 RISORSE AGGIUNTIVE

- **Video tutorial rifrattometro:** YouTube "how to use refractometer"
- **Calibrazione spettrometro:** Manuale Thunder Optics
- **Tabelle Brix per coltura:** FAO Fruit Quality Standards

---

**Ricorda:** Per OrtoMio, il rifrattometro manuale (€20-50) è la scelta migliore per rapporto qualità/prezzo/precisione! 🎯

---

*Guida Misurazione Brix - OrtoMio*  
*16 Gennaio 2026*
