import React from "react";
import { AbsoluteFill, Audio, staticFile, useVideoConfig } from "remotion";
import {
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  VIDEO_FPS,
  DURATION_IN_FRAMES,
  SCENE_TIMING,
  PRODUCTS,
} from "./constants";
import { Intro } from "./components/Intro";
import { FireplaceScene } from "./components/FireplaceScene";
import { ProductCard } from "./components/ProductCard";
import { StoryScene } from "./components/StoryScene";
import { Outro } from "./components/Outro";

export { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS, DURATION_IN_FRAMES };

// Calcola quanti frame dura ogni prodotto nella sezione prodotti
const productsStartFrame = SCENE_TIMING.products_start * VIDEO_FPS;
const productsEndFrame = SCENE_TIMING.products_end * VIDEO_FPS;
const framesPerProduct = Math.floor(
  (productsEndFrame - productsStartFrame) / PRODUCTS.length
);

export const PicantinoStory: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0a0f" }}>

      {/* ── AUDIO NARRAZIONE ──────────────────────────────────── */}
      {/* Decommentare quando hai copiato il file WAV in public/audio/narrazione.wav */}
      {/* <Audio src={staticFile("audio/narrazione.wav")} /> */}

      {/* ── INTRO (0 → 6s) ────────────────────────────────────── */}
      {(() => {
        const start = SCENE_TIMING.intro_start * VIDEO_FPS;
        const end = SCENE_TIMING.intro_end * VIDEO_FPS;
        return (
          <FrameRange from={start} to={end}>
            <Intro />
          </FrameRange>
        );
      })()}

      {/* ── SCENA CAMINO (6s → 25s) ────────────────────────────── */}
      {(() => {
        const start = SCENE_TIMING.fireplace_start * VIDEO_FPS;
        const end = SCENE_TIMING.fireplace_end * VIDEO_FPS;
        return (
          <FrameRange from={start} to={end}>
            <FireplaceScene startFrame={start} endFrame={end} />
          </FrameRange>
        );
      })()}

      {/* ── PRODOTTI (25s → 90s) ──────────────────────────────── */}
      {PRODUCTS.map((product, i) => {
        const start = productsStartFrame + i * framesPerProduct;
        const end = start + framesPerProduct;
        return (
          <FrameRange key={product.name} from={start} to={end}>
            <ProductCard
              image={product.image}
              name={product.name}
              tagline={product.tagline}
              startFrame={start}
              endFrame={end}
            />
          </FrameRange>
        );
      })}

      {/* ── STORIA / TERRITORIO (90s → 155s) ─────────────────── */}
      {(() => {
        const start = SCENE_TIMING.story_start * VIDEO_FPS;
        const end = SCENE_TIMING.story_end * VIDEO_FPS;
        return (
          <FrameRange from={start} to={end}>
            <StoryScene startFrame={start} endFrame={end} />
          </FrameRange>
        );
      })()}

      {/* ── OUTRO (155s → fine) ───────────────────────────────── */}
      {(() => {
        const start = SCENE_TIMING.outro_start * VIDEO_FPS;
        const end = SCENE_TIMING.outro_end * VIDEO_FPS;
        return (
          <FrameRange from={start} to={end}>
            <Outro startFrame={start} endFrame={end} />
          </FrameRange>
        );
      })()}
    </AbsoluteFill>
  );
};

// Helper: mostra i children solo nell'intervallo di frame indicato
const FrameRange: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({ from, to, children }) => {
  const { durationInFrames } = useVideoConfig();
  const safeFrom = Math.max(0, from);
  const safeTo = Math.min(durationInFrames, to);
  if (safeFrom >= safeTo) return null;

  // Usa un wrapper con visibilità condizionale basata sul frame corrente
  // (i singoli componenti gestiscono già la loro visibilità tramite opacity)
  return <>{children}</>;
};
