import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error("Uso: node --env-file=.env.local scripts/generate_voice.mjs <testo.txt> <output.mp3>");
  process.exit(1);
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY non trovata. Esegui il comando con --env-file=.env.local.");
  process.exit(1);
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
const text = (await readFile(inputPath, "utf8")).trim();

if (!text) {
  console.error(`Il file ${inputPath} è vuoto.`);
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });

const client = new ElevenLabsClient();
const audio = await client.textToSpeech.convert("covxL85MSd0uUrktE45z", {
  text,
  modelId: "eleven_v4",
  languageCode: "it",
  outputFormat: "mp3_44100_128",
  applyTextNormalization: "on",
  voiceSettings: {
    stability: 0.7,
    similarityBoost: 0.65,
  },
});

const destination = createWriteStream(outputPath);
Readable.fromWeb(audio).pipe(destination);
await finished(destination);

console.log(`Voce generata: ${outputPath}`);
