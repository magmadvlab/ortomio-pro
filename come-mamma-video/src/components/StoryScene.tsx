import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Img,
  staticFile,
} from "remotion";
import { BRAND_RED, BRAND_WHITE } from "../constants";

interface StorySceneProps {
  startFrame: number;
  endFrame: number;
}

export const StoryScene: React.FC<StorySceneProps> = ({
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  if (localFrame < 0 || localFrame > duration) return null;

  // Fade globale
  const fadeIn = interpolate(localFrame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(localFrame, [duration - 20, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Leggero Ken Burns sull'immagine di sfondo (prodotto singolo sfocato)
  const bgScale = interpolate(localFrame, [0, duration], [1.08, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Il testo scorre leggermente verso l'alto
  const textY = interpolate(localFrame, [0, duration], [0, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Immagine di sfondo sfocata */}
      <Img
        src={staticFile("images/fireplace-group.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${bgScale})`,
          filter: "blur(8px) brightness(0.3)",
        }}
      />

      {/* Overlay scuro */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(10,0,5,0.6)",
        }}
      />

      {/* Contenuto */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${textY}px)`,
          padding: "0 200px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 1200 }}>
          {/* Icona / divisore */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginBottom: 48,
            }}
          >
            <div
              style={{ width: 100, height: 2, backgroundColor: BRAND_RED, opacity: 0.8 }}
            />
            <Img
              src={staticFile("images/logo.png")}
              style={{ width: 80, height: "auto", opacity: 0.9 }}
            />
            <div
              style={{ width: 100, height: 2, backgroundColor: BRAND_RED, opacity: 0.8 }}
            />
          </div>

          {/* Titolo storia */}
          <h2
            style={{
              color: BRAND_RED,
              fontSize: 52,
              fontFamily: "Impact, Arial Black, sans-serif",
              textTransform: "uppercase",
              letterSpacing: 4,
              margin: "0 0 32px",
            }}
          >
            Una storia di famiglia
          </h2>

          {/* Testo narrativo */}
          <p
            style={{
              color: BRAND_WHITE,
              fontSize: 34,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              lineHeight: 1.7,
              margin: "0 0 40px",
              opacity: 0.92,
            }}
          >
            Tra i calanchi lucani di Pisticci, Mamma Enza ha custodito per
            generazioni la ricetta del Piccantino. Un condimento artigianale
            fatto con ingredienti scelti, lavorati a mano con amore e rispetto
            per la tradizione.
          </p>

          {/* Tagline */}
          <p
            style={{
              color: BRAND_RED,
              fontSize: 36,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              margin: 0,
              letterSpacing: 1,
            }}
          >
            "Come Mamma L'ha Fatto"
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
