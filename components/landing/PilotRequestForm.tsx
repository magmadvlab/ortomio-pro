'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'validation' | 'rate' | 'service' | 'network'

export default function PilotRequestForm({ onClose }: { onClose?: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const firstInput = useRef<HTMLInputElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => { firstInput.current?.focus() }, [])
  useEffect(() => { if (status === 'success') successRef.current?.focus() }, [status])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (![name, email, company, message].every((value) => value.trim())) { setStatus('validation'); return }
    setStatus('submitting')
    const data = new FormData()
    data.append('name', name.trim()); data.append('email', email.trim()); data.append('company', company.trim())
    data.append('type', 'guided_trial'); data.append('message', message.trim()); data.append('includeSystemInfo', 'false')
    try {
      const response = await fetch('/api/support/submit', { method: 'POST', body: data })
      if (response.ok) setStatus('success')
      else if (response.status === 429) setStatus('rate')
      else if (response.status === 400) setStatus('validation')
      else setStatus('service')
    } catch { setStatus('network') }
  }

  const close = () => {
    if (status === 'submitting') return
    onClose?.()
  }

  if (status === 'success') return <div ref={successRef} tabIndex={-1} role="status" aria-live="polite" className="mt-12 flex max-w-2xl gap-4 bg-white p-6 text-ortomio-green-900 focus:outline-none"><CheckCircle2 className="h-6 w-6 text-ortomio-green-600" /><div><h3 className="font-display text-xl font-bold">Richiesta ricevuta.</h3><p className="mt-1 text-gray-700">Ti scriviamo per definire insieme il caso da mostrare nella prova.</p></div></div>

  const error = status === 'validation' ? 'Completa i quattro campi e verifica l’indirizzo email.' : status === 'rate' ? 'Hai inviato più richieste ravvicinate. Riprova tra qualche minuto.' : status === 'network' ? 'La connessione non ha completato l’invio. I dati sono ancora qui: riprova.' : status === 'service' ? 'Il servizio non è disponibile in questo momento. Riprova più tardi.' : null
  const inputClass = 'min-h-12 w-full border border-ortomio-earth/30 bg-white px-4 py-3 text-sm text-ortomio-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-green-700'

  return <form onSubmit={submit} className="relative mt-12 max-w-3xl bg-ortomio-paper p-6 sm:p-10">{onClose && <button type="button" onClick={close} disabled={status === 'submitting'} aria-label="Chiudi il modulo" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-ortomio-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-green-700 disabled:cursor-not-allowed disabled:opacity-50"><X className="h-5 w-5" /></button>}<h3 className="pr-12 font-display text-2xl font-bold">Prepariamo la tua prova guidata</h3><p className="mt-2 text-sm text-gray-700">Quattro informazioni, così la demo parte già dal tuo caso e non da zero.</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Nome<input ref={firstInput} name="name" required value={name} onChange={(e)=>setName(e.target.value)} className={`${inputClass} mt-2`} /></label><label className="text-sm font-bold">Email<input name="email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className={`${inputClass} mt-2`} /></label><label className="text-sm font-bold sm:col-span-2">Azienda<input name="company" required value={company} onChange={(e)=>setCompany(e.target.value)} className={`${inputClass} mt-2`} /></label><label className="text-sm font-bold sm:col-span-2">Cosa vuoi valutare<textarea name="message" required rows={4} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Coltura, dimensione aziendale ed esigenza che vuoi approfondire" className={`${inputClass} mt-2 resize-y`} /></label></div>{error && <p role="alert" className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-800"><AlertCircle className="h-4 w-4" />{error}</p>}<button type="submit" disabled={status === 'submitting'} className="mt-7 inline-flex min-h-12 items-center gap-2 bg-ortomio-green-900 px-6 py-3 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ortomio-green-700 focus-visible:ring-offset-2 disabled:opacity-60">{status === 'submitting' ? <><Loader2 className="h-4 w-4 animate-spin motion-reduce:hidden" />Invio in corso…</> : 'Prenota la prova guidata'}</button></form>
}
