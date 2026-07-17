#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const apiRoot = path.join(root, 'app/api')
const appRoot = path.join(root, 'app/app')
const matrixPath = path.join(root, 'docs/security/API_CAPABILITY_MATRIX.md')
const inventoryPath = path.join(root, 'docs/reports/P0_BASELINE_INVENTORY_2026-07-16.md')

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(directory, entry.name)
  return entry.isDirectory() ? walk(fullPath) : [fullPath]
})

const routeFromFile = file => file
  .slice(path.join(root, 'app').length, -'/route.ts'.length)
  .replaceAll(path.sep, '/')

const pageRouteFromFile = file => {
  const route = file
    .slice(path.join(root, 'app').length, -'/page.tsx'.length)
    .replaceAll(path.sep, '/')
  return route || '/'
}

const methodsFromSource = source => Array.from(
  source.matchAll(/export\s+(?:async\s+function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g),
  match => match[1]
)

const apiRoutes = walk(apiRoot)
  .filter(file => file.endsWith('/route.ts'))
  .map(file => ({
    route: routeFromFile(file),
    methods: methodsFromSource(fs.readFileSync(file, 'utf8')),
  }))
  .sort((left, right) => left.route.localeCompare(right.route))

const appPages = walk(appRoot)
  .filter(file => file.endsWith('/page.tsx'))
  .map(pageRouteFromFile)
  .sort()

const parseDocumentedRows = (file, routePrefix) => {
  const source = fs.readFileSync(file, 'utf8')
  const rows = new Map()
  for (const line of source.split('\n')) {
    if (!line.startsWith(`| ${routePrefix}`)) continue
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    rows.set(cells[0], cells[1]?.split(',').map(value => value.trim()).filter(Boolean) ?? [])
  }
  return rows
}

const documentedApi = parseDocumentedRows(matrixPath, '/api/')
const documentedPages = parseDocumentedRows(inventoryPath, '/app')
const errors = []

for (const route of apiRoutes) {
  const documentedMethods = documentedApi.get(route.route)
  if (!documentedMethods) {
    errors.push(`API non documentata: ${route.route}`)
    continue
  }
  if (documentedMethods.join(',') !== route.methods.join(',')) {
    errors.push(`Metodi divergenti per ${route.route}: codice=${route.methods.join(',')} documento=${documentedMethods.join(',')}`)
  }
}

for (const route of documentedApi.keys()) {
  if (!apiRoutes.some(item => item.route === route)) errors.push(`API documentata ma assente: ${route}`)
}

for (const page of appPages) {
  if (!documentedPages.has(page)) errors.push(`Pagina /app non documentata: ${page}`)
}

for (const page of documentedPages.keys()) {
  if (!appPages.includes(page)) errors.push(`Pagina documentata ma assente: ${page}`)
}

const migrationFiles = fs.readdirSync(path.join(root, 'supabase/migrations'))
  .filter(file => file.endsWith('.sql'))
  .sort()

const summary = {
  apiRouteFiles: apiRoutes.length,
  apiMethods: apiRoutes.reduce((total, route) => total + route.methods.length, 0),
  appPages: appPages.length,
  migrationFiles: migrationFiles.length,
  documentedApiRoutes: documentedApi.size,
  documentedAppPages: documentedPages.size,
  status: errors.length === 0 ? 'ok' : 'failed',
}

console.log(JSON.stringify(summary, null, 2))

if (errors.length > 0) {
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
}
