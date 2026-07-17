# OrtoMio — P0 baseline inventory

- Rilevazione: 16 luglio 2026
- Branch: `codex/ortomio-p0-baseline`
- Commit sorgente: `cc5f99f26c7f1d9d75e83759d547f7802046184e`
- Comando di coerenza: `npm run audit:p0`

## 1. Baseline riproducibile

Il controllo locale enumera route API, metodi HTTP, pagine prodotto e migrazioni, quindi confronta route e pagine con i due inventari P0. Deve fallire quando il codice aggiunge o rimuove una superficie senza aggiornare la documentazione.

```bash
npm run audit:p0
npm run type-check
npm run test:precision-hub
npm run build
git diff --check
```

Conteggi congelati:

- 53 file `app/api/**/route.ts`;
- 69 handler HTTP esportati;
- 41 file `app/app/**/page.tsx`;
- 113 migrazioni `.sql` locali;
- 140 pagine statiche/dinamiche generate dalla build iniziale.

## 2. Inventario route prodotto e navigazione

Il layout realmente montato usa `ProfessionalSidebar` su desktop e come drawer mobile, piu `MobileBottomNav`. `FreeSidebar` e `MobileMenu` contengono descriptor alternativi ma non sono importati dal layout corrente: le loro voci non costituiscono esposizione reale. `Diretta` indica che la pagina esiste ed e raggiungibile conoscendo l'URL; non certifica autenticazione server-side.

| Route | Pagina | Sidebar/drawer montato | Bottom mobile | Esposizione |
|---|---|---|---|---|
| /app | Dashboard | si | si | diretta e chrome |
| /app/admin | Admin | si, ma basato sul tier PRO | no | diretta e chrome; ruolo da correggere in P1/P2 |
| /app/advice | Consigli | si | no | diretta e chrome |
| /app/ai-predictions | Predizioni AI | no | no | diretta soltanto |
| /app/almanacco | Almanacco | no | no | diretta soltanto |
| /app/analytics | Analytics | si | no | diretta e chrome |
| /app/calendar | Calendario | no | no | diretta soltanto |
| /app/certifications | Certificazioni | si | no | diretta e chrome |
| /app/compare | Confronto | no | no | diretta soltanto |
| /app/compare/detailed | Confronto dettagliato | no | no | sottoroute diretta |
| /app/diary | Diario | no | no | diretta soltanto |
| /app/export | Export | si | no | diretta e chrome |
| /app/farm | Centro operativo | si | si | diretta e chrome |
| /app/garden | Appezzamenti | si | si | diretta e chrome |
| /app/garden/rows | Filari | no | no | sottoroute del garden |
| /app/garden/rows/edit | Modifica filare | no | no | sottoroute del garden |
| /app/garden/zones | Zone garden | no | no | sottoroute del garden |
| /app/harvest | Raccolta | no | no | diretta soltanto |
| /app/health | Salute | si | no | diretta e chrome |
| /app/help | Manuale | si | no | diretta e chrome |
| /app/irrigation | Irrigazione | si | no | diretta e chrome |
| /app/journal | Journal | no | no | diretta soltanto; duplicazione con diario da decidere |
| /app/mechanical-work | Lavorazioni | si | no | diretta e chrome |
| /app/ndvi | NDVI | si | no | diretta e chrome |
| /app/nutrition | Nutrizione e trattamenti | si | no | diretta e chrome |
| /app/olives | Oliveto | si | no | diretta e chrome |
| /app/orchard | Frutteto | si | si | diretta e chrome |
| /app/pianifica | Pianifica legacy | no | no | diretta soltanto |
| /app/planner | Planner AI | si | si | diretta e chrome |
| /app/planner-classic | Piano colturale | si | no | diretta e chrome |
| /app/plants | Piante | no | no | diretta soltanto |
| /app/prescription-maps | Mappe prescrizione | si | no | diretta e chrome |
| /app/reports | Report | no | no | diretta soltanto |
| /app/satellite-config | Configurazione satellite | no | no | diretta soltanto |
| /app/semenzaio | Semenzaio | no | no | diretta soltanto; presente solo nel sidebar non montato |
| /app/settings | Impostazioni | si | si | diretta e chrome |
| /app/smart | Smart Hub | si | no | diretta e chrome |
| /app/smart-simple | Smart semplice | no | no | diretta soltanto |
| /app/treatments | Trattamenti | no | no | diretta soltanto |
| /app/vineyard | Vigneto | si | no | diretta e chrome |
| /app/zones | Zone legacy | no | no | diretta soltanto |

Risultato: 21 route hanno una voce esatta nella sidebar montata, 6 nel bottom mobile e 20 sono raggiungibili soltanto in modo diretto o da flussi interni. Il conteggio e la divergenza alimentano P2; P0 non modifica ancora il chrome.

## 3. Mappa dati per dominio

| Dominio | Tabelle remote principali | Writer/reader principali | Stato P0 |
|---|---|---|---|
| Diario | `daily_diary_entries`, `daily_weather_log`, `cultivation_daily_tracking`, `diary_events`, `agronomic_decision_ledger_entries`, `agronomic_queue_outcomes` | `dailyDiaryService`, `operationalDiaryService`, `unifiedAgronomicMemoryService`, route cron diario | Persistenza e memoria convivono; convergenza rinviata a P3 |
| Piante | `garden_plants`, `planting_batches`, `plant_photos`, `plant_operations`, `plant_harvests`, `treatment_tracking`, `brix_history`, `phenology_observations` | storage provider, `plantMonitoringService`, `plantLifecycleService`, `unifiedOperationsService` | DB e store browser convivono; ownership da P1/P3 |
| Suolo | `land_zones`, `soil_analysis`, `soil_memory`, `garden_zone_memories`, `garden_tree_memories` | storage provider, resolver contesto garden, memoria agronomica | Schema remoto presente e RLS attiva |
| Trattamenti e nutrizione | `treatment_register`, `treatment_registry`, `treatment_history`, `treatment_products`, `nutrition_treatments`, `nutrition_schedules`, `mechanical_work_register` | API treatments/mechanical, `advancedNutritionService`, `treatmentRegistryService`, storage provider | Writer multipli e filtri non uniformi; P3/P4 |
| Device e sensori | `smart_devices`, `smart_device_automation_logs`, `sensor_readings`, `irrigation_sensors` | API IoT, `sensorDataService`, `smartDeviceService`, adapter provider | Due endpoint telemetry con contratti diversi; P1/P4 |
| Certificazioni | `certifications`, `certification_documents`, `bio_certifications`, `bio_certification_documents`, `bio_certification_inspections`, tabelle `globalgap_*`, `organic_certifications` | servizi BIO/GlobalG.A.P. e dashboard certificazioni | RLS presente sulle tabelle core; audit CRUD/evidence in P7 |
| Export | legge `professional_analytics`, `treatment_register`, garden/task e registri operativi | pagina Export, `exportService`, API CSV/PDF | Nessuna tabella export canonica; PDF API oggi non produce PDF binario |

## 4. Confronto schema locale e remoto

### 4.1 Backend rilevati

- Il factory `auto` preferisce Neon quando `DATABASE_URL` esiste.
- La connessione runtime configurata raggiunge Neon in `eu-central-1`, database `neondb`, PostgreSQL `18.4`.
- Auth e diverse API privilegiate continuano a usare Supabase tramite `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
- Il checkout e collegato al progetto Supabase `ortomiopro` (`qhmujoivfxftlrcrluaj`).
- `supabase/config.toml` dichiara PostgreSQL major `17`, diverso dal major `18` del Neon raggiunto.

Il sistema e quindi ibrido: lo schema Neon raggiungibile non dimostra automaticamente lo schema del progetto Supabase usato da auth/API.

### 4.2 Oggetti locali contro Neon

Il confronto statico delle 113 migrazioni rileva 212 tabelle `CREATE TABLE`; Neon espone 207 tabelle `public`.

Presenti nelle migrazioni ma assenti su Neon:

- `crop_gdd_accumulations`;
- `plant_lifecycle_events`;
- `planting_plans`;
- `profiles_backup_20260104` (backup storico, non runtime);
- `winter_protection_checklists`;
- `winter_protection_tasks`.

Presente su Neon ma non dichiarata dalle migrazioni:

- `playing_with_neon`.

Neon non contiene `supabase_migrations.schema_migrations`; non e quindi possibile dimostrare l'ordine applicato confrontando una migration history. Il confronto P0 e un confronto di oggetti, non una falsa equivalenza di history.

### 4.3 RLS e policy su Neon

- 207 tabelle `public`;
- 197 tabelle con RLS abilitata;
- 423 policy;
- 10 tabelle senza RLS: `crop_archetypes`, `crop_profiles`, `crop_varieties_database`, `machinery_compatibility`, `ndvi_data_cache`, `plant_families`, `plant_rules`, `plant_synonyms`, `plant_taxonomy`, `playing_with_neon`.

Le tabelle catalogo possono essere intenzionalmente leggibili, ma la decisione deve diventare esplicita in P1. `ndvi_data_cache` e `playing_with_neon` richiedono classificazione/rimozione.

## 5. Security baseline e remediation register

La CLI Supabase termina con HTTP `403` (`LegacyDbConfigLoginRoleStatusError`) sull'endpoint di gestione. La dashboard autenticata ha tuttavia consentito di completare l'export ufficiale in [`../security/SUPABASE_SECURITY_ADVISOR_2026-07-16.md`](../security/SUPABASE_SECURITY_ADVISOR_2026-07-16.md): 6 errori, 70 warning e 2 suggerimenti. La baseline SQL Neon resta separata, perche i due backend mostrano drift effettivo.

| Finding riproducibile | Evidenza | Remediation assegnata |
|---|---|---|
| Security definer view su Supabase | 6 errori ufficiali | P1: ricreare con `security_invoker`, applicare e rieseguire advisor |
| RPC `SECURITY DEFINER` eseguibili | 60 warning su 30 funzioni | P1: revoche/grant minimi o conversione invoker, con audit RPC/trigger |
| Search path mutabile su Supabase | 9 warning | P1: fissare `search_path` e qualificare gli oggetti |
| Password leak protection disabilitata | 1 warning Auth | P1: abilitare e testare registrazione/reset |
| RLS senza policy su ledger | 2 suggerimenti | P1: policy ownership oppure deny-by-default service-role documentato |
| Tabelle senza RLS | 10 su 207 | P1: classificare cataloghi pubblici, abilitare RLS o rimuovere oggetti non runtime |
| Funzioni `SECURITY DEFINER` senza `search_path` fissato | 31 funzioni `public` | P1: migrazioni additive con `SET search_path` minimo e test invocante/invocato |
| View senza `security_invoker=true` | 13 su 19 view | P1: verificare ownership delle view e convertire dove applicabile |
| Foreign key senza indice iniziale corrispondente | 71 | P1/P8: verificare query reali e aggiungere indici additivi prioritari, evitando indici inutili |
| Drift oggetti locale/Neon | 6 mancanti, 1 extra | P3/P8: decidere canonicita, migrazione/retiro e rollout da snapshot |
| Major DB divergente | config locale 17, Neon 18.4 | P8: allineare ambiente shadow/staging al major produttivo |

## 6. Riconciliazione task e piani storici

- Il vecchio master index del 19 aprile resta utile come registro storico di gap, ma non e piu l'entrypoint esecutivo: e sostituito dal piano P0-P9 del 16 luglio.
- Il piano giugno `component-quality` e implementato e integrato nei merge/commit `99875ba`, `dc07a12`, `57bd7a8`, `6de2b89`, `92e07f0`, merge PR `afff1b7`.
- Il piano giugno `storage-provider-integrity` e implementato e integrato nei commit `6066cb1`, `3667c3f`, `2b26649`, `d4e6e0e`, merge PR `456e169`.
- Il piano `service-logic-correctness` e solo parzialmente implementato: risultano commit per typing, `getBedIdForRow`, `QuotaExceededError` e lineage, mentre il percorso `getPlantMonitoringDashboard(..., gardenId ?? '')` conserva un residuo. Il piano non resta una coda parallela: i residui sono assorbiti da P3/P5.
- Il vecchio backlog “creare PR da `codex/agronomic-context-refinement`” e superato: la PR e stata integrata in `main` con merge `8e88136`.
- Cleanup massivi di Markdown e decomposizioni UI restano fuori dalla release P0-P9 salvo impatto diretto sui gate.

## 7. Evidenze dei gate

| Controllo | Esito P0 | Evidenza |
|---|---|---|
| `npm run audit:p0` | verde | 53 API, 69 metodi, 41 pagine, 113 migrazioni; documenti allineati |
| `npm run type-check` | verde | nessun errore TypeScript |
| `npm run test:precision-hub` | verde | 228 test superati, 0 falliti |
| `npm run build` | verde | Next 16.1.1, 140/140 pagine generate |
| `git diff --check` | verde | nessun errore whitespace sui file P0 |

## 8. Criterio di uscita P0

- API: inventario completo e controllato automaticamente.
- UI: tutte le 41 page route inventariate contro il chrome realmente montato.
- Dati: domini core mappati a tabelle e writer/reader.
- Remoto: Neon identificato e confrontato; natura ibrida Supabase/Neon esplicitata.
- Sicurezza: baseline SQL salvata ed export ufficiale Security Advisor associato alle remediation P1.
- Storico: task e piani giugno riconciliati senza mantenere code concorrenti.
- Gate: P0 chiude soltanto dopo l'aggiornamento degli esiti nella sezione 7 e nel piano esecutivo.
