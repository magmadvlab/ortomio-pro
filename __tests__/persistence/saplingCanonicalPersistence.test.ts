import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const service = readFileSync(
  resolve(process.cwd(), 'services/saplingService.ts'),
  'utf8',
)
const migration = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20260728070000_canonical_sapling_persistence.sql',
  ),
  'utf8',
)
const dashboard = readFileSync(
  resolve(process.cwd(), 'components/seedbank/SaplingDashboard.tsx'),
  'utf8',
)

test('live sapling service uses one canonical batch and item backend', () => {
  assert.match(service, /\.from\('sapling_batches'\)/)
  assert.match(service, /sapling_items/)
  assert.doesNotMatch(service, /\.from\('sapling_inventory'\)/)
  assert.doesNotMatch(service, /\.from\('saplings'\)/)
  assert.doesNotMatch(service, /preferredSaplingTable/)
})

test('batch creation and resizing are database-atomic operations', () => {
  assert.match(service, /\.rpc\('create_sapling_batch_with_items'/)
  assert.match(service, /\.rpc\('resize_sapling_batch'/)
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.create_sapling_batch_with_items/)
  assert.match(migration, /INSERT INTO public\.sapling_batches[\s\S]*INSERT INTO public\.sapling_items/)
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.resize_sapling_batch/)
  assert.match(migration, /cannot_remove_non_nursery_saplings/)
})

test('planting updates the item and remaining batch quantity in one RPC', () => {
  assert.match(service, /\.rpc\('record_sapling_item_planting'/)
  assert.match(migration, /UPDATE public\.sapling_items[\s\S]*status = 'planted'/)
  assert.match(migration, /UPDATE public\.sapling_batches[\s\S]*remaining_quantity/)
  assert.doesNotMatch(service, /\.from\('sapling_plantings'\)/)
  assert.doesNotMatch(service, /crypto\.randomUUID|sapling-planting-\$\{Date\.now/)
})

test('read failures remain distinguishable from a real empty dataset', () => {
  assert.doesNotMatch(service, /Error fetching saplings:[\s\S]{0,160}return \[\]/)
  assert.doesNotMatch(service, /Error fetching sapling batches:[\s\S]{0,160}return \[\]/)
  assert.doesNotMatch(service, /Error fetching sapling stats:[\s\S]{0,220}totalSaplings:\s*0/)
  assert.match(dashboard, /setLoadError\('Impossibile caricare gli alberelli/)
  assert.match(dashboard, /role="alert"/)
  assert.match(dashboard, />\s*Riprova\s*</)
})

test('photo timeline is persisted against canonical sapling items and protected by RLS', () => {
  assert.match(migration, /sapling_id uuid NOT NULL REFERENCES public\.sapling_items/)
  assert.match(migration, /ALTER TABLE public\.sapling_timeline ENABLE ROW LEVEL SECURITY/)
  assert.match(migration, /g\.user_id = auth\.uid\(\)/)
})
