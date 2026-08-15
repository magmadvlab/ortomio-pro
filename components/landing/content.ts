export type SpecialistCrop = {
  id: 'orticole' | 'vigneto' | 'oliveto' | 'frutteto' | 'vivaio'
  label: string
  proof: string
  detail: string
  maturity: 'Stabile' | 'Beta'
}

export const landingContent = {
  eyebrow: 'Sistema decisionale agronomico trasparente',
  title: 'Dai dati di campo a decisioni agronomiche verificabili.',
  summary:
    'OrtoMio aiuta aziende agricole strutturate e consulenti agronomici a collegare condizioni ambientali, stato delle colture, attività, costi e risultati. Ogni priorità mostra dati utilizzati, calcoli, affidabilità e alternative valutate.',
  finalCta: 'Richiedi una prova guidata',
  commercialState: 'Release candidate tecnica · validazione commerciale 1.0: NO-GO',
} as const

export const orchestratorSignals = [
  { label: 'Ambiente', value: 'Meteo, acqua, suolo, luce e stress termico' },
  { label: 'Coltura', value: 'Fase fenologica, varietà, salute e fabbisogni' },
  { label: 'Operazioni', value: 'Attività, operatori, trattamenti ed esiti' },
  { label: 'Economia', value: 'Costo dell’intervento, costo del ritardo e valore protetto' },
] as const

export const specialistCrops: SpecialistCrop[] = [
  {
    id: 'orticole',
    label: 'Orticole e seminativi',
    proof: 'Rotazioni, successioni e raccolti',
    detail: 'Il piano collega famiglie botaniche, finestre di semina, irrigazione, attività ed esito produttivo.',
    maturity: 'Stabile',
  },
  {
    id: 'vigneto',
    label: 'Vigneto',
    proof: 'Filari, singole viti e indice di Ravaz',
    detail: 'Carico di gemme, potatura, operazioni e produzione rimangono leggibili dalla parcella alla singola vite.',
    maturity: 'Beta',
  },
  {
    id: 'oliveto',
    label: 'Oliveto',
    proof: 'Storia produttiva di ogni albero',
    detail: 'Censimento, posizione, interventi, stato vegetativo e raccolti costruiscono una memoria individuale.',
    maturity: 'Beta',
  },
  {
    id: 'frutteto',
    label: 'Frutteto',
    proof: 'Varietà, fenologia e raccolti',
    detail: 'La lettura unisce sviluppo, trattamenti, risposta e produzione per zona o singola pianta.',
    maturity: 'Beta',
  },
  {
    id: 'vivaio',
    label: 'Vivaio',
    proof: 'Dal seme al trapianto',
    detail: 'Semina o acquisto, germinazione, nursing, hardening e trapianto restano nello stesso percorso.',
    maturity: 'Stabile',
  },
]

export const documentationLinks = [
  { href: '/docs/manual/34-director-orchestrator', label: 'Motore orchestratore', description: 'Come i segnali diventano un briefing operativo.' },
  { href: '/docs/manual/21-individual-plants', label: 'Piante individuali', description: 'Storia, operazioni e raccolti per singola pianta.' },
  { href: '/docs/manual/20-vineyard-management', label: 'Gestione vigneto', description: 'Filari, viti e indicatori viticoli.' },
  { href: '/docs/manual/19-olive-management', label: 'Gestione oliveto', description: 'Alberi, interventi e produzione.' },
  { href: '/docs/manual/18-orchard-management', label: 'Gestione frutteto', description: 'Varietà, fenologia e raccolti.' },
  { href: '/docs/manual/15-irrigation-system', label: 'Irrigazione', description: 'Fabbisogno, previsioni e confidenza del dato.' },
] as const
