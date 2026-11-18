import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, cpSync, chmodSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
// Production is used ONLY for a schema-only read. Every write targets this named Docker project.
const root = resolve(import.meta.dirname, '../..')
const workdir = join(tmpdir(), 'ortomio-audit-local')
const container = 'supabase_db_ortomio-audit-local'
const command = (file, args, options = {}) => execFileSync(file, args, { cwd: root, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024, ...options })
const mode = process.argv[2] || 'test'
const migrations = ['20261118210000_audit_irrigation_and_harvest_contracts.sql', '20261118211000_atomic_planner_suggestion_tasks.sql', '20261118212000_private_api_configurations.sql', '20261118213000_notification_delivery_recovery.sql']
try {
  if (mode === 'prepare') {
    if (!existsSync(join(workdir, 'supabase/config.toml'))) {
      mkdirSync(join(workdir, 'supabase/migrations'), { recursive: true })
      let config = readFileSync(join(root, 'supabase/config.toml'), 'utf8').replace(/^project_id = .*$/m, 'project_id = "ortomio-audit-local"')
      const ports = { api: 55421, db: 55422, studio: 55423, inbucket: 55424, analytics: 55427 }
      let section = ''
      config = config.split('\n').map(line => {
        const heading = line.match(/^\[([^\]]+)\]/); if (heading) section = heading[1]
        if (/^port =/.test(line) && ports[section]) return `port = ${ports[section]}`
        if (/^port =/.test(line) && section === 'db.pooler') return 'port = 55429'
        if (/^shadow_port =/.test(line)) return 'shadow_port = 55420'
        if (/^sql_paths =/.test(line) && section === 'db.seed') return 'sql_paths = []'
        return line
      }).join('\n')
      writeFileSync(join(workdir, 'supabase/config.toml'), config)
      cpSync(join(root, 'supabase/functions'), join(workdir, 'supabase/functions'), { recursive: true })
      command('supabase', ['db', 'dump', '--linked', '--schema', 'public,private', '--file', join(workdir, 'supabase/migrations/20261118000000_schema_snapshot.sql')])
      writeFileSync(join(workdir, 'supabase/migrations/20261117000000_extensions.sql'), 'CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;\n')
    }
    const output = command('supabase', ['start', '--workdir', workdir])
    writeFileSync(join(workdir, 'start.private.log'), output, { mode: 0o600 }); chmodSync(join(workdir, 'start.private.log'), 0o600)
  }
  if (!['prepare', 'test', 'restore'].includes(mode)) throw new Error('Mode: prepare | test | restore')
  for (const migration of migrations) command('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], { input: readFileSync(join(root, 'supabase/migrations', migration)) })
  const result = command('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], { input: readFileSync(join(root, 'supabase/tests/audit_20261118_contracts.sql')) })
  command('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], { input: readFileSync(join(root, 'supabase/tests/notification_delivery_recovery.sql')) })
  if (!result.toString().includes('ROLLBACK')) throw new Error('Fixture rollback not observed')
  if (mode === 'restore') {
    // Dedicated disposable database, same isolated Docker container; no production URL accepted.
    command('docker', ['exec', container, 'pg_dump', '-U', 'postgres', '-d', 'postgres', '-Fc', '-f', '/tmp/ortomio-audit.dump'])
    command('docker', ['exec', container, 'createdb', '-U', 'postgres', 'ortomio_restore_drill'])
    try {
      command('docker', ['exec', container, 'pg_restore', '-U', 'supabase_admin', '-d', 'ortomio_restore_drill', '--exit-on-error', '/tmp/ortomio-audit.dump'])
      command('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'ortomio_restore_drill', '-v', 'ON_ERROR_STOP=1'], { input: readFileSync(join(root, 'supabase/tests/audit_20261118_contracts.sql')) })
    } finally { command('docker', ['exec', container, 'dropdb', '-U', 'postgres', 'ortomio_restore_drill']) }
  }
  console.log(JSON.stringify({ ok: true, mode, project: 'ortomio-audit-local', schemaOnlyClone: true, fixtureRollback: true, migrations, completedAt: new Date().toISOString() }, null, 2))
} catch (error) {
  // Do not echo CLI stdout/stderr: they may include local service credentials.
  console.error('Local audit failed:', error.message.split('\n')[0]); process.exitCode = 1
}
