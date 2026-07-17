# OrtoMio — API capability matrix

- Data rilevazione: 16 luglio 2026
- Baseline: `cc5f99f26c7f1d9d75e83759d547f7802046184e`
- Ambito: tutti i file `app/api/**/route.ts`
- Verifica inventario: `npm run audit:p0`

## Regole di lettura

La colonna `Classe` descrive il contratto richiesto, non certifica che il controllo sia gia implementato. Le classi ammesse sono `public`, `authenticated`, `admin`, `cron` e `device`. `Service role` indica che la route puo usare credenziali privilegiate e deve quindi ripetere server-side ownership e scope. `Rate limit` distingue il controllo osservato (`presente`) dal requisito da introdurre in P1 (`richiesto`).

## Matrice completa

| Route | Metodi | Classe | Risorsa e ownership richiesta | Service role | Rate limit | Stato rilevato e test minimo |
|---|---|---|---|---|---|---|
| /api/admin/auth-users | GET, POST | admin | utenti Auth; ruolo admin dalla sessione | si | richiesto | Guardia admin presente; test non-admin 403 e resend auditato |
| /api/advice/free | POST | public | catalogo consigli statico; nessuna ownership | no | richiesto | Pubblica senza limite; test payload invalido e abuso |
| /api/ai/chat | POST | authenticated | profilo e crediti dell'utente di sessione | si | richiesto | `verifyTier`; test 401, tier e consumo crediti |
| /api/ai/diagnose | POST | authenticated | profilo e crediti dell'utente di sessione | si | richiesto | `verifyTier`; test 401 e nessun cross-user |
| /api/ai/predictions | POST, GET | authenticated | garden appartenente all'utente/organizzazione | indiretto | richiesto | Nessuna guardia; test garden altrui 403/404 |
| /api/ai/recipe | POST | authenticated | profilo e crediti dell'utente di sessione | si | richiesto | `verifyTier`; test 401 e consumo atomico |
| /api/ai/suggestions | GET, POST | authenticated | `user_id` dalla sessione e garden autorizzato | si | richiesto | Accetta `user_id` client; test spoofing GET/POST |
| /api/analytics/professional | GET | authenticated | statistiche dell'utente di sessione | si | richiesto | `verifyTier` e filtro user; test 401/cross-user |
| /api/api-configurations/[serviceType] | GET | authenticated | configurazione provider dell'utente | si | richiesto | `verifyTier`; test secret redatti e cross-user |
| /api/api-configurations | GET, POST | authenticated | configurazioni provider dell'utente | si | richiesto | `verifyTier`; test ownership e cifratura/redazione |
| /api/auth/register | POST | public | nuova identita; nessuna risorsa preesistente | anon | presente provider | Supabase signup; test rate/captcha/errori neutrali |
| /api/blockchain/consumer | GET, POST | authenticated | record demo legati a garden/prodotto autorizzato | no, memoria | richiesto | Nessuna guardia; test accesso anonimo e dati demo isolati |
| /api/blockchain/nft | POST | authenticated | garden/prodotto autorizzato | no, memoria | richiesto | Nessuna guardia; test garden altrui e flag simulazione |
| /api/blockchain/record | POST | authenticated | garden/pianta autorizzati | no, memoria | richiesto | Nessuna guardia; test spoofing garden e write demo |
| /api/blockchain/traceability | GET | authenticated | garden autorizzato | no, memoria | richiesto | Nessuna guardia; test garden altrui |
| /api/calendar/tasks | GET, POST, PATCH, DELETE | authenticated | task dell'utente e garden autorizzato | si | richiesto | Usa `user_id` client/TODO auth; test spoofing per ogni metodo |
| /api/challenges/complete | POST, GET | authenticated | challenge e profilo dell'utente di sessione | si | richiesto | Usa `user_id` client; test spoofing e doppia assegnazione |
| /api/challenges/convert-to-tasks | POST | authenticated | challenge utente e garden autorizzato | si | richiesto | Usa `user_id` client; test cross-user e idempotenza |
| /api/credits/deduct | POST | authenticated | saldo dell'utente di sessione | si | richiesto | `verifyTier`; test spoofing, atomicita e saldo insufficiente |
| /api/credits/status | GET | authenticated | saldo dell'utente di sessione | si | richiesto | `verifyTier`; test 401/cross-user |
| /api/cron/daily-challenge | GET | cron | job globale; secret cron e anti-replay | si | richiesto | Bearer `CRON_SECRET`; test secret assente/errato |
| /api/cron/daily-diary | GET, POST | cron | job diario globale; secret cron e anti-replay | si | richiesto | GET verifica secret, POST da consolidare; test entrambi i metodi |
| /api/cron/germination-check | GET | cron | task globali; secret cron e anti-replay | si | richiesto | Bearer `CRON_SECRET`; test 401 |
| /api/cron/health-check | GET, POST | cron | controlli salute globali; secret cron | si | richiesto | Verifica secret presente; test GET/POST e replay |
| /api/cron/reset-credits | GET | cron | profili globali; secret cron | si | richiesto | Bearer `CRON_SECRET`; test 401 e idempotenza |
| /api/cron/task-reminders | GET | cron | task globali; secret cron | si | richiesto | Verifica secret; test 401 e deduplica notifiche |
| /api/cron/weather-alerts | GET | cron | garden globali; secret cron | si | richiesto | Bearer `CRON_SECRET`; test 401 e deduplica |
| /api/cron/weekly-photo-reminders | GET | cron | piante globali; secret cron | si | richiesto | Verifica secret; test 401 e deduplica |
| /api/docs/manual/[slug] | GET | public | capitolo manuale allowlisted; nessuna ownership | no | non necessario | Pubblica; test path traversal, slug assente e cache |
| /api/drone/auto-plan | POST | authenticated | garden autorizzato; risultato marcato simulato | no, memoria | richiesto | Nessuna guardia; test garden altrui e provenance demo |
| /api/drone/execute | POST | authenticated | piano appartenente a garden autorizzato | no, memoria | richiesto | Nessuna guardia; test piano altrui e simulazione |
| /api/drone/flight-plans | GET, POST | authenticated | piani del garden autorizzato | no, memoria | richiesto | Nessuna guardia; test GET/POST cross-garden |
| /api/export/csv | GET | authenticated | dataset dell'utente/garden autorizzato | si | richiesto | `verifyTier`; bypass restituisce demo; test provenance e cross-user |
| /api/export/pdf | GET | authenticated | dataset dell'utente/garden autorizzato | si | richiesto | `verifyTier`; output non e PDF reale; test formato e ownership |
| /api/garden/sun-exposure/plant-suggestions | GET | authenticated | garden dell'utente di sessione | si | richiesto | `verifyTier` e filtro ownership; test garden altrui |
| /api/garden/sun-exposure/planting-windows | POST | authenticated | garden dell'utente di sessione | si | richiesto | `verifyTier` e filtro ownership; test garden altrui |
| /api/garden/sun-exposure | GET, POST, PUT | authenticated | garden dell'utente di sessione | si | richiesto | `verifyTier` e filtro ownership; test tutti i metodi |
| /api/garden/sun-exposure/seasonal-windows | POST | authenticated | garden dell'utente di sessione | si | richiesto | `verifyTier` e filtro ownership; test garden altrui |
| /api/iot/devices/command | POST | authenticated | device e garden dell'utente/organizzazione | si | richiesto | `verifyTier`; test device altrui e stato comando |
| /api/iot/devices/telemetry | POST | device | device risolto da credenziale webhook dedicata | si | richiesto | Secret dedicato presente; test assente/errato e device ignoto |
| /api/iot/telemetry | POST | device | device registrato e credenziale device-specific | provider | richiesto | Nessuna autenticazione, token provider globale; test 401 |
| /api/mechanical-work | GET, POST | authenticated | registri dell'utente e garden autorizzato | si | richiesto | `verifyTier`, filtro user; test garden altrui |
| /api/ndvi/config-status | GET | admin | stato provider senza esposizione secret | no | richiesto | Nessuna guardia; test non-admin 403 e redazione |
| /api/ndvi/save-credentials | POST | admin | credenziali provider gestite fuori dal filesystem runtime | filesystem | richiesto | Nessuna guardia e write `.env.local`; test disabilitazione produzione |
| /api/ndvi/sentinel | POST | authenticated | garden/area autorizzati e quota provider | provider | richiesto | Nessuna guardia; test 401, scope garden e provider failure |
| /api/ndvi/setup-credentials | POST | admin | setup provider fuori dal runtime applicativo | processo | richiesto | Nessuna guardia/esegue setup; test 404 in produzione |
| /api/plants/search | POST | public | tassonomia/catalogo pubblico | no | richiesto | Pubblica; test input, payload massimo e abuse limit |
| /api/plants/taxonomy/[plantId] | GET | public | tassonomia/catalogo pubblico | no | non necessario | Pubblica; test id non valido/assente |
| /api/public-contract | GET | authenticated | metadati capability per utente con tier | si | richiesto | `verifyTier`; contratto contiene endpoint non presenti; test coerenza |
| /api/sensors/readings | POST | authenticated | garden dell'utente di sessione | si | presente in-memory | `verifyTier`, ownership e 100/min/garden; test multi-instance da aggiungere |
| /api/support/submit | POST | public | nuova richiesta supporto; nessuna ownership | si | richiesto | Pubblica, upload/fallback; test abuso, dimensioni e PII |
| /api/test | GET | admin | diagnostica; disabilitata fuori development | no | richiesto | Pubblica oggi; test 404/disabled in produzione |
| /api/treatments | GET, POST | authenticated | trattamenti dell'utente e garden autorizzato | si | richiesto | `verifyTier`, filtro user; test garden altrui |

## Riepilogo P0

- 53 file route classificati, pari al 100% dei file rilevati.
- 69 handler HTTP dichiarati.
- Le lacune indicate non vengono corrette in P0: sono input vincolante per P1.
- Le route con service role non possono affidarsi alla sola RLS; devono verificare ownership prima di ogni query o write.
- I rate limit applicativi risultano espliciti soltanto su `/api/sensors/readings`; i limiti provider di Supabase Auth non coprono AI, supporto, export, NDVI, cron o device.
