export type SpecialistCrop = {
  id: 'orticole' | 'vigneto' | 'oliveto' | 'frutteto' | 'vivaio'
  label: string
  proof: string
  detail: string
}

export const landingContent = {
  eyebrow: 'AI agronomica dal satellite alla singola pianta',
  title: 'OrtoMio non guarda un dato alla volta. Guarda il campo intero, fino alla singola pianta.',
  summary:
    'OrtoMio è la piattaforma che collega satellite, sensori, storico e costi delle tue colture in un\'unica decisione spiegabile, dalla zona alla singola pianta — riapribile e verificabile ogni volta che ti serve.',
  finalCta: 'Prenota la tua prova guidata',
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
