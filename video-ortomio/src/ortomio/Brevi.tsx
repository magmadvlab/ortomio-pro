import { Fragment } from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { C, FPS, H, W, useInter } from "../theme";
import { SECTIONS, SECTIONS_TECNICO, Timeline, atIn, build } from "./narration";
import { ClientMessage, Jaen, OliveFly, Queue, Ravaz, ScabAlert, Scattered5, Season, TaskCard, Transparency } from "./ui";
import { Big, Captions, Center, Clip, EndCard, Music, Panel, Shot, Side, Vertical, Voice } from "./Video";

// Video brevi, prima ondata (brief §14, D17): tagli dai due video approvati, stessa voce, stesse schermate.
// Ogni breve: una sezione di contenuto (o due) e la chiusura comune.

const CLOSE = SECTIONS[7];
const BREVI: { id: string; sections: string[][]; Scenes: React.FC<{ tl: Timeline }> }[] = [
  {
    id: "B1-Attesa",
    sections: [SECTIONS[3], CLOSE],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      return (
        <Shot from={0} to={tl.sections[0].end}>
          <Clip src="2a-7002250.mp4" startAt={2} dim={0.62} blur={6} />
          <Center vTop={380} k={1.12} hk={1.12} top={-40}><Queue from={4} costFrom={at(0, 1) - 10} /></Center>
        </Shot>
      );
    },
  },
  {
    id: "B2-Perche",
    sections: [SECTIONS[6], CLOSE],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      return (
        <>
          <Shot from={0} to={at(0, 1)}>
            <Clip src="4c-1-6785428.mp4" startAt={10} dim={0.62} blur={6} />
            <Center vTop={480}><Transparency from={6} confirmFrom={9999} /></Center>
          </Shot>
          <Shot from={at(0, 1)} to={tl.sections[0].end}>
            <Clip src="5b-7657526-key.mp4" startAt={1} dim={0.15} />
            <Big text="La decisione resta tua." from={4} vTop={1300} top={300} />
          </Shot>
        </>
      );
    },
  },
  {
    id: "B3-Registrato",
    sections: [SECTIONS[4], CLOSE],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      return (
        <>
          <Shot from={0} to={at(0, 1) - 20}><Clip src="4b-1-34542987.mp4" startAt={0.5} /></Shot>
          <Shot from={at(0, 1) - 20} to={at(0, 2)}>
            <Clip src="4b-2-12280159-key.mp4" startAt={0.3} />
            <Side />
            <Panel h={{ right: 140, top: 200 }} vTop={1040} k={1.5}><TaskCard from={4} doneFrom={30} /></Panel>
          </Shot>
          <Shot from={at(0, 2)} to={tl.sections[0].end}>
            <Clip src="4c-1-6785428.mp4" startAt={5} dim={0.62} blur={6} />
            <Center vTop={560}><Season from={6} /></Center>
          </Shot>
        </>
      );
    },
  },
  {
    id: "B4-Cliente",
    sections: [SECTIONS_TECNICO[0], ["E il calcolo resta visibile, anche al tuo cliente."], CLOSE],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      const S = tl.sections;
      return (
        <>
          <Shot from={0} to={at(0, 0) + 30}><Clip src="T1a-3252857.mp4" startAt={1} /></Shot>
          <Shot from={at(0, 0) + 30} to={at(0, 1)}>
            <Clip src="T1b-13863534-key.mp4" startAt={0.5} />
            <Center vTop={560} k={1.3} hk={1.3} top={-120}><ClientMessage from={10} /></Center>
          </Shot>
          <Shot from={at(0, 1)} to={S[0].end}>
            <Clip src="T1a-5694893.mp4" startAt={7} dim={0.6} blur={6} />
            <Center vTop={620} k={0.85} hk={1.35}><Scattered5 from={6} /></Center>
          </Shot>
          <Shot from={S[1].start} to={S[1].end}>
            <Clip src="4c-1-6785428.mp4" startAt={10} dim={0.62} blur={6} />
            <Center vTop={480}><Transparency from={6} confirmFrom={9999} sharedFrom={at(1, 0) - S[1].start + 20} /></Center>
          </Shot>
        </>
      );
    },
  },
  // Seconda ondata (§14.1, D22): una coltura per breve, frasi nuove in coltura.mp3.
  {
    id: "B5-Vigneto",
    sections: [
      [
        "A potatura, la domanda è sempre la stessa: quante gemme lasciare?",
        "OrtoMio mette a confronto l'uva raccolta e il legno di potatura di ogni filare: l'indice di Ravaz.",
        "E ti dice dove alleggerire, filare per filare.",
      ],
      CLOSE,
    ],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      return (
        <>
          <Shot from={0} to={at(0, 1)}><Clip src="B5-7495999.mp4" startAt={1} /></Shot>
          <Shot from={at(0, 1)} to={tl.sections[0].end}>
            <Clip src="B5-7495999.mp4" startAt={12} dim={0.6} blur={6} />
            <Center vTop={560}><Ravaz from={6} adviceFrom={at(0, 2) - at(0, 1)} /></Center>
          </Shot>
        </>
      );
    },
  },
  {
    id: "B6-Oliveto",
    sections: [
      [
        "Dodici catture nella trappola tre. Tratti o aspetti?",
        "OrtoMio legge le catture contro le soglie e ti dice a che punto sei.",
        "E con l'indice di Jaén ti dice quando raccogliere.",
      ],
      CLOSE,
    ],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      return (
        <>
          <Shot from={0} to={at(0, 1)}><Clip src="B6-5659505.mp4" startAt={1} /></Shot>
          <Shot from={at(0, 1)} to={at(0, 2)}>
            <Clip src="B6-10636140.mp4" startAt={0.5} dim={0.6} blur={6} />
            <Center vTop={600}><OliveFly from={6} /></Center>
          </Shot>
          <Shot from={at(0, 2)} to={tl.sections[0].end}>
            <Clip src="B6-6609491.mp4" startAt={1} dim={0.55} blur={5} />
            <Center vTop={640}><Jaen from={6} /></Center>
          </Shot>
        </>
      );
    },
  },
  {
    id: "B7-Frutteto",
    sections: [
      ["Due giorni di pioggia sul meleto, in piena fioritura.", "OrtoMio incrocia meteo e fase, e ti avvisa prima che si veda."],
      ["Lavora con i dati che hai, e ti dice quali mancano."],
      CLOSE,
    ],
    Scenes: ({ tl }) => {
      const at = atIn(tl);
      const S = tl.sections;
      return (
        <>
          <Shot from={0} to={at(0, 1)}><Clip src="B7-31544151.mp4" startAt={0.3} /></Shot>
          <Shot from={at(0, 1)} to={S[0].end}>
            <Clip src="B7-39423510.mp4" startAt={0.5} dim={0.55} blur={5} />
            <Center vTop={640}><ScabAlert from={6} /></Center>
          </Shot>
          <Shot from={S[1].start} to={S[1].end}>
            <Clip src="B7-5354587.mp4" startAt={2} dim={0.62} blur={6} />
            <Center vTop={480}><Transparency from={6} confirmFrom={9999} title="Ticchiolatura · Meleto nord" /></Center>
          </Shot>
        </>
      );
    },
  },
];

const make = ({ sections, Scenes }: (typeof BREVI)[number]) => {
  // Nei brevi la chiusura resta meno a schermo dopo la voce.
  const tl = build(sections, 1.5);
  const last = tl.sections.length - 1;
  const Film: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
    useInter();
    const close = tl.sections[last].start;
    return (
      <Vertical.Provider value={vertical}>
        <AbsoluteFill style={{ background: C.night }}>
          <Scenes tl={tl} />
          <Sequence from={close} durationInFrames={tl.total - close}>
            <Clip src="6a-17100157.mp4" startAt={1} dim={0.5} />
            <EndCard tagFrom={atIn(tl)(last, 1) - close} />
          </Sequence>
          <Captions tl={tl} />
          <Voice tl={tl} />
          <Music tl={tl} />
        </AbsoluteFill>
      </Vertical.Provider>
    );
  };
  return { tl, Film };
};

const FILMS = BREVI.map((b) => ({ id: b.id, ...make(b) }));

export const BreviComposition = () => (
  <>
    {FILMS.map(({ id, tl, Film }) => {
      return (
        <Fragment key={id}>
          <Composition id={`OrtoMio-${id}-9x16`} component={Film} defaultProps={{ vertical: true }} durationInFrames={tl.total} fps={FPS} width={1080} height={1920} />
          <Composition id={`OrtoMio-${id}-16x9`} component={Film} durationInFrames={tl.total} fps={FPS} width={W} height={H} />
        </Fragment>
      );
    })}
  </>
);
