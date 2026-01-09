# Pre-Deploy Check Scripts

Script per verificare errori prima di fare commit e deploy.

## 📋 Cosa Verifica

1. **TypeScript**: Verifica errori di tipo
2. **Linter**: Verifica errori di stile e best practices
3. **Build Next.js**: Verifica che il progetto compili correttamente
4. **Schema Database**: Verifica che lo schema sia compatibile con Supabase

## 🚀 Uso

### Opzione 1: Script NPM (Raccomandato)

```bash
# Verifica completa (include build)
npm run pre-deploy

# Verifica veloce (salta build)
npm run pre-deploy:fast
```

### Opzione 2: Script Node.js Diretto

```bash
# Verifica completa
node scripts/pre-deploy-check.js

# Verifica veloce (salta build)
node scripts/pre-deploy-check.js --skip-build
```

### Opzione 3: Script Bash

```bash
# Verifica completa
./scripts/pre-deploy-check.sh

# Verifica veloce (salta build)
./scripts/pre-deploy-check.sh --skip-build
```

## 📝 Integrazione con Git Hooks

Per eseguire automaticamente prima di ogni commit, puoi creare un pre-commit hook:

### Creare Pre-Commit Hook

```bash
# Crea il file .git/hooks/pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run pre-deploy:fast
EOF

# Rendi eseguibile
chmod +x .git/hooks/pre-commit
```

**Nota**: Il hook userà `pre-deploy:fast` per velocità. Per una verifica completa, usa `pre-deploy`.

## ✅ Output

Lo script mostra:
- ✅ **Verde**: Controllo superato
- ❌ **Rosso**: Errore trovato
- ⚠️ **Giallo**: Warning (non blocca)
- ℹ️ **Blu**: Informazioni

## 🔧 Risoluzione Errori

Se lo script trova errori:

1. **TypeScript Errors**:
   ```bash
   npm run type-check
   ```

2. **Linter Errors**:
   ```bash
   npm run lint
   ```

3. **Build Errors**:
   ```bash
   npm run build:next
   ```

4. **Schema Errors**:
   - Verifica che `database_schema_online_reference.sql` usi `gen_random_uuid()` invece di `extensions.uuid_generate_v4()`
   - Verifica che ci siano RLS policies per INSERT su `profiles` e `gardens`

## 📊 Esempio Output

```
========================================
  Pre-Deploy Check - OrtoMio
========================================

[1/4] Verifica TypeScript...
✅ TypeScript: Nessun errore trovato

[2/4] Verifica Linter...
✅ Linter: Nessun errore trovato

[3/4] Verifica Build Next.js...
ℹ️  Questo potrebbe richiedere alcuni minuti...
✅ Build: Compilazione riuscita

[4/4] Verifica Schema Database...
✅ File schema di riferimento trovato
✅ Schema: Usa gen_random_uuid() correttamente
✅ Schema: RLS policies per INSERT presenti

========================================
✅ Tutti i controlli superati! ✅

Pronto per commit e deploy!
```

## ⚙️ Configurazione

Gli script sono configurabili modificando:
- `scripts/pre-deploy-check.js` - Versione Node.js
- `scripts/pre-deploy-check.sh` - Versione Bash

## 🎯 Best Practices

1. **Prima di ogni commit**: Esegui `npm run pre-deploy:fast`
2. **Prima di ogni deploy**: Esegui `npm run pre-deploy` (verifica completa)
3. **In CI/CD**: Aggiungi `npm run pre-deploy` al pipeline

## 🔗 Script Correlati

- `npm run type-check` - Solo verifica TypeScript
- `npm run lint` - Solo verifica Linter
- `npm run build:next` - Solo build
- `npm run check` - TypeScript + Build (senza linter)

