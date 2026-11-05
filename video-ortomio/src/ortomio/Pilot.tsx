import { AbsoluteFill, Audio, Composition, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FPS, H, MONO, SANS, W, fadeIn, pop, sec, useInter } from "../theme";
import timings from "./timings-aspettativa-v1.json";

const TOTAL = sec(96);
const f = (seconds: number) => sec(seconds);

const footage = {
  field: "proxy/P1-19546340.mp4",
  crates: "P1-14823494.mp4",
  produce: "P1-10039770.mp4",
  orchard: "P1-15688500.mp4",
  plant: "P1-14749090.mp4",
  worker: "P1-14086016.mp4",
  soil: "proxy/P1-5766179.mp4",
  sorting: "P1-10576691.mp4",
};

const Fade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: fadeIn(frame, 0, 10) }}>{children}</AbsoluteFill>;
};

const Shot: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => (
  <Sequence from={from} durationInFrames={Math.max(1, to - from)}><Fade>{children}</Fade></Sequence>
);

const Media: React.FC<{ src: string; start?: number; dim?: number; rate?: number; vertical: boolean }> = ({ src, start = 0, dim = 0.22, rate = 0.72, vertical }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, sec(12)], [1.02, 1.1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
    <OffthreadVideo src={staticFile(`footage/${src}`)} startFrom={f(start)} muted playbackRate={rate}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: vertical ? "center center" : "center center", transform: `scale(${zoom})` }} />
    <AbsoluteFill style={{ background: `linear-gradient(${vertical ? "180deg" : "90deg"}, rgba(7,29,26,${dim * .35}), rgba(7,29,26,${Math.min(.9, dim + .34)}))` }} />
  </AbsoluteFill>;
};

const DemoBadge: React.FC<{ vertical: boolean }> = ({ vertical }) => <div style={{ position: "absolute", top: vertical ? 64 : 42, left: vertical ? 44 : 58, fontFamily: MONO, fontSize: vertical ? 24 : 20, letterSpacing: 2, color: C.paper, border: `1px solid ${C.mint}`, background: "rgba(11,42,38,.78)", borderRadius: 999, padding: "10px 18px" }}>SCENARIO DIMOSTRATIVO</div>;

const Shell: React.FC<{ vertical: boolean; children: React.ReactNode; width?: number }> = ({ vertical, children, width = 980 }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, 3);
  return <div style={{ position: "absolute", left: vertical ? 44 : "auto", right: vertical ? 44 : 86, top: vertical ? 370 : 150, width: vertical ? "auto" : width, fontFamily: SANS, color: C.ink, background: "rgba(246,243,236,.97)", borderRadius: vertical ? 34 : 26, padding: vertical ? "38px 34px" : "34px 40px", boxShadow: "0 30px 100px rgba(0,0,0,.42)", opacity: fadeIn(frame, 0, 12), transform: `translateY(${(1-p)*32}px)` }}>{children}</div>;
};

const Label = ({ children }: { children: React.ReactNode }) => <div style={{ fontFamily: MONO, color: C.petrol, fontWeight: 800, fontSize: 20, letterSpacing: 2 }}>{children}</div>;

const Expectation: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const amount = Math.round(interpolate(frame, [10, 46], [0, 2000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return <Shell vertical={vertical}><Label>ASPETTATIVA · INIZIO STAGIONE</Label><div style={{ display: "flex", alignItems: "end", gap: 22, marginTop: 18 }}><div style={{ fontSize: vertical ? 112 : 126, fontWeight: 850, lineHeight: .9 }}>{amount.toLocaleString("it-IT")}</div><div style={{ fontSize: 34, fontWeight: 750, paddingBottom: 9 }}>kg stimati</div></div><div style={{ height: 8, background: C.sand, borderRadius: 8, marginTop: 28 }}><div style={{ height: 8, width: `${interpolate(frame,[6,45],[0,68],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})}%`, background: C.gold, borderRadius: 8 }}/></div><div style={{ display: "grid", gridTemplateColumns: vertical ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginTop: 24 }}>{["Coltura", "Varietà", "Piante", "Storico"].map((x,i)=><div key={x} style={{ background: C.white, borderRadius: 14, padding: 14, border: `1px solid ${C.line}`, opacity: fadeIn(frame,22+i*7,8) }}><div style={{ fontSize: 17, color: C.muted }}>DATO {i+1}</div><div style={{ fontSize: 23, fontWeight: 720, marginTop: 4 }}>{x}</div></div>)}</div><div style={{ fontSize: 21, color: C.muted, marginTop: 20 }}>Stima iniziale · confidenza 0,68 · aggiornabile durante il ciclo</div></Shell>;
};

const Cycle: React.FC<{ vertical: boolean }> = ({ vertical }) => {
  const frame = useCurrentFrame();
  const steps = [["01","ASPETTATIVA"],["02","DECISIONI"],["03","OPERAZIONI"],["04","ESITO"]];
  return <AbsoluteFill style={{ justifyContent:"center", alignItems:"center", padding: vertical ? 50 : 100, fontFamily:SANS }}><div style={{ width:"100%", maxWidth:1500, display:"grid", gridTemplateColumns: vertical ? "1fr" : "repeat(4,1fr)", gap:18 }}>{steps.map(([n,t],i)=><div key={t} style={{ opacity:fadeIn(frame,i*9,10), transform:`translateY(${(1-pop(frame,i*9))*30}px)`, border:`2px solid ${i===0?C.gold:C.petrol}`, background:i===0?"rgba(201,162,74,.18)":"rgba(15,61,54,.82)", borderRadius:24, padding:vertical?28:30, color:C.white }}><div style={{ fontFamily:MONO,color:C.mint,fontSize:20 }}>{n}</div><div style={{ fontSize:vertical?42:32,fontWeight:800,marginTop:8 }}>{t}</div></div>)}</div></AbsoluteFill>;
};

const Orchestrator: React.FC<{ vertical:boolean }> = ({vertical}) => {
  const frame=useCurrentFrame(); const signals=["METEO","SUOLO","PIANTE","IRRIGAZIONI","OPERAZIONI","DATI MANCANTI"];
  return <Shell vertical={vertical} width={1040}><Label>ORCHESTRATORE · PRIORITÀ DI OGGI</Label><div style={{ display:"grid", gridTemplateColumns:vertical?"1fr 1fr":"repeat(3,1fr)",gap:12,marginTop:22 }}>{signals.map((s,i)=><div key={s} style={{opacity:fadeIn(frame,8+i*6,8),border:`1px solid ${s.includes("MANCANTI")?C.amber:C.line}`,borderRadius:14,padding:"15px 16px",fontSize:20,fontWeight:700,background:C.white}}>{s.includes("MANCANTI")?"△ ":"● "}{s}</div>)}</div><div style={{ marginTop:24,background:C.night,color:C.white,borderRadius:18,padding:24 }}><div style={{fontSize:vertical?34:30,fontWeight:800}}>Controllare stress idrico</div><div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:13,fontSize:20,color:C.mint}}><span>Priorità 82</span><span>•</span><span>Confidenza 0,74</span><span>•</span><span>Oggi</span></div><div style={{fontSize:20,marginTop:14,lineHeight:1.35,color:C.paper}}>Perché: umidità in calo, fase sensibile, irrigazione prevista non ancora confermata.</div></div></Shell>;
};

const Scope: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); const items=[["APPEZZAMENTO","Nord 02"],["FILARE","04"],["PIANTA","CP-047"]]; return <Shell vertical={vertical} width={880}><Label>DOVE INTERVENIRE</Label><div style={{marginTop:24}}>{items.map(([a,b],i)=><div key={a} style={{opacity:fadeIn(frame,8+i*18,10),display:"flex",justifyContent:"space-between",alignItems:"center",background:i===2?"#e3f1ed":C.white,border:`2px solid ${i===2?C.petrol:C.line}`,borderRadius:18,padding:"20px 22px",marginTop:12}}><span style={{fontSize:22,color:C.muted}}>{a}</span><span style={{fontSize:vertical?36:32,fontWeight:820}}>{b}</span></div>)}</div><div style={{marginTop:20,fontSize:20,color:C.muted}}>La precisione dipende dal livello di registrazione disponibile.</div></Shell> };

const Operation: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); return <Shell vertical={vertical} width={920}><Label>REGISTRO OPERATIVO</Label><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18}}><div><div style={{fontSize:vertical?38:34,fontWeight:820}}>Irrigazione completata</div><div style={{fontSize:21,color:C.muted,marginTop:6}}>Nord 02 · Filari 1–6 · 07:42</div></div><div style={{background:C.ok,color:C.white,borderRadius:999,padding:"12px 18px",fontWeight:800,fontSize:20}}>✓ FATTO</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:24}}>{[["PIANIFICATA","2.400 L"],["MISURATA","2.180 L"],["DURATA","38 min"],["OPERATORE","Luca"]].map(([a,b],i)=><div key={a} style={{opacity:fadeIn(frame,12+i*8,8),background:C.white,border:`1px solid ${C.line}`,borderRadius:15,padding:18}}><div style={{fontFamily:MONO,fontSize:17,color:C.muted}}>{a}</div><div style={{fontSize:vertical?31:28,fontWeight:800,marginTop:6}}>{b}</div></div>)}</div></Shell> };

const Yield: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); const actual=Math.round(interpolate(frame,[8,35],[0,1600],{extrapolateLeft:"clamp",extrapolateRight:"clamp"})); return <Shell vertical={vertical} width={920}><Label>RACCOLTA · CONFRONTO</Label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:22}}><div style={{background:C.white,borderRadius:18,padding:22}}><div style={{fontSize:18,color:C.muted}}>STIMATO</div><div style={{fontSize:vertical?62:68,fontWeight:850}}>2.000</div><div style={{fontSize:24}}>kg</div></div><div style={{background:"#fff4df",border:`2px solid ${C.gold}`,borderRadius:18,padding:22}}><div style={{fontSize:18,color:C.muted}}>MISURATO</div><div style={{fontSize:vertical?62:68,fontWeight:850}}>{actual.toLocaleString("it-IT")}</div><div style={{fontSize:24}}>kg</div></div></div><div style={{marginTop:20,fontFamily:MONO,fontSize:24,color:C.amber,fontWeight:800}}>SCOSTAMENTO −400 kg · −20%</div></Shell> };

const Ledger: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); const rows=[["12 MAG","Irrigazione","2.180 L misurati"],["29 MAG","Stato piante","stress su filare 4"],["03 GIU","Evento meteo","vento caldo"],["11 GIU","Intervento","correzione irrigua"],["24 GIU","Raccolta","1.600 kg"]]; return <Shell vertical={vertical} width={980}><Label>ASPETTATIVA ↔ REALTÀ</Label><div style={{marginTop:18}}>{rows.map((r,i)=><div key={r[0]} style={{opacity:fadeIn(frame,7+i*8,8),display:"grid",gridTemplateColumns:vertical?"120px 1fr":"130px 220px 1fr",gap:14,borderTop:i?`1px solid ${C.line}`:"none",padding:"14px 0",fontSize:vertical?21:22}}><span style={{fontFamily:MONO,color:C.petrol}}>{r[0]}</span><span style={{fontWeight:760}}>{r[1]}</span><span style={{color:C.muted,gridColumn:vertical?"2":"auto"}}>{r[2]}</span></div>)}</div></Shell> };

const Factors: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); return <Shell vertical={vertical} width={960}><Label>FATTORI DA VERIFICARE · NON CAUSE CERTE</Label>{[["Acqua realmente distribuita","dato disponibile"],["Stress nel filare 4","osservazione registrata"],["Portata per settore","dato mancante"]].map(([a,b],i)=><div key={a} style={{opacity:fadeIn(frame,8+i*13,9),display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",background:C.white,borderRadius:16,padding:"18px 20px",marginTop:14,border:`1px solid ${i===2?C.amber:C.line}`}}><div style={{fontSize:vertical?28:26,fontWeight:760}}>{a}</div><div style={{fontFamily:MONO,fontSize:17,color:i===2?C.amber:C.petrol,textAlign:"right"}}>{b}</div></div>)}<div style={{fontSize:21,lineHeight:1.4,color:C.muted,marginTop:20}}>OrtoMio collega gli indizi e indica che cosa misurare meglio nel prossimo ciclo.</div></Shell> };

const NextCycle: React.FC<{vertical:boolean}> = ({vertical}) => <Shell vertical={vertical} width={900}><Label>PROSSIMO CICLO</Label><div style={{fontSize:vertical?47:44,fontWeight:850,lineHeight:1.08,marginTop:18}}>La stagione diventa conoscenza operativa.</div><div style={{marginTop:24,fontSize:vertical?27:25,lineHeight:1.65}}><div>✓ Misurare la portata per settore</div><div>✓ Anticipare il controllo sul filare 4</div><div>✓ Confrontare gli stessi indicatori</div></div></Shell>;

const End: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); return <AbsoluteFill style={{background:"rgba(11,42,38,.72)",justifyContent:"center",alignItems:"center",textAlign:"center",fontFamily:SANS,padding:vertical?50:80}}><div style={{opacity:fadeIn(frame,0,14),background:C.white,borderRadius:24,padding:"22px 30px"}}><Img src={staticFile("images/logo.png")} style={{height:vertical?190:150,display:"block"}}/></div><div style={{color:C.white,fontSize:vertical?62:68,fontWeight:850,lineHeight:1.08,marginTop:34,maxWidth:1200}}>Il campo non ricomincia da zero.</div><div style={{opacity:fadeIn(frame,34,12),color:C.mint,fontSize:vertical?31:30,marginTop:22}}>Decisioni, operazioni ed esiti restano collegati.</div></AbsoluteFill> };

const Captions: React.FC<{vertical:boolean}> = ({vertical}) => { const frame=useCurrentFrame(); const current=timings.find(t=>frame>=f(t.start)&&frame<=f(t.end)+8); if(!current)return null; return <div style={{position:"absolute",left:vertical?34:80,right:vertical?34:80,bottom:vertical?105:35,display:"flex",justifyContent:"center",zIndex:20}}><div style={{maxWidth:vertical?980:1420,background:"rgba(7,29,26,.82)",border:"1px solid rgba(159,211,199,.28)",borderRadius:14,padding:vertical?"13px 20px":"10px 22px",fontFamily:SANS,fontSize:vertical?35:28,fontWeight:650,lineHeight:1.25,textAlign:"center",color:C.paper}}>{current.text}</div></div> };

export const PilotFilm: React.FC<{vertical?:boolean}> = ({vertical=false}) => { useInter(); return <AbsoluteFill style={{background:C.night}}>
  <Shot from={0} to={f(3.1)}><Media src={footage.field} start={1} dim={.15} vertical={vertical}/></Shot>
  <Shot from={f(3.1)} to={f(6.1)}><Media src={footage.crates} start={1} dim={.18} vertical={vertical}/></Shot>
  <Shot from={f(6.1)} to={f(9.03)}><Media src={footage.orchard} start={1} dim={.3} vertical={vertical}/></Shot>
  <Sequence durationInFrames={f(19.33)}><DemoBadge vertical={vertical}/></Sequence>
  <Shot from={f(9.03)} to={f(19.33)}><Media src={footage.orchard} start={3} dim={.55} vertical={vertical}/><Expectation vertical={vertical}/></Shot>
  <Shot from={f(19.33)} to={f(23.03)}><Media src={footage.field} start={4} dim={.72} vertical={vertical}/><Cycle vertical={vertical}/></Shot>
  <Shot from={f(23.03)} to={f(36.41)}><Media src={footage.soil} rate={.5} dim={.68} vertical={vertical}/><Orchestrator vertical={vertical}/></Shot>
  <Shot from={f(36.41)} to={f(44.77)}><Media src={footage.plant} start={1} dim={.46} vertical={vertical}/><Scope vertical={vertical}/></Shot>
  <Shot from={f(44.77)} to={f(55.18)}><Media src={footage.worker} start={.5} rate={.62} dim={.6} vertical={vertical}/><Operation vertical={vertical}/></Shot>
  <Shot from={f(55.18)} to={f(62.76)}><Media src={footage.sorting} rate={.58} dim={.62} vertical={vertical}/><Yield vertical={vertical}/></Shot>
  <Shot from={f(62.76)} to={f(76.52)}><Media src={footage.field} start={8} dim={.68} vertical={vertical}/><Ledger vertical={vertical}/></Shot>
  <Shot from={f(76.52)} to={f(84.3)}><Media src={footage.plant} start={5} dim={.68} vertical={vertical}/><Factors vertical={vertical}/></Shot>
  <Shot from={f(84.3)} to={f(89.53)}><Media src={footage.produce} start={2} dim={.68} vertical={vertical}/><NextCycle vertical={vertical}/></Shot>
  <Shot from={f(89.53)} to={TOTAL}><Media src={footage.field} start={12} dim={.58} vertical={vertical}/><End vertical={vertical}/></Shot>
  <Captions vertical={vertical}/>
  <Audio src={staticFile("audio/adriatico/aspettativa-v1.mp3")}/>
  <Audio src={staticFile("audio/musica/acoustic-corporate.mp3")} volume={(frame)=>{const fi=interpolate(frame,[0,30],[0,1],{extrapolateRight:"clamp"});const fo=interpolate(frame,[TOTAL-100,TOTAL],[1,0],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});return .075*fi*fo;}}/>
  </AbsoluteFill> };

export const PilotComposition = () => <>
  <Composition id="OrtoMio-Pilota-Aspettativa-16x9" component={PilotFilm} durationInFrames={TOTAL} fps={FPS} width={W} height={H}/>
  <Composition id="OrtoMio-Pilota-Aspettativa-9x16" component={PilotFilm} defaultProps={{vertical:true}} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920}/>
</>;
