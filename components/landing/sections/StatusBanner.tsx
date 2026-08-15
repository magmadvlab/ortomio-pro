export default function StatusBanner() {
  return (
    <div className="border-b border-ortomio-earth-200 bg-ortomio-earth-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3 text-sm sm:flex-row sm:items-baseline sm:gap-4">
        <span>
          <strong className="text-semantic-warning-text">Demo/beta pubblica.</strong>{' '}
          Codice in produzione, dati di prova.
        </span>
        <a href="#maturita" className="inline-block py-2 text-sm font-semibold underline-offset-2 hover:underline sm:ml-auto">
          → leggi lo stato reale
        </a>
      </div>
    </div>
  )
}
