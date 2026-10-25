import { FPS } from "../theme";
import TIMINGS from "./timings.json";
import TIMINGS_TECNICO from "./timings-tecnico.json";
import TIMINGS_COLTURA from "./timings-coltura.json";

// Testi approvati: copione-titolare-v1.md (D13, frasi 4a e 4c riscritte dopo l'ascolto) e copione-tecnico-v1.md (D16).
// timings*.json (scripts/align_voice.py) danno inizio e fine di ogni frase nelle riprese di Adriatico.
// Ogni frase viene ricollocata sulla linea del tempo con una pausa fra le frasi e una più lunga fra le sezioni.

export const TAKE = "audio/adriatico/take-v2.mp3";
export const TAKE_TECNICO = "audio/adriatico/tecnico.mp3";
export const TAKE_COLTURA = "audio/adriatico/coltura.mp3";

export const SECTIONS: string[][] = [
  [
    "Sono le sei.",
    "Il quaderno da una parte, le foto sul telefono, i messaggi della squadra, il meteo su un'altra app.",
    "E la domanda di ogni mattina: oggi da dove comincio?",
  ],
  ["E se ogni intervento arrivasse con il suo perché scritto accanto?"],
  ["OrtoMio è il cervello agronomico della tua azienda: mette in fila il lavoro del giorno e ti spiega ogni scelta."],
  [
    "Ogni mattina, una coda di azioni motivate, ognuna con il suo perché e con quanto costa aspettare.",
    "Anche non intervenire è una scelta con un prezzo.",
  ],
  [
    "In campo, la squadra vede che cosa fare e dove.",
    "Fatto, registrato.",
    "Il campo risponde, il sistema prende nota.",
  ],
  [
    "A fine stagione ritrovi tutto: le decisioni prese, il loro perché, e com'è andata.",
    "E più lo usi, più le proposte assomigliano al tuo campo, non a una media.",
  ],
  ["Lavora con i dati che hai, e ti dice quali mancano.", "La decisione resta tua."],
  ["OrtoMio. Decisioni agronomiche verificabili.", "Dalla decisione al raccolto, zero improvvisazione."],
];

// Video del tecnico: le frasi della ripresa del titolare si riusano, le nuove stanno in tecnico.mp3.
export const SECTIONS_TECNICO: string[][] = [
  [
    "Il cliente ti scrive: perché abbiamo trattato quel vigneto tre settimane fa?",
    "La risposta c'è. Sparsa fra messaggi, foto e appunti di cinque aziende diverse.",
  ],
  ["E se ogni tuo consiglio restasse scritto, con il suo perché?"],
  ["OrtoMio è il cervello agronomico delle aziende che segui: ognuna con i suoi dati, i suoi campi, la sua squadra."],
  ["Ogni mattina, una coda di azioni motivate, ognuna con il suo perché e con quanto costa aspettare."],
  ["Lavora con i dati che hai, e ti dice quali mancano.", "E il calcolo resta visibile, anche al tuo cliente."],
  ["Il campo risponde, il sistema prende nota.", "Quello che avevi previsto, accanto a com'è andata."],
  ["Tu consigli come sempre. Ora il tuo ragionamento resta scritto."],
  ["OrtoMio. Decisioni agronomiche verificabili.", "Dalla decisione al raccolto, zero improvvisazione."],
];

const SENTENCE_GAP = 0.35;
const SECTION_GAP = 0.9;
const LEAD_IN = 0.8;
const TAIL = 3;

export type Caption = { text: string; start: number; end: number; section: number };
// Un pezzo di ripresa: file, dove inizia nel file (src) e dove va nel video (at), in fotogrammi.
export type VoiceCut = { file: string; at: number; src: number; len: number };
type Measured = { text: string; start: number; end: number };
const SOURCES: [string, Measured[]][] = [
  [TAKE, TIMINGS as Measured[]],
  [TAKE_TECNICO, TIMINGS_TECNICO as Measured[]],
  [TAKE_COLTURA, TIMINGS_COLTURA as Measured[]],
];

export type Timeline = { captions: Caption[]; cuts: VoiceCut[]; sections: { start: number; end: number }[]; total: number };

export const build = (sections: string[][], tail = TAIL): Timeline => {
  const captions: Caption[] = [];
  const cuts: VoiceCut[] = [];
  const starts: number[] = [];
  let t = LEAD_IN;
  sections.forEach((lines, s) => {
    starts.push(s === 0 ? 0 : Math.round((t - SECTION_GAP / 2) * FPS));
    lines.forEach((text) => {
      const [file, list] = SOURCES.find(([, l]) => l.some((x) => x.text === text))!;
      const m = list.find((x) => x.text === text)!;
      const next = list.filter((x) => x.start > m.start).sort((a, b) => a.start - b.start)[0];
      // Coda di 0,12 s, mai oltre il pre-roll della frase successiva nella ripresa.
      const d = Math.min(m.end - m.start + 0.12, next ? next.start - 0.04 - m.start : Infinity);
      const src = Math.ceil(Math.max(0, m.start - 0.04) * FPS);
      cuts.push({ file, at: Math.round(t * FPS), src, len: Math.floor((m.start + d) * FPS) - src });
      captions.push({ text, start: Math.round(t * FPS), end: Math.round((t + d) * FPS), section: s });
      t += d + SENTENCE_GAP;
    });
    t += SECTION_GAP - SENTENCE_GAP;
  });
  const total = Math.round((t + tail) * FPS);
  return { captions, cuts, sections: starts.map((start, i) => ({ start, end: i + 1 < starts.length ? starts[i + 1] : total })), total };
};

export const TITOLARE = build(SECTIONS);
export const TECNICO = build(SECTIONS_TECNICO);

// Inizio di una frase (sezione s, frase i), per agganciare le animazioni alla voce.
export const atIn = (tl: Timeline) => (s: number, i: number) => tl.captions.filter((c) => c.section === s)[i].start;
