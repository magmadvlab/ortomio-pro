export type SpecialistCrop = {
  id: 'orticole' | 'vigneto' | 'oliveto' | 'frutteto' | 'vivaio'
  label: string
  proof: string
  detail: string
}

export const landingContent = {
  eyebrow: 'L’orchestratore agronomico per aziende e consulenti',
  title: 'Il cervello agronomico della tua azienda. Dalla decisione al raccolto, zero improvvisazione.',
  summary:
    'OrtoMio incrocia dati satellitari, meteo, sensori di suolo e fenologia per darti un’unica priorità quotidiana: cosa fare oggi, perché farlo subito e quanto ti costa rinviare.',
  finalCta: 'Metti alla prova il tuo campo',
} as const

export const specialistCrops: SpecialistCrop[] = [
  {
    id: 'orticole',
    label: 'Orticole e seminativi',
    proof: 'Controllo delle rotazioni',
    detail: 'Pianifica semine, trapianti e successioni colturali. Il sistema segnala le incompatibilità botaniche, ottimizza le rotazioni per prevenire la stanchezza del suolo e collega irrigazione e fertirrigazione alle rese effettive.',
  },
  {
    id: 'vigneto',
    label: 'Vigneto',
    proof: 'Viticoltura di precisione al singolo ceppo',
    detail: 'Mappi ogni pianta con varietà, vigore e stato fitosanitario. Monitora lo storico del carico gemme, traccia l’indice di Ravaz e configura l’impianto irriguo per singolo filare o settore.',
  },
  {
    id: 'oliveto',
    label: 'Oliveto',
    proof: 'Maturazione ottimale e difesa dalla mosca',
    detail: 'Calcola l’indice di maturazione di Jaén con storico delle letture per individuare la finestra ideale di raccolta. Monitora le trappole per la mosca olearia con soglie d’intervento basate sulle catture reali e sul meteo di zona.',
  },
  {
    id: 'frutteto',
    label: 'Frutteto',
    proof: 'Gestione individuale e resa per albero',
    detail: 'Classifica le piante per sesto d’impianto, varietà e vigore. Traccia potature, trattamenti e diradamento, registrando la resa qualitativa e quantitativa fino al singolo individuo.',
  },
  {
    id: 'vivaio',
    label: 'Vivaio',
    proof: 'Tracciabilità totale dalla semina al filare',
    detail: 'Segui il ciclo di vita della piantina durante germinazione, accrescimento e condizionamento al trapianto. Una volta in campo, il codice del vivaio si lega alla posizione esatta nel terreno.',
  },
]
