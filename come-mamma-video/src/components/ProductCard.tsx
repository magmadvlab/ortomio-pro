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

interface ProductCardProps {
  image: string;
  name: string;
  tagline: string;
  startFrame: number;
  endFrame: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  tagline,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  if (localFrame < 0 || localFrame > duration) return null;

  // Fade in/out
  const fadeIn = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(localFrame, [duration - 15, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Vasetto entra con spring
  const jarSpring = spring({
    fps,
    frame: localFrame,
    config: { damping: 16, stiffness: 70, mass: 1.2 },
    durationInFrames: 45,
  });
  const jarScale = interpolate(jarSpring, [0, 1], [0.6, 1]);
  const jarY = interpolate(jarSpring, [0, 1], [80, 0]);

  // Nome prodotto slide in da sinistra
  const textX = interpolate(localFrame, [20, 45], [-80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textOpacity = interpolate(localFrame, [20, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: BRAND_DARK,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
        padding: "0 120px",
      }}
    >
      {/* Sfondo decorativo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 65% 50%, ${BRAND_RED}18 0%, transparent 65%)`,
        }}
      />

      {/* Linea decorativa sinistra */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: BRAND_RED,
        }}
      />

      {/* Immagine del vasetto */}
      <div
        style={{
          transform: `scale(${jarScale}) translateY(${jarY}px)`,
          filter: "drop-shadow(0px 20px 50px rgba(0,0,0,0.6))",
          flex: "0 0 auto",
        }}
      >
        <Img
          src={staticFile(`images/${image}`)}
          style={{
            height: 680,
            width: "auto",
            borderRadius: 8,
          }}
        />
      </div>

      {/* Testo */}
      <div
        style={{
          flex: 1,
          opacity: textOpacity,
          transform: `translateX(${textX}px)`,
        }}
      >
        {/* Badge 100% naturale */}
        <div
          style={{
            display: "inline-block",
            backgroundColor: BRAND_RED,
            color: BRAND_WHITE,
            padding: "6px 20px",
            borderRadius: 30,
            fontSize: 20,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            letterSpacing: 2,
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          100% Naturale
        </div>

        {/* Nome prodotto */}
        <h2
          style={{
            color: BRAND_WHITE,
            fontSize: 64,
            fontFamily: "Impact, Arial Black, sans-serif",
            margin: "0 0 16px",
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {name}
        </h2>

        {/* Tagline */}
        <p
          style={{
            color: BRAND_RED,
            fontSize: 34,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            margin: "0 0 32px",
          }}
        >
          {tagline}
        </p>

        {/* Separatore */}
        <div
          style={{
            width: 80,
            height: 3,
            backgroundColor: BRAND_RED,
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Uso consigliato */}
        <p
          style={{
            color: BRAND_WHITE,
            fontSize: 24,
            fontFamily: "Georgia, serif",
            opacity: 0.7,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Condimento per pane, pizza, pasta,
          <br />
          carni e formaggi
        </p>
      </div>
    </AbsoluteFill>
  );
};
