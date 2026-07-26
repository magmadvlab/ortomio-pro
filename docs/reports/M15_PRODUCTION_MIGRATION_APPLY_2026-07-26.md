# M15 - Applicazione migrazioni Production

## Decisione

Il 26/07/2026 l'utente ha deciso esplicitamente di non creare un secondo progetto staging sul piano Supabase Free e di applicare all'unico database Production esclusivamente le cinque migrazioni M15 gia' verificate.

Sono rimaste escluse tutte le migrazioni storiche non ancora riconciliate da M06.

## Metodo

Ogni file e' stato eseguito separatamente nel SQL Editor Supabase con ruolo `postgres`:

1. apertura di una transazione;
2. applicazione del singolo file;
3. inserimento della versione in `supabase_migrations.schema_migrations`;
4. commit;
5. query indipendente su history, relazioni, colonne e RPC.

Un primo invio O38 ha prodotto un errore editor `42601` durante una query di verifica concatenata. La verifica successiva ha dimostrato che la transazione O38 precedente era gia' stata applicata e registrata; il secondo tentativo atomico si e' fermato sul vincolo univoco `schema_migrations_pkey`. Nessun oggetto e' stato duplicato.

## Migrazioni applicate

| Versione | Nome | Esito |
|---|---|---|
| `20260726103000` | `transactional_organization_provisioning` | history e `provision_organization` verificati |
| `20260726113000` | `server_organization_invitations` | history, RPC e cinque colonne delivery verificati |
| `20260726150000` | `single_pro_billing_lifecycle` | history, tre relazioni e tre RPC verificati |
| `20260726160000` | `organization_suspension_lifecycle` | history, tre relazioni e due RPC verificati |
| `20260726170000` | `organization_exit_and_support_lifecycle` | history, grant assistenza e sette RPC verificati |

O42 ha sostituito quattro policy `api_keys` tramite `DROP POLICY IF EXISTS` seguito dalla ricreazione nella stessa transazione. O43 definisce una funzione di purge contenente `DELETE`, ma non ha eseguito alcun purge durante la migrazione.

## Probe applicativo

`npm run release:check:commercial-schema` termina verde con:

- `schemaReady=true`;
- colonne delivery inviti disponibili;
- account commerciali, fatture e audit disponibili;
- tabelle di sospensione `exists_but_protected` per l'anonimo;
- grant assistenza disponibile.

`npm run release:check` resta coerentemente:

- `localReady=true`;
- `deployReady=false`.

La sola applicazione dello schema non chiude M15 per la release: restano provider inviti reale e prove lifecycle E2E su due organizzazioni. Non chiude inoltre M06-M08, perche' non esistono staging, backup, restore drill e certificazione tenant.
