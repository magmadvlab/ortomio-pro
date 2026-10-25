import { continueRender, delayRender, interpolate, spring, staticFile } from "remotion";
import { useEffect, useState } from "react";

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Verde petrolio del logo e della landing (ortomio-green), accento dorato «harvest», carta chiara.
export const C = {
  petrol: "#12786d",
  petrolDark: "#0f3d36",
  night: "#0b2a26",
  mint: "#9fd3c7",
  paper: "#f6f3ec",
  sand: "#e8e1d3",
  gold: "#c9a24a",
  ink: "#17201e",
  muted: "#6b7a76",
  line: "#d6dcda",
  ok: "#2f8a55",
  amber: "#d9902a",
  grey: "#a7b1ae",
  white: "#ffffff",
};

export const SANS = "Inter, Arial, sans-serif";
export const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

export const useInter = () => {
  const [handle] = useState(() => delayRender("Inter"));
  useEffect(() => {
    const font = new FontFace("Inter", `url(${staticFile("fonts/InterVariable.woff2")})`, { weight: "100 900" });
    font.load().then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    });
  }, [handle]);
};

export const fadeIn = (frame: number, start: number, length = 15) =>
  interpolate(frame, [start, start + length], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const pop = (frame: number, start: number) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 14, stiffness: 120 } });

export const sec = (s: number) => Math.round(s * FPS);
