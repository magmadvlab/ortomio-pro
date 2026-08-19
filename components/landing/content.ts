export type SpecialistCrop = {
  id: 'orticole' | 'vigneto' | 'oliveto' | 'frutteto' | 'vivaio'
  label: string
  proof: string
  detail: string
}

export const landingContent = {
  eyebrow: 'L’orchestratore agronomico per aziende e consulenti',
  title: 'Ogni mattina una coda di azioni motivate: cosa fare, perché, quanto costa aspettare.',
  summary:
    'OrtoMio registra ogni intervento e lo collega a satellite, suolo, acqua e fenologia. Punteggia le azioni del giorno su urgenza, impatto, fattibilità e costo, confronta intervenire ora, rinviare o monitorare — e firma ogni previsione con i dati usati. La decisione resta tua.',
  finalCta: 'Prenota la tua prova guidata',
} as const

export const specialistCrops: SpecialistCrop[] = [
  {
    id: 'orticole',
    label: 'Orticole e seminativi',
    proof: 'Pianifica semine, rotazioni e raccordi operativi',
    detail: 'Cosa coltivare, dove e quando, con la motivazione di ogni indicazione. Il sistema segnala le successioni poco adatte e collega irrigazioni e lavorazioni al raccolto ottenuto.',
  },
  {
    id: 'vigneto',
    label: 'Vigneto',
    proof: 'Dalla vite singola al filare',
    detail: 'Ceppi individuali con varietà, salute e vigore; carico gemme e indice Ravaz con storico; impianto irriguo configurato per singolo filare.',
  },
  {
    id: 'oliveto',
    label: 'Oliveto',
    proof: 'Indice di Jaen e mosca olearia',
    detail: 'Letture di maturazione con storico e raccomandazione di raccolta derivata dall’indice; trappole per mosca olearia monitorate a soglie calcolate sulle catture reali.',
  },
  {
    id: 'frutteto',
    label: 'Frutteto',
    proof: 'Alberi individuali, potature e raccolte',
    detail: 'Filtri per varietà, salute e vigore; sesti e densità di impianto come supporto alla configurazione; resa tracciata per pianta quando i dati ci sono.',
  },
  {
    id: 'vivaio',
    label: 'Vivaio',
    proof: 'Segui ogni piantina fino al trapianto',
    detail: 'Dalla semina alla germinazione, alla crescita in vivaio e alla preparazione al trapianto. In campo, il codice della piantina si lega alla sua posizione nel filare.',
  },
]
