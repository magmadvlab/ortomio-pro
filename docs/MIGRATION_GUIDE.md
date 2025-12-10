# Guida Migrazione localStorage → Supabase

## Panoramica

Questa guida spiega come migrare i dati da localStorage (versione Free) a Supabase (versione Pro).

## Prerequisiti

1. Account Supabase configurato
2. Progetto Supabase creato
3. Schema database eseguito (vedi `database/schema.sql`)
4. Credenziali Supabase configurate in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Metodo 1: UI Wizard (Raccomandato)

1. Apri l'app
2. Vai alle Impostazioni
3. Clicca su "Migra a Pro"
4. Segui il wizard:
   - Preview dati da migrare
   - Clicca "Inizia Migrazione"
   - Attendi completamento
   - Verifica risultati

## Metodo 2: Script Manuale

### Nel Browser Console

```javascript
// 1. Crea backup
const backup = createBackup();
console.log('Backup creato:', backup);

// 2. Esegui migrazione
migrateLocalToCloud().then(result => {
  console.log('Risultato migrazione:', result);
});
```

### Da Node.js

```typescript
import { migrateLocalToCloud, createBackup } from './scripts/migrateLocalToCloud';

// Backup
const backup = createBackup();
fs.writeFileSync('backup.json', backup);

// Migrazione
const result = await migrateLocalToCloud();
console.log(result);
```

## Dati Migrati

- ✅ Gardens (Orti)
- ✅ Garden Tasks (Task e attività)
- ✅ Seed Inventory (Buste semi)
- ⚠️ Smart Devices (attualmente rimangono in localStorage)

## Troubleshooting

### Errore: "User not authenticated"
**Soluzione**: Effettua login in Supabase prima di migrare.

### Errore: "Supabase client not available"
**Soluzione**: Verifica che le credenziali in `.env` siano corrette.

### Dati duplicati dopo migrazione
**Soluzione**: Lo script usa `upsert` quindi i dati esistenti vengono aggiornati. Non ci sono duplicati.

### Perdita dati durante migrazione
**Soluzione**: Il backup viene creato automaticamente. Controlla `localStorage` per chiavi `ortoBackup_*`.

## Rollback

Se qualcosa va storto:

1. Trova il backup in `localStorage` (chiavi `ortoBackup_*`)
2. Ripristina manualmente:
```javascript
const backup = JSON.parse(localStorage.getItem('ortoBackup_TIMESTAMP'));
localStorage.setItem('ortoGardens', JSON.stringify(backup.gardens));
localStorage.setItem('ortoTasks', JSON.stringify(backup.tasks));
// etc.
```

## Post-Migrazione

Dopo la migrazione:
- I dati sono sincronizzati automaticamente con Supabase
- localStorage può essere pulito (opzionale)
- Backup consigliato prima di pulire localStorage

