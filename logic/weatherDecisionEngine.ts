export type WeatherHazard =
  | 'heat'
  | 'frost'
  | 'heavy_rain'
  | 'flash_flood'
  | 'strong_wind'
  | 'violent_wind'
  | 'severe_thunderstorm'
  | 'hail'
  | 'snow'

export interface WeatherRiskInput {
  tempMax?: number
  tempMin?: number
  precipitationTotalMm?: number
  precipitationProbabilityMax?: number
  maxHourlyPrecipitationMm?: number
  showersTotalMm?: number
  maxHourlyShowersMm?: number
  windSpeedMaxKmh?: number
  windGustMaxKmh?: number
  capeMaxJkg?: number
  snowfallCm?: number
  weatherCodes?: number[]
}

export interface WeatherDecision {
  hazard: WeatherHazard
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  urgency: 'monitor' | 'today' | 'immediate'
  confidence: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
  action: string
  steps: string[]
  estimatedMinutes: number
  evidence: string[]
  safetyNotice?: string
}

const finite = (value: unknown): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const round = (value: number | undefined, digits = 0): string =>
  value === undefined ? 'n/d' : value.toFixed(digits)

const hasCode = (codes: number[], allowed: number[]) => codes.some((code) => allowed.includes(code))

export function evaluateWeatherRisks(raw: WeatherRiskInput): WeatherDecision[] {
  const input = {
    tempMax: finite(raw.tempMax),
    tempMin: finite(raw.tempMin),
    precipitationTotalMm: finite(raw.precipitationTotalMm) ?? 0,
    precipitationProbabilityMax: finite(raw.precipitationProbabilityMax),
    maxHourlyPrecipitationMm: finite(raw.maxHourlyPrecipitationMm) ?? 0,
    showersTotalMm: finite(raw.showersTotalMm) ?? 0,
    maxHourlyShowersMm: finite(raw.maxHourlyShowersMm) ?? 0,
    windSpeedMaxKmh: finite(raw.windSpeedMaxKmh) ?? 0,
    windGustMaxKmh: finite(raw.windGustMaxKmh) ?? finite(raw.windSpeedMaxKmh) ?? 0,
    capeMaxJkg: finite(raw.capeMaxJkg) ?? 0,
    snowfallCm: finite(raw.snowfallCm) ?? 0,
    weatherCodes: (raw.weatherCodes || []).map(Number).filter(Number.isFinite),
  }
  const decisions: WeatherDecision[] = []
  const hailCode = hasCode(input.weatherCodes, [96, 99])
  const thunderstormCode = hasCode(input.weatherCodes, [95, 96, 99])

  if (input.precipitationTotalMm >= 80 || input.maxHourlyPrecipitationMm >= 30) {
    decisions.push({
      hazard: 'flash_flood', severity: 'HIGH', urgency: 'immediate', confidence: 'HIGH',
      message: `Rischio elevato di allagamenti: ${round(input.precipitationTotalMm)} mm/24h, picco ${round(input.maxHourlyPrecipitationMm, 1)} mm/h`,
      action: 'Metti prima in sicurezza le persone; sospendi le attività in campo e libera solo i drenaggi raggiungibili senza esporti al pericolo.',
      steps: [
        'Consulta subito le allerte ufficiali regionali e comunali e segui eventuali indicazioni di Protezione Civile.',
        'Sospendi irrigazione, trattamenti e accesso a fossi, sottopassi, argini e zone depresse.',
        'Sposta in alto prodotti, attrezzature e quadri elettrici solo prima dell’evento e senza entrare in aree già allagate.'
      ],
      estimatedMinutes: 20,
      evidence: [`pioggia totale ${round(input.precipitationTotalMm)} mm`, `intensità massima ${round(input.maxHourlyPrecipitationMm, 1)} mm/h`],
      safetyNotice: 'Stima meteo di rischio pluviale, non sostituisce l’allerta idraulica ufficiale.'
    })
  } else if (input.precipitationTotalMm >= 30 || input.maxHourlyPrecipitationMm >= 15) {
    decisions.push({
      hazard: 'heavy_rain', severity: 'HIGH', urgency: 'today', confidence: 'HIGH',
      message: `Piogge abbondanti: ${round(input.precipitationTotalMm)} mm/24h`,
      action: 'Sospendi l’irrigazione, verifica drenaggi e proteggi suolo nudo, semenzai e materiali dilavabili prima dell’arrivo della pioggia.',
      steps: [
        'Pulisci griglie e canalette senza lavorare dentro fossi o corsi d’acqua.',
        'Fissa pacciamature e copri semenzai senza creare sacche dove l’acqua possa accumularsi.',
        'Rimanda concimazioni, diserbi, trattamenti fogliari e lavorazioni del terreno.'
      ],
      estimatedMinutes: 20,
      evidence: [`pioggia totale ${round(input.precipitationTotalMm)} mm`, `picco orario ${round(input.maxHourlyPrecipitationMm, 1)} mm/h`]
    })
  }

  if (hailCode) {
    decisions.push({
      hazard: 'hail', severity: 'HIGH', urgency: 'immediate', confidence: 'HIGH',
      message: 'Temporale con grandine indicato dal modello',
      action: 'Interrompi il lavoro all’aperto e usa reti antigrandine solo se possono essere chiuse in sicurezza prima del temporale.',
      steps: [
        'Raggiungi un edificio o un veicolo chiuso; non restare sotto alberi, serre leggere o reti durante il temporale.',
        'Prima dell’evento chiudi serre e tunnel, ritira vasi e attrezzature e verifica gli ancoraggi.',
        'Dopo l’evento fotografa i danni, rimuovi tessuti spezzati con utensili puliti e monitora marciumi senza trattare foglie bagnate.'
      ],
      estimatedMinutes: 20,
      evidence: ['codice meteo WMO 96/99: temporale con grandine'],
      safetyNotice: 'La localizzazione della grandine resta incerta: integra con radar e bollettini ufficiali.'
    })
  } else if (thunderstormCode || (input.capeMaxJkg >= 1500 && input.windGustMaxKmh >= 70)) {
    decisions.push({
      hazard: 'severe_thunderstorm', severity: 'HIGH', urgency: 'immediate', confidence: thunderstormCode ? 'HIGH' : 'MEDIUM',
      message: 'Rischio di temporale violento con fulmini e raffiche improvvise',
      action: 'Sospendi le attività all’aperto, metti in sicurezza strutture leggere e raggiungi un luogo chiuso prima dell’arrivo del temporale.',
      steps: [
        'Fissa teli, tunnel, serre leggere, tutori e oggetti mobili soltanto prima del peggioramento.',
        'Allontanati da alberi isolati, pali, recinzioni, acqua e zone aperte; attendi 30 minuti dall’ultimo tuono prima di uscire.',
        'Segui radar e allerte ufficiali: raffiche vorticose o trombe d’aria non sono localizzabili con precisione da questa previsione.'
      ],
      estimatedMinutes: 15,
      evidence: [
        thunderstormCode ? 'codice meteo temporalesco 95–99' : `CAPE ${round(input.capeMaxJkg)} J/kg`,
        `raffiche ${round(input.windGustMaxKmh)} km/h`
      ],
      safetyNotice: 'È una valutazione di ambiente favorevole a fenomeni violenti, non una previsione puntuale di tromba d’aria.'
    })
  }

  if (input.windGustMaxKmh >= 90) {
    decisions.push({
      hazard: 'violent_wind', severity: 'HIGH', urgency: 'immediate', confidence: 'HIGH',
      message: `Raffiche violente fino a ${round(input.windGustMaxKmh)} km/h`,
      action: 'Sospendi il lavoro all’aperto e allontanati da alberi, coperture e strutture mobili; metti in sicurezza solo ciò che è raggiungibile prima delle raffiche.',
      steps: [
        'Chiudi e ancora serre, tunnel e ombreggianti; se non sono progettati per il vento, ritira i teli in anticipo.',
        'Rinforza tutori e legature senza strozzare i fusti e ritira attrezzi, cassette e vasi.',
        'Rimanda irrorazioni, uso di scale e mezzi con elevata superficie esposta.'
      ],
      estimatedMinutes: 20,
      evidence: [`raffica massima ${round(input.windGustMaxKmh)} km/h`]
    })
  } else if (input.windGustMaxKmh >= 60 || input.windSpeedMaxKmh >= 50) {
    decisions.push({
      hazard: 'strong_wind', severity: 'HIGH', urgency: 'today', confidence: 'HIGH',
      message: `Vento forte: raffiche fino a ${round(input.windGustMaxKmh)} km/h`,
      action: 'Controlla ancoraggi, tutori e strutture leggere e sospendi trattamenti che possono andare in deriva.',
      steps: [
        'Fissa teli, reti e tunnel e rimuovi oggetti mobili.',
        'Controlla tutori e legature delle piante alte.',
        'Rimanda irrorazioni e lavorazioni con attrezzature instabili.'
      ],
      estimatedMinutes: 20,
      evidence: [`vento medio massimo ${round(input.windSpeedMaxKmh)} km/h`, `raffiche ${round(input.windGustMaxKmh)} km/h`]
    })
  }

  if (input.tempMax !== undefined && input.tempMax > 35) {
    decisions.push({
      hazard: 'heat', severity: 'HIGH', urgency: 'today', confidence: 'HIGH',
      message: `Caldo estremo previsto (${round(input.tempMax)}°C)`,
      action: 'Proteggi oggi le colture sensibili con ombreggiante 30–50%, irrigazione lenta al suolo nelle ore fresche e pacciamatura.',
      steps: [
        'Irriga tra le 05:00 e le 08:00, lentamente e alla base; prima controlla che i primi 5 cm di terreno siano asciutti.',
        'Ombreggia dalle 11:00 alle 17:00 soprattutto piantine, ortaggi a foglia e frutti esposti; non usare plastica chiusa.',
        'Stendi 5–8 cm di pacciamatura senza appoggiarla ai fusti e rimanda trapianti, potature e trattamenti fogliari.'
      ],
      estimatedMinutes: 25,
      evidence: [`temperatura massima ${round(input.tempMax)}°C`]
    })
  } else if (input.tempMax !== undefined && input.tempMax > 30) {
    decisions.push({
      hazard: 'heat', severity: 'MEDIUM', urgency: 'today', confidence: 'HIGH',
      message: `Temperature elevate previste (${round(input.tempMax)}°C)`,
      action: 'Controlla l’umidità del suolo e anticipa l’irrigazione al mattino; prepara ombreggiatura per le colture più sensibili.',
      steps: ['Controlla il terreno a 5 cm.', 'Se asciutto, irriga lentamente entro le 09:00.', 'Evita lavorazioni nelle ore più calde.'],
      estimatedMinutes: 15,
      evidence: [`temperatura massima ${round(input.tempMax)}°C`]
    })
  }

  if (input.tempMin !== undefined && input.tempMin < 0) {
    decisions.push({
      hazard: 'frost', severity: 'HIGH', urgency: 'today', confidence: 'HIGH',
      message: `Rischio gelo (minima ${round(input.tempMin)}°C)`,
      action: 'Copri le colture sensibili con tessuto non tessuto prima del tramonto e proteggi le radici con pacciamatura asciutta.',
      steps: ['Installa il telo senza farlo aderire alle foglie.', 'Sposta al riparo i vasi trasportabili.', 'Arieggia quando la temperatura risale.'],
      estimatedMinutes: 20,
      evidence: [`temperatura minima ${round(input.tempMin)}°C`]
    })
  } else if (input.tempMin !== undefined && input.tempMin < 5) {
    decisions.push({
      hazard: 'frost', severity: 'MEDIUM', urgency: 'today', confidence: 'HIGH',
      message: `Temperature basse (minima ${round(input.tempMin)}°C)`,
      action: 'Prepara tessuto non tessuto e ripara piantine e colture termofile prima della sera.',
      steps: ['Individua le colture più esposte.', 'Copri prima del tramonto lasciando circolare aria.', 'Controlla la minima al mattino.'],
      estimatedMinutes: 15,
      evidence: [`temperatura minima ${round(input.tempMin)}°C`]
    })
  }

  if (input.snowfallCm >= 10) {
    decisions.push({
      hazard: 'snow', severity: 'HIGH', urgency: 'today', confidence: 'HIGH',
      message: `Nevicata significativa prevista (${round(input.snowfallCm, 1)} cm)`,
      action: 'Sostieni o libera in anticipo serre e reti che potrebbero cedere sotto il carico e proteggi impianti e tubazioni.',
      steps: ['Rinforza tunnel e coperture.', 'Svuota o isola le linee esposte al gelo.', 'Rimuovi la neve dalle strutture solo se puoi operare in sicurezza.'],
      estimatedMinutes: 25,
      evidence: [`neve prevista ${round(input.snowfallCm, 1)} cm`]
    })
  }

  const order = { HIGH: 3, MEDIUM: 2, LOW: 1 }
  const urgency = { immediate: 3, today: 2, monitor: 1 }
  return decisions.sort((a, b) => order[b.severity] - order[a.severity] || urgency[b.urgency] - urgency[a.urgency])
}
