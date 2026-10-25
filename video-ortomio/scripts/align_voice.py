"""Aggancia le frasi del copione alla ripresa di Adriatico.

Input:  public/audio/adriatico/take-v2.mp3 e out/voce/take-v2-words.json, prodotto da
        whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-small.bin -l it -f out/voce/take-v2.wav -ml 1 -oj -of out/voce/take-v2-words
Output: src/ortomio/timings.json con inizio e fine di ogni frase in secondi, nell'ordine di narration.ts.

Whisper sul file intero scrive «Orto mio» e perde qualche parola («Anche non inter-», «Dalla»):
ogni frase si cerca per il pezzo più lungo in comune, poi i confini vanno sul silenzio vero.
"""

import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# Senza argomenti: la ripresa del titolare. Con «tecnico» o «coltura»: le frasi nuove del video del tecnico
# o dei brevi per coltura (narrazione-*.txt, un paragrafo per frase).
TEXTS = {"tecnico": "narrazione-tecnico-v1.txt", "coltura": "narrazione-brevi-coltura-v1.txt"}
MODE = sys.argv[1] if len(sys.argv) > 1 else None
NAME = MODE or "take-v2"
WORDS = ROOT / "out" / "voce" / f"{NAME}-words.json"
AUDIO = ROOT / "public" / "audio" / "adriatico" / f"{NAME}.mp3"
OUT = ROOT / "src" / "ortomio" / (f"timings-{MODE}.json" if MODE else "timings.json")


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9àèéìòù]", "", text.lower().replace("’", "'"))


if MODE:
    sentences = [p.strip() for p in (ROOT / TEXTS[MODE]).read_text().split("\n\n") if p.strip()]
else:
    body = (ROOT / "src" / "ortomio" / "narration.ts").read_text().split("export const SECTIONS")[1].split("];\n\nconst")[0]
    sentences = re.findall(r'"([^"]+)"', body)

tokens = json.loads(WORDS.read_text())["transcription"]
chars, times = [], []
for tok in tokens:
    for ch in norm(tok["text"]):
        chars.append(ch)
        times.append((tok["offsets"]["from"] / 1000, tok["offsets"]["to"] / 1000))
spoken = "".join(chars)

result, pos = [], 0
for s in sentences:
    target = norm(s)
    window = spoken[pos : pos + 400]
    m = difflib.SequenceMatcher(None, window, target, autojunk=False).find_longest_match(0, len(window), 0, len(target))
    if m.size < 6:
        sys.exit(f"non trovata: {s}")
    start_idx = max(pos, pos + m.a - m.b)
    end_idx = min(len(spoken) - 1, start_idx + len(target) - 1)
    result.append({"text": s, "start": times[start_idx][0], "end": times[end_idx][1]})
    pos = start_idx + int(len(target) * 0.8)

result[-1]["end"] = times[-1][1]

log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(AUDIO), "-af", "silencedetect=n=-38dB:d=0.08", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
edges = [float(x) for x in re.findall(r"silence_(?:start|end): ([0-9.]+)", log)]
silences = list(zip(edges[::2], edges[1::2]))

# Ogni confine fra due frasi va sul silenzio più lungo vicino al confine stimato.
for a, b in zip(result, result[1:]):
    lo, hi = min(a["end"], b["start"]) - 0.6, max(a["end"], b["start"]) + 0.6
    near = [s for s in silences if s[1] > lo and s[0] < hi]
    if not near:
        sys.exit(f"nessun silenzio fra: {a['text'][:40]} | {b['text'][:40]}")
    s0, s1 = max(near, key=lambda s: s[1] - s[0])
    a["end"], b["start"] = s0, s1
# L'ultima frase finisce dove inizia il silenzio finale.
tail = [s for s in silences if s[0] > result[-1]["start"]]
if tail:
    result[-1]["end"] = tail[-1][0]

for r in result:
    r["start"], r["end"] = round(r["start"], 2), round(r["end"], 2)
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1))
for r in result:
    print(f"{r['start']:6.2f} {r['end']:6.2f}  {r['text'][:60]}")
print(f"{len(result)}/{len(sentences)} frasi → {OUT.relative_to(ROOT)}")
