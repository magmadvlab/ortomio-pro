import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, MONO, SANS, fadeIn, pop } from "../theme";

// Schermate di OrtoMio ricostruite con dati demo (azienda fittizia, orticole e vigneto).
// Nessun dato reale: nomi, punteggi e orari sono illustrativi.

export const Rise: React.FC<{ from: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, children, style }) => {
  const f = useCurrentFrame();
  const p = pop(f, from);
  return <div style={{ ...style, opacity: fadeIn(f, from, 10), transform: `translateY(${(1 - p) * 40}px)` }}>{children}</div>;
};

const card: React.CSSProperties = { background: C.paper, borderRadius: 22, fontFamily: SANS, color: C.ink, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" };
const eyebrow: React.CSSProperties = { fontSize: 18, letterSpacing: 2, color: C.muted, fontWeight: 700 };

export const Logo: React.FC<{ height: number }> = ({ height }) => (
  <Img src={staticFile("images/logo.png")} style={{ height, display: "block" }} />
);

// Sezione 1: quello che oggi arriva da canali diversi.
export const Scattered: React.FC<{ from: number }> = ({ from }) => {
  const items: [string, string][] = [
    ["FOTO", "Foglia di pomodoro, zona 2"],
    ["SQUADRA", "Luca: il filare 3 è secco"],
    ["METEO", "Domani pioggia al 70%"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 560 }}>
      {items.map(([k, v], i) => (
        <Rise key={k} from={from + i * 22}>
          <div style={{ ...card, padding: "20px 26px", display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ ...eyebrow, width: 120, color: C.petrol }}>{k}</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{v}</div>
          </div>
        </Rise>
      ))}
    </div>
  );
};

// Sezione 3: il briefing del mattino, come la console della landing.
export const Briefing: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const chips: [string, string][] = [["GDD", "428"], ["SEGNALI", "14/21"], ["FASE", "fioritura"], ["PIOGGIA", "domani 70%"]];
  return (
    <div style={{ width: 860, background: C.night, border: `2px solid ${C.petrol}`, borderRadius: 24, padding: "30px 36px", fontFamily: SANS, color: C.paper, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", opacity: fadeIn(f, from, 12) }}>
      <div style={{ fontFamily: MONO, fontSize: 24, color: C.gold, letterSpacing: 2 }}>BRIEFING 06:12</div>
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 12 }}>Azienda demo · 3 priorità oggi</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 26 }}>
        {chips.map(([k, v], i) => (
          <div key={k} style={{ opacity: fadeIn(f, from + 14 + i * 8, 10), border: `1px solid ${C.petrol}`, borderRadius: 999, padding: "10px 20px", fontFamily: MONO, fontSize: 22 }}>
            <span style={{ color: C.mint }}>{k}</span> {v}
          </div>
        ))}
      </div>
    </div>
  );
};

type Row = { title: string; where: string; score: number; conf: string; when: string; tone: string };
const ROWS: Row[] = [
  { title: "Irrigare pomodoro", where: "Zona 2 · 38 min a goccia", score: 82, conf: "0,81", when: "Oggi", tone: C.petrol },
  { title: "Controllo peronospora", where: "Vigneto · filari 4–9", score: 74, conf: "0,72", when: "Oggi", tone: C.petrol },
  { title: "Concimazione lattuga", where: "Zona 5", score: 41, conf: "0,64", when: "Prossimo ciclo", tone: C.grey },
];

// Sezione 4: la coda di azioni motivate, poi il costo dell'attesa sulla seconda riga.
export const Queue: React.FC<{ from: number; costFrom: number }> = ({ from, costFrom }) => {
  const f = useCurrentFrame();
  const open = f >= costFrom;
  return (
    <div style={{ ...card, width: 900, padding: "28px 32px" }}>
      <div style={eyebrow}>CODA DI OGGI · ORDINATA PER PRIORITÀ</div>
      {ROWS.map((r, i) => {
        const s = from + 12 + i * 18;
        const w = interpolate(f, [s, s + 25], [0, r.score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const dim = open && i !== 1 ? 0.35 : 1;
        return (
          <div key={r.title} style={{ opacity: fadeIn(f, s, 10) * dim, borderTop: i ? `1px solid ${C.line}` : "none", padding: "18px 0", marginTop: i ? 0 : 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 22, color: C.muted, marginTop: 4 }}>{r.where}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 44, fontWeight: 800, color: r.tone }}>{Math.round(w)}</div>
                <div style={{ fontSize: 18, color: C.muted }}>confidenza {r.conf}</div>
              </div>
            </div>
            <div style={{ height: 8, background: C.sand, borderRadius: 4, marginTop: 12 }}>
              <div style={{ width: `${w}%`, height: 8, background: r.tone, borderRadius: 4 }} />
            </div>
            {i === 1 && open && <CostOfWait from={costFrom} />}
            {i === 2 && <div style={{ marginTop: 8, fontSize: 20, color: C.muted, fontWeight: 600 }}>→ {r.when}</div>}
          </div>
        );
      })}
    </div>
  );
};

const CostOfWait: React.FC<{ from: number }> = ({ from }) => {
  const opts: [string, string, boolean][] = [
    ["Intervenire ora", "2 ore di lavoro, prima della pioggia", true],
    ["Aspettare 3 giorni", "rischio alto sui filari in fioritura", false],
    ["Monitorare", "nuovo controllo giovedì", false],
  ];
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
      {opts.map(([k, v, best], i) => (
        <Rise key={k} from={from + i * 10} style={{ flex: 1 }}>
          <div style={{ border: `2px solid ${best ? C.petrol : C.line}`, background: best ? "#e3f1ed" : C.white, borderRadius: 14, padding: "14px 16px", height: 128 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: best ? C.petrol : C.ink }}>{k}</div>
            <div style={{ fontSize: 18, color: C.muted, marginTop: 6, lineHeight: 1.3 }}>{v}</div>
          </div>
        </Rise>
      ))}
    </div>
  );
};

// Sezione 5: il task sul telefono dell'operaio, segnato come fatto.
export const TaskCard: React.FC<{ from: number; doneFrom: number }> = ({ from, doneFrom }) => {
  const f = useCurrentFrame();
  const done = f >= doneFrom;
  const press = interpolate(f, [doneFrom - 6, doneFrom, doneFrom + 6], [1, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Rise from={from}>
      <div style={{ ...card, width: 560, padding: "26px 30px" }}>
        <div style={eyebrow}>TASK · SQUADRA</div>
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>Irrigare pomodoro</div>
        <div style={{ fontSize: 24, color: C.muted, marginTop: 6 }}>Zona 2 · goccia · 38 min</div>
        <div style={{ fontSize: 20, color: C.ink, marginTop: 14, lineHeight: 1.4 }}>Perché: suolo sabbioso, 3 giorni di stress idrico, pioggia solo domani.</div>
        <div style={{ marginTop: 22, transform: `scale(${press})`, background: done ? C.ok : C.petrol, color: C.white, borderRadius: 14, padding: "16px 0", textAlign: "center", fontSize: 28, fontWeight: 700 }}>
          {done ? "✓ Fatto · 07:42" : "Segna come fatto"}
        </div>
      </div>
    </Rise>
  );
};

export const Diary: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const rows: [string, string, string][] = [
    ["07:42", "Irrigazione · Zona 2 · 38 min", "Luca"],
    ["Ieri", "Controllo trappole · Vigneto", "Sara"],
    ["Ieri", "Raccolta lattuga · Zona 5 · 64 kg", "Luca"],
  ];
  return (
    <div style={{ ...card, width: 820, padding: "26px 32px" }}>
      <div style={eyebrow}>DIARIO OPERATIVO</div>
      {rows.map(([t, what, who], i) => {
        const fresh = i === 0;
        const slide = fresh ? interpolate(f, [from, from + 14], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
        return (
          <div key={what} style={{ display: "flex", gap: 22, padding: "16px 0", borderTop: i ? `1px solid ${C.line}` : "none", marginTop: i ? 0 : 8, opacity: fresh ? fadeIn(f, from, 10) : 1, transform: `translateY(${slide}px)`, background: fresh ? "#e3f1ed" : "transparent", borderRadius: 10, paddingLeft: fresh ? 12 : 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 22, color: fresh ? C.petrol : C.muted, width: 80 }}>{t}</div>
            <div style={{ fontSize: 26, fontWeight: fresh ? 700 : 500, flex: 1 }}>{what}</div>
            <div style={{ fontSize: 22, color: C.muted }}>{who}</div>
          </div>
        );
      })}
    </div>
  );
};

// Sezione 6: la stagione, decisione → esecuzione → esito.
export const Season: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const steps: [string, string, string][] = [
    ["2 giu", "Proposto", "Peronospora vigneto: rischio alto, confidenza 0,72"],
    ["3 giu", "Fatto", "Trattamento filari 4–9, deciso dal titolare"],
    ["17 giu", "Esito", "Controllo foglie: sane. Previsione confermata"],
  ];
  return (
    <div style={{ ...card, width: 900, padding: "28px 34px" }}>
      <div style={eyebrow}>STAGIONE 2026 · VIGNETO</div>
      <div style={{ position: "relative", marginTop: 18 }}>
        <div style={{ position: "absolute", left: 13, top: 14, bottom: 14, width: 3, background: C.line }} />
        {steps.map(([d, k, v], i) => (
          <div key={k} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "14px 0", opacity: fadeIn(f, from + i * 20, 12) }}>
            <div style={{ width: 30, height: 30, borderRadius: 15, background: i === 2 ? C.ok : C.petrol, flexShrink: 0, zIndex: 1, border: `4px solid ${C.paper}` }} />
            <div>
              <div style={{ fontSize: 20, color: C.muted, fontWeight: 700 }}>{d} · {k.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Rotation: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [from + 14, from + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ ...card, width: 820, padding: "28px 34px" }}>
      <div style={eyebrow}>ROTAZIONE · ZONA 2 · PROSSIMA STAGIONE</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 22 }}>
        <div style={{ flex: 1, border: `2px solid ${C.line}`, borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ fontSize: 20, color: C.muted }}>Quest'anno</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>Pomodoro</div>
          <div style={{ fontSize: 20, color: C.muted }}>Solanacee</div>
        </div>
        <div style={{ fontSize: 44, color: C.petrol, opacity: t }}>→</div>
        <div style={{ flex: 1, border: `2px solid ${C.petrol}`, background: "#e3f1ed", borderRadius: 16, padding: "18px 20px", opacity: t }}>
          <div style={{ fontSize: 20, color: C.muted }}>Proposta</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.petrol }}>Fagiolo</div>
          <div style={{ fontSize: 20, color: C.muted }}>Leguminose</div>
        </div>
      </div>
      <div style={{ fontSize: 24, marginTop: 20, opacity: fadeIn(f, from + 40) }}>Perché: ripristina l'azoto e interrompe i patogeni delle solanacee.</div>
    </div>
  );
};

// Sezione 7: il pannello del perché, sulla scheda «Su cosa si basa».
export const Transparency: React.FC<{ from: number; confirmFrom: number; sharedFrom?: number; title?: string }> = ({ from, confirmFrom, sharedFrom, title = "Controllo peronospora · Vigneto" }) => {
  const f = useCurrentFrame();
  const tabs = ["Cosa propone", "Su cosa si basa", "Perché viene prima", "Alternative"];
  const signals: [string, boolean][] = [
    ["Meteo dei prossimi 7 giorni", true],
    ["Bagnatura fogliare", true],
    ["Fase: fioritura", true],
    ["Storico trattamenti", true],
    ["Sensore di umidità del suolo", false],
    ["Analisi del suolo", false],
  ];
  const conf = interpolate(f, [from + 50, from + 75], [0, 0.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const confirmed = f >= confirmFrom;
  return (
    <div style={{ ...card, width: 900, padding: "26px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 700 }}>{title}</div>
        {sharedFrom !== undefined && (
          <div style={{ opacity: fadeIn(f, sharedFrom, 10), background: "#e3f1ed", color: C.petrol, borderRadius: 999, padding: "8px 16px", fontSize: 18, fontWeight: 700 }}>Condiviso con il cliente</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16, borderBottom: `2px solid ${C.line}` }}>
        {tabs.map((t, i) => (
          <div key={t} style={{ fontSize: 19, fontWeight: 700, padding: "10px 12px", color: i === 1 ? C.petrol : C.muted, borderBottom: i === 1 ? `4px solid ${C.petrol}` : "4px solid transparent", marginBottom: -2 }}>{t}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginTop: 18 }}>
        {signals.map(([s, ok], i) => (
          <div key={s} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 22, opacity: fadeIn(f, from + 8 + i * 6, 8), color: ok ? C.ink : C.muted }}>
            <span style={{ width: 26, height: 26, borderRadius: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.white, background: ok ? C.ok : C.grey }}>{ok ? "✓" : "–"}</span>
            {s}{!ok && <span style={{ fontWeight: 700 }}> · manca</span>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24 }}>
        <div style={{ fontSize: 22, color: C.muted, width: 150 }}>Confidenza</div>
        <div style={{ flex: 1, height: 12, background: C.sand, borderRadius: 6 }}>
          <div style={{ width: `${conf * 100}%`, height: 12, background: C.amber, borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, width: 80, textAlign: "right" }}>{conf.toFixed(2).replace(".", ",")}</div>
      </div>
      <div style={{ marginTop: 22, background: confirmed ? C.ok : C.petrol, color: C.white, borderRadius: 14, padding: "14px 0", textAlign: "center", fontSize: 26, fontWeight: 700 }}>
        {confirmed ? "✓ Confermato dal titolare" : "Conferma"}
      </div>
    </div>
  );
};

// Video del tecnico, sezione 1: il messaggio del cliente.
export const ClientMessage: React.FC<{ from: number }> = ({ from }) => (
  <Rise from={from}>
    <div style={{ ...card, width: 600, padding: "22px 26px" }}>
      <div style={eyebrow}>AZIENDA COLLE · TITOLARE</div>
      <div style={{ marginTop: 12, background: C.white, border: `1px solid ${C.line}`, borderRadius: "18px 18px 18px 4px", padding: "16px 20px", fontSize: 28, lineHeight: 1.35 }}>
        Perché abbiamo trattato il vigneto tre settimane fa?
      </div>
      <div style={{ fontSize: 18, color: C.muted, marginTop: 8 }}>ore 18:40</div>
    </div>
  </Rise>
);

// Video del tecnico: la risposta sparsa fra cinque aziende.
export const Scattered5: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const notes: [string, string, number, number, number][] = [
    ["Azienda Colle", "Foto: macchie sulle foglie", -330, -150, -4],
    ["Azienda Piana", "Chat: «domani tratto?»", 250, -190, 3],
    ["Vivaio Sud", "Appunto: dose da ricontrollare", -420, 60, 2],
    ["Cantina Rio", "Foto: trappola, 14 catture", 300, 40, -3],
    ["Orti del Ponte", "Nota vocale, 1:12", -40, 190, 5],
  ];
  return (
    <div style={{ position: "relative", width: 1200, height: 560 }}>
      {notes.map(([who, what, x, y, r], i) => {
        const p = pop(f, from + i * 9);
        return (
          <div key={who} style={{ ...card, position: "absolute", left: 600 + x - 190, top: 280 + y - 50, width: 380, padding: "16px 20px", opacity: fadeIn(f, from + i * 9, 8), transform: `rotate(${r}deg) scale(${0.85 + 0.15 * p})` }}>
            <div style={{ ...eyebrow, fontSize: 16, color: C.petrol }}>{who.toUpperCase()}</div>
            <div style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}>{what}</div>
          </div>
        );
      })}
    </div>
  );
};

// Video del tecnico, sezione 3: le aziende seguite, ognuna con i suoi campi e la sua squadra.
export const FarmSwitcher: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const farms: [string, string, string][] = [
    ["Azienda Colle", "Orticole e vigneto · 12 ha", "4 in squadra"],
    ["Azienda Piana", "Frutteto · 8 ha", "3 in squadra"],
    ["Vivaio Sud", "Vivaio · 2 ha", "5 in squadra"],
    ["Cantina Rio", "Vigneto · 20 ha", "6 in squadra"],
    ["Orti del Ponte", "Orticole · 5 ha", "2 in squadra"],
  ];
  const sel = f >= from + 60 ? 0 : -1;
  return (
    <div style={{ ...card, width: 820, padding: "26px 30px" }}>
      <div style={eyebrow}>LE AZIENDE CHE SEGUI</div>
      {farms.map(([n, what, team], i) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 14px", marginTop: i ? 4 : 12, borderRadius: 12, opacity: fadeIn(f, from + 8 + i * 7, 10), background: sel === i ? "#e3f1ed" : "transparent", border: sel === i ? `2px solid ${C.petrol}` : "2px solid transparent" }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: C.petrol, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>{n.split(" ").slice(-1)[0][0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{n}</div>
            <div style={{ fontSize: 20, color: C.muted }}>{what}</div>
          </div>
          <div style={{ fontSize: 20, color: C.muted }}>{team}</div>
        </div>
      ))}
    </div>
  );
};

// Brevi per coltura (brief §14.1). Soglie dall'app: Ravaz 5–10 equilibrio, >10 carico eccessivo
// (vineyardBudLoadService); mosca 6–15 catture «Preparare trattamento» (OliveFlyMonitor); Jaén 2,5–3,5 «Momento ideale».

// B5: indice di Ravaz per filare, poi il consiglio sul filare 7.
export const Ravaz: React.FC<{ from: number; adviceFrom: number }> = ({ from, adviceFrom }) => {
  const f = useCurrentFrame();
  const rows: [string, string, string, string, boolean][] = [
    ["Filare 4", "6,3 kg", "0,9 kg", "7,0", true],
    ["Filare 5", "5,8 kg", "0,8 kg", "7,3", true],
    ["Filare 7", "9,9 kg", "0,8 kg", "12,4", false],
  ];
  return (
    <div style={{ ...card, width: 900, padding: "26px 32px" }}>
      <div style={eyebrow}>CARICO GEMME · INDICE DI RAVAZ</div>
      <div style={{ display: "flex", fontSize: 18, color: C.muted, fontWeight: 700, marginTop: 16, padding: "0 6px" }}>
        <div style={{ flex: 1.2 }}>FILARE</div><div style={{ flex: 1 }}>UVA</div><div style={{ flex: 1 }}>LEGNO</div><div style={{ flex: 1.6 }}>INDICE</div>
      </div>
      {rows.map(([n, uva, legno, idx, ok], i) => (
        <div key={n} style={{ display: "flex", alignItems: "center", fontSize: 26, padding: "14px 6px", borderTop: `1px solid ${C.line}`, opacity: fadeIn(f, from + 8 + i * 10, 10) }}>
          <div style={{ flex: 1.2, fontWeight: 700 }}>{n}</div>
          <div style={{ flex: 1 }}>{uva}</div>
          <div style={{ flex: 1 }}>{legno}</div>
          <div style={{ flex: 1.6, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 30 }}>{idx}</span>
            <span style={{ fontSize: 18, fontWeight: 700, borderRadius: 999, padding: "6px 12px", background: ok ? "#e3f1ed" : "#f6e3cf", color: ok ? C.ok : C.amber }}>{ok ? "Equilibrio ottimale" : "Carico eccessivo"}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 14, opacity: fadeIn(f, adviceFrom, 10), background: C.petrol, color: C.white, borderRadius: 14, padding: "16px 20px", fontSize: 24, fontWeight: 700 }}>
        Filare 7: ridurre il carico gemme · obiettivo indice 7
      </div>
    </div>
  );
};

// B6: catture della mosca olearia contro le soglie.
export const OliveFly: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const weeks: [string, number][] = [["S36", 2], ["S37", 4], ["S38", 7], ["S39", 12]];
  return (
    <div style={{ ...card, width: 860, padding: "26px 32px" }}>
      <div style={eyebrow}>MOSCA OLEARIA · TRAPPOLA 3</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginTop: 18 }}>
        <div>
          <div style={{ fontSize: 20, color: C.muted }}>Catture ultima lettura</div>
          <div style={{ fontSize: 84, fontWeight: 800, color: C.amber, lineHeight: 1 }}>12</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 120, flex: 1 }}>
          {weeks.map(([w, n], i) => (
            <div key={w} style={{ flex: 1, textAlign: "center", opacity: fadeIn(f, from + 6 + i * 8, 8) }}>
              <div style={{ height: n * 8, background: i === 3 ? C.amber : C.mint, borderRadius: 6 }} />
              <div style={{ fontSize: 16, color: C.muted, marginTop: 6 }}>{w}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 22, opacity: fadeIn(f, from + 40, 10) }}>
        <div style={{ flex: 1, background: "#f6e3cf", color: C.amber, borderRadius: 14, padding: "14px 18px", fontSize: 24, fontWeight: 800 }}>Rischio medio</div>
        <div style={{ flex: 2, background: C.petrol, color: C.white, borderRadius: 14, padding: "14px 18px", fontSize: 24, fontWeight: 700 }}>Preparare trattamento</div>
      </div>
      <div style={{ fontSize: 18, color: C.muted, marginTop: 12, opacity: fadeIn(f, from + 50, 10) }}>Soglie: fino a 5 monitoraggio · 6–15 preparare · 16–30 trattare</div>
    </div>
  );
};

// B6: maturazione con l'indice di Jaén.
export const Jaen: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [from + 10, from + 40], [0, 2.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bands: [string, number, string][] = [["Verde", 1, C.grey], ["Invaiatura", 1.5, C.mint], ["Ideale", 1, C.ok], ["Sovramatura", 3.5, C.amber]];
  return (
    <div style={{ ...card, width: 860, padding: "26px 32px" }}>
      <div style={eyebrow}>MATURAZIONE · INDICE DI JAÉN</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 14 }}>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1 }}>{t.toFixed(1).replace(".", ",")}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.ok, opacity: fadeIn(f, from + 40, 10) }}>Momento ideale per la raccolta</div>
      </div>
      <div style={{ position: "relative", display: "flex", marginTop: 26, height: 18, borderRadius: 9, overflow: "hidden" }}>
        {bands.map(([n, w, c]) => <div key={n} style={{ flex: w, background: c }} />)}
      </div>
      <div style={{ position: "relative", height: 30 }}>
        <div style={{ position: "absolute", left: `${(t / 7) * 100}%`, top: -26, width: 4, height: 34, background: C.ink, borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", fontSize: 18, color: C.muted }}>
        {bands.map(([n, w]) => <div key={n} style={{ flex: w }}>{n}</div>)}
      </div>
    </div>
  );
};

// B7: l'avviso del frutteto dopo la pioggia.
export const ScabAlert: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const chips: [string, string][] = [["PIOGGIA", "38 mm in 48 h"], ["BAGNATURA", "19 h"], ["FASE", "piena fioritura"]];
  return (
    <div style={{ ...card, width: 860, padding: "26px 32px", borderLeft: `10px solid ${C.amber}` }}>
      <div style={{ ...eyebrow, color: C.amber }}>AVVISO · FRUTTETO · MELETO NORD</div>
      <div style={{ fontSize: 36, fontWeight: 800, marginTop: 10 }}>Microclima favorevole a ticchiolatura</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        {chips.map(([k, v], i) => (
          <div key={k} style={{ opacity: fadeIn(f, from + 12 + i * 8, 8), border: `1px solid ${C.line}`, borderRadius: 999, padding: "8px 18px", fontSize: 22 }}>
            <span style={{ color: C.petrol, fontWeight: 700 }}>{k}</span> {v}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 22, color: C.muted, marginTop: 18, opacity: fadeIn(f, from + 40, 10) }}>Proposta: controllo su germogli e fiori entro 24 h</div>
    </div>
  );
};
