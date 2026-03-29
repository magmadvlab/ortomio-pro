import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
} from "remotion";
import { BRAND_RED, BRAND_WHITE } from "../constants";

interface FireplaceSceneProps {
  startFrame: number;
  endFrame: number;
}

export const FireplaceScene: React.FC<FireplaceSceneProps> = ({
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  // Fade in
  const fadeIn = interpolate(localFrame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(localFrame, [duration - 20, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = Math.min(fadeIn, fadeOut);

  // Leggero zoom lento sull'immagine (effetto Ken Burns)
  const scale = interpolate(localFrame, [0, duration], [1.05, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Testo appare dopo 30 frame
  const textOpacity = interpolate(localFrame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(localFrame, [30, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Immagine del camino con tutti i vasetti */}
      <Img
        src={staticFile("images/fireplace-group.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      />

      {/* Overlay gradiente scuro in basso */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
        }}
      />

      {/* Testo sovrapposto */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          padding: "0 120px",
        }}
      >
        <p
          style={{
            color: BRAND_WHITE,
            fontSize: 38,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            margin: 0,
            lineHeight: 1.5,
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          "Una ricetta di famiglia nata tra i calanchi di Pisticci,
          <br />
          portata avanti con passione da Mamma Enza"
        </p>
        <div
          style={{
            width: 80,
            height: 3,
            backgroundColor: BRAND_RED,
            margin: "24px auto 0",
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
