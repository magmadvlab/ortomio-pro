import { AbsoluteFill, Composition, Sequence } from "remotion";
import { C, FPS, H, W, useInter } from "../theme";
import { TECNICO, atIn } from "./narration";
import { ClientMessage, FarmSwitcher, Queue, Scattered5, Season, Transparency } from "./ui";
import { Big, Captions, Center, Clip, EndCard, LogoCard, Music, Shot, Vertical, Voice } from "./Video";

// Video 2 «Tecnico» (copione-tecnico-v1.md): stessa grammatica del titolare, frasi riusate da take-v2
// e frasi nuove da tecnico.mp3. Il messaggio del cliente compare come notifica sopra il telefono di T1b.

const TL = TECNICO;
const S = TL.sections;
const at = atIn(TL);

const Film: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => {
  useInter();
  const end = (s: number) => S[s].end;
  const phone = at(0, 0) + 30;
  const half = (s: number) => S[s].start + Math.round((end(s) - S[s].start) / 2);
  return (
    <Vertical.Provider value={vertical}>
      <AbsoluteFill style={{ background: C.night }}>
        {/* 1 — Momento vero, a posteriori */}
        <Shot from={0} to={phone}><Clip src="T1a-3252857.mp4" startAt={1} /></Shot>
        <Shot from={phone} to={at(0, 1)}>
          <Clip src="T1b-13863534-key.mp4" startAt={0.5} />
          <Center vTop={560} k={1.3} hk={1.3} top={-120}><ClientMessage from={10} /></Center>
        </Shot>
        <Shot from={at(0, 1)} to={end(0)}>
          <Clip src="T1a-5694893.mp4" startAt={7} dim={0.6} blur={6} />
          <Center vTop={620} k={0.85} hk={1.35}><Scattered5 from={6} /></Center>
        </Shot>

        {/* 2 — La domanda */}
        <Shot from={S[1].start} to={half(1)}><Clip src="2a-9101576.mp4" startAt={0.5} /></Shot>
        <Shot from={half(1)} to={end(1)}><Clip src="2a-7002250.mp4" startAt={0.3} /></Shot>

        {/* 3 — Che cos'è */}
        <Shot from={S[2].start} to={S[2].start + 50}><LogoCard /></Shot>
        <Shot from={S[2].start + 50} to={end(2)}>
          <Clip src="2a-9101576.mp4" startAt={4} dim={0.6} blur={6} />
          <Center vTop={640} k={1.12} hk={1} top={60}><FarmSwitcher from={6} /></Center>
          <Big text="Il cervello agronomico delle aziende che segui" from={4} vTop={250} top={-370} />
        </Shot>

        {/* 4a — Prima della visita */}
        <Shot from={S[3].start} to={end(3)}>
          <Clip src="2a-7002250.mp4" startAt={2} dim={0.62} blur={6} />
          <Center vTop={380} k={1.12} hk={1.12} top={-40}><Queue from={4} costFrom={end(3) - S[3].start - 100} /></Center>
        </Shot>

        {/* 4b — Il perché, scritto */}
        <Shot from={S[4].start} to={end(4)}>
          <Clip src="4c-1-6785428.mp4" startAt={10} dim={0.62} blur={6} />
          <Center vTop={480}><Transparency from={6} confirmFrom={9999} sharedFrom={at(4, 1) - S[4].start} /></Center>
        </Shot>

        {/* 4c — L'esito */}
        <Shot from={S[5].start} to={end(5)}>
          <Clip src="T1a-5694893.mp4" startAt={0.5} dim={0.62} blur={6} />
          <Center vTop={560}><Season from={6} /></Center>
        </Shot>

        {/* 5 — Il ruolo resta */}
        <Shot from={S[6].start} to={end(6)}>
          <Clip src="T5a-5492775.mp4" startAt={1} dim={0.2} />
          <Big text="Il tuo ragionamento resta scritto." from={at(6, 0) - S[6].start + 40} vTop={1300} top={300} />
        </Shot>

        {/* 6 — Chiusura */}
        <Sequence from={S[7].start} durationInFrames={TL.total - S[7].start}>
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

export const TecnicoComposition = () => (
  <>
    <Composition id="OrtoMio-Tecnico-16x9" component={Film} durationInFrames={TL.total} fps={FPS} width={W} height={H} />
    <Composition id="OrtoMio-Tecnico-9x16" component={Film} defaultProps={{ vertical: true }} durationInFrames={TL.total} fps={FPS} width={1080} height={1920} />
  </>
);
