import { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Composition, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS, H, SANS, W, fadeIn, useInter } from "../theme";
import { TITOLARE, Timeline, atIn } from "./narration";
import { Briefing, Diary, Logo, Queue, Rotation, Scattered, Season, TaskCard, Transparency } from "./ui";

// Video 1 «Titolare» (copione-titolare-v1.md): stock Pexels, schermate OrtoMio ricostruite con dati demo,
// voce di Adriatico (take-v2) ricollocata frase per frase, letto musicale Pixabay.
// Stesso montaggio in 16:9 e 9:16: in verticale le riprese si ritagliano al centro e i pannelli vanno nella metà bassa.

const TL = TITOLARE;
const S = TL.sections;
const at = atIn(TL);
const TOTAL_FRAMES = TL.total;
export const Vertical = createContext(false);
export const useV = () => useContext(Vertical);

export const Clip: React.FC<{ src: string; startAt?: number; dim?: number; blur?: number }> = ({ src, startAt = 0, dim = 0, blur = 0 }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 10 * FPS], [1.04, 1.12]);
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(`footage/${src}`)}
        startFrom={Math.round(startAt * FPS)}
        playbackRate={0.85}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})`, filter: blur ? `blur(${blur}px)` : undefined }}
      />
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(11,42,38,${dim})` }} />}
    </AbsoluteFill>
  );
};

export const Shot: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={from} durationInFrames={Math.max(1, to - from)}>
    <Fade>{children}</Fade>
  </Sequence>
);
const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: fadeIn(f, 0, 8) }}>{children}</AbsoluteFill>;
};

// Sfumatura scura dove compare il prodotto: a destra in orizzontale, in basso in verticale.
export const Side: React.FC = () => {
  const v = useV();
  return <AbsoluteFill style={{ background: `linear-gradient(${v ? "180deg" : "90deg"}, rgba(11,42,38,0) ${v ? 25 : 35}%, rgba(11,42,38,0.85) ${v ? 60 : 75}%)` }} />;
};

// Pannello: posizione propria in orizzontale; in verticale centrato a vTop, rimpicciolito di k.
// In orizzontale i pannelli si ingrandiscono di hk: i testi restano leggibili anche su un telefono.
export const Panel: React.FC<{ h: React.CSSProperties; vTop?: number; k?: number; hk?: number; children: React.ReactNode }> = ({ h, vTop = 900, k = 1, hk = 1.25, children }) => {
  const v = useV();
  return v ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: vTop, display: "flex", justifyContent: "center", transform: `scale(${k})`, transformOrigin: "top center" }}>{children}</div>
  ) : (
    <div style={{ position: "absolute", ...h, transform: `scale(${hk})`, transformOrigin: "top right" }}>{children}</div>
  );
};

export const Center: React.FC<{ vTop?: number; k?: number; hk?: number; top?: number; children: React.ReactNode }> = ({ vTop = 560, k = 1.12, hk = 1.3, top = 0, children }) => {
  const v = useV();
  return v ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: vTop, display: "flex", justifyContent: "center", transform: `scale(${k})`, transformOrigin: "top center" }}>{children}</div>
  ) : (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top }}>
      <div style={{ transform: `scale(${hk})` }}>{children}</div>
    </AbsoluteFill>
  );
};

// Testo grande a schermo; la frase corrispondente non ha sottotitolo.
export const Big: React.FC<{ text: string; from: number; vTop?: number; top?: number }> = ({ text, from, vTop = 1250, top = 0 }) => {
  const f = useCurrentFrame();
  const v = useV();
  return (
    <AbsoluteFill style={{ justifyContent: v ? "flex-start" : "center", alignItems: "center", paddingTop: v ? vTop : 0, top: v ? 0 : top }}>
      <div style={{ opacity: fadeIn(f, from, 12), transform: `translateY(${(1 - fadeIn(f, from, 14)) * 20}px)`, fontFamily: SANS, fontWeight: 800, fontSize: v ? 84 : 96, color: C.white, textAlign: "center", lineHeight: 1.1, padding: "0 60px", textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const NO_CAPTION = new Set([
  "Tu consigli come sempre. Ora il tuo ragionamento resta scritto.",
  "E la domanda di ogni mattina: oggi da dove comincio?",
  "La decisione resta tua.",
  "OrtoMio. Decisioni agronomiche verificabili.",
  "Dalla decisione al raccolto, zero improvvisazione.",
]);

export const Captions: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const f = useCurrentFrame();
  const v = useV();
  const c = tl.captions.find((x) => f >= x.start && f <= x.end + 10);
  if (!c || NO_CAPTION.has(c.text)) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: v ? 230 : 56, display: "flex", justifyContent: "center", padding: "0 50px" }}>
      <div style={{ maxWidth: v ? 980 : 1400, background: "rgba(11,42,38,0.78)", color: C.paper, fontFamily: SANS, fontSize: v ? 44 : 38, fontWeight: 600, lineHeight: 1.3, padding: "14px 28px", borderRadius: 12, textAlign: "center" }}>
        {c.text}
      </div>
    </div>
  );
};

export const LogoCard: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.petrolDark, justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: fadeIn(f, 0, 12), background: C.white, borderRadius: 28, padding: "30px 40px" }}><Logo height={300} /></div>
    </AbsoluteFill>
  );
};

export const EndCard: React.FC<{ tagFrom: number }> = ({ tagFrom }) => {
  const f = useCurrentFrame();
  const v = useV();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 60px", fontFamily: SANS }}>
      <div style={{ opacity: fadeIn(f, 0, 14), background: C.white, borderRadius: 28, padding: "24px 34px" }}><Logo height={v ? 260 : 230} /></div>
      <div style={{ fontSize: v ? 58 : 62, fontWeight: 800, color: C.white, marginTop: 36, opacity: fadeIn(f, 10) }}>Decisioni agronomiche verificabili</div>
      <div style={{ fontSize: v ? 38 : 40, color: C.mint, marginTop: 16, opacity: fadeIn(f, tagFrom) }}>Dalla decisione al raccolto, zero improvvisazione.</div>
      <div style={{ marginTop: 40, opacity: fadeIn(f, tagFrom + 50), background: C.gold, color: C.night, borderRadius: 999, padding: "16px 36px", fontSize: v ? 34 : 32, fontWeight: 800 }}>
        Prenota la prova guidata · ortomioapp.it
      </div>
    </AbsoluteFill>
  );
};

// Voce: ogni frase dal suo file, nel punto della linea del tempo.
export const Voice: React.FC<{ tl: Timeline }> = ({ tl }) => (
  <>
    {tl.cuts.map((c) => (
      <Sequence key={c.at} from={c.at} durationInFrames={c.len}>
        <Audio src={staticFile(c.file)} startFrom={c.src} />
      </Sequence>
    ))}
  </>
);

// Letto musicale: si abbassa sotto la voce e risale nelle pause e sulla chiusura.
export const Music: React.FC<{ tl: Timeline }> = ({ tl }) => (
  <Audio
    src={staticFile("audio/musica/acoustic-corporate.mp3")}
    volume={(f) => {
      const speaking = tl.cuts.some((c) => f >= c.at - 6 && f <= c.at + c.len + 6);
      const base = speaking ? 0.09 : 0.18;
      const fadeInV = interpolate(f, [0, 30], [0, 1], { extrapolateRight: "clamp" });
      const fadeOutV = interpolate(f, [tl.total - 75, tl.total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return base * fadeInV * fadeOutV;
    }}
  />
);

const Film: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  useInter();
  const end = (s: number) => S[s].end;
  const quad = at(0, 1) + 50;
  return (
    <Vertical.Provider value={vertical}>
      <AbsoluteFill style={{ background: C.night }}>
        {/* 1 — Momento vero */}
        <Shot from={0} to={at(0, 1)}><Clip src="1a-38344768.mp4" startAt={0.5} /></Shot>
        <Shot from={at(0, 1)} to={quad}><Clip src="1b-6326847.mp4" startAt={2} /></Shot>
        <Shot from={quad} to={at(0, 2)}>
          <Clip src="1c-8566854-key.mp4" startAt={0.5} />
          <Side />
          <Panel h={{ right: 110, top: 250 }} vTop={1000} k={1.45}><Scattered from={8} /></Panel>
        </Shot>
        <Shot from={at(0, 2)} to={end(0)}>
          <Clip src="1d-34535510.mp4" startAt={1} dim={0.25} />
          <Big text="Oggi da dove comincio?" from={50} />
        </Shot>

        {/* 2 — La domanda */}
        <Shot from={S[1].start} to={S[1].start + Math.round((end(1) - S[1].start) / 2)}><Clip src="2a-9101576.mp4" startAt={0.5} /></Shot>
        <Shot from={S[1].start + Math.round((end(1) - S[1].start) / 2)} to={end(1)}><Clip src="2a-7002250.mp4" startAt={0.3} /></Shot>

        {/* 3 — Che cos'è */}
        <Shot from={S[2].start} to={S[2].start + 50}><LogoCard /></Shot>
        <Shot from={S[2].start + 50} to={end(2)}>
          <Clip src="2a-9101576.mp4" startAt={4} dim={0.6} blur={6} />
          <Center vTop={620} k={1.12} top={90}><Briefing from={6} /></Center>
          <Big text="Il cervello agronomico della tua azienda" from={4} vTop={300} top={-330} />
        </Shot>

        {/* 4 — La mattina */}
        <Shot from={S[3].start} to={end(3)}>
          <Clip src="2a-7002250.mp4" startAt={2} dim={0.62} blur={6} />
          <Center vTop={380} k={1.12} hk={1.12} top={-40}><Queue from={4} costFrom={at(3, 1) - S[3].start - 10} /></Center>
        </Shot>

        {/* 5 — In campo */}
        <Shot from={S[4].start} to={at(4, 1) - 20}><Clip src="4b-1-34542987.mp4" startAt={0.5} /></Shot>
        <Shot from={at(4, 1) - 20} to={at(4, 2)}>
          <Clip src="4b-2-12280159-key.mp4" startAt={0.3} />
          <Side />
          <Panel h={{ right: 140, top: 200 }} vTop={1040} k={1.5}><TaskCard from={4} doneFrom={30} /></Panel>
        </Shot>
        <Shot from={at(4, 2)} to={end(4)}>
          <Clip src="4b-1-34542987.mp4" startAt={3} dim={0.6} blur={6} />
          <Center vTop={620}><Diary from={8} /></Center>
        </Shot>

        {/* 6 — Fine stagione */}
        <Shot from={S[5].start} to={S[5].start + 55}><Clip src="4c-1-6785428.mp4" startAt={2} /></Shot>
        <Shot from={S[5].start + 55} to={at(5, 1)}>
          <Clip src="4c-1-6785428.mp4" startAt={5} dim={0.62} blur={6} />
          <Center vTop={560}><Season from={6} /></Center>
        </Shot>
        <Shot from={at(5, 1)} to={end(5)}>
          <Clip src="2a-7002250.mp4" startAt={4} dim={0.6} blur={6} />
          <Center vTop={620}><Rotation from={6} /></Center>
        </Shot>

        {/* 7 — Il ruolo resta */}
        <Shot from={S[6].start} to={at(6, 1)}>
          <Clip src="4c-1-6785428.mp4" startAt={10} dim={0.62} blur={6} />
          <Center vTop={480}><Transparency from={6} confirmFrom={9999} /></Center>
        </Shot>
        <Shot from={at(6, 1)} to={end(6)}>
          <Clip src="5b-7657526-key.mp4" startAt={1} dim={0.15} />
          <Big text="La decisione resta tua." from={4} vTop={1300} top={300} />
        </Shot>

        {/* 8 — Chiusura */}
        <Sequence from={S[7].start} durationInFrames={TOTAL_FRAMES - S[7].start}>
          <Clip src="6a-17100157.mp4" startAt={1} dim={0.5} />
          <EndCard tagFrom={at(7, 1) - S[7].start} />
        </Sequence>

        <Captions tl={TL} />
        <Voice tl={TL} />
        <Music tl={TL} />
      </AbsoluteFill>
    </Vertical.Provider>
  );
};

export const OrtoMioComposition = () => (
  <>
    <Composition id="OrtoMio-Titolare-16x9" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="OrtoMio-Titolare-9x16" component={Film} defaultProps={{ vertical: true }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
