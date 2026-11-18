import React from 'react'
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import ManualMarkdown from '@/components/help/ManualMarkdown'
import ManualIndex from '@/components/help/ManualIndex'
import { getManualChapters, readManualChapter } from '@/lib/manual/content'
import { manualHref, headingId, matchesManualSearch } from '@/lib/manual/navigation'
import { CAPABILITIES } from '@/config/capabilities'

const chapters = getManualChapters()
const render = (content: string) => renderToStaticMarkup(<ManualMarkdown content={content} />)

test('the manual preserves chapter navigation, including the index and anchors', () => {
  const html = render('[Indice](./README.md)\n\n[Acqua](./15-irrigation-system.md#quando-intervenire)')
  assert.match(html, /href="\/docs\/manual"/)
  assert.match(html, /href="\/docs\/manual\/15-irrigation-system#quando-intervenire"/)
  assert.ok(html.includes('Indice') && html.includes('Acqua'))
  assert.equal(manualHref('27-quick-start.md'), '/docs/manual/27-quick-start')
})

test('numbered instructions, nested lists, tables and emphasis render as semantic HTML', () => {
  const html = render('1. Apri **Irrigazione**\n2. Controlla la zona\n   - Nome\n   - Area\n\n| Campo | Unità |\n| --- | --- |\n| Durata | minuti |')
  assert.match(html, /<ol/)
  assert.match(html, /<ul/)
  assert.match(html, /<strong[^>]*>Irrigazione<\/strong>/)
  assert.match(html, /<table/)
  assert.match(html, /<th scope="col"/)
  assert.match(html, /<td[^>]*>minuti<\/td>/)
})

test('unsafe URL schemes and raw HTML do not become executable manual content', () => {
  const html = render('[Pericolo](javascript:alert%281%29)\n\n<script>alert(1)</script>\n\n[App](/app)\n\n[Supporto](mailto:help@example.invalid)')
  assert.doesNotMatch(html, /href="javascript:/)
  assert.doesNotMatch(html, /<script/)
  assert.match(html, /href="\/app"/)
  assert.match(html, /href="mailto:help@example.invalid"/)
})

test('the reader cannot load files outside the manual directory', () => {
  assert.equal(readManualChapter('../../package'), null)
  assert.equal(readManualChapter('..%2F..%2Fpackage'), null)
  assert.equal(readManualChapter('chapter-that-does-not-exist'), null)
})

test('every published chapter is indexed exactly once', () => {
  const files = readdirSync(join(process.cwd(), 'docs/manual')).filter(file => file.endsWith('.md') && file !== 'README.md').map(file => file.replace(/\.md$/, '')).sort()
  const slugs = chapters.map(chapter => chapter.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  assert.deepEqual([...slugs].sort(), files)
  for (const chapter of chapters) {
    assert.ok(chapter.summary.length > 30, chapter.slug)
    assert.match(chapter.content, /## /, chapter.slug)
  }
})

test('all cross-chapter links and section anchors resolve, with unique headings', () => {
  const documents = [...chapters.map(chapter => [chapter.slug, chapter.content] as const), ['README', readManualChapter('README')!] as const]
  for (const [slug, content] of documents) {
    const ids = [...content.matchAll(/^#{2,3} (.+)$/gm)].map(match => headingId(match[1]))
    assert.equal(new Set(ids).size, ids.length, `duplicate heading in ${slug}`)
    for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const href = match[1]
      if (/^(https?:|mailto:)/.test(href)) continue
      const target = href.match(/^(?:\.\/)?([a-zA-Z0-9-]+)\.md(#[^\s]*)?$/)
      assert.ok(target, `unclassified manual link ${slug}: ${href}`)
      const linkedContent = readManualChapter(target[1])
      assert.ok(linkedContent, `broken manual link ${slug}: ${href}`)
      if (target[2]) {
        const targetIds = [...linkedContent.matchAll(/^#{2,3} (.+)$/gm)].map(match => headingId(match[1]))
        assert.ok(targetIds.includes(target[2].slice(1)), `broken anchor ${slug}: ${href}`)
      }
    }
  }
})

test('every application capability with help points to an indexed chapter', () => {
  const slugs = new Set(chapters.map(chapter => chapter.slug))
  for (const capability of CAPABILITIES.filter(item => item.helpHref)) {
    assert.ok(slugs.has(capability.helpHref!.replace('/docs/manual/', '')), capability.id)
  }
})

test('search finds instructions within chapters and tolerates accents and word order', () => {
  const irrigation = chapters.find(chapter => chapter.slug === '15-irrigation-system')!
  assert.ok(matchesManualSearch(irrigation.content, 'FILARE litri'))
  assert.ok(matchesManualSearch('Quantità misurata e unità', 'quantita unita'))
  assert.equal(matchesManualSearch(irrigation.content, 'parola-inesistente-xyz'), false)
  assert.ok(matchesManualSearch(irrigation.content, '   '))
})

test('the index offers beginner, daily and troubleshooting entry points with a labeled search', () => {
  const html = renderToStaticMarkup(<ManualIndex chapters={chapters} />)
  for (const slug of ['27-quick-start', '44-daily-checklist', '42-troubleshooting']) assert.ok(html.includes(`/docs/manual/${slug}`))
  assert.match(html, /for="manual-search"/)
  assert.match(html, /id="manual-search"/)
  assert.match(html, /role="status"/)
})

test('the public copy contains exactly the same documents as the source', () => {
  const sourceNames = readdirSync('docs/manual').filter(file => file.endsWith('.md')).sort()
  const publicNames = readdirSync('public/docs/manual').filter(file => file.endsWith('.md')).sort()
  assert.deepEqual(publicNames, sourceNames)
  for (const file of sourceNames) assert.equal(readFileSync(`public/docs/manual/${file}`, 'utf8'), readFileSync(`docs/manual/${file}`, 'utf8'), file)
})
