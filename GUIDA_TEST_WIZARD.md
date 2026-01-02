# Guida Test Wizard - OrtoMio

**Data**: 2026-01-02
**Stato Attuale**: Orto eliminato, pronto per test wizard

---

## 🎯 Due Wizard Disponibili

### 1. UserOnboardingWizard (7 Step)
**Quando appare**: Al primo accesso o se non completato

**Step**:
1. Welcome
2. Region (Regione Italia)
3. Climate (Clima zona)
4. Experience (Livello esperienza)
5. Goals (Obiettivi coltivazione)
6. Space (Spazio disponibile)
7. Confirmation

**Salvataggio**: `localStorage.setItem('ortomio_user_onboarding_completed', 'true')`

### 2. GardenOnboarding (Configurazione Orto)
**Quando appare**: Dopo UserOnboarding, se non ci sono orti nel database

**Cosa configura**:
- Nome orto
- Tipo orto (terra, aiuole, vasi, idroponica, ecc.)
- Dimensioni
- Sistema coltivazione
- Posizione geografica
- Zone ed esposizione solare

**Salvataggio**: Database Supabase (tabella `gardens`)

---

## ✅ Stato Attuale

- ✅ **Utente loggato**: roberto.lalinga@gmail.com
- ✅ **UserOnboarding**: Completato (salvato in localStorage)
- ✅ **Garden**: 0 orti in database (eliminato per test)

```sql
-- Verifica eseguita
SELECT COUNT(*) FROM gardens WHERE user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708';
-- Risultato: 0
```

---

## 🧪 Test Scenario 1: Solo GardenOnboarding

**Situazione**: Testa solo la creazione orto (UserOnboarding già fatto)

**Passi**:
1. Vai su http://localhost:3002/app
2. Vedrai il **GardenOnboarding** wizard
3. Completa la configurazione orto
4. Verifica salvataggio in database

**Risultato Atteso**: Orto salvato in database, dashboard caricata

---

## 🧪 Test Scenario 2: Entrambi i Wizard

**Situazione**: Testa sia UserOnboarding che GardenOnboarding

**Passi**:
1. Apri Console Browser (F12)
2. Esegui:
   ```javascript
   localStorage.removeItem('ortomio_user_onboarding_completed');
   location.reload();
   ```
3. Vedrai **UserOnboardingWizard** (7 step)
4. Dopo completamento, vedrai **GardenOnboarding**
5. Completa entrambi

**Risultato Atteso**:
- localStorage: `ortomio_user_onboarding_completed = true`
- Database: Nuovo orto creato

---

## 🧪 Test Scenario 3: Creazione Multipli Orti

**Situazione**: Testa la creazione di più orti (feature PRO)

**Passi**:
1. Dopo aver creato primo orto, vai su Dashboard
2. Clicca pulsante **"+ Nuovo Orto"** o simile
3. Vedrai solo **GardenOnboarding** (non UserOnboarding)
4. Completa configurazione secondo orto
5. Verifica entrambi gli orti in dashboard

**Risultato Atteso**: Multiple gardens per stesso user_id

---

## 🔄 Comandi Reset per Test

### Reset Completo (Entrambi Wizard)
```javascript
// Console Browser (F12)
localStorage.removeItem('ortomio_user_onboarding_completed');
location.reload();
```

### Reset Solo Orto (Mantieni UserOnboarding)
```sql
-- Terminale
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "DELETE FROM gardens WHERE user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708';"
```

### Verifica Stato Corrente
```javascript
// Console Browser
console.log('UserOnboarding:', localStorage.getItem('ortomio_user_onboarding_completed'));
```

```sql
-- Terminale
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "SELECT id, name, garden_type, created_at FROM gardens WHERE user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708';"
```

---

## 📊 Verifica Dati Salvati

### Dopo Creazione Orto

```sql
-- Lista orti utente
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "
SELECT
  id,
  name,
  garden_type,
  soil_type,
  size_m2,
  created_at
FROM gardens
WHERE user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708'
ORDER BY created_at DESC;"
```

```sql
-- Dettagli completi orto
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "
SELECT
  name,
  garden_type,
  system_type,
  location,
  latitude,
  longitude,
  climate_zone,
  beds_count,
  zones_count
FROM gardens
WHERE user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708';"
```

### Zone e Aiuole Associate

```sql
-- Zone orto
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "
SELECT gz.*, g.name as garden_name
FROM garden_zones gz
JOIN gardens g ON gz.garden_id = g.id
WHERE g.user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708';"

-- Aiuole orto
psql "postgresql://postgres:postgres@127.0.0.1:54324/postgres" -c "
SELECT gb.*, g.name as garden_name
FROM garden_beds gb
JOIN gardens g ON gb.garden_id = g.id
WHERE g.user_id = 'bb16a1a0-3190-4d3c-b276-cc5bb47aa708';"
```

---

## 🐛 Errori Conosciuti (Non Critici)

Durante i test potresti vedere questi errori **NON BLOCCANTI**:

1. **fertilizer_application_logs** - Tabella non esiste
   - Feature: Auto-scheduling fertilizzazione
   - Impatto: Feature non disponibile
   - Console: HTTP 400

2. **irrigation_systems** - Tabella non esiste
   - Feature: Calcolo task irrigazione automatica
   - Impatto: Feature non disponibile
   - Console: HTTP 400

3. **Historical Weather API** - Errore date future
   - API: Open-Meteo rifiuta date 2026
   - Impatto: Dati storici meteo non disponibili
   - Console: API error

**Nota**: Questi errori NON impediscono:
- ✅ Creazione orti
- ✅ Completamento wizard
- ✅ Salvataggio dati
- ✅ Navigazione app

---

## ✅ Test Checklist

Prima di considerare il test completo, verifica:

- [ ] UserOnboarding completabile (7 step)
- [ ] GardenOnboarding completabile
- [ ] Orto salvato in database
- [ ] Orto visualizzato in dashboard dopo login
- [ ] Possibile creare secondo orto (PRO feature)
- [ ] Dati persistono dopo reload pagina
- [ ] Dati persistono dopo logout/login
- [ ] Backup database funzionante

---

## 🚀 Prossimo Passo

**Ora sei pronto per testare!**

1. **Vai su**: http://localhost:3002/app
2. **Vedrai**: GardenOnboarding wizard (UserOnboarding già fatto)
3. **Completa**: Configurazione orto
4. **Verifica**: Dashboard con orto creato

**Se vuoi testare anche UserOnboarding**:
- Apri Console (F12)
- `localStorage.removeItem('ortomio_user_onboarding_completed'); location.reload();`

---

**Ultimo aggiornamento**: 2026-01-02
**Garden eliminato**: ✅ ortodi rob (per consentire test)
**Stato**: 🧪 PRONTO PER TEST
