import { AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS, H, MONO, SANS, W, fadeIn, pop, sec, useInter } from "../theme";
import timings from "./timings-orchestratore-v2.json";

// Pilota v2 «Il motore che decide che cosa viene prima» (copione-pilota-orchestratore-v2.md).
// Rispetto alla v1: clip a velocità reale, stacchi netti di 1–3 s, schede che si muovono mentre la voce parla,
// voce di Adriatico ricollocata frase per frase con pause vere, musica più presente con uno stacco a vuoto su «Decidi tu».

const f = sec;
const TOTAL = f(46);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Dove parte ogni frase della ripresa (indice in timings-orchestratore-v2.json → secondo nel video).
const VOICE_AT = [0.3, 1.1, 1.9, 2.7, 3.5, 5.0, 7.6, 9.8, 11.8, 13.0, 15.4, 16.4, 19.8, 21.6, 22.9, 26.6, 27.8, 29.7, 32.2, 35.4, 36.9, 38.8, 42.2];
const voice = timings.map((t, i) => ({ ...t, at: VOICE_AT[i] }));
const vStart = (i: number) => f(voice[i].at);
const vEnd = (i: number) => f(voice[i].at + voice[i].end - voice[i].start);

// Stacco netto: nessuna dissolvenza.
const Cut: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={f(from)} durationInFrames={f(to) - f(from)}>{children}</Sequence>
);

const Media: React.FC<{ src: string; start?: number; dim?: number; push?: number; vertical: boolean }> = ({ src, start = 0, dim = 0.2, push = 0.06, vertical }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, f(3)], [1.02, 1.02 + push], clamp);
  return <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
    <OffthreadVideo src={staticFile(`footage/${src}`)} startFrom={f(start)} muted
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
    <AbsoluteFill style={{ background: `linear-gradient(${vertical ? "180deg" : "90deg"}, rgba(7,29,26,${dim * .4}), rgba(7,29,26,${Math.min(.85, dim + .25)}))` }} />
  </AbsoluteFill>;
};

const Badge: React.FC<{ vertical: boolean }> = ({ vertical }) => <div style={{ position: "absolute", top: vertical ? 64 : 42, left: vertical ? 44 : 58, fontFamily: MONO, fontSize: vertical ? 24 : 20, letterSpacing: 2, color: C.paper, border: `1px solid ${C.mint}`, background: "rgba(11,42,38,.78)", borderRadius: 999, padding: "10px 18px", zIndex: 30 }}>SCENARIO DIMOSTRATIVO</div>;

const Card: React.FC<{ vertical: boolean; width?: number; top?: number; children: React.ReactNode }> = ({ vertical, width = 900, top, children }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, 0);
  return <div style={{ position: "absolute", left: vertical ? 44 : "auto", right: vertical ? 44 : 90, top: top ?? (vertical ? 330 : 140), width: vertical ? "auto" : width, fontFamily: SANS, color: C.ink, background: "rgba(246,243,236,.97)", borderRadius: vertical ? 34 : 26, padding: vertical ? "36px 34px" : "32px 38px", boxShadow: "0 30px 100px rgba(0,0,0,.45)", opacity: fadeIn(frame, 0, 6), transform: `translateY(${(1 - p) * 40}px) scale(${.96 + p * .04})` }}>{children}</div>;
};
const Label = ({ children, color = C.petrol }: { children: React.ReactNode; color?: string }) => <div style={{ fontFamily: MONO, color, fontWeight: 800, fontSize: 20, letterSpacing: 2 }}>{children}</div>;

// Atto 1: una parola per stacco.
const Word: React.FC<{ text: string; vertical: boolean }> = ({ text, vertical }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, 0);
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ fontFamily: MONO, fontWeight: 800, color: C.white, fontSize: vertical ? 110 : 150, letterSpacing: 10, textShadow: "0 8px 40px rgba(0,0,0,.6)", transform: `scale(${1.25 - p * .25})`, opacity: fadeIn(frame, 0, 3) }}>{text}</div>
  </AbsoluteFill>;
};

// Atti 2–3: i segnali si moltiplicano, poi convergono al centro (da `gather`) e spariscono nella coda.
const SIGNALS = ["METEO", "SUOLO", "ACQUA", "PIANTE", "OPERAZIONI", "UMIDITÀ 31%", "PIOGGIA 0 mm", "GDD 428", "FASE: fioritura", "FILARE 4", "STRESS IDRICO", "pH 6,4", "ULTIMO TRATTAMENTO", "VENTO 22 km/h", "ET0 5,1", "TASK APERTI 7", "NDVI", "TEMP. SUOLO 18°", "IRRIGAZIONE PREVISTA", "FOTO FOGLIA", "RACCOLTO 2025", "CATTURE TRAPPOLA", "ORE DI SOLE 9", "OPERATORE: Luca"];
const SignalCloud: React.FC<{ vertical: boolean; gather: number }> = ({ vertical, gather }) => {
  const frame = useCurrentFrame();
  const g = interpolate(frame, [gather, gather + 22], [0, 1], { ...clamp, easing: (t) => t * t });
  const w = vertical ? 1080 : 1920, h = vertical ? 1920 : 1080;
  return <AbsoluteFill>{SIGNALS.map((s, i) => {
    // In verticale meno colonne e più righe, altrimenti le etichette si sovrappongono.
    const x = vertical ? ((i * 3) % 4) / 4 * (w - 300) + 40 : ((i * 37) % 9) / 9 * (w - 360) + 60;
    const y = vertical ? ((i * 7) % 24) / 24 * (h - 420) + 180 : ((i * 53) % 11) / 11 * (h - 300) + 150;
    const appear = i * 3;
    const cx = w / 2 - 120, cy = h / 2 - 30;
    return <div key={s} style={{ position: "absolute", left: x + (cx - x) * g, top: y + (cy - y) * g, opacity: fadeIn(frame, appear, 4) * (1 - g * .9), transform: `scale(${1 - g * .6})`, fontFamily: MONO, fontSize: vertical ? 26 : 24, fontWeight: 700, color: i % 5 === 2 ? C.gold : C.white, background: "rgba(11,42,38,.72)", border: `1px solid ${i % 5 === 2 ? C.gold : "rgba(159,211,199,.5)"}`, borderRadius: 10, padding: "8px 14px", whiteSpace: "nowrap" }}>{s}</div>;
  })}</AbsoluteFill>;
};

// Atto 3: la coda si riordina; «Controllare stress idrico» sale in cima, poi punteggio e confidenza contano.
const QUEUE = [
  { t: "Concimazione di copertura", s: 41 },
  { t: "Controllo trappole", s: 55 },
  { t: "Controllare stress idrico", s: 82 },
  { t: "Lavorazione interfila", s: 34 },
  { t: "Verifica impianto a goccia", s: 63 },
];
const Engine: React.FC<{ vertical: boolean; sortFrom: number; scoreFrom: number }> = ({ vertical, sortFrom, scoreFrom }) => {
  const frame = useCurrentFrame();
  const order = [...QUEUE].sort((a, b) => b.s - a.s);
  const k = interpolate(frame, [sortFrom, sortFrom + 18], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const rowH = vertical ? 112 : 92;
  const score = Math.round(interpolate(frame, [scoreFrom, scoreFrom + 20], [0, 82], clamp));
  const conf = interpolate(frame, [scoreFrom, scoreFrom + 20], [0, .74], clamp).toFixed(2).replace(".", ",");
  return <Card vertical={vertical} width={960} top={vertical ? 420 : 150}>
    <Label>ORCHESTRATORE · CHE COSA VIENE PRIMA</Label>
    <div style={{ position: "relative", height: rowH * 5, marginTop: 20 }}>{QUEUE.map((q, i) => {
      const y = interpolate(k, [0, 1], [i, order.indexOf(q)]) * rowH;
      const top = q.s === 82;
      const lit = top && frame >= sortFrom + 12;
      return <div key={q.t} style={{ position: "absolute", left: 0, right: 0, top: y, height: rowH - 12, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", borderRadius: 16, background: lit ? C.night : C.white, color: lit ? C.white : C.ink, border: `1px solid ${lit ? C.night : C.line}`, opacity: fadeIn(frame, i * 3, 6), transform: lit ? `scale(${1 + .03 * pop(frame, sortFrom + 12)})` : undefined, zIndex: top ? 2 : 1 }}>
        <span style={{ fontSize: vertical ? 32 : 28, fontWeight: lit ? 820 : 650 }}>{q.t}</span>
        <span style={{ fontFamily: MONO, fontSize: vertical ? 26 : 22, color: lit ? C.mint : C.muted }}>{top ? (frame >= scoreFrom ? `${score} · conf. ${conf}` : "") : q.s}</span>
      </div>;
    })}</div>
  </Card>;
};

// Atto 4: il perché si apre in tre righe; il dato mancante in ambra.
const Why: React.FC<{ vertical: boolean; missingFrom: number }> = ({ vertical, missingFrom }) => {
  const frame = useCurrentFrame();
  const rows: [string, string, boolean][] = [["Perché viene prima", "umidità in calo · fase sensibile", false], ["Dati usati", "meteo · suolo · irrigazioni registrate", false], ["Dato mancante", "portata del settore 3", true]];
  return <Card vertical={vertical} width={940} top={vertical ? 420 : 170}>
    <Label>CONTROLLARE STRESS IDRICO · 82 · CONF. 0,74</Label>
    {rows.map(([a, b, miss], i) => {
      const from = miss ? missingFrom : i * 8;
      return <div key={a} style={{ marginTop: 16, opacity: fadeIn(frame, from, 5), transform: `translateX(${(1 - pop(frame, from)) * 40}px)`, background: miss ? "#fff4df" : C.white, border: `2px solid ${miss ? C.amber : C.line}`, borderRadius: 16, padding: "18px 22px" }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: miss ? C.amber : C.muted }}>{miss ? "△ " : ""}{a.toUpperCase()}</div>
        <div style={{ fontSize: vertical ? 32 : 29, fontWeight: 760, marginTop: 6 }}>{b}</div>
      </div>;
    })}
  </Card>;
};

// Atto 5: campo → filare → pianta. Riquadro che si stringe sull'immagine e targhetta.
const Target: React.FC<{ vertical: boolean; label: string; box: [number, number, number, number] }> = ({ vertical, label, box }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 10], [1.4, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 });
  const [l, t, w, h] = box;
  return <AbsoluteFill>
    <div style={{ position: "absolute", left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%`, border: `4px solid ${C.gold}`, borderRadius: 12, boxShadow: "0 0 0 2000px rgba(7,29,26,.35)", transform: `scale(${k})`, opacity: fadeIn(frame, 0, 4) }} />
    <div style={{ position: "absolute", left: `${l}%`, top: `calc(${t + h}% + 16px)`, fontFamily: MONO, fontWeight: 800, fontSize: vertical ? 40 : 38, letterSpacing: 4, color: C.night, background: C.gold, borderRadius: 10, padding: "8px 18px", opacity: fadeIn(frame, 5, 4) }}>{label}</div>
  </AbsoluteFill>;
};
const Plant: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const rows = [["Ultimo intervento", "irrigazione · 3 giorni fa"], ["Stato", "foglie in stress · osservato"], ["Proposta", "controllo e correzione irrigua"]];
  return <Card vertical={vertical} width={760} top={vertical ? 1000 : 180}>
    <Label>NORD 02 · FILARE 4</Label>
    <div style={{ fontSize: vertical ? 64 : 60, fontWeight: 860, marginTop: 8 }}>Pianta 047</div>
    {rows.map(([a, b], i) => <div key={a} style={{ display: "flex", justifyContent: "space-between", gap: 20, borderTop: `1px solid ${C.line}`, padding: "14px 0", marginTop: i ? 0 : 14, opacity: fadeIn(frame, 8 + i * 6, 5), fontSize: vertical ? 27 : 24 }}><span style={{ color: C.muted }}>{a}</span><span style={{ fontWeight: 760, textAlign: "right", color: i === 1 ? C.amber : C.ink }}>{b}</span></div>)}
  </Card>;
};

// Atto 6: la conferma è un gesto della persona.
const Confirm: React.FC<{ vertical: boolean; tapAt: number }> = ({ vertical, tapAt }) => {
  const frame = useCurrentFrame();
  const done = frame >= tapAt;
  const press = interpolate(frame, [tapAt - 4, tapAt, tapAt + 5], [1, .93, 1], clamp);
  return <AbsoluteFill style={{ background: C.night, justifyContent: "center", alignItems: "center", fontFamily: SANS }}>
    <div style={{ width: vertical ? 900 : 860, background: C.paper, borderRadius: 30, padding: 40, boxShadow: "0 30px 100px rgba(0,0,0,.5)" }}>
      <Label>PROPOSTA · PIANTA 047</Label>
      <div style={{ fontSize: vertical ? 46 : 44, fontWeight: 840, marginTop: 10 }}>Controllare stress idrico</div>
      <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
        <div style={{ flex: 1, textAlign: "center", fontSize: 28, fontWeight: 700, padding: "22px 0", borderRadius: 18, border: `2px solid ${C.line}`, color: C.muted }}>Modifica</div>
        <div style={{ flex: 1.4, textAlign: "center", fontSize: 30, fontWeight: 820, padding: "22px 0", borderRadius: 18, background: done ? C.ok : C.petrol, color: C.white, transform: `scale(${press})` }}>{done ? "✓ Confermata" : "Conferma"}</div>
      </div>
    </div>
  </AbsoluteFill>;
};

// Atto 7: il compito diventa fatto e scende nel registro.
const Done: React.FC<{ vertical: boolean; doneAt: number; logAt: number }> = ({ vertical, doneAt, logAt }) => {
  const frame = useCurrentFrame();
  const done = frame >= doneAt;
  return <Card vertical={vertical} width={900} top={vertical ? 380 : 150}>
    <Label>COMPITO · NORD 02 · FILARE 4 · PIANTA 047</Label>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
      <div style={{ fontSize: vertical ? 38 : 34, fontWeight: 820 }}>Correzione irrigua</div>
      <div style={{ background: done ? C.ok : C.sand, color: done ? C.white : C.muted, borderRadius: 999, padding: "12px 20px", fontWeight: 800, fontSize: 22, transform: `scale(${done ? .9 + .1 * pop(frame, doneAt) : 1})` }}>{done ? "✓ FATTO" : "DA FARE"}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 22 }}>
      {[["PIANIFICATA", "12 L"], ["MISURATA", "11 L"], ["ORA", "07:42"], ["OPERATORE", "Luca"]].map(([a, b], i) => <div key={a} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, opacity: .35 + .65 * fadeIn(frame, logAt + i * 4, 5) }}><div style={{ fontFamily: MONO, fontSize: 17, color: C.muted }}>{a}</div><div style={{ fontSize: vertical ? 32 : 28, fontWeight: 800, marginTop: 4 }}>{b}</div></div>)}
    </div>
    <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 19, color: C.petrol, opacity: fadeIn(frame, logAt + 18, 6) }}>→ REGISTRO OPERATIVO</div>
  </Card>;
};

// Atto 8: atteso contro reale, prima per filare poi per pianta. Nessuna coltura, nessuna data.
const ROWS = [[100, 104], [100, 97], [100, 101], [100, 72], [100, 99], [100, 95]];
const Harvest: React.FC<{ vertical: boolean; rowsFrom: number; plantsFrom: number }> = ({ vertical, rowsFrom, plantsFrom }) => {
  const frame = useCurrentFrame();
  const plants = frame >= plantsFrom;
  return <Card vertical={vertical} width={920} top={vertical ? 380 : 140}>
    <Label>RACCOLTO · ATTESO ↔ REALE</Label>
    {!plants && <div style={{ marginTop: 18 }}>{ROWS.map(([, real], i) => {
      const on = frame >= rowsFrom + i * 5;
      const low = real < 90;
      const w = interpolate(frame, [rowsFrom + i * 5, rowsFrom + i * 5 + 8], [0, real], clamp);
      return <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 80px", alignItems: "center", gap: 14, marginTop: 10, fontSize: vertical ? 25 : 22 }}>
        <span style={{ fontFamily: MONO, color: low && on ? C.amber : C.muted }}>FILARE {i + 1}</span>
        <div style={{ position: "relative", height: 26, background: C.sand, borderRadius: 8 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${w * .9}%`, background: low ? C.amber : C.petrol, borderRadius: 8 }} />
          <div style={{ position: "absolute", left: "90%", top: -6, bottom: -6, width: 3, background: C.ink }} />
        </div>
        <span style={{ fontWeight: 800, color: low ? C.amber : C.ink, opacity: on ? 1 : 0 }}>{real}%</span>
      </div>;
    })}<div style={{ marginTop: 14, fontSize: 19, color: C.muted }}>linea nera = atteso · barra = reale</div></div>}
    {plants && <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: vertical ? 34 : 30, fontWeight: 820 }}>Filare 4 · pianta per pianta</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10, marginTop: 18 }}>{Array.from({ length: 48 }, (_, i) => {
        const low = [5, 6, 17, 18, 19, 30, 46].includes(i);
        const hit = i === 46;
        return <div key={i} style={{ aspectRatio: "1", borderRadius: 999, background: low ? C.amber : C.petrol, opacity: fadeIn(frame, plantsFrom + (i % 12), 4), outline: hit ? `4px solid ${C.ink}` : undefined, outlineOffset: 3 }} />;
      })}</div>
      <div style={{ marginTop: 16, fontFamily: MONO, fontSize: 20, color: C.amber, opacity: fadeIn(frame, plantsFrom + 14, 6) }}>7 PIANTE SOTTO L'ATTESO · TRA CUI LA 047</div>
    </div>}
  </Card>;
};

const End: React.FC<{ vertical: boolean; ctaAt: number }> = ({ vertical, ctaAt }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: "rgba(11,42,38,.74)", justifyContent: "center", alignItems: "center", textAlign: "center", fontFamily: SANS, padding: vertical ? 50 : 80 }}>
    <div style={{ opacity: fadeIn(frame, 0, 8), transform: `scale(${.9 + .1 * pop(frame, 0)})`, background: C.white, borderRadius: 24, padding: "22px 30px" }}><Img src={staticFile("images/logo.png")} style={{ height: vertical ? 190 : 150, display: "block" }} /></div>
    <div style={{ color: C.white, fontSize: vertical ? 64 : 70, fontWeight: 860, lineHeight: 1.08, marginTop: 34, maxWidth: 1200, opacity: fadeIn(frame, 8, 8) }}>Il campo non ricomincia da zero.</div>
    <div style={{ marginTop: 34, opacity: fadeIn(frame, ctaAt, 8), transform: `translateY(${(1 - pop(frame, ctaAt)) * 20}px)`, background: C.gold, color: C.night, fontWeight: 820, fontSize: vertical ? 38 : 36, borderRadius: 999, padding: "18px 36px" }}>Prenota la prova guidata · ortomioapp.it</div>
  </AbsoluteFill>;
};

const Captions: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  // Le cinque parole d'apertura sono già a schermo.
  const cur = voice.slice(5).find((v, i) => frame >= vStart(i + 5) && frame <= vEnd(i + 5) + 6);
  if (!cur) return null;
  return <div style={{ position: "absolute", left: vertical ? 34 : 80, right: vertical ? 34 : 80, bottom: vertical ? 120 : 40, display: "flex", justifyContent: "center", zIndex: 20 }}>
    <div style={{ background: "rgba(7,29,26,.84)", borderRadius: 14, padding: vertical ? "14px 24px" : "10px 24px", fontFamily: SANS, fontSize: vertical ? 44 : 38, fontWeight: 720, lineHeight: 1.2, textAlign: "center", color: C.paper }}>{cur.text}</div>
  </div>;
};

// Musica: sale fino al motore, si spegne prima di «Decidi tu», riparte con la squadra, sfuma in chiusura.
const musicVolume = (frame: number) => {
  const s = frame / FPS;
  const base = interpolate(s, [0, .4, 9, 15], [0, .16, .16, .2], clamp);
  const gap = interpolate(s, [25.6, 26.0, 27.4, 27.9], [1, 0, 0, 1], clamp);
  const out = interpolate(s, [40, 46], [1, 0], clamp);
  return base * gap * out;
};

export const PilotV2Film: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  useInter();
  const v = vertical;
  return <AbsoluteFill style={{ background: C.night }}>
    {/* Atto 1 · segnali */}
    {([["B7-39423510.mp4", 2, "METEO"], ["proxy/P1-5766179.mp4", 1, "SUOLO"], ["2a-7002250.mp4", 1, "ACQUA"], ["P1-14749090.mp4", 2, "PIANTE"], ["T1a-5694893.mp4", 2, "OPERAZIONI"]] as const).map(([src, st, word], i) =>
      <Cut key={word} from={i === 0 ? 0 : VOICE_AT[i] - .1} to={i === 4 ? 4.8 : VOICE_AT[i + 1] - .1}><Media src={src} start={st} dim={.3} push={.1} vertical={v} /><Word text={word} vertical={v} /></Cut>)}
    {/* Atto 2 · troppi segnali */}
    <Cut from={4.8} to={6.6}><Media src="proxy/P1-19546340.mp4" start={2} dim={.35} vertical={v} /></Cut>
    <Cut from={6.6} to={8.6}><Media src="2a-9101576.mp4" start={1} dim={.45} vertical={v} /></Cut>
    <Cut from={4.8} to={8.6}><SignalCloud vertical={v} gather={f(6.6 - 4.8)} /></Cut>
    {/* Atto 3 · il motore */}
    <Cut from={8.6} to={11.4}><Media src="B6-10636140.mp4" start={1} dim={.6} push={.04} vertical={v} /></Cut>
    <Cut from={11.4} to={15.2}><Media src="2a-9101576.mp4" start={3} dim={.6} push={.04} vertical={v} /></Cut>
    <Cut from={10.0} to={15.2}><Engine vertical={v} sortFrom={f(11.8 - 10)} scoreFrom={f(13.2 - 10)} /></Cut>
    {/* Atto 4 · il perché */}
    <Cut from={15.2} to={17.4}><Media src="4b-1-34542987.mp4" start={3} dim={.55} vertical={v} /></Cut>
    <Cut from={17.4} to={19.6}><Media src="P1-10039770.mp4" start={3} dim={.55} vertical={v} /></Cut>
    <Cut from={15.2} to={19.6}><Why vertical={v} missingFrom={f(17.4 - 15.2)} /></Cut>
    {/* Atto 5 · campo, filare, pianta */}
    <Cut from={19.6} to={21.4}><Media src="proxy/P1-19546340.mp4" start={20} dim={.15} push={.12} vertical={v} /><Target vertical={v} label="NORD 02" box={v ? [20, 35, 60, 22] : [30, 28, 34, 34]} /></Cut>
    <Cut from={21.4} to={22.8}><Media src="2a-9101576.mp4" start={4} dim={.15} push={.12} vertical={v} /><Target vertical={v} label="FILARE 4" box={v ? [3, 24, 28, 48] : [22, 18, 18, 62]} /></Cut>
    <Cut from={22.8} to={24.4}><Media src="P1-14749090.mp4" start={1} dim={.3} push={.08} vertical={v} /></Cut>
    <Cut from={24.4} to={26.0}><Media src="2a-7002250.mp4" start={2} dim={.3} push={.08} vertical={v} /></Cut>
    <Cut from={22.8} to={26.0}><Plant vertical={v} /></Cut>
    {/* Atto 6 · decidi tu */}
    <Cut from={26.0} to={27.6}><Confirm vertical={v} tapAt={f(26.9 - 26)} /></Cut>
    {/* Atto 7 · si interviene lì */}
    <Cut from={27.6} to={29.6}><Media src="P1-14086016.mp4" start={.5} dim={.3} vertical={v} /></Cut>
    <Cut from={29.6} to={32.0}><Media src="P1-14823494.mp4" start={2} dim={.4} vertical={v} /></Cut>
    <Cut from={28.0} to={32.0}><Done vertical={v} doneAt={f(29.0 - 28)} logAt={f(29.8 - 28)} /></Cut>
    {/* Atto 8 · il raccolto */}
    <Cut from={32.0} to={33.6}><Media src="P1-14823494.mp4" start={1} dim={.4} vertical={v} /></Cut>
    <Cut from={33.6} to={35.2}><Media src="B6-6609491.mp4" start={2} dim={.4} vertical={v} /></Cut>
    <Cut from={35.2} to={36.8}><Media src="P1-10039770.mp4" start={3} dim={.4} vertical={v} /></Cut>
    <Cut from={36.8} to={38.4}><Media src="P1-10576691.mp4" start={.5} dim={.4} vertical={v} /></Cut>
    <Cut from={32.6} to={38.4}><Harvest vertical={v} rowsFrom={f(33.2 - 32.6)} plantsFrom={f(36.9 - 32.6)} /></Cut>
    {/* Atto 9 · chiusura */}
    <Cut from={38.4} to={46}><Media src="proxy/P1-19546340.mp4" start={30} dim={.15} push={.08} vertical={v} /></Cut>
    <Cut from={41.6} to={46}><End vertical={v} ctaAt={f(43.4 - 41.6)} /></Cut>
    <Badge vertical={v} />
    <Captions vertical={v} />
    {voice.map((t, i) => <Sequence key={i} from={vStart(i)} durationInFrames={vEnd(i) - vStart(i) + 4}>
      <Audio src={staticFile("audio/adriatico/orchestratore-v2.mp3")} startFrom={f(t.start)} />
    </Sequence>)}
    <Audio src={staticFile("audio/musica/acoustic-corporate.mp3")} volume={musicVolume} />
  </AbsoluteFill>;
};

export const PilotV2Composition = () => <>
  <Composition id="OrtoMio-Pilota-Orchestratore-v2-16x9" component={PilotV2Film} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
  <Composition id="OrtoMio-Pilota-Orchestratore-v2-9x16" component={PilotV2Film} defaultProps={{ vertical: true }} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
</>;
