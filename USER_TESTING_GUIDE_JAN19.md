# 🎯 USER TESTING GUIDE - Advanced Features

## Quick Start: How to See Your New Features

### 🫒 OLIVE GROVE FEATURES

**Step-by-Step Instructions:**

1. **Open your browser** and go to: `https://ortomio-pro.vercel.app/app/olives`

2. **Look at the top right** - you'll see 3 buttons:
   ```
   [📊 Panoramica]  [⚙️ Gestione Completa]  [👥 Olivi Individuali]
   ```

3. **Click the MIDDLE button**: "⚙️ Gestione Completa"

4. **Now you'll see 4 tabs** in a white box below:
   ```
   [📊 Gestione Completa]  [🫒 Maturazione]  [🐛 Mosca Olearia]  [🧮 Calcolo Densità]
   ```

5. **Click each tab to test**:
   - **Maturazione**: Olive maturity tracker with Jaén Index
   - **Mosca Olearia**: Olive fly monitoring system
   - **Calcolo Densità**: Planting density calculator

---

### 🍇 VINEYARD FEATURES

**Step-by-Step Instructions:**

1. **Open your browser** and go to: `https://ortomio-pro.vercel.app/app/vineyard`

2. **If you have vineyards**: Click on one to select it
   **If you don't have vineyards**: Click "Crea Primo Vigneto" to create one

3. **Look for the navigation tabs** below the vineyard info:
   ```
   [⚙️ Gestione Completa]  [🍇 Viti]  [👥 Viti Individuali]  [✂️ Potature]  ...
   ```

4. **Click**: "⚙️ Gestione Completa"

5. **Now you'll see 4 tabs** in a white box below:
   ```
   [📊 Gestione Completa]  [🧮 Carico Gemme]  [💧 Maturazione]  [🧮 Calcolo Densità]
   ```

6. **Click each tab to test**:
   - **Carico Gemme**: Ravaz Index calculator for bud load
   - **Maturazione**: Grape maturity tracker (Brix, pH, acidity)
   - **Calcolo Densità**: Planting density calculator

---

### 🌳 ORCHARD FEATURES

**Step-by-Step Instructions:**

1. **Open your browser** and go to: `https://ortomio-pro.vercel.app/app/orchard`

2. **The tabs are visible immediately** at the top:
   ```
   [📊 Panoramica]  [🧮 Calcolo Densità]  [🎯 Resa per Pianta]
   ```

3. **Click each tab to test**:
   - **Calcolo Densità**: Planting density calculator
   - **Resa per Pianta**: Individual tree yield tracker

---

## 🎨 What You Should See

### Olive Maturity Tracker
- **Header**: "Monitoraggio Maturazione Olive"
- **Info box**: Explanation of Jaén Index
- **Current status**: Shows latest maturity reading
- **Button**: "Nuova Lettura" to add measurements
- **Color scale**: 8 color categories (0-7)
- **History**: List of all previous readings
- **Guide**: Interpretation table

### Olive Fly Monitor
- **Header**: "Monitoraggio Mosca Olearia"
- **Info box**: Explanation of Bactrocera oleae
- **Trap list**: All monitoring traps
- **Button**: "Aggiungi Trappola" to add new trap
- **Alerts**: Threshold warnings
- **History**: Capture records over time
- **Map**: Visual trap distribution (if available)

### Ravaz Index Calculator
- **Header**: "Calcolo Indice di Ravaz"
- **Info box**: Explanation of the index
- **Input 1**: Peso legno potatura (kg/pianta)
- **Input 2**: Produzione uva (kg/pianta)
- **Button**: "Calcola Indice di Ravaz"
- **Result**: Shows calculated index with color coding
- **Recommendation**: Specific advice based on result
- **Reference table**: Interpretation guide

### Grape Maturity Tracker
- **Header**: "Monitoraggio Maturazione Uva"
- **Info box**: Explanation of Brix, pH, acidity
- **Current status**: Latest readings
- **Button**: "Nuova Lettura" to add measurements
- **Inputs**: Brix (°Bx), pH, Acidità (g/L)
- **History**: All previous readings
- **Recommendations**: Harvest timing advice

### Density Calculator
- **Header**: "Calcolatore Densità Impianto"
- **Info box**: Explanation of density calculation
- **Input 1**: Distanza tra file (m)
- **Input 2**: Distanza sulla fila (m)
- **Button**: "Calcola Densità"
- **Result**: Plants per hectare
- **Recommendations**: Optimal ranges by crop type
- **Layout options**: Rectangular, square, quincunx

### Yield Per Tree Tracker
- **Header**: "Tracciamento Resa per Pianta"
- **Statistics**: Average yield, total production, top performer
- **Button**: "Nuova Registrazione" to add data
- **Inputs**: Tree number, variety, yield (kg), quality
- **By variety**: Grouped statistics
- **Table**: All recorded yields
- **Tips**: Best practices for tracking

---

## ❌ Troubleshooting

### Problem: "I don't see the tabs"

**For Olive Grove:**
- ✅ Make sure you clicked "Gestione Completa" (middle button, top right)
- ✅ The tabs appear INSIDE the dashboard, not at the page level
- ✅ Look for a white box with 4 tabs below the header

**For Vineyard:**
- ✅ Make sure you selected a vineyard first
- ✅ Then click "Gestione Completa" in the navigation
- ✅ The tabs appear INSIDE the dashboard

**For Orchard:**
- ✅ Tabs should be visible immediately
- ✅ Look at the top of the page for 3 tabs

---

### Problem: "The page looks the same as before"

**Solution: Clear your browser cache**

**On Mac:**
- Press: `Cmd + Shift + R`

**On Windows:**
- Press: `Ctrl + Shift + R`

**Or manually:**
1. Open browser settings
2. Find "Clear browsing data"
3. Select "Cached images and files"
4. Click "Clear data"
5. Refresh the page

---

### Problem: "Tabs are not clickable"

**Solution:**
1. Check browser console for errors:
   - Right-click → "Inspect"
   - Click "Console" tab
   - Look for red error messages
   - Take a screenshot and share

2. Try a different browser:
   - Chrome
   - Firefox
   - Safari
   - Edge

3. Check if JavaScript is enabled:
   - Browser settings → Privacy & Security
   - Ensure JavaScript is allowed

---

### Problem: "Components show blank content"

**This should NOT happen** - all components have sample data built-in.

If you see blank content:
1. Open browser console (Right-click → Inspect → Console)
2. Look for error messages
3. Take a screenshot
4. Share the error details

---

### Problem: "Still showing old version"

**Solution: Force redeploy on Vercel**

1. Go to: https://vercel.com/dashboard
2. Find your project: "ortomio-pro"
3. Click "Deployments"
4. Click the three dots on the latest deployment
5. Click "Redeploy"
6. Wait for deployment to complete
7. Clear browser cache
8. Try again

---

## 📸 Screenshots to Verify

### What You Should See - Olive Page

**Before clicking "Gestione Completa":**
```
┌─────────────────────────────────────────────────┐
│ 🫒 Gestione Oliveto                             │
│                                                  │
│ [📊 Panoramica] [⚙️ Gestione Completa] [👥 Olivi]│
│                                                  │
│ (List of olive trees...)                        │
└─────────────────────────────────────────────────┘
```

**After clicking "Gestione Completa":**
```
┌─────────────────────────────────────────────────┐
│ 🫒 Gestione Oliveto                             │
│                                                  │
│ [📊 Panoramica] [⚙️ Gestione Completa] [👥 Olivi]│
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ [📊 Gestione] [🫒 Maturazione] [🐛 Mosca]   │ │
│ │ [🧮 Densità]                                 │ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ (Dashboard content with tasks, weather, etc.)   │
└─────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

Use this checklist to verify everything works:

### Olive Grove
- [ ] Navigate to `/app/olives`
- [ ] See 3 buttons at top right
- [ ] Click "Gestione Completa"
- [ ] See 4 tabs appear
- [ ] Click "Maturazione" tab
- [ ] See Olive Maturity Tracker component
- [ ] Click "Mosca Olearia" tab
- [ ] See Olive Fly Monitor component
- [ ] Click "Calcolo Densità" tab
- [ ] See Density Calculator component

### Vineyard
- [ ] Navigate to `/app/vineyard`
- [ ] Select or create a vineyard
- [ ] Click "Gestione Completa" in navigation
- [ ] See 4 tabs appear
- [ ] Click "Carico Gemme" tab
- [ ] See Ravaz Index Calculator component
- [ ] Click "Maturazione" tab
- [ ] See Grape Maturity Tracker component
- [ ] Click "Calcolo Densità" tab
- [ ] See Density Calculator component

### Orchard
- [ ] Navigate to `/app/orchard`
- [ ] See 3 tabs at top
- [ ] Click "Calcolo Densità" tab
- [ ] See Density Calculator component
- [ ] Click "Resa per Pianta" tab
- [ ] See Yield Per Tree Tracker component

---

## 🎯 Quick Test: Try Adding Data

### Test Olive Maturity Tracker
1. Go to Olive page → Gestione Completa → Maturazione tab
2. Click "Nuova Lettura" button
3. Enter Jaén Index: `2.8`
4. Select color stage: `3 - Rosso-violaceo`
5. Add note: "Test reading"
6. Click "Salva Lettura"
7. ✅ Should see new reading in history

### Test Ravaz Index Calculator
1. Go to Vineyard page → Gestione Completa → Carico Gemme tab
2. Enter pruning weight: `0.8` kg
3. Enter grape yield: `4.5` kg
4. Click "Calcola Indice di Ravaz"
5. ✅ Should see result: 5.63 (Optimal)

### Test Density Calculator
1. Go to any page with Calcolo Densità tab
2. Enter row spacing: `4` m
3. Enter plant spacing: `2` m
4. Click "Calcola Densità"
5. ✅ Should see result: 1,250 plants/hectare

---

## 📞 Need Help?

If you still can't see the features after following this guide:

1. **Take screenshots** of:
   - The page you're on
   - The buttons/tabs you see
   - Any error messages in console

2. **Share details**:
   - Which page (Olive/Vineyard/Orchard)
   - What you clicked
   - What you expected to see
   - What you actually see

3. **Check deployment**:
   - Go to Vercel dashboard
   - Verify latest deployment is live
   - Check deployment logs for errors

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ You can navigate to all 3 pages (Olive, Vineyard, Orchard)
✅ You can access the management dashboards
✅ You can see and click all tabs
✅ Each tab shows a different component
✅ Components have forms and buttons
✅ You can add sample data
✅ Components show helpful guides and tips
✅ Everything is responsive on mobile

---

**Testing Date**: January 19, 2026
**Status**: Ready for User Testing
**All Features**: Implemented and Verified ✅
