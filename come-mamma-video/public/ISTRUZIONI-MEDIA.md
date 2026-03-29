# 📁 Copia qui i tuoi file media

## 🔊 Audio (narrazione)

Copia il tuo file WAV qui dentro e rinominalo:

```
public/audio/narrazione.wav
```

Il file è: `Pisticci, Fede e Calanchi - Il Segreto del Piccantino tra Stor (1)-esv2-90p-bg-10p.wav`

⚠️ IMPORTANTE: dopo aver copiato il file, misura la sua durata in secondi
e aggiorna `AUDIO_DURATION_SECONDS` in `src/constants.ts`.

---

## 🖼️ Immagini

Copia le immagini dei prodotti qui dentro con questi nomi esatti:

| File da copiare               | Rinominare in                           |
|-------------------------------|-----------------------------------------|
| logo.png                      | `images/logo.png`                       |
| foto camino con tutti i vasetti | `images/fireplace-group.jpg`          |
| Piccantino Classico           | `images/piccantino-classico.jpg`        |
| Piccantino Pomodori Secchi e Olive | `images/piccantino-pomodori-secchi-olive.jpg` |
| Piccantino Pomodori Secchi    | `images/piccantino-pomodori-secchi.jpg` |
| Piccantino Alle Olive         | `images/piccantino-olive.jpg`           |
| Piccantino al Tonno           | `images/piccantino-tonno.jpg`           |
| Piccantino ai Funghi          | `images/piccantino-funghi.jpg`          |

---

## ▶️ Come avviare il progetto

1. Apri un terminale in questa cartella (`come-mamma-video`)
2. Lancia il server di anteprima:
   ```bash
   npm start
   ```
3. Apri il browser su `http://localhost:3000`
4. Vedrai l'anteprima live del video!

## 🎬 Come esportare il video MP4

```bash
npm run build
```

Il video verrà salvato in `out/piccantino-story.mp4`

---

## ⚙️ Personalizzare il timing

Se la narrazione è diversa da 3 minuti, modifica `src/constants.ts`:

```ts
export const AUDIO_DURATION_SECONDS = 180; // ← cambia questo numero
```

Poi aggiusta i valori `SCENE_TIMING` per sincronizzare le scene
con i momenti giusti della narrazione.
