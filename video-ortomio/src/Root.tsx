import { BreviComposition } from "./ortomio/Brevi";
import { TecnicoComposition } from "./ortomio/Tecnico";
import { OrtoMioComposition } from "./ortomio/Video";

export const RemotionRoot: React.FC = () => (
  <>
    <OrtoMioComposition />
    <TecnicoComposition />
    <BreviComposition />
  </>
);
