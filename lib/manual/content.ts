import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { MANUAL_GROUPS, type ManualChapter } from '@/config/manual'

export function readManualChapter(slug: string): string | null {
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) return null
  const path = join(process.cwd(), 'docs', 'manual', `${slug}.md`)
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

export function getManualChapters(): ManualChapter[] {
  return MANUAL_GROUPS.flatMap(group => group.slugs.map(slug => {
    const content = readManualChapter(slug)
    if (!content) throw new Error(`Capitolo del manuale mancante: ${slug}`)
    const paragraphs = content.split(/\n\s*\n/)
    return {
      slug, group: group.title, content,
      title: content.split('\n')[0].replace(/^#\s+/, ''),
      summary: paragraphs.find(paragraph => !/^[#>[|*\-\d]/.test(paragraph) && paragraph.trim()) ?? '',
    }
  }))
}
