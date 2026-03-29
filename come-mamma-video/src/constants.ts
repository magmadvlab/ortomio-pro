// ============================================================
// COSTANTI VIDEO - Come Mamma L'ha Fatto / Piccantino
// ============================================================

export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;

// ⚠️ MODIFICA QUESTO VALORE con la durata reale del tuo audio in secondi
// Ascolta il file WAV e inserisci la durata qui
export const AUDIO_DURATION_SECONDS = 180; // es. 180 = 3 minuti

export const DURATION_IN_FRAMES = AUDIO_DURATION_SECONDS * VIDEO_FPS;

// Colori del brand
export const BRAND_RED = "#C4365A";
export const BRAND_WHITE = "#FFFFFF";
export const BRAND_DARK = "#1a0a0f";
export const BRAND_WARM = "#2a1015";

// ============================================================
// TIMING SCENE (in secondi dall'inizio)
// Adatta questi valori alla tua narrazione!
// ============================================================
export const SCENE_TIMING = {
  // Intro: logo + titolo
  intro_start: 0,
  intro_end: 6,

  // Prima scena: immagine del camino, tutti i vasetti
  fireplace_start: 6,
  fireplace_end: 25,

  // Seconda scena: prodotti singoli in sequenza
  products_start: 25,
  products_end: 90,

  // Terza scena: storia del brand / territorio
  story_start: 90,
  story_end: 155,

  // Outro: logo + call to action
  outro_start: 155,
  outro_end: AUDIO_DURATION_SECONDS,
};

// Prodotti da mostrare (in ordine)
export const PRODUCTS = [
  {
    image: "piccantino-classico.jpg",
    name: "Piccantino Classico",
    tagline: "Il sapore originale",
  },
  {
    image: "piccantino-pomodori-secchi-olive.jpg",
    name: "Piccantino Pomodori Secchi e Olive",
    tagline: "Intenso e aromatico",
  },
  {
    image: "piccantino-pomodori-secchi.jpg",
    name: "Piccantino Pomodori Secchi",
    tagline: "Il sole della Basilicata",
  },
  {
    image: "piccantino-olive.jpg",
    name: "Piccantino alle Olive",
    tagline: "Morbido e avvolgente",
  },
  {
    image: "piccantino-tonno.jpg",
    name: "Piccantino al Tonno",
    tagline: "Mare e terra insieme",
  },
  {
    image: "piccantino-funghi.jpg",
    name: "Piccantino ai Funghi",
    tagline: "Il profumo del bosco",
  },
];
