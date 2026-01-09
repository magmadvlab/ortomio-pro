# ✅ Semplificazione Tier System - Solo PRO

**Data:** 2026-01-04
**Migration:** `20260104100000_simplify_tier_to_pro_only.sql`
**Stato:** COMPLETATO ✅

---

## 🎯 Decisione Architetturale

Questo database supporta **SOLO tier PRO**.

### Motivazione

- **Focus**: Applicazione PRO per professionisti agricoli
- **Semplicità**: Un solo tier elimina complessità e condizioni nel codice
- **Strategia futura**: Tier FREE avrà un **repository separato** con database dedicato

---

## ✅ Modifiche Implementate

### 1. Database Schema

**Prima:**
```sql
CHECK (tier = ANY (ARRAY['FREE'::text, 'PRO_CONSUMER'::text, 'PRO_PROFESSIONAL'::text]))
```

**Dopo:**
```sql
CHECK (tier = 'PRO')
```

**Default:**
```sql
ALTER COLUMN tier SET DEFAULT 'PRO'
```

### 2. Trigger `handle_new_user()`

Aggiornato per creare sempre profili con `tier = 'PRO'`:

```sql
INSERT INTO public.profiles (id, tier, ai_credits_total, ai_credits_used)
VALUES (
  NEW.id,
  'PRO',  -- ⭐ Sempre PRO
  default_credits + welcome_bonus,
  0
);
```

### 3. Credits System

| Tipo Utente | Credits Iniziali | Welcome Bonus | Totale |
|-------------|------------------|---------------|--------|
| **Utente normale** | 3 | 3 | **6** |
| **Superadmin** (roberto.lalinga@gmail.com) | 999999 | 0 | **999999** |

---

## 📊 Stato Attuale

```sql
SELECT tier, COUNT(*) as users
FROM profiles
GROUP BY tier;

-- Risultato:
-- tier | users
-- -----+-------
-- PRO  | 1
```

Tutti i profili hanno tier `PRO`.

---

## 🚧 Codice da Aggiornare (Futuro)

I seguenti file contengono ancora riferimenti ai vecchi tier:

### File Principali

1. **`types.ts`**
   ```typescript
   // PRIMA
   export type UserTier = 'FREE' | 'PRO_CONSUMER' | 'PRO_PROFESSIONAL'

   // DOPO (da implementare)
   export type UserTier = 'PRO'
   ```

2. **`packages/core/context/TierContext.tsx`**
   - Rimuovere logica condizionale per FREE/CONSUMER/PROFESSIONAL
   - Assumere sempre PRO

3. **`app/(marketing)/pricing/page.tsx`**
   - Eliminare la pagina pricing (non serve più scegliere tier)
   - O trasformarla in pagina informativa su feature PRO

4. **`services/freeAdviceService.ts`**
   - Eliminare (non serve più logica per tier FREE)

5. **`components/shared/FreeSidebar.tsx`**
   - Eliminare (solo PRO sidebar)

6. **`components/consumer/Sidebar.tsx`**
   - Eliminare o rinominare in `Sidebar.tsx`

7. **`components/professional/Sidebar.tsx`**
   - Rinominare in `Sidebar.tsx` (unica sidebar)

### Script da Aggiornare

- **`scripts/migrate_tiers.ts`** - Eliminare (non serve più migrazione tier)
- **`scripts/generateAIDatabase.ts`** - Rimuovere riferimenti a tier multipli

### API Routes

- **`app/api/api-configurations/[serviceType]/route.ts`** - Rimuovere check tier
- **`app/api/sensors/readings/route.ts`** - Rimuovere check tier

---

## 🔄 Strategia Migrazione Codice

### Fase 1: Immediate (Done)
- ✅ Database constraint aggiornato
- ✅ Trigger aggiornato
- ✅ Migration applicata

### Fase 2: TypeScript Types
- [ ] Aggiornare `UserTier` type in `types.ts`
- [ ] Rimuovere conditional logic basata su tier
- [ ] Fixare errori di compilazione

### Fase 3: UI Components
- [ ] Eliminare componenti specifici per FREE/CONSUMER
- [ ] Unificare sidebars
- [ ] Rimuovere/aggiornare pricing page

### Fase 4: Services & API
- [ ] Rimuovere `freeAdviceService.ts`
- [ ] Eliminare tier checks in API routes
- [ ] Semplificare auth logic

### Fase 5: Cleanup
- [ ] Eliminare file non più necessari
- [ ] Aggiornare documentazione
- [ ] Commit finale

---

## 🎯 Vantaggi

### Codice Più Semplice
```typescript
// PRIMA
if (tier === 'FREE') {
  return <FreeSidebar />
} else if (tier === 'PRO_CONSUMER') {
  return <ConsumerSidebar />
} else {
  return <ProfessionalSidebar />
}

// DOPO
return <Sidebar />  // ⭐ Sempre PRO
```

### Performance
- ✅ Meno condizioni nel codice
- ✅ Bundle size ridotto (eliminati componenti FREE)
- ✅ Meno query al database (no tier checks)

### Manutenibilità
- ✅ Codice più facile da capire
- ✅ Meno bug legati a tier
- ✅ Onboarding sviluppatori più rapido

---

## 📋 Repository FREE (Futuro)

Quando verrà creato il repo separato per tier FREE:

### Caratteristiche
- **Database**: Separato, solo localStorage o Supabase free tier
- **Features**: Limitate (no AI, no PRO features)
- **UI**: Interfaccia semplificata
- **Deploy**: Dominio separato (es. `free.ortomio.app`)

### Vantaggi Architettura Separata
1. **Scalabilità**: Database PRO non sovraccaricato da utenti FREE
2. **Costi**: FREE users su infra free, PRO users su infra pagata
3. **Marketing**: Clear separation tra FREE e PRO offering
4. **Codice**: Zero overhead per gestire tier nel codice

---

## 🔗 File Correlati

- [Migration SQL](../supabase/migrations/20260104100000_simplify_tier_to_pro_only.sql)
- [types.ts](../types.ts) - Da aggiornare
- [TierContext.tsx](../packages/core/context/TierContext.tsx) - Da semplificare

---

**Conclusione:** Database PRO-only semplificato e pronto. Codice TypeScript da aggiornare in fase successiva.
