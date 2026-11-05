import { BreviComposition } from "./ortomio/Brevi";
import { TecnicoComposition } from "./ortomio/Tecnico";
import { OrtoMioComposition } from "./ortomio/Video";
import { PilotComposition } from "./ortomio/Pilot";
import { EpisodesComposition } from "./ortomio/Episodes";
import { PilotV2Composition } from "./ortomio/PilotV2";

export const RemotionRoot: React.FC = () => (
  <>
    <OrtoMioComposition />
    <PilotComposition />
    <PilotV2Composition />
    <EpisodesComposition />
    <TecnicoComposition />
    <BreviComposition />
  </>
);
