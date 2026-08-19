'use client'

/**
 * Chrome di sezione: ogni blocco della pagina porta lo stesso indice
 * di sistema, come un pannello strumentale. Legge mono, hairline,
 * nessun nuovo colore.
 */
export default function SectionHeader({
  index,
  label,
  dark = false,
}: {
  index: string
  label: string
  dark?: boolean
}) {
  const line = dark ? 'border-white/15' : 'border-ortomio-earth/30'
  const text = dark ? 'text-ortomio-green-400' : 'text-ortomio-green-700'

  return (
    <div
      className={`mb-8 flex items-center gap-3 border-t ${line} pt-3 font-mono text-[11px] uppercase tracking-[0.18em] ${text}`}
      aria-hidden="true"
    >
      <span>§ {index}</span>
      <span className="h-px flex-1 bg-current opacity-20" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-current opacity-20" />
      <span className="hidden sm:inline">ortomio/landing</span>
    </div>
  )
}
