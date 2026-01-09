# Guida Migrazione localStorage → Supabase

## Panoramica

Questa guida spiega come migrare i dati da localStorage (versione Free) a Supabase (versione Pro).

## Prerequisiti

1. Account Supabase configurato

1. Progetto Supabase creato

1. Schema database eseguito (vedi `database/schema.sql`)

1. Credenziali Supabase configurate in `.env`:

   ```text
   VITE_SUPABASE_URL=<https://your-project.supabase.co>
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```text

## Metodo 1: UI Wizard (Raccomandato)

1. Apri l'app

1. Vai alle Impostazioni

1. Clicca su "Migra a Pro"

1. Segui il wizard:
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

```text

### Da Node.js

```typescript
import { migrateLocalToCloud, createBackup } from './scripts/migrateLocalToCloud';

// Backup
const backup = createBackup();
fs.writeFileSync('backup.json', backup);

// Migrazione
const result = await migrateLocalToCloud();
console.log(result);

```text

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

1. Ripristina manualmente:

```javascript
const backup = JSON.parse(localStorage.getItem('ortoBackup_TIMESTAMP'));
localStorage.setItem('ortoGardens', JSON.stringify(backup.gardens));
localStorage.setItem('ortoTasks', JSON.stringify(backup.tasks));
// etc.

```text

## Post-Migrazione

Dopo la migrazione:

- I dati sono sincronizzati automaticamente con Supabase

- localStorage può essere pulito (opzionale)

- Backup consigliato prima di pulire localStorage

