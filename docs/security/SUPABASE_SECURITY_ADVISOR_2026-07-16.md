# OrtoMio — Export Security Advisor Supabase

- Data export: 16 luglio 2026
- Progetto: `ortomiopro` (`qhmujoivfxftlrcrluaj`)
- Fonte: dashboard Supabase, Security Advisor
- Totale: 6 errori, 70 warning, 2 suggerimenti
- Destinazione remediation: P1, salvo il controllo password assegnato alla configurazione Auth

La CLI collegata restituisce HTTP `403` sull'endpoint di gestione; l'export e stato quindi letto dalla dashboard autenticata. Questo documento registra i finding visibili, non dichiara alcuna remediation gia applicata.

## Errori — 6

Tutti sono `Security Definer View`. Remediation P1: verificare la definizione remota, ricreare con `security_invoker=true`, rieseguire il linter e aggiungere test cross-user/cross-organization.

- `public.ai_suggestions_prioritized`;
- `public.field_row_rotation_analysis`;
- `public.crop_performance_by_family`;
- `public.agronomic_operation_outcome_projection`;
- `public.agronomic_operation_signal_projection`;
- `public.agronomic_precision_execution_projection`.

Nota di drift: le migrazioni locali piu recenti dichiarano `security_invoker` per varie view, ma il progetto Supabase le segnala ancora come security definer. P1 deve confrontare la definizione remota effettiva prima di applicare patch additive.

## Warning — 70

### Function Search Path Mutable — 9

Remediation P1: fissare un `search_path` minimo e qualificare gli oggetti usati; testare trigger/RPC dopo la migrazione.

- `public.update_orchard_updated_at`;
- `public.set_updated_at_timestamp`;
- `public.get_field_row_history`;
- `public.calculate_rotation_score`;
- `public.get_rotation_suggestions`;
- `public.sync_sensor_readings_timestamp_columns`;
- `public.update_agronomic_ledger_updated_at`;
- `public.generate_ggn_code`;
- `public.generate_lot_code`.

### SECURITY DEFINER eseguibili — 60

Il linter genera due finding per ciascuna delle 30 funzioni seguenti:

- `Public Can Execute SECURITY DEFINER Function` — 30;
- `Signed-In Users Can Execute SECURITY DEFINER Function` — 30.

Remediation P1: per ogni funzione scegliere esplicitamente tra revoca `EXECUTE` a `public`/`anon`, grant al solo ruolo necessario, conversione a `SECURITY INVOKER`, spostamento fuori dallo schema esposto o wrapper server-side. Le funzioni di trigger devono essere distinte dalle RPC chiamabili dal client prima di revocare permessi.

- `public.advance_cultivation_phase(plan_id uuid, new_phase text, new_location text, new_quantity integer, notes text, photos jsonb)`;
- `public.advance_cultivation_phase_validated(plan_id uuid, new_phase text, new_location text, new_quantity integer, notes text, photos jsonb, weather_data jsonb)`;
- `public.auto_calculate_statistics()`;
- `public.calculate_cultivation_statistics(user_id_param uuid, garden_id_param uuid, period_start_param date, period_end_param date)`;
- `public.calculate_rotation_score(row_id uuid, new_crop_family text)`;
- `public.calculate_zone_soil_health(zone_id uuid)`;
- `public.check_rotation_compliance(p_bed_id uuid, p_plant_family text)`;
- `public.consume_seed_inventory()`;
- `public.create_default_notification_preferences()`;
- `public.create_system_roles_for_organization(org_id uuid)`;
- `public.get_available_materials(garden_id_param uuid, archetype_id_param text)`;
- `public.get_field_row_history(row_id uuid)`;
- `public.get_or_create_notification_preferences(p_user_id uuid)`;
- `public.get_recurring_issues(user_id_param uuid, archetype_id_param text, min_occurrences integer)`;
- `public.get_rotation_suggestions(row_id uuid)`;
- `public.get_zone_history(zone_id uuid, years_back integer)`;
- `public.get_zone_rotation_suggestions(zone_id uuid, years_back integer)`;
- `public.grant_credits(p_user_id uuid, p_amount integer)`;
- `public.handle_new_user()`;
- `public.handle_new_user_credits()`;
- `public.handle_phase_specific_actions(plan_id uuid, phase text, quantity integer)`;
- `public.initialize_default_certifications()`;
- `public.initialize_default_certifications(p_farm_id uuid)`;
- `public.manage_sapling_inventory()`;
- `public.update_haccp_certification_status()`;
- `public.update_orchard_statistics(orchard_uuid uuid)`;
- `public.update_organic_certification_status()`;
- `public.update_plan_quantity_from_transition()`;
- `public.update_vine_cumulative_yield()`;
- `public.update_vineyard_total_vines()`.

### Leaked Password Protection Disabled — 1

- Entity: `Auth`.
- Remediation P1: abilitare la protezione password compromesse nella configurazione Auth, verificare impatto sul flusso registrazione/reset e registrare smoke test.

## Suggerimenti — 2

Entrambi sono `RLS Enabled No Policy`:

- `public.agronomic_decision_ledger_entries`;
- `public.agronomic_queue_outcomes`.

Remediation P1: verificare se l'accesso deve avvenire solo via service role. Se esiste lettura/write client, aggiungere policy ownership complete; se service-role-only, mantenere il deny-by-default e documentare/testare il contratto.

## Gate di chiusura remediation

I finding non si considerano chiusi finche:

1. la migrazione additiva e applicata su staging;
2. i test anonimo, authenticated, cross-user e cross-organization sono verdi;
3. il Security Advisor viene rieseguito;
4. il nuovo export non contiene il finding oppure il finding e accettato con motivazione e owner;
5. Supabase e Neon non divergono sulla stessa capability senza una decisione documentata.
