# Ripristino "orto di Rob" - 14 Gennaio 2026

## Situazione

**Utente**: magmadvlab@gmail.com (ID: `73317116-7df0-4c34-a1f7-d2828a92ac39`)  
**Problema**: L'orto "orto di Rob" non appare nell'app Vercel  
**Data screenshot**: 12 gennaio 2026 (l'orto esisteva!)  
**Backup disponibile**: `database_backups/ortomio_backup_20260112_103611.sql`

## Diagnosi

1. ✅ Utente esiste nel database remoto (creato 8 gennaio 2026)
2. ✅ Database remoto configurato correttamente in `.env.local`
3. ❓ L'orto potrebbe essere stato cancellato o non sincronizzato
4. ❓ Vercel potrebbe non avere le variabili d'ambiente corrette

## Verifica Variabili Vercel

Le variabili d'ambiente su Vercel devono essere:

```
NEXT_PUBLIC_SUPABASE_URL=https://qhmujoivfxftlrcrluaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobXVqb2l2ZnhmdGxyY3JsdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzAzOTIsImV4cCI6MjA4MTM0NjM5Mn0.lRzjMzXLJ5XOmDmC62FaJCYtz4689VSDKLNesqaQ2FY
```

### Come Verificare su Vercel

1. Vai su https://vercel.com/magmadvlab/ortomio-pro
2. Settings → Environment Variables
3. Verifica che `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` siano configurate
4. Se mancano, aggiungile e fai redeploy

## Opzione 1: Ripristino da Backup (se l'orto è stato cancellato)

```bash
# 1. Connettiti al database remoto Supabase
# 2. Esegui query per verificare se l'orto esiste:

SELECT * FROM gardens WHERE user_id = '73317116-7df0-4c34-a1f7-d2828a92ac39';

# 3. Se non esiste, ripristina dal backup:
# - Apri database_backups/ortomio_backup_20260112_103611.sql
# - Cerca la sezione gardens per l'utente
# - Esegui l'INSERT per ricreare l'orto
```

## Opzione 2: Verifica RLS Policies

Il problema potrebbe essere nelle Row Level Security policies di Supabase:

```sql
-- Verifica policies sulla tabella gardens
SELECT * FROM pg_policies WHERE tablename = 'gardens';

-- Se necessario, aggiungi policy per lettura:
CREATE POLICY "Users can read own gardens"
ON gardens FOR SELECT
USING (auth.uid()::text = user_id);
```

## Opzione 3: Debug Locale

```bash
# Avvia l'app in locale e verifica i log
npm run dev

# Apri browser console e cerca errori di caricamento gardens
# Verifica che getSupabaseClient() stia usando il database remoto
```

## Query Utili per Debug

```sql
-- Verifica utente
SELECT * FROM auth.users WHERE email = 'magmadvlab@gmail.com';

-- Verifica profilo utente
SELECT * FROM user_profiles WHERE id = '73317116-7df0-4c34-a1f7-d2828a92ac39';

-- Verifica orti
SELECT * FROM gardens WHERE user_id = '73317116-7df0-4c34-a1f7-d2828a92ac39';

-- Verifica piante nell'orto (se l'orto esiste)
SELECT g.name as garden_name, COUNT(p.id) as plant_count
FROM gardens g
LEFT JOIN plants p ON p.garden_id = g.id
WHERE g.user_id = '73317116-7df0-4c34-a1f7-d2828a92ac39'
GROUP BY g.id, g.name;
```

## Prossimi Passi

1. ✅ Revert commit wizard (fatto)
2. ⏳ Verifica variabili Vercel
3. ⏳ Query database per verificare se orto esiste
4. ⏳ Se non esiste, ripristina da backup
5. ⏳ Verifica RLS policies
6. ⏳ Test su Vercel

## Note

- Il backup del 12 gennaio contiene sicuramente l'orto "orto di Rob"
- L'utente ha fatto login il 14 gennaio alle 17:01 (last_sign_in_at)
- L'app mostra "Online" quindi l'autenticazione funziona
- Il problema è specifico al caricamento dei gardens

---

**Azione Immediata**: Verificare su Supabase Dashboard se l'orto esiste nel database remoto
