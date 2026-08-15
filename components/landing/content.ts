export type SpecialistCrop = {
  id: 'orticole' | 'vigneto' | 'oliveto' | 'frutteto' | 'vivaio'
  label: string
  proof: string
  detail: string
}

export const landingContent = {
  eyebrow: 'AI agronomica dal satellite alla singola pianta',
  title: 'Tutto ciò che accade in campo diventa una decisione che puoi spiegare.',
  summary:
    'OrtoMio aiuta aziende agricole e consulenti agronomici a collegare NDVI, meteo, sensori, stato delle colture, lavorazioni, costi e raccolti. Per ogni intervento mostra perché è importante e conserva come ha risposto ogni singola pianta, vite o albero.',
  finalCta: 'Richiedi una prova guidata',
} as const

export const specialistCrops: SpecialistCrop[] = [
  {
    id: 'orticole',
    label: 'Orticole e seminativi',
    proof: 'Pianifica semine, rotazioni e raccolti',
    detail: 'Vedi cosa coltivare, dove e quando. Il sistema segnala successioni poco adatte e collega irrigazioni e lavorazioni al raccolto ottenuto.',
  },
  {
    id: 'vigneto',
    label: 'Vigneto',
    proof: 'Controlla filari e singole viti',
    detail: 'Registra potature, trattamenti, carico di gemme e produzione: dalla parcella fino alla singola vite.',
  },
  {
    id: 'oliveto',
    label: 'Oliveto',
    proof: 'Conserva la storia di ogni albero',
    detail: 'Posizione, varietà, potature, trattamenti, stato della pianta e raccolti rimangono collegati a ogni olivo.',
  },
  {
    id: 'frutteto',
    label: 'Frutteto',
    proof: 'Segui sviluppo e produzione',
    detail: 'Controlli varietà, fioritura, trattamenti, stato di salute e raccolto per zona oppure per singolo albero.',
  },
  {
    id: 'vivaio',
    label: 'Vivaio',
    proof: 'Segui ogni piantina fino al trapianto',
    detail: 'Dalla semina alla germinazione, alla crescita in vivaio e alla preparazione al trapianto. Una volta in campo, il codice della piantina viene collegato alla sua posizione nel filare.',
  },
]
