# Checklist Pre-Deploy

## Comandi per Verificare Errori Prima di Deployare

### 1. Type Checking (Verifica errori TypeScript)
```bash
npm run type-check
```
Verifica tutti gli errori di tipo TypeScript senza compilare. Se ci sono errori, vengono mostrati nella console.

### 2. Build Test (Simula produzione)
```bash
npm run build
```
Compila il progetto esattamente come in produzione. Se ci sono errori, il build fallisce e mostra gli errori.

**Nota**: Se vedi errori relativi a `supabaseUrl is required`, significa che le variabili d'ambiente Supabase non sono configurate. Questo è normale in sviluppo locale. Il build dovrebbe comunque completarsi se hai implementato correttamente la gestione lazy di Supabase.

### 3. Check Completo (Type-check + Build)
```bash
npm run check
```
Esegue type-check e build insieme. Usa questo per una verifica completa.

### 4. Sviluppo Locale (Test Interattivo)
```bash
npm run dev
```
Avvia il server di sviluppo su `http://localhost:3002`. 
- Apri il browser e naviga nelle pagine modificate
- Controlla la console del browser (F12) per errori runtime
- Verifica che tutte le funzionalità funzionino correttamente

## Workflow Consigliato Prima di Deployare

### Prima di ogni commit/deploy:

1. **Verifica TypeScript:**
   ```bash
   npm run type-check
   ```
   ✅ Se passa senza errori, continua

2. **Test Build:**
   ```bash
   npm run build
   ```
   ✅ Se il build è riuscito, continua

3. **Test Locale:**
   ```bash
   npm run dev
   ```
   - Apri `http://localhost:3002`
   - Naviga nelle pagine modificate
   - Controlla console browser (F12) per errori
   - Verifica funzionalità principali

4. **Verifica Specifica (se hai modificato una pagina):**
   - Vai direttamente alla pagina modificata
   - Testa tutte le funzionalità
   - Verifica che i dati vengano salvati/caricati correttamente

## Errori Comuni da Controllare

### Errori TypeScript
- ✅ Tutti i tipi sono corretti
- ✅ Nessun `any` non necessario
- ✅ Import corretti

### Errori Runtime
- ✅ Nessun errore nella console del browser
- ✅ Nessun errore 404 per risorse mancanti
- ✅ Nessun errore 500 per API routes

### Errori Build
- ✅ Build completa senza errori
- ✅ Nessun warning critico
- ✅ File statici serviti correttamente

## Quick Check (Verifica Rapida)

Per una verifica rapida prima di commit/deploy:
```bash
npm run check
```

Se questo comando passa senza errori, puoi procedere con sicurezza! 🚀

## Note

- Il comando `npm run check` esegue sia type-check che build
- Se il build fallisce, controlla gli errori nella console
- Gli errori runtime sono visibili solo quando esegui `npm run dev` e apri il browser
- Controlla sempre la console del browser (F12) per errori JavaScript

