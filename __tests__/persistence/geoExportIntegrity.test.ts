import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const geoExport = readFileSync(
  new URL('../../services/geoExportService.ts', import.meta.url),
  'utf8'
)

test('geographic exports never report fabricated binary files or URLs', () => {
  assert.match(geoExport, /0x04034b50/)
  assert.match(geoExport, /0x06054b50/)
  assert.match(geoExport, /URL\.createObjectURL\(new Blob/)
  assert.match(geoExport, /Shapefile export requires an audited binary encoder/)
  assert.doesNotMatch(geoExport, /new ArrayBuffer\(totalSize \+ 1000\)/)
  assert.doesNotMatch(geoExport, /https:\/\/ortomio\.com\/downloads/)
})
