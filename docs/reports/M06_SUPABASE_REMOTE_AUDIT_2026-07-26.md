# M06 - Audit remoto Supabase

## Esito

Audit read-only eseguito il 26/07/2026 sul progetto Production `ortomiopro`.

Il progetto non dispone di un ambiente isolato nel quale applicare e verificare le migrazioni candidate:

- organizzazione Supabase: piano `Free`;
- branch Production: `main`;
- branch persistenti: nessuno;
- branch Preview: nessuno;
- comando `Create branch`: disabilitato;
- backup provider: non disponibili sul piano Free;
- ultimo backup mostrato nella overview: `No backups`.

Non e' stata eseguita alcuna scrittura, migrazione o modifica di configurazione.

## Migration history osservata

La pagina Database Migrations espone 48 record. L'ultima versione e':

- `20260724082916` — `archive_completed_garden_tasks`;
- applicata il 24/07/2026 alle 08:29:16.

Le otto versioni piu' recenti sono:

| Versione | Nome |
|---|---|
| `20260724082916` | `archive_completed_garden_tasks` |
| `20260724082811` | `season_adjustment_decisions` |
| `20260724082750` | `link_custom_plans_to_tasks` |
| `20260724082734` | `task_transition_ledger` |
| `20260724082654` | `notification_delivery_lifecycle` |
| `20260724082622` | `garden_soil_states` |
| `20260724082553` | `land_zones_garden_ownership` |
| `20260724082514` | `create_macerate_logs` |

La history non contiene le migrazioni candidate successive, incluse:

- `20260726103000_transactional_organization_provisioning.sql`;
- `20260726113000_server_organization_invitations.sql`;
- `20260726150000_single_pro_billing_lifecycle.sql`;
- `20260726160000_organization_suspension_lifecycle.sql`;
- `20260726170000_organization_exit_and_support_lifecycle.sql`.

Il risultato concorda con il probe anonimo PostgREST: colonne invito O39 e relazioni O41-O43 risultano assenti.

## Decisione operativa

Le migrazioni non vengono applicate direttamente all'unico database Production.

Mancano contemporaneamente:

1. target staging separato;
2. snapshot provider;
3. backup schedulato;
4. restore drill verificato;
5. rollback provato;
6. history locale/remota interamente riconciliata.

Applicare i batch in queste condizioni renderebbe O06-O12 formalmente falsi e introdurrebbe un rischio non recuperabile sul solo database disponibile.

## Condizione di ripresa

Serve una delle seguenti condizioni:

1. upgrade/configurazione che abiliti un branch Supabase isolato e backup recuperabili; oppure
2. secondo progetto Supabase dedicato allo staging, con credenziali separate, seed controllato e target di restore; oppure
3. target PostgreSQL isolato equivalente, approvato come staging e coperto dal runbook M07.

Solo dopo la creazione del target si procede con dump read-only, riconciliazione completa della history, backup, restore drill, applicazione a batch e test O01-O43.
