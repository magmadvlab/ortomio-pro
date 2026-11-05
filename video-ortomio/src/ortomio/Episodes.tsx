import { AbsoluteFill, Composition, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS, H, MONO, SANS, W, fadeIn, sec, useInter } from "../theme";
import { PilotFilm } from "./Pilot";

type Episode = {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  sourceStart: number;
  sourceEnd: number;
};

export const EPISODES: Episode[] = [
  { number: 1, slug: "Aspettativa", title: "L’aspettativa", subtitle: "Una previsione non è una promessa.", sourceStart: 0, sourceEnd: 19.33 },
  { number: 2, slug: "Orchestratore", title: "L’orchestratore", subtitle: "I segnali diventano priorità motivate.", sourceStart: 19.33, sourceEnd: 36.41 },
  { number: 3, slug: "Singola-Pianta", title: "Fino alla singola pianta", subtitle: "La precisione serve dove si interviene.", sourceStart: 36.41, sourceEnd: 44.77 },
  { number: 4, slug: "Memoria", title: "La decisione diventa memoria", subtitle: "Quando, dove, quanto e con quale esito.", sourceStart: 44.77, sourceEnd: 55.18 },
  { number: 5, slug: "Aspettativa-Realta", title: "Aspettativa contro realtà", subtitle: "Lo scostamento diventa qualcosa da capire.", sourceStart: 55.18, sourceEnd: 84.3 },
  { number: 6, slug: "Conoscenza", title: "Il campo non ricomincia da zero", subtitle: "Ogni stagione lascia conoscenza operativa.", sourceStart: 84.3, sourceEnd: 92.9 },
];

const INTRO = sec(2.7);
const OUTRO = sec(3.1);
export const episodeDuration = (e: Episode) => INTRO + sec(e.sourceEnd - e.sourceStart) + OUTRO;

const Mark: React.FC<{ vertical: boolean; height?: number }> = ({ vertical, height }) => (
  <div style={{ background: C.white, borderRadius: vertical ? 22 : 18, padding: vertical ? "16px 20px" : "12px 16px" }}>
    <Img src={staticFile("images/logo.png")} style={{ height: height ?? (vertical ? 112 : 84), display: "block" }} />
  </div>
);

const Intro: React.FC<{ episode: Episode; vertical: boolean }> = ({ episode, vertical }) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [10, INTRO - 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 20%, ${C.petrol}, ${C.night} 58%)`, color: C.white, fontFamily: SANS, padding: vertical ? "92px 62px" : "64px 92px", justifyContent: "center" }}>
    <div style={{ position: "absolute", top: vertical ? 70 : 48, left: vertical ? 54 : 76 }}><Mark vertical={vertical}/></div>
    <div style={{ fontFamily: MONO, color: C.gold, letterSpacing: 3, fontWeight: 800, fontSize: vertical ? 26 : 22, opacity: fadeIn(frame, 2, 10) }}>ORTOMIO · PUNTATA {episode.number}/6</div>
    <div style={{ fontSize: vertical ? 78 : 86, lineHeight: 1.02, fontWeight: 880, maxWidth: vertical ? 900 : 1400, marginTop: 22, opacity: fadeIn(frame, 8, 12), transform: `translateY(${(1-fadeIn(frame,8,14))*24}px)` }}>{episode.title}</div>
    <div style={{ fontSize: vertical ? 34 : 34, lineHeight: 1.25, color: C.mint, marginTop: 24, maxWidth: 1050, opacity: fadeIn(frame, 20, 12) }}>{episode.subtitle}</div>
    <div style={{ height: 5, width: `${line * (vertical ? 86 : 65)}%`, background: C.gold, borderRadius: 5, marginTop: 42 }} />
  </AbsoluteFill>;
};

const Outro: React.FC<{ episode: Episode; vertical: boolean }> = ({ episode, vertical }) => {
  const frame = useCurrentFrame();
  const last = episode.number === 6;
  return <AbsoluteFill style={{ background: C.petrolDark, color: C.white, fontFamily: SANS, justifyContent: "center", alignItems: "center", textAlign: "center", padding: vertical ? 55 : 90 }}>
    <div style={{ opacity: fadeIn(frame, 0, 10) }}><Mark vertical={vertical} height={vertical ? 126 : 94}/></div>
    <div style={{ fontFamily: MONO, color: C.gold, letterSpacing: 2, fontSize: vertical ? 22 : 19, marginTop: 28 }}>PUNTATA {episode.number}/6</div>
    <div style={{ fontSize: vertical ? 46 : 44, fontWeight: 850, lineHeight: 1.12, marginTop: 13, maxWidth: 1100 }}>{last ? "Il campo non ricomincia da zero." : `Continua con la puntata ${episode.number + 1}`}</div>
    <div style={{ fontSize: vertical ? 27 : 24, color: C.mint, marginTop: 16 }}>{last ? "Scopri OrtoMio · ortomioapp.it" : EPISODES[episode.number].title}</div>
  </AbsoluteFill>;
};

const EpisodeFilm: React.FC<{ episode: Episode; vertical?: boolean }> = ({ episode, vertical = false }) => {
  useInter();
  const clipDuration = sec(episode.sourceEnd - episode.sourceStart);
  return <AbsoluteFill style={{ background: C.night }}>
    <Sequence durationInFrames={INTRO}><Intro episode={episode} vertical={vertical}/></Sequence>
    <Sequence from={INTRO} durationInFrames={clipDuration}>
      <Sequence from={-sec(episode.sourceStart)}><PilotFilm vertical={vertical}/></Sequence>
      <div style={{ position: "absolute", top: vertical ? 48 : 32, right: vertical ? 42 : 50, background: "rgba(11,42,38,.82)", border: `1px solid ${C.mint}`, color: C.paper, fontFamily: MONO, fontSize: vertical ? 20 : 17, borderRadius: 999, padding: "8px 14px" }}>{episode.number}/6</div>
    </Sequence>
    <Sequence from={INTRO + clipDuration} durationInFrames={OUTRO}><Outro episode={episode} vertical={vertical}/></Sequence>
  </AbsoluteFill>;
};

export const EpisodesComposition = () => <>
  {EPISODES.flatMap((episode) => [
    <Composition key={`${episode.slug}-16x9`} id={`OrtoMio-E${episode.number}-${episode.slug}-16x9`} component={EpisodeFilm} defaultProps={{ episode }} durationInFrames={episodeDuration(episode)} fps={FPS} width={W} height={H}/>,
    <Composition key={`${episode.slug}-9x16`} id={`OrtoMio-E${episode.number}-${episode.slug}-9x16`} component={EpisodeFilm} defaultProps={{ episode, vertical: true }} durationInFrames={episodeDuration(episode)} fps={FPS} width={1080} height={1920}/>,
  ])}
</>;
