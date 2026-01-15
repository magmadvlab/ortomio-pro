# Piano Confronto Side-by-Side - Vecchia vs Nuova App

**Data**: 15 Gennaio 2026  
**Obiettivo**: Permettere confronto pratico tra vecchia e nuova app

---

## 🎯 Strategia

Invece di creare route duplicate, creiamo un sistema di **iframe side-by-side** che permette di:
1. Vedere entrambe le versioni contemporaneamente
2. Testare le funzionalità in parallelo
3. Decidere cosa tenere/eliminare basandosi su test reali

---

## 📋 Funzionalità da Confrontare

### 1. **Planner** 🌱
- **Vecchia**: Monolitico 2560 righe con tutti i wizard integrati
- **Nuova**: Modulare con 5 tabs separati

**Cosa verificare**:
- [ ] Wizard piantagione (step-by-step)
- [ ] Selezione materiale (seme/piantina/alberello)
- [ ] Collegamento banca semi
- [ ] Collegamento vivaio
- [ ] Semina scaglionata (batches)
- [ ] Calendario colturale
- [ ] Suggerimenti AI
- [ ] Compatibilità pH
- [ ] Fertirrigazione
- [ ] Piante compagne

### 2. **Banca Semi** 📦
- **Vecchia**: `SeedInventory.tsx`
- **Nuova**: `SeedInventory.tsx` (stesso componente?)

**Cosa verificare**:
- [ ] Aggiunta pacchetti semi
- [ ] Scadenza semi
- [ ] Consumo semi per semina
- [ ] Ricerca semi per pianta
- [ ] Export/Import

### 3. **Vivaio/Semenzaio** 🌿
- **Vecchia**: `SeedlingManager.tsx`
- **Nuova**: `SeedlingManager.tsx` (stesso componente?)

**Cosa verificare**:
- [ ] Creazione lotti piantine
- [ ] Tracking germinazione
- [ ] Stato crescita
- [ ] Data trapianto prevista
- [ ] Selezione da vivaio per trapianto

### 4. **Filari e Sezioni** 📏
- **Vecchia**: Da verificare se esiste
- **Nuova**: Sistema completo zone→filari→sezioni

**Cosa verificare**:
- [ ] Creazione filari
- [ ] Divisione in sezioni
- [ ] Assegnazione colture a sezioni
- [ ] Tracking operazioni per sezione
- [ ] Visualizzazione mappa filari

### 5. **Piante Individuali** 🌳
- **Vecchia**: Da verificare se esiste
- **Nuova**: Sistema completo con codici univoci

**Cosa verificare**:
- [ ] Creazione pianta individuale
- [ ] Codice univoco (es. T-F1-P003)
- [ ] Posizione in filare
- [ ] Storico operazioni
- [ ] Stato salute
- [ ] Foto pianta

### 6. **Irrigazione** 💧
- **Vecchia**: Sistema completo con zone, sistemi, analytics
- **Nuova**: Versione semplificata con AI widget

**Cosa verificare**:
- [ ] Gestione zone irrigazione
- [ ] Sistemi irrigazione (goccia, aspersione, etc.)
- [ ] Log irrigazioni
- [ ] Analytics consumo acqua
- [ ] Suggerimenti AI

### 7. **Nutrizione** 🌾
- **Vecchia**: Gestione completa per bed/row, trattamenti, fertilizzanti
- **Nuova**: Versione semplificata con AI widget

**Cosa verificare**:
- [ ] Gestione fertilizzanti
- [ ] Trattamenti fitosanitari
- [ ] Applicazione per zona/filare
- [ ] Calcolo dosi
- [ ] Storico trattamenti
- [ ] Suggerimenti AI

### 8. **Lavori Meccanici** 🚜
- **Vecchia**: Sistema completo attrezzature, lavorazioni, accessori
- **Nuova**: Versione minimalista

**Cosa verificare**:
- [ ] Gestione attrezzature
- [ ] Manutenzione attrezzature
- [ ] Lavorazioni terreno
- [ ] Accessori
- [ ] Costi operativi

### 9. **Certificazioni** 📋
- **Vecchia**: Dashboard completo con documenti, scadenze, checklist
- **Nuova**: Solo GlobalGapDashboard

**Cosa verificare**:
- [ ] Gestione documenti
- [ ] Scadenze certificazioni
- [ ] Checklist conformità
- [ ] Export report
- [ ] Moduli GlobalGAP

### 10. **AI Predittiva** 🤖
- **Vecchia**: Da verificare se esiste
- **Nuova**: Engine completo, manca UI

**Cosa verificare**:
- [ ] Predizioni malattie
- [ ] Predizioni resa
- [ ] Ottimizzazione risorse
- [ ] Confidence score
- [ ] Azioni raccomandate

---

## 🛠️ Implementazione

### Opzione A: Iframe Side-by-Side (SCELTA)

**Vantaggi**:
- Non duplica codice
- Permette test reale
- Facile da implementare

**Implementazione**:
```typescript
// app/app/compare/side-by-side/page.tsx
'use client'

export default function SideBySideComparePage() {
  const [selectedFeature, setSelectedFeature] = useState('planner')
  
  const features = {
    planner: {
      old: '/app/planner', // Vecchia app
      new: '/app/planner'  // Nuova app
    },
    // ... altre features
  }
  
  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      <iframe src={features[selectedFeature].old} />
      <iframe src={features[selectedFeature].new} />
    </div>
  )
}
```

### Opzione B: Route Duplicate (NON SCELTA)

**Svantaggi**:
- Duplica tutto il codice
- Difficile da mantenere
- Spreco di spazio

---

## 📊 Matrice Confronto

Creiamo un documento che l'utente può compilare mentre testa:

| Funzionalità | Vecchia | Nuova | Preferenza | Note |
|--------------|---------|-------|------------|------|
| Planner Wizard | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ? | |
| Banca Semi | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ? | |
| Vivaio | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ? | |
| Filari | ? | ⭐⭐⭐⭐⭐ | ? | |
| Piante Individuali | ? | ⭐⭐⭐⭐⭐ | ? | |
| Irrigazione | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ? | |
| Nutrizione | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ? | |
| Lavori Meccanici | ⭐⭐⭐⭐⭐ | ⭐⭐ | ? | |
| Certificazioni | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ? | |
| AI Predittiva | ? | ⭐⭐⭐⭐ | ? | |

---

## 🚀 Prossimi Passi

1. **Creare pagina confronto** con iframe side-by-side
2. **Testare ogni funzionalità** in entrambe le versioni
3. **Compilare matrice** con preferenze
4. **Decidere cosa portare** dalla vecchia alla nuova
5. **Implementare funzionalità mancanti**

---

## 📝 Template Feedback

Per ogni funzionalità testata, compilare:

```markdown
### [Nome Funzionalità]

**Vecchia App**:
- ✅ Cosa funziona bene:
- ❌ Cosa non funziona:
- 💡 Cosa manca:

**Nuova App**:
- ✅ Cosa funziona bene:
- ❌ Cosa non funziona:
- 💡 Cosa manca:

**Decisione**:
- [ ] Tenere vecchia
- [ ] Tenere nuova
- [ ] Merge (portare funzionalità X dalla vecchia alla nuova)
- [ ] Riscrivere da zero

**Note**:
[Commenti liberi]
```

---

## 🎯 Obiettivo Finale

Avere una **checklist completa** di cosa:
1. **Tenere** dalla nuova app (già funziona bene)
2. **Portare** dalla vecchia app (funzionalità mancanti)
3. **Eliminare** (funzionalità obsolete/non necessarie)
4. **Riscrivere** (funzionalità da migliorare)

Questo permetterà di creare un **piano di migrazione preciso** basato su test reali, non su assunzioni.
