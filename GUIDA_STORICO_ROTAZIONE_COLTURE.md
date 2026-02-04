# 📚 Guida: Come Vedere lo Storico e Programmare la Rotazione delle Colture

**Data**: 4 Febbraio 2026  
**Per**: Utenti OrtomIO Pro

---

## 🎯 Cosa Puoi Fare

Con il nuovo sistema di **Storico e Rotazione Colture** puoi:

1. ✅ Vedere la storia completa di ogni filare
2. ✅ Capire quali colture sono state piantate e quando
3. ✅ Ricevere suggerimenti AI per la prossima coltura
4. ✅ Programmare la rotazione ottimale
5. ✅ Evitare impoverimento del terreno

---

## 📍 Come Accedere allo Storico

### Passo 1: Vai alla Pagina Filari

```
http://localhost:3002/app/garden/rows
```

Oppure dal menu:
- Dashboard → 🌾 Filari Campo Aperto

### Passo 2: Trova il Filare

Vedrai tutti i tuoi filari visualizzati come card con:
- Nome del filare (es. "Filare 1")
- Lunghezza e numero piante
- Visualizzazione piante 🌱🌱🌱
- Coltura attuale (se presente)
- Sistema irrigazione (se attivo)

### Passo 3: Clicca su "Storico"

Ogni card ha 4 pulsanti:
1. **🌾 Filari** - Torna alla lista
2. **🌱 Piante** - Vedi piante individuali
3. **📜 Storico** ← CLICCA QUI!
4. **⚙️ Config** - Modifica configurazione

---

## 📊 Cosa Vedi nello Storico

### Tab 1: 📜 Storico Colture

Visualizza tutte le colture piantate in ordine cronologico:

```
┌─────────────────────────────────────────┐
│ 🌱 Pomodoro San Marzano                 │
│ 🌿 Solanacee                            │
│ 📅 15 aprile 2026 → ✅ 20 luglio 2026  │
│ ⏱️  96 giorni al raccolto               │
│                                         │
│ 📊 Performance:                         │
│ • Raccolto: 18.5 kg                     │
│ • Qualità: ⭐️⭐️⭐️⭐️⭐️                │
│ • Rotazione: 85 (Ottimo)                │
│                                         │
│ 📍 Contesto Impianto:                   │
│ • 🌡️ 22°C, sunny, 💧 65%               │
│ • 🌙 🌒 Crescente (45% illuminata)      │
│ • 🌸 Primavera                          │
│ • ☀️ 14.3h luce (06:15-20:30)          │
│                                         │
│ ✅ Fattori di Successo:                 │
│ • Irrigazione costante                  │
│ • Buona esposizione solare              │
│                                         │
│ ⚠️ Problemi:                            │
│ • Afidi controllati con sapone          │
└─────────────────────────────────────────┘
```

**Ogni coltura mostra**:
- Nome e varietà
- Famiglia botanica (importante per rotazione!)
- Date di impianto e raccolto
- Giorni al raccolto
- Kg raccolti e qualità
- Punteggio rotazione
- Contesto ambientale completo
- Cosa ha funzionato bene
- Problemi riscontrati

### Tab 2: 💡 Suggerimenti Rotazione

L'AI ti suggerisce le migliori colture per il prossimo ciclo:

```
┌─────────────────────────────────────────┐
│ 🔄 Rotazione delle Colture              │
│                                         │
│ La rotazione previene l'impoverimento   │
│ del suolo e riduce malattie e parassiti │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🥇 Leguminose                    95     │
│                                         │
│ Ripristinano l'azoto consumato          │
│ dalle solanacee                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🥈 Crucifere                     85     │
│                                         │
│ Buona alternativa, radici diverse       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🥉 Cucurbitacee                  80     │
│                                         │
│ Beneficiano del terreno arricchito      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📚 Guida alla Rotazione Classica        │
│                                         │
│ 1️⃣ Leguminose → Arricchiscono azoto    │
│ 2️⃣ Crucifere → Sfruttano l'azoto       │
│ 3️⃣ Cucurbitacee → Terreno fertile      │
│ 4️⃣ Solanacee → Completano il ciclo     │
└─────────────────────────────────────────┘
```

**I suggerimenti includono**:
- Top 3 famiglie consigliate
- Punteggio per ognuna (1-100)
- Motivazione scientifica
- Medaglie 🥇🥈🥉 per ranking
- Guida alla rotazione classica

---

## 🔄 Come Programmare la Rotazione

### Metodo 1: Segui i Suggerimenti AI

1. Apri lo storico del filare
2. Vai al tab "💡 Suggerimenti"
3. Guarda la famiglia consigliata (es. "Leguminose")
4. Scegli una coltura di quella famiglia:
   - **Leguminose**: fagiolo, pisello, fava, cece
   - **Crucifere**: cavolo, broccolo, rapa, ravanello
   - **Cucurbitacee**: zucchina, zucca, cetriolo
   - **Solanacee**: pomodoro, peperone, melanzana

### Metodo 2: Controlla il Punteggio

Ogni coltura ha un **punteggio di rotazione** (1-100):

- **100**: 🟢 Ottimo - famiglia mai coltivata o >24 mesi fa
- **80**: 🟡 Accettabile - 12-24 mesi fa
- **50**: 🟠 Sconsigliato - 6-12 mesi fa
- **20**: 🔴 Molto sconsigliato - <6 mesi fa

**Regola d'oro**: Pianta solo colture con punteggio ≥ 80!

### Metodo 3: Segui il Ciclo Classico

```
Anno 1: Leguminose (fagioli, piselli)
   ↓
Anno 2: Crucifere (cavoli, broccoli)
   ↓
Anno 3: Cucurbitacee (zucchine, zucche)
   ↓
Anno 4: Solanacee (pomodori, peperoni)
   ↓
🔄 Ricomincia da Anno 1
```

---

## 📝 Come Registrare una Nuova Coltura

### Automatico (Consigliato)

Quando trapianti dal vivaio, il sistema **registra automaticamente**:
1. Nome coltura e varietà
2. Data di impianto
3. Contesto ambientale (meteo, luna, stagione)
4. Famiglia botanica
5. Punteggio rotazione

**Nessuna azione richiesta!** 🎉

### Manuale (Per Esperti)

Se vuoi registrare manualmente:

```typescript
// In console browser o tramite API
await fieldRowCropHistoryService.recordCropPlanting({
  gardenRowId: 'row-123',
  gardenId: 'garden-456',
  cropName: 'Pomodoro',
  cropVariety: 'San Marzano',
  plantingDate: new Date(),
  notes: 'Impianto primaverile'
});
```

---

## 🎯 Esempi Pratici

### Esempio 1: Dopo i Pomodori

**Situazione**: Hai appena raccolto i pomodori (Solanacee)

**Storico mostra**:
- Ultima coltura: Pomodoro (Solanacee)
- Data raccolto: 20 luglio 2026

**Suggerimenti AI**:
1. 🥇 **Leguminose** (95) - "Ripristinano l'azoto"
2. 🥈 **Crucifere** (85) - "Radici diverse"

**Cosa fare**:
- ✅ Pianta fagioli o piselli (Leguminose)
- ✅ Oppure cavoli o broccoli (Crucifere)
- ❌ NON piantare altri pomodori/peperoni (Solanacee)

### Esempio 2: Dopo i Fagioli

**Situazione**: Hai appena raccolto i fagioli (Leguminose)

**Storico mostra**:
- Ultima coltura: Fagiolo (Leguminose)
- Terreno arricchito di azoto

**Suggerimenti AI**:
1. 🥇 **Crucifere** (95) - "Sfruttano l'azoto"
2. 🥈 **Cucurbitacee** (90) - "Beneficiano del terreno"

**Cosa fare**:
- ✅ Pianta cavoli o broccoli (Crucifere)
- ✅ Oppure zucchine o zucche (Cucurbitacee)
- ❌ NON piantare altri fagioli (Leguminose)

### Esempio 3: Filare Nuovo

**Situazione**: Primo impianto in un filare nuovo

**Storico mostra**:
- Nessuna coltura precedente

**Suggerimenti AI**:
1. 🥇 **Leguminose** (100) - "Arricchiscono il terreno"

**Cosa fare**:
- ✅ Inizia con leguminose (fagioli, piselli)
- Prepara il terreno per i cicli futuri
- Il terreno sarà perfetto per le prossime colture

---

## 🔍 Come Interpretare i Dati

### Punteggio Rotazione

```
100 = 🟢 PERFETTO
 ↓
 80 = 🟡 BUONO
 ↓
 50 = 🟠 ATTENZIONE
 ↓
 20 = 🔴 EVITA
```

### Qualità Raccolto

```
⭐️⭐️⭐️⭐️⭐️ = Eccellente
⭐️⭐️⭐️⭐️   = Buono
⭐️⭐️⭐️     = Discreto
⭐️⭐️       = Scarso
⭐️         = Pessimo
```

### Contesto Ambientale

- **🌡️ Temperatura**: Ideale 18-25°C per la maggior parte delle colture
- **💧 Umidità**: Ideale 60-70%
- **🌙 Luna Crescente**: Favorisce crescita fogliare
- **🌙 Luna Calante**: Favorisce sviluppo radici
- **☀️ Ore di Luce**: Più ore = più fotosintesi

---

## ❓ FAQ

### Q: Lo storico è vuoto, perché?

**A**: Lo storico si popola automaticamente quando:
1. Trapianti dal vivaio all'orto
2. Registri manualmente una coltura

Se hai filari vecchi, non avranno storico retroattivo.

### Q: Posso ignorare i suggerimenti AI?

**A**: Sì, ma non è consigliato! I suggerimenti sono basati su:
- Scienza agronomica consolidata
- Storico reale del tuo filare
- Pattern di successo

Ignorarli può portare a:
- Impoverimento del terreno
- Malattie ricorrenti
- Raccolti scarsi

### Q: Come registro il raccolto?

**A**: Attualmente automatico quando raccogli. In futuro:

```typescript
await fieldRowCropHistoryService.recordCropHarvest(
  historyId,
  {
    harvestDate: new Date(),
    yieldKg: 15.5,
    qualityRating: 5,
    successFactors: ['Irrigazione costante'],
    problems: ['Qualche afide']
  }
);
```

### Q: Posso vedere lo storico di tutti i filari insieme?

**A**: Attualmente no, ma in sviluppo! Presto avrai:
- Vista aggregata di tutti i filari
- Statistiche per famiglia botanica
- Analisi performance globale

---

## 🚀 Prossimi Passi

1. **Esplora lo storico** di ogni filare
2. **Segui i suggerimenti AI** per la prossima coltura
3. **Registra i risultati** (automatico al raccolto)
4. **Impara dai dati** - cosa ha funzionato meglio?
5. **Ottimizza** la rotazione nel tempo

---

## 💡 Consigli Pro

1. **Pianifica in anticipo**: Guarda i suggerimenti prima di comprare semi
2. **Annota tutto**: Più dati = suggerimenti migliori
3. **Sperimenta**: Prova varietà diverse della stessa famiglia
4. **Confronta**: Usa lo storico per confrontare anni diversi
5. **Condividi**: Esporta i dati per condividerli con altri agricoltori

---

**Buona coltivazione! 🌱**

Il tuo assistente AI per l'agricoltura intelligente
