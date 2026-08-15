export default function LandingFooter() {
  return (
    <footer className="border-t border-ortomio-earth-200 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <span>OrtoMio — registro agronomico</span>
        <nav className="flex gap-4 text-xs text-gray-500">
          <a href="mailto:roberto.lalinga@gmail.com" className="hover:text-ortomio-green-700 hover:underline">Contatti</a>
          <a href="#maturita" className="hover:text-ortomio-green-700 hover:underline">Stato e maturità</a>
        </nav>
        <span className="font-mono text-xs">demo/beta · schema M15 in produzione</span>
      </div>
    </footer>
  )
}
