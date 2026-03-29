import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import { BRAND_RED, BRAND_WHITE, BRAND_DARK } from "../constants";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entra dall'alto
  const logoY = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 80 },
    durationInFrames: 40,
  });
  const logoTranslateY = interpolate(logoY, [0, 1], [-120, 0]);

  // Titolo: fade in dopo 20 frame
  const titleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [20, 50], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sottotitolo: appare dopo
  const subtitleOpacity = interpolate(frame, [45, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out alla fine (ultimi 20 frame della scena)
  const sceneEndFrame = 6 * fps;
  const fadeOut = interpolate(frame, [sceneEndFrame - 20, sceneEndFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BRAND_DARK,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: fadeOut,
      }}
    >
      {/* Particelle decorative di sfondo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${BRAND_RED}22 0%, transparent 70%)`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `translateY(${logoTranslateY}px)`,
          marginBottom: 40,
          filter: "drop-shadow(0px 8px 30px rgba(196,54,90,0.5))",
        }}
      >
        <Img
          src={staticFile("images/logo.png")}
          style={{ width: 320, height: "auto" }}
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: BRAND_WHITE,
            fontSize: 42,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            margin: 0,
            letterSpacing: 2,
          }}
        >
          Il segreto del
        </p>
        <h1
          style={{
            color: BRAND_RED,
            fontSize: 96,
            fontFamily: "Impact, Arial Black, sans-serif",
            margin: "8px 0",
            letterSpacing: 6,
            textTransform: "uppercase",
            textShadow: `0 0 40px ${BRAND_RED}88`,
          }}
        >
          PICCANTINO
        </h1>
      </div>

      {/* Luogo */}
      <div
        style={{
          opacity: subtitleOpacity,
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ width: 60, height: 2, backgroundColor: BRAND_RED }} />
        <p
          style={{
            color: BRAND_WHITE,
            fontSize: 28,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            margin: 0,
            letterSpacing: 4,
            opacity: 0.85,
          }}
        >
          Pisticci · Basilicata
        </p>
        <div style={{ width: 60, height: 2, backgroundColor: BRAND_RED }} />
      </div>
    </AbsoluteFill>
  );
};
