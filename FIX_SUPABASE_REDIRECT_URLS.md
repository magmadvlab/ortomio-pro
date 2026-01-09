# 🔧 FIX SUPABASE REDIRECT URLs - Reset Password

## 🚨 **PROBLEMA IDENTIFICATO**

Il reset password di Supabase sta inviando il codice alla root `/` invece che alla route corretta, causando errore 404.

**Errore ricevuto:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Cannot GET /?code=1fb99ce7-9f71-488e-ac7c-38e85612085d"
}
```

## ✅ **SOLUZIONI APPLICATE**

### **1. Route Handler per Root (✅ FATTO)**
- Creato `app/page.tsx` che intercetta i codici di reset
- Reindirizza automaticamente a `/auth/callback`

### **2. Callback Handler Migliorato (✅ FATTO)**
- Aggiornato `app/auth/callback/route.ts` per gestire reset password
- Rileva automaticamente se è un reset password e reindirizza a `/reset-password`

## 🔧 **CONFIGURAZIONE SUPABASE ONLINE RICHIESTA**

### **Vai su Supabase Dashboard**

1. **Apri il tuo progetto** su [supabase.com](https://supabase.com)
2. **Authentication** → **Settings** → **URL Configuration**

### **Configura Site URL**
```
Site URL: https://ortomio-pro.vercel.app
```

### **Configura Redirect URLs**
Aggiungi TUTTI questi URL nella lista **Redirect URLs**:

```
https://ortomio-pro.vercel.app/auth/callback
https://ortomio-pro.vercel.app/
https://ortomio-pro.vercel.app/reset-password
https://ortomio-pro.vercel.app/confirm
https://ortomio-pro.vercel.app/verify-email
```

### **Configura Additional Redirect URLs (se presente)**
```
https://ortomio-pro.vercel.app/**
```

## 🎯 **FLUSSO RESET PASSWORD CORRETTO**

### **Dopo la configurazione:**

1. **Utente richiede reset** → Email inviata con link
2. **Link contiene code** → `https://ortomio-pro.vercel.app/?code=xxx`
3. **Root page intercetta** → Reindirizza a `/auth/callback?code=xxx`
4. **Callback handler** → Scambia code per session
5. **Rileva reset password** → Reindirizza a `/reset-password?access_token=xxx&refresh_token=xxx`
6. **Reset page** → Utente imposta nuova password

## 🔍 **VERIFICA CONFIGURAZIONE**

### **Test 1: Site URL**
```bash
curl -I https://ortomio-pro.vercel.app/
# Dovrebbe restituire 200 OK
```

### **Test 2: Callback Route**
```bash
curl -I https://ortomio-pro.vercel.app/auth/callback
# Dovrebbe restituire 302 (redirect)
```

### **Test 3: Reset Password**
1. Vai su `/forgot-password`
2. Inserisci email
3. Controlla email ricevuta
4. Il link dovrebbe funzionare senza errori 404

## 🚨 **SE CONTINUA A NON FUNZIONARE**

### **Verifica Environment Variables su Vercel**

1. **Vercel Dashboard** → Il tuo progetto → **Settings** → **Environment Variables**
2. Controlla che siano configurate:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Forza Redeploy**

```bash
# Dopo aver configurato Supabase, forza un nuovo deploy
git commit --allow-empty -m "Force redeploy after Supabase config"
git push
```

## 📞 **DEBUG AVANZATO**

### **Controlla Logs Vercel**
1. **Vercel Dashboard** → **Functions** → **View Function Logs**
2. Cerca errori durante il callback

### **Controlla Logs Supabase**
1. **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Verifica che i redirect siano configurati correttamente

### **Test Locale**
```bash
# Testa in locale per confrontare
npm run dev
# Vai su localhost:3002/forgot-password
# Il reset dovrebbe funzionare perfettamente
```

## 🎯 **RISULTATO ATTESO**

Dopo la configurazione:
- ✅ Reset password funziona senza errori 404
- ✅ Email confirmation funziona
- ✅ Tutti i flussi di autenticazione funzionano
- ✅ Nessun errore "Cannot GET /?code=xxx"

---

**⚠️ IMPORTANTE**: La configurazione dei redirect URL su Supabase è CRITICA per il funzionamento dell'autenticazione in produzione.

**🎯 PROSSIMO PASSO**: Configura i redirect URL su Supabase Dashboard e testa il reset password.