export function manualHref(href: string): string {
  const match = href.match(/^(?:\.\/)?([a-zA-Z0-9-]+)\.md(#[^\s]*)?$/)
  if (!match) return href
  return `${match[1] === 'README' ? '/docs/manual' : `/docs/manual/${match[1]}`}${match[2] ?? ''}`
}

export function headingId(text: string): string {
  return text.toLocaleLowerCase('it-IT').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

export function normalizeSearch(text: string): string {
  return text.toLocaleLowerCase('it-IT').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function matchesManualSearch(text: string, query: string): boolean {
  const haystack = normalizeSearch(text)
  return normalizeSearch(query).trim().split(/\s+/).every(word => haystack.includes(word))
}
