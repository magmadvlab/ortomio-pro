import { execFileSync, spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '../..')
const local = JSON.parse(execFileSync('supabase', ['status', '--workdir', '/tmp/ortomio-audit-local', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
if (new URL(local.API_URL).hostname !== '127.0.0.1' || new URL(local.API_URL).port !== '55421') throw new Error('Expected isolated audit database')
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack', '-H', '127.0.0.1', '-p', '3004'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, NEXT_BUILD_DIR: '.next-audit', NEXT_PUBLIC_BYPASS_AUTH: 'false', NEXT_PUBLIC_DEV_MODE: 'false', NEXT_PUBLIC_DEBUG_AUTH: 'false', NEXT_PUBLIC_SUPABASE_URL: local.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: local.ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY, API_CONFIGURATION_ENCRYPTION_KEY: randomBytes(32).toString('hex'), API_PROVIDER_ALLOWED_ORIGINS: '', GEMINI_API_KEY: '', GROQ_API_KEY: '', OPENROUTER_API_KEY: '', HUGGINGFACE_API_KEY: '', CRON_SECRET: 'local-audit-no-production-jobs' },
})
process.on('SIGTERM', () => app.kill('SIGTERM'))
process.on('SIGINT', () => app.kill('SIGINT'))
app.on('exit', code => process.exit(code ?? 0))
