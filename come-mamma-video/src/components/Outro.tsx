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

interface OutroProps {
  startFrame: number;
  endFrame: number;
}

export const Outro: React.FC<OutroProps> = ({ startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  if (localFrame < 0 || localFrame > duration) return null;

  // Fade in
  const fadeIn = interpolate(localFrame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Fade out finale
  const fadeOut = interpolate(localFrame, [duration - 30, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  // Logo spring
  const logoSpring = spring({
    fps,
    frame: localFrame,
    config: { damping: 14, stiffness: 60 },
    durationInFrames: 50,
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);

  // CTA appare più tardi
  const ctaOpacity = interpolate(localFrame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(localFrame, [50, 80], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Social appare ancora dopo
  const socialOpacity = interpolate(localFrame, [75, 100], [0, 1], {
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
        opacity,
      }}
    >
      {/* Sfondo radiale */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${BRAND_RED}22 0%, transparent 70%)`,
        }}
      />

      {/* Logo grande */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 48,
          filter: "drop-shadow(0px 12px 40px rgba(196,54,90,0.5))",
        }}
      >
        <Img
          src={staticFile("images/logo.png")}
          style={{ width: 380, height: "auto" }}
        />
      </div>

      {/* Slogan */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: "center",
          marginBottom: 56,
        }}
      >
        <h2
          style={{
            color: BRAND_WHITE,
            fontSize: 52,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            margin: "0 0 12px",
            letterSpacing: 1,
          }}
        >
          Il gusto autentico della Basilicata
        </h2>
        <p
          style={{
            color: BRAND_RED,
            fontSize: 32,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          100% Naturale · Artigianale · Fatto con amore
        </p>
      </div>

      {/* Separatore */}
      <div
        style={{
          width: 100,
          height: 3,
          backgroundColor: BRAND_RED,
          marginBottom: 40,
          opacity: ctaOpacity,
          borderRadius: 2,
        }}
      />

      {/* Social / contatti */}
      <div
        style={{
          opacity: socialOpacity,
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: BRAND_WHITE,
            fontSize: 26,
            fontFamily: "Arial, sans-serif",
            margin: "0 0 8px",
            opacity: 0.7,
            letterSpacing: 2,
          }}
        >
          Seguici su
        </p>
        <p
          style={{
            color: BRAND_RED,
            fontSize: 32,
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            margin: 0,
            letterSpacing: 1,
          }}
        >
          @COMEmammaLHAFATTO
        </p>
      </div>
    </AbsoluteFill>
  );
};
