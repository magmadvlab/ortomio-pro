#!/usr/bin/env node

import { cp, mkdir, readdir, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const source = resolve(root, 'docs/manual')
const target = resolve(root, 'public/docs/manual')
const checkOnly = process.argv.includes('--check')

async function markdownSnapshot(directory) {
  const names = (await readdir(directory)).filter(name => name.endsWith('.md')).sort()
  return Promise.all(names.map(async name => [name, await readFile(resolve(directory, name), 'utf8')]))
}

if (checkOnly) {
  const [sourceFiles, targetFiles] = await Promise.all([
    markdownSnapshot(source),
    markdownSnapshot(target),
  ])

  if (JSON.stringify(sourceFiles) !== JSON.stringify(targetFiles)) {
    console.error('Manuale pubblico non sincronizzato. Esegui: npm run docs:sync')
    process.exit(1)
  }

  console.log(`Manuale sincronizzato: ${sourceFiles.length} capitoli`)
} else {
  await rm(target, { recursive: true, force: true })
  await mkdir(target, { recursive: true })
  await cp(source, target, { recursive: true })
  console.log(`Manuale copiato da ${source} a ${target}`)
}
