# 🧪 Test UI Improvements - Ortomio Pro

## 🌐 Server Dev
**URL**: http://localhost:3002

## ✅ Checklist Test

### 1️⃣ GardenView - Quick Actions FAB

**Percorso**: Home → Il Mio Orto (qualsiasi tab)

**Test:**
1. Clicca il FAB verde in basso a destra (bottone `+`)
2. Verifica che appaia il menu con 4 azioni:
   - 📋 Nuovo Task
   - 🛒 Registra Raccolto ← **NUOVO**
   - 📷 Scatta Foto ← **NUOVO**
   - 🌱 Nuova Semina

**Test Registra Raccolto:**
1. Clicca "🛒 Registra Raccolto"
2. **Aspettativa**: Si apre modal `HarvestRegistrationModal`
3. Verifica presenza pulsanti:
   - "Vai alla Lista" → Switcha al tab Lista
   - "Vai alle Piante" → Switcha al tab Piante
4. Verifica che il modal si chiuda con `✕`

**Test Scatta Foto:**
1. Clicca "📷 Scatta Foto"
2. **Aspettativa**: Si apre modal `PhotoCaptureModal`
3. Verifica presenza pulsanti:
   - "Vai alla Lista" → Switcha al tab Lista
   - "Vai al Diario" → Link a `/app/journal`
4. Verifica che il modal si chiuda con `✕`

**✅ Successo**: I due bottoni prima vuoti ora aprono modali funzionanti

---

### 2️⃣ PlantsView - Plant Details Modal

**Percorso**: Home → Il Mio Orto → Tab "Piante"

**Setup**: Assicurati di avere almeno 1 pianta attiva (semina/trapianto non completato)

**Test:**
1. Trova una card pianta (es. "Peperoncino")
2. Clicca "Visualizza Dettagli" sulla card
3. **Aspettativa**: Si apre modal grande con 5 sezioni:

**Verifica contenuto modal:**
```
🌱 PEPERONCINO (Header)
Varietà: Cayenna (se presente)

🟢 Informazioni Base
  - Tipo attività: Sowing
  - Data semina: 07/01/2026
  - Posizione: Terra
  - Quantità: 1

🔵 Stato Crescita (se lifecycleState presente)
  - Fase del ciclo: Germination
  - Stadio: Seedling

🟡 Note (se presenti)
  - Testo delle note

⚪ Task Correlati
  - Lista altri task per stesso plantName
  - Badge tipo task + data
  - ✓ se completato

[Registra Raccolto] [Chiudi]
```

**Test azione "Registra Raccolto":**
1. Clicca "Registra Raccolto" nel modal dettagli
2. **Aspettativa**: Modal dettagli si chiude e si apre HarvestPromptModal
3. Verifica che la pianta corretta sia selezionata

**✅ Successo**: Modal dettagli mostra tutte le info + task correlati

---

### 3️⃣ PlantsView - Harvest Log ID Fix

**Percorso**: Home → Il Mio Orto → Tab "Piante"

**Test:**
1. Trova una pianta pronta per il raccolto
2. Clicca "Raccogli" sulla card
3. Compila il form raccolto con:
   - Quantità: 2.5 kg
   - Qualità: Excellent
   - Note: "Primo raccolto stagione"
4. Clicca "Registra"
5. **Aspettativa**: Task aggiornato con `harvestLogId` reale (non 'completed')

**Verifica (Dev Tools):**
1. Apri Console → Network
2. Cerca chiamata `createHarvestLog`
3. Verifica response contiene `{ id: "uuid-reale" }`
4. Verifica che il task task.harvestLogId === "uuid-reale"

**✅ Successo**: ID harvest log reale salvato invece di stringa hardcoded

---

### 4️⃣ CalendarAlmanac - AI Consigli

**Percorso**: Home → Il Mio Orto → Tab "Calendario"

**Setup**: Assicurati di avere task attivi di tipo Sowing o Transplant

**Test:**
1. Seleziona una data con task attivo (es. 7 gennaio con peperoncino)
2. Scroll nel pannello dettagli a destra
3. **Aspettativa**: Dopo "Task del Giorno" vedi nuove sezioni AI:

**🧪 Consiglio Nutrizionale** (se presente):
```
🧪 FOSFORO                    [Badge azzurro]
   PEPERONCINO                [Testo piccolo]

   Supporto Radicale         [Titolo bold]

   La pianta si sta stabilizzando. Se non hai concimato
   al trapianto, usa un fertilizzante bilanciato ricco
   di Fosforo.

   [Box bianco] Il tuo terreno ha buona ritenzione.
                Segui le dosi standard.
```

**🛡️ Consiglio Salute** (se presente):
```
🛡️ PREVENZIONE                [Badge giallo]
   LOW PRIORITY               [Badge giallo]
   PEPERONCINO                [Testo piccolo]

   Propoli o Alghe           [Titolo bold]

   Aiuta a superare lo stress da trapianto e stimola
   le difese naturali della pianta.

   Dosaggio: 2-3ml per litro
```

**Verifica colori:**
- Fosforo → Blu (bg-blue-50, border-blue-200)
- Azoto → Verde (bg-green-50, border-green-200)
- Potassio → Arancione (bg-orange-50, border-orange-200)
- Micronutrienti → Viola (bg-purple-50, border-purple-200)
- Salute High → Rosso
- Salute Medium → Arancione
- Salute Low → Giallo

**✅ Successo**: Consigli AI appaiono nel calendario con colori semantici

---

### 5️⃣ IrrigationSystemWizard - TypeScript Fix

**Test build production:**
```bash
npm run build
```

**Aspettativa:**
- ✅ Build completa senza errori TypeScript
- ❌ NO ERROR: "bedIds does not exist in type"

**Se errore persiste:**
1. Verifica import: `import { IrrigationSystem } from '@/types/irrigation'`
2. Verifica file types/irrigation.ts contiene bedIds e rowIds
3. Verifica wizard usa variabile typed invece di inline

**✅ Successo**: Build passa senza errori TypeScript

---

## 🐛 Problemi Noti (Non Bloccanti)

### AbortError in Console
- **Causa**: Hot Module Replacement di Next.js
- **Impatto**: Nessuno (comportamento normale in dev)
- **Fix**: Ignorare se appare solo in dev mode

### Git Performance Issues
- **Causa**: Molti file modificati + git index lento
- **Workaround**: Commit file specifici invece di `git add -A`

---

## 📊 Metriche Test

| Feature | Status | File | Linee |
|---------|--------|------|-------|
| Quick Actions Harvest | ✅ | GardenView.tsx | +50 |
| Quick Actions Photo | ✅ | GardenView.tsx | +47 |
| Plant Details Modal | ✅ | PlantsView.tsx | +146 |
| Harvest Log ID Fix | ✅ | PlantsView.tsx | +3 |
| Calendar AI Advice | ✅ | CalendarAlmanac.tsx | +117 |
| TypeScript Fix | ✅ | IrrigationSystemWizard.tsx | +13 |

**Totale**: 6 features, +376 linee

---

## 🎨 Pattern UI da Verificare

### Badge Stile Journal
- Font: bold, text-xs, px-2 py-0.5, rounded
- Colori: bg-{color}-100 text-{color}-700

### Card Consiglio
- Border: border-2 border-{color}-200
- Background: bg-{color}-50
- Padding: p-4
- Border radius: rounded-xl

### Icone
- FlaskConical per nutrizione (lucide-react)
- Shield per salute (lucide-react)
- Size: 16px nel calendario, 18px nel journal

---

## 🚀 Next Steps

Dopo test locale:
1. Fix eventuali bug trovati
2. Commit changes: `git add components/... && git commit`
3. Push to GitHub: `git push origin main`
4. Verifica Vercel deploy passa

---

**Data Test**: 9 Gennaio 2026
**Build**: Next.js 16.1.1 (Turbopack)
**Port**: 3002
