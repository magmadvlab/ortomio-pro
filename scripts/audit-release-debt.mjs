#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outputPath = path.join(root, 'docs/reports/M05_RELEASE_DEBT_MANIFEST_2026-07-24.csv')
const sourceRoots = ['app', 'components', 'config', 'hooks', 'lib', 'packages', 'services']
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])
const marker = /\b(TODO|FIXME|HACK|mock(?:ed|s|ing)?|placeholder|not implemented|da implementare)\b/i

const classifications = [
  { match: /^lib\/auth-bypass\.ts$/, maturity: 'development', disposition: 'isolated', reason: 'bypass guarded against production' },
  { match: /^lib\/auth\.server\.ts$/, maturity: 'development', disposition: 'isolated', reason: 'references guarded development bypass only' },
  { match: /^packages\/core\/hooks\/useAuth\.tsx$/, maturity: 'development', disposition: 'isolated', reason: 'uses guarded development bypass' },
  { match: /^app\/api\/(?:drone|blockchain)\//, maturity: 'laboratory', disposition: 'isolated', reason: 'capability registry marks route as simulation/lab' },
  { match: /^services\/(?:droneIntegration|blockchain)Service\.ts$/, maturity: 'laboratory', disposition: 'isolated', reason: 'simulation/lab provider' },
  { match: /^components\/dominance\//, maturity: 'laboratory', disposition: 'isolated', reason: 'internal strategic analysis module' },
  { match: /^components\/(?:shared\/(?:LocationSelector|MobileOptimizedInput)|ui\/Select)\.tsx$/, maturity: 'release', disposition: 'accepted', reason: 'component placeholder property, not simulated data' },
  { match: /\.(?:backup|bak\d*)$/, maturity: 'legacy', disposition: 'excluded', reason: 'non-runtime backup file' },
]

const milestoneRules = [
  { match: /app\/app\/compare\/|components\/Dashboard\.tsx/, milestone: 'M09', reason: 'canonical analytics or dashboard provider convergence' },
  { match: /DiseaseDiagnosis|AICreditsWidget/, milestone: 'M15', reason: 'commercial upgrade and credit lifecycle' },
  { match: /AlmanaccoIntegration|sunExposure|useWeather/, milestone: 'M13', reason: 'external weather or solar provider integration' },
  { match: /PlannerHealthSuggestions|aiPlanning|aiSuggestions/, milestone: 'M14', reason: 'AI or agronomic rule validation' },
  { match: /NutrientCalculator|unifiedCertifications/, milestone: 'M12', reason: 'agronomic or certification pilot evidence' },
  { match: /AdvancedTreeManager|InteractiveTrackingInterface/, milestone: 'M11', reason: 'core operational lifecycle' },
  { match: /(?:notification|iot|telemetry|monitoring|authErrorHandler)/i, milestone: 'M10', reason: 'notification or observability lifecycle' },
  { match: /(?:organization|onboarding|invitation|role|license|billing|public-contract)/i, milestone: 'M15', reason: 'commercial lifecycle or role management' },
  { match: /(?:satellite|weatherProvider|marketData|phytosanitary|apiConfiguration)/i, milestone: 'M13', reason: 'external provider integration' },
  { match: /(?:\bai\b|predict|advice|gemini|contextAware|compliance)/i, milestone: 'M14', reason: 'AI or agronomic rule validation' },
  { match: /(?:irrigation|nutrition|treatment|mechanical|tillage|compost|macerate|harvest)/i, milestone: 'M12', reason: 'agronomic operation pilot' },
  { match: /(?:Journal|diary|plant|crop|task|cultivation|calendar|sapling|customPlan)/i, milestone: 'M11', reason: 'core operational lifecycle' },
  { match: /(?:seed|soil|storage|memory|landZone|garden|row|prescription|export|costOptimization|geoExport)/i, milestone: 'M09', reason: 'canonical provider convergence' },
]

const classify = (relative, line) => {
  const known = classifications.find((entry) => entry.match.test(relative))
  if (known) return known
  if (/\b(?:skeleton|input|select|label|example|copy)\b/i.test(line) && /\bplaceholder\b/i.test(line)) {
    return { maturity: 'release', disposition: 'accepted', reason: 'non-operational UI placeholder' }
  }
  const scheduled = milestoneRules.find((entry) => entry.match.test(`${relative} ${line}`))
  if (scheduled) {
    return {
      maturity: 'release',
      disposition: `scheduled:${scheduled.milestone}`,
      reason: scheduled.reason,
    }
  }
  return null
}

const walk = (directory) => {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(absolute)
    return sourceExtensions.has(path.extname(entry.name)) ? [absolute] : []
  })
}

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const rows = []

for (const sourceRoot of sourceRoots) {
  for (const absolute of walk(path.join(root, sourceRoot))) {
    const relative = path.relative(root, absolute)
    const lines = fs.readFileSync(absolute, 'utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      if (!marker.test(line)) return
      if (/\bplaceholder\s*=/.test(line) || /placeholder\s*:/.test(line)) return
      const known = classify(relative, line)
      rows.push({
        file: relative,
        line: index + 1,
        marker: line.match(marker)?.[0].toLowerCase() || 'unknown',
        maturity: known?.maturity || 'release',
        disposition: known?.disposition || 'unclassified',
        reason: known?.reason || '',
        excerpt: line.trim().slice(0, 240),
      })
    })
  }
}

rows.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
const header = ['file', 'line', 'marker', 'maturity', 'disposition', 'reason', 'excerpt']
const content = [
  header.map(csv).join(','),
  ...rows.map((row) => header.map((key) => csv(row[key])).join(',')),
  '',
].join('\n')

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, content)

const summary = rows.reduce((result, row) => {
  const key = `${row.maturity}:${row.disposition}`
  result[key] = (result[key] || 0) + 1
  return result
}, {})
const unclassifiedRelease = rows.filter((row) => row.maturity === 'release' && row.disposition === 'unclassified')
process.stdout.write(`${JSON.stringify({
  manifest: path.relative(root, outputPath),
  total: rows.length,
  summary,
  unclassifiedRelease: unclassifiedRelease.length,
}, null, 2)}\n`)

if (process.argv.includes('--check') && unclassifiedRelease.length > 0) process.exit(1)
