# ✅ Sistema Collaborativo AI - UNIVERSALE

**Funziona per TUTTE le Colture**

---

## 🌍 Compatibilità Universale

Il sistema collaborativo AI è **completamente agnostico** rispetto al tipo di coltura:

✅ **Orti** → Ortaggi, verdure, erbe aromatiche  
✅ **Frutteti** → Meli, peri, peschi, ciliegi, albicocchi, susini  
✅ **Oliveti** → Olive da olio e da tavola  
✅ **Vigneti** → Uva da vino e da tavola  
✅ **Agrumeti** → Arance, limoni, mandarini  
✅ **Qualsiasi altra coltura**  

---

## 🔧 Come Funziona

### 1. Database Universale

La tabella `ai_suggestions` usa `garden_id` che può riferirsi a:
- Orto
- Frutteto  
- Oliveto
- Vigneto
- Qualsiasi tipo di campo/giardino

### 2. Tipi di Suggerimenti Universali

Tutti i `suggestion_type` si adattano a qualsiasi coltura:

| Tipo | Orto | Frutteto | Oliveto | Vigneto |
|------|------|----------|---------|---------|
| **DISEASE_PREVENTION** | Peronospora pomodori | Ticchiolatura meli | Mosca olearia | Peronospora vite |
| **YIELD_OPTIMIZATION** | Fertilizzazione lattuga | Diradamento frutti | Potatura olive | Sfogliatura grappoli |
| **RESOURCE_SAVING** | Irrigazione ortaggi | Irrigazione frutteto | Irrigazione oliveto | Irrigazione vigneto |
| **HARVEST_TIMING** | Raccolta pomodori | Raccolta mele | Raccolta olive | Vendemmia |
| **TREATMENT** | Trattamenti orto | Trattamenti frutteto | Trattamenti oliveto | Trattamenti vigneto |

---

## 🍎 Esempi per Frutteto

### Suggerimento 1: Ticchiolatura Meli
```javascript
{
  title: 'Rischio Ticchiolatura su Meli',
  suggestion_type: 'DISEASE_PREVENTION',
  prediction_data: {
    probability: 0.82,
    riskLevel: 'HIGH'
  },
  suggested_action: 'Trattamento con zolfo bagnabile entro 12h',
  suggested_parameters: {
    prodotto: 'Zolfo bagnabile 80%',
    dosaggio: '400g/100L',
    bagnatura: 'Completa su foglie e germogli',
    stadio_fenologico: 'Bottoni rosa'
  }
}
```

### Suggerimento 2: Diradamento Frutti
```javascript
{
  title: 'Diradamento Mele per Aumentare Qualità',
  suggestion_type: 'YIELD_OPTIMIZATION',
  prediction_data: {
    expectedYield: 45,
    confidence: 0.85
  },
  suggested_action: 'Diradare a 1 frutto ogni 15cm entro 7 giorni',
  suggested_parameters: {
    distanza_frutti: '15cm',
    frutti_per_mazzetto: 1,
    timing: 'Dopo cascola naturale',
    peso_finale_previsto: '200g per mela'
  }
}
```

---

## 🫒 Esempi per Oliveto

### Suggerimento 1: Mosca Olearia
```javascript
{
  title: 'Rischio Mosca Olearia - Installare Trappole',
  suggestion_type: 'DISEASE_PREVENTION',
  prediction_data: {
    probability: 0.75,
    riskLevel: 'HIGH'
  },
  suggested_action: 'Installare trappole Tap Trap entro 48h',
  suggested_parameters: {
    tipo_trappola: 'Tap Trap cromotropica gialla',
    numero: '1 ogni 3-4 piante',
    posizionamento: 'Lato sud, altezza 1.5-2m',
    controllo: 'Settimanale'
  }
}
```

### Suggerimento 2: Timing Raccolta
```javascript
{
  title: 'Finestra Ottimale Raccolta Olive',
  suggestion_type: 'HARVEST_TIMING',
  prediction_data: {
    confidence: 0.90
  },
  suggested_action: 'Raccolta tra 25-28 Ottobre',
  suggested_parameters: {
    data_ottimale: '26 Ottobre 2026',
    invaiatura_target: '85%',
    resa_olio_prevista: '18%',
    acidita_prevista: '0.3%',
    molitura: 'Entro 24h'
  }
}
```

---

## 🍇 Esempi per Vigneto

### Suggerimento 1: Peronospora Vite
```javascript
{
  title: 'Rischio Peronospora - Trattamento Preventivo',
  suggestion_type: 'DISEASE_PREVENTION',
  prediction_data: {
    probability: 0.85,
    riskLevel: 'CRITICAL'
  },
  suggested_action: 'Trattamento rameico entro 24h',
  suggested_parameters: {
    prodotto: 'Ossicloruro di rame 50%',
    dosaggio: '300g/100L',
    bagnatura: 'Completa su grappoli e foglie',
    stadio_fenologico: 'Pre-fioritura'
  }
}
```

### Suggerimento 2: Vendemmia
```javascript
{
  title: 'Finestra Ottimale Vendemmia',
  suggestion_type: 'HARVEST_TIMING',
  prediction_data: {
    confidence: 0.92
  },
  suggested_action: 'Vendemmia tra 15-18 Settembre',
  suggested_parameters: {
    data_ottimale: '16 Settembre 2026',
    brix_target: '22-23',
    acidita_target: '6.5 g/L',
    ph_target: '3.3',
    orario: 'Mattina presto (6-10)'
  }
}
```

---

## 🧠 Apprendimento Specifico per Coltura

Il sistema impara le specificità di ogni tipo di coltura:

### Pattern Oliveto
```javascript
{
  pattern_type: 'CROP_SPECIFIC',
  pattern_description: 'Utente preferisce raccolta precoce per olio DOP',
  pattern_data: {
    crop_type: 'olive',
    harvest_preference: 'early',
    invaiatura_target: 70,
    reason: 'Qualità DOP richiede bassa acidità'
  }
}
```

### Pattern Vigneto
```javascript
{
  pattern_type: 'CROP_SPECIFIC',
  pattern_description: 'Utente anticipa vendemmia per acidità alta',
  pattern_data: {
    crop_type: 'grape',
    harvest_adjustment: -2,
    brix_preference: 21,
    reason: 'Vini freschi e acidi'
  }
}
```

---

## 🚀 Come Testare per Diverse Colture

### Script Universale

Ho creato uno script che rileva automaticamente il tipo di coltura:

```bash
node test-collaborative-ai-frutteto-oliveto-vigneto.js
```

Lo script:
1. Cerca tutti i gardens nel database
2. Rileva il tipo dal nome (frutteto/oliveto/vigneto)
3. Crea suggerimenti specifici per quel tipo
4. Se non rileva il tipo, crea suggerimenti misti

### Rilevamento Automatico

```javascript
const gardenName = garden.name.toLowerCase()

if (gardenName.includes('frutt') || gardenName.includes('mel')) {
  // Suggerimenti per frutteto
} else if (gardenName.includes('oliv')) {
  // Suggerimenti per oliveto
} else if (gardenName.includes('vign') || gardenName.includes('uva')) {
  // Suggerimenti per vigneto
} else {
  // Suggerimenti misti
}
```

---

## 📊 Suggerimenti Creati per Tipo

### Frutteto (1 suggerimento)
- 🍎 Rischio Ticchiolatura su Meli (CRITICAL)

### Oliveto (2 suggerimenti)
- 🫒 Rischio Mosca Olearia (HIGH)
- 🫒 Finestra Ottimale Raccolta Olive (HIGH)

### Vigneto (2 suggerimenti)
- 🍇 Rischio Peronospora Vite (CRITICAL)
- 🍇 Finestra Ottimale Vendemmia (HIGH)

---

## ✅ Vantaggi Sistema Universale

### 1. **Stesso Database**
- Una sola tabella `ai_suggestions`
- Funziona per tutte le colture
- Nessuna duplicazione

### 2. **Stessa UI**
- Dashboard identica
- Card suggerimenti uguali
- Trasparenza uguale

### 3. **Stesso Apprendimento**
- Pattern specifici per coltura
- Personalizzazione automatica
- Miglioramento continuo

### 4. **Stessa Esperienza**
- Accetta / Modifica / Rifiuta
- Trasparenza completa
- Feedback loop

---

## 🎯 Conclusione

**Il sistema collaborativo AI funziona per QUALSIASI coltura!**

✅ Orto → Già testato con script base  
✅ Frutteto → Script specifico disponibile  
✅ Oliveto → Script specifico disponibile  
✅ Vigneto → Script specifico disponibile  

**Stesso sistema, suggerimenti diversi, esperienza identica!**

---

## 🚀 Test Rapido

```bash
# 1. Applica migration (una volta sola)
Supabase Dashboard → SQL Editor → Run migration

# 2. Popola con suggerimenti specifici
node test-collaborative-ai-frutteto-oliveto-vigneto.js

# 3. Apri dashboard
http://localhost:3002/app/ai-collaborative
```

**Il sistema si adatta automaticamente al tipo di coltura! 🌱🍎🫒🍇**
